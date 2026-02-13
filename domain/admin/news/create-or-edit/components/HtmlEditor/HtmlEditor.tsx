'use client';
import './HtmlEditor.css';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import ImageResize from 'tiptap-extension-resize-image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { EditorToolbar } from './EditorToolbar';
import { uploadsControllerUploadFileMutation } from '@/lib/api_client/gen/@tanstack/react-query.gen';
import { getPublicClient } from '@/lib/api_client/public_client';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface HtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export const HtmlEditor = ({ value, onChange, className, placeholder }: HtmlEditorProps) => {
    const uploadMutation = useMutation({
        ...uploadsControllerUploadFileMutation({ client: getPublicClient() }),
    });

    const handleImageUpload = async (file: File): Promise<string | undefined> => {
        const toastId = 'editor-image-upload';
        toast.loading('Загрузка изображения...', { id: toastId });
        try {
            const url = await uploadMutation.mutateAsync({
                body: {
                    file: file as any,
                },
            });
            toast.success('Изображение загружено', { id: toastId });
            return url;
        } catch (error) {
            console.error(error);
            toast.error('Не удалось загрузить изображение', { id: toastId });
            return undefined;
        }
    };

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            ImageResize.configure({
                inline: true,
                allowBase64: false,
            }),
            LinkExtension.configure({
                openOnClick: false,
                autolink: true,
            }),
            TextStyle,
            Color,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
                    'prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2',
                    'prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4'
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync content if value changes externally (optional, but good for reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Only set content if it's different to avoid cursor jumping
            // However, checking equality of HTML strings is tricky.
            // Usually for controlled components in Tiptap, it's better not to force update
            // on every keystroke unless necessary.
            // We'll check if the content is empty in editor but value is not,
            // or if the difference is drastic.
            // For now, let's just rely on initial content.
            // If we need full controlled behavior, we need more complex logic.
            // Common pattern: only update if editor is empty and value is provided (initial load mostly)
            if (editor.isEmpty && value) {
                editor.commands.setContent(value);
            }
        }
    }, [value, editor]);

    return (
        <div
            className={cn(
                'border rounded-md flex flex-col bg-background overflow-hidden',
                className,
                'html-editor'
            )}
        >
            <EditorToolbar
                editor={editor}
                onImageUpload={handleImageUpload}
                isUploading={uploadMutation.isPending}
            />
            <EditorContent editor={editor} className="flex-1 w-full" />
        </div>
    );
};
