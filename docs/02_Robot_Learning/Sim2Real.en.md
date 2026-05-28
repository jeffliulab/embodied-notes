# Sim2Real: Transferring from Simulation to Reality

## Overview

Sim2Real (Simulation-to-Reality) is a key technology in robot learning that bridges simulation training and real-world deployment. The core problem is the **Reality Gap**: simulators cannot perfectly reproduce the physical properties of the real world, causing policies that perform well in simulation to fail in real environments.

The research goal of Sim2Real is to develop systematic methods that enable policies trained in simulation to transfer robustly to real robots.

---

## Sources of the Reality Gap

The gap between simulation and reality arises from multiple levels:

### Dynamics Gap

Simulators exhibit systematic biases in modeling physical processes:

| Physical Phenomenon | Simulation Approximation | Real-world Behavior |
|---------------------|--------------------------|---------------------|
| Contact | Penetration penalty forces / constraints | Complex deformation, friction |
| Friction | Coulomb model $f = \mu N$ | Nonlinear, anisotropic |
| Soft bodies | Finite elements / mass-spring | Continuous deformation |
| Motors | Ideal torque sources | Delay, nonlinearity, thermal effects |
| Sensors | Ideal values + Gaussian noise | Complex noise, bias drift |

### Visual Gap

| Dimension | Simulation Rendering | Real Images |
|-----------|---------------------|-------------|
| Lighting | Simplified lighting models | Complex ambient light, reflections |
| Textures | Limited texture library | Infinite diversity |
| Camera | Ideal pinhole model | Distortion, chromatic aberration, noise |
| Occlusion | Perfect depth | Sensor noise, holes |

---

## Domain Randomization

### Core Idea

The core hypothesis of Domain Randomization (DR) is: if a policy can succeed across a large number of randomized simulation environments, then the real environment is simply "one sample" among these randomized environments.

**Formalization**: Define the simulation parameter vector $\xi \in \Xi$, sampled from distribution $p(\xi)$ at the beginning of each training episode:

$$
\xi \sim p(\xi), \quad \pi^* = \arg\max_\pi \mathbb{E}_{\xi \sim p(\xi)} \left[ \mathbb{E}_\pi \left[ \sum_t \gamma^t r_t \mid \xi \right] \right]
$$

### Physical Parameter Randomization

Typical physical parameter randomization ranges:

| Parameter | Symbol | Default Value | Randomization Range |
|-----------|--------|---------------|---------------------|
| Friction coefficient | $\mu$ | 1.0 | [0.2, 2.0] |
| Object mass | $m$ | Nominal value | [0.5x, 2.0x] |
| Damping coefficient | $b$ | Nominal value | [0.5x, 3.0x] |
| Joint backlash | $\delta$ | 0 | [0, 0.02] rad |
| Actuator delay | $\Delta t$ | 0 | [0, 30] ms |
| Gravity | $g$ | 9.81 | [9.4, 10.2] m/s$^2$ |
| Terrain friction | $\mu_g$ | 0.7 | [0.3, 1.2] |

### Visual Randomization

Visual domain randomization introduces variations at the rendering level:

- **Texture randomization**: Randomly replacing object and background textures
- **Lighting randomization**: Direction, intensity, color, number of lights
- **Camera randomization**: Position offset, field of view, white balance
- **Distractors**: Randomly adding irrelevant objects to the scene

### Automatic Domain Randomization (ADR)

Manually setting randomization ranges requires domain expertise. Automatic Domain Randomization (ADR, OpenAI 2019) adjusts them automatically:

**Algorithm**: For each parameter $\xi_i$, maintain a range $[\xi_i^{\text{low}}, \xi_i^{\text{high}}]$. Within an evaluation window:

$$
\text{If success\_rate} > \eta_{\text{up}}: \quad \xi_i^{\text{high}} \leftarrow \xi_i^{\text{high}} + \Delta\xi_i
$$
$$
\text{If success\_rate} < \eta_{\text{down}}: \quad \xi_i^{\text{high}} \leftarrow \xi_i^{\text{high}} - \Delta\xi_i
$$

