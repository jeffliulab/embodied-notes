# Octo — 开源 generalist 机器人 policy

> *Berkeley 2024 年 5 月开源 **Octo**:90M 参数 Transformer + Diffusion head,在 Open X-Embodiment (OXE) 800K episodes 上训练。是首个真正可用的**开源 generalist policy** — 接受任意 robot + 任意指令 + zero-shot 转移到新场景。比 RT-X 小 200×,代码 + weights 全开源。*
>
> **难度**:Advanced
> **前置知识**:[VLA 模型](VLA模型.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)、[Diffusion Policy](../04_Robot_Learning/扩散策略.md)
> **后续阅读**:[π0](Pi0_Physical_Intelligence.md)、[OpenVLA](RT2_OpenVLA.md)

---

## 1. 直觉:Generalist Policy 三个核心要求

1. **接受任意输入模态**: RGB / depth / proprioception / language
2. **支持任意机器人 body**: 7-DOF / 6-DOF / mobile base / bimanual
3. **支持任意任务**: pick / place / navigate / pour ...

Octo 通过 **modular tokenization** 实现所有三点。

---

## 2. Octo 架构

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构 — 共享 backbone + 多 plug-in heads)
Q0: Octo 的设计 DNA 是「一个共享 Transformer backbone 通过多个可替换 action head 适配不同机器人」——同一 90M 权重训完后能挂 7-DOF / 14-DOF / mobile / 用户自定义 head
Q1: 中央一个 Transformer backbone box，**多个 head box 平行连出**(扇形 fan-out)，每个 head 用不同形状/颜色表达 plug-in 性质；右侧空白 head 标 "+" 代表用户可添加；输入侧多模态 token 用不同颜色编码而非 box 内文字
Q2: 去掉标题：「一个核心 + 多个扇形展开 head + 1 个 + 占位」——这种 plug-in 拓扑独属 Octo；其他 VLA 是单链或 dual-system
Q3: 删去 "user adds new head" 文字注释——改为画一个虚线 "+ your head" 卡片；删去模态 box 内 4 行 patch token 描述——改为 4 个小色块 token 代表
Q4: 7-DOF / 14-DOF / mobile / custom 标在各自 head 旁；90M / 12 layer 标在 backbone 旁
Q5: 全用 var(--dia-*)；中文 "你的新 head" 在 en 版译为 "your new head"
-->
<div class="diagram">
<svg viewBox="0 0 780 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Octo modular backbone with plug-in action heads">
  <defs>
    <marker id="oct-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="390" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Octo — 共享 backbone + 多 plug-in action heads</text>
  <text x="390" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">同一个 90M 权重训完，可挂载任意 head 适配不同机器人</text>

  <!-- Input modalities as colored token chips on left -->
  <g>
    <text x="60" y="95" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Modality tokens</text>
    <!-- RGB tokens (blue) -->
    <rect x="60" y="110" width="14" height="14" fill="var(--dia-blue)" opacity="0.7"/>
    <rect x="78" y="110" width="14" height="14" fill="var(--dia-blue)" opacity="0.7"/>
    <rect x="96" y="110" width="14" height="14" fill="var(--dia-blue)" opacity="0.7"/>
    <text x="116" y="121" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">RGB · ViT patches</text>

    <!-- Depth tokens (lighter blue) -->
    <rect x="60" y="138" width="14" height="14" fill="var(--dia-blue)" opacity="0.4"/>
    <rect x="78" y="138" width="14" height="14" fill="var(--dia-blue)" opacity="0.4"/>
    <text x="116" y="149" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">Depth · patches</text>

    <!-- Language tokens (gold) -->
    <rect x="60" y="166" width="14" height="14" fill="var(--dia-gold)" opacity="0.7"/>
    <rect x="78" y="166" width="14" height="14" fill="var(--dia-gold)" opacity="0.7"/>
    <rect x="96" y="166" width="14" height="14" fill="var(--dia-gold)" opacity="0.7"/>
    <text x="116" y="177" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-gold)">Lang · T5 tokens</text>

    <!-- Goal img tokens (green) -->
    <rect x="60" y="194" width="14" height="14" fill="var(--dia-green)" opacity="0.7"/>
    <rect x="78" y="194" width="14" height="14" fill="var(--dia-green)" opacity="0.7"/>
    <text x="116" y="205" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">Goal img · patches</text>
  </g>

  <!-- Transformer Backbone (center) -->
  <rect x="250" y="100" width="180" height="160" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="250" y="100" width="6" height="160" fill="var(--dia-accent)"/>
  <text x="340" y="125" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">Shared Transformer</text>
  <text x="340" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">90M params · 12 layers</text>
  <text x="340" y="166" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">block-causal masking</text>
  <!-- Show 12 small layer bands inside -->
  <g stroke="var(--dia-accent)" stroke-width="0.6" opacity="0.5">
    <line x1="262" y1="180" x2="424" y2="180"/>
    <line x1="262" y1="188" x2="424" y2="188"/>
    <line x1="262" y1="196" x2="424" y2="196"/>
    <line x1="262" y1="204" x2="424" y2="204"/>
    <line x1="262" y1="212" x2="424" y2="212"/>
    <line x1="262" y1="220" x2="424" y2="220"/>
    <line x1="262" y1="228" x2="424" y2="228"/>
    <line x1="262" y1="236" x2="424" y2="236"/>
  </g>
  <text x="340" y="253" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">all modalities co-attend</text>

  <!-- Input → backbone arrows -->
  <path d="M 225 175 L 250 175" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#oct-arr)"/>

  <!-- Fan-out: 4 plug-in heads on right (different colors/shapes) -->
  <!-- Head 1: 7-DOF (green) -->
  <rect x="490" y="80" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.8"/>
  <rect x="490" y="80" width="4" height="44" fill="var(--dia-green)"/>
  <text x="572" y="97" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-green)">7-DOF head</text>
  <text x="572" y="113" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">single Franka · diffusion</text>
  <path d="M 432 145 C 460 145 470 110 488 102" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#oct-arr)"/>

  <!-- Head 2: 14-DOF bimanual (blue) -->
  <rect x="490" y="140" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.8"/>
  <rect x="490" y="140" width="4" height="44" fill="var(--dia-blue)"/>
  <text x="572" y="157" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">14-DOF head</text>
  <text x="572" y="173" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">bimanual · ALOHA</text>
  <path d="M 432 168 L 488 162" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#oct-arr)"/>

  <!-- Head 3: Mobile (accent) -->
  <rect x="490" y="200" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <rect x="490" y="200" width="4" height="44" fill="var(--dia-accent)"/>
  <text x="572" y="217" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">Mobile head</text>
  <text x="572" y="233" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">arm + base joint</text>
  <path d="M 432 195 L 488 222" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#oct-arr)"/>

  <!-- Head 4: Custom (gold) -->
  <rect x="490" y="260" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="1.8" stroke-dasharray="4 3"/>
  <rect x="490" y="260" width="4" height="44" fill="var(--dia-gold)"/>
  <text x="572" y="277" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-gold)">+ Your head</text>
  <text x="572" y="293" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">custom DOF / robot</text>
  <path d="M 432 215 C 460 240 470 270 488 282" stroke="var(--dia-stroke-soft)" stroke-width="1.2" stroke-dasharray="2 3" fill="none" marker-end="url(#oct-arr)"/>

  <!-- Annotation: Plug-in concept -->
  <text x="660" y="332" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">同一 backbone, 4 个 head 任选</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 中央 90M Transformer 共享 backbone；右侧 fan-out 4 个 plug-in action head：7-DOF / 14-DOF 双臂 / mobile / 用户自定义 (虚线)。模态 token 用颜色编码 (RGB blue / lang gold / goal green) 在左侧。</p>

