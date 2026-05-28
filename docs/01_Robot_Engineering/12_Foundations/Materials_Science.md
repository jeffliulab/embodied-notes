# 材料科学 (Materials Science) — 工程基础

> *材料决定 product 性能、成本、可靠性。从金属、聚合物、陶瓷到复合材料、半导体。本篇覆盖工程视角必须了解的材料 properties + selection。*
>
> **难度**:Intermediate
> **前置知识**:化学 / 物理基础

---

## 1. 材料 4 大类

- **金属**: 强、导电、塑性 (steel, Al, Cu, Ti)
- **聚合物 (Plastic)**: 轻、便宜、绝缘 (PE, PP, PC, PEEK)
- **陶瓷**: 硬、耐高温、脆 (Al₂O₃, SiC)
- **复合材料**: 组合多材料 (CFRP, GFRP)
- **半导体**: Si, GaN, SiC (电子)

---

## 2. 关键 properties

### 2.1 机械

- **Strength**: 屈服 / 抗拉
- **Stiffness**: Young 模量 $E$
- **Hardness**: Vickers / Rockwell
- **Toughness**: 吸收能量能力
- **Fatigue**: 循环载荷下寿命

### 2.2 电学

- **电导率** σ (S/m)
- **介电常数** ε
- **击穿电压**

### 2.3 热学

- **热导率** $k$ (W/m·K)
- **热膨胀系数** α (1/K)
- **熔点 / 服役温度**

### 2.4 化学

- 耐腐蚀
- 化学稳定

---

## 3. 常见材料 selection

| 应用 | 材料 | 关键 property |
|---|---|---|
| 飞机结构 | Al alloy, CFRP | 强 / 重量比高 |
| 汽车 chassis | High-strength steel | 强 / 成本 |
| 火箭喷管 | 难熔金属, 陶瓷 | 耐 3000°C |
| 手机外壳 | Al, Ti, plastic, glass | 美观 + 强 |
| 电池外壳 | Al, plastic | 轻 + 不导电 |
| PCB | FR4 epoxy | 介电 + 机械稳定 |
| 散热 | Cu, Al, graphene | 高导热 |
| 切削刀 | WC carbide, diamond | 极硬 |

---

## 4. 金属

### 4.1 钢 (Steel)

- Fe + C (< 2.1%)
- Low / medium / high carbon
- Alloy steel: Cr, Ni, Mo
- Stainless steel: 18% Cr + 8% Ni

### 4.2 铝合金

- 轻 (2.7 g/cm³ vs 钢 7.8)
- 6061, 7075 航天用
- 易加工 / 焊接

### 4.3 钛合金

- 强 / 重比 high, 耐腐蚀
- 贵 ($30/kg vs 钢 $1)
- 航天 / 医疗 implant

---

## 5. 聚合物

### 5.1 热塑 (Thermoplastic)

- PE, PP, PS, PVC, ABS
- 加热软化 → 可循环
- 注塑成型

### 5.2 热固 (Thermoset)

- Epoxy, phenolic
- 固化后不可塑
- 强 / 耐高温

### 5.3 弹性体

- Rubber, silicone
- 大形变

### 5.4 高性能

- PEEK: 250°C 服役, vacuum compatible
- PTFE (Teflon): 不黏, 高低温
- Polyimide: 400°C+

---

## 6. 复合材料

- CFRP (Carbon Fiber Reinforced Polymer): 飞机机翼, 自行车
- GFRP: 风电叶片
- Sandwich (honeycomb core)

---

## 7. 半导体材料

- **Si**: 主流 IC
- **GaN**: 高频, 高压 (5G, 充电器)
- **SiC**: 电动车 power 模块
- **GaAs**: 高速 RF
- **Diamond**: 极端环境

---

## 8. 工程实例 (材料选择 trade-off)

无人机 frame:
- CFRP: 强 + 轻, $$
- Al: 便宜, 略重
- Plastic: 最便宜, 弱
- 工程师选 → application-specific

---

## 9. 测试方法

- Tensile test (UTM)
- Hardness (Vickers, Rockwell)
- Fatigue (S-N curve)
- Impact (Charpy)
- Microscopy (SEM, TEM)
- X-ray diffraction

---

## 10. Common Pitfalls

### 10.1 没有 universal best

每材料 trade-off,application-specific 选择。

### 10.2 成本 = 性能 / 加工

材料贵也许加工便宜 (CFRP)。

### 10.3 数据表 condition

材料 properties 依温度 / 环境;always read datasheet。

### 10.4 Anisotropy

Composite 方向相关;不能假设 isotropic。

### 10.5 Joining

材料接触可能 galvanic corrosion (Al + Cu)。

---

## 11. Related Concepts

- **同节**:[Linear Algebra](Linear_Algebra.md)、[Thermodynamics](Thermodynamics.md)
- **应用**:[CAD 工具](../04_Mechanical_Engineering/CAD工具.md)、[3D 打印](../04_Mechanical_Engineering/3D打印与加工.md)

---

## References

1. **Callister, W. D. & Rethwisch, D. G.** *Materials Science and Engineering: An Introduction*. 10th ed., 2018.
2. **Ashby, M. F.** *Materials Selection in Mechanical Design*. 5th ed., 2016.
3. **Shackelford, J. F.** *Introduction to Materials Science for Engineers*. 8th ed., 2014.
