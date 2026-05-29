# VLA Models (Vision-Language-Action Models)

<!-- CONTENT-EXPAND-TODO (2026-05-15)
Reviewer: agent (SVG rework pass)
Status: Overall density solid (~420 lines, tables + model cards + math); 2 components missing
Gaps:
- §5 lacks Common Pitfalls (笔记流水线 §2 #9 recommended)
- §5 lacks Worked Example (numerical chunking + one head's inference trace)
- §3.2 model cards: add "competing / closest comparable" per entry
-->

VLA (Vision-Language-Action) models are one of the most important model paradigms in embodied intelligence today: they receive visual observations and language instructions, and directly output robot actions. This article systematically reviews VLA architecture design, action representation methods, and the development trajectory from RT-1 to pi0.5.

> Related notes: [Model Roadmap](模型发展路线图.en.md) | [ACT Model](../02_Methods/ACT模型.en.md) | [Imitation Learning](../02_Methods/模仿学习.en.md) | [Diffusion Policy](../02_Methods/扩散策略.en.md) | [Foundation Models for Robotics](机器人基础模型概论.en.md) | [Open-Source Model Summary](../03_Models/开源模型汇总.en.md)

> If you want the broader model evolution before zooming into the VLA mainline, start with [Model Roadmap](模型发展路线图.en.md).

---

## 1. VLA Model Definition

### 1.1 What Is a VLA

The core definition of a VLA model:

$$\pi_\theta: (\mathbf{o}_{\text{visual}}, \mathbf{l}_{\text{language}}) \mapsto \mathbf{a}_{\text{action}}$$

where:

- $\mathbf{o}_{\text{visual}}$: Visual observation (RGB images, depth maps, point clouds, etc.)
- $\mathbf{l}_{\text{language}}$: Natural language task instruction (e.g., "pick up the red cup")
- $\mathbf{a}_{\text{action}}$: Robot action (end-effector pose, joint angles, etc.)

What distinguishes VLA from other paradigms is that it does not merely use vision and language for task understanding, but directly outputs executable low-level actions, achieving **end-to-end perception-to-action mapping**.

### 1.2 Why VLA Is Needed

Traditional robot learning methods (such as behavioral cloning) typically only accept specific observation formats and lack language understanding capabilities. Pure LLMs/VLMs, on the other hand, cannot directly output robot actions. VLA unifies both:

- **Inherited from VLM**: Visual understanding, language reasoning, commonsense knowledge
- **New capabilities**: Action output, physical interaction, real-time control

---

## 2. General Architecture

### 2.1 Three Core Components

All VLA models follow a basic three-component architecture:

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture + 3-way head fan-out)
Q0: VLA is "vision + language + proprioception → shared Transformer → action head (1 of 3) → robot action"; the key design axis is the head type (discrete / continuous / diffusion)
Q1: Three input rows (RGB / lang / proprio) flow through encoders into the central Transformer, which fans out to 3 alternative action heads (orange discrete-token / green continuous-regression / blue diffusion-flow) each with example models; head distinction by stroke color, not text-in-box
Q2: Strip the title — "3 inputs converging → Transformer → 3 fan-out heads with model exemplars" uniquely identifies a VLA survey diagram
Q3: Removed overflowing boxes (orig viewBox 900 with boxes at x=960/1100); removed verbose "ViT-B/16 / SigLIP / SentencePiece" sub-option strings
Q4: 256-bin / MSE / Flow Matching keywords sit next to their heads; example models in italic below each head
Q5: All var(--dia-*); English labels — shared with Chinese version
-->
<div class="diagram">
<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VLA universal architecture with three action head choices">
  <defs>
    <marker id="vla-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">VLA universal architecture — 3 inputs · 1 backbone · 3 action head choices</text>
  <text x="410" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">The key design axis is the head type: discrete token vs continuous regression vs diffusion / Flow Matching</text>

  <rect x="30" y="80" width="100" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="80" y="98" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">RGB images</text>
  <text x="80" y="112" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">multi-cam, ViT patches</text>

  <rect x="30" y="160" width="100" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="80" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-gold)">language</text>
  <text x="80" y="192" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">"pick red cup"</text>

  <rect x="30" y="240" width="100" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="80" y="258" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">proprioception</text>
  <text x="80" y="272" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">joint state · gripper</text>

  <rect x="170" y="80" width="120" height="40" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="230" y="98" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SigLIP / DINOv2</text>
  <text x="230" y="112" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">visual encoder</text>

  <rect x="170" y="160" width="120" height="40" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="230" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SentencePiece</text>
  <text x="230" y="192" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">tokenizer</text>

  <rect x="170" y="240" width="120" height="40" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="230" y="258" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">MLP</text>
  <text x="230" y="272" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">proprio encoder</text>

  <path d="M 130 100 L 170 100" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr-en)"/>
  <path d="M 130 180 L 170 180" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr-en)"/>
  <path d="M 130 260 L 170 260" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr-en)"/>

  <rect x="330" y="100" width="160" height="160" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="330" y="100" width="5" height="160" fill="var(--dia-accent)"/>
  <text x="410" y="130" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">Transformer</text>
  <text x="410" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">Llama / PaLM / custom</text>
  <text x="410" y="168" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">35M ~ 55B params</text>
  <g stroke="var(--dia-accent)" stroke-width="0.5" opacity="0.45">
    <line x1="345" y1="185" x2="478" y2="185"/>
    <line x1="345" y1="195" x2="478" y2="195"/>
    <line x1="345" y1="205" x2="478" y2="205"/>
    <line x1="345" y1="215" x2="478" y2="215"/>
    <line x1="345" y1="225" x2="478" y2="225"/>
    <line x1="345" y1="235" x2="478" y2="235"/>
  </g>
  <text x="410" y="252" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">all-modality token co-attention</text>

  <path d="M 295 100 L 328 145" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr-en)"/>
  <path d="M 295 180 L 328 180" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr-en)"/>
  <path d="M 295 260 L 328 215" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr-en)"/>

  <rect x="540" y="80" width="170" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <rect x="540" y="80" width="4" height="50" fill="var(--dia-accent)"/>
  <text x="625" y="100" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">(a) Discrete token</text>
  <text x="625" y="115" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">256-bin · softmax</text>
  <text x="625" y="128" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">RT-1, RT-2, OpenVLA</text>

  <rect x="540" y="155" width="170" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="2"/>
  <rect x="540" y="155" width="4" height="50" fill="var(--dia-green)"/>
  <text x="625" y="175" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-green)">(b) Continuous regression</text>
  <text x="625" y="190" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">MLP head · MSE</text>
  <text x="625" y="203" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">RT-1, Octo (default), GR-1/2</text>

  <rect x="540" y="230" width="170" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <rect x="540" y="230" width="4" height="50" fill="var(--dia-blue)"/>
  <text x="625" y="250" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-blue)">(c) Diffusion / Flow</text>
  <text x="625" y="265" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">multi-step denoise / ODE</text>
  <text x="625" y="278" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">π0, RDT, Octo (diffusion)</text>

  <path d="M 490 150 L 538 105" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr-en)"/>
  <path d="M 490 180 L 538 180" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr-en)"/>
  <path d="M 490 210 L 538 255" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr-en)"/>

  <text x="625" y="310" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-style="italic" font-size="11" fill="var(--dia-stroke)">→ 7-DOF action: Δx,Δy,Δz,Δrx,Δry,Δrz,gripper</text>
  <text x="625" y="328" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">typically emitted as chunk (16-100 steps)</text>

  <text x="80" y="312" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">3 modalities</text>
  <text x="230" y="312" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">encoders</text>
  <text x="410" y="295" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">shared backbone</text>
