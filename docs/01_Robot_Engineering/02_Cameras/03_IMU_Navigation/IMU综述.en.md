# IMU Overview

## What Is an IMU

An IMU (Inertial Measurement Unit) is a sensor module that measures the acceleration and angular velocity of an object. It is one of the core sensors for robot navigation, attitude estimation, and motion control, found in virtually all mobile robot platforms.

## Sensor Components

### Accelerometer

**Principle**: Based on a MEMS spring-mass system. When the sensor accelerates, the proof mass displaces due to inertia, and the displacement is detected via capacitance changes.

$$
F = ma \quad \Rightarrow \quad a = \frac{F}{m} = \frac{k \cdot \Delta x}{m}
$$

Where:

- $k$ is the spring stiffness
- $\Delta x$ is the proof mass displacement
- $m$ is the proof mass

**Measurement**: Specific force, i.e., gravity + motion acceleration:

$$
\mathbf{f} = \mathbf{a} - \mathbf{g}
$$

!!! warning "Effect of Gravity"
    An accelerometer at rest measures the gravitational acceleration $g \approx 9.81 \, \text{m/s}^2$. When using an accelerometer for navigation, the gravity component must be subtracted from the measurement, which requires precise knowledge of the sensor's attitude.

### Gyroscope

**Principle**: Based on the Coriolis effect. A vibrating proof mass in a rotating reference frame experiences a Coriolis force:

$$
\mathbf{F}_c = -2m(\boldsymbol{\omega} \times \mathbf{v})
$$

Where:

- $m$ is the vibrating mass
- $\boldsymbol{\omega}$ is the angular velocity
- $\mathbf{v}$ is the vibration velocity

MEMS gyroscopes keep a proof mass vibrating in one direction. When rotation exists, the Coriolis force produces displacement in the perpendicular direction, detected via capacitance to obtain angular velocity.

**Measurement**: Three-axis angular velocity $(\omega_x, \omega_y, \omega_z)$, in deg/s or rad/s.

### Magnetometer

**Principle**: Uses the Hall effect or magnetoresistive effect to measure the Earth's magnetic field direction.

**Measurement**: Three-axis magnetic field strength, used to compute heading (Yaw).

**Limitations**:

- Interfered by ferromagnetic materials (hard iron/soft iron errors)
- Indoor magnetic fields are non-uniform
- Requires calibration (ellipsoid fitting)

### IMU Configuration Classification

| Type | Sensor Combination | Measurable Quantities | Representative Products |
|------|-------------------|----------------------|------------------------|
| **6-axis** | Accelerometer + Gyroscope | Acceleration, angular velocity | MPU6050, BMI088 |
| **9-axis** | Accelerometer + Gyroscope + Magnetometer | Acceleration, angular velocity, heading | BNO055, MPU9250 |
| **10-axis** | 9-axis + Barometer | Above + altitude estimation | BMP388 combo |

## IMU Noise Model

IMU accuracy is affected by multiple noise sources. Understanding the noise model is crucial for sensor fusion.

### Main Noise Types

<div class="diagram">
<svg viewBox="0 0 560 580" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="280" y1="120" x2="195" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="365" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="260" x2="110" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="260" x2="280" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="260" x2="450" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="260" x2="110" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="260" x2="280" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="260" x2="450" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">IMU Noise Sources</text>
  <rect x="125" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Deterministic</text>
  <text x="195" y="246" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Errors</text>
  <rect x="295" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="295" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="365" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Random Errors</text>
  <rect x="40" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Bias Constant</text>
  <text x="110" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">offset</text>
  <rect x="210" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Scale Factor</text>
  <text x="280" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Error</text>
  <rect x="380" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Cross-Axis</text>
  <text x="450" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Coupling</text>
  <rect x="40" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="512" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Angle Random Walk</text>
  <text x="110" y="526" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">ARW White noise</text>
  <rect x="210" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Bias Instability</text>
  <rect x="380" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="505" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Rate Random Walk</text>
  <text x="450" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">RRW Low-frequency</text>
  <text x="450" y="533" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">drift</text>
</svg>
</div>


### Gyroscope Noise Model

Continuous-time model:

$$
\tilde{\omega}(t) = \omega(t) + b_g(t) + n_g(t)
$$

Where:

- $\tilde{\omega}(t)$ is the measurement
- $\omega(t)$ is the true angular velocity
- $b_g(t)$ is a slowly drifting bias
- $n_g(t)$ is Gaussian white noise, $n_g \sim \mathcal{N}(0, \sigma_g^2)$

Bias modeled as a random walk:

$$
\dot{b}_g(t) = n_{bg}(t), \quad n_{bg} \sim \mathcal{N}(0, \sigma_{bg}^2)
$$

### Accelerometer Noise Model

$$
\tilde{a}(t) = a(t) + b_a(t) + n_a(t)
$$

Similar structure to the gyroscope, but acceleration is integrated twice to obtain position, so errors accumulate faster:

$$
\delta p(t) \propto \frac{1}{2} b_a \cdot t^2 + \frac{1}{6} \sigma_a \cdot t^{5/2}
$$

