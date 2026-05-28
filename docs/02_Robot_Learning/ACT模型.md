# ACT模型

ACT（Action Chunking with Transformers）是具身智能里一个非常有代表性的模型：它不是最大、最新的 foundation model，但它把 **action chunking** 这条路线做成了清晰范式，因此在理解后续 VLA 动作头、生成式策略和低成本双臂操作时都很关键。

这篇笔记关注的不是“ACT 在模仿学习里出现过”，而是把它当成一个**模型级里程碑**来看：它解决了什么问题、为什么在 2023 年重要、它和 Diffusion Policy / OpenVLA / pi0 之间是什么关系。

> 相关笔记：[模型发展路线图](模型发展路线图.md) | [模仿学习](../04_Robot_Learning/模仿学习.md) | [VLA模型](VLA模型.md) | [开源模型汇总](开源模型汇总.md) | [遥操作与数据收集](../04_Robot_Learning/遥操作与数据收集.md)

---

## 1. ACT 是什么，为什么值得单独看

ACT 的一句话定义是：

> 给定当前观测，不是只预测一步动作，而是一次预测未来一个短动作块，再通过时间集成平滑执行。

形式上，它把经典行为克隆中的

$$
\pi(o_t) \rightarrow a_t
$$

改写成

$$
\pi(o_t, s_t) \rightarrow \hat{\mathbf{a}}_{t:t+H-1}
$$

其中：

- $o_t$ 是视觉观测
- $s_t$ 是机器人本体状态
- $H$ 是 chunk horizon
- 输出是未来 $H$ 步动作，而不是单步动作

它值得单独看的原因有三个：

1. **历史位置特殊**：它是从经典模仿学习走向 chunk-based policy 的关键桥梁。
2. **工程意义很强**：少量示教、低成本硬件、双臂精细操作这些关键词，让它至今仍有复现价值。
3. **影响后续模型设计**：很多后来的 VLA、tokenized action、快速推理工作都延续了“动作块而不是单步动作”的思路。

---

## 2. 问题背景

ACT 出现时，要解决的是一类很具体、但很难的问题：

- **精细双臂操作**：例如开半透明杯盖、插电池、整理绳线、对准插槽
- **少量示教**：目标不是几十万 episode，而是几十条高质量演示
- **低成本硬件**：依托 ALOHA 这样的低成本双臂遥操作系统
- **高频控制与时间一致性**：逐步输出动作容易抖动，尤其在接触和协调操作中

传统单步 BC 的主要问题是：

| 问题 | 表现 |
|------|------|
| 单步回归抖动 | 每一步都独立预测，动作序列容易不平滑 |
| 多模态动作 | 同一观测下可能有多种合理操作路径，MSE 容易平均掉 |
| 长时序误差累积 | 每一步小误差都会在后续放大 |
| 双臂协调难 | 两只手之间需要时间上连续、空间上同步 |

ACT 给出的回答是：

- 用 **CVAE** 处理多模态性
- 用 **action chunking** 预测短时未来动作块
- 用 **temporal ensembling** 融合重叠预测，减少抖动

---

## 3. 核心思想

### 3.1 Action Chunking

不再直接预测单步动作 $a_t$，而是预测一个短时序动作块：

$$
\hat{\mathbf{a}}_{t:t+H-1} = \left(\hat{a}_t, \hat{a}_{t+1}, \ldots, \hat{a}_{t+H-1}\right)
$$

这样做有三个直接好处：

1. 模型显式学习短期时间结构
2. 推理调用次数减少
3. 动作在时间维上更连贯

### 3.2 Temporal Ensembling

模型会在连续多个时刻反复预测未来 chunk，因此某个时间步 $t$ 的执行动作，通常对应多个 chunk 的重叠预测。ACT 用指数衰减加权平均来融合它们：

$$
a_t^{\text{exec}} = \frac{\sum_i w_i \hat{a}_t^{(i)}}{\sum_i w_i}, \quad w_i = \exp(-m \Delta t_i)
$$

