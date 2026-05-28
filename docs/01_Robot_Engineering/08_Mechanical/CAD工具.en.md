# CAD Tools

## Introduction

CAD (Computer-Aided Design) tools are the core software for robot mechanical design. From concept modeling to detailed design, from structural simulation to manufacturing drawings, CAD is integral to the entire design workflow. This section compares mainstream CAD tools and introduces the URDF/MJCF export process specific to robotics.

> **Simulation and development toolchain**: See [Development Toolchain](../../08_Embodied_Intelligence/06_Software/开发工具链.md)

## Mainstream CAD Tool Comparison

| Feature | SolidWorks | Fusion 360 | OnShape | FreeCAD |
|---------|-----------|------------|---------|---------|
| Type | Parametric | Parametric + Direct | Parametric | Parametric |
| Platform | Windows | Windows/Mac/Web | Browser | All platforms |
| Price | ~35,000+ RMB/yr | Free (personal) / ~4,000 RMB/yr | Free (education) / ~12,000 RMB/yr | Free open-source |
| Learning curve | Medium | Lower | Lower | Steeper |
| Assembly | Strong | Medium | Strong | Medium |
| Simulation | Strong (paid) | Medium | Weak | Medium (FEM) |
| Rendering | Strong | Strong | Weak | Weak |
| CAM | Paid plugin | Built-in | Paid plugin | Built-in (Path) |
| Collaboration | PDM (paid) | Cloud | Cloud real-time | Git |
| API/Scripting | VBA/C# | Python/JS | FeatureScript | Python |
| URDF export | Plugin | Plugin | Third-party | Plugin |

## SolidWorks

### Features

SolidWorks is the most widely used parametric CAD software in industry:

- **Parametric modeling**: Feature-based modeling; modifying parameters automatically updates the model
- **Assembly design**: Mature constraint (Mate) system, supports large assemblies
- **Engineering drawings**: Automatic generation of standards-compliant 2D drawings
- **Simulation**: SolidWorks Simulation provides static/dynamic/thermal/fluid analysis
- **Ecosystem**: Extensive plugin library and parts libraries (McMaster, Misumi)

### URDF Export

SolidWorks has a dedicated ROS URDF export plugin **sw2urdf**:

1. Install the `sw_urdf_exporter` plugin
2. Define joint types and axes in the assembly
3. Define parent-child relationships for Links and Joints
4. Export URDF file + STL/DAE mesh files

```bash
# Install sw2urdf plugin
# Download from GitHub: ros/solidworks_urdf_exporter
# Run installer, activate plugin in SolidWorks
```

### Suitable Scenarios

- Professional robot companies' product development
- Need to produce engineering drawings for machining
- Large assemblies (>500 parts)
- Team collaboration (using PDM)

## Fusion 360

### Features

Fusion 360 is Autodesk's cloud-based integrated CAD/CAM/CAE tool:

- **Free tier available**: Free for personal non-commercial use
- **Multi-function integration**: Modeling, assembly, simulation, rendering, CAM, PCB (Eagle integration)
- **Cloud storage**: Projects automatically sync to the cloud
- **Collaboration**: Shareable links for others to view/edit
- **CAM capability**: Directly generates CNC toolpaths and G-code

### URDF Export

Using the **fusion2urdf** or **Fusion2PyBullet** plugin:

```python
# fusion2urdf installation steps:
# 1. Download fusion2urdf plugin
# 2. Fusion 360 → Scripts and Add-Ins → Add-Ins → +
# 3. Select plugin directory
# 4. Run plugin in assembly
# 5. Define Base Link and each Joint
# 6. Export URDF + mesh files
```

### Suitable Scenarios

- Individual / small team robot projects
- Need for rapid prototyping design
- Need for integrated CAM (CNC machining)
- Students and hobbyists

## OnShape

### Features

OnShape is a fully browser-based CAD tool:

- **Runs in browser**: No installation needed, usable on any device
- **Real-time collaboration**: Like Google Docs, multiple people edit simultaneously
- **Version control**: Git-like version management, branching/merging
- **FeatureScript**: Scripting language for custom parametric features
- **Free education tier**: Free for students and educational institutions

### Unique Features

- **Standard Content**: Rich standard parts library
- **Simultaneous Editing**: Multiple people editing the same assembly in real time
- **Branching & Merging**: Design version branch management
- **REST API**: Complete API for programmatic access

### URDF Export

Using the **onshape-to-robot** tool:

```bash
# Install
pip install onshape-to-robot

# Configuration (config.json)
{
    "documentId": "your_document_id",
    "outputFormat": "urdf",
    "robotName": "my_robot"
}

# Export
onshape-to-robot config.json
```

### Suitable Scenarios

- Team collaboration projects
- No high-end computer (even Chromebooks work)
- Open-source robot projects (free public sharing)
- Educational environments

## FreeCAD

### Features

FreeCAD is an open-source parametric CAD software:

- **Completely free and open-source**: GPL license
- **Cross-platform**: Windows/Mac/Linux
- **Python scripting**: Deep Python integration, programmable modeling
- **Modular**: Extensible via Workbenches
- **FEM analysis**: Built-in finite element analysis module

### Main Workbenches

| Workbench | Function |
|-----------|----------|
| Part Design | Parametric solid modeling |
| Assembly | Assembly (A2plus/Assembly4) |
| FEM | Finite element analysis |
| Path | CAM/CNC toolpaths |
| TechDraw | 2D engineering drawings |
| Robot | Robot simulation (basic) |

### URDF Export

Using the **FreeCAD ROS Workbench** or manual export:

```python
# FreeCAD Python script to export STL
import FreeCAD
import Mesh

doc = FreeCAD.open("robot.FCStd")
for obj in doc.Objects:
    if obj.Shape:
        Mesh.export([obj], f"{obj.Label}.stl")
```

