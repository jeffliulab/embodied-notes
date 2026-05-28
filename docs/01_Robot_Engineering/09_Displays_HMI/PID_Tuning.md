# PID 控制器与调参 (PID Control & Tuning)

> *PID (Proportional-Integral-Derivative) 1922 Minorsky 海军舵机首用,百年仍是工业最普遍 controller。无模型、可解释、调参直觉。机器人 motor、温度、压力、PLC 普遍。Ziegler-Nichols (1942) + lambda tuning + auto-tuning。Anti-windup、derivative kick 等细节决定 production 表现。*
>
> **难度**:Intermediate
> **前置知识**:[Control_Theory](../00_Foundations/Control_Theory.md)、Laplace 变换

---

## 1. PID 公式

时域:
$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}$$

Laplace:
$$U(s) = K_p E(s) + \frac{K_i}{s} E(s) + K_d s E(s)$$

3 项作用:
- **P**: 立即响应,稳态 error
- **I**: 消稳态 error,但有 overshoot
- **D**: 阻尼,减 overshoot,但 noise 敏感

---

## 2. P-only

```
e ──→ [Kp] ──→ u
```

- 简单
- 一阶 plant 稳态 error 不为 0
- offset 永留

---

## 3. PI

- 消 offset(I 累积 error → output)
- 但 overshoot ↑
- 大多数应用 sufficient(温度、流量)

---

## 4. PID

- I 消稳态 + D 减 overshoot
- 但 D 放大 noise → 需 low-pass filter

---

## 5. Ziegler-Nichols 调参 (1942)

### 5.1 Ultimate gain

1. Set $K_i = K_d = 0$
2. 增 $K_p$ 直到 system 持续振荡
3. 记 $K_u$ (ultimate gain) 和 $T_u$ (oscillation period)

| Controller | $K_p$ | $K_i$ | $K_d$ |
|---|---|---|---|
| P | $0.5 K_u$ | 0 | 0 |
| PI | $0.45 K_u$ | $1.2 K_p / T_u$ | 0 |
| PID | $0.6 K_u$ | $2 K_p / T_u$ | $K_p T_u / 8$ |

---

## 6. Lambda Tuning (软)

更 conservative 的 tuning,基于 desired closed-loop time constant $\lambda$。
- 较 ZN 慢但 robust
- 工业常用

---

## 7. Anti-Windup

I 项 累积 → actuator 饱和 → 即使 error 反向,output 也 lag。

```python
class PIDAntiWindup:
    def __init__(self, Kp, Ki, Kd, u_min=-100, u_max=100):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.u_min, self.u_max = u_min, u_max
        self.integral = 0
        self.prev_error = 0
    
    def step(self, e, dt):
        # P
        P = self.Kp * e
        # I + back-calculation anti-windup
        self.integral += self.Ki * e * dt
        # D
        D = self.Kd * (e - self.prev_error) / dt
        u = P + self.integral + D
        # Saturation
        u_clip = max(self.u_min, min(self.u_max, u))
        # Back-calculate integral
        self.integral -= (u - u_clip)
        self.prev_error = e
        return u_clip
```

---

## 8. Derivative Kick

Step 变 setpoint → D 项 → 大冲击。
解决:D 对 measurement(非 error)求导:

$$D = -K_d \frac{dy(t)}{dt}$$

---

## 9. 离散化

向前差分:
$$u_k = K_p e_k + K_i \sum_{i=0}^k e_i \Delta t + K_d \frac{e_k - e_{k-1}}{\Delta t}$$

Velocity form(更 robust):
$$\Delta u_k = K_p (e_k - e_{k-1}) + K_i e_k \Delta t + K_d (e_k - 2 e_{k-1} + e_{k-2}) / \Delta t$$

---

## 10. Auto-Tuning

- **Relay feedback**:Aström & Hägglund
- **Model predictive based**
- **Bayesian optimization**
- **Reinforcement learning** (实验)
- Modern PLC 通常有 auto-tune button

---

## 11. PID 应用

- **Motor speed/position**: ESC、伺服 driver
- **温度**: oven、reflow
- **压力**: pneumatic
- **流量**: HVAC
- **Drone attitude**: PID + complementary filter
- **Cruise control**: 车速

---

## 12. 常见问题

### 12.1 调参 trial-and-error 万能

可 work,但 ZN / lambda / auto-tune 更 systematic。

### 12.2 D 完全是好事

噪声 amplify → derivative filter / D on measurement 必。

### 12.3 PI 总够

非线性 / 大 dead time / large overshoot 需 PID / 高级控制。

### 12.4 PID = 简单

实际 production 需 anti-windup、bumpless transfer、derivative kick 等处理。

### 12.5 ZN 适合所有 plant

死时间大、振荡敏感 plant 不适;lambda tuning 更稳。

---

## 13. Related Concepts

- **同节**:[GUI Frameworks](GUI_Frameworks.md)
- **基础**:[Control Theory](../00_Foundations/Control_Theory.md)、[Signal Processing](../00_Foundations/Signal_Processing.md)
- **电机**:[BLDC Motor](../06_Actuators_Motors/BLDC_Motor.md)

---

## References

1. **Ziegler, J. G. & Nichols, N. B.** "Optimum settings for automatic controllers." *Trans ASME*, 1942.
2. **Aström, K. J. & Hägglund, T.** *Advanced PID Control*. 2006.
3. **Ogata, K.** *Modern Control Engineering*. 5th ed., 2010.
4. **Aström, K. J. & Murray, R. M.** *Feedback Systems*. 2nd ed., 2021.
