# SLAM：同时定位与建图

## 概述

SLAM（Simultaneous Localization and Mapping）是机器人在未知环境中同时估计自身位姿和构建环境地图的问题。它是移动机器人自主导航的核心技术。

**SLAM 问题的概率表述：**

$$
p(x_{1:t}, m \mid z_{1:t}, u_{1:t})
$$

其中：

| 符号 | 含义 |
|------|------|
| $x_{1:t}$ | 从时刻 1 到 $t$ 的机器人位姿序列 |
| $m$ | 环境地图 |
| $z_{1:t}$ | 传感器观测序列 |
| $u_{1:t}$ | 控制输入（里程计）序列 |

<!-- SVG-DESIGN-NOTES
Type: A (结构 — 因子图 / 位姿图 + 路标 + 回环约束)
Q0: SLAM 问题的图模型本质:机器人位姿 x_t (节点链) + 路标 m (旁支节点) 通过 odometry edge / observation edge / loop closure edge 联合约束
Q1: 水平 pose 节点链 (x_1..x_t),上方有几个 landmark 圆,每个 x_i 通过 observation edge 连到几个 landmark;某两个非相邻 pose 间画一条 loop closure edge (虚线高亮);旁边给概率公式
Q2: 去标题:连续的方形 pose 链 + 圆形 landmark + 一条跳跃式的 loop closure 弧 = SLAM 因子图 DNA
Q3: 删去原 720×200 viewBox 但 box 到 1100 (越界);改为因子图几何
Q4: x_t / m_j / odometry / observation / loop closure 直接标在元素上
Q5: 全用 var(--dia-*);英文版镜像
-->
<div class="diagram">
<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SLAM 因子图 — pose 链 + landmark + loop closure">
  <defs>
    <marker id="slam-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">SLAM — 因子图：位姿链 + 路标 + 回环</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">三种约束：odometry (相邻 x) · observation (x↔m) · loop closure (跨越式)</text>

  <!-- Landmarks (top, circles) -->
  <g font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">
    <circle cx="160" cy="90" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="160" y="94" text-anchor="middle" font-weight="700">m₁</text>
    <circle cx="340" cy="80" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="340" y="84" text-anchor="middle" font-weight="700">m₂</text>
    <circle cx="540" cy="100" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="540" y="104" text-anchor="middle" font-weight="700">m₃</text>
    <circle cx="700" cy="80" r="18" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.6"/>
    <text x="700" y="84" text-anchor="middle" font-weight="700">m₄</text>
  </g>

  <!-- Pose chain (bottom, squares) -->
  <g font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">
    <rect x="84" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="102" y="254" text-anchor="middle" font-weight="700">x₁</text>
    <rect x="194" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="212" y="254" text-anchor="middle" font-weight="700">x₂</text>
    <rect x="304" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="322" y="254" text-anchor="middle" font-weight="700">x₃</text>
    <rect x="414" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="432" y="254" text-anchor="middle" font-weight="700">x₄</text>
    <rect x="524" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="542" y="254" text-anchor="middle" font-weight="700">x₅</text>
    <rect x="634" y="232" width="36" height="36" rx="2" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.6"/>
    <text x="652" y="254" text-anchor="middle" font-weight="700">x_t</text>
  </g>

  <!-- Odometry edges (between adjacent poses, control input) -->
  <line x1="120" y1="250" x2="194" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="230" y1="250" x2="304" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="340" y1="250" x2="414" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="450" y1="250" x2="524" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <line x1="560" y1="250" x2="634" y2="250" stroke="var(--dia-stroke)" stroke-width="1.4" marker-end="url(#slam-arr)"/>
  <text x="158" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₂</text>
  <text x="268" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₃</text>
  <text x="378" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₄</text>
  <text x="488" y="284" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">u₅</text>

  <!-- Observation edges (poses to landmarks, dotted thin lines) -->
  <line x1="102" y1="232" x2="155" y2="108" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="212" y1="232" x2="160" y2="108" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="212" y1="232" x2="335" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="322" y1="232" x2="340" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="432" y1="232" x2="540" y2="118" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="542" y1="232" x2="540" y2="118" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="542" y1="232" x2="695" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="652" y1="232" x2="700" y2="98" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>

  <!-- Loop closure (x_t back to x_1, big arc) -->
  <path d="M 652 268 Q 380 340 102 268" fill="none" stroke="var(--dia-accent-deep)" stroke-width="2" stroke-dasharray="6 3"/>
  <text x="380" y="335" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="11" fill="var(--dia-accent-deep)">loop closure ⤴</text>
  <text x="380" y="350" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-accent-deep)">x_t 与 x₁ 同地 — 修正累积漂移</text>

  <!-- Legend -->
  <g transform="translate(60 140)" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke)">
    <rect x="0" y="0" width="14" height="14" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
    <text x="20" y="11">pose x_t</text>
    <circle cx="100" cy="6" r="7" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.2"/>
    <text x="112" y="11">landmark m_j</text>
    <line x1="200" y1="6" x2="220" y2="6" stroke="var(--dia-stroke)" stroke-width="1.4"/>
    <text x="226" y="11">odometry edge</text>
    <line x1="320" y1="6" x2="340" y2="6" stroke="var(--dia-green)" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="346" y="11">observation</text>
    <line x1="440" y1="6" x2="460" y2="6" stroke="var(--dia-accent-deep)" stroke-width="2" stroke-dasharray="6 3"/>
    <text x="466" y="11">loop closure</text>
  </g>
