


// // src/components/shiftCapacity/ShiftCapacityForm.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { ArrowLeft } from 'lucide-react';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchSBUs } from '../../services/sbu';
// import { fetchCategoriesBySBU } from '../../services/client';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise, fetchClientsByNttn } from '../../services/client';
// import { fetchWorkOrders } from '../../services/workOrder';
// import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

// import {
//   getRateBetweenBandwidthRange,
//   getWorkOrderCategoryAndClientWise,
//   createCapacityShifting,
// } from '../../services/capacityShiftingApi';
// import { getRatesBetweenShiftingBandwidth, getRatesByNttn } from '../../services/bwRateApi';
// import { fetchLinkTypes } from '../../services/linkType';
// import DatePickerField from '../fields/DatePickerField';
// import { fetchReasons } from '../../services/reason';

// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   sbu: '',
//   nttn_provider: '',
//   link_type: '',
//   client_category: '',
//   client: '',
//   nttn_link_id: '',
//   capacity: '',
//   capacity_cost: '',
//   // NEW: upper section BW shift input (displayed after After Shifting Capacity in info panel)
//   upper_shifting_bw: '',
//   // shifting_amount_display is purely derived: upper_shifting_bw * unit_rate_from_work_order
//   shifting_amount_display: '',
//   // ---- Shifting Target row fields ----
//   shifting_bw: '',           // = shifting_amount_display / unit_rate (reverse calc after work order select)
//   shifting_capacity: '',     // = shifting_bw * unit_rate (Shifting Amount)
//   after_shifting_capacity: '',
//   shifting_client_category: '',
//   shifting_client: '',
//   shifting_unit_cost: '',
//   total_shifting_cost: '',
//   shifting_unit_price_dropdown: '',
//   submission_date: '',
//   reason_id: '',
//   remarks: '',
//   target_request_capacity: '',
//   target_total_bw: '',
// };

// const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [sbus, setSbus] = useState([]);
//   const [isLoadingSbus, setIsLoadingSbus] = useState(false);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [linkTypeOptions, setLinkTypeOptions] = useState([]);
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
//   const [printLinkTypeName, setPrintLinkTypeName] = useState('');
//   const [reasonsOptions, setReasonsOptions] = useState([]);
//   const [shiftingBandwidthRateRanges, setShiftingBandwidthRateRanges] = useState([]);
//   const [afterShiftingUnitRate, setAfterShiftingUnitRate] = useState(0);
//   // Stores link_type_id from the SOURCE work order (nttn_link_id selection) — used for After Shifting rate API
//   const [sourceLinkTypeId, setSourceLinkTypeId] = useState(null);

//   const [currentRateType, setCurrentRateType] = useState(null);
//   const [shiftingRateData, setShiftingRateData] = useState(null);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const lastEdited = useRef(null);

//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: shiftCapacitySchema,
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       await handleSave(values, resetForm);
//     },
//   });

//   /* ---------- Boot: load static data ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttn, cats, linkTypesRes, reasonsRes, sbusRes] = await Promise.all([
//           fetchNTTNs(),
//           fetchCategories(),
//           fetchLinkTypes(),
//           fetchReasons(),
//           fetchSBUs(),
//         ]);
//         setNttnProviders(nttn.data);
//         setClientCategories(cats.data);
//         setLinkTypeOptions(linkTypesRes.data);
//         setReasonsOptions(reasonsRes.data);
//         const sbusData = sbusRes?.data || sbusRes || [];
//         setSbus(sbusData.map((s) => ({ value: s.id, label: s.name || s.sbu_name })));
//       } catch (e) {
//         showToast?.(e.message || 'Failed to load form data', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- SBU → categories ---------- */
//   useEffect(() => {
//     if (!formik.values.sbu) {
//       setFilteredCategories([]);
//       setClients([]);
//       formik.setFieldValue('client_category', '');
//       formik.setFieldValue('client', '');
//       return;
//     }
//     setIsLoadingCategories(true);
//     fetchCategoriesBySBU(formik.values.sbu)
//       .then((res) => setFilteredCategories(res?.data || res || []))
//       .catch(() => setFilteredCategories([]))
//       .finally(() => setIsLoadingCategories(false));
//   }, [formik.values.sbu]);

//   /* ---------- NTTN + LinkType → NTTN rate options ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_provider || !formik.values.link_type) return;
//     getRatesByNttn({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//     })
//       .then((res) => setNttnRatesOptions(res.data))
//       .catch((err) => console.log(err));
//   }, [formik.values.nttn_provider, formik.values.link_type]);

//   /* ---------- shifting_bw auto-rate (only when NO work-order link selected & NO manual dropdown) ---------- */
//   useEffect(() => {
//     if (formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return; // work order controls rate when link is selected

//     if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw) return;

