// import React, { useMemo, useState, useEffect, useCallback } from "react";
// import clsx from "clsx";
// import {
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
//   AlertCircle // Modal Icon
// } from "lucide-react";
// import { useNavigate } from 'react-router-dom';
// import 'chartjs-adapter-date-fns';
// // Assume these components are imported from the existing structure
// import DataTable from "../components/table/DataTable";
// import Chart from "../components/charts/Chart";
// import Button from "../components/ui/Button"; 

// /* -------------------------------------------------
//    1. HELPER FUNCTIONS & UI ELEMENTS (UNCHANGED)
//    ------------------------------------------------- */

// function safeCell(v) {
//   if (v === null || v === undefined || v === '') return <span className="text-gray-400">—</span>;
//   if (typeof v === "boolean") return v ? "Yes" : "No";
//   return String(v);
// }

// const CardSkeleton = () => <div className="h-28 bg-gray-200 rounded-xl animate-pulse"></div>;
// const TableSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>;

// const HealthStatCard = ({ title, value, subLabel, icon: Icon, valueClass, iconBgClass, iconTextClass, onClick }) => (
//   <button 
//     onClick={onClick}
//     className="flex-1 min-w-[180px] min-h-[140px] p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
//     disabled={!onClick}
//   >
//     <div className="flex items-start justify-between">
//       <div className={clsx("p-3 rounded-full", iconBgClass, iconTextClass)}>
//         <Icon className="w-7 h-7" /> 
//       </div>
//     </div>
//     <div className="mt-4">
//       <p className={clsx("text-3xl font-bold", valueClass)}>
//         {value}
//       </p>
//       <p className="text-sm text-gray-500 mt-1">{title}</p>
//       {subLabel && (
//         <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
//       )}
//     </div>
//   </button>
// );


// /* -------------------------------------------------
//    1.1 MODAL COMPONENT (UNCHANGED)
//    ------------------------------------------------- */
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, linkId }) => {
//     if (!isOpen) return null;
//     return (
//         <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
//             <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//                 {/* Background overlay */}
//                 <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

//                 {/* Modal panel */}
//                 <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//                 <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//                     <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                         <div className="sm:flex sm:items-start">
//                             <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                                 <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
//                             </div>
//                             <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                                 <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
//                                     {title}
//                                 </h3>
//                                 <div className="mt-2">
//                                     <p className="text-sm text-gray-500">
//                                         {message}
//                                     </p>
//                                     <p className="text-sm font-semibold text-gray-700 mt-1">
//                                         Link ID: {linkId}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                         <Button
//                             onClick={onConfirm}
//                             variant="solid"
//                             color="red"
//                             leftIcon={CheckCircle}
//                             className="w-full sm:ml-3 sm:w-auto"
//                         >
//                             Confirm Resolve
//                         </Button>
//                         <Button
//                             onClick={onClose}
//                             variant="ghost"
//                             leftIcon={XCircle}
//                             className="mt-3 w-full sm:mt-0 sm:w-auto"
//                         >
//                             Cancel
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };


// /* -------------------------------------------------
//    2. MOCK DATA (UPDATED: ICMP_ALERT_SOURCE_DATA MODIFIED)
//    ------------------------------------------------- */
// const randUtil = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// const getInitialStatus = (i) => {
//     // 20% resolved, 20% paused, 60% running initially
//     if (i % 5 === 0) return 'resolved';
//     if (i % 5 === 1) return 'paused';
//     return 'running';
// };

// const UTILIZATION_SOURCE_DATA = Array.from({ length: 20 }, (_, i) => ({
//     id: i + 1,
//     partner_name: `Partner ${String.fromCharCode(65 + i)}`,
//     nttn_link_id: `NTTN-${1000 + i}`,
//     purchased_capacity: `${(i % 5 + 1) * 10} Gbps`,
//     alert_status: getInitialStatus(i), 
//     utilization_pct: i < 3 ? randUtil(105, 120) : (i >= 17 ? randUtil(0, 15) : randUtil(40, 95)),
//     location: `Zone ${i % 4}`,
// }));

// // UPDATED: Mock data for ICMP Alerts with alert_value and frequency
// const ICMP_ALERT_SOURCE_DATA = Array.from({ length: 12 }, (_, i) => {
//     const isTimeout = i % 4 === 0;
    
//     return {
//         id: i + 1,
//         partner_name: `Partner ${String.fromCharCode(75 + i)}`,
//         nttn_link_id: `ICMP-${2000 + i}`,
//         last_ping_time: `${i % 5 + 1} mins ago`,
//         alert_status: getInitialStatus(i), 
//         location: `Zone ${i % 3}`,
//         icmp_status: isTimeout ? 'Timeout' : 'High Latency',
//         // NEW REQUIRED FIELDS
//         alert_value: isTimeout ? '5 Consecutive Failures' : `${randUtil(150, 400)}ms Latency`,
//         frequency: `${randUtil(3, 20)} times in ${randUtil(1, 7)} days`,
//     };
// });

// const mockPartnerData = Array.from({ length: 25 }, (_, i) => ({
//     id: i + 1,
//     partner_name: `Partner ${i + 1}`,
//     contact_person: `Contact ${i + 1}`,
//     location: `City ${i % 5}`,
//     status: i % 4 === 0 ? 'Inactive' : 'Active',
// }));

// const mockAggregatorData = Array.from({ length: 8 }, (_, i) => ({
//     id: i + 1,
//     aggregator_name: `Aggregator Group ${i + 1}`,
//     num_partners: 10 + i * 5,
//     purchase_capacity: `${(i + 1) * 20} Gbps`,
// }));


// const mockMinMaxChartData = {
//     labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
//     datasets: [
//       {
//         label: "Max Utilization (%)",
//         data: [95, 102, 98, 105, 90, 110, 95],
//         borderColor: "#ef4444", 
//         backgroundColor: "rgba(239, 68, 68, 0.2)",
//         tension: 0.3,
//         fill: false,
//       },
//       {
//         label: "Min Utilization (%)",
//         data: [15, 10, 25, 12, 5, 8, 18],
//         borderColor: "#06b6d4", 
//         backgroundColor: "rgba(6, 182, 212, 0.2)",
//         tension: 0.3,
//         fill: false,
//       },
//     ],
// };


// /* -------------------------------------------------
//    3. COLUMN DEFINITION FUNCTION (UPDATED: getICMPAlertColumns)
//    ------------------------------------------------- */

