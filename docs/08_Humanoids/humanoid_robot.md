# 人形机器人

## 概述：为什么要做人形机器人？

人形机器人（Humanoid Robot）一直是机器人开发者的终极目标。选择人形形态有几个核心原因：

1. **环境兼容性**：人类世界的基础设施（楼梯、门把手、工具、家具）都是为人体尺寸和形态设计的，人形机器人无需改造环境即可直接使用
2. **人机交互**：人形外观更容易被人接受，便于协作场景中的自然交互
3. **通用性**：相比轮式或四足机器人，双足人形具有最高的任务通用性——能走、能爬、能操作
4. **示范学习**：人形结构使得可以直接从人类示范中学习动作，降低了数据采集成本

### 人形机器人的核心挑战

- **高维控制**：通常有 20-50 个自由度，控制空间巨大
- **欠驱动系统**：双足行走本质上是不稳定的，需要持续平衡控制
- **接触动力学**：脚与地面的接触力建模困难，且具有不连续性
- **能量效率**：双足行走的能量效率远低于轮式运动
- **硬件复杂度**：关节驱动器、传感器、电池等的集成极具挑战

---

## 双足运动控制

### ZMP（Zero Moment Point）

ZMP 是双足机器人步态规划中最经典的概念。ZMP 定义为**地面反力合力矩为零的点**。

**稳定性判据**：当 ZMP 位于支撑多边形（support polygon）内部时，机器人保持动态平衡。

$$
\mathbf{p}_{ZMP} = \frac{\sum_i m_i(\ddot{z}_i + g)x_i - \sum_i m_i \ddot{x}_i z_i}{\sum_i m_i(\ddot{z}_i + g)}
$$

**ZMP 规划流程**：

1. 设计脚步序列（footstep planning）
2. 根据 ZMP 约束生成质心（CoM）轨迹
3. 通过逆运动学计算关节轨迹
4. 执行并用传感器反馈修正

### 线性倒立摆模型（LIPM）

LIPM 是双足步态生成的核心简化模型，将机器人质心运动简化为一个固定高度的倒立摆：

$$
\ddot{x} = \frac{g}{z_c}(x - p_x)
$$

其中 $z_c$ 是质心高度（常数），$p_x$ 是 ZMP 位置。

**Capture Point（捕获点）**：机器人在当前状态下，需要迈脚到达的位置才能停下来而不跌倒：

$$
\xi = x + \frac{\dot{x}}{\omega_0}, \quad \omega_0 = \sqrt{\frac{g}{z_c}}
$$

捕获点理论被广泛用于推动恢复（push recovery）和实时步态调整。

### 步态生成

**步态相位**：

- **单支撑期（Single Support Phase）**：一只脚支撑，另一只脚摆动
- **双支撑期（Double Support Phase）**：两只脚同时着地，重心转移
- **步态周期**：一个完整的左右脚交替过程

**步态参数**：步长、步宽、步频、质心高度、脚抬升高度

---

## 全身运动控制

### 整体动力学（Whole-Body Dynamics）

人形机器人具有浮动基座（floating base），其动力学方程为：

$$
M(\mathbf{q})\ddot{\mathbf{q}} + C(\mathbf{q}, \dot{\mathbf{q}})\dot{\mathbf{q}} + G(\mathbf{q}) = S^T \boldsymbol{\tau} + J_c^T \mathbf{f}_c
$$

其中：

- $S$：选择矩阵（选择被驱动的关节）
- $J_c$：接触雅可比矩阵
- $\mathbf{f}_c$：接触力

### 接触力优化

接触力必须满足摩擦锥约束：

$$
\sqrt{f_x^2 + f_y^2} \leq \mu f_z, \quad f_z \geq 0
$$

通常将其线性化为摩擦锥多面体近似，然后用 QP（二次规划）求解。

### 任务优先级控制

人形机器人需要同时满足多个任务（平衡、行走、手部操作等），使用任务优先级框架：

1. **最高优先级**：保持平衡（ZMP 在支撑区域内）
2. **次高优先级**：跟踪脚步轨迹
3. **较低优先级**：上身姿态 / 手部操作任务

通过零空间投影（Null-space projection）实现优先级分层。

---

## 代表性平台

### Atlas（Boston Dynamics）

