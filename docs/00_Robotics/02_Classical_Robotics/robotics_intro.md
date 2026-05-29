# 机器人学综述与主要内容

## 历史综述

机器人学（Robotics）是一门融合机械工程、电气工程、计算机科学与人工智能的交叉学科。其发展历程可以大致分为三个阶段：

### 工业机器人时代（1960s-1990s）

- **1961年**：Unimate 成为第一台投入工业生产的机器人，在通用汽车的装配线上工作
- **1969年**：斯坦福大学 Victor Scheinman 设计了 Stanford Arm，成为电动机器人臂的先驱
- **1970s-1980s**：PUMA（Programmable Universal Machine for Assembly）系列机器人广泛应用于制造业
- **特点**：固定基座、预编程轨迹、重复性任务（焊接、喷涂、搬运）
- **代表算法**：PTP（Point-to-Point）控制、PID调节、轨迹插值

### 移动机器人时代（1990s-2010s）

- **1997年**：NASA 的 Sojourner 火星车成功登陆火星
- **2000s**：DARPA Grand Challenge 推动自动驾驶技术发展
- **2004年**：iRobot Roomba 开创消费级服务机器人市场
- **2005年**：Boston Dynamics 的 BigDog 展示了动态平衡四足行走
- **特点**：自主导航、环境感知、动态运动控制
- **关键技术**：SLAM、路径规划、视觉里程计

### 智能机器人时代（2010s-至今）

- **2013年**：Boston Dynamics Atlas 展示了人形机器人的高动态运动
- **2016年**：AlphaGo 引发 AI 革命，深度学习渗透到机器人各个领域
- **2020s**：大模型（LLM）赋能机器人，实现自然语言交互与任务规划
- **特点**：学习与自适应、多模态感知、人机协作
- **关键技术**：深度强化学习、Sim-to-Real、基础模型（Foundation Models）

---

## 非学习方法

虽然机器人学习是如今的研究主流，但在过去几十年的机器人发展历史中，许多机器人系统完全不依赖学习算法就实现了极强的能力。经典方法在可靠性、可解释性和安全性方面仍然具有不可替代的优势。

### 经典控制理论的重大成就

| 成就 | 核心方法 | 年代 |
|------|----------|------|
| 阿波罗11号登月 | 轨迹优化 + 鲁棒控制 | 1969 |
| 火星车自主导航 | 路径规划 + 视觉里程计 | 1997-至今 |
| Boston Dynamics Atlas | 轨迹优化 + MPC + 全身控制 | 2013-至今 |
| 工业机器人焊接 | 逆运动学 + PID控制 | 1970s-至今 |
| 手术机器人 da Vinci | 主从遥操作 + 运动缩放 | 2000-至今 |

### 经典方法 vs 学习方法

- **经典方法优势**：可解释性强、安全保障明确、不需要大量数据、实时性好
- **学习方法优势**：适应性强、能处理高维感知、可应对难以建模的场景
- **趋势**：两者深度融合——用学习方法处理感知与高层决策，用经典方法保障底层安全

---

## Kinematics（运动学）

运动学研究机器人关节运动与末端执行器位姿之间的几何关系，**不考虑力和力矩**。

### 正运动学（Forward Kinematics）

给定所有关节角度 $\mathbf{q} = [q_1, q_2, \ldots, q_n]^T$，求末端执行器的位姿 $\mathbf{T}_{0n}$。

**DH参数法（Denavit-Hartenberg Convention）**：

每个关节由4个参数描述：

| 参数 | 含义 |
|------|------|
| $\theta_i$ | 关节角（绕 $z_{i-1}$ 轴旋转） |
| $d_i$ | 连杆偏移（沿 $z_{i-1}$ 轴平移） |
| $a_i$ | 连杆长度（沿 $x_i$ 轴平移） |
| $\alpha_i$ | 连杆扭转角（绕 $x_i$ 轴旋转） |

每个关节的齐次变换矩阵：

$$
A_i = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i \cos\alpha_i & \sin\theta_i \sin\alpha_i & a_i\cos\theta_i \\
\sin\theta_i & \cos\theta_i \cos\alpha_i & -\cos\theta_i \sin\alpha_i & a_i\sin\theta_i \\
0 & \sin\alpha_i & \cos\alpha_i & d_i \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