越新的预测权重越高，越旧的预测权重越低。

### 3.3 CVAE Latent

ACT 不是只做确定性回归，而是引入潜变量 $z$ 来表示“这次动作风格/模式”：

$$
z \sim q_\phi(z \mid o_t, s_t, \mathbf{a}_{t:t+H-1})
$$

在训练时，编码器看到观测和真实未来动作，学习把动作风格压缩到 latent 里；在推理时，不再依赖真实未来动作，而是使用固定先验来生成一个稳定的 chunk 输出。

---

## 4. 模型结构

### 4.1 总体结构

<!-- SVG-DESIGN-NOTES
Type: C (过程 / 时间维度操作) — Temporal Ensembling 是 ACT 的核心几何
Q0: ACT 的灵魂是「重叠 chunk + 指数加权平均」——每个时刻不只用最新一次预测的动作，而是把过去几次重叠预测的 chunk 在该时刻的预测值用 exp(-mΔt) 加权融合，去抖动
Q1: 时间轴上叠 5 个 overlapping chunk (每个 chunk H=10 时间步)，每个 chunk 用不同的 stroke pattern；在某个目标时间 t* 处画垂直 marker，与每个 chunk 的相交点显示出来；侧边展示指数权重曲线 exp(-mΔt) 衰减；最终 a_t^exec 是加权平均
Q2: 去掉标题：「重叠 5 个时间窗 + 中心垂直线 + 指数权重柱图」——这是 ACT 区别于 RT-1 / Diffusion Policy 的灵魂
Q3: 删去原 16+ 个等高 box (而且坐标越界至 viewBox 外 1500+)；删去 viewBox 0-900 但 box 在 1190/1330/1420 的"残破"布局
Q4: H / Δt / m / a_t^exec 直接标在几何元素旁
Q5: 全用 var(--dia-*)；中文标签需要英文版分版
-->
<div class="diagram">
<svg viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ACT temporal ensembling of overlapping chunks">
  <defs>
    <marker id="act-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="400" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">ACT — Temporal Ensembling 重叠 chunk 指数加权融合</text>
  <text x="400" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">每个时间步 t* 的执行动作 = 多个重叠 chunk 在该时刻预测的 exp(-mΔt) 加权平均</text>

  <!-- Time axis -->
  <line x1="60" y1="300" x2="640" y2="300" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="60" y1="300" x2="60" y2="305"/>
    <text x="60" y="320" text-anchor="middle">t-4H</text>
    <line x1="180" y1="300" x2="180" y2="305"/>
    <text x="180" y="320" text-anchor="middle">t-3</text>
    <line x1="270" y1="300" x2="270" y2="305"/>
    <text x="270" y="320" text-anchor="middle">t-2</text>
    <line x1="360" y1="300" x2="360" y2="305"/>
    <text x="360" y="320" text-anchor="middle">t-1</text>
    <line x1="430" y1="300" x2="430" y2="305"/>
    <text x="430" y="320" text-anchor="middle">t (now)</text>
    <line x1="540" y1="300" x2="540" y2="305"/>
    <text x="540" y="320" text-anchor="middle">t+H</text>
    <line x1="640" y1="300" x2="640" y2="305"/>
    <text x="640" y="320" text-anchor="middle">future</text>
  </g>

  <!-- Vertical "now" marker -->
  <line x1="430" y1="80" x2="430" y2="300" stroke="var(--dia-accent-deep)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="430" y="74" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="12" fill="var(--dia-accent-deep)">t* (当前要执行)</text>

  <!-- 5 overlapping chunks: each chunk is a horizontal bracket spanning H=10 timesteps -->
  <!-- chunk i starts at t-4, t-3, t-2, t-1, t (each H=300 wide, ending H later) -->
  <!-- chunk 1 (oldest): start at t-4, ends at t+6 — faded -->
  <g stroke="var(--dia-stroke-soft)" stroke-width="2.2" fill="none" opacity="0.4">
    <path d="M 80 110 L 530 110"/>
    <path d="M 80 105 L 80 115 M 530 105 L 530 115"/>
  </g>
  <text x="60" y="115" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">chunk[t-4]</text>
  <!-- prediction value at t* (small dot on this chunk line at x=430) -->
  <circle cx="430" cy="110" r="3.5" fill="var(--dia-stroke-soft)" opacity="0.6"/>

  <!-- chunk 2 (older) -->
  <g stroke="var(--dia-stroke-soft)" stroke-width="2.2" fill="none" opacity="0.55">
    <path d="M 170 140 L 560 140"/>
    <path d="M 170 135 L 170 145 M 560 135 L 560 145"/>
  </g>
  <text x="150" y="145" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">chunk[t-3]</text>
  <circle cx="430" cy="140" r="3.5" fill="var(--dia-stroke-soft)" opacity="0.65"/>

  <!-- chunk 3 -->
  <g stroke="var(--dia-green)" stroke-width="2.2" fill="none" opacity="0.7">
    <path d="M 260 170 L 600 170"/>
    <path d="M 260 165 L 260 175 M 600 165 L 600 175"/>
  </g>
  <text x="240" y="175" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">chunk[t-2]</text>
  <circle cx="430" cy="170" r="3.5" fill="var(--dia-green)" opacity="0.75"/>

  <!-- chunk 4 -->
  <g stroke="var(--dia-green)" stroke-width="2.4" fill="none" opacity="0.85">
    <path d="M 340 200 L 620 200"/>
    <path d="M 340 195 L 340 205 M 620 195 L 620 205"/>
  </g>
  <text x="320" y="205" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">chunk[t-1]</text>
  <circle cx="430" cy="200" r="3.5" fill="var(--dia-green)" opacity="0.9"/>

  <!-- chunk 5 (newest, strongest) -->
  <g stroke="var(--dia-accent)" stroke-width="2.8" fill="none">
    <path d="M 430 230 L 640 230"/>
    <path d="M 430 225 L 430 235 M 640 225 L 640 235"/>
  </g>
  <text x="430" y="248" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="9" fill="var(--dia-accent-deep)">chunk[t] · newest</text>
  <circle cx="430" cy="230" r="5" fill="var(--dia-accent)"/>

  <!-- Right side: exponential weight bar chart (vertical) -->
  <text x="725" y="100" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">weight = exp(-mΔt)</text>

  <!-- 5 horizontal weight bars decreasing from newest (top) to oldest (bottom) — actually since I want exp decay from newest (chunk t) to oldest (chunk t-4) -->
  <!-- chunk[t]: weight 1.0 -->
  <rect x="660" y="226" width="80" height="8" fill="var(--dia-accent)"/>
  <text x="746" y="234" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent-deep)">1.00</text>
  <!-- chunk[t-1]: weight 0.6 -->
  <rect x="660" y="196" width="48" height="8" fill="var(--dia-green)" opacity="0.85"/>
  <text x="714" y="204" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">0.61</text>
  <!-- chunk[t-2]: weight 0.37 -->
  <rect x="660" y="166" width="30" height="8" fill="var(--dia-green)" opacity="0.7"/>
  <text x="696" y="174" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">0.37</text>
  <!-- chunk[t-3]: weight 0.22 -->
  <rect x="660" y="136" width="18" height="8" fill="var(--dia-stroke-soft)" opacity="0.7"/>
  <text x="684" y="144" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0.22</text>
  <!-- chunk[t-4]: weight 0.14 -->
  <rect x="660" y="106" width="11" height="8" fill="var(--dia-stroke-soft)" opacity="0.5"/>
  <text x="677" y="114" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0.14</text>

  <!-- Final executed action callout -->
  <text x="430" y="278" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-style="italic" font-size="13" fill="var(--dia-accent-deep)">a_t^exec = Σ w_i · â_t^(i) / Σ w_i</text>
  <text x="430" y="293" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">5 个交点 (圆) 按权重融合 → 平滑执行动作</text>

  <!-- bottom note: chunk horizon H -->
  <line x1="80" y1="350" x2="530" y2="350" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <path d="M 80 346 L 80 354 M 530 346 L 530 354" stroke="var(--dia-stroke-soft)" stroke-width="0.6"/>
  <text x="305" y="346" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">chunk horizon H ≈ 100 step (Aloha 双臂)</text>
