# Sim2Real 部署实践指南

## 概述

Sim2Real（仿真到真实）部署是将在仿真环境中训练的策略迁移到真实物理系统的过程。由于仿真与现实之间存在不可避免的差异（Reality Gap），需要系统性的方法来确保策略在真实环境中稳定运行。

本文聚焦于 Sim2Real 部署的工程实践，涵盖部署前检查、域随机化配置、系统辨识、真实世界微调以及常见失败模式的排查。

---

## 部署前检查清单

在将仿真策略部署到真实机器人之前，务必完成以下检查：

### 硬件就绪

- [ ] 机器人关节零位校准完成
- [ ] 传感器数据采集正常（IMU、力矩传感器、编码器）
- [ ] 急停按钮功能测试通过
- [ ] 通信延迟测量并记录（控制器到执行器）
- [ ] 电源系统稳定性验证

### 软件就绪

- [ ] 控制频率匹配仿真设定（通常 ≥500Hz）
- [ ] 观测空间与仿真一致（维度、归一化范围）
- [ ] 动作空间映射正确（关节角度/力矩范围）
- [ ] 安全限位已配置（关节极限、速度上限、力矩饱和）
- [ ] 数据记录管道已就绪

### 策略验证

- [ ] 仿真中 zero-shot 成功率 ≥ 90%
- [ ] 域随机化范围覆盖真实参数区间
- [ ] 策略在仿真极端参数下仍保持稳定
- [ ] 推理延迟满足实时性要求（< 控制周期）

---

## 域随机化参数范围

域随机化（Domain Randomization）是弥合 Sim2Real Gap 的核心技术。以下是各类参数的推荐随机化范围：

### 物理参数随机化

| 参数类别 | 参数名称 | 默认值 | 随机化范围 | 分布类型 |
|---------|---------|-------|-----------|---------|
| **摩擦** | 地面摩擦系数 | 1.0 | 0.5 - 2.0 | 均匀分布 |
| **摩擦** | 关节摩擦 | 0.01 | 0.005 - 0.05 | 对数均匀 |
| **质量** | 连杆质量 | 标称值 | ±20% | 均匀分布 |
| **质量** | 负载质量 | 0 kg | 0 - 5 kg | 均匀分布 |
| **惯量** | 连杆转动惯量 | 标称值 | ±30% | 均匀分布 |
| **几何** | 质心偏移 | 0 | ±2 cm | 高斯分布 |
| **几何** | 连杆长度 | 标称值 | ±5% | 高斯分布 |
| **弹性** | 恢复系数 | 0.5 | 0.1 - 0.9 | 均匀分布 |
| **阻尼** | 关节阻尼 | 标称值 | ±50% | 均匀分布 |

### 传感器与执行器随机化

| 参数类别 | 参数名称 | 随机化范围 | 说明 |
|---------|---------|-----------|------|
| **延迟** | 观测延迟 | 0 - 40 ms | 模拟传感器和通信延迟 |
| **延迟** | 动作延迟 | 0 - 20 ms | 模拟执行器响应延迟 |
| **噪声** | IMU加速度噪声 | ±0.05 m/s² | 高斯白噪声 |
| **噪声** | IMU陀螺仪噪声 | ±0.01 rad/s | 高斯白噪声 |
| **噪声** | 关节编码器噪声 | ±0.001 rad | 量化噪声 |
| **噪声** | 力矩传感器噪声 | ±2% | 高斯白噪声 |
| **偏置** | 传感器偏置 | ±5% | 恒定偏置 + 缓慢漂移 |
| **增益** | 电机增益误差 | ±10% | 模拟电机特性差异 |

### 环境参数随机化

| 参数类别 | 参数名称 | 随机化范围 |
|---------|---------|-----------|
| **地形** | 地面高度偏移 | ±3 cm |
| **地形** | 地面倾斜角 | ±5° |
| **光照** | 光照强度 | 50 - 500 lux |
| **光照** | 光照方向 | 全方位随机 |
| **物体** | 目标物体尺寸 | ±15% |
| **物体** | 物体纹理 | 随机颜色/纹理 |

---

## 系统辨识工作流

系统辨识（System Identification）通过真实数据估计物理参数，缩小 Sim2Real Gap。

### 辨识流程

