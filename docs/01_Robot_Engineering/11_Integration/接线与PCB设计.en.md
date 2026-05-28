# Wiring and PCB Design

## Overview

Electronic integration is one of the most error-prone aspects of robot system integration. This section covers wiring best practices, connector selection, and custom PCB design fundamentals.

---

## Wiring Fundamentals

### Wire Gauge (AWG)

AWG (American Wire Gauge) is the standard for wire thickness. **Lower numbers mean thicker wire**.

| AWG | Diameter (mm) | Current Capacity (A) | Resistance (mΩ/m) | Typical Use |
|-----|----------|-----------|-------------|---------|
| 10 | 2.59 | 30 | 3.3 | Battery main, large motors |
| 12 | 2.05 | 20 | 5.2 | Motor power |
| 14 | 1.63 | 15 | 8.3 | Medium power devices |
| 16 | 1.29 | 10 | 13.2 | Servo power |
| 18 | 1.02 | 7 | 21.0 | Small motors, sensor power |
| 20 | 0.81 | 5 | 33.3 | Sensor signal lines |
| 22 | 0.64 | 3 | 53.0 | Low-power signals |
| 24 | 0.51 | 2 | 84.2 | I2C/SPI signal lines |
| 26 | 0.40 | 1.3 | 134 | Fine signal lines |
| 28 | 0.32 | 0.8 | 213 | Ultra-fine signal lines |

**Wire Selection Principle**:

$$I_{wire\_rating} \geq 1.5 \times I_{max\_load}$$

Leave 50% margin to prevent overheating.

### Wire Types

| Type | Features | Application |
|------|------|------|
| **Silicone wire** | Flexible, heat resistant (-60~200°C) | Robot joints, motor wiring |
| **PVC wire** | Cheap, stiff | Fixed routing |
| **Teflon wire** | Heat and chemical resistant | Harsh environments |
| **Ribbon cable (FFC/FPC)** | Flat, flexible | Displays, tight spaces |
| **Twisted pair** | Noise resistant | CAN Bus, differential signals |
| **Shielded cable** | Electromagnetic shielding | Analog signals, encoders |

### Color Coding

Standard color conventions (not mandatory, but strongly recommended):

| Color | Use |
|------|------|
| **Red** | Positive power (VCC/V+) |
| **Black** | Ground (GND) |
| **Yellow** | Signal (PWM/Signal) |
| **Green** | Communication (CAN-H/TX) |
| **Blue** | Communication (CAN-L/RX) |
| **White** | Communication (SDA/MOSI) |
| **Orange** | Spare/Secondary power |

**Labels**: Label both ends of every wire with source and destination.

---

## Connector Selection

### Power Connectors

| Connector | Current Rating | Typical Voltage | Features | Use |
|--------|---------|---------|------|------|
| **XT60** | 60A | High voltage | High current, latch | Battery main connector |
| **XT30** | 30A | Medium voltage | Medium current | Motor branch |
| **DC barrel** | 1-5A | 5-24V | Simple | Dev board power |
| **Anderson PP** | 15-180A | High voltage | Industrial grade | Large robots |
| **Deans (T-plug)** | 40A | High voltage | Common in RC | Small robots |

### Signal Connectors

| Connector | Pitch | Pin Count | Features | Use |
|--------|------|--------|------|------|
| **JST-XH** | 2.5mm | 2-16 | Latching | Battery balance, sensors |
| **JST-PH** | 2.0mm | 2-16 | Small | Small sensors |
| **JST-SH** | 1.0mm | 2-10 | Micro | QWIIC (I2C) |
| **Molex Micro-Fit** | 3.0mm | 2-24 | Industrial grade | Motor drivers |
| **DuPont 2.54mm** | 2.54mm | Any | Breadboard friendly | Prototyping |
| **Hirose DF13** | 1.25mm | 2-15 | Reliable, compact | Pixhawk flight controller |

### Waterproof Connectors

| Connector | Protection Rating | Pin Count | Use |
|--------|---------|--------|------|
| **M8 circular** | IP67 | 3-8 | Industrial sensors |
| **M12 circular** | IP67 | 4-12 | EtherCAT, industrial |
| **IP67 USB** | IP67 | 4 | Outdoor cameras |

### Quick-Disconnect Design

Robots need quick disassembly for maintenance:

