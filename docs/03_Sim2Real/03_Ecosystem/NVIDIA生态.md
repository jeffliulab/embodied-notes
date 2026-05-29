# NVIDIA 机器人生态

> NVIDIA 正在构建从仿真训练到边缘部署的全栈机器人 AI 生态。本文梳理 NVIDIA 机器人相关的主要平台、工具和模型。
>
> 本文重点是 NVIDIA 生态的定位与栈内关系，不展开做成百科式仿真教程。关于 USD 资产如何制作和导入，见 [仿真资产](../01_Simulation/仿真资产.md)；关于世界如何组织、随机化以及物理规则如何配置，见 [仿真世界构建与物理规则](../01_Simulation/仿真世界构建与物理规则.md)。

---

## 生态全景

<!-- SVG-DESIGN-NOTES
Type: A (结构 — NVIDIA 全栈分层 + 跨层流向)
Q0: NVIDIA 机器人栈的几何 DNA 是"四层 + 数据流":底层 CUDA 加速 → 中层 OpenUSD 资产标准 + Omniverse → 上层 Isaac Sim/Lab/ROS 仿真训练 → 顶层 GR00T/Cosmos 基础模型;同时世界知识从 Cosmos 横向喂 sim,训练好的策略再下到 Jetson 边缘
Q1: 4 层水平条带 (底→顶用颜色加深),每层放对应产品 box;右侧单独 Jetson 边缘部署柱;左侧 Cosmos→Sim 横向知识箭头
Q2: 去标题:四层带 + 右侧边缘柱 + 横向 Cosmos 注入 = NVIDIA 栈 DNA
Q3: 删去原 730×860 viewBox 13 个等大方框 + 交叉箭头
Q4: 每层标主导产品 + 角色;层间数据流标 "训练好的策略" "世界知识" 等
Q5: 全用 var(--dia-*);英文版镜像
-->
<div class="diagram">
<svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NVIDIA 机器人栈分层架构">
  <defs>
    <marker id="nv-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">NVIDIA 机器人栈 — 四层 + 横向知识注入</text>
  <text x="380" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">底层 CUDA → 资产 OpenUSD → 仿真 Isaac → 基础模型 GR00T/Cosmos → 边缘 Jetson</text>

  <!-- Layer 4: foundation models (top) -->
  <rect x="60" y="68" width="520" height="60" rx="6" fill="var(--dia-accent)" opacity="0.20" stroke="var(--dia-accent)" stroke-width="1.6"/>
  <text x="70" y="86" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">L4 · 基础模型</text>
  <rect x="180" y="80" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="260" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">GR00T N1 (humanoid)</text>
  <rect x="350" y="80" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="430" y="102" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Cosmos (world model)</text>

  <!-- Layer 3: simulation + GPU planning -->
  <rect x="60" y="148" width="520" height="60" rx="6" fill="var(--dia-blue)" opacity="0.20" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="70" y="166" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-blue)">L3 · 仿真训练 + GPU 加速</text>
  <rect x="170" y="160" width="120" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="230" y="182" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Isaac Sim/Lab</text>
  <rect x="300" y="160" width="120" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="360" y="182" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Isaac ROS</text>
  <rect x="430" y="160" width="120" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="490" y="182" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">cuRobot</text>

  <!-- Layer 2: assets + collaboration -->
  <rect x="60" y="228" width="520" height="60" rx="6" fill="var(--dia-green)" opacity="0.20" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="70" y="246" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-green)">L2 · 资产 + 协作</text>
  <rect x="180" y="240" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="260" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">OpenUSD 标准</text>
  <rect x="350" y="240" width="160" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="430" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Omniverse 数字孪生</text>

  <!-- Layer 1: compute foundation -->
  <rect x="60" y="308" width="520" height="60" rx="6" fill="var(--dia-stroke-soft)" opacity="0.20" stroke="var(--dia-stroke-soft)" stroke-width="1.6"/>
  <text x="70" y="326" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">L1 · 计算底座</text>
  <rect x="180" y="320" width="330" height="36" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="345" y="342" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">CUDA · cuDNN · TensorRT · GPU H100/A100</text>

  <!-- Right column: edge deployment -->
  <rect x="612" y="68" width="120" height="300" rx="6" fill="var(--dia-bg-deep)" stroke="var(--dia-accent-deep)" stroke-width="1.6" stroke-dasharray="3 3"/>
  <text x="672" y="96" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">边缘部署</text>
  <text x="672" y="112" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Edge</text>
  <rect x="624" y="180" width="96" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent-deep)" stroke-width="1.4"/>
  <text x="672" y="204" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-stroke)">Jetson</text>
  <text x="672" y="218" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Orin / Thor</text>
  <text x="672" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">真机推理</text>

  <!-- Vertical training arrow (sim → edge, RIGHT side) -->
  <line x1="490" y1="196" x2="624" y2="200" stroke="var(--dia-accent-deep)" stroke-width="1.8" stroke-dasharray="3 2" marker-end="url(#nv-arr)"/>
  <text x="558" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">训练好的策略</text>

  <!-- Lateral knowledge injection: Cosmos → Sim -->
  <path d="M 430 120 Q 380 138 290 160" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#nv-arr)"/>
  <text x="380" y="146" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">世界知识注入仿真</text>

  <!-- Vertical layer arrows (between L1↔L2↔L3↔L4) -->
  <line x1="100" y1="308" x2="100" y2="290" stroke="var(--dia-stroke-soft)" stroke-width="1" marker-end="url(#nv-arr)"/>
  <line x1="100" y1="228" x2="100" y2="210" stroke="var(--dia-stroke-soft)" stroke-width="1" marker-end="url(#nv-arr)"/>
  <line x1="100" y1="148" x2="100" y2="130" stroke="var(--dia-stroke-soft)" stroke-width="1" marker-end="url(#nv-arr)"/>

  <text x="100" y="396" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">↑ 每层依赖下层 GPU 加速</text>
