# CNC (Computer Numerical Control)

> *CNC uses computers to precisely cut metal / plastic / wood. 3-5 axis mill / lathe / router / EDM is industrial foundation. Developed since 1950s; today combines with 3D printing to form modern manufacturing.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [CAD Tools](../04_Mechanical_Engineering/CAD工具.en.md), [Materials Science](../00_Foundations/Materials_Science.en.md)

---

## 1. CNC Types

### 1.1 Milling

- Rotating tool cuts fixed workpiece
- 3-axis (XYZ) / 5-axis (+ AB rotate)
- Vertical vs horizontal
- Used: almost all metal machined parts

### 1.2 Turning / Lathe

- Rotating workpiece + fixed tool
- Suited for cylindrical parts (shafts, bushings, screws)

### 1.3 Router

- Like mill but larger + wood / composite
- Furniture, composite parts

### 1.4 EDM (Electrical Discharge Machining)

- Spark erodes metal
- Extreme hard metals (tungsten carbide)
- 0.001 mm precision

### 1.5 Laser Cutter

- CO2 laser cuts sheet metal
- < 25 mm steel / 50 mm wood

### 1.6 Waterjet

- High-pressure water + abrasive cuts
- No heat (suited for composites)

---

## 2. G-Code

CNC control language:

```gcode
G0 X10 Y20        ; rapid move
G1 X30 Y40 F500   ; linear feed at 500 mm/min
G2 X50 Y60 R20    ; clockwise arc
G3 X70 Y80 I10 J5 ; counter-clockwise arc
M3 S5000          ; spindle on, 5000 RPM
M5                ; spindle off
M30               ; end program
```

Mainstream controllers: Fanuc, Siemens, Haas, Mach3, LinuxCNC, GRBL (DIY).

---

## 3. CAM (Computer-Aided Manufacturing)

CAD → CAM → G-code:
- **Fusion 360 CAM** (Autodesk)
- **Mastercam** (industrial)
- **SolidCAM**
- **FreeCAD CAM** (free)
- **Carbide Create** (Shapeoko)

CAM setup:
- Tool selection (end mill, ball, drill, ...)
- Speeds & feeds (RPM, mm/min)
- Stepover, stepdown
- Toolpath strategy (raster, contour, adaptive)

---

## 4. Key Parameters

- **Spindle RPM**: 1000-30000 (high speed small tool)
- **Feed rate**: mm/min
- **DOC** (Depth of Cut): mm
- **WOC** (Width of Cut): mm
- **Stepover**: % of tool diameter
- **Coolant**: flood / mist / air

Material-tool charts determine parameters (e.g., Al 6061 + 1/4" carbide endmill: 18000 RPM, 800 mm/min).

---

## 5. 5-Axis CNC

```
XYZ 3 translation + A (around X) + B (around Y) or C (around Z)
```

Advantages:
- Complex surfaces (impeller, blade)
- Fewer setups
- Single-shot undercuts

Drawbacks:
- Very expensive ($200k+)
- Programming complex (needs 5-axis CAM)
- Easy collisions (collision check mandatory)

---

## 6. Precision / Tolerances

- Entry CNC: ± 0.05 mm
- Industrial: ± 0.005 mm
- Precision (Mori Seiki, DMG): ± 0.001 mm
- Semiconductor (lithography stage): ± 1 nm (non-traditional CNC)

---

## 7. PyTorch / Python — G-code Generation

```python
def generate_pocket_gcode(center, size, depth, tool_dia=3, stepdown=0.5, feed=500):
    cx, cy = center
    w, h = size
    gcode = ["G21 G90", "G0 Z5"]
    z = 0
    while z > -depth:
        z = max(z - stepdown, -depth)
        gcode.append(f"G0 X{cx - w/2 + tool_dia/2} Y{cy - h/2 + tool_dia/2}")
        gcode.append(f"G1 Z{z} F{feed/2}")
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

## 8. Industrial vs DIY

| Aspect | Industrial (Haas, Mori Seiki) | DIY (Shapeoko, X-Carve) |
|---|---|---|
| Price | $30k-300k | $1k-5k |
| Precision | μm level | 0.1-0.5 mm |
| Rigidity | High (cast iron) | Medium (Al extrusion) |
| Spindle | 10-30 kW | 0.5-2 kW |
| Auto tool change | ✓ | ❌ |
| Programming | Mastercam / NX | Fusion 360 |

---

## 9. vs 3D Printing

| Aspect | CNC | 3D Printing |
|---|---|---|
| Direction | Subtractive | Additive |
| Materials | Almost all | Limited (mainly plastic / metal) |
| Precision | μm-mm | mm |
| Speed | Fast (except complex) | Slow (large parts hours) |
| Waste | High (chips) | Low |
| Complex geometry | Hard (overhangs) | Easy |
| Economics | High volume | Low volume |

Often hybrid (3D print complex parts + CNC for precision finish).

---

## 10. Common Pitfalls

### 10.1 Tool Collision

No collision check → broken tool / machine damage. Always simulate first.

### 10.2 Wrong Feed / Speed

Too fast → broken tool; too slow → burnishing, no cutting.

### 10.3 Workholding

Loose workpiece → flies off. Vice / clamp / fixture secure.

### 10.4 Coolant / Chip Management

No coolant → tool burns; chip buildup → tool breaks.

### 10.5 Backlash

Cheap CNC ball screw backlash → precision loss.

---

## 11. Related Concepts

- **CAD**: [CAD Tools](../04_Mechanical_Engineering/CAD工具.en.md)
- **Materials**: [Materials Science](../00_Foundations/Materials_Science.en.md)

---

## References

1. **Smid, P.** *CNC Programming Handbook*. 3rd ed., Industrial Press, 2007.
2. **Childs, T. et al.** *Metal Machining: Theory and Applications*. 2000.
3. **Fanuc, Haas, Siemens** CNC controller manuals.
4. **Mastercam, Fusion 360 CAM** documentation.
