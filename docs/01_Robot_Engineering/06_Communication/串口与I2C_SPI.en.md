# UART and I2C/SPI

## Introduction

UART (serial port), I2C, and SPI are the three most fundamental communication protocols in embedded systems, used in virtually all robots. Each is suited to different scenarios: UART for point-to-point inter-board communication, I2C for low-speed multi-device connections, and SPI for high-speed peripheral read/write operations.

## UART (Universal Asynchronous Receiver/Transmitter)

### Basic Principle

UART is the simplest serial communication protocol:

- **Asynchronous**: No clock line; both sides agree on the same baud rate
- **Full-duplex**: TX and RX are independent, enabling simultaneous send and receive
- **Point-to-point**: Standard UART connects only two devices

### Frame Format

```
Idle (HIGH) ─┐  ┌─────────────────┐  ┌──┐  ┌─ Idle (HIGH)
             └──┤ D0 D1 ... D7    ├──┤P ├──┤
          Start bit  Data bits (8-bit)  Parity  Stop bit
           (LOW)                      (optional) (HIGH)
```

| Parameter | Description |
|-----------|-------------|
| Start bit | 1 bit, fixed LOW |
| Data bits | Typically 8 bits (also 5/6/7/9) |
| Parity bit | None / odd / even (optional) |
| Stop bit | 1 or 2 bits, fixed HIGH |

### Baud Rate

Common baud rates:

| Baud Rate | Byte Rate | Typical Application |
|-----------|-----------|-------------------|
| 9600 | 960 B/s | GPS (NMEA) |
| 115200 | 11.5 KB/s | Debug serial, general purpose |
| 256000 | 25.6 KB/s | Fast data transfer |
| 1000000 | 100 KB/s | Bus servos (Feetech STS) |
| 2000000 | 200 KB/s | LiDAR |

!!! warning "Baud Rate Matching"
    Both transmitter and receiver baud rates must match, with error not exceeding 3–5%; otherwise data will be garbled. Crystal oscillator precision is important.

### Signal Level Standards

| Standard | Level | Distance | Application |
|----------|-------|----------|-------------|
| TTL | 0V/3.3V or 0V/5V | <1 m | Direct MCU-to-MCU |
| RS-232 | ±3–15V | <15 m | PC serial port (DB9) |
| RS-485 | Differential ±1.5V | <1200 m | Industrial equipment, Dynamixel |

### RS-485 Details

RS-485 uses differential signaling for strong noise immunity:

```
     A line ───────────────────────
            Differential signal              
     B line ───────────────────────
     
     Logic 1: A > B (A-B > +200mV)
     Logic 0: A < B (A-B < -200mV)
```

Features:

- Half-duplex (two wires) or full-duplex (four wires)
- Multi-drop communication: up to 32/128/256 nodes on one bus
- Long transmission distance: 1200 m @ 100 kbps
- Requires termination resistors (120 ohm)

### Arduino/ESP32 UART Code

```cpp
// ESP32 dual serial port example
// Serial  - USB debug
// Serial1 - Connected to GPS
// Serial2 - Connected to LiDAR

void setup() {
    Serial.begin(115200);                          // USB debug
    Serial1.begin(9600, SERIAL_8N1, 16, 17);       // GPS: RX=16, TX=17
    Serial2.begin(230400, SERIAL_8N1, 18, 19);     // LiDAR: RX=18, TX=19
}

void loop() {
    // Read GPS data
    while (Serial1.available()) {
        char c = Serial1.read();
        if (c == '$') {
            String nmea = Serial1.readStringUntil('\n');
            Serial.println("GPS: " + nmea);
        }
    }
    
    // Read LiDAR data packet
    if (Serial2.available() >= 47) {  // Full packet length
        uint8_t header = Serial2.read();
        if (header == 0x54) {
            // Parse data packet...
        }
    }
}
```

## I2C (Inter-Integrated Circuit Bus)

### Basic Principle

I2C was developed by Philips as a two-wire synchronous serial bus:

- **SDA (Serial Data)**: Data line
- **SCL (Serial Clock)**: Clock line
- **Open-drain output**: Requires external pull-up resistors

### Bus Structure

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

### Address Mechanism

