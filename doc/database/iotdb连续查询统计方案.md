# **Apache IoTDB 连续查询（CQ）核心概念与实践指南**


## **1\. 什么是连续查询 (What is a Continuous Query?)**

### **核心定义**

Apache IoTDB 中的**连续查询（Continuous Query, CQ）** 是一种能够**自动、周期性地**对实时数据执行聚合查询，并将结果写入新的时间序列的强大功能。可以将其理解为一种内置于数据库的、专门用于实时数据流处理的定时任务。

### **解决的痛点**

在物联网（IoT）场景中，海量、高频的数据给实时分析带来了巨大挑战。连续查询主要解决了以下问题：

* **查询效率低下**：对海量原始数据进行长时间跨度的聚合分析非常耗时。  
* **重复计算**：许多周期性的分析任务（如每小时平均值）被反复执行，浪费计算资源。  
* **应用逻辑复杂**：开发者需在应用层自行实现数据拉取、计算、存储的循环逻辑。

### **核心优势**

* **自动化数据处理**：将数据聚合、降采样等任务自动化，无需外部应用干预。  
* **提升查询性能**：通过预计算，将查询从海量原始数据转移到少量聚合数据上，实现数量级的性能提升。  
* **简化系统架构**：将计算逻辑下沉到数据库层，降低应用开发的复杂度和维护成本。

## **2\. 核心应用场景**

### **场景一：数据降采样 (Data Downsampling)**

这是CQ最经典的应用场景。随着时间推移，数据的价值密度降低，通过降采样可以在保留核心趋势的同时，大幅减少存储空间并加快历史查询。

**示例**：每小时计算一次温度的平均值、最大值和最小值。

CREATE CONTINUOUS QUERY cq\_downsample\_temp  
BEGIN  
  SELECT  
    AVG(temperature) AS avg\_temp,  
    MAX\_VALUE(temperature) AS max\_temp,  
    MIN\_VALUE(temperature) AS min\_temp  
  INTO  
    root.statistics.device1.temperature\_hourly  
  FROM  
    root.factory.device1  
  GROUP BY time(1h)  
END

### **场景二：预计算与实时分析**

CQ可用于预先计算分析指标，为实时监控或更复杂的分析做准备。

**示例**：计算设备功率的分钟级变化量。

CREATE CONTINUOUS QUERY cq\_power\_delta  
BEGIN  
  SELECT  
    LAST\_VALUE(power) \- FIRST\_VALUE(power) AS power\_delta  
  INTO  
    root.analysis.device1.power\_delta\_minute  
  FROM  
    root.factory.device1  
  GROUP BY time(1m)  
END

## **3\. 如何实现特定周期的查询**

### **查询当日/特定日平均值（手动查询）**

若要即时计算某一天的数据，最直接的方法是使用 WHERE 子句限定时间范围。

**示例**：计算2025年7月13日当天的平均温度。

SELECT AVG(temperature)  
FROM root.factory.device1  
WHERE time \>= '2025-07-13 00:00:00' AND time \< '2025-07-14 00:00:00'

### **查询“今天截至目前”的实时数据（推荐方案）**

由于“今天”是一个正在进行的、不完整的时间窗口，无法用一个简单的每日CQ直接计算。最佳实践是采用**高频预聚合 \+ 手动查询**的组合策略。

步骤1：创建分钟级预聚合CQ  
创建一个高频次的CQ，例如每分钟执行一次，将原始数据预聚合成分钟级的平均值。  
\-- 每分钟执行一次，计算前一分钟的平均温度  
CREATE CONTINUOUS QUERY cq\_1m\_avg\_temp  
EVERY 1m  
BEGIN  
  SELECT AVG(temperature) AS avg\_temp\_1m  
  INTO root.stats.device1.temperature\_1m  
  FROM root.factory.device1  
  GROUP BY time(1m)  
END

