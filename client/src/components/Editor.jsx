import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Heading3,
  Undo,
  Redo,
  Type
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: 'bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic' },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: 'underline' },
    { divider: true },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: { heading: { level: 1 } } },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: { heading: { level: 2 } } },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: { heading: { level: 3 } } },
    { divider: true },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList' },
    { divider: true },
    { icon: Undo, action: () => editor.chain().focus().undo().run() },
    { icon: Redo, action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
      {buttons.map((btn, i) => (
        btn.divider ? (
          <div key={i} className="w-px h-6 bg-slate-300 mx-1 self-center" />
        ) : (
          <button
            key={i}
            onClick={btn.action}
            className={`p-2 rounded-lg transition-colors ${
              btn.active && editor.isActive(btn.active) 
                ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <btn.icon size={18} />
          </button>
        )
      ))}
    </div>
  );
};

import Placeholder from '@tiptap/extension-placeholder';

export default function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Write something amazing...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none p-8 min-h-[500px] bg-white',
      },
    },
  });

  const isFirstLoad = React.useRef(true);

  // Update content if it changes externally (e.g., initial load)
  useEffect(() => {
    if (editor && content && isFirstLoad.current) {
      editor.commands.setContent(content);
      isFirstLoad.current = false;
    }
  }, [content, editor]);

  useEffect(() => {
    const handleExport = () => {
      if (!editor) return;
      const html = editor.getHTML();
      
      // Basic HTML to MD conversion
      let md = html
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')
        .replace(/<ul>(.*?)<\/ul>/g, '$1\n')
        .replace(/<ol>(.*?)<\/ol>/g, '$1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<u>(.*?)<\/u>/g, '_$1_')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, ''); // Strip remaining tags

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.md`;
      a.click();
      URL.revokeObjectURL(url);
    };

    window.addEventListener('export-markdown', handleExport);
    return () => window.removeEventListener('export-markdown', handleExport);
  }, [editor]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <MenuBar editor={editor} />
      <div className="p-8 dark:text-slate-100">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
