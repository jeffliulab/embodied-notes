# Solid-State LiDAR

## Overview

Solid-state LiDAR refers to laser radars without macro-scale mechanical moving parts. Compared to traditional mechanical rotating LiDARs, solid-state LiDARs offer higher reliability, smaller form factors, and lower cost potential. They are considered the key direction for LiDAR technology transitioning from R&D to large-scale mass production.

## Mechanical vs. Solid-State: Why Solid-State Is Needed

| Dimension | Mechanical Rotating | Solid-State |
|-----------|-------------------|-------------|
| Moving Parts | Motor-driven rotation | No macro-scale moving parts |
| Lifespan | ~10,000 hours | ~100,000 hours |
| Size | Larger (rotation space needed) | Compact |
| Weight | 500g - 2kg | 100g - 500g |
| FOV | Horizontal 360 deg | Limited (60-120 deg) |
| Reliability | Vibration/shock sensitive | High reliability (automotive grade) |
| Cost (Mass Production) | High (precision machining) | Low (semiconductor process) |
| Automotive Certification | Difficult | Easier to achieve |

!!! warning "FOV Limitation"
    The biggest limitation of solid-state LiDARs is the inability to achieve 360-degree omnidirectional scanning. Solutions include combining multiple solid-state LiDARs for full surround coverage, or using a single sensor for specific applications (e.g., forward perception).

## Solid-State LiDAR Technology Routes

<div class="diagram">
<svg viewBox="0 0 560 720" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="280" y1="120" x2="110" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="280" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="450" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="195" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="365" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="260" x2="110" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="280" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="450" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="400" x2="195" y2="630" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="400" x2="365" y2="630" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Solid-State LiDAR</text>
  <text x="280" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Technology Routes</text>
  <rect x="40" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="110" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MEMS Micro-Mirror</text>
  <rect x="210" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="280" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">OPA Optical</text>
  <text x="280" y="246" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Phased Array</text>
  <rect x="380" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="450" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Flash LiDAR</text>
  <rect x="125" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="350" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Prism/Wedge</text>
  <text x="195" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Mirror Rotation</text>
  <rect x="295" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="295" y="350" width="3" height="50" fill="var(--dia-green)"/>
  <text x="365" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">FMCW Solid-State</text>
  <rect x="40" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="498" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MEMS mirror</text>
  <text x="110" y="512" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">controls laser</text>
  <text x="110" y="526" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">direction</text>
  <text x="110" y="540" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">RoboSense RS-M1</text>
  <rect x="210" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="491" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Electronically</text>
  <text x="280" y="505" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">controlled beam</text>
  <text x="280" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">steering</text>
  <text x="280" y="533" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Quanergy, Analog</text>
  <text x="280" y="547" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Photonics</text>
  <rect x="380" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="505" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Area</text>
  <text x="450" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">emission/reception</text>
  <text x="450" y="533" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Ibeo, Continental</text>
  <rect x="125" y="630" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="630" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="195" y="645" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Small optical</text>
  <text x="195" y="659" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">element rotation</text>
  <text x="195" y="673" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Livox Mid-360</text>
  <rect x="295" y="630" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="295" y="630" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="365" y="631" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Frequency</text>
  <text x="365" y="645" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">modulation +</text>
  <text x="365" y="659" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">coherent</text>
  <text x="365" y="673" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">detection Aeva,</text>
  <text x="365" y="687" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SiLC</text>
</svg>
</div>


### MEMS Micro-Mirror Scanning

**Principle**: Uses MEMS-fabricated micro-mirrors to deflect the laser beam direction, achieving 2D scanning.

$$
\theta(t) = \theta_0 \sin(2\pi f t)
$$

Where $\theta_0$ is the maximum deflection angle and $f$ is the mirror resonant frequency.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | 1D or 2D MEMS mirror rapid oscillation |
| Advantages | Mature technology, controllable cost, mass-producible |
| Disadvantages | Mirror is still a moving part (microscale), limited shock resistance |
| FOV | Typically 60-120 deg |
| Representative Products | RoboSense RS-M1, Innoviz InnovizTwo |

**Workflow**:

1. Laser emits a pulse
2. MEMS mirror deflects the laser to the target direction
3. Reflected light returns through the same MEMS mirror
4. Detector receives and measures time of flight
5. MEMS mirror oscillates rapidly to cover the entire FOV

### OPA Optical Phased Array

**Principle**: Similar to phased-array radar, uses phase differences among multiple emitting elements to control the laser beam direction, achieving purely electronic beam steering.

$$
\theta = \arcsin\left(\frac{\lambda \cdot \Delta\varphi}{2\pi d}\right)
$$

Where:

- $\lambda$ is the laser wavelength
- $\Delta\varphi$ is the phase difference between adjacent elements
- $d$ is the element spacing

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | Purely electronic phase adjustment |
| Advantages | Truly no moving parts, extremely fast scanning, random access |
| Disadvantages | High technical difficulty, limited power, sidelobe issues |
| Status | R&D stage, few commercial products |
| Representative | Quanergy (bankrupt), MIT/Caltech research |

!!! note "OPA Challenges"
    OPA is theoretically the ideal solid-state solution, but faces technical challenges in element count, emission power, and sidelobe suppression. Commercialization progress has been slow, and large-scale deployment is unlikely in the near term.

### Flash LiDAR

