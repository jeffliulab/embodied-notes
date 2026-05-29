# Sim2Real：从仿真到真实的迁移

## 概述

Sim2Real（Simulation-to-Reality）是机器人学习中连接仿真训练与真实部署的关键技术。核心问题是**现实差距**（Reality Gap）：仿真器无法完美复现真实世界的物理特性，导致在仿真中表现优异的策略在真实环境中失效。

Sim2Real 的研究目标是开发系统化的方法，使仿真中训练的策略能够稳健地迁移到真实机器人上。

---

## 现实差距的来源

仿真与真实之间的差距来自多个层面：

### 动力学差距

仿真器对物理过程的建模存在系统性偏差：

| 物理现象 | 仿真近似 | 真实情况 |
|----------|----------|----------|
| 接触 | 穿透惩罚力/约束 | 复杂变形、摩擦 |
| 摩擦 | 库仑模型 $f = \mu N$ | 非线性、各向异性 |
| 柔性体 | 有限元/质点弹簧 | 连续变形 |
| 电机 | 理想力矩源 | 延迟、非线性、热效应 |
| 传感器 | 理想值+高斯噪声 | 复杂噪声、偏置漂移 |

### 视觉差距

| 维度 | 仿真渲染 | 真实图像 |
|------|----------|----------|
| 光照 | 简化光照模型 | 复杂环境光、反射 |
| 纹理 | 有限纹理库 | 无限多样性 |
| 相机 | 理想针孔模型 | 畸变、色差、噪声 |
| 遮挡 | 完美深度 | 传感器噪声、空洞 |

---

## 域随机化（Domain Randomization）

### 核心思想

域随机化（DR）的核心假设是：如果策略在大量随机化的仿真环境中都能成功，那么真实环境只是这些随机化环境中的"一个样本"。

**形式化**：定义仿真参数向量 $\xi \in \Xi$，在每个训练 episode 开始时从分布 $p(\xi)$ 中采样：

$$
\xi \sim p(\xi), \quad \pi^* = \arg\max_\pi \mathbb{E}_{\xi \sim p(\xi)} \left[ \mathbb{E}_\pi \left[ \sum_t \gamma^t r_t \mid \xi \right] \right]
$$

### 物理参数随机化

典型的物理参数随机化范围：

| 参数 | 符号 | 默认值 | 随机化范围 |
|------|------|--------|-----------|
| 摩擦系数 | $\mu$ | 1.0 | [0.2, 2.0] |
| 物体质量 | $m$ | 标称值 | [0.5x, 2.0x] |
| 阻尼系数 | $b$ | 标称值 | [0.5x, 3.0x] |
| 关节间隙 | $\delta$ | 0 | [0, 0.02] rad |
| 执行器延迟 | $\Delta t$ | 0 | [0, 30] ms |
| 重力 | $g$ | 9.81 | [9.4, 10.2] m/s$^2$ |
| 地形摩擦 | $\mu_g$ | 0.7 | [0.3, 1.2] |

### 视觉随机化

视觉域随机化在渲染层面引入变化：

- **纹理随机化**：随机替换物体和背景纹理
- **光照随机化**：方向、强度、颜色、数量
- **相机随机化**：位置偏移、视场角、白平衡
- **干扰物**：随机添加无关物体到场景中

### 自动域随机化（ADR）

手动设定随机化范围需要领域知识。自动域随机化（ADR, OpenAI 2019）自动调整：

**算法**：对每个参数 $\xi_i$，维护范围 $[\xi_i^{\text{low}}, \xi_i^{\text{high}}]$。在一个评估窗口内：

$$
\text{If success\_rate} > \eta_{\text{up}}: \quad \xi_i^{\text{high}} \leftarrow \xi_i^{\text{high}} + \Delta\xi_i
$$
$$
\text{If success\_rate} < \eta_{\text{down}}: \quad \xi_i^{\text{high}} \leftarrow \xi_i^{\text{high}} - \Delta\xi_i
$$

这使得随机化范围随训练过程自适应扩展或收缩。

---

## 系统辨识（System Identification）

### 核心思想

与域随机化"训练对所有环境鲁棒"的思路不同，系统辨识（SysID）的目标是**让仿真尽量贴近真实**。

### 参数辨识

