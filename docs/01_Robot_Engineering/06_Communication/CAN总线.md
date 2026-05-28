# CAN总线

## 概述

CAN（Controller Area Network）总线最初由Bosch为汽车开发，现已成为机器人电机网络的首选通信协议。它具有可靠的错误处理机制、多节点仲裁能力和实时特性，非常适合连接多个关节驱动器。

## CAN 2.0协议

### 物理层

CAN使用差分信号传输，两根线分别称为CAN_H和CAN_L：

```
CAN_H ────────────────────────────
         差分信号（显性/隐性）
CAN_L ────────────────────────────

显性(Dominant, 逻辑0): CAN_H=3.5V, CAN_L=1.5V, 差值=2V
隐性(Recessive, 逻辑1): CAN_H=2.5V, CAN_L=2.5V, 差值=0V
```

!!! note "显性优先"
    当多个节点同时发送时，显性位（0）会覆盖隐性位（1）。这是CAN仲裁机制的物理基础——"线与"特性。

### 总线拓扑

```
终端电阻        终端电阻
120Ω            120Ω
 ├── CAN_H ─┬────┬────┬── CAN_H ──┤
 │           │    │    │           │
 │         节点1 节点2 节点3        │
 │           │    │    │           │
 ├── CAN_L ─┴────┴────┴── CAN_L ──┤
```

- 总线型拓扑，两端各接120Ω终端电阻
- 最大节点数：标准驱动器32个，高驱动能力可更多
- 总线长度与速率关系：1Mbps@40m，500kbps@100m，125kbps@500m

### CAN 2.0A vs 2.0B

| 特性 | CAN 2.0A | CAN 2.0B |
|------|---------|---------|
| 标识符长度 | 11位（标准帧） | 29位（扩展帧） |
| ID数量 | 2048 | ~5亿 |
| 数据长度 | 0-8字节 | 0-8字节 |
| 兼容性 | 基础 | 向下兼容 |

### 帧格式（标准帧）

```
SOF  ID[10:0]  RTR  IDE  r0  DLC[3:0]  Data[0-8B]  CRC[14:0]  ACK  EOF
 1    11bit    1    1    1    4bit      0-64bit     15bit+1     2    7
```

| 字段 | 位数 | 说明 |
|------|------|------|
| SOF | 1 | 帧起始（显性） |
| ID | 11/29 | 标识符（也决定优先级） |
| RTR | 1 | 远程传输请求 |
| DLC | 4 | 数据长度代码 |
| Data | 0-64 | 有效数据 |
| CRC | 15 | 循环冗余校验 |
| ACK | 2 | 应答位 |
| EOF | 7 | 帧结束（隐性） |

### 仲裁机制

当多个节点同时发送时，通过ID位逐位比较决定优先级：

1. 所有节点同时开始发送
2. 逐位比较ID，发送隐性位但检测到显性位的节点退出
3. ID数值最小的节点获得总线控制权
4. 失败的节点在总线空闲后自动重试

$$
\text{ID越小} \Rightarrow \text{优先级越高}
$$

!!! tip "优先级规划"
    机器人系统中，紧急停止信号应使用最小ID（最高优先级），电机控制指令次之，状态反馈优先级最低。

## CAN FD

CAN FD（Flexible Data Rate）是CAN 2.0的升级版本：

| 特性 | CAN 2.0 | CAN FD |
|------|---------|--------|
| 仲裁段速率 | 1Mbps | 1Mbps |
| 数据段速率 | 同上 | 最高8Mbps |
| 数据长度 | 0-8字节 | 0-64字节 |
| CRC | 15位 | 17/21位 |
| 效率 | 中 | 高（数据段提速） |

CAN FD在仲裁阶段维持与经典CAN相同的速率（保证兼容），在数据传输阶段切换到更高速率。

## 硬件实现

### MCP2515 + TJA1050方案

经典的SPI-CAN方案，适合Arduino/ESP32：

```
MCU(SPI) ──→ MCP2515(CAN控制器) ──→ TJA1050(CAN收发器) ──→ CAN总线
             (协议处理)              (电平转换)
```

| 芯片 | 功能 | 接口 |
|------|------|------|
| MCP2515 | CAN控制器，处理协议 | SPI |
| TJA1050 | CAN收发器，电平转换 | CAN_H/CAN_L |

### ESP32内置CAN

ESP32内置TWAI（Two-Wire Automotive Interface）控制器，只需外接收发器：

```
ESP32(TWAI) ──→ SN65HVD230(收发器) ──→ CAN总线
```

### STM32 CAN

STM32大多数型号内置bxCAN或FDCAN控制器：

```
STM32(bxCAN) ──→ TJA1051(收发器) ──→ CAN总线
```

### 代码示例

