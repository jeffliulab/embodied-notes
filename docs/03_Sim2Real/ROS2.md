# ROS2 架构与核心工具

> 本文是对 ROS2 系统架构及关键软件栈的深度技术笔记。关于 ROS 历史与基本安装，请参阅 [仿真平台](simulation_platforms.md) 中的 ROS 小节。

---

## ROS2 系统架构

### 通信中间件：DDS

ROS2 的核心设计决策是采用 **DDS (Data Distribution Service)** 作为通信中间件。DDS 是 OMG 组织制定的实时数据分发标准，具有以下特性：

| 特性 | 说明 |
|------|------|
| **去中心化** | 无需 Master 节点，通过 Simple Discovery Protocol (SDP) 自动发现 |
| **QoS 策略** | 可配置可靠性（Reliable/Best-Effort）、持久性（Transient Local/Volatile）、历史深度等 |
| **实时性** | 支持确定性延迟，适用于硬实时场景 |
| **安全性** | DDS-Security 插件支持身份认证、访问控制、数据加密 |

常用 DDS 实现：

| DDS 实现 | 维护方 | 特点 | 推荐场景 |
|----------|--------|------|----------|
| **Cyclone DDS** | Eclipse 基金会 | ROS2 Humble 默认，稳定 | 通用开发 |
| **Fast DDS** | eProsima | 功能最全，曾为默认 | 需要完整 DDS 特性 |
| **Connext DDS** | RTI | 商业版，认证级别高 | 工业/军工部署 |
| **Zenoh** | Eclipse (实验性) | 非 DDS，但 ROS2 适配中 | 跨网络/云边协同 |

### ROS2 节点通信模式

<!-- SVG-DESIGN-NOTES
Type: A (结构 — ROS2 三种通信模式的拓扑+方向对比)
Q0: ROS2 的三种通信模式拓扑完全不同:Topic 是异步多对多 (扇出),Service 是同步一对一 (问答),Action 是异步带反馈的有状态会话——这三种拓扑形状本身就是区别
Q1: 横向三栏并列 (Topic / Service / Action),各栏内部用不同节点连接形状表达拓扑:Topic 一节点多扇出,Service 双向同步连线,Action 一对多+反馈虚线
Q2: 去标题:三栏内部拓扑形状不同 = ROS2 通信模式 DNA
Q3: 删去原 720×220 viewBox 6 box 平排
Q4: 同步/异步/反馈类型标在中间
Q5: 全用 var(--dia-*);英文版镜像
-->
<div class="diagram">
<svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ROS2 三种通信模式拓扑对比">
  <defs>
    <marker id="ros2-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">ROS2 通信模式 — 三种拓扑形状各异</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Topic 异步多扇出　Service 同步问答　Action 异步带反馈</text>

  <!-- Column 1: Topic (one-to-many, async) -->
  <rect x="40" y="68" width="240" height="220" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="160" y="86" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Topic</text>
  <text x="160" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">异步 · 多扇出</text>
  <rect x="80" y="120" width="100" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="130" y="140" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Publisher</text>
  <line x1="130" y1="154" x2="70" y2="220" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#ros2-arr)"/>
  <line x1="130" y1="154" x2="130" y2="220" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#ros2-arr)"/>
  <line x1="130" y1="154" x2="190" y2="220" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#ros2-arr)"/>
  <line x1="130" y1="154" x2="240" y2="220" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#ros2-arr)"/>
  <g font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-stroke)">
    <rect x="40" y="222" width="60" height="22" rx="2" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
    <text x="70" y="237" text-anchor="middle">Sub 1</text>
    <rect x="100" y="222" width="60" height="22" rx="2" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
    <text x="130" y="237" text-anchor="middle">Sub 2</text>
    <rect x="160" y="222" width="60" height="22" rx="2" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
    <text x="190" y="237" text-anchor="middle">Sub 3</text>
    <rect x="220" y="222" width="50" height="22" rx="2" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
    <text x="245" y="237" text-anchor="middle">Sub N</text>
  </g>
  <text x="160" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">/camera/image · /odom · /tf</text>

  <!-- Column 2: Service (one-to-one, sync) -->
  <rect x="290" y="68" width="240" height="220" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="410" y="86" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-blue)">Service</text>
  <text x="410" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">同步 · 一对一 · 请求-响应</text>
  <rect x="320" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="360" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Client</text>
  <rect x="430" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="470" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Server</text>
  <line x1="400" y1="151" x2="430" y2="151" stroke="var(--dia-blue)" stroke-width="1.6" marker-end="url(#ros2-arr)"/>
  <text x="415" y="143" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">req</text>
  <line x1="430" y1="163" x2="400" y2="163" stroke="var(--dia-blue)" stroke-width="1.6" marker-end="url(#ros2-arr)"/>
  <text x="415" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">resp</text>
  <text x="410" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">阻塞等待回复</text>
  <text x="410" y="252" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">/detect_object · /set_param</text>

  <!-- Column 3: Action (stateful with feedback) -->
  <rect x="540" y="68" width="240" height="220" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="660" y="86" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">Action</text>
  <text x="660" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">异步 · 长时 · 带反馈</text>
  <rect x="566" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="606" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Client</text>
  <rect x="680" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="720" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Server</text>
  <line x1="646" y1="148" x2="680" y2="148" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#ros2-arr)"/>
  <text x="660" y="142" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">goal</text>
  <path d="M 680 156 Q 660 178 646 156" fill="none" stroke="var(--dia-green)" stroke-width="1.2" stroke-dasharray="2 2" marker-end="url(#ros2-arr)"/>
  <text x="660" y="194" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">feedback (持续)</text>
  <line x1="680" y1="168" x2="646" y2="168" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="660" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">result (完成)</text>
  <line x1="680" y1="174" x2="646" y2="178" stroke="var(--dia-green)" stroke-width="1.4" marker-end="url(#ros2-arr)"/>
  <text x="660" y="252" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">/navigate_to · /grasp</text>
