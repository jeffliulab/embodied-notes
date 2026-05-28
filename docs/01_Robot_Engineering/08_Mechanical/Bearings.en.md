# Bearings — Core of Rotational / Linear Motion

> *Bearings enable rotational or linear motion with low friction. From industrial machinery, automotive, robot joints to precision instruments — ubiquitous. SKF, NSK, NTN, FAG are major vendors. This article covers types, selection, life calculation.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Materials Science](../00_Foundations/Materials_Science.en.md), [CAD Tools](CAD工具.en.md)

---

## 1. Bearing Classification

### 1.1 By Motion Type

- **Rolling bearings**: ball, roller — most common
- **Plain bearings**: bushing, journal — simple, cheap
- **Magnetic bearings**: no contact, high-speed + vacuum
- **Linear bearings**: linear motion

### 1.2 By Load Direction

- **Radial**: perpendicular to shaft
- **Thrust**: along shaft
- **Combined**

---

## 2. Rolling Bearing Types

### 2.1 Deep Groove Ball Bearing

- Most common, radial + small thrust
- High speed OK
- Example: 608 (8mm × 22mm × 7mm, common in skateboard wheels)

### 2.2 Angular Contact Ball

- Large thrust load
- For spindles, high precision

### 2.3 Cylindrical Roller

- Large radial load
- Cannot handle axial load
- For industrial equipment

### 2.4 Tapered Roller

- Large radial + thrust combined
- For automotive wheel hub

### 2.5 Spherical Roller

- Self-aligning (compensates misalignment)
- Heavy industrial

### 2.6 Needle Roller

- Small size, large radial
- For transmissions, motors

---

## 3. Bearing Parameters

- **Bore** (inner diameter): fits shaft
- **OD** (outer diameter)
- **Width**
- **Dynamic load rating (C)**: rated life 1M revolutions
- **Static load rating (C₀)**: static load
- **RPM rating**

ISO standard: 608 → 6 (deep groove) 0 (light series) 8 (8mm bore).

---

## 4. Life Calculation

L10 (90% probability life, million revolutions):

$$L_{10} = \left(\frac{C}{P}\right)^p$$

- $C$: dynamic load rating
- $P$: equivalent load
- $p$: 3 for ball, 10/3 for roller

Example: Bearing C = 10 kN, P = 2 kN → L10 = 125M revolutions.

---

## 5. Lubrication

- **Grease**: common, periodic refill
- **Oil**: high-speed / high-temp
- **Sealed bearings**: internal pre-greased, maintenance-free
- **Dry**: vacuum / high-temp special

---

## 6. Installation

- **Press fit**: inner/outer race tight fit
- **Clearance fit**: easy assembly
- **Lock nut + lock washer**: thrust fix
- Wrong installation → early failure (main fail mode)

---

## 7. PyTorch / Python — Life Estimation

```python
def bearing_l10_life(C, P, bearing_type='ball'):
    p = 3 if bearing_type == 'ball' else 10/3
    L10_million_rev = (C / P) ** p
    return L10_million_rev * 1e6

def hours_at_rpm(L10_rev, rpm):
    return L10_rev / (rpm * 60)

L = bearing_l10_life(C=10000, P=2000)
print(f"L10 = {L:.1e} revolutions")
print(f"At 1000 RPM: {hours_at_rpm(L, 1000):.0f} hours")
```

---

## 8. Failure Modes

- **Fatigue spalling**: race spalling (normal end-of-life)
- **Wear**: contamination, poor lubrication
- **Brinelling**: static pressure marks
- **Corrosion**: water, chemicals
- **Overheating**: high speed / poor lubrication
- **Misalignment**: installation / shaft bend
- **Electrical erosion**: VFD current through bearing → pitting

---

## 9. Application Selection

| Application | Bearing Type |
|---|---|
| Bicycle hub | Deep groove ball |
| Automotive wheel | Tapered roller |
| Motor spindle | Angular contact |
| Wind turbine main shaft | Spherical roller (huge) |
| Robot joint | Cross roller / harmonic |
| HDD spindle | Fluid dynamic |
| Rocket turbopump | Special hybrid |

---

## 10. Modern Variants

- **Hybrid bearings** (ceramic balls + steel rings): high-speed, low friction
- **Magnetic bearings**: zero contact (Tesla turbopump, flywheel)
- **Air bearings**: ultra-precision, semiconductor wafer stage
- **Foil bearings**: high-speed turbo

---

## 11. Common Pitfalls

### 11.1 Over-greasing

Too much grease → friction + heat; usually 1/3-1/2 cavity sufficient.

### 11.2 Wrong Tolerance

Wrong shaft / housing tolerance → internal stress → early failure.

### 11.3 Mixing Greases

Different grease incompatible → chemical reaction → failure.

### 11.4 Storage

> 5 year storage → grease dries / oxidizes → unusable.

### 11.5 RPM Rating Violation

Exceeding rated RPM → heat + lubrication breakdown.

---

## 12. Related Concepts

- **Same section**: [Chassis & Motion Mechanisms](底盘与运动机构.en.md), [3D Printing & Machining](3D打印与加工.en.md)
- **Applications**: [Brushless Motor & FOC](../06_Actuators_Motors/无刷电机与FOC.en.md), [Reducer](../06_Actuators_Motors/减速器.en.md)

---

## References

1. **Harris, T. A.** *Rolling Bearing Analysis*. 5th ed., 2007.
2. **SKF** General Catalog.
3. **ISO 281** — Rolling bearings, dynamic load ratings and rating life.
4. **NSK / NTN / FAG** technical handbooks.
