# VLA 评测基准套件 — CALVIN / LIBERO / SimplerEnv / RoboArena

<!-- CONTENT-EXPAND-TODO (2026-05-15)
Reviewer: independent audit (Explore agent) - Batch 1 audit found this missing
Status: 综述合规但各 benchmark 介绍偏薄 (§1-7 各 100-200 字)
Gaps:
- Common pitfalls 缺失: CALVIN cherry-picking 问题 / SimplerEnv sim-real gap 假设何时失效
- Worked example 缺失: 同一模型 (如 π0) 跨多个 benchmark 评估的完整脚本
- 每个 benchmark 可补 "首次跑通踩坑" + 关键超参 + 复现成本
-->

> *评估 VLA 模型不能只看自己挑的 task。本篇梳理 2022-2025 主流 VLA 评测基准:CALVIN (language-conditioned)、LIBERO (lifelong learning)、SimplerEnv (与真机对齐的仿真)、RoboArena (cross-embodiment)、Meta-World (RL)、LeRobot Bench (HF)。每个测不同维度,合并起来才能完整 evaluate。*
>
> **难度**:Intermediate
> **前置知识**:[VLA 模型](VLA模型.md)、[π0](Pi0_Physical_Intelligence.md)、[Octo](Octo_Foundation_Policy.md)
> **后续阅读**:[Helix](Helix_Figure_AI.md)、[DROID](DROID_Dataset.md)

---

## 1. 为什么需要专门 benchmark

VLA 评估痛点:
- 真机评估贵 (10+ task × 50 trial × 真机时间)
- 不同 lab 用不同 robot,数字不可比
- "Cherry-picked" 视频常见 → 学界需要 fair eval

→ 标准化仿真 benchmarks。

---

## 2. CALVIN — Language-Conditioned 操作

KIT 2022 发布。tabletop 仿真,Franka arm,34 个任务。

### 2.1 测试方式

5-task chain:agent 收到 5 个连续语言指令,依次完成。**全成功才算**。

$$\text{success rate} = \frac{1}{N} \sum_{i=1}^N \prod_{j=1}^5 [\text{task}_{ij} \text{ success}]$$

→ 任务失败 1 个 → 整条 chain 失败。极严苛。

### 2.2 Leaderboard

| 模型 | 5-chain 成功率 | Year |
|---|---|---|
| MCIL | 1.3% | 2022 |
| HULC | 12% | 2022 |
| RoboFlamingo | 32% | 2023 |
| GR-1 | 41% | 2023 |
| RT-2 | 80% | 2023 (有争议) |
| **π0** | **90%+** | 2024 |

---

## 3. LIBERO — Lifelong Learning

UCLA 2024 发布。模拟厨房 / 桌面,**130 任务**分 4 个 suite:
- LIBERO-Spatial (空间推理)
- LIBERO-Object (物体识别)
- LIBERO-Goal (目标条件)
- LIBERO-Long (长 horizon)

### 3.1 关键特性

- 测 **lifelong learning**:agent 顺序学完 4 个 suite,不能 catastrophic forgetting
- 与 CALVIN 互补:LIBERO 任务**多**而**短**,CALVIN **少**而**长**

### 3.2 评估

每个 suite 10 task × 50 trial,看平均成功率 + cross-suite forgetting %。

---

## 4. SimplerEnv — Sim-Real Aligned

UC San Diego 2024 发布。**与真机对齐**的仿真:
- ManiSkill 物理引擎
- 配合 Google Everyday Robots / Bridge / WidowX 真机 setup
- 通过 photorealistic rendering 减少 sim-real gap

### 4.1 用法

- 论文用 SimplerEnv 大规模评估 (1000+ trial / task)
- 真机仅做 final validation (100 trial)
- 节省 ~ 10× 真机时间

### 4.2 数据

模型在 SimplerEnv 评估的结果与真机相关性 r > 0.85,reliable proxy。

---

## 5. RoboArena — Cross-Embodiment

