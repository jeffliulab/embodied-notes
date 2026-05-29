# NVIDIA Robotics Ecosystem

> NVIDIA is building a full-stack robotics AI ecosystem spanning from simulation training to edge deployment. This article surveys NVIDIA's major platforms, tools, and models related to robotics.
>
> This note focuses on the position of NVIDIA's stack and the relationships between its components, not on being a full simulation encyclopedia. For how USD-backed robot, object, scene, and sensor assets are actually built, see [Simulation Assets](../01_Simulation/仿真资产.en.md). For how worlds are organized, randomized, and tuned physically, see [Simulation World Building & Physics Rules](../01_Simulation/仿真世界构建与物理规则.en.md).

---

## Ecosystem Overview

<!-- SVG-DESIGN-NOTES
Type: A (structure — NVIDIA full-stack layered + cross-layer flow)
Q0: NVIDIA's robotics stack DNA is "four layers + data flow": CUDA at the bottom → OpenUSD assets + Omniverse → Isaac Sim/Lab/ROS for sim training → GR00T/Cosmos foundation models on top; world knowledge feeds laterally into sim while trained policies cascade down to Jetson at the edge
Q1: Four horizontal layer bands (darker as you go up) + right column for Jetson edge + lateral Cosmos→Sim arrow
Q2: Unlabeled: four bands + right edge column + lateral world-knowledge arrow = NVIDIA stack DNA
Q3: Removed original 730×860 viewBox 13-box mess with crossing arrows
Q4: Each layer labeled with key products and role; data flows annotated with "trained policy" / "world knowledge"
Q5: All var(--dia-*); EN mirrors geometry
-->
<div class="diagram">
<svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NVIDIA robotics stack layered architecture">
  <defs>
    <marker id="nv-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">NVIDIA Robotics Stack — Four Layers + Lateral Knowledge Injection</text>
  <text x="380" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">L1 CUDA → L2 OpenUSD → L3 Isaac → L4 GR00T/Cosmos → edge Jetson</text>

  <rect x="60" y="68" width="520" height="60" rx="6" fill="var(--dia-accent)" opacity="0.20" stroke="var(--dia-accent)" stroke-width="1.6"/>
  <text x="70" y="86" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">L4 · Foundation models</text>
  <rect x="180" y="80" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="260" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">GR00T N1 (humanoid)</text>
  <rect x="350" y="80" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="430" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Cosmos (world model)</text>

  <rect x="60" y="148" width="520" height="60" rx="6" fill="var(--dia-blue)" opacity="0.20" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="70" y="166" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-blue)">L3 · Sim training + GPU accel</text>
  <rect x="170" y="160" width="120" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="230" y="182" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Isaac Sim/Lab</text>
  <rect x="300" y="160" width="120" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="360" y="182" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Isaac ROS</text>
  <rect x="430" y="160" width="120" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="490" y="182" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">cuRobot</text>

  <rect x="60" y="228" width="520" height="60" rx="6" fill="var(--dia-green)" opacity="0.20" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="70" y="246" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-green)">L2 · Assets + collab</text>
  <rect x="180" y="240" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="260" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">OpenUSD standard</text>
  <rect x="350" y="240" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="430" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Omniverse digital twin</text>

  <rect x="60" y="308" width="520" height="60" rx="6" fill="var(--dia-stroke-soft)" opacity="0.20" stroke="var(--dia-stroke-soft)" stroke-width="1.6"/>
  <text x="70" y="326" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">L1 · Compute foundation</text>
  <rect x="180" y="320" width="330" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="345" y="342" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">CUDA · cuDNN · TensorRT · GPU H100/A100</text>

  <rect x="612" y="68" width="120" height="300" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-accent-deep)" stroke-width="1.6" stroke-dasharray="3 3"/>
  <text x="672" y="96" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">Edge deploy</text>
  <text x="672" y="112" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">on-device</text>
  <rect x="624" y="180" width="96" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent-deep)" stroke-width="1.4"/>
  <text x="672" y="204" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-stroke)">Jetson</text>
  <text x="672" y="218" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Orin / Thor</text>
  <text x="672" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">real-robot inference</text>

  <line x1="490" y1="196" x2="624" y2="200" stroke="var(--dia-accent-deep)" stroke-width="1.8" stroke-dasharray="3 2" marker-end="url(#nv-arr)"/>
  <text x="558" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">trained policy</text>

  <path d="M 430 120 Q 380 138 290 160" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#nv-arr)"/>
  <text x="380" y="146" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">world knowledge → sim</text>

  <line x1="100" y1="308" x2="100" y2="290" stroke="var(--dia-stroke-soft)" stroke-width="1" marker-end="url(#nv-arr)"/>
  <line x1="100" y1="228" x2="100" y2="210" stroke="var(--dia-stroke-soft)" stroke-width="1" marker-end="url(#nv-arr)"/>
  <line x1="100" y1="148" x2="100" y2="130" stroke="var(--dia-stroke-soft)" stroke-width="1" marker-end="url(#nv-arr)"/>

  <text x="100" y="396" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">↑ each layer depends on GPU below</text>
