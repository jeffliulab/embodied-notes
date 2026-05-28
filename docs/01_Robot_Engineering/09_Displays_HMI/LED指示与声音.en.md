# LED Indicators and Sound

## Overview

LED indicators and sound feedback are the most fundamental and direct means of human-machine interaction for robots. Even without a display, operators can quickly understand a robot's operating status through LED colors/blink patterns and audio cues.

## Single LED Status Indication

### Basic GPIO Control

The simplest status indication uses GPIO to directly drive a single-color LED:

```cpp
// Arduino - LED blink
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

### Circuit Design

LEDs require a series current-limiting resistor:

$$R = \frac{V_{supply} - V_{LED}}{I_{LED}}$$

| LED Color | Forward Voltage $V_{LED}$ | Recommended Current | Resistor at 3.3V | Resistor at 5V |
|---------|-------------------|---------|-----------|---------|
| Red | 1.8-2.2V | 10mA | 150Ω | 330Ω |
| Green | 2.0-2.4V | 10mA | 100Ω | 270Ω |
| Blue | 2.8-3.4V | 10mA | — | 180Ω |
| White | 2.8-3.4V | 10mA | — | 180Ω |
| Yellow | 1.8-2.2V | 10mA | 150Ω | 330Ω |

### Blink Pattern Encoding

Different blink patterns convey different information:

| Pattern | Implementation | Suggested Meaning |
|------|------|---------|
| Solid ON | HIGH | System ready |
| Slow blink (1Hz) | 500ms ON/OFF | Normal operation |
| Fast blink (4Hz) | 125ms ON/OFF | Warning/Attention |
| Very fast blink (8Hz) | 62ms ON/OFF | Error/Emergency |
| Breathing | PWM fade | Standby/Idle |
| Double blink | Blink-blink-pause-blink-blink | Communicating |

```cpp
// Arduino - Breathing LED effect
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

## WS2812B / SK6812 Addressable RGB LEDs

### Overview

WS2812B (NeoPixel) is the most popular addressable RGB LED, with each LED containing a built-in control IC, daisy-chained via a single-wire serial protocol.

| Parameter | WS2812B | SK6812 (RGBW) |
|------|---------|---------------|
| LED Channels | RGB 3 colors | RGBW 4 colors |
| Data Protocol | Single-wire 800kHz | Single-wire 800kHz |
| Voltage | 5V | 5V |
| Current per LED | 60mA (full white) | 80mA (full white) |
| Data Pin | Only 1 GPIO needed | Only 1 GPIO needed |

### Wiring

```
MCU GPIO --> [330Ω] --> DIN (1st LED)
5V Power --> VCC (LED strip)
GND --> GND (common ground)
```

**Important Notes**:

- Series 330Ω resistor on data line to prevent signal reflection
- Parallel 1000μF capacitor on power line to prevent inrush current
- Supplement power lines every 30 LEDs
- Each LED draws ~60mA at full white; 30 LEDs = 1.8A, ensure adequate power supply

### Arduino Driver (Adafruit NeoPixel)

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
    // Green - Normal
    setAllColor(strip.Color(0, 255, 0));
    delay(2000);
    // Yellow - Warning
    setAllColor(strip.Color(255, 255, 0));
    delay(2000);
    // Red - Error
    setAllColor(strip.Color(255, 0, 0));
    delay(2000);
}
```

### Python Driver (Raspberry Pi rpi_ws281x)

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
    """Rainbow cycle effect"""
    for j in range(256):
        for i in range(strip.numPixels()):
            pixel_index = (i * 256 // strip.numPixels()) + j
            r = ((pixel_index * 3) % 256)
            g = ((pixel_index * 3 + 85) % 256)
            b = ((pixel_index * 3 + 170) % 256)
            strip.setPixelColor(i, Color(r, g, b))
        strip.show()
        time.sleep(wait_ms / 1000.0)

# Status indication
set_all(strip, Color(0, 255, 0))   # Green = Ready
```

