const fs = require('fs');
const path = require('path');

const INPUT_DIR = './raw_examples';
const OUTPUT_FILE = './context/examples.json';

const examples = [];

fs.readdirSync(INPUT_DIR).forEach((file) => {
  const filePath = path.join(INPUT_DIR, file);
  if (file.endsWith('.json')) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const nameWithoutExt = path.basename(file, '.json');
      const formattedName = nameWithoutExt.replace(/[_\-]/g, ' ');
      const prompt = `Create a dashboard layout for ${formattedName}`;
      examples.push({ prompt, schema: raw });
    } catch (e) {
      console.error(`❌ Failed on ${file}: ${e.message}`);
    }
  }
});

if (!fs.existsSync('./context')) fs.mkdirSync('./context');

fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ examples }, null, 2));
console.log(`✅ Converted ${examples.length} files to context/examples.json`);
