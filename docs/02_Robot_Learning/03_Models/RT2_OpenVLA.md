# RT-2 与 OpenVLA — Vision-Language-Action 模型

> *RT-2 (Google DeepMind 2023) 是首个工业级 **Vision-Language-Action (VLA)** 模型,把 LLM 直接微调为机器人动作生成器。**OpenVLA** (Stanford 2024) 是开源对标版本,基于 Llama-2 + Prismatic VLM,在 Open X-Embodiment 数据集训练。**通用机器人**的关键路线。*
>
> **难度**：Advanced
> **前置知识**：[VLA 模型综述](../01_Foundations/VLA模型.md)、[多模态大模型](https://jeffliulab.com/ai-notes/04_Foundation_Models/05_Multimodal/MLLMs)、[扩散策略](../02_Methods/扩散策略.md)
> **后续阅读**：[π0 / RDT-1B](../index.md)、[Sim2Real](../02_Methods/Sim2Real.md)

---

## 1. 直觉：把 LLM 当机器人 controller

传统机器人:每个任务训一个专门 policy。**VLA 思想**: 用一个**预训练大模型**(LLM/VLM) 微调为通用 controller,**用自然语言+图像作指令**输出动作。

```
input:  图像 + 自然语言 ("Pick up the red mug")
↓ VLM (Vision-Language Model 预训练)
output: 7-DOF 动作 [Δx, Δy, Δz, Δr, Δp, Δy, gripper]
```

**优势**:
- **少样本学习** — 利用 LLM/VLM 的常识知识
- **指令泛化** — 自然语言指令理论上无穷多
- **多任务统一** — 一个模型,N 个 skill

---

## 2. RT-2 (Google DeepMind 2023)

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 共享 token 流) + 旁附 D 量化对比
Q0: RT-2 / OpenVLA 的核心发明是「action-as-text-token」——把 7-DOF 连续动作量化到 256 bin，每个 bin 映射到 LLM 词表里的一个保留 token，于是动作和文本共用同一个自回归生成流
Q1: 上半部分展示「连续 → 量化 → token ID」三阶映射：(a) 连续 action 用 7 个小波形条；(b) 256-bin 离散刻度尺；(c) 嵌入 LLM 词表的 7 个橙色 token (与英文 token 并排)；下半部分 RT-2 55B vs OpenVLA 7B 用框面积反映 ~8× 参数差
Q2: 去掉标题：「连续波 → 256 刻度 → 词表中橙色 token」上半 + 「大小对比的两个开/闭源标签框」下半 — 这种「action 进入 token 流」可视化是 RT-2 / OpenVLA 唯一
Q3: 删去两个等高 spec box；删去标签性短语 "co-train VQA + 机器人数据" 等 — 改用图示表达
Q4: 256-bin / 7-DOF / 55B / 7B 都贴对应几何元素
Q5: 全用 var(--dia-*)；中英标签共用
-->
<div class="diagram">
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RT-2 / OpenVLA action-as-text-token + scale comparison">
  <defs>
    <marker id="rt2-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">RT-2 / OpenVLA — Action 即 LLM 词表里的 token</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">7-DOF 连续动作 → 256-bin 量化 → 7 个保留 token → 与 text token 共用自回归流</text>

  <!-- Stage A: continuous action waveforms (7-DOF) -->
  <text x="100" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">连续 action</text>
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

  <!-- Arrow to quantize -->
  <path d="M 175 145 L 215 145" stroke="var(--dia-stroke-soft)" stroke-width="1.5" marker-end="url(#rt2-arr)"/>
  <text x="195" y="138" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">quantize</text>

  <!-- Stage B: 256-bin scale -->
  <text x="320" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">256-bin 离散</text>
  <text x="320" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">每 DOF 一个 bin index</text>

  <!-- 256-bin scale: long horizontal axis with many ticks -->
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

  <!-- Selected bins for 7 DOFs (highlighted dots) -->
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

  <!-- Arrow to LLM vocabulary -->
  <path d="M 430 145 L 470 145" stroke="var(--dia-stroke-soft)" stroke-width="1.5" marker-end="url(#rt2-arr)"/>
  <text x="450" y="138" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">map</text>

  <!-- Stage C: LLM token stream with action tokens inline (orange-highlighted among text tokens) -->
  <text x="620" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">LLM 词表里的 token 流</text>
  <text x="620" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">action 与 text 共用 autoregressive 生成</text>

  <!-- Token chips: a mix of text (grey) and action (orange) -->
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
  <text x="620" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">7 个保留 action token (橙) 跟 text token 并列</text>

  <!-- Divider -->
  <line x1="40" y1="200" x2="760" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="0.8" stroke-dasharray="3 3"/>

  <!-- Bottom: RT-2 vs OpenVLA size comparison -->
  <text x="400" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-stroke)">两个实现的规模差异 (面积 ∝ 参数量)</text>

  <!-- RT-2: BIG box (55B / 5B variants), closed -->
  <rect x="80" y="240" width="280" height="100" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="80" y="240" width="6" height="100" fill="var(--dia-accent)"/>
  <text x="220" y="260" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">RT-2 (Google) · CLOSED</text>
  <text x="220" y="285" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="20" fill="var(--dia-accent-deep)">55B</text>
  <text x="220" y="305" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">PaLI-X / PaLM-E · 5B-55B</text>
  <text x="220" y="322" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">co-train VQA + RT-1 数据</text>

  <!-- OpenVLA: smaller box (7B), open -->
  <rect x="440" y="270" width="180" height="70" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="2"/>
  <rect x="440" y="270" width="4" height="70" fill="var(--dia-green)"/>
  <text x="530" y="288" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">OpenVLA (Stanford) · OPEN</text>
  <text x="530" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="16" fill="var(--dia-green)">7B</text>
  <text x="530" y="328" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">Llama-2 + DINOv2 · OXE 970k</text>

  <!-- Ratio annotation -->
  <text x="700" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">~8×</text>
  <text x="700" y="302" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">param</text>
  <text x="700" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">but OpenVLA ≈ RT-2-X</text>
  <text x="700" y="330" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">on 27-task avg</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 上半部展示 action-as-text-token 三阶映射：7-DOF 连续波 → 256-bin 量化 (accent dot scale) → 嵌入 LLM 词表的橙色保留 token,与 text token 共用自回归。下半部按 box 面积比反映 RT-2 (55B 闭源) vs OpenVLA (7B 开源) ~8× 参数差。</p>

