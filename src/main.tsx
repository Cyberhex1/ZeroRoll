import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isTauri } from './lib/platform';
import { AI_PROVIDERS } from './lib/providersConfig';
import './index.css';

// The PC app loads from a custom protocol with no server to rewrite paths, so it uses #/ routes.
const Router = isTauri() ? HashRouter : BrowserRouter;

// In the PC app the Custom / Local provider runs the models pulled into Ollama on this PC.
if (isTauri()) {
  AI_PROVIDERS.custom.name = 'This PC (Ollama)';
  AI_PROVIDERS.custom.tagline = 'Models you downloaded with Ollama. Free, private, works offline.';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <App />
      </Router>
    </ErrorBoundary>
  </StrictMode>,
);

