# 无刷直流电机 (BLDC Motor)

> *BLDC 是机器人 / 无人机 / EV / 工业自动化主力电机。无电刷 = 寿命长、高效、低噪。换向由 ESC (Electronic Speed Controller) + Hall / encoder 控制。Outrunner (无人机) vs Inrunner (CNC)。FOC (Field Oriented Control) 是当代精控算法。Tesla / Optimus / Figure 全用 BLDC。*
>
> **难度**:Intermediate
> **前置知识**:基础电磁、PWM、[Power Electronics](../01_Electrical_Engineering/Power_Electronics.md)

---

## 1. 结构

- **Stator**: 3 phase 绕组(120° offset)
- **Rotor**: 永磁体(NdFeB)
- **Hall sensor / encoder**: 测 rotor 位
- **ESC**: 6-FET inverter,控换向

无 brush(用 mechanical commutator 的是 brushed DC),寿命延长。

---

## 2. 工作原理

- 3 phase AC 旋转磁场
- Rotor 永磁随 stator 磁场旋转
- 角度匹配 → torque max
- 必须知 rotor 位置 → 确定换向时刻

---

## 3. 换向方式

### 3.1 Trapezoidal (六步)

- 3 Hall sensor → 6 状态 → 6 步换向
- 简,torque ripple 大
- 玩具 / 工具 普遍

### 3.2 Sinusoidal

- 平滑正弦波驱动
- Torque ripple 小
- 需要 encoder

### 3.3 FOC (Field Oriented Control)

- 当代精控
- Park / Clarke 变换 → d-q 轴
- Iq (torque) 和 Id (flux) 分开控
- 用 SimpleFOC、ODrive、Moteus 等开源 库

---

## 4. FOC 数学

Clarke (3 phase → 2 phase α-β):
$$i_\alpha = i_a, \quad i_\beta = \frac{1}{\sqrt{3}}(i_a + 2 i_b)$$

Park (α-β → d-q rotor frame):
$$i_d = i_\alpha \cos\theta + i_\beta \sin\theta$$
$$i_q = -i_\alpha \sin\theta + i_\beta \cos\theta$$

- Id = 0 (no flux 给力)
- Iq = torque demand
- PI 控 → SVPWM → FET

---

## 5. Outrunner vs Inrunner

| 维度 | Outrunner | Inrunner |
|---|---|---|
| Rotor 位置 | 外 | 内 |
| Torque | 高 | 低 |
| Speed | 低 | 高 |
| 应用 | UAV、电动滑板 | RC car、CNC spindle、Tesla |

---

## 6. 参数

- **Kv**: rpm/V(无负载)
- **Kt**: torque constant (N·m/A)
- **R**: 相阻 (Ω)
- **L**: 相电感 (mH)
- **Pole pairs**: 4-14 普通

电气速度 = 机械速度 × pole pairs。

---

## 7. ESC (Electronic Speed Controller)

```
DC battery
   ↓
6 MOSFET (3 phase H-bridge)
   ↓ ↓ ↓
3 phase AC → BLDC
   ↑
MCU (STM32 / ESP32) + Gate driver
   ↑
Hall / encoder feedback
```

PWM frequency 16-40 kHz(超声 → 静音)。

---

## 8. Python — SimpleFOC 类似伪码

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

## 9. 机器人应用

| 应用 | BLDC 选 |
|---|---|
| 无人机 propeller | Outrunner,Kv 800-2500 |
| 关节(Optimus、Boston Dynamics) | 低速大扭矩 + harmonic reducer |
| Quadruped (Spot、ANYmal) | Direct-drive 或 quasi-direct |
| 仓库 AGV | 中速 BLDC + 减速箱 |
| EV motor | 高功率 PMSM (与 BLDC 同族) |
| 工业 servo | PMSM 标 |

---

## 10. 开源 FOC 项目

- **SimpleFOC**: Arduino-friendly,教学好
- **ODrive**: 高功率,2-axis
- **Moteus** (mjbots): 嵌入 quasi-direct
- **VESC**: 电动滑板 / E-bike

---

## 11. 常见问题

### 11.1 Hall vs Encoder

3 Hall:6-step 简,粗。Encoder:FOC + sinusoidal 必。

### 11.2 Cogging Torque

固有 magnetic detent,慢速振动。Slot/pole 比设计 + sinusoidal 减弱。

### 11.3 反电势

旋转 → back-EMF。高速 limit + braking 能回收。

### 11.4 Overcurrent

转向逆转 / 卡住 → 大电流。ESC 必 current limit。

### 11.5 BLDC vs PMSM

工程上几乎同(BLDC 通常 trapezoidal、PMSM sinusoidal),家族关系。

---

## 12. Related Concepts

- **同节**:[Stepper Motor](Stepper_Motor.md)、[Servo Motor](Servo_Motor.md)
- **电气**:[Power Electronics](../01_Electrical_Engineering/Power_Electronics.md)
- **机器人**:[ROS2_Basics](../10_Robot_Integration/ROS2_Basics.md)

---

## References

1. **Krishnan, R.** *Permanent Magnet Synchronous and Brushless DC Motor Drives*. 2010.
2. **Mohan, N.** *Electric Drives — An Integrative Approach*. 4th ed., 2014.
3. **SimpleFOC** Documentation — https://docs.simplefoc.com/
4. **Hughes, A. & Drury, B.** *Electric Motors and Drives*. 5th ed., 2019.
