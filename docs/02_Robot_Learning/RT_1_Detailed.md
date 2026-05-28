# RT-1 — Google 35M VLA 完整解析

> *Google DeepMind 2022 年 12 月发布 **RT-1**:首个真正可用的 generalist robot policy。**35M 参数 EfficientNet + Transformer**,在 **130k Google 自家 manipulation 数据**上训练,完成 700+ 任务,80%+ 成功率。是 RT-X / RT-2 / π0 路线的开创者,虽小但 punch above weight。*
>
> **难度**:Intermediate
> **前置知识**:[VLA 模型](VLA模型.md)、[Transformer](../../02_Deep_Learning/05_Transformers/transformer_architect.md)、[模仿学习](../04_Robot_Learning/模仿学习.md)
> **后续阅读**:[RT-2 / OpenVLA](RT2_OpenVLA.md)、[π0](Pi0_Physical_Intelligence.md)

---

## 1. RT-1 在 VLA 谱系中的位置

时间线:
- **2022-12 RT-1** — 35M, 离散 action,Google 内部
- **2023-07 RT-2** — 55B, 复用 PaLI-X 内核,知识迁移
- **2024-05 OpenVLA** — 7B, 开源 RT-2
- **2024-11 π0** — 3B, Flow Matching action head
- **2025-02 Helix** — dual system

RT-1 是这条路线的**起点**。

---

