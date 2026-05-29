# DROID — Distributed Robot Operations Dataset

> *Stanford / Berkeley / CMU / UCL / 多家合作 2024 年 5 月发布 **DROID**:**76k demonstration**,**350 小时**,**564 个 scene**,**86 个家居 / 办公任务**,横跨 18 institutions 协作收集。是迄今最大、最 diverse 的 manipulation 数据集之一,被 π0、Helix、OpenVLA 等用作训练。*
>
> **难度**:Intermediate
> **前置知识**:[VLA 模型](../01_Foundations/VLA模型.md)、[模仿学习](../02_Methods/模仿学习.md)
> **后续阅读**:[Open X-Embodiment](数据集与Benchmark.md)、[π0](../03_Models/Pi0_Physical_Intelligence.md)

---

## 1. 为什么需要大规模 manipulation 数据

机器人学的核心瓶颈是 **真机数据**:
- 单 lab 一年能采几百 demo
- 数据 ≠ 互联网,无 self-supervised 来源
- 不同 lab 的 robot / camera / 任务全不同 → 数据不能合并

→ 需要**跨 lab 标准化**,让数据可累积。

---

## 2. DROID 关键数字

| 维度 | DROID |
|---|---|
| **Demonstrations** | 76,000 |
| **Total hours** | 350 |
| **Tasks** | 86 (家居 / 办公) |
| **Scenes** | 564 不同物理环境 |
| **Institutions** | 18 (Stanford / Berkeley / CMU / UCL / etc.) |
| **Robot** | **Franka Panda 7-DOF arm** (唯一选定) |
| **Cameras** | 2 wrist + 1 third-person (3 RGB-D) |

→ 比 RoboNet (2019, ~15k demo) 大 5×;比 Bridge V2 (2023, 50k) 大 1.5×。

---

## 3. 数据收集协议

DROID 强调**标准化**:

### 3.1 硬件统一

所有 18 lab 必须用:
- Franka Panda Research 3 (~$30k)
- 3 个 RealSense D435 / D435i 相机 (固定位置)
- ALOHA-style teleoperation rig

### 3.2 软件统一

- 同一 ROS noetic + droid_policy_learning 代码
- Action 格式:end-effector 6-DOF + gripper 1-DOF
- 30 Hz 控制频率

### 3.3 任务标准

86 个固定任务清单:
- 家居 (kitchen 清理 / 整理 / 烹饪准备等)
- 办公 (整理桌面 / 操作电子设备)
- 工具使用 (拧螺丝 / 剪纸 / 倒水)

每个任务在每个 lab 收 ≥ 50 demo。

---

## 4. 数据格式

每个 demo:
```python
{
    'observation': {
        'image_primary': (T, 480, 640, 3),  # 第三视角
        'image_left_wrist': (T, 480, 640, 3),
        'image_right_wrist': (T, 480, 640, 3),
        'depth_primary': (T, 480, 640),  # 可选
        'joint_position': (T, 7),
        'gripper_position': (T, 1),
        'language_instruction': str,
    },
    'action': {
        'cartesian_position': (T, 6),  # x,y,z + roll,pitch,yaw
        'gripper_position': (T, 1),
    },
    'metadata': {
        'success': bool,
        'date': str,
        'institution': str,
    }
}
```

---

## 5. 数据规模可视化

