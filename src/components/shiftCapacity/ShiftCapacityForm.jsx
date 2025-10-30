// import React, { useEffect, useState } from "react";
// import { useFormik, FormikProvider } from "formik";
// import { ArrowLeft, Clock, DollarSign } from "lucide-react"; // Imported DollarSign and Clock icons
// import * as Yup from "yup";

// import Button from "../ui/Button";
// import InputField from "../fields/InputField";
// import SelectField from "../fields/SelectField";
// import { shiftCapacitySchema } from "../../validations/shiftCapacityValidation";

// import { fetchNTTNs } from "../../services/nttn";
// import { fetchCategories } from "../../services/category";
// import { fetchClientsCategoryWise } from "../../services/client";
// import { fetchWorkOrders } from "../../services/workOrder";
// import { fetchBandwidthRangesByID } from "../../services/bandwidthRanges";
// import { fetchRatesByID } from "../../services/rate";
// import { createShiftCapacity, updateShiftCapacity } from "../../services/shiftCapacity";
// import { updateWorkOrder } from "../../services/workOrder";

// /* ---------- section wrapper (identical to SurveyForm / BWModificationForm) ---------- */
// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   nttn_provider: "",
//   client_category: "",
//   client: "",
//   nttn_link_id: "",
//   capacity: "",
//   capacity_cost: "",
//   shifting_bw: "",
//   after_shifting_capacity: "",
//   shifting_capacity: "",
//   shifting_client_category: "",
//   shifting_client: "",
//   shifting_unit_cost: "",
//   total_shifting_cost: "",
//   workorder_id: "",
//   vlan: "",
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
//   const [selectedShiftingLinkId, setSelectedShiftingLinkId] = useState("");

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lockedField, setLockedField] = useState(null);
//   const clearLock = () => setLockedField(null);

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
//         setNttnProviders(nttn);
//         setClientCategories(cats);
//         // ✅ FIX: Ensure workOrders is always an array
//         setWorkOrders(Array.isArray(wos) ? wos : wos?.data || []);
//       } catch (e) {
//         showToast?.(e.message || "Failed to load form data", "error");
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
//     if (!formik.values.client_category) {
//       setClients([]);
//       formik.setFieldValue("client", "");
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.client_category)
//       .then(setClients)
//       .catch(() => setClients([]));
//   }, [formik.values.client_category]);

//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue("shifting_client", "");
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then(setShiftingClients)
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   useEffect(() => {
//     // Use a defensive approach to get the workOrders list
//     const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

//     if (!formik.values.client || !list.length) {
//       setNttnLinkIds([]);
//       return;
//     }
//     const clientId = parseInt(formik.values.client);
//     const clientWOs = list.filter((wo) => wo.survey_data?.client_id === clientId);
//     setNttnLinkIds([...new Set(clientWOs.map((wo) => wo.nttn_link_id).filter(Boolean))]);
//   }, [formik.values.client, workOrders]);

//   useEffect(() => {
//     // Use a defensive approach to get the workOrders list
//     const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

//     if (!formik.values.shifting_client || !list.length) {
//       setShiftingClientLinkIds([]);
//       return;
//     }
//     const clientId = parseInt(formik.values.shifting_client);
//     const clientWOs = list.filter((wo) => wo.survey_data?.client_id === clientId);
//     const links = [...new Set(clientWOs.map((wo) => wo.nttn_link_id).filter(Boolean))];
//     setShiftingClientLinkIds(links);
//     if (links.length && !selectedShiftingLinkId) setSelectedShiftingLinkId(links[0]);
//   }, [formik.values.shifting_client, workOrders, selectedShiftingLinkId]);

//   /* ---------- auto-fill current capacity & cost ---------- */
//   useEffect(() => {
//     const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

//     if (!formik.values.nttn_link_id || !list.length) {
//       formik.setFieldValue("capacity", "");
//       formik.setFieldValue("capacity_cost", "");
//       formik.setFieldValue("workorder_id", "");
//       return;
//     }
//     const wo = list.find((w) => w.nttn_link_id === formik.values.nttn_link_id);
//     if (wo) {
//       formik.setFieldValue("capacity", wo.request_capacity || 0);
//       formik.setFieldValue("capacity_cost", wo.total_cost_of_request_capacity || 0);
//       formik.setFieldValue("workorder_id", wo.id);
//     }
//   }, [formik.values.nttn_link_id, workOrders]);

//   /* ---------- locking & amount / bw cross-calc ---------- */
//   const unitRateFromCurrent = () => {
//     const cap = parseFloat(formik.values.capacity);
//     const cost = parseFloat(formik.values.capacity_cost);
//     if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
//     return cost / cap;
//   };

//   useEffect(() => {
//     if (lockedField === "amount") return;
//     const bw = parseFloat(formik.values.shifting_bw);
//     if (!formik.values.nttn_provider || !bw || !bandwidthRanges.length) {
//       formik.setFieldValue("shifting_unit_cost", "");
//       return;
//     }
//     setIsLoadingRates(true);
//     (async () => {
//       try {
//         const range = bandwidthRanges.find(
//           (r) => bw >= parseFloat(r.range_from) && bw <= parseFloat(r.range_to)
//         );
//         if (!range) return;
//         const rates = await fetchRatesByID(parseInt(formik.values.nttn_provider), range.id);
//         const active = rates.find(
//           (rt) =>
//             rt.continue_field &&
//             rt.status === 1 &&
//             new Date(rt.effective_from) <= new Date() &&
//             new Date(rt.effective_to) >= new Date()
//         );
//         formik.setFieldValue("shifting_unit_cost", active ? parseFloat(active.rate) : "");
//       } catch {
//         formik.setFieldValue("shifting_unit_cost", "");
//       } finally {
//         setIsLoadingRates(false);
//       }
//     })();
//   }, [formik.values.nttn_provider, formik.values.shifting_bw, bandwidthRanges, lockedField]);

//   useEffect(() => {
//     if (lockedField === "amount") return;
//     const bw = parseFloat(formik.values.shifting_bw);
//     const rate = parseFloat(formik.values.shifting_unit_cost);
//     if (isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
//       formik.setFieldValue("shifting_capacity", (bw * rate).toFixed(2));
//     } else if (lockedField !== "amount") {
//       formik.setFieldValue("shifting_capacity", "");
//     }
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField]);

