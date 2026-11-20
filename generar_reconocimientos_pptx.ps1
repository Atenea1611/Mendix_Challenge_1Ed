<#
.SYNOPSIS
    Generador Automático de Reconocimientos PowerPoint (.pptx) para el Mendix Agile Challenge.
    Universidad Tecmilenio & Siemens Mendix.

.DESCRIPTION
    Toma la plantilla oficial editable 'Reconocimientos_Mendix_Editables.pptx', extrae los datos
    de los participantes, jueces y ganadores, y genera archivos .pptx personalizados individuales
    con los nombres, campus, integrantes y fechas en la carpeta 'reconocimientos_generados/'.
    Inserta los logos: Universidad_Tecmilenio, LogoMendixChallenge_1_Edition y Siemens-Logo.wine
    en cada slide, y las medallas correspondientes en slides de ganadores.
#>

param(
    [string]$TemplatePath = "$PSScriptRoot\Reconocimientos_Mendix_Editables.pptx",
    [string]$OutputDir    = "$PSScriptRoot\reconocimientos_generados",
    [string]$FechaExpedicion = "20 de noviembre de 2026"
)

# --- Rutas absolutas de logos y medallas ---
$LogoTec      = "$PSScriptRoot\Universidad_Tecmilenio.png"
$LogoMendix   = "$PSScriptRoot\LogoMendixChallenge_1_Edition.png"
$LogoSiemens  = "$PSScriptRoot\Siemens-Logo.wine.png"
$Medalla1     = "$PSScriptRoot\Medalla_1.png"
$Medalla2     = "$PSScriptRoot\Medalla_2.png"
$Medalla3     = "$PSScriptRoot\Medalla_3.png"

# Cargo oficial del firmante
$CargoJoaquin = "Academic & Strategic Alliances Manager SIEMENS"

if (!(Test-Path $TemplatePath)) {
    Write-Error "No se encontro el archivo de plantilla: $TemplatePath"
    exit 1
}

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  MENDIX AGILE CHALLENGE - GENERADOR DE RECONOCIMIENTOS PPTX" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Green

# =============================================================================
# Función principal: genera un PPTX usando PowerPoint COM, inserta logos/medalla
# =============================================================================
function Export-PptxCertificadoCOM {
    param(
        [int]$SlideNum,
        [hashtable]$Replacements,
        [string]$OutputFilename,
        [string]$MedallaPath = ""   # solo para slides de ganadores
    )

    $destPath = Join-Path $OutputDir $OutputFilename

    # Abrir PowerPoint COM
    $pptApp = New-Object -ComObject PowerPoint.Application
    $pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

    try {
        $pres = $pptApp.Presentations.Open($TemplatePath, $false, $false, $true)

        # Seleccionar slide
        $slide = $pres.Slides($SlideNum)

        # ---- 1. Reemplazar texto en marcadores ----
        foreach ($shape in $slide.Shapes) {
            if ($shape.HasTextFrame) {
                foreach ($para in $shape.TextFrame.TextRange.Paragraphs()) {
                    $txt = $para.Text
                    foreach ($key in $Replacements.Keys) {
                        if ($txt -like "*$key*") {
                            # Reemplazar preservando formato del primer run
                            $newTxt = $txt.Replace($key, $Replacements[$key])
                            $para.Text = $newTxt
                            break
                        }
                    }
                }
            }
        }

        # ---- 2. Insertar logos en posición fija ----
        # Coordenadas en puntos (PowerPoint usa puntos; 72pt = 1 pulgada)
        # Logo Universidad Tecmilenio – esquina superior izquierda
        if (Test-Path $LogoTec) {
            $sh = $slide.Shapes.AddPicture($LogoTec, $false, $true, 20, 12, 160, 55)
            $sh.Name = "Logo_Tec"
        }

        # Logo Mendix Challenge – centro superior
        if (Test-Path $LogoMendix) {
            $slideW = $pres.PageSetup.SlideWidth
            $logoW  = 110
            $leftPos = ($slideW - $logoW) / 2
            $sh = $slide.Shapes.AddPicture($LogoMendix, $false, $true, $leftPos, 10, $logoW, 65)
            $sh.Name = "Logo_Mendix"
        }

        # Logo Siemens – esquina superior derecha
        if (Test-Path $LogoSiemens) {
            $slideW = $pres.PageSetup.SlideWidth
            $sh = $slide.Shapes.AddPicture($LogoSiemens, $false, $true, ($slideW - 145), 15, 125, 48)
            $sh.Name = "Logo_Siemens"
        }

        # ---- 3. Insertar medalla si corresponde ----
        if ($MedallaPath -ne "" -and (Test-Path $MedallaPath)) {
            $slideW = $pres.PageSetup.SlideWidth
            $slideH = $pres.PageSetup.SlideHeight
            $medW   = 90
            $medH   = 90
            $leftM  = ($slideW - $medW) / 2
            $topM   = $slideH * 0.18   # ~18% desde arriba (zona central-alta)
            $sh = $slide.Shapes.AddPicture($MedallaPath, $false, $true, $leftM, $topM, $medW, $medH)
            $sh.Name = "Medalla"
        }

        # ---- 4. Exportar solo el slide seleccionado a un nuevo PPTX ----
        # Copiar el slide a una presentación temporal
        $newPres = $pptApp.Presentations.Add($true)
        $newPres.PageSetup.SlideWidth  = $pres.PageSetup.SlideWidth
        $newPres.PageSetup.SlideHeight = $pres.PageSetup.SlideHeight

        $slide.Copy()
        $newPres.Slides.Paste() | Out-Null

        # Eliminar el slide en blanco inicial que crea Presentations.Add
        if ($newPres.Slides.Count -gt 1) {
            $newPres.Slides(1).Delete()
        }

        if (Test-Path $destPath) { Remove-Item $destPath -Force }
        $newPres.SaveAs($destPath, 24)   # 24 = ppSaveAsOpenXMLPresentation
        $newPres.Close()

        $pres.Close()
        Write-Host " [OK] Generado: $OutputFilename" -ForegroundColor Green

    } catch {
        Write-Host " [ERROR] $OutputFilename : $_" -ForegroundColor Red
        try { $pres.Close() } catch {}
    } finally {
        $pptApp.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($pptApp) | Out-Null
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        Start-Sleep -Seconds 2
    }
}

