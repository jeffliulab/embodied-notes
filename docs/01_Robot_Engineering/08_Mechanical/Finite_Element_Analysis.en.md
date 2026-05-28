# Finite Element Analysis (FEA)

> *FEA discretizes a domain with a mesh and solves PDEs using variational principles. General-purpose for structural static / vibration / thermal / fluid / electromagnetics. Ansys, Abaqus, COMSOL, SolidWorks Simulation, OpenFOAM, Calculix are mainstream tools. Essential for robot structures, enclosures, joint mechanics.*
>
> **Difficulty**: Advanced
> **Prerequisites**: Linear algebra, PDEs, continuum mechanics

---

## 1. Core Idea

- Cover domain with N simple elements (triangle, tetrahedron, hex)
- Approximate field as polynomial on each element
- Global stiffness matrix $\mathbf{K}$ assembled from element K
- Solve linear system $\mathbf{K u} = \mathbf{F}$ for nodal displacements

---

## 2. Math (Linear Elasticity)

PDE:
$$\nabla \cdot \sigma + b = 0$$

with $\sigma = C : \varepsilon$, $\varepsilon = \frac{1}{2}(\nabla u + \nabla u^T)$.

Weak form (Galerkin):
$$\int_\Omega \delta \varepsilon : \sigma \, dV = \int_\Omega \delta u \cdot b \, dV + \int_\Gamma \delta u \cdot t \, dS$$

Discretize $u = N_i u_i$ → $\mathbf{K u} = \mathbf{F}$.

---

## 3. Element Types

| Element | DOF / node | Use |
|---|---|---|
| Linear tri (T3) | 2 | 2D coarse |
| Quadratic tri (T6) | 2 | 2D fine |
| Linear tet (T4) | 3 | 3D coarse |
| Quadratic tet (T10) | 3 | 3D fine |
| Linear hex (H8) | 3 | 3D high quality |
| Shell (S3, S4) | 6 | Plates/shells |
| Beam | 6 | Bars/beams |

---

## 4. Solve Types

| Type | Use |
|---|---|
| Static | Static |
| Modal | Natural frequencies |
| Harmonic | Sinusoidal forced response |
| Transient | Time-varying (impact, drop) |
| Nonlinear static | Large strain / plasticity / contact |
| Buckling | Buckling |
| Thermal | Heat conduction |
| CFD | Fluid |

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

## 7. Mesh Quality Metrics

- **Aspect ratio**: edge ratio, < 5 good
- **Skewness**: skewness, < 0.5 good
- **Jacobian**: > 0 (avoid inverted element)
- **h-refinement**: local refinement
- **p-refinement**: increase polynomial order

---

## 8. Applications — Robotics / Engineering

- **Robot arm**: static + modal (avoid resonance)
- **Mobile robot chassis**: drop test, vibration
- **MEMS**: micro-structure modal
- **PCB**: thermal / vibration
- **Joint**: nonlinear contact
- **Aerospace**: full-aircraft FEA

---

## 9. Software Comparison

| Software | Strength | License |
|---|---|---|
| Ansys | Comprehensive, industry std | Commercial |
| Abaqus | Nonlinear, explicit | Commercial |
| COMSOL | Multi-physics | Commercial |
| SolidWorks Simulation | CAD integrated | Commercial |
| Nastran | Aerospace | Commercial |
| Calculix | Open Abaqus-compatible | GPL |
| Code_Aster | EDF open source | GPL |
| FEniCS | Python FEM | LGPL |
| OpenFOAM | CFD | GPL |

---

## 10. AI / FEA Hybrid

- **Physics-Informed Neural Networks (PINN)**: NN fits PDE solution
- **Neural Operators (FNO, DeepONet)**: learn family of PDE solutions
- **Reduced-Order Models**: NN accelerate FEA
- But PINN still far from industrial-grade FEA

---

## 11. Common Pitfalls

### 11.1 Mesh Too Coarse

High error; refine critical regions (stress concentrations).

### 11.2 Linear Assumption

Large strain / plasticity / contact → must use nonlinear.

### 11.3 Wrong BC

Over-constrained → singular or false stress.

### 11.4 Unit Mix-up

mm-N-s vs m-kg-s, missed conversion → results off by 1000×.

### 11.5 Validation

FEA result ≠ truth; experimental validation essential.

---

## 12. Related Concepts

- **Same section**: [Bearings](Bearings.en.md)
- **Math basis**: [Linear Algebra](../00_Foundations/Linear_Algebra.en.md), [Materials Science](../00_Foundations/Materials_Science.en.md)
- **Robotics**: [SLAM Basics](../10_Robot_Integration/SLAM_Basics.en.md)

---

## References

1. **Hughes, T. J. R.** *The Finite Element Method*. Dover, 2000.
2. **Zienkiewicz, O. C. & Taylor, R. L.** *The Finite Element Method*. 7th ed., 2013.
3. **Cook, R. D. et al.** *Concepts and Applications of Finite Element Analysis*. 4th ed., 2001.
4. **Bathe, K.-J.** *Finite Element Procedures*. 2nd ed., 2014.
