# SLAM: Simultaneous Localization and Mapping

## Overview

SLAM (Simultaneous Localization and Mapping) is the problem of simultaneously estimating a robot's own pose and constructing a map of the environment in an unknown setting. It is a core technology for autonomous navigation of mobile robots.

**Probabilistic Formulation of the SLAM Problem:**

$$
p(x_{1:t}, m \mid z_{1:t}, u_{1:t})
$$

where:

| Symbol | Meaning |
|--------|---------|
| $x_{1:t}$ | Robot pose sequence from time 1 to $t$ |
| $m$ | Environment map |
| $z_{1:t}$ | Sensor observation sequence |
| $u_{1:t}$ | Control input (odometry) sequence |

<!-- SVG-DESIGN-NOTES
Type: A (structure — factor graph / pose graph + landmarks + loop closure)
Q0: SLAM's PGM essence: robot poses x_t (a chain) + landmarks m (side nodes) tied together by odometry / observation / loop-closure edges
Q1: Horizontal chain of pose nodes, top row of landmark circles, dashed observation edges between them; one loop-closure arc jumps from x_t back to x_1
Q2: Unlabeled: pose chain + landmark circles + jumping loop closure = SLAM factor-graph DNA
Q3: Removed original 720×200 viewBox with x=1100 off-canvas; replaced with factor graph
Q4: x_t / m_j / odometry / observation / loop closure annotated directly
Q5: All var(--dia-*); EN mirrors geometry
-->
<div class="diagram">
<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SLAM factor graph — pose chain + landmark + loop closure">
  <defs>
    <marker id="slam-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">SLAM — Factor Graph: Pose Chain + Landmarks + Loop</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Three constraint types: odometry (adjacent x) · observation (x↔m) · loop closure (long-range)</text>

  <g font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">
    <circle cx="160" cy="90" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="160" y="94" text-anchor="middle" font-weight="700">m₁</text>
    <circle cx="340" cy="80" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="340" y="84" text-anchor="middle" font-weight="700">m₂</text>
    <circle cx="540" cy="100" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="540" y="104" text-anchor="middle" font-weight="700">m₃</text>
    <circle cx="700" cy="80" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="700" y="84" text-anchor="middle" font-weight="700">m₄</text>
  </g>

  <g font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">
    <rect x="84" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="102" y="254" text-anchor="middle" font-weight="700">x₁</text>
    <rect x="194" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="212" y="254" text-anchor="middle" font-weight="700">x₂</text>
    <rect x="304" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="322" y="254" text-anchor="middle" font-weight="700">x₃</text>
    <rect x="414" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="432" y="254" text-anchor="middle" font-weight="700">x₄</text>
    <rect x="524" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="542" y="254" text-anchor="middle" font-weight="700">x₅</text>
    <rect x="634" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="652" y="254" text-anchor="middle" font-weight="700">x_t</text>
  </g>

  <line x1="120" y1="250" x2="194" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="230" y1="250" x2="304" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="340" y1="250" x2="414" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="450" y1="250" x2="524" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="560" y1="250" x2="634" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <text x="158" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₂</text>
  <text x="268" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₃</text>
  <text x="378" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₄</text>
  <text x="488" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₅</text>

  <line x1="102" y1="232" x2="155" y2="108" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="212" y1="232" x2="160" y2="108" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="212" y1="232" x2="335" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="322" y1="232" x2="340" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="432" y1="232" x2="540" y2="118" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="542" y1="232" x2="540" y2="118" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="542" y1="232" x2="695" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="652" y1="232" x2="700" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>

  <path d="M 652 268 Q 380 340 102 268" fill="none" stroke="var(--dia-accent-deep)" stroke-width="2" stroke-dasharray="6 3"/>
  <text x="380" y="335" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">loop closure ⤴</text>
  <text x="380" y="350" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-accent-deep)">same place at x_t and x₁ — corrects accumulated drift</text>

  <g transform="translate(60 140)" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke)">
    <rect x="0" y="0" width="14" height="14" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
    <text x="20" y="11">pose x_t</text>
    <circle cx="100" cy="6" r="7" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.2"/>
    <text x="112" y="11">landmark m_j</text>
    <line x1="200" y1="6" x2="220" y2="6" stroke="var(--dia-stroke)" stroke-width="1.4"/>
    <text x="226" y="11">odometry</text>
    <line x1="310" y1="6" x2="330" y2="6" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="336" y="11">observation</text>
    <line x1="430" y1="6" x2="450" y2="6" stroke="var(--dia-accent-deep)" stroke-width="2" stroke-dasharray="6 3"/>
    <text x="456" y="11">loop closure</text>
  </g>
