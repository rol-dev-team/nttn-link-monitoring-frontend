

// // src/components/rate/RateForm.jsx
// import React, { useEffect, useState } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { ArrowLeft } from 'lucide-react';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import DatePickerField from './../fields/DatePickerField';

// import { rateValidation } from '../../validations/rateValidation';
// import { fetchNTTNs } from '../../services/nttn';

// /* ---------- wrapper for sections ---------- */
// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
//       {children}
//     </div>
//   </fieldset>
// );

// const RateForm = ({
//   initialValues,
//   isEditMode,
//   onSubmit,
//   onCancel,
//   showToast,
//   linkTypes,       // ⬅️ NEW PROPS RECEIVED
// }) => {

//   const [nttns, setNttns] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ---------- Formik ---------- */
//   const formik = useFormik({
//     initialValues: {
//       nttn_id: initialValues.nttn_id || '',
//       bw_range_from: initialValues.bw_range_from || '',
//       bw_range_to: initialValues.bw_range_to || '',
//       rate: initialValues.rate || '',
//       start_date: initialValues.start_date || '',
//       end_date: initialValues.end_date || '',
//       link_type_id: initialValues.link_type_id || '',   // NEW FIELD
//     },
//     validationSchema: rateValidation,
//     enableReinitialize: true,
//     onSubmit,
//   });

//   /* ---------- Load dropdown data ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const { data } = await fetchNTTNs();
//         setNttns(data);
//       } catch (e) {
//         showToast?.(e.message || 'Failed to load form data', 'error');
//       } finally {
//         setLoading(false);
//       }
//     };
//     boot();
//   }, []);

//   /* ---------- render ---------- */
//   if (loading) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
//         <span className="text-gray-500">Loading form data...</span>
//       </div>
//     );
//   }

//   return (
//     <FormikProvider value={formik}>
//       <form
//         onSubmit={formik.handleSubmit}
//         className="p-8 bg-gray-100 min-h-screen space-y-6"
//       >
//         {/* Header */}
//         <div className="flex items-center space-x-3 mb-6 md:mb-8">
//           <Button
//             variant="icon"
//             type="button"
//             onClick={onCancel}
//             title="Go Back"
//             className="p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110"
//           >
//             <ArrowLeft size={24} />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {isEditMode ? 'Edit Rate' : 'Add Rate'}
//             </h1>
//             <p className="text-gray-500">
//               Fill in the details to {isEditMode ? 'update' : 'add a new'} rate record.
//             </p>
//           </div>
//         </div>

//         {/* BASIC INFO */}
//         <FormSection title="Basic Info">
//           {isEditMode && (
//             <InputField name="id" label="Rate ID" type="number" disabled />
//           )}

//           {/* NTTN */}
//           <SelectField
//             name="nttn_id"
//             // label="NTTN Name *"
//             placeholder="Select NTTN"
//             options={nttns.map((n) => ({
//               value: n.id,
//               label: n.nttn_name,
//             }))}
//             searchable
//           />


//           {/* NEW FIELD — LINK TYPE */}
//           <SelectField
//             name="link_type_id"
//             // label="Link Type *"
//             placeholder="Select Link Type"
//             options={linkTypes.map((t) => ({
//               value: t.id,
//               label: t.type_name,
//             }))}
//             searchable
//           />

//           {/* Bandwidth */}
//           <InputField
//             name="bw_range_from"
//             label="BW Range From *"
//             type="number"
//             step="0.01"
//             placeholder="BW Range From"
//           />

//           <InputField
//             name="bw_range_to"
//             label="BW Range To *"
//             type="number"
//             step="0.01"
//             placeholder="BW Range To"
//           />

//           {/* Rate */}
//           <InputField
//             name="rate"
//             label="Rate (Tk/Mbps) *"
//             type="number"
//             step="0.01"
//             placeholder="Enter rate"
//           />

          
//         </FormSection>

