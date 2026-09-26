@echo off
echo ====================================================
echo Initializing MySQL Database for Inventory & E-Commerce
echo ====================================================

set /p DB_USER="Enter MySQL User (default root): " || set DB_USER=root
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="Enter MySQL Password (press enter if blank): "

if "%DB_PASS%"=="" (
    mysql -u %DB_USER% < schema.sql
    mysql -u %DB_USER% < seeds.sql
) else (
    mysql -u %DB_USER% -p%DB_PASS% < schema.sql
    mysql -u %DB_USER% -p%DB_PASS% < seeds.sql
)

echo.
echo Database setup completed successfully!
pause
