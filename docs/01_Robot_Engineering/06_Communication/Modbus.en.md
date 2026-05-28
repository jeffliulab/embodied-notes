# Modbus — Industrial Communication Workhorse

> *Invented 1979 by Modicon, Modbus is still 40+ year industrial communication staple. The simplest Master-Slave protocol, no license, any MCU + UART can implement. Modbus RTU (serial RS-485) suits field-level, Modbus TCP for IT integration. Widely supported by PLCs, HMIs, SCADA, VFDs, sensors.*
>
> **Difficulty**: Beginner-Intermediate
> **Prerequisites**: Serial/UART, TCP/IP

---

## 1. Modbus Family

| Variant | Physical layer | Application |
|---|---|---|
| Modbus RTU | RS-485 serial | Field level |
| Modbus ASCII | RS-485 | Legacy, rare |
| Modbus TCP | Ethernet | IT-OT bridge |
| Modbus UDP | Ethernet | Experimental |

---

## 2. Model

- **Master-Slave**: 1 master + ≤ 247 slaves
- Slave never speaks first → master must poll
- Simple but low bandwidth utilization

---

## 3. Data Model

4 register types:

| Type | R/W | Purpose |
|---|---|---|
| Coil | R/W bit | Digital output |
| Discrete Input | R bit | Digital input |
| Input Register | R 16-bit | ADC etc. |
| Holding Register | R/W 16-bit | Config/setpoint |

Each register one 16-bit address (0-65535).

---

## 4. RTU Frame Format

```
[Addr 1B] [FuncCode 1B] [Data N B] [CRC16 2B]
        Silent ≥ 3.5 char        Silent ≥ 3.5 char
```

No start/stop bytes; framed only by inter-byte timeout.

---

## 5. TCP Frame

```
[MBAP Header 7B] [Func 1B] [Data]
- Transaction ID 2B
- Protocol ID 2B (always 0)
- Length 2B
- Unit ID 1B (slave addr)
```

No CRC (TCP already guarantees).

---

## 6. Common Function Codes

| 0x | Name |
|---|---|
| 0x01 | Read Coils |
| 0x02 | Read Discrete Inputs |
| 0x03 | Read Holding Registers |
| 0x04 | Read Input Registers |
| 0x05 | Write Single Coil |
| 0x06 | Write Single Register |
| 0x0F | Write Multiple Coils |
| 0x10 | Write Multiple Registers |
| 0x17 | Read/Write Multiple Registers |

---

## 7. Python — pymodbus

```python
from pymodbus.client.sync import ModbusSerialClient

client = ModbusSerialClient(
    method='rtu', port='/dev/ttyUSB0',
    baudrate=9600, bytesize=8, parity='N', stopbits=1, timeout=1
)
client.connect()

# Read 10 holding registers from slave 1, addr 0x0000
rr = client.read_holding_registers(0, 10, unit=1)
print(rr.registers)  # list of 16-bit ints

# Write
client.write_register(0x0001, 1234, unit=1)
client.close()
```

---

## 8. Modbus TCP Server (C-style outline)

```c
// listen on TCP 502
int sock = socket(AF_INET, SOCK_STREAM, 0);
// bind 502, listen, accept
// per-request: parse MBAP, dispatch on funcCode, send response
```

---

## 9. vs. Modern Protocols

| Protocol | Latency | Complexity |
|---|---|---|
| Modbus RTU | 10-50 ms | Minimal |
| Modbus TCP | 5-20 ms | Simple |
| EtherCAT | < 1 ms | Complex |
| PROFINET | < 1 ms | Complex |
| OPC UA | 10-100 ms | Complex (but secure) |

→ Modbus still dominates field level; IT-OT trend replaces with OPC UA.

---

## 10. Common Pitfalls

### 10.1 16-bit Limit

Float (32-bit) needs two registers; endianness vendor-defined.

### 10.2 RTU No Time Sync

No NTP etc.; master must add timestamp.

### 10.3 RS-485 Termination

Missing termination resistor → reflections → CRC errors.

### 10.4 Address Confusion

Modicon 1-based, protocol 0-based, docs must be explicit.

### 10.5 Master-Slave Bottleneck

100 slaves + slow poll → seconds per cycle.

---

## 11. Related Concepts

- **Same section**: [USB](USB.en.md), industrial buses
- **Embedded**: [ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.en.md)

---

## References

1. **Modicon** *Modbus Protocol Reference Guide*. 1996.
2. **Modbus Organization** *Modbus Application Protocol V1.1b3*. 2012.
3. **pymodbus** Documentation — https://pymodbus.readthedocs.io/
