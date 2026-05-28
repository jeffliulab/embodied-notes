# IMU Overview

## What Is an IMU

An IMU (Inertial Measurement Unit) is a sensor module that measures the acceleration and angular velocity of an object. It is one of the core sensors for robot navigation, attitude estimation, and motion control, found in virtually all mobile robot platforms.

## Sensor Components

### Accelerometer

**Principle**: Based on a MEMS spring-mass system. When the sensor accelerates, the proof mass displaces due to inertia, and the displacement is detected via capacitance changes.

$$
F = ma \quad \Rightarrow \quad a = \frac{F}{m} = \frac{k \cdot \Delta x}{m}
$$

Where:

- $k$ is the spring stiffness
- $\Delta x$ is the proof mass displacement
- $m$ is the proof mass

**Measurement**: Specific force, i.e., gravity + motion acceleration:

$$
\mathbf{f} = \mathbf{a} - \mathbf{g}
$$

!!! warning "Effect of Gravity"
    An accelerometer at rest measures the gravitational acceleration $g \approx 9.81 \, \text{m/s}^2$. When using an accelerometer for navigation, the gravity component must be subtracted from the measurement, which requires precise knowledge of the sensor's attitude.

### Gyroscope

**Principle**: Based on the Coriolis effect. A vibrating proof mass in a rotating reference frame experiences a Coriolis force:

$$
\mathbf{F}_c = -2m(\boldsymbol{\omega} \times \mathbf{v})
$$

Where:

- $m$ is the vibrating mass
- $\boldsymbol{\omega}$ is the angular velocity
- $\mathbf{v}$ is the vibration velocity

MEMS gyroscopes keep a proof mass vibrating in one direction. When rotation exists, the Coriolis force produces displacement in the perpendicular direction, detected via capacitance to obtain angular velocity.

**Measurement**: Three-axis angular velocity $(\omega_x, \omega_y, \omega_z)$, in deg/s or rad/s.

### Magnetometer

**Principle**: Uses the Hall effect or magnetoresistive effect to measure the Earth's magnetic field direction.

**Measurement**: Three-axis magnetic field strength, used to compute heading (Yaw).

**Limitations**:

- Interfered by ferromagnetic materials (hard iron/soft iron errors)
- Indoor magnetic fields are non-uniform
- Requires calibration (ellipsoid fitting)

### IMU Configuration Classification

| Type | Sensor Combination | Measurable Quantities | Representative Products |
|------|-------------------|----------------------|------------------------|
| **6-axis** | Accelerometer + Gyroscope | Acceleration, angular velocity | MPU6050, BMI088 |
| **9-axis** | Accelerometer + Gyroscope + Magnetometer | Acceleration, angular velocity, heading | BNO055, MPU9250 |
| **10-axis** | 9-axis + Barometer | Above + altitude estimation | BMP388 combo |

## IMU Noise Model

IMU accuracy is affected by multiple noise sources. Understanding the noise model is crucial for sensor fusion.

### Main Noise Types

