# 数据集与Benchmark

<!-- CONTENT-EXPAND-TODO (2026-05-15)
Reviewer: independent audit (Explore agent) - Batch 1 audit found this missing
Status: 表格与数据规模 SVG 完整,但缺关键 worked example + pitfalls
Gaps:
- Common pitfalls 缺失: RLDS 格式转换失败案例 / 数据污染检测 / 采样偏差陷阱
- Worked example 缺失: Bridge V2 数据 → diffusion policy 训练端到端代码示例
- §3-4 各 dataset 介绍较薄,需补 "首次复现踩坑" 实战经验
-->

机器人学习的进步离不开高质量的数据集和标准化的评测基准。然而，与NLP和CV领域相比，机器人数据的获取成本极高、规模极小。本文系统梳理当前主要的机器人数据集、数据格式标准，以及评测Benchmark。

> 相关笔记：[遥操作与数据收集](../04_Robot_Learning/遥操作与数据收集.md) | [VLA模型](VLA模型.md) | [开源模型汇总](开源模型汇总.md)

---

## 1. 机器人数据的稀缺性

### 1.1 规模对比

将机器人数据与其他AI领域的数据规模进行对比，可以直观感受差距：

| 领域 | 代表数据集 | 数据规模 | 获取方式 |
|------|----------|---------|---------|
| 语言模型 | Common Crawl | ~15T tokens | 网络爬取 |
| 图像识别 | LAION-5B | 50亿图文对 | 网络爬取 |
| 视频理解 | HD-VILA | 1亿视频clip | 网络爬取 |
| 自动驾驶 | nuScenes | 140万帧 | 车载传感器 |
| **机器人操作** | **Open X-Embodiment** | **~100万episodes** | **遥操作/RL** |
| **单个实验室** | **典型规模** | **1K-100K episodes** | **遥操作** |

机器人数据稀缺的根本原因：

$$\text{数据成本} = \frac{\text{硬件成本} + \text{人工成本} + \text{时间成本}}{\text{采集速度}}$$

- **硬件成本**：一台机械臂约5-50万元人民币
- **人工成本**：需要操作人员遥操作（VR/示教器/力反馈）
- **时间成本**：一次操作通常30秒-5分钟
- **采集速度**：一个人一天约采集100-500个episode

### 1.2 数据稀缺的应对策略