### LED Effect Design Patterns

| Robot State | LED Effect | Color |
|-----------|---------|------|
| Booting | Blue sequential light-up | Blue |
| Ready/Standby | Green breathing | Green |
| Autonomous navigation | Blue flowing light | Blue |
| Receiving command | White flash | White |
| Low battery | Orange slow blink | Orange |
| Charging | Green low-to-high gradient | Green |
| Error | Red fast blink | Red |
| Emergency stop | Red solid | Red |

## Buzzers

### Passive Buzzer vs. Active Buzzer

| Feature | Passive Buzzer | Active Buzzer |
|------|-----------|-----------|
| Internal Oscillator | None | Yes |
| Drive Method | PWM square wave | High/Low level |
| Tone Control | Variable frequency | Fixed frequency |
| Music Playback | Possible | Not possible |
| Difficulty | Slightly complex | Simple |
| Price | $0.3 | $0.5 |

### Arduino Buzzer Tones

```cpp
#define BUZZER_PIN 8

// Note frequency definitions
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

## DFPlayer Mini (MP3 Playback)

The DFPlayer Mini is a miniature MP3 playback module that can play audio files from an SD card.

| Parameter | Value |
|------|------|
| Supported Formats | MP3, WAV |
| Storage | MicroSD card (up to 32GB) |
| Interface | UART (9600bps) |
| Output Power | 3W (8Ω speaker) |
| Operating Voltage | 3.2-5.0V |
| Price | ~$3 |

### Wiring and Usage

```
MCU TX --> [1kΩ] --> RX (DFPlayer)
MCU RX <----------  TX (DFPlayer)
SPK+ -----> Speaker (+)
SPK- -----> Speaker (-)
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
    myDFPlayer.play(track);  // Play the Nth file on SD card
}
```

SD card file naming: `001.mp3`, `002.mp3`, ...

## I2S Audio (MAX98357)

The MAX98357 is an I2S interface Class-D amplifier module, suitable for use with ESP32/Raspberry Pi.

| Parameter | Value |
|------|------|
| Interface | I2S |
| Output Power | 3.2W (4Ω) |
| Sample Rate | 8-96kHz |
| Bit Depth | 16/32bit |
| Voltage | 2.5-5.5V |
| Price | ~$5 |

### ESP32 + MAX98357 Audio Playback

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

## Jetson Text-to-Speech (TTS)

On Linux SBCs such as Jetson, TTS (Text-to-Speech) can be used for voice announcements:

### pyttsx3 (Offline TTS)

```python
import pyttsx3

engine = pyttsx3.init()
engine.setProperty('rate', 150)     # Speech rate
engine.setProperty('volume', 0.9)   # Volume

engine.say("Robot started, system normal")
engine.runAndWait()
```

### gTTS + pygame (Online TTS)

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

speak("Battery level below twenty percent, please charge soon")
```

### espeak (Lightweight Offline Solution)

```bash
# Install
sudo apt install espeak

# Usage
espeak -v zh "机器人启动完成"
espeak -v en "Robot ready"
```

## Sound Effect Design Recommendations

| Event | Sound Type | Duration | Example |
|------|---------|---------|------|
| Power on | Ascending scale | 1-2s | Do-Mi-Sol-Do' |
| Power off | Descending scale | 1-2s | Do'-Sol-Mi-Do |
| Confirm action | Short single tone | 0.1s | "Ding" |
| Warning | Double short tone | 0.5s | "Di-Di" |
| Error | Low triple tone | 0.6s | "Du-Du-Du" |
| Navigation start | Cheerful short melody | 1s | Ascending triplet |
| Reached target | Completion chime | 0.5s | "Da-Ding!" |
| Low battery | Slow repeating low tone | Loop | Every 30 seconds |

## References

- Adafruit NeoPixel Uberguide
- DFPlayer Mini Wiki
- MAX98357 Datasheet (Maxim)
- LVGL LED/Arc widgets
- pyttsx3 Documentation