<!-- SVG-DESIGN-NOTES
Type: B (几何 — IMU 噪声 Allan 方差曲线: 5 段不同斜率)
Q0: IMU 噪声不是 8 个并列的"分类项",而是一条 σ(τ) 曲线上的 5 段斜率特征 — Quantization (-1)、ARW (-1/2)、BI (0)、RRW (+1/2)、Rate Ramp (+1);整条曲线就是"读 datasheet 时直接对应噪声参数"的工程图。
Q1: log-log Allan deviation 曲线 + 5 段斜率虚线 + 关键参数 (ARW 在 τ=1, BI 在 minimum) 直接标在曲线上
Q2: 一条 U 形 + 5 段斜率参考线 — DNA 是"读 IMU datasheet"的标尺
Q3: 删 9 个等大方框 + 8 根树状箭头 (原图把噪声分类当成树)
Q4: ARW 值 / BI 值 直接贴在曲线对应点
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">IMU gyro Allan-variance curve — 5 slope regions for 5 noise types</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">log σ(τ) vs log τ · MPU6050 typical at 1 kHz, 25°C</text>

  <!-- axes: x = log τ 0.001s..10000s maps [80..680]; y = log σ deg/h 0.01..1000 maps [340..70] -->
  <line x1="80" y1="340" x2="680" y2="340" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="340" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="338" x2="80"  y2="344"/><text x="80"  y="358" text-anchor="middle">10⁻³</text>
    <line x1="166" y1="338" x2="166" y2="344"/><text x="166" y="358" text-anchor="middle">0.01</text>
    <line x1="252" y1="338" x2="252" y2="344"/><text x="252" y="358" text-anchor="middle">0.1</text>
    <line x1="337" y1="338" x2="337" y2="344"/><text x="337" y="358" text-anchor="middle">1 s</text>
    <line x1="423" y1="338" x2="423" y2="344"/><text x="423" y="358" text-anchor="middle">10</text>
    <line x1="509" y1="338" x2="509" y2="344"/><text x="509" y="358" text-anchor="middle">100</text>
    <line x1="594" y1="338" x2="594" y2="344"/><text x="594" y="358" text-anchor="middle">1k</text>
    <line x1="680" y1="338" x2="680" y2="344"/><text x="680" y="358" text-anchor="middle">10k s</text>

    <line x1="76" y1="340" x2="84" y2="340"/><text x="72" y="344" text-anchor="end">0.01</text>
    <line x1="76" y1="285" x2="84" y2="285"/><text x="72" y="289" text-anchor="end">0.1</text>
    <line x1="76" y1="230" x2="84" y2="230"/><text x="72" y="234" text-anchor="end">1</text>
    <line x1="76" y1="175" x2="84" y2="175"/><text x="72" y="179" text-anchor="end">10</text>
    <line x1="76" y1="120" x2="84" y2="120"/><text x="72" y="124" text-anchor="end">100</text>
    <line x1="76" y1="65"  x2="84" y2="65" /><text x="72" y="69"  text-anchor="end">1000 °/h</text>
  </g>
  <text x="380" y="380" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">averaging time τ (s, log)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">Allan deviation σ(τ) °/h (log)</text>

  <!-- 5-slope dashed reference lines (translucent) -->
  <!-- slope -1 (quantization): goes from upper left -->
  <line x1="80" y1="100" x2="252" y2="285" stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.55"/>
  <text x="100" y="95" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">slope −1 · Quantization</text>

  <!-- slope -1/2 (ARW): -->
  <line x1="166" y1="170" x2="423" y2="240" stroke="var(--dia-blue)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="190" y="160" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">slope −1/2 · ARW white noise</text>

  <!-- slope 0 (BI): horizontal -->
  <line x1="337" y1="220" x2="509" y2="220" stroke="var(--dia-green)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="408" y="212" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">slope 0 · BI bias instability</text>

  <!-- slope +1/2 (RRW): -->
  <line x1="509" y1="222" x2="680" y2="170" stroke="var(--dia-accent)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="600" y="200" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">slope +1/2 · RRW</text>

  <!-- slope +1 (rate ramp): far right rising -->
  <line x1="594" y1="180" x2="680" y2="100" stroke="var(--dia-gold)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="588" y="108" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">slope +1 · Rate Ramp</text>

  <!-- main curve: U-shaped, passing through all 5 regions -->
  <!-- 0.001 s: σ ≈ 100 (quant) → y=120
       0.01 s: σ ≈ 30 → y=160
       0.1 s: σ ≈ 10 → y=200
       1 s: σ ≈ 3 (ARW point) → y=235
       10 s: σ ≈ 1.2 → y=265
       100 s: σ ≈ 1 (BI minimum) → y=270
       1000 s: σ ≈ 1.4 → y=265
       10000 s: σ ≈ 5 → y=210 -->
  <path d="M 80 120 C 130 145 160 170 252 200 C 300 215 320 225 337 235 C 390 252 423 260 470 268 C 500 271 530 271 594 268 C 620 263 650 245 680 210" stroke="var(--dia-stroke)" stroke-width="2.2" fill="none"/>

  <!-- key annotation points -->
  <!-- ARW = σ(τ=1s): -->
  <circle cx="337" cy="235" r="4" fill="var(--dia-blue)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <line x1="337" y1="235" x2="337" y2="340" stroke="var(--dia-blue)" stroke-width="0.5" stroke-dasharray="1 2" opacity="0.5"/>
  <text x="297" y="225" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">ARW</text>
  <text x="295" y="237" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">≈ 3 °/√h</text>

  <!-- BI = curve minimum -->
  <circle cx="465" cy="271" r="4" fill="var(--dia-green)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="478" y="288" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-green)">BI ≈ 0.9 °/h</text>
  <text x="478" y="302" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">datasheet quote</text>

  <!-- ideal asymptote -->
  <text x="370" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">short τ → quantization / white noise dominates · long τ → bias drift dominates</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — One Allan curve compresses IMU noise to two numbers: read ARW at τ=1 s, read BI at the curve minimum — these are the only two noise figures quoted on a datasheet.</p>


### Gyroscope Noise Model

Continuous-time model:

$$
\tilde{\omega}(t) = \omega(t) + b_g(t) + n_g(t)
$$

Where:

