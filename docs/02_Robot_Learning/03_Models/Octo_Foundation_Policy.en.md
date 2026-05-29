# Octo — Open-Source Generalist Robot Policy

> *Berkeley released **Octo** open-source in May 2024: 90M-parameter Transformer + Diffusion head, trained on Open X-Embodiment (OXE) 800K episodes. The first truly usable **open-source generalist policy** — accepts any robot + any instruction + zero-shot transfer to new scenes. 200× smaller than RT-X, code + weights fully open.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [VLA Models](../01_Foundations/VLA模型.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [Diffusion Policy](../02_Methods/扩散策略.en.md)
> **Further reading**: [π0](Pi0_Physical_Intelligence.en.md), [OpenVLA](RT2_OpenVLA.en.md)

---

## 1. Intuition: Three Core Generalist Requirements

1. **Accept any input modality**: RGB / depth / proprioception / language
2. **Support any robot body**: 7-DOF / 6-DOF / mobile base / bimanual
3. **Support any task**: pick / place / navigate / pour ...

Octo achieves all three via **modular tokenization**.

---

## 2. Octo Architecture

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture — shared backbone + plug-in heads)
Q0: Octo's design DNA is "one shared Transformer backbone with multiple swappable action heads adapting to different robots" — after training, the same 90M weights can attach 7-DOF / 14-DOF / mobile / user-custom heads
Q1: Central Transformer backbone box with **multiple heads fanning out** in parallel; each head uses different stroke color to express plug-in nature; rightmost head dashed-bordered + "+" to mark user-extensibility; inputs use colored token chips (not box-internal text)
Q2: Strip the title — "one core + parallel head fan-out + 1 dashed placeholder" is uniquely Octo; other VLAs are single-chain or dual-system
Q3: Removed "user adds new head" as text — replaced with a dashed "+ your head" card; removed 4 lines of "patch token" text — replaced with 4 colored chips per modality
Q4: 7-DOF / 14-DOF / mobile / custom labeled adjacent to their head; 90M / 12 layers next to backbone
Q5: All var(--dia-*); English labels — shared between .md and .en.md (Chinese version uses 你的新 head)
-->
<div class="diagram">
<svg viewBox="0 0 780 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Octo modular backbone with plug-in action heads">
  <defs>
    <marker id="oct-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="390" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Octo — shared backbone + plug-in action heads</text>
  <text x="390" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Same 90M weights serve any robot by swapping heads</text>

  <g>
    <text x="60" y="95" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Modality tokens</text>
    <rect x="60" y="110" width="14" height="14" fill="var(--dia-blue)" opacity="0.7"/>
    <rect x="78" y="110" width="14" height="14" fill="var(--dia-blue)" opacity="0.7"/>
    <rect x="96" y="110" width="14" height="14" fill="var(--dia-blue)" opacity="0.7"/>
    <text x="116" y="121" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">RGB · ViT patches</text>

    <rect x="60" y="138" width="14" height="14" fill="var(--dia-blue)" opacity="0.4"/>
    <rect x="78" y="138" width="14" height="14" fill="var(--dia-blue)" opacity="0.4"/>
    <text x="116" y="149" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">Depth · patches</text>

    <rect x="60" y="166" width="14" height="14" fill="var(--dia-gold)" opacity="0.7"/>
    <rect x="78" y="166" width="14" height="14" fill="var(--dia-gold)" opacity="0.7"/>
    <rect x="96" y="166" width="14" height="14" fill="var(--dia-gold)" opacity="0.7"/>
    <text x="116" y="177" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-gold)">Lang · T5 tokens</text>

    <rect x="60" y="194" width="14" height="14" fill="var(--dia-green)" opacity="0.7"/>
    <rect x="78" y="194" width="14" height="14" fill="var(--dia-green)" opacity="0.7"/>
    <text x="116" y="205" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">Goal img · patches</text>
  </g>

  <rect x="250" y="100" width="180" height="160" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="250" y="100" width="6" height="160" fill="var(--dia-accent)"/>
  <text x="340" y="125" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">Shared Transformer</text>
  <text x="340" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">90M params · 12 layers</text>
  <text x="340" y="166" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">block-causal masking</text>
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

  <path d="M 225 175 L 250 175" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#oct-arr-en)"/>

  <rect x="490" y="80" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.8"/>
  <rect x="490" y="80" width="4" height="44" fill="var(--dia-green)"/>
  <text x="572" y="97" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-green)">7-DOF head</text>
  <text x="572" y="113" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">single Franka · diffusion</text>
  <path d="M 432 145 C 460 145 470 110 488 102" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#oct-arr-en)"/>

  <rect x="490" y="140" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.8"/>
  <rect x="490" y="140" width="4" height="44" fill="var(--dia-blue)"/>
  <text x="572" y="157" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">14-DOF head</text>
  <text x="572" y="173" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">bimanual · ALOHA</text>
  <path d="M 432 168 L 488 162" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#oct-arr-en)"/>

  <rect x="490" y="200" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <rect x="490" y="200" width="4" height="44" fill="var(--dia-accent)"/>
  <text x="572" y="217" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">Mobile head</text>
  <text x="572" y="233" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">arm + base joint</text>
  <path d="M 432 195 L 488 222" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#oct-arr-en)"/>

  <rect x="490" y="260" width="160" height="44" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="1.8" stroke-dasharray="4 3"/>
  <rect x="490" y="260" width="4" height="44" fill="var(--dia-gold)"/>
  <text x="572" y="277" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-gold)">+ Your head</text>
  <text x="572" y="293" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">custom DOF / robot</text>
  <path d="M 432 215 C 460 240 470 270 488 282" stroke="var(--dia-stroke-soft)" stroke-width="1.2" stroke-dasharray="2 3" fill="none" marker-end="url(#oct-arr-en)"/>

  <text x="660" y="332" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">One backbone, 4 heads of your choice</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — Central 90M Transformer is the shared backbone; right side fans out to 4 plug-in action heads: 7-DOF / 14-DOF bimanual / mobile / user-custom (dashed). Modality tokens are color-coded on the left (RGB blue / lang gold / goal green).</p>

