# Operational Amplifier (Op-Amp) — Analog Circuit Core

> *Op-amp is the most versatile analog circuit component. Integrated since the 1960s, countless analog designs build on it. This article covers principles + common topologies + engineering practice.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: circuit analysis

---

## 1. Ideal Characteristics

- **Infinite gain** ($A_v \to \infty$)
- **Infinite input impedance** ($Z_{in} \to \infty$)
- **Zero output impedance** ($Z_{out} = 0$)
- **Infinite bandwidth**
- **Zero offset**

Real op-amps approximate (TLV2772, LM358, OPA2134).

---

## 2. Golden Rules (with negative feedback)

1. $V_+ = V_-$ (virtual short)
2. $I_{in} = 0$ (virtual open)

---

## 3. Classic Topologies

### 3.1 Inverting Amplifier

$$V_{out} = -\frac{R_f}{R_1} V_{in}$$

### 3.2 Non-inverting Amplifier

$$V_{out} = \left(1 + \frac{R_f}{R_1}\right) V_{in}$$

### 3.3 Voltage Follower (buffer)

$V_{out} = V_{in}$, gain 1, **high input + low output impedance** → impedance matching.

### 3.4 Differential Amplifier

$$V_{out} = \frac{R_f}{R_1} (V_2 - V_1)$$

### 3.5 Integrator

$$V_{out} = -\frac{1}{RC} \int V_{in} \, dt$$

### 3.6 Differentiator

$V_{out} = -RC \frac{dV_{in}}{dt}$

### 3.7 Comparator

No feedback, output saturates to rail. Analog → digital (Schmitt trigger adds hysteresis).

---

## 4. Real Op-Amp Limits

- **Finite GBW**: 1-100 MHz
- **Slew rate**: V/μs (large-signal distortion)
- **Offset voltage**: μV-mV
- **Input bias current**: pA-μA
- **Noise**: nV/√Hz

Choose for application:
- Audio: low noise (NE5532)
- Precision: low offset (OPA189)
- High-speed: high GBW (LMH6629)
- Low power: μW (TLV9001)

---

## 5. Python / NumPy — Simulation

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import TransferFunction, bode

R1, Rf = 1e3, 10e3
GBW = 1e6
gain = 1 + Rf / R1
fc = GBW / gain
num = [gain]
den = [1 / (2 * np.pi * fc), 1]
sys = TransferFunction(num, den)
w, mag, phase = bode(sys)
plt.semilogx(w / (2 * np.pi), mag)
```

---

## 6. PCB Tips

- Bypass capacitor (0.1 μF) close to V_cc
- Short traces, avoid long feedback loops
- Guard ring for low-leakage
- Complete ground plane

---

## 7. Applications

- Audio amplifier
- Sensor signal conditioning (strain gauge, thermocouple)
- Filter design (Sallen-Key, MFB)
- ADC driver
- Voltage reference buffer
- Active power supply

---

## 8. Common Pitfalls

### 8.1 Stability

Wrong feedback or capacitance load → oscillation. Check phase margin.

### 8.2 Saturation

Output hits rail (V_cc or V_ee).

### 8.3 Single vs Dual Supply

Many op-amps need ± supply; rail-to-rail types allow single supply.

### 8.4 Input Range

Common-mode input must be in op-amp allowed range.

### 8.5 Noise / Interference

Analog circuits sensitive to PCB layout.

---

## 9. Related Concepts

- **Applications**: [Sensors](../05_Sensors_Perception/index.en.md)

---

## References

1. **Sedra, A. S. & Smith, K. C.** *Microelectronic Circuits*. 8th ed., 2019.
2. **Horowitz, P. & Hill, W.** *The Art of Electronics*. 3rd ed., 2015.
3. **Mancini, R.** *Op Amps for Everyone*. 5th ed., 2018.
4. TI / Analog Devices op-amp datasheets.