步骤2：手动查询预聚合数据  
当需要获取“今天到目前为止”的平均值时，直接对上一步生成的分钟级数据进行查询。  
\-- 查询分钟级数据，得到当日实时平均值  
SELECT AVG(avg\_temp\_1m)  
FROM root.stats.device1.temperature\_1m  
WHERE time \>= '2025-07-14 00:00:00'

**优势**：此方法查询速度极快，非常适合实时监控面板等对性能要求高的场景。

## **4\. 玩转高级查询窗口**

连续查询并非只能查询上一个周期。通过高级参数，可以实现对任意时间窗口的灵活控制。

| 参数 | 说明 |
| :---- | :---- |
| GROUP BY time(interval) | 定义聚合计算的时间窗口大小。 |
| EVERY \<interval\> | 定义查询的**执行频率**。 |
| FOR \<interval\> | 明确定义每次查询的**时间窗口大小**。 |
| start\_time\_offset, end\_time\_offset | 定义查询窗口相对于执行时间的**偏移量**。 |

### **示例1：查询更早的周期**

**需求**：每天执行一次，但计算的是**大前天**的数据。

CREATE CONTINUOUS QUERY cq\_query\_two\_days\_ago  
EVERY 1d  
BEGIN  
  SELECT AVG(temperature)  
  INTO root.stats.two\_days\_ago\_avg\_temp  
  FROM root.factory.device1  
  \-- 核心：查询窗口为 \[now()-50h, now()-26h)  
  GROUP BY time(1d, 26h, 50h)  
END

### **示例2：实现滑动窗口**

**需求**：**每10分钟**执行一次，但每次都计算**过去1小时**的平均值。

CREATE CONTINUOUS QUERY cq\_sliding\_window  
EVERY 10m  
BEGIN  
  SELECT AVG(temperature)  
  INTO root.stats.moving\_avg\_temp  
  FROM root.factory.device1  
  \-- 核心：使用 FOR 定义窗口大小，与 EVERY 解耦  
  GROUP BY time(FOR 1h)  
END

## **5\. 管理连续查询**

IoTDB提供了简单的SQL命令来管理CQ的生命周期。

* **创建查询**： CREATE CONTINUOUS QUERY ...  
* **查看查询**： SHOW CONTINUOUS QUERIES;  
* **删除查询**： DROP CONTINUOUS QUERY \<cq\_id\>;

## **6\. 预聚合数据的生命周期管理 (TTL)**

为预聚合数据设置合理的TTL（Time-To-Live，数据存活时间）至关重要，它能有效平衡查询性能与存储成本。

### **关键考虑因素**

* **数据最终用途**：是中间跳板还是本身也需要长期分析？  
* **更高维度的聚合时机**：确保在更高维度聚合完成前，数据不会被删除。  
* **数据回溯需求**：需要保留多长时间的精细数据用于故障排查？  
* **存储成本**：存储资源是否敏感？

### **推荐的TTL设置策略**

#### **策略一：实时监控优先型（短TTL: 3d \~ 7d）**

适用于分钟级数据主要作为计算“日平均”的跳板，并满足短期下钻查询的场景。设置7d的TTL能提供充足的安全缓冲。

#### **策略二：精细分析优先型（中长TTL: 30d \~ 90d）**

如果分析师需要频繁对过去数周的数据进行精细复盘，则应保留更长时间的分钟级数据。

#### **策略三：分层TTL策略（最佳实践）**

为不同粒度的数据设置不同的生命周期，在查询灵活性和存储成本间取得最佳平衡。

* **原始数据 (raw)**：TTL最短，如 **1-3天**。  
* **分钟数据 (minute)**：TTL中等，如 **7-30天**。  
* **小时数据 (hour)**：TTL较长，如 **90-180天**。  
* **天数据 (day)**：**永久保存**（不设置TTL）。

### **最终建议**

对于初学者，建议从一个安全的起点开始：**为分钟级预聚合数据设置一个 7天 的TTL**，后续再根据实际查询习惯进行调整。

\-- 为分钟级聚合数据设置7天的TTL  
ALTER TIMESERIES root.stats.device1.temperature\_1m SET TTL=7d  
