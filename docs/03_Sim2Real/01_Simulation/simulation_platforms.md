# 仿真平台

机器人研发里的“仿真平台”首先是一个入口问题，而不是一个背诵参数表的问题。你需要先决定自己是在做：

- 研究型动力学与控制验证
- 大规模并行 RL / IL 训练
- 高保真视觉与合成数据生成
- ROS2 联调与系统集成
- 数字孪生与工程部署

这篇笔记只负责回答“平台是什么、适合什么、如何选”。关于资产怎么做，见 [仿真资产](仿真资产.md)；关于资产如何拼成可训练、可评测、可迁移的世界，见 [仿真世界构建与物理规则](仿真世界构建与物理规则.md)。

---

## 阅读路线

如果你的问题是下面这些，应该优先读对应页面：

| 问题 | 推荐页面 |
|------|----------|
| 我应该选哪个平台 | 本文 |
| 机器人、物体、传感器、材质怎么做成可用资产 | [仿真资产](仿真资产.md) |
| 世界怎么组织、接触和物理怎么调 | [仿真世界构建与物理规则](仿真世界构建与物理规则.md) |
| URDF / MJCF / SDF / USD 语法和工具怎么用 | [开发工具链](../03_Ecosystem/开发工具链.md) |
| Sim2Real 随机化怎么做 | [Sim2Real](../../02_Robot_Learning/02_Methods/Sim2Real.md) |

---

## 平台地图

<!-- SVG-DESIGN-NOTES
Type: D (量化 — 仿真平台在 throughput vs 视觉保真度 2D 散点)
Q0: 选仿真平台是 "throughput vs 视觉保真" trade-off:Isaac Lab 极高吞吐 (10^4 env/sec) 但视觉相对简化;Isaac Sim 视觉极高但吞吐降一档;MuJoCo 快而无视觉;Webots/Gazebo 中等
Q1: 2D 散点 x=throughput (log env/sec),y=视觉保真度;每平台为彩色圆点;典型选区用边框标
Q2: 去标题:log x 轴 + 圆点散布 + 典型用例区 = 仿真平台 trade-off DNA
Q3: 删去原 560×720 树形 box
Q4: 每平台标 throughput + 典型用例
Q5: 全用 var(--dia-*);英文版镜像
-->
<div class="diagram">
<svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="仿真平台 throughput vs 视觉保真度 散点">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">仿真平台 — Throughput vs 视觉保真</text>
  <text x="380" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">x: 单 GPU 并行 throughput (log env/sec)　y: 视觉/渲染保真度</text>

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
  <text x="56" y="220" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="var(--dia-stroke)" transform="rotate(-90 56 220)">视觉保真</text>

  <!-- Platform dots -->
  <circle cx="560" cy="320" r="14" fill="var(--dia-blue)" opacity="0.65" stroke="var(--dia-blue)" stroke-width="1.8"/>
  <text x="560" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Isaac Lab</text>
  <text x="560" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">~10⁴-10⁵ env · RL 训练</text>

  <circle cx="380" cy="110" r="14" fill="var(--dia-accent-deep)" opacity="0.65" stroke="var(--dia-accent-deep)" stroke-width="1.8"/>
  <text x="380" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Isaac Sim</text>
  <text x="380" y="78" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">photoreal · 数据合成 · 数字孪生</text>

  <circle cx="500" cy="290" r="12" fill="var(--dia-green)" opacity="0.65" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="500" y="270" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">MuJoCo</text>
  <text x="500" y="256" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">~10³-10⁴ · 接触动力学 · 控制研究</text>

  <circle cx="240" cy="180" r="11" fill="var(--dia-gold)" opacity="0.55" stroke="var(--dia-gold)" stroke-width="1.4"/>
  <text x="240" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">Gazebo · Webots</text>
  <text x="240" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-gold)">ROS 联调 · 中等保真</text>

  <circle cx="160" cy="240" r="9" fill="var(--dia-stroke-soft)" opacity="0.55"/>
  <text x="160" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke)">PyBullet</text>
  <text x="160" y="208" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">轻量原型</text>

  <circle cx="320" cy="140" r="11" fill="var(--dia-accent)" opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="320" y="122" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-stroke)">CARLA · LGSVL</text>
  <text x="320" y="108" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">自驾仿真</text>

  <!-- Annotation: typical use case zones -->
  <rect x="450" y="270" width="220" height="80" rx="6" fill="var(--dia-blue)" opacity="0.08" stroke="var(--dia-blue)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="560" y="244" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="var(--dia-blue)">大规模 RL 训练区</text>