</svg>
</div>


### 4.2 输入与输出

ACT 的典型输入包括：

- 多视角 RGB 图像
- 机械臂关节状态 / 末端状态
- 夹爪状态

输出则是：

- 未来 $H$ 步的动作块
- 通常是双臂关节或末端控制命令

### 4.3 编码器和解码器分工

| 组件 | 作用 |
|------|------|
| 视觉编码器 | 提取多视角图像特征 |
| 状态编码 | 提取本体感觉信息 |
| CVAE 编码器 | 训练时根据真实未来动作推断 latent 风格变量 |
| Transformer 解码器 | 在观测和 latent 条件下输出未来动作块 |

---

## 5. 数学表达与训练目标

### 5.1 Chunk Prediction

ACT 学的是条件分布：

$$
p_\theta(\mathbf{a}_{t:t+H-1} \mid o_t, s_t, z)
$$

而不是单步的：

$$
p_\theta(a_t \mid o_t)
$$

### 5.2 Reconstruction Loss

解码器输出的 chunk 要尽量接近真实未来动作块：

$$
\mathcal{L}_{\text{recon}} = \sum_{j=0}^{H-1} \left\| \hat{a}_{t+j} - a^*_{t+j} \right\|_2^2
$$

### 5.3 KL Regularization

CVAE 需要让 posterior 不要偏离标准正态 prior 太远：

