import docx
import json
import re

def parse_subjective_questions(file_path):
    doc = docx.Document(file_path)
    questions = []
    
    current_question = None
    current_answer = []
    in_answer = False
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        
        # 检查是否是题目开头
        question_match = re.match(r'^\d+\.\s*(.*)', text)
        if question_match and not text.startswith('>'):
            # 如果有之前的题目，保存
            if current_question is not None and current_answer:
                questions.append({
                    'question': current_question,
                    'answer': '\n'.join(current_answer)
                })
            
            current_question = question_match.group(1)
            current_answer = []
            in_answer = False
        
        # 检查是否是答案开头
        elif text.startswith('> 答案：') or text.startswith('> 答案'):
            in_answer = True
            answer_text = text.replace('> 答案：', '').replace('> 答案', '').strip()
            if answer_text:
                current_answer.append(answer_text)
        
        # 如果在答案区域，继续收集
        elif in_answer and text.startswith('>'):
            answer_text = text[1:].strip()
            if answer_text:
                current_answer.append(answer_text)
    
    # 保存最后一题
    if current_question is not None and current_answer:
        questions.append({
            'question': current_question,
            'answer': '\n'.join(current_answer)
        })
    
    return questions

# 读取主观题
primary_questions = parse_subjective_questions(r'e:\网页html\青少年人工智能答题\赛道一小学\小学主观题.docx')
junior_questions = parse_subjective_questions(r'e:\网页html\青少年人工智能答题\赛道一初中\初中主观题.docx')

print(f'小学主观题: {len(primary_questions)} 道')
print(f'初中主观题: {len(junior_questions)} 道')
print()

print('=== 小学主观题 ===')
for i, q in enumerate(primary_questions):
    print(f'{i+1}. 题目: {q["question"][:60]}...')
    print(f'   答案: {q["answer"][:60]}...')
    print()

print('=== 初中主观题 ===')
for i, q in enumerate(junior_questions):
    print(f'{i+1}. 题目: {q["question"][:60]}...')
    print(f'   答案: {q["answer"][:60]}...')
    print()

# 读取当前题库
with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 更新题库
updated_count = 0

for q in data:
    if q['type'] != 'short_answer':
        continue
    
    # 匹配小学题
    if q['group'] == 'track1_primary':
        for pq in primary_questions:
            # 简单匹配：检查题目是否包含关键词
            q_text = q['question'].replace('1. ', '')
            if q_text[:30] in pq['question'] or pq['question'][:30] in q_text:
                q['answer'] = pq['answer']
                updated_count += 1
                print(f'更新小学主观题: {pq["question"][:40]}...')
                break
    
    # 匹配初中题
    elif q['group'] == 'track1_junior':
        for jq in junior_questions:
            q_text = q['question'].replace('修改后初中组AI大赛练习简答题（共30道）', '').strip()
            if not q_text:
                continue
            if q_text[:30] in jq['question'] or jq['question'][:30] in q_text:
                q['answer'] = jq['answer']
                updated_count += 1
                print(f'更新初中主观题: {jq["question"][:40]}...')
                break

print()
print(f'总共更新了 {updated_count} 道主观题')

# 保存更新后的题库
with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('题库已更新！')
