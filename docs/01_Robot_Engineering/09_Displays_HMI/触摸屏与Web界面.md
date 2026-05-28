# 触摸屏与Web界面

## 概述

当机器人需要丰富的交互功能时，触摸屏GUI和Web界面是两种主要方案。触摸屏适合本地交互（如服务机器人面板），Web界面适合远程监控和控制。

## 触摸屏集成

### 电容触摸屏

| 参数 | 电容触摸 | 电阻触摸 |
|------|---------|---------|
| 触摸方式 | 手指/导电笔 | 任何物体/手套 |
| 精度 | 高 | 中 |
| 多点触摸 | 支持 | 不支持 |
| 耐久性 | 高 | 中（表面层磨损） |
| 成本 | 稍高 | 低 |
| 推荐 | 室内机器人 | 工业/手套操作 |

### 常见触摸屏模块

| 模块 | 尺寸 | 分辨率 | 接口 | 触摸IC | 适用平台 |
|------|------|--------|------|--------|---------|
| RPi官方7" | 7" | 800×480 | DSI | FT5406 | 树莓派 |
| Waveshare 7" | 7" | 1024×600 | HDMI+USB | GT911 | 通用 |
| Waveshare 5" | 5" | 800×480 | HDMI+USB | — | 通用 |
| Nextion NX | 2.4-7" | 各种 | UART | 内置 | MCU |

## 嵌入式GUI框架

### LVGL（嵌入式最佳选择）

LVGL适合在MCU或低资源SBC上构建触摸界面：

```c
// LVGL 创建状态面板
void create_status_panel(void) {
    // 电池电量条
    lv_obj_t *bar = lv_bar_create(lv_scr_act());
    lv_bar_set_value(bar, 85, LV_ANIM_ON);
    lv_obj_set_size(bar, 200, 20);
    lv_obj_align(bar, LV_ALIGN_TOP_MID, 0, 20);
    
    // 电量标签
    lv_obj_t *label = lv_label_create(lv_scr_act());
    lv_label_set_text(label, "Battery: 85%");
    lv_obj_align(label, LV_ALIGN_TOP_MID, 0, 50);
    
    // 模式切换按钮
    lv_obj_t *btn_auto = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_auto, 120, 50);
    lv_obj_align(btn_auto, LV_ALIGN_CENTER, -70, 0);
    lv_obj_t *lbl1 = lv_label_create(btn_auto);
    lv_label_set_text(lbl1, "AUTO");
    lv_obj_center(lbl1);
    
    lv_obj_t *btn_manual = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_manual, 120, 50);
    lv_obj_align(btn_manual, LV_ALIGN_CENTER, 70, 0);
    lv_obj_t *lbl2 = lv_label_create(btn_manual);
    lv_label_set_text(lbl2, "MANUAL");
    lv_obj_center(lbl2);
}
```

**支持平台**：ESP32、STM32、RPi、Linux framebuffer

### PyQt5 / PySide6（SBC上的桌面GUI）

在树莓派或Jetson上使用Python桌面GUI框架：

```python
import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, 
                              QVBoxLayout, QHBoxLayout, QPushButton,
                              QLabel, QProgressBar)
from PyQt5.QtCore import QTimer

class RobotControlPanel(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Robot Control Panel")
        self.setGeometry(0, 0, 800, 480)
        
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        
        # 状态标签
        self.status_label = QLabel("Status: Ready")
        self.status_label.setStyleSheet("font-size: 24px; color: green;")
        layout.addWidget(self.status_label)
        
        # 电量条
        self.battery_bar = QProgressBar()
        self.battery_bar.setValue(85)
        layout.addWidget(self.battery_bar)
        
        # 控制按钮
        btn_layout = QHBoxLayout()
        self.btn_start = QPushButton("START")
        self.btn_start.setStyleSheet("font-size: 20px; padding: 15px;")
        self.btn_start.clicked.connect(self.on_start)
        btn_layout.addWidget(self.btn_start)
        
        self.btn_stop = QPushButton("STOP")
        self.btn_stop.setStyleSheet(
            "font-size: 20px; padding: 15px; background: red; color: white;")
        self.btn_stop.clicked.connect(self.on_stop)
        btn_layout.addWidget(self.btn_stop)
        
        layout.addLayout(btn_layout)
    
    def on_start(self):
        self.status_label.setText("Status: Running")
        self.status_label.setStyleSheet("font-size: 24px; color: blue;")
    
    def on_stop(self):
        self.status_label.setText("Status: Stopped")
        self.status_label.setStyleSheet("font-size: 24px; color: red;")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = RobotControlPanel()
    window.showFullScreen()
    sys.exit(app.exec_())
```

### Tkinter（轻量替代）

```python
import tkinter as tk

root = tk.Tk()
root.title("Robot Control")
root.geometry("800x480")

status = tk.Label(root, text="Ready", font=("Arial", 24), fg="green")
status.pack(pady=20)

def start_robot():
    status.config(text="Running", fg="blue")

def stop_robot():
    status.config(text="Stopped", fg="red")

tk.Button(root, text="START", font=("Arial", 18), 
          command=start_robot).pack(side=tk.LEFT, expand=True, padx=20)
tk.Button(root, text="STOP", font=("Arial", 18), bg="red", fg="white",
          command=stop_robot).pack(side=tk.RIGHT, expand=True, padx=20)

root.mainloop()
```

## Web界面控制

Web界面允许通过浏览器远程控制和监控机器人，无需安装任何软件。

