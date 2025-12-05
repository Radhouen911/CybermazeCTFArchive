@echo off
echo Starting Cybermaze CTF Archive Server...
echo.
echo The archive will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
cd static
npx http-server -p 8080 -o