</svg>
</div>
<p class="figure-caption">Figure — NVIDIA 栈的几何 DNA：从下到上 4 层 (CUDA → OpenUSD → Isaac → GR00T/Cosmos)；右侧 Jetson 边缘列接收训练好的策略；Cosmos 世界知识横向注入 Isaac Sim。</p>


---

## Omniverse：协作与数字孪生平台

Omniverse 是 NVIDIA 的实时 3D 协作与仿真平台，基于 **OpenUSD (Universal Scene Description)** 标准。

### 核心能力

| 能力 | 说明 |
|------|------|
| **USD 原生** | 所有资产、场景、物理属性以 USD 格式描述 |
| **RTX 渲染** | 实时光线追踪，支持 PBR 材质 |
| **PhysX 5** | GPU 加速的刚体、软体、流体、粒子物理 |
| **多人协作** | 多用户同时编辑同一场景（类似 Google Docs） |
| **数字孪生** | 连接 IoT 数据，实时同步物理世界状态 |
| **扩展系统** | Kit SDK 构建自定义应用 |

### USD 格式要点

USD 是 Pixar 开发的场景描述格式，NVIDIA 将其推广为机器人仿真的通用场景格式：

```python
# USD 场景操作示例
from pxr import Usd, UsdGeom, UsdPhysics

stage = Usd.Stage.CreateNew("robot_scene.usda")
xform = UsdGeom.Xform.Define(stage, "/World/Robot")
UsdPhysics.RigidBodyAPI.Apply(xform.GetPrim())
UsdPhysics.CollisionAPI.Apply(xform.GetPrim())
stage.Save()
```

如果你关心的不是 USD API 本身，而是“它如何承载机器人、物体、场景、传感器等仿真资产”，应继续看 [仿真资产](../01_Simulation/仿真资产.md)。

---

## Isaac Sim：逼真物理仿真

Isaac Sim 是基于 Omniverse 的机器人仿真器，提供照片级渲染与高保真物理。

### 主要特性

| 特性 | 说明 |
|------|------|
| **物理引擎** | PhysX 5 (GPU)，支持刚体/软体/粒子/流体 |
| **渲染** | RTX 光线追踪，支持 Path Tracing 和 Ray Tracing |
| **传感器仿真** | RGB, Depth, LiDAR, IMU, 超声波, Contact |
| **域随机化** | 内置灯光/纹理/物理参数随机化 |
| **数据生成** | 合成数据生成 (SDG)，自动标注 |
| **ROS2 桥接** | 内置 ROS2 Bridge，话题/服务/TF 直通 |

### 域随机化配置

域随机化是 Sim2Real 的关键技术，Isaac Sim 提供内置支持：

```python
# 域随机化示例：随机化物体颜色、灯光、物理参数
from omni.isaac.core.utils.randomization import randomize

randomize.light_intensity(min=500, max=5000)         # 灯光强度
randomize.object_color(prim_path="/World/object")     # 物体颜色
randomize.physics_material(
    static_friction=(0.3, 0.8),
    dynamic_friction=(0.2, 0.6),
    restitution=(0.0, 0.3)
)
randomize.camera_pose(
    position_noise=0.02,  # 2cm 位置噪声
    rotation_noise=2.0     # 2度 旋转噪声
)
```

更系统的世界随机化、时间系统、传感器规则和接触调参，请看 [仿真世界构建与物理规则](../01_Simulation/仿真世界构建与物理规则.md) 与 [Sim2Real](../../02_Robot_Learning/02_Methods/Sim2Real.md)。

---

## Isaac Lab：大规模并行 RL 训练

