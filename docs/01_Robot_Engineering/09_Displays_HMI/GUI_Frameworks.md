# GUI Frameworks — 嵌入式 + 桌面 HMI

> *从工业 HMI 到桌面 / 移动 / 嵌入式 GUI,各种 framework 各有优势。Qt 是工业 标准,LVGL 是嵌入式 darling,Flutter 是跨平台 darling。本篇覆盖主流 framework 对比 + 选型。*
>
> **难度**:Intermediate
> **前置知识**:C++/Python 基础

---

## 1. GUI 框架分类

- **Native**: Win32 (Windows), Cocoa (macOS), GTK (Linux), Android SDK
- **Cross-platform**: Qt, wxWidgets, Tk, Electron, Flutter
- **Web-based**: HTML/CSS/JS, React, Vue, Svelte
- **Embedded**: LVGL, TouchGFX, emWin, NanoVG

---

## 2. Qt (工业 HMI 主流)

- C++ + QML
- Trolltech 1995, Nokia, 现 Qt Company
- 主流工业 HMI (Siemens TIA portal 等)
- Apps: Autodesk Maya, KDE, VirtualBox, Tesla 车机 (早期)
- License: dual (GPL + commercial)

```python
# PyQt6 example
from PyQt6.QtWidgets import QApplication, QPushButton, QWidget

app = QApplication([])
window = QWidget()
window.setWindowTitle('Hello Qt')
button = QPushButton('Click me', window)
button.clicked.connect(lambda: print('Clicked!'))
window.show()
app.exec()
```

---

## 3. LVGL (嵌入式)

- C, MIT
- 1 MB RAM 即可 run
- 100+ widgets
- 工业 HMI, smart home, wearable
- 主流 STM32 / ESP32 GUI library

```c
// LVGL example
lv_obj_t * btn = lv_btn_create(lv_scr_act());
lv_obj_set_pos(btn, 10, 10);
lv_obj_set_size(btn, 120, 50);
lv_obj_add_event_cb(btn, btn_event_handler, LV_EVENT_CLICKED, NULL);
```

---

## 4. TouchGFX (ST 主推)

- ST Microelectronics 收购,STM32 主推
- 设计师友好 IDE
- Free (与 STM32 配套)
- 限定 STM32 ecosystem

---

## 5. Flutter (Google)

- Dart language
- 跨平台 (iOS, Android, Web, Desktop, embedded)
- Skia rendering
- Apps: Google Pay, Tencent, Alibaba
- 接近 native 性能

---

## 6. Electron

- Chromium + Node.js
- 任何 web 技术 → desktop app
- Apps: VS Code, Slack, Discord, Microsoft Teams
- 大 memory footprint (100 MB+)

---

## 7. React Native / NativeScript

- JavaScript → native UI
- 移动主要
- Facebook (React Native)

---

## 8. 选型决策树

```
嵌入式 (Cortex-M, 1 MB RAM)
  → LVGL (推) 或 TouchGFX

跨平台 desktop + mobile
  → Flutter (新) 或 Qt (成熟)

桌面 only, 已有 web team
  → Electron

工业 HMI / 高性能 desktop
  → Qt

iOS / Android only
  → Swift / Kotlin native (best UX)
  或 Flutter / React Native (cross)

Web 应用
  → React / Vue / Svelte
```

---

## 9. 性能对比

| Framework | 启动 (ms) | RAM (MB) | Binary (MB) |
|---|---|---|---|
| Qt | 100-500 | 30-50 | 5-30 |
| LVGL | < 10 | 1 | < 1 |
| Flutter | 200-500 | 80-150 | 15-40 |
| Electron | 1000+ | 100-300 | 100-200 |
| Native (Cocoa) | 100 | 10-50 | 1-10 |

---

## 10. 嵌入式 LVGL 优势

- C only, 无 RTOS dep
- 任意 LCD driver
- Memory-friendly (1 MB+)
- Hardware accelerator (DMA2D, GPU)
- 中文支持 (UTF-8)

---

## 11. Common Pitfalls

### 11.1 Electron resource

100 MB RAM, 100MB binary 是 norm。

### 11.2 Qt 不易 commercial

GPL → 商用需要 LGPL or 商业 license。

### 11.3 LVGL 屏 refresh

部分嵌入式 LCD 不 support 高 refresh → 卡顿。

### 11.4 Flutter dart 学习曲线

Dart 不广泛 → 招人 harder than JS。

### 11.5 Cross-platform UX 不一致

iOS vs Android 用户期望不同, Flutter / RN 难完美。

---

## 12. 现代趋势 (2025)

- Flutter 持续 capture cross-platform
- LVGL 主流嵌入式
- Native (Swift, Kotlin) 仍 best UX
- Web + WebAssembly 上 desktop
- AI-generated UI (v0.dev, Figma → code)

---

## 13. Related Concepts

- **同节**:[显示系统综述](显示系统综述.md)、[OLED 与 LCD](OLED与LCD.md)、[触摸屏与 Web 界面](触摸屏与Web界面.md)
- **嵌入式**:[ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.md)

---

## References

1. **Qt Documentation** — https://doc.qt.io/
2. **LVGL Documentation** — https://docs.lvgl.io/
3. **Flutter Documentation** — https://docs.flutter.dev/
4. **Blanchette, J. & Summerfield, M.** *C++ GUI Programming with Qt 4*. 2nd ed., 2008.
