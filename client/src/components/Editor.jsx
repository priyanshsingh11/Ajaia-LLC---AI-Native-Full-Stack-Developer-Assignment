import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  Undo, 
  Redo 
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const items = [
    { icon: Bold, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: 'bold' },
    { icon: Italic, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: 'italic' },
    { icon: Heading1, title: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: { heading: { level: 1 } } },
    { icon: Heading2, title: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: { heading: { level: 2 } } },
    { icon: List, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList' },
    { icon: ListOrdered, title: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList' },
    { icon: Quote, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote' },
    { icon: Undo, title: 'Undo', action: () => editor.chain().focus().undo().run() },
    { icon: Redo, title: 'Redo', action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-3 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`p-2 rounded-xl transition-all ${
            item.active && editor.isActive(item.active)
              ? 'bg-primary-100 text-primary-600' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title={item.title}
        >
          <item.icon size={18} />
        </button>
      ))}
    </div>
  );
};

export default function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[600px] p-10',
      },
    },
  });

  // Update content if it changes externally (only if different to prevent cursor jumps)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML() && content !== undefined) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-20">
      <MenuBar editor={editor} />
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
