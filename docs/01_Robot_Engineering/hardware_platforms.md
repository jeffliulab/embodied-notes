# Hardware Platforms

## TurtleBot3

### 环境配置

最初和斯坦福合作构建ROS的公司Willow Garage为了方便广大开发者学习研究ROS，发布了低成本的ROS教学与研究平台TurtleBot。2013年，Willow Garage因资金问题逐渐解散，韩国公司Robotis接手了TurtleBot项目。

本页面介绍的就是TurtleBot3平台。该平台技术文档非常齐全年，非常适合入门者学习使用；国产的低价位教学机器人普遍的问题就是喜欢自己魔改Linux或者用被污染的Linux系统，要么就是压根无法编程，只能用一个不知道用来干什么的app操作。这个市场利润不大，愿意做的公司不多，一开始Willow Garage做这个我想也是为了推广自己的ROS平台。但就我自己的学习经验来看，这种教学平台对机器人初学者和爱好者来说是至关重要的。

安装ROS2 Humble后，还需要进行一些配置，[官方安装指引](https://emanual.robotis.com/docs/en/platform/turtlebot3/quick-start/)中有详细的介绍。

配置好后有几个常用操作：

```bash
# bring up (robot side)
ros2 launch turtlebot3_bringup robot.launch.py

# rviz (PC side)
ros2 launch turtlebot3_bringup rviz2.launch.py  

# SLAM (PC side)
ros2 launch turtlebot3_cartographer cartographer.launch.py

# teleoperation (PC side)
ros2 run teleop_twist_joy teleop_node

# save map (PC side) - create map.pgm, map.yaml
ros2 run nav2_map_server map_saver_cli -f ~/map

# navigation
ros2 launch turtlebot3_navigation2 navigation2.launch.py map:=$HOME/map.yaml

# close (robot side)
sudo shutdown now
```

Simulation:

```bash
# Below are different initial 
ros2 launch turtlebot3_gazebo empty_world.launch.py
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
ros2 launch turtlebot3_gazebo turtlebot3_house.launch.py
```

注意，上述turtlebot3官方教程中使用的还是classic gazebo，也就是ROS1时代的老版本gazebo。

新版的Gazebo Fortress安装后，常用命令包括：

```
# 启动空场景
ign gazebo
```

如果是Garden/Harmonic（对应ROS Jazzy)，则一般用 `gz sim`命令启动。但是因为同时安装老板和新版gazebo的情况下，gz命令已经被老版本占用，所以在Gazebo Fortress版本中采用 `ign gazebo`命令。

### 走迷宫项目

#### 目标

在我去年刚返回学校的时候，修的入门机器人课上，我所达成的第一个里程碑就是让自己的robot走出了迷宫。在这个任务之前，我先后学习了ROS、Gazebo、传感器、位姿、移动机器人、根据LiDAR数据调整机器人的动作、让机器人跟随地上的线前进、让机器人沿着墙壁前进。完成这些任务后，利用走出迷宫的左手法则，我成功实现了让robot走出迷宫的任务。一开始我的代码无比复杂，到最后我的代码已经非常简单了，可以在我的主页看到我的实践代码。

现在，我们来完成一个更加复杂的任务：让机器狗通过强化学习算法学会走迷宫。我们自然可以用硬编码的方式来设置走迷宫的任务，但是这里我的目的是让自己掌握一个现代端到端的训练方法，而不是传统的控制思路。类比于去年我完成的机器人任务，我们可以把这个走迷宫任务拆解为如下子任务来完成：

1. 选取一个合适的机器人，了解这个机器人有哪些关节、传感器等
2. 使用简单的代码控制机器人移动，了解机器人可能做哪些动作
3. 学会如何使用强化学习来训练机器人走路
4. 机器人学会走路后，了解如何将走路迁移到其他环境中
5. 下载或制作一个迷宫地图
6. 将会走路的机器人放入迷宫地图中，设置训练
7. 学会如何训练机器人走出迷宫
8. 改变迷宫环境，看看机器人是否还能走出迷宫
9. 总结实验，思考机器人走出迷宫的秘诀

## RoArm-M2-S

这个是我购买的一个比较便宜的4DOF机械臂。

