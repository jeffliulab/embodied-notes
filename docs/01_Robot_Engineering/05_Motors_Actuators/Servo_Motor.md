# 伺服电机 (Servo Motor)

> *Servo motor = motor + encoder + 控制器 + 通信。Closed-loop precise position / velocity / torque control。从模型飞机的 hobby servo 到工业机器人的 100kW AC servo。*
>
> **难度**:Intermediate
> **前置知识**:[无刷电机与 FOC](无刷电机与FOC.md)、[Stepper Motor](Stepper_Motor.md)

---

## 1. Servo vs 其他

| 维度 | Hobby Servo | 工业 AC Servo | Stepper |
|---|---|---|---|
| Feedback | potentiometer | 高 resolution encoder | none |
| 位置精度 | ± 1° | ± 0.001° | discrete step |
| 控制 | PWM duty | EtherCAT / CANopen | step pulse |
| 速度 | 60 RPM | 6000 RPM | 1000 RPM |
| Torque | 1 N·cm | 100 N·m+ | 100 N·cm |
| 价格 | $5-50 | $500-10000 | $50-500 |
| 应用 | RC, hobby | 机器人, CNC | 3D printer |

---

## 2. Hobby Servo (RC Servo)

```
PWM signal (50 Hz, 1-2 ms pulse width)
   1.0 ms → 0°
   1.5 ms → 90°  
   2.0 ms → 180°
```

内部:DC motor + 减速 + potentiometer + 控制 IC。
负反馈 PID。

例:SG90 ($3, 1.8 kg·cm), MG996R ($10, 11 kg·cm)。

---

## 3. 工业 AC Servo

构成:
- **AC Servo Motor** (PMSM, permanent magnet synchronous)
- **Encoder** (incremental + absolute, 17-23 bit)
- **Servo Drive** (FOC控制器)
- **Controller** (PLC / motion controller)
- **Communication** (EtherCAT, CANopen, EtherNet/IP)

主流品牌:Yaskawa Sigma-7, Mitsubishi MR-J5, Fanuc, Siemens Sinamics, Delta, ABB。

---

## 4. 三 loop 控制

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

每 loop 更新 速度 不同 → 嵌套 control 架构。

---

## 5. 主要参数

- **Rated power**: W / kW
- **Rated torque**: N·m
- **Rated speed**: RPM
- **Max speed**: 2-3× rated
- **Inertia**: kg·m² (matched 与 load)
- **Encoder resolution**: 17/20/23 bit / rev

---

## 6. Tuning

PID 调:
- **Auto-tuning**: 现代 servo 内置 (Yaskawa Sigma-7 auto tune in seconds)
- **Manual tuning**: 调 P → I → D order
- **Load inertia ratio**: 关键参数 (ratio 高 → easy oscillation)

---

## 7. PyTorch / Python — Hobby Servo PWM

```python
# Arduino-style pseudo code
from machine import PWM, Pin

servo = PWM(Pin(15), freq=50)  # 50 Hz

def set_angle(angle):
    # angle 0-180 → 1.0-2.0 ms pulse
    # PWM duty: pulse_ms / period_ms (20ms)
    pulse_ms = 1.0 + (angle / 180.0)
    duty = int(pulse_ms / 20 * 65535)
    servo.duty_u16(duty)

set_angle(90)  # center
```

---

## 8. EtherCAT Servo (工业)

```
Master (controller PLC) ←→ Slave 1 (servo drive 1)
                       ←→ Slave 2 (servo drive 2)
                       ...
```

- 100 Mbps Ethernet, 1 ms cycle time
- 同步多轴 (μs jitter)
- 数据:目标位置, 实际位置, torque, fault

---

## 9. 应用

- **CNC machine**: 3-5 servo (XYZ + spindle + tool changer)
- **Industrial robot** (6-DOF): 6 servo
- **Pick-and-place**: SCARA 4 servo
- **Conveyor**: 1-2 servo for speed control
- **Aerospace**: 飞控面伺服

---

## 10. Common Pitfalls

### 10.1 Inertia mismatch

负载惯量 ≫ motor 惯量 → 振动。
理想 ratio: 1:1 to 5:1。

### 10.2 Encoder noise

EMI 干扰 encoder → 错误 position。Shielded cable。

### 10.3 Torque saturation

加速时 max torque 不够 → 跟随 error。Sizing 检查。

### 10.4 Thermal limit

长时间 high torque → motor 过热 → derating。

### 10.5 PWM 频率

Hobby servo 不能用 30 / 100 Hz (only 50 Hz)。

---

## 11. Related Concepts

- **同节**:[无刷电机与 FOC](无刷电机与FOC.md)、[Stepper Motor](Stepper_Motor.md)、[减速器](减速器.md)
- **通信**:[以太网与 EtherCAT](../08_Communication_Networks/以太网与EtherCAT.md)

---

## References

1. **Yaskawa Sigma-7 manual**.
2. **Schneider Electric** servo motor technical guide.
3. **Krishnan, R.** *Permanent Magnet Synchronous and Brushless DC Motor Drives*. CRC, 2010.
