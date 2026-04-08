# AI大模型评分接入指南

## 概述

本系统支持接入AI大模型API对主观题进行自动评分，支持以下模型：
- OpenAI GPT-3.5/GPT-4
- 百度文心一言
- 阿里通义千问
- 智谱GLM-4

## 快速开始

### 1. 配置API密钥

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的API密钥：

```env
# OpenAI配置（推荐）
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-3.5-turbo

# 启用AI评分
VITE_ENABLE_AI_SCORING=true
```

### 2. 安装依赖

```bash
npm install
```

### 3. 使用AI评分

在 `Quiz.tsx` 中引入评分服务：

```typescript
import { scoreWithAI, aiScoringConfig } from '../services/aiScoring';

// 在主观题评分时调用
const handleConfirm = async () => {
  if (currentQ.type === 'short_answer') {
    const result = await scoreWithAI(
      currentQ.question,
      currentQ.answer,
      userAnswer,
      currentQ.points,
      aiScoringConfig
    );
    
    setScore(result.score);
    setFeedback(result.feedback);
  }
};
```

## API提供商配置

### OpenAI（推荐）

1. 访问 https://platform.openai.com/
2. 注册账号并创建API密钥
3. 在 `.env` 中配置：

```env
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-3.5-turbo
```

**价格参考**：
- GPT-3.5-turbo: $0.002/1K tokens
- GPT-4: $0.03/1K tokens

### 百度文心一言

1. 访问 https://cloud.baidu.com/
2. 创建应用并获取API Key和Secret Key
3. 在 `.env` 中配置：

```env
VITE_BAIDU_API_KEY=your_api_key
VITE_BAIDU_SECRET_KEY=your_secret_key
```

### 阿里通义千问

1. 访问 https://dashscope.aliyun.com/
2. 创建API密钥
3. 在 `.env` 中配置：

```env
VITE_ALIYUN_API_KEY=your_api_key
```

### 智谱GLM-4

1. 访问 https://open.bigmodel.cn/
2. 创建API密钥
3. 在 `.env` 中配置：

```env
VITE_ZHIPU_API_KEY=your_api_key
```

## 评分流程

```
用户提交答案
    ↓
系统调用AI评分API
    ↓
AI返回评分结果（0-10分）
    ↓
系统转换为实际分数
    ↓
显示分数和评语
```

## 评分标准

AI评分基于以下维度：

1. **内容准确性（40%）**：是否包含核心知识点
2. **完整性（30%）**：是否覆盖答案要点
3. **表达清晰度（20%）**：逻辑是否清晰
4. **创新性（10%）**：是否有独到见解

## 注意事项

1. **API费用**：AI评分会产生API调用费用，请合理控制使用频率
2. **网络依赖**：需要稳定的网络连接
3. **评分延迟**：AI评分需要1-3秒，建议添加加载动画
4. **备用方案**：建议保留本地评分作为备用方案

## 费用估算

以1000道主观题为例：

| 模型 | 单价 | 预估费用 |
|-----|------|---------|
| GPT-3.5 | $0.002/1K tokens | ~$2-4 |
| GPT-4 | $0.03/1K tokens | ~$30-60 |
| 文心一言 | 按量计费 | ~¥10-20 |
| 通义千问 | 按量计费 | ~¥10-20 |

## 测试

运行测试脚本验证AI评分：

```bash
npm run test:ai-scoring
```

## 常见问题

**Q: API密钥泄露怎么办？**
A: 立即在对应平台撤销该密钥并重新生成。

**Q: 评分不准确怎么办？**
A: 可以调整Prompt或改用更强大的模型（如GPT-4）。

**Q: 网络不稳定怎么办？**
A: 可以实现重试机制或降级到本地评分。

## 技术支持

如有问题，请联系开发团队。
