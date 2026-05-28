# GPS and RTK Positioning

## GNSS Fundamentals

### What Is GNSS

GNSS (Global Navigation Satellite System) is the umbrella term for satellite-based positioning technologies. GPS is a subset of GNSS.

### Major Satellite Constellations

| Constellation | Country/Region | Satellites | Bands | Accuracy (Civilian) |
|--------------|---------------|-----------|-------|---------------------|
| **GPS** | USA | 31 | L1/L2/L5 | ~2-5m |
| **GLONASS** | Russia | 24 | G1/G2/G3 | ~2-5m |
| **Galileo** | EU | 30 | E1/E5a/E5b/E6 | ~1-3m |
| **BeiDou BDS** | China | 45+ | B1/B2/B3 | ~2-5m |
| **QZSS** | Japan | 4 | L1/L2/L5/L6 | Regional augmentation |
| **IRNSS/NavIC** | India | 7 | L5/S | Regional coverage |

### Positioning Principle: Trilateration

Position is determined by measuring pseudoranges from the receiver to at least 4 satellites:

$$
\rho_i = \sqrt{(x - x_i^s)^2 + (y - y_i^s)^2 + (z - z_i^s)^2} + c \cdot \delta t
$$

Where:

- $\rho_i$ is the pseudorange to the $i$-th satellite
- $(x, y, z)$ is the receiver position
- $(x_i^s, y_i^s, z_i^s)$ is the satellite position
- $c \cdot \delta t$ is the receiver clock bias

At least 4 satellites are needed: 3 position unknowns + 1 clock bias.

### Error Sources

| Error Source | Magnitude | Description |
|-------------|-----------|-------------|
| Ionospheric delay | 1-50m | Signal delay through the ionosphere |
| Tropospheric delay | 0.5-5m | Effect of water vapor in the atmosphere |
| Satellite orbit error | 1-5m | Satellite position prediction error |
| Satellite clock error | 1-3m | Satellite clock deviation from system time |
| Multipath effect | 0.5-several m | Signal reflected by buildings |
| Receiver noise | 0.3-1m | Hardware noise |
| Geometric Dilution of Precision (DOP) | Multiplier | Effect of satellite geometric distribution |

## RTK-GPS

### RTK Principle

RTK (Real-Time Kinematic) eliminates most common errors through base-rover differential and achieves centimeter-level positioning using carrier phase observations.

**Carrier phase observation**:

$$
\Phi = \frac{1}{\lambda}(\rho + N\lambda + c \cdot \delta t - I + T + \epsilon)
$$

Where:

- $\Phi$ is the carrier phase observation (cycles)
- $\lambda$ is the carrier wavelength (L1 ~ 19cm)
- $N$ is the integer ambiguity
- $I$ is the ionospheric delay
- $T$ is the tropospheric delay

**Differential elimination**: Base station and rover observe the same satellite simultaneously; common errors cancel in the difference:

$$
\Delta\Phi = \frac{1}{\lambda}(\Delta\rho + \Delta N \lambda + \Delta\epsilon)
$$

The key is resolving the integer ambiguity $\Delta N$; once correctly fixed, positioning accuracy reaches 1-2cm.

### RTK System Components

