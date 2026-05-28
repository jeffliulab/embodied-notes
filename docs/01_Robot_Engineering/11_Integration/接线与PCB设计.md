# 接线与PCB设计

## 概述

电子集成是机器人系统集成中最容易出问题的环节之一。本节涵盖接线最佳实践、连接器选型和自定义 PCB 设计基础。

---

## 接线基础

### 线材规格（AWG）

AWG（American Wire Gauge）是线材粗细的标准。**数字越小，线越粗**。

| AWG | 直径 (mm) | 载流量 (A) | 电阻 (mΩ/m) | 典型用途 |
|-----|----------|-----------|-------------|---------|
| 10 | 2.59 | 30 | 3.3 | 电池主线、大电机 |
| 12 | 2.05 | 20 | 5.2 | 电机电源 |
| 14 | 1.63 | 15 | 8.3 | 中功率设备 |
| 16 | 1.29 | 10 | 13.2 | 舵机电源 |
| 18 | 1.02 | 7 | 21.0 | 小型电机、传感器电源 |
| 20 | 0.81 | 5 | 33.3 | 传感器信号线 |
| 22 | 0.64 | 3 | 53.0 | 低功率信号 |
| 24 | 0.51 | 2 | 84.2 | I2C/SPI 信号线 |
| 26 | 0.40 | 1.3 | 134 | 细信号线 |
| 28 | 0.32 | 0.8 | 213 | 极细信号线 |

**选线原则**：

$$I_{wire\_rating} \geq 1.5 \times I_{max\_load}$$

留 50% 余量防止发热。

### 线材类型

| 类型 | 特点 | 适用 |
|------|------|------|
| **硅胶线** | 柔软耐高温（-60~200°C） | 机器人关节、电机接线 |
| **PVC 线** | 便宜、硬 | 固定布线 |
| **铁氟龙线** | 耐高温耐化学 | 恶劣环境 |
| **排线（FFC/FPC）** | 扁平柔性 | 显示屏、紧凑空间 |
| **双绞线** | 抗干扰 | CAN Bus、差分信号 |
| **屏蔽线** | 电磁屏蔽 | 模拟信号、编码器 |

### 颜色编码

标准颜色约定（无强制标准，但强烈建议遵循）：

| 颜色 | 用途 |
|------|------|
| **红色** | 正极电源（VCC/V+） |
| **黑色** | 地线（GND） |
| **黄色** | 信号线（PWM/Signal） |
| **绿色** | 通信（CAN-H/TX） |
| **蓝色** | 通信（CAN-L/RX） |
| **白色** | 通信（SDA/MOSI） |
| **橙色** | 备用/第二电源 |

**标签**：每根线的两端都贴标签，标注来源和去向。

---

## 连接器选型

### 电源连接器

| 连接器 | 额定电流 | 典型电压 | 特点 | 用途 |
|--------|---------|---------|------|------|
| **XT60** | 60A | 高压 | 大电流、锁扣 | 电池主接口 |
| **XT30** | 30A | 中压 | 中等电流 | 电机分路 |
| **DC barrel** | 1-5A | 5-24V | 简单 | 开发板供电 |
| **Anderson PP** | 15-180A | 高压 | 工业级 | 大型机器人 |
| **Deans (T-plug)** | 40A | 高压 | 航模常用 | 小型机器人 |

### 信号连接器

| 连接器 | 间距 | 引脚数 | 特点 | 用途 |
|--------|------|--------|------|------|
| **JST-XH** | 2.5mm | 2-16 | 带锁扣 | 电池平衡头、传感器 |
| **JST-PH** | 2.0mm | 2-16 | 小型 | 小传感器 |
| **JST-SH** | 1.0mm | 2-10 | 微型 | QWIIC (I2C) |
| **Molex Micro-Fit** | 3.0mm | 2-24 | 工业级 | 电机驱动器 |
| **DuPont 2.54mm** | 2.54mm | 任意 | 面包板友好 | 原型开发 |
| **Hirose DF13** | 1.25mm | 2-15 | 可靠紧凑 | Pixhawk 飞控 |

### 防水连接器

| 连接器 | 防护等级 | 引脚数 | 用途 |
|--------|---------|--------|------|
| **M8 圆形** | IP67 | 3-8 | 工业传感器 |
| **M12 圆形** | IP67 | 4-12 | EtherCAT、工业 |
| **IP67 USB** | IP67 | 4 | 户外相机 |

### 快拆设计

机器人维护时需要快速拆装：

- 关节线束使用带锁扣的连接器（不要焊死）
- 模块之间使用标准连接器（M8/M12）
- 每个可拆卸模块有独立的线束

