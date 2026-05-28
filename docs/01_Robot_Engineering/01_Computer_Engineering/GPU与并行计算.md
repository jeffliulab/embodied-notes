# GPU与并行计算

## 概述

GPU（图形处理单元）最初为图形渲染设计，但其大规模并行架构使其成为深度学习推理和传感器数据处理的理想加速器。在机器人系统中，GPU负责视觉感知、点云处理和神经网络推理等计算密集型任务。

## GPU架构基础

### CPU vs GPU：设计哲学

| 特性 | CPU | GPU |
|------|-----|-----|
| 核心数 | 4-16（大核） | 数百至数千（小核） |
| 时钟频率 | 2-5 GHz | 1-2 GHz |
| 缓存 | 大（数十MB L3） | 小（数MB L2） |
| 控制逻辑 | 复杂（分支预测、乱序执行） | 简单 |
| 适合任务 | 复杂逻辑、低延迟 | 大规模并行、高吞吐 |
| 设计目标 | 最小化延迟 | 最大化吞吐量 |

```
CPU: 少量大核心，优化延迟
┌──────────────┐  ┌──────────────┐
│   大核心 1    │  │   大核心 2    │
│ [控制] [ALU] │  │ [控制] [ALU] │
│ [L1 Cache]   │  │ [L1 Cache]   │
└──────────────┘  └──────────────┘
        ┌──────────────────┐
        │    大 L3 Cache    │
        └──────────────────┘

GPU: 大量小核心，优化吞吐
┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐
│core││core││core││core││core││core││core││core│ ...
└────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘
```

### NVIDIA GPU架构

NVIDIA GPU的核心组织结构：

**Streaming Multiprocessor (SM)**

SM是GPU的基本计算单元，每个SM包含：

- **CUDA核心（FP32）**：执行浮点运算
- **Tensor核心**：专用矩阵运算加速器
- **共享内存（Shared Memory）**：SM内线程共享的低延迟存储
- **寄存器文件**：大量寄存器支持线程上下文
- **Warp调度器**：管理线程束的执行

