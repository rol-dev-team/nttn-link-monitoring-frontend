// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Plus, Minus } from 'lucide-react';
// import * as Yup from 'yup';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import DatePickerField from '../fields/DatePickerField';
// import { format } from 'date-fns';

// import { BWModificationSchema } from '../../validations/bwModificationValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise } from '../../services/client';
// import { fetchWorkOrderBeModification } from '../../services/workOrder';
// import { fetchRatesByNttn, fetchRateByNttnAndBandwidth } from '../../services/rate';
// import { fetchModificationTypes } from '../../services/modificationType';
// import { createBWModification, updateBWModification } from '../../services/bwModification';
// import { updateWorkOrder, updateWorkOrderLaravel } from '../../services/workOrder';
// import { fetchReasons } from '../../services/reason';

// /* ---------- section wrapper (same as SurveyForm) ---------- */
// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty initial shape ---------- */
// const emptyValues = {
//   id: '',
//   nttn_provider: null,
//   modification_type: '',
//   client_category: null,
//   client: null,
//   nttn_work_order_id: '',
//   capacity: '',
//   capacity_cost: '',
//   shifting_bw: '',
//   shifting_capacity: '',
//   shifting_unit_cost: '',
//   workorder_id: '',
//   rate_id: '',
//   remarks: '',
//   reason_id: '',
//   submission: '',
// };

// // Static modification types
// const STATIC_MODIFICATION_TYPES = [
//   { value: '1', label: 'Upgrade' },
//   { value: '2', label: 'Downgrade' },
// ];

// const BWModificationForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const navigate = useNavigate();
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [modificationTypes, setModificationTypes] = useState([]);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [workOrders, setWorkOrders] = useState([]);
//   const [bandwidthRanges, setBandwidthRanges] = useState([]);
//   const [nttnLinkIds, setNttnLinkIds] = useState([]);
//   const [reasons, setReasons] = useState([]);
//   const [ratesCache, setRatesCache] = useState(new Map());
//   const [currentNttnId, setCurrentNttnId] = useState(null);
//   const [currentLinkTypeId, setCurrentLinkTypeId] = useState(null);
//   const [currentRates, setCurrentRates] = useState([]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isLoadingReasons, setIsLoadingReasons] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lockedField, setLockedField] = useState(null);
//   const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);

//   const lockRef = useRef(lockedField);
//   useEffect(() => {
//     lockRef.current = lockedField;
//   }, [lockedField]);

//   /* ---------- formik ---------- */
//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: BWModificationSchema,
//     enableReinitialize: true,
//     onSubmit: async (values) => {
//       await handleSave(values);
//     },
//   });

//   // Function to fetch rates for a specific NTTN and cache them
//   const fetchRatesForNttn = async (nttnId, linkTypeId = null) => {
//     const cacheKey = linkTypeId ? `${nttnId}_${linkTypeId}` : nttnId;
    
//     if (!nttnId || ratesCache.has(cacheKey)) {
//       return ratesCache.get(cacheKey) || [];
//     }

//     try {
//       console.log(`📡 Fetching rates for NTTN ID: ${nttnId}${linkTypeId ? `, Link Type ID: ${linkTypeId}` : ''}`);
      
//       const rates = await fetchRatesByNttn(nttnId, null, linkTypeId);
//       const ratesData = rates.data || rates;

//       setRatesCache((prev) => new Map(prev).set(cacheKey, ratesData));
//       return ratesData;
//     } catch (error) {
//       console.error(`❌ Error fetching rates for NTTN ${nttnId}:`, error);
//       return [];
//     }
//   };

//   // ✅ NEW: Function to fetch rate for specific bandwidth using the correct API
//   const fetchRateForBandwidth = async (nttnId, bandwidth, linkTypeId = null) => {
//     try {
//       console.log(`🎯 Fetching rate for NTTN: ${nttnId}, BW: ${bandwidth}, Link Type: ${linkTypeId}`);
      
//       // Call the API that includes link_type_id as query parameter
//       // This will call: /api/rates/nttn/1/bandwidth/20?link_type_id=2
//       const response = await fetchRatesByNttn(nttnId, bandwidth, linkTypeId);
      
//       if (response && response.rate) {
//         console.log('💰 Rate found via API:', response);
//         return {
//           rate: parseFloat(response.rate),
//           rateId: response.id,
//           rangeFrom: response.bw_range_from,
//           rangeTo: response.bw_range_to,
//         };
//       }
      
//       console.log('❌ No rate found via API');
//       return null;
//     } catch (error) {
//       console.error('❌ Error fetching rate for bandwidth:', error);
//       return null;
//     }
//   };

//   // Function to fetch reasons
//   const fetchReasonsList = async () => {
//     setIsLoadingReasons(true);
//     try {
//       console.log('📡 Fetching reasons...');
//       const reasonsRes = await fetchReasons();
//       const reasonsData = reasonsRes?.data || reasonsRes || [];
      
//       const mappedReasons = Array.isArray(reasonsData) 
//         ? reasonsData.map((reason) => ({
//             value: String(reason.id),
//             label: reason.reason || reason.reason_name || `Reason ${reason.id}`,
//           }))
//         : [];
      
//       console.log('✅ Reasons fetched:', mappedReasons);
//       setReasons(mappedReasons);
//     } catch (error) {
//       console.error('❌ Error fetching reasons:', error);
//       setReasons([]);
//       showToast?.('Failed to load reasons list', 'warning');
//     } finally {
//       setIsLoadingReasons(false);
//     }
//   };

//   // Function to find rate for specific bandwidth from current rates (fallback)
//   const findRateForBandwidth = (bandwidth, rates = currentRates) => {
//     if (!bandwidth || !Array.isArray(rates) || rates.length === 0) {
//       return null;
//     }

//     try {
//       console.log(`🎯 Finding rate for BW: ${bandwidth} from ${rates.length} available rates`);

//       const matchingRate = rates.find((rate) => {
//         const rangeFrom = parseFloat(rate.bw_range_from);
//         const rangeTo = parseFloat(rate.bw_range_to);
//         return bandwidth >= rangeFrom && bandwidth <= rangeTo;
//       });

//       if (matchingRate) {
//         console.log('💰 Rate found:', matchingRate.rate, 'Rate ID:', matchingRate.id);
//         return {
//           rate: parseFloat(matchingRate.rate),
//           rateId: matchingRate.id,
//           rangeFrom: matchingRate.bw_range_from,
//           rangeTo: matchingRate.bw_range_to,
//         };
//       } else {
//         console.log('❌ No rate found for bandwidth:', bandwidth);
//         return null;
//       }
//     } catch (error) {
//       console.error('❌ Error finding rate for bandwidth:', error);
//       return null;
//     }
//   };

//   // Function to calculate unit rate and total cost using actual rates data
//   const calculateRates = (record) => {
//     const requestCapacity = parseFloat(record.request_capacity) || 0;

//     if (record.unit_rate && record.rate_id) {
//       const unitRate = parseFloat(record.unit_rate);
//       const totalCost = requestCapacity * unitRate;
//       return {
//         unitRate: unitRate.toFixed(2),
//         totalCost: totalCost.toFixed(2),
//         rateId: record.rate_id,
//       };
//     }

//     const nttnRates = ratesCache.get(record.nttn_id) || [];

//     if (nttnRates.length > 0 && record.nttn_id && requestCapacity > 0) {
//       const matchingRate = nttnRates.find((rate) => {
//         const rangeFrom = parseFloat(rate.bw_range_from);
//         const rangeTo = parseFloat(rate.bw_range_to);
//         return requestCapacity >= rangeFrom && requestCapacity <= rangeTo;
//       });

//       if (matchingRate) {
//         const unitRate = parseFloat(matchingRate.rate);
//         const totalCost = requestCapacity * unitRate;
//         return {
//           unitRate: unitRate.toFixed(2),
//           totalCost: totalCost.toFixed(2),
//           rateId: matchingRate.id,
//         };
//       }
//     }

//     return {
//       unitRate: '0.00',
//       totalCost: '0.00',
//       rateId: null,
//     };
//   };

//   /* ---------- data bootstrap ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttnRes, catsRes] = await Promise.all([
//           fetchNTTNs(), 
//           fetchCategories(),
//           fetchReasonsList()
//         ]);

//         const nttnData = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const catsData = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];

//         console.log('📊 API Responses:', {
//           nttn: nttnData,
//           categories: catsData,
//         });

//         setNttnProviders(nttnData);
//         setClientCategories(catsData);
//         setModificationTypes(STATIC_MODIFICATION_TYPES);
//         setWorkOrders([]);
//       } catch (e) {
//         console.error('❌ Boot error:', e);
//         showToast?.(e.message || "Failed to load form data", "error");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- fetch work orders when client is selected ---------- */
//   useEffect(() => {
//     const fetchWorkOrdersForClient = async () => {
//       const clientId = formik.values.client;

//       if (!clientId) {
//         setWorkOrders([]);
//         setNttnLinkIds([]);
//         setCurrentNttnId(null);
//         setCurrentLinkTypeId(null);
//         setCurrentRates([]);
//         formik.setFieldValue('nttn_work_order_id', '');
//         formik.setFieldValue('capacity', '');
//         formik.setFieldValue('capacity_cost', '');
//         formik.setFieldValue('workorder_id', '');
//         return;
//       }

//       setIsLoadingWorkOrders(true);
//       try {
//         console.log(`📡 Fetching work orders for client ID: ${clientId}`);

//         const workOrdersRes = await fetchWorkOrderBeModification(null, clientId);
//         const workOrdersData = Array.isArray(workOrdersRes)
//           ? workOrdersRes
//           : workOrdersRes?.data || [];

//         console.log('📋 Work orders fetched:', workOrdersData);
//         setWorkOrders(workOrdersData);

//         const links = [
//           ...new Set(workOrdersData.map((wo) => wo.nttn_work_order_id).filter(Boolean)),
//         ];
//         console.log('🔗 NTTN Link IDs:', links);
//         setNttnLinkIds(links);

//         // ✅ Pre-fetch rates for all unique NTTN + link_type combinations
//         const uniqueCombinations = [
//           ...new Set(
//             workOrdersData
//               .filter((wo) => wo.nttn_id && wo.link_type_id)
//               .map((wo) => `${wo.nttn_id}_${wo.link_type_id}`)
//           ),
//         ];
//         console.log('📡 Pre-fetching rates for combinations:', uniqueCombinations);

//         await Promise.all(
//           uniqueCombinations.map((combo) => {
//             const [nttnId, linkTypeId] = combo.split('_');
//             return fetchRatesForNttn(parseInt(nttnId), parseInt(linkTypeId));
//           })
//         );
//       } catch (error) {
//         console.error('❌ Error fetching work orders:', error);
//         showToast?.("Failed to load work orders for this client", "error");
//         setWorkOrders([]);
//         setNttnLinkIds([]);
//       } finally {
//         setIsLoadingWorkOrders(false);
//       }
//     };

