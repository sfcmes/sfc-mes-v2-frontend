param (
    [string]$Path = "."
)

function Get-DirectoryTree {
    param (
        [string]$Path
    )
    
    $tree = @{}
    $items = Get-ChildItem -Path $Path -Force
    
    foreach ($item in $items) {
        if ($item.PSIsContainer -and $item.Name -ne "node_modules") {
            $tree[$item.Name] = Get-DirectoryTree -Path $item.FullName
        } elseif (-not $item.PSIsContainer) {
            $tree[$item.Name] = $null
        }
    }
    
    return $tree
}

$projectTree = Get-DirectoryTree -Path (Resolve-Path $Path)
$projectTree | ConvertTo-Json -Depth 100
