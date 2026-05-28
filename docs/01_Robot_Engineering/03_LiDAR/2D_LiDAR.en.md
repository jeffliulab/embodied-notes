# 2D LiDAR

## Overview

2D LiDAR (also called single-line laser rangefinder or laser scanner) performs 360-degree or limited-angle distance scanning in a single plane, outputting one ring of two-dimensional distance data (LaserScan). It is the most commonly used sensor for indoor mobile robot, robot vacuum, and AGV navigation.

## Working Principles

2D LiDARs typically use ToF or triangulation principles:

### Triangulation

Low-cost 2D LiDARs (e.g., RPLIDAR A1) commonly use triangulation:

$$
d = \frac{f \cdot B}{\Delta p}
$$

Where:

- $f$ is the lens focal length
- $B$ is the baseline distance between emitter and receiver
- $\Delta p$ is the pixel offset

Characteristics: High accuracy at close range, decreasing accuracy at longer range, low cost.

### ToF Ranging

Mid-to-high-end 2D LiDARs (e.g., Hokuyo, RPLIDAR S2) use ToF:

$$
d = \frac{c \cdot t}{2}
$$

Characteristics: Good long-range accuracy, large measurement range.

## Mainstream Product Comparison

### RPLIDAR Series (SLAMTEC)

| Model | Range | Sample Rate | Scan Frequency | Ranging Principle | Interface | Price (Ref.) |
|-------|-------|-------------|----------------|-------------------|-----------|-------------|
| **A1M8** | 0.15-12m | 8000 pts/s | 5.5Hz | Triangulation | UART | ~$99 |
| **A2M12** | 0.15-18m | 16000 pts/s | 10Hz | Triangulation | UART | ~$299 |
| **A3M1** | 0.15-25m | 16000 pts/s | 10Hz | Triangulation | UART | ~$399 |
| **S1** | 0.1-40m | 9200 pts/s | 10Hz | ToF | UART | ~$149 |
| **S2** | 0.05-30m | 32000 pts/s | 10Hz | ToF | UART | ~$349 |
| **C1** | 0.05-12m | 5000 pts/s | 10Hz | Triangulation | UART | ~$69 |

!!! tip "RPLIDAR A1 -- The Go-To Entry-Level Choice"
    RPLIDAR A1 is the most widely used entry-level LiDAR in the ROS community, with a low price, well-developed SDK, and strong community support. It is ideal for learning SLAM and mobile robot development.

### YDLIDAR Series

| Model | Range | Sample Rate | Scan Frequency | Ranging Principle | Interface | Price (Ref.) |
|-------|-------|-------------|----------------|-------------------|-----------|-------------|
| **X4** | 0.12-10m | 5000 pts/s | 6-12Hz | Triangulation | UART | ~$69 |
| **X4PRO** | 0.12-10m | 5000 pts/s | 6-12Hz | Triangulation | UART | ~$79 |
| **G4** | 0.26-16m | 9000 pts/s | 5-12Hz | Triangulation | UART | ~$159 |
| **TG30** | 0.05-30m | 20000 pts/s | 10Hz | ToF | UART | ~$299 |
| **TMini Pro** | 0.02-12m | 4000 pts/s | 6Hz | Triangulation | UART | ~$39 |

### Hokuyo Series

| Model | Range | Sample Rate | Scan Angle | Ranging Principle | Interface | Price (Ref.) |
|-------|-------|-------------|-----------|-------------------|-----------|-------------|
| **URG-04LX** | 0.02-5.6m | - | 240 deg | ToF | USB/UART | ~$1,000 |
| **UTM-30LX** | 0.1-30m | - | 270 deg | ToF | USB/Ethernet | ~$4,500 |
| **UST-10LX** | 0.06-10m | - | 270 deg | ToF | Ethernet | ~$1,600 |

!!! note "Hokuyo's Positioning"
    Hokuyo focuses on industrial-grade quality and high reliability. Prices are much higher than domestic alternatives, but they offer advantages in accuracy, stability, and lifespan. Suitable for commercially deployed AGVs and service robots.

### SICK Series (Safety-Rated)