</svg>
</div>
<p class="figure-caption">Figure — NVIDIA stack DNA: four layers stack bottom-up (CUDA → OpenUSD → Isaac → GR00T/Cosmos); the right Jetson column receives trained policies; Cosmos world knowledge feeds laterally into Isaac Sim.</p>


---

## Omniverse: Collaboration and Digital Twin Platform

Omniverse is NVIDIA's real-time 3D collaboration and simulation platform, built on the **OpenUSD (Universal Scene Description)** standard.

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| **USD Native** | All assets, scenes, and physical properties described in USD format |
| **RTX Rendering** | Real-time ray tracing with PBR material support |
| **PhysX 5** | GPU-accelerated rigid body, soft body, fluid, and particle physics |
| **Multi-user Collaboration** | Multiple users edit the same scene simultaneously (similar to Google Docs) |
| **Digital Twin** | Connect IoT data, synchronize physical world state in real time |
| **Extension System** | Build custom applications with Kit SDK |

### USD Format Essentials

USD is a scene description format developed by Pixar. NVIDIA promotes it as a universal scene format for robot simulation:

```python
# USD scene manipulation example
from pxr import Usd, UsdGeom, UsdPhysics

stage = Usd.Stage.CreateNew("robot_scene.usda")
xform = UsdGeom.Xform.Define(stage, "/World/Robot")
UsdPhysics.RigidBodyAPI.Apply(xform.GetPrim())
UsdPhysics.CollisionAPI.Apply(xform.GetPrim())
stage.Save()
```

If your question is not about the USD API itself but about how USD carries robots, objects, materials, scenes, and sensors as simulation assets, continue with [Simulation Assets](../01_Simulation/仿真资产.en.md).

---

## Isaac Sim: Photorealistic Physics Simulation

Isaac Sim is an Omniverse-based robot simulator providing photo-level rendering and high-fidelity physics.

### Key Features

| Feature | Description |
|---------|-------------|
| **Physics Engine** | PhysX 5 (GPU), supports rigid/soft body/particles/fluids |
| **Rendering** | RTX ray tracing, supports Path Tracing and Ray Tracing |
| **Sensor Simulation** | RGB, Depth, LiDAR, IMU, Ultrasonic, Contact |
| **Domain Randomization** | Built-in lighting/texture/physics parameter randomization |
| **Data Generation** | Synthetic Data Generation (SDG), automatic annotation |
| **ROS2 Bridge** | Built-in ROS2 Bridge, direct topic/service/TF passthrough |

### Domain Randomization Configuration

Domain randomization is a key technique for Sim2Real; Isaac Sim provides built-in support:

```python
# Domain randomization example: randomize object color, lighting, physics parameters
from omni.isaac.core.utils.randomization import randomize

randomize.light_intensity(min=500, max=5000)         # Light intensity
randomize.object_color(prim_path="/World/object")     # Object color
randomize.physics_material(
    static_friction=(0.3, 0.8),
    dynamic_friction=(0.2, 0.6),
    restitution=(0.0, 0.3)
)
randomize.camera_pose(
    position_noise=0.02,  # 2cm position noise
    rotation_noise=2.0     # 2-degree rotation noise
)
```

For a more systematic discussion of world randomization, timing, sensor rules, and contact tuning, see [Simulation World Building & Physics Rules](../01_Simulation/仿真世界构建与物理规则.en.md) and [Sim2Real](../../02_Robot_Learning/02_Methods/Sim2Real.en.md).

---

## Isaac Lab: Large-scale Parallel RL Training

Isaac Lab is the successor to Isaac Gym and Orbit, focusing on large-scale parallel reinforcement learning training.

### Relationship with Predecessors

| Project | Status | Description |
|---------|--------|-------------|
| Isaac Gym (Preview) | Archived | First GPU-parallel RL environment |
| Orbit | Merged | Manipulation-focused framework |
| **Isaac Lab** | Currently active | Unified successor |

### Core Architecture