</svg>
</div>


**Visual encoder** choices:

| Encoder | Pretraining Method | Parameters | Used by |
|---------|--------------------|------------|---------|
| ViT-B/16 | ImageNet-21K | 86M | RT-1 |
| ViT-G | JFT-4B | 1.8B | RT-2 (PaLI-X) |
| SigLIP | WebLI contrastive learning | 400M | OpenVLA, pi0 |
| DINOv2 | Self-supervised | 300M | HPT |

### 2.2 Action Representation Methods

How VLA models output actions is a core design choice. There are currently three main approaches:

#### (a) Discrete Tokenization

Uniformly discretize the continuous action space into tokens:

$$a_d^{\text{token}} = \text{round}\left(\frac{a_d - a_{\min}}{a_{\max} - a_{\min}} \cdot (K-1)\right), \quad K=256$$

**Representatives**: RT-2, OpenVLA

**Advantages**: Can directly reuse the language model's token prediction mechanism

**Disadvantages**: Discretization loses precision; difficult to express multimodal action distributions

#### (b) Continuous Regression

The action head directly outputs continuous values:

$$\hat{\mathbf{a}} = \text{MLP}(\mathbf{h}_{\text{transformer}})$$

Training loss is typically MSE:

$$\mathcal{L} = \|\hat{\mathbf{a}} - \mathbf{a}^*\|^2$$

