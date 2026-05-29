# VLA-RL Integration — Improving Vision-Language-Action Models with Reinforcement Learning

## Overview

**The integration of VLA and RL (VLA-RL)** is one of the most active directions in embodied intelligence in 2025–2026: attaching reinforcement learning to a pretrained [Vision-Language-Action model](../01_Foundations/VLA模型.md) (VLA) so that this "large model with hands" can **improve itself** through interaction with the environment, rather than merely imitating human demonstrations.

Mainstream VLAs ([RT-2/OpenVLA](../03_Models/RT2_OpenVLA.md), [π0](../03_Models/Pi0_Physical_Intelligence.md), etc.) are almost all trained with [imitation learning](模仿学习.md), relying on human teleoperation to collect demonstration data. This path has four hard limitations, and RL addresses each:

| Pain point of imitation learning | How RL helps |
|---|---|
| Real-robot demos are expensive and slow to collect | Replace step-by-step labels with environment rewards; sample massively in parallel in simulation |
| Only imitates; cannot exceed the demonstration ceiling | Explore policies better than the demos through trial and error |
| Poor out-of-distribution (OOD) generalization | Expose and correct failure modes during interaction, improving robustness |
| No "success/failure" feedback signal | Rewards explicitly encode the task objective |

This note covers the core paradigm, key algorithms, representative works, and main challenges of VLA-RL.

---

## Core Paradigm: Online RL Fine-tuning of a Pretrained VLA

The mainstream approach is **online RL fine-tuning**: take a supervised-pretrained VLA as the initial policy $\pi_\theta$, and let it execute–observe–update in a (simulated or real) environment, gradually approaching a better policy.

Modeling robot manipulation as a Markov decision process, the policy conditions on observation $o$ (images) and language instruction $\ell$ to output action $a$, optimizing the expected cumulative reward:

$$
\theta^\star = \arg\max_\theta \; \mathbb{E}_{\tau \sim \pi_\theta}\left[ \sum_{t=0}^{T} \gamma^t \, r(s_t, a_t) \right]
$$

Compared with supervised fine-tuning (SFT):

- **SFT** minimizes the discrepancy from demonstrated actions $\;\mathcal{L}_{\text{SFT}} = -\mathbb{E}\,[\log \pi_\theta(a^{\text{demo}} \mid o, \ell)]$, capped by demo quality;
- **RL** directly takes gradients on the "did the task succeed" reward, which can surpass demos but is costly to explore and less stable.

In practice the two are often **alternated**: SFT first for a good initialization, then RL fine-tuning; or interleave SFT during RL to prevent capability degradation (see "Catastrophic Forgetting" below).

---

## Perception-in-the-loop and Closed-loop Control

Traditional robot systems are often **modular and serial**: perception (locate the object) → planning → control, each module optimized separately. The problem is that perception optimizes only for "recognition accuracy," but accurate recognition ≠ task success — small perception errors propagate and amplify, ultimately failing the task, while the perception module "doesn't know" it dragged things down.

**Perception-in-the-loop RL** puts perception into the same RL loop and optimizes end-to-end:

- The task success/failure reward **back-propagates all the way to the perception layer**;
- Perception no longer chases generic recognition accuracy, but learns "**what to look at, and how, in order to get the task done**";
- The whole "see → think → act → see feedback → adjust" forms a continuous **closed-loop control** — the model doesn't act blindly after one glance, but corrects in real time based on new observations.

This is especially natural for VLA, since V→L→A is inherently end-to-end; closed-loop correction is also key to handling real-world disturbances and recovering from a missed grasp.

---

## Multi-task and Multi-agent Dimensions

**Multi-task Learning**: use **one VLA to master many tasks** (open a drawer, pour water, fold clothes…), distinguished by language instructions. Tasks can share knowledge and reinforce each other, moving closer to a "general-purpose robot." RL here is used to improve the success rate of multiple tasks at once — while preventing "learning new tasks but forgetting old ones." See [Multi-task Learning and Generalization](../01_Foundations/多任务与泛化.md).

**Multi-agent Learning** has two meanings:

1. **Cooperation/competition**: multiple robots jointly accomplish a task (e.g., lifting one object together) or learn in a non-stationary environment where they affect each other;
2. **Large-scale parallel sampling**: RL is extremely data-hungry, so rolling out hundreds or thousands of parallel agents in simulation is standard for accelerating training (e.g., batched environments on Isaac/ManiSkill).

---

## Key Algorithms

VLA-RL borrows heavily from the algorithm stack used to train large language models (RLHF):

- **PPO (Proximal Policy Optimization)**: the classic on-policy algorithm, stabilizing updates with a clipped objective; requires a value network (critic). The workhorse of VLA-RL.
- **GRPO (Group Relative Policy Optimization)**: critic-free, estimating the baseline from the relative advantage of a sampled group; memory-friendly, migrated from LLM reasoning training to VLA.
- **DPO (Direct Preference Optimization)**: optimizes the policy directly from preference pairs without an explicit reward model; suitable for fine-tuning with success/ranking signals.

