const fs = require('fs');

const questionsFile = 'src/data/questions.json';
let questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'));

let updated = 0;

questions.forEach(q => {
  if (q.type === 'single' || q.type === 'multiple') {
    // Some options might have been parsed entirely into option "A" 
    // Example: q.options['A'] = "合规学习 B. 生成谣言 C. 辅助画画 D. 辅助写作"
    
    if (q.options && q.options['A'] && !q.options['B']) {
      const aText = q.options['A'];
      
      // Try to match B., C., D. inside the A text
      const bMatch = aText.match(/B\s*[.、：:]\s*/);
      const cMatch = aText.match(/C\s*[.、：:]\s*/);
      const dMatch = aText.match(/D\s*[.、：:]\s*/);
      
      if (bMatch) {
        let textA = aText.substring(0, bMatch.index).trim();
        let rest = aText.substring(bMatch.index + bMatch[0].length);
        q.options['A'] = textA;
        
        // Find C
        const cMatchInRest = rest.match(/C\s*[.、：:]\s*/);
        if (cMatchInRest) {
          let textB = rest.substring(0, cMatchInRest.index).trim();
          rest = rest.substring(cMatchInRest.index + cMatchInRest[0].length);
          q.options['B'] = textB;
          
          // Find D
          const dMatchInRest = rest.match(/D\s*[.、：:]\s*/);
          if (dMatchInRest) {
            let textC = rest.substring(0, dMatchInRest.index).trim();
            let textD = rest.substring(dMatchInRest.index + dMatchInRest[0].length).trim();
            q.options['C'] = textC;
            q.options['D'] = textD;
          } else {
            q.options['C'] = rest.trim();
          }
        } else {
          q.options['B'] = rest.trim();
        }
        updated++;
      }
    }
  }
});

console.log(`Updated ${updated} questions with inline options.`);
fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2), 'utf-8');
