# 电池管理系统 (Battery Management System, BMS)

> *BMS 是锂电池组的大脑 — 监测 voltage / current / temperature, 平衡 cells, 估 SoC / SoH, 保护过充 / 过放 / 短路。任何 EV / 手机 / 无人机 / 储能都必须有 BMS。本篇覆盖架构 + 算法 + 安全。*
>
> **难度**:Intermediate-Advanced
> **前置知识**:[电池技术](电池技术.md)、[Op-Amp](../01_Electrical_Engineering/Op_Amp.md)

---

## 1. 为什么需要 BMS

锂电池 dangerous 如未管理:
- **过充** > 4.2V/cell → 短路 / 起火
- **过放** < 2.5V/cell → 永久损伤
- **过流** → 发热熔
- **过温** > 60°C → 热失控
- **不平衡** → 一 cell 早损,整 pack 缩短寿命

→ BMS 必须 monitoring + protection。

---

## 2. BMS 主要功能

```
1. Cell voltage 监测 (每 cell)
2. Pack current 监测
3. Cell temperature 监测
4. SoC (State of Charge) 估
5. SoH (State of Health) 估
6. Cell balancing
7. Protection (过充 / 过放 / 过流 / 过温 / 短路)
8. CAN / SMBus 通信
9. Pre-charge (大电容 inrush 保护)
```

---

## 3. 拓扑 / 架构

### 3.1 Centralized BMS

- 一个 BMS 板控所有 cells
- 简单 / 便宜
- 适合 < 24 cells

### 3.2 Distributed BMS

- 每 module 一个 slave BMS
- Master 通过 CAN / isoSPI 通信
- 适合大 EV (Tesla, BMW)

### 3.3 Modular BMS

- 介于两者
- 8-16 cells per BMS module

---

## 4. 关键 IC

- **BQ76952** (TI): 16-cell, 高集成
- **LTC6811** (ADI): 12-cell, isoSPI
- **MAX17841** (Maxim)
- **MCU**: 外加 STM32 / RISC-V 做 algorithm

---

## 5. SoC 估算

### 5.1 Coulomb Counting

$$SoC(t) = SoC_0 - \frac{1}{C_{\max}} \int_0^t I(\tau) d\tau$$

简单但累积误差。

### 5.2 OCV (Open Circuit Voltage)

静置后 OCV ↔ SoC 查表。
缺点:需 hours rest。

### 5.3 Kalman Filter

电池模型 + Kalman → 实时准确 SoC。

### 5.4 ML 方法

LSTM / Transformer + 历史数据 → SoC, SoH。

---

## 6. Cell Balancing

电池 cells 不完全一致;长用 → divergence。

### 6.1 Passive

- 每 cell 上一个 resistor + MOSFET
- 高 cell 经 resistor 放热
- 简便 / 低成本

### 6.2 Active

- 高 cell 能量转给低 cell
- 用 inductor / capacitor 转移
- 高效 (无热损) 但贵

---

## 7. Protection 阈值 (典型 18650 NMC)

| 参数 | 正常 | warning | shutdown |
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
        self.SoC = 1.0  # start full
        self.P = 1.0   # uncertainty
        self.C_max, self.R = C_max, R
    
    def step(self, I_measured, V_measured, dt=1.0, ocv_table=None):
        # Predict
        self.SoC -= I_measured * dt / 3600 / self.C_max
        self.P += 1e-4  # process noise
        # Update via OCV
        ocv_pred = ocv_table(self.SoC) if ocv_table else 3.7
        v_pred = ocv_pred - I_measured * self.R
        K = self.P / (self.P + 0.01)  # Kalman gain
        self.SoC += K * (V_measured - v_pred) / 4.2  # rough scale
        self.P *= (1 - K)
        return self.SoC
```

---

## 9. 通信 (CAN bus 标准)

```
CAN ID    Data
0x100     [pack V high byte, pack V low byte, ...]
0x101     [SoC %, SoH %, fault flags]
0x102     [cell 1 V, cell 2 V, ...]
0x103     [pack current high, low, ...]
```

EV 用 CAN 与 motor controller, vehicle controller 通信。

---

## 10. 安全 / 标准

- **UL 1973**: BESS BMS
- **UN 38.3**: 锂电池 transport
- **ISO 26262**: 汽车 functional safety
- **IEC 62619**: industrial Li-ion

---

## 11. Common Pitfalls

### 11.1 Cell V 测量噪声

mV 级误差影响 balancing 判断;需 careful ADC + filter。

### 11.2 Temperature 不均

Cell 不同位置温度差大;需 multiple thermistors。

### 11.3 SoC drift

Coulomb counting 长期 drift;需 OCV recalibration。

### 11.4 Pre-charge

大电容 inrush > 1000A → 烧 contactor;需 pre-charge resistor。

### 11.5 Communication failure

CAN 断 → BMS 必须 fail-safe (断开 contactor)。

---

## 12. Related Concepts

- **同节**:[电池技术](电池技术.md)、[电源管理电路](电源管理电路.md)、[充电与安全](充电与安全.md)
- **通信**:[CAN 总线](../08_Communication_Networks/CAN总线.md)
- **MCU**:[ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.md)

---

## References

1. **Plett, G. L.** *Battery Management Systems Volume 1 & 2*. Artech, 2015-2016.
2. **Andrea, D.** *Battery Management Systems for Large Lithium-Ion Battery Packs*. Artech, 2010.
3. **TI BQ76952 datasheet**.
4. **Lu, L. et al.** "A review on the key issues for lithium-ion battery management." *J Power Sources*, 2013.
