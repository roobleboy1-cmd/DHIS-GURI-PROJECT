import React from 'react';

const InputField = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  helperText,
}) => {
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full py-2.5 text-sm bg-white dark:bg-slate-800/90 border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500 text-rose-900 dark:text-rose-200 placeholder:text-rose-300'
              : 'border-slate-300 dark:border-slate-700 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'
          }`}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default InputField;
