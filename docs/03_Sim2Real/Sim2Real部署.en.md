# Sim2Real Deployment Practical Guide

## Overview

Sim2Real (simulation to real) deployment is the process of transferring policies trained in simulation environments to real physical systems. Due to inevitable discrepancies between simulation and reality (Reality Gap), systematic methods are needed to ensure policies run stably in real environments.

This article focuses on the engineering practice of Sim2Real deployment, covering pre-deployment checklists, domain randomization configuration, system identification, real-world fine-tuning, and troubleshooting common failure modes.

---

## Pre-Deployment Checklist

Before deploying simulation policies to real robots, complete the following checks:

### Hardware Readiness

- [ ] Robot joint zero-point calibration completed
- [ ] Sensor data acquisition verified (IMU, torque sensors, encoders)
- [ ] Emergency stop button functionality tested
- [ ] Communication latency measured and recorded (controller to actuator)
- [ ] Power system stability verified

### Software Readiness

- [ ] Control frequency matches simulation settings (typically >=500Hz)
- [ ] Observation space matches simulation (dimensions, normalization range)
- [ ] Action space mapping correct (joint angle/torque ranges)
- [ ] Safety limits configured (joint limits, velocity caps, torque saturation)
- [ ] Data logging pipeline ready

### Policy Verification

- [ ] Zero-shot success rate in simulation >= 90%
- [ ] Domain randomization range covers real parameter intervals
- [ ] Policy remains stable under extreme simulation parameters
- [ ] Inference latency meets real-time requirements (< control period)

---

## Domain Randomization Parameter Ranges

Domain Randomization is the core technique for bridging the Sim2Real Gap. Below are recommended randomization ranges for various parameter categories:

### Physical Parameter Randomization

| Parameter Category | Parameter Name | Default Value | Randomization Range | Distribution Type |
|-------------------|---------------|--------------|--------------------|--------------------|
| **Friction** | Ground friction coefficient | 1.0 | 0.5 - 2.0 | Uniform |
| **Friction** | Joint friction | 0.01 | 0.005 - 0.05 | Log-uniform |
| **Mass** | Link mass | Nominal | +-20% | Uniform |
| **Mass** | Payload mass | 0 kg | 0 - 5 kg | Uniform |
| **Inertia** | Link moment of inertia | Nominal | +-30% | Uniform |
| **Geometry** | Center of mass offset | 0 | +-2 cm | Gaussian |
| **Geometry** | Link length | Nominal | +-5% | Gaussian |
| **Elasticity** | Restitution coefficient | 0.5 | 0.1 - 0.9 | Uniform |
| **Damping** | Joint damping | Nominal | +-50% | Uniform |

### Sensor and Actuator Randomization

| Parameter Category | Parameter Name | Randomization Range | Description |
|-------------------|---------------|--------------------|----|
| **Latency** | Observation delay | 0 - 40 ms | Simulates sensor and communication delay |
| **Latency** | Action delay | 0 - 20 ms | Simulates actuator response delay |
| **Noise** | IMU accelerometer noise | +-0.05 m/s^2 | Gaussian white noise |
| **Noise** | IMU gyroscope noise | +-0.01 rad/s | Gaussian white noise |
| **Noise** | Joint encoder noise | +-0.001 rad | Quantization noise |
| **Noise** | Torque sensor noise | +-2% | Gaussian white noise |
| **Bias** | Sensor bias | +-5% | Constant bias + slow drift |
| **Gain** | Motor gain error | +-10% | Simulates motor characteristic variation |

### Environment Parameter Randomization

| Parameter Category | Parameter Name | Randomization Range |
|-------------------|---------------|---------------------|
| **Terrain** | Ground height offset | +-3 cm |
| **Terrain** | Ground tilt angle | +-5 deg |
| **Lighting** | Light intensity | 50 - 500 lux |
| **Lighting** | Light direction | All-direction random |
| **Object** | Target object size | +-15% |
| **Object** | Object texture | Random colors/textures |

---

## System Identification Workflow

System identification estimates physical parameters from real data to narrow the Sim2Real Gap.

### Identification Process

