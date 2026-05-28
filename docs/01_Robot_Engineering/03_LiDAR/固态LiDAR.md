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

<!-- SVG-DESIGN-NOTES
Type: D (量化 — 五条固态 LiDAR 技术路线在 成熟度 × 量产成本 平面上的定位)
Q0: 五条路线不是"分类树",而是定位在 成熟度 × 量产成本 二维平面上的差异化策略;MEMS+棱镜 已 ★★★★ 高成熟度,Flash 走低成本短距,OPA/FMCW 还在高成本探索期;气泡大小 = 单帧速度 (帧率潜力)。
Q1: x = 量产成熟度 (★ 1-5), y = 单元成本 (USD, log 100-3000);五个气泡按代表产品定位 + iso-cost dashed lines + iso-maturity 区段
Q2: 去掉标题,五个气泡+成本-成熟度网格 — DNA 是固态路线的产业化定位
Q3: 删 17 个等大决策框、20 根箭头、"树状分类"伪结构
Q4: 气泡旁直接标厂商
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">固态 LiDAR 五条技术路线 — 成熟度 × 单元成本</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">bubble area ∝ 帧率潜力 (Hz) · log y-axis</text>

  <!-- axes: x = maturity 0-5 stars maps [80..680]; y = log cost 100-3000 USD maps [350..70] -->
  <line x1="80" y1="350" x2="680" y2="350" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="350" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="200" y1="348" x2="200" y2="354"/><text x="200" y="368" text-anchor="middle">★★</text>
    <line x1="320" y1="348" x2="320" y2="354"/><text x="320" y="368" text-anchor="middle">★★★</text>
    <line x1="440" y1="348" x2="440" y2="354"/><text x="440" y="368" text-anchor="middle">★★★★</text>
    <line x1="560" y1="348" x2="560" y2="354"/><text x="560" y="368" text-anchor="middle">★★★★★</text>

    <line x1="76" y1="350" x2="84" y2="350"/><text x="72" y="354" text-anchor="end">$100</text>
    <line x1="76" y1="265" x2="84" y2="265"/><text x="72" y="269" text-anchor="end">$300</text>
    <line x1="76" y1="180" x2="84" y2="180"/><text x="72" y="184" text-anchor="end">$1k</text>
    <line x1="76" y1="95"  x2="84" y2="95" /><text x="72" y="99"  text-anchor="end">$3k</text>
  </g>
  <text x="380" y="388" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">量产成熟度 (TRL · 星级越高越接近车规)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">单元成本 USD (log)</text>

  <!-- bubbles -->
  <!-- MEMS micro-mirror (RoboSense RS-M1): maturity 4 (~440), cost ~$1500 (~135), bubble r=14 -->
  <circle cx="440" cy="155" r="15" fill="var(--dia-green)" fill-opacity="0.5" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="460" y="148" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">MEMS 微振镜</text>
  <text x="460" y="161" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">RS-M1 · Innoviz</text>

  <!-- Prism rotate (Livox Mid-360): maturity ★★★★ x=440, cost ~$1.1k y=175, bubble r=15 -->
  <circle cx="465" cy="175" r="15" fill="var(--dia-green)" fill-opacity="0.45" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="370" y="218" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">棱镜旋转</text>
  <text x="370" y="231" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Livox Mid-360 · HAP · Avia</text>

  <!-- Flash (Apple iPad / Ibeo / Continental): maturity ~★★★ x=320, cost low ~$200 y=320, bubble r=18 (high frame rate) -->
  <circle cx="320" cy="320" r="20" fill="var(--dia-blue)" fill-opacity="0.5" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="206" y="305" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Flash 面阵</text>
  <text x="170" y="318" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Apple iPad · Ibeo · Continental</text>

  <!-- OPA (Quanergy bankrupt, MIT/Caltech): maturity ★★ x=200, cost ~$2k y=110, bubble r=10 (low frame rate) -->
  <circle cx="200" cy="110" r="11" fill="var(--dia-accent)" fill-opacity="0.4" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="100" y="100" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">OPA 光学相控阵</text>
  <text x="86" y="113" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Quanergy (✕) · Analog Photonics</text>

  <!-- FMCW (Aeva Aeries II, SiLC): maturity ★★★ x=320, cost ~$2.5k y=80, bubble r=13 -->
  <circle cx="320" cy="80" r="14" fill="var(--dia-gold)" fill-opacity="0.5" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="340" y="74" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">FMCW 固态</text>
  <text x="340" y="87" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Aeva Aeries II · SiLC Eyeonic</text>
  <text x="340" y="100" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-gold)">+ 多普勒速度</text>

  <!-- iso-cost guideline at $1k -->
  <line x1="80" y1="180" x2="680" y2="180" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.5"/>
  <text x="668" y="174" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">$1k = 当前机器人主流预算</text>

  <!-- maturity zone annotations -->
  <text x="170" y="60" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">↑ 研发期</text>
  <text x="520" y="60" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">→ 已量产车规</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 五条技术路线不是平行枝杈,而是在 成熟度-成本 平面上的差异化定位;MEMS 与 棱镜 已抢占 $1k 主流带,OPA/FMCW 仍在高成本研发期。</p>


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

