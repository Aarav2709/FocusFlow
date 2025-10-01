import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import App from './App';
import { AppStateProvider } from './context/AppStateContext';
import { StudyProvider } from './context/StudyContext';
import { useCreateTheme } from './theme/theme';

const Root = () => {
  const theme = useCreateTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <AppStateProvider>
          <StudyProvider>
            <HashRouter>
              <App />
            </HashRouter>
          </StudyProvider>
        </AppStateProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
