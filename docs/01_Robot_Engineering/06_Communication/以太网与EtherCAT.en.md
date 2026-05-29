# Ethernet and EtherCAT

## Introduction

Ethernet is a general-purpose high-speed network protocol, while EtherCAT is an industrial real-time communication protocol based on Ethernet. For robot systems requiring extremely high real-time performance and synchronized multi-axis control, EtherCAT is currently the most advanced choice.

## Ethernet in Robotics

### Standard Ethernet

| Parameter | Value |
|-----------|-------|
| Speed | 100 Mbps (Fast Ethernet) / 1 Gbps (Gigabit) |
| Distance | 100 m/segment (twisted pair) |
| Interface | RJ45 |
| Topology | Star (switch) or point-to-point |

### Typical Applications

| Application | Bandwidth Need | Description |
|-------------|---------------|-------------|
| Depth cameras | 100–300 Mbps | RealSense, Azure Kinect |
| LiDAR | 50–100 Mbps | Velodyne, Ouster (Ethernet type) |
| ROS2 DDS communication | Varies | Inter-node topics/services |
| Vision processing results | 1–10 Mbps | Object detection, pose estimation |
| Remote monitoring | 1–50 Mbps | Video stream + teleoperation |

### UDP vs. TCP Selection

| Protocol | Latency | Reliability | Application |
|----------|---------|-------------|-------------|
| UDP | Low | No delivery guarantee | Real-time sensor data, video streams |
| TCP | Higher | Guaranteed delivery and ordering | Configuration, file transfer, non-real-time |

!!! tip "Use UDP for Robot Real-Time Control"
    In real-time control scenarios, losing one old data packet is better than waiting for retransmission. UDP's low latency and non-blocking nature are better suited for real-time control.

### ROS2 Ethernet Configuration

ROS2 uses DDS (Data Distribution Service) middleware, running over Ethernet:

```bash
# Set DDS communication domain
export ROS_DOMAIN_ID=42

# FastDDS QoS configuration (real-time scenarios)
# Set in XML configuration file
# - RELIABLE or BEST_EFFORT
# - Queue depth
# - Lifespan
```

## EtherCAT

### Basic Principle

EtherCAT (Ethernet for Control Automation Technology) was developed by Beckhoff and is currently the highest-performance industrial real-time Ethernet protocol.

#### Core Innovation: Processing on the Fly

Traditional Ethernet: Packet arrives at device → device fully receives → processes → forwards

EtherCAT: The data frame "flows through" slave stations, with each slave reading/writing its own data as the frame passes:

```
Master sends one Ethernet frame:
┌──────┬──────┬──────┬──────┬─────┐
│Header│Slave1│Slave2│Slave3│CRC  │
│      │ Data │ Data │ Data │     │
└──┬───┴──┬───┴──┬───┴──┬───┴─────┘
   │      │      │      │
   ↓      ↓      ↓      ↓
  Slave1  Slave2  Slave3  Back to master
  (R/W    (R/W    (R/W
   own     own     own
   region)  region)  region)
```

Each slave adds only a few hundred nanoseconds of delay!

### Performance Specifications

| Parameter | Value |
|-----------|-------|
| Line rate | 100 Mbps |
| Cycle time | Minimum 12.5 us |
| Jitter | <1 us (typical <100 ns) |
| Number of slaves | Theoretically 65535 |
| Topology | Line, star, tree (supports branching) |
| Distance | 100 m/segment (standard Ethernet cable) |
| Synchronization precision | <100 ns (Distributed Clocks DC) |

### Topology Structure

```
Master (PC / Embedded Linux)
  │
  ├── Slave1 (Joint 1) ── Slave2 (Joint 2) ── Slave3 (Joint 3)
  │
  └── Slave4 (IO module) ── Slave5 (Joint 4) ── Slave6 (Joint 5)
```

EtherCAT supports line cascading and branching; the network cable is the bus, no switch needed.

### EtherCAT Frame Structure

EtherCAT frames are encapsulated within standard Ethernet frames (EtherType = 0x88A4):

```
Ethernet frame:
┌─────────┬──────┬────────────────────────────────┬─────┐
│ MAC addr│0x88A4│ EtherCAT data                   │ FCS │
│ (14B)   │(2B)  │ ┌──────┬──────┬──────┬────┐   │(4B) │
│         │      │ │FMMU1 │FMMU2 │FMMU3 │... │   │     │
│         │      │ │(Slave1)│(Slave2)│(Slave3)│   │   │     │
│         │      │ └──────┴──────┴──────┴────┘   │     │
└─────────┴──────┴────────────────────────────────┴─────┘
```

### Slave Types

| Type | Function | Examples |
|------|----------|---------|
| Servo drive | Motor control | Beckhoff AX5000, Inovance IS620N |
| Digital IO | Switch input/output | Beckhoff EL1008/EL2008 |
| Analog IO | Analog acquisition/output | Beckhoff EL3102/EL4102 |
| Encoder interface | Encoder reading | Beckhoff EL5101 |
| Gateway | Protocol conversion | EtherCAT-CAN gateway |

### Distributed Clocks (DC)

EtherCAT's DC feature achieves high-precision time synchronization across all slaves:

- Master propagation time compensation
- Slave local clock calibration
- Synchronization precision <100 ns
- Ensures all joints execute actions at precisely the same moment

$$
\Delta t_{sync} < 100 \text{ ns}
$$

This is critical for coordinated multi-axis robot motion.

