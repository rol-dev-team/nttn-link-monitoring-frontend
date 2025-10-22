// import React, { useState, useCallback, useMemo } from "react";
// import { Formik, Form, FieldArray, useFormikContext, Field } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom"; 
// // Assuming these are your custom components/hooks
// import TextInputField from "../components/fields/TextInputField"; 
// import SelectField from "../components/fields/SelectField"; 
// import Button from "../components/ui/Button";
// import { useToast } from "../hooks/useToast"; 
// // Import the DataTable and icons for the new feature
// import DataTable from "../components/table/DataTable";
// import { Trash2, PlusCircle } from "lucide-react";


// // ================================================================
// // MOCK DATA (Unchanged)
// // ================================================================
// const MOCK_NTTN_OPTIONS = [
//     { label: "NTTN-LINK-001", value: "NTTN-LINK-001" },
//     { label: "NTTN-LINK-002 (Test)", value: "NTTN-LINK-002" },
//     { label: "NTTN-LINK-003 (Live)", value: "NTTN-LINK-003" },
// ];

// const MOCK_PARTNER_DATA = {
//     "NTTN-LINK-001": {
//         nttn_provider: "Summit",
//         partner_name: "ABC Entity",
//         sbu: "Race Online",
//         aggregator: "Khaja",
//         business_kam: "XYZ",
//         purchased_capacity: "100 Mb",
//     },
//     "NTTN-LINK-002": {
//         nttn_provider: "Fiber@Home",
//         partner_name: "Beta ISP",
//         sbu: "MetroNet",
//         aggregator: "Rahim",
//         business_kam: "PQR",
//         purchased_capacity: "50 Mb",
//     },
//     "NTTN-LINK-003": {
//         nttn_provider: "Summit",
//         partner_name: "Gamma Telecom",
//         sbu: "Linkup",
//         aggregator: "Karim",
//         business_kam: "LMN",
//         purchased_capacity: "500 Mb",
//     },
// };

// // Valid Mock Data for Auto-Fill
// const MOCK_VALID_VALUES = {
//     nttn_link_id: "NTTN-LINK-001",
//     nttn_vlan: "101", 
//     int_peering_ip: "10.10.10.1/30",
//     ggc_peering_ip: "192.0.2.1/30",
//     fna_peering_ip: "203.0.113.1/30",
//     bdix_peering_ip: "172.16.0.1/30",
//     mcdn_peering_ip: "10.20.20.1/30",
//     asn: "AS65001",
//     nas_ip: "10.10.10.254",
//     nat_ip: "10.10.10.250",
//     int_vlan: "10", 
//     ggn_vlan: "20", 
//     fna_vlan: "30", 
//     bdix_vlan: "40", 
//     mcdn_vlan: "50", 
//     connected_sw_name: "SW-CORE-01",
//     chr_server: "CHR-SERVER-A",
//     sw_port: "Gi1/0/1",
//     nic_no: "NIC-007",
//     drop_devices: [{device_ip: "11", usage_vlan: "11", connected_port: "11"}], // Added one mock device
//     new_device_ip: "",
//     new_usage_vlan: "",
//     new_connected_port: "",
// };

// // ================================================================
// // 1. Validation Schemas (Unchanged)
// // ================================================================
// const DropDeviceSchema = Yup.object().shape({
//     device_ip: Yup.string().max(50).required("IP is required"),
//     usage_vlan: Yup.string().max(50).required("VLAN is required"),
//     connected_port: Yup.string().max(50).required("Port is required"),
// });

// const ActivationPlanSchema = Yup.object().shape({
//     nttn_link_id: Yup.string().required("NTTN Link ID is required"), 
//     nttn_vlan: Yup.string().max(10).required("NTTN VLAN is required"),
//     int_peering_ip: Yup.string().max(50).required("IP is required"),
//     ggc_peering_ip: Yup.string().max(50).required("IP is required"),
//     fna_peering_ip: Yup.string().max(50).required("IP is required"),
//     bdix_peering_ip: Yup.string().max(50).required("IP is required"),
//     mcdn_peering_ip: Yup.string().max(50).required("IP is required"),
//     asn: Yup.string().max(20).required("ASN is required"),
//     nas_ip: Yup.string().max(50).required("IP is required"),
//     nat_ip: Yup.string().max(50).required("NAT IP is required"),
//     int_vlan: Yup.string().max(10).required("VLAN is required"),
//     ggn_vlan: Yup.string().max(10).required("VLAN is required"),
//     fna_vlan: Yup.string().max(10).required("VLAN is required"),
//     bdix_vlan: Yup.string().max(10).required("VLAN is required"),
//     mcdn_vlan: Yup.string().max(10).required("VLAN is required"),
//     connected_sw_name: Yup.string().max(50).required("SW Name is required"),
//     chr_server: Yup.string().max(50).required("Server is required"),
//     sw_port: Yup.string().max(20).required("SW Port is required"),
//     nic_no: Yup.string().max(20).required("NIC No is required"),
//     drop_devices: Yup.array().of(DropDeviceSchema), 
// });

// // ================================================================
// // 2. Initial Values (Unchanged)
// // ================================================================
// const initialFormValues = {
//     nttn_link_id: "",
//     nttn_vlan: "",
//     int_peering_ip: "",
//     ggc_peering_ip: "",
//     fna_peering_ip: "",
//     bdix_peering_ip: "",
//     mcdn_peering_ip: "",
//     asn: "",
//     nas_ip: "",
//     nat_ip: "",
//     int_vlan: "",
//     ggn_vlan: "",
//     fna_vlan: "",
//     bdix_vlan: "",
//     mcdn_vlan: "",
//     connected_sw_name: "",
//     chr_server: "",
//     sw_port: "",
//     nic_no: "",
//     drop_devices: [],
//     // Temp fields for new entry
//     new_device_ip: "",
//     new_usage_vlan: "",
//     new_connected_port: "",
// };