PIO 2024 提议。在 5 个不同机器人 (Franka / WidowX / UR5 / xArm / Aloha) 上评估**同一个 policy**:
- 看 cross-embodiment 泛化
- 报告每个 robot 的 score + variance

---

## 6. Meta-World — RL Manipulation

UCLA + Berkeley 2019 发布。50 个 single-task 操作任务,MuJoCo 仿真。

- ML10: 10 trained tasks
- ML45: 45 trained tasks
- 测 **multi-task RL**

主要用 RL,非 imitation,但有些 VLA 论文也 evaluate。

---

## 7. LeRobot Bench — HuggingFace

HuggingFace 2024-2025 推出。基于 Aloha + DROID,集成多个 benchmark:
- ALOHA 任务 set
- Push-T (2D)
- Real-robot integration
- 自动化 eval pipeline

---

## 8. Benchmark 对比表

| Benchmark | Sim/Real | Multi-task | Lang | Cross-embodiment | 主测维度 |
|---|---|---|---|---|---|
| CALVIN | Sim | ✅ (34) | ✅ | ❌ | 5-chain long horizon |
| LIBERO | Sim | ✅ (130) | ✅ | ❌ | Lifelong learning |
| SimplerEnv | Sim (aligned) | ✅ | ✅ | partial | Sim-real corr. |
| RoboArena | Sim + Real | ✅ | ✅ | ✅ | Embodiment transfer |
| Meta-World | Sim | ✅ (50) | ❌ | ❌ | Multi-task RL |
| LeRobot Bench | Real + Sim | ✅ | ✅ | ✅ | All-in-one |

### 8.1 CALVIN 5-chain leaderboard 2022-2024