<!-- SVG-DESIGN-NOTES
Type: A (structure / geometry — spatial geometry of RTK double differencing; node positions carry physical meaning)
Q0: RTK's centimeter accuracy comes from one geometric fact: the base (known coords) and rover are very close (<10-20 km), so signals from the same satellite to both pass through nearly the same ionosphere/troposphere, hence satellite clock, orbit, and atmospheric errors cancel almost entirely under between-station differencing, leaving only the integer ambiguity to resolve
Q1: True spatial layout - satellite above, base and nearby rover below; two lines of sight to the same satellite are nearly parallel (the key geometry), the shared atmosphere is a band, the differenced-out errors labeled on it; the data link carries base corrections to the rover
Q2: Strip the title: satellite + close two-station pair + near-parallel sight lines through the same atmosphere band = RTK double-difference DNA, recognizably not a generic flow box
Q3: Removed 6 equal boxes + 5 flow arrows; replaced with the true geometry carrying proximity -> error correlation -> cancellation by differencing
Q4: Sight lines, atmosphere band, baseline, and cancelled errors all labeled directly on their geometric elements
Q5: All var(--dia-*); Chinese labels localized for the English edition
-->
<div class="diagram">
<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="rtk-ar" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/></marker></defs>
  <text x="360" y="24" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="16" fill="var(--dia-stroke)">RTK double-difference geometry - close station pair cancels common errors almost entirely</text>

  <!-- satellite -->
  <circle cx="360" cy="64" r="14" fill="var(--dia-gold)" fill-opacity="0.4" stroke="var(--dia-gold)" stroke-width="1.8"/>
  <text x="360" y="50" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">GNSS satellite</text>
  <text x="360" y="98" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">clock · orbit error (shared between stations)</text>

  <!-- shared atmosphere band -->
  <rect x="60" y="150" width="600" height="48" fill="var(--dia-stroke-soft)" fill-opacity="0.14" stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="4 4"/>
  <text x="360" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">same ionosphere / troposphere - the two sight lines share almost one path</text>

  <!-- near-parallel lines of sight to the SAME satellite -->
  <line x1="360" y1="78" x2="225" y2="320" stroke="var(--dia-green)" stroke-width="1.6"/>
  <line x1="360" y1="78" x2="305" y2="320" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <path d="M 330 250 A 30 30 0 0 1 348 250" fill="none" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="396" y="250" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">angle ≈ 0  →  errors strongly correlated</text>

  <!-- base station (known) -->
  <polygon points="225,320 213,344 237,344" fill="var(--dia-green)" fill-opacity="0.35" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="225" y="364" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" font-weight="600" fill="var(--dia-stroke)">base</text>
  <text x="225" y="380" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">coords known</text>

  <!-- rover (unknown) -->
  <circle cx="305" cy="332" r="11" fill="var(--dia-blue)" fill-opacity="0.35" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="305" y="364" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" font-weight="600" fill="var(--dia-stroke)">rover</text>
  <text x="305" y="380" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">to be located</text>

  <!-- short baseline -->
  <line x1="237" y1="332" x2="294" y2="332" stroke="var(--dia-stroke)" stroke-width="1.4" stroke-dasharray="2 2"/>
  <text x="266" y="324" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">baseline &lt; 10-20 km</text>

  <!-- data link: base corrections to rover -->
  <path d="M 237 340 C 480 420, 540 360, 540 300" fill="none" stroke="var(--dia-accent)" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#rtk-ar)"/>
  <text x="560" y="300" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-accent)">data link</text>
  <text x="560" y="316" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">radio / 4G / NTRIP</text>

  <!-- result -->
  <text x="540" y="220" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">after between-station differencing:</text>
  <text x="540" y="238" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">clock/orbit/atmos ≈ cancelled</text>
  <text x="540" y="254" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">only integer ambiguity N left → Fix</text>
  <text x="540" y="270" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent)">→ 1–2 cm</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — RTK's centimeter accuracy is geometric: the base and nearby rover have near-parallel sight lines to the same satellite through the same atmosphere, so between-station differencing cancels clock/orbit/atmospheric errors almost entirely; resolving the integer ambiguity fixes it to 1-2 cm.</p>


### Positioning States

| State | Accuracy | Description |
|-------|----------|-------------|
| **Fix** | 1-2 cm | Integer ambiguity correctly resolved |
| **Float** | 10-50 cm | Integer ambiguity not resolved |
| **DGPS** | 0.5-1 m | Pseudorange differential only |
| **Single** | 2-5 m | No differential correction |

### u-blox ZED-F9P

ZED-F9P is currently the most popular consumer/low-cost RTK GNSS receiver.

| Parameter | Value |
|-----------|-------|
| Supported Constellations | GPS + GLONASS + Galileo + BeiDou |
| Bands | L1 + L2 (dual-frequency) |
| RTK Accuracy | Horizontal 1cm + 1ppm, Vertical 1.5cm + 1ppm |
| Convergence Time | <10s (RTK Fix) |
| Update Rate | Up to 20Hz (RTK 8Hz) |
| Interfaces | UART x3, I2C, SPI, USB |
| Power | ~150mW |
| Price | ~$200 (module) |

```bash
# Using ublox driver in ROS2
sudo apt install ros-humble-ublox-gps

ros2 launch ublox_gps ublox_gps_node-launch.py \
    device:=/dev/ttyACM0
```

