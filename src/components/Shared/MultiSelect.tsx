import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface MultiSelectProps {
  placeholder: string;
  value: string[];
  onChange: (values: string[]) => void;
  type: 'normal' | 'freetext' | 'multiselect';
  options?: string[];
}

/**
 * MultiSelect component - A custom multi-select component
 *
 * @description - A custom multi-select component that can be used to select multiple values from a list of options
 *
 * @param MultiSelectProps - Placeholder, value, onChange, type, options
 * @returns - A custom multi-select component
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  placeholder,
  value,
  onChange,
  type,
  options = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (type === 'freetext') {
        onChange([inputValue.trim()]);
        setInputValue('');
      } else if (type === 'multiselect' && !value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const handleOptionClick = (option: string) => {
    if (type === 'multiselect') {
      const newValue = value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option];
      onChange(newValue);
    } else {
      onChange([option]);
      setIsOpen(false);
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="text-xs sm:text-s text-left cursor-pointer outline-none text-gray-500 bg-transparent w-full max-w-[300px] p-3 border border-gray-200 rounded-xl"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {value.map((v, index) => (
              <span
                key={index}
                className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
              >
                {v}
                <X
                  size={14}
                  className="cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(v);
                  }}
                />
              </span>
            ))}
          </div>
        ) : (
          <div className="w-full">
            {type === 'normal' ? (
              <span className="text-gray-400  text-left ">{placeholder}</span>
            ) : (
              <input
                ref={inputRef}
                type="text"
                className="opacity-100 w-full bg-transparent outline-none" // Changed: removed conditional opacity check for "normal"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>

      {isOpen && (type === 'multiselect' || type === 'normal') && (
        <div className="absolute z-10 w-full max-w-[300px] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
          {placeholder && <div className="px-4 py-2 text-gray-500">{placeholder}</div>}
          {options.map((option) => (
            <div
              key={option} // Ensure option is unique
              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${value.includes(option) ? 'bg-gray-50' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