!!! danger "Drift Problem in Inertial Navigation"
    Position error in pure inertial navigation (IMU only) grows with the square of time. Consumer-grade MEMS IMUs produce meter-level drift within seconds, so they must be fused with other sensors (GPS, LiDAR, vision).

### Key Noise Parameters

| Parameter | Symbol | Unit (Gyro) | Unit (Accel) | Meaning |
|-----------|--------|-------------|-------------|---------|
| Angle/Velocity Random Walk | ARW / VRW | deg/sqrt(h) | m/s/sqrt(h) | White noise intensity |
| Bias Instability | BI | deg/h | ug | Minimum detectable bias change |
| Bias Repeatability | Turn-on bias | deg/h | mg | Bias variation per power-on |
| Scale Factor Error | SF error | ppm | ppm | Proportional measurement error |

## Allan Variance Analysis

Allan variance is the standard method for characterizing IMU noise, identifying noise components by computing variance at different averaging times $\tau$.

$$
\sigma^2(\tau) = \frac{1}{2(N-1)} \sum_{k=1}^{N-1} \left( \bar{y}_{k+1} - \bar{y}_k \right)^2
$$

Where $\bar{y}_k$ is the average of the $k$-th interval of length $\tau$.

### Allan Variance Curve Interpretation

On a $\log \sigma$ vs. $\log \tau$ plot, different noise types correspond to different slopes:

| Noise Type | Slope | Characteristic |
|-----------|-------|---------------|
| Quantization noise | -1 | Appears at short $\tau$ |
| Angle Random Walk (ARW) | -1/2 | White noise, read at $\tau = 1s$ |
| Bias Instability (BI) | 0 | Minimum point of the curve |
| Rate Random Walk (RRW) | +1/2 | Appears at long $\tau$ |
| Rate ramp | +1 | Deterministic trends like temperature drift |

```python
import numpy as np
import allantools

# Compute Allan variance from IMU static data
# data: static samples from one gyroscope axis
# rate: sampling rate (Hz)
(taus, adevs, errors, ns) = allantools.oadev(
    data, rate=rate, data_type="freq"
)

# ARW: Allan deviation at tau=1
# BI: Minimum Allan deviation value
```

## Sensor Fusion Pipeline

<div class="diagram">
<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="95" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="175" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="255" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="175" x2="730" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="870" y1="175" x2="960" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1190" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1190" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1190" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1420" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Accelerometer</text>
  <rect x="270" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Attitude</text>
  <text x="340" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Estimation</text>
  <rect x="40" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Gyroscope</text>
  <rect x="40" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="230" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Magnetometer</text>
  <rect x="500" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Complementary</text>
  <text x="570" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Filter or EKF</text>
  <rect x="730" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Roll, Pitch, Yaw</text>
  <rect x="960" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1030" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Fusion with</text>
  <text x="1030" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">External Sensors</text>
  <rect x="1190" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1260" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">GPS -&gt; Position</text>
  <rect x="1190" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1260" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">LiDAR -&gt; SLAM</text>
  <rect x="1190" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="230" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1260" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Camera -&gt; VIO</text>
  <rect x="1420" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1490" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Wheel Odometry -&gt;</text>
  <text x="1490" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Velocity</text>
</svg>
</div>


### Attitude Representation

| Representation | Parameters | Advantages | Disadvantages |
|---------------|------------|-----------|---------------|
| Euler angles | 3 | Intuitive | Gimbal lock |
| Rotation matrix | 9 | No singularities | Parameter redundancy |
| Quaternion | 4 | No singularities, computationally efficient | Less intuitive |
| Rotation vector/axis-angle | 3 | Minimal parameterization | Singular near 0 degrees |

Quaternion update:

$$
\mathbf{q}_{k+1} = \mathbf{q}_k \otimes \begin{bmatrix} 1 \\ \frac{1}{2}\boldsymbol{\omega} \Delta t \end{bmatrix}
$$

## IMU Grade Classification

| Grade | Gyro Bias Stability | Representative Product | Application | Price |
|-------|--------------------|-----------------------|-------------|-------|
| Consumer | >10 deg/h | MPU6050, BMI160 | Smartphones, remotes | $1-5 |
| Industrial | 1-10 deg/h | BMI088, ADIS16465 | Drones, robots | $10-100 |
| Tactical | 0.1-1 deg/h | HG1120, STIM300 | Missiles, high-precision navigation | $1K-10K |
| Navigation | <0.01 deg/h | HG9900 | Inertial navigation systems | $50K+ |
| Strategic | <0.001 deg/h | Ring laser gyro | Submarines, ICBMs | $100K+ |

## References

- *Quaternion kinematics for the error-state Kalman filter* - Joan Sola
- *Strapdown Inertial Navigation Technology* - Titterton & Weston
- Bosch BMI088/BNO055 Datasheets
- InvenSense MPU6050 Datasheet
- Allan Variance Analysis Tutorial: IEEE Std 952-1997
