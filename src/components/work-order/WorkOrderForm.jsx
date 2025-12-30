// import React, { useState, useEffect } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// // import DatePickerField from '../fields/DateField';
// import DatePickerField from './../fields/DatePickerField';
// import { ArrowLeft, MapPin, Building, Pin, Globe } from 'lucide-react';
// import { fetchSBUs } from '../../services/sbu';
// import { fetchLinkTypes } from '../../services/linkType';
// import { fetchAggregators } from '../../services/aggregator';
// import { fetchKams } from '../../services/kam';
// import { fetchNTTNs } from '../../services/nttn';
// import {
//   fetchClientDetailsByClient,
//   fetchSurveysByClientLaravel,
//   fetchSurveysDetailsByClient,
// } from '../../services/survey';
// import { fetchClientsCategoryWise, fetchCategoriesBySBU } from '../../services/client';
// // import { surveySchema } from '../../validations/surveyValidation';
// import { workOrderValidationSchema } from '../../validations/workOrderValidation';
// import { showToast } from '../constants/message';
// import { fetchRatesByNttn } from '../../services/rate';
// import { format, isValid, parseISO } from 'date-fns';
// import { useAuth } from '../../app/AuthContext';
// import { fetchReasons } from '../../services/reason';

// const FormSection = ({ title, icon: Icon, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900 flex items-center">
//       {Icon && <Icon size={24} className="mr-2 text-gray-500" />}
//       {title}
//     </legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// const WorkOrderForm = ({ initialValues, isEditMode, onSubmit, onCancel }) => {
//   const [sbuOptions, setSbuOptions] = useState([]);
//   const [linkTypeOptions, setLinkTypeOptions] = useState([]);
//   const [aggregatorOptions, setAggregatorOptions] = useState([]);
//   const [kamOptions, setKamOptions] = useState([]);
//   const [nttnOptions, setNttnOptions] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);
//   const [clientOptions, setClientOptions] = useState([]);
//   const [surveyOptions, setSurveyOptions] = useState([]);
//   const [reasonOptions, setReasonOptions] = useState([]);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isLoadingSurveyDetails, setIsLoadingSurveyDetails] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isFormLoaded, setIsFormLoaded] = useState(false);
//   const [surveyLocked, setSurveyLocked] = useState({});
//   const [autoFilledFields, setAutoFilledFields] = useState(new Set());
//   const [hasCalculatedEditModeRates, setHasCalculatedEditModeRates] = useState(false);
//   const [showReasonField, setShowReasonField] = useState(false);
//   const [rateType, setRateType] = useState(null);

//   const { user } = useAuth();

//   const sanitizeInitialValues = (values) => {
//     const sanitized = { ...values };
//     Object.keys(sanitized).forEach((key) => {
//       if (sanitized[key] === null || sanitized[key] === undefined) {
//         sanitized[key] = '';
//       }
//       // Handle date fields specifically
//       if (['submission', 'requested_delivery', 'service_handover'].includes(key)) {
//         if (sanitized[key] && sanitized[key] !== '0000-00-00 00:00:00') {
//           try {
//             const dateObj = new Date(sanitized[key]);
//             if (!isNaN(dateObj.getTime())) {
//               sanitized[key] = format(dateObj, 'yyyy-MM-dd');
//             } else {
//               sanitized[key] = '';
//             }
//           } catch (e) {
//             sanitized[key] = '';
//           }
//         } else {
//           sanitized[key] = '';
//         }
//       }
//       // Handle reason_id as string
//       if (key === 'reason_id' && sanitized[key]) {
//         sanitized[key] = String(sanitized[key]);
//       }
//     });
//     return sanitized;
//   };

//   const defaultFormValues = {
//     type_id: 2,
//     survey_id: '',
//     sbu_id: '',
//     link_type_id: '',
//     nttn_work_order_id: '',
//     aggregator_id: '',
//     kam_id: '',
//     nttn_id: '',
//     nttn_survey_id: '',
//     nttn_lat: '',
//     nttn_long: '',
//     cat_id: '',
//     client_id: '',
//     client_lat: '',
//     client_long: '',
//     mac_user: '',
//     work_order_mac_user: '',
//     division: '',
//     district: '',
//     thana: '',
//     address: '',
//     request_capacity: '',
//     total_cost_of_request_capacity: '',
//     shift_capacity: false,
//     shifting_capacity: '',
//     shifting_capacity_price: '',
//     net_capacity: '',
//     unit_rate: '',
//     rate_id: '',
//     modify_status: '',
//     vlan: '',
//     reason_id: '',
//     remarks: '',
//     status: 'active',
//     submission: '',
//     requested_delivery: '',
//     service_handover: '',
//     posted_by: '',
//   };

//   const formik = useFormik({
//     initialValues: { ...defaultFormValues, ...sanitizeInitialValues(initialValues) },
//     validationSchema: workOrderValidationSchema,
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       console.log('🚀 FORM SUBMIT STARTED', values);
//       setIsSubmitting(true);
//       try {
//         const payload = { ...values };

//         payload['posted_by'] = user?.name ?? 'Frontend Guest';
//         delete payload.survey_id;

//         const numericFields = [
//           'request_capacity',
//           'unit_rate',
//           'total_cost_of_request_capacity',
//           'shifting_capacity',
//           'shifting_capacity_price',
//           'net_capacity',
//           'mac_user',
//           'work_order_mac_user',
//           'sbu_id',
//           'link_type_id',
//           'aggregator_id',
//           'kam_id',
//           'nttn_id',
//           'cat_id',
//           'client_id',
//           'rate_id',
//         ];

//         numericFields.forEach((field) => {
//           if (payload[field] === '') {
//             payload[field] = null;
//           } else if (payload[field]) {
//             payload[field] = Number(payload[field]);
//           }
//         });

//         // Handle reason_id as string (varchar)
//         if (payload.reason_id === '') {
//           payload.reason_id = null;
//         }

//         // Handle modify_status - only include in edit mode
//         if (!isEditMode) {
//           delete payload.modify_status;
//         } else {
//           if (payload.modify_status === '') {
//             payload.modify_status = null;
//           }
//         }

//         const dateFields = ['submission', 'requested_delivery', 'service_handover'];
//         dateFields.forEach((field) => {
//           if (payload[field]) {
//             try {
//               const dateObj =
//                 typeof payload[field] === 'string' ? parseISO(payload[field]) : payload[field];
//               if (isValid(dateObj)) {
//                 payload[field] = format(dateObj, 'yyyy-MM-dd');
//               } else {
//                 payload[field] = null;
//               }
//             } catch (e) {
//               console.error(`Error formatting date field ${field}:`, e);
//               payload[field] = null;
//             }
//           } else {
//             payload[field] = null;
//           }
//         });

//         const statusValue = payload.status;
//         delete payload.status;
//         payload.survey_status = statusValue;
//         payload.status = statusValue;

//         await onSubmit(payload, { resetForm });
//       } catch (error) {
//         console.error('💥 FORM SUBMIT FAILED', error);
//         showToast.error(error?.response?.data?.message || 'Save failed!');
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//   });

//   const findSelectedOption = (fieldName, options) => {
//     const value = formik.values[fieldName];
    
//     if (value === null || value === undefined || value === '' || !options || options.length === 0) {
//       return null;
//     }

//     const foundOption = options.find((option) => {
//       const optionValue = option.value;
//       const formikValue = value;
//       return String(optionValue) === String(formikValue);
//     });

//     return foundOption || null;
//   };

//   // Monitor status changes to show/hide reason field
//   useEffect(() => {
//     const shouldShowReason = isEditMode && formik.values.status === 'inactive';
//     setShowReasonField(shouldShowReason);
    
//     // If status changes from inactive to active, clear reason_id
//     if (formik.values.status === 'active' && formik.values.reason_id) {
//       formik.setFieldValue('reason_id', '');
//     }
//   }, [formik.values.status, isEditMode, formik.values.reason_id]);

//   // Handle select changes
//   const handleSelectChange = async (fieldName, selectedValue) => {
//     console.log(`📡 ========== SELECT CHANGE DETECTED ==========`);
//     console.log(`📡 Field: ${fieldName}`);
//     console.log(`📡 Selected Value:`, selectedValue);
    
//     const actualValue = selectedValue?.value ?? selectedValue;
//     console.log(`📡 Actual Value (extracted):`, actualValue);

//     formik.setFieldValue(fieldName, actualValue);
//     formik.setFieldTouched(fieldName, true);

//     if (fieldName === 'survey_id') {
//       console.log('🎯 This is a SURVEY_ID change, calling handleSurveySelectChange...');
//       await handleSurveySelectChange(actualValue);
//       return;
//     }

//     // Clear dependent fields when parent fields change
//     if (fieldName === 'sbu_id') {
//       console.log('🔄 SBU changed, clearing dependent fields...');
//       formik.setFieldValue('cat_id', '');
//       formik.setFieldValue('client_id', '');
//       formik.setFieldValue('survey_id', '');
//       setCategoryOptions([]);
//       setClientOptions([]);
//       setSurveyOptions([]);
//       clearSurveyFields();
//       ['division', 'district', 'thana', 'address'].forEach((field) =>
//         formik.setFieldValue(field, '')
//       );
//     }

//     if (fieldName === 'cat_id') {
//       console.log('🔄 Category changed, clearing dependent fields...');
//       formik.setFieldValue('client_id', '');
//       formik.setFieldValue('survey_id', '');
//       setClientOptions([]);
//       setSurveyOptions([]);
//       clearSurveyFields();
//       ['division', 'district', 'thana', 'address'].forEach((field) =>
//         formik.setFieldValue(field, '')
//       );
//     }

//     if (fieldName === 'client_id') {
//       console.log('🔄 Client changed, clearing survey...');
//       formik.setFieldValue('survey_id', '');
//       setSurveyOptions([]);
//       clearSurveyFields();
//     }
//   };

//   // Function to clear survey-related fields
//   const clearSurveyFields = () => {
//     console.log('🧹 Clearing all survey-related fields');
//     const fieldsToClear = [
//       'link_type_id',
//       'aggregator_id',
//       'kam_id',
//       'nttn_id',
//       'nttn_survey_id',
//       'nttn_lat',
//       'nttn_long',
//       'client_lat',
//       'client_long',
//       'mac_user',
//       'nttn_work_order_id',
//       'request_capacity',
//       'unit_rate',
//       'rate_id',
//       'total_cost_of_request_capacity',
//     ];
    
//     fieldsToClear.forEach((field) => {
//       formik.setFieldValue(field, defaultFormValues[field] || '');
//     });
    
//     setSurveyLocked({});
//     setAutoFilledFields(new Set());
//   };

//   // Function to auto-fill client location from client details API
//   const autoFillClientLocation = (clientDetails) => {
//     if (!clientDetails || typeof clientDetails !== 'object') {
//       console.log('❌ No valid client details object provided to autoFillClientLocation');
//       return;
//     }