//   useEffect(() => {
//     if (lockedField !== "amount") return;
//     const amount = parseFloat(formik.values.shifting_capacity);
//     const rate = unitRateFromCurrent();
//     if (isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
//       formik.setFieldValue("shifting_bw", (amount / rate).toFixed(2));
//       formik.setFieldValue("shifting_unit_cost", rate.toFixed(2));
//     } else {
//       formik.setFieldValue("shifting_bw", "");
//       formik.setFieldValue("shifting_unit_cost", rate > 0 ? rate.toFixed(2) : "");
//     }
//   }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost, lockedField]);

//   /* ---------- derived fields ---------- */
//   useEffect(() => {
//     const current = parseFloat(formik.values.capacity) || 0;
//     const shifting = parseFloat(formik.values.shifting_bw) || 0;
//     formik.setFieldValue("after_shifting_capacity", (current - shifting).toFixed(2));
//   }, [formik.values.capacity, formik.values.shifting_bw]);

//   useEffect(() => {
//     const amt = parseFloat(formik.values.shifting_capacity) || 0;
//     formik.setFieldValue("total_shifting_cost", amt.toFixed(2));
//   }, [formik.values.shifting_capacity]);

//   /* ---------- submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         workorder: values.workorder_id,
//         nttn_provider: values.nttn_provider,
//         client_category: values.client_category,
//         client: values.client,
//         shifting_client_category: values.shifting_client_category,
//         shifting_client: values.shifting_client,
//         nttn_link_id: values.nttn_link_id,
//         capacity: parseFloat(values.capacity) || 0,
//         capacity_cost: parseFloat(values.capacity_cost) || 0,
//         shifting_bw: parseFloat(values.shifting_bw) || 0,
//         after_shifting_capacity: parseFloat(values.after_shifting_capacity) || 0,
//         shifting_capacity: parseFloat(values.shifting_capacity) || 0,
//         shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
//         total_shifting_cost: parseFloat(values.total_shifting_cost) || 0,
//         vlan: values.vlan,
//       };

//       let res;
//       if (isEditMode) {
//         res = await updateShiftCapacity(values.id, payload);
//         showToast?.("Capacity shift updated!", "success");
//       } else {
//         res = await createShiftCapacity(payload);
//         showToast?.("Capacity shift created!", "success");
//       }

//       /* update linked work-orders (same logic you had) */
//       if (values.workorder_id) {
//         try {
//           const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];
//           const wo = list.find((w) => w.id === parseInt(values.workorder_id));
//           if (wo) {
//             const newBW = parseFloat(values.after_shifting_capacity) || 0;
//             const newUnit = parseFloat(values.shifting_unit_cost) || unitRateFromCurrent();
//             await updateWorkOrder(wo.id, {
//               ...wo,
//               request_capacity: newBW,
//               unit_rate: newUnit,
//               total_cost_of_request_capacity: (newBW * newUnit).toFixed(2),
//             });
//           }
//         } catch (e) {
//           console.error("Work-order update failed:", e);
//         }
//       }

//       resetForm();
//       onCancel(); // close form
//     } catch (e) {
//       showToast?.(e.message || "Save failed", "error");
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

//   return (
//     <FormikProvider value={formik}>
//       <form
//         onSubmit={formik.handleSubmit}
//         className="p-8 bg-gray-100 min-h-screen space-y-6"
//       >
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
//               {isEditMode ? "Edit Capacity Shift" : "Add Capacity Shift"}
//             </h1>
//             <p className="text-gray-500">
//               Fill in the details to {isEditMode ? "update" : "add a new"} capacity-shift record.
//             </p>
//           </div>
//         </div>

