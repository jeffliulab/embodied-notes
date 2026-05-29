# 以太网与EtherCAT

## 概述

以太网（Ethernet）是通用高速网络协议，EtherCAT是基于以太网的工业实时通信协议。对于需要极高实时性和大量轴同步控制的机器人系统，EtherCAT是目前最先进的选择。

## 以太网在机器人中的应用

### 标准以太网

| 参数 | 值 |
|------|-----|
| 速率 | 100Mbps（快速以太网）/ 1Gbps（千兆） |
| 距离 | 100m/段（双绞线） |
| 接口 | RJ45 |
| 拓扑 | 星形（交换机）或点对点 |

### 典型应用

| 应用 | 带宽需求 | 说明 |
|------|---------|------|
| 深度相机 | 100-300 Mbps | RealSense、Azure Kinect |
| 激光雷达 | 50-100 Mbps | Velodyne、Ouster（以太网型） |
| ROS2 DDS通信 | 变化 | 节点间话题/服务 |
| 视觉处理结果 | 1-10 Mbps | 目标检测、位姿估计 |
| 远程监控 | 1-50 Mbps | 视频流+遥操作 |

### UDP vs TCP选择

| 协议 | 延迟 | 可靠性 | 应用 |
|------|------|--------|------|
| UDP | 低 | 不保证到达 | 实时传感器数据、视频流 |
| TCP | 较高 | 保证到达和顺序 | 配置、文件传输、非实时 |

!!! tip "机器人实时控制用UDP"
    实时控制场景下，丢失一个旧数据包比等待重传更好。UDP的低延迟和无阻塞特性更适合实时控制。

### ROS2中的以太网配置

ROS2使用DDS（Data Distribution Service）中间件，底层走以太网：

```bash
# 设置DDS通信域
export ROS_DOMAIN_ID=42

# FastDDS QoS配置（实时场景）
# 在XML配置文件中设置
# - RELIABLE 或 BEST_EFFORT
# - 队列深度
# - 生命周期
```

## EtherCAT

### 基本原理

EtherCAT（Ethernet for Control Automation Technology）由Beckhoff公司开发，是目前性能最高的工业实时以太网协议。

#### 核心创新：Processing on the Fly

传统以太网：数据包到达设备→设备完整接收→处理→转发

EtherCAT：数据帧"流过"从站，每个从站在帧经过时直接读写自己的数据：

```
主站发送一个以太网帧:
┌──────┬──────┬──────┬──────┬─────┐
│Header│从站1 │从站2 │从站3 │CRC  │
│      │数据区│数据区│数据区│     │
└──┬───┴──┬───┴──┬───┴──┬───┴─────┘
   │      │      │      │
   ↓      ↓      ↓      ↓
  从站1  从站2  从站3   回到主站
  (读/写  (读/写  (读/写
   自己    自己    自己
   的区域)  的区域)  的区域)
```

每个从站只增加约几百纳秒的延迟！

### 性能指标

| 参数 | 值 |
|------|-----|
| 线速率 | 100Mbps |
| 周期时间 | 最短12.5μs |
| 抖动 | <1μs（典型<100ns） |
| 从站数量 | 理论65535 |
| 拓扑 | 线形、星形、树形（支持分支） |
| 距离 | 100m/段（标准以太网线缆） |
| 同步精度 | <100ns（分布式时钟DC） |

### 拓扑结构

```
主站(PC/嵌入式Linux)
  │
  ├── 从站1(关节1) ── 从站2(关节2) ── 从站3(关节3)
  │
  └── 从站4(IO模块) ── 从站5(关节4) ── 从站6(关节5)
```

EtherCAT支持线形级联和分支，网线即总线，无需交换机。

### EtherCAT帧结构

EtherCAT帧封装在标准以太网帧中（EtherType = 0x88A4）：

```
以太网帧:
┌─────────┬──────┬────────────────────────────────┬─────┐
│ MAC地址 │0x88A4│ EtherCAT数据                    │ FCS │
│ (14B)   │(2B)  │ ┌──────┬──────┬──────┬────┐   │(4B) │
│         │      │ │FMMU1 │FMMU2 │FMMU3 │... │   │     │
│         │      │ │(从站1)│(从站2)│(从站3)│    │   │     │
│         │      │ └──────┴──────┴──────┴────┘   │     │
└─────────┴──────┴────────────────────────────────┴─────┘
```

### 从站类型

| 类型 | 功能 | 示例 |
|------|------|------|
| 伺服驱动器 | 控制电机 | Beckhoff AX5000、汇川IS620N |
| 数字IO | 开关量输入输出 | Beckhoff EL1008/EL2008 |
| 模拟IO | 模拟量采集/输出 | Beckhoff EL3102/EL4102 |
| 编码器接口 | 读取编码器 | Beckhoff EL5101 |
| 网关 | 协议转换 | EtherCAT-CAN网关 |

### 分布式时钟（DC, Distributed Clock）

EtherCAT的DC功能实现所有从站的高精度时间同步：

- 主站传播时间补偿
- 从站本地时钟校准
- 同步精度 < 100ns
- 保证所有关节在精确的同一时刻执行动作

$$
\Delta t_{sync} < 100 \text{ ns}
$$

这对多轴机器人的协调运动至关重要。

## EtherCAT主站实现

