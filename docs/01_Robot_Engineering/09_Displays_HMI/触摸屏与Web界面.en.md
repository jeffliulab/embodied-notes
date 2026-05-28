# Touchscreen and Web Interface

## Overview

When a robot requires rich interactive capabilities, touchscreen GUIs and web interfaces are the two primary solutions. Touchscreens are suited for local interaction (e.g., service robot panels), while web interfaces are ideal for remote monitoring and control.

## Touchscreen Integration

### Capacitive Touchscreen

| Parameter | Capacitive Touch | Resistive Touch |
|------|---------|---------|
| Touch Method | Finger/Conductive stylus | Any object/Gloves |
| Accuracy | High | Medium |
| Multi-touch | Supported | Not supported |
| Durability | High | Medium (surface layer wear) |
| Cost | Slightly higher | Low |
| Recommended For | Indoor robots | Industrial/Gloved operation |

### Common Touchscreen Modules

| Module | Size | Resolution | Interface | Touch IC | Target Platform |
|------|------|--------|------|--------|---------|
| RPi Official 7" | 7" | 800×480 | DSI | FT5406 | Raspberry Pi |
| Waveshare 7" | 7" | 1024×600 | HDMI+USB | GT911 | Universal |
| Waveshare 5" | 5" | 800×480 | HDMI+USB | — | Universal |
| Nextion NX | 2.4-7" | Various | UART | Built-in | MCU |

## Embedded GUI Frameworks

### LVGL (Best Choice for Embedded)

LVGL is suitable for building touch interfaces on MCUs or low-resource SBCs:

```c
// LVGL - Create status panel
void create_status_panel(void) {
    // Battery level bar
    lv_obj_t *bar = lv_bar_create(lv_scr_act());
    lv_bar_set_value(bar, 85, LV_ANIM_ON);
    lv_obj_set_size(bar, 200, 20);
    lv_obj_align(bar, LV_ALIGN_TOP_MID, 0, 20);
    
    // Battery label
    lv_obj_t *label = lv_label_create(lv_scr_act());
    lv_label_set_text(label, "Battery: 85%");
    lv_obj_align(label, LV_ALIGN_TOP_MID, 0, 50);
    
    // Mode switch buttons
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

**Supported Platforms**: ESP32, STM32, RPi, Linux framebuffer

### PyQt5 / PySide6 (Desktop GUI on SBC)

Using Python desktop GUI frameworks on Raspberry Pi or Jetson:

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
        
        # Status label
        self.status_label = QLabel("Status: Ready")
        self.status_label.setStyleSheet("font-size: 24px; color: green;")
        layout.addWidget(self.status_label)
        
        # Battery bar
        self.battery_bar = QProgressBar()
        self.battery_bar.setValue(85)
        layout.addWidget(self.battery_bar)
        
        # Control buttons
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

### Tkinter (Lightweight Alternative)

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

## Web Interface Control

Web interfaces allow remote control and monitoring of robots through a browser, without installing any software.

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
    """Periodically broadcast robot state"""
    while True:
        socketio.emit('state_update', robot_state)
        time.sleep(0.1)

if __name__ == '__main__':
    thread = threading.Thread(target=broadcast_state, daemon=True)
    thread.start()
    socketio.run(app, host='0.0.0.0', port=5000)
```

### Gradio (Rapid Prototyping)

Gradio is a Python library that enables quick creation of web interaction interfaces:

```python
import gradio as gr

def control_robot(command, speed):
    return f"Executing: {command} at speed {speed}"

def get_camera_frame():
    # Return camera image
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

**rosbridge_server** provides a WebSocket interface to access ROS2 topics and services:

```bash
# Install
sudo apt install ros-humble-rosbridge-server

# Launch
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

Frontend using **roslibjs**:

```html
<script src="https://cdn.jsdelivr.net/npm/roslib/build/roslib.min.js"></script>
<script>
var ros = new ROSLIB.Ros({ url: 'ws://192.168.1.100:9090' });

// Subscribe to topic
var listener = new ROSLIB.Topic({
    ros: ros,
    name: '/robot_status',
    messageType: 'std_msgs/String'
});

listener.subscribe(function(message) {
    document.getElementById('status').innerHTML = message.data;
});

// Publish velocity command
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

Foxglove Studio is the most powerful visualization and debugging tool in the ROS2 ecosystem:

| Feature | Description |
|------|------|
| Platform | Desktop app / Web version |
| Data Sources | ROS1/ROS2/Custom WebSocket |
| Panels | 3D view, charts, images, logs, maps, etc. |
| Layout | Customizable panel layout |
| Record/Playback | Supports MCAP/ROS bag playback |
| Price | Basic version free |

### Connecting to ROS2

```bash
# Install Foxglove Bridge
sudo apt install ros-humble-foxglove-bridge

# Launch
ros2 launch foxglove_bridge foxglove_bridge_launch.xml

# Foxglove Studio connect: ws://robot_ip:8765
```

### Common Panels

- **3D Panel**: Display point clouds, TF, robot model
- **Image Panel**: Display camera feed
- **Plot Panel**: Real-time numerical curves
- **Map Panel**: 2D occupancy grid map
- **Log Panel**: ROS logs
- **Teleop Panel**: Virtual joystick control

## Mobile APP Control

### Solution Comparison

| Solution | Dev Difficulty | Cross-platform | Real-time | Suitable For |
|------|---------|--------|--------|------|
| Native APP (Swift/Kotlin) | High | No | Good | Commercial products |
| Flutter/React Native | Medium | Yes | Good | Medium projects |
| Web APP (PWA) | Low | Yes | Medium | Rapid prototyping |
| Bluetooth Serial APP | Low | — | Medium | Simple control |

### Recommended Approach

For robotics projects, **Web APP (PWA)** offers the best balance:

- Access directly from phone browser, no installation needed
- Use Flask/FastAPI backend + responsive frontend
- WebSocket for real-time communication
- Can be added to phone home screen (PWA)

## Solution Selection Summary

| Requirement | Recommended Solution | Reason |
|------|---------|------|
| MCU + Touchscreen | LVGL + SPI LCD | Best for embedded |
| SBC Local GUI | PyQt5 + DSI display | Feature-rich |
| Remote Monitoring | Flask + WebSocket | Simple and flexible |
| Quick Demo | Gradio | One-line interface |
| ROS2 Visualization | Foxglove Studio | Most powerful |
| ROS2 Web Control | rosbridge + roslibjs | ROS native |
| Mobile Control | PWA Web App | Cross-platform, no install |

## References

- LVGL: [lvgl.io](https://lvgl.io)
- Flask-SocketIO: [flask-socketio.readthedocs.io](https://flask-socketio.readthedocs.io)
- Foxglove Studio: [foxglove.dev](https://foxglove.dev)
- rosbridge_suite: [wiki.ros.org/rosbridge_suite](http://wiki.ros.org/rosbridge_suite)
- Gradio: [gradio.app](https://gradio.app)