//         {/* Shifting Source */}
//         <FormSection title="Shifting Source">
//           <SelectField
//             name="nttn_provider"
//             placeholder="NTTN Provider *"
//             options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
//             onChange={(v) => formik.setFieldValue("nttn_provider", v)}
//             searchable
//           />
//           <SelectField
//             name="client_category"
//             placeholder="Client Category *"
//             options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//             onChange={(v) => {
//               formik.setFieldValue("client_category", v);
//               formik.setFieldValue("client", "");
//             }}
//             searchable
//             disabled={!formik.values.nttn_provider}
//           />
//           <SelectField
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
//             onChange={(v) => formik.setFieldValue("client", v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             name="nttn_link_id"
//             placeholder="NTTN Link ID *"
//             options={nttnLinkIds.map((id) => ({ value: id, label: id }))}
//             onChange={(v) => formik.setFieldValue("nttn_link_id", v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 ">
//           <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-center items-center gap-4 text-sm">
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{" "}
//                 {formik.values.capacity || "N/A"}
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{" "}
//                 {formik.values.capacity_cost || "N/A"}
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
//               options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue("shifting_client_category", v);
//                 formik.setFieldValue("shifting_client", "");
//               }}
//               searchable
//             />
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
//               onChange={(v) => formik.setFieldValue("shifting_client", v)}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Client Link ID"
//               options={shiftingClientLinkIds.map((id) => ({ value: id, label: id }))}
//               onChange={(v) => formik.setFieldValue("shifting_link_id", v)}
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
//               disabled={lockedField === "amount"}
//               onBlur={() => lockedField !== "amount" && setLockedField("bw")}
//             />
//             <InputField
//               name="shifting_capacity"
//               label="Shifting Amount *"
//               type="number"
//               step="0.01"
//               disabled={lockedField === "bw"}
//               onBlur={() => lockedField !== "bw" && setLockedField("amount")}
//             />
//             <InputField
//               name="shifting_unit_cost"
//               label={`Unit Cost ${isLoadingRates ? "(Loading...)" : ""}`}
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
//           <InputField name="vlan" label="VLAN" />
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

// import React, { useEffect, useState } from "react";
// import { useFormik, FormikProvider } from "formik";
// import { ArrowLeft, Clock, DollarSign } from "lucide-react"; // Imported DollarSign and Clock icons
// import * as Yup from "yup";

// import Button from "../ui/Button";
// import InputField from "../fields/InputField";
// import SelectField from "../fields/SelectField";
// import { shiftCapacitySchema } from "../../validations/shiftCapacityValidation";

// import { fetchNTTNs } from "../../services/nttn";
// import { fetchCategories } from "../../services/category";
// import { fetchClientsCategoryWise } from "../../services/client";
// import { fetchWorkOrders } from "../../services/workOrder";
// import { fetchBandwidthRangesByID } from "../../services/bandwidthRanges";
// import { fetchRatesByID } from "../../services/rate";
// import { createShiftCapacity, updateShiftCapacity } from "../../services/shiftCapacity";
// import { updateWorkOrder } from "../../services/workOrder";

// /* ---------- section wrapper (identical to SurveyForm / BWModificationForm) ---------- */
// const FormSection = ({ title, children }) => (
//   <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
//     <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
//   </fieldset>
// );

// /* ---------- empty shape ---------- */
// const emptyValues = {
//   nttn_provider: "",
//   client_category: "",
//   client: "",
//   nttn_link_id: "",
//   capacity: "",
//   capacity_cost: "",
//   shifting_bw: "",
//   after_shifting_capacity: "",
//   shifting_capacity: "",
//   shifting_client_category: "",
//   shifting_client: "",
//   shifting_unit_cost: "",
//   total_shifting_cost: "",
//   workorder_id: "",
//   vlan: "",
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
//   const [selectedShiftingLinkId, setSelectedShiftingLinkId] = useState("");

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRates, setIsLoadingRates] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [lockedField, setLockedField] = useState(null);

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
//         setNttnProviders(nttn);
//         setClientCategories(cats);
//         // ✅ FIX: Ensure workOrders is always an array
//         setWorkOrders(Array.isArray(wos) ? wos : wos?.data || []);
//       } catch (e) {
//         showToast?.(e.message || "Failed to load form data", "error");
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
//     if (!formik.values.client_category) {
//       setClients([]);
//       formik.setFieldValue("client", "");
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.client_category)
//       .then(setClients)
//       .catch(() => setClients([]));
//   }, [formik.values.client_category]);

//   useEffect(() => {
//     if (!formik.values.shifting_client_category) {
//       setShiftingClients([]);
//       formik.setFieldValue("shifting_client", "");
//       return;
//     }
//     fetchClientsCategoryWise(formik.values.shifting_client_category)
//       .then(setShiftingClients)
//       .catch(() => setShiftingClients([]));
//   }, [formik.values.shifting_client_category]);