- $\tilde{\omega}(t)$ is the measurement
- $\omega(t)$ is the true angular velocity
- $b_g(t)$ is a slowly drifting bias
- $n_g(t)$ is Gaussian white noise, $n_g \sim \mathcal{N}(0, \sigma_g^2)$

Bias modeled as a random walk:

$$
\dot{b}_g(t) = n_{bg}(t), \quad n_{bg} \sim \mathcal{N}(0, \sigma_{bg}^2)
$$

### Accelerometer Noise Model

$$
\tilde{a}(t) = a(t) + b_a(t) + n_a(t)
$$

Similar structure to the gyroscope, but acceleration is integrated twice to obtain position, so errors accumulate faster:

$$
\delta p(t) \propto \frac{1}{2} b_a \cdot t^2 + \frac{1}{6} \sigma_a \cdot t^{5/2}
$$

!!! danger "Drift Problem in Inertial Navigation"
    Position error in pure inertial navigation (IMU only) grows with the square of time. Consumer-grade MEMS IMUs produce meter-level drift within seconds, so they must be fused with other sensors (GPS, LiDAR, vision).

### Key Noise Parameters

| Parameter | Symbol | Unit (Gyro) | Unit (Accel) | Meaning |
|-----------|--------|-------------|-------------|---------|
| Angle/Velocity Random Walk | ARW / VRW | deg/sqrt(h) | m/s/sqrt(h) | White noise intensity |
| Bias Instability | BI | deg/h | ug | Minimum detectable bias change |
| Bias Repeatability | Turn-on bias | deg/h | mg | Bias variation per power-on |
| Scale Factor Error | SF error | ppm | ppm | Proportional measurement error |

## Allan Variance Analysis

Allan variance is the standard method for characterizing IMU noise, identifying noise components by computing variance at different averaging times $\tau$.

$$
\sigma^2(\tau) = \frac{1}{2(N-1)} \sum_{k=1}^{N-1} \left( \bar{y}_{k+1} - \bar{y}_k \right)^2
$$

Where $\bar{y}_k$ is the average of the $k$-th interval of length $\tau$.

### Allan Variance Curve Interpretation

On a $\log \sigma$ vs. $\log \tau$ plot, different noise types correspond to different slopes:

| Noise Type | Slope | Characteristic |
|-----------|-------|---------------|
| Quantization noise | -1 | Appears at short $\tau$ |
| Angle Random Walk (ARW) | -1/2 | White noise, read at $\tau = 1s$ |
| Bias Instability (BI) | 0 | Minimum point of the curve |
| Rate Random Walk (RRW) | +1/2 | Appears at long $\tau$ |
| Rate ramp | +1 | Deterministic trends like temperature drift |

```python
import numpy as np
import allantools

# Compute Allan variance from IMU static data
# data: static samples from one gyroscope axis
# rate: sampling rate (Hz)
(taus, adevs, errors, ns) = allantools.oadev(
    data, rate=rate, data_type="freq"
)

# ARW: Allan deviation at tau=1
# BI: Minimum Allan deviation value
```

## Sensor Fusion Pipeline

