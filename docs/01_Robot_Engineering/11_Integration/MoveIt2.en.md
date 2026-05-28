# MoveIt 2 — ROS 2 Motion Planning Framework

> *MoveIt 2 is the mainstream manipulation framework for ROS 2. Originated by Sucan & Chitta in 2010, now maintained by OSRF + PickNik. Provides planners (OMPL), kinematics (IKFast, KDL, TracIK), collision check (FCL), execution (FollowJointTrajectory). Essential for robot arm grasping and planning.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [ROS2_Basics](ROS2_Basics.en.md), robotics

---

## 1. MoveIt 1 → MoveIt 2

- MoveIt 1: ROS 1
- MoveIt 2: ROS 2 port (since 2020), perf improvements
- Iron / Humble / Jazzy supported

---

## 2. Architecture

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

- **URDF**: robot model (links + joints + meshes)
- **SRDF**: semantic (planning group, collision allowed list)
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

| Planner | Feature |
|---|---|
| **RRT** | Random tree |
| **RRT-Connect** | Default, fast |
| **BiTRRT** | Bidirectional |
| **PRM** | Roadmap, multi-query |
| **STOMP** | Trajectory optimization |
| **CHOMP** | Gradient-based |
| **Cartesian path** | Linear / arc |

---

## 5. Classic Workflow

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
- Self-collision, environment-collision
- SRDF "always-colliding", "never-colliding" lists prune
- Octomap for environment (depth sensor → voxel grid)

---

## 7. Kinematics

| Solver | Pros | Cons |
|---|---|---|
| **KDL** | Universal, simple | Slow, may fail |
| **TracIK** | Good perf | Still 6 DOF classic |
| **IKFast** | Very fast (closed form) | Hard to generate |
| **BioIK** | Multi-objective | |
| **Pick-it** | DL-based | Experimental |

---

## 8. Servo (Real-time Control)

- MoveIt Servo module
- 100-1000 Hz real-time input (joystick / teleop)
- Tracks cartesian velocity / joint velocity
- Replaces traditional plan-then-execute

---

## 9. Picking / Grasping

- **MoveIt Task Constructor**: split complex task into stages
- **GPD** (Grasp Pose Detection): NN recommends grasps
- **Contact-GraspNet**: modern grasp generator
- **Octomap** for environment perception

---

## 10. Sim Integration

- **Gazebo Classic / Ignition / Gz**
- **NVIDIA Isaac Sim** (modern)
- **PyBullet** (lightweight)
- **MuJoCo MJX** (fast RL)
- **Webots**

---

## 11. Common Pitfalls

### 11.1 Planning Failure

No solution path → check reachability, collision allowed list, initial pose.

### 11.2 Execution Slowdown

OMPL plan vs execute separated; trajectory smoothing before execute.

### 11.3 IK Failure

Singularity / out of workspace → fallback, retry with random seed.

### 11.4 URDF vs Reality Mismatch

CAD-derived link mass / inertia wrong → sim diverges.

### 11.5 ROS 1 vs ROS 2

APIs differ; migration tool semi-automatic.

---

## 12. Related Concepts

- **Same section**: [ROS2_Basics](ROS2_Basics.en.md), [SLAM_Basics](SLAM_Basics.en.md)
- **Mechanical**: [Bearings](../04_Mechanical_Engineering/Bearings.en.md)
- **AI**: VLA + MoveIt

---

## References

1. **Coleman, D. et al.** "Reducing the Barrier to Entry of Complex Robotic Software: a MoveIt! Case Study." 2014.
2. **Sucan, I. A. et al.** "The Open Motion Planning Library." *IEEE Robot Autom Mag*, 2012.
3. **MoveIt 2** Documentation — https://moveit.ros.org/
4. **Beeson, P. & Ames, B.** "TracIK: An improved inverse kinematics solver." 2015.
