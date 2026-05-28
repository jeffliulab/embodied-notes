# 实时操作系统 (RTOS) — FreeRTOS / Zephyr / QNX 概论

> *实时操作系统 (RTOS) 保证关键任务在**确定时间内**完成 (deterministic),用于汽车 / 航空 / 工业 / 机器人。与通用 OS (Linux/Windows) 的 best-effort scheduling 不同。本篇覆盖 RTOS 概念、主流系统 (FreeRTOS / Zephyr / QNX) 对比、scheduling、应用。*
>
> **难度**:Intermediate
> **前置知识**:操作系统基础、C 语言、嵌入式概念
> **后续阅读**:[CPU 架构](../02_Computer_Engineering/CPU架构.md)、[CAN 总线](../08_Communication_Networks/CAN总线.md)

---

## 1. Real-Time vs General OS

| 维度 | General OS (Linux) | RTOS |
|---|---|---|
| 调度 | Fair scheduling | Priority-based |
| Latency | ms 级,不保证 | < 100 μs 确定 |
| Footprint | 100MB+ | 10KB-1MB |
| Power | 高 (multi-core) | 极低 |
| App | 桌面 / server | 控制 / 嵌入式 |

### 1.1 硬实时 vs 软实时

- **Hard real-time**: 错过 deadline = 系统失败 (e.g. 心脏起搏器,刹车 ABS)
- **Soft real-time**: 偶尔错过 OK (e.g. 视频流)

---

## 2. RTOS 核心特性

### 2.1 Deterministic Scheduling

任务有 priority,**preemptive priority scheduling** — 高 priority 任务立即抢占低 priority 的 CPU。

```c
// FreeRTOS task creation
xTaskCreate(task_func, "name", stack_size, NULL, priority, NULL);
```

### 2.2 Inter-task Communication

- **Queue**: 线程安全 message passing
- **Semaphore / Mutex**: 同步 + 互斥
- **Event flags**: 等多个事件 OR/AND
- **Mailbox**

### 2.3 Memory Management

- 静态: 编译时分配 (推荐)
- 动态: malloc/free (慢 + 不 deterministic)

### 2.4 Interrupt Handling

- ISR (Interrupt Service Routine): 极短
- 长任务在 ISR 中 defer 到 task 处理

---

## 3. 主流 RTOS 对比

| RTOS | License | Footprint | 适用 | 特色 |
|---|---|---|---|---|
| **FreeRTOS** | MIT | 10 KB | 大众 MCU | Amazon 维护,广泛支持 |
| **Zephyr** | Apache 2 | 30-100 KB | IoT / 工业 | Linux Foundation, 现代 |
| **QNX** | Commercial | 1 MB+ | 汽车 / 安全 | POSIX-like, 微内核 |
| **VxWorks** | Commercial | 1 MB+ | 航空航天 | Wind River, 高可靠 |
| **µC/OS-III** | Commercial | 30 KB | 工业 | Micrium |
| **NuttX** | BSD | 30 KB | 飞控 (PX4) | POSIX 兼容 |
| **mbedOS** | Apache 2 | 30 KB | ARM 生态 | Arm 主推 (停止开发) |
| **ThreadX** | Commercial | 5 KB | IoT | Microsoft (Azure RTOS) |

---

## 4. FreeRTOS 例子

```c
#include "FreeRTOS.h"
#include "task.h"

void led_task(void *params) {
    while (1) {
        toggle_led();
        vTaskDelay(pdMS_TO_TICKS(500));  // 500ms
    }
}

void uart_task(void *params) {
    while (1) {
        char c = uart_read();
        process(c);
    }
}

int main() {
    xTaskCreate(led_task, "LED", 128, NULL, 1, NULL);
    xTaskCreate(uart_task, "UART", 256, NULL, 2, NULL);  // higher priority
    vTaskStartScheduler();
}
```

---

## 5. 调度算法

### 5.1 Rate Monotonic Scheduling (RMS)

周期短的任务优先。Liu-Layland 1973 证明 optimal for periodic tasks。

可调度条件:

$$\sum_{i=1}^n \frac{C_i}{T_i} \le n(2^{1/n} - 1)$$

n→∞ 时 bound = ln 2 ≈ 0.693。

### 5.2 EDF (Earliest Deadline First)

按 deadline 排序。Optimal,可达 100% utilization。但比 RMS 复杂。

### 5.3 Priority Inversion

低 priority 任务持有 mutex,阻塞高 priority 任务。Mars Pathfinder 1997 bug。
**解**: Priority Inheritance Protocol — mutex 持有者临时提 priority。

---

## 6. 应用场景

### 6.1 汽车 ECU

- 引擎控制 ms-level latency 关键
- AUTOSAR 标准基于 RTOS

### 6.2 飞控 (Drone, UAV)

- PX4 用 NuttX,Cleanflight 用 FreeRTOS
- 1-2 ms control loop

### 6.3 工业机器人控制器

- EtherCAT + RTOS 实时同步多轴
- KUKA / FANUC / ABB 都基于 RTOS

### 6.4 医疗

- 心脏起搏器、人工胰岛素泵
- 必须 hard real-time + redundancy

### 6.5 IoT 设备

- Zephyr / FreeRTOS 在 ESP32 / nRF52 上运行

---

## 7. Linux + RT_PREEMPT

通用 Linux 加 RT_PREEMPT patch → 软实时 (~ ms latency)。
非 hard real-time。
机器人 ROS 2 + 容器化 + RT_PREEMPT 是常见架构。

---

## 8. RTOS vs Bare Metal

| 维度 | Bare Metal (无 OS) | RTOS |
|---|---|---|
| 简单度 | 极简单 | 复杂度高 |
| 多任务 | 难 (手写 state machine) | 易 (多 task) |
| Memory | 最小 | + 几 KB |
| 适用 | < 10 任务 | 复杂多任务 |

简单 sensor / 灯控 → bare metal;复杂控制 → RTOS。

---

## 9. 性能数字 (典型)

- **Context switch**: < 10 μs (FreeRTOS on Cortex-M)
- **Interrupt latency**: < 5 μs
- **Memory**: 5-30 KB RAM
- **Scheduling jitter**: < 1 μs

---

## 10. Common Pitfalls

### 10.1 Stack overflow

每 task 独立 stack;小则 overflow,大则浪费 RAM。需 careful 估。

### 10.2 Priority assignment

错的 priority → 关键任务 starved。

### 10.3 Mutex deadlock

A 等 mutex_1 (B 持), B 等 mutex_2 (A 持) → deadlock。

### 10.4 Race condition

未保护共享变量 → 间歇 bug,极难 debug。

### 10.5 长 ISR

ISR 长 → block 其他 interrupt。任何长操作 defer。

---

## 11. Related Concepts

- **硬件**:[CPU 架构](../02_Computer_Engineering/CPU架构.md)、[嵌入式系统](../02_Computer_Engineering/嵌入式系统.md)
- **通信**:[CAN 总线](../08_Communication_Networks/CAN总线.md)、[串口与 I2C/SPI](../08_Communication_Networks/串口与I2C_SPI.md)

---

## References

1. **Liu, C. L. & Layland, J. W.** "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment." *JACM*, 1973.
2. **Buttazzo, G. C.** *Hard Real-Time Computing Systems*. 3rd ed., Springer, 2011.
3. **FreeRTOS** — https://www.freertos.org/
4. **Zephyr Project** — https://zephyrproject.org/
5. **QNX Software Systems** — https://blackberry.qnx.com/
