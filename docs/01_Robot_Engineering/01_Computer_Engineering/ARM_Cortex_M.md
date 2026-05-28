# ARM Cortex-M 系列 — 嵌入式 MCU 主流

> *ARM Cortex-M 是嵌入式系统主流 CPU,从超低端 M0 (STM32F0) 到中端 M4F (STM32F4) 到高端 M7/M33。全球数百亿出货。本篇覆盖架构、外设、开发流程。*
>
> **难度**:Intermediate
> **前置知识**:[CPU 架构](../02_Computer_Engineering/CPU架构.md)、C 语言

---

## 1. Cortex-M 家族

| Core | Pipeline | FPU | DSP | MPU | 应用 |
|---|---|---|---|---|---|
| **M0/M0+** | 3-stage | ❌ | ❌ | optional | low-end MCU |
| **M1** | 3-stage | ❌ | ❌ | ❌ | FPGA 内置 |
| **M3** | 3-stage | ❌ | ❌ | optional | 标准 MCU |
| **M4 / M4F** | 3-stage | optional | ✅ | optional | 中端 (DSP / 电机) |
| **M7** | 6-stage | dual | ✅ | optional | 高性能 (450 MHz) |
| **M23** | low-power | ❌ | ❌ | optional | TrustZone-M |
| **M33** | M4 + TrustZone | optional | ✅ | optional | secure IoT |
| **M55** | new (2020) | ✅ | Helium | ✅ | ML on MCU |

---

## 2. 架构特点

- **Thumb-2** instruction set (mixed 16/32-bit)
- **32-bit registers** (R0-R15)
- **NVIC** (Nested Vectored Interrupt Controller)
- **SysTick** timer (system tick, 1 ms 标准)
- **MPU** (Memory Protection Unit, 安全 RTOS)
- **Bit-banding** (M3+) — atomic single-bit access

---

## 3. 主流 vendor

- **ST**: STM32 (F0-F7, L0-L5, H7)
- **NXP**: LPC, Kinetis, i.MX RT
- **Microchip / Atmel**: SAM, ATSAM
- **Nordic**: nRF series (BLE focus)
- **Espressif**: ESP32 (RISC-V or Xtensa, 类似生态)
- **Renesas, TI, Silicon Labs**: 各 line

---

## 4. 外设 (典型 STM32F4)

- GPIO: 80+ pins
- USART, SPI, I2C, CAN, USB, Ethernet
- ADC (12-bit, 2 Msps)
- DAC (12-bit)
- Timers (16/32-bit, PWM)
- DMA controller
- RTC
- 视频 / 数字相机接口

---

## 5. 开发流程

1. **IDE**:
   - Keil μVision (商业, embedded standard)
   - STM32CubeIDE (ST free, Eclipse-based)
   - VS Code + PlatformIO
   - Arduino IDE (上层抽象)

2. **HAL / Driver**:
   - STM32 HAL (vendor)
   - CMSIS (ARM standard)
   - FreeRTOS / Zephyr

3. **Toolchain**:
   - GCC ARM Embedded
   - LLVM/Clang

4. **Debugger**:
   - J-Link (Segger)
   - ST-Link
   - SWD / JTAG interface

---

## 6. 代码示例 (Blink LED on STM32F4)

```c
#include "stm32f4xx_hal.h"

void SystemClock_Config(void);
static void GPIO_Init(void);

int main(void) {
    HAL_Init();
    SystemClock_Config();
    GPIO_Init();
    
    while (1) {
        HAL_GPIO_TogglePin(GPIOD, GPIO_PIN_12);  // PD12 (LED)
        HAL_Delay(500);
    }
}

static void GPIO_Init(void) {
    GPIO_InitTypeDef gpio = {0};
    __HAL_RCC_GPIOD_CLK_ENABLE();
    gpio.Pin = GPIO_PIN_12;
    gpio.Mode = GPIO_MODE_OUTPUT_PP;
    gpio.Pull = GPIO_NOPULL;
    gpio.Speed = GPIO_SPEED_LOW;
    HAL_GPIO_Init(GPIOD, &gpio);
}
```

---

## 7. 内存 layout

```
0x00000000 - 0x1FFFFFFF: Code (Flash)
0x20000000 - 0x3FFFFFFF: SRAM
0x40000000 - 0x5FFFFFFF: Peripherals
0xE0000000 - 0xFFFFFFFF: System (NVIC, MPU, SCB)
```

Linker script (.ld) 决定 .text / .data / .bss 分布。

---

## 8. 中断处理

```c
void EXTI0_IRQHandler(void) {
    if (__HAL_GPIO_EXTI_GET_IT(GPIO_PIN_0) != RESET) {
        __HAL_GPIO_EXTI_CLEAR_IT(GPIO_PIN_0);
        // 处理中断 (keep short!)
        flag = 1;
    }
}
```

NVIC 设置 priority:
```c
HAL_NVIC_SetPriority(EXTI0_IRQn, 5, 0);
HAL_NVIC_EnableIRQ(EXTI0_IRQn);
```

---

## 9. 低功耗模式

- **Sleep**: CPU off, periph on, μA-mA
- **Stop**: CPU + most periph off, RAM kept, μA
- **Standby**: 最深,nA, 几乎全 off

需 RTC / external pin wake up。

---

## 10. Common Pitfalls

### 10.1 Stack 大小

Default 1-4 KB, RTOS task stack 单独 — overflow → reset。

### 10.2 中断长度

ISR 长 → 阻塞其他中断。defer 长任务到 task。

### 10.3 Volatile

ISR 修改的变量 → 必须 `volatile` 否则编译器 optimize 出错。

### 10.4 Memory alignment

某些 instructions 要求 align (e.g. ARM Cortex-M4 FPU)。

### 10.5 Debug optimization

`-O2` 优化后 debug 困难 — debug 用 `-Og`。

---

## 11. Related Concepts

- **同节**:[RTOS Overview](RTOS_Overview.md)
- **硬件**:[CPU 架构](../02_Computer_Engineering/CPU架构.md)、[嵌入式系统](../02_Computer_Engineering/嵌入式系统.md)

---

## References

1. **Yiu, J.** *The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors*. 3rd ed., 2014.
2. **STM32 reference manuals** (ST documentation).
3. **CMSIS** — https://www.arm.com/cmsis
4. **Carmine, N. R.** *Embedded Software: Know It All*. Newnes, 2008.
