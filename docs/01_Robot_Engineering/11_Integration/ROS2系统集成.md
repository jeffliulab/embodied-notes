# ROS2 系统集成

## 概述

ROS2（Robot Operating System 2）是机器人软件集成的事实标准中间件。它不是操作系统，而是提供通信、工具链和生态系统的框架，让各子系统的软件能够协同工作。

---

## 节点（Node）架构

### 每个子系统一个节点

ROS2 的核心思想：将机器人系统分解为独立的节点（Node），每个节点负责一个子系统。

**典型机器人的节点-话题计算图**：ROS2 的 DNA 不是"框图"，而是 `rqt_graph` 那种**二分计算图**——椭圆是节点（进程），矩形是话题（具名消息通道），数据严格沿"话题"流动。下图遵循这一约定：节点按角色缩放（感知/控制核心节点更大），话题名直接标在边上（这是排查"为什么订阅收不到"时唯一要看的东西），主感知→控制→执行链用强调色贯穿。

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构 — ROS2 节点-话题二分计算图，rqt_graph DNA)
Q0 (One Big Idea): ROS2 系统 = 节点(进程,椭圆) 经具名话题(矩形) 解耦的发布-订阅图；数据不在节点间直连，而是流经话题——这决定了调试时只需对齐话题名/类型/QoS
Q1 (几何映射): 二分图——椭圆 node + 矩形 topic 严格交替；感知传感器节点在左、处理节点居中、控制/执行节点在右下，形成 sensor→perception→plan→control→actuator 的拓扑流；边上直接写话题名 (/camera/image_raw 等)
Q2 (DNA): 去掉标题——"椭圆与矩形交替、矩形是话题"就是 ROS computation graph 的视觉指纹，与任何子系统都不同；rqt_graph 用户一眼可认
Q3 (装饰删除): 删掉原 12 个等大圆角 rect 同形堆叠（违反 Type A "节点大小有差异 / 形状区分"）；改为 node 椭圆 vs topic 矩形两种形状，控制核心节点放大
Q4 (直接标注): 话题名 (/scan, /odom, /cmd_vel...) 直接标在连接边中点；节点中文职责标在椭圆内
Q5 (Dark + 双语): 全 var(--dia-*)；感知节点 accent、规划/控制 blue、执行 green、话题矩形 stroke-soft 描边；中文职责英文版替换，结构复用
-->
<div class="diagram">
<svg viewBox="0 0 780 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ROS2 节点-话题二分计算图">
  <defs>
    <marker id="ros-a" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/></marker>
  </defs>

  <!-- nodes = ellipses, topics = rects. flow: sensors -> topics -> perception -> topics -> plan/control -> topics -> actuators -->

  <!-- ===== sensor nodes (left, accent) ===== -->
  <ellipse cx="80" cy="70" rx="58" ry="24" fill="none" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="80" y="67" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">camera_node</text>
  <text x="80" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">图像采集</text>

  <ellipse cx="80" cy="170" rx="58" ry="24" fill="none" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="80" y="167" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">lidar_node</text>
  <text x="80" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">点云采集</text>

  <ellipse cx="80" cy="280" rx="58" ry="24" fill="none" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="80" y="277" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">imu_node</text>
  <text x="80" y="290" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">姿态数据</text>

  <!-- topics from sensors (rect) -->
  <rect x="180" y="56" width="118" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="239" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/camera/image_raw</text>
  <line x1="138" y1="70" x2="180" y2="70" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="180" y="156" width="100" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="230" y="174" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/scan</text>
  <line x1="138" y1="170" x2="180" y2="170" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="180" y="266" width="100" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="230" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/imu/data</text>
  <line x1="138" y1="280" x2="180" y2="280" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <!-- perception nodes (mid) -->
  <ellipse cx="400" cy="70" rx="62" ry="26" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="400" y="67" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">detection_node</text>
  <text x="400" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">目标检测</text>
  <line x1="298" y1="70" x2="338" y2="70" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="400" cy="200" rx="62" ry="26" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="400" y="197" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">localization_node</text>
  <text x="400" y="210" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">定位</text>
  <line x1="280" y1="170" x2="345" y2="190" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>
  <line x1="280" y1="280" x2="345" y2="212" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <!-- topic /odom and /detections -->
  <rect x="490" y="56" width="96" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="538" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/detections</text>
  <line x1="462" y1="70" x2="490" y2="70" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="490" y="186" width="96" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="538" y="204" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/odom</text>
  <line x1="462" y1="200" x2="490" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <!-- planner + controller (blue, larger = control core) -->
  <ellipse cx="660" cy="135" rx="66" ry="30" fill="none" stroke="var(--dia-blue)" stroke-width="2.2"/>
  <text x="660" y="131" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-blue)">planner_node</text>
  <text x="660" y="146" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">路径规划</text>
  <line x1="586" y1="70" x2="610" y2="112" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>
  <line x1="586" y1="200" x2="610" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="592" y="225" width="136" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="660" y="243" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/plan</text>
  <line x1="660" y1="165" x2="660" y2="225" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="660" cy="305" rx="70" ry="32" fill="none" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <text x="660" y="301" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-blue)">controller_node</text>
  <text x="660" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">运动控制</text>
  <line x1="660" y1="253" x2="660" y2="273" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <!-- /cmd_vel topic -> actuators -->
  <rect x="320" y="380" width="120" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="380" y="398" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/cmd_vel</text>
  <path d="M 640 335 C 560 380 480 392 442 394" stroke="var(--dia-blue)" stroke-width="1.6" fill="none" marker-end="url(#ros-a)"/>

  <ellipse cx="120" cy="394" rx="62" ry="26" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="120" y="391" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">motor_driver_node</text>
  <text x="120" y="404" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">电机驱动</text>
  <line x1="320" y1="394" x2="184" y2="394" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="380" cy="450" rx="58" ry="22" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="380" y="454" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">gripper_node</text>
  <line x1="380" y1="408" x2="380" y2="428" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <!-- side: monitor / logger subscribe broadly (dashed, observation only) -->
  <ellipse cx="620" cy="420" rx="56" ry="22" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="620" y="417" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">monitor_node</text>
  <text x="620" y="430" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">系统监控/日志</text>
  <path d="M 660 337 C 645 370 635 385 628 398" stroke="var(--dia-stroke-soft)" stroke-width="1" fill="none" stroke-dasharray="3 3"/>
