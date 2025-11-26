// Script to sync asset filenames from static/index.html to templates/base.html
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticIndexPath = path.join(__dirname, "static", "index.html");
const baseTemplatePath = path.join(__dirname, "templates", "base.html");

// Read the built index.html
const staticIndex = fs.readFileSync(staticIndexPath, "utf8");

// Extract JS and CSS filenames using regex
const jsMatch = staticIndex.match(
  /src="\/themes\/Arcade\/static\/assets\/(main-[^"]+\.js)"/
);
const cssMatch = staticIndex.match(
  /href="\/themes\/Arcade\/static\/assets\/(main-[^"]+\.css)"/
);

if (!jsMatch || !cssMatch) {
  console.error("❌ Could not find asset filenames in static/index.html");
  process.exit(1);
}

const jsFile = jsMatch[1];
const cssFile = cssMatch[1];

console.log("📦 Found assets:");
console.log("  JS:", jsFile);
console.log("  CSS:", cssFile);

// Read the base template
let baseTemplate = fs.readFileSync(baseTemplatePath, "utf8");

// Replace the asset filenames
baseTemplate = baseTemplate.replace(
  /src="\/themes\/Arcade\/static\/assets\/main-[^"]+\.js"/,
  `src="/themes/Arcade/static/assets/${jsFile}"`
);

baseTemplate = baseTemplate.replace(
  /href="\/themes\/Arcade\/static\/assets\/main-[^"]+\.css"/,
  `href="/themes/Arcade/static/assets/${cssFile}"`
);

// Write back to base.html
fs.writeFileSync(baseTemplatePath, baseTemplate, "utf8");

console.log("✅ Updated templates/base.html with new asset filenames");
