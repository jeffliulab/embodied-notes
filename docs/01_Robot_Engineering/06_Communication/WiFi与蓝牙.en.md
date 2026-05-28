# WiFi and Bluetooth

## Introduction

WiFi and Bluetooth are the most commonly used wireless communication methods for robots. WiFi provides high bandwidth, suitable for image transmission and ROS2 communication; BLE offers low power consumption, suitable for remote control and status monitoring; ESP-NOW provides low-latency point-to-point communication.

## ESP32 WiFi

### WiFi Modes

The ESP32 supports three WiFi operating modes:

| Mode | Description | Application |
|------|-------------|-------------|
| Station (STA) | Connects to a router | Robot joins home/lab network |
| Access Point (AP) | Acts as a hotspot | Robot creates its own WiFi, phone connects directly |
| STA+AP | Both modes simultaneously | Bridging/relay |

### Station Mode

```cpp
// ESP32 Station mode WiFi connection
#include <WiFi.h>

const char* ssid = "RobotLab_5G";
const char* password = "password123";

void setup() {
    Serial.begin(115200);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
}
```

### AP Mode

```cpp
// ESP32 as WiFi hotspot
#include <WiFi.h>

const char* ap_ssid = "MyRobot";
const char* ap_password = "robot123";

void setup() {
    Serial.begin(115200);
    
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password, 1, 0, 4);  // Channel 1, not hidden, max 4 connections
    
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());  // Default 192.168.4.1
}
```

### WiFi Parameters

| Parameter | 2.4 GHz | 5 GHz |
|-----------|---------|-------|
| Frequency band | 2.400–2.4835 GHz | 5.150–5.825 GHz |
| Channels | 13 (China) | More |
| Wall penetration | Strong | Weak |
| Interference | Severe (microwave ovens, Bluetooth) | Less |
| Bandwidth | 72–150 Mbps (WiFi 4) | 433–866 Mbps (WiFi 5) |
| Latency | 1–10 ms (typical) | 1–5 ms |

!!! note "ESP32 WiFi Limitation"
    The ESP32 only supports 2.4 GHz WiFi. The ESP32-S3 has the same limitation. 5 GHz requires an external WiFi module or a more advanced SoC.

### WiFi UDP Communication Example

```cpp
// ESP32 UDP sending sensor data
#include <WiFi.h>
#include <WiFiUdp.h>

WiFiUDP udp;
const char* targetIP = "192.168.1.100";  // PC address
const int targetPort = 8888;

void setup() {
    WiFi.begin("RobotLab", "password");
    while (WiFi.status() != WL_CONNECTED) delay(100);
    udp.begin(8889);  // Local port
}

void loop() {
    // Send IMU data
    float ax = 0.1, ay = -0.05, az = 9.8;
    float gx = 0.01, gy = -0.02, gz = 0.005;
    
    uint8_t buf[24];
    memcpy(buf, &ax, 4);
    memcpy(buf+4, &ay, 4);
    memcpy(buf+8, &az, 4);
    memcpy(buf+12, &gx, 4);
    memcpy(buf+16, &gy, 4);
    memcpy(buf+20, &gz, 4);
    
    udp.beginPacket(targetIP, targetPort);
    udp.write(buf, 24);
    udp.endPacket();
    
    delay(10);  // 100Hz
}
```

## ESP-NOW

### Overview

ESP-NOW is a low-latency, connectionless point-to-point communication protocol developed by Espressif:

| Feature | Value |
|---------|-------|
| Latency | <5 ms (typical 1–2 ms) |
| Speed | 1 Mbps |
| Range | ~200 m (outdoor, open area) |
| Devices | Up to 20 peers |
| Encryption | Supported (CCMP) |
| Router required | No |

### Advantages

- **No WiFi network needed**: Two ESP32s can communicate directly
- **Extremely low latency**: No TCP/IP protocol stack overhead
- **Fast pairing**: Peers identified by MAC address
- **Coexists with WiFi**: ESP-NOW and WiFi STA mode can operate simultaneously

### Code Example

**Sender (Remote Controller)**:

