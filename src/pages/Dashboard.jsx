// // src/pages/PartnerDashboard.jsx
// import React, { useMemo, useState, useEffect, useCallback } from "react";
// import clsx from "clsx";
// import {
//   ArrowUp, // Max Upload
//   ArrowDown,
//   AlertTriangle, // Max Utilization Alert
//   Minimize2, // Min Utilization Alert
//   WifiOff, // NEW: ICMP Alert Icon (Representing connectivity issues)
//   Users, // Partners
//   Layers, // Aggregators
//   Filter,
//   Play, // Running Icon
//   Pause, // Pause Icon
//   CheckCircle, // Resolved Icon
//   XCircle, // Cancel Icon
//   AlertCircle, // Modal Icon
//   Clock, // NEW: Delay icon
//   Timer,
//   RefreshCw,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "chartjs-adapter-date-fns";
// // Assume these components are imported from the existing structure
// import DataTable from "../components/table/DataTable";
// import Chart from "../components/charts/Chart";
// import Button from "../components/ui/Button";

// import {
//   getPartnerInfos,
//   getAggregators,
//   getMaxUtilizationAlert,
//   getMinUtilizationAlert,
//   getICMPAlert,
//   getMinMaxUtilizationLastSevenDays,
// } from "../services/partner-link/dashboardApi";
// import { 
//   fetchPartnerAggreatorSummary, 
//   fetchPartnerPartnerCountSummary, 
//   fetchPartnerUtilizationLast7Days,
//   fetchPartnerDownloadUtilizationAlert,
//   fetchPartnerUploadUtilizationAlert,
//   fetchPartnerMinDownloadUtilizationAlert,
//   fetchPartnerMinUploadUtilizationAlert
// } from "../services/partner-link/partnerDashboard";

// /* -------------------------------------------------
//    1. HELPER FUNCTIONS & UI ELEMENTS (UNCHANGED)
//    ------------------------------------------------- */

// function safeCell(v) {
//   if (v === null || v === undefined || v === "")
//     return <span className='text-gray-400'>—</span>;
//   if (typeof v === "boolean") return v ? "Yes" : "No";
//   return String(v);
// }

// const CardSkeleton = () => (
//   <div className='h-28 bg-gray-200 rounded-xl animate-pulse'></div>
// );
// const TableSkeleton = () => (
//   <div className='h-[400px] bg-gray-200 rounded-xl animate-pulse'></div>
// );

// const HealthStatCard = ({
//   title,
//   value,
//   subLabel,
//   icon: Icon,
//   valueClass,
//   iconBgClass,
//   iconTextClass,
//   onClick,
// }) => (
//   <button
//     onClick={onClick}
//     className='flex-1 min-w-[180px] min-h-[140px] p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
//     disabled={!onClick}>
//     <div className='flex items-start justify-between'>
//       <div className={clsx("p-3 rounded-full", iconBgClass, iconTextClass)}>
//         <Icon className='w-7 h-7' />
//       </div>
//     </div>
//     <div className='mt-4'>
//       <p className={clsx("text-3xl font-bold", valueClass)}>{value}</p>
//       <p className='text-sm text-gray-500 mt-1'>{title}</p>
//       {subLabel && <p className='text-xs text-gray-400 mt-0.5'>{subLabel}</p>}
//     </div>
//   </button>
// );

// /* -------------------------------------------------
//    1.1 MODAL COMPONENT (UNCHANGED)
//    ------------------------------------------------- */
// const ConfirmationModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   linkId,
// }) => {
//   if (!isOpen) return null;
//   return (
//     <div
//       className='fixed inset-0 z-50 overflow-y-auto'
//       aria-labelledby='modal-title'
//       role='dialog'
//       aria-modal='true'>
//       <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
//         {/* Background overlay */}
//         <div
//           className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
//           aria-hidden='true'></div>

//         {/* Modal panel */}
//         <span
//           className='hidden sm:inline-block sm:align-middle sm:h-screen'
//           aria-hidden='true'>
//           &#8203;
//         </span>
//         <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
//           <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
//             <div className='sm:flex sm:items-start'>
//               <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
//                 <AlertCircle
//                   className='h-6 w-6 text-red-600'
//                   aria-hidden='true'
//                 />
//               </div>
//               <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
//                 <h3
//                   className='text-lg leading-6 font-medium text-gray-900'
//                   id='modal-title'>
//                   {title}
//                 </h3>
//                 <div className='mt-2'>
//                   <p className='text-sm text-gray-500'>{message}</p>
//                   <p className='text-sm font-semibold text-gray-700 mt-1'>
//                     Link ID: {linkId}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
//             <Button
//               onClick={onConfirm}
//               variant='solid'
//               color='red'
//               leftIcon={CheckCircle}
//               className='w-full sm:ml-3 sm:w-auto'>
//               Confirm Resolve
//             </Button>
//             <Button
//               onClick={onClose}
//               variant='ghost'
//               leftIcon={XCircle}
//               className='mt-3 w-full sm:mt-0 sm:w-auto'>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* -------------------------------------------------
//    3. COLUMN DEFINITION FUNCTION (UPDATED FOR ALL UTILIZATION TYPES)
//    ------------------------------------------------- */

// // Reusable action column render function (UNCHANGED)
// const renderAlertActions = (row, handleRunPause, handleResolveClick) => {
//   const status = row.current_alert_status;
//   const isResolved = status === "resolved";

//   // --- 1. Run/Pause Button Logic ---
//   let runPauseLabel, RunPauseIcon, runPauseColorClass, nextRunPauseStatus;

//   if (status === "running") {
//     runPauseLabel = "Pause";
//     RunPauseIcon = Pause;
//     runPauseColorClass = "text-yellow-600 border-yellow-200 hover:bg-yellow-50";
//     nextRunPauseStatus = "paused";
//   } else {
//     // status === 'paused' or 'resolved' (though resolved is handled below)
//     runPauseLabel = "Run";
//     RunPauseIcon = Play;
//     runPauseColorClass = "text-blue-600 border-blue-200 hover:bg-blue-50";
//     nextRunPauseStatus = "running";
//   }

//   // --- 2. Resolved Button/Display Logic ---
//   if (isResolved) {
//     return (
//       <div className='flex justify-center'>
//         <Button
//           variant='ghost'
//           size='sm'
//           className='text-green-600 border-green-200 opacity-60 cursor-not-allowed border disabled:opacity-60'
//           leftIcon={CheckCircle}
//           disabled={true}>
//           Resolved
//         </Button>
//       </div>
//     );
//   }

//   // --- Unresolved State (Running or Paused) - Show both actions ---
//   return (
//     <div className='flex justify-center space-x-2'>
//       {/* Run/Pause Toggle Button */}
//       <Button
//         key={`${row.nttn_work_order_id}-runpause`}
//         variant='ghost'
//         size='sm'
//         className={clsx(runPauseColorClass, "border")}
//         onClick={() => handleRunPause(row.nttn_work_order_id, nextRunPauseStatus)}
//         leftIcon={RunPauseIcon}>
//         {runPauseLabel}
//       </Button>

//       {/* Resolve Button */}
//       <Button
//         key={`${row.nttn_work_order_id}-resolve`}
//         variant='ghost'
//         size='sm'
//         className='text-green-600 border-green-200 hover:bg-green-50 border'
//         onClick={() => handleResolveClick(row)}
//         leftIcon={CheckCircle}>
//         Resolve
//       </Button>
//     </div>
//   );
// };

// // Columns for Download Utilization Alerts (Max)
// const getDownloadUtilizationColumns = (handleRunPause, handleResolveClick) => [
//   { key: "client_name", header: "Client Name" },
//   { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
//   { key: "nas_ip", header: "NAS IP" },
//   { key: "interface_port", header: "Interface Port" },
//   { 
//     key: "request_capacity", 
//     header: "Request Capacity",
//     render: (val) => `${safeCell(val)} Mbps`
//   },
//   {
//     key: "consecutive_days",
//     header: "Alert Configuration",
//     render: (v) => (
//       <div className='text-sm text-gray-700'>
//         {safeCell(v)}
//       </div>
//     ),
//   },
//   {
//     key: "avg_utilization_percent",
//     header: "Avg Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "max_utilization_percent",
//     header: "Max Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     width: "18rem",
//     isSortable: false,
//     render: (v, row) =>
//       renderAlertActions(row, handleRunPause, handleResolveClick),
//   },
// ];

// // Columns for Upload Utilization Alerts (Max)
// const getUploadUtilizationColumns = (handleRunPause, handleResolveClick) => [
//   { key: "client_name", header: "Client Name" },
//   { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
//   { key: "nas_ip", header: "NAS IP" },
//   { key: "interface_port", header: "Interface Port" },
//   { 
//     key: "request_capacity", 
//     header: "Request Capacity",
//     render: (val) => `${safeCell(val)} Mbps`
//   },
//   {
//     key: "consecutive_days",
//     header: "Alert Configuration",
//     render: (v) => (
//       <div className='text-sm text-gray-700'>
//         {safeCell(v)}
//       </div>
//     ),
//   },
//   {
//     key: "avg_utilization_percent",
//     header: "Avg Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "max_utilization_percent",
//     header: "Max Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     width: "18rem",
//     isSortable: false,
//     render: (v, row) =>
//       renderAlertActions(row, handleRunPause, handleResolveClick),
//   },
// ];

// // Columns for Min Download Utilization Alerts
// const getMinDownloadUtilizationColumns = (handleRunPause, handleResolveClick) => [
//   { key: "client_name", header: "Client Name" },
//   { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
//   { key: "nas_ip", header: "NAS IP" },
//   { key: "interface_port", header: "Interface Port" },
//   { 
//     key: "request_capacity", 
//     header: "Request Capacity",
//     render: (val) => `${safeCell(val)} Mbps`
//   },
//   {
//     key: "consecutive_days",
//     header: "Alert Configuration",
//     render: (v) => (
//       <div className='text-sm text-gray-700'>
//         {safeCell(v)}
//       </div>
//     ),
//   },
//   {
//     key: "avg_utilization_percent",
//     header: "Avg Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "min_utilization_percent",
//     header: "Min Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     width: "18rem",
//     isSortable: false,
//     render: (v, row) =>
//       renderAlertActions(row, handleRunPause, handleResolveClick),
//   },
// ];

