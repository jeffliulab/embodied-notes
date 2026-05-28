# Thermodynamics — Engineering Foundation

> *Thermodynamics studies energy conversion — foundational for engines, refrigeration, batteries, electronics thermal management. 4 laws + state equations + thermal cycles.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: calculus

---

## 1. Basic Concepts

- **System**: object of study (closed/open/isolated)
- **State**: described by variables (T, P, V, n)
- **Process**: path between states (isobaric, isothermal, isochoric, adiabatic)
- **Heat (Q)**: energy driven by temperature difference
- **Work (W)**: $W = \int P \, dV$

---

## 2. Laws

### 2.1 Zeroth Law

If A in thermal equilibrium with B, B with C, then A with C → temperature.

### 2.2 First Law (Energy Conservation)

$$\Delta U = Q - W$$

### 2.3 Second Law

- Heat doesn't spontaneously flow cold to hot (Clausius)
- No 100% efficient heat engine (Kelvin)
- Equivalent: $\Delta S \ge 0$

### 2.4 Third Law

$T \to 0$ K → entropy → 0.

---

## 3. Ideal Gas

$$PV = nRT$$

- $R = 8.314$ J/(mol·K)

Internal energy: $U = \frac{f}{2} nRT$.

---

## 4. Heat Engine Cycles

### 4.1 Carnot

Most efficient possible:

$$\eta_{\text{Carnot}} = 1 - \frac{T_C}{T_H}$$

### 4.2 Otto (gasoline engine)

$$\eta = 1 - \frac{1}{r^{\gamma - 1}}$$

### 4.3 Diesel

Similar to Otto but isobaric combustion.

### 4.4 Rankine (steam turbine)

Power plant main cycle.

---

## 5. Engineering Applications

### 5.1 Engines

- IC engine: $\eta$ ~30%
- Gas turbine: $\eta$ ~40%

### 5.2 Refrigeration

Inverse Carnot. COP = $Q_C / W$.

### 5.3 Battery

Electrochemical + thermodynamics: $\Delta G = -nFE$.

### 5.4 Electronics Cooling

CPU 100W in 1 cm² → needs heat sink + fan / liquid.

---

## 6. PyTorch / NumPy — Carnot

```python
def carnot_efficiency(T_hot_K, T_cold_K):
    return 1 - T_cold_K / T_hot_K

T_H = 500 + 273.15
T_C = 30 + 273.15
print(f"Max efficiency: {carnot_efficiency(T_H, T_C) * 100:.1f}%")
```

---

## 7. State Equations / Phase Transitions

- Water → steam (Clausius-Clapeyron)
- Triple point / critical point
- Latent heat: phase change at constant T

---

## 8. Heat Transfer

- **Conduction**: $\dot{Q} = -kA \nabla T$ (Fourier)
- **Convection**: $\dot{Q} = hA \Delta T$ (Newton)
- **Radiation**: $\dot{Q} = \epsilon \sigma A T^4$ (Stefan-Boltzmann)

---

## 9. Common Pitfalls

### 9.1 Units

J vs cal, K vs °C, Pa vs atm — keep clear.

### 9.2 Reversible vs Irreversible

Carnot idealized; real always irreversible.

### 9.3 Closed vs Open System

Different first law expressions.

### 9.4 Entropy ≠ Disorder

More rigorously: log of state count.

### 9.5 Perpetual Motion

Type I violates 1st law, Type II violates 2nd law.

---

## 10. Related Concepts

- **Same section**: [Linear Algebra](Linear_Algebra.en.md), [Signal Processing](Signal_Processing.en.md)

---

## References

1. **Cengel, Y. A. & Boles, M. A.** *Thermodynamics: An Engineering Approach*. 9th ed., 2019.
2. **Moran, M. J. et al.** *Fundamentals of Engineering Thermodynamics*. 8th ed., 2014.
3. **Atkins, P.** *The Laws of Thermodynamics: A Very Short Introduction*. Oxford, 2010.
