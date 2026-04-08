import json

with open(r'e:\网页html\青少年人工智能答题\src\data\questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 统计各赛道题目数量
track1_primary = [q for q in data if q['group'] == 'track1_primary']
track1_junior = [q for q in data if q['group'] == 'track1_junior']
primary = [q for q in data if q['group'] == 'primary']
junior = [q for q in data if q['group'] == 'junior']

print('新题库统计：')
print(f'赛道一小学 (track1_primary): {len(track1_primary)} 道')
print(f'赛道一初中 (track1_junior): {len(track1_junior)} 道')
print(f'赛道二小学 (primary): {len(primary)} 道')
print(f'赛道二初中 (junior): {len(junior)} 道')
print(f'总计: {len(data)} 道')

# 检查赛道二的题目类型分布
print('\n赛道二小学题型分布:')
for qtype in ['single', 'multiple', 'boolean', 'fill_in_the_blanks', 'short_answer']:
    count = len([q for q in primary if q['type'] == qtype])
    print(f'  {qtype}: {count} 道')

print('\n赛道二初中题型分布:')
for qtype in ['single', 'multiple', 'boolean', 'fill_in_the_blanks', 'short_answer']:
    count = len([q for q in junior if q['type'] == qtype])
    print(f'  {qtype}: {count} 道')