$$
\mathcal{L}_{\text{KL}} = D_{\text{KL}}\left(q_\phi(z \mid o_t, s_t, \mathbf{a}^*) \,\|\, \mathcal{N}(0, I)\right)
$$

### 5.4 总损失

ACT 的训练目标通常写为：

$$
\mathcal{L}_{\text{ACT}} = \mathcal{L}_{\text{recon}} + \beta \mathcal{L}_{\text{KL}}
$$

其中 $\beta$ 控制多模态潜变量约束的强度。

---

## 6. 推理过程

ACT 的训练和推理并不完全对称，这是它容易被误解的地方。

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 对称对比 — train 与 inference 在 z 步骤分叉)
Q0: ACT 训练和推理在 z 这一步分叉：训练时 z ~ q(z | obs, 真实未来动作)；推理时无法访问真实未来,改用 prior z=0；其余通路完全对称——这是 CVAE 的关键非对称
Q1: 两个并排垂直流程图，共享起点 (obs) 但在「z 来源」环节分岔——左 (训练) 显示「encoder ← 真实 future actions」，右 (推理) 显示「prior N(0,I) → z=0」；用 accent 高亮分叉处的不同；其余 stages 用 soft 中性色保持视觉对称
Q2: 去掉标题：「两条平行竖直流程 + 中间 z 步骤的明显分叉箭头 + 一边带真实 actions 一边带 prior icon」——这是 ACT CVAE 的视觉签名
Q3: 删去原 480×860 viewBox 13 个等高 box；保持只关键的 5 个 stage; 删去训练侧的「KL 计算」和推理侧的「temporal ensembling」(后者已在 Figure 1 单独画)
Q4: 真实 actions / N(0,I) prior / encoder / Transformer / chunk 等标签贴对应 box
Q5: 全用 var(--dia-*)；中文标签需要英文版分版
-->
<div class="diagram">
<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ACT training vs inference asymmetry">
  <defs>
    <marker id="act2-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">CVAE — 训练与推理在 z 步骤分叉</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">其余通路完全对称；唯一区别是 z 来自 encoder(true actions) 还是 prior N(0,I)</text>

  <!-- Column headers -->
  <text x="190" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-green)">训练 (Training)</text>
  <text x="570" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-blue)">推理 (Inference)</text>

  <!-- Shared obs node (top center) -->
  <rect x="320" y="92" width="120" height="36" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <text x="380" y="115" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">obs (cam + state)</text>

  <!-- Train side: top extra input = "真实未来 actions" (only in train) -->
  <rect x="50" y="92" width="160" height="36" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <rect x="50" y="92" width="4" height="36" fill="var(--dia-accent)"/>
  <text x="130" y="111" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">真实未来 actions</text>
  <text x="130" y="124" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">a_{t:t+H}</text>

  <!-- Inference side: top extra input = "N(0,I) prior" (only in inference) -->
  <rect x="550" y="92" width="160" height="36" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <rect x="550" y="92" width="4" height="36" fill="var(--dia-blue)"/>
  <text x="630" y="111" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-blue)">N(0, I) prior</text>
  <text x="630" y="124" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">z = 0 (固定)</text>

  <!-- z node (level 2) — center, but inputs come from different sides -->
  <!-- Training: obs + actions both feed CVAE encoder -->
  <rect x="60" y="160" width="220" height="44" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <rect x="60" y="160" width="4" height="44" fill="var(--dia-accent)"/>
  <text x="170" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">CVAE encoder</text>
  <text x="170" y="197" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">q_φ(z | obs, actions)</text>

  <rect x="480" y="160" width="220" height="44" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2" stroke-dasharray="3 3"/>
  <rect x="480" y="160" width="4" height="44" fill="var(--dia-blue)"/>
  <text x="590" y="180" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">encoder 不调用</text>
  <text x="590" y="197" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">直接用 z=0</text>

  <!-- Arrows into encoder / prior -->
  <path d="M 130 132 L 130 158" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#act2-arr)"/>
  <path d="M 320 115 C 280 115 250 140 200 158" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#act2-arr)"/>
  <path d="M 630 132 L 630 158" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#act2-arr)"/>
  <path d="M 440 115 C 480 115 510 140 560 158" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#act2-arr)"/>

  <!-- z value (level 3) -->
  <circle cx="170" cy="240" r="12" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="170" y="244" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">z</text>
  <text x="170" y="266" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">sampled from q</text>

  <circle cx="590" cy="240" r="12" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="590" y="244" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="11" fill="var(--dia-blue)">0</text>
  <text x="590" y="266" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">prior mean</text>

  <path d="M 170 204 L 170 228" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#act2-arr)"/>
  <path d="M 590 204 L 590 228" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#act2-arr)"/>

  <!-- Transformer decoder (level 4) — shared symbol on each column -->
  <rect x="60" y="290" width="220" height="38" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <text x="170" y="314" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Transformer → chunk</text>

  <rect x="480" y="290" width="220" height="38" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <text x="590" y="314" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">Transformer → chunk</text>

  <!-- obs also feeds the Transformer in both -->
  <path d="M 380 128 C 380 200 380 260 280 309" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#act2-arr)"/>
  <path d="M 380 128 C 380 200 380 260 480 309" stroke="var(--dia-stroke-soft)" stroke-width="1.2" fill="none" marker-end="url(#act2-arr)"/>
  <text x="380" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">obs 都喂给 decoder</text>

  <!-- z feeds Transformer in both -->
  <path d="M 170 252 L 170 290" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#act2-arr)"/>
  <path d="M 590 252 L 590 290" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#act2-arr)"/>

  <!-- Highlight: arrow between the two z values noting they're different -->
  <path d="M 182 240 L 578 240" stroke="var(--dia-accent-deep)" stroke-width="1" stroke-dasharray="2 4"/>
  <text x="380" y="234" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">唯一分叉：z 来源不同</text>

  <!-- bottom KL note -->
  <text x="170" y="346" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">loss = ‖â − a‖² + β·KL(q‖prior)</text>
  <text x="590" y="346" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">→ temporal ensembling 平滑 (见 Figure 1)</text>
