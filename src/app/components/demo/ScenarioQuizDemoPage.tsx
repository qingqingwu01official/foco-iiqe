import QuizPage from '../QuizPage';
import { SCENARIO_DEMO_META, SCENARIO_DEMO_QUESTIONS } from '../../data/demoScenarioQuiz';

export default function ScenarioQuizDemoPage() {
  return (
    <QuizPage
      questions={SCENARIO_DEMO_QUESTIONS}
      headerTitle={SCENARIO_DEMO_META.headerTitle}
      headerSubtitle={SCENARIO_DEMO_META.headerSubtitle}
      displayTotalQ={1}
    />
  );
}
