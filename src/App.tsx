import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { QuizSummaryPage } from './pages/QuizSummaryPage';
import { ReviewPage } from './pages/ReviewPage';

function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/summary" element={<QuizSummaryPage />} />
            <Route path="/review" element={<ReviewPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ProgressProvider>
  );
}

export default App;
