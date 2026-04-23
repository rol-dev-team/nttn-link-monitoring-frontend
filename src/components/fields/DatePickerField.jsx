// // src/fields/DatePickerField.js
// import React from "react";
// import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// const formatDate = (date) => {
//   if (!date) return "";
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const DatePickerField = ({ field, form, placeholder, ...props }) => {
//   const { name, value } = field;
//   const { setFieldValue } = form;

//   return (
//     <div className='flex flex-col'>
//       <ReactDatePicker
//         selected={value ? new Date(value) : null}
//         onChange={(date) => setFieldValue(name, formatDate(date))}
//         placeholderText={placeholder}
//         className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//         dateFormat='yyyy-MM-dd'
//         {...props}
//       />
//       {form.touched[name] && form.errors[name] && (
//         <span className='text-red-500 text-sm mt-1'>{form.errors[name]}</span>
//       )}
//     </div>
//   );
// };

// export default DatePickerField;




// src/fields/DatePickerField.js
import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Convert JS Date → "yyyy-mm-dd"
 */
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Convert "yyyy-mm-dd" → JS Date
 */
const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const DatePickerField = ({ field, form, placeholder, label, ...props }) => {
  const { name, value } = field;
  const { setFieldValue } = form;

  return (
    <div className='flex flex-col'>
      {/* Show label ABOVE input (optional) */}
      {label && (
        <label className="label mb-1">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}

      <ReactDatePicker
        selected={parseDate(value)}
        onChange={(date) => setFieldValue(name, formatDate(date))}
        placeholderText={placeholder}
        dateFormat='yyyy-MM-dd'
        className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        {...props}
      />

      {/* Formik error text */}
      {form.touched[name] && form.errors[name] && (
        <span className='text-red-500 text-sm mt-1'>{form.errors[name]}</span>
      )}
    </div>
  );
};

export default DatePickerField;
