# RGB Cameras

## Overview

RGB cameras are the most basic and commonly used visual sensors in robotics. From inexpensive USB webcams to high-performance industrial cameras, RGB cameras provide 2D color image data for object detection, recognition, tracking, and other vision tasks.

## CMOS Sensor Fundamentals

### Working Principle

Each pixel of a CMOS image sensor contains a photodiode and associated circuitry:

1. **Photoelectric conversion**: Photons striking the photodiode generate electrons
2. **Charge accumulation**: Charge accumulates during the exposure period
3. **Charge readout**: Transistors convert charge to voltage
4. **ADC conversion**: Analog voltage is converted to digital values

### Bayer Color Filter Array

Since each pixel can only sense one color, CMOS sensors use a Bayer color filter array:

```
Bayer Pattern (RGGB):
+---+---+---+---+
| R | G | R | G |
+---+---+---+---+
| G | B | G | B |
+---+---+---+---+
| R | G | R | G |
+---+---+---+---+
| G | B | G | B |
+---+---+---+---+
Green pixels account for 50% (human eyes are most sensitive to green)
```

**Demosaicing**: Interpolation algorithms recover full-color RGB images from raw Bayer data.

$$
\text{Effective Resolution} \approx 0.7 \times \text{Sensor Resolution}
$$

### Rolling Shutter vs. Global Shutter

**Rolling Shutter**:

```
Time ->
Row 0: [====Exposure====][Readout]
Row 1:   [====Exposure====][Readout]
Row 2:     [====Exposure====][Readout]
Row 3:       [====Exposure====][Readout]
  |
Different rows are exposed at different times; moving objects are distorted
```

**Global Shutter**:

```
Time ->
Row 0: [====Exposure====][Readout    ]
Row 1: [====Exposure====][  Readout  ]
Row 2: [====Exposure====][    Readout]
Row 3: [====Exposure====][      Readout]
  |
All rows are exposed simultaneously; no motion distortion
```

| Sensor | Shutter Type | Resolution | Pixel Size | Use |
|--------|-------------|-----------|------------|-----|
| IMX219 | Rolling | 8MP | 1.12um | RPi Camera V2 |
| IMX477 | Rolling | 12.3MP | 1.55um | RPi HQ Camera |
| IMX296 | Global | 1.58MP | 3.45um | Industrial vision, VIO |
| OV9281 | Global | 1MP | 3.0um | Visual odometry |
| IMX462 | Rolling | 2.1MP | 2.9um | Night vision (starlight grade) |

## Common RGB Cameras in Detail

### IMX219 (Raspberry Pi Camera V2)

| Parameter | Value |
|-----------|-------|
| Sensor | Sony IMX219 |
| Resolution | 3280 x 2464 (8MP) |
| Pixel Size | 1.12um x 1.12um |
| Sensor Size | 1/4" (3.68 x 2.76mm) |
| Shutter | Rolling shutter |
| Interface | CSI-2 (2 lanes) |
| Frame Rate | 8MP@15fps, 1080p@30fps, 720p@60fps |
| FOV | 62.2 x 48.8 degrees |
| Focal Length | 3.04mm (fixed focus) |
| Aperture | f/2.0 |
| Price | ~$25 |

**Suitable scenarios**: Education, lightweight vision, low-cost robot prototypes.

```bash
# Using libcamera on Raspberry Pi / Jetson
libcamera-still -o test.jpg --width 1920 --height 1080

# Using GStreamer for capture
gst-launch-1.0 nvarguscamerasrc ! \
    'video/x-raw(memory:NVMM), width=1920, height=1080, framerate=30/1' ! \
    nvvidconv ! videoconvert ! autovideosink
```

### IMX477 (Raspberry Pi HQ Camera)

