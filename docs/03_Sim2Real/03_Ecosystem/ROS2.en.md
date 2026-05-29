# ROS2 Architecture and Core Tools

> This article provides in-depth technical notes on the ROS2 system architecture and key software stacks. For ROS history and basic installation, see the ROS section in [Simulation Platforms](../01_Simulation/simulation_platforms.en.md).

---

## ROS2 System Architecture

### Communication Middleware: DDS

The core design decision of ROS2 is adopting **DDS (Data Distribution Service)** as the communication middleware. DDS is a real-time data distribution standard defined by the OMG organization, with the following features:

| Feature | Description |
|---------|-------------|
| **Decentralized** | No Master node required; automatic discovery via Simple Discovery Protocol (SDP) |
| **QoS Policies** | Configurable reliability (Reliable/Best-Effort), durability (Transient Local/Volatile), history depth, etc. |
| **Real-time** | Supports deterministic latency, suitable for hard real-time scenarios |
| **Security** | DDS-Security plugin supports authentication, access control, and data encryption |

Common DDS implementations:

| DDS Implementation | Maintainer | Features | Recommended Scenario |
|-------------------|------------|----------|---------------------|
| **Cyclone DDS** | Eclipse Foundation | Default in ROS2 Humble, stable | General development |
| **Fast DDS** | eProsima | Most feature-complete, formerly the default | Full DDS feature set needed |
| **Connext DDS** | RTI | Commercial, high certification level | Industrial/military deployment |
| **Zenoh** | Eclipse (experimental) | Not DDS, but ROS2 adaptation in progress | Cross-network/cloud-edge collaboration |

### ROS2 Node Communication Patterns

<!-- SVG-DESIGN-NOTES
Type: A (structure — ROS2 three communication topologies side-by-side)
Q0: ROS2's three communication modes have fundamentally different topologies: Topic is async one-to-many (fan-out), Service is sync one-to-one (req-resp), Action is async stateful with feedback — the geometric shape itself distinguishes them
Q1: Three side-by-side columns (Topic / Service / Action) each drawing its native topology: star fan-out, ping-pong bidirectional, goal+feedback+result
Q2: Unlabeled: three columns with distinct internal shapes = ROS2 comms DNA
Q3: Removed original 720×220 viewBox 6-box flat layout
Q4: Sync/async/feedback labels on each arrow
Q5: All var(--dia-*); EN mirrors geometry
-->
<div class="diagram">
<svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ROS2 three communication topologies">
  <defs>
    <marker id="ros2-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">ROS2 Communication — Three Distinct Topologies</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Topic async fan-out　Service sync req-resp　Action async with feedback</text>

  <rect x="40" y="68" width="240" height="220" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="160" y="86" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Topic</text>
  <text x="160" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">async · fan-out</text>
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

  <rect x="290" y="68" width="240" height="220" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="410" y="86" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-blue)">Service</text>
  <text x="410" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">sync · 1-to-1 · req-resp</text>
  <rect x="320" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="360" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Client</text>
  <rect x="430" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="470" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Server</text>
  <line x1="400" y1="151" x2="430" y2="151" stroke="var(--dia-blue)" stroke-width="1.6" marker-end="url(#ros2-arr)"/>
  <text x="415" y="143" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">req</text>
  <line x1="430" y1="163" x2="400" y2="163" stroke="var(--dia-blue)" stroke-width="1.6" marker-end="url(#ros2-arr)"/>
  <text x="415" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">resp</text>
  <text x="410" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">blocks until reply</text>
  <text x="410" y="252" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">/detect_object · /set_param</text>

  <rect x="540" y="68" width="240" height="220" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="660" y="86" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">Action</text>
  <text x="660" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">async · long · with feedback</text>
  <rect x="566" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="606" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Client</text>
  <rect x="680" y="140" width="80" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="720" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Server</text>
  <line x1="646" y1="148" x2="680" y2="148" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#ros2-arr)"/>
  <text x="660" y="142" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">goal</text>
  <path d="M 680 156 Q 660 178 646 156" fill="none" stroke="var(--dia-green)" stroke-width="1.2" stroke-dasharray="2 2" marker-end="url(#ros2-arr)"/>
  <text x="660" y="194" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">feedback (continuous)</text>
  <line x1="680" y1="168" x2="646" y2="168" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="660" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">result (on completion)</text>
  <line x1="680" y1="174" x2="646" y2="178" stroke="var(--dia-green)" stroke-width="1.4" marker-end="url(#ros2-arr)"/>
  <text x="660" y="252" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">/navigate_to · /grasp</text>
