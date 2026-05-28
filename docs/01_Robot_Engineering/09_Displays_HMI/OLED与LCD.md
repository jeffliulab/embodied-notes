# OLED与LCD

## 概述

显示屏是机器人视觉反馈的核心组件。从微型OLED到全彩LCD触摸屏，不同尺寸和技术的显示屏适用于不同场景。本节介绍机器人中常用的显示屏模块及其驱动方法。

## OLED显示屏

### 0.96" SSD1306 OLED

SSD1306 是最流行的小型OLED显示模块，几乎所有机器人教程都会用到。

| 参数 | 数值 |
|------|------|
| 尺寸 | 0.96英寸 |
| 分辨率 | 128×64 像素 |
| 颜色 | 单色（白/蓝/黄蓝双色） |
| 接口 | I2C (默认地址 0x3C) 或 SPI |
| 工作电压 | 3.3V / 5V |
| 功耗 | ~20mA (全亮) |
| 价格 | ~$3 |

**I2C接线**：

| OLED引脚 | MCU引脚 |
|---------|---------|
| VCC | 3.3V / 5V |
| GND | GND |
| SCL | I2C SCL |
| SDA | I2C SDA |

**Arduino驱动**：

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

**MicroPython驱动**：

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

| 参数 | 数值 |
|------|------|
| 尺寸 | 1.3英寸 |
| 分辨率 | 128×64 像素 |
| 驱动IC | SH1106 |
| 接口 | I2C / SPI |
| 特点 | 比SSD1306大一圈，显示更清晰 |

注意：SH1106和SSD1306的驱动略有不同，需使用对应的库。

### OLED适用场景

- 显示IP地址（调试最常用）
- 电池电量
- 运行模式
- 传感器数据概览
- 简单菜单（配合按键）

## TFT LCD显示屏

### 2.8" ILI9341 TFT

ILI9341 是中等尺寸彩色TFT LCD的常用驱动IC。

| 参数 | 数值 |
|------|------|
| 尺寸 | 2.8英寸 |
| 分辨率 | 320×240 像素 |
| 颜色 | 65K色 (RGB565) |
| 接口 | SPI (主流) / 8-bit并行 |
| 工作电压 | 3.3V（逻辑），内置升压背光 |
| SPI速率 | 最高 40MHz |
| 功耗 | ~100mA (含背光) |
| 价格 | ~$8-12 |

**SPI接线**：

| LCD引脚 | MCU引脚 |
|---------|---------|
| VCC | 3.3V |
| GND | GND |
| CS | GPIO (片选) |
| DC/RS | GPIO (数据/命令) |
| MOSI | SPI MOSI |
| SCK | SPI SCK |
| RST | GPIO (复位) |
| LED | 3.3V (背光) |

### 1.54"/1.69" ST7789 TFT

| 参数 | 数值 |
|------|------|
| 尺寸 | 1.54" / 1.69" |
| 分辨率 | 240×240 / 240×280 |
| 驱动IC | ST7789 |
| 接口 | SPI |
| 特点 | IPS广角、色彩鲜艳、小巧 |
| 价格 | ~$5-8 |

适合安装在紧凑空间中显示机器人表情或简单图形界面。

### 3.5" ILI9488 TFT

| 参数 | 数值 |
|------|------|
| 尺寸 | 3.5英寸 |
| 分辨率 | 480×320 像素 |
| 驱动IC | ILI9488 |
| 接口 | SPI / 8-bit并行 |
| 特点 | 更大显示面积，适合复杂UI |
| 价格 | ~$12-18 |

## 电子墨水屏（e-Paper）

### Waveshare e-Paper

| 型号 | 尺寸 | 分辨率 | 颜色 | 刷新时间 | 价格 |
|------|------|--------|------|---------|------|
| 1.54" | 1.54英寸 | 200×200 | 黑白 | 2s | ~$10 |
| 2.13" | 2.13英寸 | 250×122 | 黑白 | 2s | ~$12 |
| 2.9" | 2.9英寸 | 296×128 | 黑白 | 2s | ~$15 |
| 4.2" | 4.2英寸 | 400×300 | 黑白红 | 15s | ~$25 |