<!-- SVG-DESIGN-NOTES
Type: C (算法过程 — 系统辨识迭代：sim 轨迹逐步逼近 real 轨迹 small multiples)
Q0 (One Big Idea): 系统辨识是个最小化循环——固定一条激励轨迹，反复优化仿真物理参数让 sim 输出曲线逐步贴合 real 实测曲线，RMSE 单调下降直到收敛 (<1°)
Q1 (几何映射): 3 个并排 panel small multiples (iter 0 / iter k / 收敛)，每个 panel 画同一段关节轨迹的 real 实线 vs sim 虚线，初始两线分离、末态几乎重合；下方 RMSE 衰减曲线贯穿三 panel
Q2 (DNA): 去掉标题——"real 实线 vs sim 虚线由分离到重合 + RMSE 单调下降"是 system identification 的视觉指纹，与流程方框图完全不同
Q3 (装饰删除): 删掉原 10 个等大流程方框 + 8 条交叉箭头(流程图不承载"误差迭代收敛"这一核心过程命题)；不用图例，real/sim 直接标在曲线旁
Q4 (直接标注): real/sim 曲线名直接标在线端；每 panel 下标 iter 号与该轮 RMSE；收敛阈 RMSE<1° 标在衰减曲线上
Q5 (Dark + 双语): 全 var(--dia-*)；real accent 实线、sim blue 虚线、RMSE 曲线 green；中文标签英文版替换
-->
<div class="diagram">
<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="系统辨识迭代：仿真轨迹逐步逼近真实轨迹">
  <text x="380" y="24" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="16" fill="var(--dia-stroke)">系统辨识 — 优化物理参数使 sim 轨迹逼近 real（RMSE 收敛）</text>

  <!-- 3 panels, each 230 wide, plotting joint angle q(t) over an excitation trajectory -->
  <!-- Panel 1: iter 0 (params off, big gap) -->
  <text x="135" y="52" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">iter 0 · RMSE 8.2°</text>
  <line x1="40" y1="190" x2="240" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="40" y1="70" x2="40" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 45 150 C 80 90 110 175 145 100 S 200 80 235 130" stroke="var(--dia-accent)" stroke-width="2" fill="none"/>
  <path d="M 45 175 C 85 150 115 110 150 165 S 205 150 235 95" stroke="var(--dia-blue)" stroke-width="1.8" fill="none" stroke-dasharray="5 3"/>
  <text x="232" y="146" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-accent)">real</text>
  <text x="232" y="88" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-blue)">sim</text>

  <!-- Panel 2: iter k (closer) -->
  <text x="385" y="52" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">iter k · RMSE 2.4°</text>
  <line x1="290" y1="190" x2="490" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="290" y1="70" x2="290" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 295 150 C 330 90 360 175 395 100 S 450 80 485 130" stroke="var(--dia-accent)" stroke-width="2" fill="none"/>
  <path d="M 295 156 C 332 98 362 168 397 108 S 451 88 485 124" stroke="var(--dia-blue)" stroke-width="1.8" fill="none" stroke-dasharray="5 3"/>

  <!-- Panel 3: converged (overlap) -->
  <text x="635" y="52" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-green)">收敛 · RMSE 0.7° &lt; 1°</text>
  <line x1="540" y1="190" x2="740" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="540" y1="70" x2="540" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 545 150 C 580 90 610 175 645 100 S 700 80 735 130" stroke="var(--dia-accent)" stroke-width="2.4" fill="none"/>
  <path d="M 545 151 C 580 91 610 174 645 101 S 700 81 735 129" stroke="var(--dia-blue)" stroke-width="1.6" fill="none" stroke-dasharray="4 3"/>

  <!-- RMSE decay curve spanning bottom -->
  <line x1="40" y1="300" x2="740" y2="300" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 60 230 C 200 250 320 285 460 294 S 660 298 720 299" stroke="var(--dia-green)" stroke-width="2" fill="none"/>
  <circle cx="60" cy="230" r="3" fill="var(--dia-green)"/><circle cx="385" cy="280" r="3" fill="var(--dia-green)"/><circle cx="700" cy="298" r="3" fill="var(--dia-green)"/>
  <text x="60" y="222" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">RMSE 跟踪误差随辨识迭代单调下降 → 收敛阈 &lt;1°</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 系统辨识是一个误差最小化迭代：用同一条激励轨迹，反复优化仿真物理参数，让仿真输出（蓝虚线）逐步贴合真实实测（橙实线）。从 iter 0 的明显分离到收敛时几乎重合，关节跟踪 RMSE 单调下降至 <1° 即认为参数辨识完成。</p>


### 关键步骤

**1. 激励轨迹设计**

使用频率扫描信号或优化的傅里叶级数轨迹，确保覆盖目标频率范围：

$$q_d(t) = q_0 + \sum_{k=1}^{N} \frac{a_k}{k\omega} \sin(k\omega t) - \frac{b_k}{k\omega} \cos(k\omega t)$$

**2. 参数优化方法**

常用方法包括：

- **最小二乘法**：适用于线性参数化模型
- **贝叶斯优化**：适用于高维参数空间
- **CMA-ES**：进化策略，适用于非凸优化
- **神经网络辨识**：数据驱动方法，适用于复杂动力学

**3. 验证指标**

