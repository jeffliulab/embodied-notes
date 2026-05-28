# UMI — Universal Manipulation Interface (Stanford)

> *Stanford / Columbia released **UMI** (Universal Manipulation Interface) in February 2024: collect manipulation data in-the-wild using a **handheld gripper + iPhone**, no robot or simulator needed. One person collects hundreds of demos per day; 4 weeks accumulates 10k+ new-task data → trains Diffusion Policy that directly transfers to real robots. A paradigm shift for robot data collection.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: [VLA Models](VLA模型.en.md), [Diffusion Policy](../04_Robot_Learning/扩散策略.en.md), [Teleoperation](../04_Robot_Learning/遥操作与数据收集.en.md)
> **Further reading**: [Aloha](Aloha_Mobile_Aloha.en.md), [DROID](DROID_Dataset.en.md)

---

## 1. Intuition: Pain Points of Data Collection

Traditional real-robot demo collection:
1. Buy \$30k robot (Franka / UR5)
2. Set up teleoperation rig
3. One lab one year ≈ thousands of demos

UMI disrupts this:
- Use a **handheld device with gripper** (like mining tongs)
- iPhone Pro's built-in fisheye + AR Kit provides SLAM
- Human directly "does" the task, records video + gripper state
- Data seamlessly transfers to Franka

→ **Anyone can collect, anywhere, < $1000**.

---

## 2. UMI Hardware

<!-- SVG-DESIGN-NOTES
Type: A (structure / architecture — decoupled dual-path)
Q0: UMI's design DNA is that "capture" and "deploy" share the same action representation (6-DOF gripper-frame pose), so data collected with a handheld device feeds directly into a Franka, eliminating the robot-teleop step from data collection
Q1: Two parallel lanes (top = human capture, bottom = robot deploy); a central gold box "6-DOF gripper-frame action format" is the shared bottleneck; visually shows the data format is the unifying point of this design
Q2: Strip the title — "two parallel horizontal lanes + a shared central action box + different entities at each end (human vs Franka)" is UMI's signature topology; every other platform has a single closed loop
Q3: Removed the three "Physical Device / Sensors / Action data" boxes side-by-side; kept critical info (iPhone fisheye / ARKit / $800) directly next to lane elements
Q4: 6-DOF labeled inside action box; $800 next to handheld; ARKit 30Hz next to iPhone
Q5: All var(--dia-*); English labels — shared between .md and .en.md
-->
<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="UMI decoupled capture-deploy paths">
  <defs>
    <marker id="umi-arr-en" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="var(--dia-stroke-soft)"/>
    </marker>
  </defs>

  <text x="380" y="26" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="17" fill="var(--dia-stroke)">UMI — capture and deploy share one 6-DOF gripper-frame action</text>
  <text x="380" y="46" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="12" fill="var(--dia-stroke-soft)">Data collected with a handheld device feeds the Franka diffusion policy unmodified</text>

  <text x="35" y="105" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-accent-deep)">Capture lane</text>
  <text x="35" y="120" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">human + $800 kit</text>
  <text x="35" y="245" text-anchor="start" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="12" fill="var(--dia-green)">Deploy lane</text>
  <text x="35" y="260" text-anchor="start" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">Franka real robot</text>

  <ellipse cx="180" cy="120" rx="22" ry="14" fill="none" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="160" y1="125" x2="148" y2="138" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <line x1="200" y1="125" x2="212" y2="138" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <text x="180" y="155" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">human</text>

  <g stroke="var(--dia-accent)" stroke-width="1.8" fill="none">
    <rect x="250" y="105" width="60" height="30" fill="var(--dia-bg-card)"/>
    <line x1="265" y1="105" x2="255" y2="85"/>
    <line x1="295" y1="105" x2="305" y2="85"/>
    <rect x="251" y="85" width="8" height="6" fill="var(--dia-accent)"/>
    <rect x="301" y="85" width="8" height="6" fill="var(--dia-accent)"/>
  </g>
  <text x="280" y="155" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-accent-deep)">handheld gripper</text>
  <text x="280" y="170" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">~$300</text>

  <rect x="350" y="98" width="28" height="48" rx="3" fill="var(--dia-bg-card)" stroke="var(--dia-stroke)" stroke-width="1.4"/>
  <circle cx="364" cy="115" r="3" fill="none" stroke="var(--dia-stroke)" stroke-width="1.2"/>
  <text x="364" y="160" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="var(--dia-stroke)">iPhone Pro</text>
  <text x="364" y="175" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="9" fill="var(--dia-stroke-soft)">fisheye · ARKit · 30 Hz</text>

  <path d="M 400 120 L 470 130" stroke="var(--dia-stroke-soft)" stroke-width="1.6" marker-end="url(#umi-arr-en)"/>

  <rect x="480" y="120" width="240" height="80" rx="6" fill="var(--dia-bg-card)" stroke="var(--dia-gold)" stroke-width="2.5"/>
  <rect x="480" y="120" width="6" height="80" fill="var(--dia-gold)"/>
  <text x="600" y="145" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="14" fill="var(--dia-accent-deep)">action = (pose, gripper)</text>
  <text x="600" y="165" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="var(--dia-stroke)">6-DOF · gripper-frame</text>
  <text x="600" y="183" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="11" fill="var(--dia-stroke-soft)">transfer-ready · robot-agnostic</text>

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
  <text x="290" y="285" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">action → IK → joints</text>

  <path d="M 480 200 C 430 210 380 215 330 215" stroke="var(--dia-stroke-soft)" stroke-width="1.6" fill="none" marker-end="url(#umi-arr-en)"/>
  <text x="410" y="207" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-accent-deep)">deploy</text>

  <path d="M 600 220 L 600 240" stroke="var(--dia-stroke-soft)" stroke-width="1" stroke-dasharray="2 3"/>

  <rect x="490" y="240" width="220" height="38" rx="4" fill="var(--dia-bg-deep)" stroke="var(--dia-stroke-soft)" stroke-width="1"/>
  <text x="600" y="260" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="11" fill="var(--dia-stroke)">Diffusion Policy trained on (obs → action)</text>
  <text x="600" y="274" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="10" fill="var(--dia-stroke-soft)">no robot needed during capture</text>
  <path d="M 600 200 L 600 240" stroke="var(--dia-gold)" stroke-width="1.6" stroke-dasharray="3 3" marker-end="url(#umi-arr-en)"/>