## Kinova Kortex Gen3

### 环境配置

以我现在经常光顾的机器人实验室可以直接用的KINOVA KORTEX Gen3（7DOF版本，本页中若无特殊说明，机械臂都是指这个版本）机械臂为例，配置模拟环境并最终实现sim-2-real实机操作。

![1760140978479](../06_Software/image/play_chess/1760140978479.png){style="display:block; margin:auto; width:400px;"}

首先直接找到[官方文档](https://github.com/Kinovarobotics/ros2_kortex/tree/humble)，依次按顺序安装ROS2（本页若无特殊说明，都采用ROS2 Humble）, `ros-$ROS_DISTRO-kortex-bringup`，MoveIt 7DOF支持，Cyclone DDS。如果没有开发需求，不需要安装后面说的需要手动colcon的源码包，上述binary安装（也就是apt）就可以安装好。

安装完依赖项后，我们就可以启动Gazebo、MoveIt了。

启动robot URDF查看模型内容：

```
ros2 launch kortex_description view_robot.launch.py
arguments: (Note: lab's gen3 is 7 dof)
robot_type: gen3 (default), gen3_lite
gripper: robotiq_2f_85, robotiq_2f_140 (no gripper if not command)
dof: 7(default), 6
```

---

#### bringup

我们一般把在ROS2中启动一整套和机器人通信、控制、仿真、可视化的节点系统叫做“bringup”，就是把机器人带起来的意思，中文可以称为“启动”或者“上电”。当bringup成功运行后，这个机器人就接入到了ROS2网络中，此时它的硬件状态、控制接口、模型信息就全都在ROS里被虚拟化成消息、服务和动作接口了。也就是说，bringup成功后，机器人的所有信息就都在ROS2网络中了，我们可以接收这些信息，也可以发送信息给机器人。

**bringup机器人（fake hardware）：**

```
ros2 launch kortex_bringup gen3.launch.py \
  robot_ip:=yyy.yyy.yyy.yyy \
  use_fake_hardware:=true
```

虚拟模式bringup后，ROS会根据Kinova Gen3的URDF模型文件（机器人描述文件）在内存中生成一个和真实机器人一模一样的虚拟机器人。ROS会把这个模型加载到Rviz中进行可视化展示。

**bringup机器人（实机）：**

```
ros2 launch kortex_bringup gen3.launch.py \
  robot_ip:=192.168.1.10
```

实机模式启动后，ROS会通过网络连接到real hardware，从而可以读取真实传感器的数据，并可以通过ROS将控制命令发送给真实机器人，从而实现真实操作。

**相关参数：**

```
PARAMETERS
robot_ip: 机器人的IP地址，实机模式必须指定
use_fake_hardware: 默认为false,模拟开发必须指定
robot_controller: 控制方式，有两种，默认为(1)
    (1) joint_trajectory_controller: 轨迹控制
    (2) twist_controller: 速度控制
gripper: 默认不加载爪子，也可以改为官方的爪子：
     (1) robotiq_2f_85
     (2) robotiq_2f_140
launch_rviz: 默认为true,也可以设为false
gripper_joint_name: robotiq_85_left_knuckle_joint(default)
gripper_max_velocity: 100.0 (default) 
gripper_max_force: 100.0 (default) 
dof: 7 (default)
fake_sensor_commands: false (default)
controllers_file: ros2_controllers.yaml (default)
```

bringup的目的在于启动真实机器人或者fake机器人。但是注意，bringup中的fake hardware模式并非仿真启动，如果想要加载一个虚拟的机械臂、模拟重力、模拟碰撞等，需要启动simulation。

---

#### Simulation

Simulation不能和上面的bringup命令同时使用。这是两种不同的逻辑，不要混淆fake hardware和仿真模拟。Simulation可以模拟真实物理环境，可以做路径规划、强化学习、抓取测试等，可以与仿真传感器配合使用。

**启动仿真模拟：**

```
ros2 launch kortex_bringup kortex_sim_control.launch.py \
  use_sim_time:=true \
  launch_rviz:=false
```

**可选参数：**

```
# 选择模拟器，二选一：
sim_ignition: true (default)
sim_gazebo: false (default)

# 机器人模型选择
robot_type: gen3 (default), gen3_lite
robot_name: gen3 (dfault)
dof: 7 (default), 6
vision: false (default) 这个是官方提供了一个安装在手臂末端的视觉模组，实验室没有配置所以默认false就可以

# 机器人控制
robot_controller: joint_trajectory_controller (default) 这个是joint controller
robot_pos_controller: twist_controller (default) 这个是position controller
robot_hand_controller: robotiq_gripper_conntroller (default) 这个是gripper controller
controllers_file: ros2_controllers.yaml (default, ROS2 control configuration file)

# 其他
description_package: kortex_description (default), descriptionn package with robot URDF/XACRO files
description_file: URDF/XACRO description file with the robot. Default value is kinova.urdf.xacro
prefix: default is ""(none)
use_sim_time: true (default) 
gripper: "" (default), 可选 robotiq_2f_85, robotiq_2f_140
```

启动仿真后，我们可以看到机械臂：

![1760140932623](../06_Software/image/play_chess/1760140932623.png){style="display:block; margin:auto; width:400px;"}

---

#### MoveIt2

MoveIt2可以generate and execute motion plans。更多用法说明参考[官方文档](https://moveit.picknik.ai/main/index.html)。

Virtual Hardware启动：

```
ros2 launch kinova_gen3_7dof_robotiq_2f_85_moveit_config robot.launch.py \
  robot_ip:=yyy.yyy.yyy.yyy \
  use_fake_hardware:=true
```

Real-life Hardware启动：

```
ros2 launch kinova_gen3_7dof_robotiq_2f_85_moveit_config robot.launch.py \
  robot_ip:=192.168.1.10
```

Simulation控制启动：(先启动simulation,然后启动moveit)

```
ros2 launch kinova_gen3_7dof_robotiq_2f_85_moveit_config sim.launch.py \
  use_sim_time:=true
```

（注：这里使用pip安装的kinova bringup就会失败，改用source repo编译后就没有问题了。）

成功启动MoveIt后在MotionPlanning区域的Planning区域中将Planning Group修改为manipulator，然后就可以拖拽机械臂末端的交互标记（Interactive Marker），如下图所示，灰色的是现在simulation中机械臂停滞的位置，拖拽交互标记后可以移动到新的位置，然后点击plan&execute就可以让机械臂规划路径并移动到指定的位置，可以看到在gazebo中机械臂和MoveIt中是同步移动的。

![1760145896094](../06_Software/image/play_chess/1760145896094.png)

在Plan（规划）的过程中，机械臂通过当前姿态（start state）和交互标记设定的目标姿态（goal state），考虑三维空间中的障碍物（包括机械臂自己、桌子、或者自定义添加的物体）后，通过运动规划算法（如OMPL）来计算一条从起点到终点的可行路径。

计算路径后，点击Execute（执行），plan好的路径就会被转换为一系列控制指令发送给机器人控制器，然后控制器接收到指令后，就可以驱动机械臂的各个关节，让机械臂按照规划好的路径运动起来。

#### 工作区

现在我们已经知道如何配置模拟环境以及使用MoveIt来控制机械臂移动了。接下来，我们利用MoveIt的强大功能，来实现脚本控制机械臂。

这里确保在环境配置阶段我们使用的是colcon源码的安装方式。打开工作区 `~/workspace/ros2_kortex_ws`，之后我们的开发工作都在这里进行。这个文件夹结构是ROS2标准的colcon工作空间，可以把它想象成一个大车间，里头有不同的区域：

* src，源码区，这里存放着所有功能package的源代码。我们自己创建的新的package也放在这里。
* build，编译区，这个文件夹是colcon build命令的工厂。运行编译命令的时候，colcon会在这里处理src里的源代码，进行编译、链接等中间过程
* install，编译成功后，所有可执行文件、库文件、配置文件、launch文件等最终产物都会被整理好并安装在这里；我们运行 `source install/setup.bash`就是告诉系统在这里有我们已经编译好的程序
* log，日志区，存放每一次编译的日志文件；如果编译出错了，可以来这里查看详细的日志

我们可以用ros2的命令来创建package,创建后该package的相关文件就会出现在src文件夹下：

```
ros2 pkg create --build-type 
```

从技术上来讲，并不是必须创建一个package才能开发，但是从ROS开发的长远来看，把代码放进一个package是一个好处非常多的事情：

* package.xml清楚地声明了代码还需要哪些package,在新的电脑上rosdep工具可以一键自动安装依赖，不再需要手动一个个pip install
* 可以使用ROS命令ros2 run xxx来启动程序，ROS系统会自动找到并识别我们的程序
* 所有相关代码都在一个地方，易于维护和扩展
* 可以把src打包发给任何人，他们只需要colcon build一下就能完美复现环境

一般我们开发的过程是这样的：

1. 在src目录下创建package
2. 创建脚本文件，编写程序
3. 修改pckage目录下的setup.py，给程序添加位置信息和别名
4. 在工作区目录下colcon build
5. ros2 run package_name script_name

我们可以创建一个move_down package,然后创建一个简单的脚本。这里切换到cursor上来完成，cursor可以直接帮忙创建package、脚本等，非常方便。创建完成后编译，然后分别启动gazebo simulation，moveit,最后运行我们创建的脚本，即可看到机械臂按照moveit的路径规划，完成了向下移动的任务。

简单的向下移动脚本如下：

```python
#!/usr/bin/env python3

"""
Very Simple MoveIt2 Script for ROS2 Humble
Just moves the robot arm 0.1 meters down using MoveIt2.
"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Pose, Point, Quaternion
from moveit_msgs.srv import GetPositionIK
from moveit_msgs.msg import MoveItErrorCodes
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint
from sensor_msgs.msg import JointState
import time


class SimpleDownMovement(Node):
    def __init__(self):
        super().__init__('simple_down_movement')
  
        # Create publisher for joint trajectory
        self.trajectory_pub = self.create_publisher(
            JointTrajectory, 
            '/joint_trajectory_controller/joint_trajectory', 
            10
        )
  
        # Create subscriber for joint states
        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )
  
        # Store current joint states
        self.current_joint_states = None
  
        self.get_logger().info("Simple down movement initialized!")
        self.get_logger().info("Waiting for joint states...")
  
    def joint_state_callback(self, msg):
        """Store current joint states."""
        self.current_joint_states = msg
  
    def move_down(self):
        """Move robot arm 0.1 meters down using joint trajectory."""
        # Wait for joint states
        while self.current_joint_states is None and rclpy.ok():
            rclpy.spin_once(self, timeout_sec=0.1)
  
        if self.current_joint_states is None:
            self.get_logger().error("No joint states received!")
            return False
  
        # Get current joint positions
        current_positions = list(self.current_joint_states.position)
        self.get_logger().info(f"Current joint positions: {[f'{p:.3f}' for p in current_positions]}")
  
        # Create a simple movement by slightly adjusting joint 2 (usually the shoulder joint)
        # This will cause the arm to move down
        target_positions = current_positions.copy()
        if len(target_positions) > 1:
            target_positions[1] += 0.2  # Move joint 2 by 0.2 radians (downward)
  
        self.get_logger().info(f"Target joint positions: {[f'{p:.3f}' for p in target_positions]}")
  
        # Create joint trajectory message
        trajectory = JointTrajectory()
        trajectory.joint_names = self.current_joint_states.name
  
        # Create trajectory point
        point = JointTrajectoryPoint()
        point.positions = target_positions
        point.time_from_start.sec = 3  # 3 seconds to complete movement
  
        trajectory.points.append(point)
  
        # Publish trajectory
        self.get_logger().info("Publishing trajectory to move arm down...")
        self.trajectory_pub.publish(trajectory)
  
        # Wait for movement to complete
        time.sleep(4)
  
        self.get_logger().info("Movement command sent! Robot should move down.")
        return True


def main():
    rclpy.init()
  
    try:
        # Create node
        node = SimpleDownMovement()
  
        # Wait a moment for initialization
        time.sleep(2)
  
        # Move down
        node.move_down()
  
        # Keep node alive for a bit
        time.sleep(2)
  
    except Exception as e:
        print(f"Error: {e}")
    finally:
        rclpy.shutdown()


if __name__ == '__main__':
    main()

```
