"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";

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
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      const html = editor.getHTML();
      onChange(html);
      setHtmlContent(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 text-black",
        "data-placeholder": placeholder,
        style: "color: #000000;",
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      setHtmlContent(value);
    }
  }, [value, editor]);

  // Handle HTML mode toggle
  const toggleHtmlMode = () => {
    if (editor) {
      if (isHtmlMode) {
        // Switching from HTML to Visual: update editor with HTML content
        editor.commands.setContent(htmlContent, { emitUpdate: false });
        onChange(htmlContent);
      } else {
        // Switching from Visual to HTML: get current HTML
        setHtmlContent(editor.getHTML());
      }
      setIsHtmlMode(!isHtmlMode);
    }
  };

  // Handle HTML content change
  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Basic HTML formatter (indentation)
  const formatHtml = (html: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    html.split(/>\s*</).forEach((node, index) => {
      if (index === 0) {
        formatted += node;
      } else {
        const closingTag = node.match(/^\/\w+/);
        const openingTag = node.match(/^[^\/]/);
        
        if (closingTag) {
          indent--;
          formatted += '>\n' + tab.repeat(indent) + '<' + node;
        } else if (openingTag) {
          formatted += '>\n' + tab.repeat(indent) + '<' + node;
          if (!node.match(/\/$/)) {
            indent++;
          }
        } else {
          formatted += '>' + node;
        }
      }
    });
    
    return formatted.trim();
  };

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
    <div 
      className={`rich-text-editor border border-gray-300 rounded-lg bg-white ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}
      id={id}
      style={isFullscreen ? { height: '100vh', display: 'flex', flexDirection: 'column' } : {}}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={toggleHtmlMode}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            isHtmlMode
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title={isHtmlMode ? "Switch to Visual Editor" : "Switch to HTML Editor"}
        >
          {isHtmlMode ? "👁️ Visual" : "📝 HTML"}
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            isFullscreen
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
        >
          {isFullscreen ? "⤓ Exit" : "⛶ Fullscreen"}
        </button>
        {!isHtmlMode && <div className="w-px h-6 bg-gray-300 mx-1" />}
        {!isHtmlMode && (
          <>
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
          </>
        )}
      </div>

      {/* Editor Content */}
      {isHtmlMode ? (
        <div 
          className={`p-4 bg-white ${isFullscreen ? 'flex-1 flex flex-col' : 'min-h-[200px]'}`}
          style={isFullscreen ? { overflow: 'auto' } : {}}
        >
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
              <span className="font-medium">📝 HTML Editor Mode</span>
              <span className="text-gray-400">•</span>
              <span>{htmlContent.length} characters</span>
              {isFullscreen && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd> to exit fullscreen</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // Format HTML (basic indentation)
                  const formatted = formatHtml(htmlContent);
                  setHtmlContent(formatted);
                  handleHtmlChange(formatted);
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                title="Format HTML"
              >
                ✨ Format
              </button>
            </div>
          </div>
          <textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className={`w-full border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition ${
              isFullscreen ? 'flex-1' : 'min-h-[200px]'
            }`}
            placeholder="Enter HTML content here...&#10;&#10;Example:&#10;&lt;h1&gt;Title&lt;/h1&gt;&#10;&lt;p&gt;Your content here&lt;/p&gt;"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#000000',
              backgroundColor: '#ffffff',
              tabSize: 2
            }}
            spellCheck={false}
          />
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              💡 <strong>Tip:</strong> Edit HTML directly here. Click "Format" to auto-indent your HTML. 
              Use the "👁️ Visual" button to switch back and see the formatted content. All HTML tags are supported.
            </p>
          </div>
        </div>
      ) : (
        <div className={`bg-white ${isFullscreen ? 'flex-1 overflow-auto' : 'h-[400px] overflow-y-auto'}`}>
          <EditorContent editor={editor} />
        </div>
      )}

      <style jsx global>{`
        .rich-text-editor {
          transition: all 0.3s ease;
        }
        .rich-text-editor:fullscreen,
        .rich-text-editor:-webkit-full-screen,
        .rich-text-editor:-moz-full-screen,
        .rich-text-editor:-ms-fullscreen {
          background: white;
        }
        .rich-text-editor .ProseMirror {
          outline: none;
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
