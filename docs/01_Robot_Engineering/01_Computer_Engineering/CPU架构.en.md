# CPU Architecture

## Overview

The CPU (Central Processing Unit) is the core computing engine of a robot's brain. Understanding CPU architecture helps in selecting the right processor platform, optimizing program performance, and diagnosing system bottlenecks.

## Von Neumann vs. Harvard Architecture

### Von Neumann Architecture

Instructions and data share the same memory and bus:

```
+-------+     +------+     +--------+
|  CPU  |<--->| Bus  |<--->| Memory |
+-------+     +------+     +--------+
                              Instr+Data
```

- **Advantages**: Simple structure, high flexibility
- **Disadvantages**: Instructions and data cannot be accessed simultaneously (Von Neumann bottleneck)
- **Examples**: x86 PCs, most general-purpose processors

### Harvard Architecture

Instructions and data use separate memories and buses:

```
+-------+     +----------------+     +------------------+
|       |<--->| Instruction Bus|<--->| Instruction Memory|
|  CPU  |     +----------------+     +------------------+
|       |<--->| Data Bus       |<--->| Data Memory       |
+-------+     +----------------+     +------------------+
```

- **Advantages**: Instruction and data can be accessed in parallel, doubling bandwidth
- **Disadvantages**: More complex hardware
- **Examples**: STM32 and other MCUs (internally use Harvard architecture)

### Modified Harvard Architecture

Modern processors typically use a **Modified Harvard Architecture**:

- Separate L1 caches (I-Cache + D-Cache) -- Harvard characteristics
- Unified L2/L3 cache and main memory -- Von Neumann characteristics
- ARM Cortex-A series is a typical modified Harvard architecture

## Instruction Pipeline

### Classic Five-Stage Pipeline

A pipeline decomposes instruction execution into multiple stages, allowing multiple instructions to be in different stages simultaneously:

| Stage | Abbreviation | Function |
|-------|-------------|----------|
| Instruction Fetch | IF | Fetch instruction from memory |
| Instruction Decode | ID | Parse instruction, read registers |
| Execute | EX | ALU operation or address calculation |
| Memory Access | MEM | Read/write data memory |
| Write Back | WB | Write result back to register |

```
Clock cycle:  1    2    3    4    5    6    7    8
Instr 1:     IF   ID   EX  MEM   WB
Instr 2:          IF   ID   EX  MEM   WB
Instr 3:               IF   ID   EX  MEM   WB
Instr 4:                    IF   ID   EX  MEM   WB
```

Ideally, an $n$-stage pipeline in steady state has a **throughput** of:

$$
\text{Throughput} = \frac{1}{T_{\text{stage}}}
$$

While the non-pipelined throughput is $\frac{1}{n \cdot T_{\text{stage}}}$, giving a theoretical speedup of $n$.

### Pipeline Hazards

In practice, pipelines encounter three types of hazards:

**1. Data Hazard**

A subsequent instruction depends on the result of a preceding instruction:

```
ADD R1, R2, R3   ; R1 = R2 + R3
SUB R4, R1, R5   ; Needs the result of R1, but R1 has not been written back yet
```

Solution: **Data Forwarding/Bypassing**

**2. Control Hazard**

A branch instruction changes the program flow:

```
BEQ R1, R2, LABEL  ; If R1==R2 then branch
ADD R3, R4, R5      ; Should this instruction execute?
```

Solution: **Branch Prediction**

**3. Structural Hazard**

Hardware resource conflicts (e.g., two instructions need memory access simultaneously).

Solution: Add hardware resources (e.g., separate I-Cache and D-Cache)

## Cache Hierarchy

### Memory Hierarchy

$$
\text{Access Time}: \text{Registers} < \text{L1} < \text{L2} < \text{L3} < \text{DRAM} < \text{SSD} < \text{HDD}
$$

| Level | Typical Size | Typical Latency | Bandwidth |
|-------|-------------|----------------|-----------|
| Registers | ~1KB | <1ns | - |
| L1 Cache | 32-64KB | 1-2ns | ~500GB/s |
| L2 Cache | 256KB-1MB | 3-10ns | ~200GB/s |
| L3 Cache | 2-32MB | 10-30ns | ~100GB/s |
| DRAM | 4-32GB | 50-100ns | ~50GB/s |
| SSD | 128GB-2TB | ~100us | ~3GB/s |

### Cache Hit Rate

Cache performance depends on the **hit rate**:

$$
T_{\text{avg}} = T_{\text{hit}} + (1 - h) \times T_{\text{miss}}
$$

Where $h$ is the hit rate, $T_{\text{hit}}$ is the cache hit latency, and $T_{\text{miss}}$ is the additional latency on a cache miss.

!!! example "Impact of Cache on Robotics"
    During image processing, scanning row-by-row (row-major) is more cache-friendly than scanning column-by-column, because images are stored in row-major order in memory. Exploiting this **spatial locality** can significantly improve processing speed.

### Cache Mapping Strategies

