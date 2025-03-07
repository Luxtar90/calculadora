import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast, { BaseToast, ErrorToast, ToastProps } from 'react-native-toast-message';

const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#51CF66',
        backgroundColor: '#F8FFF9',
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B8A3E'
      }}
      text2Style={{
        fontSize: 14,
        color: '#2F9E44'
      }}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C92A2A'
      }}
      text2Style={{
        fontSize: 14,
        color: '#E03131'
      }}
    />
  ),
  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#339AF0',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1971C2'
      }}
      text2Style={{
        fontSize: 14,
        color: '#1C7ED6'
      }}
    />
  ),
};

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
};

export default App;
