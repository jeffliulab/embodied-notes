# Signal Processing — Engineering Foundation

> *Signal processing underpins nearly every engineering domain — robotics / communications / control / measurement. From analog to digital, continuous to discrete, time to frequency. This article covers sampling theorem, Fourier transform, filter design, FFT — tools engineers use daily.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: calculus, complex numbers, linear algebra
> **Further reading**: [Control Theory](Control_Theory.en.md), [CAN Bus](../08_Communication_Networks/CAN总线.en.md)

---

## 1. Basic Signal Concepts

### 1.1 Continuous vs Discrete

- **Continuous signal**: $x(t), t \in \mathbb{R}$
- **Discrete signal**: $x[n], n \in \mathbb{Z}$

### 1.2 Sampling

ADC converts continuous $x(t)$ to $x[n] = x(nT_s)$, $T_s$ = sample period.

### 1.3 Nyquist Sampling Theorem

If signal max frequency $f_{max}$, need $f_s \ge 2 f_{max}$ (Nyquist rate).
Otherwise → **aliasing**, high frequencies disguised as low.

```python
import numpy as np
fs = 1000  # 1 kHz sample rate
t = np.linspace(0, 1, fs)
x = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*200*t)
# fs=1000 > 2 × 200 ✓
```

---

## 2. Fourier Transform

### 2.1 Continuous Fourier Transform

$$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j 2\pi f t} dt$$

$$x(t) = \int_{-\infty}^{\infty} X(f) e^{j 2\pi f t} df$$

### 2.2 Discrete Fourier Transform (DFT)

$$X[k] = \sum_{n=0}^{N-1} x[n] e^{-j 2\pi k n / N}, \quad k = 0, ..., N-1$$

### 2.3 Fast Fourier Transform (FFT)

Direct DFT is $O(N^2)$; FFT uses divide-and-conquer to $O(N \log N)$.
Cooley-Tukey 1965.

```python
import numpy as np
N = 1024
x = np.random.randn(N)
X = np.fft.fft(x)
freqs = np.fft.fftfreq(N, d=1/fs)
```

---

## 3. Filters

### 3.1 Types

- **Low-pass (LPF)**: pass low, block high
- **High-pass (HPF)**: reverse
- **Band-pass (BPF)**: pass certain band
- **Band-stop / Notch**: block band (e.g. 60 Hz mains interference)

### 3.2 Analog vs Digital

- Analog: RC / RL / RLC circuits
- Digital: FIR / IIR filters

### 3.3 FIR Filter

$$y[n] = \sum_{k=0}^{M-1} h[k] x[n-k]$$

- Linear phase (no distortion)
- Always stable
- Need M taps

### 3.4 IIR Filter

$$y[n] = \sum_{k=0}^{M-1} b[k] x[n-k] - \sum_{k=1}^{N} a[k] y[n-k]$$

- Sharp roll-off with few taps
- May be unstable
- Phase distortion

---

## 4. Classic Filter Designs

### 4.1 Butterworth

- Flattest passband
- Moderate roll-off
- Common LPF

```python
from scipy import signal
b, a = signal.butter(4, 100, fs=1000, btype='low')
y = signal.filtfilt(b, a, x)  # zero-phase
```

### 4.2 Chebyshev

- Sharper roll-off
- Passband ripple
- Accept ripple for steeper transition

### 4.3 Bessel

- Most linear phase
- Suited for time-domain waveform preservation (e.g. ECG)

### 4.4 Elliptic

- Sharpest, but ripple in both passband + stopband

---

## 5. Engineering Cases

### 5.1 60 Hz Mains Suppression (Notch)

```python
b, a = signal.iirnotch(60, Q=30, fs=1000)
y_clean = signal.filtfilt(b, a, ecg_signal)
```

### 5.2 Accelerometer LPF

IMU outputs have high-freq noise → 100 Hz LPF.

### 5.3 LiDAR Post-processing

Point cloud denoising uses Statistical Outlier Removal + Voxel grid (spatial filtering).

### 5.4 Control System Anti-aliasing

LPF DAC output to smooth stepwise.

---

## 6. PyTorch / NumPy — Spectrum Analysis

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 1000
t = np.arange(0, 1, 1/fs)
x = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*200*t)
x_noisy = x + 0.5*np.random.randn(len(t))

X = np.fft.fft(x_noisy)
freqs = np.fft.fftfreq(len(t), d=1/fs)
plt.plot(freqs[:len(t)//2], np.abs(X[:len(t)//2]))
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
```

---

## 7. Time-Frequency Analysis

- **STFT (Short-Time FT)**: windowed FFT, time-freq map
- **Wavelet**: multi-resolution, suited for transients
- **Spectrogram**: STFT visualization

```python
f, t_seg, Sxx = signal.spectrogram(x_noisy, fs)
plt.pcolormesh(t_seg, f, Sxx)
```

---

## 8. Applications

- **Communications**: FM/AM modulation, OFDM (5G)
- **Audio**: MP3 codec, noise cancellation
- **Image**: JPEG (DCT), low-pass blur
- **Biomedical**: ECG/EEG/EMG processing
- **Robotics**: sensor fusion, control filter
- **Radar**: pulse compression, Doppler

---

## 9. Digital vs Analog Trade-offs

| Aspect | Analog | Digital |
|---|---|---|
| Power | Low | High (CPU/DSP) |
| Flexibility | Fixed | Programmable |
| Precision | Component tolerances | Quantization noise (bit depth) |
| Cost | Low (passive) | High (DSP / FPGA) |
| Latency | Ultra low (ns) | Algorithm-dependent |

---

## 10. Common Pitfalls

### 10.1 Anti-aliasing Mandatory

ADC must have LPF blocking > fs/2 frequencies.

### 10.2 Filter Delay

IIR has phase delay; real-time control needs careful low-group-delay filter choice.

### 10.3 Quantization Error

ADC bit depth (8-24 bit) determines noise floor.

### 10.4 Window Choice

FFT windows (Hanning / Hamming / Blackman) affect spectral leakage.

### 10.5 Offline vs Real-time

filtfilt (bidirectional zero-phase) only offline; real-time uses unidirectional lfilter.

---

## 11. Related Concepts

- **Communications**: [CAN Bus](../08_Communication_Networks/CAN总线.en.md)
- **Sensors**: [IMU](../05_Sensors_Perception/03_IMU_Navigation/index.en.md), [Cameras](../05_Sensors_Perception/01_Cameras/index.en.md)

---

## References

1. **Oppenheim, A. V. & Schafer, R. W.** *Discrete-Time Signal Processing*. 3rd ed., Prentice Hall, 2009.
2. **Lyons, R.** *Understanding Digital Signal Processing*. 3rd ed., 2010.
3. **Cooley, J. W. & Tukey, J. W.** "An Algorithm for the Machine Calculation of Complex Fourier Series." *Math Comp*, 1965.
4. **SciPy Signal documentation** — https://docs.scipy.org/doc/scipy/reference/signal.html