给定仿真器模型 $f_\xi(s, a)$ 和真实机器人轨迹 $\{(s_t^{\text{real}}, a_t^{\text{real}}, s_{t+1}^{\text{real}})\}$，优化仿真参数：

$$
\xi^* = \arg\min_\xi \sum_t \| f_\xi(s_t^{\text{real}}, a_t^{\text{real}}) - s_{t+1}^{\text{real}} \|^2
$$

### 贝叶斯优化

当目标函数不可微分时（如仿真器是黑盒），使用贝叶斯优化：

1. 在真实机器人上执行标准动作序列，记录轨迹 $\tau^{\text{real}}$
2. 在仿真中执行相同动作序列，得到 $\tau^{\text{sim}}(\xi)$
3. 定义距离度量 $d(\tau^{\text{real}}, \tau^{\text{sim}}(\xi))$
4. 用高斯过程建模 $d(\xi)$，使用贝叶斯优化搜索 $\xi^*$

### 在线自适应

更进一步，可以在部署时在线估计环境参数。将 $\xi$ 作为隐变量，通过观测历史推断：

$$
\hat{\xi}_t = g_\phi(o_{t-L:t}, a_{t-L:t-1})
$$

其中 $g_\phi$ 是一个编码器（通常用 RNN 或 Transformer），从最近 $L$ 步的观测-动作历史推断当前环境参数。

---

## 域适应（Domain Adaptation）

### 对抗特征对齐

域适应通过学习**域不变特征**来弥合差距。核心方法是对抗训练：

**架构**：

- 特征提取器 $F_\theta: \mathcal{O} \rightarrow \mathcal{Z}$
- 任务头 $C_\psi: \mathcal{Z} \rightarrow \mathcal{A}$
- 域判别器 $D_\omega: \mathcal{Z} \rightarrow \{0, 1\}$（0=sim, 1=real）

**目标函数**：

$$
\min_{\theta, \psi} \max_\omega \underbrace{\mathcal{L}_{\text{task}}(C_\psi(F_\theta(o_{\text{sim}})), a^*)}_{\text{仿真中的任务损失}} - \lambda \underbrace{\mathcal{L}_{\text{domain}}(D_\omega(F_\theta(o)), d)}_{\text{域分类损失}}
$$

通过梯度反转层（Gradient Reversal Layer），特征提取器 $F_\theta$ 同时最小化任务损失和最大化域判别器的困惑度，从而学到域不变特征。

### 图像级迁移

使用图像到图像翻译（如 CycleGAN）将仿真图像转换为接近真实的风格：

$$
G_{\text{sim} \to \text{real}}: I_{\text{sim}} \to \hat{I}_{\text{real}}
$$

配合循环一致性损失：

$$
\mathcal{L}_{\text{cycle}} = \|G_{\text{real} \to \text{sim}}(G_{\text{sim} \to \text{real}}(I_{\text{sim}})) - I_{\text{sim}}\|_1
$$

---

## Teacher-Student 蒸馏

### 完整训练流程

Teacher-Student 是目前最成功的 Sim2Real 框架之一，尤其在四足运动控制领域。

