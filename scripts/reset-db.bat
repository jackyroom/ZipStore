@echo off
chcp 65001 >nul
title 数据库重置工具

echo =================================================
echo        JackyRoom 数据库重置
echo =================================================
echo.
echo [警告] 此操作将删除 data\jackyroom.db 文件。
echo        所有已发布的内容都会清空！
echo.
echo 按任意键确认重置，或直接关闭窗口取消...
pause >nul

cd /d %~dp0\..
echo.
if exist "data\jackyroom.db" (
    del "data\jackyroom.db"
    echo [成功] 旧数据库已删除。
) else (
    echo [提示] 数据库文件不存在，无需删除。
)

echo.
echo [系统] 正在重新初始化数据库结构...
echo 数据库将在下次启动网站时自动重建。

echo.
pause

