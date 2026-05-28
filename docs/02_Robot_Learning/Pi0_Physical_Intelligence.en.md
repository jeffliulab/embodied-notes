# π0 — Physical Intelligence's Flow-Matching VLA

> *Physical Intelligence (PI) released **π0** in November 2024: a 3B-parameter VLA + Flow Matching action head, trained on 10⁴ hours of real-robot data. Significantly improves precise manipulation over RT-2 / OpenVLA (folding towels, tidying desks, packing bags) and is 4× faster to infer than diffusion policy. One of the strongest single-model generalist robot policies as of 2025.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [VLA Models](VLA模型.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [Diffusion Policy](../04_Robot_Learning/扩散策略.en.md), [Flow Matching](../../02_Deep_Learning/06_Generative_Models/Diffusion.en.md)
> **Further reading**: [Octo Foundation Policy](Octo_Foundation_Policy.en.md), [Helix](Helix_Figure_AI.en.md)

---

## 1. Company Background

Physical Intelligence (PI) is a San Francisco startup founded in 2024 by ex-Google Brain / Stanford Robotics / DeepMind veterans:
- **Karol Hausman** (CEO, RT-2 lead author)
- **Sergey Levine** (Chief Scientist, Berkeley)
- **Chelsea Finn** (Stanford, RoboNet)
- $400M+ funding rounds (OpenAI, Khosla, Sequoia)

Strategy: **single foundation model for all robot tasks**, like a "GPT-3 moment" for robotics.

---

## 2. π0 Key Techniques

### 2.1 Architecture Overview

<!-- SVG-DESIGN-NOTES
Type: C (process / speed comparison)
Q0: π0's key innovation replaces diffusion with Flow Matching — 10 ODE steps directly learn a vector field that pushes noise into action, 4× faster than the 50-step DDIM diffusion baseline
Q1: 2D action space (XY plane) compares both trajectories: left π0 Flow Matching draws ~10 large arrows along a near-straight path; right diffusion draws ~50 dots along a wavy noise trajectory; sparse arrow grid renders the learned vector field; bottom inset annotates PaliGemma 3B (mostly frozen) + action expert
Q2: Strip the title — "2D trajectory comparison + vector field arrows + 4× speed callout" is the Flow-Matching-vs-Diffusion fingerprint unique to π0
Q3: Removed the 4-box architecture (Multi-cam / VLM / Flow / Action chunk) — replaced with a bottom-inset annotation
Q4: "10 ODE step" / "50 DDIM step" / "4× faster" sit directly on the trajectories
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pi0 Flow Matching trajectory vs diffusion">
  <defs>
    <marker id="pi0-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
    <marker id="pi0-arrow-fm-en" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="var(--dia-green)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">π0 — Flow Matching 10-step ODE replaces Diffusion 50-step DDIM</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Learned vector field in 2D action space pushes noise to clean action, 4× faster</text>

  <text x="180" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">π0 · Flow Matching (10 ODE)</text>

  <rect x="60" y="105" width="240" height="200" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="65" y="120" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">action dim 1</text>
  <text x="296" y="320" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">action dim 2</text>

  <g stroke="var(--dia-green)" stroke-width="0.8" opacity="0.35" fill="none">
    <line x1="80" y1="140" x2="92" y2="135" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="120" y1="150" x2="132" y2="142" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="160" y1="170" x2="172" y2="160" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="200" y1="200" x2="212" y2="188" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="240" y1="230" x2="252" y2="218" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="80" y1="180" x2="92" y2="172" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="120" y1="190" x2="132" y2="180" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="160" y1="210" x2="172" y2="198" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="200" y1="240" x2="212" y2="225" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="80" y1="220" x2="92" y2="210" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="120" y1="240" x2="132" y2="225" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="160" y1="260" x2="172" y2="245" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="80" y1="270" x2="92" y2="255" marker-end="url(#pi0-arrow-fm-en)"/>
    <line x1="120" y1="285" x2="132" y2="272" marker-end="url(#pi0-arrow-fm-en)"/>
  </g>

  <g>
    <circle cx="80" cy="280" r="6" fill="var(--dia-accent)" opacity="0.6"/>
    <text x="62" y="297" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">t=0 (noise)</text>

    <path d="M 80 280 L 100 263 L 122 247 L 144 230 L 168 213 L 192 196 L 215 179 L 236 162 L 254 145 L 270 130"
          stroke="var(--dia-green)" stroke-width="2.5" fill="none"/>
    <circle cx="100" cy="263" r="3" fill="var(--dia-green)"/>
    <circle cx="122" cy="247" r="3" fill="var(--dia-green)"/>
    <circle cx="144" cy="230" r="3" fill="var(--dia-green)"/>
    <circle cx="168" cy="213" r="3" fill="var(--dia-green)"/>
    <circle cx="192" cy="196" r="3" fill="var(--dia-green)"/>
    <circle cx="215" cy="179" r="3" fill="var(--dia-green)"/>
    <circle cx="236" cy="162" r="3" fill="var(--dia-green)"/>
    <circle cx="254" cy="145" r="3" fill="var(--dia-green)"/>

    <circle cx="270" cy="130" r="7" fill="var(--dia-green)"/>
    <text x="278" y="124" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="10" fill="var(--dia-green)">t=1 (clean action)</text>
  </g>
  <text x="180" y="332" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-green)">10 ODE steps</text>

  <text x="540" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Diffusion · DDIM (50 step)</text>

  <rect x="420" y="105" width="240" height="200" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>

  <g>
    <circle cx="440" cy="280" r="6" fill="var(--dia-accent)" opacity="0.6"/>
    <text x="422" y="297" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">noise</text>

    <path d="M 440 280 Q 450 270 460 275 Q 470 265 475 273 Q 480 268 485 272 Q 490 270 495 274 Q 500 268 510 272 Q 515 265 520 268 Q 525 263 530 266 Q 535 260 542 262 Q 548 256 555 258 Q 560 252 568 252 Q 575 245 580 247 Q 588 240 592 240 Q 600 232 605 232 Q 612 224 618 222 Q 624 216 628 214 Q 632 207 632 200"
          stroke="var(--dia-accent)" stroke-width="1.5" fill="none" opacity="0.85"/>

    <g fill="var(--dia-accent)" opacity="0.7">
      <circle cx="446" cy="275" r="1.4"/><circle cx="452" cy="272" r="1.4"/><circle cx="458" cy="274" r="1.4"/><circle cx="464" cy="270" r="1.4"/><circle cx="470" cy="269" r="1.4"/>
      <circle cx="476" cy="272" r="1.4"/><circle cx="482" cy="269" r="1.4"/><circle cx="488" cy="271" r="1.4"/><circle cx="494" cy="271" r="1.4"/><circle cx="500" cy="270" r="1.4"/>
      <circle cx="506" cy="270" r="1.4"/><circle cx="512" cy="269" r="1.4"/><circle cx="518" cy="266" r="1.4"/><circle cx="524" cy="265" r="1.4"/><circle cx="530" cy="264" r="1.4"/>
      <circle cx="536" cy="261" r="1.4"/><circle cx="542" cy="260" r="1.4"/><circle cx="548" cy="257" r="1.4"/><circle cx="554" cy="256" r="1.4"/><circle cx="560" cy="252" r="1.4"/>
      <circle cx="566" cy="249" r="1.4"/><circle cx="572" cy="247" r="1.4"/><circle cx="578" cy="243" r="1.4"/><circle cx="584" cy="240" r="1.4"/><circle cx="590" cy="238" r="1.4"/>
      <circle cx="596" cy="234" r="1.4"/><circle cx="602" cy="230" r="1.4"/><circle cx="608" cy="225" r="1.4"/><circle cx="614" cy="222" r="1.4"/><circle cx="620" cy="217" r="1.4"/>
      <circle cx="624" cy="212" r="1.4"/><circle cx="627" cy="207" r="1.4"/><circle cx="630" cy="202" r="1.4"/>
    </g>
    <circle cx="632" cy="200" r="7" fill="var(--dia-accent)"/>
    <text x="640" y="194" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="10" fill="var(--dia-accent-deep)">clean (after ~50 steps)</text>
  </g>
  <text x="540" y="332" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">50 DDIM steps</text>

  <line x1="305" y1="200" x2="415" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <text x="360" y="195" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">4× faster</text>

  <line x1="60" y1="345" x2="740" y2="345" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 3"/>
  <text x="60" y="362" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">PaliGemma 3B (mostly frozen)</text>
  <text x="60" y="375" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">+ Action Expert (~M-level trainable)</text>
  <text x="740" y="362" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Action chunk: 50 step × dim_action</text>
  <text x="740" y="375" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">arm + gripper + base velocity</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — Flow Matching (left, green) learns a vector field (faint background arrows); 10 ODE steps proceed near-straight along the field. Diffusion (right, accent) takes 50 wandering steps along a noisy trajectory — π0 is 4× faster at the same precision. Bottom inset annotates PaliGemma 3B + action expert + 50-step chunk.</p>

