# RT-2 and OpenVLA — Vision-Language-Action Models

> *RT-2 (Google DeepMind 2023) is the first industrial-grade **Vision-Language-Action (VLA)** model that fine-tunes an LLM directly as a robot action generator. **OpenVLA** (Stanford 2024) is the open-source counterpart, based on Llama-2 + Prismatic VLM, trained on the Open X-Embodiment dataset. Key route to **general robotics**.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [VLA Models Overview](VLA模型.en.md), [Multimodal LLMs](../../03_Foundation_Models/05_Multimodal/MLLMs.en.md), [Diffusion Policy](../04_Robot_Learning/扩散策略.en.md)
> **Further reading**: [π0 / RDT-1B](../04_Robot_Learning/index.en.md), [Sim2Real](../04_Robot_Learning/Sim2Real.en.md)

---

## 1. Intuition: Use an LLM as the Robot Controller

Traditional robotics: train a specialized policy per task. **VLA idea**: take a **pretrained large model** (LLM/VLM) and fine-tune it into a generalist controller, **with natural language + image as instructions** outputting actions.

```
input:  image + natural language ("Pick up the red mug")
↓ VLM (pretrained Vision-Language Model)
output: 7-DOF action [Δx, Δy, Δz, Δr, Δp, Δy, gripper]
```

**Advantages**:
- **Few-shot learning** — leverage LLM/VLM common sense
- **Instruction generalization** — natural language instructions are theoretically unbounded
- **Multi-task unification** — one model, N skills

---

## 2. RT-2 (Google DeepMind 2023)