<!-- SVG-DESIGN-NOTES
Type: A (结构 — IMU 融合的概率图模型/因子图)
Q0: 多传感器融合不是"加更多框",而是在状态变量 (q, p, v, b) 上挂不同传感器的 likelihood factor;3 个 IMU 传感器 + 3 个外部传感器 = 6 个 factor 共同约束一个 6D 状态,EKF/优化器解后验。
Q1: factor graph: 中心 state node 大圆 (q,p,v,b) + 5 个 sensor factor 小方块 + 4 个外部 measurement factor 三角;边为 likelihood,不同颜色编码不同频率 (IMU 1kHz / VIO 30Hz / LiDAR 10Hz / GPS 1Hz)
Q2: 圆+方块+三角 + 频率粗细的边 — DNA 是融合的概率图
Q3: 删 12 个等大方框 + 12 根串接箭头 (原图是顺序流而非因果图)
Q4: 每边上直接标频率
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">IMU multi-sensor fusion — factor-graph view</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">central state · sensors as likelihood factors · edge thickness ∝ rate</text>

  <!-- center state node: large circle -->
  <circle cx="360" cy="200" r="56" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="2.5"/>
  <text x="360" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-stroke)">state x_k</text>
  <text x="360" y="208" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">(q, p, v, bg, ba)</text>
  <text x="360" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">15-D ESKF state</text>

  <!-- IMU sensor factors (squares - left side, blue tone, thicker edges = 1kHz) -->
  <!-- Gyro factor: top-left -->
  <rect x="92" y="62" width="76" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="130" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Gyroscope</text>
  <text x="130" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">ω̃ · 1 kHz</text>
  <line x1="168" y1="82" x2="316" y2="175" stroke="var(--dia-blue)" stroke-width="2.2" opacity="0.65"/>

  <!-- Accelerometer factor: middle-left -->
  <rect x="60" y="184" width="76" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="98" y="202" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Accelerometer</text>
  <text x="98" y="214" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">ã · 1 kHz</text>
  <line x1="136" y1="201" x2="304" y2="201" stroke="var(--dia-blue)" stroke-width="2.2" opacity="0.65"/>

  <!-- Magnetometer factor: bottom-left, thinner (50 Hz) -->
  <rect x="92" y="304" width="76" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="130" y="322" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Magnetometer</text>
  <text x="130" y="334" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">m̃ · 50 Hz</text>
  <line x1="168" y1="320" x2="316" y2="226" stroke="var(--dia-blue)" stroke-width="1" opacity="0.55"/>

  <!-- External sensor measurement factors (triangles - right side) -->
  <!-- GPS: top-right, 1 Hz thin -->
  <polygon points="612,52 658,102 566,102" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.3"/>
  <text x="612" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">GPS</text>
  <text x="612" y="93" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">1 Hz · p</text>
  <line x1="566" y1="95" x2="408" y2="175" stroke="var(--dia-green)" stroke-width="0.8" opacity="0.55"/>

  <!-- LiDAR: right, 10 Hz medium -->
  <polygon points="628,166 668,206 588,206" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="628" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">LiDAR</text>
  <text x="628" y="202" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">10 Hz · q,p</text>
  <line x1="588" y1="196" x2="416" y2="200" stroke="var(--dia-accent)" stroke-width="1.5" opacity="0.65"/>

  <!-- Camera VIO: bottom-right, 30 Hz thick -->
  <polygon points="612,236 660,280 564,280" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="612" y="258" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Camera</text>
  <text x="612" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">30 Hz · q,p,v</text>
  <line x1="566" y1="260" x2="406" y2="226" stroke="var(--dia-accent)" stroke-width="1.7" opacity="0.65"/>

  <!-- wheel odom: 50 Hz, lower -->
  <polygon points="612,316 654,352 570,352" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="612" y="335" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Wheel odom</text>
  <text x="612" y="347" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">50 Hz · v</text>
  <line x1="572" y1="335" x2="412" y2="240" stroke="var(--dia-green)" stroke-width="1.2" opacity="0.55"/>

  <!-- inset legend box (factor explanation) -->
  <g transform="translate(258, 290)">
    <text x="0" y="0" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">edge stroke-width ∝ measurement rate · IMU high-rate propagate · external low-rate update</text>
    <text x="0" y="16" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">EKF: x̂ = argmax p(x | all sensors) · decoupling fast/slow rhythms</text>
  </g>

  <!-- corner labels -->
  <text x="60" y="58" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">⤺ propagation (high rate)</text>
  <text x="660" y="58" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">update (low rate) ⤻</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — Fusion is not a serial pipeline but a factor graph: IMU propagates state at 1 kHz, external sensors provide measurement constraints at their own rates; thicker edges mean higher weight.</p>


### Attitude Representation

| Representation | Parameters | Advantages | Disadvantages |
|---------------|------------|-----------|---------------|
| Euler angles | 3 | Intuitive | Gimbal lock |
| Rotation matrix | 9 | No singularities | Parameter redundancy |
| Quaternion | 4 | No singularities, computationally efficient | Less intuitive |
| Rotation vector/axis-angle | 3 | Minimal parameterization | Singular near 0 degrees |

Quaternion update:

$$
\mathbf{q}_{k+1} = \mathbf{q}_k \otimes \begin{bmatrix} 1 \\ \frac{1}{2}\boldsymbol{\omega} \Delta t \end{bmatrix}
$$

## IMU Grade Classification

| Grade | Gyro Bias Stability | Representative Product | Application | Price |
|-------|--------------------|-----------------------|-------------|-------|
| Consumer | >10 deg/h | MPU6050, BMI160 | Smartphones, remotes | $1-5 |
| Industrial | 1-10 deg/h | BMI088, ADIS16465 | Drones, robots | $10-100 |
| Tactical | 0.1-1 deg/h | HG1120, STIM300 | Missiles, high-precision navigation | $1K-10K |
| Navigation | <0.01 deg/h | HG9900 | Inertial navigation systems | $50K+ |
| Strategic | <0.001 deg/h | Ring laser gyro | Submarines, ICBMs | $100K+ |

## References

- *Quaternion kinematics for the error-state Kalman filter* - Joan Sola
- *Strapdown Inertial Navigation Technology* - Titterton & Weston
- Bosch BMI088/BNO055 Datasheets
- InvenSense MPU6050 Datasheet
- Allan Variance Analysis Tutorial: IEEE Std 952-1997
