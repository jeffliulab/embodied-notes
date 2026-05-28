# Wireless Power Transfer (WPT)

> *Wireless charging uses electromagnetic fields to transfer energy without cables. Qi (inductive, < 15 W, phones), AirFuel (magnetic resonance, ~ 50 W), EV high-power (~ 11 kW, SAE J2954), far-field RF. Proposed by Tesla in 1891; commercialized 2008 (Qi). Robotics, implants, EVs are key applications, efficiency ~ 70-90%.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: Electromagnetic induction, resonance, power electronics

---

## 1. Three Principles

### 1.1 Inductive Coupling (Near-Field)

- Two coils very close (< 10 mm)
- Faraday induction
- High efficiency (~ 90%)
- Short distance, low angular tolerance
- Representative: Qi phone charging

### 1.2 Magnetic Resonance (Mid-Field)

- Two coils + resonant caps (matching frequency)
- Distance cm~m
- Witricity / AirFuel
- Efficiency ~ 70-90%
- Better tolerance (cm offset)

### 1.3 RF / Microwave (Far-Field)

- Microwave or laser
- m~km distance
- Low efficiency (~ 1-10%)
- Satellite → ground research, distant IoT

---

## 2. Qi Standard

- WPC (Wireless Power Consortium) 2008
- 5W (Qi1.0), 15W (Qi1.2), 15W (Qi2 MagSafe-like)
- 100+ kHz frequency
- Two-way comm (Tx ↔ Rx via load modulation)
- Standard on mainstream phones

---

## 3. EV Wireless Charging

- SAE J2954 standard
- 85 kHz frequency
- 3.7 kW (WPT1), 7.7 kW (WPT2), 11 kW (WPT3), 22 kW (WPT4)
- WAVE (Witricity acquired), HEVO, etc.
- Dynamic charging (road-embedded): still demo

---

## 4. System Components

```
AC mains
   ↓
PFC + Rectifier (Tx side)
   ↓
DC-AC Inverter (100 kHz)
   ↓
Tx Coil (with resonant cap)
   ~~~~ Magnetic field
Rx Coil (with resonant cap)
   ↓
Rectifier + DC-DC
   ↓
Battery / Load
```

---

## 5. Key Parameters

- **Coupling coefficient k**: 0-1, geometry determined
- **Quality factor Q**: $Q = \omega L / R$
- **Efficiency η**: directly related to kQ
- **Air gap**: influences k
- **Frequency**: kHz (Qi) ~ MHz (UAV)

---

## 6. Resonance Condition

$$\omega_0 = \frac{1}{\sqrt{LC}}$$

Tx + Rx must share same $\omega_0$, else efficiency drops sharply.
$$Q = \frac{\omega_0 L}{R}$$
High Q → low loss, but narrow bandwidth.

---

## 7. Python — Simple Model

```python
import numpy as np

def wpt_efficiency(k, Q1, Q2):
    """Compute theoretical max efficiency."""
    # Two-coil with resonance, optimal load
    kQ = k**2 * Q1 * Q2
    eta = kQ / (1 + np.sqrt(1 + kQ))**2 * 100  # %
    return eta

# Example: k=0.3, Q1=Q2=300
print(wpt_efficiency(0.3, 300, 300))  # ~ 88%
```

---

## 8. Applications — Robotics

- **AGV/AMR**: park-to-charge (no connector wear)
- **Surgical robot**: implanted in-bed charge
- **Service robot**: auto-return to dock
- **Underwater ROV**: waterproof (connectors fail underwater)
- **Implants**: pacemakers, cochlear implants

---

## 9. Safety

- **EMC**: 100 kHz radiation (need shield)
- **Bio impact**: ICNIRP guidelines
- **Metal objects**: foreign object detection (keys, coins → overheat)
- **Temperature rise**: efficiency loss = heat

---

## 10. Common Pitfalls

### 10.1 Distance ↑ → Efficiency ↓

k strongly depends on distance; cm-scale decay obvious.

### 10.2 Angular Misalignment

Coil offset → lower k.

### 10.3 Metal Object Overheating

Foreign Object Detection (FOD) essential.

### 10.4 Frequency Drift

L, C tolerance → resonance shift → efficiency drop.

### 10.5 EMC Compliance

100 kHz strong field → CE, FCC testing.

---

## 11. Related Concepts

- **Same section**: [BMS Battery Management](BMS_Battery_Management.en.md), power electronics
- **Electrical**: [Power Electronics](../01_Electrical_Engineering/Power_Electronics.en.md)

---

## References

1. **Kurs, A. et al.** "Wireless power transfer via strongly coupled magnetic resonances." *Science*, 2007.
2. **SAE J2954** *Wireless Power Transfer for Light-Duty Plug-In/Electric Vehicles*. 2020.
3. **Wireless Power Consortium** *Qi Specification v2.0*. 2023.
4. **Hui, S. Y. R., Zhong, W., Lee, C. K.** "A critical review of recent progress in mid-range wireless power transfer." *IEEE Trans Power Electron*, 2014.