- **7-bit address**: Theoretically 128 devices, ~112 usable in practice
- **10-bit address**: Extended mode, rarely used
- Each device has a fixed or configurable address

Common device addresses:

| Device | Address |
|--------|---------|
| MPU6050 IMU | 0x68 / 0x69 |
| BME280 barometer | 0x76 / 0x77 |
| SSD1306 OLED | 0x3C / 0x3D |
| AS5600 encoder | 0x36 |
| PCA9685 PWM | 0x40–0x7F |
| EEPROM AT24C | 0x50–0x57 |

### Communication Protocol

```
Start  Address(7bit) R/W ACK  Data(8bit) ACK  Data(8bit) ACK  Stop
 S    [A6...A0]      [W] [A] [D7...D0]  [A]  [D7...D0]  [A]   P
 ↓        ↓           ↓   ↓      ↓       ↓      ↓       ↓    ↓
SDA:  ─┐ XXXXXXX      X   X  XXXXXXXX    X  XXXXXXXX    X  ┌─
SCL:  ─┘ ^^^^^^^^      ^   ^  ^^^^^^^^    ^  ^^^^^^^^    ^  └─
```

- **S (Start)**: SDA pulled LOW while SCL is HIGH
- **P (Stop)**: SDA pulled HIGH while SCL is HIGH
- **ACK**: Receiver pulls SDA LOW to acknowledge

### I2C Speed Modes

| Mode | Speed | Application |
|------|-------|-------------|
| Standard mode | 100 kHz | General sensors |
| Fast mode | 400 kHz | IMU, encoders |
| Fast-mode Plus | 1 MHz | High-speed peripherals |
| High-speed mode | 3.4 MHz | Special applications |

### Pull-Up Resistor Selection

$$
R_{pull-up} = \frac{V_{CC}}{I_{sink}} \approx \frac{V_{CC}}{3mA} \approx 1.1k\Omega \sim 10k\Omega
$$

- Higher speed requires lower pull-up resistance (faster charge time)
- Typical values: 4.7 kohm for 100 kHz, 2.2 kohm for 400 kHz

### Clock Stretching

A slave device can hold SCL LOW to pause communication ("please wait, I'm not ready yet"). The master must detect this and wait for SCL to be released.

!!! tip "I2C Debugging Tip"
    Use an I2C scanner program to detect all device addresses on the bus, quickly pinpointing connection issues.

### I2C Code Example

```python
# MicroPython I2C example: reading MPU6050
from machine import I2C, Pin
import struct

i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400000)

# Scan bus
devices = i2c.scan()
print(f"Devices found: {[hex(d) for d in devices]}")

MPU6050_ADDR = 0x68

# Wake up MPU6050 (write PWR_MGMT_1 register)
i2c.writeto_mem(MPU6050_ADDR, 0x6B, bytes([0x00]))

def read_accel():
    # Read 6 bytes of acceleration data (X/Y/Z, 2 bytes each)
    data = i2c.readfrom_mem(MPU6050_ADDR, 0x3B, 6)
    ax, ay, az = struct.unpack('>hhh', data)
    # Convert to g (±2g range, sensitivity 16384 LSB/g)
    return ax/16384.0, ay/16384.0, az/16384.0

ax, ay, az = read_accel()
print(f"Acceleration: X={ax:.2f}g, Y={ay:.2f}g, Z={az:.2f}g")
```

## SPI (Serial Peripheral Interface)

### Basic Principle

SPI was developed by Motorola as a high-speed synchronous full-duplex communication protocol:

- **SCK**: Clock (generated by master)
- **MOSI**: Master Out Slave In
- **MISO**: Master In Slave Out
- **CS/SS**: Chip select (one per slave device, active LOW)

### Bus Structure

```
         SCK  ──→ ┌──────┐  ┌──────┐  ┌──────┐
         MOSI ──→ │Slave1│  │Slave2│  │Slave3│
         MISO ←── │(IMU) │  │(Flash)│ │(Display)│
         CS1  ──→ └──────┘  └──────┘  └──────┘
         CS2  ──────────────→ ↑
         CS3  ──────────────────────→ ↑
```

### SPI Modes

SPI has 4 clock modes determined by CPOL and CPHA:

| Mode | CPOL | CPHA | Description |
|------|------|------|-------------|
| Mode 0 | 0 | 0 | Idle LOW, sample on rising edge |
| Mode 1 | 0 | 1 | Idle LOW, sample on falling edge |
| Mode 2 | 1 | 0 | Idle HIGH, sample on falling edge |
| Mode 3 | 1 | 1 | Idle HIGH, sample on rising edge |

!!! note "Most Common Modes"
    Mode 0 and Mode 3 are the most commonly used. Check the peripheral datasheet for the correct mode.

### SPI Characteristics

| Feature | Value |
|---------|-------|
| Speed | Typically 1–50 MHz, up to 100 MHz+ |
| Full-duplex | Yes (MOSI and MISO transmit simultaneously) |
| Master-slave | One master, multiple slaves |
| Addressing | No address mechanism, uses CS chip select |
| Overhead | No start/stop/acknowledge bits |

### SPI Code Example

```cpp
// Arduino SPI reading ICM-42688 IMU
#include <SPI.h>

#define IMU_CS 10
#define SPI_SPEED 8000000  // 8MHz

void setup() {
    Serial.begin(115200);
    SPI.begin();
    pinMode(IMU_CS, OUTPUT);
    digitalWrite(IMU_CS, HIGH);
    
    // Read WHO_AM_I register to verify connection
    uint8_t whoami = spiRead(0x75);
    Serial.print("WHO_AM_I: 0x");
    Serial.println(whoami, HEX);  // Should return 0x47
}

uint8_t spiRead(uint8_t reg) {
    uint8_t val;
    digitalWrite(IMU_CS, LOW);
    SPI.beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
    SPI.transfer(reg | 0x80);  // MSB=1 indicates read
    val = SPI.transfer(0x00);  // Send dummy byte, receive data
    SPI.endTransaction();
    digitalWrite(IMU_CS, HIGH);
    return val;
}

void spiWrite(uint8_t reg, uint8_t data) {
    digitalWrite(IMU_CS, LOW);
    SPI.beginTransaction(SPISettings(SPI_SPEED, MSBFIRST, SPI_MODE0));
    SPI.transfer(reg & 0x7F);  // MSB=0 indicates write
    SPI.transfer(data);
    SPI.endTransaction();
    digitalWrite(IMU_CS, HIGH);
}
```

## Three-Protocol Comparison

| Feature | UART | I2C | SPI |
|---------|------|-----|-----|
| Wires | 2 (TX/RX) | 2 (SDA/SCL) | 4+ (SCK/MOSI/MISO/CS) |
| Clock | None (async) | Yes (sync) | Yes (sync) |
| Speed | <2 Mbps | <3.4 MHz | <100 MHz |
| Duplex | Full-duplex | Half-duplex | Full-duplex |
| Device count | 2 (point-to-point) | 128 (7-bit address) | Limited by CS pins |
| Distance | Medium (extendable via RS-485) | Short (<1 m) | Short (<1 m) |
| Complexity | Low | Medium | Low |
| Power | Low | Low (pull-up resistors) | Medium |

## Typical Allocation in Robots

| Peripheral | Recommended Bus | Reason |
|------------|----------------|--------|
| IMU (MPU6050/ICM42688) | I2C / SPI | I2C is simpler, SPI is faster |
| Magnetic encoder (AS5600) | I2C | Low speed is sufficient |
| OLED display | I2C / SPI | I2C saves wires, SPI refreshes faster |
| GPS module | UART | NMEA protocol is serial-based |
| Bus servos | UART (TTL/RS-485) | Standard interface |
| LiDAR | UART / USB | USB for high data volume |
| Flash storage | SPI | High-speed read/write |
| ADC (analog-to-digital converter) | SPI | High-speed sampling |
| Barometer / temperature-humidity | I2C | Low-speed sensor |

## Summary

- UART is the simplest asynchronous communication, suitable for point-to-point inter-board connections
- I2C's two-wire multi-device topology is ideal for low-speed sensors and displays
- SPI offers high-speed full-duplex communication, suitable for IMUs, Flash, and other peripherals requiring fast data transfer
- RS-485 is the industrial extension of UART, with differential signaling for noise immunity and long distance
- In practical robot projects, all three protocols typically coexist, each serving its purpose
