// AI评分服务
// 内置豆包（火山引擎）大模型API

interface ScoringResult {
  score: number; // 0-10分
  feedback: string;
  matchedPoints: string[];
  missingPoints: string[];
  suggestions: string;
}

// 内置的豆包API密钥
const DOUBAO_API_KEY = '514aeade-bdda-41ee-9d41-fa096a3af597';
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
// 使用ep-前缀的推理接入点ID格式
const DOUBAO_MODEL = 'ep-20260408101534-vcd4v'; // 用户的推理接入点ID

/**
 * 使用豆包大模型进行评分
 * @param question 题目
 * @param referenceAnswer 参考答案
 * @param studentAnswer 学生答案
 * @returns 评分结果
 */
async function scoreWithDoubao(
  question: string,
  referenceAnswer: string | null,
  studentAnswer: string
): Promise<ScoringResult> {
  if (!referenceAnswer) {
    return {
      score: 0,
      feedback: '无参考答案，无法评分',
      matchedPoints: [],
      missingPoints: [],
      suggestions: ''
    };
  }

  const prompt = `你是一位专业的AI教育评分专家。请根据以下标准对学生答案进行智能评分：

【题目】
${question}

【参考答案（仅作为评分参考，不是唯一标准）】
${referenceAnswer}

【学生答案】
${studentAnswer}

【评分原则】
1. 开放性评分：不苛求与参考答案完全一致，只要学生回答合理、有见解即可得分
2. 鼓励创新：学生有自己独特观点、举例恰当、思考深入都应给予高分
3. 理解深度：关注学生对概念的理解程度，而非死记硬背
4. 表达逻辑：回答条理清晰、逻辑通顺即可，不苛求专业术语

【评分维度】
1. 内容理解（35%）：是否正确理解题目核心概念
2. 思考深度（30%）：是否有自己的思考和分析，而非简单复述
3. 举例说明（20%）：是否能结合生活实际举例（如适用）
4. 表达完整（15%）：回答是否完整、条理是否清晰

【评分标准】
- 9-10分：理解深刻，有独特见解，举例恰当，表达优秀
- 7-8分：理解正确，有一定思考，表达清晰
- 5-6分：基本理解，但思考不够深入或表达不够完整
- 3-4分：理解有偏差，但部分观点正确
- 0-2分：答非所问或完全错误

请严格按以下JSON格式返回评分结果（不要包含任何其他内容，确保是合法JSON）：
{
  "score": 8.5,
  "feedback": "详细评语，指出优点和不足，鼓励学生",
  "matchedPoints": ["学生回答中的亮点1", "亮点2"],
  "missingPoints": ["可以改进的地方1"],
  "suggestions": "具体改进建议"
}`;

  try {
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的教育评分专家，擅长客观、公正地评分。请始终返回合法的JSON格式。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('豆包API错误:', response.status, errorText);
      throw new Error(`豆包API错误: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析JSON响应
    try {
      // 尝试直接解析
      const result = JSON.parse(content);
      return {
        score: Math.max(0, Math.min(10, result.score || 0)),
        feedback: result.feedback || '评分完成',
        matchedPoints: result.matchedPoints || [],
        missingPoints: result.missingPoints || [],
        suggestions: result.suggestions || ''
      };
    } catch (parseError) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          return {
            score: Math.max(0, Math.min(10, result.score || 0)),
            feedback: result.feedback || '评分完成',
            matchedPoints: result.matchedPoints || [],
            missingPoints: result.missingPoints || [],
            suggestions: result.suggestions || ''
          };
        } catch (e) {
          console.error('JSON解析失败:', e);
        }
      }

      // 如果都失败了，返回默认结果
      console.error('无法解析AI响应:', content);
      return {
        score: 5,
        feedback: '评分解析失败，请稍后重试',
        matchedPoints: [],
        missingPoints: [],
        suggestions: ''
      };
    }
  } catch (error) {
    console.error('豆包评分失败:', error);
    return {
      score: 0,
      feedback: '评分服务暂时不可用，请稍后重试',
      matchedPoints: [],
      missingPoints: [],
      suggestions: ''
    };
  }
}

/**
 * 主观题AI评分（使用内置豆包模型）
 * @param question 题目
 * @param referenceAnswer 参考答案
 * @param studentAnswer 学生答案
 * @param maxPoints 满分分值
 * @returns 评分结果（实际分数和评语）
 */
export async function scoreWithAI(
  question: string,
  referenceAnswer: string | null,
  studentAnswer: string,
  maxPoints: number
): Promise<{ score: number; feedback: string }> {
  console.log('scoreWithAI called:', { question: question.substring(0, 50), referenceAnswer: referenceAnswer?.substring(0, 50), studentAnswer: studentAnswer.substring(0, 50), maxPoints });
  
  // 空答案直接0分
  if (!studentAnswer || !studentAnswer.trim()) {
    console.log('空答案，返回0分');
    return { score: 0, feedback: '未作答' };
  }

  const result = await scoreWithDoubao(question, referenceAnswer, studentAnswer);
  console.log('scoreWithDoubao result:', result);

  // 将10分制转换为实际分数
  const actualScore = (result.score / 10) * maxPoints;
  console.log('转换后分数:', actualScore);

  return {
    score: Math.round(actualScore * 10) / 10, // 保留1位小数
    feedback: result.feedback
  };
}

/**
 * 批量评分（用于考试结束后的统一评分）
 * @param answers 答案列表
 * @returns 评分结果列表
 */
export async function batchScoreWithAI(
  answers: Array<{
    question: string;
    referenceAnswer: string | null;
    studentAnswer: string;
    maxPoints: number;
  }>
): Promise<Array<{ score: number; feedback: string }>> {
  const results = [];

  for (const answer of answers) {
    const result = await scoreWithAI(
      answer.question,
      answer.referenceAnswer,
      answer.studentAnswer,
      answer.maxPoints
    );
    results.push(result);

    // 添加延迟以避免API限流（豆包API通常有QPS限制）
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 获取详细的评分结果（包含匹配点和缺失点）
 */
export async function getDetailedScoring(
  question: string,
  referenceAnswer: string | null,
  studentAnswer: string,
  maxPoints: number
): Promise<{
  score: number;
  feedback: string;
  matchedPoints: string[];
  missingPoints: string[];
  suggestions: string;
}> {
  if (!studentAnswer || !studentAnswer.trim()) {
    return {
      score: 0,
      feedback: '未作答',
      matchedPoints: [],
      missingPoints: referenceAnswer ? ['未回答参考答案中的要点'] : [],
      suggestions: '请认真作答'
    };
  }

  const result = await scoreWithDoubao(question, referenceAnswer, studentAnswer);
  const actualScore = (result.score / 10) * maxPoints;

  return {
    score: Math.round(actualScore * 10) / 10,
    feedback: result.feedback,
    matchedPoints: result.matchedPoints,
    missingPoints: result.missingPoints,
    suggestions: result.suggestions
  };
}