//   useEffect(() => {
//     // Use a defensive approach to get the workOrders list
//     const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

//     if (!formik.values.client || !list.length) {
//       setNttnLinkIds([]);
//       return;
//     }
//     const clientId = parseInt(formik.values.client);
//     const clientWOs = list.filter((wo) => wo.survey_data?.client_id === clientId);
//     setNttnLinkIds([...new Set(clientWOs.map((wo) => wo.nttn_link_id).filter(Boolean))]);
//   }, [formik.values.client, workOrders]);

//   useEffect(() => {
//     // Use a defensive approach to get the workOrders list
//     const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

//     if (!formik.values.shifting_client || !list.length) {
//       setShiftingClientLinkIds([]);
//       return;
//     }
//     const clientId = parseInt(formik.values.shifting_client);
//     const clientWOs = list.filter((wo) => wo.survey_data?.client_id === clientId);
//     const links = [...new Set(clientWOs.map((wo) => wo.nttn_link_id).filter(Boolean))];
//     setShiftingClientLinkIds(links);
//     if (links.length && !selectedShiftingLinkId) setSelectedShiftingLinkId(links[0]);
//   }, [formik.values.shifting_client, workOrders, selectedShiftingLinkId]);

//   /* ---------- auto-fill current capacity & cost ---------- */
//   useEffect(() => {
//     const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

//     if (!formik.values.nttn_link_id || !list.length) {
//       formik.setFieldValue("capacity", "");
//       formik.setFieldValue("capacity_cost", "");
//       formik.setFieldValue("workorder_id", "");
//       return;
//     }
//     const wo = list.find((w) => w.nttn_link_id === formik.values.nttn_link_id);
//     if (wo) {
//       formik.setFieldValue("capacity", wo.request_capacity || 0);
//       formik.setFieldValue("capacity_cost", wo.total_cost_of_request_capacity || 0);
//       formik.setFieldValue("workorder_id", wo.id);
//     }
//   }, [formik.values.nttn_link_id, workOrders]);

//   /* ---------- locking & amount / bw cross-calc ---------- */
//   const unitRateFromCurrent = () => {
//     const cap = parseFloat(formik.values.capacity);
//     const cost = parseFloat(formik.values.capacity_cost);
//     if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
//     return cost / cap;
//   };

//   useEffect(() => {
//     if (lockedField === "amount") return;
//     const bw = parseFloat(formik.values.shifting_bw);
//     if (!formik.values.nttn_provider || !bw || !bandwidthRanges.length) {
//       formik.setFieldValue("shifting_unit_cost", "");
//       return;
//     }
//     setIsLoadingRates(true);
//     (async () => {
//       try {
//         const range = bandwidthRanges.find(
//           (r) => bw >= parseFloat(r.range_from) && bw <= parseFloat(r.range_to)
//         );
//         if (!range) return;
//         const rates = await fetchRatesByID(parseInt(formik.values.nttn_provider), range.id);
//         const active = rates.find(
//           (rt) =>
//             rt.continue_field &&
//             rt.status === 1 &&
//             new Date(rt.effective_from) <= new Date() &&
//             new Date(rt.effective_to) >= new Date()
//         );
//         formik.setFieldValue("shifting_unit_cost", active ? parseFloat(active.rate) : "");
//       } catch {
//         formik.setFieldValue("shifting_unit_cost", "");
//       } finally {
//         setIsLoadingRates(false);
//       }
//     })();
//   }, [formik.values.nttn_provider, formik.values.shifting_bw, bandwidthRanges, lockedField]);

//   useEffect(() => {
//     if (lockedField === "amount") return;
//     const bw = parseFloat(formik.values.shifting_bw);
//     const rate = parseFloat(formik.values.shifting_unit_cost);
    
//     // If BW is cleared, reset lock and clear shifting_capacity
//     if (!formik.values.shifting_bw || formik.values.shifting_bw === "") {
//       setLockedField(null);
//       formik.setFieldValue("shifting_capacity", "");
//       return;
//     }
    
//     if (isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
//       formik.setFieldValue("shifting_capacity", (bw * rate).toFixed(2));
//     } else if (lockedField !== "amount") {
//       formik.setFieldValue("shifting_capacity", "");
//     }
//   }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField]);

//   useEffect(() => {
//     if (lockedField !== "amount") return;
//     const amount = parseFloat(formik.values.shifting_capacity);
//     const rate = unitRateFromCurrent();
    
//     // If amount is cleared, reset lock and clear shifting_bw
//     if (!formik.values.shifting_capacity || formik.values.shifting_capacity === "") {
//       setLockedField(null);
//       formik.setFieldValue("shifting_bw", "");
//       formik.setFieldValue("shifting_unit_cost", rate > 0 ? rate.toFixed(2) : "");
//       return;
//     }
    
