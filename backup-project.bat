@echo off
echo ========================================
echo Newsense Project Backup Script
echo ========================================
echo.

:: Set project directory
set PROJECT_DIR=%~dp0
set BACKUP_DATE=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set BACKUP_DATE=%BACKUP_DATE: =0%

:: Create backup directory
set BACKUP_DIR=%PROJECT_DIR%backups\newsense_%BACKUP_DATE%
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating backup in: %BACKUP_DIR%
echo.

:: Copy project files (excluding unnecessary files)
echo Copying project files...
xcopy "%PROJECT_DIR%" "%BACKUP_DIR%" /E /I /Y /EXCLUDE:backup-exclude.txt

:: Create backup info file
echo Creating backup info...
echo Backup created: %date% %time% > "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Project: Newsense >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Version: Latest >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Features: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Contact form with Firestore integration >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Admin panel with contacts management >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Product catalog and cart system >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Firebase authentication >> "%BACKUP_DIR%\BACKUP_INFO.txt"

:: Create compressed backup
echo Creating compressed backup...
powershell -command "Compress-Archive -Path '%BACKUP_DIR%' -DestinationPath '%PROJECT_DIR%backups\newsense_%BACKUP_DATE%.zip' -Force"

echo.
echo ========================================
echo Backup completed successfully!
echo ========================================
echo.
echo Backup location: %BACKUP_DIR%
echo Compressed backup: %PROJECT_DIR%backups\newsense_%BACKUP_DATE%.zip
echo.
echo Next steps:
echo 1. Upload to GitHub
echo 2. Copy to cloud storage (Google Drive, OneDrive, etc.)
echo 3. Copy to external hard drive
echo 4. Copy to another computer
echo.
pause
