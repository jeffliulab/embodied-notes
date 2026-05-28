# CNC (Computer Numerical Control) — 数控加工

> *CNC 用计算机控制机床精密切削金属 / 塑料 / 木材。3-5 轴 mill / lathe / router / EDM 是工业基础。从 1950s 起发展,今天与 3D 打印共同构成 modern manufacturing。*
>
> **难度**:Intermediate
> **前置知识**:[CAD 工具](../04_Mechanical_Engineering/CAD工具.md)、[材料科学](../00_Foundations/Materials_Science.md)

---

## 1. CNC 类型

### 1.1 Milling (铣床)

- 旋转刀切削固定 workpiece
- 3-axis (XYZ) / 5-axis (+ AB rotate)
- Verticle vs horizontal
- 用:几乎所有金属机械 part

### 1.2 Turning / Lathe (车床)

- 旋转 workpiece + 固定刀
- 适合 cylindrical parts (轴, bushing, screw)

### 1.3 Router

- 类似 mill 但更大 + 木材 / 复合材料
- 家具, 复合材料 part

### 1.4 EDM (Electrical Discharge Machining)

- 电火花腐蚀金属
- 极硬金属 (碳化钨) 加工
- 0.001 mm 精度

### 1.5 Laser Cutter

- CO2 激光 cut 板材
- < 25 mm steel / 50 mm wood

### 1.6 Waterjet

- 高压水 + 砂 cut
- 不发热 (适合复合材料)

---

## 2. G-Code

CNC 控制语言:

```gcode
G0 X10 Y20        ; rapid move
G1 X30 Y40 F500   ; linear feed at 500 mm/min
G2 X50 Y60 R20    ; clockwise arc
G3 X70 Y80 I10 J5 ; counter-clockwise arc
M3 S5000          ; spindle on, 5000 RPM
M5                ; spindle off
M30               ; end program
```

主流 controller:Fanuc, Siemens, Haas, Mach3, LinuxCNC, GRBL (DIY)。

---

## 3. CAM (Computer-Aided Manufacturing)

CAD → CAM → G-code:
- **Fusion 360 CAM** (Autodesk)
- **Mastercam** (industrial)
- **SolidCAM**
- **FreeCAD CAM** (free)
- **Carbide Create** (Shapeoko)

CAM 设置:
- Tool 选择 (end mill, ball, drill, ...)
- Speeds & feeds (RPM, mm/min)
- Stepover, stepdown
- Toolpath strategy (raster, contour, adaptive)

---

## 4. 关键参数

- **Spindle RPM**: 1000-30000 (高速 small tool)
- **Feed rate**: mm/min
- **DOC** (Depth of Cut): mm
- **WOC** (Width of Cut): mm
- **Stepover**: % of tool diameter
- **Coolant**: flood / mist / air

材料-tool 表决定参数 (e.g., Al 6061 + 1/4" carbide endmill: 18000 RPM, 800 mm/min)。

---

## 5. 5-Axis CNC

```
XYZ 3 平动 + A (绕 X) + B (绕 Y) 或 C (绕 Z)
```

优势:
- 复杂 surface (impeller, blade)
- 减 setup 次数
- 一刀过的 undercut

缺点:
- 极贵 ($200k+)
- 编程复杂 (需 5-axis CAM)
- 易碰撞 (collision check 必)

---

## 6. 精度 / 公差

- 入门 CNC: ± 0.05 mm
- 工业: ± 0.005 mm
- 精密 (Mori Seiki, DMG): ± 0.001 mm
- 半导体 (lithography stage): ± 1 nm (非传统 CNC)

---

## 7. PyTorch / Python — G-code 生成

```python
def generate_pocket_gcode(center, size, depth, tool_dia=3, stepdown=0.5, feed=500):
    """简单 rectangle pocket toolpath."""
    cx, cy = center
    w, h = size
    gcode = ["G21 G90", "G0 Z5"]  # mm, absolute, safe Z
    z = 0
    while z > -depth:
        z = max(z - stepdown, -depth)
        gcode.append(f"G0 X{cx - w/2 + tool_dia/2} Y{cy - h/2 + tool_dia/2}")
        gcode.append(f"G1 Z{z} F{feed/2}")
        # Spiral inward
        offset = tool_dia / 2
        while offset < w/2 and offset < h/2:
            gcode.append(f"G1 X{cx + w/2 - offset} Y{cy - h/2 + offset} F{feed}")
            gcode.append(f"G1 X{cx + w/2 - offset} Y{cy + h/2 - offset} F{feed}")
            gcode.append(f"G1 X{cx - w/2 + offset} Y{cy + h/2 - offset} F{feed}")
            gcode.append(f"G1 X{cx - w/2 + offset} Y{cy - h/2 + offset} F{feed}")
            offset += tool_dia * 0.5
    gcode.append("G0 Z5")
    gcode.append("M30")
    return "\n".join(gcode)
```

---

## 8. 工业 vs DIY

| 维度 | 工业 (Haas, Mori Seiki) | DIY (Shapeoko, X-Carve) |
|---|---|---|
| 价格 | $30k-300k | $1k-5k |
| 精度 | μm级 | 0.1-0.5 mm |
| 刚度 | 高 (鑄铁机身) | 中 (Al extrusion) |
| 主轴 | 10-30 kW | 0.5-2 kW |
| 自动换刀 | ✓ | ❌ |
| 编程 | Mastercam / NX | Fusion 360 |

---

## 9. 与 3D 打印对比

| 维度 | CNC | 3D 打印 |
|---|---|---|
| 加工方向 | 减材 (subtractive) | 增材 (additive) |
| 材料 | 几乎全 | 限 (主 plastic / 金属) |
| 精度 | μm-mm | mm |
| 速度 | 快 (除复杂) | 慢 (大件 hours) |
| Waste | 多 (chips) | 少 |
| 复杂 geometry | 难 (overhang) | 易 |
| 经济 | 大批量 | 小批量 |

通常 hybrid 用 (3D print 复杂部分 + CNC 精度 finish)。

---

## 10. Common Pitfalls

### 10.1 Tool 碰撞

未设 collision check → tool broken / 机床损。Always simulate first。

### 10.2 Feed / speed 错

太快 → broken tool;太慢 → burnishing, 不切削。

### 10.3 Workholding

工件松 → 飞出。Vice / clamp / fixture 牢靠。

### 10.4 Cool / chip 管理

无 coolant → tool burn;chip 堆积 → tool break。

### 10.5 Backlash

廉价 CNC ball screw backlash → 精度差。

---

## 11. Related Concepts

- **CAD**:[CAD 工具](../04_Mechanical_Engineering/CAD工具.md)
- **材料**:[Materials Science](../00_Foundations/Materials_Science.md)

---

## References

1. **Smid, P.** *CNC Programming Handbook*. 3rd ed., Industrial Press, 2007.
2. **Childs, T. et al.** *Metal Machining: Theory and Applications*. 2000.
3. **Fanuc, Haas, Siemens** CNC controller manuals.
4. **Mastercam, Fusion 360 CAM** documentation.
