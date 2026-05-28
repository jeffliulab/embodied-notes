# LiDAR Overview

## What Is LiDAR

LiDAR (Light Detection and Ranging) is an active sensing technology that measures distances using laser pulses. It constructs precise 3D models of the environment by emitting lasers and receiving reflected signals, making it one of the most important sensors in robot perception systems.

## Ranging Principles

### Time-of-Flight (ToF)

The most fundamental LiDAR ranging principle. A short laser pulse is emitted, and its round-trip time is measured:

$$
d = \frac{c \cdot t}{2}
$$

Where:

- $d$ is the target distance
- $c$ is the speed of light ($\approx 3 \times 10^8 \, \text{m/s}$)
- $t$ is the round-trip time of the laser pulse

**Characteristics**:

- Simple principle, mature implementation
- Large ranging distance (up to hundreds of meters)
- Accuracy limited by time measurement resolution ($\Delta d = \frac{c \cdot \Delta t}{2}$)
- Widely used in mechanical LiDARs (e.g., Velodyne)

### Phase-Shift Method

Emits a continuously modulated laser and calculates distance by measuring the phase difference between emitted and reflected signals:

$$
d = \frac{c \cdot \Delta\varphi}{4\pi f}
$$

Where:

- $\Delta\varphi$ is the phase difference
- $f$ is the modulation frequency

**Characteristics**:

- Higher accuracy (millimeter-level)
- Relatively shorter ranging distance
- Needs to resolve phase ambiguity (multi-frequency modulation)
- Commonly used in industrial measurement-grade LiDARs

### Frequency-Modulated Continuous Wave (FMCW)

Emits a continuous laser whose frequency varies linearly with time. Distance is determined by the beat frequency between the reflected signal and a local reference signal:

$$
d = \frac{c \cdot f_{\text{beat}}}{2B / T}
$$

Where:

- $f_{\text{beat}}$ is the beat frequency
- $B$ is the frequency sweep bandwidth
- $T$ is the sweep period

**Characteristics**:

- Can simultaneously obtain distance and velocity information (Doppler effect)
- Strong resistance to ambient light interference
- High ranging accuracy
- High technical complexity and cost
- Representatives: Aeva, SiLC Technologies

## LiDAR Type Classification

### By Scanning Method

