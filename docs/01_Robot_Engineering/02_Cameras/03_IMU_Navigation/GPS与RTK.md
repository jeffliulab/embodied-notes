# GPS 与 RTK 定位

## GNSS 基础

### 什么是 GNSS

GNSS（Global Navigation Satellite System，全球导航卫星系统）是利用卫星信号进行定位的技术总称。GPS 是 GNSS 的一个子集。

### 主要卫星星座

| 星座 | 国家/地区 | 卫星数 | 频段 | 精度（民用） |
|------|----------|--------|------|-------------|
| **GPS** | 美国 | 31 | L1/L2/L5 | ~2–5m |
| **GLONASS** | 俄罗斯 | 24 | G1/G2/G3 | ~2–5m |
| **Galileo** | 欧盟 | 30 | E1/E5a/E5b/E6 | ~1–3m |
| **北斗 BDS** | 中国 | 45+ | B1/B2/B3 | ~2–5m |
| **QZSS** | 日本 | 4 | L1/L2/L5/L6 | 区域增强 |
| **IRNSS/NavIC** | 印度 | 7 | L5/S | 区域覆盖 |

### 定位原理：三边测量

通过测量接收器到至少 4 颗卫星的伪距来确定位置：

$$
\rho_i = \sqrt{(x - x_i^s)^2 + (y - y_i^s)^2 + (z - z_i^s)^2} + c \cdot \delta t
$$

其中：

- $\rho_i$ 为到第 $i$ 颗卫星的伪距
- $(x, y, z)$ 为接收器位置
- $(x_i^s, y_i^s, z_i^s)$ 为卫星位置
- $c \cdot \delta t$ 为接收器时钟偏差

需要至少 4 颗卫星：3 个位置未知量 + 1 个时钟偏差。

### 误差来源

| 误差源 | 量级 | 说明 |
|--------|------|------|
| 电离层延迟 | 1–50m | 信号穿越电离层的延迟 |
| 对流层延迟 | 0.5–5m | 大气层中水汽的影响 |
| 卫星轨道误差 | 1–5m | 卫星位置预测误差 |
| 卫星钟差 | 1–3m | 卫星时钟与系统时间偏差 |
| 多径效应 | 0.5–数m | 信号经建筑物反射 |
| 接收器噪声 | 0.3–1m | 硬件噪声 |
| 几何精度因子 (DOP) | 放大系数 | 卫星几何分布影响 |

## RTK-GPS

### RTK 原理

RTK（Real-Time Kinematic，实时动态差分）通过基站-移动站差分的方式消除大部分公共误差，并利用载波相位观测实现厘米级定位精度。

**载波相位观测**：

$$
\Phi = \frac{1}{\lambda}(\rho + N\lambda + c \cdot \delta t - I + T + \epsilon)
$$

其中：

- $\Phi$ 为载波相位观测量（周）
- $\lambda$ 为载波波长（L1 ≈ 19cm）
- $N$ 为整周模糊度（Integer Ambiguity）
- $I$ 为电离层延迟
- $T$ 为对流层延迟

**差分消除**：基站和移动站同时观测同一卫星，做差后公共误差被消除：

$$
\Delta\Phi = \frac{1}{\lambda}(\Delta\rho + \Delta N \lambda + \Delta\epsilon)
$$

关键在于解算整周模糊度 $\Delta N$，一旦正确固定（Fix），定位精度可达 1–2cm。

### RTK 系统组成

<div class="diagram">
<svg viewBox="0 0 900 240" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="95" x2="270" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="95" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="175" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="135" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="135" x2="730" y2="135" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">GNSS 卫星</text>
  <rect x="270" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="70" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">基站 已知坐标</text>
  <rect x="270" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">移动站 待定位</text>
  <rect x="40" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">数据链路 无线电/4G/NTRIP</text>
  <rect x="500" y="110" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="110" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="139" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">RTK 解算</text>
  <rect x="730" y="110" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="110" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="139" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">厘米级位置</text>
</svg>
</div>


### 定位状态

| 状态 | 精度 | 说明 |
|------|------|------|
| **Fix（固定解）** | 1–2 cm | 整周模糊度正确固定 |
| **Float（浮点解）** | 10–50 cm | 未能固定整周模糊度 |
| **DGPS** | 0.5–1 m | 仅使用伪距差分 |
| **Single（单点）** | 2–5 m | 无差分修正 |

### u-blox ZED-F9P

ZED-F9P 是目前最流行的消费级/低成本 RTK GNSS 接收器。

| 参数 | 值 |
|------|-----|
| 支持星座 | GPS + GLONASS + Galileo + BeiDou |
| 频段 | L1 + L2（双频） |
| RTK 精度 | 水平 1cm + 1ppm，垂直 1.5cm + 1ppm |
| 收敛时间 | <10s（RTK Fix） |
| 更新率 | 最高 20Hz（RTK 8Hz） |
| 接口 | UART × 3、I2C、SPI、USB |
| 功耗 | ~150mW |
| 价格 | ~$200（模块）|

