# 线性代数 (Linear Algebra) — 工程基础

> *线性代数是工程数学核心。从向量 / 矩阵 → 特征值 → SVD → PCA,渗透 control、signal、image、robotics 各方向。本篇覆盖工程必备概念。*
>
> **难度**:Intermediate
> **前置知识**:微积分基础
> **后续阅读**:[控制理论](Control_Theory.md)、[信号处理](Signal_Processing.md)

---

## 1. 向量 / 矩阵基础

### 1.1 向量

$$\mathbf{v} = \begin{pmatrix} v_1 \\ v_2 \\ ... \\ v_n \end{pmatrix} \in \mathbb{R}^n$$

- 模长: $\|\mathbf{v}\| = \sqrt{\sum v_i^2}$
- 单位向量: $\hat{\mathbf{v}} = \mathbf{v} / \|\mathbf{v}\|$

### 1.2 内积 / 外积

$$\mathbf{a} \cdot \mathbf{b} = \sum a_i b_i = \|\mathbf{a}\| \|\mathbf{b}\| \cos\theta$$

3D 叉积:垂直于两向量,模 = 平行四边形面积。

### 1.3 矩阵乘法

$$(AB)_{ij} = \sum_k A_{ik} B_{kj}$$

不可交换 $AB \neq BA$。

---

## 2. 线性变换

矩阵 $A$ 把向量 $\mathbf{v}$ → $A\mathbf{v}$:
- Rotation matrix (旋转)
- Scaling
- Shear
- Projection
- Reflection

机器人:transformation matrix 描述刚体运动。

---

## 3. 特征值与特征向量

$$A \mathbf{v} = \lambda \mathbf{v}$$

特征向量 = 方向不变;特征值 = 缩放因子。

应用:
- PCA (主成分分析)
- 稳定性分析 (control)
- 振动模式 (mechanical)
- PageRank

```python
import numpy as np
A = np.array([[2, 1], [1, 2]])
eigenvalues, eigenvectors = np.linalg.eig(A)
```

---

## 4. SVD (Singular Value Decomposition)

$$A = U \Sigma V^T$$

任意 $m \times n$ matrix 分解:
- $U$: 左奇异向量
- $\Sigma$: 对角,奇异值
- $V$: 右奇异向量

应用:
- PCA (Σ 大 = 主成分)
- 图像压缩
- Pseudoinverse $A^+ = V \Sigma^+ U^T$
- 推荐系统

---

## 5. 行列式与可逆

- $\det(A) = 0$ → A 不可逆
- $\det(A) \neq 0$ → A 可逆,$A^{-1}$ 存在

工程意义:
- $\det = 0$ 系统 underdetermined
- $\det$ 小 → ill-conditioned (敏感于扰)

---

## 6. 范数 (Norms)

- $L_1$: $\|\mathbf{v}\|_1 = \sum |v_i|$ (sparse)
- $L_2$: Euclidean
- $L_\infty$: $\max |v_i|$
- Frobenius: matrix $\sqrt{\sum |a_{ij}|^2}$

---

## 7. 线性方程组

$$A \mathbf{x} = \mathbf{b}$$

- $A$ 方且可逆: $\mathbf{x} = A^{-1} \mathbf{b}$
- Overdetermined ($m > n$): 最小二乘 $\mathbf{x} = (A^T A)^{-1} A^T \mathbf{b}$
- Underdetermined: minimum-norm solution via pseudoinverse

```python
x = np.linalg.solve(A, b)  # 方
x, *_ = np.linalg.lstsq(A, b, rcond=None)  # 最小二乘
```

---

## 8. PyTorch / NumPy 工程应用

```python
import numpy as np

# 旋转矩阵 (2D)
def rotation_matrix(theta):
    return np.array([[np.cos(theta), -np.sin(theta)],
                     [np.sin(theta), np.cos(theta)]])

# 旋转向量
v = np.array([1, 0])
R = rotation_matrix(np.pi / 4)  # 45°
v_rotated = R @ v

# 齐次变换 (3D 机器人常用)
def homogeneous_transform(R, t):
    """4x4 transformation matrix."""
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = t
    return T

# 多 transformation chaining
T1 = homogeneous_transform(R1, t1)
T2 = homogeneous_transform(R2, t2)
T_total = T1 @ T2  # 先 T2 再 T1
```

---

## 9. 应用领域

- **机器人学**: 正/逆 kinematics, Jacobian
- **Computer vision**: 相机 calibration, image warping
- **信号处理**: FFT 是 matrix multiplication
- **机器学习**: 线性回归, PCA, neural net
- **量子计算**: state vectors + unitary matrices
- **结构力学**: 有限元法 (FEM)

---

## 10. Common Pitfalls

### 10.1 矩阵乘法不交换

$AB \neq BA$,顺序重要。

### 10.2 数值精度

矩阵接近 singular → 解不稳。
用 SVD 检测 condition number。

### 10.3 维度不匹配

$A$ $(m \times n)$ × $B$ $(n \times p)$ = $(m \times p)$。

### 10.4 Sparse 矩阵

大稀疏 matrix 用 scipy.sparse,不用 dense 表示。

### 10.5 GPU 加速

PyTorch / CUDA 数倍加速大矩阵运算。

---

## 11. Related Concepts

- **同节**:[信号处理](Signal_Processing.md)、[控制理论](Control_Theory.md)
- **应用**:[CAD 工具](../04_Mechanical_Engineering/CAD工具.md)
- **AI**: https://jeffliulab.github.io/ai-notes/00_Computing_Science/01_Math_Foundations/

---

## References

1. **Strang, G.** *Introduction to Linear Algebra*. 5th ed., 2016.
2. **Golub, G. H. & Van Loan, C. F.** *Matrix Computations*. 4th ed., 2013.
3. **Trefethen, L. N. & Bau III, D.** *Numerical Linear Algebra*. SIAM, 1997.
4. **NumPy / SciPy documentation**.
