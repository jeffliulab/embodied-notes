# PCB Design

> *PCB is the skeleton of electronics, from 1-layer to 32+ layers, blind/buried via, HDI microvias. Robot / IoT PCB design covers: schematic, layout, routing, ground plane, impedance control, DRC, DFM. KiCad (open), Altium (commercial), Eagle, Cadence Allegro are mainstream. Core EE skill.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: Basic circuits, [Op_Amp](Op_Amp.en.md)

---

## 1. PCB Manufacturing Process

```
FR-4 substrate (fiberglass + epoxy)
   ↓
Copper lamination
   ↓
Drilling (mechanical / laser)
   ↓
Patterning (lithography + etching)
   ↓
PTH (plated-through hole)
   ↓
Solder mask
   ↓
Silkscreen
   ↓
Surface finish (HASL / ENIG / OSP)
```

---

## 2. Layer Count

| Layers | Use |
|---|---|
| 1 layer | LED, toys |
| 2 layers | Arduino, consumer |
| 4 layers | Most embedded |
| 6-8 layers | Complex SoM, phones |
| 12-32 layers | Server motherboards, HPC |

Each layer ~ 35 μm / 1 oz copper.

---

## 3. Key Steps

### 3.1 Schematic

- Components + nets
- ERC (Electrical Rule Check) pass
- BOM generated

### 3.2 Footprint Assignment

- PCB footprint per component (0402, QFN, BGA)
- IPC-7351 standard

### 3.3 Layout

- Component placement (mechanical + signal flow)
- Power vs signal separation
- Thermal considerations

### 3.4 Routing

- Auto-routing is starting point only
- Manual routing for signal + power
- Length matching (differential pairs, bus)
- Impedance control (high speed)

### 3.5 DRC + DFM

- Design Rule Check
- Design for Manufacturing (can the fab build it?)

### 3.6 Output

- Gerber + Excellon drill
- Pick & place file
- Send to PCB fab

---

## 4. Via Types

| Type | Description |
|---|---|
| Through-hole | Full board |
| Blind via | Surface → inner |
| Buried via | Inner → inner |
| Micro via (HDI) | < 0.15 mm, laser |

---

## 5. Trace Design

- **Width**: based on current + temperature rise (IPC-2152)
- **Spacing**: shorts + crosstalk
- **Length matching**: high-speed (DDR, PCIe)
- **Differential pair**: 100 Ω LVDS, 85 Ω USB

---

## 6. Ground Plane

- Solid ground > grid (EMI)
- Multiple GND vias to reduce impedance
- Mixed-signal: split analog/digital ground, single-point connection

---

## 7. High-Speed Signals

- **Impedance control**: 50 Ω single-ended, 100 Ω differential
- **TDR** (Time Domain Reflectometry) for verification
- **Stackup** must be precise (prepreg, core thickness)
- **Length matching** within ± 5 mils
- DDR, PCIe, USB3, HDMI strict

---

## 8. Thermal

- Heatsink, thermal via
- Copper pour
- Thermal pad for power components
- Solder reflow thermal profile

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

## 10. Tools

| Tool | License | Strength |
|---|---|---|
| KiCad | Open | Beginners, Linux |
| Altium Designer | Commercial | Industry standard |
| Eagle (Fusion 360 Electronics) | Autodesk | Mid-tier |
| Cadence Allegro | Commercial (pricey) | High-end |
| EasyEDA | Web, JLCPCB integrated | Rapid prototype |
| OrCAD | Commercial | Veteran |

---

## 11. Common Pitfalls

### 11.1 90° Corners

Old rule, actually harmless (low frequency), but ugly + manufacturing.

### 11.2 GND Plane Cuts

Cut plane → return current detours → EMI spike.

### 11.3 Power Pin Caps

Every IC needs 100 nF + 10 μF near pin.

### 11.4 Auto-routing Universal

Complex board auto-route is garbage; manual essential.

### 11.5 Stackup Assumption

Without checking PCB fab stackup → impedance wrong.

---

## 12. Related Concepts

- **Same section**: [Op_Amp](Op_Amp.en.md), [Power_Electronics](Power_Electronics.en.md)
- **Embedded**: [ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.en.md)

---

## References

1. **IPC** *IPC-2221 Generic Standard on Printed Board Design*. 2012.
2. **IPC** *IPC-2152 Standard for Determining Current Carrying Capacity*. 2009.
3. **Bogatin, E.** *Signal and Power Integrity — Simplified*. 3rd ed., 2017.
4. **Johnson, H. & Graham, M.** *High-Speed Digital Design*. 1993.
