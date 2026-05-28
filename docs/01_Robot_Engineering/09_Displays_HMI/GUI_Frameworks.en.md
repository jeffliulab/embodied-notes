# GUI Frameworks — Embedded + Desktop HMI

> *From industrial HMI to desktop / mobile / embedded GUI, various frameworks have advantages. Qt is industrial standard, LVGL is embedded darling, Flutter is cross-platform darling. This article compares mainstream frameworks + selection.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: C++/Python basics

---

## 1. GUI Framework Categories

- **Native**: Win32 (Windows), Cocoa (macOS), GTK (Linux), Android SDK
- **Cross-platform**: Qt, wxWidgets, Tk, Electron, Flutter
- **Web-based**: HTML/CSS/JS, React, Vue, Svelte
- **Embedded**: LVGL, TouchGFX, emWin, NanoVG

---

## 2. Qt (Industrial HMI Mainstream)

- C++ + QML
- Trolltech 1995, Nokia, now Qt Company
- Industrial HMI mainstream (Siemens TIA portal, etc.)
- Apps: Autodesk Maya, KDE, VirtualBox, Tesla cars (early)
- License: dual (GPL + commercial)

```python
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

## 3. LVGL (Embedded)

- C, MIT
- 1 MB RAM sufficient
- 100+ widgets
- Industrial HMI, smart home, wearable
- Mainstream STM32 / ESP32 GUI library

```c
lv_obj_t * btn = lv_btn_create(lv_scr_act());
lv_obj_set_pos(btn, 10, 10);
lv_obj_set_size(btn, 120, 50);
lv_obj_add_event_cb(btn, btn_event_handler, LV_EVENT_CLICKED, NULL);
```

---

## 4. TouchGFX (ST Push)

- ST Microelectronics acquired, STM32 push
- Designer-friendly IDE
- Free (bundled with STM32)
- Limited to STM32 ecosystem

---

## 5. Flutter (Google)

- Dart language
- Cross-platform (iOS, Android, Web, Desktop, embedded)
- Skia rendering
- Apps: Google Pay, Tencent, Alibaba
- Near-native performance

---

## 6. Electron

- Chromium + Node.js
- Any web tech → desktop app
- Apps: VS Code, Slack, Discord, Microsoft Teams
- Large memory footprint (100 MB+)

---

## 7. React Native / NativeScript

- JavaScript → native UI
- Mobile mainly
- Facebook (React Native)

---

## 8. Selection Decision Tree

```
Embedded (Cortex-M, 1 MB RAM)
  → LVGL (recommended) or TouchGFX

Cross-platform desktop + mobile
  → Flutter (new) or Qt (mature)

Desktop only, existing web team
  → Electron

Industrial HMI / high-perf desktop
  → Qt

iOS / Android only
  → Swift / Kotlin native (best UX)
  or Flutter / React Native (cross)

Web app
  → React / Vue / Svelte
```

---

## 9. Performance Comparison

| Framework | Startup (ms) | RAM (MB) | Binary (MB) |
|---|---|---|---|
| Qt | 100-500 | 30-50 | 5-30 |
| LVGL | < 10 | 1 | < 1 |
| Flutter | 200-500 | 80-150 | 15-40 |
| Electron | 1000+ | 100-300 | 100-200 |
| Native (Cocoa) | 100 | 10-50 | 1-10 |

---

## 10. LVGL Embedded Advantages

- C only, no RTOS dep
- Any LCD driver
- Memory-friendly (1 MB+)
- Hardware accelerator (DMA2D, GPU)
- Chinese support (UTF-8)

---

## 11. Common Pitfalls

### 11.1 Electron Resource

100 MB RAM, 100MB binary is norm.

### 11.2 Qt Not Easy for Commercial

GPL → commercial needs LGPL or commercial license.

### 11.3 LVGL Screen Refresh

Some embedded LCDs don't support high refresh → laggy.

### 11.4 Flutter Dart Learning Curve

Dart not widespread → harder to hire than JS.

### 11.5 Cross-platform UX Inconsistency

iOS vs Android user expectations differ; Flutter / RN hard to perfect.

---

## 12. Modern Trends (2025)

- Flutter continues capturing cross-platform
- LVGL mainstream embedded
- Native (Swift, Kotlin) still best UX
- Web + WebAssembly on desktop
- AI-generated UI (v0.dev, Figma → code)

---

## 13. Related Concepts

- **Same section**: [Display Systems Overview](显示系统综述.en.md), [OLED & LCD](OLED与LCD.en.md), [Touchscreen & Web UI](触摸屏与Web界面.en.md)
- **Embedded**: [ARM Cortex-M](../03_Embedded_Systems/ARM_Cortex_M.en.md)

---

## References

1. **Qt Documentation** — https://doc.qt.io/
2. **LVGL Documentation** — https://docs.lvgl.io/
3. **Flutter Documentation** — https://docs.flutter.dev/
4. **Blanchette, J. & Summerfield, M.** *C++ GUI Programming with Qt 4*. 2nd ed., 2008.