<!-- SVG-DESIGN-NOTES
Type: A (硬件拓扑 — GPU 内部层次：SM 内部细节 + SM 阵列 + 共享 L2/HBM)
Q0: GPU 不是"CPU+CUDA core"，而是嵌套结构：一个 SM 内部有 128 CUDA core + 4 Tensor core + shared mem + warp scheduler；多个 SM 共用一个 L2 + 全局 VRAM；并行度来自这种"内并行 × 外并行"的乘积
Q1: 顶部放大一个 SM（占空间多）展示其内部 4 子组件（CUDA cores 是密集小点阵 16×8、Tensor core 用矩形）；下方画 8 个小 SM rectangle 拼成阵列共享 L2 bar，再连到底部 VRAM bar
Q2: 去掉标题：上面一个细致 SM + 下面 8 个 mini-SM 共用宽 L2 + 宽 VRAM — DNA 独特
Q3: 删去原 13 个等大方框
Q4: "128 CUDA · 4 Tensor · 128 KB SMEM" 标在 SM 内部
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 760 540" xmlns="http://www.w3.org/2000/svg">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">NVIDIA Ampere GPU — 嵌套并行</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">A single SM zoomed in, then 8 SMs sharing L2 + VRAM</text>

  <!-- one big SM with internals -->
  <rect x="60" y="68" width="640" height="180" rx="10" fill="var(--dia-bg)" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="80" y="90" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="13" fill="var(--dia-accent)">SM_0  (Streaming Multiprocessor)</text>

  <!-- 128 CUDA cores as 16x8 dot grid -->
  <g fill="var(--dia-accent)">
    <!-- generate dot pattern 16 cols × 8 rows, x:90..330, y:110..240, step 16 -->
  </g>
  <g>
    <!-- 16 columns × 8 rows -->
    <g fill="var(--dia-accent)">
      <circle cx="90"  cy="110" r="3"/><circle cx="106" cy="110" r="3"/><circle cx="122" cy="110" r="3"/><circle cx="138" cy="110" r="3"/><circle cx="154" cy="110" r="3"/><circle cx="170" cy="110" r="3"/><circle cx="186" cy="110" r="3"/><circle cx="202" cy="110" r="3"/><circle cx="218" cy="110" r="3"/><circle cx="234" cy="110" r="3"/><circle cx="250" cy="110" r="3"/><circle cx="266" cy="110" r="3"/><circle cx="282" cy="110" r="3"/><circle cx="298" cy="110" r="3"/><circle cx="314" cy="110" r="3"/><circle cx="330" cy="110" r="3"/>
      <circle cx="90"  cy="126" r="3"/><circle cx="106" cy="126" r="3"/><circle cx="122" cy="126" r="3"/><circle cx="138" cy="126" r="3"/><circle cx="154" cy="126" r="3"/><circle cx="170" cy="126" r="3"/><circle cx="186" cy="126" r="3"/><circle cx="202" cy="126" r="3"/><circle cx="218" cy="126" r="3"/><circle cx="234" cy="126" r="3"/><circle cx="250" cy="126" r="3"/><circle cx="266" cy="126" r="3"/><circle cx="282" cy="126" r="3"/><circle cx="298" cy="126" r="3"/><circle cx="314" cy="126" r="3"/><circle cx="330" cy="126" r="3"/>
      <circle cx="90"  cy="142" r="3"/><circle cx="106" cy="142" r="3"/><circle cx="122" cy="142" r="3"/><circle cx="138" cy="142" r="3"/><circle cx="154" cy="142" r="3"/><circle cx="170" cy="142" r="3"/><circle cx="186" cy="142" r="3"/><circle cx="202" cy="142" r="3"/><circle cx="218" cy="142" r="3"/><circle cx="234" cy="142" r="3"/><circle cx="250" cy="142" r="3"/><circle cx="266" cy="142" r="3"/><circle cx="282" cy="142" r="3"/><circle cx="298" cy="142" r="3"/><circle cx="314" cy="142" r="3"/><circle cx="330" cy="142" r="3"/>
      <circle cx="90"  cy="158" r="3"/><circle cx="106" cy="158" r="3"/><circle cx="122" cy="158" r="3"/><circle cx="138" cy="158" r="3"/><circle cx="154" cy="158" r="3"/><circle cx="170" cy="158" r="3"/><circle cx="186" cy="158" r="3"/><circle cx="202" cy="158" r="3"/><circle cx="218" cy="158" r="3"/><circle cx="234" cy="158" r="3"/><circle cx="250" cy="158" r="3"/><circle cx="266" cy="158" r="3"/><circle cx="282" cy="158" r="3"/><circle cx="298" cy="158" r="3"/><circle cx="314" cy="158" r="3"/><circle cx="330" cy="158" r="3"/>
      <circle cx="90"  cy="174" r="3"/><circle cx="106" cy="174" r="3"/><circle cx="122" cy="174" r="3"/><circle cx="138" cy="174" r="3"/><circle cx="154" cy="174" r="3"/><circle cx="170" cy="174" r="3"/><circle cx="186" cy="174" r="3"/><circle cx="202" cy="174" r="3"/><circle cx="218" cy="174" r="3"/><circle cx="234" cy="174" r="3"/><circle cx="250" cy="174" r="3"/><circle cx="266" cy="174" r="3"/><circle cx="282" cy="174" r="3"/><circle cx="298" cy="174" r="3"/><circle cx="314" cy="174" r="3"/><circle cx="330" cy="174" r="3"/>
      <circle cx="90"  cy="190" r="3"/><circle cx="106" cy="190" r="3"/><circle cx="122" cy="190" r="3"/><circle cx="138" cy="190" r="3"/><circle cx="154" cy="190" r="3"/><circle cx="170" cy="190" r="3"/><circle cx="186" cy="190" r="3"/><circle cx="202" cy="190" r="3"/><circle cx="218" cy="190" r="3"/><circle cx="234" cy="190" r="3"/><circle cx="250" cy="190" r="3"/><circle cx="266" cy="190" r="3"/><circle cx="282" cy="190" r="3"/><circle cx="298" cy="190" r="3"/><circle cx="314" cy="190" r="3"/><circle cx="330" cy="190" r="3"/>
      <circle cx="90"  cy="206" r="3"/><circle cx="106" cy="206" r="3"/><circle cx="122" cy="206" r="3"/><circle cx="138" cy="206" r="3"/><circle cx="154" cy="206" r="3"/><circle cx="170" cy="206" r="3"/><circle cx="186" cy="206" r="3"/><circle cx="202" cy="206" r="3"/><circle cx="218" cy="206" r="3"/><circle cx="234" cy="206" r="3"/><circle cx="250" cy="206" r="3"/><circle cx="266" cy="206" r="3"/><circle cx="282" cy="206" r="3"/><circle cx="298" cy="206" r="3"/><circle cx="314" cy="206" r="3"/><circle cx="330" cy="206" r="3"/>
      <circle cx="90"  cy="222" r="3"/><circle cx="106" cy="222" r="3"/><circle cx="122" cy="222" r="3"/><circle cx="138" cy="222" r="3"/><circle cx="154" cy="222" r="3"/><circle cx="170" cy="222" r="3"/><circle cx="186" cy="222" r="3"/><circle cx="202" cy="222" r="3"/><circle cx="218" cy="222" r="3"/><circle cx="234" cy="222" r="3"/><circle cx="250" cy="222" r="3"/><circle cx="266" cy="222" r="3"/><circle cx="282" cy="222" r="3"/><circle cx="298" cy="222" r="3"/><circle cx="314" cy="222" r="3"/><circle cx="330" cy="222" r="3"/>
    </g>
  </g>
  <text x="210" y="240" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)">128 CUDA cores (FP32)</text>

  <!-- 4 Tensor cores as larger rectangles -->
  <rect x="360" y="106" width="60" height="32" rx="3" fill="var(--dia-gold)" fill-opacity="0.45" stroke="var(--dia-gold)" stroke-width="1.4"/>
  <rect x="360" y="142" width="60" height="32" rx="3" fill="var(--dia-gold)" fill-opacity="0.45" stroke="var(--dia-gold)" stroke-width="1.4"/>
  <rect x="360" y="178" width="60" height="32" rx="3" fill="var(--dia-gold)" fill-opacity="0.45" stroke="var(--dia-gold)" stroke-width="1.4"/>
  <rect x="360" y="214" width="60" height="32" rx="3" fill="var(--dia-gold)" fill-opacity="0.45" stroke="var(--dia-gold)" stroke-width="1.4"/>
  <text x="390" y="125" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">Tensor</text>
  <text x="390" y="161" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">Tensor</text>
  <text x="390" y="197" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">Tensor</text>
  <text x="390" y="233" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke)">Tensor</text>

  <!-- Shared mem block -->
  <rect x="440" y="106" width="120" height="60" rx="4" fill="var(--dia-green)" fill-opacity="0.30" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="500" y="130" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Shared Mem</text>
  <text x="500" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">128 KB · 1 cyc</text>
  <text x="500" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">block-shared</text>

  <!-- Warp schedulers -->
  <rect x="440" y="180" width="120" height="60" rx="4" fill="var(--dia-blue)" fill-opacity="0.25" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="500" y="202" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">4× Warp Scheduler</text>
  <text x="500" y="218" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">32 threads / warp</text>
  <text x="500" y="232" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">SIMT dispatch</text>

  <!-- Register file -->
  <rect x="580" y="106" width="100" height="134" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1.2"/>
  <text x="630" y="130" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Register File</text>
  <text x="630" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">256 KB</text>
  <g stroke="var(--dia-stroke-soft)" stroke-width="0.5" opacity="0.5">
    <line x1="592" y1="160" x2="668" y2="160"/>
    <line x1="592" y1="175" x2="668" y2="175"/>
    <line x1="592" y1="190" x2="668" y2="190"/>
    <line x1="592" y1="205" x2="668" y2="205"/>
    <line x1="592" y1="220" x2="668" y2="220"/>
  </g>

  <!-- 8 mini SMs in array -->
  <g>
    <rect x="60"  y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="97" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_0</text>
    <rect x="140" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="177" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_1</text>
    <rect x="220" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="257" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_2</text>
    <rect x="300" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="337" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_3</text>
    <rect x="380" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="417" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_4</text>
    <rect x="460" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="497" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_5</text>
    <rect x="540" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="577" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_6</text>
    <rect x="620" y="290" width="74" height="46" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-accent)" stroke-width="1.3"/>
    <text x="657" y="318" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">SM_7</text>
  </g>
  <text x="380" y="280" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">… 8 SMs total (Orin Nano) · 16 (Orin NX) · 64 (RTX 4090)</text>

  <!-- L2 cache bar -->
  <rect x="60" y="360" width="640" height="34" rx="3" fill="var(--dia-green)" fill-opacity="0.20" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="380" y="382" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" fill="var(--dia-stroke)">L2 Cache  ·  ~4 MB  ·  shared by all SMs</text>

  <!-- VRAM bar (wider segmented) -->
  <rect x="60" y="420" width="640" height="48" rx="3" fill="var(--dia-blue)" fill-opacity="0.25" stroke="var(--dia-blue)" stroke-width="1.6"/>
  <g stroke="var(--dia-blue)" stroke-width="0.6" opacity="0.55">
    <line x1="120" y1="420" x2="120" y2="468"/>
    <line x1="180" y1="420" x2="180" y2="468"/>
    <line x1="240" y1="420" x2="240" y2="468"/>
    <line x1="300" y1="420" x2="300" y2="468"/>
    <line x1="360" y1="420" x2="360" y2="468"/>
    <line x1="420" y1="420" x2="420" y2="468"/>
    <line x1="480" y1="420" x2="480" y2="468"/>
    <line x1="540" y1="420" x2="540" y2="468"/>
    <line x1="600" y1="420" x2="600" y2="468"/>
    <line x1="660" y1="420" x2="660" y2="468"/>
  </g>
  <text x="380" y="448" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" fill="var(--dia-stroke)">Global Memory / VRAM (LPDDR5 on Jetson · GDDR6X on RTX)</text>
  <text x="380" y="464" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">8–80 GB · ~200 GB/s</text>

  <!-- connectivity arrows -->
  <path d="M 97 336 L 380 358" stroke="var(--dia-stroke-soft)" stroke-width="0.9" fill="none"/>
  <path d="M 657 336 L 380 358" stroke="var(--dia-stroke-soft)" stroke-width="0.9" fill="none"/>
  <path d="M 380 394 L 380 418" stroke="var(--dia-stroke)" stroke-width="1.5"/>

  <text x="380" y="500" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">parallelism = SMs × warps × threads/warp = 8 × 4 × 32 = 1024 (Orin Nano)</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — GPU 并行度是嵌套乘积；写 kernel 时要让线程数远超 SM 数才能隐藏内存延迟。</p>


