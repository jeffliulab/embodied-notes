# Helix — Figure AI's Dual-System VLA

> *Figure AI released **Helix** in February 2025: the first **humanoid-specific** dual-system VLA. System 2 (7B VLM, 7-9 Hz) handles high-level semantics; System 1 (80M Transformer, 200 Hz) does real-time control. Two independent networks communicate via latent, getting LLM semantics AND 200 Hz reactive manipulation. The next-gen design after RT-2 / π0.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [VLA Models](../01_Foundations/VLA模型.en.md), [π0](Pi0_Physical_Intelligence.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md)
> **Further reading**: [Octo](Octo_Foundation_Policy.en.md), [RDT-1B](RDT_1B.en.md)

---

## 1. Company Background

Figure AI (San Jose, founded 2022):
- Founder **Brett Adcock** (ex-Archer founder)
- Investors: OpenAI / Microsoft / NVIDIA / Bezos ($675M+ cumulative)
- Products: **Figure 01 / Figure 02** full-size humanoid robots
- Strategy: **in-house robot policy**, no outsourcing → Helix is this strategy's product

---

## 2. Why Dual-System

### 2.1 Single VLA Dilemma

| Need | Single-VLA Problem |
|---|---|
| Strong semantics | needs 7B+ VLM, 100-200ms latency |
| Real-time control | needs 200 Hz (5ms cycle) |
| One net can't do both | must trade off |

RT-2 / π0 lean System 2 (semantic), sacrificing speed.
Diffusion Policy / ACT lean System 1 (control), sacrificing semantics.

### 2.2 Humanoid Robot Special Needs

- **24-50 DOF** (bimanual + torso + legs)
- Bimanual coordination (transfer object hand-to-hand)
- Whole-body balance (head / torso / legs dynamic stability)
- Complex semantics ("sort blue items to the left")

→ Must be dual-system.

---

## 3. Helix Architecture

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture)
Q0: Helix's DNA is "huge slow VLM (7B) feeds a tiny high-frequency controller (80M) through a narrow latent channel — param ratio ~87× and frequency ratio ~30×"
Q1: Node size encodes param count — S2 box ~3-4× larger than S1 (linear; true 87× would shrink S1 to a pixel); latent rendered as a narrow gold strip emphasizing channel bottleneck; S1 receives BOTH observation and latent (two in-edges)
Q2: Strip the title — you see "one big accent block + one small green block + a thin gold pipe between them → small box outputting 35-DOF" — this mega/mini visual asymmetry is the dual-system signature; no other VLA looks like this
Q3: Removed the original 4 equal-height boxes; removed putting 7B / 80M as inner labels — size now directly encodes those numbers; kept dual in-edge to S1 to show it still reads observation
Q4: 7B / 80M / 256-d / 35-DOF labels hug their geometric elements; param ratio 87× annotated between the two blocks
Q5: All var(--dia-*); English labels — shared between .md and .en.md (Chinese version of .md uses 观测 instead of "observation")
-->
<div class="diagram">
<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Helix dual-system architecture with size-meaningful blocks">
  <defs>
    <marker id="hlx-a-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Dual-system — 7B slow brain drives 80M fast hands</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Param ratio ~87× · frequency ratio ~30× · async via 256-d latent</text>

  <rect x="30" y="135" width="120" height="80" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="90" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Observation</text>
  <text x="90" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">2 head cams</text>
  <text x="90" y="196" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">+ 50-d joints</text>
  <text x="90" y="212" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">@ 200 Hz</text>

  <rect x="200" y="70" width="260" height="160" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="200" y="70" width="6" height="160" fill="var(--dia-accent)"/>
  <text x="330" y="100" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="16" fill="var(--dia-accent-deep)">System 2 · VLM</text>
  <text x="330" y="125" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="22" fill="var(--dia-accent-deep)">7B</text>
  <text x="330" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">PaliGemma-style</text>
  <text x="330" y="170" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">~150 ms inference</text>
  <text x="330" y="188" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">7-9 Hz</text>
  <text x="330" y="212" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">"what to do / which object"</text>

  <rect x="240" y="270" width="120" height="58" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="2"/>
  <rect x="240" y="270" width="4" height="58" fill="var(--dia-green)"/>
  <text x="300" y="288" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="13" fill="var(--dia-green)">System 1</text>
  <text x="300" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="14" fill="var(--dia-green)">80M · 200 Hz</text>
  <text x="300" y="322" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">5 ms · "how to move each joint"</text>

  <path d="M 330 230 L 330 270" stroke="var(--dia-gold)" stroke-width="3" fill="none"/>
  <circle cx="330" cy="250" r="9" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="2"/>
  <text x="350" y="254" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">256-d latent</text>
  <text x="350" y="268" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">intent vector</text>

  <path d="M 150 165 L 200 130" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#hlx-a-arr-en)"/>
  <path d="M 150 195 C 200 250 220 290 240 295" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#hlx-a-arr-en)"/>
  <text x="180" y="265" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">direct obs.</text>

  <rect x="540" y="277" width="180" height="44" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="630" y="295" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">35-DOF actions</text>
  <text x="630" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">arm + hand + waist + base</text>
  <path d="M 360 299 L 540 299" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#hlx-a-arr-en)"/>

  <text x="530" y="105" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-accent-deep)">7B / 80M ≈ 87×</text>
  <text x="530" y="125" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">box area encodes this gap</text>
  <text x="530" y="142" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">(linear scale clipped at 4×)</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — S2 (7B accent block) feeds S1 (80M green block) through a narrow latent channel; S1 also reads observation directly, so it keeps producing actions at 200 Hz even when S2 hasn't refreshed.</p>

