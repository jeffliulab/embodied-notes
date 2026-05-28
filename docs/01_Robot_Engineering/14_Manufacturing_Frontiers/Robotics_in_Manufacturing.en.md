# Robotics in Manufacturing

> *Industrial robots are core to manufacturing automation. Unimate (1961, GM) was the first industrial robot. Fanuc / ABB / KUKA / Yaskawa are the "Big Four" + Chinese Estun. Cobot era (Universal Robots 2008+) collaborates with humans. Annual installs 500K+. VLA / foundation models are next generation.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [ROS2_Basics](../10_Robot_Integration/ROS2_Basics.en.md), robotics

---

## 1. Industrial Robot Classes

| Type | DoF | Use |
|---|---|---|
| Articulated (6-axis) | 6 | Welding, assembly (mainstream) |
| SCARA (4-axis) | 4 | Electronics assembly (fast) |
| Delta (parallel) | 3+ | High-speed pick-place |
| Cartesian (gantry) | 3 | 3D printing, CNC |
| Collaborative (cobot) | 6-7 | Co-work, safe |
| Mobile (AGV/AMR) | mobile + arm | Warehouse, hospital |
| Humanoid | 30+ | General (Optimus, Figure) |

---

## 2. Key Parameters

- **Payload**: 1 kg (cobot) ~ 1000 kg (auto)
- **Reach**: 0.5 ~ 3.5 m
- **Repeatability**: ± 0.01 ~ ± 0.1 mm
- **Speed**: 100° / s ~ 500° / s
- **Mass**: 10 ~ 1000 kg

---

## 3. Big Four

| Company | Country | Strength |
|---|---|---|
| Fanuc | Japan | #1 volume, reliable |
| ABB | Switzerland | Welding, EU market |
| KUKA | Germany (Midea-owned) | Automotive |
| Yaskawa Motoman | Japan | Welding |

China: Estun, Efort, Siasun, etc.

---

## 4. Cobot Revolution (2008+)

- **Universal Robots** UR3/5/10
- **Rethink Robotics** Sawyer / Baxter
- **Doosan**, **Techman**, **Jaka**
- Features:
  - Safe (torque limit + soft shell)
  - Force-sensitive
  - No cage required
  - Teaching (drag teach)

---

## 5. Programming Paradigms

### 5.1 Teaching Pendant

- Old style: hand-guide + teach waypoints
- Still mainstream

### 5.2 Offline Programming

- CAD + simulation (RoboDK, Process Simulate)
- Then deploy

### 5.3 ROS / Python

- ROS2 + MoveIt
- Pythonic APIs (URX, xArm SDK)

### 5.4 VLA / Foundation Model (new)

- RT-2, π0, Helix
- "Pick up the red cup" → direct execution
- Future 5-10 year revolution

---

## 6. Python — ROS2 Move

```python
import rclpy
from moveit_commander import MoveGroupCommander

rclpy.init()
arm = MoveGroupCommander("manipulator")
arm.set_pose_target([0.5, 0.0, 0.3, 0, 0, 0, 1])  # x,y,z,quaternion
plan = arm.plan()
arm.execute(plan)
```

---

## 7. End Effectors

- **Gripper**: 2-finger parallel, 3-finger
- **Suction cup**: glass, boxes
- **Welding torch**: arc, resistance, MIG/TIG
- **Spray gun**: paint
- **Tool changer**: auto tool swap

---

## 8. Application Domains

| Industry | Use |
|---|---|
| Auto | Welding, painting, assembly (top customer) |
| Electronics | SMT, assembly |
| Logistics | Pick-pack (Amazon Sparrow, Kiva) |
| Food | Packaging, palletizing |
| Pharma | Lab automation |
| Surgery | da Vinci, Mako |
| Construction | Bricklaying (experimental) |

---

## 9. Safety Standards

- **ISO 10218**: industrial robots + systems
- **ISO/TS 15066**: collaborative robots
- 4 modes: safety stop, hand-guiding, speed/separation, power/force limit
- Risk assessment required

---

## 10. AI / VLA Trends

- **OpenAI Figure 01 → Helix** (2024)
- **Tesla Optimus** (2024-2025)
- **1X Neo, Apptronik Apollo, Agility Digit**
- **π0, Octo, RT-2** etc. VLA
- Manufacturing is humanoid's first commercial target

---

## 11. Common Pitfalls

### 11.1 Cobot Totally Safe

Contact can cause bruising; true zero-risk only in PFL mode + low speed.

### 11.2 Repeatability ≠ Accuracy

Repeatable doesn't mean absolute position accurate; needs calibration.

### 11.3 ROI Single Task

Industrial robot ~ $50K-200K investment; low single-task utilization → poor ROI.

### 11.4 VLA Replaces Robot Programming

Not yet; lab demo vs production stability gap huge.

### 11.5 China Supply Chain

Domestic robots cheap, but controllers still depend on Yaskawa et al.

---

## 12. Related Concepts

- **Same section**: [3D Printing](3D_Printing.en.md), [CNC](CNC.en.md), [Industry 4.0](Industry_4.en.md)
- **Robotics**: [ROS2](../10_Robot_Integration/ROS2_Basics.en.md), [SLAM](../10_Robot_Integration/SLAM_Basics.en.md)
- **AI**: VLA — https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/

---

## References

1. **Siciliano, B. & Khatib, O. (eds.)** *Springer Handbook of Robotics*. 2nd ed., 2016.
2. **IFR** *World Robotics Report 2024*. International Federation of Robotics.
3. **ISO 10218** *Robots and robotic devices — Safety requirements*. 2011.
4. **ISO/TS 15066** *Robots and robotic devices — Collaborative robots*. 2016.
