'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the context type
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// Create a ThemeContext to share theme state across your app
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a ThemeProvider component that will wrap your app and provide theme context
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Load theme from localStorage or use system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkMode =
      storedTheme === 'dark' ||
      (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(prefersDarkMode);
    document.documentElement.classList.toggle('dark', prefersDarkMode);
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to access the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
