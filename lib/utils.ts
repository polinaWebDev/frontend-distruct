import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getFileUrl = (url: string) => {
    if (url.startsWith('http')) {
        return url;
    }
    return `${process.env.NEXT_PUBLIC_FILE_URL}/${url}`;
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
