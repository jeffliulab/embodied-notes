# SLAM (Simultaneous Localization and Mapping) Basics

> *SLAM is the algorithm for robots to **simultaneously** build maps + localize. From 1990s EKF-SLAM, to 2010s graph-based, to modern visual / LiDAR / multi-sensor fusion. Foundation of autonomous vehicles, AR/VR, drones.*
>
> **Difficulty**: Advanced
> **Prerequisites**: [Linear Algebra](../00_Foundations/Linear_Algebra.en.md), [Control Theory](../00_Foundations/Control_Theory.en.md), probability

---

## 1. Core Problem

```
Robot doesn't know location + doesn't know map
   ↓
Move + sense
   ↓
Infer (robot pose, map) joint distribution
```

→ Chicken-and-egg: localization needs map, mapping needs location.

---

## 2. Mathematical Description

$$P(x_{1:t}, m | z_{1:t}, u_{1:t})$$

- $x_t$: pose at time t
- $m$: map
- $z_t$: observation
- $u_t$: control input

---

## 3. SLAM Families

### 3.1 Filter-based

- **EKF-SLAM**: Extended Kalman Filter (1980s-2000s mainstream)
  - State vector [robot pose + all landmarks]
  - $O(n^2)$ each update, n = landmarks
  - Limit: slow at scale
- **Particle Filter SLAM** (FastSLAM): particles represent pose distribution

### 3.2 Graph-based

- Nodes: robot pose / landmarks
- Edges: observations / odometry
- Optimization: minimize reprojection error (g2o, ceres-solver)
- Modern mainstream — ORB-SLAM, LSD-SLAM, Kimera

### 3.3 Submap-based

- Divide large scenes into submaps
- Cartographer (Google)

---

## 4. Sensor Types

### 4.1 Visual SLAM (V-SLAM)

- Mono / stereo cameras
- Compute keypoints + descriptors (ORB, SIFT)
- Example: ORB-SLAM3, DSO

### 4.2 LiDAR SLAM

- 360° rotating or solid-state
- ICP / NDT scan matching
- Example: LOAM, LIO-SAM

### 4.3 RGB-D SLAM

- Kinect, RealSense
- Direct dense map (TSDF)
- Example: KinectFusion, ElasticFusion

### 4.4 Multi-sensor Fusion

- Visual-Inertial (VIO): camera + IMU
- LiDAR-Inertial (LIO)
- VINS-Mono (VIO mainstream)

---

## 5. EKF-SLAM Brief

```
Predict:
  x_pred = f(x, u)
  P_pred = F P F^T + Q

Update (per landmark observation):
  K = P H^T (H P H^T + R)^-1
  x = x_pred + K (z - h(x_pred))
  P = (I - K H) P_pred
```

---

## 6. Loop Closure

Returning to start → detect same location → close trajectory:
- Reduce drift error
- Key to large-scale SLAM
- Detection: visual place recognition (DBoW2)

---

## 7. PyTorch / Python — Simplified EKF-SLAM (1D)

```python
import numpy as np

class EKFSLAM_1D:
    def __init__(self):
        self.x = 0
        self.P = 1.0
        self.landmarks = {}
    
    def predict(self, u, Q=0.01):
        self.x += u
        self.P += Q
    
    def update(self, landmark_id, z, R=0.05):
        if landmark_id not in self.landmarks:
            self.landmarks[landmark_id] = (self.x + z, self.P + R)
        else:
            lm_mean, lm_var = self.landmarks[landmark_id]
            h = lm_mean - self.x
            S = self.P + lm_var + R
            K_robot = -self.P / S
            K_lm = lm_var / S
            innovation = z - h
            self.x += K_robot * innovation
            new_lm_mean = lm_mean + K_lm * innovation
            self.landmarks[landmark_id] = (new_lm_mean, lm_var * (1 - K_lm))
```

---

## 8. Classic SLAM Systems

- **ORB-SLAM3** (2021): visual-inertial, mono/stereo/RGB-D
- **Cartographer** (Google 2016): 2D/3D LiDAR
- **LOAM** (2014): LiDAR Odometry and Mapping
- **VINS-Mono** (2018): visual-inertial
- **DSO** (2016): direct sparse odometry
- **OpenVSLAM**: open source
- **RTAB-Map**: real-time appearance based

---

## 9. Applications

- **Autonomous driving**: Tesla, Waymo, Cruise
- **Drones**: DJI, Skydio
- **AR/VR**: Hololens, Quest (inside-out tracking)
- **Robot vacuum**: Roomba i7+
- **Warehouse robots**: Amazon Kiva
- **Mars rovers**: Curiosity, Perseverance

---

## 10. Modern Trends

### 10.1 Neural SLAM

- **NICE-SLAM** (2022): neural radiance field map
- **DeepFactors**: learning factors for SLAM
- **Code as map**: NeRF for SLAM

### 10.2 Multi-robot SLAM

- Multi-robot collaborative mapping
- Federated learning style

### 10.3 LiDAR-Inertial Mainstream

- Fast-LIO, LIO-SAM replace pure LiDAR
- IMU provides high-rate motion

---

## 11. Common Pitfalls

### 11.1 Drift Accumulation

No loop closure → trajectory drifts.

### 11.2 Wrong Loop Closure (False Positive)

Similar scenes (corridors) wrongly closed → catastrophic map corruption.

### 11.3 Dynamic Objects

Pedestrians / vehicles in scene → SLAM affected. Need DynaSLAM / dynamic segmentation.

### 11.4 Computational Cost

Dense SLAM (TSDF) high RAM; Visual SLAM CPU-heavy.

### 11.5 Sensor Calibration

IMU-camera time / extrinsic must be calibrated; else VIO fails.

---

## 12. Related Concepts

- **Same section**: [ROS 2 Basics](ROS2_Basics.en.md), [Integration Overview](系统集成综述.en.md)
- **Sensors**: [Cameras](../05_Sensors_Perception/01_Cameras/index.en.md), [LiDAR](../05_Sensors_Perception/02_LiDAR/index.en.md), [IMU](../05_Sensors_Perception/03_IMU_Navigation/index.en.md)
- **AI connection**: [Embodied Intelligence](https://jeffliulab.github.io/ai-notes/08_Embodied_Intelligence/)

---

## References

1. **Thrun, S., Burgard, W., Fox, D.** *Probabilistic Robotics*. MIT, 2005.
2. **Cadena, C. et al.** "Past, present, and future of SLAM: Toward the robust-perception age." *IEEE T-RO*, 2016.
3. **Mur-Artal, R. & Tardós, J. D.** "ORB-SLAM2." *IEEE T-RO*, 2017.
4. **Sucar, E. et al.** "iMAP / NICE-SLAM: Implicit Mapping with Neural Networks." *ICCV*, 2021.
