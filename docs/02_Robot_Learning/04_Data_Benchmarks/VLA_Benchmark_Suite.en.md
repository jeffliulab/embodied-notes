# VLA Benchmark Suite — CALVIN / LIBERO / SimplerEnv / RoboArena

<!-- CONTENT-EXPAND-TODO (2026-05-15)
Reviewer: independent audit (Explore agent) - Batch 1 audit
Status: Survey compliant but each benchmark section thin (§1-7 each 100-200 words)
Gaps:
- Common pitfalls absent: CALVIN cherry-picking issue / when SimplerEnv sim-real-gap assumptions fail
- Worked example absent: same model (e.g. π0) evaluated across multiple benchmarks (full script)
- Each benchmark needs "first reproduction debug" + key hyperparams + cost-to-reproduce
-->

> *Evaluating VLA models can't be just cherry-picked tasks. This article surveys 2022-2025 mainstream VLA benchmarks: CALVIN (language-conditioned), LIBERO (lifelong learning), SimplerEnv (sim-real aligned), RoboArena (cross-embodiment), Meta-World (RL), LeRobot Bench (HF). Each tests a different dimension; full evaluation requires combining them.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [VLA Models](../01_Foundations/VLA模型.en.md), [π0](../03_Models/Pi0_Physical_Intelligence.en.md), [Octo](../03_Models/Octo_Foundation_Policy.en.md)
> **Further reading**: [Helix](../03_Models/Helix_Figure_AI.en.md), [DROID](DROID_Dataset.en.md)

---

## 1. Why Dedicated Benchmarks

VLA evaluation pain points:
- Real-robot evaluation expensive (10+ tasks × 50 trials × real-robot time)
- Different labs use different robots, numbers incomparable
- "Cherry-picked" videos common → academia needs fair eval

→ Standardized simulation benchmarks.

---

## 2. CALVIN — Language-Conditioned Manipulation

KIT released 2022. Tabletop simulation, Franka arm, 34 tasks.

### 2.1 Testing Method

5-task chain: agent receives 5 consecutive language instructions, completes each. **All-or-nothing**.

$$\text{success rate} = \frac{1}{N} \sum_{i=1}^N \prod_{j=1}^5 [\text{task}_{ij} \text{ success}]$$

→ 1 task fails → whole chain fails. Extremely strict.

### 2.2 Leaderboard

| Model | 5-chain success | Year |
|---|---|---|
| MCIL | 1.3% | 2022 |
| HULC | 12% | 2022 |
| RoboFlamingo | 32% | 2023 |
| GR-1 | 41% | 2023 |
| RT-2 | 80% | 2023 (disputed) |
| **π0** | **90%+** | 2024 |

---

## 3. LIBERO — Lifelong Learning

UCLA released 2024. Simulated kitchen / tabletop, **130 tasks** split into 4 suites:
- LIBERO-Spatial (spatial reasoning)
- LIBERO-Object (object recognition)
- LIBERO-Goal (goal-conditioned)
- LIBERO-Long (long horizon)

### 3.1 Key Features

- Tests **lifelong learning**: agent sequentially learns 4 suites without catastrophic forgetting
- Complements CALVIN: LIBERO tasks **many but short**, CALVIN **few but long**

### 3.2 Evaluation

Each suite 10 tasks × 50 trials, look at avg success + cross-suite forgetting %.

---

## 4. SimplerEnv — Sim-Real Aligned

UC San Diego released 2024. **Sim aligned with real robots**:
- ManiSkill physics engine
- Configured with Google Everyday Robots / Bridge / WidowX real setup
- Photorealistic rendering reduces sim-real gap

### 4.1 Usage

- Papers use SimplerEnv for large-scale eval (1000+ trials / task)
- Real robot only for final validation (100 trials)
- Saves ~10× real-robot time

### 4.2 Data

Model SimplerEnv scores correlate with real robot r > 0.85, reliable proxy.

---

## 5. RoboArena — Cross-Embodiment

PIO 2024 proposal. Evaluates **same policy** on 5 different robots (Franka / WidowX / UR5 / xArm / Aloha):
- Tests cross-embodiment generalization
- Reports score per robot + variance

---

## 6. Meta-World — RL Manipulation

UCLA + Berkeley released 2019. 50 single-task manipulation tasks, MuJoCo simulation.

- ML10: 10 trained tasks
- ML45: 45 trained tasks
- Tests **multi-task RL**

