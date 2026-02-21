'use client';

import { useState } from 'react';
import styles from './CookieConsent.module.css';

const CONSENT_STORAGE_KEY = 'distruct_cookie_consent_v1';
const CONSENT_COOKIE_NAME = 'distruct_cookie_consent';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        try {
            return window.localStorage.getItem(CONSENT_STORAGE_KEY) !== 'accepted';
        } catch {
            return true;
        }
    });

    const onAccept = () => {
        setIsVisible(false);

        try {
            window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
            document.cookie = `${CONSENT_COOKIE_NAME}=accepted; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
            // Ignore storage errors (private mode, blocked storage, etc.).
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles.container} role="status" aria-live="polite">
            <p className={styles.text}>
                Оставаясь на сайте, ты соглашаешься на использование cookie и LocalStorage — чтобы
                всё грузилось шустрее и мы понимали, что прокачивать.
            </p>
            <button type="button" className={styles.button} onClick={onAccept}>
                Понятно
            </button>
        </div>
    );
}
