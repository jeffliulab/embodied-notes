# ADC / DAC — Analog-Digital Conversion

> *ADC (Analog-to-Digital Converter) converts continuous voltage → discrete digital; DAC the reverse. Bridge for sensors / audio / DSP / control.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [Op-Amp](Op_Amp.en.md), [Signal Processing](../00_Foundations/Signal_Processing.en.md)

---

## 1. Key ADC Parameters

- **Resolution (bits)**: 8 / 10 / 12 / 16 / 24
- **Sampling rate**: kSPS / MSPS / GSPS
- **Input range**: 0-VDD / ±10V / 4-20mA
- **SNR / SINAD / ENOB**
- **Linearity (DNL / INL)**
- **Latency / throughput**

---

## 2. ADC Topologies

### 2.1 SAR (Successive Approximation)

- Binary search, 12-18 bit, < 10 MSPS
- Mainstream MCU built-in

### 2.2 Σ-Δ (Sigma-Delta)

- High oversampling + decimation
- 16-32 bit, low speed (kSPS)
- Audio, weighing scale

### 2.3 Flash (parallel)

- N-bit needs $2^N - 1$ comparators
- < 8 bit, very fast (> 1 GSPS)
- SDR, digital oscilloscope

### 2.4 Pipeline

- Multi-stage SAR-like cascade
- 10-16 bit, 100-500 MSPS
- Mid-high speed

### 2.5 Time-Interleaved

- Multiple ADCs in parallel → effective rate doubles
- Very high speed (10 GSPS+)

---

## 3. Nyquist + Oversampling

- Nyquist: $f_s \ge 2 f_{max}$
- Oversampling: $f_s \gg 2 f_{max}$ → SNR improves, noise reducible + decimation

---

## 4. DAC Topologies

### 4.1 Resistor String

- Simple, slow (kSPS)

### 4.2 R-2R Ladder

- Mid-speed, 12-16 bit

### 4.3 Current Steering

- High speed (GSPS)
- SDR, video

### 4.4 PWM + LPF

- MCU uses PWM to simulate DAC
- Filter determines bandwidth

---

## 5. PyTorch / Python — Simplified SAR ADC

```python
def sar_adc(v_input, v_ref=3.3, n_bits=12):
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
```

---

## 6. Choose ADC

| Application | ADC type | Typical |
|---|---|---|
| MCU general | SAR | STM32 12-bit, 2 MSPS |
| Audio | Σ-Δ | ADC1810 24-bit, 192 kHz |
| Communication | Pipeline | AD9434 12-bit, 500 MSPS |
| Oscilloscope | Flash / TI | 8-bit, 10 GSPS |
| Industrial DAQ | Σ-Δ | ADS131M08 24-bit |
| Weighing scale | Σ-Δ | HX711 24-bit |

---

## 7. Real Applications

- Audio: 24-bit 192 kHz
- Camera: 12-bit per pixel
- ECG: 24-bit, 1 kSPS
- SDR: 16-bit, 100 MSPS
- Motor control: 12-bit, 20 kSPS

---

## 8. Noise / EMC

ADC is analog/digital boundary, very sensitive:
- Power supply noise → spurs in spectrum
- Ground bounce
- Separate analog / digital grounds
- Bypass capacitors essential
- Shielded PCB layout

---

## 9. Common Pitfalls

### 9.1 Aliasing

ADC must have anti-alias LPF.

### 9.2 Quantization Noise

$q = V_{ref} / 2^N$ → noise floor = $q / \sqrt{12}$.

### 9.3 Input Impedance

ADC input impedance vs source → settling error.

### 9.4 Reference Voltage

Reference voltage noise → precision loss. Need low-noise reference (e.g. LM4040).

### 9.5 DC Offset

Offset accumulates; need chopper / auto-zero.

---

## 10. Related Concepts

- **Same section**: [Op-Amp](Op_Amp.en.md)
- **Applications**: [Signal Processing](../00_Foundations/Signal_Processing.en.md)

---

## References

1. **Kester, W.** *The Data Conversion Handbook*. Analog Devices, 2005.
2. **Razavi, B.** *Principles of Data Conversion System Design*. Wiley-IEEE, 1995.
3. TI / ADI / Linear ADC datasheets.
