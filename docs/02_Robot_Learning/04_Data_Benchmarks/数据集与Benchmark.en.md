# Datasets and Benchmarks

<!-- CONTENT-EXPAND-TODO (2026-05-15)
Reviewer: independent audit (Explore agent) - Batch 1 audit
Status: Tables + data-scale SVG complete, key worked example + pitfalls missing
Gaps:
- Common pitfalls absent: RLDS conversion failure / data contamination detection / sampling bias
- Worked example absent: Bridge V2 → diffusion policy end-to-end training code
- §3-4 dataset entries thin, need "first-reproduction debugging" practical notes
-->

Progress in robot learning depends on high-quality datasets and standardized evaluation benchmarks. However, compared to NLP and CV, the cost of acquiring robot data is extremely high and the scale is extremely small. This article systematically reviews the major robot datasets, data format standards, and evaluation benchmarks.

> Related notes: [Teleoperation and Data Collection](遥操作与数据收集.md) | [VLA Models](../01_Foundations/VLA模型.md) | [Open-Source Model Summary](../03_Models/开源模型汇总.md)

---

## 1. The Scarcity of Robot Data

### 1.1 Scale Comparison

Comparing robot data with data scales from other AI domains provides an intuitive sense of the gap:

| Domain | Representative Dataset | Data Scale | Acquisition Method |
|--------|----------------------|-----------|-------------------|
| Language models | Common Crawl | ~15T tokens | Web crawling |
| Image recognition | LAION-5B | 5 billion image-text pairs | Web crawling |
| Video understanding | HD-VILA | 100 million video clips | Web crawling |
| Autonomous driving | nuScenes | 1.4 million frames | Vehicle-mounted sensors |
| **Robot manipulation** | **Open X-Embodiment** | **~1 million episodes** | **Teleoperation/RL** |
| **Single lab** | **Typical scale** | **1K–100K episodes** | **Teleoperation** |

The fundamental reason for robot data scarcity:

$$\text{Data Cost} = \frac{\text{Hardware Cost} + \text{Labor Cost} + \text{Time Cost}}{\text{Collection Speed}}$$

- **Hardware cost**: A single robot arm costs approximately $5K–$50K
- **Labor cost**: Requires operators for teleoperation (VR/teach pendant/force feedback)
- **Time cost**: A single operation typically takes 30 seconds to 5 minutes
- **Collection speed**: One person collects approximately 100–500 episodes per day

### 1.2 Strategies for Addressing Data Scarcity

