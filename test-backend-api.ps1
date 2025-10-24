# Test Backend API
# This script tests the Python backend API endpoints

Write-Host "🧪 Testing Python Backend API..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Check if backend is running
Write-Host "`n🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Please start the backend first with: .\dev-backend-xampp.ps1" -ForegroundColor Yellow
    exit 1
}

# Test Products endpoint
Write-Host "`n📦 Testing Products endpoint..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "http://localhost:8000/products" -Method GET
    Write-Host "✅ Products endpoint working!" -ForegroundColor Green
    Write-Host "   Found $($products.Count) products" -ForegroundColor Cyan
    
    # Test individual product
    if ($products.Count -gt 0) {
        $firstProduct = $products[0]
        $productId = $firstProduct.id
        Write-Host "   Testing individual product: $productId" -ForegroundColor Cyan
        
        $singleProduct = Invoke-RestMethod -Uri "http://localhost:8000/products/$productId" -Method GET
        Write-Host "✅ Individual product endpoint working!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Products endpoint failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Contact endpoint
Write-Host "`n📧 Testing Contact endpoint..." -ForegroundColor Yellow
try {
    $contactData = @{
        name = "Test User"
        email = "test@example.com"
        message = "This is a test message"
    } | ConvertTo-Json

    $contactResponse = Invoke-RestMethod -Uri "http://localhost:8000/contact" -Method POST -Body $contactData -ContentType "application/json"
    Write-Host "✅ Contact endpoint working!" -ForegroundColor Green
    Write-Host "   Response: $($contactResponse.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Contact endpoint failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Order creation
Write-Host "`n🛒 Testing Order creation..." -ForegroundColor Yellow
try {
    $orderData = @{
        items = @(
            @{
                product_id = "soleil"
                quantity = 1
            }
        )
        shipping_address = @{
            street = "123 Test Street"
            city = "Test City"
            state = "Test State"
            postal_code = "12345"
            country = "Test Country"
        }
        payment_method = "credit_card"
    } | ConvertTo-Json

    $orderResponse = Invoke-RestMethod -Uri "http://localhost:8000/orders" -Method POST -Body $orderData -ContentType "application/json"
    Write-Host "✅ Order creation working!" -ForegroundColor Green
    Write-Host "   Order ID: $($orderResponse.data.order_id)" -ForegroundColor Cyan
    Write-Host "   Total: $($orderResponse.data.total)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Order creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Admin endpoints (without auth - should fail)
Write-Host "`n🔐 Testing Admin endpoints (should fail without auth)..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:8000/admin/stats" -Method GET
    Write-Host "⚠️  Admin endpoint accessible without auth (security issue!)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Admin endpoint properly protected!" -ForegroundColor Green
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "🌐 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "📊 Interactive API: http://localhost:8000/redoc" -ForegroundColor Cyan