<!-- SVG-DESIGN-NOTES
Type: D (量化 / log 标度) — 6 个数据源沿 log 轴排序 + 4 个对策箭头指向特定档位
Q0: 机器人数据相对其它 AI 领域 (LLM 15T tokens、LAION 5B 图像) 小 4-8 个数量级; 因此应对策略不是"再多采"而是 4 个互补方向: 高效采 / 跨机构聚 / 仿真生成 / 非机器人迁移 — 每个策略针对 log 轴不同档位
Q1: 横向 log scale x-axis from 10^3 (single-lab) to 10^13 (Common Crawl); 每个数据集画一个 stylized 数据条 (粗细 ∝ size order); 4 个对策画成上方箭头, 指向其试图填补的 log 档位区间
Q2: 去标题: log 标尺 + 数据规模差距 + 4 个上箭头标 "高效采"/"聚合"/"仿真"/"web" → 立刻是 "数据稀缺及其 4 解法", 不是通用层级树
Q3: 删 12 个等大方框 + 13 任意箭头; "机器人数据稀缺" "更高效的采集" 等抽象 box 都换成数据点 + 区域标注
Q4: 数据集名 (Common Crawl / LAION / Open-X / DROID / single lab) 直接贴条端; 数字 (15T, 5B, 1M, 10K) JetBrains Mono; 策略名沿箭头注释
Q5: 全 var(--dia-*); 中英版可共用 SVG (本版用英中混)
-->
<div class="diagram">
<svg viewBox="0 0 820 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Log-scale data sizes across AI domains with four strategies bridging the robot data gap">
  <defs>
    <marker id="ds-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="410" y="30" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="14" font-style="italic" fill="var(--dia-stroke)">数据规模差距 · log scale, 不同 AI 领域 vs 机器人</text>

  <!-- horizontal log axis -->
  <line x1="60" y1="350" x2="780" y2="350" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <!-- ticks: 10^3 → 10^13 (step 80px) -->
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

  <!-- data points: vertical pin + tick label -->
  <!-- single lab: ~10^4 episodes, x=132 -->
  <line x1="132" y1="345" x2="132" y2="310" stroke="var(--dia-accent)" stroke-width="2.4"/>
  <circle cx="132" cy="310" r="5" fill="var(--dia-accent)" stroke="none"/>
  <text x="132" y="298" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">10 K</text>
  <text x="132" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">single lab</text>
  <text x="132" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">(typical)</text>

  <!-- DROID: ~76K episodes, x=190 (between 10^4 and 10^5) -->
  <line x1="200" y1="345" x2="200" y2="225" stroke="var(--dia-accent)" stroke-width="2.4"/>
  <circle cx="200" cy="225" r="5" fill="var(--dia-accent)" stroke="none"/>
  <text x="200" y="218" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">76 K</text>
  <text x="200" y="205" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">DROID (2024)</text>

  <!-- Open-X: ~10^6 episodes, x=276 -->
  <line x1="276" y1="345" x2="276" y2="155" stroke="var(--dia-accent)" stroke-width="2.4"/>
  <circle cx="276" cy="155" r="6" fill="var(--dia-accent)" stroke="var(--dia-accent-deep)" stroke-width="1.4"/>
  <text x="276" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">1.1 M</text>
  <text x="276" y="135" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">Open X-Embodiment</text>
  <text x="276" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">(2023, frontier)</text>

  <!-- nuScenes: ~1.4M frames, x=290 -->
  <line x1="290" y1="345" x2="290" y2="280" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <circle cx="290" cy="280" r="4" fill="var(--dia-blue)" stroke="none"/>
  <text x="318" y="284" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">nuScenes 1.4 M frames</text>

  <!-- LAION-5B: 5×10^9 images, x = ~ 540 -->
  <line x1="540" y1="345" x2="540" y2="125" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <circle cx="540" cy="125" r="6" fill="var(--dia-blue)" stroke="none"/>
  <text x="540" y="118" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">5 B</text>
  <text x="540" y="105" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">LAION-5B (images)</text>

  <!-- HD-VILA: 10^8 video clips, x = 420 -->
  <line x1="420" y1="345" x2="420" y2="190" stroke="var(--dia-blue)" stroke-width="2.4"/>
  <circle cx="420" cy="190" r="4" fill="var(--dia-blue)" stroke="none"/>
  <text x="420" y="183" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">100 M</text>
  <text x="420" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">HD-VILA</text>

  <!-- Common Crawl: ~15 T tokens, x = ~755 -->
  <line x1="745" y1="345" x2="745" y2="85" stroke="var(--dia-gold)" stroke-width="2.4"/>
  <circle cx="745" cy="85" r="7" fill="var(--dia-gold)" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <text x="745" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-gold)" font-weight="bold">15 T</text>
  <text x="745" y="60" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">Common Crawl (LLM)</text>

  <!-- gap shaded region: from single lab to LAION (rough) showing where robot data lives -->
  <rect x="60" y="430" width="240" height="22" fill="var(--dia-accent)" fill-opacity="0.15" stroke="var(--dia-accent)" stroke-width="0.6"/>
  <text x="180" y="446" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">where robot data lives  ·  10³ – 10⁶</text>
  <rect x="300" y="430" width="480" height="22" fill="var(--dia-blue)" fill-opacity="0.10" stroke="var(--dia-blue)" stroke-width="0.6"/>
  <text x="540" y="446" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">vision / video / text data live here  ·  10⁸ – 10¹³</text>

  <!-- four strategy arrows: pointing DOWN to specific log regions -->
  <!-- ① better telop → boost single-lab 10^4 → 10^5 -->
  <path d="M 100,415 Q 130,395 165,365" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  <text x="40" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-green)">① 高效采</text>
  <text x="40" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">ALOHA / UMI</text>

  <!-- ② aggregation → push to 10^6 (Open-X) -->
  <path d="M 240,415 Q 260,395 275,365" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  <text x="220" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-green)">② 聚合</text>
  <text x="220" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Open-X · DROID</text>

  <!-- ③ sim generation → 10^8+ -->
  <path d="M 380,415 Q 400,395 420,365" fill="none" stroke="var(--dia-gold)" stroke-width="1.6" marker-end="url(#ds-arr)"/>
  <text x="380" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-gold)">③ 仿真生成</text>
  <text x="380" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">Isaac / ManiSkill</text>

  <!-- ④ non-robot web pretrain → 10^9 - 10^13 -->
  <path d="M 600,415 Q 660,395 720,365" fill="none" stroke="var(--dia-accent)" stroke-width="2" marker-end="url(#ds-arr)"/>
  <text x="600" y="412" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-accent)">④ 非机器人 web 迁移</text>
  <text x="600" y="424" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">RT-2 · R3M · VIP</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 机器人数据稀缺不是一句话，是 log 轴上 4-8 个数量级的差距。四种对策分别针对 log 轴的不同档位。</p>


