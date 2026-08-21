# Target directory path
$TargetDir = "C:\Users\Ops\Downloads\Wharehouse Inventory Code"
# Where the finished single text document will save
$OutputFile = Join-Path $TargetDir "Combined_Inventory_Code.txt"

# Clean up old export file if it exists so it doesn't read itself
if (Test-Path -Path $OutputFile) { Remove-Item -Path $OutputFile -Force }

# Allowed extensions list
$AllowedExtensions = @('.mjs', '.js', '.txt', '.jsx', '.json', '.html', '.css', '.ps1')

if (-not (Test-Path -Path $TargetDir)) {
    Write-Error "Directory does not exist at '$TargetDir'"
    Read-Host "Press Enter to exit"
    exit
}

Write-Output "Scanning folders and compiling code... please wait..."

# Clear/create the file fresh
"" | Out-File -FilePath $OutputFile -Encoding utf8

# Loop through all files across all folders
$Files = Get-ChildItem -Path $TargetDir -File -Recurse
foreach ($File in $Files) {
    if ($AllowedExtensions -contains $File.Extension.ToLower()) {
        
        # Append headers and text directly into the file
        Add-Content -Path $OutputFile -Value "________________________________________"
        Add-Content -Path $OutputFile -Value "--- FILE: $($File.Name) (Location: $($File.DirectoryName)) ---"
        
        # Read file text and dump it into our output tracker
        $Content = Get-Content -Path $File.FullName -Raw
        Add-Content -Path $OutputFile -Value $Content
        Add-Content -Path $OutputFile -Value "`n"
    }
}

Write-Output "Success! Everything is saved to:"
Write-Output $OutputFile
Read-Host "Press Enter to finish"
