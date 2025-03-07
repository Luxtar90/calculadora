import React, { createContext, useContext, useState } from 'react';

export const lightTheme = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#202124',
  textSecondary: '#666666',
  primary: '#1a73e8',
  border: '#e0e0e0',
  error: '#d93025',
  success: '#1e8e3e',
};

export const darkTheme = {
  background: '#202124',
  card: '#2c2c2c',
  text: '#e8eaed',
  textSecondary: '#9aa0a6',
  primary: '#8ab4f8',
  border: '#3c4043',
  error: '#f28b82',
  success: '#81c995',
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 