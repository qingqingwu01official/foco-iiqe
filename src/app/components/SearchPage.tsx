import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, Search, X, ChevronRight, BookOpen, Zap } from 'lucide-react';

/* ── Mock question bank ───────────────────────────── */
const ALL_QUESTIONS = [
  // Chapter 1
  { id: 1,  chapterId: 1, chapter: '第一章', library: 'critical', text: '风险管理中「风险」的三种含义分别是什么？', level: '重中之重', stars: 2 },
  { id: 2,  chapterId: 1, chapter: '第一章', library: 'critical', text: '保险合同中「最大诚信原则」的主要内容是什么？', level: '重中之重', stars: 2 },
  { id: 3,  chapterId: 1, chapter: '第一章', library: 'important', text: '可保利益原则在财产保险和人身保险中的差异。', level: '次重点', stars: 1 },
  { id: 4,  chapterId: 1, chapter: '第一章', library: 'important', text: '代位追偿原则的适用范围及限制条件。', level: '次重点', stars: 1 },
  { id: 5,  chapterId: 1, chapter: '第一章', library: 'normal', text: '损失补偿原则的基本含义与例外情形。', level: '一般考点', stars: 0 },
  // Chapter 2
  { id: 6,  chapterId: 2, chapter: '第二章', library: 'critical', text: '保险合约成立的要件及书面合同的法律效力。', level: '重中之重', stars: 2 },
  { id: 7,  chapterId: 2, chapter: '第二章', library: 'critical', text: '要约与承诺在保险合同订立过程中的作用。', level: '重中之重', stars: 2 },
  { id: 8,  chapterId: 2, chapter: '第二章', library: 'important', text: '保险单与暂保单的法律地位有何不同？', level: '次重点', stars: 1 },
  { id: 9,  chapterId: 2, chapter: '第二章', library: 'normal', text: '保险合同的主要条款包括哪些内容？', level: '一般考点', stars: 0 },
  { id: 10, chapterId: 2, chapter: '第二章', library: 'extra', text: '电子保单的法律认可现状与发展趋势。', level: '补充考点', stars: 0 },
  // Chapter 3
  { id: 11, chapterId: 3, chapter: '第三章', library: 'critical', text: '一般保险的承保范围与除外责任的主要类别。', level: '重中之重', stars: 2 },
  { id: 12, chapterId: 3, chapter: '第三章', library: 'critical', text: '火险保单中「火灾」的法律定义及承保条件。', level: '重中之重', stars: 2 },
  { id: 13, chapterId: 3, chapter: '第三章', library: 'important', text: '家居综合保险的主要保障内容及常见附加险。', level: '次重点', stars: 1 },
  { id: 14, chapterId: 3, chapter: '第三章', library: 'important', text: '商业火险与家居火险的核保差异。', level: '次重点', stars: 1 },
  // Chapter 4
  { id: 15, chapterId: 4, chapter: '第四章', library: 'critical', text: '责任保险中「第三者」的法律定义。', level: '重中之重', stars: 2 },
  { id: 16, chapterId: 4, chapter: '第四章', library: 'important', text: '公众责任保险与产品责任保险的承保差异。', level: '次重点', stars: 1 },
  { id: 17, chapterId: 4, chapter: '第四章', library: 'normal', text: '雇主责任保险的法定要求及承保范围。', level: '一般考点', stars: 0 },
  // Chapter 5
  { id: 18, chapterId: 5, chapter: '第五章', library: 'critical', text: '汽车保险的强制第三者责任险（三保）承保要求。', level: '重中之重', stars: 2 },
  { id: 19, chapterId: 5, chapter: '第五章', library: 'important', text: '综合汽车险的主要保障项目及免赔额计算。', level: '次重点', stars: 1 },
  { id: 20, chapterId: 5, chapter: '第五章', library: 'normal', text: '无索偿折扣（NCD）的计算规则及转让条件。', level: '一般考点', stars: 0 },
  // Chapter 6
  { id: 21, chapterId: 6, chapter: '第六章', library: 'important', text: '员工补偿保险的法定保障范围与赔偿计算。', level: '次重点', stars: 1 },
  { id: 22, chapterId: 6, chapter: '第六章', library: 'normal', text: '《雇员补偿条例》对承保工伤的定义。', level: '一般考点', stars: 0 },
  // Chapter 7
  { id: 23, chapterId: 7, chapter: '第七章', library: 'critical', text: '再保险的主要类型：比例再保险与非比例再保险的区别。', level: '重中之重', stars: 2 },
  { id: 24, chapterId: 7, chapter: '第七章', library: 'important', text: '成数再保险与超额赔款再保险的运作原理。', level: '次重点', stars: 1 },
  { id: 25, chapterId: 7, chapter: '第七章', library: 'extra', text: '再保险经纪人在分保安排中的职责。', level: '补充考点', stars: 0 },
];

const HOT_SEARCHES = ['风险管理', '最大诚信', '保险合约', '再保险', '责任保险', '汽车三保', '代位追偿'];

const LEVEL_COLOR: Record<string, string> = {
  '重中之重': 'var(--foco-red)',
  '次重点':   'var(--foco-orange)',
  '一般考点': 'var(--foco-blue)',
  '补充考点': 'var(--foco-text-secondary)',
};

const LEVEL_BG: Record<string, string> = {
  '重中之重': 'var(--foco-red-light)',
  '次重点':   'var(--foco-orange-light)',
  '一般考点': 'var(--foco-blue-light)',
  '补充考点': 'rgba(142,152,168,0.1)',
};

