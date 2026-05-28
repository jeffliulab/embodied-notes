# 串口与I2C/SPI

## 概述

UART（串口）、I2C和SPI是嵌入式系统中最基础的三种通信协议，几乎所有机器人都会用到。它们各自适用于不同的场景：UART用于板间点对点通信，I2C用于低速多设备挂载，SPI用于高速外设读写。

## UART（通用异步收发器）

### 基本原理

UART（Universal Asynchronous Receiver/Transmitter）是最简单的串行通信协议：

- **异步**：无时钟线，收发双方约定相同波特率
- **全双工**：TX和RX独立，可同时收发
- **点对点**：标准UART只连接两个设备

### 帧格式

```
空闲(HIGH) ─┐  ┌─────────────────┐  ┌──┐  ┌─ 空闲(HIGH)
            └──┤ D0 D1 ... D7    ├──┤P ├──┤
          起始位    数据位(8bit)    校验  停止位
           (LOW)                  (可选) (HIGH)
```

| 参数 | 说明 |
|------|------|
| 起始位 | 1位，固定为LOW |
| 数据位 | 通常8位（也可5/6/7/9位） |
| 校验位 | 无/奇校验/偶校验（可选） |
| 停止位 | 1位或2位，固定为HIGH |

### 波特率

常用波特率：

| 波特率 | 字节速率 | 典型应用 |
|--------|---------|---------|
| 9600 | 960 B/s | GPS（NMEA） |
| 115200 | 11.5 KB/s | 调试串口、通用 |
| 256000 | 25.6 KB/s | 快速数据传输 |
| 1000000 | 100 KB/s | 总线舵机（Feetech STS） |
| 2000000 | 200 KB/s | 激光雷达 |

!!! warning "波特率匹配"
    收发两端波特率必须一致，误差不超过3-5%，否则数据乱码。晶振精度很重要。

### 电平标准

| 标准 | 电平 | 传输距离 | 应用 |
|------|------|---------|------|
| TTL | 0V/3.3V 或 0V/5V | <1m | MCU间直连 |
| RS-232 | ±3~15V | <15m | PC串口（DB9） |
| RS-485 | 差分±1.5V | <1200m | 工业设备、Dynamixel |

### RS-485详解

RS-485使用差分信号，抗干扰能力强：

```
     A线 ───────────────────────
            差分信号              
     B线 ───────────────────────
     
     逻辑1: A > B (A-B > +200mV)
     逻辑0: A < B (A-B < -200mV)
```

特点：

- 半双工（两线）或全双工（四线）
- 多点通信：一条总线上可挂载32/128/256个节点
- 传输距离长：1200m@100kbps
- 需要终端电阻（120Ω）

### Arduino/ESP32 UART代码

```cpp
// ESP32 双串口示例
// Serial  - USB调试
// Serial1 - 连接GPS
// Serial2 - 连接激光雷达

void setup() {
    Serial.begin(115200);                          // USB调试
    Serial1.begin(9600, SERIAL_8N1, 16, 17);       // GPS: RX=16, TX=17
    Serial2.begin(230400, SERIAL_8N1, 18, 19);     // 激光雷达: RX=18, TX=19
}

void loop() {
    // 读取GPS数据
    while (Serial1.available()) {
        char c = Serial1.read();
        if (c == '$') {
            String nmea = Serial1.readStringUntil('\n');
            Serial.println("GPS: " + nmea);
        }
    }
    
    // 读取激光雷达数据包
    if (Serial2.available() >= 47) {  // 完整数据包长度
        uint8_t header = Serial2.read();
        if (header == 0x54) {
            // 解析数据包...
        }
    }
}
```

## I2C（内部集成电路总线）

### 基本原理

I2C（Inter-Integrated Circuit）由Philips开发，两线制同步串行总线：

- **SDA（Serial Data）**：数据线
- **SCL（Serial Clock）**：时钟线
- **开漏输出**：需要外部上拉电阻

### 总线结构

```
VCC ───┬────────┬────────┬────────┐
       R(4.7k)  R(4.7k)  │        │
       │        │        │        │
SDA ───┼────────┼────────┼────────┤
SCL ───┼────────┼────────┼────────┤
       │        │        │        │
     [MCU]   [IMU]    [OLED]  [EEPROM]
    (Master) (0x68)   (0x3C)  (0x50)
```

