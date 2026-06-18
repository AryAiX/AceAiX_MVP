import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider } from './context/LocaleContext';
import Router from './Router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocaleProvider>
          <Router />
        </LocaleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