//     console.log('📍 Auto-filling client location with details:', clientDetails);
//     const filledFields = new Set();

//     const locationFields = {
//       division: clientDetails.division_name || clientDetails.division,
//       district: clientDetails.district_name || clientDetails.district,
//       thana: clientDetails.thana_name || clientDetails.thana,
//       address: clientDetails.address,
//     };

//     console.log('🗺️ Location fields to fill:', locationFields);
//     Object.entries(locationFields).forEach(([field, value]) => {
//       const currentValue =
//         formik.values[field] === null || formik.values[field] === undefined
//           ? ''
//           : String(formik.values[field]);
//       const validValue = value !== null && value !== undefined && String(value).trim() !== '';

//       if (currentValue === '' && validValue) {
//         formik.setFieldValue(field, value);
//         filledFields.add(field);
//         console.log(`✅ Auto-filled client ${field}:`, value);
//       } else if (currentValue !== '' && validValue) {
//         console.log(`ℹ️ Field ${field} already has value: ${currentValue}, not overwriting.`);
//       } else {
//         console.log(`❌ No valid value for field ${field} in API response.`);
//       }
//     });

//     if (filledFields.size > 0) {
//       console.log(`🎉 Successfully auto-filled ${filledFields.size} location fields.`);
//     } else {
//       console.log('ℹ️ No location fields were auto-filled.');
//     }
//   };

//   // Function to auto-fill fields from survey data
//   const autoFillFromSurvey = (survey, forceClear = false) => {
//     if (!survey || Object.keys(survey).length === 0 || forceClear) {
//       console.log('🧹 Clearing survey fields (force clear or no survey data)');
//       clearSurveyFields();
//       return;
//     }

//     console.log('🔄 Auto-filling fields from survey:', survey);
//     const filledFields = new Set();
//     const fieldMapping = {
//       link_type_id: survey.link_type_id,
//       aggregator_id: survey.aggregator_id,
//       kam_id: survey.kam_id,
//       nttn_id: survey.nttn_id,
//       nttn_survey_id: survey.nttn_survey_id,
//       nttn_lat: survey.nttn_lat,
//       nttn_long: survey.nttn_long,
//       client_lat: survey.client_lat,
//       client_long: survey.client_long,
//       mac_user: survey.mac_user,
//       nttn_work_order_id: survey.nttn_work_order_id,
//       request_capacity: survey.request_capacity,
//       unit_rate: survey.unit_rate,
//       rate_id: survey.rate_id,
//       total_cost_of_request_capacity: survey.total_cost_of_request_capacity,
//     };

//     console.log('📋 Field mapping to apply:', fieldMapping);

//     // Force update all fields with new survey data
//     Object.entries(fieldMapping).forEach(([field, value]) => {
//       if (value !== null && value !== undefined && value !== '') {
//         formik.setFieldValue(field, value);
//         filledFields.add(field);
//         console.log(`✅ Auto-filled ${field} from survey:`, value);
//       } else {
//         // Clear field if no value in survey
//         formik.setFieldValue(field, '');
//         console.log(`🧹 Cleared ${field} (no value in survey)`);
//       }
//     });

//     const lockedFields = {};
//     const fieldsToLock = [
//       'link_type_id',
//       'nttn_work_order_id',
//       'client_lat',
//       'client_long',
//       'aggregator_id',
//       'kam_id',
//     ];
//     fieldsToLock.forEach((field) => {
//       if (survey[field] !== null && survey[field] !== undefined && survey[field] !== '') {
//         lockedFields[field] = true;
//       }
//     });
//     setSurveyLocked(lockedFields);
//     setAutoFilledFields(filledFields);
    
//     console.log(`✅ Successfully auto-filled ${filledFields.size} fields from survey`);
//     console.log('🔒 Locked fields:', lockedFields);
//   };

//   // Handle survey selection
//   const handleSurveySelectChange = async (nttnSurveyId) => {
//     console.log('🔄 ========== SURVEY SELECTION CHANGED ==========');
//     console.log('🔄 New Survey ID:', nttnSurveyId);
    
//     formik.setFieldValue('survey_id', nttnSurveyId);
//     formik.setFieldTouched('survey_id', true);

//     // FIRST: Clear all auto-filled fields
//     console.log('🧹 Step 1: Clearing all previously auto-filled survey data');
//     clearSurveyFields();

//     const clientId = formik.values.client_id;
//     const catId = formik.values.cat_id;

//     console.log('📋 Current Form State - Client ID:', clientId, 'Category ID:', catId);

//     // If no survey selected, just clear and return
//     if (!nttnSurveyId || nttnSurveyId === '') {
//       console.log('ℹ️ No survey selected, all fields cleared');
//       return;
//     }

//     if (!clientId || !catId) {
//       console.log('❌ Missing client ID or category ID for detail fetch');
//       showToast.error('Please select client and category first');
//       return;
//     }

//     setIsLoadingSurveyDetails(true);
//     try {
//       console.log(`📡 Step 2: Fetching survey details...`);
//       console.log(`   - Client ID: ${clientId}`);
//       console.log(`   - Category ID: ${catId}`);
//       console.log(`   - NTTN Survey ID: ${nttnSurveyId}`);
      
//       const surveysData = await fetchSurveysDetailsByClient(clientId, catId, nttnSurveyId);
//       console.log('📦 Raw API Response:', surveysData);
      
//       const surveysArray = surveysData?.data || surveysData;
//       console.log('📦 Processed Survey Array:', surveysArray);

//       if (Array.isArray(surveysArray) && surveysArray.length > 0) {
//         console.log('✅ Step 3: Survey details found! Auto-filling now...');
//         console.log('📝 Survey Data to Fill:', surveysArray[0]);
        
//         autoFillFromSurvey(surveysArray[0], false);
//         // showToast.success('Survey details loaded successfully');
        
//         console.log('✅ ========== SURVEY LOADING COMPLETE ==========');
//       } else {
//         console.log('⚠️ No survey details found in response');
//         console.log('⚠️ Response was:', { surveysData, surveysArray });
//         // showToast.error('No details found for selected survey');
//         clearSurveyFields();
//       }
//     } catch (err) {
//       console.error('💥 ========== ERROR LOADING SURVEY ==========');
//       console.error('💥 Error details:', err);
//       console.error('💥 Error response:', err.response);
//       showToast.error('Failed to load survey details: ' + (err.message || 'Unknown error'));
//       clearSurveyFields();
//     } finally {
//       setIsLoadingSurveyDetails(false);
//     }
//   };

//   // Function to calculate rates based on NTTN, Link Type, and capacity
//   const calculateRates = async (nttnId, requestCapacity, linkTypeId) => {
//     if (!nttnId || !requestCapacity) {
//       formik.setFieldValue('unit_rate', '');
//       formik.setFieldValue('rate_id', '');
//       return;
//     }

//     setIsLoadingRates(true);
//     try {
//       console.log(`📡 Calculating rates for NTTN: ${nttnId}, Capacity: ${requestCapacity}, Link Type: ${linkTypeId || 'Not provided'}`);
      
//       const rate = await fetchRatesByNttn(nttnId, requestCapacity, linkTypeId);
//       console.log('📊 Rate fetched:', rate);

//       if (rate && rate.id) {
//         console.log('✅ Matching rate found:', rate);
//         formik.setFieldValue('unit_rate', rate.rate);
//         formik.setFieldValue('rate_id', rate.id);
//       } else {
//         console.log('❌ No matching rate found');
//         formik.setFieldValue('unit_rate', '');
//         formik.setFieldValue('rate_id', '');
//         showToast.error("No rate found for the selected parameters");
//       }
//     } catch (err) {
//       console.error('💥 Error calculating rates:', err);
      
//       if (err.response && err.response.status === 404) {
//         formik.setFieldValue('unit_rate', '');
//         formik.setFieldValue('rate_id', '');
//         showToast.error("No rate found for the selected NTTN, link type, and capacity range");
//       } else {
//         showToast.error("Failed to calculate rates");
//       }
//     } finally {
//       setIsLoadingRates(false);
//     }
//   };

//   // USE EFFECT to fetch client location and survey options
//   useEffect(() => {
//     const fetchClientDataAndSurveys = async () => {
//       const clientId = formik.values.client_id;
//       const catId = formik.values.cat_id;

//       if (!clientId || !catId) {
//         setSurveyOptions([]);
//         clearSurveyFields();
//         return;
//       }

//       try {
//         console.log(
//           `📡 [USE EFFECT] Fetching client details & surveys for client: ${clientId}, category: ${catId}`
//         );

//         // 1️⃣ Fetch Client Details (Location) - DO THIS FOR BOTH MODES
//         const clientDetails = await fetchClientDetailsByClient(clientId, catId);

//         if (clientDetails && typeof clientDetails === 'object' && clientDetails.id) {
//           autoFillClientLocation(clientDetails);
//         } else {
//           console.log(
//             '❌ Failed to get client details object from service response or client not found in DB.'
//           );
//           showToast.error('Client details not found');
//           ['division', 'district', 'thana', 'address'].forEach((field) =>
//             formik.setFieldValue(field, '')
//           );
//         }

//         // 2️⃣ Fetch Surveys (for Survey ID dropdown) - SKIP IN EDIT MODE
//         if (!isEditMode) {
//           const surveysResponse = await fetchSurveysByClientLaravel(clientId, catId);
          
//           // Handle the response - it should contain an array of surveys
//           let surveysData = [];
//           if (surveysResponse && surveysResponse.data && Array.isArray(surveysResponse.data)) {
//             surveysData = surveysResponse.data;
//           } else if (Array.isArray(surveysResponse)) {
//             surveysData = surveysResponse;
//           }

//           console.log('📊 Surveys fetched:', surveysData);

//           if (Array.isArray(surveysData) && surveysData.length > 0) {
//             // Map all surveys with nttn_survey_id to dropdown options
//             const mappedSurveys = surveysData
//               .filter(s => s.nttn_survey_id) // Only include surveys with nttn_survey_id
//               .map((s) => ({
//                 value: s.nttn_survey_id,
//                 label: `Survey ID: ${s.nttn_survey_id}`,
//                 _raw: s,
//               }));
            
//             console.log('📋 Mapped survey options:', mappedSurveys);
//             setSurveyOptions(mappedSurveys);

//             // Get current survey selection
//             const currentSurveyId = formik.values.survey_id;
//             console.log('🔍 Current survey_id in form:', currentSurveyId);
            
