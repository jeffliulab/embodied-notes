# OLED and LCD

## Overview

Displays are the core component of a robot's visual feedback system. From tiny OLEDs to full-color LCD touchscreens, displays of different sizes and technologies are suited for different scenarios. This section introduces commonly used display modules in robotics and their driving methods.

## OLED Displays

### 0.96" SSD1306 OLED

The SSD1306 is the most popular small OLED display module, used in virtually every robotics tutorial.

| Parameter | Value |
|------|------|
| Size | 0.96 inches |
| Resolution | 128×64 pixels |
| Color | Monochrome (White/Blue/Yellow-Blue dual) |
| Interface | I2C (default address 0x3C) or SPI |
| Operating Voltage | 3.3V / 5V |
| Power Consumption | ~20mA (full brightness) |
| Price | ~$3 |

**I2C Wiring**:

| OLED Pin | MCU Pin |
|---------|---------|
| VCC | 3.3V / 5V |
| GND | GND |
| SCL | I2C SCL |
| SDA | I2C SDA |

**Arduino Driver**:

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Robot Status:");
    display.println("Battery: 85%");
    display.println("IP: 192.168.1.100");
    display.display();
}
```

**MicroPython Driver**:

```python
from machine import Pin, I2C
import ssd1306

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 64, i2c)

oled.fill(0)
oled.text("Robot Status", 0, 0)
oled.text("Batt: 85%", 0, 16)
oled.text("192.168.1.100", 0, 32)
oled.show()
```

### 1.3" SH1106 OLED

| Parameter | Value |
|------|------|
| Size | 1.3 inches |
| Resolution | 128×64 pixels |
| Driver IC | SH1106 |
| Interface | I2C / SPI |
| Features | Slightly larger than SSD1306, clearer display |

Note: The SH1106 and SSD1306 have slightly different drivers; use the corresponding library.

### OLED Use Cases

- Displaying IP address (most common for debugging)
- Battery level
- Operating mode
- Sensor data overview
- Simple menus (with buttons)

## TFT LCD Displays

### 2.8" ILI9341 TFT

The ILI9341 is a commonly used driver IC for medium-sized color TFT LCDs.

| Parameter | Value |
|------|------|
| Size | 2.8 inches |
| Resolution | 320×240 pixels |
| Color | 65K colors (RGB565) |
| Interface | SPI (mainstream) / 8-bit parallel |
| Operating Voltage | 3.3V (logic), built-in backlight boost |
| SPI Speed | Up to 40MHz |
| Power Consumption | ~100mA (including backlight) |
| Price | ~$8-12 |

**SPI Wiring**:

| LCD Pin | MCU Pin |
|---------|---------|
| VCC | 3.3V |
| GND | GND |
| CS | GPIO (Chip Select) |
| DC/RS | GPIO (Data/Command) |
| MOSI | SPI MOSI |
| SCK | SPI SCK |
| RST | GPIO (Reset) |
| LED | 3.3V (Backlight) |

### 1.54"/1.69" ST7789 TFT

| Parameter | Value |
|------|------|
| Size | 1.54" / 1.69" |
| Resolution | 240×240 / 240×280 |
| Driver IC | ST7789 |
| Interface | SPI |
| Features | IPS wide angle, vibrant colors, compact |
| Price | ~$5-8 |

Suitable for displaying robot expressions or simple graphical interfaces in tight spaces.

### 3.5" ILI9488 TFT

| Parameter | Value |
|------|------|
| Size | 3.5 inches |
| Resolution | 480×320 pixels |
| Driver IC | ILI9488 |
| Interface | SPI / 8-bit parallel |
| Features | Larger display area, suitable for complex UI |
| Price | ~$12-18 |

## E-Paper Displays

### Waveshare e-Paper

| Model | Size | Resolution | Color | Refresh Time | Price |
|------|------|--------|------|---------|------|
| 1.54" | 1.54 inches | 200×200 | B&W | 2s | ~$10 |
| 2.13" | 2.13 inches | 250×122 | B&W | 2s | ~$12 |
| 2.9" | 2.9 inches | 296×128 | B&W | 2s | ~$15 |
| 4.2" | 4.2 inches | 400×300 | B&W&Red | 15s | ~$25 |

**Features**:

- Retains display content when powered off
- Excellent visibility in bright sunlight
- Slow refresh rate (not suitable for dynamic content)
- Extremely low power consumption (only draws power during refresh)

**Use Cases**: Displaying static information (e.g., robot name, QR code, WiFi password)

## 7" Large Screens

### Raspberry Pi Official 7" DSI Touchscreen

| Parameter | Value |
|------|------|
| Size | 7 inches |
| Resolution | 800×480 |
| Interface | DSI (Raspberry Pi ribbon cable) |
| Touch | 10-point capacitive touch (I2C) |
| Power Consumption | ~3-4W |
| Price | ~$60-70 |

### HDMI Portable Display

| Parameter | Value |
|------|------|
| Size | 7"-10" |
| Resolution | 1024×600 or 1280×800 |
| Interface | HDMI |
| Touch | USB capacitive touch (optional) |
| Compatible With | Jetson/RPi/Any HDMI output |
| Price | ~$30-80 |

## Interface Comparison

| Interface | Speed | Pin Count | Complexity | Suitable Displays |
|------|------|--------|--------|-----------|
| I2C | Slow (400kHz) | 2 (SDA+SCL) | Low | OLED (128×64) |
| SPI | Medium (10-40MHz) | 4-5 | Medium | TFT LCD (320×240) |
| 8-bit Parallel | Fast | 12+ | High | Large TFT LCD |
| DSI | Very fast | Ribbon cable | Low (RPi) | 7" RPi display |
| HDMI | Extremely fast | HDMI cable | Low | Large/Portable display |

## GUI Libraries

### LVGL (Top Choice for Embedded)

LVGL (Light and Versatile Graphics Library) is the most popular GUI library for embedded systems:

- Supports buttons, sliders, charts, tables, and other rich widgets
- Supports touchscreen input
- Small memory footprint (minimum 64KB Flash + 8KB RAM)
- Supports ESP32, STM32, RPi, and other platforms
- MIT open-source license

```c
// LVGL button example
lv_obj_t *btn = lv_btn_create(lv_scr_act());
lv_obj_set_size(btn, 120, 50);
lv_obj_align(btn, LV_ALIGN_CENTER, 0, 0);

