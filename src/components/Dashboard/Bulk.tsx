import React, { useEffect, useRef, useState } from 'react';

const BulkOption: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleBulk = () => setIsOpen(prev => !prev);

    const bulkOptions = [
        'Open',
        'Archive',
        'Close',
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            wrapperRef.current &&
            !wrapperRef.current.contains(event.target as Node)
          ) {
            setIsOpen(false);
          }
        };
    
        if (isOpen) {
          document.addEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [isOpen]);

    return (
        <div className="relative w-40" ref={wrapperRef}>
            {/* Trigger Button */}
            <div
                onClick={toggleBulk}
                className={`flex hover:cursor-pointer justify-center w-full bg-white transition-none p-4 py-2 items-center font-semibold focus:outline-none ${isOpen ? 'rounded-b-none rounded-2xl text-blue-600' : 'rounded-2xl'}`}
            >
                <span>Bulk</span>
                <span>▾</span>
            </div>

            {/* Modal-like Popover Panel */}
            {isOpen && (
                <div className="absolute w-40 bg-white rounded-2xl rounded-t-none p-4 shadow-lg z-50">
                    <div className="flex flex-col gap-3">
                        {bulkOptions.map(option => (
                            <label
                            key={option}
                            className="flex items-center gap-2 text-xs text-gray-700"
                          >
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-blue-600"
                              />
                            </div>
                            <span className="leading-snug">{option}</span>
                          </label>
                          
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkOption;
