# IMU 综述

## 什么是 IMU

IMU（Inertial Measurement Unit，惯性测量单元）是一种测量物体加速度和角速度的传感器模块。它是机器人导航、姿态估计和运动控制的核心传感器之一，几乎存在于所有移动机器人平台中。

## 传感器组成

### 加速度计（Accelerometer）

**原理**：基于 MEMS 弹簧-质量块系统。当传感器加速时，质量块由于惯性产生相对位移，通过电容变化检测位移量。

$$
F = ma \quad \Rightarrow \quad a = \frac{F}{m} = \frac{k \cdot \Delta x}{m}
$$

其中：

- $k$ 为弹簧刚度
- $\Delta x$ 为质量块位移
- $m$ 为质量块质量

**测量内容**：比力（Specific Force），即重力 + 运动加速度：

$$
\mathbf{f} = \mathbf{a} - \mathbf{g}
$$

!!! warning "重力的影响"
    加速度计在静止时测量到的是重力加速度 $g \approx 9.81 \, \text{m/s}^2$。在使用加速度计进行导航时，必须从测量值中减去重力分量，这需要精确知道传感器的姿态。

### 陀螺仪（Gyroscope）

**原理**：基于科里奥利效应（Coriolis Effect）。一个振动的质量块在旋转参考系中会受到科里奥利力：

$$
\mathbf{F}_c = -2m(\boldsymbol{\omega} \times \mathbf{v})
$$

其中：

- $m$ 为振动质量
- $\boldsymbol{\omega}$ 为角速度
- $\mathbf{v}$ 为振动速度

MEMS 陀螺仪让质量块在一个方向上持续振动，当存在旋转时，科里奥利力会在垂直方向产生位移，通过电容检测得到角速度。

**测量内容**：三轴角速度 $(\omega_x, \omega_y, \omega_z)$，单位 °/s 或 rad/s。

### 磁力计（Magnetometer）

**原理**：利用霍尔效应或磁阻效应测量地球磁场方向。

**测量内容**：三轴磁场强度，可用于计算航向角（Yaw）。

**局限性**：

- 受铁磁材料干扰（硬铁/软铁误差）
- 室内环境磁场不均匀
- 需要校准（椭球拟合）

### IMU 配置分类

| 类型 | 传感器组合 | 可测量 | 代表产品 |
|------|-----------|--------|----------|
| **6 轴** | 加速度计 + 陀螺仪 | 加速度、角速度 | MPU6050、BMI088 |
| **9 轴** | 加速度计 + 陀螺仪 + 磁力计 | 加速度、角速度、航向 | BNO055、MPU9250 |
| **10 轴** | 9 轴 + 气压计 | 以上 + 高度估计 | BMP388 组合 |

## IMU 噪声模型

IMU 的精度受多种噪声源影响，理解噪声模型对于传感器融合至关重要。

### 主要噪声类型

