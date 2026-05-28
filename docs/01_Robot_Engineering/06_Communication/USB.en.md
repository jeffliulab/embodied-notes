# USB — Universal Serial Bus

> *USB is today's **most ubiquitous** hardware interface. From USB 1.0 (1996, 12 Mbps) to USB4 / USB-C (40 Gbps + 240W power). This article covers physical layer, protocol stack, enumeration, PD.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Serial & I2C/SPI](串口与I2C_SPI.en.md), digital circuits

---

## 1. USB Versions

| Version | Speed | Year | Power |
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

## 2. Connectors

- **Type-A**: classic PC end
- **Type-B**: printer, hub
- **Mini-B**: old phones
- **Micro-B**: Android 2010-2016
- **Type-C**: modern universal (24-pin, reversible)
- **Lightning**: Apple proprietary (EU forced switch to Type-C 2024)

---

## 3. USB Topology

```
Host (PC / phone) — Hub — Device
                       └─ Device
                       └─ Device
```

- Tiered star, max 7 tiers
- One USB host max 127 devices

---

## 4. Protocol Stack

```
Application      ← libusb / class drivers
Class            ← HID, MSC, CDC, Audio, Video, MIDI
USB Protocol     ← Tokens, packets, endpoints
USB Bus          ← Differential pair (D+/D-) or SS pairs
```

---

## 5. Endpoints

Each device has:
- **Endpoint 0**: control (enumeration)
- **Endpoint N**: data

Types:
- **Control**: status
- **Bulk**: large data (USB drive, printer)
- **Interrupt**: small, fast, periodic (mouse, keyboard)
- **Isochronous**: timed (audio, video — tolerate loss but need timing)

---

## 6. Enumeration

```
1. Device plugged in, host detects D+/D- pull-up
2. Host resets device
3. Host assigns address (1-127)
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
- Protocol: CC line + BMC encoding
- Source / Sink negotiate PDO (Power Data Object)
- Applications: laptop power, monitor, EV charger

---

## 8. USB Classes

- **HID**: mouse, keyboard
- **MSC**: USB drive
- **CDC**: virtual serial (Arduino)
- **UAC**: audio interface
- **UVC**: webcam
- **MTP**: Android
- **DFU**: bootloader

---

## 9. Python — libusb Usage

```python
import usb.core
import usb.util

dev = usb.core.find(idVendor=0x1234, idProduct=0x5678)
if dev is None:
    raise ValueError("Device not found")

dev.set_configuration()
cfg = dev.get_active_configuration()
intf = cfg[(0, 0)]

ep_in = usb.util.find_descriptor(intf, custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)

data = dev.read(ep_in.bEndpointAddress, 64)
print(data)
```

---

## 10. Hardware Design

- **Differential pair**: D+/D- 50-ohm trace, 90-ohm differential
- **Length matching**: < 5 mm difference
- **Termination**: not needed (USB controller built-in)
- **ESD protection**: TVS diode (USBLC6-2SC6)
- **Common-mode choke**: 0805 NCM size

---

## 11. Common Pitfalls

### 11.1 USB-C ≠ USB 4

USB-C is connector; may support only USB 2.0. Read spec.

### 11.2 PD Cable

100W+ requires e-marker (smart cable). Plain Type-C only 60W (3A).

### 11.3 Signal Integrity

5 Gbps+ has strict PCB requirements; impedance / length matching.

### 11.4 Enumeration Failure

Wrong VID/PID or descriptor → device not recognized. USB tracer to debug.

### 11.5 Power Negotiation

PD protocol complex; non-compliant cable may damage device.

---

## 12. Related Concepts

- **Same section**: [CAN Bus](CAN总线.en.md), [Serial & I2C/SPI](串口与I2C_SPI.en.md), [WiFi & Bluetooth](WiFi与蓝牙.en.md), [Ethernet & EtherCAT](以太网与EtherCAT.en.md)
- **Embedded**: [ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.en.md)

---

## References

1. **USB Implementers Forum** — https://www.usb.org/
2. **Axelson, J.** *USB Complete*. 5th ed., 2015.
3. **USB-IF USB 3.2 spec, USB4 spec**.
4. **libusb** documentation.
