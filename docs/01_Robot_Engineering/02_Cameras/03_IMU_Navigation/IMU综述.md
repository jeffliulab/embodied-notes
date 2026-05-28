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

<div class="diagram">
<svg viewBox="0 0 560 580" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="280" y1="120" x2="195" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="365" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="260" x2="110" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="260" x2="280" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="195" y1="260" x2="450" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="260" x2="110" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="260" x2="280" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="365" y1="260" x2="450" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">IMU 噪声源</text>
  <rect x="125" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="125" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="195" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">确定性误差</text>
  <rect x="295" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="295" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="365" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">随机误差</text>
  <rect x="40" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">偏置 Bias 常量偏移</text>
  <rect x="210" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">标度因子误差 Scale</text>
  <text x="280" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Factor</text>
  <rect x="380" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">轴间耦合 Cross-axis</text>
  <rect x="40" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">角度随机游走 ARW 白噪声</text>
  <rect x="210" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="512" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">偏置不稳定性 Bias</text>
  <text x="280" y="526" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Instability</text>
  <rect x="380" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">速率随机游走 RRW 低频漂移</text>
</svg>
</div>


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

<div class="diagram">
<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="95" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="175" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="255" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="175" x2="730" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="870" y1="175" x2="960" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1190" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1190" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1190" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="175" x2="1420" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">加速度计</text>
  <rect x="270" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">姿态估计</text>
  <rect x="40" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">陀螺仪</text>
  <rect x="40" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="230" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">磁力计</text>
  <rect x="500" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">互补滤波器 或 EKF</text>
  <rect x="730" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Roll, Pitch, Yaw</text>
  <rect x="960" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1030" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">与外部传感器融合</text>
  <rect x="1190" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1260" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">GPS → 位置</text>
  <rect x="1190" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1260" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">LiDAR → SLAM</text>
  <rect x="1190" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="230" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1260" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">相机 → VIO</text>
  <rect x="1420" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="1490" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">轮式里程计 → 速度</text>
</svg>
</div>


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
