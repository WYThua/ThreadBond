#!/bin/bash

echo "========================================"
echo "ThreadBond 项目启动脚本"
echo "========================================"

echo ""
echo "正在检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装或未启动"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装"
    exit 1
fi

docker --version
docker-compose --version

echo ""
echo "正在启动 ThreadBond 服务..."
echo "这可能需要几分钟时间，请耐心等待..."

docker-compose up --build

echo ""
echo "服务已停止"