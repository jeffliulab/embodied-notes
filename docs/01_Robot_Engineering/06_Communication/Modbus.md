# Modbus — 工业通信主力协议

> *Modbus 1979 Modicon 发明,40+ 年仍是工业通信主力。最简单的 Master-Slave 协议,无 license,任何 MCU + UART 可实现。Modbus RTU (serial RS-485) 适合现场层,Modbus TCP 接入 IT 网。被 PLC、HMI、SCADA、VFD、传感器普遍支持。*
>
> **难度**:Beginner-Intermediate
> **前置知识**:Serial/UART、TCP/IP

---

## 1. Modbus 家族

| 变体 | 物理层 | 应用 |
|---|---|---|
| Modbus RTU | RS-485 串行 | 现场级 |
| Modbus ASCII | RS-485 | 老式,少用 |
| Modbus TCP | Ethernet | IT-OT 桥接 |
| Modbus UDP | Ethernet | 实验性 |

---

## 2. 模型

- **Master-Slave**: 1 master + ≤ 247 slaves
- Slave 不主动 → master 必须 poll
- 简单但带宽利用率低

---

## 3. 数据模型

4 种 register:

| 类型 | R/W | 用途 |
|---|---|---|
| Coil | R/W bit | 数字输出 |
| Discrete Input | R bit | 数字输入 |
| Input Register | R 16-bit | ADC 等 |
| Holding Register | R/W 16-bit | 配置/setpoint |

每 register 一个 16-bit address (0-65535)。

---

## 4. RTU 帧格式

```
[Addr 1B] [FuncCode 1B] [Data N B] [CRC16 2B]
        Silent ≥ 3.5 char        Silent ≥ 3.5 char
```

无 start/stop,仅由 inter-byte timeout 分帧。

---

## 5. TCP 帧

```
[MBAP Header 7B] [Func 1B] [Data]
- Transaction ID 2B
- Protocol ID 2B (always 0)
- Length 2B
- Unit ID 1B (slave addr)
```

无 CRC(TCP 已保证)。

---

## 6. 常用 Function Codes

| 0x | 名称 |
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

## 8. Modbus TCP 服务器(C 简化)

```c
// listen on TCP 502
int sock = socket(AF_INET, SOCK_STREAM, 0);
// bind 502, listen, accept
// per-request: parse MBAP, dispatch on funcCode, send response
```

---

## 9. 与现代 protocol 比较

| 协议 | 时延 | 复杂度 |
|---|---|---|
| Modbus RTU | 10-50 ms | 极简 |
| Modbus TCP | 5-20 ms | 简 |
| EtherCAT | < 1 ms | 复杂 |
| PROFINET | < 1 ms | 复杂 |
| OPC UA | 10-100 ms | 复杂 (但 secure) |

→ Modbus 现场层依然主导,但 IT-OT 趋势用 OPC UA 取代。

---

## 10. 常见问题

### 10.1 16-bit 限制

Float (32-bit) 需两 register,大小端 vendor 自定。

### 10.2 RTU 无校时

无 NTP 等,timestamp 需 master 加。

### 10.3 RS-485 termination

未加 termination resistor → 反射 → CRC error。

### 10.4 Address Confusion

Modicon 1-based、protocol 0-based,文档需明确。

### 10.5 主从瓶颈

100 slave + 慢 poll → 数秒一周期。

---

## 11. Related Concepts

- **嵌入式**:[ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.md)

---

## References

1. **Modicon** *Modbus Protocol Reference Guide*. 1996.
2. **Modbus Organization** *Modbus Application Protocol V1.1b3*. 2012.
3. **pymodbus** Documentation — https://pymodbus.readthedocs.io/
