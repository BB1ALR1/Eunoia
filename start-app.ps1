
# Eunoia App Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting Eunoia App..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "postgresql://postgres.ndqvveopuakilztrofmq:25280914%24Ai@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
$env:SESSION_SECRET = "your-super-secure-session-secret-change-this-in-production-2024"
$env:NODE_ENV = "development"
$env:EMAIL_USER = "eunoia.therapist@outlook.com"
$env:EMAIL_PASS = "EunoiaAI`$ai"  # Escaped $ with backtick
$env:FROM_EMAIL = "eunoia.therapist@outlook.com"

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:DATABASE_URL='$env:DATABASE_URL'; `$env:SESSION_SECRET='$env:SESSION_SECRET'; `$env:NODE_ENV='$env:NODE_ENV'; `$env:EMAIL_USER='$env:EMAIL_USER'; `$env:EMAIL_PASS='$env:EMAIL_PASS'; `$env:FROM_EMAIL='$env:FROM_EMAIL'; npx tsx server/index.ts"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "🎨 Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host "🎉 Both servers are starting!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🌐 App: http://localhost:5000 (served by backend)" -ForegroundColor Cyan
