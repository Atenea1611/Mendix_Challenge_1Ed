$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
$pres = $ppt.Presentations.Open('C:\Users\L03563109\Desktop\MendixChallenge\Reconocimientos_Mendix_Editables.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$outDir = 'C:\Users\L03563109\Desktop\MendixChallenge\cert_assets\exact_slides'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $slide = $pres.Slides.Item($i)
    $exportPath = Join-Path $outDir ("slide_$i.png")
    $slide.Export($exportPath, "PNG", 1920, 1080)
    Write-Host "Exported Slide $i to $exportPath"
}
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

