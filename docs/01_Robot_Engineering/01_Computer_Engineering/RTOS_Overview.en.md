# Real-Time Operating Systems (RTOS) — FreeRTOS / Zephyr / QNX Overview

> *Real-time operating systems (RTOS) guarantee critical tasks complete within **deterministic time** — used in automotive / aerospace / industrial / robotics. Differs from general OS (Linux/Windows) best-effort scheduling. This article covers RTOS concepts, mainstream systems (FreeRTOS / Zephyr / QNX) comparison, scheduling, applications.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: OS basics, C language, embedded concepts
> **Further reading**: [CPU Architecture](../02_Computer_Engineering/CPU架构.en.md), [CAN Bus](../08_Communication_Networks/CAN总线.en.md)

---

## 1. Real-Time vs General OS

| Aspect | General OS (Linux) | RTOS |
|---|---|---|
| Scheduling | Fair scheduling | Priority-based |
| Latency | ms-level, not guaranteed | < 100 μs deterministic |
| Footprint | 100MB+ | 10KB-1MB |
| Power | High (multi-core) | Very low |
| Apps | Desktop / server | Control / embedded |

### 1.1 Hard vs Soft Real-Time

- **Hard real-time**: missed deadline = system failure (e.g. pacemaker, ABS brakes)
- **Soft real-time**: occasional miss OK (e.g. video streaming)

---

## 2. RTOS Core Features

### 2.1 Deterministic Scheduling

Tasks have priorities, **preemptive priority scheduling** — high-priority tasks immediately preempt low.

```c
// FreeRTOS task creation
xTaskCreate(task_func, "name", stack_size, NULL, priority, NULL);
```

### 2.2 Inter-task Communication

- **Queue**: thread-safe message passing
- **Semaphore / Mutex**: sync + mutex
- **Event flags**: wait on multiple events OR/AND
- **Mailbox**

### 2.3 Memory Management

- Static: compile-time allocation (recommended)
- Dynamic: malloc/free (slow + non-deterministic)

### 2.4 Interrupt Handling

- ISR (Interrupt Service Routine): very short
- Long tasks deferred from ISR to task

---

## 3. Mainstream RTOS Comparison

| RTOS | License | Footprint | Use case | Distinctive |
|---|---|---|---|---|
| **FreeRTOS** | MIT | 10 KB | Mass MCU | Amazon-maintained, widely supported |
| **Zephyr** | Apache 2 | 30-100 KB | IoT / industrial | Linux Foundation, modern |
| **QNX** | Commercial | 1 MB+ | Automotive / safety | POSIX-like, microkernel |
| **VxWorks** | Commercial | 1 MB+ | Aerospace | Wind River, high reliability |
| **µC/OS-III** | Commercial | 30 KB | Industrial | Micrium |
| **NuttX** | BSD | 30 KB | Flight control (PX4) | POSIX compatible |
| **mbedOS** | Apache 2 | 30 KB | Arm ecosystem | Arm-led (discontinued) |
| **ThreadX** | Commercial | 5 KB | IoT | Microsoft (Azure RTOS) |

---

## 4. FreeRTOS Example

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

## 5. Scheduling Algorithms

### 5.1 Rate Monotonic Scheduling (RMS)

Shorter-period tasks have higher priority. Liu-Layland 1973 proved optimal for periodic tasks.

Schedulability:

$$\sum_{i=1}^n \frac{C_i}{T_i} \le n(2^{1/n} - 1)$$

n→∞ bound = ln 2 ≈ 0.693.

### 5.2 EDF (Earliest Deadline First)

Sort by deadline. Optimal, achieves 100% utilization. But more complex than RMS.

### 5.3 Priority Inversion

Low-priority task holds mutex, blocks high-priority task. Mars Pathfinder 1997 bug.
**Solution**: Priority Inheritance Protocol — mutex holder temporarily inherits high priority.

---

## 6. Application Scenarios

### 6.1 Automotive ECU

- Engine control needs ms-level latency
- AUTOSAR standard based on RTOS

### 6.2 Flight Control (Drone, UAV)

- PX4 uses NuttX, Cleanflight uses FreeRTOS
- 1-2 ms control loop

### 6.3 Industrial Robot Controllers

- EtherCAT + RTOS for real-time multi-axis sync
- KUKA / FANUC / ABB all RTOS-based

### 6.4 Medical

- Pacemakers, insulin pumps
- Must be hard real-time + redundancy

### 6.5 IoT Devices

- Zephyr / FreeRTOS on ESP32 / nRF52

---

## 7. Linux + RT_PREEMPT

General Linux + RT_PREEMPT patch → soft real-time (~ ms latency).
Not hard real-time.
Robotics ROS 2 + containerized + RT_PREEMPT is a common architecture.

---

## 8. RTOS vs Bare Metal

| Aspect | Bare Metal (no OS) | RTOS |
|---|---|---|
| Simplicity | Very simple | Complex |
| Multi-task | Hard (manual state machines) | Easy (multi tasks) |
| Memory | Minimum | + several KB |
| Suitable | < 10 tasks | Complex multi-task |

Simple sensor / light control → bare metal; complex control → RTOS.

---

## 9. Performance Numbers (Typical)

- **Context switch**: < 10 μs (FreeRTOS on Cortex-M)
- **Interrupt latency**: < 5 μs
- **Memory**: 5-30 KB RAM
- **Scheduling jitter**: < 1 μs

---

## 10. Common Pitfalls

### 10.1 Stack Overflow

Each task has its own stack; too small → overflow, too large → waste RAM. Careful estimation needed.

### 10.2 Priority Assignment

Wrong priorities → critical tasks starved.

### 10.3 Mutex Deadlock

A waits for mutex_1 (B holds), B waits for mutex_2 (A holds) → deadlock.

### 10.4 Race Condition

Unprotected shared variables → intermittent bugs, hard to debug.

### 10.5 Long ISR

Long ISR → blocks other interrupts. Defer any long operation.

---

## 11. Related Concepts

- **Hardware**: [CPU Architecture](../02_Computer_Engineering/CPU架构.en.md), [Embedded Systems](../02_Computer_Engineering/嵌入式系统.en.md)
- **Communications**: [CAN Bus](../08_Communication_Networks/CAN总线.en.md), [Serial & I2C/SPI](../08_Communication_Networks/串口与I2C_SPI.en.md)

---

## References

1. **Liu, C. L. & Layland, J. W.** "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment." *JACM*, 1973.
2. **Buttazzo, G. C.** *Hard Real-Time Computing Systems*. 3rd ed., Springer, 2011.
3. **FreeRTOS** — https://www.freertos.org/
4. **Zephyr Project** — https://zephyrproject.org/
5. **QNX Software Systems** — https://blackberry.qnx.com/
