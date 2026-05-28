# 3D LiDAR

## 概述

3D LiDAR（多线激光雷达）通过多个激光发射/接收通道同时扫描不同俯仰角，生成三维点云数据。它是自动驾驶、无人机建图和高级机器人系统的核心感知传感器。

## 工作原理

### 多线机械旋转

传统 3D LiDAR（如 Velodyne）将多个激光发射/接收对垂直排列，整体随电机旋转：

- 每个通道对应一个固定的垂直角度
- 旋转一圈产生一帧完整的 3D 点云
- 通道数（线数）决定垂直分辨率

垂直角分辨率：

$$
\Delta\theta_v = \frac{\text{FOV}_v}{N - 1}
$$

其中 $N$ 为线数，$\text{FOV}_v$ 为垂直视场角。

### 点云密度

每帧点云数量取决于线数、水平角分辨率和扫描频率：

$$
N_{\text{points}} = N_{\text{channels}} \times \frac{360°}{\Delta\theta_h} \times f_{\text{scan}}
$$

## 主流产品对比

### Velodyne（威力登）

Velodyne 是 3D LiDAR 的先驱，在自动驾驶领域具有标志性地位。

| 型号 | 线数 | 测距范围 | 垂直FOV | 点频 | 精度 | 价格（参考） |
|------|------|----------|---------|------|------|-------------|
| **VLP-16 (Puck)** | 16 | 100m | ±15° (30°) | 300K pts/s | ±3cm | ~$4,000 |
| **VLP-32C** | 32 | 200m | +15°/–25° (40°) | 600K pts/s | ±3cm | ~$10,000 |
| **Alpha Prime (VLS-128)** | 128 | 300m | +15°/–25° (40°) | 2.4M pts/s | ±3cm | ~$75,000 |

!!! info "VLP-16 —— 经典之作"
    VLP-16（又称 Puck）是 3D LiDAR 的经典产品，在学术界和自动驾驶早期研发中广泛使用。虽然已不是最新产品，但大量开源数据集（如 KITTI）使用 Velodyne 采集，在研究中仍有重要地位。

### Ouster（奥斯特）

Ouster 采用数字激光雷达技术（dToF + SPAD 探测器），具有独特优势。

| 型号 | 线数 | 测距范围 | 垂直FOV | 点频 | 特色 | 价格（参考） |
|------|------|----------|---------|------|------|-------------|
| **OS0-128** | 128 | 50m | 90° | 2.6M pts/s | 超宽垂直FOV，近距离 | ~$6,000 |
| **OS1-32** | 32 | 120m | 45° | 655K pts/s | 中距离通用 | ~$3,500 |
| **OS1-64** | 64 | 120m | 45° | 1.3M pts/s | 高分辨率 | ~$6,000 |
| **OS1-128** | 128 | 120m | 45° | 2.6M pts/s | 最高分辨率 | ~$10,000 |
| **OS2-128** | 128 | 240m | 22.5° | 2.6M pts/s | 远距离 | ~$12,000 |

**Ouster 独特特性**：

- 同时输出：距离图像、反射率图像、近红外环境图像
- 数字架构：一致性好、易于校准
- 支持 1024/2048 水平分辨率模式
- 内置 IMU

### Livox（览沃 —— 大疆旗下）

Livox 采用独特的非重复扫描模式，不同于传统旋转式 LiDAR。

| 型号 | 扫描方式 | 测距范围 | FOV | 点频 | 特色 | 价格（参考） |
|------|----------|----------|-----|------|------|-------------|
| **Mid-360** | 非重复 | 40m（@10%反射率） | 360°×59° | 200K pts/s | 小型360° | ~$1,099 |
| **HAP** | 非重复 | 150m | 120°×25° | 720K pts/s | 车规级 | ~$599 |
| **Avia** | 非重复 | 450m | 70.4°×77.2° | 240K pts/s | 长距离 | ~$1,499 |
| **Mid-70** | 非重复 | 260m | 70.4°×77.2° | 100K pts/s | 中距离 | ~$799 |

!!! tip "非重复扫描的优势"
    Livox 的非重复扫描模式（花瓣形/棱镜旋转）意味着随着积分时间增加，覆盖率不断提高。在 100ms 积分时间内，FOV 覆盖率可超过传统 64 线 LiDAR。这使得 Livox 用较低成本实现了高等效分辨率。

### RoboSense（速腾聚创）

| 型号 | 线数 | 测距范围 | 垂直FOV | 点频 | 价格（参考） |
|------|------|----------|---------|------|-------------|
| **RS-LiDAR-16** | 16 | 150m | 30° | 320K pts/s | ~$3,500 |
| **RS-LiDAR-32** | 32 | 200m | 40° | 640K pts/s | ~$8,000 |
| **RS-Helios 5515** | 32 | 150m | 70° | 720K pts/s | ~$2,500 |
| **RS-Ruby Plus** | 128 | 250m | 40° | 2.4M pts/s | 旗舰 |
| **RS-M1** | - | 200m | 120°×25° | MEMS固态 | 车规级 |

