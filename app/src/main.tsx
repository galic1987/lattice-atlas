import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProgressProvider } from '@/store/progress';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </BrowserRouter>,
);