---

## 2. 主要数据集

### 2.1 大规模聚合数据集

#### Open X-Embodiment (Google DeepMind, 2023)

| 属性 | 值 |
|------|-----|
| **规模** | 100万+ episodes |
| **来源** | 21个机构的33个子数据集 |
| **机器人类型** | 22种不同形态 |
| **任务描述** | 160,000+种 |
| **数据格式** | RLDS (TensorFlow Datasets) |
| **存储大小** | ~1.3TB |

**包含的子数据集（部分）**：

| 子数据集 | episodes | 机器人 | 任务 |
|---------|---------|--------|------|
| RT-1 Robot Action | 130K | Everyday Robots | 桌面操作 |
| Bridge V2 | 60K | WidowX | 厨房操作 |
| Language Table | 442K | xArm | 语言指导推块 |
| TACO-RL | 6K | Franka | 操作+RL |
| BC-Z | 26K | Google Robot | 多任务 |
| Cable Routing | 1K | UR5 | 布线 |

#### DROID (2024)

| 属性 | 值 |
|------|-----|
| **规模** | 76,000 episodes |
| **来源** | 13个机构标准化采集 |
| **机器人** | Franka Emika Panda |
| **采集方式** | SpaceMouse遥操作 |
| **场景** | 564个独立场景 |
| **标注** | 自然语言指令 + 操作类型标签 |

**DROID的核心价值**：

- 统一的采集协议保证了数据质量一致性
- 多场景数据覆盖真实世界的多样性
- 标准化的数据格式方便模型训练

### 2.2 特定场景数据集

#### Bridge V2 (UC Berkeley, 2023)

| 属性 | 值 |
|------|-----|
| **规模** | 60,096 episodes |
| **机器人** | WidowX 250 6DoF |
| **场景** | 24个厨房/桌面环境 |
| **物体** | 100+种日常物品 |
| **控制** | 末端执行器位姿控制 |
| **频率** | 5Hz |

#### RH20T (Tsinghua, 2023)

| 属性 | 值 |
|------|-----|
| **规模** | 110,000+ episodes |
| **机器人** | 多种（Franka, UR5, xArm等） |
| **任务** | 147种操作任务 |
| **特点** | 包含丰富的多模态标注 |
| **传感器** | RGB + 深度 + 力/力矩 + 触觉 |

#### AgiBot World (AgiBot, 2025)

| 属性 | 值 |
|------|-----|
| **规模** | 100万+ episodes（目标） |
| **机器人** | AgiBot自研平台 |
| **场景** | 工业 + 家庭 |
| **特点** | 中国首个大规模开源机器人数据集 |
| **数据质量** | 自动化质量筛选管线 |

#### RoboTurk (Stanford, 2018)

| 属性 | 值 |
|------|-----|
| **规模** | 2,000+ demonstrations |
| **采集方式** | 云端众包（浏览器遥操作） |
| **机器人** | Sawyer |
| **贡献** | 首次探索众包式机器人数据采集 |

---

## 3. 数据格式标准

不同数据集使用不同的存储格式，格式转换是实际使用中的常见痛点。

### 3.1 主要格式对比

| 格式 | 使用者 | 基础 | 特点 | 适合场景 |
|------|--------|------|------|---------|
| **RLDS** | Open X-Embodiment, Octo | TensorFlow Datasets | 标准化episode结构 | 大规模预训练 |
| **LeRobot格式** | LeRobot, HuggingFace | Parquet + 视频 | 体积小，HuggingFace生态 | 快速原型 |
| **HDF5** | robomimic, RH20T | HDF5 | 灵活嵌套结构 | 研究实验 |
| **zarr** | Diffusion Policy | Zarr | 分块存储，适合并行 | 大规模训练 |
| **rosbag** | ROS生态 | ROS | 原始传感器记录 | 数据采集 |

