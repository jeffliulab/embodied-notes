# Industry 4.0 — 工业互联网时代

> *Industry 4.0 (2011 德国概念) = 第 4 次工业革命。融合 IoT, AI, cyber-physical systems, big data, robotics 入制造。Smart factory, digital twin, predictive maintenance 是核心 themes。*
>
> **难度**:Intermediate
> **前置知识**:[3D 打印](3D_Printing.md)、[CNC](CNC.md)、[ROS 2 基础](../10_Robot_Integration/ROS2_Basics.md)

---

## 1. 四次工业革命

1. **1.0** (~1784): 蒸汽 + mechanization
2. **2.0** (~1870): 电 + assembly line
3. **3.0** (~1969): 计算机 + automation
4. **4.0** (2011+): cyber-physical + IoT + AI

---

## 2. Industry 4.0 9 大支柱

1. **Big Data + Analytics**
2. **Autonomous Robots** (cobots)
3. **Simulation / Digital Twin**
4. **System Integration** (horizontal + vertical)
5. **Industrial IoT (IIoT)**
6. **Cybersecurity**
7. **Cloud Computing**
8. **Additive Manufacturing** (3D printing)
9. **AR / VR** (training, maintenance)

---

## 3. Digital Twin

虚拟 replica of physical asset / process:
- Real-time data from sensors → 同步虚拟
- 预测 maintenance / failures
- 优化 设计 / 操作
- 例:GE jet engine digital twin, Tesla factory simulation
- 工具:Siemens NX, Ansys Twin Builder, AWS IoT TwinMaker

---

## 4. IIoT (Industrial IoT)

- **Sensors**: 温度, 振动, 电流, 流量
- **Edge gateway**: 本地预处理
- **Cloud**: 数据存储 + ML
- **HMI**: dashboard for operators

协议:OPC UA, MQTT, Modbus, EtherCAT。

---

## 5. Predictive Maintenance

```
Sensor data (vibration, temp, current)
   ↓
ML model (anomaly detection / RUL prediction)
   ↓
Alert before failure
   ↓
Schedule maintenance during planned downtime
```

省 30-50% maintenance cost (vs scheduled / reactive)。

ML 模型:
- Anomaly detection (autoencoder, isolation forest)
- RUL (Remaining Useful Life) prediction (LSTM, Transformer)
- Classification (健康 / 故障)

---

## 6. Smart Factory

- 自动化生产线
- AGV (Automated Guided Vehicles) 移材料
- AMR (Autonomous Mobile Robots): flexible path
- Cobots (人协作机器人): UR, Franka
- ERP / MES / SCADA integration

---

## 7. PyTorch — Predictive Maintenance (LSTM)

```python
import torch
import torch.nn as nn

class RULPredictor(nn.Module):
    """Remaining Useful Life from vibration time series."""
    def __init__(self, n_features=10, hidden=64):
        super().__init__()
        self.lstm = nn.LSTM(n_features, hidden, num_layers=2, batch_first=True)
        self.fc = nn.Linear(hidden, 1)
    
    def forward(self, x):
        # x: (B, T, n_features)
        out, _ = self.lstm(x)
        # Predict RUL from last timestep
        return self.fc(out[:, -1]).squeeze(-1)
```

---

## 8. 各国战略

- **Germany** (Industrie 4.0, 2011): 概念发源
- **US** (Advanced Manufacturing Partnership, 2014)
- **China** (中国制造 2025, 2015)
- **Japan** (Society 5.0, 2016)
- **EU** (Manufacturing 5.0, 2021): sustainability + human-centric

---

## 9. AI 在 Industry 4.0

- **Computer vision**: quality inspection (defect detection)
- **NLP**: maintenance log analysis
- **RL**: process optimization (paper mill, chemical reactor)
- **Generative AI**: 设计 generative (Autodesk Dreamcatcher)
- **LLM**: shop floor assistant

---

## 10. 案例

### 10.1 Tesla Gigafactory

- 高度自动化 EV 生产
- 几乎 0 worker 在部分 line
- Digital twin of factory

### 10.2 Siemens Amberg

- 75% automated
- 1 product family, 1000+ variant
- Quality 99.9988%

### 10.3 Bosch

- 多 plant 全球 IIoT 网络
- 30%+ productivity gain

---

## 11. 挑战

- Cybersecurity (ransomware risk)
- 数据 privacy
- 工人 reskilling
- Standards interop
- Initial investment ($M-B$)

---

## 12. 趋势 (Industry 5.0?)

- **Human-centric**: 不是替代,是 augmentation
- **Sustainability**: carbon neutral manufacturing
- **Resilience**: 抗 disruption (pandemic, war)
- **AI generative manufacturing**

---

## 13. Common Pitfalls

### 13.1 "Buzzword"

很多 "Industry 4.0" project 只是 IoT 简单加,没真 transformation。

### 13.2 Data silos

不同 system data 不通 → 不能 ML。

### 13.3 ROI 长

大投资 + 长 deployment → 数年才见 ROI。

### 13.4 Skill gap

需 ML + domain (mechanical) + IT skills,人才稀缺。

### 13.5 Vendor lock-in

封闭 ecosystem → 长期成本高。

---

## 14. Related Concepts

- **同节**:[3D 打印](3D_Printing.md)、[CNC](CNC.md)
- **机器人**:[ROS 2 基础](../10_Robot_Integration/ROS2_Basics.md)
- **AI**: https://jeffliulab.github.io/ai-notes/06_AI_Engineering/

---

## References

1. **Kagermann, H. et al.** *Recommendations for Implementing the Strategic Initiative INDUSTRIE 4.0*. acatech, 2013.
2. **World Economic Forum** — Fourth Industrial Revolution reports.
3. **Schwab, K.** *The Fourth Industrial Revolution*. 2016.
4. **Siemens** Industry 4.0 white papers.