```cpp
#include <esp_now.h>
#include <WiFi.h>

// Receiver MAC address
uint8_t peerMAC[] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};

// Control data structure
typedef struct {
    int16_t joystick_x;   // -512 ~ 512
    int16_t joystick_y;
    uint8_t button_a;
    uint8_t button_b;
} ControlData;

ControlData ctrl;

void onSent(const uint8_t *mac, esp_now_send_status_t status) {
    // Send callback (optional)
}

void setup() {
    WiFi.mode(WIFI_STA);
    esp_now_init();
    esp_now_register_send_cb(onSent);
    
    esp_now_peer_info_t peer;
    memcpy(peer.peer_addr, peerMAC, 6);
    peer.channel = 0;
    peer.encrypt = false;
    esp_now_add_peer(&peer);
}

void loop() {
    ctrl.joystick_x = analogRead(34) - 2048;
    ctrl.joystick_y = analogRead(35) - 2048;
    ctrl.button_a = digitalRead(12);
    ctrl.button_b = digitalRead(13);
    
    esp_now_send(peerMAC, (uint8_t*)&ctrl, sizeof(ctrl));
    delay(20);  // 50Hz
}
```

**Receiver (Robot)**:

```cpp
#include <esp_now.h>
#include <WiFi.h>

typedef struct {
    int16_t joystick_x;
    int16_t joystick_y;
    uint8_t button_a;
    uint8_t button_b;
} ControlData;

ControlData ctrl;
volatile bool newData = false;

void onReceive(const uint8_t *mac, const uint8_t *data, int len) {
    memcpy(&ctrl, data, sizeof(ctrl));
    newData = true;
}

void setup() {
    Serial.begin(115200);
    WiFi.mode(WIFI_STA);
    esp_now_init();
    esp_now_register_recv_cb(onReceive);
}

void loop() {
    if (newData) {
        newData = false;
        Serial.printf("X=%d Y=%d A=%d B=%d\n",
            ctrl.joystick_x, ctrl.joystick_y,
            ctrl.button_a, ctrl.button_b);
        // Control motors...
    }
}
```

## BLE (Bluetooth Low Energy)

### BLE 5.0 Features

| Feature | BLE 4.2 | BLE 5.0 |
|---------|---------|---------|
| Speed | 1 Mbps | 2 Mbps |
| Range | ~50 m | ~200 m (long-range mode) |
| Broadcast data | 31 bytes | 255 bytes |
| Power consumption | Very low | Even lower |

### GATT Protocol Stack

BLE communication is based on the GATT (Generic Attribute Profile) model:

```
                    GATT Server (Robot)
                    ┌─────────────────────┐
                    │ Service: Robot Control│
                    │ UUID: 0x1234         │
                    │ ┌─────────────────┐  │
                    │ │ Characteristic:  │  │
                    │ │ Speed Command    │  │
                    │ │ UUID: 0x1235     │  │
                    │ │ Properties: Write│  │
                    │ └─────────────────┘  │
                    │ ┌─────────────────┐  │
                    │ │ Characteristic:  │  │
                    │ │ Battery Level    │  │
                    │ │ UUID: 0x1236     │  │
                    │ │ Properties: Read,│  │
                    │ │            Notify│  │
                    │ └─────────────────┘  │
                    └─────────────────────┘
```

**Core Concepts**:

| Concept | Description |
|---------|-------------|
| Server | Device providing data (typically the robot) |
| Client | Device reading/writing data (typically phone/PC) |
| Service | Functional group (e.g., "Motor Control") |
| Characteristic | Specific data item (e.g., "Target Speed") |
| Descriptor | Description information for a characteristic |
| Properties | Read / Write / Notify / Indicate |

### ESP32 BLE Server Example

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>

#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHAR_COMMAND_UUID   "12345678-1234-1234-1234-123456789abd"
#define CHAR_STATUS_UUID    "12345678-1234-1234-1234-123456789abe"

BLECharacteristic *pStatusChar;
bool deviceConnected = false;

class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) { deviceConnected = true; }
    void onDisconnect(BLEServer* pServer) { deviceConnected = false; }
};

class CommandCallback : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pChar) {
        std::string value = pChar->getValue();
        if (value.length() >= 2) {
            int16_t speed = (value[1] << 8) | value[0];
            Serial.printf("Speed command received: %d\n", speed);
            // Control motors...
        }
    }
};

