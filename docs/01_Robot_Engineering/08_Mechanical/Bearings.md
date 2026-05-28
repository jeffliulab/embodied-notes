# 轴承 (Bearings) — 旋转 / 直线运动核心

> *轴承使旋转或直线运动 smooth + low friction。从 industrial 机械、汽车、机器人 joint 到精密仪器,无处不在。SKF, NSK, NTN, FAG 主要 vendor。本篇覆盖类型、选型、寿命计算。*
>
> **难度**:Intermediate
> **前置知识**:[Materials Science](../00_Foundations/Materials_Science.md)、[CAD 工具](CAD工具.md)

---

## 1. 轴承基本分类

### 1.1 按运动 type

- **Rolling bearings** (滚动): ball, roller — 最常用
- **Plain bearings** (滑动): bushing, journal — 简单、便宜
- **Magnetic bearings**: 无接触, 高速 + 真空
- **Linear bearings**: 直线运动

### 1.2 按 load 方向

- **Radial**: 垂直于轴
- **Thrust**: 沿轴
- **Combined**: 两者

---

## 2. 滚动轴承类型

### 2.1 Deep Groove Ball Bearing

- 最常用,radial + 小 thrust
- 高速 OK
- 例:608 (8mm × 22mm × 7mm,滑板鞋常见)

### 2.2 Angular Contact Ball

- 高 thrust load
- 用于 spindle, 高精度

### 2.3 Cylindrical Roller

- 大 radial load
- 不能 axial load
- 用于 industrial 设备

### 2.4 Tapered Roller

- 大 radial + thrust combined
- 用于 汽车 wheel hub

### 2.5 Spherical Roller

- 自调心 (compensate misalignment)
- 重 industrial

### 2.6 Needle Roller

- 小尺寸,大 radial
- 用于 transmission, motor

---

## 3. 轴承参数

- **Bore** (内径): 与 shaft 配合
- **OD** (外径)
- **Width**
- **Dynamic load rating (C)**: rated 寿命 1M revolutions
- **Static load rating (C₀)**: 静止承载
- **RPM rating**

ISO 标准编号:608 → 6 (deep groove) 0 (轻系列) 8 (8mm bore)。

---

## 4. 寿命计算

L10 (90% 概率寿命,百万 revolutions):

$$L_{10} = \left(\frac{C}{P}\right)^p$$

- $C$: dynamic load rating
- $P$: equivalent load
- $p$: 3 for ball, 10/3 for roller

例:Bearing C = 10 kN, P = 2 kN → L10 = 125M revolutions。

---

## 5. 润滑

- **Grease**: 普通用,定期补
- **Oil**: 高速 / 高温
- **Sealed bearings**: 内部 pre-greased,免维护
- **Dry**: 真空 / 高温 special

---

## 6. 安装

- **Press fit**: 内圈 / 外圈 紧配合
- **Clearance fit**: 容易拆装
- **Lock nut + lock washer**: thrust fix
- 错误安装 → 早 fail (主要 fail mode)

---

## 7. PyTorch / Python — 寿命估算

```python
def bearing_l10_life(C, P, bearing_type='ball'):
    """Hours of life at given RPM."""
    p = 3 if bearing_type == 'ball' else 10/3
    L10_million_rev = (C / P) ** p
    return L10_million_rev * 1e6

def hours_at_rpm(L10_rev, rpm):
    return L10_rev / (rpm * 60)

L = bearing_l10_life(C=10000, P=2000)  # Newtons
print(f"L10 = {L:.1e} revolutions")
print(f"At 1000 RPM: {hours_at_rpm(L, 1000):.0f} hours")
```

---

## 8. 失效模式

- **Fatigue spalling**: 滚道剥落 (正常 end-of-life)
- **Wear**: contamination, poor lubrication
- **Brinelling**: 静态压力痕
- **Corrosion**: 水, 化学
- **Overheating**: 高速 / poor lubrication
- **Misalignment**: 安装 / shaft 弯
- **Electrical erosion**: VFD 电流通过 bearing → pitting

---

## 9. 应用 / 选型

| 应用 | 轴承类型 |
|---|---|
| 自行车 hub | Deep groove ball |
| 汽车 wheel | Tapered roller |
| 电机 spindle | Angular contact |
| 风电主轴 | Spherical roller (huge) |
| 机器人 joint | Cross roller / harmonic |
| 硬盘 spindle | Fluid dynamic |
| 火箭 turbopump | Special hybrid |

---

## 10. 现代变种

- **Hybrid bearings** (ceramic balls + steel rings): 高速, low friction
- **Magnetic bearings**: zero contact (Tesla turbopump, flywheel)
- **Air bearings**: 极精度, 半导体 wafer stage
- **Foil bearings**: 高速 turbo

---

## 11. Common Pitfalls

### 11.1 Over-greasing

太多 grease → friction 增 + 热;通常 1/3-1/2 cavity 即足。

### 11.2 Wrong tolerance

Shaft / housing tolerance 错 → bearing 内应力 → 早 fail。

### 11.3 Mixing greases

不同 grease incompatible → 化学 reaction → fail。

### 11.4 Storage

> 5 年 storage → grease 干 / 氧化 → 不能用。

### 11.5 RPM rating violation

超 rated RPM → 热 + lubrication breakdown。

---

## 12. Related Concepts

- **同节**:[底盘与运动机构](底盘与运动机构.md)、[3D 打印与加工](3D打印与加工.md)
- **应用**:[无刷电机与 FOC](../06_Actuators_Motors/无刷电机与FOC.md)、[减速器](../06_Actuators_Motors/减速器.md)

---

## References

1. **Harris, T. A.** *Rolling Bearing Analysis*. 5th ed., 2007.
2. **SKF** General Catalog.
3. **ISO 281** — Rolling bearings, dynamic load ratings and rating life.
4. **NSK / NTN / FAG** technical handbooks.