</svg>
</div>
<p class="figure-caption">Figure — SLAM's factor-graph DNA: bottom blue squares form the pose chain; top green circles are landmarks; odometry edges link adjacent poses, observation edges cross to landmarks, and the red loop-closure arc jumps to revisited locations — the key to correcting drift.</p>


---

## 1 Mathematical Foundations of SLAM

### 1.1 Motion Model

$$
x_t = f(x_{t-1}, u_t) + w_t, \quad w_t \sim \mathcal{N}(0, R_t)
$$

### 1.2 Observation Model

$$
z_t = h(x_t, m) + v_t, \quad v_t \sim \mathcal{N}(0, Q_t)
$$

### 1.3 Two Forms of SLAM

| Form | Estimated Quantity | Methods |
|------|-------------------|---------|
| **Online SLAM** | $p(x_t, m \mid z_{1:t}, u_{1:t})$ | EKF-SLAM, particle filter |
| **Full SLAM** | $p(x_{1:t}, m \mid z_{1:t}, u_{1:t})$ | Graph optimization |

---

## 2 Filter-Based SLAM

### 2.1 EKF-SLAM

EKF-SLAM is the most classic SLAM method, maintaining a joint Gaussian distribution over the robot pose and all landmark positions.

**State Vector:**

$$
\hat{\mu}_t = \begin{bmatrix} x_t \\ m_1 \\ m_2 \\ \vdots \\ m_N \end{bmatrix}, \quad
\Sigma_t = \begin{bmatrix}
\Sigma_{xx} & \Sigma_{xm_1} & \cdots & \Sigma_{xm_N} \\
\Sigma_{m_1 x} & \Sigma_{m_1 m_1} & \cdots & \Sigma_{m_1 m_N} \\
\vdots & & \ddots & \vdots \\
\Sigma_{m_N x} & & \cdots & \Sigma_{m_N m_N}
\end{bmatrix}
$$

**Prediction Step (Motion Update):**

$$
\bar{\mu}_t = f(\hat{\mu}_{t-1}, u_t)
$$

$$
\bar{\Sigma}_t = F_t \Sigma_{t-1} F_t^T + R_t
$$

**Update Step (Observation Update):**

$$
K_t = \bar{\Sigma}_t H_t^T (H_t \bar{\Sigma}_t H_t^T + Q_t)^{-1}
$$

$$
\hat{\mu}_t = \bar{\mu}_t + K_t (z_t - h(\bar{\mu}_t))
$$

$$
\Sigma_t = (I - K_t H_t) \bar{\Sigma}_t
$$

where $F_t = \frac{\partial f}{\partial x}\big|_{\hat{\mu}_{t-1}}$ and $H_t = \frac{\partial h}{\partial x}\big|_{\bar{\mu}_t}$ are the Jacobian matrices.

**Limitations of EKF-SLAM:**

- Computational complexity $O(N^2)$ ($N$ = number of landmarks), unsuitable for large-scale environments
- Linearization errors lead to inconsistency
- Data association errors are difficult to recover from

### 2.2 Particle Filter SLAM (FastSLAM)

FastSLAM (Montemerlo et al., 2002) uses **Rao-Blackwellized particle filtering** to decompose the SLAM problem:

$$
p(x_{1:t}, m \mid z_{1:t}, u_{1:t}) = p(x_{1:t} \mid z_{1:t}, u_{1:t}) \prod_{j=1}^{N} p(m_j \mid x_{1:t}, z_{1:t})
$$

