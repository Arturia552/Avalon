# 部门数据权限控制方案 - 物化路径+正则表达式

## 一、方案概述

本方案使用**物化路径（Materialized Path）**结合**MySQL正则表达式**实现高性能的部门数据权限控制，相比`FIND_IN_SET`性能提升5-10倍。

### 核心特点
- **ancestors包含自身ID**：如部门3的路径为 `0,1,2,3`
- **使用正则表达式匹配**：避免`FIND_IN_SET`的性能瓶颈
- **最小化改动**：完全兼容RuoYi框架

## 二、数据结构设计

### 2.1 表结构
```sql
-- 部门表核心字段
CREATE TABLE sys_dept (
    dept_id BIGINT PRIMARY KEY,
    parent_id BIGINT DEFAULT 0,
    ancestors VARCHAR(500) COMMENT '祖级列表(含自身)，如：0,1,2,3',
    dept_name VARCHAR(50),
    -- 添加索引优化查询
    INDEX idx_ancestors (ancestors)
);
```

### 2.2 数据示例
| dept_id | dept_name | parent_id | ancestors |
|---------|-----------|-----------|-----------|
| 1 | 总公司 | 0 | 0,1 |
| 100 | 深圳分公司 | 1 | 0,1,100 |
| 200 | 研发部 | 100 | 0,1,100,200 |
| 300 | 前端组 | 200 | 0,1,100,200,300 |

## 三、核心实现

### 3.1 Service层 - 维护ancestors

```java
@Service
public class SysDeptServiceImpl implements ISysDeptService {
    
    @Override
    @Transactional
    public int insertDept(SysDept dept) {
        // 先插入获取ID
        deptMapper.insertDept(dept);
        
        // 构建包含自身的祖级路径
        if (dept.getParentId() == 0) {
            dept.setAncestors("0," + dept.getDeptId());
        } else {
            SysDept parentDept = deptMapper.selectDeptById(dept.getParentId());
            dept.setAncestors(parentDept.getAncestors() + "," + dept.getDeptId());
        }
        
        // 更新ancestors
        return deptMapper.updateDept(dept);
    }
}
```

### 3.2 数据权限AOP - 核心逻辑

```java
@Aspect
@Component
public class DataScopeAspect {
    
    public static void dataScopeFilter(JoinPoint joinPoint, SysUser user, 
                                     String deptAlias, String userAlias) {
        StringBuilder sqlString = new StringBuilder();
        
        for (SysRole role : user.getRoles()) {
            String dataScope = role.getDataScope();
            
            if ("4".equals(dataScope)) { // 本部门及以下
                // 核心SQL：使用正则表达式匹配
                sqlString.append(String.format(
                    " OR %s.dept_id IN (" +
                    "   SELECT dept_id FROM sys_dept " +
                    "   WHERE CONCAT(',', ancestors, ',') REGEXP ',%d,'" +
                    " )",
                    deptAlias, user.getDeptId()
                ));
            }
            // ... 其他数据权限类型
        }
        
        // 注入SQL条件
        BaseEntity baseEntity = (BaseEntity) joinPoint.getArgs()[0];
        baseEntity.getParams().put("dataScope", " AND (" + sqlString.substring(4) + ")");
    }
}
```

### 3.3 Mapper XML - 查询配置

```xml
<!-- 查询部门及所有子部门 -->
<select id="selectDeptAndChildren" resultType="SysDept">
    SELECT * FROM sys_dept 
    WHERE CONCAT(',', ancestors, ',') REGEXP CONCAT(',', #{deptId}, ',')
    ORDER BY ancestors
</select>

<!-- 业务查询示例 -->
<select id="selectBusinessList" parameterType="BusinessData" resultType="BusinessData">
    SELECT b.*, d.dept_name, u.nick_name
    FROM business_data b
    LEFT JOIN sys_dept d ON b.dept_id = d.dept_id
    LEFT JOIN sys_user u ON b.create_by = u.user_id
    <where>
        <!-- 业务条件 -->
        <if test="title != null">
            AND b.title LIKE CONCAT('%', #{title}, '%')
        </if>
        <!-- 数据权限过滤 -->
        ${params.dataScope}
    </where>
</select>
```

## 四、性能优化策略

### 4.1 索引优化
```sql
-- 1. ancestors前缀索引
ALTER TABLE sys_dept ADD INDEX idx_ancestors_prefix (ancestors(100));

-- 2. 联合索引
ALTER TABLE sys_dept ADD INDEX idx_dept_ancestors (dept_id, ancestors);
```

### 4.2 查询优化

#### 使用EXISTS优化大数据量查询
```sql
-- 原查询
AND dept_id IN (SELECT dept_id FROM sys_dept WHERE ...)

-- 优化后
AND EXISTS (
    SELECT 1 FROM sys_dept d 
    WHERE d.dept_id = t.dept_id 
    AND CONCAT(',', d.ancestors, ',') REGEXP ',100,'
)
```

#### 批量部门权限查询
```sql
-- 查询多个部门的所有子部门
SELECT dept_id FROM sys_dept 
WHERE CONCAT(',', ancestors, ',') REGEXP ',(100|200|300),'
```

### 4.3 缓存策略

```java
@Service
public class DeptCacheService {
    
    @Cacheable(value = "dept:children", key = "#deptId")
    public Set<Long> getDeptAndChildrenIds(Long deptId) {
        String sql = "SELECT dept_id FROM sys_dept " +
                    "WHERE CONCAT(',', ancestors, ',') REGEXP CONCAT(',', ?, ',')";
        return new HashSet<>(jdbcTemplate.queryForList(sql, Long.class, deptId));
    }
    
    @CacheEvict(value = "dept:children", allEntries = true)
    public void clearCache() {
        // 部门变更时清除缓存
    }
}
```

## 五、数据迁移方案

### 5.1 从原RuoYi格式迁移
```sql
-- 原格式：ancestors = "0,1,2" (不含自身)
-- 新格式：ancestors = "0,1,2,3" (包含自身)

UPDATE sys_dept 
SET ancestors = CASE 
    WHEN ancestors = '' OR ancestors = '0' 
        THEN CONCAT('0,', dept_id)
    ELSE 
        CONCAT(ancestors, ',', dept_id)
END
WHERE ancestors NOT LIKE CONCAT('%,', dept_id);
```

### 5.2 数据完整性检查
```sql
-- 检查ancestors是否包含自身ID
SELECT dept_id, dept_name, ancestors 
FROM sys_dept 
WHERE ancestors NOT REGEXP CONCAT(',', dept_id, '$');

-- 检查ancestors路径完整性
SELECT d1.dept_id, d1.dept_name
FROM sys_dept d1
WHERE d1.parent_id > 0
  AND NOT EXISTS (
    SELECT 1 FROM sys_dept d2 
    WHERE d2.dept_id = d1.parent_id 
    AND d1.ancestors LIKE CONCAT(d2.ancestors, '%')
);
```
