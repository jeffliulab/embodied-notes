# DROID — Distributed Robot Operations Dataset

> *Stanford / Berkeley / CMU / UCL / multi-institution collaboration released **DROID** in May 2024: **76k demonstrations**, **350 hours**, **564 scenes**, **86 home/office tasks**, collected across 18 institutions. The largest, most diverse manipulation dataset to date, used by π0, Helix, OpenVLA, etc. for training.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [VLA Models](../01_Foundations/VLA模型.en.md), [Imitation Learning](../02_Methods/模仿学习.en.md)
> **Further reading**: [Open X-Embodiment](数据集与Benchmark.en.md), [π0](../03_Models/Pi0_Physical_Intelligence.en.md)

---

## 1. Why Large-Scale Manipulation Data

Robotics' core bottleneck is **real-robot data**:
- Single lab collects only hundreds of demos per year
- Data ≠ internet, no self-supervised source
- Different labs' robots / cameras / tasks all differ → can't merge data

→ Need **cross-lab standardization** to accumulate.

---

## 2. DROID Key Numbers

| Aspect | DROID |
|---|---|
| **Demonstrations** | 76,000 |
| **Total hours** | 350 |
| **Tasks** | 86 (home / office) |
| **Scenes** | 564 different physical environments |
| **Institutions** | 18 (Stanford / Berkeley / CMU / UCL / etc.) |
| **Robot** | **Franka Panda 7-DOF arm** (only one selected) |
| **Cameras** | 2 wrist + 1 third-person (3 RGB-D) |

→ 5× larger than RoboNet (2019, ~15k demos); 1.5× Bridge V2 (2023, 50k).

---

## 3. Data Collection Protocol

DROID emphasizes **standardization**:

### 3.1 Hardware Unified

All 18 labs must use:
- Franka Panda Research 3 (~$30k)
- 3 RealSense D435 / D435i cameras (fixed position)
- ALOHA-style teleoperation rig

### 3.2 Software Unified

- Same ROS noetic + droid_policy_learning code
- Action format: end-effector 6-DOF + gripper 1-DOF
- 30 Hz control frequency

### 3.3 Task Standard

86 fixed tasks:
- Home (kitchen tidying / organizing / cooking prep, etc.)
- Office (desk organizing / electronic device operation)
- Tool use (screwing / cutting / pouring)

Each task collected ≥ 50 demos per lab.

---

## 4. Data Format

Each demo:
```python
{
    'observation': {
        'image_primary': (T, 480, 640, 3),  # third-person view
        'image_left_wrist': (T, 480, 640, 3),
        'image_right_wrist': (T, 480, 640, 3),
        'depth_primary': (T, 480, 640),  # optional
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

## 5. Data Scale Visualization

<!-- SVG-DESIGN-NOTES
Type: D (quantitative comparison / scale) + metadata callout
Q0: DROID isn't the biggest by demo count (OXE total is 10× larger), but it's the largest single-robot (Franka) dataset built with cross-18-institution standardized collection — that's why π0 / Helix / OpenVLA all train on it
Q1: Vertical bars + log Y axis (10⁴ → 10⁶, spanning 100×); each bar annotated with institution count; DROID highlighted in accent with bold "18 lab!" tag; OXE marked "mixed robots" to differentiate
Q2: Strip the title — "log axis + 18 lab highlight + single-Franka mark" is enough to identify; linear-axis dataset charts crush the small entries
Q3: Removed original linear Y axis (cannot express 10⁴–10⁶ span); removed extra gridlines; kept log tick + dataset names only
Q4: Institution count / year / total demos all sit next to their bar; no legend
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DROID dataset comparison on log scale">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">DROID isn't the largest, but its institutional diversity is (log Y)</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Only single-Franka dataset built across 18 labs · why π0 / Helix / OpenVLA all train on it</text>

  <line x1="100" y1="80" x2="100" y2="280" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="100" y1="280" x2="720" y2="280" stroke="var(--dia-stroke)" stroke-width="1"/>

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

  <rect x="130" y="268" width="50" height="12" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="155" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">RoboNet</text>
  <text x="155" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2019</text>
  <text x="155" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">15k</text>
  <text x="155" y="248" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">4 lab</text>

  <rect x="210" y="233" width="50" height="47" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="235" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Bridge V2</text>
  <text x="235" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2023</text>
  <text x="235" y="227" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">50k</text>
  <text x="235" y="213" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">1 lab</text>

  <rect x="290" y="221" width="50" height="59" fill="var(--dia-accent)"/>
  <text x="315" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">DROID ←</text>
  <text x="315" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">2024</text>
  <text x="315" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">76k</text>
  <text x="315" y="201" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-style="italic" font-size="11" fill="var(--dia-accent-deep)">18 lab!</text>

  <rect x="370" y="206" width="50" height="74" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="395" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">RT-1</text>
  <text x="395" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2022</text>
  <text x="395" y="200" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">130k</text>
  <text x="395" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">1 lab (Google)</text>

  <rect x="450" y="193" width="50" height="87" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="475" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">ALOHA mix</text>
  <text x="475" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2023+</text>
  <text x="475" y="187" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">~200k</text>
  <text x="475" y="173" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">scattered lab</text>

  <rect x="530" y="147" width="50" height="133" fill="var(--dia-green)" opacity="0.85"/>
  <text x="555" y="298" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">OXE total</text>
  <text x="555" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2024</text>
  <text x="555" y="141" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">1M+</text>
  <text x="555" y="127" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">but mixed robots</text>

  <text x="630" y="220" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">DROID edge:</text>
  <text x="630" y="236" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">not biggest by count,</text>
  <text x="630" y="250" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">but largest "18-lab</text>
  <text x="630" y="264" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">same-robot + same-</text>
  <text x="630" y="280" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">protocol" dataset</text>
  <path d="M 625 222 L 565 222" stroke="var(--dia-accent)" stroke-width="1" fill="none" marker-end="url(#droid-arr-pointer-en)"/>
  <defs>
    <marker id="droid-arr-pointer-en" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="var(--dia-accent)"/>
    </marker>
  </defs>
</svg>
</div>
<p class="figure-caption">Figure 1 — On a log Y axis dataset scales span 100×; OXE has the highest total but mixes robots; DROID (accent) is third in demos but uniquely 18-lab — that's its differentiation.</p>

---

## 6. Using DROID for Training

```python
import torch
from torch.utils.data import DataLoader
from droid_dataset import DROIDDataset

