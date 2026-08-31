const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");


/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const packagePath =
  "./package.json";


const updateSourceDirectory =
  path.resolve(
    "./out/make/squirrel.windows/x64"
  );


const updateServerDirectory =
  path.resolve(
    "./server/updates/win32/x64"
  );


/*
|--------------------------------------------------------------------------
| READ PACKAGE
|--------------------------------------------------------------------------
*/

const packageJson =
  JSON.parse(
    fs.readFileSync(
      packagePath,
      "utf8"
    )
  );


const oldVersion =
  packageJson.version;


/*
|--------------------------------------------------------------------------
| VERSION
|--------------------------------------------------------------------------
*/

const versionParts =
  oldVersion
    .split(".")
    .map(Number);


if (
  versionParts.length !== 3 ||
  versionParts.some(Number.isNaN)
) {

  console.error(
    `Invalid version number: ${oldVersion}`
  );

  process.exit(1);

}


versionParts[2]++;


const newVersion =
  versionParts.join(".");


packageJson.version =
  newVersion;


/*
|--------------------------------------------------------------------------
| SAVE PACKAGE.JSON
|--------------------------------------------------------------------------
*/

fs.writeFileSync(

  packagePath,

  JSON.stringify(
    packageJson,
    null,
    2
  ) + "\n"

);


console.log("");
console.log(
  `Version updated: ${oldVersion} → ${newVersion}`
);
console.log("");
console.log(
  "Publishing update..."
);
console.log("");


/*
|--------------------------------------------------------------------------
| PUBLISH
|--------------------------------------------------------------------------
*/

try {

  execSync(
    "npm run publish",
    {
      stdio: "inherit"
    }
  );

} catch {

  console.error("");
  console.error(
    "Publishing failed."
  );

  process.exit(1);

}


/*
|--------------------------------------------------------------------------
| VERIFY BUILD
|--------------------------------------------------------------------------
*/

if (
  !fs.existsSync(
    updateSourceDirectory
  )
) {

  console.error("");
  console.error(
    "ERROR: Squirrel update directory was not found:"
  );

  console.error(
    updateSourceDirectory
  );

  process.exit(1);

}


/*
|--------------------------------------------------------------------------
| CREATE UPDATE DIRECTORY
|--------------------------------------------------------------------------
*/

fs.mkdirSync(
  updateServerDirectory,
  {
    recursive: true
  }
);


/*
|--------------------------------------------------------------------------
| COPY UPDATE FILES
|--------------------------------------------------------------------------
*/

console.log("");
console.log(
  "Copying update files to warehouse update server..."
);
console.log("");


const files =
  fs.readdirSync(
    updateSourceDirectory
  );


let copiedFiles = 0;


for (
  const file of files
) {

  /*
   * RELEASES is required.
   *
   * .nupkg files contain the actual
   * Electron update.
   */

  if (
    file !== "RELEASES" &&
    !file.endsWith(".nupkg")
  ) {

    continue;

  }


  const source =
    path.join(
      updateSourceDirectory,
      file
    );


  const destination =
    path.join(
      updateServerDirectory,
      file
    );


  fs.copyFileSync(
    source,
    destination
  );


  console.log(
    `Copied: ${file}`
  );


  copiedFiles++;

}


/*
|--------------------------------------------------------------------------
| VERIFY UPDATE
|--------------------------------------------------------------------------
*/

const releasesPath =
  path.join(
    updateServerDirectory,
    "RELEASES"
  );


if (
  !fs.existsSync(
    releasesPath
  )
) {

  console.error("");
  console.error(
    "ERROR: RELEASES file was not copied."
  );

  process.exit(1);

}


if (
  copiedFiles < 2
) {

  console.error("");
  console.error(
    "ERROR: Expected RELEASES and at least one .nupkg file."
  );

  process.exit(1);

}


/*
|--------------------------------------------------------------------------
| DONE
|--------------------------------------------------------------------------
*/

console.log("");
console.log(
  "=========================================="
);
console.log(
  " Update Published Successfully"
);
console.log(
  "=========================================="
);
console.log("");
console.log(
  `Version: ${newVersion}`
);
console.log("");
console.log(
  "Warehouse update URL:"
);
console.log(
  "http://localhost:3000/updates/win32/x64"
);
console.log("");
console.log(
  "Warehouse computers will detect the update automatically."
);
console.log("");
