# IMU Selection and Calibration

## Overview

IMU selection directly affects a robot's navigation accuracy and system cost. This article provides a detailed comparison of mainstream MEMS IMU products' performance parameters, as well as essential calibration methods for practical use.

## Mainstream IMU Products

### MPU6050 -- Entry-Level Benchmark

| Parameter | Value |
|-----------|-------|
| Type | 6-axis (accelerometer + gyroscope) |
| Gyro Range | +/-250/500/1000/2000 deg/s |
| Accel Range | +/-2/4/8/16 g |
| Gyro Noise Density | 0.005 deg/s/sqrt(Hz) |
| Accel Noise Density | 400 ug/sqrt(Hz) |
| Interface | I2C (400kHz) / SPI |
| Sample Rate | Up to 1kHz (gyro) / 1kHz (accel) |
| Supply | 2.375-3.46V |
| Size | 4x4x0.9 mm (QFN) |
| Price | ~$2 |

!!! tip "MPU6050 -- Ubiquitous"
    MPU6050 is the most widely used consumer-grade IMU; nearly all Arduino/ESP32 tutorials use it. While performance is modest, the extremely low price and abundant resources make it ideal for learning and prototyping. Note: InvenSense was acquired by TDK; the ICM series is recommended for new projects.

### BNO055 -- Built-In Fusion Algorithm

| Parameter | Value |
|-----------|-------|
| Type | 9-axis (accelerometer + gyroscope + magnetometer) |
| Gyro Range | +/-125/250/500/1000/2000 deg/s |
| Accel Range | +/-2/4/8/16 g |
| Built-in Fusion | Bosch BSX fusion algorithm, directly outputs quaternion/Euler angles |
| Output Rate | Fusion data 100Hz |
| Interface | I2C / UART |
| Supply | 2.4-3.6V |
| Size | 5.2x3.8x1.1 mm (LGA) |
| Price | ~$10-15 |

**BNO055 Advantages**:

- Built-in sensor fusion, no need to write your own Kalman filter
- Direct output: quaternions, Euler angles, linear acceleration (gravity removed), gravity vector
- Automatic calibration status feedback
- Suitable for rapid prototyping

**BNO055 Limitations**:

- Fusion algorithm is a black box, not customizable
- Magnetometer heading affected by strong magnetic interference
- Relatively limited data rate (100Hz)
- Not suitable for tightly-coupled fusion schemes requiring raw IMU data

### BMI088 -- Industrial-Grade Choice

| Parameter | Value |
|-----------|-------|
| Type | 6-axis (accel + gyro, independent chips) |
| Gyro Range | +/-125/250/500/1000/2000 deg/s |
| Accel Range | +/-3/6/12/24 g |
| Gyro Noise Density | 0.014 deg/s/sqrt(Hz) |
| Accel Noise Density | 175 ug/sqrt(Hz) |
| Gyro Bias Stability | ~2 deg/h (typical) |
| Interface | SPI / I2C |
| Sample Rate | Gyro 2kHz, Accel 1.6kHz |
| Supply | 1.2-3.6V |
| Size | 3x4.5x0.95 mm (LGA) |
| Price | ~$5-8 |

!!! info "BMI088 Design Feature"
    BMI088 packages the accelerometer and gyroscope as two independent chips with separate SPI/I2C interfaces. This design prevents interference between the two sensors and allows independent sample rate and range configuration. Widely used in drone flight controllers (e.g., PX4).

### ICM-42688-P -- Next-Generation High Performance

| Parameter | Value |
|-----------|-------|
| Type | 6-axis |
| Gyro Range | +/-15.625/31.25/62.5/125/250/500/1000/2000 deg/s |
| Accel Range | +/-2/4/8/16 g |
| Gyro Noise Density | 0.0028 deg/s/sqrt(Hz) |
| Accel Noise Density | 70 ug/sqrt(Hz) |
| Interface | SPI (24MHz) / I2C |
| Sample Rate | Up to 32kHz |
| Supply | 1.71-3.6V |
| Price | ~$4-6 |