//     getRatesBetweenShiftingBandwidth({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//       bandwidth: parseFloat(formik.values.shifting_bw),
//     })
//       .then((res) => {
//         formik.setFieldValue('shifting_unit_cost', '');
//         setShiftingBandwidthRateRanges(res?.data);
//         if (res?.data) {
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;
//           setCurrentRateType(rateTypeValue);
//           setShiftingRateData(res?.data);
//           const unitRate = parseFloat(res?.data?.rate) || 0;
//           formik.setFieldValue('shifting_unit_cost', unitRate);

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else if (rateTypeValue === 2) {
//             const bw = parseFloat(formik.values.shifting_bw);
//             formik.setFieldValue('shifting_capacity', (bw * unitRate).toFixed(2));
//           }
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         setCurrentRateType(null);
//         setShiftingRateData(null);
//       });
//   }, [
//     formik.values.shifting_bw,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     formik.values.shifting_unit_price_dropdown,
//     formik.values.shifting_link_id,
//   ]);

//   /* ---------- Source: clients ---------- */
//   useEffect(() => {
//     if (!formik.values.client_category || !formik.values.nttn_provider) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     Promise.all([
//       fetchClientsCategoryWise(formik.values.client_category),
//       fetchClientsByNttn(formik.values.nttn_provider),
//     ])
//       .then(([catRes, nttnRes]) => {
//         const catClients = Array.isArray(catRes) ? catRes : catRes?.data || [];
//         const nttnClients = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const nttnClientIds = new Set(nttnClients.map((c) => c.id));
//         const filtered = catClients.filter((c) => nttnClientIds.has(c.id));
//         setClients(filtered.length > 0 ? filtered : catClients);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category, formik.values.nttn_provider]);

//   /* ---------- Shifting Target: clients ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue('shifting_client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then((res) => setShiftingClients(res.data))
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   /* ---------- Source: work orders by client + category ---------- */
//   useEffect(() => {
//     const { client, client_category } = formik.values;
//     if (!client || !client_category) return;

//     setNttnLinkIds([]);
//     setWorkOrderDetailsData([]);
//     formik.setFieldValue('nttn_link_id', '');

//     const fetchData = async () => {
//       try {
//         const { data } = await getWorkOrderCategoryAndClientWise({ cat_id: client_category, client_id: client });
//         setNttnLinkIds(data);
//         setWorkOrderDetailsData(data);
//       } catch (error) {
//         console.error('API call failed:', error);
//       }
//     };
//     fetchData();
//   }, [formik.values.client, formik.values.client_category]);

//   /* ---------- Source: nttn_link_id selected ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_link_id) return;
//     const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
//     if (filtered) {
//       const totalCapacityCost = filtered.rate * filtered.request_capacity;
//       setShiftingSourceRates(filtered.rate);
//       setPrintLinkTypeName(filtered.type_name);
//       // Store the source work order's link_type_id for After Shifting rate lookup
//       setSourceLinkTypeId(filtered.link_type_id || filtered.link_type || null);
//       console.log('📌 Source link_type_id stored:', filtered.link_type_id || filtered.link_type);
//       formik.setFieldValue('capacity', filtered.request_capacity);
//       formik.setFieldValue('capacity_cost', parseFloat(totalCapacityCost).toFixed(2) || 0);
//     }
//   }, [formik.values.nttn_link_id, workOrderDetailsData]);

//   /* ---------- Shifting Target: work orders ---------- */
//   useEffect(() => {
//     const { shifting_client, shifting_client_category } = formik.values;
//     if (!shifting_client || !shifting_client_category) return;

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

//   /* ==========================================================================
//    * When Shifting Work Order Link ID is selected:
//    *   1. Fetch unit rate based on upper_shifting_bw → set shifting_unit_cost ONLY
//    *   2. shifting_amount_display (upper panel) is LOCKED — calculated from
//    *      upper_shifting_bw × shiftingSourceRates (Unit Price) and never overwritten here
//    *   3. shifting_capacity (lower field) always = shifting_amount_display (locked, read-only)
//    *   4. shifting_bw (lower row) = shifting_amount_display / fetched_unit_rate
//    * ========================================================================== */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     if (!filtered) return;

//     formik.setFieldValue('target_request_capacity', filtered.request_capacity || 0);
//     console.log('📊 Shifting Link Selected - request_capacity:', filtered.request_capacity);

//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;

//     // shifting_amount_display is already computed as upper_shifting_bw × shiftingSourceRates (Unit Price).
//     // We read it here and NEVER overwrite it — it is locked.
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;

//     if (upperBW > 0 && formik.values.nttn_provider && formik.values.link_type) {
//       // Fetch unit rate for upper_shifting_bw (for shifting_unit_cost & shifting_bw derivation only)
//       getRatesBetweenShiftingBandwidth({
//         nttn_id: parseInt(formik.values.nttn_provider),
//         link_type_id: parseInt(formik.values.link_type),
//         bandwidth: upperBW,
//       })
//         .then((res) => {
//           if (res?.data && res.data.rate) {
//             const unitRate = parseFloat(res.data.rate);
//             const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;
//             setCurrentRateType(rateTypeValue);

//             // Show unit cost in lower row (fetched rate)
//             formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));
//             console.log('💰 Fetched Unit Cost for lower row:', unitRate);

//             // shifting_capacity (lower) = locked shifting_amount_display — NEVER overwrite with new rate
//             if (lockedShiftingAmount > 0) {
//               formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//               console.log('📌 shifting_capacity locked to shifting_amount_display:', lockedShiftingAmount);

//               // shifting_bw = locked_amount / fetched_unit_rate
//               if (rateTypeValue === 1 || unitRate <= 0) {
//                 formik.setFieldValue('shifting_bw', upperBW);
//               } else {
//                 const derivedBW = lockedShiftingAmount / unitRate;
//                 formik.setFieldValue('shifting_bw', Math.floor(derivedBW));
//                 console.log('📌 shifting_bw = shifting_amount_display / unit_rate:', Math.floor(derivedBW));
//               }
//             }
//           }
//         })
//         .catch((err) => {
//           console.error('❌ Error fetching rate on work order link select:', err);
//           const fallbackRate = parseFloat(filtered.rate) || 0;
//           formik.setFieldValue('shifting_unit_cost', fallbackRate.toFixed(2));
//           // Still use locked amount — do NOT overwrite shifting_amount_display
//           if (lockedShiftingAmount > 0) {
//             formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//             formik.setFieldValue(
//               'shifting_bw',
//               fallbackRate > 0 ? Math.floor(lockedShiftingAmount / fallbackRate) : upperBW
//             );
//           }
//         });
//     } else {
//       // No upper_shifting_bw — just set unit cost from work order rate
//       formik.setFieldValue('shifting_unit_cost', parseFloat(filtered.rate || 0).toFixed(2));
//     }
//   }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

//   /* ---------- upper_shifting_bw changes → recalculate shifting_amount_display using UPPER Unit Price ---------- */
//   useEffect(() => {
//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
//     // Use shiftingSourceRates = the Unit Price shown in the info panel (source work order rate)
//     const upperUnitPrice = parseFloat(shiftingSourceRates) || 0;

//     if (upperBW > 0 && upperUnitPrice > 0) {
//       const shiftingAmount = upperBW * upperUnitPrice;
//       formik.setFieldValue('shifting_amount_display', shiftingAmount.toFixed(2));
//     } else {
//       formik.setFieldValue('shifting_amount_display', '');
//     }
//   }, [formik.values.upper_shifting_bw, shiftingSourceRates]);

//   /* ---------- target_total_bw = target_request_capacity + shifting_bw ---------- */
//   useEffect(() => {
//     const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

//     if (targetRequestCapacity > 0 && shiftingBW > 0) {
//       formik.setFieldValue('target_total_bw', targetRequestCapacity + shiftingBW);
//     } else {
//       formik.setFieldValue('target_total_bw', '');
//     }
//   }, [formik.values.shifting_bw, formik.values.target_request_capacity]);

//   /* ---------- When shifting_bw changes (and NO work order link active), fetch rate and recalculate ---------- */
//   useEffect(() => {
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

//     if (showShiftingDropdown || formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return; // work order link handles this

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     const shiftingRequestCapacity = filtered ? parseInt(filtered.request_capacity) || 0 : 0;

//     if (!formik.values.shifting_link_id || shiftingBW <= 0) return;

//     const totalBW = shiftingRequestCapacity + shiftingBW;

//     const fetchRateForTotalBW = async () => {
//       if (!formik.values.nttn_provider || !formik.values.link_type) return;
//       try {
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: parseInt(formik.values.link_type),
//           bandwidth: totalBW,
//         });

//         if (res?.data && res.data.rate) {
//           const unitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;
//           formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else {
//             formik.setFieldValue('shifting_capacity', (shiftingBW * unitRate).toFixed(2));
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error fetching rate for total BW:', error);
//       }
//     };

//     fetchRateForTotalBW();
//   }, [
//     formik.values.shifting_bw,
//     formik.values.shifting_link_id,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     shiftingWorkOrderDetailsData,
//     showShiftingDropdown,
//     formik.values.shifting_unit_price_dropdown,
//   ]);

//   /* ---------- Two-Way Calc: BW → Amount (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_bw, shifting_unit_price_dropdown } = formik.values;
//     if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) return;

//     formik.setFieldValue('shifting_capacity', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate) || 0;
//     const bw = parseFloat(shifting_bw);
//     if (unitRate <= 0 || bw <= 0) { formik.setFieldValue('shifting_capacity', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     const shiftingAmount = rateTypeForDropdown === 1 ? unitRate : bw * unitRate;
//     formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
//     lastEdited.current = null;
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- Two-Way Calc: Amount → BW (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;
//     if (
//       lastEdited.current === 'bw' ||
//       !shifting_unit_price_dropdown ||
//       !shifting_capacity ||
//       parseFloat(shifting_capacity) <= 0
//     ) return;

//     formik.setFieldValue('shifting_bw', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate);
//     const shiftingCost = parseFloat(shifting_capacity);
//     if (!unitRate || unitRate <= 0) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     if (rateTypeForDropdown === 1) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const calculatedBW = shiftingCost / unitRate;
//     lastEdited.current = 'capacity';
//     formik.setFieldValue('shifting_bw', Math.floor(calculatedBW), false);
//   }, [formik.values.shifting_capacity, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- After Shifting Capacity + After Shifting Unit Rate + Total Shifting Cost ----------
//    * After Shifting Capacity = Capacity - upper_shifting_bw  (e.g. 3600 - 100 = 3500)
//    * After Shifting Unit Rate = fetched via API using sourceLinkTypeId (from SOURCE work order)
//    *                            NOT from the lower 'link_type' dropdown
//    * After Shifting Cost      = After Shifting Capacity × After Shifting Unit Rate
//    * ------------------------------------------------------------------------------------- */
//   useEffect(() => {
//     const capacity = parseInt(formik.values.capacity) || 0;
//     const upperBW = parseInt(formik.values.upper_shifting_bw) || 0;
//     const afterShiftingCapacity = capacity - upperBW;

//     formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity > 0 ? afterShiftingCapacity : 0, false);

//     const fetchAfterShiftingRate = async () => {
//       // Use sourceLinkTypeId (from source work order) — NOT the lower link_type dropdown
//       const linkTypeToUse = sourceLinkTypeId || parseInt(formik.values.link_type) || null;
//       if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !linkTypeToUse) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//         return;
//       }
//       try {
//         console.log('🔍 After Shifting Rate fetch — bandwidth:', afterShiftingCapacity, '| link_type_id:', linkTypeToUse, '(source work order)');
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: linkTypeToUse,
//           bandwidth: afterShiftingCapacity,
//         });

//         if (res?.data && res.data.rate) {
//           const fetchedUnitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

//           setAfterShiftingUnitRate(fetchedUnitRate);
//           console.log('💰 After Shifting Unit Rate:', fetchedUnitRate, '| Capacity:', afterShiftingCapacity);

//           const totalShiftingCost =
//             rateTypeValue === 1 ? fetchedUnitRate : afterShiftingCapacity * fetchedUnitRate;
//           formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
//           console.log('📌 After Shifting Cost:', totalShiftingCost);
//         } else {
//           formik.setFieldValue('total_shifting_cost', '0.00', false);
//           setAfterShiftingUnitRate(0);
//         }
//       } catch (error) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//       }
//     };

//     fetchAfterShiftingRate();
//   }, [
//     formik.values.capacity,
//     formik.values.upper_shifting_bw,
//     formik.values.nttn_provider,
//     sourceLinkTypeId,
//     formik.values.link_type,   // fallback dependency
//   ]);

//   /* ---------- Submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const {
//         shifting_unit_price_dropdown,
//         target_request_capacity,
//         upper_shifting_bw,
//         shifting_amount_display,
//         ...payload
//       } = values;

//       console.log('📤 Payload to Backend:', {
//         ...payload,
//         shifting_bw: parseFloat(payload.shifting_bw) || 0,
//         target_total_bw: parseFloat(payload.target_total_bw) || 0,
//         link_type: parseInt(payload.link_type) || null,
//       });

//       const res = await createCapacityShifting(payload);
//       showToast?.(res.message, 'success');
//       resetForm();
//       onCancel();
//     } catch (e) {
//       showToast?.(e.message || 'Save failed', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ---------- Render ---------- */
//   if (isLoading) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
//         <span className="text-gray-500">Loading form data...</span>
//       </div>
//     );
//   }

//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
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
//             placeholder="NTTN Name *"
//             options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />

//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="sbu"
//             placeholder={`SBU * ${isLoadingSbus ? '(Loading...)' : ''}`}
//             options={sbus}
//             onChange={(v) => {
//               formik.setFieldValue('sbu', v);
//               formik.setFieldValue('client_category', '');
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={isLoadingSbus}
//           />

//           <SelectField
//             name="client_category"
//             placeholder={`Client Category * ${isLoadingCategories ? '(Loading...)' : ''}`}
//             options={filteredCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//             onChange={(v) => {
//               formik.setFieldValue('client_category', v);
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={!formik.values.sbu || isLoadingCategories}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="nttn_link_id"
//             placeholder="Work Order Link ID *"
//             options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_work_order_id }))}
//             onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>


//         {/* ── NEW: Shifting BW input + Shifting Amount display (below the info row) ── */}
//           <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
//             {/* Shifting BW input (upper panel) */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Shifting BW (MB)
//               </label>
//               <input
//                 type="number"
//                 step="1"
//                 min="0"
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter BW to shift"
//                 value={formik.values.upper_shifting_bw}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   formik.setFieldValue('upper_shifting_bw', val);
//                 }}
//               />
//             </div>

//             {/* Shifting Amount display = upper_shifting_bw × unit_rate */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Shifting Amount (BW × Unit Rate)
//               </label>
//               <input
//                 type="text"
//                 readOnly
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={formik.values.shifting_amount_display || ''}
//               />
//               {formik.values.upper_shifting_bw && shiftingSourceRates ? (
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {formik.values.upper_shifting_bw} &times; {shiftingSourceRates} (Unit Price) ={' '}
//                   {formik.values.shifting_amount_display}
//                 </p>
//               ) : formik.values.upper_shifting_bw && !shiftingSourceRates ? (
//                 <p className="text-xs text-orange-400 mt-0.5">Select a Work Order Link ID first to get Unit Price</p>
//               ) : null}
//             </div>

//             {/* Spacer columns */}
//             <div />
//             <div />
//           </div>

//         {/* ── Info Panel ── */}
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
//           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 justify-items-center items-start gap-4 text-sm">

//             {/* Capacity Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{' '}
//                 {formik.values.capacity_cost || '0.00'}
//               </p>
//             </div>


            

//             {/* Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{' '}
//                 {formik.values.capacity || 'N/A'}
//               </p>
//             </div>

//             {/* Unit Price */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Unit Price:</strong>{' '}
//                 {shiftingSourceRates || '0.00'}
//               </p>
//             </div>



//             {/* Link Type */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Link Type:</strong>{' '}
//                 {printLinkTypeName || 'N/A'}
//               </p>
//             </div>

            

//             {/* After Shifting Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Cost:</strong>{' '}
//                 {formik.values.total_shifting_cost || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Capacity:</strong>{' '}
//                 {formik.values.after_shifting_capacity || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Unit Rate — fetched from API based on After Shifting Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Unit Rate:</strong>{' '}
//                 {afterShiftingUnitRate ? afterShiftingUnitRate.toFixed(2) : 'N/A'}
//               </p>
//             </div>
//           </div>

          
//         </div>

//         {/* Shifting Target */}
//         <FormSection title="Shifting Target">
//           {/* Row 1: Link Type / Shifting Client Category / Name / Work Order Link ID */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
//             <SelectField
//               name="link_type"
//               placeholder="Link Type *"
//               options={linkTypeOptions.map((p) => ({ value: p.id, label: p.type_name }))}
//               onChange={(v) => formik.setFieldValue('link_type', v)}
//               searchable
//             />
//             <SelectField
//               name="shifting_client_category"
//               placeholder="Shifting Client Category *"
//               options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client_category', v);
//                 formik.setFieldValue('shifting_client', '');
//               }}
//               searchable
//             />
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
//               onChange={(v) => formik.setFieldValue('shifting_client', v)}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Work Order Link ID"
//               options={shiftingClientLinkIds.map((nttn) => ({
//                 value: nttn.id,
//                 label: nttn.nttn_work_order_id,
//               }))}
//               onChange={(v) => {
//                 // Clear previous calculations before new selection
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 formik.setFieldValue('shifting_unit_price_dropdown', '');
//                 setShowShiftingDropdown(false);
//                 formik.setFieldValue('shifting_link_id', v);
//               }}
//               searchable
//               isClearable
//             />
//           </div>

//           {/* Row 2: Shifting BW / Shifting Amount / Unit Cost / After-Shifting Capacity */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
//             {/* Shifting BW — derived from (shifting_amount / unit_rate) after work order select */}
//             <InputField
//               name="shifting_bw"
//               label="Shifting BW *"
//               disabled={!!formik.values.shifting_bw}
//               type="number"
//               step="1"
//               onChange={(e) => {
//                 formik.handleChange(e);
//                 lastEdited.current = 'bw';
//               }}
//               help="Auto-filled from Shifting Amount ÷ Unit Rate"
//             />

//             {/* Shifting Amount (lower):
//                  - If upper_shifting_bw is filled → locked / read-only (mirrors shifting_amount_display)
//                  - If upper_shifting_bw is NOT filled → editable; user types amount, then selects rate from dropdown */}
//             <InputField
//               name="shifting_capacity"
//               label="Shifting Amount (BW × Unit Rate)"
//               type="number"
//               step="0.01"
//               disabled={!!formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 if (formik.values.upper_shifting_bw) return; // locked when upper BW filled
//                 formik.handleChange(e);
//                 lastEdited.current = 'capacity';
//                 // Show rate dropdown so user can select unit rate
//                 if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
//                   setShowShiftingDropdown(true);
//                 } else if (e.target.value.trim() === '') {
//                   setShowShiftingDropdown(false);
//                   formik.setFieldValue('shifting_unit_price_dropdown', '');
//                   formik.setFieldValue('shifting_unit_cost', '');
//                 }
//               }}
//               help={
//                 formik.values.upper_shifting_bw
//                   ? 'Locked — mirrors Shifting Amount from panel above'
//                   : 'Enter amount manually, then select unit rate from dropdown'
//               }
//             />

//             {/* Unit Cost — auto-filled from rate lookup on work order link select */}
//             {showShiftingDropdown ? (
//               <SelectField
//                 name="shifting_unit_price_dropdown"
//                 placeholder="Select Unit Price"
//                 options={nttnRatesOptions.map((r) => ({
//                   label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
//                   value: r.id,
//                 }))}
//                 onChange={(selectedRateId) => {
//                   formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
//                   const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
//                   if (selectedRate) {
//                     formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
//                   }
//                   lastEdited.current = 'capacity';
//                 }}
//                 searchable
//               />
//             ) : (
//               <InputField
//                 name="shifting_unit_cost"
//                 label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//                 type="number"
//                 step="0.01"
//                 disabled
//                 help="Auto-filled on Work Order Link select"
//               />
//             )}

//             {/* Hidden total_shifting_cost */}
//             <InputField
//               name="total_shifting_cost"
//               label="Total Shifting Cost"
//               type="number"
//               step="0.01"
//               className="hidden"
//               disabled
//             />

//             {/* After-Shifting Capacity */}
//             <InputField
//               name="target_total_bw"
//               label="After-Shifting Capacity"
//               type="number"
//               step="0.01"
//               disabled
//             />
//           </div>

//           {/* Row 3: Reason / Remarks / Date */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
//             <SelectField
//               name="reason_id"
//               placeholder="Shift Reason"
//               options={reasonsOptions.map((nttn) => ({ value: nttn.id, label: nttn.reason }))}
//               onChange={(v) => formik.setFieldValue('reason_id', v)}
//               searchable
//               isClearable
//             />


//             <DatePickerField
//               name="submission_date"
//               placeholder="Submission Date"
//               field={{ name: 'submission_date', value: formik.values.submission_date }}
//               form={formik}
//             />
            
//             <InputField name="remarks" label="Remarks" type="text" />
            
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

// export default ShiftCapacityForm;








// // src/components/shiftCapacity/ShiftCapacityForm.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { ArrowLeft } from 'lucide-react';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchSBUs } from '../../services/sbu';
// import { fetchCategoriesBySBU } from '../../services/client';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise, fetchClientsByNttn } from '../../services/client';
// import { fetchWorkOrders } from '../../services/workOrder';
// import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

// import {
//   getRateBetweenBandwidthRange,
//   getWorkOrderCategoryAndClientWise,
//   createCapacityShifting,
// } from '../../services/capacityShiftingApi';
// import { getRatesBetweenShiftingBandwidth, getRatesByNttn } from '../../services/bwRateApi';
// import { fetchLinkTypes } from '../../services/linkType';
// import DatePickerField from '../fields/DatePickerField';
// import { fetchReasons } from '../../services/reason';

// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   sbu: '',
//   nttn_provider: '',
//   link_type: '',
//   client_category: '',
//   client: '',
//   nttn_link_id: '',
//   capacity: '',
//   capacity_cost: '',
//   // NEW: upper section BW shift input (displayed after After Shifting Capacity in info panel)
//   upper_shifting_bw: '',
//   // shifting_amount_display is purely derived: upper_shifting_bw * unit_rate_from_work_order
//   shifting_amount_display: '',
//   // ---- Shifting Target row fields ----
//   shifting_bw: '',           // = shifting_amount_display / unit_rate (reverse calc after work order select)
//   shifting_capacity: '',     // = shifting_bw * unit_rate (Shifting Amount)
//   after_shifting_capacity: '',
//   shifting_client_category: '',
//   shifting_client: '',
//   shifting_unit_cost: '',
//   total_shifting_cost: '',
//   shifting_unit_price_dropdown: '',
//   submission_date: '',
//   reason_id: '',
//   remarks: '',
//   target_request_capacity: '',
//   target_total_bw: '',
// };

// const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [sbus, setSbus] = useState([]);
//   const [isLoadingSbus, setIsLoadingSbus] = useState(false);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [linkTypeOptions, setLinkTypeOptions] = useState([]);
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
//   const [printLinkTypeName, setPrintLinkTypeName] = useState('');
//   const [reasonsOptions, setReasonsOptions] = useState([]);
//   const [shiftingBandwidthRateRanges, setShiftingBandwidthRateRanges] = useState([]);
//   const [afterShiftingUnitRate, setAfterShiftingUnitRate] = useState(0);
//   // Stores link_type_id from the SOURCE work order (nttn_link_id selection) — used for After Shifting rate API
//   const [sourceLinkTypeId, setSourceLinkTypeId] = useState(null);

//   const [currentRateType, setCurrentRateType] = useState(null);
//   const [shiftingRateData, setShiftingRateData] = useState(null);

//   // NEW: stores the selected shifting work order's rate & request_capacity
//   const [shiftingWorkOrderRate, setShiftingWorkOrderRate] = useState(0);
//   const [shiftingWorkOrderRequestCapacity, setShiftingWorkOrderRequestCapacity] = useState(0);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const lastEdited = useRef(null);

//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: shiftCapacitySchema,
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       await handleSave(values, resetForm);
//     },
//   });

//   /* ---------- Boot: load static data ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttn, cats, linkTypesRes, reasonsRes, sbusRes] = await Promise.all([
//           fetchNTTNs(),
//           fetchCategories(),
//           fetchLinkTypes(),
//           fetchReasons(),
//           fetchSBUs(),
//         ]);
//         setNttnProviders(nttn.data);
//         setClientCategories(cats.data);
//         setLinkTypeOptions(linkTypesRes.data);
//         setReasonsOptions(reasonsRes.data);
//         const sbusData = sbusRes?.data || sbusRes || [];
//         setSbus(sbusData.map((s) => ({ value: s.id, label: s.name || s.sbu_name })));
//       } catch (e) {
//         showToast?.(e.message || 'Failed to load form data', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- SBU → categories ---------- */
//   useEffect(() => {
//     if (!formik.values.sbu) {
//       setFilteredCategories([]);
//       setClients([]);
//       formik.setFieldValue('client_category', '');
//       formik.setFieldValue('client', '');
//       return;
//     }
//     setIsLoadingCategories(true);
//     fetchCategoriesBySBU(formik.values.sbu)
//       .then((res) => setFilteredCategories(res?.data || res || []))
//       .catch(() => setFilteredCategories([]))
//       .finally(() => setIsLoadingCategories(false));
//   }, [formik.values.sbu]);

//   /* ---------- NTTN + LinkType → NTTN rate options ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_provider || !formik.values.link_type) return;
//     getRatesByNttn({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//     })
//       .then((res) => setNttnRatesOptions(res.data))
//       .catch((err) => console.log(err));
//   }, [formik.values.nttn_provider, formik.values.link_type]);

//   /* ---------- shifting_bw auto-rate (only when NO work-order link selected & NO manual dropdown) ---------- */
//   useEffect(() => {
//     if (formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return;

//     if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw) return;

//     getRatesBetweenShiftingBandwidth({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//       bandwidth: parseFloat(formik.values.shifting_bw),
//     })
//       .then((res) => {
//         formik.setFieldValue('shifting_unit_cost', '');
//         setShiftingBandwidthRateRanges(res?.data);
//         if (res?.data) {
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;
//           setCurrentRateType(rateTypeValue);
//           setShiftingRateData(res?.data);
//           const unitRate = parseFloat(res?.data?.rate) || 0;
//           formik.setFieldValue('shifting_unit_cost', unitRate);

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else if (rateTypeValue === 2) {
//             const bw = parseFloat(formik.values.shifting_bw);
//             formik.setFieldValue('shifting_capacity', (bw * unitRate).toFixed(2));
//           }
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         setCurrentRateType(null);
//         setShiftingRateData(null);
//       });
//   }, [
//     formik.values.shifting_bw,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     formik.values.shifting_unit_price_dropdown,
//     formik.values.shifting_link_id,
//   ]);

//   /* ---------- Source: clients ---------- */
//   useEffect(() => {
//     if (!formik.values.client_category || !formik.values.nttn_provider) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     Promise.all([
//       fetchClientsCategoryWise(formik.values.client_category),
//       fetchClientsByNttn(formik.values.nttn_provider),
//     ])
//       .then(([catRes, nttnRes]) => {
//         const catClients = Array.isArray(catRes) ? catRes : catRes?.data || [];
//         const nttnClients = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const nttnClientIds = new Set(nttnClients.map((c) => c.id));
//         const filtered = catClients.filter((c) => nttnClientIds.has(c.id));
//         setClients(filtered.length > 0 ? filtered : catClients);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category, formik.values.nttn_provider]);

//   /* ---------- Shifting Target: clients (filtered by cat_id) ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue('shifting_client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then((res) => setShiftingClients(Array.isArray(res) ? res : res?.data || []))
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   /* ---------- Source: work orders by client + category ---------- */
//   useEffect(() => {
//     const { client, client_category } = formik.values;
//     if (!client || !client_category) return;

//     setNttnLinkIds([]);
//     setWorkOrderDetailsData([]);
//     formik.setFieldValue('nttn_link_id', '');

//     const fetchData = async () => {
//       try {
//         const { data } = await getWorkOrderCategoryAndClientWise({ cat_id: client_category, client_id: client });
//         setNttnLinkIds(data);
//         setWorkOrderDetailsData(data);
//       } catch (error) {
//         console.error('API call failed:', error);
//       }
//     };
//     fetchData();
//   }, [formik.values.client, formik.values.client_category]);

//   /* ---------- Source: nttn_link_id selected ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_link_id) return;
//     const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
//     if (filtered) {
//       const totalCapacityCost = filtered.rate * filtered.request_capacity;
//       setShiftingSourceRates(filtered.rate);
//       setPrintLinkTypeName(filtered.type_name);
//       setSourceLinkTypeId(filtered.link_type_id || filtered.link_type || null);
//       console.log('📌 Source link_type_id stored:', filtered.link_type_id || filtered.link_type);
//       formik.setFieldValue('capacity', filtered.request_capacity);
//       formik.setFieldValue('capacity_cost', parseFloat(totalCapacityCost).toFixed(2) || 0);
//     }
//   }, [formik.values.nttn_link_id, workOrderDetailsData]);

//   /* ==========================================================================
//    * Shifting Target: fetch work orders using link_type_id (from link_type dropdown),
//    * cat_id (from shifting_client_category), client_id (from shifting_client),
//    * and nttn_id (from nttn_provider — same as source).
//    *
//    * When a work order is selected:
//    *   - "Before Shifting Capacity" = work order's request_capacity
//    *   - Unit Rate for "Shifting Amount" = work order's rate
//    * ========================================================================== */
//   useEffect(() => {
//     const { shifting_client, shifting_client_category, link_type, nttn_provider } = formik.values;
//     if (!shifting_client || !shifting_client_category) return;

//     setShiftingClientLinkIds([]);
//     setShiftingWorkOrderDetailsData([]);
//     formik.setFieldValue('shifting_link_id', '');
//     // Reset derived values when dependencies change
//     setShiftingWorkOrderRate(0);
//     setShiftingWorkOrderRequestCapacity(0);

//     const fetchShiftingData = async () => {
//       try {
//         // Pass link_type_id, cat_id, client_id, nttn_id to the API
//         const payload = {
//           cat_id: shifting_client_category,
//           client_id: shifting_client,
//         };
//         if (link_type) payload.link_type_id = parseInt(link_type);
//         if (nttn_provider) payload.nttn_id = parseInt(nttn_provider);

//         const { data } = await getWorkOrderCategoryAndClientWise(payload);
//         setShiftingClientLinkIds(data);
//         setShiftingWorkOrderDetailsData(data);
//         console.log('📋 Shifting work orders fetched:', data);
//       } catch (error) {
//         console.error('Shifting work orders fetch failed:', error);
//       }
//     };
//     fetchShiftingData();
//   }, [
//     formik.values.shifting_client,
//     formik.values.shifting_client_category,
//     formik.values.link_type,
//     formik.values.nttn_provider,
//   ]);

//   /* ==========================================================================
//    * When Shifting Work Order Link ID is selected:
//    *   1. Set "Before Shifting Capacity" = work order's request_capacity
//    *   2. Unit Rate for Shifting Amount = work order's rate
//    *   3. shifting_amount_display (upper panel) is LOCKED — upper_shifting_bw × shiftingSourceRates
//    *   4. shifting_capacity (lower field) = shifting_amount_display (locked, read-only)
//    *   5. shifting_bw = shifting_amount_display / work_order_rate
//    * ========================================================================== */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     if (!filtered) return;

//     const woRequestCapacity = parseFloat(filtered.request_capacity) || 0;
//     const woRate = parseFloat(filtered.rate) || 0;

//     // Store work order rate & request_capacity in state for display & calcs
//     setShiftingWorkOrderRate(woRate);
//     setShiftingWorkOrderRequestCapacity(woRequestCapacity);

//     formik.setFieldValue('target_request_capacity', woRequestCapacity);
//     console.log('📊 Shifting Work Order selected — request_capacity:', woRequestCapacity, '| rate:', woRate);

//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;

//     // shifting_amount_display is locked: upper_shifting_bw × shiftingSourceRates
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;

//     // Unit cost comes from the work order's own rate
//     formik.setFieldValue('shifting_unit_cost', woRate.toFixed(2));
//     console.log('💰 Shifting Unit Cost (from work order rate):', woRate);

//     // shifting_capacity = locked shifting_amount_display
//     if (lockedShiftingAmount > 0) {
//       formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//       console.log('📌 shifting_capacity locked to shifting_amount_display:', lockedShiftingAmount);

//       // shifting_bw = locked_amount / work_order_rate
//       if (woRate > 0) {
//         const derivedBW = lockedShiftingAmount / woRate;
//         formik.setFieldValue('shifting_bw', Math.floor(derivedBW));
//         console.log('📌 shifting_bw = shifting_amount_display / wo_rate:', Math.floor(derivedBW));
//       } else {
//         formik.setFieldValue('shifting_bw', upperBW);
//       }
//     } else if (upperBW > 0 && woRate > 0) {
//       // Fallback: if no locked amount yet, derive from upperBW × woRate
//       const derivedAmount = upperBW * woRate;
//       formik.setFieldValue('shifting_capacity', derivedAmount.toFixed(2));
//       formik.setFieldValue('shifting_bw', upperBW);
//     }
//   }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

//   /* ---------- upper_shifting_bw changes → recalculate shifting_amount_display using UPPER Unit Price ---------- */
//   useEffect(() => {
//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
//     const upperUnitPrice = parseFloat(shiftingSourceRates) || 0;

//     if (upperBW > 0 && upperUnitPrice > 0) {
//       const shiftingAmount = upperBW * upperUnitPrice;
//       formik.setFieldValue('shifting_amount_display', shiftingAmount.toFixed(2));
//     } else {
//       formik.setFieldValue('shifting_amount_display', '');
//     }
//   }, [formik.values.upper_shifting_bw, shiftingSourceRates]);

//   /* ---------- Recalculate shifting_capacity when shifting_amount_display updates and work order is selected ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;
//     const woRate = shiftingWorkOrderRate;

//     if (lockedShiftingAmount > 0) {
//       formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//       if (woRate > 0) {
//         formik.setFieldValue('shifting_bw', Math.floor(lockedShiftingAmount / woRate));
//       }
//     }
//   }, [formik.values.shifting_amount_display, formik.values.shifting_link_id, shiftingWorkOrderRate]);

//   /* ---------- target_total_bw = target_request_capacity + shifting_bw ---------- */
//   useEffect(() => {
//     const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

//     if (targetRequestCapacity > 0 && shiftingBW > 0) {
//       formik.setFieldValue('target_total_bw', targetRequestCapacity + shiftingBW);
//     } else {
//       formik.setFieldValue('target_total_bw', '');
//     }
//   }, [formik.values.shifting_bw, formik.values.target_request_capacity]);

//   /* ---------- When shifting_bw changes (and NO work order link active), fetch rate and recalculate ---------- */
//   useEffect(() => {
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

//     if (showShiftingDropdown || formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     const shiftingRequestCapacity = filtered ? parseInt(filtered.request_capacity) || 0 : 0;

//     if (!formik.values.shifting_link_id || shiftingBW <= 0) return;

//     const totalBW = shiftingRequestCapacity + shiftingBW;

//     const fetchRateForTotalBW = async () => {
//       if (!formik.values.nttn_provider || !formik.values.link_type) return;
//       try {
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: parseInt(formik.values.link_type),
//           bandwidth: totalBW,
//         });

//         if (res?.data && res.data.rate) {
//           const unitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;
//           formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else {
//             formik.setFieldValue('shifting_capacity', (shiftingBW * unitRate).toFixed(2));
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error fetching rate for total BW:', error);
//       }
//     };

//     fetchRateForTotalBW();
//   }, [
//     formik.values.shifting_bw,
//     formik.values.shifting_link_id,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     shiftingWorkOrderDetailsData,
//     showShiftingDropdown,
//     formik.values.shifting_unit_price_dropdown,
//   ]);

//   /* ---------- Two-Way Calc: BW → Amount (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_bw, shifting_unit_price_dropdown } = formik.values;
//     if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) return;

//     formik.setFieldValue('shifting_capacity', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate) || 0;
//     const bw = parseFloat(shifting_bw);
//     if (unitRate <= 0 || bw <= 0) { formik.setFieldValue('shifting_capacity', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     const shiftingAmount = rateTypeForDropdown === 1 ? unitRate : bw * unitRate;
//     formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
//     lastEdited.current = null;
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- Two-Way Calc: Amount → BW (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;
//     if (
//       lastEdited.current === 'bw' ||
//       !shifting_unit_price_dropdown ||
//       !shifting_capacity ||
//       parseFloat(shifting_capacity) <= 0
//     ) return;

//     formik.setFieldValue('shifting_bw', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate);
//     const shiftingCost = parseFloat(shifting_capacity);
//     if (!unitRate || unitRate <= 0) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     if (rateTypeForDropdown === 1) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const calculatedBW = shiftingCost / unitRate;
//     lastEdited.current = 'capacity';
//     formik.setFieldValue('shifting_bw', Math.floor(calculatedBW), false);
//   }, [formik.values.shifting_capacity, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- After Shifting Capacity + After Shifting Unit Rate + Total Shifting Cost ---------- */
//   useEffect(() => {
//     const capacity = parseInt(formik.values.capacity) || 0;
//     const upperBW = parseInt(formik.values.upper_shifting_bw) || 0;
//     const afterShiftingCapacity = capacity - upperBW;

//     formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity > 0 ? afterShiftingCapacity : 0, false);

//     const fetchAfterShiftingRate = async () => {
//       const linkTypeToUse = sourceLinkTypeId || parseInt(formik.values.link_type) || null;
//       if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !linkTypeToUse) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//         return;
//       }
//       try {
//         console.log('🔍 After Shifting Rate fetch — bandwidth:', afterShiftingCapacity, '| link_type_id:', linkTypeToUse);
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: linkTypeToUse,
//           bandwidth: afterShiftingCapacity,
//         });

//         if (res?.data && res.data.rate) {
//           const fetchedUnitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

//           setAfterShiftingUnitRate(fetchedUnitRate);

//           const totalShiftingCost =
//             rateTypeValue === 1 ? fetchedUnitRate : afterShiftingCapacity * fetchedUnitRate;
//           formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
//         } else {
//           formik.setFieldValue('total_shifting_cost', '0.00', false);
//           setAfterShiftingUnitRate(0);
//         }
//       } catch (error) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//       }
//     };

//     fetchAfterShiftingRate();
//   }, [
//     formik.values.capacity,
//     formik.values.upper_shifting_bw,
//     formik.values.nttn_provider,
//     sourceLinkTypeId,
//     formik.values.link_type,
//   ]);

//   /* ---------- Submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const {
//         shifting_unit_price_dropdown,
//         target_request_capacity,
//         upper_shifting_bw,
//         shifting_amount_display,
//         ...payload
//       } = values;

//       console.log('📤 Payload to Backend:', {
//         ...payload,
//         shifting_bw: parseFloat(payload.shifting_bw) || 0,
//         target_total_bw: parseFloat(payload.target_total_bw) || 0,
//         link_type: parseInt(payload.link_type) || null,
//       });

//       const res = await createCapacityShifting(payload);
//       showToast?.(res.message, 'success');
//       resetForm();
//       onCancel();
//     } catch (e) {
//       showToast?.(e.message || 'Save failed', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ---------- Render ---------- */
//   if (isLoading) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
//         <span className="text-gray-500">Loading form data...</span>
//       </div>
//     );
//   }

//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
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
//             placeholder="NTTN Name *"
//             options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />

//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="sbu"
//             placeholder={`SBU * ${isLoadingSbus ? '(Loading...)' : ''}`}
//             options={sbus}
//             onChange={(v) => {
//               formik.setFieldValue('sbu', v);
//               formik.setFieldValue('client_category', '');
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={isLoadingSbus}
//           />

//           <SelectField
//             name="client_category"
//             placeholder={`Client Category * ${isLoadingCategories ? '(Loading...)' : ''}`}
//             options={filteredCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//             onChange={(v) => {
//               formik.setFieldValue('client_category', v);
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={!formik.values.sbu || isLoadingCategories}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="nttn_link_id"
//             placeholder="Work Order Link ID *"
//             options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_work_order_id }))}
//             onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>

//         {/* ── Shifting BW input + Shifting Amount display ── */}
//         <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
//           {/* Shifting BW input (upper panel) */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">
//               Shifting BW (MB)
//             </label>
//             <input
//               type="number"
//               step="1"
//               min="0"
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter BW to shift"
//               value={formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 formik.setFieldValue('upper_shifting_bw', val);
//               }}
//             />
//           </div>

//           {/* Shifting Amount display = upper_shifting_bw × unit_rate */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">
//               Shifting Amount (BW × Unit Rate)
//             </label>
//             <input
//               type="text"
//               readOnly
//               className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//               placeholder="Auto-calculated"
//               value={formik.values.shifting_amount_display || ''}
//             />
//             {formik.values.upper_shifting_bw && shiftingSourceRates ? (
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {formik.values.upper_shifting_bw} &times; {shiftingSourceRates} (Unit Price) ={' '}
//                 {formik.values.shifting_amount_display}
//               </p>
//             ) : formik.values.upper_shifting_bw && !shiftingSourceRates ? (
//               <p className="text-xs text-orange-400 mt-0.5">Select a Work Order Link ID first to get Unit Price</p>
//             ) : null}
//           </div>

//           {/* Spacer columns */}
//           <div />
//           <div />
//         </div>

//         {/* ── Info Panel ── */}
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
//           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 justify-items-center items-start gap-4 text-sm">

//             {/* Capacity Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{' '}
//                 {formik.values.capacity_cost || '0.00'}
//               </p>
//             </div>

//             {/* Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{' '}
//                 {formik.values.capacity || 'N/A'}
//               </p>
//             </div>

//             {/* Unit Price */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Unit Price:</strong>{' '}
//                 {shiftingSourceRates || '0.00'}
//               </p>
//             </div>

//             {/* Link Type */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Link Type:</strong>{' '}
//                 {printLinkTypeName || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Cost:</strong>{' '}
//                 {formik.values.total_shifting_cost || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Capacity:</strong>{' '}
//                 {formik.values.after_shifting_capacity || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Unit Rate */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Unit Rate:</strong>{' '}
//                 {afterShiftingUnitRate ? afterShiftingUnitRate.toFixed(2) : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Shifting Target */}
//         <FormSection title="Shifting Target">
//           {/* Row 1: Link Type / Shifting Client Category / Name / Work Order Link ID */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
//             {/*
//               Link Type — provides link_type_id for the shifting work order fetch.
//               When changed, clear downstream shifting selections.
//             */}
//             <SelectField
//               name="link_type"
//               placeholder="Link Type *"
//               options={linkTypeOptions.map((p) => ({ value: p.id, label: p.type_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('link_type', v);
//                 // Clear shifting work order and derived values since link_type_id changed
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingClientLinkIds([]);
//                 setShiftingWorkOrderDetailsData([]);
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//             />

//             {/*
//               Shifting Client Category — provides cat_id for the shifting work order fetch.
//             */}
//             <SelectField
//               name="shifting_client_category"
//               placeholder="Shifting Client Category *"
//               options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client_category', v);
//                 formik.setFieldValue('shifting_client', '');
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//             />

//             {/*
//               Shifting Client Name — provides client_id for the shifting work order fetch.
//               Work orders are fetched once both shifting_client and shifting_client_category are set,
//               using also link_type_id (link_type) and nttn_id (nttn_provider) from source.
//             */}
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client', v);
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />

//             {/*
//               Shifting Work Order Link ID — fetched using:
//                 link_type_id = formik.values.link_type
//                 cat_id       = formik.values.shifting_client_category
//                 client_id    = formik.values.shifting_client
//                 nttn_id      = formik.values.nttn_provider  (same as source)
//               On selection, sets:
//                 - Before Shifting Capacity (request_capacity)
//                 - Unit Rate for Shifting Amount (rate)
//             */}
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Work Order Link ID"
//               options={shiftingClientLinkIds.map((nttn) => ({
//                 value: nttn.id,
//                 label: nttn.nttn_work_order_id,
//               }))}
//               onChange={(v) => {
//                 // Clear previous calculations before new selection
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 formik.setFieldValue('shifting_unit_price_dropdown', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//                 setShowShiftingDropdown(false);
//                 formik.setFieldValue('shifting_link_id', v);
//               }}
//               searchable
//               isClearable
//               disabled={!formik.values.shifting_client}
//             />
//           </div>

//           {/* Row 2: Before Shifting Capacity / Before Shifting Amount / Shifting BW / Shifting Amount / Unit Cost / After-Shifting Capacity / After Shifting Amount */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-7 gap-x-6 gap-y-4">
//             {/* Before Shifting Capacity = request_capacity from the selected shifting work order */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Before Shifting Capacity
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-filled on Work Order select"
//                 value={shiftingWorkOrderRequestCapacity || ''}
//               />
//               <p className="text-xs text-gray-400 mt-0.5">Work order's request_capacity</p>
//             </div>

//             {/* Before Shifting Amount = request_capacity × rate */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Before Shifting Amount
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={
//                   shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate
//                     ? (shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)
//                     : ''
//                 }
//               />
//               {shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate ? (
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {shiftingWorkOrderRequestCapacity} &times; {shiftingWorkOrderRate} ={' '}
//                   {(shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)}
//                 </p>
//               ) : (
//                 <p className="text-xs text-gray-400 mt-0.5">request_capacity × rate</p>
//               )}
//             </div>

//             {/* Shifting BW — derived from (shifting_amount / work_order_rate) */}
//             <InputField
//               name="shifting_bw"
//               label="Shifting BW *"
//               disabled={!!formik.values.shifting_bw}
//               type="number"
//               step="1"
//               onChange={(e) => {
//                 formik.handleChange(e);
//                 lastEdited.current = 'bw';
//               }}
//               help="Auto-filled: Shifting Amount ÷ Unit Rate"
//             />

//             {/*
//               Shifting Amount (lower):
//                - If upper_shifting_bw is filled → locked / read-only (mirrors shifting_amount_display)
//                - Unit Rate used = work order's rate (shiftingWorkOrderRate)
//                - If upper_shifting_bw is NOT filled → editable; user types, then selects rate from dropdown
//             */}
//             <InputField
//               name="shifting_capacity"
//               label={`Shifting Amount (BW × ${shiftingWorkOrderRate ? shiftingWorkOrderRate : 'Unit Rate'})`}
//               type="number"
//               step="0.01"
//               disabled={!!formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 if (formik.values.upper_shifting_bw) return;
//                 formik.handleChange(e);
//                 lastEdited.current = 'capacity';
//                 if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
//                   setShowShiftingDropdown(true);
//                 } else if (e.target.value.trim() === '') {
//                   setShowShiftingDropdown(false);
//                   formik.setFieldValue('shifting_unit_price_dropdown', '');
//                   formik.setFieldValue('shifting_unit_cost', '');
//                 }
//               }}
//               help={
//                 formik.values.upper_shifting_bw
//                   ? `Locked — mirrors Shifting Amount (Unit Rate: ${shiftingWorkOrderRate || 'from work order'})`
//                   : 'Enter amount manually, then select unit rate from dropdown'
//               }
//             />

//             {/* Unit Cost — auto-filled from work order rate on work order link select */}
//             {showShiftingDropdown ? (
//               <SelectField
//                 name="shifting_unit_price_dropdown"
//                 placeholder="Select Unit Price"
//                 options={nttnRatesOptions.map((r) => ({
//                   label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
//                   value: r.id,
//                 }))}
//                 onChange={(selectedRateId) => {
//                   formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
//                   const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
//                   if (selectedRate) {
//                     formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
//                   }
//                   lastEdited.current = 'capacity';
//                 }}
//                 searchable
//               />
//             ) : (
//               <InputField
//                 name="shifting_unit_cost"
//                 label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//                 type="number"
//                 step="0.01"
//                 disabled
//                 help="Auto-filled from Work Order rate"
//               />
//             )}

//             {/* Hidden total_shifting_cost */}
//             <InputField
//               name="total_shifting_cost"
//               label="Total Shifting Cost"
//               type="number"
//               step="0.01"
//               className="hidden"
//               disabled
//             />

//             {/* After-Shifting Capacity = Before Shifting Capacity + Shifting BW */}
//             <InputField
//               name="target_total_bw"
//               label="After-Shifting Capacity"
//               type="number"
//               step="0.01"
//               disabled
//               help="Before Shifting Capacity + Shifting BW"
//             />

//             {/* After Shifting Amount = rate × After Shifting Capacity */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 After Shifting Amount
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={
//                   shiftingWorkOrderRate && formik.values.target_total_bw
//                     ? (shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)
//                     : ''
//                 }
//               />
//               {shiftingWorkOrderRate && formik.values.target_total_bw ? (
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {shiftingWorkOrderRate} &times; {formik.values.target_total_bw} ={' '}
//                   {(shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)}
//                 </p>
//               ) : (
//                 <p className="text-xs text-gray-400 mt-0.5">rate × After Shifting Capacity</p>
//               )}
//             </div>
//           </div>

//           {/* Row 3: Reason / Date / Remarks */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
//             <SelectField
//               name="reason_id"
//               placeholder="Shift Reason"
//               options={reasonsOptions.map((nttn) => ({ value: nttn.id, label: nttn.reason }))}
//               onChange={(v) => formik.setFieldValue('reason_id', v)}
//               searchable
//               isClearable
//             />

//             <DatePickerField
//               name="submission_date"
//               placeholder="Submission Date"
//               field={{ name: 'submission_date', value: formik.values.submission_date }}
//               form={formik}
//             />

//             <InputField name="remarks" label="Remarks" type="text" />
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

// export default ShiftCapacityForm;









// // src/components/shiftCapacity/ShiftCapacityForm.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { ArrowLeft } from 'lucide-react';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchSBUs } from '../../services/sbu';
// import { fetchCategoriesBySBU } from '../../services/client';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise, fetchClientsByNttn } from '../../services/client';
// import { fetchWorkOrders } from '../../services/workOrder';
// import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

// import {
//   getRateBetweenBandwidthRange,
//   getWorkOrderCategoryAndClientWise,
//   createCapacityShifting,
// } from '../../services/capacityShiftingApi';
// import { getRatesBetweenShiftingBandwidth, getRatesByNttn } from '../../services/bwRateApi';
// import { fetchLinkTypes } from '../../services/linkType';
// import DatePickerField from '../fields/DatePickerField';
// import { fetchReasons } from '../../services/reason';

// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   sbu: '',
//   nttn_provider: '',
//   link_type: '',
//   client_category: '',
//   client: '',
//   nttn_link_id: '',
//   capacity: '',
//   capacity_cost: '',
//   // NEW: upper section BW shift input (displayed after After Shifting Capacity in info panel)

// // src/components/shiftCapacity/ShiftCapacityForm.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { useFormik, FormikProvider } from 'formik';
// import { ArrowLeft } from 'lucide-react';

// import Button from '../ui/Button';
// import InputField from '../fields/InputField';
// import SelectField from '../fields/SelectField';
// import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

// import { fetchNTTNs } from '../../services/nttn';
// import { fetchSBUs } from '../../services/sbu';
// import { fetchCategoriesBySBU } from '../../services/client';
// import { fetchCategories } from '../../services/category';
// import { fetchClientsCategoryWise, fetchClientsByNttn } from '../../services/client';
// import { fetchWorkOrders } from '../../services/workOrder';
// import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

// import {
//   getRateBetweenBandwidthRange,
//   getWorkOrderCategoryAndClientWise,
//   createCapacityShifting,
// } from '../../services/capacityShiftingApi';
// import { getRatesBetweenShiftingBandwidth, getRatesByNttn } from '../../services/bwRateApi';
// import { fetchLinkTypes } from '../../services/linkType';
// import DatePickerField from '../fields/DatePickerField';
// import { fetchReasons } from '../../services/reason';

// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   sbu: '',
//   nttn_provider: '',
//   link_type: '',
//   client_category: '',
//   client: '',
//   nttn_link_id: '',
//   capacity: '',
//   capacity_cost: '',
//   // NEW: upper section BW shift input (displayed after After Shifting Capacity in info panel)
//   upper_shifting_bw: '',
//   // shifting_amount_display is purely derived: upper_shifting_bw * unit_rate_from_work_order
//   shifting_amount_display: '',
//   // ---- Shifting Target row fields ----
//   shifting_bw: '',           // = shifting_amount_display / unit_rate (reverse calc after work order select)
//   shifting_capacity: '',     // = shifting_bw * unit_rate (Shifting Amount)
//   after_shifting_capacity: '',
//   shifting_client_category: '',
//   shifting_client: '',
//   shifting_unit_cost: '',
//   total_shifting_cost: '',
//   shifting_unit_price_dropdown: '',
//   submission_date: '',
//   reason_id: '',
//   remarks: '',
//   target_request_capacity: '',
//   target_total_bw: '',
// };

// const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [sbus, setSbus] = useState([]);
//   const [isLoadingSbus, setIsLoadingSbus] = useState(false);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [linkTypeOptions, setLinkTypeOptions] = useState([]);
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
//   const [printLinkTypeName, setPrintLinkTypeName] = useState('');
//   const [reasonsOptions, setReasonsOptions] = useState([]);
//   const [shiftingBandwidthRateRanges, setShiftingBandwidthRateRanges] = useState([]);
//   const [afterShiftingUnitRate, setAfterShiftingUnitRate] = useState(0);
//   // Stores link_type_id from the SOURCE work order (nttn_link_id selection) — used for After Shifting rate API
//   const [sourceLinkTypeId, setSourceLinkTypeId] = useState(null);

//   const [currentRateType, setCurrentRateType] = useState(null);
//   const [shiftingRateData, setShiftingRateData] = useState(null);

//   // NEW: stores the selected shifting work order's rate & request_capacity
//   const [shiftingWorkOrderRate, setShiftingWorkOrderRate] = useState(0);
//   const [shiftingWorkOrderRequestCapacity, setShiftingWorkOrderRequestCapacity] = useState(0);

//   // Adjusted Amount: manually entered by user to correct After Shifting Amount
//   const [adjustedAmount, setAdjustedAmount] = useState('');

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const lastEdited = useRef(null);

//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: shiftCapacitySchema,
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       await handleSave(values, resetForm);
//     },
//   });

//   /* ---------- Boot: load static data ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttn, cats, linkTypesRes, reasonsRes, sbusRes] = await Promise.all([
//           fetchNTTNs(),
//           fetchCategories(),
//           fetchLinkTypes(),
//           fetchReasons(),
//           fetchSBUs(),
//         ]);
//         setNttnProviders(nttn.data);
//         setClientCategories(cats.data);
//         setLinkTypeOptions(linkTypesRes.data);
//         setReasonsOptions(reasonsRes.data);
//         const sbusData = sbusRes?.data || sbusRes || [];
//         setSbus(sbusData.map((s) => ({ value: s.id, label: s.name || s.sbu_name })));
//       } catch (e) {
//         showToast?.(e.message || 'Failed to load form data', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- SBU → categories ---------- */
//   useEffect(() => {
//     if (!formik.values.sbu) {
//       setFilteredCategories([]);
//       setClients([]);
//       formik.setFieldValue('client_category', '');
//       formik.setFieldValue('client', '');
//       return;
//     }
//     setIsLoadingCategories(true);
//     fetchCategoriesBySBU(formik.values.sbu)
//       .then((res) => setFilteredCategories(res?.data || res || []))
//       .catch(() => setFilteredCategories([]))
//       .finally(() => setIsLoadingCategories(false));
//   }, [formik.values.sbu]);

//   /* ---------- NTTN + LinkType → NTTN rate options ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_provider || !formik.values.link_type) return;
//     getRatesByNttn({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//     })
//       .then((res) => setNttnRatesOptions(res.data))
//       .catch((err) => console.log(err));
//   }, [formik.values.nttn_provider, formik.values.link_type]);

//   /* ---------- shifting_bw auto-rate (only when NO work-order link selected & NO manual dropdown) ---------- */
//   useEffect(() => {
//     if (formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return;

//     if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw) return;

//     getRatesBetweenShiftingBandwidth({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//       bandwidth: parseFloat(formik.values.shifting_bw),
//     })
//       .then((res) => {
//         formik.setFieldValue('shifting_unit_cost', '');
//         setShiftingBandwidthRateRanges(res?.data);
//         if (res?.data) {
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;
//           setCurrentRateType(rateTypeValue);
//           setShiftingRateData(res?.data);
//           const unitRate = parseFloat(res?.data?.rate) || 0;
//           formik.setFieldValue('shifting_unit_cost', unitRate);

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else if (rateTypeValue === 2) {
//             const bw = parseFloat(formik.values.shifting_bw);
//             formik.setFieldValue('shifting_capacity', (bw * unitRate).toFixed(2));
//           }
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         setCurrentRateType(null);
//         setShiftingRateData(null);
//       });
//   }, [
//     formik.values.shifting_bw,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     formik.values.shifting_unit_price_dropdown,
//     formik.values.shifting_link_id,
//   ]);

//   /* ---------- Source: clients ---------- */
//   useEffect(() => {
//     if (!formik.values.client_category || !formik.values.nttn_provider) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     Promise.all([
//       fetchClientsCategoryWise(formik.values.client_category),
//       fetchClientsByNttn(formik.values.nttn_provider),
//     ])
//       .then(([catRes, nttnRes]) => {
//         const catClients = Array.isArray(catRes) ? catRes : catRes?.data || [];
//         const nttnClients = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const nttnClientIds = new Set(nttnClients.map((c) => c.id));
//         const filtered = catClients.filter((c) => nttnClientIds.has(c.id));
//         setClients(filtered.length > 0 ? filtered : catClients);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category, formik.values.nttn_provider]);

//   /* ---------- Shifting Target: clients (filtered by cat_id) ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue('shifting_client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then((res) => setShiftingClients(Array.isArray(res) ? res : res?.data || []))
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   /* ---------- Source: work orders by client + category ---------- */
//   useEffect(() => {
//     const { client, client_category } = formik.values;
//     if (!client || !client_category) return;

//     setNttnLinkIds([]);
//     setWorkOrderDetailsData([]);
//     formik.setFieldValue('nttn_link_id', '');

//     const fetchData = async () => {
//       try {
//         const { data } = await getWorkOrderCategoryAndClientWise({ cat_id: client_category, client_id: client });
//         setNttnLinkIds(data);
//         setWorkOrderDetailsData(data);
//       } catch (error) {
//         console.error('API call failed:', error);
//       }
//     };
//     fetchData();
//   }, [formik.values.client, formik.values.client_category]);

//   /* ---------- Source: nttn_link_id selected ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_link_id) return;
//     const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
//     if (filtered) {
//       const totalCapacityCost = filtered.rate * filtered.request_capacity;
//       setShiftingSourceRates(filtered.rate);
//       setPrintLinkTypeName(filtered.type_name);
//       setSourceLinkTypeId(filtered.link_type_id || filtered.link_type || null);
//       console.log('📌 Source link_type_id stored:', filtered.link_type_id || filtered.link_type);
//       formik.setFieldValue('capacity', filtered.request_capacity);
//       formik.setFieldValue('capacity_cost', parseFloat(totalCapacityCost).toFixed(2) || 0);
//     }
//   }, [formik.values.nttn_link_id, workOrderDetailsData]);

//   /* ==========================================================================
//    * Shifting Target: fetch work orders using link_type_id (from link_type dropdown),
//    * cat_id (from shifting_client_category), client_id (from shifting_client),
//    * and nttn_id (from nttn_provider — same as source).
//    *
//    * When a work order is selected:
//    *   - "Before Shifting Capacity" = work order's request_capacity
//    *   - Unit Rate for "Shifting Amount" = work order's rate
//    * ========================================================================== */
//   useEffect(() => {
//     const { shifting_client, shifting_client_category, link_type, nttn_provider } = formik.values;
//     if (!shifting_client || !shifting_client_category) return;

//     setShiftingClientLinkIds([]);
//     setShiftingWorkOrderDetailsData([]);
//     formik.setFieldValue('shifting_link_id', '');
//     // Reset derived values when dependencies change
//     setShiftingWorkOrderRate(0);
//     setShiftingWorkOrderRequestCapacity(0);

//     const fetchShiftingData = async () => {
//       try {
//         // Pass link_type_id, cat_id, client_id, nttn_id to the API
//         const payload = {
//           cat_id: shifting_client_category,
//           client_id: shifting_client,
//         };
//         if (link_type) payload.link_type_id = parseInt(link_type);
//         if (nttn_provider) payload.nttn_id = parseInt(nttn_provider);

//         const { data } = await getWorkOrderCategoryAndClientWise(payload);
//         setShiftingClientLinkIds(data);
//         setShiftingWorkOrderDetailsData(data);
//         console.log('📋 Shifting work orders fetched:', data);
//       } catch (error) {
//         console.error('Shifting work orders fetch failed:', error);
//       }
//     };
//     fetchShiftingData();
//   }, [
//     formik.values.shifting_client,
//     formik.values.shifting_client_category,
//     formik.values.link_type,
//     formik.values.nttn_provider,
//   ]);

//   /* ==========================================================================
//    * When Shifting Work Order Link ID is selected:
//    *   1. Set "Before Shifting Capacity" = work order's request_capacity
//    *   2. Unit Rate for Shifting Amount = work order's rate
//    *   3. shifting_amount_display (upper panel) is LOCKED — upper_shifting_bw × shiftingSourceRates
//    *   4. shifting_capacity (lower field) = shifting_amount_display (locked, read-only)
//    *   5. shifting_bw = shifting_amount_display / work_order_rate
//    * ========================================================================== */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     if (!filtered) return;

//     const woRequestCapacity = parseFloat(filtered.request_capacity) || 0;
//     const woRate = parseFloat(filtered.rate) || 0;

//     // Store work order rate & request_capacity in state for display & calcs
//     setShiftingWorkOrderRate(woRate);
//     setShiftingWorkOrderRequestCapacity(woRequestCapacity);

//     formik.setFieldValue('target_request_capacity', woRequestCapacity);
//     console.log('📊 Shifting Work Order selected — request_capacity:', woRequestCapacity, '| rate:', woRate);

//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;

//     // shifting_amount_display is locked: upper_shifting_bw × shiftingSourceRates
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;

//     // Unit cost comes from the work order's own rate
//     formik.setFieldValue('shifting_unit_cost', woRate.toFixed(2));
//     console.log('💰 Shifting Unit Cost (from work order rate):', woRate);

//     // shifting_capacity = locked shifting_amount_display
//     if (lockedShiftingAmount > 0) {
//       formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//       console.log('📌 shifting_capacity locked to shifting_amount_display:', lockedShiftingAmount);

//       // shifting_bw = locked_amount / work_order_rate
//       if (woRate > 0) {
//         const derivedBW = lockedShiftingAmount / woRate;
//         formik.setFieldValue('shifting_bw', Math.floor(derivedBW));
//         console.log('📌 shifting_bw = shifting_amount_display / wo_rate:', Math.floor(derivedBW));
//       } else {
//         formik.setFieldValue('shifting_bw', upperBW);
//       }
//     } else if (upperBW > 0 && woRate > 0) {
//       // Fallback: if no locked amount yet, derive from upperBW × woRate
//       const derivedAmount = upperBW * woRate;
//       formik.setFieldValue('shifting_capacity', derivedAmount.toFixed(2));
//       formik.setFieldValue('shifting_bw', upperBW);
//     }
//   }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

//   /* ---------- upper_shifting_bw changes → recalculate shifting_amount_display using UPPER Unit Price ---------- */
//   useEffect(() => {
//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
//     const upperUnitPrice = parseFloat(shiftingSourceRates) || 0;

//     if (upperBW > 0 && upperUnitPrice > 0) {
//       const shiftingAmount = upperBW * upperUnitPrice;
//       formik.setFieldValue('shifting_amount_display', shiftingAmount.toFixed(2));
//     } else {
//       formik.setFieldValue('shifting_amount_display', '');
//     }
//   }, [formik.values.upper_shifting_bw, shiftingSourceRates]);

//   /* ---------- Recalculate shifting_capacity when shifting_amount_display updates and work order is selected ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;
//     const woRate = shiftingWorkOrderRate;

//     if (lockedShiftingAmount > 0) {
//       formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//       if (woRate > 0) {
//         formik.setFieldValue('shifting_bw', Math.floor(lockedShiftingAmount / woRate));
//       }
//     }
//   }, [formik.values.shifting_amount_display, formik.values.shifting_link_id, shiftingWorkOrderRate]);

//   /* ---------- target_total_bw recalculation ----------
//    * If adjustedAmount is set:
//    *   adjustedAfterShiftingAmount = afterShiftingAmount + adjustedAmount
//    *   adjustedShiftingBW          = adjustedAfterShiftingAmount / rate
//    *   target_total_bw             = Before Shifting Capacity + adjustedShiftingBW
//    * Otherwise:
//    *   target_total_bw             = target_request_capacity + shifting_bw
//    * -------------------------------------------------------------------- */
//   useEffect(() => {
//     const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;
//     const adj = parseFloat(adjustedAmount);
//     const rate = parseFloat(shiftingWorkOrderRate) || 0;

//     if (!isNaN(adj) && adjustedAmount !== '' && rate > 0 && shiftingWorkOrderRate) {
//       // Compute raw After Shifting Amount first
//       const adj_shifting_bw = Math.floor(shiftingBW + adj / rate);
//       const newTargetTotalBW = targetRequestCapacity + adj_shifting_bw;
//       formik.setFieldValue('target_total_bw', newTargetTotalBW);
//     } else if (targetRequestCapacity > 0 && shiftingBW > 0) {
//       formik.setFieldValue('target_total_bw', targetRequestCapacity + shiftingBW);
//     } else {
//       formik.setFieldValue('target_total_bw', '');
//     }
//   }, [formik.values.shifting_bw, formik.values.target_request_capacity, adjustedAmount, shiftingWorkOrderRate]);

//   /* ---------- When shifting_bw changes (and NO work order link active), fetch rate and recalculate ---------- */
//   useEffect(() => {
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

//     if (showShiftingDropdown || formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     const shiftingRequestCapacity = filtered ? parseInt(filtered.request_capacity) || 0 : 0;

//     if (!formik.values.shifting_link_id || shiftingBW <= 0) return;

//     const totalBW = shiftingRequestCapacity + shiftingBW;

//     const fetchRateForTotalBW = async () => {
//       if (!formik.values.nttn_provider || !formik.values.link_type) return;
//       try {
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: parseInt(formik.values.link_type),
//           bandwidth: totalBW,
//         });

//         if (res?.data && res.data.rate) {
//           const unitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;
//           formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else {
//             formik.setFieldValue('shifting_capacity', (shiftingBW * unitRate).toFixed(2));
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error fetching rate for total BW:', error);
//       }
//     };

//     fetchRateForTotalBW();
//   }, [
//     formik.values.shifting_bw,
//     formik.values.shifting_link_id,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     shiftingWorkOrderDetailsData,
//     showShiftingDropdown,
//     formik.values.shifting_unit_price_dropdown,
//   ]);

//   /* ---------- Two-Way Calc: BW → Amount (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_bw, shifting_unit_price_dropdown } = formik.values;
//     if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) return;

//     formik.setFieldValue('shifting_capacity', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate) || 0;
//     const bw = parseFloat(shifting_bw);
//     if (unitRate <= 0 || bw <= 0) { formik.setFieldValue('shifting_capacity', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     const shiftingAmount = rateTypeForDropdown === 1 ? unitRate : bw * unitRate;
//     formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
//     lastEdited.current = null;
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- Two-Way Calc: Amount → BW (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;
//     if (
//       lastEdited.current === 'bw' ||
//       !shifting_unit_price_dropdown ||
//       !shifting_capacity ||
//       parseFloat(shifting_capacity) <= 0
//     ) return;

//     formik.setFieldValue('shifting_bw', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate);
//     const shiftingCost = parseFloat(shifting_capacity);
//     if (!unitRate || unitRate <= 0) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     if (rateTypeForDropdown === 1) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const calculatedBW = shiftingCost / unitRate;
//     lastEdited.current = 'capacity';
//     formik.setFieldValue('shifting_bw', Math.floor(calculatedBW), false);
//   }, [formik.values.shifting_capacity, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- After Shifting Capacity + After Shifting Unit Rate + Total Shifting Cost ---------- */
//   useEffect(() => {
//     const capacity = parseInt(formik.values.capacity) || 0;
//     const upperBW = parseInt(formik.values.upper_shifting_bw) || 0;
//     const afterShiftingCapacity = capacity - upperBW;

//     formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity > 0 ? afterShiftingCapacity : 0, false);

//     const fetchAfterShiftingRate = async () => {
//       const linkTypeToUse = sourceLinkTypeId || parseInt(formik.values.link_type) || null;
//       if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !linkTypeToUse) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//         return;
//       }
//       try {
//         console.log('🔍 After Shifting Rate fetch — bandwidth:', afterShiftingCapacity, '| link_type_id:', linkTypeToUse);
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: linkTypeToUse,
//           bandwidth: afterShiftingCapacity,
//         });

//         if (res?.data && res.data.rate) {
//           const fetchedUnitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

//           setAfterShiftingUnitRate(fetchedUnitRate);

//           const totalShiftingCost =
//             rateTypeValue === 1 ? fetchedUnitRate : afterShiftingCapacity * fetchedUnitRate;
//           formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
//         } else {
//           formik.setFieldValue('total_shifting_cost', '0.00', false);
//           setAfterShiftingUnitRate(0);
//         }
//       } catch (error) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//       }
//     };

//     fetchAfterShiftingRate();
//   }, [
//     formik.values.capacity,
//     formik.values.upper_shifting_bw,
//     formik.values.nttn_provider,
//     sourceLinkTypeId,
//     formik.values.link_type,
//   ]);

//   /* ---------- Submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const {
//         shifting_unit_price_dropdown,
//         target_request_capacity,
//         upper_shifting_bw,
//         shifting_amount_display,
//         ...payload
//       } = values;

//       console.log('📤 Payload to Backend:', {
//         ...payload,
//         shifting_bw: parseFloat(payload.shifting_bw) || 0,
//         target_total_bw: parseFloat(payload.target_total_bw) || 0,
//         link_type: parseInt(payload.link_type) || null,
//       });

//       const res = await createCapacityShifting(payload);
//       showToast?.(res.message, 'success');
//       resetForm();
//       onCancel();
//     } catch (e) {
//       showToast?.(e.message || 'Save failed', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ---------- Render ---------- */
//   if (isLoading) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
//         <span className="text-gray-500">Loading form data...</span>
//       </div>
//     );
//   }

//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
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
//             placeholder="NTTN Name *"
//             options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />

//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="sbu"
//             placeholder={`SBU * ${isLoadingSbus ? '(Loading...)' : ''}`}
//             options={sbus}
//             onChange={(v) => {
//               formik.setFieldValue('sbu', v);
//               formik.setFieldValue('client_category', '');
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={isLoadingSbus}
//           />

//           <SelectField
//             name="client_category"
//             placeholder={`Client Category * ${isLoadingCategories ? '(Loading...)' : ''}`}
//             options={filteredCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//             onChange={(v) => {
//               formik.setFieldValue('client_category', v);
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={!formik.values.sbu || isLoadingCategories}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="nttn_link_id"
//             placeholder="Work Order Link ID *"
//             options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_work_order_id }))}
//             onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>

//         {/* ── Shifting BW input + Shifting Amount display ── */}
//         <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
//           {/* Shifting BW input (upper panel) */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">
//               Shifting BW (MB)
//             </label>
//             <input
//               type="number"
//               step="1"
//               min="0"
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter BW to shift"
//               value={formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 formik.setFieldValue('upper_shifting_bw', val);
//               }}
//             />
//           </div>

//           {/* Shifting Amount display = upper_shifting_bw × unit_rate */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">
//               Shifting Amount (BW × Unit Rate)
//             </label>
//             <input
//               type="text"
//               readOnly
//               className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//               placeholder="Auto-calculated"
//               value={formik.values.shifting_amount_display || ''}
//             />
//             {formik.values.upper_shifting_bw && shiftingSourceRates ? (
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {formik.values.upper_shifting_bw} &times; {shiftingSourceRates} (Unit Price) ={' '}
//                 {formik.values.shifting_amount_display}
//               </p>
//             ) : formik.values.upper_shifting_bw && !shiftingSourceRates ? (
//               <p className="text-xs text-orange-400 mt-0.5">Select a Work Order Link ID first to get Unit Price</p>
//             ) : null}
//           </div>

//           {/* Spacer columns */}
//           <div />
//           <div />
//         </div>

//         {/* ── Info Panel ── */}
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
//           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 justify-items-center items-start gap-4 text-sm">

//             {/* Capacity Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{' '}
//                 {formik.values.capacity_cost || '0.00'}
//               </p>
//             </div>

//             {/* Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{' '}
//                 {formik.values.capacity || 'N/A'}
//               </p>
//             </div>

//             {/* Unit Price */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Unit Price:</strong>{' '}
//                 {shiftingSourceRates || '0.00'}
//               </p>
//             </div>

//             {/* Link Type */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Link Type:</strong>{' '}
//                 {printLinkTypeName || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Cost:</strong>{' '}
//                 {formik.values.total_shifting_cost || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Capacity:</strong>{' '}
//                 {formik.values.after_shifting_capacity || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Unit Rate */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Unit Rate:</strong>{' '}
//                 {afterShiftingUnitRate ? afterShiftingUnitRate.toFixed(2) : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Shifting Target */}
//         <FormSection title="Shifting Target">
//           {/* Row 1: Link Type / Shifting Client Category / Name / Work Order Link ID */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
//             {/*
//               Link Type — provides link_type_id for the shifting work order fetch.
//               When changed, clear downstream shifting selections.
//             */}
//             <SelectField
//               name="link_type"
//               placeholder="Link Type *"
//               options={linkTypeOptions.map((p) => ({ value: p.id, label: p.type_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('link_type', v);
//                 // Clear shifting work order and derived values since link_type_id changed
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingClientLinkIds([]);
//                 setShiftingWorkOrderDetailsData([]);
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//             />

//             {/*
//               Shifting Client Category — provides cat_id for the shifting work order fetch.
//             */}
//             <SelectField
//               name="shifting_client_category"
//               placeholder="Shifting Client Category *"
//               options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client_category', v);
//                 formik.setFieldValue('shifting_client', '');
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//             />

//             {/*
//               Shifting Client Name — provides client_id for the shifting work order fetch.
//               Work orders are fetched once both shifting_client and shifting_client_category are set,
//               using also link_type_id (link_type) and nttn_id (nttn_provider) from source.
//             */}
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client', v);
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />

//             {/*
//               Shifting Work Order Link ID — fetched using:
//                 link_type_id = formik.values.link_type
//                 cat_id       = formik.values.shifting_client_category
//                 client_id    = formik.values.shifting_client
//                 nttn_id      = formik.values.nttn_provider  (same as source)
//               On selection, sets:
//                 - Before Shifting Capacity (request_capacity)
//                 - Unit Rate for Shifting Amount (rate)
//             */}
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Work Order Link ID"
//               options={shiftingClientLinkIds.map((nttn) => ({
//                 value: nttn.id,
//                 label: nttn.nttn_work_order_id,
//               }))}
//               onChange={(v) => {
//                 // Clear previous calculations before new selection
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 formik.setFieldValue('shifting_unit_price_dropdown', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//                 setShowShiftingDropdown(false);
//                 formik.setFieldValue('shifting_link_id', v);
//               }}
//               searchable
//               isClearable
//               disabled={!formik.values.shifting_client}
//             />
//           </div>

//           {/* Row 2: Before Shifting Capacity / Before Shifting Amount / Shifting BW / Shifting Amount / Unit Cost / After-Shifting Capacity / After Shifting Amount */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-7 gap-x-6 gap-y-4">
//             {/* Before Shifting Capacity = request_capacity from the selected shifting work order */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Before Shifting Capacity
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-filled on Work Order select"
//                 value={shiftingWorkOrderRequestCapacity || ''}
//               />
//               <p className="text-xs text-gray-400 mt-0.5">Work order's request_capacity</p>
//             </div>

//             {/* Before Shifting Amount = request_capacity × rate */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Before Shifting Amount
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={
//                   shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate
//                     ? (shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)
//                     : ''
//                 }
//               />
//               {shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate ? (
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {shiftingWorkOrderRequestCapacity} &times; {shiftingWorkOrderRate} ={' '}
//                   {(shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)}
//                 </p>
//               ) : (
//                 <p className="text-xs text-gray-400 mt-0.5">request_capacity × rate</p>
//               )}
//             </div>

//             {/* Shifting BW — derived from (shifting_amount / work_order_rate) */}
//             <InputField
//               name="shifting_bw"
//               label="Shifting BW *"
//               disabled={!!formik.values.shifting_bw}
//               type="number"
//               step="1"
//               onChange={(e) => {
//                 formik.handleChange(e);
//                 lastEdited.current = 'bw';
//               }}
//               help="Auto-filled: Shifting Amount ÷ Unit Rate"
//             />

//             {/*
//               Shifting Amount (lower):
//                - If upper_shifting_bw is filled → locked / read-only (mirrors shifting_amount_display)
//                - Unit Rate used = work order's rate (shiftingWorkOrderRate)
//                - If upper_shifting_bw is NOT filled → editable; user types, then selects rate from dropdown
//             */}
//             <InputField
//               name="shifting_capacity"
//               label={`Shifting Amount (BW × ${shiftingWorkOrderRate ? shiftingWorkOrderRate : 'Unit Rate'})`}
//               type="number"
//               step="0.01"
//               disabled={!!formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 if (formik.values.upper_shifting_bw) return;
//                 formik.handleChange(e);
//                 lastEdited.current = 'capacity';
//                 if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
//                   setShowShiftingDropdown(true);
//                 } else if (e.target.value.trim() === '') {
//                   setShowShiftingDropdown(false);
//                   formik.setFieldValue('shifting_unit_price_dropdown', '');
//                   formik.setFieldValue('shifting_unit_cost', '');
//                 }
//               }}
//               help={
//                 formik.values.upper_shifting_bw
//                   ? `Locked — mirrors Shifting Amount (Unit Rate: ${shiftingWorkOrderRate || 'from work order'})`
//                   : 'Enter amount manually, then select unit rate from dropdown'
//               }
//             />

//             {/* Unit Cost — auto-filled from work order rate on work order link select */}
//             {showShiftingDropdown ? (
//               <SelectField
//                 name="shifting_unit_price_dropdown"
//                 placeholder="Select Unit Price"
//                 options={nttnRatesOptions.map((r) => ({
//                   label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
//                   value: r.id,
//                 }))}
//                 onChange={(selectedRateId) => {
//                   formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
//                   const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
//                   if (selectedRate) {
//                     formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
//                   }
//                   lastEdited.current = 'capacity';
//                 }}
//                 searchable
//               />
//             ) : (
//               <InputField
//                 name="shifting_unit_cost"
//                 label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//                 type="number"
//                 step="0.01"
//                 disabled
//                 help="Auto-filled from Work Order rate"
//               />
//             )}

//             {/* Hidden total_shifting_cost */}
//             <InputField
//               name="total_shifting_cost"
//               label="Total Shifting Cost"
//               type="number"
//               step="0.01"
//               className="hidden"
//               disabled
//             />

//             {/* After-Shifting Capacity — shows Adjusted Shifting BW when Adjusted Amount is entered */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 After-Shifting Capacity
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={(() => {
//                   const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                   const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                   const adj = parseFloat(adjustedAmount);
//                   if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                     // Show Adjusted Shifting BW = floor(shiftBW + adj/rate)
//                     return Math.floor(shiftBW + adj / rate);
//                   }
//                   return formik.values.target_total_bw || '';
//                 })()}
//               />
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {(() => {
//                   const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                   const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                   const adj = parseFloat(adjustedAmount);
//                   if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                     return `Adjusted Shifting BW: ${shiftBW} + (${adj} ÷ ${rate}) = ${Math.floor(shiftBW + adj / rate)}`;
//                   }
//                   return 'Before Shifting Capacity + Shifting BW';
//                 })()}
//               </p>
//             </div>

//             {/* After Shifting Amount — shows adjusted value when Adjusted Amount is entered */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 After Shifting Amount
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={(() => {
//                   const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                   const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//                   const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                   const adj = parseFloat(adjustedAmount);
//                   if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                     const rawAfter = rate * (capacity + shiftBW);
//                     return (rawAfter + adj).toFixed(2);
//                   }
//                   return shiftingWorkOrderRate && formik.values.target_total_bw
//                     ? (shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)
//                     : '';
//                 })()}
//               />
//               {(() => {
//                 const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                 const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//                 const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                 const adj = parseFloat(adjustedAmount);
//                 if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                   const rawAfter = rate * (capacity + shiftBW);
//                   return (
//                     <p className="text-xs text-blue-500 mt-0.5">
//                       {rawAfter.toFixed(2)} + {adj} = {(rawAfter + adj).toFixed(2)}
//                     </p>
//                   );
//                 }
//                 return shiftingWorkOrderRate && formik.values.target_total_bw ? (
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     {shiftingWorkOrderRate} &times; {formik.values.target_total_bw} ={' '}
//                     {(shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)}
//                   </p>
//                 ) : (
//                   <p className="text-xs text-gray-400 mt-0.5">rate × After Shifting Capacity</p>
//                 );
//               })()}
//             </div>

//             {/* Adjusted Amount — manually entered; corrects After Shifting Amount
//                 Formula: Adjusted After Shifting Amount = After Shifting Amount + Adjusted Amount
//                          Adjusted Shifting BW           = Adjusted After Shifting Amount / rate
//                          After Shifting Capacity        = Before Shifting Capacity + Adjusted Shifting BW */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Adjusted Amount <span className="text-gray-400 font-normal">(manual)</span>
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g. 8 or -8"
//                 value={adjustedAmount}
//                 onChange={(e) => setAdjustedAmount(e.target.value)}
//               />
//               {adjustedAmount !== '' && shiftingWorkOrderRate && formik.values.target_total_bw ? (() => {
//                 const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                 const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//                 const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                 const rawAfter = rate * (capacity + shiftBW);
//                 const adj = parseFloat(adjustedAmount) || 0;
//                 const adjAfter = rawAfter + adj;
//                 return (
//                   <p className="text-xs text-blue-500 mt-0.5">
//                     {rawAfter.toFixed(2)} + ({adjustedAmount}) = {adjAfter.toFixed(2)}
//                   </p>
//                 );
//               })() : (
//                 <p className="text-xs text-gray-400 mt-0.5">Enter +/- to adjust After Shifting Amount</p>
//               )}
//             </div>
//           </div>

//           {/* Row 2b: Adjusted results — only shown when Adjusted Amount is entered */}
//           {adjustedAmount !== '' && shiftingWorkOrderRate && (() => {
//             const rate = parseFloat(shiftingWorkOrderRate) || 0;
//             const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//             const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//             const rawAfterAmount = rate * (capacity + shiftBW);
//             const adj = parseFloat(adjustedAmount) || 0;
//             // Adjusted After Shifting Amount = rawAfterAmount + adj
//             const adjAfterShiftingAmount = rawAfterAmount + adj;
//             // Adjusted Shifting BW = adj / rate added to original shiftBW
//             const adjShiftingBW = Math.floor(shiftBW + adj / rate);
//             // Adjusted After Shifting Capacity = Before Shifting Capacity + Adjusted Shifting BW
//             const adjAfterCapacity = capacity + adjShiftingBW;
//             return (
//               <div className="col-span-full mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
//                 <div>
//                   <label className="block text-xs font-semibold text-blue-700 mb-1">
//                     Adjusted After Shifting Amount
//                   </label>
//                   <input
//                     type="number"
//                     readOnly
//                     disabled
//                     className="w-full border border-blue-200 bg-white rounded-md px-3 py-2 text-sm text-blue-800 cursor-not-allowed font-medium"
//                     value={adjAfterShiftingAmount.toFixed(2)}
//                   />
//                   <p className="text-xs text-blue-400 mt-0.5">
//                     {rawAfterAmount.toFixed(2)} + {adj} = {adjAfterShiftingAmount.toFixed(2)}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-blue-700 mb-1">
//                     Adjusted Shifting BW
//                   </label>
//                   <input
//                     type="number"
//                     readOnly
//                     disabled
//                     className="w-full border border-blue-200 bg-white rounded-md px-3 py-2 text-sm text-blue-800 cursor-not-allowed font-medium"
//                     value={adjShiftingBW}
//                   />
//                   <p className="text-xs text-blue-400 mt-0.5">
//                     {shiftBW} + ({adj} ÷ {rate}) = {adjShiftingBW}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-blue-700 mb-1">
//                     Adjusted After Shifting Capacity
//                   </label>
//                   <input
//                     type="number"
//                     readOnly
//                     disabled
//                     className="w-full border border-blue-200 bg-white rounded-md px-3 py-2 text-sm text-blue-800 cursor-not-allowed font-medium"
//                     value={adjAfterCapacity}
//                   />
//                   <p className="text-xs text-blue-400 mt-0.5">
//                     {capacity} + {adjShiftingBW} = {adjAfterCapacity}
//                   </p>
//                 </div>
//               </div>
//             );
//           })()}

//           {/* Row 3: Reason / Date / Remarks */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
//             <SelectField
//               name="reason_id"
//               placeholder="Shift Reason"
//               options={reasonsOptions.map((nttn) => ({ value: nttn.id, label: nttn.reason }))}
//               onChange={(v) => formik.setFieldValue('reason_id', v)}
//               searchable
//               isClearable
//             />

//             <DatePickerField
//               name="submission_date"
//               placeholder="Submission Date"
//               field={{ name: 'submission_date', value: formik.values.submission_date }}
//               form={formik}
//             />

//             <InputField name="remarks" label="Remarks" type="text" />
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

// export default ShiftCapacityForm;
//   upper_shifting_bw: '',
//   // shifting_amount_display is purely derived: upper_shifting_bw * unit_rate_from_work_order
//   shifting_amount_display: '',
//   // ---- Shifting Target row fields ----
//   shifting_bw: '',           // = shifting_amount_display / unit_rate (reverse calc after work order select)
//   shifting_capacity: '',     // = shifting_bw * unit_rate (Shifting Amount)
//   after_shifting_capacity: '',
//   shifting_client_category: '',
//   shifting_client: '',
//   shifting_unit_cost: '',
//   total_shifting_cost: '',
//   shifting_unit_price_dropdown: '',
//   submission_date: '',
//   reason_id: '',
//   remarks: '',
//   target_request_capacity: '',
//   target_total_bw: '',
// };

// const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
//   const [nttnProviders, setNttnProviders] = useState([]);
//   const [sbus, setSbus] = useState([]);
//   const [isLoadingSbus, setIsLoadingSbus] = useState(false);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   const [clientCategories, setClientCategories] = useState([]);
//   const [linkTypeOptions, setLinkTypeOptions] = useState([]);
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
//   const [printLinkTypeName, setPrintLinkTypeName] = useState('');
//   const [reasonsOptions, setReasonsOptions] = useState([]);
//   const [shiftingBandwidthRateRanges, setShiftingBandwidthRateRanges] = useState([]);
//   const [afterShiftingUnitRate, setAfterShiftingUnitRate] = useState(0);
//   // Stores link_type_id from the SOURCE work order (nttn_link_id selection) — used for After Shifting rate API
//   const [sourceLinkTypeId, setSourceLinkTypeId] = useState(null);

//   const [currentRateType, setCurrentRateType] = useState(null);
//   const [shiftingRateData, setShiftingRateData] = useState(null);

//   // NEW: stores the selected shifting work order's rate & request_capacity
//   const [shiftingWorkOrderRate, setShiftingWorkOrderRate] = useState(0);
//   const [shiftingWorkOrderRequestCapacity, setShiftingWorkOrderRequestCapacity] = useState(0);

//   // Adjusted Amount: manually entered by user to correct After Shifting Amount
//   const [adjustedAmount, setAdjustedAmount] = useState('');

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const lastEdited = useRef(null);

//   const formik = useFormik({
//     initialValues: { ...emptyValues, ...initialValues },
//     validationSchema: shiftCapacitySchema,
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       await handleSave(values, resetForm);
//     },
//   });

//   /* ---------- Boot: load static data ---------- */
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const [nttn, cats, linkTypesRes, reasonsRes, sbusRes] = await Promise.all([
//           fetchNTTNs(),
//           fetchCategories(),
//           fetchLinkTypes(),
//           fetchReasons(),
//           fetchSBUs(),
//         ]);
//         setNttnProviders(nttn.data);
//         setClientCategories(cats.data);
//         setLinkTypeOptions(linkTypesRes.data);
//         setReasonsOptions(reasonsRes.data);
//         const sbusData = sbusRes?.data || sbusRes || [];
//         setSbus(sbusData.map((s) => ({ value: s.id, label: s.name || s.sbu_name })));
//       } catch (e) {
//         showToast?.(e.message || 'Failed to load form data', 'error');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, [showToast]);

//   /* ---------- SBU → categories ---------- */
//   useEffect(() => {
//     if (!formik.values.sbu) {
//       setFilteredCategories([]);
//       setClients([]);
//       formik.setFieldValue('client_category', '');
//       formik.setFieldValue('client', '');
//       return;
//     }
//     setIsLoadingCategories(true);
//     fetchCategoriesBySBU(formik.values.sbu)
//       .then((res) => setFilteredCategories(res?.data || res || []))
//       .catch(() => setFilteredCategories([]))
//       .finally(() => setIsLoadingCategories(false));
//   }, [formik.values.sbu]);

//   /* ---------- NTTN + LinkType → NTTN rate options ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_provider || !formik.values.link_type) return;
//     getRatesByNttn({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//     })
//       .then((res) => setNttnRatesOptions(res.data))
//       .catch((err) => console.log(err));
//   }, [formik.values.nttn_provider, formik.values.link_type]);

//   /* ---------- shifting_bw auto-rate (only when NO work-order link selected & NO manual dropdown) ---------- */
//   useEffect(() => {
//     if (formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return;

//     if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw) return;

//     getRatesBetweenShiftingBandwidth({
//       nttn_id: parseInt(formik.values.nttn_provider),
//       link_type_id: parseInt(formik.values.link_type),
//       bandwidth: parseFloat(formik.values.shifting_bw),
//     })
//       .then((res) => {
//         formik.setFieldValue('shifting_unit_cost', '');
//         setShiftingBandwidthRateRanges(res?.data);
//         if (res?.data) {
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;
//           setCurrentRateType(rateTypeValue);
//           setShiftingRateData(res?.data);
//           const unitRate = parseFloat(res?.data?.rate) || 0;
//           formik.setFieldValue('shifting_unit_cost', unitRate);

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else if (rateTypeValue === 2) {
//             const bw = parseFloat(formik.values.shifting_bw);
//             formik.setFieldValue('shifting_capacity', (bw * unitRate).toFixed(2));
//           }
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         setCurrentRateType(null);
//         setShiftingRateData(null);
//       });
//   }, [
//     formik.values.shifting_bw,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     formik.values.shifting_unit_price_dropdown,
//     formik.values.shifting_link_id,
//   ]);

//   /* ---------- Source: clients ---------- */
//   useEffect(() => {
//     if (!formik.values.client_category || !formik.values.nttn_provider) {
//       setClients([]);
//       formik.setFieldValue('client', '');
//       return;
//     }
//     Promise.all([
//       fetchClientsCategoryWise(formik.values.client_category),
//       fetchClientsByNttn(formik.values.nttn_provider),
//     ])
//       .then(([catRes, nttnRes]) => {
//         const catClients = Array.isArray(catRes) ? catRes : catRes?.data || [];
//         const nttnClients = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
//         const nttnClientIds = new Set(nttnClients.map((c) => c.id));
//         const filtered = catClients.filter((c) => nttnClientIds.has(c.id));
//         setClients(filtered.length > 0 ? filtered : catClients);
//       })
//       .catch(() => setClients([]));
//   }, [formik.values.client_category, formik.values.nttn_provider]);

//   /* ---------- Shifting Target: clients (filtered by cat_id) ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue('shifting_client', '');
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then((res) => setShiftingClients(Array.isArray(res) ? res : res?.data || []))
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   /* ---------- Source: work orders by client + category ---------- */
//   useEffect(() => {
//     const { client, client_category } = formik.values;
//     if (!client || !client_category) return;

//     setNttnLinkIds([]);
//     setWorkOrderDetailsData([]);
//     formik.setFieldValue('nttn_link_id', '');

//     const fetchData = async () => {
//       try {
//         const { data } = await getWorkOrderCategoryAndClientWise({ cat_id: client_category, client_id: client });
//         setNttnLinkIds(data);
//         setWorkOrderDetailsData(data);
//       } catch (error) {
//         console.error('API call failed:', error);
//       }
//     };
//     fetchData();
//   }, [formik.values.client, formik.values.client_category]);

//   /* ---------- Source: nttn_link_id selected ---------- */
//   useEffect(() => {
//     if (!formik.values.nttn_link_id) return;
//     const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
//     if (filtered) {
//       const totalCapacityCost = filtered.rate * filtered.request_capacity;
//       setShiftingSourceRates(filtered.rate);
//       setPrintLinkTypeName(filtered.type_name);
//       setSourceLinkTypeId(filtered.link_type_id || filtered.link_type || null);
//       console.log('📌 Source link_type_id stored:', filtered.link_type_id || filtered.link_type);
//       formik.setFieldValue('capacity', filtered.request_capacity);
//       formik.setFieldValue('capacity_cost', parseFloat(totalCapacityCost).toFixed(2) || 0);
//     }
//   }, [formik.values.nttn_link_id, workOrderDetailsData]);

//   /* ==========================================================================
//    * Shifting Target: fetch work orders using link_type_id (from link_type dropdown),
//    * cat_id (from shifting_client_category), client_id (from shifting_client),
//    * and nttn_id (from nttn_provider — same as source).
//    *
//    * When a work order is selected:
//    *   - "Before Shifting Capacity" = work order's request_capacity
//    *   - Unit Rate for "Shifting Amount" = work order's rate
//    * ========================================================================== */
//   useEffect(() => {
//     const { shifting_client, shifting_client_category, link_type, nttn_provider } = formik.values;
//     if (!shifting_client || !shifting_client_category) return;

//     setShiftingClientLinkIds([]);
//     setShiftingWorkOrderDetailsData([]);
//     formik.setFieldValue('shifting_link_id', '');
//     // Reset derived values when dependencies change
//     setShiftingWorkOrderRate(0);
//     setShiftingWorkOrderRequestCapacity(0);

//     const fetchShiftingData = async () => {
//       try {
//         // Pass link_type_id, cat_id, client_id, nttn_id to the API
//         const payload = {
//           cat_id: shifting_client_category,
//           client_id: shifting_client,
//         };
//         if (link_type) payload.link_type_id = parseInt(link_type);
//         if (nttn_provider) payload.nttn_id = parseInt(nttn_provider);

//         const { data } = await getWorkOrderCategoryAndClientWise(payload);
//         setShiftingClientLinkIds(data);
//         setShiftingWorkOrderDetailsData(data);
//         console.log('📋 Shifting work orders fetched:', data);
//       } catch (error) {
//         console.error('Shifting work orders fetch failed:', error);
//       }
//     };
//     fetchShiftingData();
//   }, [
//     formik.values.shifting_client,
//     formik.values.shifting_client_category,
//     formik.values.link_type,
//     formik.values.nttn_provider,
//   ]);

//   /* ==========================================================================
//    * When Shifting Work Order Link ID is selected:
//    *   1. Set "Before Shifting Capacity" = work order's request_capacity
//    *   2. Unit Rate for Shifting Amount = work order's rate
//    *   3. shifting_amount_display (upper panel) is LOCKED — upper_shifting_bw × shiftingSourceRates
//    *   4. shifting_capacity (lower field) = shifting_amount_display (locked, read-only)
//    *   5. shifting_bw = shifting_amount_display / work_order_rate
//    * ========================================================================== */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     if (!filtered) return;

//     const woRequestCapacity = parseFloat(filtered.request_capacity) || 0;
//     const woRate = parseFloat(filtered.rate) || 0;

//     // Store work order rate & request_capacity in state for display & calcs
//     setShiftingWorkOrderRate(woRate);
//     setShiftingWorkOrderRequestCapacity(woRequestCapacity);

//     formik.setFieldValue('target_request_capacity', woRequestCapacity);
//     console.log('📊 Shifting Work Order selected — request_capacity:', woRequestCapacity, '| rate:', woRate);

//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;

//     // shifting_amount_display is locked: upper_shifting_bw × shiftingSourceRates
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;

//     // Unit cost comes from the work order's own rate
//     formik.setFieldValue('shifting_unit_cost', woRate.toFixed(2));
//     console.log('💰 Shifting Unit Cost (from work order rate):', woRate);

//     // shifting_capacity = locked shifting_amount_display
//     if (lockedShiftingAmount > 0) {
//       formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//       console.log('📌 shifting_capacity locked to shifting_amount_display:', lockedShiftingAmount);

//       // shifting_bw = locked_amount / work_order_rate
//       if (woRate > 0) {
//         const derivedBW = lockedShiftingAmount / woRate;
//         formik.setFieldValue('shifting_bw', Math.floor(derivedBW));
//         console.log('📌 shifting_bw = shifting_amount_display / wo_rate:', Math.floor(derivedBW));
//       } else {
//         formik.setFieldValue('shifting_bw', upperBW);
//       }
//     } else if (upperBW > 0 && woRate > 0) {
//       // Fallback: if no locked amount yet, derive from upperBW × woRate
//       const derivedAmount = upperBW * woRate;
//       formik.setFieldValue('shifting_capacity', derivedAmount.toFixed(2));
//       formik.setFieldValue('shifting_bw', upperBW);
//     }
//   }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

//   /* ---------- upper_shifting_bw changes → recalculate shifting_amount_display using UPPER Unit Price ---------- */
//   useEffect(() => {
//     const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
//     const upperUnitPrice = parseFloat(shiftingSourceRates) || 0;

//     if (upperBW > 0 && upperUnitPrice > 0) {
//       const shiftingAmount = upperBW * upperUnitPrice;
//       formik.setFieldValue('shifting_amount_display', shiftingAmount.toFixed(2));
//     } else {
//       formik.setFieldValue('shifting_amount_display', '');
//     }
//   }, [formik.values.upper_shifting_bw, shiftingSourceRates]);

//   /* ---------- Recalculate shifting_capacity when shifting_amount_display updates and work order is selected ---------- */
//   useEffect(() => {
//     if (!formik.values.shifting_link_id) return;
//     const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;
//     const woRate = shiftingWorkOrderRate;

//     if (lockedShiftingAmount > 0) {
//       formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
//       if (woRate > 0) {
//         formik.setFieldValue('shifting_bw', Math.floor(lockedShiftingAmount / woRate));
//       }
//     }
//   }, [formik.values.shifting_amount_display, formik.values.shifting_link_id, shiftingWorkOrderRate]);

//   /* ---------- target_total_bw recalculation ----------
//    * If adjustedAmount is set:
//    *   adjustedAfterShiftingAmount = afterShiftingAmount + adjustedAmount
//    *   adjustedShiftingBW          = adjustedAfterShiftingAmount / rate
//    *   target_total_bw             = Before Shifting Capacity + adjustedShiftingBW
//    * Otherwise:
//    *   target_total_bw             = target_request_capacity + shifting_bw
//    * -------------------------------------------------------------------- */
//   useEffect(() => {
//     const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;
//     const adj = parseFloat(adjustedAmount);
//     const rate = parseFloat(shiftingWorkOrderRate) || 0;

//     if (!isNaN(adj) && adjustedAmount !== '' && rate > 0 && shiftingWorkOrderRate) {
//       // Compute raw After Shifting Amount first
//       const adj_shifting_bw = Math.floor(shiftingBW + adj / rate);
//       const newTargetTotalBW = targetRequestCapacity + adj_shifting_bw;
//       formik.setFieldValue('target_total_bw', newTargetTotalBW);
//     } else if (targetRequestCapacity > 0 && shiftingBW > 0) {
//       formik.setFieldValue('target_total_bw', targetRequestCapacity + shiftingBW);
//     } else {
//       formik.setFieldValue('target_total_bw', '');
//     }
//   }, [formik.values.shifting_bw, formik.values.target_request_capacity, adjustedAmount, shiftingWorkOrderRate]);

//   /* ---------- When shifting_bw changes (and NO work order link active), fetch rate and recalculate ---------- */
//   useEffect(() => {
//     const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

//     if (showShiftingDropdown || formik.values.shifting_unit_price_dropdown) return;
//     if (formik.values.shifting_link_id) return;

//     const filtered = shiftingWorkOrderDetailsData?.find(
//       (item) => item.id === formik.values.shifting_link_id
//     );
//     const shiftingRequestCapacity = filtered ? parseInt(filtered.request_capacity) || 0 : 0;

//     if (!formik.values.shifting_link_id || shiftingBW <= 0) return;

//     const totalBW = shiftingRequestCapacity + shiftingBW;

//     const fetchRateForTotalBW = async () => {
//       if (!formik.values.nttn_provider || !formik.values.link_type) return;
//       try {
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: parseInt(formik.values.link_type),
//           bandwidth: totalBW,
//         });

//         if (res?.data && res.data.rate) {
//           const unitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;
//           formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));

//           if (rateTypeValue === 1) {
//             formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
//           } else {
//             formik.setFieldValue('shifting_capacity', (shiftingBW * unitRate).toFixed(2));
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error fetching rate for total BW:', error);
//       }
//     };

//     fetchRateForTotalBW();
//   }, [
//     formik.values.shifting_bw,
//     formik.values.shifting_link_id,
//     formik.values.nttn_provider,
//     formik.values.link_type,
//     shiftingWorkOrderDetailsData,
//     showShiftingDropdown,
//     formik.values.shifting_unit_price_dropdown,
//   ]);

//   /* ---------- Two-Way Calc: BW → Amount (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_bw, shifting_unit_price_dropdown } = formik.values;
//     if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) return;

//     formik.setFieldValue('shifting_capacity', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate) || 0;
//     const bw = parseFloat(shifting_bw);
//     if (unitRate <= 0 || bw <= 0) { formik.setFieldValue('shifting_capacity', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     const shiftingAmount = rateTypeForDropdown === 1 ? unitRate : bw * unitRate;
//     formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
//     lastEdited.current = null;
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- Two-Way Calc: Amount → BW (manual dropdown path) ---------- */
//   useEffect(() => {
//     const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;
//     if (
//       lastEdited.current === 'bw' ||
//       !shifting_unit_price_dropdown ||
//       !shifting_capacity ||
//       parseFloat(shifting_capacity) <= 0
//     ) return;

//     formik.setFieldValue('shifting_bw', '', false);
//     const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
//     const unitRate = parseFloat(selectedRateOption?.rate);
//     const shiftingCost = parseFloat(shifting_capacity);
//     if (!unitRate || unitRate <= 0) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
//     if (rateTypeForDropdown === 1) { formik.setFieldValue('shifting_bw', '', false); return; }

//     const calculatedBW = shiftingCost / unitRate;
//     lastEdited.current = 'capacity';
//     formik.setFieldValue('shifting_bw', Math.floor(calculatedBW), false);
//   }, [formik.values.shifting_capacity, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

//   /* ---------- After Shifting Capacity + After Shifting Unit Rate + Total Shifting Cost ---------- */
//   useEffect(() => {
//     const capacity = parseInt(formik.values.capacity) || 0;
//     const upperBW = parseInt(formik.values.upper_shifting_bw) || 0;
//     const afterShiftingCapacity = capacity - upperBW;

//     formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity > 0 ? afterShiftingCapacity : 0, false);

//     const fetchAfterShiftingRate = async () => {
//       const linkTypeToUse = sourceLinkTypeId || parseInt(formik.values.link_type) || null;
//       if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !linkTypeToUse) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//         return;
//       }
//       try {
//         console.log('🔍 After Shifting Rate fetch — bandwidth:', afterShiftingCapacity, '| link_type_id:', linkTypeToUse);
//         const res = await getRatesBetweenShiftingBandwidth({
//           nttn_id: parseInt(formik.values.nttn_provider),
//           link_type_id: linkTypeToUse,
//           bandwidth: afterShiftingCapacity,
//         });

//         if (res?.data && res.data.rate) {
//           const fetchedUnitRate = parseFloat(res.data.rate);
//           const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

//           setAfterShiftingUnitRate(fetchedUnitRate);

//           const totalShiftingCost =
//             rateTypeValue === 1 ? fetchedUnitRate : afterShiftingCapacity * fetchedUnitRate;
//           formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
//         } else {
//           formik.setFieldValue('total_shifting_cost', '0.00', false);
//           setAfterShiftingUnitRate(0);
//         }
//       } catch (error) {
//         formik.setFieldValue('total_shifting_cost', '0.00', false);
//         setAfterShiftingUnitRate(0);
//       }
//     };

//     fetchAfterShiftingRate();
//   }, [
//     formik.values.capacity,
//     formik.values.upper_shifting_bw,
//     formik.values.nttn_provider,
//     sourceLinkTypeId,
//     formik.values.link_type,
//   ]);

//   /* ---------- Submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const {
//         shifting_unit_price_dropdown,
//         target_request_capacity,
//         upper_shifting_bw,
//         shifting_amount_display,
//         ...payload
//       } = values;

//       console.log('📤 Payload to Backend:', {
//         ...payload,
//         shifting_bw: parseFloat(payload.shifting_bw) || 0,
//         target_total_bw: parseFloat(payload.target_total_bw) || 0,
//         link_type: parseInt(payload.link_type) || null,
//       });

//       const res = await createCapacityShifting(payload);
//       showToast?.(res.message, 'success');
//       resetForm();
//       onCancel();
//     } catch (e) {
//       showToast?.(e.message || 'Save failed', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ---------- Render ---------- */
//   if (isLoading) {
//     return (
//       <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
//         <span className="text-gray-500">Loading form data...</span>
//       </div>
//     );
//   }

//   return (
//     <FormikProvider value={formik}>
//       <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
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
//             placeholder="NTTN Name *"
//             options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
//             onChange={(v) => formik.setFieldValue('nttn_provider', v)}
//             searchable
//           />

//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="sbu"
//             placeholder={`SBU * ${isLoadingSbus ? '(Loading...)' : ''}`}
//             options={sbus}
//             onChange={(v) => {
//               formik.setFieldValue('sbu', v);
//               formik.setFieldValue('client_category', '');
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={isLoadingSbus}
//           />

//           <SelectField
//             name="client_category"
//             placeholder={`Client Category * ${isLoadingCategories ? '(Loading...)' : ''}`}
//             options={filteredCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//             onChange={(v) => {
//               formik.setFieldValue('client_category', v);
//               formik.setFieldValue('client', '');
//             }}
//             searchable
//             disabled={!formik.values.sbu || isLoadingCategories}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
//             onChange={(v) => formik.setFieldValue('client', v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             className="col-span-1 md:col-span-2"
//             name="nttn_link_id"
//             placeholder="Work Order Link ID *"
//             options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_work_order_id }))}
//             onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>

//         {/* ── Shifting BW input + Shifting Amount display ── */}
//         <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
//           {/* Shifting BW input (upper panel) */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">
//               Shifting BW (MB)
//             </label>
//             <input
//               type="number"
//               step="1"
//               min="0"
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter BW to shift"
//               value={formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 formik.setFieldValue('upper_shifting_bw', val);
//               }}
//             />
//           </div>

//           {/* Shifting Amount display = upper_shifting_bw × unit_rate */}
//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">
//               Shifting Amount (BW × Unit Rate)
//             </label>
//             <input
//               type="text"
//               readOnly
//               className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//               placeholder="Auto-calculated"
//               value={formik.values.shifting_amount_display || ''}
//             />
//             {formik.values.upper_shifting_bw && shiftingSourceRates ? (
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {formik.values.upper_shifting_bw} &times; {shiftingSourceRates} (Unit Price) ={' '}
//                 {formik.values.shifting_amount_display}
//               </p>
//             ) : formik.values.upper_shifting_bw && !shiftingSourceRates ? (
//               <p className="text-xs text-orange-400 mt-0.5">Select a Work Order Link ID first to get Unit Price</p>
//             ) : null}
//           </div>

//           {/* Spacer columns */}
//           <div />
//           <div />
//         </div>

//         {/* ── Info Panel ── */}
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
//           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 justify-items-center items-start gap-4 text-sm">

//             {/* Capacity Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{' '}
//                 {formik.values.capacity_cost || '0.00'}
//               </p>
//             </div>

//             {/* Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{' '}
//                 {formik.values.capacity || 'N/A'}
//               </p>
//             </div>

//             {/* Unit Price */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Unit Price:</strong>{' '}
//                 {shiftingSourceRates || '0.00'}
//               </p>
//             </div>

//             {/* Link Type */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Link Type:</strong>{' '}
//                 {printLinkTypeName || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Cost */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Cost:</strong>{' '}
//                 {formik.values.total_shifting_cost || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Capacity */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Capacity:</strong>{' '}
//                 {formik.values.after_shifting_capacity || 'N/A'}
//               </p>
//             </div>

//             {/* After Shifting Unit Rate */}
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">After Shifting Unit Rate:</strong>{' '}
//                 {afterShiftingUnitRate ? afterShiftingUnitRate.toFixed(2) : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Shifting Target */}
//         <FormSection title="Shifting Target">
//           {/* Row 1: Link Type / Shifting Client Category / Name / Work Order Link ID */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
//             {/*
//               Link Type — provides link_type_id for the shifting work order fetch.
//               When changed, clear downstream shifting selections.
//             */}
//             <SelectField
//               name="link_type"
//               placeholder="Link Type *"
//               options={linkTypeOptions.map((p) => ({ value: p.id, label: p.type_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('link_type', v);
//                 // Clear shifting work order and derived values since link_type_id changed
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingClientLinkIds([]);
//                 setShiftingWorkOrderDetailsData([]);
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//             />

//             {/*
//               Shifting Client Category — provides cat_id for the shifting work order fetch.
//             */}
//             <SelectField
//               name="shifting_client_category"
//               placeholder="Shifting Client Category *"
//               options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client_category', v);
//                 formik.setFieldValue('shifting_client', '');
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//             />

//             {/*
//               Shifting Client Name — provides client_id for the shifting work order fetch.
//               Work orders are fetched once both shifting_client and shifting_client_category are set,
//               using also link_type_id (link_type) and nttn_id (nttn_provider) from source.
//             */}
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue('shifting_client', v);
//                 formik.setFieldValue('shifting_link_id', '');
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//               }}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />

//             {/*
//               Shifting Work Order Link ID — fetched using:
//                 link_type_id = formik.values.link_type
//                 cat_id       = formik.values.shifting_client_category
//                 client_id    = formik.values.shifting_client
//                 nttn_id      = formik.values.nttn_provider  (same as source)
//               On selection, sets:
//                 - Before Shifting Capacity (request_capacity)
//                 - Unit Rate for Shifting Amount (rate)
//             */}
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Work Order Link ID"
//               options={shiftingClientLinkIds.map((nttn) => ({
//                 value: nttn.id,
//                 label: nttn.nttn_work_order_id,
//               }))}
//               onChange={(v) => {
//                 // Clear previous calculations before new selection
//                 formik.setFieldValue('shifting_unit_cost', '');
//                 formik.setFieldValue('shifting_capacity', '');
//                 formik.setFieldValue('shifting_bw', '');
//                 formik.setFieldValue('shifting_unit_price_dropdown', '');
//                 setShiftingWorkOrderRate(0);
//                 setShiftingWorkOrderRequestCapacity(0);
//                 setShowShiftingDropdown(false);
//                 formik.setFieldValue('shifting_link_id', v);
//               }}
//               searchable
//               isClearable
//               disabled={!formik.values.shifting_client}
//             />
//           </div>

//           {/* Row 2: Before Shifting Capacity / Before Shifting Amount / Shifting BW / Shifting Amount / Unit Cost / After-Shifting Capacity / After Shifting Amount */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-7 gap-x-6 gap-y-4">
//             {/* Before Shifting Capacity = request_capacity from the selected shifting work order */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Before Shifting Capacity
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-filled on Work Order select"
//                 value={shiftingWorkOrderRequestCapacity || ''}
//               />
//               <p className="text-xs text-gray-400 mt-0.5">Work order's request_capacity</p>
//             </div>

//             {/* Before Shifting Amount = request_capacity × rate */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Before Shifting Amount
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={
//                   shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate
//                     ? (shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)
//                     : ''
//                 }
//               />
//               {shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate ? (
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   {shiftingWorkOrderRequestCapacity} &times; {shiftingWorkOrderRate} ={' '}
//                   {(shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)}
//                 </p>
//               ) : (
//                 <p className="text-xs text-gray-400 mt-0.5">request_capacity × rate</p>
//               )}
//             </div>

//             {/* Shifting BW — derived from (shifting_amount / work_order_rate) */}
//             <InputField
//               name="shifting_bw"
//               label="Shifting BW *"
//               disabled={!!formik.values.shifting_bw}
//               type="number"
//               step="1"
//               onChange={(e) => {
//                 formik.handleChange(e);
//                 lastEdited.current = 'bw';
//               }}
//               help="Auto-filled: Shifting Amount ÷ Unit Rate"
//             />

//             {/*
//               Shifting Amount (lower):
//                - If upper_shifting_bw is filled → locked / read-only (mirrors shifting_amount_display)
//                - Unit Rate used = work order's rate (shiftingWorkOrderRate)
//                - If upper_shifting_bw is NOT filled → editable; user types, then selects rate from dropdown
//             */}
//             <InputField
//               name="shifting_capacity"
//               label={`Shifting Amount (BW × ${shiftingWorkOrderRate ? shiftingWorkOrderRate : 'Unit Rate'})`}
//               type="number"
//               step="0.01"
//               disabled={!!formik.values.upper_shifting_bw}
//               onChange={(e) => {
//                 if (formik.values.upper_shifting_bw) return;
//                 formik.handleChange(e);
//                 lastEdited.current = 'capacity';
//                 if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
//                   setShowShiftingDropdown(true);
//                 } else if (e.target.value.trim() === '') {
//                   setShowShiftingDropdown(false);
//                   formik.setFieldValue('shifting_unit_price_dropdown', '');
//                   formik.setFieldValue('shifting_unit_cost', '');
//                 }
//               }}
//               help={
//                 formik.values.upper_shifting_bw
//                   ? `Locked — mirrors Shifting Amount (Unit Rate: ${shiftingWorkOrderRate || 'from work order'})`
//                   : 'Enter amount manually, then select unit rate from dropdown'
//               }
//             />

//             {/* Unit Cost — auto-filled from work order rate on work order link select */}
//             {showShiftingDropdown ? (
//               <SelectField
//                 name="shifting_unit_price_dropdown"
//                 placeholder="Select Unit Price"
//                 options={nttnRatesOptions.map((r) => ({
//                   label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
//                   value: r.id,
//                 }))}
//                 onChange={(selectedRateId) => {
//                   formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
//                   const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
//                   if (selectedRate) {
//                     formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
//                   }
//                   lastEdited.current = 'capacity';
//                 }}
//                 searchable
//               />
//             ) : (
//               <InputField
//                 name="shifting_unit_cost"
//                 label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
//                 type="number"
//                 step="0.01"
//                 disabled
//                 help="Auto-filled from Work Order rate"
//               />
//             )}

//             {/* Hidden total_shifting_cost */}
//             <InputField
//               name="total_shifting_cost"
//               label="Total Shifting Cost"
//               type="number"
//               step="0.01"
//               className="hidden"
//               disabled
//             />

//             {/* After-Shifting Capacity — shows Adjusted Shifting BW when Adjusted Amount is entered */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 After-Shifting Capacity
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={(() => {
//                   const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                   const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                   const adj = parseFloat(adjustedAmount);
//                   if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                     // Show Adjusted Shifting BW = floor(shiftBW + adj/rate)
//                     return Math.floor(shiftBW + adj / rate);
//                   }
//                   return formik.values.target_total_bw || '';
//                 })()}
//               />
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {(() => {
//                   const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                   const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                   const adj = parseFloat(adjustedAmount);
//                   if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                     return `Adjusted Shifting BW: ${shiftBW} + (${adj} ÷ ${rate}) = ${Math.floor(shiftBW + adj / rate)}`;
//                   }
//                   return 'Before Shifting Capacity + Shifting BW';
//                 })()}
//               </p>
//             </div>

//             {/* After Shifting Amount — shows adjusted value when Adjusted Amount is entered */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 After Shifting Amount
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 disabled
//                 className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
//                 placeholder="Auto-calculated"
//                 value={(() => {
//                   const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                   const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//                   const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                   const adj = parseFloat(adjustedAmount);
//                   if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                     const rawAfter = rate * (capacity + shiftBW);
//                     return (rawAfter + adj).toFixed(2);
//                   }
//                   return shiftingWorkOrderRate && formik.values.target_total_bw
//                     ? (shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)
//                     : '';
//                 })()}
//               />
//               {(() => {
//                 const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                 const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//                 const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                 const adj = parseFloat(adjustedAmount);
//                 if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
//                   const rawAfter = rate * (capacity + shiftBW);
//                   return (
//                     <p className="text-xs text-blue-500 mt-0.5">
//                       {rawAfter.toFixed(2)} + {adj} = {(rawAfter + adj).toFixed(2)}
//                     </p>
//                   );
//                 }
//                 return shiftingWorkOrderRate && formik.values.target_total_bw ? (
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     {shiftingWorkOrderRate} &times; {formik.values.target_total_bw} ={' '}
//                     {(shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)}
//                   </p>
//                 ) : (
//                   <p className="text-xs text-gray-400 mt-0.5">rate × After Shifting Capacity</p>
//                 );
//               })()}
//             </div>

//             {/* Adjusted Amount — manually entered; corrects After Shifting Amount
//                 Formula: Adjusted After Shifting Amount = After Shifting Amount + Adjusted Amount
//                          Adjusted Shifting BW           = Adjusted After Shifting Amount / rate
//                          After Shifting Capacity        = Before Shifting Capacity + Adjusted Shifting BW */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 Adjusted Amount <span className="text-gray-400 font-normal">(manual)</span>
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g. 8 or -8"
//                 value={adjustedAmount}
//                 onChange={(e) => setAdjustedAmount(e.target.value)}
//               />
//               {adjustedAmount !== '' && shiftingWorkOrderRate && formik.values.target_total_bw ? (() => {
//                 const rate = parseFloat(shiftingWorkOrderRate) || 0;
//                 const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//                 const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//                 const rawAfter = rate * (capacity + shiftBW);
//                 const adj = parseFloat(adjustedAmount) || 0;
//                 const adjAfter = rawAfter + adj;
//                 return (
//                   <p className="text-xs text-blue-500 mt-0.5">
//                     {rawAfter.toFixed(2)} + ({adjustedAmount}) = {adjAfter.toFixed(2)}
//                   </p>
//                 );
//               })() : (
//                 <p className="text-xs text-gray-400 mt-0.5">Enter +/- to adjust After Shifting Amount</p>
//               )}
//             </div>
//           </div>

//           {/* Row 2b: Adjusted results — only shown when Adjusted Amount is entered */}
//           {adjustedAmount !== '' && shiftingWorkOrderRate && (() => {
//             const rate = parseFloat(shiftingWorkOrderRate) || 0;
//             const capacity = parseFloat(formik.values.target_request_capacity) || 0;
//             const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
//             const rawAfterAmount = rate * (capacity + shiftBW);
//             const adj = parseFloat(adjustedAmount) || 0;
//             // Adjusted After Shifting Amount = rawAfterAmount + adj
//             const adjAfterShiftingAmount = rawAfterAmount + adj;
//             // Adjusted Shifting BW = adj / rate added to original shiftBW
//             const adjShiftingBW = Math.floor(shiftBW + adj / rate);
//             // Adjusted After Shifting Capacity = Before Shifting Capacity + Adjusted Shifting BW
//             const adjAfterCapacity = capacity + adjShiftingBW;
//             return (
//               <div className="col-span-full mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
//                 <div>
//                   <label className="block text-xs font-semibold text-blue-700 mb-1">
//                     Adjusted After Shifting Amount
//                   </label>
//                   <input
//                     type="number"
//                     readOnly
//                     disabled
//                     className="w-full border border-blue-200 bg-white rounded-md px-3 py-2 text-sm text-blue-800 cursor-not-allowed font-medium"
//                     value={adjAfterShiftingAmount.toFixed(2)}
//                   />
//                   <p className="text-xs text-blue-400 mt-0.5">
//                     {rawAfterAmount.toFixed(2)} + {adj} = {adjAfterShiftingAmount.toFixed(2)}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-blue-700 mb-1">
//                     Adjusted Shifting BW
//                   </label>
//                   <input
//                     type="number"
//                     readOnly
//                     disabled
//                     className="w-full border border-blue-200 bg-white rounded-md px-3 py-2 text-sm text-blue-800 cursor-not-allowed font-medium"
//                     value={adjShiftingBW}
//                   />
//                   <p className="text-xs text-blue-400 mt-0.5">
//                     {shiftBW} + ({adj} ÷ {rate}) = {adjShiftingBW}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-blue-700 mb-1">
//                     Adjusted After Shifting Capacity
//                   </label>
//                   <input
//                     type="number"
//                     readOnly
//                     disabled
//                     className="w-full border border-blue-200 bg-white rounded-md px-3 py-2 text-sm text-blue-800 cursor-not-allowed font-medium"
//                     value={adjAfterCapacity}
//                   />
//                   <p className="text-xs text-blue-400 mt-0.5">
//                     {capacity} + {adjShiftingBW} = {adjAfterCapacity}
//                   </p>
//                 </div>
//               </div>
//             );
//           })()}

//           {/* Row 3: Reason / Date / Remarks */}
//           <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
//             <SelectField
//               name="reason_id"
//               placeholder="Shift Reason"
//               options={reasonsOptions.map((nttn) => ({ value: nttn.id, label: nttn.reason }))}
//               onChange={(v) => formik.setFieldValue('reason_id', v)}
//               searchable
//               isClearable
//             />

//             <DatePickerField
//               name="submission_date"
//               placeholder="Submission Date"
//               field={{ name: 'submission_date', value: formik.values.submission_date }}
//               form={formik}
//             />

//             <InputField name="remarks" label="Remarks" type="text" />
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

// export default ShiftCapacityForm;





// src/components/shiftCapacity/ShiftCapacityForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

import { fetchNTTNs } from '../../services/nttn';
import { fetchSBUs } from '../../services/sbu';
import { fetchCategoriesBySBU } from '../../services/client';
import { fetchCategories } from '../../services/category';
import { fetchClientsCategoryWise, fetchClientsByNttn } from '../../services/client';
import { fetchWorkOrders } from '../../services/workOrder';
import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

import {
  getRateBetweenBandwidthRange,
  getWorkOrderCategoryAndClientWise,
  createCapacityShifting,
} from '../../services/capacityShiftingApi';
import { getRatesBetweenShiftingBandwidth, getRatesByNttn } from '../../services/bwRateApi';
import { fetchLinkTypes } from '../../services/linkType';
import DatePickerField from '../fields/DatePickerField';
import { fetchReasons } from '../../services/reason';

const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- empty shape ---------- */
const emptyValues = {
  sbu: '',
  nttn_provider: '',
  link_type: '',
  client_category: '',
  client: '',
  nttn_link_id: '',
  capacity: '',
  capacity_cost: '',
  // NEW: upper section BW shift input (displayed after After Shifting Capacity in info panel)
  upper_shifting_bw: '',
  // shifting_amount_display is purely derived: upper_shifting_bw * unit_rate_from_work_order
  shifting_amount_display: '',
  // ---- Shifting Target row fields ----
  shifting_bw: '',           // = shifting_amount_display / unit_rate (reverse calc after work order select)
  shifting_capacity: '',     // = shifting_bw * unit_rate (Shifting Amount)
  after_shifting_capacity: '',
  shifting_client_category: '',
  shifting_client: '',
  shifting_unit_cost: '',
  total_shifting_cost: '',
  shifting_unit_price_dropdown: '',
  submission_date: '',
  reason_id: '',
  remarks: '',
  target_request_capacity: '',
  target_total_bw: '',
};

const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const [nttnProviders, setNttnProviders] = useState([]);
  const [sbus, setSbus] = useState([]);
  const [isLoadingSbus, setIsLoadingSbus] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [clientCategories, setClientCategories] = useState([]);
  const [linkTypeOptions, setLinkTypeOptions] = useState([]);
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
  const [printLinkTypeName, setPrintLinkTypeName] = useState('');
  const [reasonsOptions, setReasonsOptions] = useState([]);
  const [shiftingBandwidthRateRanges, setShiftingBandwidthRateRanges] = useState([]);
  const [afterShiftingUnitRate, setAfterShiftingUnitRate] = useState(0);
  // Stores link_type_id from the SOURCE work order (nttn_link_id selection) — used for After Shifting rate API
  const [sourceLinkTypeId, setSourceLinkTypeId] = useState(null);

  const [currentRateType, setCurrentRateType] = useState(null);
  const [shiftingRateData, setShiftingRateData] = useState(null);

  // NEW: stores the selected shifting work order's rate & request_capacity
  const [shiftingWorkOrderRate, setShiftingWorkOrderRate] = useState(0);
  const [shiftingWorkOrderRequestCapacity, setShiftingWorkOrderRequestCapacity] = useState(0);

  // Adjusted Amount: manually entered by user to correct After Shifting Amount
  const [adjustedAmount, setAdjustedAmount] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastEdited = useRef(null);

  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: shiftCapacitySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSave(values, resetForm);
    },
  });

  /* ---------- Boot: load static data ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const [nttn, cats, linkTypesRes, reasonsRes, sbusRes] = await Promise.all([
          fetchNTTNs(),
          fetchCategories(),
          fetchLinkTypes(),
          fetchReasons(),
          fetchSBUs(),
        ]);
        setNttnProviders(nttn.data);
        setClientCategories(cats.data);
        setLinkTypeOptions(linkTypesRes.data);
        setReasonsOptions(reasonsRes.data);
        const sbusData = sbusRes?.data || sbusRes || [];
        setSbus(sbusData.map((s) => ({ value: s.id, label: s.name || s.sbu_name })));
      } catch (e) {
        showToast?.(e.message || 'Failed to load form data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- SBU → categories ---------- */
  useEffect(() => {
    if (!formik.values.sbu) {
      setFilteredCategories([]);
      setClients([]);
      formik.setFieldValue('client_category', '');
      formik.setFieldValue('client', '');
      return;
    }
    setIsLoadingCategories(true);
    fetchCategoriesBySBU(formik.values.sbu)
      .then((res) => setFilteredCategories(res?.data || res || []))
      .catch(() => setFilteredCategories([]))
      .finally(() => setIsLoadingCategories(false));
  }, [formik.values.sbu]);

  /* ---------- NTTN + LinkType → NTTN rate options ---------- */
  useEffect(() => {
    if (!formik.values.nttn_provider || !formik.values.link_type) return;
    getRatesByNttn({
      nttn_id: parseInt(formik.values.nttn_provider),
      link_type_id: parseInt(formik.values.link_type),
    })
      .then((res) => setNttnRatesOptions(res.data))
      .catch((err) => console.log(err));
  }, [formik.values.nttn_provider, formik.values.link_type]);

  /* ---------- shifting_bw auto-rate (only when NO work-order link selected & NO manual dropdown) ---------- */
  useEffect(() => {
    if (formik.values.shifting_unit_price_dropdown) return;
    if (formik.values.shifting_link_id) return;

    if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw) return;

    getRatesBetweenShiftingBandwidth({
      nttn_id: parseInt(formik.values.nttn_provider),
      link_type_id: parseInt(formik.values.link_type),
      bandwidth: parseFloat(formik.values.shifting_bw),
    })
      .then((res) => {
        formik.setFieldValue('shifting_unit_cost', '');
        setShiftingBandwidthRateRanges(res?.data);
        if (res?.data) {
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;
          setCurrentRateType(rateTypeValue);
          setShiftingRateData(res?.data);
          const unitRate = parseFloat(res?.data?.rate) || 0;
          formik.setFieldValue('shifting_unit_cost', unitRate);

          if (rateTypeValue === 1) {
            formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
          } else if (rateTypeValue === 2) {
            const bw = parseFloat(formik.values.shifting_bw);
            formik.setFieldValue('shifting_capacity', (bw * unitRate).toFixed(2));
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setCurrentRateType(null);
        setShiftingRateData(null);
      });
  }, [
    formik.values.shifting_bw,
    formik.values.nttn_provider,
    formik.values.link_type,
    formik.values.shifting_unit_price_dropdown,
    formik.values.shifting_link_id,
  ]);

  /* ---------- Source: clients ---------- */
  useEffect(() => {
    if (!formik.values.client_category || !formik.values.nttn_provider) {
      setClients([]);
      formik.setFieldValue('client', '');
      return;
    }
    Promise.all([
      fetchClientsCategoryWise(formik.values.client_category),
      fetchClientsByNttn(formik.values.nttn_provider),
    ])
      .then(([catRes, nttnRes]) => {
        const catClients = Array.isArray(catRes) ? catRes : catRes?.data || [];
        const nttnClients = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
        const nttnClientIds = new Set(nttnClients.map((c) => c.id));
        const filtered = catClients.filter((c) => nttnClientIds.has(c.id));
        setClients(filtered.length > 0 ? filtered : catClients);
      })
      .catch(() => setClients([]));
  }, [formik.values.client_category, formik.values.nttn_provider]);

  /* ---------- Shifting Target: clients (filtered by cat_id) ---------- */
  useEffect(() => {
    if (!formik.values.shifting_client_category) {
      setShiftingClients([]);
      formik.setFieldValue('shifting_client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.shifting_client_category)
      .then((res) => setShiftingClients(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setShiftingClients([]));
  }, [formik.values.shifting_client_category]);

  /* ---------- Source: work orders by client + category ---------- */
  useEffect(() => {
    const { client, client_category } = formik.values;
    if (!client || !client_category) return;

    setNttnLinkIds([]);
    setWorkOrderDetailsData([]);
    formik.setFieldValue('nttn_link_id', '');

    const fetchData = async () => {
      try {
        const { data } = await getWorkOrderCategoryAndClientWise({ cat_id: client_category, client_id: client });
        setNttnLinkIds(data);
        setWorkOrderDetailsData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };
    fetchData();
  }, [formik.values.client, formik.values.client_category]);

  /* ---------- Source: nttn_link_id selected ---------- */
  useEffect(() => {
    if (!formik.values.nttn_link_id) return;
    const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
    if (filtered) {
      const totalCapacityCost = filtered.rate * filtered.request_capacity;
      setShiftingSourceRates(filtered.rate);
      setPrintLinkTypeName(filtered.type_name);
      setSourceLinkTypeId(filtered.link_type_id || filtered.link_type || null);
      console.log('📌 Source link_type_id stored:', filtered.link_type_id || filtered.link_type);
      formik.setFieldValue('capacity', filtered.request_capacity);
      formik.setFieldValue('capacity_cost', parseFloat(totalCapacityCost).toFixed(2) || 0);
    }
  }, [formik.values.nttn_link_id, workOrderDetailsData]);

  /* ==========================================================================
   * Shifting Target: fetch work orders using link_type_id (from link_type dropdown),
   * cat_id (from shifting_client_category), client_id (from shifting_client),
   * and nttn_id (from nttn_provider — same as source).
   *
   * When a work order is selected:
   *   - "Before Shifting Capacity" = work order's request_capacity
   *   - Unit Rate for "Shifting Amount" = work order's rate
   * ========================================================================== */
  useEffect(() => {
    const { shifting_client, shifting_client_category, link_type, nttn_provider } = formik.values;
    if (!shifting_client || !shifting_client_category) return;

    setShiftingClientLinkIds([]);
    setShiftingWorkOrderDetailsData([]);
    formik.setFieldValue('shifting_link_id', '');
    // Reset derived values when dependencies change
    setShiftingWorkOrderRate(0);
    setShiftingWorkOrderRequestCapacity(0);

    const fetchShiftingData = async () => {
      try {
        // Pass link_type_id, cat_id, client_id, nttn_id to the API
        const payload = {
          cat_id: shifting_client_category,
          client_id: shifting_client,
        };
        if (link_type) payload.link_type_id = parseInt(link_type);
        if (nttn_provider) payload.nttn_id = parseInt(nttn_provider);

        const { data } = await getWorkOrderCategoryAndClientWise(payload);
        setShiftingClientLinkIds(data);
        setShiftingWorkOrderDetailsData(data);
        console.log('📋 Shifting work orders fetched:', data);
      } catch (error) {
        console.error('Shifting work orders fetch failed:', error);
      }
    };
    fetchShiftingData();
  }, [
    formik.values.shifting_client,
    formik.values.shifting_client_category,
    formik.values.link_type,
    formik.values.nttn_provider,
  ]);

  /* ==========================================================================
   * When Shifting Work Order Link ID is selected:
   *   1. Set "Before Shifting Capacity" = work order's request_capacity
   *   2. Unit Rate for Shifting Amount = work order's rate
   *   3. shifting_amount_display (upper panel) is LOCKED — upper_shifting_bw × shiftingSourceRates
   *   4. shifting_capacity (lower field) = shifting_amount_display (locked, read-only)
   *   5. shifting_bw = shifting_amount_display / work_order_rate
   * ========================================================================== */
  useEffect(() => {
    if (!formik.values.shifting_link_id) return;

    const filtered = shiftingWorkOrderDetailsData?.find(
      (item) => item.id === formik.values.shifting_link_id
    );
    if (!filtered) return;

    const woRequestCapacity = parseFloat(filtered.request_capacity) || 0;
    const woRate = parseFloat(filtered.rate) || 0;

    // Store work order rate & request_capacity in state for display & calcs
    setShiftingWorkOrderRate(woRate);
    setShiftingWorkOrderRequestCapacity(woRequestCapacity);

    formik.setFieldValue('target_request_capacity', woRequestCapacity);
    console.log('📊 Shifting Work Order selected — request_capacity:', woRequestCapacity, '| rate:', woRate);

    const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;

    // shifting_amount_display is locked: upper_shifting_bw × shiftingSourceRates
    const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;

    // Unit cost comes from the work order's own rate
    formik.setFieldValue('shifting_unit_cost', woRate.toFixed(2));
    console.log('💰 Shifting Unit Cost (from work order rate):', woRate);

    // shifting_capacity = locked shifting_amount_display
    if (lockedShiftingAmount > 0) {
      formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
      console.log('📌 shifting_capacity locked to shifting_amount_display:', lockedShiftingAmount);

      // shifting_bw = locked_amount / work_order_rate
      if (woRate > 0) {
        const derivedBW = lockedShiftingAmount / woRate;
        formik.setFieldValue('shifting_bw', Math.floor(derivedBW));
        console.log('📌 shifting_bw = shifting_amount_display / wo_rate:', Math.floor(derivedBW));
      } else {
        formik.setFieldValue('shifting_bw', upperBW);
      }
    } else if (upperBW > 0 && woRate > 0) {
      // Fallback: if no locked amount yet, derive from upperBW × woRate
      const derivedAmount = upperBW * woRate;
      formik.setFieldValue('shifting_capacity', derivedAmount.toFixed(2));
      formik.setFieldValue('shifting_bw', upperBW);
    }
  }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

  /* ---------- upper_shifting_bw changes → recalculate shifting_amount_display using UPPER Unit Price ---------- */
  useEffect(() => {
    const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
    const upperUnitPrice = parseFloat(shiftingSourceRates) || 0;

    if (upperBW > 0 && upperUnitPrice > 0) {
      const shiftingAmount = upperBW * upperUnitPrice;
      formik.setFieldValue('shifting_amount_display', shiftingAmount.toFixed(2));
    } else {
      formik.setFieldValue('shifting_amount_display', '');
    }
  }, [formik.values.upper_shifting_bw, shiftingSourceRates]);

  /* ---------- Recalculate shifting_capacity when shifting_amount_display updates and work order is selected ---------- */
  useEffect(() => {
    if (!formik.values.shifting_link_id) return;
    const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;
    const woRate = shiftingWorkOrderRate;

    if (lockedShiftingAmount > 0) {
      formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
      if (woRate > 0) {
        formik.setFieldValue('shifting_bw', Math.floor(lockedShiftingAmount / woRate));
      }
    }
  }, [formik.values.shifting_amount_display, formik.values.shifting_link_id, shiftingWorkOrderRate]);

  /* ---------- target_total_bw recalculation ----------
   * If adjustedAmount is set:
   *   adjustedAfterShiftingAmount = afterShiftingAmount + adjustedAmount
   *   adjustedShiftingBW          = adjustedAfterShiftingAmount / rate
   *   target_total_bw             = Before Shifting Capacity + adjustedShiftingBW
   * Otherwise:
   *   target_total_bw             = target_request_capacity + shifting_bw
   * -------------------------------------------------------------------- */
  useEffect(() => {
    const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
    const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;
    const adj = parseFloat(adjustedAmount);
    const rate = parseFloat(shiftingWorkOrderRate) || 0;

    if (!isNaN(adj) && adjustedAmount !== '' && rate > 0 && shiftingWorkOrderRate) {
      // Compute raw After Shifting Amount first
      const adj_shifting_bw = Math.ceil(shiftingBW + adj / rate);
      const newTargetTotalBW = targetRequestCapacity + adj_shifting_bw;
      formik.setFieldValue('target_total_bw', newTargetTotalBW);
    } else if (targetRequestCapacity > 0 && shiftingBW > 0) {
      formik.setFieldValue('target_total_bw', targetRequestCapacity + shiftingBW);
    } else {
      formik.setFieldValue('target_total_bw', '');
    }
  }, [formik.values.shifting_bw, formik.values.target_request_capacity, adjustedAmount, shiftingWorkOrderRate]);

  /* ---------- When shifting_bw changes (and NO work order link active), fetch rate and recalculate ---------- */
  useEffect(() => {
    const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

    if (showShiftingDropdown || formik.values.shifting_unit_price_dropdown) return;
    if (formik.values.shifting_link_id) return;

    const filtered = shiftingWorkOrderDetailsData?.find(
      (item) => item.id === formik.values.shifting_link_id
    );
    const shiftingRequestCapacity = filtered ? parseInt(filtered.request_capacity) || 0 : 0;

    if (!formik.values.shifting_link_id || shiftingBW <= 0) return;

    const totalBW = shiftingRequestCapacity + shiftingBW;

    const fetchRateForTotalBW = async () => {
      if (!formik.values.nttn_provider || !formik.values.link_type) return;
      try {
        const res = await getRatesBetweenShiftingBandwidth({
          nttn_id: parseInt(formik.values.nttn_provider),
          link_type_id: parseInt(formik.values.link_type),
          bandwidth: totalBW,
        });

        if (res?.data && res.data.rate) {
          const unitRate = parseFloat(res.data.rate);
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;
          formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));

          if (rateTypeValue === 1) {
            formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
          } else {
            formik.setFieldValue('shifting_capacity', (shiftingBW * unitRate).toFixed(2));
          }
        }
      } catch (error) {
        console.error('❌ Error fetching rate for total BW:', error);
      }
    };

    fetchRateForTotalBW();
  }, [
    formik.values.shifting_bw,
    formik.values.shifting_link_id,
    formik.values.nttn_provider,
    formik.values.link_type,
    shiftingWorkOrderDetailsData,
    showShiftingDropdown,
    formik.values.shifting_unit_price_dropdown,
  ]);

  /* ---------- Two-Way Calc: BW → Amount (manual dropdown path) ---------- */
  useEffect(() => {
    const { shifting_bw, shifting_unit_price_dropdown } = formik.values;
    if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) return;

    formik.setFieldValue('shifting_capacity', '', false);
    const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
    const unitRate = parseFloat(selectedRateOption?.rate) || 0;
    const bw = parseFloat(shifting_bw);
    if (unitRate <= 0 || bw <= 0) { formik.setFieldValue('shifting_capacity', '', false); return; }

    const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
    const shiftingAmount = rateTypeForDropdown === 1 ? unitRate : bw * unitRate;
    formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
    lastEdited.current = null;
  }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

  /* ---------- Two-Way Calc: Amount → BW (manual dropdown path) ---------- */
  useEffect(() => {
    const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;
    if (
      lastEdited.current === 'bw' ||
      !shifting_unit_price_dropdown ||
      !shifting_capacity ||
      parseFloat(shifting_capacity) <= 0
    ) return;

    formik.setFieldValue('shifting_bw', '', false);
    const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
    const unitRate = parseFloat(selectedRateOption?.rate);
    const shiftingCost = parseFloat(shifting_capacity);
    if (!unitRate || unitRate <= 0) { formik.setFieldValue('shifting_bw', '', false); return; }

    const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
    if (rateTypeForDropdown === 1) { formik.setFieldValue('shifting_bw', '', false); return; }

    const calculatedBW = shiftingCost / unitRate;
    lastEdited.current = 'capacity';
    formik.setFieldValue('shifting_bw', Math.floor(calculatedBW), false);
  }, [formik.values.shifting_capacity, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

  /* ---------- After Shifting Capacity + After Shifting Unit Rate + Total Shifting Cost ---------- */
  useEffect(() => {
    const capacity = parseInt(formik.values.capacity) || 0;
    const upperBW = parseInt(formik.values.upper_shifting_bw) || 0;
    const afterShiftingCapacity = capacity - upperBW;

    formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity > 0 ? afterShiftingCapacity : 0, false);

    const fetchAfterShiftingRate = async () => {
      const linkTypeToUse = sourceLinkTypeId || parseInt(formik.values.link_type) || null;
      if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !linkTypeToUse) {
        formik.setFieldValue('total_shifting_cost', '0.00', false);
        setAfterShiftingUnitRate(0);
        return;
      }
      try {
        console.log('🔍 After Shifting Rate fetch — bandwidth:', afterShiftingCapacity, '| link_type_id:', linkTypeToUse);
        const res = await getRatesBetweenShiftingBandwidth({
          nttn_id: parseInt(formik.values.nttn_provider),
          link_type_id: linkTypeToUse,
          bandwidth: afterShiftingCapacity,
        });

        if (res?.data && res.data.rate) {
          const fetchedUnitRate = parseFloat(res.data.rate);
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

          setAfterShiftingUnitRate(fetchedUnitRate);

          const totalShiftingCost =
            rateTypeValue === 1 ? fetchedUnitRate : afterShiftingCapacity * fetchedUnitRate;
          formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
        } else {
          formik.setFieldValue('total_shifting_cost', '0.00', false);
          setAfterShiftingUnitRate(0);
        }
      } catch (error) {
        formik.setFieldValue('total_shifting_cost', '0.00', false);
        setAfterShiftingUnitRate(0);
      }
    };

    fetchAfterShiftingRate();
  }, [
    formik.values.capacity,
    formik.values.upper_shifting_bw,
    formik.values.nttn_provider,
    sourceLinkTypeId,
    formik.values.link_type,
  ]);

  /* ---------- Submit ---------- */
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
      const {
        shifting_unit_price_dropdown,
        target_request_capacity,
        upper_shifting_bw,
        shifting_amount_display,
        ...payload
      } = values;

      console.log('📤 Payload to Backend:', {
        ...payload,
        shifting_bw: parseFloat(payload.shifting_bw) || 0,
        target_total_bw: parseFloat(payload.target_total_bw) || 0,
        link_type: parseInt(payload.link_type) || null,
      });

      const res = await createCapacityShifting(payload);
      showToast?.(res.message, 'success');
      resetForm();
      onCancel();
    } catch (e) {
      showToast?.(e.message || 'Save failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Render ---------- */
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
            placeholder="NTTN Name *"
            options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
            onChange={(v) => formik.setFieldValue('nttn_provider', v)}
            searchable
          />

          <SelectField
            className="col-span-1 md:col-span-2"
            name="sbu"
            placeholder={`SBU * ${isLoadingSbus ? '(Loading...)' : ''}`}
            options={sbus}
            onChange={(v) => {
              formik.setFieldValue('sbu', v);
              formik.setFieldValue('client_category', '');
              formik.setFieldValue('client', '');
            }}
            searchable
            disabled={isLoadingSbus}
          />

          <SelectField
            name="client_category"
            placeholder={`Client Category * ${isLoadingCategories ? '(Loading...)' : ''}`}
            options={filteredCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
            onChange={(v) => {
              formik.setFieldValue('client_category', v);
              formik.setFieldValue('client', '');
            }}
            searchable
            disabled={!formik.values.sbu || isLoadingCategories}
          />
          <SelectField
            className="col-span-1 md:col-span-2"
            name="client"
            placeholder="Client Name *"
            options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
            onChange={(v) => formik.setFieldValue('client', v)}
            searchable
            disabled={!formik.values.client_category}
          />
          <SelectField
            className="col-span-1 md:col-span-2"
            name="nttn_link_id"
            placeholder="Work Order Link ID *"
            options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_work_order_id }))}
            onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
            searchable
            disabled={!formik.values.client}
          />
        </FormSection>

        {/* ── Shifting BW input + Shifting Amount display ── */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
          {/* Shifting BW input (upper panel) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Shifting BW (MB)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter BW to shift"
              value={formik.values.upper_shifting_bw}
              onChange={(e) => {
                const val = e.target.value;
                formik.setFieldValue('upper_shifting_bw', val);
              }}
            />
          </div>

          {/* Shifting Amount display = upper_shifting_bw × unit_rate */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Shifting Amount (BW × Unit Rate)
            </label>
            <input
              type="text"
              readOnly
              className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
              placeholder="Auto-calculated"
              value={formik.values.shifting_amount_display || ''}
            />
            {formik.values.upper_shifting_bw && shiftingSourceRates ? (
              <p className="text-xs text-gray-400 mt-0.5">
                {formik.values.upper_shifting_bw} &times; {shiftingSourceRates} (Unit Price) ={' '}
                {formik.values.shifting_amount_display}
              </p>
            ) : formik.values.upper_shifting_bw && !shiftingSourceRates ? (
              <p className="text-xs text-orange-400 mt-0.5">Select a Work Order Link ID first to get Unit Price</p>
            ) : null}
          </div>

          {/* Spacer columns */}
          <div />
          <div />
        </div>

        {/* ── Info Panel ── */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 justify-items-center items-start gap-4 text-sm">

            {/* Capacity Cost */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity Cost:</strong>{' '}
                {formik.values.capacity_cost || '0.00'}
              </p>
            </div>

            {/* Capacity */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity:</strong>{' '}
                {formik.values.capacity || 'N/A'}
              </p>
            </div>

            {/* Unit Price */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Unit Price:</strong>{' '}
                {shiftingSourceRates || '0.00'}
              </p>
            </div>

            {/* Link Type */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Link Type:</strong>{' '}
                {printLinkTypeName || 'N/A'}
              </p>
            </div>

            {/* After Shifting Cost */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shifting Cost:</strong>{' '}
                {formik.values.total_shifting_cost || 'N/A'}
              </p>
            </div>

            {/* After Shifting Capacity */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shifting Capacity:</strong>{' '}
                {formik.values.after_shifting_capacity || 'N/A'}
              </p>
            </div>

            {/* After Shifting Unit Rate */}
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shifting Unit Rate:</strong>{' '}
                {afterShiftingUnitRate ? afterShiftingUnitRate.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Shifting Target */}
        <FormSection title="Shifting Target">
          {/* Row 1: Link Type / Shifting Client Category / Name / Work Order Link ID */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            {/*
              Link Type — provides link_type_id for the shifting work order fetch.
              When changed, clear downstream shifting selections.
            */}
            <SelectField
              name="link_type"
              placeholder="Link Type *"
              options={linkTypeOptions.map((p) => ({ value: p.id, label: p.type_name }))}
              onChange={(v) => {
                formik.setFieldValue('link_type', v);
                // Clear shifting work order and derived values since link_type_id changed
                formik.setFieldValue('shifting_link_id', '');
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                setShiftingClientLinkIds([]);
                setShiftingWorkOrderDetailsData([]);
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
              }}
              searchable
            />

            {/*
              Shifting Client Category — provides cat_id for the shifting work order fetch.
            */}
            <SelectField
              name="shifting_client_category"
              placeholder="Shifting Client Category *"
              options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
              onChange={(v) => {
                formik.setFieldValue('shifting_client_category', v);
                formik.setFieldValue('shifting_client', '');
                formik.setFieldValue('shifting_link_id', '');
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
              }}
              searchable
            />

            {/*
              Shifting Client Name — provides client_id for the shifting work order fetch.
              Work orders are fetched once both shifting_client and shifting_client_category are set,
              using also link_type_id (link_type) and nttn_id (nttn_provider) from source.
            */}
            <SelectField
              name="shifting_client"
              placeholder="Shifting Client Name *"
              options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
              onChange={(v) => {
                formik.setFieldValue('shifting_client', v);
                formik.setFieldValue('shifting_link_id', '');
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
              }}
              searchable
              disabled={!formik.values.shifting_client_category}
            />

            {/*
              Shifting Work Order Link ID — fetched using:
                link_type_id = formik.values.link_type
                cat_id       = formik.values.shifting_client_category
                client_id    = formik.values.shifting_client
                nttn_id      = formik.values.nttn_provider  (same as source)
              On selection, sets:
                - Before Shifting Capacity (request_capacity)
                - Unit Rate for Shifting Amount (rate)
            */}
            <SelectField
              name="shifting_link_id"
              placeholder="Shifting Work Order Link ID"
              options={shiftingClientLinkIds.map((nttn) => ({
                value: nttn.id,
                label: nttn.nttn_work_order_id,
              }))}
              onChange={(v) => {
                // Clear previous calculations before new selection
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                formik.setFieldValue('shifting_unit_price_dropdown', '');
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
                setShowShiftingDropdown(false);
                formik.setFieldValue('shifting_link_id', v);
              }}
              searchable
              isClearable
              disabled={!formik.values.shifting_client}
            />
          </div>

          {/* Row 2: Before Shifting Capacity / Before Shifting Amount / Shifting BW / Shifting Amount / Unit Cost / After-Shifting Capacity / After Shifting Amount */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-7 gap-x-6 gap-y-4">
            {/* Before Shifting Capacity = request_capacity from the selected shifting work order */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Before Shifting Capacity
              </label>
              <input
                type="number"
                readOnly
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-filled on Work Order select"
                value={shiftingWorkOrderRequestCapacity || ''}
              />
              <p className="text-xs text-gray-400 mt-0.5">Work order's request_capacity</p>
            </div>

            {/* Before Shifting Amount = request_capacity × rate */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Before Shifting Amount
              </label>
              <input
                type="number"
                readOnly
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={
                  shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate
                    ? (shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)
                    : ''
                }
              />
              {shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {shiftingWorkOrderRequestCapacity} &times; {shiftingWorkOrderRate} ={' '}
                  {(shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">request_capacity × rate</p>
              )}
            </div>

            {/* Shifting BW — shows adjusted ceil value when Adjusted Amount is entered */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Shifting BW *
              </label>
              <input
                type="number"
                readOnly
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-filled"
                value={(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    return Math.ceil(shiftBW + adj / rate);
                  }
                  return shiftBW ? Math.ceil(shiftBW) : '';
                })()}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                {(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    return `${shiftBW} + (${adj} ÷ ${rate}) = ${Math.ceil(shiftBW + adj / rate)}`;
                  }
                  return 'Auto-filled: Shifting Amount ÷ Unit Rate';
                })()}
              </p>
            </div>

            {/*
              Shifting Amount (lower):
               - If upper_shifting_bw is filled → locked / read-only (mirrors shifting_amount_display)
               - Unit Rate used = work order's rate (shiftingWorkOrderRate)
               - If upper_shifting_bw is NOT filled → editable; user types, then selects rate from dropdown
            */}
            <InputField
              name="shifting_capacity"
              label={`Shifting Amount (BW × ${shiftingWorkOrderRate ? shiftingWorkOrderRate : 'Unit Rate'})`}
              type="number"
              step="0.01"
              disabled={!!formik.values.upper_shifting_bw}
              onChange={(e) => {
                if (formik.values.upper_shifting_bw) return;
                formik.handleChange(e);
                lastEdited.current = 'capacity';
                if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
                  setShowShiftingDropdown(true);
                } else if (e.target.value.trim() === '') {
                  setShowShiftingDropdown(false);
                  formik.setFieldValue('shifting_unit_price_dropdown', '');
                  formik.setFieldValue('shifting_unit_cost', '');
                }
              }}
              help={
                formik.values.upper_shifting_bw
                  ? `Locked — mirrors Shifting Amount (Unit Rate: ${shiftingWorkOrderRate || 'from work order'})`
                  : 'Enter amount manually, then select unit rate from dropdown'
              }
            />

            {/* Unit Cost — auto-filled from work order rate on work order link select */}
            {showShiftingDropdown ? (
              <SelectField
                name="shifting_unit_price_dropdown"
                placeholder="Select Unit Price"
                options={nttnRatesOptions.map((r) => ({
                  label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
                  value: r.id,
                }))}
                onChange={(selectedRateId) => {
                  formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
                  const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
                  if (selectedRate) {
                    formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
                  }
                  lastEdited.current = 'capacity';
                }}
                searchable
              />
            ) : (
              <InputField
                name="shifting_unit_cost"
                label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
                type="number"
                step="0.01"
                disabled
                help="Auto-filled from Work Order rate"
              />
            )}

            {/* Hidden total_shifting_cost */}
            <InputField
              name="total_shifting_cost"
              label="Total Shifting Cost"
              type="number"
              step="0.01"
              className="hidden"
              disabled
            />

            {/* After-Shifting Capacity — shows Adjusted Shifting BW when Adjusted Amount is entered */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                After-Shifting Capacity
              </label>
              <input
                type="number"
                readOnly
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    const adjShiftingBW = Math.ceil(shiftBW + adj / rate);
                    return capacity + adjShiftingBW;
                  }
                  return formik.values.target_total_bw || '';
                })()}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                {(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    const adjShiftingBW = Math.ceil(shiftBW + adj / rate);
                    return `${capacity} + ${adjShiftingBW} = ${capacity + adjShiftingBW}`;
                  }
                  return 'Before Shifting Capacity + Shifting BW';
                })()}
              </p>
            </div>

            {/* After Shifting Amount — shows adjusted value when Adjusted Amount is entered */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                After Shifting Amount
              </label>
              <input
                type="number"
                readOnly
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    const rawAfter = rate * (capacity + shiftBW);
                    return (rawAfter + adj).toFixed(2);
                  }
                  return shiftingWorkOrderRate && formik.values.target_total_bw
                    ? (shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)
                    : '';
                })()}
              />
              {(() => {
                const rate = parseFloat(shiftingWorkOrderRate) || 0;
                const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                const adj = parseFloat(adjustedAmount);
                if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                  const rawAfter = rate * (capacity + shiftBW);
                  return (
                    <p className="text-xs text-blue-500 mt-0.5">
                      {rawAfter.toFixed(2)} + {adj} = {(rawAfter + adj).toFixed(2)}
                    </p>
                  );
                }
                return shiftingWorkOrderRate && formik.values.target_total_bw ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {shiftingWorkOrderRate} &times; {formik.values.target_total_bw} ={' '}
                    {(shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">rate × After Shifting Capacity</p>
                );
              })()}
            </div>

            {/* Adjusted Amount — manually entered; corrects After Shifting Amount
                Formula: Adjusted After Shifting Amount = After Shifting Amount + Adjusted Amount
                         Adjusted Shifting BW           = Adjusted After Shifting Amount / rate
                         After Shifting Capacity        = Before Shifting Capacity + Adjusted Shifting BW */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Adjusted Amount <span className="text-gray-400 font-normal">(manual)</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 8 or -8"
                value={adjustedAmount}
                onChange={(e) => setAdjustedAmount(e.target.value)}
              />
              {adjustedAmount !== '' && shiftingWorkOrderRate && formik.values.target_total_bw ? (() => {
                const rate = parseFloat(shiftingWorkOrderRate) || 0;
                const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                const rawAfter = rate * (capacity + shiftBW);
                const adj = parseFloat(adjustedAmount) || 0;
                const adjAfter = rawAfter + adj;
                return (
                  <p className="text-xs text-blue-500 mt-0.5">
                    {rawAfter.toFixed(2)} + ({adjustedAmount}) = {adjAfter.toFixed(2)}
                  </p>
                );
              })() : (
                <p className="text-xs text-gray-400 mt-0.5">Enter +/- to adjust After Shifting Amount</p>
              )}
            </div>
          </div>



          {/* Row 3: Reason / Date / Remarks */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <SelectField
              name="reason_id"
              placeholder="Shift Reason"
              options={reasonsOptions.map((nttn) => ({ value: nttn.id, label: nttn.reason }))}
              onChange={(v) => formik.setFieldValue('reason_id', v)}
              searchable
              isClearable
            />

            <DatePickerField
              name="submission_date"
              placeholder="Submission Date"
              field={{ name: 'submission_date', value: formik.values.submission_date }}
              form={formik}
            />

            <InputField name="remarks" label="Remarks" type="text" />
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

export default ShiftCapacityForm;