### SIMT执行模型

GPU采用**SIMT（Single Instruction, Multiple Threads）**执行模型：

- 线程以**Warp**（32个线程）为单位执行
- 同一Warp内的线程执行相同的指令
- 但可以操作不同的数据（不同地址、不同寄存器）

$$
\text{GPU总线程数} = \text{SM数量} \times \text{每SM最大线程数}
$$

!!! warning "Warp分歧（Warp Divergence）"
    当Warp内的线程遇到条件分支走向不同路径时，GPU必须**串行执行**两条路径。这会严重降低效率：
    
    ```c
    if (threadIdx.x % 2 == 0) {
        // 偶数线程执行这里
    } else {
        // 奇数线程执行这里
    }
    // 最坏情况：性能减半
    ```

## CUDA编程基础

### 线程层次

CUDA采用分层的线程组织：

| 层次 | 说明 | 对应硬件 |
|------|------|----------|
| Thread | 最小执行单位 | CUDA核心 |
| Warp | 32个线程 | SM中的Warp调度单位 |
| Block | 多个Warp | 映射到一个SM |
| Grid | 多个Block | 整个GPU |

### 内存层次

| 内存类型 | 大小 | 延迟 | 作用域 |
|----------|------|------|--------|
| 寄存器 | ~256KB/SM | 1周期 | 单线程 |
| 共享内存 | 64-228KB/SM | ~5周期 | Block内共享 |
| L1 Cache | 与共享内存共享 | ~30周期 | SM |
| L2 Cache | 数MB | ~200周期 | 全GPU |
| Global Memory (VRAM) | 4-80GB | ~400周期 | 全GPU |

