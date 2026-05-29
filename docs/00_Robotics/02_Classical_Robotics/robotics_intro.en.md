# Overview of Robotics and Key Topics

## Historical Overview

Robotics is an interdisciplinary field spanning mechanical engineering, electrical engineering, computer science, and artificial intelligence. Its development can be broadly divided into three eras:

### The Industrial Robot Era (1960s-1990s)

- **1961**: Unimate became the first industrial robot deployed in production, working on General Motors' assembly line
- **1969**: Victor Scheinman at Stanford designed the Stanford Arm, a pioneer in electric robotic arms
- **1970s-1980s**: PUMA (Programmable Universal Machine for Assembly) robots gained widespread adoption in manufacturing
- **Characteristics**: Fixed-base, pre-programmed trajectories, repetitive tasks (welding, painting, material handling)
- **Key algorithms**: PTP (Point-to-Point) control, PID regulation, trajectory interpolation

### The Mobile Robot Era (1990s-2010s)

- **1997**: NASA's Sojourner rover successfully landed on Mars
- **2000s**: The DARPA Grand Challenge accelerated autonomous driving technology
- **2004**: iRobot Roomba launched the consumer service robot market
- **2005**: Boston Dynamics' BigDog demonstrated dynamically balanced quadruped locomotion
- **Characteristics**: Autonomous navigation, environmental perception, dynamic motion control
- **Key technologies**: SLAM, path planning, visual odometry

### The Intelligent Robot Era (2010s-present)

- **2013**: Boston Dynamics Atlas showcased highly dynamic humanoid locomotion
- **2016**: AlphaGo sparked an AI revolution; deep learning permeated every area of robotics
- **2020s**: Large Language Models (LLMs) empower robots with natural language interaction and task planning
- **Characteristics**: Learning and adaptation, multimodal perception, human-robot collaboration
- **Key technologies**: Deep reinforcement learning, Sim-to-Real, Foundation Models

---

## Non-Learning Methods

Although robot learning dominates current research, over the past few decades many robotic systems have achieved remarkable capabilities without relying on learning algorithms at all. Classical methods still hold irreplaceable advantages in reliability, interpretability, and safety.

### Major Achievements of Classical Control Theory

| Achievement | Core Methods | Year |
|-------------|-------------|------|
| Apollo 11 Moon Landing | Trajectory optimization + robust control | 1969 |
| Mars Rover Autonomous Navigation | Path planning + visual odometry | 1997-present |
| Boston Dynamics Atlas | Trajectory optimization + MPC + whole-body control | 2013-present |
| Industrial Robot Welding | Inverse kinematics + PID control | 1970s-present |
| da Vinci Surgical Robot | Master-slave teleoperation + motion scaling | 2000-present |

### Classical Methods vs. Learning Methods

- **Classical method strengths**: High interpretability, clear safety guarantees, no large datasets required, excellent real-time performance
- **Learning method strengths**: Strong adaptability, handles high-dimensional perception, manages scenarios that are difficult to model
- **Trend**: Deep integration of both -- learning methods for perception and high-level decision-making, classical methods for low-level safety guarantees

---

## Kinematics

Kinematics studies the geometric relationship between robot joint motions and end-effector pose, **without considering forces or torques**.

### Forward Kinematics

Given all joint angles $\mathbf{q} = [q_1, q_2, \ldots, q_n]^T$, compute the end-effector pose $\mathbf{T}_{0n}$.

**Denavit-Hartenberg (DH) Convention**:

Each joint is described by four parameters:

| Parameter | Meaning |
|-----------|---------|
| $\theta_i$ | Joint angle (rotation about $z_{i-1}$) |
| $d_i$ | Link offset (translation along $z_{i-1}$) |
| $a_i$ | Link length (translation along $x_i$) |
| $\alpha_i$ | Link twist (rotation about $x_i$) |

The homogeneous transformation matrix for each joint:

$$
A_i = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i \cos\alpha_i & \sin\theta_i \sin\alpha_i & a_i\cos\theta_i \\
\sin\theta_i & \cos\theta_i \cos\alpha_i & -\cos\theta_i \sin\alpha_i & a_i\sin\theta_i \\
0 & \sin\alpha_i & \cos\alpha_i & d_i \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

The complete forward kinematics transformation: $T_{0n} = A_1 A_2 \cdots A_n$