---

## 应力释放（Strain Relief）

连接器最常见的失效模式是线缆拉扯导致焊点/压接点断裂。

**必须做应力释放的位置**：

- 连接器出线处
- 穿过板材的线缆
- 机器人关节附近的线缆
- 任何可能被拉扯的位置

**方法**：

| 方法 | 适用场景 |
|------|----------|
| 热缩管 + 胶 | 连接器尾部 |
| 扎带固定 | 线缆穿越点 |
| 线缆夹（P-clip） | 固定到机架 |
| 拖链 | 直线运动的线缆 |
| 盘簧管 | 旋转关节 |

---

## 压接工具

**强烈建议**使用正规压接工具而非烙铁焊接连接器端子：

| 工具 | 适用连接器 | 价格范围 |
|------|-----------|---------|
| **Engineer PA-09** | JST-XH/PH | ~$30 |
| **Engineer PA-20** | JST-SH、小端子 | ~$30 |
| **IWISS SN-28B** | DuPont 2.54mm | ~$20 |
| **Molex 手动压接钳** | Molex Micro-Fit | ~$40 |
| **XT60 焊接** | XT60（需焊接） | 烙铁 |

**压接 vs. 焊接**：

- 压接：可靠、可重复、专业
- 焊接：灵活但不一致、高温可能损伤线材
- 工业标准要求压接（航空航天强制）

---

## 自定义 PCB 设计

### 何时需要自定义 PCB

- 接线太多太乱（>20 根飞线 → 考虑 PCB）
- 需要特定的电源分配
- 需要信号调理电路（放大、滤波）
- 量产需求
- 尺寸/重量有严格限制

### KiCad 工作流

KiCad 是最流行的开源 PCB 设计软件。

**KiCad 完整流程**为：原理图设计 → 电气规则检查 (ERC) → 分配封装 → PCB 布局 → 布线 → 设计规则检查 (DRC) → 生成 Gerber → 发送工厂制板 → 焊接调试。下一节展开关键环节。

### AWG 选线：载流量与电阻随线号指数变化

回到本章开头的 AWG 表——它不是孤立的查表数据，而是一条物理定律的离散采样：导线截面积随 AWG 号每 +3 减半，因此**载流量随 AWG 号增大近似指数下降，单位长度电阻近似指数上升**。把表里 10 行真实数据画在半 log 坐标上，立刻得到工程师选线时心算的那条曲线；叠加选线判据 $I_{rating} \ge 1.5\,I_{load}$ 的安全线，就能直接读出"带 20 A 电机该选几号线"。

