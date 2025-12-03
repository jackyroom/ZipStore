@echo off
chcp 936 >nul 2>&1
title JackyRoom Dev Mode
cd /d %~dp0
call scripts\dev.bat