void setup() {
    Serial.begin(115200);
    
    BLEDevice::init("MyRobot");
    BLEServer *pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService *pService = pServer->createService(SERVICE_UUID);
    
    // Command characteristic (phone writes)
    BLECharacteristic *pCmdChar = pService->createCharacteristic(
        CHAR_COMMAND_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCmdChar->setCallbacks(new CommandCallback());
    
    // Status characteristic (robot notifies)
    pStatusChar = pService->createCharacteristic(
        CHAR_STATUS_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pStatusChar->addDescriptor(new BLE2902());
    
    pService->start();
    BLEAdvertising *pAdv = BLEDevice::getAdvertising();
    pAdv->addServiceUUID(SERVICE_UUID);
    pAdv->start();
    
    Serial.println("BLE started, waiting for connection...");
}

void loop() {
    if (deviceConnected) {
        // Send battery voltage
        float voltage = analogRead(34) * 3.3 / 4095 * 2;  // Voltage divider
        uint16_t mv = (uint16_t)(voltage * 1000);
        pStatusChar->setValue((uint8_t*)&mv, 2);
        pStatusChar->notify();
    }
    delay(1000);
}
```

## ROS2 DDS over WiFi

### DDS QoS Configuration

ROS2 uses DDS (Data Distribution Service) for topic communication. WiFi environments require careful QoS configuration:

| QoS Policy | Real-Time Control | Sensor Data | Configuration |
|------------|------------------|-------------|---------------|
| Reliability | BEST_EFFORT | BEST_EFFORT | Packet loss acceptable |
| Durability | VOLATILE | VOLATILE | No history retention |
| History | KEEP_LAST(1) | KEEP_LAST(5) | Keep latest |
| Deadline | 10 ms | 100 ms | Timeout detection |

```python
# ROS2 Python QoS configuration
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# Real-time control topic QoS
realtime_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=1
)

# Create publisher
self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', realtime_qos)
```

### Common WiFi Environment Issues

| Issue | Cause | Countermeasure |
|-------|-------|---------------|
| Latency fluctuation | WiFi channel contention | Use 5 GHz band, reduce devices |
| Packet loss | Weak signal / interference | Use BEST_EFFORT QoS |
| Slow DDS discovery | Unreliable multicast | Configure SIMPLE Discovery peers |
| Insufficient bandwidth | Large image data | Compressed transmission, reduce frame rate |

### WiFi Optimization Tips

1. **Use the 5 GHz band**: Less interference, more bandwidth
2. **Fixed IP addresses**: Avoid DHCP delays
3. **Dedicated router**: Separate robot network from office network
4. **Reduce MTU**: Lower the impact of single-packet loss
5. **Disable power management**: `iwconfig wlan0 power off`

## WiFi 6 (802.11ax)

### Robot-Relevant New Features

| Feature | Description | Value for Robotics |
|---------|-------------|-------------------|
| OFDMA | Orthogonal Frequency Division Multiple Access | Multi-device simultaneous communication, reduced latency |
| MU-MIMO | Multi-User Multiple-Input Multiple-Output | Multiple robots transmitting simultaneously |
| TWT | Target Wake Time | Power savings for low-power devices |
| BSS Coloring | Basic Service Set Coloring | Reduced interference in dense environments |
| Speed | 1.2–9.6 Gbps | High-bandwidth sensor streams |

## Mesh Networks

### Overview

Mesh networks allow multiple nodes to relay data for each other, extending coverage range:

```
    Robot A ←──→ Robot B ←──→ Robot C
       ↑              ↑
       └──────────────┘
            Auto-routing
```

### ESP-MESH

A mesh solution provided by ESP-IDF:

- Up to 1000 nodes
- Automatic network formation and routing
- Tree topology, root node connects to WiFi
- Suitable for multi-robot collaboration scenarios

## Communication Method Comparison

| Method | Bandwidth | Latency | Power | Range | Suitable Scenario |
|--------|-----------|---------|-------|-------|------------------|
| WiFi STA | High | 1–10 ms | High | 50 m | Image transmission, ROS2 |
| ESP-NOW | 1 Mbps | 1–2 ms | Low | 200 m | Remote control, low-latency control |
| BLE | 2 Mbps | 10–30 ms | Very low | 100 m | Phone remote control, status monitoring |
| WiFi 6 | Very high | <1 ms | Medium-high | 50 m | High-bandwidth real-time scenarios |
| Mesh | Medium | Varies | Medium | Extended | Multi-robot collaboration |

## Summary

- ESP32 WiFi supports STA/AP/dual mode, forming the foundation for robot wireless communication
- ESP-NOW provides router-free low-latency point-to-point communication, ideal for remote control
- BLE 5.0 offers extremely low power consumption; the GATT model is well-suited for phone app robot control
- ROS2 DDS over WiFi requires proper QoS configuration to avoid latency and packet loss
- WiFi 6's OFDMA and MU-MIMO features are expected to improve multi-robot scenarios
- Practical projects often combine multiple wireless methods based on specific requirements
