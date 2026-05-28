# ADC / DAC — 模拟数字转换

> *ADC (Analog-to-Digital Converter) 把连续 voltage → 离散数字;DAC 反之。是 sensors / audio / DSP / control 的桥梁。*
>
> **难度**:Intermediate
> **前置知识**:[Op-Amp](Op_Amp.md)、[信号处理](../00_Foundations/Signal_Processing.md)

---

## 1. ADC 关键参数

- **Resolution (bits)**: 8 / 10 / 12 / 16 / 24
- **Sampling rate**: kSPS / MSPS / GSPS
- **Input range**: 0-VDD / ±10V / 4-20mA
- **SNR / SINAD / ENOB**
- **Linearity (DNL / INL)**
- **Latency / throughput**

---

## 2. ADC 拓扑

### 2.1 SAR (Successive Approximation)

- Binary search,12-18 bit, < 10 MSPS
- 主流 MCU 内置

### 2.2 Σ-Δ (Sigma-Delta)

- 高 oversampling + decimation
- 16-32 bit, 低速 (kSPS)
- 用 audio, weighing scale

### 2.3 Flash (并行)

- N-bit 需 $2^N - 1$ comparator
- < 8 bit, 极快 (> 1 GSPS)
- 用 SDR, 数字示波器

### 2.4 Pipeline

- 多级 SAR-like 串接
- 10-16 bit, 100-500 MSPS
- 中端高速

### 2.5 Time-Interleaved

- 多 ADC 并 → effective rate 翻倍
- 极高速 (10 GSPS+)

---

## 3. Nyquist 与 oversampling

- Nyquist: $f_s \ge 2 f_{max}$
- Oversampling: $f_s \gg 2 f_{max}$ → SNR 提高,可降噪 + decimation

---

## 4. DAC 拓扑

### 4.1 Resistor String

- 简单,慢 (kSPS)

### 4.2 R-2R Ladder

- 中速,12-16 bit

### 4.3 Current Steering

- 高速 (GSPS)
- 用 SDR, video

### 4.4 PWM + LPF

- MCU 用 PWM 模拟 DAC
- 滤波器决定带宽

---

## 5. PyTorch / Python — 简化 SAR ADC

```python
def sar_adc(v_input, v_ref=3.3, n_bits=12):
    """Successive Approximation."""
    result = 0
    test_value = v_ref / 2
    step = v_ref / 4
    for bit in range(n_bits - 1, -1, -1):
        if v_input >= test_value:
            result |= (1 << bit)
            test_value += step
        else:
            test_value -= step
        step /= 2
    return result

# Example
v = 1.5
code = sar_adc(v, v_ref=3.3, n_bits=12)
print(f"{v}V → {code} (max {2**12-1})")
```

---

## 6. 选 ADC

| 应用 | ADC type | 典型 |
|---|---|---|
| MCU general | SAR | STM32 12-bit, 2 MSPS |
| Audio | Σ-Δ | ADC1810 24-bit, 192 kHz |
| Communication | Pipeline | AD9434 12-bit, 500 MSPS |
| Oscilloscope | Flash / TI | 8-bit, 10 GSPS |
| Industrial DAQ | Σ-Δ | ADS131M08 24-bit |
| Weighing scale | Σ-Δ | HX711 24-bit |

---

## 7. 实际应用

- Audio: 24-bit 192 kHz
- Camera: 12-bit per pixel (CIS chip 内置 ADC)
- ECG: 24-bit, 1 kSPS
- SDR: 16-bit, 100 MSPS
- Motor control: 12-bit, 20 kSPS

---

## 8. 噪声 / EMC

ADC 是模拟 → 数字 boundary,极敏感:
- Power supply noise → spurs in spectrum
- Ground bounce
- 模拟 / 数字 ground 分开
- Bypass capacitor 必备
- Shielded PCB layout

---

## 9. Common Pitfalls

### 9.1 Aliasing

ADC 前必有 anti-alias LPF。

### 9.2 Quantization noise

$q = V_{ref} / 2^N$ → noise floor = $q / \sqrt{12}$。

### 9.3 Input impedance

ADC input impedance 与 source 不匹配 → settling error。

### 9.4 Reference voltage

参考 voltage 抖动 → 精度损。需 low-noise reference (e.g. LM4040)。

### 9.5 DC offset

Offset 误差累积;需 chopper / auto-zero。

---

## 10. Related Concepts

- **同节**:[Op-Amp](Op_Amp.md)
- **应用**:[信号处理](../00_Foundations/Signal_Processing.md)、[Sensors](../05_Sensors_Perception/index.md)

---

## References

1. **Kester, W.** *The Data Conversion Handbook*. Analog Devices, 2005.
2. **Razavi, B.** *Principles of Data Conversion System Design*. Wiley-IEEE, 1995.
3. TI / ADI / Linear ADC datasheets.