### Hesai（禾赛）

| 型号 | 线数 | 测距范围 | 特色 | 价格（参考） |
|------|------|----------|------|-------------|
| **XT32** | 32 | 120m | 中端机械 | ~$4,000 |
| **QT128** | 128 | 60m | 近距离补盲 | ~$3,000 |
| **AT128** | 128 | 200m | 半固态车规 | ~$1,000 |
| **Pandar128** | 128 | 200m | 旗舰机械 | 高端 |
| **FT120** | - | 100m | 纯固态 | 量产价低 |

## 点云数据格式

### ROS2 PointCloud2

3D LiDAR 在 ROS2 中使用 `sensor_msgs/msg/PointCloud2` 消息：

```python
# sensor_msgs/msg/PointCloud2
Header header              # 时间戳和坐标系
uint32 height              # 点云高度（无组织=1，有组织=行数）
uint32 width               # 点云宽度（无组织=总点数，有组织=列数）
PointField[] fields        # 字段描述（x, y, z, intensity, ring, time...）
bool is_bigendian
uint32 point_step           # 单个点的字节数
uint32 row_step             # 单行的字节数
uint8[] data               # 点云原始数据
bool is_dense              # 是否有无效点（NaN/Inf）
```

### 常见点云字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `x, y, z` | float32 | 三维坐标（米） |
| `intensity` | float32 | 反射强度 |
| `ring` | uint16 | 通道/线号 |
| `time` | float32 | 相对时间戳（用于运动补偿） |
| `return_type` | uint8 | 回波类型（单/双回波） |

### 点云数据读取示例

```python
import numpy as np
from sensor_msgs.msg import PointCloud2
import sensor_msgs_py.point_cloud2 as pc2

def pointcloud_callback(msg: PointCloud2):
    # 将 PointCloud2 转换为 numpy 数组
    points = pc2.read_points_numpy(msg, field_names=('x', 'y', 'z', 'intensity'))
    
    # points.shape = (N, 4)
    xyz = points[:, :3]          # (N, 3)
    intensity = points[:, 3]     # (N,)
    
    # 过滤无效点
    valid_mask = np.isfinite(xyz).all(axis=1)
    xyz = xyz[valid_mask]
    
    # 计算距离
    distances = np.linalg.norm(xyz, axis=1)
    
    print(f"点数: {len(xyz)}, 最远距离: {distances.max():.2f}m")
```

## ROS2 集成

### Velodyne ROS2 驱动

```bash
sudo apt install ros-humble-velodyne

# 启动 VLP-16
ros2 launch velodyne velodyne-all-nodes-VLP16-launch.py
```

### Ouster ROS2 驱动

```bash
cd ~/ros2_ws/src
git clone https://github.com/ouster-lidar/ouster-ros.git -b ros2
cd ~/ros2_ws
colcon build --packages-select ouster_ros

ros2 launch ouster_ros sensor.launch.xml \
    sensor_hostname:=os1-xxxxxxxxxxxx.local
```

### Livox ROS2 驱动

```bash
cd ~/ros2_ws/src
git clone https://github.com/Livox-SDK/livox_ros_driver2.git
cd ~/ros2_ws
colcon build --packages-select livox_ros_driver2

ros2 launch livox_ros_driver2 rviz_MID360_launch.py
```

## 性能对比总结

| 维度 | Velodyne | Ouster | Livox | RoboSense | Hesai |
|------|----------|--------|-------|-----------|-------|
| 技术路线 | 经典机械 | 数字dToF | 非重复扫描 | 机械/MEMS | 机械/半固态 |
| 性价比 | 中等 | 较高 | 高 | 较高 | 较高 |
| 数据质量 | 好 | 优秀 | 好（需积分） | 好 | 好 |
| 生态完善度 | 最好 | 好 | 较好 | 中等 | 较好 |
| 车规量产 | 有限 | 进行中 | HAP | RS-M1 | AT128/FT120 |
| 适合场景 | 研发/学术 | 全场景 | 机器人/无人机 | 自动驾驶 | 自动驾驶 |

## 3D LiDAR SLAM

常用 3D LiDAR SLAM 方案：

| 算法 | 输入 | 特点 |
|------|------|------|
| LOAM | 3D LiDAR | 经典边线/平面特征方法 |
| LeGO-LOAM | 3D LiDAR | 地面优化、轻量化 |
| LIO-SAM | 3D LiDAR + IMU | 紧耦合、因子图优化 |
| FAST-LIO2 | Livox LiDAR + IMU | 针对非重复扫描优化、实时性好 |
| Point-LIO | Livox LiDAR + IMU | 逐点处理、高动态场景 |
| KISS-ICP | 3D LiDAR | 简洁通用、开箱即用 |

## 参考资料

- Velodyne 用户手册
- Ouster 软件开发文档：https://static.ouster.dev/sensor-docs/
- Livox 技术文档：https://www.livoxtech.com
- RoboSense 开发者文档
- Hesai 技术支持
