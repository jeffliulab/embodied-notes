# Simulation Platforms

In robotics, simulator choice is an entry-point decision, not a trivia contest about engines. The first question is what you are actually trying to optimize for:

- research-oriented dynamics and control validation
- large-scale parallel RL / IL training
- photorealistic rendering and synthetic data
- ROS2 system integration
- digital twins and deployment-oriented engineering

This note only answers "what the major platforms are, what each is good at, and how to choose." For how to build usable robot, object, sensor, and scene assets, see [Simulation Assets](仿真资产.en.md). For how those assets are assembled into trainable, evaluable, and transferable worlds, see [Simulation World Building & Physics Rules](仿真世界构建与物理规则.en.md).

---

## Reading Route

If your question looks like one of the following, start from the matching page:

| Question | Recommended page |
|----------|------------------|
| Which simulator should I choose? | this note |
| How do I build robot, object, sensor, and material assets? | [Simulation Assets](仿真资产.en.md) |
| How do I organize worlds and tune contacts and physics? | [Simulation World Building & Physics Rules](仿真世界构建与物理规则.en.md) |
| How do URDF / MJCF / SDF / USD and related tools work? | [Development Toolchain](../03_Ecosystem/开发工具链.en.md) |
| How should I think about transfer and randomization? | [Sim2Real](../../02_Robot_Learning/02_Methods/Sim2Real.en.md) |

---

## Platform Map

<!-- SVG-DESIGN-NOTES
Type: D (quantitative — sim platforms on throughput vs visual fidelity scatter)
Q0: Choosing a sim platform is a throughput-vs-fidelity trade-off: Isaac Lab gives 10^4 env/sec but simpler visuals; Isaac Sim is photoreal but slower; MuJoCo is fast but no graphics; Webots/Gazebo sits in the middle
Q1: 2D scatter, x = log throughput (env/sec), y = visual fidelity; each platform a colored dot; typical-use zone outlined
Q2: Unlabeled: log x-axis + dots + use-case zone box = sim trade-off DNA
Q3: Removed original 560×720 box tree
Q4: Each platform tagged with throughput + use case
Q5: All var(--dia-*); EN mirrors geometry
-->
<div class="diagram">
<svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sim platforms throughput vs visual fidelity scatter">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Sim Platforms — Throughput vs Visual Fidelity</text>
  <text x="380" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">x: single-GPU parallel throughput (log env/sec)　y: visual/render fidelity</text>

  <line x1="80" y1="360" x2="720" y2="360" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="80" y1="360" x2="80" y2="80" stroke="var(--dia-stroke)" stroke-width="1.4"/>

  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="160" y1="360" x2="160" y2="366" stroke="var(--dia-stroke-soft)"/>
    <text x="160" y="384" text-anchor="middle">10²</text>
    <line x1="320" y1="360" x2="320" y2="366" stroke="var(--dia-stroke-soft)"/>
    <text x="320" y="384" text-anchor="middle">10³</text>
    <line x1="480" y1="360" x2="480" y2="366" stroke="var(--dia-stroke-soft)"/>
    <text x="480" y="384" text-anchor="middle">10⁴</text>
    <line x1="640" y1="360" x2="640" y2="366" stroke="var(--dia-stroke-soft)"/>
    <text x="640" y="384" text-anchor="middle">10⁵</text>
  </g>
  <text x="400" y="404" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="var(--dia-stroke)">throughput (env·sim-step / sec, log)</text>

  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="74" y1="300" x2="80" y2="300" stroke="var(--dia-stroke-soft)"/>
    <text x="68" y="304" text-anchor="end">low</text>
    <line x1="74" y1="200" x2="80" y2="200" stroke="var(--dia-stroke-soft)"/>
    <text x="68" y="204" text-anchor="end">mid</text>
    <line x1="74" y1="100" x2="80" y2="100" stroke="var(--dia-stroke-soft)"/>
    <text x="68" y="104" text-anchor="end">photoreal</text>
  </g>
  <text x="56" y="220" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="var(--dia-stroke)" transform="rotate(-90 56 220)">visual fidelity</text>

  <circle cx="560" cy="320" r="14" fill="var(--dia-blue)" opacity="0.65" stroke="var(--dia-blue)" stroke-width="1.8"/>
  <text x="560" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Isaac Lab</text>
  <text x="560" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">~10⁴-10⁵ env · RL training</text>

  <circle cx="380" cy="110" r="14" fill="var(--dia-accent-deep)" opacity="0.65" stroke="var(--dia-accent-deep)" stroke-width="1.8"/>
  <text x="380" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Isaac Sim</text>
  <text x="380" y="78" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">photoreal · data synth · digital twin</text>

  <circle cx="500" cy="290" r="12" fill="var(--dia-green)" opacity="0.65" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="500" y="270" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">MuJoCo</text>
  <text x="500" y="256" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">~10³-10⁴ · contact-rich · control research</text>

  <circle cx="240" cy="180" r="11" fill="var(--dia-gold)" opacity="0.55" stroke="var(--dia-gold)" stroke-width="1.4"/>
  <text x="240" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Gazebo · Webots</text>
  <text x="240" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-gold)">ROS integration · mid fidelity</text>

  <circle cx="160" cy="240" r="9" fill="var(--dia-stroke-soft)" opacity="0.55"/>
  <text x="160" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke)">PyBullet</text>
  <text x="160" y="208" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">prototyping</text>

  <circle cx="320" cy="140" r="11" fill="var(--dia-accent)" opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="320" y="122" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">CARLA · LGSVL</text>
  <text x="320" y="108" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">AV simulation</text>

  <rect x="450" y="270" width="220" height="80" rx="6" fill="var(--dia-blue)" opacity="0.08" stroke="var(--dia-blue)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="560" y="244" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="var(--dia-blue)">large-scale RL zone</text>