**Principle**: Similar to a camera's "flash," illuminates the entire scene at once, using an area detector array (e.g., SPAD array) to simultaneously receive reflected signals from all directions.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | No scanning, parallel area detection |
| Advantages | No moving parts, high frame rate, simple structure |
| Disadvantages | Short range (energy dispersal), resolution limited by array size |
| Suitable Scenarios | Close range (<30m), blind-spot coverage, gesture recognition |
| Representative | Ibeo, Continental, Apple iPad LiDAR |

Flash LiDAR's distance limitation stems from energy conservation:

$$
P_{\text{per pixel}} = \frac{P_{\text{total}}}{N_{\text{pixels}}}
$$

Covering more pixels or longer distances requires more emission power, constrained by eye safety standards.

### Prism/Wedge Mirror Rotation (Livox Approach)

**Principle**: Uses one or more small rotating prisms to change the laser direction, producing a unique non-repetitive scan pattern.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Scanning Method | Small prism rotation (semi-solid-state) |
| Advantages | Low cost, higher reliability, non-repetitive scanning improves equivalent resolution |
| Disadvantages | Strictly speaking not purely solid-state, still has small moving parts |
| Representative | Livox Mid-360, HAP, Avia |

**Non-repetitive scanning coverage**:

$$
C(T) = 1 - e^{-\lambda T}
$$

Where $C(T)$ is the FOV coverage within integration time $T$, and $\lambda$ is the scan density parameter. Coverage exponentially approaches 100% with increasing time.

### FMCW Solid-State LiDAR

**Principle**: Combines FMCW ranging with solid-state beam control (OPA or MEMS) for coherent detection.

**Technical Features**:

| Feature | Description |
|---------|-------------|
| Ranging Principle | Frequency-modulated continuous wave (coherent detection) |
| Advantages | Simultaneous distance + velocity, strong anti-interference, high sensitivity |
| Disadvantages | Highest technical complexity, high cost |
| Representative | Aeva Aeries II, SiLC Eyeonic |

**Key advantage -- Instantaneous velocity measurement**:

$$
v = \frac{f_{\text{Doppler}} \cdot \lambda}{2}
$$

Traditional ToF LiDAR can only estimate velocity through consecutive frame differencing, while FMCW can directly obtain radial velocity from a single measurement.

## Livox Mid-360 in Detail

Livox Mid-360 is currently one of the most popular solid-state (semi-solid-state) LiDARs in robotics.

### Specifications

| Parameter | Value |
|-----------|-------|
| Range | 40m (@10% reflectivity), 70m (@80%) |
| FOV | 360 x 59 deg (-7 to +52 deg) |
| Point Rate | 200,000 pts/s |
| Scanning Method | Non-repetitive rotating prism |
| Accuracy | +/-2cm (@0.2m-10m) |
| Returns | Dual return |
| Built-in IMU | 6-axis, 200Hz |
| Interface | 100M Ethernet |
| Size | 63.18mm diameter x 47.98mm |
| Weight | ~265g |
| Power | 5.5W (typical) |
| Protection | IP67 |
| Operating Temperature | -20 to +55 deg C |
| Price | ~$1,099 |

### Non-Repetitive Scanning Pattern

<div class="diagram">
<svg viewBox="0 0 900 200" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="95" x2="270" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="95" x2="500" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="730" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">50ms Low Coverage</text>
  <rect x="270" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="70" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">100ms Medium</text>
  <text x="340" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Coverage</text>
  <rect x="500" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">200ms High</text>
  <text x="570" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Coverage</text>
  <rect x="730" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">500ms Near-Full</text>
  <text x="800" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Coverage</text>
</svg>
</div>


As integration time increases, the scan pattern gradually fills the entire FOV, with equivalent resolution continuously improving. This is the core advantage of Livox over traditional line-scanning LiDARs.

### Typical Applications

- **Quadruped robots**: Lightweight, 360-deg FOV, built-in IMU, suitable for FAST-LIO2/Point-LIO
- **Drone mapping**: Lightweight, low power
- **Service robots**: 3D perception and obstacle avoidance
- **Low-speed autonomous driving**: Campus logistics vehicles, delivery robots

## Technology Route Comparison

| Technology Route | Maturity | Cost | Performance | Mass Production Difficulty | Main Bottleneck |
|-----------------|----------|------|-------------|---------------------------|----------------|
| MEMS Micro-Mirror | 4/5 | Medium | Good | Medium | Mirror reliability |
| Prism Rotation | 4/5 | Low | Good | Low | Not purely solid-state |
| Flash | 3/5 | Low | Medium (short range) | Low | Range limitation |
| OPA | 2/5 | High | High potential | High | Power, sidelobes |
| FMCW | 3/5 | High | Excellent | High | System complexity |

## Future Trends for Solid-State LiDAR

1. **Cost reduction**: As production scales up, automotive-grade solid-state LiDAR prices will drop to $200-$500
2. **Chipification**: Integrating emitter, scanner, receiver, and processor into a single chip (SoC LiDAR)
3. **FMCW adoption**: 4D LiDAR (range + velocity) will become the next-generation standard
4. **Camera fusion**: Integrating LiDAR and camera in the same sensor module
5. **1550nm wavelength**: Eye-safe + higher power = longer range

## References

- Livox Technical White Paper: https://www.livoxtech.com
- *LiDAR Technologies and Systems* - SPIE
- Aeva FMCW Technical Documentation
- RoboSense RS-M1 Product Specifications
- Hesai FT120 Technical Data