</svg>
</div>
<p class="figure-caption">Figure 1 — Top lane: human holds a handheld gripper + iPhone Pro using ARKit pose at 30 Hz. Bottom lane: Franka deploys the same action format. The central gold box is the "6-DOF gripper-frame action" shared bottleneck — as long as the robot EE can reach the same pose, the policy transfers.</p>

---

## 3. Data → Real Robot Transfer

UMI's core trick: **action represented in gripper frame** (not robot frame), so switching robots requires no action change.

```python
# UMI data format
action = {
    'pose_in_camera_frame': (T, 6),  # x,y,z,roll,pitch,yaw
    'gripper_width': (T, 1),  # 0-1 normalized
}
# Deploy to Franka:
ee_pose_franka = camera_to_robot_transform(action['pose_in_camera_frame'])
```

As long as robot's EE can reach the same pose, the policy transfers.

---

## 4. Collection Efficiency

UMI paper reports:
- **1 person, 1 day** collects ~200 demos (vs real-robot 30)
- **4 weeks × 4 people** = ~10k+ demos
- Cost **$1k** (device) + $0 sim = extremely cheap

---

## 5. Policies Trained from UMI

Paper evaluates four tasks:
- **Cup unstacking** — 90% success
- **Knife placement** — 80%
- **Cloth folding** — 70%
- **Toy assembly** — 60%

All **UMI data → Diffusion Policy → Franka** end-to-end transfer.

---

## 6. Key Design

### 6.1 Fisheye Camera

iPhone Pro's ultra-wide (0.5x) sees bigger scene + around hand, matching robot wrist cam FOV.

### 6.2 ARKit Pose

iPhone's built-in SLAM provides absolute 6-DOF pose, accuracy ~1cm. No external motion capture needed.

### 6.3 Gripper Force Feedback

Simple spring + sensor measures gripper closure.

### 6.4 Camera Relative Action

Actions in camera frame, **with hand / robot invariant** for cross-embodiment.

---

## 7. PyTorch — Train Diffusion Policy with UMI Data

