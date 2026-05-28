# LED指示与声音

## 概述

LED指示灯和声音反馈是机器人最基础也最直接的人机交互手段。即使没有显示屏，通过LED颜色/闪烁模式和声音提示，操作者也能快速了解机器人的运行状态。

## 单LED状态指示

### 基本GPIO控制

最简单的状态指示是用GPIO直接驱动单色LED：

```cpp
// Arduino - LED闪烁
#define LED_PIN 13

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(500);
}
```

### 电路设计

LED需要串联限流电阻：

$$R = \frac{V_{supply} - V_{LED}}{I_{LED}}$$

| LED颜色 | 正向电压 $V_{LED}$ | 推荐电流 | 3.3V时电阻 | 5V时电阻 |
|---------|-------------------|---------|-----------|---------|
| 红 | 1.8-2.2V | 10mA | 150Ω | 330Ω |
| 绿 | 2.0-2.4V | 10mA | 100Ω | 270Ω |
| 蓝 | 2.8-3.4V | 10mA | — | 180Ω |
| 白 | 2.8-3.4V | 10mA | — | 180Ω |
| 黄 | 1.8-2.2V | 10mA | 150Ω | 330Ω |

### 闪烁模式编码

通过不同的闪烁模式传递不同信息：

| 模式 | 实现 | 含义建议 |
|------|------|---------|
| 常亮 | HIGH | 系统就绪 |
| 慢闪 (1Hz) | 500ms ON/OFF | 正常运行 |
| 快闪 (4Hz) | 125ms ON/OFF | 警告/注意 |
| 极快闪 (8Hz) | 62ms ON/OFF | 错误/紧急 |
| 呼吸灯 | PWM渐变 | 待机/空闲 |
| 双闪 | 闪闪-停-闪闪 | 通信中 |

```cpp
// Arduino - 呼吸灯效果
void breathe(int pin, int period_ms) {
    for (int i = 0; i < 256; i++) {
        analogWrite(pin, i);
        delay(period_ms / 512);
    }
    for (int i = 255; i >= 0; i--) {
        analogWrite(pin, i);
        delay(period_ms / 512);
    }
}
```

## WS2812B / SK6812 可寻址RGB LED

### 概述

WS2812B（NeoPixel）是最流行的可寻址RGB LED，每个LED内置控制IC，通过单线串行协议级联控制。

| 参数 | WS2812B | SK6812 (RGBW) |
|------|---------|---------------|
| LED数 | RGB 3色 | RGBW 4色 |
| 数据协议 | 单线 800kHz | 单线 800kHz |
| 电压 | 5V | 5V |
| 单颗电流 | 60mA (全白) | 80mA (全白) |
| 数据引脚 | 仅需1个GPIO | 仅需1个GPIO |

### 接线

```
MCU GPIO --> [330Ω] --> DIN (第1颗LED)
5V电源 --> VCC (LED灯带)
GND --> GND (共地)
```

**注意事项**：

- 数据线串联330Ω电阻防止信号反射
- 电源线并联1000μF电容防止上电浪涌
- 每30颗LED补充一次电源线
- 每颗LED全白约60mA，30颗 = 1.8A，需要足够的电源

### Arduino驱动（Adafruit NeoPixel）

```cpp
#include <Adafruit_NeoPixel.h>

#define LED_PIN   6
#define NUM_LEDS  16

Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
    strip.begin();
    strip.setBrightness(50);  // 0-255
    strip.show();
}

void setAllColor(uint32_t color) {
    for (int i = 0; i < NUM_LEDS; i++) {
        strip.setPixelColor(i, color);
    }
    strip.show();
}

void loop() {
    // 绿色 - 正常
    setAllColor(strip.Color(0, 255, 0));
    delay(2000);
    // 黄色 - 警告
    setAllColor(strip.Color(255, 255, 0));
    delay(2000);
    // 红色 - 错误
    setAllColor(strip.Color(255, 0, 0));
    delay(2000);
}
```

### Python驱动（树莓派 rpi_ws281x）

```python
from rpi_ws281x import PixelStrip, Color
import time

LED_COUNT = 16
LED_PIN = 18  # GPIO18 (PWM0)
LED_BRIGHTNESS = 50

strip = PixelStrip(LED_COUNT, LED_PIN, brightness=LED_BRIGHTNESS)
strip.begin()

def set_all(strip, color):
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.show()

def rainbow_cycle(strip, wait_ms=20):
    """彩虹循环效果"""
    for j in range(256):
        for i in range(strip.numPixels()):
            pixel_index = (i * 256 // strip.numPixels()) + j
            r = ((pixel_index * 3) % 256)
            g = ((pixel_index * 3 + 85) % 256)
            b = ((pixel_index * 3 + 170) % 256)
            strip.setPixelColor(i, Color(r, g, b))
        strip.show()
        time.sleep(wait_ms / 1000.0)

# 状态指示
set_all(strip, Color(0, 255, 0))   # 绿色 = 就绪
```

### LED灯效设计方案

| 机器人状态 | LED效果 | 颜色 |
|-----------|---------|------|
| 启动中 | 蓝色逐个点亮 | 蓝 |
| 就绪/待机 | 绿色呼吸 | 绿 |
| 自主导航中 | 蓝色流水灯 | 蓝 |
| 接收指令 | 白色闪烁 | 白 |
| 低电量 | 橙色慢闪 | 橙 |
| 充电中 | 绿色从低到高渐变 | 绿 |
| 错误 | 红色快闪 | 红 |
| 紧急停止 | 红色常亮 | 红 |

