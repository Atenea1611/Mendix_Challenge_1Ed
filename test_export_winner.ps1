$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open('C:\Users\L03563109\Desktop\MendixChallenge\reconocimientos_generados\Reconocimiento_1erLugar_AgileFlow_Monterrey.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$slide = $pres.Slides.Item(2)
$testOut = 'C:\Users\L03563109\Desktop\MendixChallenge\cert_assets\test_winner1.png'
$slide.Export($testOut, "PNG", 1584, 1224)
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "Exported to ${testOut}: $(Test-Path $testOut)"
