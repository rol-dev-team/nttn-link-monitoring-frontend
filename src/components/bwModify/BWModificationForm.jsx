// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Plus, Minus } from 'lucide-react';
// import * as Yup from 'yup';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import DatePickerField from '../fields/DatePickerField'; // Import DatePickerField
// import { format } from 'date-fns'; // Add date-fns import

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
//   remarks: '', // NEW FIELD
//   reason_id: '', // NEW FIELD (as string since DB is varchar)
//   submission: '', // NEW FIELD
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
//   const [reasons, setReasons] = useState([]); // NEW STATE for reasons
//   const [ratesCache, setRatesCache] = useState(new Map()); // Cache for rates by NTTN ID

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isLoadingReasons, setIsLoadingReasons] = useState(false); // NEW loading state
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lockedField, setLockedField] = useState(null);
//   const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);

//   // 💡 FIX SETUP: Create ref and keep it updated synchronously
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
//   const fetchRatesForNttn = async (nttnId) => {
//     if (!nttnId || ratesCache.has(nttnId)) {
//       return ratesCache.get(nttnId) || [];
//     }

//     try {
//       console.log(`📡 Fetching rates for NTTN ID: ${nttnId}`);
//       const rates = await fetchRatesByNttn(nttnId);
//       const ratesData = rates.data || rates;

//       // Update cache
//       setRatesCache((prev) => new Map(prev).set(nttnId, ratesData));
//       return ratesData;
//     } catch (error) {
//       console.error(`❌ Error fetching rates for NTTN ${nttnId}:`, error);
//       return [];
//     }
//   };

//   // Function to fetch reasons
//   const fetchReasonsList = async () => {
//     setIsLoadingReasons(true);
//     try {
//       console.log('📡 Fetching reasons...');
//       const reasonsRes = await fetchReasons();
//       const reasonsData = reasonsRes?.data || reasonsRes || [];
      
//       // Map reasons to options format
//       const mappedReasons = Array.isArray(reasonsData) 
//         ? reasonsData.map((reason) => ({
//             value: String(reason.id), // Convert to string since DB field is varchar
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

//   // Function to find rate for specific bandwidth - update to return full rate data
//   const findRateForBandwidth = async (nttnId, bandwidth) => {
//     if (!nttnId || !bandwidth) {
//       return null;
//     }

//     try {
//       console.log(`🎯 Finding rate for NTTN: ${nttnId}, BW: ${bandwidth}`);

//       // Use the bandwidth-specific API endpoint
//       const rateResponse = await fetchRateByNttnAndBandwidth(nttnId, bandwidth);
//       const rateData = rateResponse.data || rateResponse;

//       console.log('📊 Rate data received:', rateData);

//       if (rateData && rateData.rate) {
//         console.log('💰 Rate found:', rateData.rate, 'Rate ID:', rateData.id);
//         return rateData;
//       } else {
//         console.log('❌ No rate found for bandwidth:', bandwidth);

//         // Fallback: Check cached rates
//         const cachedRates = ratesCache.get(parseInt(nttnId)) || [];
//         const matchingRate = cachedRates.find((rate) => {
//           const rangeFrom = parseFloat(rate.bw_range_from);
//           const rangeTo = parseFloat(rate.bw_range_to);
//           return bandwidth >= rangeFrom && bandwidth <= rangeTo;
//         });

//         if (matchingRate) {
//           console.log('💰 Rate found in cache:', matchingRate.rate, 'Rate ID:', matchingRate.id);
//           return matchingRate;
//         }

//         return null;
//       }
//     } catch (error) {
//       console.error('❌ Error finding rate for bandwidth:', error);

//       // Fallback to cached rates on error
//       const cachedRates = ratesCache.get(parseInt(nttnId)) || [];
//       const matchingRate = cachedRates.find((rate) => {
//         const rangeFrom = parseFloat(rate.bw_range_from);
//         const rangeTo = parseFloat(rate.bw_range_to);
//         return bandwidth >= rangeFrom && bandwidth <= rangeTo;
//       });

//       return matchingRate || null;
//     }
//   };

//   // Function to calculate unit rate and total cost using actual rates data
//   const calculateRates = (record) => {
//     const requestCapacity = parseFloat(record.request_capacity) || 0;

//     // If unit_rate is already available in the record, use it
//     if (record.unit_rate && record.rate_id) {
//       const unitRate = parseFloat(record.unit_rate);
//       const totalCost = requestCapacity * unitRate;
//       return {
//         unitRate: unitRate.toFixed(2),
//         totalCost: totalCost.toFixed(2),
//         rateId: record.rate_id,
//       };
//     }