</svg>
</div>


### 6.1 为什么推理时常写成 `z = 0`

因为训练时 KL 项把 posterior 拉向标准正态先验，推理时可直接用先验均值作为稳定默认值：

$$
z_{\text{test}} = 0
$$

这意味着模型在部署时选择一种“默认动作风格”，减少随机采样带来的不稳定。

### 6.2 为什么还要 Temporal Ensembling

即使一次预测了一个 chunk，接触任务里仍可能因为视觉噪声、状态偏差或相机遮挡而出现不稳定。重叠 chunk 的加权融合能显著改善：

- 抖动
- 双臂不同步
- 末端在接触边缘的细小震荡

---

## 7. 为什么 ACT 当时重要

### 7.1 它证明了“少量高质量示教 + 合适结构”可以做成精细操作

ACT 最让人印象深刻的不是参数量，而是它在 ALOHA 上用大约 50 条示教就完成了一批精细双臂任务，成功率相当高。

### 7.2 它让 chunk-based policy 成为清晰路线

ACT 之后，很多研究者不再把“逐步出动作”视为唯一默认选择。后续工作越来越自然地接受：

- 一次预测未来多个动作
- 让时间窗口成为显式设计维度
- 把动作表示做成 chunk / token / diffusion trajectory

### 7.3 它和 ALOHA 一起构成了“低成本具身研究套件”

