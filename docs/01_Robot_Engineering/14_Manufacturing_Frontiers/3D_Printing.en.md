# 3D Printing / Additive Manufacturing

> *3D printing / additive manufacturing (AM) has revolutionized prototyping + small-batch production since 1986 (Hull SLA). FDM / SLA / SLS / SLM / Binder jet each suit different needs. Used widely in robotics / aerospace / medical.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Materials Science](../00_Foundations/Materials_Science.en.md), [CAD Tools](../04_Mechanical_Engineering/CAD工具.en.md)

---

## 1. Main Processes

### 1.1 FDM (Fused Deposition Modeling)

- Thermoplastic filament extrusion (PLA, ABS, PETG, PEEK)
- $200 - $5k desktop machines
- Accuracy ~0.1-0.5 mm
- Apps: prototype, hobby, mounting brackets

### 1.2 SLA (Stereolithography)

- UV light cures liquid resin
- High accuracy ~0.05 mm
- $300 - $50k
- Apps: models, jewelry, dental

### 1.3 SLS (Selective Laser Sintering)

- Laser sinters powder (nylon, TPU)
- No supports needed (powder self-supporting)
- Industrial-grade, $50k+
- Apps: functional parts, low-volume production

### 1.4 SLM / DMLS

- Laser melts metal powder (Al, Ti, steel, Inconel)
- Very expensive ($500k+)
- Apps: aerospace (SpaceX engines), medical implants
- Post-processing: HIP + machining

### 1.5 Binder Jetting

- Glue dropped on powder
- Metal + ceramic
- HP Multi Jet Fusion
- Fast but needs sintering

### 1.6 EBM (Electron Beam Melting)

- Vacuum + electron beam melts metal powder
- Arcam (GE) mainstream
- Titanium implants

### 1.7 DLP

- Like SLA but uses DLP projector
- Each layer one exposure, fast

---

## 2. Engineering Parameters

- **Layer height**: 0.05 - 0.3 mm
- **Infill density**: 0-100%
- **Print speed**: 30-150 mm/s (FDM)
- **Wall thickness**: 1-3 mm typical
- **Print temperature**: material-specific

---

## 3. Design Principles (DfAM)

- **Self-supporting angles** (< 45° need no support)
- **Hollow + infill** to save weight
- **Lattice structures** (topology optimization)
- **Avoid sharp internal corners** (stress concentration)
- **Print orientation** affects strength

---

## 4. Post-processing

- Support removal
- Sanding / polishing
- Annealing (FDM PEEK)
- Painting / coating
- Machining (CNC final tolerance)
- Heat treatment (SLM metal)

---

## 5. Software Stack

- **CAD**: Fusion 360, SolidWorks, Onshape
- **Slicer**: Cura, PrusaSlicer, Simplify3D
- **Topology optimization**: Altair OptiStruct, nTopology

---

## 6. Classic Cases

- **GE LEAP engine fuel nozzles** (Co-Cr SLM, 20 parts → 1)
- **SpaceX Raptor engine** (Inconel SLM)
- **Local Motors Strati car** (FDM large-scale)
- **Adidas Futurecraft 4D** (DLP midsole)
- **Boeing 787 parts**
- **Dental implants** (Ti SLM)

---

## 7. Economics

- 1-100 parts: AM economical
- 100+ parts: traditional (injection molding) usually cheaper
- Complex geometry: AM advantage (traditional can't make)
- Long lead time: AM on-site reduces inventory

---

## 8. Python — G-code Generation Concept

```python
def generate_layer_gcode(perimeter, infill_lines, z, feedrate=1500):
    gcode = [f"G1 Z{z:.2f} F1000"]
    for x, y in perimeter:
        gcode.append(f"G1 X{x:.3f} Y{y:.3f} F{feedrate} E1")
    for (x1, y1), (x2, y2) in infill_lines:
        gcode.append(f"G0 X{x1:.3f} Y{y1:.3f}")
        gcode.append(f"G1 X{x2:.3f} Y{y2:.3f} F{feedrate} E1")
    return "\n".join(gcode)
```

---

## 9. Common Pitfalls

### 9.1 Warping (FDM ABS)

First layer cools too fast → warps. Need heated bed + enclosure.

### 9.2 Layer Adhesion

Inter-layer weaker — Z direction 30-50% weaker than XY. Print orientation matters.

### 9.3 Overhangs Without Support

> 45° overhang needs support.

### 9.4 Stringing

Plastic stringy after extrusion — adjust retraction settings.

### 9.5 Powder Safety

SLM Al/Ti powders flammable / explosive, need specialized facility.

---

## 10. Related Concepts

- **Materials**: [Materials Science](../00_Foundations/Materials_Science.en.md)
- **Design**: [CAD Tools](../04_Mechanical_Engineering/CAD工具.en.md)

---

## References

1. **Gibson, I. et al.** *Additive Manufacturing Technologies*. 3rd ed., Springer, 2021.
2. **Wohlers Report** — annual AM industry analysis.
3. **ASTM F2792** — terminology standard for AM.
4. **All3DP, 3D Printing Industry** — news sources.