</svg>
</div>
<p class="figure-caption">Figure — ROS2 通信模式的几何 DNA：Topic 一发多收的"星形扇出"；Service 双向箭头的"乒乓"；Action 单向 goal + 持续 dashed feedback + 单向 result 的"长时会话"。</p>


### 四种通信模式详解

**1. Topic（话题）**：异步发布-订阅，一对多

```python
# Publisher
self.pub = self.create_publisher(Twist, '/cmd_vel', 10)
msg = Twist()
msg.linear.x = 0.5
self.pub.publish(msg)

# Subscriber
self.sub = self.create_subscription(Twist, '/cmd_vel', self.callback, 10)
```

**2. Service（服务）**：同步请求-响应，一对一

```python
# Service Server
self.srv = self.create_service(SetBool, '/enable_motor', self.handle)

# Service Client
self.cli = self.create_client(SetBool, '/enable_motor')
future = self.cli.call_async(request)
```

**3. Action（动作）**：异步 + 反馈 + 可取消，适用于长时任务

```python
# Action Server
self._action_server = ActionServer(
    self, NavigateToPose, 'navigate_to_pose', self.execute_callback)

# 执行回调中发送反馈
feedback_msg.distance_remaining = distance
goal_handle.publish_feedback(feedback_msg)
```

**4. Parameter（参数）**：动态配置节点参数

```bash
ros2 param set /my_node max_speed 1.5
ros2 param get /my_node max_speed
```

### QoS 配置策略

QoS 策略对机器人系统至关重要，错误配置会导致话题无法通信：

| QoS 策略 | 传感器数据推荐 | 控制命令推荐 | 地图数据推荐 |
|----------|---------------|-------------|-------------|
| Reliability | Best Effort | Reliable | Reliable |
| Durability | Volatile | Volatile | Transient Local |
| History Depth | 1-5 | 1 | 1 |
| Deadline | 33ms (30Hz) | 10ms (100Hz) | N/A |

---

## 关键软件包

### ros2_control：硬件抽象层

ros2_control 是 ROS2 的硬件抽象框架，将硬件接口与控制算法解耦。

**核心组件：**

- **Controller Manager**：加载/卸载/切换控制器的守护进程
- **Hardware Interface**：抽象硬件为 Command/State 接口
- **Controllers**：接收指令、输出控制量

**硬件接口类型：**

| 接口类型 | 语义 | 示例 |
|----------|------|------|
| `hardware_interface::HI_POSITION` | 位置指令 | 关节角度 (rad) |
| `hardware_interface::HI_VELOCITY` | 速度指令 | 关节角速度 (rad/s) |
| `hardware_interface::HI_EFFORT` | 力/力矩指令 | 关节力矩 (Nm) |

