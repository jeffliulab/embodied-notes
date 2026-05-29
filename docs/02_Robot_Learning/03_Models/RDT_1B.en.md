# RDT-1B — Tsinghua's Open 1B Diffusion Robot Transformer

> *Tsinghua's RDT (Robotics Diffusion Transformer) released **1B-parameter version** in 2024: first open-source 1B-scale Diffusion-based bimanual generalist policy. Pre-trained on OXE + RoboNet + in-house ALOHA-style data, zero-shot transfer to new tasks. China academia's "open" response to RT-2 / π0.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [VLA Models](../01_Foundations/VLA模型.en.md), [Diffusion Policy](../02_Methods/扩散策略.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md)
> **Further reading**: [π0](Pi0_Physical_Intelligence.en.md), [Helix](Helix_Figure_AI.en.md)

---

## 1. Project Background

Tsinghua IIIS + PKU / Shanghai AI Lab collaboration, released RDT-1B in October 2024:
- **First author**: Songming Liu et al.
- **Highlights**: Open + 1B params + bimanual manipulation + 1M+ episodes pre-training
- **Goal**: "open-source generalist policy", matches RT-2 without 50B compute

---

## 2. RDT Architecture

<!-- SVG-DESIGN-NOTES
Type: C (process / small multiples)
Q0: RDT works by iterative denoising — starting from pure Gaussian noise, the DiT (1B) takes 5-10 DDIM steps to converge a noisy action vector into a clean trajectory
Q1: 5 small-multiples panels each showing a 64-step action waveform; t=T has high-amplitude noisy scatter; t=0 has a smooth clean curve; σ_t schedule curve overlaid on top; arrows between panels for the denoising direction
Q2: Strip the title — "5 panels noise→smooth + σ_t decay curve + 64-step action trajectory" is the visual fingerprint of diffusion models; no other VLA looks like this
Q3: Removed "1B params / 28 layer / RMSNorm + RoPE" stacked-in-box facts — kept DiT info as a small caption below; input box also dropped (conditioning summarized in caption)
Q4: σ_T / σ_T/2 / σ_T/4 / σ_0 sit directly under each panel; 64-step is the X axis of each panel
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 800 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RDT-1B diffusion denoising as small multiples">
  <defs>
    <marker id="rdt-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">RDT-1B — DiT denoising trajectory (5-step DDIM, T → 0)</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Each panel = 64-step × 128-d bimanual action chunk; only dim-0 plotted for readability</text>

  <text x="22" y="75" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-accent-deep)">noise level σ_t</text>
  <path d="M 70 80 C 200 82 350 100 530 145 S 700 180 760 188" stroke="var(--dia-accent)" stroke-width="1.6" fill="none"/>
  <circle cx="100" cy="82" r="3" fill="var(--dia-accent)"/>
  <circle cx="240" cy="92" r="3" fill="var(--dia-accent)"/>
  <circle cx="380" cy="115" r="3" fill="var(--dia-accent)"/>
  <circle cx="520" cy="145" r="3" fill="var(--dia-accent)"/>
  <circle cx="680" cy="180" r="3" fill="var(--dia-accent)"/>

  <rect x="40" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="100" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = T</text>
  <text x="100" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 1.0</text>
  <g fill="var(--dia-accent)" opacity="0.7">
    <circle cx="48" cy="180" r="1.5"/><circle cx="54" cy="142" r="1.5"/><circle cx="60" cy="208" r="1.5"/><circle cx="66" cy="158" r="1.5"/><circle cx="72" cy="221" r="1.5"/><circle cx="78" cy="130" r="1.5"/><circle cx="84" cy="195" r="1.5"/><circle cx="90" cy="155" r="1.5"/><circle cx="96" cy="225" r="1.5"/><circle cx="102" cy="140" r="1.5"/><circle cx="108" cy="180" r="1.5"/><circle cx="114" cy="215" r="1.5"/><circle cx="120" cy="148" r="1.5"/><circle cx="126" cy="205" r="1.5"/><circle cx="132" cy="125" r="1.5"/><circle cx="138" cy="190" r="1.5"/><circle cx="144" cy="232" r="1.5"/><circle cx="150" cy="165" r="1.5"/><circle cx="156" cy="148" r="1.5"/>
  </g>

  <path d="M 165 180 L 178 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr-en)"/>

  <rect x="180" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="240" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = 3T/4</text>
  <text x="240" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 0.7</text>
  <polyline points="188,175 196,160 204,200 212,170 220,195 228,158 236,210 244,175 252,180 260,160 268,200 276,170 284,195 292,165" stroke="var(--dia-accent)" stroke-width="1.2" fill="none" opacity="0.85"/>
  <g fill="var(--dia-accent)" opacity="0.5">
    <circle cx="200" cy="190" r="1.2"/><circle cx="220" cy="160" r="1.2"/><circle cx="240" cy="210" r="1.2"/><circle cx="260" cy="155" r="1.2"/><circle cx="280" cy="200" r="1.2"/>
  </g>

  <path d="M 305 180 L 318 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr-en)"/>

  <rect x="320" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="380" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = T/2</text>
  <text x="380" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 0.45</text>
  <polyline points="328,175 336,165 344,180 352,175 360,190 368,165 376,200 384,180 392,170 400,168 408,200 416,180 424,190 432,170" stroke="var(--dia-accent)" stroke-width="1.4" fill="none"/>

  <path d="M 445 180 L 458 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr-en)"/>

  <rect x="460" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="520" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = T/4</text>
  <text x="520" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 0.2</text>
  <polyline points="468,178 476,170 484,176 492,180 500,188 508,178 516,192 524,184 532,176 540,170 548,180 556,188 564,180 572,172" stroke="var(--dia-green)" stroke-width="1.6" fill="none"/>

  <path d="M 585 180 L 598 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr-en)"/>

  <rect x="600" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="660" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-green)">t = 0</text>
  <text x="660" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ → 0 · clean action</text>
  <path d="M 608 180 C 624 175 640 168 656 172 C 672 178 688 186 712 190" stroke="var(--dia-green)" stroke-width="2" fill="none"/>

  <line x1="60" y1="310" x2="740" y2="310" stroke="var(--dia-stroke-soft)" stroke-width="0.8" stroke-dasharray="2 3"/>
  <text x="400" y="328" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Each forward pass: DiT (1B params · 28 layers · RMSNorm + RoPE) reads 3 RGB + language + proprioception + noisy action → predicts score → update chunk</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — RDT's 5-step DDIM denoising trajectory: from pure σ=1 noise (accent scatter) to σ=0 smooth action curve (green); top dashed arc is the σ_t decay schedule. Every step runs the same 1B DiT.</p>

