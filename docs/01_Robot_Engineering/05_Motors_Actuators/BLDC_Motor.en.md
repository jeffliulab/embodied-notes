# BLDC Motor (Brushless DC)

> *BLDC is the workhorse motor for robots / drones / EVs / industrial automation. No brushes = longer life, high efficiency, low noise. Commutation by ESC (Electronic Speed Controller) + Hall / encoder. Outrunner (drones) vs Inrunner (CNC). FOC (Field Oriented Control) is the modern precision algorithm. Tesla / Optimus / Figure all use BLDC.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: Basic EM, PWM, [Power Electronics](../01_Electrical_Engineering/Power_Electronics.en.md)

---

## 1. Structure

- **Stator**: 3-phase windings (120° offset)
- **Rotor**: permanent magnets (NdFeB)
- **Hall sensor / encoder**: rotor position
- **ESC**: 6-FET inverter, commutation

No brush (mechanical commutators are brushed DC) → longer life.

---

## 2. Working Principle

- 3-phase AC creates rotating magnetic field
- Rotor permanent magnet follows stator field
- Angle match → max torque
- Must know rotor position → determine commutation timing

---

## 3. Commutation Modes

### 3.1 Trapezoidal (Six-Step)

- 3 Hall sensors → 6 states → 6-step commutation
- Simple, high torque ripple
- Common in toys, tools

### 3.2 Sinusoidal

- Smooth sine-wave drive
- Low torque ripple
- Requires encoder

### 3.3 FOC (Field Oriented Control)

- Modern precision control
- Park / Clarke transforms → d-q axes
- Iq (torque) and Id (flux) controlled separately
- Open-source libs: SimpleFOC, ODrive, Moteus

---

## 4. FOC Math

Clarke (3-phase → 2-phase α-β):
$$i_\alpha = i_a, \quad i_\beta = \frac{1}{\sqrt{3}}(i_a + 2 i_b)$$

Park (α-β → d-q rotor frame):
$$i_d = i_\alpha \cos\theta + i_\beta \sin\theta$$
$$i_q = -i_\alpha \sin\theta + i_\beta \cos\theta$$

- Id = 0 (no flux for torque)
- Iq = torque demand
- PI control → SVPWM → FET

---

## 5. Outrunner vs Inrunner

| Dimension | Outrunner | Inrunner |
|---|---|---|
| Rotor position | Outside | Inside |
| Torque | High | Low |
| Speed | Low | High |
| Application | UAV, e-skate | RC car, CNC spindle, Tesla |

---

## 6. Parameters

- **Kv**: rpm/V (no load)
- **Kt**: torque constant (N·m/A)
- **R**: phase resistance (Ω)
- **L**: phase inductance (mH)
- **Pole pairs**: 4-14 common

Electrical speed = mechanical speed × pole pairs.

---

## 7. ESC (Electronic Speed Controller)

```
DC battery
   ↓
6 MOSFET (3-phase H-bridge)
   ↓ ↓ ↓
3-phase AC → BLDC
   ↑
MCU (STM32 / ESP32) + Gate driver
   ↑
Hall / encoder feedback
```

PWM frequency 16-40 kHz (ultrasonic → silent).

---

## 8. Python — SimpleFOC-like Pseudocode

```python
class FOCController:
    def __init__(self, Kp=0.5, Ki=0.1):
        self.Kp = Kp
        self.Ki = Ki
        self.integral_iq = 0
    
    def update(self, iq_target, iq_measured, dt):
        error = iq_target - iq_measured
        self.integral_iq += error * dt
        Vq = self.Kp * error + self.Ki * self.integral_iq
        Vd = 0  # no flux
        return Vd, Vq
```

---

## 9. Robotic Applications

| Application | BLDC choice |
|---|---|
| Drone propeller | Outrunner, Kv 800-2500 |
| Joint (Optimus, Boston Dynamics) | Low-speed high-torque + harmonic reducer |
| Quadruped (Spot, ANYmal) | Direct-drive or quasi-direct |
| Warehouse AGV | Medium-speed BLDC + gearbox |
| EV motor | High-power PMSM (same family as BLDC) |
| Industrial servo | PMSM standard |

---

## 10. Open-Source FOC Projects

- **SimpleFOC**: Arduino-friendly, great for learning
- **ODrive**: High-power, 2-axis
- **Moteus** (mjbots): Embedded quasi-direct
- **VESC**: E-skate / e-bike

---

## 11. Common Pitfalls

### 11.1 Hall vs Encoder

3 Halls: 6-step simple, coarse. Encoder: required for FOC + sinusoidal.

### 11.2 Cogging Torque

Inherent magnetic detent, slow-speed vibration. Slot/pole ratio design + sinusoidal mitigates.

### 11.3 Back-EMF

Rotation → back-EMF. High-speed limit + braking can regenerate.

### 11.4 Overcurrent

Reverse / stall → large current. ESC must have current limit.

### 11.5 BLDC vs PMSM

Engineering nearly identical (BLDC usually trapezoidal, PMSM sinusoidal), same family.

---

## 12. Related Concepts

- **Same section**: [Stepper Motor](Stepper_Motor.en.md), [Servo Motor](Servo_Motor.en.md)
- **Electrical**: [Power Electronics](../01_Electrical_Engineering/Power_Electronics.en.md)
- **Robotics**: [ROS2_Basics](../10_Robot_Integration/ROS2_Basics.en.md)

---

## References

1. **Krishnan, R.** *Permanent Magnet Synchronous and Brushless DC Motor Drives*. 2010.
2. **Mohan, N.** *Electric Drives — An Integrative Approach*. 4th ed., 2014.
3. **SimpleFOC** Documentation — https://docs.simplefoc.com/
4. **Hughes, A. & Drury, B.** *Electric Motors and Drives*. 5th ed., 2019.
