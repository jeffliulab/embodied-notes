# CPU架构

## 概述

CPU（中央处理单元）是机器人大脑的核心计算引擎。理解CPU架构有助于选择合适的处理器平台、优化程序性能、以及诊断系统瓶颈。

## 冯·诺依曼 vs 哈佛架构

### 冯·诺依曼架构

指令和数据共享同一存储器和总线：

```
+-------+     +------+     +--------+
|  CPU  |<--->| 总线 |<--->| 存储器 |
+-------+     +------+     +--------+
                              指令+数据
```

- **优点**：结构简单，灵活性高
- **缺点**：指令和数据不能同时访问（冯·诺依曼瓶颈）
- **代表**：x86 PC、大多数通用处理器

### 哈佛架构

指令和数据使用独立的存储器和总线：

```
+-------+     +----------+     +----------+
|       |<--->| 指令总线 |<--->| 指令存储 |
|  CPU  |     +----------+     +----------+
|       |<--->| 数据总线 |<--->| 数据存储 |
+-------+     +----------+     +----------+
```

- **优点**：指令和数据可以并行访问，带宽翻倍
- **缺点**：硬件更复杂
- **代表**：STM32等MCU（内部采用哈佛架构）

### 改进型哈佛架构

现代处理器通常采用**改进型哈佛架构**：

- L1缓存分离（I-Cache + D-Cache）→ 哈佛特性
- 统一的L2/L3缓存和主存 → 冯·诺依曼特性
- ARM Cortex-A系列就是典型的改进型哈佛架构

## 指令流水线

### 经典五级流水线

流水线（Pipeline）通过将指令执行分解为多个阶段，使多条指令同时处于不同阶段：

| 阶段 | 缩写 | 功能 |
|------|------|------|
| 取指（Instruction Fetch） | IF | 从内存取出指令 |
| 译码（Instruction Decode） | ID | 解析指令，读取寄存器 |
| 执行（Execute） | EX | ALU运算或地址计算 |
| 访存（Memory Access） | MEM | 读写数据内存 |
| 写回（Write Back） | WB | 将结果写回寄存器 |

```
时钟周期:   1    2    3    4    5    6    7    8
指令1:     IF   ID   EX  MEM   WB
指令2:          IF   ID   EX  MEM   WB
指令3:               IF   ID   EX  MEM   WB
指令4:                    IF   ID   EX  MEM   WB
```

理想情况下，$n$级流水线在稳定状态下的**吞吐率**为：

$$
\text{Throughput} = \frac{1}{T_{\text{stage}}}
$$

而非流水线的吞吐率为 $\frac{1}{n \cdot T_{\text{stage}}}$，理论加速比为 $n$。

### 流水线冒险（Hazards）

实际中流水线会遇到三类冒险：

**1. 数据冒险（Data Hazard）**

后续指令依赖前序指令的结果：

```
ADD R1, R2, R3   ; R1 = R2 + R3
SUB R4, R1, R5   ; 需要R1的结果，但R1还未写回
```

解决方案：**数据前递（Forwarding/Bypassing）**

**2. 控制冒险（Control Hazard）**

分支指令改变程序流：

```
BEQ R1, R2, LABEL  ; 如果R1==R2则跳转
ADD R3, R4, R5      ; 这条指令该不该执行？
```

解决方案：**分支预测（Branch Prediction）**

**3. 结构冒险（Structural Hazard）**

硬件资源冲突（如两条指令同时需要访问内存）。

解决方案：增加硬件资源（如分离I-Cache和D-Cache）

## 缓存层次结构

### 存储层次

$$
\text{访问时间}: \text{寄存器} < \text{L1} < \text{L2} < \text{L3} < \text{DRAM} < \text{SSD} < \text{HDD}
$$

