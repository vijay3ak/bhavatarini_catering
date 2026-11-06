import fs from 'fs';
import readline from 'readline';

const stream = fs.createReadStream('C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (line.includes('"step_index":3757')) {
    const data = JSON.parse(line);
    console.log('Thinking at step 3757:');
    console.log(data.thinking);
  }
});
