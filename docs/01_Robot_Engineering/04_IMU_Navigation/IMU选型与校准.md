# IMU 选型与校准

## 概述

IMU 的选型直接影响机器人的导航精度和系统成本。本文详细介绍主流 MEMS IMU 产品的性能参数对比，以及实际使用中必不可少的校准方法。

## 主流 IMU 产品

### MPU6050 —— 入门级标杆

| 参数 | 值 |
|------|-----|
| 类型 | 6 轴（加速度计 + 陀螺仪） |
| 陀螺量程 | ±250/500/1000/2000 °/s |
| 加速度量程 | ±2/4/8/16 g |
| 陀螺噪声密度 | 0.005 °/s/√Hz |
| 加速度噪声密度 | 400 μg/√Hz |
| 接口 | I2C（400kHz）/ SPI |
| 采样率 | 最高 1kHz（陀螺）/ 1kHz（加速度） |
| 供电 | 2.375–3.46V |
| 尺寸 | 4×4×0.9 mm (QFN) |
| 价格 | ~$2 |

!!! tip "MPU6050 —— 无处不在"
    MPU6050 是最广泛使用的消费级 IMU，几乎所有 Arduino/ESP32 教程都使用它。虽然性能一般，但价格极低、资料丰富，非常适合学习和原型开发。注意：InvenSense 已被 TDK 收购，新项目推荐使用 ICM 系列。

### BNO055 —— 自带融合算法

| 参数 | 值 |
|------|-----|
| 类型 | 9 轴（加速度计 + 陀螺仪 + 磁力计） |
| 陀螺量程 | ±125/250/500/1000/2000 °/s |
| 加速度量程 | ±2/4/8/16 g |
| 内置融合 | Bosch BSX 融合算法，直接输出四元数/欧拉角 |
| 输出频率 | 融合数据 100Hz |
| 接口 | I2C / UART |
| 供电 | 2.4–3.6V |
| 尺寸 | 5.2×3.8×1.1 mm (LGA) |
| 价格 | ~$10–15 |

**BNO055 的优势**：

- 内置传感器融合，无需自己写卡尔曼滤波
- 直接输出：四元数、欧拉角、线性加速度（已去重力）、重力向量
- 自动校准状态反馈
- 适合快速原型开发

**BNO055 的局限**：

- 融合算法是黑箱，无法自定义
- 磁力计在强磁干扰环境下影响航向
- 数据率相对有限（100Hz）
- 不适合需要原始 IMU 数据的紧耦合融合方案

### BMI088 —— 工业级选择

| 参数 | 值 |
|------|-----|
| 类型 | 6 轴（加速度计 + 陀螺仪，独立芯片） |
| 陀螺量程 | ±125/250/500/1000/2000 °/s |
| 加速度量程 | ±3/6/12/24 g |
| 陀螺噪声密度 | 0.014 °/s/√Hz |
| 加速度噪声密度 | 175 μg/√Hz |
| 陀螺偏置稳定性 | ~2 °/h（典型） |
| 接口 | SPI / I2C |
| 采样率 | 陀螺 2kHz，加速度 1.6kHz |
| 供电 | 1.2–3.6V |
| 尺寸 | 3×4.5×0.95 mm (LGA) |
| 价格 | ~$5–8 |

!!! info "BMI088 的设计特点"
    BMI088 将加速度计和陀螺仪做成独立的两个芯片封装在一起，分别有独立的 SPI/I2C 接口。这种设计使得两个传感器不会相互干扰，且可以独立配置采样率和量程。被广泛用于无人机飞控（如 PX4）。

### ICM-42688-P —— 新一代高性能

| 参数 | 值 |
|------|-----|
| 类型 | 6 轴 |
| 陀螺量程 | ±15.625/31.25/62.5/125/250/500/1000/2000 °/s |
| 加速度量程 | ±2/4/8/16 g |
| 陀螺噪声密度 | 0.0028 °/s/√Hz |
| 加速度噪声密度 | 70 μg/√Hz |
| 接口 | SPI（24MHz）/ I2C |
| 采样率 | 最高 32kHz |
| 供电 | 1.71–3.6V |
| 价格 | ~$4–6 |

