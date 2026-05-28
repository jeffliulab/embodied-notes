# 热力学 (Thermodynamics) — 工程基础

> *热力学是研究 energy 转换的科学,工程界基础:engine, refrigeration, battery, electronics 热管理。4 大定律 + 状态方程 + 热机循环。*
>
> **难度**:Intermediate
> **前置知识**:微积分

---

## 1. 基本概念

- **System**: 研究对象 (closed/open/isolated)
- **State**: 由 state variables (T, P, V, n) 描述
- **Process**: state 间的 path (isobaric, isothermal, isochoric, adiabatic)
- **Heat (Q)**: 由温差驱动 energy
- **Work (W)**: $W = \int P \, dV$

---

## 2. 热力学定律

### 2.1 第零定律

If A 与 B 热平衡, B 与 C 热平衡, 则 A 与 C 热平衡 → 温度概念。

### 2.2 第一定律 (能量守恒)

$$\Delta U = Q - W$$

- $\Delta U$: internal energy change
- $Q > 0$: 系统吸热
- $W > 0$: 系统对外做功

### 2.3 第二定律

- 热不能自发从冷流向热 (Clausius)
- 不存在 100% 效率热机 (Kelvin)
- 等价: $\Delta S \ge 0$ (entropy 总增)

### 2.4 第三定律

$T \to 0$ K → entropy → 0 (绝对零度不可达)。

---

## 3. 理想气体

$$PV = nRT$$

- $R = 8.314$ J/(mol·K)
- 真气体偏离 (van der Waals 等)

内能仅 T 函数:$U = \frac{f}{2} nRT$, $f$ = 自由度。

---

## 4. 热机循环

### 4.1 Carnot 循环

理想热机:isothermal + adiabatic 各 2 步。
最高可能效率:

$$\eta_{\text{Carnot}} = 1 - \frac{T_C}{T_H}$$

### 4.2 Otto 循环 (汽油机)

$$\eta = 1 - \frac{1}{r^{\gamma - 1}}, \quad r = V_{\max} / V_{\min}$$

### 4.3 Diesel 循环

类似 Otto 但 isobaric combustion。

### 4.4 Rankine (蒸汽轮机)

火电厂主循环。

---

## 5. 工程应用

### 5.1 Engine

- 内燃机:$\eta$ ~ 30%
- 燃气轮机:$\eta$ ~ 40%
- Carnot 理论上限

### 5.2 Refrigeration

逆 Carnot — 用功送热从冷到热。
COP (Coefficient of Performance) = $Q_C / W$。

### 5.3 Battery

电化学反应 + 热力学 $\Delta G = -nFE$。

### 5.4 Electronics cooling

CPU 热: 100W in 1 cm² → 需 heat sink + fan / liquid。

---

## 6. PyTorch / NumPy — Carnot 计算

```python
def carnot_efficiency(T_hot_K, T_cold_K):
    """T in Kelvin."""
    return 1 - T_cold_K / T_hot_K

# Steam turbine: 500°C source, 30°C sink
T_H = 500 + 273.15
T_C = 30 + 273.15
print(f"Max efficiency: {carnot_efficiency(T_H, T_C) * 100:.1f}%")
# ~ 60%

# Real Rankine ~ 40-45% due to irreversibilities
```

---

## 7. 状态方程 / 相变

- 水 → 蒸汽 (Clausius-Clapeyron)
- 三相点 / 临界点
- Latent heat:相变吸 / 放热不变温

---

## 8. 热传递

- **传导 (Conduction)**: $\dot{Q} = -kA \nabla T$ (Fourier 定律)
- **对流 (Convection)**: $\dot{Q} = hA \Delta T$ (Newton)
- **辐射 (Radiation)**: $\dot{Q} = \epsilon \sigma A T^4$ (Stefan-Boltzmann)

工程问题常多机制 coupled。

---

## 9. Common Pitfalls

### 9.1 单位

J vs cal, K vs °C, Pa vs atm — 务必清楚。

### 9.2 Reversible vs Irreversible

Carnot 是 idealized;真实 always irreversible。

### 9.3 Closed vs Open system

不同 first law 表达式。

### 9.4 Entropy 不是 disorder

更严格:state count log。

### 9.5 永动机

Type I 违 1st law, Type II 违 2nd law。

---

## 10. Related Concepts

- **同节**:[Linear Algebra](Linear_Algebra.md)、[Signal Processing](Signal_Processing.md)
- **应用**:[电池技术](../07_Power_Energy/电池技术.md)、[散热与防护](../04_Mechanical_Engineering/散热与防护.md)

---

## References

1. **Cengel, Y. A. & Boles, M. A.** *Thermodynamics: An Engineering Approach*. 9th ed., 2019.
2. **Moran, M. J. et al.** *Fundamentals of Engineering Thermodynamics*. 8th ed., 2014.
3. **Atkins, P.** *The Laws of Thermodynamics: A Very Short Introduction*. Oxford, 2010.
