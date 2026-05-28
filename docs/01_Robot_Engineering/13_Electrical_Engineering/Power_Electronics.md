# 电力电子 (Power Electronics)

> *电力电子用 semiconductor switch 处理 power conversion — AC/DC, DC/DC, DC/AC, AC/AC。从手机充电器 (5W) 到 EV inverter (100kW+) 到电网 HVDC (GW)。MOSFET / IGBT / GaN / SiC 是核心 switch。*
>
> **难度**:Intermediate-Advanced
> **前置知识**:[Op-Amp](Op_Amp.md)、电磁基础

---

## 1. 功率半导体

- **MOSFET**: < 600V, < 100A, MHz switching → 小功率
- **IGBT**: 600V-6500V, 高电流, 5-50 kHz → 中功率
- **GaN HEMT**: < 650V, MHz+ → 高效充电器, 5G
- **SiC MOSFET**: 650V-3300V, 50 kHz+ → EV inverter (Tesla model 3 用)
- **Thyristor / SCR**: 极大电流 (kA), 低 freq → 工业 / 电网

---

## 2. 基本拓扑

### 2.1 Buck Converter (降压)

```
   V_in
    |
   [S]──┬──[L]──→ V_out (< V_in)
        │
        [D] (或 sync MOSFET)
        │
       GND
```

$$V_{out} = D \cdot V_{in}$$

D = duty cycle (0-1)。

### 2.2 Boost (升压)

升压。$V_{out} = V_{in} / (1 - D)$。

### 2.3 Buck-Boost

升降均可。

### 2.4 Flyback

隔离 → 用 transformer。手机充电器。

### 2.5 Half-Bridge / Full-Bridge

DC → AC,用于 inverter, motor drive, 大功率。

---

## 3. PWM 控制

```
      ┌──┐  ┌──┐
______│  │__│  │___  PWM signal (duty cycle controlled)
```

- Frequency: 10 kHz - 1 MHz
- 调 duty → 调 output

Control loop:用 op-amp / MCU 调 duty 维持目标 voltage。

---

## 4. 经典芯片

- **LM2596**: simple buck, $1, 3A
- **LM2675**: Buck, sync rectifier
- **TPS54xxx** (TI): high efficiency
- **LT8XXX** (Linear): 各种拓扑
- **UCC25xxx** (TI): resonant LLC
- **MP1584**: 600 kHz, 3A buck

---

## 5. 应用 / 数字

| 应用 | Topology | 功率 | 电压 |
|---|---|---|---|
| 手机充电器 (USB-C PD) | Flyback / LLC | 5-100W | 5-20V |
| 笔记本 brick | LLC + sync rect | 30-100W | 19V |
| EV onboard charger | LLC / PFC | 3-22 kW | 200-800V |
| EV inverter (motor) | 3-phase full-bridge | 100-300 kW | 400-800V |
| Solar inverter | Boost + bridge | 1-100 kW | 200-1500V |
| HVDC grid | Modular Multilevel | GW | 100s kV |
| 数据中心 PSU | Interleaved + LLC | 1-3 kW | 12V (rack) |

---

## 6. PyTorch / Python — Buck Converter Simulation

```python
import numpy as np

def buck_sim(V_in=12, V_target=5, L=10e-6, C=100e-6, R_load=1, f_sw=100e3, t_end=1e-3, dt=1e-7):
    """Average model buck converter."""
    V_out = 0
    I_L = 0
    history = []
    for t in np.arange(0, t_end, dt):
        # Simple PI control on duty
        error = V_target - V_out
        D = max(0.05, min(0.95, V_target / V_in + 0.01 * error))
        # State update (continuous-time avg)
        dV = (I_L - V_out / R_load) / C
        dI = (D * V_in - V_out) / L
        V_out += dV * dt
        I_L += dI * dt
        history.append((t, V_out, I_L, D))
    return history
```

---

## 7. Efficiency / 损耗

- **Conduction loss**: $I^2 R_{ds(on)}$ in MOSFET
- **Switching loss**: $\propto f_{sw} \cdot V \cdot I$ 转换瞬间
- **Magnetic loss**: core + copper
- **Capacitor ESR loss**

90% 效率 = 良好;95%+ = 优秀;99%+ = 极致 (LLC + GaN)。

---

## 8. EMI / EMC

PWM switching → 高 frequency EMI:
- 输入 / 输出 LC 滤波
- Shielding
- Common-mode choke
- 仔细 PCB layout (loop area 小)
- 符合 EN 55022, FCC 等标准

---

## 9. 安全

- 高 voltage isolation (transformer)
- Thermal management (heat sink)
- OVP / OCP (过压 / 过流保护)
- Soft-start (限 inrush)

---

## 10. Common Pitfalls

### 10.1 选错 inductor

电感 saturation → MOSFET 烧。仔细计算 ripple current。

### 10.2 输出电容 ESR

ESR 高 → 输出 ripple 大。用 ceramic + electrolytic 并联。

### 10.3 EMC 不过

PCB layout 差 → 试 50+ 次 才合规。

### 10.4 散热

100W 5% 损 = 5W 发热。必有 heat sink。

### 10.5 反并联 diode

MOSFET 不带 → 需外接 Schottky for 续流。

---

## 11. Related Concepts

- **同节**:[Op-Amp](Op_Amp.md)、[ADC / DAC](ADC_DAC.md)
- **应用**:[电池技术](../07_Power_Energy/电池技术.md)、[电源管理电路](../07_Power_Energy/电源管理电路.md)

---

## References

1. **Erickson, R. W. & Maksimovic, D.** *Fundamentals of Power Electronics*. 3rd ed., 2020.
2. **Rashid, M. H.** *Power Electronics: Devices, Circuits, and Applications*. 4th ed., 2014.
3. TI / Infineon / ON Semi power electronics application notes.