| 层次 | 典型大小 | 典型延迟 | 带宽 |
|------|----------|----------|------|
| 寄存器 | ~1KB | <1ns | - |
| L1 Cache | 32-64KB | 1-2ns | ~500GB/s |
| L2 Cache | 256KB-1MB | 3-10ns | ~200GB/s |
| L3 Cache | 2-32MB | 10-30ns | ~100GB/s |
| DRAM | 4-32GB | 50-100ns | ~50GB/s |
| SSD | 128GB-2TB | ~100μs | ~3GB/s |

### 缓存命中率

缓存的性能取决于**命中率（Hit Rate）**：

$$
T_{\text{avg}} = T_{\text{hit}} + (1 - h) \times T_{\text{miss}}
$$

其中 $h$ 是命中率，$T_{\text{hit}}$ 是缓存命中延迟，$T_{\text{miss}}$ 是缓存未命中的额外延迟。

!!! example "缓存对机器人的影响"
    图像处理时，按行扫描（行优先）比按列扫描对缓存更友好，因为图像在内存中按行存储。这种**空间局部性（Spatial Locality）**的利用可以显著提升处理速度。

### 缓存映射方式

- **直接映射（Direct Mapped）**：每个地址只能映射到一个缓存行
- **全相联（Fully Associative）**：每个地址可以映射到任意缓存行
- **组相联（Set Associative）**：折中方案，N路组相联

## x86 vs ARM vs RISC-V

### 指令集对比

| 特性 | x86-64 | ARM (AArch64) | RISC-V |
|------|--------|---------------|--------|
| 类型 | CISC | RISC | RISC |
| 指令长度 | 变长(1-15字节) | 固定(4字节) | 固定(4字节) |
| 寄存器数量 | 16通用 | 31通用 | 32通用 |
| 指令数量 | ~1500+ | ~1000 | ~50(基础) |
| 功耗效率 | 低 | 高 | 高 |
| 生态系统 | 最成熟 | 移动端成熟 | 快速发展中 |
| 授权模式 | Intel/AMD专有 | ARM授权 | 开源免费 |

### ARM在机器人中的应用

ARM处理器因其高能效比在机器人领域占据主导地位：

**Cortex-A系列（应用处理器）**：

| 处理器 | 核心 | 频率 | 特点 | 应用平台 |
|--------|------|------|------|----------|
| Cortex-A55 | ARMv8.2 | 1.8GHz | 高效率核 | 低功耗SoC |
| Cortex-A76 | ARMv8.2 | 3.0GHz | 高性能核 | Raspberry Pi 5 |
| Cortex-A78AE | ARMv8.2 | 2.2GHz | 汽车安全等级 | Jetson Orin系列 |

**Cortex-M系列（微控制器）**：

| 处理器 | 架构 | 频率 | 特点 | 典型芯片 |
|--------|------|------|------|----------|
| Cortex-M0+ | ARMv6-M | 48MHz | 最低功耗 | STM32L0 |
| Cortex-M4 | ARMv7E-M | 168MHz | DSP+FPU | STM32F4 |
| Cortex-M7 | ARMv7E-M | 480MHz | 双精度FPU | STM32H7 |
| Cortex-M33 | ARMv8-M | 160MHz | TrustZone安全 | STM32U5 |

### RISC-V的潜力

RISC-V作为开源指令集架构，正在嵌入式和机器人领域获得关注：

- **模块化设计**：基础整数指令集(I) + 可选扩展(M/A/F/D/C/V)
- **无授权费用**：降低芯片成本
- **可定制化**：可以添加自定义指令加速特定任务
- **代表芯片**：ESP32-C3、StarFive JH7110

## 性能分析

### CPI（Cycles Per Instruction）

$$
\text{CPI} = \frac{\text{总时钟周期数}}{\text{总指令数}}
$$

对于不同指令类别的加权CPI：

$$
\text{CPI}_{\text{avg}} = \sum_{i=1}^{n} \text{CPI}_i \times f_i
$$

