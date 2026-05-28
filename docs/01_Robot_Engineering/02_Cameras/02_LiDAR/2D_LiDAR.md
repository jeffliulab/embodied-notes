# 2D LiDAR

## 概述

2D LiDAR（也称为单线激光雷达或激光扫描仪）在单一平面内进行 360° 或有限角度的距离扫描，输出一圈二维距离数据（LaserScan）。它是室内移动机器人、扫地机器人和 AGV 导航中最常用的传感器。

## 工作原理

2D LiDAR 通常使用 ToF 或三角测距原理：

### 三角测距法

低成本 2D LiDAR（如 RPLIDAR A1）常采用三角测距：

$$
d = \frac{f \cdot B}{\Delta p}
$$

其中：

- $f$ 为透镜焦距
- $B$ 为发射器与接收器基线距离
- $\Delta p$ 为像素偏移量

特点：近距离精度高、远距离精度下降、成本低。

### ToF 测距法

中高端 2D LiDAR（如 Hokuyo、RPLIDAR S2）采用 ToF：

$$
d = \frac{c \cdot t}{2}
$$

特点：远距离精度好、测量范围大。

## 主流产品对比

### RPLIDAR 系列（思岚科技 SLAMTEC）

| 型号 | 测距范围 | 采样率 | 扫描频率 | 测距原理 | 接口 | 价格（参考） |
|------|----------|--------|----------|----------|------|-------------|
| **A1M8** | 0.15–12m | 8000 pts/s | 5.5Hz | 三角测距 | UART | ~$99 |
| **A2M12** | 0.15–18m | 16000 pts/s | 10Hz | 三角测距 | UART | ~$299 |
| **A3M1** | 0.15–25m | 16000 pts/s | 10Hz | 三角测距 | UART | ~$399 |
| **S1** | 0.1–40m | 9200 pts/s | 10Hz | ToF | UART | ~$149 |
| **S2** | 0.05–30m | 32000 pts/s | 10Hz | ToF | UART | ~$349 |
| **C1** | 0.05–12m | 5000 pts/s | 10Hz | 三角测距 | UART | ~$69 |

!!! tip "RPLIDAR A1 —— 入门首选"
    RPLIDAR A1 是 ROS 社区使用最广泛的入门级 LiDAR，价格低廉、SDK 完善、社区支持好。非常适合学习 SLAM 和移动机器人开发。

### YDLIDAR 系列（乐动）

| 型号 | 测距范围 | 采样率 | 扫描频率 | 测距原理 | 接口 | 价格（参考） |
|------|----------|--------|----------|----------|------|-------------|
| **X4** | 0.12–10m | 5000 pts/s | 6–12Hz | 三角测距 | UART | ~$69 |
| **X4PRO** | 0.12–10m | 5000 pts/s | 6–12Hz | 三角测距 | UART | ~$79 |
| **G4** | 0.26–16m | 9000 pts/s | 5–12Hz | 三角测距 | UART | ~$159 |
| **TG30** | 0.05–30m | 20000 pts/s | 10Hz | ToF | UART | ~$299 |
| **TMini Pro** | 0.02–12m | 4000 pts/s | 6Hz | 三角测距 | UART | ~$39 |

### Hokuyo 系列（日本北阳）

| 型号 | 测距范围 | 采样率 | 扫描角度 | 测距原理 | 接口 | 价格（参考） |
|------|----------|--------|----------|----------|------|-------------|
| **URG-04LX** | 0.02–5.6m | - | 240° | ToF | USB/UART | ~$1,000 |
| **UTM-30LX** | 0.1–30m | - | 270° | ToF | USB/Ethernet | ~$4,500 |
| **UST-10LX** | 0.06–10m | - | 270° | ToF | Ethernet | ~$1,600 |

!!! note "Hokuyo 的定位"
    Hokuyo 主打工业级品质和高可靠性，价格远高于国产方案，但在精度、稳定性和使用寿命方面有优势。适合商业部署的 AGV 和服务机器人。

### SICK 系列（安全级）

| 型号 | 测距范围 | 扫描角度 | 特点 | 价格（参考） |
|------|----------|----------|------|-------------|
| **TiM551** | 0.05–10m | 270° | 工业级 | ~$1,200 |
| **TiM571** | 0.05–25m | 270° | 工业级 | ~$2,000 |
| **S300 Mini** | 0.05–30m | 270° | 安全认证 SIL2/PLd | ~$5,000+ |

## 数据格式

