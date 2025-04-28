import React from 'react';

type InputProps = {
  label: string;
  name: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, ...rest }, ref) => {
    return (
      <div className="space-y-1">
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          id={name}
          name={name}
          ref={ref}
          className={`w-full rounded-xl p-3 text-sm bg-gray-100 ${
            error ? 'border border-red-500' : ''
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...rest}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

// Helps with debugging in React DevTools
Input.displayName = 'Input';

export default Input;
