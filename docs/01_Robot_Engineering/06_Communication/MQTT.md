# MQTT — IoT 主流发布订阅协议

> *MQTT (Message Queuing Telemetry Transport) 1999 IBM 发明,2014 OASIS 标准化。Publish-Subscribe 模型(非 client-server)。轻量(headers ~ 2 bytes minimum)、低带宽、长连接(TCP)、3 级 QoS。IoT、远程设备、车联网、HMI 主力。AWS IoT、Azure IoT Hub、HiveMQ 都基于 MQTT。*
>
> **难度**:Intermediate
> **前置知识**:TCP、Sub/Pub 概念

---

## 1. 架构 (Pub-Sub)

```
Publisher ──┐
            ├──> Broker ──> Subscriber(s)
Publisher ──┘
```

- **Publisher**: 发到 topic
- **Subscriber**: subscribe topic
- **Broker**: 中转(必需)
- Pub 不知 Sub 是谁,Sub 不知 Pub

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

| Level | 含义 | 用例 |
|---|---|---|
| 0 | At most once (fire & forget) | 高频 sensor(允许丢) |
| 1 | At least once (ACK) | 重要数据(允许重复) |
| 2 | Exactly once (4-way handshake) | 严格唯一(罕用) |

QoS 越高,delay + overhead 越大。

---

## 4. 报文类型

| 类型 | 用途 |
|---|---|
| CONNECT / CONNACK | 建链 |
| PUBLISH | 发消息 |
| PUBACK / PUBREC / PUBREL / PUBCOMP | QoS 1/2 ACK |
| SUBSCRIBE / SUBACK | 订阅 |
| UNSUBSCRIBE / UNSUBACK | 退订 |
| PINGREQ / PINGRESP | 心跳 |
| DISCONNECT | 断开 |

---

## 5. Last Will & Testament (LWT)

- Connect 时声明 "我掉线时,broker 帮我发一条"
- Topic + payload(典型:`status: offline`)
- Sub 立即知设备 down

---

## 6. Retained Message

- 标记 retained 的消息 broker 保留
- 新 sub 立即收到最后一条 retained(快速 state initialization)

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

## 8. 与其它 protocol 比较

| 协议 | 模型 | 通常用 |
|---|---|---|
| MQTT | Pub-Sub | IoT, telemetry |
| HTTP/REST | Req-Resp | Web API |
| WebSocket | full-duplex | Real-time web |
| CoAP | UDP REST | 极低功耗 IoT |
| AMQP | Queue | Enterprise messaging |

---

## 9. Brokers

- **Mosquitto** (Eclipse, 开源,轻量)
- **HiveMQ** (商业 + 开源,scale)
- **EMQX** (高并发,中国)
- **NATS** (类似但非 MQTT)
- **VerneMQ** (cluster)
- **AWS IoT Core**, **Azure IoT Hub** (云托管)

---

## 10. MQTT 5 改进 (2019)

- User properties(自定 header)
- Reason codes(详细错误)
- Shared subscriptions
- Topic alias(节省带宽)
- Message expiry
- 与 4 部分不兼容

---

## 11. 常见问题

### 11.1 QoS 2 性能

4-way handshake,慎用 high-rate。

### 11.2 Topic 太多

Broker 性能 ∝ topic 数;hierarchical 设计。

### 11.3 No Built-in Security

MQTT 本身无 auth/encryption;依赖 TLS + username/password / cert。

### 11.4 Broker 单点

集群 broker (EMQX, HiveMQ) 或多 region。

### 11.5 Persistence

Default 不持久;need 配置 file/DB backend(Mosquitto persistence)。

---

## 12. Related Concepts

- **嵌入式**:[ESP32](../03_Embedded_Systems/ARM_Cortex_M.md)

---

## References

1. **Stanford-Clark, A. & Truong, H. L.** "MQTT for sensor networks (MQTT-SN)." *IBM*, 2008.
2. **OASIS** *MQTT v5.0 Specification*. 2019.
3. **Banks, A. & Gupta, R.** *MQTT v3.1.1 Specification*. OASIS, 2014.
4. **HiveMQ** "MQTT Essentials" — https://www.hivemq.com/mqtt-essentials/
