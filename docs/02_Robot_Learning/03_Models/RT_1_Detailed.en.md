# RT-1 — Google's 35M VLA in Detail

> *Google DeepMind released **RT-1** in December 2022: the first truly usable generalist robot policy. **35M parameter EfficientNet + Transformer**, trained on **130k Google in-house manipulation data**, completes 700+ tasks with 80%+ success. The pioneer of the RT-X / RT-2 / π0 lineage — small but punching above its weight.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [VLA Models](../01_Foundations/VLA模型.en.md), [Transformer](https://jeffliulab.com/ai-notes/02_Deep_Learning/06_Transformer/transformer_architect), [Imitation Learning](../02_Methods/模仿学习.en.md)
> **Further reading**: [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [π0](Pi0_Physical_Intelligence.en.md)

---

## 1. RT-1's Position in the VLA Lineage

Timeline:
- **2022-12 RT-1** — 35M, discrete action, Google internal
- **2023-07 RT-2** — 55B, reuses PaLI-X kernel, knowledge transfer
- **2024-05 OpenVLA** — 7B, open-source RT-2
- **2024-11 π0** — 3B, Flow Matching action head
- **2025-02 Helix** — dual system

RT-1 is the **origin** of this lineage.

---

## 2. Architecture

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture) + embedded token-count visualization
Q0: RT-1's three innovations made geometric: (a) USE language laterally modulates EfficientNet via FiLM; (b) Token Learner compresses 81 patch tokens to 8 learned tokens; (c) 7-DOF action discretized into 11 bins each
Q1: 81 tokens drawn as 9×9 dot grid, 8 tokens as a row of larger circles — the ~10× compression is visually obvious; FiLM shown as a side-injecting arrow from USE box into top of EfficientNet (lateral, not box-internal); 6 frames as a stacked-thumbnail strip; 7×11 action bins as a mini grid
Q2: Strip the title — the "9×9 dots → 8 big dots" compression visual + the lateral FiLM injection arrow + the 11×7 discrete grid uniquely identify RT-1 (RT-2 lacks Token Learner; π0/RDT have no discrete bins; OpenVLA is continuous)
Q3: Removed "81 → 8 tokens" as inner text label — now drawn as actual quantities; removed "FiLM mod" text — now shown as a FiLM injection arrow
Q4: 81 / 8 / 11 bins / 7-DOF / 35M numbers all sit adjacent to their geometric objects
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RT-1 architecture with token compression visualized">
  <defs>
    <marker id="rt1-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">RT-1 — FiLM lateral modulation · Token Learner 81→8 · discrete 11-bin action</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">EfficientNet-B3 + 8-layer Transformer = 35M params total</text>

  <g>
    <rect x="30" y="75" width="48" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
    <rect x="38" y="84" width="48" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
    <rect x="46" y="93" width="48" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
    <rect x="54" y="102" width="48" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
    <rect x="62" y="111" width="48" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
    <rect x="70" y="120" width="48" height="36" rx="2" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
    <text x="94" y="142" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">frame t</text>
  </g>
  <text x="74" y="175" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">6 frames</text>
  <text x="74" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">t-5 … t</text>

  <rect x="160" y="60" width="140" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="230" y="76" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-gold)">Task language</text>
  <text x="230" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">USE encoder (frozen)</text>

  <path d="M 230 100 L 230 130" stroke="var(--dia-gold)" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 230 130 L 178 145" stroke="var(--dia-gold)" stroke-width="1.5" fill="none" marker-end="url(#rt1-arr-en)"/>
  <path d="M 230 130 L 280 145" stroke="var(--dia-gold)" stroke-width="1.5" fill="none" marker-end="url(#rt1-arr-en)"/>
  <text x="230" y="122" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-gold)">γ, β (FiLM)</text>

  <rect x="160" y="140" width="140" height="100" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <rect x="160" y="140" width="4" height="100" fill="var(--dia-accent)"/>
  <text x="230" y="165" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">EfficientNet-B3</text>
  <text x="230" y="185" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">FiLM modulates each block</text>
  <text x="230" y="208" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">outputs 9 × 9 patch tokens</text>
  <text x="230" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">= 81 tokens / frame</text>

  <path d="M 118 138 L 160 165" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#rt1-arr-en)"/>

  <g fill="var(--dia-accent)" opacity="0.7">
    <circle cx="328" cy="156" r="2.5"/><circle cx="336" cy="156" r="2.5"/><circle cx="344" cy="156" r="2.5"/><circle cx="352" cy="156" r="2.5"/><circle cx="360" cy="156" r="2.5"/><circle cx="368" cy="156" r="2.5"/><circle cx="376" cy="156" r="2.5"/><circle cx="384" cy="156" r="2.5"/><circle cx="392" cy="156" r="2.5"/>
    <circle cx="328" cy="164" r="2.5"/><circle cx="336" cy="164" r="2.5"/><circle cx="344" cy="164" r="2.5"/><circle cx="352" cy="164" r="2.5"/><circle cx="360" cy="164" r="2.5"/><circle cx="368" cy="164" r="2.5"/><circle cx="376" cy="164" r="2.5"/><circle cx="384" cy="164" r="2.5"/><circle cx="392" cy="164" r="2.5"/>
    <circle cx="328" cy="172" r="2.5"/><circle cx="336" cy="172" r="2.5"/><circle cx="344" cy="172" r="2.5"/><circle cx="352" cy="172" r="2.5"/><circle cx="360" cy="172" r="2.5"/><circle cx="368" cy="172" r="2.5"/><circle cx="376" cy="172" r="2.5"/><circle cx="384" cy="172" r="2.5"/><circle cx="392" cy="172" r="2.5"/>
    <circle cx="328" cy="180" r="2.5"/><circle cx="336" cy="180" r="2.5"/><circle cx="344" cy="180" r="2.5"/><circle cx="352" cy="180" r="2.5"/><circle cx="360" cy="180" r="2.5"/><circle cx="368" cy="180" r="2.5"/><circle cx="376" cy="180" r="2.5"/><circle cx="384" cy="180" r="2.5"/><circle cx="392" cy="180" r="2.5"/>
    <circle cx="328" cy="188" r="2.5"/><circle cx="336" cy="188" r="2.5"/><circle cx="344" cy="188" r="2.5"/><circle cx="352" cy="188" r="2.5"/><circle cx="360" cy="188" r="2.5"/><circle cx="368" cy="188" r="2.5"/><circle cx="376" cy="188" r="2.5"/><circle cx="384" cy="188" r="2.5"/><circle cx="392" cy="188" r="2.5"/>
    <circle cx="328" cy="196" r="2.5"/><circle cx="336" cy="196" r="2.5"/><circle cx="344" cy="196" r="2.5"/><circle cx="352" cy="196" r="2.5"/><circle cx="360" cy="196" r="2.5"/><circle cx="368" cy="196" r="2.5"/><circle cx="376" cy="196" r="2.5"/><circle cx="384" cy="196" r="2.5"/><circle cx="392" cy="196" r="2.5"/>
    <circle cx="328" cy="204" r="2.5"/><circle cx="336" cy="204" r="2.5"/><circle cx="344" cy="204" r="2.5"/><circle cx="352" cy="204" r="2.5"/><circle cx="360" cy="204" r="2.5"/><circle cx="368" cy="204" r="2.5"/><circle cx="376" cy="204" r="2.5"/><circle cx="384" cy="204" r="2.5"/><circle cx="392" cy="204" r="2.5"/>
    <circle cx="328" cy="212" r="2.5"/><circle cx="336" cy="212" r="2.5"/><circle cx="344" cy="212" r="2.5"/><circle cx="352" cy="212" r="2.5"/><circle cx="360" cy="212" r="2.5"/><circle cx="368" cy="212" r="2.5"/><circle cx="376" cy="212" r="2.5"/><circle cx="384" cy="212" r="2.5"/><circle cx="392" cy="212" r="2.5"/>
    <circle cx="328" cy="220" r="2.5"/><circle cx="336" cy="220" r="2.5"/><circle cx="344" cy="220" r="2.5"/><circle cx="352" cy="220" r="2.5"/><circle cx="360" cy="220" r="2.5"/><circle cx="368" cy="220" r="2.5"/><circle cx="376" cy="220" r="2.5"/><circle cx="384" cy="220" r="2.5"/><circle cx="392" cy="220" r="2.5"/>
  </g>
  <text x="360" y="245" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">81 patch tokens</text>
  <path d="M 300 190 L 322 190" stroke="var(--dia-stroke-soft)" stroke-width="1.2" marker-end="url(#rt1-arr-en)"/>

  <path d="M 400 188 C 440 188 450 188 478 188" stroke="var(--dia-green)" stroke-width="2" fill="none" marker-end="url(#rt1-arr-en)"/>
  <text x="440" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">Token Learner</text>
  <text x="440" y="208" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">attn pool 81→8</text>

  <g fill="var(--dia-green)">
    <circle cx="485" cy="188" r="5"/>
    <circle cx="498" cy="188" r="5"/>
    <circle cx="511" cy="188" r="5"/>
    <circle cx="524" cy="188" r="5"/>
    <circle cx="537" cy="188" r="5"/>
    <circle cx="550" cy="188" r="5"/>
    <circle cx="563" cy="188" r="5"/>
    <circle cx="576" cy="188" r="5"/>
  </g>
  <text x="530" y="215" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">8 learned tokens</text>
  <text x="530" y="230" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">× 6 frames = 48</text>

  <rect x="600" y="125" width="100" height="135" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <rect x="600" y="125" width="4" height="135" fill="var(--dia-blue)"/>
  <text x="650" y="145" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">Transformer</text>
  <g stroke="var(--dia-blue)" stroke-width="0.8" opacity="0.55">
    <line x1="612" y1="158" x2="688" y2="158"/>
    <line x1="612" y1="170" x2="688" y2="170"/>
    <line x1="612" y1="182" x2="688" y2="182"/>
    <line x1="612" y1="194" x2="688" y2="194"/>
    <line x1="612" y1="206" x2="688" y2="206"/>
    <line x1="612" y1="218" x2="688" y2="218"/>
    <line x1="612" y1="230" x2="688" y2="230"/>
    <line x1="612" y1="242" x2="688" y2="242"/>
  </g>
  <text x="650" y="276" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">8 layers · causal</text>

  <path d="M 590 188 L 600 188" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#rt1-arr-en)"/>

  <text x="395" y="293" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="13" fill="var(--dia-stroke)">Discrete action head</text>
  <text x="395" y="310" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">11-way softmax per DOF</text>

  <g>
    <text x="295" y="328" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">7 DOF</text>
    <text x="395" y="350" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">11 bins each</text>
    <g fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.4">
      <rect x="300" y="320" width="9" height="6"/><rect x="310" y="320" width="9" height="6"/><rect x="320" y="320" width="9" height="6"/><rect x="330" y="320" width="9" height="6"/><rect x="340" y="320" width="9" height="6"/><rect x="350" y="320" width="9" height="6"/><rect x="360" y="320" width="9" height="6"/><rect x="370" y="320" width="9" height="6"/><rect x="380" y="320" width="9" height="6"/><rect x="390" y="320" width="9" height="6"/><rect x="400" y="320" width="9" height="6"/>
    </g>
    <g fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.4">
      <rect x="300" y="328" width="9" height="6"/><rect x="310" y="328" width="9" height="6"/><rect x="320" y="328" width="9" height="6"/><rect x="330" y="328" width="9" height="6"/><rect x="340" y="328" width="9" height="6"/><rect x="350" y="328" width="9" height="6"/><rect x="360" y="328" width="9" height="6"/><rect x="370" y="328" width="9" height="6"/><rect x="380" y="328" width="9" height="6"/><rect x="390" y="328" width="9" height="6"/><rect x="400" y="328" width="9" height="6"/>
    </g>
    <rect x="340" y="320" width="9" height="6" fill="var(--dia-accent)"/>
    <rect x="370" y="328" width="9" height="6" fill="var(--dia-accent)"/>
  </g>

  <path d="M 650 260 C 650 290 480 290 410 320" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#rt1-arr-en)"/>
  <text x="540" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">argmax per DOF</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — RT-1's three geometric features in one frame: USE language modulates EfficientNet via FiLM γ/β (gold dashed top); EfficientNet outputs 9×9=81 patch tokens (accent dot grid) → Token Learner attention-pools to 8 tokens (green big dots); 8-layer Transformer processes 6 frames × 8 = 48 tokens, then per-DOF 11-way softmax (bottom-right 7×11 grid).</p>

