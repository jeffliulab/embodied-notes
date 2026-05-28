# WiFi与蓝牙

## 概述

WiFi和蓝牙是机器人最常用的无线通信方式。WiFi提供高带宽，适合图像传输和ROS2通信；BLE提供低功耗，适合遥控和状态监控；ESP-NOW提供低延迟的点对点通信。

## ESP32 WiFi

### WiFi模式

ESP32支持三种WiFi工作模式：

| 模式 | 说明 | 应用 |
|------|------|------|
| Station（STA） | 连接到路由器 | 机器人接入家庭/实验室网络 |
| Access Point（AP） | 自身作为热点 | 机器人自建WiFi，手机直连 |
| STA+AP | 同时两种模式 | 桥接/中继 |

### Station模式

```cpp
// ESP32 Station模式连接WiFi
#include <WiFi.h>

const char* ssid = "RobotLab_5G";
const char* password = "password123";

void setup() {
    Serial.begin(115200);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    
    Serial.print("连接WiFi中");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.print("IP地址: ");
    Serial.println(WiFi.localIP());
    Serial.print("信号强度: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
}
```

### AP模式

```cpp
// ESP32 作为WiFi热点
#include <WiFi.h>

const char* ap_ssid = "MyRobot";
const char* ap_password = "robot123";

void setup() {
    Serial.begin(115200);
    
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password, 1, 0, 4);  // 信道1, 不隐藏, 最多4连接
    
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());  // 默认192.168.4.1
}
```

### WiFi参数

| 参数 | 2.4GHz | 5GHz |
|------|--------|------|
| 频段 | 2.400-2.4835 GHz | 5.150-5.825 GHz |
| 信道数 | 13 (中国) | 较多 |
| 穿墙能力 | 强 | 弱 |
| 干扰 | 严重（微波炉、蓝牙） | 较少 |
| 带宽 | 72-150 Mbps (WiFi 4) | 433-866 Mbps (WiFi 5) |
| 延迟 | 1-10ms（典型） | 1-5ms |

!!! note "ESP32 WiFi限制"
    ESP32仅支持2.4GHz WiFi。ESP32-S3同样如此。需要5GHz需使用外部WiFi模块或更高级的SoC。

### WiFi UDP通信示例

```cpp
// ESP32 UDP 发送传感器数据
#include <WiFi.h>
#include <WiFiUdp.h>

WiFiUDP udp;
const char* targetIP = "192.168.1.100";  // PC地址
const int targetPort = 8888;

void setup() {
    WiFi.begin("RobotLab", "password");
    while (WiFi.status() != WL_CONNECTED) delay(100);
    udp.begin(8889);  // 本地端口
}

void loop() {
    // 发送IMU数据
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

### 概述

ESP-NOW是Espressif开发的低延迟、无连接的点对点通信协议：

| 特性 | 值 |
|------|-----|
| 延迟 | <5ms（典型1-2ms） |
| 速率 | 1 Mbps |
| 距离 | ~200m（室外空旷） |
| 设备数 | 最多20个对端 |
| 加密 | 支持（CCMP） |
| 需要路由器 | 不需要 |

### 优势

- **无需WiFi网络**：两个ESP32即可直接通信
- **极低延迟**：无需TCP/IP协议栈开销
- **快速配对**：通过MAC地址识别对端
- **可与WiFi共存**：ESP-NOW和WiFi STA模式可同时使用

### 代码示例

**发送端（遥控器）**：

```cpp
#include <esp_now.h>
#include <WiFi.h>

// 接收端MAC地址
uint8_t peerMAC[] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};

// 控制数据结构
typedef struct {
    int16_t joystick_x;   // -512 ~ 512
    int16_t joystick_y;
    uint8_t button_a;
    uint8_t button_b;
} ControlData;

ControlData ctrl;

void onSent(const uint8_t *mac, esp_now_send_status_t status) {
    // 发送回调（可选）
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

**接收端（机器人）**：

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
        // 控制电机...
    }
}
```

## BLE（低功耗蓝牙）

### BLE 5.0特性

| 特性 | BLE 4.2 | BLE 5.0 |
|------|---------|---------|
| 速率 | 1 Mbps | 2 Mbps |
| 距离 | ~50m | ~200m（远程模式） |
| 广播数据量 | 31字节 | 255字节 |
| 功耗 | 极低 | 更低 |

### GATT协议栈

BLE通信基于GATT（Generic Attribute Profile）模型：

```
                    GATT Server (机器人)
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

**核心概念**：

| 概念 | 说明 |
|------|------|
| Server | 提供数据的设备（通常是机器人） |
| Client | 读写数据的设备（通常是手机/PC） |
| Service | 功能组（如"电机控制"） |
| Characteristic | 具体数据项（如"目标速度"） |
| Descriptor | 特征的描述信息 |
| Properties | Read/Write/Notify/Indicate |