### ADIS16465 -- High-Accuracy Industrial Grade

| Parameter | Value |
|-----------|-------|
| Type | 6-axis |
| Gyro Bias Stability | 2 deg/h (ADIS16465-1) / 0.7 deg/h (-3) |
| Gyro ARW | 0.14 deg/sqrt(h) |
| Accel Bias Stability | 3.2 ug (-1) / 1.5 ug (-3) |
| Interface | SPI |
| Built-in | Delta-theta / Delta-V output, temperature compensation |
| Supply | 3.0-3.6V |
| Price | ~$200-500 |

### STIM300 -- Tactical Grade

| Parameter | Value |
|-----------|-------|
| Type | 9-axis (3 gyros + 3 accels + 3 inclinometers) |
| Gyro Bias Stability | 0.3 deg/h |
| Gyro ARW | 0.15 deg/sqrt(h) |
| Interface | RS422 |
| Supply | 5V |
| Operating Temperature | -40 to +85 deg C |
| Price | ~$3,000-5,000 |

## Comprehensive Comparison

| Product | Type | Gyro Noise Density | Bias Stability | Interface | Sample Rate | Price | Suitable Scenario |
|---------|------|-------------------|---------------|-----------|------------|-------|-------------------|
| MPU6050 | 6-axis | 0.005 deg/s/sqrt(Hz) | >10 deg/h | I2C | 1kHz | ~$2 | Learning, prototyping |
| BNO055 | 9-axis | - | ~5 deg/h | I2C/UART | 100Hz | ~$12 | Rapid prototyping, attitude |
| BMI088 | 6-axis | 0.014 deg/s/sqrt(Hz) | ~2 deg/h | SPI/I2C | 2kHz | ~$6 | Drones, robots |
| ICM-42688 | 6-axis | 0.0028 deg/s/sqrt(Hz) | ~1 deg/h | SPI/I2C | 32kHz | ~$5 | High-performance robots |
| ADIS16465 | 6-axis | - | 0.7-2 deg/h | SPI | 2kHz | ~$300 | Industrial navigation |
| STIM300 | 9-axis | - | 0.3 deg/h | RS422 | 2kHz | ~$4K | Tactical-grade navigation |

## Selection Guide

### By Application Scenario

