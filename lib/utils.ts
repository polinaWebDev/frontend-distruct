import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getFileUrl = (url: string) => {
    if (url.startsWith('http')) {
        return url;
    }
    let normalizedUrl = url.replace(/^\/+/, '');
    const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
        process.env.SERVER_API_URL?.replace(/\/$/, '');
    const mapsCdnBase =
        process.env.NEXT_PUBLIC_CDN_MAPS_BASE_URL?.replace(/\/$/, '') ??
        process.env.CDN_MAPS_BASE_URL?.replace(/\/$/, '');
    const isLocalEnv =
        process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';

    if (normalizedUrl.startsWith('api/public/')) {
        if (normalizedUrl.startsWith('api/public/maps/') && mapsCdnBase) {
            return `${mapsCdnBase}/${normalizedUrl.replace(/^api\/public\//, '')}`;
        }
        if (apiBase) {
            return `${apiBase}/${normalizedUrl}`;
        }
        if (isLocalEnv) {
            return `http://localhost:3281/${normalizedUrl}`;
        }
        return `/${normalizedUrl}`;
    }
    if (normalizedUrl.startsWith('maps/')) {
        if (mapsCdnBase) {
            return `${mapsCdnBase}/${normalizedUrl}`;
        }
        if (apiBase) {
            return `${apiBase}/api/public/${normalizedUrl}`;
        }
        if (isLocalEnv) {
            return `http://localhost:3281/api/public/${normalizedUrl}`;
        }
        return `/api/public/${normalizedUrl}`;
    }
    if (normalizedUrl.startsWith('api/public/uploads/')) {
        normalizedUrl = normalizedUrl.replace(/^api\/public\/uploads\//, '');
    }
    if (normalizedUrl.startsWith('public/uploads/')) {
        normalizedUrl = normalizedUrl.replace(/^public\/uploads\//, '');
    }
    if (isLocalEnv) {
        return `http://localhost:3281/api/public/uploads/${normalizedUrl}`;
    }
    return `${process.env.NEXT_PUBLIC_FILE_URL}/${normalizedUrl}`;
};

export const hexToRgba = (hex: string, opacity: number) => {
    const match = hex?.match(/\w\w/g);
    if (!match || match.length < 3) {
        return `rgba(0, 0, 0, ${opacity})`;
    }

    const [r, g, b] = match.slice(0, 3).map((c) => parseInt(c, 16));
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export function num_word(input: number, words: string[]) {
    const value = Math.abs(input) % 100;
    const num = value % 10;
    if (value > 10 && value < 20) return words[2];
    if (num > 1 && num < 5) return words[1];
    if (num == 1) return words[0];
    return words[2];
}
