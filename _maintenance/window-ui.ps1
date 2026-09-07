param(
  [ValidateSet("shot", "click", "show", "hide")][string]$Do = "shot",
  [string]$Out = "shot.png",
  [int]$X = 0,
  [int]$Y = 0
)

Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class U {
  public delegate bool Enum(IntPtr h, IntPtr p);
  [DllImport("user32.dll")] public static extern bool EnumWindows(Enum cb, IntPtr p);
  [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr h, Enum cb, IntPtr p);
  [DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint f);
  [DllImport("user32.dll")] public static extern IntPtr PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  public struct R { public int L, T, Rt, B; }
}
"@

function Get-WebViewChild([IntPtr]$parent) {
  $script:found = [IntPtr]::Zero
  $cb = [U+Enum] {
    param($h, $l)
    $sb = New-Object System.Text.StringBuilder 256
    [void][U]::GetClassName($h, $sb, 256)
    if ($sb.ToString() -eq "Chrome_RenderWidgetHostHWND") { $script:found = $h; return $false }
    return $true
  }
  [void][U]::EnumChildWindows($parent, $cb, [IntPtr]::Zero)
  return $script:found
}

# Окно приложения ищем по классу "Tauri Window": MainWindowHandle не годится —
# при сворачивании в трей он уезжает на служебное окно single-instance.
$pids = @(Get-Process desktop -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
if ($pids.Count -eq 0) { Write-Output "NO_PROCESS"; exit 1 }

$script:app = [IntPtr]::Zero
$cbTop = [U+Enum] {
  param($h, $l)
  $wpid = 0
  [void][U]::GetWindowThreadProcessId($h, [ref]$wpid)
  if ($pids -contains [int]$wpid) {
    $sb = New-Object System.Text.StringBuilder 256
    [void][U]::GetClassName($h, $sb, 256)
    if ($sb.ToString() -eq "Tauri Window") { $script:app = $h; return $false }
  }
  return $true
}
[void][U]::EnumWindows($cbTop, [IntPtr]::Zero)
$app = $script:app
if ($app -eq [IntPtr]::Zero) { Write-Output "NO_APP_WINDOW"; exit 1 }

if ($Do -eq "show") {
  [void][U]::ShowWindow($app, 5)
  [void][U]::ShowWindow($app, 9)
  Start-Sleep -Milliseconds 900
}
if ($Do -eq "hide") { [void][U]::ShowWindow($app, 0); Write-Output "hidden"; exit 0 }

$wr = New-Object U+R; [void][U]::GetWindowRect($app, [ref]$wr)
$w = $wr.Rt - $wr.L; $ht = $wr.B - $wr.T

if ($Do -eq "click") {
  $child = Get-WebViewChild $app
  $cr = New-Object U+R; [void][U]::GetWindowRect($child, [ref]$cr)
  $cx = $X - ($cr.L - $wr.L)
  $cy = $Y - ($cr.T - $wr.T)
  $lp = [IntPtr](($cy -shl 16) -bor ($cx -band 0xFFFF))
  [void][U]::PostMessage($child, 0x0200, [IntPtr]::Zero, $lp)
  Start-Sleep -Milliseconds 120
  [void][U]::PostMessage($child, 0x0201, [IntPtr]1, $lp)
  Start-Sleep -Milliseconds 60
  [void][U]::PostMessage($child, 0x0202, [IntPtr]::Zero, $lp)
  Write-Output "CLICK $cx,$cy"
  exit 0
}

Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $w, $ht
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
$ok = [U]::PrintWindow($app, $hdc, 2)
$g.ReleaseHdc($hdc)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "$(if($ok){'OK'}else{'FAIL'}) $w x $ht visible=$([U]::IsWindowVisible($app)) -> $Out"
