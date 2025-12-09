# Fix Port 5000 Conflict
# This script finds and kills the process using port 5000

Write-Host "🔍 Checking for processes using port 5000..." -ForegroundColor Cyan

$portInfo = netstat -ano | findstr :5000 | Select-String "LISTENING"

if ($portInfo) {
    Write-Host "⚠️  Found process using port 5000" -ForegroundColor Yellow
    
    # Extract PID
    $pid = ($portInfo -split '\s+')[-1]
    Write-Host "   PID: $pid" -ForegroundColor Yellow
    
    # Get process name
    try {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   Process: $($process.ProcessName)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   Process: Unknown" -ForegroundColor Yellow
    }
    
    # Ask for confirmation
    $response = Read-Host "   Kill this process? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "🛑 Killing process $pid..." -ForegroundColor Red
        taskkill /PID $pid /F
        Start-Sleep -Seconds 2
        
        # Verify
        $check = netstat -ano | findstr :5000 | Select-String "LISTENING"
        if (-not $check) {
            Write-Host "✅ Port 5000 is now free!" -ForegroundColor Green
        } else {
            Write-Host "❌ Port 5000 is still in use" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Process not killed. Port 5000 is still in use." -ForegroundColor Red
        Write-Host "💡 You can change the backend port to 5001 instead." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Port 5000 is free!" -ForegroundColor Green
}

Write-Host "`n💡 Alternative: Change backend port to 5001 in server/src/index.ts" -ForegroundColor Cyan

