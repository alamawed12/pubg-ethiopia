Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\public\images\community-assembly-logo.png"
$destPng = "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\src\app\icon.png"
$destApple = "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\src\app\apple-icon.png"
$destFaviconPng = "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\public\favicon.png"
$destFaviconIco = "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\src\app\favicon.ico"
$destPublicIco = "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\public\favicon.ico"

$src = [System.Drawing.Image]::FromFile($srcPath)

# Create a square 512x512 canvas with transparent background
$size = 512
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Source is 1024x512 (2:1 aspect ratio)
# To fit nicely into a square canvas, width = size, height = size * 512 / 1024 = 256
$targetW = $size
$targetH = [int]($size * $src.Height / $src.Width)
$targetX = 0
$targetY = [int](($size - $targetH) / 2)

$g.DrawImage($src, $targetX, $targetY, $targetW, $targetH)
$g.Dispose()
$src.Dispose()

# Save PNGs
$bmp.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($destApple, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($destFaviconPng, [System.Drawing.Imaging.ImageFormat]::Png)

# Convert to 64x64 for ICO
$icoBmp = New-Object System.Drawing.Bitmap($bmp, 64, 64)
$icoBmp.Save($destFaviconIco, [System.Drawing.Imaging.ImageFormat]::Icon)
$icoBmp.Save($destPublicIco, [System.Drawing.Imaging.ImageFormat]::Icon)

$icoBmp.Dispose()
$bmp.Dispose()

Write-Host "Favicons and icons created successfully!"