```cpp
// ESP32 TWAI (CAN) 示例
#include "driver/twai.h"

void setup() {
    Serial.begin(115200);
    
    // CAN配置
    twai_general_config_t g_config = TWAI_GENERAL_CONFIG_DEFAULT(
        GPIO_NUM_21,  // TX
        GPIO_NUM_22,  // RX
        TWAI_MODE_NORMAL
    );
    twai_timing_config_t t_config = TWAI_TIMING_CONFIG_1MBITS();
    twai_filter_config_t f_config = TWAI_FILTER_CONFIG_ACCEPT_ALL();
    
    twai_driver_install(&g_config, &t_config, &f_config);
    twai_start();
    Serial.println("CAN 初始化完成");
}

void sendMotorCommand(uint32_t motor_id, float position, float velocity) {
    twai_message_t msg;
    msg.identifier = motor_id;
    msg.data_length_code = 8;
    msg.flags = 0;  // 标准帧
    
    // 打包位置和速度（各用4字节float）
    memcpy(&msg.data[0], &position, 4);
    memcpy(&msg.data[4], &velocity, 4);
    
    twai_transmit(&msg, pdMS_TO_TICKS(10));
}

void loop() {
    // 发送电机指令
    sendMotorCommand(0x01, 3.14, 1.0);  // 关节1: 位置π, 速度1
    
    // 接收反馈
    twai_message_t rx_msg;
    if (twai_receive(&rx_msg, pdMS_TO_TICKS(10)) == ESP_OK) {
        float pos_fb, vel_fb;
        memcpy(&pos_fb, &rx_msg.data[0], 4);
        memcpy(&vel_fb, &rx_msg.data[4], 4);
        Serial.printf("ID=0x%03X 位置=%.2f 速度=%.2f\n", 
                       rx_msg.identifier, pos_fb, vel_fb);
    }
    
    delay(1);  // 1ms控制周期
}
```

## 机器人电机网络应用

### 架构设计

每个关节驱动器作为一个CAN节点，主控制器统一调度：

```
主控制器(STM32/Linux)
       │
    CAN总线 (1Mbps)
       │
  ┌────┼────┬────┬────┐
  │    │    │    │    │
 J1   J2   J3   J4  ...
(0x01)(0x02)(0x03)(0x04)
 髋关节 膝关节 踝关节 ...
```

### 通信协议设计

典型的电机控制CAN协议：

| 方向 | ID范围 | 内容 | 频率 |
|------|--------|------|------|
| 主→从 | 0x100-0x1FF | 位置/速度/扭矩指令 | 1kHz |
| 从→主 | 0x200-0x2FF | 位置/速度/电流反馈 | 1kHz |
| 主→从 | 0x000 | 紧急停止（最高优先级） | 事件触发 |
| 从→主 | 0x700-0x7FF | 错误/状态报告 | 事件触发 |

### 时序设计

```
t=0ms:    主→J1: 位置指令
t=0.1ms:  主→J2: 位置指令
t=0.2ms:  主→J3: 位置指令
...
t=0.5ms:  J1→主: 状态反馈
t=0.6ms:  J2→主: 状态反馈
...
t=1ms:    下一控制周期
```

1ms内完成12个关节的指令下发和反馈读取是完全可行的（1Mbps下一帧约130μs）。

## CANopen协议

### 概述

CANopen是基于CAN的应用层协议，定义了标准化的设备描述和通信机制：

### 核心概念

| 概念 | 说明 |
|------|------|
| NMT | 网络管理（启动/停止/复位） |
| SDO | 服务数据对象（配置参数，请求/响应） |
| PDO | 过程数据对象（实时数据，无需请求） |
| SYNC | 同步信号（触发同步PDO） |
| EMCY | 紧急消息（错误报告） |
| Heartbeat | 心跳（节点存活检测） |
| OD | 对象字典（设备参数表） |

### COB-ID分配

| 功能 | COB-ID | 说明 |
|------|--------|------|
| NMT | 0x000 | 网络管理 |
| SYNC | 0x080 | 同步 |
| EMCY | 0x080+NodeID | 紧急 |
| TPDO1 | 0x180+NodeID | 发送PDO1 |
| RPDO1 | 0x200+NodeID | 接收PDO1 |
| SDO(tx) | 0x580+NodeID | SDO响应 |
| SDO(rx) | 0x600+NodeID | SDO请求 |
| Heartbeat | 0x700+NodeID | 心跳 |

### 电机驱动中的应用

许多BLDC驱动器支持CANopen的CiA 402伺服驱动协议（IEC 61800-7-201）：

- 标准化的状态机（未就绪→就绪→运行→故障）
- 标准化的控制模式（位置/速度/扭矩）
- 标准化的参数访问
- 多厂商设备互操作

详见 [电机驱动板](../05_Motors_Actuators/电机驱动板.md)

## CAN vs RS-485对比

| 特性 | CAN | RS-485 |
|------|-----|--------|
| 拓扑 | 总线（多主） | 总线（主从为主） |
| 仲裁 | 内置非破坏性仲裁 | 需要软件协议 |
| 错误处理 | 硬件CRC+错误帧 | 需要软件实现 |
| 速率 | 1Mbps / 8Mbps(FD) | 10Mbps |
| 数据长度 | 8/64字节 | 不限 |
| 节点数 | 32-128 | 32-256 |
| 硬件成本 | 中（需控制器+收发器） | 低（仅收发器） |
| 协议栈 | 硬件处理 | 全软件 |
| 应用 | 电机网络、汽车 | 工业传感器、舵机 |

## 小结

- CAN总线使用差分信号，抗干扰能力强
- 非破坏性仲裁机制保证高优先级消息实时传输
- CAN FD将数据段速率提升到8Mbps，数据长度扩展到64字节
- 每个机器人关节作为一个CAN节点，主控统一调度
- CANopen提供标准化的应用层协议，便于多厂商设备互操作
- CAN是机器人电机网络的首选协议，1ms控制周期下可管理数十个关节