//     if (isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
//       formik.setFieldValue("shifting_bw", (amount / rate).toFixed(2));
//       formik.setFieldValue("shifting_unit_cost", rate.toFixed(2));
//     } else {
//       formik.setFieldValue("shifting_bw", "");
//       formik.setFieldValue("shifting_unit_cost", rate > 0 ? rate.toFixed(2) : "");
//     }
//   }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost, lockedField]);

//   /* ---------- derived fields ---------- */
//   useEffect(() => {
//     const current = parseFloat(formik.values.capacity) || 0;
//     const shifting = parseFloat(formik.values.shifting_bw) || 0;
//     formik.setFieldValue("after_shifting_capacity", (current - shifting).toFixed(2));
//   }, [formik.values.capacity, formik.values.shifting_bw]);

//   useEffect(() => {
//     const amt = parseFloat(formik.values.shifting_capacity) || 0;
//     formik.setFieldValue("total_shifting_cost", amt.toFixed(2));
//   }, [formik.values.shifting_capacity]);

//   /* ---------- submit ---------- */
//   const handleSave = async (values, resetForm) => {
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         workorder: values.workorder_id,
//         nttn_provider: values.nttn_provider,
//         client_category: values.client_category,
//         client: values.client,
//         shifting_client_category: values.shifting_client_category,
//         shifting_client: values.shifting_client,
//         nttn_link_id: values.nttn_link_id,
//         capacity: parseFloat(values.capacity) || 0,
//         capacity_cost: parseFloat(values.capacity_cost) || 0,
//         shifting_bw: parseFloat(values.shifting_bw) || 0,
//         after_shifting_capacity: parseFloat(values.after_shifting_capacity) || 0,
//         shifting_capacity: parseFloat(values.shifting_capacity) || 0,
//         shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
//         total_shifting_cost: parseFloat(values.total_shifting_cost) || 0,
//         vlan: values.vlan,
//       };

//       let res;
//       if (isEditMode) {
//         res = await updateShiftCapacity(values.id, payload);
//         showToast?.("Capacity shift updated!", "success");
//       } else {
//         res = await createShiftCapacity(payload);
//         showToast?.("Capacity shift created!", "success");
//       }

//       /* update linked work-orders (same logic you had) */
//       if (values.workorder_id) {
//         try {
//           const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];
//           const wo = list.find((w) => w.id === parseInt(values.workorder_id));
//           if (wo) {
//             const newBW = parseFloat(values.after_shifting_capacity) || 0;
//             const newUnit = parseFloat(values.shifting_unit_cost) || unitRateFromCurrent();
//             await updateWorkOrder(wo.id, {
//               ...wo,
//               request_capacity: newBW,
//               unit_rate: newUnit,
//               total_cost_of_request_capacity: (newBW * newUnit).toFixed(2),
//             });
//           }
//         } catch (e) {
//           console.error("Work-order update failed:", e);
//         }
//       }

//       resetForm();
//       onCancel(); // close form
//     } catch (e) {
//       showToast?.(e.message || "Save failed", "error");
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

//   return (
//     <FormikProvider value={formik}>
//       <form
//         onSubmit={formik.handleSubmit}
//         className="p-8 bg-gray-100 min-h-screen space-y-6"
//       >
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
//               {isEditMode ? "Edit Capacity Shift" : "Add Capacity Shift"}
//             </h1>
//             <p className="text-gray-500">
//               Fill in the details to {isEditMode ? "update" : "add a new"} capacity-shift record.
//             </p>
//           </div>
//         </div>