</svg>
</div>
<p class="figure-caption">Figure — ROS2 communication topology DNA: Topic shows a "star fan-out"; Service shows a "ping-pong"; Action shows a long-lived session with one-shot goal + continuous dashed feedback + final result.</p>


### Four Communication Patterns in Detail

**1. Topic**: Asynchronous publish-subscribe, one-to-many

```python
# Publisher
self.pub = self.create_publisher(Twist, '/cmd_vel', 10)
msg = Twist()
msg.linear.x = 0.5
self.pub.publish(msg)

# Subscriber
self.sub = self.create_subscription(Twist, '/cmd_vel', self.callback, 10)
```

**2. Service**: Synchronous request-response, one-to-one

```python
# Service Server
self.srv = self.create_service(SetBool, '/enable_motor', self.handle)

# Service Client
self.cli = self.create_client(SetBool, '/enable_motor')
future = self.cli.call_async(request)
```

**3. Action**: Asynchronous + feedback + cancellable, suitable for long-running tasks

```python
# Action Server
self._action_server = ActionServer(
    self, NavigateToPose, 'navigate_to_pose', self.execute_callback)

# Send feedback in the execute callback
feedback_msg.distance_remaining = distance
goal_handle.publish_feedback(feedback_msg)
```

**4. Parameter**: Dynamic node parameter configuration

```bash
ros2 param set /my_node max_speed 1.5
ros2 param get /my_node max_speed
```

### QoS Configuration Policies

QoS policies are critical for robot systems; incorrect configuration can cause topics to fail to communicate:

| QoS Policy | Sensor Data Recommended | Control Command Recommended | Map Data Recommended |
|-----------|------------------------|---------------------------|---------------------|
| Reliability | Best Effort | Reliable | Reliable |
| Durability | Volatile | Volatile | Transient Local |
| History Depth | 1-5 | 1 | 1 |
| Deadline | 33ms (30Hz) | 10ms (100Hz) | N/A |

---

## Key Packages

### ros2_control: Hardware Abstraction Layer

ros2_control is the hardware abstraction framework for ROS2, decoupling hardware interfaces from control algorithms.

**Core Components:**

- **Controller Manager**: Daemon for loading/unloading/switching controllers
- **Hardware Interface**: Abstracts hardware into Command/State interfaces
- **Controllers**: Receive commands and output control signals

**Hardware Interface Types:**

| Interface Type | Semantics | Example |
|---------------|-----------|---------|
| `hardware_interface::HI_POSITION` | Position command | Joint angle (rad) |
| `hardware_interface::HI_VELOCITY` | Velocity command | Joint angular velocity (rad/s) |
| `hardware_interface::HI_EFFORT` | Force/torque command | Joint torque (Nm) |

**Common Controllers:**

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

**Custom Hardware Interface Example:**

