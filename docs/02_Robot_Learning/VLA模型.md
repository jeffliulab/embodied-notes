# VLA模型 (Vision-Language-Action Models)

<!-- CONTENT-EXPAND-TODO (2026-05-15)
Reviewer: agent (SVG rework pass)
Status: 总体密度好 (~420 行,数据表+模型卡+数学推导齐全);骨架缺 2 项必填
Gaps:
- §5 后缺 Common Pitfalls 段落 (笔记流水线 §2 #9 推荐项)
- §5 后缺 Worked Example 段落 (数值走一遍 chunking + 一种 head 的推理流程)
- 时间线 §3.2 模型卡可补 "对比/竞争方法" 段(每个 model 跟哪个 prior model 直接对标)
-->

VLA（Vision-Language-Action）模型是当前具身智能最重要的模型范式之一：接收视觉观测和语言指令，直接输出机器人动作。本文系统梳理 VLA 模型的架构设计、动作表征方式，以及从 RT-1 到 pi0.5 的完整发展脉络。

> 相关笔记：[模型发展路线图](模型发展路线图.md) | [ACT模型](ACT模型.md) | [模仿学习](../04_Robot_Learning/模仿学习.md) | [扩散策略](../04_Robot_Learning/扩散策略.md) | [机器人基础模型概论](机器人基础模型概论.md) | [开源模型汇总](开源模型汇总.md)

> 如果你想先看更大范围的模型演化，再回来看 VLA 这条子主线，建议先读 [模型发展路线图](模型发展路线图.md)。

---

## 1. VLA模型定义

### 1.1 什么是VLA

VLA模型的核心定义：

$$\pi_\theta: (\mathbf{o}_{\text{visual}}, \mathbf{l}_{\text{language}}) \mapsto \mathbf{a}_{\text{action}}$$

其中：

- $\mathbf{o}_{\text{visual}}$：视觉观测（RGB图像、深度图、点云等）
- $\mathbf{l}_{\text{language}}$：自然语言任务指令（如"pick up the red cup"）
- $\mathbf{a}_{\text{action}}$：机器人动作（末端执行器位姿、关节角度等）

VLA与其他范式的区别在于：它不只是用视觉和语言做任务理解，而是直接输出可执行的底层动作，实现**端到端的感知-动作映射**。

### 1.2 为什么需要VLA

传统的机器人学习方法（如行为克隆）通常只接受特定格式的观测，缺乏语言理解能力。而纯粹的LLM/VLM又无法直接输出机器人动作。VLA将两者统一：

- **从VLM继承**：视觉理解、语言推理、常识知识
- **新增能力**：动作输出、物理交互、实时控制

---

## 2. 通用架构

### 2.1 三大组件

所有VLA模型都遵循一个基本的三组件架构：

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构 + 内嵌 head 3 路分叉)
Q0: VLA 是「视觉 + 语言 + 本体 → 共享 Transformer → 动作头 (3 选 1) → 机器人动作」的通用三段式;关键设计选择是 action head 类型 (discrete / continuous / diffusion)
Q1: 左 3 行模态输入 (RGB / lang / proprio)，中间 3 个编码器收敛到 Transformer，右侧 fan-out 3 种 action head (橙离散 token / 绿连续回归 / 蓝扩散/Flow)，每个 head 标对应代表模型；输入 box 用色块编码，head 用 stroke 颜色编码
Q2: 去掉标题：「3 输入合流 → Transformer → 3 head 扇出 + 各自代表模型」——这种「head 类型分叉」是 VLA 概览图的标志
Q3: 删去原图坐标越界的 box (x=960/1100 vs viewBox=900);删去 4 行 box 内的「ViT-B/16 / SigLIP / SentencePiece / BPE」长串描述——这些是子选项不是 head 主结构
Q4: 离散 256 bins / MSE / Flow Matching 等关键技术词直接标在 head 旁
Q5: 全用 var(--dia-*);中文标签需要英文版分版
-->
<div class="diagram">
<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VLA universal architecture with three action head choices">
  <defs>
    <marker id="vla-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">VLA 通用架构 — 3 输入 · 1 backbone · 3 种 action head</text>
  <text x="410" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">关键设计选择是 head 类型：离散 token vs 连续回归 vs 扩散/Flow Matching</text>

  <!-- 3 input modalities + encoders -->
  <rect x="30" y="80" width="100" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="80" y="98" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">RGB 图像</text>
  <text x="80" y="112" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">多 cam, ViT patches</text>

  <rect x="30" y="160" width="100" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="80" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-gold)">语言指令</text>
  <text x="80" y="192" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">"pick red cup"</text>

  <rect x="30" y="240" width="100" height="40" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
  <text x="80" y="258" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">本体感觉</text>
  <text x="80" y="272" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">joint state · gripper</text>

  <!-- Encoders -->
  <rect x="170" y="80" width="120" height="40" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="230" y="98" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SigLIP / DINOv2</text>
  <text x="230" y="112" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">visual encoder</text>

  <rect x="170" y="160" width="120" height="40" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="230" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SentencePiece</text>
  <text x="230" y="192" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">tokenizer</text>

  <rect x="170" y="240" width="120" height="40" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="230" y="258" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">MLP</text>
  <text x="230" y="272" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">proprio encoder</text>

  <path d="M 130 100 L 170 100" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr)"/>
  <path d="M 130 180 L 170 180" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr)"/>
  <path d="M 130 260 L 170 260" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr)"/>

  <!-- Transformer backbone (big center) -->
  <rect x="330" y="100" width="160" height="160" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="330" y="100" width="5" height="160" fill="var(--dia-accent)"/>
  <text x="410" y="130" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">Transformer</text>
  <text x="410" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">Llama / PaLM / 定制</text>
  <text x="410" y="168" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">35M ~ 55B params</text>
  <!-- horizontal layer bands -->
  <g stroke="var(--dia-accent)" stroke-width="0.5" opacity="0.45">
    <line x1="345" y1="185" x2="478" y2="185"/>
    <line x1="345" y1="195" x2="478" y2="195"/>
    <line x1="345" y1="205" x2="478" y2="205"/>
    <line x1="345" y1="215" x2="478" y2="215"/>
    <line x1="345" y1="225" x2="478" y2="225"/>
    <line x1="345" y1="235" x2="478" y2="235"/>
  </g>
  <text x="410" y="252" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">所有模态 token 共注意</text>

  <path d="M 295 100 L 328 145" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr)"/>
  <path d="M 295 180 L 328 180" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr)"/>
  <path d="M 295 260 L 328 215" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr)"/>

  <!-- 3 action heads fan-out -->
  <rect x="540" y="80" width="170" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <rect x="540" y="80" width="4" height="50" fill="var(--dia-accent)"/>
  <text x="625" y="100" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">(a) 离散 token</text>
  <text x="625" y="115" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">256-bin · softmax</text>
  <text x="625" y="128" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">RT-1, RT-2, OpenVLA</text>

  <rect x="540" y="155" width="170" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="2"/>
  <rect x="540" y="155" width="4" height="50" fill="var(--dia-green)"/>
  <text x="625" y="175" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-green)">(b) 连续回归</text>
  <text x="625" y="190" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">MLP head · MSE</text>
  <text x="625" y="203" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">RT-1, Octo (默认), GR-1/2</text>

  <rect x="540" y="230" width="170" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <rect x="540" y="230" width="4" height="50" fill="var(--dia-blue)"/>
  <text x="625" y="250" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-blue)">(c) 扩散 / Flow</text>
  <text x="625" y="265" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">多步去噪 / ODE</text>
  <text x="625" y="278" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">π0, RDT, Octo (扩散)</text>

  <path d="M 490 150 L 538 105" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr)"/>
  <path d="M 490 180 L 538 180" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#vla-arr)"/>
  <path d="M 490 210 L 538 255" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#vla-arr)"/>

  <text x="625" y="310" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-style="italic" font-size="11" fill="var(--dia-stroke)">→ 7-DOF action: Δx,Δy,Δz,Δrx,Δry,Δrz,gripper</text>
  <text x="625" y="328" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">通常以 chunk 形式输出 (16-100 步)</text>

  <!-- inputs section bracket -->
  <text x="80" y="312" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">3 modalities</text>
  <text x="230" y="312" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">encoders</text>
  <text x="410" y="295" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">shared backbone</text>
