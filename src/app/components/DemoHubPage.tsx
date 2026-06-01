import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Grid3x3, RotateCcw, BookOpen, Calculator } from 'lucide-react';
import { resetDemo } from '../lib/gridErrorMechanism';

const NAVY = '#003459';
const BLUE = '#00A7E1';

function DemoLink({
  to,
  icon,
  title,
  path,
  desc,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  path: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-5 rounded-2xl mb-4 transition-opacity active:opacity-80"
      style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,52,89,0.08)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${BLUE}18` }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{title}</p>
        <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{path}</p>
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </Link>
  );
}

export default function DemoHubPage() {
  return (
    <div
      className="min-h-full flex flex-col px-6 py-12"
      style={{
        background: '#F6FAFD',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        maxWidth: 393,
        margin: '0 auto',
      }}
    >
      <p style={{ fontSize: 13, color: BLUE, fontWeight: 600, marginBottom: 8 }}>本地演示</p>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, marginBottom: 8 }}>原型演示入口</h1>
      <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
        错题格子机制与解析 Tab 专项例题，供产品/设计走查。
      </p>

      <p style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 10 }}>解析 Tab 例题</p>

      <DemoLink
        to="/demo/quiz/scenario"
        icon={<BookOpen color={BLUE} size={24} />}
        title="情境应用 · 检验人「风险」词义"
        path="/demo/quiz/scenario"
        desc="答错/答对后查看解析，含「情境解读」Tab"
      />

      <DemoLink
        to="/demo/quiz/calculation"
        icon={<Calculator color={BLUE} size={24} />}
        title="计算应用 · 比例分摊与起赔额"
        path="/demo/quiz/calculation"
        desc="答错/答对后查看解析，含「计算步骤」Tab"
      />

      <p style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 10, marginTop: 8 }}>错题格子</p>

      <DemoLink
        to="/demo/grid"
        icon={<Grid3x3 color={BLUE} size={24} />}
        title="打开格子 + 错题本演示"
        path="/demo/grid"
        desc="左右滑动章节卡片，点格子练错题"
      />

      <div
        className="rounded-2xl p-4 mb-6 text-sm"
        style={{ background: '#fff', border: '1px solid #E6F4FF', color: '#475569', lineHeight: 1.7 }}
      >
        <p style={{ fontWeight: 600, color: NAVY, marginBottom: 8 }}>格子机制规则</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>灰色 = 未写</li>
          <li>红色数字 = 还需答对几次（1～3）</li>
          <li>绿色 = 已掌握</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => {
          resetDemo();
          alert('已重置演示数据');
        }}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl w-full"
        style={{ border: `1px solid ${BLUE}`, color: NAVY }}
      >
        <RotateCcw size={16} />
        重置全部格子数据
      </button>

      <p className="mt-8 text-xs text-center" style={{ color: '#94A3B8' }}>
        正式页面：
        <Link to="/quiz/basic/1" className="underline ml-1" style={{ color: BLUE }}>
          第一章刷题
        </Link>
        ·
        <Link to="/grid" className="underline ml-1" style={{ color: BLUE }}>
          /grid
        </Link>
        ·
        <Link to="/errors" className="underline ml-1" style={{ color: BLUE }}>
          /errors
        </Link>
      </p>
    </div>
  );
}