### 3.2 RLDS格式详解

RLDS（Reinforcement Learning Datasets）是Open X-Embodiment采用的标准格式：

```python
# 一个RLDS episode的典型结构
episode = {
    "steps": [
        {
            "observation": {
                "image": np.array([256, 256, 3]),      # RGB图像
                "wrist_image": np.array([128, 128, 3]), # 腕部相机（可选）
                "state": np.array([7]),                 # 本体感觉状态
            },
            "action": np.array([7]),  # 7DoF: dx,dy,dz,drx,dry,drz,gripper
            "reward": 0.0,
            "is_terminal": False,
            "is_first": True,
            "language_instruction": "pick up the red cup",
        },
        # ... 后续步骤
    ]
}
```

### 3.3 LeRobot格式详解

LeRobot采用更现代的数据格式，基于Parquet和视频文件：

```
dataset/
├── meta/
│   ├── info.json           # 数据集元信息
│   ├── episodes.jsonl      # episode级元数据
│   └── stats.json          # 统计信息（均值、标准差）
├── data/
│   ├── chunk-000/
│   │   ├── episode_000000.parquet  # 结构化数据
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

**LeRobot格式的优势**：

- 视频压缩大幅减少存储空间（相比原始图像帧）
- 与HuggingFace Hub无缝集成
- Parquet格式支持高效的列式查询

### 3.4 格式转换

在实践中，经常需要在不同格式间转换：

```python
# RLDS → LeRobot（LeRobot提供官方工具）
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

## 4. Benchmark与评测

### 4.1 仿真Benchmark

#### SIMPLER (Google DeepMind, 2024)

| 属性 | 值 |
|------|-----|
| **定位** | 评估真实机器人策略的仿真替代 |
| **核心价值** | 仿真评测分数与真实机器人性能高度相关 |
| **任务** | 基于Google Robot和WidowX的桌面操作 |
| **特点** | 无需真实机器人即可评估VLA性能 |

#### LIBERO (UT Austin, 2023)

| 属性 | 值 |
|------|-----|
| **定位** | 终身学习（Lifelong Learning）Benchmark |
| **平台** | MuJoCo仿真 |
| **任务套件** | 5个套件，每套10个任务 |
| **评测维度** | 空间泛化、物体泛化、目标泛化、长时间任务 |

**LIBERO的5个任务套件**：

| 套件 | 评测维度 | 难度 |
|------|---------|------|
| LIBERO-Spatial | 同物体不同空间关系 | 低 |
| LIBERO-Object | 同任务不同物体 | 中 |
| LIBERO-Goal | 同场景不同目标 | 中 |
| LIBERO-Long | 长序列组合任务 | 高 |
| LIBERO-100 | 100个多样化任务 | 高 |

#### RLBench (Imperial College, 2020)

| 属性 | 值 |
|------|-----|
| **平台** | CoppeliaSim + PyRep |
| **任务** | 100+ 精心设计的操作任务 |
| **观测** | RGB, 深度, 关节状态, 末端位姿 |
| **特点** | 每个任务提供变体用于泛化测试 |

#### MetaWorld (Stanford, 2020)

| 属性 | 值 |
|------|-----|
| **平台** | MuJoCo |
| **任务** | 50个桌面操作任务 |
| **定位** | 多任务学习和元学习评测 |
| **评测模式** | ML1 (单任务), ML10 (10任务), ML45 (45任务), MT10, MT50 |

#### ManiSkill (UCSD/Hillbot, 2023)

| 属性 | 值 |
|------|-----|
| **平台** | SAPIEN |
| **版本** | ManiSkill2, ManiSkill3 |
| **任务** | 20+ 操作任务类别 |
| **特点** | GPU并行环境，速度极快 |
| **物体** | 使用PartNet-Mobility的可交互物体 |

### 4.2 Benchmark对比