# =============================================================================
# 1. PARTICIPANTES (Slide 1)
# =============================================================================
Write-Host "`nGenerando reconocimientos de Participacion por Equipo..." -ForegroundColor Yellow
$equipos = @(
    @{ TeamName = "Innovatech GCS";          Campus = "Campus Las Torres";    M1 = "Ana Sofia Garza Morales";      M2 = "Mateo Rincon Salazar";       M3 = "Valeria Cruz Pena";       M4 = "Daniel Ortiz Luna" },
    @{ TeamName = "AgileFlow Monterrey";     Campus = "Campus Cumbres";       M1 = "Rodrigo Morales Cano";         M2 = "Camila Pardo Benitez";       M3 = "Samuel Leon Castillo";    M4 = "" },
    @{ TeamName = "CDMX Nexus Eventos";      Campus = "Campus Ferreria";      M1 = "Lucia Fernandez Rios";         M2 = "Esteban Dominguez Soto";     M3 = "Mariana Reyes Vega";      M4 = "" },
    @{ TeamName = "Puebla Event Agile";      Campus = "Campus Puebla";        M1 = "Jorge Benitez Lara";           M2 = "David Sanchez Ruiz";         M3 = "Lorena Meza Toledo";      M4 = "" },
    @{ TeamName = "Occidente Mendix Crew";   Campus = "Campus Guadalajara";   M1 = "Fabiola Rios Cardenas";        M2 = "Hector Carranza Lozano";     M3 = "";                        M4 = "" },
    @{ TeamName = "Toluca Sprint Builders";  Campus = "Campus Toluca";        M1 = "Oscar Valenzuela Mora";        M2 = "Andrea Cuevas Solis";        M3 = "";                        M4 = "" }
)