### 2.1 Key Design

- **Tokenizers**:
  - Image: ViT 16×16 patches (224x224 → 196 tokens)
  - Language: T5-small encoder
  - Depth / goal-image: same as image
- **Backbone**: 12 layer Transformer, hidden 384 (Octo-Small) / 768 (Octo-Base)
- **Action heads**: one diffusion head per robot body (8 steps)

### 2.2 Diffusion Action Head

- Action is 4-step chunk (Δx, Δy, Δz, Δrot..., gripper)
- DDIM 8 step sampling, ~80ms inference

---

## 3. Training Data

OXE subset: **800K episodes**:
- Bridge Data v2 (Berkeley)
- RT-1 (Google)
- BC-Z, FMB, RoboNet, CMU Play, ...
- 25 datasets, 9 different robots

Data mixing strategy: **weighted resampling** — large datasets oversampled, small upweighted.

---

## 4. Performance

### 4.1 Zero-Shot Benchmark

| Task | Octo-Small | Octo-Base | RT-X (55B) |
|---|---|---|---|
| Bridge pick-place | 56% | 73% | 70% |
| Sim Franka | 45% | 60% | — |
| WidowX (in-dist) | 70% | 82% | 85% |

Octo-Base matches RT-X with 200× fewer params.

### 4.2 Fine-tune Performance

500 demo fine-tune: reaches 90%+ on new scenes. 10× faster than from-scratch training.

---

## 5. Code + Weights

```bash
pip install octo-models
# Load
from octo.model.octo_model import OctoModel
model = OctoModel.load_pretrained("hf://rail-berkeley/octo-base")
# Inference
actions = model.sample_actions(observations, tasks={"language_instruction": ["pick up the cup"]})
```

Fully open-source — Apache 2.0.

---

## 6. PyTorch Conceptual

