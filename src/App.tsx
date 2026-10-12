import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppWatermark } from './components/common/AppWatermark';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <AppRoutes />
            <AppWatermark />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
