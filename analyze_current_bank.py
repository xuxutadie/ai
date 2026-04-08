import json

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f'总题数: {len(questions)}')
print()

print('按赛道分组:')
tracks = {}
for q in questions:
    track = q.get('track', 1)
    tracks[track] = tracks.get(track, 0) + 1

for track in sorted(tracks.keys()):
    print(f'  赛道{track}: {tracks[track]}题')
print()

print('按组别分组:')
groups = {}
for q in questions:
    group = q.get('group', 'primary')
    groups[group] = groups.get(group, 0) + 1

for group in sorted(groups.keys()):
    print(f'  {group}: {groups[group]}题')
print()

print('按题型分组:')
types = {}
for q in questions:
    q_type = q.get('type', 'single')
    types[q_type] = types.get(q_type, 0) + 1

for q_type in sorted(types.keys()):
    print(f'  {q_type}: {types[q_type]}题')
print()

print('赛道1各组别题型分布:')
track1_groups = {}
for q in questions:
    if q.get('track', 1) == 1:
        group = q.get('group', 'primary')
        q_type = q.get('type', 'single')
        key = (group, q_type)
        track1_groups[key] = track1_groups.get(key, 0) + 1

for (group, q_type), count in sorted(track1_groups.items()):
    print(f'  {group} - {q_type}: {count}题')
print()

print('赛道2各组别题型分布:')
track2_groups = {}
for q in questions:
    if q.get('track', 1) == 2:
        group = q.get('group', 'primary')
        q_type = q.get('type', 'single')
        key = (group, q_type)
        track2_groups[key] = track2_groups.get(key, 0) + 1

for (group, q_type), count in sorted(track2_groups.items()):
    print(f'  {group} - {q_type}: {count}题')
