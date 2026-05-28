# 3D 打印 / Additive Manufacturing

> *3D 打印 / 增材制造 (AM) 自 1986 (Hull SLA) 以来革命性改变 prototyping + 小批量制造。FDM / SLA / SLS / SLM / Binder jet 各自适用。机器人 / 航天 / 医疗都广泛使用。*
>
> **难度**:Intermediate
> **前置知识**:[Materials Science](../00_Foundations/Materials_Science.md)、[CAD 工具](../04_Mechanical_Engineering/CAD工具.md)

---

## 1. 主要工艺

### 1.1 FDM (Fused Deposition Modeling)

- 热塑丝挤出 (PLA, ABS, PETG, PEEK)
- $200 - $5k 桌面机
- 精度 ~ 0.1-0.5 mm
- 应用:prototype, hobby, mounting brackets

### 1.2 SLA (Stereolithography)

- 紫外光固化液态树脂
- 精度极高 ~ 0.05 mm
- $300 - $50k
- 应用:模型, jewelry, dental

### 1.3 SLS (Selective Laser Sintering)

- 激光 sinter 粉末 (nylon, TPU)
- 无 support 需 (粉末 self-supporting)
- 工业级,$50k+
- 应用:functional parts, low-volume production

### 1.4 SLM / DMLS (Direct Metal Laser Sintering)

- 激光 melt 金属粉末 (Al, Ti, steel, Inconel)
- 极贵 ($500k+)
- 应用:航天 (SpaceX engine), 医疗 implant
- 后处理需 HIP (Hot Isostatic Pressing) + machining

### 1.5 Binder Jetting

- 喷胶水固定粉末
- 适合金属 + 陶瓷
- HP Multi Jet Fusion
- 快但需 sintering 后处理

### 1.6 EBM (Electron Beam Melting)

- 真空中电子束 melt 金属粉
- Arcam (GE) 主流
- 钛 implant

### 1.7 DLP (Digital Light Processing)

- 类 SLA 但用 DLP projector
- 每层 一次曝光,快

---

## 2. 工程参数

- **Layer height**: 0.05 - 0.3 mm
- **Infill density**: 0-100%
- **Print speed**: 30-150 mm/s (FDM)
- **Wall thickness**: 1-3 mm typical
- **Print temperature**: material-specific

---

## 3. 设计原则 (DfAM)

- **Self-supporting angles** (< 45° 不需 support)
- **Hollow + infill** 减重
- **Lattice structure** (topology optimization)
- **Avoid sharp internal corners** (stress concentration)
- **Print orientation** affects strength

---

## 4. 后处理

- Support removal
- Sanding / polishing
- Annealing (FDM PEEK 等)
- Painting / coating
- Machining (CNC final tolerance)
- Heat treatment (SLM metal)

---

## 5. 软件 stack

- **CAD**: Fusion 360, SolidWorks, Onshape
- **Slicer**: Cura, PrusaSlicer, Simplify3D
- **Topology optimization**: Altair OptiStruct, nTopology
- **G-code editor**: vim ;-)

---

## 6. 经典案例

- **GE LEAP engine fuel nozzles** (Co-Cr SLM,原 20 件合 1)
- **SpaceX Raptor engine** (Inconel SLM)
- **Local Motors Strati car** (FDM 大尺度)
- **Adidas Futurecraft 4D** (DLP midsole)
- **Boeing 787 parts** (numerous)
- **Dental implants** (Ti SLM)

---

## 7. 经济性

- 1-100 件:AM 经济
- 100+ 件:传统 (injection molding) 通常更便宜
- 复杂 geometry:AM 优势 (传统不可制造)
- 长 lead time 部件:AM 现场打印减库存

---

## 8. PyTorch / Python — G-code generation 概念

```python
def generate_layer_gcode(perimeter, infill_lines, z, feedrate=1500):
    """Generate G-code for one layer."""
    gcode = [f"G1 Z{z:.2f} F1000"]  # raise Z
    # Perimeter
    for x, y in perimeter:
        gcode.append(f"G1 X{x:.3f} Y{y:.3f} F{feedrate} E1")
    # Infill
    for (x1, y1), (x2, y2) in infill_lines:
        gcode.append(f"G0 X{x1:.3f} Y{y1:.3f}")
        gcode.append(f"G1 X{x2:.3f} Y{y2:.3f} F{feedrate} E1")
    return "\n".join(gcode)
```

---

## 9. Common Pitfalls

### 9.1 Warping (FDM ABS)

第一层冷却太快 → 翘起。需 heated bed + enclosure。

### 9.2 Layer adhesion

层间弱 — Z 方向比 XY 弱 30-50%。Print orientation 重要。

### 9.3 Overhangs without support

> 45° overhang 需 support。

### 9.4 Stringing

挤出后塑料拉丝 — retraction settings 调。

### 9.5 Powder safety

SLM Al/Ti 粉末易燃易爆,需 specialized facility。

---

## 10. Related Concepts

- **材料**:[Materials Science](../00_Foundations/Materials_Science.md)
- **设计**:[CAD 工具](../04_Mechanical_Engineering/CAD工具.md)

---

## References

1. **Gibson, I. et al.** *Additive Manufacturing Technologies*. 3rd ed., Springer, 2021.
2. **Wohlers Report** — annual AM industry analysis.
3. **ASTM F2792** — terminology standard for AM.
4. **All3DP, 3D Printing Industry** — news sources.
