export type QaQuestionContext = {
  questionText: string;
  options: string[];
  topic?: string;
  selectedAnswerIndex?: number | null;
};

export const DEFAULT_QA_AI_NOTE_BODY = `• 风险投机不是风险管理核心步骤
• 正确链路：识别→评估→应对→监控

• 误选来源：把「收益导向」误当管理导向
• 记忆法：管理是控风险，不是搏收益`;

export type QaFeedbackOption = { id: string; label: string };

export function labelsFromFeedbackIds(options: QaFeedbackOption[], ids: ReadonlySet<string>) {
  return options.filter((item) => ids.has(item.id)).map((item) => item.label);
}

export function buildConfusionUserMessage(labels: string[]) {
  if (labels.length === 0) return '请老师帮我讲解这道题。';
  return `我在这道题上有以下不懂：${labels.join('、')}`;
}

export function buildTeacherOpening(labels: string[]) {
  if (labels.length === 0) return '好的，我先帮你看一下这道题的整体思路。';
  const hasOption = labels.some((l) => l.endsWith('不懂') && l.length <= 3);
  if (hasOption) {
    return `你标记了 ${labels.join('、')}，我先用对比法帮你拆解相关选项。`;
  }
  return `你提到 ${labels.join('、')}，我们从题干和知识点两部分来看。`;
}

/** 原型：根据追问内容生成老师回复 */
export function buildTeacherFollowUpReply(userText: string) {
  const text = userText.trim();
  if (!text) return '';
  if (/选项|[ABCDabcd]/.test(text)) {
    return '可以先排除明显不属于流程的选项，再对照题干关键词逐项验证。';
  }
  if (/区别|不同|怎么分|如何区分|差别/.test(text)) {
    return '抓住核心目标：管理侧重控风险，投机侧重博收益；用这个标准回看各选项。';
  }
  if (/例子|举例|案例|比如/.test(text)) {
    return '例如对冲是用衍生品锁定价差，属于管理；买彩票博取超额收益更接近投机。';
  }
  if (/笔记|整理|总结/.test(text)) {
    return '聊得差不多了可以点下方「AI整理答疑笔记」，我会把要点帮你收成笔记。';
  }
  return '好的，你先把刚才不懂的点再对照解析看一遍；还有疑问可以继续追问。';
}