</svg>
</div>


**视觉编码器**的选择：

| 编码器 | 预训练方式 | 参数量 | 使用模型 |
|--------|----------|--------|---------|
| ViT-B/16 | ImageNet-21K | 86M | RT-1 |
| ViT-G | JFT-4B | 1.8B | RT-2 (PaLI-X) |
| SigLIP | WebLI对比学习 | 400M | OpenVLA, pi0 |
| DINOv2 | 自监督 | 300M | HPT |

### 2.2 动作表征方式

VLA模型输出动作的方式是其核心设计选择。目前主要有三种：

#### (a) 离散Token化

将连续动作空间均匀离散化为token：

$$a_d^{\text{token}} = \text{round}\left(\frac{a_d - a_{\min}}{a_{\max} - a_{\min}} \cdot (K-1)\right), \quad K=256$$

**代表**：RT-2、OpenVLA

**优点**：可以直接复用语言模型的token预测机制

**缺点**：离散化损失精度，难以表达多模态动作分布

#### (b) 连续回归

动作头直接输出连续值：

$$\hat{\mathbf{a}} = \text{MLP}(\mathbf{h}_{\text{transformer}})$$

训练损失通常为MSE：

$$\mathcal{L} = \|\hat{\mathbf{a}} - \mathbf{a}^*\|^2$$