<!-- SVG-DESIGN-NOTES
Type: D (量化关系) — 横向条形图: CALVIN 5-chain success rate 2022-2024, 同时叠加年份带 (Type E 元素)
Q0: CALVIN 5-chain 是最严苛 VLA benchmark (5 个连续 task 全成功才计 success), 2 年内从 MCIL 1.3% → π0 90%+ 跃升 70 倍; 这数字增长直接演示了 VLA 从 "无法用" 到 "几乎完美" 的过渡
Q1: 横向 bar 由低到高排列, 每个 model 一条; 同时按年份分组用 vertical band (2022 一组 / 2023 一组 / 2024 一组); 每个 bar 末贴数字 + year chip; π0 用 accent 强调 + 加 "★"
Q2: 去标题: bar 排序 + 年份 band + 70× 跳跃 → 立刻是 CALVIN leaderboard, 不是普通通用 benchmark 图
Q3: 这是新增 SVG, 不删原方框 (本文本来 0 SVG)
Q4: model 名贴左侧; 百分比贴 bar 右端; 年份在 band 顶
Q5: 全 var(--dia-*); 共用
-->
<div class="diagram">
<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CALVIN 5-chain leaderboard 2022-2024 showing 70x improvement">
  <defs/>

  <text x="380" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="14" font-style="italic" fill="var(--dia-stroke)">CALVIN 5-chain · 2 年内 success 从 1.3% → 90%+ (70× jump)</text>

  <!-- year bands -->
  <rect x="240" y="55" width="220" height="280" fill="var(--dia-stroke-soft)" fill-opacity="0.05" stroke="none"/>
  <text x="350" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">2022</text>

  <rect x="460" y="55" width="180" height="280" fill="var(--dia-stroke-soft)" fill-opacity="0.10" stroke="none"/>
  <text x="550" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">2023</text>

  <rect x="640" y="55" width="100" height="280" fill="var(--dia-stroke-soft)" fill-opacity="0.18" stroke="none"/>
  <text x="690" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">2024</text>

  <!-- x-axis: 0% (left=240) → 100% (right=740) → 5px/% -->
  <line x1="240" y1="320" x2="740" y2="320" stroke="var(--dia-stroke)" stroke-width="1"/>
  <g font-family="JetBrains Mono, monospace" font-size="9" fill="var(--dia-stroke-soft)" text-anchor="middle">
    <line x1="240" y1="316" x2="240" y2="324" stroke="var(--dia-stroke)"/><text x="240" y="338">0%</text>
    <line x1="340" y1="316" x2="340" y2="324" stroke="var(--dia-stroke)"/><text x="340" y="338">20%</text>
    <line x1="440" y1="316" x2="440" y2="324" stroke="var(--dia-stroke)"/><text x="440" y="338">40%</text>
    <line x1="540" y1="316" x2="540" y2="324" stroke="var(--dia-stroke)"/><text x="540" y="338">60%</text>
    <line x1="640" y1="316" x2="640" y2="324" stroke="var(--dia-stroke)"/><text x="640" y="338">80%</text>
    <line x1="740" y1="316" x2="740" y2="324" stroke="var(--dia-stroke)"/><text x="740" y="338">100%</text>
  </g>
  <text x="490" y="362" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-stroke)">5-chain success rate (all 5 sub-tasks must complete)</text>

  <!-- Bars from top to bottom (chronological + ascending) -->
  <!-- MCIL 2022, 1.3% → width 6.5px -->
  <text x="230" y="105" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">MCIL</text>
  <rect x="240" y="95" width="6.5" height="18" fill="var(--dia-stroke-soft)" stroke="none"/>
  <text x="252" y="109" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">1.3%</text>

  <!-- HULC 2022, 12% → 60px -->
  <text x="230" y="135" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">HULC</text>
  <rect x="240" y="125" width="60" height="18" fill="var(--dia-green)" fill-opacity="0.5" stroke="none"/>
  <text x="305" y="139" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">12%</text>

  <!-- RoboFlamingo 2023, 32% → 160px -->
  <text x="230" y="165" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">RoboFlamingo</text>
  <rect x="240" y="155" width="160" height="18" fill="var(--dia-blue)" fill-opacity="0.5" stroke="none"/>
  <text x="405" y="169" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">32%</text>

  <!-- GR-1 2023, 41% → 205px -->
  <text x="230" y="195" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">GR-1</text>
  <rect x="240" y="185" width="205" height="18" fill="var(--dia-blue)" fill-opacity="0.7" stroke="none"/>
  <text x="450" y="199" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">41%</text>

  <!-- RT-2 2023, 80% (contested) → 400px -->
  <text x="230" y="225" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">RT-2</text>
  <rect x="240" y="215" width="400" height="18" fill="var(--dia-blue)" fill-opacity="0.85" stroke="var(--dia-blue)" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="645" y="229" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">80%*</text>

  <!-- π0 2024, 90% → 450px → WINNER -->
  <text x="230" y="263" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)" font-weight="bold">π0  ★</text>
  <rect x="240" y="250" width="455" height="22" fill="var(--dia-accent)" stroke="var(--dia-accent-deep)" stroke-width="1.6"/>
  <text x="700" y="266" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)" font-weight="bold">90%+</text>

  <!-- annotation: * RT-2 contested -->
  <text x="650" y="245" font-family="JetBrains Mono, monospace" font-size="8" fill="var(--dia-stroke-soft)">* 数字存争议</text>
  <text x="650" y="255" font-family="JetBrains Mono, monospace" font-size="8" fill="var(--dia-stroke-soft)">  (含 Google 内部 setup)</text>

  <!-- jump arrow -->
  <path d="M 246,287 Q 350,295 690,287" fill="none" stroke="var(--dia-accent-deep)" stroke-width="1.4" stroke-dasharray="4,3"/>
  <polygon points="687,282 700,287 687,292" fill="var(--dia-accent-deep)"/>
  <text x="470" y="307" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)">2 年, 70× 跳跃 — VLA 从 "无法用" 到 "可用"</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — CALVIN 5-chain 是 VLA benchmark 中最严苛的指标（5 个连续 task 必须全成功），2022 MCIL 仅 1.3% → 2024 π0 90%+ 是 2 年内 70× 的跳跃。</p>

