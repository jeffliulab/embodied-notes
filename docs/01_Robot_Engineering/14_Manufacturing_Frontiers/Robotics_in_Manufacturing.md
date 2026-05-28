# 制造业中的机器人 (Robotics in Manufacturing)

> *工业机器人是制造业自动化核心。Unimate (1961, GM) 首工业机器人。Fanuc / ABB / KUKA / Yaskawa "四大家族"+ 中国 Estun / 埃斯顿。Cobot (Universal Robots 2008 起) 与人协作。年装机量 50 万+。VLA / Foundation Model 是下一代。*
>
> **难度**:Intermediate
> **前置知识**:[ROS2_Basics](../10_Robot_Integration/ROS2_Basics.md)、机器人学

---

## 1. 工业机器人分类

| 类型 | DoF | 用途 |
|---|---|---|
| Articulated (6 轴) | 6 | 焊接、组装(主流) |
| SCARA (4 轴) | 4 | 电子组装(快) |
| Delta (parallel) | 3+ | 高速拾放 |
| Cartesian (gantry) | 3 | 3D printing、CNC |
| Collaborative (cobot) | 6-7 | 协作、安全 |
| Mobile (AGV/AMR) | mobile + arm | 仓库、医院 |
| Humanoid | 30+ | 通用 (Optimus、Figure) |

---

## 2. 关键参数

- **Payload**: 1 kg (cobot) ~ 1000 kg (汽车)
- **Reach**: 0.5 ~ 3.5 m
- **Repeatability**: ± 0.01 ~ ± 0.1 mm
- **Speed**: 100° / s ~ 500° / s
- **Mass**: 10 ~ 1000 kg

---

## 3. 四大家族

| 公司 | 国 | 强项 |
|---|---|---|
| Fanuc | 日本 | 数量第一,可靠 |
| ABB | 瑞士 | 焊接、欧洲市场 |
| KUKA | 德国(美的收购) | 汽车 |
| Yaskawa Motoman | 日本 | 焊接 |

中国:Estun (埃斯顿)、Efort、新松等。

---

## 4. Cobot 革命 (2008+)

- **Universal Robots** UR3/5/10
- **Rethink Robotics** Sawyer / Baxter
- **Doosan**、**Techman**、**节卡 Jaka**
- 特点:
  - 安全(扭矩限制 + 软外壳)
  - Force-sensitive
  - 无 cage 安装
  - 教学(drag teaching)

---

## 5. 编程范式

### 5.1 Teaching pendant

- 老式:手把手 + 示教点位
- 主流仍用

### 5.2 Offline programming

- CAD + 仿真(RoboDK、Process Simulate)
- 然后下发

### 5.3 ROS / Python

- ROS2 + MoveIt
- Pythonic API(URX、xArm SDK)

### 5.4 VLA / Foundation Model (新)

- RT-2、π0、Helix
- "拿起红色的杯子" → 直接执行
- 未来 5-10 年大改变

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

## 7. End Effector

- **Gripper**: 2-finger parallel、3-finger
- **Suction cup**: 玻璃、纸箱
- **Welding torch**: arc、resistance、MIG/TIG
- **Spray gun**: 喷漆
- **Tool changer**: 自动换工具

---

## 8. 应用领域

| 行业 | 用 |
|---|---|
| Auto | 焊接、喷涂、装配(主用户) |
| Electronics | SMT、组装 |
| Logistics | Pick-pack(Amazon Sparrow、Kiva) |
| Food | 包装、码垛 |
| Pharma | 实验室自动化 |
| Surgery | da Vinci、Mako |
| Construction | 砌墙(实验中) |

---

## 9. 安全标准

- **ISO 10218**: 工业机器人 + 系统
- **ISO/TS 15066**: 协作机器人
- 4 modes:safety stop、hand-guiding、speed/separation、power/force limit
- Risk assessment 必做

---

## 10. AI / VLA 趋势

- **OpenAI Figure 01 → Helix** (2024)
- **Tesla Optimus** (2024-2025)
- **1X Neo, Apptronik Apollo, Agility Digit**
- **π0, Octo, RT-2** 等 VLA
- Manufacturing 是 humanoid 首批商业目标

---

## 11. 常见问题

### 11.1 Cobot 完全安全

接触可造成 bruising;真零风险只在 PFL 模式 + low speed。

### 11.2 Repeatability ≠ Accuracy

Repeatable 不代表 absolute position 精;须 calibration。

### 11.3 ROI 单一 task

工业 robot 投资 ~ $50K-200K;单 task 利用率低 → ROI 差。

### 11.4 VLA 取代 robot 编程

未实现;实验室 demo 与生产稳定性差距大。

### 11.5 China supply chain

国产 robot 价格大降,但 controller 算法仍依赖 Yaskawa 等。

---

## 12. Related Concepts

- **同节**:[3D Printing](3D_Printing.md)、[CNC](CNC.md)、[Industry 4.0](Industry_4.md)
- **机器人**:[ROS2](../10_Robot_Integration/ROS2_Basics.md)、[SLAM](../10_Robot_Integration/SLAM_Basics.md)
- **AI**: VLA — https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/

---

## References

1. **Siciliano, B. & Khatib, O. (eds.)** *Springer Handbook of Robotics*. 2nd ed., 2016.
2. **IFR** *World Robotics Report 2024*. International Federation of Robotics.
3. **ISO 10218** *Robots and robotic devices — Safety requirements*. 2011.
4. **ISO/TS 15066** *Robots and robotic devices — Collaborative robots*. 2016.