//     fetchWorkOrdersForClient();
//   }, [formik.values.client, showToast]);

//   /* ---------- cascading selects ---------- */
//   useEffect(() => {
//     if (!formik.values.client_category) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.client_category)
//       .then((clientsRes) => {
//         const clientsData = Array.isArray(clientsRes) ? clientsRes : clientsRes?.data || [];
//         setClients(clientsData);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category]);

//   /* ---------- auto-fill current capacity & cost when link chosen ---------- */
//   useEffect(() => {
//     const linkId = formik.values.nttn_work_order_id;
//     const list = Array.isArray(workOrders) ? workOrders : [];

//     if (!linkId || !list.length) {
//       formik.setFieldValue('capacity', '');
//       formik.setFieldValue('capacity_cost', '');
//       formik.setFieldValue('workorder_id', '');
//       formik.setFieldValue('rate_id', '');
//       setCurrentNttnId(null);
//       setCurrentLinkTypeId(null);
//       setCurrentRates([]);
//       return;
//     }

//     const wo = list.find((w) => w.nttn_work_order_id === linkId);
//     if (wo) {
//       const requestCapacity = parseFloat(wo.request_capacity) || 0;
//       formik.setFieldValue('capacity', requestCapacity);
//       formik.setFieldValue('workorder_id', wo.id);

//       // ✅ Store both NTTN ID and link_type_id from the work order
//       setCurrentNttnId(wo.nttn_id);
//       setCurrentLinkTypeId(wo.link_type_id); // ✅ Changed from nttn_work_order_id to link_type_id
      
//       console.log('🔍 Selected work order:', {
//         nttn_id: wo.nttn_id,
//         link_type_id: wo.link_type_id,
//         nttn_work_order_id: wo.nttn_work_order_id,
//         request_capacity: requestCapacity,
//       });

//       const workOrderRateId = wo.rate_id;
      
//       if (workOrderRateId) {
//         const cacheKey = wo.link_type_id ? `${wo.nttn_id}_${wo.link_type_id}` : wo.nttn_id;
//         const cachedRates = ratesCache.get(cacheKey) || [];
//         const matchingRate = cachedRates.find((rate) => rate.id === parseInt(workOrderRateId));
        
//         if (matchingRate && matchingRate.rate) {
//           const unitRate = parseFloat(matchingRate.rate);
//           const totalCost = (requestCapacity * unitRate).toFixed(2);
          
//           formik.setFieldValue('capacity_cost', totalCost);
//           formik.setFieldValue('rate_id', workOrderRateId);
          
//           // Fetch and set current rates for this NTTN + link_type combination
//           fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
//             console.log('✅ Rates fetched successfully:', rates);
//             setCurrentRates(rates);
//           }).catch(err => {
//             console.error('❌ Failed to fetch rates:', err);
//             setCurrentRates([]);
//           });
          
//           console.log('💰 Calculated cost using rate_id:', {
//             workOrder: wo.nttn_work_order_id,
//             rateId: workOrderRateId,
//             requestCapacity: requestCapacity,
//             unitRate: unitRate,
//             totalCost: totalCost,
//             nttnId: wo.nttn_id,
//             linkTypeId: wo.link_type_id,
//           });
//         } else {
//           const rates = calculateRates(wo);
//           formik.setFieldValue('capacity_cost', rates.totalCost);
//           formik.setFieldValue('rate_id', rates.rateId);
          
//           fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
//             setCurrentRates(rates);
//           }).catch(err => {
//             console.error('❌ Failed to fetch rates (fallback):', err);
//             setCurrentRates([]);
//           });
//         }
//       } else {
//         const rates = calculateRates(wo);
//         formik.setFieldValue('capacity_cost', rates.totalCost);
//         formik.setFieldValue('rate_id', rates.rateId);
        
//         fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
//           setCurrentRates(rates);
//         }).catch(err => {
//           console.error('❌ Failed to fetch rates (no rate_id):', err);
//           setCurrentRates([]);
//         });
//       }
//     } else {
//       formik.setFieldValue('capacity', '');
//       formik.setFieldValue('capacity_cost', '');
//       formik.setFieldValue('workorder_id', '');
//       formik.setFieldValue('rate_id', '');
//       setCurrentNttnId(null);
//       setCurrentLinkTypeId(null);
//       setCurrentRates([]);
//     }
//   }, [formik.values.nttn_work_order_id, workOrders, ratesCache]);

//   /* ---------- auto-release lock when field is cleared ---------- */
//   useEffect(() => {
//     if (lockedField === 'bw' && !formik.values.shifting_bw) setLockedField(null);
//   }, [formik.values.shifting_bw, lockedField]);

//   useEffect(() => {
//     if (lockedField === 'amount' && !formik.values.shifting_capacity) setLockedField(null);
//   }, [formik.values.shifting_capacity, lockedField]);

//   /* ---------- ✅ Calculate rates when New BW changes using the API ---------- */
//   useEffect(() => {
//     const calculateNewRates = async () => {
//       if (lockedField === 'amount') return;

//       const bw = parseFloat(formik.values.shifting_bw);

//       if (!bw || !currentNttnId) {
//         console.log('❌ Missing BW or currentNttnId for calculation');
//         formik.setFieldValue('shifting_unit_cost', '');
//         formik.setFieldValue('shifting_capacity', '');
//         return;
//       }

//       setIsLoadingRates(true);
//       try {
//         console.log('🔄 Calculating rates for New BW:', bw, 'NTTN:', currentNttnId, 'Link Type:', currentLinkTypeId);

//         // ✅ Use the API endpoint with link_type_id
//         // This will generate: GET /api/rates/nttn/1/bandwidth/20?link_type_id=2
//         const rateData = await fetchRateForBandwidth(currentNttnId, bw, currentLinkTypeId);

//         if (rateData && rateData.rate) {
//           console.log('✅ Rate found via API:', rateData);
//           formik.setFieldValue('shifting_unit_cost', rateData.rate.toFixed(2));
          
//           // ✅ Set rate_id as integer
//           if (rateData.rateId) {
//             const rateIdValue = typeof rateData.rateId === 'string' 
//               ? parseInt(rateData.rateId) 
//               : rateData.rateId;
            
//             console.log('🔑 Setting rate_id:', rateIdValue);
//             formik.setFieldValue('rate_id', rateIdValue);
//           }

//           const totalAmount = (bw * rateData.rate).toFixed(2);
//           formik.setFieldValue('shifting_capacity', totalAmount);
//         } else {
//           console.log('❌ No rate found, trying fallback');
          
//           // Fallback to cached rates
//           const rateDataFallback = findRateForBandwidth(bw, currentRates);
          
//           if (rateDataFallback) {
//             formik.setFieldValue('shifting_unit_cost', rateDataFallback.rate.toFixed(2));
//             formik.setFieldValue('rate_id', rateDataFallback.rateId);
//             formik.setFieldValue('shifting_capacity', (bw * rateDataFallback.rate).toFixed(2));
//           } else {
//             // Use current unit rate as last resort
//             const currentUnitRate = unitRateFromCurrent();
//             if (currentUnitRate > 0) {
//               formik.setFieldValue('shifting_unit_cost', currentUnitRate.toFixed(2));
//               formik.setFieldValue('shifting_capacity', (bw * currentUnitRate).toFixed(2));
//               formik.setFieldValue('rate_id', null);
//             } else {
//               formik.setFieldValue('shifting_unit_cost', '');
//               formik.setFieldValue('shifting_capacity', '');
//               formik.setFieldValue('rate_id', null);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error calculating new rates:', error);
//         formik.setFieldValue('shifting_unit_cost', '');
//         formik.setFieldValue('shifting_capacity', '');
//         formik.setFieldValue('rate_id', '');
//       } finally {
//         setIsLoadingRates(false);
//       }
//     };

//     const timeoutId = setTimeout(() => {
//       calculateNewRates();
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [formik.values.shifting_bw, currentNttnId, currentLinkTypeId, lockedField]);

//   // 2. BW + Unit Cost -> Amount (Fallback)
//   useEffect(() => {
//     if (lockedField === 'amount') return;
//     const bw = parseFloat(formik.values.shifting_bw);
//     const rate = parseFloat(formik.values.shifting_unit_cost);
//     if (isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
//       formik.setFieldValue('shifting_capacity', (bw * rate).toFixed(2));
//     } else if (lockedField !== 'amount') {
//       formik.setFieldValue('shifting_capacity', '');
//     }
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField]);

//   // Helper function for reverse calculation
//   const unitRateFromCurrent = () => {
//     const cap = parseFloat(formik.values.capacity);
//     const cost = parseFloat(formik.values.capacity_cost);
//     if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
//     return cost / cap;
//   };

//   // 3. Amount -> BW + Unit Cost (Reverse Calculation)
//   useEffect(() => {
//     const amount = parseFloat(formik.values.shifting_capacity);
//     const rate = unitRateFromCurrent();

//     if (lockRef.current !== 'amount') return;

//     if (isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
//       const calculatedBW = (amount / rate).toFixed(2);
//       if (formik.values.shifting_bw !== calculatedBW) {
//         formik.setFieldValue('shifting_bw', calculatedBW);
//       }

//       const rateStr = rate.toFixed(2);
//       if (formik.values.shifting_unit_cost !== rateStr) {
//         formik.setFieldValue('shifting_unit_cost', rateStr);
//       }
//     } else {
//       if (formik.values.shifting_bw !== '') {
//         formik.setFieldValue('shifting_bw', '');
//       }
//       const rateStr = rate > 0 ? rate.toFixed(2) : '';
//       if (formik.values.shifting_unit_cost !== rateStr) {
//         formik.setFieldValue('shifting_unit_cost', rateStr);
//       }
//     }
//   }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost]);

//   // ✅ Auto-lock a field in edit mode if it has initial data
//   useEffect(() => {
//     if (isEditMode && !lockedField) {
//       if (formik.values.shifting_bw) {
//         setLockedField('bw');
//       } else if (formik.values.shifting_capacity) {
//         setLockedField('amount');
//       }
//     }
//   }, [isEditMode, formik.values.shifting_bw, formik.values.shifting_capacity, lockedField]);

//   /* ---------- submit ---------- */
//   const handleSave = async (values) => {
//     setIsSubmitting(true);
//     try {
//       console.log('📋 Form Values Before Submission:', {
//         workorder_id: values.workorder_id,
//         shifting_bw: values.shifting_bw,
//         shifting_unit_cost: values.shifting_unit_cost,
//         shifting_capacity: values.shifting_capacity,
//         rate_id: values.rate_id,
//         reason_id: values.reason_id,
//         nttn_work_order_id: values.nttn_work_order_id,
//         capacity: values.capacity,
//         capacity_cost: values.capacity_cost,
//       });

