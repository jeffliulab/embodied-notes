# Humanoid Robots

## Overview: Why Humanoid Robots?

Humanoid robots have always been the ultimate goal for robotics developers. There are several core reasons for choosing the humanoid form:

1. **Environmental compatibility**: Human infrastructure (stairs, door handles, tools, furniture) is designed for the human body's size and shape -- humanoid robots can use them directly without modifying the environment
2. **Human-robot interaction**: A human-like appearance is more readily accepted by people, facilitating natural interaction in collaborative scenarios
3. **Versatility**: Compared to wheeled or quadruped robots, bipedal humanoids have the highest task generality -- they can walk, climb, and manipulate
4. **Learning from demonstration**: The humanoid structure enables direct learning from human demonstrations, reducing data collection costs

### Core Challenges of Humanoid Robots

- **High-dimensional control**: Typically 20-50 degrees of freedom, resulting in a vast control space
- **Underactuated system**: Bipedal walking is inherently unstable and requires continuous balance control
- **Contact dynamics**: Modeling foot-ground contact forces is difficult and involves discontinuities
- **Energy efficiency**: Bipedal locomotion is far less energy-efficient than wheeled motion
- **Hardware complexity**: Integrating joint actuators, sensors, and batteries is extremely challenging

---

## Bipedal Locomotion Control

### ZMP (Zero Moment Point)

ZMP is the most classical concept in bipedal gait planning. It is defined as **the point on the ground where the net moment of ground reaction forces equals zero**.

**Stability criterion**: The robot maintains dynamic balance when the ZMP lies inside the support polygon.

$$
\mathbf{p}_{ZMP} = \frac{\sum_i m_i(\ddot{z}_i + g)x_i - \sum_i m_i \ddot{x}_i z_i}{\sum_i m_i(\ddot{z}_i + g)}
$$

**ZMP planning pipeline**:

1. Design the footstep sequence (footstep planning)
2. Generate the Center of Mass (CoM) trajectory subject to ZMP constraints
3. Compute joint trajectories via inverse kinematics
4. Execute and correct using sensor feedback

### Linear Inverted Pendulum Model (LIPM)

LIPM is the core simplified model for bipedal gait generation, reducing the robot's CoM motion to an inverted pendulum at a fixed height:

$$
\ddot{x} = \frac{g}{z_c}(x - p_x)
$$

where $z_c$ is the (constant) CoM height and $p_x$ is the ZMP position.

**Capture Point**: The position where the robot must place its foot to come to a stop without falling, given its current state:

$$
\xi = x + \frac{\dot{x}}{\omega_0}, \quad \omega_0 = \sqrt{\frac{g}{z_c}}
$$

Capture point theory is widely used for push recovery and real-time gait adjustment.

### Gait Generation

**Gait phases**:

- **Single Support Phase**: One foot supports, the other swings
- **Double Support Phase**: Both feet on the ground, center of gravity transfers
- **Gait cycle**: One complete alternation of left and right steps

**Gait parameters**: Step length, step width, cadence, CoM height, foot clearance height

---

## Whole-Body Motion Control

### Whole-Body Dynamics

Humanoid robots have a floating base, and their dynamics equations take the form:

$$
M(\mathbf{q})\ddot{\mathbf{q}} + C(\mathbf{q}, \dot{\mathbf{q}})\dot{\mathbf{q}} + G(\mathbf{q}) = S^T \boldsymbol{\tau} + J_c^T \mathbf{f}_c
$$

Where:

- $S$: Selection matrix (selects the actuated joints)
- $J_c$: Contact Jacobian matrix
- $\mathbf{f}_c$: Contact forces

### Contact Force Optimization

Contact forces must satisfy friction cone constraints:

$$
\sqrt{f_x^2 + f_y^2} \leq \mu f_z, \quad f_z \geq 0
$$

This is typically linearized into a polyhedral friction cone approximation and solved via QP (Quadratic Programming).

### Task Priority Control

Humanoid robots must satisfy multiple tasks simultaneously (balance, locomotion, hand manipulation, etc.) using a task priority framework:

1. **Highest priority**: Maintain balance (ZMP within support region)
2. **Second priority**: Track footstep trajectories
3. **Lower priority**: Upper body posture / hand manipulation tasks

Priority layering is achieved through null-space projection.

---

## Representative Platforms

### Atlas (Boston Dynamics)