正运动学的总变换：$T_{0n} = A_1 A_2 \cdots A_n$

### 逆运动学（Inverse Kinematics）

给定末端执行器的目标位姿 $\mathbf{T}_{target}$，求关节角度 $\mathbf{q}$。这是一个从任务空间到关节空间的映射，通常比正运动学困难得多。

**解析法（Analytical/Closed-Form）**：

- 适用于特殊结构（如 6-DOF 带球形手腕的机械臂）
- 利用几何关系和代数方程直接求解
- 优点：速度快、精度高
- 缺点：只适用于特定构型

**数值法（Numerical Methods）**：

- **雅可比迭代法**：利用雅可比矩阵 $J(\mathbf{q})$ 建立关节速度与末端速度的关系

$$
\dot{\mathbf{x}} = J(\mathbf{q})\dot{\mathbf{q}}
$$

通过迭代 $\Delta \mathbf{q} = J^{\dagger} \Delta \mathbf{x}$ 逼近目标（$J^{\dagger}$ 为伪逆）

- **CCD（Cyclic Coordinate Descent）**：逐关节优化，常用于动画和游戏
- **FABRIK（Forward And Backward Reaching Inverse Kinematics）**：基于几何启发的高效算法

---

## Dynamics（动力学）

动力学研究力/力矩与运动之间的关系，是机器人控制的核心基础。

### 拉格朗日方程（Lagrangian Formulation）

基于能量方法，定义拉格朗日量 $L = T - V$（动能 - 势能）：

$$
\frac{d}{dt}\frac{\partial L}{\partial \dot{q}_i} - \frac{\partial L}{\partial q_i} = \tau_i
$$

整理为标准形式：

$$
M(\mathbf{q})\ddot{\mathbf{q}} + C(\mathbf{q}, \dot{\mathbf{q}})\dot{\mathbf{q}} + G(\mathbf{q}) = \boldsymbol{\tau}
$$

其中：

- $M(\mathbf{q})$：质量/惯性矩阵（正定对称）
- $C(\mathbf{q}, \dot{\mathbf{q}})$：科里奥利力和离心力矩阵
- $G(\mathbf{q})$：重力项
- $\boldsymbol{\tau}$：关节力矩向量

### 牛顿-欧拉方程（Newton-Euler Formulation）

基于力/力矩平衡的递推方法，计算效率为 $O(n)$（n 为关节数）：

1. **正向递推**（从基座到末端）：计算每个连杆的速度、加速度
2. **反向递推**（从末端到基座）：计算每个关节的力和力矩

相比拉格朗日方法，牛顿-欧拉方法在实时控制中更常用，因为计算复杂度低。

### 动力学仿真

常用的机器人动力学仿真器：

| 仿真器 | 特点 | 适用场景 |
|--------|------|----------|
| MuJoCo | 高效接触动力学、GPU加速 | RL训练、灵巧操作 |
| PyBullet | 开源免费、易于上手 | 快速原型验证 |
| Isaac Sim | NVIDIA GPU加速、逼真渲染 | Sim-to-Real |
| Gazebo | ROS集成、社区活跃 | 移动机器人 |
| Drake | 优化为核心、数学严谨 | 操作规划 |

---

## Perception（感知）

### SLAM（Simultaneous Localization and Mapping）

SLAM 是移动机器人的核心问题：在未知环境中，同时构建地图并定位自身。

**EKF-SLAM（扩展卡尔曼滤波 SLAM）**：

- 将机器人位姿和所有路标位置合并为一个大状态向量
- 使用 EKF 进行预测和更新
- 缺点：计算复杂度 $O(n^2)$（n 为路标数），不适合大规模环境
- 状态向量：$\mathbf{x}_t = [\mathbf{r}_t, \mathbf{m}_1, \mathbf{m}_2, \ldots, \mathbf{m}_n]^T$

**FastSLAM（粒子滤波 SLAM）**：

- 使用粒子滤波估计机器人轨迹
- 每个粒子维护独立的路标地图（EKF）
- 利用 Rao-Blackwellization 分解，降低复杂度
- FastSLAM 2.0 在提议分布中加入最新观测，提高效率

**视觉 SLAM**：ORB-SLAM、LSD-SLAM、VINS-Mono 等

### 视觉里程计（Visual Odometry）

通过连续图像帧之间的特征匹配，估计相机（机器人）的运动：