</svg>
</div>
<p class="figure-caption">Figure 1 — ROS2 系统是节点(椭圆,进程)经具名话题(矩形)解耦的发布-订阅二分图：数据从传感器节点流入话题，被感知节点订阅，再经规划/控制核心节点（更大椭圆）产出 /cmd_vel 等话题，最后驱动执行器节点。节点间从不直连——这是调试时只需对齐话题名/类型/QoS 的根本原因。</p>


### 节点间通信模式

| 模式 | 用途 | 特点 |
|------|------|------|
| **Topic（话题）** | 持续数据流 | 发布-订阅，异步 |
| **Service（服务）** | 请求-响应 | 同步调用 |
| **Action（动作）** | 长时间任务 | 带反馈和可取消 |
| **Parameter（参数）** | 配置 | 运行时可修改 |

### 话题示例

```python
# camera_node: 发布图像
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2

class CameraNode(Node):
    def __init__(self):
        super().__init__('camera_node')
        self.publisher = self.create_publisher(Image, '/camera/image_raw', 10)
        self.timer = self.create_timer(0.033, self.timer_callback)  # 30Hz
        self.cap = cv2.VideoCapture(0)
        self.bridge = CvBridge()
    
    def timer_callback(self):
        ret, frame = self.cap.read()
        if ret:
            msg = self.bridge.cv2_to_imgmsg(frame, 'bgr8')
            msg.header.stamp = self.get_clock().now().to_msg()
            msg.header.frame_id = 'camera_link'
            self.publisher.publish(msg)
```

---

## Launch 文件

Launch 文件用于启动多个节点、设置参数、配置重映射。

### Python Launch 文件

```python
# launch/robot_bringup.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    pkg_dir = get_package_share_directory('my_robot')
    
    return LaunchDescription([
        # 相机节点
        Node(
            package='usb_cam',
            executable='usb_cam_node_exe',
            name='camera_node',
            parameters=[{
                'video_device': '/dev/video0',
                'image_width': 640,
                'image_height': 480,
                'framerate': 30.0,
            }],
            remappings=[
                ('/image_raw', '/camera/image_raw'),
            ],
        ),
        
        # LiDAR 节点
        Node(
            package='rplidar_ros',
            executable='rplidar_node',
            name='lidar_node',
            parameters=[{
                'serial_port': '/dev/ttyUSB0',
                'frame_id': 'lidar_link',
            }],
        ),
        
        # IMU 节点
        Node(
            package='imu_driver',
            executable='imu_node',
            name='imu_node',
            parameters=[os.path.join(pkg_dir, 'config', 'imu.yaml')],
        ),
        
        # 电机驱动节点
        Node(
            package='motor_driver',
            executable='motor_node',
            name='motor_driver_node',
            parameters=[os.path.join(pkg_dir, 'config', 'motors.yaml')],
        ),
        
        # 控制器节点
        Node(
            package='my_robot_control',
            executable='controller_node',
            name='controller_node',
            parameters=[os.path.join(pkg_dir, 'config', 'controller.yaml')],
        ),
    ])
```