```python
# Isaac Lab environment definition
from omni.isaac.lab.envs import ManagerBasedRLEnv, ManagerBasedRLEnvCfg
from omni.isaac.lab.scene import InteractiveSceneCfg

class FrankaCubePickCfg(ManagerBasedRLEnvCfg):
    scene: InteractiveSceneCfg = InteractiveSceneCfg(num_envs=4096)
    
    # Observation definition
    observations = ObservationsCfg(
        policy=ObsGroup(
            joint_pos=ObsTerm(func=mdp.joint_pos_rel),
            joint_vel=ObsTerm(func=mdp.joint_vel_rel),
            object_pos=ObsTerm(func=mdp.object_position_in_robot_root_frame),
        )
    )
    
    # Reward definition
    rewards = RewardsCfg(
        reaching=RewardTerm(func=mdp.approach_object, weight=1.0),
        grasping=RewardTerm(func=mdp.grasp_success, weight=10.0),
    )
    
    # Termination conditions
    terminations = TerminationsCfg(
        time_out=DoneTerm(func=mdp.time_out, time_out=True),
    )
```

### Training Workflow

```bash
# Train using RSL-RL
python source/standalone/workflows/rsl_rl/train.py \
    --task Isaac-Franka-Cube-Pick-v0 \
    --num_envs 4096 \
    --max_iterations 1000

# Train using rl_games
python source/standalone/workflows/rl_games/train.py \
    --task Isaac-Ant-v0 \
    --num_envs 8192
```

For more on reinforcement learning combined with robotics, see [Reinforcement Learning in Robotics](../../02_Robot_Learning/02_Methods/强化学习在机器人中的应用.en.md).

---

## Isaac ROS: GPU-accelerated ROS2

Isaac ROS provides a series of GPU-accelerated ROS2 packages that replace traditional CPU implementations, significantly improving real-time perception performance.

### Key Packages

| Package | Function | Speedup (vs CPU) |
|---------|----------|------------------|
| `isaac_ros_visual_slam` | Visual-inertial odometry (cuVSLAM) | ~10x |
| `isaac_ros_nvblox` | 3D reconstruction + costmap | ~20x |
| `isaac_ros_dnn_inference` | TensorRT inference | ~5-15x |
| `isaac_ros_image_pipeline` | Undistortion/crop/resize | ~5x |
| `isaac_ros_apriltag` | AprilTag detection | ~10x |
| `isaac_ros_freespace_segmentation` | Drivable area segmentation | GPU native |
| `isaac_ros_object_detection` | Object detection (SSD/YOLO) | GPU native |
| `isaac_ros_foundationpose` | 6-DoF object pose estimation | GPU native |

### Deployment Architecture

```bash
# Isaac ROS deploys via Docker
# Pull Isaac ROS base container
docker pull nvcr.io/nvidia/isaac/ros:humble-3.1.0

# Start container (mount GPU)
docker run --runtime nvidia -it --rm \
    --network host \
    -v /dev:/dev \
    nvcr.io/nvidia/isaac/ros:humble-3.1.0

# Launch cuVSLAM inside container
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py \
    image_topic:=/camera/image_raw \
    camera_info_topic:=/camera/camera_info
```

---

## Cosmos: World Foundation Model

Cosmos is a World Foundation Model released by NVIDIA at CES 2025, designed to understand and generate the physical world.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **World Model** | Predicts future environment states given actions |
| **Physical AI** | AI that understands physical laws (gravity, collision, friction) |
| **Video Generation** | Generates physically consistent future video frames |

### Application Scenarios

1. **Synthetic data generation**: Generate diverse scene data for robot training
2. **Action planning**: Preview action effects in "imagination space"
3. **Anomaly detection**: Predict normal behavior, detect deviations

For more on world models, see [World Models and Video Generation](../../02_Robot_Learning/01_Foundations/世界模型与视频生成.en.md).

---

## GR00T N1: Humanoid Robot Foundation Model

GR00T (Generalist Robot 00 Technology) is NVIDIA's foundation model series for humanoid robots.

### N1 Model Architecture

| Component | Description |
|-----------|-------------|
| **Vision Encoder** | Processes multi-view RGB inputs |
| **Language Understanding** | Accepts natural language task instructions |
| **Action Generation** | Outputs whole-body joint action sequences |
| **Training Data** | Cosmos synthetic data + teleoperation data |
| **Deployment Hardware** | Jetson Thor |

### Training Pipeline

