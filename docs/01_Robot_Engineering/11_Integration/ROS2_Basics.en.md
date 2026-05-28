# ROS 2 — Robot Operating System Basics

> *ROS (Robot Operating System) is the de facto open-source robot middleware. ROS 2 (2017+) restructured ROS 1 with DDS, multi-robot, real-time, security support. This article covers core concepts + practice.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: Linux basics, Python / C++

---

## 1. Core Concepts

- **Node**: computational unit (sensor driver, planner, control)
- **Topic**: pub/sub async messages (camera image, /cmd_vel)
- **Service**: sync request-response (query param, calibration)
- **Action**: async goal + progress (path planning)
- **Parameter**: configuration (PID gains)
- **Lifecycle**: managed node states (unconfigured, inactive, active, finalized)

---

## 2. DDS Middleware

ROS 2 uses DDS (Data Distribution Service):
- **QoS** (Quality of Service):
  - Reliability: best-effort / reliable
  - Durability: volatile / transient-local
  - History: keep-last / keep-all
  - Deadline, Liveliness
- Supports multicast + unicast
- Vendors: eProsima FastDDS, RTI Connext, Eclipse Cyclone

---

## 3. Installation (Ubuntu 22.04, ROS 2 Humble)

```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
sudo apt update
sudo apt install ros-humble-desktop python3-rosdep
source /opt/ros/humble/setup.bash
```

---

## 4. Python Node Example

```python
# minimal_publisher.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.pub = self.create_publisher(String, 'topic', 10)
        self.timer = self.create_timer(0.5, self.cb)
        self.i = 0
    
    def cb(self):
        msg = String()
        msg.data = f'Hello {self.i}'
        self.pub.publish(msg)
        self.get_logger().info(f'Publishing: {msg.data}')
        self.i += 1

def main():
    rclpy.init()
    node = MinimalPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## 5. CLI Tools

```bash
ros2 topic list
ros2 topic echo /cmd_vel
ros2 topic pub /cmd_vel ...
ros2 node list
ros2 node info <name>
ros2 service call ...
ros2 action send_goal ...
ros2 bag record -a
ros2 bag play recording
```

---

## 6. Main Packages

- **rclcpp / rclpy**: C++ / Python client libraries
- **tf2**: coordinate transforms
- **nav2**: navigation stack (mapping, planning, control)
- **moveit2**: manipulation planning
- **rviz2**: visualization
- **gazebo / Ignition / Gazebo Garden**: simulation
- **micro-ROS**: embedded (Cortex-M, ESP32)

---

## 7. Workspace + Build (colcon)

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
ros2 pkg create my_robot --build-type ament_python
cd ..
colcon build --packages-select my_robot
source install/setup.bash
ros2 run my_robot my_node
```

---

## 8. vs ROS 1

| Feature | ROS 1 | ROS 2 |
|---|---|---|
| Middleware | TCPROS | DDS |
| Multi-robot | Hard | Native |
| Real-time | ❌ | Optional (RT_PREEMPT + DDS) |
| Lifecycle | ❌ | ✅ |
| Security | ❌ | DDS Security |
| Windows | Limited | Full support |
| Maintenance | EOL (Noetic 2025) | Active |

---

## 9. Practice: Diff Drive Robot

```python
# Listen /scan from LiDAR, publish /cmd_vel
class WallFollower(Node):
    def __init__(self):
        super().__init__('wall_follower')
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_cb, 10)
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
    
    def scan_cb(self, msg):
        right_dist = msg.ranges[270]
        front_dist = msg.ranges[0]
        cmd = Twist()
        if front_dist < 0.5:
            cmd.angular.z = 1.0
        elif right_dist > 1.0:
            cmd.angular.z = -0.5
        else:
            cmd.linear.x = 0.3
        self.cmd_pub.publish(cmd)
```

---

## 10. Common Pitfalls

### 10.1 DDS Multicast Firewall

Need to enable multicast; cloud / docker tricky.

### 10.2 ROS_DOMAIN_ID

Conflicts → multiple ROS instances interfere; set unique IDs.

### 10.3 Time Sync

Multi-robot needs NTP / chrony.

### 10.4 Real-time

Needs RT_PREEMPT kernel + RTI Connext / Cyclone-DDS.

### 10.5 Version Changes

Humble (2022), Iron (2023), Jazzy (2024) — APIs gradually change.

---

## 11. Related Concepts

- **Same section**: [Integration Overview](系统集成综述.en.md)
- **Embedded**: [ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.en.md)
- **AI / Embodied**: https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/

---

## References

1. **Open Robotics** — ROS 2 official docs https://docs.ros.org/
2. **Quigley, M. et al.** "ROS: an open-source Robot Operating System." *ICRA Workshop*, 2009.
3. **Maruyama, Y. et al.** "Exploring the performance of ROS2." *EMSOFT*, 2016.
4. **OMG DDS Standard**.
