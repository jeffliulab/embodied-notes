# 运算放大器 (Op-Amp) — 模拟电路核心

> *Op-Amp 是模拟电路最 versatile 元件。从 1960s 集成至今,无数模拟电路设计基于它。本篇覆盖基本原理 + 常用 topology + 工程实践。*
>
> **难度**:Intermediate

---

## 1. Op-Amp 理想特性

- **无限增益** ($A_v \to \infty$)
- **无限输入阻抗** ($Z_{in} \to \infty$)
- **零输出阻抗** ($Z_{out} = 0$)
- **无限带宽**
- **零 offset**

实际 op-amp 近似 (TLV2772, LM358, OPA2134 等)。

---

## 2. 黄金法则 (with negative feedback)

1. $V_+ = V_-$ (虚短)
2. $I_{in} = 0$ (虚断)

---

## 3. 经典 topology

### 3.1 Inverting Amplifier

```
  Vin ─[R1]──┬── V- (-)
              │
   ────[Rf]──┤    op-amp ──> Vout
              │
              └── V+ (+) ─── GND
```

$$V_{out} = -\frac{R_f}{R_1} V_{in}$$

### 3.2 Non-inverting Amplifier

```
  Vin ─── V+ (+)
                 op-amp ──> Vout
              ┌── V- (-) ───[R1]── GND
              └─[Rf]─┘
```

$$V_{out} = \left(1 + \frac{R_f}{R_1}\right) V_{in}$$

### 3.3 Voltage Follower (buffer)

$V_{out} = V_{in}$,增益 1,但**高输入阻抗 + 低输出阻抗** → impedance matching。

### 3.4 Differential Amplifier

$$V_{out} = \frac{R_f}{R_1} (V_2 - V_1)$$

测两点电压差 (sensor bridges)。

### 3.5 Integrator

```
  Vin ─[R]──┬── V- (-)
             │
   ────[C]──┤    op-amp ──> Vout
             │
             └── V+ (+) ─── GND
```

$$V_{out} = -\frac{1}{RC} \int V_{in} \, dt$$

### 3.6 Differentiator

C 与 R 对调:$V_{out} = -RC \frac{dV_{in}}{dt}$。

### 3.7 Comparator

无 feedback,output saturate to rail。
模拟 → 数字 (Schmitt trigger 加 hysteresis)。

---

## 4. 实际 op-amp 局限

- **Finite gain-bandwidth product** (GBW): 1-100 MHz
- **Slew rate**: V/μs (大信号 distortion)
- **Offset voltage**: μV-mV
- **Input bias current**: pA-μA
- **Noise**: nV/√Hz

选 op-amp 看 application:
- Audio: 低 noise (NE5532)
- Precision: 低 offset (OPA189)
- High-speed: 高 GBW (LMH6629)
- Low power: μW (TLV9001)

---

## 5. PyTorch / NumPy — 仿真

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import TransferFunction, bode

# Non-inverting amp transfer function
R1, Rf = 1e3, 10e3  # 11× gain
GBW = 1e6  # 1 MHz
# Open-loop: A(s) = GBW * 2π / s
# Closed-loop: H(s) = (1 + Rf/R1) / (1 + s / (GBW * 2π * (1 + Rf/R1)))
gain = 1 + Rf / R1
fc = GBW / gain
num = [gain]
den = [1 / (2 * np.pi * fc), 1]
sys = TransferFunction(num, den)
w, mag, phase = bode(sys)
plt.semilogx(w / (2 * np.pi), mag)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Gain (dB)')
```

---

## 6. PCB 设计提示

- Bypass capacitor (0.1 μF) 紧靠 V_cc pin
- 短走线,避免 long feedback loop
- Guard ring for low-leakage
- Ground plane 完整

---

## 7. 应用

- Audio amp
- Sensor signal conditioning (strain gauge, thermocouple)
- Filter design (Sallen-Key, MFB)
- ADC driver
- Voltage reference buffer
- Active power supply

---

## 8. Common Pitfalls

### 8.1 Stability

Wrong feedback 或 capacitance load → oscillation。需 phase margin 检查。

### 8.2 Saturation

输出 hit rail (V_cc 或 V_ee)。

### 8.3 单 vs 双电源

许多 op-amp 需 ± supply;rail-to-rail 类型可单电源。

### 8.4 Input range

Common-mode input 必须在 op-amp 允许范围。

### 8.5 噪声 / 干扰

模拟电路对 PCB layout 敏感。

---

## 9. Related Concepts

- **应用**:[Sensors](../05_Sensors_Perception/index.md)、[FOC 电机控制](../06_Actuators_Motors/无刷电机与FOC.md)

---

## References

1. **Sedra, A. S. & Smith, K. C.** *Microelectronic Circuits*. 8th ed., 2019.
2. **Horowitz, P. & Hill, W.** *The Art of Electronics*. 3rd ed., 2015.
3. **Mancini, R.** *Op Amps for Everyone*. 5th ed., 2018.
4. TI / Analog Devices op-amp datasheets.