<!-- SVG-DESIGN-NOTES
Type: D (量化关系 / 规模 — AWG 载流量 & 电阻随线号指数变化 双 log 曲线)
Q0 (One Big Idea): AWG 号每 +3，截面积减半 → 载流量近似指数下降、电阻指数上升；选线判据 I_rating≥1.5·I_load 在曲线上是一条把"安全/危险"分开的水平阈值，机器人主线必须落在曲线安全侧
Q1 (几何映射): 双 Y 半 log 坐标——X=AWG 号 (10..28 线性)，左 Y=载流量 A (log 0.8..30)，右 Y=电阻 mΩ/m (log 3..213)；两条用表内 10 个真实点采样的曲线（载流量降、电阻升）+ 典型负载用例直接标在对应点
Q2 (DNA): 去掉标题——两条在 log 轴上近似镜像的指数曲线（一降一升）随 AWG 单调，是线规选型的标准工程图，不会和 KiCad 流程方框混淆
Q3 (装饰删除): 删掉原越界 (viewBox 900 但内容到 x=2020) 的 9 个等大流程方框 + 8 箭头（KiCad 流程已用一句话文字承载，不需图）；不用图例，用例直接贴点
Q4 (直接标注): AWG 号标 X 轴；电池主线/电机/舵机/I2C 等用途直接标在对应载流量点旁；安全判据线上标 1.5×I_load
Q5 (Dark + 双语): 全 var(--dia-*)；载流量曲线 blue、电阻曲线 accent、安全阈区 green 淡填；中文用途标签英文版替换
-->
<div class="diagram">
<svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AWG 载流量与电阻随线号指数变化">
  <text x="380" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">AWG 选线 — 载流量 ↓ 与电阻 ↑ 随线号呈指数</text>

  <!-- plot box x 90..650 (AWG 10..28), y 60..340 -->
  <line x1="90" y1="55" x2="90" y2="340" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <line x1="650" y1="55" x2="650" y2="340" stroke="var(--dia-accent)" stroke-width="1.4"/>
  <line x1="90" y1="340" x2="650" y2="340" stroke="var(--dia-stroke)" stroke-width="1.4"/>

  <!-- left Y: ampacity log 0.8..30 -> y=340..60 ; log range log10(0.8)=-0.097..log10(30)=1.477 span 1.574 -->
  <text x="82" y="64" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">30 A</text>
  <text x="82" y="174" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">5 A</text>
  <text x="82" y="336" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">0.8 A</text>
  <text x="34" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-blue)" transform="rotate(-90 34 200)">载流量 (A, log)</text>

  <!-- right Y: resistance log 3..213 -> mirror -->
  <text x="658" y="336" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">3 mΩ/m</text>
  <text x="658" y="200" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">33</text>
  <text x="658" y="64" text-anchor="start" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">213</text>
  <text x="726" y="200" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-accent)" transform="rotate(90 726 200)">电阻 (mΩ/m, log)</text>

  <!-- X AWG ticks: 10,14,18,22,26,28  x = 90 + (awg-10)/18*560 -->
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <text x="90" y="356" text-anchor="middle">10</text>
    <text x="214" y="356" text-anchor="middle">14</text>
    <text x="339" y="356" text-anchor="middle">18</text>
    <text x="463" y="356" text-anchor="middle">22</text>
    <text x="588" y="356" text-anchor="middle">26</text>
    <text x="650" y="356" text-anchor="middle">28</text>
  </g>
  <text x="370" y="380" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">AWG 线号（越大线越细）</text>

  <!-- ampacity curve: AWG10=30,12=20,14=15,16=10,18=7,20=5,22=3,24=2,26=1.3,28=0.8
       x=90+(awg-10)/18*560 ; y=340-(log10(amp)-(-0.097))/1.574*280  -->
  <polyline points="90,60 152,89 214,108 276,131 339,151 401,174 463,212 525,243 588,278 650,308" fill="none" stroke="var(--dia-blue)" stroke-width="2.2"/>
  <g fill="var(--dia-blue)">
    <circle cx="90" cy="60" r="5"/><circle cx="214" cy="108" r="4"/><circle cx="339" cy="151" r="4"/>
    <circle cx="463" cy="212" r="4"/><circle cx="650" cy="308" r="4"/>
  </g>
  <text x="98" y="54" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG10 电池主线/大电机 30A</text>
  <text x="222" y="103" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG14 中功率 15A</text>
  <text x="347" y="146" text-anchor="start" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG18 小电机/传感器 7A</text>
  <text x="455" y="228" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG22 信号 3A</text>
  <text x="642" y="300" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-blue)">AWG28 极细信号 0.8A</text>

  <!-- resistance curve: 10=3.3,14=8.3,18=21,22=53,26=134,28=213 ; rises -> y mirrored
       y=340-(log10(213)-log10(R))/(log10(213/3))*280 -->
  <polyline points="90,308 152,287 214,261 276,239 339,210 401,184 463,159 525,136 588,108 650,84" fill="none" stroke="var(--dia-accent)" stroke-width="2" stroke-dasharray="6 3"/>
  <g fill="var(--dia-accent)">
    <circle cx="90" cy="308" r="4"/><circle cx="339" cy="210" r="4"/><circle cx="650" cy="84" r="4"/>
  </g>

  <!-- safety criterion band: I_rating >= 1.5 I_load -> example I_load=20A needs >=30A -> AWG10 zone -->
  <line x1="90" y1="89" x2="650" y2="89" stroke="var(--dia-green)" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="640" y="84" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">20A 电机 ⇒ I_rating≥30A ⇒ 选 AWG10（曲线在此线上方才安全）</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — AWG 表的 10 行数据在半 log 坐标上是一对近似镜像的指数曲线：载流量随线号增大指数下降（蓝），单位电阻指数上升（红虚）。绿色阈值线演示选线判据——20 A 电机需 ≥30 A 余量，只有 AWG10 落在安全侧。</p>


### 原理图设计

原理图是电路的逻辑表达。关键步骤：

1. **放置元件**：从库中选择或创建符号
2. **连线**：用导线连接引脚
3. **添加电源符号**：VCC、GND 等
4. **添加去耦电容**：每个 IC 旁放 100nF + 10μF
5. **标注**：元件值、型号

### PCB 布局与布线

**布局原则**：

- 功率器件远离敏感信号
- 去耦电容紧贴 IC 引脚
- 连接器放在板边
- 考虑散热（大电流路径加宽、铺铜）

**布线规则**（2 层板参考）：