<!-- SVG-DESIGN-NOTES
Type: D (量化对比 / 规模) + 元数据点注释
Q0: DROID 在 demo 数量上不是最大的(OXE 总量 1M+ 大它一个数量级)，但它是「跨 18 机构标准化」的最大单 robot (Franka) 数据集——这才是它被 π0 / Helix / OpenVLA 采用的真正原因
Q1: 横向条形 + log Y 轴(10^4 → 10^6 跨越 100×)；每个条形带 institution 数标注；DROID 用 accent + 加粗机构数字 (18 inst!) 高亮；OXE 标 "mixed robots" 区分
Q2: 去掉标题：「log 轴 + 18 inst 高亮 + 单 Franka 标记」——其他 dataset 图都用线性轴；DROID 的本质就是「不是数量第一,而是 institutional diversity 第一」
Q3: 删去原线性 Y 轴(无法表达 10^4-10^6 跨度)；删去多余 grid；保留 log tick + dataset name
Q4: 机构数 / 年份 / 总 demo 数都贴对应 bar；不用 legend
Q5: 全用 var(--dia-*)；标签英文，中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DROID dataset comparison on log scale">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">DROID 不是 demo 最多,但 institutional diversity 最高 (log Y)</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">单 Franka robot 上唯一跨 18 lab 标准化采集 · 这是它被 π0 / Helix / OpenVLA 采用的关键</text>

  <!-- Y axis: log scale, 10^4 to 10^7 -->
  <line x1="100" y1="80" x2="100" y2="280" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="100" y1="280" x2="720" y2="280" stroke="var(--dia-stroke)" stroke-width="1"/>

  <!-- Y tick: 10^4, 10^5, 10^6, 10^7 — y positions: 280, 213.3, 146.7, 80 -->
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="95" y1="280" x2="100" y2="280" stroke="var(--dia-stroke)"/>
    <text x="92" y="284" text-anchor="end">10⁴</text>
    <line x1="95" y1="213" x2="720" y2="213" stroke="var(--dia-stroke-soft)" stroke-width="0.4" stroke-dasharray="2 4"/>
    <text x="92" y="217" text-anchor="end">10⁵</text>
    <line x1="95" y1="147" x2="720" y2="147" stroke="var(--dia-stroke-soft)" stroke-width="0.4" stroke-dasharray="2 4"/>
    <text x="92" y="151" text-anchor="end">10⁶</text>
    <line x1="95" y1="80" x2="720" y2="80" stroke="var(--dia-stroke-soft)" stroke-width="0.4" stroke-dasharray="2 4"/>
    <text x="92" y="84" text-anchor="end">10⁷</text>
  </g>
  <text x="55" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 55 180)">demos (log scale)</text>

  <!-- Bars: log-position uses y = 280 - 66.7 * log10(n/10000) -->
  <!-- RoboNet 15k → y = 280 - 66.7*log10(1.5) = 280 - 11.7 = 268.3 -->
  <rect x="130" y="268" width="50" height="12" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="155" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">RoboNet</text>
  <text x="155" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2019</text>
  <text x="155" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">15k</text>
  <text x="155" y="248" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">4 lab</text>

  <!-- Bridge V2 50k → 280 - 66.7*log10(5) = 280 - 46.6 = 233.4 -->
  <rect x="210" y="233" width="50" height="47" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="235" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Bridge V2</text>
  <text x="235" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2023</text>
  <text x="235" y="227" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">50k</text>
  <text x="235" y="213" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">1 lab</text>

  <!-- DROID 76k → 280 - 66.7*log10(7.6) = 280 - 58.7 = 221.3 -->
  <rect x="290" y="221" width="50" height="59" fill="var(--dia-accent)"/>
  <text x="315" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">DROID ←</text>
  <text x="315" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">2024</text>
  <text x="315" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">76k</text>
  <text x="315" y="201" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-style="italic" font-size="11" fill="var(--dia-accent-deep)">18 lab!</text>

  <!-- RT-1 130k → 280 - 66.7*log10(13) = 280 - 74.4 = 205.6 -->
  <rect x="370" y="206" width="50" height="74" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="395" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">RT-1</text>
  <text x="395" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2022</text>
  <text x="395" y="200" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">130k</text>
  <text x="395" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">1 lab (Google)</text>

  <!-- ALOHA-style (estimated) 200k → 280 - 66.7*log10(20) = 280 - 86.7 = 193 -->
  <rect x="450" y="193" width="50" height="87" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="475" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">ALOHA mix</text>
  <text x="475" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2023+</text>
  <text x="475" y="187" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">~200k</text>
  <text x="475" y="173" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">scattered lab</text>

  <!-- OXE 1M → 280 - 66.7*log10(100) = 280 - 133.4 = 146.6 -->
  <rect x="530" y="147" width="50" height="133" fill="var(--dia-green)" opacity="0.85"/>
  <text x="555" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">OXE total</text>
  <text x="555" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2024</text>
  <text x="555" y="141" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">1M+</text>
  <text x="555" y="127" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">but mixed robots</text>

  <!-- Annotation: DROID's unique feature -->
  <text x="630" y="220" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">DROID 卖点：</text>
  <text x="630" y="236" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">不是数量第一</text>
  <text x="630" y="250" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">而是「跨 18 lab 同</text>
  <text x="630" y="264" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">一 robot + 协议」</text>
  <text x="630" y="280" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">的最大数据集</text>
  <path d="M 625 222 L 565 222" stroke="var(--dia-accent)" stroke-width="1" fill="none" marker-end="url(#droid-arr-pointer)"/>
  <defs>
    <marker id="droid-arr-pointer" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="var(--dia-accent)"/>
    </marker>
  </defs>