```python
import torch, torch.nn as nn

class Octo(nn.Module):
    def __init__(self, hidden=384, n_layer=12):
        super().__init__()
        self.image_tok = ImagePatchTokenizer(patch=16, dim=hidden)
        self.text_tok = T5Embedder(out_dim=hidden)
        self.backbone = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=hidden, nhead=8, batch_first=True),
            num_layers=n_layer,
        )
        self.heads = nn.ModuleDict({
            "7-dof": DiffusionActionHead(hidden, action_dim=7),
            "14-dof": DiffusionActionHead(hidden, action_dim=14),
            "mobile": DiffusionActionHead(hidden, action_dim=10),
        })
    
    def forward(self, obs, task, body_type):
        img_tok = self.image_tok(obs["image"])
        text_tok = self.text_tok(task["language"])
        tokens = torch.cat([img_tok, text_tok], dim=1)
        feat = self.backbone(tokens)
        action = self.heads[body_type].sample(feat)
        return action
```

---

## 7. vs Other Generalists

| Model | Params | Open | Multi-body | Inference | Notes |
|---|---|---|---|---|---|
| **Octo** | **90M-400M** | **✅** | **✅** | **80ms** | Berkeley |
| OpenVLA | 7B | ✅ | Partial | 100ms | Stanford/Berkeley |
| RT-2 | 55B | ❌ | Partial | 200ms | Google |
| RT-X | 55B | ❌ | ✅ | 250ms | Google |
| π0 | 3B | ❌ (paper) | ✅ | 80ms | PI |
| RDT-1B | 1B | ✅ | Partial | 150ms | Tsinghua |

---

## 8. Pros / Cons

### 8.1 Pros

- ✅ **Open + small**: 90M / 400M, runnable by general researchers
- ✅ **Modular**: swap action head to adapt to new robot
- ✅ **Multi-body training**: benefits from all of OXE
- ✅ **Good engineering**: JAX implementation, full docs

### 8.2 Cons

- ❌ Performance still lags π0 / RDT-1B (by 10-15%)
- ❌ 90M capacity insufficient for complex tasks
- ❌ Only 4-step action chunk (short)
- ❌ Visual understanding weaker than RT-2 (55B)

---

## 9. Reuse Outside Berkeley

Octo is research standard baseline. Follow-ups:
- LIBERO benchmark evaluation
- Fair comparison with Diffusion Policy / OpenVLA
- Multiple robot companies use Octo as starting-point fine-tune

---

## 10. History Timeline

- **2023** — Bridge Data v2 + RT-1 inspire generalist idea
- **End 2023** — OXE dataset released
- **May 2024** — Octo paper + code released
- **August 2024** — Octo-Base upgrade
- **2025** — Forms open-source generalist ecosystem with OpenVLA, Pi0

---

## 11. Common Pitfalls

### 11.1 Diffusion Head Inference Slow

8 steps × 80ms borderline for high-freq tasks. Can reduce to 4 step but loses quality.

### 11.2 Multi-Body Causes Catastrophic Forgetting

Adding new body data sometimes degrades old body — needs EWC / replay mitigation.

### 11.3 OXE Data Imbalance

Bridge 30%+, small datasets underrepresented. Octo uses weighted sampling but bias remains.

### 11.4 Reproduction Hard

Full OXE ~10 TB, download difficult.

### 11.5 Discrete vs Continuous Action

Octo uses continuous diffusion; but some tasks (e.g. gripper open/close) fit discrete better.

---

## 12. Related Concepts

- **Same section**: [VLA Models](../01_Foundations/VLA模型.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [π0](Pi0_Physical_Intelligence.en.md), [RDT-1B](RDT_1B.en.md), [ACT Model](../02_Methods/ACT模型.en.md)
- **Datasets**: [Open X-Embodiment](../04_Data_Benchmarks/数据集与Benchmark.en.md), [DROID Dataset](../04_Data_Benchmarks/DROID_Dataset.en.md)
- **Learning methods**: [Diffusion Policy](../02_Methods/扩散策略.en.md), [Imitation Learning](../02_Methods/模仿学习.en.md)

---

## References

1. **Octo Model Team** — "Octo: An Open-Source Generalist Robot Policy." *RSS*, 2024.
2. **Open X-Embodiment Collaboration** — "Open X-Embodiment: Robotic Learning Datasets and RT-X Models." 2023.
3. **Chi, C. et al.** "Diffusion Policy." *RSS*, 2023.
4. **Brohan, A. et al.** "RT-2." *CoRL*, 2023.
5. **Octo GitHub** — https://github.com/octo-models/octo
