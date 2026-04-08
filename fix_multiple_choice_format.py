import json
import re

# 读取questions.json
with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

fixed_count = 0

# 修复多选题选项格式
for q in questions:
    if q.get('type') == 'multiple' and 'options' in q:
        options = q['options']
        
        # 检查是否是合并格式的选项（所有内容都在A选项里）
        if len(options) == 1 and 'A' in options:
            a_content = options['A']
            
            # 原始格式: "以人为本 B. 智能向善 C. 公平公正 D. 唯利是图"
            # A选项没有前缀，B/C/D有"B. "前缀
            
            # 方法：按 "B. "、"C. "、"D. " 分割
            parts = re.split(r'\s+([B-D])\.\s*', a_content)
            # parts[0] 是A选项内容，parts[1]是B，parts[2]是B内容，等等
            
            new_options = {}
            
            if len(parts) >= 2:
                # A选项是parts[0]
                a_content_clean = parts[0].strip()
                # 移除A.前缀（如果有）
                a_content_clean = re.sub(r'^A\.\s*', '', a_content_clean)
                # 移除末尾的分隔符
                a_content_clean = re.sub(r'[\/\|,，;；。\.]+$', '', a_content_clean)
                new_options['A'] = a_content_clean
                
                # B/C/D选项在parts[1], parts[2]...中
                for i in range(1, len(parts), 2):
                    if i + 1 < len(parts):
                        key = parts[i]
                        content = parts[i + 1].strip()
                        # 移除末尾的分隔符
                        content = re.sub(r'[\/\|,，;；。\.]+$', '', content)
                        new_options[key] = content
                
                if len(new_options) >= 2:
                    q['options'] = new_options
                    fixed_count += 1
                    if fixed_count <= 5:
                        print(f"修复: {q['question'][:40]}...")
                        print(f"  原: {a_content}")
                        print(f"  新: {new_options}")
                        print()

print(f"\n共修复了 {fixed_count} 道多选题")

# 验证科技伦理那道题
for q in questions:
    if '科技伦理的核心' in q.get('question', ''):
        print(f"\n验证 - 科技伦理的核心:")
        print(f"  选项: {q.get('options', {})}")

# 保存修复后的文件
with open('src/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
