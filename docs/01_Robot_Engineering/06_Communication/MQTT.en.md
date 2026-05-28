# MQTT — IoT Mainstream Pub/Sub Protocol

> *MQTT (Message Queuing Telemetry Transport) invented 1999 by IBM, OASIS standardized 2014. Pub-sub model (not client-server). Lightweight (headers ~ 2 bytes minimum), low bandwidth, long-lived TCP, 3 QoS levels. Mainstay for IoT, remote devices, IoV, HMI. AWS IoT, Azure IoT Hub, HiveMQ all based on MQTT.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: TCP, sub/pub concepts

---

## 1. Architecture (Pub-Sub)

```
Publisher ──┐
            ├──> Broker ──> Subscriber(s)
Publisher ──┘
```

- **Publisher**: posts to topic
- **Subscriber**: subscribes to topic
- **Broker**: relay (required)
- Pub doesn't know Sub, Sub doesn't know Pub

---

## 2. Topic Hierarchy

```
home/livingroom/temperature
home/bedroom/temperature
factory/line1/sensor/42/temp

Wildcards:
+ : single-level (home/+/temperature)
# : multi-level (home/#)
```

---

## 3. QoS (Quality of Service)

| Level | Meaning | Use case |
|---|---|---|
| 0 | At most once (fire & forget) | High-rate sensor (loss ok) |
| 1 | At least once (ACK) | Important data (dupe ok) |
| 2 | Exactly once (4-way handshake) | Strictly unique (rare) |

Higher QoS → more delay + overhead.

---

## 4. Packet Types

| Type | Purpose |
|---|---|
| CONNECT / CONNACK | Connect |
| PUBLISH | Message |
| PUBACK / PUBREC / PUBREL / PUBCOMP | QoS 1/2 ACK |
| SUBSCRIBE / SUBACK | Subscribe |
| UNSUBSCRIBE / UNSUBACK | Unsubscribe |
| PINGREQ / PINGRESP | Heartbeat |
| DISCONNECT | Disconnect |

---

## 5. Last Will & Testament (LWT)

- At connect, declare "if I disconnect, broker post this"
- Topic + payload (typical: `status: offline`)
- Sub knows device is down immediately

---

## 6. Retained Message

- Messages marked retained are kept by broker
- New sub immediately receives last retained (quick state init)

---

## 7. Python — paho-mqtt

```python
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc):
    print("Connected:", rc)
    client.subscribe("home/+/temperature", qos=1)

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set("user", "pass")
client.will_set("status/device01", "offline", qos=1, retain=True)
client.connect("broker.hivemq.com", 1883, keepalive=60)
client.loop_forever()
```

---

## 8. vs. Other Protocols

| Protocol | Model | Typical use |
|---|---|---|
| MQTT | Pub-Sub | IoT, telemetry |
| HTTP/REST | Req-Resp | Web API |
| WebSocket | Full-duplex | Real-time web |
| CoAP | UDP REST | Ultra low-power IoT |
| AMQP | Queue | Enterprise messaging |

---

## 9. Brokers

- **Mosquitto** (Eclipse, open, lightweight)
- **HiveMQ** (commercial + open, scale)
- **EMQX** (high concurrency, China)
- **NATS** (similar but not MQTT)
- **VerneMQ** (cluster)
- **AWS IoT Core**, **Azure IoT Hub** (managed cloud)

---

## 10. MQTT 5 Improvements (2019)

- User properties (custom headers)
- Reason codes (detailed errors)
- Shared subscriptions
- Topic alias (bandwidth saving)
- Message expiry
- Not backwards compatible with v3

---

## 11. Common Pitfalls

### 11.1 QoS 2 Performance

4-way handshake, careful at high rate.

### 11.2 Too Many Topics

Broker scales ∝ topic count; design hierarchically.

### 11.3 No Built-in Security

MQTT itself has no auth/encryption; rely on TLS + username/password / cert.

### 11.4 Broker Single Point

Cluster brokers (EMQX, HiveMQ) or multi-region.

### 11.5 Persistence

Default not persistent; need file/DB backend (Mosquitto persistence).

---

## 12. Related Concepts

- **Same section**: [USB](USB.en.md), [Modbus](Modbus.en.md)
- **Embedded**: [ESP32](../03_Embedded_Systems/ARM_Cortex_M.en.md)

---

## References

1. **Stanford-Clark, A. & Truong, H. L.** "MQTT for sensor networks (MQTT-SN)." *IBM*, 2008.
2. **OASIS** *MQTT v5.0 Specification*. 2019.
3. **Banks, A. & Gupta, R.** *MQTT v3.1.1 Specification*. OASIS, 2014.
4. **HiveMQ** "MQTT Essentials" — https://www.hivemq.com/mqtt-essentials/
