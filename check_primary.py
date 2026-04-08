import docx

doc = docx.Document(r'e:\网页html\青少年人工智能答题\赛道一小学\小学主观题.docx')
for i, para in enumerate(doc.paragraphs[:30]):
    print(f'{i}: {para.text}')