### 2.1 关键设计

- **Tokenizers**:
  - Image: ViT 16×16 patches (224x224 → 196 token)
  - Language: T5-small encoder
  - Depth / goal-image: 同 image
- **Backbone**: 12 layer Transformer, hidden 384 (Octo-Small) / 768 (Octo-Base)
- **Action heads**: 每个机器人 body 一个 diffusion head (8 step)

### 2.2 Diffusion Action Head

- Action 是 4-step chunk (Δx, Δy, Δz, Δrot..., gripper)
- 用 DDIM 8 step 采样,~80ms 推理

---

## 3. 训练数据

OXE 子集:**800K episodes**:
- Bridge Data v2 (Berkeley)
- RT-1 (Google)
- BC-Z, FMB, RoboNet, CMU Play, ...
- 25 个 datasets, 9 个不同机器人

数据混合策略:**weighted resampling** — 大数据集 oversampled,小数据集 upweighted。

---

## 4. 性能

### 4.1 Zero-Shot Benchmark

| 任务 | Octo-Small | Octo-Base | RT-X (55B) |
|---|---|---|---|
| Bridge pick-place | 56% | 73% | 70% |
| Sim Franka | 45% | 60% | — |
| WidowX (in-dist) | 70% | 82% | 85% |

Octo-Base 用 200× 少参数达到 RT-X 类似性能。

### 4.2 Fine-tune 性能

500 demo fine-tune:可达 90%+ 在新场景。比从头训快 10×。

---

## 5. 代码 + Weights

```bash
pip install octo-models
# Load
from octo.model.octo_model import OctoModel
model = OctoModel.load_pretrained("hf://rail-berkeley/octo-base")
# Inference
actions = model.sample_actions(observations, tasks={"language_instruction": ["pick up the cup"]})
```