</svg>
</div>
<p class="figure-caption">Figure — Sim platform trade-off DNA: log x-axis spans 3 orders of magnitude in throughput, y-axis runs low→photoreal; the lower-right blue zone is dominated by Isaac Lab / MuJoCo for large-scale RL, while the upper-left holds Isaac Sim / CARLA for high-fidelity data synthesis.</p>


---

## What Actually Matters When Choosing a Platform

| Dimension | What you should ask |
|-----------|---------------------|
| Physics fidelity | Are contact, joints, friction, and actuation good enough for the task? |
| Visual fidelity | Are rendering, materials, lighting, and sensors realistic enough? |
| Training throughput | Can it support large-scale parallel rollouts? |
| Asset ecosystem | Is it easy to import robots, scenes, and interactive objects? |
| Software integration | Does it play well with ROS2, logging, debugging, and deployment? |
| Maintainability | Can the team realistically maintain the stack? |

A common mistake is to treat "the most powerful platform" as the default answer. In practice, it is better to choose by task than to choose by hype.

---

## Quick Comparison

| Platform | Best at | Strengths | Limitations |
|----------|---------|-----------|-------------|
| MuJoCo | research control, manipulation, contact tuning | lightweight, stable, strong research adoption | weak for large scene libraries and photoreal rendering |
| Gazebo / Gazebo Sim | ROS2 integration and system validation | close to ROS workflows, strong SDF world description | less compelling for massive training or premium visuals |
| Isaac Sim | photorealistic simulation and digital twins | USD-native, RTX, PhysX, synthetic data | heavy stack, higher engineering complexity |
| Isaac Lab | large-scale RL / IL training | high throughput, structured training workflows | tightly coupled to the Isaac stack |
| SAPIEN / ManiSkill | manipulation worlds and articulated objects | strong benchmark orientation | weaker than Omniverse for industrial digital twins |
| robosuite | quick manipulation prototyping | fast to start, mature examples | limited world scale and industrial integration |

---

## 1. ROS2 and Gazebo: System Integration First

ROS2 is not a simulator, but in practice it is tightly coupled with simulation because training is only part of the robotics stack. You still need messaging, TF, sensor pipelines, planners, controllers, and deployment tooling.

### 1.1 When Gazebo should be a first choice

- you are doing ROS2 system integration
- you need SDF to describe complete worlds
- plugins, bridges, and maintainability matter more than photoreal rendering
- large-scale GPU training is not the primary objective

### 1.2 What Gazebo is good at

| Capability | Description |
|------------|-------------|
| World description | `world/model/link/joint/light/plugin` can live in one configuration |
| ROS2 integration | natural fit with ros_gz, nav2, rviz2, and control tooling |
| Plugins | mature controller, sensor, and bridge plugins |
| Scene expression | more natural than plain URDF for multi-model worlds |

### 1.3 What Gazebo should not be asked to do

- photoreal synthetic data at Isaac Sim quality
- Isaac-Lab-style massive parallel reinforcement learning
- deep Omniverse-style asset collaboration workflows

---

## 2. Isaac Sim: High-Fidelity Simulation and Digital Twins

Isaac Sim is better understood as a combination of simulator, asset system, renderer, and sensor stack rather than as a thin physics front-end.

### 2.1 When Isaac Sim should be a first choice

- you need high-fidelity rendering, materials, and lighting
- you need RGB / Depth / LiDAR / IMU and other sensor simulation
- you want OpenUSD for large-scale scene and asset management
- you care about synthetic data or digital twin workflows

### 2.2 Core value of Isaac Sim

| Capability | Description |
|------------|-------------|
| OpenUSD | strong scene graphs, references, instancing, and layering |
| PhysX | rigid bodies, joints, contact, materials, GPU physics |
| RTX rendering | near-photoreal visual approximation |
| Sensor simulation | camera, depth, LiDAR, IMU, contact, and more |
| SDG | synthetic data generation and annotation |

### 2.3 Main cost of Isaac Sim

- heavy installation and dependencies
- the team must accept USD / Omniverse / Kit workflows
- debugging often spans assets, rendering, physics, extensions, and bridges

