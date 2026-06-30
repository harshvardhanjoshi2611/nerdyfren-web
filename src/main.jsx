import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import ConfigurationError from './components/ConfigurationError';
import { AuthProvider } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { CartProvider } from './context/CartContext';
import './styles/index.css';
import { runtimeConfig } from './lib/runtimeConfig';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <SiteContentProvider>
              {runtimeConfig.configurationError
                ? <ConfigurationError message={runtimeConfig.configurationError} />
                : <App />}
            </SiteContentProvider>
          </CartProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