<!-- SVG-DESIGN-NOTES
Type: D (量化 — IMU 产品在 价格 × 偏置稳定性 log-log 散点)
Q0: IMU 选型不是树:同一应用场景的可选传感器是 价格 × BI 平面上的 iso-budget 区域;消费级 BI ~10°/h $2、车规级 BI ~1°/h $300、战术级 BI ~0.3°/h $4k — 跨越 4 个数量级 BI 与 3 个数量级价格;BI 每降一档,价格涨 10-30×。
Q1: x = 价格 USD (log $1-$10k), y = 偏置稳定性 BI °/h (log 0.1-100, 注意 y 反向: 越低越好);7 个真实产品气泡 + 4 个应用区域阴影 + iso-BI/cost 参考线
Q2: 散点 + 区域阴影 — DNA 是"看 datasheet 选 IMU"
Q3: 删 11 个等大方框 + 10 根树状箭头
Q4: 每点直接标产品名 + 价格
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 740 420" xmlns="http://www.w3.org/2000/svg">
  <text x="370" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">IMU selection — bias instability BI vs unit price</text>
  <text x="370" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">log-log scatter · 4 application zones · 7 representative products</text>

  <!-- axes: x = log price 1..10000 maps [80..680]; y = log BI 100..0.1 (inverted, lower is better) maps [80..340] -->
  <line x1="80" y1="340" x2="680" y2="340" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="340" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="338" x2="80"  y2="344"/><text x="80"  y="358" text-anchor="middle">$1</text>
    <line x1="230" y1="338" x2="230" y2="344"/><text x="230" y="358" text-anchor="middle">$10</text>
    <line x1="380" y1="338" x2="380" y2="344"/><text x="380" y="358" text-anchor="middle">$100</text>
    <line x1="530" y1="338" x2="530" y2="344"/><text x="530" y="358" text-anchor="middle">$1k</text>
    <line x1="680" y1="338" x2="680" y2="344"/><text x="680" y="358" text-anchor="middle">$10k</text>

    <line x1="76" y1="340" x2="84" y2="340"/><text x="72" y="344" text-anchor="end">100 °/h</text>
    <line x1="76" y1="280" x2="84" y2="280"/><text x="72" y="284" text-anchor="end">10</text>
    <line x1="76" y1="220" x2="84" y2="220"/><text x="72" y="224" text-anchor="end">1</text>
    <line x1="76" y1="160" x2="84" y2="160"/><text x="72" y="164" text-anchor="end">0.3</text>
    <line x1="76" y1="100" x2="84" y2="100"/><text x="72" y="104" text-anchor="end">0.1</text>
  </g>
  <text x="380" y="382" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">unit price USD (log)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">bias instability BI °/h (log, lower is better ↑)</text>

  <!-- Application zones (shaded bands per BI range) -->
  <rect x="80" y="290" width="240" height="50" fill="var(--dia-accent)" fill-opacity="0.08"/>
  <text x="200" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">learning/prototype · BI &gt; 10°/h</text>

  <rect x="200" y="245" width="200" height="40" fill="var(--dia-green)" fill-opacity="0.08"/>
  <text x="300" y="269" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">consumer · BI ≈ 2-10°/h</text>

  <rect x="350" y="195" width="200" height="50" fill="var(--dia-blue)" fill-opacity="0.08"/>
  <text x="450" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">drone/robotics · BI ≈ 0.7-2°/h</text>

  <rect x="450" y="140" width="230" height="55" fill="var(--dia-gold)" fill-opacity="0.08"/>
  <text x="565" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">autonomous/tactical · BI &lt; 0.5°/h</text>

  <!-- iso-BI horizontal guide at 1°/h (key threshold) -->
  <line x1="80" y1="220" x2="680" y2="220" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.5"/>

  <!-- Bubbles -->
  <!-- MPU6050: $2, BI > 10°/h -->
  <circle cx="195" cy="312" r="10" fill="var(--dia-accent)" fill-opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="158" y="295" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">MPU6050</text>
  <text x="158" y="308" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$2 · 6-axis</text>

  <!-- BNO055: $12, 5°/h -->
  <circle cx="244" cy="270" r="10" fill="var(--dia-green)" fill-opacity="0.55" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="258" y="266" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">BNO055</text>
  <text x="258" y="279" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$12 · 9-axis fusion</text>

  <!-- BMI088: $6, 2°/h -->
  <circle cx="215" cy="244" r="10" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="100" y="240" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">BMI088</text>
  <text x="100" y="253" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$6 · drone-grade</text>

  <!-- ICM-42688: $5, 1°/h -->
  <circle cx="210" cy="218" r="12" fill="var(--dia-blue)" fill-opacity="0.6" stroke="var(--dia-blue)" stroke-width="1.5"/>
  <text x="225" y="216" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">ICM-42688</text>
  <text x="225" y="229" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$5 · 32 kHz · best $/perf</text>

  <!-- ADIS16465: $300, 1°/h -->
  <circle cx="455" cy="218" r="14" fill="var(--dia-blue)" fill-opacity="0.65" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="475" y="214" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">ADIS16465</text>
  <text x="475" y="227" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$300 · industrial</text>

  <!-- STIM300: $4k, 0.3°/h -->
  <circle cx="610" cy="158" r="16" fill="var(--dia-gold)" fill-opacity="0.65" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="610" y="135" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">STIM300</text>
  <text x="610" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$4k · tactical</text>

  <!-- HG1120 (tactical): $8k, 0.1°/h -->
  <circle cx="660" cy="100" r="14" fill="var(--dia-gold)" fill-opacity="0.65" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="655" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">HG1120</text>
  <text x="660" y="93" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$8k · military</text>

  <!-- price = 30× BI rule annotation: trend line from (4, 50) to (10000, 0.1) -->
  <line x1="180" y1="295" x2="660" y2="105" stroke="var(--dia-accent)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.55"/>
  <text x="525" y="195" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)" transform="rotate(-15 525 195)">BI ÷ 10 ≈ price × 30</text>

  <text x="370" y="408" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">ICM-42688 is the best-value sweet spot (BI ≈ 1°/h, $5); crossing BI &lt; 0.5°/h costs 100× more</text>
