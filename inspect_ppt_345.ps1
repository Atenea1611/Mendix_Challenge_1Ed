$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open('C:\Users\L03563109\Desktop\MendixChallenge\Reconocimientos_Mendix_Editables.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)

3..5 | ForEach-Object {
    $slideNum = $_
    $slide = $pres.Slides.Item($slideNum)
    Write-Host "`n========================================================"
    Write-Host "SLIDE $slideNum DETAILS"
    Write-Host "========================================================"
    for ($i = 1; $i -le $slide.Shapes.Count; $i++) {
        $s = $slide.Shapes.Item($i)
        if ($s.HasTextFrame -and $s.TextFrame.HasText) {
            for ($p = 1; $p -le $s.TextFrame.TextRange.Paragraphs().Count; $p++) {
                $para = $s.TextFrame.TextRange.Paragraphs($p)
                $cleanTxt = $para.Text.Trim().Replace("`r", "").Replace("`n", "")
                if ($cleanTxt) {
                    $rgb = $para.Font.Color.RGB
                    $r = $rgb -band 0xFF
                    $g = ($rgb -shr 8) -band 0xFF
                    $b = ($rgb -shr 16) -band 0xFF
                    $hexColor = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
                    Write-Host "$($s.Name) (L=$([math]::Round($s.Left,1)), T=$([math]::Round($s.Top,1))): '$cleanTxt' | Color=$hexColor, Size=$($para.Font.Size)pt, Bold=$($para.Font.Bold)"
                }
            }
        } elseif ($s.Type -eq 13) {
            Write-Host "$($s.Name) [IMAGE] L=$([math]::Round($s.Left,1)), T=$([math]::Round($s.Top,1)), W=$([math]::Round($s.Width,1)), H=$([math]::Round($s.Height,1))"
        }
    }
}

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

