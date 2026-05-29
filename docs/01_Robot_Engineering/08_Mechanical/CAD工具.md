# CAD工具

## 概述

CAD（Computer-Aided Design）工具是机器人机械设计的核心软件。从概念建模到详细设计、从结构仿真到制造出图，CAD贯穿整个设计流程。本节对比主流CAD工具并介绍机器人特有的URDF/MJCF导出流程。

> **仿真与开发工具链**请参考：[开发工具链](../../03_Sim2Real/03_Ecosystem/开发工具链.md)

## 主流CAD工具对比

| 特性 | SolidWorks | Fusion 360 | OnShape | FreeCAD |
|------|-----------|------------|---------|---------|
| 类型 | 参数化 | 参数化+直接 | 参数化 | 参数化 |
| 平台 | Windows | Windows/Mac/Web | 浏览器 | 全平台 |
| 价格 | ¥35000+/年 | 免费(个人)/¥4000/年 | 免费(教育)/¥12000/年 | 免费开源 |
| 学习曲线 | 中等 | 较低 | 较低 | 较陡 |
| 装配功能 | 强 | 中 | 强 | 中 |
| 仿真 | 强(付费) | 中 | 弱 | 中(FEM) |
| 渲染 | 强 | 强 | 弱 | 弱 |
| CAM | 付费插件 | 内置 | 付费插件 | 内置(Path) |
| 协作 | PDM(付费) | 云端 | 云端实时 | Git |
| API/脚本 | VBA/C# | Python/JS | FeatureScript | Python |
| URDF导出 | 插件 | 插件 | 第三方 | 插件 |

## SolidWorks

### 特点

SolidWorks是工业界使用最广泛的参数化CAD软件：

- **参数化建模**：基于特征的建模，修改参数自动更新
- **装配设计**：成熟的约束（Mate）系统，支持大型装配
- **工程图**：自动生成符合标准的2D工程图
- **仿真**：SolidWorks Simulation提供静力学/动力学/热/流体分析
- **生态系统**：庞大的插件库和零件库（McMaster、Misumi）

### URDF导出

SolidWorks有专门的ROS URDF导出插件 **sw2urdf**：

1. 安装 `sw_urdf_exporter` 插件
2. 在装配体中定义关节（Joint）类型和轴线
3. 定义Link和Joint的父子关系
4. 导出URDF文件 + STL/DAE网格文件

```bash
# 安装 sw2urdf 插件
# 从 GitHub 下载: ros/solidworks_urdf_exporter
# 运行安装程序，在SolidWorks中激活插件
```

### 适用场景

- 专业机器人公司的产品开发
- 需要出工程图进行加工
- 大型装配体（>500个零件）
- 团队协作（使用PDM）

## Fusion 360

### 特点

Fusion 360 是Autodesk推出的云端CAD/CAM/CAE一体化工具：

- **免费版可用**：个人非商业用途免费
- **多功能集成**：建模、装配、仿真、渲染、CAM、PCB（Eagle集成）
- **云端存储**：项目自动同步到云端
- **协作**：可分享链接给他人查看/编辑
- **CAM功能**：直接生成CNC刀路和G-code

### URDF导出

使用 **fusion2urdf** 或 **Fusion2PyBullet** 插件：

```python
# fusion2urdf 安装步骤：
# 1. 下载 fusion2urdf 插件
# 2. Fusion 360 → Scripts and Add-Ins → Add-Ins → +
# 3. 选择插件目录
# 4. 在装配体中运行插件
# 5. 定义Base Link和各Joint
# 6. 导出URDF + mesh文件
```

### 适用场景

- 个人/小团队机器人项目
- 需要快速原型设计
- 需要集成CAM（CNC加工）
- 学生和爱好者

## OnShape

### 特点

OnShape 是完全基于浏览器的CAD工具：

- **浏览器运行**：无需安装，任何设备可用
- **实时协作**：类似Google Docs，多人同时编辑
- **版本控制**：类Git的版本管理，分支/合并
- **FeatureScript**：自定义参数化特征的脚本语言
- **教育版免费**：学生和教育机构免费使用

### 特色功能

- **零件库（Standard Content）**：丰富的标准件库
- **Simultaneous Editing**：多人实时编辑同一装配体
- **Branching & Merging**：设计版本的分支管理
- **REST API**：完整的API，可编程访问

### URDF导出

使用 **onshape-to-robot** 工具：

```bash
# 安装
pip install onshape-to-robot

# 配置 (config.json)
{
    "documentId": "your_document_id",
    "outputFormat": "urdf",
    "robotName": "my_robot"
}

# 导出
onshape-to-robot config.json
```

### 适用场景

- 团队协作项目
- 没有高配电脑（Chromebook也可用）
- 开源机器人项目（免费公开分享）
- 教育环境

## FreeCAD

### 特点

FreeCAD 是开源的参数化CAD软件：

