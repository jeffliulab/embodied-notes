# 仿真与软件开发

具身智能的工程落地不仅需要算法和模型，还需要一整套围绕仿真、资产、世界构建、软件中间件和调试工具的开发体系。本章把“机器人在什么平台上跑”“世界和物体如何被建模”“物理规则如何配置”“软件如何联调和部署”放到同一个工程闭环里理解。

**本章内容：**

- **[仿真平台](01_Simulation/simulation_platforms.md)** — 主流仿真器的定位、选型路径与阅读入口
- **[仿真资产](01_Simulation/仿真资产.md)** — 机器人、物体、场景、传感器、材质、灯光等资产如何被建模、制作、导入与验证
- **[仿真世界构建与物理规则](01_Simulation/仿真世界构建与物理规则.md)** — 世界层次、坐标系、接触/摩擦/约束、积分稳定性、随机化与验证
- **[仿真工具对比](01_Simulation/仿真工具对比.md)** — 主流仿真器全方位对比
- **[NVIDIA生态](03_Ecosystem/NVIDIA生态.md)** — Omniverse、Isaac Lab、Cosmos、GR00T
- **[ROS2生态](03_Ecosystem/ROS2.md)** — ros2_control、MoveIt 2、Nav2深入
- **[开源框架](03_Ecosystem/开源框架.md)** — LeRobot、robomimic、robosuite、ManiSkill
- **[开发工具链](03_Ecosystem/开发工具链.md)** — URDF/MJCF、BT.CPP、Foxglove

## 推荐阅读顺序

如果你刚进入这一组内容，建议按照下面的工程顺序阅读：

1. 先看 [仿真平台](01_Simulation/simulation_platforms.md)，建立各类仿真器和框架的地图。
2. 再看 [仿真资产](01_Simulation/仿真资产.md)，理解“机器人、物体、场景、传感器”这些对象如何成为可用资产。
3. 然后看 [仿真世界构建与物理规则](01_Simulation/仿真世界构建与物理规则.md)，理解资产如何组合成一个可训练、可评测、可迁移的世界。
4. 接着看 [仿真工具对比](01_Simulation/仿真工具对比.md) 和 [NVIDIA生态](03_Ecosystem/NVIDIA生态.md)，完成选型和生态定位。
5. 最后结合 [ROS2生态](03_Ecosystem/ROS2.md)、[开源框架](03_Ecosystem/开源框架.md)、[开发工具链](03_Ecosystem/开发工具链.md) 进入真实开发流程。
