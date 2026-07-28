param(
  [Parameter(Mandatory = $true)]
  [string]$BackgroundPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$background = [System.Drawing.Image]::FromFile($BackgroundPath)
$canvas = New-Object System.Drawing.Bitmap $width, $height
$canvas.SetResolution(96, 96)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$sourceAspect = $background.Width / $background.Height
$targetAspect = $width / $height
if ($sourceAspect -gt $targetAspect) {
  $sourceHeight = $background.Height
  $sourceWidth = [int]($sourceHeight * $targetAspect)
  $sourceX = [int](($background.Width - $sourceWidth) / 2)
  $sourceY = 0
} else {
  $sourceWidth = $background.Width
  $sourceHeight = [int]($sourceWidth / $targetAspect)
  $sourceX = 0
  $sourceY = [int](($background.Height - $sourceHeight) / 2)
}

$graphics.DrawImage(
  $background,
  (New-Object System.Drawing.Rectangle 0, 0, $width, $height),
  (New-Object System.Drawing.Rectangle $sourceX, $sourceY, $sourceWidth, $sourceHeight),
  [System.Drawing.GraphicsUnit]::Pixel
)

$overlay = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle 0, 0, 760, $height),
  [System.Drawing.Color]::FromArgb(245, 15, 14, 13),
  [System.Drawing.Color]::FromArgb(25, 15, 14, 13),
  [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
)
$graphics.FillRectangle($overlay, 0, 0, 780, $height)

$logo = [System.Drawing.Image]::FromFile(
  (Join-Path (Split-Path $OutputPath -Parent) "pogny-logo.png")
)
$logoWidth = 248
$logoHeight = [int]($logo.Height * ($logoWidth / $logo.Width))
$graphics.DrawImage($logo, 72, 62, $logoWidth, $logoHeight)

$fontCollection = New-Object System.Drawing.Text.PrivateFontCollection
$fontCollection.AddFontFile("C:\Windows\Fonts\NotoSansKR-VF.ttf")
$fontFamily = $fontCollection.Families[0]
$headlineFont = New-Object System.Drawing.Font $fontFamily, 38, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$bodyFont = New-Object System.Drawing.Font $fontFamily, 20, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$labelFont = New-Object System.Drawing.Font $fontFamily, 15, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)

$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 246, 241))
$softWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 233, 228, 219))
$gold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(213, 174, 118))

$decode = {
  param([string]$Value)
  [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($Value))
}
$brandName = & $decode "7Y+s6re464uI7ZWE66aE"
$brandTitle = & $decode "7ZSE66as66+47JeEIOuLqOyXtO2VhOumhCDsoITrrLgg67iM656c65Oc"
$benefitLine = & $decode "7Je07LCo64uoIMK3IOyekOyZuOyEoCDssKjri6ggwrcg64iI67aA7IusIOyZhO2ZlA=="
$serviceLine = & $decode "7KO86rCEIOyCrOyDne2ZnCDrs7TtmLggwrcg7KCE66y4IOyLnOqztSDCtyDtkojsp4jrs7Tspp0="

$graphics.DrawString("PREMIUM WINDOW FILM", $labelFont, $gold, 74, 178)
$graphics.DrawString($brandName, $headlineFont, $white, 70, 220)
$graphics.DrawString($brandTitle, $headlineFont, $white, 70, 273)
$graphics.FillRectangle($gold, 74, 344, 52, 3)
$graphics.DrawString($benefitLine, $bodyFont, $softWhite, 72, 377)
$graphics.DrawString($serviceLine, $bodyFont, $softWhite, 72, 416)
$graphics.DrawString("pogny.co.kr", $labelFont, $gold, 74, 516)

$canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$gold.Dispose()
$softWhite.Dispose()
$white.Dispose()
$labelFont.Dispose()
$bodyFont.Dispose()
$headlineFont.Dispose()
$fontCollection.Dispose()
$logo.Dispose()
$overlay.Dispose()
$graphics.Dispose()
$canvas.Dispose()
$background.Dispose()