// // ================================================================
// // Helper Components (Unchanged)
// // ================================================================
// const PartnerDetailDisplayField = ({ label, value }) => (
//     <div className="flex flex-col space-y-1">
//         <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
//         <span className="text-base font-semibold text-gray-800">{value || 'N/A'}</span>
//     </div>
// );

// // Helper Component to wrap TextInputField and show Formik error
// const FieldWrapper = ({ name, placeholder, formik }) => (
//     <div className="space-y-1">
//         <TextInputField name={name} placeholder={placeholder} formik={formik} />
//         {formik.touched[name] && formik.errors[name] && (
//             <p className="text-red-500 text-sm ml-1">{formik.errors[name]}</p>
//         )}
//     </div>
// );

// // Diagnostic component to show form state
// const DebugFormikState = () => {
//     const formik = useFormikContext();
//     return (
//         <Button
//             type="button"
//             intent="secondary"
//             size="sm"
//             onClick={() => {
//                 console.log('--- FORMIK DEBUG STATE ---');
//                 console.log('isValid:', formik.isValid);
//                 console.log('Errors:', formik.errors);
//                 console.log('Touched:', formik.touched);
//                 console.log('Values:', JSON.stringify(formik.values, null, 2)); 
//                 console.log('--------------------------');
//             }}
//             className="w-full md:w-auto"
//         >
//             Debug Form State
//         </Button>
//     );
// };

// // Component to fill form with valid mock data
// const FillFormWithMockData = ({ addToast }) => {
//     const formik = useFormikContext();

//     const handleFill = () => {
//         // Set all values
//         formik.setValues(MOCK_VALID_VALUES);
        
//         // Mark all primary fields as touched to run validation immediately
//         const touched = Object.keys(MOCK_VALID_VALUES).reduce((acc, key) => {
//             if (!key.startsWith('new_')) { 
//                 acc[key] = true;
//             }
//             return acc;
//         }, {});
//         formik.setTouched(touched);
        
//         addToast("Form fields auto-filled with valid mock data.", "info");
//         console.log("Form auto-filled with valid data.");
//     };

//     return (
//         <Button
//             type="button"
//             intent="tertiary" 
//             size="sm"
//             onClick={handleFill}
//             className="w-full md:w-auto"
//         >
//             Auto-Fill Valid Data
//         </Button>
//     );
// };


// // ================================================================
// // Drop Device Table & Add Row Logic (Unchanged)
// // ================================================================

// const DropDeviceSection = ({ addToast }) => {
//     const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext();
//     const dropDevices = values.drop_devices || [];

//     const DROP_DEVICE_COLUMNS = useMemo(() => ([
//         { key: 'device_ip', header: 'Device IP' }, 
//         { key: 'usage_vlan', header: 'Usage VLAN' },
//         { key: 'connected_port', header: 'Connected Port' },
//         {
//             key: 'actions',
//             header: 'Actions',
//             align: 'center',
//             width: '5rem',
//             isSortable: false,
//             render: (v, row, index) => (
//                 <button 
//                     type="button" 
//                     onClick={() => {
//                         const newDevices = [...dropDevices];
//                         newDevices.splice(index, 1);
//                         setFieldValue('drop_devices', newDevices);
//                         addToast(`Removed device: ${row.device_ip}`, "warning");
//                     }} 
//                     className="btn btn-ghost btn-xs text-red-500 hover:text-red-700" 
//                     title="Remove Device"
//                 >
//                     <Trash2 className="h-4 w-4" />
//                 </button>
//             ),
//         },
//     ]), [dropDevices, setFieldValue, addToast]);

//     const handleAddRow = useCallback(() => {
//         const newEntry = {
//             device_ip: values.new_device_ip,
//             usage_vlan: values.new_usage_vlan,
//             connected_port: values.new_connected_port,
//         };

//         DropDeviceSchema.validate(newEntry, { abortEarly: false })
//             .then(() => {
//                 setFieldValue('drop_devices', [...dropDevices, newEntry]);
//                 setFieldValue('new_device_ip', '');
//                 setFieldValue('new_usage_vlan', '');
//                 setFieldValue('new_connected_port', '');
//                 addToast("Device added successfully!", "success");
//             })
//             .catch(validationErrors => {
//                 validationErrors.inner.forEach(err => {
//                     setFieldTouched(`new_${err.path}`, true);
//                 });
//                 addToast("Please fill in all required fields for the new device.", "error");
//             });

//     }, [values, dropDevices, setFieldValue, setFieldTouched, addToast]);

//     return (
//         <FieldArray name="drop_devices">
//             {() => (
//                 // Changed md:col-span-2 to md:col-span-3
//                 <div className="md:col-span-3 space-y-6">
//                     <h3 className="text-2xl font-semibold text-gray-800">Drop Device</h3>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-x-14">
                        
//                         <Field name="new_device_ip">
//                             {({ field }) => (
//                                 <TextInputField
//                                     {...field}
//                                     placeholder="Device IP"
//                                     formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
//                                     className="mb-0"
//                                     name="new_device_ip"
//                                 />
//                             )}
//                         </Field>