//         {/* Shifting Source */}
//         <FormSection title="Shifting Source">
//           <SelectField
//             name="nttn_provider"
//             placeholder="NTTN Provider *"
//             options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
//             onChange={(v) => formik.setFieldValue("nttn_provider", v)}
//             searchable
//           />
//           <SelectField
//             name="client_category"
//             placeholder="Client Category *"
//             options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//             onChange={(v) => {
//               formik.setFieldValue("client_category", v);
//               formik.setFieldValue("client", "");
//             }}
//             searchable
//             disabled={!formik.values.nttn_provider}
//           />
//           <SelectField
//             name="client"
//             placeholder="Client Name *"
//             options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
//             onChange={(v) => formik.setFieldValue("client", v)}
//             searchable
//             disabled={!formik.values.client_category}
//           />
//           <SelectField
//             name="nttn_link_id"
//             placeholder="NTTN Link ID *"
//             options={nttnLinkIds.map((id) => ({ value: id, label: id }))}
//             onChange={(v) => formik.setFieldValue("nttn_link_id", v)}
//             searchable
//             disabled={!formik.values.client}
//           />
//         </FormSection>
//         <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 ">
//           <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-center items-center gap-4 text-sm">
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity:</strong>{" "}
//                 {formik.values.capacity || "N/A"}
//               </p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <p>
//                 <strong className="text-gray-800">Capacity Cost:</strong>{" "}
//                 {formik.values.capacity_cost || "N/A"}
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
//               options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
//               onChange={(v) => {
//                 formik.setFieldValue("shifting_client_category", v);
//                 formik.setFieldValue("shifting_client", "");
//               }}
//               searchable
//             />
//             <SelectField
//               name="shifting_client"
//               placeholder="Shifting Client Name *"
//               options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
//               onChange={(v) => formik.setFieldValue("shifting_client", v)}
//               searchable
//               disabled={!formik.values.shifting_client_category}
//             />
//             <SelectField
//               name="shifting_link_id"
//               placeholder="Shifting Client Link ID"
//               options={shiftingClientLinkIds.map((id) => ({ value: id, label: id }))}
//               onChange={(v) => formik.setFieldValue("shifting_link_id", v)}
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
//               disabled={lockedField === "amount"}
//               onBlur={() => lockedField !== "amount" && setLockedField("bw")}
//             />
//             <InputField
//               name="shifting_capacity"
//               label="Shifting Amount *"
//               type="number"
//               step="0.01"
//               disabled={lockedField === "bw"}
//               onBlur={() => lockedField !== "bw" && setLockedField("amount")}
//             />
//             <InputField
//               name="shifting_unit_cost"
//               label={`Unit Cost ${isLoadingRates ? "(Loading...)" : ""}`}
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
//           <InputField name="vlan" label="VLAN" />
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


//CLAUDE CODE IS ABOVE AND GEMINI CODE IS BELOW
import React, { useEffect, useState, useRef } from "react"; 
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft, Clock, DollarSign } from "lucide-react"; 
import * as Yup from "yup";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { shiftCapacitySchema } from "../../validations/shiftCapacityValidation";

import { fetchNTTNs } from "../../services/nttn";
import { fetchCategories } from "../../services/category";
import { fetchClientsCategoryWise } from "../../services/client";
import { fetchWorkOrders } from "../../services/workOrder";
import { fetchBandwidthRangesByID } from "../../services/bandwidthRanges";
import { fetchRatesByID } from "../../services/rate";
import { createShiftCapacity, updateShiftCapacity } from "../../services/shiftCapacity";
import { updateWorkOrder } from "../../services/workOrder";

/* ---------- section wrapper (identical to SurveyForm / BWModificationForm) ---------- */