//         {/* Dates */}
//         <div className="flex gap-4">
//           <DatePickerField
//             name="start_date"
//             placeholder="Start Date"
//             field={{ name: 'start_date', value: formik.values.start_date }}
//             form={formik}
//           />
//           <DatePickerField
//             name="end_date"
//             placeholder="End Date"
//             field={{ name: 'end_date', value: formik.values.end_date }}
//             form={formik}
//           />
//         </div>

//         {/* ACTION BUTTONS */}
//         <div className="flex w-full justify-end mt-8 space-x-3">
//           <Button intent="cancel" type="button" onClick={onCancel}>
//             Cancel
//           </Button>

//           <Button type="submit" intent="submit" loading={formik.isSubmitting}>
//             Save
//           </Button>
//         </div>

//       </form>
//     </FormikProvider>
//   );
// };

// export default RateForm;



// src/components/rate/RateForm.jsx
import React, { useEffect, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import DatePickerField from './../fields/DatePickerField';

import { rateValidation } from '../../validations/rateValidation';
import { fetchNTTNs } from '../../services/nttn';

/* ---------- wrapper for sections ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
      {children}
    </div>
  </fieldset>
);

const RateForm = ({
  initialValues,
  isEditMode,
  onSubmit,
  onCancel,
  showToast,
  linkTypes,
}) => {

  const [nttns, setNttns] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Formik ---------- */
  const formik = useFormik({
    initialValues: {
      nttn_id: initialValues.nttn_id || '',
      bw_range_from: initialValues.bw_range_from || '',
      bw_range_to: initialValues.bw_range_to || '',
      rate: initialValues.rate || '',
      start_date: initialValues.start_date || '',
      end_date: initialValues.end_date || '',
      link_type_id: initialValues.link_type_id || '',
      rate_type: initialValues.rate_type || '', // ✅ NEW FIELD
    },
    validationSchema: rateValidation,
    enableReinitialize: true,
    onSubmit,
  });

  /* ---------- Load dropdown data ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const { data } = await fetchNTTNs();
        setNttns(data);
      } catch (e) {
        showToast?.(e.message || 'Failed to load form data', 'error');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading form data...</span>
      </div>
    );
  }

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-gray-100 min-h-screen space-y-6"
      >

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 md:mb-8">
          <Button
            variant="icon"
            type="button"
            onClick={onCancel}
            title="Go Back"
            className="p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Rate' : 'Add Rate'}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? 'update' : 'add a new'} rate record.
            </p>
          </div>
        </div>

        {/* BASIC INFO */}
        <FormSection title="Basic Info">

          <SelectField
            name="nttn_id"
            placeholder="Select NTTN"
            options={nttns.map((n) => ({
              value: n.id,
              label: n.nttn_name,
            }))}
            searchable
          />

          <SelectField
            name="link_type_id"
            placeholder="Select Link Type"
            options={linkTypes.map((t) => ({
              value: t.id,
              label: t.type_name,
            }))}
            searchable
          />

          {/* ✅ RATE TYPE DROPDOWN */}
          <SelectField
            name="rate_type"
            placeholder="Select Rate Type"
            options={[
              { value: 1, label: 'Fixed' },
              { value: 2, label: 'Variable' },
            ]}
          />

          <InputField
            name="bw_range_from"
            label="BW Range From *"
            type="number"
            step="0.01"
            placeholder="BW Range From"
          />

          <InputField
            name="bw_range_to"
            label="BW Range To *"
            type="number"
            step="0.01"
            placeholder="BW Range To"
          />

          <InputField
            name="rate"
            label="Rate (Tk/Mbps) *"
            type="number"
            step="0.01"
            placeholder="Enter rate"
          />
        </FormSection>

        {/* Dates */}
        <div className="flex gap-4">
          <DatePickerField
            name="start_date"
            placeholder="Start Date"
            field={{ name: 'start_date', value: formik.values.start_date }}
            form={formik}
          />
          <DatePickerField
            name="end_date"
            placeholder="End Date"
            field={{ name: 'end_date', value: formik.values.end_date }}
            form={formik}
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" intent="submit" loading={formik.isSubmitting}>
            Save
          </Button>
        </div>

      </form>
    </FormikProvider>
  );
};

export default RateForm;