</svg>
</div>
<p class="figure-caption">Figure — SLAM 的因子图 DNA：底部蓝方块是位姿链，顶部绿圆是路标；odometry edge 沿链相邻、observation edge 跨链到路标、loop closure edge (红弧) 跳跃式连接同地点的不同时刻，是修正累积漂移的关键。</p>


---

## 1 SLAM 的数学基础

### 1.1 运动模型

$$
x_t = f(x_{t-1}, u_t) + w_t, \quad w_t \sim \mathcal{N}(0, R_t)
$$

### 1.2 观测模型

$$
z_t = h(x_t, m) + v_t, \quad v_t \sim \mathcal{N}(0, Q_t)
$$

### 1.3 SLAM 的两种形式

| 形式 | 估计量 | 方法 |
|------|--------|------|
| **Online SLAM** | $p(x_t, m \mid z_{1:t}, u_{1:t})$ | EKF-SLAM, 粒子滤波 |
| **Full SLAM** | $p(x_{1:t}, m \mid z_{1:t}, u_{1:t})$ | 图优化 |

---

## 2 基于滤波的 SLAM

### 2.1 EKF-SLAM

EKF-SLAM 是最经典的 SLAM 方法，维护一个包含机器人位姿和所有路标位置的联合高斯分布。

**状态向量：**

$$
\hat{\mu}_t = \begin{bmatrix} x_t \\ m_1 \\ m_2 \\ \vdots \\ m_N \end{bmatrix}, \quad
\Sigma_t = \begin{bmatrix}
\Sigma_{xx} & \Sigma_{xm_1} & \cdots & \Sigma_{xm_N} \\
\Sigma_{m_1 x} & \Sigma_{m_1 m_1} & \cdots & \Sigma_{m_1 m_N} \\
\vdots & & \ddots & \vdots \\
\Sigma_{m_N x} & & \cdots & \Sigma_{m_N m_N}
\end{bmatrix}
$$

**预测步（运动更新）：**

$$
\bar{\mu}_t = f(\hat{\mu}_{t-1}, u_t)
$$

$$
\bar{\Sigma}_t = F_t \Sigma_{t-1} F_t^T + R_t
$$

**更新步（观测更新）：**

$$
K_t = \bar{\Sigma}_t H_t^T (H_t \bar{\Sigma}_t H_t^T + Q_t)^{-1}
$$

$$
\hat{\mu}_t = \bar{\mu}_t + K_t (z_t - h(\bar{\mu}_t))
$$

$$
\Sigma_t = (I - K_t H_t) \bar{\Sigma}_t
$$

其中 $F_t = \frac{\partial f}{\partial x}\big|_{\hat{\mu}_{t-1}}$，$H_t = \frac{\partial h}{\partial x}\big|_{\bar{\mu}_t}$ 为雅可比矩阵。

**EKF-SLAM 的局限性：**

- 计算复杂度 $O(N^2)$（$N$ 为路标数），不适合大规模环境
- 线性化误差导致不一致
- 数据关联错误难以恢复

### 2.2 粒子滤波 SLAM（FastSLAM）

FastSLAM（Montemerlo et al., 2002）利用 **Rao-Blackwellized 粒子滤波**，将 SLAM 问题分解为：

