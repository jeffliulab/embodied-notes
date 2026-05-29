# ROS2 System Integration

## Overview

ROS2 (Robot Operating System 2) is the de facto standard middleware for robot software integration. It is not an operating system, but rather a framework that provides communication, toolchains, and an ecosystem enabling software from various subsystems to work together.

---

## Node Architecture

### One Node Per Subsystem

The core idea of ROS2: decompose the robot system into independent nodes, each responsible for one subsystem.

**Typical Robot Node-Topic Computation Graph**: ROS2's DNA is not a "block diagram" but the `rqt_graph` style **bipartite computation graph** — ellipses are nodes (processes), rectangles are topics (named message channels), and data flows strictly along "topics." The figure below follows this convention: nodes scaled by role (perception/control core nodes larger), topic names labeled directly on the edges (the only thing to look at when debugging "why isn't my subscription receiving"), and the main perception→control→actuation chain carried through with accent color.

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture — ROS2 node-topic bipartite computation graph, rqt_graph DNA)
Q0 (One Big Idea): a ROS2 system = nodes (processes, ellipses) decoupled via named topics (rectangles) in a publish-subscribe graph; data does not connect nodes directly but flows through topics — this is why debugging only needs aligning topic name/type/QoS
Q1 (geometric mapping): bipartite graph — ellipse node + rectangle topic strictly alternating; sensor nodes on the left, processing nodes in the middle, control/actuation nodes lower-right, forming a sensor→perception→plan→control→actuator topology flow; topic names written directly on the edges (/camera/image_raw etc.)
Q2 (DNA): drop the title — "ellipses and rectangles alternating, rectangles are topics" is the visual fingerprint of a ROS computation graph, unlike any subsystem; rqt_graph users recognize it instantly
Q3 (decoration removed): deleted the original 12 equal-size rounded rects stacked in the same shape (violating Type A "node size differs / shape distinction"); changed to node ellipse vs topic rectangle two shapes, control-core nodes enlarged
Q4 (direct labels): topic names (/scan, /odom, /cmd_vel...) labeled at the midpoint of the connecting edge; node responsibility labeled inside the ellipse
Q5 (Dark + bilingual): all var(--dia-*); sensor nodes in accent, plan/control in blue, actuation in green, topic rectangles outlined in stroke-soft; Chinese responsibilities swapped in the EN version, structure reused
-->
<div class="diagram">
<svg viewBox="0 0 780 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ROS2 node-topic bipartite computation graph">
  <defs>
    <marker id="ros-a" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/></marker>
  </defs>

  <ellipse cx="80" cy="70" rx="58" ry="24" fill="none" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="80" y="67" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">camera_node</text>
  <text x="80" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">image capture</text>

  <ellipse cx="80" cy="170" rx="58" ry="24" fill="none" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="80" y="167" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">lidar_node</text>
  <text x="80" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">point cloud</text>

  <ellipse cx="80" cy="280" rx="58" ry="24" fill="none" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="80" y="277" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">imu_node</text>
  <text x="80" y="290" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">attitude data</text>

  <rect x="180" y="56" width="118" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="239" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/camera/image_raw</text>
  <line x1="138" y1="70" x2="180" y2="70" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="180" y="156" width="100" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="230" y="174" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/scan</text>
  <line x1="138" y1="170" x2="180" y2="170" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="180" y="266" width="100" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="230" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/imu/data</text>
  <line x1="138" y1="280" x2="180" y2="280" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="400" cy="70" rx="62" ry="26" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="400" y="67" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">detection_node</text>
  <text x="400" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">object detection</text>
  <line x1="298" y1="70" x2="338" y2="70" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="400" cy="200" rx="62" ry="26" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="400" y="197" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">localization_node</text>
  <text x="400" y="210" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">localization</text>
  <line x1="280" y1="170" x2="345" y2="190" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>
  <line x1="280" y1="280" x2="345" y2="212" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="490" y="56" width="96" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="538" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/detections</text>
  <line x1="462" y1="70" x2="490" y2="70" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="490" y="186" width="96" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="538" y="204" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/odom</text>
  <line x1="462" y1="200" x2="490" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="660" cy="135" rx="66" ry="30" fill="none" stroke="var(--dia-blue)" stroke-width="2.2"/>
  <text x="660" y="131" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-blue)">planner_node</text>
  <text x="660" y="146" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">path planning</text>
  <line x1="586" y1="70" x2="610" y2="112" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>
  <line x1="586" y1="200" x2="610" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="592" y="225" width="136" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="660" y="243" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/plan</text>
  <line x1="660" y1="165" x2="660" y2="225" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="660" cy="305" rx="70" ry="32" fill="none" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <text x="660" y="301" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-blue)">controller_node</text>
  <text x="660" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">motion control</text>
  <line x1="660" y1="253" x2="660" y2="273" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <rect x="320" y="380" width="120" height="28" rx="2" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="380" y="398" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">/cmd_vel</text>
  <path d="M 640 335 C 560 380 480 392 442 394" stroke="var(--dia-blue)" stroke-width="1.6" fill="none" marker-end="url(#ros-a)"/>

  <ellipse cx="120" cy="394" rx="62" ry="26" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="120" y="391" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">motor_driver_node</text>
  <text x="120" y="404" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">motor driver</text>
  <line x1="320" y1="394" x2="184" y2="394" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="380" cy="450" rx="58" ry="22" fill="none" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="380" y="454" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">gripper_node</text>
  <line x1="380" y1="408" x2="380" y2="428" stroke="var(--dia-stroke-soft)" stroke-width="1.3" marker-end="url(#ros-a)"/>

  <ellipse cx="620" cy="420" rx="56" ry="22" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="620" y="417" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">monitor_node</text>
  <text x="620" y="430" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">monitoring/logging</text>
  <path d="M 660 337 C 645 370 635 385 628 398" stroke="var(--dia-stroke-soft)" stroke-width="1" fill="none" stroke-dasharray="3 3"/>