- Use latching connectors for joint harnesses (do not solder permanently)
- Use standard connectors between modules (M8/M12)
- Each removable module has its own wiring harness

---

## Strain Relief

The most common failure mode for connectors is cable pulling causing solder/crimp joint fracture.

**Locations that must have strain relief**:

- Connector exit points
- Cables passing through panels
- Cables near robot joints
- Any location where pulling may occur

**Methods**:

| Method | Application |
|------|----------|
| Heat shrink + adhesive | Connector tail |
| Cable ties | Cable crossing points |
| P-clips | Mounting to frame |
| Cable chain | Linear motion cables |
| Spiral wrap | Rotating joints |

---

## Crimping Tools

**Strongly recommended** to use proper crimping tools rather than soldering connector terminals:

| Tool | Compatible Connectors | Price Range |
|------|-----------|---------|
| **Engineer PA-09** | JST-XH/PH | ~$30 |
| **Engineer PA-20** | JST-SH, small terminals | ~$30 |
| **IWISS SN-28B** | DuPont 2.54mm | ~$20 |
| **Molex hand crimper** | Molex Micro-Fit | ~$40 |
| **XT60 soldering** | XT60 (requires soldering) | Soldering iron |

**Crimping vs. Soldering**:

- Crimping: Reliable, repeatable, professional
- Soldering: Flexible but inconsistent, heat may damage wire
- Industrial standards require crimping (mandatory in aerospace)

---

## Custom PCB Design

### When to Design a Custom PCB

- Too many messy wires (>20 fly wires -> consider PCB)
- Specific power distribution needs
- Signal conditioning circuits needed (amplification, filtering)
- Mass production requirements
- Strict size/weight constraints

### KiCad Workflow

KiCad is the most popular open-source PCB design software.

The **complete KiCad workflow** is: schematic design → electrical rule check (ERC) → footprint assignment → PCB layout → routing → design rule check (DRC) → generate Gerber → send to fab → solder and debug. The next section expands the key steps.

### AWG Wire Selection: Ampacity and Resistance Change Exponentially with Gauge

Returning to the AWG table at the start of this chapter — it is not an isolated lookup table but a discrete sampling of a physical law: cross-sectional area halves for every +3 in AWG number, so **ampacity falls roughly exponentially as the AWG number rises, while resistance per unit length rises roughly exponentially**. Plotting the 10 real rows of the table on a semi-log grid immediately yields the curve engineers do in their heads when picking wire; overlaying the selection criterion $I_{rating} \ge 1.5\,I_{load}$ as a safety line lets you read off directly "which gauge for a 20 A motor."