<!-- SVG-DESIGN-NOTES
Type: D (量化 — LiDAR 产品在 测距 × FOV 平面上的分布,scan 机制用颜色编码)
Q0: 不同 LiDAR 类型不是树状分类,而是占据 测距 × FOV 平面上的不同生态位:Mechanical旋转 (Velodyne) 守 100m+ × 360°,Half-solid (Livox/RoboSense) 占 40-70m × 100°,Flash 短距 (<30m) 但 帧率最高,OPA 仍在原点;FMCW 多走长距 + 高精度。
Q1: x = 最大测距 m (log 10..300), y = horizontal FOV ° (linear 0..360);7-9 个真实产品气泡,色编码 = scan 机制
Q2: 去掉标题:产品散点 + 三个生态位区域 — DNA 是 LiDAR 选型平面
Q3: 删 13 个等大方框 + 9 根树状箭头
Q4: 每气泡旁直接标产品名
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">LiDAR types — range × horizontal-FOV niches</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">color = scan mechanism · bubble area ∝ point rate (pts/s)</text>

  <!-- axes: x log 10..300m maps [80..680]; y FOV 0..360° maps [350..70] -->
  <line x1="80" y1="350" x2="680" y2="350" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="350" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="348" x2="80"  y2="354"/><text x="80"  y="368" text-anchor="middle">10 m</text>
    <line x1="200" y1="348" x2="200" y2="354"/><text x="200" y="368" text-anchor="middle">30</text>
    <line x1="320" y1="348" x2="320" y2="354"/><text x="320" y="368" text-anchor="middle">50</text>
    <line x1="440" y1="348" x2="440" y2="354"/><text x="440" y="368" text-anchor="middle">100</text>
    <line x1="560" y1="348" x2="560" y2="354"/><text x="560" y="368" text-anchor="middle">200</text>
    <line x1="680" y1="348" x2="680" y2="354"/><text x="680" y="368" text-anchor="middle">300 m</text>

    <line x1="76" y1="350" x2="84" y2="350"/><text x="72" y="354" text-anchor="end">0°</text>
    <line x1="76" y1="287" x2="84" y2="287"/><text x="72" y="291" text-anchor="end">60°</text>
    <line x1="76" y1="225" x2="84" y2="225"/><text x="72" y="229" text-anchor="end">120°</text>
    <line x1="76" y1="162" x2="84" y2="162"/><text x="72" y="166" text-anchor="end">240°</text>
    <line x1="76" y1="80"  x2="84" y2="80" /><text x="72" y="84"  text-anchor="end">360°</text>
  </g>
  <text x="380" y="390" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">max range m (log)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">horizontal FOV °</text>

  <!-- ecosystem zones (shaded) -->
  <rect x="430" y="74" width="240" height="50" fill="var(--dia-green)" fill-opacity="0.08"/>
  <text x="550" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">Mechanical spin — long range 360°</text>
  <rect x="200" y="180" width="320" height="80" fill="var(--dia-blue)" fill-opacity="0.07"/>
  <text x="358" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">Half-solid — mid range 100-360°</text>
  <rect x="80" y="280" width="280" height="65" fill="var(--dia-accent)" fill-opacity="0.07"/>
  <text x="215" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">Flash short range · OPA exploratory</text>

  <!-- bubbles: scan mech color encoding -->
  <!-- Mechanical (green): Velodyne VLP-16 100m × 360°, x=440 y=80 r=14 -->
  <circle cx="440" cy="80" r="14" fill="var(--dia-green)" fill-opacity="0.55" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="425" y="64" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Velodyne VLP-16</text>

  <!-- Ouster OS1 120m × 360°, x=470 y=80 r=14 -->
  <circle cx="490" cy="80" r="14" fill="var(--dia-green)" fill-opacity="0.55" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="500" y="76" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Ouster OS1</text>

  <!-- Hesai Pandar 200m × 360° -->
  <circle cx="565" cy="80" r="16" fill="var(--dia-green)" fill-opacity="0.55" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="585" y="76" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Hesai Pandar64</text>

  <!-- Half-solid: Livox Mid-360 40m × 360° -->
  <circle cx="260" cy="80" r="12" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.5"/>
  <text x="120" y="76" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Livox Mid-360</text>

  <!-- RoboSense RS-M1 (MEMS): 150m × 120°, x=510 y=225 r=13 -->
  <circle cx="510" cy="225" r="13" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.5"/>
  <text x="498" y="216" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">RS-M1 (MEMS)</text>

  <!-- Innoviz InnovizTwo: 250m × 120°, x=600 y=225 r=13 -->
  <circle cx="610" cy="225" r="13" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.5"/>
  <text x="603" y="216" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">InnovizTwo</text>

  <!-- Flash (accent): Apple iPad LiDAR 5m × 70°, x=120 y=315 r=12 (high frame rate) -->
  <circle cx="120" cy="315" r="16" fill="var(--dia-accent)" fill-opacity="0.6" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="100" y="335" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Apple iPad Flash</text>

  <!-- Continental Flash: 50m × 120°, x=320 y=225 r=14 -->
  <circle cx="320" cy="225" r="14" fill="var(--dia-accent)" fill-opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="305" y="216" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Continental Flash</text>

  <!-- OPA Quanergy (gold for FMCW or different stroke for stalled): 100m × 60°, x=440 y=315 r=8 small (R&D) -->
  <circle cx="440" cy="315" r="8" fill="var(--dia-accent)" fill-opacity="0.3" stroke="var(--dia-accent)" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="452" y="318" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">OPA · R&amp;D</text>

  <!-- FMCW (gold): Aeva Aeries II 300m × 120° -->
  <circle cx="680" cy="225" r="13" fill="var(--dia-gold)" fill-opacity="0.55" stroke="var(--dia-gold)" stroke-width="1.5"/>
  <text x="615" y="240" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Aeva Aeries II (FMCW)</text>

  <!-- legend top right -->
  <g font-family="Fraunces, Georgia, serif" font-size="10">
    <circle cx="85" cy="105" r="4" fill="var(--dia-green)" fill-opacity="0.7"/>
    <text x="93" y="108" fill="var(--dia-stroke-soft)">Mechanical</text>
    <circle cx="85" cy="123" r="4" fill="var(--dia-blue)" fill-opacity="0.7"/>
    <text x="93" y="126" fill="var(--dia-stroke-soft)">Half-solid</text>
    <circle cx="85" cy="141" r="4" fill="var(--dia-accent)" fill-opacity="0.7"/>
    <text x="93" y="144" fill="var(--dia-stroke-soft)">Flash / OPA</text>
    <circle cx="85" cy="159" r="4" fill="var(--dia-gold)" fill-opacity="0.7"/>
    <text x="93" y="162" fill="var(--dia-stroke-soft)">FMCW</text>
  </g>