### XML Launch 文件

```xml
<!-- launch/robot_bringup.launch.xml -->
<launch>
    <node pkg="usb_cam" exec="usb_cam_node_exe" name="camera_node">
        <param name="video_device" value="/dev/video0"/>
        <param name="framerate" value="30.0"/>
    </node>
    
    <node pkg="rplidar_ros" exec="rplidar_node" name="lidar_node">
        <param name="serial_port" value="/dev/ttyUSB0"/>
    </node>
    
    <include file="$(find-pkg-share my_robot)/launch/sensors.launch.py"/>
</launch>
```

---

## 参数管理

### YAML 参数文件

```yaml
# config/controller.yaml
controller_node:
  ros__parameters:
    # 控制频率
    control_rate: 200.0  # Hz
    
    # PID 参数
    pid:
      kp: [10.0, 10.0, 10.0, 5.0, 5.0, 5.0]
      ki: [0.1, 0.1, 0.1, 0.05, 0.05, 0.05]
      kd: [1.0, 1.0, 1.0, 0.5, 0.5, 0.5]
    
    # 安全限制
    safety:
      max_velocity: 1.5      # m/s
      max_acceleration: 3.0   # m/s^2
      max_torque: 50.0        # N·m
      collision_threshold: 10.0  # N
```

### 运行时修改参数

```bash
# 查看参数
ros2 param list /controller_node
ros2 param get /controller_node pid.kp

# 动态修改参数（无需重启节点）
ros2 param set /controller_node safety.max_velocity 2.0
```

---

## tf2 坐标变换

### 坐标变换树

机器人的每个部件都有自己的坐标系，tf2 管理它们之间的变换关系。

**典型的 tf 树**：

```
world
  └── odom
        └── base_link
              ├── imu_link
              ├── lidar_link
              ├── camera_link
              │     └── camera_optical_link
              ├── left_front_hip
              │     └── left_front_thigh
              │           └── left_front_calf
              │                 └── left_front_foot
              ├── right_front_hip
              │     └── ...
              └── ...
```

### 发布静态变换

传感器相对于 base_link 的位置（不变的变换）：

```python
# 静态变换发布器
from tf2_ros import StaticTransformBroadcaster
from geometry_msgs.msg import TransformStamped

def publish_static_transforms(self):
    t = TransformStamped()
    t.header.stamp = self.get_clock().now().to_msg()
    t.header.frame_id = 'base_link'
    t.child_frame_id = 'lidar_link'
    t.transform.translation.x = 0.1   # 前方 10cm
    t.transform.translation.y = 0.0
    t.transform.translation.z = 0.15  # 高 15cm
    t.transform.rotation.w = 1.0      # 无旋转
    
    self.static_broadcaster.sendTransform(t)
```

### Launch 文件中的静态变换

```python
Node(
    package='tf2_ros',
    executable='static_transform_publisher',
    arguments=['0.1', '0', '0.15', '0', '0', '0',
               'base_link', 'lidar_link'],
),
```

---

## URDF 机器人模型

### URDF 基础

URDF（Unified Robot Description Format）描述机器人的运动学结构：

```xml
<?xml version="1.0"?>
<robot name="my_quadruped" xmlns:xacro="http://www.ros.org/wiki/xacro">
    
    <!-- 基座 -->
    <link name="base_link">
        <visual>
            <geometry>
                <box size="0.4 0.2 0.1"/>
            </geometry>
            <material name="gray">
                <color rgba="0.5 0.5 0.5 1"/>
            </material>
        </visual>
        <collision>
            <geometry>
                <box size="0.4 0.2 0.1"/>
            </geometry>
        </collision>
        <inertial>
            <mass value="5.0"/>
            <inertia ixx="0.01" ixy="0" ixz="0"
                     iyy="0.02" iyz="0" izz="0.02"/>
        </inertial>
    </link>
    
    <!-- 左前髋关节 -->
    <joint name="lf_hip_joint" type="revolute">
        <parent link="base_link"/>
        <child link="lf_hip_link"/>
        <origin xyz="0.15 0.1 0" rpy="0 0 0"/>
        <axis xyz="1 0 0"/>
        <limit lower="-0.8" upper="0.8"
               velocity="10" effort="50"/>
    </joint>
    
    <link name="lf_hip_link">
        <visual>
            <geometry>
                <cylinder radius="0.02" length="0.08"/>
            </geometry>
        </visual>
        <inertial>
            <mass value="0.5"/>
            <inertia ixx="0.001" ixy="0" ixz="0"
                     iyy="0.001" iyz="0" izz="0.001"/>
        </inertial>
    </link>
    
    <!-- 更多关节和连杆... -->
</robot>
```