**Representatives**: RT-1, Octo (optional)

**Advantages**: Simple, direct, high precision

**Disadvantages**: MSE loss assumes a unimodal Gaussian distribution; cannot model multimodal actions

#### (c) Diffusion / Flow Matching

Uses generative models to model the action distribution:

$$\mathbf{a} \sim p_\theta(\mathbf{a} | \mathbf{o}, \mathbf{l})$$

Samples actions from noise via iterative denoising or flow matching:

$$\mathbf{a}_1 = \mathbf{a}_0 + \int_0^1 v_\theta(\mathbf{a}_t, t, c) \, dt, \quad \mathbf{a}_0 \sim \mathcal{N}(0, I)$$

**Representatives**: pi0, RDT, Octo (diffusion head option)

**Advantages**: Can model complex multimodal action distributions; highest precision

**Disadvantages**: Inference requires multiple denoising steps; slower

> More on diffusion policies: [Diffusion Policy](../02_Methods/扩散策略.md)

---

## 3. Model Development Timeline

### 3.1 Timeline Overview

<!-- SVG-DESIGN-NOTES
Type: E (historical timeline) with color-coded head type
Q0: VLA 2022-2025 evolution shows a clear "head-type migration" trend: early RT-1 discrete → RT-2 discrete token → Octo/OpenVLA explore continuous & diffusion → π0/RDT fully embrace diffusion / Flow Matching
Q1: Horizontal time axis 2022-2025; each model is one dot + label; color encodes action-head type (orange discrete / green continuous / blue diffusion); circle size encodes param count (r=5, 7, 10); upper/lower alternation avoids overlap
Q2: Strip the title — "2022-2025 axis + 11 colored dots with trend orange→green→blue" is the head-type-evolution timeline signature
Q3: Removed original 4 parallel timelines with truncated "(Stanford/Berkel" / "(Physical Intelligen" labels; converted to single axis with above/below alternation
Q4: Model name + institution + param count placed adjacent to each dot
Q5: All var(--dia-*); English + numeric labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VLA timeline 2022-2025 colored by action head type">
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">VLA evolution timeline (2022 – 2025)</text>
  <text x="410" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Color encodes action-head type · circle size encodes param count</text>

  <g transform="translate(60, 70)">
    <circle cx="0" cy="0" r="5" fill="var(--dia-accent)"/>
    <text x="10" y="4" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">discrete token</text>
    <circle cx="115" cy="0" r="5" fill="var(--dia-green)"/>
    <text x="125" y="4" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">continuous</text>
    <circle cx="215" cy="0" r="5" fill="var(--dia-blue)"/>
    <text x="225" y="4" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">diffusion / Flow</text>
    <text x="335" y="4" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">⊕ r=5/7/10 ≈ ~100M / ~1B / ~10B params</text>
  </g>

  <line x1="60" y1="200" x2="780" y2="200" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <g font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">
    <line x1="60" y1="200" x2="60" y2="208" stroke="var(--dia-stroke)"/>
    <text x="60" y="225" text-anchor="middle">2022</text>
    <line x1="300" y1="200" x2="300" y2="208" stroke="var(--dia-stroke)"/>
    <text x="300" y="225" text-anchor="middle">2023</text>
    <line x1="540" y1="200" x2="540" y2="208" stroke="var(--dia-stroke)"/>
    <text x="540" y="225" text-anchor="middle">2024</text>
    <line x1="780" y1="200" x2="780" y2="208" stroke="var(--dia-stroke)"/>
    <text x="780" y="225" text-anchor="middle">2025</text>
  </g>

  <circle cx="120" cy="200" r="5" fill="var(--dia-accent)"/>
  <line x1="120" y1="195" x2="120" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="120" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">RT-1</text>
  <text x="120" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">35M · Google</text>

  <circle cx="320" cy="200" r="10" fill="var(--dia-accent)"/>
  <line x1="320" y1="190" x2="320" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="320" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">RT-2</text>
  <text x="320" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">55B · Google DM</text>

  <circle cx="430" cy="200" r="5" fill="var(--dia-green)"/>
  <line x1="430" y1="205" x2="430" y2="250" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="430" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">Octo</text>
  <text x="430" y="275" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">93M · Berkeley</text>

  <circle cx="520" cy="200" r="7" fill="var(--dia-accent)"/>
  <line x1="520" y1="193" x2="520" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="520" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">OpenVLA</text>
  <text x="520" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">7B · Stanford</text>

  <circle cx="595" cy="200" r="5" fill="var(--dia-green)"/>
  <line x1="595" y1="205" x2="595" y2="250" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="595" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">HPT</text>
  <text x="595" y="275" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">~300M · MIT</text>

  <circle cx="640" cy="200" r="7" fill="var(--dia-blue)"/>
  <line x1="640" y1="193" x2="640" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="640" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">RDT</text>
  <text x="640" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">1B · Tsinghua</text>

  <circle cx="680" cy="200" r="7" fill="var(--dia-green)"/>
  <line x1="680" y1="205" x2="680" y2="250" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="680" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">GR-1</text>
  <text x="680" y="275" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">~1B · Fourier</text>

  <circle cx="720" cy="200" r="8" fill="var(--dia-blue)"/>
  <line x1="720" y1="192" x2="720" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="720" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">π0</text>
  <text x="720" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">3B · PI</text>

  <circle cx="755" cy="200" r="9" fill="var(--dia-blue)"/>
  <line x1="755" y1="191" x2="755" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="755" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">π0.5</text>
  <text x="755" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">3B+ · hierarchical</text>

  <circle cx="660" cy="200" r="9" fill="var(--dia-blue)" opacity="0.8" stroke="var(--dia-stroke)" stroke-width="0.8"/>
  <line x1="660" y1="208" x2="660" y2="295" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 2"/>
  <text x="660" y="307" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">Helix</text>
  <text x="660" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">7B+80M dual · Figure</text>

  <path d="M 130 95 C 300 95 500 95 720 95" stroke="var(--dia-stroke-soft)" stroke-width="0.6" fill="none" stroke-dasharray="3 4" marker-end="url(#vla-arr-time-en)"/>
  <defs>
    <marker id="vla-arr-time-en" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>
  <text x="410" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">Trend: discrete token (orange) → continuous regression (green) → diffusion / Flow Matching (blue)</text>
