# 3D LiDAR

## Overview

3D LiDARs (multi-line laser radars) simultaneously scan at different elevation angles through multiple laser emitter/receiver channels, generating 3D point cloud data. They are the core perception sensors for autonomous driving, drone mapping, and advanced robotic systems.

## Working Principles

### Multi-Line Mechanical Rotation

Traditional 3D LiDARs (e.g., Velodyne) vertically stack multiple laser emitter/receiver pairs that rotate as a whole with a motor:

- Each channel corresponds to a fixed vertical angle
- One full rotation produces a complete 3D point cloud frame
- The number of channels (lines) determines vertical resolution

Vertical angular resolution:

$$
\Delta\theta_v = \frac{\text{FOV}_v}{N - 1}
$$

Where $N$ is the number of lines and $\text{FOV}_v$ is the vertical field of view.

### Point Cloud Density

Points per frame depends on line count, horizontal angular resolution, and scan frequency:

$$
N_{\text{points}} = N_{\text{channels}} \times \frac{360°}{\Delta\theta_h} \times f_{\text{scan}}
$$

## Mainstream Product Comparison

### Velodyne

Velodyne pioneered 3D LiDAR and holds an iconic position in autonomous driving.

| Model | Lines | Range | Vertical FOV | Point Rate | Accuracy | Price (Ref.) |
|-------|-------|-------|-------------|-----------|----------|-------------|
| **VLP-16 (Puck)** | 16 | 100m | +/-15 deg (30 deg) | 300K pts/s | +/-3cm | ~$4,000 |
| **VLP-32C** | 32 | 200m | +15/-25 deg (40 deg) | 600K pts/s | +/-3cm | ~$10,000 |
| **Alpha Prime (VLS-128)** | 128 | 300m | +15/-25 deg (40 deg) | 2.4M pts/s | +/-3cm | ~$75,000 |

!!! info "VLP-16 -- A Classic"
    VLP-16 (also known as Puck) is a classic 3D LiDAR product, widely used in academia and early autonomous driving R&D. While no longer the latest product, numerous open-source datasets (e.g., KITTI) were collected with Velodyne, maintaining its importance in research.

### Ouster

Ouster uses digital LiDAR technology (dToF + SPAD detectors) with unique advantages.

| Model | Lines | Range | Vertical FOV | Point Rate | Highlight | Price (Ref.) |
|-------|-------|-------|-------------|-----------|-----------|-------------|
| **OS0-128** | 128 | 50m | 90 deg | 2.6M pts/s | Ultra-wide vertical FOV, close range | ~$6,000 |
| **OS1-32** | 32 | 120m | 45 deg | 655K pts/s | Mid-range general purpose | ~$3,500 |
| **OS1-64** | 64 | 120m | 45 deg | 1.3M pts/s | High resolution | ~$6,000 |
| **OS1-128** | 128 | 120m | 45 deg | 2.6M pts/s | Highest resolution | ~$10,000 |
| **OS2-128** | 128 | 240m | 22.5 deg | 2.6M pts/s | Long range | ~$12,000 |

**Ouster Unique Features**:

- Simultaneous output: range image, reflectivity image, near-infrared ambient image
- Digital architecture: good consistency, easy to calibrate
- Supports 1024/2048 horizontal resolution modes
- Built-in IMU

### Livox (DJI subsidiary)

Livox uses a unique non-repetitive scanning pattern, different from traditional rotating LiDARs.

| Model | Scanning Method | Range | FOV | Point Rate | Highlight | Price (Ref.) |
|-------|----------------|-------|-----|-----------|-----------|-------------|
| **Mid-360** | Non-repetitive | 40m (@10% reflectivity) | 360x59 deg | 200K pts/s | Compact 360 deg | ~$1,099 |
| **HAP** | Non-repetitive | 150m | 120x25 deg | 720K pts/s | Automotive grade | ~$599 |
| **Avia** | Non-repetitive | 450m | 70.4x77.2 deg | 240K pts/s | Long range | ~$1,499 |
| **Mid-70** | Non-repetitive | 260m | 70.4x77.2 deg | 100K pts/s | Mid-range | ~$799 |

!!! tip "Advantages of Non-Repetitive Scanning"
    Livox's non-repetitive scanning pattern (petal/prism rotation) means coverage increases continuously with integration time. Within a 100ms integration window, FOV coverage can exceed that of a traditional 64-line LiDAR. This allows Livox to achieve high equivalent resolution at lower cost.

### RoboSense

| Model | Lines | Range | Vertical FOV | Point Rate | Price (Ref.) |
|-------|-------|-------|-------------|-----------|-------------|
| **RS-LiDAR-16** | 16 | 150m | 30 deg | 320K pts/s | ~$3,500 |
| **RS-LiDAR-32** | 32 | 200m | 40 deg | 640K pts/s | ~$8,000 |
| **RS-Helios 5515** | 32 | 150m | 70 deg | 720K pts/s | ~$2,500 |
| **RS-Ruby Plus** | 128 | 250m | 40 deg | 2.4M pts/s | Flagship |
| **RS-M1** | - | 200m | 120x25 deg | MEMS solid-state | Automotive grade |