//                         <Field name="new_usage_vlan">
//                             {({ field }) => (
//                                 <TextInputField
//                                     {...field}
//                                     placeholder="Usage VLAN"
//                                     formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
//                                     className="mb-0"
//                                     name="new_usage_vlan"
//                                 />
//                             )}
//                         </Field>

//                         <Field name="new_connected_port">
//                             {({ field }) => (
//                                 <TextInputField
//                                     {...field}
//                                     placeholder="Connected Port"
//                                     formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
//                                     className="mb-0"
//                                     name="new_connected_port"
//                                 />
//                             )}
//                         </Field>

//                         <div className="flex items-center pt-1 md:pt-0">
//                             <Button 
//                                 type="button" 
//                                 onClick={handleAddRow}
//                                 intent="primary"
//                                 size="sm"
//                                 leftIcon={PlusCircle}
//                                 className="w-full md:w-auto"
//                             >
//                                 Add
//                             </Button>
//                         </div>
//                     </div>

//                     {dropDevices.length > 0 && (
//                         <div className="pt-6 border-t border-gray-200">
//                             <DataTable
//                                 data={dropDevices}
//                                 columns={DROP_DEVICE_COLUMNS}
//                                 searchable={false}
//                                 selection={false}
//                                 initialPageSize={5}
//                                 pageSizeOptions={[5, 10, 25]}
//                                 stickyHeader={false}
//                                 title={`Device List (${dropDevices.length})`}
//                             />
//                         </div>
//                     )}
//                 </div>
//             )}
//         </FieldArray>
//     );
// };


// // ================================================================
// // 3. Main Component - ActivationPlanForm
// // ================================================================
// export default function ActivationPlanForm() {
//     const navigate = useNavigate();
//     const { addToast } = useToast(); 

//     const handleSubmit = useCallback(
//         async (values, { setSubmitting, resetForm }) => {
//             setSubmitting(true);
//             try {
//                 // 🔑 FIX: Destructure values to omit the three temporary fields
//                 const { 
//                     new_device_ip, 
//                     new_usage_vlan, 
//                     new_connected_port, 
//                     ...submitValues 
//                 } = values;

//                 // Log the clean data intended for the backend
//                 console.log("Submitting Activation Plan (Clean JSON):", JSON.stringify(submitValues, null, 2));
                
//                 addToast("Activation Plan saved successfully!", "success");
                
//                 resetForm({ values: initialFormValues }); 
//             } catch (error) {
//                 console.error("Activation Plan submission failed:", error);
//                 addToast("Failed to save activation plan.", "error");
//             } finally {
//                 setSubmitting(false);
//             }
//         },
//         [addToast]
//     );
    
//     return (
//         <div className="w-full h-full p-6 lg:p-8 mt-10">
//             <header className="mb-10 pb-6 border-b border-gray-200">
//                 <h2 className="text-4xl font-bold text-gray-900">
//                     Activation Plan Configuration
//                 </h2>
//                 <p className="text-lg text-gray-600 mt-2">
//                     Configure technical parameters and associated drop devices for a partner.
//                 </p>
//             </header>

//             <Formik
//                 initialValues={initialFormValues}
//                 validationSchema={ActivationPlanSchema}
//                 onSubmit={handleSubmit}
//             >
//                 {(formik) => {
//                     const selectedLinkID = formik.values.nttn_link_id;
//                     const partnerDetails = selectedLinkID ? MOCK_PARTNER_DATA[selectedLinkID] : {}; 

//                     return (
//                         // 🔑 CHANGE: Updated to 3 columns: md:grid-cols-3
//                         <Form className="grid grid-cols-1 md:grid-cols-3 gap-x-14 gap-y-6">
                            
//                             {/* Partner Details Section */}
//                             {/* 🔑 CHANGE: Updated to span 3 columns: md:col-span-3 */}
//                             <div className="md:col-span-3">
//                                 <h3 className="text-2xl font-semibold text-gray-800 mb-4">
//                                     Partner Details
//                                 </h3>
//                             </div>
                            
//                             {/* Row 1: NTTN Link ID Dropdown */}
//                             <div className="space-y-1">
//                                 <SelectField
//                                     name="nttn_link_id"
//                                     options={MOCK_NTTN_OPTIONS}
//                                     placeholder="Select Link ID"
//                                 />
//                                 {formik.touched.nttn_link_id && formik.errors.nttn_link_id && (
//                                     <p className="text-red-500 text-sm ml-1">{formik.errors.nttn_link_id}</p>
//                                 )}
//                             </div>
//                             {/* 🔑 CHANGE: Updated the placeholder div to span the remaining 2 columns */}
//                             <div className="hidden md:block md:col-span-2"></div> 

//                             {/* Row 2: Partner Details Display Box (3-column layout) */}
//                             {/* 🔑 CHANGE: Updated to span 3 columns: md:col-span-3 */}
//                             <div className="md:col-span-3 mb-4">
//                                 <div 
//                                     className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 p-6 bg-white border border-gray-200 rounded-xl"
//                                 >
//                                     <div className="space-y-4 pr-5 border-r border-gray-100">
//                                         <PartnerDetailDisplayField label="NTTN Provider" value={partnerDetails.nttn_provider} />
//                                         <PartnerDetailDisplayField label="Aggregator" value={partnerDetails.aggregator} />
//                                     </div>
//                                     <div className="space-y-4 px-5 border-r border-gray-100">
//                                         <PartnerDetailDisplayField label="Partner Name" value={partnerDetails.partner_name} />
//                                         <PartnerDetailDisplayField label="Business KAM" value={partnerDetails.business_kam} />
//                                     </div>
//                                     <div className="space-y-4 pl-5">
//                                         <PartnerDetailDisplayField label="SBU" value={partnerDetails.sbu} />
//                                         <PartnerDetailDisplayField label="Purchased Capacity" value={partnerDetails.purchased_capacity} />
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             {/* --- Core Configuration Fields --- */}
//                             {/* 🔑 CHANGE: Updated to span 3 columns: md:col-span-3 */}
//                             <div className="md:col-span-3">
//                                 <h3 className="text-2xl font-semibold text-gray-800 mb-4 pt-4 border-t border-gray-200">
//                                     Technical Configuration
//                                 </h3>
//                             </div>

