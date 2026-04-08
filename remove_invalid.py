import json

with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 过滤掉无效题目
filtered_data = [q for q in data if '文档部分内容可能由 AI 生成' not in q['question']]

print(f'删除前: {len(data)} 道题')
print(f'删除后: {len(filtered_data)} 道题')
print(f'删除了 {len(data) - len(filtered_data)} 道无效题目')

# 保存过滤后的题库
with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=2)

print('题库已更新！')
