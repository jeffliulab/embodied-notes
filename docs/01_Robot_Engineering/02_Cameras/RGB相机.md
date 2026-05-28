# RGB相机

## 概述

RGB相机是最基础也是最常用的机器人视觉传感器。从廉价的USB摄像头到高性能的工业相机，RGB相机为目标检测、识别、跟踪等视觉任务提供2D彩色图像数据。

## CMOS传感器基础

### 工作原理

CMOS图像传感器的每个像素包含一个光电二极管和相关电路：

1. **光电转换**：光子打到光电二极管上产生电子
2. **电荷积累**：曝光期间积累电荷
3. **电荷读出**：通过晶体管将电荷转换为电压
4. **ADC转换**：模拟电压转为数字值

### Bayer滤色阵列

由于每个像素只能感受一种颜色，CMOS传感器使用Bayer滤色阵列：

```
Bayer Pattern (RGGB):
┌───┬───┬───┬───┐
│ R │ G │ R │ G │
├───┼───┼───┼───┤
│ G │ B │ G │ B │
├───┼───┼───┼───┤
│ R │ G │ R │ G │
├───┼───┼───┼───┤
│ G │ B │ G │ B │
└───┴───┴───┴───┘
绿色像素占50%（人眼对绿色最敏感）
```

**去马赛克（Demosaicing）**：通过插值算法从Bayer原始数据恢复全彩RGB图像。

$$
\text{有效分辨率} \approx 0.7 \times \text{传感器分辨率}
$$

### 滚动快门 vs 全局快门

**滚动快门（Rolling Shutter）**：

```
时间 →
行0: [====曝光====][读出]
行1:   [====曝光====][读出]
行2:     [====曝光====][读出]
行3:       [====曝光====][读出]
  ↓
上下行的曝光时间不同，运动物体产生畸变
```

**全局快门（Global Shutter）**：

```
时间 →
行0: [====曝光====][读出    ]
行1: [====曝光====][  读出  ]
行2: [====曝光====][    读出]
行3: [====曝光====][      读出]
  ↓
所有行同时曝光，无运动畸变
```

| 传感器 | 快门类型 | 分辨率 | 像素大小 | 用途 |
|--------|----------|--------|----------|------|
| IMX219 | 滚动 | 8MP | 1.12μm | RPi Camera V2 |
| IMX477 | 滚动 | 12.3MP | 1.55μm | RPi HQ Camera |
| IMX296 | 全局 | 1.58MP | 3.45μm | 工业视觉、VIO |
| OV9281 | 全局 | 1MP | 3.0μm | 视觉里程计 |
| IMX462 | 滚动 | 2.1MP | 2.9μm | 夜视（星光级） |

## 常用RGB相机详解

### IMX219（Raspberry Pi Camera V2）

| 参数 | 值 |
|------|-----|
| 传感器 | Sony IMX219 |
| 分辨率 | 3280 x 2464 (8MP) |
| 像素大小 | 1.12μm x 1.12μm |
| 传感器尺寸 | 1/4" (3.68 x 2.76mm) |
| 快门 | 滚动快门 |
| 接口 | CSI-2 (2 lanes) |
| 帧率 | 8MP@15fps, 1080p@30fps, 720p@60fps |
| FOV | 62.2° x 48.8° |
| 焦距 | 3.04mm (固定焦距) |
| 光圈 | f/2.0 |
| 价格 | ~$25 |

**适用场景**：教学、轻量级视觉、低成本机器人原型。

```bash
# Raspberry Pi / Jetson上使用libcamera
libcamera-still -o test.jpg --width 1920 --height 1080

# 使用GStreamer采集
gst-launch-1.0 nvarguscamerasrc ! \
    'video/x-raw(memory:NVMM), width=1920, height=1080, framerate=30/1' ! \
    nvvidconv ! videoconvert ! autovideosink
```

### IMX477（Raspberry Pi HQ Camera）

