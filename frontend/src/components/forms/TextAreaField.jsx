import React from 'react';

const TextAreaField = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required = false,
  disabled = false,
  className = '',
  helperText,
}) => {
  const areaId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={areaId} className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <textarea
        id={areaId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full p-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500 text-rose-900 placeholder:text-rose-300'
            : 'border-slate-300 focus:ring-primary/20 focus:border-primary text-slate-800 placeholder:text-slate-400'
        }`}
      />

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default TextAreaField;