<!-- SVG-DESIGN-NOTES
Type: D (quantitative / log scale) — 6 data sources placed on a log axis + 4 strategy arrows pointing at specific log regions
Q0: Robot data is 4-8 orders of magnitude smaller than other AI corpora (LLM 15T tokens, LAION 5B images); the response is not "collect more" but four complementary strategies, each addressing a different log region: faster collection / cross-institution aggregation / sim generation / non-robot transfer
Q1: Horizontal log x-axis 10^3 → 10^13; each dataset is a vertical pin (length ∝ order); four strategies are arrows above the axis pointing to the regions they fill
Q2: Without title: log scale + size gap + 4 strategy arrows annotating "collect"/"aggregate"/"sim"/"web" → immediately "robot data scarcity & its 4 fixes", not a generic hierarchy
Q3: Removed 12 equal-size boxes + 13 arbitrary arrows; abstract "Robot Data Scarcity" / "More Efficient Collection" boxes replaced by datapoints + annotations
Q4: Dataset names next to pins; numbers (15T, 5B, 1M, 10K) in JetBrains Mono; strategy names along arrows
Q5: All var(--dia-*); English labels — shared with .md
-->
<div class="diagram">
<svg viewBox="0 0 820 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Log-scale data sizes across AI domains with four strategies bridging the robot data gap">
  <defs>
    <marker id="ds-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="410" y="30" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="14" font-style="italic" fill="var(--dia-stroke)">data-size gap · log scale, various AI domains vs robotics</text>

  <line x1="60" y1="350" x2="780" y2="350" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" text-anchor="middle">
    <line x1="60" y1="346" x2="60" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="60" y="370">10³</text>
    <line x1="132" y1="346" x2="132" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="132" y="370">10⁴</text>
    <line x1="204" y1="346" x2="204" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="204" y="370">10⁵</text>
    <line x1="276" y1="346" x2="276" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="276" y="370">10⁶</text>
    <line x1="348" y1="346" x2="348" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="348" y="370">10⁷</text>
    <line x1="420" y1="346" x2="420" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="420" y="370">10⁸</text>
    <line x1="492" y1="346" x2="492" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="492" y="370">10⁹</text>
    <line x1="564" y1="346" x2="564" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="564" y="370">10¹⁰</text>
    <line x1="636" y1="346" x2="636" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="636" y="370">10¹¹</text>
    <line x1="708" y1="346" x2="708" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="708" y="370">10¹²</text>
    <line x1="780" y1="346" x2="780" y2="354" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="780" y="370">10¹³</text>
  </g>
  <text x="780" y="395" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke-soft)">samples (episodes / images / tokens)</text>

  <line x1="132" y1="345" x2="132" y2="310" stroke="var(--dia-accent)" stroke-width="2.4"/>
  <circle cx="132" cy="310" r="5" fill="var(--dia-accent)" stroke="none"/>
  <text x="132" y="298" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">10 K</text>
  <text x="132" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">single lab</text>
  <text x="132" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">(typical)</text>

  <line x1="200" y1="345" x2="200" y2="225" stroke="var(--dia-accent)" stroke-width="2.4"/>
  <circle cx="200" cy="225" r="5" fill="var(--dia-accent)" stroke="none"/>
  <text x="200" y="218" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">76 K</text>
  <text x="200" y="205" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">DROID (2024)</text>

  <line x1="276" y1="345" x2="276" y2="155" stroke="var(--dia-accent)" stroke-width="2.4"/>
  <circle cx="276" cy="155" r="6" fill="var(--dia-accent)" stroke="var(--dia-accent-deep)" stroke-width="1.4"/>
  <text x="276" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">1.1 M</text>
  <text x="276" y="135" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">Open X-Embodiment</text>
  <text x="276" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">(2023, frontier)</text>

  <line x1="290" y1="345" x2="290" y2="280" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <circle cx="290" cy="280" r="4" fill="var(--dia-blue)" stroke="none"/>
  <text x="318" y="284" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">nuScenes 1.4 M frames</text>

  <line x1="540" y1="345" x2="540" y2="125" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <circle cx="540" cy="125" r="6" fill="var(--dia-blue)" stroke="none"/>
  <text x="540" y="118" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">5 B</text>
  <text x="540" y="105" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">LAION-5B (images)</text>

  <line x1="420" y1="345" x2="420" y2="190" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <circle cx="420" cy="190" r="4" fill="var(--dia-blue)" stroke="none"/>
  <text x="420" y="183" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">100 M</text>
  <text x="420" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">HD-VILA</text>

  <line x1="745" y1="345" x2="745" y2="85" stroke="var(--dia-gold)" stroke-width="2.4"/>
  <circle cx="745" cy="85" r="7" fill="var(--dia-gold)" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <text x="745" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-gold)" font-weight="bold">15 T</text>
  <text x="745" y="60" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">Common Crawl (LLM)</text>

  <rect x="60" y="430" width="240" height="22" fill="var(--dia-accent)" fill-opacity="0.15" stroke="var(--dia-accent)" stroke-width="0.6"/>
  <text x="180" y="446" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">where robot data lives  ·  10³ – 10⁶</text>
  <rect x="300" y="430" width="480" height="22" fill="var(--dia-blue)" fill-opacity="0.10" stroke="var(--dia-blue)" stroke-width="0.6"/>
  <text x="540" y="446" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">vision / video / text data live here  ·  10⁸ – 10¹³</text>

  <path d="M 100,415 Q 130,395 165,365" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  <text x="40" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-green)">① faster collect</text>
  <text x="40" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">ALOHA / UMI</text>

  <path d="M 240,415 Q 260,395 275,365" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  <text x="220" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-green)">② aggregate</text>
  <text x="220" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Open-X · DROID</text>

  <path d="M 380,415 Q 400,395 420,365" fill="none" stroke="var(--dia-gold)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  <text x="380" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-gold)">③ sim generate</text>
  <text x="380" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Isaac / ManiSkill</text>

  <path d="M 600,415 Q 660,395 720,365" fill="none" stroke="var(--dia-accent)" stroke-width="2" marker-end="url(#ds-arr)"/>
  <text x="600" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-accent)">④ non-robot web transfer</text>
  <text x="600" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">RT-2 · R3M · VIP</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — Robot data scarcity is not a one-liner; it is a 4-8 orders-of-magnitude gap on the log axis. The four strategies each fill a different log region.</p>


---

## 2. Major Datasets