//             if (currentSurveyId && currentSurveyId !== '') {
//               console.log('✅ Loading existing survey:', currentSurveyId);
//               const surveyExists = mappedSurveys.some(s => String(s.value) === String(currentSurveyId));
//               if (surveyExists) {
//                 // Use setTimeout to ensure dropdown is populated first
//                 setTimeout(() => {
//                   handleSurveySelectChange(currentSurveyId);
//                 }, 200);
//               } else {
//                 console.log('⚠️ Current survey ID not found in options');
//               }
//             }
//           } else {
//             setSurveyOptions([]);
//             clearSurveyFields();
//             console.log('ℹ️ [USE EFFECT] No surveys found for this client');
//           }
//         } else {
//           // In edit mode, don't fetch surveys - just set empty options
//           console.log('ℹ️ Edit mode: Not fetching surveys to preserve existing data');
//           setSurveyOptions([]);
//         }
//       } catch (err) {
//         console.error('💥 Error fetching client details or surveys:', err);
//         setSurveyOptions([]);
//       }
//     };

//     const timer = setTimeout(() => {
//       fetchClientDataAndSurveys();
//     }, 100);

//     return () => clearTimeout(timer);
//   }, [formik.values.client_id, formik.values.cat_id, isEditMode]);

//   // Load all static data on component mount
//   useEffect(() => {
//     const loadStaticData = async () => {
//       try {
//         const [sbuRes, linkTypeRes, aggregatorRes, kamRes, nttnRes, reasonRes] = await Promise.all([
//           fetchSBUs(),
//           fetchLinkTypes(),
//           fetchAggregators(),
//           fetchKams(),
//           fetchNTTNs(),
//           fetchReasons(),
//         ]);

//         console.log('📊 NTTN Data received:', nttnRes);

//         setSbuOptions(
//           Array.isArray(sbuRes.data)
//             ? sbuRes.data.map((item) => ({ value: item.id, label: item.sbu_name }))
//             : []
//         );
//         setLinkTypeOptions(
//           Array.isArray(linkTypeRes.data)
//             ? linkTypeRes.data.map((item) => ({ value: item.id, label: item.type_name }))
//             : []
//         );
//         setAggregatorOptions(
//           Array.isArray(aggregatorRes.data)
//             ? aggregatorRes.data.map((item) => ({
//                 value: item.id,
//                 label: item.aggregator_name,
//               }))
//             : []
//         );
//         setKamOptions(
//           Array.isArray(kamRes.data)
//             ? kamRes.data.map((item) => ({ value: item.id, label: item.kam_name }))
//             : []
//         );

//         // Handle NTTN data properly
//         let nttnData = [];
//         if (Array.isArray(nttnRes)) {
//           nttnData = nttnRes;
//         } else if (nttnRes && nttnRes.data && Array.isArray(nttnRes.data)) {
//           nttnData = nttnRes.data;
//         } else if (nttnRes && Array.isArray(nttnRes)) {
//           nttnData = nttnRes;
//         }

//         const mappedNttns = nttnData.map((item) => ({
//           value: item.id,
//           label: item.nttn_name,
//         }));

//         console.log('✅ Mapped NTTN Options:', mappedNttns);
//         setNttnOptions(mappedNttns);

//         // Map reasons data - ensure reason_id is treated as string
//         setReasonOptions(
//           Array.isArray(reasonRes.data)
//             ? reasonRes.data.map((item) => ({ 
//                 value: String(item.id),
//                 label: item.reason 
//               }))
//             : []
//         );

//         setIsFormLoaded(true);
//       } catch (err) {
//         console.error('❌ Error loading static data:', err);
//         showToast.error(
//           err?.response?.data?.message || 'Failed to load static data for survey form!'
//         );
//       }
//     };
//     loadStaticData();
//   }, []);

//   // Load categories when SBU changes
//   useEffect(() => {
//     const fetchSbuWiseCategories = async () => {
//       const sbuId = formik.values.sbu_id;
//       if (!sbuId) {
//         setCategoryOptions([]);
//         return;
//       }
//       try {
//         console.log('📡 Calling fetchCategoriesBySBU with:', sbuId);
//         const categoriesData = await fetchCategoriesBySBU(sbuId);

//         const categoriesArray = categoriesData?.data || categoriesData;

//         const mappedCategories = Array.isArray(categoriesArray)
//           ? categoriesArray.map((item) => ({
//               value: item.id,
//               label: item.cat_name,
//             }))
//           : [];

//         setCategoryOptions(mappedCategories);

//         if (
//           isEditMode &&
//           initialValues.cat_id &&
//           initialValues.sbu_id === sbuId &&
//           !formik.values.cat_id
//         ) {
//           formik.setFieldValue('cat_id', initialValues.cat_id);
//         }
//       } catch (err) {
//         console.error('❌ Error fetching categories:', err);
//         showToast.error(
//           err?.response?.data?.message || 'Failed to load categories for the selected SBU!'
//         );
//         setCategoryOptions([]);
//       }
//     };
//     fetchSbuWiseCategories();
//   }, [formik.values.sbu_id, isEditMode, initialValues.cat_id, initialValues.sbu_id]);

//   // Load clients when category changes
//   useEffect(() => {
//     const fetchCategoryWiseClients = async () => {
//       const catId = formik.values.cat_id;
//       if (!catId) {
//         setClientOptions([]);
//         return;
//       }
//       try {
//         console.log('📡 Calling fetchClientsCategoryWise with:', catId);
//         const clientsData = await fetchClientsCategoryWise(catId);

//         const clientsArray = clientsData?.data || clientsData;

//         const mappedClients = Array.isArray(clientsArray)
//           ? clientsArray.map((c) => ({
//               value: c.id,
//               label: c.client_name,
//               division: c.division_name || 'N/A',
//               district: c.district_name || 'N/A',
//               thana: c.thana_name || 'N/A',
//               address: c.address || '',
//               client_lat: c.client_lat || '',
//               client_long: c.client_long || '',
//             }))
//           : [];

//         setClientOptions(mappedClients);

//         if (
//           isEditMode &&
//           initialValues.client_id &&
//           initialValues.cat_id === catId &&
//           !formik.values.client_id
//         ) {
//           formik.setFieldValue('client_id', initialValues.client_id);
//         }
//       } catch (err) {
//         showToast.error(
//           err?.response?.data?.message || 'Failed to load clients for the selected category!'
//         );
//         setClientOptions([]);
//       }
//     };
//     fetchCategoryWiseClients();
//   }, [formik.values.cat_id, isEditMode, initialValues.client_id, initialValues.cat_id]);

//   // Calculate rates when NTTN or capacity changes
//   useEffect(() => {
//     const nttnId = formik.values.nttn_id;
//     const requestCapacity = formik.values.request_capacity;
//     const linkTypeId = formik.values.link_type_id;

//     if (nttnId && requestCapacity) {
//       calculateRates(nttnId, requestCapacity, linkTypeId);
//     } else if (!nttnId || !requestCapacity) {
//       formik.setFieldValue('unit_rate', '');
//       formik.setFieldValue('rate_id', '');
//     }
//   }, [formik.values.nttn_id, formik.values.request_capacity, formik.values.link_type_id]);

//   // Calculate total cost when capacity or unit rate changes
//   useEffect(() => {
//     const requestCapacity = parseFloat(formik.values.request_capacity);
//     const unitRate = parseFloat(formik.values.unit_rate);

//     if (requestCapacity > 0 && unitRate > 0) {
//       const totalCost = requestCapacity * unitRate;
//       formik.setFieldValue('total_cost_of_request_capacity', totalCost.toFixed(2));
//     } else if (formik.values.total_cost_of_request_capacity) {
//       formik.setFieldValue('total_cost_of_request_capacity', '');
//     }
//   }, [formik.values.request_capacity, formik.values.unit_rate]);

//   // WORKAROUND: Watch for survey_id changes and load survey details - DISABLE IN EDIT MODE
//   useEffect(() => {
//     // Skip survey fetching in edit mode - keep existing data
//     if (isEditMode) {
//       console.log('ℹ️ Edit mode: Skipping survey auto-fetching to preserve existing data');
//       return;
//     }
    
//     const surveyId = formik.values.survey_id;
//     const clientId = formik.values.client_id;
//     const catId = formik.values.cat_id;
    
//     console.log('👀 Survey ID changed (useEffect):', surveyId);
    
//     // Only proceed if we have all required data and survey was actually selected
//     if (surveyId && clientId && catId && surveyId !== '') {
//       console.log('✅ All required data present, loading survey details...');
      
//       // Check if this survey is different from what was already loaded
//       const currentNttnSurveyId = formik.values.nttn_survey_id;
      
//       if (String(currentNttnSurveyId) !== String(surveyId)) {
//         console.log('🔄 Loading new survey:', surveyId);
//         handleSurveySelectChange(surveyId);
//       } else {
//         console.log('ℹ️ Survey already loaded, skipping...');
//       }
//     }
//   }, [formik.values.survey_id, isEditMode]);

//   // Initialize edit mode data when form loads
//   useEffect(() => {
//     if (
//       isEditMode &&
//       initialValues &&
//       Object.keys(initialValues).length > 0 &&
//       isFormLoaded &&
//       !hasCalculatedEditModeRates
//     ) {
//       console.log('🔄 Setting edit mode initial values:', initialValues);

//       const initializeEditMode = async () => {
//         // Set basic values first
//         const fieldMappings = {
//           sbu_id: initialValues.sbu_id,
//           link_type_id: initialValues.link_type_id,
//           aggregator_id: initialValues.aggregator_id,
//           kam_id: initialValues.kam_id,
//           nttn_id: initialValues.nttn_id,
//           nttn_survey_id: initialValues.nttn_survey_id,
//           nttn_lat: initialValues.nttn_lat,
//           nttn_long: initialValues.nttn_long,
//           client_id: initialValues.client_id,
//           client_lat: initialValues.client_lat,
//           client_long: initialValues.client_long,
//           mac_user: initialValues.mac_user,
//           work_order_mac_user: initialValues.work_order_mac_user,
//           nttn_work_order_id: initialValues.nttn_work_order_id,
//           request_capacity: initialValues.request_capacity,
//           total_cost_of_request_capacity: initialValues.total_cost_of_request_capacity,
//           unit_rate: initialValues.unit_rate,
//           rate_id: initialValues.rate_id,
//           vlan: initialValues.vlan,
//           remarks: initialValues.remarks,
//           status: initialValues.status,
//           reason_id: initialValues.reason_id ? String(initialValues.reason_id) : '',
//           modify_status: initialValues.modify_status,
//           posted_by: initialValues.posted_by,
//           submission: initialValues.submission,
//           requested_delivery: initialValues.requested_delivery,
//           service_handover: initialValues.service_handover,
//           division: initialValues.division,
//           district: initialValues.district,
//           thana: initialValues.thana,
//           address: initialValues.address,
//           survey_id: initialValues.nttn_survey_id || '', // Set survey_id from nttn_survey_id
//         };

//         console.log('🗺️ Field mappings for edit mode:', fieldMappings);

//         // Set values individually
//         Object.entries(fieldMappings).forEach(([key, value]) => {
//           if (value !== undefined && value !== null) {
//             console.log(`✅ Setting ${key}:`, value);
//             formik.setFieldValue(key, value);
//           }
//         });