---

## 9. 现状 (2025) — 最强 model 在哪些 benchmark SOTA

| Benchmark | Current SOTA |
|---|---|
| CALVIN (5-chain) | π0 |
| LIBERO | OpenVLA fine-tuned |
| SimplerEnv | π0 + RT-2 close |
| RoboArena | Octo (跨 body 设计) |
| Meta-World | PPO + SAC 仍最强 (RL 占优) |

→ 不同 benchmark 不同模型最强,**没有 universal champion**。

---

## 10. 使用建议 (researcher)

- **检验你的 VLA**:至少 LIBERO + CALVIN 双测
- **声称 generalist**:加 RoboArena 跨机器人
- **真机准备**:SimplerEnv 大规模 + 真机 final
- **避免**:只在自家数据 evaluate

---

## 11. 评估 challenges

### 11.1 Sim2real Gap

CALVIN / LIBERO 100% ≠ 真机 100%。仿真未捕获摩擦 / 光照变化 / 物体形变。

### 11.2 Hyperparameter Cherry-picking

许多论文报告 best-of-3 runs;实际部署不能 cherry-pick。

### 11.3 数据泄漏

Pre-train data 中已含 CALVIN-like 任务 → eval bias。

### 11.4 Random seed variance

10% ± 5% 是常见 std。报告 1 seed 数字不可靠。

### 11.5 慢

完整 LIBERO eval ~ GPU 天级。学界常 truncate evaluation。

---

## 12. PyTorch — 在 LIBERO 上评估 OpenVLA

```python
import gym
from libero.libero import benchmark
from openvla import OpenVLA

env_creator = benchmark.get_benchmark('libero_object')

model = OpenVLA.load_pretrained("openvla/openvla-7b")

results = {}
for task_suite in ['spatial', 'object', 'goal', 'long']:
    successes = []
    for seed in range(50):
        env = env_creator.get_env(task_suite=task_suite, seed=seed)
        obs = env.reset()
        for step in range(200):
            action = model.predict_action(obs)
            obs, r, done, info = env.step(action)
            if done: break
        successes.append(info['success'])
    results[task_suite] = sum(successes) / len(successes)
print(results)  # {'spatial': 0.65, 'object': 0.70, 'goal': 0.55, 'long': 0.30}
```

---

## 13. 历史 timeline

- **2019** — Meta-World (单任务 RL)
- **2022 早期** — CALVIN (language-conditioned)
- **2023** — RT-1 / RT-2 推动 VLA evaluation 需求
- **2024 上半** — LIBERO + SimplerEnv 发布
- **2024 下半** — RoboArena, LeRobot Bench
- **2025** — 各 benchmark 逐渐合并 / 标准化

---

## 14. Related Concepts

- **同节**:[VLA 模型](VLA模型.md)、[π0](Pi0_Physical_Intelligence.md)、[OpenVLA](RT2_OpenVLA.md)、[Octo](Octo_Foundation_Policy.md)、[Helix](Helix_Figure_AI.md)
- **数据**:[DROID](DROID_Dataset.md)、[Open X-Embodiment](数据集与Benchmark.md)
- **WM 评估**:[WM Eval Benchmarks](../../01_AI/03_Frontiers/03_World_Models/WM_Eval_Benchmarks.md)

---

## References

1. **Mees, O. et al.** "CALVIN: A Benchmark for Language-Conditioned Policy Learning." *RA-L*, 2022.
2. **Liu, B. et al.** "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning." *NeurIPS*, 2024.
3. **Li, X. et al.** "Evaluating Real-World Robot Manipulation Policies in Simulation (SimplerEnv)." *arXiv*, 2024.
4. **RoboArena Team** — RoboArena leaderboard, 2024.
5. **Yu, T. et al.** "Meta-World: A Benchmark and Evaluation for Multi-Task and Meta Reinforcement Learning." *CoRL*, 2019.
6. **HuggingFace LeRobot** — https://github.com/huggingface/lerobot