### 2.2 Key Innovations

#### 1. Flow Matching Replaces Diffusion

Diffusion Policy (Chi 2023) needs 50-100 denoising steps. π0 uses Flow Matching (Lipman 2023) — learns a vector field flowing directly from noise to action:

$$\frac{d x_t}{dt} = v_\theta(x_t, t, \text{context})$$

10-step ODE solve, **4× faster than diffusion**.

#### 2. Fine-tunes on VLM

VLM already "understands" images and language; π0 freezes most of it and **adds an action expert (extra transformer blocks) to train flow matching**. Cuts training cost 100× vs from scratch.

#### 3. Action Chunking

Predicts 50 action steps (2-3 sec) at once, reducing high-frequency decisions; low-level uses PID to track each chunk.

#### 4. Multi-Embodiment

Training data from 7+ different robots (Aloha bimanual, DROID UR5, Mobile Manipulator, etc.). π0 distinguishes bodies via robot ID + observation cam set.

---

## 3. Training Data

### 3.1 Data Scale

- **OXE (Open X-Embodiment)** subset: ~70 datasets, total ~10⁴ hours
- **PI proprietary**: thousands of hours Aloha + Mobile Aloha data
- **Internet video** (used in VLM pre-training)

Total training: **~10⁴ hours robot data + Internet video / image**.

