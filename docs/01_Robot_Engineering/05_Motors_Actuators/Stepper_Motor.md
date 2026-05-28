# 步进电机 (Stepper Motor)

> *步进电机以离散步数运动,无需 feedback 即可精准定位。常用于 3D 打印机、CNC、扫描仪、机器人。本篇覆盖原理、driver、控制策略。*
>
> **难度**:Intermediate
> **前置知识**:[无刷电机与 FOC](无刷电机与FOC.md)、磁路基础

---

## 1. 工作原理

定子有 multiple coil pairs;rotor 有齿:
- 给某 phase 通电 → rotor 对齐
- 顺序通电 → rotor step rotate

常见:
- **1.8° / step** (200 steps/rev) — 标准
- **0.9° / step** (400 steps/rev) — 高精
- Microstepping → 1/16, 1/256 step

---

## 2. 类型

### 2.1 Permanent Magnet (PM)

- Rotor 有永磁
- 较低 torque
- 价格便宜

### 2.2 Variable Reluctance (VR)

- Rotor 仅 soft iron
- 无 detent torque (off 时无锁)
- 较少见

### 2.3 Hybrid (HB)

- PM + VR 优点
- 主流 (大多数 stepper 是 HB)
- NEMA 17, NEMA 23 形状

---

## 3. 控制 mode

### 3.1 Full Step

- 每次 1 phase ON
- 200 step/rev (1.8°)
- 易但抖

### 3.2 Half Step

- 单 phase 与 两 phase ON 交替
- 400 step/rev
- 更平滑

### 3.3 Microstepping

- 用 PWM 控制 phase current 比例
- 1/16, 1/32, 1/256 microsteps
- 极平滑,但 torque 略降

---

## 4. Driver IC

- **A4988** (Allegro): 入门,2A, 1/16 microstep
- **DRV8825** (TI): 2.2A, 1/32
- **TMC2208 / TMC2209** (Trinamic): silent (StealthChop), $5-10
- **TMC5160**: high power, SPI control
- **L297 + L298**: 老式 discrete

---

## 5. NEMA 标准

NEMA = National Electrical Manufacturers Association,frame size:
- NEMA 17: 42 mm 方,~ 40-50 N·cm torque
- NEMA 23: 57 mm,~ 100-300 N·cm
- NEMA 34: 86 mm,大 torque

---

## 6. 步进 vs 伺服

| 维度 | Stepper | Servo |
|---|---|---|
| Feedback | 通常无 (open-loop) | 必有 (encoder) |
| 精度 | 中 (步定) | 高 |
| Torque | 高 at low speed, 落快 at high | 平 |
| 控制 | 简单 | 复杂 (PID) |
| 成本 | 低 | 高 |
| 应用 | 3D 打印, CNC | 工业机器人, conveyor |

---

## 7. PyTorch / Arduino — 简单步进控制

```cpp
// Arduino + A4988
#define STEP_PIN 3
#define DIR_PIN 4

void setup() {
    pinMode(STEP_PIN, OUTPUT);
    pinMode(DIR_PIN, OUTPUT);
    digitalWrite(DIR_PIN, HIGH);  // direction
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
    step_motor(200);  // 1 revolution
    delay(1000);
    digitalWrite(DIR_PIN, !digitalRead(DIR_PIN));  // reverse
}
```

---

## 8. 加速 / 减速曲线

直接 step → motor stall。需要 acceleration ramp:
- Trapezoidal velocity profile
- S-curve (smooth jerk)
- AccelStepper Arduino 库

---

## 9. 常见问题

### 9.1 Stall

负载超 torque → 失步。无 feedback 不知。
解决:加 closed-loop encoder (Mechaduino, TMC StallGuard)。

### 9.2 共振

特定 frequency 振动大。Microstepping + acceleration ramp 缓解。

### 9.3 发热

Coil 长时间 hold current → 80°C+。需 enable timeout 或散热。

### 9.4 噪音

Full / half step 高频蜂鸣。TMC StealthChop 静音。

### 9.5 Power

高电流 driver → 需大电源 + 散热片。

---

## 10. 应用例子

- **3D 打印机**: X/Y/Z + extruder 共 4 个 stepper
- **CNC router**: 3-5 stepper
- **扫描仪**: laser positioning
- **天文望远镜**: 跟踪 + 调焦
- **半导体晶圆**: precision positioning

---

## 11. Common Pitfalls

### 11.1 不用 driver

直接 GPIO 驱动 → 电流不够 + 短路风险。

### 11.2 微步精度错觉

Microstepping 提平滑度,但精度仍受 motor 限制。

### 11.3 Hold current

停止时 coil 仍通电 → 热 + 耗 power。

### 11.4 反转

Direction 错或电极接反 → 反向运动 / 失步。

### 11.5 高速 stalls

Stepper 高速 torque 急降;高速场景考虑 BLDC + encoder。

---

## 12. Related Concepts

- **同节**:[无刷电机与 FOC](无刷电机与FOC.md)、[减速器](减速器.md)
- **控制**:[控制理论](../00_Foundations/Control_Theory.md)

---

## References

1. **Acarnley, P. P.** *Stepping Motors: A Guide to Theory and Practice*. 4th ed., IET, 2002.
2. **Allegro / Trinamic** stepper driver datasheets.
3. **AccelStepper Arduino library** documentation.
