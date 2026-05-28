# 流体力学 (Fluid Mechanics)

> *流体力学研究液体 + 气体行为。Navier-Stokes 方程是核心(Clay Millennium Problem,$1M 未解)。Re (Reynolds) 判 laminar/turbulent。机器人 / 制造涉:hydraulic、pneumatic、UAV aero、3D printing 喷头、CFD 仿真。*
>
> **难度**:Advanced
> **前置知识**:微积分、PDE、[Thermodynamics](Thermodynamics.md)

---

## 1. 流体基本

- **Density** $\rho$ (kg/m³)
- **Viscosity** $\mu$ (Pa·s, dynamic), $\nu = \mu / \rho$ (m²/s, kinematic)
- **Surface tension** $\sigma$ (N/m)
- **Compressibility**: 液体几不可压,气体 Ma > 0.3 显著

---

## 2. Navier-Stokes 方程

$$\rho \left( \frac{\partial \mathbf{v}}{\partial t} + \mathbf{v} \cdot \nabla \mathbf{v} \right) = -\nabla p + \mu \nabla^2 \mathbf{v} + \rho \mathbf{g}$$

+ 连续性方程 $\nabla \cdot \mathbf{v} = 0$ (不可压)

- 非线性(对流项 $\mathbf{v} \cdot \nabla \mathbf{v}$)
- 全 3D 存在 & smoothness 未证明(Clay Prize)
- 大 Re 数 → turbulence,chaotic

---

## 3. Reynolds 数

$$Re = \frac{\rho v L}{\mu}$$

- $Re < 2300$: laminar (parallel streamlines)
- $Re > 4000$: turbulent
- 之间:transition
- 决定 viscous vs inertial 主导

---

## 4. Bernoulli 方程

沿 streamline,无 viscous:
$$\frac{1}{2} \rho v^2 + \rho g h + p = \text{const}$$

- 解释 lift、Venturi 效应
- 但忽略 viscosity(实际 limited)

---

## 5. 边界层

- 近壁 viscous-dominated 薄层
- $\delta \sim 5/\sqrt{Re_x}$ (laminar)
- 流分离 → drag、stall
- 飞行器 / 机翼设计核心

---

## 6. CFD (Computational Fluid Dynamics)

数值解 NS 方程:
- **DNS**: Direct Numerical Simulation,解全 turbulence(超贵)
- **LES**: Large Eddy Simulation,filter 小尺度
- **RANS**: Reynolds-averaged,model turbulence(主流)

软件:OpenFOAM、Fluent、STAR-CCM+、SU2。

---

## 7. Python — Poiseuille 流(简化)

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

## 8. 应用 — 机器人 / 工程

| 领域 | 流体应用 |
|---|---|
| Hydraulic arm | 高功率执行(挖掘机) |
| Pneumatic gripper | 气动夹爪(soft robot) |
| UAV propeller | 升力 + 阻力 design |
| Drone aerodynamics | quadcopter 优化 |
| Underwater ROV | drag、buoyancy |
| 3D printing | nozzle 喷射 |
| Cooling | electronics 散热 |
| Lab-on-chip | microfluidics |

---

## 9. Pneumatic vs Hydraulic

| 维度 | Hydraulic | Pneumatic |
|---|---|---|
| 流体 | 油 (不可压) | 气 (可压) |
| 功率密度 | 高 | 中 |
| 速度 | 慢、精 | 快、粗 |
| Compliance | 低 | 高(natural for soft robot) |
| 维护 | 漏油烦 | 干净 |

---

## 10. Turbulence Models

- **k-ε**: 双方程,工业主流
- **k-ω SST**: 边界层好
- **Reynolds Stress**: 全 anisotropic(贵)
- **LES**: 直接 large eddies
- ML-based turbulence model 新兴(NVIDIA Modulus)

---

## 11. 常见问题

### 11.1 Bernoulli 用 viscous

Bernoulli 假设 inviscid;近壁 invalid。

### 11.2 Re 数 dimensionless 但仍 critical

不同 geometry critical Re 不同(pipe 2300、cylinder 200,000)。

### 11.3 CFD 必 mesh-convergence

Mesh 不收敛 → 错。Grid-independence study 必。

### 11.4 Turbulence model 万能

每 model 有 valid 范围;non-equilibrium flow 都不准。

### 11.5 Pneumatic 精控难

气可压 → 弹性 + delay,position control 难。

---

## 12. Related Concepts

- **同节**:[Thermodynamics](Thermodynamics.md)、[Materials Science](Materials_Science.md)
- **应用**:Hydraulic actuator、Pneumatic gripper
- **CFD**: OpenFOAM、Ansys Fluent

---

## References

1. **White, F. M.** *Fluid Mechanics*. 8th ed., 2016.
2. **Pope, S. B.** *Turbulent Flows*. 2000.
3. **Anderson, J. D.** *Computational Fluid Dynamics*. 1995.
4. **Batchelor, G. K.** *An Introduction to Fluid Dynamics*. 1967.
