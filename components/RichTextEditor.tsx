"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  id,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 text-black",
        "data-placeholder": placeholder,
        style: "color: #000000;",
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const addImage = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
      }
    };
  };

  if (!editor) {
    return (
      <div className="h-[300px] border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-center h-full text-gray-500">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg bg-white" id={id}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("bold")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("italic")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("underline")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("bulletList")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("orderedList")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1.
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1.5 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 transition"
        >
          📷
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("link")
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          🔗
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="px-3 py-1.5 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 transition"
        >
          Clear
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          outline: none;
          min-height: 300px;
          padding: 1rem;
          color: #000000;
        }
        .rich-text-editor .ProseMirror p {
          color: #000000;
        }
        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .rich-text-editor .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
          color: #000000;
        }
        .rich-text-editor .ProseMirror li {
          color: #000000;
        }
        .rich-text-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #000000;
        }
        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
          color: #000000;
        }
        .rich-text-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
          color: #000000;
        }
        .rich-text-editor .ProseMirror strong {
          color: #000000;
        }
        .rich-text-editor .ProseMirror em {
          color: #000000;
        }
        .rich-text-editor .ProseMirror u {
          color: #000000;
        }
      `}</style>
    </div>
  );
}
