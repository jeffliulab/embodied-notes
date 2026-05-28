# LiDAR 综述

## 什么是 LiDAR

LiDAR（Light Detection and Ranging，光探测与测距）是一种利用激光脉冲测量距离的主动传感技术。它通过发射激光并接收反射信号来构建环境的精确三维模型，是机器人感知系统中最重要的传感器之一。

## 测距原理

### 飞行时间法（Time-of-Flight, ToF）

最基本的 LiDAR 测距原理。发射一个短激光脉冲，测量其往返时间：

$$
d = \frac{c \cdot t}{2}
$$

其中：

- $d$ 为目标距离
- $c$ 为光速（$\approx 3 \times 10^8 \, \text{m/s}$）
- $t$ 为激光脉冲往返时间

**特点**：

- 原理简单、实现成熟
- 测距范围大（可达数百米）
- 精度受时间测量分辨率限制（$\Delta d = \frac{c \cdot \Delta t}{2}$）
- 广泛应用于机械式 LiDAR（如 Velodyne）

### 相位差法（Phase-Shift）

发射连续调制的激光，通过测量发射与反射信号的相位差来计算距离：

$$
d = \frac{c \cdot \Delta\varphi}{4\pi f}
$$

其中：

- $\Delta\varphi$ 为相位差
- $f$ 为调制频率

**特点**：

- 精度较高（毫米级）
- 测距范围相对较短
- 需要解决相位模糊问题（多频率调制）
- 常用于工业测量级 LiDAR

### 调频连续波（FMCW）

发射频率随时间线性变化的连续激光，通过反射信号与本地参考信号的拍频来确定距离：

$$
d = \frac{c \cdot f_{\text{beat}}}{2B / T}
$$

其中：

- $f_{\text{beat}}$ 为拍频
- $B$ 为扫频带宽
- $T$ 为扫频周期

**特点**：

- 可同时获取距离和速度信息（多普勒效应）
- 抗环境光干扰能力强
- 测距精度高
- 技术复杂度较高，成本较高
- 代表：Aeva、SiLC Technologies

## LiDAR 类型分类

### 按扫描方式分类

<div class="diagram">
<svg viewBox="0 0 560 580" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="280" y1="120" x2="110" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="280" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="120" x2="450" y2="210" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="110" y1="260" x2="110" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="280" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="280" y1="260" x2="450" y2="350" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="110" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="280" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="450" y1="260" x2="450" y2="490" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="210" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="280" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">LiDAR 类型</text>
  <rect x="40" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="110" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">机械旋转式</text>
  <rect x="210" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="280" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">半固态</text>
  <rect x="380" y="210" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="210" width="3" height="50" fill="var(--dia-green)"/>
  <text x="450" y="239" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">纯固态</text>
  <rect x="40" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">单线/多线旋转 Velodyne</text>
  <text x="110" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">VLP-16 Ouster OS1</text>
  <rect x="210" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="379" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MEMS 微振镜 速腾聚创</text>
  <rect x="380" y="350" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="350" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="372" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">棱镜旋转 Livox</text>
  <text x="450" y="386" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Mid-360</text>
  <rect x="40" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="110" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">OPA 光学相控阵</text>
  <rect x="210" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="210" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="280" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Flash LiDAR</text>
  <rect x="380" y="490" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="380" y="490" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="450" y="519" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">FMCW 固态</text>
</svg>
</div>


### 机械旋转式 LiDAR

| 特性 | 说明 |
|------|------|
| 原理 | 激光发射/接收模块随电机旋转 |
| FOV | 水平 360°，垂直视角取决于线数 |
| 优点 | 全向扫描、技术成熟 |
| 缺点 | 机械磨损、体积大、成本高 |
| 代表 | Velodyne VLP-16/32/64/128 |

### 半固态 LiDAR

| 特性 | 说明 |
|------|------|
| 原理 | 小型振镜或棱镜扫描 |
| FOV | 有限角度（通常 60°–120°） |
| 优点 | 体积小、可靠性较高 |
| 缺点 | FOV 受限 |
| 代表 | Livox Mid-360、HAP |

### 纯固态 LiDAR

| 特性 | 说明 |
|------|------|
| 原理 | 无任何运动部件 |
| FOV | 有限角度 |
| 优点 | 高可靠性、低成本潜力、可量产 |
| 缺点 | 技术尚在成熟中 |
| 代表 | Cepton、Ibeo |

## 关键性能指标

