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

<div class="diagram">
<svg viewBox="0 0 900 440" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="450" y1="120" x2="110" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="280" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="450" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="620" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="790" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="260" x2="110" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="280" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="450" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="620" y1="260" x2="620" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="790" y1="260" x2="790" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="380" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="450" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Application</text>
  <text x="450" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Scenario</text>
  <rect x="40" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="110" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Learning/Prototyping</text>
  <rect x="210" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="280" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Consumer Products</text>
  <rect x="380" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="450" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Drones/Robots</text>
  <rect x="550" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="550" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="620" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Autonomous</text>
  <text x="620" y="246" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Driving</text>
  <rect x="720" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="720" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="790" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">High-Precision</text>
  <text x="790" y="246" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Navigation</text>
  <rect x="40" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MPU6050 BNO055</text>
  <rect x="210" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">BMI160 LSM6DSO</text>
  <rect x="380" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">BMI088 ICM-42688</text>
  <rect x="550" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="550" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="620" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">ADIS16465 BMI088</text>
  <rect x="720" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="720" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="790" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">STIM300 HG1120</text>
</svg>
</div>


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
