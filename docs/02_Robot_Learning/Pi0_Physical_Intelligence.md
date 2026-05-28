# π0 — Physical Intelligence 流匹配 VLA 模型

> *Physical Intelligence (PI) 2024 年 11 月发布 **π0**:3B 参数 VLA + Flow Matching 动作头,在 10⁴ 小时真机数据上训练。比 RT-2 / OpenVLA 在精细操作上提升显著(折毛巾、整理桌面、装袋子),并比 diffusion policy 推理 4× 快。是当前 (2025) 最强 single-model generalist 机器人 policy 之一。*
>
> **难度**:Advanced
> **前置知识**:[VLA 模型](VLA模型.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)、[Diffusion Policy](../04_Robot_Learning/扩散策略.md)、[Flow Matching](../../02_Deep_Learning/06_Generative_Models/Diffusion.md)
> **后续阅读**:[Octo Foundation Policy](Octo_Foundation_Policy.md)、[Helix](Helix_Figure_AI.md)

---

## 1. 公司背景

Physical Intelligence (PI) 是 2024 年成立的旧金山初创,创始团队来自 Google Brain / Stanford Robotics / DeepMind:
- **Karol Hausman** (CEO,RT-2 主要作者)
- **Sergey Levine** (Chief Scientist, Berkeley)
- **Chelsea Finn** (Stanford, RoboNet)
- $400M+ 融资轮 (OpenAI, Khosla, Sequoia)

战略: **single foundation model for all robot tasks**,类似"GPT-3 时刻"对机器人的解读。

---

## 2. π0 关键技术

### 2.1 架构总览