### 2.1 Large-Scale Aggregated Datasets

#### Open X-Embodiment (Google DeepMind, 2023)

| Attribute | Value |
|-----------|-------|
| **Scale** | 1 million+ episodes |
| **Sources** | 33 sub-datasets from 21 institutions |
| **Robot types** | 22 different morphologies |
| **Task descriptions** | 160,000+ types |
| **Data format** | RLDS (TensorFlow Datasets) |
| **Storage size** | ~1.3TB |

**Included sub-datasets (partial)**:

| Sub-dataset | Episodes | Robot | Tasks |
|-------------|----------|-------|-------|
| RT-1 Robot Action | 130K | Everyday Robots | Tabletop manipulation |
| Bridge V2 | 60K | WidowX | Kitchen manipulation |
| Language Table | 442K | xArm | Language-guided block pushing |
| TACO-RL | 6K | Franka | Manipulation + RL |
| BC-Z | 26K | Google Robot | Multi-task |
| Cable Routing | 1K | UR5 | Cable routing |

#### DROID (2024)

| Attribute | Value |
|-----------|-------|
| **Scale** | 76,000 episodes |
| **Sources** | Standardized collection from 13 institutions |
| **Robot** | Franka Emika Panda |
| **Collection method** | SpaceMouse teleoperation |
| **Scenes** | 564 independent scenes |
| **Annotations** | Natural language instructions + manipulation type labels |

**Core value of DROID**:

- Unified collection protocol ensures data quality consistency
- Multi-scene data covers real-world diversity
- Standardized data format facilitates model training

### 2.2 Domain-Specific Datasets

#### Bridge V2 (UC Berkeley, 2023)

| Attribute | Value |
|-----------|-------|
| **Scale** | 60,096 episodes |
| **Robot** | WidowX 250 6DoF |
| **Scenes** | 24 kitchen/tabletop environments |
| **Objects** | 100+ everyday items |
| **Control** | End-effector pose control |
| **Frequency** | 5Hz |

#### RH20T (Tsinghua, 2023)

| Attribute | Value |
|-----------|-------|
| **Scale** | 110,000+ episodes |
| **Robots** | Multiple (Franka, UR5, xArm, etc.) |
| **Tasks** | 147 manipulation tasks |
| **Features** | Rich multimodal annotations |
| **Sensors** | RGB + Depth + Force/Torque + Tactile |

#### AgiBot World (AgiBot, 2025)

| Attribute | Value |
|-----------|-------|
| **Scale** | 1 million+ episodes (target) |
| **Robot** | AgiBot proprietary platform |
| **Scenes** | Industrial + Home |
| **Features** | First large-scale open-source robot dataset from China |
| **Data quality** | Automated quality filtering pipeline |

#### RoboTurk (Stanford, 2018)

| Attribute | Value |
|-----------|-------|
| **Scale** | 2,000+ demonstrations |
| **Collection method** | Cloud crowdsourcing (browser-based teleoperation) |
| **Robot** | Sawyer |
| **Contribution** | First exploration of crowdsourced robot data collection |

---

## 3. Data Format Standards

Different datasets use different storage formats; format conversion is a common pain point in practice.

### 3.1 Major Format Comparison

| Format | Used by | Basis | Features | Suitable for |
|--------|---------|-------|----------|-------------|
| **RLDS** | Open X-Embodiment, Octo | TensorFlow Datasets | Standardized episode structure | Large-scale pretraining |
| **LeRobot format** | LeRobot, HuggingFace | Parquet + Video | Small size, HuggingFace ecosystem | Rapid prototyping |
| **HDF5** | robomimic, RH20T | HDF5 | Flexible nested structure | Research experiments |
| **zarr** | Diffusion Policy | Zarr | Chunked storage, parallelism-friendly | Large-scale training |
| **rosbag** | ROS ecosystem | ROS | Raw sensor recordings | Data collection |

### 3.2 RLDS Format Details

RLDS (Reinforcement Learning Datasets) is the standard format adopted by Open X-Embodiment:

```python
# Typical structure of an RLDS episode
episode = {
    "steps": [
        {
            "observation": {
                "image": np.array([256, 256, 3]),      # RGB image
                "wrist_image": np.array([128, 128, 3]), # Wrist camera (optional)
                "state": np.array([7]),                 # Proprioceptive state
            },
            "action": np.array([7]),  # 7DoF: dx,dy,dz,drx,dry,drz,gripper
            "reward": 0.0,
            "is_terminal": False,
            "is_first": True,
            "language_instruction": "pick up the red cup",
        },
        # ... subsequent steps
    ]
}
```