### 地址机制

- **7位地址**：理论128个设备，实际约112个可用
- **10位地址**：扩展模式，很少使用
- 每个设备有固定或可配置的地址

常见设备地址：

| 设备 | 地址 |
|------|------|
| MPU6050 IMU | 0x68 / 0x69 |
| BME280气压计 | 0x76 / 0x77 |
| SSD1306 OLED | 0x3C / 0x3D |
| AS5600编码器 | 0x36 |
| PCA9685 PWM | 0x40-0x7F |
| EEPROM AT24C | 0x50-0x57 |

### 通信协议

```
起始   地址(7bit) R/W ACK  数据(8bit) ACK  数据(8bit) ACK  停止
 S    [A6...A0]  [W]  [A] [D7...D0]  [A]  [D7...D0]  [A]   P
 ↓        ↓       ↓    ↓      ↓       ↓      ↓       ↓    ↓
SDA:  ─┐ XXXXXXX  X    X  XXXXXXXX    X  XXXXXXXX    X  ┌─
SCL:  ─┘ ^^^^^^^^  ^    ^  ^^^^^^^^    ^  ^^^^^^^^    ^  └─
```

- **S（Start）**：SDA在SCL为高时拉低
- **P（Stop）**：SDA在SCL为高时拉高
- **ACK**：接收方拉低SDA表示确认

### I2C速率模式

| 模式 | 速率 | 应用 |
|------|------|------|
| 标准模式 | 100 kHz | 一般传感器 |
| 快速模式 | 400 kHz | IMU、编码器 |
| 快速+模式 | 1 MHz | 高速外设 |
| 高速模式 | 3.4 MHz | 特殊应用 |

### 上拉电阻选择

$$
R_{pull-up} = \frac{V_{CC}}{I_{sink}} \approx \frac{V_{CC}}{3mA} \approx 1.1k\Omega \sim 10k\Omega
$$

- 速率越高，上拉电阻越小（充电更快）
- 典型值：100kHz用4.7kΩ，400kHz用2.2kΩ

### 时钟拉伸（Clock Stretching）

从设备可以通过拉低SCL来暂停通信（"请等一下，我还没准备好"）。主设备必须检测并等待SCL释放。

!!! tip "I2C调试技巧"
    使用I2C扫描程序可以检测总线上所有设备的地址，快速定位连接问题。

### I2C代码示例

```python
# MicroPython I2C 示例：读取MPU6050
from machine import I2C, Pin
import struct

i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400000)

# 扫描总线
devices = i2c.scan()
print(f"发现设备: {[hex(d) for d in devices]}")

MPU6050_ADDR = 0x68

# 唤醒MPU6050（写PWR_MGMT_1寄存器）
i2c.writeto_mem(MPU6050_ADDR, 0x6B, bytes([0x00]))

def read_accel():
    # 读取6字节加速度数据（X/Y/Z各2字节）
    data = i2c.readfrom_mem(MPU6050_ADDR, 0x3B, 6)
    ax, ay, az = struct.unpack('>hhh', data)
    # 转换为g（±2g量程，灵敏度16384 LSB/g）
    return ax/16384.0, ay/16384.0, az/16384.0

ax, ay, az = read_accel()
print(f"加速度: X={ax:.2f}g, Y={ay:.2f}g, Z={az:.2f}g")
```

## SPI（串行外设接口）

### 基本原理

SPI（Serial Peripheral Interface）由Motorola开发，高速同步全双工通信：

- **SCK**：时钟（主设备产生）
- **MOSI**：主出从入（Master Out Slave In）
- **MISO**：主入从出（Master In Slave Out）
- **CS/SS**：片选（每个从设备一根，低有效）

### 总线结构

```
         SCK  ──→ ┌──────┐  ┌──────┐  ┌──────┐
         MOSI ──→ │Slave1│  │Slave2│  │Slave3│
         MISO ←── │(IMU) │  │(Flash)│ │(显示) │
         CS1  ──→ └──────┘  └──────┘  └──────┘
         CS2  ──────────────→ ↑
         CS3  ──────────────────────→ ↑
```