### ESP32 BLE Server示例

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
            Serial.printf("收到速度指令: %d\n", speed);
            // 控制电机...
        }
    }
};

void setup() {
    Serial.begin(115200);
    
    BLEDevice::init("MyRobot");
    BLEServer *pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService *pService = pServer->createService(SERVICE_UUID);
    
    // 命令特征（手机写入）
    BLECharacteristic *pCmdChar = pService->createCharacteristic(
        CHAR_COMMAND_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCmdChar->setCallbacks(new CommandCallback());
    
    // 状态特征（机器人通知）
    pStatusChar = pService->createCharacteristic(
        CHAR_STATUS_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pStatusChar->addDescriptor(new BLE2902());
    
    pService->start();
    BLEAdvertising *pAdv = BLEDevice::getAdvertising();
    pAdv->addServiceUUID(SERVICE_UUID);
    pAdv->start();
    
    Serial.println("BLE已启动，等待连接...");
}

void loop() {
    if (deviceConnected) {
        // 发送电池电压
        float voltage = analogRead(34) * 3.3 / 4095 * 2;  // 分压
        uint16_t mv = (uint16_t)(voltage * 1000);
        pStatusChar->setValue((uint8_t*)&mv, 2);
        pStatusChar->notify();
    }
    delay(1000);
}
```

## ROS2 DDS over WiFi

### DDS QoS配置

ROS2使用DDS（Data Distribution Service）进行话题通信。WiFi环境下需要注意QoS配置：

| QoS策略 | 实时控制 | 传感器数据 | 配置参数 |
|---------|---------|-----------|---------|
| Reliability | BEST_EFFORT | BEST_EFFORT | 丢包可接受 |
| Durability | VOLATILE | VOLATILE | 不保存历史 |
| History | KEEP_LAST(1) | KEEP_LAST(5) | 保留最新 |
| Deadline | 10ms | 100ms | 超时检测 |

```python
# ROS2 Python QoS配置
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# 实时控制话题QoS
realtime_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=1
)

# 创建发布者
self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', realtime_qos)
```

### WiFi环境常见问题

| 问题 | 原因 | 对策 |
|------|------|------|
| 延迟波动 | WiFi信道竞争 | 用5GHz频段，减少设备 |
| 丢包 | 信号弱/干扰 | 使用BEST_EFFORT QoS |
| DDS发现慢 | 多播不可靠 | 配置SIMPLE Discovery peers |
| 带宽不足 | 图像数据大 | 压缩传输、降低帧率 |

### WiFi优化建议

1. **使用5GHz频段**：干扰少、带宽大
2. **固定IP地址**：避免DHCP延迟
3. **独立路由器**：机器人网络与办公网络分离
4. **减小MTU**：降低单包丢失影响
5. **关闭电源管理**：`iwconfig wlan0 power off`

## WiFi 6（802.11ax）

### 机器人相关新特性

| 特性 | 说明 | 机器人价值 |
|------|------|-----------|
| OFDMA | 正交频分多址 | 多设备同时通信，降低延迟 |
| MU-MIMO | 多用户多输入多输出 | 多机器人同时传输 |
| TWT | 目标唤醒时间 | 低功耗设备省电 |
| BSS Coloring | 基本服务集着色 | 密集环境减少干扰 |
| 速率 | 1.2-9.6 Gbps | 高带宽传感器流 |

## Mesh网络

### 概述

Mesh（网状）网络允许多个节点互相转发数据，扩大覆盖范围：

```
    机器人A ←──→ 机器人B ←──→ 机器人C
       ↑              ↑
       └──────────────┘
            自动路由
```

### ESP-MESH

ESP-IDF提供的Mesh方案：

- 最多1000个节点
- 自动组网和路由
- 树形拓扑，根节点连接WiFi
- 适合多机器人协作场景

## 通信方式对比

| 方式 | 带宽 | 延迟 | 功耗 | 距离 | 适用场景 |
|------|------|------|------|------|---------|
| WiFi STA | 高 | 1-10ms | 高 | 50m | 图像传输、ROS2 |
| ESP-NOW | 1Mbps | 1-2ms | 低 | 200m | 遥控、低延迟控制 |
| BLE | 2Mbps | 10-30ms | 极低 | 100m | 手机遥控、状态监控 |
| WiFi 6 | 极高 | <1ms | 中高 | 50m | 高带宽实时场景 |
| Mesh | 中 | 变化 | 中 | 扩展 | 多机器人协作 |

## 小结

- ESP32 WiFi支持STA/AP/双模，是机器人无线通信的基础
- ESP-NOW提供无需路由器的低延迟点对点通信，适合遥控
- BLE 5.0功耗极低，GATT模型适合手机APP控制机器人
- ROS2 DDS over WiFi需要合理配置QoS避免延迟和丢包
- WiFi 6的OFDMA和MU-MIMO特性有望改善多机器人场景
- 实际项目中常根据需求组合使用多种无线方式
