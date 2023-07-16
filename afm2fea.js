const fs = require("fs");
const readline = require("readline");

if (process.argv.length !== 4) {
  console.error("Usage: node script.js inputFilePath outputFilePath");
  process.exit(1);
}

const inputFilePath = process.argv[2]; // Input file path from command-line argument
const outputFilePath = process.argv[3]; // Output file path from command-line argument

const rl = readline.createInterface({
  input: fs.createReadStream(inputFilePath),
  output: process.stdout,
  terminal: false,
});

let isKernData = false;
let kerningPairs = [];

// http://adobe-type-tools.github.io/afdko/OpenTypeFeatureFileSpecification.html#2c-keywords
const feaKeywords = new Set([
  "anchor",
  "anchorDef",
  "anon",
  "anonymous",
  "by",
  "contourpoint",
  "cursive",
  "device ",
  "enum",
  "enumerate",
  "exclude_dflt",
  "feature ",
  "from",
  "ignore ",
  "IgnoreBaseGlyphs",
  "IgnoreLigatures",
  "IgnoreMarks",
  "include",
  "include_dflt",
  "language",
  "languagesystem",
  "lookup",
  "lookupflag",
  "mark ",
  "MarkAttachmentType",
  "markClass",
  "nameid",
  "NULL ",
  "parameters",
  "pos",
  "position",
  "required ",
  "reversesub",
  "RightToLeft",
  "rsub",
  "script",
  "sub",
  "substitute",
  "subtable",
  "table",
  "useExtension",
  "UseMarkFilteringSet",
  "valueRecordDef",
  "excludeDFLT", // deprecated
  "includeDFLT", // deprecated
]);

function escapeFeaKeyword(keyword) {
  if (feaKeywords.has(keyword)) {
    return `\${keyword}`;
  } else {
    return keyword;
  }
}

rl.on("line", (line) => {
  if (line.startsWith("EndKernPairs")) {
    isKernData = false;
  }

  if (isKernData) {
    const parts = line.split(";")[0].split(" ");
    const type = parts[0];

    switch (type) {
      case "KP":
        const kpValue = parts[3] + " " + parts[4];
        kerningPairs.push({
          char1: parts[1],
          char2: parts[2],
          value: `<${kpValue}>`,
        });
        break;

      case "KPH":
        const kphValue = parts[3] + " " + parts[4];
        kerningPairs.push({
          char1: `<${parts[1]}>`,
          char2: `<${parts[2]}>`,
          value: `<${kphValue}>`,
        });
        break;

      case "KPX":
        kerningPairs.push({
          char1: parts[1],
          char2: parts[2],
          value: parts[3],
        });
        break;

      case "KPY":
        const kpyValue = parts[3];
        kerningPairs.push({
          char1: parts[1],
          char2: parts[2],
          value: `<0 ${kpyValue}>`,
        });
        break;
    }
  }

  if (line.startsWith("StartKernPairs")) {
    isKernData = true;
  }
});

rl.on("close", () => {
  // Sort kerning pairs by first character
  kerningPairs.sort((a, b) => a.char1.localeCompare(b.char1));

  // Generate kerning feature
  let kernFeature = `
# Script and language coverage
languagesystem DFLT dflt;
languagesystem latn dflt;

# Kerning feature
feature kern {\n`;
  for (const { char1, char2, value } of kerningPairs) {
    kernFeature += `  pos ${escapeFeaKeyword(char1)} ${escapeFeaKeyword(
      char2
    )} ${value};\n`;
  }
  kernFeature += "} kern;\n";

  fs.writeFile(outputFilePath, kernFeature, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log(`Kerning feature data written to ${outputFilePath}`);
    }
  });
});