</svg>
</div>
<p class="figure-caption">Figure 1 — A ROS2 system is a publish-subscribe bipartite graph where nodes (ellipses, processes) are decoupled via named topics (rectangles): data flows from sensor nodes into topics, is subscribed by perception nodes, then passes through the planning/control core nodes (larger ellipses) to produce topics like /cmd_vel, finally driving actuator nodes. Nodes never connect directly — which is why debugging only needs aligning topic name/type/QoS.</p>


### Inter-Node Communication Patterns

| Pattern | Use | Features |
|------|------|------|
| **Topic** | Continuous data streams | Publish-Subscribe, asynchronous |
| **Service** | Request-Response | Synchronous call |
| **Action** | Long-duration tasks | With feedback and cancellable |
| **Parameter** | Configuration | Modifiable at runtime |

### Topic Example

```python
# camera_node: Publish images
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

## Launch Files

Launch files are used to start multiple nodes, set parameters, and configure remappings.

### Python Launch File

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
        # Camera node
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
        
        # LiDAR node
        Node(
            package='rplidar_ros',
            executable='rplidar_node',
            name='lidar_node',
            parameters=[{
                'serial_port': '/dev/ttyUSB0',
                'frame_id': 'lidar_link',
            }],
        ),
        
        # IMU node
        Node(
            package='imu_driver',
            executable='imu_node',
            name='imu_node',
            parameters=[os.path.join(pkg_dir, 'config', 'imu.yaml')],
        ),
        
        # Motor driver node
        Node(
            package='motor_driver',
            executable='motor_node',
            name='motor_driver_node',
            parameters=[os.path.join(pkg_dir, 'config', 'motors.yaml')],
        ),
        
        # Controller node
        Node(
            package='my_robot_control',
            executable='controller_node',
            name='controller_node',
            parameters=[os.path.join(pkg_dir, 'config', 'controller.yaml')],
        ),
    ])
```

### XML Launch File

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

## Parameter Management

### YAML Parameter File

```yaml
# config/controller.yaml
controller_node:
  ros__parameters:
    # Control frequency
    control_rate: 200.0  # Hz
    
    # PID parameters
    pid:
      kp: [10.0, 10.0, 10.0, 5.0, 5.0, 5.0]
      ki: [0.1, 0.1, 0.1, 0.05, 0.05, 0.05]
      kd: [1.0, 1.0, 1.0, 0.5, 0.5, 0.5]
    
    # Safety limits
    safety:
      max_velocity: 1.5      # m/s
      max_acceleration: 3.0   # m/s^2
      max_torque: 50.0        # N·m
      collision_threshold: 10.0  # N
```

### Modifying Parameters at Runtime

```bash
# View parameters
ros2 param list /controller_node
ros2 param get /controller_node pid.kp

# Dynamically modify parameters (no node restart needed)
ros2 param set /controller_node safety.max_velocity 2.0
```

---

## tf2 Coordinate Transforms

### Transform Tree

Each part of the robot has its own coordinate frame; tf2 manages the transform relationships between them.

**Typical tf Tree**:

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

### Publishing Static Transforms

Sensor positions relative to base_link (invariant transforms):

