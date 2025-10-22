

import React from 'react';

const TextInputField = ({
  name,
  label,
  formik,
  placeholder = "",
  type = "text", 
  className = "",
  disabled,
  ...rest
}) => {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div className={`form-control w-full ${className}`}>
      {/* <label className="label" htmlFor={name}>
        <span className="label-text">{label}</span>
      </label> */}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        // Formik Handlers
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name] ?? ''} 
        disabled={disabled}
        className={`input input-bordered w-full 
          ${hasError ? 'input-error border-red-500' : 'border-gray-300'}
        `}
        {...rest} 
      />
      {hasError ? (
        <label className="label">
          <span className="label-text-alt text-sm text-red-500">{formik.errors[name]}</span>
        </label>
      ) : null}
    </div>
  );
};

export default TextInputField;