# Helix — Figure AI 的 dual-system VLA

> *Figure AI 2025 年 2 月发布 **Helix**:首个**专为人形机器人**设计的 dual-system VLA。System 2 (7B VLM, 7-9 Hz) 做高层语义,System 1 (80M Transformer, 200 Hz) 做实时控制。两套独立网络通过 latent 通信,既享 LLM 的语义优势,又能 200 Hz 实时操作。是 RT-2 / π0 之后的 next-gen 设计。*
>
> **难度**:Advanced
> **前置知识**:[VLA 模型](../01_Foundations/VLA模型.md)、[π0](Pi0_Physical_Intelligence.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)
> **后续阅读**:[Octo](Octo_Foundation_Policy.md)、[RDT-1B](RDT_1B.md)

---

## 1. 公司背景

Figure AI (San Jose, 2022 成立):
- 创始人 **Brett Adcock** (前 Archer 创始人)
- 投资方:OpenAI / Microsoft / NVIDIA / Bezos (累计 $675M+)
- 产品:**Figure 01 / Figure 02** 全尺寸人形机器人
- 战略:**自研 robot policy** 不外包 → Helix 是这条路线的产物

---

## 2. 为什么需要 Dual-System

### 2.1 单一 VLA 的两难

| 需求 | 单 VLA 困境 |
|---|---|
| 语义理解强 | 需 7B+ VLM,延迟 100-200ms |
| 实时控制 | 需 200 Hz (5ms 周期) |
| 一个网络做不到都 | 必须 trade-off |

RT-2 / π0 都偏 System 2 (semantic) 牺牲速度。
Diffusion Policy / ACT 偏 System 1 (control) 牺牲语义。

### 2.2 人形机器人特殊需求

- **24-50 DOF** (双手 + 躯干 + 腿)
- 双手协调 (拿一物从一手传到另一手)
- 全身平衡 (头 / 躯干 / 腿 动态稳定)
- 语义复杂 ("把蓝色物品归到左侧")

→ 必须 dual-system。

---