### 3.3 LeRobot Format Details

LeRobot adopts a more modern data format based on Parquet and video files:

```
dataset/
├── meta/
│   ├── info.json           # Dataset metadata
│   ├── episodes.jsonl      # Episode-level metadata
│   └── stats.json          # Statistics (mean, standard deviation)
├── data/
│   ├── chunk-000/
│   │   ├── episode_000000.parquet  # Structured data
│   │   ├── episode_000001.parquet
│   │   └── ...
├── videos/
│   ├── chunk-000/
│   │   ├── observation.images.top/
│   │   │   ├── episode_000000.mp4
│   │   │   └── ...
│   │   └── observation.images.wrist/
│   │       └── ...
```

**Advantages of the LeRobot format**:

- Video compression dramatically reduces storage space (compared to raw image frames)
- Seamless integration with HuggingFace Hub
- Parquet format supports efficient columnar queries

### 3.4 Format Conversion

In practice, conversion between formats is frequently needed:

```python
# RLDS → LeRobot (LeRobot provides official tools)
python lerobot/scripts/push_dataset_to_hub.py \
    --raw-dir /path/to/rlds_dataset \
    --raw-format rlds \
    --repo-id your-hf-username/dataset-name

# HDF5 → LeRobot
python lerobot/scripts/push_dataset_to_hub.py \
    --raw-dir /path/to/hdf5_data \
    --raw-format robomimic \
    --repo-id your-hf-username/dataset-name
```

---

## 4. Benchmarks and Evaluation

### 4.1 Simulation Benchmarks

#### SIMPLER (Google DeepMind, 2024)

| Attribute | Value |
|-----------|-------|
| **Positioning** | Simulation alternative for evaluating real robot policies |
| **Core value** | Simulation evaluation scores highly correlate with real robot performance |
| **Tasks** | Tabletop manipulation based on Google Robot and WidowX |
| **Features** | Can evaluate VLA performance without real robots |

#### LIBERO (UT Austin, 2023)

| Attribute | Value |
|-----------|-------|
| **Positioning** | Lifelong Learning benchmark |
| **Platform** | MuJoCo simulation |
| **Task suites** | 5 suites, 10 tasks each |
| **Evaluation dimensions** | Spatial generalization, object generalization, goal generalization, long-horizon tasks |

**LIBERO's 5 task suites**:

| Suite | Evaluation Dimension | Difficulty |
|-------|---------------------|-----------|
| LIBERO-Spatial | Same objects, different spatial relations | Low |
| LIBERO-Object | Same task, different objects | Medium |
| LIBERO-Goal | Same scene, different goals | Medium |
| LIBERO-Long | Long-sequence composite tasks | High |
| LIBERO-100 | 100 diverse tasks | High |

#### RLBench (Imperial College, 2020)

| Attribute | Value |
|-----------|-------|
| **Platform** | CoppeliaSim + PyRep |
| **Tasks** | 100+ carefully designed manipulation tasks |
| **Observations** | RGB, depth, joint state, end-effector pose |
| **Features** | Each task provides variants for generalization testing |

#### MetaWorld (Stanford, 2020)

| Attribute | Value |
|-----------|-------|
| **Platform** | MuJoCo |
| **Tasks** | 50 tabletop manipulation tasks |
| **Positioning** | Multi-task learning and meta-learning evaluation |
| **Evaluation modes** | ML1 (single-task), ML10 (10 tasks), ML45 (45 tasks), MT10, MT50 |

#### ManiSkill (UCSD/Hillbot, 2023)

| Attribute | Value |
|-----------|-------|
| **Platform** | SAPIEN |
| **Versions** | ManiSkill2, ManiSkill3 |
| **Tasks** | 20+ manipulation task categories |
| **Features** | GPU-parallel environments, extremely fast |
| **Objects** | Uses interactable objects from PartNet-Mobility |

### 4.2 Benchmark Comparison