| Parameter | Value |
|-----------|-------|
| Sensor | Sony IMX477 |
| Resolution | 4056 x 3040 (12.3MP) |
| Pixel Size | 1.55um x 1.55um |
| Sensor Size | 1/2.3" (6.29 x 4.71mm) |
| Shutter | Rolling shutter |
| Interface | CSI-2 (2 lanes) |
| Frame Rate | 12.3MP@10fps, 1080p@50fps |
| Lens Mount | C/CS-mount (interchangeable lenses) |
| Price | ~$50 |

**Advantage**: Interchangeable lenses, suitable for scenarios requiring different focal lengths.

| Companion Lens | Focal Length | FOV | Use |
|---------------|-------------|-----|-----|
| Wide-angle lens | 6mm | 63 degrees | Navigation, SLAM |
| Telephoto lens | 16mm | 24 degrees | Long-range recognition |
| Fisheye lens | 2.5mm | 140 degrees | Panoramic perception |

### USB Cameras

#### Logitech C920

| Parameter | Value |
|-----------|-------|
| Resolution | 1080p @30fps |
| Encoding | H.264 hardware encoding |
| Interface | USB 2.0 |
| FOV | 78 degrees |
| Autofocus | Yes |
| Microphone | Dual stereo microphones |
| Price | ~$60 |

```python
# OpenCV reading USB camera
import cv2

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
cap.set(cv2.CAP_PROP_FPS, 30)
# Disable autofocus (SLAM requires fixed focus)
cap.set(cv2.CAP_PROP_AUTOFOCUS, 0)
cap.set(cv2.CAP_PROP_FOCUS, 0)  # Focus to infinity

while True:
    ret, frame = cap.read()
    if not ret:
        break
    cv2.imshow('Camera', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
```

#### ELP USB Camera Modules

| Model | Sensor | Resolution | Shutter | FOV | Price |
|-------|--------|-----------|---------|-----|-------|
| ELP-USB8MP | IMX179 | 8MP | Rolling | 75 degrees | $30 |
| ELP-USBFHD01M | AR0230 | 1080p | Rolling | 100 degrees | $35 |
| ELP-USB1MP | OV9281 | 1MP | Global | 70 degrees | $40 |

### Arducam Camera Series

Arducam offers various embedded camera solutions:

| Model | Sensor | Interface | Highlight |
|-------|--------|-----------|-----------|
| Arducam IMX219 | IMX219 | CSI | RPi compatible, multiple FOV options |
| Arducam IMX477 | IMX477 | CSI | M12 lens mount |
| Arducam OV9281 | OV9281 | CSI/USB | Global shutter, preferred for VIO |
| Arducam Stereo | IMX219x2 | CSI | Stereo camera module |

## CSI vs. USB Comparison

| Feature | CSI-2 | USB 2.0 | USB 3.0 |
|---------|-------|---------|---------|
| Bandwidth | 2.5Gbps/lane x4 = 10Gbps | 480Mbps | 5Gbps |
| Latency | <1ms | ~30ms | ~10ms |
| CPU Usage | Very low (ISP hardware) | Medium (software decoding) | Medium |
| Cable Length | <30cm (FPC ribbon) | <5m | <3m |
| Plug-and-Play | No (requires adaptation) | Yes (UVC standard) | Yes |
| Multi-Camera | One per CSI port | Multiple via Hub | Multiple via Hub |
| Programming API | libargus / nvarguscamerasrc | V4L2 / OpenCV | V4L2 / OpenCV |

!!! tip "Selection Advice"
    - **CSI**: Fixed installations requiring low latency and high frame rate (e.g., SLAM)
    - **USB**: Scenarios requiring flexibility, plug-and-play, and long cables

## Image Quality Parameters

### Signal-to-Noise Ratio (SNR)

$$
\text{SNR} = 20 \log_{10}\frac{S}{N} \quad \text{(dB)}
$$

Where $S$ is the signal level and $N$ is the noise level.

Influencing factors:

- **Pixel size**: Larger pixels -> higher SNR (more photons per pixel)
- **Exposure time**: Longer exposure -> higher SNR (but may cause motion blur)
- **ISO/Gain**: Higher gain -> lower SNR (noise is amplified)

### Dynamic Range