- 关节轨迹跟踪误差 RMSE < 1°
- 力矩预测误差 < 10%
- 频率响应匹配度（Bode 图比较）

---

## 真实世界微调

### 残差策略学习 (Residual Policy Learning)

在基础策略 $\pi_{base}$ 上叠加残差策略 $\pi_{res}$，用少量真实数据微调：

$$a_t = \pi_{base}(o_t) + \alpha \cdot \pi_{res}(o_t)$$

其中 $\alpha$ 为残差权重，初始设为较小值（0.1），逐步增大。

**实施要点**：

- 固定基础策略参数，仅训练残差网络
- 残差动作范围限制在基础动作的 ±20% 以内
- 使用安全约束确保不超出安全边界

### 在线适应 (Online Adaptation)

**隐式适应**：通过历史观测序列推断环境参数

$$z_t = f_{encoder}(o_{t-H:t}, a_{t-H:t-1})$$
$$a_t = \pi(o_t, z_t)$$

**显式适应**：在线更新模型参数

- RMA (Rapid Motor Adaptation)：使用适应模块预测环境因子
- 测试时训练（Test-Time Training）：在线微调部分网络层

### 少样本微调

- 收集 10-50 条真实演示轨迹
- 使用 DAgger 或在线模仿学习进行微调
- 学习率设为预训练的 1/10 至 1/100

---

## 域随机化宽度的甜点：Sim2Real 部署的核心权衡

整个 Sim2Real 部署工作流（任务设计 → 域随机化训练 → 系统辨识校准 → 低速安全测试 → 渐进提速 → 全速部署）背后，最关键的可调旋钮是**域随机化的宽度**。它对真实成功率的影响不是单调的，而是一条**倒 U 曲线**：随机化太窄，策略在仿真里成功率虚高却过拟合仿真、real 一落千丈；太宽，策略被迫学一个对所有极端都保守的"折中策略"，sim/real 都平庸。最优在中间——恰好覆盖真实物理不确定性、不过度的那个宽度（前文 DR 参数表给出的范围正是经验甜点）。

<!-- SVG-DESIGN-NOTES
Type: B (几何 / 数学直观 — 域随机化宽度 vs 真实成功率的倒 U 曲线)
Q0 (One Big Idea): 真实成功率关于域随机化宽度是倒 U——太窄过拟合仿真(sim 高 real 崩)，太宽欠拟合(均平庸)，存在一个覆盖真实不确定性而不过度的最优宽度；这是整个 Sim2Real 流程的核心可调旋钮
Q1 (几何映射): X=域随机化宽度(窄→宽)，Y=成功率；两条真曲线——sim 成功率(随宽度单调降，过拟合时虚高)与 real 成功率(倒 U)，二者交点附近即甜点；real 曲线峰值用 circle 强调
Q2 (DNA): 去掉标题——一条倒 U 的 real 曲线 + 一条单调下降的 sim 曲线交叉，是 DR robustness trade-off 的视觉指纹，与原越界(viewBox 900 内容到 1790)的流程方框图完全不同
Q3 (装饰删除): 删掉原 viewBox 溢出的 11 个等大流程方框 + 10 箭头(部署流程已用一句话承载，不承载"DR 宽度甜点"这一核心几何命题)；不用图例，sim/real 直接标曲线旁
Q4 (直接标注): sim/real 曲线名标在线端；最优宽度处标"甜点 (DR 参数表经验范围)"；两端标"过拟合仿真 / 欠拟合保守"
Q5 (Dark + 双语): 全 var(--dia-*)；real 曲线 accent、sim 曲线 blue、甜点区 green 淡填；中文标签英文版替换
-->
<div class="diagram">
<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="域随机化宽度与真实成功率的倒U权衡曲线">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">域随机化宽度 → 成功率（real 倒 U，存在甜点）</text>

  <!-- axes -->
  <line x1="90" y1="60" x2="90" y2="310" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="90" y1="310" x2="650" y2="310" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="84" y="68" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">100%</text>
  <text x="84" y="190" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">50%</text>
  <text x="84" y="310" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">0%</text>
  <text x="40" y="185" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)" transform="rotate(-90 40 185)">任务成功率</text>
  <text x="100" y="328" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">窄</text>
  <text x="640" y="328" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">宽</text>
  <text x="370" y="352" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">域随机化宽度</text>

  <!-- sweet-spot band -->
  <rect x="300" y="60" width="90" height="250" fill="var(--dia-green)" fill-opacity="0.10"/>
  <text x="345" y="78" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-green)">甜点</text>
  <text x="345" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9.5" fill="var(--dia-green)">(DR 参数表经验范围)</text>

  <!-- sim success: monotone decreasing, inflated at narrow -->
  <path d="M 95 80 C 200 95 320 150 460 215 S 620 270 645 285" stroke="var(--dia-blue)" stroke-width="2" fill="none" stroke-dasharray="5 3"/>
  <text x="150" y="74" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">sim 成功率（窄处虚高）</text>

  <!-- real success: inverted-U peaking in sweet spot -->
  <path d="M 95 280 C 180 230 260 130 345 118 C 430 130 540 215 645 270" stroke="var(--dia-accent)" stroke-width="2.6" fill="none"/>
  <circle cx="345" cy="118" r="6" fill="var(--dia-accent)"/>
  <text x="345" y="108" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent)">real 峰值 ≈ 最优宽度</text>

  <!-- end annotations -->
  <text x="120" y="300" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">太窄：过拟合仿真，real 崩</text>
  <text x="620" y="255" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">太宽：欠拟合，过度保守均平庸</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — 域随机化宽度对真实成功率的影响是倒 U：太窄时仿真成功率虚高但过拟合仿真、真实部署崩溃；太宽时策略被迫过度保守，sim/real 都平庸。最优在中间——前文 DR 参数表给出的经验范围正对应这个"甜点"。整个部署流程（训练→辨识校准→渐进提速）本质都是为了把策略稳在这个峰值附近。</p>


