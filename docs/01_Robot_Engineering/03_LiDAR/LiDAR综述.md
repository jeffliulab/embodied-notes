# LiDAR 综述

## 什么是 LiDAR

LiDAR（Light Detection and Ranging，光探测与测距）是一种利用激光脉冲测量距离的主动传感技术。它通过发射激光并接收反射信号来构建环境的精确三维模型，是机器人感知系统中最重要的传感器之一。

## 测距原理

### 飞行时间法（Time-of-Flight, ToF）

最基本的 LiDAR 测距原理。发射一个短激光脉冲，测量其往返时间：

$$
d = \frac{c \cdot t}{2}
$$

其中：

- $d$ 为目标距离
- $c$ 为光速（$\approx 3 \times 10^8 \, \text{m/s}$）
- $t$ 为激光脉冲往返时间

**特点**：

- 原理简单、实现成熟
- 测距范围大（可达数百米）
- 精度受时间测量分辨率限制（$\Delta d = \frac{c \cdot \Delta t}{2}$）
- 广泛应用于机械式 LiDAR（如 Velodyne）

### 相位差法（Phase-Shift）

发射连续调制的激光，通过测量发射与反射信号的相位差来计算距离：

$$
d = \frac{c \cdot \Delta\varphi}{4\pi f}
$$

其中：

- $\Delta\varphi$ 为相位差
- $f$ 为调制频率

**特点**：

- 精度较高（毫米级）
- 测距范围相对较短
- 需要解决相位模糊问题（多频率调制）
- 常用于工业测量级 LiDAR

### 调频连续波（FMCW）

发射频率随时间线性变化的连续激光，通过反射信号与本地参考信号的拍频来确定距离：

$$
d = \frac{c \cdot f_{\text{beat}}}{2B / T}
$$

其中：

- $f_{\text{beat}}$ 为拍频
- $B$ 为扫频带宽
- $T$ 为扫频周期

**特点**：

- 可同时获取距离和速度信息（多普勒效应）
- 抗环境光干扰能力强
- 测距精度高
- 技术复杂度较高，成本较高
- 代表：Aeva、SiLC Technologies

## LiDAR 类型分类

### 按扫描方式分类

<!-- SVG-DESIGN-NOTES
Type: D (量化 — LiDAR 产品在 测距 × FOV 平面上的分布,scan 机制用颜色编码)
Q0: 不同 LiDAR 类型不是树状分类,而是占据 测距 × FOV 平面上的不同生态位:机械旋转 (Velodyne) 守 100m+ × 360°,半固态 (Livox/RoboSense) 占 40-70m × 100°,Flash 短距 (<30m) 但 帧率最高,OPA 仍在原点;FMCW 多走长距 + 高精度。
Q1: x = 最大测距 m (log 10..300), y = 水平 FOV ° (linear 0..360);7-9 个真实产品气泡,色编码 = scan 机制
Q2: 去掉标题:产品散点 + 三个生态位区域 — DNA 是 LiDAR 选型平面
Q3: 删 13 个等大方框 + 9 根树状箭头
Q4: 每气泡旁直接标产品名
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">LiDAR 类型 — 测距 × 水平 FOV 生态位</text>
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
  <text x="380" y="390" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">最大测距 m (log)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">水平 FOV °</text>

  <!-- ecosystem zones (shaded) -->
  <rect x="430" y="74" width="240" height="50" fill="var(--dia-green)" fill-opacity="0.08"/>
  <text x="550" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">机械旋转 — 长距 360°</text>
  <rect x="200" y="180" width="320" height="80" fill="var(--dia-blue)" fill-opacity="0.07"/>
  <text x="358" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">半固态 — 中距 100-360°</text>
  <rect x="80" y="280" width="280" height="65" fill="var(--dia-accent)" fill-opacity="0.07"/>
  <text x="215" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">Flash 短距 · OPA 探索</text>

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
    <text x="93" y="108" fill="var(--dia-stroke-soft)">机械</text>
    <circle cx="85" cy="123" r="4" fill="var(--dia-blue)" fill-opacity="0.7"/>
    <text x="93" y="126" fill="var(--dia-stroke-soft)">半固态</text>
    <circle cx="85" cy="141" r="4" fill="var(--dia-accent)" fill-opacity="0.7"/>
    <text x="93" y="144" fill="var(--dia-stroke-soft)">Flash / OPA</text>
    <circle cx="85" cy="159" r="4" fill="var(--dia-gold)" fill-opacity="0.7"/>
    <text x="93" y="162" fill="var(--dia-stroke-soft)">FMCW</text>
  </g>
</svg>
</div>
<p class="figure-caption">Figure 1 — 三个机械/半固态/Flash 生态位在 测距-FOV 平面上呈梯度分布;长距 360° 是机械式护城河,半固态主攻车规中距,Flash 守短距高帧率。</p>


### 机械旋转式 LiDAR

| 特性 | 说明 |
|------|------|
| 原理 | 激光发射/接收模块随电机旋转 |
| FOV | 水平 360°，垂直视角取决于线数 |
| 优点 | 全向扫描、技术成熟 |
| 缺点 | 机械磨损、体积大、成本高 |
| 代表 | Velodyne VLP-16/32/64/128 |