</svg>
</div>
<p class="figure-caption">Figure 1 — 三个Mechanical/Half-solid/Flash 生态位在 测距-FOV 平面上呈梯度分布;长距 360° 是Mechanical式护城河,Half-solid主攻车规中距,Flash 守短距高帧率。</p>


### Mechanical Rotating LiDAR

| Feature | Description |
|---------|-------------|
| Principle | Laser emitter/receiver module rotates with a motor |
| FOV | Horizontal 360 degrees, vertical depends on number of lines |
| Advantages | Omnidirectional scanning, mature technology |
| Disadvantages | Mechanical wear, large size, high cost |
| Representative | Velodyne VLP-16/32/64/128 |

### Semi-Solid-State LiDAR

| Feature | Description |
|---------|-------------|
| Principle | Small mirror or prism scanning |
| FOV | Limited angle (typically 60-120 degrees) |
| Advantages | Small size, higher reliability |
| Disadvantages | Limited FOV |
| Representative | Livox Mid-360, HAP |

### Pure Solid-State LiDAR

| Feature | Description |
|---------|-------------|
| Principle | No moving parts whatsoever |
| FOV | Limited angle |
| Advantages | High reliability, low cost potential, mass-producible |
| Disadvantages | Technology still maturing |
| Representative | Cepton, Ibeo |

## Key Performance Metrics

| Metric | Description | Typical Range |
|--------|------------|---------------|
| **Range** | Maximum detectable distance | 12m (low-end) - 300m+ (high-end) |
| **Range Accuracy** | Distance measurement error | +/-1cm - +/-3cm |
| **Angular Resolution** | Angle between adjacent scan lines/points | 0.1 - 2 degrees |
| **Field of View (FOV)** | Horizontal and vertical scan range | H: 60-360 deg, V: 15-90 deg |
| **Scan Frequency** | Scans completed per second | 5Hz - 20Hz |
| **Point Rate** | Points generated per second | 10K - 2.4M points/s |
| **Number of Returns** | Returns per pulse | 1 - 5 |
| **Wavelength** | Laser wavelength | 905nm (near-IR) or 1550nm (eye-safe) |
| **Power Consumption** | Operating power | 5W - 30W |
| **Protection Rating** | Environmental protection | IP65 - IP69K |

## LiDAR Selection for Different Robot Platforms

### Indoor Mobile Robots / Robot Vacuums

- **Recommended**: 2D LiDAR (RPLIDAR A1/A2, YDLIDAR X4)
- **Reason**: Low cost, low power; 2D SLAM sufficient for navigation
- **Typical setup**: Single-line 360-degree LiDAR mounted on top of the robot

### Service Robots / AGVs

- **Recommended**: 2D LiDAR (safety-rated) + optional 3D LiDAR
- **Reason**: Safety certification needed (e.g., SICK TiM series); obstacle avoidance requirements
- **Typical setup**: One safety LiDAR front and rear + top navigation LiDAR

