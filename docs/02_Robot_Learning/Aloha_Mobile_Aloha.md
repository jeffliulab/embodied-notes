# Aloha & Mobile Aloha — 低成本双臂遥操作平台

> *Stanford 2024 年发布 **Aloha 2 + Mobile Aloha**:用 $32k 自制双臂遥操作平台,采集高质量双臂操作数据,直接训出 ACT (Action Chunking Transformer) policy。Mobile Aloha 加入移动 base + 全身相机,变成 "humanoid lite" 平台。是当前 manipulation 研究界**最热门**的硬件,被 π0、Helix 等 VLA 训练所依赖。*
>
> **难度**:Intermediate
> **前置知识**:[ACT 模型](ACT模型.md)、[VLA 模型](VLA模型.md)、[遥操作](../04_Robot_Learning/遥操作与数据收集.md)
> **后续阅读**:[π0](Pi0_Physical_Intelligence.md)、[UMI](UMI_Universal_Manipulation_Interface.md)

---

## 1. 直觉:为什么 Aloha 改变了 manipulation 研究

2023 前的 manipulation 研究多用 \$30k+ 单臂(Franka / UR5),双臂 setup 要 \$60k+。
Aloha 用市售零件 + 3D 打印,**$32k 双臂**,Mobile Aloha **$32k**:
- 任何 lab 都能买得起
- 设计开源,代码 + STL 全在 GitHub
- ALOHA tea — 折毛巾、煎蛋等做完了的 demo 在 Twitter 上爆火

→ **manipulation 民主化** 关键工具。

<!-- SVG-DESIGN-NOTES
Type: D (量化关系 / 规模)
Q0: Aloha 把双臂研究平台成本从 $60k+ 拉到 $32k——这是 manipulation 民主化的关键命题
Q1: 横向条形 + 线性 $ 轴；Aloha 用 accent 高亮，其余平台 soft 中性色；价格直接标在条形末端
Q2: 去掉标题：看到一个 $32k 的强调条形 vs 一组 $45k-$60k+ 的灰条形——能识别这是 manipulation 平台的成本谱
Q3: 删去所有 box 框；删去 legend（用色彩直接编码）；删去多余的网格线（只保留 X 轴刻度）
Q4: 平台名贴左、价格贴右；条形末端的价格 label 是图的核心 take-away
Q5: 全用 var(--dia-*)；平台名英文，中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 720 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bimanual platform cost comparison">
  <text x="360" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">双臂 manipulation 研究平台成本谱</text>
  <text x="360" y="48" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Aloha 是首个把双臂研究装备拉到 $32k 的 DIY 设计</text>

  <!-- X axis -->
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

  <!-- $30k threshold reference line (single-arm research baseline) -->
  <line x1="391" y1="72" x2="391" y2="270" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <text x="391" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">单臂研究门槛</text>

  <!-- Bars: y, name (left), bar width, price label -->
  <!-- Franka dual ~$60k+ -->
  <text x="155" y="92" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">Franka × 2 dual</text>
  <rect x="160" y="80" width="462" height="20" fill="var(--dia-stroke-soft)" opacity="0.55"/>
  <text x="630" y="95" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$60k+</text>

  <!-- UR5 dual ~$45k -->
  <text x="155" y="124" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">UR5 × 2 dual</text>
  <rect x="160" y="112" width="349" height="20" fill="var(--dia-stroke-soft)" opacity="0.55"/>
  <text x="517" y="127" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$45k</text>

  <!-- Mobile Aloha ~$42k -->
  <text x="155" y="156" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">Mobile Aloha</text>
  <rect x="160" y="144" width="326" height="20" fill="var(--dia-accent)" opacity="0.55"/>
  <text x="494" y="159" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">$42k = $32k + $10k base</text>

  <!-- Aloha 2 ~$32k (the headline) -->
  <text x="155" y="188" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">Aloha 2 ←</text>
  <rect x="160" y="176" width="246" height="20" fill="var(--dia-accent)"/>
  <text x="414" y="191" text-anchor="start" font-family="JetBrains Mono, monospace" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">$32k DIY</text>

  <!-- Franka single ~$30k -->
  <text x="155" y="220" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">Franka single</text>
  <rect x="160" y="208" width="231" height="20" fill="var(--dia-stroke-soft)" opacity="0.35"/>
  <text x="399" y="223" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$30k</text>

  <!-- UR5 single ~$22k -->
  <text x="155" y="252" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">UR5 single</text>
  <rect x="160" y="240" width="169" height="20" fill="var(--dia-stroke-soft)" opacity="0.35"/>
  <text x="337" y="255" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">~$22k</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 同价位下 Aloha 2 唯一提供双臂能力；Mobile Aloha 加 $10k base 仍低于 Franka 单臂。</p>

