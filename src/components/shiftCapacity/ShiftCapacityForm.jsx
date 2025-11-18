// import React, { useEffect, useState, useRef, use } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { ArrowLeft, Clock, DollarSign } from 'lucide-react';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise } from '../../services/client';
// import { fetchWorkOrders } from '../../services/workOrder';
// import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

// import {
//   getRateBetweenBandwidthRange,
//   getWorkOrderCategoryAndClientWise,
//   createCapacityShifting,
// } from '../../services/capacityShiftingApi';
// import { getRatesByNttn } from '../../services/bwRateApi';

// /* ---------- section wrapper (identical to SurveyForm / BWModificationForm) ---------- */

// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   nttn_provider: '',
//   client_category: '',
//   client: '',
//   nttn_link_id: '',
//   capacity: '',
//   capacity_cost: '',
//   shifting_bw: '',
//   after_shifting_capacity: '',
//   shifting_capacity: '',
//   shifting_client_category: '',
//   shifting_client: '',
//   shifting_unit_cost: '',
//   total_shifting_cost: '',
//   shifting_unit_price_dropdown: '',
// };

// const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [shiftingClients, setShiftingClients] = useState([]);
//   const [workOrders, setWorkOrders] = useState([]);
//   const [bandwidthRanges, setBandwidthRanges] = useState([]);
//   const [nttnLinkIds, setNttnLinkIds] = useState([]);
//   const [shiftingClientLinkIds, setShiftingClientLinkIds] = useState([]);
//   const [workOrderDetailsData, setWorkOrderDetailsData] = useState([]);
//   const [shiftingWorkOrderDetailsData, setShiftingWorkOrderDetailsData] = useState([]);
//   const [shiftingSourceRates, setShiftingSourceRates] = useState(0);
//   const [showShiftingDropdown, setShowShiftingDropdown] = useState(false);
//   const [nttnRatesOptions, setNttnRatesOptions] = useState([]);
//   const [shiftingNttnUnitPrice, setShiftingNttnUnitPrice] = useState(0);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const lastEdited = useRef(null);

//   /* ---------- formik ---------- */
//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: shiftCapacitySchema,
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       await handleSave(values, resetForm);
//     },
//   });

//   /* ---------- bootstrap data ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttn, cats, wos] = await Promise.all([
//           fetchNTTNs(),
//           fetchCategories(),
//           fetchWorkOrders(),
//         ]);
//         setNttnProviders(nttn.data);
//         setClientCategories(cats.data);

//         setWorkOrders(Array.isArray(wos) ? wos : wos?.data || []);
//       } catch (e) {
//         showToast?.(e.message || 'Failed to load form data', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- cascading selects ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_provider) return;
//     fetchBandwidthRangesByID(parseInt(formik.values.nttn_provider))
//       .then(setBandwidthRanges)
//       .catch(() => setBandwidthRanges([]));
//   }, [formik.values.nttn_provider]);

//   useEffect(() => {
//     if (!formik.values.nttn_provider) return;
//     getRatesByNttn(parseInt(formik.values.nttn_provider))
//       .then((res) => {
//         setNttnRatesOptions(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, [formik.values.nttn_provider]);

//   useEffect(() => {
//     if (!formik.values.client_category) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.client_category)
//       .then((res) => {
//         setClients(res.data);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category]);

//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue('shifting_client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then((res) => {
//         setShiftingClients(res.data);
//       })
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   // get work order category and client wise

//   useEffect(() => {
//     const { client, client_category } = formik.values;
//     if (!client || !client_category) return;
//     if (!client || !client_category) {
//       setNttnLinkIds([]);
//       setWorkOrderDetailsData([]);
//       formik.setFieldValue('nttn_link_id', '');
//       return;
//     }

//     setNttnLinkIds([]);
//     setWorkOrderDetailsData([]);
//     formik.setFieldValue('nttn_link_id', '');

//     const fetchData = async () => {
//       try {
//         const { data } = await getWorkOrderCategoryAndClientWise({
//           cat_id: client_category,
//           client_id: client,
//         });
//         setNttnLinkIds(data);
//         setWorkOrderDetailsData(data);
//       } catch (error) {
//         console.error(' API call failed:', error);
//       }
//     };