foreach ($eq in $equipos) {
    $rep = @{
        "[Nombre del equipo]"       = $eq.TeamName
        "[Nombre completo 1]"       = $eq.M1
        "[Nombre completo 2]"       = $eq.M2
        "[Nombre completo 3]"       = $eq.M3
        "[Nombre completo 4]"       = $eq.M4
        "[Nombre del campus]"       = $eq.Campus
        "[dia] de [mes] de [ano]"   = $FechaExpedicion
        "[Cargo institucional]"     = $CargoJoaquin
    }
    $cleanName = $eq.TeamName -replace '[\\/:*?"<>| ]', '_'
    Export-PptxCertificadoCOM -SlideNum 1 -Replacements $rep -OutputFilename "Reconocimiento_Participacion_$cleanName.pptx"
}

# =============================================================================
# 2. GANADORES NACIONALES (Slides 2, 3, 4)
# =============================================================================
Write-Host "`nGenerando reconocimientos de Ganadores Nacionales..." -ForegroundColor Yellow

# 1er Lugar
Export-PptxCertificadoCOM -SlideNum 2 -MedallaPath $Medalla1 -OutputFilename "Reconocimiento_1erLugar_AgileFlow_Monterrey.pptx" -Replacements @{
    "[Nombre del equipo]"       = "AgileFlow Monterrey"
    "[Nombre completo 1]"       = "Rodrigo Morales Cano"
    "[Nombre completo 2]"       = "Camila Pardo Benitez"
    "[Nombre completo 3]"       = "Samuel Leon Castillo"
    "[Nombre completo 4]"       = ""
    "[Nombre del campus]"       = "Campus Cumbres"
    "[dia] de [mes] de [ano]"   = $FechaExpedicion
    "[Cargo institucional]"     = $CargoJoaquin
}

# 2do Lugar
Export-PptxCertificadoCOM -SlideNum 3 -MedallaPath $Medalla2 -OutputFilename "Reconocimiento_2doLugar_Innovatech_GCS.pptx" -Replacements @{
    "[Nombre del equipo]"       = "Innovatech GCS"
    "[Nombre completo 1]"       = "Ana Sofia Garza Morales"
    "[Nombre completo 2]"       = "Mateo Rincon Salazar"
    "[Nombre completo 3]"       = "Valeria Cruz Pena"
    "[Nombre completo 4]"       = "Daniel Ortiz Luna"
    "[Nombre del campus]"       = "Campus Las Torres"
    "[dia] de [mes] de [ano]"   = $FechaExpedicion
    "[Cargo institucional]"     = $CargoJoaquin
}

# 3er Lugar
Export-PptxCertificadoCOM -SlideNum 4 -MedallaPath $Medalla3 -OutputFilename "Reconocimiento_3erLugar_CDMX_Nexus_Eventos.pptx" -Replacements @{
    "[Nombre del equipo]"       = "CDMX Nexus Eventos"
    "[Nombre completo 1]"       = "Lucia Fernandez Rios"
    "[Nombre completo 2]"       = "Esteban Dominguez Soto"
    "[Nombre completo 3]"       = "Mariana Reyes Vega"
    "[Nombre completo 4]"       = ""
    "[Nombre del campus]"       = "Campus Ferreria"
    "[dia] de [mes] de [ano]"   = $FechaExpedicion
    "[Cargo institucional]"     = $CargoJoaquin
}

# =============================================================================
# 3. JUECES EVALUADORES (Slide 5)
# =============================================================================
Write-Host "`nGenerando reconocimientos a Jueces Evaluadores..." -ForegroundColor Yellow
$jueces = @(
    @{ Name = "Dr. Roberto Garcia Trevino";   Campus = "Campus Las Torres" },
    @{ Name = "Mtra. Laura Sanchez Morales";  Campus = "Campus Ferreria" },
    @{ Name = "Ing. Carlos Navarro Ruiz";     Campus = "Campus Guadalajara" }
)

foreach ($j in $jueces) {
    $repJ = @{
        "[Nombre de la persona reconocida]" = $j.Name
        "[Institucion o adscripcion]"       = "Universidad Tecmilenio - $($j.Campus)"
        "[dia] de [mes] de [ano]"           = $FechaExpedicion
        "[Cargo institucional]"             = $CargoJoaquin
    }
    $cleanName = $j.Name -replace '[\\/:*?"<>| ]', '_'
    Export-PptxCertificadoCOM -SlideNum 5 -Replacements $repJ -OutputFilename "Reconocimiento_Juez_$cleanName.pptx"
}

Write-Host "`nProceso completado. Archivos en: $OutputDir" -ForegroundColor Green