```bash
# ROS2 中使用 ublox 驱动
sudo apt install ros-humble-ublox-gps

ros2 launch ublox_gps ublox_gps_node-launch.py \
    device:=/dev/ttyACM0
```

### NTRIP 协议

NTRIP（Networked Transport of RTCM via Internet Protocol）通过互联网传输 RTK 修正数据，无需自建基站。

```bash
# 连接 NTRIP 服务
str2str -in ntrip://username:password@caster_host:2101/mountpoint \
        -out serial://ttyUSB0:115200
```

国内常用 CORS（连续运行参考站）服务：千寻位置（qxwz.com）、中国移动 OnePoint 等。

## 室内定位替代方案

GPS/GNSS 在室内不可用，需要替代定位方案。

### UWB（Ultra-Wideband）

| 参数 | 说明 |
|------|------|
| 原理 | 超宽带脉冲 ToF 测距 |
| 精度 | 10–30 cm |
| 范围 | 10–100m |
| 代表芯片 | Decawave DW1000 / DW3000 |
| 优点 | 精度高、抗多径 |
| 缺点 | 需要部署锚点（Anchor） |
| 价格 | 锚点 ~$30/个，标签 ~$15/个 |

**定位方式**：

- TWR（Two-Way Ranging）：双向测距
- TDoA（Time Difference of Arrival）：到达时差

$$
d_{ij} = c \cdot \frac{t_{\text{round}} - t_{\text{reply}}}{2}
$$

### AprilTag 定位

| 参数 | 说明 |
|------|------|
| 原理 | 视觉标记检测 + PnP 位姿估计 |
| 精度 | 1–5 cm（取决于距离和标记大小） |
| 范围 | 0.5–5m（取决于标记大小和相机分辨率） |
| 成本 | 仅需打印标记 + 相机 |
| 缺点 | 需要视觉标记可见、受光照影响 |

### 其他室内定位技术

| 技术 | 精度 | 成本 | 说明 |
|------|------|------|------|
| WiFi 指纹 | 1–5m | 低 | 利用已有 AP |
| BLE Beacon | 1–3m | 低 | 蓝牙信标 |
| LiDAR SLAM | 5–10cm | 中 | 无需基础设施 |
| 视觉 SLAM | 5–20cm | 低 | 仅需相机 |
| 动作捕捉 | <1mm | 高 | Vicon/OptiTrack |

## GPS + IMU 融合

### 融合动机

| GPS 特点 | IMU 特点 | 融合后 |
|----------|----------|--------|
| 低频（1–20Hz） | 高频（200–1000Hz） | 高频输出 |
| 无漂移 | 长期漂移 | 长短期都好 |
| 可能中断 | 连续可用 | 连续可用 |
| 精度不一 | 短期精确 | 稳定精确 |

### EKF 融合

使用扩展卡尔曼滤波（EKF）融合 GPS 和 IMU：

**预测步骤**（IMU 驱动，高频）：

$$
\hat{\mathbf{x}}_{k|k-1} = f(\hat{\mathbf{x}}_{k-1}, \mathbf{u}_k^{\text{IMU}})
$$

$$
\mathbf{P}_{k|k-1} = \mathbf{F}_k \mathbf{P}_{k-1} \mathbf{F}_k^T + \mathbf{Q}_k
$$

**更新步骤**（GPS 观测，低频）：

$$
\mathbf{K}_k = \mathbf{P}_{k|k-1} \mathbf{H}_k^T (\mathbf{H}_k \mathbf{P}_{k|k-1} \mathbf{H}_k^T + \mathbf{R}_k)^{-1}
$$

$$
\hat{\mathbf{x}}_k = \hat{\mathbf{x}}_{k|k-1} + \mathbf{K}_k (\mathbf{z}_k^{\text{GPS}} - h(\hat{\mathbf{x}}_{k|k-1}))
$$

### ROS2 robot_localization

```bash
sudo apt install ros-humble-robot-localization

# 配置 EKF 融合 GPS + IMU
ros2 launch robot_localization dual_ekf_navsat.launch.py
```

配置文件需要指定：

- `ekf_local`：融合 IMU + 轮式里程计（局部坐标系）
- `ekf_global`：融合 GPS + IMU（全局坐标系）
- `navsat_transform`：GPS 坐标转换

## 参考资料

- u-blox ZED-F9P 集成手册
- 《GPS: Theory, Algorithms and Applications》 - Xu & Xu
- Decawave DW1000 数据手册
- ROS2 robot_localization 文档
- 千寻位置开发者文档