PPO's clipped objective (with $\rho_t = \pi_\theta / \pi_{\theta_{\text{old}}}$ and advantage $A_t$):

$$
\mathcal{L}^{\text{PPO}}(\theta) = \mathbb{E}_t\!\left[\min\big(\rho_t A_t,\; \text{clip}(\rho_t, 1-\epsilon, 1+\epsilon)\,A_t\big)\right]
$$

Autoregressive VLAs tokenize actions and can do RL over token sequences like a language model; flow-matching/diffusion-style VLAs (like π0) require special handling of the log-likelihood of continuous action distributions, which is the focus of works like π_RL.

---

## Representative Works (2025–2026)

| Work | Highlights |
|---|---|
| **VLA-RL** | Online RL for autoregressive VLAs with a robotics-specific process reward model (PRM); OpenVLA-7B surpasses the strongest SFT baseline on LIBERO's 40 tasks |
| **RL4VLA / RLVLA** | Systematically compares PPO, GRPO, DPO on VLA; empirically shows RL's gains for generalization |
| **RLinf-VLA** | A unified, efficient VLA+RL training framework/infrastructure supporting ManiSkill, LIBERO, RoboTwin |
| **π_RL** | Online RL fine-tuning for flow-based VLAs, tackling RL on continuous actions |
| **SimpleVLA-RL** | A simplified VLA-RL training recipe emphasizing reproducibility and scalability |
| **iRe-VLA** | Iterates between "RL exploration" and "supervised fine-tuning" to mitigate catastrophic forgetting |
| **CO-RFT** | Fine-tunes VLA with chunked offline RL, preserving inference efficiency |
| **VLAC** | Vision-Language-Action-Critic, providing value/reward evaluation for real-world RL |

---

## Key Challenges

- **Catastrophic Forgetting**: directly RL-fine-tuning on robot data tends to erase the large model's original language understanding and common sense, turning it into something that only does the few trained tasks and breaks on new instructions. Remedies: alternate RL/SFT (iRe-VLA), offline RL (CO-RFT), KL regularization to stay near the pretraining distribution.
- **Reward Design**: robot task rewards are hard to define; sparse rewards (scored only on success) make exploration difficult; use process reward models, VLM auto-scoring (e.g., VLAC), or LLM-generated reward code.
- **Sim-to-Real**: training in simulation is efficient, but a sim-real gap exists; pair with domain randomization and [Sim2Real transfer](Sim2Real.md).
- **Sample Efficiency**: real-robot RL trial-and-error is costly and carries safety risks; parallel simulation sampling + offline data are common compromises.
- **Online vs Offline RL**: online interaction keeps improving but is costly and unstable; offline RL optimizes on static datasets — safe but limited by data coverage.

---

## Related Sections

- **The VLA model itself**: [VLA Models](../01_Foundations/VLA模型.md) — the "object being fine-tuned" here
- **RL foundations**: [Reinforcement Learning in Robotics](强化学习在机器人中的应用.md) — POMDP modeling and algorithms like PPO/SAC in a robotics context
- **Imitation learning**: [Imitation Learning](模仿学习.md) — RL's complement and source of initialization
- **Multi-task generalization**: [Multi-task Learning and Generalization](../01_Foundations/多任务与泛化.md) — expanding on the multi-task dimension
- **Representative models**: [RT-2 and OpenVLA](../03_Models/RT2_OpenVLA.md), [π0](../03_Models/Pi0_Physical_Intelligence.md) — common starting points for RL fine-tuning

---

## References

1. Lu, G., et al. (2025). *VLA-RL: Towards Masterful and General Robotic Manipulation with Scalable Reinforcement Learning*. arXiv:2505.18719.
2. *What Can RL Bring to VLA Generalization? An Empirical Study* (RL4VLA / RLVLA). https://rlvla.github.io/
3. *RLinf-VLA: A Unified and Efficient Framework for VLA+RL Training* (2025). arXiv:2510.06710.
4. *π_RL: Online RL Fine-tuning for Flow-based Vision-Language-Action Models* (2025). arXiv:2510.25889.
5. *A Vision-Language-Action-Critic Model for Robotic Real-World Reinforcement Learning* (2025). arXiv:2509.15937.
6. *CO-RFT: Efficient Fine-Tuning of Vision-Language-Action Models through Chunked Offline Reinforcement Learning* (2025). arXiv:2508.02219.
7. Denghaoyuan et al. *Awesome-RL-VLA: A Survey on Reinforcement Learning of Vision-Language-Action Models for Robotic Manipulation*. https://github.com/Denghaoyuan123/Awesome-RL-VLA
