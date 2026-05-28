# 无刷电机与FOC

## 概述

无刷直流电机（BLDC）凭借高效率、高功率密度和长寿命，成为现代机器人的主流电机选择。FOC（磁场定向控制）是BLDC电机最先进的控制算法，能实现平滑低噪的精确扭矩控制。

## BLDC三相结构

### 基本构成

| 部件 | 说明 |
|------|------|
| 定子 | 硅钢片叠压铁芯，缠绕三相绕组（A/B/C） |
| 转子 | 永磁体（NdFeB钕铁硼），内转子或外转子 |
| 位置传感器 | 霍尔传感器（3个，间隔120°）或编码器 |

### 内转子 vs 外转子

| 类型 | 结构 | 特点 | 典型应用 |
|------|------|------|----------|
| 内转子 | 磁体在内，绕组在外 | 惯量小、响应快 | 工业伺服、机器人关节 |
| 外转子 | 磁体在外，绕组在内 | 扭矩大、低速平稳 | 无人机、轮毂电机 |

### 槽极配置

电机的槽（Slot，定子齿数）和极（Pole，磁极数）决定性能特征：

- **Unitree Go2电机**：36槽/42极（外转子），高扭矩密度
- **无人机电机**：12槽/14极（外转子），常见配置
- **工业伺服**：12槽/8极或12槽/10极（内转子）

!!! note "槽极比选择"
    槽极比影响齿槽转矩（cogging torque）。3:2类比值（如12N14P、36N42P）可有效降低齿槽转矩，使运转更平滑。

## 换向方式

### 梯形波换向（六步换向）

最简单的BLDC驱动方式：

- 每个时刻只有两相导通，第三相悬空
- 360°电角度分为6步，每步60°
- 通过霍尔传感器确定换向时机

```
步骤:  1    2    3    4    5    6
A相:  +H   +H   OFF  -H   -H   OFF
B相:  OFF  -H   -H   OFF  +H   +H  
C相:  -H   OFF  +H   +H   OFF  -H
```

**优点**：控制简单，硬件成本低
**缺点**：扭矩脉动大（约14%），低速不平滑，有噪音

### 正弦波换向

三相施加120°相差的正弦电流：

$$
I_a = I_m \sin(\theta_e)
$$

$$
I_b = I_m \sin(\theta_e - 120°)
$$

$$
I_c = I_m \sin(\theta_e - 240°)
$$

**优点**：扭矩脉动小，运转平滑
**缺点**：需要精确的转子位置，不能独立控制扭矩和磁通

### FOC（磁场定向控制）

FOC是目前最先进的BLDC/PMSM控制算法，通过坐标变换将交流量转为直流量控制。

## FOC控制原理

### 核心思想

将三相交流电流分解为：

- **$I_d$（直轴电流）**：控制磁通（通常设为0）
- **$I_q$（交轴电流）**：直接控制扭矩

$$
\tau = \frac{3}{2} p \cdot \lambda_m \cdot I_q
$$

其中 $p$ 为极对数，$\lambda_m$ 为永磁体磁链。

当 $I_d = 0$ 时，电流完全用于产生扭矩，效率最高。

### 坐标变换流程

```
三相电流          Clarke变换         Park变换          PI控制器
[Ia, Ib, Ic] ──────────→ [Iα, Iβ] ──────────→ [Id, Iq] ────→ [Vd, Vq]
                                                                    │
电机 ← SVPWM ← 逆Park ← [Vα, Vβ] ←──────────────────────────────┘
```

### Clarke变换（3相→2相静止）

将三相电流投影到正交的 $\alpha$-$\beta$ 坐标系：

$$
\begin{bmatrix} I_\alpha \\ I_\beta \end{bmatrix} = \frac{2}{3} \begin{bmatrix} 1 & -\frac{1}{2} & -\frac{1}{2} \\ 0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \end{bmatrix} \begin{bmatrix} I_a \\ I_b \\ I_c \end{bmatrix}
$$

### Park变换（静止→旋转）

将 $\alpha$-$\beta$ 坐标系旋转到与转子同步的 $d$-$q$ 坐标系：