- **DOF**: 28 hydraulically actuated joints
- **Features**: Hydraulic actuation, extremely high dynamic performance (backflips, parkour, dancing)
- **Control approach**: Trajectory optimization + MPC + whole-body control
- **2024 update**: Released an all-electric version of Atlas, departing from hydraulics
- **Significance**: Demonstrates the limits of classical control methods for humanoid robots

### Optimus (Tesla)

- **DOF**: 28 (whole body) + 11 (each hand)
- **Features**: Electric actuation, design philosophy oriented toward mass production
- **Goal**: General-purpose humanoid worker for factory and household tasks
- **Technical approach**: Leverages Tesla FSD's end-to-end neural network methods
- **Progress**: From slow walking to sorting objects and folding laundry

### Figure 01 / Figure 02

- **Features**: Collaboration with OpenAI, integrating large models for natural language interaction
- **Technical approach**: Vision-language models + learned manipulation
- **Funding**: Received massive investment with rapidly rising valuation
- **Positioning**: General-purpose humanoid robot for commercial deployment

### Digit (Agility Robotics)

- **Features**: Humanoid robot designed for logistics scenarios
- **Design**: 4-DOF legs, optimized for carrying boxes
- **Deployment**: Piloted in Amazon warehouses
- **Significance**: One of the closest humanoid robots to commercial deployment

---

## Learning Methods

### Sim-to-Real Transfer

Training policies in simulation and then deploying them on real robots is the dominant paradigm for humanoid robot control today.

**Key techniques**:

- **Domain Randomization**: Randomize physical parameters (friction, mass, terrain) in simulation to make policies more robust
- **Curriculum Learning**: Gradually increase difficulty starting from simple terrain
- **Teacher-Student Distillation**: The teacher policy uses privileged information (e.g., exact terrain heightmaps), while the student policy uses only real-world sensor data

### Reinforcement Learning for Gait Control

**Common algorithms**: PPO (Proximal Policy Optimization) is the most popular

**Reward design** (typical):

```python
reward = (
    w_vel * tracking_velocity_reward    # Track target velocity
    + w_alive * alive_bonus             # Alive bonus
    - w_energy * energy_penalty         # Energy penalty
    - w_smooth * action_smoothness      # Action smoothness penalty
    - w_contact * undesired_contact     # Undesired contact penalty
    - w_orient * orientation_penalty    # Torso orientation penalty
)
```

**Representative works**:

- **Legged Gym / Isaac Lab**: NVIDIA's open-source RL training framework for legged/humanoid robots
- **Berkeley Humanoid** (2024): Achieved zero-shot Sim-to-Real gait on a real small humanoid robot
- **H2O / HumanPlus**: Train humanoid whole-body control from human motion capture data

---

## Manipulation and Dexterous Hands

### Challenges of Dexterous Hands

- **High DOF**: The human hand has approximately 20 degrees of freedom, creating a vast control space
- **Contact-rich**: Grasping and manipulation involve complex multi-point contacts
- **Sensing requirements**: Tactile sensors are needed for contact force feedback
- **Precision demands**: Fine manipulation requires sub-millimeter accuracy

### Dexterous Manipulation Methods

**Learning-based methods**:

- **Dexterous Hand (OpenAI, 2019)**: Used RL to train a Shadow Hand to rotate a Rubik's cube in simulation
- **AnyGrasp / GraspNet**: Point cloud-based general grasp detection
- **DAPG (Demo Augmented Policy Gradient)**: Combines demonstration data to accelerate RL training

**Teleoperation and demonstration**:

- Collect teleoperation data using VR gloves or data gloves
- ALOHA / Mobile ALOHA: Low-cost bimanual teleoperation systems
- Train manipulation policies via imitation learning

### The Future of Humanoid Robot Manipulation

- **Bimanual coordination**: Two hands working together (e.g., unscrewing a bottle cap, folding clothes)
- **Whole-body loco-manipulation**: Joint optimization of gait and manipulation (e.g., walking while carrying objects)
- **Foundation models**: Vision-Language-Action models (VLAs) enabling general-purpose manipulation

---

## References

- Kajita et al., *Introduction to Humanoid Robotics*, Springer
- Boston Dynamics Atlas: [bostondynamics.com](https://bostondynamics.com)
- Legged Gym: [github.com/leggedrobotics/legged_gym](https://github.com/leggedrobotics/legged_gym)
- Figure AI: [figure.ai](https://figure.ai)