//     // Calculate based on rates data if available
//     const nttnRates = ratesCache.get(record.nttn_id) || [];

//     if (nttnRates.length > 0 && record.nttn_id && requestCapacity > 0) {
//       // Find matching rate based on bandwidth range
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

//     // Fallback calculation
//     return {
//       unitRate: '0.00',
//       totalCost: '0.00',
//       rateId: null,
//     };
//   };

//   // Function to find rate for new bandwidth - update to return both rate and rateId
//   const findRateForNewBandwidth = async (bw) => {
//     if (!formik.values.nttn_provider || !bw) {
//       return null;
//     }

//     try {
//       console.log('🎯 Finding rate for New BW:', bw, 'NTTN:', formik.values.nttn_provider);

//       const rateData = await findRateForBandwidth(parseInt(formik.values.nttn_provider), bw);

//       if (rateData && rateData.rate) {
//         console.log('✅ Rate found:', rateData.rate, 'Rate ID:', rateData.id);
//         return {
//           rate: parseFloat(rateData.rate),
//           rateId: rateData.id,
//         };
//       } else {
//         console.log('❌ No rate found, trying fallback calculation');

//         // Final fallback: use current rate ratio if available
//         const currentCapacity = parseFloat(formik.values.capacity);
//         const currentCost = parseFloat(formik.values.capacity_cost);

//         if (currentCapacity > 0 && currentCost > 0) {
//           const currentUnitRate = currentCost / currentCapacity;
//           console.log('🔁 Using current unit rate as fallback:', currentUnitRate);
//           return {
//             rate: currentUnitRate,
//             rateId: null, // No rate ID for fallback
//           };
//         }

//         return null;
//       }
//     } catch (error) {
//       console.error('❌ Error finding rate for new bandwidth:', error);
//       return null;
//     }
//   };

//   /* ---------- data bootstrap ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttnRes, catsRes] = await Promise.all([
//           fetchNTTNs(), 
//           fetchCategories(),
//           fetchReasonsList() // Fetch reasons in parallel
//         ]);

//         // ✅ FIX: Safely extract arrays from API responses
//         const nttnData = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const catsData = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];

//         console.log('📊 API Responses:', {
//           nttn: nttnData,
//           categories: catsData,
//         });

//         setNttnProviders(nttnData);
//         setClientCategories(catsData);

//         // Use static modification types instead of API call
//         setModificationTypes(STATIC_MODIFICATION_TYPES);

//         // Don't fetch work orders initially - wait for client selection
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
//         formik.setFieldValue('nttn_work_order_id', '');
//         formik.setFieldValue('capacity', '');
//         formik.setFieldValue('capacity_cost', '');
//         formik.setFieldValue('workorder_id', '');
//         return;
//       }

//       setIsLoadingWorkOrders(true);
//       try {
//         console.log(`📡 Fetching work orders for client ID: ${clientId}`);

//         // Fetch work orders by client ID only (no work order ID)
//         const workOrdersRes = await fetchWorkOrderBeModification(null, clientId);

//         const workOrdersData = Array.isArray(workOrdersRes)
//           ? workOrdersRes
//           : workOrdersRes?.data || [];

//         console.log('📋 Work orders fetched:', workOrdersData);
//         setWorkOrders(workOrdersData);

//         // Extract unique NTTN link IDs
//         const links = [
//           ...new Set(workOrdersData.map((wo) => wo.nttn_work_order_id).filter(Boolean)),
//         ];
//         console.log('🔗 NTTN Link IDs:', links);
//         setNttnLinkIds(links);

//         // Pre-fetch rates for all unique NTTNs in the work orders
//         const uniqueNttnIds = [
//           ...new Set(workOrdersData.map((record) => record.nttn_id).filter(Boolean)),
//         ];
//         console.log('📡 Pre-fetching rates for NTTN IDs:', uniqueNttnIds);

//         await Promise.all(uniqueNttnIds.map((nttnId) => fetchRatesForNttn(nttnId)));
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
//   // useEffect(() => {
//   //   const linkId = formik.values.nttn_work_order_id;
//   //   const list = Array.isArray(workOrders) ? workOrders : [];