$$
\text{Dynamic Range} = 20 \log_{10}\frac{V_{\text{sat}}}{V_{\text{noise}}} \quad \text{(dB)}
$$

| Sensor | Dynamic Range | Notes |
|--------|--------------|-------|
| Standard CMOS | ~60dB | Sufficient indoors |
| HDR Sensor | ~100dB | Outdoor bright/dark contrast |
| Human Eye | ~120dB | Reference |

### Common Image Problems and Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Motion blur | Exposure time too long | Shorten exposure, use global shutter |
| Noise | Low light, high gain | Denoising algorithms, larger pixel sensor |
| Over/under exposure | Inaccurate auto-exposure | Manual exposure, HDR |
| Color deviation | Inaccurate white balance | Manual white balance, color correction |
| Lens distortion | Wide-angle lens | Calibration + undistortion |
| Unstable frame rate | Insufficient USB bandwidth | Lower resolution, switch to CSI |

## Camera Parameter Configuration

### Manual Exposure Control

```python
import cv2

cap = cv2.VideoCapture(0)

# Disable auto exposure
cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 1)  # 1=manual, 3=auto
cap.set(cv2.CAP_PROP_EXPOSURE, -6)       # Exposure value (log scale)

# Disable auto white balance
cap.set(cv2.CAP_PROP_AUTO_WB, 0)
cap.set(cv2.CAP_PROP_WB_TEMPERATURE, 5000)  # Color temperature 5000K

# Set gain
cap.set(cv2.CAP_PROP_GAIN, 0)  # Minimum gain
```

### Jetson CSI Camera Control

```python
# GStreamer pipeline for Jetson with manual exposure
import cv2

gst_str = (
    'nvarguscamerasrc sensor-id=0 '
    'exposuretimerange="5000000 10000000" '  # 5-10ms exposure
    'gainrange="1.0 2.0" '                    # Gain range
    'ispdigitalgainrange="1 1" '              # Digital gain
    'wbmode=0 '                               # Manual white balance
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

## Common Camera Specifications Comparison

| Camera | Sensor | Resolution | Shutter | Interface | FOV | FPS | Price | Recommended Scenario |
|--------|--------|-----------|---------|-----------|-----|-----|-------|---------------------|
| RPi Camera V2 | IMX219 | 8MP | Rolling | CSI | 62 degrees | 1080p@30 | $25 | Education/entry |
| RPi HQ Camera | IMX477 | 12.3MP | Rolling | CSI | Interchangeable | 1080p@50 | $50 | Multi-purpose |
| Logitech C920 | - | 2MP | Rolling | USB2.0 | 78 degrees | 1080p@30 | $60 | General use |
| Arducam OV9281 | OV9281 | 1MP | Global | CSI/USB | 70 degrees | 720p@120 | $40 | VIO/SLAM |
| ELP AR0230 | AR0230 | 2MP | Rolling | USB | 100 degrees | 1080p@30 | $35 | Wide-angle navigation |
| FLIR BFS | IMX264 | 5MP | Global | USB3.0 | Interchangeable | 5MP@24 | $500 | Industrial vision |

## Summary

1. **CMOS sensors** acquire color images through Bayer color filter arrays
2. **Global shutter** eliminates motion distortion and is critical for VIO and SLAM
3. **Pixel size** directly affects low-light performance and SNR
4. **CSI interface** has the lowest latency and does not burden the CPU, ideal for embedded systems
5. **USB cameras** are convenient and flexible, suitable for rapid prototyping
6. Select appropriate resolution, frame rate, and lens based on task requirements

## References

- Sony Semiconductor Solutions: IMX Series Datasheets
- Raspberry Pi Camera Documentation: [https://www.raspberrypi.com/documentation/accessories/camera.html](https://www.raspberrypi.com/documentation/accessories/camera.html)
- V4L2 API Documentation: [https://www.kernel.org/doc/html/latest/userspace-api/media/v4l/v4l2.html](https://www.kernel.org/doc/html/latest/userspace-api/media/v4l/v4l2.html)
