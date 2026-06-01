/**
 * 解析页底部扩展区展示模式（与后端题目属性对应）：
 * - none：默认态，普通题，无扩展区
 * - deep：深度态，难题，深度解析 + 视频
 * - errorProne：易错态，普通题 + 易错数据，易错提醒图文
 */
export type AnalysisExtendMode = 'none' | 'deep' | 'errorProne';

/** 题目考察方式 —— 上传时写入，用于匹配解析 Tab */
export type ExamMethod = '常规' | '情境应用' | '计算应用';

/**
 * 解析内容字段 —— 与后端 / 数据库字段一致，不是前端 UI 板块 ID。
 */
export type AnalysisField =
  | '解题'
  | '知识块'
  | '选项分析'
  | '情境解读'
  | '计算步骤';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

/** 解析 Tab id（与后端解析字段 / 选项字母对应） */
export type ConfusionTabId = '知识块' | '解题' | '情境解读' | '计算步骤' | OptionKey;

/** 后端返回的单条解析句段 */
export interface AnalysisSegment {
  id: string;
  field: AnalysisField;
  /** field 为「选项分析」时必填 */
  optionKey?: OptionKey;
  content: string;
}

export interface ConfusionTabDef {
  id: ConfusionTabId;
  label: string;
  field: AnalysisField;
  optionKey?: OptionKey;
}

/** Tab 元数据：id → 展示文案与字段映射 */
export const CONFUSION_TAB_DEFS: Record<ConfusionTabId, ConfusionTabDef> = {
  知识块: { id: '知识块', label: '理解知识点', field: '知识块' },
  A: { id: 'A', label: 'A', field: '选项分析', optionKey: 'A' },
  B: { id: 'B', label: 'B', field: '选项分析', optionKey: 'B' },
  C: { id: 'C', label: 'C', field: '选项分析', optionKey: 'C' },
  D: { id: 'D', label: 'D', field: '选项分析', optionKey: 'D' },
  情境解读: { id: '情境解读', label: '情境解读', field: '情境解读' },
  计算步骤: { id: '计算步骤', label: '计算步骤', field: '计算步骤' },
  解题: { id: '解题', label: '注意陷阱', field: '解题' },
};

/** 解析 Tab 展示顺序（仅展示当前题目实际拥有的 Tab） */
const TAB_DISPLAY_ORDER: ConfusionTabId[] = [
  '知识块',
  'A',
  'B',
  'C',
  'D',
  '情境解读',
  '计算步骤',
  '解题',
];

function hasSegment(
  segments: AnalysisSegment[],
  field: AnalysisField,
  optionKey?: OptionKey,
): boolean {
  return segments.some((seg) => {
    if (seg.field !== field) return false;
    if (field === '选项分析') return seg.optionKey === optionKey;
    return true;
  });
}

/**
 * 根据题目考察方式 + 解析句段字段，解析本题应展示的 Tab 列表。
 * - 常规：理解知识点、A–D（有句段时展示）
 * - 有陷阱句段（field=解题）：追加「注意陷阱」
 * - 情境应用 / 含情境解读句段：追加「情境解读」
 * - 计算应用 / 含计算步骤句段：追加「计算步骤」
 */
export function resolveAnalysisTabs(
  segments: AnalysisSegment[],
  examMethod: ExamMethod = '常规',
): ConfusionTabDef[] {
  const ids = new Set<ConfusionTabId>();

  if (hasSegment(segments, '知识块')) ids.add('知识块');

  (['A', 'B', 'C', 'D'] as const).forEach((key) => {
    if (hasSegment(segments, '选项分析', key)) ids.add(key);
  });

  if (examMethod === '情境应用' || hasSegment(segments, '情境解读')) {
    ids.add('情境解读');
  }

  if (examMethod === '计算应用' || hasSegment(segments, '计算步骤')) {
    ids.add('计算步骤');
  }

  if (hasSegment(segments, '解题')) {
    ids.add('解题');
  }

  return TAB_DISPLAY_ORDER.filter((id) => ids.has(id)).map((id) => CONFUSION_TAB_DEFS[id]);
}

/** 默认高亮 Tab：优先「理解知识点」，否则取第一个可用 Tab */
export function defaultAnalysisTabId(tabs: ConfusionTabDef[]): ConfusionTabId {
  return tabs.find((t) => t.id === '知识块')?.id ?? tabs[0]?.id ?? '知识块';
}

/** @deprecated 使用 resolveAnalysisTabs；保留供旧引用 */
export const CONFUSION_TABS = TAB_DISPLAY_ORDER.map((id) => CONFUSION_TAB_DEFS[id]);

export function segmentMatchesTabs(
  segment: AnalysisSegment,
  activeTabs: ReadonlySet<ConfusionTabId>,
): boolean {
  if (activeTabs.size === 0) return false;

  for (const tabId of activeTabs) {
    const tab = CONFUSION_TAB_DEFS[tabId];
    if (!tab) continue;
    if (segment.field !== tab.field) continue;
    if (segment.field === '选项分析') {
      if (segment.optionKey === tab.optionKey) return true;
    } else {
      return true;
    }
  }
  return false;
}

function segmentNoteLabel(segment: AnalysisSegment): string {
  if (segment.field === '选项分析' && segment.optionKey) {
    return `【选项 ${segment.optionKey}】`;
  }
  const tab = Object.values(CONFUSION_TAB_DEFS).find((item) => item.field === segment.field);
  return `【${tab?.label ?? segment.field}】`;
}

/** 收集当前 Tab 高亮中的解析句段，供刷题笔记一键写入 */
export function collectHighlightedAnalysisText(
  segments: AnalysisSegment[],
  activeTabs: ReadonlySet<ConfusionTabId>,
): string {
  return segments
    .filter((seg) => segmentMatchesTabs(seg, activeTabs))
    .map((seg) => `${segmentNoteLabel(seg)}\n${seg.content.trim()}`)
    .join('\n\n');
}

export function countHighlightedSegments(
  segments: AnalysisSegment[],
  activeTabs: ReadonlySet<ConfusionTabId>,
): number {
  return segments.filter((seg) => segmentMatchesTabs(seg, activeTabs)).length;
}

export function toggleConfusionTab(
  prev: Set<ConfusionTabId>,
  tabId: ConfusionTabId,
): Set<ConfusionTabId> {
  const next = new Set(prev);
  if (next.has(tabId)) next.delete(tabId);
  else next.add(tabId);
  return next;
}