</svg>
</div>
<p class="figure-caption">Figure — Selection is not labelling by scenario but finding the iso-budget contour on the BI × price plane; each 10× lower BI costs about 30× more — an industrial rule for MEMS IMUs.</p>


### Key Selection Considerations

| Factor | Description |
|--------|-------------|
| **Noise Density** | Determines short-term accuracy, affects high-frequency signal quality |
| **Bias Stability** | Determines long-term drift rate |
| **Sample Rate** | High-dynamic scenarios need high sample rate (>1kHz) |
| **Interface** | I2C is simple but speed-limited, SPI is faster and more reliable |
| **Temperature Range** | Outdoor applications need wide temperature range |
| **Built-in Features** | Temperature compensation, digital filtering, FIFO buffer |
| **Power Consumption** | Battery-powered devices must consider this |
| **Fusion Needed** | Raw data or fused attitude output? |

## IMU Calibration

### Why Calibration Is Needed

MEMS IMU measurement model:

$$
\tilde{\mathbf{a}} = \mathbf{M}_a \cdot \mathbf{S}_a \cdot (\mathbf{a}_{\text{true}} + \mathbf{b}_a) + \mathbf{n}_a
$$

Where:

- $\mathbf{M}_a$ is the misalignment matrix
- $\mathbf{S}_a$ is the scale factor diagonal matrix
- $\mathbf{b}_a$ is the bias vector
- $\mathbf{n}_a$ is noise

The calibration goal is to estimate $\mathbf{M}_a$, $\mathbf{S}_a$, and $\mathbf{b}_a$.

### Six-Position Static Calibration

The most classic accelerometer calibration method. Place the IMU in 6 orthogonal orientations (+/-X, +/-Y, +/-Z facing up), collecting static data at each position.

**Principle**: At rest, accelerometer readings should equal the gravity vector projection on each axis.

$$
\| \tilde{\mathbf{a}} \| = g = 9.80665 \, \text{m/s}^2
$$

**Steps**:

1. Place IMU flat (Z-axis up), collect 30s static data
2. Flip (Z-axis down), collect 30s
3. Repeat for X-axis up/down, Y-axis up/down
4. Average each position
5. Solve for bias and scale factors

```python
import numpy as np

def six_position_calibration(measurements):
    """
    measurements: dict with keys '+x', '-x', '+y', '-y', '+z', '-z'
    Each value is (N, 3) accelerometer data
    """
    g = 9.80665  # m/s^2
    
    # Average per direction
    means = {k: np.mean(v, axis=0) for k, v in measurements.items()}
    
    # Bias = (positive + negative) / 2
    bias = np.array([
        (means['+x'][0] + means['-x'][0]) / 2,
        (means['+y'][1] + means['-y'][1]) / 2,
        (means['+z'][2] + means['-z'][2]) / 2,
    ])
    
    # Scale factor = (positive - negative) / (2g)
    scale = np.array([
        (means['+x'][0] - means['-x'][0]) / (2 * g),
        (means['+y'][1] - means['-y'][1]) / (2 * g),
        (means['+z'][2] - means['-z'][2]) / (2 * g),
    ])
    
    return bias, scale

def apply_calibration(raw_data, bias, scale):
    """Apply calibration parameters"""
    return (raw_data - bias) / scale
```

### Gyroscope Bias Calibration

Simplest method: collect data while stationary, the mean is the bias.

```python
def gyro_bias_calibration(static_data, duration=60):
    """
    static_data: (N, 3) gyroscope static data
    duration: collection duration (seconds), longer = more accurate
    """
    bias = np.mean(static_data, axis=0)
    noise_std = np.std(static_data, axis=0)
    
    print(f"Gyro bias: {bias} rad/s")
    print(f"Gyro noise: {noise_std} rad/s")
    
    return bias
```