- **Direct Mapped**: Each address maps to exactly one cache line
- **Fully Associative**: Each address can map to any cache line
- **Set Associative**: A compromise -- N-way set associative

## x86 vs. ARM vs. RISC-V

### Instruction Set Comparison

| Feature | x86-64 | ARM (AArch64) | RISC-V |
|---------|--------|---------------|--------|
| Type | CISC | RISC | RISC |
| Instruction Length | Variable (1-15 bytes) | Fixed (4 bytes) | Fixed (4 bytes) |
| Register Count | 16 general-purpose | 31 general-purpose | 32 general-purpose |
| Instruction Count | ~1500+ | ~1000 | ~50 (base) |
| Power Efficiency | Low | High | High |
| Ecosystem | Most mature | Mature on mobile | Rapidly growing |
| Licensing Model | Intel/AMD proprietary | ARM licensing | Open-source, free |

### ARM in Robotics

ARM processors dominate robotics due to their high energy efficiency:

**Cortex-A Series (Application Processors)**:

| Processor | Core | Frequency | Features | Application Platform |
|-----------|------|-----------|----------|---------------------|
| Cortex-A55 | ARMv8.2 | 1.8GHz | High-efficiency core | Low-power SoCs |
| Cortex-A76 | ARMv8.2 | 3.0GHz | High-performance core | Raspberry Pi 5 |
| Cortex-A78AE | ARMv8.2 | 2.2GHz | Automotive safety grade | Jetson Orin series |

**Cortex-M Series (Microcontrollers)**:

| Processor | Architecture | Frequency | Features | Typical Chip |
|-----------|-------------|-----------|----------|-------------|
| Cortex-M0+ | ARMv6-M | 48MHz | Lowest power | STM32L0 |
| Cortex-M4 | ARMv7E-M | 168MHz | DSP+FPU | STM32F4 |
| Cortex-M7 | ARMv7E-M | 480MHz | Double-precision FPU | STM32H7 |
| Cortex-M33 | ARMv8-M | 160MHz | TrustZone security | STM32U5 |

### The Potential of RISC-V

RISC-V, as an open-source ISA, is gaining attention in the embedded and robotics domains:

- **Modular design**: Base integer instruction set (I) + optional extensions (M/A/F/D/C/V)
- **No licensing fees**: Reduces chip costs
- **Customizable**: Custom instructions can be added to accelerate specific tasks
- **Representative chips**: ESP32-C3, StarFive JH7110

## Performance Analysis

### CPI (Cycles Per Instruction)

$$
\text{CPI} = \frac{\text{Total Clock Cycles}}{\text{Total Instructions}}
$$

Weighted CPI for different instruction categories:

$$
\text{CPI}_{\text{avg}} = \sum_{i=1}^{n} \text{CPI}_i \times f_i
$$

Where $f_i$ is the frequency proportion of the $i$-th instruction class.

### Amdahl's Law

When optimizing a portion of a system, the overall speedup is:

$$
S = \frac{1}{(1-P) + \frac{P}{N}}
$$

Where:

- $P$ = fraction that can be parallelized
- $N$ = number of parallel processing units
- $S$ = overall speedup

!!! example "Amdahl's Law Example"
    If 80% of a program can be parallelized ($P=0.8$), using 4 cores ($N=4$):
    
    $$S = \frac{1}{(1-0.8) + \frac{0.8}{4}} = \frac{1}{0.2 + 0.2} = 2.5$$
    
    Even with infinitely many cores:
    
    $$S_{\max} = \frac{1}{1-P} = \frac{1}{0.2} = 5$$
    
    The serial portion determines the upper bound on speedup.

### Practical Example: Robot Path Planning

Suppose a path planning algorithm has:

- A* search (serial): 60% of computation time
- Collision detection (parallelizable): 40% of computation time

On a Jetson Orin (8-core A78AE + 2048 CUDA cores):

$$
S_{\text{CPU}} = \frac{1}{0.6 + \frac{0.4}{8}} = \frac{1}{0.65} \approx 1.54
$$

Even if collision detection is fully parallelized on the GPU:

$$
S_{\text{GPU}} = \frac{1}{0.6 + \frac{0.4}{2048}} \approx \frac{1}{0.6002} \approx 1.67
$$

The key bottleneck lies in the serial A* search portion.

## Processor Selection Guide

