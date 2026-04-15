import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Question } from '../types';
import questionsData from '../data/questions.json';
import { scoreWithAI } from '../services/aiScoring';

// 动画配置
const SLIDE_DURATION = 0.4; // 滑动动画时长
const FEEDBACK_DURATION = 500; // 默认反馈显示时长(ms)

function calculateFillInBlanksScore(userAnswer: string, correctAnswer: string, maxPoints: number): number {
  if (!userAnswer.trim()) return 0;
  
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '')
      .trim();
  };
  
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);
  
  // 填空题使用精确匹配
  if (userNorm === correctNorm) {
    return maxPoints;
  }
  
  // 如果答案包含多个选项（用"或"、"/"、","分隔），检查是否匹配任一选项
  const possibleAnswers = correctAnswer.split(/[或\/|,，]/).map(a => normalizeText(a)).filter(a => a.length > 0);
  for (const possible of possibleAnswers) {
    if (userNorm === possible) {
      return maxPoints;
    }
  }
  
  return 0;
}

function calculateShortAnswerScore(userAnswer: string, correctAnswer: string, maxPoints: number): number {
  if (!userAnswer.trim()) return 0;
  
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '')
      .trim();
  };
  
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);
  
  // 完全匹配直接满分
  if (userNorm === correctNorm) {
    return maxPoints;
  }
  
  // 提取关键词（长度大于等于2的词）
  const extractKeywords = (text: string): string[] => {
    // 中文分词：提取连续的汉字或英文单词
    const words: string[] = [];
    let currentWord = '';
    
    for (const char of text) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // 汉字：每个字都是关键词
        if (currentWord && /[a-z0-9]/.test(currentWord)) {
          words.push(currentWord);
          currentWord = '';
        }
        words.push(char);
      } else if (/[a-z0-9]/.test(char)) {
        currentWord += char;
      } else {
        if (currentWord.length >= 2) {
          words.push(currentWord);
        }
        currentWord = '';
      }
    }
    if (currentWord.length >= 2) {
      words.push(currentWord);
    }
    
    // 过滤掉常见的停用词
    const stopWords = new Set(['的', '了', '和', '是', '在', '有', '我', '都', '个', '与', '也', '对', '为', '能', '很', '可以', '就', '不', '会', '要', '没有', '到', '更', '让', '但', '给', '上', '这', '能够', '它', '他', '她', '们', '来', '去', '过', '着', '把', '被', '向', '从', '而', '却', '但是', '然后', '因为', '所以', '如果', '即使', '虽然', '尽管', '而且', '并且', '或者', '还是', '要么', '假如', '假定', '譬如', '例如', '比如', '像是', '像', '似的', '似乎', '好像', '一样', '一般', '通常', '常常', '经常', '往往', '一直', '总是', '千万', '万一', '如果', '若是', '若', '要是', '假如', '假使', '假若', '倘若', '倘使', '设若', '若是', '若果', '如果', '如若', '要是', '若是', '倘或', '倘然', '设或', '设使']);
    
    return words.filter(w => w.length >= 2 || (w.length === 1 && /[\u4e00-\u9fa5]/.test(w) && !stopWords.has(w)));
  };
  
  const correctKeywords = extractKeywords(correctNorm);
  const userKeywords = extractKeywords(userNorm);
  
  // 四舍五入到最近的 0.5
  const roundToHalf = (num: number) => Math.round(num * 2) / 2;
  
  if (correctKeywords.length === 0) {
    // 如果没有提取到关键词，使用相似度计算
    const similarity = calculateSimilarity(userNorm, correctNorm);
    return roundToHalf(similarity * maxPoints);
  }
  
  // 计算匹配的关键词数量
  let matchedKeywords = 0;
  for (const keyword of correctKeywords) {
    // 检查用户答案是否包含该关键词
    if (userNorm.includes(keyword)) {
      matchedKeywords += 1;
    } else {
      // 检查是否有相似的关键词
      for (const userKeyword of userKeywords) {
        if (calculateSimilarity(keyword, userKeyword) > 0.7) {
          matchedKeywords += 0.8; // 相似关键词给80%分数
          break;
        }
      }
    }
  }
  
  // 根据匹配比例计算分数
  const matchRatio = matchedKeywords / correctKeywords.length;
  let score = matchRatio * maxPoints;
  
  // 根据匹配程度给予最低分数保障
  if (matchRatio >= 0.7) {
    // 匹配70%以上，给70%-100%分数
    score = Math.max(score, maxPoints * 0.7);
  } else if (matchRatio >= 0.5) {
    // 匹配50%-70%，给50%-70%分数
    score = Math.max(score, maxPoints * 0.5);
  } else if (matchRatio >= 0.3) {
    // 匹配30%-50%，给30%-50%分数
    score = Math.max(score, maxPoints * 0.3);
  } else if (matchRatio > 0) {
    // 匹配30%以下，按比例给分，但最低10%
    score = Math.max(score, maxPoints * 0.1);
  } else {
    score = 0;
  }
  
  return roundToHalf(score);
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;
  
  const longer = str1.length >= str2.length ? str1 : str2;
  const shorter = str1.length < str2.length ? str1 : str2;
  
  const longerLength = longer.length;
  if (longerLength === 0) return 1;
  
  const matches = [...shorter].filter(char => longer.includes(char)).length;
  return matches / longerLength;
}