ds = DROIDDataset(
    root="/path/to/droid",
    split="train",
    transform=ImageTransform(224),
    chunk_length=32,
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

## 7. Models Using DROID

| Model | DROID usage |
|---|---|
| π0 | Part of training data |
| Helix | Part of training data |
| OpenVLA | Pre-train + fine-tune |
| Octo | Included in OXE |
| Many academic papers | Fine-tune evaluation |

---

## 8. DROID vs OXE Relationship

- DROID is **single-robot single-standard**: high data quality, but robot diversity = 0
- OXE is **multi-robot large collection**: includes DROID + Bridge + RT-1 + ... bigger but noisier

Standard practice: pre-train on OXE → fine-tune on DROID (because DROID has good quality).

---

## 9. Data Quality Issues

### 9.1 Demonstration Noise

Human teleoperation has jitter, false starts, pauses. DROID filters successful demos but noise remains.

### 9.2 Scene Imbalance

Stanford 30%+ of episodes; small labs underrepresented. Berkeley + Stanford ≈ 50%.

### 9.3 Task Imbalance

"Pick-up" episodes 40%+; "insert" < 5%.

### 9.4 Language Simplified

Most instructions short English ("pick up the cup"). Complex instructions rare.

---

## 10. Impact

- **2024-2025**: DROID becomes standard fine-tune set for new VLA papers
- Drives **data sharing** between labs instead of hoarding
- Standard protocol influences ARRIVAL / RoboTube subsequent datasets

---

## 11. History Timeline

- **Early 2023** — 18 institution protocol draft
- **2023-2024** — data collection
- **2024-05** — DROID paper + data release
- **2024-Q4** — π0 / Helix etc. use DROID for training
- **2025** — DROID v2 planned?

---

## 12. Common Pitfalls

### 12.1 Big But Still Not Enough

76k demos is 10⁴× smaller than internet video (1M+ hr). VLAs still data-hungry.

### 12.2 Download / Storage

Full DROID ~10 TB, download difficult; HuggingFace offers reduced version (4 TB).

### 12.3 Action Normalization

Cartesian action's base frame differs per lab, careful normalization needed.

### 12.4 Reproducibility

Each episode unique, experiments can't perfectly replay.

### 12.5 No Humanoid / Mobile

DROID is Franka stationary arm only. Not for NEO / Atlas-like.

---

## 13. Related Concepts

- **Same section**: [VLA Models](../01_Foundations/VLA模型.en.md), [Octo](../03_Models/Octo_Foundation_Policy.en.md), [π0](../03_Models/Pi0_Physical_Intelligence.en.md), [Datasets & Benchmarks](数据集与Benchmark.en.md)
- **Data collection**: [Teleoperation & Data Collection](遥操作与数据收集.en.md), [UMI](UMI_Universal_Manipulation_Interface.en.md)
- **Benchmarks**: [CALVIN, LIBERO etc.](VLA_Benchmark_Suite.en.md)

---

## References

1. **Khazatsky, A. et al.** "DROID: A Large-Scale In-the-Wild Robot Manipulation Dataset." *RSS*, 2024.
2. **Open X-Embodiment Collaboration** — "Open X-Embodiment." 2023.
3. **Walke, H. R. et al.** "BridgeData V2: A Dataset for Robot Learning at Scale." *CoRL*, 2023.
4. **Dasari, S. et al.** "RoboNet: Large-Scale Multi-Robot Learning." *CoRL*, 2019.
5. **DROID Project Page** — https://droid-dataset.github.io/
