// src/components/SelectInput.jsx
import React from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import "../../assets/css/SelectInput.css"

const SelectInput = ({
  name,
  label,
  options,
  formik,
  isClearable = true,
  isSearchable = true,
  isCreatable = false,
  isMulti = false, // Add this prop
  isDisabled = false,
  isLoading = false,
  classNamePrefix,
  ...rest
}) => {
  const handleChange = (selectedOption) => {
    formik.setFieldValue(name, selectedOption);
  };
  
  const handleBlur = () => {
    formik.setFieldTouched(name, true);
  };

  const Component = isCreatable ? CreatableSelect : Select;

  return (
    <div className="form-group">
      {/* {label && <label htmlFor={name}>{label}</label>} */}
      <Component
        id={name}
        name={name}
        options={options}
        value={formik.values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isMulti={isMulti} // Use the prop here
        isDisabled={isDisabled}
        isLoading={isLoading}
        placeholder={label}
        classNamePrefix={classNamePrefix} 
        {...rest}
      />
      {formik.errors[name] && formik.touched[name] && (
        <div className="text-sm text-error">{formik.errors[name]}</div>
      )}
    </div>
  );
};

export default SelectInput;