<!-- SVG-DESIGN-NOTES
Type: C (process / dual time-axes)
Q0: S1 runs at 200 Hz, exactly 30× faster than S2's 7 Hz — S1 reuses the same latent for 30 control steps between S2 updates
Q1: Two parallel horizontal time axes (X = time in ms); S2 axis has sparse tall accent ticks (every 143 ms); S1 axis has dense short green ticks (every 5 ms); S2 inference duration rendered as a 150-ms-wide faded accent bar, revealing it occupies most of one S2 cycle
Q2: Strip the title — you see "one row of sparse long pulses + one row of dense short pulses + a 30:1 callout between" — this async-frequency contrast is the soul of dual-system; no single-net VLA has such a diagram
Q3: Removed connecting lines between ticks (each tick is an independent pulse); removed box frames; only axes + ticks remain
Q4: "latent[k]" / "latent[k+1]" sit directly atop their S2 tick; "30 S1 steps reuse same latent" stretches between the two axes; 5-ms bracket directly circles one S1 cycle
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Helix dual-frequency timing">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Async frequency — S1 at 200 Hz is 30× faster than S2 at 7 Hz</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Between each S2 latent refresh, S1 reuses the same latent for 30 control steps</text>

  <line x1="80" y1="280" x2="720" y2="280" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80" y1="280" x2="80" y2="285" stroke="var(--dia-stroke)"/><text x="80" y="300" text-anchor="middle">0</text>
    <line x1="186" y1="280" x2="186" y2="285" stroke="var(--dia-stroke)"/><text x="186" y="300" text-anchor="middle">50</text>
    <line x1="293" y1="280" x2="293" y2="285" stroke="var(--dia-stroke)"/><text x="293" y="300" text-anchor="middle">100</text>
    <line x1="400" y1="280" x2="400" y2="285" stroke="var(--dia-stroke)"/><text x="400" y="300" text-anchor="middle">150</text>
    <line x1="506" y1="280" x2="506" y2="285" stroke="var(--dia-stroke)"/><text x="506" y="300" text-anchor="middle">200</text>
    <line x1="613" y1="280" x2="613" y2="285" stroke="var(--dia-stroke)"/><text x="613" y="300" text-anchor="middle">250</text>
    <line x1="720" y1="280" x2="720" y2="285" stroke="var(--dia-stroke)"/><text x="720" y="300" text-anchor="middle">300 ms</text>
  </g>

  <text x="68" y="100" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">S2 (7 Hz)</text>
  <text x="68" y="115" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">7B VLM</text>

  <rect x="80" y="93" width="318" height="22" fill="var(--dia-accent)" opacity="0.18"/>
  <rect x="385" y="93" width="318" height="22" fill="var(--dia-accent)" opacity="0.18"/>
  <line x1="80" y1="86" x2="80" y2="122" stroke="var(--dia-accent)" stroke-width="3"/>
  <line x1="385" y1="86" x2="385" y2="122" stroke="var(--dia-accent)" stroke-width="3"/>
  <line x1="691" y1="86" x2="691" y2="122" stroke="var(--dia-accent)" stroke-width="3"/>
  <text x="80" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">latent[k]</text>
  <text x="385" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">latent[k+1]</text>
  <text x="691" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">latent[k+2]</text>
  <text x="239" y="138" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">~150 ms inference (faded bar)</text>

  <line x1="80" y1="122" x2="80" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <line x1="385" y1="122" x2="385" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <line x1="691" y1="122" x2="691" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>

  <text x="232" y="165" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-style="italic" font-size="13" fill="var(--dia-accent-deep)">30 × S1 steps reuse same latent</text>
  <path d="M 80 175 L 380 175" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="1 3"/>
  <path d="M 80 175 L 88 171 M 80 175 L 88 179" stroke="var(--dia-stroke-soft)" stroke-width="1" fill="none"/>
  <path d="M 380 175 L 372 171 M 380 175 L 372 179" stroke="var(--dia-stroke-soft)" stroke-width="1" fill="none"/>

  <text x="68" y="225" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-green)">S1 (200 Hz)</text>
  <text x="68" y="240" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">80M trans</text>

  <g stroke="var(--dia-green)" stroke-width="1.5">
    <line x1="80" y1="220" x2="80" y2="240"/>
    <line x1="91" y1="220" x2="91" y2="240"/>
    <line x1="101" y1="220" x2="101" y2="240"/>
    <line x1="112" y1="220" x2="112" y2="240"/>
    <line x1="122" y1="220" x2="122" y2="240"/>
    <line x1="133" y1="220" x2="133" y2="240"/>
    <line x1="143" y1="220" x2="143" y2="240"/>
    <line x1="154" y1="220" x2="154" y2="240"/>
    <line x1="164" y1="220" x2="164" y2="240"/>
    <line x1="175" y1="220" x2="175" y2="240"/>
    <line x1="186" y1="220" x2="186" y2="240"/>
    <line x1="196" y1="220" x2="196" y2="240"/>
    <line x1="207" y1="220" x2="207" y2="240"/>
    <line x1="217" y1="220" x2="217" y2="240"/>
    <line x1="228" y1="220" x2="228" y2="240"/>
    <line x1="239" y1="220" x2="239" y2="240"/>
    <line x1="249" y1="220" x2="249" y2="240"/>
    <line x1="260" y1="220" x2="260" y2="240"/>
    <line x1="271" y1="220" x2="271" y2="240"/>
    <line x1="281" y1="220" x2="281" y2="240"/>
    <line x1="292" y1="220" x2="292" y2="240"/>
    <line x1="302" y1="220" x2="302" y2="240"/>
    <line x1="313" y1="220" x2="313" y2="240"/>
    <line x1="324" y1="220" x2="324" y2="240"/>
    <line x1="334" y1="220" x2="334" y2="240"/>
    <line x1="345" y1="220" x2="345" y2="240"/>
    <line x1="356" y1="220" x2="356" y2="240"/>
    <line x1="366" y1="220" x2="366" y2="240"/>
    <line x1="377" y1="220" x2="377" y2="240"/>
    <line x1="385" y1="220" x2="385" y2="240"/>
    <line x1="396" y1="220" x2="396" y2="240"/>
    <line x1="406" y1="220" x2="406" y2="240"/>
    <line x1="417" y1="220" x2="417" y2="240"/>
    <line x1="428" y1="220" x2="428" y2="240"/>
    <line x1="438" y1="220" x2="438" y2="240"/>
    <line x1="449" y1="220" x2="449" y2="240"/>
    <line x1="459" y1="220" x2="459" y2="240"/>
    <line x1="470" y1="220" x2="470" y2="240"/>
    <line x1="481" y1="220" x2="481" y2="240"/>
    <line x1="491" y1="220" x2="491" y2="240"/>
    <line x1="502" y1="220" x2="502" y2="240"/>
    <line x1="513" y1="220" x2="513" y2="240"/>
    <line x1="523" y1="220" x2="523" y2="240"/>
    <line x1="534" y1="220" x2="534" y2="240"/>
    <line x1="544" y1="220" x2="544" y2="240"/>
    <line x1="555" y1="220" x2="555" y2="240"/>
    <line x1="566" y1="220" x2="566" y2="240"/>
    <line x1="576" y1="220" x2="576" y2="240"/>
    <line x1="587" y1="220" x2="587" y2="240"/>
    <line x1="597" y1="220" x2="597" y2="240"/>
    <line x1="608" y1="220" x2="608" y2="240"/>
    <line x1="619" y1="220" x2="619" y2="240"/>
    <line x1="629" y1="220" x2="629" y2="240"/>
    <line x1="640" y1="220" x2="640" y2="240"/>
    <line x1="650" y1="220" x2="650" y2="240"/>
    <line x1="661" y1="220" x2="661" y2="240"/>
    <line x1="672" y1="220" x2="672" y2="240"/>
    <line x1="682" y1="220" x2="682" y2="240"/>
    <line x1="691" y1="220" x2="691" y2="240"/>
    <line x1="702" y1="220" x2="702" y2="240"/>
    <line x1="713" y1="220" x2="713" y2="240"/>
  </g>

  <path d="M 80 251 L 80 255 L 91 255 L 91 251" stroke="var(--dia-green)" stroke-width="1" fill="none"/>
  <text x="85" y="269" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">5 ms</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — Timeline shows S2 (accent, 7 Hz, 150 ms inference) vs S1 (green, 200 Hz, 5 ms inference) with ~30:1 frequency ratio. S1 reuses the same latent across all 30 of its steps between S2 refreshes.</p>