- Particles represent the path posterior $p(x_{1:t} \mid \cdot)$
- Each particle maintains an independent map (EKF update for each landmark)

**Advantages:**

- Computational complexity $O(M \log N)$ ($M$ = number of particles, $N$ = number of landmarks)
- Naturally handles multimodal distributions
- Data association can be handled independently per particle

---

## 3 Visual SLAM

### 3.1 Overview

Visual SLAM uses cameras as the primary sensor, classified into:

- **Feature-based**: Extract feature points, estimate pose based on geometric constraints
- **Direct**: Directly use pixel intensity values to optimize pose
- **Semi-direct**: Combines advantages of both (e.g., SVO)

### 3.2 ORB-SLAM3 System

ORB-SLAM3 (Campos et al., 2021) is currently the most complete open-source visual SLAM system, supporting monocular, stereo, RGB-D, and visual-inertial modes.

**System Pipeline:**

<!-- SVG-DESIGN-NOTES
Type: A (structure — ORB-SLAM3 3 concurrent threads + shared Map)
Q0: ORB-SLAM3's essence: 3 threads at very different rates share one Map — Tracking (30 Hz/frame) / Local Mapping (per keyframe) / Loop Closing (DBoW2-rate)
Q1: Three parallel lanes (colors by rate) + central shared Map container; rates from fast to slow with lane widths roughly proportional
Q2: Unlabeled: 3 colored lanes + central map container + rate gradient = ORB-SLAM3 DNA
Q3: Removed original 560×860 12-box stack with chaotic crossing arrows
Q4: Each lane shows rate + role + interface to Map
Q5: All var(--dia-*); EN mirrors geometry
-->
<div class="diagram">
<svg viewBox="0 0 820 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ORB-SLAM3 three concurrent threads + shared Map">
  <defs>
    <marker id="orb-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">ORB-SLAM3 — Three concurrent threads sharing one Map</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Tracking 30 Hz · Local Mapping (per-keyframe) · Loop Closing (DBoW2 query)</text>

  <rect x="40" y="76" width="200" height="280" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="140" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-blue)">Tracking</text>
  <text x="140" y="110" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-blue)">30 Hz / per-frame</text>
  <rect x="60" y="124" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="140" y="144" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">ORB feature extract</text>
  <rect x="60" y="166" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="140" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">constant-velocity</text>
  <rect x="60" y="208" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="140" y="228" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">PnP frame pose</text>
  <rect x="60" y="250" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="140" y="270" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">keyframe decision</text>
  <text x="140" y="304" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">in:  image_t</text>
  <text x="140" y="318" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">out: T_cam_t, new KF?</text>

  <rect x="280" y="100" width="240" height="220" rx="8" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke)" stroke-width="2.4"/>
  <text x="400" y="124" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-stroke)">Shared Map</text>
  <text x="400" y="144" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">(Atlas, ORB-SLAM3 innovation)</text>
  <text x="400" y="174" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">KeyFrames</text>
  <g fill="var(--dia-blue)">
    <rect x="306" y="180" width="14" height="14" rx="1"/>
    <rect x="328" y="180" width="14" height="14" rx="1"/>
    <rect x="350" y="180" width="14" height="14" rx="1"/>
    <rect x="372" y="180" width="14" height="14" rx="1"/>
    <rect x="394" y="180" width="14" height="14" rx="1"/>
    <rect x="416" y="180" width="14" height="14" rx="1"/>
    <rect x="438" y="180" width="14" height="14" rx="1"/>
    <rect x="460" y="180" width="14" height="14" rx="1"/>
    <rect x="482" y="180" width="14" height="14" rx="1"/>
  </g>
  <text x="400" y="224" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">MapPoints (green)</text>
  <g fill="var(--dia-green)">
    <circle cx="304" cy="240" r="3"/>
    <circle cx="324" cy="244" r="3"/>
    <circle cx="346" cy="238" r="3"/>
    <circle cx="364" cy="246" r="3"/>
    <circle cx="384" cy="240" r="3"/>
    <circle cx="404" cy="244" r="3"/>
    <circle cx="424" cy="238" r="3"/>
    <circle cx="444" cy="246" r="3"/>
    <circle cx="464" cy="242" r="3"/>
    <circle cx="486" cy="240" r="3"/>
  </g>
  <text x="400" y="276" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Covisibility Graph</text>
  <g stroke="var(--dia-stroke-soft)" stroke-width="0.8" fill="none">
    <line x1="320" y1="294" x2="360" y2="304"/>
    <line x1="360" y1="304" x2="400" y2="290"/>
    <line x1="400" y1="290" x2="440" y2="300"/>
    <line x1="440" y1="300" x2="480" y2="288"/>
    <line x1="320" y1="294" x2="400" y2="290"/>
    <line x1="360" y1="304" x2="440" y2="300"/>
  </g>
  <g fill="var(--dia-stroke-soft)">
    <circle cx="320" cy="294" r="2.5"/>
    <circle cx="360" cy="304" r="2.5"/>
    <circle cx="400" cy="290" r="2.5"/>
    <circle cx="440" cy="300" r="2.5"/>
    <circle cx="480" cy="288" r="2.5"/>
  </g>

  <rect x="560" y="76" width="180" height="130" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="650" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">Local Mapping</text>
  <text x="650" y="110" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-green)">per new keyframe</text>
  <rect x="580" y="124" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="650" y="142" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">triangulate MapPoints</text>
  <rect x="580" y="160" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="650" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">local Bundle Adjust</text>

  <rect x="560" y="226" width="180" height="130" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="650" y="244" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Loop Closing</text>
  <text x="650" y="260" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-accent-deep)">low rate (DBoW2)</text>
  <rect x="580" y="274" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="650" y="292" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">BoW query + Sim(3)</text>
  <rect x="580" y="310" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="650" y="328" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">pose graph + global BA</text>

  <line x1="240" y1="266" x2="278" y2="220" stroke="var(--dia-blue)" stroke-width="1.4" marker-end="url(#orb-arr)"/>
  <line x1="558" y1="160" x2="522" y2="200" stroke="var(--dia-green)" stroke-width="1.4" marker-end="url(#orb-arr)"/>
  <line x1="558" y1="296" x2="522" y2="260" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#orb-arr)"/>
