const fs = require("fs");
const { execSync } = require("child_process");

const packagePath = "./package.json";

const packageJson = JSON.parse(
  fs.readFileSync(packagePath, "utf8")
);

const oldVersion = packageJson.version;

const versionParts = oldVersion
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