### CUDA Kernel示例

```cuda
// 向量加法 - 最基本的CUDA kernel
__global__ void vectorAdd(float* A, float* B, float* C, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        C[idx] = A[idx] + B[idx];
    }
}

// 启动kernel
int threadsPerBlock = 256;
int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;
vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);
```

### 图像处理示例

```cuda
// 图像灰度化 - 机器人视觉预处理
__global__ void rgb2gray(unsigned char* rgb, unsigned char* gray, 
                         int width, int height) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x < width && y < height) {
        int idx = y * width + x;
        int rgb_idx = idx * 3;
        // ITU-R BT.601 标准
        gray[idx] = (unsigned char)(0.299f * rgb[rgb_idx] + 
                                     0.587f * rgb[rgb_idx+1] + 
                                     0.114f * rgb[rgb_idx+2]);
    }
}

// 2D grid启动
dim3 block(16, 16);
dim3 grid((width+15)/16, (height+15)/16);
rgb2gray<<<grid, block>>>(d_rgb, d_gray, width, height);
```

## 并行加速理论

### 理论加速比

理想情况下，$N$ 个处理单元的加速比：

$$
S_{\text{ideal}} = N
$$

实际加速比受限于：

$$
S_{\text{actual}} = \frac{T_{\text{serial}}}{T_{\text{parallel}}} = \frac{T_{\text{serial}}}{T_{\text{serial\_part}} + \frac{T_{\text{parallel\_part}}}{N} + T_{\text{overhead}}}
$$

