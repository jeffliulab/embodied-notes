# Materials Science — Engineering Foundation

> *Materials determine product performance, cost, reliability. From metals, polymers, ceramics to composites, semiconductors. This article covers material properties + selection from engineering perspective.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: chemistry / physics basics

---

## 1. Four Material Categories

- **Metals**: strong, conductive, ductile (steel, Al, Cu, Ti)
- **Polymers (Plastic)**: light, cheap, insulating (PE, PP, PC, PEEK)
- **Ceramics**: hard, heat-resistant, brittle (Al₂O₃, SiC)
- **Composites**: combine materials (CFRP, GFRP)
- **Semiconductors**: Si, GaN, SiC (electronics)

---

## 2. Key Properties

### 2.1 Mechanical

- **Strength**: yield / ultimate
- **Stiffness**: Young's modulus $E$
- **Hardness**: Vickers / Rockwell
- **Toughness**: energy absorption
- **Fatigue**: cyclic loading life

### 2.2 Electrical

- **Conductivity** σ (S/m)
- **Permittivity** ε
- **Breakdown voltage**

### 2.3 Thermal

- **Conductivity** $k$ (W/m·K)
- **Expansion coefficient** α (1/K)
- **Melting point / service temperature**

### 2.4 Chemical

- Corrosion resistance
- Chemical stability

---

## 3. Material Selection

| Application | Material | Key Property |
|---|---|---|
| Aircraft structure | Al alloy, CFRP | Strength/weight ratio |
| Car chassis | High-strength steel | Strength / cost |
| Rocket nozzle | Refractory, ceramics | 3000°C resistance |
| Phone case | Al, Ti, plastic, glass | Aesthetic + strong |
| Battery case | Al, plastic | Light + insulating |
| PCB | FR4 epoxy | Dielectric + stable |
| Heat sink | Cu, Al, graphene | High thermal conductivity |
| Cutting tools | WC carbide, diamond | Extreme hardness |

---

## 4. Metals

### 4.1 Steel

- Fe + C (< 2.1%)
- Low / medium / high carbon
- Alloy steel: Cr, Ni, Mo
- Stainless: 18% Cr + 8% Ni

### 4.2 Aluminum Alloys

- Light (2.7 g/cm³ vs steel 7.8)
- 6061, 7075 aerospace
- Easy machining / welding

### 4.3 Titanium Alloys

- High strength/weight, corrosion-resistant
- Expensive ($30/kg vs steel $1)
- Aerospace / medical implants

---

## 5. Polymers

### 5.1 Thermoplastics

- PE, PP, PS, PVC, ABS
- Melt with heat → recyclable
- Injection molded

### 5.2 Thermosets

- Epoxy, phenolic
- Cured permanent
- Strong / heat-resistant

### 5.3 Elastomers

- Rubber, silicone
- Large deformation

### 5.4 High Performance

- PEEK: 250°C service, vacuum-compatible
- PTFE (Teflon): non-stick, high-low temp
- Polyimide: 400°C+

---

## 6. Composites

- CFRP: aircraft wings, bicycles
- GFRP: wind blades
- Sandwich (honeycomb core)

---

## 7. Semiconductors

- **Si**: mainstream IC
- **GaN**: high-freq, high-V (5G, chargers)
- **SiC**: EV power modules
- **GaAs**: high-speed RF
- **Diamond**: extreme environments

---

## 8. Real Example (Selection Trade-off)

Drone frame:
- CFRP: strong + light, $$
- Al: cheap, slightly heavier
- Plastic: cheapest, weakest
- Engineer selects → application-specific

---

## 9. Test Methods

- Tensile test (UTM)
- Hardness (Vickers, Rockwell)
- Fatigue (S-N curve)
- Impact (Charpy)
- Microscopy (SEM, TEM)
- X-ray diffraction

---

## 10. Common Pitfalls

### 10.1 No Universal Best

Each material has trade-offs; application-specific.

### 10.2 Cost = Performance / Process

Expensive material may have cheap processing (CFRP).

### 10.3 Datasheet Conditions

Properties depend on temperature / environment; always read datasheet.

### 10.4 Anisotropy

Composites are direction-dependent; can't assume isotropic.

### 10.5 Joining

Material contact may cause galvanic corrosion (Al + Cu).

---

## 11. Related Concepts

- **Same section**: [Linear Algebra](Linear_Algebra.en.md), [Thermodynamics](Thermodynamics.en.md)

---

## References

1. **Callister, W. D. & Rethwisch, D. G.** *Materials Science and Engineering: An Introduction*. 10th ed., 2018.
2. **Ashby, M. F.** *Materials Selection in Mechanical Design*. 5th ed., 2016.
3. **Shackelford, J. F.** *Introduction to Materials Science for Engineers*. 8th ed., 2014.
