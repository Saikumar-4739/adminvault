'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    fontFamily: string;
    setFontFamily: (font: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontFamily, setFontFamilyState] = useState('var(--font-outfit)');
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const storedTheme = localStorage.getItem('theme');
        const storedFont = localStorage.getItem('font-family');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }

        if (storedFont) {
            setFontFamilyState(storedFont);
            document.documentElement.style.setProperty('--app-font', storedFont);
        } else {
            document.documentElement.style.setProperty('--app-font', 'var(--font-outfit)');
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    setIsDarkMode(true);
                    document.documentElement.classList.add('dark');
                } else {
                    setIsDarkMode(false);
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const newValue = !prev;
            if (newValue) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newValue;
        });
    };

    const setFontFamily = (font: string) => {
        setFontFamilyState(font);
        localStorage.setItem('font-family', font);
        document.documentElement.style.setProperty('--app-font', font);
    };

    // Prevent flash of unstyled content
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, fontFamily, setFontFamily }}>
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
