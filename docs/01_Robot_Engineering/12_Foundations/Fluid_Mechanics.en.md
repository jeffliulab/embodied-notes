# Fluid Mechanics

> *Fluid mechanics studies liquids + gases behavior. Navier-Stokes is the core equation (Clay Millennium Problem, $1M unsolved). Re (Reynolds) distinguishes laminar/turbulent. Robotics / manufacturing applications: hydraulic, pneumatic, UAV aero, 3D printing nozzles, CFD simulation.*
>
> **Difficulty**: Advanced
> **Prerequisites**: Calculus, PDEs, [Thermodynamics](Thermodynamics.en.md)

---

## 1. Fluid Basics

- **Density** $\rho$ (kg/m³)
- **Viscosity** $\mu$ (Pa·s, dynamic), $\nu = \mu / \rho$ (m²/s, kinematic)
- **Surface tension** $\sigma$ (N/m)
- **Compressibility**: liquids ~ incompressible, gases above Ma > 0.3 significant

---

## 2. Navier-Stokes Equation

$$\rho \left( \frac{\partial \mathbf{v}}{\partial t} + \mathbf{v} \cdot \nabla \mathbf{v} \right) = -\nabla p + \mu \nabla^2 \mathbf{v} + \rho \mathbf{g}$$

+ continuity $\nabla \cdot \mathbf{v} = 0$ (incompressible)

- Nonlinear (convection $\mathbf{v} \cdot \nabla \mathbf{v}$)
- Full 3D existence & smoothness unproven (Clay Prize)
- High Re → turbulence, chaotic

---

## 3. Reynolds Number

$$Re = \frac{\rho v L}{\mu}$$

- $Re < 2300$: laminar (parallel streamlines)
- $Re > 4000$: turbulent
- Between: transition
- Determines viscous vs inertial dominance

---

## 4. Bernoulli Equation

Along streamline, inviscid:
$$\frac{1}{2} \rho v^2 + \rho g h + p = \text{const}$$

- Explains lift, Venturi effect
- But ignores viscosity (limited in practice)

---

## 5. Boundary Layer

- Thin viscous-dominated layer near wall
- $\delta \sim 5/\sqrt{Re_x}$ (laminar)
- Separation → drag, stall
- Core to aircraft / wing design

---

## 6. CFD (Computational Fluid Dynamics)

Numerical NS solution:
- **DNS**: Direct Numerical Simulation, solves full turbulence (very expensive)
- **LES**: Large Eddy Simulation, filters small scales
- **RANS**: Reynolds-averaged, models turbulence (mainstream)

Software: OpenFOAM, Fluent, STAR-CCM+, SU2.

---

## 7. Python — Poiseuille Flow (simplified)

```python
import numpy as np

def poiseuille_flow(R, dp_dz, mu, n_r=50):
    """1D Poiseuille flow in a pipe.
    v(r) = (1 / 4μ) (-dp/dz) (R² - r²)
    """
    r = np.linspace(0, R, n_r)
    v = (1 / (4 * mu)) * (-dp_dz) * (R**2 - r**2)
    Q = (np.pi * R**4 / (8 * mu)) * (-dp_dz)  # volumetric flow
    return r, v, Q
```

---

## 8. Applications — Robotics / Engineering

| Field | Fluid application |
|---|---|
| Hydraulic arm | High-power actuator (excavator) |
| Pneumatic gripper | Air gripper (soft robot) |
| UAV propeller | Lift + drag design |
| Drone aerodynamics | Quadcopter optimization |
| Underwater ROV | Drag, buoyancy |
| 3D printing | Nozzle extrusion |
| Cooling | Electronics heat dissipation |
| Lab-on-chip | Microfluidics |

---

## 9. Pneumatic vs Hydraulic

| Dimension | Hydraulic | Pneumatic |
|---|---|---|
| Fluid | Oil (incompressible) | Air (compressible) |
| Power density | High | Medium |
| Speed | Slow, precise | Fast, coarse |
| Compliance | Low | High (natural for soft robot) |
| Maintenance | Oil leak nuisance | Clean |

---

## 10. Turbulence Models

- **k-ε**: Two-equation, industry mainstream
- **k-ω SST**: Good near boundary layer
- **Reynolds Stress**: Full anisotropic (expensive)
- **LES**: Direct large eddies
- ML-based turbulence models emerging (NVIDIA Modulus)

---

## 11. Common Pitfalls

### 11.1 Bernoulli in Viscous

Bernoulli assumes inviscid; invalid near walls.

### 11.2 Re Number Dimensionless but Critical Differs

Critical Re varies by geometry (pipe 2300, cylinder 200,000).

### 11.3 CFD Mesh Convergence

Mesh not converged → wrong. Grid-independence study essential.

### 11.4 Turbulence Model Universal

Each model has validity range; non-equilibrium flow all imprecise.

### 11.5 Pneumatic Precise Control Hard

Air compressible → elasticity + delay, position control hard.

---

## 12. Related Concepts

- **Same section**: [Thermodynamics](Thermodynamics.en.md), [Materials Science](Materials_Science.en.md)
- **Applications**: Hydraulic actuator, Pneumatic gripper
- **CFD**: OpenFOAM, Ansys Fluent

---

## References

1. **White, F. M.** *Fluid Mechanics*. 8th ed., 2016.
2. **Pope, S. B.** *Turbulent Flows*. 2000.
3. **Anderson, J. D.** *Computational Fluid Dynamics*. 1995.
4. **Batchelor, G. K.** *An Introduction to Fluid Dynamics*. 1967.
