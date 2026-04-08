import json

with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

short_answers = [q for q in data if q['type'] == 'short_answer']
print(f'总共有 {len(short_answers)} 道简答题')
print()

print('前5道简答题:')
for i, q in enumerate(short_answers[:5]):
    print(f'第 {i+1} 道:')
    print(f'  赛道: {q["group"]}')
    print(f'  题目: {q["question"][:60]}...')
    print(f'  答案: {q["answer"]}')
    print()

# 统计答案情况
no_answer = sum(1 for q in short_answers if q['answer'] == '无答案')
has_answer = len(short_answers) - no_answer
print(f'有参考答案的简答题: {has_answer} 道')
print(f'无答案的简答题: {no_answer} 道')
print()

# 按赛道分组统计
from collections import defaultdict
by_group = defaultdict(list)
for q in short_answers:
    by_group[q['group']].append(q)

print('按赛道统计:')
for group, questions in by_group.items():
    no_ans = sum(1 for q in questions if q['answer'] == '无答案')
    has_ans = len(questions) - no_ans
    print(f'  {group}: 共{len(questions)}道, 有答案{has_ans}道, 无答案{no_ans}道')
