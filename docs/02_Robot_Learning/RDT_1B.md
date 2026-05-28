# RDT-1B — 清华开源 1B Diffusion Robot Transformer

> *清华 RDT (Robotics Diffusion Transformer) 2024 年发布 **1B 参数版本**:首个开源 1B 级 Diffusion-based 双臂 generalist policy。在 OXE + RoboNet + 自家 ALOHA-style 数据上预训练,zero-shot 转移到新任务。是中国学术界对 RT-2 / π0 的"open" 回应。*
>
> **难度**:Advanced
> **前置知识**:[VLA 模型](VLA模型.md)、[Diffusion Policy](../04_Robot_Learning/扩散策略.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)
> **后续阅读**:[π0](Pi0_Physical_Intelligence.md)、[Helix](Helix_Figure_AI.md)

---

## 1. 项目背景

清华大学 IIIS + 北大 / 上海 AI Lab 合作,2024 年 10 月发布 RDT-1B:
- **第一作者**:Songming Liu et al.
- **特色**:开源 + 1B 参数 + 双臂操作 + 1M+ episodes 预训练
- **目标**:做"开源 generalist policy",对标 RT-2 但不需 50B 算力

---

## 2. RDT 架构

<!-- SVG-DESIGN-NOTES
Type: C (过程演化 / small multiples)
Q0: RDT 的工作原理是迭代去噪——从纯高斯噪声出发，DiT (1B) 经 5-10 步推理 (DDIM) 把动作向量逐步收敛到清晰轨迹
Q1: 5 个 panel small multiples，每个 panel 内画一个 64-step action waveform (折线 + 散点)；t=T 噪声大、振幅随机；t=0 平滑收敛；上方覆盖噪声调度曲线 σ_t；面板间用「Denoising step」箭头连接
Q2: 去掉标题：「5 个连续 panel 从噪声→平滑」+「σ_t 衰减曲线」+「64 步动作轨迹」——这种 small-multiples 是 diffusion 模型的视觉标识，没有第二个 VLA 这样画
Q3: 删去原来 "1B params / 28 layer / RMSNorm + RoPE" 这些堆 box 里的事实——保留 DiT 信息作为最右一个 panel 之后的小 caption；input 框也删除（条件输入只在 caption 提）
Q4: σ_T / σ_T/2 / σ_T/4 / σ_0 直接标在每个 panel 下方；64-step 标在 x 轴
Q5: 全用 var(--dia-*)；标签英文，中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 800 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RDT-1B diffusion denoising as small multiples">
  <defs>
    <marker id="rdt-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">RDT-1B — DiT 去噪轨迹 (5 步 DDIM, T → 0)</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">每个 panel = 64-step × 128-d 双臂动作 chunk；只画第 0 维以便人眼读</text>

  <!-- σ_t schedule overlay (top curve) -->
  <text x="22" y="75" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-accent-deep)">噪声水平 σ_t</text>
  <path d="M 70 80 C 200 82 350 100 530 145 S 700 180 760 188" stroke="var(--dia-accent)" stroke-width="1.6" fill="none" stroke-dasharray="0"/>
  <circle cx="100" cy="82" r="3" fill="var(--dia-accent)"/>
  <circle cx="240" cy="92" r="3" fill="var(--dia-accent)"/>
  <circle cx="380" cy="115" r="3" fill="var(--dia-accent)"/>
  <circle cx="520" cy="145" r="3" fill="var(--dia-accent)"/>
  <circle cx="680" cy="180" r="3" fill="var(--dia-accent)"/>

  <!-- 5 denoising panels: each 120 wide, 140 tall, y=110-250 -->
  <!-- Panel 1: t=T (pure noise) at x=40-160 -->
  <rect x="40" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="100" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = T</text>
  <text x="100" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 1.0</text>
  <!-- noisy points: scatter random -->
  <g fill="var(--dia-accent)" opacity="0.7">
    <circle cx="48" cy="180" r="1.5"/><circle cx="54" cy="142" r="1.5"/><circle cx="60" cy="208" r="1.5"/><circle cx="66" cy="158" r="1.5"/><circle cx="72" cy="221" r="1.5"/><circle cx="78" cy="130" r="1.5"/><circle cx="84" cy="195" r="1.5"/><circle cx="90" cy="155" r="1.5"/><circle cx="96" cy="225" r="1.5"/><circle cx="102" cy="140" r="1.5"/><circle cx="108" cy="180" r="1.5"/><circle cx="114" cy="215" r="1.5"/><circle cx="120" cy="148" r="1.5"/><circle cx="126" cy="205" r="1.5"/><circle cx="132" cy="125" r="1.5"/><circle cx="138" cy="190" r="1.5"/><circle cx="144" cy="232" r="1.5"/><circle cx="150" cy="165" r="1.5"/><circle cx="156" cy="148" r="1.5"/>
  </g>

  <!-- arrow -->
  <path d="M 165 180 L 178 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr)"/>

  <!-- Panel 2: t=3T/4 -->
  <rect x="180" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="240" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = 3T/4</text>
  <text x="240" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 0.7</text>
  <polyline points="188,175 196,160 204,200 212,170 220,195 228,158 236,210 244,175 252,180 260,160 268,200 276,170 284,195 292,165" stroke="var(--dia-accent)" stroke-width="1.2" fill="none" opacity="0.85"/>
  <g fill="var(--dia-accent)" opacity="0.5">
    <circle cx="200" cy="190" r="1.2"/><circle cx="220" cy="160" r="1.2"/><circle cx="240" cy="210" r="1.2"/><circle cx="260" cy="155" r="1.2"/><circle cx="280" cy="200" r="1.2"/>
  </g>

  <path d="M 305 180 L 318 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr)"/>

  <!-- Panel 3: t=T/2 -->
  <rect x="320" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="380" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = T/2</text>
  <text x="380" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 0.45</text>
  <polyline points="328,175 336,165 344,180 352,175 360,190 368,165 376,200 384,180 392,170 400,168 408,200 416,180 424,190 432,170" stroke="var(--dia-accent)" stroke-width="1.4" fill="none"/>

  <path d="M 445 180 L 458 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr)"/>

  <!-- Panel 4: t=T/4 -->
  <rect x="460" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="520" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">t = T/4</text>
  <text x="520" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ ≈ 0.2</text>
  <polyline points="468,178 476,170 484,176 492,180 500,188 508,178 516,192 524,184 532,176 540,170 548,180 556,188 564,180 572,172" stroke="var(--dia-green)" stroke-width="1.6" fill="none"/>

  <path d="M 585 180 L 598 180" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#rdt-arr)"/>

  <!-- Panel 5: t=0 (clean) -->
  <rect x="600" y="110" width="120" height="140" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.8"/>
  <text x="660" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="11" fill="var(--dia-green)">t = 0</text>
  <text x="660" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">σ → 0 · clean action</text>
  <path d="M 608 180 C 624 175 640 168 656 172 C 672 178 688 186 712 190" stroke="var(--dia-green)" stroke-width="2" fill="none"/>

  <!-- Bottom annotation: model spec -->
  <line x1="60" y1="310" x2="740" y2="310" stroke="var(--dia-stroke-soft)" stroke-width="0.8" stroke-dasharray="2 3"/>
  <text x="400" y="328" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">每步前向：DiT (1B 参数 · 28 层 · RMSNorm + RoPE) · 输入 3 RGB + 语言 + proprioception + noisy action · 输出 score → 更新 chunk</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — RDT 的 5 步 DDIM 去噪轨迹: 从 σ=1 的纯噪声 (accent 散点) 逐步收敛到 σ=0 的平滑动作曲线 (green 平滑线)；上方 dashed 弧线是 σ_t 衰减调度。每步前向都过同一个 1B DiT。</p>

