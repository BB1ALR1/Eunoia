@echo off
echo 🚀 Starting Eunoia App...

REM Set environment variables
set DATABASE_URL=postgresql://postgres.ndqvveopuakilztrofmq:25280914%%24Ai@aws-1-us-east-1.pooler.supabase.com:6543/postgres
set SESSION_SECRET=your-super-secure-session-secret-change-this-in-production-2024
set NODE_ENV=development
set EMAIL_USER=eunoia.therapist@outlook.com
set EMAIL_PASS=EunoiaAI$ai
set FROM_EMAIL=eunoia.therapist@outlook.com

echo ✅ Environment variables set

REM Start backend server
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npx tsx server/index.ts"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend server  
echo 🎨 Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo 🎉 Both servers are starting!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🌐 App: http://localhost:5000 (served by backend)
pause