**代表**：RT-1、Octo（可选）

**优点**：简单直接，精度高

**缺点**：MSE损失假设单模态高斯分布，无法建模多模态动作

#### (c) 扩散/Flow Matching

用生成模型建模动作分布：

$$\mathbf{a} \sim p_\theta(\mathbf{a} | \mathbf{o}, \mathbf{l})$$

通过迭代去噪或flow matching从噪声中采样动作：

$$\mathbf{a}_1 = \mathbf{a}_0 + \int_0^1 v_\theta(\mathbf{a}_t, t, c) \, dt, \quad \mathbf{a}_0 \sim \mathcal{N}(0, I)$$

**代表**：pi0、RDT、Octo（扩散头选项）

**优点**：可以建模复杂的多模态动作分布，精度最高

**缺点**：推理需要多步去噪，速度较慢

> 更多关于扩散策略的内容参见：[扩散策略](../04_Robot_Learning/扩散策略.md)

---

## 3. 模型发展时间线

### 3.1 时间线总览

<!-- SVG-DESIGN-NOTES
Type: E (历史脉络) + 颜色编码 head 类型
Q0: VLA 2022-2025 演化轨迹有清晰的「head 类型迁移」趋势：早期 RT-1 离散→RT-2 离散 token→Octo/OpenVLA 探索连续与扩散→π0/RDT 全面拥抱扩散/Flow Matching
Q1: 水平时间轴 2022-2025；每个模型一个圆点 + 标签;颜色按 action head 类型编码 (橙离散 / 绿连续 / 蓝扩散)；尺寸编码参数量 (小 r=5, 中 r=7, 大 r=10);上下交错避免重叠
Q2: 去掉标题：「2022-2025 横轴 + 11 个不同颜色圆点 + 颜色趋势从橙到绿到蓝」——这种 head-type-evolution 时间线唯有 VLA 综述图能用
Q3: 删去原 4 行平行 timeline + 截断成 "(Stanford/Berkel" "(Physical Intelligen" 的损坏标签;改为单条主时间轴+上下交错;删去重复年份标
Q4: 模型名 + 机构 + 参数量直接标在圆点旁
Q5: 全用 var(--dia-*);英文 + 数字标签,中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VLA timeline 2022-2025 colored by action head type">
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">VLA 演化时间线 (2022 – 2025)</text>
  <text x="410" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">颜色编码 action head 类型 · 圆点大小编码参数量</text>

  <!-- Legend -->
  <g transform="translate(60, 70)">
    <circle cx="0" cy="0" r="5" fill="var(--dia-accent)"/>
    <text x="10" y="4" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">离散 token</text>
    <circle cx="100" cy="0" r="5" fill="var(--dia-green)"/>
    <text x="110" y="4" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">连续回归</text>
    <circle cx="210" cy="0" r="5" fill="var(--dia-blue)"/>
    <text x="220" y="4" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">扩散 / Flow</text>
    <text x="320" y="4" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">⊕ r=5/7/10 反映 ~100M / ~1B / ~10B 参数</text>
  </g>

  <!-- Time axis -->
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

  <!-- Models: x = year position, alternating up/down -->
  <!-- RT-1 2022-12: small, discrete (orange) -->
  <circle cx="120" cy="200" r="5" fill="var(--dia-accent)"/>
  <line x1="120" y1="195" x2="120" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="120" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">RT-1</text>
  <text x="120" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">35M · Google</text>

  <!-- RT-2 2023-07: huge, discrete -->
  <circle cx="320" cy="200" r="10" fill="var(--dia-accent)"/>
  <line x1="320" y1="190" x2="320" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="320" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">RT-2</text>
  <text x="320" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">55B · Google DM</text>

  <!-- Octo 2023-12: small, green/blue (continuous + diffusion options) -->
  <circle cx="430" cy="200" r="5" fill="var(--dia-green)"/>
  <line x1="430" y1="205" x2="430" y2="250" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="430" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">Octo</text>
  <text x="430" y="275" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">93M · Berkeley</text>

  <!-- OpenVLA 2024-05: 7B, discrete -->
  <circle cx="520" cy="200" r="7" fill="var(--dia-accent)"/>
  <line x1="520" y1="193" x2="520" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="520" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">OpenVLA</text>
  <text x="520" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">7B · Stanford</text>

  <!-- HPT 2024-09: medium, green -->
  <circle cx="595" cy="200" r="5" fill="var(--dia-green)"/>
  <line x1="595" y1="205" x2="595" y2="250" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="595" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">HPT</text>
  <text x="595" y="275" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">~300M · MIT</text>

  <!-- RDT 2024-10: 1B, diffusion (blue) -->
  <circle cx="640" cy="200" r="7" fill="var(--dia-blue)"/>
  <line x1="640" y1="193" x2="640" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="640" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">RDT</text>
  <text x="640" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">1B · Tsinghua</text>

  <!-- GR-1 2024-11: 1B, continuous -->
  <circle cx="680" cy="200" r="7" fill="var(--dia-green)"/>
  <line x1="680" y1="205" x2="680" y2="250" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="680" y="262" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-green)">GR-1</text>
  <text x="680" y="275" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">~1B · Fourier</text>

  <!-- π0 2024-11: 3B, flow matching (blue) -->
  <circle cx="720" cy="200" r="8" fill="var(--dia-blue)"/>
  <line x1="720" y1="192" x2="720" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="720" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">π0</text>
  <text x="720" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">3B · PI</text>

  <!-- π0.5 2025-Q1: 3B+, flow matching, hierarchical -->
  <circle cx="755" cy="200" r="9" fill="var(--dia-blue)"/>
  <line x1="755" y1="191" x2="755" y2="158" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="755" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">π0.5</text>
  <text x="755" y="135" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">3B+ · 层级</text>

  <!-- Helix 2025-02: 7B + 80M dual, blue (latent flow) -->
  <circle cx="660" cy="200" r="9" fill="var(--dia-blue)" opacity="0.8" stroke="var(--dia-stroke)" stroke-width="0.8"/>
  <line x1="660" y1="208" x2="660" y2="295" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 2"/>
  <text x="660" y="307" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">Helix</text>
  <text x="660" y="320" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">7B+80M dual · Figure</text>

  <!-- Trend annotation arrow at top -->
  <path d="M 130 95 C 300 95 500 95 720 95" stroke="var(--dia-stroke-soft)" stroke-width="0.6" fill="none" stroke-dasharray="3 4" marker-end="url(#vla-arr-time)"/>
  <defs>
    <marker id="vla-arr-time" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>
  <text x="410" y="90" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">趋势：离散 token (橙) → 连续回归 (绿) → 扩散 / Flow Matching (蓝)</text>
