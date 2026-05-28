# LiDAR Overview

## What Is LiDAR

LiDAR (Light Detection and Ranging) is an active sensing technology that measures distances using laser pulses. It constructs precise 3D models of the environment by emitting lasers and receiving reflected signals, making it one of the most important sensors in robot perception systems.

## Ranging Principles

### Time-of-Flight (ToF)

The most fundamental LiDAR ranging principle. A short laser pulse is emitted, and its round-trip time is measured:

$$
d = \frac{c \cdot t}{2}
$$

Where:

- $d$ is the target distance
- $c$ is the speed of light ($\approx 3 \times 10^8 \, \text{m/s}$)
- $t$ is the round-trip time of the laser pulse

**Characteristics**:

- Simple principle, mature implementation
- Large ranging distance (up to hundreds of meters)
- Accuracy limited by time measurement resolution ($\Delta d = \frac{c \cdot \Delta t}{2}$)
- Widely used in mechanical LiDARs (e.g., Velodyne)

### Phase-Shift Method

Emits a continuously modulated laser and calculates distance by measuring the phase difference between emitted and reflected signals:

$$
d = \frac{c \cdot \Delta\varphi}{4\pi f}
$$

Where:

- $\Delta\varphi$ is the phase difference
- $f$ is the modulation frequency

**Characteristics**:

- Higher accuracy (millimeter-level)
- Relatively shorter ranging distance
- Needs to resolve phase ambiguity (multi-frequency modulation)
- Commonly used in industrial measurement-grade LiDARs

### Frequency-Modulated Continuous Wave (FMCW)

Emits a continuous laser whose frequency varies linearly with time. Distance is determined by the beat frequency between the reflected signal and a local reference signal:

$$
d = \frac{c \cdot f_{\text{beat}}}{2B / T}
$$

Where:

- $f_{\text{beat}}$ is the beat frequency
- $B$ is the frequency sweep bandwidth
- $T$ is the sweep period

**Characteristics**:

- Can simultaneously obtain distance and velocity information (Doppler effect)
- Strong resistance to ambient light interference
- High ranging accuracy
- High technical complexity and cost
- Representatives: Aeva, SiLC Technologies

## LiDAR Type Classification

### By Scanning Method

<div class="diagram">
<svg viewBox="0 0 560 580" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="280" y1="120" x2="110" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="280" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="450" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="260" x2="110" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="280" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="450" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="110" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="280" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="450" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">LiDAR Types</text>
  <rect x="40" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="110" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Mechanical</text>
  <text x="110" y="246" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Rotating</text>
  <rect x="210" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="280" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Semi-Solid-State</text>
  <rect x="380" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="450" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Pure Solid-State</text>
  <rect x="40" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="365" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Single/Multi-line</text>
  <text x="110" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Rotation Velodyne</text>
  <text x="110" y="393" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">VLP-16 Ouster OS1</text>
  <rect x="210" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MEMS Micro-Mirror</text>
  <text x="280" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">RoboSense</text>
  <rect x="380" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Prism Rotation</text>
  <text x="450" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Livox Mid-360</text>
  <rect x="40" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="512" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">OPA Optical</text>
  <text x="110" y="526" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Phased Array</text>
  <rect x="210" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Flash LiDAR</text>
  <rect x="380" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">FMCW Solid-State</text>
</svg>
</div>


### Mechanical Rotating LiDAR

| Feature | Description |
|---------|-------------|
| Principle | Laser emitter/receiver module rotates with a motor |
| FOV | Horizontal 360 degrees, vertical depends on number of lines |
| Advantages | Omnidirectional scanning, mature technology |
| Disadvantages | Mechanical wear, large size, high cost |
| Representative | Velodyne VLP-16/32/64/128 |

### Semi-Solid-State LiDAR

| Feature | Description |
|---------|-------------|
| Principle | Small mirror or prism scanning |
| FOV | Limited angle (typically 60-120 degrees) |
| Advantages | Small size, higher reliability |
| Disadvantages | Limited FOV |
| Representative | Livox Mid-360, HAP |

### Pure Solid-State LiDAR

| Feature | Description |
|---------|-------------|
| Principle | No moving parts whatsoever |
| FOV | Limited angle |
| Advantages | High reliability, low cost potential, mass-producible |
| Disadvantages | Technology still maturing |
| Representative | Cepton, Ibeo |

## Key Performance Metrics

