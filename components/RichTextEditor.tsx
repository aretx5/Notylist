'use client';

import { useState, useRef } from 'react';
import { FiBold, FiItalic, FiCode, FiList, FiLink } from 'react-icons/fi';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  bgColor?: string;
  textColor?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, bgColor = '#1f2937', textColor = '#e5e7eb' }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = beforeText + prefix + selectedText + suffix + afterText;
    onChange(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const formatButtons = [
    { icon: <FiBold size={16} />, action: () => insertMarkdown('**', '**'), tooltip: 'Bold (Ctrl+B)' },
    { icon: <FiItalic size={16} />, action: () => insertMarkdown('*', '*'), tooltip: 'Italic (Ctrl+I)' },
    { icon: <FiCode size={16} />, action: () => insertMarkdown('`', '`'), tooltip: 'Code' },
    { icon: <FiList size={16} />, action: () => insertMarkdown('\n- '), tooltip: 'List' },
    { icon: <FiLink size={16} />, action: () => insertMarkdown('[', '](url)'), tooltip: 'Link' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*');
      }
    }
  };

  // Calculate contrasting colors for toolbar
  const toolbarBg = `${bgColor}dd`;
  const borderOpacity = textColor === '#e5e7eb' ? '30' : '20';

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div 
        className="flex items-center gap-1 px-3 py-2 rounded-lg backdrop-blur-sm"
        style={{ 
          backgroundColor: toolbarBg,
          borderWidth: '1px',
          borderColor: `${textColor}${borderOpacity}`
        }}
      >
        {formatButtons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            title={btn.tooltip}
            type="button"
            className="p-2 rounded hover:bg-black/20 transition-colors"
            style={{ color: `${textColor}99` }}
            onMouseEnter={(e) => e.currentTarget.style.color = textColor}
            onMouseLeave={(e) => e.currentTarget.style.color = `${textColor}99`}
          >
            {btn.icon}
          </button>
        ))}
        <div className="flex-1" />
        <div className="text-xs opacity-50" style={{ color: textColor }}>
          Markdown
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Start writing...'}
        className="w-full min-h-[400px] px-0 py-0 bg-transparent border-none focus:outline-none resize-none text-base leading-relaxed"
        style={{ 
          fontFamily: 'inherit',
          color: textColor,
        }}
      />

      {/* Markdown Hint */}
      <div className="text-xs opacity-40 px-1" style={{ color: textColor }}>
        **bold** • *italic* • `code` • [link](url) • - list
      </div>
    </div>
  );
}