This allows the randomization range to adaptively expand or contract during training.

---

## System Identification

### Core Idea

Unlike domain randomization's approach of "training to be robust across all environments," System Identification (SysID) aims to **make the simulation as close to reality as possible**.

### Parameter Identification

Given the simulator model $f_\xi(s, a)$ and real robot trajectories $\{(s_t^{\text{real}}, a_t^{\text{real}}, s_{t+1}^{\text{real}})\}$, optimize the simulation parameters:

$$
\xi^* = \arg\min_\xi \sum_t \| f_\xi(s_t^{\text{real}}, a_t^{\text{real}}) - s_{t+1}^{\text{real}} \|^2
$$

### Bayesian Optimization

When the objective function is non-differentiable (e.g., the simulator is a black box), Bayesian optimization is used:

1. Execute a standard action sequence on the real robot and record trajectory $\tau^{\text{real}}$
2. Execute the same action sequence in simulation to obtain $\tau^{\text{sim}}(\xi)$
3. Define a distance metric $d(\tau^{\text{real}}, \tau^{\text{sim}}(\xi))$
4. Model $d(\xi)$ with a Gaussian process and use Bayesian optimization to search for $\xi^*$

### Online Adaptation

Going further, environment parameters can be estimated online during deployment. Treat $\xi$ as a latent variable and infer it from observation history:

$$
\hat{\xi}_t = g_\phi(o_{t-L:t}, a_{t-L:t-1})
$$

where $g_\phi$ is an encoder (typically an RNN or Transformer) that infers current environment parameters from the most recent $L$ steps of observation-action history.

---

## Domain Adaptation

### Adversarial Feature Alignment

Domain adaptation bridges the gap by learning **domain-invariant features**. The core method is adversarial training:

**Architecture**:

- Feature extractor $F_\theta: \mathcal{O} \rightarrow \mathcal{Z}$
- Task head $C_\psi: \mathcal{Z} \rightarrow \mathcal{A}$
- Domain discriminator $D_\omega: \mathcal{Z} \rightarrow \{0, 1\}$ (0=sim, 1=real)

**Objective Function**:

$$
\min_{\theta, \psi} \max_\omega \underbrace{\mathcal{L}_{\text{task}}(C_\psi(F_\theta(o_{\text{sim}})), a^*)}_{\text{task loss in simulation}} - \lambda \underbrace{\mathcal{L}_{\text{domain}}(D_\omega(F_\theta(o)), d)}_{\text{domain classification loss}}
$$

Through the Gradient Reversal Layer, the feature extractor $F_\theta$ simultaneously minimizes the task loss and maximizes the confusion of the domain discriminator, thereby learning domain-invariant features.

### Image-Level Transfer

Using image-to-image translation (e.g., CycleGAN) to convert simulation images to a style closer to reality:

$$
G_{\text{sim} \to \text{real}}: I_{\text{sim}} \to \hat{I}_{\text{real}}
$$

With cycle consistency loss:

$$
\mathcal{L}_{\text{cycle}} = \|G_{\text{real} \to \text{sim}}(G_{\text{sim} \to \text{real}}(I_{\text{sim}})) - I_{\text{sim}}\|_1
$$

---

## Teacher-Student Distillation

### Complete Training Pipeline

Teacher-Student is one of the most successful Sim2Real frameworks, especially in quadruped locomotion control.

