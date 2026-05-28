# Stepper Motor

> *Stepper motors move in discrete steps, allowing precise positioning without feedback. Commonly used in 3D printers, CNC, scanners, robots. This article covers principle, drivers, control strategies.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Brushless Motor & FOC](无刷电机与FOC.en.md), magnetic circuit basics

---

## 1. Working Principle

Stator has multiple coil pairs; rotor has teeth:
- Energize one phase → rotor aligns
- Sequential energizing → rotor steps rotate

Common:
- **1.8° / step** (200 steps/rev) — standard
- **0.9° / step** (400 steps/rev) — high precision
- Microstepping → 1/16, 1/256 step

---

## 2. Types

### 2.1 Permanent Magnet (PM)

- Rotor has permanent magnet
- Lower torque
- Cheap

### 2.2 Variable Reluctance (VR)

- Rotor only soft iron
- No detent torque (no holding when off)
- Less common

### 2.3 Hybrid (HB)

- PM + VR advantages
- Mainstream (most steppers are HB)
- NEMA 17, NEMA 23 shapes

---

## 3. Control Modes

### 3.1 Full Step

- One phase ON at a time
- 200 step/rev (1.8°)
- Simple but jerky

### 3.2 Half Step

- Alternating single and dual phase ON
- 400 step/rev
- Smoother

### 3.3 Microstepping

- PWM controls phase current ratio
- 1/16, 1/32, 1/256 microsteps
- Very smooth but slight torque reduction

---

## 4. Driver IC

- **A4988** (Allegro): entry-level, 2A, 1/16 microstep
- **DRV8825** (TI): 2.2A, 1/32
- **TMC2208 / TMC2209** (Trinamic): silent (StealthChop), $5-10
- **TMC5160**: high power, SPI control
- **L297 + L298**: older discrete

---

## 5. NEMA Standard

NEMA = National Electrical Manufacturers Association frame size:
- NEMA 17: 42 mm square, ~40-50 N·cm torque
- NEMA 23: 57 mm, ~100-300 N·cm
- NEMA 34: 86 mm, large torque

---

## 6. Stepper vs Servo

| Aspect | Stepper | Servo |
|---|---|---|
| Feedback | Usually none (open-loop) | Always (encoder) |
| Precision | Medium (step-defined) | High |
| Torque | High at low speed, drops at high | Flat |
| Control | Simple | Complex (PID) |
| Cost | Low | High |
| Apps | 3D printing, CNC | Industrial robots, conveyor |

---

## 7. Arduino — Simple Stepper Control

```cpp
#define STEP_PIN 3
#define DIR_PIN 4

void setup() {
    pinMode(STEP_PIN, OUTPUT);
    pinMode(DIR_PIN, OUTPUT);
    digitalWrite(DIR_PIN, HIGH);
}

void step_motor(int steps, int delay_us = 500) {
    for (int i = 0; i < steps; i++) {
        digitalWrite(STEP_PIN, HIGH);
        delayMicroseconds(delay_us);
        digitalWrite(STEP_PIN, LOW);
        delayMicroseconds(delay_us);
    }
}

void loop() {
    step_motor(200);
    delay(1000);
    digitalWrite(DIR_PIN, !digitalRead(DIR_PIN));
}
```

---

## 8. Acceleration / Deceleration

Direct step → motor stalls. Need acceleration ramp:
- Trapezoidal velocity profile
- S-curve (smooth jerk)
- AccelStepper Arduino library

---

## 9. Common Problems

### 9.1 Stall

Load exceeds torque → lost steps. No feedback to know.
Solution: closed-loop encoder (Mechaduino, TMC StallGuard).

### 9.2 Resonance

Specific frequency oscillates. Microstepping + acceleration ramp mitigates.

### 9.3 Heating

Coil long-time hold current → 80°C+. Need enable timeout or cooling.

### 9.4 Noise

Full / half step high-frequency buzz. TMC StealthChop is silent.

### 9.5 Power

High-current driver → large power supply + heat sink needed.

---

## 10. Application Examples

- **3D printer**: X/Y/Z + extruder, 4 steppers
- **CNC router**: 3-5 steppers
- **Scanner**: laser positioning
- **Telescope**: tracking + focus
- **Semiconductor wafer**: precision positioning

---

## 11. Common Pitfalls

### 11.1 Not Using Driver

Direct GPIO drive → insufficient current + short circuit risk.

### 11.2 Microstep Accuracy Illusion

Microstepping smooths but accuracy still limited by motor.

### 11.3 Hold Current

Coil energized when stopped → heat + power consumption.

### 11.4 Direction Wrong

Direction signal or pole wiring wrong → reverse / lost steps.

### 11.5 High-speed Stalls

Stepper torque drops sharply at high speed; consider BLDC + encoder for high speed.

---

## 12. Related Concepts

- **Same section**: [Brushless Motor & FOC](无刷电机与FOC.en.md), [Reducer](减速器.en.md)
- **Control**: [Control Theory](../00_Foundations/Control_Theory.en.md)

---

## References

1. **Acarnley, P. P.** *Stepping Motors: A Guide to Theory and Practice*. 4th ed., IET, 2002.
2. **Allegro / Trinamic** stepper driver datasheets.
3. **AccelStepper Arduino library** documentation.