// // Columns for Min Upload Utilization Alerts
// const getMinUploadUtilizationColumns = (handleRunPause, handleResolveClick) => [
//   { key: "client_name", header: "Client Name" },
//   { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
//   { key: "nas_ip", header: "NAS IP" },
//   { key: "interface_port", header: "Interface Port" },
//   { 
//     key: "request_capacity", 
//     header: "Request Capacity",
//     render: (val) => `${safeCell(val)} Mbps`
//   },
//   {
//     key: "consecutive_days",
//     header: "Alert Configuration",
//     render: (v) => (
//       <div className='text-sm text-gray-700'>
//         {safeCell(v)}
//       </div>
//     ),
//   },
//   {
//     key: "avg_utilization_percent",
//     header: "Avg Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "min_utilization_percent",
//     header: "Min Utilization (%)",
//     render: (v) => {
//       const pct = parseFloat(v);
//       let color = "text-gray-800";
//       if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }
//       return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//     },
//   },
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     width: "18rem",
//     isSortable: false,
//     render: (v, row) =>
//       renderAlertActions(row, handleRunPause, handleResolveClick),
//   },
// ];

// // Utilization Columns (For other utilization alerts)
// const getUtilizationColumns = (handleRunPause, handleResolveClick) => [
//   { key: "partner_name", header: "Partner Name" },
//   { key: "nttn_link_id", header: "NTTN Link ID " },
//   { key: "purchased_capacity", header: "Purchased Capacity" },
//   {
//     key: "alert_config",
//     header: "Alert Configuration",
//     render: (v, row) => (
//       <div className='text-sm text-gray-700'>
//         {safeCell(row.daily_triggers)} times / day
//         <span className='text-gray-400 mx-1'>|</span>
//         {safeCell(row.alert_duration_days)} days
//       </div>
//     ),
//   },
//   {
//     key: "utilization_pct",
//     header: "Utilization (%)",
//     render: (v, row) => {
//       const pct = parseFloat(v);
//       const status = row.current_alert_status;

//       let color = "text-gray-800";
//       if (status === "resolved") {
//         color = "text-gray-500 line-through";
//       } else if (pct > 100) {
//         color = "text-red-600 font-bold";
//       } else if (pct < 20) {
//         color = "text-cyan-600 font-bold";
//       }

//       return (
//         <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>
//       );
//     },
//   },
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     width: "18rem",
//     isSortable: false,
//     render: (v, row) =>
//       renderAlertActions(row, handleRunPause, handleResolveClick),
//   },
// ];

// // MODIFIED: Columns for ICMP Alerts with custom rendering for 'alert_value'
// const getICMPAlertColumns = (handleRunPause, handleResolveClick) => [
//   { key: "partner_name", header: "Partner Name" },
//   { key: "nttn_link_id", header: "NTTN Link ID" },
//   {
//     key: "icmp_status",
//     header: "Alert Type",
//     render: (v) => (
//       <span
//         className={clsx(
//           "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
//           v === "Timeout"
//             ? "bg-red-100 text-red-900"
//             : "bg-orange-100 text-orange-900"
//         )}>
//         {safeCell(v)}
//       </span>
//     ),
//   },
//   {
//     key: "alert_value",
//     header: "Alert Value",
//     render: (v, row) => {
//       let displayValue = safeCell(v);

//       if (typeof v === "string") {
//         if (row.icmp_status === "High Latency" && v.includes("ms Latency")) {
//           displayValue = v.replace("ms Latency", " ms").trim();
//         } else if (row.icmp_status === "Timeout") {
//           const failureCountMatch = v.match(/(\d+)/);
//           const count = failureCountMatch
//             ? parseInt(failureCountMatch[0], 10)
//             : 5;
//           const simulatedDurationSeconds = count * 12;

//           if (simulatedDurationSeconds >= 60) {
//             const durationMinutes = (simulatedDurationSeconds / 60).toFixed(1);
//             displayValue = `${durationMinutes} min`;
//           } else {
//             displayValue = `${simulatedDurationSeconds} sec`;
//           }
//         }
//       }

//       return (
//         <span className='font-semibold text-gray-700 text-sm'>
//           {displayValue}
//         </span>
//       );
//     },
//   },
//   {
//     key: "frequency",
//     header: "Frequency",
//     render: (v) => (
//       <span className='font-semibold text-gray-700 text-sm'>{safeCell(v)}</span>
//     ),
//   },
//   { key: "last_ping_time", header: "Last Ping" },
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     width: "18rem",
//     isSortable: false,
//     render: (v, row) =>
//       renderAlertActions(row, handleRunPause, handleResolveClick),
//   },
// ];

// const AGGREGATOR_COLUMNS = [
//   { key: "aggregator_name", header: "Aggregator Name" },
//   { 
//     key: "total_clients", 
//     header: "No. of Partners",
//     render: (val) => safeCell(val)
//   },
//   { 
//     key: "total_request_capacity", 
//     header: "Purchase Capacity",
//     render: (val) => `${safeCell(val)} Mbps`
//   },
// ];

// const PARTNER_COLUMNS = [
//   { key: "partner_name", header: "Partner Name" },
//   { key: "contact_person", header: "Contact Person" },
//   {
//     key: "location",
//     header: "Location",
//     render: (val) => (
//       <span className='inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600'>
//         {safeCell(val)}
//       </span>
//     ),
//   },
//   {
//     key: "status",
//     header: "Status",
//     render: (v) => (
//       <span
//         className={clsx(
//           "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
//           v === "active" || v === "Active"
//             ? "bg-green-100 text-green-800"
//             : "bg-red-100 text-red-800"
//         )}>
//         {safeCell(v)}
//       </span>
//     ),
//   },
// ];

// /* -------------------------------------------------
//    4. PARTNER DASHBOARD COMPONENT
//    ------------------------------------------------- */

// export default function PartnerDashboard() {
//   const navigate = useNavigate();
//   const [initialLoading, setInitialLoading] = useState(true);

//   const [alertStatusMap, setAlertStatusMap] = useState(new Map());

//   const [dynamicTableColumns, setDynamicTableColumns] = useState([]);
//   const [dynamicTableTitle, setDynamicTableTitle] = useState(
//     "Select a card to view data"
//   );
//   const [activeCard, setActiveCard] = useState(null);
//   const [tableIsLoading, setTableIsLoading] = useState(false);
  
//   const [actionFilter, setActionFilter] = useState("all");

//   const [showResolveModal, setShowResolveModal] = useState(false);
//   const [alertToResolve, setAlertToResolve] = useState(null);

//   // API states
//   const [partnerInfos, setPartnerInfos] = useState([]);
//   const [aggregators, setAggregators] = useState([]);
//   const [maxUtilizationAlert, setMaxUtilizationAlert] = useState([]);
//   const [minUtilizationAlert, setMinUtilizationAlert] = useState([]);
//   const [icmpAlert, setIcmpAlert] = useState([]);
//   const [minMaxUtilizationSevenDays, setMinMaxUtilizationSevenDays] = useState([]);
  
//   const [aggregatorSummary, setAggregatorSummary] = useState([]);
//   const [aggregatorCount, setAggregatorCount] = useState(0);

//   const [partnerSummary, setPartnerSummary] = useState([]);
//   const [partnerCount, setPartnerCount] = useState(0);

//   // Utilization Alert States
//   const [downloadUtilizationAlerts, setDownloadUtilizationAlerts] = useState([]);
//   const [downloadUtilizationCount, setDownloadUtilizationCount] = useState(0);
  
//   const [uploadUtilizationAlerts, setUploadUtilizationAlerts] = useState([]);
//   const [uploadUtilizationCount, setUploadUtilizationCount] = useState(0);
  
//   const [minDownloadUtilizationAlerts, setMinDownloadUtilizationAlerts] = useState([]);
//   const [minDownloadUtilizationCount, setMinDownloadUtilizationCount] = useState(0);
  
//   const [minUploadUtilizationAlerts, setMinUploadUtilizationAlerts] = useState([]);
//   const [minUploadUtilizationCount, setMinUploadUtilizationCount] = useState(0);

//   // Chart state
//   const [chartData, setChartData] = useState({
//     labels: [],
//     datasets: []
//   });
//   const [chartLoading, setChartLoading] = useState(true);

//   // Fetch chart data
//   const fetchChartData = async () => {
//     try {
//       setChartLoading(true);
//       const response = await fetchPartnerUtilizationLast7Days();
//       console.log("Chart API Response:", response);
      
//       if (response.status && response.data) {
//         const transformedData = transformUtilizationDataForChart(response.data);
//         setChartData(transformedData);
//       } else {
//         console.error("Failed to fetch chart data:", response.message);
//         setChartData({
//           labels: [],
//           datasets: []
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching chart data:", error);
//       setChartData({
//         labels: [],
//         datasets: []
//       });
//     } finally {
//       setChartLoading(false);
//     }
//   };

//   // Transform API data to chart.js format
//   const transformUtilizationDataForChart = (apiData) => {
//     if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
//       return {
//         labels: [],
//         datasets: []
//       };
//     }

//     return {
//       labels: apiData.map(item => item.formatted_date || item.date),
//       datasets: [
//         {
//           label: "Max Download (Mbps)",
//           data: apiData.map(item => item.max_download_mbps || 0),
//           borderColor: "#ef4444",
//           backgroundColor: "rgba(239, 68, 68, 0.2)",
//           tension: 0.3,
//           fill: false,
//           borderWidth: 2,
//         },
//         {
//           label: "Max Upload (Mbps)",
//           data: apiData.map(item => item.max_upload_mbps || 0),
//           borderColor: "#06b6d4",
//           backgroundColor: "rgba(6, 182, 212, 0.2)",
//           tension: 0.3,
//           fill: false,
//           borderWidth: 2,
//         },
//       ],
//     };
//   };