### 半固态 LiDAR

| 特性 | 说明 |
|------|------|
| 原理 | 小型振镜或棱镜扫描 |
| FOV | 有限角度（通常 60°–120°） |
| 优点 | 体积小、可靠性较高 |
| 缺点 | FOV 受限 |
| 代表 | Livox Mid-360、HAP |

### 纯固态 LiDAR

| 特性 | 说明 |
|------|------|
| 原理 | 无任何运动部件 |
| FOV | 有限角度 |
| 优点 | 高可靠性、低成本潜力、可量产 |
| 缺点 | 技术尚在成熟中 |
| 代表 | Cepton、Ibeo |

## 关键性能指标

| 指标 | 说明 | 典型范围 |
|------|------|----------|
| **测距范围** | 最大可检测距离 | 12m（低端）– 300m+（高端） |
| **测距精度** | 距离测量误差 | ±1cm – ±3cm |
| **角分辨率** | 相邻扫描线/点之间的角度 | 0.1° – 2° |
| **视场角（FOV）** | 水平和垂直扫描范围 | 水平 60°–360°，垂直 15°–90° |
| **扫描频率** | 每秒完成扫描的圈数 | 5Hz – 20Hz |
| **点频** | 每秒产生的点数 | 10K – 2.4M points/s |
| **回波数** | 每个脉冲的回波数量 | 1 – 5 |
| **波长** | 激光波长 | 905nm（近红外）或 1550nm（人眼安全） |
| **功耗** | 工作功率 | 5W – 30W |
| **防护等级** | 环境防护 | IP65 – IP69K |

## 不同机器人平台的 LiDAR 选择

### 室内移动机器人 / 扫地机器人

- **推荐**：2D LiDAR（RPLIDAR A1/A2、YDLIDAR X4）
- **原因**：成本低、功耗小、2D SLAM 即可满足导航需求
- **典型配置**：单线 360° LiDAR 安装在机器人顶部

### 服务机器人 / AGV

- **推荐**：2D LiDAR（安全级）+ 可选 3D LiDAR
- **原因**：需要安全认证（如 SICK TiM 系列）、避障需求
- **典型配置**：前后各一个安全 LiDAR + 顶部导航 LiDAR

### 自动驾驶车辆

- **推荐**：多线 3D LiDAR 或固态 LiDAR 组合
- **原因**：需要高精度 3D 环境感知、远距离检测
- **典型配置**：车顶主 LiDAR + 四角补盲 LiDAR

### 无人机

- **推荐**：轻量化固态 LiDAR（如 Livox Mid-360）
- **原因**：重量限制、功耗限制
- **典型配置**：下视或前视安装

### 四足机器人

- **推荐**：轻量 3D LiDAR（Livox Mid-360、Ouster OS0）
- **原因**：动态环境感知、地形建图
- **典型配置**：头部或背部安装

## LiDAR 数据处理流程

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
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">10 Hz LiDAR 帧端到端处理时序 — 100ms 帧 + 70ms 流水延迟</text>
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
  <text x="360" y="59" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-accent)">端到端延迟 ≈ 170 ms · 控制环看到的 LiDAR 数据已过 1.7 帧</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — 10 Hz LiDAR 不等于 "100ms 响应";流水线尾端到控制器的真实延迟 ≈ 170 ms — 等于 1.7 帧的"陈旧数据"。</p>


## 激光安全等级

| 等级 | 说明 | LiDAR 应用 |
|------|------|-----------|
| Class 1 | 在所有操作条件下安全 | 大部分消费级/工业级 LiDAR |
| Class 1M | 裸眼安全，光学仪器观察可能不安全 | 部分远距离 LiDAR |
| Class 3R | 直接观察有低风险 | 少数高功率测量 LiDAR |

!!! warning "人眼安全"
    905nm 波长 LiDAR 需要严格控制功率以保证人眼安全。1550nm 波长对人眼更安全（被角膜吸收而非到达视网膜），但探测器成本更高。

## 与其他传感器的对比

| 特性 | LiDAR | 相机 | 毫米波雷达 | 超声波 |
|------|-------|------|-----------|--------|
| 精度 | 高（cm级） | 中等 | 中等 | 低 |
| 范围 | 远（~300m） | 远 | 远（~250m） | 近（~5m） |
| 3D 信息 | ✅ 原生3D | 需要算法 | 有限 | ❌ |
| 受光照影响 | 轻微 | 严重 | ❌ | ❌ |
| 受天气影响 | 雨雾影响大 | 雨雾影响大 | 较好 | 较好 |
| 成本 | 高 | 低 | 中等 | 很低 |
| 纹理/颜色 | ❌ | ✅ | ❌ | ❌ |
| 功耗 | 中等 | 低 | 低 | 很低 |

## 参考资料

- Velodyne LiDAR 技术白皮书
- Livox 技术文档
- 《Introduction to Autonomous Mobile Robots》 - Siegwart et al.
- ROS2 LiDAR 驱动包文档
