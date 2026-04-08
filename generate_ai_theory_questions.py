import json
import random
import time

# 人工智能理论知识点 - 小学组
primary_ai_theory = {
    'single': [
        {
            'question': '人工智能的英文缩写是什么？',
            'options': {
                'A': 'IT',
                'B': 'AI',
                'C': 'HI',
                'D': 'CI'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '下列哪项属于人工智能应用？',
            'options': {
                'A': '普通自行车',
                'B': '智能语音助手',
                'C': '普通铅笔',
                'D': '木制桌子'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '人脸识别技术主要用于什么？',
            'options': {
                'A': '识别声音',
                'B': '识别人脸',
                'C': '识别文字',
                'D': '识别颜色'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '机器学习是人工智能的什么？',
            'options': {
                'A': '竞争对手',
                'B': '重要分支',
                'C': '完全替代',
                'D': '无关技术'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '语音识别技术可以把什么转换为文字？',
            'options': {
                'A': '图片',
                'B': '声音',
                'C': '视频',
                'D': '气味'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '计算机视觉主要研究什么？',
            'options': {
                'A': '让计算机理解声音',
                'B': '让计算机理解图像和视频',
                'C': '让计算机理解文字',
                'D': '让计算机理解味道'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '下列哪项不是人工智能的应用？',
            'options': {
                'A': '智能导航',
                'B': '普通计算器',
                'C': 'AI绘画',
                'D': '智能翻译'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '深度学习是哪种学习方法的一种？',
            'options': {
                'A': '传统学习',
                'B': '机器学习',
                'C': '手动学习',
                'D': '无师自通'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': 'AI绘画主要利用什么技术？',
            'options': {
                'A': '语音识别',
                'B': '图像生成',
                'C': '文字识别',
                'D': '声音合成'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '自然语言处理主要研究什么？',
            'options': {
                'A': '计算机与人类语言的交互',
                'B': '计算机与动物的交流',
                'C': '计算机与植物的互动',
                'D': '计算机与外星人的通信'
            },
            'answer': 'A',
            'points': 2
        }
    ],
    'multiple': [
        {
            'question': '下列哪些属于人工智能应用？',
            'options': {
                'A': '智能语音助手',
                'B': '人脸识别',
                'C': '自动驾驶',
                'D': '普通自行车'
            },
            'answer': ['A', 'B', 'C'],
            'points': 2
        },
        {
            'question': '人工智能可以应用在哪些领域？',
            'options': {
                'A': '医疗健康',
                'B': '教育学习',
                'C': '交通运输',
                'D': '金融服务'
            },
            'answer': ['A', 'B', 'C', 'D'],
            'points': 2
        },
        {
            'question': '机器学习的主要类型有哪些？',
            'options': {
                'A': '监督学习',
                'B': '无监督学习',
                'C': '强化学习',
                'D': '魔法学习'
            },
            'answer': ['A', 'B', 'C'],
            'points': 2
        },
        {
            'question': '计算机视觉技术包括哪些？',
            'options': {
                'A': '图像识别',
                'B': '目标检测',
                'C': '图像生成',
                'D': '声音识别'
            },
            'answer': ['A', 'B', 'C'],
            'points': 2
        },
        {
            'question': '自然语言处理技术可以做什么？',
            'options': {
                'A': '机器翻译',
                'B': '文本分类',
                'C': '语音合成',
                'D': '图像绘画'
            },
            'answer': ['A', 'B', 'C'],
            'points': 2
        }
    ],
    'boolean': [
        {
            'question': '人工智能可以完全替代人类。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': '机器学习是人工智能的重要组成部分。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '人脸识别是计算机视觉的应用。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '自然语言处理让计算机理解人类语言。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': 'AI生成的内容永远都是正确的。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': '深度学习是机器学习的一种。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '语音识别可以把声音转换成文字。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '计算机只能做数学计算，不能理解图像。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': '智能推荐系统是人工智能的应用。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '人工智能会思考和有意识。（）',
            'answer': '错',
            'points': 2
        }
    ],
    'fill_in_the_blanks': [
        {
            'question': '人工智能的英文缩写是______。',
            'answer': 'AI',
            'points': 2
        },
        {
            'question': '______是让计算机从数据中学习的技术。',
            'answer': '机器学习',
            'points': 2
        },
        {
            'question': '______技术可以让计算机识别人脸。',
            'answer': '人脸识别',
            'points': 2
        },
        {
            'question': '______是研究计算机理解图像的技术。',
            'answer': '计算机视觉',
            'points': 2
        },
        {
            'question': '______让计算机理解和处理人类语言。',
            'answer': '自然语言处理',
            'points': 2
        }
    ]
}

# 人工智能理论知识点 - 初中组
junior_ai_theory = {
    'single': [
        {
            'question': '人工智能的核心概念是什么？',
            'options': {
                'A': '让计算机代替人类思考',
                'B': '模拟、延伸和扩展人类智能',
                'C': '制造会说话的机器人',
                'D': '让计算机变得更强大'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '监督学习需要什么？',
            'options': {
                'A': '大量未标注的数据',
                'B': '有标注的训练数据',
                'C': '不需要数据',
                'D': '只需要少量数据'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '神经网络的灵感来源于什么？',
            'options': {
                'A': '计算机硬件',
                'B': '人脑神经元',
                'C': '数学公式',
                'D': '物理定律'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '卷积神经网络（CNN）主要用于什么？',
            'options': {
                'A': '自然语言处理',
                'B': '图像处理',
                'C': '声音识别',
                'D': '推荐系统'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '循环神经网络（RNN）适合处理什么类型的数据？',
            'options': {
                'A': '图像数据',
                'B': '序列数据',
                'C': '表格数据',
                'D': '音频数据'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': 'Transformer架构主要应用于哪个领域？',
            'options': {
                'A': '计算机视觉',
                'B': '自然语言处理',
                'C': '语音识别',
                'D': '强化学习'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '大语言模型（LLM）的主要特点是什么？',
            'options': {
                'A': '参数量少但效率高',
                'B': '参数量大且能处理复杂语言任务',
                'C': '只能处理特定领域',
                'D': '不需要训练数据'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '强化学习中，智能体通过什么来学习？',
            'options': {
                'A': '阅读书籍',
                'B': '与环境交互并获得奖励',
                'C': '观看视频',
                'D': '听取讲座'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '过拟合是指什么？',
            'options': {
                'A': '模型在训练集上表现差，在测试集上表现好',
                'B': '模型在训练集上表现好，在测试集上表现差',
                'C': '模型在所有数据集上表现都好',
                'D': '模型在所有数据集上表现都差'
            },
            'answer': 'B',
            'points': 2
        },
        {
            'question': '生成对抗网络（GAN）由什么组成？',
            'options': {
                'A': '一个网络',
                'B': '生成器和判别器两个网络',
                'C': '三个独立网络',
                'D': '多个相同网络'
            },
            'answer': 'B',
            'points': 2
        }
    ],
    'multiple': [
        {
            'question': '机器学习的主要类型包括哪些？',
            'options': {
                'A': '监督学习',
                'B': '无监督学习',
                'C': '强化学习',
                'D': '半监督学习'
            },
            'answer': ['A', 'B', 'C', 'D'],
            'points': 2
        },
        {
            'question': '常见的神经网络架构有哪些？',
            'options': {
                'A': '卷积神经网络（CNN）',
                'B': '循环神经网络（RNN）',
                'C': 'Transformer',
                'D': '生成对抗网络（GAN）'
            },
            'answer': ['A', 'B', 'C', 'D'],
            'points': 2
        },
        {
            'question': '自然语言处理的主要任务包括哪些？',
            'options': {
                'A': '机器翻译',
                'B': '文本分类',
                'C': '命名实体识别',
                'D': '问答系统'
            },
            'answer': ['A', 'B', 'C', 'D'],
            'points': 2
        },
        {
            'question': '计算机视觉的主要应用有哪些？',
            'options': {
                'A': '图像识别',
                'B': '目标检测',
                'C': '图像分割',
                'D': '图像生成'
            },
            'answer': ['A', 'B', 'C', 'D'],
            'points': 2
        },
        {
            'question': 'AI伦理需要关注哪些方面？',
            'options': {
                'A': '公平性',
                'B': '透明度',
                'C': '隐私保护',
                'D': '安全性'
            },
            'answer': ['A', 'B', 'C', 'D'],
            'points': 2
        }
    ],
    'boolean': [
        {
            'question': '深度学习是机器学习的一个分支。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '神经网络的层数越多，性能一定越好。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': 'Transformer架构的核心是注意力机制。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '无监督学习需要标注数据。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': '过拟合的模型泛化能力强。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': '大语言模型可以生成连贯的文本。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '强化学习中奖励机制很重要。（）',
            'answer': '对',
            'points': 2
        },
        {
            'question': '卷积神经网络适合处理时间序列数据。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': 'AI系统不会存在偏见。（）',
            'answer': '错',
            'points': 2
        },
        {
            'question': '数据是机器学习的重要资源。（）',
            'answer': '对',
            'points': 2
        }
    ],
    'fill_in_the_blanks': [
        {
            'question': '______是机器学习中用于评估模型性能的数据集。',
            'answer': '测试集',
            'points': 2
        },
        {
            'question': '______机制是Transformer架构的核心。',
            'answer': '注意力',
            'points': 2
        },
        {
            'question': '______学习通过与环境交互获得奖励来学习。',
            'answer': '强化',
            'points': 2
        },
        {
            'question': '______网络适合处理图像数据。',
            'answer': '卷积神经',
            'points': 2
        },
        {
            'question': '______是指模型在未见数据上的表现能力。',
            'answer': '泛化能力',
            'points': 2
        }
    ]
}

def generate_questions():
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    new_questions = []
    timestamp = int(time.time() * 1000)
    
    # 定义需要生成的组别和赛道
    groups_config = [
        {'group': 'primary', 'grade': '1-6', 'track': 1, 'data': primary_ai_theory},
        {'group': 'junior', 'grade': '7-9', 'track': 1, 'data': junior_ai_theory},
        {'group': 'track1_primary', 'grade': '1-6', 'track': 1, 'data': primary_ai_theory},
        {'group': 'track1_junior', 'grade': '7-9', 'track': 1, 'data': junior_ai_theory},
    ]
    
    # 计算每种题型需要生成的数量（70%是AI理论知识点）
    question_count = 0
    
    for config in groups_config:
        group = config['group']
        grade = config['grade']
        track = config['track']
        data = config['data']
        
        # 统计当前组别的题目数量
        current_count = sum(1 for q in questions if q.get('group') == group)
        target_add = current_count  # 增加一倍
        
        # 70%是AI理论知识点
        ai_theory_count = int(target_add * 0.7)
        
        print(f'\n处理组别: {group}')
        print(f'  当前题数: {current_count}')
        print(f'  目标新增: {target_add}')
        print(f'  AI理论知识点: {ai_theory_count}')
        
        # 生成AI理论知识点题目
        for q_type in ['single', 'multiple', 'boolean', 'fill_in_the_blanks']:
            if q_type not in data:
                continue
                
            type_questions = data[q_type]
            
            # 每种题型生成一定数量
            type_count = ai_theory_count // 4
            if type_count == 0:
                type_count = 1
            
            for i in range(type_count):
                # 从题库中随机选择一个题目模板
                template = random.choice(type_questions)
                
                question_id = f'{group}_{q_type}_{timestamp}_{question_count + 1}'
                
                new_q = {
                    'id': question_id,
                    'grade': grade,
                    'group': group,
                    'track': track,
                    'type': q_type,
                    'question': template['question'],
                    'points': template['points'],
                    'answer': template['answer']
                }
                
                if 'options' in template:
                    new_q['options'] = template['options']
                
                new_questions.append(new_q)
                question_count += 1
        
        # 生成其他类型题目（30%）
        other_count = target_add - ai_theory_count
        print(f'  其他类型题目: {other_count}')
        
        # 获取当前组别的现有题目作为模板
        existing_questions = [q for q in questions if q.get('group') == group]
        
        for i in range(other_count):
            if not existing_questions:
                continue
                
            template = random.choice(existing_questions)
            question_id = f'{group}_{template["type"]}_{timestamp}_{question_count + 1}'
            
            new_q = template.copy()
            new_q['id'] = question_id
            
            new_questions.append(new_q)
            question_count += 1
    
    # 合并新旧题目
    all_questions = questions + new_questions
    
    print(f'\n总计新增题目: {len(new_questions)}')
    print(f'总题数: {len(all_questions)}')
    
    # 保存
    with open('src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    
    print('\n题库更新完成！')

if __name__ == '__main__':
    generate_questions()