//                             {/* 🔑 NEW COLUMN 1: IPs (6 fields of 8 total IPs) */}
//                             <div className="space-y-6">
//                                 <FieldWrapper name="int_peering_ip" placeholder="INT Peering IP" formik={formik} />
//                                 <FieldWrapper name="ggc_peering_ip" placeholder="GGC Peering IP" formik={formik} /> 
//                                 <FieldWrapper name="fna_peering_ip" placeholder="FNA Peering IP" formik={formik} />
//                                 <FieldWrapper name="bdix_peering_ip" placeholder="BDIX Peering IP" formik={formik} />
//                                 <FieldWrapper name="mcdn_peering_ip" placeholder="MCDN Peering IP" formik={formik} />
//                                 <FieldWrapper name="asn" placeholder="ASN" formik={formik} />
//                             </div>
                            
//                             {/* 🔑 NEW COLUMN 2: VLANs (6 fields) */}
//                             <div className="space-y-6">
//                                 <FieldWrapper name="nttn_vlan" placeholder="NTTN VLAN (max 10 chars)" formik={formik} />
//                                 <FieldWrapper name="int_vlan" placeholder="INT VLAN (max 10 chars)" formik={formik} />
//                                 <FieldWrapper name="ggn_vlan" placeholder="GGN VLAN (max 10 chars)" formik={formik} />
//                                 <FieldWrapper name="fna_vlan" placeholder="FNA VLAN (max 10 chars)" formik={formik} />
//                                 <FieldWrapper name="bdix_vlan" placeholder="BDIX VLAN (max 10 chars)" formik={formik} />
//                                 <FieldWrapper name="mcdn_vlan" placeholder="MCDN VLAN (max 10 chars)" formik={formik} />
//                             </div>

//                             {/* 🔑 NEW COLUMN 3: Remaining IPs and Misc (6 fields) */}
//                             <div className="space-y-6">
//                                 <FieldWrapper name="nas_ip" placeholder="NAS IP" formik={formik} />
//                                 <FieldWrapper name="nat_ip" placeholder="NAT IP" formik={formik} />
//                                 <FieldWrapper name="connected_sw_name" placeholder="Connected SW Name" formik={formik} />
//                                 <FieldWrapper name="chr_server" placeholder="CHR Server" formik={formik} />
//                                 <FieldWrapper name="sw_port" placeholder="SW Port" formik={formik} />
//                                 <FieldWrapper name="nic_no" placeholder="NIC No" formik={formik} />
//                             </div>


//                             {/* --- Drop Device Tabular Feature --- */}
//                             {/* 🔑 CHANGE: Updated to span 3 columns: md:col-span-3 */}
//                             <div className="md:col-span-3 pt-6 border-t border-gray-200 mt-6">
//                                 <DropDeviceSection addToast={addToast} />
//                             </div>

//                             {/* --- Actions --- */}
//                             {/* 🔑 CHANGE: Updated to span 3 columns: md:col-span-3 */}
//                             <div className="md:col-span-3 flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
//                                 <FillFormWithMockData addToast={addToast} />
                                
//                                 <DebugFormikState />
                                
//                                 <Button
//                                     type="submit"
//                                     intent="primary"
//                                     loading={formik.isSubmitting}
//                                     loadingText="Saving Plan..."
//                                     disabled={formik.isSubmitting}
//                                 >
//                                     Save
//                                 </Button>
//                             </div>
//                         </Form>
//                     );
//                 }}
//             </Formik>
//         </div>
//     );
// }
import React, { useState, useCallback, useMemo } from "react";
import { Formik, Form, FieldArray, useFormikContext, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom"; 
// Assuming these are your custom components/hooks
import TextInputField from "../components/fields/TextInputField"; 
import SelectField from "../components/fields/SelectField"; 
import Button from "../components/ui/Button";
import { useToast } from "../hooks/useToast"; 
// Import the DataTable and icons for the new feature
import DataTable from "../components/table/DataTable";
import { Trash2, PlusCircle } from "lucide-react";


// ================================================================
// MOCK DATA
// ================================================================
const MOCK_NTTN_OPTIONS = [
    { label: "NTTN-LINK-001", value: "NTTN-LINK-001" },
    { label: "NTTN-LINK-002 (Test)", value: "NTTN-LINK-002" },
    { label: "NTTN-LINK-003 (Live)", value: "NTTN-LINK-003" },
];

// 🔑 NEW: Status options for the Interface Configuration dropdown
const MOCK_STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    // { label: "Maintenance", value: "maintenance" },
];

