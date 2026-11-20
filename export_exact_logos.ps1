$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open('C:\Users\L03563109\Desktop\MendixChallenge\Reconocimientos_Mendix_Editables.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$slide = $pres.Slides.Item(1)

$outDir = 'C:\Users\L03563109\Desktop\MendixChallenge\cert_assets\exact_logos'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

for ($i = 1; $i -le $slide.Shapes.Count; $i++) {
    $s = $slide.Shapes.Item($i)
    if ($s.Type -eq 13) { # Picture
        $outPath = Join-Path $outDir ("$($s.Name).png")
        $s.Export($outPath, [Microsoft.Office.Core.PpShapeFormat]::ppShapeFormatPNG)
        Write-Host "Exported $($s.Name) to $outPath"
    }
}

# Also export medal from slide 2
$slide2 = $pres.Slides.Item(2)
for ($i = 1; $i -le $slide2.Shapes.Count; $i++) {
    $s = $slide2.Shapes.Item($i)
    if ($s.Name -eq "Picture 18") {
        $outPath = Join-Path $outDir "Medal_1st.png"
        $s.Export($outPath, [Microsoft.Office.Core.PpShapeFormat]::ppShapeFormatPNG)
        Write-Host "Exported Medal_1st to $outPath"
    }
}

# Slide 3 medal
$slide3 = $pres.Slides.Item(3)
for ($i = 1; $i -le $slide3.Shapes.Count; $i++) {
    $s = $slide3.Shapes.Item($i)
    if ($s.Name -eq "Picture 18") {
        $outPath = Join-Path $outDir "Medal_2nd.png"
        $s.Export($outPath, [Microsoft.Office.Core.PpShapeFormat]::ppShapeFormatPNG)
        Write-Host "Exported Medal_2nd to $outPath"
    }
}

# Slide 4 medal
$slide4 = $pres.Slides.Item(4)
for ($i = 1; $i -le $slide4.Shapes.Count; $i++) {
    $s = $slide4.Shapes.Item($i)
    if ($s.Name -eq "Picture 18") {
        $outPath = Join-Path $outDir "Medal_3rd.png"
        $s.Export($outPath, [Microsoft.Office.Core.PpShapeFormat]::ppShapeFormatPNG)
        Write-Host "Exported Medal_3rd to $outPath"
    }
}

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

