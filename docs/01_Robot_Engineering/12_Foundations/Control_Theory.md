# 控制理论基础 — PID 到 MPC

> *控制理论让"系统"按期望行为动作:车辆 cruise control、机器人轨迹跟踪、无人机姿态、温度调节。本篇覆盖 PID 经典控制、State-Space、稳定性、Model Predictive Control (MPC) — 现代机器人控制基础。*
>
> **难度**:Intermediate-Advanced
> **前置知识**:[信号处理](Signal_Processing.md)、微积分、线性代数
> **后续阅读**:[FOC 电机控制](../06_Actuators_Motors/无刷电机与FOC.md)

---

## 1. 控制系统基本概念

```
┌─────────┐   ┌─────────┐   ┌──────────┐
│ Setpoint│──▶│Controller│──▶│  Plant   │──▶ Output
└─────────┘   └─────────┘   └──────────┘
                  ▲                │
                  └────────────────┘
                       feedback
```

- **Setpoint** (参考): 目标值
- **Plant**: 被控对象 (motor / 车 / 温度系统)
- **Controller**: 算 control signal
- **Feedback**: sensor 读 output

**Closed-loop** = 有 feedback;**Open-loop** = 无。

---

## 2. PID 控制 (Proportional-Integral-Derivative)

最常用控制器:

$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}$$

其中 $e(t) = \text{setpoint} - \text{output}$。

### 2.1 P (比例)

- 误差越大,control 越大
- 单 P:**稳态误差** (steady-state error) 存在

### 2.2 I (积分)

- 累积过去误差
- 消除 steady-state error
- 副作用: integral windup (积分饱和)

### 2.3 D (微分)

- 看误差变化率
- 阻尼 overshoot
- 副作用: 放大 noise

### 2.4 调参经验

- 太小 P: 慢
- 太大 P: 振荡
- 太大 I: overshoot + 振荡
- 太大 D: noise 敏感

Ziegler-Nichols 法:
1. I/D = 0, P 从小调大,直到振荡
2. 记 $K_u$ (临界增益) 和 $T_u$ (振荡周期)
3. PID: $K_p = 0.6 K_u, K_i = 1.2 K_u / T_u, K_d = 0.075 K_u T_u$

---

## 3. PyTorch / Python — PID 实现

```python
class PID:
    def __init__(self, kp, ki, kd, dt=0.01):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.dt = dt
        self.integral = 0
        self.prev_error = 0
    
    def step(self, setpoint, measurement):
        error = setpoint - measurement
        self.integral += error * self.dt
        # Anti-windup
        self.integral = max(-100, min(100, self.integral))
        derivative = (error - self.prev_error) / self.dt
        u = self.kp * error + self.ki * self.integral + self.kd * derivative
        self.prev_error = error
        return u

# Simulate 1st-order system
pid = PID(kp=2, ki=0.5, kd=0.1)
y = 0  # initial output
for t in range(1000):
    setpoint = 100 if t > 100 else 0
    u = pid.step(setpoint, y)
    y += (u - 0.1 * y) * 0.01  # plant: dy/dt = u - 0.1 y
```

---

## 4. State-Space 表示

线性系统:

$$\dot{x} = A x + B u$$
$$y = C x + D u$$

- $x$ = state vector (n-dim)
- $u$ = input (m-dim)
- $y$ = output (p-dim)
- $A, B, C, D$ = matrices

例:质量-弹簧-阻尼 $m\ddot{y} + c\dot{y} + ky = F$:

$$x = \begin{pmatrix} y \\ \dot{y} \end{pmatrix}, \quad \dot{x} = \begin{pmatrix} 0 & 1 \\ -k/m & -c/m \end{pmatrix} x + \begin{pmatrix} 0 \\ 1/m \end{pmatrix} F$$

---

## 5. 稳定性

系统稳定 ⟺ $A$ 的所有 eigenvalue 实部 < 0 (continuous) 或模 < 1 (discrete)。

```python
import numpy as np
eigs = np.linalg.eigvals(A)
stable = all(eig.real < 0 for eig in eigs)
```

---

## 6. 控制器设计方法

### 6.1 Pole Placement