</svg>
</div>


### 3.2 Detailed Model Cards

#### RT-1 (Google, 2022)

- **Architecture**: EfficientNet-B3 visual encoding + TokenLearner compression + Transformer decoder
- **Data**: 130K real robot episodes, 700+ tasks, 13 Everyday Robots
- **Action space**: Discretized tokens (256 bins per dimension), outputs 7DoF end-effector pose + termination signal + mobile base
- **Control frequency**: 3Hz
- **Key contribution**: Demonstrated that large-scale real data-trained Transformers can generalize to novel objects and instructions
- **Limitation**: Only supports a single robot platform; generalization limited to within training distribution

#### RT-2 (Google DeepMind, 2023)

- **Architecture**: PaLI-X (55B) or PaLM-E (12B) as backbone, co-fine-tuned
- **Data**: Robot data + Web-scale vision-language data
- **Action representation**: Actions encoded as text tokens `"1 128 91 241 5 101 127"`
- **Key contributions**:
    - First demonstration that a VLM can be fine-tuned into a VLA
    - Emergent reasoning: understanding "move apple to bowl with matching color"
    - Symbolic reasoning: understanding logic and relations in language
- **Limitation**: Enormous model (55B), inference speed only 1–3Hz

#### Octo (Berkeley, 2023)

- **Architecture**: Pure Transformer, supports multiple observation and action spaces
- **Data**: Open X-Embodiment dataset (800K+ episodes)
- **Action head**: Supports both continuous regression and diffusion modes
- **Key contributions**:
    - First open-source general robot foundation model
    - Flexible architecture supporting different robots
    - Supports both language and goal image task specification