### 2.1 Key Innovations

#### FiLM Conditioning

Language encoded via **Universal Sentence Encoder**, used as FiLM (Feature-wise Linear Modulation) coefficients injected into each EfficientNet layer:

$$\text{FiLM}(x, \gamma, \beta) = \gamma \cdot x + \beta$$

Lets image features be "language-guided".

#### Token Learner

EfficientNet outputs 81 tokens (9×9 patches), compressed via attention to **8 tokens** for Transformer.

#### Discrete Action

7-DOF action each dim quantized to **256 bins (8 bit)**, model predicts 256-way softmax.
RT-1 uses 11 bins (coarse) — RT-2 raised to 256.

---

## 3. Training Data

- **Google in-house 130k demonstrations**
- 13 robots (Everyday Robots bimanual + arm + base)
- 700+ tasks (pick, place, push, pour, ...)
- Data collection took **17 months** (early 2022 to fall)

---

## 4. Performance (RT-1 Paper Reported)

| Task Category | Success Rate |
|---|---|
| Trained tasks (700+) | 97% |
| Unseen objects | 76% |
| Unseen distractors | 83% |
| Unseen background | 59% |
| Unseen room | 47% |

→ Training tasks ≈ overfit; generalization degrades with distance from training distribution.

---

## 5. RT-1 vs Successors