$$
p(x_{1:t}, m \mid z_{1:t}, u_{1:t}) = p(x_{1:t} \mid z_{1:t}, u_{1:t}) \prod_{j=1}^{N} p(m_j \mid x_{1:t}, z_{1:t})
$$

- 用粒子表示路径后验 $p(x_{1:t} \mid \cdot)$
- 每个粒子维护独立的地图（EKF 更新每个路标）

**优势：**

- 计算复杂度 $O(M \log N)$（$M$ 粒子数，$N$ 路标数）
- 天然处理多模态分布
- 数据关联可以每个粒子独立处理

---

## 3 视觉 SLAM

### 3.1 概述

视觉 SLAM 使用相机作为主传感器，分为：

- **特征法**：提取特征点，基于几何约束估计位姿
- **直接法**：直接利用像素灰度值优化位姿
- **半直接法**：结合两者优点（如 SVO）

### 3.2 ORB-SLAM3 系统

ORB-SLAM3（Campos et al., 2021）是目前最完整的开源视觉 SLAM 系统，支持单目、双目、RGB-D 和视觉惯性模式。

**系统流程：**

<!-- SVG-DESIGN-NOTES
Type: A (结构 — ORB-SLAM3 三并发线程 + 共享地图)
Q0: ORB-SLAM3 的灵魂是「三个不同频率的并发线程共享同一张地图」——Tracking (30 Hz, 每帧) / Local Mapping (按 keyframe 触发) / Loop Closing (DBoW2 慢)
Q1: 三条并行垂直泳道 (频率从高到低、宽度递减) 各自含 1-2 个 box;中央有"共享 Map (KeyFrames + MapPoints + Covisibility Graph)" 容器;三个泳道都连入中央
Q2: 去标题:三泳道颜色不同 + 中央共享 map 容器 + 频率从高到低 = ORB-SLAM3 三线程 DNA
Q3: 删去原 560×860 viewBox 12 个等大方框 + 杂乱交叉箭头
Q4: 频率/职责/输出直接标在泳道内
Q5: 全用 var(--dia-*);英文版镜像
-->
<div class="diagram">
<svg viewBox="0 0 820 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ORB-SLAM3 三并发线程 + 共享 Map">
  <defs>
    <marker id="orb-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke)"/>
    </marker>
  </defs>
  <text x="410" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">ORB-SLAM3 — 三并发线程共享同一张 Map</text>
  <text x="410" y="44" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Tracking 30 Hz · Local Mapping (per-keyframe) · Loop Closing (DBoW2 query)</text>

  <!-- Lane 1: Tracking (left, blue) -->
  <rect x="40" y="76" width="200" height="280" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="140" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-blue)">Tracking 线程</text>
  <text x="140" y="110" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-blue)">30 Hz / 每帧</text>
  <rect x="60" y="124" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="140" y="144" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">ORB 特征提取</text>
  <rect x="60" y="166" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="140" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">恒速模型预测</text>
  <rect x="60" y="208" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="140" y="228" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">PnP 帧间位姿</text>
  <rect x="60" y="250" width="160" height="32" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="140" y="270" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-accent-deep)">关键帧决策</text>
  <text x="140" y="304" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">输入: image_t</text>
  <text x="140" y="318" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">输出: T_cam_t, new KF?</text>

  <!-- Center: shared Map -->
  <rect x="280" y="100" width="240" height="220" rx="8" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke)" stroke-width="2.4"/>
  <text x="400" y="124" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-stroke)">共享 Map</text>
  <text x="400" y="144" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">(Atlas, ORB-SLAM3 创新)</text>
  <!-- KeyFrames row -->
  <text x="400" y="174" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">KeyFrames</text>
  <g fill="var(--dia-blue)">
    <rect x="306" y="180" width="14" height="14" rx="1"/>
    <rect x="328" y="180" width="14" height="14" rx="1"/>
    <rect x="350" y="180" width="14" height="14" rx="1"/>
    <rect x="372" y="180" width="14" height="14" rx="1"/>
    <rect x="394" y="180" width="14" height="14" rx="1"/>
    <rect x="416" y="180" width="14" height="14" rx="1"/>
    <rect x="438" y="180" width="14" height="14" rx="1"/>
    <rect x="460" y="180" width="14" height="14" rx="1"/>
    <rect x="482" y="180" width="14" height="14" rx="1"/>
  </g>
  <!-- MapPoints row -->
  <text x="400" y="224" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">MapPoints (绿色)</text>
  <g fill="var(--dia-green)">
    <circle cx="304" cy="240" r="3"/>
    <circle cx="324" cy="244" r="3"/>
    <circle cx="346" cy="238" r="3"/>
    <circle cx="364" cy="246" r="3"/>
    <circle cx="384" cy="240" r="3"/>
    <circle cx="404" cy="244" r="3"/>
    <circle cx="424" cy="238" r="3"/>
    <circle cx="444" cy="246" r="3"/>
    <circle cx="464" cy="242" r="3"/>
    <circle cx="486" cy="240" r="3"/>
  </g>
  <!-- Covisibility graph -->
  <text x="400" y="276" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Covisibility Graph</text>
  <g stroke="var(--dia-stroke-soft)" stroke-width="0.8" fill="none">
    <line x1="320" y1="294" x2="360" y2="304"/>
    <line x1="360" y1="304" x2="400" y2="290"/>
    <line x1="400" y1="290" x2="440" y2="300"/>
    <line x1="440" y1="300" x2="480" y2="288"/>
    <line x1="320" y1="294" x2="400" y2="290"/>
    <line x1="360" y1="304" x2="440" y2="300"/>
  </g>
  <g fill="var(--dia-stroke-soft)">
    <circle cx="320" cy="294" r="2.5"/>
    <circle cx="360" cy="304" r="2.5"/>
    <circle cx="400" cy="290" r="2.5"/>
    <circle cx="440" cy="300" r="2.5"/>
    <circle cx="480" cy="288" r="2.5"/>
  </g>

  <!-- Lane 2: Local Mapping (right, green) -->
  <rect x="560" y="76" width="180" height="130" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="650" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-green)">Local Mapping</text>
  <text x="650" y="110" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-green)">per new keyframe</text>
  <rect x="580" y="124" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="650" y="142" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">三角化新 MapPoints</text>
  <rect x="580" y="160" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="650" y="178" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">局部 Bundle Adjust</text>

  <!-- Lane 3: Loop Closing (right-bottom, accent) -->
  <rect x="560" y="226" width="180" height="130" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="650" y="244" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="13" fill="var(--dia-accent-deep)">Loop Closing</text>
  <text x="650" y="260" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--dia-accent-deep)">low rate (DBoW2)</text>
  <rect x="580" y="274" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="650" y="292" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">词袋检索 + Sim(3)</text>
  <rect x="580" y="310" width="140" height="28" rx="3" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.2"/>
  <text x="650" y="328" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">位姿图 + 全局 BA</text>

  <!-- Arrows from lanes to map (all read/write the shared map) -->
  <line x1="240" y1="266" x2="278" y2="220" stroke="var(--dia-blue)" stroke-width="1.4" marker-end="url(#orb-arr)"/>
  <line x1="558" y1="160" x2="522" y2="200" stroke="var(--dia-green)" stroke-width="1.4" marker-end="url(#orb-arr)"/>
  <line x1="558" y1="296" x2="522" y2="260" stroke="var(--dia-accent)" stroke-width="1.4" marker-end="url(#orb-arr)"/>
