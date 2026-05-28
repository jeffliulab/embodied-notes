# Control Theory Foundations — PID to MPC

> *Control theory makes "systems" behave as desired: vehicle cruise control, robot trajectory tracking, drone attitude, temperature regulation. This article covers classical PID, state-space, stability, Model Predictive Control (MPC) — foundations of modern robot control.*
>
> **Difficulty**: Intermediate-Advanced
> **Prerequisites**: [Signal Processing](Signal_Processing.en.md), calculus, linear algebra
> **Further reading**: [FOC Motor Control](../06_Actuators_Motors/无刷电机与FOC.en.md)

---

## 1. Control System Basics

```
┌─────────┐   ┌─────────┐   ┌──────────┐
│ Setpoint│──▶│Controller│──▶│  Plant   │──▶ Output
└─────────┘   └─────────┘   └──────────┘
                  ▲                │
                  └────────────────┘
                       feedback
```

- **Setpoint**: target
- **Plant**: controlled object (motor / car / temperature system)
- **Controller**: computes control signal
- **Feedback**: sensor reads output

**Closed-loop** = with feedback; **Open-loop** = without.

---

## 2. PID Control

Most common controller:

$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}$$

where $e(t) = \text{setpoint} - \text{output}$.

### 2.1 P (Proportional)

- Bigger error → bigger control
- P alone: **steady-state error** exists

### 2.2 I (Integral)

- Accumulates past errors
- Eliminates steady-state error
- Side effect: integral windup

### 2.3 D (Derivative)

- Looks at error change rate
- Damps overshoot
- Side effect: amplifies noise

### 2.4 Tuning Experience

- Too small P: slow
- Too large P: oscillation
- Too large I: overshoot + oscillation
- Too large D: noise sensitive

Ziegler-Nichols method:
1. I/D = 0, increase P until oscillation
2. Record $K_u$ (critical gain) and $T_u$ (oscillation period)
3. PID: $K_p = 0.6 K_u, K_i = 1.2 K_u / T_u, K_d = 0.075 K_u T_u$

---

## 3. PyTorch / Python — PID Implementation

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

pid = PID(kp=2, ki=0.5, kd=0.1)
y = 0
for t in range(1000):
    setpoint = 100 if t > 100 else 0
    u = pid.step(setpoint, y)
    y += (u - 0.1 * y) * 0.01
```

---

## 4. State-Space Representation

Linear system:

$$\dot{x} = A x + B u$$
$$y = C x + D u$$

- $x$ = state vector (n-dim)
- $u$ = input (m-dim)
- $y$ = output (p-dim)

Example: mass-spring-damper $m\ddot{y} + c\dot{y} + ky = F$:

$$x = \begin{pmatrix} y \\ \dot{y} \end{pmatrix}, \quad \dot{x} = \begin{pmatrix} 0 & 1 \\ -k/m & -c/m \end{pmatrix} x + \begin{pmatrix} 0 \\ 1/m \end{pmatrix} F$$

---

## 5. Stability

System stable ⟺ all eigenvalues of $A$ have real part < 0 (continuous) or modulus < 1 (discrete).

```python
import numpy as np
eigs = np.linalg.eigvals(A)
stable = all(eig.real < 0 for eig in eigs)
```

---

## 6. Controller Design Methods

### 6.1 Pole Placement

Design feedback $u = -Kx$:
$$\dot{x} = (A - BK) x$$
Choose $K$ to place $A - BK$ eigenvalues at desired locations.

### 6.2 LQR (Linear Quadratic Regulator)

Optimal control — minimize:

$$J = \int_0^\infty (x^T Q x + u^T R u) dt$$

$Q, R$ are weights (state cost vs control cost).
$K$ solved via Riccati equation.

```python
from scipy.linalg import solve_continuous_are
P = solve_continuous_are(A, B, Q, R)
K = np.linalg.inv(R) @ B.T @ P
```

### 6.3 Kalman Filter

State estimation with noisy measurements:
- Predict: $\hat{x}^- = A \hat{x} + B u$
- Update: $\hat{x} = \hat{x}^- + K(y - C\hat{x}^-)$
- Optimal Kalman gain $K$

---

## 7. Model Predictive Control (MPC)

Each step:
1. Predict future $H$-step output (using model)
2. Optimize control sequence minimizing cost
3. Execute first step, re-plan

$$\min_{u_0, ..., u_{H-1}} \sum_{k=0}^{H} \| x_k - x_{\text{ref}} \|_Q^2 + \| u_k \|_R^2$$

s.t. $x_{k+1} = A x_k + B u_k$ + constraints (input limits / state limits).

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

Used in robot manipulation / autonomous driving.

---

## 8. Practical Applications

### 8.1 Drone Attitude

PID on roll/pitch/yaw, 200 Hz update.

### 8.2 AV Trajectory Tracking

MPC + vehicle model + obstacle constraints.

### 8.3 Industrial Robot

PID joint control or computed torque control.

### 8.4 Temperature / Pressure Regulation

Industrial PID for 60+ years, mature.

### 8.5 Inverted Pendulum

Classic control testbed; LQR / MPC both stabilize.

---

## 9. Modern Control — Learning + Classical Combo

- **iLQR**: nonlinear + iterative LQR
- **PILCO**: Gaussian Process model + control
- **MPC + neural model**: NN learns dynamics for MPC
- **RL + control**: SAC / PPO learns optimal policy
- **Adaptive control**: online learning of plant params

---

## 10. Common Pitfalls

### 10.1 Integral Windup

After control saturation, integral keeps accumulating → large overshoot. Need anti-windup.

### 10.2 Derivative Noise

D term amplifies sensor noise. Need low-pass D.

### 10.3 Discrete-Time Effects

Digital controller has sampling delay, changes phase margin.

### 10.4 Model Mismatch

MPC / LQR depend on accurate model. Plant variation → performance drops.

### 10.5 Linearization

Nonlinear systems linearized around operating point; fails far from it.

---

## 11. Related Concepts

- **Same section**: [Signal Processing](Signal_Processing.en.md)
- **Applications**: [FOC Motor](../06_Actuators_Motors/无刷电机与FOC.en.md)
- **Robotics**: https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/03_Robotics/

---

## References

1. **Åström, K. J. & Murray, R. M.** *Feedback Systems: An Introduction for Scientists and Engineers*. 2nd ed., 2020.
2. **Franklin, G. F. et al.** *Feedback Control of Dynamic Systems*. 8th ed., 2018.
3. **Kalman, R. E.** "A New Approach to Linear Filtering and Prediction Problems." *Trans ASME*, 1960.
4. **Camacho, E. F. & Bordons, C.** *Model Predictive Control*. 2nd ed., Springer, 2007.