// // Reusable action column render function
// const renderAlertActions = (row, handleRunPause, handleResolveClick) => {
//     const status = row.current_alert_status; 
//     const isResolved = status === 'resolved';
    
//     // --- 1. Run/Pause Button Logic ---
//     let runPauseLabel, RunPauseIcon, runPauseColorClass, nextRunPauseStatus;
    
//     if (status === 'running') {
//         runPauseLabel = 'Pause';
//         RunPauseIcon = Pause;
//         runPauseColorClass = 'text-yellow-600 border-yellow-200 hover:bg-yellow-50';
//         nextRunPauseStatus = 'paused';
//     } else { // status === 'paused' or 'resolved' (though resolved is handled below)
//         runPauseLabel = 'Run';
//         RunPauseIcon = Play;
//         runPauseColorClass = 'text-blue-600 border-blue-200 hover:bg-blue-50';
//         nextRunPauseStatus = 'running';
//     }

//     // --- 2. Resolved Button/Display Logic ---
//     if (isResolved) {
//         return (
//             <div className="flex justify-center">
//                  <Button
//                     variant="ghost" 
//                     size="sm"
//                     className="text-green-600 border-green-200 opacity-60 cursor-not-allowed border disabled:opacity-60"
//                     leftIcon={CheckCircle}
//                     disabled={true}
//                 >
//                     Resolved
//                 </Button>
//             </div>
//         );
//     }

//     // --- Unresolved State (Running or Paused) - Show both actions ---
//     return (
//         <div className="flex justify-center space-x-2">
//             {/* Run/Pause Toggle Button */}
//             <Button
//                 key={`${row.nttn_link_id}-runpause`} 
//                 variant="ghost" 
//                 size="sm"
//                 className={clsx(runPauseColorClass, "border")}
//                 onClick={() => handleRunPause(row.nttn_link_id, nextRunPauseStatus)} 
//                 leftIcon={RunPauseIcon}
//             >
//                 {runPauseLabel}
//             </Button>
            
//             {/* Resolve Button */}
//             <Button
//                 key={`${row.nttn_link_id}-resolve`} 
//                 variant="ghost" 
//                 size="sm"
//                 className="text-green-600 border-green-200 hover:bg-green-50 border"
//                 onClick={() => handleResolveClick(row)} 
//                 leftIcon={CheckCircle}
//             >
//                 Resolve
//             </Button>
//         </div>
//     );
// };

// // New callback function passed to handle the modal open for resolution
// const getUtilizationColumns = (handleRunPause, handleResolveClick) => [
//     { key: 'partner_name', header: 'Partner Name' },
//     { key: 'nttn_link_id', header: 'NTTN Link ID ' },
//     { key: 'purchased_capacity', header: 'Purchased Capacity' }, 
//     {
//         key: 'utilization_pct',
//         header: 'Utilization (%)',
//         render: (v, row) => {
//             const pct = parseFloat(v);
//             const status = row.current_alert_status; 
            
//             let color = 'text-gray-800';
//             if (status === 'resolved') {
//                 color = 'text-gray-500 line-through';
//             } else if (pct > 100) {
//                 color = 'text-red-600 font-bold';
//             } else if (pct < 20) {
//                 color = 'text-cyan-600 font-bold';
//             }

//             return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
//         }
//     },
//     {
//         key: 'actions',
//         header: 'Actions',
//         align: 'center',
//         width: '18rem', 
//         isSortable: false,
//         render: (v, row) => renderAlertActions(row, handleRunPause, handleResolveClick),
//     },
// ];

// // MODIFIED: Columns for ICMP Alerts with 'alert_value' and 'frequency'
// const getICMPAlertColumns = (handleRunPause, handleResolveClick) => [
//     { key: 'partner_name', header: 'Partner Name' },
//     { key: 'nttn_link_id', header: 'NTTN Link ID' },
//     { key: 'icmp_status', header: 'Alert Type',
//         render: (v) => (
//             <span
//                 className={clsx(
//                     "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
//                     v === "Timeout" 
//                         ? "bg-red-100 text-red-800"
//                         : "bg-orange-100 text-orange-800"
//                 )}
//             >
//                 {safeCell(v)}
//             </span>
//         ),
//     },
//     // NEW COLUMN: Alert Value (e.g., latency or failure count)
//     { 
//         key: 'alert_value', 
//         header: 'Alert Value',
//         render: (v) => <span className="font-semibold text-gray-700 text-sm">{safeCell(v)}</span>
//     },
//     // NEW COLUMN: Frequency
//     { 
//         key: 'frequency', 
//         header: 'Frequency',
//         render: (v) => <span className="text-gray-500 text-xs italic">{safeCell(v)}</span>
//     },
//     { key: 'last_ping_time', header: 'Last Ping' },
//     {
//         key: 'actions',
//         header: 'Actions',
//         align: 'center',
//         width: '18rem',
//         isSortable: false,
//         render: (v, row) => renderAlertActions(row, handleRunPause, handleResolveClick),
//     },
// ];

// const AGGREGATOR_COLUMNS = [
//     { key: 'aggregator_name', header: 'Aggregator Name' },
//     { key: 'num_partners', header: 'No. of Partners' },
//     { key: 'purchase_capacity', header: 'Purchase Capacity' },
// ];

// const PARTNER_COLUMNS = [
//     { key: 'partner_name', header: 'Partner Name' },
//     { key: 'contact_person', header: 'Contact Person' },
//     { key: 'location', header: 'Location', render: (val) => <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600">{safeCell(val)}</span> },
//     {
//         key: 'status',
//         header: 'Status',
//         render: (v) => (
//             <span
//                 className={clsx(
//                     "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
//                     v === "Active" 
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                 )}
//             >
//                 {safeCell(v)}
//             </span>
//         ),
//     },
// ];


// /* -------------------------------------------------
//    4. PARTNER DASHBOARD COMPONENT (LOGIC UNCHANGED)
//    ------------------------------------------------- */

// export default function PartnerDashboard() {
//     const navigate = useNavigate();
//     const [initialLoading, setInitialLoading] = useState(true);