### ADIS16465 —— 高精度工业级

| 参数 | 值 |
|------|-----|
| 类型 | 6 轴 |
| 陀螺偏置稳定性 | 2 °/h（ADIS16465-1）/ 0.7 °/h（-3） |
| 陀螺 ARW | 0.14 °/√h |
| 加速度偏置稳定性 | 3.2 μg（-1）/ 1.5 μg（-3） |
| 接口 | SPI |
| 内置 | △Θ / △V 输出、温度补偿 |
| 供电 | 3.0–3.6V |
| 价格 | ~$200–500 |

### STIM300 —— 战术级

| 参数 | 值 |
|------|-----|
| 类型 | 9 轴（3 陀螺 + 3 加速度 + 3 倾角） |
| 陀螺偏置稳定性 | 0.3 °/h |
| 陀螺 ARW | 0.15 °/√h |
| 接口 | RS422 |
| 供电 | 5V |
| 工作温度 | -40°C ~ +85°C |
| 价格 | ~$3,000–5,000 |

## 综合对比

| 产品 | 类型 | 陀螺噪声密度 | 偏置稳定性 | 接口 | 采样率 | 价格 | 适用场景 |
|------|------|-------------|-----------|------|--------|------|----------|
| MPU6050 | 6轴 | 0.005 °/s/√Hz | >10 °/h | I2C | 1kHz | ~$2 | 学习、原型 |
| BNO055 | 9轴 | - | ~5 °/h | I2C/UART | 100Hz | ~$12 | 快速原型、姿态 |
| BMI088 | 6轴 | 0.014 °/s/√Hz | ~2 °/h | SPI/I2C | 2kHz | ~$6 | 无人机、机器人 |
| ICM-42688 | 6轴 | 0.0028 °/s/√Hz | ~1 °/h | SPI/I2C | 32kHz | ~$5 | 高性能机器人 |
| ADIS16465 | 6轴 | - | 0.7–2 °/h | SPI | 2kHz | ~$300 | 工业导航 |
| STIM300 | 9轴 | - | 0.3 °/h | RS422 | 2kHz | ~$4K | 战术级导航 |

## 选型指南

### 按应用场景