| Model | Range | Scan Angle | Features | Price (Ref.) |
|-------|-------|-----------|----------|-------------|
| **TiM551** | 0.05-10m | 270 deg | Industrial grade | ~$1,200 |
| **TiM571** | 0.05-25m | 270 deg | Industrial grade | ~$2,000 |
| **S300 Mini** | 0.05-30m | 270 deg | Safety certified SIL2/PLd | ~$5,000+ |

## Data Format

2D LiDARs use the `sensor_msgs/msg/LaserScan` message in ROS2:

```python
# sensor_msgs/msg/LaserScan
Header header              # Timestamp and frame
float32 angle_min          # Start angle (rad)
float32 angle_max          # End angle (rad)
float32 angle_increment    # Angular increment (rad)
float32 time_increment     # Measurement time increment (s)
float32 scan_time          # Scan period (s)
float32 range_min          # Minimum valid range (m)
float32 range_max          # Maximum valid range (m)
float32[] ranges           # Range array (m)
float32[] intensities      # Reflection intensity array
```

Each frame contains one ring of distance measurements, from `angle_min` to `angle_max` with step size `angle_increment`.

## ROS2 Integration

### RPLIDAR ROS2 Driver

```bash
# Install rplidar_ros package
sudo apt install ros-humble-rplidar-ros

# Or build from source
cd ~/ros2_ws/src
git clone https://github.com/Slamtec/rplidar_ros.git -b ros2
cd ~/ros2_ws
colcon build --packages-select rplidar_ros
```

Launch node:

```bash
# RPLIDAR A1
ros2 launch rplidar_ros rplidar_a1_launch.py

# RPLIDAR A2
ros2 launch rplidar_ros rplidar_a2m12_launch.py

# View data
ros2 topic echo /scan
```

### YDLIDAR ROS2 Driver

```bash
cd ~/ros2_ws/src
git clone https://github.com/YDLIDAR/ydlidar_ros2_driver.git
cd ~/ros2_ws
colcon build --packages-select ydlidar_ros2_driver
```

### Launch File Example

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='rplidar_ros',
            executable='rplidar_node',
            name='rplidar_node',
            parameters=[{
                'serial_port': '/dev/ttyUSB0',
                'serial_baudrate': 115200,
                'frame_id': 'laser_frame',
                'angle_compensate': True,
                'scan_mode': 'Standard',
            }],
            output='screen',
        ),
    ])
