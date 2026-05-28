# Solid-State LiDAR

## Overview

Solid-state LiDAR refers to laser radars without macro-scale mechanical moving parts. Compared to traditional mechanical rotating LiDARs, solid-state LiDARs offer higher reliability, smaller form factors, and lower cost potential. They are considered the key direction for LiDAR technology transitioning from R&D to large-scale mass production.

## Mechanical vs. Solid-State: Why Solid-State Is Needed

| Dimension | Mechanical Rotating | Solid-State |
|-----------|-------------------|-------------|
| Moving Parts | Motor-driven rotation | No macro-scale moving parts |
| Lifespan | ~10,000 hours | ~100,000 hours |
| Size | Larger (rotation space needed) | Compact |
| Weight | 500g - 2kg | 100g - 500g |
| FOV | Horizontal 360 deg | Limited (60-120 deg) |
| Reliability | Vibration/shock sensitive | High reliability (automotive grade) |
| Cost (Mass Production) | High (precision machining) | Low (semiconductor process) |
| Automotive Certification | Difficult | Easier to achieve |

!!! warning "FOV Limitation"
    The biggest limitation of solid-state LiDARs is the inability to achieve 360-degree omnidirectional scanning. Solutions include combining multiple solid-state LiDARs for full surround coverage, or using a single sensor for specific applications (e.g., forward perception).

## Solid-State LiDAR Technology Routes

<!-- SVG-DESIGN-NOTES
Type: D (量化 — 五条固态 LiDAR 技术路线在 成熟度 × 量产成本 平面上的定位)
Q0: 五条路线不是"分类树",而是定位在 成熟度 × 量产成本 二维平面上的差异化策略;MEMS+棱镜 已 ★★★★ 高成熟度,Flash 走低成本短距,OPA/FMCW 还在高成本探索期;气泡大小 = 单帧速度 (帧率潜力)。
Q1: x = 量产成熟度 (★ 1-5), y = 单元成本 (USD, log 100-3000);五个气泡按代表产品定位 + iso-cost dashed lines + iso-maturity 区段
Q2: 去掉标题,五个气泡+成本-成熟度网格 — DNA 是固态路线的产业化定位
Q3: 删 17 个等大决策框、20 根箭头、"树状分类"伪结构
Q4: 气泡旁直接标厂商
Q5: 全 var(--dia-*)
-->
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
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Solid-state LiDAR — five tech routes on maturity × unit cost</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">bubble area ∝ frame-rate potential (Hz) · log y-axis</text>

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
  <text x="380" y="388" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Production TRL (more stars ⇒ closer to automotive grade)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">unit cost USD (log)</text>

  <!-- bubbles -->
  <!-- MEMS micro-mirror (RoboSense RS-M1): maturity 4 (~440), cost ~$1500 (~135), bubble r=14 -->
  <circle cx="440" cy="155" r="15" fill="var(--dia-green)" fill-opacity="0.5" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="460" y="148" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">MEMS micro-mirror</text>
  <text x="460" y="161" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">RS-M1 · Innoviz</text>

  <!-- Prism rotate (Livox Mid-360): maturity ★★★★ x=440, cost ~$1.1k y=175, bubble r=15 -->
  <circle cx="465" cy="175" r="15" fill="var(--dia-green)" fill-opacity="0.45" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="370" y="218" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Prism rotation</text>
  <text x="370" y="231" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Livox Mid-360 · HAP · Avia</text>

  <!-- Flash (Apple iPad / Ibeo / Continental): maturity ~★★★ x=320, cost low ~$200 y=320, bubble r=18 (high frame rate) -->
  <circle cx="320" cy="320" r="20" fill="var(--dia-blue)" fill-opacity="0.5" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="206" y="305" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Flash array</text>
  <text x="170" y="318" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Apple iPad · Ibeo · Continental</text>

  <!-- OPA (Quanergy bankrupt, MIT/Caltech): maturity ★★ x=200, cost ~$2k y=110, bubble r=10 (low frame rate) -->
  <circle cx="200" cy="110" r="11" fill="var(--dia-accent)" fill-opacity="0.4" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="100" y="100" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">OPA optical phased array</text>
  <text x="86" y="113" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Quanergy (✕) · Analog Photonics</text>

  <!-- FMCW (Aeva Aeries II, SiLC): maturity ★★★ x=320, cost ~$2.5k y=80, bubble r=13 -->
  <circle cx="320" cy="80" r="14" fill="var(--dia-gold)" fill-opacity="0.5" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="340" y="74" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">FMCW solid-state</text>
  <text x="340" y="87" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Aeva Aeries II · SiLC Eyeonic</text>
  <text x="340" y="100" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-gold)">+ Doppler velocity</text>

  <!-- iso-cost guideline at $1k -->
  <line x1="80" y1="180" x2="680" y2="180" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.5"/>
  <text x="668" y="174" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">$1k = current robotics mainstream budget</text>

  <!-- maturity zone annotations -->
  <text x="170" y="60" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">↑ R&D phase</text>
  <text x="520" y="60" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">→ automotive-grade volume</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — The five routes are not parallel branches but differentiated positions on the maturity-cost plane; MEMS and Prism dominate the $1k mainstream band, while OPA/FMCW are still in the high-cost R&D phase.</p>


