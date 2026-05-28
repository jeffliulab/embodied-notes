# ROS 2 — Robot Operating System 基础

> *ROS (Robot Operating System) 是机器人开源 middleware 事实标准。ROS 2 (2017+) 重构 ROS 1,加入 DDS, multi-robot, real-time, security。本篇覆盖核心概念 + 实践。*
>
> **难度**:Intermediate
> **前置知识**:Linux 基础, Python / C++

---

## 1. 核心概念

- **Node**: 计算单元 (sensor driver, planner, control)
- **Topic**: pub/sub 异步消息 (camera image, /cmd_vel)
- **Service**: 同步 request-response (查询参数, 校准)
- **Action**: 异步 goal + 进度 (路径规划)
- **Parameter**: 配置 (PID gains)
- **Lifecycle**: managed node states (unconfigured, inactive, active, finalized)

---

## 2. DDS Middleware

ROS 2 用 DDS (Data Distribution Service) 通信:
- **QoS** (Quality of Service):
  - Reliability: best-effort / reliable
  - Durability: volatile / transient-local
  - History: keep-last / keep-all
  - Deadline, Liveliness
- 支持 multicast + unicast
- Vendor: eProsima FastDDS, RTI Connext, Eclipse Cyclone

---

## 3. 安装 (Ubuntu 22.04, ROS 2 Humble)

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

## 4. Python 节点示例

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

## 5. CLI 工具

```bash
ros2 topic list             # 列出 topics
ros2 topic echo /cmd_vel    # 监听 topic
ros2 topic pub /cmd_vel ... # 发布
ros2 node list              # 列 nodes
ros2 node info <name>       # 节点信息
ros2 service call ...
ros2 action send_goal ...
ros2 bag record -a          # 录制
ros2 bag play recording     # 重放
```

---

## 6. 主要 packages

- **rclcpp / rclpy**: C++ / Python client libraries
- **tf2**: coordinate transforms
- **nav2**: navigation stack (mapping, planning, control)
- **moveit2**: manipulation planning
- **rviz2**: visualization
- **gazebo / Ignition / Gazebo Garden**: simulation
- **micro-ROS**: 嵌入式 (Cortex-M, ESP32)

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

## 8. 与 ROS 1 区别

| 特性 | ROS 1 | ROS 2 |
|---|---|---|
| Middleware | TCPROS | DDS |
| Multi-robot | 难 | native |
| Real-time | ❌ | optional (RT_PREEMPT + DDS) |
| Lifecycle | ❌ | ✅ |
| Security | ❌ | DDS Security |
| Win | 受限 | 完整支持 |
| 维护 | EOL (Noetic 2025) | active |

---

## 9. 实践:Diff Drive Robot

```python
# Listen /scan from LiDAR, publish /cmd_vel
class WallFollower(Node):
    def __init__(self):
        super().__init__('wall_follower')
        self.scan_sub = self.create_subscription(LaserScan, '/scan', self.scan_cb, 10)
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
    
    def scan_cb(self, msg):
        right_dist = msg.ranges[270]  # 270° = right
        front_dist = msg.ranges[0]
        cmd = Twist()
        if front_dist < 0.5:
            cmd.angular.z = 1.0  # turn left
        elif right_dist > 1.0:
            cmd.angular.z = -0.5  # turn right (follow wall)
        else:
            cmd.linear.x = 0.3  # forward
        self.cmd_pub.publish(cmd)
```

---

## 10. Common Pitfalls

### 10.1 DDS multicast 防火墙

需 enable multicast,云 / docker 环境 tricky。

### 10.2 ROS_DOMAIN_ID

冲突 → multiple ROS instance 互相干扰;设 unique ID。

### 10.3 Time sync

Multi-robot 需 NTP / chrony 同步时间。

### 10.4 Real-time

需 RT_PREEMPT kernel + RTI Connext / Cyclone-DDS。

### 10.5 版本变化

Humble (2022), Iron (2023), Jazzy (2024) — API 渐进式变。

---

## 11. Related Concepts

- **同节**:[系统集成综述](系统集成综述.md)
- **嵌入式**:[ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.md)
- **AI / Embodied**: https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/

---

## References

1. **Open Robotics** — ROS 2 official docs https://docs.ros.org/
2. **Quigley, M. et al.** "ROS: an open-source Robot Operating System." *ICRA Workshop*, 2009.
3. **Maruyama, Y. et al.** "Exploring the performance of ROS2." *EMSOFT*, 2016.
4. **OMG DDS Standard**.