<!-- SVG-DESIGN-NOTES
Type: C (过程演化) + 速度对比
Q0: π0 的关键创新是用 Flow Matching 代替 diffusion——10 步 ODE 直接学一个 vector field 把 noise 映射到 action，比 diffusion 的 50+ 步 DDIM 快 4×；同时仅用一个小 action expert (PaliGemma 3B 大部分 frozen)
Q1: 2D action 空间(XY 平面)对比两种轨迹：上方 π0 的 Flow Matching 10 个箭头近似直线穿越；下方 diffusion 的 50 个 dots 蜿蜒曲线；vector field 用稀疏箭头网格表示「学到的方向场」；侧栏 architecture 用 box 面积反映 PaliGemma 3B 大 vs action expert 小
Q2: 去掉标题：「2D 轨迹对比 + vector field 箭头 + 4× 速度比」是 Flow Matching vs Diffusion 的视觉对照，是 π0 的标志
Q3: 删去 4 个方框架构(Multi-cam / VLM / Flow / Action chunk) — 改为 inset 小框+面积对比
Q4: "10 ODE step" / "50 DDIM step" / "4× faster" 直接标注在轨迹上
Q5: 全用 var(--dia-*)；中文标签部分有，英文版会复制并 translate
-->
<div class="diagram">
<svg viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pi0 Flow Matching trajectory vs diffusion">
  <defs>
    <marker id="pi0-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
    <marker id="pi0-arrow-fm" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="var(--dia-green)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">π0 — Flow Matching 10-step ODE 替代 Diffusion 50-step DDIM</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">2D action 空间下学到的 vector field 直接把噪声推向 clean action,4× 加速</text>

  <!-- Left side: π0 Flow Matching trajectory in 2D action space -->
  <text x="180" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">π0 · Flow Matching (10 ODE)</text>

  <!-- Bounding axes -->
  <rect x="60" y="105" width="240" height="200" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="65" y="120" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">action dim 1</text>
  <text x="296" y="320" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">action dim 2</text>

  <!-- Vector field arrows (sparse grid of small arrows showing learned direction) -->
  <g stroke="var(--dia-green)" stroke-width="0.8" opacity="0.35" fill="none">
    <line x1="80" y1="140" x2="92" y2="135" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="120" y1="150" x2="132" y2="142" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="160" y1="170" x2="172" y2="160" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="200" y1="200" x2="212" y2="188" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="240" y1="230" x2="252" y2="218" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="80" y1="180" x2="92" y2="172" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="120" y1="190" x2="132" y2="180" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="160" y1="210" x2="172" y2="198" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="200" y1="240" x2="212" y2="225" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="80" y1="220" x2="92" y2="210" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="120" y1="240" x2="132" y2="225" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="160" y1="260" x2="172" y2="245" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="80" y1="270" x2="92" y2="255" marker-end="url(#pi0-arrow-fm)"/>
    <line x1="120" y1="285" x2="132" y2="272" marker-end="url(#pi0-arrow-fm)"/>
  </g>

  <!-- Flow Matching trajectory: 10 large arrows from noise to clean (semi-straight) -->
  <g>
    <circle cx="80" cy="280" r="6" fill="var(--dia-accent)" opacity="0.6"/>
    <text x="62" y="297" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">t=0 (noise)</text>

    <!-- 10 connected segments from (80, 280) → curving to (270, 130) -->
    <path d="M 80 280 L 100 263 L 122 247 L 144 230 L 168 213 L 192 196 L 215 179 L 236 162 L 254 145 L 270 130"
          stroke="var(--dia-green)" stroke-width="2.5" fill="none"/>
    <!-- 10 dots along path -->
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

  <!-- Right side: Diffusion comparison -->
  <text x="540" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Diffusion · DDIM (50 step)</text>

  <rect x="420" y="105" width="240" height="200" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>

  <!-- Diffusion: wavy path with many small dots representing 50 steps -->
  <g>
    <circle cx="440" cy="280" r="6" fill="var(--dia-accent)" opacity="0.6"/>
    <text x="422" y="297" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">noise</text>

    <!-- Wavy path -->
    <path d="M 440 280 Q 450 270 460 275 Q 470 265 475 273 Q 480 268 485 272 Q 490 270 495 274 Q 500 268 510 272 Q 515 265 520 268 Q 525 263 530 266 Q 535 260 542 262 Q 548 256 555 258 Q 560 252 568 252 Q 575 245 580 247 Q 588 240 592 240 Q 600 232 605 232 Q 612 224 618 222 Q 624 216 628 214 Q 632 207 632 200"
          stroke="var(--dia-accent)" stroke-width="1.5" fill="none" opacity="0.85"/>

    <!-- ~50 small dots along path -->
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

  <!-- 4× faster callout -->
  <line x1="305" y1="200" x2="415" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <text x="360" y="195" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">4× faster</text>

  <!-- Bottom: architecture inset -->
  <line x1="60" y1="345" x2="740" y2="345" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 3"/>
  <text x="60" y="362" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">PaliGemma 3B (frozen 大部分)</text>
  <text x="60" y="375" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">+ Action Expert (~M 级 trainable)</text>
  <text x="740" y="362" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Action chunk: 50 step × dim_action</text>
  <text x="740" y="375" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">arm + gripper + base velocity</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — Flow Matching (左, green) 学一个 vector field (淡色背景箭头),10 个 ODE 步沿场线近直线推进；Diffusion (右, accent) 50 步沿曲折噪声轨迹收敛——同等精度下 π0 快 4×。底部 inset 标 PaliGemma 3B + action expert + 50-step chunk。</p>

### 2.2 关键创新

#### 1. Flow Matching 替代 Diffusion

Diffusion Policy (Chi 2023) 需 50-100 step denoise。π0 用 Flow Matching (Lipman 2023) — 学一个 vector field 直接从 noise 流到 action:

$$\frac{d x_t}{dt} = v_\theta(x_t, t, \text{context})$$

10 步 ODE 求解,**4× 快于 diffusion**。

#### 2. 在 VLM 上 fine-tune

VLM 已经"理解"图像和语言;π0 把它 freeze 大部分,**加一个 action expert (额外的 transformer block) 训 flow matching**。比从头训省 100×。

#### 3. Action chunking

每次预测 50 步动作(2-3 秒),减少 high-frequency 决策;低层用 PID 跟踪每个 chunk。

#### 4. 多 embodiment

训练数据来自 7+ 个不同机器人(Aloha 双臂,DROID UR5,Mobile Manipulator,等等)。π0 用 robot ID + observation cam set 区分不同身体。

---

## 3. 训练数据

### 3.1 数据规模

- **OXE (Open X-Embodiment)** 子集:~70 个数据集,共 ~10⁴ 小时
- **PI 自家收集**:数千小时 Aloha + Mobile Aloha 数据
- **互联网 video**(用作 VLM 预训练)