//       const payload = {
//         workorder: values.workorder_id,
//         nttn_provider: values.nttn_provider,
//         modification_type: values.modification_type,
//         client_category: values.client_category,
//         client: values.client,
//         nttn_work_order_id: values.nttn_work_order_id,
//         capacity: parseFloat(values.capacity) || 0,
//         capacity_cost: parseFloat(values.capacity_cost) || 0,
//         shifting_bw: parseFloat(values.shifting_bw) || 0,
//         shifting_capacity: parseFloat(values.shifting_capacity) || 0,
//         shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
//         remarks: values.remarks || '',
//         reason_id: values.reason_id || null,
//         submission: values.submission ? format(new Date(values.submission), 'yyyy-MM-dd') : null,
//         rate_id: values.rate_id ? parseInt(values.rate_id) : null,
//       };

//       console.log('📤 Final Payload to Backend:', payload);
//       console.log('🔍 rate_id in payload:', payload.rate_id, 'Type:', typeof payload.rate_id);

//       let res;
//       if (isEditMode) {
//         console.log('✏️ Updating BW Modification ID:', values.id);
//         res = await updateBWModification(values.id, payload);
//         showToast?.('BW Modification updated!', 'success');
//       } else {
//         console.log('➕ Creating new BW Modification');
//         res = await createBWModification(payload);
//         showToast?.('BW Modification created!', 'success');
//       }

//       console.log('✅ API Response:', res);
//       onCancel();
//     } catch (e) {
//       console.error('❌ Save failed:', e);
//       showToast?.(e.response?.data?.message || e.message || 'Save failed', 'error');
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

//   const nttnOptions = Array.isArray(nttnProviders)
//     ? nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))
//     : [];

//   const modificationTypeOptions = STATIC_MODIFICATION_TYPES;

//   const clientCategoryOptions = Array.isArray(clientCategories)
//     ? clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))
//     : [];

//   const clientOptions = Array.isArray(clients)
//     ? clients.map((c) => ({ value: c.id, label: c.client_name }))
//     : [];

//   const nttnLinkOptions = Array.isArray(nttnLinkIds)
//     ? nttnLinkIds.map((id) => ({ value: id, label: id }))
//     : [];

//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
//         {/* header */}
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
//               {isEditMode ? 'Edit Capacity Shift' : 'BW Modification'}
//             </h1>
//             <p className="text-gray-500">
//               Fill in the details to {isEditMode ? 'update' : 'add a new'} bandwidth modification
//               record.
//             </p>
//           </div>
//         </div>

//         {/* Basic Info */}
//         <FormSection title="Basic Info">
//           <SelectField
//             name="modification_type"
//             placeholder="Modification Type *"
//             options={modificationTypeOptions}
//             onChange={(v) => formik.setFieldValue('modification_type', v)}
//             searchable
//           />
//           <SelectField
//             name="nttn_provider"
//             placeholder="NTTN Provider *"
//             options={nttnOptions}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />
//           <SelectField
//             name="client_category"
//             placeholder="Client Category *"
//             options={clientCategoryOptions}
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
//             options={clientOptions}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//         </FormSection>

//         {/* Current Details */}
//         <FormSection title="Current Details">
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//             <SelectField
//               name="nttn_work_order_id"
//               placeholder={`NTTN Link ID * ${isLoadingWorkOrders ? '(Loading...)' : ''}`}
//               options={nttnLinkOptions}
//               onChange={(v) => formik.setFieldValue('nttn_work_order_id', v)}
//               searchable
//               disabled={!formik.values.client || isLoadingWorkOrders}
//             />
//             <InputField name="capacity" label="Last Capacity" type="number" step="0.01" disabled />
//             <InputField
//               name="capacity_cost"
//               label="Current Capacity Cost"
//               type="number"
//               step="0.01"
//               disabled
//             />
//           </div>
//         </FormSection>

//         {/* New Values */}
//         <FormSection title="New Values">
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//             <InputField
//               name="shifting_bw"
//               label="New BW *"
//               type="number"
//               step="0.01"
//               disabled={lockedField === 'amount'}
//               onBlur={(e) => {
//                 formik.handleBlur(e);
//                 lockedField !== 'amount' && setLockedField('bw');
//               }}
//             />
//             <InputField
//               name="shifting_capacity"
//               label="New Total Amount *"
//               type="number"
//               step="0.01"
//               disabled={lockedField === 'bw'}
//               onChange={(e) => {
//                 formik.handleChange(e);
//                 if (lockedField !== 'bw') {
//                   setLockedField('amount');
//                 }
//               }}
//               onBlur={formik.handleBlur}
//             />
//             <InputField
//               name="shifting_unit_cost"
//               label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//               type="number"
//               step="0.01"
//               disabled
//             />
//           </div>
//         </FormSection>

//         {/* Additional Information */}
//         <FormSection title="Additional Information">
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="col-span-2">
//               <InputField
//                 name="remarks"
//                 label="Remarks"
//                 type="textarea"
//                 placeholder="Enter any additional remarks or notes..."
//                 rows={3}
//               />
//             </div>
//             <SelectField
//               name="reason_id"
//               placeholder={`Reason ${isLoadingReasons ? '(Loading...)' : ''}`}
//               options={reasons}
//               onChange={(v) => formik.setFieldValue('reason_id', v)}
//               searchable
//               disabled={isLoadingReasons}
//               help="Select reason for modification (optional)"
//             />
//             <DatePickerField
//               name="submission"
//               label="Submission Date"
//               placeholder="Select date"
//               field={formik.getFieldProps('submission')}
//               form={formik}
//               help="Date when modification was submitted (optional)"
//             />
//           </div>
//         </FormSection>

//         {/* Actions */}
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

// export default BWModificationForm;







import React, { useEffect, useState, useRef } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import * as Yup from 'yup';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import DatePickerField from '../fields/DatePickerField';
import { format } from 'date-fns';

import { BWModificationSchema } from '../../validations/bwModificationValidation';

import { fetchNTTNs } from '../../services/nttn';
import { fetchCategories } from '../../services/category';
import { fetchClientsCategoryWise } from '../../services/client';
import { fetchWorkOrderBeModification } from '../../services/workOrder';
import { fetchRatesByNttn, fetchRateByNttnAndBandwidth } from '../../services/rate';
import { fetchModificationTypes } from '../../services/modificationType';
import { createBWModification, updateBWModification } from '../../services/bwModification';
import { updateWorkOrder, updateWorkOrderLaravel } from '../../services/workOrder';
import { fetchReasons } from '../../services/reason';

/* ---------- section wrapper (same as SurveyForm) ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- empty initial shape ---------- */
const emptyValues = {
  id: '',
  nttn_provider: null,
  modification_type: '',
  client_category: null,
  client: null,
  nttn_work_order_id: '',
  capacity: '',
  capacity_cost: '',
  shifting_bw: '',
  shifting_capacity: '',
  shifting_unit_cost: '',
  workorder_id: '',
  rate_id: '',
  remarks: '',
  reason_id: '',
  submission: '',
};

// Static modification types
const STATIC_MODIFICATION_TYPES = [
  { value: '1', label: 'Upgrade' },
  { value: '2', label: 'Downgrade' },
];

const BWModificationForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const navigate = useNavigate();
  const [nttnProviders, setNttnProviders] = useState([]);
  const [modificationTypes, setModificationTypes] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [bandwidthRanges, setBandwidthRanges] = useState([]);
  const [nttnLinkIds, setNttnLinkIds] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [ratesCache, setRatesCache] = useState(new Map());
  const [currentNttnId, setCurrentNttnId] = useState(null);
  const [currentLinkTypeId, setCurrentLinkTypeId] = useState(null);
  const [currentRates, setCurrentRates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedField, setLockedField] = useState(null);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);
  const [currentRateType, setCurrentRateType] = useState(null);

  const lockRef = useRef(lockedField);
  useEffect(() => {
    lockRef.current = lockedField;
  }, [lockedField]);

  /* ---------- formik ---------- */
  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: BWModificationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await handleSave(values);
    },
  });

  // Function to fetch rates for a specific NTTN and cache them
  const fetchRatesForNttn = async (nttnId, linkTypeId = null) => {
    const cacheKey = linkTypeId ? `${nttnId}_${linkTypeId}` : nttnId;
    
    if (!nttnId || ratesCache.has(cacheKey)) {
      return ratesCache.get(cacheKey) || [];
    }

    try {
      console.log(`📡 Fetching rates for NTTN ID: ${nttnId}${linkTypeId ? `, Link Type ID: ${linkTypeId}` : ''}`);
      
      const rates = await fetchRatesByNttn(nttnId, null, linkTypeId);
      const ratesData = rates.data || rates;

      setRatesCache((prev) => new Map(prev).set(cacheKey, ratesData));
      return ratesData;
    } catch (error) {
      console.error(`❌ Error fetching rates for NTTN ${nttnId}:`, error);
      return [];
    }
  };

  // ✅ NEW: Function to fetch rate for specific bandwidth using the correct API
  const fetchRateForBandwidth = async (nttnId, bandwidth, linkTypeId = null) => {
    try {
      console.log(`🎯 Fetching rate for NTTN: ${nttnId}, BW: ${bandwidth}, Link Type: ${linkTypeId}`);
      
      const response = await fetchRatesByNttn(nttnId, bandwidth, linkTypeId);
      
      if (response && response.rate) {
        console.log('💰 Rate found via API:', response);
        
        // Convert rate_type to number if it's a string
        const rateTypeValue = response.rate_type 
          ? parseInt(response.rate_type, 10) 
          : null;
        
        console.log('📌 Rate Type:', rateTypeValue);
        setCurrentRateType(rateTypeValue);
        
        return {
          rate: parseFloat(response.rate),
          rateId: response.id,
          rangeFrom: response.bw_range_from,
          rangeTo: response.bw_range_to,
          rateType: rateTypeValue,
        };
      }
      
      console.log('❌ No rate found via API');
      setCurrentRateType(null);
      return null;
    } catch (error) {
      console.error('❌ Error fetching rate for bandwidth:', error);
      setCurrentRateType(null);
      return null;
    }
  };

  // Function to fetch reasons
  const fetchReasonsList = async () => {
    setIsLoadingReasons(true);
    try {
      console.log('📡 Fetching reasons...');
      const reasonsRes = await fetchReasons();
      const reasonsData = reasonsRes?.data || reasonsRes || [];
      
      const mappedReasons = Array.isArray(reasonsData) 
        ? reasonsData.map((reason) => ({
            value: String(reason.id),
            label: reason.reason || reason.reason_name || `Reason ${reason.id}`,
          }))
        : [];
      
      console.log('✅ Reasons fetched:', mappedReasons);
      setReasons(mappedReasons);
    } catch (error) {
      console.error('❌ Error fetching reasons:', error);
      setReasons([]);
      showToast?.('Failed to load reasons list', 'warning');
    } finally {
      setIsLoadingReasons(false);
    }
  };

  // Function to find rate for specific bandwidth from current rates (fallback)
  const findRateForBandwidth = (bandwidth, rates = currentRates) => {
    if (!bandwidth || !Array.isArray(rates) || rates.length === 0) {
      return null;
    }

    try {
      console.log(`🎯 Finding rate for BW: ${bandwidth} from ${rates.length} available rates`);

      const matchingRate = rates.find((rate) => {
        const rangeFrom = parseFloat(rate.bw_range_from);
        const rangeTo = parseFloat(rate.bw_range_to);
        return bandwidth >= rangeFrom && bandwidth <= rangeTo;
      });

      if (matchingRate) {
        console.log('💰 Rate found:', matchingRate.rate, 'Rate ID:', matchingRate.id);
        return {
          rate: parseFloat(matchingRate.rate),
          rateId: matchingRate.id,
          rangeFrom: matchingRate.bw_range_from,
          rangeTo: matchingRate.bw_range_to,
        };
      } else {
        console.log('❌ No rate found for bandwidth:', bandwidth);
        return null;
      }
    } catch (error) {
      console.error('❌ Error finding rate for bandwidth:', error);
      return null;
    }
  };

  // Function to calculate unit rate and total cost using actual rates data
  const calculateRates = (record) => {
    const requestCapacity = parseFloat(record.request_capacity) || 0;

    if (record.unit_rate && record.rate_id) {
      const unitRate = parseFloat(record.unit_rate);
      const totalCost = requestCapacity * unitRate;
      return {
        unitRate: unitRate.toFixed(2),
        totalCost: totalCost.toFixed(2),
        rateId: record.rate_id,
      };
    }

    const nttnRates = ratesCache.get(record.nttn_id) || [];

    if (nttnRates.length > 0 && record.nttn_id && requestCapacity > 0) {
      const matchingRate = nttnRates.find((rate) => {
        const rangeFrom = parseFloat(rate.bw_range_from);
        const rangeTo = parseFloat(rate.bw_range_to);
        return requestCapacity >= rangeFrom && requestCapacity <= rangeTo;
      });

      if (matchingRate) {
        const unitRate = parseFloat(matchingRate.rate);
        const totalCost = requestCapacity * unitRate;
        return {
          unitRate: unitRate.toFixed(2),
          totalCost: totalCost.toFixed(2),
          rateId: matchingRate.id,
        };
      }
    }

    return {
      unitRate: '0.00',
      totalCost: '0.00',
      rateId: null,
    };
  };

  /* ---------- data bootstrap ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const [nttnRes, catsRes] = await Promise.all([
          fetchNTTNs(), 
          fetchCategories(),
          fetchReasonsList()
        ]);

        const nttnData = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
        const catsData = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];

        console.log('📊 API Responses:', {
          nttn: nttnData,
          categories: catsData,
        });

        setNttnProviders(nttnData);
        setClientCategories(catsData);
        setModificationTypes(STATIC_MODIFICATION_TYPES);
        setWorkOrders([]);
      } catch (e) {
        console.error('❌ Boot error:', e);
        showToast?.(e.message || "Failed to load form data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- fetch work orders when client is selected ---------- */
  useEffect(() => {
    const fetchWorkOrdersForClient = async () => {
      const clientId = formik.values.client;

      if (!clientId) {
        setWorkOrders([]);
        setNttnLinkIds([]);
        setCurrentNttnId(null);
        setCurrentLinkTypeId(null);
        setCurrentRates([]);
        formik.setFieldValue('nttn_work_order_id', '');
        formik.setFieldValue('capacity', '');
        formik.setFieldValue('capacity_cost', '');
        formik.setFieldValue('workorder_id', '');
        return;
      }

      setIsLoadingWorkOrders(true);
      try {
        console.log(`📡 Fetching work orders for client ID: ${clientId}`);

        const workOrdersRes = await fetchWorkOrderBeModification(null, clientId);
        const workOrdersData = Array.isArray(workOrdersRes)
          ? workOrdersRes
          : workOrdersRes?.data || [];

        console.log('📋 Work orders fetched:', workOrdersData);
        setWorkOrders(workOrdersData);

        const links = [
          ...new Set(workOrdersData.map((wo) => wo.nttn_work_order_id).filter(Boolean)),
        ];
        console.log('🔗 NTTN Link IDs:', links);
        setNttnLinkIds(links);

        // ✅ Pre-fetch rates for all unique NTTN + link_type combinations
        const uniqueCombinations = [
          ...new Set(
            workOrdersData
              .filter((wo) => wo.nttn_id && wo.link_type_id)
              .map((wo) => `${wo.nttn_id}_${wo.link_type_id}`)
          ),
        ];
        console.log('📡 Pre-fetching rates for combinations:', uniqueCombinations);

        await Promise.all(
          uniqueCombinations.map((combo) => {
            const [nttnId, linkTypeId] = combo.split('_');
            return fetchRatesForNttn(parseInt(nttnId), parseInt(linkTypeId));
          })
        );
      } catch (error) {
        console.error('❌ Error fetching work orders:', error);
        showToast?.("Failed to load work orders for this client", "error");
        setWorkOrders([]);
        setNttnLinkIds([]);
      } finally {
        setIsLoadingWorkOrders(false);
      }
    };

    fetchWorkOrdersForClient();
  }, [formik.values.client, showToast]);

  /* ---------- cascading selects ---------- */
  useEffect(() => {
    if (!formik.values.client_category) {
      setClients([]);
      formik.setFieldValue('client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.client_category)
      .then((clientsRes) => {
        const clientsData = Array.isArray(clientsRes) ? clientsRes : clientsRes?.data || [];
        setClients(clientsData);
      })
      .catch(() => setClients([]));
  }, [formik.values.client_category]);

  /* ---------- auto-fill current capacity & cost when link chosen ---------- */
  useEffect(() => {
    const linkId = formik.values.nttn_work_order_id;
    const list = Array.isArray(workOrders) ? workOrders : [];

    if (!linkId || !list.length) {
      formik.setFieldValue('capacity', '');
      formik.setFieldValue('capacity_cost', '');
      formik.setFieldValue('workorder_id', '');
      formik.setFieldValue('rate_id', '');
      setCurrentNttnId(null);
      setCurrentLinkTypeId(null);
      setCurrentRates([]);
      return;
    }

    const wo = list.find((w) => w.nttn_work_order_id === linkId);
    if (wo) {
      const requestCapacity = parseFloat(wo.request_capacity) || 0;
      formik.setFieldValue('capacity', requestCapacity);
      formik.setFieldValue('workorder_id', wo.id);

      // ✅ Store both NTTN ID and link_type_id from the work order
      setCurrentNttnId(wo.nttn_id);
      setCurrentLinkTypeId(wo.link_type_id); // ✅ Changed from nttn_work_order_id to link_type_id
      
      console.log('🔍 Selected work order:', {
        nttn_id: wo.nttn_id,
        link_type_id: wo.link_type_id,
        nttn_work_order_id: wo.nttn_work_order_id,
        request_capacity: requestCapacity,
      });

      const workOrderRateId = wo.rate_id;
      
      if (workOrderRateId) {
        const cacheKey = wo.link_type_id ? `${wo.nttn_id}_${wo.link_type_id}` : wo.nttn_id;
        const cachedRates = ratesCache.get(cacheKey) || [];
        const matchingRate = cachedRates.find((rate) => rate.id === parseInt(workOrderRateId));
        
        if (matchingRate && matchingRate.rate) {
          const unitRate = parseFloat(matchingRate.rate);
          const totalCost = (requestCapacity * unitRate).toFixed(2);
          
          formik.setFieldValue('capacity_cost', totalCost);
          formik.setFieldValue('rate_id', workOrderRateId);
          
          // Fetch and set current rates for this NTTN + link_type combination
          fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
            console.log('✅ Rates fetched successfully:', rates);
            setCurrentRates(rates);
          }).catch(err => {
            console.error('❌ Failed to fetch rates:', err);
            setCurrentRates([]);
          });
          
          console.log('💰 Calculated cost using rate_id:', {
            workOrder: wo.nttn_work_order_id,
            rateId: workOrderRateId,
            requestCapacity: requestCapacity,
            unitRate: unitRate,
            totalCost: totalCost,
            nttnId: wo.nttn_id,
            linkTypeId: wo.link_type_id,
          });
        } else {
          const rates = calculateRates(wo);
          formik.setFieldValue('capacity_cost', rates.totalCost);
          formik.setFieldValue('rate_id', rates.rateId);
          
          fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
            setCurrentRates(rates);
          }).catch(err => {
            console.error('❌ Failed to fetch rates (fallback):', err);
            setCurrentRates([]);
          });
        }
      } else {
        const rates = calculateRates(wo);
        formik.setFieldValue('capacity_cost', rates.totalCost);
        formik.setFieldValue('rate_id', rates.rateId);
        
        fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
          setCurrentRates(rates);
        }).catch(err => {
          console.error('❌ Failed to fetch rates (no rate_id):', err);
          setCurrentRates([]);
        });
      }
    } else {
      formik.setFieldValue('capacity', '');
      formik.setFieldValue('capacity_cost', '');
      formik.setFieldValue('workorder_id', '');
      formik.setFieldValue('rate_id', '');
      setCurrentNttnId(null);
      setCurrentLinkTypeId(null);
      setCurrentRates([]);
    }
  }, [formik.values.nttn_work_order_id, workOrders, ratesCache]);

  /* ---------- auto-release lock when field is cleared ---------- */
  useEffect(() => {
    if (lockedField === 'bw' && !formik.values.shifting_bw) setLockedField(null);
  }, [formik.values.shifting_bw, lockedField]);

  useEffect(() => {
    if (lockedField === 'amount' && !formik.values.shifting_capacity) setLockedField(null);
  }, [formik.values.shifting_capacity, lockedField]);

  /* ---------- ✅ Calculate rates when New BW changes using the API ---------- */
  useEffect(() => {
  const calculateNewRates = async () => {
    if (lockedField === 'amount') return;

    const bw = parseFloat(formik.values.shifting_bw);

    if (!bw || !currentNttnId) {
      console.log('❌ Missing BW or currentNttnId for calculation');
      formik.setFieldValue('shifting_unit_cost', '');
      formik.setFieldValue('shifting_capacity', '');
      setCurrentRateType(null);
      return;
    }

    setIsLoadingRates(true);
    try {
      console.log('📄 Calculating rates for New BW:', bw, 'NTTN:', currentNttnId, 'Link Type:', currentLinkTypeId);

      const rateData = await fetchRateForBandwidth(currentNttnId, bw, currentLinkTypeId);

      if (rateData && rateData.rate) {
        console.log('✅ Rate found via API:', rateData);
        formik.setFieldValue('shifting_unit_cost', rateData.rate.toFixed(2));
        
        if (rateData.rateId) {
          const rateIdValue = typeof rateData.rateId === 'string' 
            ? parseInt(rateData.rateId) 
            : rateData.rateId;
          
          console.log('🔑 Setting rate_id:', rateIdValue);
          formik.setFieldValue('rate_id', rateIdValue);
        }

        // Calculate total amount based on rate_type
        if (rateData.rateType === 1) {
          // rate_type 1: just show unit rate (no multiplication)
          formik.setFieldValue('shifting_capacity', rateData.rate.toFixed(2));
          console.log('📌 Rate Type 1: Total Amount = Unit Rate =', rateData.rate.toFixed(2));
        } else if (rateData.rateType === 2) {
          // rate_type 2: multiply BW × unit rate
          const totalAmount = (bw * rateData.rate).toFixed(2);
          formik.setFieldValue('shifting_capacity', totalAmount);
          console.log('📌 Rate Type 2: Total Amount = BW × Unit Rate =', totalAmount);
        }
      } else {
        console.log('❌ No rate found, trying fallback');
        
        const rateDataFallback = findRateForBandwidth(bw, currentRates);
        
        if (rateDataFallback) {
          formik.setFieldValue('shifting_unit_cost', rateDataFallback.rate.toFixed(2));
          formik.setFieldValue('rate_id', rateDataFallback.rateId);
          formik.setFieldValue('shifting_capacity', (bw * rateDataFallback.rate).toFixed(2));
        } else {
          const currentUnitRate = unitRateFromCurrent();
          if (currentUnitRate > 0) {
            formik.setFieldValue('shifting_unit_cost', currentUnitRate.toFixed(2));
            formik.setFieldValue('shifting_capacity', (bw * currentUnitRate).toFixed(2));
            formik.setFieldValue('rate_id', null);
          } else {
            formik.setFieldValue('shifting_unit_cost', '');
            formik.setFieldValue('shifting_capacity', '');
            formik.setFieldValue('rate_id', null);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error calculating new rates:', error);
      formik.setFieldValue('shifting_unit_cost', '');
      formik.setFieldValue('shifting_capacity', '');
      formik.setFieldValue('rate_id', '');
      setCurrentRateType(null);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const timeoutId = setTimeout(() => {
    calculateNewRates();
  }, 500);

  return () => clearTimeout(timeoutId);
}, [formik.values.shifting_bw, currentNttnId, currentLinkTypeId, lockedField]);

  // 2. BW + Unit Cost -> Amount (Fallback)
  useEffect(() => {
    if (lockedField === 'amount') return;
    
    const bw = parseFloat(formik.values.shifting_bw);
    const rate = parseFloat(formik.values.shifting_unit_cost);
    
    // Only recalculate if rate_type is 2 (multiply) and we have valid values
    if (currentRateType === 2 && isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
      formik.setFieldValue('shifting_capacity', (bw * rate).toFixed(2));
      console.log('📊 Recalculating total amount for rate_type 2:', (bw * rate).toFixed(2));
    } else if (!bw || !rate) {
      formik.setFieldValue('shifting_capacity', '');
    }
  }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField, currentRateType]);

  // Helper function for reverse calculation
  const unitRateFromCurrent = () => {
    const cap = parseFloat(formik.values.capacity);
    const cost = parseFloat(formik.values.capacity_cost);
    if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
    return cost / cap;
  };

  // 3. Amount -> BW + Unit Cost (Reverse Calculation)
  useEffect(() => {
  const amount = parseFloat(formik.values.shifting_capacity);
    const rate = unitRateFromCurrent();

    if (lockRef.current !== 'amount') return;

    if (currentRateType === 2 && isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
      const calculatedBW = (amount / rate).toFixed(2);
      if (formik.values.shifting_bw !== calculatedBW) {
        formik.setFieldValue('shifting_bw', calculatedBW);
      }

      const rateStr = rate.toFixed(2);
      if (formik.values.shifting_unit_cost !== rateStr) {
        formik.setFieldValue('shifting_unit_cost', rateStr);
      }
    } else if (currentRateType === 1) {
      // For rate_type 1, amount should equal unit cost, no BW calculation needed
      if (formik.values.shifting_bw !== '') {
        formik.setFieldValue('shifting_bw', '');
      }
    } else {
      if (formik.values.shifting_bw !== '') {
        formik.setFieldValue('shifting_bw', '');
      }
      const rateStr = rate > 0 ? rate.toFixed(2) : '';
      if (formik.values.shifting_unit_cost !== rateStr) {
        formik.setFieldValue('shifting_unit_cost', rateStr);
      }
    }
  }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost, currentRateType]);

  // ✅ Auto-lock a field in edit mode if it has initial data
  useEffect(() => {
    if (isEditMode && !lockedField) {
      if (formik.values.shifting_bw) {
        setLockedField('bw');
      } else if (formik.values.shifting_capacity) {
        setLockedField('amount');
      }
    }
  }, [isEditMode, formik.values.shifting_bw, formik.values.shifting_capacity, lockedField]);

  /* ---------- submit ---------- */
  const handleSave = async (values) => {
    setIsSubmitting(true);
    try {
      console.log('📋 Form Values Before Submission:', {
        workorder_id: values.workorder_id,
        shifting_bw: values.shifting_bw,
        shifting_unit_cost: values.shifting_unit_cost,
        shifting_capacity: values.shifting_capacity,
        rate_id: values.rate_id,
        reason_id: values.reason_id,
        nttn_work_order_id: values.nttn_work_order_id,
        capacity: values.capacity,
        capacity_cost: values.capacity_cost,
      });

      const payload = {
        workorder: values.workorder_id,
        nttn_provider: values.nttn_provider,
        modification_type: values.modification_type,
        client_category: values.client_category,
        client: values.client,
        nttn_work_order_id: values.nttn_work_order_id,
        capacity: parseFloat(values.capacity) || 0,
        capacity_cost: parseFloat(values.capacity_cost) || 0,
        shifting_bw: parseFloat(values.shifting_bw) || 0,
        shifting_capacity: parseFloat(values.shifting_capacity) || 0,
        shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
        remarks: values.remarks || '',
        reason_id: values.reason_id || null,
        submission: values.submission ? format(new Date(values.submission), 'yyyy-MM-dd') : null,
        rate_id: values.rate_id ? parseInt(values.rate_id) : null,
      };

      console.log('📤 Final Payload to Backend:', payload);
      console.log('🔍 rate_id in payload:', payload.rate_id, 'Type:', typeof payload.rate_id);

      let res;
      if (isEditMode) {
        console.log('✏️ Updating BW Modification ID:', values.id);
        res = await updateBWModification(values.id, payload);
        showToast?.('BW Modification updated!', 'success');
      } else {
        console.log('➕ Creating new BW Modification');
        res = await createBWModification(payload);
        showToast?.('BW Modification created!', 'success');
      }

      console.log('✅ API Response:', res);
      onCancel();
    } catch (e) {
      console.error('❌ Save failed:', e);
      showToast?.(e.response?.data?.message || e.message || 'Save failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- render ---------- */
  if (isLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading form data...</span>
      </div>
    );
  }

  const nttnOptions = Array.isArray(nttnProviders)
    ? nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))
    : [];

  const modificationTypeOptions = STATIC_MODIFICATION_TYPES;

  const clientCategoryOptions = Array.isArray(clientCategories)
    ? clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))
    : [];

  const clientOptions = Array.isArray(clients)
    ? clients.map((c) => ({ value: c.id, label: c.client_name }))
    : [];

  const nttnLinkOptions = Array.isArray(nttnLinkIds)
    ? nttnLinkIds.map((id) => ({ value: id, label: id }))
    : [];

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
        {/* header */}
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
              {isEditMode ? 'Edit BW Modification' : 'BW Modification'}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? 'update' : 'add a new'} bandwidth modification
              record.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <FormSection title="Basic Info">
          <SelectField
            name="modification_type"
            placeholder="Modification Type *"
            options={modificationTypeOptions}
            onChange={(v) => formik.setFieldValue('modification_type', v)}
            searchable
          />
          <SelectField
            name="nttn_provider"
            placeholder="NTTN Provider *"
            options={nttnOptions}
            onChange={(v) => formik.setFieldValue('nttn_provider', v)}
            searchable
          />
          <SelectField
            name="client_category"
            placeholder="Client Category *"
            options={clientCategoryOptions}
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
            options={clientOptions}
            onChange={(v) => formik.setFieldValue('client', v)}
            searchable
            disabled={!formik.values.client_category}
          />
        </FormSection>

        {/* Current Details */}
        <FormSection title="Current Details">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField
              name="nttn_work_order_id"
              placeholder={`NTTN Link ID * ${isLoadingWorkOrders ? '(Loading...)' : ''}`}
              options={nttnLinkOptions}
              onChange={(v) => formik.setFieldValue('nttn_work_order_id', v)}
              searchable
              disabled={!formik.values.client || isLoadingWorkOrders}
            />
            <InputField name="capacity" label="Last Capacity" type="number" step="0.01" disabled />
            <InputField
              name="capacity_cost"
              label="Current Capacity Cost"
              type="number"
              step="0.01"
              disabled
            />
          </div>
        </FormSection>

        {/* New Values */}
        <FormSection title="New Values">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentRateType === 1 ? (
              <>
                <InputField
                  name="shifting_bw"
                  label="New BW *"
                  type="number"
                  step="0.01"
                  // disabled
                  help="Fixed rate - BW not applicable"
                />
                <InputField
                  name="shifting_capacity"
                  label="New Total Amount *"
                  type="number"
                  step="0.01"
                  disabled={lockedField === 'bw'}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (lockedField !== 'bw') {
                      setLockedField('amount');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  help="Fixed Rate (Unit Cost only)"
                />
              </>

            ) : (
              <>
                <InputField
                  name="shifting_bw"
                  label="New BW *"
                  type="number"
                  step="0.01"
                  disabled={lockedField === 'amount'}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    lockedField !== 'amount' && setLockedField('bw');
                  }}
                />
                <InputField
                  name="shifting_capacity"
                  label="New Total Amount *"
                  type="number"
                  step="0.01"
                  disabled={lockedField === 'bw'}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (lockedField !== 'bw') {
                      setLockedField('amount');
                    }
                  }}
                  onBlur={formik.handleBlur}
                  help="Auto-calculated (BW × Unit Rate)"
                />
              </>
            )}
            <InputField
              name="shifting_unit_cost"
              label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
              type="number"
              step="0.01"
              disabled
            />
          </div>
        </FormSection>

        {/* Additional Information */}
        <FormSection title="Additional Information">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <InputField
                name="remarks"
                label="Remarks"
                type="textarea"
                placeholder="Enter any additional remarks or notes..."
                rows={3}
              />
            </div>
            <SelectField
              name="reason_id"
              placeholder={`Reason ${isLoadingReasons ? '(Loading...)' : ''}`}
              options={reasons}
              onChange={(v) => formik.setFieldValue('reason_id', v)}
              searchable
              disabled={isLoadingReasons}
              help="Select reason for modification (optional)"
            />
            <DatePickerField
              name="submission"
              label="Submission Date"
              placeholder="Select date"
              field={formik.getFieldProps('submission')}
              form={formik}
              help="Date when modification was submitted (optional)"
            />
          </div>
        </FormSection>

        {/* Actions */}
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