//     fetchData();
//   }, [formik.values.client, formik.values.client_category]);

//   useEffect(() => {
//     if (!formik.values.nttn_link_id) return;

//     const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
//     const totalCapasityCost = filtered?.rate * filtered?.request_capacity;

//     if (filtered) {
//       setShiftingSourceRates(filtered?.rate);
//       formik.setFieldValue('capacity', filtered?.request_capacity);
//       formik.setFieldValue('capacity_cost', parseFloat(totalCapasityCost).toFixed(2) || 0);
//     }
//   }, [formik.values.nttn_link_id, workOrderDetailsData]);

//   // get work order shifting category and client wise

//   useEffect(() => {
//     const { shifting_client, shifting_client_category } = formik.values;
//     if (!shifting_client || !shifting_client_category) return;
//     if (!shifting_client || !shifting_client_category) {
//       setShiftingClientLinkIds([]);
//       setShiftingWorkOrderDetailsData([]);
//       formik.setFieldValue('shifting_link_id', '');
//       return;
//     }

//     setShiftingClientLinkIds([]);
//     setShiftingWorkOrderDetailsData([]);
//     formik.setFieldValue('shifting_link_id', '');

//     const fetchShiftingData = async () => {
//       try {
//         const { data } = await getWorkOrderCategoryAndClientWise({
//           cat_id: shifting_client_category,
//           client_id: shifting_client,
//         });
//         setShiftingClientLinkIds(data);
//         setShiftingWorkOrderDetailsData(data);
//       } catch (error) {
//         console.error('API call failed:', error);
//       }
//     };

//     fetchShiftingData();
//   }, [formik.values.shifting_client, formik.values.shifting_client_category]);

//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );

//     if (filtered) {
//       formik.setFieldValue('shifting_unit_cost', filtered?.rate || 0);
//     }
//   }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

//   //fetch bandwidth rates and calculate unit cost and shifting amount

//   useEffect(() => {
//     const { shifting_bw } = formik.values;
//     if (!shifting_bw) {
//       formik.setFieldValue('shifting_unit_cost', '');
//       formik.setFieldValue('shifting_capacity', '');
//       return;
//     }

//     const fetchRate = async () => {
//       try {
//         const { data } = await getRateBetweenBandwidthRange({ bandwidth: shifting_bw });
//         const unitCost = parseFloat(data?.rate) || 0;
//         const shiftingAmount = unitCost * parseInt(shifting_bw);

//         formik.setFieldValue('shifting_unit_cost', unitCost.toFixed(2));
//         formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2));
//       } catch (error) {
//         console.error('API call failed:', error);
//         formik.setFieldValue('shifting_unit_cost', '');
//         formik.setFieldValue('shifting_capacity', '');
//       }
//     };

//     fetchRate();
//   }, [formik.values.shifting_bw]);

//   useEffect(() => {
//     const capacity = parseInt(formik.values.capacity) || 0;
//     const shifting = parseInt(formik.values.shifting_bw) || 0;
//     const unitCost = parseFloat(formik.values.shifting_unit_cost) || 0;

//     const afterShifting = capacity - shifting;
//     const totalShifting = afterShifting * unitCost;

//     formik.setFieldValue('after_shifting_capacity', afterShifting, false);
//     formik.setFieldValue('total_shifting_cost', totalShifting.toFixed(2), false);
//   }, [formik.values.capacity, formik.values.shifting_bw, formik.values.shifting_unit_cost]);

//   // Shifting capacity calculation (to find BW)

//   useEffect(() => {
//     const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;

//     // 1. Check if both required values are present
//     if (!shifting_unit_price_dropdown || !shifting_capacity || parseFloat(shifting_capacity) <= 0) {
//       // If not, clear the calculated BW and stop.
//       formik.setFieldValue('shifting_bw', '', false);
//       return;
//     }

//     // 2. Find the selected rate object
//     const selectedRateOption = nttnRatesOptions.find(
//       (item) => item.id === shifting_unit_price_dropdown
//     );

