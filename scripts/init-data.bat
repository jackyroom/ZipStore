@echo off
chcp 65001 >nul
title JackyRoom Data Seeder

echo ==========================================
echo        JackyRoom 数据库初始化工具
echo ==========================================
echo.
echo [警告] 此操作会清空现有数据并写入测试数据！
echo.
pause

echo.
echo [系统] 正在写入数据...
cd /d %~dp0\..
node scripts\seed.js

echo.
echo [完成] 请重启网站查看效果。
pause