- **完全免费开源**：GPL协议
- **跨平台**：Windows/Mac/Linux
- **Python脚本**：深度Python集成，可编程建模
- **模块化**：通过Workbench扩展功能
- **FEM分析**：内置有限元分析模块

### 主要Workbench

| Workbench | 功能 |
|-----------|------|
| Part Design | 参数化实体建模 |
| Assembly | 装配（A2plus/Assembly4） |
| FEM | 有限元分析 |
| Path | CAM/CNC刀路 |
| TechDraw | 2D工程图 |
| Robot | 机器人仿真（基础） |

### URDF导出

使用 **FreeCAD ROS Workbench** 或手动导出：

```python
# FreeCAD Python 脚本导出 STL
import FreeCAD
import Mesh

doc = FreeCAD.open("robot.FCStd")
for obj in doc.Objects:
    if obj.Shape:
        Mesh.export([obj], f"{obj.Label}.stl")
```

配合手写URDF文件或使用 `freecad_to_urdf` 工具。

### 适用场景

- 预算有限的项目
- Linux用户
- 需要Python脚本化建模
- 学习CAD的入门选择

## URDF/MJCF 模型导出

### URDF（Unified Robot Description Format）

URDF 是ROS生态中描述机器人模型的标准XML格式：

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <!-- 基座 -->
  <link name="base_link">
    <visual>
      <geometry>
        <mesh filename="package://my_robot/meshes/base.stl"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <mesh filename="package://my_robot/meshes/base_collision.stl"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.02"/>
    </inertial>
  </link>

  <!-- 关节 -->
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="3.14"/>
  </joint>

  <!-- 连杆1 -->
  <link name="link1">
    <!-- visual, collision, inertial -->
  </link>
</robot>
```

### MJCF（MuJoCo XML Format）

MJCF 是MuJoCo物理引擎的模型格式，在强化学习仿真中广泛使用：

```xml
<mujoco model="my_robot">
  <worldbody>
    <body name="base" pos="0 0 0.5">
      <geom type="mesh" mesh="base"/>
      <joint name="joint1" type="hinge" axis="0 0 1"/>
      <body name="link1" pos="0 0 0.1">
        <geom type="mesh" mesh="link1"/>
      </body>
    </body>
  </worldbody>

  <asset>
    <mesh name="base" file="base.stl"/>
    <mesh name="link1" file="link1.stl"/>
  </asset>
</mujoco>
```

### 导出流程

<!-- SVG-DESIGN-NOTES
Type: A (结构 — CAD→仿真导出的双路径汇聚 DAG：自动插件路 vs 手动路，最终都收敛到 URDF/MJCF）
Q0: CAD 导出仿真不是一串杂乱方框，而是一个「分叉-汇聚」图：从 CAD 模型出发有两条平行路径（上：导出插件→URDF+STL，省事；下：手动导 STL→手写 URDF/MJCF，可控），两路都汇入同一组仿真目标（Gazebo / 经 URDF→MJCF 转换的 MuJoCo），关键几何是「两路并行、终点收敛」
Q1: 单一源点 CAD → 上下两条分叉链（自动 vs 手动，分别用 green/blue 区分）→ 汇聚到右侧仿真目标群（Gazebo、MuJoCo），URDF→MJCF 是 Gazebo 路到 MuJoCo 的桥
Q2: 去掉标题：一源 → 两并行链 → 汇聚到仿真群 = CAD 导出工具链 DNA，认得出不是乱框
Q3: 删去 9 个等大方框 + 9 条交叉箭头；改为清晰双路径汇聚 DAG
Q4: 每节点直标工具/格式；两条路径直标「自动 / 手动」与各自取舍
Q5: 全 var(--dia-*)；中文标签英文版另制
-->
<div class="diagram">
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="cad-ar" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/></marker></defs>
  <text x="360" y="24" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="16" fill="var(--dia-stroke)">CAD → 仿真导出 — 自动路与手动路汇聚到同一组目标</text>

  <!-- source -->
  <rect x="30" y="130" width="120" height="56" rx="6" fill="var(--dia-accent)" fill-opacity="0.16" stroke="var(--dia-accent)" stroke-width="1.7"/>
  <text x="90" y="152" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" font-weight="600" fill="var(--dia-stroke)">CAD 模型</text>
  <text x="90" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="var(--dia-stroke-soft)">SolidWorks / Fusion360</text>

  <!-- auto path (top, green) -->
  <path d="M 150 145 C 190 110, 210 90, 250 90" fill="none" stroke="var(--dia-green)" stroke-width="1.6" marker-end="url(#cad-ar)"/>
  <text x="200" y="74" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-green)">自动路 · 省事</text>
  <rect x="250" y="70" width="110" height="40" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-green)" stroke-width="1.4"/>
  <text x="305" y="94" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-stroke)">导出插件</text>
  <path d="M 360 90 L 410 90" stroke="var(--dia-stroke-soft)" stroke-width="1.2" marker-end="url(#cad-ar)"/>
  <rect x="410" y="70" width="120" height="40" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.3"/>
  <text x="470" y="94" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">URDF + STL</text>

  <!-- manual path (bottom, blue) -->
  <path d="M 150 170 C 190 205, 210 230, 250 230" fill="none" stroke="var(--dia-blue)" stroke-width="1.6" marker-end="url(#cad-ar)"/>
  <text x="200" y="250" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-blue)">手动路 · 可控</text>
  <rect x="250" y="210" width="110" height="40" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-blue)" stroke-width="1.4"/>
  <text x="305" y="234" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-stroke)">手动导 STL</text>
  <path d="M 360 230 L 410 230" stroke="var(--dia-stroke-soft)" stroke-width="1.2" marker-end="url(#cad-ar)"/>
  <rect x="410" y="210" width="120" height="40" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.3"/>
  <text x="470" y="234" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">手写 URDF/MJCF</text>

  <!-- convergence to sim targets -->
  <path d="M 530 90 C 580 90, 590 130, 610 145" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2" marker-end="url(#cad-ar)"/>
  <path d="M 530 230 C 580 230, 590 190, 610 175" fill="none" stroke="var(--dia-stroke-soft)" stroke-width="1.2" marker-end="url(#cad-ar)"/>
  <rect x="610" y="130" width="90" height="32" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="655" y="150" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-stroke)">Gazebo</text>
  <rect x="610" y="170" width="90" height="32" rx="5" fill="var(--dia-bg-card)" stroke="var(--dia-accent)" stroke-width="1.5"/>
  <text x="655" y="190" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="10" fill="var(--dia-stroke)">MuJoCo</text>

  <!-- URDF->MJCF bridge -->
  <path d="M 655 162 L 655 170" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 2"/>
  <text x="655" y="222" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">URDF→MJCF 转换桥</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — CAD 导出仿真是分叉-汇聚图：自动路（导出插件→URDF+STL，省事）与手动路（手动 STL→手写 URDF/MJCF，可控）并行，最终都汇入 Gazebo / MuJoCo（经 URDF→MJCF 桥）。</p>


### 网格简化

仿真用的碰撞网格（Collision Mesh）应简化以提高仿真速度：

| 工具 | 方法 | 适用 |
|------|------|------|
| MeshLab | 二次边折叠 | 通用简化 |
| Blender | Decimate修改器 | 可视化简化 |
| V-HACD | 凸分解 | 碰撞网格 |
| trimesh (Python) | 编程简化 | 批量处理 |

```bash
# 使用 trimesh 简化网格
pip install trimesh