## 3. Helix 架构

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构)
Q0: Helix 的 DNA 是「巨大慢速 VLM (7B) 通过窄信道 (256-d latent) 喂养小巧高频控制器 (80M) — 参数差 ~87×、频率差 ~30×」
Q1: 节点大小反映参数量：S2 box 比 S1 box 面积大 ~3-4× (linear) + 字体 + accent 浓度三重编码 87× 真比 (1B 完全显示成 87× 会让 S1 变成像素点)；latent 画成窄长 strip 强调信道收缩；S1 同时从观测和 latent 接收信息（两个 in-edge）
Q2: 去掉标题：看到「一个明显大的 accent 块 + 一个明显小的 green 块 + 之间一条窄的紫色信道 → 小块输出 35-DOF」——这种 mega/mini 的视觉对比是 dual-system 的标志，没有第二个 VLA 长这样
Q3: 删去原来 4 个等高方框；删去把 7B / 80M 当作 box 内文字的做法——尺寸直接编码这些数字；保留双 input 边以体现 S1 仍读观测
Q4: 7B / 80M / 256-d / 35-DOF 都贴它们对应的几何元素旁；param ratio 87× 直接标在两块之间
Q5: 全用 var(--dia-*)；标签都英文，中英版可共用
-->
<div class="diagram">
<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Helix dual-system architecture with size-meaningful blocks">
  <defs>
    <marker id="hlx-a-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Dual-system — 7B 慢脑驱动 80M 快手</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">参数比 ~87× · 频率比 ~30× · 通过 256-d latent 异步通信</text>

  <!-- Cameras + state input (left) -->
  <rect x="30" y="135" width="120" height="80" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="90" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-stroke)">观测</text>
  <text x="90" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">2 head cams</text>
  <text x="90" y="196" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">+ 50-d joints</text>
  <text x="90" y="212" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">@ 200 Hz</text>

  <!-- System 2: BIG accent block — 7B (high) -->
  <rect x="200" y="70" width="260" height="160" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2.5"/>
  <rect x="200" y="70" width="6" height="160" fill="var(--dia-accent)"/>
  <text x="330" y="100" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="16" fill="var(--dia-accent-deep)">System 2 · VLM</text>
  <text x="330" y="125" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="22" fill="var(--dia-accent-deep)">7B</text>
  <text x="330" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">PaliGemma-style</text>
  <text x="330" y="170" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">~150 ms inference</text>
  <text x="330" y="188" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">7-9 Hz</text>
  <text x="330" y="212" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">"该做什么 / 抓哪个"</text>

  <!-- System 1: small green block — 80M (mid-low) -->
  <rect x="240" y="270" width="120" height="58" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="2"/>
  <rect x="240" y="270" width="4" height="58" fill="var(--dia-green)"/>
  <text x="300" y="288" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="13" fill="var(--dia-green)">System 1</text>
  <text x="300" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="600" font-size="14" fill="var(--dia-green)">80M · 200 Hz</text>
  <text x="300" y="322" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">5 ms · "怎么动每个关节"</text>

  <!-- Latent: narrow channel between S2 and S1 -->
  <path d="M 330 230 L 330 270" stroke="var(--dia-gold)" stroke-width="3" fill="none"/>
  <circle cx="330" cy="250" r="9" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="2"/>
  <text x="350" y="254" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)">256-d latent</text>
  <text x="350" y="268" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">意图向量</text>

  <!-- Input → S2 -->
  <path d="M 150 165 L 200 130" stroke="var(--dia-stroke-soft)" stroke-width="1.4" marker-end="url(#hlx-a-arr)"/>
  <!-- Input → S1 (direct, important — S1 also reads observation) -->
  <path d="M 150 195 C 200 250 220 290 240 295" stroke="var(--dia-stroke-soft)" stroke-width="1.4" fill="none" marker-end="url(#hlx-a-arr)"/>
  <text x="180" y="265" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">direct观测</text>

  <!-- S1 → action -->
  <rect x="540" y="277" width="180" height="44" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="630" y="295" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-blue)">35-DOF actions</text>
  <text x="630" y="312" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">arm + hand + waist + base</text>
  <path d="M 360 299 L 540 299" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#hlx-a-arr)"/>

  <!-- Param ratio callout -->
  <text x="530" y="105" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-accent-deep)">7B / 80M ≈ 87×</text>
  <text x="530" y="125" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">box 面积反映此参数差</text>
  <text x="530" y="142" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">(linear scale 受限,无法完整展示)</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — S2 (7B accent block) 通过窄 latent 信道喂养 S1 (80M green block);S1 同时直接读取观测,在 S2 没更新时仍能高频输出 actions。</p>