### 2.1 关键设计

- **DiT backbone**: 28 层 Transformer (类 Stable Diffusion 3),1B 参数
- **Unified tokens**: 所有模态(图像/语言/状态/动作)都 token 化进同一序列
- **128-d 动作**: 双臂 7-DOF + 双手 6-DOF × 2 + 头转动等 = ~ 128 维(冗余编码,统一各种 body)
- **DDPM 去噪**: 50 步 (训), 5-10 步推理 (DDIM)

### 2.2 物理可解释 action 编码

RDT 提出 "**unified action space**" — 把不同机器人的 action 统一编码到 128-d 向量:
- 前 7-d: 左臂 6-DOF + gripper
- 中 7-d: 右臂
- 后段: 双手 / 头 / base 等
- 对应机器人不用的 dim 设为 0 (mask)

这样训练时不同 body 数据可共享网络。

---

## 3. 训练数据

- **OXE 子集**:1M+ episodes
- **自家 ALOHA-style 数据**:6000+ 双臂任务 demo
- **RoboNet, Bridge V2 等**:补充

总训练:**~10⁴ 小时 robot data**。

---

## 4. 性能

### 4.1 真机评估

清华自家 dual-arm setup:
- Pick-place: 95%
- Pouring: 80%
- Folding clothes: 60%
- Inserting block: 70%

### 4.2 与 baseline 对比