ACT 的影响力还来自它不是孤立论文，而是和 ALOHA 硬件、遥操作采集和复现代码一起形成了完整闭环。对很多研究者来说，它是第一套“真的能在实验室里复现”的双臂精细操作系统。

---

## 8. ACT 的局限

ACT 很重要，但也必须看清它的边界：

| 局限 | 说明 |
|------|------|
| 任务范围偏窄 | 更适合桌面、短时程、操作性强的任务 |
| 泛化边界有限 | 不属于 web-scale 预训练的 foundation model |
| 数据分布敏感 | 相机布局、动作定义、遥操作习惯变化都会影响效果 |
| 语义能力较弱 | 不像 VLA 那样天然继承强语言和常识能力 |
| 频率与时序仍需工程调参 | chunk 长度、重规划频率、衰减权重都很重要 |

---

## 9. 与邻近方法的关系

### 9.1 ACT vs BC

- BC：通常单步回归动作
- ACT：预测动作块，并通过 latent 建模多模态性

### 9.2 ACT vs Diffusion Policy

- ACT：`CVAE + Transformer`，推理通常更轻
- Diffusion Policy：生成分布能力更强，复杂接触任务更有优势，但推理更慢

### 9.3 ACT vs BeT / Tokenized Actions

- ACT：chunk 是连续动作序列
- BeT / action tokenizers：更强调把动作压成 token，便于 Transformer 统一处理

### 9.4 ACT vs VLA / OpenVLA / pi0 / FAST

| 维度 | ACT | Diffusion Policy | OpenVLA | pi0 |
|------|-----|------------------|---------|-----|
| 主要定位 | 精细操作策略模型 | 生成式操作策略 | 开源 VLA | flow-based VLA |
| 输入模态 | 图像 + 状态 | 图像 + 状态 | 图像 + 语言 + 状态 | 图像 + 语言 + 状态 |
| 输出方式 | 连续 action chunk | 扩散生成动作序列 | 离散动作 token | 连续 chunk / flow |
| 语言能力 | 很弱 | 很弱 | 强 | 强 |
| 典型数据规模 | 数十到数百演示 | 中等离线示教 | 近百万 episode | 大规模多具身数据 |
| 核心价值 | 建立 chunked policy 范式 | 强多模态动作建模 | 社区可复现 VLA 主线 | 更强连续动作生成与跨具身 |

这里最重要的关系不是“谁替代谁”，而是：

