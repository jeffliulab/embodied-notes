# Autonomous Driving

Autonomous driving is the sharpest real-world intersection of **covariate shift, imitation learning, and closed-loop control**: a policy is trained on open-loop data yet must run closed-loop inside the state distribution it generates itself; a tiny per-frame error gets integrated and amplified by vehicle dynamics until it becomes a catastrophic lane-departure trajectory. It compresses the four classical modules — perception, prediction, planning, control — together with the recently ascendant end-to-end learning paradigm, into the same 10–100 ms latency budget and the same safety-redundant chain.

This chapter is organized from two complementary angles. The **"method taxonomy"** answers *which paradigms exist and how they trade off inductive biases* — from the classical modular pipeline (hand-designed interfaces, interpretable, verifiable) to end-to-end differentiable systems (data-driven, jointly optimized, but with black-box interfaces), plus the hybrids in between. The **"full pipeline"** follows the real flow of information from sensors to steering wheel, dissecting station by station: perception and localization, motion prediction, planning and decision-making, vehicle control, and finally end-to-end driving and closed-loop evaluation — while keeping the recurring undercurrent of *"why do open-loop metrics look great while the closed loop crashes?"* in view throughout.

**Chapter contents:**

- **[Survey of Autonomous Driving](01_Foundations/自动驾驶综述.en.md)** — The whole map: levels of autonomy, modular vs. end-to-end, sensor stacks, and a panorama of safety and long-tail problems
- **[Driving Paradigms & Method Taxonomy](01_Foundations/自动驾驶范式与方法谱系.en.md)** — Re-organizing every method along two orthogonal axes: "imitation vs. reinforcement" × "modular vs. end-to-end"
- **[Perception & Localization](02_Perception/感知与定位.en.md)** — 3D detection, BEV representations, occupancy grids, multi-sensor fusion, and SLAM/HD-Map localization
- **[Motion Prediction](03_Prediction_Planning/运动预测.en.md)** — Multimodal trajectory prediction: vectorized scene encoding, intent modeling, and probabilistic distribution outputs
- **[Planning & Decision-Making](03_Prediction_Planning/规划与决策.en.md)** — Behavioral decisions, sampling/optimization-based trajectory planning, interactive games, and safety constraints
- **[Vehicle Control](04_Control/车辆控制.en.md)** — Lateral and longitudinal control: Pure Pursuit, Stanley, MPC, and vehicle dynamics models
- **[End-to-End Driving](05_Learning_E2E/端到端驾驶.en.md)** — From ALVINN to UniAD/VAD: differentiable pipelines that go from sensors directly to control/planning
- **[Covariate Shift & the Closed-Loop Gap](05_Learning_E2E/协变量偏移与闭环鸿沟.en.md)** — Why imitation learning collapses in the closed loop, and antidotes like DAgger and Learning by Cheating
- **[Datasets & Closed-Loop Evaluation](06_Data_Eval/数据集与闭环评测.en.md)** — nuScenes/Waymo/Argoverse and CARLA/nuPlan: the traps of open-loop metrics and how to measure closed-loop

## Recommended Reading Order

1. Start with the **[Survey of Autonomous Driving](01_Foundations/自动驾驶综述.en.md)** to build a mental map of the whole field — levels of autonomy, module boundaries, sensor configurations, and the core challenges.
2. Then read **[Driving Paradigms & Method Taxonomy](01_Foundations/自动驾驶范式与方法谱系.en.md)** to internalize the crucial distinction "end-to-end ≠ imitation learning," so every later note can be pinned to the right coordinates.
3. Work vertically down the pipeline: **[Perception & Localization](02_Perception/感知与定位.en.md)** → **[Motion Prediction](03_Prediction_Planning/运动预测.en.md)** → **[Planning & Decision-Making](03_Prediction_Planning/规划与决策.en.md)** → **[Vehicle Control](04_Control/车辆控制.en.md)**, seeing how information flows from raw sensors to steering torque.
4. Next, read **[End-to-End Driving](05_Learning_E2E/端到端驾驶.en.md)** to understand how a differentiable pipeline merges and jointly optimizes those four steps.
5. Then tackle the chapter's "undercurrent," **[Covariate Shift & the Closed-Loop Gap](05_Learning_E2E/协变量偏移与闭环鸿沟.en.md)** — the key to understanding every failure mode.
6. Finally, close with **[Datasets & Closed-Loop Evaluation](06_Data_Eval/数据集与闭环评测.en.md)** to learn to measure progress with the right ruler and avoid being misled by open-loop metrics.
