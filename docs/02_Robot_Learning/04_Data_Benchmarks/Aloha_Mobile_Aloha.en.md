# Aloha & Mobile Aloha — Low-Cost Bimanual Teleoperation

> *Stanford released **Aloha 2 + Mobile Aloha** in 2024: a $32k DIY bimanual teleoperation platform for collecting high-quality bimanual manipulation data, directly training ACT (Action Chunking Transformer) policy. Mobile Aloha adds a mobile base + whole-body cameras, becoming a "humanoid lite" platform. The hottest hardware in manipulation research today, used by π0, Helix, and other VLA training pipelines.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [ACT Model](../02_Methods/ACT模型.en.md), [VLA Models](../01_Foundations/VLA模型.en.md), [Teleoperation](遥操作与数据收集.en.md)
> **Further reading**: [π0](../03_Models/Pi0_Physical_Intelligence.en.md), [UMI](UMI_Universal_Manipulation_Interface.en.md)

---

## 1. Intuition: Why Aloha Changed Manipulation Research

Pre-2023 manipulation research used \$30k+ single arms (Franka / UR5); bimanual setup needed \$60k+.
Aloha uses off-the-shelf parts + 3D printing, **$32k bimanual**, Mobile Aloha **$32k**:
- Any lab can afford
- Design open source, code + STL on GitHub
- ALOHA tea — towel folding, egg flipping demos went viral on Twitter

→ Key tool for **manipulation democratization**.

<!-- SVG-DESIGN-NOTES
Type: D (quantitative / scale)
Q0: Aloha drops the bimanual research platform cost from $60k+ to $32k — the democratization punchline
Q1: Horizontal bars on a linear $ axis; Aloha highlighted in accent, others in soft neutral; price labeled at each bar's right end
Q2: Strip the title — you see one accent bar at $32k against a cluster of $45k–$60k+ neutrals — clearly a cost-spectrum chart
Q3: Removed all enclosing boxes; removed legend (color encodes directly); minimal axis (only X ticks)
Q4: Platform names hug the left, prices hug the right end of each bar — labels touch their objects
Q5: All var(--dia-*); English-only labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 720 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bimanual platform cost comparison">
  <text x="360" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Bimanual manipulation platform cost spectrum</text>
  <text x="360" y="48" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Aloha is the first DIY design that drops bimanual research kit to $32k</text>

  <line x1="160" y1="270" x2="700" y2="270" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="160" y1="270" x2="160" y2="275" stroke="var(--dia-stroke)"/><text x="160" y="290" text-anchor="middle">$0</text>
    <line x1="237" y1="270" x2="237" y2="275" stroke="var(--dia-stroke)"/><text x="237" y="290" text-anchor="middle">$10k</text>
    <line x1="314" y1="270" x2="314" y2="275" stroke="var(--dia-stroke)"/><text x="314" y="290" text-anchor="middle">$20k</text>
    <line x1="391" y1="270" x2="391" y2="275" stroke="var(--dia-stroke)"/><text x="391" y="290" text-anchor="middle">$30k</text>
    <line x1="468" y1="270" x2="468" y2="275" stroke="var(--dia-stroke)"/><text x="468" y="290" text-anchor="middle">$40k</text>
    <line x1="545" y1="270" x2="545" y2="275" stroke="var(--dia-stroke)"/><text x="545" y="290" text-anchor="middle">$50k</text>
    <line x1="622" y1="270" x2="622" y2="275" stroke="var(--dia-stroke)"/><text x="622" y="290" text-anchor="middle">$60k</text>
    <line x1="699" y1="270" x2="699" y2="275" stroke="var(--dia-stroke)"/><text x="699" y="290" text-anchor="middle">$70k</text>
  </g>

  <line x1="391" y1="72" x2="391" y2="270" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <text x="391" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">single-arm research threshold</text>

  <text x="155" y="92" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">Franka × 2 dual</text>
  <rect x="160" y="80" width="462" height="20" fill="var(--dia-stroke-soft)" opacity="0.55"/>
  <text x="630" y="95" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$60k+</text>

  <text x="155" y="124" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">UR5 × 2 dual</text>
  <rect x="160" y="112" width="349" height="20" fill="var(--dia-stroke-soft)" opacity="0.55"/>
  <text x="517" y="127" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$45k</text>

  <text x="155" y="156" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">Mobile Aloha</text>
  <rect x="160" y="144" width="326" height="20" fill="var(--dia-accent)" opacity="0.55"/>
  <text x="494" y="159" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">$42k = $32k + $10k base</text>

  <text x="155" y="188" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">Aloha 2 ←</text>
  <rect x="160" y="176" width="246" height="20" fill="var(--dia-accent)"/>
  <text x="414" y="191" text-anchor="start" font-family="JetBrains Mono, monospace" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">$32k DIY</text>

  <text x="155" y="220" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">Franka single</text>
  <rect x="160" y="208" width="231" height="20" fill="var(--dia-stroke-soft)" opacity="0.35"/>
  <text x="399" y="223" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$30k</text>

  <text x="155" y="252" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">UR5 single</text>
  <rect x="160" y="240" width="169" height="20" fill="var(--dia-stroke-soft)" opacity="0.35"/>
  <text x="337" y="255" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$22k</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — at the same price point Aloha 2 is the only bimanual option; Mobile Aloha plus $10k base still undercuts a single Franka.</p>