总训练:**~10⁴ 小时 robot data + Internet video / image**。

### 3.2 数据分布

- 厨房 30%
- 家居整理 25%
- 衣物 20%
- 桌面操作 15%
- 其他 10%

---

## 4. 性能

### 4.1 标志任务

π0 公开 demo 包括:
- **折毛巾**:对齐边缘,完整 30+ 秒任务
- **整理桌面**:把散乱物品归位
- **装购物袋**:有挑战性(物体形变 + 平衡)
- **倒咖啡**:精细 manipulation
- **使用工具**:抓取剪刀剪纸

每个都是 **end-to-end** 完成。

### 4.2 数字 (与基准比较)

| 模型 | Aloha-fold 成功率 | Mobile manipulation | 通用 |
|---|---|---|---|
| Diffusion Policy | 50% | — | 单任务 |
| RT-2 | 30% | 50% | 中 |
| OpenVLA | 35% | 55% | 中 |
| **π0** | **80%+** | **75%** | **强** |

PI 数据,2024 年 11 月发布。可能与公开 paper 数字略有差异。

---

## 5. Flow Matching 数学

### 5.1 目标

学一个 vector field $v_\theta$,使从 noise $x_0 \sim \mathcal{N}(0, I)$ 沿 ODE 演化能到达 data $x_1$。

### 5.2 训练 loss

OT-CFM (Optimal Transport Conditional Flow Matching, Lipman 2023):

$$\mathcal{L}_{\text{CFM}} = \mathbb{E}_{t, x_0, x_1} \left\| v_\theta(\underbrace{(1-t) x_0 + t x_1}_{x_t}, t) - (x_1 - x_0) \right\|^2$$

即 $v_\theta$ 学的是 **从 $x_0$ 到 $x_1$ 的直线速度**。比 diffusion score matching 更稳。

### 5.3 推理

```python
# Solve ODE from t=0 to t=1
x = noise
for t in linspace(0, 1, num_steps=10):
    x = x + (1/num_steps) * v_theta(x, t, cond)
return x  # final action chunk
```

---

## 6. PyTorch 概念实现