//   //   if (!linkId || !list.length) {
//   //     formik.setFieldValue('capacity', '');
//   //     formik.setFieldValue('capacity_cost', '');
//   //     formik.setFieldValue('workorder_id', '');
//   //     formik.setFieldValue('rate_id', '');
//   //     return;
//   //   }

//   //   const wo = list.find((w) => w.nttn_work_order_id === linkId);
//   //   if (wo) {
//   //     // Set capacity and workorder_id immediately
//   //     formik.setFieldValue('capacity', wo.request_capacity ?? 0);
//   //     formik.setFieldValue('workorder_id', wo.id);

//   //     // Calculate capacity_cost using the same logic as WorkOrderTable
//   //     const rates = calculateRates(wo);
//   //     formik.setFieldValue('capacity_cost', rates.totalCost);
//   //     formik.setFieldValue('rate_id', rates.rateId); // Set the rate_id

//   //     console.log('💰 Calculated rates for work order:', {
//   //       workOrder: wo.nttn_work_order_id,
//   //       capacity: wo.request_capacity,
//   //       unitRate: rates.unitRate,
//   //       totalCost: rates.totalCost,
//   //       rateId: rates.rateId,
//   //       nttnId: wo.nttn_id,
//   //     });
//   //   } else {
//   //     formik.setFieldValue('capacity', '');
//   //     formik.setFieldValue('capacity_cost', '');
//   //     formik.setFieldValue('workorder_id', '');
//   //     formik.setFieldValue('rate_id', '');
//   //   }
//   // }, [formik.values.nttn_work_order_id, workOrders, ratesCache]);


//   /* ---------- auto-fill current capacity & cost when link chosen ---------- */
//   useEffect(() => {
//     const linkId = formik.values.nttn_work_order_id;
//     const list = Array.isArray(workOrders) ? workOrders : [];

//     if (!linkId || !list.length) {
//       formik.setFieldValue('capacity', '');
//       formik.setFieldValue('capacity_cost', '');
//       formik.setFieldValue('workorder_id', '');
//       formik.setFieldValue('rate_id', '');
//       return;
//     }

//     const wo = list.find((w) => w.nttn_work_order_id === linkId);
//     if (wo) {
//       // Set capacity and workorder_id immediately
//       const requestCapacity = parseFloat(wo.request_capacity) || 0;
//       formik.setFieldValue('capacity', requestCapacity);
//       formik.setFieldValue('workorder_id', wo.id);

//       // Get rate_id from work order
//       const workOrderRateId = wo.rate_id;
      
//       if (workOrderRateId) {
//         // Find the matching rate from cached rates using rate_id
//         const cachedRates = ratesCache.get(parseInt(wo.nttn_id)) || [];
//         const matchingRate = cachedRates.find((rate) => rate.id === parseInt(workOrderRateId));
        
//         if (matchingRate && matchingRate.rate) {
//           const unitRate = parseFloat(matchingRate.rate);
//           const totalCost = (requestCapacity * unitRate).toFixed(2);
          
//           formik.setFieldValue('capacity_cost', totalCost);
//           formik.setFieldValue('rate_id', workOrderRateId);
          
//           console.log('💰 Calculated cost using rate_id:', {
//             workOrder: wo.nttn_work_order_id,
//             rateId: workOrderRateId,
//             requestCapacity: requestCapacity,
//             unitRate: unitRate,
//             totalCost: totalCost,
//             nttnId: wo.nttn_id,
//           });
//         } else {
//           // Fallback: Calculate using the existing calculateRates function
//           const rates = calculateRates(wo);
//           formik.setFieldValue('capacity_cost', rates.totalCost);
//           formik.setFieldValue('rate_id', rates.rateId);
          
//           console.log('⚠️ Rate not found for rate_id, using fallback calculation:', workOrderRateId);
//         }
//       } else {
//         // No rate_id in work order, use calculateRates fallback
//         const rates = calculateRates(wo);
//         formik.setFieldValue('capacity_cost', rates.totalCost);
//         formik.setFieldValue('rate_id', rates.rateId);
        
//         console.log('⚠️ No rate_id in work order, using fallback calculation');
//       }
//     } else {
//       formik.setFieldValue('capacity', '');
//       formik.setFieldValue('capacity_cost', '');
//       formik.setFieldValue('workorder_id', '');
//       formik.setFieldValue('rate_id', '');
//     }
//   }, [formik.values.nttn_work_order_id, workOrders, ratesCache]);
//   /* ---------- auto-release lock when field is cleared ---------- */
//   useEffect(() => {
//     if (lockedField === 'bw' && !formik.values.shifting_bw) setLockedField(null);
//   }, [formik.values.shifting_bw, lockedField]);