Mainly RL, not imitation, but some VLA papers also evaluate.

---

## 7. LeRobot Bench — HuggingFace

HuggingFace released 2024-2025. Built on Aloha + DROID, integrates multiple benchmarks:
- ALOHA task set
- Push-T (2D)
- Real-robot integration
- Automated eval pipeline

---

## 8. Benchmark Comparison

| Benchmark | Sim/Real | Multi-task | Lang | Cross-embodiment | Main test |
|---|---|---|---|---|---|
| CALVIN | Sim | ✅ (34) | ✅ | ❌ | 5-chain long horizon |
| LIBERO | Sim | ✅ (130) | ✅ | ❌ | Lifelong learning |
| SimplerEnv | Sim (aligned) | ✅ | ✅ | partial | Sim-real corr. |
| RoboArena | Sim + Real | ✅ | ✅ | ✅ | Embodiment transfer |
| Meta-World | Sim | ✅ (50) | ❌ | ❌ | Multi-task RL |
| LeRobot Bench | Real + Sim | ✅ | ✅ | ✅ | All-in-one |

### 8.1 CALVIN 5-chain leaderboard 2022-2024

<!-- SVG-DESIGN-NOTES
Type: D (quantitative) — horizontal bar leaderboard with year bands (Type E overlay)
Q0: CALVIN 5-chain is the strictest VLA metric (all 5 consecutive sub-tasks must complete). In 2 years it jumped from MCIL 1.3% to π0 90%+ — a 70× leap that maps the field's "unusable → near-perfect" transition
Q1: Horizontal bars sorted ascending; rows grouped by year via vertical color bands (2022/2023/2024); each bar end shows the percentage; π0 highlighted with accent + ★
Q2: Without title: sorted bars + year bands + 70× jump → recognisable specifically as CALVIN leaderboard, not a generic benchmark chart
Q3: New SVG (article had 0 before); no old boxes to remove
Q4: Model names left of bars; percentages right of bars; year labels at band tops
Q5: All var(--dia-*); English labels — shared with .md
-->
<div class="diagram">
<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CALVIN 5-chain leaderboard 2022-2024 showing 70x improvement">
  <defs/>

  <text x="380" y="28" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="14" font-style="italic" fill="var(--dia-stroke)">CALVIN 5-chain · in 2 years from 1.3% to 90%+ (70× jump)</text>

  <rect x="240" y="55" width="220" height="280" fill="var(--dia-stroke-soft)" fill-opacity="0.05" stroke="none"/>
  <text x="350" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">2022</text>

  <rect x="460" y="55" width="180" height="280" fill="var(--dia-stroke-soft)" fill-opacity="0.10" stroke="none"/>
  <text x="550" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">2023</text>

  <rect x="640" y="55" width="100" height="280" fill="var(--dia-stroke-soft)" fill-opacity="0.18" stroke="none"/>
  <text x="690" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke-soft)">2024</text>

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

  <text x="230" y="105" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">MCIL</text>
  <rect x="240" y="95" width="6.5" height="18" fill="var(--dia-stroke-soft)" stroke="none"/>
  <text x="252" y="109" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke-soft)">1.3%</text>

  <text x="230" y="135" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">HULC</text>
  <rect x="240" y="125" width="60" height="18" fill="var(--dia-green)" fill-opacity="0.5" stroke="none"/>
  <text x="305" y="139" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-green)">12%</text>

  <text x="230" y="165" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">RoboFlamingo</text>
  <rect x="240" y="155" width="160" height="18" fill="var(--dia-blue)" fill-opacity="0.5" stroke="none"/>
  <text x="405" y="169" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">32%</text>

  <text x="230" y="195" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">GR-1</text>
  <rect x="240" y="185" width="205" height="18" fill="var(--dia-blue)" fill-opacity="0.7" stroke="none"/>
  <text x="450" y="199" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">41%</text>

  <text x="230" y="225" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">RT-2</text>
  <rect x="240" y="215" width="400" height="18" fill="var(--dia-blue)" fill-opacity="0.85" stroke="var(--dia-blue)" stroke-width="0.8" stroke-dasharray="3,2"/>
  <text x="645" y="229" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-blue)">80%*</text>

  <text x="230" y="263" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)" font-weight="bold">π0  ★</text>
  <rect x="240" y="250" width="455" height="22" fill="var(--dia-accent)" stroke="var(--dia-accent-deep)" stroke-width="1.6"/>
  <text x="700" y="266" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-accent-deep)" font-weight="bold">90%+</text>

  <text x="650" y="245" font-family="JetBrains Mono, monospace" font-size="8" fill="var(--dia-stroke-soft)">* contested</text>
  <text x="650" y="255" font-family="JetBrains Mono, monospace" font-size="8" fill="var(--dia-stroke-soft)">  (Google internal setup)</text>

  <path d="M 246,287 Q 350,295 690,287" fill="none" stroke="var(--dia-accent-deep)" stroke-width="1.4" stroke-dasharray="4,3"/>
  <polygon points="687,282 700,287 687,292" fill="var(--dia-accent-deep)"/>
  <text x="470" y="307" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" font-style="italic" fill="var(--dia-accent-deep)">2 years, 70× jump — VLA went from "unusable" to "shippable"</text>