### 2.1 Key Design

- **DiT backbone**: 28 layer Transformer (Stable Diffusion 3-like), 1B params
- **Unified tokens**: all modalities (image/lang/state/action) tokenized into one sequence
- **128-d action**: bimanual 7-DOF + two hands 6-DOF × 2 + head + base = ~128 dim (redundant encoding, unifies all bodies)
- **DDPM denoise**: 50 steps (training), 5-10 inference steps (DDIM)

### 2.2 Physically Interpretable Action Encoding

RDT proposes "**unified action space**" — encodes all robots' actions into a 128-d vector:
- First 7-d: left arm 6-DOF + gripper
- Middle 7-d: right arm
- Tail: two hands / head / base etc.
- Unused dims for given robot set to 0 (mask)

This way different bodies share the same network during training.

---

## 3. Training Data

- **OXE subset**: 1M+ episodes
- **In-house ALOHA-style data**: 6000+ bimanual task demos
- **RoboNet, Bridge V2, etc**: supplement

Total: **~10⁴ hours robot data**.

---

## 4. Performance

### 4.1 Real-Robot Evaluation

Tsinghua's dual-arm setup:
- Pick-place: 95%
- Pouring: 80%
- Folding clothes: 60%
- Inserting block: 70%

### 4.2 vs Baselines

| Model | Open | Bimanual avg success | Params |
|---|---|---|---|
| RT-1 | ❌ | 50% | 35M |
| RT-2 | ❌ | 78% | 55B |
| Octo | ✅ | 65% | 90M |
| OpenVLA | ✅ | 70% | 7B |
| **RDT-1B** | **✅** | **75%** | **1B** |

Note: different companies use different datasets, comparability limited.

---

## 5. Key Technical Contributions

### 5.1 Multi-Resolution Encoding

Different modalities encoded at different resolutions:
- Image: patch 14×14 (~256 token / cam)
- Language: BPE tokenizer (~50 token)
- State: 1 token per joint (~50 token)
- Action: 1 token per chunk step (64 token)

Total sequence length ~700 tokens, forward on 1B model 100-150ms.

### 5.2 Sin-Cos Temporal Encoding

Borrowed from Sora's 3D RoPE — rotary-encodes [batch, time, modality], letting attention see temporal structure.

### 5.3 Pre-train + Fine-tune Two Stages

- **Pre-train**: 1M+ OXE data, 30 epochs
- **Fine-tune**: 100-500 task demos, 5-10 epochs

Tsinghua releases pre-trained weights, users only need to fine-tune.

---

## 6. PyTorch Simplified