<!-- SVG-DESIGN-NOTES
Type: A (structure / shared token stream) + bottom D (param comparison)
Q0: RT-2 / OpenVLA's core invention is "action-as-text-token" — quantize 7-DOF continuous action into 256 bins, each mapped to a reserved token in the LLM vocabulary, so action and text share the same autoregressive generation stream
Q1: Top half shows the three-stage mapping (continuous → quantized → token ID): (a) 7 small waveform strips; (b) 256-bin discrete tick axis; (c) 7 orange action tokens inserted into the LLM vocabulary alongside text tokens; bottom half RT-2 55B vs OpenVLA 7B with box area reflecting ~8× param ratio
Q2: Strip the title — "continuous waves → 256 ticks → orange tokens in vocabulary" (top) + "two size-asymmetric labeled boxes for open/closed" (bottom) — this "action enters token stream" visualization is unique to RT-2 / OpenVLA
Q3: Removed two equal-height spec boxes; removed slogan phrases like "co-train VQA + robot data" — expressed visually
Q4: 256-bin / 7-DOF / 55B / 7B labeled adjacent to their geometric elements
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RT-2 / OpenVLA action-as-text-token + scale comparison">
  <defs>
    <marker id="rt2-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">RT-2 / OpenVLA — Action is a token in the LLM vocabulary</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">7-DOF continuous → 256-bin quantization → 7 reserved tokens that share the autoregressive stream with text</text>

  <text x="100" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Continuous action</text>
  <text x="100" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">7-DOF [Δx Δy Δz Δr Δp Δyaw gripper]</text>

  <g stroke="var(--dia-stroke)" stroke-width="1.2" fill="none">
    <path d="M 30 110 C 50 105 70 115 95 108 L 165 108"/>
    <path d="M 30 122 C 50 130 70 118 95 124 L 165 124"/>
    <path d="M 30 134 C 60 138 80 130 95 134 L 165 134"/>
    <path d="M 30 146 C 50 140 70 150 95 144 L 165 144"/>
    <path d="M 30 158 C 50 162 70 154 95 156 L 165 156"/>
    <path d="M 30 170 C 50 166 70 174 95 170 L 165 170"/>
    <path d="M 30 182 C 50 178 70 186 95 182 L 165 182"/>
  </g>

  <path d="M 175 145 L 215 145" stroke="var(--dia-stroke-soft)" stroke-width="1.5" marker-end="url(#rt2-arr-en)"/>
  <text x="195" y="138" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">quantize</text>

  <text x="320" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">256-bin discrete</text>
  <text x="320" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">one bin-index per DOF</text>

  <line x1="220" y1="120" x2="420" y2="120" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g stroke="var(--dia-stroke-soft)" stroke-width="0.6">
    <line x1="220" y1="115" x2="220" y2="125"/>
    <line x1="245" y1="118" x2="245" y2="122"/>
    <line x1="270" y1="118" x2="270" y2="122"/>
    <line x1="295" y1="118" x2="295" y2="122"/>
    <line x1="320" y1="115" x2="320" y2="125"/>
    <line x1="345" y1="118" x2="345" y2="122"/>
    <line x1="370" y1="118" x2="370" y2="122"/>
    <line x1="395" y1="118" x2="395" y2="122"/>
    <line x1="420" y1="115" x2="420" y2="125"/>
  </g>
  <text x="220" y="138" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0</text>
  <text x="320" y="138" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">128</text>
  <text x="420" y="138" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">255</text>

  <g fill="var(--dia-accent)">
    <circle cx="245" cy="155" r="3"/>
    <circle cx="300" cy="155" r="3"/>
    <circle cx="280" cy="155" r="3"/>
    <circle cx="365" cy="155" r="3"/>
    <circle cx="335" cy="155" r="3"/>
    <circle cx="395" cy="155" r="3"/>
    <circle cx="415" cy="155" r="3"/>
  </g>
  <text x="320" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">bin[45, 98, 80, 175, 130, 240, 255]</text>

  <path d="M 430 145 L 470 145" stroke="var(--dia-stroke-soft)" stroke-width="1.5" marker-end="url(#rt2-arr-en)"/>
  <text x="450" y="138" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">map</text>

  <text x="620" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Token stream in LLM vocabulary</text>
  <text x="620" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">action and text share autoregressive generation</text>

  <g font-family="JetBrains Mono, monospace" font-size="10">
    <rect x="475" y="120" width="40" height="20" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
    <text x="495" y="134" text-anchor="middle" fill="var(--dia-stroke)">Pick</text>
    <rect x="518" y="120" width="32" height="20" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
    <text x="534" y="134" text-anchor="middle" fill="var(--dia-stroke)">up</text>
    <rect x="553" y="120" width="36" height="20" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
    <text x="571" y="134" text-anchor="middle" fill="var(--dia-stroke)">red</text>
    <rect x="592" y="120" width="40" height="20" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
    <text x="612" y="134" text-anchor="middle" fill="var(--dia-stroke)">mug</text>
    <text x="640" y="134" text-anchor="middle" fill="var(--dia-stroke)">→</text>
    <rect x="650" y="120" width="44" height="20" rx="3" fill="var(--dia-accent)"/>
    <text x="672" y="134" text-anchor="middle" fill="var(--dia-bg-card)" font-weight="600">⟨a45⟩</text>
    <rect x="697" y="120" width="44" height="20" rx="3" fill="var(--dia-accent)"/>
    <text x="719" y="134" text-anchor="middle" fill="var(--dia-bg-card)" font-weight="600">⟨a98⟩</text>
    <text x="752" y="134" text-anchor="middle" fill="var(--dia-stroke-soft)">…</text>
  </g>
  <text x="620" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">7 reserved action tokens (orange) interleave with text tokens</text>

  <line x1="40" y1="200" x2="760" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="0.8" stroke-dasharray="3 3"/>

  <text x="400" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-stroke)">Two implementations differ in scale (box area ∝ param count)</text>

  <rect x="80" y="240" width="280" height="100" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="80" y="240" width="6" height="100" fill="var(--dia-accent)"/>
  <text x="220" y="260" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">RT-2 (Google) · CLOSED</text>
  <text x="220" y="285" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="20" fill="var(--dia-accent-deep)">55B</text>
  <text x="220" y="305" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">PaLI-X / PaLM-E · 5B-55B</text>
  <text x="220" y="322" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">co-train on VQA + RT-1 data</text>

  <rect x="440" y="270" width="180" height="70" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="2"/>
  <rect x="440" y="270" width="4" height="70" fill="var(--dia-green)"/>
  <text x="530" y="288" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">OpenVLA (Stanford) · OPEN</text>
  <text x="530" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="16" fill="var(--dia-green)">7B</text>
  <text x="530" y="328" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">Llama-2 + DINOv2 · OXE 970k</text>

  <text x="700" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">~8×</text>
  <text x="700" y="302" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">param ratio</text>
  <text x="700" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">but OpenVLA ≈ RT-2-X</text>
  <text x="700" y="330" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">on 27-task avg</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — Top half shows the action-as-text-token three-stage mapping: 7-DOF continuous waves → 256-bin quantization (accent dot scale) → reserved orange tokens inserted into the LLM vocabulary, sharing autoregressive generation with text. Bottom box areas reflect RT-2 (55B closed) vs OpenVLA (7B open) ~8× param gap.</p>

### 2.1 Key Innovation — Action as Text Token

RT-2 **discretizes 7-DOF continuous actions into 256 bins**, each represented as a **special token**:

```
Action [Δx=0.2, Δy=-0.1, ..., gripper=1] → string "<bin_45><bin_98>...<bin_255>"
```

→ Shares LLM vocab → no specialized head → leverages all LLM capability.

### 2.2 Co-Fine-Tuning

Don't just fine-tune on robot data, **simultaneously keep training on VQA / image-text pairs** → prevents catastrophic forgetting, retains LLM general capability.

### 2.3 Results

- **Sees a paper bag (never trained) and uses it** — pure VLM common sense
- **Chain-of-Thought reasoning** — "pick up the extinct animal" → selects dinosaur toy
- **Multilingual instructions** — English, Chinese, Japanese, French all work

---

## 3. OpenVLA — Open-Source Counterpart (2024)

**Kim et al. (Stanford) 2024** key contributions:
1. **Fully open-source** — model + weights + training code + data
2. **Data**: Open X-Embodiment dataset (970k+ trajectories from 22 robots)
3. **Base**: Prismatic VLM (Llama-2 7B + DINOv2 + SigLIP vision encoder)
4. **Training**: 8× A100 for 14 days
5. **Effect**: 27 tasks average slightly better than RT-2-X (55B)