```cpp
class MyRobotHardware : public hardware_interface::SystemInterface {
  CallbackReturn on_activate(const rclcpp_lifecycle::State &) override {
    // Initialize serial/CAN communication
    serial_port_.open("/dev/ttyUSB0", 115200);
    return CallbackReturn::SUCCESS;
  }
  
  hardware_interface::return_type read(
      const rclcpp::Time &, const rclcpp::Duration &) override {
    // Read joint states from encoders
    for (size_t i = 0; i < num_joints_; i++) {
      hw_states_position_[i] = serial_port_.read_encoder(i);
      hw_states_velocity_[i] = serial_port_.read_velocity(i);
    }
    return hardware_interface::return_type::OK;
  }
  
  hardware_interface::return_type write(
      const rclcpp::Time &, const rclcpp::Duration &) override {
    // Send commands to motors
    for (size_t i = 0; i < num_joints_; i++) {
      serial_port_.send_command(i, hw_commands_position_[i]);
    }
    return hardware_interface::return_type::OK;
  }
};
```

---

### MoveIt 2: Motion Planning Framework

MoveIt 2 is the most widely used motion planning framework for robot arms in ROS2, providing a complete pipeline from path planning to trajectory execution.

**Core Modules:**

| Module | Function | Key Algorithms |
|--------|----------|---------------|
| **Motion Planning** | Path planning | OMPL (RRT*, PRM*, BIT*), Pilz Industrial Planner |
| **Kinematics** | Forward/inverse kinematics | KDL, TRAC-IK, IKFast (analytical solutions) |
| **Collision Checking** | Collision detection | FCL (Flexible Collision Library) |
| **Servo** | Real-time Cartesian control | Incremental IK, supports joystick/keyboard |
| **MoveIt Task Constructor** | Multi-stage tasks | Cascaded planning of subtasks |

**OMPL Planner Selection Guide:**

| Planner | Features | Suitable Scenarios |
|---------|----------|-------------------|
| RRTConnect | Bidirectional RRT, fast | General purpose (default) |
| RRT* | Asymptotically optimal | High-quality paths needed |
| PRM* | Pre-built roadmap | Repeated planning in same space |
| BIT* | Batch-informed sampling optimal | Optimal planning in high-dimensional spaces |
| CHOMP | Optimization-based | Smooth trajectories |

**MoveIt Servo** is suitable for teleoperation and visual servoing, receiving incremental commands at 100-1000Hz:

```python
# Send Cartesian incremental commands
twist_msg = TwistStamped()
twist_msg.header.frame_id = "tool0"
twist_msg.twist.linear.x = 0.01   # 10mm/cycle
twist_msg.twist.angular.z = 0.05  # rad/cycle
servo_twist_pub.publish(twist_msg)
```

For more on motion planning theory, see [Motion Planning](../../00_Robotics/02_Classical_Robotics/运动规划.en.md).

---

### Nav2: Autonomous Navigation Stack

Nav2 is the navigation framework for ROS2, primarily used for autonomous navigation of mobile robots.

**Architecture Layers:**

| Layer | Component | Function |
|-------|-----------|----------|
| **Perception** | Costmap 2D | Multi-layer costmap (static layer, obstacle layer, inflation layer) |
| **Global Planning** | Planner Server | Generate global paths |
| **Local Control** | Controller Server | Path tracking, obstacle avoidance |
| **Behavior** | Behavior Server | Recovery behaviors (spin, backup, wait) |
| **Navigation Management** | BT Navigator | Behavior tree coordinating the entire navigation flow |

**Global Planner Comparison:**

| Planner | Algorithm | Features | Suitable Scenarios |
|---------|-----------|----------|-------------------|
| NavFn | Dijkstra/A* | Classic, stable | General navigation |
| SMAC 2D | A* variant | More heuristics | 2D map navigation |
| SMAC Hybrid-A* | Hybrid A* | Considers kinematic constraints | Ackermann steering vehicles |
| SMAC Lattice | State lattice | Custom motion primitives | Non-standard motion models |
| Theta* | Theta* | Any-angle paths | Smooth paths needed |

**Local Controller Comparison:**

| Controller | Algorithm | Features | Suitable Scenarios |
|-----------|-----------|----------|-------------------|
| DWB | Dynamic Window | Classic, stable | Differential/omnidirectional mobile bases |
| RPP | Regulated Pure Pursuit | Curvature regulation | Outdoor/high-speed scenarios |
| MPPI | Model Predictive Path Integral | GPU-accelerated, learnable costs | Complex terrain, optimal control needed |
| Rotation Shim | In-place rotation preprocessing | Used with other controllers | Narrow corridor startup |

