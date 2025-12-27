'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCcw, Copy, Check, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PasswordGeneratorProps {
    onPasswordGenerated: (password: string) => void;
    className?: string;
}

export default function PasswordGenerator({ onPasswordGenerated, className = '' }: PasswordGeneratorProps) {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let chars = lowercase;
        if (includeUppercase) chars += uppercase;
        if (includeNumbers) chars += numbers;
        if (includeSymbols) chars += symbols;

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            generatedPassword += chars[randomIndex];
        }

        setPassword(generatedPassword);
    }, [length, includeUppercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUse = () => {
        onPasswordGenerated(password);
    };

    const getStrength = (pwd: string) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getStrength(password);
    const strengthColor = strength <= 2 ? 'bg-rose-500' : strength <= 4 ? 'bg-amber-500' : 'bg-emerald-500';
    const strengthText = strength <= 2 ? 'Weak' : strength <= 4 ? 'Strong' : 'Very Secure';

    return (
        <div className={`space-y-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password Generator</h3>
                <button
                    onClick={generatePassword}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-indigo-600 dark:text-indigo-400"
                    title="Regenerate"
                >
                    <RefreshCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="relative group">
                <div className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 rounded-xl font-mono text-xl text-center break-all text-slate-900 dark:text-white shadow-inner group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors">
                    {password}
                </div>
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleCopy} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border dark:border-slate-700 hover:text-indigo-600" title="Copy">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Password Length: <span className="text-slate-900 dark:text-white font-bold">{length}</span></label>
                    <input
                        type="range"
                        min="8"
                        max="32"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="sr-only peer" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} />
                            <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Uppercase</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="sr-only peer" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} />
                            <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Numbers</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="sr-only peer" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} />
                            <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Symbols</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${strengthColor} text-white`}>
                        {strength <= 2 ? <ShieldAlert className="w-5 h-5" /> : strength <= 4 ? <Shield className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Password Strength</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{strengthText}</div>
                    </div>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className={`h-1.5 w-6 rounded-full ${level <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    ))}
                </div>
            </div>

            <Button variant="primary" className="w-full h-12" onClick={handleUse}>
                Use Generated Password
            </Button>
        </div>
    );
}