<!-- SVG-DESIGN-NOTES
Type: D (quantitative) — 2D scatter: x = sim throughput (eps/h, log), y = correlation with real-robot success
Q0: In the 2D space (throughput × real-corr), MetaWorld / ManiSkill are extremely fast but poorly correlated with real; SIMPLER (2024) is a sweet spot (medium throughput + high corr); real-robot eval is the gold-standard upper-right corner but throughput < 10 eps/h
Q1: True axes: x = log sim throughput (1 → 10^5 eps/h), y = corr with real success rate (0 → 1.0); each benchmark a dot (radius ∝ task count); SIMPLER highlighted in accent; real eval in gold upper-right; dashed pareto curve shows trade-off
Q2: Without title: axes + 5 benchmark dots + SIMPLER highlighted + real-eval at (low throughput, high corr) → immediately sim-vs-real trade-off, not a generic benchmark list
Q3: Removed 7 equal boxes + 5 arrows; "Real-matched MuJoCo" etc. encoded by position, not text
Q4: Benchmark names next to dots; task counts inside dots; tick numbers along axes
Q5: All var(--dia-*); English labels; shared with .md
-->
<div class="diagram">
<svg viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="2D scatter of robot benchmarks: simulation throughput vs correlation with real-robot success">
  <defs>
    <marker id="bb-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" font-style="italic" fill="var(--dia-stroke)">benchmark trade-off · sim throughput × real-robot correlation</text>

  <line x1="80" y1="60" x2="80" y2="380" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <line x1="80" y1="380" x2="720" y2="380" stroke="var(--dia-stroke)" stroke-width="1.2"/>

  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" text-anchor="end">
    <line x1="76" y1="380" x2="84" y2="380" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="72" y="384">0.0</text>
    <line x1="76" y1="316" x2="84" y2="316" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="72" y="320">0.2</text>
    <line x1="76" y1="252" x2="84" y2="252" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="72" y="256">0.4</text>
    <line x1="76" y1="188" x2="84" y2="188" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="72" y="192">0.6</text>
    <line x1="76" y1="124" x2="84" y2="124" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="72" y="128">0.8</text>
    <line x1="76" y1="60" x2="84" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="72" y="64">1.0</text>
  </g>
  <text x="32" y="220" font-family="Fraunces, Georgia, serif" font-size="12" font-style="italic" fill="var(--dia-stroke)" transform="rotate(-90 32 220)">corr w/ real-robot success</text>

  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" text-anchor="middle">
    <line x1="80" y1="376" x2="80" y2="384" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="80" y="398">10⁰</text>
    <line x1="204" y1="376" x2="204" y2="384" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="204" y="398">10¹</text>
    <line x1="328" y1="376" x2="328" y2="384" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="328" y="398">10²</text>
    <line x1="452" y1="376" x2="452" y2="384" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="452" y="398">10³</text>
    <line x1="576" y1="376" x2="576" y2="384" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="576" y="398">10⁴</text>
    <line x1="700" y1="376" x2="700" y2="384" stroke="var(--dia-stroke)" stroke-width="1"/>
    <text x="700" y="398">10⁵</text>
  </g>
  <text x="400" y="420" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" font-style="italic" fill="var(--dia-stroke)">simulation throughput (eps/h, log)</text>

  <path d="M 110,80 Q 300,140 480,200 Q 600,280 680,350" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="240" y="115" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-stroke-soft)">∼ pareto frontier (more throughput → less realism)</text>

  <circle cx="170" cy="60" r="9" fill="var(--dia-gold)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="185" y="56" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-gold)">Real-robot eval</text>
  <text x="185" y="70" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">gold standard, ≤ 10 eps/h</text>

  <circle cx="380" cy="108" r="8" fill="var(--dia-accent)" stroke="var(--dia-accent-deep)" stroke-width="2"/>
  <text x="395" y="105" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)" font-weight="bold">SIMPLER (2024)</text>
  <text x="395" y="118" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">∼ 200 eps/h · corr ≈ 0.85</text>

  <circle cx="496" cy="236" r="6" fill="var(--dia-green)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="510" y="232" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-green)">LIBERO</text>
  <text x="510" y="246" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">50 tasks (5 × 10), MuJoCo</text>

  <circle cx="420" cy="252" r="7" fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="350" y="280" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-blue)">RLBench</text>
  <text x="350" y="294" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">100+ tasks, CoppeliaSim</text>

  <circle cx="580" cy="284" r="6" fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="595" y="280" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-blue)">MetaWorld</text>
  <text x="595" y="294" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">50 tasks, MuJoCo</text>

  <circle cx="700" cy="272" r="6" fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="565" y="335" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-blue)">ManiSkill (GPU par.)</text>
  <text x="565" y="349" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">20+ tasks, SAPIEN, ~50 K eps/h</text>
  <line x1="630" y1="333" x2="685" y2="285" stroke="var(--dia-stroke-soft)" stroke-width="0.8" stroke-dasharray="2,3"/>

  <text x="270" y="160" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)">sweet spot:</text>
  <text x="270" y="175" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)">sim cheap + real correlated</text>
  <path d="M 350,165 Q 360,140 375,120" fill="none" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#bb-arr)"/>
