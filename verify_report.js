const fs = require("fs");
const path = require("path");

// Helper to find the latest markdown file in reports/
function getLatestReport(dir) {
  if (!fs.existsSync(dir)) return null;
  let latestFile = null;
  let latestMtime = 0;

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith(".md")) {
        if (stat.mtimeMs > latestMtime) {
          latestMtime = stat.mtimeMs;
          latestFile = fullPath;
        }
      }
    }
  }

  traverse(dir);
  return latestFile;
}

const reportsDir = path.join(__dirname, "reports");
const defaultPath = getLatestReport(reportsDir) || path.join(reportsDir, "2026_06", "daily_2026_06_24.md");
const filePath = process.argv[2] || defaultPath;

console.log(`Auditing report file: ${filePath}`);

if (!fs.existsSync(filePath)) {
  console.error(`Fail: Report file does not exist at ${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, "utf-8");

// 1. Check title & subtitle
const titleRegex = /^# Bản tin GitHub Trending (ngày \d{2}\/\d{2}\/\d{4}|Tuần \d{2}\/\d{4}|Tháng \d{2}\/\d{4})/i;
if (!titleRegex.test(content)) {
  console.error("Fail: Title format is incorrect or missing. Expected: '# Bản tin GitHub Trending [ngày DD/MM/YYYY | Tuần WW/YYYY | Tháng MM/YYYY]'.");
  process.exit(1);
}
if (!content.includes("*Thời gian cập nhật:")) {
  console.error("Fail: Subtitle (timestamp) is incorrect or missing. Expected '*Thời gian cập nhật: ...*'.");
  process.exit(1);
}

// 2. Check table width percentages
const widths = ["5%", "10%", "20%", "35%", "30%"];
widths.forEach(width => {
  if (!content.includes(`width="${width}"`)) {
    console.error(`Fail: Column width ${width} is missing.`);
    process.exit(1);
  }
});

// 3. HTML tags matching check for core elements
const tags = ["strong", "a", "small", "td", "tr", "tbody", "table"];
tags.forEach(tag => {
  const openCount = (content.match(new RegExp(`<${tag}[^>]*>`, "g")) || []).length;
  const closeCount = (content.match(new RegExp(`</${tag}>`, "g")) || []).length;
  if (openCount !== closeCount) {
    console.warn(`Warning: Mismatched tag count for <${tag}>: Open=${openCount}, Close=${closeCount}`);
  }
});

// 4. Row parsing
const rows = [];
const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
let match;
while ((match = rowRegex.exec(content)) !== null) {
  const rowContent = match[1];
  if (rowContent.includes("<th")) continue; // Skip header
  rows.push(rowContent);
}

console.log(`Found ${rows.length} rows in the table.`);

// We only enforce 25 rows for daily reports
const isDaily = path.basename(filePath).startsWith("daily_");
if (isDaily && rows.length !== 25) {
  console.error(`Fail: Expected exactly 25 rows for daily report, found ${rows.length}.`);
  process.exit(1);
} else if (rows.length === 0) {
  console.error("Fail: No table rows found.");
  process.exit(1);
}

// 5. Verify each row
rows.forEach((row, index) => {
  const rank = index + 1;
  
  // Verify rank index (allows flexible td markup)
  const rankPattern = new RegExp(`<td[^>]*>${rank}</td>`);
  if (!rankPattern.test(row)) {
    console.error(`Fail Row ${rank}: Mismatched rank column.`);
    process.exit(1);
  }

  // Split row into columns
  const colContents = [];
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
  let colMatch;
  while ((colMatch = tdRegex.exec("<tr>" + row + "</tr>")) !== null) {
    colContents.push(colMatch[1].trim());
  }

  if (colContents.length !== 5) {
    console.error(`Fail Row ${rank}: Expected 5 columns, got ${colContents.length}.`);
    console.error(colContents);
    process.exit(1);
  }

  const [colRank, colProject, colHook, colMetaphor, colFeatures] = colContents;

  // Verify Project Column
  if (!colProject.includes("<strong><a href=")) {
    console.error(`Fail Row ${rank}: Project column link is incorrect.`);
    process.exit(1);
  }
  if (!colProject.includes("<small>")) {
    console.error(`Fail Row ${rank}: Project language small tag is missing.`);
    process.exit(1);
  }

  // Verify Hook Pattern
  const hookRegex = /^<strong>(Muốn|Cần) (.*?)<\/strong> nhưng <strong>(ngại|ngán|sợ|lo ngại|lo sợ|e ngại) (.*?)<\/strong>\.$/;
  if (!hookRegex.test(colHook)) {
    console.error(`Fail Row ${rank}: Hook does not follow "Muốn/Cần... nhưng ngại/sợ/lo ngại..." strictly.`);
    console.error(`Hook: "${colHook}"`);
    process.exit(1);
  }

  // Verify Metaphor Pattern
  const metaphorRegex = /^<strong>(.*?)<\/strong> - (.*?)<br><strong>CƠ CHẾ KỸ THUẬT<\/strong>: (.*?)$/;
  if (!metaphorRegex.test(colMetaphor)) {
    console.error(`Fail Row ${rank}: Metaphor column is formatted incorrectly.`);
    console.error(`Metaphor: "${colMetaphor}"`);
    process.exit(1);
  }

  // Verify Emojis in Features
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  if (emojiRegex.test(colFeatures)) {
    console.error(`Fail Row ${rank}: Features contain emojis!`);
    console.error(`Features: "${colFeatures}"`);
    process.exit(1);
  }
  if (colFeatures.includes("•")) {
    const lines = colFeatures.split("<br>").map(l => l.trim());
    lines.forEach(line => {
      if (line && !line.startsWith("• ")) {
        console.error(`Fail Row ${rank}: Feature line does not start with black bullet '• '.`);
        console.error(`Line: "${line}"`);
        process.exit(1);
      }
    });
  } else {
    console.error(`Fail Row ${rank}: Features do not contain bullets.`);
    process.exit(1);
  }
});

console.log("All validation checks passed successfully! ✅");
