# CAN Bus

## Introduction

The CAN (Controller Area Network) bus was originally developed by Bosch for the automotive industry and has since become the preferred communication protocol for robot motor networks. It features robust error handling, multi-node arbitration, and real-time characteristics, making it ideal for connecting multiple joint drivers.

## CAN 2.0 Protocol

### Physical Layer

CAN uses differential signaling with two wires called CAN_H and CAN_L:

```
CAN_H ────────────────────────────
         Differential signal (Dominant/Recessive)
CAN_L ────────────────────────────

Dominant (Logic 0): CAN_H=3.5V, CAN_L=1.5V, diff=2V
Recessive (Logic 1): CAN_H=2.5V, CAN_L=2.5V, diff=0V
```

!!! note "Dominant Wins"
    When multiple nodes transmit simultaneously, a dominant bit (0) overrides a recessive bit (1). This is the physical basis of CAN arbitration — a "wired-AND" characteristic.

### Bus Topology

```
Termination          Termination
120 ohm              120 ohm
 ├── CAN_H ─┬────┬────┬── CAN_H ──┤
 │           │    │    │           │
 │         Node1 Node2 Node3       │
 │           │    │    │           │
 ├── CAN_L ─┴────┴────┴── CAN_L ──┤
```

- Bus topology with 120 ohm termination resistors at each end
- Maximum nodes: 32 with standard drivers, more with high-drive-capability transceivers
- Bus length vs. speed: 1 Mbps @ 40 m, 500 kbps @ 100 m, 125 kbps @ 500 m

### CAN 2.0A vs. 2.0B

| Feature | CAN 2.0A | CAN 2.0B |
|---------|----------|----------|
| Identifier length | 11-bit (standard frame) | 29-bit (extended frame) |
| Number of IDs | 2048 | ~500 million |
| Data length | 0–8 bytes | 0–8 bytes |
| Compatibility | Basic | Backward compatible |

### Frame Format (Standard Frame)

```
SOF  ID[10:0]  RTR  IDE  r0  DLC[3:0]  Data[0-8B]  CRC[14:0]  ACK  EOF
 1    11bit    1    1    1    4bit      0-64bit     15bit+1     2    7
```

| Field | Bits | Description |
|-------|------|-------------|
| SOF | 1 | Start of frame (dominant) |
| ID | 11/29 | Identifier (also determines priority) |
| RTR | 1 | Remote transmission request |
| DLC | 4 | Data length code |
| Data | 0–64 | Payload data |
| CRC | 15 | Cyclic redundancy check |
| ACK | 2 | Acknowledge bits |
| EOF | 7 | End of frame (recessive) |

### Arbitration Mechanism

When multiple nodes transmit simultaneously, priority is determined by bit-by-bit comparison of the ID:

1. All nodes begin transmitting simultaneously
2. IDs are compared bit by bit; a node that sends a recessive bit but detects a dominant bit drops out
3. The node with the smallest ID value wins bus control
4. Losing nodes automatically retry when the bus is idle

$$
\text{Smaller ID} \Rightarrow \text{Higher priority}
$$

!!! tip "Priority Planning"
    In robot systems, the emergency stop signal should use the smallest ID (highest priority), motor control commands second, and status feedback the lowest priority.

## CAN FD

CAN FD (Flexible Data Rate) is an upgraded version of CAN 2.0:

| Feature | CAN 2.0 | CAN FD |
|---------|---------|--------|
| Arbitration phase speed | 1 Mbps | 1 Mbps |
| Data phase speed | Same | Up to 8 Mbps |
| Data length | 0–8 bytes | 0–64 bytes |
| CRC | 15-bit | 17/21-bit |
| Efficiency | Medium | High (data phase speedup) |

CAN FD maintains the same speed as classic CAN during the arbitration phase (ensuring compatibility) and switches to a higher rate during data transmission.

## Hardware Implementation

### MCP2515 + TJA1050 Solution

The classic SPI-to-CAN solution, suitable for Arduino/ESP32:

```
MCU(SPI) ──→ MCP2515(CAN controller) ──→ TJA1050(CAN transceiver) ──→ CAN bus
             (Protocol processing)        (Level conversion)
```

| Chip | Function | Interface |
|------|----------|-----------|
| MCP2515 | CAN controller, handles protocol | SPI |
| TJA1050 | CAN transceiver, level conversion | CAN_H/CAN_L |

### ESP32 Built-in CAN

The ESP32 has a built-in TWAI (Two-Wire Automotive Interface) controller; only an external transceiver is needed:

```
ESP32(TWAI) ──→ SN65HVD230(transceiver) ──→ CAN bus
```

### STM32 CAN

Most STM32 models have built-in bxCAN or FDCAN controllers:

```
STM32(bxCAN) ──→ TJA1051(transceiver) ──→ CAN bus
```

### Code Example

