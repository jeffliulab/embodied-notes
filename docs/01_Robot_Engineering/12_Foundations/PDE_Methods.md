# 偏微分方程方法 (PDE Methods)

> *PDE 是物理 / 工程核心数学语言:heat、wave、Navier-Stokes、Maxwell。机器人 control、CFD、FEA、电磁 simulation 都依赖 PDE。3 大类(elliptic、parabolic、hyperbolic)各有 numerical method (FDM、FEM、FVM、Spectral)。AI 趋势:PINN、Neural Operators。*
>
> **难度**:Advanced
> **前置知识**:多元微积分、ODE、线性代数

---

## 1. PDE 分类

| 类 | 例 | 数学 |
|---|---|---|
| **Elliptic** | Laplace, Poisson | 静态平衡 |
| **Parabolic** | Heat | 扩散 |
| **Hyperbolic** | Wave, advection | 传播 |
| **Mixed** | Navier-Stokes | 复杂 |

二阶 PDE:$A u_{xx} + B u_{xy} + C u_{yy} + ...$
- $B² - 4AC < 0$: elliptic
- $= 0$: parabolic
- $> 0$: hyperbolic

---

## 2. 经典 PDE

### 2.1 Heat
$$\frac{\partial u}{\partial t} = \alpha \nabla^2 u$$

### 2.2 Wave
$$\frac{\partial^2 u}{\partial t^2} = c^2 \nabla^2 u$$

### 2.3 Laplace
$$\nabla^2 u = 0$$

### 2.4 Poisson
$$\nabla^2 u = f$$

### 2.5 Navier-Stokes
$$\rho (\partial_t \mathbf{v} + \mathbf{v} \cdot \nabla \mathbf{v}) = -\nabla p + \mu \nabla^2 \mathbf{v}$$

### 2.6 Maxwell
$$\nabla \times \mathbf{E} = -\partial_t \mathbf{B}, \quad \nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \partial_t \mathbf{E}$$

---

## 3. 数值方法

### 3.1 FDM (Finite Difference)

- 直接 discretize 微分算子
- 简,Cartesian grid
- 不规则域困难

### 3.2 FEM (Finite Element)

- Variational form
- 任意 mesh
- 灵活,工业 standard
- 详见 [FEA](../04_Mechanical_Engineering/Finite_Element_Analysis.md)

### 3.3 FVM (Finite Volume)

- 保 conservation laws
- CFD 主流

### 3.4 Spectral Methods

- 用 Fourier / Chebyshev basis
- 高 accuracy on smooth solutions
- 但 boundary 复杂

---

## 4. Stability + Accuracy

### 4.1 CFL 条件

For explicit hyperbolic:
$$\Delta t \leq \frac{\Delta x}{c}$$

否则 unstable.

### 4.2 Von Neumann analysis

Fourier mode 增长率检验。

### 4.3 Order

- Forward / backward Euler: 1st order
- Crank-Nicolson: 2nd order, implicit
- Runge-Kutta: 4th order
- Higher order → 减误差 same Δx

---

## 5. Python — 1D Heat Equation FDM

```python
import numpy as np
import matplotlib.pyplot as plt

def heat_1d(L=1.0, T=0.5, nx=50, alpha=0.01):
    """∂u/∂t = α ∂²u/∂x², u(0,x)=sin(πx), u(t,0)=u(t,L)=0."""
    dx = L / (nx - 1)
    dt = 0.4 * dx**2 / alpha  # CFL
    nt = int(T / dt)
    
    x = np.linspace(0, L, nx)
    u = np.sin(np.pi * x)  # IC
    
    for _ in range(nt):
        u_new = u.copy()
        u_new[1:-1] = u[1:-1] + alpha * dt / dx**2 * (u[2:] - 2*u[1:-1] + u[:-2])
        u = u_new
    
    return x, u
```

---

## 6. Implicit Methods

显式有 CFL 限制。Implicit:
$$\frac{u^{n+1} - u^n}{\Delta t} = \alpha \frac{u^{n+1}_{i+1} - 2 u^{n+1}_i + u^{n+1}_{i-1}}{\Delta x^2}$$

需要解线性系统 $A u^{n+1} = b$,但 unconditionally stable。

---

## 7. AI / PDE 结合

### 7.1 Physics-Informed NN (PINN)

- NN 拟 u(x, t)
- Loss 包括 PDE residual
- Boundary、IC 也 in loss
- 处理 inverse problems 好

### 7.2 Neural Operators

- **FNO** (Fourier Neural Operator, Li 2020): Fourier basis NN
- **DeepONet**: branch + trunk
- 学 PDE solution family

### 7.3 Sciml.jl / NVIDIA Modulus

- 商业 PDE + ML 工具

---

## 8. 应用 — 机器人 + 工程

| 域 | PDE |
|---|---|
| Heat 散热 | Heat equation + FEM |
| CFD (drone, fluid sim) | Navier-Stokes + FVM |
| 结构应力 | Elasticity + FEM |
| 电磁 (motor, antenna) | Maxwell + FEM/FDTD |
| 控制 (DPS, distributed param) | Various |
| Wave propagation | Wave + FDM |
| Phase-field (材料) | Cahn-Hilliard + FEM |

---

## 9. 软件

| 工具 | 类 |
|---|---|
| **FEniCS** | Python FEM |
| **PETSc** | 大规模线性 / nonlinear |
| **deal.II** | C++ FEM |
| **OpenFOAM** | CFD FVM |
| **COMSOL** | 商业 multi-physics |
| **Modulus** (NVIDIA) | PINN, AI for PDE |
| **DiffEqFlux.jl** | Julia |

---

## 10. 常见问题

### 10.1 CFL 不重要

显式 method 必满足;违反 → 数值爆炸。

### 10.2 Mesh 细 = 准

不;低 order method + 细 mesh 仍 误差大。Order matters。

### 10.3 PINN 替代 FEA

仍 immature in industrial accuracy。

### 10.4 Boundary 不重要

PDE 解高度依赖 boundary。Dirichlet / Neumann / Robin 区分关键。

### 10.5 一阶 PDE = 简

一阶 hyperbolic shock formation 复杂(burgers 方程)。

---

## 11. Related Concepts

- **同节**:[Linear Algebra](Linear_Algebra.md)、[Signal Processing](Signal_Processing.md)、[Fluid Mechanics](Fluid_Mechanics.md)
- **应用**:[FEA](../04_Mechanical_Engineering/Finite_Element_Analysis.md)
- **AI**:Physics-Informed NN

---

## References

1. **Strikwerda, J. C.** *Finite Difference Schemes and PDEs*. 2nd ed., 2004.
2. **LeVeque, R. J.** *Finite Volume Methods for Hyperbolic Problems*. 2002.
3. **Raissi, M. et al.** "Physics-informed neural networks." *J Comput Phys*, 2019.
4. **Li, Z. et al.** "Fourier Neural Operator for parametric PDEs." *ICLR*, 2021.