其中 $T_{\text{overhead}}$ 包括：

- 线程创建和同步开销
- 内存拷贝开销（CPU↔GPU）
- 负载不均衡

### Gustafson定律

与Amdahl定律（固定问题规模）不同，Gustafson定律考虑**随处理器数增加扩展问题规模**：

$$
S_G = N - \alpha(N-1)
$$

其中 $\alpha$ 是串行部分的比例。这解释了为什么GPU在大规模数据处理中如此有效。

## TensorRT推理加速

### TensorRT优化流程

TensorRT是NVIDIA的深度学习推理优化器：

<!-- SVG-DESIGN-NOTES
Type: C (过程演化 + Type B 双 y 轴: latency 与 model size 同步变化)
Q0: TensorRT 不是 6 个等大方框串联，而是 latency 单调下降 4× / model size 下降 4×的优化漏斗；每一步去掉一些层、压缩一些参数
Q1: 顶部 4 个阶段沿 x 轴展开 (parse / fusion / quantize / autotune)；阶段下方画双 y 轴折线：左 y = latency (ms, 由 45 → 5)，右 y = model size MB (由 250 → 65)；阶段标志用不同 marker
Q2: 去掉标题：4 阶段 + 两条单调下降折线 + 实际数字 — DNA 是 4 倍优化曲线
Q3: 删去原 6 个等大方框
Q4: 每个阶段点直接标 ms 数值
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">TensorRT 优化漏斗 — latency 与 size 同步降 4×</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">YOLOv8n on Orin NX · FP32 baseline → INT8 optimized</text>

  <!-- axes -->
  <line x1="80" y1="240" x2="680" y2="240" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="60" x2="80" y2="240" stroke="var(--dia-accent)" stroke-width="1"/>
  <line x1="680" y1="60" x2="680" y2="240" stroke="var(--dia-blue)" stroke-width="1"/>

  <!-- left y ticks (latency 0..50 ms) -->
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">
    <line x1="76" y1="60"  x2="84" y2="60" /><text x="72" y="64"  text-anchor="end">50</text>
    <line x1="76" y1="100" x2="84" y2="100"/><text x="72" y="104" text-anchor="end">40</text>
    <line x1="76" y1="140" x2="84" y2="140"/><text x="72" y="144" text-anchor="end">30</text>
    <line x1="76" y1="180" x2="84" y2="180"/><text x="72" y="184" text-anchor="end">20</text>
    <line x1="76" y1="220" x2="84" y2="220"/><text x="72" y="224" text-anchor="end">10</text>
    <line x1="76" y1="240" x2="84" y2="240"/>
  </g>
  <text x="24" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-accent)" transform="rotate(-90 24 148)">latency (ms)</text>

  <!-- right y ticks (size 0..300 MB) -->
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-blue)">
    <line x1="676" y1="60"  x2="684" y2="60" /><text x="690" y="64"  text-anchor="start">300</text>
    <line x1="676" y1="120" x2="684" y2="120"/><text x="690" y="124" text-anchor="start">200</text>
    <line x1="676" y1="180" x2="684" y2="180"/><text x="690" y="184" text-anchor="start">100</text>
    <line x1="676" y1="240" x2="684" y2="240"/><text x="690" y="244" text-anchor="start">0</text>
  </g>
  <text x="710" y="148" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-blue)" transform="rotate(90 710 148)">model size (MB)</text>

  <!-- stage x positions: 150, 290, 430, 570 -->
  <g font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke)">
    <text x="150" y="278" text-anchor="middle">① ONNX parse</text>
    <text x="290" y="278" text-anchor="middle">② layer fusion</text>
    <text x="430" y="278" text-anchor="middle">③ INT8 quantize</text>
    <text x="570" y="278" text-anchor="middle">④ kernel auto-tune</text>
    <text x="150" y="296" text-anchor="middle" font-size="9" fill="var(--dia-stroke-soft)">PyTorch / ONNX</text>
    <text x="290" y="296" text-anchor="middle" font-size="9" fill="var(--dia-stroke-soft)">Conv+BN+ReLU → 1 kernel</text>
    <text x="430" y="296" text-anchor="middle" font-size="9" fill="var(--dia-stroke-soft)">calibration set · KL-div</text>
    <text x="570" y="296" text-anchor="middle" font-size="9" fill="var(--dia-stroke-soft)">try 10× kernels, pick fastest</text>
  </g>

  <!-- latency curve (red) -->
  <!-- baseline 45ms (y=80), parse 45 (y=80), fusion 28 (y=128), int8 12 (y=192), autotune 5 (y=220) -->
  <polyline points="80,80 150,80 290,128 430,192 570,220 680,220" fill="none" stroke="var(--dia-accent)" stroke-width="2.2"/>
  <g fill="var(--dia-accent)">
    <circle cx="150" cy="80" r="4.5"/>
    <circle cx="290" cy="128" r="4.5"/>
    <circle cx="430" cy="192" r="4.5"/>
    <circle cx="570" cy="220" r="4.5"/>
  </g>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent)" font-weight="600">
    <text x="150" y="74" text-anchor="middle">45 ms</text>
    <text x="290" y="122" text-anchor="middle">28 ms</text>
    <text x="430" y="186" text-anchor="middle">12 ms</text>
    <text x="570" y="214" text-anchor="middle">5 ms</text>
  </g>

  <!-- model size curve (blue) -->
  <!-- baseline 250MB (y=90), 250 (y=90), 220 (y=108), 65 (y=201), 65 (y=201) -->
  <polyline points="80,90 150,90 290,108 430,201 570,201 680,201" fill="none" stroke="var(--dia-blue)" stroke-width="2.2" stroke-dasharray="4 2"/>
  <g fill="var(--dia-blue)">
    <rect x="146" y="86" width="8" height="8"/>
    <rect x="286" y="104" width="8" height="8"/>
    <rect x="426" y="197" width="8" height="8"/>
    <rect x="566" y="197" width="8" height="8"/>
  </g>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">
    <text x="170" y="96" text-anchor="start">250 MB</text>
    <text x="310" y="114" text-anchor="start">220 MB</text>
    <text x="450" y="210" text-anchor="start">65 MB (INT8)</text>
  </g>