<!-- SVG-DESIGN-NOTES
Type: A (结构 — Teacher-Student 三阶段:特权 Teacher 训练 → KL 蒸馏到 Student → Real 部署)
Q0: Teacher-Student 的关键非对称是"观测维度":仿真中 Teacher 用特权信息 (地形 / 摩擦 / 接触力 等仿真才能拿到的真值);Student 只用真实可获得的本体感觉,通过 KL 散度从 Teacher 学到对真实输入的近似映射
Q1: 三栏纵向阶段 (Sim+Teacher / KL Distill / Real+Student),每栏 viewBox 颜色不同;关键体现:Teacher 观测列 (privileged tags) 与 Student 观测列 (sensor tags) 差异通过 box 宽度对比;中间 KL 蒸馏箭头
Q2: 去标题:左 (privileged inputs, wide) 中 (KL 蒸馏单一箭头) 右 (sensor inputs, narrow) = Teacher-Student DNA
Q3: 删去原 900×580 viewBox 14 个交叉箭头;改为三阶段清晰分栏
Q4: 各特权观测 / sensor 观测项目直接标在 box 里
Q5: 全用 var(--dia-*);英文版镜像
-->
<div class="diagram">
<svg viewBox="0 0 820 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Teacher-Student 三阶段蒸馏管线">
  <defs>
    <marker id="ts-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
    <marker id="ts-arr-red" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-accent-deep)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Teacher-Student — 特权信息从仿真蒸馏到真实</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Teacher 用仿真特权观测 → KL 蒸馏 → Student 只用真实传感器 → 部署</text>

  <!-- Stage 1: Sim + Teacher (large privileged obs panel) -->
  <rect x="40" y="70" width="260" height="280" rx="8" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="170" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-blue)">阶段 1 · Sim + Teacher</text>
  <text x="170" y="108" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">4096 并行环境 + 域随机化</text>

  <!-- Privileged observations (wide box, suggests information richness) -->
  <rect x="60" y="124" width="220" height="100" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.6"/>
  <text x="170" y="142" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">特权观测 (privileged)</text>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">
    <text x="75" y="158">• 地形高度图</text>
    <text x="75" y="172">• 接触力 / 接触状态</text>
    <text x="75" y="186">• 摩擦系数 / 质量</text>
    <text x="75" y="200">• 物体真值位姿</text>
    <text x="75" y="214">• 仿真噪声真值</text>
  </g>

  <!-- Teacher Actor -->
  <rect x="60" y="240" width="220" height="80" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="170" y="258" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-blue)">Teacher π_T (PPO)</text>
  <text x="170" y="274" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">MLP 256-256-256</text>
  <text x="170" y="290" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">收敛后冻结</text>
  <text x="170" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">a_T = π_T(o_privileged)</text>

  <!-- Stage 2: KL Distillation -->
  <text x="410" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">阶段 2</text>
  <text x="410" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">KL 蒸馏</text>
  <text x="410" y="200" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">L = D_KL(π_T ‖ π_S)</text>
  <text x="410" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">同一仿真环境</text>
  <text x="410" y="234" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">不同观测输入</text>

  <!-- Big distillation arrow -->
  <path d="M 300 270 Q 360 270 360 260" fill="none" stroke="var(--dia-accent-deep)" stroke-width="2"/>
  <line x1="360" y1="260" x2="360" y2="248" stroke="var(--dia-accent-deep)" stroke-width="2" marker-end="url(#ts-arr-red)"/>
  <path d="M 460 248 L 460 260 Q 460 270 520 270" fill="none" stroke="var(--dia-accent-deep)" stroke-width="2" marker-end="url(#ts-arr-red)"/>

  <!-- Stage 3: Real + Student -->
  <rect x="520" y="70" width="260" height="280" rx="8" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="650" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">阶段 3 · Real + Student</text>
  <text x="650" y="108" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">仅本体感觉 (real-feasible)</text>

  <!-- Sensor observations (narrow box, suggesting limited info) -->
  <rect x="540" y="124" width="220" height="64" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="650" y="142" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">真实传感器观测</text>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">
    <text x="555" y="158">• 关节角 q (本体感受)</text>
    <text x="555" y="172">• IMU (角速度 + 加速度)</text>
    <text x="555" y="186">• 历史动作 a_{t-H:t-1}</text>
  </g>

  <!-- History encoder -->
  <rect x="540" y="200" width="220" height="36" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="650" y="218" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">History Encoder</text>
  <text x="650" y="232" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">RNN / Transformer</text>

  <!-- Student Actor -->
  <rect x="540" y="246" width="220" height="74" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="650" y="264" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-green)">Student π_S</text>
  <text x="650" y="280" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">MLP 256-256-256</text>
  <text x="650" y="298" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">a_S = π_S(o_sensor, h_t)</text>
  <text x="650" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">@ 50 Hz 部署到真机</text>
</svg>
</div>
<p class="figure-caption">Figure — Teacher-Student 的几何 DNA：左侧大盒装满了 sim-only 的特权观测，Teacher 学会用它们；中间 KL 蒸馏把 Teacher 的策略压缩进 Student；右侧小盒只有真实可用的传感器输入，Student 学会"用更少信息复现 Teacher 行为"。</p>


### 特权信息设计

**Teacher 的特权信息**（仿真中可获取，真实中不可获取）：