**特点**：

- 断电保持显示内容
- 强光下可视性极好
- 刷新速度慢（不适合动态内容）
- 功耗极低（仅刷新时耗电）

**适用场景**：显示固定信息（如机器人名称、二维码、WiFi密码）

## 7" 大屏幕

### 树莓派官方7" DSI触摸屏

| 参数 | 数值 |
|------|------|
| 尺寸 | 7英寸 |
| 分辨率 | 800×480 |
| 接口 | DSI（树莓派专用排线） |
| 触摸 | 10点电容触摸 (I2C) |
| 功耗 | ~3-4W |
| 价格 | ~$60-70 |

### HDMI便携屏

| 参数 | 数值 |
|------|------|
| 尺寸 | 7"-10" |
| 分辨率 | 1024×600 或 1280×800 |
| 接口 | HDMI |
| 触摸 | USB电容触摸（可选） |
| 适用 | Jetson/RPi/任何HDMI输出 |
| 价格 | ~$30-80 |

## 接口对比

| 接口 | 速度 | 引脚数 | 复杂度 | 适用显示屏 |
|------|------|--------|--------|-----------|
| I2C | 慢 (400kHz) | 2 (SDA+SCL) | 低 | OLED (128×64) |
| SPI | 中 (10-40MHz) | 4-5 | 中 | TFT LCD (320×240) |
| 8-bit并行 | 快 | 12+ | 高 | 大TFT LCD |
| DSI | 很快 | 排线 | 低(RPi) | 7" RPi屏 |
| HDMI | 极快 | HDMI线 | 低 | 大屏/便携屏 |

## GUI库

### LVGL（嵌入式首选）

LVGL（Light and Versatile Graphics Library）是嵌入式系统最流行的GUI库：

- 支持按钮、滑块、图表、表格等丰富控件
- 支持触摸屏输入
- 内存占用小（最低64KB Flash + 8KB RAM）
- 支持ESP32、STM32、RPi等平台
- MIT开源协议

```c
// LVGL 按钮示例
lv_obj_t *btn = lv_btn_create(lv_scr_act());
lv_obj_set_size(btn, 120, 50);
lv_obj_align(btn, LV_ALIGN_CENTER, 0, 0);

lv_obj_t *label = lv_label_create(btn);
lv_label_set_text(label, "START");
lv_obj_center(label);
```

### Adafruit GFX（Arduino）

Arduino生态的基础图形库：

- 点、线、矩形、圆、文字等基本图形
- 支持SSD1306、ILI9341、ST7789等各种屏幕
- 简单易用，适合快速开发

### Python显示库

| 库 | 适用 | 特点 |
|---|------|------|
| Adafruit_CircuitPython_SSD1306 | OLED | CircuitPython |
| luma.oled | OLED (RPi/Linux) | 功能丰富 |
| Pillow (PIL) | 通用图像生成 | 绘制后推送到屏幕 |
| pygame | RPi + HDMI屏 | 游戏级图形 |

**luma.oled 示例（树莓派）**：

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

## 显示屏选型指南

| 需求 | 推荐方案 | 理由 |
|------|---------|------|
| 仅显示IP和电量 | 0.96" SSD1306 OLED | 最简单、最便宜 |
| 显示传感器数据+简单图形 | 1.3" SH1106 OLED | 稍大、更清晰 |
| 彩色图形/机器人表情 | 1.54" ST7789 | 小巧、色彩好 |
| 完整参数面板 | 2.8" ILI9341 | 空间够、信息多 |
| 户外静态信息 | 2.9" e-Paper | 强光可见、超低功耗 |
| 触摸交互界面 | 7" DSI/HDMI触摸屏 | 完整GUI |
| 调试/开发 | HDMI便携屏 | 通用、高分辨率 |

## 参考资源

- Adafruit Learning System: Display tutorials
- LVGL Documentation: [docs.lvgl.io](https://docs.lvgl.io)
- luma.oled: [GitHub](https://github.com/rm-hull/luma.oled)
- Waveshare Wiki: [waveshare.com/wiki](https://www.waveshare.com/wiki)