</svg>
</div>
<p class="figure-caption">Figure 2 — INT8 量化是最大单步收益; layer fusion 几乎免费; auto-tuning 把剩余 latency 再吃掉一半。</p>


### 关键优化技术

| 技术 | 说明 | 典型加速比 |
|------|------|-----------|
| 层融合 | 合并Conv+BN+ReLU为一个kernel | 1.5-2x |
| FP16推理 | 半精度浮点 | 2-3x |
| INT8量化 | 8位整数推理 | 3-5x |
| 动态batch | 自动选择最优batch size | 1.2-1.5x |

### 推理性能示例

在Jetson Orin NX上的典型推理性能：

| 模型 | FP32 | FP16 | INT8 | 用途 |
|------|------|------|------|------|
| YOLOv8n | 45 FPS | 120 FPS | 200 FPS | 目标检测 |
| YOLOv8s | 25 FPS | 70 FPS | 130 FPS | 目标检测 |
| MobileNetV3 | 200 FPS | 500 FPS | 800 FPS | 图像分类 |
| PointPillars | 15 FPS | 35 FPS | 60 FPS | 3D目标检测 |

## Jetson GPU规格对比

| 特性 | Orin Nano | Orin NX | AGX Orin |
|------|-----------|---------|----------|
| GPU架构 | Ampere | Ampere | Ampere |
| CUDA核心 | 1024 | 2048 | 2048 |
| Tensor核心 | 32 | 64 | 64 |
| GPU频率 | 625 MHz | 918 MHz | 1.3 GHz |
| AI算力 (INT8) | 40 TOPS | 100 TOPS | 275 TOPS |
| 显存 | 8GB共享 | 8/16GB共享 | 32/64GB共享 |
| 功耗 | 7-15W | 10-25W | 15-60W |