const MOCK_PARTNER_DATA = {
    "NTTN-LINK-001": {
        nttn_provider: "Summit",
        partner_name: "ABC Entity",
        sbu: "Race Online",
        aggregator: "Khaja",
        business_kam: "XYZ",
        purchased_capacity: "100 Mb",
    },
    "NTTN-LINK-002": {
        nttn_provider: "Fiber@Home",
        partner_name: "Beta ISP",
        sbu: "MetroNet",
        aggregator: "Rahim",
        business_kam: "PQR",
        purchased_capacity: "50 Mb",
    },
    "NTTN-LINK-003": {
        nttn_provider: "Summit",
        partner_name: "Gamma Telecom",
        sbu: "Linkup",
        aggregator: "Karim",
        business_kam: "LMN",
        purchased_capacity: "500 Mb",
    },
};

// 🔑 UPDATED: Mock Data for Auto-Fill to include new interface fields
const MOCK_VALID_VALUES = {
    nttn_link_id: "NTTN-LINK-001",
    nttn_vlan: "101", 
    int_peering_ip: "10.10.10.1/30",
    ggc_peering_ip: "192.0.2.1/30",
    fna_peering_ip: "203.0.113.1/30",
    bdix_peering_ip: "172.16.0.1/30",
    mcdn_peering_ip: "10.20.20.1/30",
    asn: "AS65001",
    nas_ip: "10.10.10.254",
    nat_ip: "10.10.10.250",
    int_vlan: "10", 
    ggn_vlan: "20", 
    fna_vlan: "30", 
    bdix_vlan: "40", 
    mcdn_vlan: "50", 
    connected_sw_name: "SW-CORE-01",
    chr_server: "CHR-SERVER-A",
    sw_port: "Gi1/0/1",
    nic_no: "NIC-007",
    
    // Drop Device Mock Data
    drop_devices: [{device_ip: "10.1.1.1", usage_vlan: "201", connected_port: "G0/1/1"}, 
                   {device_ip: "10.1.1.2", usage_vlan: "202", connected_port: "G0/1/2"}], 
    new_device_ip: "",
    new_usage_vlan: "",
    new_connected_port: "",

    // 🔑 NEW: Interface Configuration Mock Data
    interface_configs: [{interface_name: "Eth0/1", status: "active", note: "Primary link"}, 
                        {interface_name: "Eth0/2", status: "inactive", note: "Backup link"}], 
    new_interface_name: "",
    new_status: "",
    new_note: "",
};

// ================================================================
// 1. Validation Schemas (UPDATED)
// ================================================================
const DropDeviceSchema = Yup.object().shape({
    device_ip: Yup.string().max(50).required("IP is required"),
    usage_vlan: Yup.string().max(50).required("VLAN is required"),
    connected_port: Yup.string().max(50).required("Port is required"),
});

// 🔑 NEW: Interface Configuration Schema
const InterfaceConfigSchema = Yup.object().shape({
    interface_name: Yup.string().max(50).required("Interface Name is required"),
    status: Yup.string().oneOf(MOCK_STATUS_OPTIONS.map(o => o.value), "Invalid status").required("Status is required"),
    note: Yup.string().max(255).notRequired(), // Note is optional
});


const ActivationPlanSchema = Yup.object().shape({
    nttn_link_id: Yup.string().required("NTTN Link ID is required"), 
    nttn_vlan: Yup.string().max(10).required("NTTN VLAN is required"),
    int_peering_ip: Yup.string().max(50).required("IP is required"),
    ggc_peering_ip: Yup.string().max(50).required("IP is required"),
    fna_peering_ip: Yup.string().max(50).required("IP is required"),
    bdix_peering_ip: Yup.string().max(50).required("IP is required"),
    mcdn_peering_ip: Yup.string().max(50).required("IP is required"),
    asn: Yup.string().max(20).required("ASN is required"),
    nas_ip: Yup.string().max(50).required("IP is required"),
    nat_ip: Yup.string().max(50).required("NAT IP is required"),
    int_vlan: Yup.string().max(10).required("VLAN is required"),
    ggn_vlan: Yup.string().max(10).required("VLAN is required"),
    fna_vlan: Yup.string().max(10).required("VLAN is required"),
    bdix_vlan: Yup.string().max(10).required("VLAN is required"),
    mcdn_vlan: Yup.string().max(10).required("VLAN is required"),
    connected_sw_name: Yup.string().max(50).required("SW Name is required"),
    chr_server: Yup.string().max(50).required("Server is required"),
    sw_port: Yup.string().max(20).required("SW Port is required"),
    nic_no: Yup.string().max(20).required("NIC No is required"),
    
    // Array fields
    drop_devices: Yup.array().of(DropDeviceSchema),
    interface_configs: Yup.array().of(InterfaceConfigSchema), // 🔑 NEW ARRAY VALIDATION
});

// ================================================================
// 2. Initial Values (UPDATED)
// ================================================================
const initialFormValues = {
    nttn_link_id: "",
    nttn_vlan: "",
    int_peering_ip: "",
    ggc_peering_ip: "",
    fna_peering_ip: "",
    bdix_peering_ip: "",
    mcdn_peering_ip: "",
    asn: "",
    nas_ip: "",
    nat_ip: "",
    int_vlan: "",
    ggn_vlan: "",
    fna_vlan: "",
    bdix_vlan: "",
    mcdn_vlan: "",
    connected_sw_name: "",
    chr_server: "",
    sw_port: "",
    nic_no: "",
    
    // Existing Drop Device fields
    drop_devices: [],
    new_device_ip: "",
    new_usage_vlan: "",
    new_connected_port: "",

    // 🔑 NEW: Interface Configuration fields
    interface_configs: [],
    new_interface_name: "",
    new_status: "",
    new_note: "",
};