</svg>
</div>
<p class="figure-caption">Figure 2 — There is no "best" benchmark: higher throughput correlates with lower real-success agreement. SIMPLER is the post-2024 sweet spot, but replacing real-robot evaluation entirely is still risky.</p>


### 4.3 Evaluation Metrics

| Metric | Definition | Applicable Scenario |
|--------|-----------|---------------------|
| **Success Rate** | Proportion of successfully completed tasks | Most commonly used primary metric |
| **Partial Success** | Partial completion (e.g., grasped but not placed correctly) | Long-sequence tasks |
| **Generalization Gap** | Difference in success rates between in- and out-of-distribution | Generalization capability evaluation |
| **Sample Efficiency** | Data needed to reach threshold success rate | Data efficiency evaluation |
| **Inference Latency** | Time for a single inference | Real-time performance evaluation |
| **Cross-Embodiment Transfer** | Zero-shot/few-shot performance on new robots | Transfer capability evaluation |

---

## 5. Data Quality and Annotation

### 5.1 Key Dimensions of Data Quality

| Dimension | Description | Impact |
|-----------|-------------|--------|
| **Demonstration quality** | Operator's proficiency level | Directly affects imitation learning ceiling |
| **Diversity** | Scene, object, lighting variations | Determines generalization capability |
| **Annotation accuracy** | Correspondence between language instructions and actions | Affects language-conditioned policies |
| **Temporal alignment** | Timestamp synchronization between images and actions | Critical for causal modeling |
| **Calibration accuracy** | Camera intrinsic/extrinsic parameter accuracy | Affects 3D-related tasks |

### 5.2 Automated Quality Filtering

Recent work has begun exploring automated data quality assessment:

1. **Success rate filtering**: Remove failed demonstrations
2. **Consistency checks**: Detect temporal consistency of actions and observations
3. **VLM scoring**: Use VLMs to evaluate the semantic correctness of demonstrations
4. **Outlier detection**: Remove anomalous values in the action distribution

---

## 6. Future Directions

### 6.1 Paths for Data Scale Expansion

| Path | Representative | Feasibility | Scale Ceiling |
|------|---------------|-------------|---------------|
| More teleoperation | DROID, AgiBot World | High | Tens of millions of episodes |
| Simulation generation | ManiSkill, Isaac Gym | High | Hundreds of millions of episodes |
| Video generation models | UniSim | Medium | Theoretically unlimited |
| Autonomous exploration | Reset-free RL | Low (currently) | Depends on algorithm progress |
| Internet video | RT-2 pretraining | High | Billions of videos |

### 6.2 Standardization Trends

- **RLDS and LeRobot formats are becoming de facto standards**
- HuggingFace Hub as a unified data distribution platform
- Dataset cards (Datasheets) recording collection conditions, biases, and usage limitations

### 6.3 Key Challenges

1. **Long-tail problem**: Rare but important manipulation scenarios have very little data
2. **Negative samples**: Most datasets contain only successful demonstrations, lacking failure cases
3. **Cross-embodiment standardization**: Observation and action spaces differ greatly across robots
4. **Privacy and security**: Data containing real environments may involve privacy concerns
5. **Evaluation fairness**: Different models use different training data, making cross-comparison difficult

---

**References**:

- Open X-Embodiment Collaboration, "Open X-Embodiment: Robotic Learning Datasets and RT-X Models", 2023
- Khazatsky et al., "DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset", RSS 2024
- Walke et al., "BridgeData V2: A Dataset for Robot Learning at Scale", CoRL 2023
- Fang et al., "RH20T: A Comprehensive Robotic Dataset for Learning Diverse Skills in One-Shot", 2023
- Li et al., "SIMPLER: Simulated Manipulation Policy Evaluation for Real Robot Setups", 2024
- Liu et al., "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning", NeurIPS 2023
- James et al., "RLBench: The Robot Learning Benchmark", RA-L 2020
- Yu et al., "Meta-World: A Benchmark and Evaluation for Multi-Task and Meta Reinforcement Learning", CoRL 2020
- Gu et al., "ManiSkill2: A Unified Benchmark for Generalizable Manipulation Skills", ICLR 2023