export default BWModificationForm;











// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Plus, Minus } from 'lucide-react';
// import * as Yup from 'yup';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import DatePickerField from '../fields/DatePickerField';
// import { format } from 'date-fns';

// import { BWModificationSchema } from '../../validations/bwModificationValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise } from '../../services/client';
// import { fetchWorkOrderBeModification } from '../../services/workOrder';
// import { fetchRatesByNttn, fetchRateByNttnAndBandwidth } from '../../services/rate';
// import { fetchModificationTypes } from '../../services/modificationType';
// import { createBWModification, updateBWModification } from '../../services/bwModification';
// import { updateWorkOrder, updateWorkOrderLaravel } from '../../services/workOrder';
// import { fetchReasons } from '../../services/reason';

// /* ---------- section wrapper (same as SurveyForm) ---------- */
// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty initial shape ---------- */
// const emptyValues = {
//   id: '',
//   nttn_provider: null,
//   modification_type: '',
//   client_category: null,
//   client: null,
//   nttn_work_order_id: '',
//   capacity: '',
//   capacity_cost: '',
//   shifting_bw: '',
//   shifting_capacity: '',
//   shifting_unit_cost: '',
//   workorder_id: '',
//   rate_id: '',
//   remarks: '',
//   reason_id: '',
//   submission: '',
// };