Isaac Lab 是 Isaac Gym 和 Orbit 的继任者，专注于大规模并行强化学习训练。

### 与前身的关系

| 项目 | 状态 | 说明 |
|------|------|------|
| Isaac Gym (Preview) | 已归档 | 最早的 GPU 并行 RL 环境 |
| Orbit | 已合并 | 面向操作任务的框架 |
| **Isaac Lab** | 当前活跃 | 统一继任者 |

### 核心架构

```python
# Isaac Lab 环境定义
from omni.isaac.lab.envs import ManagerBasedRLEnv, ManagerBasedRLEnvCfg
from omni.isaac.lab.scene import InteractiveSceneCfg

class FrankaCubePickCfg(ManagerBasedRLEnvCfg):
    scene: InteractiveSceneCfg = InteractiveSceneCfg(num_envs=4096)
    
    # 观测定义
    observations = ObservationsCfg(
        policy=ObsGroup(
            joint_pos=ObsTerm(func=mdp.joint_pos_rel),
            joint_vel=ObsTerm(func=mdp.joint_vel_rel),
            object_pos=ObsTerm(func=mdp.object_position_in_robot_root_frame),
        )
    )
    
    # 奖励定义
    rewards = RewardsCfg(
        reaching=RewardTerm(func=mdp.approach_object, weight=1.0),
        grasping=RewardTerm(func=mdp.grasp_success, weight=10.0),
    )
    
    # 终止条件
    terminations = TerminationsCfg(
        time_out=DoneTerm(func=mdp.time_out, time_out=True),
    )
```

### 训练流程

```bash
# 使用 RSL-RL 训练
python source/standalone/workflows/rsl_rl/train.py \
    --task Isaac-Franka-Cube-Pick-v0 \
    --num_envs 4096 \
    --max_iterations 1000

# 使用 rl_games 训练
python source/standalone/workflows/rl_games/train.py \
    --task Isaac-Ant-v0 \
    --num_envs 8192
```

更多强化学习与机器人结合的内容请参阅 [强化学习在机器人中的应用](../../02_Robot_Learning/02_Methods/强化学习在机器人中的应用.md)。

---

## Isaac ROS：GPU 加速的 ROS2

Isaac ROS 提供一系列 GPU 加速的 ROS2 包，替代传统 CPU 实现，大幅提升实时感知性能。

### 主要包

| 包名 | 功能 | 加速比 (vs CPU) |
|------|------|----------------|
| `isaac_ros_visual_slam` | 视觉惯性里程计 (cuVSLAM) | ~10x |
| `isaac_ros_nvblox` | 3D 重建 + 代价地图 | ~20x |
| `isaac_ros_dnn_inference` | TensorRT 推理 | ~5-15x |
| `isaac_ros_image_pipeline` | 去畸变/裁剪/缩放 | ~5x |
| `isaac_ros_apriltag` | AprilTag 检测 | ~10x |
| `isaac_ros_freespace_segmentation` | 可行驶区域分割 | GPU 原生 |
| `isaac_ros_object_detection` | 目标检测 (SSD/YOLO) | GPU 原生 |
| `isaac_ros_foundationpose` | 6-DoF 物体位姿估计 | GPU 原生 |

### 部署架构

```bash
# Isaac ROS 通过 Docker 部署
# 拉取 Isaac ROS 基础容器
docker pull nvcr.io/nvidia/isaac/ros:humble-3.1.0

# 启动容器 (挂载 GPU)
docker run --runtime nvidia -it --rm \
    --network host \
    -v /dev:/dev \
    nvcr.io/nvidia/isaac/ros:humble-3.1.0

# 容器内启动 cuVSLAM
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py \
    image_topic:=/camera/image_raw \
    camera_info_topic:=/camera/camera_info
```

---

## Cosmos：世界基础模型

Cosmos 是 NVIDIA 在 CES 2025 发布的世界基础模型 (World Foundation Model)，用于理解和生成物理世界。

### 核心概念

| 概念 | 说明 |
|------|------|
| **世界模型** | 预测给定动作后环境的未来状态 |
| **物理AI** | 理解物理规律（重力、碰撞、摩擦）的 AI |
| **视频生成** | 生成物理一致的未来视频帧 |

### 应用场景

1. **合成数据生成**：为机器人训练生成多样化场景数据
2. **动作规划**：在"想象空间"中预演动作效果
3. **异常检测**：预测正常行为，检测偏差

更多世界模型相关内容请参阅 [世界模型与视频生成](../../02_Robot_Learning/01_Foundations/世界模型与视频生成.md)。

---

## GR00T N1：人形机器人基础模型

GR00T (Generalist Robot 00 Technology) 是 NVIDIA 面向人形机器人的基础模型系列。

### N1 模型架构