</svg>
</div>
<p class="figure-caption">Figure — ORB-SLAM3 的几何 DNA：三个并发线程 (Tracking 30 Hz / Local Mapping per-KF / Loop Closing 慢) 围绕中央共享 Map (Atlas) 各自读写；线程频率不同但通过 Map 容器解耦。</p>


**核心模块：**

**1. 特征提取**

使用 ORB（Oriented FAST and Rotated BRIEF）特征：

- FAST 角点检测 + 方向计算
- rBRIEF 描述子（256-bit 二进制）
- 图像金字塔实现尺度不变性
- 提取速度快，匹配使用汉明距离

**2. 跟踪（Tracking）**

- 恒速模型预测初始位姿
- 特征匹配 + PnP 求解
- 局部地图跟踪：与局部地图点匹配，优化当前位姿
- 关键帧选择策略

**3. 局部建图（Local Mapping）**

- 新关键帧插入
- 地图点三角化
- 局部 Bundle Adjustment

$$
\min_{\{T_i\}, \{p_j\}} \sum_{i,j} \rho\left(\|z_{ij} - \pi(T_i, p_j)\|^2_{\Sigma_{ij}}\right)
$$

其中 $\pi$ 为投影函数，$\rho$ 为鲁棒核函数（如 Huber）。

