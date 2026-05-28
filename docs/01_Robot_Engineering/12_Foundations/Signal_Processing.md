# 信号处理 (Signal Processing) — 工程基础

> *信号处理是机器人 / 通信 / 控制 / 测量等几乎所有工程领域的基础。从模拟到数字、连续到离散、时域到频域。本篇覆盖采样定理、Fourier 变换、滤波器设计、FFT — 工程师每天都用的工具。*
>
> **难度**:Intermediate
> **前置知识**:微积分、复数、线性代数
> **后续阅读**:[控制理论](Control_Theory.md)、[CAN 总线](../08_Communication_Networks/CAN总线.md)

---

## 1. 信号基本概念

### 1.1 连续 vs 离散

- **连续信号**: $x(t), t \in \mathbb{R}$
- **离散信号**: $x[n], n \in \mathbb{Z}$

### 1.2 采样

ADC 把连续 $x(t)$ 转为 $x[n] = x(nT_s)$,$T_s$ = 采样周期。

### 1.3 Nyquist 采样定理

If 信号最高频率 $f_{max}$,需 $f_s \ge 2 f_{max}$ (Nyquist rate)。
否则 → **aliasing** (混叠),高频伪装成低频。

```python
import numpy as np
fs = 1000  # 采样率 1 kHz
t = np.linspace(0, 1, fs)
# 信号: 50 Hz sin + 200 Hz sin
x = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*200*t)
# 注意 fs=1000 > 2 × 200 ✓
```

---

## 2. Fourier 变换

### 2.1 连续 Fourier 变换

$$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j 2\pi f t} dt$$

$$x(t) = \int_{-\infty}^{\infty} X(f) e^{j 2\pi f t} df$$

### 2.2 离散 Fourier 变换 (DFT)

$$X[k] = \sum_{n=0}^{N-1} x[n] e^{-j 2\pi k n / N}, \quad k = 0, ..., N-1$$

### 2.3 Fast Fourier Transform (FFT)

DFT 直接计算 $O(N^2)$;FFT 用 divide-and-conquer 降到 $O(N \log N)$。
Cooley-Tukey 1965。

```python
import numpy as np
N = 1024
x = np.random.randn(N)
X = np.fft.fft(x)  # ~ 10 μs
freqs = np.fft.fftfreq(N, d=1/fs)
```

---

## 3. 滤波器

### 3.1 类型

- **Low-pass (LPF)**: 让低频通过,阻高频
- **High-pass (HPF)**: 反之
- **Band-pass (BPF)**: 让某区间通过
- **Band-stop / Notch**: 阻某区间 (e.g. 60 Hz 工频干扰)

### 3.2 模拟 vs 数字

- 模拟: RC / RL / RLC 电路
- 数字: FIR / IIR 滤波器

### 3.3 FIR 滤波器

$$y[n] = \sum_{k=0}^{M-1} h[k] x[n-k]$$

- Linear phase (无失真)
- Always stable
- 需要 M tap

### 3.4 IIR 滤波器

$$y[n] = \sum_{k=0}^{M-1} b[k] x[n-k] - \sum_{k=1}^{N} a[k] y[n-k]$$

- 短 tap 实现 sharp roll-off
- 可能不稳定
- Phase 失真

---

## 4. 经典滤波器设计

### 4.1 Butterworth

- 最平坦 passband
- Roll-off 中等
- 常用 LPF

```python
from scipy import signal
b, a = signal.butter(4, 100, fs=1000, btype='low')
# 4th order, 100 Hz cutoff, fs=1000
y = signal.filtfilt(b, a, x)  # zero-phase filter
```

### 4.2 Chebyshev

- 更 sharp roll-off
- Passband ripple
- 接受 ripple 换更陡过渡带

### 4.3 Bessel

- 最 linear phase
- 适合保留时域波形 (e.g. 心电信号)

### 4.4 Elliptic

- 最 sharp,但 passband + stopband 都有 ripple

---

## 5. 工程实践案例

### 5.1 60 Hz 工频抑制 (Notch)

```python
b, a = signal.iirnotch(60, Q=30, fs=1000)
y_clean = signal.filtfilt(b, a, ecg_signal)
```

### 5.2 加速度计 LPF

IMU 输出加速度有高频噪声 → 100 Hz LPF。

### 5.3 LiDAR 后处理

点云去噪用 Statistical Outlier Removal + Voxel grid (空间滤波)。

### 5.4 控制系统 anti-aliasing

DAC 输出前 LPF 平滑 stepwise output。

---

## 6. PyTorch / NumPy — Spectrum 分析

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 1000  # 1 kHz
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*200*t)
x_noisy = x + 0.5*np.random.randn(len(t))

# Spectrum
X = np.fft.fft(x_noisy)
freqs = np.fft.fftfreq(len(t), d=1/fs)
plt.plot(freqs[:len(t)//2], np.abs(X[:len(t)//2]))
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
```

---

## 7. 时频分析

- **STFT (Short-Time FT)**: 窗口 FFT,时频图
- **Wavelet**: 多分辨率,适合 transient signals
- **Spectrogram**: STFT visualization

```python
f, t_seg, Sxx = signal.spectrogram(x_noisy, fs)
plt.pcolormesh(t_seg, f, Sxx)
```

---

## 8. 应用

- **通信**: FM/AM modulation, OFDM (5G)
- **音频**: MP3 codec, noise cancel
- **图像**: JPEG (DCT), low-pass blur
- **生物医学**: ECG/EEG/EMG 处理
- **机器人**: sensor fusion, control filter
- **雷达**: pulse compression, Doppler

---

## 9. 数字 vs 模拟 trade-off

| 维度 | Analog | Digital |
|---|---|---|
| Power | 低 | 高 (CPU/DSP) |
| Flexibility | 固定 | 可程改 |
| Precision | 部件容差 | 量化噪声 (bit depth) |
| Cost | 低 (passive) | 高 (DSP / FPGA) |
| Latency | 极低 (ns) | 取决于算法 |

---

## 10. Common Pitfalls

### 10.1 Anti-aliasing 必需

ADC 前必须有 LPF 阻 > fs/2 频率。

### 10.2 Filter delay

IIR 有 phase delay,实时控制需 careful 选 group delay 低的 filter。

### 10.3 Quantization error

ADC bit depth (8-24 bit) 决定底噪。

### 10.4 Window 选择

FFT 窗口 (Hanning / Hamming / Blackman) 影响 spectral leakage。

### 10.5 Off-line vs real-time

filtfilt (双向 zero-phase) 仅 off-line 用;real-time 用单向 lfilter。

---

## 11. Related Concepts

- **通信**:[CAN 总线](../08_Communication_Networks/CAN总线.md)
- **传感器**:[IMU](../05_Sensors_Perception/03_IMU_Navigation/index.md)、[Cameras](../05_Sensors_Perception/01_Cameras/index.md)

---

## References

1. **Oppenheim, A. V. & Schafer, R. W.** *Discrete-Time Signal Processing*. 3rd ed., Prentice Hall, 2009.
2. **Lyons, R.** *Understanding Digital Signal Processing*. 3rd ed., 2010.
3. **Cooley, J. W. & Tukey, J. W.** "An Algorithm for the Machine Calculation of Complex Fourier Series." *Math Comp*, 1965.
4. **SciPy Signal documentation** — https://docs.scipy.org/doc/scipy/reference/signal.html