### Autonomous Driving Vehicles

- **Recommended**: Multi-line 3D LiDAR or solid-state LiDAR combinations
- **Reason**: High-precision 3D environment perception, long-range detection needed
- **Typical setup**: Main LiDAR on roof + corner blind-spot LiDARs

### Drones

- **Recommended**: Lightweight solid-state LiDAR (e.g., Livox Mid-360)
- **Reason**: Weight and power constraints
- **Typical setup**: Downward or forward-facing mount

### Quadruped Robots

- **Recommended**: Lightweight 3D LiDAR (Livox Mid-360, Ouster OS0)
- **Reason**: Dynamic environment perception, terrain mapping
- **Typical setup**: Head or back-mounted

## LiDAR Data Processing Pipeline

<!-- SVG-DESIGN-NOTES
Type: C (过程 — 100ms 帧周期内的处理时序 waterfall)
Q0: 10 Hz LiDAR 一帧 100ms,处理阶段并不是平行;时序 waterfall 显示:数据采集 占满 100ms (连续旋转),预处理 1-5ms (运动补偿同步在 IMU 间隔),特征提取 15ms,SLAM 25ms,目标检测 30ms;输出在 frame_end + 70ms 才到 /local_costmap,这是 LiDAR 系统的真实端到端延迟。
Q1: 横向 time waterfall (0-150 ms); 4 个 lane: sensor / preprocess / features / apps; 每 stage 一根带圆角矩形 + start/end time tick
Q2: 时间轴 + 阶段带 = 真实 ROS 节点时序 — DNA 是 10Hz LiDAR 延迟图
Q3: 删 15 个等大方框 + 14 根分叉箭头
Q4: 每阶段起止 ms 直标
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">10 Hz LiDAR frame end-to-end timing — 100 ms frame + 70 ms pipeline lag</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Velodyne VLP-16 + LIO-SAM stack on Jetson Orin · 4 lanes</text>

  <!-- horizontal time axis -->
  <line x1="80" y1="320" x2="720" y2="320" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="318" x2="80"  y2="326"/><text x="80"  y="338" text-anchor="middle">0</text>
    <line x1="240" y1="318" x2="240" y2="326"/><text x="240" y="338" text-anchor="middle">50</text>
    <line x1="400" y1="318" x2="400" y2="326"/><text x="400" y="338" text-anchor="middle">100 ms (next frame)</text>
    <line x1="560" y1="318" x2="560" y2="326"/><text x="560" y="338" text-anchor="middle">150</text>
    <line x1="720" y1="318" x2="720" y2="326"/><text x="720" y="338" text-anchor="middle">200 ms</text>
  </g>
  <!-- frame boundary vertical lines -->
  <line x1="400" y1="60" x2="400" y2="320" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="3 3"/>

  <!-- 4 lanes -->
  <g font-family="Fraunces, Georgia, serif" font-size="11">
    <text x="74" y="84" text-anchor="end" fill="var(--dia-stroke)">sensor</text>
    <text x="74" y="148" text-anchor="end" fill="var(--dia-stroke)">preprocess</text>
    <text x="74" y="212" text-anchor="end" fill="var(--dia-stroke)">features</text>
    <text x="74" y="276" text-anchor="end" fill="var(--dia-stroke)">apps</text>
  </g>
  <line x1="80" y1="100" x2="720" y2="100" stroke="var(--dia-stroke-soft)" stroke-width="0.4" stroke-dasharray="2 4"/>
  <line x1="80" y1="164" x2="720" y2="164" stroke="var(--dia-stroke-soft)" stroke-width="0.4" stroke-dasharray="2 4"/>
  <line x1="80" y1="228" x2="720" y2="228" stroke="var(--dia-stroke-soft)" stroke-width="0.4" stroke-dasharray="2 4"/>

  <!-- sensor lane: continuous spinning 0-100ms + next frame 100-200 ms (different color) -->
  <rect x="80" y="72" width="320" height="22" rx="3" fill="var(--dia-accent)" fill-opacity="0.65" stroke="var(--dia-accent)" stroke-width="1"/>
  <text x="240" y="87" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">VLP-16 spin · 100 ms</text>
  <rect x="400" y="72" width="320" height="22" rx="3" fill="var(--dia-accent)" fill-opacity="0.35" stroke="var(--dia-accent)" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="560" y="87" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">frame N+1 (overlapped)</text>

  <!-- preprocess lane: 100-115 ms motion-compensation + filter -->
  <rect x="400" y="136" width="48" height="22" rx="3" fill="var(--dia-green)" fill-opacity="0.7" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="424" y="151" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">deskew</text>
  <text x="424" y="172" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">100-115</text>

  <rect x="448" y="136" width="32" height="22" rx="3" fill="var(--dia-green)" fill-opacity="0.5" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="464" y="151" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">filter</text>

  <!-- features lane: 115-150 ms (35 ms) -->
  <rect x="480" y="200" width="80" height="22" rx="3" fill="var(--dia-blue)" fill-opacity="0.65" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="520" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">edge / planar feats</text>
  <text x="520" y="236" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">125-160 (35 ms)</text>

  <!-- apps lane: 150-170 SLAM + parallel object det 150-200 -->
  <rect x="560" y="264" width="80" height="22" rx="3" fill="var(--dia-gold)" fill-opacity="0.7" stroke="var(--dia-gold)" stroke-width="1.2"/>
  <text x="600" y="279" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">LIO-SAM scan-to-map</text>
  <text x="600" y="300" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">160-180</text>

  <rect x="560" y="288" width="80" height="14" rx="3" fill="var(--dia-gold)" fill-opacity="0.4" stroke="var(--dia-gold)" stroke-width="0.8"/>
  <text x="676" y="298" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">PointPillars (GPU)</text>

  <!-- annotations: end-to-end latency arrow -->
  <line x1="80" y1="62" x2="640" y2="62" stroke="var(--dia-accent)" stroke-width="0.8" stroke-dasharray="4 3"/>
  <line x1="80" y1="58" x2="80" y2="66" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <line x1="640" y1="58" x2="640" y2="66" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="360" y="59" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-accent)">End-to-end latency ≈ 170 ms · the control loop sees LiDAR data already 1.7 frames stale</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — 10 Hz LiDAR ≠ 100 ms response; the real end-to-end latency to the controller is ≈ 170 ms — about 1.7 frames of stale data.</p>


