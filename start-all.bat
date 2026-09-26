@echo off
echo ====================================================
echo Starting StockFlow E-Commerce & Inventory Management
echo ====================================================
echo.
echo Launching AI Demand Forecast Microservice in new window...
start "StockFlow AI Microservice" cmd /c "start-ai.bat"

echo Launching Backend server in new window...
start "StockFlow Backend" cmd /c "start-backend.bat"

echo Launching Frontend React App in new window...
start "StockFlow Frontend" cmd /c "start-frontend.bat"

echo.
echo All services launched!
echo Frontend        : http://localhost:5173
echo Backend         : http://localhost:5000
echo AI Microservice : http://localhost:8000
echo.
pause