1. **Large-scale pretraining**: Generate massive training data using the Cosmos world model
2. **Simulation fine-tuning**: Fine-tune for specific tasks in Isaac Lab
3. **Real-robot adaptation**: Fine-tune with a small amount of real-robot data to complete Sim2Real

---

## cuRobot: GPU-accelerated Motion Planning

cuRobot (CUDA Robot) migrates core motion planning computations to the GPU, achieving millisecond-level planning.

### Performance Comparison

| Algorithm | MoveIt2 (CPU) | cuRobot (GPU) | Speedup |
|-----------|--------------|---------------|---------|
| Collision checking | ~10ms | ~0.1ms | ~100x |
| Inverse kinematics | ~5ms | ~0.05ms | ~100x |
| Motion planning | ~500ms | ~5ms | ~100x |
| Batch planning (1000) | ~500s | ~5s | ~100x |

### Key Features

- **CUDA-accelerated collision checking**: Based on Signed Distance Field (SDF)
- **Batch inverse kinematics**: Solve thousands of IK problems simultaneously
- **Trajectory optimization**: CUDA-accelerated CHOMP/TrajOpt
- **MoveIt 2 integration**: Serves as an accelerated backend for MoveIt 2

```python
from curobo.types.robot import RobotConfig
from curobo.wrap.reacher.motion_gen import MotionGen, MotionGenConfig

# Load robot configuration
robot_cfg = RobotConfig.from_dict({
    "robot_file": "franka.yml",
    "ee_link": "panda_hand",
})

# Create motion generator
motion_gen_config = MotionGenConfig.load_from_robot_config(
    robot_cfg, world_model="shelf_scene.yml",
    num_ik_seeds=32, num_trajectories=4
)
motion_gen = MotionGen(motion_gen_config)

# GPU-accelerated planning
result = motion_gen.plan_single(start_state, goal_pose)
trajectory = result.get_interpolated_plan()  # Completed in milliseconds
```

---

## Jetson Deployment Platform

Jetson is NVIDIA's embedded computing platform for edge AI, the preferred choice for robot inference deployment.

| Model | GPU Cores | AI Performance (TOPS) | Memory | Power | Suitable Scenarios |
|-------|----------|----------------------|--------|-------|-------------------|
| Jetson Orin Nano | 1024 CUDA | 40 | 8GB | 7-15W | Entry-level robots |
| Jetson Orin NX | 1024 CUDA | 70-100 | 8/16GB | 10-25W | Mid-range robots |
| Jetson AGX Orin | 2048 CUDA | 200-275 | 32/64GB | 15-60W | High-end/humanoid robots |
| Jetson Thor (next gen) | Blackwell GPU | 800 | 128GB | ~100W | Humanoid robot foundation models |

For more computing platform details, see [Computing Platforms](../../01_Robot_Engineering/15_Hardware_Overview/计算平台.en.md).

---

## Ecosystem Integration Recommendations

### Typical Development Workflow

1. **Modeling**: Build scenes in Omniverse using USD
2. **Simulation training**: Large-scale parallel RL policy training in Isaac Lab
3. **Perception integration**: Run GPU-accelerated perception with Isaac ROS on Jetson
4. **Motion planning**: Millisecond-level planning with cuRobot
5. **Deployment**: TensorRT-optimized models, Jetson edge deployment

### Considerations

- NVIDIA ecosystem has strong hardware dependency, requiring NVIDIA GPUs
- Some components only support specific GPU architectures (e.g., Isaac Sim requires RTX)
- Version compatibility requires attention: CUDA version, JetPack version, and ROS2 version must match
- Academic research can combine open-source tools like MuJoCo; full commitment to the NVIDIA ecosystem is not necessary

---

## Related Links

- [NVIDIA Isaac Official Documentation](https://developer.nvidia.com/isaac)
- [Isaac Lab GitHub](https://github.com/isaac-sim/IsaacLab)
- [Isaac ROS GitHub](https://github.com/NVIDIA-ISAAC-ROS)
- Related notes: [Simulation Platforms](../01_Simulation/simulation_platforms.en.md) | [Simulation Assets](../01_Simulation/仿真资产.en.md) | [Simulation World Building & Physics Rules](../01_Simulation/仿真世界构建与物理规则.en.md) | [World Models and Video Generation](../../02_Robot_Learning/01_Foundations/世界模型与视频生成.en.md) | [Reinforcement Learning in Robotics](../../02_Robot_Learning/02_Methods/强化学习在机器人中的应用.en.md) | [Computing Platforms](../../01_Robot_Engineering/15_Hardware_Overview/计算平台.en.md)
