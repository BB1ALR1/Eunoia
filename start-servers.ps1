# Start Eunoia App Servers
Write-Host "🚀 Starting Eunoia App..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "postgresql://postgres.ndqvveopuakilztrofmq:25280914%24Ai@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
$env:SESSION_SECRET = "your-super-secure-session-secret-change-this-in-production-2024"
$env:NODE_ENV = "development"
$env:EMAIL_USER = "eunoia.therapist@outlook.com"
$env:EMAIL_PASS = "EunoiaAI`$ai"
$env:FROM_EMAIL = "eunoia.therapist@outlook.com"

Write-Host "✅ Environment variables set" -ForegroundColor Green

# Start backend server in new window
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:DATABASE_URL='$env:DATABASE_URL'; `$env:SESSION_SECRET='$env:SESSION_SECRET'; `$env:NODE_ENV='$env:NODE_ENV'; `$env:EMAIL_USER='$env:EMAIL_USER'; `$env:EMAIL_PASS='$env:EMAIL_PASS'; `$env:FROM_EMAIL='$env:FROM_EMAIL'; npx tsx server/index.ts"

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend server in new window
Write-Host "🎨 Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host "🎉 Both servers are starting!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🌐 App: http://localhost:5000 (served by backend)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test the forgot password functionality:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:5000" -ForegroundColor White
Write-Host "2. Click 'Forgot Password?'" -ForegroundColor White
Write-Host "3. Enter your email" -ForegroundColor White
Write-Host "4. Check the console for the reset link" -ForegroundColor White
Write-Host "5. Click the reset link to test the reset page" -ForegroundColor White