<!-- SVG-DESIGN-NOTES
Type: B (几何 — IMU 噪声 Allan 方差曲线: 5 段不同斜率)
Q0: IMU 噪声不是 8 个并列的"分类项",而是一条 σ(τ) 曲线上的 5 段斜率特征 — Quantization (-1)、ARW (-1/2)、BI (0)、RRW (+1/2)、Rate Ramp (+1);整条曲线就是"读 datasheet 时直接对应噪声参数"的工程图。
Q1: log-log Allan deviation 曲线 + 5 段斜率虚线 + 关键参数 (ARW 在 τ=1, BI 在 minimum) 直接标在曲线上
Q2: 一条 U 形 + 5 段斜率参考线 — DNA 是"读 IMU datasheet"的标尺
Q3: 删 9 个等大方框 + 8 根树状箭头 (原图把噪声分类当成树)
Q4: ARW 值 / BI 值 直接贴在曲线对应点
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">IMU 陀螺仪噪声 Allan 方差曲线 — 5 段斜率对应 5 类噪声</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">log σ(τ) vs log τ · MPU6050 typical at 1 kHz, 25°C</text>

  <!-- axes: x = log τ 0.001s..10000s maps [80..680]; y = log σ deg/h 0.01..1000 maps [340..70] -->
  <line x1="80" y1="340" x2="680" y2="340" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="340" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="338" x2="80"  y2="344"/><text x="80"  y="358" text-anchor="middle">10⁻³</text>
    <line x1="166" y1="338" x2="166" y2="344"/><text x="166" y="358" text-anchor="middle">0.01</text>
    <line x1="252" y1="338" x2="252" y2="344"/><text x="252" y="358" text-anchor="middle">0.1</text>
    <line x1="337" y1="338" x2="337" y2="344"/><text x="337" y="358" text-anchor="middle">1 s</text>
    <line x1="423" y1="338" x2="423" y2="344"/><text x="423" y="358" text-anchor="middle">10</text>
    <line x1="509" y1="338" x2="509" y2="344"/><text x="509" y="358" text-anchor="middle">100</text>
    <line x1="594" y1="338" x2="594" y2="344"/><text x="594" y="358" text-anchor="middle">1k</text>
    <line x1="680" y1="338" x2="680" y2="344"/><text x="680" y="358" text-anchor="middle">10k s</text>

    <line x1="76" y1="340" x2="84" y2="340"/><text x="72" y="344" text-anchor="end">0.01</text>
    <line x1="76" y1="285" x2="84" y2="285"/><text x="72" y="289" text-anchor="end">0.1</text>
    <line x1="76" y1="230" x2="84" y2="230"/><text x="72" y="234" text-anchor="end">1</text>
    <line x1="76" y1="175" x2="84" y2="175"/><text x="72" y="179" text-anchor="end">10</text>
    <line x1="76" y1="120" x2="84" y2="120"/><text x="72" y="124" text-anchor="end">100</text>
    <line x1="76" y1="65"  x2="84" y2="65" /><text x="72" y="69"  text-anchor="end">1000 °/h</text>
  </g>
  <text x="380" y="380" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">平均时间 τ (s, log)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">Allan deviation σ(τ) °/h (log)</text>

  <!-- 5-slope dashed reference lines (translucent) -->
  <!-- slope -1 (quantization): goes from upper left -->
  <line x1="80" y1="100" x2="252" y2="285" stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.55"/>
  <text x="100" y="95" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">slope −1 · Quantization</text>

  <!-- slope -1/2 (ARW): -->
  <line x1="166" y1="170" x2="423" y2="240" stroke="var(--dia-blue)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="190" y="160" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">slope −1/2 · ARW 白噪声</text>

  <!-- slope 0 (BI): horizontal -->
  <line x1="337" y1="220" x2="509" y2="220" stroke="var(--dia-green)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="408" y="212" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">slope 0 · BI 偏置不稳定性</text>

  <!-- slope +1/2 (RRW): -->
  <line x1="509" y1="222" x2="680" y2="170" stroke="var(--dia-accent)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="600" y="200" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">slope +1/2 · RRW</text>

  <!-- slope +1 (rate ramp): far right rising -->
  <line x1="594" y1="180" x2="680" y2="100" stroke="var(--dia-gold)" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="588" y="108" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">slope +1 · 速率斜坡</text>

  <!-- main curve: U-shaped, passing through all 5 regions -->
  <!-- 0.001 s: σ ≈ 100 (quant) → y=120
       0.01 s: σ ≈ 30 → y=160
       0.1 s: σ ≈ 10 → y=200
       1 s: σ ≈ 3 (ARW point) → y=235
       10 s: σ ≈ 1.2 → y=265
       100 s: σ ≈ 1 (BI minimum) → y=270
       1000 s: σ ≈ 1.4 → y=265
       10000 s: σ ≈ 5 → y=210 -->
  <path d="M 80 120 C 130 145 160 170 252 200 C 300 215 320 225 337 235 C 390 252 423 260 470 268 C 500 271 530 271 594 268 C 620 263 650 245 680 210" stroke="var(--dia-stroke)" stroke-width="2.2" fill="none"/>

  <!-- key annotation points -->
  <!-- ARW = σ(τ=1s): -->
  <circle cx="337" cy="235" r="4" fill="var(--dia-blue)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <line x1="337" y1="235" x2="337" y2="340" stroke="var(--dia-blue)" stroke-width="0.5" stroke-dasharray="1 2" opacity="0.5"/>
  <text x="297" y="225" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">ARW</text>
  <text x="295" y="237" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">≈ 3 °/√h</text>

  <!-- BI = curve minimum -->
  <circle cx="465" cy="271" r="4" fill="var(--dia-green)" stroke="var(--dia-green)" stroke-width="1.2"/>
  <text x="478" y="288" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-green)">BI ≈ 0.9 °/h</text>
  <text x="478" y="302" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">datasheet quote</text>

  <!-- ideal asymptote -->
  <text x="370" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">短 τ → 量化 / 白噪声主导 · 长 τ → 偏置漂移主导</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 一条 Allan 曲线把 IMU 噪声参数压成两个数字:τ=1 s 读 ARW,曲线最低点读 BI;datasheet 上唯一的两个噪声数值就是它们。</p>


### 陀螺仪噪声模型

连续时间模型：

$$
\tilde{\omega}(t) = \omega(t) + b_g(t) + n_g(t)
$$

其中：

- $\tilde{\omega}(t)$ 为测量值
- $\omega(t)$ 为真实角速度
- $b_g(t)$ 为随时间缓慢漂移的偏置
- $n_g(t)$ 为高斯白噪声，$n_g \sim \mathcal{N}(0, \sigma_g^2)$