</svg>
</div>
<p class="figure-caption">Figure 1 — CALVIN 5-chain is the strictest VLA metric (all 5 consecutive sub-tasks must succeed). In two years the leaderboard climbed from MCIL 1.3% to π0 90%+ — a 70× jump.</p>

---

## 9. Current (2025) — SOTA Per Benchmark

| Benchmark | Current SOTA |
|---|---|
| CALVIN (5-chain) | π0 |
| LIBERO | OpenVLA fine-tuned |
| SimplerEnv | π0 + RT-2 close |
| RoboArena | Octo (cross-body design) |
| Meta-World | PPO + SAC still strongest (RL advantage) |

→ Different benchmarks → different SOTA models, **no universal champion**.

---

## 10. Usage Recommendations (Researcher)

- **Validate your VLA**: at minimum LIBERO + CALVIN dual test
- **Claim generalist**: add RoboArena for cross-embodiment
- **Real-robot prep**: SimplerEnv massive eval + real robot final
- **Avoid**: only evaluate on own data

---

## 11. Evaluation Challenges

### 11.1 Sim2real Gap

CALVIN / LIBERO 100% ≠ real-robot 100%. Sim doesn't capture friction / lighting variations / object deformation.

### 11.2 Hyperparameter Cherry-picking

Many papers report best-of-3 runs; real deployment can't cherry-pick.

### 11.3 Data Leakage

Pre-train data already contains CALVIN-like tasks → eval bias.

### 11.4 Random Seed Variance

10% ± 5% common std. 1-seed reports unreliable.

### 11.5 Slow

Full LIBERO eval ~ GPU days. Papers often truncate evaluation.

---

## 12. PyTorch — Evaluating OpenVLA on LIBERO

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

## 13. History Timeline

- **2019** — Meta-World (single-task RL)
- **Early 2022** — CALVIN (language-conditioned)
- **2023** — RT-1 / RT-2 drive VLA evaluation demand
- **First half 2024** — LIBERO + SimplerEnv released
- **Second half 2024** — RoboArena, LeRobot Bench
- **2025** — Benchmarks gradually merge / standardize

---

## 14. Related Concepts

- **Same section**: [VLA Models](../01_Foundations/VLA模型.en.md), [π0](../03_Models/Pi0_Physical_Intelligence.en.md), [OpenVLA](../03_Models/RT2_OpenVLA.en.md), [Octo](../03_Models/Octo_Foundation_Policy.en.md), [Helix](../03_Models/Helix_Figure_AI.en.md)
- **Data**: [DROID](DROID_Dataset.en.md), [Open X-Embodiment](数据集与Benchmark.en.md)
- **WM evaluation**: [WM Eval Benchmarks](https://jeffliulab.github.io/ai-notes/01_AI/03_Frontiers/03_World_Models/WM_Eval_Benchmarks/)

---

## References

1. **Mees, O. et al.** "CALVIN: A Benchmark for Language-Conditioned Policy Learning." *RA-L*, 2022.
2. **Liu, B. et al.** "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning." *NeurIPS*, 2024.
3. **Li, X. et al.** "Evaluating Real-World Robot Manipulation Policies in Simulation (SimplerEnv)." *arXiv*, 2024.
4. **RoboArena Team** — RoboArena leaderboard, 2024.
5. **Yu, T. et al.** "Meta-World: A Benchmark and Evaluation for Multi-Task and Meta Reinforcement Learning." *CoRL*, 2019.
6. **HuggingFace LeRobot** — https://github.com/huggingface/lerobot
