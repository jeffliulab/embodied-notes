# USB — Universal Serial Bus

> *USB 是当今**最普及**的硬件接口。从 USB 1.0 (1996, 12 Mbps) 到 USB4 / USB-C (40 Gbps + 240W power)。本篇覆盖物理层、协议栈、enumeration、PD。*
>
> **难度**:Intermediate
> **前置知识**:[串口与 I2C/SPI](串口与I2C_SPI.md)、数字电路

---

## 1. USB 版本

| Version | 速度 | 时间 | Power |
|---|---|---|---|
| USB 1.1 | 12 Mbps (Full) | 1998 | 5V 0.5A |
| USB 2.0 | 480 Mbps (High) | 2000 | 5V 0.5A |
| USB 3.0 | 5 Gbps (SuperSpeed) | 2008 | 5V 0.9A |
| USB 3.1 Gen 2 | 10 Gbps | 2013 | 5V 1.5A |
| USB 3.2 | 20 Gbps (2 lane) | 2017 | 5V 1.5A |
| **USB4** | 40 Gbps (Thunderbolt 3-compatible) | 2019 | 100W PD |
| **USB4 v2** | 80 Gbps | 2022 | 240W EPR |
| Thunderbolt 4 | 40 Gbps + display | 2020 | 100W |
| Thunderbolt 5 | 80 Gbps | 2024 | 240W |

---

## 2. 连接器类型

- **Type-A**: 经典 PC 端
- **Type-B**: 打印机, hub
- **Mini-B**: 旧手机
- **Micro-B**: Android 2010-2016
- **Type-C**: 现代 universal (24-pin, 可正反插)
- **Lightning**: Apple proprietary (EU 强制 2024 转 Type-C)

---

## 3. USB 拓扑

```
Host (PC / phone) — Hub — Device
                       └─ Device
                       └─ Device
```

- Tiered star,最多 7 层
- 一个 USB host 最多 127 devices

---

## 4. 协议栈

```
Application      ← libusb / class drivers
Class            ← HID, MSC, CDC, Audio, Video, MIDI
USB Protocol     ← Tokens, packets, endpoints
USB Bus          ← Differential pair (D+/D-) or SS pairs
```

---

## 5. Endpoints

每个 device 有:
- **Endpoint 0**: control (enumeration)
- **Endpoint N**: data 

类型:
- **Control**: Status (e.g. set USB address)
- **Bulk**: 大量数据 (USB drive, printer)
- **Interrupt**: 小, 快, 周期 (mouse, keyboard)
- **Isochronous**: 等时 (audio, video — 容忍丢但需时序)

---

## 6. Enumeration (插入流程)

```
1. Device 插入,host 检测 D+/D- pull-up
2. Host reset device
3. Host assign address (1-127)
4. Get Device Descriptor
5. Get Configuration Descriptor
6. Get Interface / Endpoint Descriptors
7. Get String Descriptors (vendor, product names)
8. Load driver (by VID/PID + class)
9. Device ready
```

---

## 7. USB Power Delivery (USB PD)

USB-C + PD 3.1:
- 100W (5A × 20V), 240W (5A × 48V EPR)
- 协议:CC line + BMC encoding
- Source / Sink 协商 PDO (Power Data Object)
- 应用:笔记本电源, monitor, EV charger

---

## 8. USB Class

- **HID** (Human Interface Device): mouse, keyboard
- **MSC** (Mass Storage Class): USB drive
- **CDC** (Communications Device Class): virtual serial (Arduino)
- **UAC** (USB Audio Class): audio interface
- **UVC** (USB Video Class): webcam
- **MTP** (Media Transfer Protocol): Android
- **DFU** (Device Firmware Update): bootloader

---

## 9. PyTorch / Python — libusb 使用

```python
import usb.core
import usb.util

# Find a specific device by VID:PID
dev = usb.core.find(idVendor=0x1234, idProduct=0x5678)
if dev is None:
    raise ValueError("Device not found")

dev.set_configuration()
cfg = dev.get_active_configuration()
intf = cfg[(0, 0)]

# Find endpoints
ep_in = usb.util.find_descriptor(intf, custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)

# Read data
data = dev.read(ep_in.bEndpointAddress, 64)
print(data)
```

---

## 10. 硬件设计

- **Differential pair**: D+/D- 50-ohm trace, 90-ohm differential
- **Length matching**: < 5 mm 差
- **Termination**: 不需 (USB controller 内置)
- **ESD protection**: TVS diode (USBLC6-2SC6)
- **Common-mode choke**: 0805 NCM size

---

## 11. Common Pitfalls

### 11.1 USB-C 不一定 USB 4

USB-C 是 connector,但可只支持 USB 2.0。读 spec。

### 11.2 PD cable

100W+ 需 e-marker (智能 cable)。普通 Type-C 只 60W (3A)。

### 11.3 信号完整性

5 Gbps+ 对 PCB 要求高;impedance / length matching。

### 11.4 Enumeration 失败

VID/PID 错或 descriptor 错 → 设备不识。USB tracer 调试。

### 11.5 Power negotiation

PD 协议复杂;不规范 cable 可能损 device。

---

## 12. Related Concepts

- **同节**:[CAN 总线](CAN总线.md)、[串口与 I2C/SPI](串口与I2C_SPI.md)、[WiFi 与蓝牙](WiFi与蓝牙.md)、[以太网与 EtherCAT](以太网与EtherCAT.md)
- **嵌入式**:[ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.md)

---

## References

1. **USB Implementers Forum** — https://www.usb.org/
2. **Axelson, J.** *USB Complete*. 5th ed., 2015.
3. **USB-IF USB 3.2 spec, USB4 spec**.
4. **libusb** documentation.