//     // Combine utilization and ICMP alert data into one status map
//     const [alertStatusMap, setAlertStatusMap] = useState(() => {
//         const utilMap = new Map(UTILIZATION_SOURCE_DATA.map(d => [d.nttn_link_id, d.alert_status]));
//         const icmpMap = new Map(ICMP_ALERT_SOURCE_DATA.map(d => [d.nttn_link_id, d.alert_status]));
//         return new Map([...utilMap, ...icmpMap]);
//     });

//     const [dynamicTableColumns, setDynamicTableColumns] = useState([]);
//     const [dynamicTableTitle, setDynamicTableTitle] = useState("Select a card to view data");
//     const [activeCard, setActiveCard] = useState(null);
//     const [tableIsLoading, setTableIsLoading] = useState(false);
    
//     const [actionFilter, setActionFilter] = useState('all'); 

//     const [showResolveModal, setShowResolveModal] = useState(false);
//     const [alertToResolve, setAlertToResolve] = useState(null);

//     const [chartData] = useState(mockMinMaxChartData);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setInitialLoading(false);
//         }, 800);
//         return () => clearTimeout(timer);
//     }, []);

    
//     const { totalMetrics, currentAlerts } = useMemo(() => {
//         // Utilization Alerts
//         const maxUtilAlerts = UTILIZATION_SOURCE_DATA.filter(d => d.utilization_pct > 100);
//         const minUtilAlerts = UTILIZATION_SOURCE_DATA.filter(d => d.utilization_pct < 20);
        
//         // ICMP Alerts
//         const icmpAlerts = ICMP_ALERT_SOURCE_DATA;

//         // Count only 'running' alerts for the cards
//         const currentMaxUtilAlerts = maxUtilAlerts.filter(d => alertStatusMap.get(d.nttn_link_id) === 'running');
//         const currentMinUtilAlerts = minUtilAlerts.filter(d => alertStatusMap.get(d.nttn_link_id) === 'running');
//         const currentIcmpAlerts = icmpAlerts.filter(d => alertStatusMap.get(d.nttn_link_id) === 'running');
        
//         return {
//             totalMetrics: {
//                 maxAlertCount: currentMaxUtilAlerts.length, 
//                 minAlertCount: currentMinUtilAlerts.length,
//                 icmpAlertCount: currentIcmpAlerts.length, 
//                 partnerCount: mockPartnerData.length,
//                 aggregatorCount: mockAggregatorData.length,
//             },
//             // For internal use to determine base data count
//             currentAlerts: {
//                 maxAlerts: maxUtilAlerts,
//                 minAlerts: minUtilAlerts,
//                 icmpAlerts: icmpAlerts, 
//             }
//         };
//     }, [alertStatusMap]);
    
//     const { dynamicTableData, baseAlertCount } = useMemo(() => {
        
//         let baseAlertData = [];
//         let titlePrefix = '';

//         if (activeCard === 'partners') {
//             return { dynamicTableData: mockPartnerData, baseAlertCount: mockPartnerData.length };
//         }
//         if (activeCard === 'aggregators') {
//             return { dynamicTableData: mockAggregatorData, baseAlertCount: mockAggregatorData.length };
//         }
        
//         if (activeCard === 'max_alert') {
//             baseAlertData = currentAlerts.maxAlerts;
//             titlePrefix = 'Max Utilization';
//         } else if (activeCard === 'min_alert') {
//             baseAlertData = currentAlerts.minAlerts;
//             titlePrefix = 'Min Utilization';
//         } else if (activeCard === 'icmp_alert') { 
//             baseAlertData = currentAlerts.icmpAlerts;
//             titlePrefix = 'ICMP';
//         } else {
//             return { dynamicTableData: [], baseAlertCount: 0 };
//         }
            
//         // baseAlertCount is the total number of links that *have* alerts 
//         const countBeforeFilter = baseAlertData.length;

//         const dataWithCurrentStatus = baseAlertData.map(row => {
//             const currentStatus = alertStatusMap.get(row.nttn_link_id) ?? row.alert_status;
//             return { ...row, current_alert_status: currentStatus }; 
//         });

//         const finalFilteredData = dataWithCurrentStatus.filter(row => {
//             const status = row.current_alert_status;
//             if (actionFilter === 'all') return true;
//             if (actionFilter === 'running') return status === 'running';
//             if (actionFilter === 'paused') return status === 'paused';
//             if (actionFilter === 'resolved') return status === 'resolved';
//             if (actionFilter === 'unresolved') return status === 'running' || status === 'paused';
//             return true; 
//         });

//         let filterSuffix = '';
//         if (actionFilter === 'running') filterSuffix = ' (Running:';
//         else if (actionFilter === 'paused') filterSuffix = ' (Paused:';
//         else if (actionFilter === 'resolved') filterSuffix = ' (Resolved:';
//         else if (actionFilter === 'unresolved') filterSuffix = ' (Unresolved:';
//         else if (actionFilter === 'all') filterSuffix = ' (All:';
        
//         setDynamicTableTitle(`${titlePrefix} Alerts${filterSuffix} ${finalFilteredData.length})`);

//         return { 
//             dynamicTableData: finalFilteredData,
//             baseAlertCount: countBeforeFilter 
//         };

//     }, [activeCard, actionFilter, alertStatusMap, currentAlerts]);

//     /* --- Action Handlers (UNCHANGED) --- */

//     // Handler for the Run/Pause/Resolve status update
//     const handleRunPause = useCallback((nttnLinkId, newStatus) => {
//         setTableIsLoading(true);
//         setAlertStatusMap(prev => {
//             const next = new Map(prev);
//             next.set(nttnLinkId, newStatus);
//             return next;
//         });
//         setTimeout(() => {
//             setTableIsLoading(false);
//         }, 300); 
//     }, []);

//     // Handler to open the Resolve modal
//     const handleResolveClick = useCallback((row) => {
//         setAlertToResolve(row);
//         setShowResolveModal(true);
//     }, []);

//     // Handler for confirming resolution from the modal (still sets to 'resolved')
//     const handleConfirmResolve = useCallback(() => {
//         if (alertToResolve) {
//             handleRunPause(alertToResolve.nttn_link_id, 'resolved');
//         }
//         setShowResolveModal(false);
//         setAlertToResolve(null);
//     }, [alertToResolve, handleRunPause]);


//     const handleActionFilterClick = useCallback((filter) => {
//         if (!['max_alert', 'min_alert', 'icmp_alert'].includes(activeCard)) return; 
//         setTableIsLoading(true);
//         setActionFilter(filter); 
//         setTimeout(() => {
//             setTableIsLoading(false);
//         }, 100); 
//     }, [activeCard]);