// ================================================================
// Helper Components (Unchanged)
// ================================================================
const PartnerDetailDisplayField = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-base font-semibold text-gray-800">{value || 'N/A'}</span>
    </div>
);

// Helper Component to wrap TextInputField and show Formik error
const FieldWrapper = ({ name, placeholder, formik }) => (
    <div className="space-y-1">
        <TextInputField name={name} placeholder={placeholder} formik={formik} />
        {formik.touched[name] && formik.errors[name] && (
            <p className="text-red-500 text-sm ml-1">{formik.errors[name]}</p>
        )}
    </div>
);

// Diagnostic component to show form state
const DebugFormikState = () => {
    const formik = useFormikContext();
    return (
        <Button
            type="button"
            intent="secondary"
            size="sm"
            onClick={() => {
                console.log('--- FORMIK DEBUG STATE ---');
                console.log('isValid:', formik.isValid);
                console.log('Errors:', formik.errors);
                console.log('Touched:', formik.touched);
                console.log('Values:', JSON.stringify(formik.values, null, 2)); 
                console.log('--------------------------');
            }}
            className="w-full md:w-auto"
        >
            Debug Form State
        </Button>
    );
};

// 🔑 UPDATED: Component to fill form with valid mock data
const FillFormWithMockData = ({ addToast }) => {
    const formik = useFormikContext();

    const handleFill = () => {
        // Set all values
        formik.setValues(MOCK_VALID_VALUES);
        
        // Mark all primary fields as touched to run validation immediately
        const touched = Object.keys(MOCK_VALID_VALUES).reduce((acc, key) => {
            if (!key.startsWith('new_')) { 
                acc[key] = true;
            }
            return acc;
        }, {});
        formik.setTouched(touched);
        
        addToast("Form fields auto-filled with valid mock data.", "info");
        console.log("Form auto-filled with valid data.");
    };

    return (
        <Button
            type="button"
            intent="tertiary" 
            size="sm"
            onClick={handleFill}
            className="w-full md:w-auto"
        >
            Auto-Fill Valid Data
        </Button>
    );
};


// ================================================================
// 🔑 NEW: Interface Configuration Tabular Section
// ================================================================

const InterfaceConfigSection = ({ addToast }) => {
    const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext();
    const interfaceConfigs = values.interface_configs || [];

    const INTERFACE_COLUMNS = useMemo(() => ([
        { key: 'interface_name', header: 'Interface Name' }, 
        { key: 'status', header: 'Status' },
        { key: 'note', header: 'Note' },
        {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            width: '5rem',
            isSortable: false,
            render: (v, row, index) => (
                <button 
                    type="button" 
                    onClick={() => {
                        const newConfigs = [...interfaceConfigs];
                        newConfigs.splice(index, 1);
                        setFieldValue('interface_configs', newConfigs);
                        addToast(`Removed interface: ${row.interface_name}`, "warning");
                    }} 
                    className="btn btn-ghost btn-xs text-red-500 hover:text-red-700" 
                    title="Remove Interface"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            ),
        },
    ]), [interfaceConfigs, setFieldValue, addToast]);

    const handleAddInterface = useCallback(() => {
        const newEntry = {
            interface_name: values.new_interface_name,
            status: values.new_status,
            note: values.new_note,
        };

        InterfaceConfigSchema.validate(newEntry, { abortEarly: false })
            .then(() => {
                setFieldValue('interface_configs', [...interfaceConfigs, newEntry]);
                setFieldValue('new_interface_name', '');
                setFieldValue('new_status', '');
                setFieldValue('new_note', '');
                addToast("Interface added successfully!", "success");
            })
            .catch(validationErrors => {
                validationErrors.inner.forEach(err => {
                    // Check if the path is a temporary field and set touched
                    if (err.path === 'interface_name') setFieldTouched('new_interface_name', true);
                    if (err.path === 'status') setFieldTouched('new_status', true);
                    if (err.path === 'note') setFieldTouched('new_note', true);
                });
                addToast("Please fill in all required fields for the new interface.", "error");
            });

    }, [values, interfaceConfigs, setFieldValue, setFieldTouched, addToast]);

    return (
        <FieldArray name="interface_configs">
            {() => (
                <div className="md:col-span-3 space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Interface Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-14">
                        
                        {/* Interface Name */}
                        <Field name="new_interface_name">
                            {({ field }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Interface Name"
                                    formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
                                    className="mb-0"
                                    name="new_interface_name"
                                />
                            )}
                        </Field>

                        {/* Status Dropdown */}
                        <Field name="new_status">
                            {({ field }) => (
                                <SelectField
                                    {...field}
                                    name="new_status"
                                    options={MOCK_STATUS_OPTIONS}
                                    placeholder="Status"
                                    formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
                                    className="mb-0"
                                />
                            )}
                        </Field>

                        {/* Note */}
                        <Field name="new_note">
                            {({ field }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Note (Optional)"
                                    formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
                                    className="mb-0"
                                    name="new_note"
                                />
                            )}
                        </Field>

                        <div className="flex items-center pt-1 md:pt-0">
                            <Button 
                                type="button" 
                                onClick={handleAddInterface}
                                intent="primary"
                                size="sm"
                                leftIcon={PlusCircle}
                                className="w-full md:w-auto"
                            >
                                Add Interface
                            </Button>
                        </div>
                    </div>

                    {interfaceConfigs.length > 0 && (
                        <div className="pt-6 border-t border-gray-200">
                            <DataTable
                                data={interfaceConfigs}
                                columns={INTERFACE_COLUMNS}
                                searchable={false}
                                selection={false}
                                initialPageSize={5}
                                pageSizeOptions={[5, 10, 25]}
                                stickyHeader={false}
                                title={`Interface List (${interfaceConfigs.length})`}
                            />
                        </div>
                    )}
                </div>
            )}
        </FieldArray>
    );
};


