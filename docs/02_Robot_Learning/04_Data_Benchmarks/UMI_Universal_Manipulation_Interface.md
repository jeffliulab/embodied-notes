# UMI — Universal Manipulation Interface (Stanford)

> *Stanford / Columbia 2024 年 2 月发布 **UMI** (Universal Manipulation Interface):用 **手持夹爪 + iPhone** 在 in-the-wild 场景采集 manipulation 数据,无需机器人也无需仿真。一个人一天采几百 demo,4 周积累 10k+ 全新任务数据 → 训出 Diffusion Policy,直接 transfer 真机。是机器人数据收集的范式革命。*
>
> **难度**:Intermediate
> **前置知识**:[VLA 模型](../01_Foundations/VLA模型.md)、[Diffusion Policy](../02_Methods/扩散策略.md)、[遥操作](遥操作与数据收集.md)
> **后续阅读**:[Aloha](Aloha_Mobile_Aloha.md)、[DROID](DROID_Dataset.md)

---

## 1. 直觉:数据采集的痛点

传统真机 demo 采集流程:
1. 买 \$30k 机器人 (Franka / UR5)
2. 装 teleoperation rig
3. 一个 lab 一年才几千 demo

UMI 颠覆这个:
- 用人手拿一个**带 gripper 的手持设备**(像采矿夹钳)
- iPhone Pro 内置 fisheye + AR Kit 提供 SLAM
- 直接人 "做" 任务,记录视频 + gripper 状态
- 数据无缝迁移到 Franka 上

→ **任何人都能采,任何场景都能采,价格 < $1000**。

---

## 2. UMI 硬件

<!-- SVG-DESIGN-NOTES
Type: A (结构 / 架构 — 双路径解耦)
Q0: UMI 的设计 DNA 是「采集」与「部署」共用同一个 action 表示（6-DOF pose-in-gripper-frame），所以人手持便携设备采的数据直接喂给 Franka，省去机器人 teleop 环节
Q1: 上下两条平行路径：上路 = 人采（handheld + iPhone）；下路 = 真机部署（Franka）；中间用一个 box 显示「6-DOF gripper-frame action format」作为「共用瓶颈」——视觉上揭示数据格式是这个 design 的统一点
Q2: 去掉标题：「两条平行水平 lane + 中间统一 action box + 两端不同实体（手 vs Franka）」——这种「采集 / 部署解耦」拓扑唯有 UMI；其他平台 (Aloha/RT-1/...) 都是单一闭环
Q3: 删去原来的 "Physical Device / Sensors / Action data" 三框横排（隐去硬件 spec 框）；保留必要的「iPhone fisheye / ARKit pose / $800」信息但贴在 lane 元素旁
Q4: 6-DOF 标在 action box 内；$800 贴 handheld 旁；ARKit 30Hz 贴 iPhone 旁
Q5: 全用 var(--dia-*)；中文标签 "人手持采集" 在英文版改为 "Human capture"
-->
<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="UMI decoupled capture-deploy paths">
  <defs>
    <marker id="umi-arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">UMI — 采集 / 部署 共用 6-DOF gripper-frame action</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">人手持设备采的数据无需修改就能喂给 Franka 训练 Diffusion Policy</text>

  <!-- Lane labels -->
  <text x="35" y="105" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">采集 lane</text>
  <text x="35" y="120" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">人 + $800 设备</text>
  <text x="35" y="245" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-green)">部署 lane</text>
  <text x="35" y="260" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Franka 真机</text>

  <!-- Top lane: Human hand sketch -->
  <!-- simplified hand: oval + lines -->
  <ellipse cx="180" cy="120" rx="22" ry="14" fill="none" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="160" y1="125" x2="148" y2="138" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="200" y1="125" x2="212" y2="138" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="180" y="155" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">human</text>

  <!-- Handheld gripper icon -->
  <g stroke="var(--dia-accent)" stroke-width="1.8" fill="none">
    <rect x="250" y="105" width="60" height="30" fill="var(--dia-bg-card)"/>
    <line x1="265" y1="105" x2="255" y2="85"/>
    <line x1="295" y1="105" x2="305" y2="85"/>
    <rect x="251" y="85" width="8" height="6" fill="var(--dia-accent)"/>
    <rect x="301" y="85" width="8" height="6" fill="var(--dia-accent)"/>
  </g>
  <text x="280" y="155" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">handheld gripper</text>
  <text x="280" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">~$300</text>

  <!-- iPhone -->
  <rect x="350" y="98" width="28" height="48" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <circle cx="364" cy="115" r="3" fill="none" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <text x="364" y="160" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">iPhone Pro</text>
  <text x="364" y="175" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">fisheye · ARKit · 30 Hz</text>

  <!-- Capture arrow → action box -->
  <path d="M 400 120 L 470 130" stroke="var(--dia-stroke-soft)" stroke-width="1.6" marker-end="url(#umi-arr)"/>

  <!-- Central unified action format box -->
  <rect x="480" y="120" width="240" height="80" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="2.5"/>
  <rect x="480" y="120" width="6" height="80" fill="var(--dia-gold)"/>
  <text x="600" y="145" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">action = (pose, gripper)</text>
  <text x="600" y="165" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">6-DOF · gripper-frame</text>
  <text x="600" y="183" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">transfer-ready · 不绑特定 robot</text>

  <!-- Bottom lane: Franka arm + same action box feeds it -->
  <!-- Franka arm icon (3-segment articulated) -->
  <g stroke="var(--dia-green)" stroke-width="2.4" fill="none">
    <rect x="260" y="240" width="20" height="8" fill="var(--dia-green)"/>
    <line x1="270" y1="240" x2="270" y2="220"/>
    <circle cx="270" cy="220" r="4" fill="var(--dia-green)"/>
    <line x1="270" y1="220" x2="290" y2="200"/>
    <circle cx="290" cy="200" r="3.5" fill="var(--dia-green)"/>
    <line x1="290" y1="200" x2="320" y2="195"/>
    <rect x="316" y="187" width="14" height="8" fill="var(--dia-bg-card)" stroke="var(--dia-green)"/>
  </g>
  <text x="290" y="270" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-green)">Franka 7-DOF</text>
  <text x="290" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">action 经 IK 转 joint</text>

  <!-- Arrow from action box to Franka -->
  <path d="M 480 200 C 430 210 380 215 330 215" stroke="var(--dia-stroke-soft)" stroke-width="1.6" fill="none" marker-end="url(#umi-arr)"/>
  <text x="410" y="207" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">deploy</text>

  <!-- Up arrow to denote "data flow" -->
  <path d="M 600 220 L 600 240 L 600 240" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 3"/>

  <!-- Bottom note: Diffusion Policy trains on top -->
  <rect x="490" y="240" width="220" height="38" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="600" y="260" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Diffusion Policy 训于 (obs → action)</text>
  <text x="600" y="274" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">no robot needed during capture</text>
  <path d="M 600 200 L 600 240" stroke="var(--dia-gold)" stroke-width="1.6" stroke-dasharray="3 3" marker-end="url(#umi-arr)"/>