// // Static modification types
// const STATIC_MODIFICATION_TYPES = [
//   { value: '1', label: 'Upgrade' },
//   { value: '2', label: 'Downgrade' },
// ];

// const BWModificationForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const navigate = useNavigate();
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [modificationTypes, setModificationTypes] = useState([]);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [workOrders, setWorkOrders] = useState([]);
//   const [bandwidthRanges, setBandwidthRanges] = useState([]);
//   const [nttnLinkIds, setNttnLinkIds] = useState([]);
//   const [reasons, setReasons] = useState([]);
//   const [ratesCache, setRatesCache] = useState(new Map());
//   const [currentNttnId, setCurrentNttnId] = useState(null);
//   const [currentLinkTypeId, setCurrentLinkTypeId] = useState(null);
//   const [currentRates, setCurrentRates] = useState([]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isLoadingReasons, setIsLoadingReasons] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lockedField, setLockedField] = useState(null);
//   const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);
//   const [currentRateType, setCurrentRateType] = useState(null);

//   const lockRef = useRef(lockedField);
//   useEffect(() => {
//     lockRef.current = lockedField;
//   }, [lockedField]);

//   /* ---------- formik ---------- */
//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: BWModificationSchema,
//     enableReinitialize: true,
//     onSubmit: async (values) => {
//       await handleSave(values);
//     },
//   });

//   // Function to fetch rates for a specific NTTN and cache them
//   const fetchRatesForNttn = async (nttnId, linkTypeId = null) => {
//     const cacheKey = linkTypeId ? `${nttnId}_${linkTypeId}` : nttnId;
    
//     if (!nttnId || ratesCache.has(cacheKey)) {
//       return ratesCache.get(cacheKey) || [];
//     }

//     try {
//       console.log(`📡 Fetching rates for NTTN ID: ${nttnId}${linkTypeId ? `, Link Type ID: ${linkTypeId}` : ''}`);
      
//       const rates = await fetchRatesByNttn(nttnId, null, linkTypeId);
//       const ratesData = rates.data || rates;

//       setRatesCache((prev) => new Map(prev).set(cacheKey, ratesData));
//       return ratesData;
//     } catch (error) {
//       console.error(`❌ Error fetching rates for NTTN ${nttnId}:`, error);
//       return [];
//     }
//   };

//   // ✅ NEW: Function to fetch rate for specific bandwidth using the correct API
//   const fetchRateForBandwidth = async (nttnId, bandwidth, linkTypeId = null) => {
//     try {
//       console.log(`🎯 Fetching rate for NTTN: ${nttnId}, BW: ${bandwidth}, Link Type: ${linkTypeId}`);
      
//       const response = await fetchRatesByNttn(nttnId, bandwidth, linkTypeId);
      
//       if (response && response.rate) {
//         console.log('💰 Rate found via API:', response);
        
//         // Convert rate_type to number if it's a string
//         const rateTypeValue = response.rate_type 
//           ? parseInt(response.rate_type, 10) 
//           : null;
        
//         console.log('📌 Rate Type:', rateTypeValue);
//         setCurrentRateType(rateTypeValue);
        
//         return {
//           rate: parseFloat(response.rate),
//           rateId: response.id,
//           rangeFrom: response.bw_range_from,
//           rangeTo: response.bw_range_to,
//           rateType: rateTypeValue,
//         };
//       }
      
//       console.log('❌ No rate found via API');
//       setCurrentRateType(null);
//       return null;
//     } catch (error) {
//       console.error('❌ Error fetching rate for bandwidth:', error);
//       setCurrentRateType(null);
//       return null;
//     }
//   };

//   // Function to fetch reasons
//   const fetchReasonsList = async () => {
//     setIsLoadingReasons(true);
//     try {
//       console.log('📡 Fetching reasons...');
//       const reasonsRes = await fetchReasons();
//       const reasonsData = reasonsRes?.data || reasonsRes || [];
      
//       const mappedReasons = Array.isArray(reasonsData) 
//         ? reasonsData.map((reason) => ({
//             value: String(reason.id),
//             label: reason.reason || reason.reason_name || `Reason ${reason.id}`,
//           }))
//         : [];
      
//       console.log('✅ Reasons fetched:', mappedReasons);
//       setReasons(mappedReasons);
//     } catch (error) {
//       console.error('❌ Error fetching reasons:', error);
//       setReasons([]);
//       showToast?.('Failed to load reasons list', 'warning');
//     } finally {
//       setIsLoadingReasons(false);
//     }
//   };

//   // Function to find rate for specific bandwidth from current rates (fallback)
//   const findRateForBandwidth = (bandwidth, rates = currentRates) => {
//     if (!bandwidth || !Array.isArray(rates) || rates.length === 0) {
//       return null;
//     }

//     try {
//       console.log(`🎯 Finding rate for BW: ${bandwidth} from ${rates.length} available rates`);

//       const matchingRate = rates.find((rate) => {
//         const rangeFrom = parseFloat(rate.bw_range_from);
//         const rangeTo = parseFloat(rate.bw_range_to);
//         return bandwidth >= rangeFrom && bandwidth <= rangeTo;
//       });

//       if (matchingRate) {
//         console.log('💰 Rate found:', matchingRate.rate, 'Rate ID:', matchingRate.id);
//         return {
//           rate: parseFloat(matchingRate.rate),
//           rateId: matchingRate.id,
//           rangeFrom: matchingRate.bw_range_from,
//           rangeTo: matchingRate.bw_range_to,
//         };
//       } else {
//         console.log('❌ No rate found for bandwidth:', bandwidth);
//         return null;
//       }
//     } catch (error) {
//       console.error('❌ Error finding rate for bandwidth:', error);
//       return null;
//     }
//   };

//   // Function to calculate unit rate and total cost using actual rates data
//   const calculateRates = (record) => {
//     const requestCapacity = parseFloat(record.request_capacity) || 0;

//     if (record.unit_rate && record.rate_id) {
//       const unitRate = parseFloat(record.unit_rate);
//       const totalCost = requestCapacity * unitRate;
//       return {
//         unitRate: unitRate.toFixed(2),
//         totalCost: totalCost.toFixed(2),
//         rateId: record.rate_id,
//       };
//     }

//     const nttnRates = ratesCache.get(record.nttn_id) || [];

//     if (nttnRates.length > 0 && record.nttn_id && requestCapacity > 0) {
//       const matchingRate = nttnRates.find((rate) => {
//         const rangeFrom = parseFloat(rate.bw_range_from);
//         const rangeTo = parseFloat(rate.bw_range_to);
//         return requestCapacity >= rangeFrom && requestCapacity <= rangeTo;
//       });

//       if (matchingRate) {
//         const unitRate = parseFloat(matchingRate.rate);
//         const totalCost = requestCapacity * unitRate;
//         return {
//           unitRate: unitRate.toFixed(2),
//           totalCost: totalCost.toFixed(2),
//           rateId: matchingRate.id,
//         };
//       }
//     }

//     return {
//       unitRate: '0.00',
//       totalCost: '0.00',
//       rateId: null,
//     };
//   };

//   /* ---------- data bootstrap ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttnRes, catsRes] = await Promise.all([
//           fetchNTTNs(), 
//           fetchCategories(),
//           fetchReasonsList()
//         ]);

//         const nttnData = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const catsData = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];

//         console.log('📊 API Responses:', {
//           nttn: nttnData,
//           categories: catsData,
//         });

//         setNttnProviders(nttnData);
//         setClientCategories(catsData);
//         setModificationTypes(STATIC_MODIFICATION_TYPES);
//         setWorkOrders([]);
//       } catch (e) {
//         console.error('❌ Boot error:', e);
//         showToast?.(e.message || "Failed to load form data", "error");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- fetch work orders when client is selected ---------- */
//   useEffect(() => {
//     const fetchWorkOrdersForClient = async () => {
//       const clientId = formik.values.client;

//       if (!clientId) {
//         setWorkOrders([]);
//         setNttnLinkIds([]);
//         setCurrentNttnId(null);
//         setCurrentLinkTypeId(null);
//         setCurrentRates([]);
//         formik.setFieldValue('nttn_work_order_id', '');
//         formik.setFieldValue('capacity', '');
//         formik.setFieldValue('capacity_cost', '');
//         formik.setFieldValue('workorder_id', '');
//         return;
//       }

