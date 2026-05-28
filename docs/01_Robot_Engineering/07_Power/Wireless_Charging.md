# 无线充电 (Wireless Power Transfer)

> *无线充电用电磁场传能,无需 cable。Qi (inductive, < 15 W, 手机)、AirFuel (磁谐振, ~ 50 W)、EV 大功率 (~ 11 kW, SAE J2954)、远距 RF。Tesla 1891 提出,商业化在 2008 (Qi)。机器人 / 医用 implant / EV 重点应用,效率 ~ 70-90%。*
>
> **难度**:Intermediate
> **前置知识**:电磁感应、谐振、Power Electronics

---

## 1. 三大原理

### 1.1 Inductive Coupling (近场)

- 两 coil 紧贴(< 10 mm)
- Faraday 感应
- 高效(~ 90%)
- 短距、小角度容差
- 代表:Qi 手机充

### 1.2 Magnetic Resonance (中场)

- 两 coil + 谐振电容(共振 frequency)
- 距离 cm~m
- Witricity / AirFuel
- 效率 ~ 70-90%
- 容差好(几 cm 偏)

### 1.3 RF / Microwave (远场)

- ~ 微波或激光
- m~km 距
- 效率低(~ 1-10%)
- 卫星 → 地面研究、远距 IoT

---

## 2. Qi 标准

- WPC (Wireless Power Consortium) 2008
- 5W (Qi1.0), 15W (Qi1.2), 15W (Qi2 MagSafe-like)
- 100+ kHz frequency
- 双向通信(Tx ↔ Rx via load modulation)
- 主流手机标配

---

## 3. EV 无线充

- SAE J2954 标准
- 85 kHz frequency
- 3.7 kW (WPT1), 7.7 kW (WPT2), 11 kW (WPT3), 22 kW (WPT4)
- WAVE (Witricity acquired), HEVO 等
- 动态充(road embedded):still demo

---

## 4. 系统组件

```
AC mains
   ↓
PFC + Rectifier (Tx 侧)
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

## 5. 关键参数

- **Coupling coefficient k**: 0-1, geometry 决定
- **Quality factor Q**: $Q = \omega L / R$
- **效率 η**: 与 kQ 直接相关
- **Air gap**: 影响 k
- **频率**: kHz (Qi) ~ MHz (UAV)

---

## 6. 谐振条件

$$\omega_0 = \frac{1}{\sqrt{LC}}$$

Tx + Rx 必 same $\omega_0$,否则效率骤降。
$$Q = \frac{\omega_0 L}{R}$$
high Q → 损耗 low,但 bandwidth 窄。

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

## 8. 应用 — 机器人

- **AGV/AMR**: 停车充(无 connector 磨损)
- **手术机器人**: 床上 implanted 充
- **服务机器人**: 自主回 dock 充
- **水下 ROV**: 防水(水下 connector 失效)
- **植入设备**: 心脏起搏器、cochlear implant

---

## 9. 安全

- **EMC**: 100 kHz 辐射(需 shield)
- **生物影响**: ICNIRP guideline
- **金属物**: foreign object detection(钥匙、coin → 过热)
- **温升**: efficiency 损 = heat

---

## 10. 常见问题

### 10.1 距离 ↑ → 效率 ↓

k 强烈依赖距离;cm 级即明显衰减。

### 10.2 角度 misalignment

Coil 偏 → k 降。

### 10.3 金属物 over heating

Foreign Object Detection (FOD) 必须做。

### 10.4 频率 drift

L、C tolerance → 谐振偏 → 效率掉。

### 10.5 EMC compliance

100 kHz 强场 → CE、FCC 测试。

---

## 11. Related Concepts

- **同节**:[BMS Battery Management](BMS_Battery_Management.md)、Power Electronics
- **电气**:[Power Electronics](../01_Electrical_Engineering/Power_Electronics.md)

---

## References

1. **Kurs, A. et al.** "Wireless power transfer via strongly coupled magnetic resonances." *Science*, 2007.
2. **SAE J2954** *Wireless Power Transfer for Light-Duty Plug-In/Electric Vehicles*. 2020.
3. **Wireless Power Consortium** *Qi Specification v2.0*. 2023.
4. **Hui, S. Y. R., Zhong, W., Lee, C. K.** "A critical review of recent progress in mid-range wireless power transfer." *IEEE Trans Power Electron*, 2014.