### Hesai

| Model | Lines | Range | Highlight | Price (Ref.) |
|-------|-------|-------|-----------|-------------|
| **XT32** | 32 | 120m | Mid-range mechanical | ~$4,000 |
| **QT128** | 128 | 60m | Close-range blind-spot coverage | ~$3,000 |
| **AT128** | 128 | 200m | Semi-solid-state automotive | ~$1,000 |
| **Pandar128** | 128 | 200m | Flagship mechanical | High-end |
| **FT120** | - | 100m | Pure solid-state | Low mass-production price |

## Point Cloud Data Format

### ROS2 PointCloud2

3D LiDARs use the `sensor_msgs/msg/PointCloud2` message in ROS2:

```python
# sensor_msgs/msg/PointCloud2
Header header              # Timestamp and frame
uint32 height              # Point cloud height (unorganized=1, organized=rows)
uint32 width               # Point cloud width (unorganized=total points, organized=columns)
PointField[] fields        # Field descriptions (x, y, z, intensity, ring, time...)
bool is_bigendian
uint32 point_step           # Bytes per point
uint32 row_step             # Bytes per row
uint8[] data               # Raw point cloud data
bool is_dense              # Whether there are invalid points (NaN/Inf)
```

### Common Point Cloud Fields

| Field | Type | Description |
|-------|------|-------------|
| `x, y, z` | float32 | 3D coordinates (meters) |
| `intensity` | float32 | Reflection intensity |
| `ring` | uint16 | Channel/line number |
| `time` | float32 | Relative timestamp (for motion compensation) |
| `return_type` | uint8 | Return type (single/dual return) |

### Point Cloud Data Reading Example

```python
import numpy as np
from sensor_msgs.msg import PointCloud2
import sensor_msgs_py.point_cloud2 as pc2

def pointcloud_callback(msg: PointCloud2):
    # Convert PointCloud2 to numpy array
    points = pc2.read_points_numpy(msg, field_names=('x', 'y', 'z', 'intensity'))
    
    # points.shape = (N, 4)
    xyz = points[:, :3]          # (N, 3)
    intensity = points[:, 3]     # (N,)
    
    # Filter invalid points
    valid_mask = np.isfinite(xyz).all(axis=1)
    xyz = xyz[valid_mask]
    
    # Compute distances
    distances = np.linalg.norm(xyz, axis=1)
    
    print(f"Points: {len(xyz)}, Max distance: {distances.max():.2f}m")
```

## ROS2 Integration

### Velodyne ROS2 Driver

```bash
sudo apt install ros-humble-velodyne

# Launch VLP-16
ros2 launch velodyne velodyne-all-nodes-VLP16-launch.py
```

### Ouster ROS2 Driver

```bash
cd ~/ros2_ws/src
git clone https://github.com/ouster-lidar/ouster-ros.git -b ros2
cd ~/ros2_ws
colcon build --packages-select ouster_ros

ros2 launch ouster_ros sensor.launch.xml \
    sensor_hostname:=os1-xxxxxxxxxxxx.local
```

### Livox ROS2 Driver

```bash
cd ~/ros2_ws/src
git clone https://github.com/Livox-SDK/livox_ros_driver2.git
cd ~/ros2_ws
colcon build --packages-select livox_ros_driver2

ros2 launch livox_ros_driver2 rviz_MID360_launch.py
```

## Performance Comparison Summary

| Dimension | Velodyne | Ouster | Livox | RoboSense | Hesai |
|-----------|----------|--------|-------|-----------|-------|
| Technology | Classic mechanical | Digital dToF | Non-repetitive scanning | Mechanical/MEMS | Mechanical/semi-solid |
| Value | Medium | Higher | High | Higher | Higher |
| Data Quality | Good | Excellent | Good (needs integration) | Good | Good |
| Ecosystem Maturity | Best | Good | Fairly good | Medium | Fairly good |
| Automotive Mass Production | Limited | In progress | HAP | RS-M1 | AT128/FT120 |
| Best For | R&D/Academic | All scenarios | Robotics/Drones | Autonomous driving | Autonomous driving |

## 3D LiDAR SLAM

Common 3D LiDAR SLAM approaches:

| Algorithm | Input | Features |
|-----------|-------|----------|
| LOAM | 3D LiDAR | Classic edge/planar feature method |
| LeGO-LOAM | 3D LiDAR | Ground-optimized, lightweight |
| LIO-SAM | 3D LiDAR + IMU | Tightly coupled, factor graph optimization |
| FAST-LIO2 | Livox LiDAR + IMU | Optimized for non-repetitive scanning, good real-time performance |
| Point-LIO | Livox LiDAR + IMU | Point-by-point processing, high-dynamics scenarios |
| KISS-ICP | 3D LiDAR | Simple and universal, works out of the box |

## References

- Velodyne User Manual
- Ouster Software Development Docs: https://static.ouster.dev/sensor-docs/
- Livox Technical Documentation: https://www.livoxtech.com
- RoboSense Developer Documentation
- Hesai Technical Support