### 2.1 关键创新 — Action as Text Token

RT-2 把 7-DOF 连续动作**离散化为 256 bins**,每个 bin 用一个**特殊 token** 表示:

```
Action [Δx=0.2, Δy=-0.1, ..., gripper=1] → 字符串 "<bin_45><bin_98>...<bin_255>"
```

→ 同 LLM 词汇表共享 → 不需要专门 head → 利用 LLM 全部能力。

### 2.2 Co-Fine-Tuning

不只微调机器人数据,**同时继续训 VQA / 图文配对** → 防止 catastrophic forgetting,保持 LLM 通用能力。

### 2.3 效果

- **看见 paper bag(从未训练) 也能用** — 仅靠 VLM 常识
- **Chain-of-Thought 推理** — "pick up the extinct animal" → 选 dinosaur 玩具
- **多语言指令** — 中英日法均工作

---

## 3. OpenVLA — 开源对标 (2024)

**Kim et al. (Stanford) 2024** 关键贡献:
1. **完全开源** — 模型 + 权重 + 训练代码 + 数据
2. **数据**: Open X-Embodiment dataset (970k+ trajectories from 22 机器人)
3. **基座**: Prismatic VLM (Llama-2 7B + DINOv2 + SigLIP vision encoder)
4. **训练**: 8× A100 训 14 天
5. **效果**: 27 task 平均比 RT-2-X (55B) 略好

**意义**: 让小团队首次能复现 VLA 路线。

---

## 4. VLA 推理 Pipeline