## 蜂鸣器

### 被动蜂鸣器 vs 主动蜂鸣器

| 特性 | 被动蜂鸣器 | 主动蜂鸣器 |
|------|-----------|-----------|
| 内部振荡器 | 无 | 有 |
| 驱动方式 | PWM方波 | 高低电平 |
| 音调控制 | 可变频率 | 固定频率 |
| 音乐播放 | 可以 | 不可以 |
| 使用难度 | 稍复杂 | 简单 |
| 价格 | $0.3 | $0.5 |

### Arduino蜂鸣器音调

```cpp
#define BUZZER_PIN 8

// 音符频率定义
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523

void playStartupSound() {
    tone(BUZZER_PIN, NOTE_C4, 150);
    delay(200);
    tone(BUZZER_PIN, NOTE_E4, 150);
    delay(200);
    tone(BUZZER_PIN, NOTE_G4, 150);
    delay(200);
    tone(BUZZER_PIN, NOTE_C5, 300);
    delay(400);
    noTone(BUZZER_PIN);
}

void playErrorSound() {
    for (int i = 0; i < 3; i++) {
        tone(BUZZER_PIN, 1000, 100);
        delay(200);
    }
    noTone(BUZZER_PIN);
}
```

## DFPlayer Mini（MP3播放）

DFPlayer Mini 是一个微型MP3播放模块，可以播放SD卡上的音频文件。

| 参数 | 数值 |
|------|------|
| 支持格式 | MP3, WAV |
| 存储 | MicroSD卡 (最大32GB) |
| 接口 | UART (9600bps) |
| 输出功率 | 3W (8Ω扬声器) |
| 工作电压 | 3.2-5.0V |
| 价格 | ~$3 |

### 接线与使用

```
MCU TX --> [1kΩ] --> RX (DFPlayer)
MCU RX <----------  TX (DFPlayer)
SPK+ -----> 扬声器 (+)
SPK- -----> 扬声器 (-)
VCC ------> 5V
GND ------> GND
```

```cpp
#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>

SoftwareSerial mySoftwareSerial(10, 11); // RX, TX
DFRobotDFPlayerMini myDFPlayer;

void setup() {
    mySoftwareSerial.begin(9600);
    myDFPlayer.begin(mySoftwareSerial);
    myDFPlayer.volume(20);  // 0-30
}

void playSound(int track) {
    myDFPlayer.play(track);  // 播放SD卡上的第N个文件
}
```

SD卡文件命名：`001.mp3`, `002.mp3`, ...

## I2S音频（MAX98357）

MAX98357 是一个I2S接口的D类功放模块，适合与ESP32/树莓派配合使用。

| 参数 | 数值 |
|------|------|
| 接口 | I2S |
| 输出功率 | 3.2W (4Ω) |
| 采样率 | 8-96kHz |
| 位深 | 16/32bit |
| 电压 | 2.5-5.5V |
| 价格 | ~$5 |

### ESP32 + MAX98357 播放音频

```cpp
#include <driver/i2s.h>

#define I2S_BCK  26
#define I2S_WS   25
#define I2S_DATA 22

void setupI2S() {
    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
        .sample_rate = 44100,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .dma_buf_count = 8,
        .dma_buf_len = 64,
    };
    i2s_pin_config_t pin_config = {
        .bck_io_num = I2S_BCK,
        .ws_io_num = I2S_WS,
        .data_out_num = I2S_DATA,
        .data_in_num = I2S_PIN_NO_CHANGE,
    };
    i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_NUM_0, &pin_config);
}
```

## Jetson 语音合成（TTS）

在Jetson等Linux SBC上可以使用TTS（Text-to-Speech）实现语音播报：

### pyttsx3（离线TTS）

```python
import pyttsx3

engine = pyttsx3.init()
engine.setProperty('rate', 150)     # 语速
engine.setProperty('volume', 0.9)   # 音量

engine.say("机器人已启动，系统正常")
engine.runAndWait()
```

### gTTS + pygame（在线TTS）

```python
from gtts import gTTS
import pygame
import io

def speak(text, lang='zh-cn'):
    tts = gTTS(text=text, lang=lang)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    
    pygame.mixer.init()
    pygame.mixer.music.load(fp)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pass

speak("电池电量低于百分之二十，请及时充电")
```

### espeak（轻量离线方案）

```bash
# 安装
sudo apt install espeak

# 使用
espeak -v zh "机器人启动完成"
espeak -v en "Robot ready"
```

## 音效设计建议

| 事件 | 音效类型 | 持续时间 | 示例 |
|------|---------|---------|------|
| 开机 | 上升音阶 | 1-2s | Do-Mi-Sol-Do' |
| 关机 | 下降音阶 | 1-2s | Do'-Sol-Mi-Do |
| 确认操作 | 短促单音 | 0.1s | "Ding" |
| 警告 | 双短音 | 0.5s | "Di-Di" |
| 错误 | 低沉三连音 | 0.6s | "Du-Du-Du" |
| 导航开始 | 欢快短曲 | 1s | 上升三连音 |
| 到达目标 | 完成提示音 | 0.5s | "Da-Ding!" |
| 低电量 | 缓慢重复低音 | 循环 | 每30秒一次 |

## 参考资源

- Adafruit NeoPixel Uberguide
- DFPlayer Mini Wiki
- MAX98357 Datasheet (Maxim)
- LVGL LED/Arc widgets
- pyttsx3 Documentation
