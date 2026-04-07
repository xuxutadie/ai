const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function parseDocx(filePath, type, group, grade) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;
  const questions = [];

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let i = 0;

  while (i < lines.length) {
    let questionText = lines[i];
    i++;

    let answer = "";
    let options = {};
    let answerLine = null;

    for (let j = i; j < lines.length; j++) {
      if (lines[j].startsWith('答案') || lines[j].startsWith('正确答案')) {
        answerLine = lines[j];
        break;
      }
    }

    const answerIndex = answerLine ? lines.indexOf(answerLine, i) : -1;
    const contentLines = answerIndex > 0 ? lines.slice(i, answerIndex) : [];

    if (type === 'single' || type === 'multiple') {
      if (answerLine) {
        answer = answerLine.replace(/答案[:：\s]*/, '').trim();
        if (type === 'multiple') {
          answer = answer.split('').filter(c => /[A-Z]/.test(c));
        }
      }

      for (const line of contentLines) {
        if (line.match(/^[A-D][.、：:]/)) {
          const optParts = line.split(/(?=\s+[A-D][.、：:])/);
          for (const part of optParts) {
            const m = part.match(/^\s*([A-D])[.、：:]\s*(.*)$/);
            if (m) {
              options[m[1]] = m[2].trim();
            }
          }
        }
      }
    } else if (type === 'boolean') {
      if (answerLine) {
        if (answerLine.includes('对') || answerLine.includes('√') || answerLine.includes('正确')) answer = '对';
        else if (answerLine.includes('错') || answerLine.includes('×') || answerLine.includes('错误')) answer = '错';
      }
      if (!answer) answer = '对';
    } else {
      if (answerLine) {
        answer = answerLine.replace(/答案[:：\s]*/, '').trim();
      }
    }

    if (questionText) {
      questions.push({
        id: `${group}_${type}_${Date.now()}_${questions.length + 1}`,
        grade,
        group,
        type,
        question: questionText,
        ...(Object.keys(options).length > 0 ? { options } : {}),
        points: type === 'short_answer' ? 10 : 2,
        answer: answer || "无答案"
      });
    }

    i = answerIndex > 0 ? answerIndex + 1 : lines.length;
  }

  return questions;
}

async function main() {
  const allQuestions = [];

  const dirs = [
    { name: '赛道一小学', group: 'track1_primary', grade: '1-6' },
    { name: '赛道一初中', group: 'track1_junior', grade: '7-9' },
    { name: '赛道二小学', group: 'primary', grade: '1-6' },
    { name: '赛道二初中', group: 'junior', grade: '7-9' }
  ];

  for (const dir of dirs) {
    if (fs.existsSync(dir.name)) {
      const files = fs.readdirSync(dir.name);
      for (const file of files) {
        if (!file.endsWith('.docx')) continue;
        const filePath = path.join(dir.name, file);

        let type = 'single';
        if (file.includes('多选')) type = 'multiple';
        else if (file.includes('判断')) type = 'boolean';
        else if (file.includes('填空')) type = 'fill_in_the_blanks';
        else if (file.includes('简答') || file.includes('主观')) type = 'short_answer';

        console.log(`Parsing ${filePath} as ${type}...`);
        const qs = await parseDocx(filePath, type, dir.group, dir.grade);
        allQuestions.push(...qs);
      }
    }
  }

  fs.writeFileSync('src/data/questions.json', JSON.stringify(allQuestions, null, 2));
  console.log(`Successfully extracted ${allQuestions.length} questions!`);
}

main().catch(console.error);