</svg>
</div>
<p class="figure-caption">Figure — 仿真平台 trade-off DNA：log x 轴 throughput 跨 3 数量级,y 轴视觉保真低-高;右下蓝色"大规模 RL"区是 Isaac Lab/MuJoCo 主场;左上是高保真合成数据 (Isaac Sim/CARLA)。</p>


---

## 选平台时真正要看的维度

| 维度 | 你要问的问题 |
|------|--------------|
| 物理保真度 | 接触、关节、摩擦、驱动是否足够可靠 |
| 视觉保真度 | 渲染、材质、灯光、传感器是否逼真 |
| 训练吞吐 | 能否大规模并行 roll-out |
| 资产生态 | 机器人、场景、可交互物体是否容易导入 |
| 软件集成 | ROS2、日志、调试、部署是否顺手 |
| 可维护性 | 团队是否能长期维护脚本、格式、依赖 |

一个很常见的误区是：拿“最强平台”当默认答案。实际更合理的做法是按任务选平台，而不是按平台追任务。

---

## 平台速览

| 平台 | 最擅长的问题 | 强项 | 局限 |
|------|--------------|------|------|
| MuJoCo | 研究型控制、操作、接触调参 | 轻量、稳定、研究社区成熟 | 大型场景资产与照片级渲染弱 |
| Gazebo / Gazebo Sim | ROS2 集成、系统联调 | ROS 生态近、SDF 世界描述强 | 大规模训练和视觉质感一般 |
| Isaac Sim | 高保真视觉、数字孪生、传感器 | USD 原生、RTX、PhysX、合成数据 | 环境重、工程复杂度高 |
| Isaac Lab | 大规模并行 RL / IL 训练 | 与 Isaac Sim/PhysX 紧耦合，吞吐高 | 对平台栈依赖较强 |
| SAPIEN / ManiSkill | 操作任务、交互资产、Benchmark | 对 articulated objects 很友好 | 工业级数字孪生能力不如 Omniverse |
| robosuite | 研究型操作任务快速起步 | 上手快、操作基准成熟 | 世界规模和工业集成有限 |

---

## 1. ROS2 与 Gazebo：工程联调优先

ROS2 本身不是仿真器，但在工程实践里它常常和仿真平台绑定出现。原因很简单：训练之外，你还要处理消息通信、TF、传感器数据流、导航栈、控制接口和部署调试。

### 1.1 什么时候优先考虑 Gazebo

- 你要做 ROS2 系统集成
- 你需要基于 SDF 描述完整世界
- 你更关心话题桥接、插件扩展和工程可维护性
- 你不以照片级渲染或超大规模 GPU 并行为第一目标

### 1.2 Gazebo 的价值

| 能力 | 说明 |
|------|------|
| 世界描述 | `world/model/link/joint/light/plugin` 都能放进统一配置 |
| ROS2 集成 | 与 ros_gz / nav2 / rviz2 等工具链结合自然 |
| 插件化 | 控制器、传感器、桥接插件成熟 |
| 场景级表达 | 对多模型场景组织比单纯 URDF 更自然 |

### 1.3 Gazebo 不该承担什么

- 照片级视觉数据生成
- Isaac Lab 那种超大规模并行强化学习
- 极其复杂的 Omniverse 式资产协作工作流

---

## 2. Isaac Sim：高保真仿真与数字孪生

Isaac Sim 更像“仿真平台 + 资产系统 + 渲染系统 + 传感器系统”的组合，而不只是一个物理引擎前端。

### 2.1 什么时候优先考虑 Isaac Sim

- 你需要高保真视觉、RTX 渲染、复杂材质与灯光
- 你要做 RGB / Depth / LiDAR / IMU 等传感器仿真
- 你希望用 OpenUSD 管理大型世界和资产
- 你要做合成数据生成或数字孪生

### 2.2 Isaac Sim 的核心价值

| 能力 | 说明 |
|------|------|
| OpenUSD | 场景图、引用、实例化、分层组织强 |
| PhysX | 刚体、关节、接触、材质、GPU 物理 |
| RTX 渲染 | 照片级视觉近似 |
| 传感器仿真 | 相机、深度、LiDAR、IMU、接触等 |
| SDG | 自动标注和大规模数据生成 |

### 2.3 Isaac Sim 的主要代价

- 安装和依赖较重
- 团队需要接受 USD / Omniverse / Kit 的工作方式
- 问题排查往往横跨资产、渲染、物理、扩展和桥接

如果你只是想快速验证一个操作策略，Isaac Sim 不一定是最低成本选择。

---

## 3. Isaac Lab：训练工作流优先

Isaac Lab 是 Isaac 栈里更偏“训练框架”的部分，尤其适合需要大规模并行环境的 RL / IL 场景。

### 3.1 什么时候优先考虑 Isaac Lab

- 你要在 GPU 上并行跑大量环境
- 你需要 manager-based 环境组织
- 你要把资产、世界、随机化、奖励、重置组织成标准训练流水线