const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- empty shape ---------- */
const emptyValues = {
  nttn_provider: "",
  client_category: "",
  client: "",
  nttn_link_id: "",
  capacity: "",
  capacity_cost: "",
  shifting_bw: "",
  after_shifting_capacity: "",
  shifting_capacity: "",
  shifting_client_category: "",
  shifting_client: "",
  shifting_unit_cost: "",
  total_shifting_cost: "",
  workorder_id: "",
  vlan: "",
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
  const [selectedShiftingLinkId, setSelectedShiftingLinkId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastEdited = useRef(null);   // 'bw' | 'amount' | null

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
        setNttnProviders(nttn);
        setClientCategories(cats);
        // ✅ FIX: Ensure workOrders is always an array
        setWorkOrders(Array.isArray(wos) ? wos : wos?.data || []);
      } catch (e) {
        showToast?.(e.message || "Failed to load form data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- cascading selects ---------- */
  useEffect(() => {
    if (!formik.values.nttn_provider) return;
    fetchBandwidthRangesByID(parseInt(formik.values.nttn_provider))
      .then(setBandwidthRanges)
      .catch(() => setBandwidthRanges([]));
  }, [formik.values.nttn_provider]);

  useEffect(() => {
    if (!formik.values.client_category) {
      setClients([]);
      formik.setFieldValue("client", "");
      return;
    }
    fetchClientsCategoryWise(formik.values.client_category)
      .then(setClients)
      .catch(() => setClients([]));
  }, [formik.values.client_category]);

  useEffect(() => {
    if (!formik.values.shifting_client_category) {
      setShiftingClients([]);
      formik.setFieldValue("shifting_client", "");
      return;
    }
    fetchClientsCategoryWise(formik.values.shifting_client_category)
      .then(setShiftingClients)
      .catch(() => setShiftingClients([]));
  }, [formik.values.shifting_client_category]);

  useEffect(() => {
    // Use a defensive approach to get the workOrders list
    const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

    if (!formik.values.client || !list.length) {
      setNttnLinkIds([]);
      return;
    }
    const clientId = parseInt(formik.values.client);
    const clientWOs = list.filter((wo) => wo.survey_data?.client_id === clientId);
    setNttnLinkIds([...new Set(clientWOs.map((wo) => wo.nttn_link_id).filter(Boolean))]);
  }, [formik.values.client, workOrders]);

  useEffect(() => {
    // Use a defensive approach to get the workOrders list
    const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

    if (!formik.values.shifting_client || !list.length) {
      setShiftingClientLinkIds([]);
      return;
    }
    const clientId = parseInt(formik.values.shifting_client);
    const clientWOs = list.filter((wo) => wo.survey_data?.client_id === clientId);
    const links = [...new Set(clientWOs.map((wo) => wo.nttn_link_id).filter(Boolean))];
    setShiftingClientLinkIds(links);
    if (links.length && !selectedShiftingLinkId) setSelectedShiftingLinkId(links[0]);
  }, [formik.values.shifting_client, workOrders, selectedShiftingLinkId]);

  /* ---------- auto-fill current capacity & cost ---------- */
  useEffect(() => {
    const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

    if (!formik.values.nttn_link_id || !list.length) {
      formik.setFieldValue("capacity", "");
      formik.setFieldValue("capacity_cost", "");
      formik.setFieldValue("workorder_id", "");
      return;
    }
    const wo = list.find((w) => w.nttn_link_id === formik.values.nttn_link_id);
    if (wo) {
      formik.setFieldValue("capacity", wo.request_capacity || 0);
      formik.setFieldValue("capacity_cost", wo.total_cost_of_request_capacity || 0);
      formik.setFieldValue("workorder_id", wo.id);
    }
  }, [formik.values.nttn_link_id, workOrders]);

  /* ---------- locking & amount / bw cross-calc ---------- */
  const unitRateFromCurrent = () => {
    const cap = parseFloat(formik.values.capacity);
    const cost = parseFloat(formik.values.capacity_cost);
    if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
    return cost / cap;
  };

  useEffect(() => {
    if (lastEdited.current === 'amount') return; 
    const bw = parseFloat(formik.values.shifting_bw);
    if (!formik.values.nttn_provider || !bw || !bandwidthRanges.length) {
      formik.setFieldValue("shifting_unit_cost", "");
      return;
    }
    setIsLoadingRates(true);
    (async () => {
      try {
        const range = bandwidthRanges.find(
          (r) => bw >= parseFloat(r.range_from) && bw <= parseFloat(r.range_to)
        );
        if (!range) return;
        const rates = await fetchRatesByID(parseInt(formik.values.nttn_provider), range.id);
        const active = rates.find(
          (rt) =>
            rt.continue_field &&
            rt.status === 1 &&
            new Date(rt.effective_from) <= new Date() &&
            new Date(rt.effective_to) >= new Date()
        );
        formik.setFieldValue("shifting_unit_cost", active ? parseFloat(active.rate) : "");
      } catch {
        formik.setFieldValue("shifting_unit_cost", "");
      } finally {
        setIsLoadingRates(false);
      }
    })();
  }, [formik.values.nttn_provider, formik.values.shifting_bw, bandwidthRanges]);

  useEffect(() => {
    if (lastEdited.current === 'amount') return; 
    const bw = parseFloat(formik.values.shifting_bw);
    const rate = parseFloat(formik.values.shifting_unit_cost);
    if (isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
      formik.setFieldValue("shifting_capacity", (bw * rate).toFixed(2));
    } else if (lastEdited.current !== 'amount') {
      formik.setFieldValue("shifting_capacity", "");
    }
  }, [formik.values.shifting_bw, formik.values.shifting_unit_cost]);

  useEffect(() => {
    if (lastEdited.current !== 'amount') return; 
    const amount = parseFloat(formik.values.shifting_capacity);
    const rate = unitRateFromCurrent();
    if (isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
      formik.setFieldValue("shifting_bw", (amount / rate).toFixed(2));
      formik.setFieldValue("shifting_unit_cost", rate.toFixed(2));
    } else {
      formik.setFieldValue("shifting_bw", "");
      formik.setFieldValue("shifting_unit_cost", rate > 0 ? rate.toFixed(2) : "");
    }
  }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost]);

  /* ---------- derived fields ---------- */
  useEffect(() => {
    const current = parseFloat(formik.values.capacity) || 0;
    const shifting = parseFloat(formik.values.shifting_bw) || 0;
    formik.setFieldValue("after_shifting_capacity", (current - shifting).toFixed(2));
  }, [formik.values.capacity, formik.values.shifting_bw]);

  useEffect(() => {
    const amt = parseFloat(formik.values.shifting_capacity) || 0;
    formik.setFieldValue("total_shifting_cost", amt.toFixed(2));
  }, [formik.values.shifting_capacity]);

  /* ---------- submit ---------- */
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        workorder: values.workorder_id,
        nttn_provider: values.nttn_provider,
        client_category: values.client_category,
        client: values.client,
        shifting_client_category: values.shifting_client_category,
        shifting_client: values.shifting_client,
        nttn_link_id: values.nttn_link_id,
        capacity: parseFloat(values.capacity) || 0,
        capacity_cost: parseFloat(values.capacity_cost) || 0,
        shifting_bw: parseFloat(values.shifting_bw) || 0,
        after_shifting_capacity: parseFloat(values.after_shifting_capacity) || 0,
        shifting_capacity: parseFloat(values.shifting_capacity) || 0,
        shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
        total_shifting_cost: parseFloat(values.total_shifting_cost) || 0,
        vlan: values.vlan,
      };

      let res;
      if (isEditMode) {
        res = await updateShiftCapacity(values.id, payload);
        showToast?.("Capacity shift updated!", "success");
      } else {
        res = await createShiftCapacity(payload);
        showToast?.("Capacity shift created!", "success");
      }

      /* update linked work-orders (same logic you had) */
      if (values.workorder_id) {
        try {
          const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];
          const wo = list.find((w) => w.id === parseInt(values.workorder_id));
          if (wo) {
            const newBW = parseFloat(values.after_shifting_capacity) || 0;
            const newUnit = parseFloat(values.shifting_unit_cost) || unitRateFromCurrent();
            await updateWorkOrder(wo.id, {
              ...wo,
              request_capacity: newBW,
              unit_rate: newUnit,
              total_cost_of_request_capacity: (newBW * newUnit).toFixed(2),
            });
          }
        } catch (e) {
          console.error("Work-order update failed:", e);
        }
      }

      resetForm();
      onCancel(); // close form
    } catch (e) {
      showToast?.(e.message || "Save failed", "error");
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

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-gray-100 min-h-screen space-y-6"
      >
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
              {isEditMode ? "Edit Capacity Shift" : "Add Capacity Shift"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? "update" : "add a new"} capacity-shift record.
            </p>
          </div>
        </div>

        {/* Shifting Source */}
        <FormSection title="Shifting Source">
          <SelectField
            name="nttn_provider"
            placeholder="NTTN Provider *"
            options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
            onChange={(v) => formik.setFieldValue("nttn_provider", v)}
            searchable
          />
          <SelectField
            name="client_category"
            placeholder="Client Category *"
            options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
            onChange={(v) => {
              formik.setFieldValue("client_category", v);
              formik.setFieldValue("client", "");
            }}
            searchable
            disabled={!formik.values.nttn_provider}
          />
          <SelectField
            name="client"
            placeholder="Client Name *"
            options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
            onChange={(v) => formik.setFieldValue("client", v)}
            searchable
            disabled={!formik.values.client_category}
          />
          <SelectField
            name="nttn_link_id"
            placeholder="NTTN Link ID *"
            options={nttnLinkIds.map((id) => ({ value: id, label: id }))}
            onChange={(v) => formik.setFieldValue("nttn_link_id", v)}
            searchable
            disabled={!formik.values.client}
          />
        </FormSection>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 ">
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-center items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity:</strong>{" "}
                {formik.values.capacity || "N/A"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity Cost:</strong>{" "}
                {formik.values.capacity_cost || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/* Current Details - Now a styled div */}



        {/* Shifting Target */}
        <FormSection title="Shifting Target">
          {/* ----- 3-in-a-row : Shifting Client Category / Name / Link ID ----- */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <SelectField
              name="shifting_client_category"
              placeholder="Shifting Client Category *"
              options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
              onChange={(v) => {
                formik.setFieldValue("shifting_client_category", v);
                formik.setFieldValue("shifting_client", "");
              }}
              searchable
            />
            <SelectField
              name="shifting_client"
              placeholder="Shifting Client Name *"
              options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
              onChange={(v) => formik.setFieldValue("shifting_client", v)}
              searchable
              disabled={!formik.values.shifting_client_category}
            />
            <SelectField
              name="shifting_link_id"
              placeholder="Shifting Client Link ID"
              options={shiftingClientLinkIds.map((id) => ({ value: id, label: id }))}
              onChange={(v) => formik.setFieldValue("shifting_link_id", v)}
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
              step="0.01"
              disabled={lastEdited.current === 'amount'}
              onChange={(e) => {
                formik.handleChange(e);
                // FIX 1: Reset lastEdited if the field is cleared to re-enable the other
                lastEdited.current = e.target.value ? 'bw' : null;
              }}
            />
            <InputField
              name="shifting_capacity"
              label="Shifting Amount *"
              type="number"
              step="0.01"
              disabled={lastEdited.current === 'bw'}
              onChange={(e) => {
                formik.handleChange(e);
                // FIX 1: Reset lastEdited if the field is cleared to re-enable the other
                lastEdited.current = e.target.value ? 'amount' : null;
              }}
            />
            <InputField
              name="shifting_unit_cost"
              label={`Unit Cost ${isLoadingRates ? "(Loading...)" : ""}`}
              
              type="number"
              step="0.01"
              disabled
            />
            <InputField
              name="total_shifting_cost"
              label="Total Shifting Cost"
              type="number"
              step="0.01"
              disabled
            />
          </div>

          <InputField
            name="after_shifting_capacity"
            label="After-Shifting Capacity"
            type="number"
            step="0.01"
            disabled
          />
          <InputField name="vlan" label="VLAN" />
        </FormSection>

        {/* New Values */}
        {/* <FormSection title="New Values">
        </FormSection> */}

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