//       setIsLoadingWorkOrders(true);
//       try {
//         console.log(`📡 Fetching work orders for client ID: ${clientId}`);

//         const workOrdersRes = await fetchWorkOrderBeModification(null, clientId);
//         const workOrdersData = Array.isArray(workOrdersRes)
//           ? workOrdersRes
//           : workOrdersRes?.data || [];

//         console.log('📋 Work orders fetched:', workOrdersData);
//         setWorkOrders(workOrdersData);

//         const links = [
//           ...new Set(workOrdersData.map((wo) => wo.nttn_work_order_id).filter(Boolean)),
//         ];
//         console.log('🔗 NTTN Link IDs:', links);
//         setNttnLinkIds(links);

//         // ✅ Pre-fetch rates for all unique NTTN + link_type combinations
//         const uniqueCombinations = [
//           ...new Set(
//             workOrdersData
//               .filter((wo) => wo.nttn_id && wo.link_type_id)
//               .map((wo) => `${wo.nttn_id}_${wo.link_type_id}`)
//           ),
//         ];
//         console.log('📡 Pre-fetching rates for combinations:', uniqueCombinations);

//         await Promise.all(
//           uniqueCombinations.map((combo) => {
//             const [nttnId, linkTypeId] = combo.split('_');
//             return fetchRatesForNttn(parseInt(nttnId), parseInt(linkTypeId));
//           })
//         );
//       } catch (error) {
//         console.error('❌ Error fetching work orders:', error);
//         showToast?.("Failed to load work orders for this client", "error");
//         setWorkOrders([]);
//         setNttnLinkIds([]);
//       } finally {
//         setIsLoadingWorkOrders(false);
//       }
//     };

//     fetchWorkOrdersForClient();
//   }, [formik.values.client, showToast]);

//   /* ---------- cascading selects ---------- */
//   useEffect(() => {
//     if (!formik.values.client_category) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.client_category)
//       .then((clientsRes) => {
//         const clientsData = Array.isArray(clientsRes) ? clientsRes : clientsRes?.data || [];
//         setClients(clientsData);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category]);

//   /* ---------- auto-fill current capacity & cost when link chosen ---------- */
//   useEffect(() => {
//     const linkId = formik.values.nttn_work_order_id;
//     const list = Array.isArray(workOrders) ? workOrders : [];

//     if (!linkId || !list.length) {
//       formik.setFieldValue('capacity', '');
//       formik.setFieldValue('capacity_cost', '');
//       formik.setFieldValue('workorder_id', '');
//       formik.setFieldValue('rate_id', '');
//       setCurrentNttnId(null);
//       setCurrentLinkTypeId(null);
//       setCurrentRates([]);
//       return;
//     }

//     const wo = list.find((w) => w.nttn_work_order_id === linkId);
//     if (wo) {
//       const requestCapacity = parseFloat(wo.request_capacity) || 0;
//       formik.setFieldValue('capacity', requestCapacity);
//       formik.setFieldValue('workorder_id', wo.id);

//       // ✅ Store both NTTN ID and link_type_id from the work order
//       setCurrentNttnId(wo.nttn_id);
//       setCurrentLinkTypeId(wo.link_type_id); // ✅ Changed from nttn_work_order_id to link_type_id
      
//       console.log('🔍 Selected work order:', {
//         nttn_id: wo.nttn_id,
//         link_type_id: wo.link_type_id,
//         nttn_work_order_id: wo.nttn_work_order_id,
//         request_capacity: requestCapacity,
//       });

//       const workOrderRateId = wo.rate_id;
      
//       if (workOrderRateId) {
//         const cacheKey = wo.link_type_id ? `${wo.nttn_id}_${wo.link_type_id}` : wo.nttn_id;
//         const cachedRates = ratesCache.get(cacheKey) || [];
//         const matchingRate = cachedRates.find((rate) => rate.id === parseInt(workOrderRateId));
        
//         if (matchingRate && matchingRate.rate) {
//           const unitRate = parseFloat(matchingRate.rate);
//           const totalCost = (requestCapacity * unitRate).toFixed(2);
          
//           formik.setFieldValue('capacity_cost', totalCost);
//           formik.setFieldValue('rate_id', workOrderRateId);
          
//           // Fetch and set current rates for this NTTN + link_type combination
//           fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
//             console.log('✅ Rates fetched successfully:', rates);
//             setCurrentRates(rates);
//           }).catch(err => {
//             console.error('❌ Failed to fetch rates:', err);
//             setCurrentRates([]);
//           });
          
//           console.log('💰 Calculated cost using rate_id:', {
//             workOrder: wo.nttn_work_order_id,
//             rateId: workOrderRateId,
//             requestCapacity: requestCapacity,
//             unitRate: unitRate,
//             totalCost: totalCost,
//             nttnId: wo.nttn_id,
//             linkTypeId: wo.link_type_id,
//           });
//         } else {
//           const rates = calculateRates(wo);
//           formik.setFieldValue('capacity_cost', rates.totalCost);
//           formik.setFieldValue('rate_id', rates.rateId);
          
//           fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
//             setCurrentRates(rates);
//           }).catch(err => {
//             console.error('❌ Failed to fetch rates (fallback):', err);
//             setCurrentRates([]);
//           });
//         }
//       } else {
//         const rates = calculateRates(wo);
//         formik.setFieldValue('capacity_cost', rates.totalCost);
//         formik.setFieldValue('rate_id', rates.rateId);
        
//         fetchRatesForNttn(wo.nttn_id, wo.link_type_id).then(rates => {
//           setCurrentRates(rates);
//         }).catch(err => {
//           console.error('❌ Failed to fetch rates (no rate_id):', err);
//           setCurrentRates([]);
//         });
//       }
//     } else {
//       formik.setFieldValue('capacity', '');
//       formik.setFieldValue('capacity_cost', '');
//       formik.setFieldValue('workorder_id', '');
//       formik.setFieldValue('rate_id', '');
//       setCurrentNttnId(null);
//       setCurrentLinkTypeId(null);
//       setCurrentRates([]);
//     }
//   }, [formik.values.nttn_work_order_id, workOrders, ratesCache]);

//   /* ---------- auto-release lock when field is cleared ---------- */
//   useEffect(() => {
//     if (lockedField === 'bw' && !formik.values.shifting_bw) setLockedField(null);
//   }, [formik.values.shifting_bw, lockedField]);

//   useEffect(() => {
//     if (lockedField === 'amount' && !formik.values.shifting_capacity) setLockedField(null);
//   }, [formik.values.shifting_capacity, lockedField]);

//   /* ---------- ✅ Calculate rates when New BW changes using the API ---------- */
//   useEffect(() => {
//   const calculateNewRates = async () => {
//     if (lockedField === 'amount') return;

//     const bw = parseFloat(formik.values.shifting_bw);

//     if (!bw || !currentNttnId) {
//       console.log('❌ Missing BW or currentNttnId for calculation');
//       formik.setFieldValue('shifting_unit_cost', '');
//       formik.setFieldValue('shifting_capacity', '');
//       setCurrentRateType(null);
//       return;
//     }

//     setIsLoadingRates(true);
//     try {
//       console.log('📄 Calculating rates for New BW:', bw, 'NTTN:', currentNttnId, 'Link Type:', currentLinkTypeId);

//       const rateData = await fetchRateForBandwidth(currentNttnId, bw, currentLinkTypeId);

//       if (rateData && rateData.rate) {
//         console.log('✅ Rate found via API:', rateData);
//         formik.setFieldValue('shifting_unit_cost', rateData.rate.toFixed(2));
        
//         if (rateData.rateId) {
//           const rateIdValue = typeof rateData.rateId === 'string' 
//             ? parseInt(rateData.rateId) 
//             : rateData.rateId;
          
//           console.log('🔑 Setting rate_id:', rateIdValue);
//           formik.setFieldValue('rate_id', rateIdValue);
//         }

//         // Calculate total amount based on rate_type
//         if (rateData.rateType === 1) {
//           // rate_type 1: just show unit rate (no multiplication)
//           formik.setFieldValue('shifting_capacity', rateData.rate.toFixed(2));
//           console.log('📌 Rate Type 1: Total Amount = Unit Rate =', rateData.rate.toFixed(2));
//         } else if (rateData.rateType === 2) {
//           // rate_type 2: multiply BW × unit rate
//           const totalAmount = (bw * rateData.rate).toFixed(2);
//           formik.setFieldValue('shifting_capacity', totalAmount);
//           console.log('📌 Rate Type 2: Total Amount = BW × Unit Rate =', totalAmount);
//         }
//       } else {
//         console.log('❌ No rate found, trying fallback');
        
//         const rateDataFallback = findRateForBandwidth(bw, currentRates);
        
//         if (rateDataFallback) {
//           formik.setFieldValue('shifting_unit_cost', rateDataFallback.rate.toFixed(2));
//           formik.setFieldValue('rate_id', rateDataFallback.rateId);
//           formik.setFieldValue('shifting_capacity', (bw * rateDataFallback.rate).toFixed(2));
//         } else {
//           const currentUnitRate = unitRateFromCurrent();
//           if (currentUnitRate > 0) {
//             formik.setFieldValue('shifting_unit_cost', currentUnitRate.toFixed(2));
//             formik.setFieldValue('shifting_capacity', (bw * currentUnitRate).toFixed(2));
//             formik.setFieldValue('rate_id', null);
//           } else {
//             formik.setFieldValue('shifting_unit_cost', '');
//             formik.setFieldValue('shifting_capacity', '');
//             formik.setFieldValue('rate_id', null);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error calculating new rates:', error);
//       formik.setFieldValue('shifting_unit_cost', '');
//       formik.setFieldValue('shifting_capacity', '');
//       formik.setFieldValue('rate_id', '');
//       setCurrentRateType(null);
//     } finally {
//       setIsLoadingRates(false);
//     }
//   };

//   const timeoutId = setTimeout(() => {
//     calculateNewRates();
//   }, 500);

//   return () => clearTimeout(timeoutId);
// }, [formik.values.shifting_bw, currentNttnId, currentLinkTypeId, lockedField]);

//   // 2. BW + Unit Cost -> Amount (Fallback)
//   useEffect(() => {
//   if (lockedField === 'amount') return;
  
//   const bw = parseFloat(formik.values.shifting_bw);
//   const rate = parseFloat(formik.values.shifting_unit_cost);
  
//   // Only recalculate if rate_type is 2 (multiply) and we have valid values
//   if (currentRateType === 2 && isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
//     formik.setFieldValue('shifting_capacity', (bw * rate).toFixed(2));
//     console.log('📊 Recalculating total amount for rate_type 2:', (bw * rate).toFixed(2));
//   } else if (!bw || !rate) {
//     formik.setFieldValue('shifting_capacity', '');
//   }
// }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField, currentRateType]);