//     const handleStatCardClick = useCallback((type) => {
//         setTableIsLoading(true);
//         setActiveCard(type);
        
//         const isAlertCard = ['max_alert', 'min_alert', 'icmp_alert'].includes(type);
//         const initialActionFilter = isAlertCard ? 'running' : null;
//         setActionFilter(initialActionFilter); 
        
//         let columns = [];
//         if (type === 'max_alert' || type === 'min_alert') {
//             columns = getUtilizationColumns(handleRunPause, handleResolveClick); 
//         } else if (type === 'icmp_alert') { 
//             columns = getICMPAlertColumns(handleRunPause, handleResolveClick);
//         } else if (type === 'partners') {
//             columns = PARTNER_COLUMNS;
//         } else if (type === 'aggregators') {
//             columns = AGGREGATOR_COLUMNS;
//         }
        
//         setTimeout(() => {
//             setDynamicTableColumns(columns);
//             setTableIsLoading(false);
//         }, 300);
//     }, [handleRunPause, handleResolveClick]);


//     const utilizationChartOptions = useMemo(() => ({
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: { legend: { position: 'top' } },
//         scales: { y: { min: 0, max: 120, ticks: { callback: (value) => value + '%' } } }
//     }), []);


//     // --- Render ---
//     return (
//         <div className="min-h-screen bg-gray-50 p-6 space-y-8">
            
//             <div className="flex justify-between items-end pb-4 border-b border-gray-200">
//                 <div>
//                     <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
//                     <p className="text-sm text-gray-500">Overview of NTTN link performance and capacity.</p>
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 <div className="flex gap-4">
//                     {initialLoading ? (
//                         Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
//                     ) : (
//                         <>
//                             {/* Max Utilization Alert */}
//                             <HealthStatCard
//                                 title="Max Utilization Alert"
//                                 value={totalMetrics.maxAlertCount}
//                                 subLabel="Utilization threshold exceeded"
//                                 icon={AlertTriangle} 
//                                 iconBgClass="bg-red-100"
//                                 iconTextClass="text-red-600"
//                                 valueClass={activeCard === 'max_alert' ? 'text-red-700 underline' : 'text-red-600'}
//                                 onClick={() => handleStatCardClick('max_alert')}
//                             />
                            
//                             {/* Min Utilization Alert */}
//                             <HealthStatCard
//                                 title="Min Utilization Alert"
//                                 value={totalMetrics.minAlertCount}
//                                 subLabel="Under utilization detected"
//                                 icon={Minimize2} 
//                                 iconBgClass="bg-cyan-100"
//                                 iconTextClass="text-cyan-600"
//                                 valueClass={activeCard === 'min_alert' ? 'text-cyan-700 underline' : 'text-cyan-600'}
//                                 onClick={() => handleStatCardClick('min_alert')}
//                             />
                            
//                             {/* ICMP Alert Card */}
//                             <HealthStatCard
//                                 title="ICMP Alerts"
//                                 value={totalMetrics.icmpAlertCount}
//                                 subLabel="Network issues detected"
//                                 icon={WifiOff} 
//                                 iconBgClass="bg-orange-100"
//                                 iconTextClass="text-orange-600"
//                                 valueClass={activeCard === 'icmp_alert' ? 'text-orange-700 underline' : 'text-orange-600'}
//                                 onClick={() => handleStatCardClick('icmp_alert')}
//                             />

//                             {/* Partners */}
//                             <HealthStatCard
//                                 title="Partners"
//                                 value={totalMetrics.partnerCount}
//                                 subLabel="Total number of partners"
//                                 icon={Users} 
//                                 iconBgClass="bg-indigo-100"
//                                 iconTextClass="text-indigo-600"
//                                 valueClass={activeCard === 'partners' ? 'text-indigo-700 underline' : 'text-gray-800'}
//                                 onClick={() => handleStatCardClick('partners')}
//                             />
                            
//                             {/* Aggregators */}
//                             <HealthStatCard
//                                 title="Aggregators"
//                                 value={totalMetrics.aggregatorCount}
//                                 subLabel="Total number of aggregators"
//                                 icon={Layers} 
//                                 iconBgClass="bg-yellow-100"
//                                 iconTextClass="text-yellow-600"
//                                 valueClass={activeCard === 'aggregators' ? 'text-yellow-700 underline' : 'text-gray-800'}
//                                 onClick={() => handleStatCardClick('aggregators')}
//                             />
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* Dynamic Data Table */}
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-semibold text-gray-800">{dynamicTableTitle}</h2>
                    
//                     {/* Filter Buttons */}
//                     {(['max_alert', 'min_alert', 'icmp_alert'].includes(activeCard)) && baseAlertCount > 0 && (
//                         <div className="flex space-x-2">
//                             <Button
//                                 variant={actionFilter === 'all' ? 'solid' : 'ghost'}
//                                 onClick={() => handleActionFilterClick('all')}
//                                 size="sm"
//                                 leftIcon={Filter}
//                             >
//                                 All
//                             </Button>
//                             {/* Unresolved Filter (includes running and paused for table view) */}
//                             <Button
//                                 variant={actionFilter === 'unresolved' ? 'solid' : 'ghost'}
//                                 onClick={() => handleActionFilterClick('unresolved')}
//                                 size="sm"
//                                 leftIcon={AlertCircle}
//                             >
//                                 Unresolved
//                             </Button>
//                             <Button
//                                 variant={actionFilter === 'running' ? 'solid' : 'ghost'}
//                                 onClick={() => handleActionFilterClick('running')}
//                                 size="sm"
//                                 leftIcon={Play}
//                             >
//                                 Running
//                             </Button>
//                             <Button
//                                 variant={actionFilter === 'paused' ? 'solid' : 'ghost'}
//                                 onClick={() => handleActionFilterClick('paused')}
//                                 size="sm"
//                                 leftIcon={Pause}
//                             >
//                                 Paused
//                             </Button>
//                             <Button
//                                 variant={actionFilter === 'resolved' ? 'solid' : 'ghost'}
//                                 onClick={() => handleActionFilterClick('resolved')}
//                                 size="sm"
//                                 leftIcon={CheckCircle}
//                             >
//                                 Resolved
//                             </Button>
//                         </div>
//                     )}
//                 </div>

