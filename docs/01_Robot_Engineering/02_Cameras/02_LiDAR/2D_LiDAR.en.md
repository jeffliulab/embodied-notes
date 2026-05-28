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

> For detailed SLAM content, see [SLAM Topic](https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/03_Robotics/SLAM.md)

### Robot Vacuum Navigation

Robot vacuums are the largest consumer application for 2D LiDAR:

<div class="diagram">
<svg viewBox="0 0 480 84160" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="195" y1="83420" x2="195" y2="83510" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="83560" x2="195" y2="83650" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="83700" x2="195" y2="83790" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="83840" x2="195" y2="83930" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="83980" x2="195" y2="84070" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="84120" x2="195" y2="83370" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="120" x2="195" y2="83930" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="195" y2="83930" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="125" y="83370" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83370" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="83399" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">LiDAR Scan</text>
  <rect x="125" y="83510" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83510" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="195" y="83539" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SLAM Mapping</text>
  <rect x="125" y="83650" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83650" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="195" y="83672" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Global Path</text>
  <text x="195" y="83686" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Planning</text>
  <rect x="125" y="83790" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83790" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="83812" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Area Coverage</text>
  <text x="195" y="83826" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Planning</text>
  <rect x="125" y="83930" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83930" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="195" y="83952" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Local Obstacle</text>
  <text x="195" y="83966" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Avoidance</text>
  <rect x="125" y="84070" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="84070" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="195" y="84099" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Execute Motion</text>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Cliff Sensor</text>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Bumper Sensor</text>
</svg>
</div>


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