2D LiDAR 在 ROS2 中使用 `sensor_msgs/msg/LaserScan` 消息：

```python
# sensor_msgs/msg/LaserScan
Header header              # 时间戳和坐标系
float32 angle_min          # 起始角度 (rad)
float32 angle_max          # 终止角度 (rad)
float32 angle_increment    # 角度增量 (rad)
float32 time_increment     # 测量时间增量 (s)
float32 scan_time          # 扫描周期 (s)
float32 range_min          # 最小有效距离 (m)
float32 range_max          # 最大有效距离 (m)
float32[] ranges           # 距离数组 (m)
float32[] intensities      # 反射强度数组
```

每一帧数据包含一圈的距离测量值，角度从 `angle_min` 到 `angle_max`，步长为 `angle_increment`。

## ROS2 集成

### RPLIDAR ROS2 驱动

```bash
# 安装 rplidar_ros 包
sudo apt install ros-humble-rplidar-ros

# 或从源码编译
cd ~/ros2_ws/src
git clone https://github.com/Slamtec/rplidar_ros.git -b ros2
cd ~/ros2_ws
colcon build --packages-select rplidar_ros
```

启动节点：

```bash
# RPLIDAR A1
ros2 launch rplidar_ros rplidar_a1_launch.py

# RPLIDAR A2
ros2 launch rplidar_ros rplidar_a2m12_launch.py

# 查看数据
ros2 topic echo /scan
```

### YDLIDAR ROS2 驱动

```bash
cd ~/ros2_ws/src
git clone https://github.com/YDLIDAR/ydlidar_ros2_driver.git
cd ~/ros2_ws
colcon build --packages-select ydlidar_ros2_driver
```

### Launch 文件示例

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

## 典型应用场景

### 2D SLAM 导航

2D LiDAR 是移动机器人 SLAM 的核心传感器。常用 SLAM 算法：

| 算法 | 类型 | ROS2 包 | 特点 |
|------|------|---------|------|
| Cartographer | 图优化 | `cartographer_ros` | Google 开源，精度高 |
| SLAM Toolbox | 图优化 | `slam_toolbox` | ROS2 推荐，支持终身建图 |
| GMapping | 粒子滤波 | `slam_gmapping` | 经典算法，资源消耗低 |
| Hector SLAM | 扫描匹配 | `hector_slam` | 不需要里程计 |

> 详细 SLAM 内容请参考 [SLAM 专题](https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/03_Robotics/SLAM.md)

### 扫地机器人导航

扫地机器人是 2D LiDAR 最大的消费级应用场景：

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
  <text x="195" y="83399" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">LiDAR 扫描</text>
  <rect x="125" y="83510" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83510" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="195" y="83539" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SLAM 建图</text>
  <rect x="125" y="83650" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83650" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="195" y="83679" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">全局路径规划</text>
  <rect x="125" y="83790" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83790" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="83819" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">区域覆盖规划</text>
  <rect x="125" y="83930" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="83930" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="195" y="83959" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">局部避障</text>
  <rect x="125" y="84070" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="84070" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="195" y="84099" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">执行运动</text>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">悬崖传感器</text>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">碰撞传感器</text>
</svg>
</div>


**主要特点**：

- 使用低成本 LiDAR（如 RPLIDAR A1 级别的定制模块）
- LDS（Laser Distance Sensor）安装在机器人顶部旋转
- 配合 cliff sensor（悬崖传感器）和 bumper（碰撞传感器）
- 实时建图 + 分区清扫规划

### 安全防护

工业 AGV 使用安全级 LiDAR（如 SICK S300）进行安全区域监控：

- **保护区域**：检测到障碍物立即停车
- **警告区域**：减速或改变路径
- 符合 IEC 61496 安全标准

## 安装与调试注意事项

1. **安装高度**：确保扫描平面在期望检测高度，避免扫到地面
2. **遮挡**：确保机器人本体不遮挡 LiDAR 视野（或在 URDF 中配置 min/max angle）
3. **串口权限**：Linux 下需要 `sudo usermod -aG dialout $USER`
4. **坐标系**：确保 TF 变换正确（base_link → laser_frame）
5. **反射率**：深色/透明物体可能无法检测到

## 参考资料

- SLAMTEC RPLIDAR 官方文档：https://www.slamtec.com
- YDLIDAR 开发文档：https://www.ydlidar.com
- ROS2 Navigation2 文档
- 《Probabilistic Robotics》 - Thrun et al.