<!-- SVG-DESIGN-NOTES
Type: A (structure — Teacher-Student 3 stages: privileged Teacher → KL distill → Real-deploy Student)
Q0: The asymmetry is *observation-space*: in sim, Teacher uses privileged info (terrain / friction / contact forces only available in sim); Student uses only real-feasible proprioception and learns to mimic Teacher via KL divergence
Q1: Three vertical stage columns (Sim+Teacher / KL Distill / Real+Student) with distinct colors; Teacher's obs panel is wide (rich) vs Student's obs panel narrow (sparse), encoding the bandwidth gap; central red KL arrow
Q2: Unlabeled: wide privileged-obs panel on left + single KL arrow in middle + narrow sensor-obs panel on right = Teacher-Student DNA
Q3: Removed original 900×580 viewBox with 14 crossing arrows; replaced with three clean stage columns
Q4: Each privileged item / sensor item annotated inside the corresponding obs box
Q5: All var(--dia-*); EN mirrors CN geometry
-->
<div class="diagram">
<svg viewBox="0 0 820 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Teacher-Student three-stage distillation pipeline">
  <defs>
    <marker id="ts-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
    <marker id="ts-arr-red" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-accent-deep)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Teacher-Student — Privileged Info Distilled to Real Sensors</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Teacher uses sim-privileged obs → KL distillation → Student uses real sensors → deploy</text>

  <rect x="40" y="70" width="260" height="280" rx="8" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="170" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-blue)">Stage 1 · Sim + Teacher</text>
  <text x="170" y="108" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">4096 parallel envs + DR</text>

  <rect x="60" y="124" width="220" height="100" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.6"/>
  <text x="170" y="142" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">Privileged observations</text>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">
    <text x="75" y="158">• terrain height map</text>
    <text x="75" y="172">• contact forces / states</text>
    <text x="75" y="186">• friction / mass</text>
    <text x="75" y="200">• object ground-truth pose</text>
    <text x="75" y="214">• sim noise ground truth</text>
  </g>

  <rect x="60" y="240" width="220" height="80" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="170" y="258" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-blue)">Teacher π_T (PPO)</text>
  <text x="170" y="274" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">MLP 256-256-256</text>
  <text x="170" y="290" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">frozen after convergence</text>
  <text x="170" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">a_T = π_T(o_privileged)</text>

  <text x="410" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Stage 2</text>
  <text x="410" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">KL distill</text>
  <text x="410" y="200" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">L = D_KL(π_T ‖ π_S)</text>
  <text x="410" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">same env</text>
  <text x="410" y="234" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">different obs spaces</text>

  <path d="M 300 270 Q 360 270 360 260" fill="none" stroke="var(--dia-accent-deep)" stroke-width="2"/>
  <line x1="360" y1="260" x2="360" y2="248" stroke="var(--dia-accent-deep)" stroke-width="2" marker-end="url(#ts-arr-red)"/>
  <path d="M 460 248 L 460 260 Q 460 270 520 270" fill="none" stroke="var(--dia-accent-deep)" stroke-width="2" marker-end="url(#ts-arr-red)"/>

  <rect x="520" y="70" width="260" height="280" rx="8" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="650" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">Stage 3 · Real + Student</text>
  <text x="650" y="108" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">proprioception only (real-feasible)</text>

  <rect x="540" y="124" width="220" height="64" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="650" y="142" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Real sensor observations</text>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">
    <text x="555" y="158">• joint angle q (proprio)</text>
    <text x="555" y="172">• IMU (gyro + accel)</text>
    <text x="555" y="186">• action history a_{t-H:t-1}</text>
  </g>

  <rect x="540" y="200" width="220" height="36" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="650" y="218" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">History Encoder</text>
  <text x="650" y="232" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">RNN / Transformer</text>

  <rect x="540" y="246" width="220" height="74" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="650" y="264" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-green)">Student π_S</text>
  <text x="650" y="280" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">MLP 256-256-256</text>
  <text x="650" y="298" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">a_S = π_S(o_sensor, h_t)</text>
  <text x="650" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">deploy on robot @ 50 Hz</text>
</svg>
</div>
<p class="figure-caption">Figure — Teacher-Student's geometric DNA: a wide left panel packs sim-only privileged observations that Teacher learns to use; the central KL distillation compresses Teacher's policy into Student; the narrow right panel holds only real-feasible sensor inputs that Student learns to interpret.</p>


### Privileged Information Design

**Teacher's privileged information** (available in simulation, unavailable in reality):

| Privileged Information | Dimension | Description |
|------------------------|-----------|-------------|
| Terrain height scan | $\mathbb{R}^{187}$ | Height sample points around feet |
| External forces | $\mathbb{R}^{3}$ | Perturbation forces applied to the torso |
| Friction coefficient | $\mathbb{R}^{1}$ | Current ground friction |
| Payload mass | $\mathbb{R}^{1}$ | Additional load on the back |
| Motor strength | $\mathbb{R}^{12}$ | Actual gain for each motor |