```cpp
// ESP32 TWAI (CAN) example
#include "driver/twai.h"

void setup() {
    Serial.begin(115200);
    
    // CAN configuration
    twai_general_config_t g_config = TWAI_GENERAL_CONFIG_DEFAULT(
        GPIO_NUM_21,  // TX
        GPIO_NUM_22,  // RX
        TWAI_MODE_NORMAL
    );
    twai_timing_config_t t_config = TWAI_TIMING_CONFIG_1MBITS();
    twai_filter_config_t f_config = TWAI_FILTER_CONFIG_ACCEPT_ALL();
    
    twai_driver_install(&g_config, &t_config, &f_config);
    twai_start();
    Serial.println("CAN initialized");
}

void sendMotorCommand(uint32_t motor_id, float position, float velocity) {
    twai_message_t msg;
    msg.identifier = motor_id;
    msg.data_length_code = 8;
    msg.flags = 0;  // Standard frame
    
    // Pack position and velocity (4 bytes float each)
    memcpy(&msg.data[0], &position, 4);
    memcpy(&msg.data[4], &velocity, 4);
    
    twai_transmit(&msg, pdMS_TO_TICKS(10));
}

void loop() {
    // Send motor command
    sendMotorCommand(0x01, 3.14, 1.0);  // Joint 1: position pi, velocity 1
    
    // Receive feedback
    twai_message_t rx_msg;
    if (twai_receive(&rx_msg, pdMS_TO_TICKS(10)) == ESP_OK) {
        float pos_fb, vel_fb;
        memcpy(&pos_fb, &rx_msg.data[0], 4);
        memcpy(&vel_fb, &rx_msg.data[4], 4);
        Serial.printf("ID=0x%03X pos=%.2f vel=%.2f\n", 
                       rx_msg.identifier, pos_fb, vel_fb);
    }
    
    delay(1);  // 1ms control period
}
```

## Robot Motor Network Applications

### Architecture Design

Each joint driver serves as a CAN node, with a master controller coordinating them:

```
Master Controller (STM32/Linux)
       │
    CAN Bus (1Mbps)
       │
  ┌────┼────┬────┬────┐
  │    │    │    │    │
 J1   J2   J3   J4  ...
(0x01)(0x02)(0x03)(0x04)
 Hip   Knee  Ankle ...
```

### Communication Protocol Design

A typical motor control CAN protocol:

| Direction | ID Range | Content | Frequency |
|-----------|----------|---------|-----------|
| Master→Slave | 0x100–0x1FF | Position/velocity/torque commands | 1 kHz |
| Slave→Master | 0x200–0x2FF | Position/velocity/current feedback | 1 kHz |
| Master→Slave | 0x000 | Emergency stop (highest priority) | Event-triggered |
| Slave→Master | 0x700–0x7FF | Error/status reports | Event-triggered |

### Timing Design

```
t=0ms:    Master→J1: Position command
t=0.1ms:  Master→J2: Position command
t=0.2ms:  Master→J3: Position command
...
t=0.5ms:  J1→Master: Status feedback
t=0.6ms:  J2→Master: Status feedback
...
t=1ms:    Next control cycle
```

Completing command dispatch and feedback reading for 12 joints within 1 ms is entirely feasible (~130 us per frame at 1 Mbps).

## CANopen Protocol

### Overview

CANopen is an application-layer protocol built on CAN that defines standardized device descriptions and communication mechanisms:

### Core Concepts

| Concept | Description |
|---------|-------------|
| NMT | Network Management (start/stop/reset) |
| SDO | Service Data Object (configuration parameters, request/response) |
| PDO | Process Data Object (real-time data, no request needed) |
| SYNC | Synchronization signal (triggers synchronous PDOs) |
| EMCY | Emergency message (error reporting) |
| Heartbeat | Heartbeat (node alive detection) |
| OD | Object Dictionary (device parameter table) |

### COB-ID Assignment

| Function | COB-ID | Description |
|----------|--------|-------------|
| NMT | 0x000 | Network management |
| SYNC | 0x080 | Synchronization |
| EMCY | 0x080+NodeID | Emergency |
| TPDO1 | 0x180+NodeID | Transmit PDO1 |
| RPDO1 | 0x200+NodeID | Receive PDO1 |
| SDO(tx) | 0x580+NodeID | SDO response |
| SDO(rx) | 0x600+NodeID | SDO request |
| Heartbeat | 0x700+NodeID | Heartbeat |

### Application in Motor Drives

Many BLDC drivers support CANopen's CiA 402 servo drive protocol (IEC 61800-7-201):

- Standardized state machine (Not Ready → Ready → Running → Fault)
- Standardized control modes (position/velocity/torque)
- Standardized parameter access
- Multi-vendor device interoperability

See [Motor Driver Boards](../05_Motors_Actuators/电机驱动板.md) for details.

## CAN vs. RS-485 Comparison

| Feature | CAN | RS-485 |
|---------|-----|--------|
| Topology | Bus (multi-master) | Bus (mainly master-slave) |
| Arbitration | Built-in non-destructive arbitration | Requires software protocol |
| Error handling | Hardware CRC + error frames | Requires software implementation |
| Speed | 1 Mbps / 8 Mbps (FD) | 10 Mbps |
| Data length | 8/64 bytes | Unlimited |
| Nodes | 32–128 | 32–256 |
| Hardware cost | Medium (controller + transceiver) | Low (transceiver only) |
| Protocol stack | Hardware-handled | All software |
| Application | Motor networks, automotive | Industrial sensors, servos |

## Summary

- CAN bus uses differential signaling for strong noise immunity
- Non-destructive arbitration ensures real-time delivery of high-priority messages
- CAN FD boosts the data phase speed to 8 Mbps and extends data length to 64 bytes
- Each robot joint serves as a CAN node, with the master controller coordinating them all
- CANopen provides a standardized application-layer protocol for multi-vendor device interoperability
- CAN is the preferred protocol for robot motor networks, capable of managing dozens of joints within a 1 ms control cycle
