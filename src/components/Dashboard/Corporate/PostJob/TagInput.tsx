import { useState } from 'react';

export default function TagInput({
  label,
  tags,
  onAddTag,
  onRemoveTag,
}: {
  label: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      onAddTag(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="bg-gray-100 rounded-xl p-2 min-h-[130px] flex flex-col justify-between">
        {/* Tags container */}
        {tags && <div className="flex flex-wrap gap-2 max-h-[60px] overflow-y-auto">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            >
              {tag}
              {onRemoveTag && (
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="text-white text-xs hover:text-gray-200"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>}
        {/* Input takes full width on next line */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent rounded-xl outline-none text-sm px-3 py-3"
          placeholder="Add more"
        />
      </div>
    </div>
  );
}
