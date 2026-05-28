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

<div class="diagram">
<svg viewBox="0 0 900 440" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="450" y1="120" x2="110" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="280" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="450" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="620" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="120" x2="790" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="260" x2="110" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="280" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="450" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="620" y1="260" x2="620" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="790" y1="260" x2="790" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="380" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="450" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">应用场景</text>
  <rect x="40" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="110" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">学习/原型</text>
  <rect x="210" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="280" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">消费级产品</text>
  <rect x="380" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="450" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">无人机/机器人</text>
  <rect x="550" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="550" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="620" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">自动驾驶</text>
  <rect x="720" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="720" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="790" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">高精度导航</text>
  <rect x="40" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MPU6050 BNO055</text>
  <rect x="210" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">BMI160 LSM6DSO</text>
  <rect x="380" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">BMI088 ICM-42688</text>
  <rect x="550" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="550" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="620" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">ADIS16465 BMI088</text>
  <rect x="720" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="720" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="790" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">STIM300 HG1120</text>
</svg>
</div>


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
