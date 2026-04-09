import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface CountryCode {
    code: string;
    country: string;
    flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
];

export interface PhoneInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    label,
    value = '',
    onChange,
    placeholder = '',
    className,
    error,
    required,
    disabled
}) => {
    // Parse initial value
    const { initialCode, initialNumber } = useMemo(() => {
        const found = COUNTRY_CODES.find(c => value.startsWith(c.code));
        if (found) {
            return {
                initialCode: found.code,
                initialNumber: value.slice(found.code.length).trim()
            };
        }
        return { initialCode: '+91', initialNumber: value };
    }, [value]);

    const [selectedCode, setSelectedCode] = useState(initialCode);
    const [phoneNumber, setPhoneNumber] = useState(initialNumber);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        // Only update local state if value actually changed from outside
        const combined = value.startsWith(selectedCode) ? value : `${selectedCode} ${phoneNumber}`.trim();
        if (value !== combined) {
            const found = COUNTRY_CODES.find(c => value.startsWith(c.code));
            if (found) {
                setSelectedCode(found.code);
                setPhoneNumber(value.slice(found.code.length).trim());
            } else {
                setPhoneNumber(value);
            }
        }
    }, [value, selectedCode, phoneNumber]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(raw);
        onChange(`${selectedCode} ${raw}`.trim());
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setSelectedCode(newCode);
        onChange(`${newCode} ${phoneNumber}`.trim());
    };

    return (
        <div className={cn("w-full space-y-1.5", className)}>
            <div className="relative">
                <div className={cn(
                    "flex h-14 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-200",
                    isFocused && "border-primary-500 ring-4 ring-primary-500/10 dark:ring-primary-400/10",
                    error && "border-rose-500 ring-rose-500/10",
                    disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                )}>
                    {/* Country Code Selector */}
                    <div className="relative flex items-center border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-3 min-w-[80px]">
                        <select
                            value={selectedCode}
                            onChange={handleCodeChange}
                            disabled={disabled}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full disabled:cursor-not-allowed"
                        >
                            {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code} ({c.country})
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 pointer-events-none">
                            <span>{COUNTRY_CODES.find(c => c.code === selectedCode)?.flag}</span>
                            <span>{selectedCode}</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={handleNumberChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={label && isFocused ? '' : placeholder}
                            disabled={disabled}
                            required={required}
                            className={cn(
                                "w-full h-full px-4 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none",
                                label && "pt-6 text-sm font-semibold"
                            )}
                        />
                        {label && (
                            <label className={cn(
                                "absolute left-4 transition-all duration-200 pointer-events-none",
                                isFocused || phoneNumber || value ? "top-2 text-[10px] text-primary-600 font-bold uppercase tracking-wider" : "top-1/2 -translate-y-1/2 text-sm text-slate-500"
                            )}>
                                {label}
                            </label>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="mt-1 text-xs text-rose-500 animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};