### Inverse Kinematics

Given a desired end-effector pose $\mathbf{T}_{target}$, find the joint angles $\mathbf{q}$. This is a mapping from task space to joint space and is generally much harder than forward kinematics.

**Analytical (Closed-Form) Methods**:

- Applicable to special structures (e.g., 6-DOF manipulators with spherical wrists)
- Directly solve using geometric relationships and algebraic equations
- Pros: Fast computation, high accuracy
- Cons: Only applicable to specific configurations

**Numerical Methods**:

- **Jacobian iteration**: Uses the Jacobian matrix $J(\mathbf{q})$ to relate joint velocities to end-effector velocities

$$
\dot{\mathbf{x}} = J(\mathbf{q})\dot{\mathbf{q}}
$$

Iterate $\Delta \mathbf{q} = J^{\dagger} \Delta \mathbf{x}$ to approach the target ($J^{\dagger}$ is the pseudoinverse)

- **CCD (Cyclic Coordinate Descent)**: Optimizes one joint at a time; commonly used in animation and gaming
- **FABRIK (Forward And Backward Reaching Inverse Kinematics)**: An efficient geometry-inspired algorithm

---

## Dynamics

Dynamics studies the relationship between forces/torques and motion, forming the core foundation of robot control.

### Lagrangian Formulation

Based on energy methods, define the Lagrangian $L = T - V$ (kinetic energy minus potential energy):

$$
\frac{d}{dt}\frac{\partial L}{\partial \dot{q}_i} - \frac{\partial L}{\partial q_i} = \tau_i
$$

Rearranged into standard form:

$$
M(\mathbf{q})\ddot{\mathbf{q}} + C(\mathbf{q}, \dot{\mathbf{q}})\dot{\mathbf{q}} + G(\mathbf{q}) = \boldsymbol{\tau}
$$

Where:

- $M(\mathbf{q})$: Mass/inertia matrix (positive definite and symmetric)
- $C(\mathbf{q}, \dot{\mathbf{q}})$: Coriolis and centrifugal force matrix
- $G(\mathbf{q})$: Gravity vector
- $\boldsymbol{\tau}$: Joint torque vector

### Newton-Euler Formulation

A recursive method based on force/torque balance with $O(n)$ computational complexity (n = number of joints):

1. **Forward recursion** (base to tip): Compute velocities and accelerations for each link
2. **Backward recursion** (tip to base): Compute forces and torques at each joint

Compared to the Lagrangian method, the Newton-Euler formulation is more commonly used in real-time control due to its lower computational complexity.

### Dynamics Simulation

Commonly used robot dynamics simulators:

| Simulator | Features | Use Cases |
|-----------|----------|-----------|
| MuJoCo | Efficient contact dynamics, GPU acceleration | RL training, dexterous manipulation |
| PyBullet | Open-source, easy to use | Rapid prototyping |
| Isaac Sim | NVIDIA GPU acceleration, photorealistic rendering | Sim-to-Real |
| Gazebo | ROS integration, active community | Mobile robots |
| Drake | Optimization-centric, mathematically rigorous | Manipulation planning |

---

## Perception

### SLAM (Simultaneous Localization and Mapping)

SLAM is a core problem in mobile robotics: simultaneously building a map and localizing within it in an unknown environment.

**EKF-SLAM (Extended Kalman Filter SLAM)**:

- Concatenates the robot pose and all landmark positions into a single large state vector
- Uses the EKF for prediction and update steps
- Drawback: $O(n^2)$ computational complexity (n = number of landmarks); unsuitable for large-scale environments
- State vector: $\mathbf{x}_t = [\mathbf{r}_t, \mathbf{m}_1, \mathbf{m}_2, \ldots, \mathbf{m}_n]^T$

**FastSLAM (Particle Filter SLAM)**:

- Uses particle filters to estimate the robot trajectory
- Each particle maintains an independent landmark map (via EKF)
- Leverages Rao-Blackwellization to reduce complexity
- FastSLAM 2.0 incorporates the latest observation into the proposal distribution for improved efficiency

**Visual SLAM**: ORB-SLAM, LSD-SLAM, VINS-Mono, and others

### Visual Odometry

Estimates camera (robot) motion by matching features across consecutive image frames:

1. Feature extraction (ORB, SIFT, SuperPoint)
2. Feature matching
3. Motion estimation (Essential matrix / PnP)
4. Local optimization (Bundle Adjustment)

### Point Cloud Processing

- **3D point cloud registration**: ICP (Iterative Closest Point) algorithm
- **Point cloud segmentation**: Deep learning methods such as PointNet / PointNet++
- **3D object detection**: VoxelNet, PointPillars
- **Sensor fusion**: Multimodal fusion of LiDAR and cameras

---

## Control

### PID Control

The most classical feedback control method:

$$
u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}
$$

- **P (Proportional)**: Current error
- **I (Integral)**: Accumulated error (eliminates steady-state error)
- **D (Derivative)**: Rate of error change (predicts trends, suppresses oscillations)

**Tuning methods**: Ziegler-Nichols method, manual tuning, auto-tuning

### LQR (Linear Quadratic Regulator)

For a linear system $\dot{\mathbf{x}} = A\mathbf{x} + B\mathbf{u}$, minimize the quadratic cost function:

$$
J = \int_0^\infty (\mathbf{x}^T Q \mathbf{x} + \mathbf{u}^T R \mathbf{u}) dt
$$

The optimal control law is $\mathbf{u} = -K\mathbf{x}$, where $K = R^{-1}B^T P$ and $P$ is obtained by solving the Riccati equation.

- **Q matrix**: Penalty weights on state deviation
- **R matrix**: Penalty weights on control effort
- LQR provides the **optimal** linear state-feedback control

### MPC (Model Predictive Control)

MPC solves a finite-horizon optimal control problem at each time step:

$$
\min_{\mathbf{u}_{0:N-1}} \sum_{k=0}^{N-1} \ell(\mathbf{x}_k, \mathbf{u}_k) + V_f(\mathbf{x}_N)
$$

$$
\text{s.t.} \quad \mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k), \quad \mathbf{x}_k \in \mathcal{X}, \quad \mathbf{u}_k \in \mathcal{U}
$$

**Core advantages**:

- Naturally handles constraints (joint limits, torque limits, obstacle avoidance)
- Can handle nonlinear systems
- Receding-horizon optimization provides a degree of robustness

**Common solvers**: OSQP, IPOPT, acados, CasADi

---

## Planning

### Path Planning

| Algorithm | Type | Features |
|-----------|------|----------|
| A* | Graph search | Optimality guarantee, requires discretization |
| D* / D* Lite | Incremental search | Suitable for dynamic environments, supports replanning |
| PRM | Sampling-based | Efficient for multi-query, expensive preprocessing |
| RRT | Sampling-based | Efficient for single-query, friendly to high-dimensional spaces |
| RRT* | Sampling-based | Asymptotically optimal, slower convergence |

### Trajectory Optimization

Trajectory optimization generates smooth motion trajectories while satisfying dynamics and constraints:

- **CHOMP (Covariant Hamiltonian Optimization for Motion Planning)**: Gradient-based trajectory optimization using the covariant gradient of the cost function
- **STOMP (Stochastic Trajectory Optimization for Motion Planning)**: Gradient-free; explores the trajectory space through stochastic sampling
- **TrajOpt**: Based on Sequential Convex Optimization
- **iLQR / DDP**: Iterative optimization methods grounded in dynamics models

### Intersection with AI Planning

!!! note "Cross-References"
    Robot planning has close ties to AI planning. For search algorithms, heuristic methods, and decision planning in AI, see:

    - Classical AI search algorithms (A*, Monte Carlo Tree Search)
    - Planning in reinforcement learning (Model-Based RL, MCTS)
    - LLM-powered task planning (SayCan, Code as Policies)

Modern robot planning increasingly incorporates learning methods:

- **Movement Primitives**: DMP, ProMP
- **Learned cost functions**: Obtain planning cost functions through learning from demonstrations or inverse RL
- **End-to-end planning**: Neural network planners mapping directly from perception to action
- **LLM + Planning**: Use large language models for high-level task decomposition while retaining classical motion planning at the low level

---

## References

- Siciliano et al., *Robotics: Modelling, Planning and Control*, Springer
- Lynch & Park, *Modern Robotics: Mechanics, Planning, and Control*, Cambridge University Press
- Thrun, Burgard & Fox, *Probabilistic Robotics*, MIT Press
- LaValle, *Planning Algorithms*, Cambridge University Press
