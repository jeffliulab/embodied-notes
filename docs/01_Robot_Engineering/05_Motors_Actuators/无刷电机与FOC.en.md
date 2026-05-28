# Brushless Motors and FOC

## Introduction

Brushless DC motors (BLDC) have become the mainstream motor choice for modern robots due to their high efficiency, high power density, and long lifespan. FOC (Field-Oriented Control) is the most advanced control algorithm for BLDC motors, enabling smooth, low-noise, and precise torque control.

## BLDC Three-Phase Structure

### Basic Components

| Component | Description |
|-----------|-------------|
| Stator | Laminated silicon steel core wound with three-phase windings (A/B/C) |
| Rotor | Permanent magnets (NdFeB neodymium), inner-rotor or outer-rotor |
| Position sensor | Hall sensors (3 units, spaced 120° apart) or encoder |

### Inner Rotor vs. Outer Rotor

| Type | Structure | Characteristics | Typical Applications |
|------|-----------|----------------|---------------------|
| Inner rotor | Magnets inside, windings outside | Low inertia, fast response | Industrial servos, robot joints |
| Outer rotor | Magnets outside, windings inside | High torque, smooth at low speed | Drones, hub motors |

### Slot-Pole Configuration

The number of slots (stator teeth) and poles (magnetic poles) determines performance characteristics:

- **Unitree Go2 motor**: 36-slot/42-pole (outer rotor), high torque density
- **Drone motors**: 12-slot/14-pole (outer rotor), common configuration
- **Industrial servos**: 12-slot/8-pole or 12-slot/10-pole (inner rotor)

!!! note "Slot-Pole Ratio Selection"
    The slot-pole ratio affects cogging torque. Ratios close to 3:2 (such as 12N14P, 36N42P) effectively reduce cogging torque for smoother operation.

## Commutation Methods

### Trapezoidal Commutation (Six-Step)

The simplest BLDC drive method:

- At any moment, only two phases are conducting while the third is floating
- 360° electrical angle is divided into 6 steps, each spanning 60°
- Hall sensors determine commutation timing

```
Step:  1    2    3    4    5    6
Ph A: +H   +H   OFF  -H   -H   OFF
Ph B: OFF  -H   -H   OFF  +H   +H  
Ph C: -H   OFF  +H   +H   OFF  -H
```

**Advantages**: Simple control, low hardware cost
**Disadvantages**: Large torque ripple (~14%), rough at low speed, noisy

### Sinusoidal Commutation

Three phases are driven with 120° phase-shifted sinusoidal currents:

$$
I_a = I_m \sin(\theta_e)
$$

$$
I_b = I_m \sin(\theta_e - 120°)
$$

$$
I_c = I_m \sin(\theta_e - 240°)
$$

**Advantages**: Low torque ripple, smooth operation
**Disadvantages**: Requires precise rotor position, cannot independently control torque and flux

### FOC (Field-Oriented Control)

FOC is currently the most advanced control algorithm for BLDC/PMSM motors, using coordinate transforms to convert AC quantities into DC quantities for control.

## FOC Control Principles

### Core Concept

Decompose three-phase AC currents into:

- **$I_d$ (direct-axis current)**: Controls magnetic flux (typically set to 0)
- **$I_q$ (quadrature-axis current)**: Directly controls torque

$$
\tau = \frac{3}{2} p \cdot \lambda_m \cdot I_q
$$

Where $p$ is the number of pole pairs and $\lambda_m$ is the permanent magnet flux linkage.

When $I_d = 0$, all current is used for torque production, maximizing efficiency.

### Coordinate Transformation Flow

```
Three-phase currents    Clarke Transform     Park Transform       PI Controllers
[Ia, Ib, Ic] ──────────→ [Iα, Iβ] ──────────→ [Id, Iq] ────→ [Vd, Vq]
                                                                    │
Motor ← SVPWM ← Inverse Park ← [Vα, Vβ] ←────────────────────────┘
```

### Clarke Transform (3-phase → 2-phase stationary)

Project three-phase currents onto an orthogonal $\alpha$-$\beta$ coordinate system:

$$
\begin{bmatrix} I_\alpha \\ I_\beta \end{bmatrix} = \frac{2}{3} \begin{bmatrix} 1 & -\frac{1}{2} & -\frac{1}{2} \\ 0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \end{bmatrix} \begin{bmatrix} I_a \\ I_b \\ I_c \end{bmatrix}
$$

