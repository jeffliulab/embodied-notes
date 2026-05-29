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

> 详细 SLAM 内容请参考 [SLAM 专题](../../00_Robotics/02_Classical_Robotics/SLAM.md)

### 扫地机器人导航

扫地机器人是 2D LiDAR 最大的消费级应用场景：

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
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">2D LaserScan 一帧 — RPLIDAR A1 在室内的极坐标视图</text>
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
  <text x="465" y="290" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">桌腿 / table leg</text>

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
  <text x="367" y="370" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">玻璃门 · range = ∞</text>
  <text x="367" y="383" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-gold)">(反射率 ≈ 0, NaN in /scan)</text>

  <!-- caption-ish annotations -->
  <text x="40" y="68" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">ros2 topic echo /scan ⟶</text>
  <text x="40" y="84" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">ranges = [2.40, 2.39, 2.38, …, inf, 3.50, …]</text>
  <text x="40" y="96" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">angle_increment ≈ 0.0175 rad (1°)</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 一帧 LaserScan 就是一圈极坐标 (θ, r) — 墙是平直簇,桌腿是稀疏点丛,玻璃门是 NaN/inf 黑洞。</p>


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