## EtherCAT Master Implementations

### IgH EtherCAT Master

Open-source Linux EtherCAT master (GPLv2):

| Feature | Description |
|---------|-------------|
| Platform | Linux (requires kernel module) |
| Real-time | Combined with PREEMPT_RT or Xenomai |
| Language | C |
| Interface | User-space API |
| Maturity | Industrial-grade, widely used |

```c
// IgH EtherCAT Master basic usage
#include "ecrt.h"

ec_master_t *master;
ec_domain_t *domain;

// Initialize
master = ecrt_request_master(0);
domain = ecrt_master_create_domain(master);

// Configure slave
ec_slave_config_t *sc = ecrt_master_slave_config(
    master, 0, 0,  // alias, position
    0x00000002, 0x044C2C52  // vendor_id, product_code
);

// Register PDO entries
unsigned int offset_position;
ec_pdo_entry_reg_t domain_regs[] = {
    {0, 0, 0x00000002, 0x044C2C52, 0x6064, 0, &offset_position},
    {}
};
ecrt_domain_reg_pdo_entry_list(domain, domain_regs);

// Activate
ecrt_master_activate(master);
uint8_t *domain_pd = ecrt_domain_data(domain);

// Real-time loop
void cyclic_task() {
    ecrt_master_receive(master);
    ecrt_domain_process(domain);
    
    // Read position feedback
    int32_t position = EC_READ_S32(domain_pd + offset_position);
    
    // Write position command
    EC_WRITE_S32(domain_pd + offset_target, target_pos);
    
    ecrt_domain_queue(domain);
    ecrt_master_send(master);
}
```

### SOEM (Simple Open EtherCAT Master)

Lightweight open-source EtherCAT master:

| Feature | Description |
|---------|-------------|
| Platform | Linux / Windows / RTOS |
| Real-time | Depends on underlying OS |
| Language | C |
| Size | Lightweight (suitable for embedded) |
| License | GPLv2 |

```c
// SOEM basic usage
#include "ethercat.h"

char IOmap[4096];

// Initialize
ec_init("eth0");
ec_config_init(FALSE);

// Map PDOs
ec_config_map(&IOmap);
ec_configdc();

// Switch to OP state
ec_slave[0].state = EC_STATE_OPERATIONAL;
ec_writestate(0);

// Real-time loop
while (1) {
    ec_send_processdata();
    ec_receive_processdata(EC_TIMEOUTRET);
    
    // Read/write IOmap data
    // ...
    
    usleep(1000);  // 1ms cycle
}
```

## Typical Application Scenarios

### Industrial Robotic Arm

```
Industrial PC (Linux + IgH)
       │ EtherCAT
       ├── Joint 1 servo drive
       ├── Joint 2 servo drive
       ├── Joint 3 servo drive
       ├── Joint 4 servo drive
       ├── Joint 5 servo drive
       ├── Joint 6 servo drive
       ├── Force sensor interface
       └── IO module (pneumatic gripper)

Control cycle: 1ms, 6-axis synchronization precision < 1us
```

### Humanoid Robot

Some high-end humanoid robots use EtherCAT to connect all body joints:

- 20–40 joint drivers
- 1 ms control cycle
- Full-body coordinated motion
- Interfaces with upper-level MPC/RL controllers via shared memory

See [Real-Time Systems](../../03_Sim2Real/02_Deployment/实时系统.md) for details.

## EtherCAT vs. CAN Comparison

| Feature | EtherCAT | CAN / CAN FD |
|---------|----------|--------------|
| Speed | 100 Mbps | 1 / 8 Mbps |
| Cycle time | 12.5 us–1 ms | 1–10 ms |
| Jitter | <1 us | <100 us |
| Number of slaves | 65535 | 32–128 |
| Sync precision | <100 ns | ~10 us |
| Cabling | Standard Ethernet cable | Twisted pair (CAN cable) |
| Cost | Higher | Low |
| Complexity | High (requires Linux + master stack) | Low (built into MCU) |
| Suitable for | Industrial / high-end robots | Small-to-medium robots |

### Selection Recommendations

- **6 axes or fewer, control cycle >1 ms**: CAN is sufficient
- **More than 6 axes, sub-millisecond synchronization needed**: EtherCAT
- **Embedded MCU as master**: CAN (EtherCAT requires Linux)
- **Industrial-grade products**: EtherCAT (standardized, interoperable)
- **Prototyping / education**: CAN (simple, low cost)

## Other Industrial Ethernet Protocols

| Protocol | Developer | Real-Time | Features |
|----------|-----------|-----------|----------|
| EtherCAT | Beckhoff | Hard real-time | Highest performance |
| PROFINET IRT | Siemens | Hard real-time | Siemens ecosystem |
| EtherNet/IP | ODVA | Soft real-time | Based on CIP |
| POWERLINK | B&R | Hard real-time | Open source |
| SERCOS III | Standards body | Hard real-time | Motion control specific |

## Summary

- Standard Ethernet provides high-bandwidth communication for robots (cameras, LiDAR, ROS2)
- EtherCAT achieves sub-microsecond real-time performance through "processing on the fly"
- Distributed Clocks ensure multi-axis synchronization precision <100 ns
- IgH and SOEM are the two mainstream open-source EtherCAT master implementations
- EtherCAT is suitable for high-end industrial and humanoid robot multi-axis control
- CAN is appropriate for small-to-medium robots; EtherCAT is for scenarios demanding ultimate real-time performance
