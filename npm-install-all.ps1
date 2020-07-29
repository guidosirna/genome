$dirs = @("cli", "web")

$commonDirs = Get-ChildItem (join-path $PSScriptRoot "common") | ?{ $_.PSIsContainer }

foreach ($d in $commonDirs) {
    if ( Test-Path ($d.FullName + "\package.json") ) {
        $dirs+= "common\" + $d.Name
    }
}

foreach($dir in $dirs) {
    cd $PSScriptRoot
    Write-Host "========================================="
    Write-Host "npm install " + $dir
    $p = join-path $PSScriptRoot $dir
    cd $p
    npm install --msvs_version=2012
}
cd $PSScriptRoot