import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  variant?: 'primary' | 'secondary';
}

export default function TagInput({ tags, onChange, placeholder, variant = 'primary' }: TagInputProps) {
  const [input, setInput] = useState('');

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  const tagStyle = variant === 'primary'
    ? { backgroundColor: '#EFF6FF', color: '#2563EB' }
    : { backgroundColor: '#F4F4F5', color: '#71717A' };

  const removeStyle = variant === 'primary'
    ? { color: '#93C5FD' }
    : { color: '#A1A1AA' };

  return (
    <div
      style={{
        minHeight: '44px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '10px',
        border: '1px solid #E4E4E7',
        backgroundColor: '#FFFFFF',
        cursor: 'text',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onClick={() => {
        const el = document.activeElement;
        if (!(el instanceof HTMLInputElement)) {
          const inputs = document.querySelectorAll('[data-tag-input]');
          const last = inputs[inputs.length - 1];
          if (last instanceof HTMLInputElement) last.focus();
        }
      }}
    >
      {tags.map(tag => (
        <span
          key={tag}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            ...tagStyle,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(tags.filter(t => t !== tag)); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              ...removeStyle,
            }}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        data-tag-input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={e => {
          const parent = e.currentTarget.closest('div') as HTMLDivElement;
          if (parent) {
            parent.style.borderColor = '#2563EB';
            parent.style.boxShadow = '0 0 0 3px #EFF6FF';
          }
        }}
        onBlur={e => {
          const parent = e.currentTarget.closest('div') as HTMLDivElement;
          if (parent) {
            parent.style.borderColor = '#E4E4E7';
            parent.style.boxShadow = 'none';
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{
          flex: 1,
          minWidth: '120px',
          fontSize: '14px',
          color: '#09090B',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '0',
          lineHeight: '1.5',
        }}
      />
    </div>
  );
}
