@echo off
echo 🚀 启动 ThreadBond 前端服务...
echo.

REM 检查是否在正确的目录
if not exist "frontend\package.json" (
    echo ❌ 请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 进入前端目录
cd frontend

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
)

REM 启动服务
echo 🌐 启动开发服务器...
npm run serve