//     // 3. Extract the required values
//     const unitRate = parseFloat(selectedRateOption?.rate);
//     const shiftingCost = parseFloat(shifting_capacity);

//     // 4. Validate the unit rate
//     if (!unitRate || unitRate <= 0) {
//       console.error('Selected Unit Rate is invalid or zero.');
//       formik.setFieldValue('shifting_bw', '', false);
//       return;
//     }
//     const calculatedBW = shiftingCost / unitRate;

//     formik.setFieldValue('shifting_bw', parseInt(calculatedBW), false);
//   }, [
//     formik.values.shifting_capacity,
//     formik.values.shifting_unit_price_dropdown,
//     nttnRatesOptions,
//   ]);

//   /* ---------- submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const res = await createCapacityShifting(values);
//       showToast?.(res.message, 'success');

//       resetForm();
//       onCancel(); // close form
//     } catch (e) {
//       showToast?.(e.message || 'Save failed', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ---------- render ---------- */
//   if (isLoading) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
//         <span className="text-gray-500">Loading form data...</span>
//       </div>
//     );
//   }
//   console.log('formik.values', formik.values);
//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
//         {/* header – identical to SurveyForm / BWModificationForm */}
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
//               {isEditMode ? 'Edit Capacity Shift' : 'Add Capacity Shift'}
//             </h1>
//             <p className="text-gray-500">
//               Fill in the details to {isEditMode ? 'update' : 'add a new'} capacity-shift record.
//             </p>
//           </div>
//         </div>