1. 特征提取（ORB, SIFT, SuperPoint）
2. 特征匹配
3. 运动估计（本质矩阵 / PnP）
4. 局部优化（Bundle Adjustment）

### 点云处理

- **3D点云配准**：ICP（Iterative Closest Point）算法
- **点云分割**：PointNet / PointNet++ 等深度学习方法
- **3D目标检测**：VoxelNet、PointPillars
- **传感器融合**：激光雷达 + 相机的多模态融合

---

## Control（控制）

### PID 控制

最经典的反馈控制方法：

$$
u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}
$$

- **P（比例）**：当前误差
- **I（积分）**：累积误差（消除稳态误差）
- **D（微分）**：误差变化率（预测趋势、抑制振荡）

**调参方法**：Ziegler-Nichols法、试凑法、自动调参

### LQR（线性二次调节器）

对于线性系统 $\dot{\mathbf{x}} = A\mathbf{x} + B\mathbf{u}$，最小化二次代价函数：

$$
J = \int_0^\infty (\mathbf{x}^T Q \mathbf{x} + \mathbf{u}^T R \mathbf{u}) dt
$$

最优控制律为 $\mathbf{u} = -K\mathbf{x}$，其中 $K = R^{-1}B^T P$，$P$ 由 Riccati 方程求解。

- **Q 矩阵**：状态偏差的惩罚权重
- **R 矩阵**：控制量的惩罚权重
- LQR 提供了**最优**的线性状态反馈控制

### MPC（模型预测控制）

MPC 在每个时间步求解有限时域的最优控制问题：

$$
\min_{\mathbf{u}_{0:N-1}} \sum_{k=0}^{N-1} \ell(\mathbf{x}_k, \mathbf{u}_k) + V_f(\mathbf{x}_N)
$$

$$
\text{s.t.} \quad \mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k), \quad \mathbf{x}_k \in \mathcal{X}, \quad \mathbf{u}_k \in \mathcal{U}
$$

**核心优势**：

- 自然处理约束（关节限位、力矩限制、障碍物回避）
- 可以处理非线性系统
- 滚动时域优化，具有一定鲁棒性

**常用求解器**：OSQP、IPOPT、acados、CasADi

---

## Planning（规划）

### 路径规划

| 算法 | 类型 | 特点 |
|------|------|------|
| A* | 图搜索 | 最优性保证、需要离散化 |
| D* / D* Lite | 增量搜索 | 适合动态环境、可重规划 |
| PRM | 采样 | 多查询高效、预处理阶段耗时 |
| RRT | 采样 | 单查询高效、高维空间友好 |
| RRT* | 采样 | 渐近最优、收敛较慢 |

### 轨迹优化

轨迹优化在满足动力学和约束条件下，生成平滑的运动轨迹：

- **CHOMP（Covariant Hamiltonian Optimization for Motion Planning）**：基于梯度的轨迹优化，利用代价函数的协变梯度
- **STOMP（Stochastic Trajectory Optimization for Motion Planning）**：无需梯度，通过随机采样探索轨迹空间
- **TrajOpt**：基于序列凸优化（Sequential Convex Optimization）
- **iLQR / DDP**：基于动力学模型的迭代优化方法

### 与 AI 规划的交叉

!!! note "交叉引用"
    机器人规划与 AI 规划有密切联系。关于 AI 中的搜索算法、启发式方法和决策规划，请参阅：

    - 经典 AI 搜索算法（A*、蒙特卡洛树搜索）
    - 强化学习中的规划（Model-Based RL、MCTS）
    - 大模型赋能的任务规划（SayCan、Code as Policies）

现代机器人规划越来越多地结合学习方法：

- **运动基元学习（Movement Primitives）**：DMP、ProMP
- **学习型代价函数**：通过示范学习或逆强化学习获取规划的代价函数
- **端到端规划**：直接从感知到动作的神经网络规划器
- **LLM + 规划**：利用大语言模型进行高层任务分解，底层仍使用经典运动规划

---

## 参考资料

- Siciliano et al., *Robotics: Modelling, Planning and Control*, Springer
- Lynch & Park, *Modern Robotics: Mechanics, Planning, and Control*, Cambridge University Press
- Thrun, Burgard & Fox, *Probabilistic Robotics*, MIT Press
- LaValle, *Planning Algorithms*, Cambridge University Press