</svg>
</div>
<p class="figure-caption">Figure 1 — 上 lane: 人手持 gripper + iPhone Pro 用 ARKit 估 pose 30 Hz 采集；下 lane: Franka 同样 action 格式部署。中央金色 box 是「6-DOF gripper-frame action」共用瓶颈——只要 robot ee 能 reach 同样 pose,policy 就 transfer。</p>

---

## 3. 数据 → 真机 transfer

UMI 的核心 trick:**Action 表示在 gripper frame**(不是 robot frame),因此切换机器人时无需改变 action。

```python
# UMI 数据格式
action = {
    'pose_in_camera_frame': (T, 6),  # x,y,z,roll,pitch,yaw
    'gripper_width': (T, 1),  # 0-1 normalized
}
# Deploy 到 Franka:
ee_pose_franka = camera_to_robot_transform(action['pose_in_camera_frame'])
```

只要 robot 的 ee 能 reach 同样 pose,policy 就 transfer。

---

## 4. 收集效率

UMI 论文报告:
- **1 人 1 天**采集 ~ 200 demo (vs 真机 30)
- **4 周** 4 人 = ~ 10k+ demo
- 成本 **$1k** (设备) + $0 仿真 = 极便宜

---

## 5. UMI 训出的 policy

论文 evaluate 在四个任务:
- **Cup unstacking** — 90% 成功
- **Knife placement** — 80%
- **Cloth folding** — 70%
- **Toy assembly** — 60%

全是 **从 UMI 数据 → Diffusion Policy → Franka** 完全 transfer。

---

## 6. 关键设计

### 6.1 鱼眼相机

iPhone Pro 的超广角(0.5x)看到更大场景 + 手周围,匹配 robot wrist cam 视野。

### 6.2 ARKit pose

iPhone 内置 SLAM 给绝对 6-DOF pose,精度 ~ 1cm。不需外部 motion capture。

### 6.3 Gripper 力反馈

简单 spring + sensor 测 gripper 闭合度。