</svg>
</div>
<p class="figure-caption">Figure — ORB-SLAM3's geometric DNA: three concurrent threads (Tracking 30 Hz / Local Mapping per-KF / Loop Closing slow) each read/write the central shared Map (Atlas) at different rates; the Map container decouples them.</p>


**Core Modules:**

**1. Feature Extraction**

Uses ORB (Oriented FAST and Rotated BRIEF) features:

- FAST corner detection + orientation computation
- rBRIEF descriptor (256-bit binary)
- Image pyramid for scale invariance
- Fast extraction; matching uses Hamming distance

**2. Tracking**

- Constant velocity model for initial pose prediction
- Feature matching + PnP solving
- Local map tracking: match against local map points, optimize current pose
- Keyframe selection strategy

**3. Local Mapping**

- New keyframe insertion
- Map point triangulation
- Local Bundle Adjustment

$$
\min_{\{T_i\}, \{p_j\}} \sum_{i,j} \rho\left(\|z_{ij} - \pi(T_i, p_j)\|^2_{\Sigma_{ij}}\right)
$$

where $\pi$ is the projection function and $\rho$ is a robust kernel function (e.g., Huber).

**4. Loop Closure**

- Bag-of-words model (DBoW2) for image similarity retrieval
- Geometric verification (RANSAC + Sim(3)/SE(3))
- Pose graph optimization (correcting accumulated drift)
- Optional global BA

### 3.3 Visual-Inertial SLAM (VIO)

Fusing IMU pre-integration:

$$
\Delta R_{ij} = \prod_{k=i}^{j-1} \text{Exp}((\omega_k - b_g) \Delta t)
$$

$$
\Delta v_{ij} = \sum_{k=i}^{j-1} \Delta R_{ik} (a_k - b_a) \Delta t
$$