- **自由度**：28 个液压驱动关节
- **特点**：液压驱动、极高的动态性能（后空翻、跑酷、跳舞）
- **控制方案**：轨迹优化 + MPC + 全身控制
- **2024 更新**：推出全电驱版本 Atlas，放弃液压路线
- **意义**：展示了经典控制方法在人形机器人上的极限能力

### Optimus（Tesla）

- **自由度**：28 个（全身）+ 11 个（每只手）
- **特点**：电驱动、面向量产的设计理念
- **目标**：通用人形工人，执行工厂和家庭任务
- **技术路线**：借鉴 Tesla FSD 的端到端神经网络方法
- **进展**：从缓慢行走到能分拣物品、折叠衣物

### Figure 01 / Figure 02

- **特点**：与 OpenAI 合作，集成大模型进行自然语言交互
- **技术路线**：视觉-语言模型 + 学习型操作
- **融资**：获得大量投资，估值迅速攀升
- **定位**：面向商业部署的通用人形机器人

### Digit（Agility Robotics）

- **特点**：面向物流场景的人形机器人
- **设计**：4 自由度腿、专为搬运箱子优化
- **部署**：已在亚马逊仓库进行试点
- **意义**：最接近商业部署的人形机器人之一

---

## 学习方法

### Sim-to-Real 迁移

在仿真中训练策略，然后部署到真实机器人，是当前人形机器人控制的主流范式。

**关键技术**：

- **域随机化（Domain Randomization）**：在仿真中随机化物理参数（摩擦、质量、地形）使策略更鲁棒
- **课程学习（Curriculum Learning）**：从简单地形逐步增加难度
- **师生蒸馏（Teacher-Student Distillation）**：教师策略使用特权信息（如精确地形高度图），学生策略仅使用真实可获取的传感器数据

### 强化学习步态控制

**常用算法**：PPO（Proximal Policy Optimization）最为流行

**奖励设计**（典型）：

```python
reward = (
    w_vel * tracking_velocity_reward    # 跟踪目标速度
    + w_alive * alive_bonus             # 存活奖励
    - w_energy * energy_penalty         # 能量惩罚
    - w_smooth * action_smoothness      # 动作平滑惩罚
    - w_contact * undesired_contact     # 非期望接触惩罚
    - w_orient * orientation_penalty    # 躯干姿态惩罚
)
```

**代表性工作**：

- **Legged Gym / Isaac Lab**：NVIDIA 开源的四足/人形机器人 RL 训练框架
- **Berkeley Humanoid**（2024）：在真实小型人形机器人上实现零样本 Sim-to-Real 步态
- **H2O / HumanPlus**：从人类动作捕捉数据训练人形全身控制

---

## 操纵与灵巧手

### 灵巧手的挑战

- **高自由度**：人手有约 20 个自由度，控制空间极大
- **接触丰富**：抓取和操作涉及复杂的多点接触
- **传感需求**：需要触觉传感器提供接触力反馈
- **精度要求**：精密操作要求亚毫米级精度

### 灵巧操作方法

**基于学习的方法**：

- **DexterousHand（OpenAI, 2019）**：用 RL 训练 Shadow Hand 在仿真中翻转魔方
- **AnyGrasp / GraspNet**：基于点云的通用抓取检测
- **DAPG（Demo Augmented Policy Gradient）**：结合示范数据加速 RL 训练

**遥操作与示范**：

- 使用 VR 手套或数据手套进行遥操作数据采集
- ALOHA / Mobile ALOHA：低成本双臂遥操作系统
- 通过模仿学习（Imitation Learning）训练操作策略

### 人形机器人操作的未来

- **双手协调**：两只手协同操作（如拧瓶盖、折衣服）
- **全身协调操作**：步态与操作的联合优化（如边走边搬运）
- **基础模型**：视觉-语言-动作模型（VLA）赋能通用操作

---

## 参考资料

- Kajita et al., *Introduction to Humanoid Robotics*, Springer
- Boston Dynamics Atlas: [bostondynamics.com](https://bostondynamics.com)
- Legged Gym: [github.com/leggedrobotics/legged_gym](https://github.com/leggedrobotics/legged_gym)
- Figure AI: [figure.ai](https://figure.ai)