### Flask + WebSocket

```python
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

robot_state = {
    "battery": 85,
    "mode": "idle",
    "speed": 0.0,
    "position": {"x": 0, "y": 0, "theta": 0}
}

@app.route('/')
def index():
    return render_template('robot_control.html')

@socketio.on('command')
def handle_command(data):
    cmd = data.get('cmd')
    if cmd == 'forward':
        robot_state['mode'] = 'moving'
        robot_state['speed'] = 0.5
    elif cmd == 'stop':
        robot_state['mode'] = 'idle'
        robot_state['speed'] = 0.0
    emit('state_update', robot_state, broadcast=True)

def broadcast_state():
    """定期广播机器人状态"""
    while True:
        socketio.emit('state_update', robot_state)
        time.sleep(0.1)

if __name__ == '__main__':
    thread = threading.Thread(target=broadcast_state, daemon=True)
    thread.start()
    socketio.run(app, host='0.0.0.0', port=5000)
```

### Gradio（快速原型）

Gradio是一个Python库，可以快速创建Web交互界面：

```python
import gradio as gr

def control_robot(command, speed):
    return f"Executing: {command} at speed {speed}"

def get_camera_frame():
    # 返回摄像头图像
    import cv2
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    return frame if ret else None

demo = gr.Interface(
    fn=control_robot,
    inputs=[
        gr.Radio(["Forward", "Backward", "Left", "Right", "Stop"]),
        gr.Slider(0, 1, 0.5, label="Speed")
    ],
    outputs="text",
    title="Robot Control Panel"
)

demo.launch(server_name="0.0.0.0", server_port=7860)
```

### ROS2 Web Bridge

**rosbridge_server** 提供WebSocket接口来访问ROS2话题和服务：

```bash
# 安装
sudo apt install ros-humble-rosbridge-server

# 启动
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

前端使用 **roslibjs**：

```html
<script src="https://cdn.jsdelivr.net/npm/roslib/build/roslib.min.js"></script>
<script>
var ros = new ROSLIB.Ros({ url: 'ws://192.168.1.100:9090' });

// 订阅话题
var listener = new ROSLIB.Topic({
    ros: ros,
    name: '/robot_status',
    messageType: 'std_msgs/String'
});

listener.subscribe(function(message) {
    document.getElementById('status').innerHTML = message.data;
});

// 发布速度指令
var cmdVel = new ROSLIB.Topic({
    ros: ros,
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist'
});

function moveForward() {
    var twist = new ROSLIB.Message({
        linear: { x: 0.5, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 }
    });
    cmdVel.publish(twist);
}
</script>
```

## Foxglove Studio

Foxglove Studio 是ROS2生态中最强大的可视化和调试工具：

| 特性 | 说明 |
|------|------|
| 平台 | 桌面应用 / Web版 |
| 数据源 | ROS1/ROS2/自定义WebSocket |
| 面板 | 3D视图、图表、图像、日志、地图等 |
| 布局 | 可自定义面板布局 |
| 录放 | 支持MCAP/ROS bag回放 |
| 价格 | 基础版免费 |

### 连接ROS2

```bash
# 安装 Foxglove Bridge
sudo apt install ros-humble-foxglove-bridge

# 启动
ros2 launch foxglove_bridge foxglove_bridge_launch.xml

# Foxglove Studio 连接: ws://robot_ip:8765
```

### 常用面板

- **3D Panel**：显示点云、TF、机器人模型
- **Image Panel**：显示摄像头画面
- **Plot Panel**：实时绘制数值曲线
- **Map Panel**：2D栅格地图
- **Log Panel**：ROS日志
- **Teleop Panel**：虚拟摇杆控制

## 移动APP控制

### 方案对比

| 方案 | 开发难度 | 跨平台 | 实时性 | 适用 |
|------|---------|--------|--------|------|
| 原生APP (Swift/Kotlin) | 高 | 否 | 好 | 商用产品 |
| Flutter/React Native | 中 | 是 | 好 | 中型项目 |
| Web APP (PWA) | 低 | 是 | 中 | 快速原型 |
| 蓝牙串口APP | 低 | — | 中 | 简单控制 |

### 推荐方案

对于机器人项目，**Web APP（PWA）** 是最佳平衡：

- 手机浏览器直接访问，无需安装
- 使用Flask/FastAPI后端 + 响应式前端
- WebSocket实现实时通信
- 可添加到手机主屏幕（PWA）

## 方案选型总结

| 需求 | 推荐方案 | 理由 |
|------|---------|------|
| MCU + 触摸屏 | LVGL + SPI LCD | 最适合嵌入式 |
| SBC本地GUI | PyQt5 + DSI屏 | 功能丰富 |
| 远程监控 | Flask + WebSocket | 简单灵活 |
| 快速演示 | Gradio | 一行代码出界面 |
| ROS2可视化 | Foxglove Studio | 功能最强 |
| ROS2 Web控制 | rosbridge + roslibjs | ROS原生 |
| 手机控制 | PWA Web App | 跨平台、免安装 |

## 参考资源

- LVGL: [lvgl.io](https://lvgl.io)
- Flask-SocketIO: [flask-socketio.readthedocs.io](https://flask-socketio.readthedocs.io)
- Foxglove Studio: [foxglove.dev](https://foxglove.dev)
- rosbridge_suite: [wiki.ros.org/rosbridge_suite](http://wiki.ros.org/rosbridge_suite)
- Gradio: [gradio.app](https://gradio.app)
