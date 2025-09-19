-- ThreadBond 数据库初始化脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS threadbond_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE threadbond_db;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'threadbond_user'@'%' IDENTIFIED BY 'threadbond_pass_2024';

-- 授予权限
GRANT ALL PRIVILEGES ON threadbond_db.* TO 'threadbond_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 设置时区
SET time_zone = '+08:00';

-- 创建一些基础配置表（可选）
CREATE TABLE IF NOT EXISTS app_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入一些默认配置
INSERT IGNORE INTO app_config (config_key, config_value, description) VALUES
('app_name', 'ThreadBond', '应用名称'),
('app_version', '1.0.0', '应用版本'),
('max_clue_attempts', '3', '每个线索最大解密尝试次数'),
('chat_message_retention_days', '30', '聊天消息保留天数'),
('clue_retention_days', '90', '线索保留天数'),
('max_daily_clues', '10', '每日最大线索创建数量'),
('ai_enabled', 'true', '是否启用AI功能');

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR') NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSON,
    user_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建性能监控表
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 输出初始化完成信息
SELECT 'ThreadBond 数据库初始化完成' AS message;