</svg>
</div>


### 3.2 详细模型卡片

#### RT-1 (Google, 2022)

- **架构**：EfficientNet-B3视觉编码 + TokenLearner压缩 + Transformer解码
- **数据**：130K真实机器人episodes，700+任务，13台Everyday Robots
- **动作空间**：离散化token（每维256 bins），输出7DoF末端位姿 + 终止信号 + 移动基座
- **控制频率**：3Hz
- **关键贡献**：证明了大规模真实数据训练的Transformer可以泛化到新物体和新指令
- **局限**：仅支持单一机器人平台，泛化仅限于训练分布内

#### RT-2 (Google DeepMind, 2023)

- **架构**：PaLI-X (55B) 或 PaLM-E (12B) 作为骨干，共微调（co-fine-tuning）
- **数据**：机器人数据 + Web规模视觉-语言数据
- **动作表征**：将动作编码为文本token `"1 128 91 241 5 101 127"`
- **关键贡献**：
    - 首次证明VLM可以被微调为VLA
    - 涌现推理能力：理解"move apple to bowl with matching color"
    - 符号推理能力：理解语言中的逻辑和关系
- **局限**：模型巨大（55B），推理速度仅1-3Hz

#### Octo (Berkeley, 2023)

- **架构**：纯Transformer，支持多种观测和动作空间
- **数据**：Open X-Embodiment数据集（800K+ episodes）
- **动作头**：支持连续回归和扩散两种模式
- **关键贡献**：
    - 首个开源通用机器人基础模型
    - 设计了灵活的架构支持不同机器人
    - 支持语言和目标图像两种任务指定方式
