# 固态 LiDAR

## 概述

固态 LiDAR（Solid-State LiDAR）是指没有宏观机械运动部件的激光雷达。与传统机械旋转式 LiDAR 相比，固态 LiDAR 具有更高的可靠性、更小的体积、更低的成本潜力，被认为是 LiDAR 技术从研发走向大规模量产的关键方向。

## 机械式 vs 固态：为什么需要固态

| 对比维度 | 机械旋转式 | 固态 |
|----------|-----------|------|
| 运动部件 | 电机驱动整体旋转 | 无宏观运动部件 |
| 使用寿命 | ~10,000 小时 | ~100,000 小时 |
| 体积 | 较大（需要旋转空间） | 小巧紧凑 |
| 重量 | 500g – 2kg | 100g – 500g |
| FOV | 水平 360° | 有限（60°–120°） |
| 可靠性 | 振动/冲击敏感 | 高可靠性（车规级） |
| 成本（量产） | 高（机械加工精度要求） | 低（半导体工艺量产） |
| 车规认证 | 困难 | 更容易达到 |

!!! warning "FOV 限制"
    固态 LiDAR 最大的限制是无法实现 360° 全向扫描。解决方案是使用多个固态 LiDAR 组合覆盖全周视角，或针对特定应用（如前向感知）使用单个传感器。

## 固态 LiDAR 技术路线

<div class="diagram">
<svg viewBox="0 0 560 720" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="280" y1="120" x2="110" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="280" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="450" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="195" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="365" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="260" x2="110" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="280" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="450" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="400" x2="195" y2="630" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="400" x2="365" y2="630" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">固态 LiDAR 技术路线</text>
  <rect x="40" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="110" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MEMS 微振镜</text>
  <rect x="210" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="280" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">OPA 光学相控阵</text>
  <rect x="380" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="450" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Flash LiDAR</text>
  <rect x="125" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="350" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">棱镜/楔角镜旋转</text>
  <rect x="295" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="295" y="350" width="3" height="50" fill="var(--dia-green)"/>
  <text x="365" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">FMCW 固态</text>
  <rect x="40" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="512" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MEMS 微镜控制激光指向 速腾</text>
  <text x="110" y="526" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">RS-M1</text>
  <rect x="210" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="505" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">电控改变光束方向</text>
  <text x="280" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Quanergy, Analog</text>
  <text x="280" y="533" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Photonics</text>
  <rect x="380" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="512" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">面阵发射/接收 Ibeo,</text>
  <text x="450" y="526" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Continental</text>
  <rect x="125" y="630" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="630" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="195" y="652" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">小型光学元件旋转 Livox</text>
  <text x="195" y="666" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Mid-360</text>
  <rect x="295" y="630" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="295" y="630" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="365" y="652" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">频率调制+相干检测 Aeva,</text>
  <text x="365" y="666" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SiLC</text>
</svg>
</div>


### MEMS 微振镜扫描

**原理**：使用微机电系统（MEMS）制造的微型振镜来偏转激光束方向，实现二维扫描。

$$
\theta(t) = \theta_0 \sin(2\pi f t)
$$

其中 $\theta_0$ 为最大偏转角，$f$ 为振镜谐振频率。

**技术特点**：

| 特性 | 说明 |
|------|------|
| 扫描方式 | 1D 或 2D MEMS 镜快速振动 |
| 优点 | 技术成熟、成本可控、可量产 |
| 缺点 | 振镜仍是运动部件（微观）、抗冲击能力有限 |
| FOV | 通常 60°–120° |
| 代表产品 | RoboSense RS-M1、Innoviz InnovizTwo |

**工作流程**：

1. 激光器发射脉冲
2. MEMS 镜将激光偏转到目标方向
3. 反射光经同一 MEMS 镜返回
4. 探测器接收并测量飞行时间
5. MEMS 镜快速振动覆盖整个 FOV

### OPA 光学相控阵

**原理**：类似于相控阵雷达，利用多个发射单元的相位差控制激光束方向，实现纯电控波束扫描。

$$
\theta = \arcsin\left(\frac{\lambda \cdot \Delta\varphi}{2\pi d}\right)
$$

其中：

- $\lambda$ 为激光波长
- $\Delta\varphi$ 为相邻单元相位差
- $d$ 为阵元间距

**技术特点**：

| 特性 | 说明 |
|------|------|
| 扫描方式 | 纯电控相位调节 |
| 优点 | 真正无运动部件、扫描速度极快、可随机访问 |
| 缺点 | 技术难度大、功率有限、旁瓣问题 |
| 现状 | 研发阶段，少量产品化 |
| 代表 | Quanergy（已破产）、MIT/Caltech 研究 |

!!! note "OPA 的挑战"
    OPA 在理论上是最理想的固态方案，但面临阵元数量、发射功率、旁瓣抑制等技术挑战。目前商业化进展缓慢，短期内难以大规模部署。

### Flash LiDAR

**原理**：类似于相机的"闪光灯"，一次性照亮整个场景，使用面阵探测器（如 SPAD 阵列）同时接收所有方向的反射信号。

**技术特点**：