export default function Quiz({ 
  group, 
  track,
  onFinish, 
  onExit 
}: { 
  group: 'primary' | 'junior';
  track: 'track1' | 'track2' | 'track3';
  onFinish: (score: number, total: number, results?: { question: Question; userAnswer: string[]; earnedPoints: number; maxPoints: number; isCorrect: boolean }[]) => void;
  onExit: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'partial' | null>(null);
  
  // AI评分相关状态
  const [isAiScoring, setIsAiScoring] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiScore, setAiScore] = useState<number | null>(null);
  
  // 题目切换动画状态
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 记录每道题的答题情况
  const [questionResults, setQuestionResults] = useState<{
    question: Question;
    userAnswer: string[];
    earnedPoints: number;
    maxPoints: number;
    isCorrect: boolean;
  }[]>([]);
  
  // 使用ref来同步记录结果，避免竞态条件
  const questionResultsRef = useRef(questionResults);
  useEffect(() => {
    questionResultsRef.current = questionResults;
  }, [questionResults]);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 随机打乱选项顺序的函数
  const shuffleOptions = (questions: Question[]): Question[] => {
    return questions.map(q => {
      // 只对单选题和多选题打乱选项
      if ((q.type === 'single' || q.type === 'multiple') && q.options) {
        // 深拷贝题目，避免修改原始数据
        const questionCopy = JSON.parse(JSON.stringify(q));
        
        // 创建选项数组并记录原始key
        const optionEntries = Object.entries(questionCopy.options);
        // 随机打乱
        const shuffled = [...optionEntries].sort(() => Math.random() - 0.5);
        
        // 创建新的选项对象
        const newOptions: Record<string, string> = {};
        const keyMapping: Record<string, string> = {}; // 旧key -> 新key
        
        shuffled.forEach(([oldKey, value], index) => {
          const newKey = String.fromCharCode(65 + index); // A, B, C, D...
          newOptions[newKey] = value as string;
          keyMapping[oldKey as string] = newKey;
        });
        
        // 更新答案映射
        let newAnswer: string | string[];
        if (questionCopy.type === 'single') {
          newAnswer = keyMapping[questionCopy.answer as string];
        } else {
          // 多选题
          newAnswer = (questionCopy.answer as string[]).map(oldKey => keyMapping[oldKey]);
        }
        
        return {
          ...questionCopy,
          options: newOptions,
          answer: newAnswer
        };
      }
      // 对于非选择题，直接深拷贝返回
      return JSON.parse(JSON.stringify(q));
    });
  };

  useEffect(() => {
    let filtered = (questionsData as Question[]);

    // 获取并过滤掉最近使用过的题目ID
    const historyKey = `quiz_history_${track}_${group}`;
    const usedIdsRaw = localStorage.getItem(historyKey);
    const usedIds: string[] = usedIdsRaw ? JSON.parse(usedIdsRaw) : [];

    if (track === 'track1') {
      filtered = filtered.filter(q => 
        (group === 'primary' && q.group === 'track1_primary') ||
        (group === 'junior' && q.group === 'track1_junior')
      );
    } else if (track === 'track3') {
      filtered = filtered.filter(q => 
        (group === 'primary' && q.group === 'track3_primary') ||
        (group === 'junior' && q.group === 'track3_junior')
      );
    } else {
      filtered = filtered.filter(q =>
        (group === 'primary' && q.group === 'primary') ||
        (group === 'junior' && q.group === 'junior')
      );
    }

    // 辅助函数：从数组中随机选择指定数量的不重复题目（基于题目正文去重），并优先避开历史题目
    const selectRandomQuestions = (pool: Question[], count: number): Question[] => {
      // 1. 先根据题目文本进行初步去重，确保同一次测试不会出现文本完全相同的题
      const uniquePoolByText: Question[] = [];
      const seenTexts = new Set<string>();
      
      for (const q of pool) {
        const cleanText = q.question.trim();
        if (!seenTexts.has(cleanText)) {
          seenTexts.add(cleanText);
          uniquePoolByText.push(q);
        }
      }

      // 2. 尝试从不在历史记录中的题目中选
      const freshPool = uniquePoolByText.filter(q => !usedIds.includes(q.id));
      
      let selected: Question[] = [];
      if (freshPool.length >= count) {
        // 如果新题足够，直接从新题中随机选
        const shuffled = [...freshPool].sort(() => Math.random() - 0.5);
        selected = shuffled.slice(0, count);
      } else {
        // 如果新题不够，先拿走所有新题，剩下的从旧题（历史记录）中选
        selected = [...freshPool];
        const remainingCount = count - freshPool.length;
        const usedPool = uniquePoolByText.filter(q => usedIds.includes(q.id));
        const shuffledUsed = [...usedPool].sort(() => Math.random() - 0.5);
        selected = [...selected, ...shuffledUsed.slice(0, Math.min(remainingCount, shuffledUsed.length))];
      }
      return selected;
    };

    // 辅助函数：根据题目ID或内容去重
    const removeDuplicates = (questions: Question[]): Question[] => {
      const seenIds = new Set<string>();
      const seenTexts = new Set<string>();
      return questions.filter(q => {
        const cleanText = q.question.trim().replace(/\s+/g, '');
        if (seenIds.has(q.id) || seenTexts.has(cleanText)) {
          return false;
        }
        seenIds.add(q.id);
        seenTexts.add(cleanText);
        return true;
      });
    };

    let selectedQuestions: Question[] = [];

    if (track === 'track3') {
      // 赛道3：单选25% 多选25% 填空50%
      // 设总共20道题：5单选(5分) + 5多选(5分) + 10填空(5分) = 100分
      const singlePool = filtered.filter(q => q.type === 'single');
      const multiPool = filtered.filter(q => q.type === 'multiple');
      const fillPool = filtered.filter(q => q.type === 'fill_in_the_blanks');

      const singleQs = selectRandomQuestions(singlePool, 5);
      const multiQs = selectRandomQuestions(multiPool, 5);
      const fillQs = selectRandomQuestions(fillPool, 10);

      [...singleQs, ...multiQs, ...fillQs].forEach(q => q.points = 5);

      selectedQuestions = removeDuplicates([...singleQs, ...multiQs, ...fillQs]);
    } else if (track === 'track2') {
      // 赛道2：单选10道、多选10道、判断10道、填空10道、简答2道
      const singlePool = filtered.filter(q => q.type === 'single');
      const multiPool = filtered.filter(q => q.type === 'multiple');
      const boolPool = filtered.filter(q => q.type === 'boolean');
      const fillPool = filtered.filter(q => q.type === 'fill_in_the_blanks');
      const shortPool = filtered.filter(q => q.type === 'short_answer');

      const singleQs = selectRandomQuestions(singlePool, 10);
      const multiQs = selectRandomQuestions(multiPool, 10);
      const boolQs = selectRandomQuestions(boolPool, 10);
      const fillQs = selectRandomQuestions(fillPool, 10);
      const shortQs = selectRandomQuestions(shortPool, 2);

      [...singleQs, ...multiQs, ...boolQs, ...fillQs].forEach(q => q.points = 2);
      shortQs.forEach(q => q.points = 10);

      selectedQuestions = removeDuplicates([...singleQs, ...multiQs, ...boolQs, ...fillQs, ...shortQs]);
    } else {
      // 赛道1：单选10道、多选5道、判断5道、主观题1道
      const singlePool = filtered.filter(q => q.type === 'single');
      const multiPool = filtered.filter(q => q.type === 'multiple');
      const boolPool = filtered.filter(q => q.type === 'boolean');
      const shortPool = filtered.filter(q => q.type === 'short_answer');

      const singleQs = selectRandomQuestions(singlePool, 10);
      const multiQs = selectRandomQuestions(multiPool, 5);
      const boolQs = selectRandomQuestions(boolPool, 5);
      const shortQs = selectRandomQuestions(shortPool, 1);

      [...singleQs, ...multiQs, ...boolQs].forEach(q => q.points = 2);
      shortQs.forEach(q => q.points = 60);

      selectedQuestions = removeDuplicates([...singleQs, ...multiQs, ...boolQs, ...shortQs]);
    }

    if (selectedQuestions.length === 0) {
      selectedQuestions = (questionsData as Question[]).slice(0, 10);
    }

    // 随机打乱选项顺序
    selectedQuestions = shuffleOptions(selectedQuestions);

    // 更新历史记录：保存当前选中的题目ID，并限制历史长度（防止以后没题出）
    // 策略：保留最近 3 次测试的题目量（大约 60 道）
    const currentIds = selectedQuestions.map(q => q.id);
    const updatedUsedIds = [...currentIds, ...usedIds].slice(0, 100); 
    localStorage.setItem(historyKey, JSON.stringify(updatedUsedIds));

    setQuestions(selectedQuestions);
    setIsLoading(false);
  }, [group, track]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 时间到，自动提交
          const finalScore = roundToHalf(questionResults.reduce((acc, r) => acc + r.earnedPoints, 0));
          const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
          onFinish(finalScore, totalPoints, questionResults);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions, onFinish, questionResults]);

  const isLast = currentIndex === questions.length - 1;
  const currentQ = questions[currentIndex];
  
  // 获取当前实际渲染的题目（如果是综合题则获取当前子题目）
  const q = currentQ?.type === 'comprehensive' && currentQ.subQuestions 
    ? currentQ.subQuestions[currentSubIndex] 
    : currentQ;

  const handleOptionClick = (optionKey: string) => {
    // 直接从 questions 和 currentIndex 获取当前题目，避免闭包问题
    const q = questions[currentIndex];
    
    // 如果是综合大题，需要获取当前子题目
    const currentQuestion = q.type === 'comprehensive' && q.subQuestions 
      ? q.subQuestions[currentSubIndex] 
      : q;

    if (currentQuestion.type === 'single' || currentQuestion.type === 'boolean') {
      setSelectedAnswers([optionKey]);
    } else if (currentQuestion.type === 'multiple') {
      setSelectedAnswers(prev => 
        prev.includes(optionKey) 
          ? prev.filter(k => k !== optionKey)
          : [...prev, optionKey]
      );
    }
  };

  const handleConfirm = async () => {
    // 获取当前实际题目（如果是综合题则获取当前子题目）
    const q = currentQ.type === 'comprehensive' && currentQ.subQuestions 
      ? currentQ.subQuestions[currentSubIndex] 
      : currentQ;

    if (selectedAnswers.length === 0 && q.type !== 'short_answer' && q.type !== 'fill_in_the_blanks') return;

    let isCorrect = false;
    let earnedPoints = 0;
    
    if (q.type === 'single') {
      isCorrect = selectedAnswers[0] === q.answer;
      earnedPoints = isCorrect ? q.points : 0;
    } else if (q.type === 'boolean') {
      const isUserTrue = selectedAnswers[0] === '正确' || selectedAnswers[0] === 'True' || selectedAnswers[0] === '√' || selectedAnswers[0] === '对';
      
      const answerStr = String(q.answer).trim();
      const isAnswerTrue = answerStr === 'True' || answerStr === '正确' || answerStr === '√' || answerStr === '对';
      const isAnswerFalse = answerStr === 'False' || answerStr === '错误' || answerStr === '×' || answerStr === '错';
      
      if (isAnswerTrue) {
        isCorrect = isUserTrue;
      } else if (isAnswerFalse) {
        isCorrect = !isUserTrue;
      } else {
        isCorrect = false;
      }
      earnedPoints = isCorrect ? q.points : 0;
    } else if (q.type === 'multiple') {
      const correctAnswers = q.answer as string[];
      isCorrect = 
        selectedAnswers.length === correctAnswers.length && 
        selectedAnswers.every(a => correctAnswers.includes(a));
      earnedPoints = isCorrect ? q.points : 0;
    }

    if (q.type === 'fill_in_the_blanks') {
      const userAnswer = selectedAnswers[0] || '';
      const correctAnswer = q.answer as string;
      const points = calculateFillInBlanksScore(userAnswer, correctAnswer, q.points);
      earnedPoints = points;
      isCorrect = points >= q.points;
      
      // 设置反馈
      if (isCorrect) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
      
      // 记录结果
      const result = {
        question: { ...q, id: `${currentQ.id}_${q.id}` } as Question, // 给子题目生成一个唯一ID
        userAnswer: [...selectedAnswers],
        earnedPoints: points,
        maxPoints: q.points,
        isCorrect: isCorrect
      };
      setQuestionResults(prev => [...prev, result]);
      
      // 延迟后自动切题 - 填空题答错后显示1秒，其余显示默认时长
      setTimeout(() => {
        handleNext();
      }, (q.type === 'fill_in_the_blanks' && !isCorrect) ? 1000 : FEEDBACK_DURATION);
      return;
    }

    if (q.type === 'short_answer') {
      const userAnswer = selectedAnswers[0] || '';
      
      // 如果没有输入答案，直接0分
      if (!userAnswer.trim()) {
        setFeedback('wrong');
        const result = {
          question: { ...q, id: `${currentQ.id}_${q.id}` } as Question,
          userAnswer: [...selectedAnswers],
          earnedPoints: 0,
          maxPoints: q.points,
          isCorrect: false
        };
        setQuestionResults(prev => [...prev, result]);
        setTimeout(() => {
          handleNext();
        }, FEEDBACK_DURATION);
        return;
      }
      
      // 使用AI评分
      setIsAiScoring(true);
      setAiFeedback('AI正在评分，请稍候...');
      
      console.log('开始AI评分:', {
        question: q.question,
        referenceAnswer: q.answer,
        userAnswer: userAnswer,
        maxPoints: q.points
      });
      
      try {
        const aiResult = await scoreWithAI(
          q.question,
          q.answer as string,
          userAnswer,
          q.points
        );
        
        console.log('AI评分结果:', aiResult);
        
        earnedPoints = aiResult.score;
        isCorrect = earnedPoints >= q.points * 0.6;
        
        setAiScore(aiResult.score);
        setAiFeedback(aiResult.feedback);
        
        // 设置反馈状态
        if (earnedPoints >= q.points * 0.6) {
          setFeedback('correct');
        } else if (earnedPoints >= q.points * 0.3) {
          setFeedback('partial');
        } else {
          setFeedback('wrong');
        }
        
        // 记录结果
        const result = {
          question: { ...q, id: `${currentQ.id}_${q.id}` } as Question,
          userAnswer: [...selectedAnswers],
          earnedPoints: aiResult.score,
          maxPoints: q.points,
          isCorrect: isCorrect
        };
        setQuestionResults(prev => [...prev, result]);
        
      } catch (error) {
        console.error('AI评分失败:', error);
        // AI评分失败，使用本地评分作为备用
        const correctAnswer = q.answer as string;
        const points = calculateShortAnswerScore(userAnswer, correctAnswer, q.points);
        earnedPoints = points;
        isCorrect = points >= q.points * 0.6;
        
        setAiScore(points);
        setAiFeedback('AI评分服务暂时不可用，已使用本地评分');
        
        if (earnedPoints >= q.points * 0.6) {
          setFeedback('correct');
        } else if (earnedPoints >= q.points * 0.3) {
          setFeedback('partial');
        } else {
          setFeedback('wrong');
        }
        
        const result = {
          question: { ...q, id: `${currentQ.id}_${q.id}` } as Question,
          userAnswer: [...selectedAnswers],
          earnedPoints: points,
          maxPoints: q.points,
          isCorrect: isCorrect
        };
        setQuestionResults(prev => [...prev, result]);
      } finally {
        setIsAiScoring(false);
      }
      
      // AI评分完成后，延迟自动切题
      setTimeout(() => {
        handleNext();
      }, FEEDBACK_DURATION);
      return;
    }

    // 记录选择题结果
    const result = {
      question: currentQ.type === 'comprehensive'
        ? ({ ...q, id: `${currentQ.id}_${q.id}` } as Question)
        : currentQ,
      userAnswer: [...selectedAnswers],
      earnedPoints: earnedPoints,
      maxPoints: q.points,
      isCorrect: isCorrect
    };
    setQuestionResults(prev => [...prev, result]);

    // 设置反馈
    if (isCorrect) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    // 延迟后自动切题
    setTimeout(() => {
      handleNext();
    }, FEEDBACK_DURATION);
  };

  // 四舍五入到最近的 0.5
  const roundToHalf = (num: number) => Math.round(num * 2) / 2;
  
  // 平滑切换到下一题
  const handleNext = useCallback(() => {
    if (isTransitioning) return; // 防止重复触发
    
    // 如果是综合大题，检查是否还有子题目
    if (currentQ.type === 'comprehensive' && currentQ.subQuestions && currentSubIndex < currentQ.subQuestions.length - 1) {
      setSelectedAnswers([]);
      setFeedback(null);
      setIsAiScoring(false);
      setAiFeedback('');
      setAiScore(null);
      setCurrentSubIndex(prev => prev + 1);
      return;
    }

    setIsTransitioning(true);
    setSlideDirection('left'); // 向左滑出
    
    // 等待滑出动画完成后再切换数据
    setTimeout(() => {
      setSelectedAnswers([]);
      setFeedback(null);
      setIsAiScoring(false);
      setAiFeedback('');
      setAiScore(null);
      setCurrentSubIndex(0); // 重置子题目索引
      
      if (isLast) {
        // 计算最终得分并传递详细结果 - 使用ref获取最新数据
        const finalScore = roundToHalf(questionResultsRef.current.reduce((acc, r) => acc + r.earnedPoints, 0));
        const totalPoints = questions.reduce((acc, q) => {
          if (q.type === 'comprehensive' && q.subQuestions) {
            return acc + q.subQuestions.reduce((sum, sub) => sum + sub.points, 0);
          }
          return acc + q.points;
        }, 0);
        onFinish(finalScore, totalPoints, questionResultsRef.current);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      
      // 重置过渡状态
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, SLIDE_DURATION * 1000);
  }, [isTransitioning, isLast, questions, onFinish, currentQ, currentSubIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTypeLabel = (type: string) => {
    // 赛道一的主观题显示为"主观题"，赛道二显示为"简答题"
    if (type === 'short_answer') {
      return track === 'track1' ? '主观题' : '简答题';
    }
    const map: Record<string, string> = {
      single: '单选题',
      multiple: '多选题',
      boolean: '判断题',
      fill_in_the_blanks: '填空题',
      comprehensive: '综合大题'
    };
    return map[type] || '未知题型';
  };

  const getTypeScoreInfo = (type: string) => {
    // 根据当前赛道和题型计算分数
    if (track === 'track3') {
      // 赛道三：单选(25%)+多选(25%)+填空(50%) = 100分
      return { perQuestion: 5, count: 20, total: 100 };
    } else if (track === 'track2') {
      // 赛道二：10单选(2分) + 10多选(2分) + 10判断(2分) + 10填空(2分) + 2简答(10分) = 100分
      const scoreMap: Record<string, number> = {
        single: 2,
        multiple: 2,
        boolean: 2,
        short_answer: 10,
        fill_in_the_blanks: 2
      };
      const countMap: Record<string, number> = {
        single: 10,
        multiple: 10,
        boolean: 10,
        short_answer: 2,
        fill_in_the_blanks: 10
      };
      const perQuestion = scoreMap[type] || 2;
      const count = countMap[type] || 1;
      const total = perQuestion * count;
      return { perQuestion, count, total };
    } else {
      // 赛道一：10单选(2分) + 5多选(2分) + 5判断(2分) + 1简答(60分) = 100分
      const scoreMap: Record<string, number> = {
        single: 2,
        multiple: 2,
        boolean: 2,
        short_answer: 60,
        fill_in_the_blanks: 2
      };
      const countMap: Record<string, number> = {
        single: 10,
        multiple: 5,
        boolean: 5,
        short_answer: 1,
        fill_in_the_blanks: 0
      };
      const perQuestion = scoreMap[type] || 2;
      const count = countMap[type] || 1;
      const total = perQuestion * count;
      return { perQuestion, count, total };
    }
  };

  // 加载状态显示
  if (isLoading || questions.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-xl flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          正在生成专属试卷...
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header Info */}
      <div className="glass-panel bg-white/10 border border-white/20 rounded-2xl p-4 flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-white font-bold text-lg tracking-wider">
            {currentIndex + 1} <span className="text-white/50 text-sm">/ {questions.length}</span>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="text-blue-200 font-medium flex items-center">
            <span className="text-lg font-bold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]">{getTypeLabel(currentQ.type)}</span><span className="ml-3 text-xs bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1.5 rounded-full text-yellow-200 font-medium border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]">每题{(() => {const scoreInfo = getTypeScoreInfo(currentQ.type);return scoreInfo.perQuestion;})()}分，共计{(() => {const scoreInfo = getTypeScoreInfo(currentQ.type);return scoreInfo.total;})()}分</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-amber-300 flex items-center font-mono text-lg bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
            <Clock className="w-5 h-5 mr-2 text-amber-400" />
            {formatTime(timeLeft)}
          </div>
          <button onClick={onExit} className="text-white/60 hover:text-white text-sm ml-4 transition-colors font-medium">
            退出
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden shadow-inner border border-white/5">
        <motion.div 
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ 
            opacity: 0, 
            x: slideDirection === 'left' ? 100 : -100,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            x: slideDirection === 'left' ? -100 : 100,
            scale: 0.95
          }}
          transition={{ 
            duration: SLIDE_DURATION,
            ease: [0.4, 0, 0.2, 1] // 使用缓动函数使动画更自然
          }}
          className="flex-1 flex flex-col min-h-0 glass-card p-4 md:p-8 w-full max-w-6xl mx-auto"
        >
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            {currentQ.type === 'comprehensive' && currentQ.scenario && (
              <div className="mb-6 p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-md border border-blue-500/30">情境背景</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
                <div className="text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {currentQ.scenario}
                </div>
              </div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed drop-shadow-md whitespace-pre-wrap">
              {currentQ.type === 'comprehensive' && currentQ.subQuestions 
                ? `(${currentSubIndex + 1}/${currentQ.subQuestions.length}) ${q.question.replace(/^\d+[.、：:]\s*/, '')}`
                : q.question.replace(/^\d+[.、：:]\s*/, '')}
            </h2>

            <div className="space-y-3">
              {q.type === 'boolean' && (
                <>
                  {['True', 'False'].map(opt => {
                    const isSelected = selectedAnswers.includes(opt);
                    const answerStr = String(q.answer).trim();
                    const isAnswerTrue = answerStr === 'True' || answerStr === '正确' || answerStr === '√' || answerStr === '对';
                    const correctOpt = isAnswerTrue ? 'True' : 'False';
                    const isCorrect = opt === correctOpt;
                    const showResult = feedback !== null;
                    
                    let btnClass = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                    
                    if (showResult) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_4px_15px_rgba(16,185,129,0.2)]';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-red-500/20 border-red-400/50 shadow-[0_4px_15px_rgba(239,68,68,0.2)]';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-blue-500/20 border-blue-400/50 shadow-[0_4px_15px_rgba(59,130,246,0.2)]';
                    }
                    
                    return (
                      <motion.button
                        key={opt}
                        onClick={() => !showResult && handleOptionClick(opt)}
                        disabled={showResult}
                        initial={false}
                        animate={{
                          scale: isSelected ? 1.02 : 1
                        }}
                        transition={{ duration: 0.2 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${btnClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <span className="text-base md:text-lg font-medium text-white">{opt === 'True' ? '正确' : '错误'}</span>
                        {showResult && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </>
              )}

              {(q.type === 'single' || q.type === 'multiple') && q.options && (
                Object.entries(q.options).map(([key, val]) => {
                  const isSelected = selectedAnswers.includes(key);
                  const correctAnswers = q.type === 'multiple' 
                    ? (q.answer as string[]) 
                    : [q.answer as string];
                  const isCorrect = correctAnswers.includes(key);
                  const showResult = feedback !== null; // 提交后显示结果
                  
                  // 根据状态确定样式
                  let optionStateClass = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                  let keyClass = 'bg-white/10 text-white/70';
                  
                  if (showResult) {
                    // 提交后显示正确/错误状态
                    if (isCorrect) {
                      // 正确答案显示绿色
                      optionStateClass = 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_4px_15px_rgba(16,185,129,0.2)]';
                      keyClass = 'bg-emerald-500 text-white';
                    } else if (isSelected && !isCorrect) {
                      // 选错的显示红色
                      optionStateClass = 'bg-red-500/20 border-red-400/50 shadow-[0_4px_15px_rgba(239,68,68,0.2)]';
                      keyClass = 'bg-red-500 text-white';
                    }
                  } else if (isSelected) {
                    // 未提交时，选中状态
                    optionStateClass = 'bg-blue-500/20 border-blue-400/50 shadow-[0_4px_15px_rgba(59,130,246,0.2)]';
                    keyClass = 'bg-blue-500 text-white';
                  }

                  return (
                    <motion.button
                      key={key}
                      onClick={() => !showResult && handleOptionClick(key)}
                      disabled={showResult}
                      initial={false}
                      animate={{
                        scale: isSelected ? 1.02 : 1,
                        backgroundColor: showResult 
                          ? (isCorrect ? 'rgba(16,185,129,0.2)' : (isSelected && !isCorrect ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'))
                          : (isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)')
                      }}
                      transition={{ duration: 0.2 }}
                      className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all flex items-center ${optionStateClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 md:mr-4 font-bold shrink-0 transition-colors ${keyClass}`}>
                        {key}
                      </span>
                      <span className="text-base md:text-lg font-medium text-white">{val}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-400" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 ml-auto text-red-400" />
                      )}
                    </motion.button>
                  );
                })
              )}
              
              {(q.type === 'short_answer' || q.type === 'fill_in_the_blanks') && (
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-2 border-2 border-white/10 focus-within:border-blue-400/50 focus-within:bg-white/10 transition-colors shadow-sm">
                    <textarea
                      key={`q_${currentIndex}_${currentSubIndex}`} // 强制重新渲染 textarea
                      value={selectedAnswers[0] || ''}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      className="w-full h-24 md:h-32 bg-transparent p-3 md:p-4 text-white outline-none resize-none placeholder:text-white/30"
                      placeholder={q.type === 'fill_in_the_blanks' ? "请输入填空答案（数值、代码或符号）..." : "请输入你的答案..."}
                      onChange={(e) => setSelectedAnswers([e.target.value])}
                    />
                  </div>
                  
                  {/* AI评分结果显示 */}
                  {q.type === 'short_answer' && aiScore !== null && (
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 font-bold text-lg">AI评分结果</span>
                        <span className="text-white font-bold text-xl">{aiScore.toFixed(1)}/{q.points}分</span>
                      </div>
                      {aiFeedback && (
                        <p className="text-gray-300 text-sm leading-relaxed">{aiFeedback}</p>
                      )}
                    </div>
                  )}

                  {/* 填空题正确答案显示 */}
                  {q.type === 'fill_in_the_blanks' && feedback !== null && (
                    <div className="bg-emerald-500/20 rounded-xl p-4 border-2 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fadeIn">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          正确答案
                        </span>
                      </div>
                      <p className="text-white text-xl font-bold leading-relaxed bg-black/20 p-3 rounded-lg border border-white/10">
                        {Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative shrink-0">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 mt-4 flex items-center justify-center">
              {isAiScoring ? (
                <div className="text-blue-400 flex items-center bg-blue-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-blue-500/30 backdrop-blur-md">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" /> AI评分中...
                </div>
              ) : (
                <>
                  {feedback === 'correct' && (
                    <div className="text-emerald-400 flex items-center bg-emerald-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-emerald-500/30 backdrop-blur-md">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mr-2" /> 回答正确
                    </div>
                  )}
                  {feedback === 'wrong' && (
                    <div className="text-red-400 flex items-center bg-red-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-red-500/30 backdrop-blur-md">
                      <XCircle className="w-5 h-5 md:w-6 md:h-6 mr-2" /> 回答错误
                    </div>
                  )}
                  {feedback === 'partial' && (
                    <div className="text-amber-400 flex items-center bg-amber-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-amber-500/30 backdrop-blur-md">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mr-2" /> 部分正确
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="text-white/60 text-sm font-medium">
              {currentQ.type === 'comprehensive' && currentQ.subQuestions && (
                <span>第 {currentIndex + 1} 题 · 子问题 {currentSubIndex + 1}/{currentQ.subQuestions.length}</span>
              )}
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={selectedAnswers.length === 0 && q.type !== 'short_answer' && q.type !== 'fill_in_the_blanks'}
              className={`h-12 md:h-14 px-6 md:px-8 rounded-xl transition-all flex items-center justify-center text-white font-bold text-base md:text-lg group z-10 ${
                selectedAnswers.length === 0 && q.type !== 'short_answer' && q.type !== 'fill_in_the_blanks'
                  ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.3)] border border-blue-500/50'
              }`}
            >
              {q.type === 'short_answer' || q.type === 'fill_in_the_blanks' ? '确认答案' : '确认答案'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
