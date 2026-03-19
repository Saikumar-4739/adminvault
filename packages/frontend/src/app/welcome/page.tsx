'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const WelcomePage: React.FC = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] p-8 -mt-8 animate-slide-up">
            <div className="max-w-2xl text-center space-y-4">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Welcome to <span className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">AdminVault</span>
                    {user?.fullName ? `,  ${user.fullName}` : ''}
                </h1>
                <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Streamlined hardware, software, and human capital management. Built for modern IT teams to operate securely and efficiently. Explore the features below.
                </p>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-slide-up { animation: slide-up 0.6s ease-out; }
                .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
            `}</style>
        </div>
    );
};

export default WelcomePage;