```python
# Static transform broadcaster
from tf2_ros import StaticTransformBroadcaster
from geometry_msgs.msg import TransformStamped

def publish_static_transforms(self):
    t = TransformStamped()
    t.header.stamp = self.get_clock().now().to_msg()
    t.header.frame_id = 'base_link'
    t.child_frame_id = 'lidar_link'
    t.transform.translation.x = 0.1   # 10cm forward
    t.transform.translation.y = 0.0
    t.transform.translation.z = 0.15  # 15cm high
    t.transform.rotation.w = 1.0      # No rotation
    
    self.static_broadcaster.sendTransform(t)
```

### Static Transforms in Launch File

```python
Node(
    package='tf2_ros',
    executable='static_transform_publisher',
    arguments=['0.1', '0', '0.15', '0', '0', '0',
               'base_link', 'lidar_link'],
),
```

---

## URDF Robot Model

### URDF Basics

URDF (Unified Robot Description Format) describes the kinematic structure of a robot:

```xml
<?xml version="1.0"?>
<robot name="my_quadruped" xmlns:xacro="http://www.ros.org/wiki/xacro">
    
    <!-- Base -->
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
    
    <!-- Left front hip joint -->
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
    
    <!-- More joints and links... -->
</robot>
```

### Xacro Macros

Avoid repetition -- define parameterized legs with macros:

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

<!-- Instantiate four legs -->
<xacro:leg prefix="lf" x_offset="0.15" y_offset="0.1"/>
<xacro:leg prefix="rf" x_offset="0.15" y_offset="-0.1"/>
<xacro:leg prefix="lr" x_offset="-0.15" y_offset="0.1"/>
<xacro:leg prefix="rr" x_offset="-0.15" y_offset="-0.1"/>
```

### robot_state_publisher

Converts URDF + joint states into published tf transforms:

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

## Common ROS2 Packages

### Perception

| Package | Function |
|---|------|
| `usb_cam` | USB camera driver |
| `realsense2_camera` | Intel RealSense driver |
| `rplidar_ros` | RPLiDAR driver |
| `velodyne` | Velodyne LiDAR driver |
| `imu_tools` | IMU filtering/visualization |

### Control

| Package | Function |
|---|------|
| `ros2_control` | Hardware abstraction layer + controller framework |
| `ros2_controllers` | PID/Joint trajectory/Differential drive controllers |
| `moveit2` | Motion planning (manipulators) |
| `nav2` | Autonomous navigation stack |

### Tools

| Package | Function |
|---|------|
| `rviz2` | 3D visualization |
| `rqt` | GUI tool suite |
| `rosbag2` | Data recording and playback |
| `foxglove_bridge` | Web visualization |

---

## QoS Configuration

### Common QoS Policies

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# Sensor data (allow drops, want latest)
sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=1
)

# Control commands (must be reliably delivered)
control_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST,
    depth=10
)
```

### Real-Time Considerations

ROS2 uses DDS middleware by default. For real-time control:

- **Control loop frequency**: 200-1000 Hz typical
- **DDS latency**: Usually < 1 ms (within same machine)
- **Avoid in control loops**: Dynamic memory allocation, file I/O, network waits

```python
# Control node timer callback
def control_callback(self):
    # 1. Read sensor data (from cache, non-blocking)
    imu_data = self.latest_imu
    joint_states = self.latest_joints
    
    # 2. Compute control (pure computation, no I/O)
    torques = self.compute_control(imu_data, joint_states)
    
    # 3. Send control commands
    self.publish_torques(torques)
    
    # Total time should be < 1/control_rate
```

---

## Multi-Robot Collaboration

### Namespace Isolation

Use namespaces when running multiple identical robots:

```bash
ros2 launch my_robot bringup.launch.py namespace:=robot1
ros2 launch my_robot bringup.launch.py namespace:=robot2
```

Topics automatically become `/robot1/cmd_vel`, `/robot2/cmd_vel`, etc.

### DDS Discovery

ROS2 nodes on the same network automatically discover each other. Isolation method:

```bash
# Nodes with different domain IDs are invisible to each other
export ROS_DOMAIN_ID=42
```

---

## Related Content

- [ROS2 In-Depth Tutorial](../../03_Sim2Real/03_Ecosystem/ROS2.md) -- Deep dive into ROS2
- [System Integration Overview](系统集成综述.md) -- Integration overview
- [Debugging and Testing](调试与测试.md) -- ROS2 debugging methods

---

## References

- ROS2 Official Documentation: [docs.ros.org](https://docs.ros.org/)
- ROS2 Design Documents: [design.ros2.org](https://design.ros2.org/)
- The Robotics Back-End: [roboticsbackend.com](https://roboticsbackend.com/)
- Macenski, S. et al., "Robot Operating System 2: Design, Architecture, and Uses In the Wild," Science Robotics, 2022
