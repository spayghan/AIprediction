@echo off
echo ====================================================
echo Starting NexStore E-Commerce & Inventory Management
echo ====================================================
echo.
echo Launching Backend server in new window...
start "NexStore Backend" cmd /c "start-backend.bat"

echo Launching Frontend React App in new window...
start "NexStore Frontend" cmd /c "start-frontend.bat"

echo.
echo Both servers launched!
echo Frontend: http://localhost:5173
echo Backend : http://localhost:5000
echo.
pause