| Metric | Description | Typical Range |
|--------|------------|---------------|
| **Range** | Maximum detectable distance | 12m (low-end) - 300m+ (high-end) |
| **Range Accuracy** | Distance measurement error | +/-1cm - +/-3cm |
| **Angular Resolution** | Angle between adjacent scan lines/points | 0.1 - 2 degrees |
| **Field of View (FOV)** | Horizontal and vertical scan range | H: 60-360 deg, V: 15-90 deg |
| **Scan Frequency** | Scans completed per second | 5Hz - 20Hz |
| **Point Rate** | Points generated per second | 10K - 2.4M points/s |
| **Number of Returns** | Returns per pulse | 1 - 5 |
| **Wavelength** | Laser wavelength | 905nm (near-IR) or 1550nm (eye-safe) |
| **Power Consumption** | Operating power | 5W - 30W |
| **Protection Rating** | Environmental protection | IP65 - IP69K |

## LiDAR Selection for Different Robot Platforms

### Indoor Mobile Robots / Robot Vacuums

- **Recommended**: 2D LiDAR (RPLIDAR A1/A2, YDLIDAR X4)
- **Reason**: Low cost, low power; 2D SLAM sufficient for navigation
- **Typical setup**: Single-line 360-degree LiDAR mounted on top of the robot

### Service Robots / AGVs

- **Recommended**: 2D LiDAR (safety-rated) + optional 3D LiDAR
- **Reason**: Safety certification needed (e.g., SICK TiM series); obstacle avoidance requirements
- **Typical setup**: One safety LiDAR front and rear + top navigation LiDAR

### Autonomous Driving Vehicles

- **Recommended**: Multi-line 3D LiDAR or solid-state LiDAR combinations
- **Reason**: High-precision 3D environment perception, long-range detection needed
- **Typical setup**: Main LiDAR on roof + corner blind-spot LiDARs

### Drones

- **Recommended**: Lightweight solid-state LiDAR (e.g., Livox Mid-360)
- **Reason**: Weight and power constraints
- **Typical setup**: Downward or forward-facing mount

### Quadruped Robots

- **Recommended**: Lightweight 3D LiDAR (Livox Mid-360, Ouster OS0)
- **Reason**: Dynamic environment perception, terrain mapping
- **Typical setup**: Head or back-mounted

## LiDAR Data Processing Pipeline

<div class="diagram">
<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="175" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="960" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="730" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="960" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="960" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="1190" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="95" x2="1420" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="95" x2="1420" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="95" x2="1420" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Raw Data</text>
  <text x="110" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Acquisition</text>
  <rect x="270" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Data</text>
  <text x="340" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Preprocessing</text>
  <rect x="500" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Feature</text>
  <text x="570" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Extraction</text>
  <rect x="960" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1030" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Advanced</text>
  <text x="1030" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Applications</text>
  <rect x="500" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Noise Filtering</text>
  <rect x="500" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="230" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="252" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Motion</text>
  <text x="570" y="266" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Compensation</text>
  <rect x="730" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="800" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Coordinate</text>
  <text x="800" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Transform</text>
  <rect x="960" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1030" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Plane Detection</text>
  <rect x="960" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="230" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1030" y="252" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Cluster</text>
  <text x="1030" y="266" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Segmentation</text>
  <rect x="1190" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1260" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Edge/Corner</text>
  <text x="1260" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Extraction</text>
  <rect x="1420" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="70" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1490" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SLAM</text>
  <rect x="1420" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1490" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Object Detection</text>
  <rect x="1420" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="230" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1490" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Map Building</text>
</svg>
</div>


## Laser Safety Classes

| Class | Description | LiDAR Application |
|-------|------------|-------------------|
| Class 1 | Safe under all operating conditions | Most consumer/industrial LiDARs |
| Class 1M | Safe for naked eye, potentially unsafe with optical instruments | Some long-range LiDARs |
| Class 3R | Low risk of direct viewing | Few high-power measurement LiDARs |

!!! warning "Eye Safety"
    905nm wavelength LiDARs must strictly control power to ensure eye safety. 1550nm wavelength is safer for human eyes (absorbed by the cornea rather than reaching the retina), but detector costs are higher.

## Comparison with Other Sensors

| Feature | LiDAR | Camera | mmWave Radar | Ultrasonic |
|---------|-------|--------|-------------|------------|
| Accuracy | High (cm-level) | Medium | Medium | Low |
| Range | Far (~300m) | Far | Far (~250m) | Near (~5m) |
| 3D Information | Native 3D | Requires algorithms | Limited | No |
| Affected by Lighting | Slightly | Severely | No | No |
| Affected by Weather | Rain/fog significant | Rain/fog significant | Better | Better |
| Cost | High | Low | Medium | Very low |
| Texture/Color | No | Yes | No | No |
| Power | Medium | Low | Low | Very low |

## References

- Velodyne LiDAR Technical White Papers
- Livox Technical Documentation
- *Introduction to Autonomous Mobile Robots* - Siegwart et al.
- ROS2 LiDAR Driver Package Documentation