### 3.2 Data Distribution

- Kitchen 30%
- Home tidying 25%
- Clothing 20%
- Tabletop manipulation 15%
- Other 10%

---

## 4. Performance

### 4.1 Flagship Tasks

π0 public demos include:
- **Fold towels**: aligning edges, complete 30+ sec task
- **Tidy desk**: put scattered items back
- **Pack shopping bag**: challenging (object deformation + balance)
- **Pour coffee**: precise manipulation
- **Use tools**: pick up scissors, cut paper

Each end-to-end.

### 4.2 Numbers (vs Baselines)

| Model | Aloha-fold success | Mobile manipulation | Generality |
|---|---|---|---|
| Diffusion Policy | 50% | — | single-task |
| RT-2 | 30% | 50% | Medium |
| OpenVLA | 35% | 55% | Medium |
| **π0** | **80%+** | **75%** | **Strong** |

PI numbers, November 2024 release. May differ slightly from published paper numbers.

---

## 5. Flow Matching Math

### 5.1 Goal

Learn a vector field $v_\theta$, so evolving along ODE from noise $x_0 \sim \mathcal{N}(0, I)$ reaches data $x_1$.

### 5.2 Training Loss

OT-CFM (Optimal Transport Conditional Flow Matching, Lipman 2023):

$$\mathcal{L}_{\text{CFM}} = \mathbb{E}_{t, x_0, x_1} \left\| v_\theta(\underbrace{(1-t) x_0 + t x_1}_{x_t}, t) - (x_1 - x_0) \right\|^2$$

i.e., $v_\theta$ learns the **straight-line velocity from $x_0$ to $x_1$**. More stable than diffusion score matching.

### 5.3 Inference

```python
# Solve ODE from t=0 to t=1
x = noise
for t in linspace(0, 1, num_steps=10):
    x = x + (1/num_steps) * v_theta(x, t, cond)
return x  # final action chunk
```

---

## 6. PyTorch Conceptual

```python
import torch
import torch.nn as nn

class Pi0(nn.Module):
    def __init__(self, action_dim=14, action_chunk=50):
        super().__init__()
        self.vlm = PaliGemma3B(frozen=True)
        self.action_proj_in = nn.Linear(action_dim, 512)
        self.action_expert = nn.TransformerDecoder(
            nn.TransformerDecoderLayer(d_model=512, nhead=8, batch_first=True),
            num_layers=6,
        )
        self.action_proj_out = nn.Linear(512, action_dim)
        self.action_chunk = action_chunk
    
    def encode(self, images, lang):
        return self.vlm(images, lang)
    
    def flow_step(self, noise_actions, t, vlm_ctx):
        x = self.action_proj_in(noise_actions)
        t_emb = sinusoidal_emb(t)
        x = x + t_emb[None, None, :]
        out = self.action_expert(x, vlm_ctx)
        return self.action_proj_out(out)
    
    def sample_action_chunk(self, images, lang, num_steps=10):
        ctx = self.encode(images, lang)
        B = ctx.size(0)
        x = torch.randn(B, self.action_chunk, action_dim, device=ctx.device)
        for i in range(num_steps):
            t = i / num_steps
            v = self.flow_step(x, t, ctx)
            x = x + (1 / num_steps) * v
        return x

# Training
def cfm_loss(model, images, lang, action_chunk):
    ctx = model.encode(images, lang)
    B = action_chunk.size(0)
    noise = torch.randn_like(action_chunk)
    t = torch.rand(B, device=action_chunk.device)
    x_t = (1 - t.view(B, 1, 1)) * noise + t.view(B, 1, 1) * action_chunk
    v_target = action_chunk - noise
    v_pred = model.flow_step(x_t, t, ctx)
    return ((v_pred - v_target) ** 2).mean()
```