<!-- SVG-DESIGN-NOTES
Type: D (量化 — IMU 产品在 价格 × 偏置稳定性 log-log 散点)
Q0: IMU 选型不是树:同一应用场景的可选传感器是 价格 × BI 平面上的 iso-budget 区域;消费级 BI ~10°/h $2、车规级 BI ~1°/h $300、战术级 BI ~0.3°/h $4k — 跨越 4 个数量级 BI 与 3 个数量级价格;BI 每降一档,价格涨 10-30×。
Q1: x = 价格 USD (log $1-$10k), y = 偏置稳定性 BI °/h (log 0.1-100, 注意 y 反向: 越低越好);7 个真实产品气泡 + 4 个应用区域阴影 + iso-BI/cost 参考线
Q2: 散点 + 区域阴影 — DNA 是"看 datasheet 选 IMU"
Q3: 删 11 个等大方框 + 10 根树状箭头
Q4: 每点直接标产品名 + 价格
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 740 420" xmlns="http://www.w3.org/2000/svg">
  <text x="370" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">IMU 选型 — 偏置稳定性 BI vs 单元价格</text>
  <text x="370" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">log-log scatter · 4 application zones · 7 representative products</text>

  <!-- axes: x = log price 1..10000 maps [80..680]; y = log BI 100..0.1 (inverted, lower is better) maps [80..340] -->
  <line x1="80" y1="340" x2="680" y2="340" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="340" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="338" x2="80"  y2="344"/><text x="80"  y="358" text-anchor="middle">$1</text>
    <line x1="230" y1="338" x2="230" y2="344"/><text x="230" y="358" text-anchor="middle">$10</text>
    <line x1="380" y1="338" x2="380" y2="344"/><text x="380" y="358" text-anchor="middle">$100</text>
    <line x1="530" y1="338" x2="530" y2="344"/><text x="530" y="358" text-anchor="middle">$1k</text>
    <line x1="680" y1="338" x2="680" y2="344"/><text x="680" y="358" text-anchor="middle">$10k</text>

    <line x1="76" y1="340" x2="84" y2="340"/><text x="72" y="344" text-anchor="end">100 °/h</text>
    <line x1="76" y1="280" x2="84" y2="280"/><text x="72" y="284" text-anchor="end">10</text>
    <line x1="76" y1="220" x2="84" y2="220"/><text x="72" y="224" text-anchor="end">1</text>
    <line x1="76" y1="160" x2="84" y2="160"/><text x="72" y="164" text-anchor="end">0.3</text>
    <line x1="76" y1="100" x2="84" y2="100"/><text x="72" y="104" text-anchor="end">0.1</text>
  </g>
  <text x="380" y="382" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">单元价格 USD (log)</text>
  <text x="22" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 200)">偏置稳定性 BI °/h (log, 越低越好 ↑)</text>

  <!-- Application zones (shaded bands per BI range) -->
  <rect x="80" y="290" width="240" height="50" fill="var(--dia-accent)" fill-opacity="0.08"/>
  <text x="200" y="316" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)">学习/原型 · BI &gt; 10°/h</text>

  <rect x="200" y="245" width="200" height="40" fill="var(--dia-green)" fill-opacity="0.08"/>
  <text x="300" y="269" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">消费级 · BI ≈ 2-10°/h</text>

  <rect x="350" y="195" width="200" height="50" fill="var(--dia-blue)" fill-opacity="0.08"/>
  <text x="450" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">无人机/机器人 · BI ≈ 0.7-2°/h</text>

  <rect x="450" y="140" width="230" height="55" fill="var(--dia-gold)" fill-opacity="0.08"/>
  <text x="565" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-gold)">自动驾驶/战术级 · BI &lt; 0.5°/h</text>

  <!-- iso-BI horizontal guide at 1°/h (key threshold) -->
  <line x1="80" y1="220" x2="680" y2="220" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.5"/>

  <!-- Bubbles -->
  <!-- MPU6050: $2, BI > 10°/h -->
  <circle cx="195" cy="312" r="10" fill="var(--dia-accent)" fill-opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <text x="158" y="295" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">MPU6050</text>
  <text x="158" y="308" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$2 · 6-axis</text>

  <!-- BNO055: $12, 5°/h -->
  <circle cx="244" cy="270" r="10" fill="var(--dia-green)" fill-opacity="0.55" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="258" y="266" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">BNO055</text>
  <text x="258" y="279" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$12 · 9-axis fusion</text>

  <!-- BMI088: $6, 2°/h -->
  <circle cx="215" cy="244" r="10" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="100" y="240" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">BMI088</text>
  <text x="100" y="253" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$6 · drone-grade</text>

  <!-- ICM-42688: $5, 1°/h -->
  <circle cx="210" cy="218" r="12" fill="var(--dia-blue)" fill-opacity="0.6" stroke="var(--dia-blue)" stroke-width="1.5"/>
  <text x="225" y="216" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">ICM-42688</text>
  <text x="225" y="229" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$5 · 32 kHz · best $/perf</text>

  <!-- ADIS16465: $300, 1°/h -->
  <circle cx="455" cy="218" r="14" fill="var(--dia-blue)" fill-opacity="0.65" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <text x="475" y="214" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">ADIS16465</text>
  <text x="475" y="227" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$300 · 工业级</text>

  <!-- STIM300: $4k, 0.3°/h -->
  <circle cx="610" cy="158" r="16" fill="var(--dia-gold)" fill-opacity="0.65" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="610" y="135" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">STIM300</text>
  <text x="610" y="148" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$4k · 战术级</text>

  <!-- HG1120 (tactical): $8k, 0.1°/h -->
  <circle cx="660" cy="100" r="14" fill="var(--dia-gold)" fill-opacity="0.65" stroke="var(--dia-gold)" stroke-width="1.6"/>
  <text x="655" y="80" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">HG1120</text>
  <text x="660" y="93" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">$8k · 军用</text>

  <!-- price = 30× BI rule annotation: trend line from (4, 50) to (10000, 0.1) -->
  <line x1="180" y1="295" x2="660" y2="105" stroke="var(--dia-accent)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.55"/>
  <text x="525" y="195" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent)" transform="rotate(-15 525 195)">BI ÷ 10 ≈ price × 30</text>

  <text x="370" y="408" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">ICM-42688 是最佳性价比拐点 (BI ≈ 1°/h, $5);跨越 BI &lt; 0.5°/h 需要 100× 价格</text>