//         // Set showReasonField based on initial status
//         if (initialValues.status === 'inactive') {
//           setShowReasonField(true);
//         }

//         // Wait for dropdowns to populate and then calculate rates
//         setTimeout(() => {
//           if (initialValues.nttn_id && initialValues.request_capacity) {
//             console.log('🔄 Calculating rates for edit mode...');
//             calculateRates(initialValues.nttn_id, initialValues.request_capacity, initialValues.link_type_id);
//           }
//           setHasCalculatedEditModeRates(true);
//         }, 1000);
//       };

//       initializeEditMode();
//     }
//   }, [isEditMode, initialValues, isFormLoaded, hasCalculatedEditModeRates]);

//   // Prepare survey options for edit mode (show only the existing survey if it exists)
//   const getSurveyOptionsForEditMode = () => {
//     const existingSurveyId = initialValues.nttn_survey_id;
//     if (existingSurveyId && existingSurveyId !== '') {
//       return [
//         {
//           value: existingSurveyId,
//           label: `Survey ID: ${existingSurveyId}`,
//         }
//       ];
//     }
//     return [];
//   };

//   return (
//     <div className="p-4">
//       <div className="flex items-center space-x-2 mb-4 md:mb-8">
//         <Button
//           variant="icon"
//           type="button"
//           onClick={onCancel}
//           title="Go Back"
//           className="p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110"
//         >
//           <ArrowLeft size={24} />
//         </Button>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {isEditMode ? 'Edit Work Order' : 'Add Work Order'}
//           </h1>
//           <p className="text-gray-500">
//             Fill in the details to {isEditMode ? 'update' : 'add a new'} work order record.
//           </p>
//         </div>
//       </div>

//       <FormikProvider value={formik}>
//         <form className="space-y-6" onSubmit={formik.handleSubmit}>
//           <FormSection title="Client Details" icon={Building}>
//             <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//               <SelectField
//                 name="sbu_id"
//                 placeholder="SBU"
//                 options={sbuOptions}
//                 value={findSelectedOption('sbu_id', sbuOptions)}
//                 onChange={(val) => handleSelectChange('sbu_id', val)}
//                 searchable
//               />
//               <SelectField
//                 name="cat_id"
//                 placeholder="Category"
//                 options={categoryOptions}
//                 value={findSelectedOption('cat_id', categoryOptions)}
//                 onChange={(val) => handleSelectChange('cat_id', val)}
//                 searchable
//                 disabled={!formik.values.sbu_id}
//               />
//               <SelectField
//                 name="client_id"
//                 placeholder="Client Name"
//                 options={clientOptions}
//                 value={findSelectedOption('client_id', clientOptions)}
//                 onChange={(val) => handleSelectChange('client_id', val)}
//                 searchable
//                 disabled={!formik.values.cat_id}
//               />
//             </div>
//             <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="w-full">
//                 <SelectField
//                   name="survey_id"
//                   placeholder={
//                     isLoadingSurveyDetails 
//                       ? "Loading..." 
//                       : isEditMode
//                       ? "Edit mode - survey selection disabled" 
//                       : surveyOptions.length > 0 
//                       ? "Select Survey (NTTN ID)" 
//                       : "No surveys available"
//                   }
//                   options={isEditMode ? getSurveyOptionsForEditMode() : surveyOptions}
//                   value={findSelectedOption('survey_id', isEditMode ? getSurveyOptionsForEditMode() : surveyOptions)}
//                   onChange={(selectedOption) => {
//                     console.log('🎯 SelectField onChange received:', selectedOption);
//                     if (!isEditMode) {
//                       handleSelectChange('survey_id', selectedOption);
//                     }
//                   }}
//                   searchable={!isEditMode}
//                   disabled={isEditMode || !formik.values.client_id || surveyOptions.length === 0 || isLoadingSurveyDetails}
//                   help={
//                     isEditMode 
//                       ? `Using existing survey: ${initialValues.nttn_survey_id || 'No survey'} (disabled for editing)` 
//                       : isLoadingSurveyDetails 
//                       ? "Loading survey details..." 
//                       : surveyOptions.length > 0 
//                       ? "Select a survey to auto-fill related fields" 
//                       : ""
//                   }
//                 />
//                 {!isEditMode && surveyOptions.length > 0 && (
//                   <div className="text-xs text-gray-500 mt-1">
//                     Available surveys: {surveyOptions.map(s => s.label).join(', ')}
//                   </div>
//                 )}
//                 {!isEditMode && formik.values.survey_id && (
//                   <div className="text-xs text-green-600 mt-1 font-semibold">
//                     ✓ Selected: {formik.values.survey_id}
//                   </div>
//                 )}
//                 {isEditMode && initialValues.nttn_survey_id && (
//                   <div className="text-xs text-blue-600 mt-1 font-semibold">
//                     ℹ️ Edit mode: Using existing survey ID: {initialValues.nttn_survey_id}
//                   </div>
//                 )}
//               </div>
//               <SelectField
//                 name="link_type_id"
//                 placeholder="Link Type"
//                 options={linkTypeOptions}
//                 value={findSelectedOption('link_type_id', linkTypeOptions)}
//                 onChange={(val) => handleSelectChange('link_type_id', val)}
//                 disabled={surveyLocked.link_type_id}
//                 searchable
//               />
//               <InputField
//                 name="nttn_work_order_id"
//                 label="Link / SCR"
//                 type="text"
//                 disabled={surveyLocked.nttn_work_order_id}
//               />
//             </div>

//             <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6">
//               <InputField
//                 name="client_lat"
//                 label="Client Latitude"
//                 type="text"
//                 disabled={surveyLocked.client_lat}
//               />
//               <InputField
//                 name="client_long"
//                 label="Client Longitude"
//                 type="text"
//                 disabled={surveyLocked.client_long}
//               />
//               <SelectField
//                 name="aggregator_id"
//                 placeholder="Aggregator"
//                 options={aggregatorOptions}
//                 value={findSelectedOption('aggregator_id', aggregatorOptions)}
//                 onChange={(val) => handleSelectChange('aggregator_id', val)}
//                 searchable
//                 disabled={surveyLocked.aggregator_id}
//               />
//               <SelectField
//                 name="kam_id"
//                 placeholder="KAM"
//                 options={kamOptions}
//                 value={findSelectedOption('kam_id', kamOptions)}
//                 onChange={(val) => handleSelectChange('kam_id', val)}
//                 searchable
//                 disabled={surveyLocked.kam_id}
//               />
//             </div>
//             <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 col-span-full">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-4 text-sm">
//                 <h3 className="flex items-center text-sm font-semibold text-gray-700">
//                   <MapPin size={16} className="mr-2 text-gray-500" />
//                   Client Location Information
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <Globe size={16} className="text-blue-500" />
//                   <p>
//                     <strong className="text-gray-800">Division:</strong>{' '}
//                     {formik.values.division || 'N/A'}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Building size={16} className="text-green-500" />
//                   <p>
//                     <strong className="text-gray-800">District:</strong>{' '}
//                     {formik.values.district || 'N/A'}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Pin size={16} className="text-red-500" />
//                   <p>
//                     <strong className="text-gray-800">Thana:</strong> {formik.values.thana || 'N/A'}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Building size={16} className="text-purple-500" />
//                   <p className="truncate">
//                     <strong className="text-gray-800">Address:</strong>{' '}
//                     {formik.values.address || 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </FormSection>

//           <FormSection title="NTTN Details" icon={Globe}>
//             <SelectField
//               name="nttn_id"
//               placeholder="NTTN Name"
//               options={nttnOptions}
//               value={findSelectedOption('nttn_id', nttnOptions)}
//               onChange={(val) => handleSelectChange('nttn_id', val)}
//               searchable
//             />
//             <InputField name="nttn_survey_id" label="NTTN Provider ID" type="text" />
//             <InputField name="nttn_lat" label="NTTN Latitude" type="text" />
//             <InputField name="nttn_long" label="NTTN Longitude" type="text" />
//           </FormSection>

//           <FormSection title="Capacity and Cost" icon={MapPin}>
//             <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//               <InputField name="request_capacity" type="number" label="Requested Capacity (Mbps)" />
//               <InputField
//                 name="unit_rate"
//                 type="number"
//                 step="0.01"
//                 label="Unit Rate"
//                 disabled={isLoadingRates}
//                 readOnly
//                 help={
//                   isLoadingRates ? 'Loading rate...' : 'Auto-calculated based on capacity and NTTN'
//                 }
//               />
//               <InputField
//                 name="total_cost_of_request_capacity"
//                 type="number"
//                 label="Total Cost of Requested Capacity"
//                 readOnly
//                 help="Auto-calculated (Capacity × Unit Rate)"
//               />

//               <InputField
//                 name="rate_id"
//                 type="number"
//                 label="Rate ID"
//                 help="Auto-populated based on selected capacity and NTTN"
//                 readOnly
//                 className="hidden"
//               />
//             </div>
//           </FormSection>

//           <FormSection title="Additional Details" icon={Pin}>
//             <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//               <InputField name="mac_user" label="MAC Users(Survey)" type="text" disabled={true} />
//               <InputField
//                 name="work_order_mac_user"
//                 label="MAC Users(Work Order)"
//                 type="text"
                
//               />
//               <InputField name="vlan" label="VLAN" type="text" 
//               // placeholder={'100.100.100.2 - 100.100.100.2'}
//               help={
//                   isLoadingRates ? 'Vlan' : 'Ex : 100.100.100.2 - 100.100.100.2'
//                 }
//                 />
                
//             </div>

//             <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//               <DatePickerField
//                 name="submission"
//                 // label="Submission Date"
//                 placeholder="Submission Date"
//                 field={formik.getFieldProps('submission')}
//                 form={formik}
//               />

//               <DatePickerField
//                 name="requested_delivery"
//                 // label="Requested Delivery Date"
//                 placeholder="Requested Delivery Date"
//                 field={formik.getFieldProps('requested_delivery')}
//                 form={formik}
//               />

//               <DatePickerField
//                 name="service_handover"
//                 // label="Service Handover Date"
//                 placeholder="Service Handover Date"
//                 field={formik.getFieldProps('service_handover')}
//                 form={formik}
//               />
//             </div>

            

//             <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
//               <InputField
//                 name="remarks"
//                 label="Remarks"
//                 type="textarea"
//                 className="md:col-span-1"
//               />
//               <div className="md:col-span-1 space-y-4">
//                 <SelectField
//                   name="status"
//                   placeholder="Status"
//                   options={[
//                     { value: 'active', label: 'Active' },
//                     { value: 'inactive', label: 'Inactive' },
//                   ]}
//                   value={findSelectedOption('status', [
//                     { value: 'active', label: 'Active' },
//                     { value: 'inactive', label: 'Inactive' },
//                   ])}
//                   onChange={(val) => {
//                     handleSelectChange('status', val);
//                     if (val?.value === 'active' && formik.values.reason_id) {
//                       formik.setFieldValue('reason_id', '');
//                     }
//                   }}
//                 />
                