<!-- SVG-DESIGN-NOTES
Type: D (量化) — 2D 散点: x = sim throughput (eps/h, log), y = correlation with real-robot success rate
Q0: 在 5 个 sim benchmark + 真实评测的二维空间中: MetaWorld/ManiSkill 极快 (sim throughput 高) 但与真实机器人 success 低相关; SIMPLER 是新近 sweet spot (中等速度 + 高相关); 真实评测 (右上) gold standard 但 throughput < 10 eps/h
Q1: 真实坐标轴: x = log sim throughput (1 → 10^5 eps/h), y = corr with real success rate (0 → 1.0); 每个 benchmark 一个圆点 (半径 ∝ task 数); SIMPLER 用 accent 高亮; 右上角真实评测用 gold; 用一条虚线 "real-evaluation frontier" 显示 trade-off
Q2: 去标题: 坐标轴 + 5 个 benchmark 点 + SIMPLER 突出 + 真实评测在 (low throughput, high corr) → 立刻是 sim-vs-real trade-off, 不是普通 benchmark list
Q3: 删 7 个等大方框 + 5 直箭头; "Real-matched MuJoCo" 等冗余 box 改用坐标位置编码
Q4: benchmark 名贴点旁; 任务数标在点内; 数字坐标值在坐标轴 tick 上
Q5: 全 var(--dia-*); 中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="2D scatter of robot benchmarks: simulation throughput vs correlation with real-robot success">
  <defs>
    <marker id="bb-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" font-style="italic" fill="var(--dia-stroke)">benchmark trade-off · sim throughput × 真实成功率相关性</text>

  <!-- chart area -->
  <!-- y axis: corr 0..1, mapped to y 380..60 (320 px range) -->
  <!-- x axis: log throughput 10^0..10^5, mapped to x 80..700 (620 px / 5 decades = 124 px/decade) -->

  <!-- axes -->
  <line x1="80" y1="60" x2="80" y2="380" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <line x1="80" y1="380" x2="720" y2="380" stroke="var(--dia-stroke)" stroke-width="1.2"/>

  <!-- y-axis ticks: corr 0, 0.2, ..., 1.0 -->
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

  <!-- x-axis log ticks -->
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

  <!-- pareto-frontier dashed -->
  <path d="M 110,80 Q 300,140 480,200 Q 600,280 680,350" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="240" y="115" font-family="Fraunces, Georgia, serif" font-size="10" font-style="italic" fill="var(--dia-stroke-soft)">∼ pareto frontier (more throughput → less realism)</text>

  <!-- data points: cx, cy, r ∝ task count -->
  <!-- Real-robot: throughput=5 eps/h → x=170; corr=1.0 → y=60; r=8 (gold) -->
  <circle cx="170" cy="60" r="9" fill="var(--dia-gold)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="185" y="56" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-gold)">Real-robot eval</text>
  <text x="185" y="70" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">gold standard, ≤ 10 eps/h</text>

  <!-- SIMPLER: throughput=200 eps/h → x ≈ 380; corr=0.85 → y≈108; r=6 (highlighted) -->
  <circle cx="380" cy="108" r="8" fill="var(--dia-accent)" stroke="var(--dia-accent-deep)" stroke-width="2"/>
  <text x="395" y="105" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)" font-weight="bold">SIMPLER (2024)</text>
  <text x="395" y="118" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">∼ 200 eps/h · corr ≈ 0.85</text>

  <!-- LIBERO: throughput=1000 eps/h → x≈496; corr=0.55 → y≈236; r=5 (5 suites × 10 task) -->
  <circle cx="496" cy="236" r="6" fill="var(--dia-green)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="510" y="232" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-green)">LIBERO</text>
  <text x="510" y="246" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">50 tasks (5 × 10), MuJoCo</text>

  <!-- RLBench: throughput=300 eps/h → x≈420; corr=0.4 → y≈252; r=7 (100 tasks) -->
  <circle cx="420" cy="252" r="7" fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="350" y="280" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-blue)">RLBench</text>
  <text x="350" y="294" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">100+ tasks, CoppeliaSim</text>

  <!-- MetaWorld: throughput=5000 → x ≈ 580; corr=0.3 → y≈284; r=5 (50 tasks) -->
  <circle cx="580" cy="284" r="6" fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="595" y="280" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-blue)">MetaWorld</text>
  <text x="595" y="294" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">50 tasks, MuJoCo</text>

  <!-- ManiSkill: throughput=50K (GPU parallel) → x ≈ 705; corr=0.35 → y≈272; r=5 -->
  <circle cx="700" cy="272" r="6" fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="1"/>
  <text x="565" y="335" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-blue)">ManiSkill (GPU par.)</text>
  <text x="565" y="349" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">20+ tasks, SAPIEN, ~50 K eps/h</text>
  <line x1="630" y1="333" x2="685" y2="285" stroke="var(--dia-stroke-soft)" stroke-width="0.8" stroke-dasharray="2,3"/>

  <!-- callout for SIMPLER -->
  <text x="270" y="160" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)">sweet spot:</text>
  <text x="270" y="175" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)">sim cheap + real correlated</text>
  <path d="M 350,165 Q 360,140 375,120" fill="none" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#bb-arr)"/>
