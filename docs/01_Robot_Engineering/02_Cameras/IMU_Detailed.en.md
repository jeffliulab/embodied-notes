# IMU Detailed (Inertial Measurement Unit)

> *IMU = accelerometer + gyroscope (+ magnetometer = 9-axis). MEMS IMU now < $1. Essential for robots, UAVs, AR/VR, phones, autonomous driving. Fusion algorithms (Madgwick, Mahony, EKF, Kalman) solve drift + noise. BMI270, ICM-42688 are modern mainstream chips.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: Coordinate transforms, Kalman filter, quaternions

---

## 1. Sensor Composition

| Sensor | Measures | Unit |
|---|---|---|
| Accelerometer | Acceleration (incl gravity) | g or m/s² |
| Gyroscope | Angular velocity | °/s or rad/s |
| Magnetometer | Geomagnetic field | μT |
| Barometer (optional) | Pressure → altitude | hPa |
| Thermometer (optional) | Temperature compensation | °C |

6-axis = acc + gyro; 9-axis adds mag; 10-axis adds baro.

---

## 2. MEMS Physics

- **Accelerometer**: tiny spring + proof mass + capacitance change
- **Gyroscope**: Coriolis effect on vibrating MEMS structure
- **Magnetometer**: Hall effect or magnetoresistive
- All micro-fabricated, mm²

---

## 3. Mainstream Chips

| Chip | Maker | Note |
|---|---|---|
| MPU6050 / MPU9250 | InvenSense | Old but cheap (legacy) |
| ICM-42688 | InvenSense | Modern, low noise |
| BMI270 / BMI323 | Bosch | Phone mainstream |
| LSM6DSO | ST | Industrial |
| ADIS16448 | Analog Devices | High precision (high $) |
| BNO055 | Bosch | Built-in fusion |
| Xsens MTi | Xsens | Industrial IMU |

---

## 4. Key Parameters

- **Range**: ±2/4/8/16 g; ±125/250/500/1000/2000 °/s
- **Noise density**: μg/√Hz; °/s/√Hz
- **Bias stability**: drift over time
- **Bandwidth**: output rate Hz
- **Cross-axis sensitivity**: % between axes
- **Temperature drift**

---

## 5. Sensor Fusion

### 5.1 Complementary Filter (Simple)

$$\theta = \alpha (\theta + \omega \cdot dt) + (1 - \alpha) \cdot \theta_{acc}$$

- $\alpha = 0.95$ → trust gyro short-term, acc long-term

### 5.2 Madgwick / Mahony

- Quaternion-based
- Corrects gyro drift with acc/mag
- 60-200 Hz easy on Cortex-M
- Open-source

### 5.3 EKF (Extended Kalman Filter)

- State: quaternion + gyro bias + (position, velocity if GPS)
- Predict (gyro) + update (acc, mag, GPS)
- High precision but more compute

### 5.4 ESKF (Error-State KF)

- State is small error around nominal trajectory
- Numerically stable
- Mainstream in VIO / SLAM

---

## 6. Python — Madgwick Simplified

```python
import numpy as np

def madgwick_update(q, gyro, acc, dt, beta=0.1):
    """Single step Madgwick AHRS update."""
    acc_n = acc / np.linalg.norm(acc)
    qw, qx, qy, qz = q
    
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

- 6-face static → solve offset + scale
- Or ellipsoid fit

### 7.2 Gyroscope

- Collect stationary → find bias
- Temperature compensation

### 7.3 Magnetometer

- Figure-8 rotation → hard iron (offset) + soft iron (gain) correction
- User must calibrate (different per environment)

---

## 8. Applications — Robotics / UAVs

| Application | IMU use |
|---|---|
| Drone | Attitude control (essential) |
| Quadruped | Body sensing + balance |
| AR/VR HMD | Head tracking (~ 1000 Hz) |
| Phone screen rotate | Simple IMU |
| Autonomous driving | Fuse with GPS + camera + LiDAR |
| VIO (Visual-Inertial Odometry) | + camera high-precision localization |
| Pedestrian navigation | Step count + path |

---

## 9. Drift Problem

- Gyro bias → integration → angular drift
- Acc bias × dt² → position drift (faster)
- Need sensor fusion + external reference (GPS / camera / encoder)

---

## 10. Common Pitfalls

### 10.1 9-axis = 9 DOF

No; 9 measurements but fused yields 6 DOF (pose) or 3 DOF (orientation).

### 10.2 IMU Gives Absolute Pose

Wrong; only relative motion + gravity direction.

### 10.3 Magnetometer Universal

Near metal, motors disturb; indoor hard.

### 10.4 Yaw = Pitch/Roll

No; yaw needs magnetometer or fusion; pure gyro/acc fails long-term.

### 10.5 Higher Sample Rate = Higher Precision

Aliasing; sample rate must > 2× bandwidth.

---

## 11. Related Concepts

- **Same section**: Cameras, LiDAR (other files this section)
- **Robotics**: [SLAM Basics](../10_Robot_Integration/SLAM_Basics.en.md), [ROS2 Basics](../10_Robot_Integration/ROS2_Basics.en.md)
- **Foundation**: [Signal Processing](../00_Foundations/Signal_Processing.en.md)

---

## References

1. **Madgwick, S. O. H.** "An efficient orientation filter for inertial and inertial/magnetic sensor arrays." 2010.
2. **Mahony, R. et al.** "Nonlinear complementary filters on the special orthogonal group." *IEEE Trans Auto Control*, 2008.
3. **Sola, J.** "Quaternion kinematics for the error-state Kalman filter." 2017.
4. **InvenSense** *ICM-42688 Datasheet*.
