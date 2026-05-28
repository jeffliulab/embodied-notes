# 有限元分析 (Finite Element Analysis)

> *FEA 是用 mesh 离散化 + variational principle 解 PDE 的数值方法。结构静力 / 振动 / 热 / 流体 / electromagnetics 通用。Ansys、Abaqus、COMSOL、SolidWorks Simulation、OpenFOAM、Calculix 是主流工具。机器人结构 / 机壳 / 关节力学分析的工具。*
>
> **难度**:Advanced
> **前置知识**:线性代数、PDE、连续介质力学

---

## 1. 核心思想

- 用 N 个 simple elements (triangle, tetrahedron, hex) 覆盖 domain
- 在 element 上 approximate field as polynomial
- 全局 stiffness matrix $\mathbf{K}$ 由 element K 组装
- 解线性系统 $\mathbf{K u} = \mathbf{F}$ 得到节点位移

---

## 2. 数学(线弹性)

PDE:
$$\nabla \cdot \sigma + b = 0$$

with $\sigma = C : \varepsilon$, $\varepsilon = \frac{1}{2}(\nabla u + \nabla u^T)$.

Weak form (Galerkin):
$$\int_\Omega \delta \varepsilon : \sigma \, dV = \int_\Omega \delta u \cdot b \, dV + \int_\Gamma \delta u \cdot t \, dS$$

Discretize $u = N_i u_i$ → $\mathbf{K u} = \mathbf{F}$.

---

## 3. Element 类型

| Element | DOF / node | 用 |
|---|---|---|
| Linear tri (T3) | 2 | 2D 粗 |
| Quadratic tri (T6) | 2 | 2D 高 |
| Linear tet (T4) | 3 | 3D 粗 |
| Quadratic tet (T10) | 3 | 3D 高 |
| Linear hex (H8) | 3 | 3D 高质量 |
| Shell (S3, S4) | 6 | 板壳 |
| Beam | 6 | 杆/梁 |

---

## 4. 求解类型

| 类型 | 用途 |
|---|---|
| Static | 静力 |
| Modal | 固有频率 |
| Harmonic | sinusoidal 激励响应 |
| Transient | 时变(impact, drop test) |
| Nonlinear static | 大变形 / 塑性 / 接触 |
| Buckling | 屈曲 |
| Thermal | 热传导 |
| CFD | 流体 |

---

## 5. Workflow

```
CAD (SolidWorks) ──> STEP/IGES
            ↓
        Pre-processing
        - Mesh
        - Material assignment
        - BC (fixed, load)
            ↓
        Solver
        - K assembly
        - Boundary conditions
        - Solve linear / nonlinear
            ↓
        Post-processing
        - Displacement, stress, strain
        - Plot (contour, vector, deformed)
```

---

## 6. Python — Toy FEA (1D bar)

```python
import numpy as np

def fea_bar_1d(L, n_elem, E, A, F_end):
    """Solve 1D bar fixed at x=0, load F_end at x=L."""
    n_node = n_elem + 1
    dx = L / n_elem
    # Element stiffness: k = EA/dx * [[1,-1],[-1,1]]
    K = np.zeros((n_node, n_node))
    for i in range(n_elem):
        ke = (E * A / dx) * np.array([[1, -1], [-1, 1]])
        K[i:i+2, i:i+2] += ke
    
    F = np.zeros(n_node)
    F[-1] = F_end
    
    # Boundary: u[0] = 0 (fixed)
    K_red = K[1:, 1:]
    F_red = F[1:]
    u = np.zeros(n_node)
    u[1:] = np.linalg.solve(K_red, F_red)
    return u
```

---

## 7. Mesh Quality 关键指标

- **Aspect ratio**: edge ratio,< 5 好
- **Skewness**: 偏斜度,< 0.5 好
- **Jacobian**: > 0(避免 inverted element)
- **h-refinement**: 局部细化
- **p-refinement**: 提高 polynomial 阶

---

## 8. 应用 — 机器人 / 工程

- **Robot arm**: 静力 + 模态(避免共振)
- **Mobile robot 底盘**: drop test、振动
- **MEMS**: 微结构 modal
- **PCB**: 热 / 振动
- **Joint**: nonlinear 接触
- **Aerospace**: 全机 FEA

---

## 9. 软件 比较

| 软件 | 强项 | License |
|---|---|---|
| Ansys | 综合,工业标准 | 商业 |
| Abaqus | nonlinear、explicit | 商业 |
| COMSOL | multi-physics | 商业 |
| SolidWorks Simulation | CAD 集成 | 商业 |
| Nastran | 航空 | 商业 |
| Calculix | 开源 Abaqus 兼容 | GPL |
| Code_Aster | EDF 开源 | GPL |
| FEniCS | Python FEM | LGPL |
| OpenFOAM | CFD | GPL |

---

## 10. AI / FEA 结合

- **Physics-Informed Neural Networks (PINN)**: NN 拟 PDE 解
- **Neural Operators (FNO, DeepONet)**: 学 PDE 解 family
- **Reduced-Order Models**: NN 加速 FEA
- 但 PINN 离 industrial-grade FEA 仍远

---

## 11. 常见问题

### 11.1 Mesh 太粗

误差大;关键区(stress concentration)细化。

### 11.2 Linear 假设

大变形 / 塑性 / 接触 → 必须 nonlinear。

### 11.3 边界条件错误

Over-constrained → singular 或假 stress。

### 11.4 单位混乱

mm-N-s vs m-kg-s,忘换算 → 结果错 1000 倍。

### 11.5 Validation

FEA 结果 ≠ 真实;须 experiment 校验。

---

## 12. Related Concepts

- **同节**:[Bearings](Bearings.md)
- **数学基础**:[Linear Algebra](../00_Foundations/Linear_Algebra.md)、[Materials Science](../00_Foundations/Materials_Science.md)
- **机器人**:[SLAM Basics](../10_Robot_Integration/SLAM_Basics.md)

---

## References

1. **Hughes, T. J. R.** *The Finite Element Method*. Dover, 2000.
2. **Zienkiewicz, O. C. & Taylor, R. L.** *The Finite Element Method*. 7th ed., 2013.
3. **Cook, R. D. et al.** *Concepts and Applications of Finite Element Analysis*. 4th ed., 2001.
4. **Bathe, K.-J.** *Finite Element Procedures*. 2nd ed., 2014.