- **参数量**：93M（Base）

#### OpenVLA (Stanford/Berkeley, 2024)

- **架构**：Prismatic VLM（SigLIP + DinoV2 双视觉编码器）+ Llama 2 7B
- **数据**：Open X-Embodiment数据集
- **动作表征**：离散化token（256 bins），复用LLM的token预测
- **关键贡献**：
    - 7B规模的开源VLA，可在消费级GPU上微调
    - 证明VLM架构可以有效迁移到机器人控制
- **微调方式**：LoRA高效微调，在新机器人上仅需少量数据

#### pi0 (Physical Intelligence, 2024)

- **架构**：3B预训练VLM + Flow Matching动作头
- **数据**：跨多种机器人平台的大规模数据集
- **动作表征**：Flow Matching生成连续动作序列（action chunk）
- **关键贡献**：
    - Flow Matching动作头可建模多模态动作分布
    - 跨具身迁移：同一模型控制多种不同机器人
    - 动作chunk（一次预测未来多步动作）提升时间一致性
- **控制频率**：约50Hz（GPU推理 + action chunk）

#### pi0.5 (Physical Intelligence, 2025)

- **架构**：双层结构 — 高层VLM做子任务规划 + 底层pi0做精细控制
- **关键贡献**：
    - 层级任务分解（Hierarchical Task Decomposition）
    - 高层模型理解长时间复杂任务
    - 底层模型执行精细的操作动作
    - 在真实家庭环境中完成端到端的洗衣、清洁等长序列任务

#### GR-1 (Fourier Intelligence, 2024)

- **架构**：GPT风格的Transformer，同时预测视频帧和动作
- **数据**：人形机器人操作数据 + 人类视频数据
- **关键贡献**：
    - 首个人形机器人专用的VLA模型
    - 视频预测 + 动作预测的多任务学习
    - 可以从人类视频中学习，再迁移到人形机器人

#### GR-2 (Fourier Intelligence, 2025)

- **架构**：3B+参数，包含世界模型组件
- **关键贡献**：
    - 规模提升至3B+参数
    - 引入世界模型组件预测未来视觉状态
    - 支持更复杂的人形机器人全身操作

#### HPT (MIT, 2024)

- **架构**：异构预训练Transformer，统一处理不同维度的传感器输入
- **关键贡献**：
    - 解决不同机器人传感器维度不一致的问题
    - 通过模态对齐层（stem）将异构输入映射到统一空间
    - 在Open X-Embodiment + DROID上预训练

#### RDT (Tsinghua, 2024)

- **架构**：扩散Transformer（DiT风格），专注双臂操作
- **数据**：双臂操作数据集
- **关键贡献**：
    - 将DiT架构引入机器人动作生成
    - 原生支持高维双臂动作空间（14+ DoF）
    - 扩散过程可以建模双臂协调的复杂动作分布

---

## 4. 核心技术深度解析

### 4.1 动作Chunking

动作chunking是VLA模型的关键技术。不是逐步预测单个动作，而是一次预测未来 $H$ 步的动作序列：

$$\hat{\mathbf{a}}_{t:t+H} = \pi_\theta(\mathbf{o}_t, \mathbf{l})$$

其中 $H$ 为chunk大小（通常16-100步）。

**好处**：

1. **时间一致性**：避免逐步预测时的抖动和不连贯
2. **减少推理调用**：每 $H$ 步才需要一次模型推理
3. **隐式规划**：模型学习了短期内的动作规划

**执行策略**：通常不是执行完整个chunk再预测，而是每隔 $k < H$ 步重新预测，通过指数加权平均融合新旧chunk：

$$\mathbf{a}_t^{\text{exec}} = w \cdot \hat{\mathbf{a}}_t^{\text{new}} + (1-w) \cdot \hat{\mathbf{a}}_t^{\text{old}}$$

