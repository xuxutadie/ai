// AI评分服务
// 支持多种大模型API：OpenAI、百度文心、阿里通义千问、智谱GLM等

interface ScoringResult {
  score: number; // 0-10分
  feedback: string;
  matchedPoints: string[];
  missingPoints: string[];
  suggestions: string;
}

interface AIScoringConfig {
  provider: 'openai' | 'baidu' | 'aliyun' | 'zhipu';
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

// OpenAI GPT评分
async function scoreWithOpenAI(
  question: string,
  referenceAnswer: string,
  studentAnswer: string,
  config: AIScoringConfig
): Promise<ScoringResult> {
  const prompt = `你是一位专业的AI教育评分专家。请根据以下标准对答案进行评分：

【题目】
${question}

【参考答案】
${referenceAnswer}

【学生答案】
${studentAnswer}

【评分标准】
1. 内容准确性（40%）：是否包含核心知识点
2. 完整性（30%）：是否覆盖答案要点
3. 表达清晰度（20%）：逻辑是否清晰
4. 创新性（10%）：是否有独到见解

请严格按以下JSON格式返回评分结果（不要包含任何其他内容）：
{
  "score": 8.5,
  "feedback": "详细评语，指出优点和不足",
  "matchedPoints": ["匹配的要点1", "匹配的要点2"],
  "missingPoints": ["缺失的要点1"],
  "suggestions": "改进建议"
}`;

  const response = await fetch(config.apiUrl || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是一位专业的教育评分专家，擅长客观、公正地评分。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API错误: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // 解析JSON响应
  try {
    const result = JSON.parse(content);
    return {
      score: Math.max(0, Math.min(10, result.score)),
      feedback: result.feedback || '',
      matchedPoints: result.matchedPoints || [],
      missingPoints: result.missingPoints || [],
      suggestions: result.suggestions || ''
    };
  } catch (e) {
    // 如果解析失败，返回默认结果
    return {
      score: 5,
      feedback: '评分解析失败，请稍后重试',
      matchedPoints: [],
      missingPoints: [],
      suggestions: ''
    };
  }
}

// 百度文心一言评分
async function scoreWithBaidu(
  _question: string,
  _referenceAnswer: string,
  _studentAnswer: string,
  _config: AIScoringConfig
): Promise<ScoringResult> {
  // 百度文心API调用示例
  // 需要先获取access_token
  // const prompt = `作为教育评分专家，请评分...`;

  // 百度API调用示例（需要实现具体的鉴权和调用逻辑）
  // const response = await fetch(...)
  
  // 临时返回示例结果
  console.log('百度评分功能待实现');
  return { score: 5, feedback: '百度评分功能待实现', matchedPoints: [], missingPoints: [], suggestions: '' };
}

// 主评分函数
export async function scoreWithAI(
  question: string,
  referenceAnswer: string | null,
  studentAnswer: string,
  maxPoints: number,
  config: AIScoringConfig
): Promise<{ score: number; feedback: string }> {
  if (!referenceAnswer) {
    return { score: 0, feedback: '无参考答案，无法评分' };
  }

  try {
    let result: ScoringResult;

    switch (config.provider) {
      case 'openai':
        result = await scoreWithOpenAI(question, referenceAnswer, studentAnswer, config);
        break;
      case 'baidu':
        result = await scoreWithBaidu(question, referenceAnswer, studentAnswer, config);
        break;
      default:
        throw new Error('不支持的AI提供商');
    }

    // 将10分制转换为实际分数
    const actualScore = (result.score / 10) * maxPoints;

    return {
      score: Math.round(actualScore * 10) / 10, // 保留1位小数
      feedback: result.feedback
    };
  } catch (error) {
    console.error('AI评分失败:', error);
    return { score: 0, feedback: '评分服务暂时不可用' };
  }
}

// 批量评分（用于考试结束后的统一评分）
export async function batchScoreWithAI(
  answers: Array<{
    question: string;
    referenceAnswer: string | null;
    studentAnswer: string;
    maxPoints: number;
  }>,
  config: AIScoringConfig
): Promise<Array<{ score: number; feedback: string }>> {
  const results = [];
  
  for (const answer of answers) {
    const result = await scoreWithAI(
      answer.question,
      answer.referenceAnswer,
      answer.studentAnswer,
      answer.maxPoints,
      config
    );
    results.push(result);
    
    // 添加延迟以避免API限流
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// 配置示例
export const aiScoringConfig: AIScoringConfig = {
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo'
};