// // Update the Amount -> BW + Unit Cost (Reverse Calculation) useEffect
// useEffect(() => {
//   const amount = parseFloat(formik.values.shifting_capacity);
//   const rate = unitRateFromCurrent();

//   if (lockRef.current !== 'amount') return;

//   if (currentRateType === 2 && isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
//     const calculatedBW = (amount / rate).toFixed(2);
//     if (formik.values.shifting_bw !== calculatedBW) {
//       formik.setFieldValue('shifting_bw', calculatedBW);
//     }

//     const rateStr = rate.toFixed(2);
//     if (formik.values.shifting_unit_cost !== rateStr) {
//       formik.setFieldValue('shifting_unit_cost', rateStr);
//     }
//   } else if (currentRateType === 1) {
//     // For rate_type 1, amount should equal unit cost, no BW calculation needed
//     if (formik.values.shifting_bw !== '') {
//       formik.setFieldValue('shifting_bw', '');
//     }
//   } else {
//     if (formik.values.shifting_bw !== '') {
//       formik.setFieldValue('shifting_bw', '');
//     }
//     const rateStr = rate > 0 ? rate.toFixed(2) : '';
//     if (formik.values.shifting_unit_cost !== rateStr) {
//       formik.setFieldValue('shifting_unit_cost', rateStr);
//     }
//   }
// }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost, currentRateType]);

//   // Helper function for reverse calculation
//   const unitRateFromCurrent = () => {
//     const cap = parseFloat(formik.values.capacity);
//     const cost = parseFloat(formik.values.capacity_cost);
//     if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
//     return cost / cap;
//   };

//   // 3. Amount -> BW + Unit Cost (Reverse Calculation)
//   useEffect(() => {
//   const amount = parseFloat(formik.values.shifting_capacity);
//     const rate = unitRateFromCurrent();

//     if (lockRef.current !== 'amount') return;

//     if (currentRateType === 2 && isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
//       const calculatedBW = (amount / rate).toFixed(2);
//       if (formik.values.shifting_bw !== calculatedBW) {
//         formik.setFieldValue('shifting_bw', calculatedBW);
//       }

//       const rateStr = rate.toFixed(2);
//       if (formik.values.shifting_unit_cost !== rateStr) {
//         formik.setFieldValue('shifting_unit_cost', rateStr);
//       }
//     } else if (currentRateType === 1) {
//       // For rate_type 1, amount should equal unit cost, no BW calculation needed
//       if (formik.values.shifting_bw !== '') {
//         formik.setFieldValue('shifting_bw', '');
//       }
//     } else {
//       if (formik.values.shifting_bw !== '') {
//         formik.setFieldValue('shifting_bw', '');
//       }
//       const rateStr = rate > 0 ? rate.toFixed(2) : '';
//       if (formik.values.shifting_unit_cost !== rateStr) {
//         formik.setFieldValue('shifting_unit_cost', rateStr);
//       }
//     }
//   }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost, currentRateType]);

//   // ✅ Auto-lock a field in edit mode if it has initial data
//   useEffect(() => {
//     if (isEditMode && !lockedField) {
//       if (formik.values.shifting_bw) {
//         setLockedField('bw');
//       } else if (formik.values.shifting_capacity) {
//         setLockedField('amount');
//       }
//     }
//   }, [isEditMode, formik.values.shifting_bw, formik.values.shifting_capacity, lockedField]);

//   /* ---------- submit ---------- */
//   const handleSave = async (values) => {
//     setIsSubmitting(true);
//     try {
//       console.log('📋 Form Values Before Submission:', {
//         workorder_id: values.workorder_id,
//         shifting_bw: values.shifting_bw,
//         shifting_unit_cost: values.shifting_unit_cost,
//         shifting_capacity: values.shifting_capacity,
//         rate_id: values.rate_id,
//         reason_id: values.reason_id,
//         nttn_work_order_id: values.nttn_work_order_id,
//         capacity: values.capacity,
//         capacity_cost: values.capacity_cost,
//       });

//       const payload = {
//         workorder: values.workorder_id,
//         nttn_provider: values.nttn_provider,
//         modification_type: values.modification_type,
//         client_category: values.client_category,
//         client: values.client,
//         nttn_work_order_id: values.nttn_work_order_id,
//         capacity: parseFloat(values.capacity) || 0,
//         capacity_cost: parseFloat(values.capacity_cost) || 0,
//         shifting_bw: parseFloat(values.shifting_bw) || 0,
//         shifting_capacity: parseFloat(values.shifting_capacity) || 0,
//         shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
//         remarks: values.remarks || '',
//         reason_id: values.reason_id || null,
//         submission: values.submission ? format(new Date(values.submission), 'yyyy-MM-dd') : null,
//         rate_id: values.rate_id ? parseInt(values.rate_id) : null,
//       };

//       console.log('📤 Final Payload to Backend:', payload);
//       console.log('🔍 rate_id in payload:', payload.rate_id, 'Type:', typeof payload.rate_id);

//       let res;
//       if (isEditMode) {
//         console.log('✏️ Updating BW Modification ID:', values.id);
//         res = await updateBWModification(values.id, payload);
//         showToast?.('BW Modification updated!', 'success');
//       } else {
//         console.log('➕ Creating new BW Modification');
//         res = await createBWModification(payload);
//         showToast?.('BW Modification created!', 'success');
//       }

//       console.log('✅ API Response:', res);
//       onCancel();
//     } catch (e) {
//       console.error('❌ Save failed:', e);
//       showToast?.(e.response?.data?.message || e.message || 'Save failed', 'error');
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

//   const nttnOptions = Array.isArray(nttnProviders)
//     ? nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))
//     : [];

//   const modificationTypeOptions = STATIC_MODIFICATION_TYPES;

//   const clientCategoryOptions = Array.isArray(clientCategories)
//     ? clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))
//     : [];

//   const clientOptions = Array.isArray(clients)
//     ? clients.map((c) => ({ value: c.id, label: c.client_name }))
//     : [];

//   const nttnLinkOptions = Array.isArray(nttnLinkIds)
//     ? nttnLinkIds.map((id) => ({ value: id, label: id }))
//     : [];

//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
//         {/* header */}
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
//               {isEditMode ? 'Edit BW Modification' : 'BW Modification'}
//             </h1>
//             <p className="text-gray-500">
//               Fill in the details to {isEditMode ? 'update' : 'add a new'} bandwidth modification
//               record.
//             </p>
//           </div>
//         </div>

//         {/* Basic Info */}
//         <FormSection title="Basic Info">
//           <SelectField
//             name="modification_type"
//             placeholder="Modification Type *"
//             options={modificationTypeOptions}
//             onChange={(v) => formik.setFieldValue('modification_type', v)}
//             searchable
//           />
//           <SelectField
//             name="nttn_provider"
//             placeholder="NTTN Provider *"
//             options={nttnOptions}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />
//           <SelectField
//             name="client_category"
//             placeholder="Client Category *"
//             options={clientCategoryOptions}
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
//             options={clientOptions}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//         </FormSection>

//         {/* Current Details */}
//         <FormSection title="Current Details">
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//             <SelectField
//               name="nttn_work_order_id"
//               placeholder={`NTTN Link ID * ${isLoadingWorkOrders ? '(Loading...)' : ''}`}
//               options={nttnLinkOptions}
//               onChange={(v) => formik.setFieldValue('nttn_work_order_id', v)}
//               searchable
//               disabled={!formik.values.client || isLoadingWorkOrders}
//             />
//             <InputField name="capacity" label="Last Capacity" type="number" step="0.01" disabled />
//             <InputField
//               name="capacity_cost"
//               label="Current Capacity Cost"
//               type="number"
//               step="0.01"
//               disabled
//             />
//           </div>
//         </FormSection>

//         {/* New Values */}
//         <FormSection title="New Values">
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//             {currentRateType === 1 ? (
//               <>
//                 <InputField
//                   name="shifting_bw"
//                   label="New BW *"
//                   type="number"
//                   step="0.01"
//                   disabled
//                   help="Fixed rate - BW not applicable"
//                 />
//                 <InputField
//                   name="shifting_capacity"
//                   label="New Total Amount *"
//                   type="number"
//                   step="0.01"
//                   disabled={lockedField === 'bw'}
//                   onChange={(e) => {
//                     formik.handleChange(e);
//                     if (lockedField !== 'bw') {
//                       setLockedField('amount');
//                     }
//                   }}
//                   onBlur={formik.handleBlur}
//                   help="Fixed Rate (Unit Cost only)"
//                 />
//               </>
//             ) : (
//               <>
//                 <InputField
//                   name="shifting_bw"
//                   label="New BW *"
//                   type="number"
//                   step="0.01"
//                   disabled={lockedField === 'amount'}
//                   onBlur={(e) => {
//                     formik.handleBlur(e);
//                     lockedField !== 'amount' && setLockedField('bw');
//                   }}
//                 />
//                 <InputField
//                   name="shifting_capacity"
//                   label="New Total Amount *"
//                   type="number"
//                   step="0.01"
//                   disabled={lockedField === 'bw'}
//                   onChange={(e) => {
//                     formik.handleChange(e);
//                     if (lockedField !== 'bw') {
//                       setLockedField('amount');
//                     }
//                   }}
//                   onBlur={formik.handleBlur}
//                   help="Auto-calculated (BW × Unit Rate)"
//                 />
//               </>
//             )}
//             <InputField
//               name="shifting_unit_cost"
//               label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//               type="number"
//               step="0.01"
//               disabled
//             />
//           </div>
//         </FormSection>

//         {/* Additional Information */}
//         <FormSection title="Additional Information">
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="col-span-2">
//               <InputField
//                 name="remarks"
//                 label="Remarks"
//                 type="textarea"
//                 placeholder="Enter any additional remarks or notes..."
//                 rows={3}
//               />
//             </div>
//             <SelectField
//               name="reason_id"
//               placeholder={`Reason ${isLoadingReasons ? '(Loading...)' : ''}`}
//               options={reasons}
//               onChange={(v) => formik.setFieldValue('reason_id', v)}
//               searchable
//               disabled={isLoadingReasons}
//               help="Select reason for modification (optional)"
//             />
//             <DatePickerField
//               name="submission"
//               label="Submission Date"
//               placeholder="Select date"
//               field={formik.getFieldProps('submission')}
//               form={formik}
//               help="Date when modification was submitted (optional)"
//             />
//           </div>
//         </FormSection>

//         {/* Actions */}
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

// export default BWModificationForm;