### 3.1 System 2 (VLM, 7-9 Hz)

- VLM backbone: 7B (Figure doesn't disclose but suggests PaliGemma-like)
- Input: cameras + task instruction
- Output: **256-d latent intent vector**
- Speed: 100-150ms inference, **7-9 Hz**
- Task: high-level — where to move, what to grab

### 3.2 System 1 (Motor, 200 Hz)

- 80M Transformer (8 layer, hidden 256)
- Input: current frame + joint state + System 2 latent
- Output: 35-DOF action (arm + hand + waist + base)
- Speed: 5ms inference, **200 Hz**
- Task: low-level — how to adjust each joint in real-time

### 3.3 Async Communication

- System 2 runs 7 Hz, System 1 runs 200 Hz → ratio ~1:30
- System 1 keeps using old latent for the 30 steps System 2 isn't updated
- System 2 latent **smoothly updated** (1-3 step blend)

---

## 4. Training Pipeline

### 4.1 Data Collection

- Real-robot teleoperation: Figure 02 data, thousands of hours
- Data type: bimanual manipulation + locomotion

### 4.2 Joint Training

System 1 + System 2 **trained simultaneously** (unlike RT-2's staged):

$$\mathcal{L} = \mathcal{L}_{\text{action}}(\text{S1 output}, \text{demo action}) + \alpha \cdot \mathcal{L}_{\text{aux}}(\text{S2 latent})$$

Auxiliary loss prevents latent collapse.

### 4.3 Single Network

Figure emphasizes: **Helix is one generalist model**, no per-task weights.

---

## 5. Performance (Figure Public Demos)

### 5.1 Flagship Tasks

- **Multi-robot coordination**: two Figure 02s wash dishes (one holds, the other wipes)
- **Zero-shot objects**: sort unseen fruits (unseen objects succeed)
- **Long horizon**: 5+ minute continuous multi-step tasks
- **Language-driven**: "put red items left, blue right"

### 5.2 Performance Numbers

Figure internal data, 2025-Q1 demos:
- Single-step task success 90%+
- 5-task chain 70%+
- Inference latency S2 150ms / S1 5ms

---

## 6. vs Other VLAs

| Model | Architecture | Speed (Hz) | Multi-system | Real deployment |
|---|---|---|---|---|
| RT-2 | 55B single net | 5 | No | Google internal |
| π0 | 3B single net | 12 | No | PI experimental |
| **Helix** | **7B + 80M dual** | **7 / 200** | **✅** | **Figure 02 production** |
| OpenVLA | 7B single net | 10 | No | open-source demos |
| RDT-1B | 1B single net | 7 | No | Tsinghua experimental |

Helix is the **only public** deployed dual-system VLA.

---

## 7. PyTorch Conceptual

```python
import torch, torch.nn as nn

class System2(nn.Module):
    """Slow VLM, outputs latent intent."""
    def __init__(self):
        super().__init__()
        self.vlm = VLM_7B(frozen=False)
        self.latent_proj = nn.Linear(4096, 256)
    
    def forward(self, images, lang):
        feat = self.vlm(images, lang)  # ~150ms
        return self.latent_proj(feat[:, 0])  # 256-d latent

class System1(nn.Module):
    """Fast motor, outputs 35-DOF actions."""
    def __init__(self):
        super().__init__()
        self.trans = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=256, nhead=8, batch_first=True),
            num_layers=8,
        )
        self.img_proj = nn.Linear(512, 256)
        self.state_proj = nn.Linear(50, 256)
        self.action_head = nn.Linear(256, 35)
    
    def forward(self, image_feat, joint_state, s2_latent):
        # ~5ms forward
        img = self.img_proj(image_feat)
        state = self.state_proj(joint_state)
        tokens = torch.stack([img, state, s2_latent], dim=1)
        out = self.trans(tokens)
        return self.action_head(out[:, -1])

class Helix:
    """Combined dual-system, async."""
    def __init__(self):
        self.s2 = System2()
        self.s1 = System1()
        self.s2_latent = None
        self.s2_freq = 7  # Hz
        self.s1_freq = 200  # Hz
    
    def step(self, image, joint_state, lang, step_idx):
        # System 2 every 30 steps (= 200/7)
        if step_idx % 30 == 0:
            self.s2_latent = self.s2(image, lang)
        # System 1 every step
        return self.s1(image_feat, joint_state, self.s2_latent)
```

---

## 8. Pros / Cons

### 8.1 Pros

- ✅ **Solves 200 Hz vs 7B VLM dilemma**
- ✅ **Production deployment** (Figure 02 real)
- ✅ **Multi-task one weight**

### 8.2 Cons

- ❌ **Not open-source** (Figure fully proprietary)
- ❌ S2 latent lossy (256-d compresses 7B output)
- ❌ Training complexity (dual-net sync)
- ❌ Figure data private, no independent verification

---

## 9. History Timeline

- **Mid 2024** — Figure internal Helix V1
- **2024-12** — Figure 02 released
- **2025-02** — Helix officially released + multiple demo videos
- **2025-Q2** — BMW factory deployment partnership
- **2025+** — Figure 03 release?

---

## 10. Common Pitfalls

### 10.1 Latency Mismatch

S1 lags S2 latent by 30 steps; abrupt task changes have ~150ms reaction lag. Figure uses "smooth blend" to mitigate.

### 10.2 Private Data

Can't independently verify Helix performance. Academia uses OpenVLA + distill to small net to reproduce idea.

### 10.3 Dual-System Isn't New

System 1 / System 2 idea from Kahneman psychology. Helix is engineering implementation, but theoretically dual / hierarchical RL existed long before (HRL, options framework).

### 10.4 Real-time 5ms Limit

200 Hz leaves 5ms for net, actually needs < 3ms (IO time). GPU scheduling latency can spike.

### 10.5 Fair Comparison Hard

Helix and π0 both claim best; evaluation scenarios differ, no standard for fair comparison.

---

## 11. Related Concepts

- **Same section**: [VLA Models](../01_Foundations/VLA模型.en.md), [π0](Pi0_Physical_Intelligence.en.md), [Octo](Octo_Foundation_Policy.en.md), [RT-2 / OpenVLA](RT2_OpenVLA.en.md), [RDT-1B](RDT_1B.en.md)
- **Humanoid robots**: [1X World Model](https://jeffliulab.com/ai-notes/08_World_Models/06_Applications/1X_World_Model), [Humanoid form factor](../../08_Humanoids/index.en.md)
- **Behavior hierarchies**: [Advanced RL](https://jeffliulab.github.io/ai-notes/04_Reinforcement_Learning/05_Advanced_RL/)

---

## References

1. **Figure AI** — "Helix: A Vision-Language-Action Model for Generalist Humanoid Control." February 2025.
2. **Adcock, B.** — Brett Adcock Helix announcement video, 2025.
3. **Brohan, A. et al.** "RT-2." *CoRL*, 2023.
4. **Black, K. et al.** "π0." 2024.
5. **Kahneman, D.** *Thinking, Fast and Slow*. 2011. (dual-system psychology basis)