**Student's available information**:

| Observation | Dimension | Description |
|-------------|-----------|-------------|
| Joint angles | $\mathbb{R}^{12}$ | Encoder readings |
| Joint angular velocities | $\mathbb{R}^{12}$ | Encoder differentials |
| IMU | $\mathbb{R}^{6}$ | Angular velocity + acceleration |
| Action history | $\mathbb{R}^{12 \times L}$ | Past $L$ steps of actions |
| Velocity command | $\mathbb{R}^{3}$ | $(v_x, v_y, \omega_z)$ |

### History Encoder

The Student implicitly infers environment parameters through historical information. The encoder maps the past $L$ steps of observation-action pairs to a latent variable:

$$
z_t = \text{RNN}_\phi(o_{t-L:t}, a_{t-L:t-1})
$$

Then the Student policy is conditioned on $z_t$:

$$
a_t = \pi_{\text{student}}(o_t, z_t)
$$

Intuitively, $z_t$ encodes an implicit estimate of the current terrain type, friction, payload, and similar information.

---

## Sim2Real Best Practices

### Success Factors

1. **Sufficient domain randomization**: Cover the range of possible variations in the real environment
2. **Accurate default parameters**: Determine nominal parameters through system identification
3. **Robust observations**: Avoid relying on signals that are easy in simulation but inaccurate in reality
4. **Delay modeling**: Inject communication/computation delays in simulation
5. **Noise injection**: Sensor noise, actuator noise
6. **Action smoothing**: Penalize abrupt action changes

### Common Failure Modes

| Failure Mode | Cause | Solution |
|-------------|-------|----------|
| Action jitter | No motor dynamics in simulation | Add low-pass filtering and smoothness penalties |
| Cannot walk | Inaccurate friction model | Wider friction randomization range |
| Grasping failure | Contact model discrepancy | Force/torque feedback + domain randomization |
| Vision failure | Unrealistic rendering | Visual domain randomization + domain adaptation |
| Delay sensitivity | Unmodeled delays | Inject 10–30ms random delays |

---

## Evaluation Metrics

### Transfer Success Rate

The most direct metric is the ratio of task success rate in the real environment to that in simulation:

$$
\text{Transfer Ratio} = \frac{\text{Success Rate}_{\text{real}}}{\text{Success Rate}_{\text{sim}}}
$$

Ideally close to 1.0. In practice:

- Simple tasks (e.g., quadruped walking): 0.8–0.95
- Manipulation tasks (e.g., dexterous manipulation): 0.3–0.7
- Vision tasks (e.g., image-based manipulation): 0.2–0.6

### Zero-Shot vs. Few-Shot Transfer

- **Zero-Shot**: Directly deploy after simulation training without any real data
- **Few-Shot**: Simulation pretraining + fine-tuning with a small amount of real data

---

## Connections to Other Chapters

- **Simulation platforms**: [Simulation Platforms](../06_Software/simulation_platforms.en.md) provides detailed introductions to simulators such as Isaac Gym/Lab and MuJoCo
- **Reinforcement learning**: [Reinforcement Learning in Robotics](强化学习在机器人中的应用.md) details RL training methods in simulation
- **Deployment practice**: [Real-world Deployment](../09_Deployment/index.md) covers engineering details of Sim2Real deployment
- **Control theory**: [Robotics Fundamentals](../03_Robotics/robotics_intro.md) provides safety guarantees from control theory for Sim2Real

---

## References

1. Tobin, J., et al. (2017). *Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World*. IROS.
2. OpenAI (2019). *Solving Rubik's Cube with a Robot Hand*. arXiv:1910.07113.
3. Miki, T., et al. (2022). *Learning Robust Perceptive Locomotion for Quadrupedal Robots in the Wild*. Science Robotics.
4. Peng, X.B., et al. (2018). *Sim-to-Real Transfer of Robotic Control with Dynamics Randomization*. ICRA.
5. Rudin, N., et al. (2022). *Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning*. CoRL.
