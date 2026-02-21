import { type Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Image as ImageIcon,
    Link as LinkIcon,
    Code,
    Minus,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { getFileUrl } from '@/lib/utils';

interface EditorToolbarProps {
    editor: Editor | null;
    onImageUpload: (file: File) => Promise<string | undefined>;
    isUploading?: boolean;
}

export const EditorToolbar = ({ editor, onImageUpload, isUploading }: EditorToolbarProps) => {
    const [linkUrl, setLinkUrl] = useState('');

    const handleLinkSubmission = useCallback(() => {
        if (!editor) return;

        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        setLinkUrl('');
    }, [editor, linkUrl]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
    }, [editor]);

    if (!editor) {
        return null;
    }

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageUpload(file).then((url) => {
                if (url) {
                    const chain = editor.chain().focus() as unknown as {
                        setImage: (attrs: { src: string }) => { run: () => boolean };
                    };
                    chain.setImage({ src: getFileUrl(url) }).run();
                }
            });
        }
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 items-center bg-background rounded-t-md">
            {/* History */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                icon={Undo}
                tooltip="Отменить"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                icon={Redo}
                tooltip="Повторить"
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={Bold}
                tooltip="Жирный"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={Italic}
                tooltip="Курсив"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                icon={Strikethrough}
                tooltip="Зачеркнутый"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                icon={Code}
                tooltip="Код"
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={Heading1}
                tooltip="Заголовок 1"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={Heading2}
                tooltip="Заголовок 2"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                icon={Heading3}
                tooltip="Заголовок 3"
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                icon={List}
                tooltip="Маркированный список"
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                icon={ListOrdered}
                tooltip="Нумерованный список"
            />

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Media & Links */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                icon={Quote}
                tooltip="Цитата"
            />

            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                icon={Minus}
                tooltip="Горизонтальная линия"
            />

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={setLink}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="start">
                    <div className="flex gap-2">
                        <Input
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleLinkSubmission();
                                }
                            }}
                        />
                        <Button size="sm" onClick={handleLinkSubmission}>
                            Сохранить
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="relative">
                <input
                    type="file"
                    className="hidden"
                    id="editor-image-upload"
                    accept="image/*"
                    onChange={handleImageInput}
                    disabled={isUploading}
                />
                <ToolbarButton
                    onClick={() => document.getElementById('editor-image-upload')?.click()}
                    icon={ImageIcon}
                    disabled={isUploading}
                    tooltip="Вставить изображение"
                />
            </div>
        </div>
    );
};
