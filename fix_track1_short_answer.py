import json
import re

# 读取题库
with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0

for q in data:
    # 只处理赛道一的主观题
    if q['group'] not in ['track1_primary', 'track1_junior']:
        continue
    if q['type'] != 'short_answer':
        continue
    
    question_text = q['question']
    
    # 检查题目中是否包含"答案："
    if '答案：' in question_text:
        # 分离题目和答案
        parts = question_text.split('答案：', 1)
        question_only = parts[0].strip()
        answer_text = parts[1].strip() if len(parts) > 1 else None
        
        # 更新题目和答案
        q['question'] = question_only
        q['answer'] = answer_text
        fixed_count += 1
        print(f'修复题目 {q["id"]}')
        print(f'  题目: {question_only[:60]}...')
        print(f'  答案: {answer_text[:60] if answer_text else "None"}...')
        print()

print(f'\n总共修复了 {fixed_count} 道主观题')

# 保存
with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('题库已更新！')
