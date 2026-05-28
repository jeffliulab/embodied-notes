# Power Electronics

> *Power electronics uses semiconductor switches for power conversion — AC/DC, DC/DC, DC/AC, AC/AC. From phone chargers (5W) to EV inverters (100kW+) to grid HVDC (GW). MOSFET / IGBT / GaN / SiC are core switches.*
>
> **Difficulty**: Intermediate-Advanced
> **Prerequisites**: [Op-Amp](Op_Amp.en.md), electromagnetic basics

---

## 1. Power Semiconductors

- **MOSFET**: < 600V, < 100A, MHz switching → low power
- **IGBT**: 600V-6500V, high current, 5-50 kHz → medium power
- **GaN HEMT**: < 650V, MHz+ → efficient chargers, 5G
- **SiC MOSFET**: 650V-3300V, 50 kHz+ → EV inverters (Tesla Model 3 uses)
- **Thyristor / SCR**: extreme current (kA), low freq → industrial / grid

---

## 2. Basic Topologies

### 2.1 Buck Converter

```
   V_in
    |
   [S]──┬──[L]──→ V_out (< V_in)
        │
        [D] (or sync MOSFET)
        │
       GND
```

$$V_{out} = D \cdot V_{in}$$

### 2.2 Boost

$V_{out} = V_{in} / (1 - D)$.

### 2.3 Buck-Boost

Either step up or down.

### 2.4 Flyback

Isolation → uses transformer. Phone chargers.

### 2.5 Half-Bridge / Full-Bridge

DC → AC, used for inverters, motor drives, high power.

---

## 3. PWM Control

- Frequency: 10 kHz - 1 MHz
- Adjust duty → adjust output

Control loop: op-amp / MCU adjusts duty to maintain target voltage.

---

## 4. Classic Chips

- **LM2596**: simple buck, $1, 3A
- **LM2675**: Buck, sync rectifier
- **TPS54xxx** (TI): high efficiency
- **LT8XXX** (Linear): various topologies
- **UCC25xxx** (TI): resonant LLC
- **MP1584**: 600 kHz, 3A buck

---

## 5. Applications

| Application | Topology | Power | Voltage |
|---|---|---|---|
| Phone charger (USB-C PD) | Flyback / LLC | 5-100W | 5-20V |
| Laptop brick | LLC + sync rect | 30-100W | 19V |
| EV onboard charger | LLC / PFC | 3-22 kW | 200-800V |
| EV inverter (motor) | 3-phase full-bridge | 100-300 kW | 400-800V |
| Solar inverter | Boost + bridge | 1-100 kW | 200-1500V |
| HVDC grid | Modular Multilevel | GW | 100s kV |
| Data center PSU | Interleaved + LLC | 1-3 kW | 12V (rack) |

---

## 6. PyTorch / Python — Buck Converter Simulation

```python
import numpy as np

def buck_sim(V_in=12, V_target=5, L=10e-6, C=100e-6, R_load=1, f_sw=100e3, t_end=1e-3, dt=1e-7):
    V_out = 0
    I_L = 0
    history = []
    for t in np.arange(0, t_end, dt):
        error = V_target - V_out
        D = max(0.05, min(0.95, V_target / V_in + 0.01 * error))
        dV = (I_L - V_out / R_load) / C
        dI = (D * V_in - V_out) / L
        V_out += dV * dt
        I_L += dI * dt
        history.append((t, V_out, I_L, D))
    return history
```

---

## 7. Efficiency / Losses

- **Conduction loss**: $I^2 R_{ds(on)}$ in MOSFET
- **Switching loss**: $\propto f_{sw} \cdot V \cdot I$ at switching moments
- **Magnetic loss**: core + copper
- **Capacitor ESR loss**

90% efficiency = good; 95%+ = excellent; 99%+ = elite (LLC + GaN).

---

## 8. EMI / EMC

PWM switching → high-frequency EMI:
- Input / output LC filters
- Shielding
- Common-mode choke
- Careful PCB layout (small loop area)
- Comply with EN 55022, FCC standards

---

## 9. Safety

- High voltage isolation (transformer)
- Thermal management (heat sink)
- OVP / OCP (overvoltage / overcurrent protection)
- Soft-start (limits inrush)

---

## 10. Common Pitfalls

### 10.1 Wrong Inductor

Inductor saturation → MOSFET burns. Carefully calculate ripple current.

### 10.2 Output Cap ESR

High ESR → high output ripple. Use ceramic + electrolytic in parallel.

### 10.3 EMC Failures

Bad PCB layout → 50+ trials to comply.

### 10.4 Heat

100W × 5% loss = 5W heat. Heat sink required.

### 10.5 Anti-parallel Diode

MOSFET doesn't have → external Schottky needed for freewheeling.

---

## 11. Related Concepts

- **Same section**: [Op-Amp](Op_Amp.en.md), [ADC / DAC](ADC_DAC.en.md)
- **Applications**: [Battery Technology](../07_Power_Energy/电池技术.en.md), [Power Management Circuits](../07_Power_Energy/电源管理电路.en.md)

---

## References

1. **Erickson, R. W. & Maksimovic, D.** *Fundamentals of Power Electronics*. 3rd ed., 2020.
2. **Rashid, M. H.** *Power Electronics: Devices, Circuits, and Applications*. 4th ed., 2014.
3. TI / Infineon / ON Semi power electronics application notes.
