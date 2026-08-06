import { Suspense, lazy, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';

const Home = lazy(() => import('@/pages/Home'));
const KnowledgeMap = lazy(() => import('@/pages/KnowledgeMap'));
const LearningPath = lazy(() => import('@/pages/LearningPath'));
const SurfaceCodeLab = lazy(() => import('@/pages/SurfaceCodeLab'));
const Papers = lazy(() => import('@/pages/Papers'));
const FieldToday = lazy(() => import('@/pages/FieldToday'));
const Glossary = lazy(() => import('@/pages/Glossary'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center font-mono text-sm text-text-low">
      loading…
    </div>
  );
}

function lazyPage(element: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={lazyPage(<Home />)} />
        <Route path="map" element={lazyPage(<KnowledgeMap />)} />
        <Route path="path" element={lazyPage(<LearningPath />)} />
        <Route path="lab" element={lazyPage(<SurfaceCodeLab />)} />
        <Route path="papers" element={lazyPage(<Papers />)} />
        <Route path="field-today" element={lazyPage(<FieldToday />)} />
        <Route path="glossary" element={lazyPage(<Glossary />)} />
        <Route path="*" element={lazyPage(<Home />)} />
      </Route>
    </Routes>
  );
}