**4. 回环检测（Loop Closing）**

- 基于词袋模型（DBoW2）的图像相似度检索
- 几何验证（RANSAC + Sim(3)/SE(3)）
- 位姿图优化（修正累积漂移）
- 可选的全局 BA

### 3.3 视觉惯性 SLAM（VIO）

融合 IMU 预积分：

$$
\Delta R_{ij} = \prod_{k=i}^{j-1} \text{Exp}((\omega_k - b_g) \Delta t)
$$

$$
\Delta v_{ij} = \sum_{k=i}^{j-1} \Delta R_{ik} (a_k - b_a) \Delta t
$$

$$
\Delta p_{ij} = \sum_{k=i}^{j-1} \Delta v_{ik} \Delta t + \frac{1}{2} \Delta R_{ik} (a_k - b_a) \Delta t^2
$$

VIO 系统能在纹理贫乏和快速运动场景下保持鲁棒性。

---

## 4 LiDAR SLAM

### 4.1 概述

LiDAR SLAM 使用激光雷达获取精确的 3D 点云（参见 [传感器](../../01_Robot_Engineering/15_Hardware_Overview/传感器.md)），适合大规模室外环境。

### 4.2 LOAM（Lidar Odometry and Mapping）

LOAM（Zhang & Singh, 2014）是影响力最大的 LiDAR SLAM 算法之一。

**核心思想**：将问题分为高频里程计和低频建图两个模块。

**特征提取**：

- 边缘点（Edge points）：曲率大的点
- 平面点（Planar points）：曲率小的点

**点到边缘/平面距离最小化**：

边缘点残差：

$$
d_e = \frac{|(p_i - p_a) \times (p_i - p_b)|}{|p_a - p_b|}
$$

平面点残差：

$$
d_p = \frac{(p_i - p_a) \cdot ((p_a - p_b) \times (p_a - p_c))}{|(p_a - p_b) \times (p_a - p_c)|}
$$

### 4.3 Cartographer

Google Cartographer（Hess et al., 2016）是一个广泛使用的 2D/3D SLAM 系统。

**前端**：

- Submap 构建：使用 scan matching 将新扫描插入子图
- 局部优化：Ceres Solver 求解扫描匹配

**后端**：

- 回环检测：分支定界搜索
- 位姿图优化：Sparse Pose Adjustment (SPA)

### 4.4 其他 LiDAR SLAM 系统

| 系统 | 特点 |
|------|------|
| LeGO-LOAM | 地面分割 + 轻量级 LOAM |
| LIO-SAM | 紧耦合 LiDAR-IMU，因子图优化 |
| FAST-LIO2 | 紧耦合，iKD-tree 加速，高效 |
| CT-ICP | 连续时间 ICP，处理运动畸变 |

---

## 5 图优化 SLAM

### 5.1 位姿图优化

将 SLAM 建模为图优化问题：

- **节点**：机器人位姿 $x_i$
- **边**：位姿间的相对约束 $z_{ij}$（里程计、回环检测）

**优化目标：**

$$
x^* = \arg\min_x \sum_{(i,j) \in \mathcal{E}} \|e_{ij}(x_i, x_j)\|^2_{\Omega_{ij}}
$$

其中误差函数：

$$
e_{ij} = z_{ij}^{-1} \oplus (x_i^{-1} \oplus x_j)
$$

$\Omega_{ij}$ 为信息矩阵（协方差的逆）。

### 5.2 因子图

因子图是一种更通用的图模型表示：

- **变量节点**：待估计的状态（位姿、路标、传感器偏置等）
- **因子节点**：约束（先验、里程计、观测、回环）

$$
p(X) \propto \prod_k f_k(X_k)
$$

**常见因子类型**：

| 因子 | 连接变量 | 信息来源 |
|------|----------|----------|
| 先验因子 | $x_0$ | 初始位姿 |
| 里程计因子 | $x_{t-1}, x_t$ | 轮式/视觉/惯性里程计 |
| 路标观测因子 | $x_t, l_j$ | 相机/LiDAR 观测 |
| 回环因子 | $x_i, x_j$ | 回环检测 |
| IMU 预积分因子 | $x_i, x_j, v_i, v_j, b_i$ | IMU 数据 |
| GPS 因子 | $x_t$ | GPS 定位 |

### 5.3 求解方法

图优化问题最终转化为非线性最小二乘：