### MEMS Micro-Mirror Scanning

**Principle**: Uses MEMS-fabricated micro-mirrors to deflect the laser beam direction, achieving 2D scanning.

$$
\theta(t) = \theta_0 \sin(2\pi f t)
$$

Where $\theta_0$ is the maximum deflection angle and $f$ is the mirror resonant frequency.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | 1D or 2D MEMS mirror rapid oscillation |
| Advantages | Mature technology, controllable cost, mass-producible |
| Disadvantages | Mirror is still a moving part (microscale), limited shock resistance |
| FOV | Typically 60-120 deg |
| Representative Products | RoboSense RS-M1, Innoviz InnovizTwo |

**Workflow**:

1. Laser emits a pulse
2. MEMS mirror deflects the laser to the target direction
3. Reflected light returns through the same MEMS mirror
4. Detector receives and measures time of flight
5. MEMS mirror oscillates rapidly to cover the entire FOV

### OPA Optical Phased Array

**Principle**: Similar to phased-array radar, uses phase differences among multiple emitting elements to control the laser beam direction, achieving purely electronic beam steering.

$$
\theta = \arcsin\left(\frac{\lambda \cdot \Delta\varphi}{2\pi d}\right)
$$

Where:

- $\lambda$ is the laser wavelength
- $\Delta\varphi$ is the phase difference between adjacent elements
- $d$ is the element spacing

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | Purely electronic phase adjustment |
| Advantages | Truly no moving parts, extremely fast scanning, random access |
| Disadvantages | High technical difficulty, limited power, sidelobe issues |
| Status | R&D stage, few commercial products |
| Representative | Quanergy (bankrupt), MIT/Caltech research |

!!! note "OPA Challenges"
    OPA is theoretically the ideal solid-state solution, but faces technical challenges in element count, emission power, and sidelobe suppression. Commercialization progress has been slow, and large-scale deployment is unlikely in the near term.

### Flash LiDAR

**Principle**: Similar to a camera's "flash," illuminates the entire scene at once, using an area detector array (e.g., SPAD array) to simultaneously receive reflected signals from all directions.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | No scanning, parallel area detection |
| Advantages | No moving parts, high frame rate, simple structure |
| Disadvantages | Short range (energy dispersal), resolution limited by array size |
| Suitable Scenarios | Close range (<30m), blind-spot coverage, gesture recognition |
| Representative | Ibeo, Continental, Apple iPad LiDAR |

Flash LiDAR's distance limitation stems from energy conservation:

$$
P_{\text{per pixel}} = \frac{P_{\text{total}}}{N_{\text{pixels}}}
$$

Covering more pixels or longer distances requires more emission power, constrained by eye safety standards.

### Prism/Wedge Mirror Rotation (Livox Approach)

**Principle**: Uses one or more small rotating prisms to change the laser direction, producing a unique non-repetitive scan pattern.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | Small prism rotation (semi-solid-state) |
| Advantages | Low cost, higher reliability, non-repetitive scanning improves equivalent resolution |
| Disadvantages | Strictly speaking not purely solid-state, still has small moving parts |
| Representative | Livox Mid-360, HAP, Avia |

**Non-repetitive scanning coverage**:

$$
C(T) = 1 - e^{-\lambda T}
$$

Where $C(T)$ is the FOV coverage within integration time $T$, and $\lambda$ is the scan density parameter. Coverage exponentially approaches 100% with increasing time.

### FMCW Solid-State LiDAR

**Principle**: Combines FMCW ranging with solid-state beam control (OPA or MEMS) for coherent detection.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Ranging Principle | Frequency-modulated continuous wave (coherent detection) |
| Advantages | Simultaneous distance + velocity, strong anti-interference, high sensitivity |
| Disadvantages | Highest technical complexity, high cost |
| Representative | Aeva Aeries II, SiLC Eyeonic |