## GPU编程最佳实践

### 1. 最大化占用率

确保足够多的线程来隐藏内存延迟：

$$
\text{占用率} = \frac{\text{活跃Warp数}}{\text{SM最大Warp数}}
$$

目标占用率 > 50%。

### 2. 合并内存访问

相邻线程访问相邻内存地址：

```c
// 好：合并访问（Coalesced）
C[threadIdx.x] = A[threadIdx.x] + B[threadIdx.x];

// 差：跨步访问（Strided）
C[threadIdx.x] = A[threadIdx.x * stride];
```

### 3. 减少CPU-GPU数据传输

```python
# 差：频繁拷贝
for frame in camera_stream:
    gpu_frame = frame.to('cuda')     # CPU -> GPU
    result = model(gpu_frame)         # GPU推理
    cpu_result = result.to('cpu')     # GPU -> CPU

# 好：流水线化，使用CUDA Stream
stream1 = torch.cuda.Stream()
stream2 = torch.cuda.Stream()
# 在stream1上传输数据的同时，stream2上执行推理
```

### 4. 使用Tensor核心

利用Tensor核心加速矩阵运算：

$$
D = A \times B + C \quad \text{（矩阵乘加）}
$$

Tensor核心在一个时钟周期内完成 $4 \times 4$ 矩阵的乘加运算。

!!! tip "在PyTorch中启用Tensor核心"
    ```python
    # 使用FP16自动混合精度
    with torch.cuda.amp.autocast():
        output = model(input)
    ```

## 机器人视觉处理流水线

