import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import HomePage from './components/HomePage';
import ChapterListPage from './components/ChapterListPage';
import LibrarySelectPage from './components/LibrarySelectPage';
import QuizPage from './components/QuizPage';
import QuizPracticeCompletePage from './components/QuizPracticeCompletePage';
import GridOverviewPage from './components/GridOverviewPage';
import ErrorBookPage from './components/ErrorBookPage';
import DesignSpecPage from './components/DesignSpecPage';
import SearchPage from './components/SearchPage';
import DemoHubPage from './components/DemoHubPage';
import GridErrorDemoPage from './components/GridErrorDemoPage';
import ScenarioQuizDemoPage from './components/demo/ScenarioQuizDemoPage';
import CalculationQuizDemoPage from './components/demo/CalculationQuizDemoPage';
import VideoListPage from './components/VideoListPage';
import NotesPage from './components/NotesPage';
import ProfilePage from './components/ProfilePage';
import StatsPage from './components/StatsPage';

// Force QuizPage to remount on every navigation (so questionIndex from state takes effect)
function KeyedQuizPage() {
  const location = useLocation();
  return <QuizPage key={location.key} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full" style={{ background: '#003459' }}>
        <Routes>
          {/* ── 首页（入口） ── */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />

          {/* ── 打基础流 ── */}
          <Route path="/basic/chapters" element={<ChapterListPage />} />

          {/* ── 考前冲刺流 ── */}
          <Route path="/sprint/libraries" element={<LibrarySelectPage />} />

          {/* ── 刷题 + 解析 ── */}
          <Route path="/quiz" element={<KeyedQuizPage />} />
          <Route path="/quiz/:mode/:id" element={<KeyedQuizPage />} />
          <Route path="/quiz/:mode/:id/complete" element={<QuizPracticeCompletePage />} />
          <Route path="/analysis" element={<Navigate to="/quiz" replace />} />

          {/* ── 错题 + 格子 ── */}
          <Route path="/errors" element={<ErrorBookPage />} />
          <Route path="/grid" element={<GridOverviewPage />} />

          {/* ── 难点集解 ── */}
          <Route path="/videos" element={<VideoListPage />} />

          {/* ── 笔记 ── */}
          <Route path="/notes" element={<NotesPage />} />

          {/* ── 数据台 ── */}
          <Route path="/stats" element={<StatsPage />} />

          {/* ── 我的 / 个人中心 ── */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* ── 其他 ── */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/design" element={<DesignSpecPage />} />
          <Route path="/demo" element={<DemoHubPage />} />
          <Route path="/demo/grid" element={<GridErrorDemoPage />} />
          <Route path="/demo/quiz/scenario" element={<ScenarioQuizDemoPage />} />
          <Route path="/demo/quiz/calculation" element={<CalculationQuizDemoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