If all you need is a fast manipulation prototype, Isaac Sim is not always the lowest-cost option.

---

## 3. Isaac Lab: Training Workflow First

Isaac Lab is the training-oriented part of the Isaac stack, especially useful when RL / IL requires many parallel environments.

### 3.1 When Isaac Lab should be a first choice

- you want large numbers of GPU-parallel environments
- you prefer manager-based environment organization
- you need a standard training flow for assets, worlds, rewards, resets, and randomization

### 3.2 What Isaac Lab really is

| Role | Description |
|------|-------------|
| not | a standalone general-purpose digital twin platform |
| more like | a training framework built on Isaac Sim / PhysX |
| core objects | scene cfg, observations, rewards, terminations, events |

If your focus is "how do I structure worlds, rewards, and batched training," Isaac Lab is often more directly relevant than the Isaac Sim GUI itself.

---

## 4. MuJoCo: Research Iteration First

MuJoCo is a strong choice for research-focused manipulation and control tasks, especially when:

- you need fast iteration on dynamics and controllers
- contact tuning and reproducible research matter
- photoreal visual fidelity is not the first priority

### 4.1 Strengths of MuJoCo

| Strength | Description |
|----------|-------------|
| mature research community | strong adoption in control, RL, and manipulation |
| compact model expression | MJCF represents joints, actuators, and sensors directly |
| lightweight runtime | fast prototyping for small to medium tasks |
| rich contact parameters | useful for research-driven contact tuning |

### 4.2 Boundaries of MuJoCo

- not the primary home for large collaborative asset libraries
- not the strongest choice for digital twins or photoreal worlds
- ROS2 engineering integration usually needs extra glue

---

## 5. SAPIEN / ManiSkill / robosuite: Manipulation Benchmarks

These platforms are closer to "toolchains designed for manipulation research."

### 5.1 Typical use cases

- grasping, pushing, drawers, doors, insertion, and assembly
- articulated objects and benchmark-heavy workflows
- research that needs structured interactive object pipelines

### 5.2 Typical advantages

| Platform | Character |
|----------|-----------|
| SAPIEN | focused on manipulation simulation and scene construction |
| ManiSkill | strong benchmark and task organization |
| robosuite | very fast to start for manipulation research |

### 5.3 Things to watch

- asset formats and world organization may differ from ROS / USD ecosystems
- industrial deployment stacks often require additional packaging work

---

## 6. How to Choose

### 6.1 Practical decision table

| Main goal | Better fit |
|-----------|------------|
| ROS2 system validation | Gazebo / Gazebo Sim |
| high-fidelity visual simulation | Isaac Sim |
| massive RL training | Isaac Lab |
| manipulation research and control validation | MuJoCo |
| articulated-object manipulation benchmarks | ManiSkill / SAPIEN / robosuite |

### 6.2 Platform combinations are normal

Many mature teams do not use a single simulator end to end. A more realistic stack often looks like:

- CAD / URDF / USD as the source of truth for assets
- Isaac Sim for high-fidelity scenes and data
- Isaac Lab or MuJoCo for training iteration
- Gazebo / ROS2 for integration testing

Using multiple platforms is normal, not a sign of failure.

---

## 7. Minimal Starting Advice

### 7.1 Research-heavy path

1. Start with MuJoCo or robosuite to validate whether the task is learnable.
2. Make observations, actions, rewards, and reset logic explicit.
3. Only then decide whether higher-fidelity migration is necessary.

### 7.2 Engineering-heavy path

1. Decide whether the deployment stack is ROS2-first.
2. If digital twins and rich vision matter, prefer Isaac Sim.
3. If system integration and navigation matter more, prefer Gazebo.

### 7.3 VLA / multimodal data path

1. Prioritize sensors, materials, lighting, and labeling interfaces.
2. Then decide whether large-scale parallel training is required.
3. In practice this often lands on Isaac Sim + Isaac Lab or SAPIEN / ManiSkill.

---

## 8. Division of Labor with Other Notes

- platform positioning and selection: this note
- asset building and import workflows: [Simulation Assets](仿真资产.en.md)
- world hierarchy, physics rules, randomization, and validation: [Simulation World Building & Physics Rules](仿真世界构建与物理规则.en.md)
- URDF / MJCF / SDF / USD formats and developer tooling: [Development Toolchain](../03_Ecosystem/开发工具链.en.md)
- NVIDIA-specific platforms and models: [NVIDIA Robotics Ecosystem](../03_Ecosystem/NVIDIA生态.en.md)
- ROS2 engineering stack: [ROS2](../03_Ecosystem/ROS2.en.md)

---

## 9. Conclusion

There is no universally best simulator. There is only the platform or platform combination that best matches the task, the training loop, the integration constraints, and the deployment target.

For most embodied AI projects, the more sustainable path is:

1. define the task and deployment constraints first
2. choose the platform stack second
3. separate asset, world, training, and integration concerns instead of mixing them together
