# Cleaning Robot

The cleaning robot is one of the classic application scenarios for reinforcement learning and robotics. It involves core challenges such as path planning, environment perception, obstacle avoidance, and coverage optimization, making it an excellent entry point for learning robot development.

---

## Project Versions

The cleaning robot project is divided into two main versions:

1. **ROS-based simulation version**: Implemented in the Gazebo simulation environment, using the ROS framework for communication and control
2. **Reinforcement learning-based version**: Uses RL algorithms (e.g., DQN/PPO) to train an agent to learn cleaning strategies

---

## Core Technical Challenges

### Coverage Path Planning

The primary task of a cleaning robot is to **cover the entire reachable area** while minimizing redundant sweeping.

**Traditional methods:**

- **Boustrophedon path**: Moves back and forth like plowing a field — simple but requires precise localization
- **Spiral path**: Sweeps in a spiral pattern starting from the center or the edges
- **Zone-based coverage**: Divides the space into sub-regions first, then plans a path for each sub-region individually

**RL-based methods:**

- Discretize the room into a grid, where the agent selects a movement direction at each cell
- Reward design: covering a new area +1, revisiting a cell -0.1, hitting a wall -1, full coverage +100
- State representation: current position + binary map of covered area + sensor readings

### SLAM (Simultaneous Localization and Mapping)

A cleaning robot must perform localization and mapping simultaneously in an unknown environment:

- **LiDAR SLAM**: Uses LiDAR sensors; high accuracy but relatively expensive (e.g., Roborock)
- **Visual SLAM**: Uses cameras; lower cost but computationally intensive (e.g., iRobot Roomba j series)
- **Inertial navigation + encoders**: A low-cost solution with limited accuracy, suitable for entry-level products

### Obstacle Avoidance

- **Infrared / ultrasonic sensors**: Detect nearby obstacles
- **Bump sensors**: Physical contact detection, serving as a last line of safety
- **Depth cameras / 3D ToF**: Capture 3D information about obstacles for more intelligent avoidance
- **AI-based visual recognition**: Identifies specific obstacles such as cables, shoes, and pet waste, and proactively avoids them

---

## Simple RL Implementation

Define a cleaning robot environment in the OpenAI Gym style:

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

## References

- Choset, "Coverage of Known Spaces: The Boustrophedon Cellular Decomposition", Autonomous Robots, 2000
- [ROS Navigation Stack](http://wiki.ros.org/navigation)