## 2. 架构

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构) + 内嵌 token 数视觉化
Q0: RT-1 三大创新通过几何明白：(a) USE language 经 FiLM 侧向调制 EfficientNet 每层;(b) Token Learner 把 81 patch tokens 压到 8 学得 tokens;(c) 7-DOF action 离散成 11 bins
Q1: 81 tokens 画成 9×9 小圆点网格、8 tokens 画成单行 8 大圆点 — 视觉上直接展示 ~10× 压缩；FiLM 用从 USE box 侧入 EfficientNet 顶部的箭头表示「lateral injection」;6 frames history 画成左侧叠加 thumbnails;7×11 action bins 画成右侧 grid
Q2: 去掉标题：「9×9 圆点 → 8 大圆点」的压缩可视化 + 左上侧 FiLM 入射箭头 + 右下 11×7 离散网格 — 这套组合是 RT-1 独有(RT-2 没有 Token Learner;π0/RDT 没有离散 bins;OpenVLA 用连续)
Q3: 删去原来 box 内文字标签 "81 → 8 tokens" — 改为画出 81 和 8 真正的数量；删去 "FiLM mod" 文字 — 改为画 FiLM 箭头
Q4: 81 / 8 / 11 bins / 7-DOF / 35M 等数字直接贴几何对象旁
Q5: 全用 var(--dia-*)；标签英文，中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RT-1 architecture with token compression visualized">
  <defs>
    <marker id="rt1-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">RT-1 — FiLM 侧调制 · Token Learner 81→8 压缩 · 离散 11-bin action</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">EfficientNet-B3 + 8-layer Transformer = 35M 总参数</text>

  <!-- 6 frames history (left, stacked thumbnails) -->
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

  <!-- Language input USE encoder (top) -->
  <rect x="160" y="60" width="140" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="230" y="76" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-gold)">Task language</text>
  <text x="230" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">USE encoder (frozen)</text>

  <!-- FiLM lateral injection arrows: from language box DOWN into EfficientNet sides -->
  <path d="M 230 100 L 230 130" stroke="var(--dia-gold)" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M 230 130 L 178 145" stroke="var(--dia-gold)" stroke-width="1.5" fill="none" marker-end="url(#rt1-arr)"/>
  <path d="M 230 130 L 280 145" stroke="var(--dia-gold)" stroke-width="1.5" fill="none" marker-end="url(#rt1-arr)"/>
  <text x="230" y="122" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-gold)">γ, β (FiLM)</text>

  <!-- EfficientNet-B3 box -->
  <rect x="160" y="140" width="140" height="100" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <rect x="160" y="140" width="4" height="100" fill="var(--dia-accent)"/>
  <text x="230" y="165" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">EfficientNet-B3</text>
  <text x="230" y="185" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">FiLM 调制每个 block</text>
  <text x="230" y="208" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">输出 9 × 9 patch tokens</text>
  <text x="230" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">= 81 tokens / frame</text>

  <!-- frames → EfficientNet -->
  <path d="M 118 138 L 160 165" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#rt1-arr)"/>

  <!-- 81 tokens grid (9x9 small circles) -->
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
  <path d="M 300 190 L 322 190" stroke="var(--dia-stroke-soft)" stroke-width="1.2" marker-end="url(#rt1-arr)"/>

  <!-- Token Learner compression arrow + label -->
  <path d="M 400 188 C 440 188 450 188 478 188" stroke="var(--dia-green)" stroke-width="2" fill="none" marker-end="url(#rt1-arr)"/>
  <text x="440" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">Token Learner</text>
  <text x="440" y="208" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">attn pool 81→8</text>

  <!-- 8 tokens row (big circles, accent->green to show "learned") -->
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

  <!-- Transformer 8 layer (right of token learner) -->
  <rect x="600" y="125" width="100" height="135" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <rect x="600" y="125" width="4" height="135" fill="var(--dia-blue)"/>
  <text x="650" y="145" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">Transformer</text>
  <!-- show 8 horizontal lines representing 8 layers inside -->
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

  <path d="M 590 188 L 600 188" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#rt1-arr)"/>

  <!-- Action head: 7×11 discrete grid -->
  <text x="395" y="293" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="13" fill="var(--dia-stroke)">Discrete action head</text>
  <text x="395" y="310" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">每个 DOF 输出 11-way softmax</text>

  <!-- 7 rows (DOF) × 11 cols (bins) mini-grid -->
  <g>
    <text x="295" y="328" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">7 DOF</text>
    <text x="395" y="350" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">11 bins each</text>
    <g fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.4">
      <rect x="300" y="320" width="9" height="6"/><rect x="310" y="320" width="9" height="6"/><rect x="320" y="320" width="9" height="6"/><rect x="330" y="320" width="9" height="6"/><rect x="340" y="320" width="9" height="6"/><rect x="350" y="320" width="9" height="6"/><rect x="360" y="320" width="9" height="6"/><rect x="370" y="320" width="9" height="6"/><rect x="380" y="320" width="9" height="6"/><rect x="390" y="320" width="9" height="6"/><rect x="400" y="320" width="9" height="6"/>
    </g>
    <!-- Repeat 6 more rows -->
    <g fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.4">
      <rect x="300" y="328" width="9" height="6"/><rect x="310" y="328" width="9" height="6"/><rect x="320" y="328" width="9" height="6"/><rect x="330" y="328" width="9" height="6"/><rect x="340" y="328" width="9" height="6"/><rect x="350" y="328" width="9" height="6"/><rect x="360" y="328" width="9" height="6"/><rect x="370" y="328" width="9" height="6"/><rect x="380" y="328" width="9" height="6"/><rect x="390" y="328" width="9" height="6"/><rect x="400" y="328" width="9" height="6"/>
    </g>
    <!-- Highlight selected bin (one box filled in accent per row to show predicted) -->
    <rect x="340" y="320" width="9" height="6" fill="var(--dia-accent)"/>
    <rect x="370" y="328" width="9" height="6" fill="var(--dia-accent)"/>
  </g>

  <!-- Transformer → action -->
  <path d="M 650 260 C 650 290 480 290 410 320" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#rt1-arr)"/>
  <text x="540" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">argmax per DOF</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — RT-1 三大几何特征同框：USE language 从顶部 FiLM 调制 EfficientNet 各 block (金色虚线)；EfficientNet 输出 9×9=81 patch tokens (accent 点阵) → Token Learner 经 attention pool 压到 8 tokens (green 大点)；8-layer Transformer 处理 6 帧×8=48 tokens 后，每 DOF 输出 11 路 softmax (右下 7×11 grid)。</p>

### 2.1 关键创新

#### FiLM Conditioning

把 language 通过 **Universal Sentence Encoder** 编码,作为 FiLM (Feature-wise Linear Modulation) 系数注入 EfficientNet 的每一层:

$$\text{FiLM}(x, \gamma, \beta) = \gamma \cdot x + \beta$$

让图像特征"被 language 引导"。

#### Token Learner

EfficientNet 输出 81 tokens (9×9 patches),用 attention 压缩到 **8 tokens** 输给 Transformer。

#### 离散 Action

7-DOF action 每维 quantize 成 **256 bins (8 bit)**,模型预测 256 路 softmax。
RT-1 用 11 bins (粗) — 后 RT-2 升到 256。

---