//                 {tableIsLoading || initialLoading ? (
//                     <TableSkeleton />
//                 ) : (
//                     <DataTable
//                         data={dynamicTableData}
//                         columns={dynamicTableColumns}
//                         selection={true}
//                         onSelectionChange={() => {}} 
//                         initialPageSize={10}
//                         rowKey="nttn_link_id" 
//                     />
//                 )}
//             </div>

//             {/* Utilization Chart (UNCHANGED) */}
//             <div className="space-y-4">
//                 <h2 className="text-xl font-semibold text-gray-800">Min & Max Utilization Over Past 7 Days (%)</h2>
//                 <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-96 relative">
//                     <div className="h-[calc(100%-40px)]">
//                         <Chart
//                             type="line"
//                             data={chartData}
//                             options={utilizationChartOptions}
//                             className="h-full"
//                             initialLoading={initialLoading}
//                             fallbackMessage="No utilization logs found."
//                         />
//                     </div>
//                 </div>
//             </div>
            
//             {/* Confirmation Modal Render (UNCHANGED) */}
//             <ConfirmationModal
//                 isOpen={showResolveModal}
//                 onClose={() => setShowResolveModal(false)}
//                 onConfirm={handleConfirmResolve}
//                 title="Confirm Alert Resolution"
//                 message="Are you sure you want to mark this alert as resolved? This action will remove it from the active alert count."
//                 linkId={alertToResolve?.nttn_link_id}
//             />
//         </div>
//     );
// }

//src/pages/Dashboard.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import {
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
  AlertCircle // Modal Icon
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import 'chartjs-adapter-date-fns';
// Assume these components are imported from the existing structure
import DataTable from "../components/table/DataTable";
import Chart from "../components/charts/Chart";
import Button from "../components/ui/Button"; 

/* -------------------------------------------------
   1. HELPER FUNCTIONS & UI ELEMENTS (UNCHANGED)
   ------------------------------------------------- */

function safeCell(v) {
  if (v === null || v === undefined || v === '') return <span className="text-gray-400">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

const CardSkeleton = () => <div className="h-28 bg-gray-200 rounded-xl animate-pulse"></div>;
const TableSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>;

const HealthStatCard = ({ title, value, subLabel, icon: Icon, valueClass, iconBgClass, iconTextClass, onClick }) => (
  <button 
    onClick={onClick}
    className="flex-1 min-w-[180px] min-h-[140px] p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    disabled={!onClick}
  >
    <div className="flex items-start justify-between">
      <div className={clsx("p-3 rounded-full", iconBgClass, iconTextClass)}>
        <Icon className="w-7 h-7" /> 
      </div>
    </div>
    <div className="mt-4">
      <p className={clsx("text-3xl font-bold", valueClass)}>
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subLabel && (
        <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
      )}
    </div>
  </button>
);


/* -------------------------------------------------
   1.1 MODAL COMPONENT (UNCHANGED)
   ------------------------------------------------- */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, linkId }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">
                                        Link ID: {linkId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <Button
                            onClick={onConfirm}
                            variant="solid"
                            color="red"
                            leftIcon={CheckCircle}
                            className="w-full sm:ml-3 sm:w-auto"
                        >
                            Confirm Resolve
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            leftIcon={XCircle}
                            className="mt-3 w-full sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


/* -------------------------------------------------
   2. MOCK DATA (UPDATED: UTILIZATION_SOURCE_DATA MODIFIED)
   ------------------------------------------------- */
const randUtil = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getInitialStatus = (i) => {
    // 20% resolved, 20% paused, 60% running initially
    if (i % 5 === 0) return 'resolved';
    if (i % 5 === 1) return 'paused';
    return 'running';
};

// MODIFIED MOCK DATA
const UTILIZATION_SOURCE_DATA = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    partner_name: `Partner ${String.fromCharCode(65 + i)}`,
    nttn_link_id: `NTTN-${1000 + i}`,
    purchased_capacity: `${(i % 5 + 1) * 10} Gbps`,
    alert_status: getInitialStatus(i), 
    utilization_pct: i < 3 ? randUtil(105, 120) : (i >= 17 ? randUtil(0, 15) : randUtil(40, 95)),
    location: `Zone ${i % 4}`,
    // 👇 NEW CONFIGURATION FIELDS ADDED
    daily_triggers: randUtil(1, 4), 
    alert_duration_days: randUtil(3, 10),
}));

// UPDATED: Mock data for ICMP Alerts with alert_value and frequency
const ICMP_ALERT_SOURCE_DATA = Array.from({ length: 12 }, (_, i) => {
    const isTimeout = i % 4 === 0;
    
    return {
        id: i + 1,
        partner_name: `Partner ${String.fromCharCode(75 + i)}`,
        nttn_link_id: `ICMP-${2000 + i}`,
        last_ping_time: `${i % 5 + 1} mins ago`,
        alert_status: getInitialStatus(i), 
        location: `Zone ${i % 3}`,
        icmp_status: isTimeout ? 'Timeout' : 'High Latency',
        // NEW REQUIRED FIELDS
        alert_value: isTimeout ? `${randUtil(3, 10)} Consecutive Failures` : `${randUtil(150, 400)}ms Latency`,
        frequency: `${randUtil(3, 20)} times in ${randUtil(1, 7)} days`,
    };
});

const mockPartnerData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    partner_name: `Partner ${i + 1}`,
    contact_person: `Contact ${i + 1}`,
    location: `City ${i % 5}`,
    status: i % 4 === 0 ? 'Inactive' : 'Active',
}));

const mockAggregatorData = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    aggregator_name: `Aggregator Group ${i + 1}`,
    num_partners: 10 + i * 5,
    purchase_capacity: `${(i + 1) * 20} Gbps`,
}));


const mockMinMaxChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: "Max Utilization (%)",
        data: [95, 102, 98, 105, 90, 110, 95],
        borderColor: "#ef4444", 
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.3,
        fill: false,
      },
      {
        label: "Min Utilization (%)",
        data: [15, 10, 25, 12, 5, 8, 18],
        borderColor: "#06b6d4", 
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        tension: 0.3,
        fill: false,
      },
    ],
};


/* -------------------------------------------------
   3. COLUMN DEFINITION FUNCTION (MODIFIED: getICMPAlertColumns)
   ------------------------------------------------- */

