# Automated Backend Authentication Flow Test
# Usage: Run in PowerShell from project root

# Step 1: Test invalid credentials
$bodyInvalid = @{ email = 'testuser@example.com'; password = 'wrongpassword' } | ConvertTo-Json
$responseInvalid = Invoke-WebRequest -Uri 'http://localhost:8000/auth/login.php' -Method POST -Body $bodyInvalid -ContentType 'application/json' -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "Invalid Credentials Test:"
Write-Host "Status Code: $($responseInvalid.StatusCode)"
Write-Host "Response: $($responseInvalid.Content)"

# Step 2: Test valid credentials (replace with a real password)
$bodyValid = @{ email = 'testuser@example.com'; password = 'correctpassword' } | ConvertTo-Json
$responseValid = Invoke-WebRequest -Uri 'http://localhost:8000/auth/login.php' -Method POST -Body $bodyValid -ContentType 'application/json' -SessionVariable webSession -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "\nValid Credentials Test:"
Write-Host "Status Code: $($responseValid.StatusCode)"
Write-Host "Response: $($responseValid.Content)"
Write-Host "Cookies: $($webSession.Cookies.GetCookies('http://localhost:8000'))"

# Step 3: Test JWT-protected endpoint (replace endpoint as needed)
if ($responseValid.StatusCode -eq 200) {
    $json = $responseValid.Content | ConvertFrom-Json
    $accessToken = $json.access_token
    if ($accessToken) {
        $headers = @{ Authorization = "Bearer $accessToken" }
        $jwtResponse = Invoke-WebRequest -Uri 'http://localhost:8000/messages/get_messages.php' -Method GET -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host "\nJWT-Protected Endpoint Test:"
        Write-Host "Status Code: $($jwtResponse.StatusCode)"
        Write-Host "Response: $($jwtResponse.Content)"
    } else {
        Write-Host "\nNo access token returned from login."
    }
} else {
    Write-Host "\nValid login failed, skipping JWT endpoint test."
}

Write-Host "\nAutomation Complete. Review results above."