</svg>
</div>
<p class="figure-caption">Figure 2 — 没有"最好"的 benchmark：throughput 越高与真实成功率相关性越弱。SIMPLER 是 2024 后逐渐流行的 sweet spot，但替代真实评测仍需谨慎。</p>


### 4.3 评测指标

| 指标 | 定义 | 适用场景 |
|------|------|---------|
| **Success Rate** | 成功完成任务的比例 | 最常用的主指标 |
| **Partial Success** | 部分完成（如抓起但未放对） | 长序列任务 |
| **Generalization Gap** | 训练分布内外的成功率差 | 泛化能力评估 |
| **Sample Efficiency** | 达到阈值成功率所需数据量 | 数据效率评估 |
| **Inference Latency** | 单次推理耗时 | 实时性评估 |
| **Cross-Embodiment Transfer** | 在新机器人上的零样本/少样本性能 | 迁移能力评估 |

---

## 5. 数据质量与标注

### 5.1 数据质量的关键维度

| 维度 | 说明 | 影响 |
|------|------|------|
| **演示质量** | 操作者的熟练程度 | 直接影响模仿学习上限 |
| **多样性** | 场景、物体、光照变化 | 决定泛化能力 |
| **标注准确性** | 语言指令与动作的对应 | 影响语言条件策略 |
| **时间对齐** | 图像与动作的时间戳同步 | 对因果建模至关重要 |
| **标定精度** | 相机内外参的准确性 | 影响3D相关任务 |

### 5.2 自动化质量筛选

近期工作开始探索自动化的数据质量评估：

1. **成功率过滤**：剔除失败的演示
2. **一致性检查**：检测动作和观测的时间一致性
3. **VLM打分**：用VLM评估演示的语义正确性
4. **离群值检测**：剔除动作分布中的异常值

---

## 6. 未来方向

### 6.1 数据规模的扩展路径

| 路径 | 代表 | 可行性 | 规模天花板 |
|------|------|--------|-----------|
| 更多遥操作 | DROID, AgiBot World | 高 | 千万级episodes |
| 仿真生成 | ManiSkill, Isaac Gym | 高 | 亿级episodes |
| 视频生成模型 | UniSim | 中 | 理论上无限 |
| 自主探索 | Reset-free RL | 低（现阶段） | 依赖算法进步 |
| 互联网视频 | RT-2预训练 | 高 | 十亿级视频 |

### 6.2 标准化趋势

- **RLDS和LeRobot格式正在成为事实标准**
- HuggingFace Hub作为统一的数据分发平台
- 数据集卡片（Datasheet）记录采集条件、偏差、使用限制

### 6.3 关键挑战

1. **长尾问题**：罕见但重要的操作场景数据极少
2. **负样本**：大多数数据集只包含成功的演示，缺少失败案例
3. **跨具身标准化**：不同机器人的观测和动作空间差异巨大
4. **隐私与安全**：包含真实环境的数据可能涉及隐私问题
5. **评测公平性**：不同模型使用不同训练数据，横向对比困难

---

**参考文献**：

- Open X-Embodiment Collaboration, "Open X-Embodiment: Robotic Learning Datasets and RT-X Models", 2023
- Khazatsky et al., "DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset", RSS 2024
- Walke et al., "BridgeData V2: A Dataset for Robot Learning at Scale", CoRL 2023
- Fang et al., "RH20T: A Comprehensive Robotic Dataset for Learning Diverse Skills in One-Shot", 2023
- Li et al., "SIMPLER: Simulated Manipulation Policy Evaluation for Real Robot Setups", 2024
- Liu et al., "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning", NeurIPS 2023
- James et al., "RLBench: The Robot Learning Benchmark", RA-L 2020
- Yu et al., "Meta-World: A Benchmark and Evaluation for Multi-Task and Meta Reinforcement Learning", CoRL 2020
- Gu et al., "ManiSkill2: A Unified Benchmark for Generalizable Manipulation Skills", ICLR 2023