### 6.4 Camera relative action

action 在 camera frame 中,**手 / robot 不变**前提下可 cross-embodiment。

---

## 7. PyTorch — 用 UMI 数据训 Diffusion Policy

```python
import torch
from diffusion_policy import DiffusionPolicy

ds = UMIDataset("/path/to/umi_demos")
model = DiffusionPolicy(
    obs_dim=512,  # ResNet18 of fisheye RGB
    action_dim=7,  # 6-DOF + gripper
    horizon=16,
)

for batch in DataLoader(ds, batch_size=64):
    obs = encoder(batch['rgb'])  # (B, T_obs, 512)
    actions = batch['action']  # (B, T_action, 7)
    
    # DDPM loss
    t = torch.randint(0, 1000, (B,))
    noise = torch.randn_like(actions)
    noisy = q_sample(actions, t, noise)
    pred = model(obs, noisy, t)
    loss = ((pred - noise) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()

# Deploy on Franka
def run_on_robot(robot, model):
    obs = robot.get_camera_image()
    actions = model.sample(obs)  # (16, 7)
    for a in actions:
        ee_pose = camera_to_robot_transform(a[:6])
        robot.set_ee_pose(ee_pose)
        robot.set_gripper(a[6])
```

---

## 8. 与其他数据采集方式对比

| 方法 | 速度 | 成本 | 多 lab | Cross-embodiment |
|---|---|---|---|---|
| 真机 teleop (Aloha / DROID) | 慢 | $30k+ | 难 | 难 |
| 仿真 (Isaac) | 快 | $0 | 易 | sim-real gap |
| **UMI** | **快** | **$1k** | **易** | **✓** |
| Internet video | 极快 | $0 | n/a | ❌ (无 action) |

---

## 9. 不足

### 9.1 仅静态 base

UMI 手持 = 假设 robot base 不动。Mobile manipulation 不适配。

### 9.2 力 / 触觉缺失

iPhone 相机 + spring gripper 没有触觉。组装等任务难。

### 9.3 单手

只能采单手数据。bimanual UMI 需两人 sync — 难。

### 9.4 视野角度

UMI 用 wide fisheye;但真机有 narrow wrist cam,distribution gap。

### 9.5 人 ≠ robot

人手腕灵活,机器人 wrist 受限。某些 motion 不能 transfer。

---

## 10. 影响

- 2024 起多 lab adopt UMI 范式 (Bimanual UMI / Mobile UMI)
- 推动"数据采集 democratize"
- 与 DROID 形成 **cheap data (UMI) + standardized data (DROID)** 互补

---

## 11. 历史 timeline

- **2023 年中** — Stanford 实验初版 UMI
- **2024-02** — UMI 论文发布
- **2024-Q3** — Bimanual UMI, Mobile UMI 衍生
- **2025** — 多 lab adopt as standard alternative to teleop

---

## 12. Common Pitfalls

### 12.1 ARKit drift

iPhone SLAM 在 featureless 环境 drift,影响 pose 精度。需 fiducial marker (AprilTag) 校正。

### 12.2 Action latency

iPhone 30 Hz 采样,Franka 通常 1000 Hz → 需 interpolation。

### 12.3 数据 noise

人手不像机器人精确,demonstrations 有自然 jitter。需 filtering。

### 12.4 Gripper 不同

UMI gripper 形状 ≠ Franka 配套 gripper → 抓取力可能不同。

### 12.5 不适合 deformable

毛巾 / 绳子等 deformable 物体在 UMI 上效果显著差(SLAM 难追踪)。

---

## 13. Related Concepts

- **同节**:[VLA 模型](../01_Foundations/VLA模型.md)、[DROID Dataset](DROID_Dataset.md)、[Aloha](Aloha_Mobile_Aloha.md)、[π0](../03_Models/Pi0_Physical_Intelligence.md)
- **数据收集**:[遥操作与数据收集](遥操作与数据收集.md)
- **方法**:[Diffusion Policy](../02_Methods/扩散策略.md)、[模仿学习](../02_Methods/模仿学习.md)

---

## References

1. **Chi, C. et al.** "Universal Manipulation Interface (UMI): In-the-Wild Robot Teaching Without In-the-Wild Robots." *RSS*, 2024.
2. **Chi, C. et al.** "Diffusion Policy." *RSS*, 2023.
3. **Khazatsky, A. et al.** "DROID." *RSS*, 2024.
4. **UMI Project Page** — https://umi-gripper.github.io/
5. **Apple ARKit Documentation** — Pose tracking specifications.