偏置建模为随机游走：

$$
\dot{b}_g(t) = n_{bg}(t), \quad n_{bg} \sim \mathcal{N}(0, \sigma_{bg}^2)
$$

### 加速度计噪声模型

$$
\tilde{a}(t) = a(t) + b_a(t) + n_a(t)
$$

结构类似陀螺仪，但加速度积分两次得到位置，误差累积更快：

$$
\delta p(t) \propto \frac{1}{2} b_a \cdot t^2 + \frac{1}{6} \sigma_a \cdot t^{5/2}
$$

!!! danger "惯性导航的漂移问题"
    纯惯性导航（仅用 IMU）的位置误差随时间平方增长。消费级 MEMS IMU 在几秒内就会产生米级漂移，因此必须与其他传感器（GPS、LiDAR、视觉）融合使用。

### 关键噪声参数

| 参数 | 符号 | 单位（陀螺） | 单位（加速度计） | 含义 |
|------|------|-------------|-----------------|------|
| 角度/速度随机游走 | ARW / VRW | °/√h | m/s/√h | 白噪声强度 |
| 偏置不稳定性 | BI | °/h | μg | 偏置的最小可检测变化 |
| 偏置重复性 | Turn-on bias | °/h | mg | 每次上电的偏置变化 |
| 标度因子误差 | SF error | ppm | ppm | 测量值的比例误差 |

## Allan 方差分析

Allan 方差是表征 IMU 噪声特性的标准方法，通过对不同平均时间 $\tau$ 计算方差来识别各噪声分量。

$$
\sigma^2(\tau) = \frac{1}{2(N-1)} \sum_{k=1}^{N-1} \left( \bar{y}_{k+1} - \bar{y}_k \right)^2
$$

其中 $\bar{y}_k$ 为第 $k$ 个长度为 $\tau$ 的区间的平均值。

### Allan 方差曲线解读

在 $\log \sigma$ vs $\log \tau$ 图上，不同噪声类型对应不同斜率：

| 噪声类型 | 斜率 | 特征 |
|----------|------|------|
| 量化噪声 | -1 | 短 $\tau$ 时出现 |
| 角度随机游走（ARW） | -1/2 | 白噪声，在 $\tau = 1s$ 读数 |
| 偏置不稳定性（BI） | 0 | 曲线最低点 |
| 速率随机游走（RRW） | +1/2 | 长 $\tau$ 时出现 |
| 速率斜坡 | +1 | 温度漂移等确定性趋势 |

```python
import numpy as np
import allantools

# 从 IMU 静态数据计算 Allan 方差
# data: 陀螺仪某轴的静态采样数据
# rate: 采样率 (Hz)
(taus, adevs, errors, ns) = allantools.oadev(
    data, rate=rate, data_type="freq"
)

# ARW: tau=1 时的 Allan deviation
# BI: Allan deviation 最小值
```

## 传感器融合流水线