const LIBRARY_MAP: Record<string, string> = {
  critical:  '重中之重',
  important: '次重点',
  normal:    '一般考点',
  extra:     '补充考点',
};

type Question = typeof ALL_QUESTIONS[0];

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: 'rgba(0,167,225,0.18)', color: 'var(--foco-navy)', borderRadius: 3, padding: '0 1px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state as any)?.mode ?? 'basic';
  const isBasic = mode === 'basic';

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const trimmed = query.trim();
  const results: Question[] = trimmed.length < 1
    ? []
    : ALL_QUESTIONS.filter((q) =>
        q.text.includes(trimmed) ||
        q.chapter.includes(trimmed) ||
        q.level.includes(trimmed) ||
        (LIBRARY_MAP[q.library] ?? '').includes(trimmed),
      );

  const handleSelect = (q: Question) => {
    const routeId = isBasic ? String(q.chapterId) : q.library;
    navigate(`/quiz/${mode}/${routeId}`, {
      state: { mode, questionIndex: q.id - 1, fromSearch: true },
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--foco-bg)',
        fontFamily: 'var(--foco-font)',
      }}
    >
      {/* ── Header ── */}
      <div style={{ background: 'var(--foco-navy)', paddingTop: 'var(--foco-header-pt)', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 var(--foco-page-x) var(--foco-header-pb)',
          }}
        >
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--foco-radius-full)',
              background: 'var(--foco-border-dark)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ChevronLeft style={{ width: 20, height: 20, color: 'var(--foco-text-on-dark)' }} />
          </button>

          {/* Search input */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 'var(--foco-radius-lg)',
              padding: '10px 14px',
            }}
          >
            <Search style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索题目关键词、章节…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--foco-text-on-dark)',
                fontSize: 15,
                fontFamily: 'var(--foco-font)',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.45)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Mode badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 var(--foco-page-x) 14px',
          }}
        >
          {isBasic
            ? <BookOpen style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.45)' }} />
            : <Zap style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.45)' }} />}
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
            {isBasic ? '打基础模式' : '考前冲刺模式'} · {ALL_QUESTIONS.length} 道题
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px var(--foco-page-x)' }}>

        {/* Empty state: hot searches */}
        {!trimmed && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foco-text-secondary)', marginBottom: 12, letterSpacing: '0.04em' }}>
              热门搜索
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {HOT_SEARCHES.map((kw) => (
                <button
                  key={kw}
                  onClick={() => setQuery(kw)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--foco-radius-full)',
                    background: 'var(--foco-surface)',
                    border: '1.5px solid var(--foco-border)',
                    fontSize: 13,
                    color: 'var(--foco-text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--foco-font)',
                    boxShadow: 'var(--foco-shadow-card)',
                  }}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Category quick filter */}
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foco-text-secondary)', marginBottom: 12, letterSpacing: '0.04em' }}>
              按重要性筛选
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['重中之重', '次重点', '一般考点', '补充考点'].map((lvl) => {
                const count = ALL_QUESTIONS.filter((q) => q.level === lvl).length;
                return (
                  <button
                    key={lvl}
                    onClick={() => setQuery(lvl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px var(--foco-card-p)',
                      borderRadius: 'var(--foco-radius-lg)',
                      background: 'var(--foco-surface)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: 'var(--foco-shadow-card)',
                      fontFamily: 'var(--foco-font)',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: LEVEL_COLOR[lvl],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 15, color: 'var(--foco-text-primary)' }}>{lvl}</span>
                    <span style={{ fontSize: 13, color: 'var(--foco-text-secondary)' }}>{count} 题</span>
                    <ChevronRight style={{ width: 14, height: 14, color: 'var(--foco-text-muted)' }} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Results */}
        {trimmed.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: 'var(--foco-text-secondary)', marginBottom: 14 }}>
              {results.length > 0
                ? `找到 ${results.length} 道相关题目`
                : `未找到与「${trimmed}」相关的题目`}
            </p>

            {results.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 15, color: 'var(--foco-text-secondary)', margin: 0 }}>换个关键词试试</p>
                <p style={{ fontSize: 13, color: 'var(--foco-text-muted)', marginTop: 6 }}>
                  可以搜索章节名、考点内容或重要性等级
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelect(q)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: 'var(--foco-card-p)',
                    borderRadius: 'var(--foco-radius-lg)',
                    background: 'var(--foco-surface)',
                    border: '1.5px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: 'var(--foco-shadow-card)',
                    fontFamily: 'var(--foco-font)',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--foco-blue)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  {/* Level dot */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 'var(--foco-radius-full)',
                      background: LEVEL_COLOR[q.level],
                      flexShrink: 0,
                      marginTop: 6,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 'var(--foco-radius-full)',
                          background: 'var(--foco-navy-light)',
                          color: 'var(--foco-navy)',
                          fontWeight: 600,
                        }}
                      >
                        {q.chapter}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 'var(--foco-radius-full)',
                          background: LEVEL_BG[q.level],
                          color: LEVEL_COLOR[q.level],
                          fontWeight: 600,
                        }}
                      >
                        {q.level}
                      </span>
                      {q.stars > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--foco-orange)' }}>
                          {'★'.repeat(q.stars)}
                        </span>
                      )}
                    </div>

                    {/* Question text with highlight */}
                    <p style={{ fontSize: 14, color: 'var(--foco-text-primary)', lineHeight: 1.55, margin: 0 }}>
                      {highlight(q.text, trimmed)}
                    </p>
                  </div>

                  <ChevronRight style={{ width: 15, height: 15, color: 'var(--foco-text-muted)', flexShrink: 0, marginTop: 2 }} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
