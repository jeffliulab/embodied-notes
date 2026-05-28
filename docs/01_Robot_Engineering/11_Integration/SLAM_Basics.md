# SLAM (Simultaneous Localization and Mapping) 基础

> *SLAM 是机器人**同时**建图 + 定位的算法。从 1990s EKF-SLAM,到 2010s graph-based,到现代 visual / LiDAR / multi-sensor fusion。是 autonomous vehicle, AR/VR, 无人机的基础。*
>
> **难度**:Advanced
> **前置知识**:[Linear Algebra](../00_Foundations/Linear_Algebra.md)、[Control Theory](../00_Foundations/Control_Theory.md)、概率论

---

## 1. SLAM 核心问题

```
Robot 不知道位置 + 不知道 map
   ↓
Move + sense
   ↓
推断 (robot pose, map) joint distribution
```

→ Chicken-and-egg: 定位需 map, 建图需 location。

---

## 2. 数学描述

$$P(x_{1:t}, m | z_{1:t}, u_{1:t})$$

- $x_t$: pose at time t
- $m$: map
- $z_t$: observation
- $u_t$: control input

---

## 3. SLAM 派系

### 3.1 Filter-based

- **EKF-SLAM**: Extended Kalman Filter (1980s-2000s 主流)
  - 维 state vector [robot pose + all landmarks]
  - $O(n^2)$ each update, n = landmarks
  - 局限:scale 大时慢
- **Particle Filter SLAM** (FastSLAM): 用 particles 表示 pose distribution

### 3.2 Graph-based

- 节点:robot pose / landmarks
- 边:observations / odometry
- 优化:最小化 reprojection error (g2o, ceres-solver)
- 现代主流 — ORB-SLAM, LSD-SLAM, Kimera

### 3.3 Submap-based

- 大场景分 submaps
- Cartographer (Google)

---

## 4. Sensor 类型

### 4.1 Visual SLAM (V-SLAM)

- 单 / 双目相机
- 计算 keypoint + descriptor (ORB, SIFT)
- 例:ORB-SLAM3, DSO

### 4.2 LiDAR SLAM

- 360° rotating 或 solid-state
- ICP / NDT scan matching
- 例:LOAM, LIO-SAM

### 4.3 RGB-D SLAM

- Kinect, RealSense
- 直接 dense map (TSDF)
- 例:KinectFusion, ElasticFusion

### 4.4 多 sensor fusion

- Visual-Inertial (VIO): camera + IMU
- LiDAR-Inertial (LIO)
- VINS-Mono (VIO 主流)

---

## 5. EKF-SLAM 简要

```
Predict:
  x_pred = f(x, u)
  P_pred = F P F^T + Q

Update (每观测 landmark):
  K = P H^T (H P H^T + R)^-1
  x = x_pred + K (z - h(x_pred))
  P = (I - K H) P_pred
```

---

## 6. Loop Closure

走回起点 → 检测同一位置 → 闭合 trajectory:
- 减 drift error
- 关键 to large-scale SLAM
- 检测:visual place recognition (DBoW2)

---

## 7. PyTorch / Python — 简化 EKF-SLAM (1D)

```python
import numpy as np

class EKFSLAM_1D:
    def __init__(self):
        self.x = 0  # robot pose
        self.P = 1.0  # variance
        self.landmarks = {}  # id → (mean, var)
    
    def predict(self, u, Q=0.01):
        self.x += u  # f(x, u) = x + u
        self.P += Q  # F=1
    
    def update(self, landmark_id, z, R=0.05):
        if landmark_id not in self.landmarks:
            # New landmark
            self.landmarks[landmark_id] = (self.x + z, self.P + R)
        else:
            # EKF update
            lm_mean, lm_var = self.landmarks[landmark_id]
            h = lm_mean - self.x  # expected z
            # H = [-1, 0, ..., 1, ...] for [robot, ..., landmark]
            S = self.P + lm_var + R
            K_robot = -self.P / S
            K_lm = lm_var / S
            innovation = z - h
            self.x += K_robot * innovation
            new_lm_mean = lm_mean + K_lm * innovation
            self.landmarks[landmark_id] = (new_lm_mean, lm_var * (1 - K_lm))
```

---

## 8. 经典 SLAM 系统

- **ORB-SLAM3** (2021): visual-inertial, mono/stereo/RGB-D
- **Cartographer** (Google 2016): 2D/3D LiDAR
- **LOAM** (2014): LiDAR Odometry and Mapping
- **VINS-Mono** (2018): visual-inertial
- **DSO** (2016): direct sparse odometry
- **OpenVSLAM**: open source
- **RTAB-Map**: real-time appearance based

---

## 9. 应用

- **Autonomous driving**: Tesla, Waymo, Cruise
- **Drone**: DJI, Skydio
- **AR/VR**: Hololens, Quest (inside-out tracking)
- **Robot vacuum**: Roomba i7+
- **Warehouse robot**: Amazon Kiva
- **Mars rover**: Curiosity, Perseverance

---

## 10. 现代趋势

### 10.1 Neural SLAM

- **NICE-SLAM** (2022): neural radiance field map
- **DeepFactors**: learning factors for SLAM
- **Code as map**: NeRF for SLAM

### 10.2 Multi-robot SLAM

- 多机协同 mapping
- Federated learning style

### 10.3 LiDAR-Inertial 主流

- Fast-LIO, LIO-SAM 取代纯 LiDAR
- IMU 提 high-rate motion

---

## 11. Common Pitfalls

### 11.1 Drift Accumulation

无 loop closure → trajectory 漂移。

### 11.2 Wrong Loop Closure (False Positive)

类似场景 (corridor) 误 close loop → 灾难性 map 坏。

### 11.3 Dynamic objects

行人 / 车 in scene → SLAM 受扰。需 DynaSLAM / 动态 segmentation。

### 11.4 Computational Cost

Dense SLAM (TSDF) RAM ↑;Visual SLAM CPU ↑。

### 11.5 Sensor Calibration

IMU-camera time / extrinsic 必须 calibrate;否则 VIO 失败。

---

## 12. Related Concepts

- **同节**:[ROS 2 基础](ROS2_Basics.md)、[系统集成综述](系统集成综述.md)
- **传感**:[Cameras](../05_Sensors_Perception/01_Cameras/index.md)、[LiDAR](../05_Sensors_Perception/02_LiDAR/index.md)、[IMU](../05_Sensors_Perception/03_IMU_Navigation/index.md)
- **AI 关联**: [Embodied Intelligence](https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/)

---

## References

1. **Thrun, S., Burgard, W., Fox, D.** *Probabilistic Robotics*. MIT, 2005.
2. **Cadena, C. et al.** "Past, present, and future of SLAM: Toward the robust-perception age." *IEEE T-RO*, 2016.
3. **Mur-Artal, R. & Tardós, J. D.** "ORB-SLAM2." *IEEE T-RO*, 2017.
4. **Sucar, E. et al.** "iMAP / NICE-SLAM: Implicit Mapping with Neural Networks." *ICCV*, 2021.
