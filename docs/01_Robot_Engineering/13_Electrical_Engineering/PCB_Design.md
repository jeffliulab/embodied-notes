# PCB 设计 (Printed Circuit Board)

> *PCB 是电子产品的"骨架",从单层到 32+ 层、blind/buried via、HDI 微孔。机器人 / IoT 产品 PCB 设计涉:schematic、layout、routing、ground plane、impedance control、DRC、DFM。KiCad (开源)、Altium (商业)、Eagle、Cadence Allegro 主流。是 EE 工程师核心技能。*
>
> **难度**:Intermediate
> **前置知识**:基础电路、[Op_Amp](Op_Amp.md)

---

## 1. PCB 制造工艺

```
FR-4 基板(玻璃纤维 + 环氧树脂)
   ↓
铜箔层压
   ↓
钻孔 (drilled / laser)
   ↓
图案化(光刻 + 蚀刻)
   ↓
镀通孔 PTH (plated-through hole)
   ↓
阻焊层 (solder mask)
   ↓
丝印 (silkscreen)
   ↓
表面处理(HASL / ENIG / OSP)
```

---

## 2. 层数

| 层数 | 用 |
|---|---|
| 1 layer | LED、玩具 |
| 2 layers | Arduino、消费 |
| 4 layers | 多数嵌入式 |
| 6-8 layers | 复杂 SoM、手机 |
| 12-32 layers | 服务器主板、HPC |

每层 ~ 35 μm / 1 oz 铜厚。

---

## 3. 关键设计步骤

### 3.1 Schematic

- 元件 + 网络连接
- ERC (Electrical Rule Check) 通过
- BOM 生成

### 3.2 Footprint Assignment

- 每元件 PCB 封装(0402、QFN、BGA)
- IPC-7351 标准

### 3.3 Layout

- 元件放置(机械约束 + 信号流)
- Power vs signal separation
- 散热考虑

### 3.4 Routing

- Auto-routing 仅 starting point
- Manual routing 信号 + 电源
- Length matching(差分对、bus)
- Impedance control(高速)

### 3.5 DRC + DFM

- Design Rule Check
- Design for Manufacturing(厂能不能做)

### 3.6 Output

- Gerber + Excellon drill
- Pick & place file
- 给 PCB 厂打样

---

## 4. Via 类型

| 类型 | 说明 |
|---|---|
| Through-hole | 全板 |
| Blind via | 表层 → 内层 |
| Buried via | 内层 → 内层 |
| Micro via (HDI) | < 0.15 mm,laser |

---

## 5. Trace 设计

- **Width**: 由 current + temperature rise(IPC-2152)
- **Spacing**: 短路 + crosstalk
- **Length matching**: 高速 (DDR、PCIe)
- **Differential pair**: 100 Ω LVDS、85 Ω USB

---

## 6. Ground Plane

- Solid ground 比 grid 好(EMI)
- 多 GND via 减 impedance
- Mixed-signal: split analog/digital ground,single point

---

## 7. 高速信号

- **Impedance control**: 50 Ω single-ended, 100 Ω differential
- **TDR** (Time Domain Reflectometry) 验证
- **Stackup** 必精确(prepreg、core 厚度)
- **Length matching** ± 5 mil 内
- DDR、PCIe、USB3、HDMI 严格

---

## 8. 散热

- Heatsink、thermal via
- Copper pour
- Power 元件 thermal pad
- 焊接 reflow thermal profile

---

## 9. Python — Trace Width Calculator (IPC-2152)

```python
def trace_width_external(I, dT=10, t_oz=1):
    """IPC-2152 external trace width (mils) for given current.
    I: ampere, dT: temperature rise (°C), t_oz: copper oz.
    """
    k = 0.048
    b = 0.44
    c = 0.725
    Area = (I / (k * dT**b)) ** (1/c)  # mils²
    t_mil = t_oz * 1.378
    W = Area / t_mil
    return W  # mils
```

---

## 10. 工具

| 工具 | License | 强项 |
|---|---|---|
| KiCad | 开源 | 入门、Linux |
| Altium Designer | 商业 | 工业标准 |
| Eagle (Fusion 360 Electronics) | Autodesk | 中阶 |
| Cadence Allegro | 商业(贵) | 高端 |
| EasyEDA | 网页,JLCPCB 集成 | 快速打样 |
| OrCAD | 商业 | 老牌 |

---

## 11. 常见问题

### 11.1 90° 拐角

旧规则,实际无害(low frequency);但视觉怪 + manufacturing。

### 11.2 GND plane 切断

切 plane → return current 绕路 → EMI 大涨。

### 11.3 Power 端 cap

每 IC 必 100 nF + 10 μF 近 pin。

### 11.4 Auto-routing 万能

复杂板 auto-route 出 garbage;manual 必要。

### 11.5 Stackup 假设

不查 PCB 厂 stackup → impedance 错。

---

## 12. Related Concepts

- **同节**:[Op_Amp](Op_Amp.md)、[Power_Electronics](Power_Electronics.md)
- **嵌入式**:[ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.md)

---

## References

1. **IPC** *IPC-2221 Generic Standard on Printed Board Design*. 2012.
2. **IPC** *IPC-2152 Standard for Determining Current Carrying Capacity*. 2009.
3. **Bogatin, E.** *Signal and Power Integrity — Simplified*. 3rd ed., 2017.
4. **Johnson, H. & Graham, M.** *High-Speed Digital Design*. 1993.