python -c "
import trimesh
mesh = trimesh.load('robot_part.stl')
simplified = mesh.simplify_quadric_decimation(1000)  # 简化到1000面
simplified.export('robot_part_simple.stl')
"
```

## 装配设计技巧

### 机器人装配的特殊考虑

1. **关节定义清晰**：每个运动关节明确定义旋转轴和运动范围
2. **干涉检查**：确保运动范围内无碰撞
3. **重心计算**：利用CAD的质量属性功能计算重心
4. **惯量计算**：URDF需要精确的惯量矩阵
5. **线缆空间**：建模线缆走线路径
6. **维护可达性**：螺丝和连接器要可操作

### 惯量矩阵获取

CAD软件可以直接计算零件/装配体的惯量矩阵：

- **SolidWorks**：评估 → 质量属性
- **Fusion 360**：检查 → 物理属性
- **OnShape**：右键 → Mass Properties

输出格式通常为：

$$I = \begin{bmatrix} I_{xx} & I_{xy} & I_{xz} \\ I_{xy} & I_{yy} & I_{yz} \\ I_{xz} & I_{yz} & I_{zz} \end{bmatrix}$$

## 推荐工作流

### 个人/小团队

```
Fusion 360 (建模) → fusion2urdf (导出) → Gazebo (仿真) → 3D打印/CNC (制造)
```

### 教育/开源项目

```
OnShape (建模+协作) → onshape-to-robot (导出) → MuJoCo (仿真) → 3D打印 (制造)
```

### 专业团队

```
SolidWorks (建模) → sw2urdf (导出) → Gazebo/Isaac Sim (仿真) → CNC+注塑 (制造)
```

### 预算有限

```
FreeCAD (建模) → 手写URDF + STL导出 → Gazebo (仿真) → 3D打印 (制造)
```

## 参考资源

- SolidWorks URDF Exporter: [GitHub - ros/solidworks_urdf_exporter](https://github.com/ros/solidworks_urdf_exporter)
- fusion2urdf: [GitHub](https://github.com/syuntoku14/fusion2urdf)
- onshape-to-robot: [GitHub](https://github.com/Rhoban/onshape-to-robot)
- FreeCAD Documentation: [freecad.org](https://www.freecad.org)
- URDF Specification: [wiki.ros.org/urdf](http://wiki.ros.org/urdf)
- MJCF Documentation: [mujoco.readthedocs.io](https://mujoco.readthedocs.io)
