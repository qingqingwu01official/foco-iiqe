import QuizPage from '../QuizPage';
import { CALCULATION_DEMO_META, CALCULATION_DEMO_QUESTIONS } from '../../data/demoCalculationQuiz';

export default function CalculationQuizDemoPage() {
  return (
    <QuizPage
      questions={CALCULATION_DEMO_QUESTIONS}
      headerTitle={CALCULATION_DEMO_META.headerTitle}
      headerSubtitle={CALCULATION_DEMO_META.headerSubtitle}
      displayTotalQ={1}
    />
  );
}