// ================================================================
// Drop Device Table & Add Row Logic (Unchanged)
// ================================================================

const DropDeviceSection = ({ addToast }) => {
    const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext();
    const dropDevices = values.drop_devices || [];

    const DROP_DEVICE_COLUMNS = useMemo(() => ([
        { key: 'device_ip', header: 'Device IP' }, 
        { key: 'usage_vlan', header: 'Usage VLAN' },
        { key: 'connected_port', header: 'Connected Port' },
        {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            width: '5rem',
            isSortable: false,
            render: (v, row, index) => (
                <button 
                    type="button" 
                    onClick={() => {
                        const newDevices = [...dropDevices];
                        newDevices.splice(index, 1);
                        setFieldValue('drop_devices', newDevices);
                        addToast(`Removed device: ${row.device_ip}`, "warning");
                    }} 
                    className="btn btn-ghost btn-xs text-red-500 hover:text-red-700" 
                    title="Remove Device"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            ),
        },
    ]), [dropDevices, setFieldValue, addToast]);

    const handleAddRow = useCallback(() => {
        const newEntry = {
            device_ip: values.new_device_ip,
            usage_vlan: values.new_usage_vlan,
            connected_port: values.new_connected_port,
        };

        DropDeviceSchema.validate(newEntry, { abortEarly: false })
            .then(() => {
                setFieldValue('drop_devices', [...dropDevices, newEntry]);
                setFieldValue('new_device_ip', '');
                setFieldValue('new_usage_vlan', '');
                setFieldValue('new_connected_port', '');
                addToast("Device added successfully!", "success");
            })
            .catch(validationErrors => {
                validationErrors.inner.forEach(err => {
                    // Check if the path is a temporary field and set touched
                    if (err.path === 'device_ip') setFieldTouched('new_device_ip', true);
                    if (err.path === 'usage_vlan') setFieldTouched('new_usage_vlan', true);
                    if (err.path === 'connected_port') setFieldTouched('new_connected_port', true);
                });
                addToast("Please fill in all required fields for the new device.", "error");
            });

    }, [values, dropDevices, setFieldValue, setFieldTouched, addToast]);

    return (
        <FieldArray name="drop_devices">
            {() => (
                <div className="md:col-span-3 space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-800">Drop Device</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-14">
                        
                        <Field name="new_device_ip">
                            {({ field }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Device IP"
                                    formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
                                    className="mb-0"
                                    name="new_device_ip"
                                />
                            )}
                        </Field>

                        <Field name="new_usage_vlan">
                            {({ field }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Usage VLAN"
                                    formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
                                    className="mb-0"
                                    name="new_usage_vlan"
                                />
                            )}
                        </Field>

                        <Field name="new_connected_port">
                            {({ field }) => (
                                <TextInputField
                                    {...field}
                                    placeholder="Connected Port"
                                    formik={{ values, errors, touched, setFieldTouched, setFieldValue }}
                                    className="mb-0"
                                    name="new_connected_port"
                                />
                            )}
                        </Field>

                        <div className="flex items-center pt-1 md:pt-0">
                            <Button 
                                type="button" 
                                onClick={handleAddRow}
                                intent="primary"
                                size="sm"
                                leftIcon={PlusCircle}
                                className="w-full md:w-auto"
                            >
                                Add Device
                            </Button>
                        </div>
                    </div>

                    {dropDevices.length > 0 && (
                        <div className="pt-6 border-t border-gray-200">
                            <DataTable
                                data={dropDevices}
                                columns={DROP_DEVICE_COLUMNS}
                                searchable={false}
                                selection={false}
                                initialPageSize={5}
                                pageSizeOptions={[5, 10, 25]}
                                stickyHeader={false}
                                title={`Device List (${dropDevices.length})`}
                            />
                        </div>
                    )}
                </div>
            )}
        </FieldArray>
    );
};