### Temperature Compensation Calibration

IMU bias varies significantly with temperature. Temperature compensation fits the bias-temperature relationship by collecting data at different temperatures:

$$
b(T) = b_0 + b_1 T + b_2 T^2
$$

```python
def temperature_compensation(temp_data, bias_data):
    """
    temp_data: (N,) temperature samples
    bias_data: (N, 3) bias at corresponding temperatures
    """
    coeffs = []
    for axis in range(3):
        # Second-order polynomial fit
        p = np.polyfit(temp_data, bias_data[:, axis], deg=2)
        coeffs.append(p)
    
    return np.array(coeffs)

def compensate_bias(raw_data, temperature, temp_coeffs):
    """Runtime temperature compensation"""
    compensated = np.zeros_like(raw_data)
    for axis in range(3):
        bias_at_temp = np.polyval(temp_coeffs[axis], temperature)
        compensated[:, axis] = raw_data[:, axis] - bias_at_temp
    return compensated
```

### Magnetometer Calibration

Magnetometers are affected by hard iron and soft iron effects:

$$
\tilde{\mathbf{m}} = \mathbf{A} \cdot \mathbf{m}_{\text{true}} + \mathbf{b}_{\text{hard}}
$$

Calibration method: Rotate to collect data (figure-8 pattern), fit the ellipsoid to a standard sphere.

```python
def magnetometer_calibration(mag_data):
    """
    Ellipsoid fitting calibration
    mag_data: (N, 3) magnetometer data (collected during full-rotation)
    """
    # Hard iron offset = ellipsoid center
    hard_iron = np.mean([np.max(mag_data, axis=0), 
                          np.min(mag_data, axis=0)], axis=0)
    
    # Soft iron matrix = ellipsoid axis ratio
    centered = mag_data - hard_iron
    ranges = np.max(centered, axis=0) - np.min(centered, axis=0)
    avg_range = np.mean(ranges)
    soft_iron_scale = avg_range / ranges
    
    return hard_iron, soft_iron_scale

def apply_mag_calibration(raw_mag, hard_iron, soft_iron_scale):
    return (raw_mag - hard_iron) * soft_iron_scale
```

## Using IMU in ROS2

### IMU Message Format

```python
# sensor_msgs/msg/Imu
Header header
geometry_msgs/Quaternion orientation           # Attitude quaternion
float64[9] orientation_covariance              # Covariance
geometry_msgs/Vector3 angular_velocity         # Angular velocity (rad/s)
float64[9] angular_velocity_covariance
geometry_msgs/Vector3 linear_acceleration      # Linear acceleration (m/s^2)
float64[9] linear_acceleration_covariance
```

### BNO055 ROS2 Driver

```bash
sudo apt install ros-humble-bno055

# Launch
ros2 run bno055 bno055_driver --ros-args \
    -p connection_type:=uart \
    -p uart_port:=/dev/ttyUSB0
```

### imu_filter_madgwick

Used to estimate attitude from raw IMU data:

```bash
sudo apt install ros-humble-imu-filter-madgwick

ros2 run imu_filter_madgwick imu_filter_madgwick_node --ros-args \
    -p use_mag:=false \
    -p publish_tf:=true \
    -p world_frame:=enu
```

## Common Problems

| Problem | Cause | Solution |
|---------|-------|----------|
| Continuous attitude drift | Gyro bias not compensated | Static calibration, temperature compensation |
| Inaccurate heading | Magnetometer interference | Magnetometer calibration, distance from ferromagnetic materials |
| High vibration noise | Mechanical vibration coupling | Vibration-dampened mounting, low-pass filtering |
| Data loss | I2C communication instability | Use SPI, add pull-up resistors |
| Temperature drift | MEMS temperature characteristics | Temperature compensation calibration |

## References

- Bosch BNO055 Datasheet
- Bosch BMI088 Datasheet
- TDK InvenSense ICM-42688 Datasheet
- Analog Devices ADIS16465 Datasheet
- *Inertial Sensor Technology Trends* - IEEE Sensors Journal