// Reusable action column render function (UNCHANGED)
const renderAlertActions = (row, handleRunPause, handleResolveClick) => {
    const status = row.current_alert_status; 
    const isResolved = status === 'resolved';
    
    // --- 1. Run/Pause Button Logic ---
    let runPauseLabel, RunPauseIcon, runPauseColorClass, nextRunPauseStatus;
    
    if (status === 'running') {
        runPauseLabel = 'Pause';
        RunPauseIcon = Pause;
        runPauseColorClass = 'text-yellow-600 border-yellow-200 hover:bg-yellow-50';
        nextRunPauseStatus = 'paused';
    } else { // status === 'paused' or 'resolved' (though resolved is handled below)
        runPauseLabel = 'Run';
        RunPauseIcon = Play;
        runPauseColorClass = 'text-blue-600 border-blue-200 hover:bg-blue-50';
        nextRunPauseStatus = 'running';
    }

    // --- 2. Resolved Button/Display Logic ---
    if (isResolved) {
        return (
            <div className="flex justify-center">
                 <Button
                    variant="ghost" 
                    size="sm"
                    className="text-green-600 border-green-200 opacity-60 cursor-not-allowed border disabled:opacity-60"
                    leftIcon={CheckCircle}
                    disabled={true}
                >
                    Resolved
                </Button>
            </div>
        );
    }

    // --- Unresolved State (Running or Paused) - Show both actions ---
    return (
        <div className="flex justify-center space-x-2">
            {/* Run/Pause Toggle Button */}
            <Button
                key={`${row.nttn_link_id}-runpause`} 
                variant="ghost" 
                size="sm"
                className={clsx(runPauseColorClass, "border")}
                onClick={() => handleRunPause(row.nttn_link_id, nextRunPauseStatus)} 
                leftIcon={RunPauseIcon}
            >
                {runPauseLabel}
            </Button>
            
            {/* Resolve Button */}
            <Button
                key={`${row.nttn_link_id}-resolve`} 
                variant="ghost" 
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 border"
                onClick={() => handleResolveClick(row)} 
                leftIcon={CheckCircle}
            >
                Resolve
            </Button>
        </div>
    );
};

// Utilization Columns (UNCHANGED)
const getUtilizationColumns = (handleRunPause, handleResolveClick) => [
    { key: 'partner_name', header: 'Partner Name' },
    { key: 'nttn_link_id', header: 'NTTN Link ID ' },
    { key: 'purchased_capacity', header: 'Purchased Capacity' },
    { 
        key: 'alert_config',
        header: 'Alert Configuration',
        // This column will render the new fields (daily_triggers, alert_duration_days)
        render: (v, row) => (
            <div className="text-sm text-gray-700">
                {safeCell(row.daily_triggers)} times / day
                <span className="text-gray-400 mx-1">|</span>
                {safeCell(row.alert_duration_days)} days
            </div>
        )
    }, 
    {
        key: 'utilization_pct',
        header: 'Utilization (%)',
        render: (v, row) => {
            const pct = parseFloat(v);
            const status = row.current_alert_status; 
            
            let color = 'text-gray-800';
            if (status === 'resolved') {
                color = 'text-gray-500 line-through';
            } else if (pct > 100) {
                color = 'text-red-600 font-bold';
            } else if (pct < 20) {
                color = 'text-cyan-600 font-bold';
            }

            return <span className={clsx("font-mono text-sm", color)}>{safeCell(v)}%</span>;
        }
    },
    {
        key: 'actions',
        header: 'Actions',
        align: 'center',
        width: '18rem', 
        isSortable: false,
        render: (v, row) => renderAlertActions(row, handleRunPause, handleResolveClick),
    },
];

// MODIFIED: Columns for ICMP Alerts with custom rendering for 'alert_value'
const getICMPAlertColumns = (handleRunPause, handleResolveClick) => [
    { key: 'partner_name', header: 'Partner Name' },
    { key: 'nttn_link_id', header: 'NTTN Link ID' },
    { key: 'icmp_status', header: 'Alert Type',
        render: (v) => (
            <span
                className={clsx(
                    "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                    v === "Timeout" 
                        ? "bg-red-100 text-red-900"
                        : "bg-orange-100 text-orange-900"
                )}
            >
                {safeCell(v)}
            </span>
        ),
    },
    // MODIFIED COLUMN: Alert Value
    { 
        key: 'alert_value', 
        header: 'Alert Value',
        render: (v, row) => {
            let displayValue = safeCell(v);
            
            if (typeof v === 'string') {
                if (row.icmp_status === 'High Latency' && v.includes('ms Latency')) {
                    // High Latency: Extract only the numeric value and 'ms' unit (e.g., '320ms')
                    displayValue = v.replace('ms Latency', ' ms').trim();
                } 
                else if (row.icmp_status === 'Timeout') {
                    // 1. Calculate simulated duration (assuming 12 seconds per failure)
                    const failureCountMatch = v.match(/(\d+)/);
                    const count = failureCountMatch ? parseInt(failureCountMatch[0], 10) : 5; 
                    const simulatedDurationSeconds = count * 12; 

                    // 2. Apply the conversion logic
                    if (simulatedDurationSeconds >= 60) {
                        // Convert to minutes, rounded to one decimal place
                        const durationMinutes = (simulatedDurationSeconds / 60).toFixed(1);
                        displayValue = `${durationMinutes} min`;
                    } else {
                        // Display in seconds
                        displayValue = `${simulatedDurationSeconds} sec`;
                    }
                }
            }

            return <span className="font-semibold text-gray-700 text-sm">{displayValue}</span>
        }
    },
    // NEW COLUMN: Frequency (UNCHANGED)
    { 
        key: 'frequency', 
        header: 'Frequency',
        render: (v) => <span className="font-semibold text-gray-700 text-sm">{safeCell(v)}</span>
    },
    { key: 'last_ping_time', header: 'Last Ping' },
    {
        key: 'actions',
        header: 'Actions',
        align: 'center',
        width: '18rem',
        isSortable: false,
        render: (v, row) => renderAlertActions(row, handleRunPause, handleResolveClick),
    },
];

const AGGREGATOR_COLUMNS = [
    { key: 'aggregator_name', header: 'Aggregator Name' },
    { key: 'num_partners', header: 'No. of Partners' },
    { key: 'purchase_capacity', header: 'Purchase Capacity' },
];