// ================================================================
// 3. Main Component - ActivationPlanForm
// ================================================================
export default function ActivationPlanForm() {
    const navigate = useNavigate();
    const { addToast } = useToast(); 

    const handleSubmit = useCallback(
        async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
                // 🔑 UPDATED: Destructure to omit *all* temporary fields from submission
                const { 
                    new_device_ip, new_usage_vlan, new_connected_port, 
                    new_interface_name, new_status, new_note, // 🔑 NEW temporary fields
                    ...submitValues 
                } = values;

                // Log the clean data intended for the backend
                console.log("Submitting Activation Plan (Clean JSON):", JSON.stringify(submitValues, null, 2));
                
                addToast("Activation Plan saved successfully!", "success");
                
                resetForm({ values: initialFormValues }); 
            } catch (error) {
                console.error("Activation Plan submission failed:", error);
                addToast("Failed to save activation plan.", "error");
            } finally {
                setSubmitting(false);
            }
        },
        [addToast]
    );
    
    return (
        <div className="w-full h-full p-6 lg:p-8 mt-10">
            <header className="mb-10 pb-6 border-b border-gray-200">
                <h2 className="text-4xl font-bold text-gray-900">
                    Activation Plan Configuration
                </h2>
                <p className="text-lg text-gray-600 mt-2">
                    Configure technical parameters and associated drop devices for a partner.
                </p>
            </header>

            <Formik
                initialValues={initialFormValues}
                validationSchema={ActivationPlanSchema}
                onSubmit={handleSubmit}
            >
                {(formik) => {
                    const selectedLinkID = formik.values.nttn_link_id;
                    const partnerDetails = selectedLinkID ? MOCK_PARTNER_DATA[selectedLinkID] : {}; 

                    return (
                        <Form className="grid grid-cols-1 md:grid-cols-3 gap-x-14 gap-y-6">
                            
                            {/* Partner Details Section */}
                            <div className="md:col-span-3">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Partner Details
                                </h3>
                            </div>
                            
                            {/* Row 1: NTTN Link ID Dropdown */}
                            <div className="space-y-1">
                                <SelectField
                                    name="nttn_link_id"
                                    options={MOCK_NTTN_OPTIONS}
                                    placeholder="Select Link ID"
                                />
                                {formik.touched.nttn_link_id && formik.errors.nttn_link_id && (
                                    <p className="text-red-500 text-sm ml-1">{formik.errors.nttn_link_id}</p>
                                )}
                            </div>
                            <div className="hidden md:block md:col-span-2"></div> 

                            {/* Row 2: Partner Details Display Box (3-column layout) */}
                            <div className="md:col-span-3 mb-4">
                                <div 
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 p-6 bg-white border border-gray-200 rounded-xl"
                                >
                                    <div className="space-y-4 pr-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField label="NTTN Provider" value={partnerDetails.nttn_provider} />
                                        <PartnerDetailDisplayField label="Aggregator" value={partnerDetails.aggregator} />
                                    </div>
                                    <div className="space-y-4 px-5 border-r border-gray-100">
                                        <PartnerDetailDisplayField label="Partner Name" value={partnerDetails.partner_name} />
                                        <PartnerDetailDisplayField label="Business KAM" value={partnerDetails.business_kam} />
                                    </div>
                                    <div className="space-y-4 pl-5">
                                        <PartnerDetailDisplayField label="SBU" value={partnerDetails.sbu} />
                                        <PartnerDetailDisplayField label="Purchased Capacity" value={partnerDetails.purchased_capacity} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* --- Core Configuration Fields --- */}
                            <div className="md:col-span-3">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4 pt-4 border-t border-gray-200">
                                    Technical Configuration
                                </h3>
                            </div>

                            {/* Column 1: IPs */}
                            <div className="space-y-6">
                                <FieldWrapper name="int_peering_ip" placeholder="INT Peering IP" formik={formik} />
                                <FieldWrapper name="ggc_peering_ip" placeholder="GGC Peering IP" formik={formik} /> 
                                <FieldWrapper name="fna_peering_ip" placeholder="FNA Peering IP" formik={formik} />
                                <FieldWrapper name="bdix_peering_ip" placeholder="BDIX Peering IP" formik={formik} />
                                <FieldWrapper name="mcdn_peering_ip" placeholder="MCDN Peering IP" formik={formik} />
                                <FieldWrapper name="asn" placeholder="ASN" formik={formik} />
                            </div>
                            
                            {/* Column 2: VLANs */}
                            <div className="space-y-6">
                                <FieldWrapper name="nttn_vlan" placeholder="NTTN VLAN (max 10 chars)" formik={formik} />
                                <FieldWrapper name="int_vlan" placeholder="INT VLAN (max 10 chars)" formik={formik} />
                                <FieldWrapper name="ggn_vlan" placeholder="GGN VLAN (max 10 chars)" formik={formik} />
                                <FieldWrapper name="fna_vlan" placeholder="FNA VLAN (max 10 chars)" formik={formik} />
                                <FieldWrapper name="bdix_vlan" placeholder="BDIX VLAN (max 10 chars)" formik={formik} />
                                <FieldWrapper name="mcdn_vlan" placeholder="MCDN VLAN (max 10 chars)" formik={formik} />
                            </div>

                            {/* Column 3: Remaining IPs and Misc */}
                            <div className="space-y-6">
                                <FieldWrapper name="nas_ip" placeholder="NAS IP" formik={formik} />
                                <FieldWrapper name="nat_ip" placeholder="NAT IP" formik={formik} />
                                <FieldWrapper name="connected_sw_name" placeholder="Connected SW Name" formik={formik} />
                                <FieldWrapper name="chr_server" placeholder="CHR Server" formik={formik} />
                                <FieldWrapper name="sw_port" placeholder="SW Port" formik={formik} />
                                <FieldWrapper name="nic_no" placeholder="NIC No" formik={formik} />
                            </div>


                            {/* ------------------------------------------------------------------ */}
                            {/* 🔑 NEW: Interface Configuration Tabular Feature (Placed ABOVE) */}
                            {/* ------------------------------------------------------------------ */}
                            <div className="md:col-span-3 pt-6 border-t border-gray-200 mt-6">
                                <InterfaceConfigSection addToast={addToast} />
                            </div>


                            {/* --- Drop Device Tabular Feature (Moved BELOW) --- */}
                            <div className="md:col-span-3 pt-6 border-t border-gray-200 mt-6">
                                <DropDeviceSection addToast={addToast} />
                            </div>

                            {/* --- Actions --- */}
                            <div className="md:col-span-3 flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
                                <FillFormWithMockData addToast={addToast} />
                                
                                <DebugFormikState />
                                
                                <Button
                                    type="submit"
                                    intent="primary"
                                    loading={formik.isSubmitting}
                                    loadingText="Saving Plan..."
                                    disabled={formik.isSubmitting}
                                >
                                    Save
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}