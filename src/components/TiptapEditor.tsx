import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
    Bold, Italic, List, ListOrdered, Heading1, Heading2,
    Image as ImageIcon, Undo, Redo
} from 'lucide-react';
import { useCallback } from 'react';
import api from '../lib/api';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const addImage = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post('/upload/description-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const imageUrl = `http://localhost:3000${response.data.url}`;
                editor?.chain().focus().setImage({ src: imageUrl }).run();
            } catch (error) {
                alert('Lỗi upload ảnh');
            }
        };

        input.click();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="border border-admin-300 rounded-lg overflow-hidden">
            <div className="bg-admin-50 border-b border-admin-300 p-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-admin-200 ${editor.isActive('bold') ? 'bg-admin-200' : ''}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-admin-200 ${editor.isActive('italic') ? 'bg-admin-200' : ''}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-admin-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-admin-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-admin-200' : ''}`}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-admin-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-admin-200' : ''}`}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-admin-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-admin-200 ${editor.isActive('bulletList') ? 'bg-admin-200' : ''}`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-admin-200 ${editor.isActive('orderedList') ? 'bg-admin-200' : ''}`}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-admin-300 mx-1"></div>
                <button
                    type="button"
                    onClick={addImage}
                    className="p-2 rounded hover:bg-admin-200"
                    title="Insert Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-admin-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-2 rounded hover:bg-admin-200"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-2 rounded hover:bg-admin-200"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>
            <EditorContent editor={editor} className="prose max-w-none" />
        </div>
    );
}