</svg>
</div>
<p class="figure-caption">Figure 1 — 在 log Y 轴下数据集规模差 100×；OXE 总量第一但是多 robot 混合；DROID (accent) demo 量第三，但 institution 数 18 远超其他（其他均为 1 lab）——这才是 DROID 的差异化卖点。</p>

---

## 6. 使用 DROID 训练

```python
import torch
from torch.utils.data import DataLoader
from droid_dataset import DROIDDataset

ds = DROIDDataset(
    root="/path/to/droid",
    split="train",
    transform=ImageTransform(224),
    chunk_length=32,  # 32-step action chunk
)
loader = DataLoader(ds, batch_size=64, shuffle=True, num_workers=8)

model = MyVLA(action_dim=7)
opt = torch.optim.AdamW(model.parameters(), 1e-4)

for batch in loader:
    images = batch['observation']['image_primary']
    lang = batch['observation']['language_instruction']
    actions = batch['action']['cartesian_position']
    
    pred = model(images, lang)
    loss = (pred - actions).abs().mean()
    opt.zero_grad(); loss.backward(); opt.step()
```

---

## 7. DROID 在哪些 model 中被用

| Model | 用 DROID 方式 |
|---|---|
| π0 | 训练数据一部分 |
| Helix | 训练数据一部分 |
| OpenVLA | Pre-train + fine-tune |
| Octo | 包含在 OXE 中 |
| Many academic papers | Fine-tune 评估 |

---

## 8. DROID 与 OXE 关系

- DROID 是**单 robot 单标准**:数据 quality 高,但 robot 多样性 = 0
- OXE 是**多 robot 大集合**:含 DROID + Bridge + RT-1 + ... 更大但 noisy

实际策略:大模型先 OXE pre-train → DROID fine-tune (因为 DROID 质量好)。

---

## 9. 数据质量 issues

### 9.1 Demonstration noise

人 teleoperate 时有抖动、错误开始、停顿。DROID 用 success filter 去掉失败 demo,但 noise 还在。

### 9.2 Scene 不平衡

stanford 占 30%+ episodes;小 lab underrepresented。Berkeley + Stanford ≈ 50%。

### 9.3 Task 不均匀

"pick-up" 类 episodes 占 40%+,而"insert"类 < 5%。

### 9.4 Language 简化

绝大多数 instruction 是简短英文 ("pick up the cup")。复杂指令少。

---

## 10. 影响

- **2024-2025**: DROID 成为新 VLA 论文 standard fine-tune set
- 推动 lab 间数据**共享**而非各自囤
- 标准化协议影响 ARRIVAL / RoboTube 等后续 dataset

---

## 11. 历史 timeline

- **2023 年初** — 18 institution 协议草案
- **2023-2024** — 数据收集
- **2024-05** — DROID 论文 + 数据发布
- **2024-Q4** — π0 / Helix 等用 DROID 训练
- **2025** — DROID v2 计划?

---

## 12. Common Pitfalls

### 12.1 数据大但仍不够

76k demo 比互联网视频 (1M+ hr) 小 10⁴×。VLA 仍 data-hungry。

### 12.2 下载 / 存储

DROID 完整 ~10 TB,download 困难;HuggingFace 提供 reduced version (4 TB)。

### 12.3 Action normalization

Cartesian action 在不同 lab 的 base frame 不同,需 careful normalization。

### 12.4 Reproducibility

每个 episode 唯一,实验不能 perfectly replay。

### 12.5 不包含 humanoid / 移动

DROID 仅 Franka stationary arm。不适合 NEO / Atlas 之类。

---

## 13. Related Concepts

- **同节**:[VLA 模型](../01_Foundations/VLA模型.md)、[Octo](../03_Models/Octo_Foundation_Policy.md)、[π0](../03_Models/Pi0_Physical_Intelligence.md)、[数据集与 Benchmark](数据集与Benchmark.md)
- **数据收集**:[遥操作与数据收集](遥操作与数据收集.md)、[UMI](UMI_Universal_Manipulation_Interface.md)
- **基准**:[CALVIN, LIBERO 等](VLA_Benchmark_Suite.md)

---

## References

1. **Khazatsky, A. et al.** "DROID: A Large-Scale In-the-Wild Robot Manipulation Dataset." *RSS*, 2024.
2. **Open X-Embodiment Collaboration** — "Open X-Embodiment." 2023.
3. **Walke, H. R. et al.** "BridgeData V2: A Dataset for Robot Learning at Scale." *CoRL*, 2023.
4. **Dasari, S. et al.** "RoboNet: Large-Scale Multi-Robot Learning." *CoRL*, 2019.
5. **DROID Project Page** — https://droid-dataset.github.io/