//   // Fetch all utilization alerts
//   const fetchAllUtilizationAlerts = async () => {
//     try {
//       const [
//         downloadResponse,
//         uploadResponse,
//         minDownloadResponse,
//         minUploadResponse
//       ] = await Promise.all([
//         fetchPartnerDownloadUtilizationAlert().catch(error => {
//           console.error("Download Utilization API error:", error);
//           return { status: false, data: [], row_count: 0 };
//         }),
//         fetchPartnerUploadUtilizationAlert().catch(error => {
//           console.error("Upload Utilization API error:", error);
//           return { status: false, data: [], row_count: 0 };
//         }),
//         fetchPartnerMinDownloadUtilizationAlert().catch(error => {
//           console.error("Min Download Utilization API error:", error);
//           return { status: false, data: [], row_count: 0 };
//         }),
//         fetchPartnerMinUploadUtilizationAlert().catch(error => {
//           console.error("Min Upload Utilization API error:", error);
//           return { status: false, data: [], row_count: 0 };
//         })
//       ]);

//       // Set download alerts
//       if (downloadResponse.status && downloadResponse.data) {
//         setDownloadUtilizationAlerts(downloadResponse.data);
//         setDownloadUtilizationCount(downloadResponse.row_count || downloadResponse.data.length);
//       }

//       // Set upload alerts
//       if (uploadResponse.status && uploadResponse.data) {
//         setUploadUtilizationAlerts(uploadResponse.data);
//         setUploadUtilizationCount(uploadResponse.row_count || uploadResponse.data.length);
//       }

//       // Set min download alerts
//       if (minDownloadResponse.status && minDownloadResponse.data) {
//         setMinDownloadUtilizationAlerts(minDownloadResponse.data);
//         setMinDownloadUtilizationCount(minDownloadResponse.row_count || minDownloadResponse.data.length);
//       }

//       // Set min upload alerts
//       if (minUploadResponse.status && minUploadResponse.data) {
//         setMinUploadUtilizationAlerts(minUploadResponse.data);
//         setMinUploadUtilizationCount(minUploadResponse.row_count || minUploadResponse.data.length);
//       }

//       // Initialize alert status map for all utilization alerts
//       const allAlertsMap = new Map();
      
//       [downloadResponse.data, uploadResponse.data, minDownloadResponse.data, minUploadResponse.data]
//         .flat()
//         .forEach(alert => {
//           if (alert.nttn_work_order_id) {
//             allAlertsMap.set(alert.nttn_work_order_id, "running");
//           }
//         });
      
//       setAlertStatusMap(prev => new Map([...prev, ...allAlertsMap]));

//     } catch (error) {
//       console.error("Error fetching utilization alerts:", error);
//     }
//   };

//   const fetchAllDashboardData = async () => {
//     try {
//       setInitialLoading(true);
      
//       const apiCalls = [
//         getPartnerInfos().catch(error => {
//           console.error("Partner Infos API error:", error);
//           return { data: [] };
//         }),
//         getAggregators().catch(error => {
//           console.error("Aggregators API error:", error);
//           return [];
//         }),
//         getMaxUtilizationAlert().catch(error => {
//           console.error("Max Utilization API error:", error);
//           return [];
//         }),
//         getMinUtilizationAlert().catch(error => {
//           console.error("Min Utilization API error:", error);
//           return [];
//         }),
//         getICMPAlert().catch(error => {
//           console.error("ICMP Alert API error:", error);
//           return { data: [] };
//         }),
//         getMinMaxUtilizationLastSevenDays().catch(error => {
//           console.error("Min Max Utilization API error:", error);
//           return [];
//         }),
//         fetchPartnerAggreatorSummary().catch(error => {
//           console.error("Aggregator Summary API error:", error);
//           return { aggregator_summary: [], aggregator_count: 0 };
//         }),
//         fetchPartnerPartnerCountSummary().catch(error => {
//           console.error("Partner Summary API error:", error);
//           return { aggregator_summary: [], aggregator_count: 0 };
//         })
//       ];

//       const [
//         infoResponse,
//         aggResponse,
//         maxUtilResponse,
//         minUtilResponse,
//         icmpResponse,
//         minMaxUtilResponse,
//         aggregatorSummaryResponse,
//         partnerSummaryResponse
//       ] = await Promise.all(apiCalls);

//       setPartnerInfos(infoResponse.data || []);
//       setAggregators(aggResponse || []);
//       setMaxUtilizationAlert(maxUtilResponse || []);
//       setMinUtilizationAlert(minUtilResponse || []);
//       setIcmpAlert(icmpResponse.data || []);
//       setMinMaxUtilizationSevenDays(minMaxUtilResponse || []);
      
//       setAggregatorSummary(aggregatorSummaryResponse.aggregator_summary || []);
//       setAggregatorCount(aggregatorSummaryResponse.aggregator_count || 0);
      
//       setPartnerSummary(partnerSummaryResponse.aggregator_summary || []);
//       setPartnerCount(partnerSummaryResponse.aggregator_count || 0);

//       // Fetch all utilization alerts
//       await fetchAllUtilizationAlerts();
//     } catch (err) {
//       console.error("Dashboard API call error:", err);
//     } finally {
//       setInitialLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllDashboardData();
//     fetchChartData();
//   }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setInitialLoading(false);
//     }, 800);
//     return () => clearTimeout(timer);
//   }, []);

//   const { totalMetrics } = useMemo(() => {
//     return {
//       totalMetrics: {
//         maxDownloadAlertCount: downloadUtilizationCount,
//         maxUploadAlertCount: uploadUtilizationCount,
//         minDownloadAlertCount: minDownloadUtilizationCount,
//         minUploadAlertCount: minUploadUtilizationCount,
//         icmpAlertCount: icmpAlert.length,
//         partnerCount: partnerCount,
//         aggregatorCount: aggregatorCount,
//       },
//     };
//   }, [
//     downloadUtilizationCount,
//     uploadUtilizationCount,
//     minDownloadUtilizationCount,
//     minUploadUtilizationCount,
//     icmpAlert.length,
//     partnerCount,
//     aggregatorCount
//   ]);

//   const { dynamicTableData, baseAlertCount } = useMemo(() => {
//     let baseAlertData = [];
//     let titlePrefix = '';

//     if (activeCard === "partners") {
//       return {
//         dynamicTableData: partnerSummary,
//         baseAlertCount: partnerSummary.length,
//       };
//     }
//     if (activeCard === "aggregators") {
//       return {
//         dynamicTableData: aggregatorSummary,
//         baseAlertCount: aggregatorSummary.length,
//       };
//     }

//     // Handle all utilization alert types
//     if (activeCard === "max_download_alert") {
//       baseAlertData = downloadUtilizationAlerts;
//       titlePrefix = "Max Download Utilization";
//     } else if (activeCard === "max_upload_alert") {
//       baseAlertData = uploadUtilizationAlerts;
//       titlePrefix = "Max Upload Utilization";
//     } else if (activeCard === "min_download_alert") {
//       baseAlertData = minDownloadUtilizationAlerts;
//       titlePrefix = "Min Download Utilization";
//     } else if (activeCard === "min_upload_alert") {
//       baseAlertData = minUploadUtilizationAlerts;
//       titlePrefix = "Min Upload Utilization";
//     } else if (activeCard === "icmp_alert") {
//       baseAlertData = icmpAlert;
//       titlePrefix = "ICMP";
//     } else {
//       return { dynamicTableData: [], baseAlertCount: 0 };
//     }

//     const countBeforeFilter = baseAlertData.length;

//     const dataWithCurrentStatus = baseAlertData.map((row) => {
//       const currentStatus = alertStatusMap.get(row.nttn_work_order_id || row.nttn_link_id) || "running";
//       return { ...row, current_alert_status: currentStatus };
//     });

//     const finalFilteredData = dataWithCurrentStatus.filter((row) => {
//       const status = row.current_alert_status;
//       if (actionFilter === "all") return true;
//       if (actionFilter === "running") return status === "running";
//       if (actionFilter === "paused") return status === "paused";
//       if (actionFilter === "resolved") return status === "resolved";
//       if (actionFilter === "unresolved")
//         return status === "running" || status === "paused";
//       return true;
//     });

//     let filterSuffix = "";
//     if (actionFilter === "running") filterSuffix = " (Running:";
//     else if (actionFilter === "paused") filterSuffix = " (Paused:";
//     else if (actionFilter === "resolved") filterSuffix = " (Resolved:";
//     else if (actionFilter === "unresolved") filterSuffix = " (Unresolved:";
//     else if (actionFilter === "all") filterSuffix = " (All:";

//     setDynamicTableTitle(
//       `${titlePrefix} Alerts${filterSuffix} ${finalFilteredData.length})`
//     );

//     return {
//       dynamicTableData: finalFilteredData,
//       baseAlertCount: countBeforeFilter,
//     };
//   }, [
//     activeCard,
//     actionFilter,
//     alertStatusMap,
//     downloadUtilizationAlerts,
//     uploadUtilizationAlerts,
//     minDownloadUtilizationAlerts,
//     minUploadUtilizationAlerts,
//     icmpAlert,
//     aggregatorSummary,
//     partnerSummary
//   ]);

//   /* --- Action Handlers --- */
//   const handleRunPause = useCallback((alertId, newStatus) => {
//     setTableIsLoading(true);
//     setAlertStatusMap((prev) => {
//       const next = new Map(prev);
//       next.set(alertId, newStatus);
//       return next;
//     });
//     setTimeout(() => {
//       setTableIsLoading(false);
//     }, 300);
//   }, []);

//   const handleResolveClick = useCallback((row) => {
//     setAlertToResolve(row);
//     setShowResolveModal(true);
//   }, []);

//   const handleConfirmResolve = useCallback(() => {
//     if (alertToResolve) {
//       const alertId = alertToResolve.nttn_work_order_id || alertToResolve.nttn_link_id;
//       handleRunPause(alertId, "resolved");
//     }
//     setShowResolveModal(false);
//     setAlertToResolve(null);
//   }, [alertToResolve, handleRunPause]);