| 特性 | 说明 |
|------|------|
| 扫描方式 | 无扫描，面阵并行 |
| 优点 | 无运动部件、帧率高、结构简单 |
| 缺点 | 测距范围短（能量分散）、分辨率受限于阵列大小 |
| 适用场景 | 近距离（<30m）、补盲、手势识别 |
| 代表 | Ibeo、Continental、Apple iPad LiDAR |

Flash LiDAR 的距离限制源于能量守恒：

$$
P_{\text{per pixel}} = \frac{P_{\text{total}}}{N_{\text{pixels}}}
$$

要覆盖更多像素或更远距离，需要更大的发射功率，这受制于人眼安全标准。

### 棱镜/楔角镜旋转（Livox 方案）

**原理**：使用一个或多个小型旋转棱镜改变激光方向，产生独特的非重复扫描图案。

**技术特点**：

| 特性 | 说明 |
|------|------|
| 扫描方式 | 小型棱镜旋转（半固态） |
| 优点 | 成本低、可靠性较高、非重复扫描提高等效分辨率 |
| 缺点 | 严格来说非纯固态、仍有微小运动部件 |
| 代表 | Livox Mid-360、HAP、Avia |

**非重复扫描的覆盖率**：

$$
C(T) = 1 - e^{-\lambda T}
$$

其中 $C(T)$ 为积分时间 $T$ 内的 FOV 覆盖率，$\lambda$ 为扫描密度参数。随时间增加，覆盖率指数逼近 100%。

### FMCW 固态 LiDAR

**原理**：结合 FMCW 测距技术和固态波束控制（OPA 或 MEMS），实现相干检测。

**技术特点**：

| 特性 | 说明 |
|------|------|
| 测距原理 | 频率调制连续波（相干检测） |
| 优点 | 同时获取距离+速度、抗干扰能力强、灵敏度高 |
| 缺点 | 技术复杂度最高、成本高 |
| 代表 | Aeva Aeries II、SiLC Eyeonic |

**关键优势——瞬时速度测量**：

$$
v = \frac{f_{\text{Doppler}} \cdot \lambda}{2}
$$

传统 ToF LiDAR 只能通过连续帧差分估计速度，而 FMCW 可以从单次测量直接获取径向速度。

## Livox Mid-360 详解

Livox Mid-360 是当前机器人领域最受欢迎的固态（半固态）LiDAR 之一。

### 规格参数

| 参数 | 值 |
|------|-----|
| 测距范围 | 40m（@10%反射率），70m（@80%） |
| FOV | 360° × 59°（-7° ~ +52°） |
| 点频 | 200,000 pts/s |
| 扫描方式 | 非重复旋转棱镜 |
| 精度 | ±2cm（@0.2m–10m） |
| 回波数 | 双回波 |
| 内置 IMU | 6 轴，200Hz |
| 接口 | 100M Ethernet |
| 尺寸 | ∅63.18mm × 47.98mm |
| 重量 | ~265g |
| 功耗 | 5.5W（典型） |
| 防护等级 | IP67 |
| 工作温度 | -20°C ~ +55°C |
| 价格 | ~$1,099 |

### 非重复扫描模式

<div class="diagram">
<svg viewBox="0 0 900 200" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="95" x2="270" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="95" x2="500" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="730" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">50ms 低覆盖</text>
  <rect x="270" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="70" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">100ms 中覆盖</text>
  <rect x="500" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">200ms 高覆盖</text>
  <rect x="730" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">500ms 近似全覆盖</text>
</svg>
</div>


随着积分时间增加，扫描图案逐渐填充整个 FOV，等效分辨率不断提高。这是 Livox 区别于传统线扫 LiDAR 的核心优势。

### 典型应用

- **四足机器人**：轻量、360° FOV、内置 IMU，适合 FAST-LIO2/Point-LIO
- **无人机建图**：轻量、功耗低
- **服务机器人**：3D 感知和避障
- **低速自动驾驶**：园区物流车、配送机器人

## 各技术路线对比

| 技术路线 | 成熟度 | 成本 | 性能 | 量产难度 | 主要瓶颈 |
|----------|--------|------|------|----------|----------|
| MEMS 微振镜 | ★★★★ | 中 | 好 | 中 | 振镜可靠性 |
| 棱镜旋转 | ★★★★ | 低 | 好 | 低 | 严格来说非纯固态 |
| Flash | ★★★ | 低 | 中（距离短） | 低 | 测距范围 |
| OPA | ★★ | 高 | 潜力大 | 高 | 功率、旁瓣 |
| FMCW | ★★★ | 高 | 优秀 | 高 | 系统复杂度 |

## 固态 LiDAR 的未来趋势

1. **成本下降**：随着量产规模扩大，车规级固态 LiDAR 价格将降至 $200–$500
2. **芯片化**：将发射、扫描、接收、处理集成到单芯片（SoC LiDAR）
3. **FMCW 普及**：4D LiDAR（距离+速度）将成为下一代标准
4. **与摄像头融合**：在同一传感器模块中集成 LiDAR 和相机
5. **1550nm 波长**：人眼安全 + 更高功率 → 更远测距

## 参考资料

- Livox 技术白皮书：https://www.livoxtech.com
- 《LiDAR Technologies and Systems》 - SPIE
- Aeva FMCW 技术文档
- RoboSense RS-M1 产品规格书
- Hesai FT120 技术资料