```python
import torch
from diffusion_policy import DiffusionPolicy

ds = UMIDataset("/path/to/umi_demos")
model = DiffusionPolicy(
    obs_dim=512,
    action_dim=7,
    horizon=16,
)

for batch in DataLoader(ds, batch_size=64):
    obs = encoder(batch['rgb'])
    actions = batch['action']
    
    t = torch.randint(0, 1000, (B,))
    noise = torch.randn_like(actions)
    noisy = q_sample(actions, t, noise)
    pred = model(obs, noisy, t)
    loss = ((pred - noise) ** 2).mean()
    opt.zero_grad(); loss.backward(); opt.step()

# Deploy on Franka
def run_on_robot(robot, model):
    obs = robot.get_camera_image()
    actions = model.sample(obs)
    for a in actions:
        ee_pose = camera_to_robot_transform(a[:6])
        robot.set_ee_pose(ee_pose)
        robot.set_gripper(a[6])
```

---

## 8. vs Other Data Collection Methods

| Method | Speed | Cost | Multi-lab | Cross-embodiment |
|---|---|---|---|---|
| Real teleop (Aloha / DROID) | Slow | $30k+ | Hard | Hard |
| Sim (Isaac) | Fast | $0 | Easy | sim-real gap |
| **UMI** | **Fast** | **$1k** | **Easy** | **✓** |
| Internet video | Very fast | $0 | n/a | ❌ (no action) |

---

## 9. Limitations

### 9.1 Static Base Only

UMI handheld = robot base assumed stationary. Mobile manipulation doesn't fit.

### 9.2 No Force / Tactile

iPhone camera + spring gripper has no touch. Assembly etc. hard.

### 9.3 Single Hand

Only single-hand data. Bimanual UMI needs two-person sync — hard.

### 9.4 FOV Angle

UMI uses wide fisheye; real robot has narrow wrist cam, distribution gap.

### 9.5 Human ≠ Robot

Human wrists flexible, robot wrist constrained. Some motion can't transfer.

---

## 10. Impact

- Since 2024, multiple labs adopt UMI paradigm (Bimanual UMI / Mobile UMI)
- Drives "data collection democratization"
- Complements DROID: **cheap data (UMI) + standardized data (DROID)**

---

## 11. History Timeline

- **Mid 2023** — Stanford prototype UMI experiments
- **2024-02** — UMI paper released
- **2024-Q3** — Bimanual UMI, Mobile UMI derivatives
- **2025** — multiple labs adopt as standard alternative to teleop

---

## 12. Common Pitfalls

### 12.1 ARKit Drift

iPhone SLAM drifts in featureless environments, affecting pose accuracy. Need fiducial markers (AprilTag) for correction.

### 12.2 Action Latency

iPhone 30 Hz sampling, Franka usually 1000 Hz → need interpolation.

### 12.3 Data Noise

Human hands less precise than robot, demonstrations have natural jitter. Need filtering.

### 12.4 Gripper Differs

UMI gripper shape ≠ Franka companion gripper → grasping force may differ.

### 12.5 Not for Deformable

Towels / ropes etc. deformable objects significantly worse on UMI (SLAM hard to track).

---

## 13. Related Concepts

- **Same section**: [VLA Models](VLA模型.en.md), [DROID Dataset](DROID_Dataset.en.md), [Aloha](Aloha_Mobile_Aloha.en.md), [π0](Pi0_Physical_Intelligence.en.md)
- **Data collection**: [Teleoperation & Data Collection](../04_Robot_Learning/遥操作与数据收集.en.md)
- **Methods**: [Diffusion Policy](../04_Robot_Learning/扩散策略.en.md), [Imitation Learning](../04_Robot_Learning/模仿学习.en.md)

---

## References

1. **Chi, C. et al.** "Universal Manipulation Interface (UMI): In-the-Wild Robot Teaching Without In-the-Wild Robots." *RSS*, 2024.
2. **Chi, C. et al.** "Diffusion Policy." *RSS*, 2023.
3. **Khazatsky, A. et al.** "DROID." *RSS*, 2024.
4. **UMI Project Page** — https://umi-gripper.github.io/
5. **Apple ARKit Documentation** — Pose tracking specifications.