//   const handleActionFilterClick = useCallback(
//     (filter) => {
//       if (!["max_download_alert", "max_upload_alert", "min_download_alert", "min_upload_alert", "icmp_alert"].includes(activeCard))
//         return;
//       setTableIsLoading(true);
//       setActionFilter(filter);
//       setTimeout(() => {
//         setTableIsLoading(false);
//       }, 100);
//     },
//     [activeCard]
//   );

//   const handleStatCardClick = useCallback((type) => {
//     setTableIsLoading(true);
//     setActiveCard(type);
    
//     const isAlertCard = ['max_download_alert', 'max_upload_alert', 'min_download_alert', 'min_upload_alert', 'icmp_alert'].includes(type);
//     const initialActionFilter = isAlertCard ? 'running' : null;
//     setActionFilter(initialActionFilter); 
    
//     let columns = [];
//     if (type === 'max_download_alert') {
//       columns = getDownloadUtilizationColumns(handleRunPause, handleResolveClick); 
//     } else if (type === 'max_upload_alert') {
//       columns = getUploadUtilizationColumns(handleRunPause, handleResolveClick);
//     } else if (type === 'min_download_alert') {
//       columns = getMinDownloadUtilizationColumns(handleRunPause, handleResolveClick);
//     } else if (type === 'min_upload_alert') {
//       columns = getMinUploadUtilizationColumns(handleRunPause, handleResolveClick);
//     } else if (type === 'icmp_alert') { 
//       columns = getICMPAlertColumns(handleRunPause, handleResolveClick);
//     } else if (type === 'partners') {
//       columns = PARTNER_COLUMNS;
//     } else if (type === 'aggregators') {
//       columns = AGGREGATOR_COLUMNS;
//     }
    
//     setTimeout(() => {
//       setDynamicTableColumns(columns);
//       setTableIsLoading(false);
//     }, 300);
//   }, [handleRunPause, handleResolveClick]);