**常用控制器：**

```yaml
controller_manager:
  ros__parameters:
    update_rate: 500  # Hz
    joint_state_broadcaster:
      type: joint_state_broadcaster/JointStateBroadcaster
    arm_controller:
      type: joint_trajectory_controller/JointTrajectoryController
    gripper_controller:
      type: position_controllers/GripperActionController
```

**自定义 Hardware Interface 示例：**

```cpp
class MyRobotHardware : public hardware_interface::SystemInterface {
  CallbackReturn on_activate(const rclcpp_lifecycle::State &) override {
    // 初始化串口/CAN 通信
    serial_port_.open("/dev/ttyUSB0", 115200);
    return CallbackReturn::SUCCESS;
  }
  
  hardware_interface::return_type read(
      const rclcpp::Time &, const rclcpp::Duration &) override {
    // 从编码器读取关节状态
    for (size_t i = 0; i < num_joints_; i++) {
      hw_states_position_[i] = serial_port_.read_encoder(i);
      hw_states_velocity_[i] = serial_port_.read_velocity(i);
    }
    return hardware_interface::return_type::OK;
  }
  
  hardware_interface::return_type write(
      const rclcpp::Time &, const rclcpp::Duration &) override {
    // 向电机发送指令
    for (size_t i = 0; i < num_joints_; i++) {
      serial_port_.send_command(i, hw_commands_position_[i]);
    }
    return hardware_interface::return_type::OK;
  }
};
```

---

### MoveIt 2：运动规划框架

MoveIt 2 是 ROS2 最主流的机械臂运动规划框架，提供从路径规划到轨迹执行的完整流程。

**核心模块：**

| 模块 | 功能 | 关键算法 |
|------|------|----------|
| **Motion Planning** | 路径规划 | OMPL (RRT*, PRM*, BIT*), Pilz Industrial Planner |
| **Kinematics** | 正/逆运动学 | KDL, TRAC-IK, IKFast (解析解) |
| **Collision Checking** | 碰撞检测 | FCL (Flexible Collision Library) |
| **Servo** | 实时笛卡尔控制 | 增量式 IK，支持手柄/键盘 |
| **MoveIt Task Constructor** | 多阶段任务 | 级联规划子任务 |

**OMPL 规划器选择指南：**

| 规划器 | 特点 | 适用场景 |
|--------|------|----------|
| RRTConnect | 双向 RRT，速度快 | 通用场景（默认） |
| RRT* | 渐近最优 | 需要高质量路径 |
| PRM* | 预建路线图 | 重复规划同一空间 |
| BIT* | 批量采样最优 | 高维空间最优规划 |
| CHOMP | 基于优化 | 平滑轨迹 |

**MoveIt Servo** 适合遥操作和视觉伺服场景，以 100-1000Hz 频率接收增量指令：

```python
# 发送笛卡尔增量指令
twist_msg = TwistStamped()
twist_msg.header.frame_id = "tool0"
twist_msg.twist.linear.x = 0.01   # 10mm/cycle
twist_msg.twist.angular.z = 0.05  # rad/cycle
servo_twist_pub.publish(twist_msg)
```

更多运动规划理论请参阅 [运动规划](../03_Robotics/运动规划.md)。

---

### Nav2：自主导航栈

Nav2 是 ROS2 的导航框架，主要用于移动机器人的自主导航。

**架构层次：**

| 层次 | 组件 | 功能 |
|------|------|------|
| **感知** | Costmap 2D | 多层代价地图（静态层、障碍物层、膨胀层） |
| **全局规划** | Planner Server | 生成全局路径 |
| **局部控制** | Controller Server | 跟踪路径、避障 |
| **行为** | Behavior Server | 异常恢复（旋转、后退、等待） |
| **导航管理** | BT Navigator | 行为树协调整个导航流程 |

**全局规划器对比：**

| 规划器 | 算法 | 特点 | 适用场景 |
|--------|------|------|----------|
| NavFn | Dijkstra/A* | 经典，稳定 | 通用导航 |
| SMAC 2D | A* 变体 | 支持更多启发式 | 二维地图导航 |
| SMAC Hybrid-A* | Hybrid A* | 考虑运动学约束 | 阿克曼转向车辆 |
| SMAC Lattice | 状态格子 | 自定义运动原语 | 非标准运动模型 |
| Theta* | Theta* | 任意角度路径 | 需要平滑路径 |

