import { FileUploadIcon } from '@/lib/icons/FileUploadIcon';
import styles from './challenge-file-upload.module.css';
import { useEffect, useRef, useState } from 'react';
import { MenuIcon } from '@/lib/icons/MenuIcon';
import clsx from 'clsx';
import { toast } from 'sonner';

const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        video.onloadeddata = () => {
            video.currentTime = 0.1;
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                resolve('');
            }

            URL.revokeObjectURL(url);
            video.remove();
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('');
            video.remove();
        };
    });
};

interface ChallengeFileUploadProps {
    value: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
    description?: string;
    maxSize?: number;
}

export const ChallengeFileUpload = ({
    value,
    onChange,
    maxFiles,
    description,
    maxSize,
}: ChallengeFileUploadProps) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const limitReached = maxFiles && value.length >= maxFiles;

    useEffect(() => {
        let active = true;
        const generatedUrls: string[] = [];

        const loadPreviews = async () => {
            const promises = value.map(async (file) => {
                if (file.type.startsWith('video/')) {
                    return await generateVideoThumbnail(file);
                }
                return URL.createObjectURL(file);
            });

            const results = await Promise.all(promises);

            if (active) {
                setPreviews(results);
                // Track blob URLs for cleanup
                results.forEach((url) => {
                    if (url.startsWith('blob:')) {
                        generatedUrls.push(url);
                    }
                });
            } else {
                // If stale, cleanup immediately
                results.forEach((url) => {
                    if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                    }
                });
            }
        };

        loadPreviews();

        return () => {
            active = false;
            generatedUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        let validFiles = newFiles;

        if (maxSize) {
            validFiles = newFiles.filter((file) => file.size <= maxSize);
            if (validFiles.length < newFiles.length) {
                const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
                toast.error(`Размер файла превышает ограничение в ${maxSizeMB} МБ`);
            }
        }

        let updatedFiles = [...value, ...validFiles];

        if (maxFiles && updatedFiles.length > maxFiles) {
            updatedFiles = updatedFiles.slice(0, maxFiles);
        }
        onChange(updatedFiles);
    };

    const handleFileRemove = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onChange(newFiles);
    };

    return (
        <div className={styles.container}>
            {previews.length > 0 && (
                <div className={styles.preview_container}>
                    {previews.map((preview, index) => (
                        <div key={index} className={styles.preview}>
                            <img src={preview} alt="Preview" className={styles.preview_image} />
                            <div
                                className={styles.remove_btn}
                                onClick={() => handleFileRemove(index)}
                            >
                                <MenuIcon />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*, video/*"
                onChange={handleFileChange}
                onClick={(e) => ((e.target as HTMLInputElement).value = '')}
                className="hidden"
            />

            <button
                className={clsx(styles.btn, limitReached && styles.disabled)}
                onClick={() => {
                    if (limitReached) return;
                    fileInputRef.current?.click();
                }}
            >
                <FileUploadIcon className={styles.icon} />
            </button>

            {description && <div className={styles.desc}>{description}</div>}
        </div>
    );
};