### Park Transform (Stationary → Rotating)

Rotate the $\alpha$-$\beta$ frame to a $d$-$q$ frame synchronized with the rotor:

$$
\begin{bmatrix} I_d \\ I_q \end{bmatrix} = \begin{bmatrix} \cos\theta_e & \sin\theta_e \\ -\sin\theta_e & \cos\theta_e \end{bmatrix} \begin{bmatrix} I_\alpha \\ I_\beta \end{bmatrix}
$$

Where $\theta_e$ is the electrical angle (rotor electrical position).

### Inverse Transforms

After the controller outputs $V_d$ and $V_q$, inverse transforms are needed to convert back to three-phase:

**Inverse Park Transform**:

$$
\begin{bmatrix} V_\alpha \\ V_\beta \end{bmatrix} = \begin{bmatrix} \cos\theta_e & -\sin\theta_e \\ \sin\theta_e & \cos\theta_e \end{bmatrix} \begin{bmatrix} V_d \\ V_q \end{bmatrix}
$$

**SVPWM (Space Vector PWM)**: Converts $V_\alpha$ and $V_\beta$ into switching times for the three-phase bridge legs.

### FOC Control Loop

```
             ┌──────────────────────────────────────────┐
             │                                          │
Target torque → Iq_ref → [PI] → Vq ─┐                 │
                                      ├→ Inv. Park → SVPWM → Inverter → Motor
Id_ref=0 ──→ [PI] → Vd ──────────┘         ↑              │
             ↑    ↑                         │              │
             │    │              Elec. angle θe             │
             │    │                         ↑              │
             │    └── Park Transform ←── Clarke Transform ←── Current sampling ←┘
             │                              ↑
             └──────── Encoder ←────────────┘
```

## SimpleFOC Library

SimpleFOC is an open-source Arduino FOC library that lowers the entry barrier for BLDC motor control.

### Hardware Requirements

| Component | Description |
|-----------|-------------|
| MCU | ESP32 / STM32 / Arduino |
| Driver board | SimpleFOC Shield / L6234 / DRV8302 |
| Current sensor | In-line resistor / Hall (optional; not needed for voltage mode) |
| Position sensor | AS5600 magnetic encoder / Hall sensors / Incremental encoder |

### Code Example

```cpp
#include <SimpleFOC.h>

// Motor definition: pole pairs=7 (14 poles)
BLDCMotor motor = BLDCMotor(7);
// Driver: PWM pins
BLDCDriver3PWM driver = BLDCDriver3PWM(9, 5, 6, 8);  // A, B, C, enable
// Magnetic encoder
MagneticSensorI2C sensor = MagneticSensorI2C(AS5600_I2C);

void setup() {
    // Initialize encoder
    sensor.init();
    motor.linkSensor(&sensor);
    
    // Initialize driver
    driver.voltage_power_supply = 12;
    driver.init();
    motor.linkDriver(&driver);
    
    // FOC algorithm settings
    motor.foc_modulation = FOCModulationType::SinePWM;
    motor.controller = MotionControlType::torque;  // Torque mode
    
    // Voltage mode (no current sensor needed)
    motor.torque_controller = TorqueControlType::voltage;
    
    // PI velocity loop parameters (if using velocity mode)
    motor.PID_velocity.P = 0.2;
    motor.PID_velocity.I = 20;
    motor.voltage_limit = 6;
    
    motor.init();
    motor.initFOC();  // Calibrate encoder offset
    
    Serial.begin(115200);
    motor.useMonitoring(Serial);
}

float target_voltage = 2.0;

void loop() {
    motor.loopFOC();           // FOC core computation (as fast as possible)
    motor.move(target_voltage); // Set target
    motor.monitor();            // Serial monitor
    
    // Serial command interface
    // Input "T2.5" to set target voltage to 2.5V
    command.run();
}
```

### Control Modes

| Mode | Description | Current Sensor Required |
|------|-------------|------------------------|
| Torque-Voltage | Set Vq voltage (approximate torque) | No |
| Torque-Current | Precise current/torque control | Yes |
| Velocity | PID velocity closed-loop | Optional |
| Position | PID position closed-loop | Optional |

## Unitree Go2 Motor

