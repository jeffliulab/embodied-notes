# FreeRTOS — Mainstream Embedded RTOS

> *FreeRTOS created by Richard Barry in 2003; acquired by Amazon AWS in 2017. MIT license, free, ported from 8051 to Cortex-A. Simple (~10K LOC kernel), preemptive, deterministic scheduling. Default RTOS in ESP-IDF, Mbed, PlatformIO. Zephyr / RT-Thread / ThreadX are competitors.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [ARM Cortex-M](ARM_Cortex_M.en.md), C language

---

## 1. Design Philosophy

- **Minimal**: kernel ~ 6-15 KB ROM
- **Preemptive priority scheduling**: higher-priority task preempts immediately
- **Tickless idle**: power saving
- **Free**: MIT license, commercial OK
- **Portable**: 40+ MCU architectures

---

## 2. Core Primitives

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

### 2.4 Mutex (with priority inheritance)

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
- Round-robin within same priority (default 1 ms tick)
- Idle task at priority 0 (hook for power save)
- Higher priority preempts immediately

---

## 4. Memory Management

- 5 heap schemes (heap_1 ~ heap_5)
- heap_1: alloc only, no free (simplest)
- heap_4: best fit + coalescence (most common)
- heap_5: multi-region (non-contiguous RAM)
- Static allocation option: no heap

---

## 5. ISR-Safe API

Inside ISR only `xxxFromISR`-suffixed APIs:
```c
void Interrupt_Handler(void) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xQueueSendFromISR(xQueue, &data, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

---

## 6. Typical Architecture

```
Highest priority:
    Sensor reading task (10 Hz)
    
Medium:
    Control loop task (100 Hz)
    
Low:
    Telemetry task (1 Hz)
    Logging task

Lowest:
    Idle task (power save)

ISR → Queue → Task
```

---

## 7. STM32 + CMSIS-RTOS V2

CMSIS-RTOS is ARM's standard RTOS API; FreeRTOS is the underlying impl.
```c
osThreadId_t id = osThreadNew(thread_func, NULL, &thread_attr);
osDelay(100);
```

---

## 8. vs. Bare-Metal

| Dimension | Bare-metal | FreeRTOS |
|---|---|---|
| Learning | Very simple | Medium |
| Multi-task | super-loop hard | Natural |
| Real-time | Hard to guarantee | Priority guarantee |
| RAM overhead | ~ 0 | 6-15 KB |
| Power | Simple | Tickless good |
| Best for | Single simple task | Complex multi-task |

---

## 9. vs. Other RTOS

| RTOS | Strength | License |
|---|---|---|
| **FreeRTOS** | Simple, ubiquitous | MIT |
| **Zephyr** | Modern, drivers, networking | Apache |
| **RT-Thread** | China ecosystem, component-rich | Apache |
| **ThreadX** | Certified safety | MIT (Microsoft) |
| **NuttX** | POSIX-like | BSD |
| **QNX** | Microkernel, automotive | Commercial |
| **VxWorks** | Avionics, certified | Commercial |

---

## 10. AWS IoT Integration

- After AWS acquisition: FreeRTOS + AWS IoT SDK
- LTS versions: 18.04 → 202012 → 202210
- OTA, device shadow, provisioning integrated

---

## 11. Common Pitfalls

### 11.1 Normal API in ISR

UNDEFINED behavior. Must use FromISR.

### 11.2 Task Doesn't vTaskDelay

No yield → high priority preempts, low priority starves.

### 11.3 Stack Too Small

Stack overflow → canary detects, but no recovery.

### 11.4 Priority Inversion

No mutex (use binary semaphore) → inversion. Must use mutex (with priority inheritance).

### 11.5 heap_1 Free Missing

Wrongly calling vPortFree → crash.

---

## 12. Related Concepts

- **Same section**: [ARM Cortex-M](ARM_Cortex_M.en.md), [RTOS Overview](RTOS_Overview.en.md)
- **Applications**: [ROS2 Basics](../10_Robot_Integration/ROS2_Basics.en.md), embedded debugging
- **AWS**: FreeRTOS + AWS IoT

---

## References

1. **Barry, R.** *Mastering the FreeRTOS Real Time Kernel*. 2016.
2. **FreeRTOS** Documentation — https://www.freertos.org/
3. **Yiu, J.** *The Definitive Guide to ARM Cortex-M*. 3rd ed., 2014.