<!-- SVG-DESIGN-NOTES
Type: C (algorithmic process — system-identification iteration: sim trajectory progressively approaching the real trajectory, small multiples)
Q0 (One Big Idea): system identification is a minimization loop — fix one excitation trajectory, repeatedly optimize the simulator's physics parameters so the sim output curve progressively matches the real measured curve, RMSE monotonically decreasing until convergence (<1°)
Q1 (geometric mapping): 3 side-by-side small-multiple panels (iter 0 / iter k / converged), each plotting the same joint trajectory's real solid line vs sim dashed line, the two separated initially and nearly overlapping at the end; an RMSE decay curve spans the three panels below
Q2 (DNA): drop the title — "real solid vs sim dashed going from separated to overlapping + monotonically decreasing RMSE" is the visual fingerprint of system identification, completely unlike a flowchart
Q3 (decoration removed): deleted the original 10 equal-size flow boxes + 8 crossing arrows (a flowchart does not carry the core process proposition "error iteratively converges"); no legend, real/sim labeled next to the curves
Q4 (direct labels): real/sim curve names at the line ends; iter number and that round's RMSE under each panel; the convergence threshold RMSE<1° marked on the decay curve
Q5 (Dark + bilingual): all var(--dia-*); real in accent solid, sim in blue dashed, RMSE curve in green; Chinese labels swapped in the EN version
-->
<div class="diagram">
<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System identification iteration: simulation trajectory progressively approaching the real trajectory">
  <text x="380" y="24" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="16" fill="var(--dia-stroke)">System Identification — Optimize Physics Params so sim Approaches real (RMSE converges)</text>

  <text x="135" y="52" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">iter 0 · RMSE 8.2°</text>
  <line x1="40" y1="190" x2="240" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="40" y1="70" x2="40" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 45 150 C 80 90 110 175 145 100 S 200 80 235 130" stroke="var(--dia-accent)" stroke-width="2" fill="none"/>
  <path d="M 45 175 C 85 150 115 110 150 165 S 205 150 235 95" stroke="var(--dia-blue)" stroke-width="1.8" fill="none" stroke-dasharray="5 3"/>
  <text x="232" y="146" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-accent)">real</text>
  <text x="232" y="88" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-blue)">sim</text>

  <text x="385" y="52" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">iter k · RMSE 2.4°</text>
  <line x1="290" y1="190" x2="490" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="290" y1="70" x2="290" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 295 150 C 330 90 360 175 395 100 S 450 80 485 130" stroke="var(--dia-accent)" stroke-width="2" fill="none"/>
  <path d="M 295 156 C 332 98 362 168 397 108 S 451 88 485 124" stroke="var(--dia-blue)" stroke-width="1.8" fill="none" stroke-dasharray="5 3"/>

  <text x="635" y="52" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-green)">converged · RMSE 0.7° &lt; 1°</text>
  <line x1="540" y1="190" x2="740" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="540" y1="70" x2="540" y2="190" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 545 150 C 580 90 610 175 645 100 S 700 80 735 130" stroke="var(--dia-accent)" stroke-width="2.4" fill="none"/>
  <path d="M 545 151 C 580 91 610 174 645 101 S 700 81 735 129" stroke="var(--dia-blue)" stroke-width="1.6" fill="none" stroke-dasharray="4 3"/>

  <line x1="40" y1="300" x2="740" y2="300" stroke="var(--dia-stroke)" stroke-width="1"/>
  <path d="M 60 230 C 200 250 320 285 460 294 S 660 298 720 299" stroke="var(--dia-green)" stroke-width="2" fill="none"/>
  <circle cx="60" cy="230" r="3" fill="var(--dia-green)"/><circle cx="385" cy="280" r="3" fill="var(--dia-green)"/><circle cx="700" cy="298" r="3" fill="var(--dia-green)"/>
  <text x="60" y="222" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">RMSE tracking error decreases monotonically over identification iterations → converges &lt;1°</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — System identification is an error-minimization iteration: using the same excitation trajectory, the simulator's physics parameters are repeatedly optimized so the simulation output (blue dashed) progressively matches the real measurement (orange solid). From the clear separation at iter 0 to near-overlap at convergence, the joint-tracking RMSE decreases monotonically to <1°, at which point parameter identification is considered complete.</p>


### Key Steps

**1. Excitation Trajectory Design**

Use frequency sweep signals or optimized Fourier series trajectories to cover the target frequency range:

$$q_d(t) = q_0 + \sum_{k=1}^{N} \frac{a_k}{k\omega} \sin(k\omega t) - \frac{b_k}{k\omega} \cos(k\omega t)$$

**2. Parameter Optimization Methods**

Common methods include:
- **Least squares**: For linearly parameterized models
- **Bayesian optimization**: For high-dimensional parameter spaces
- **CMA-ES**: Evolutionary strategy, for non-convex optimization
- **Neural network identification**: Data-driven, for complex dynamics