| 模型 | Open | 双臂任务平均成功 | Params |
|---|---|---|---|
| RT-1 | ❌ | 50% | 35M |
| RT-2 | ❌ | 78% | 55B |
| Octo | ✅ | 65% | 90M |
| OpenVLA | ✅ | 70% | 7B |
| **RDT-1B** | **✅** | **75%** | **1B** |

注:不同公司用不同 dataset,数字可比性有限。

---

## 5. 关键技术贡献

### 5.1 Multi-Resolution Encoding

不同模态用不同分辨率 encode:
- 图像:patch 14×14 (~256 token / cam)
- 语言:BPE tokenizer (~50 token)
- 状态:每 joint 1 token (~50 token)
- 动作:每 chunk step 1 token (64 token)

总序列长度 ~700 tokens,在 1B 模型上 forward 100-150ms。

### 5.2 Sin-Cos 时序编码

借鉴 Sora 的 3D RoPE — 把 [batch, time, modality] 都 rotary 编码,让 attention 看清时序。

### 5.3 Pre-train + Fine-tune 两阶段

- **Pre-train**: 1M+ OXE 数据,30 epoch
- **Fine-tune**: 100-500 任务 demo,5-10 epoch

清华开源 pre-trained weights,用户只需 fine-tune。

---

## 6. PyTorch 简化版

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
        # Time embedding
        t_emb = sinusoidal_emb(t).unsqueeze(1)
        # Concat all
        tokens = torch.cat([img_tok, text_tok, state_tok, action_tok, t_emb], dim=1)
        out = self.dit(tokens)
        # Predict noise
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

## 7. 优势 / 劣势

### 7.1 优势

- ✅ **开源 weights + code** (Apache 2.0)
- ✅ **1B 中型**,跑得动
- ✅ **双臂统一支持**(很多 generalist 不行)
- ✅ **128-d unified action space** 适应任意 body
- ✅ **清华工程质量** (vs 学术 prototype)

### 7.2 劣势

- ❌ 数据仍 < π0 (10⁴ hr); 性能略低
- ❌ Diffusion 推理 5-10 step,~150ms (慢于 Helix S1)
- ❌ 仅 64 step chunk; long horizon 待提升
- ❌ 多 body 切换需 fine-tune (不是真正 zero-shot)

---

## 8. 与 OpenVLA / Octo 关系

清华团队明说 "RDT 是 OpenVLA 的物理理解升级版":
- OpenVLA 强在语义(7B VLM)但 action head 弱
- RDT 强在 dynamics(DiT denoise)但语义略弱
- 实际可能 hybrid: OpenVLA 给 semantic latent → RDT 给 action denoise

---

## 9. 历史 timeline

- **2024-05** — 清华 IIIS 开始 RDT 项目
- **2024-10** — RDT-1B 论文 + weights 发布
- **2025-Q1** — 多个国内机器人公司 (银河通用、智元) fine-tune RDT-1B
- **2025-Q2** — RDT-3B 等扩大版可能?

---

## 10. Common Pitfalls

### 10.1 Action space 编码 hack

128-d unified 把不同 body 混在一起,实际 fine-tune 时部分 dim 没数据,容易"漂"。

### 10.2 Diffusion 训练不稳

DDPM loss 在 high-noise step 训得快,low-noise step 慢。RDT 用 importance sampling 缓解,但仍有 issue。

### 10.3 数据量 vs π0

OXE + 6000 自家 vs PI 的 10⁴ hr → 约差 3-5×。性能差异主要在此。

### 10.4 真机 deploy 复杂

公开 weights 但 deploy 到自家机器人仍需 camera calibration / action normalization 等大量工程。

### 10.5 双臂同步

dual-arm 协调 (左手拿杯,右手倒水) 在 RDT-1B 上仍 30-40% 失败率。

---

## 11. Related Concepts

- **同节**:[VLA 模型](VLA模型.md)、[Octo](Octo_Foundation_Policy.md)、[π0](Pi0_Physical_Intelligence.md)、[Helix](Helix_Figure_AI.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)
- **数据**:[Open X-Embodiment](数据集与Benchmark.md)
- **学习方法**:[Diffusion Policy](../04_Robot_Learning/扩散策略.md)、[模仿学习](../04_Robot_Learning/模仿学习.md)

---

## References

1. **Liu, S. et al.** "RDT-1B: A Diffusion Foundation Model for Bimanual Manipulation." *arXiv*, 2024.
2. **Octo Model Team** — "Octo." 2024.
3. **Open X-Embodiment Collaboration** — "Open X-Embodiment." 2023.
4. **Peebles, W. & Xie, S.** "Scalable Diffusion Models with Transformers (DiT)." *ICCV*, 2023.
5. **RDT GitHub** — https://github.com/thu-ml/RoboticsDiffusionTransformer