这条设计路线在具身智能里并不是凭空出现的。它在模型谱系上的关键桥接节点是 [ACT模型](ACT模型.md)：ACT 把 chunked action prediction 清晰地变成了一个可复现、可解释的策略范式，后续很多 VLA 的 horizon 设计、动作块推理和时间平滑都能在那条线上找到动机。

### 4.2 Co-fine-tuning策略

RT-2提出的co-fine-tuning是一个关键训练技巧：

$$\mathcal{L}_{\text{total}} = \lambda_{\text{robot}} \mathcal{L}_{\text{robot}} + \lambda_{\text{web}} \mathcal{L}_{\text{web}}$$

在微调阶段，不完全抛弃原始的VLM训练数据，而是将机器人数据和Web数据混合训练。这样做可以：

- 保持VLM原有的视觉理解和语言能力
- 防止灾难性遗忘
- 让Web知识持续影响机器人策略的学习

### 4.3 跨具身迁移的挑战

不同机器人之间的关键差异：

| 差异维度 | 示例 |
|---------|------|
| 观测空间 | 单相机 vs 双相机 vs 腕部相机 |
| 动作空间 | 6DoF末端 vs 7DoF关节 vs 14DoF双臂 |
| 动作范围 | 桌面操作 vs 全身运动 |
| 控制频率 | 3Hz vs 50Hz vs 200Hz |
| 动力学 | 轻负载 vs 重负载 |

处理策略：

1. **动作空间标准化**（Octo）：将所有动作归一化到统一范围
2. **模态对齐层**（HPT）：用可学习的stem将异构输入映射到统一空间
3. **任务特异微调头**：共享主干，针对不同机器人微调输出头

---

## 5. 模型对比总结

| 模型 | 年份 | 机构 | 参数量 | 动作表征 | 数据规模 | 开源 |
|------|------|------|--------|---------|---------|------|
| RT-1 | 2022 | Google | 35M | 离散Token | 130K ep | 否 |
| RT-2 | 2023 | Google DeepMind | 12-55B | 离散Token | 130K ep + Web | 否 |
| Octo | 2023 | Berkeley | 93M | 连续/扩散 | 800K+ ep | 是 |
| OpenVLA | 2024 | Stanford/Berkeley | 7B | 离散Token | 970K+ ep | 是 |
| pi0 | 2024 | Physical Intelligence | 3B | Flow Matching | 大规模 | 是 |
| pi0.5 | 2025 | Physical Intelligence | 3B+ | Flow Matching | 大规模 | 否 |
| GR-1 | 2024 | Fourier | ~1B | 连续回归 | 人形数据 | 部分 |
| GR-2 | 2025 | Fourier | 3B+ | 连续回归 | 人形数据 | 否 |
| HPT | 2024 | MIT | ~300M | 连续/扩散 | 多源 | 是 |
| RDT | 2024 | Tsinghua | ~1B | 扩散 | 双臂数据 | 是 |

---

## 6. 未来趋势

1. **动作头的演进**：从离散token → 连续回归 → 扩散/Flow Matching，趋向更高精度和多模态建模
2. **层级化设计**：pi0.5的高层规划+底层控制范式可能成为主流
3. **训练效率**：LoRA、QLoRA等高效微调方法降低VLA的适配成本
4. **实时性**：模型蒸馏、量化、action chunk等技术提升推理速度
5. **数据飞轮**：VLA部署后收集的数据反哺模型训练，形成正向循环

---

**参考文献**：

- Brohan et al., "RT-1: Robotics Transformer for Real-World Control at Scale", RSS 2023
- Brohan et al., "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control", CoRL 2023
- Team et al., "Octo: An Open-Source Generalist Robot Policy", RSS 2024
- Kim et al., "OpenVLA: An Open-Source Vision-Language-Action Model", 2024
- Black et al., "pi0: A Vision-Language-Action Flow Model for General Robot Control", 2024
- Physical Intelligence, "pi0.5: a Vision-Language-Action Model with Open-World Generalization", 2025
- Wu et al., "GR-1: Unleashing Large-Scale Video Generative Pre-training for Visual Robot Manipulation", 2024
- Liang et al., "HPT: Heterogeneous Pre-trained Transformers", 2024
- Liu et al., "RDT-1B: a Diffusion Foundation Model for Bimanual Manipulation", 2024