| 线宽 | 电流能力 | 用途 |
|------|---------|------|
| 0.2mm | ~0.3A | 信号线 |
| 0.5mm | ~1A | 低功率 |
| 1.0mm | ~2A | 中功率 |
| 2.0mm | ~4A | 电源线 |
| 铺铜 | >5A | 大电流 |

经验公式（外层，1oz 铜厚）：

$$I_{max} \approx 0.048 \cdot \Delta T^{0.44} \cdot A^{0.725}$$

其中 $A$ 为导体截面积（mil²），$\Delta T$ 为允许温升（°C）。

### 常用电路模块

#### 电压分压器

用于电压检测（如电池电压测量）：

$$V_{out} = V_{in} \cdot \frac{R_2}{R_1 + R_2}$$

例：24V 电池电压 → 3.3V ADC 范围：

$$\frac{R_2}{R_1 + R_2} = \frac{3.3}{24} \approx 0.1375$$

选 $R_1 = 100k\Omega$, $R_2 = 15.8k\Omega$。

#### 电平转换器（Level Shifter）

3.3V 和 5V 逻辑互联：

- **单向**：MOSFET + 上拉电阻（BSS138 方案）
- **双向**：TXB0108（8 通道自动方向检测）
- **I2C 专用**：PCA9306（双向，支持不同电压总线）

#### 连接器分线板

将单个高密度连接器分出到多个子系统：

```
                  ┌── IMU (SPI)
[主控板] ── [分线板] ── 电机驱动 (CAN)
                  ├── 传感器 (I2C)
                  └── GPS (UART)
```

---

## PCB 打样

### 国内厂商

| 厂商 | 最低价 | 制板周期 | 特色 |
|------|--------|---------|------|
| **嘉立创 (JLCPCB)** | 5片/¥2 | 1-3天 | 极致性价比 |
| **捷配 (PCBWay)** | 5片/$5 | 2-5天 | 海外发货友好 |
| **华秋 (HQ PCB)** | 5片/¥10 | 1-3天 | KiCad 插件 |

### 打样注意事项

- **最小线宽/线距**：0.15mm（标准工艺）
- **最小孔径**：0.3mm
- **铜厚**：1oz（35μm）标准，2oz 大电流
- **表面处理**：HASL（便宜）、ENIG（焊盘好）
- **板厚**：1.6mm 标准
- **阻焊颜色**：绿色最便宜

### 焊接

**手动焊接**（原型）：

- 烙铁温度：300-360°C
- 助焊剂必不可少
- 0402 以上封装可手焊（经验足够时）
- QFP/TQFP 需要拖焊技巧

**回流焊**（小批量）：

- 钢网涂锡膏 → 贴片 → 加热回流
- 廉价方案：锡膏 + 热风枪 / 电烤箱改装

---

## 线束设计

### 线束图

在复杂机器人中，线束图（Wire Harness Diagram）至关重要：

```
电池 ─[XT60]─ 分电板 ─┬─[XT30]─ 电机驱动器 1
                       ├─[XT30]─ 电机驱动器 2
                       ├─[DC barrel]─ Jetson
                       └─[JST-XH]─ 传感器板

主控 ─┬─[USB-C]─ 深度相机
      ├─[M12]─── LiDAR
      ├─[SPI(JST-SH)]─ IMU
      └─[CAN(Molex)]─── 电机驱动器 CAN 总线
```

### 线束标注规范

每根线/线束应标注：

1. **编号**：W001, W002, ...
2. **来源**：模块名 + 引脚
3. **去向**：模块名 + 引脚
4. **线材**：AWG + 颜色
5. **长度**：实测 + 10% 余量

---

## 电磁兼容（EMC）基础

### 常见干扰源

| 干扰源 | 频率范围 | 影响 |
|--------|---------|------|
| BLDC 电机 PWM | 10-100 kHz | ADC 噪声 |
| 开关电源 | 100 kHz - 1 MHz | 传感器干扰 |
| 数字信号 | MHz 级 | 射频干扰 |

### 缓解措施

1. **电源滤波**：大容量电解电容 + 高频陶瓷电容
2. **地线分离**：模拟地和数字地单点连接
3. **信号屏蔽**：敏感信号使用屏蔽线
4. **布局隔离**：大功率和小信号物理分开
5. **铁氧体磁珠**：抑制高频干扰

$$Z_{ferrite}(f) = R(f) + jX(f)$$

在目标频率范围（通常 10-100 MHz），阻抗显著增大，衰减干扰。

---

## 参考资源

- KiCad 官方教程: [kicad.org](https://www.kicad.org/)
- JLCPCB: [jlcpcb.com](https://jlcpcb.com/)
- IPC-2221: Generic Standard on Printed Board Design
- Phil's Lab (YouTube): PCB 设计实战教程