### 3.2 Isaac Lab 更像什么

| 角色 | 说明 |
|------|------|
| 不是 | 单独的通用数字孪生平台 |
| 更像 | 基于 Isaac Sim/PhysX 的训练环境框架 |
| 核心对象 | scene cfg、observations、rewards、terminations、events |

如果你的重点是“世界怎么搭、奖励怎么写、如何并行训练”，Isaac Lab 的价值会比 Isaac Sim GUI 本身更直接。

---

## 4. MuJoCo：研究效率优先

MuJoCo 很适合研究型操作和控制任务，尤其是在以下情况下：

- 你需要快速迭代动力学与控制设计
- 你重视接触调参与研究复现
- 你不把高保真视觉当成第一优先级

### 4.1 MuJoCo 的长处

| 长处 | 说明 |
|------|------|
| 研究社区成熟 | 控制、强化学习、操作任务资料多 |
| 模型表达紧凑 | MJCF 对关节、执行器、传感器表达直接 |
| 运行轻量 | 小到中型任务原型开发快 |
| 接触参数丰富 | 便于做研究型调参 |

### 4.2 MuJoCo 的边界

- 大型协作资产库不是它的主战场
- 数字孪生和复杂视觉世界不是它的强项
- 与 ROS2 的工程联调通常需要额外工作

---

## 5. SAPIEN / ManiSkill / robosuite：操作任务与 Benchmark

这类平台更接近“为 manipulation 研究而设计”的工具栈。

### 5.1 适用场景

- 抓取、推拉、抽屉、门、装配等操作任务
- 交互物体和 benchmark 资产较多
- 需要对 articulated objects 做系统化组织

### 5.2 常见优点

| 平台 | 特点 |
|------|------|
| SAPIEN | 面向操作仿真和场景构建 |
| ManiSkill | 围绕 benchmark、任务和数据组织 |
| robosuite | 操作研究入门快、示例成熟 |

### 5.3 需要注意的点

- 资产格式和世界表达方式与 ROS / USD 体系不完全一致
- 迁移到工业软件栈时可能需要额外包装

---

## 6. 平台怎么选

### 6.1 一个实用决策表

| 你的主要目标 | 更合适的平台 |
|--------------|--------------|
| ROS2 系统联调 | Gazebo / Gazebo Sim |
| 高保真视觉仿真 | Isaac Sim |
| 超大规模 RL 训练 | Isaac Lab |
| 操作研究与控制验证 | MuJoCo |
| articulated object manipulation benchmark | ManiSkill / SAPIEN / robosuite |

### 6.2 组合往往比单选更现实

很多成熟团队并不是只用一个平台，而是：

- 用 CAD/URDF/USD 做资产源头
- 用 Isaac Sim 做高保真场景与数据
- 用 Isaac Lab 或 MuJoCo 做训练迭代
- 用 Gazebo / ROS2 做系统联调

平台组合是正常情况，不是“栈不统一”的失败。

---

## 7. 最小起步建议

### 7.1 偏研究

1. 先用 MuJoCo 或 robosuite 验证任务可学性
2. 明确观测、动作、奖励、reset
3. 再决定是否迁到更高保真平台

### 7.2 偏工程

1. 先明确部署栈是不是 ROS2
2. 如果需要数字孪生和视觉仿真，优先 Isaac Sim
3. 如果重点是系统联调和导航，优先 Gazebo

### 7.3 偏 VLA / 多模态数据构建

1. 优先考虑传感器、材质、灯光、标注接口
2. 再看是否需要大规模并行训练
3. 通常会落在 Isaac Sim + Isaac Lab 或 SAPIEN/ManiSkill 的组合上

---

## 8. 与其他页面的分工

- 平台定位与选型：本文
- 资产制作与导入： [仿真资产](仿真资产.md)
- 世界层次、物理规则、随机化与验证： [仿真世界构建与物理规则](仿真世界构建与物理规则.md)
- URDF / MJCF / SDF / USD 格式与开发工具： [开发工具链](../03_Ecosystem/开发工具链.md)
- NVIDIA 系列平台与模型生态： [NVIDIA生态](../03_Ecosystem/NVIDIA生态.md)
- ROS2 工程体系： [ROS2生态](../03_Ecosystem/ROS2.md)

---

## 9. 结论

仿真平台没有“绝对最好”，只有“和当前目标最匹配”。如果你把平台选型问题拆成资产、世界、训练、集成、迁移这几层，很多原本混在一起的决策就会变得清晰。

对大多数具身智能项目来说，更可持续的路线通常是：

1. 先明确任务和部署约束
2. 再选平台组合
3. 最后把资产层、世界层、训练层分开治理