| 参数 | 值 |
|------|-----|
| 传感器 | Sony IMX477 |
| 分辨率 | 4056 x 3040 (12.3MP) |
| 像素大小 | 1.55μm x 1.55μm |
| 传感器尺寸 | 1/2.3" (6.29 x 4.71mm) |
| 快门 | 滚动快门 |
| 接口 | CSI-2 (2 lanes) |
| 帧率 | 12.3MP@10fps, 1080p@50fps |
| 镜头卡口 | C/CS-mount（可更换镜头） |
| 价格 | ~$50 |

**优势**：可更换镜头，适合需要不同焦距的场景。

| 配套镜头 | 焦距 | FOV | 用途 |
|----------|------|-----|------|
| 广角镜头 | 6mm | 63° | 导航、SLAM |
| 长焦镜头 | 16mm | 24° | 远距离识别 |
| 鱼眼镜头 | 2.5mm | 140° | 全景感知 |

### USB相机

#### Logitech C920

| 参数 | 值 |
|------|-----|
| 分辨率 | 1080p @30fps |
| 编码 | H.264硬件编码 |
| 接口 | USB 2.0 |
| FOV | 78° |
| 自动对焦 | 是 |
| 麦克风 | 双立体声麦克风 |
| 价格 | ~$60 |

```python
# OpenCV读取USB相机
import cv2

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
cap.set(cv2.CAP_PROP_FPS, 30)
# 禁用自动对焦（SLAM需要固定焦距）
cap.set(cv2.CAP_PROP_AUTOFOCUS, 0)
cap.set(cv2.CAP_PROP_FOCUS, 0)  # 对焦到无穷远

while True:
    ret, frame = cap.read()
    if not ret:
        break
    cv2.imshow('Camera', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

#### ELP USB相机模组

| 型号 | 传感器 | 分辨率 | 快门 | FOV | 价格 |
|------|--------|--------|------|-----|------|
| ELP-USB8MP | IMX179 | 8MP | 滚动 | 75° | $30 |
| ELP-USBFHD01M | AR0230 | 1080p | 滚动 | 100° | $35 |
| ELP-USB1MP | OV9281 | 1MP | 全局 | 70° | $40 |

### Arducam相机系列

Arducam提供多种嵌入式相机解决方案：

| 型号 | 传感器 | 接口 | 特色 |
|------|--------|------|------|
| Arducam IMX219 | IMX219 | CSI | RPi兼容，多种FOV |
| Arducam IMX477 | IMX477 | CSI | M12镜头卡口 |
| Arducam OV9281 | OV9281 | CSI/USB | 全局快门，VIO首选 |
| Arducam Stereo | IMX219x2 | CSI | 双目相机模组 |

## CSI vs USB对比

| 特性 | CSI-2 | USB 2.0 | USB 3.0 |
|------|-------|---------|---------|
| 带宽 | 2.5Gbps/lane x4 = 10Gbps | 480Mbps | 5Gbps |
| 延迟 | <1ms | ~30ms | ~10ms |
| CPU占用 | 极低（ISP硬件处理） | 中（软件解码） | 中 |
| 线缆长度 | <30cm（FPC排线） | <5m | <3m |
| 即插即用 | 否（需适配） | 是（UVC标准） | 是 |
| 多相机 | 每个CSI端口一个 | Hub可接多个 | Hub可接多个 |
| 编程接口 | libargus / nvarguscamerasrc | V4L2 / OpenCV | V4L2 / OpenCV |

!!! tip "选择建议"
    - **CSI**：固定安装、需要低延迟和高帧率的场景（如SLAM）
    - **USB**：需要灵活性、即插即用、长线缆的场景

## 图像质量参数

### 信噪比（SNR）

$$
\text{SNR} = 20 \log_{10}\frac{S}{N} \quad \text{(dB)}
$$

其中 $S$ 是信号电平，$N$ 是噪声电平。

影响因素：

- **像素大小**：大像素 → 高SNR（每像素接收更多光子）
- **曝光时间**：长曝光 → 高SNR（但可能运动模糊）
- **ISO/增益**：高增益 → 低SNR（噪声被放大）

### 动态范围

$$
\text{动态范围} = 20 \log_{10}\frac{V_{\text{sat}}}{V_{\text{noise}}} \quad \text{(dB)}
$$

| 传感器 | 动态范围 | 说明 |
|--------|---------|------|
| 普通CMOS | ~60dB | 室内够用 |
| HDR传感器 | ~100dB | 室外明暗对比 |
| 人眼 | ~120dB | 参考 |

### 常见图像问题及解决

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 运动模糊 | 曝光时间过长 | 缩短曝光、用全局快门 |
| 噪点 | 低光照、高增益 | 降噪算法、更大像素传感器 |
| 过曝/欠曝 | 自动曝光不准 | 手动曝光、HDR |
| 色彩偏差 | 白平衡不准 | 手动白平衡、色彩校正 |
| 镜头畸变 | 广角镜头 | 标定+去畸变 |
| 帧率不稳 | USB带宽不足 | 降分辨率、换CSI接口 |

## 相机参数配置

### 手动曝光控制

```python
import cv2