//   const utilizationChartOptions = useMemo(
//     () => ({
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: { 
//         legend: { 
//           position: "top",
//           labels: {
//             usePointStyle: true,
//             padding: 20,
//           }
//         },
//         tooltip: {
//           callbacks: {
//             label: function(context) {
//               let label = context.dataset.label || '';
//               if (label) {
//                 label += ': ';
//               }
//               if (context.parsed.y !== null) {
//                 label += `${context.parsed.y} Mbps`;
//               }
//               return label;
//             }
//           }
//         }
//       },
//       scales: {
//         x: {
//           grid: {
//             display: false
//           }
//         },
//         y: { 
//           beginAtZero: true,
//           title: {
//             display: true,
//             text: 'Mbps'
//           },
//           grid: {
//             color: 'rgba(0, 0, 0, 0.1)',
//           }
//         },
//       },
//       interaction: {
//         intersect: false,
//         mode: 'index',
//       },
//     }),
//     []
//   );

//   // --- Render ---
//   return (
//     <div className='min-h-screen bg-gray-50 p-6 space-y-8'>
//       <div className='flex justify-between items-end pb-4 border-b border-gray-200'>
//         <div>
//           <h1 className='text-3xl font-extrabold text-gray-900'>Dashboard</h1>
//           <p className='text-sm text-gray-500'>
//             Overview of NTTN link performance and capacity.
//           </p>
//         </div>
//       </div>

//       <div className='space-y-4'>
//         {/* <div className="flex gap-4"> */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

//           {initialLoading ? (
//             Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
//           ) : (
//             <>
//               <HealthStatCard
//                 title='Max Download Utilization Alert'
//                 value={totalMetrics.maxDownloadAlertCount}
//                 subLabel='Download Utilization threshold exceeded'
//                 icon={ArrowDown}
//                 iconBgClass='bg-red-100'
//                 iconTextClass='text-red-600'
//                 valueClass={
//                   activeCard === "max_download_alert"
//                     ? "text-red-700 underline"
//                     : "text-red-600"
//                 }
//                 onClick={() => handleStatCardClick("max_download_alert")}
//               />

//               <HealthStatCard
//                 title='Max Upload Utilization Alert'
//                 value={totalMetrics.maxUploadAlertCount}
//                 subLabel='Upload Utilization threshold exceeded'
//                 icon={ArrowUp}
//                 iconBgClass='bg-red-100'
//                 iconTextClass='text-red-600'
//                 valueClass={
//                   activeCard === "max_upload_alert"
//                     ? "text-red-700 underline"
//                     : "text-red-600"
//                 }
//                 onClick={() => handleStatCardClick("max_upload_alert")}
//               />

//               <HealthStatCard
//                 title='Min Download Alert'
//                 value={totalMetrics.minDownloadAlertCount}
//                 subLabel='Under utilization detected'
//                 icon={ArrowDown}
//                 iconBgClass='bg-blue-100'
//                 iconTextClass='text-blue-600'
//                 valueClass={
//                   activeCard === "min_download_alert"
//                     ? "text-blue-700 underline"
//                     : "text-blue-600"
//                 }
//                 onClick={() => handleStatCardClick("min_download_alert")}
//               />

//               <HealthStatCard
//                 title='Min Upload Alert'
//                 value={totalMetrics.minUploadAlertCount}
//                 subLabel='Under utilization detected'
//                 icon={ArrowUp}
//                 iconBgClass='bg-cyan-100'
//                 iconTextClass='text-cyan-600'
//                 valueClass={
//                   activeCard === "min_upload_alert"
//                     ? "text-cyan-700 underline"
//                     : "text-cyan-600"
//                 }
//                 onClick={() => handleStatCardClick("min_upload_alert")}
//               />

//               {/* ICMP Alert Card */}
//               <HealthStatCard
//                 title='ICMP Latency Alerts'
//                 value={totalMetrics.icmpAlertCount}
//                 subLabel='Network issues detected'
//                 icon={Clock}
//                 iconBgClass='bg-orange-100'
//                 iconTextClass='text-orange-600'
//                 valueClass={
//                   activeCard === "icmp_alert"
//                     ? "text-orange-700 underline"
//                     : "text-orange-600"
//                 }
//                 onClick={() => handleStatCardClick("icmp_alert")}
//               />

//               <HealthStatCard
//                 title='ICMP Latency Alerts'
//                 value={totalMetrics.icmpAlertCount}
//                 subLabel='Network issues detected'
//                 icon={Clock}
//                 iconBgClass='bg-orange-100'
//                 iconTextClass='text-orange-600'
//                 valueClass={
//                   activeCard === "icmp_alert"
//                     ? "text-orange-700 underline"
//                     : "text-orange-600"
//                 }
//                 onClick={() => handleStatCardClick("icmp_alert")}
//               />

//               {/* Partners */}
//               <HealthStatCard
//                 title='Partners'
//                 value={totalMetrics.partnerCount}
//                 subLabel='Total number of partners'
//                 icon={Users}
//                 iconBgClass='bg-indigo-100'
//                 iconTextClass='text-indigo-600'
//                 valueClass={
//                   activeCard === "partners"
//                     ? "text-indigo-700 underline"
//                     : "text-gray-800"
//                 }
//                 onClick={() => handleStatCardClick("partners")}
//               />

//               {/* Aggregators */}
//               <HealthStatCard
//                 title='Aggregators'
//                 value={totalMetrics.aggregatorCount}
//                 subLabel='Total number of aggregators'
//                 icon={Layers}
//                 iconBgClass='bg-yellow-100'
//                 iconTextClass='text-yellow-600'
//                 valueClass={
//                   activeCard === "aggregators"
//                     ? "text-yellow-700 underline"
//                     : "text-gray-800"
//                 }
//                 onClick={() => handleStatCardClick("aggregators")}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {/* Dynamic Data Table */}
//       <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200'>
//         <div className='flex justify-between items-center mb-4'>
//           <h2 className='text-xl font-semibold text-gray-800'>
//             {dynamicTableTitle}
//           </h2>

//           {/* Filter Buttons */}
//           {["max_download_alert", "max_upload_alert", "min_download_alert", "min_upload_alert", "icmp_alert"].includes(activeCard) &&
//             baseAlertCount > 0 && (
//               <div className='flex space-x-2'>
//                 <Button
//                   variant={actionFilter === "all" ? "solid" : "ghost"}
//                   onClick={() => handleActionFilterClick("all")}
//                   size='sm'
//                   leftIcon={Filter}>
//                   All
//                 </Button>
//                 <Button
//                   variant={actionFilter === "unresolved" ? "solid" : "ghost"}
//                   onClick={() => handleActionFilterClick("unresolved")}
//                   size='sm'
//                   leftIcon={AlertCircle}>
//                   Unresolved
//                 </Button>
//                 <Button
//                   variant={actionFilter === "running" ? "solid" : "ghost"}
//                   onClick={() => handleActionFilterClick("running")}
//                   size='sm'
//                   leftIcon={Play}>
//                   Running
//                 </Button>
//                 <Button
//                   variant={actionFilter === "paused" ? "solid" : "ghost"}
//                   onClick={() => handleActionFilterClick("paused")}
//                   size='sm'
//                   leftIcon={Pause}>
//                   Paused
//                 </Button>
//                 <Button
//                   variant={actionFilter === "resolved" ? "solid" : "ghost"}
//                   onClick={() => handleActionFilterClick("resolved")}
//                   size='sm'
//                   leftIcon={CheckCircle}>
//                   Resolved
//                 </Button>
//               </div>
//             )}
//         </div>

//         {tableIsLoading || initialLoading ? (
//           <TableSkeleton />
//         ) : (
//           <DataTable
//             data={dynamicTableData}
//             columns={dynamicTableColumns}
//             selection={true}
//             onSelectionChange={() => {}}
//             initialPageSize={5}
//             rowKey={(row) => row.nttn_work_order_id || row.nttn_link_id || row.id}
//           />
//         )}
//       </div>

//       {/* Updated Utilization Chart Section */}
//       <div className='space-y-4'>
//         <div className="flex justify-between items-center">
//           <h2 className='text-xl font-semibold text-gray-800'>
//             Max Download & Upload Utilization (Last 7 Days)
//           </h2>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={fetchChartData}
//             disabled={chartLoading}
//             leftIcon={RefreshCw}
//             className={chartLoading ? "animate-spin" : ""}
//           >
//             {chartLoading ? "Refreshing..." : "Refresh Data"}
//           </Button>
//         </div>
//         <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-96 relative'>
//           <div className='h-[calc(100%-40px)]'>
//             {chartLoading ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//                   <p className="text-gray-500 mt-2">Loading chart data...</p>
//                 </div>
//               </div>
//             ) : chartData && chartData.labels && chartData.labels.length > 0 ? (
//               <Chart
//                 type='line'
//                 data={chartData}
//                 options={utilizationChartOptions}
//                 className='h-full'
//                 initialLoading={false}
//                 fallbackMessage='No utilization data found.'
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full">
//                 <p className="text-gray-500">No utilization data available for the last 7 days</p>
//               </div>
//             )}
//           </div>
//         </div>
//         {chartData && chartData.labels && chartData.labels.length > 0 && (
//           <div className="text-sm text-gray-500 text-center">
//             Showing maximum download and upload speeds in Mbps for the last 7 days
//           </div>
//         )}
//       </div>

//       {/* Confirmation Modal Render */}
//       <ConfirmationModal
//         isOpen={showResolveModal}
//         onClose={() => setShowResolveModal(false)}
//         onConfirm={handleConfirmResolve}
//         title='Confirm Alert Resolution'
//         message='Are you sure you want to mark this alert as resolved? This action will remove it from the active alert count.'
//         linkId={alertToResolve?.nttn_work_order_id || alertToResolve?.nttn_link_id}
//       />
//     </div>
//   );
// }








// src/pages/PartnerDashboard.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import {
  ArrowUp, // Max Upload
  ArrowDown,
  AlertTriangle, // Max Utilization Alert
  Minimize2, // Min Utilization Alert
  WifiOff, // NEW: ICMP Alert Icon (Representing connectivity issues)
  Users, // Partners
  Layers, // Aggregators
  Filter,
  Play, // Running Icon
  Pause, // Pause Icon
  CheckCircle, // Resolved Icon
  XCircle, // Cancel Icon
  AlertCircle, // Modal Icon
  Clock, // NEW: Delay icon
  Timer,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "chartjs-adapter-date-fns";
// Assume these components are imported from the existing structure
import DataTable from "../components/table/DataTable";
import Chart from "../components/charts/Chart";
import Button from "../components/ui/Button";

import {
  getPartnerInfos,
  getAggregators,
  getMaxUtilizationAlert,
  getMinUtilizationAlert,
  getICMPAlert,
  getMinMaxUtilizationLastSevenDays,
} from "../services/partner-link/dashboardApi";
import { 
  fetchPartnerAggreatorSummary, 
  fetchPartnerPartnerCountSummary, 
  fetchPartnerUtilizationLast7Days,
  fetchPartnerDownloadUtilizationAlert,
  fetchPartnerUploadUtilizationAlert,
  fetchPartnerMinDownloadUtilizationAlert,
  fetchPartnerMinUploadUtilizationAlert
} from "../services/partner-link/partnerDashboard";

/* -------------------------------------------------
   1. HELPER FUNCTIONS & UI ELEMENTS (UNCHANGED)
   ------------------------------------------------- */

function safeCell(v) {
  if (v === null || v === undefined || v === "")
    return <span className='text-gray-400'>—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

const CardSkeleton = () => (
  <div className='h-28 bg-gray-200 rounded-xl animate-pulse'></div>
);
const TableSkeleton = () => (
  <div className='h-[400px] bg-gray-200 rounded-xl animate-pulse'></div>
);

const HealthStatCard = ({
  title,
  value,
  subLabel,
  icon: Icon,
  valueClass,
  iconBgClass,
  iconTextClass,
  onClick,
}) => (
  <button
    onClick={onClick}
    className='flex-1 min-w-[180px] min-h-[140px] p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
    disabled={!onClick}>
    <div className='flex items-start justify-between'>
      <div className={clsx("p-3 rounded-full", iconBgClass, iconTextClass)}>
        <Icon className='w-7 h-7' />
      </div>
    </div>
    <div className='mt-4'>
      <p className={clsx("text-3xl font-bold", valueClass)}>{value}</p>
      <p className='text-sm text-gray-500 mt-1'>{title}</p>
      {subLabel && <p className='text-xs text-gray-400 mt-0.5'>{subLabel}</p>}
    </div>
  </button>
);

/* -------------------------------------------------
   1.1 MODAL COMPONENT (UNCHANGED)
   ------------------------------------------------- */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  linkId,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className='fixed inset-0 z-50 overflow-y-auto'
      aria-labelledby='modal-title'
      role='dialog'
      aria-modal='true'>
      <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        {/* Background overlay */}
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          aria-hidden='true'></div>

        {/* Modal panel */}
        <span
          className='hidden sm:inline-block sm:align-middle sm:h-screen'
          aria-hidden='true'>
          &#8203;
        </span>
        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                <AlertCircle
                  className='h-6 w-6 text-red-600'
                  aria-hidden='true'
                />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                <h3
                  className='text-lg leading-6 font-medium text-gray-900'
                  id='modal-title'>
                  {title}
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>{message}</p>
                  <p className='text-sm font-semibold text-gray-700 mt-1'>
                    Link ID: {linkId}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <Button
              onClick={onConfirm}
              variant='solid'
              color='red'
              leftIcon={CheckCircle}
              className='w-full sm:ml-3 sm:w-auto'>
              Confirm Resolve
            </Button>
            <Button
              onClick={onClose}
              variant='ghost'
              leftIcon={XCircle}
              className='mt-3 w-full sm:mt-0 sm:w-auto'>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   3. COLUMN DEFINITION FUNCTION (UPDATED WITH STATUS COLUMN)
   ------------------------------------------------- */

// Reusable action column render function (UPDATED)
const renderAlertActions = (row, handleRunPause, handleResolveClick) => {
  const status = row.current_alert_status || row.status;
  const isResolved = status === "resolved";

  // --- 1. Run/Pause Button Logic ---
  let runPauseLabel, RunPauseIcon, runPauseColorClass, nextRunPauseStatus;

  if (status === "running") {
    runPauseLabel = "Pause";
    RunPauseIcon = Pause;
    runPauseColorClass = "text-yellow-600 border-yellow-200 hover:bg-yellow-50";
    nextRunPauseStatus = "paused";
  } else if (status === "paused") {
    runPauseLabel = "Run";
    RunPauseIcon = Play;
    runPauseColorClass = "text-blue-600 border-blue-200 hover:bg-blue-50";
    nextRunPauseStatus = "running";
  }

  // --- 2. Resolved Button/Display Logic ---
  if (isResolved) {
    return (
      <div className='flex justify-center'>
        <Button
          variant='ghost'
          size='sm'
          className='text-green-600 border-green-200 opacity-60 cursor-not-allowed border disabled:opacity-60'
          leftIcon={CheckCircle}
          disabled={true}>
          Resolved
        </Button>
      </div>
    );
  }

  // --- Unresolved State (Running or Paused) - Show both actions ---
  return (
    <div className='flex justify-center space-x-2'>
      {/* Run/Pause Toggle Button */}
      <Button
        key={`${row.nttn_work_order_id}-runpause`}
        variant='ghost'
        size='sm'
        className={clsx(runPauseColorClass, "border")}
        onClick={() => handleRunPause(row.nttn_work_order_id, nextRunPauseStatus)}
        leftIcon={RunPauseIcon}>
        {runPauseLabel}
      </Button>

      {/* Resolve Button */}
      <Button
        key={`${row.nttn_work_order_id}-resolve`}
        variant='ghost'
        size='sm'
        className='text-green-600 border-green-200 hover:bg-green-50 border'
        onClick={() => handleResolveClick(row)}
        leftIcon={CheckCircle}>
        Resolve
      </Button>
    </div>
  );
};

// Status badge renderer
const renderStatusBadge = (status) => {
  let badgeClass = "";
  let displayText = "";

  switch (status) {
    case "running":
      badgeClass = "bg-green-100 text-green-800";
      displayText = "Running";
      break;
    case "paused":
      badgeClass = "bg-yellow-100 text-yellow-800";
      displayText = "Paused";
      break;
    case "resolved":
      badgeClass = "bg-gray-100 text-gray-800";
      displayText = "Resolved";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800";
      displayText = "Unknown";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        badgeClass
      )}>
      {displayText}
    </span>
  );
};

