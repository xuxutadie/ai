import docx

doc = docx.Document(r'e:\网页html\青少年人工智能答题\赛道一初中\初中主观题.docx')
for i, para in enumerate(doc.paragraphs[:50]):
    print(f'{i}: {para.text}')
