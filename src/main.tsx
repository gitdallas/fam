import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@patternfly/react-core/dist/styles/base.css';

// MSW setup - only in development
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass', // ignore non-API requests (vite assets, etc.)
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);