**3. Validation Metrics**
- Joint trajectory tracking error RMSE < 1 deg
- Torque prediction error < 10%
- Frequency response matching (Bode plot comparison)

---

## Real-World Fine-tuning

### Residual Policy Learning

Overlay a residual policy $\pi_{res}$ on the base policy $\pi_{base}$, fine-tuning with small amounts of real data:

$$a_t = \pi_{base}(o_t) + \alpha \cdot \pi_{res}(o_t)$$

where $\alpha$ is the residual weight, initially set small (0.1) and gradually increased.

**Implementation notes:**
- Fix base policy parameters, train only the residual network
- Constrain residual action range to +-20% of base actions
- Use safety constraints to ensure no boundary violations

### Online Adaptation

**Implicit adaptation:** Infer environment parameters from observation history

$$z_t = f_{encoder}(o_{t-H:t}, a_{t-H:t-1})$$
$$a_t = \pi(o_t, z_t)$$

**Explicit adaptation:** Online model parameter updates
- RMA (Rapid Motor Adaptation): Adaptation module predicts environment factors
- Test-Time Training: Online fine-tuning of partial network layers

### Few-shot Fine-tuning
- Collect 10-50 real demonstration trajectories
- Fine-tune using DAgger or online imitation learning
- Set learning rate to 1/10 to 1/100 of pretraining

---

## The Sweet Spot of Domain-Randomization Width: The Core Sim2Real Trade-off

Behind the whole Sim2Real deployment workflow (task design → domain-randomization training → system-identification calibration → low-speed safety test → progressive speed-up → full-speed deployment), the most critical tunable knob is the **width of domain randomization**. Its effect on real-world success rate is not monotonic but an **inverted-U curve**: too narrow, and the policy's sim success rate is inflated while overfitting the simulator, with real performance collapsing; too wide, and the policy is forced to learn a conservative "compromise policy" robust to all extremes, leaving both sim and real mediocre. The optimum is in the middle — the width that exactly covers real physical uncertainty without overdoing it (the ranges given in the DR parameter table above are precisely this empirical sweet spot).

<!-- SVG-DESIGN-NOTES
Type: B (geometric / mathematical intuition — domain-randomization width vs real success rate, inverted-U curve)
Q0 (One Big Idea): real success rate is an inverted-U over domain-randomization width — too narrow overfits the simulator (sim high, real collapses), too wide underfits (both mediocre), there is an optimal width that covers real uncertainty without overdoing it; this is the core tunable knob of the whole Sim2Real flow
Q1 (geometric mapping): X = domain-randomization width (narrow→wide), Y = success rate; two real curves — sim success (monotone decreasing, inflated at narrow widths) and real success (inverted-U), the sweet spot near their crossing; the real-curve peak emphasized with a circle
Q2 (DNA): drop the title — an inverted-U real curve crossing a monotone-decreasing sim curve, the visual fingerprint of a DR robustness trade-off, completely unlike the original out-of-bounds (viewBox 900, content to 1790) flowchart
Q3 (decoration removed): deleted the original viewBox-overflowing 11 equal-size flow boxes + 10 arrows (the deployment flow is now carried by one sentence, it does not carry the core geometric proposition "DR width sweet spot"); no legend, sim/real labeled next to the curves
Q4 (direct labels): sim/real curve names at the line ends; "sweet spot (DR parameter-table empirical range)" at the optimal width; both ends labeled "overfit sim / underfit conservative"
Q5 (Dark + bilingual): all var(--dia-*); real curve in accent, sim curve in blue, sweet-spot band lightly filled in green; Chinese labels swapped in the EN version
-->
<div class="diagram">
<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Inverted-U trade-off between domain-randomization width and real success rate">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">DR Width → Success Rate (real inverted-U, a sweet spot exists)</text>

  <line x1="90" y1="60" x2="90" y2="310" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="90" y1="310" x2="650" y2="310" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="84" y="68" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">100%</text>
  <text x="84" y="190" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">50%</text>
  <text x="84" y="310" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">0%</text>
  <text x="40" y="185" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)" transform="rotate(-90 40 185)">Task success rate</text>
  <text x="100" y="328" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">narrow</text>
  <text x="640" y="328" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">wide</text>
  <text x="370" y="352" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">Domain-randomization width</text>

  <rect x="300" y="60" width="90" height="250" fill="var(--dia-green)" fill-opacity="0.10"/>
  <text x="345" y="78" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-green)">sweet spot</text>
  <text x="345" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9.5" fill="var(--dia-green)">(DR table empirical range)</text>

  <path d="M 95 80 C 200 95 320 150 460 215 S 620 270 645 285" stroke="var(--dia-blue)" stroke-width="2" fill="none" stroke-dasharray="5 3"/>
  <text x="150" y="74" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">sim success (inflated at narrow)</text>

  <path d="M 95 280 C 180 230 260 130 345 118 C 430 130 540 215 645 270" stroke="var(--dia-accent)" stroke-width="2.6" fill="none"/>
  <circle cx="345" cy="118" r="6" fill="var(--dia-accent)"/>
  <text x="345" y="108" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent)">real peak ≈ optimal width</text>

  <text x="120" y="300" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">too narrow: overfit sim, real collapses</text>
  <text x="620" y="255" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">too wide: underfit, over-conservative, all mediocre</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — The effect of domain-randomization width on real-world success rate is an inverted-U: too narrow inflates sim success but overfits the simulator and collapses on real deployment; too wide forces the policy to be over-conservative, leaving sim and real both mediocre. The optimum is in the middle — the empirical range given in the DR parameter table above corresponds to this "sweet spot." The whole deployment flow (training → identification calibration → progressive speed-up) essentially aims to keep the policy near this peak.</p>


