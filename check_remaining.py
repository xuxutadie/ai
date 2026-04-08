import json

with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 查找无答案的简答题
no_answer_questions = [q for q in data if q['type'] == 'short_answer' and q['answer'] == '无答案']

print('无答案的简答题:')
print()
for i, q in enumerate(no_answer_questions):
    print(f'第 {i+1} 道:')
    print(f'  ID: {q["id"]}')
    print(f'  赛道: {q["group"]}')
    print(f'  题目:')
    print(f'    {q["question"]}')
    print(f'  当前答案: {q["answer"]}')
    print()