| Model | Params | Action | Visual Backbone | Best At |
|---|---|---|---|---|
| **RT-1** | **35M** | **disc 11-bin** | **EfficientNet** | **base** |
| RT-2 | 55B | disc 256-bin | PaLI-X | Semantic |
| OpenVLA | 7B | disc 256-bin | Prismatic-7B | Open |
| π0 | 3B | continuous flow | PaliGemma | Precise |

---

## 6. PyTorch Simplified

```python
import torch, torch.nn as nn

class RT1(nn.Module):
    def __init__(self, n_action_bins=256, action_dim=7):
        super().__init__()
        self.image_encoder = FiLMEfficientNet()
        self.token_learner = TokenLearner(n_tokens=8)
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=512, nhead=8, batch_first=True),
            num_layers=8,
        )
        self.action_head = nn.Linear(512, action_dim * n_action_bins)
        self.n_bins = n_action_bins
        self.action_dim = action_dim
    
    def forward(self, images, lang_emb):
        B = images.size(0)
        feats = torch.stack([self.image_encoder(images[:, t], lang_emb) for t in range(6)], dim=1)
        tokens = self.token_learner(feats)
        out = self.transformer(tokens)
        action_logits = self.action_head(out[:, -1]).view(B, self.action_dim, self.n_bins)
        return action_logits
    
    def sample(self, images, lang_emb):
        logits = self.forward(images, lang_emb)
        bins = logits.argmax(-1)
        return bins_to_continuous(bins)
```

