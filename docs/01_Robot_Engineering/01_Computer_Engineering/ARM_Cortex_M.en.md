# ARM Cortex-M Series — Mainstream Embedded MCU

> *ARM Cortex-M is the dominant embedded CPU, from ultra-low-end M0 (STM32F0) to mid M4F (STM32F4) to high-end M7/M33. Tens of billions shipped worldwide. This article covers architecture, peripherals, development flow.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [CPU Architecture](../02_Computer_Engineering/CPU架构.en.md), C language

---

## 1. Cortex-M Family

| Core | Pipeline | FPU | DSP | MPU | Application |
|---|---|---|---|---|---|
| **M0/M0+** | 3-stage | ❌ | ❌ | optional | low-end MCU |
| **M3** | 3-stage | ❌ | ❌ | optional | standard MCU |
| **M4 / M4F** | 3-stage | optional | ✅ | optional | mid (DSP / motor) |
| **M7** | 6-stage | dual | ✅ | optional | high-perf (450 MHz) |
| **M23** | low-power | ❌ | ❌ | optional | TrustZone-M |
| **M33** | M4 + TrustZone | optional | ✅ | optional | secure IoT |
| **M55** | new (2020) | ✅ | Helium | ✅ | ML on MCU |

---

## 2. Architecture Features

- **Thumb-2** instruction set
- **32-bit registers** (R0-R15)
- **NVIC** (Nested Vectored Interrupt Controller)
- **SysTick** timer (1 ms standard)
- **MPU** (Memory Protection Unit)
- **Bit-banding** (M3+) — atomic single-bit access

---

## 3. Major Vendors

- **ST**: STM32 (F0-F7, L0-L5, H7)
- **NXP**: LPC, Kinetis, i.MX RT
- **Microchip / Atmel**: SAM, ATSAM
- **Nordic**: nRF series (BLE)
- **Espressif**: ESP32
- **Renesas, TI, Silicon Labs**: various

---

## 4. Peripherals (Typical STM32F4)

- GPIO: 80+ pins
- USART, SPI, I2C, CAN, USB, Ethernet
- ADC (12-bit, 2 Msps)
- DAC (12-bit)
- Timers (16/32-bit, PWM)
- DMA controller
- RTC

---

## 5. Development Flow

1. **IDE**:
   - Keil μVision (commercial)
   - STM32CubeIDE (ST free)
   - VS Code + PlatformIO
   - Arduino IDE (high-level)

2. **HAL / Driver**:
   - STM32 HAL
   - CMSIS (ARM standard)
   - FreeRTOS / Zephyr

3. **Toolchain**:
   - GCC ARM Embedded
   - LLVM/Clang

4. **Debugger**:
   - J-Link (Segger)
   - ST-Link
   - SWD / JTAG

---

## 6. Code Example (Blink LED on STM32F4)

```c
#include "stm32f4xx_hal.h"

void SystemClock_Config(void);
static void GPIO_Init(void);

int main(void) {
    HAL_Init();
    SystemClock_Config();
    GPIO_Init();
    
    while (1) {
        HAL_GPIO_TogglePin(GPIOD, GPIO_PIN_12);
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

## 7. Memory Layout

```
0x00000000 - 0x1FFFFFFF: Code (Flash)
0x20000000 - 0x3FFFFFFF: SRAM
0x40000000 - 0x5FFFFFFF: Peripherals
0xE0000000 - 0xFFFFFFFF: System (NVIC, MPU, SCB)
```

---

## 8. Interrupt Handling

```c
void EXTI0_IRQHandler(void) {
    if (__HAL_GPIO_EXTI_GET_IT(GPIO_PIN_0) != RESET) {
        __HAL_GPIO_EXTI_CLEAR_IT(GPIO_PIN_0);
        flag = 1;
    }
}
```

NVIC priority:
```c
HAL_NVIC_SetPriority(EXTI0_IRQn, 5, 0);
HAL_NVIC_EnableIRQ(EXTI0_IRQn);
```

---

## 9. Low Power Modes

- **Sleep**: CPU off, peripherals on, μA-mA
- **Stop**: CPU + most peripherals off, RAM kept, μA
- **Standby**: deepest, nA, almost everything off

---

## 10. Common Pitfalls

### 10.1 Stack Size

Default 1-4 KB, RTOS task stack separate — overflow → reset.

### 10.2 ISR Length

Long ISR → blocks other interrupts. Defer long tasks.

### 10.3 Volatile

ISR-modified variables → must be `volatile` or compiler optimizes wrong.

### 10.4 Memory Alignment

Some instructions require alignment.

### 10.5 Debug Optimization

`-O2` makes debugging hard — use `-Og`.

---

## 11. Related Concepts

- **Same section**: [RTOS Overview](RTOS_Overview.en.md)
- **Hardware**: [CPU Architecture](../02_Computer_Engineering/CPU架构.en.md), [Embedded Systems](../02_Computer_Engineering/嵌入式系统.en.md)

---

## References

1. **Yiu, J.** *The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors*. 3rd ed., 2014.
2. **STM32 reference manuals** (ST documentation).
3. **CMSIS** — https://www.arm.com/cmsis
4. **Carmine, N. R.** *Embedded Software: Know It All*. Newnes, 2008.