cap = cv2.VideoCapture(0)

# 关闭自动曝光
cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 1)  # 1=手动, 3=自动
cap.set(cv2.CAP_PROP_EXPOSURE, -6)       # 曝光值（对数刻度）

# 关闭自动白平衡
cap.set(cv2.CAP_PROP_AUTO_WB, 0)
cap.set(cv2.CAP_PROP_WB_TEMPERATURE, 5000)  # 色温5000K

# 设置增益
cap.set(cv2.CAP_PROP_GAIN, 0)  # 最低增益
```

### Jetson CSI相机控制

```python
# GStreamer pipeline for Jetson with manual exposure
import cv2

gst_str = (
    'nvarguscamerasrc sensor-id=0 '
    'exposuretimerange="5000000 10000000" '  # 5-10ms曝光
    'gainrange="1.0 2.0" '                    # 增益范围
    'ispdigitalgainrange="1 1" '              # 数字增益
    'wbmode=0 '                               # 手动白平衡
    '! video/x-raw(memory:NVMM), '
    'width=1920, height=1080, '
    'format=NV12, framerate=30/1 '
    '! nvvidconv '
    '! video/x-raw, format=BGRx '
    '! videoconvert '
    '! video/x-raw, format=BGR '
    '! appsink'
)

cap = cv2.VideoCapture(gst_str, cv2.CAP_GSTREAMER)
```

## 常用相机规格对比表

| 相机 | 传感器 | 分辨率 | 快门 | 接口 | FOV | 帧率 | 价格 | 推荐场景 |
|------|--------|--------|------|------|-----|------|------|----------|
| RPi Camera V2 | IMX219 | 8MP | 滚动 | CSI | 62° | 1080p@30 | $25 | 教学入门 |
| RPi HQ Camera | IMX477 | 12.3MP | 滚动 | CSI | 可换镜头 | 1080p@50 | $50 | 多用途 |
| Logitech C920 | - | 2MP | 滚动 | USB2.0 | 78° | 1080p@30 | $60 | 通用 |
| Arducam OV9281 | OV9281 | 1MP | 全局 | CSI/USB | 70° | 720p@120 | $40 | VIO/SLAM |
| ELP AR0230 | AR0230 | 2MP | 滚动 | USB | 100° | 1080p@30 | $35 | 广角导航 |
| FLIR BFS | IMX264 | 5MP | 全局 | USB3.0 | 可换镜头 | 5MP@24 | $500 | 工业视觉 |

## 小结

1. **CMOS传感器**通过Bayer滤色阵列获取彩色图像
2. **全局快门**消除运动畸变，对VIO和SLAM至关重要
3. **像素大小**直接影响低光性能和信噪比
4. **CSI接口**延迟最低且不占CPU，适合嵌入式系统
5. **USB相机**方便灵活，适合快速原型开发
6. 根据任务需求选择合适的分辨率、帧率和镜头

## 参考资料

- Sony Semiconductor Solutions: IMX系列数据手册
- Raspberry Pi Camera Documentation: [https://www.raspberrypi.com/documentation/accessories/camera.html](https://www.raspberrypi.com/documentation/accessories/camera.html)
- V4L2 API Documentation: [https://www.kernel.org/doc/html/latest/userspace-api/media/v4l/v4l2.html](https://www.kernel.org/doc/html/latest/userspace-api/media/v4l/v4l2.html)