```yaml
# Nav2 parameter configuration example
controller_server:
  ros__parameters:
    controller_frequency: 20.0
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      max_vel_x: 0.5
      max_vel_theta: 1.0
      critics: ["RotateToGoal", "Oscillation", "ObstacleFootprint", "PathAlign", "PathDist", "GoalDist"]
```

For more SLAM-related content, see [SLAM](../../00_Robotics/02_Classical_Robotics/SLAM.en.md).

---

### Micro-ROS: Embedded ROS2

Micro-ROS brings ROS2 communication capabilities to the microcontroller (MCU) level, based on micro-XRCE-DDS.

**Supported Hardware Platforms:**

| Platform | Chip Example | RTOS | Features |
|----------|-------------|------|----------|
| ESP32 | ESP32-S3 | FreeRTOS | Low cost, built-in WiFi |
| STM32 | STM32F4/F7/H7 | FreeRTOS/Zephyr | Industrial-grade, rich peripherals |
| Teensy | Teensy 4.1 (Cortex-M7) | FreeRTOS | High performance, Arduino compatible |
| Raspberry Pi Pico | RP2040 | FreeRTOS | Ultra-low cost |

**Typical Applications**: Making IMUs, encoders, and motor drivers directly participate in ROS2 communication as nodes.

```c
// Micro-ROS on ESP32: Publish IMU data
rcl_publisher_t imu_publisher;
sensor_msgs__msg__Imu imu_msg;

void timer_callback(rcl_timer_t * timer, int64_t last_call_time) {
    read_mpu6050(&imu_msg);
    rcl_publish(&imu_publisher, &imu_msg, NULL);
}
```

**Agent Mode**: The MCU connects to the micro-ROS Agent running on the host via serial/WiFi/USB. The Agent bridges data to the full DDS network.

```bash
# Start micro-ROS Agent
ros2 run micro_ros_agent micro_ros_agent serial --dev /dev/ttyUSB0 -b 115200
```

---

## Common CLI Tools

```bash
# Node management
ros2 node list
ros2 node info /my_node

# Topic debugging
ros2 topic list
ros2 topic echo /cmd_vel
ros2 topic hz /camera/image_raw    # Check publish frequency
ros2 topic bw /pointcloud           # Check bandwidth

# Service calls
ros2 service call /set_mode std_srvs/srv/SetBool "{data: true}"

# Action monitoring
ros2 action list
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{...}"

# TF debugging
ros2 run tf2_tools view_frames       # Generate TF tree PDF
ros2 run tf2_ros tf2_echo base_link camera_link

# Launch files
ros2 launch my_package my_launch.py

# Record and playback
ros2 bag record -a -o my_bag
ros2 bag play my_bag
```

---

## Development Best Practices

1. **Use Launch files to manage nodes**: Avoid manually starting nodes one by one
2. **Leverage QoS configuration**: Use Best Effort for sensors, Reliable for control commands
3. **Lifecycle nodes**: Use managed nodes to control node lifecycle (unconfigured -> inactive -> active)
4. **Composition**: Load multiple nodes into the same process to reduce serialization overhead
5. **Use colcon to build**: `colcon build --symlink-install` supports Python hot-reloading

---

## Related Resources

- [ROS2 Official Documentation](https://docs.ros.org/en/humble/)
- [ros2_control Documentation](https://control.ros.org/)
- [MoveIt 2 Documentation](https://moveit.picknik.ai/)
- [Nav2 Documentation](https://docs.nav2.org/)
- Related notes: [Motion Planning](../../00_Robotics/02_Classical_Robotics/运动规划.en.md) | [SLAM](../../00_Robotics/02_Classical_Robotics/SLAM.en.md) | [Development Toolchain](开发工具链.en.md)