// Columns for Download Utilization Alerts (Max)
const getDownloadUtilizationColumns = (handleRunPause, handleResolveClick) => [
  { key: "client_name", header: "Client Name" },
  { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
  { key: "nas_ip", header: "NAS IP" },
  { key: "interface_port", header: "Interface Port" },
  { 
    key: "request_capacity", 
    header: "Request Capacity",
    render: (val) => `${safeCell(val)} Mbps`
  },
  {
    key: "consecutive_days",
    header: "Alert Configuration",
    render: (v) => (
      <div className='text-sm text-gray-700'>
        {safeCell(v)}
      </div>
    ),
  },
  {
    key: "avg_utilization_percent",
    header: "Avg Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "max_utilization_percent",
    header: "Max Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "status",
    header: "Status",
    render: (v, row) => renderStatusBadge(row.current_alert_status || row.status),
  },
  // {
  //   key: "actions",
  //   header: "Actions",
  //   align: "center",
  //   width: "18rem",
  //   isSortable: false,
  //   render: (v, row) =>
  //     renderAlertActions(row, handleRunPause, handleResolveClick),
  // },
];

// Columns for Upload Utilization Alerts (Max)
const getUploadUtilizationColumns = (handleRunPause, handleResolveClick) => [
  { key: "client_name", header: "Client Name" },
  { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
  { key: "nas_ip", header: "NAS IP" },
  { key: "interface_port", header: "Interface Port" },
  { 
    key: "request_capacity", 
    header: "Request Capacity",
    render: (val) => `${safeCell(val)} Mbps`
  },
  {
    key: "consecutive_days",
    header: "Alert Configuration",
    render: (v) => (
      <div className='text-sm text-gray-700'>
        {safeCell(v)}
      </div>
    ),
  },
  {
    key: "avg_utilization_percent",
    header: "Avg Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "max_utilization_percent",
    header: "Max Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "status",
    header: "Status",
    render: (v, row) => renderStatusBadge(row.current_alert_status || row.status),
  },
  // {
  //   key: "actions",
  //   header: "Actions",
  //   align: "center",
  //   width: "18rem",
  //   isSortable: false,
  //   render: (v, row) =>
  //     renderAlertActions(row, handleRunPause, handleResolveClick),
  // },
];

// Columns for Min Download Utilization Alerts
const getMinDownloadUtilizationColumns = (handleRunPause, handleResolveClick) => [
  { key: "client_name", header: "Client Name" },
  { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
  { key: "nas_ip", header: "NAS IP" },
  { key: "interface_port", header: "Interface Port" },
  { 
    key: "request_capacity", 
    header: "Request Capacity",
    render: (val) => `${safeCell(val)} Mbps`
  },
  {
    key: "consecutive_days",
    header: "Alert Configuration",
    render: (v) => (
      <div className='text-sm text-gray-700'>
        {safeCell(v)}
      </div>
    ),
  },
  {
    key: "avg_utilization_percent",
    header: "Avg Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "min_utilization_percent",
    header: "Min Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "status",
    header: "Status",
    render: (v, row) => renderStatusBadge(row.current_alert_status || row.status),
  },
  // {
  //   key: "actions",
  //   header: "Actions",
  //   align: "center",
  //   width: "18rem",
  //   isSortable: false,
  //   render: (v, row) =>
  //     renderAlertActions(row, handleRunPause, handleResolveClick),
  // },
];

// Columns for Min Upload Utilization Alerts
const getMinUploadUtilizationColumns = (handleRunPause, handleResolveClick) => [
  { key: "client_name", header: "Client Name" },
  { key: "nttn_work_order_id", header: "NTTN Work Order ID" },
  { key: "nas_ip", header: "NAS IP" },
  { key: "interface_port", header: "Interface Port" },
  { 
    key: "request_capacity", 
    header: "Request Capacity",
    render: (val) => `${safeCell(val)} Mbps`
  },
  {
    key: "consecutive_days",
    header: "Alert Configuration",
    render: (v) => (
      <div className='text-sm text-gray-700'>
        {safeCell(v)}
      </div>
    ),
  },
  {
    key: "avg_utilization_percent",
    header: "Avg Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "min_utilization_percent",
    header: "Min Utilization (%)",
    render: (v) => {
      const pct = parseFloat(v);
      let color = "text-gray-800";
      if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }
      return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
    },
  },
  {
    key: "status",
    header: "Status",
    render: (v, row) => renderStatusBadge(row.current_alert_status || row.status),
  },
  // {
  //   key: "actions",
  //   header: "Actions",
  //   align: "center",
  //   width: "18rem",
  //   isSortable: false,
  //   render: (v, row) =>
  //     renderAlertActions(row, handleRunPause, handleResolveClick),
  // },
];

// Utilization Columns (For other utilization alerts)
const getUtilizationColumns = (handleRunPause, handleResolveClick) => [
  { key: "partner_name", header: "Partner Name" },
  { key: "nttn_link_id", header: "NTTN Link ID " },
  { key: "purchased_capacity", header: "Purchased Capacity" },
  {
    key: "alert_config",
    header: "Alert Configuration",
    render: (v, row) => (
      <div className='text-sm text-gray-700'>
        {safeCell(row.daily_triggers)} times / day
        <span className='text-gray-400 mx-1'>|</span>
        {safeCell(row.alert_duration_days)} days
      </div>
    ),
  },
  {
    key: "utilization_pct",
    header: "Utilization (%)",
    render: (v, row) => {
      const pct = parseFloat(v);
      const status = row.current_alert_status;

      let color = "text-gray-800";
      if (status === "resolved") {
        color = "text-gray-500 line-through";
      } else if (pct > 100) {
        color = "text-red-600 font-bold";
      } else if (pct < 20) {
        color = "text-cyan-600 font-bold";
      }

      return (
        <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (v, row) => renderStatusBadge(row.current_alert_status),
  },
  // {
  //   key: "actions",
  //   header: "Actions",
  //   align: "center",
  //   width: "18rem",
  //   isSortable: false,
  //   render: (v, row) =>
  //     renderAlertActions(row, handleRunPause, handleResolveClick),
  // },
];

// MODIFIED: Columns for ICMP Alerts with custom rendering for 'alert_value'
const getICMPAlertColumns = (handleRunPause, handleResolveClick) => [
  { key: "partner_name", header: "Partner Name" },
  { key: "nttn_link_id", header: "NTTN Link ID" },
  {
    key: "icmp_status",
    header: "Alert Type",
    render: (v) => (
      <span
        className={clsx(
          "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
          v === "Timeout"
            ? "bg-red-100 text-red-900"
            : "bg-orange-100 text-orange-900"
        )}>
        {safeCell(v)}
      </span>
    ),
  },
  {
    key: "alert_value",
    header: "Alert Value",
    render: (v, row) => {
      let displayValue = safeCell(v);

      if (typeof v === "string") {
        if (row.icmp_status === "High Latency" && v.includes("ms Latency")) {
          displayValue = v.replace("ms Latency", " ms").trim();
        } else if (row.icmp_status === "Timeout") {
          const failureCountMatch = v.match(/(\d+)/);
          const count = failureCountMatch
            ? parseInt(failureCountMatch[0], 10)
            : 5;
          const simulatedDurationSeconds = count * 12;

          if (simulatedDurationSeconds >= 60) {
            const durationMinutes = (simulatedDurationSeconds / 60).toFixed(1);
            displayValue = `${durationMinutes} min`;
          } else {
            displayValue = `${simulatedDurationSeconds} sec`;
          }
        }
      }

      return (
        <span className='font-semibold text-gray-700 text-sm'>
          {displayValue}
        </span>
      );
    },
  },
  {
    key: "frequency",
    header: "Frequency",
    render: (v) => (
      <span className='font-semibold text-gray-700 text-sm'>{safeCell(v)}</span>
    ),
  },
  { key: "last_ping_time", header: "Last Ping" },
  {
    key: "status",
    header: "Status",
    render: (v, row) => renderStatusBadge(row.current_alert_status),
  },
  {
    key: "actions",
    header: "Actions",
    align: "center",
    width: "18rem",
    isSortable: false,
    render: (v, row) =>
      renderAlertActions(row, handleRunPause, handleResolveClick),
  },
];

const AGGREGATOR_COLUMNS = [
  { key: "aggregator_name", header: "Aggregator Name" },
  { 
    key: "total_clients", 
    header: "No. of Partners",
    render: (val) => safeCell(val)
  },
  { 
    key: "total_request_capacity", 
    header: "Purchase Capacity",
    render: (val) => `${safeCell(val)} Mbps`
  },
];

const PARTNER_COLUMNS = [
  { key: "partner_name", header: "Partner Name" },
  { key: "contact_person", header: "Contact Person" },
  {
    key: "location",
    header: "Location",
    render: (val) => (
      <span className='inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600'>
        {safeCell(val)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (v) => (
      <span
        className={clsx(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          v === "active" || v === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        )}>
        {safeCell(v)}
      </span>
    ),
  },
];

/* -------------------------------------------------
   4. PARTNER DASHBOARD COMPONENT
   ------------------------------------------------- */

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);

  const [alertStatusMap, setAlertStatusMap] = useState(new Map());

  const [dynamicTableColumns, setDynamicTableColumns] = useState([]);
  const [dynamicTableTitle, setDynamicTableTitle] = useState(
    "Select a card to view data"
  );
  const [activeCard, setActiveCard] = useState(null);
  const [tableIsLoading, setTableIsLoading] = useState(false);
  
  const [actionFilter, setActionFilter] = useState("all");

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState(null);

  // API states
  const [partnerInfos, setPartnerInfos] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [maxUtilizationAlert, setMaxUtilizationAlert] = useState([]);
  const [minUtilizationAlert, setMinUtilizationAlert] = useState([]);
  const [icmpAlert, setIcmpAlert] = useState([]);
  const [minMaxUtilizationSevenDays, setMinMaxUtilizationSevenDays] = useState([]);
  
  const [aggregatorSummary, setAggregatorSummary] = useState([]);
  const [aggregatorCount, setAggregatorCount] = useState(0);

  const [partnerSummary, setPartnerSummary] = useState([]);
  const [partnerCount, setPartnerCount] = useState(0);

  // Utilization Alert States
  const [downloadUtilizationAlerts, setDownloadUtilizationAlerts] = useState([]);
  const [downloadUtilizationCount, setDownloadUtilizationCount] = useState(0);
  
  const [uploadUtilizationAlerts, setUploadUtilizationAlerts] = useState([]);
  const [uploadUtilizationCount, setUploadUtilizationCount] = useState(0);
  
  const [minDownloadUtilizationAlerts, setMinDownloadUtilizationAlerts] = useState([]);
  const [minDownloadUtilizationCount, setMinDownloadUtilizationCount] = useState(0);
  
  const [minUploadUtilizationAlerts, setMinUploadUtilizationAlerts] = useState([]);
  const [minUploadUtilizationCount, setMinUploadUtilizationCount] = useState(0);

  // Chart state
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [chartLoading, setChartLoading] = useState(true);

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const response = await fetchPartnerUtilizationLast7Days();
      console.log("Chart API Response:", response);
      
      if (response.status && response.data) {
        const transformedData = transformUtilizationDataForChart(response.data);
        setChartData(transformedData);
      } else {
        console.error("Failed to fetch chart data:", response.message);
        setChartData({
          labels: [],
          datasets: []
        });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        labels: [],
        datasets: []
      });
    } finally {
      setChartLoading(false);
    }
  };

  // Transform API data to chart.js format
  const transformUtilizationDataForChart = (apiData) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels: apiData.map(item => item.formatted_date || item.date),
      datasets: [
        {
          label: "Max Download (Mbps)",
          data: apiData.map(item => item.max_download_mbps || 0),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          tension: 0.3,
          fill: false,
          borderWidth: 2,
        },
        {
          label: "Max Upload (Mbps)",
          data: apiData.map(item => item.max_upload_mbps || 0),
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.2)",
          tension: 0.3,
          fill: false,
          borderWidth: 2,
        },
      ],
    };
  };

  // Fetch all utilization alerts
  const fetchAllUtilizationAlerts = async () => {
    try {
      const [
        downloadResponse,
        uploadResponse,
        minDownloadResponse,
        minUploadResponse
      ] = await Promise.all([
        fetchPartnerDownloadUtilizationAlert().catch(error => {
          console.error("Download Utilization API error:", error);
          return { status: false, data: [], row_count: 0 };
        }),
        fetchPartnerUploadUtilizationAlert().catch(error => {
          console.error("Upload Utilization API error:", error);
          return { status: false, data: [], row_count: 0 };
        }),
        fetchPartnerMinDownloadUtilizationAlert().catch(error => {
          console.error("Min Download Utilization API error:", error);
          return { status: false, data: [], row_count: 0 };
        }),
        fetchPartnerMinUploadUtilizationAlert().catch(error => {
          console.error("Min Upload Utilization API error:", error);
          return { status: false, data: [], row_count: 0 };
        })
      ]);

      // Set download alerts
      if (downloadResponse.status && downloadResponse.data) {
        setDownloadUtilizationAlerts(downloadResponse.data);
        setDownloadUtilizationCount(downloadResponse.row_count || downloadResponse.data.length);
      }

      // Set upload alerts
      if (uploadResponse.status && uploadResponse.data) {
        setUploadUtilizationAlerts(uploadResponse.data);
        setUploadUtilizationCount(uploadResponse.row_count || uploadResponse.data.length);
      }

      // Set min download alerts
      if (minDownloadResponse.status && minDownloadResponse.data) {
        setMinDownloadUtilizationAlerts(minDownloadResponse.data);
        setMinDownloadUtilizationCount(minDownloadResponse.row_count || minDownloadResponse.data.length);
      }

      // Set min upload alerts
      if (minUploadResponse.status && minUploadResponse.data) {
        setMinUploadUtilizationAlerts(minUploadResponse.data);
        setMinUploadUtilizationCount(minUploadResponse.row_count || minUploadResponse.data.length);
      }

      // Initialize alert status map for all utilization alerts using API status
      const allAlertsMap = new Map();
      
      [downloadResponse.data, uploadResponse.data, minDownloadResponse.data, minUploadResponse.data]
        .flat()
        .forEach(alert => {
          if (alert.nttn_work_order_id) {
            // Use the status from API response directly
            allAlertsMap.set(alert.nttn_work_order_id, alert.status || "running");
          }
        });
      
      setAlertStatusMap(prev => new Map([...prev, ...allAlertsMap]));

    } catch (error) {
      console.error("Error fetching utilization alerts:", error);
    }
  };

  const fetchAllDashboardData = async () => {
    try {
      setInitialLoading(true);
      
      const apiCalls = [
        getPartnerInfos().catch(error => {
          console.error("Partner Infos API error:", error);
          return { data: [] };
        }),
        getAggregators().catch(error => {
          console.error("Aggregators API error:", error);
          return [];
        }),
        getMaxUtilizationAlert().catch(error => {
          console.error("Max Utilization API error:", error);
          return [];
        }),
        getMinUtilizationAlert().catch(error => {
          console.error("Min Utilization API error:", error);
          return [];
        }),
        getICMPAlert().catch(error => {
          console.error("ICMP Alert API error:", error);
          return { data: [] };
        }),
        getMinMaxUtilizationLastSevenDays().catch(error => {
          console.error("Min Max Utilization API error:", error);
          return [];
        }),
        fetchPartnerAggreatorSummary().catch(error => {
          console.error("Aggregator Summary API error:", error);
          return { aggregator_summary: [], aggregator_count: 0 };
        }),
        fetchPartnerPartnerCountSummary().catch(error => {
          console.error("Partner Summary API error:", error);
          return { aggregator_summary: [], aggregator_count: 0 };
        })
      ];

      const [
        infoResponse,
        aggResponse,
        maxUtilResponse,
        minUtilResponse,
        icmpResponse,
        minMaxUtilResponse,
        aggregatorSummaryResponse,
        partnerSummaryResponse
      ] = await Promise.all(apiCalls);

      setPartnerInfos(infoResponse.data || []);
      setAggregators(aggResponse || []);
      setMaxUtilizationAlert(maxUtilResponse || []);
      setMinUtilizationAlert(minUtilResponse || []);
      setIcmpAlert(icmpResponse.data || []);
      setMinMaxUtilizationSevenDays(minMaxUtilResponse || []);
      
      setAggregatorSummary(aggregatorSummaryResponse.aggregator_summary || []);
      setAggregatorCount(aggregatorSummaryResponse.aggregator_count || 0);
      
      setPartnerSummary(partnerSummaryResponse.aggregator_summary || []);
      setPartnerCount(partnerSummaryResponse.aggregator_count || 0);

      // Fetch all utilization alerts
      await fetchAllUtilizationAlerts();
    } catch (err) {
      console.error("Dashboard API call error:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
    fetchChartData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const { totalMetrics } = useMemo(() => {
    // Count only running alerts for the cards
    const runningDownloadAlerts = downloadUtilizationAlerts.filter(alert => 
      (alertStatusMap.get(alert.nttn_work_order_id) || alert.status) === "running"
    ).length;
    
    const runningUploadAlerts = uploadUtilizationAlerts.filter(alert => 
      (alertStatusMap.get(alert.nttn_work_order_id) || alert.status) === "running"
    ).length;
    
    const runningMinDownloadAlerts = minDownloadUtilizationAlerts.filter(alert => 
      (alertStatusMap.get(alert.nttn_work_order_id) || alert.status) === "running"
    ).length;
    
    const runningMinUploadAlerts = minUploadUtilizationAlerts.filter(alert => 
      (alertStatusMap.get(alert.nttn_work_order_id) || alert.status) === "running"
    ).length;

    return {
      totalMetrics: {
        maxDownloadAlertCount: runningDownloadAlerts,
        maxUploadAlertCount: runningUploadAlerts,
        minDownloadAlertCount: runningMinDownloadAlerts,
        minUploadAlertCount: runningMinUploadAlerts,
        icmpAlertCount: icmpAlert.length,
        partnerCount: partnerCount,
        aggregatorCount: aggregatorCount,
      },
    };
  }, [
    downloadUtilizationAlerts,
    uploadUtilizationAlerts,
    minDownloadUtilizationAlerts,
    minUploadUtilizationAlerts,
    alertStatusMap,
    icmpAlert.length,
    partnerCount,
    aggregatorCount
  ]);

  const { dynamicTableData, baseAlertCount } = useMemo(() => {
    let baseAlertData = [];
    let titlePrefix = '';

    if (activeCard === "partners") {
      return {
        dynamicTableData: partnerSummary,
        baseAlertCount: partnerSummary.length,
      };
    }
    if (activeCard === "aggregators") {
      return {
        dynamicTableData: aggregatorSummary,
        baseAlertCount: aggregatorSummary.length,
      };
    }

    // Handle all utilization alert types
    if (activeCard === "max_download_alert") {
      baseAlertData = downloadUtilizationAlerts;
      titlePrefix = "Max Download Utilization";
    } else if (activeCard === "max_upload_alert") {
      baseAlertData = uploadUtilizationAlerts;
      titlePrefix = "Max Upload Utilization";
    } else if (activeCard === "min_download_alert") {
      baseAlertData = minDownloadUtilizationAlerts;
      titlePrefix = "Min Download Utilization";
    } else if (activeCard === "min_upload_alert") {
      baseAlertData = minUploadUtilizationAlerts;
      titlePrefix = "Min Upload Utilization";
    } else if (activeCard === "icmp_alert") {
      baseAlertData = icmpAlert;
      titlePrefix = "ICMP";
    } else {
      return { dynamicTableData: [], baseAlertCount: 0 };
    }

    const countBeforeFilter = baseAlertData.length;

    const dataWithCurrentStatus = baseAlertData.map((row) => {
      const currentStatus = alertStatusMap.get(row.nttn_work_order_id || row.nttn_link_id) || row.status || "running";
      return { ...row, current_alert_status: currentStatus };
    });

    // Apply status-based filtering
    const finalFilteredData = dataWithCurrentStatus.filter((row) => {
      const status = row.current_alert_status;
      if (actionFilter === "all") return true;
      if (actionFilter === "running") return status === "running";
      if (actionFilter === "paused") return status === "paused";
      if (actionFilter === "resolved") return status === "resolved";
      if (actionFilter === "unresolved")
        return status === "running" || status === "paused";
      return true;
    });

    let filterSuffix = "";
    if (actionFilter === "running") filterSuffix = " (Running:";
    else if (actionFilter === "paused") filterSuffix = " (Paused:";
    else if (actionFilter === "resolved") filterSuffix = " (Resolved:";
    else if (actionFilter === "unresolved") filterSuffix = " (Unresolved:";
    else if (actionFilter === "all") filterSuffix = " (All:";

    setDynamicTableTitle(
      `${titlePrefix} Alerts${filterSuffix} ${finalFilteredData.length})`
    );

    return {
      dynamicTableData: finalFilteredData,
      baseAlertCount: countBeforeFilter,
    };
  }, [
    activeCard,
    actionFilter,
    alertStatusMap,
    downloadUtilizationAlerts,
    uploadUtilizationAlerts,
    minDownloadUtilizationAlerts,
    minUploadUtilizationAlerts,
    icmpAlert,
    aggregatorSummary,
    partnerSummary
  ]);

  /* --- Action Handlers --- */
  const handleRunPause = useCallback((alertId, newStatus) => {
    setTableIsLoading(true);
    setAlertStatusMap((prev) => {
      const next = new Map(prev);
      next.set(alertId, newStatus);
      return next;
    });
    setTimeout(() => {
      setTableIsLoading(false);
    }, 300);
  }, []);

  const handleResolveClick = useCallback((row) => {
    setAlertToResolve(row);
    setShowResolveModal(true);
  }, []);

  const handleConfirmResolve = useCallback(() => {
    if (alertToResolve) {
      const alertId = alertToResolve.nttn_work_order_id || alertToResolve.nttn_link_id;
      handleRunPause(alertId, "resolved");
    }
    setShowResolveModal(false);
    setAlertToResolve(null);
  }, [alertToResolve, handleRunPause]);

  const handleActionFilterClick = useCallback(
    (filter) => {
      if (!["max_download_alert", "max_upload_alert", "min_download_alert", "min_upload_alert", "icmp_alert"].includes(activeCard))
        return;
      setTableIsLoading(true);
      setActionFilter(filter);
      setTimeout(() => {
        setTableIsLoading(false);
      }, 100);
    },
    [activeCard]
  );

  const handleStatCardClick = useCallback((type) => {
    setTableIsLoading(true);
    setActiveCard(type);
    
    const isAlertCard = ['max_download_alert', 'max_upload_alert', 'min_download_alert', 'min_upload_alert', 'icmp_alert'].includes(type);
    const initialActionFilter = isAlertCard ? 'running' : null;
    setActionFilter(initialActionFilter); 
    
    let columns = [];
    if (type === 'max_download_alert') {
      columns = getDownloadUtilizationColumns(handleRunPause, handleResolveClick); 
    } else if (type === 'max_upload_alert') {
      columns = getUploadUtilizationColumns(handleRunPause, handleResolveClick);
    } else if (type === 'min_download_alert') {
      columns = getMinDownloadUtilizationColumns(handleRunPause, handleResolveClick);
    } else if (type === 'min_upload_alert') {
      columns = getMinUploadUtilizationColumns(handleRunPause, handleResolveClick);
    } else if (type === 'icmp_alert') { 
      columns = getICMPAlertColumns(handleRunPause, handleResolveClick);
    } else if (type === 'partners') {
      columns = PARTNER_COLUMNS;
    } else if (type === 'aggregators') {
      columns = AGGREGATOR_COLUMNS;
    }
    
    setTimeout(() => {
      setDynamicTableColumns(columns);
      setTableIsLoading(false);
    }, 300);
  }, [handleRunPause, handleResolveClick]);

  const utilizationChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y} Mbps`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: { 
          beginAtZero: true,
          title: {
            display: true,
            text: 'Mbps'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          }
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    }),
    []
  );

  // --- Render ---
  return (
    <div className='min-h-screen bg-gray-50 p-6 space-y-8'>
      <div className='flex justify-between items-end pb-4 border-b border-gray-200'>
        <div>
          <h1 className='text-3xl font-extrabold text-gray-900'>Dashboard</h1>
          <p className='text-sm text-gray-500'>
            Overview of NTTN link performance and capacity.
          </p>
        </div>
      </div>

      <div className='space-y-4'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {initialLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <HealthStatCard
                title='Max Download Utilization Alert'
                value={totalMetrics.maxDownloadAlertCount}
                subLabel='Download Utilization threshold exceeded'
                icon={ArrowDown}
                iconBgClass='bg-red-100'
                iconTextClass='text-red-600'
                valueClass={
                  activeCard === "max_download_alert"
                    ? "text-red-700 underline"
                    : "text-red-600"
                }
                onClick={() => handleStatCardClick("max_download_alert")}
              />

              <HealthStatCard
                title='Max Upload Utilization Alert'
                value={totalMetrics.maxUploadAlertCount}
                subLabel='Upload Utilization threshold exceeded'
                icon={ArrowUp}
                iconBgClass='bg-red-100'
                iconTextClass='text-red-600'
                valueClass={
                  activeCard === "max_upload_alert"
                    ? "text-red-700 underline"
                    : "text-red-600"
                }
                onClick={() => handleStatCardClick("max_upload_alert")}
              />

              <HealthStatCard
                title='Min Download Alert'
                value={totalMetrics.minDownloadAlertCount}
                subLabel='Under utilization detected'
                icon={ArrowDown}
                iconBgClass='bg-blue-100'
                iconTextClass='text-blue-600'
                valueClass={
                  activeCard === "min_download_alert"
                    ? "text-blue-700 underline"
                    : "text-blue-600"
                }
                onClick={() => handleStatCardClick("min_download_alert")}
              />

              <HealthStatCard
                title='Min Upload Alert'
                value={totalMetrics.minUploadAlertCount}
                subLabel='Under utilization detected'
                icon={ArrowUp}
                iconBgClass='bg-cyan-100'
                iconTextClass='text-cyan-600'
                valueClass={
                  activeCard === "min_upload_alert"
                    ? "text-cyan-700 underline"
                    : "text-cyan-600"
                }
                onClick={() => handleStatCardClick("min_upload_alert")}
              />

              {/* ICMP Alert Card */}
              <HealthStatCard
                title='ICMP Latency Alerts'
                value={totalMetrics.icmpAlertCount}
                subLabel='Network issues detected'
                icon={Clock}
                iconBgClass='bg-orange-100'
                iconTextClass='text-orange-600'
                valueClass={
                  activeCard === "icmp_alert"
                    ? "text-orange-700 underline"
                    : "text-orange-600"
                }
                onClick={() => handleStatCardClick("icmp_alert")}
              />

              <HealthStatCard
                title='ICMP Timeout Alerts'
                value={totalMetrics.icmpAlertCount}
                subLabel='Network issues detected'
                icon={WifiOff}
                iconBgClass='bg-orange-100'
                iconTextClass='text-orange-600'
                valueClass={
                  activeCard === "icmp_alert"
                    ? "text-orange-700 underline"
                    : "text-orange-600"
                }
                onClick={() => handleStatCardClick("icmp_alert")}
              />

              {/* Partners */}
              <HealthStatCard
                title='Partners'
                value={totalMetrics.partnerCount}
                subLabel='Total number of partners'
                icon={Users}
                iconBgClass='bg-indigo-100'
                iconTextClass='text-indigo-600'
                valueClass={
                  activeCard === "partners"
                    ? "text-indigo-700 underline"
                    : "text-gray-800"
                }
                onClick={() => handleStatCardClick("partners")}
              />

              {/* Aggregators */}
              <HealthStatCard
                title='Aggregators'
                value={totalMetrics.aggregatorCount}
                subLabel='Total number of aggregators'
                icon={Layers}
                iconBgClass='bg-yellow-100'
                iconTextClass='text-yellow-600'
                valueClass={
                  activeCard === "aggregators"
                    ? "text-yellow-700 underline"
                    : "text-gray-800"
                }
                onClick={() => handleStatCardClick("aggregators")}
              />
            </>
          )}
        </div>
      </div>

      {/* Dynamic Data Table */}
      <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>
            {dynamicTableTitle}
          </h2>

          {/* Filter Buttons */}
          {/* {["max_download_alert", "max_upload_alert", "min_download_alert", "min_upload_alert", "icmp_alert"].includes(activeCard) &&
            baseAlertCount > 0 && (
              <div className='flex space-x-2'>
                <Button
                  variant={actionFilter === "all" ? "solid" : "ghost"}
                  onClick={() => handleActionFilterClick("all")}
                  size='sm'
                  leftIcon={Filter}>
                  All
                </Button>
                <Button
                  variant={actionFilter === "unresolved" ? "solid" : "ghost"}
                  onClick={() => handleActionFilterClick("unresolved")}
                  size='sm'
                  leftIcon={AlertCircle}>
                  Unresolved
                </Button>
                <Button
                  variant={actionFilter === "running" ? "solid" : "ghost"}
                  onClick={() => handleActionFilterClick("running")}
                  size='sm'
                  leftIcon={Play}>
                  Running
                </Button>
                <Button
                  variant={actionFilter === "paused" ? "solid" : "ghost"}
                  onClick={() => handleActionFilterClick("paused")}
                  size='sm'
                  leftIcon={Pause}>
                  Paused
                </Button>
                <Button
                  variant={actionFilter === "resolved" ? "solid" : "ghost"}
                  onClick={() => handleActionFilterClick("resolved")}
                  size='sm'
                  leftIcon={CheckCircle}>
                  Resolved
                </Button>
              </div>
            )} */}
        </div>

        {tableIsLoading || initialLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            data={dynamicTableData}
            columns={dynamicTableColumns}
            selection={true}
            onSelectionChange={() => {}}
            initialPageSize={5}
            rowKey={(row) => row.nttn_work_order_id || row.nttn_link_id || row.id}
          />
        )}
      </div>

      {/* Updated Utilization Chart Section */}
      <div className='space-y-4'>
        <div className="flex justify-between items-center">
          <h2 className='text-xl font-semibold text-gray-800'>
            Max Download & Upload Utilization (Last 7 Days)
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchChartData}
            disabled={chartLoading}
            leftIcon={RefreshCw}
            className={chartLoading ? "animate-spin" : ""}
          >
            {chartLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
        <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-96 relative'>
          <div className='h-[calc(100%-40px)]'>
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading chart data...</p>
                </div>
              </div>
            ) : chartData && chartData.labels && chartData.labels.length > 0 ? (
              <Chart
                type='line'
                data={chartData}
                options={utilizationChartOptions}
                className='h-full'
                initialLoading={false}
                fallbackMessage='No utilization data found.'
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No utilization data available for the last 7 days</p>
              </div>
            )}
          </div>
        </div>
        {chartData && chartData.labels && chartData.labels.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing maximum download and upload speeds in Mbps for the last 7 days
          </div>
        )}
      </div>

      {/* Confirmation Modal Render */}
      <ConfirmationModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onConfirm={handleConfirmResolve}
        title='Confirm Alert Resolution'
        message='Are you sure you want to mark this alert as resolved? This action will remove it from the active alert count.'
        linkId={alertToResolve?.nttn_work_order_id || alertToResolve?.nttn_link_id}
      />
    </div>
  );
}