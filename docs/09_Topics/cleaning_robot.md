# 扫地机器人

扫地机器人是强化学习和机器人技术的经典应用场景之一。它涉及路径规划、环境感知、避障、覆盖率优化等核心问题，是学习机器人开发的良好切入点。

---

## 项目版本

扫地机器人项目主要分为两个版本：

1. **基于 ROS 的仿真版本**：在 Gazebo 仿真环境中实现，使用 ROS 框架进行通信和控制
2. **基于强化学习的版本**：使用 RL 算法（如 DQN/PPO）训练智能体学习清扫策略

---

## 核心技术问题

### 覆盖路径规划 (Coverage Path Planning)

扫地机器人的首要任务是**覆盖整个可达区域**，同时尽量减少重复清扫。

**传统方法：**

- **弓字形（Boustrophedon）路径**：像耕田一样来回走，简单但需要精确定位
- **螺旋形路径**：从中心或边缘开始螺旋清扫
- **分区覆盖**：先将空间分成若干子区域，然后对每个子区域分别规划路径

**基于RL的方法：**

- 将房间网格化，智能体在每个格子上选择移动方向
- 奖励设计：覆盖新区域 +1，重复访问 -0.1，撞墙 -1，全部覆盖 +100
- 状态表示：当前位置 + 已覆盖区域的二值地图 + 传感器读数

### SLAM (同步定位与建图)

扫地机器人需要在未知环境中同时完成定位和建图：

- **激光 SLAM**：使用 LiDAR 传感器，精度高但成本较高（如 Roborock）
- **视觉 SLAM**：使用摄像头，成本低但计算量大（如 iRobot Roomba j 系列）
- **惯性导航 + 编码器**：低成本方案，精度较差，适合入门级产品

### 避障

- **红外/超声波传感器**：检测近距离障碍物
- **碰撞传感器**：物理接触检测，作为最后的安全保障
- **深度相机/3D ToF**：获取障碍物的三维信息，实现更智能的避障
- **AI视觉识别**：识别电线、鞋子、宠物粪便等特定障碍物并主动规避

---

## 简单RL实现思路

使用 OpenAI Gym 风格定义扫地机器人环境：

```python
import gymnasium as gym
import numpy as np

class CleaningRobotEnv(gym.Env):
    def __init__(self, grid_size=10):
        self.grid_size = grid_size
        self.action_space = gym.spaces.Discrete(4)  # 上下左右
        self.observation_space = gym.spaces.Box(
            low=0, high=1,
            shape=(grid_size, grid_size, 2),  # 通道0:障碍物, 通道1:已清扫
            dtype=np.float32
        )

    def reset(self):
        self.robot_pos = [0, 0]
        self.cleaned = np.zeros((self.grid_size, self.grid_size))
        self.cleaned[0][0] = 1
        return self._get_obs(), {}

    def step(self, action):
        # 移动机器人
        dx, dy = [(0,-1), (0,1), (-1,0), (1,0)][action]
        new_x = np.clip(self.robot_pos[0] + dx, 0, self.grid_size - 1)
        new_y = np.clip(self.robot_pos[1] + dy, 0, self.grid_size - 1)

        # 计算奖励
        reward = -0.1  # 步数惩罚
        if self.cleaned[new_x][new_y] == 0:
            reward = 1.0  # 覆盖新区域
        self.robot_pos = [new_x, new_y]
        self.cleaned[new_x][new_y] = 1

        # 检查是否完成
        coverage = self.cleaned.sum() / self.cleaned.size
        done = coverage >= 0.95

        return self._get_obs(), reward, done, False, {"coverage": coverage}
```

---

## 覆盖路径规划详解

### 传统算法

**Boustrophedon 分解**（牛耕式）：
- 将自由空间沿垂直方向分解为若干梯形/矩形子区域（cell）
- 在每个子区域内做往返式覆盖（像犁地一样左右来回）
- 子区域间通过连接图（Reeb Graph）规划遍历顺序
- 保证完全覆盖（completeness），是学术和工业界最常用的方法

**Spanning Tree Coverage（STC）**：
- 将地图栅格化，构建生成树（Spanning Tree）
- 机器人沿生成树边界行走即可实现完全覆盖
- 优点：路径连续无重复，适合规则环境
- 缺点：对复杂障碍物形状敏感

### RL 方法建模

将覆盖规划建模为 MDP：
- **State**：机器人位置 + 已覆盖地图（visited mask）
- **Action**：移动方向（4 或 8 方向）
- **Reward**：覆盖新区域 +1，重复访问 -0.1，撞墙 -1
- **终止条件**：覆盖率达到阈值（如 98%）或步数上限

RL 相比传统方法的优势：能学习适应动态障碍物、不规则房间形状、以及多房间切换策略。

---

## SLAM 技术对比

| 方法 | 传感器 | 精度 | 计算量 | 适用场景 |
|------|--------|------|--------|---------|
| **Gmapping** | 2D 激光雷达 | 高（室内 <5cm） | 低 | 平面环境，扫地机器人首选 |
| **Cartographer** | 2D/3D 激光雷达 | 高 | 中 | 大规模环境，Google 开源 |
| **ORB-SLAM3** | 单目/双目/RGB-D | 中 | 高 | 视觉 SLAM，成本低 |
| **RTAB-Map** | RGB-D + 激光 | 高 | 高 | 多传感器融合，3D 重建 |

**扫地机器人常用方案**：低成本产品用 LDS（激光距离传感器）+ Gmapping；高端产品用 vSLAM（视觉 SLAM）+ 结构光。

---

## RL 导航建模

**状态空间设计**：
- 激光雷达扫描（如 360 个距离值）
- 当前位置和朝向（相对于目标）
- 历史速度信息

**动作空间设计**：
- 离散：{前进, 左转, 右转, 停止}
- 连续：(线速度 $v$, 角速度 $\omega$)，更平滑但训练更难

**奖励函数设计**：
```
r = r_goal + r_collision + r_progress + r_time
  = (+100 到达目标) + (-100 碰撞) + (Δd 接近目标) + (-0.01 每步惩罚)
```

**常用算法**：PPO（稳定易调参）、SAC（连续动作空间效果好）、TD3（确定性策略低方差）

---

## 仿真环境

| 环境 | 特点 | 适用场景 |
|------|------|---------|
| **Gazebo + ROS2** | 物理仿真精确，传感器模拟逼真 | 完整系统开发、Sim-to-Real |
| **PyBullet** | 轻量 Python 接口 | 快速原型验证 |
| **Isaac Sim** | GPU 加速，大规模并行仿真 | 大批量 RL 训练 |
| **自定义 Gym** | 2D 栅格环境，训练速度最快 | 算法开发和调试 |

**推荐路线**：先在自定义 Gym 环境验证算法 → PyBullet 增加物理复杂度 → Gazebo/Isaac Sim 接入真实传感器 → 实机部署。

---

## 参考

- Choset, "Coverage of Known Spaces: The Boustrophedon Cellular Decomposition", Autonomous Robots, 2000
- [ROS Navigation Stack](http://wiki.ros.org/navigation)
- Tai et al., "Virtual-to-real Deep Reinforcement Learning: Continuous Control of Mobile Robots for Mapless Navigation", IROS 2017
