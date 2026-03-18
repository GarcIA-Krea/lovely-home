'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Language } from '@/i18n/translations';
import styles from './LanguageSelector.module.css';

const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

const LanguageSelector = () => {
    const { language, setLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button 
                className={styles.trigger} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
            >
                <span className={styles.flag}>{currentLang.flag}</span>
                <span className={styles.code}>{currentLang.code.toUpperCase()}</span>
                <span className={`material-symbols-outlined ${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`${styles.option} ${language === lang.code ? styles.optionActive : ''}`}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                        >
                            <span className={styles.optionFlag}>{lang.flag}</span>
                            <span className={styles.optionLabel}>{lang.label}</span>
                            {language === lang.code && (
                                <span className={`material-symbols-outlined ${styles.check}`}>check</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