## 3. 训练数据

- **Google 自家 130k demonstrations**
- 13 robots (Everyday Robots 双臂 + arm + base)
- 700+ tasks (pick, place, push, pour, ...)
- 数据收集 **17 个月** (2022 初到秋)

---

## 4. 性能 (RT-1 论文报告)

| 任务类别 | 成功率 |
|---|---|
| Trained tasks (700+) | 97% |
| Unseen objects | 76% |
| Unseen distractors | 83% |
| Unseen background | 59% |
| Unseen room | 47% |

→ 训练任务 ≈ overfit;泛化能力随距离训练分布递减。

---

## 5. RT-1 vs 后续

| 模型 | Params | Action | Visual backbone | Best at |
|---|---|---|---|---|
| **RT-1** | **35M** | **disc 11-bin** | **EfficientNet** | **base** |
| RT-2 | 55B | disc 256-bin | PaLI-X | Semantic |
| OpenVLA | 7B | disc 256-bin | Prismatic-7B | Open |
| π0 | 3B | continuous flow | PaliGemma | Precise |

---

## 6. PyTorch 简化版

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
        # images: (B, 6, 3, H, W); lang_emb: (B, 512)
        B = images.size(0)
        # FiLM-encode each frame
        feats = torch.stack([self.image_encoder(images[:, t], lang_emb) for t in range(6)], dim=1)
        # Compress 81 → 8 tokens per frame
        tokens = self.token_learner(feats)  # (B, 6*8, 512)
        # Transformer
        out = self.transformer(tokens)
        # Last token → action
        action_logits = self.action_head(out[:, -1]).view(B, self.action_dim, self.n_bins)
        return action_logits  # (B, 7, 256)
    
    def sample(self, images, lang_emb):
        logits = self.forward(images, lang_emb)
        bins = logits.argmax(-1)  # (B, 7)
        return bins_to_continuous(bins)
```

---

## 7. RT-1 的影响

1. **证明 generalist robot policy 可行** (任何任务一个 weight)
2. **打开 VLA 路线** (大模型 + robot action)
3. **standardize action discretization** trick
4. **promote 大数据 robot training** 范式

---

## 8. 不足

- 35M 容量小,语义浅(unseen object 仅 76%)
- 8 token / image,空间信息丢失
- 离散 action 精度差(11 bin 每维)
- 不开源 weights

→ RT-2 解决前 3,OpenVLA 解决第 4。

---

## 9. 历史 timeline

- **2021-2022** — Everyday Robots 数据采集
- **2022-12** — RT-1 论文 + demos 发布
- **2023-07** — RT-2 升级 (55B PaLI-X)
- **2023-10** — RT-X (在 OXE 上扩展)
- **2024** — OpenVLA / Octo 开源复现

---

## 10. Common Pitfalls

### 10.1 离散 action 训练慢

256-way softmax 难训,需要 cross-entropy with label smoothing。

### 10.2 FiLM 不一定是 best

后续工作发现 cross-attention 比 FiLM 更通用。

### 10.3 Token Learner 有信息损失

81 → 8 token 损失细节;后续模型用更多 token。

### 10.4 数据 lab-specific

Google Everyday Robots 数据私有,泛化到其他机器人未验证。

### 10.5 推理 latency

35M 不算大,但 6 frame history 处理 ~ 50ms,实时 marginal。

---

## 11. Related Concepts

- **同节**:[VLA 模型](VLA模型.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)、[π0](Pi0_Physical_Intelligence.md)、[Octo](Octo_Foundation_Policy.md)、[Helix](Helix_Figure_AI.md)
- **基础**:[Transformer](../../02_Deep_Learning/05_Transformers/transformer_architect.md)、[模仿学习](../04_Robot_Learning/模仿学习.md)
- **数据**:[Open X-Embodiment](数据集与Benchmark.md)

---

## References

1. **Brohan, A. et al.** "RT-1: Robotics Transformer for Real-World Control at Scale." *RSS*, 2023.
2. **Ryoo, M. et al.** "TokenLearner: Adaptive Space-Time Tokenization for Videos." *NeurIPS*, 2021.
3. **Perez, E. et al.** "FiLM: Visual Reasoning with a General Conditioning Layer." *AAAI*, 2018.
4. **Brohan, A. et al.** "RT-2." *CoRL*, 2023.
5. **Everyday Robots** — Project documentation, Google X, 2022.