</svg>
</div>
<p class="figure-caption">Figure — 选型不是按场景"打标签",而是在 BI × 价格 平面上找符合预算和精度需求的等值线;BI 每降一档,价格涨 30× 是 MEMS IMU 的工业铁律。</p>


### 选型关键考虑因素

| 因素 | 说明 |
|------|------|
| **噪声密度** | 决定短期精度，影响高频信号质量 |
| **偏置稳定性** | 决定长期漂移速度 |
| **采样率** | 高动态场景需要高采样率（>1kHz） |
| **接口** | I2C 简单但速率有限，SPI 更快更可靠 |
| **温度范围** | 户外应用需要宽温范围 |
| **内置功能** | 温度补偿、数字滤波、FIFO 缓冲 |
| **功耗** | 电池供电设备需关注 |
| **是否需要融合** | 需要原始数据还是融合后姿态 |

## IMU 校准

### 为什么需要校准

MEMS IMU 的测量模型：

$$
\tilde{\mathbf{a}} = \mathbf{M}_a \cdot \mathbf{S}_a \cdot (\mathbf{a}_{\text{true}} + \mathbf{b}_a) + \mathbf{n}_a
$$

其中：

- $\mathbf{M}_a$ 为轴间耦合（Misalignment）矩阵
- $\mathbf{S}_a$ 为标度因子（Scale Factor）对角矩阵
- $\mathbf{b}_a$ 为偏置（Bias）向量
- $\mathbf{n}_a$ 为噪声

校准的目标是估计 $\mathbf{M}_a$、$\mathbf{S}_a$ 和 $\mathbf{b}_a$。

### 六面体静态校准（Six-Position Calibration）

最经典的加速度计校准方法。将 IMU 分别放置在 6 个正交方向（±X, ±Y, ±Z 朝上），在每个位置静止采集数据。

**原理**：静止时加速度计测量值应等于重力向量在各轴上的投影。

$$
\| \tilde{\mathbf{a}} \| = g = 9.80665 \, \text{m/s}^2
$$

**步骤**：

1. 将 IMU 平放（Z 轴朝上），静止采集 30s 数据
2. 翻转（Z 轴朝下），静止采集 30s
3. 重复 X 轴朝上/下、Y 轴朝上/下
4. 每个位置取平均值
5. 解算偏置和标度因子

```python
import numpy as np

def six_position_calibration(measurements):
    """
    measurements: dict with keys '+x', '-x', '+y', '-y', '+z', '-z'
    每个值为 (N, 3) 的加速度计数据
    """
    g = 9.80665  # m/s^2
    
    # 各方向平均值
    means = {k: np.mean(v, axis=0) for k, v in measurements.items()}
    
    # 偏置 = (正方向 + 反方向) / 2
    bias = np.array([
        (means['+x'][0] + means['-x'][0]) / 2,
        (means['+y'][1] + means['-y'][1]) / 2,
        (means['+z'][2] + means['-z'][2]) / 2,
    ])
    
    # 标度因子 = (正方向 - 反方向) / (2g)
    scale = np.array([
        (means['+x'][0] - means['-x'][0]) / (2 * g),
        (means['+y'][1] - means['-y'][1]) / (2 * g),
        (means['+z'][2] - means['-z'][2]) / (2 * g),
    ])
    
    return bias, scale

def apply_calibration(raw_data, bias, scale):
    """应用校准参数"""
    return (raw_data - bias) / scale
```

### 陀螺仪偏置校准

最简单的方法：静止状态下采集数据，均值即为偏置。

```python
def gyro_bias_calibration(static_data, duration=60):
    """
    static_data: (N, 3) 陀螺仪静态数据
    duration: 采集时长(秒)，越长越准确
    """
    bias = np.mean(static_data, axis=0)
    noise_std = np.std(static_data, axis=0)
    
    print(f"陀螺偏置: {bias} rad/s")
    print(f"陀螺噪声: {noise_std} rad/s")
    
    return bias
```