**局部控制器对比：**

| 控制器 | 算法 | 特点 | 适用场景 |
|--------|------|------|----------|
| DWB | Dynamic Window | 经典，稳定 | 差速/全向移动底盘 |
| RPP | Regulated Pure Pursuit | 曲率调节 | 室外/高速场景 |
| MPPI | Model Predictive Path Integral | GPU 加速、可学习代价 | 复杂地形、需要最优控制 |
| Rotation Shim | 原地旋转预处理 | 搭配其他控制器使用 | 窄通道启动 |

```yaml
# Nav2 参数配置示例
controller_server:
  ros__parameters:
    controller_frequency: 20.0
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      max_vel_x: 0.5
      max_vel_theta: 1.0
      critics: ["RotateToGoal", "Oscillation", "ObstacleFootprint", "PathAlign", "PathDist", "GoalDist"]
```

更多 SLAM 相关内容请参阅 [SLAM](../03_Robotics/SLAM.md)。

---

### Micro-ROS：嵌入式 ROS2

Micro-ROS 将 ROS2 通信能力带到微控制器（MCU）级别，基于 micro-XRCE-DDS 实现。

**支持的硬件平台：**

| 平台 | 芯片示例 | RTOS | 特点 |
|------|----------|------|------|
| ESP32 | ESP32-S3 | FreeRTOS | 低成本，WiFi 内置 |
| STM32 | STM32F4/F7/H7 | FreeRTOS/Zephyr | 工业级，丰富外设 |
| Teensy | Teensy 4.1 (Cortex-M7) | FreeRTOS | 高性能，Arduino 兼容 |
| Raspberry Pi Pico | RP2040 | FreeRTOS | 超低成本 |

**典型应用**：将 IMU、编码器、电机驱动器直接作为 ROS2 节点参与通信。

```c
// Micro-ROS on ESP32: 发布 IMU 数据
rcl_publisher_t imu_publisher;
sensor_msgs__msg__Imu imu_msg;

void timer_callback(rcl_timer_t * timer, int64_t last_call_time) {
    read_mpu6050(&imu_msg);
    rcl_publish(&imu_publisher, &imu_msg, NULL);
}
```

**Agent 模式**：MCU 通过串口/WiFi/USB 连接到运行在主机上的 micro-ROS Agent，Agent 将数据桥接到完整 DDS 网络。

```bash
# 启动 micro-ROS Agent
ros2 run micro_ros_agent micro_ros_agent serial --dev /dev/ttyUSB0 -b 115200
```

---

## 常用 CLI 工具

```bash
# 节点管理
ros2 node list
ros2 node info /my_node

# 话题调试
ros2 topic list
ros2 topic echo /cmd_vel
ros2 topic hz /camera/image_raw    # 查看发布频率
ros2 topic bw /pointcloud           # 查看带宽

# 服务调用
ros2 service call /set_mode std_srvs/srv/SetBool "{data: true}"

# Action 监控
ros2 action list
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{...}"

# TF 调试
ros2 run tf2_tools view_frames       # 生成 TF 树 PDF
ros2 run tf2_ros tf2_echo base_link camera_link

# Launch 文件
ros2 launch my_package my_launch.py

# 录制回放
ros2 bag record -a -o my_bag
ros2 bag play my_bag
```

---

## 开发最佳实践

1. **使用 Launch 文件管理节点**：避免手动逐个启动
2. **善用 QoS 配置**：传感器用 Best Effort，控制指令用 Reliable
3. **Lifecycle 节点**：用 managed node 控制节点生命周期（unconfigured -> inactive -> active）
4. **Composition**：将多个节点加载到同一进程，减少序列化开销
5. **使用 colcon 构建**：`colcon build --symlink-install` 支持 Python 热更新

---

## 相关资源

- [ROS2 官方文档](https://docs.ros.org/en/humble/)
- [ros2_control 文档](https://control.ros.org/)
- [MoveIt 2 文档](https://moveit.picknik.ai/)
- [Nav2 文档](https://docs.nav2.org/)
- 相关笔记：[运动规划](../03_Robotics/运动规划.md) | [SLAM](../03_Robotics/SLAM.md) | [开发工具链](开发工具链.md)
