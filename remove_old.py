import shutil
import os

folders_to_remove = [
    r'e:\网页html\青少年人工智能答题\赛道一小学',
    r'e:\网页html\青少年人工智能答题\赛道一初中',
    r'e:\网页html\青少年人工智能答题\赛道一小学新题题库',
    r'e:\网页html\青少年人工智能答题\赛道一初中新题题库'
]

for folder in folders_to_remove:
    try:
        if os.path.exists(folder):
            shutil.rmtree(folder)
            print(f'已删除: {folder}')
        else:
            print(f'不存在: {folder}')
    except Exception as e:
        print(f'删除失败 {folder}: {e}')

print('\n删除完成！')