The Unitree Go2 quadruped robot uses proprietary BLDC motors as a typical example of the QDD (Quasi-Direct Drive) approach.

### Motor Specifications

| Parameter | Value |
|-----------|-------|
| Type | BLDC outer rotor |
| Slot-pole | 36-slot / 42-pole |
| Gear ratio | ~6.33:1 (low ratio, quasi-direct drive) |
| Peak torque | ~23.7 N·m |
| Continuous torque | ~8 N·m |
| Weight | ~350 g (including reducer and encoder) |
| Feedback | 14-bit absolute encoder |
| Communication | CAN bus |

### QDD (Quasi-Direct Drive) Advantages

- Low gear ratio (4–9:1) → high backdrivability
- Robot joints can compliantly yield under external impacts, protecting the structure
- High torque transparency, suitable for force control and impedance control
- Trades some torque density for higher control bandwidth

## ODrive Controller

ODrive is an open-source, high-performance BLDC/PMSM driver with FOC support.

### ODrive S3

| Parameter | Value |
|-----------|-------|
| Drive channels | Dual-channel |
| Voltage range | 12–56V |
| Continuous current | 40A/channel |
| Control method | FOC (current loop bandwidth >5 kHz) |
| Encoder support | Incremental / SPI absolute / Hall |
| Communication | USB / CAN / UART / SPI |
| Processor | STM32 |

### ODrive Basic Usage

```python
import odrive

# Discover and connect to ODrive
odrv0 = odrive.find_any()

# Configure motor parameters
odrv0.axis0.motor.config.current_lim = 10          # Current limit 10A
odrv0.axis0.motor.config.pole_pairs = 7            # Pole pairs
odrv0.axis0.motor.config.torque_constant = 0.04    # Torque constant

# Configure encoder
odrv0.axis0.encoder.config.cpr = 4096  # Encoder resolution

# Calibration
odrv0.axis0.requested_state = AXIS_STATE_FULL_CALIBRATION_SEQUENCE

# Enter closed-loop control
odrv0.axis0.requested_state = AXIS_STATE_CLOSED_LOOP_CONTROL

# Position control
odrv0.axis0.controller.config.control_mode = CONTROL_MODE_POSITION_CONTROL
odrv0.axis0.controller.input_pos = 10.0  # Target: 10 turns

# Velocity control
odrv0.axis0.controller.config.control_mode = CONTROL_MODE_VELOCITY_CONTROL
odrv0.axis0.controller.input_vel = 2.0  # Target: 2 turns/s

# Torque control
odrv0.axis0.controller.config.control_mode = CONTROL_MODE_TORQUE_CONTROL
odrv0.axis0.controller.input_torque = 0.5  # Target: 0.5 N·m
```

## Commutation Method Comparison

| Feature | Trapezoidal (Six-Step) | Sinusoidal | FOC |
|---------|----------------------|-----------|-----|
| Torque ripple | ~14% | ~5% | <1% |
| Efficiency | Medium | Fairly high | Highest |
| Low-speed performance | Poor | Fair | Excellent |
| Noise | Loud | Medium | Quiet |
| Position sensor | Hall (60° resolution) | Encoder | Encoder |
| Computation | Low | Medium | High |
| Suitable for | Fans, simple drives | General applications | Robots, precision control |

## Sensorless FOC

Estimates rotor position without physical position sensors by observing back-EMF:

### Common Methods

- **Back-EMF zero-crossing detection**: Works at medium-to-high speed, fails at low speed
- **Sliding Mode Observer (SMO)**: Robust, but has chattering
- **Extended Kalman Filter (EKF)**: High accuracy, computationally expensive
- **High-frequency injection**: Works at low and zero speed, requires motor saliency

!!! tip "Practical Choice"
    Robotics applications typically use sensored FOC with encoders, since precise position and torque control are needed. Sensorless FOC is mainly used in cost-sensitive consumer electronics (power tools, appliances).

## Summary

- BLDC motors replace mechanical brushes with electronic commutation, greatly improving lifespan and efficiency
- FOC uses Clarke and Park transforms to convert AC control into DC control for precise torque regulation
- The SimpleFOC library brings FOC control to the Arduino ecosystem
- The Unitree Go2 motor exemplifies the QDD approach, balancing torque and backdrivability
- ODrive provides an open-source, high-performance dual-channel FOC drive solution
