import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  error: string;
  success: string;
  button: string;
  infoBox: string;
  infoTitle: string;
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const lightTheme: ThemeColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF9800',
  border: '#E0E0E0',
  error: '#E74C3C',
  success: '#27AE60',
  button: '#4CAF50',
  infoBox: '#EBF5FB',
  infoTitle: '#2980B9'
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF9800',
  border: '#333333',
  error: '#E74C3C',
  success: '#27AE60',
  button: '#4CAF50',
  infoBox: '#1E2A38',
  infoTitle: '#64B5F6'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error al guardar el tema:', error);
    }
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
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}; 