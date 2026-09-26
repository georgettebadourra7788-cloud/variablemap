import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ProjectsProvider } from './state/ProjectsContext';
import { ToastProvider } from './components/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectsProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ProjectsProvider>
  </StrictMode>,
);