const PARTNER_COLUMNS = [
    { key: 'partner_name', header: 'Partner Name' },
    { key: 'contact_person', header: 'Contact Person' },
    { key: 'location', header: 'Location', render: (val) => <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600">{safeCell(val)}</span> },
    {
        key: 'status',
        header: 'Status',
        render: (v) => (
            <span
                className={clsx(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    v === "Active" 
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                )}
            >
                {safeCell(v)}
            </span>
        ),
    },
];


/* -------------------------------------------------
   4. PARTNER DASHBOARD COMPONENT (LOGIC UNCHANGED)
   ------------------------------------------------- */

export default function PartnerDashboard() {
    const navigate = useNavigate();
    const [initialLoading, setInitialLoading] = useState(true);

    // Combine utilization and ICMP alert data into one status map
    const [alertStatusMap, setAlertStatusMap] = useState(() => {
        const utilMap = new Map(UTILIZATION_SOURCE_DATA.map(d => [d.nttn_link_id, d.alert_status]));
        const icmpMap = new Map(ICMP_ALERT_SOURCE_DATA.map(d => [d.nttn_link_id, d.alert_status]));
        return new Map([...utilMap, ...icmpMap]);
    });

    const [dynamicTableColumns, setDynamicTableColumns] = useState([]);
    const [dynamicTableTitle, setDynamicTableTitle] = useState("Select a card to view data");
    const [activeCard, setActiveCard] = useState(null);
    const [tableIsLoading, setTableIsLoading] = useState(false);
    
    const [actionFilter, setActionFilter] = useState('all'); 

    const [showResolveModal, setShowResolveModal] = useState(false);
    const [alertToResolve, setAlertToResolve] = useState(null);

    const [chartData] = useState(mockMinMaxChartData);

    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    
    const { totalMetrics, currentAlerts } = useMemo(() => {
        // Utilization Alerts
        const maxUtilAlerts = UTILIZATION_SOURCE_DATA.filter(d => d.utilization_pct > 100);
        const minUtilAlerts = UTILIZATION_SOURCE_DATA.filter(d => d.utilization_pct < 20);
        
        // ICMP Alerts
        const icmpAlerts = ICMP_ALERT_SOURCE_DATA;

        // Count only 'running' alerts for the cards
        const currentMaxUtilAlerts = maxUtilAlerts.filter(d => alertStatusMap.get(d.nttn_link_id) === 'running');
        const currentMinUtilAlerts = minUtilAlerts.filter(d => alertStatusMap.get(d.nttn_link_id) === 'running');
        const currentIcmpAlerts = icmpAlerts.filter(d => alertStatusMap.get(d.nttn_link_id) === 'running');
        
        return {
            totalMetrics: {
                maxAlertCount: currentMaxUtilAlerts.length, 
                minAlertCount: currentMinUtilAlerts.length,
                icmpAlertCount: currentIcmpAlerts.length, 
                partnerCount: mockPartnerData.length,
                aggregatorCount: mockAggregatorData.length,
            },
            // For internal use to determine base data count
            currentAlerts: {
                maxAlerts: maxUtilAlerts,
                minAlerts: minUtilAlerts,
                icmpAlerts: icmpAlerts, 
            }
        };
    }, [alertStatusMap]);
    
    const { dynamicTableData, baseAlertCount } = useMemo(() => {
        
        let baseAlertData = [];
        let titlePrefix = '';

        if (activeCard === 'partners') {
            return { dynamicTableData: mockPartnerData, baseAlertCount: mockPartnerData.length };
        }
        if (activeCard === 'aggregators') {
            return { dynamicTableData: mockAggregatorData, baseAlertCount: mockAggregatorData.length };
        }
        
        if (activeCard === 'max_alert') {
            baseAlertData = currentAlerts.maxAlerts;
            titlePrefix = 'Max Utilization';
        } else if (activeCard === 'min_alert') {
            baseAlertData = currentAlerts.minAlerts;
            titlePrefix = 'Min Utilization';
        } else if (activeCard === 'icmp_alert') { 
            baseAlertData = currentAlerts.icmpAlerts;
            titlePrefix = 'ICMP';
        } else {
            return { dynamicTableData: [], baseAlertCount: 0 };
        }
            
        // baseAlertCount is the total number of links that *have* alerts 
        const countBeforeFilter = baseAlertData.length;

        const dataWithCurrentStatus = baseAlertData.map(row => {
            const currentStatus = alertStatusMap.get(row.nttn_link_id) ?? row.alert_status;
            return { ...row, current_alert_status: currentStatus }; 
        });

        const finalFilteredData = dataWithCurrentStatus.filter(row => {
            const status = row.current_alert_status;
            if (actionFilter === 'all') return true;
            if (actionFilter === 'running') return status === 'running';
            if (actionFilter === 'paused') return status === 'paused';
            if (actionFilter === 'resolved') return status === 'resolved';
            if (actionFilter === 'unresolved') return status === 'running' || status === 'paused';
            return true; 
        });

        let filterSuffix = '';
        if (actionFilter === 'running') filterSuffix = ' (Running:';
        else if (actionFilter === 'paused') filterSuffix = ' (Paused:';
        else if (actionFilter === 'resolved') filterSuffix = ' (Resolved:';
        else if (actionFilter === 'unresolved') filterSuffix = ' (Unresolved:';
        else if (actionFilter === 'all') filterSuffix = ' (All:';
        
        setDynamicTableTitle(`${titlePrefix} Alerts${filterSuffix} ${finalFilteredData.length})`);

        return { 
            dynamicTableData: finalFilteredData,
            baseAlertCount: countBeforeFilter 
        };

    }, [activeCard, actionFilter, alertStatusMap, currentAlerts]);

    /* --- Action Handlers (UNCHANGED) --- */

    // Handler for the Run/Pause/Resolve status update
    const handleRunPause = useCallback((nttnLinkId, newStatus) => {
        setTableIsLoading(true);
        setAlertStatusMap(prev => {
            const next = new Map(prev);
            next.set(nttnLinkId, newStatus);
            return next;
        });
        setTimeout(() => {
            setTableIsLoading(false);
        }, 300); 
    }, []);

    // Handler to open the Resolve modal
    const handleResolveClick = useCallback((row) => {
        setAlertToResolve(row);
        setShowResolveModal(true);
    }, []);

    // Handler for confirming resolution from the modal (still sets to 'resolved')
    const handleConfirmResolve = useCallback(() => {
        if (alertToResolve) {
            handleRunPause(alertToResolve.nttn_link_id, 'resolved');
        }
        setShowResolveModal(false);
        setAlertToResolve(null);
    }, [alertToResolve, handleRunPause]);


    const handleActionFilterClick = useCallback((filter) => {
        if (!['max_alert', 'min_alert', 'icmp_alert'].includes(activeCard)) return; 
        setTableIsLoading(true);
        setActionFilter(filter); 
        setTimeout(() => {
            setTableIsLoading(false);
        }, 100); 
    }, [activeCard]);


    const handleStatCardClick = useCallback((type) => {
        setTableIsLoading(true);
        setActiveCard(type);
        
        const isAlertCard = ['max_alert', 'min_alert', 'icmp_alert'].includes(type);
        const initialActionFilter = isAlertCard ? 'running' : null;
        setActionFilter(initialActionFilter); 
        
        let columns = [];
        if (type === 'max_alert' || type === 'min_alert') {
            columns = getUtilizationColumns(handleRunPause, handleResolveClick); 
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


    const utilizationChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { min: 0, max: 120, ticks: { callback: (value) => value + '%' } } }
    }), []);


    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-8">
            
            <div className="flex justify-between items-end pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of NTTN link performance and capacity.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-4">
                    {initialLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        <>
                            {/* Max Utilization Alert */}
                            <HealthStatCard
                                title="Max Utilization Alert"
                                value={totalMetrics.maxAlertCount}
                                subLabel="Utilization threshold exceeded"
                                icon={AlertTriangle} 
                                iconBgClass="bg-red-100"
                                iconTextClass="text-red-600"
                                valueClass={activeCard === 'max_alert' ? 'text-red-700 underline' : 'text-red-600'}
                                onClick={() => handleStatCardClick('max_alert')}
                            />
                            
                            {/* Min Utilization Alert */}
                            <HealthStatCard
                                title="Min Utilization Alert"
                                value={totalMetrics.minAlertCount}
                                subLabel="Under utilization detected"
                                icon={Minimize2} 
                                iconBgClass="bg-cyan-100"
                                iconTextClass="text-cyan-600"
                                valueClass={activeCard === 'min_alert' ? 'text-cyan-700 underline' : 'text-cyan-600'}
                                onClick={() => handleStatCardClick('min_alert')}
                            />
                            
                            {/* ICMP Alert Card */}
                            <HealthStatCard
                                title="ICMP Alerts"
                                value={totalMetrics.icmpAlertCount}
                                subLabel="Network issues detected"
                                icon={WifiOff} 
                                iconBgClass="bg-orange-100"
                                iconTextClass="text-orange-600"
                                valueClass={activeCard === 'icmp_alert' ? 'text-orange-700 underline' : 'text-orange-600'}
                                onClick={() => handleStatCardClick('icmp_alert')}
                            />

                            {/* Partners */}
                            <HealthStatCard
                                title="Partners"
                                value={totalMetrics.partnerCount}
                                subLabel="Total number of partners"
                                icon={Users} 
                                iconBgClass="bg-indigo-100"
                                iconTextClass="text-indigo-600"
                                valueClass={activeCard === 'partners' ? 'text-indigo-700 underline' : 'text-gray-800'}
                                onClick={() => handleStatCardClick('partners')}
                            />
                            
                            {/* Aggregators */}
                            <HealthStatCard
                                title="Aggregators"
                                value={totalMetrics.aggregatorCount}
                                subLabel="Total number of aggregators"
                                icon={Layers} 
                                iconBgClass="bg-yellow-100"
                                iconTextClass="text-yellow-600"
                                valueClass={activeCard === 'aggregators' ? 'text-yellow-700 underline' : 'text-gray-800'}
                                onClick={() => handleStatCardClick('aggregators')}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Dynamic Data Table */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{dynamicTableTitle}</h2>
                    
                    {/* Filter Buttons */}
                    {(['max_alert', 'min_alert', 'icmp_alert'].includes(activeCard)) && baseAlertCount > 0 && (
                        <div className="flex space-x-2">
                            <Button
                                variant={actionFilter === 'all' ? 'solid' : 'ghost'}
                                onClick={() => handleActionFilterClick('all')}
                                size="sm"
                                leftIcon={Filter}
                            >
                                All
                            </Button>
                            {/* Unresolved Filter (includes running and paused for table view) */}
                            <Button
                                variant={actionFilter === 'unresolved' ? 'solid' : 'ghost'}
                                onClick={() => handleActionFilterClick('unresolved')}
                                size="sm"
                                leftIcon={AlertCircle}
                            >
                                Unresolved
                            </Button>
                            <Button
                                variant={actionFilter === 'running' ? 'solid' : 'ghost'}
                                onClick={() => handleActionFilterClick('running')}
                                size="sm"
                                leftIcon={Play}
                            >
                                Running
                            </Button>
                            <Button
                                variant={actionFilter === 'paused' ? 'solid' : 'ghost'}
                                onClick={() => handleActionFilterClick('paused')}
                                size="sm"
                                leftIcon={Pause}
                            >
                                Paused
                            </Button>
                            <Button
                                variant={actionFilter === 'resolved' ? 'solid' : 'ghost'}
                                onClick={() => handleActionFilterClick('resolved')}
                                size="sm"
                                leftIcon={CheckCircle}
                            >
                                Resolved
                            </Button>
                        </div>
                    )}
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
                        rowKey="nttn_link_id" 
                    />
                )}
            </div>

            {/* Utilization Chart (UNCHANGED) */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Min & Max Utilization (Last 7 Days)</h2>
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm h-96 relative">
                    <div className="h-[calc(100%-40px)]">
                        <Chart
                            type="line"
                            data={chartData}
                            options={utilizationChartOptions}
                            className="h-full"
                            initialLoading={initialLoading}
                            fallbackMessage="No utilization logs found."
                        />
                    </div>
                </div>
            </div>
            
            {/* Confirmation Modal Render (UNCHANGED) */}
            <ConfirmationModal
                isOpen={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                onConfirm={handleConfirmResolve}
                title="Confirm Alert Resolution"
                message="Are you sure you want to mark this alert as resolved? This action will remove it from the active alert count."
                linkId={alertToResolve?.nttn_link_id}
            />
        </div>
    );
}