### Xacro 宏

避免重复——用宏定义参数化的腿：

```xml
<xacro:macro name="leg" params="prefix x_offset y_offset">
    <joint name="${prefix}_hip_joint" type="revolute">
        <parent link="base_link"/>
        <child link="${prefix}_hip_link"/>
        <origin xyz="${x_offset} ${y_offset} 0"/>
        <axis xyz="1 0 0"/>
        <limit lower="-0.8" upper="0.8" velocity="10" effort="50"/>
    </joint>
    <!-- ... -->
</xacro:macro>

<!-- 实例化四条腿 -->
<xacro:leg prefix="lf" x_offset="0.15" y_offset="0.1"/>
<xacro:leg prefix="rf" x_offset="0.15" y_offset="-0.1"/>
<xacro:leg prefix="lr" x_offset="-0.15" y_offset="0.1"/>
<xacro:leg prefix="rr" x_offset="-0.15" y_offset="-0.1"/>
```

### robot_state_publisher

将 URDF + 关节状态 → 发布 tf 变换：

```python
Node(
    package='robot_state_publisher',
    executable='robot_state_publisher',
    parameters=[{
        'robot_description': open('urdf/robot.urdf').read()
    }],
),
```

---

## 常用 ROS2 包

### 感知相关

| 包 | 功能 |
|---|------|
| `usb_cam` | USB 摄像头驱动 |
| `realsense2_camera` | Intel RealSense 驱动 |
| `rplidar_ros` | RPLiDAR 驱动 |
| `velodyne` | Velodyne LiDAR 驱动 |
| `imu_tools` | IMU 滤波/可视化 |

### 控制相关

| 包 | 功能 |
|---|------|
| `ros2_control` | 硬件抽象层 + 控制器框架 |
| `ros2_controllers` | PID/关节轨迹/差速控制器 |
| `moveit2` | 运动规划（机械臂） |
| `nav2` | 自主导航栈 |

### 工具

| 包 | 功能 |
|---|------|
| `rviz2` | 3D 可视化 |
| `rqt` | GUI 工具集 |
| `rosbag2` | 数据录制回放 |
| `foxglove_bridge` | Web 可视化 |

---

## QoS 配置

### 常用 QoS 策略

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# 传感器数据（允许丢包，要最新的）
sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=1
)

# 控制命令（必须可靠送达）
control_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST,
    depth=10
)
```

### 实时性考虑

ROS2 默认使用 DDS 中间件。对于实时控制：

- **控制回路频率**：200-1000 Hz 典型
- **DDS 延迟**：通常 < 1 ms（同一机器内）
- **避免在控制回路中**：动态内存分配、文件IO、网络等待

```python
# 控制节点的定时器回调
def control_callback(self):
    # 1. 读取传感器数据（从缓存，非阻塞）
    imu_data = self.latest_imu
    joint_states = self.latest_joints
    
    # 2. 计算控制（纯计算，无IO）
    torques = self.compute_control(imu_data, joint_states)
    
    # 3. 发送控制命令
    self.publish_torques(torques)
    
    # 总耗时应 < 1/control_rate
```

---

## 多机协作

### Namespace 隔离

多个相同机器人时使用 namespace：

```bash
ros2 launch my_robot bringup.launch.py namespace:=robot1
ros2 launch my_robot bringup.launch.py namespace:=robot2
```

话题自动变为 `/robot1/cmd_vel`, `/robot2/cmd_vel` 等。

### DDS Discovery

同一网络内的 ROS2 节点自动发现。隔离方法：

```bash
# 不同域 ID 的节点互不可见
export ROS_DOMAIN_ID=42
```

---

## 相关内容

- [ROS2 详细教程](../../03_Sim2Real/03_Ecosystem/ROS2.md) — ROS2 深入学习
- [系统集成综述](系统集成综述.md) — 集成全局视图
- [调试与测试](调试与测试.md) — ROS2 调试方法

---

## 参考资源

- ROS2 官方文档: [docs.ros.org](https://docs.ros.org/)
- ROS2 设计文档: [design.ros2.org](https://design.ros2.org/)
- The Robotics Back-End: [roboticsbackend.com](https://roboticsbackend.com/)
- Macenski, S. et al., "Robot Operating System 2: Design, Architecture, and Uses In the Wild," Science Robotics, 2022