```python
import torch, torch.nn as nn

class RDT1B(nn.Module):
    def __init__(self, action_dim=128, action_chunk=64):
        super().__init__()
        self.image_tok = ImagePatchTokenizer(patch=14)
        self.text_tok = T5Tokenizer()
        self.state_proj = nn.Linear(50, 1024)
        self.action_proj = nn.Linear(action_dim, 1024)
        self.dit = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=1024, nhead=16, batch_first=True),
            num_layers=28,
        )
        self.out_proj = nn.Linear(1024, action_dim)
        self.action_chunk = action_chunk
    
    def forward(self, imgs, lang, state, noisy_actions, t):
        img_tok = self.image_tok(imgs)
        text_tok = self.text_tok(lang)
        state_tok = self.state_proj(state).unsqueeze(1)
        action_tok = self.action_proj(noisy_actions)
        t_emb = sinusoidal_emb(t).unsqueeze(1)
        tokens = torch.cat([img_tok, text_tok, state_tok, action_tok, t_emb], dim=1)
        out = self.dit(tokens)
        action_out = out[:, -self.action_chunk-1:-1]
        return self.out_proj(action_out)
    
    @torch.no_grad()
    def sample(self, imgs, lang, state, num_steps=10):
        B = imgs.size(0)
        x = torch.randn(B, self.action_chunk, action_dim)
        for t in reversed(range(num_steps)):
            noise = self.forward(imgs, lang, state, x, torch.tensor([t]))
            x = ddim_step(x, noise, t, num_steps)
        return x
```

---

## 7. Pros / Cons

### 7.1 Pros

- ✅ **Open weights + code** (Apache 2.0)
- ✅ **1B medium-size**, runnable
- ✅ **Bimanual unified support** (many generalists don't)
- ✅ **128-d unified action space** adapts to any body
- ✅ **Tsinghua engineering quality** (vs academic prototype)

### 7.2 Cons

- ❌ Data still < π0 (10⁴ hr); slightly lower performance
- ❌ Diffusion inference 5-10 steps, ~150ms (slower than Helix S1)
- ❌ Only 64-step chunk; long horizon to improve
- ❌ Multi-body switching needs fine-tune (not truly zero-shot)

---

## 8. Relation to OpenVLA / Octo

Tsinghua team says "RDT is physical-understanding upgrade of OpenVLA":
- OpenVLA strong on semantics (7B VLM), weak action head
- RDT strong on dynamics (DiT denoise), slightly weak semantics
- In practice could be hybrid: OpenVLA gives semantic latent → RDT denoises actions

---

## 9. History Timeline

- **2024-05** — Tsinghua IIIS starts RDT project
- **2024-10** — RDT-1B paper + weights released
- **2025-Q1** — multiple Chinese robot companies (Galbot, Agibot) fine-tune RDT-1B
- **2025-Q2** — RDT-3B or larger versions possibly?

---

## 10. Common Pitfalls

### 10.1 Action Space Encoding Hack

128-d unified mixes bodies; during fine-tune, some dims have no data, easily "drift".

### 10.2 Diffusion Training Unstable

DDPM loss learns fast at high-noise steps, slow at low-noise. RDT uses importance sampling but issues remain.

### 10.3 Data vs π0

OXE + 6000 in-house vs PI's 10⁴ hr → ~3-5× less. Performance gap mainly here.

### 10.4 Real-Robot Deploy Complex

Open weights but deploying to your robot still needs camera calibration / action normalization / etc., lots of engineering.

### 10.5 Bimanual Sync

Dual-arm coordination (left holds cup, right pours water) still fails 30-40% on RDT-1B.

---

## 11. Related Concepts

- **Same section**: [VLA Models](../01_Foundations/VLA模型.en.md), [Octo](Octo_Foundation_Policy.en.md), [π0](Pi0_Physical_Intelligence.en.md), [Helix](Helix_Figure_AI.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md)
- **Data**: [Open X-Embodiment](../04_Data_Benchmarks/数据集与Benchmark.en.md)
- **Learning methods**: [Diffusion Policy](../02_Methods/扩散策略.en.md), [Imitation Learning](../02_Methods/模仿学习.en.md)

---

## References

1. **Liu, S. et al.** "RDT-1B: A Diffusion Foundation Model for Bimanual Manipulation." *arXiv*, 2024.
2. **Octo Model Team** — "Octo." 2024.
3. **Open X-Embodiment Collaboration** — "Open X-Embodiment." 2023.
4. **Peebles, W. & Xie, S.** "Scalable Diffusion Models with Transformers (DiT)." *ICCV*, 2023.
5. **RDT GitHub** — https://github.com/thu-ml/RoboticsDiffusionTransformer
