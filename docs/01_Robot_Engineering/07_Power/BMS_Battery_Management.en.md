# Battery Management System (BMS)

> *BMS is the brain of lithium battery packs — monitors voltage / current / temperature, balances cells, estimates SoC / SoH, protects against overcharge / overdischarge / short. Every EV / phone / drone / energy storage must have BMS. This article covers architecture + algorithms + safety.*
>
> **Difficulty**: Intermediate-Advanced
> **Prerequisites**: [Battery Technology](电池技术.en.md), [Op-Amp](../01_Electrical_Engineering/Op_Amp.en.md)

---

## 1. Why BMS Needed

Lithium batteries are dangerous without management:
- **Overcharge** > 4.2V/cell → short / fire
- **Overdischarge** < 2.5V/cell → permanent damage
- **Overcurrent** → heating
- **Overtemperature** > 60°C → thermal runaway
- **Imbalance** → one cell ages early, shortens entire pack life

→ BMS provides monitoring + protection.

---

## 2. Main Functions

```
1. Cell voltage monitoring (per cell)
2. Pack current monitoring
3. Cell temperature monitoring
4. SoC (State of Charge) estimation
5. SoH (State of Health) estimation
6. Cell balancing
7. Protection (over-charge / -discharge / -current / -temp / short)
8. CAN / SMBus communication
9. Pre-charge (large capacitor inrush protection)
```

---

## 3. Topology / Architecture

### 3.1 Centralized BMS

- One BMS board controls all cells
- Simple / cheap
- Suitable for < 24 cells

### 3.2 Distributed BMS

- One slave BMS per module
- Master communicates via CAN / isoSPI
- Suitable for large EV (Tesla, BMW)

### 3.3 Modular BMS

- Between the two
- 8-16 cells per BMS module

---

## 4. Key ICs

- **BQ76952** (TI): 16-cell, highly integrated
- **LTC6811** (ADI): 12-cell, isoSPI
- **MAX17841** (Maxim)
- **MCU**: external STM32 / RISC-V for algorithm

---

## 5. SoC Estimation

### 5.1 Coulomb Counting

$$SoC(t) = SoC_0 - \frac{1}{C_{\max}} \int_0^t I(\tau) d\tau$$

Simple but accumulating error.

### 5.2 OCV (Open Circuit Voltage)

After rest, OCV ↔ SoC lookup table.
Drawback: needs hours of rest.

### 5.3 Kalman Filter

Battery model + Kalman → accurate real-time SoC.

### 5.4 ML Methods

LSTM / Transformer + historical data → SoC, SoH.

---

## 6. Cell Balancing

Cells not perfectly identical; long use → divergence.

### 6.1 Passive

- Resistor + MOSFET per cell
- High cells dissipate through resistor
- Simple / low cost

### 6.2 Active

- Energy transfers from high to low cell
- Uses inductor / capacitor
- Efficient (no heat loss) but expensive

---

## 7. Protection Thresholds (typical 18650 NMC)

| Parameter | Normal | Warning | Shutdown |
|---|---|---|---|
| Cell V | 3.0-4.2 | < 3.0 / > 4.2 | < 2.5 / > 4.3 |
| Pack I (charge) | < 0.5 C | > 1 C | > 2 C |
| Pack I (discharge) | < 3 C | > 5 C | > 10 C |
| Temp | 0-45°C | > 50 | > 60 / < -20 |

---

## 8. PyTorch / Python — SoC Kalman Filter

```python
import numpy as np

class SoCKalman:
    def __init__(self, C_max=100, R=0.05):
        self.SoC = 1.0
        self.P = 1.0
        self.C_max, self.R = C_max, R
    
    def step(self, I_measured, V_measured, dt=1.0, ocv_table=None):
        self.SoC -= I_measured * dt / 3600 / self.C_max
        self.P += 1e-4
        ocv_pred = ocv_table(self.SoC) if ocv_table else 3.7
        v_pred = ocv_pred - I_measured * self.R
        K = self.P / (self.P + 0.01)
        self.SoC += K * (V_measured - v_pred) / 4.2
        self.P *= (1 - K)
        return self.SoC
```

---

## 9. Communication (CAN bus standard)

```
CAN ID    Data
0x100     [pack V high byte, pack V low byte, ...]
0x101     [SoC %, SoH %, fault flags]
0x102     [cell 1 V, cell 2 V, ...]
0x103     [pack current high, low, ...]
```

EV uses CAN to communicate with motor controller, vehicle controller.

---

## 10. Safety / Standards

- **UL 1973**: BESS BMS
- **UN 38.3**: Li-ion transport
- **ISO 26262**: automotive functional safety
- **IEC 62619**: industrial Li-ion

---

## 11. Common Pitfalls

### 11.1 Cell V Measurement Noise

mV-level errors affect balancing decisions; need careful ADC + filter.

### 11.2 Temperature Uneven

Cells at different positions have different temperatures; need multiple thermistors.

### 11.3 SoC Drift

Coulomb counting drifts long-term; needs OCV recalibration.

### 11.4 Pre-charge

Large capacitor inrush > 1000A → burns contactor; need pre-charge resistor.

### 11.5 Communication Failure

CAN disconnect → BMS must fail-safe (open contactor).

---

## 12. Related Concepts

- **Same section**: [Battery Technology](电池技术.en.md), [Power Management Circuits](电源管理电路.en.md), [Charging & Safety](充电与安全.en.md)
- **Communication**: [CAN Bus](../08_Communication_Networks/CAN总线.en.md)
- **MCU**: [ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.en.md)

---

## References

1. **Plett, G. L.** *Battery Management Systems Volume 1 & 2*. Artech, 2015-2016.
2. **Andrea, D.** *Battery Management Systems for Large Lithium-Ion Battery Packs*. Artech, 2010.
3. **TI BQ76952 datasheet**.
4. **Lu, L. et al.** "A review on the key issues for lithium-ion battery management." *J Power Sources*, 2013.
