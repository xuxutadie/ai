import json
import re

with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 检查可能的无效题目
suspect_questions = []

for q in data:
    question = q['question'].strip()
    
    # 检查是否是标题类
    if re.match(r'^[一二三四五六七八九十]+[、.]', question):
        suspect_questions.append(q)
    
    # 检查是否太短且没有实际内容
    if len(question) < 10 and not any(c in question for c in ['?', '？', '以下', '下列', '关于', '什么', '哪个', '哪些', '是否', '是', '属于', '属于']):
        if len(question) < 5:
            suspect_questions.append(q)

print(f'发现 {len(suspect_questions)} 道可能的无效题目:')
print()
for i, q in enumerate(suspect_questions):
    print(f'{i+1}. [{q["group"]}] {q["type"]}:')
    print(f'   {q["question"]}')
    print()