//                 {isEditMode && formik.values.status === 'inactive' && !showReasonField && (
//                   <div className="text-amber-600 text-sm font-medium">
//                     ℹ️ Please select a reason for making this work order inactive
//                   </div>
//                 )}
//               </div>


//                {showReasonField && (
//               <div className="col-span-full">
//                 <SelectField
//                   name="reason_id"
//                   placeholder="Select Reason"
//                   options={reasonOptions}
//                   value={findSelectedOption('reason_id', reasonOptions)}
//                   onChange={(val) => handleSelectChange('reason_id', val)}
//                   searchable
//                   help="Required when status is set to Inactive"
//                   required={formik.values.status === 'inactive'}
//                 />
//               </div>
//             )}

              
//             </div>
//           </FormSection>

//           <div className="flex w-full justify-end mt-8 space-x-3">
//             <Button intent="cancel" type="button" onClick={onCancel}>
//               Cancel
//             </Button>
//             <Button
//               intent="submit"
//               type="submit"
//               loading={isSubmitting}
//               loadingText="Saving..."
//               disabled={isSubmitting || !formik.isValid}
//             >
//               Save
//             </Button>
//           </div>
//         </form>
//       </FormikProvider>
//     </div>
//   );
// };

// export default WorkOrderForm;








import React, { useState, useEffect } from 'react';
import { useFormik, FormikProvider } from 'formik';
import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
// import DatePickerField from '../fields/DateField';
import DatePickerField from './../fields/DatePickerField';
import { ArrowLeft, MapPin, Building, Pin, Globe } from 'lucide-react';
import { fetchSBUs } from '../../services/sbu';
import { fetchLinkTypes } from '../../services/linkType';
import { fetchAggregators } from '../../services/aggregator';
import { fetchKams } from '../../services/kam';
import { fetchNTTNs } from '../../services/nttn';
import {
  fetchClientDetailsByClient,
  fetchSurveysByClientLaravel,
  fetchSurveysDetailsByClient,
} from '../../services/survey';
import { fetchClientsCategoryWise, fetchCategoriesBySBU } from '../../services/client';
// import { surveySchema } from '../../validations/surveyValidation';
import { workOrderValidationSchema } from '../../validations/workOrderValidation';
import { showToast } from '../constants/message';
import { fetchRatesByNttn } from '../../services/rate';
import { format, isValid, parseISO } from 'date-fns';
import { useAuth } from '../../app/AuthContext';
import { fetchReasons } from '../../services/reason';