### SPI模式

SPI有4种时钟模式，由CPOL和CPHA决定：

| 模式 | CPOL | CPHA | 说明 |
|------|------|------|------|
| Mode 0 | 0 | 0 | 空闲低电平，上升沿采样 |
| Mode 1 | 0 | 1 | 空闲低电平，下降沿采样 |
| Mode 2 | 1 | 0 | 空闲高电平，下降沿采样 |
| Mode 3 | 1 | 1 | 空闲高电平，上升沿采样 |

!!! note "最常用模式"
    Mode 0和Mode 3最常用。查看外设数据手册确定正确模式。

### SPI特点

| 特性 | 值 |
|------|-----|
| 速率 | 通常1-50MHz，最高可达100MHz+ |
| 全双工 | 是（MOSI和MISO同时传输） |
| 主从 | 一个主设备，多个从设备 |
| 地址 | 无地址机制，靠CS片选 |
| 开销 | 无起始/停止/应答位 |

### SPI代码示例

```cpp
// Arduino SPI 读取ICM-42688 IMU
#include <SPI.h>

#define IMU_CS 10
#define SPI_SPEED 8000000  // 8MHz

void setup() {
    Serial.begin(115200);
    SPI.begin();
    pinMode(IMU_CS, OUTPUT);
    digitalWrite(IMU_CS, HIGH);
    
    // 读取WHO_AM_I寄存器验证连接
    uint8_t whoami = spiRead(0x75);
    Serial.print("WHO_AM_I: 0x");
    Serial.println(whoami, HEX);  // 应返回0x47
}

uint8_t spiRead(uint8_t reg) {
    uint8_t val;
    digitalWrite(IMU_CS, LOW);
    SPI.beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
    SPI.transfer(reg | 0x80);  // 最高位=1表示读
    val = SPI.transfer(0x00);  // 发送dummy byte，接收数据
    SPI.endTransaction();
    digitalWrite(IMU_CS, HIGH);
    return val;
}

void spiWrite(uint8_t reg, uint8_t data) {
    digitalWrite(IMU_CS, LOW);
    SPI.beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
    SPI.transfer(reg & 0x7F);  // 最高位=0表示写
    SPI.transfer(data);
    SPI.endTransaction();
    digitalWrite(IMU_CS, HIGH);
}
```

## 三种协议对比

| 特性 | UART | I2C | SPI |
|------|------|-----|-----|
| 线数 | 2 (TX/RX) | 2 (SDA/SCL) | 4+ (SCK/MOSI/MISO/CS) |
| 时钟 | 无（异步） | 有（同步） | 有（同步） |
| 速率 | <2Mbps | <3.4MHz | <100MHz |
| 双工 | 全双工 | 半双工 | 全双工 |
| 设备数 | 2（点对点） | 128（7位地址） | 受CS引脚限制 |
| 距离 | 中（可转RS-485延长） | 短（<1m） | 短（<1m） |
| 复杂度 | 低 | 中 | 低 |
| 功耗 | 低 | 低（上拉电阻） | 中 |

## 机器人中的典型分配

| 外设 | 推荐总线 | 原因 |
|------|---------|------|
| IMU（MPU6050/ICM42688） | I2C / SPI | I2C简单，SPI更快 |
| 磁编码器（AS5600） | I2C | 低速足够 |
| OLED显示屏 | I2C / SPI | I2C省线，SPI刷新快 |
| GPS模块 | UART | NMEA协议基于串口 |
| 总线舵机 | UART (TTL/RS-485) | 标准接口 |
| 激光雷达 | UART / USB | 数据量大用USB |
| Flash存储 | SPI | 高速读写 |
| ADC（模数转换） | SPI | 高速采样 |
| 气压计/温湿度 | I2C | 低速传感器 |

## 小结

- UART是最简单的异步通信，适合板间点对点连接
- I2C两线制多设备挂载，适合低速传感器和显示屏
- SPI高速全双工，适合IMU、Flash等需要快速数据传输的外设
- RS-485是UART的工业级延伸，差分信号抗干扰、传输远
- 实际机器人项目中三种协议通常并存，各司其职
