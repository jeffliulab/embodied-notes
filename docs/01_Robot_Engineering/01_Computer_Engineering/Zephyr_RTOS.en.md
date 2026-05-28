# Zephyr — Modern Embedded RTOS

> *Zephyr (2016) is hosted by the Linux Foundation, based on Wind River's Rocket OS. Modular, with Device Tree + Kconfig configuration, Linux-style. Open-source like FreeRTOS but more modern: driver model, networking stack, Bluetooth, Wi-Fi, Thread mesh. Pushed by Nordic, NXP, Intel; IoT trend. Apache 2.0 license.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [FreeRTOS](FreeRTOS.en.md), Linux kernel basics

---

## 1. Zephyr vs FreeRTOS

| Dimension | FreeRTOS | Zephyr |
|---|---|---|
| Origin | 2003 Barry, AWS | 2016 Wind River |
| Style | Minimal, RTOS-only | Linux-like, full stack |
| Kernel | ~ 10K LOC | ~ 100K LOC |
| Driver model | None standard | Yes |
| Device Tree | None | Yes |
| Networking | Third-party | Built-in IPv4/6, BLE, Thread |
| Configuration | None menuconfig-style | Kconfig (linux style) |
| File system | + third-party | LittleFS, FAT included |
| BLE / Wi-Fi | Third-party | Included |
| Deployment | Very wide | Growing |
| License | MIT | Apache 2.0 |

---

## 2. Core Primitives

- **Thread**: similar to FreeRTOS task
- **Semaphore / Mutex / Queue / FIFO / LIFO / Mailbox / Pipe**: rich IPC
- **Workqueue**: deferred work
- **K_TIMER / K_DELAYED_WORK**: timing
- **Memory slab / heap**

---

## 3. Device Tree

Linux-style hardware description:
```
my_sensor: sensor@40 {
    compatible = "vendor,sensor";
    reg = <0x40>;
    interrupts = <12 0>;
};
```

DTS → C header → driver consumes.

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

- Python-based meta-tool
- Supports multi-module, blob, tests

---

## 6. Multi-Board Support

| Board | SoC |
|---|---|
| nRF52840 DK | Nordic Cortex-M4 |
| ESP32 | Espressif Xtensa/RISC-V |
| STM32 series | ST |
| nRF5340 | Nordic dual-core |
| nRF7002 | Wi-Fi 6 |
| RP2040 | RP |

---

## 7. Networking

- IPv4 / IPv6
- TCP / UDP
- DHCP / DNS / mDNS
- HTTP client / WebSocket / MQTT / CoAP
- BLE (alternative to Nordic SoftDevice stack)
- Thread mesh (smart home)
- Wi-Fi (depending on SoC)

---

## 8. Power Management

- Auto idle → sleep mode
- DT describes PM domains
- Suits IoT battery life

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

Each device exposes consistent API → app independent of hardware.

---

## 10. Practice — BLE Peripheral

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

## 11. Common Pitfalls

### 11.1 Zephyr = FreeRTOS

No; Zephyr is a framework, FreeRTOS is kernel-only.

### 11.2 Steep Onboarding

Device Tree + Kconfig steep learning curve.

### 11.3 Resource Requirements

Larger than FreeRTOS, but STM32F4 sufficient.

### 11.4 Vendor Lock-in

Depends on board / SoC support; some vendors prioritize vendor SDK.

### 11.5 vs RTOS

Zephyr is an RTOS but with Linux-style network stack and driver model. Between RTOS and Linux.

---

## 12. Related Concepts

- **Same section**: [FreeRTOS](FreeRTOS.en.md), [RTOS Overview](RTOS_Overview.en.md), [ARM Cortex-M](ARM_Cortex_M.en.md)
- **Applications**: IoT, Robot

---

## References

1. **Zephyr** Documentation — https://docs.zephyrproject.org/
2. **Linux Foundation** *Zephyr Project Overview*. 2024.
3. **Nordic Semiconductor** *nRF Connect SDK*. — Zephyr-based commercial.
