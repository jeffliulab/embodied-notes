# IMU 详解 (Inertial Measurement Unit)

> *IMU = 加速度计 + 陀螺仪 (+ 磁力计 = 9-axis)。MEMS IMU 现 < $1。机器人、UAV、AR/VR、手机、自动驾驶必备。Fusion algorithm (Madgwick、Mahony、EKF、Kalman) 解决 drift + noise。BMI270、ICM-42688 是当代主流芯片。*
>
> **难度**:Intermediate
> **前置知识**:坐标变换、Kalman filter、四元数

---

## 1. 传感器组成

| 传感器 | 测什么 | 单位 |
|---|---|---|
| Accelerometer | 加速度(含重力) | g 或 m/s² |
| Gyroscope | 角速度 | °/s 或 rad/s |
| Magnetometer | 地磁场 | μT |
| Barometer (可选) | 气压 → 高度 | hPa |
| Thermometer (可选) | 温度补偿 | °C |

6-axis = acc + gyro;9-axis 加 mag;10-axis 加 baro。

---

## 2. MEMS 物理

- **Accelerometer**: 微小弹簧 + proof mass + 电容变化
- **Gyroscope**: Coriolis effect on vibrating MEMS structure
- **Magnetometer**: Hall effect or magnetoresistive
- 全 micro-fabricated,几 mm²

---

## 3. 主流芯片

| 芯片 | 厂 | 特点 |
|---|---|---|
| MPU6050 / MPU9250 | InvenSense | 老但便宜 (旧) |
| ICM-42688 | InvenSense | 当代,低 noise |
| BMI270 / BMI323 | Bosch | 手机主流 |
| LSM6DSO | ST | 工业 |
| ADIS16448 | Analog Devices | 高精度 (high $) |
| BNO055 | Bosch | 内置 fusion |
| Xsens MTi | Xsens | 工业 IMU |

---

## 4. 关键参数

- **Range**: ±2/4/8/16 g; ±125/250/500/1000/2000 °/s
- **Noise density**: μg/√Hz; °/s/√Hz
- **Bias stability**: drift over time
- **Bandwidth**: 多少 Hz output
- **Cross-axis sensitivity**: % between axes
- **Temperature drift**

---

## 5. Sensor Fusion

### 5.1 Complementary Filter (简单)

$$\theta = \alpha (\theta + \omega \cdot dt) + (1 - \alpha) \cdot \theta_{acc}$$

- $\alpha = 0.95$ → trust gyro short-term, acc long-term

### 5.2 Madgwick / Mahony

- Quaternion-based
- 修正 gyro drift with acc/mag
- 60-200 Hz easy on Cortex-M
- Open-source

### 5.3 EKF (Extended Kalman Filter)

- State: quaternion + gyro bias + (位置、速度 if GPS)
- Predict (gyro) + update (acc, mag, GPS)
- 高精度 but 计算更贵

### 5.4 ESKF (Error-State KF)

- State 是 small error,在 nominal trajectory 周围
- 数值稳定
- VIO / SLAM 主流

---

## 6. Python — Madgwick 简化

```python
import numpy as np

def madgwick_update(q, gyro, acc, dt, beta=0.1):
    """Single step Madgwick AHRS update."""
    # Normalize acc
    acc_n = acc / np.linalg.norm(acc)
    qw, qx, qy, qz = q
    
    # Gravity error gradient
    f = np.array([
        2*(qx*qz - qw*qy) - acc_n[0],
        2*(qw*qx + qy*qz) - acc_n[1],
        2*(0.5 - qx**2 - qy**2) - acc_n[2]
    ])
    J = np.array([
        [-2*qy, 2*qz, -2*qw, 2*qx],
        [ 2*qx, 2*qw,  2*qz, 2*qy],
        [    0, -4*qx, -4*qy,    0]
    ])
    grad = J.T @ f
    grad = grad / np.linalg.norm(grad)
    
    # Rate of change with correction
    gx, gy, gz = gyro
    qdot = 0.5 * np.array([
        -qx*gx - qy*gy - qz*gz,
         qw*gx + qy*gz - qz*gy,
         qw*gy - qx*gz + qz*gx,
         qw*gz + qx*gy - qy*gx
    ]) - beta * grad
    q = q + qdot * dt
    return q / np.linalg.norm(q)
```

---

## 7. Calibration

### 7.1 Accelerometer

- 6 face static → 求 offset + scale
- 或 ellipsoid fit

### 7.2 Gyroscope

- 静止时收集 → 求 bias
- Temperature compensation

### 7.3 Magnetometer

- 8 字旋转 → hard iron (offset) + soft iron (gain) 补偿
- 必须 user calibrate(每环境不同)

---

## 8. 应用 — 机器人 / UAV

| 应用 | IMU 用 |
|---|---|
| Drone | 主姿态控制(必备) |
| Quadruped | 体感 + balance |
| AR/VR HMD | 头追踪 (~ 1000 Hz) |
| Phone screen rotate | 简 IMU |
| 自动驾驶 | 与 GPS + camera + LiDAR fusion |
| VIO (Visual-Inertial Odometry) | + camera 高精 localization |
| 步行 navigation | 步数 + 路径 |

---

## 9. Drift 问题

- Gyro bias → integration → 角度漂
- Acc bias × dt² → 位置漂(更快)
- 需 sensor fusion + external reference (GPS / camera / encoder)

---

## 10. 常见问题

### 10.1 9-axis = 9 DOF

不;9 个 measurement,但 fuse 后只 6 DOF (pose) 或 3 DOF (orientation)。

### 10.2 IMU 给 absolute pose

错;只给 relative motion + 重力方向。

### 10.3 Magnetometer 万能定向

近金属、电机干扰;室内难。

### 10.4 Yaw 与 pitch/roll 同

错;yaw 需 magnetometer 或 fusion,纯 gyro/acc 不能 long-term。

### 10.5 高 sample rate = 高精度

Aliasing;sample rate must > 2× bandwidth。

---

## 11. Related Concepts

- **同节**:Cameras、LiDAR(本节其他文件)
- **机器人**:[SLAM_Basics](../10_Robot_Integration/SLAM_Basics.md)、[ROS2_Basics](../10_Robot_Integration/ROS2_Basics.md)
- **基础**:[Signal Processing](../00_Foundations/Signal_Processing.md)

---

## References

1. **Madgwick, S. O. H.** "An efficient orientation filter for inertial and inertial/magnetic sensor arrays." 2010.
2. **Mahony, R. et al.** "Nonlinear complementary filters on the special orthogonal group." *IEEE Trans Auto Control*, 2008.
3. **Sola, J.** "Quaternion kinematics for the error-state Kalman filter." 2017.
4. **InvenSense** *ICM-42688 Datasheet*.
