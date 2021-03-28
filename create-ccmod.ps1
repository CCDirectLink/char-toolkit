$modname = "char-toolkit"
$compress = @{
    Path = "./src/*"
    Force = $true
    DestinationPath =  $modname + ".zip"
}

Compress-Archive @compress


$CcmodFileName = $modname + ".ccmod"
if (Test-Path $CcmodFileName) 
{
  Remove-Item $CcmodFileName
}

Rename-Item -Path ($modname + ".zip") -NewName $CcmodFileName