$$
\begin{bmatrix} I_d \\ I_q \end{bmatrix} = \begin{bmatrix} \cos\theta_e & \sin\theta_e \\ -\sin\theta_e & \cos\theta_e \end{bmatrix} \begin{bmatrix} I_\alpha \\ I_\beta \end{bmatrix}
$$

其中 $\theta_e$ 为电角度（转子电角度位置）。

### 逆变换

控制器输出 $V_d$、$V_q$ 后，需要逆变换回三相：

**逆Park变换**：

$$
\begin{bmatrix} V_\alpha \\ V_\beta \end{bmatrix} = \begin{bmatrix} \cos\theta_e & -\sin\theta_e \\ \sin\theta_e & \cos\theta_e \end{bmatrix} \begin{bmatrix} V_d \\ V_q \end{bmatrix}
$$

**SVPWM（空间矢量脉宽调制）**：将 $V_\alpha$、$V_\beta$ 转换为三相桥臂的开关时间。

### FOC控制环路

```
             ┌──────────────────────────────────────────┐
             │                                          │
目标扭矩 → Iq_ref → [PI] → Vq ─┐                     │
                                  ├→ 逆Park → SVPWM → 逆变器 → 电机
Id_ref=0 ──→ [PI] → Vd ──────┘         ↑              │
             ↑    ↑                     │              │
             │    │              电角度 θe              │
             │    │                     ↑              │
             │    └── Park变换 ←── Clarke变换 ←── 电流采样 ←┘
             │                          ↑
             └──────── 编码器 ←─────────┘
```

## SimpleFOC库

SimpleFOC是开源的Arduino FOC库，降低了BLDC电机控制的入门门槛。

### 硬件需求

| 组件 | 说明 |
|------|------|
| MCU | ESP32 / STM32 / Arduino |
| 驱动板 | SimpleFOC Shield / L6234 / DRV8302 |
| 电流传感器 | 在线电阻/霍尔（可选，电压模式不需要） |
| 位置传感器 | AS5600磁编码器 / 霍尔传感器 / 增量编码器 |

### 代码示例

```cpp
#include <SimpleFOC.h>

// 电机定义: 极对数=7（14极）
BLDCMotor motor = BLDCMotor(7);
// 驱动器: PWM引脚
BLDCDriver3PWM driver = BLDCDriver3PWM(9, 5, 6, 8);  // A, B, C, enable
// 磁编码器
MagneticSensorI2C sensor = MagneticSensorI2C(AS5600_I2C);

void setup() {
    // 初始化编码器
    sensor.init();
    motor.linkSensor(&sensor);
    
    // 初始化驱动器
    driver.voltage_power_supply = 12;
    driver.init();
    motor.linkDriver(&driver);
    
    // FOC算法设置
    motor.foc_modulation = FOCModulationType::SinePWM;
    motor.controller = MotionControlType::torque;  // 扭矩模式
    
    // 电压模式（无需电流传感器）
    motor.torque_controller = TorqueControlType::voltage;
    
    // PI速度环参数（若使用速度模式）
    motor.PID_velocity.P = 0.2;
    motor.PID_velocity.I = 20;
    motor.voltage_limit = 6;
    
    motor.init();
    motor.initFOC();  // 校准编码器偏移
    
    Serial.begin(115200);
    motor.useMonitoring(Serial);
}

float target_voltage = 2.0;

void loop() {
    motor.loopFOC();           // FOC核心计算（尽可能快）
    motor.move(target_voltage); // 设置目标
    motor.monitor();            // 串口监视
    
    // 串口命令接口
    // 输入 "T2.5" 设置目标电压为2.5V
    command.run();
}
```

### 控制模式

| 模式 | 说明 | 需要电流传感器 |
|------|------|---------------|
| 扭矩-电压 | 设置Vq电压（近似扭矩） | 否 |
| 扭矩-电流 | 精确电流/扭矩控制 | 是 |
| 速度 | PID速度闭环 | 可选 |
| 位置 | PID位置闭环 | 可选 |

## Unitree Go2电机

Unitree（宇树科技）Go2四足机器人使用的自研BLDC电机是QDD（准直驱）方案的典型代表。

### 电机参数

