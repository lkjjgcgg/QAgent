@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo   QAgent 接口自动化测试
echo ==========================================

echo.
echo [1/4] 运行 pytest（自动清理上次结果）...
".\venv\Scripts\python.exe" -m pytest api_tests -v --alluredir=allure-results --clean-alluredir

echo.
echo [2/4] 写入环境信息...
copy /Y "api_tests\environment.properties" "allure-results\" >nul

echo.
echo [3/4] 生成 HTML 报告...
".\tools\allure\bin\allure.bat" generate allure-results -o allure-report --clean

echo.
echo [4/4] 打开报告...
".\tools\allure\bin\allure.bat" open allure-report

echo.
echo 完成！报告在 C:\Users\33893\QAgent\allure-report
pause