$$
\Delta p_{ij} = \sum_{k=i}^{j-1} \Delta v_{ik} \Delta t + \frac{1}{2} \Delta R_{ik} (a_k - b_a) \Delta t^2
$$

VIO systems maintain robustness in texture-poor and fast-motion scenarios.

---

## 4 LiDAR SLAM

### 4.1 Overview

LiDAR SLAM uses laser scanners to obtain precise 3D point clouds (see [Sensors](../07_Hardware/传感器.md)), suitable for large-scale outdoor environments.

### 4.2 LOAM (Lidar Odometry and Mapping)

LOAM (Zhang & Singh, 2014) is one of the most influential LiDAR SLAM algorithms.

**Core Idea**: Decompose the problem into a high-frequency odometry module and a low-frequency mapping module.

**Feature Extraction**:

- Edge points: Points with high curvature
- Planar points: Points with low curvature

**Point-to-Edge/Plane Distance Minimization**:

Edge point residual:

$$
d_e = \frac{|(p_i - p_a) \times (p_i - p_b)|}{|p_a - p_b|}
$$

Planar point residual:

$$
d_p = \frac{(p_i - p_a) \cdot ((p_a - p_b) \times (p_a - p_c))}{|(p_a - p_b) \times (p_a - p_c)|}
$$

### 4.3 Cartographer

Google Cartographer (Hess et al., 2016) is a widely used 2D/3D SLAM system.

**Front End**:

- Submap construction: Uses scan matching to insert new scans into submaps
- Local optimization: Ceres Solver for scan matching

**Back End**:

- Loop closure detection: Branch-and-bound search
- Pose graph optimization: Sparse Pose Adjustment (SPA)

### 4.4 Other LiDAR SLAM Systems

| System | Features |
|--------|----------|
| LeGO-LOAM | Ground segmentation + lightweight LOAM |
| LIO-SAM | Tightly-coupled LiDAR-IMU, factor graph optimization |
| FAST-LIO2 | Tightly-coupled, iKD-tree acceleration, efficient |
| CT-ICP | Continuous-time ICP, handles motion distortion |

---

## 5 Graph-Based SLAM

### 5.1 Pose Graph Optimization

Modeling SLAM as a graph optimization problem:

- **Nodes**: Robot poses $x_i$
- **Edges**: Relative constraints between poses $z_{ij}$ (odometry, loop closure)

**Optimization Objective:**

$$
x^* = \arg\min_x \sum_{(i,j) \in \mathcal{E}} \|e_{ij}(x_i, x_j)\|^2_{\Omega_{ij}}
$$

where the error function:

$$
e_{ij} = z_{ij}^{-1} \oplus (x_i^{-1} \oplus x_j)
$$

$\Omega_{ij}$ is the information matrix (inverse of covariance).

### 5.2 Factor Graphs

Factor graphs are a more general graphical model representation:

- **Variable nodes**: States to be estimated (poses, landmarks, sensor biases, etc.)
- **Factor nodes**: Constraints (priors, odometry, observations, loop closures)

$$
p(X) \propto \prod_k f_k(X_k)
$$

**Common Factor Types**:

| Factor | Connected Variables | Information Source |
|--------|-------------------|-------------------|
| Prior Factor | $x_0$ | Initial pose |
| Odometry Factor | $x_{t-1}, x_t$ | Wheel/visual/inertial odometry |
| Landmark Observation Factor | $x_t, l_j$ | Camera/LiDAR observation |
| Loop Closure Factor | $x_i, x_j$ | Loop closure detection |
| IMU Pre-integration Factor | $x_i, x_j, v_i, v_j, b_i$ | IMU data |
| GPS Factor | $x_t$ | GPS localization |

### 5.3 Solution Methods

The graph optimization problem ultimately reduces to nonlinear least squares:

$$
\min_x \sum_k \|r_k(x)\|^2_{\Sigma_k}
$$

Solved iteratively using Gauss-Newton or Levenberg-Marquardt:

$$
(J^T \Sigma^{-1} J) \Delta x = -J^T \Sigma^{-1} r
$$