```

## Typical Application Scenarios

### 2D SLAM Navigation

2D LiDAR is the core sensor for mobile robot SLAM. Common SLAM algorithms:

| Algorithm | Type | ROS2 Package | Features |
|-----------|------|-------------|----------|
| Cartographer | Graph optimization | `cartographer_ros` | Google open-source, high accuracy |
| SLAM Toolbox | Graph optimization | `slam_toolbox` | ROS2 recommended, supports lifelong mapping |
| GMapping | Particle filter | `slam_gmapping` | Classic algorithm, low resource consumption |
| Hector SLAM | Scan matching | `hector_slam` | No odometry required |

> For detailed SLAM content, see [SLAM Topic](../../08_Embodied_Intelligence/03_Robotics/SLAM.md)

### Robot Vacuum Navigation

Robot vacuums are the largest consumer application for 2D LiDAR:

<!-- SVG-DESIGN-NOTES
Type: A+C (极坐标扫描帧 — 实际 LaserScan 数据的几何表示)
Q0: 一帧 2D LaserScan 就是 360 个极坐标 (θ, r) — 机器人原地不动会得到 walls + obstacle blobs;角度增量 1° (RPLIDAR A1) 或 0.25° (Hokuyo) 决定能分辨多窄的缝;扫地机用这一圈数据同时做 SLAM + 区域覆盖。
Q1: polar plot — 圆心 = 机器人,放射状射线 = 实际 ranges 数组;墙面用簇状散点表示(命中点),含一个 outlier (反射率低的玻璃)
Q2: 去掉标题:中心+环+散点弧线 — DNA 是"一帧 LaserScan 在 ros2 echo 里的样子"
Q3: 删了原 8 个等大决策方框 + viewBox y=84160 的损坏 SVG;改用真实数据形状
Q4: 角度/距离 tick 直接贴极坐标网格
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">2D LaserScan 一帧 — RPLIDAR A1 在indoor的极坐标视图</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">360 rays · Δθ = 1° · range 0.15–12 m · 5.5 Hz</text>

  <!-- center robot at (360, 230) -->
  <!-- range rings: 1m, 2m, 4m radius (1m = 35px) -->
  <circle cx="360" cy="230" r="35" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="3 3"/>
  <circle cx="360" cy="230" r="70" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="3 3"/>
  <circle cx="360" cy="230" r="140" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="3 3"/>
  <text x="396" y="234" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">1 m</text>
  <text x="431" y="234" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2 m</text>
  <text x="501" y="234" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">4 m</text>

  <!-- angle ticks: 0°/90°/180°/270° -->
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">
    <line x1="360" y1="60" x2="360" y2="80" stroke="var(--dia-stroke-soft)" stroke-width="0.7"/>
    <text x="360" y="74" text-anchor="middle">0° (front)</text>
    <line x1="530" y1="230" x2="510" y2="230" stroke="var(--dia-stroke-soft)" stroke-width="0.7"/>
    <text x="538" y="234">90°</text>
    <line x1="360" y1="400" x2="360" y2="380" stroke="var(--dia-stroke-soft)" stroke-width="0.7"/>
    <text x="360" y="395" text-anchor="middle">180°</text>
    <line x1="190" y1="230" x2="210" y2="230" stroke="var(--dia-stroke-soft)" stroke-width="0.7"/>
    <text x="182" y="234" text-anchor="end">270°</text>
  </g>

  <!-- robot chassis -->
  <circle cx="360" cy="230" r="11" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.5"/>
  <line x1="360" y1="230" x2="360" y2="219" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="360" y="252" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">base_link</text>

  <!-- a handful of representative beams (rays) -->
  <g stroke="var(--dia-stroke-soft)" stroke-width="0.4" opacity="0.45">
    <line x1="360" y1="230" x2="360" y2="105"/>
    <line x1="360" y1="230" x2="404" y2="125"/>
    <line x1="360" y1="230" x2="455" y2="155"/>
    <line x1="360" y1="230" x2="490" y2="194"/>
    <line x1="360" y1="230" x2="500" y2="230"/>
    <line x1="360" y1="230" x2="455" y2="298"/>
    <line x1="360" y1="230" x2="385" y2="326"/>
    <line x1="360" y1="230" x2="290" y2="370"/>
    <line x1="360" y1="230" x2="230" y2="320"/>
    <line x1="360" y1="230" x2="216" y2="240"/>
    <line x1="360" y1="230" x2="246" y2="170"/>
    <line x1="360" y1="230" x2="312" y2="124"/>
  </g>

  <!-- north wall (front, ~2.2m) -->
  <path d="M 240 110 L 478 110" stroke="var(--dia-blue)" stroke-width="1.2" opacity="0.35"/>
  <g fill="var(--dia-blue)">
    <circle cx="245" cy="111" r="1.6"/><circle cx="260" cy="110" r="1.6"/>
    <circle cx="275" cy="110" r="1.6"/><circle cx="290" cy="109" r="1.6"/>
    <circle cx="305" cy="109" r="1.6"/><circle cx="320" cy="109" r="1.6"/>
    <circle cx="335" cy="109" r="1.6"/><circle cx="350" cy="109" r="1.6"/>
    <circle cx="365" cy="109" r="1.6"/><circle cx="380" cy="109" r="1.6"/>
    <circle cx="395" cy="109" r="1.6"/><circle cx="410" cy="110" r="1.6"/>
    <circle cx="425" cy="110" r="1.6"/><circle cx="440" cy="111" r="1.6"/>
    <circle cx="455" cy="111" r="1.6"/><circle cx="470" cy="112" r="1.6"/>
  </g>
  <text x="266" y="100" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">north wall · ~2.4 m</text>

  <!-- east wall (~3.5m at θ ≈ 90°) -->
  <path d="M 504 120 L 504 340" stroke="var(--dia-blue)" stroke-width="1.2" opacity="0.35"/>
  <g fill="var(--dia-blue)">
    <circle cx="503" cy="160" r="1.6"/><circle cx="503" cy="180" r="1.6"/>
    <circle cx="503" cy="200" r="1.6"/><circle cx="504" cy="220" r="1.6"/>
    <circle cx="504" cy="240" r="1.6"/><circle cx="503" cy="260" r="1.6"/>
    <circle cx="503" cy="280" r="1.6"/><circle cx="503" cy="300" r="1.6"/>
    <circle cx="503" cy="320" r="1.6"/>
  </g>
  <text x="510" y="160" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">east wall</text>

  <!-- south-east table leg cluster (obstacle) -->
  <g fill="var(--dia-accent)">
    <circle cx="455" cy="299" r="2.0"/><circle cx="462" cy="305" r="2.0"/>
    <circle cx="450" cy="306" r="2.0"/><circle cx="446" cy="311" r="2.0"/>
    <circle cx="459" cy="313" r="2.0"/>
  </g>
  <text x="465" y="290" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">table leg</text>

  <!-- west wall with corner -->
  <path d="M 218 180 L 218 340 L 320 340" stroke="var(--dia-blue)" stroke-width="1.2" opacity="0.35"/>
  <g fill="var(--dia-blue)">
    <circle cx="219" cy="200" r="1.6"/><circle cx="219" cy="220" r="1.6"/>
    <circle cx="219" cy="240" r="1.6"/><circle cx="218" cy="260" r="1.6"/>
    <circle cx="218" cy="280" r="1.6"/><circle cx="218" cy="300" r="1.6"/>
    <circle cx="220" cy="320" r="1.6"/>
    <circle cx="240" cy="340" r="1.6"/><circle cx="260" cy="340" r="1.6"/>
    <circle cx="280" cy="340" r="1.6"/><circle cx="300" cy="340" r="1.6"/>
  </g>
  <text x="142" y="190" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">west wall</text>

  <!-- glass: outlier (range_max returned because reflectivity too low) -->
  <line x1="360" y1="230" x2="360" y2="370" stroke="var(--dia-gold)" stroke-width="0.7" stroke-dasharray="2 2"/>
  <text x="367" y="370" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">glass door · range = ∞</text>
  <text x="367" y="383" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-gold)">(reflectivity ≈ 0, NaN in /scan)</text>

  <!-- caption-ish annotations -->
  <text x="40" y="68" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">ros2 topic echo /scan ⟶</text>
  <text x="40" y="84" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">ranges = [2.40, 2.39, 2.38, …, inf, 3.50, …]</text>
  <text x="40" y="96" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">angle_increment ≈ 0.0175 rad (1°)</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — A LaserScan frame is a ring of polar coordinates (θ, r) — walls are flat clusters, table legs are sparse blobs, glass doors are NaN/inf black holes.</p>


**Key characteristics**:

- Uses low-cost LiDAR (custom modules similar to RPLIDAR A1)
- LDS (Laser Distance Sensor) mounted on top, rotating
- Combined with cliff sensors and bumper sensors
- Real-time mapping + zone-based cleaning planning

### Safety Protection

Industrial AGVs use safety-rated LiDARs (e.g., SICK S300) for safety zone monitoring:

- **Protection zone**: Immediate stop when obstacle detected
- **Warning zone**: Slow down or change path
- Compliant with IEC 61496 safety standard

## Installation and Debugging Notes

1. **Mounting height**: Ensure the scan plane is at the desired detection height; avoid scanning the ground
2. **Occlusion**: Ensure the robot body does not block the LiDAR FOV (or configure min/max angle in URDF)
3. **Serial port permissions**: On Linux, run `sudo usermod -aG dialout $USER`
4. **Coordinate frame**: Ensure TF transforms are correct (base_link -> laser_frame)
5. **Reflectivity**: Dark or transparent objects may not be detected

## References

- SLAMTEC RPLIDAR Official Documentation: https://www.slamtec.com
- YDLIDAR Development Documentation: https://www.ydlidar.com
- ROS2 Navigation2 Documentation
- *Probabilistic Robotics* - Thrun et al.