| 特权信息 | 维度 | 说明 |
|----------|------|------|
| 地形高度扫描 | $\mathbb{R}^{187}$ | 脚周围的高度采样点 |
| 外力 | $\mathbb{R}^{3}$ | 施加在躯干上的扰动力 |
| 摩擦系数 | $\mathbb{R}^{1}$ | 当前地面摩擦 |
| 负载质量 | $\mathbb{R}^{1}$ | 背部额外负载 |
| 电机强度 | $\mathbb{R}^{12}$ | 每个电机的实际增益 |

**Student 的可用信息**：

| 观测 | 维度 | 说明 |
|------|------|------|
| 关节角 | $\mathbb{R}^{12}$ | 编码器读数 |
| 关节角速度 | $\mathbb{R}^{12}$ | 编码器差分 |
| IMU | $\mathbb{R}^{6}$ | 角速度 + 加速度 |
| 历史动作 | $\mathbb{R}^{12 \times L}$ | 过去 $L$ 步动作 |
| 速度指令 | $\mathbb{R}^{3}$ | $(v_x, v_y, \omega_z)$ |

### 历史编码器

Student 通过历史信息隐式推断环境参数。编码器将过去 $L$ 步的观测-动作对映射为潜变量：

$$
z_t = \text{RNN}_\phi(o_{t-L:t}, a_{t-L:t-1})
$$

然后 Student 策略以 $z_t$ 为条件：

$$
a_t = \pi_{\text{student}}(o_t, z_t)
$$

直觉上，$z_t$ 编码了当前地形类型、摩擦、负载等信息的隐式估计。

---

## Sim2Real 最佳实践

### 成功要素

1. **充分的域随机化**：覆盖真实环境可能的变化范围
2. **精确的默认参数**：系统辨识确定标称参数
3. **鲁棒的观测**：避免依赖仿真中容易但真实中不准确的信号
4. **延迟建模**：在仿真中注入通信/计算延迟
5. **噪声注入**：传感器噪声、执行器噪声
6. **动作平滑**：惩罚急剧的动作变化

### 常见失败模式

| 失败模式 | 原因 | 解决方案 |
|----------|------|----------|
| 动作抖动 | 仿真中无电机动力学 | 添加低通滤波和平滑惩罚 |
| 无法行走 | 摩擦模型不准 | 更大的摩擦随机化范围 |
| 抓取失败 | 接触模型差异 | 力/力矩反馈 + 域随机化 |
| 视觉失效 | 渲染不逼真 | 视觉域随机化 + 域适应 |
| 延迟敏感 | 未建模延迟 | 注入 10-30ms 随机延迟 |

---

## 评估指标

### 迁移成功率

最直接的指标是真实环境中的任务成功率与仿真中的比率：

$$
\text{Transfer Ratio} = \frac{\text{Success Rate}_{\text{real}}}{\text{Success Rate}_{\text{sim}}}
$$

理想情况下接近 1.0。实际中：

- 简单任务（如四足行走）：0.8-0.95
- 操作任务（如灵巧操作）：0.3-0.7
- 视觉任务（如基于图像的操作）：0.2-0.6

### Zero-Shot vs Few-Shot Transfer

- **Zero-Shot**：仿真训练后直接部署，无需真实数据
- **Few-Shot**：仿真预训练 + 少量真实数据微调

---

## 与其他章节的联系

- **仿真平台**：[仿真平台](../../03_Sim2Real/01_Simulation/simulation_platforms.md) 详细介绍 Isaac Gym/Lab、MuJoCo 等仿真器的架构
- **强化学习**：[强化学习在机器人中的应用](强化学习在机器人中的应用.md) 详述仿真中的 RL 训练方法
- **部署实践**：[实机部署](../../03_Sim2Real/index.md) 涵盖 Sim2Real 部署的工程细节
- **控制理论**：[机器人学基础](../../00_Robotics/02_Classical_Robotics/robotics_intro.md) 中的控制理论为 Sim2Real 提供安全保障

---

## 参考文献

1. Tobin, J., et al. (2017). *Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World*. IROS.
2. OpenAI (2019). *Solving Rubik's Cube with a Robot Hand*. arXiv:1910.07113.
3. Miki, T., et al. (2022). *Learning Robust Perceptive Locomotion for Quadrupedal Robots in the Wild*. Science Robotics.
4. Peng, X.B., et al. (2018). *Sim-to-Real Transfer of Robotic Control with Dynamics Randomization*. ICRA.
5. Rudin, N., et al. (2022). *Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning*. CoRL.
