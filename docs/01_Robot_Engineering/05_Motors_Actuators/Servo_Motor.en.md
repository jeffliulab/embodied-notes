# Servo Motor

> *Servo motor = motor + encoder + controller + communication. Closed-loop precise position / velocity / torque control. From hobby servos in model planes to 100kW AC servos in industrial robots.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Brushless Motor & FOC](无刷电机与FOC.en.md), [Stepper Motor](Stepper_Motor.en.md)

---

## 1. Servo vs Others

| Aspect | Hobby Servo | Industrial AC Servo | Stepper |
|---|---|---|---|
| Feedback | potentiometer | high-resolution encoder | none |
| Position precision | ±1° | ±0.001° | discrete step |
| Control | PWM duty | EtherCAT / CANopen | step pulse |
| Speed | 60 RPM | 6000 RPM | 1000 RPM |
| Torque | 1 N·cm | 100 N·m+ | 100 N·cm |
| Price | $5-50 | $500-10000 | $50-500 |
| Application | RC, hobby | robots, CNC | 3D printer |

---

## 2. Hobby Servo (RC Servo)

```
PWM signal (50 Hz, 1-2 ms pulse width)
   1.0 ms → 0°
   1.5 ms → 90°
   2.0 ms → 180°
```

Internal: DC motor + reduction + potentiometer + control IC.
Negative feedback PID.

Examples: SG90 ($3, 1.8 kg·cm), MG996R ($10, 11 kg·cm).

---

## 3. Industrial AC Servo

Components:
- **AC Servo Motor** (PMSM)
- **Encoder** (incremental + absolute, 17-23 bit)
- **Servo Drive** (FOC controller)
- **Controller** (PLC / motion controller)
- **Communication** (EtherCAT, CANopen, EtherNet/IP)

Major brands: Yaskawa Sigma-7, Mitsubishi MR-J5, Fanuc, Siemens Sinamics, Delta, ABB.

---

## 4. Three-Loop Control

```
Position cmd
   ↓
Position loop (PID, slow ~1 ms)
   ↓
Velocity cmd
   ↓
Velocity loop (PI, ~100 μs)
   ↓
Torque cmd
   ↓
Current loop (PI, ~10 μs, FOC)
   ↓
Motor PWM
```

Each loop updates at different speed → nested control architecture.

---

## 5. Main Parameters

- **Rated power**: W / kW
- **Rated torque**: N·m
- **Rated speed**: RPM
- **Max speed**: 2-3× rated
- **Inertia**: kg·m² (matched to load)
- **Encoder resolution**: 17/20/23 bit / rev

---

## 6. Tuning

PID:
- **Auto-tuning**: modern servos built-in (Yaskawa Sigma-7 auto tune in seconds)
- **Manual tuning**: tune P → I → D order
- **Load inertia ratio**: critical (high ratio → easy oscillation)

---

## 7. PyTorch / Python — Hobby Servo PWM

```python
from machine import PWM, Pin

servo = PWM(Pin(15), freq=50)

def set_angle(angle):
    pulse_ms = 1.0 + (angle / 180.0)
    duty = int(pulse_ms / 20 * 65535)
    servo.duty_u16(duty)

set_angle(90)
```

---

## 8. EtherCAT Servo (Industrial)

```
Master (controller PLC) ←→ Slave 1 (servo drive 1)
                       ←→ Slave 2 (servo drive 2)
                       ...
```

- 100 Mbps Ethernet, 1 ms cycle time
- Multi-axis sync (μs jitter)
- Data: target position, actual position, torque, fault

---

## 9. Applications

- **CNC machine**: 3-5 servos (XYZ + spindle + tool changer)
- **Industrial robot** (6-DOF): 6 servos
- **Pick-and-place**: SCARA 4 servos
- **Conveyor**: 1-2 servos for speed control
- **Aerospace**: flight control surface servos

---

## 10. Common Pitfalls

### 10.1 Inertia Mismatch

Load inertia ≫ motor inertia → oscillation.
Ideal ratio: 1:1 to 5:1.

### 10.2 Encoder Noise

EMI interferes with encoder → wrong position. Shielded cable.

### 10.3 Torque Saturation

Insufficient max torque during acceleration → tracking error. Check sizing.

### 10.4 Thermal Limit

Long-time high torque → motor overheats → derating.

### 10.5 PWM Frequency

Hobby servos can't use 30 / 100 Hz (only 50 Hz).

---

## 11. Related Concepts

- **Same section**: [Brushless Motor & FOC](无刷电机与FOC.en.md), [Stepper Motor](Stepper_Motor.en.md), [Reducer](减速器.en.md)
- **Communication**: [Ethernet & EtherCAT](../08_Communication_Networks/以太网与EtherCAT.en.md)

---

## References

1. **Yaskawa Sigma-7 manual**.
2. **Schneider Electric** servo motor technical guide.
3. **Krishnan, R.** *Permanent Magnet Synchronous and Brushless DC Motor Drives*. CRC, 2010.
