import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { QuizSummaryPage } from './pages/QuizSummaryPage';
import { ReviewPage } from './pages/ReviewPage';
import { CatShopPage } from './pages/CatShopPage';
import { SkyClimberPage } from './pages/SkyClimberPage';
import { CatRunnerPage } from './pages/CatRunnerPage';
import { MemoryMatchPage } from './pages/MemoryMatchPage';

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
            <Route path="/cats" element={<CatShopPage />} />
            <Route path="/game/sky-climber" element={<SkyClimberPage />} />
            <Route path="/game/cat-runner" element={<CatRunnerPage />} />
            <Route path="/game/memory-match" element={<MemoryMatchPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ProgressProvider>
  );
}

export default App;
