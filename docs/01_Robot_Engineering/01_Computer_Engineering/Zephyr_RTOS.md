# Zephyr — 现代化嵌入式 RTOS

> *Zephyr 2016 由 Linux Foundation host,Wind River 捐献 Rocket OS 为基础。模块化、device tree、Kconfig 配置,与 Linux 风格一致。同样开源 RTOS 但比 FreeRTOS 现代:driver model、networking stack、Bluetooth、Wi-Fi、Thread mesh。Nordic、NXP、Intel 主推,IoT 趋势。Apache 2.0 license。*
>
> **难度**:Intermediate
> **前置知识**:[FreeRTOS](FreeRTOS.md)、Linux kernel 基础

---

## 1. Zephyr vs FreeRTOS

| 维度 | FreeRTOS | Zephyr |
|---|---|---|
| 起源 | 2003 Barry,AWS | 2016 Wind River |
| Style | Minimal,RTOS-only | Linux-like,full stack |
| Kernel | ~ 10K LOC | ~ 100K LOC |
| Driver model | 无标准 | Yes |
| Device Tree | 无 | Yes |
| Networking | 第三方 | 内置 IPv4/6, BLE, Thread |
| Configuration | menuconfig 风格无 | Kconfig (linux 风) |
| File system | + 第三方 | LittleFS、FAT 内 |
| BLE / Wi-Fi | 第三方 | 内 |
| 部署 | 极广 | 长大 |
| License | MIT | Apache 2.0 |

---

## 2. 核心 Primitives

- **Thread**: similar to FreeRTOS task
- **Semaphore / Mutex / Queue / FIFO / LIFO / Mailbox / Pipe**: rich IPC
- **Workqueue**: deferred work
- **K_TIMER / K_DELAYED_WORK**: timing
- **Memory slab / heap**

---

## 3. Device Tree

类似 Linux 描述硬件:
```
my_sensor: sensor@40 {
    compatible = "vendor,sensor";
    reg = <0x40>;
    interrupts = <12 0>;
};
```

Build 时 DTS → C header → driver 用。

---

## 4. Hello World

```c
#include <zephyr/kernel.h>
#include <zephyr/sys/printk.h>

void main(void) {
    while (1) {
        printk("Hello, Zephyr!\n");
        k_msleep(1000);
    }
}
```

```yaml
# prj.conf
CONFIG_PRINTK=y
CONFIG_LOG=y
```

---

## 5. Build System (West)

```bash
west init -m https://github.com/zephyrproject-rtos/zephyr myws
cd myws
west update
west build -b nrf52840dk_nrf52840 samples/hello_world
west flash
```

- Pyhton-based meta-tool
- 支持多 module、blob、test

---

## 6. 多 Board 支持

|Board | SoC |
|---|---|
| nRF52840 DK | Nordic Cortex-M4 |
| ESP32 | Espressif Xtensa/RISC-V |
| STM32 系列 | ST |
| nRF5340 | Nordic dual-core |
| nRF7002 | Wi-Fi 6 |
| RP2040 | RP |

---

## 7. Networking

- IPv4 / IPv6
- TCP / UDP
- DHCP / DNS / mDNS
- HTTP client / WebSocket / MQTT / CoAP
- BLE (Nordic SoftDevice 替代 stack)
- Thread mesh (smart home)
- Wi-Fi (depending on SoC)

---

## 8. Power Management

- 自动 idle → sleep mode
- DT 描述 PM domain
- 适合 IoT battery 寿命

---

## 9. Driver Model

```c
DEVICE_DT_INST_DEFINE(0, init_func, NULL,
    &data, &cfg, POST_KERNEL,
    CONFIG_SENSOR_INIT_PRIORITY,
    &api);

const struct sensor_driver_api api = {
    .sample_fetch = my_fetch,
    .channel_get = my_get,
};
```

每 device 一致 API → app 不依赖具体 hardware。

---

## 10. 实战 — BLE Peripheral

```c
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gap.h>

static const struct bt_data ad[] = {
    BT_DATA_BYTES(BT_DATA_FLAGS, BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR),
};

void main(void) {
    bt_enable(NULL);
    bt_le_adv_start(BT_LE_ADV_CONN, ad, ARRAY_SIZE(ad), NULL, 0);
    while (1) {
        k_msleep(1000);
    }
}
```

---

## 11. 常见问题

### 11.1 Zephyr = FreeRTOS

不;Zephyr 是 framework,FreeRTOS 是 kernel-only。

### 11.2 入门门槛

Device Tree + Kconfig 学习曲线 steep。

### 11.3 资源需求

Kernel 较 FreeRTOS 大,但 STM32F4 起足够。

### 11.4 Vendor Lock-in

依 board / SoC support;部分 vendor 优先 vendor SDK。

### 11.5 vs RTOS

Zephyr 是 RTOS;但带 Linux 风网络栈、driver 模型。介于 RTOS 与 Linux 之间。

---

## 12. Related Concepts

- **同节**:[FreeRTOS](FreeRTOS.md)、[RTOS_Overview](RTOS_Overview.md)、[ARM_Cortex_M](ARM_Cortex_M.md)
- **应用**:IoT、Robot

---

## References

1. **Zephyr** Documentation — https://docs.zephyrproject.org/
2. **Linux Foundation** *Zephyr Project Overview*. 2024.
3. **Nordic Semiconductor** *nRF Connect SDK*. — Zephyr-based commercial.
