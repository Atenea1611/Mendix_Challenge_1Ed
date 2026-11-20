$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open('C:\Users\L03563109\Desktop\MendixChallenge\Reconocimientos_Mendix_Editables.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)

Write-Host "PageSetup: SlideWidth=$($pres.PageSetup.SlideWidth), SlideHeight=$($pres.PageSetup.SlideHeight)"

1..2 | ForEach-Object {
    $slideNum = $_
    $slide = $pres.Slides.Item($slideNum)
    Write-Host "`n========================================================"
    Write-Host "SLIDE $slideNum DETAILS (Shapes count: $($slide.Shapes.Count))"
    Write-Host "========================================================"
    for ($i = 1; $i -le $slide.Shapes.Count; $i++) {
        $s = $slide.Shapes.Item($i)
        $fillRGB = ""
        try {
            if ($s.Fill.Visible) {
                $fillRGB = "FillRGB=$($s.Fill.ForeColor.RGB)"
            }
        } catch {}
        Write-Host "Shape ${i}: Name='$($s.Name)', Type=$($s.Type), L=$([math]::Round($s.Left,1)), T=$([math]::Round($s.Top,1)), W=$([math]::Round($s.Width,1)), H=$([math]::Round($s.Height,1)) $fillRGB"
        
        if ($s.HasTextFrame) {
            if ($s.TextFrame.HasText) {
                for ($p = 1; $p -le $s.TextFrame.TextRange.Paragraphs().Count; $p++) {
                    $para = $s.TextFrame.TextRange.Paragraphs($p)
                    $cleanTxt = $para.Text.Trim().Replace("`r", "").Replace("`n", "")
                    if ($cleanTxt) {
                        $rgb = $para.Font.Color.RGB
                        # Convert OLE RGB (BGR) to Hex #RRGGBB
                        $r = $rgb -band 0xFF
                        $g = ($rgb -shr 8) -band 0xFF
                        $b = ($rgb -shr 16) -band 0xFF
                        $hexColor = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b

                        Write-Host "   Para $p : '$cleanTxt'"
                        Write-Host "           Font=$($para.Font.Name), Size=$($para.Font.Size)pt, Bold=$($para.Font.Bold), Color=$hexColor, Align=$($para.ParagraphFormat.Alignment)"
                    }
                }
            }
        }
    }
}

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