| 指标 | 说明 | 典型范围 |
|------|------|----------|
| **测距范围** | 最大可检测距离 | 12m（低端）– 300m+（高端） |
| **测距精度** | 距离测量误差 | ±1cm – ±3cm |
| **角分辨率** | 相邻扫描线/点之间的角度 | 0.1° – 2° |
| **视场角（FOV）** | 水平和垂直扫描范围 | 水平 60°–360°，垂直 15°–90° |
| **扫描频率** | 每秒完成扫描的圈数 | 5Hz – 20Hz |
| **点频** | 每秒产生的点数 | 10K – 2.4M points/s |
| **回波数** | 每个脉冲的回波数量 | 1 – 5 |
| **波长** | 激光波长 | 905nm（近红外）或 1550nm（人眼安全） |
| **功耗** | 工作功率 | 5W – 30W |
| **防护等级** | 环境防护 | IP65 – IP69K |

## 不同机器人平台的 LiDAR 选择

### 室内移动机器人 / 扫地机器人

- **推荐**：2D LiDAR（RPLIDAR A1/A2、YDLIDAR X4）
- **原因**：成本低、功耗小、2D SLAM 即可满足导航需求
- **典型配置**：单线 360° LiDAR 安装在机器人顶部

### 服务机器人 / AGV

- **推荐**：2D LiDAR（安全级）+ 可选 3D LiDAR
- **原因**：需要安全认证（如 SICK TiM 系列）、避障需求
- **典型配置**：前后各一个安全 LiDAR + 顶部导航 LiDAR

### 自动驾驶车辆

- **推荐**：多线 3D LiDAR 或固态 LiDAR 组合
- **原因**：需要高精度 3D 环境感知、远距离检测
- **典型配置**：车顶主 LiDAR + 四角补盲 LiDAR

### 无人机

- **推荐**：轻量化固态 LiDAR（如 Livox Mid-360）
- **原因**：重量限制、功耗限制
- **典型配置**：下视或前视安装

### 四足机器人

- **推荐**：轻量 3D LiDAR（Livox Mid-360、Ouster OS0）
- **原因**：动态环境感知、地形建图
- **典型配置**：头部或背部安装

## LiDAR 数据处理流程

<div class="diagram">
<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="175" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="960" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="730" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="960" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="960" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="1190" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="95" x2="1420" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="95" x2="1420" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="1100" y1="95" x2="1420" y2="255" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">原始数据采集</text>
  <rect x="270" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">数据预处理</text>
  <rect x="500" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">特征提取</text>
  <rect x="960" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1030" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">高级应用</text>
  <rect x="500" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">噪声过滤</text>
  <rect x="500" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="230" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">运动补偿</text>
  <rect x="730" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="800" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">坐标变换</text>
  <rect x="960" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1030" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">平面检测</text>
  <rect x="960" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="230" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1030" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">聚类分割</text>
  <rect x="1190" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1190" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="1260" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">边缘/角点提取</text>
  <rect x="1420" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="70" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1490" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SLAM</text>
  <rect x="1420" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1490" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">目标检测</text>
  <rect x="1420" y="230" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="1420" y="230" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1490" y="259" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">地图构建</text>
</svg>
</div>


## 激光安全等级

| 等级 | 说明 | LiDAR 应用 |
|------|------|-----------|
| Class 1 | 在所有操作条件下安全 | 大部分消费级/工业级 LiDAR |
| Class 1M | 裸眼安全，光学仪器观察可能不安全 | 部分远距离 LiDAR |
| Class 3R | 直接观察有低风险 | 少数高功率测量 LiDAR |

!!! warning "人眼安全"
    905nm 波长 LiDAR 需要严格控制功率以保证人眼安全。1550nm 波长对人眼更安全（被角膜吸收而非到达视网膜），但探测器成本更高。

## 与其他传感器的对比

| 特性 | LiDAR | 相机 | 毫米波雷达 | 超声波 |
|------|-------|------|-----------|--------|
| 精度 | 高（cm级） | 中等 | 中等 | 低 |
| 范围 | 远（~300m） | 远 | 远（~250m） | 近（~5m） |
| 3D 信息 | ✅ 原生3D | 需要算法 | 有限 | ❌ |
| 受光照影响 | 轻微 | 严重 | ❌ | ❌ |
| 受天气影响 | 雨雾影响大 | 雨雾影响大 | 较好 | 较好 |
| 成本 | 高 | 低 | 中等 | 很低 |
| 纹理/颜色 | ❌ | ✅ | ❌ | ❌ |
| 功耗 | 中等 | 低 | 低 | 很低 |

## 参考资料

- Velodyne LiDAR 技术白皮书
- Livox 技术文档
- 《Introduction to Autonomous Mobile Robots》 - Siegwart et al.
- ROS2 LiDAR 驱动包文档