---

## 2. Aloha Hardware

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture)
Q0: Aloha's design DNA is "cheap leader mirrors expensive follower in real time" — human grasps WidowX, ViperX replicates joint poses; 4 cams surround the follower
Q1: Two zones (human / robot) separated by a dashed divider; leader/follower drawn as 2-3-segment articulated arms (not boxes); node thickness differs — follower thicker/larger reflecting its higher torque & price
Q2: Strip the title — you see "human silhouette + 2 thin accent arms → mirroring → 2 thick green arms surrounded by 4 cam diamonds" — this human/robot mirror topology is uniquely Aloha
Q3: Removed the original 3 equal-height boxes; removed the price labels inside boxes (price info migrated to Figure 1's quantitative chart)
Q4: Hardware specs (WidowX 250 / ViperX 300 / Logitech C922) labeled directly under their arms/cams; cam tags (wrist L/R, cam 1/2) placed next to each cam diamond
Q5: All var(--dia-*); labels are English so shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aloha leader-follower mirror architecture">
  <defs>
    <marker id="ala-mir-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Leader → Follower mirror architecture</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Human grasps the cheap leader · expensive follower mirrors joint state in real time · 4 cams observe</text>

  <line x1="380" y1="70" x2="380" y2="335" stroke="var(--dia-rule)" stroke-width="1" stroke-dasharray="3 4"/>
  <text x="195" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Human teleoperator</text>
  <text x="580" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Robot workspace</text>

  <circle cx="195" cy="105" r="13" fill="none" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <path d="M 162 128 Q 195 140 228 128 L 235 175 L 155 175 Z" fill="none" stroke="var(--dia-stroke)" stroke-width="1.4"/>

  <g stroke="var(--dia-accent)" stroke-width="1.8" fill="none">
    <line x1="160" y1="170" x2="125" y2="208"/>
    <circle cx="125" cy="208" r="2.6" fill="var(--dia-accent)"/>
    <line x1="125" y1="208" x2="108" y2="240"/>
    <rect x="100" y="240" width="16" height="7" fill="var(--dia-bg-card)"/>
  </g>
  <text x="108" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">leader L</text>

  <g stroke="var(--dia-accent)" stroke-width="1.8" fill="none">
    <line x1="230" y1="170" x2="265" y2="208"/>
    <circle cx="265" cy="208" r="2.6" fill="var(--dia-accent)"/>
    <line x1="265" y1="208" x2="282" y2="240"/>
    <rect x="274" y="240" width="16" height="7" fill="var(--dia-bg-card)"/>
  </g>
  <text x="282" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">leader R</text>

  <text x="195" y="290" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">WidowX 250 · 6-DOF passive</text>
  <text x="195" y="308" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">human grasp → joint encoders broadcast</text>

  <g stroke="var(--dia-green)" stroke-width="2.8" fill="none">
    <line x1="475" y1="105" x2="475" y2="160"/>
    <circle cx="475" cy="160" r="4.5" fill="var(--dia-green)"/>
    <line x1="475" y1="160" x2="455" y2="208"/>
    <circle cx="455" cy="208" r="3.6" fill="var(--dia-green)"/>
    <line x1="455" y1="208" x2="438" y2="248"/>
    <rect x="428" y="248" width="20" height="11" fill="var(--dia-bg-card)" stroke="var(--dia-green)"/>
  </g>
  <text x="440" y="278" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">follower L</text>

  <g stroke="var(--dia-green)" stroke-width="2.8" fill="none">
    <line x1="685" y1="105" x2="685" y2="160"/>
    <circle cx="685" cy="160" r="4.5" fill="var(--dia-green)"/>
    <line x1="685" y1="160" x2="705" y2="208"/>
    <circle cx="705" cy="208" r="3.6" fill="var(--dia-green)"/>
    <line x1="705" y1="208" x2="722" y2="248"/>
    <rect x="712" y="248" width="20" height="11" fill="var(--dia-bg-card)" stroke="var(--dia-green)"/>
  </g>
  <text x="720" y="278" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">follower R</text>

  <g fill="var(--dia-blue)" stroke="var(--dia-stroke)" stroke-width="0.6">
    <rect x="409" y="88" width="10" height="10" transform="rotate(45, 414, 93)"/>
    <rect x="741" y="88" width="10" height="10" transform="rotate(45, 746, 93)"/>
    <rect x="429" y="238" width="7" height="7" transform="rotate(45, 432.5, 241.5)"/>
    <rect x="724" y="238" width="7" height="7" transform="rotate(45, 727.5, 241.5)"/>
  </g>
  <text x="414" y="82" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">cam 1</text>
  <text x="746" y="82" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">cam 2</text>
  <text x="426" y="246" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">wrist L</text>
  <text x="735" y="246" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">wrist R</text>

  <text x="580" y="298" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">ViperX 300 · 6-DOF active · ×2</text>
  <text x="580" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">+ 4 × Logitech C922 RGB · ~30 Hz</text>

  <path d="M 292 230 C 332 218 360 175 410 165" stroke="var(--dia-stroke-soft)" stroke-width="1.5" fill="none" marker-end="url(#ala-mir-en)"/>
  <path d="M 292 245 C 340 250 360 250 410 245" stroke="var(--dia-stroke-soft)" stroke-width="1.5" fill="none" marker-end="url(#ala-mir-en)"/>
  <text x="350" y="195" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">joint state · 50 Hz</text>
  <text x="350" y="210" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">~0 latency</text>

  <rect x="510" y="328" width="140" height="14" rx="3" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="580" y="352" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Mobile Aloha: + 4-wheel base + body cam ($10k)</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — Aloha 2: cheap leader (accent) drives expensive follower (green) via 50 Hz joint-state mirroring · 4 cams surround the workspace · Mobile upgrade shown dashed below.</p>

### 2.1 Operation Principle

- Human holds **leader arm**, leader broadcasts joint positions in real time
- **Follower arm** mirrors leader, follows motion
- 0 latency, intuitive
- One person controls both arms (one hand each)

### 2.2 Mobile Aloha Upgrade

- Add base wheel platform ($10k)
- Add whole-body (humanoid head + torso camera)
- User can "drive" around room while manipulating

---

## 3. ALOHA Datasets

Each research lab collects own data:
- Stanford ALOHA Lab: thousands of demos
- Berkeley: thousands of demos
- Google ALOHA: tens of thousands (used in RT-2 training)

Standardized data format, appears in OXE as "stanford_kuka_multimodal_dataset" etc.

---

## 4. ACT — Companion Algorithm

The Aloha team also released **ACT (Action Chunking with Transformers)**:
- Input: 4 cams + joint state + language
- Output: 100-step action chunk (bimanual 14-DOF × 100)
- Training loss: L2 + KL (VAE latent)

Key idea: **predict 100 steps at once to reduce distribution shift**.

### 4.1 ACT Formula

$$\mathcal{L}_{ACT} = \mathbb{E}\left[ \| a_{1:100} - \hat{a}_{1:100} \|^2 + \beta \cdot \text{KL}(q(z|x) \| p(z)) \right]$$

CVAE form, $z$ is style variable.

---

## 5. ALOHA Flagship Tasks (Twitter Viral)

- **Dumpling wrapping** — grab wrapper, pinch edges
- **Egg frying** — crack, flip
- **Bed making** — smoothing sheets
- **Hanging clothes** — clothes hanger
- **Dog walking** (Mobile Aloha) — follow puppy
- **Pour coffee + add milk**

Each task 50-100 demos, ACT trains 80%+ success rate.

---

## 6. PyTorch — ACT Simplified

```python
import torch, torch.nn as nn

class ACTModel(nn.Module):
    def __init__(self, action_dim=14, chunk_size=100):
        super().__init__()
        self.encoder = nn.TransformerEncoder(...)
        self.decoder = nn.TransformerDecoder(...)
        # CVAE
        self.encoder_z = nn.Linear(action_dim * chunk_size, 256)
        self.z_mu = nn.Linear(256, 32)
        self.z_logvar = nn.Linear(256, 32)
        # Image / state encoder
        self.img_enc = ResNet18()
        self.state_proj = nn.Linear(14, 512)
        self.action_head = nn.Linear(512, action_dim)
        self.chunk_size = chunk_size
    
    def forward(self, imgs, state, gt_actions=None):
        img_feat = torch.cat([self.img_enc(im) for im in imgs], dim=1)
        state_feat = self.state_proj(state)
        ctx = self.encoder(torch.cat([img_feat, state_feat], dim=1))
        if gt_actions is not None:
            enc = self.encoder_z(gt_actions.flatten(1))
            mu, logvar = self.z_mu(enc), self.z_logvar(enc)
            z = mu + torch.randn_like(mu) * (0.5 * logvar).exp()
        else:
            z = torch.randn(B, 32)
        actions = self.decoder(z.unsqueeze(1).expand(-1, self.chunk_size, -1), ctx)
        return self.action_head(actions)
```

---

## 7. ALOHA + π0 + Helix Relationship

| Model | ALOHA usage |
|---|---|
| ACT (original) | Train own policy |
| π0 (PI) | ALOHA data is core component |
| Helix (Figure) | Doesn't directly use ALOHA, but similar bimanual data |
| OpenVLA | OXE includes ALOHA |

---

## 8. Mobile Aloha Adds

- Mobile base extends manipulation horizon (open fridge → grab → close)
- Whole-body camera helps long-horizon planning
- Both hands + base simultaneous control → data dim grows (14 → 18)

---

## 9. Pros / Cons

### 9.1 Pros

- ✅ **Low cost** ($32k vs $60k+)
- ✅ **Open source** (hardware BOM + code)
- ✅ **Good data quality** (high-fidelity teleop)
- ✅ **Any lab can replicate**

### 9.2 Cons

- ❌ Robots less durable (ViperX weaker than Franka)
- ❌ Can't lift heavy (~1 kg max)
- ❌ Mobile Aloha slow (~30cm/s)
- ❌ No force sensor (no haptic feedback)

---

## 10. History Timeline

- **Spring 2023** — Stanford Lab launches Aloha
- **2023-08** — ALOHA + ACT paper released
- **Early 2024** — Mobile Aloha videos go viral
- **2024-Q3** — Aloha 2 (improved hardware)
- **2025** — Multiple startups (LeRobot HF etc.) based on Aloha paradigm

---

## 11. Common Pitfalls

### 11.1 Sync Hard

Leader / follower joint mapping calibration is a PITA. New hardware needs ~ half day.

### 11.2 Data Noise

Different demonstrators have very different styles, policy easily learns "operator" pattern not task.

### 11.3 Camera Calibration

4-cam calibration affects multi-view training.

### 11.4 Non-trivial Latency

Even close-network leader-follower has ~10ms jitter affecting fine tasks.

### 11.5 Safety

During teleop, operator gesture errors can crash into follower → physical collision.

---

## 12. Related Concepts

- **Same section**: [ACT Model](../02_Methods/ACT模型.en.md), [VLA Models](../01_Foundations/VLA模型.en.md), [DROID](DROID_Dataset.en.md), [UMI](UMI_Universal_Manipulation_Interface.en.md), [π0](../03_Models/Pi0_Physical_Intelligence.en.md)
- **Data collection**: [Teleoperation & Data Collection](遥操作与数据收集.en.md)
- **Robot forms**: [Dual-arm Robots](../../08_Humanoids/humanoid_robot.en.md)

---

## References

1. **Zhao, T. et al.** "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (ALOHA)." *RSS*, 2023.
2. **Fu, Z. et al.** "Mobile ALOHA: Learning Bimanual Mobile Manipulation with Low-Cost Whole-Body Teleoperation." *arXiv*, 2024.
3. **ALOHA Project Page** — https://tonyzhaozh.github.io/aloha/
4. **Mobile ALOHA Project Page** — https://mobile-aloha.github.io/
5. **Trossen Robotics** — WidowX 250 / ViperX 300 hardware specs.