| 组件 | 说明 |
|------|------|
| **视觉编码器** | 处理多视角 RGB 输入 |
| **语言理解** | 接受自然语言任务指令 |
| **动作生成** | 输出全身关节动作序列 |
| **训练数据** | Cosmos 合成数据 + 遥操作数据 |
| **部署硬件** | Jetson Thor |

### 训练管线

1. **大规模预训练**：利用 Cosmos 世界模型生成海量训练数据
2. **仿真微调**：在 Isaac Lab 中针对具体任务微调
3. **真机适应**：少量真机数据 fine-tune，完成 Sim2Real

---

## cuRobot：GPU 加速的运动规划

cuRobot (CUDA Robot) 将运动规划的核心计算迁移到 GPU，实现毫秒级规划。

### 性能对比

| 算法 | MoveIt2 (CPU) | cuRobot (GPU) | 加速比 |
|------|--------------|---------------|--------|
| 碰撞检测 | ~10ms | ~0.1ms | ~100x |
| 逆运动学 | ~5ms | ~0.05ms | ~100x |
| 运动规划 | ~500ms | ~5ms | ~100x |
| 批量规划 (1000) | ~500s | ~5s | ~100x |

### 主要功能

- **CUDA 加速碰撞检测**：基于 Signed Distance Field (SDF)
- **批量逆运动学**：同时求解数千个 IK 问题
- **轨迹优化**：CUDA 加速的 CHOMP/TrajOpt
- **与 MoveIt 2 集成**：作为 MoveIt 2 的加速后端

```python
from curobo.types.robot import RobotConfig
from curobo.wrap.reacher.motion_gen import MotionGen, MotionGenConfig

# 加载机器人配置
robot_cfg = RobotConfig.from_dict({
    "robot_file": "franka.yml",
    "ee_link": "panda_hand",
})

# 创建运动生成器
motion_gen_config = MotionGenConfig.load_from_robot_config(
    robot_cfg, world_model="shelf_scene.yml",
    num_ik_seeds=32, num_trajectories=4
)
motion_gen = MotionGen(motion_gen_config)

# GPU 加速规划
result = motion_gen.plan_single(start_state, goal_pose)
trajectory = result.get_interpolated_plan()  # 毫秒级完成
```

---

## Jetson 部署平台

Jetson 是 NVIDIA 面向边缘 AI 的嵌入式计算平台，是机器人推理部署的首选。

| 型号 | GPU 核心 | AI 算力 (TOPS) | 内存 | 功耗 | 适用场景 |
|------|---------|---------------|------|------|----------|
| Jetson Orin Nano | 1024 CUDA | 40 | 8GB | 7-15W | 入门级机器人 |
| Jetson Orin NX | 1024 CUDA | 70-100 | 8/16GB | 10-25W | 中端机器人 |
| Jetson AGX Orin | 2048 CUDA | 200-275 | 32/64GB | 15-60W | 高端/人形机器人 |
| Jetson Thor (下一代) | Blackwell GPU | 800 | 128GB | ~100W | 人形机器人基础模型 |

更多计算平台详情请参阅 [计算平台](../../01_Robot_Engineering/15_Hardware_Overview/计算平台.md)。

---

## 生态整合建议

### 典型开发流程

1. **建模**：在 Omniverse 中使用 USD 构建场景
2. **仿真训练**：Isaac Lab 大规模并行训练 RL 策略
3. **感知集成**：Isaac ROS 在 Jetson 上运行 GPU 加速感知
4. **运动规划**：cuRobot 提供毫秒级规划
5. **部署**：TensorRT 优化模型，Jetson 边缘部署

### 注意事项

- NVIDIA 生态对硬件有强依赖，需要 NVIDIA GPU
- 部分组件仅支持特定 GPU 架构（如 Isaac Sim 需要 RTX）
- 版本兼容性需要关注：CUDA 版本、JetPack 版本、ROS2 版本需匹配
- 学术研究可结合 MuJoCo 等开源工具使用，不必完全绑定 NVIDIA 生态

---

## 相关链接

- [NVIDIA Isaac 官方文档](https://developer.nvidia.com/isaac)
- [Isaac Lab GitHub](https://github.com/isaac-sim/IsaacLab)
- [Isaac ROS GitHub](https://github.com/NVIDIA-ISAAC-ROS)
- 相关笔记：[仿真平台](../01_Simulation/simulation_platforms.md) | [仿真资产](../01_Simulation/仿真资产.md) | [仿真世界构建与物理规则](../01_Simulation/仿真世界构建与物理规则.md) | [世界模型与视频生成](../../02_Robot_Learning/01_Foundations/世界模型与视频生成.md) | [强化学习在机器人中的应用](../../02_Robot_Learning/02_Methods/强化学习在机器人中的应用.md) | [计算平台](../../01_Robot_Engineering/15_Hardware_Overview/计算平台.md)
