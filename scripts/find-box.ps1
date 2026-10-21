Add-Type -AssemblyName System.Drawing

function FindQrBox($path, $xStart, $yStart) {
    $bmp = New-Object System.Drawing.Bitmap($path)
    $minX = $bmp.Width
    $maxX = 0
    $minY = $bmp.Height
    $maxY = 0
    
    for ($y = $yStart; $y -lt $bmp.Height; $y += 2) {
        for ($x = $xStart; $x -lt $bmp.Width; $x += 2) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.R -gt 250 -and $p.G -gt 250 -and $p.B -gt 250) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $bmp.Dispose()
    Write-Host "$path -> X: $minX, Y: $minY, Width: $($maxX - $minX), Height: $($maxY - $minY)"
}

FindQrBox "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\public\images\ticket-standard-bg.png" 0 400
FindQrBox "C:\Users\FLUXi\.gemini\antigravity\scratch\pubg-ethiopia\public\images\ticket-vip-bg.png" 400 0