<!-- SVG-DESIGN-NOTES
Type: A (结构 — IMU 融合的概率图模型/因子图)
Q0: 多传感器融合不是"加更多框",而是在状态变量 (q, p, v, b) 上挂不同传感器的 likelihood factor;3 个 IMU 传感器 + 3 个外部传感器 = 6 个 factor 共同约束一个 6D 状态,EKF/优化器解后验。
Q1: factor graph: 中心 state node 大圆 (q,p,v,b) + 5 个 sensor factor 小方块 + 4 个外部 measurement factor 三角;边为 likelihood,不同颜色编码不同频率 (IMU 1kHz / VIO 30Hz / LiDAR 10Hz / GPS 1Hz)
Q2: 圆+方块+三角 + 频率粗细的边 — DNA 是融合的概率图
Q3: 删 12 个等大方框 + 12 根串接箭头 (原图是顺序流而非因果图)
Q4: 每边上直接标频率
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">IMU 多传感器融合 — 因子图视角</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">central state · sensors as likelihood factors · edge thickness ∝ rate</text>

  <!-- center state node: large circle -->
  <circle cx="360" cy="200" r="56" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="2.5"/>
  <text x="360" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-stroke)">状态 x_k</text>
  <text x="360" y="208" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">(q, p, v, bg, ba)</text>
  <text x="360" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">15-D ESKF state</text>

  <!-- IMU sensor factors (squares - left side, blue tone, thicker edges = 1kHz) -->
  <!-- Gyro factor: top-left -->
  <rect x="92" y="62" width="76" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="130" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">陀螺仪</text>
  <text x="130" y="92" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">ω̃ · 1 kHz</text>
  <line x1="168" y1="82" x2="316" y2="175" stroke="var(--dia-blue)" stroke-width="2.2" opacity="0.65"/>

  <!-- Accelerometer factor: middle-left -->
  <rect x="60" y="184" width="76" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="2"/>
  <text x="98" y="202" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">加速度计</text>
  <text x="98" y="214" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">ã · 1 kHz</text>
  <line x1="136" y1="201" x2="304" y2="201" stroke="var(--dia-blue)" stroke-width="2.2" opacity="0.65"/>

  <!-- Magnetometer factor: bottom-left, thinner (50 Hz) -->
  <rect x="92" y="304" width="76" height="34" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.2"/>
  <text x="130" y="322" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">磁力计</text>
  <text x="130" y="334" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">m̃ · 50 Hz</text>
  <line x1="168" y1="320" x2="316" y2="226" stroke="var(--dia-blue)" stroke-width="1" opacity="0.55"/>

  <!-- External sensor measurement factors (triangles - right side) -->
  <!-- GPS: top-right, 1 Hz thin -->
  <polygon points="612,52 658,102 566,102" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.3"/>
  <text x="612" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">GPS</text>
  <text x="612" y="93" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">1 Hz · p</text>
  <line x1="566" y1="95" x2="408" y2="175" stroke="var(--dia-green)" stroke-width="0.8" opacity="0.55"/>

  <!-- LiDAR: right, 10 Hz medium -->
  <polygon points="628,166 668,206 588,206" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.8"/>
  <text x="628" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">LiDAR</text>
  <text x="628" y="202" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">10 Hz · q,p</text>
  <line x1="588" y1="196" x2="416" y2="200" stroke="var(--dia-accent)" stroke-width="1.5" opacity="0.65"/>

  <!-- Camera VIO: bottom-right, 30 Hz thick -->
  <polygon points="612,236 660,280 564,280" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="612" y="258" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Camera</text>
  <text x="612" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">30 Hz · q,p,v</text>
  <line x1="566" y1="260" x2="406" y2="226" stroke="var(--dia-accent)" stroke-width="1.7" opacity="0.65"/>

  <!-- wheel odom: 50 Hz, lower -->
  <polygon points="612,316 654,352 570,352" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="612" y="335" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">轮式里程</text>
  <text x="612" y="347" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-green)">50 Hz · v</text>
  <line x1="572" y1="335" x2="412" y2="240" stroke="var(--dia-green)" stroke-width="1.2" opacity="0.55"/>

  <!-- inset legend box (factor explanation) -->
  <g transform="translate(258, 290)">
    <text x="0" y="0" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">edge stroke-width ∝ 测量频率 · IMU 高频 propagate · 外部低频 update</text>
    <text x="0" y="16" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">EKF: x̂ = argmax p(x | all sensors) · 解耦快/慢节奏</text>
  </g>

  <!-- corner labels -->
  <text x="60" y="58" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">⤺ propagation (高频)</text>
  <text x="660" y="58" text-anchor="end" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">update (低频) ⤻</text>
</svg>
</div>
<p class="figure-caption">Figure 2 — 融合的本质不是串行流水,而是一张因子图:IMU 在 1 kHz 推进状态,外部传感器在各自频率上提供测量约束,边粗即权重大。</p>


### 姿态表示

| 表示方法 | 参数数 | 优点 | 缺点 |
|----------|--------|------|------|
| 欧拉角 | 3 | 直观 | 万向锁（Gimbal Lock） |
| 旋转矩阵 | 9 | 无奇异性 | 参数冗余 |
| 四元数 | 4 | 无奇异性、计算高效 | 不够直观 |
| 旋转向量/轴角 | 3 | 最小参数化 | 0° 附近奇异 |

四元数更新：

$$
\mathbf{q}_{k+1} = \mathbf{q}_k \otimes \begin{bmatrix} 1 \\ \frac{1}{2}\boldsymbol{\omega} \Delta t \end{bmatrix}
$$

## IMU 等级分类

| 等级 | 陀螺偏置稳定性 | 代表产品 | 应用场景 | 价格 |
|------|---------------|----------|----------|------|
| 消费级 | >10 °/h | MPU6050, BMI160 | 手机、遥控器 | $1–5 |
| 工业级 | 1–10 °/h | BMI088, ADIS16465 | 无人机、机器人 | $10–100 |
| 战术级 | 0.1–1 °/h | HG1120, STIM300 | 导弹、高精度导航 | $1K–10K |
| 导航级 | <0.01 °/h | HG9900 | 惯性导航系统 | $50K+ |
| 战略级 | <0.001 °/h | 环形激光陀螺 | 潜艇、洲际导弹 | $100K+ |

## 参考资料

- 《Quaternion kinematics for the error-state Kalman filter》 - Joan Sola
- 《Strapdown Inertial Navigation Technology》 - Titterton & Weston
- Bosch BMI088/BNO055 数据手册
- InvenSense MPU6050 数据手册
- Allan Variance 分析教程：IEEE Std 952-1997