<!-- SVG-DESIGN-NOTES
Type: D (quantitative relation / scale — AWG ampacity & resistance changing exponentially with gauge, dual log curves)
Q0 (One Big Idea): every +3 AWG halves the cross-section → ampacity falls roughly exponentially, resistance rises exponentially; the selection criterion I_rating≥1.5·I_load is a horizontal threshold on the curve separating safe/unsafe — robot power lines must land on the safe side
Q1 (geometric mapping): dual-Y semi-log grid — X = AWG number (10..28 linear), left Y = ampacity A (log 0.8..30), right Y = resistance mΩ/m (log 3..213); two curves sampled from the 10 real table points (ampacity down, resistance up) + typical load use-cases labeled directly at the corresponding points
Q2 (DNA): drop the title — two nearly mirror-image exponential curves on a log axis (one falling, one rising) monotone in AWG; the standard wire-gauge selection engineering chart, never confused with a KiCad flow box
Q3 (decoration removed): deleted the original out-of-bounds (viewBox 900 but content to x=2020) 9 equal-size flow boxes + 8 arrows (the KiCad flow is now carried by one sentence of text, no figure needed); no legend, use-cases sit directly on the points
Q4 (direct labels): AWG number on the X-axis; battery main line/motor/servo/I2C uses labeled right next to the corresponding ampacity point; safety criterion line labeled with 1.5×I_load
Q5 (Dark + bilingual): all var(--dia-*); ampacity curve in blue, resistance curve in accent, safe-threshold band lightly filled in green; Chinese use-case labels swapped in the EN version
-->
<div class="diagram">
<svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AWG ampacity and resistance changing exponentially with gauge">
  <text x="380" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">AWG Selection — Ampacity ↓ and Resistance ↑ Exponential in Gauge</text>

  <line x1="90" y1="55" x2="90" y2="340" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <line x1="650" y1="55" x2="650" y2="340" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <line x1="90" y1="340" x2="650" y2="340" stroke="var(--dia-stroke)" stroke-width="1.4"/>

  <text x="82" y="64" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">30 A</text>
  <text x="82" y="174" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">5 A</text>
  <text x="82" y="336" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">0.8 A</text>
  <text x="34" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-blue)" transform="rotate(-90 34 200)">Ampacity (A, log)</text>

  <text x="658" y="336" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">3 mΩ/m</text>
  <text x="658" y="200" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">33</text>
  <text x="658" y="64" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">213</text>
  <text x="726" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-accent)" transform="rotate(90 726 200)">Resistance (mΩ/m, log)</text>

  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <text x="90" y="356" text-anchor="middle">10</text>
    <text x="214" y="356" text-anchor="middle">14</text>
    <text x="339" y="356" text-anchor="middle">18</text>
    <text x="463" y="356" text-anchor="middle">22</text>
    <text x="588" y="356" text-anchor="middle">26</text>
    <text x="650" y="356" text-anchor="middle">28</text>
  </g>
  <text x="370" y="380" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">AWG number (larger = thinner)</text>

  <polyline points="90,60 152,89 214,108 276,131 339,151 401,174 463,212 525,243 588,278 650,308" fill="none" stroke="var(--dia-blue)" stroke-width="2.2"/>
  <g fill="var(--dia-blue)">
    <circle cx="90" cy="60" r="5"/><circle cx="214" cy="108" r="4"/><circle cx="339" cy="151" r="4"/>
    <circle cx="463" cy="212" r="4"/><circle cx="650" cy="308" r="4"/>
  </g>
  <text x="98" y="54" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG10 battery main/big motor 30A</text>
  <text x="222" y="103" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG14 mid power 15A</text>
  <text x="347" y="146" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG18 small motor/sensor 7A</text>
  <text x="455" y="228" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG22 signal 3A</text>
  <text x="642" y="300" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG28 fine signal 0.8A</text>

  <polyline points="90,308 152,287 214,261 276,239 339,210 401,184 463,159 525,136 588,108 650,84" fill="none" stroke="var(--dia-accent)" stroke-width="2" stroke-dasharray="6 3"/>
  <g fill="var(--dia-accent)">
    <circle cx="90" cy="308" r="4"/><circle cx="339" cy="210" r="4"/><circle cx="650" cy="84" r="4"/>
  </g>

  <line x1="90" y1="89" x2="650" y2="89" stroke="var(--dia-green)" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="640" y="84" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">20A motor ⇒ I_rating≥30A ⇒ pick AWG10 (safe only above this line)</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — The 10 rows of the AWG table form a pair of nearly mirror-image exponential curves on a semi-log grid: ampacity falls exponentially as gauge number rises (blue), resistance per unit length rises exponentially (red dashed). The green threshold line demonstrates the selection criterion — a 20 A motor needs ≥30 A margin, so only AWG10 lands on the safe side.</p>


### Schematic Design

The schematic is the logical representation of the circuit. Key steps:

1. **Place components**: Select or create symbols from libraries
2. **Wire connections**: Connect pins with wires
3. **Add power symbols**: VCC, GND, etc.
4. **Add decoupling capacitors**: Place 100nF + 10μF near each IC
5. **Annotate**: Component values, part numbers

### PCB Layout and Routing

**Layout Principles**:

- Keep power components away from sensitive signals
- Place decoupling capacitors close to IC pins
- Place connectors at board edges
- Consider thermal management (widen high-current paths, copper pour)

**Routing Rules** (2-layer board reference):

| Trace Width | Current Capacity | Use |
|------|---------|------|
| 0.2mm | ~0.3A | Signal traces |
| 0.5mm | ~1A | Low power |
| 1.0mm | ~2A | Medium power |
| 2.0mm | ~4A | Power traces |
| Copper pour | >5A | High current |

Empirical formula (outer layer, 1oz copper):

$$I_{max} \approx 0.048 \cdot \Delta T^{0.44} \cdot A^{0.725}$$

where $A$ is the conductor cross-section area (mil²) and $\Delta T$ is the allowable temperature rise (°C).