//   useEffect(() => {
//     if (lockedField === 'amount' && !formik.values.shifting_capacity) setLockedField(null);
//   }, [formik.values.shifting_capacity, lockedField]);

//   /* ---------- Calculate rates when New BW changes ---------- */
//   useEffect(() => {
//     const calculateNewRates = async () => {
//       if (lockedField === 'amount') return;

//       const bw = parseFloat(formik.values.shifting_bw);

//       if (!bw || !formik.values.nttn_provider) {
//         formik.setFieldValue('shifting_unit_cost', '');
//         formik.setFieldValue('shifting_capacity', '');
//         return;
//       }

//       setIsLoadingRates(true);
//       try {
//         console.log('🔄 Calculating rates for New BW:', bw);

//         const rateData = await findRateForNewBandwidth(bw);

//         if (rateData && rateData.rate) {
//           console.log('✅ Setting unit rate:', rateData.rate, 'Rate ID:', rateData.rateId);
//           formik.setFieldValue('shifting_unit_cost', rateData.rate);

//           // Store rate ID in formik values for later use
//           formik.setFieldValue('rate_id', rateData.rateId);

//           // Calculate total amount = New BW × Unit Rate
//           const totalAmount = (bw * rateData.rate).toFixed(2);
//           console.log('✅ Setting total amount:', totalAmount);
//           formik.setFieldValue('shifting_capacity', totalAmount);
//         } else {
//           console.log('❌ No rate found, clearing fields');
//           formik.setFieldValue('shifting_unit_cost', '');
//           formik.setFieldValue('shifting_capacity', '');
//           formik.setFieldValue('rate_id', '');
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

//     // Use a debounce to avoid too many API calls
//     const timeoutId = setTimeout(() => {
//       calculateNewRates();
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [formik.values.shifting_bw, formik.values.nttn_provider, bandwidthRanges, lockedField]);

//   // 2. BW + Unit Cost -> Amount (Keep this as fallback)
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
//         // ADD NEW FIELDS TO PAYLOAD
//         remarks: values.remarks || '',
//         reason_id: values.reason_id || null,
//         submission: values.submission ? format(new Date(values.submission), 'yyyy-MM-dd') : null,
//       };

//       let res;
//       if (isEditMode) {
//         res = await updateBWModification(values.id, payload);
//         showToast?.('BW Modification updated!', 'success');
//       } else {
//         res = await createBWModification(payload);
//         showToast?.('BW Modification created!', 'success');
//       }

//       if (values.workorder_id) {
//         try {
//           const wo = workOrders.find((w) => w.id === parseInt(values.workorder_id));
//           if (wo) {
//             const newBW = parseFloat(values.shifting_bw) || 0;
//             const newUnit = parseFloat(values.shifting_unit_cost) || unitRateFromCurrent();
//             const totalCost = (newBW * newUnit).toFixed(2);
//             const rateId = values.rate_id || null;

//             const workOrderUpdatePayload = {
//               request_capacity: newBW,
//               unit_rate: newUnit,
//               total_cost_of_request_capacity: totalCost,
//               rate_id: rateId,
//               // Add modify_status based on whether it's an upgrade or downgrade
//               modify_status: newBW > parseFloat(values.capacity) ? 'upgrade' : 'downgrade',
//             };

//             console.log('🔄 Updating work order:', workOrderUpdatePayload);

//             await updateWorkOrderLaravel(wo.id, workOrderUpdatePayload);
//             console.log('✅ Work order updated successfully with history tracking');
//           }
//         } catch (e) {
//           console.error('❌ Work-order update failed:', e);
//           showToast?.(
//             'BW Modification saved but work order update failed: ' +
//               (e.response?.data?.message || e.message),
//             'warning'
//           );
//         }
//       }

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

//   // ✅ FIX: Safe array mapping with fallbacks
//   const nttnOptions = Array.isArray(nttnProviders)
//     ? nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))
//     : [];

//   // Use static modification types directly
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
//         {/* header – identical to SurveyForm */}
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

