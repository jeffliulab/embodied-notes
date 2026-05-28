# PID Control & Tuning

> *PID (Proportional-Integral-Derivative) introduced 1922 by Minorsky for naval steering, still the most ubiquitous industrial controller a century later. Model-free, interpretable, intuitive tuning. Common in robot motors, temperature, pressure, PLCs. Ziegler-Nichols (1942) + lambda tuning + auto-tuning. Anti-windup, derivative kick are critical production details.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Control Theory](../00_Foundations/Control_Theory.en.md), Laplace transform

---

## 1. PID Equation

Time domain:
$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{de(t)}{dt}$$

Laplace:
$$U(s) = K_p E(s) + \frac{K_i}{s} E(s) + K_d s E(s)$$

3 actions:
- **P**: immediate response, residual steady-state error
- **I**: eliminates steady-state error, but overshoots
- **D**: damping, reduces overshoot, noise-sensitive

---

## 2. P-only

```
e ──→ [Kp] ──→ u
```

- Simple
- 1st-order plant has steady-state error ≠ 0
- Offset persists

---

## 3. PI

- Eliminates offset (I integrates error → output)
- But overshoot ↑
- Sufficient for many applications (temperature, flow)

---

## 4. PID

- I eliminates steady-state + D reduces overshoot
- But D amplifies noise → low-pass filter needed

---

## 5. Ziegler-Nichols Tuning (1942)

### 5.1 Ultimate Gain

1. Set $K_i = K_d = 0$
2. Increase $K_p$ until system oscillates continuously
3. Record $K_u$ (ultimate gain) and $T_u$ (oscillation period)

| Controller | $K_p$ | $K_i$ | $K_d$ |
|---|---|---|---|
| P | $0.5 K_u$ | 0 | 0 |
| PI | $0.45 K_u$ | $1.2 K_p / T_u$ | 0 |
| PID | $0.6 K_u$ | $2 K_p / T_u$ | $K_p T_u / 8$ |

---

## 6. Lambda Tuning (Soft)

More conservative tuning, based on desired closed-loop time constant $\lambda$.
- Slower than ZN but more robust
- Common in industry

---

## 7. Anti-Windup

I accumulates → actuator saturates → output lags even after error reverses.

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

Step setpoint change → D term → big spike.
Fix: derivate of measurement (not error):

$$D = -K_d \frac{dy(t)}{dt}$$

---

## 9. Discretization

Forward difference:
$$u_k = K_p e_k + K_i \sum_{i=0}^k e_i \Delta t + K_d \frac{e_k - e_{k-1}}{\Delta t}$$

Velocity form (more robust):
$$\Delta u_k = K_p (e_k - e_{k-1}) + K_i e_k \Delta t + K_d (e_k - 2 e_{k-1} + e_{k-2}) / \Delta t$$

---

## 10. Auto-Tuning

- **Relay feedback**: Aström & Hägglund
- **Model predictive based**
- **Bayesian optimization**
- **Reinforcement learning** (experimental)
- Modern PLCs typically have auto-tune button

---

## 11. PID Applications

- **Motor speed/position**: ESC, servo drivers
- **Temperature**: oven, reflow
- **Pressure**: pneumatic
- **Flow**: HVAC
- **Drone attitude**: PID + complementary filter
- **Cruise control**: vehicle speed

---

## 12. Common Pitfalls

### 12.1 Trial-and-Error Tuning Universal

Works but ZN / lambda / auto-tune more systematic.

### 12.2 D Always Good

Noise amplification → derivative filter / D on measurement essential.

### 12.3 PI Always Enough

Nonlinear / large dead time / large overshoot need PID / advanced control.

### 12.4 PID = Simple

Production PID needs anti-windup, bumpless transfer, derivative kick handling.

### 12.5 ZN Fits All Plants

Large dead time / oscillation-sensitive plants don't suit; lambda tuning more stable.

---

## 13. Related Concepts

- **Same section**: [GUI Frameworks](GUI_Frameworks.en.md)
- **Foundation**: [Control Theory](../00_Foundations/Control_Theory.en.md), [Signal Processing](../00_Foundations/Signal_Processing.en.md)
- **Motors**: [BLDC Motor](../06_Actuators_Motors/BLDC_Motor.en.md)

---

## References

1. **Ziegler, J. G. & Nichols, N. B.** "Optimum settings for automatic controllers." *Trans ASME*, 1942.
2. **Aström, K. J. & Hägglund, T.** *Advanced PID Control*. 2006.
3. **Ogata, K.** *Modern Control Engineering*. 5th ed., 2010.
4. **Aström, K. J. & Murray, R. M.** *Feedback Systems*. 2nd ed., 2021.
