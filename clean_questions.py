import json
import re

with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 过滤掉无效题目
filtered_data = []
removed_count = 0

for q in data:
    question = q['question'].strip()
    
    # 删除"文档部分内容可能由 AI 生成"的题目
    if '文档部分内容可能由 AI 生成' in question:
        removed_count += 1
        continue
    
    # 删除"一、"开头的标题类题目
    if re.match(r'^[一二三四五六七八九十]+[、.]', question):
        removed_count += 1
        continue
    
    # 删除"---"分隔线题目
    if question.strip() == '---':
        removed_count += 1
        continue
    
    # 删除太短且没有实际内容的题目（长度小于10且不是判断题）
    if len(question) < 10 and q['type'] != 'boolean':
        # 检查是否有题目特征
        has_question_mark = any(c in question for c in ['?', '？'])
        has_content_keywords = any(w in question for w in ['以下', '下列', '关于', '什么', '哪个', '哪些', '是否', '属于', '下列'])
        
        if not has_question_mark and not has_content_keywords:
            removed_count += 1
            continue
    
    filtered_data.append(q)

print(f'删除前: {len(data)} 道题')
print(f'删除后: {len(filtered_data)} 道题')
print(f'删除了 {removed_count} 道无效题目')

# 保存过滤后的题库
with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=2)

print('题库已更新！')