<!-- SVG-DESIGN-NOTES
Type: D (log-log scatter — AI throughput vs power)
Q0: Selecting a processor isn't a decision tree; it's a 4-decade TOPS × 2-decade Watts trade-off. Within the same power budget, performance can vary 100×
Q1: Log-log scatter; bubbles for STM32F4, STM32H7, RPi5, Jetson Orin Nano/NX/AGX; iso-efficiency dashed lines for 0.1 / 1 / 10 TOPS/W
Q2: 6 bubbles + 3 TOPS/W iso-lines — DNA is processor selection chart
Q3: Killed 12 equal boxes + arrows that pretended to be a decision tree
Q4: TOPS and W printed beside every bubble
Q5: All var(--dia-*)
-->
<div class="diagram">
<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">Robot processor selection — TOPS / W trade-off</text>
  <text x="360" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">log-log scatter of common platforms</text>

  <line x1="80" y1="380" x2="680" y2="380" stroke="var(--dia-stroke)" stroke-width="1"/>
  <line x1="80" y1="380" x2="80" y2="60" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">
    <line x1="80"  y1="378" x2="80"  y2="384"/><text x="80"  y="398" text-anchor="middle">0.1 W</text>
    <line x1="280" y1="378" x2="280" y2="384"/><text x="280" y="398" text-anchor="middle">1 W</text>
    <line x1="480" y1="378" x2="480" y2="384"/><text x="480" y="398" text-anchor="middle">10 W</text>
    <line x1="680" y1="378" x2="680" y2="384"/><text x="680" y="398" text-anchor="middle">100 W</text>
    <line x1="76" y1="380" x2="84" y2="380"/><text x="72" y="384" text-anchor="end">0.01</text>
    <line x1="76" y1="320" x2="84" y2="320"/><text x="72" y="324" text-anchor="end">0.1</text>
    <line x1="76" y1="260" x2="84" y2="260"/><text x="72" y="264" text-anchor="end">1</text>
    <line x1="76" y1="200" x2="84" y2="200"/><text x="72" y="204" text-anchor="end">10</text>
    <line x1="76" y1="140" x2="84" y2="140"/><text x="72" y="144" text-anchor="end">100</text>
    <line x1="76" y1="80"  x2="84" y2="80" /><text x="72" y="84"  text-anchor="end">1000</text>
  </g>
  <text x="380" y="418" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">Power (W, log)</text>
  <text x="22" y="220" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)" transform="rotate(-90 22 220)">AI throughput (TOPS, log)</text>

  <line x1="80" y1="260" x2="680" y2="-40" stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.65"/>
  <text x="640" y="60" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" font-style="italic">10 TOPS/W</text>
  <line x1="80" y1="320" x2="680" y2="20"  stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.55"/>
  <text x="640" y="118" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" font-style="italic">1 TOPS/W</text>
  <line x1="80" y1="380" x2="680" y2="80"  stroke="var(--dia-stroke-soft)" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.45"/>
  <text x="640" y="178" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" font-style="italic">0.1 TOPS/W</text>

  <circle cx="186" cy="378" r="9" fill="var(--dia-blue)" fill-opacity="0.45" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="192" y="370" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">STM32F4</text>
  <text x="192" y="382" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0.3 W · MCU</text>

  <circle cx="220" cy="370" r="10" fill="var(--dia-blue)" fill-opacity="0.55" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="232" y="362" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">STM32H7</text>
  <text x="232" y="375" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">0.5 W · 480 MHz · DSP</text>

  <circle cx="455" cy="290" r="13" fill="var(--dia-green)" fill-opacity="0.45" stroke="var(--dia-green)" stroke-width="1.5"/>
  <text x="470" y="284" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Raspberry Pi 5</text>
  <text x="470" y="297" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">8 W · 0.5 TOPS</text>

  <circle cx="490" cy="174" r="14" fill="var(--dia-accent)" fill-opacity="0.45" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="438" y="166" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Orin Nano</text>
  <text x="438" y="178" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">12 W · 40 TOPS</text>

  <circle cx="552" cy="140" r="17" fill="var(--dia-accent)" fill-opacity="0.55" stroke="var(--dia-accent)" stroke-width="1.6"/>
  <text x="572" y="134" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)">Orin NX</text>
  <text x="572" y="146" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">25 W · 100 TOPS</text>

  <circle cx="640" cy="115" r="22" fill="var(--dia-accent)" fill-opacity="0.65" stroke="var(--dia-accent)" stroke-width="2"/>
  <text x="600" y="98" font-family="Fraunces, Georgia, serif" font-size="11" fill="var(--dia-stroke)" font-weight="600">AGX Orin</text>
  <text x="600" y="111" font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)">60 W · 275 TOPS</text>

  <text x="200" y="80" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">↑ servers / desktop GPU</text>
  <text x="160" y="350" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">realtime MCU zone</text>
  <text x="500" y="220" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">edge AI inference zone</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — Same power budget, different diagonal — that's what determines the algorithm you can run.</p>


## Summary

1. Modern CPUs use a **modified Harvard architecture**, balancing performance and flexibility
2. **Pipelining** is the basic method for increasing CPU throughput, but is limited by various hazards
3. The **cache hierarchy** has a huge impact on performance; writing cache-friendly code is important
4. **ARM dominates robotics**, with Cortex-A for main control and Cortex-M for real-time control
5. **Amdahl's Law** reminds us to focus on serial bottlenecks

## References

- Patterson, D. A., & Hennessy, J. L. *Computer Organization and Design: The RISC-V Edition*
- ARM Architecture Reference Manual for A-profile architecture
- RISC-V ISA Specification: [https://riscv.org/specifications/](https://riscv.org/specifications/)