- ACT 让大家接受了 chunked action prediction
- Diffusion Policy 把生成式动作分布做得更强
- OpenVLA / pi0 把动作建模进一步放进更大的 vision-language-action 统一模型里

---

## 10. 工程落地

### 10.1 数据组织

ACT 很依赖高质量演示，数据通常需要严格对齐：

- 多相机时间同步
- 机器人状态与图像帧对齐
- 双臂动作定义一致
- 遥操作示教风格尽量稳定

### 10.2 关键超参数

| 超参数 | 作用 | 调大时的影响 | 调小时的影响 |
|--------|------|--------------|--------------|
| `chunk_size / horizon` | 预测未来动作长度 | 更强短期规划，更依赖稳定性 | 更接近单步控制 |
| `beta` | KL 正则强度 | latent 更规整，但可能欠拟合 | 更灵活，但可能过拟合 |
| `batch_size` | 训练稳定性 | 梯度更稳，但显存更高 | 噪声更大 |
| `camera_views` | 视觉覆盖范围 | 遮挡更少，工程更复杂 | 信息不足更明显 |
| `replan interval` | 多久重新预测一次 chunk | 更稳但算力更高 | 更省算力但适应更差 |

### 10.3 训练资源

ACT 的一个现实优势是训练成本相对可控，尤其和 7B 级 VLA 相比更容易上手。它很适合作为：

- 小实验室的双臂精细操作起点
- LeRobot/ALOHA 风格数据管线的第一条基线
- 判断“数据问题还是模型问题”的工程诊断工具

---

## 11. 适用场景与不适用场景

### 更适合

- 双臂桌面精细操作
- 中短时程任务
- 演示数量不大但质量较高
- 需要时间一致性、但不想承受扩散推理成本的任务

### 不太适合

- 强语言理解和开放词汇指令
- 跨大量机器人平台直接泛化
- 很长时程任务的高层规划
- 高度开放环境中的通用 foundation model 目标

---

## 12. 开源生态与复现入口

ACT 之所以今天还值得单独看，一个重要原因是它依然有清晰的开源入口：

- **ALOHA / 官方项目页**：低成本双臂遥操作 + ACT
- **官方代码仓库**：`tonyzhaozh/act`
- **LeRobot**：把 ACT 当作统一训练框架中的重要基线策略

工程上很常见的一条路径是：

1. 先用 LeRobot / 仿真数据管线验证流程
2. 再迁移到真实 ALOHA 风格双臂采集
3. 最后再决定是否升级到 Diffusion Policy 或更大的 VLA

---

## 13. 为什么它重要但又不是终局方案

> ACT 的历史价值，主要在于它把“动作块”作为主要建模对象明确立住了；  
> 但它并没有解决 foundation model 时代最核心的几个问题：大规模跨具身预训练、强语言泛化、开放环境长期规划。

所以最准确的定位是：

- **不是终点**
- **不是过时基线**
- **而是承上启下的桥梁**

如果你正在搭知识体系，ACT 应该和下面两类东西一起看：

- 向左看：[模仿学习](../04_Robot_Learning/模仿学习.md)
- 向右看：[VLA模型](VLA模型.md)、[模型发展路线图](模型发展路线图.md)

---

## 14. 参考文献

- Zhao et al., *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*, RSS 2023
- ACT 官方仓库：<https://github.com/tonyzhaozh/act>
- Tony Zhao / ALOHA + ACT 项目页：<https://tonyzhaozh.github.io/>
- LeRobot ACT 文档：<https://huggingface.co/docs/lerobot/act>
- Chi et al., *Diffusion Policy: Visuomotor Policy Learning via Action Diffusion*, RSS 2023
- Kim et al., *OpenVLA: An Open-Source Vision-Language-Action Model*, 2024
- Black et al., *pi0: A Vision-Language-Action Flow Model for General Robot Control*, 2024
- Physical Intelligence, *FAST: Efficient Robot Action Tokenization*, 2025