### Common Circuit Modules

#### Voltage Divider

Used for voltage sensing (e.g., battery voltage measurement):

$$V_{out} = V_{in} \cdot \frac{R_2}{R_1 + R_2}$$

Example: 24V battery voltage -> 3.3V ADC range:

$$\frac{R_2}{R_1 + R_2} = \frac{3.3}{24} \approx 0.1375$$

Choose $R_1 = 100k\Omega$, $R_2 = 15.8k\Omega$.

#### Level Shifter

Interfacing 3.3V and 5V logic:

- **Unidirectional**: MOSFET + pull-up resistor (BSS138 approach)
- **Bidirectional**: TXB0108 (8-channel auto-direction detection)
- **I2C specific**: PCA9306 (bidirectional, supports different voltage buses)

#### Breakout Board

Distributes a single high-density connector to multiple subsystems:

```
                  ┌── IMU (SPI)
[Main Board] ── [Breakout Board] ── Motor Driver (CAN)
                  ├── Sensor (I2C)
                  └── GPS (UART)
```

---

## PCB Prototyping

### Manufacturers

| Manufacturer | Minimum Price | Lead Time | Features |
|------|--------|---------|------|
| **JLCPCB** | 5 pcs/$2 | 1-3 days | Best value |
| **PCBWay** | 5 pcs/$5 | 2-5 days | International shipping friendly |
| **HQ PCB** | 5 pcs/$3 | 1-3 days | KiCad plugin |

### Prototyping Notes

- **Minimum trace width/spacing**: 0.15mm (standard process)
- **Minimum hole diameter**: 0.3mm
- **Copper weight**: 1oz (35μm) standard, 2oz for high current
- **Surface finish**: HASL (cheap), ENIG (better pads)
- **Board thickness**: 1.6mm standard
- **Solder mask color**: Green is cheapest

### Soldering

**Manual Soldering** (prototyping):

- Iron temperature: 300-360°C
- Flux is essential
- 0402 and larger packages can be hand-soldered (with experience)
- QFP/TQFP requires drag-soldering technique

**Reflow Soldering** (small batch):

- Stencil + solder paste -> Place components -> Heat reflow
- Budget option: Solder paste + hot air gun / modified toaster oven

---

## Wire Harness Design

### Harness Diagram

For complex robots, a wire harness diagram is essential:

```
Battery ─[XT60]─ Power Distribution ─┬─[XT30]─ Motor Driver 1
                                      ├─[XT30]─ Motor Driver 2
                                      ├─[DC barrel]─ Jetson
                                      └─[JST-XH]─ Sensor Board

Main Controller ─┬─[USB-C]─ Depth Camera
                  ├─[M12]─── LiDAR
                  ├─[SPI(JST-SH)]─ IMU
                  └─[CAN(Molex)]─── Motor Driver CAN Bus
```

### Harness Labeling Standards

Each wire/harness should be labeled with:

1. **Number**: W001, W002, ...
2. **Source**: Module name + pin
3. **Destination**: Module name + pin
4. **Wire**: AWG + color
5. **Length**: Measured + 10% margin

---

## Electromagnetic Compatibility (EMC) Basics

### Common Interference Sources

| Source | Frequency Range | Impact |
|--------|---------|------|
| BLDC motor PWM | 10-100 kHz | ADC noise |
| Switching power supply | 100 kHz - 1 MHz | Sensor interference |
| Digital signals | MHz range | RF interference |

### Mitigation Measures

1. **Power filtering**: Large electrolytic capacitors + high-frequency ceramic capacitors
2. **Ground separation**: Connect analog and digital ground at a single point
3. **Signal shielding**: Use shielded cable for sensitive signals
4. **Layout isolation**: Physically separate high-power and low-signal areas
5. **Ferrite beads**: Suppress high-frequency interference

$$Z_{ferrite}(f) = R(f) + jX(f)$$

At the target frequency range (typically 10-100 MHz), impedance increases significantly, attenuating interference.

---

## References

- KiCad Official Tutorials: [kicad.org](https://www.kicad.org/)
- JLCPCB: [jlcpcb.com](https://jlcpcb.com/)
- IPC-2221: Generic Standard on Printed Board Design
- Phil's Lab (YouTube): Practical PCB design tutorials
