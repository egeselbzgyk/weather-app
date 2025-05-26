$url = "https://github.com/pocketbase/pocketbase/releases/download/v0.28.1/pocketbase_0.28.1_windows_amd64.zip"
$output = "pocketbase.zip"

# Create pocketbase directory if it doesn't exist
if (-not (Test-Path -Path "pocketbase")) {
    New-Item -ItemType Directory -Path "pocketbase"
}

# Download the file
Write-Host "Downloading PocketBase..."
Invoke-WebRequest -Uri $url -OutFile $output

# Extract the zip file
Write-Host "Extracting PocketBase..."
Expand-Archive -Path $output -DestinationPath "pocketbase" -Force

# Remove the zip file
Remove-Item -Path $output

Write-Host "PocketBase has been downloaded and extracted to the pocketbase directory." 