**Key advantage -- Instantaneous velocity measurement**:

$$
v = \frac{f_{\text{Doppler}} \cdot \lambda}{2}
$$

Traditional ToF LiDAR can only estimate velocity through consecutive frame differencing, while FMCW can directly obtain radial velocity from a single measurement.

## Livox Mid-360 in Detail

Livox Mid-360 is currently one of the most popular solid-state (semi-solid-state) LiDARs in robotics.

### Specifications

| Parameter | Value |
|-----------|-------|
| Range | 40m (@10% reflectivity), 70m (@80%) |
| FOV | 360 x 59 deg (-7 to +52 deg) |
| Point Rate | 200,000 pts/s |
| Scanning Method | Non-repetitive rotating prism |
| Accuracy | +/-2cm (@0.2m-10m) |
| Returns | Dual return |
| Built-in IMU | 6-axis, 200Hz |
| Interface | 100M Ethernet |
| Size | 63.18mm diameter x 47.98mm |
| Weight | ~265g |
| Power | 5.5W (typical) |
| Protection | IP67 |
| Operating Temperature | -20 to +55 deg C |
| Price | ~$1,099 |

### Non-Repetitive Scanning Pattern

<!-- SVG-DESIGN-NOTES
Type: C (过程 — 非重复扫描覆盖率 small multiples + 指数饱和曲线)
Q0: Livox 的 rosette/lissajous 非重复扫描在 50ms 覆盖 ~25%、100ms ~45%、200ms ~75%、500ms ≈ 95%;覆盖率服从 1-exp(-λT) 指数曲线,等效分辨率随时间从 "线扫" 提升到 "面扫"。
Q1: 4 frame small multiples (圆形 FOV 内 lissajous 散点累积) + 下方 1-exp(-λT) 曲线带 4 个时间 tick;不是 4 个等大方框
Q2: 四圆中花瓣型扫描点云密度递增 + 指数曲线 — DNA 是非重复扫描的统计填充
Q3: 删 4 个等大方框 + 3 根箭头
Q4: 时间/覆盖率直接标在散点圆和曲线上
Q5: 全 var(--dia-*)
-->
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
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Livox non-repetitive scan — FOV coverage accumulating over integration time</text>
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
  <text x="600" y="143" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke)">≈ full coverage</text>
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
<p class="figure-caption">Figure 2 — Coverage of non-repetitive scanning is an exponential saturation curve; growth peaks within the first 100 ms and the marginal benefit drops sharply after 500 ms — the engineering reason behind Livox's default 100 ms integration window.</p>


As integration time increases, the scan pattern gradually fills the entire FOV, with equivalent resolution continuously improving. This is the core advantage of Livox over traditional line-scanning LiDARs.

### Typical Applications

- **Quadruped robots**: Lightweight, 360-deg FOV, built-in IMU, suitable for FAST-LIO2/Point-LIO
- **Drone mapping**: Lightweight, low power
- **Service robots**: 3D perception and obstacle avoidance
- **Low-speed autonomous driving**: Campus logistics vehicles, delivery robots

## Technology Route Comparison

| Technology Route | Maturity | Cost | Performance | Mass Production Difficulty | Main Bottleneck |
|-----------------|----------|------|-------------|---------------------------|----------------|
| MEMS Micro-Mirror | 4/5 | Medium | Good | Medium | Mirror reliability |
| Prism Rotation | 4/5 | Low | Good | Low | Not purely solid-state |
| Flash | 3/5 | Low | Medium (short range) | Low | Range limitation |
| OPA | 2/5 | High | High potential | High | Power, sidelobes |
| FMCW | 3/5 | High | Excellent | High | System complexity |

## Future Trends for Solid-State LiDAR

1. **Cost reduction**: As production scales up, automotive-grade solid-state LiDAR prices will drop to $200-$500
2. **Chipification**: Integrating emitter, scanner, receiver, and processor into a single chip (SoC LiDAR)
3. **FMCW adoption**: 4D LiDAR (range + velocity) will become the next-generation standard
4. **Camera fusion**: Integrating LiDAR and camera in the same sensor module
5. **1550nm wavelength**: Eye-safe + higher power = longer range

## References

- Livox Technical White Paper: https://www.livoxtech.com
- *LiDAR Technologies and Systems* - SPIE
- Aeva FMCW Technical Documentation
- RoboSense RS-M1 Product Specifications
- Hesai FT120 Technical Data