## Laser Safety Classes

| Class | Description | LiDAR Application |
|-------|------------|-------------------|
| Class 1 | Safe under all operating conditions | Most consumer/industrial LiDARs |
| Class 1M | Safe for naked eye, potentially unsafe with optical instruments | Some long-range LiDARs |
| Class 3R | Low risk of direct viewing | Few high-power measurement LiDARs |

!!! warning "Eye Safety"
    905nm wavelength LiDARs must strictly control power to ensure eye safety. 1550nm wavelength is safer for human eyes (absorbed by the cornea rather than reaching the retina), but detector costs are higher.

## Comparison with Other Sensors

| Feature | LiDAR | Camera | mmWave Radar | Ultrasonic |
|---------|-------|--------|-------------|------------|
| Accuracy | High (cm-level) | Medium | Medium | Low |
| Range | Far (~300m) | Far | Far (~250m) | Near (~5m) |
| 3D Information | Native 3D | Requires algorithms | Limited | No |
| Affected by Lighting | Slightly | Severely | No | No |
| Affected by Weather | Rain/fog significant | Rain/fog significant | Better | Better |
| Cost | High | Low | Medium | Very low |
| Texture/Color | No | Yes | No | No |
| Power | Medium | Low | Low | Very low |

## References

- Velodyne LiDAR Technical White Papers
- Livox Technical Documentation
- *Introduction to Autonomous Mobile Robots* - Siegwart et al.
- ROS2 LiDAR Driver Package Documentation