其中 $f_i$ 是第 $i$ 类指令的频率占比。

### Amdahl定律

当我们优化系统的某个部分时，总体加速比为：

$$
S = \frac{1}{(1-P) + \frac{P}{N}}
$$

其中：

- $P$ = 可并行化的比例
- $N$ = 并行处理单元数量
- $S$ = 总体加速比

!!! example "Amdahl定律示例"
    如果程序中80%可以并行化（$P=0.8$），使用4个核心（$N=4$）：
    
    $$S = \frac{1}{(1-0.8) + \frac{0.8}{4}} = \frac{1}{0.2 + 0.2} = 2.5$$
    
    即使使用无限多核心：
    
    $$S_{\max} = \frac{1}{1-P} = \frac{1}{0.2} = 5$$
    
    串行部分决定了加速的上限。

### 实际案例：机器人路径规划

假设一个路径规划算法：

- A*搜索（串行）：占60%计算时间
- 碰撞检测（可并行）：占40%计算时间

在Jetson Orin（8核A78AE + 2048 CUDA核心）上：

$$
S_{\text{CPU}} = \frac{1}{0.6 + \frac{0.4}{8}} = \frac{1}{0.65} \approx 1.54
$$

即使将碰撞检测完全并行化到GPU：

$$
S_{\text{GPU}} = \frac{1}{0.6 + \frac{0.4}{2048}} \approx \frac{1}{0.6002} \approx 1.67
$$

关键瓶颈在串行的A*搜索部分。

## 处理器选型指南