Combine with hand-written URDF files or use the `freecad_to_urdf` tool.

### Suitable Scenarios

- Budget-constrained projects
- Linux users
- Need for Python-scripted modeling
- Introductory CAD learning

## URDF/MJCF Model Export

### URDF (Unified Robot Description Format)

URDF is the standard XML format for describing robot models in the ROS ecosystem:

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <!-- Base -->
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

  <!-- Joint -->
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="3.14"/>
  </joint>

  <!-- Link 1 -->
  <link name="link1">
    <!-- visual, collision, inertial -->
  </link>
</robot>
```

### MJCF (MuJoCo XML Format)

MJCF is the model format for the MuJoCo physics engine, widely used in reinforcement learning simulation:

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

### Export Workflow

<div class="diagram">
<svg viewBox="0 0 900 240" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arr-m0" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--dia-stroke)"/></marker></defs>
  
  <line x1="180" y1="135" x2="270" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="95" x2="500" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="730" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="95" x2="730" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="870" y1="175" x2="960" y2="135" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="180" y1="135" x2="270" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="410" y1="175" x2="500" y2="175" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="175" x2="730" y2="95" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <line x1="640" y1="175" x2="960" y2="135" stroke="var(--dia-stroke)" stroke-width="1.5" marker-end="url(#arr-m0)"/>
  <rect x="40" y="110" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="40" y="110" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="110" y="132" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">CAD Model</text>
  <text x="110" y="146" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">SolidWorks/Fusion360</text>
  <rect x="270" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="70" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Export Plugin</text>
  <rect x="500" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="70" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="99" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">URDF + STL meshes</text>
  <rect x="730" y="70" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="70" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="92" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">ROS/ROS2 Gazebo</text>
  <text x="800" y="106" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Simulation</text>
  <rect x="730" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="730" y="150" width="3" height="50" fill="var(--dia-accent)"/>
  <text x="800" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">URDF→MJCF</text>
  <text x="800" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Conversion</text>
  <rect x="960" y="110" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="960" y="110" width="3" height="50" fill="var(--dia-green)"/>
  <text x="1030" y="139" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">MuJoCo Simulation</text>
  <rect x="270" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="270" y="150" width="3" height="50" fill="var(--dia-green)"/>
  <text x="340" y="179" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Manual STL Export</text>
  <rect x="500" y="150" width="140" height="50" rx="4" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.6"/>
  <rect x="500" y="150" width="3" height="50" fill="var(--dia-blue)"/>
  <text x="570" y="172" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">Hand-written</text>
  <text x="570" y="186" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="12" fill="var(--dia-stroke)">URDF/MJCF</text>
</svg>
</div>


### Mesh Simplification

Collision meshes used in simulation should be simplified to improve simulation speed:

| Tool | Method | Suitable For |
|------|--------|-------------|
| MeshLab | Quadric edge collapse | General simplification |
| Blender | Decimate modifier | Visual simplification |
| V-HACD | Convex decomposition | Collision meshes |
| trimesh (Python) | Programmatic simplification | Batch processing |

```bash
# Using trimesh for mesh simplification
pip install trimesh

python -c "
import trimesh
mesh = trimesh.load('robot_part.stl')
simplified = mesh.simplify_quadric_decimation(1000)  # Simplify to 1000 faces
simplified.export('robot_part_simple.stl')
"
```

## Assembly Design Tips

### Special Considerations for Robot Assemblies

1. **Clear joint definitions**: Clearly define rotation axis and range of motion for each joint
2. **Interference checking**: Ensure no collisions within the range of motion
3. **Center of gravity calculation**: Use CAD mass properties to compute CG
4. **Inertia calculation**: URDF requires accurate inertia matrices
5. **Cable space**: Model cable routing paths
6. **Maintenance accessibility**: Ensure screws and connectors are operable

### Obtaining Inertia Matrices

CAD software can directly compute inertia matrices for parts/assemblies:

- **SolidWorks**: Evaluate → Mass Properties
- **Fusion 360**: Inspect → Physical Properties
- **OnShape**: Right-click → Mass Properties

Output format is typically:

$$I = \begin{bmatrix} I_{xx} & I_{xy} & I_{xz} \\ I_{xy} & I_{yy} & I_{yz} \\ I_{xz} & I_{yz} & I_{zz} \end{bmatrix}$$

## Recommended Workflows

### Individual / Small Team

```
Fusion 360 (modeling) → fusion2urdf (export) → Gazebo (simulation) → 3D print/CNC (manufacturing)
```

### Education / Open-Source Projects

```
OnShape (modeling + collaboration) → onshape-to-robot (export) → MuJoCo (simulation) → 3D print (manufacturing)
```

### Professional Teams

```
SolidWorks (modeling) → sw2urdf (export) → Gazebo/Isaac Sim (simulation) → CNC + injection molding (manufacturing)
```

### Budget-Constrained

```
FreeCAD (modeling) → Hand-written URDF + STL export → Gazebo (simulation) → 3D print (manufacturing)
```

## References

- SolidWorks URDF Exporter: [GitHub - ros/solidworks_urdf_exporter](https://github.com/ros/solidworks_urdf_exporter)
- fusion2urdf: [GitHub](https://github.com/syuntoku14/fusion2urdf)
- onshape-to-robot: [GitHub](https://github.com/Rhoban/onshape-to-robot)
- FreeCAD Documentation: [freecad.org](https://www.freecad.org)
- URDF Specification: [wiki.ros.org/urdf](http://wiki.ros.org/urdf)
- MJCF Documentation: [mujoco.readthedocs.io](https://mujoco.readthedocs.io)