---

## 2. Aloha 硬件

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构)
Q0: Aloha 的设计 DNA 是「便宜 leader 实时镜像驱动昂贵 follower」——人手抓 WidowX，ViperX 复制其 joint pose；4 cam 围绕 follower 观测
Q1: 左右两区（human / robot），中间 mirror 通道；leader/follower 画成 2-3 段关节臂（不是方框）；node 大小有差——follower 更粗描边、更大 gripper，反映其更高扭矩/价格
Q2: 去掉标题：看到「左侧人手轮廓 + 2 个细 accent 臂 → 中间双向镜像 → 右侧 2 个粗 green 臂 + 4 cam 菱形」——这种「人 / 机镜像 + 围观 cam」拓扑是 Aloha 独有
Q3: 删去原有的 3 个等高方框；删去 "WidowX 250 / ~$3k each / human操作端" 这种装在 box 里的文字表格——价格信息已迁移到 Figure 1 量化图
Q4: 规格标签 (WidowX 250 / ViperX 300 / Logitech C922) 直接贴在它们对应的臂/cam 下方；cam 标签 (wrist L/R, cam 1/2) 贴在 cam 旁
Q5: 全用 var(--dia-*)；中文标签 "人手 teleoperator/机器人 workspace" 中英版分别处理（_zh 中文，_en 英文）
-->
<div class="diagram">
<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aloha leader-follower mirror architecture">
  <defs>
    <marker id="ala-mir" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Leader → Follower 镜像架构</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">人手抓便宜 leader · 昂贵 follower 实时镜像 joint state · 4 cam 围绕观测</text>

  <line x1="380" y1="70" x2="380" y2="335" stroke="var(--dia-rule)" stroke-width="1" stroke-dasharray="3 4"/>
  <text x="195" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Human teleoperator</text>
  <text x="580" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Robot workspace</text>

  <!-- Human upper-body silhouette: head + shoulders -->
  <circle cx="195" cy="105" r="13" fill="none" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <path d="M 162 128 Q 195 140 228 128 L 235 175 L 155 175 Z" fill="none" stroke="var(--dia-stroke)" stroke-width="1.4"/>

  <!-- Leader L (small 2-segment arm, accent thin) -->
  <g stroke="var(--dia-accent)" stroke-width="1.8" fill="none">
    <line x1="160" y1="170" x2="125" y2="208"/>
    <circle cx="125" cy="208" r="2.6" fill="var(--dia-accent)"/>
    <line x1="125" y1="208" x2="108" y2="240"/>
    <rect x="100" y="240" width="16" height="7" fill="var(--dia-bg-card)"/>
  </g>
  <text x="108" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">leader L</text>

  <!-- Leader R -->
  <g stroke="var(--dia-accent)" stroke-width="1.8" fill="none">
    <line x1="230" y1="170" x2="265" y2="208"/>
    <circle cx="265" cy="208" r="2.6" fill="var(--dia-accent)"/>
    <line x1="265" y1="208" x2="282" y2="240"/>
    <rect x="274" y="240" width="16" height="7" fill="var(--dia-bg-card)"/>
  </g>
  <text x="282" y="262" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">leader R</text>

  <text x="195" y="290" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">WidowX 250 · 6-DOF passive</text>
  <text x="195" y="308" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">人手抓住 → 关节 encoder 回放</text>

  <!-- Follower L (3-segment, thicker green) -->
  <g stroke="var(--dia-green)" stroke-width="2.8" fill="none">
    <line x1="475" y1="105" x2="475" y2="160"/>
    <circle cx="475" cy="160" r="4.5" fill="var(--dia-green)"/>
    <line x1="475" y1="160" x2="455" y2="208"/>
    <circle cx="455" cy="208" r="3.6" fill="var(--dia-green)"/>
    <line x1="455" y1="208" x2="438" y2="248"/>
    <rect x="428" y="248" width="20" height="11" fill="var(--dia-bg-card)" stroke="var(--dia-green)"/>
  </g>
  <text x="440" y="278" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">follower L</text>

  <!-- Follower R -->
  <g stroke="var(--dia-green)" stroke-width="2.8" fill="none">
    <line x1="685" y1="105" x2="685" y2="160"/>
    <circle cx="685" cy="160" r="4.5" fill="var(--dia-green)"/>
    <line x1="685" y1="160" x2="705" y2="208"/>
    <circle cx="705" cy="208" r="3.6" fill="var(--dia-green)"/>
    <line x1="705" y1="208" x2="722" y2="248"/>
    <rect x="712" y="248" width="20" height="11" fill="var(--dia-bg-card)" stroke="var(--dia-green)"/>
  </g>
  <text x="720" y="278" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">follower R</text>

  <!-- 2 third-person cams + 2 wrist cams: small blue diamonds -->
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

  <!-- Mirror arrows between sides (2 curves) -->
  <path d="M 292 230 C 332 218 360 175 410 165" stroke="var(--dia-stroke-soft)" stroke-width="1.5" fill="none" marker-end="url(#ala-mir)"/>
  <path d="M 292 245 C 340 250 360 250 410 245" stroke="var(--dia-stroke-soft)" stroke-width="1.5" fill="none" marker-end="url(#ala-mir)"/>
  <text x="350" y="195" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">joint state · 50 Hz</text>
  <text x="350" y="210" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">~0 latency</text>

  <!-- Mobile Aloha extension (dashed base + body cam) -->
  <rect x="510" y="328" width="140" height="14" rx="3" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="580" y="352" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Mobile Aloha: + 4-wheel base + body cam ($10k)</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — Aloha 2:cheap leader (accent) 通过 50 Hz joint state mirroring 驱动昂贵 follower (green) · 4 cam 围绕观测 · Mobile 升级以虚线延伸。</p>