//         {/* NEW SECTION: Additional Information */}
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
  const [currentNttnId, setCurrentNttnId] = useState(null); // Track current NTTN ID
  const [currentLinkTypeId, setCurrentLinkTypeId] = useState(null); // Track current Link Type ID
  const [currentRates, setCurrentRates] = useState([]); // Store rates for current selection

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedField, setLockedField] = useState(null);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);

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
      
      // Use fetchRatesByNttn with both nttnId and linkTypeId if available
      const rates = await fetchRatesByNttn(nttnId, linkTypeId);
      const ratesData = rates.data || rates;

      // Update cache
      setRatesCache((prev) => new Map(prev).set(cacheKey, ratesData));
      return ratesData;
    } catch (error) {
      console.error(`❌ Error fetching rates for NTTN ${nttnId}:`, error);
      return [];
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

  // Function to find rate for specific bandwidth from current rates
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

        // Pre-fetch rates for all unique NTTNs in the work orders
        const uniqueNttnIds = [
          ...new Set(workOrdersData.map((record) => record.nttn_id).filter(Boolean)),
        ];
        console.log('📡 Pre-fetching rates for NTTN IDs:', uniqueNttnIds);

        await Promise.all(uniqueNttnIds.map((nttnId) => fetchRatesForNttn(nttnId)));
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

      // Store the NTTN ID and Link Type ID (if available)
      setCurrentNttnId(wo.nttn_id);
      setCurrentLinkTypeId(wo.nttn_work_order_id || null); // Use the link ID as linkTypeId

      const workOrderRateId = wo.rate_id;
      
      if (workOrderRateId) {
        const cachedRates = ratesCache.get(parseInt(wo.nttn_id)) || [];
        const matchingRate = cachedRates.find((rate) => rate.id === parseInt(workOrderRateId));
        
        if (matchingRate && matchingRate.rate) {
          const unitRate = parseFloat(matchingRate.rate);
          const totalCost = (requestCapacity * unitRate).toFixed(2);
          
          formik.setFieldValue('capacity_cost', totalCost);
          formik.setFieldValue('rate_id', workOrderRateId);
          
          // Fetch and set current rates for this NTTN
          console.log('📡 Fetching rates with nttnId:', wo.nttn_id, 'linkTypeId:', wo.nttn_work_order_id);
          fetchRatesForNttn(wo.nttn_id, wo.nttn_work_order_id).then(rates => {
            console.log('✅ Rates fetched successfully:', rates);
            if (Array.isArray(rates) && rates.length > 0) {
              console.log('📊 Rate ranges available:');
              rates.forEach((r, i) => {
                console.log(`  [${i}] ${r.bw_range_from} - ${r.bw_range_to} = ${r.rate}`);
              });
            }
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
          });
        } else {
          const rates = calculateRates(wo);
          formik.setFieldValue('capacity_cost', rates.totalCost);
          formik.setFieldValue('rate_id', rates.rateId);
          
          fetchRatesForNttn(wo.nttn_id, wo.nttn_work_order_id).then(rates => {
            console.log('✅ Rates fetched (fallback):', rates);
            setCurrentRates(rates);
          }).catch(err => {
            console.error('❌ Failed to fetch rates (fallback):', err);
            setCurrentRates([]);
          });
          
          console.log('⚠️ Rate not found for rate_id, using fallback calculation:', workOrderRateId);
        }
      } else {
        const rates = calculateRates(wo);
        formik.setFieldValue('capacity_cost', rates.totalCost);
        formik.setFieldValue('rate_id', rates.rateId);
        
        fetchRatesForNttn(wo.nttn_id, wo.nttn_work_order_id).then(rates => {
          console.log('✅ Rates fetched (no rate_id):', rates);
          setCurrentRates(rates);
        }).catch(err => {
          console.error('❌ Failed to fetch rates (no rate_id):', err);
          setCurrentRates([]);
        });
        
        console.log('⚠️ No rate_id in work order, using fallback calculation');
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

  /* ---------- Calculate rates when New BW changes ---------- */
  useEffect(() => {
    const calculateNewRates = async () => {
      if (lockedField === 'amount') return;

      const bw = parseFloat(formik.values.shifting_bw);

      if (!bw || !currentNttnId) {
        console.log('❌ Missing BW or currentNttnId for calculation');
        formik.setFieldValue('shifting_unit_cost', '');
        formik.setFieldValue('shifting_capacity', '');
        return;
      }

      setIsLoadingRates(true);
      try {
        console.log('🔄 Calculating rates for New BW:', bw, 'currentNttnId:', currentNttnId, 'currentLinkTypeId:', currentLinkTypeId);

        // Use currentRates if available, otherwise fetch
        let rates = currentRates;
        if (!rates || rates.length === 0) {
          console.log('📡 Current rates empty, fetching from API...');
          rates = await fetchRatesForNttn(currentNttnId, currentLinkTypeId);
          setCurrentRates(rates);
          console.log('✅ Fetched rates:', rates);
        } else {
          console.log('✅ Using cached currentRates:', rates);
        }

        // Log available rates for debugging
        if (Array.isArray(rates) && rates.length > 0) {
          console.log('📊 Available rate ranges:');
          rates.forEach((r, i) => {
            console.log(`  [${i}] Range: ${r.bw_range_from} - ${r.bw_range_to}, Rate: ${r.rate}`);
          });
        }

        const rateData = findRateForBandwidth(bw, rates);

        if (rateData && rateData.rate) {
            console.log('✅ Setting unit rate:', rateData.rate, 'Rate ID:', rateData.rateId);
            formik.setFieldValue('shifting_unit_cost', rateData.rate.toFixed(2));
            
            // ✅ CRITICAL: Ensure rate_id is set as a number, not string
            if (rateData.rateId) {
              const rateIdValue = typeof rateData.rateId === 'string' 
                ? parseInt(rateData.rateId) 
                : rateData.rateId;
              
              console.log('🔑 Setting rate_id:', rateIdValue, 'Type:', typeof rateIdValue);
              formik.setFieldValue('rate_id', rateIdValue);
            }

            const totalAmount = (bw * rateData.rate).toFixed(2);
            console.log('✅ Setting total amount:', totalAmount);
            formik.setFieldValue('shifting_capacity', totalAmount);
            
            // ✅ Verify after setting
            console.log('✔️ Formik rate_id after setting:', formik.values.rate_id);
          } else {
            console.log('❌ No rate found for BW:', bw, 'trying fallback calculation');
            
            // Fallback: Use current unit rate if available
            const currentUnitRate = unitRateFromCurrent();
            if (currentUnitRate > 0) {
              console.log('🔁 Using fallback unit rate from current:', currentUnitRate);
              formik.setFieldValue('shifting_unit_cost', currentUnitRate.toFixed(2));
              const totalAmount = (bw * currentUnitRate).toFixed(2);
              formik.setFieldValue('shifting_capacity', totalAmount);
              
              // ✅ Clear rate_id for fallback (no rate_id available)
              console.log('🔑 Clearing rate_id (using fallback)');
              formik.setFieldValue('rate_id', null);
            } else {
              formik.setFieldValue('shifting_unit_cost', '');
              formik.setFieldValue('shifting_capacity', '');
              formik.setFieldValue('rate_id', null);
            }
          }
      } catch (error) {
        console.error('❌ Error calculating new rates:', error);
        formik.setFieldValue('shifting_unit_cost', '');
        formik.setFieldValue('shifting_capacity', '');
        formik.setFieldValue('rate_id', '');
      } finally {
        setIsLoadingRates(false);
      }
    };

    const timeoutId = setTimeout(() => {
      calculateNewRates();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formik.values.shifting_bw, currentNttnId, currentLinkTypeId, currentRates, lockedField, formik]);

  // 2. BW + Unit Cost -> Amount (Fallback)
  useEffect(() => {
    if (lockedField === 'amount') return;
    const bw = parseFloat(formik.values.shifting_bw);
    const rate = parseFloat(formik.values.shifting_unit_cost);
    if (isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
      formik.setFieldValue('shifting_capacity', (bw * rate).toFixed(2));
    } else if (lockedField !== 'amount') {
      formik.setFieldValue('shifting_capacity', '');
    }
  }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField]);

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

    if (isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
      const calculatedBW = (amount / rate).toFixed(2);
      if (formik.values.shifting_bw !== calculatedBW) {
        formik.setFieldValue('shifting_bw', calculatedBW);
      }

      const rateStr = rate.toFixed(2);
      if (formik.values.shifting_unit_cost !== rateStr) {
        formik.setFieldValue('shifting_unit_cost', rateStr);
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
  }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost]);

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
 // In BWModificationForm.jsx - Update handleSave to debug and properly send rate_id

  const handleSave = async (values) => {
    setIsSubmitting(true);
    try {
      // ✅ Debug: Log all values before submitting
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
        formik_rate_id: formik.values.rate_id,
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
        rate_id: values.rate_id ? parseInt(values.rate_id) : null, // ✅ Ensure it's properly converted
      };

      // ✅ Debug: Log payload before API call
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
              {isEditMode ? 'Edit Capacity Shift' : 'BW Modification'}
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
            />
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