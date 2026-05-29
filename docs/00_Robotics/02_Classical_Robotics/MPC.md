# MPC — 模型预测控制

> *Model Predictive Control (MPC) — 经典控制理论的现代主力。**每个时刻向未来推演 H 步,优化序列动作,只执行第一步,然后下一步重做**。Tesla Autopilot, Boston Dynamics, SpaceX 火箭都用 MPC。与 [MDP](https://jeffliulab.github.io/ai-notes/01_AI/01_Classical_AI/04_Planning/MDP/) 是 finite-horizon vs infinite-horizon 关系。*
>
> **难度**：Intermediate-Advanced
> **前置知识**：[控制理论](控制理论.md)、[运动规划](https://jeffliulab.github.io/ai-notes/01_AI/01_Classical_AI/04_Planning/motion_trajectory_planning/)、[MDP](https://jeffliulab.github.io/ai-notes/01_AI/01_Classical_AI/04_Planning/MDP/)、最优化基础
> **后续阅读**：[Dreamer](https://jeffliulab.github.io/ai-notes/04_Reinforcement_Learning/04_Modern_RL/Dreamer/)（Model-based RL）、[Diffusion Policy](../../02_Robot_Learning/02_Methods/扩散策略.md)

---

## 1. 直觉：滚动 horizon 优化

经典控制 (PID, LQR) 只看当前状态,无前瞻。
**MPC 思想**: 每个时刻 $t$:
1. **预测**: 用模型推演未来 $H$ 步
2. **优化**: 求 cost 最小的动作序列 $a_{t:t+H}$
3. **执行**: 只用第一个 $a_t$
4. **下一步**: 重做（用新状态）

```
t=0: predict t=1..H, optimize a_0:a_H, execute a_0
t=1: predict t=2..H+1, optimize a_1:a_{H+1}, execute a_1
...
```

→ **Receding Horizon Control** — 永远只规划接下来 H 步,稳健且反应快。

---

## 2. 优化问题

<!-- SVG-DESIGN-NOTES
Type: C (过程 / 时间维度 — receding horizon 滑窗)
Q0: MPC 的核心不是"求解优化"——而是"每步预测 H 步未来但只执行 1 步,然后整窗滑动 1 步重做",这种 H 长 vs 1 执行的不对称是 MPC 的灵魂
Q1: 时间轴上叠 3 个 overlapping prediction window (每窗 H 步,起点错开 1 步);每窗只前 1 步实线 (执行),后续 H-1 步虚线 (规划但丢弃);窗口颜色按时间逐渐变深
Q2: 去标题:三条彩色横条上下叠 + 每条头部一个 solid 块 + 后续 dashed = MPC 滚动 horizon DNA;再加底部 cost 公式贴在最近窗口下方
Q3: 删去原 720×220 viewBox 单 box + 文本堆叠 (敷衍模板指纹)
Q4: H / a_t / dropped 等标签直接贴对应几何块
Q5: 全用 var(--dia-*);双语共享几何
-->
<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MPC 滚动 horizon — 3 个重叠预测窗口">
  <defs>
    <marker id="mpc-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">MPC — Receding Horizon 滑窗</text>
  <text x="380" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">每窗预测 H 步 · 仅执行 1 步 · 整窗滑动 1 步重做</text>

  <!-- Time axis -->
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

  <!-- Window 1: starts at t, predict t..t+5 (H=6) -->
  <text x="50" y="90" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-blue)">窗 @ t</text>
  <text x="50" y="103" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">H=6</text>
  <!-- Executed step (solid) -->
  <rect x="100" y="86" width="60" height="18" fill="var(--dia-blue)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="130" y="99" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-bg)">a_t ✓</text>
  <!-- Dropped predicted steps (dashed) -->
  <rect x="160" y="86" width="240" height="18" fill="none" stroke="var(--dia-blue)" stroke-width="1.2" stroke-dasharray="3 2"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-blue)">predicted but discarded</text>

  <!-- Window 2: starts at t+1, predict t+1..t+6 -->
  <text x="50" y="140" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-green)">窗 @ t+1</text>
  <rect x="160" y="138" width="60" height="18" fill="var(--dia-green)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="190" y="151" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-bg)">a_{t+1} ✓</text>
  <rect x="220" y="138" width="240" height="18" fill="none" stroke="var(--dia-green)" stroke-width="1.2" stroke-dasharray="3 2"/>
  <text x="340" y="151" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-green)">re-predicted with new obs x_{t+1}</text>

  <!-- Window 3: starts at t+2 -->
  <text x="50" y="190" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">窗 @ t+2</text>
  <rect x="220" y="188" width="60" height="18" fill="var(--dia-accent)" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="250" y="201" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-bg)">a_{t+2} ✓</text>
  <rect x="280" y="188" width="240" height="18" fill="none" stroke="var(--dia-accent)" stroke-width="1.2" stroke-dasharray="3 2"/>

  <!-- Sliding annotations -->
  <path d="M 130 110 Q 145 124 165 138" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8" marker-end="url(#mpc-arr)"/>
  <path d="M 190 162 Q 205 176 225 188" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.8" marker-end="url(#mpc-arr)"/>
  <text x="660" y="92" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">slide</text>
  <text x="660" y="106" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">+1 step</text>

  <!-- Cost formula below time axis -->
  <text x="380" y="296" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">min Σ_{k=0..H-1} c(x_{t+k}, a_{t+k}) + V_f(x_{t+H})    s.t.   x_{t+k+1} = f(x_{t+k}, a_{t+k})</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — MPC 的几何 DNA：每窗预测 H=6 步（彩色虚线），但只执行第一步（实心方块），整窗向右滑 1 步重新求解；执行 vs 丢弃的 1:H-1 不对称是 MPC 鲁棒性的来源。</p>

**核心元素**:
- 系统动力学 $x_{t+1} = f(x_t, a_t)$
- 阶段代价 $c(x_t, a_t)$ (如距离目标、能耗)
- 终端代价 $V_f(x_{t+H})$ (近似无限时域 value)
- 状态/动作约束 $X, A$

---

## 3. MPC 分类

| 类型 | 动力学模型 | 优化器 | 应用 |
|---|---|---|---|
| **线性 MPC** | 线性 $f$ | QP (凸,几 ms) | 工业过程,航天 |
| **非线性 MPC (NMPC)** | 任意 $f$ | SQP / IPOPT | 机器人,无人车 |
| **Robust MPC** | 含不确定性 | min-max QP | 安全敏感 |
| **Stochastic MPC** | 随机 $f$ | scenarios | 金融,能源 |
| **Tube MPC** | 不确定 + 凸约束 | tube tracking | 自动驾驶 |
| **Learning-based MPC** | NN 学的 $f$ | 同上 | 现代机器人 |

---

## 4. MPC vs MDP / RL

| 维度 | MPC | MDP / RL |
|---|---|---|
| Horizon | 有限 H | 无限 (折扣) |
| 模型 | **必须知道** $f$ | RL 可无模型,Dreamer 学 |
| 求解 | 在线 (每步重解) | 离线 (训练 policy) |
| 适应性 | 强（实时反馈） | 弱（policy 固定） |
| 复杂度 | $O(H \cdot \text{opt})$/step | $O(1)$/step (训练后) |
| 稳定性证明 | 经典控制理论提供 | 难以证明 |
| 不确定性 | 显式约束 | 隐式（探索） |

**结合**: 现代趋势是 **MPC + RL**:
- Dreamer = "学 model + 在 model 上 RL" = MPC 思想现代化
- MuZero = MCTS planning (一种 MPC) + learned dynamics

---

## 5. iLQR / iLQG — 非线性 MPC 经典方法

**iLQR (Iterative Linear Quadratic Regulator)** — Tassa et al. 2012:

1. 给定初始动作序列 $\bar{a}$
2. 沿轨迹线性化动力学: $\delta x_{t+1} \approx A_t \delta x_t + B_t \delta a_t$
3. 二阶近似 cost: $c \approx \frac{1}{2}(\delta x^\top Q \delta x + ...)$
4. 解 LQR 子问题 → 修正动作
5. 迭代到收敛

**性质**:
- 二阶收敛（快）
- 与 Newton 方法等价
- 用于复杂机器人 (人形,四足)
- 仍是 OpenAI Gym MuJoCo 的标配 baseline

---

## 6. 实际应用

### 6.1 自动驾驶

Tesla Autopilot, Waymo 用 MPC 优化:
- cost: 到目标车道距离 + 加速度平方 + 与他车距离平方
- 约束: 速度上限、加速度上限、车道边界
- horizon: 3-5 秒
- 频率: 10-50 Hz

### 6.2 四足机器人

Boston Dynamics Spot / MIT Cheetah 用 **convex MPC** 控制躯干运动 + 落脚点优化:
- horizon ~0.5 秒
- 每步用 OSQP solver < 5 ms
- 配合低层 PD 控制 (1 kHz)

### 6.3 火箭着陆

SpaceX Falcon 9 着陆用 **convex MPC** (lossless convexification):
- 把推力非凸约束转为凸问题
- 实时求解 + 鲁棒于扰动

---

## 7. PyTorch / Python 实现

```python
import numpy as np
from scipy.optimize import minimize

# 简单 1D 双积分器 MPC
def mpc_step(x_current, x_goal, H=10, dt=0.1):
    """状态 x = [pos, vel]; 动作 a = 加速度"""
    n_a = H                       # H 步动作
    
    def cost(a):
        x = x_current.copy()
        total = 0
        for k in range(H):
            x[0] += x[1] * dt
            x[1] += a[k] * dt
            total += (x[0] - x_goal)**2 + 0.01 * a[k]**2
        return total
    
    a0 = np.zeros(n_a)
    bounds = [(-1.0, 1.0)] * n_a       # 加速度约束
    res = minimize(cost, a0, bounds=bounds, method='SLSQP')
    return res.x[0]               # 只用第一步

# 实时循环
x = np.array([0.0, 0.0])
goal = 1.0
for t in range(100):
    a = mpc_step(x, goal)
    x[0] += x[1] * 0.1
    x[1] += a * 0.1

# 工业上用 CasADi / acados / OSQP / cvxpy
```

**复杂应用** 推荐使用 **CasADi + IPOPT** (Python) 或 **acados** (C/Python wrapper)。

---

## 8. 历史与影响

- **1960s** — Kalman LQR (线性二次最优控制)
- **1970s** — Cutler & Ramaker 在 Shell 引入 DMC (Dynamic Matrix Control) — 工业开端
- **1980s** — Generalized Predictive Control (GPC),工业过程标配
- **2000s** — 凸优化崛起 → 实时 MPC 可行
- **2012** — Tassa et al. *iLQG* — 复杂机器人在线规划
- **2015+** — Boston Dynamics Atlas / Spot 用 MPC
- **2017+** — Tesla, Waymo 用 MPC 做自动驾驶
- **2020+** — Learning-based MPC: 用 NN 学 dynamics

**为什么重要**:
- **机器人 / 自动驾驶 / 航天工业标配** 数十年
- 提供 **理论稳定性保证** (vs RL 难证明)
- 与 RL **互补**:RL 解决"如何"学,MPC 解决"如何"实时控制

---

## 9. Common Pitfalls

### 9.1 模型不准

MPC 完全依赖 $f$ 准确。轮胎打滑、电机非线性等导致预测和实际偏差大 → 性能崩。**对策**: robust MPC,或 learning-based 在线更新。

### 9.2 Horizon 选择

H 太短 → 短视;太长 → 计算贵 + 模型误差累积。机器人 0.3-1 秒,自动驾驶 3-5 秒。

### 9.3 实时性

每步必须在控制周期内完成求解。**凸问题** (LQR) 几 ms;**非凸** 可能几十 ms → 限制控制频率。

### 9.4 局部最优

非凸 MPC (iLQR) 找局部最优,可能不是全局。**Warmstart** (用上一步解作起点) 显著改善。

### 9.5 约束违反

solver 找不到可行解时怎么办？**Slack 变量** (软约束) 或 **fallback policy**。

---

## 10. Related Concepts

- **同节**：[控制理论](控制理论.md)（PID/LQR 基础）、[运动规划](https://jeffliulab.github.io/ai-notes/01_AI/01_Classical_AI/04_Planning/motion_trajectory_planning/)
- **理论**：[MDP](https://jeffliulab.github.io/ai-notes/01_AI/01_Classical_AI/04_Planning/MDP/)（无限 horizon 版）、最优化理论
- **RL 联系**：[Dreamer](https://jeffliulab.github.io/ai-notes/04_Reinforcement_Learning/04_Modern_RL/Dreamer/)（学 model 后做 MPC）、[AlphaZero](https://jeffliulab.github.io/ai-notes/04_Reinforcement_Learning/04_Modern_RL/AlphaZero_Family/)（MCTS 是 MPC 的搜索版）
- **现代演进**：Convex MPC, Tube MPC, Learning-MPC

---

## References

1. **Cutler, C. R. & Ramaker, B. L.** "Dynamic Matrix Control — A Computer Control Algorithm." *Joint Auto. Control Conf.*, 1980. — 工业 MPC 起源。
2. **Mayne, D. Q. et al.** "Constrained Model Predictive Control: Stability and Optimality." *Automatica*, 2000. — 现代 MPC 理论。
3. **Tassa, Y., Erez, T. & Todorov, E.** "Synthesis and Stabilization of Complex Behaviors through Online Trajectory Optimization." *IROS*, 2012. — iLQG。
4. **Di Carlo, J. et al.** "Dynamic Locomotion in the MIT Cheetah 3 Through Convex Model-Predictive Control." *IROS*, 2018.
5. **Rawlings, J. B., Mayne, D. Q. & Diehl, M. M.** *Model Predictive Control: Theory, Computation, and Design* (2e). Nob Hill, 2017. — 教科书。
