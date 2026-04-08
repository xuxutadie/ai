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
            
            # 尝试多种匹配模式
            new_options = {}
            
            # 模式1: "A. xxx B. xxx C. xxx D. xxx"
            pattern1 = r'([A-D])\.\s*([^A-D]+?)(?=[A-D]\.\s|$)'
            matches1 = re.findall(pattern1, a_content)
            
            # 模式2: "A xxx B xxx C xxx D xxx" (没有点号)
            pattern2 = r'([A-D])\s+([^A-D]+?)(?=[A-D]\s|$)'
            matches2 = re.findall(pattern2, a_content)
            
            # 模式3: "A.xxx B.xxx C.xxx D.xxx" (点号紧跟)
            pattern3 = r'([A-D])\.([^A-D]+?)(?=[A-D]\.|$)'
            matches3 = re.findall(pattern3, a_content)
            
            # 选择匹配结果最多的模式
            matches = matches1 if len(matches1) >= len(matches2) and len(matches1) >= len(matches3) else \
                     (matches2 if len(matches2) >= len(matches3) else matches3)
            
            if len(matches) >= 2:
                for key, content in matches:
                    content = content.strip()
                    # 移除末尾的分隔符
                    content = re.sub(r'[\/\|,，;；。\.]+$', '', content)
                    new_options[key] = content
                
                if len(new_options) >= 2:
                    q['options'] = new_options
                    fixed_count += 1
                    print(f"修复: {q['question'][:40]}...")
                    print(f"  结果: {new_options}")

print(f"\n共修复了 {fixed_count} 道多选题")

# 保存修复后的文件
with open('src/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