lv_obj_t *label = lv_label_create(btn);
lv_label_set_text(label, "START");
lv_obj_center(label);
```

### Adafruit GFX (Arduino)

The foundational graphics library for the Arduino ecosystem:

- Basic graphics: points, lines, rectangles, circles, text
- Supports various screens including SSD1306, ILI9341, ST7789
- Simple and easy to use, suitable for rapid development

### Python Display Libraries

| Library | Target | Features |
|---|------|------|
| Adafruit_CircuitPython_SSD1306 | OLED | CircuitPython |
| luma.oled | OLED (RPi/Linux) | Feature-rich |
| Pillow (PIL) | General image generation | Render then push to screen |
| pygame | RPi + HDMI display | Game-level graphics |

**luma.oled Example (Raspberry Pi)**:

```python
from luma.core.interface.serial import i2c
from luma.oled.device import ssd1306
from luma.core.render import canvas
from PIL import ImageFont

serial = i2c(port=1, address=0x3C)
device = ssd1306(serial)

with canvas(device) as draw:
    draw.rectangle(device.bounding_box, outline="white")
    draw.text((10, 10), "Robot Ready", fill="white")
    draw.text((10, 25), "Batt: 92%", fill="white")
    draw.text((10, 40), "Mode: Auto", fill="white")
```

## Display Selection Guide

| Requirement | Recommended Solution | Reason |
|------|---------|------|
| Display IP and battery only | 0.96" SSD1306 OLED | Simplest, cheapest |
| Sensor data + simple graphics | 1.3" SH1106 OLED | Slightly larger, clearer |
| Color graphics/Robot expressions | 1.54" ST7789 | Compact, good color |
| Full parameter panel | 2.8" ILI9341 | Sufficient space, rich info |
| Outdoor static information | 2.9" e-Paper | Sunlight readable, ultra-low power |
| Touch interaction interface | 7" DSI/HDMI touchscreen | Full GUI |
| Debugging/Development | HDMI portable display | Universal, high resolution |

## References

- Adafruit Learning System: Display tutorials
- LVGL Documentation: [docs.lvgl.io](https://docs.lvgl.io)
- luma.oled: [GitHub](https://github.com/rm-hull/luma.oled)
- Waveshare Wiki: [waveshare.com/wiki](https://www.waveshare.com/wiki)
