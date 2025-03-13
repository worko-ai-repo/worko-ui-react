import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface MultiSelectProps {
  placeholder: string;
  value: string[];
  onChange: (values: string[]) => void;
  type: 'normal' | 'freetext' | 'multiselect';
  options?: string[];
  apiValue?: string[];
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  placeholder,
  value,
  onChange,
  type,
  options = [],
  apiValue = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
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

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const newValue = inputValue.trim();
      
      if (!value.includes(newValue)) {
        onChange([...value, newValue]); // Add new value if not already present
      }
  
      setInputValue('');
      setIsOpen(false);
    }
  };

  const handleOptionClick = (selectedIndex: number) => {
    const selectedApiValue = apiValue[selectedIndex] || filteredOptions[selectedIndex];
    if (type === 'multiselect') {
      const newValue = value.includes(selectedApiValue)
        ? value.filter((v) => v !== selectedApiValue)
        : [...value, selectedApiValue];
      onChange(newValue);
    } else {
      onChange([selectedApiValue]);
      setIsOpen(false);
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`select_primary text-xs sm:text-s text-left cursor-pointer outline-none text-gray-500 bg-white w-full max-w-[300px] p-3 border border-gray-200 ${isOpen ? 'rounded-t-xl border-b-0':'rounded-xl'} `}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-wrap gap-2 w-5/6 ">
          {value.map((v, index) => (
            <span
              key={index}
              className="bg-blue border text-blue-600 px-2 py-1 rounded-md flex items-center gap-1"
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
          {(value.length === 0 || type !== 'normal') && (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 min-w-[120px] bg-transparent outline-none focus:ring-0 focus:outline-none focus:border-transparent"
              placeholder={value.length === 0 ? placeholder : ''}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} // Handle Enter key event
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>

      {isOpen && (type === 'multiselect' || type === 'normal') && (
        <div className="absolute z-10 w-full max-w-[300px] bg-white border border-gray-200 rounded-b-xl shadow-lg max-h-[240px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-xs text-gray-600">No options found</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 text-xs font-medium text-gray-600 flex items-center text-left justify-between ${
                  value.includes(apiValue[index]) ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => handleOptionClick(index)}
              >
                <span>{option}</span>
                {value.includes(apiValue[index]) && <Check size={16} className="text-blue-600" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