---

## Common Failure Modes and Troubleshooting

### 1. Policy Freezing

**Symptom:** Robot suddenly stops moving or outputs constant actions.

**Causes:**
- Observation values outside training distribution (OOD)
- Normalization statistics mismatch with simulation
- NaN or Inf in network inputs

**Solutions:**
- Check observation ranges, add clipping
- Synchronize normalization parameters between simulation and real environment
- Add input validity checks

### 2. Unexpected Contacts

**Symptom:** Robot collides with unmodeled obstacles.

**Solutions:**
- Add random obstacles in simulation
- Enable collision detection and safety response policies
- Use torque monitoring for post-collision safe stops

### 3. Sensor Noise-induced Jitter

**Symptom:** High-frequency oscillation at end-effector or joints.

**Solutions:**
- Increase sensor noise range in simulation
- Add observation filtering (low-pass, sliding average)
- Reduce PD control gains

### 4. Terrain/Contact Surface Differences

**Symptom:** Legged robot walks unstably.

**Solutions:**
- Expand friction coefficient randomization range
- Increase terrain randomization complexity
- Use adaptive gait controllers

### 5. Communication Latency Mismatch

**Symptom:** Jerky action execution, lag or overshoot.

**Solutions:**
- Measure real latency distribution, expand simulation latency randomization
- Use latency compensation techniques (predict current state)
- Reduce control frequency to decrease latency sensitivity

---

## Utility Tools and Scripts

### Pre-deployment Parameter Comparison Script

```python
def compare_sim_real_params(sim_config, real_measurements):
    """Compare simulation parameters with real measurements"""
    mismatches = []
    for param, sim_val in sim_config.items():
        if param in real_measurements:
            real_val = real_measurements[param]
            error = abs(sim_val - real_val) / abs(real_val)
            if error > 0.1:  # Over 10% deviation
                mismatches.append({
                    'param': param,
                    'sim': sim_val,
                    'real': real_val,
                    'error': f'{error*100:.1f}%'
                })
    return mismatches
```

### Deployment Safety Monitor

```python
class SafetyMonitor:
    def __init__(self, torque_limit, velocity_limit, position_limits):
        self.torque_limit = torque_limit
        self.velocity_limit = velocity_limit
        self.position_limits = position_limits
    
    def check(self, state):
        """Check whether current state is safe"""
        if any(abs(t) > self.torque_limit for t in state.torques):
            return False, "Torque limit exceeded"
        if any(abs(v) > self.velocity_limit for v in state.velocities):
            return False, "Velocity limit exceeded"
        for i, pos in enumerate(state.positions):
            if pos < self.position_limits[i][0] or pos > self.position_limits[i][1]:
                return False, f"Joint {i} position limit exceeded"
        return True, "Normal"
```

---

## Related Resources

- [Sim2Real Transfer Methods](../04_Robot_Learning/Sim2Real.md)
- [Simulation Tool Comparison](../06_Software/仿真工具对比.md)
- [Safety and Robustness](安全与鲁棒性.md)
- [Real-time Systems](实时系统.md)