完全开源 — Apache 2.0。

---

## 6. PyTorch 概念实现

```python
import torch, torch.nn as nn

class Octo(nn.Module):
    def __init__(self, hidden=384, n_layer=12):
        super().__init__()
        # Tokenizers
        self.image_tok = ImagePatchTokenizer(patch=16, dim=hidden)
        self.text_tok = T5Embedder(out_dim=hidden)
        # Backbone
        self.backbone = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=hidden, nhead=8, batch_first=True),
            num_layers=n_layer,
        )
        # Action heads (one per body)
        self.heads = nn.ModuleDict({
            "7-dof": DiffusionActionHead(hidden, action_dim=7),
            "14-dof": DiffusionActionHead(hidden, action_dim=14),
            "mobile": DiffusionActionHead(hidden, action_dim=10),
        })
    
    def forward(self, obs, task, body_type):
        # Tokenize
        img_tok = self.image_tok(obs["image"])
        text_tok = self.text_tok(task["language"])
        tokens = torch.cat([img_tok, text_tok], dim=1)
        # Backbone
        feat = self.backbone(tokens)
        # Action diffusion
        action = self.heads[body_type].sample(feat)
        return action
```

---

## 7. 与其他 generalist 对比

| Model | Params | Open | Multi-body | Inference | 备注 |
|---|---|---|---|---|---|
| **Octo** | **90M-400M** | **✅** | **✅** | **80ms** | Berkeley |
| OpenVLA | 7B | ✅ | 部分 | 100ms | Stanford/Berkeley |
| RT-2 | 55B | ❌ | 部分 | 200ms | Google |
| RT-X | 55B | ❌ | ✅ | 250ms | Google |
| π0 | 3B | ❌ (论文) | ✅ | 80ms | PI |
| RDT-1B | 1B | ✅ | 部分 | 150ms | Tsinghua |

---

## 8. 优势 / 劣势

### 8.1 优势

- ✅ **开源 + 小**:90M / 400M,普通研究者跑得动
- ✅ **模块化**:换 action head 适配新机器人 free
- ✅ **多 body 训练**:从 OXE 全部受益
- ✅ **代码工程好**:JAX 实现,文档完整

### 8.2 劣势

- ❌ 性能仍弱于 π0 / RDT-1B (差 10-15%)
- ❌ 90M 容量不够大,复杂任务难
- ❌ 仅 4-step action chunk(短)
- ❌ 视觉理解仍弱于 RT-2(55B)

---

## 9. 在 Berkeley 之外的复用

Octo 是研究界 standard baseline。后续工作:
- LIBERO benchmark 评估
- 与 Diffusion Policy / OpenVLA 公平对比
- 多个机器人公司用 Octo 做 starting point fine-tune

---

## 10. 历史 timeline

- **2023** — Bridge Data v2 + RT-1 启发 generalist 思路
- **2023 末** — OXE 数据集发布
- **2024 年 5 月** — Octo 论文 + 代码发布
- **2024 年 8 月** — Octo-Base 升级
- **2025** — 与 OpenVLA, Pi0 形成开源 generalist 生态

---

## 11. Common Pitfalls

### 11.1 Diffusion head 推理慢

8 step 80ms 在 high-freq 任务边界。可减到 4 step 但损 quality。

### 11.2 多 body 共享导致 catastrophic forgetting

加入新 body 数据有时降低旧 body 性能,需要 EWC / replay 缓解。

### 11.3 OXE 数据不平衡

Bridge 占 30%+,小数据集 underrepresented。Octo 用 weighted sampling 但仍有 bias。

### 11.4 Reproduction 难

OXE 完整数据 ~10 TB,download 困难。

### 11.5 Action 离散 vs 连续

Octo 用连续 diffusion;但有些任务(e.g. gripper open/close)更 fit 离散。

---

## 12. Related Concepts

- **同节**:[VLA 模型](VLA模型.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)、[π0](Pi0_Physical_Intelligence.md)、[RDT-1B](RDT_1B.md)、[ACT 模型](ACT模型.md)
- **数据集**:[Open X-Embodiment](数据集与Benchmark.md)、[DROID Dataset](DROID_Dataset.md)
- **学习方法**:[Diffusion Policy](../04_Robot_Learning/扩散策略.md)、[模仿学习](../04_Robot_Learning/模仿学习.md)

---

## References

1. **Octo Model Team** — "Octo: An Open-Source Generalist Robot Policy." *RSS*, 2024.
2. **Open X-Embodiment Collaboration** — "Open X-Embodiment: Robotic Learning Datasets and RT-X Models." 2023.
3. **Chi, C. et al.** "Diffusion Policy." *RSS*, 2023.
4. **Brohan, A. et al.** "RT-2." *CoRL*, 2023.
5. **Octo GitHub** — https://github.com/octo-models/octo
