# FreeRTOS — 主流嵌入式 RTOS

> *FreeRTOS 是 Richard Barry 2003 创建,2017 Amazon AWS 收购。MIT license,免费,从 8051 到 Cortex-A 全 port。简单(~ 10K LOC kernel)、preemptive、确定性 scheduling。是 ESP-IDF、Mbed、PlatformIO 默认 RTOS。Zephyr / RT-Thread / ThreadX 是竞争对手。*
>
> **难度**:Intermediate
> **前置知识**:[ARM Cortex-M](ARM_Cortex_M.md)、C 语言

---

## 1. 设计理念

- **Minimal**: kernel ~ 6-15 KB ROM
- **Preemptive priority scheduling**: 高优先 task 立即抢占
- **Tickless idle**: 省电
- **Free**: MIT license,可商业
- **Portable**: 40+ MCU 架构

---

## 2. 核心 Primitives

### 2.1 Task

```c
void vTaskFunction(void *pvParameters) {
    for (;;) {
        // do work
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

xTaskCreate(vTaskFunction, "Task1", configMINIMAL_STACK_SIZE, NULL, 1, NULL);
```

### 2.2 Queue

```c
QueueHandle_t xQueue = xQueueCreate(10, sizeof(int));
xQueueSend(xQueue, &value, portMAX_DELAY);
xQueueReceive(xQueue, &recv, portMAX_DELAY);
```

### 2.3 Semaphore

```c
SemaphoreHandle_t xSem = xSemaphoreCreateBinary();
xSemaphoreGive(xSem);          // from ISR or task
xSemaphoreTake(xSem, portMAX_DELAY);
```

### 2.4 Mutex(含 priority inheritance)

```c
SemaphoreHandle_t xMutex = xSemaphoreCreateMutex();
xSemaphoreTake(xMutex, portMAX_DELAY);
// critical
xSemaphoreGive(xMutex);
```

### 2.5 Software Timer

```c
TimerHandle_t xTimer = xTimerCreate("T", pdMS_TO_TICKS(1000), pdTRUE, NULL, vTimerCallback);
xTimerStart(xTimer, 0);
```

---

## 3. Scheduling

- Priority 0 (lowest) ~ configMAX_PRIORITIES-1 (highest)
- Round-robin in same priority(默认 1 ms tick)
- Idle task 在 priority 0(可挂 hook 省电)
- Higher priority 立即抢占

---

## 4. Memory 管理

- 5 个 heap scheme(heap_1 ~ heap_5)
- heap_1: 仅 alloc,无 free(最简)
- heap_4: best fit + coalescence(最常用)
- heap_5: 多区(non-contiguous RAM)
- Static allocation 选项:no heap

---

## 5. ISR-Safe API

ISR 内只能用 `xxxFromISR` 后缀 API:
```c
void Interrupt_Handler(void) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xQueueSendFromISR(xQueue, &data, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

---

## 6. 典型架构

```
Highest priority:
    Sensor reading task (10 Hz)
    
Medium:
    Control loop task (100 Hz)
    
Low:
    Telemetry task (1 Hz)
    Logging task

Lowest:
    Idle task (省电)

ISR → Queue → Task
```

---

## 7. STM32 + CMSIS-RTOS V2

CMSIS-RTOS 是 ARM 标准 RTOS API,FreeRTOS 是底层 impl。
```c
osThreadId_t id = osThreadNew(thread_func, NULL, &thread_attr);
osDelay(100);
```

---

## 8. 与 Bare-metal 比较

| 维度 | Bare-metal | FreeRTOS |
|---|---|---|
| 学习曲线 | 简(超简) | 中 |
| 多任务 | super-loop 难 | 自然 |
| Real-time | 难保证 | 优先级保证 |
| RAM 开销 | ~ 0 | 6-15 KB |
| Power | 简 | tickless 优 |
| 适合 | 单一 simple task | 复杂多 task |

---

## 9. 与其它 RTOS

| RTOS | 强项 | License |
|---|---|---|
| **FreeRTOS** | Simple, ubiquitous | MIT |
| **Zephyr** | Modern, drivers, networking | Apache |
| **RT-Thread** | 中国生态、Component-rich | Apache |
| **ThreadX** | Certified safety | MIT (Microsoft 收购) |
| **NuttX** | POSIX-like | BSD |
| **QNX** | Microkernel, automotive | 商业 |
| **VxWorks** | Avionics, certified | 商业 |

---

## 10. AWS IoT 集成

- AWS 收购后:FreeRTOS + AWS IoT SDK
- LTS 版本:18.04 → 202012 → 202210
- OTA、device shadow、provisioning 集成

---

## 11. 常见问题

### 11.1 ISR 用 normal API

UNDEFINED behavior。必须 FromISR。

### 11.2 Task 不 vTaskDelay

无 yield → 高优先 task 抢占,低优先 starve。

### 11.3 栈太小

栈溢出 → stack canary 检测,but 不可恢复。

### 11.4 优先级 inversion

无 mutex(用 binary semaphore)→ inversion。必 mutex(含 priority inheritance)。

### 11.5 heap_1 free 不存在

误调 vPortFree → crash。

---

## 12. Related Concepts

- **同节**:[ARM Cortex-M](ARM_Cortex_M.md)、[RTOS Overview](RTOS_Overview.md)
- **应用**:[ROS2 Basics](../10_Robot_Integration/ROS2_Basics.md)、[Embedded debugging]
- **AWS**: FreeRTOS + AWS IoT

---

## References

1. **Barry, R.** *Mastering the FreeRTOS Real Time Kernel*. 2016.
2. **FreeRTOS** Documentation — https://www.freertos.org/
3. **Yiu, J.** *The Definitive Guide to ARM Cortex-M*. 3rd ed., 2014.