### NTRIP Protocol

NTRIP (Networked Transport of RTCM via Internet Protocol) transmits RTK correction data over the internet, eliminating the need to build your own base station.

```bash
# Connect to NTRIP service
str2str -in ntrip://username:password@caster_host:2101/mountpoint \
        -out serial://ttyUSB0:115200
```

Common CORS (Continuously Operating Reference Station) services in China: Qianxun (qxwz.com), China Mobile OnePoint, etc.

## Indoor Positioning Alternatives

GPS/GNSS is unavailable indoors, requiring alternative positioning solutions.

### UWB (Ultra-Wideband)

| Parameter | Description |
|-----------|-------------|
| Principle | Ultra-wideband pulse ToF ranging |
| Accuracy | 10-30 cm |
| Range | 10-100m |
| Representative Chips | Decawave DW1000 / DW3000 |
| Advantages | High accuracy, anti-multipath |
| Disadvantages | Requires deploying anchors |
| Price | Anchor ~$30/each, Tag ~$15/each |

**Positioning methods**:

- TWR (Two-Way Ranging): Bidirectional ranging
- TDoA (Time Difference of Arrival)

$$
d_{ij} = c \cdot \frac{t_{\text{round}} - t_{\text{reply}}}{2}
$$

### AprilTag Positioning

| Parameter | Description |
|-----------|-------------|
| Principle | Visual marker detection + PnP pose estimation |
| Accuracy | 1-5 cm (depends on distance and marker size) |
| Range | 0.5-5m (depends on marker size and camera resolution) |
| Cost | Only printed markers + camera needed |
| Disadvantages | Markers must be visible, affected by lighting |

### Other Indoor Positioning Technologies

| Technology | Accuracy | Cost | Description |
|-----------|----------|------|-------------|
| WiFi fingerprinting | 1-5m | Low | Uses existing APs |
| BLE Beacon | 1-3m | Low | Bluetooth beacons |
| LiDAR SLAM | 5-10cm | Medium | No infrastructure needed |
| Visual SLAM | 5-20cm | Low | Camera only |
| Motion capture | <1mm | High | Vicon/OptiTrack |

## GPS + IMU Fusion

### Fusion Motivation

| GPS Characteristics | IMU Characteristics | After Fusion |
|--------------------|--------------------| -------------|
| Low frequency (1-20Hz) | High frequency (200-1000Hz) | High-frequency output |
| No drift | Long-term drift | Good short and long term |
| May be interrupted | Continuously available | Continuously available |
| Variable accuracy | Short-term precise | Consistently precise |

### EKF Fusion

Using Extended Kalman Filter (EKF) to fuse GPS and IMU:

**Prediction step** (IMU-driven, high frequency):

$$
\hat{\mathbf{x}}_{k|k-1} = f(\hat{\mathbf{x}}_{k-1}, \mathbf{u}_k^{\text{IMU}})
$$

$$
\mathbf{P}_{k|k-1} = \mathbf{F}_k \mathbf{P}_{k-1} \mathbf{F}_k^T + \mathbf{Q}_k
$$

**Update step** (GPS observation, low frequency):

$$
\mathbf{K}_k = \mathbf{P}_{k|k-1} \mathbf{H}_k^T (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^T + \mathbf{R}_k)^{-1}
$$

$$
\hat{\mathbf{x}}_k = \hat{\mathbf{x}}_{k|k-1} + \mathbf{K}_k (\mathbf{z}_k^{\text{GPS}} - h(\hat{\mathbf{x}}_{k|k-1}))
$$

### ROS2 robot_localization

```bash
sudo apt install ros-humble-robot-localization

# Configure EKF fusion of GPS + IMU
ros2 launch robot_localization dual_ekf_navsat.launch.py
```

Configuration files need to specify:

- `ekf_local`: Fuses IMU + wheel odometry (local frame)
- `ekf_global`: Fuses GPS + IMU (global frame)
- `navsat_transform`: GPS coordinate conversion

## References

- u-blox ZED-F9P Integration Manual
- *GPS: Theory, Algorithms and Applications* - Xu & Xu
- Decawave DW1000 Datasheet
- ROS2 robot_localization Documentation
- Qianxun Developer Documentation