```python
import torch
import torch.nn as nn

class Pi0(nn.Module):
    def __init__(self, action_dim=14, action_chunk=50):
        super().__init__()
        # Frozen VLM backbone
        self.vlm = PaliGemma3B(frozen=True)
        # Action expert
        self.action_proj_in = nn.Linear(action_dim, 512)
        self.action_expert = nn.TransformerDecoder(
            nn.TransformerDecoderLayer(d_model=512, nhead=8, batch_first=True),
            num_layers=6,
        )
        self.action_proj_out = nn.Linear(512, action_dim)
        self.action_chunk = action_chunk
    
    def encode(self, images, lang):
        # images: (B, n_cam, 3, H, W); lang: list[str]
        return self.vlm(images, lang)  # (B, T_token, d_model)
    
    def flow_step(self, noise_actions, t, vlm_ctx):
        """Compute v_theta(x_t, t, ctx)."""
        # noise_actions: (B, action_chunk, action_dim)
        x = self.action_proj_in(noise_actions)
        # Add time embedding
        t_emb = sinusoidal_emb(t)
        x = x + t_emb[None, None, :]
        # Cross-attend to VLM ctx
        out = self.action_expert(x, vlm_ctx)
        return self.action_proj_out(out)  # velocity
    
    def sample_action_chunk(self, images, lang, num_steps=10):
        ctx = self.encode(images, lang)
        B = ctx.size(0)
        x = torch.randn(B, self.action_chunk, action_dim, device=ctx.device)
        for i in range(num_steps):
            t = i / num_steps
            v = self.flow_step(x, t, ctx)
            x = x + (1 / num_steps) * v
        return x  # action chunk

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

## 7. π0 与其他 VLA 对比

| 模型 | Params | Action gen | Train data | 单步推理 | 主要 trick |
|---|---|---|---|---|---|
| RT-2 (Google) | 55B | autoreg discrete | 10³ hr | 200ms | Internet co-train |
| OpenVLA | 7B | autoreg discrete | 970K episodes | 100ms | Open source |
| Octo | 90M | diffusion | OXE | 80ms | Modular |
| **π0** | **3B** | **flow matching** | **10⁴ hr** | **80ms** | **Flow + VLM frozen** |
| Helix (Figure) | unknown | unknown | proprietary | 100ms | dual-system |
| RDT-1B (Tsinghua) | 1B | diffusion | 1M episodes | 150ms | Open source |

---

## 8. 实战经验 / 教训

### 8.1 数据质量 > 数量

PI 强调 "diversity of tasks > volume of single task"。100 个不同任务各 100 demo 比一个任务 10K demo 强得多。

### 8.2 VLM 预训练锁定

Freezing VLM 让 action expert 不毁坏视觉语义。Levine 在采访说"unfreezing VLM 实验失败 5+ 次"。

### 8.3 多 embodiment 互利

Aloha 数据帮助 UR5 任务(共享 manipulation prior),这是 OXE 的 insight。

### 8.4 Sim2Real 仍有用

PI 在 Isaac Lab 做 pre-training,然后 real fine-tune。

---

## 9. 不足

### 9.1 单步 80ms 仍偏慢

对于 high-frequency 任务 (插孔 / dynamic balance) 不够 — 需 <30ms。

### 9.2 长 horizon

π0 强在 30 秒级任务,但 5 分钟以上 long-horizon 仍不稳。

### 9.3 缺 explicit WM

π0 没有 explicit forward model — 不能 plan,只能 imitate。

### 9.4 数据 PIvate

PI 自家数据未开源。其方法可复现但 base data 不可。

---

## 10. 商业模式 / 部署

PI 与 Boston Dynamics、Apptronik、1X 等机器人公司谈合作:把 π0 作为 base model,客户 fine-tune。类似 Anthropic / OpenAI 卖 API 的模式 — "robot foundation model as a service"。

---

## 11. 历史 timeline

- **2023** — Levine, Hausman 等创立 PI
- **2024 年中** — 内部 π0 训练完成
- **2024-11** — 公开发布 demo + paper
- **2025-Q1** — 与多家 robot 公司合作签约
- **2025-Q2** — π0.5 等迭代版?

---

## 12. Common Pitfalls

### 12.1 别误以为 π0 解决一切

PI demo 是 cherry-picked。实际任务依然有 50%+ 失败率(对比 90%+ 的 demo)。

### 12.2 Flow matching ≠ Diffusion

虽然类似,flow matching loss 是 OT-based,采样直线;diffusion 是曲折路径。

### 12.3 VLM 选择重要

PaliGemma > LLaVA > BLIP — 在 robot 任务上有清晰差异。

### 12.4 Action chunking trade-off

Chunk 太长(100+ 步)失去 reactivity;太短(10 步)失去 efficiency。50 是经验值。

### 12.5 Open-source 替代

OpenVLA + Diffusion Policy 自训可达 π0 的 60-70%。

---

## 13. Related Concepts

- **同节**:[VLA 模型](VLA模型.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)、[Octo Foundation Policy](Octo_Foundation_Policy.md)、[RDT-1B](RDT_1B.md)、[Helix](Helix_Figure_AI.md)、[ACT 模型](ACT模型.md)
- **机器人学习**:[Diffusion Policy](../04_Robot_Learning/扩散策略.md)、[imitation learning](../04_Robot_Learning/模仿学习.md)
- **数据集**:[Open X-Embodiment](../05_Models/数据集与Benchmark.md)、[DROID Dataset](DROID_Dataset.md)
- **生成模型**:[Flow Matching / Diffusion](../../02_Deep_Learning/06_Generative_Models/Diffusion.md)

---

## References

1. **Black, K., Hausman, K. et al.** "π0: A Vision-Language-Action Flow Model for General Robot Control." *PI Technical Report*, November 2024.
2. **Lipman, Y. et al.** "Flow Matching for Generative Modeling." *ICLR*, 2023.
3. **Chi, C. et al.** "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion." *RSS*, 2023.
4. **Brohan, A. et al.** "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control." *CoRL*, 2023.
5. **Open X-Embodiment Collaboration** — "Open X-Embodiment: Robotic Learning Datasets and RT-X Models." *arXiv*, 2023.
6. **Tong, A. et al.** "Improving and generalizing flow-based generative models." *arXiv*, 2024.