<!-- SVG-DESIGN-NOTES
Type: C (过程 — 非重复扫描覆盖率 small multiples + 指数饱和曲线)
Q0: Livox 的 rosette/lissajous 非重复扫描在 50ms 覆盖 ~25%、100ms ~45%、200ms ~75%、500ms ≈ 95%;覆盖率服从 1-exp(-λT) 指数曲线,等效分辨率随时间从 "线扫" 提升到 "面扫"。
Q1: 4 frame small multiples (圆形 FOV 内 lissajous 散点累积) + 下方 1-exp(-λT) 曲线带 4 个时间 tick;不是 4 个等大方框
Q2: 四圆中花瓣型扫描点云密度递增 + 指数曲线 — DNA 是非重复扫描的统计填充
Q3: 删 4 个等大方框 + 3 根箭头
Q4: 时间/覆盖率直接标在散点圆和曲线上
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Livox 非重复扫描 — FOV 覆盖率随积分时间的累积</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">rosette pattern · coverage C(T) = 1 − e^(−λT)</text>

  <!-- 4 circular FOV small multiples (top row) -->
  <!-- frame 1: 50ms ~25% -->
  <circle cx="120" cy="140" r="55" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
  <g fill="var(--dia-accent)" opacity="0.85">
    <!-- ~30 rosette samples -->
    <circle cx="120" cy="140" r="1.4"/><circle cx="135" cy="120" r="1.4"/><circle cx="150" cy="135" r="1.4"/>
    <circle cx="158" cy="155" r="1.4"/><circle cx="142" cy="170" r="1.4"/><circle cx="110" cy="172" r="1.4"/>
    <circle cx="92" cy="155" r="1.4"/><circle cx="100" cy="125" r="1.4"/><circle cx="125" cy="105" r="1.4"/>
    <circle cx="160" cy="115" r="1.4"/><circle cx="170" cy="142" r="1.4"/><circle cx="155" cy="180" r="1.4"/>
    <circle cx="118" cy="186" r="1.4"/><circle cx="80" cy="170" r="1.4"/><circle cx="74" cy="138" r="1.4"/>
    <circle cx="88" cy="108" r="1.4"/><circle cx="120" cy="92" r="1.4"/><circle cx="148" cy="98" r="1.4"/>
  </g>
  <text x="120" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">T = 50 ms</text>
  <text x="120" y="231" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">≈ 25% FOV</text>

  <!-- frame 2: 100ms ~45% -->
  <circle cx="280" cy="140" r="55" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
  <g fill="var(--dia-green)" opacity="0.85">
    <!-- denser ~55 -->
    <circle cx="280" cy="140" r="1.3"/><circle cx="295" cy="120" r="1.3"/><circle cx="310" cy="135" r="1.3"/>
    <circle cx="318" cy="155" r="1.3"/><circle cx="302" cy="170" r="1.3"/><circle cx="270" cy="172" r="1.3"/>
    <circle cx="252" cy="155" r="1.3"/><circle cx="260" cy="125" r="1.3"/><circle cx="285" cy="105" r="1.3"/>
    <circle cx="320" cy="115" r="1.3"/><circle cx="330" cy="142" r="1.3"/><circle cx="315" cy="180" r="1.3"/>
    <circle cx="278" cy="186" r="1.3"/><circle cx="240" cy="170" r="1.3"/><circle cx="234" cy="138" r="1.3"/>
    <circle cx="248" cy="108" r="1.3"/><circle cx="280" cy="92" r="1.3"/><circle cx="308" cy="98" r="1.3"/>
    <circle cx="252" cy="92" r="1.3"/><circle cx="272" cy="120" r="1.3"/><circle cx="290" cy="155" r="1.3"/>
    <circle cx="305" cy="170" r="1.3"/><circle cx="262" cy="105" r="1.3"/><circle cx="245" cy="125" r="1.3"/>
    <circle cx="230" cy="148" r="1.3"/><circle cx="298" cy="180" r="1.3"/><circle cx="290" cy="88" r="1.3"/>
    <circle cx="310" cy="180" r="1.3"/><circle cx="240" cy="125" r="1.3"/><circle cx="265" cy="180" r="1.3"/>
    <circle cx="275" cy="155" r="1.3"/><circle cx="295" cy="155" r="1.3"/><circle cx="260" cy="145" r="1.3"/>
    <circle cx="245" cy="180" r="1.3"/><circle cx="318" cy="125" r="1.3"/><circle cx="304" cy="148" r="1.3"/>
  </g>
  <text x="280" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">T = 100 ms</text>
  <text x="280" y="231" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">≈ 45% FOV</text>

  <!-- frame 3: 200ms ~75% -->
  <circle cx="440" cy="140" r="55" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
  <g fill="var(--dia-blue)" opacity="0.8">
    <!-- ~90 samples densely -->
    <circle cx="440" cy="140" r="1.2"/><circle cx="455" cy="120" r="1.2"/><circle cx="470" cy="135" r="1.2"/>
    <circle cx="478" cy="155" r="1.2"/><circle cx="462" cy="170" r="1.2"/><circle cx="430" cy="172" r="1.2"/>
    <circle cx="412" cy="155" r="1.2"/><circle cx="420" cy="125" r="1.2"/><circle cx="445" cy="105" r="1.2"/>
    <circle cx="480" cy="115" r="1.2"/><circle cx="490" cy="142" r="1.2"/><circle cx="475" cy="180" r="1.2"/>
    <circle cx="438" cy="186" r="1.2"/><circle cx="400" cy="170" r="1.2"/><circle cx="394" cy="138" r="1.2"/>
    <circle cx="408" cy="108" r="1.2"/><circle cx="440" cy="92" r="1.2"/><circle cx="468" cy="98" r="1.2"/>
    <circle cx="412" cy="92" r="1.2"/><circle cx="432" cy="120" r="1.2"/><circle cx="450" cy="155" r="1.2"/>
    <circle cx="465" cy="170" r="1.2"/><circle cx="422" cy="105" r="1.2"/><circle cx="405" cy="125" r="1.2"/>
    <circle cx="390" cy="148" r="1.2"/><circle cx="458" cy="180" r="1.2"/><circle cx="450" cy="88" r="1.2"/>
    <circle cx="470" cy="180" r="1.2"/><circle cx="400" cy="125" r="1.2"/><circle cx="425" cy="180" r="1.2"/>
    <circle cx="435" cy="155" r="1.2"/><circle cx="455" cy="155" r="1.2"/><circle cx="420" cy="145" r="1.2"/>
    <circle cx="405" cy="180" r="1.2"/><circle cx="478" cy="125" r="1.2"/><circle cx="464" cy="148" r="1.2"/>
    <circle cx="488" cy="130" r="1.2"/><circle cx="494" cy="148" r="1.2"/><circle cx="488" cy="160" r="1.2"/>
    <circle cx="480" cy="172" r="1.2"/><circle cx="465" cy="186" r="1.2"/><circle cx="450" cy="190" r="1.2"/>
    <circle cx="430" cy="190" r="1.2"/><circle cx="415" cy="186" r="1.2"/><circle cx="402" cy="178" r="1.2"/>
    <circle cx="392" cy="166" r="1.2"/><circle cx="386" cy="150" r="1.2"/><circle cx="386" cy="130" r="1.2"/>
    <circle cx="394" cy="116" r="1.2"/><circle cx="402" cy="102" r="1.2"/><circle cx="418" cy="92" r="1.2"/>
    <circle cx="432" cy="86" r="1.2"/><circle cx="450" cy="86" r="1.2"/><circle cx="464" cy="92" r="1.2"/>
    <circle cx="478" cy="102" r="1.2"/><circle cx="488" cy="116" r="1.2"/><circle cx="455" cy="140" r="1.2"/>
    <circle cx="425" cy="140" r="1.2"/><circle cx="445" cy="160" r="1.2"/><circle cx="430" cy="160" r="1.2"/>
  </g>
  <text x="440" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">T = 200 ms</text>
  <text x="440" y="231" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">≈ 75% FOV</text>

  <!-- frame 4: 500ms ~95% (saturated, drawn as nearly filled) -->
  <circle cx="600" cy="140" r="55" fill="var(--dia-gold)" fill-opacity="0.32" stroke="var(--dia-gold)" stroke-width="0.8"/>
  <text x="600" y="143" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke)">≈ 全覆盖</text>
  <text x="600" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">T = 500 ms</text>
  <text x="600" y="231" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">≈ 95% FOV</text>

  <!-- bottom: exponential saturation curve -->
  <!-- axes: x: time 0-500 ms maps [80..680]; y: coverage 0-1 maps [390..255] -->
  <line x1="80" y1="390" x2="680" y2="390" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="390" x2="80" y2="255" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="388" x2="80"  y2="394"/><text x="80"  y="405" text-anchor="middle">0</text>
    <line x1="200" y1="388" x2="200" y2="394"/><text x="200" y="405" text-anchor="middle">50</text>
    <line x1="320" y1="388" x2="320" y2="394"/><text x="320" y="405" text-anchor="middle">100</text>
    <line x1="440" y1="388" x2="440" y2="394"/><text x="440" y="405" text-anchor="middle">200 ms</text>
    <line x1="680" y1="388" x2="680" y2="394"/><text x="680" y="405" text-anchor="middle">500</text>

    <line x1="76" y1="390" x2="84" y2="390"/><text x="72" y="394" text-anchor="end">0%</text>
    <line x1="76" y1="356" x2="84" y2="356"/><text x="72" y="360" text-anchor="end">25%</text>
    <line x1="76" y1="322" x2="84" y2="322"/><text x="72" y="326" text-anchor="end">50%</text>
    <line x1="76" y1="288" x2="84" y2="288"/><text x="72" y="292" text-anchor="end">75%</text>
    <line x1="76" y1="255" x2="84" y2="255"/><text x="72" y="259" text-anchor="end">100%</text>
  </g>
  <!-- curve: C(T) = 1 - exp(-T/166ms): T=50→0.26 y=355; T=100→0.45 y=329; T=200→0.70 y=292; T=500→0.95 y=261 -->
  <path d="M 80 390 C 130 388 170 365 200 355 C 230 345 280 333 320 329 C 360 320 400 305 440 292 C 500 280 580 269 680 261" stroke="var(--dia-stroke)" stroke-width="2" fill="none"/>
  <circle cx="200" cy="355" r="3" fill="var(--dia-accent)"/>
  <circle cx="320" cy="329" r="3" fill="var(--dia-green)"/>
  <circle cx="440" cy="292" r="3" fill="var(--dia-blue)"/>
  <circle cx="680" cy="261" r="3" fill="var(--dia-gold)"/>
  <line x1="80" y1="255" x2="680" y2="255" stroke="var(--dia-stroke-soft)" stroke-width="0.5" stroke-dasharray="2 3" opacity="0.6"/>
  <text x="558" y="252" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">100% asymptote</text>
  <text x="500" y="380" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">C(T) = 1 − e^(−T/τ), τ ≈ 166 ms</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — 非重复扫描的覆盖率是一条指数饱和曲线;前 100ms 增长最快,500ms 后边际收益陡降 — 这是为何 Livox 默认 100ms 积分窗口的工程依据。</p>


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
