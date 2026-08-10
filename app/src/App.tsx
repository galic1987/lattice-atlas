import { Suspense, lazy, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import AppErrorBoundary from '@/components/AppErrorBoundary';
import ScrollToTop from '@/components/ScrollToTop';

const Home = lazy(() => import('@/pages/Home'));
const KnowledgeMap = lazy(() => import('@/pages/KnowledgeMap'));
const LearningPath = lazy(() => import('@/pages/LearningPath'));
const SurfaceCodeLab = lazy(() => import('@/pages/SurfaceCodeLab'));
const ExperimentBench = lazy(() => import('@/pages/ExperimentBench'));
const Papers = lazy(() => import('@/pages/Papers'));
const FieldToday = lazy(() => import('@/pages/FieldToday'));
const Glossary = lazy(() => import('@/pages/Glossary'));
const Review = lazy(() => import('@/pages/Review'));
const DecoderDuel = lazy(() => import('@/pages/DecoderDuel'));
const FoundationsLab = lazy(() => import('@/pages/FoundationsLab'));
const Altitudes = lazy(() => import('@/pages/Altitudes'));
const Capstone = lazy(() => import('@/pages/Capstone'));
const LatticeSurgeryLab = lazy(() => import('@/pages/LatticeSurgeryLab'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center font-mono text-sm text-text-low" role="status" aria-live="polite">
      loading…
    </div>
  );
}

function lazyPage(element: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export default function App() {
  const location = useLocation();

  return (
    <AppErrorBoundary resetKey={location.pathname}>
      <ScrollToTop />
      <Routes location={location}>
        <Route element={<Layout />}>
          <Route index element={lazyPage(<Home />)} />
          <Route path="map" element={lazyPage(<KnowledgeMap />)} />
          <Route path="path" element={lazyPage(<LearningPath />)} />
          <Route path="lab" element={lazyPage(<SurfaceCodeLab />)} />
          <Route path="experiments" element={lazyPage(<ExperimentBench />)} />
          <Route path="papers" element={lazyPage(<Papers />)} />
          <Route path="field-today" element={lazyPage(<FieldToday />)} />
          <Route path="glossary" element={lazyPage(<Glossary />)} />
          <Route path="review" element={lazyPage(<Review />)} />
          <Route path="duel" element={lazyPage(<DecoderDuel />)} />
          <Route path="foundations" element={lazyPage(<FoundationsLab />)} />
          <Route path="altitudes" element={lazyPage(<Altitudes />)} />
          <Route path="capstone" element={lazyPage(<Capstone />)} />
          <Route path="lattice-surgery" element={lazyPage(<LatticeSurgeryLab />)} />
          <Route path="*" element={lazyPage(<NotFound />)} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  );
}