---

## 7. π0 vs Other VLAs

| Model | Params | Action gen | Train data | Inference per step | Main trick |
|---|---|---|---|---|---|
| RT-2 (Google) | 55B | autoreg discrete | 10³ hr | 200ms | Internet co-train |
| OpenVLA | 7B | autoreg discrete | 970K episodes | 100ms | Open source |
| Octo | 90M | diffusion | OXE | 80ms | Modular |
| **π0** | **3B** | **flow matching** | **10⁴ hr** | **80ms** | **Flow + frozen VLM** |
| Helix (Figure) | unknown | unknown | proprietary | 100ms | dual-system |
| RDT-1B (Tsinghua) | 1B | diffusion | 1M episodes | 150ms | Open source |

---

## 8. Practical Lessons

### 8.1 Data Quality > Quantity

PI emphasizes "diversity of tasks > volume of single task". 100 different tasks × 100 demos each beats 10K demos of one task.

### 8.2 Lock VLM Pre-Training

Freezing VLM keeps action expert from breaking visual semantics. Levine in interview: "Unfreezing VLM experiments failed 5+ times".

### 8.3 Multi-Embodiment Helps All

Aloha data helps UR5 tasks (shared manipulation prior); this is OXE's insight.

### 8.4 Sim2Real Still Useful

PI pre-trains in Isaac Lab, then real fine-tune.

---

## 9. Limits

### 9.1 80ms Per Step Still Slow

For high-frequency tasks (peg insertion / dynamic balance) not enough — need <30ms.

### 9.2 Long Horizon

π0 strong at 30-sec tasks, but 5+ minute long-horizon still unstable.

### 9.3 No Explicit WM

π0 has no explicit forward model — can't plan, only imitate.

### 9.4 Private Data

PI's own data not open-source. Method reproducible but base data isn't.

---

## 10. Business Model / Deployment

PI partners with Boston Dynamics, Apptronik, 1X and other robot companies: π0 as base model, customers fine-tune. Similar to Anthropic / OpenAI API model — "robot foundation model as a service".

---

## 11. History Timeline

- **2023** — Levine, Hausman et al. found PI
- **Mid 2024** — internal π0 training complete
- **2024-11** — public demo + paper release
- **2025-Q1** — sign deals with multiple robot companies
- **2025-Q2** — π0.5 etc. iteration?

---

## 12. Common Pitfalls

### 12.1 Don't Assume π0 Solves Everything

PI demos are cherry-picked. Real-task failure rate still 50%+ (vs 90%+ in demos).

### 12.2 Flow Matching ≠ Diffusion

Although similar, flow matching loss is OT-based with straight paths; diffusion is curved.

### 12.3 VLM Choice Matters

PaliGemma > LLaVA > BLIP — clear difference on robot tasks.

### 12.4 Action Chunking Trade-off

Chunk too long (100+ steps) loses reactivity; too short (10) loses efficiency. 50 is empirical.

### 12.5 Open-Source Alternative

OpenVLA + Diffusion Policy self-trained reaches 60-70% of π0.

---

## 13. Related Concepts

- **Same section**: [VLA Models](VLA模型.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [Octo Foundation Policy](Octo_Foundation_Policy.en.md), [RDT-1B](RDT_1B.en.md), [Helix](Helix_Figure_AI.en.md), [ACT Model](ACT模型.en.md)
- **Robot learning**: [Diffusion Policy](../04_Robot_Learning/扩散策略.en.md), [imitation learning](../04_Robot_Learning/模仿学习.en.md)
- **Datasets**: [Open X-Embodiment](../05_Models/数据集与Benchmark.en.md), [DROID Dataset](DROID_Dataset.en.md)
- **Generative models**: [Flow Matching / Diffusion](../../02_Deep_Learning/06_Generative_Models/Diffusion.en.md)

---

## References

1. **Black, K., Hausman, K. et al.** "π0: A Vision-Language-Action Flow Model for General Robot Control." *PI Technical Report*, November 2024.
2. **Lipman, Y. et al.** "Flow Matching for Generative Modeling." *ICLR*, 2023.
3. **Chi, C. et al.** "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion." *RSS*, 2023.
4. **Brohan, A. et al.** "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control." *CoRL*, 2023.
5. **Open X-Embodiment Collaboration** — "Open X-Embodiment: Robotic Learning Datasets and RT-X Models." *arXiv*, 2023.
6. **Tong, A. et al.** "Improving and generalizing flow-based generative models." *arXiv*, 2024.
