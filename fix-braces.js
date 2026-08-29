import fs from 'fs';
let text = fs.readFileSync('src/lib/geminiService.ts', 'utf8');
text = text.replace(/  \}\n\n  \/\/ Fallback/g, "\n  // Fallback");
fs.writeFileSync('src/lib/geminiService.ts', text);
