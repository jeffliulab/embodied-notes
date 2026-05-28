# MoveIt 2 — ROS 2 运动规划框架

> *MoveIt 2 是 ROS 2 上 robot manipulation 主流框架。Sucan & Chitta 2010 起源,现 OSRF + PickNik 维护。提供 planner (OMPL)、kinematics (IKFast、KDL、TracIK)、collision check (FCL)、execution (FollowJointTrajectory)。机器人 arm 抓取、规划必备工具。*
>
> **难度**:Advanced
> **前置知识**:[ROS2_Basics](ROS2_Basics.md)、机器人学

---

## 1. MoveIt 1 → MoveIt 2

- MoveIt 1: ROS 1
- MoveIt 2: ROS 2 移植(2020 起),性能改善
- 现 Iron / Humble / Jazzy 支持

---

## 2. 架构

```
User code (Python / C++)
       ↓
move_group node
       ↓ ┌────────────┐
         │ Planning    │ ← OMPL planners
         │ Scene       │
         │ Collision   │ ← FCL
         │ IK          │ ← KDL / TracIK / IKFast
         └────────────┘
       ↓
ros2_control / hardware interface
       ↓
Real robot / Gazebo / Isaac Sim
```

---

## 3. URDF / SRDF

- **URDF**: robot model(links + joints + meshes)
- **SRDF**: semantic(planning group、collision allowed list)
- **xacro**: URDF macros

```xml
<robot name="arm">
  <link name="base_link"/>
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="100" velocity="2.0"/>
  </joint>
  ...
</robot>
```

---

## 4. OMPL Planners

| Planner | 特点 |
|---|---|
| **RRT** | random tree |
| **RRT-Connect** | 默认,fast |
| **BiTRRT** | bidirectional |
| **PRM** | roadmap, multi-query |
| **STOMP** | trajectory optimization |
| **CHOMP** | gradient-based |
| **Cartesian path** | 直 / 弧 |

---

## 5. 经典 workflow

```python
import rclpy
from moveit2 import MoveIt2
from geometry_msgs.msg import Pose

rclpy.init()
node = rclpy.create_node('demo')
moveit2 = MoveIt2(node=node, joint_names=[...], base_link_name='base_link',
                  end_effector_name='end_effector')

# Plan to pose
target = Pose()
target.position.x = 0.5
target.position.y = 0.0
target.position.z = 0.3
target.orientation.w = 1.0
moveit2.move_to_pose(position=target.position, quat_xyzw=target.orientation)

# Plan to joint config
moveit2.move_to_configuration([0.0, 0.5, 0.0, -1.0, 0.0, 1.5, 0.0])
```

---

## 6. Collision Check

- FCL (Flexible Collision Library)
- Self-collision、environment-collision
- 通过 SRDF "always-colliding"、"never-colliding" 列表 prune
- Octomap for environment (depth sensor → voxel grid)

---

## 7. Kinematics

| Solver | 优点 | 缺点 |
|---|---|---|
| **KDL** | 通用,简 | 慢,可能 fail |
| **TracIK** | 性能好 | 仍 6 DOF 经典 |
| **IKFast** | 极快 (closed form) | 需 generate(不易) |
| **BioIK** | 多目标 | |
| **Pick-it** | DL based | 实验 |

---

## 8. Servo (实时控制)

- MoveIt Servo 模块
- 100-1000 Hz 实时输入(joystick / teleop)
- 跟随 cartesian velocity / joint velocity
- 替代 traditional plan-then-execute

---

## 9. Picking / Grasping

- **MoveIt Task Constructor**: 复杂 task 拆 stage
- **GPD** (Grasp Pose Detection): NN 推荐 grasp
- **Contact-GraspNet**: 当代 grasp generator
- **Octomap** 集成环境感知

---

## 10. Sim 集成

- **Gazebo Classic / Ignition / Gz**
- **NVIDIA Isaac Sim** (现代)
- **PyBullet** (轻量)
- **MuJoCo MJX** (高速 RL)
- **Webots**

---

## 11. 常见问题

### 11.1 Planning Failure

无解 path → 检查 reachability、collision allowed list、initial pose。

### 11.2 Execution Slowdown

OMPL plan 与 execute 分离;trajectory smoothing 后再 execute。

### 11.3 IK Failure

奇异姿态 / 工作空间外 → fallback、retry with random seed。

### 11.4 URDF 与实际不匹配

CAD 出来的 link mass / inertia 错 → 仿真发散。

### 11.5 ROS 1 vs ROS 2

API 不同;Migration tool 半自动。

---

## 12. Related Concepts

- **同节**:[ROS2_Basics](ROS2_Basics.md)、[SLAM_Basics](SLAM_Basics.md)
- **机械**:[Bearings](../04_Mechanical_Engineering/Bearings.md)
- **AI**: VLA + MoveIt

---

## References

1. **Coleman, D. et al.** "Reducing the Barrier to Entry of Complex Robotic Software: a MoveIt! Case Study." 2014.
2. **Sucan, I. A. et al.** "The Open Motion Planning Library." *IEEE Robot Autom Mag*, 2012.
3. **MoveIt 2** Documentation — https://moveit.ros.org/
4. **Beeson, P. & Ames, B.** "TracIK: An improved inverse kinematics solver." 2015.