$$
\min_x \sum_k \|r_k(x)\|^2_{\Sigma_k}
$$

使用 Gauss-Newton 或 Levenberg-Marquardt 迭代求解：

$$
(J^T \Sigma^{-1} J) \Delta x = -J^T \Sigma^{-1} r
$$

!!! note "稀疏性"
    SLAM 问题的信息矩阵 $H = J^T \Sigma^{-1} J$ 是 **稀疏** 的（因为只有相邻/共视关系的变量之间有约束）。利用稀疏 Cholesky 分解可以高效求解。

**常用优化库**：

- **g2o**：通用图优化框架
- **GTSAM**：基于因子图，支持增量优化（iSAM2）
- **Ceres Solver**：通用非线性最小二乘求解器

---

## 6 学习增强的 SLAM

### 6.1 深度估计

- **MonoDepth2**：自监督单目深度估计
- **DPT**：基于 Transformer 的深度预测

### 6.2 特征提取与匹配

- **SuperPoint**：自监督关键点检测
- **SuperGlue**：基于 Graph Neural Network 的特征匹配
- **LightGlue**：轻量级特征匹配

### 6.3 端到端学习 SLAM

**DROID-SLAM**（Teed & Deng, 2021）：

- 基于 RAFT 光流网络的稠密匹配
- 可微分的 Bundle Adjustment 层
- 端到端训练，泛化能力强

$$
\min_{\{T_i\}, \{d_j\}} \sum_{(i,j)} \|p_{ij}^* - \Pi(T_i \cdot T_j^{-1}, d_j)\|^2_{\Sigma_{ij}}
$$

其中 $p_{ij}^*$ 为网络预测的对应点，可微分优化通过展开迭代实现梯度传播。

### 6.4 隐式表示

- **iMAP**：使用 NeRF 作为地图表示
- **NICE-SLAM**：层次化隐式表示
- **SplaTAM**：基于 3D Gaussian Splatting 的 SLAM

---

## 7 SLAM 评估指标

### 7.1 轨迹精度

**绝对轨迹误差（ATE）：**

$$
\text{ATE} = \sqrt{\frac{1}{N}\sum_{i=1}^{N} \|p_i^{\text{est}} - p_i^{\text{gt}}\|^2}
$$

**相对位姿误差（RPE）：**

$$
\text{RPE}_i = (T_i^{\text{gt}})^{-1} T_{i+\Delta}^{\text{gt}} \cdot ((T_i^{\text{est}})^{-1} T_{i+\Delta}^{\text{est}})^{-1}
$$

### 7.2 标准数据集

| 数据集 | 传感器 | 场景 |
|--------|--------|------|
| KITTI | 双目 + LiDAR + GPS | 室外驾驶 |
| EuRoC | 双目 + IMU | 室内无人机 |
| TUM-RGBD | RGB-D | 室内手持 |
| Newer College | 多 LiDAR + 相机 | 室外步行 |

### 7.3 评估工具

- **evo**：Python 轨迹评估工具包
- **rpg_trajectory_evaluation**：ETH 开发的评估工具

---

## 8 系统集成

SLAM 系统通常运行在 ROS/ROS2 框架下（参见 [ROS2](../../03_Sim2Real/03_Ecosystem/ROS2.md)），与导航栈协同：

- SLAM 提供位姿估计和地图
- 导航栈基于地图进行路径规划
- 控制器执行运动命令

传感器的选型和标定对 SLAM 性能至关重要（参见 [传感器](../../01_Robot_Engineering/15_Hardware_Overview/传感器.md)）。

---

## 参考文献

1. Thrun, S., Burgard, W. & Fox, D. (2005). *Probabilistic Robotics*. MIT Press.
2. Cadena, C. et al. (2016). Past, present, and future of simultaneous localization and mapping. *IEEE TRO*.
3. Campos, C. et al. (2021). ORB-SLAM3: An accurate open-source library for visual, visual-inertial and multi-map SLAM. *IEEE TRO*.
4. Zhang, J. & Singh, S. (2014). LOAM: Lidar Odometry and Mapping in Real-time. *RSS*.
5. Teed, Z. & Deng, J. (2021). DROID-SLAM: Deep Visual SLAM for Monocular, Stereo, and RGB-D Cameras. *NeurIPS*.
6. Grisetti, G. et al. (2010). A tutorial on graph-based SLAM. *IEEE ITSM*.