**Significance**: first time small teams can reproduce the VLA route.

---

## 4. VLA Inference Pipeline

```python
# Conceptual implementation (based on OpenVLA)
from transformers import AutoModelForVision2Seq, AutoProcessor
from PIL import Image

processor = AutoProcessor.from_pretrained("openvla/openvla-7b")
vla = AutoModelForVision2Seq.from_pretrained("openvla/openvla-7b").to("cuda")

# Grab image from camera
image = Image.open("camera_view.jpg")
instruction = "In: What action should the robot take to pick up the red mug?\nOut:"

inputs = processor(instruction, image).to("cuda", dtype=torch.bfloat16)
action = vla.predict_action(**inputs, unnorm_key="bridge_orig", do_sample=False)
# action: np.array([0.2, -0.1, 0.05, 0.0, 0.0, 0.1, 1.0])  # 7-DOF
robot.step(action)
```

**Real-time challenge**: 7B model inference ~5 Hz, needs quantization or smaller models for 30 Hz control frequency.

---

## 5. History and Modern Status

- **2022** — RT-1 (Google) — 35M params, Transformer-based, 5000 demonstrations
- **July 2023** — RT-2 (Google) — adds PaLM-E, emergent reasoning
- **2023** — Open X-Embodiment dataset (22 labs, 1M demos)
- **April 2024** — Octo (Berkeley) — 90M open-source VLA
- **June 2024** — OpenVLA (Stanford) — 7B open-source
- **November 2024** — π0 (Physical Intelligence) — 3B open-source, flow model
- **2024-2025** — Helix (Figure AI), Helix-2, commercial deployment

**Why it changed robotics**:
- First truly "general" robot model route
- LLM common sense → robot zero-shot understanding of new scenarios
- Training data accumulates (Open X-Embodiment grows)
- **Scaling laws**: bigger model + more data → better and better

---

## 6. Common Pitfalls

### 6.1 Real-Time Performance

7B+ models ≥ 100 ms/step → < 10 Hz, slower than traditional BC (30+ Hz). **Mitigations**: action chunking (predict H steps at once), quantization, small-model branches.

### 6.2 Action Discretization Precision

256 bins is fine for coarse actions; fine manipulation (threading a needle) needs 1024+ bins or regression heads.

### 6.3 Data Requirements

VLA needs 100k+ trajectories + captions to generalize. **Not for small datasets** — use Diffusion Policy instead.

### 6.4 Sim2Real Still an Issue

VLA trained on OpenX (mostly real data) → doesn't generalize as freely as SDXL. **New setups / new robots need fine-tuning**.

### 6.5 Long-Horizon Failures

VLA is a single-step policy; long-horizon tasks need external planning ("open fridge then take milk" needs a task planner to decompose).

---

## 7. VLA Modern Variants

| Model | Team | Base | Key feature |
|---|---|---|---|
| **RT-1** | Google 2022 | Transformer | 35M, first generation |
| **RT-2** | Google 2023 | PaLM-E 5B/55B | Direct LLM fine-tuning |
| **Octo** | Berkeley 2024 | Transformer | 90M, open-source, modular |
| **OpenVLA** | Stanford 2024 | Llama-2 7B | Fully open |
| **π0** | Physical Intelligence 2024 | PaliGemma + Flow Matching | 3B, flow model decoder |
| **Helix** | Figure 2024-25 | Closed | Commercial deployment |
| **RDT-1B** | Tsinghua 2024 | DiT | 1B, diffusion decoder |

---

## 8. Related Concepts

- **Same-section**: [VLA Models Overview](VLA模型.en.md), [Multimodal Learning](../../03_Foundation_Models/05_Multimodal/多模态学习.en.md)
- **Robot learning**: [Diffusion Policy](../04_Robot_Learning/扩散策略.en.md), [Imitation Learning](../04_Robot_Learning/模仿学习.en.md), [Sim2Real](../04_Robot_Learning/Sim2Real.en.md)
- **Foundation**: [LLM](../../03_Foundation_Models/03_Language_Models/LLM_as_Foundation.en.md), [CLIP](../../03_Foundation_Models/04_Vision_Foundation/CLIP.en.md)
- **Modern evolution**: π0 (Flow Matching), Helix, RDT-1B

---

## References

1. **Brohan, A. et al.** "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control." *CoRL*, 2023.
2. **Kim, M. J. et al.** "OpenVLA: An Open-Source Vision-Language-Action Model." *arXiv:2406.09246*, 2024.
3. **Open X-Embodiment Collaboration** — "Open X-Embodiment: Robotic Learning Datasets and RT-X Models." *arXiv:2310.08864*, 2023.
4. **Octo Model Team** — "Octo: An Open-Source Generalist Robot Policy." *RSS*, 2024.
5. **Black, K. et al.** "π0: A Vision-Language-Action Flow Model for General Robot Control." *arXiv:2410.24164*, 2024.
