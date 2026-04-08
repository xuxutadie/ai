import docx
import json

def read_docx(file_path):
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        if para.text.strip():
            full_text.append(para.text)
    return full_text

# 读取小学主观题
print("=== 小学主观题 ===")
primary_text = read_docx(r'e:\网页html\青少年人工智能答题\赛道一小学\小学主观题.docx')
for i, line in enumerate(primary_text[:50]):
    print(f'{i+1}. {line}')
print()

# 读取初中主观题
print("=== 初中主观题 ===")
junior_text = read_docx(r'e:\网页html\青少年人工智能答题\赛道一初中\初中主观题.docx')
for i, line in enumerate(junior_text[:50]):
    print(f'{i+1}. {line}')
