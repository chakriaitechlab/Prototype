'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  placeholder: string;
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, placeholder, onChange }: TagInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const tag = value.trim();
    if (!tag) return;
    if (tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setError('Already added');
      return;
    }
    onChange([...tags, tag]);
    setValue('');
    setError(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.length === 0 && <span className="text-sm text-[#767f8c]">No items yet. Add one below.</span>}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a65cc]/10 text-[#0a65cc] text-sm font-semibold border border-[#0a65cc]/20"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((existing) => existing !== tag))}
              className="hover:text-[#18191c] transition-colors cursor-pointer"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="cset-input flex-1"
          value={value}
          placeholder={placeholder}
          maxLength={80}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
        />
        <button type="button" onClick={commit} className="cset-btn-secondary !px-4" aria-label="Add item">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
}