### 温度补偿校准

IMU 偏置随温度变化显著。温度补偿通过在不同温度下采集数据，拟合偏置-温度关系：

$$
b(T) = b_0 + b_1 T + b_2 T^2
$$

```python
def temperature_compensation(temp_data, bias_data):
    """
    temp_data: (N,) 温度采样
    bias_data: (N, 3) 对应温度下的偏置
    """
    coeffs = []
    for axis in range(3):
        # 二阶多项式拟合
        p = np.polyfit(temp_data, bias_data[:, axis], deg=2)
        coeffs.append(p)
    
    return np.array(coeffs)

def compensate_bias(raw_data, temperature, temp_coeffs):
    """运行时温度补偿"""
    compensated = np.zeros_like(raw_data)
    for axis in range(3):
        bias_at_temp = np.polyval(temp_coeffs[axis], temperature)
        compensated[:, axis] = raw_data[:, axis] - bias_at_temp
    return compensated
```

### 磁力计校准

磁力计受硬铁（Hard Iron）和软铁（Soft Iron）效应影响：

$$
\tilde{\mathbf{m}} = \mathbf{A} \cdot \mathbf{m}_{\text{true}} + \mathbf{b}_{\text{hard}}
$$

校准方法：旋转采集数据（画 8 字），将椭球拟合为标准球。

```python
def magnetometer_calibration(mag_data):
    """
    椭球拟合校准
    mag_data: (N, 3) 磁力计数据（全方位旋转采集）
    """
    # 硬铁偏移 = 椭球中心
    hard_iron = np.mean([np.max(mag_data, axis=0), 
                          np.min(mag_data, axis=0)], axis=0)
    
    # 软铁矩阵 = 椭球轴长比
    centered = mag_data - hard_iron
    ranges = np.max(centered, axis=0) - np.min(centered, axis=0)
    avg_range = np.mean(ranges)
    soft_iron_scale = avg_range / ranges
    
    return hard_iron, soft_iron_scale

def apply_mag_calibration(raw_mag, hard_iron, soft_iron_scale):
    return (raw_mag - hard_iron) * soft_iron_scale
```

## ROS2 中使用 IMU

### IMU 消息格式

```python
# sensor_msgs/msg/Imu
Header header
geometry_msgs/Quaternion orientation           # 姿态四元数
float64[9] orientation_covariance              # 协方差
geometry_msgs/Vector3 angular_velocity         # 角速度 (rad/s)
float64[9] angular_velocity_covariance
geometry_msgs/Vector3 linear_acceleration      # 线加速度 (m/s^2)
float64[9] linear_acceleration_covariance
```

### BNO055 ROS2 驱动

```bash
sudo apt install ros-humble-bno055

# 启动
ros2 run bno055 bno055_driver --ros-args \
    -p connection_type:=uart \
    -p uart_port:=/dev/ttyUSB0
```

### imu_filter_madgwick

用于从原始 IMU 数据估计姿态：

```bash
sudo apt install ros-humble-imu-filter-madgwick

ros2 run imu_filter_madgwick imu_filter_madgwick_node --ros-args \
    -p use_mag:=false \
    -p publish_tf:=true \
    -p world_frame:=enu
```

## 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 姿态持续漂移 | 陀螺偏置未补偿 | 静止校准、温度补偿 |
| 航向不准 | 磁力计干扰 | 磁力计校准、远离铁磁材料 |
| 振动噪声大 | 机械振动耦合 | 减振安装、低通滤波 |
| 数据丢失 | I2C 通信不稳定 | 使用 SPI、增加上拉电阻 |
| 温度漂移 | MEMS 温度特性 | 温度补偿校准 |

## 参考资料

- Bosch BNO055 数据手册
- Bosch BMI088 数据手册
- TDK InvenSense ICM-42688 数据手册
- Analog Devices ADIS16465 数据手册
- 《Inertial Sensor Technology Trends》 - IEEE Sensors Journal