---

## 常见失败模式与排查

### 1. 策略冻结 (Policy Freezing)

**现象**：机器人突然停止运动或输出恒定动作。

**原因**：

- 观测值超出训练分布范围（OOD）
- 归一化统计量与仿真不匹配
- 网络输入中出现 NaN 或 Inf

**解决方案**：

- 检查观测值范围，添加裁剪（clipping）
- 同步仿真与真实环境的归一化参数
- 添加输入合法性检查

### 2. 意外接触 (Unexpected Contacts)

**现象**：机器人与未建模的障碍物碰撞。

**原因**：

- 仿真环境过于简洁，缺少真实场景中的障碍物
- 定位误差导致与已知物体碰撞

**解决方案**：

- 在仿真中添加随机障碍物
- 启用碰撞检测与安全响应策略
- 使用力矩监测实现碰撞后安全停止

### 3. 传感器噪声导致抖动

**现象**：机器人末端或关节出现高频振荡。

**原因**：

- 真实传感器噪声特性与仿真不匹配
- 控制增益过高，放大噪声

**解决方案**：

- 增大仿真中的传感器噪声范围
- 添加观测滤波（低通滤波、滑动平均）
- 降低 PD 控制增益

### 4. 地形/接触面差异

**现象**：腿足机器人行走不稳。

**原因**：

- 真实地面摩擦系数与仿真差异大
- 地面不平整超出随机化范围

**解决方案**：

- 扩大摩擦系数随机化范围
- 增加地形随机化复杂度
- 使用自适应步态控制器

### 5. 通信延迟不匹配

**现象**：动作执行不流畅，出现滞后或超调。

**原因**：

- 真实系统通信延迟大于仿真设定
- 延迟波动（Jitter）导致控制不稳定

**解决方案**：

- 测量真实延迟分布，扩大仿真延迟随机化范围
- 使用延迟补偿技术（预测当前状态）
- 降低控制频率以减少延迟敏感性

---

## 实用工具与脚本

### 部署前参数对比脚本

```python
def compare_sim_real_params(sim_config, real_measurements):
    """对比仿真参数与真实测量值"""
    mismatches = []
    for param, sim_val in sim_config.items():
        if param in real_measurements:
            real_val = real_measurements[param]
            error = abs(sim_val - real_val) / abs(real_val)
            if error > 0.1:  # 超过10%偏差
                mismatches.append({
                    'param': param,
                    'sim': sim_val,
                    'real': real_val,
                    'error': f'{error*100:.1f}%'
                })
    return mismatches
```

### 部署安全监控

```python
class SafetyMonitor:
    def __init__(self, torque_limit, velocity_limit, position_limits):
        self.torque_limit = torque_limit
        self.velocity_limit = velocity_limit
        self.position_limits = position_limits
    
    def check(self, state):
        """检查当前状态是否安全"""
        if any(abs(t) > self.torque_limit for t in state.torques):
            return False, "力矩超限"
        if any(abs(v) > self.velocity_limit for v in state.velocities):
            return False, "速度超限"
        for i, pos in enumerate(state.positions):
            if pos < self.position_limits[i][0] or pos > self.position_limits[i][1]:
                return False, f"关节{i}位置超限"
        return True, "正常"
```

---

## 相关资源

- [Sim2Real 迁移方法](../../02_Robot_Learning/02_Methods/Sim2Real.md)
- [仿真工具对比](../01_Simulation/仿真工具对比.md)
- [安全与鲁棒性](安全与鲁棒性.md)
- [实时系统](实时系统.md)