- **Parameters**: 93M (Base)

#### OpenVLA (Stanford/Berkeley, 2024)

- **Architecture**: Prismatic VLM (SigLIP + DinoV2 dual visual encoders) + Llama 2 7B
- **Data**: Open X-Embodiment dataset
- **Action representation**: Discretized tokens (256 bins), reusing LLM token prediction
- **Key contributions**:
    - Open-source 7B-scale VLA, fine-tunable on consumer GPUs
    - Demonstrated that VLM architectures can effectively transfer to robot control
- **Fine-tuning**: LoRA efficient fine-tuning, requiring only small amounts of data on new robots

#### pi0 (Physical Intelligence, 2024)

- **Architecture**: 3B pretrained VLM + Flow Matching action head
- **Data**: Large-scale dataset across multiple robot platforms
- **Action representation**: Flow Matching generates continuous action sequences (action chunks)
- **Key contributions**:
    - Flow Matching action head can model multimodal action distributions
    - Cross-embodiment transfer: same model controls multiple different robots
    - Action chunks (predicting multiple future steps at once) improve temporal consistency
- **Control frequency**: ~50Hz (GPU inference + action chunk)

#### pi0.5 (Physical Intelligence, 2025)

- **Architecture**: Dual-layer structure — high-level VLM for sub-task planning + low-level pi0 for fine-grained control
- **Key contributions**:
    - Hierarchical Task Decomposition
    - High-level model understands long-horizon complex tasks
    - Low-level model executes fine manipulation actions
    - Completes end-to-end laundry, cleaning, and other long-sequence tasks in real home environments

#### GR-1 (Fourier Intelligence, 2024)

- **Architecture**: GPT-style Transformer, simultaneously predicts video frames and actions
- **Data**: Humanoid robot manipulation data + human video data
- **Key contributions**:
    - First humanoid robot-specific VLA model
    - Multi-task learning of video prediction + action prediction
    - Can learn from human videos, then transfer to humanoid robots

#### GR-2 (Fourier Intelligence, 2025)

- **Architecture**: 3B+ parameters, includes world model component
- **Key contributions**:
    - Scale increased to 3B+ parameters
    - Introduces world model component to predict future visual states
    - Supports more complex humanoid robot whole-body manipulation

#### HPT (MIT, 2024)

- **Architecture**: Heterogeneous Pretrained Transformer, unified processing of sensor inputs with different dimensions
- **Key contributions**:
    - Solves the problem of inconsistent sensor dimensions across robots
    - Uses modality alignment layers (stems) to map heterogeneous inputs to a unified space
    - Pretrained on Open X-Embodiment + DROID

#### RDT (Tsinghua, 2024)

- **Architecture**: Diffusion Transformer (DiT-style), focused on bimanual manipulation
- **Data**: Bimanual manipulation datasets
- **Key contributions**:
    - Introduces DiT architecture to robot action generation
    - Natively supports high-dimensional bimanual action spaces (14+ DoF)
    - Diffusion process can model the complex action distributions of bimanual coordination

---

## 4. Core Technical Deep Dive

### 4.1 Action Chunking

Action chunking is a key technique in VLA models. Instead of predicting a single action per step, it predicts a sequence of $H$ future actions at once:

$$\hat{\mathbf{a}}_{t:t+H} = \pi_\theta(\mathbf{o}_t, \mathbf{l})$$

where $H$ is the chunk size (typically 16–100 steps).

**Benefits**:

1. **Temporal consistency**: Avoids jitter and incoherence in step-by-step prediction
2. **Reduced inference calls**: Model inference needed only every $H$ steps
3. **Implicit planning**: The model learns short-term action planning

**Execution strategy**: Typically, instead of executing the entire chunk before re-predicting, the model re-predicts every $k < H$ steps, fusing old and new chunks via exponential weighted averaging:

$$\mathbf{a}_t^{\text{exec}} = w \cdot \hat{\mathbf{a}}_t^{\text{new}} + (1-w) \cdot \hat{\mathbf{a}}_t^{\text{old}}$$

