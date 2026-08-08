import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { ProgressProvider } from '@/store/progress';
import './index.css';
import App from './App.tsx';

const configuredBase = import.meta.env.BASE_URL;
const routerBasename = configuredBase === '/' ? undefined : configuredBase.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={routerBasename}>
    <MotionConfig reducedMotion="user">
      <ProgressProvider>
        <App />
        <Toaster theme="dark" position="bottom-right" closeButton richColors />
      </ProgressProvider>
    </MotionConfig>
  </BrowserRouter>,
);