!!! note "Sparsity"
    The information matrix $H = J^T \Sigma^{-1} J$ in SLAM problems is **sparse** (because only adjacent/co-visible variables have constraints between them). Efficient solving is achieved through sparse Cholesky decomposition.

**Common Optimization Libraries**:

- **g2o**: General graph optimization framework
- **GTSAM**: Factor graph-based, supports incremental optimization (iSAM2)
- **Ceres Solver**: General nonlinear least squares solver

---

## 6 Learning-Enhanced SLAM

### 6.1 Depth Estimation

- **MonoDepth2**: Self-supervised monocular depth estimation
- **DPT**: Transformer-based depth prediction

### 6.2 Feature Extraction and Matching

- **SuperPoint**: Self-supervised keypoint detection
- **SuperGlue**: Graph Neural Network-based feature matching
- **LightGlue**: Lightweight feature matching

### 6.3 End-to-End Learned SLAM

**DROID-SLAM** (Teed & Deng, 2021):

- Dense matching based on RAFT optical flow network
- Differentiable Bundle Adjustment layer
- End-to-end training with strong generalization

$$
\min_{\{T_i\}, \{d_j\}} \sum_{(i,j)} \|p_{ij}^* - \Pi(T_i \cdot T_j^{-1}, d_j)\|^2_{\Sigma_{ij}}
$$

where $p_{ij}^*$ are network-predicted correspondences; gradient propagation is achieved through differentiable optimization by unrolling iterations.

### 6.4 Implicit Representations

- **iMAP**: Uses NeRF as the map representation
- **NICE-SLAM**: Hierarchical implicit representation
- **SplaTAM**: 3D Gaussian Splatting-based SLAM

---

## 7 SLAM Evaluation Metrics

### 7.1 Trajectory Accuracy

**Absolute Trajectory Error (ATE):**

$$
\text{ATE} = \sqrt{\frac{1}{N}\sum_{i=1}^{N} \|p_i^{\text{est}} - p_i^{\text{gt}}\|^2}
$$

**Relative Pose Error (RPE):**

$$
\text{RPE}_i = (T_i^{\text{gt}})^{-1} T_{i+\Delta}^{\text{gt}} \cdot ((T_i^{\text{est}})^{-1} T_{i+\Delta}^{\text{est}})^{-1}
$$

### 7.2 Standard Datasets

| Dataset | Sensors | Scenario |
|---------|---------|----------|
| KITTI | Stereo + LiDAR + GPS | Outdoor driving |
| EuRoC | Stereo + IMU | Indoor drone |
| TUM-RGBD | RGB-D | Indoor handheld |
| Newer College | Multi-LiDAR + Camera | Outdoor walking |

### 7.3 Evaluation Tools

- **evo**: Python trajectory evaluation toolkit
- **rpg_trajectory_evaluation**: Evaluation tool developed by ETH

---

## 8 System Integration

SLAM systems typically run under the ROS/ROS2 framework (see [ROS2](../06_Software/ROS2.md)), coordinating with the navigation stack:

- SLAM provides pose estimation and maps
- The navigation stack performs path planning based on the map
- Controllers execute motion commands

Sensor selection and calibration are crucial for SLAM performance (see [Sensors](../07_Hardware/传感器.md)).

---

## References

1. Thrun, S., Burgard, W. & Fox, D. (2005). *Probabilistic Robotics*. MIT Press.
2. Cadena, C. et al. (2016). Past, present, and future of simultaneous localization and mapping. *IEEE TRO*.
3. Campos, C. et al. (2021). ORB-SLAM3: An accurate open-source library for visual, visual-inertial and multi-map SLAM. *IEEE TRO*.
4. Zhang, J. & Singh, S. (2014). LOAM: Lidar Odometry and Mapping in Real-time. *RSS*.
5. Teed, Z. & Deng, J. (2021). DROID-SLAM: Deep Visual SLAM for Monocular, Stereo, and RGB-D Cameras. *NeurIPS*.
6. Grisetti, G. et al. (2010). A tutorial on graph-based SLAM. *IEEE ITSM*.
