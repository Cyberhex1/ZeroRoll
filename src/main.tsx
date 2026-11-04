import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isTauri } from './lib/platform';
import './index.css';

// The PC app loads from a custom protocol with no server to rewrite paths, so it uses #/ routes.
const Router = isTauri() ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <App />
      </Router>
    </ErrorBoundary>
  </StrictMode>,
);

