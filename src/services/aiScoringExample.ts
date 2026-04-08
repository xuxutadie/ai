// AI评分使用示例
// 展示如何在Quiz组件中集成AI评分功能

import { scoreWithAI, getDetailedScoring } from './aiScoring';

/**
 * 示例1：简单的主观题评分
 */
export async function exampleSimpleScoring() {
  const question = '请简述人工智能的定义，并举例说明其在生活中的应用。';
  const referenceAnswer = '人工智能是模拟、延伸和扩展人类智能的技术科学。应用实例包括：智能语音助手、人脸识别、自动驾驶等。';
  const studentAnswer = '人工智能是让机器像人一样思考的技术，比如 Siri 和小爱同学就是人工智能应用。';
  const maxPoints = 10;

  const result = await scoreWithAI(
    question,
    referenceAnswer,
    studentAnswer,
    maxPoints
  );

  console.log('评分结果:', result);
  // 输出: { score: 6.5, feedback: '学生答案基本理解了AI的概念...' }
}

/**
 * 示例2：获取详细评分信息
 */
export async function exampleDetailedScoring() {
  const question = '请说出至少3种人工智能在医疗领域的应用。';
  const referenceAnswer = '1. 医学影像诊断 2. 药物研发 3. 智能问诊 4. 手术机器人';
  const studentAnswer = '人工智能可以帮助医生看X光片，还能帮助发现新药物。';
  const maxPoints = 10;

  const result = await getDetailedScoring(
    question,
    referenceAnswer,
    studentAnswer,
    maxPoints
  );

  console.log('详细评分结果:');
  console.log('- 得分:', result.score);
  console.log('- 评语:', result.feedback);
  console.log('- 匹配要点:', result.matchedPoints);
  console.log('- 缺失要点:', result.missingPoints);
  console.log('- 改进建议:', result.suggestions);
}

/**
 * 示例3：在Quiz组件中的使用方式
 *
 * 在 Quiz.tsx 中的 handleConfirm 函数里添加：
 */

/*
import { scoreWithAI } from '../services/aiScoring';
import { useState } from 'react';

// 在组件中添加状态
const [isAiScoring, setIsAiScoring] = useState(false);
const [aiFeedback, setAiFeedback] = useState('');

// 在 handleConfirm 中
const handleConfirm = async () => {
  if (currentQ.type === 'short_answer') {
    setIsAiScoring(true);
    setAiFeedback('AI正在评分，请稍候...');

    try {
      const result = await scoreWithAI(
        currentQ.question,
        currentQ.answer,
        textAnswer,
        currentQ.points
      );

      setScore(result.score);
      setAiFeedback(result.feedback);
    } catch (error) {
      console.error('AI评分失败:', error);
      // 降级到本地评分
      const localScore = calculateShortAnswerScore(textAnswer, currentQ.answer || '', currentQ.points);
      setScore(localScore);
      setAiFeedback('AI评分服务暂时不可用，已使用本地评分');
    } finally {
      setIsAiScoring(false);
    }
  }
};

// 在UI中显示
{currentQ.type === 'short_answer' && (
  <div className="mt-4">
    {isAiScoring ? (
      <div className="text-blue-400 flex items-center">
        <LoadingSpinner className="w-4 h-4 mr-2 animate-spin" />
        AI正在评分...
      </div>
    ) : (
      <div className="text-gray-300">
        <p className="font-bold">得分: {score}/{currentQ.points}</p>
        <p className="mt-2 text-sm">{aiFeedback}</p>
      </div>
    )}
  </div>
)}
*/

/**
 * 示例4：批量评分（考试结束后）
 */
export async function exampleBatchScoring() {
  const { batchScoreWithAI } = await import('./aiScoring');

  const answers = [
    {
      question: '什么是机器学习？',
      referenceAnswer: '机器学习是人工智能的一个分支，让计算机通过数据学习规律。',
      studentAnswer: '机器学习就是让电脑自己学习。',
      maxPoints: 10
    },
    {
      question: '列举AI的两个应用。',
      referenceAnswer: '人脸识别、语音助手、推荐系统等。',
      studentAnswer: '人脸识别和自动驾驶。',
      maxPoints: 10
    }
  ];

  const results = await batchScoreWithAI(answers);

  results.forEach((result, index) => {
    console.log(`第${index + 1}题: ${result.score}分 - ${result.feedback}`);
  });
}
