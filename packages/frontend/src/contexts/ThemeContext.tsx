'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDarkMode: boolean; // Computed value based on theme and system preference
    toggleDarkMode: () => void; // Legacy support
    fontFamily: string;
    setFontFamily: (font: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [fontFamily, setFontFamilyState] = useState('var(--font-outfit)');

    // Load theme from localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        const storedFont = localStorage.getItem('font-family');

        if (storedTheme) {
            setThemeState(storedTheme);
        }

        if (storedFont) {
            setFontFamilyState(storedFont);
            document.documentElement.style.setProperty('--app-font', storedFont);
        } else {
            document.documentElement.style.setProperty('--app-font', 'var(--font-outfit)');
        }
    }, []);

    // Handle theme changes and system preference sync
    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (currentTheme: Theme) => {
            let resolved: boolean;

            if (currentTheme === 'system') {
                resolved = mediaQuery.matches;
            } else {
                resolved = currentTheme === 'dark';
            }

            setIsDarkMode(resolved);
            root.classList.toggle('dark', resolved);
        };

        applyTheme(theme);

        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const toggleDarkMode = () => {
        const nextTheme = isDarkMode ? 'light' : 'dark';
        setTheme(nextTheme);
    };

    const setFontFamily = (font: string) => {
        setFontFamilyState(font);
        localStorage.setItem('font-family', font);
        document.documentElement.style.setProperty('--app-font', font);
    };

    // We no longer return null if not mounted to allow pre-rendering
    // during static export. Components will render with default theme
    // and then hydrate with the stored theme on the client.

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode, fontFamily, setFontFamily }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