<!-- SVG-DESIGN-NOTES
Type: C (CPU/GPU swimlane Gantt — 关键是观察 CPU↔GPU 拷贝边界)
Q0: 视觉流水线性能瓶颈不在算法，而在 CPU↔GPU 边界的内存拷贝；统一内存或 DeepStream 全 GPU 路径可消除 4 次拷贝中的 3 次
Q1: 两条 swimlane (CPU 顶 / GPU 底)，6 个阶段排成 Gantt bar，每次跨 lane 用红色 ⇆ 标记一次 cudaMemcpy；下面对比"naive"和"DeepStream zero-copy"两种路径
Q2: 去掉标题：两条 lane + 红色拷贝箭头跨越 — DNA 是"GPU 流水线中拷贝是高额开销"
Q3: 删去原 6 个等大方框
Q4: 拷贝箭头旁标 "memcpy 3 ms"
Q5: 全 var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg">
  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">机器人视觉流水线 — CPU/GPU 边界是瓶颈</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Each lane crossing costs an extra cudaMemcpy (~1-3 ms)</text>

  <!-- swimlane backgrounds -->
  <rect x="60" y="80"  width="640" height="60" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
  <text x="40" y="115" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">CPU</text>
  <rect x="60" y="160" width="640" height="60" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="0.8"/>
  <text x="40" y="195" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">GPU</text>

  <text x="380" y="68" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">naive path — 4 memcpy</text>

  <!-- stages naive: capture(CPU) -> decode(CPU) -> preproc(GPU) -> infer(GPU) -> post(GPU) -> publish(CPU) -->
  <rect x="70" y="90"  width="80" height="40" rx="3" fill="var(--dia-accent)" fill-opacity="0.35" stroke="var(--dia-accent)" stroke-width="1.3"/>
  <text x="110" y="114" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">capture</text>
  <text x="110" y="126" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2 ms</text>

  <rect x="160" y="90" width="80" height="40" rx="3" fill="var(--dia-accent)" fill-opacity="0.35" stroke="var(--dia-accent)" stroke-width="1.3"/>
  <text x="200" y="114" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">decode JPG</text>
  <text x="200" y="126" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">3 ms</text>

  <!-- copy CPU→GPU -->
  <path d="M 250 130 L 280 170" stroke="var(--dia-accent)" stroke-width="1.8" stroke-dasharray="3 2" marker-end="url(#arr-vis)"/>
  <text x="245" y="156" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">memcpy 3</text>

  <rect x="290" y="170" width="80" height="40" rx="3" fill="var(--dia-blue)" fill-opacity="0.35" stroke="var(--dia-blue)" stroke-width="1.3"/>
  <text x="330" y="194" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">preproc</text>
  <text x="330" y="206" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">1 ms</text>

  <rect x="380" y="170" width="160" height="40" rx="3" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.5"/>
  <text x="460" y="194" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)" font-weight="600">YOLO inference</text>
  <text x="460" y="206" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">12 ms (INT8)</text>

  <rect x="550" y="170" width="60" height="40" rx="3" fill="var(--dia-blue)" fill-opacity="0.35" stroke="var(--dia-blue)" stroke-width="1.3"/>
  <text x="580" y="194" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">NMS</text>
  <text x="580" y="206" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">2 ms</text>

  <!-- copy GPU→CPU -->
  <path d="M 610 170 L 640 130" stroke="var(--dia-accent)" stroke-width="1.8" stroke-dasharray="3 2" marker-end="url(#arr-vis)"/>
  <text x="615" y="156" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-accent)">memcpy 2</text>

  <rect x="630" y="90" width="60" height="40" rx="3" fill="var(--dia-accent)" fill-opacity="0.35" stroke="var(--dia-accent)" stroke-width="1.3"/>
  <text x="660" y="114" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">publish</text>
  <text x="660" y="126" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">1 ms</text>

  <text x="710" y="118" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)" font-weight="600">Σ 24 ms</text>

  <!-- divider -->
  <line x1="60" y1="234" x2="700" y2="234" stroke="var(--dia-stroke-soft)" stroke-width="0.6" stroke-dasharray="2 2"/>

  <!-- DeepStream path: full GPU zero-copy -->
  <text x="380" y="252" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke)">DeepStream zero-copy — 0 memcpy</text>

  <rect x="70" y="262" width="500" height="40" rx="3" fill="var(--dia-green)" fill-opacity="0.40" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="320" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)" font-weight="600">capture · decode · preproc · YOLO · NMS · publish — all GPU, NvBufSurface</text>
  <text x="600" y="285" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)" font-weight="600">Σ 15 ms</text>

  <text x="380" y="324" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">9 ms saved (40%) by keeping data on GPU end-to-end</text>

  <defs>
    <marker id="arr-vis" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,5 L7,2.5 z" fill="var(--dia-accent)"/></marker>
  </defs>
</svg>
</div>
<p class="figure-caption">Figure 3 — 真正的优化目标不是算法,而是消除 CPU/GPU 边界拷贝。</p>


使用GStreamer + DeepStream可以实现全GPU流水线，避免CPU-GPU之间的数据拷贝。

## 小结

1. **GPU通过大规模并行**弥补单线程性能的不足
2. **SIMT模型**要求避免Warp分歧
3. **内存层次**和**合并访问**对GPU性能至关重要
4. **TensorRT**可以将推理性能提升3-5倍
5. **减少CPU-GPU数据传输**是优化的关键
6. Jetson系列为机器人提供了从40到275 TOPS的AI算力选择

## 参考资料

- NVIDIA CUDA Programming Guide: [https://docs.nvidia.com/cuda/](https://docs.nvidia.com/cuda/)
- NVIDIA TensorRT Documentation: [https://developer.nvidia.com/tensorrt](https://developer.nvidia.com/tensorrt)
- NVIDIA Jetson Developer Guide: [https://developer.nvidia.com/embedded/](https://developer.nvidia.com/embedded/)
- Kirk, D. B., & Hwu, W. *Programming Massively Parallel Processors*