| 参数 | 值 |
|------|-----|
| 类型 | BLDC外转子 |
| 槽极 | 36槽/42极 |
| 减速比 | ~6.33:1（低减速比，准直驱） |
| 峰值扭矩 | ~23.7 N·m |
| 连续扭矩 | ~8 N·m |
| 重量 | ~350g（含减速器和编码器） |
| 反馈 | 14位绝对值编码器 |
| 通信 | CAN总线 |

### QDD（准直驱）优势

- 低减速比（4-9:1）→ 高可反驱性（backdrivability）
- 机器人被外力冲击时关节可顺从弯曲，保护结构
- 扭矩透明度高，适合力控和阻抗控制
- 牺牲一些扭矩密度换取控制带宽

## ODrive控制器

ODrive是开源的高性能BLDC/PMSM驱动器，支持FOC。

### ODrive S3

| 参数 | 值 |
|------|-----|
| 驱动通道 | 双通道 |
| 电压范围 | 12-56V |
| 连续电流 | 40A/通道 |
| 控制方式 | FOC（电流环带宽>5kHz） |
| 编码器支持 | 增量/SPI绝对值/霍尔 |
| 通信 | USB / CAN / UART / SPI |
| 处理器 | STM32 |

### ODrive基本使用

```python
import odrive

# 发现并连接ODrive
odrv0 = odrive.find_any()

# 配置电机参数
odrv0.axis0.motor.config.current_lim = 10          # 电流限制10A
odrv0.axis0.motor.config.pole_pairs = 7            # 极对数
odrv0.axis0.motor.config.torque_constant = 0.04    # 扭矩常数

# 配置编码器
odrv0.axis0.encoder.config.cpr = 4096  # 编码器分辨率

# 校准
odrv0.axis0.requested_state = AXIS_STATE_FULL_CALIBRATION_SEQUENCE

# 进入闭环控制
odrv0.axis0.requested_state = AXIS_STATE_CLOSED_LOOP_CONTROL

# 位置控制
odrv0.axis0.controller.config.control_mode = CONTROL_MODE_POSITION_CONTROL
odrv0.axis0.controller.input_pos = 10.0  # 目标: 10圈

# 速度控制
odrv0.axis0.controller.config.control_mode = CONTROL_MODE_VELOCITY_CONTROL
odrv0.axis0.controller.input_vel = 2.0  # 目标: 2圈/秒

# 扭矩控制
odrv0.axis0.controller.config.control_mode = CONTROL_MODE_TORQUE_CONTROL
odrv0.axis0.controller.input_torque = 0.5  # 目标: 0.5 N·m
```

## 换向方式对比

| 特性 | 梯形波（六步） | 正弦波 | FOC |
|------|--------------|--------|-----|
| 扭矩脉动 | ~14% | ~5% | <1% |
| 效率 | 中 | 较高 | 最高 |
| 低速性能 | 差 | 较好 | 优秀 |
| 噪音 | 大 | 中 | 小 |
| 位置传感器 | 霍尔（60°分辨率） | 编码器 | 编码器 |
| 计算量 | 低 | 中 | 高 |
| 适用场景 | 风扇、简单驱动 | 一般应用 | 机器人、精密控制 |

## 无感FOC

不使用物理位置传感器，通过反电动势观测估算转子位置：

### 常用方法

- **反电动势过零检测**：适用于中高速，低速失效
- **滑模观测器（SMO）**：鲁棒性好，有抖动
- **扩展卡尔曼滤波（EKF）**：精度高，计算量大
- **高频注入法**：低速和零速都可用，需要电机凸极性

!!! tip "实际选择"
    机器人应用通常使用编码器有感FOC，因为需要精确的位置和扭矩控制。无感FOC主要用于成本敏感的消费电子产品（如电动工具、家电）。

## 小结

- BLDC电机通过电子换向取代机械电刷，寿命和效率大幅提升
- FOC通过Clarke和Park变换将交流控制转化为直流控制，实现精确扭矩控制
- SimpleFOC库使Arduino生态也能实现FOC控制
- Unitree Go2电机是QDD方案的典范，兼顾扭矩和可反驱性
- ODrive提供了开源高性能的双通道FOC驱动方案