```python
# 概念实现 (基于 OpenVLA)
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

**实时性挑战**: 7B 模型推理 ~5 Hz,需要 quantization 或较小模型才能 30 Hz 控制频率。

---

## 5. 历史与现代地位

- **2022** — RT-1 (Google) — 35M 参数,Transformer-based,~130K episodes
- **2023 年 7 月** — RT-2 (Google) — 加 PaLM-E,emergent reasoning
- **2023** — Open X-Embodiment dataset (22 实验室,1M demo)
- **2024 年 4 月** — Octo (Berkeley) — 90M 开源 VLA
- **2024 年 6 月** — OpenVLA (Stanford) — 7B 开源
- **2024 年 11 月** — π0 (Physical Intelligence) — 3B 开源,流模型
- **2024-2025** — Helix (Figure AI), Helix-2,商业部署

**为什么改变了机器人**:
- 首个真正"通用"机器人模型路线
- LLM 常识 → 机器人零样本理解新场景
- 训练数据可累积（Open X-Embodiment 持续增长）
- **缩放律**: 大模型 + 大数据 → 越来越好

---

## 6. Common Pitfalls

### 6.1 实时性

7B+ 模型 ≥ 100 ms/step → < 10 Hz,慢于传统 BC (30+ Hz)。**对策**: action chunking (一次预测 H 步),quantization,小模型分支。

### 6.2 Action Discretization 精度

256 bins 对粗动作够;精细操作（穿针）需 1024+ bins 或回归头。

### 6.3 数据要求

VLA 需要 100k+ trajectory + caption 才有泛化。**小数据集不适用** — 用 Diffusion Policy 替代。

### 6.4 Sim2Real 仍是问题

VLA 在 OpenX 训练（多为真机数据）→ 不像 SDXL 那样泛化全空间。**新 setup / 新机器人需要 fine-tune**。

### 6.5 长 horizon 失败

VLA 是单步 policy,长程任务需要外部规划（"先打开冰箱再取牛奶" 需 task planner 拆解）。

---

## 7. VLA 现代变体

| 模型 | 团队 | 基座 | 关键特性 |
|---|---|---|---|
| **RT-1** | Google 2022 | Transformer | 35M, 第一代 |
| **RT-2** | Google 2023 | PaLM-E 5B/55B | LLM 直接微调 |
| **Octo** | Berkeley 2024 | Transformer | 90M, 开源,模块化 |
| **OpenVLA** | Stanford 2024 | Llama-2 7B | 全开源 |
| **π0** | Physical Intelligence 2024 | PaliGemma + Flow Matching | 3B, 流模型解码,权重已开源(openpi) |
| **Helix** | Figure 2024-25 | 闭源 | 商业部署 |
| **RDT-1B** | 清华 2024 | DiT | 1B, 扩散解码 |

---

## 8. Related Concepts

- **同节**：[VLA 模型综述](../01_Foundations/VLA模型.md)、[多模态学习](https://jeffliulab.com/ai-notes/04_Foundation_Models/05_Multimodal/多模态学习)
- **机器人学习**：[Diffusion Policy](../02_Methods/扩散策略.md)、[模仿学习](../02_Methods/模仿学习.md)、[Sim2Real](../02_Methods/Sim2Real.md)
- **基础**：[LLM](https://jeffliulab.com/ai-notes/04_Foundation_Models/03_Language_Models/LLM_as_Foundation)、[CLIP](https://jeffliulab.com/ai-notes/04_Foundation_Models/04_Vision_Foundation/CLIP)
- **现代演进**：π0 (Flow Matching), Helix, RDT-1B

---

## References

1. **Brohan, A. et al.** "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control." *CoRL*, 2023.
2. **Kim, M. J. et al.** "OpenVLA: An Open-Source Vision-Language-Action Model." *arXiv:2406.09246*, 2024.
3. **Open X-Embodiment Collaboration** — "Open X-Embodiment: Robotic Learning Datasets and RT-X Models." *arXiv:2310.08864*, 2023.
4. **Octo Model Team** — "Octo: An Open-Source Generalist Robot Policy." *RSS*, 2024.
5. **Black, K. et al.** "π0: A Vision-Language-Action Flow Model for General Robot Control." *arXiv:2410.24164*, 2024.
