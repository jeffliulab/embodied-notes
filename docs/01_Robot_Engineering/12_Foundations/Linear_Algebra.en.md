# Linear Algebra — Engineering Foundation

> *Linear algebra is the core of engineering math. From vectors / matrices → eigenvalues → SVD → PCA, it permeates control, signal, image, robotics. This article covers concepts every engineer should know.*
>
> **Difficulty**: Intermediate
> **Prerequisites**: calculus basics

---

## 1. Vector / Matrix Basics

### 1.1 Vector

$$\mathbf{v} = \begin{pmatrix} v_1 \\ v_2 \\ ... \\ v_n \end{pmatrix} \in \mathbb{R}^n$$

- Norm: $\|\mathbf{v}\| = \sqrt{\sum v_i^2}$
- Unit: $\hat{\mathbf{v}} = \mathbf{v} / \|\mathbf{v}\|$

### 1.2 Dot / Cross Product

$$\mathbf{a} \cdot \mathbf{b} = \sum a_i b_i = \|\mathbf{a}\| \|\mathbf{b}\| \cos\theta$$

3D cross product: perpendicular to both, magnitude = parallelogram area.

### 1.3 Matrix Multiplication

$$(AB)_{ij} = \sum_k A_{ik} B_{kj}$$

Non-commutative: $AB \neq BA$.

---

## 2. Linear Transformations

Matrix $A$ maps $\mathbf{v}$ → $A\mathbf{v}$:
- Rotation
- Scaling
- Shear
- Projection
- Reflection

Robotics: transformation matrices describe rigid-body motion.

---

## 3. Eigenvalues / Eigenvectors

$$A \mathbf{v} = \lambda \mathbf{v}$$

Eigenvectors keep direction; eigenvalues scale.

Applications: PCA, stability (control), vibration modes, PageRank.

```python
import numpy as np
A = np.array([[2, 1], [1, 2]])
eigenvalues, eigenvectors = np.linalg.eig(A)
```

---

## 4. SVD

$$A = U \Sigma V^T$$

Applications: PCA, image compression, pseudoinverse, recommendation systems.

---

## 5. Determinants / Invertibility

- $\det(A) = 0$ → A not invertible
- $\det(A) \neq 0$ → A invertible

Small $\det$ → ill-conditioned (sensitive to perturbation).

---

## 6. Norms

- $L_1$: $\sum |v_i|$ (sparse)
- $L_2$: Euclidean
- $L_\infty$: $\max |v_i|$
- Frobenius: matrix Euclidean

---

## 7. Linear Systems

$$A \mathbf{x} = \mathbf{b}$$

- Square invertible: $\mathbf{x} = A^{-1} \mathbf{b}$
- Overdetermined: $\mathbf{x} = (A^T A)^{-1} A^T \mathbf{b}$ (least squares)
- Underdetermined: minimum-norm via pseudoinverse

```python
x = np.linalg.solve(A, b)
x, *_ = np.linalg.lstsq(A, b, rcond=None)
```

---

## 8. PyTorch / NumPy Engineering

```python
import numpy as np

def rotation_matrix(theta):
    return np.array([[np.cos(theta), -np.sin(theta)],
                     [np.sin(theta), np.cos(theta)]])

v = np.array([1, 0])
R = rotation_matrix(np.pi / 4)
v_rotated = R @ v

def homogeneous_transform(R, t):
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = t
    return T

T1 = homogeneous_transform(R1, t1)
T2 = homogeneous_transform(R2, t2)
T_total = T1 @ T2
```

---

## 9. Application Domains

- **Robotics**: forward / inverse kinematics, Jacobian
- **Computer vision**: camera calibration, image warping
- **Signal processing**: FFT is matrix multiplication
- **ML**: linear regression, PCA, neural nets
- **Quantum**: state vectors + unitary matrices
- **Structural mechanics**: FEM

---

## 10. Common Pitfalls

### 10.1 Non-commutative

$AB \neq BA$, order matters.

### 10.2 Numerical Precision

Near-singular matrix → unstable. Use SVD to check condition number.

### 10.3 Dimension Mismatch

$A$ $(m \times n)$ × $B$ $(n \times p)$ = $(m \times p)$.

### 10.4 Sparse Matrices

Large sparse → scipy.sparse, not dense.

### 10.5 GPU Acceleration

PyTorch / CUDA — orders-of-magnitude speedup.

---

## 11. Related Concepts

- **Same section**: [Signal Processing](Signal_Processing.en.md), [Control Theory](Control_Theory.en.md)
- **AI**: https://jeffliulab.github.io/ai-notes/00_Computing_Science/01_Math_Foundations/

---

## References

1. **Strang, G.** *Introduction to Linear Algebra*. 5th ed., 2016.
2. **Golub, G. H. & Van Loan, C. F.** *Matrix Computations*. 4th ed., 2013.
3. **Trefethen, L. N. & Bau III, D.** *Numerical Linear Algebra*. SIAM, 1997.