### 2.1 操作原理

- 人手握 **leader arm**,leader 实时回放 joint positions
- **follower arm** 镜像 leader,跟随 motion
- 0 latency, intuitive
- 一个人操控双臂(每个手控一边)

### 2.2 Mobile Aloha 升级

- 加 base wheel platform ($10k)
- 加全身 (人形 head + torso camera)
- 用户可"开车"在房间里走动并操作

---

## 3. ALOHA 数据集

每个研究 lab 自家收集:
- Stanford ALOHA Lab: 数千 demo
- Berkeley: 几千 demo
- Google ALOHA: 万级 demo (RT-2 训练用)

数据格式标准化,在 OXE 中以 "stanford_kuka_multimodal_dataset" 等出现。

---

## 4. ACT — 配套 Algorithm

Aloha 团队同时发布 **ACT (Action Chunking with Transformers)**:
- 输入: 4 cam + joint state + language
- 输出: 100 step 动作 chunk (双臂 14-DOF × 100)
- 训练 loss: L2 + KL (VAE 隐变量)

关键 idea: **predict 100 step at once 减少 distribution shift**。

### 4.1 ACT 公式

$$\mathcal{L}_{ACT} = \mathbb{E}\left[ \| a_{1:100} - \hat{a}_{1:100} \|^2 + \beta \cdot \text{KL}(q(z|x) \| p(z)) \right]$$

CVAE 形式,$z$ 是 style 变量。

---

## 5. ALOHA 标志任务 (Twitter 爆款)

- **包饺子** — 抓饺皮,捏边
- **煎蛋** — 打蛋,翻面
- **整理床铺** — 抚平床单
- **挂衣服** — 衣架晾衣
- **遛狗** (Mobile Aloha) — 跟随小狗散步
- **倒咖啡 + 加奶**

每个任务 50-100 demo,ACT 训出 80%+ 成功率。

---

## 6. PyTorch — ACT 简化版