<!-- SVG-DESIGN-NOTES
Type: C (过程 / 双时序对齐)
Q0: System 1 跑 200 Hz 是 System 2 7 Hz 的 ~30 倍——S1 在 S2 每次更新之间重复使用同一个 latent 30 步
Q1: 两条平行水平时间轴 (X = 时间 ms)；S2 轴上稀疏 accent 高 ticks (每 143ms 一次)；S1 轴上密集 green 矮 ticks (每 5ms 一次)；垂直 dashed 线连接每个 S2 tick 到下面 30 个 S1 ticks；S2 inference 长 150ms 用透明 accent 长条显示，揭示 inference 占用了大部分 S2 周期
Q2: 去掉标题：看到「一行稀疏长条 + 一行密集短线 + 中间 30:1 标注」——这种异步频率对比是 dual-system 的灵魂，单 net VLA 不存在这种图形
Q3: 删去 dot 之间的连线（每个 tick 自成独立 pulse）；删去 box 外框；仅保留 axes 和 ticks
Q4: 「latent[k]」/「latent[k+1]」直接标在 S2 tick 上方；「30 S1 steps reuse same latent」直接横跨在两条 axes 之间的 dashed 区域；S1 axis 的 5ms 用 brackets 直接圈出一个周期
Q5: 全用 var(--dia-*)；中文标签 "latent 重用周期" 等需要英文版 mirror
-->
<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Helix dual-frequency timing">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">异步频率 — S1 跑 200 Hz 是 S2 7 Hz 的 30 倍</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">每次 S2 latent 更新之间，S1 复用同一 latent 完成 30 步控制</text>

  <!-- Time axis baseline -->
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

  <!-- S2 track label -->
  <text x="68" y="100" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">S2 (7 Hz)</text>
  <text x="68" y="115" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">7B VLM</text>

  <!-- S2 inference duration bars (150ms wide, faded accent) for each S2 cycle -->
  <rect x="80" y="93" width="318" height="22" fill="var(--dia-accent)" opacity="0.18"/>
  <rect x="385" y="93" width="318" height="22" fill="var(--dia-accent)" opacity="0.18"/>
  <!-- S2 pulses (tall accent ticks at t=0, 143ms, 286ms) -->
  <line x1="80" y1="86" x2="80" y2="122" stroke="var(--dia-accent)" stroke-width="3"/>
  <line x1="385" y1="86" x2="385" y2="122" stroke="var(--dia-accent)" stroke-width="3"/>
  <line x1="691" y1="86" x2="691" y2="122" stroke="var(--dia-accent)" stroke-width="3"/>
  <!-- Pulse labels -->
  <text x="80" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">latent[k]</text>
  <text x="385" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">latent[k+1]</text>
  <text x="691" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">latent[k+2]</text>
  <!-- Inference span annotation -->
  <text x="239" y="138" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">~150 ms inference (淡色条)</text>

  <!-- Connection: each S2 pulse drops down dashed to S1 region -->
  <line x1="80" y1="122" x2="80" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <line x1="385" y1="122" x2="385" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>
  <line x1="691" y1="122" x2="691" y2="200" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 4"/>

  <!-- 30:1 callout in middle gap -->
  <text x="232" y="165" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-style="italic" font-size="13" fill="var(--dia-accent-deep)">30 × S1 steps reuse same latent</text>
  <path d="M 80 175 L 380 175" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="1 3"/>
  <path d="M 80 175 L 88 171 M 80 175 L 88 179" stroke="var(--dia-stroke-soft)" stroke-width="1" fill="none"/>
  <path d="M 380 175 L 372 171 M 380 175 L 372 179" stroke="var(--dia-stroke-soft)" stroke-width="1" fill="none"/>

  <!-- S1 track label -->
  <text x="68" y="225" text-anchor="end" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-green)">S1 (200 Hz)</text>
  <text x="68" y="240" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">80M trans</text>

  <!-- S1 dense ticks every 5ms from 0 to 300ms = 60 ticks; just draw a sample regularly -->
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

  <!-- 5ms bracket on first cycle -->
  <path d="M 80 251 L 80 255 L 91 255 L 91 251" stroke="var(--dia-green)" stroke-width="1" fill="none"/>
  <text x="85" y="269" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">5 ms</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — 时间轴显示 S2 (accent, 7 Hz, 150 ms 推理) 与 S1 (green, 200 Hz, 5 ms 推理) 的频率比 ≈ 30:1。每次 S2 latent 更新之间，S1 都复用同一 latent 完成 30 步控制。</p>

### 3.1 System 2 (VLM, 7-9 Hz)

- VLM backbone: 7B (Figure 不公开但说类似 PaliGemma)
- 输入: 摄像头 + 任务指令
- 输出: **256-d latent 意图向量**
- 速度: 100-150ms 推理,**7-9 Hz**
- 任务: 高层 — 应该往哪移动、抓什么物体

### 3.2 System 1 (Motor, 200 Hz)

- 80M Transformer (8 layer, hidden 256)
- 输入: 当前 frame + joint state + System 2 latent
- 输出: 35-DOF action(arm + hand + waist + base)
- 速度: 5ms 推理,**200 Hz**
- 任务: 低层 — 怎么实时调整每个关节

### 3.3 异步通信

- System 2 跑 7 Hz,System 1 跑 200 Hz → 比例约 1:30
- System 1 在 System 2 没更新的 30 step 内仍用旧 latent
- System 2 latent **平滑更新**(经过 1-3 step blend)

---

## 4. 训练 Pipeline

### 4.1 数据收集

- 真机 teleoperation:Figure 02 数据,数千小时
- 数据 type:bimanual manipulation + locomotion

### 4.2 联合训练

System 1 + System 2 **同时训** (不像 RT-2 那样分阶段):

$$\mathcal{L} = \mathcal{L}_{\text{action}}(\text{S1 output}, \text{demo action}) + \alpha \cdot \mathcal{L}_{\text{aux}}(\text{S2 latent})$$

辅助 loss 防止 latent collapse。

### 4.3 Single Network

Figure 强调:**Helix 是单个 generalist model**,不为每个任务训不同 weight。

---

## 5. 性能 (Figure 公开 demo)

### 5.1 标志任务

