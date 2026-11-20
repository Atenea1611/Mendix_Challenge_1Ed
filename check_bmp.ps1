Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('C:\Users\L03563109\Desktop\MendixChallenge\cert_assets\exact_slides\slide_1.png')
Write-Host "Width=$($bmp.Width), Height=$($bmp.Height)"
Write-Host "Corner 0,0 Color: $($bmp.GetPixel(0,0))"
Write-Host "Center Color: $($bmp.GetPixel([int]($bmp.Width/2), [int]($bmp.Height/2)))"
$bmp.Dispose()