```python
import torch, torch.nn as nn

class ACTModel(nn.Module):
    def __init__(self, action_dim=14, chunk_size=100):
        super().__init__()
        self.encoder = nn.TransformerEncoder(...)
        self.decoder = nn.TransformerDecoder(...)
        # CVAE
        self.encoder_z = nn.Linear(action_dim * chunk_size, 256)  # z from gt action
        self.z_mu = nn.Linear(256, 32)
        self.z_logvar = nn.Linear(256, 32)
        # Image / state encoder
        self.img_enc = ResNet18()
        self.state_proj = nn.Linear(14, 512)
        # Decode actions
        self.action_head = nn.Linear(512, action_dim)
        self.chunk_size = chunk_size
    
    def forward(self, imgs, state, gt_actions=None):
        # Encode obs
        img_feat = torch.cat([self.img_enc(im) for im in imgs], dim=1)
        state_feat = self.state_proj(state)
        ctx = self.encoder(torch.cat([img_feat, state_feat], dim=1))
        # Sample z (CVAE)
        if gt_actions is not None:
            enc = self.encoder_z(gt_actions.flatten(1))
            mu, logvar = self.z_mu(enc), self.z_logvar(enc)
            z = mu + torch.randn_like(mu) * (0.5 * logvar).exp()
        else:
            z = torch.randn(B, 32)
        # Decode chunk
        actions = self.decoder(z.unsqueeze(1).expand(-1, self.chunk_size, -1), ctx)
        return self.action_head(actions)
```

---

## 7. ALOHA + π0 + Helix 关系

| 模型 | ALOHA 使用 |
|---|---|
| ACT (原始) | 训自家 policy |
| π0 (PI) | ALOHA 数据是核心 component |
| Helix (Figure) | 不直接用 ALOHA,但同类 bimanual 数据 |
| OpenVLA | OXE 中包含 ALOHA |

---

## 8. Mobile Aloha 加进的 Capability

- 移动 base 让 manipulation horizon 长 (打开冰箱 → 拿东西 → 关上)
- 全身 camera 帮长 horizon planning
- 双手 + base 同时 control → 数据 dim 增加 (14 → 18)

---

## 9. 优势 / 劣势

### 9.1 优势

- ✅ **低成本** ($32k vs $60k+)
- ✅ **开源** (硬件 BOM + 代码)
- ✅ **数据质量好** (人 teleoperate 高保真)
- ✅ **任何 lab 都能复制**

### 9.2 劣势

- ❌ Robot 不耐用 (ViperX 比 Franka 弱)
- ❌ 不能负重 (~1 kg max)
- ❌ Mobile Aloha 速度慢 (~30cm/s)
- ❌ 没有 force sensor (无力反馈)

---

## 10. 历史 timeline

- **2023 春** — Stanford Lab 启动 Aloha
- **2023-08** — ALOHA + ACT 论文发布
- **2024 年初** — Mobile Aloha 视频爆红
- **2024-Q3** — Aloha 2 (改进硬件)
- **2025** — 多家创业公司 (LeRobot HF 等) 基于 Aloha 范式

---

## 11. Common Pitfalls

### 11.1 Sync 困难

leader / follower joint mapping 校准是 PITA。每次新硬件需 ~ 半天。

### 11.2 数据 noise

不同 demonstrator 风格差很多,policy 容易学到 "operator" pattern 而非 task。

### 11.3 Camera 校准

4 cam 之间 calibration 影响 multi-view 训练。

### 11.4 Latency 不可忽略

leader-follower 即使近,网络抖动 ~ 10ms 仍影响 fine task。

### 11.5 安全

人遥操作时,操作员手势失误可能撞 follower → 物理碰撞。

---

## 12. Related Concepts

- **同节**:[ACT 模型](ACT模型.md)、[VLA 模型](VLA模型.md)、[DROID](DROID_Dataset.md)、[UMI](UMI_Universal_Manipulation_Interface.md)、[π0](Pi0_Physical_Intelligence.md)
- **数据收集**:[遥操作与数据收集](../04_Robot_Learning/遥操作与数据收集.md)
- **机器人形态**:[双臂机器人](../08_Robot_Forms/humanoid_robot.md)

---

## References

1. **Zhao, T. et al.** "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (ALOHA)." *RSS*, 2023.
2. **Fu, Z. et al.** "Mobile ALOHA: Learning Bimanual Mobile Manipulation with Low-Cost Whole-Body Teleoperation." *arXiv*, 2024.
3. **ALOHA Project Page** — https://tonyzhaozh.github.io/aloha/
4. **Mobile ALOHA Project Page** — https://mobile-aloha.github.io/
5. **Trossen Robotics** — WidowX 250 / ViperX 300 hardware specs.