- **多机协调**: 两台 Figure 02 配合洗碗(一台拿碗,另一台擦)
- **零样本物品**: 把没见过的水果归类(unseen objects 也成功)
- **长 horizon**: 5 分钟+ 持续多步骤任务
- **语言驱动**: "把红色物品放左,蓝色放右"

### 5.2 性能数据

Figure 内部说法,2025-Q1 demo 数据:
- 单步任务成功 90%+
- 5-task chain 70%+
- 推理 latency S2 150ms / S1 5ms

---

## 6. 与其他 VLA 对比

| 模型 | Architecture | 速度 (Hz) | Multi-system | 真机部署 |
|---|---|---|---|---|
| RT-2 | 55B 单 net | 5 | 否 | Google 内部 |
| π0 | 3B 单 net | 12 | 否 | PI 实验 |
| **Helix** | **7B + 80M dual** | **7 / 200** | **✅** | **Figure 02 生产** |
| OpenVLA | 7B 单 net | 10 | 否 | 开源 demo |
| RDT-1B | 1B 单 net | 7 | 否 | 清华实验 |

Helix 是**唯一公开**部署 dual-system 设计的 VLA。

---

## 7. PyTorch 概念实现

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
        self.img_proj = nn.Linear(512, 256)  # small CNN feature
        self.state_proj = nn.Linear(50, 256)
        self.action_head = nn.Linear(256, 35)
    
    def forward(self, image_feat, joint_state, s2_latent):
        # ~5ms forward
        img = self.img_proj(image_feat)
        state = self.state_proj(joint_state)
        tokens = torch.stack([img, state, s2_latent], dim=1)  # (B, 3, 256)
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

## 8. 优势 / 劣势

### 8.1 优势

- ✅ **解 200 Hz vs 7B VLM 两难**
- ✅ **生产部署** (Figure 02 真机)
- ✅ **多任务一个 weight**

### 8.2 劣势

- ❌ **不开源** (Figure 完全闭源)
- ❌ S2 latent 信息有损 (256-d 概括 7B 输出)
- ❌ 训练复杂度高(双 net 同步)
- ❌ Figure 数据私有,无法独立验证

---

## 9. 历史 timeline

- **2024 年中** — Figure 内部 Helix V1
- **2024-12** — Figure 02 上市
- **2025-02** — Helix 正式发布 + 多个 demo 视频
- **2025-Q2** — 与 BMW 合作汽车工厂部署
- **2025+** — Figure 03 发布?

---

## 10. Common Pitfalls

### 10.1 Latency 不匹配

S1 落后 S2 latent 30 step,任务突变时反应慢 ~150ms。Figure 用 "smooth blend" 缓解。

### 10.2 数据私有

不能独立验证 Helix 性能。学界用 OpenVLA + 蒸馏到小 net 复现思路。

### 10.3 dual-system 不是新概念

System 1 / System 2 想法源自 Kahneman 心理学。Helix 是工程落地,但理论上 dual / hierarchical RL 早就有 (HRL, options framework)。

### 10.4 实时 5ms 极限

200 Hz 留 5ms 给 net,实际要 < 3ms (留时间给 IO)。GPU 调度延迟可能 spike。

### 10.5 公平比较难

Helix 与 π0 都说自己 best;评估场景不同,公平比较缺乏 standard。

---

## 11. Related Concepts

- **同节**:[VLA 模型](../01_Foundations/VLA模型.md)、[π0](Pi0_Physical_Intelligence.md)、[Octo](Octo_Foundation_Policy.md)、[RT-2 / OpenVLA](RT2_OpenVLA.md)、[RDT-1B](RDT_1B.md)
- **人形机器人**:[1X World Model](https://jeffliulab.github.io/ai-notes/01_AI/03_Frontiers/03_World_Models/1X_World_Model/)、[人形 form factor](../../08_Humanoids/index.md)
- **行为分层**:[Advanced RL](https://jeffliulab.github.io/ai-notes/04_Reinforcement_Learning/05_Advanced_RL/)

---

## References

1. **Figure AI** — "Helix: A Vision-Language-Action Model for Generalist Humanoid Control." February 2025.
2. **Adcock, B.** — Brett Adcock Helix announcement video, 2025.
3. **Brohan, A. et al.** "RT-2." *CoRL*, 2023.
4. **Black, K. et al.** "π0." 2024.
5. **Kahneman, D.** *Thinking, Fast and Slow*. 2011. (dual-system 心理学基础)
