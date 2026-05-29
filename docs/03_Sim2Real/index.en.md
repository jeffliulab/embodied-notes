# Simulation & Software Development

Engineering embodied intelligence requires far more than models alone. It needs a complete stack around simulation platforms, simulation assets, world construction, software middleware, debugging tools, and deployment pathways. This chapter organizes those pieces into a single engineering loop: where robots run, how worlds are built, how physics is configured, and how software is integrated end to end.

**Contents:**

- **[Simulation Platforms](01_Simulation/simulation_platforms.en.md)** — Positioning, selection, and reading entry points for mainstream simulators
- **[Simulation Assets](01_Simulation/仿真资产.en.md)** — How robots, objects, scenes, sensors, materials, and lighting are modeled, produced, imported, and validated
- **[Simulation World Building & Physics Rules](01_Simulation/仿真世界构建与物理规则.en.md)** — World hierarchies, frames, contact/friction/constraints, integration stability, randomization, and validation
- **[Simulation Tool Comparison](01_Simulation/仿真工具对比.en.md)** — Comprehensive simulator comparison
- **[NVIDIA Ecosystem](03_Ecosystem/NVIDIA生态.en.md)** — Omniverse, Isaac Lab, Cosmos, GR00T
- **[ROS2 Ecosystem](03_Ecosystem/ROS2.en.md)** — ros2_control, MoveIt 2, Nav2 deep dive
- **[Open-Source Frameworks](03_Ecosystem/开源框架.en.md)** — LeRobot, robomimic, robosuite, ManiSkill
- **[Development Toolchain](03_Ecosystem/开发工具链.en.md)** — URDF/MJCF, BT.CPP, Foxglove

## Recommended Reading Order

If you are new to this section, the most practical sequence is:

1. Start with [Simulation Platforms](01_Simulation/simulation_platforms.en.md) to map the simulator landscape.
2. Then read [Simulation Assets](01_Simulation/仿真资产.en.md) to understand how robots, objects, scenes, and sensors become usable assets.
3. Next read [Simulation World Building & Physics Rules](01_Simulation/仿真世界构建与物理规则.en.md) to understand how those assets are assembled into trainable, testable, transferable worlds.
4. Follow with [Simulation Tool Comparison](01_Simulation/仿真工具对比.en.md) and [NVIDIA Ecosystem](03_Ecosystem/NVIDIA生态.en.md) to complete platform and ecosystem selection.
5. Finally connect the stack to implementation through [ROS2 Ecosystem](03_Ecosystem/ROS2.en.md), [Open-Source Frameworks](03_Ecosystem/开源框架.en.md), and [Development Toolchain](03_Ecosystem/开发工具链.en.md).