<!-- SVG-DESIGN-NOTES
Type: D (量化 — log-log 散点：算力 vs 功耗)
Q0: 处理器选型不是决策树，而是 4 个数量级 TOPS 与 2 个数量级功耗的 trade-off：STM32 (0.01W, 0 TOPS) → Jetson AGX (60W, 275 TOPS)；同一功耗预算下不同芯片性能可差 100×
Q1: 双 log 散点图：x 轴 = 功耗 W (log 0.1-100)，y 轴 = AI 算力 TOPS (log 0.01-1000)；6 个真实平台用气泡 (圆面积 ∝ 价格)，用 iso-efficiency 对角线 (TOPS/W) 注明
Q2: 去掉标题：6 个气泡 + 对角 TOPS/W 等值线 — DNA 是芯片选型标尺
Q3: 删去原 12 个等大方框 + 8 个箭头 (本来就不是 decision tree)
Q4: 每个气泡旁直标 W 和 TOPS
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">机器人处理器选型 — TOPS / W trade-off</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">log-log scatter of common platforms</text>

  <!-- axes: x in [0.1..100]W maps log to [80..680]; y in [0.01..1000]TOPS maps log to [380..80] -->
  <line x1="80" y1="380" x2="680" y2="380" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="380" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <!-- x ticks: 0.1 1 10 100 -->
    <line x1="80"  y1="378" x2="80"  y2="384"/><text x="80"  y="398" text-anchor="middle">0.1 W</text>
    <line x1="280" y1="378" x2="280" y2="384"/><text x="280" y="398" text-anchor="middle">1 W</text>
    <line x1="480" y1="378" x2="480" y2="384"/><text x="480" y="398" text-anchor="middle">10 W</text>
    <line x1="680" y1="378" x2="680" y2="384"/><text x="680" y="398" text-anchor="middle">100 W</text>
    <!-- y ticks: 0.01 0.1 1 10 100 1000 -->
    <line x1="76" y1="380" x2="84" y2="380"/><text x="72" y="384" text-anchor="end">0.01</text>
    <line x1="76" y1="320" x2="84" y2="320"/><text x="72" y="324" text-anchor="end">0.1</text>
    <line x1="76" y1="260" x2="84" y2="260"/><text x="72" y="264" text-anchor="end">1</text>
    <line x1="76" y1="200" x2="84" y2="200"/><text x="72" y="204" text-anchor="end">10</text>
    <line x1="76" y1="140" x2="84" y2="140"/><text x="72" y="144" text-anchor="end">100</text>
    <line x1="76" y1="80"  x2="84" y2="80" /><text x="72" y="84"  text-anchor="end">1000</text>
  </g>
  <text x="380" y="418" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">功耗 Power (W, log)</text>
  <text x="22" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 220)">AI 算力 (TOPS, log)</text>

  <!-- iso-efficiency lines: TOPS/W = 0.1, 1, 10 -->
  <line x1="80" y1="260" x2="680" y2="-40" stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.65"/>
  <text x="640" y="60" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" font-style="italic">10 TOPS/W</text>
  <line x1="80" y1="320" x2="680" y2="20"  stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.55"/>
  <text x="640" y="118" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" font-style="italic">1 TOPS/W</text>
  <line x1="80" y1="380" x2="680" y2="80"  stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.45"/>
  <text x="640" y="178" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" font-style="italic">0.1 TOPS/W</text>

  <!-- bubbles -->
  <!-- STM32F4: 0.3W, 0 TOPS (DSP only)→use 0.01 -->
  <circle cx="186" cy="378" r="9" fill="var(--dia-blue)" fill-opacity="0.45" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="192" y="370" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">STM32F4</text>
  <text x="192" y="382" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0.3 W · MCU</text>

  <!-- STM32H7: 0.5W, FPU only -->
  <circle cx="220" cy="370" r="10" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="232" y="362" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">STM32H7</text>
  <text x="232" y="375" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0.5 W · 480 MHz · DSP</text>

  <!-- Raspberry Pi 5: 8W, ~0.5 TOPS via NEON -->
  <circle cx="455" cy="290" r="13" fill="var(--dia-green)" fill-opacity="0.45" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="470" y="284" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Raspberry Pi 5</text>
  <text x="470" y="297" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">8 W · 0.5 TOPS</text>

  <!-- Jetson Orin Nano: 12W, 40 TOPS -->
  <circle cx="490" cy="174" r="14" fill="var(--dia-accent)" fill-opacity="0.45" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="438" y="166" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Orin Nano</text>
  <text x="438" y="178" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">12 W · 40 TOPS</text>

  <!-- Jetson Orin NX: 25W, 100 TOPS -->
  <circle cx="552" cy="140" r="17" fill="var(--dia-accent)" fill-opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.6"/>
  <text x="572" y="134" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Orin NX</text>
  <text x="572" y="146" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">25 W · 100 TOPS</text>

  <!-- Jetson AGX Orin: 60W, 275 TOPS -->
  <circle cx="640" cy="115" r="22" fill="var(--dia-accent)" fill-opacity="0.65" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="600" y="98" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)" font-weight="600">AGX Orin</text>
  <text x="600" y="111" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">60 W · 275 TOPS</text>

  <!-- annotation regions -->
  <text x="200" y="80" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">↑ servers / desktop GPU</text>
  <text x="160" y="350" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">实时控制 MCU 区</text>
  <text x="500" y="220" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">边缘 AI 推理区</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — 同一功耗预算下,正确的对角线决定了能用什么算法。</p>


## 小结

1. 现代CPU采用**改进型哈佛架构**，兼顾性能和灵活性
2. **流水线**是CPU提升吞吐率的基本手段，但受限于各类冒险
3. **缓存层次**对性能影响巨大，编写缓存友好的代码很重要
4. **ARM在机器人领域占主导**，Cortex-A用于主控，Cortex-M用于实时控制
5. **Amdahl定律**提醒我们关注串行瓶颈

## 参考资料

- Patterson, D. A., & Hennessy, J. L. *Computer Organization and Design: The RISC-V Edition*
- ARM Architecture Reference Manual for A-profile architecture
- RISC-V ISA Specification: [https://riscv.org/specifications/](https://riscv.org/specifications/)