//         {/* Shifting Source */}
//         <FormSection title="Shifting Source">
//           <SelectField
//             name="nttn_provider"
//             placeholder="NTTN Name*"
//             options={nttnProviders.map((p) => ({
//               value: p.id,
//               label: p.nttn_name,
//             }))}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />
//           <SelectField
//             name="client_category"
//             placeholder="Client Category *"
//             options={clientCategories.map((c) => ({
//               value: c.id,
//               label: c.cat_name,
//             }))}
//             onChange={(v) => {
//               formik.setFieldValue('client_category', v);
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={!formik.values.nttn_provider}
//           />
//           <SelectField
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({
//               value: c.id,
//               label: c.client_name,
//             }))}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             name="nttn_link_id"
//             placeholder="Work Order Link ID*"
//             options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_id }))}
//             onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 ">
//           <div className="grid grid-cols-1 sm:grid-cols-4 justify-items-center items-center gap-4 text-sm">
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{' '}
//                 {formik.values.capacity || 'N/A'}
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Unit Price:</strong>{' '}
//                 {(shiftingSourceRates && shiftingSourceRates) || '0.00'}
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{' '}
//                 {formik.values.capacity_cost || '0.00'}
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shiffting Cost:</strong>{' '}
//                 {formik.values.total_shifting_cost || 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>
//         {/* Current Details - Now a styled div */}

//         {/* Shifting Target */}
//         <FormSection title="Shifting Target">
//           {/* ----- 3-in-a-row : Shifting Client Category / Name / Link ID ----- */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
//             <SelectField
//               name="shifting_client_category"
//               placeholder="Shifting Client Category *"
//               options={clientCategories.map((c) => ({
//                 value: c.id,
//                 label: c.cat_name,
//               }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client_category', v);
//                 formik.setFieldValue('shifting_client', '');
//               }}
//               searchable
//             />
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({
//                 value: c.id,
//                 label: c.client_name,
//               }))}
//               onChange={(v) => formik.setFieldValue('shifting_client', v)}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Work Order Link ID"
//               options={shiftingClientLinkIds.map((nttn) => ({
//                 value: nttn.id,
//                 label: nttn.nttn_id,
//               }))}
//               onChange={(v) => formik.setFieldValue('shifting_link_id', v)}
//               searchable
//               isClearable
//             />
//           </div>

//           {/* ----- 4-in-a-row : Shifting BW / Amount / Unit Cost / Total ----- */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
//             <InputField
//               name="shifting_bw"
//               label="Shifting BW *"
//               type="number"
//               step="0.01"
//               // disabled={lastEdited.current === "amount"}
//               onChange={formik.handleChange}
//             />
//             {/* <InputField
//               name="shifting_capacity"
//               label="Shifting Amount *"
//               type="number"
//               step="0.01"
//               disabled={!formik.values.shifting_bw}
//               onChange={formik.handleChange}
//             /> */}
//             <InputField
//               name="shifting_capacity"
//               label="Shifting Amount *"
//               type="number"
//               step="0.01"
//               onChange={(e) => {
//                 formik.handleChange(e);
//                 if (e.target.value.trim() !== '') {
//                   setShowShiftingDropdown(true);
//                 } else {
//                   setShowShiftingDropdown(false);
//                 }
//               }}
//             />
//             {/* setShiftingNttnUnitPrice */}
//             {showShiftingDropdown && (
//               <SelectField
//                 name="shifting_unit_price_dropdown"
//                 placeholder="Select Unit Price"
//                 options={nttnRatesOptions.map((r) => ({
//                   label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
//                   value: r.id,
//                 }))}
//                 onChange={(v) => formik.setFieldValue('shifting_unit_price_dropdown', v)}
//                 searchable
//               />
//             )}
//             <InputField
//               name="shifting_unit_cost"
//               label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//               type="number"
//               step="0.01"
//               disabled
//             />
//             <InputField
//               name="total_shifting_cost"
//               label="Total Shifting Cost"
//               type="number"
//               step="0.01"
//               disabled
//             />
//           </div>

//           <InputField
//             name="after_shifting_capacity"
//             label="After-Shifting Capacity"
//             type="number"
//             step="0.01"
//             disabled
//           />
//         </FormSection>

//         {/* New Values */}
//         {/* <FormSection title="New Values">
//         </FormSection> */}

//         {/* Actions – identical bar */}
//         <div className="flex w-full justify-end mt-8 space-x-3">
//           <Button intent="cancel" type="button" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button
//             intent="submit"
//             type="submit"
//             loading={isSubmitting}
//             loadingText="Saving..."
//             disabled={isSubmitting || !formik.isValid}
//           >
//             Save
//           </Button>
//         </div>
//       </form>
//     </FormikProvider>
//   );
// };

// export default ShiftCapacityForm;

/// 1st version

import React, { useEffect, useState, useRef } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

import { fetchNTTNs } from '../../services/nttn';
import { fetchCategories } from '../../services/category';
import { fetchClientsCategoryWise } from '../../services/client';
import { fetchWorkOrders } from '../../services/workOrder';
import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

import {
  getRateBetweenBandwidthRange,
  getWorkOrderCategoryAndClientWise,
  createCapacityShifting,
} from '../../services/capacityShiftingApi';
import { getRatesByNttn } from '../../services/bwRateApi';

/* ---------- section wrapper (identical to SurveyForm / BWModificationForm) ---------- */

const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- empty shape ---------- */
const emptyValues = {
  nttn_provider: '',
  client_category: '',
  client: '',
  nttn_link_id: '',
  capacity: '',
  capacity_cost: '',
  shifting_bw: '',
  after_shifting_capacity: '',
  shifting_capacity: '',
  shifting_client_category: '',
  shifting_client: '',
  shifting_unit_cost: '',
  total_shifting_cost: '',
  shifting_unit_price_dropdown: '',
};

const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const [nttnProviders, setNttnProviders] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [shiftingClients, setShiftingClients] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [bandwidthRanges, setBandwidthRanges] = useState([]);
  const [nttnLinkIds, setNttnLinkIds] = useState([]);
  const [shiftingClientLinkIds, setShiftingClientLinkIds] = useState([]);
  const [workOrderDetailsData, setWorkOrderDetailsData] = useState([]);
  const [shiftingWorkOrderDetailsData, setShiftingWorkOrderDetailsData] = useState([]);
  const [shiftingSourceRates, setShiftingSourceRates] = useState(0);
  const [showShiftingDropdown, setShowShiftingDropdown] = useState(false);
  const [nttnRatesOptions, setNttnRatesOptions] = useState([]);
  const [shiftingNttnUnitPrice, setShiftingNttnUnitPrice] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💥 CRITICAL: Ref to track the last edited field for two-way binding
  const lastEdited = useRef(null);

  /* ---------- formik ---------- */
  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: shiftCapacitySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSave(values, resetForm);
    },
  });

  /* ---------- bootstrap data ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const [nttn, cats, wos] = await Promise.all([
          fetchNTTNs(),
          fetchCategories(),
          fetchWorkOrders(),
        ]);
        setNttnProviders(nttn.data);
        setClientCategories(cats.data);

        setWorkOrders(Array.isArray(wos) ? wos : wos?.data || []);
      } catch (e) {
        showToast?.(e.message || 'Failed to load form data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- cascading selects and API fetches ---------- */

  useEffect(() => {
    if (!formik.values.nttn_provider) return;
    fetchBandwidthRangesByID(parseInt(formik.values.nttn_provider))
      .then(setBandwidthRanges)
      .catch(() => setBandwidthRanges([]));
  }, [formik.values.nttn_provider]);

  // Fetch NTTN Rates and store them
  useEffect(() => {
    if (!formik.values.nttn_provider) return;
    getRatesByNttn(parseInt(formik.values.nttn_provider))
      .then((res) => {
        setNttnRatesOptions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [formik.values.nttn_provider]);

  useEffect(() => {
    if (!formik.values.client_category) {
      setClients([]);
      formik.setFieldValue('client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.client_category)
      .then((res) => {
        setClients(res.data);
      })
      .catch(() => setClients([]));
  }, [formik.values.client_category]);

  useEffect(() => {
    if (!formik.values.shifting_client_category) {
      setShiftingClients([]);
      formik.setFieldValue('shifting_client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.shifting_client_category)
      .then((res) => {
        setShiftingClients(res.data);
      })
      .catch(() => setShiftingClients([]));
  }, [formik.values.shifting_client_category]);

  // get work order category and client wise (Source)
  useEffect(() => {
    const { client, client_category } = formik.values;
    if (!client || !client_category) return;

    // Resetting fields before fetching
    setNttnLinkIds([]);
    setWorkOrderDetailsData([]);
    formik.setFieldValue('nttn_link_id', '');

    const fetchData = async () => {
      try {
        const { data } = await getWorkOrderCategoryAndClientWise({
          cat_id: client_category,
          client_id: client,
        });
        setNttnLinkIds(data);
        setWorkOrderDetailsData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };

    fetchData();
  }, [formik.values.client, formik.values.client_category]);

  useEffect(() => {
    if (!formik.values.nttn_link_id) return;

    const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
    const totalCapasityCost = filtered?.rate * filtered?.request_capacity;

    if (filtered) {
      setShiftingSourceRates(filtered?.rate);
      formik.setFieldValue('capacity', filtered?.request_capacity);
      formik.setFieldValue('capacity_cost', parseFloat(totalCapasityCost).toFixed(2) || 0);
    }
  }, [formik.values.nttn_link_id, workOrderDetailsData]);

  // get work order shifting category and client wise (Target)
  useEffect(() => {
    const { shifting_client, shifting_client_category } = formik.values;
    if (!shifting_client || !shifting_client_category) return;

    // Resetting fields before fetching
    setShiftingClientLinkIds([]);
    setShiftingWorkOrderDetailsData([]);
    formik.setFieldValue('shifting_link_id', '');

    const fetchShiftingData = async () => {
      try {
        const { data } = await getWorkOrderCategoryAndClientWise({
          cat_id: shifting_client_category,
          client_id: shifting_client,
        });
        setShiftingClientLinkIds(data);
        setShiftingWorkOrderDetailsData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };

    fetchShiftingData();
  }, [formik.values.shifting_client, formik.values.shifting_client_category]);

  useEffect(() => {
    if (!formik.values.shifting_link_id) return;

    const filtered = shiftingWorkOrderDetailsData?.find(
      (item) => item.id === formik.values.shifting_link_id
    );

    if (filtered) {
      // NOTE: We don't want this to override the Unit Cost if the user selects from the dropdown
      // This logic is typically for existing/linked WO, but for shifting, we rely on BW range.
      // Keeping it simple: it sets a default if a WO is linked, but the dropdown selection should take priority.
      formik.setFieldValue('shifting_unit_cost', filtered?.rate || 0);
    }
  }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

  /* ------------------------------------------- */
  /* ---------- Two-Way Calculation Logic ---------- */
  /* ------------------------------------------- */

  // Calculation 1: Calculate **Shifting Amount (Capacity)** from **Shifting BW** (Cost = BW * Rate)
  useEffect(() => {
    const { shifting_bw, shifting_unit_price_dropdown } = formik.values;

    // Exit if 'capacity' was edited last, or if required values are missing
    if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) {
      return;
    }

    // Find the selected rate
    const selectedRateOption = nttnRatesOptions.find(
      (item) => item.id === shifting_unit_price_dropdown
    );

    const unitRate = parseFloat(selectedRateOption?.rate) || 0;
    const bw = parseFloat(shifting_bw);

    if (unitRate <= 0 || bw <= 0) {
      formik.setFieldValue('shifting_capacity', '', false);
      return;
    }

    // Calculation: Shifting Amount = BW * Rate
    const shiftingAmount = bw * unitRate;

    // Update the Shifting Amount/Capacity field
    formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
  }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

  // Calculation 2: Calculate **Shifting BW** from **Shifting Amount (Capacity)** (BW = Cost / Rate)
  useEffect(() => {
    const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;

    // Exit if 'bw' was edited last, or if required values are missing
    if (
      lastEdited.current === 'bw' ||
      !shifting_unit_price_dropdown ||
      !shifting_capacity ||
      parseFloat(shifting_capacity) <= 0
    ) {
      // formik.setFieldValue('shifting_bw', '', false); // Only clear if we need to remove the calculated value entirely
      return;
    }

    // Find the selected rate
    const selectedRateOption = nttnRatesOptions.find(
      (item) => item.id === shifting_unit_price_dropdown
    );

    const unitRate = parseFloat(selectedRateOption?.rate);
    const shiftingCost = parseFloat(shifting_capacity);

    if (!unitRate || unitRate <= 0) {
      console.error('Selected Unit Rate is invalid or zero.');
      formik.setFieldValue('shifting_bw', '', false);
      return;
    }

    // Calculation: Bandwidth (BW) = Cost / Rate
    const calculatedBW = shiftingCost / unitRate;
    const finalBW = Math.floor(calculatedBW);

    formik.setFieldValue('shifting_bw', finalBW, false);
  }, [
    formik.values.shifting_capacity,
    formik.values.shifting_unit_price_dropdown,
    nttnRatesOptions,
  ]);

  /* ------------------------------------------- */
  /* ---------- Final Cost/Capacity Calculation ---------- */
  /* ------------------------------------------- */

  // Calculate After Shifting Capacity and Total Shifting Cost
  // useEffect(() => {
  //   const capacity = parseInt(formik.values.capacity) || 0;
  //   const shifting = parseInt(formik.values.shifting_bw) || 0;
  //   const unitCost = parseFloat(formik.values.shifting_unit_cost) || 0;

  //   const selectedRateOption = nttnRatesOptions.find(
  //     (item) => item.id === formik.values.shifting_unit_price_dropdown
  //   );
  //   const unitRate = parseFloat(selectedRateOption?.rate);

  //   const afterShifting = capacity - shifting;
  //   const totalShifting = afterShifting * unitRate;

  //   formik.setFieldValue('after_shifting_capacity', afterShifting, false);
  //   formik.setFieldValue('total_shifting_cost', totalShifting.toFixed(2), false);
  // }, [formik.values.capacity, formik.values.shifting_bw, formik.values.shifting_unit_cost]);

  // useEffect(() => {
  //   const capacity = parseInt(formik.values.capacity) || 0;
  //   const shifting = parseInt(formik.values.shifting_bw) || 0;
  //   const unitCost = parseFloat(formik.values.shifting_unit_cost) || 0;

  //   const afterShifting = capacity - shifting;
  //   const totalShiftingCapacity = shifting * unitCost;
  //   const totalShifting = afterShifting * unitCost;

  //   formik.setFieldValue('shifting_capacity', totalShiftingCapacity, false);
  //   formik.setFieldValue('total_shifting_cost', totalShifting.toFixed(2), false);
  //   formik.setFieldValue('after_shifting_capacity', afterShifting, false);
  // }, [formik.values.capacity, formik.values.shifting_bw, formik.values.shifting_unit_cost]);

  // Calculate After Shifting Capacity and Total Shifting Cost
  useEffect(() => {
    const capacity = parseInt(formik.values.capacity) || 0;
    const shiftingBW = parseInt(formik.values.shifting_bw) || 0;

    let effectiveUnitCost = parseFloat(formik.values.shifting_unit_cost) || 0;

    // 1. Determine the effective Unit Cost
    // If a rate is selected from the dropdown, use that rate
    if (formik.values.shifting_unit_price_dropdown) {
      const selectedRateOption = nttnRatesOptions.find(
        (item) => item.id === formik.values.shifting_unit_price_dropdown
      );
      const dropdownRate = parseFloat(selectedRateOption?.rate);

      // Use the dropdown rate if it's a valid number
      if (!isNaN(dropdownRate) && dropdownRate > 0) {
        effectiveUnitCost = dropdownRate;
      }
    }

    // 2. Calculate Final Values
    const afterShiftingCapacity = capacity - shiftingBW;

    // Total Shifting Cost = After Shifting Capacity * Effective Unit Cost
    const totalShiftingCost = afterShiftingCapacity * effectiveUnitCost;

    if (!formik.values.shifting_unit_price_dropdown) {
      formik.setFieldValue('shifting_capacity', parseFloat(shiftingBW * effectiveUnitCost), false);
    }
    // 3. Update Formik State
    formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity, false);
    formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);

    // NOTE: 'shifting_capacity' (Shifting Amount) is calculated in the two-way logic (Calculation 1 and 2).
    // Do NOT recalculate it here, as it conflicts with the two-way binding.
  }, [
    formik.values.capacity,
    formik.values.shifting_bw,
    formik.values.shifting_unit_cost, // Keep in dependency array for manual entry fallback
    formik.values.shifting_unit_price_dropdown, // Crucial dependency
    nttnRatesOptions, // Crucial dependency
  ]);
  /* ---------- submit ---------- */
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
      // NOTE: Remove the 'shifting_unit_price_dropdown' field before sending to API
      const { shifting_unit_price_dropdown, ...payload } = values;

      const res = await createCapacityShifting(payload);
      showToast?.(res.message, 'success');

      resetForm();
      onCancel(); // close form
    } catch (e) {
      showToast?.(e.message || 'Save failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log('formik.values', formik.values);
  /* ---------- render ---------- */
  if (isLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading form data...</span>
      </div>
    );
  }

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
        {/* header – identical to SurveyForm / BWModificationForm */}
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
              {isEditMode ? 'Edit Capacity Shift' : 'Add Capacity Shift'}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? 'update' : 'add a new'} capacity-shift record.
            </p>
          </div>
        </div>

        {/* Shifting Source */}
        <FormSection title="Shifting Source">
          <SelectField
            name="nttn_provider"
            placeholder="NTTN Name*"
            options={nttnProviders.map((p) => ({
              value: p.id,
              label: p.nttn_name,
            }))}
            onChange={(v) => formik.setFieldValue('nttn_provider', v)}
            searchable
          />
          <SelectField
            name="client_category"
            placeholder="Client Category *"
            options={clientCategories.map((c) => ({
              value: c.id,
              label: c.cat_name,
            }))}
            onChange={(v) => {
              formik.setFieldValue('client_category', v);
              formik.setFieldValue('client', '');
            }}
            searchable
            disabled={!formik.values.nttn_provider}
          />
          <SelectField
            name="client"
            placeholder="Client Name *"
            options={clients.map((c) => ({
              value: c.id,
              label: c.client_name,
            }))}
            onChange={(v) => formik.setFieldValue('client', v)}
            searchable
            disabled={!formik.values.client_category}
          />
          <SelectField
            name="nttn_link_id"
            placeholder="Work Order Link ID*"
            options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_id }))}
            onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
            searchable
            disabled={!formik.values.client}
          />
        </FormSection>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 ">
          <div className="grid grid-cols-1 sm:grid-cols-4 justify-items-center items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity:</strong>{' '}
                {formik.values.capacity || 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Unit Price:</strong>{' '}
                {(shiftingSourceRates && shiftingSourceRates) || '0.00'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity Cost:</strong>{' '}
                {formik.values.capacity_cost || '0.00'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shiffting Cost:</strong>{' '}
                {formik.values.total_shifting_cost || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Shifting Target */}
        <FormSection title="Shifting Target">
          {/* ----- 3-in-a-row : Shifting Client Category / Name / Link ID ----- */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <SelectField
              name="shifting_client_category"
              placeholder="Shifting Client Category *"
              options={clientCategories.map((c) => ({
                value: c.id,
                label: c.cat_name,
              }))}
              onChange={(v) => {
                formik.setFieldValue('shifting_client_category', v);
                formik.setFieldValue('shifting_client', '');
              }}
              searchable
            />
            <SelectField
              name="shifting_client"
              placeholder="Shifting Client Name *"
              options={shiftingClients.map((c) => ({
                value: c.id,
                label: c.client_name,
              }))}
              onChange={(v) => formik.setFieldValue('shifting_client', v)}
              searchable
              disabled={!formik.values.shifting_client_category}
            />
            <SelectField
              name="shifting_link_id"
              placeholder="Shifting Work Order Link ID"
              options={shiftingClientLinkIds.map((nttn) => ({
                value: nttn.id,
                label: nttn.nttn_id,
              }))}
              onChange={(v) => formik.setFieldValue('shifting_link_id', v)}
              searchable
              isClearable
            />
          </div>

          {/* ----- 4-in-a-row : Shifting BW / Amount / Unit Cost / Total ----- */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <InputField
              name="shifting_bw"
              label="Shifting BW *"
              type="number"
              step="1" // Step changed to 1 for integer BW
              onChange={(e) => {
                formik.handleChange(e);
                lastEdited.current = 'bw'; // 💥 Track last edited
              }}
            />
            <InputField
              name="shifting_capacity"
              label="Shifting Amount *"
              type="number"
              step="0.01"
              onChange={(e) => {
                formik.handleChange(e);
                lastEdited.current = 'capacity'; // 💥 Track last edited

                if (e.target.value.trim() !== '' && formik.values.nttn_provider) {
                  setShowShiftingDropdown(true);
                } else {
                  setShowShiftingDropdown(false);
                  formik.setFieldValue('shifting_unit_price_dropdown', '');
                }
              }}
            />
            {showShiftingDropdown && (
              <SelectField
                name="shifting_unit_price_dropdown"
                placeholder="Select Unit Price"
                options={nttnRatesOptions.map((r) => ({
                  label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
                  value: r.id,
                }))}
                onChange={(selectedRateId) => {
                  formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);

                  // 💥 CRITICAL: Find rate and set it to the disabled Unit Cost field
                  // const selectedOption = nttnRatesOptions.find((opt) => opt.id === selectedRateId);
                  // const selectedRate = selectedOption?.rate || 0;
                  // formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate).toFixed(2));

                  lastEdited.current = 'capacity'; // Treat rate change like a capacity edit to trigger BW calc
                }}
                searchable
              />
            )}
            {!showShiftingDropdown && (
              <InputField
                name="shifting_unit_cost"
                label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
                type="number"
                step="0.01"
                disabled // Keep disabled as it's derived from the dropdown
              />
            )}

            <InputField
              name="total_shifting_cost"
              label="Total Shifting Cost"
              type="number"
              step="0.01"
              className="hidden"
              disabled
            />
            <InputField
              name="after_shifting_capacity"
              label="After-Shifting Capacity"
              type="number"
              step="0.01"
              disabled
            />
          </div>
        </FormSection>

        {/* Actions – identical bar */}
        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            intent="submit"
            type="submit"
            loading={isSubmitting}
            loadingText="Saving..."
            disabled={isSubmitting || !formik.isValid}
          >
            Save
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default ShiftCapacityForm;