This design line did not appear out of nowhere. The key bridge model is [ACT Model](../02_Methods/ACT模型.en.md): ACT turned chunked action prediction into a reproducible and interpretable policy paradigm, and many later VLA horizon, chunk execution, and temporal smoothing designs inherit intuition from that line.

### 4.2 Co-fine-tuning Strategy

Co-fine-tuning, proposed by RT-2, is a key training technique:

$$\mathcal{L}_{\text{total}} = \lambda_{\text{robot}} \mathcal{L}_{\text{robot}} + \lambda_{\text{web}} \mathcal{L}_{\text{web}}$$

During the fine-tuning phase, the original VLM training data is not entirely discarded; instead, robot data and web data are mixed for training. This approach:

- Preserves the VLM's original visual understanding and language capabilities
- Prevents catastrophic forgetting
- Allows web knowledge to continuously influence robot policy learning

### 4.3 Challenges of Cross-Embodiment Transfer

Key differences between robots:

| Difference Dimension | Example |
|---------------------|---------|
| Observation space | Single camera vs. dual cameras vs. wrist camera |
| Action space | 6DoF end-effector vs. 7DoF joint vs. 14DoF bimanual |
| Action range | Tabletop manipulation vs. whole-body movement |
| Control frequency | 3Hz vs. 50Hz vs. 200Hz |
| Dynamics | Light load vs. heavy load |

Handling strategies:

1. **Action space standardization** (Octo): Normalize all actions to a unified range
2. **Modality alignment layers** (HPT): Use learnable stems to map heterogeneous inputs to a unified space
3. **Task-specific fine-tuning heads**: Share the backbone, fine-tune output heads for different robots

---

## 5. Model Comparison Summary

| Model | Year | Institution | Parameters | Action Repr. | Data Scale | Open Source |
|-------|------|-------------|------------|-------------|-----------|-------------|
| RT-1 | 2022 | Google | 35M | Discrete Token | 130K ep | No |
| RT-2 | 2023 | Google DeepMind | 12–55B | Discrete Token | 130K ep + Web | No |
| Octo | 2023 | Berkeley | 93M | Continuous/Diffusion | 800K+ ep | Yes |
| OpenVLA | 2024 | Stanford/Berkeley | 7B | Discrete Token | 970K+ ep | Yes |
| pi0 | 2024 | Physical Intelligence | 3B | Flow Matching | Large-scale | Yes |
| pi0.5 | 2025 | Physical Intelligence | 3B+ | Flow Matching | Large-scale | No |
| GR-1 | 2024 | Fourier | ~1B | Continuous Regression | Humanoid data | Partial |
| GR-2 | 2025 | Fourier | 3B+ | Continuous Regression | Humanoid data | No |
| HPT | 2024 | MIT | ~300M | Continuous/Diffusion | Multi-source | Yes |
| RDT | 2024 | Tsinghua | ~1B | Diffusion | Bimanual data | Yes |

---

## 6. Future Trends

1. **Evolution of action heads**: From discrete tokens → continuous regression → diffusion/Flow Matching, trending toward higher precision and multimodal modeling
2. **Hierarchical design**: The high-level planning + low-level control paradigm of pi0.5 may become mainstream
3. **Training efficiency**: LoRA, QLoRA, and other efficient fine-tuning methods reduce VLA adaptation costs
4. **Real-time performance**: Model distillation, quantization, action chunking, and other techniques improve inference speed
5. **Data flywheel**: Data collected from deployed VLAs feeds back into model training, forming a positive cycle

---

**References**:

- Brohan et al., "RT-1: Robotics Transformer for Real-World Control at Scale", RSS 2023
- Brohan et al., "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control", CoRL 2023
- Team et al., "Octo: An Open-Source Generalist Robot Policy", RSS 2024
- Kim et al., "OpenVLA: An Open-Source Vision-Language-Action Model", 2024
- Black et al., "pi0: A Vision-Language-Action Flow Model for General Robot Control", 2024
- Physical Intelligence, "pi0.5: a Vision-Language-Action Model with Open-World Generalization", 2025
- Wu et al., "GR-1: Unleashing Large-Scale Video Generative Pre-training for Visual Robot Manipulation", 2024
- Liang et al., "HPT: Heterogeneous Pre-trained Transformers", 2024
- Liu et al., "RDT-1B: a Diffusion Foundation Model for Bimanual Manipulation", 2024