### IgH EtherCAT Master

开源Linux EtherCAT主站（GPLv2）：

| 特性 | 说明 |
|------|------|
| 平台 | Linux（需内核模块） |
| 实时性 | 配合PREEMPT_RT或Xenomai |
| 语言 | C |
| 接口 | 用户态API |
| 成熟度 | 工业级，广泛使用 |

```c
// IgH EtherCAT Master 基本使用
#include "ecrt.h"

ec_master_t *master;
ec_domain_t *domain;

// 初始化
master = ecrt_request_master(0);
domain = ecrt_master_create_domain(master);

// 配置从站
ec_slave_config_t *sc = ecrt_master_slave_config(
    master, 0, 0,  // alias, position
    0x00000002, 0x044C2C52  // vendor_id, product_code
);

// 注册PDO入口
unsigned int offset_position;
ec_pdo_entry_reg_t domain_regs[] = {
    {0, 0, 0x00000002, 0x044C2C52, 0x6064, 0, &offset_position},
    {}
};
ecrt_domain_reg_pdo_entry_list(domain, domain_regs);

// 激活
ecrt_master_activate(master);
uint8_t *domain_pd = ecrt_domain_data(domain);

// 实时循环
void cyclic_task() {
    ecrt_master_receive(master);
    ecrt_domain_process(domain);
    
    // 读取位置反馈
    int32_t position = EC_READ_S32(domain_pd + offset_position);
    
    // 写入位置指令
    EC_WRITE_S32(domain_pd + offset_target, target_pos);
    
    ecrt_domain_queue(domain);
    ecrt_master_send(master);
}
```

### SOEM（Simple Open EtherCAT Master）

轻量级开源EtherCAT主站：

| 特性 | 说明 |
|------|------|
| 平台 | Linux / Windows / RTOS |
| 实时性 | 依赖底层OS |
| 语言 | C |
| 大小 | 轻量（适合嵌入式） |
| 许可 | GPLv2 |

```c
// SOEM 基本使用
#include "ethercat.h"

char IOmap[4096];

// 初始化
ec_init("eth0");
ec_config_init(FALSE);

// 映射PDO
ec_config_map(&IOmap);
ec_configdc();

// 切换到OP状态
ec_slave[0].state = EC_STATE_OPERATIONAL;
ec_writestate(0);

// 实时循环
while (1) {
    ec_send_processdata();
    ec_receive_processdata(EC_TIMEOUTRET);
    
    // 读写 IOmap 中的数据
    // ...
    
    usleep(1000);  // 1ms周期
}
```

## 典型应用场景

### 工业机械臂

```
工控机(Linux + IgH)
       │ EtherCAT
       ├── 关节1伺服驱动器
       ├── 关节2伺服驱动器
       ├── 关节3伺服驱动器
       ├── 关节4伺服驱动器
       ├── 关节5伺服驱动器
       ├── 关节6伺服驱动器
       ├── 力传感器接口
       └── IO模块(气动夹爪)

控制周期: 1ms, 6轴同步精度 < 1μs
```

### 人形机器人

某些高端人形机器人采用EtherCAT连接全身关节：

- 20-40个关节驱动器
- 1ms控制周期
- 全身协调运动
- 与上层MPC/RL控制器通过共享内存交互

详见 [实时系统](../../03_Sim2Real/02_Deployment/实时系统.md)

## EtherCAT vs CAN 对比

| 特性 | EtherCAT | CAN / CAN FD |
|------|----------|--------------|
| 速率 | 100 Mbps | 1 / 8 Mbps |
| 周期时间 | 12.5μs-1ms | 1-10ms |
| 抖动 | <1μs | <100μs |
| 从站数量 | 65535 | 32-128 |
| 同步精度 | <100ns | ~10μs |
| 线缆 | 标准网线 | 双绞线(CAN线) |
| 成本 | 较高 | 低 |
| 复杂度 | 高（需Linux+主站栈） | 低（MCU内置） |
| 适用 | 工业/高端机器人 | 中小型机器人 |

### 选择建议

- **6轴以下、控制周期>1ms**：CAN足够
- **6轴以上、需要亚毫秒同步**：EtherCAT
- **嵌入式MCU主控**：CAN（EtherCAT需要Linux）
- **工业级产品**：EtherCAT（标准化、互操作性）
- **原型/教育**：CAN（简单、低成本）

## 其他工业以太网

| 协议 | 开发商 | 实时性 | 特点 |
|------|--------|--------|------|
| EtherCAT | Beckhoff | 硬实时 | 性能最高 |
| PROFINET IRT | Siemens | 硬实时 | 西门子生态 |
| EtherNet/IP | ODVA | 软实时 | 基于CIP |
| POWERLINK | B&R | 硬实时 | 开源 |
| SERCOS III | 标准组织 | 硬实时 | 运动控制专用 |

## 小结

- 标准以太网为机器人提供高带宽通信（相机、激光雷达、ROS2）
- EtherCAT通过"飞行处理"实现亚微秒级实时性能
- 分布式时钟保证多轴同步精度<100ns
- IgH和SOEM是两个主流开源EtherCAT主站实现
- EtherCAT适合高端工业机器人和人形机器人的多轴控制
- CAN适合中小型机器人，EtherCAT适合需要极致实时性的场景
