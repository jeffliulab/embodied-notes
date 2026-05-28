# PDE Methods

> *PDEs are the core mathematical language of physics + engineering: heat, wave, Navier-Stokes, Maxwell. Robot control, CFD, FEA, EM simulation all rely on PDEs. Three classes (elliptic, parabolic, hyperbolic) each have numerical methods (FDM, FEM, FVM, Spectral). AI trends: PINN, Neural Operators.*
>
> **Difficulty**: Advanced
> **Prerequisites**: Multivariable calculus, ODEs, linear algebra

---

## 1. PDE Classification

| Class | Example | Math |
|---|---|---|
| **Elliptic** | Laplace, Poisson | Static equilibrium |
| **Parabolic** | Heat | Diffusion |
| **Hyperbolic** | Wave, advection | Propagation |
| **Mixed** | Navier-Stokes | Complex |

Second-order PDE: $A u_{xx} + B u_{xy} + C u_{yy} + ...$
- $B² - 4AC < 0$: elliptic
- $= 0$: parabolic
- $> 0$: hyperbolic

---

## 2. Classic PDEs

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

## 3. Numerical Methods

### 3.1 FDM (Finite Difference)

- Discretize derivatives directly
- Simple, Cartesian grid
- Irregular domains hard

### 3.2 FEM (Finite Element)

- Variational form
- Arbitrary mesh
- Flexible, industry standard
- See [FEA](../04_Mechanical_Engineering/Finite_Element_Analysis.en.md)

### 3.3 FVM (Finite Volume)

- Conserves conservation laws
- CFD mainstream

### 3.4 Spectral Methods

- Fourier / Chebyshev basis
- High accuracy on smooth solutions
- But boundary handling complex

---

## 4. Stability + Accuracy

### 4.1 CFL Condition

For explicit hyperbolic:
$$\Delta t \leq \frac{\Delta x}{c}$$

Else unstable.

### 4.2 Von Neumann Analysis

Test Fourier mode growth rate.

### 4.3 Order

- Forward / backward Euler: 1st order
- Crank-Nicolson: 2nd order, implicit
- Runge-Kutta: 4th order
- Higher order → less error at same Δx

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

Explicit has CFL constraint. Implicit:
$$\frac{u^{n+1} - u^n}{\Delta t} = \alpha \frac{u^{n+1}_{i+1} - 2 u^{n+1}_i + u^{n+1}_{i-1}}{\Delta x^2}$$

Solve linear system $A u^{n+1} = b$, but unconditionally stable.

---

## 7. AI / PDE Hybrid

### 7.1 Physics-Informed NN (PINN)

- NN fits u(x, t)
- Loss includes PDE residual
- Boundary, IC also in loss
- Good for inverse problems

### 7.2 Neural Operators

- **FNO** (Fourier Neural Operator, Li 2020): Fourier basis NN
- **DeepONet**: branch + trunk
- Learn family of PDE solutions

### 7.3 Sciml.jl / NVIDIA Modulus

- Commercial PDE + ML tools

---

## 8. Applications — Robotics + Engineering

| Domain | PDE |
|---|---|
| Heat dissipation | Heat equation + FEM |
| CFD (drone, fluid sim) | Navier-Stokes + FVM |
| Structural stress | Elasticity + FEM |
| EM (motor, antenna) | Maxwell + FEM/FDTD |
| Control (DPS, distributed param) | Various |
| Wave propagation | Wave + FDM |
| Phase-field (materials) | Cahn-Hilliard + FEM |

---

## 9. Software

| Tool | Class |
|---|---|
| **FEniCS** | Python FEM |
| **PETSc** | Large-scale linear / nonlinear |
| **deal.II** | C++ FEM |
| **OpenFOAM** | CFD FVM |
| **COMSOL** | Commercial multi-physics |
| **Modulus** (NVIDIA) | PINN, AI for PDE |
| **DiffEqFlux.jl** | Julia |

---

## 10. Common Pitfalls

### 10.1 CFL Unimportant

Required for explicit methods; violation → blow up.

### 10.2 Finer Mesh = Accurate

Not necessarily; low-order method + fine mesh still large error. Order matters.

### 10.3 PINN Replaces FEA

Still immature for industrial accuracy.

### 10.4 Boundary Unimportant

PDE solution heavily depends on boundary. Dirichlet / Neumann / Robin distinction critical.

### 10.5 First-order PDE = Simple

First-order hyperbolic shock formation complex (Burgers equation).

---

## 11. Related Concepts

- **Same section**: [Linear Algebra](Linear_Algebra.en.md), [Signal Processing](Signal_Processing.en.md), [Fluid Mechanics](Fluid_Mechanics.en.md)
- **Applications**: [FEA](../04_Mechanical_Engineering/Finite_Element_Analysis.en.md)
- **AI**: Physics-Informed NN

---

## References

1. **Strikwerda, J. C.** *Finite Difference Schemes and PDEs*. 2nd ed., 2004.
2. **LeVeque, R. J.** *Finite Volume Methods for Hyperbolic Problems*. 2002.
3. **Raissi, M. et al.** "Physics-informed neural networks." *J Comput Phys*, 2019.
4. **Li, Z. et al.** "Fourier Neural Operator for parametric PDEs." *ICLR*, 2021.
