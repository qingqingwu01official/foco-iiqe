import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { FocoProfileAvatar } from './FocoAssets';
import {
  IIQE_VOLUMES,
  STUDY_DURATION_OPTIONS,
  computeDailyPlan,
  formatExamDate,
  getCurrentVolumeId,
  getDaysUntilExam,
  getExamDateIso,
  getStudyDuration,
  setCurrentVolumeId,
  setExamDateIso,
  setStudyDuration,
  type StudyDuration,
} from '../lib/profileSettings';

const FONT =
  '-apple-system, BlinkMacSystemFont, "PingFang SC", "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

const CARD: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(0,52,89,0.08)',
  background: 'rgba(255,255,255,0.92)',
  boxShadow: '0 4px 16px rgba(0,52,89,0.06)',
  padding: 16,
};

function PageBackground() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFF 38%, #E5F0FC 72%, #D1E5FA 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -90,
          top: -60,
          width: 360,
          height: 280,
          borderRadius: '50%',
          background:
            'radial-gradient(68% 68% at 30% 35%, rgba(255,255,255,0.95) 0%, rgba(214,231,248,0.38) 65%, rgba(214,231,248,0) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 60,
          top: 380,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background:
            'radial-gradient(64% 64% at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(180,212,241,0.38) 62%, rgba(180,212,241,0) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -120,
          top: 520,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background:
            'radial-gradient(65% 65% at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(178,210,238,0.36) 62%, rgba(178,210,238,0) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.12)',
        }}
      />
    </>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [examDateIso, setExamDateIsoState] = useState(getExamDateIso);
  const [duration, setDurationState] = useState<StudyDuration>(getStudyDuration);
  const [volumeId, setVolumeId] = useState(getCurrentVolumeId);

  const daysLeft = useMemo(() => getDaysUntilExam(), [examDateIso]);
  const examFormatted = useMemo(() => formatExamDate(examDateIso), [examDateIso]);
  const plan = useMemo(() => computeDailyPlan(duration), [duration]);
  const currentVolume = IIQE_VOLUMES.find((v) => v.id === volumeId) ?? IIQE_VOLUMES[0];

  const handleExamDateChange = (value: string) => {
    if (!value) return;
    const iso = new Date(`${value}T00:00:00`).toISOString();
    setExamDateIso(iso);
    setExamDateIsoState(iso);
  };

  const handleDurationChange = (value: StudyDuration) => {
    setStudyDuration(value);
    setDurationState(value);
  };

  const handleVolumeChange = (id: string) => {
    setCurrentVolumeId(id);
    setVolumeId(id);
  };

  const examInputValue = examDateIso.slice(0, 10);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
      }}
    >
      <PageBackground />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: 'var(--foco-header-height)',
          padding: 'var(--foco-header-pt) var(--foco-header-px) var(--foco-header-pb)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/home')}
          aria-label="返回"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: 'none',
            background: 'rgba(0,0,0,0.03)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={20} color="#4E5A67" strokeWidth={2.4} />
        </button>
        <div
          style={{
            height: 30,
            padding: '0 18px',
            borderRadius: 999,
            background: '#003459',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          我的
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          overflowY: 'auto',
          padding: '4px 20px max(32px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* 个人信息卡 */}
        <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              border: '2.5px solid #00A7E1',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.62)',
            }}
          >
            <FocoProfileAvatar size={64} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1F24' }}>FOCO 考生</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#003459',
                  background: 'rgba(0,52,89,0.1)',
                  borderRadius: 999,
                  padding: '3px 8px',
                }}
              >
                IIQE {currentVolume.id}
              </span>
              <span style={{ fontSize: 12, color: '#8E98A8' }}>{currentVolume.subjectName}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#00A7E1' }}>
              今日建议 {plan.total} 题 · 题库≥3遍 + 错题吃透
            </p>
          </div>
        </div>

        {/* 学习数据摘要 */}
        <div style={{ ...CARD, display: 'flex', padding: '14px 16px' }}>
          {[
            { value: '81', label: '已练题量' },
            { value: '127', label: '待吃透错题' },
            { value: '12', label: '笔记条数' },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#1A1F24',
                  fontFamily: '"SF Compact Rounded", "SF Pro Display", sans-serif',
                }}
              >
                {item.value}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8E98A8' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* 考试时间 */}
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1F24' }}>考试时间</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#003459',
                background: 'rgba(0,52,89,0.08)',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              IIQE {currentVolume.id}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = dateInputRef.current;
              if (!el) return;
              if (typeof el.showPicker === 'function') el.showPicker();
              else el.click();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 14,
              background: '#F2F4F6',
              border: '1px solid rgba(0,52,89,0.06)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0,167,225,0.14)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#003459',
                flexShrink: 0,
              }}
            >
              {new Date(examDateIso).getDate()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1A1F24' }}>
                {examFormatted.main} · {examFormatted.weekday}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8E98A8' }}>
                距考试还有 {daysLeft} 天 · 同步首页倒计时
              </p>
            </div>
            <span style={{ fontSize: 20, color: '#8E98A8' }}>›</span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={examInputValue}
            onChange={(e) => handleExamDateChange(e.target.value)}
            aria-label="选择考试日期"
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />
        </div>

        {/* 备考策略 */}
        <div style={CARD}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1F24' }}>备考策略</p>
          <p style={{ margin: '8px 0 12px', fontSize: 12, color: '#8E98A8', lineHeight: 1.45 }}>
            设置每日可支配学习时间，系统将拆分「题库巩固」与「错题吃透」任务
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[STUDY_DURATION_OPTIONS.slice(0, 2), STUDY_DURATION_OPTIONS.slice(2)].map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                {row.map((opt) => {
                  const active = duration === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleDurationChange(opt.value)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 999,
                        border: active ? 'none' : '1px solid rgba(0,52,89,0.12)',
                        background: active ? '#003459' : '#fff',
                        color: active ? '#fff' : '#8E98A8',
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {[
              { title: '题库巩固', num: plan.consolidate, sub: '全库目标 ≥3 遍', tint: '#003459' },
              { title: '错题吃透', num: plan.errorDigest, sub: '连对 2 次 + 看解析', tint: '#00A7E1' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  padding: 12,
                  background: `${item.tint}1F`,
                  border: `1px solid ${item.tint}33`,
                }}
              >
                <p style={{ margin: 0, fontSize: 11, color: '#8E98A8' }}>{item.title}</p>
                <p style={{ margin: '4px 0', fontSize: 20, fontWeight: 700, color: '#003459' }}>
                  {item.num} 题/天
                </p>
                <p style={{ margin: 0, fontSize: 10, color: '#8E98A8' }}>{item.sub}</p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              borderRadius: 12,
              padding: '10px 14px',
              background: 'rgba(0,52,89,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: '#8E98A8' }}>今日建议总量</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#003459' }}>{plan.total} 题</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ margin: 0, fontSize: 10, color: '#8E98A8', lineHeight: 1.4 }}>
              · 题库：每题累计练习 ≥3 次，或完成 ≥3 轮全覆盖
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#8E98A8', lineHeight: 1.4 }}>
              · 错题：重做连对 2 次且至少看过 1 次完整解析
            </p>
          </div>
        </div>

        {/* 切换卷次 */}
        <div style={CARD}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1F24' }}>切换卷次</p>
          <p style={{ margin: '8px 0 12px', fontSize: 12, color: '#8E98A8' }}>
            切换后将进入对应卷次的备考界面与题库
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {IIQE_VOLUMES.map((vol) => {
              const current = vol.id === volumeId;
              return (
                <button
                  key={vol.id}
                  type="button"
                  onClick={() => handleVolumeChange(vol.id)}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '11px 12px',
                    border: current ? '1px solid rgba(0,52,89,0.22)' : 'none',
                    background: current ? 'rgba(0,52,89,0.08)' : '#F2F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: current ? 600 : 400,
                        color: current ? '#003459' : '#1A1F24',
                      }}
                    >
                      {vol.id} · {vol.subjectName}
                    </p>
                    {current && (
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: '#00A7E1' }}>当前备考卷次</p>
                    )}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: current ? '#003459' : '#8E98A8' }}>
                    {current ? '✓' : '›'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