const FormSection = ({ title, icon: Icon, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900 flex items-center">
      {Icon && <Icon size={24} className="mr-2 text-gray-500" />}
      {title}
    </legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

const WorkOrderForm = ({ initialValues, isEditMode, onSubmit, onCancel }) => {
  const [sbuOptions, setSbuOptions] = useState([]);
  const [linkTypeOptions, setLinkTypeOptions] = useState([]);
  const [aggregatorOptions, setAggregatorOptions] = useState([]);
  const [kamOptions, setKamOptions] = useState([]);
  const [nttnOptions, setNttnOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [surveyOptions, setSurveyOptions] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isLoadingSurveyDetails, setIsLoadingSurveyDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [surveyLocked, setSurveyLocked] = useState({});
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());
  const [hasCalculatedEditModeRates, setHasCalculatedEditModeRates] = useState(false);
  const [showReasonField, setShowReasonField] = useState(false);
  const [rateType, setRateType] = useState(null);

  const { user } = useAuth();

  const sanitizeInitialValues = (values) => {
    const sanitized = { ...values };
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] === null || sanitized[key] === undefined) {
        sanitized[key] = '';
      }
      // Handle date fields specifically
      if (['submission', 'requested_delivery', 'service_handover'].includes(key)) {
        if (sanitized[key] && sanitized[key] !== '0000-00-00 00:00:00') {
          try {
            const dateObj = new Date(sanitized[key]);
            if (!isNaN(dateObj.getTime())) {
              sanitized[key] = format(dateObj, 'yyyy-MM-dd');
            } else {
              sanitized[key] = '';
            }
          } catch (e) {
            sanitized[key] = '';
          }
        } else {
          sanitized[key] = '';
        }
      }
      // Handle reason_id as string
      if (key === 'reason_id' && sanitized[key]) {
        sanitized[key] = String(sanitized[key]);
      }
    });
    return sanitized;
  };

  const defaultFormValues = {
    type_id: 2,
    survey_id: '',
    sbu_id: '',
    link_type_id: '',
    nttn_work_order_id: '',
    aggregator_id: '',
    kam_id: '',
    nttn_id: '',
    nttn_survey_id: '',
    nttn_lat: '',
    nttn_long: '',
    cat_id: '',
    client_id: '',
    client_lat: '',
    client_long: '',
    mac_user: '',
    work_order_mac_user: '',
    division: '',
    district: '',
    thana: '',
    address: '',
    request_capacity: '',
    total_cost_of_request_capacity: '',
    shift_capacity: false,
    shifting_capacity: '',
    shifting_capacity_price: '',
    net_capacity: '',
    unit_rate: '',
    rate_id: '',
    modify_status: '',
    vlan: '',
    reason_id: '',
    remarks: '',
    status: 'active',
    submission: '',
    requested_delivery: '',
    service_handover: '',
    posted_by: '',
  };

  const formik = useFormik({
    initialValues: { ...defaultFormValues, ...sanitizeInitialValues(initialValues) },
    validationSchema: workOrderValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      console.log('🚀 FORM SUBMIT STARTED', values);
      setIsSubmitting(true);
      try {
        const payload = { ...values };

        payload['posted_by'] = user?.name ?? 'Frontend Guest';
        delete payload.survey_id;

        const numericFields = [
          'request_capacity',
          'unit_rate',
          'total_cost_of_request_capacity',
          'shifting_capacity',
          'shifting_capacity_price',
          'net_capacity',
          'mac_user',
          'work_order_mac_user',
          'sbu_id',
          'link_type_id',
          'aggregator_id',
          'kam_id',
          'nttn_id',
          'cat_id',
          'client_id',
          'rate_id',
        ];

        numericFields.forEach((field) => {
          if (payload[field] === '') {
            payload[field] = null;
          } else if (payload[field]) {
            payload[field] = Number(payload[field]);
          }
        });

        // Handle reason_id as string (varchar)
        if (payload.reason_id === '') {
          payload.reason_id = null;
        }

        // Handle modify_status - only include in edit mode
        if (!isEditMode) {
          delete payload.modify_status;
        } else {
          if (payload.modify_status === '') {
            payload.modify_status = null;
          }
        }

        const dateFields = ['submission', 'requested_delivery', 'service_handover'];
        dateFields.forEach((field) => {
          if (payload[field]) {
            try {
              const dateObj =
                typeof payload[field] === 'string' ? parseISO(payload[field]) : payload[field];
              if (isValid(dateObj)) {
                payload[field] = format(dateObj, 'yyyy-MM-dd');
              } else {
                payload[field] = null;
              }
            } catch (e) {
              console.error(`Error formatting date field ${field}:`, e);
              payload[field] = null;
            }
          } else {
            payload[field] = null;
          }
        });

        const statusValue = payload.status;
        delete payload.status;
        payload.survey_status = statusValue;
        payload.status = statusValue;

        await onSubmit(payload, { resetForm });
      } catch (error) {
        console.error('💥 FORM SUBMIT FAILED', error);
        showToast.error(error?.response?.data?.message || 'Save failed!');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const findSelectedOption = (fieldName, options) => {
    const value = formik.values[fieldName];
    
    if (value === null || value === undefined || value === '' || !options || options.length === 0) {
      return null;
    }

    const foundOption = options.find((option) => {
      const optionValue = option.value;
      const formikValue = value;
      return String(optionValue) === String(formikValue);
    });

    return foundOption || null;
  };

  // Monitor status changes to show/hide reason field
  useEffect(() => {
    const shouldShowReason = isEditMode && formik.values.status === 'inactive';
    setShowReasonField(shouldShowReason);
    
    // If status changes from inactive to active, clear reason_id
    if (formik.values.status === 'active' && formik.values.reason_id) {
      formik.setFieldValue('reason_id', '');
    }
  }, [formik.values.status, isEditMode, formik.values.reason_id]);

  // Handle select changes
  const handleSelectChange = async (fieldName, selectedValue) => {
    console.log(`📡 ========== SELECT CHANGE DETECTED ==========`);
    console.log(`📡 Field: ${fieldName}`);
    console.log(`📡 Selected Value:`, selectedValue);
    
    const actualValue = selectedValue?.value ?? selectedValue;
    console.log(`📡 Actual Value (extracted):`, actualValue);

    formik.setFieldValue(fieldName, actualValue);
    formik.setFieldTouched(fieldName, true);

    if (fieldName === 'survey_id') {
      console.log('🎯 This is a SURVEY_ID change, calling handleSurveySelectChange...');
      await handleSurveySelectChange(actualValue);
      return;
    }

    // Clear dependent fields when parent fields change
    if (fieldName === 'sbu_id') {
      console.log('🔄 SBU changed, clearing dependent fields...');
      formik.setFieldValue('cat_id', '');
      formik.setFieldValue('client_id', '');
      formik.setFieldValue('survey_id', '');
      setCategoryOptions([]);
      setClientOptions([]);
      setSurveyOptions([]);
      clearSurveyFields();
      ['division', 'district', 'thana', 'address'].forEach((field) =>
        formik.setFieldValue(field, '')
      );
    }

    if (fieldName === 'cat_id') {
      console.log('🔄 Category changed, clearing dependent fields...');
      formik.setFieldValue('client_id', '');
      formik.setFieldValue('survey_id', '');
      setClientOptions([]);
      setSurveyOptions([]);
      clearSurveyFields();
      ['division', 'district', 'thana', 'address'].forEach((field) =>
        formik.setFieldValue(field, '')
      );
    }

    if (fieldName === 'client_id') {
      console.log('🔄 Client changed, clearing survey...');
      formik.setFieldValue('survey_id', '');
      setSurveyOptions([]);
      clearSurveyFields();
    }
  };

  // Function to clear survey-related fields
  const clearSurveyFields = () => {
    console.log('🧹 Clearing all survey-related fields');
    const fieldsToClear = [
      'link_type_id',
      'aggregator_id',
      'kam_id',
      'nttn_id',
      'nttn_survey_id',
      'nttn_lat',
      'nttn_long',
      'client_lat',
      'client_long',
      'mac_user',
      'nttn_work_order_id',
      'request_capacity',
      'unit_rate',
      'rate_id',
      'total_cost_of_request_capacity',
    ];
    
    fieldsToClear.forEach((field) => {
      formik.setFieldValue(field, defaultFormValues[field] || '');
    });
    
    setSurveyLocked({});
    setAutoFilledFields(new Set());
    setRateType(null); // Reset rate_type
  };

  // Function to auto-fill client location from client details API
  const autoFillClientLocation = (clientDetails) => {
    if (!clientDetails || typeof clientDetails !== 'object') {
      console.log('❌ No valid client details object provided to autoFillClientLocation');
      return;
    }

    console.log('📍 Auto-filling client location with details:', clientDetails);
    const filledFields = new Set();

    const locationFields = {
      division: clientDetails.division_name || clientDetails.division,
      district: clientDetails.district_name || clientDetails.district,
      thana: clientDetails.thana_name || clientDetails.thana,
      address: clientDetails.address,
    };

    console.log('🗺️ Location fields to fill:', locationFields);
    Object.entries(locationFields).forEach(([field, value]) => {
      const currentValue =
        formik.values[field] === null || formik.values[field] === undefined
          ? ''
          : String(formik.values[field]);
      const validValue = value !== null && value !== undefined && String(value).trim() !== '';

      if (currentValue === '' && validValue) {
        formik.setFieldValue(field, value);
        filledFields.add(field);
        console.log(`✅ Auto-filled client ${field}:`, value);
      } else if (currentValue !== '' && validValue) {
        console.log(`ℹ️ Field ${field} already has value: ${currentValue}, not overwriting.`);
      } else {
        console.log(`❌ No valid value for field ${field} in API response.`);
      }
    });

    if (filledFields.size > 0) {
      console.log(`🎉 Successfully auto-filled ${filledFields.size} location fields.`);
    } else {
      console.log('ℹ️ No location fields were auto-filled.');
    }
  };

  // Function to auto-fill fields from survey data
  const autoFillFromSurvey = (survey, forceClear = false) => {
    if (!survey || Object.keys(survey).length === 0 || forceClear) {
      console.log('🧹 Clearing survey fields (force clear or no survey data)');
      clearSurveyFields();
      return;
    }

    console.log('🔄 Auto-filling fields from survey:', survey);
    const filledFields = new Set();
    const fieldMapping = {
      link_type_id: survey.link_type_id,
      aggregator_id: survey.aggregator_id,
      kam_id: survey.kam_id,
      nttn_id: survey.nttn_id,
      nttn_survey_id: survey.nttn_survey_id,
      nttn_lat: survey.nttn_lat,
      nttn_long: survey.nttn_long,
      client_lat: survey.client_lat,
      client_long: survey.client_long,
      mac_user: survey.mac_user,
      nttn_work_order_id: survey.nttn_work_order_id,
      request_capacity: survey.request_capacity,
      unit_rate: survey.unit_rate,
      rate_id: survey.rate_id,
      total_cost_of_request_capacity: survey.total_cost_of_request_capacity,
    };

    console.log('📋 Field mapping to apply:', fieldMapping);

    // Force update all fields with new survey data
    Object.entries(fieldMapping).forEach(([field, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formik.setFieldValue(field, value);
        filledFields.add(field);
        console.log(`✅ Auto-filled ${field} from survey:`, value);
      } else {
        // Clear field if no value in survey
        formik.setFieldValue(field, '');
        console.log(`🧹 Cleared ${field} (no value in survey)`);
      }
    });

    const lockedFields = {};
    const fieldsToLock = [
      'link_type_id',
      'nttn_work_order_id',
      'client_lat',
      'client_long',
      'aggregator_id',
      'kam_id',
    ];
    fieldsToLock.forEach((field) => {
      if (survey[field] !== null && survey[field] !== undefined && survey[field] !== '') {
        lockedFields[field] = true;
      }
    });
    setSurveyLocked(lockedFields);
    setAutoFilledFields(filledFields);
    
    console.log(`✅ Successfully auto-filled ${filledFields.size} fields from survey`);
    console.log('🔒 Locked fields:', lockedFields);
  };

  // Handle survey selection
  const handleSurveySelectChange = async (nttnSurveyId) => {
    console.log('🔄 ========== SURVEY SELECTION CHANGED ==========');
    console.log('🔄 New Survey ID:', nttnSurveyId);
    
    formik.setFieldValue('survey_id', nttnSurveyId);
    formik.setFieldTouched('survey_id', true);

    // FIRST: Clear all auto-filled fields
    console.log('🧹 Step 1: Clearing all previously auto-filled survey data');
    clearSurveyFields();

    const clientId = formik.values.client_id;
    const catId = formik.values.cat_id;

    console.log('📋 Current Form State - Client ID:', clientId, 'Category ID:', catId);

    // If no survey selected, just clear and return
    if (!nttnSurveyId || nttnSurveyId === '') {
      console.log('ℹ️ No survey selected, all fields cleared');
      return;
    }

    if (!clientId || !catId) {
      console.log('❌ Missing client ID or category ID for detail fetch');
      showToast.error('Please select client and category first');
      return;
    }

    setIsLoadingSurveyDetails(true);
    try {
      console.log(`📡 Step 2: Fetching survey details...`);
      console.log(`   - Client ID: ${clientId}`);
      console.log(`   - Category ID: ${catId}`);
      console.log(`   - NTTN Survey ID: ${nttnSurveyId}`);
      
      const surveysData = await fetchSurveysDetailsByClient(clientId, catId, nttnSurveyId);
      console.log('📦 Raw API Response:', surveysData);
      
      const surveysArray = surveysData?.data || surveysData;
      console.log('📦 Processed Survey Array:', surveysArray);

      if (Array.isArray(surveysArray) && surveysArray.length > 0) {
        console.log('✅ Step 3: Survey details found! Auto-filling now...');
        console.log('📝 Survey Data to Fill:', surveysArray[0]);
        
        autoFillFromSurvey(surveysArray[0], false);
        // showToast.success('Survey details loaded successfully');
        
        console.log('✅ ========== SURVEY LOADING COMPLETE ==========');
      } else {
        console.log('⚠️ No survey details found in response');
        console.log('⚠️ Response was:', { surveysData, surveysArray });
        // showToast.error('No details found for selected survey');
        clearSurveyFields();
      }
    } catch (err) {
      console.error('💥 ========== ERROR LOADING SURVEY ==========');
      console.error('💥 Error details:', err);
      console.error('💥 Error response:', err.response);
      showToast.error('Failed to load survey details: ' + (err.message || 'Unknown error'));
      clearSurveyFields();
    } finally {
      setIsLoadingSurveyDetails(false);
    }
  };

  // Function to calculate rates based on NTTN, Link Type, and capacity
  const calculateRates = async (nttnId, requestCapacity, linkTypeId) => {
    if (!nttnId || !requestCapacity) {
      formik.setFieldValue('unit_rate', '');
      formik.setFieldValue('rate_id', '');
      formik.setFieldValue('total_cost_of_request_capacity', '');
      setRateType(null);
      return;
    }

    setIsLoadingRates(true);
    try {
      console.log(`🔡 Calculating rates for NTTN: ${nttnId}, Capacity: ${requestCapacity}, Link Type: ${linkTypeId || 'Not provided'}`);
      
      const rate = await fetchRatesByNttn(nttnId, requestCapacity, linkTypeId);
      console.log('📊 Rate fetched:', rate);

      if (rate && rate.id) {
        console.log('✅ Matching rate found:', rate);
        
        // Convert rate to number
        const rateValue = parseFloat(rate.rate);
        formik.setFieldValue('unit_rate', rateValue);
        formik.setFieldValue('rate_id', rate.id);
        
        // Store the rate_type from the API response and convert to number
        if (rate.rate_type) {
          const rateTypeValue = parseInt(rate.rate_type, 10);
          console.log('📌 Rate Type:', rateTypeValue);
          setRateType(rateTypeValue);
          
          // Calculate total cost based on rate_type
          if (rateTypeValue === 1) {
            // rate_type 1: just show unit rate (no multiplication)
            formik.setFieldValue('total_cost_of_request_capacity', rateValue);
            console.log('📌 Rate Type 1: Total Cost = Unit Rate =', rateValue);
          } else if (rateTypeValue === 2) {
            // rate_type 2: multiply capacity × unit rate
            const totalCost = requestCapacity * rateValue;
            formik.setFieldValue('total_cost_of_request_capacity', totalCost.toFixed(2));
            console.log('📌 Rate Type 2: Total Cost = Capacity × Unit Rate =', totalCost);
          }
        }
      } else {
        console.log('❌ No matching rate found');
        formik.setFieldValue('unit_rate', '');
        formik.setFieldValue('rate_id', '');
        formik.setFieldValue('total_cost_of_request_capacity', '');
        setRateType(null);
        showToast.error("No rate found for the selected parameters");
      }
    } catch (err) {
      console.error('🔥 Error calculating rates:', err);
      
      if (err.response && err.response.status === 404) {
        formik.setFieldValue('unit_rate', '');
        formik.setFieldValue('rate_id', '');
        formik.setFieldValue('total_cost_of_request_capacity', '');
        setRateType(null);
        showToast.error("No rate found for the selected NTTN, link type, and capacity range");
      } else {
        const timeoutId = setTimeout(() => {
        showToast.error("Failed to find rates");
      }, 5000);
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
      }
    } finally {
      setIsLoadingRates(false);
    }
  };

  // USE EFFECT to fetch client location and survey options
  useEffect(() => {
    const fetchClientDataAndSurveys = async () => {
      const clientId = formik.values.client_id;
      const catId = formik.values.cat_id;

      if (!clientId || !catId) {
        setSurveyOptions([]);
        clearSurveyFields();
        return;
      }

      try {
        console.log(
          `📡 [USE EFFECT] Fetching client details & surveys for client: ${clientId}, category: ${catId}`
        );

        // 1️⃣ Fetch Client Details (Location) - DO THIS FOR BOTH MODES
        const clientDetails = await fetchClientDetailsByClient(clientId, catId);

        if (clientDetails && typeof clientDetails === 'object' && clientDetails.id) {
          autoFillClientLocation(clientDetails);
        } else {
          console.log(
            '❌ Failed to get client details object from service response or client not found in DB.'
          );
          showToast.error('Client details not found');
          ['division', 'district', 'thana', 'address'].forEach((field) =>
            formik.setFieldValue(field, '')
          );
        }

        // 2️⃣ Fetch Surveys (for Survey ID dropdown) - SKIP IN EDIT MODE
        if (!isEditMode) {
          const surveysResponse = await fetchSurveysByClientLaravel(clientId, catId);
          
          // Handle the response - it should contain an array of surveys
          let surveysData = [];
          if (surveysResponse && surveysResponse.data && Array.isArray(surveysResponse.data)) {
            surveysData = surveysResponse.data;
          } else if (Array.isArray(surveysResponse)) {
            surveysData = surveysResponse;
          }

          console.log('📊 Surveys fetched:', surveysData);

          if (Array.isArray(surveysData) && surveysData.length > 0) {
            // Map all surveys with nttn_survey_id to dropdown options
            const mappedSurveys = surveysData
              .filter(s => s.nttn_survey_id) // Only include surveys with nttn_survey_id
              .map((s) => ({
                value: s.nttn_survey_id,
                label: `Survey ID: ${s.nttn_survey_id}`,
                _raw: s,
              }));
            
            console.log('📋 Mapped survey options:', mappedSurveys);
            setSurveyOptions(mappedSurveys);

            // Get current survey selection
            const currentSurveyId = formik.values.survey_id;
            console.log('🔍 Current survey_id in form:', currentSurveyId);
            
            if (currentSurveyId && currentSurveyId !== '') {
              console.log('✅ Loading existing survey:', currentSurveyId);
              const surveyExists = mappedSurveys.some(s => String(s.value) === String(currentSurveyId));
              if (surveyExists) {
                // Use setTimeout to ensure dropdown is populated first
                setTimeout(() => {
                  handleSurveySelectChange(currentSurveyId);
                }, 200);
              } else {
                console.log('⚠️ Current survey ID not found in options');
              }
            }
          } else {
            setSurveyOptions([]);
            clearSurveyFields();
            console.log('ℹ️ [USE EFFECT] No surveys found for this client');
          }
        } else {
          // In edit mode, don't fetch surveys - just set empty options
          console.log('ℹ️ Edit mode: Not fetching surveys to preserve existing data');
          setSurveyOptions([]);
        }
      } catch (err) {
        console.error('💥 Error fetching client details or surveys:', err);
        setSurveyOptions([]);
      }
    };

    const timer = setTimeout(() => {
      fetchClientDataAndSurveys();
    }, 100);

    return () => clearTimeout(timer);
  }, [formik.values.client_id, formik.values.cat_id, isEditMode]);

  // Load all static data on component mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [sbuRes, linkTypeRes, aggregatorRes, kamRes, nttnRes, reasonRes] = await Promise.all([
          fetchSBUs(),
          fetchLinkTypes(),
          fetchAggregators(),
          fetchKams(),
          fetchNTTNs(),
          fetchReasons(),
        ]);

        console.log('📊 NTTN Data received:', nttnRes);

        setSbuOptions(
          Array.isArray(sbuRes.data)
            ? sbuRes.data.map((item) => ({ value: item.id, label: item.sbu_name }))
            : []
        );
        setLinkTypeOptions(
          Array.isArray(linkTypeRes.data)
            ? linkTypeRes.data.map((item) => ({ value: item.id, label: item.type_name }))
            : []
        );
        setAggregatorOptions(
          Array.isArray(aggregatorRes.data)
            ? aggregatorRes.data.map((item) => ({
                value: item.id,
                label: item.aggregator_name,
              }))
            : []
        );
        setKamOptions(
          Array.isArray(kamRes.data)
            ? kamRes.data.map((item) => ({ value: item.id, label: item.kam_name }))
            : []
        );

        // Handle NTTN data properly
        let nttnData = [];
        if (Array.isArray(nttnRes)) {
          nttnData = nttnRes;
        } else if (nttnRes && nttnRes.data && Array.isArray(nttnRes.data)) {
          nttnData = nttnRes.data;
        } else if (nttnRes && Array.isArray(nttnRes)) {
          nttnData = nttnRes;
        }

        const mappedNttns = nttnData.map((item) => ({
          value: item.id,
          label: item.nttn_name,
        }));

        console.log('✅ Mapped NTTN Options:', mappedNttns);
        setNttnOptions(mappedNttns);

        // Map reasons data - ensure reason_id is treated as string
        setReasonOptions(
          Array.isArray(reasonRes.data)
            ? reasonRes.data.map((item) => ({ 
                value: String(item.id),
                label: item.reason 
              }))
            : []
        );

        setIsFormLoaded(true);
      } catch (err) {
        console.error('❌ Error loading static data:', err);
        showToast.error(
          err?.response?.data?.message || 'Failed to load static data for survey form!'
        );
      }
    };
    loadStaticData();
  }, []);

  // Load categories when SBU changes
  useEffect(() => {
    const fetchSbuWiseCategories = async () => {
      const sbuId = formik.values.sbu_id;
      if (!sbuId) {
        setCategoryOptions([]);
        return;
      }
      try {
        console.log('📡 Calling fetchCategoriesBySBU with:', sbuId);
        const categoriesData = await fetchCategoriesBySBU(sbuId);

        const categoriesArray = categoriesData?.data || categoriesData;

        const mappedCategories = Array.isArray(categoriesArray)
          ? categoriesArray.map((item) => ({
              value: item.id,
              label: item.cat_name,
            }))
          : [];

        setCategoryOptions(mappedCategories);

        if (
          isEditMode &&
          initialValues.cat_id &&
          initialValues.sbu_id === sbuId &&
          !formik.values.cat_id
        ) {
          formik.setFieldValue('cat_id', initialValues.cat_id);
        }
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        showToast.error(
          err?.response?.data?.message || 'Failed to load categories for the selected SBU!'
        );
        setCategoryOptions([]);
      }
    };
    fetchSbuWiseCategories();
  }, [formik.values.sbu_id, isEditMode, initialValues.cat_id, initialValues.sbu_id]);

  // Load clients when category changes
  useEffect(() => {
    const fetchCategoryWiseClients = async () => {
      const catId = formik.values.cat_id;
      if (!catId) {
        setClientOptions([]);
        return;
      }
      try {
        console.log('📡 Calling fetchClientsCategoryWise with:', catId);
        const clientsData = await fetchClientsCategoryWise(catId);

        const clientsArray = clientsData?.data || clientsData;

        const mappedClients = Array.isArray(clientsArray)
          ? clientsArray.map((c) => ({
              value: c.id,
              label: c.client_name,
              division: c.division_name || 'N/A',
              district: c.district_name || 'N/A',
              thana: c.thana_name || 'N/A',
              address: c.address || '',
              client_lat: c.client_lat || '',
              client_long: c.client_long || '',
            }))
          : [];

        setClientOptions(mappedClients);

        if (
          isEditMode &&
          initialValues.client_id &&
          initialValues.cat_id === catId &&
          !formik.values.client_id
        ) {
          formik.setFieldValue('client_id', initialValues.client_id);
        }
      } catch (err) {
        showToast.error(
          err?.response?.data?.message || 'Failed to load clients for the selected category!'
        );
        setClientOptions([]);
      }
    };
    fetchCategoryWiseClients();
  }, [formik.values.cat_id, isEditMode, initialValues.client_id, initialValues.cat_id]);

  // Calculate rates when NTTN or capacity changes
  useEffect(() => {
    const nttnId = formik.values.nttn_id;
    const requestCapacity = formik.values.request_capacity;
    const linkTypeId = formik.values.link_type_id;

    if (nttnId && requestCapacity) {
      calculateRates(nttnId, requestCapacity, linkTypeId);
    } else if (!nttnId || !requestCapacity) {
      formik.setFieldValue('unit_rate', '');
      formik.setFieldValue('rate_id', '');
    }
  }, [formik.values.nttn_id, formik.values.request_capacity, formik.values.link_type_id]);

  // Calculate total cost when capacity or unit rate changes
  useEffect(() => {
    const requestCapacity = parseFloat(formik.values.request_capacity);
    const unitRate = parseFloat(formik.values.unit_rate);

    if (rateType === 2 && requestCapacity > 0 && unitRate > 0) {
      const totalCost = requestCapacity * unitRate;
      formik.setFieldValue('total_cost_of_request_capacity', totalCost.toFixed(2));
      console.log('📊 Recalculating total cost for rate_type 2:', totalCost.toFixed(2));
    } else if (!requestCapacity || !unitRate) {
      formik.setFieldValue('total_cost_of_request_capacity', '');
    }
  }, [formik.values.request_capacity, formik.values.unit_rate, rateType]);

  // WORKAROUND: Watch for survey_id changes and load survey details - DISABLE IN EDIT MODE
  useEffect(() => {
    // Skip survey fetching in edit mode - keep existing data
    if (isEditMode) {
      console.log('ℹ️ Edit mode: Skipping survey auto-fetching to preserve existing data');
      return;
    }
    
    const surveyId = formik.values.survey_id;
    const clientId = formik.values.client_id;
    const catId = formik.values.cat_id;
    
    console.log('👀 Survey ID changed (useEffect):', surveyId);
    
    // Only proceed if we have all required data and survey was actually selected
    if (surveyId && clientId && catId && surveyId !== '') {
      console.log('✅ All required data present, loading survey details...');
      
      // Check if this survey is different from what was already loaded
      const currentNttnSurveyId = formik.values.nttn_survey_id;
      
      if (String(currentNttnSurveyId) !== String(surveyId)) {
        console.log('🔄 Loading new survey:', surveyId);
        handleSurveySelectChange(surveyId);
      } else {
        console.log('ℹ️ Survey already loaded, skipping...');
      }
    }
  }, [formik.values.survey_id, isEditMode]);

  // Initialize edit mode data when form loads
  useEffect(() => {
    if (
      isEditMode &&
      initialValues &&
      Object.keys(initialValues).length > 0 &&
      isFormLoaded &&
      !hasCalculatedEditModeRates
    ) {
      console.log('🔄 Setting edit mode initial values:', initialValues);

      const initializeEditMode = async () => {
        // Set basic values first
        const fieldMappings = {
          sbu_id: initialValues.sbu_id,
          link_type_id: initialValues.link_type_id,
          aggregator_id: initialValues.aggregator_id,
          kam_id: initialValues.kam_id,
          nttn_id: initialValues.nttn_id,
          nttn_survey_id: initialValues.nttn_survey_id,
          nttn_lat: initialValues.nttn_lat,
          nttn_long: initialValues.nttn_long,
          client_id: initialValues.client_id,
          client_lat: initialValues.client_lat,
          client_long: initialValues.client_long,
          mac_user: initialValues.mac_user,
          work_order_mac_user: initialValues.work_order_mac_user,
          nttn_work_order_id: initialValues.nttn_work_order_id,
          request_capacity: initialValues.request_capacity,
          total_cost_of_request_capacity: initialValues.total_cost_of_request_capacity,
          unit_rate: initialValues.unit_rate,
          rate_id: initialValues.rate_id,
          vlan: initialValues.vlan,
          remarks: initialValues.remarks,
          status: initialValues.status,
          reason_id: initialValues.reason_id ? String(initialValues.reason_id) : '',
          modify_status: initialValues.modify_status,
          posted_by: initialValues.posted_by,
          submission: initialValues.submission,
          requested_delivery: initialValues.requested_delivery,
          service_handover: initialValues.service_handover,
          division: initialValues.division,
          district: initialValues.district,
          thana: initialValues.thana,
          address: initialValues.address,
          survey_id: initialValues.nttn_survey_id || '', // Set survey_id from nttn_survey_id
        };

        console.log('🗺️ Field mappings for edit mode:', fieldMappings);

        // Set values individually
        Object.entries(fieldMappings).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            console.log(`✅ Setting ${key}:`, value);
            formik.setFieldValue(key, value);
          }
        });

        // Set showReasonField based on initial status
        if (initialValues.status === 'inactive') {
          setShowReasonField(true);
        }

        // Wait for dropdowns to populate and then calculate rates
        setTimeout(() => {
          if (initialValues.nttn_id && initialValues.request_capacity) {
            console.log('🔄 Calculating rates for edit mode...');
            calculateRates(initialValues.nttn_id, initialValues.request_capacity, initialValues.link_type_id);
          }
          setHasCalculatedEditModeRates(true);
        }, 1000);
      };

      initializeEditMode();
    }
  }, [isEditMode, initialValues, isFormLoaded, hasCalculatedEditModeRates]);

  // Prepare survey options for edit mode (show only the existing survey if it exists)
  const getSurveyOptionsForEditMode = () => {
    const existingSurveyId = initialValues.nttn_survey_id;
    if (existingSurveyId && existingSurveyId !== '') {
      return [
        {
          value: existingSurveyId,
          label: `Survey ID: ${existingSurveyId}`,
        }
      ];
    }
    return [];
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4 md:mb-8">
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
            {isEditMode ? 'Edit Work Order' : 'Add Work Order'}
          </h1>
          <p className="text-gray-500">
            Fill in the details to {isEditMode ? 'update' : 'add a new'} work order record.
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <FormSection title="Client Details" icon={Building}>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                name="sbu_id"
                placeholder="SBU"
                options={sbuOptions}
                value={findSelectedOption('sbu_id', sbuOptions)}
                onChange={(val) => handleSelectChange('sbu_id', val)}
                searchable
              />
              <SelectField
                name="cat_id"
                placeholder="Category"
                options={categoryOptions}
                value={findSelectedOption('cat_id', categoryOptions)}
                onChange={(val) => handleSelectChange('cat_id', val)}
                searchable
                disabled={!formik.values.sbu_id}
              />
              <SelectField
                name="client_id"
                placeholder="Client Name"
                options={clientOptions}
                value={findSelectedOption('client_id', clientOptions)}
                onChange={(val) => handleSelectChange('client_id', val)}
                searchable
                disabled={!formik.values.cat_id}
              />
            </div>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="w-full">
                <SelectField
                  name="survey_id"
                  placeholder={
                    isLoadingSurveyDetails 
                      ? "Loading..." 
                      : isEditMode
                      ? "Edit mode - survey selection disabled" 
                      : surveyOptions.length > 0 
                      ? "Select Survey (NTTN ID)" 
                      : "No surveys available"
                  }
                  options={isEditMode ? getSurveyOptionsForEditMode() : surveyOptions}
                  value={findSelectedOption('survey_id', isEditMode ? getSurveyOptionsForEditMode() : surveyOptions)}
                  onChange={(selectedOption) => {
                    console.log('🎯 SelectField onChange received:', selectedOption);
                    if (!isEditMode) {
                      handleSelectChange('survey_id', selectedOption);
                    }
                  }}
                  searchable={!isEditMode}
                  disabled={isEditMode || !formik.values.client_id || surveyOptions.length === 0 || isLoadingSurveyDetails}
                  help={
                    isEditMode 
                      ? `Using existing survey: ${initialValues.nttn_survey_id || 'No survey'} (disabled for editing)` 
                      : isLoadingSurveyDetails 
                      ? "Loading survey details..." 
                      : surveyOptions.length > 0 
                      ? "Select a survey to auto-fill related fields" 
                      : ""
                  }
                />
                {!isEditMode && surveyOptions.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Available surveys: {surveyOptions.map(s => s.label).join(', ')}
                  </div>
                )}
                {!isEditMode && formik.values.survey_id && (
                  <div className="text-xs text-green-600 mt-1 font-semibold">
                    ✓ Selected: {formik.values.survey_id}
                  </div>
                )}
                {isEditMode && initialValues.nttn_survey_id && (
                  <div className="text-xs text-blue-600 mt-1 font-semibold">
                    ℹ️ Edit mode: Using existing survey ID: {initialValues.nttn_survey_id}
                  </div>
                )}
              </div>
              <SelectField
                name="link_type_id"
                placeholder="Link Type"
                options={linkTypeOptions}
                value={findSelectedOption('link_type_id', linkTypeOptions)}
                onChange={(val) => handleSelectChange('link_type_id', val)}
                disabled={surveyLocked.link_type_id}
                searchable
              />
              <InputField
                name="nttn_work_order_id"
                label="Link / SCR"
                type="text"
                disabled={surveyLocked.nttn_work_order_id}
              />
            </div>

            <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6">
              <InputField
                name="client_lat"
                label="Client Latitude"
                type="text"
                disabled={surveyLocked.client_lat}
              />
              <InputField
                name="client_long"
                label="Client Longitude"
                type="text"
                disabled={surveyLocked.client_long}
              />
              <SelectField
                name="aggregator_id"
                placeholder="Aggregator"
                options={aggregatorOptions}
                value={findSelectedOption('aggregator_id', aggregatorOptions)}
                onChange={(val) => handleSelectChange('aggregator_id', val)}
                searchable
                disabled={surveyLocked.aggregator_id}
              />
              <SelectField
                name="kam_id"
                placeholder="KAM"
                options={kamOptions}
                value={findSelectedOption('kam_id', kamOptions)}
                onChange={(val) => handleSelectChange('kam_id', val)}
                searchable
                disabled={surveyLocked.kam_id}
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 col-span-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-4 text-sm">
                <h3 className="flex items-center text-sm font-semibold text-gray-700">
                  <MapPin size={16} className="mr-2 text-gray-500" />
                  Client Location Information
                </h3>
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-blue-500" />
                  <p>
                    <strong className="text-gray-800">Division:</strong>{' '}
                    {formik.values.division || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Building size={16} className="text-green-500" />
                  <p>
                    <strong className="text-gray-800">District:</strong>{' '}
                    {formik.values.district || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Pin size={16} className="text-red-500" />
                  <p>
                    <strong className="text-gray-800">Thana:</strong> {formik.values.thana || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Building size={16} className="text-purple-500" />
                  <p className="truncate">
                    <strong className="text-gray-800">Address:</strong>{' '}
                    {formik.values.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="NTTN Details" icon={Globe}>
            <SelectField
              name="nttn_id"
              placeholder="NTTN Name"
              options={nttnOptions}
              value={findSelectedOption('nttn_id', nttnOptions)}
              onChange={(val) => handleSelectChange('nttn_id', val)}
              searchable
            />
            <InputField name="nttn_survey_id" label="NTTN Provider ID" type="text" />
            <InputField name="nttn_lat" label="NTTN Latitude" type="text" />
            <InputField name="nttn_long" label="NTTN Longitude" type="text" />
          </FormSection>

          <FormSection title="Capacity and Cost" icon={MapPin}>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField 
                name="request_capacity" 
                type="number" 
                label="Requested Capacity (Mbps)" 
              />
              <InputField
                name="unit_rate"
                type="number"
                step="0.01"
                label="Unit Rate"
                disabled={isLoadingRates}
                readOnly
                help={
                  isLoadingRates ? 'Loading rate...' : 'Auto-calculated based on capacity and NTTN'
                }
              />
              
              {/* Conditional rendering based on rate_type */}
              {rateType === 1 ? (
                <InputField
                  name="total_cost_of_request_capacity"
                  type="number"
                  label="Total Cost of Requested Capacity"
                  readOnly
                  help="Fixed Rate (Unit Rate only)"
                />
              ) : rateType === 2 ? (
                <InputField
                  name="total_cost_of_request_capacity"
                  type="number"
                  label="Total Cost of Requested Capacity"
                  readOnly
                  help="Auto-calculated (Capacity × Unit Rate)"
                />
              ) : (
                <InputField
                  name="total_cost_of_request_capacity"
                  type="number"
                  label="Total Cost of Requested Capacity"
                  readOnly
                  help="Auto-calculated based on selected rate type"
                />
              )}

              <InputField
                name="rate_id"
                type="number"
                label="Rate ID"
                help="Auto-populated based on selected capacity and NTTN"
                readOnly
                className="hidden"
              />
            </div>
          </FormSection>

          <FormSection title="Additional Details" icon={Pin}>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField name="mac_user" label="MAC Users(Survey)" type="text" disabled={true} />
              <InputField
                name="work_order_mac_user"
                label="MAC Users(Work Order)"
                type="text"
                
              />
              <InputField name="vlan" label="VLAN" type="text" 
              // placeholder={'100.100.100.2 - 100.100.100.2'}
              help={
                  isLoadingRates ? 'Vlan' : 'Ex : 100.100.100.2 - 100.100.100.2'
                }
                />
                
            </div>

            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <DatePickerField
                name="submission"
                // label="Submission Date"
                placeholder="Submission Date"
                field={formik.getFieldProps('submission')}
                form={formik}
              />

              <DatePickerField
                name="requested_delivery"
                // label="Requested Delivery Date"
                placeholder="Requested Delivery Date"
                field={formik.getFieldProps('requested_delivery')}
                form={formik}
              />

              <DatePickerField
                name="service_handover"
                // label="Service Handover Date"
                placeholder="Service Handover Date"
                field={formik.getFieldProps('service_handover')}
                form={formik}
              />
            </div>

            

            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <InputField
                name="remarks"
                label="Remarks"
                type="textarea"
                className="md:col-span-1"
              />
              <div className="md:col-span-1 space-y-4">
                <SelectField
                  name="status"
                  placeholder="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  value={findSelectedOption('status', [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ])}
                  onChange={(val) => {
                    handleSelectChange('status', val);
                    if (val?.value === 'active' && formik.values.reason_id) {
                      formik.setFieldValue('reason_id', '');
                    }
                  }}
                />
                
                {isEditMode && formik.values.status === 'inactive' && !showReasonField && (
                  <div className="text-amber-600 text-sm font-medium">
                    ℹ️ Please select a reason for making this work order inactive
                  </div>
                )}
              </div>


               {showReasonField && (
              <div className="col-span-full">
                <SelectField
                  name="reason_id"
                  placeholder="Select Reason"
                  options={reasonOptions}
                  value={findSelectedOption('reason_id', reasonOptions)}
                  onChange={(val) => handleSelectChange('reason_id', val)}
                  searchable
                  help="Required when status is set to Inactive"
                  required={formik.values.status === 'inactive'}
                />
              </div>
            )}

              
            </div>
          </FormSection>

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
    </div>
  );
};

export default WorkOrderForm;