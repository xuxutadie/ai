import docx
import json

# 读取原始题库
def read_questions_from_docx(file_path):
    doc = docx.Document(file_path)
    questions = []
    current_question = None
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        
        # 检查是否是新题目（以数字开头）
        if re.match(r'^\d+\.', text):
            if current_question:
                questions.append(current_question)
            
            current_question = {
                'question': text,
                'options': {},
                'answer': None
            }
        elif current_question:
            # 检查是否是选项（A. B. C. D. 开头）
            option_match = re.match(r'^([A-D])\.\s*(.*)', text)
            if option_match:
                key, val = option_match.groups()
                current_question['options'][key] = val
            # 检查是否是答案
            elif text.startswith('答案：'):
                current_question['answer'] = text.replace('答案：', '').strip()
            # 否则是题目的补充描述
            else:
                current_question['question'] += ' ' + text
    
    if current_question:
        questions.append(current_question)
    
    return questions

# 检查题目是否有问题
def check_questions():
    with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # 读取原始题库进行对比
    primary_single = read_questions_from_docx(r'e:\网页html\青少年人工智能答题\赛道一小学\小学单选题.docx')
    primary_multiple = read_questions_from_docx(r'e:\网页html\青少年人工智能答题\赛道一小学\小学多选题.docx')
    primary_boolean = read_questions_from_docx(r'e:\网页html\青少年人工智能答题\赛道一小学\小学判断题.docx')
    
    # 创建题目映射
    question_map = {}
    for q in primary_single + primary_multiple + primary_boolean:
        # 提取题目编号
        num_match = re.match(r'^(\d+)\.', q['question'])
        if num_match:
            num = num_match.group(1)
            question_map[num] = q
    
    # 检查JSON中的题目
    issues = []
    for q in json_data:
        if q['group'] != 'track1_primary':
            continue
        
        num_match = re.match(r'^(\d+)\.', q['question'])
        if not num_match:
            continue
        
        num = num_match.group(1)
        if num not in question_map:
            continue
        
        original = question_map[num]
        json_q = q['question']
        
        # 检查长度差异
        if len(original['question']) > len(json_q) + 20:
            issues.append({
                'num': num,
                'original': original['question'],
                'json': json_q,
                'type': q['type']
            })
    
    print(f'发现 {len(issues)} 道可能有问题的题目:')
    print()
    for issue in issues:
        print(f'题目 {issue["num"]} ({issue["type"]}):')
        print(f'  原始: {issue["original"][:100]}...')
        print(f'  JSON: {issue["json"][:100]}...')
        print()

import re
check_questions()