设计反馈 $u = -Kx$:
$$\dot{x} = (A - BK) x$$
选 $K$ 使 $A - BK$ 的 eigenvalue 在期望位置。

### 6.2 LQR (Linear Quadratic Regulator)

最优控制 — 最小化:

$$J = \int_0^\infty (x^T Q x + u^T R u) dt$$

$Q, R$ 是权重 (state cost vs control cost)。
$K$ 通过 Riccati 方程解。

```python
from scipy.linalg import solve_continuous_are
P = solve_continuous_are(A, B, Q, R)
K = np.linalg.inv(R) @ B.T @ P
```

### 6.3 Kalman Filter

State estimation 用 noisy measurements:
- Predict: $\hat{x}^- = A \hat{x} + B u$
- Update: $\hat{x} = \hat{x}^- + K(y - C\hat{x}^-)$
- 计算 optimal Kalman gain $K$

---

## 7. Model Predictive Control (MPC)

每 step:
1. 预测未来 $H$ step output (用 model)
2. 优化 control sequence 最小化 cost
3. 执行第一步,re-plan

$$\min_{u_0, u_1, ..., u_{H-1}} \sum_{k=0}^{H} \| x_k - x_{\text{ref}} \|_Q^2 + \| u_k \|_R^2$$

subject to $x_{k+1} = A x_k + B u_k$ + 约束 (input limit / state limit)。

```python
from cvxpy import Variable, Problem, Minimize, quad_form

x = [Variable(n) for _ in range(H+1)]
u = [Variable(m) for _ in range(H)]

objective = 0
constraints = [x[0] == x_init]
for k in range(H):
    objective += quad_form(x[k] - x_ref, Q) + quad_form(u[k], R)
    constraints.append(x[k+1] == A @ x[k] + B @ u[k])
    constraints.append(u[k] >= -u_max)
    constraints.append(u[k] <= u_max)

prob = Problem(Minimize(objective), constraints)
prob.solve()
u_apply = u[0].value
```

机器人 manipulation / 自动驾驶常用。

---

## 8. 实际应用

### 8.1 无人机姿态

PID on roll/pitch/yaw,200 Hz update。

### 8.2 自动驾驶轨迹跟踪

MPC + 车辆模型 + 障碍物约束。

### 8.3 工业机器人

PID joint control 或 computed torque control。

### 8.4 温度 / 压力调节

Industrial PID 已用 60+ 年,稳。

### 8.5 倒立摆

经典控制 testbed,LQR / MPC 都能 stabilize。

---

## 9. 现代控制 — 学习与传统的结合

- **iLQR**: 非线性 + iterative LQR
- **PILCO**: Gaussian Process model + 控制
- **MPC + neural model**: 用 NN 学 dynamics 给 MPC
- **RL + control**: SAC / PPO 学最优 policy
- **Adaptive control**: 在线学 plant 参数

---

## 10. Common Pitfalls

### 10.1 Integral windup

控制饱和后 integral 仍累积 → 大 overshoot。需 anti-windup。

### 10.2 Derivative noise

D 项放大 sensor noise。需要 low-pass D 项。

### 10.3 Discrete-time effects

数字控制器有采样延迟,改变 phase margin。

### 10.4 Model mismatch

MPC / LQR 依赖准确 model。Plant 变化 → 性能下降。

### 10.5 Linearization

非线性系统在工作点附近 linearize;远离工作点失效。

---

## 11. Related Concepts

- **同节**:[信号处理](Signal_Processing.md)
- **应用**:[FOC 电机](../06_Actuators_Motors/无刷电机与FOC.md)
- **机器人**:https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/03_Robotics/ — 机器人学

---

## References

1. **Åström, K. J. & Murray, R. M.** *Feedback Systems: An Introduction for Scientists and Engineers*. 2nd ed., 2020.
2. **Franklin, G. F. et al.** *Feedback Control of Dynamic Systems*. 8th ed., 2018.
3. **Kalman, R. E.** "A New Approach to Linear Filtering and Prediction Problems." *Trans ASME*, 1960.
4. **Camacho, E. F. & Bordons, C.** *Model Predictive Control*. 2nd ed., Springer, 2007.