---

## 7. RT-1's Impact

1. **Proves generalist robot policy is feasible** (any task, one weight)
2. **Opens the VLA route** (large model + robot action)
3. **Standardizes action discretization** trick
4. **Promotes large-scale robot data training** paradigm

---

## 8. Shortcomings

- 35M capacity small, shallow semantics (unseen object only 76%)
- 8 tokens / image, loses spatial info
- Discrete action low precision (11 bins each dim)
- Not open weights

→ RT-2 solves first 3, OpenVLA solves 4th.

---

## 9. History Timeline

- **2021-2022** — Everyday Robots data collection
- **2022-12** — RT-1 paper + demos released
- **2023-07** — RT-2 upgrade (55B PaLI-X)
- **2023-10** — RT-X (extended on OXE)
- **2024** — OpenVLA / Octo open reproduction

---

## 10. Common Pitfalls

### 10.1 Discrete Action Training Slow

256-way softmax hard to train, needs cross-entropy with label smoothing.

### 10.2 FiLM Isn't Best

Later work finds cross-attention more general than FiLM.

### 10.3 Token Learner Loses Info

81 → 8 token loses detail; later models use more tokens.

### 10.4 Data Lab-Specific

Google Everyday Robots data private, generalization to other robots unverified.

### 10.5 Inference Latency

35M not big, but 6-frame history ~50ms processing, real-time marginal.

---

## 11. Related Concepts

- **Same section**: [VLA Models](../01_Foundations/VLA模型.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [π0](Pi0_Physical_Intelligence.en.md), [Octo](Octo_Foundation_Policy.en.md), [Helix](Helix_Figure_AI.en.md)
- **Basics**: [Transformer](https://jeffliulab.com/ai-notes/02_Deep_Learning/06_Transformer/transformer_architect), [Imitation Learning](../02_Methods/模仿学习.en.md)
- **Data**: [Open X-Embodiment](../04_Data_Benchmarks/数据集与Benchmark.en.md)

---

## References

1. **Brohan, A. et al.** "RT-1: Robotics Transformer for Real-World Control at Scale." *RSS*, 2023.
2. **Ryoo, M. et al.** "TokenLearner: Adaptive Space-Time Tokenization for Videos." *NeurIPS*, 2021.
3. **Perez, E. et al.** "FiLM: Visual Reasoning with a General Conditioning Layer." *AAAI*, 2018.
4. **Brohan, A. et al.** "RT-2." *CoRL*, 2023.
5. **Everyday Robots** — Project documentation, Google X, 2022.
