# MPC — Model Predictive Control

> *Model Predictive Control (MPC) — modern workhorse of classical control theory. **At each timestep look ahead H steps, optimize an action sequence, execute only the first step, then redo at the next step**. Tesla Autopilot, Boston Dynamics, SpaceX rockets all use MPC. Related to [MDP](https://jeffliulab.com/ai-notes/01_Symbolism/04_Planning/MDP) as finite-horizon vs infinite-horizon.*
>
> **Difficulty**: Intermediate-Advanced
> **Prerequisites**: [Control Theory](控制理论.en.md), [Motion Planning](https://jeffliulab.com/ai-notes/01_Symbolism/04_Planning/motion_trajectory_planning), [MDP](https://jeffliulab.com/ai-notes/01_Symbolism/04_Planning/MDP), optimization basics
> **Further reading**: [Dreamer](https://jeffliulab.com/ai-notes/03_Reinforcement_Learning/04_Modern_RL/Dreamer) (Model-based RL), [Diffusion Policy](../../02_Robot_Learning/02_Methods/扩散策略.en.md)

---

## 1. Intuition: Receding Horizon Optimization

Classical control (PID, LQR) only sees the current state, no lookahead.
**MPC idea**: at each time $t$:
1. **Predict**: roll out the model H steps into the future
2. **Optimize**: solve for action sequence $a_{t:t+H}$ minimizing cost
3. **Execute**: only use the first $a_t$
4. **Next step**: redo (with new state)

```
t=0: predict t=1..H, optimize a_0:a_H, execute a_0
t=1: predict t=2..H+1, optimize a_1:a_{H+1}, execute a_1
...
```

→ **Receding Horizon Control** — always plan the next H steps; robust and responsive.

---

## 2. Optimization Problem

<!-- SVG-DESIGN-NOTES
Type: C (process — receding horizon sliding window)
Q0: MPC's essence is not "solve an optimization" — it is "predict H steps but execute only 1, then slide the window by 1 step and redo"; this H:1 asymmetry is the signature
Q1: Three overlapping prediction windows stacked vertically along the time axis; each window: 1 solid step (executed) + H-1 dashed steps (predicted-then-discarded); windows shift right by 1 step each
Q2: Unlabeled: 3 colored bars staggered horizontally + leading solid block + trailing dashes = receding horizon DNA
Q3: Removed original 720×220 single-box + text dump (template fingerprint)
Q4: H / a_t / discarded labeled directly on the geometric segments
Q5: All var(--dia-*); EN shares geometry
-->
<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MPC receding horizon — 3 overlapping prediction windows">
  <defs>
    <marker id="mpc-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">MPC — Receding Horizon Window</text>
  <text x="380" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Predict H steps · execute 1 · slide window 1 step · re-solve</text>

  <line x1="50" y1="250" x2="730" y2="250" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">
    <line x1="100" y1="250" x2="100" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="100" y="270" text-anchor="middle">t</text>
    <line x1="160" y1="250" x2="160" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="160" y="270" text-anchor="middle">t+1</text>
    <line x1="220" y1="250" x2="220" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="220" y="270" text-anchor="middle">t+2</text>
    <line x1="280" y1="250" x2="280" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="280" y="270" text-anchor="middle">t+3</text>
    <line x1="340" y1="250" x2="340" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="340" y="270" text-anchor="middle">t+4</text>
    <line x1="400" y1="250" x2="400" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="400" y="270" text-anchor="middle">t+5</text>
    <line x1="460" y1="250" x2="460" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="460" y="270" text-anchor="middle">t+6</text>
    <line x1="520" y1="250" x2="520" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="520" y="270" text-anchor="middle">t+7</text>
    <line x1="580" y1="250" x2="580" y2="256" stroke="var(--dia-stroke-soft)"/>
    <text x="580" y="270" text-anchor="middle">t+8</text>
  </g>

  <text x="50" y="90" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-blue)">window @ t</text>
  <text x="50" y="103" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">H=6</text>
  <rect x="100" y="86" width="60" height="18" fill="var(--dia-blue)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="130" y="99" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-bg)">a_t ✓</text>
  <rect x="160" y="86" width="240" height="18" fill="none" stroke="var(--dia-blue)" stroke-width="1.2" stroke-dasharray="3 2"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-blue)">predicted but discarded</text>

  <text x="50" y="140" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-green)">window @ t+1</text>
  <rect x="160" y="138" width="60" height="18" fill="var(--dia-green)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="190" y="151" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-bg)">a_{t+1} ✓</text>
  <rect x="220" y="138" width="240" height="18" fill="none" stroke="var(--dia-green)" stroke-width="1.2" stroke-dasharray="3 2"/>
  <text x="340" y="151" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-green)">re-predicted with new obs x_{t+1}</text>

  <text x="50" y="190" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">window @ t+2</text>
  <rect x="220" y="188" width="60" height="18" fill="var(--dia-accent)" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="250" y="201" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-bg)">a_{t+2} ✓</text>
  <rect x="280" y="188" width="240" height="18" fill="none" stroke="var(--dia-accent)" stroke-width="1.2" stroke-dasharray="3 2"/>

  <path d="M 130 110 Q 145 124 165 138" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8" marker-end="url(#mpc-arr)"/>
  <path d="M 190 162 Q 205 176 225 188" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8" marker-end="url(#mpc-arr)"/>
  <text x="660" y="92" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">slide</text>
  <text x="660" y="106" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">+1 step</text>

  <text x="380" y="296" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">min Σ_{k=0..H-1} c(x_{t+k}, a_{t+k}) + V_f(x_{t+H})    s.t.   x_{t+k+1} = f(x_{t+k}, a_{t+k})</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — MPC's geometric DNA: each window predicts H=6 steps (dashed), executes only the first (solid block), and slides 1 step to re-solve; the 1:H-1 execute-vs-discard asymmetry is the source of MPC's robustness.</p>

**Core elements**:
- System dynamics $x_{t+1} = f(x_t, a_t)$
- Stage cost $c(x_t, a_t)$ (e.g., distance to goal, energy)
- Terminal cost $V_f(x_{t+H})$ (approximate infinite-horizon value)
- State/action constraints $X, A$

---

## 3. MPC Variants

| Type | Dynamics | Solver | Application |
|---|---|---|---|
| **Linear MPC** | Linear $f$ | QP (convex, few ms) | Process control, aerospace |
| **Nonlinear MPC (NMPC)** | Arbitrary $f$ | SQP / IPOPT | Robotics, autonomous driving |
| **Robust MPC** | Includes uncertainty | min-max QP | Safety-critical |
| **Stochastic MPC** | Random $f$ | scenarios | Finance, energy |
| **Tube MPC** | Uncertainty + convex constraints | tube tracking | Self-driving |
| **Learning-based MPC** | NN-learned $f$ | Same as above | Modern robotics |

---

## 4. MPC vs MDP / RL

| Dimension | MPC | MDP / RL |
|---|---|---|
| Horizon | Finite H | Infinite (discounted) |
| Model | **Must know** $f$ | RL can be model-free, Dreamer learns it |
| Solving | Online (resolve each step) | Offline (train policy) |
| Adaptivity | Strong (real-time feedback) | Weak (policy fixed) |
| Complexity | $O(H \cdot \text{opt})$/step | $O(1)$/step (after training) |
| Stability proofs | From classical control theory | Hard to prove |
| Uncertainty | Explicit constraints | Implicit (exploration) |

**Combination**: modern trend is **MPC + RL**:
- Dreamer = "learn model + RL on model" = modernized MPC idea
- MuZero = MCTS planning (a form of MPC) + learned dynamics

---

## 5. iLQR / iLQG — Classic Nonlinear MPC Method

**iLQR (Iterative Linear Quadratic Regulator)** — Tassa et al. 2012:

1. Given initial action sequence $\bar{a}$
2. Linearize dynamics along the trajectory: $\delta x_{t+1} \approx A_t \delta x_t + B_t \delta a_t$
3. Quadratically approximate cost: $c \approx \frac{1}{2}(\delta x^\top Q \delta x + ...)$
4. Solve LQR sub-problem → correct actions
5. Iterate to convergence

**Properties**:
- Second-order convergence (fast)
- Equivalent to Newton's method
- Used for complex robots (humanoids, quadrupeds)
- Still the OpenAI Gym MuJoCo standard baseline

---

## 6. Practical Applications

### 6.1 Autonomous Driving

Tesla Autopilot, Waymo use MPC to optimize:
- Cost: distance to target lane + acceleration squared + distance to other cars squared
- Constraints: speed limit, acceleration limit, lane boundaries
- Horizon: 3-5 seconds
- Frequency: 10-50 Hz

### 6.2 Quadruped Robots

Boston Dynamics Spot / MIT Cheetah use **convex MPC** to control body motion + foothold optimization:
- Horizon ~0.5 seconds
- OSQP solver < 5 ms per step
- Coordinated with low-level PD control (1 kHz)

### 6.3 Rocket Landing

SpaceX Falcon 9 landing uses **convex MPC** (lossless convexification):
- Convert non-convex thrust constraints into a convex problem
- Real-time solve + robust to disturbances

---

## 7. PyTorch / Python Implementation

```python
import numpy as np
from scipy.optimize import minimize

# Simple 1D double-integrator MPC
def mpc_step(x_current, x_goal, H=10, dt=0.1):
    """state x = [pos, vel]; action a = acceleration"""
    n_a = H                       # H-step actions
    
    def cost(a):
        x = x_current.copy()
        total = 0
        for k in range(H):
            x[0] += x[1] * dt
            x[1] += a[k] * dt
            total += (x[0] - x_goal)**2 + 0.01 * a[k]**2
        return total
    
    a0 = np.zeros(n_a)
    bounds = [(-1.0, 1.0)] * n_a       # acceleration bounds
    res = minimize(cost, a0, bounds=bounds, method='SLSQP')
    return res.x[0]               # only first step

# Realtime loop
x = np.array([0.0, 0.0])
goal = 1.0
for t in range(100):
    a = mpc_step(x, goal)
    x[0] += x[1] * 0.1
    x[1] += a * 0.1

# Industry uses CasADi / acados / OSQP / cvxpy
```

**Complex applications** recommend **CasADi + IPOPT** (Python) or **acados** (C/Python wrapper).

---

## 8. History and Impact

- **1960s** — Kalman LQR (Linear Quadratic Regulator)
- **1970s** — Cutler & Ramaker at Shell introduce DMC (Dynamic Matrix Control) — industrial origin
- **1980s** — Generalized Predictive Control (GPC), industrial standard
- **2000s** — Convex optimization rise → real-time MPC viable
- **2012** — Tassa et al. *iLQG* — online planning for complex robots
- **2015+** — Boston Dynamics Atlas / Spot use MPC
- **2017+** — Tesla, Waymo use MPC for autonomous driving
- **2020+** — Learning-based MPC: NN-learned dynamics

**Why it matters**:
- **Industry standard** in robotics / autonomous driving / aerospace for decades
- Provides **theoretical stability guarantees** (vs RL's hard-to-prove guarantees)
- **Complements RL**: RL learns "how to learn", MPC handles "how to control in real time"

---

## 9. Common Pitfalls

### 9.1 Model Inaccuracy

MPC depends entirely on $f$ being accurate. Tire slip, motor nonlinearity etc. cause large prediction errors → performance collapses. **Mitigation**: robust MPC, or learning-based online updates.

### 9.2 Choosing Horizon

H too short → myopic; too long → expensive + model error accumulates. Robotics 0.3-1 second, autonomous driving 3-5 seconds.

### 9.3 Real-Time Constraints

Each step must solve within the control period. **Convex problems** (LQR) take few ms; **non-convex** can take tens of ms → limits control frequency.

### 9.4 Local Optima

Non-convex MPC (iLQR) finds local optima, possibly not global. **Warmstart** (use previous solution as starting point) helps significantly.

### 9.5 Constraint Violations

What if the solver can't find a feasible solution? **Slack variables** (soft constraints) or **fallback policy**.

---

## 10. Related Concepts

- **Same-section**: [Control Theory](控制理论.en.md) (PID/LQR foundation), [Motion Planning](https://jeffliulab.com/ai-notes/01_Symbolism/04_Planning/motion_trajectory_planning)
- **Theory**: [MDP](https://jeffliulab.com/ai-notes/01_Symbolism/04_Planning/MDP) (infinite-horizon version), optimization theory
- **RL connection**: [Dreamer](https://jeffliulab.com/ai-notes/03_Reinforcement_Learning/04_Modern_RL/Dreamer) (learn model then MPC), [AlphaZero](https://jeffliulab.com/ai-notes/03_Reinforcement_Learning/04_Modern_RL/AlphaZero_Family) (MCTS is a search variant of MPC)
- **Modern evolution**: Convex MPC, Tube MPC, Learning-MPC

---

## References

1. **Cutler, C. R. & Ramaker, B. L.** "Dynamic Matrix Control — A Computer Control Algorithm." *Joint Auto. Control Conf.*, 1980. — Industrial MPC origin.
2. **Mayne, D. Q. et al.** "Constrained Model Predictive Control: Stability and Optimality." *Automatica*, 2000. — Modern MPC theory.
3. **Tassa, Y., Erez, T. & Todorov, E.** "Synthesis and Stabilization of Complex Behaviors through Online Trajectory Optimization." *IROS*, 2012. — iLQG.
4. **Di Carlo, J. et al.** "Dynamic Locomotion in the MIT Cheetah 3 Through Convex Model-Predictive Control." *IROS*, 2018.
5. **Rawlings, J. B., Mayne, D. Q. & Diehl, M. M.** *Model Predictive Control: Theory, Computation, and Design* (2e). Nob Hill, 2017. — Textbook.
