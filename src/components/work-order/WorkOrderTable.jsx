// import moment from "moment";
// import { PencilIcon } from "@heroicons/react/24/outline";

// const WorkOrderTable = ({ records, onEdit }) => {
//   if (records?.length === 0) {
//     return (
//       <div className='text-center text-gray-500 mt-6'>No Record Found.</div>
//     );
//   }

//   return (
//     <div className='overflow-x-auto'>
//       <table className='min-w-full border border-gray-300 text-sm whitespace-nowrap'>
//         <thead className='bg-blue-50'>
//           <tr>
//             {/* Basic Details */}
//             <th className='border px-3 py-2 text-left'>SBU</th>
//             <th className='border px-3 py-2 text-left'>Link Type</th>
//             <th className='border px-3 py-2 text-left'>Aggregator</th>
//             <th className='border px-3 py-2 text-left'>KAM</th>
//             <th className='border px-3 py-2 text-left'>NTTN Name</th>
//             <th className='border px-3 py-2 text-left'>Client Name</th>

//             {/* NTTN Details */}
//             <th className='border px-3 py-2 text-left'>NTTN Survey ID</th>
//             <th className='border px-3 py-2 text-left'>NTTN LAT</th>
//             <th className='border px-3 py-2 text-left'>NTTN Long</th>

//             {/* Client Details */}
//             <th className='border px-3 py-2 text-left'>Client LAT</th>
//             <th className='border px-3 py-2 text-left'>Client Long</th>
//             <th className='border px-3 py-2 text-left'>MAC Users</th>

//             {/* Work Order Details */}
//             <th className='border px-3 py-2 text-left'>NTTN Link ID</th>
//             <th className='border px-3 py-2 text-left'>Request Capacity</th>
//             <th className='border px-3 py-2 text-left'>Shift Capacity</th>
//             <th className='border px-3 py-2 text-left'>Current Capacity</th>
//             <th className='border px-3 py-2 text-left'>Rate ID</th>
//             <th className='border px-3 py-2 text-left'>Work Order MAC User</th>
//             <th className='border px-3 py-2 text-left'>Submission</th>

//             {/* Dates */}
//             <th className='border px-3 py-2 text-left'>Requested Delivery</th>
//             <th className='border px-3 py-2 text-left'>Service Handover</th>

//             {/* Additional Fields */}
//             <th className='border px-3 py-2 text-left'>VLAN</th>
//             <th className='border px-3 py-2 text-left'>Modify Status</th>
//             <th className='border px-3 py-2 text-left'>Status</th>
//             <th className='border px-3 py-2 text-left'>Remarks</th>
//             <th className='border px-3 py-2 text-left'>Posted By</th>
//             <th className='border px-3 py-2 text-left'>Created At</th>
//             <th className='border px-3 py-2 text-left'>Updated At</th>
//             <th className='border px-3 py-2 text-left'>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {records?.map((r, i) => (
//             <tr key={i} className='hover:bg-gray-50'>
//               {/* Basic Details */}
//               <td className='border px-3 py-1'>{r.sbu_name || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.type_name || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.aggregator_name || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.kam_name || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.nttn_name || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.client_name || "N/A"}</td>


//               {/* NTTN Details */}
//               <td className='border px-3 py-1'>{r.nttn_survey_id || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.nttn_lat || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.nttn_long || "N/A"}</td>

//               {/* Client Details */}
//               <td className='border px-3 py-1'>{r.client_lat || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.client_long || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.mac_user || "N/A"}</td>

//               {/* Work Order Details */}
//               <td className='border px-3 py-1'>{r.nttn_work_order_id || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.request_capacity || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.shift_capacity === "1" ? "Yes" : "No"}</td>
//               <td className='border px-3 py-1'>{r.current_capacity || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.rate_id || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.work_order_mac_user || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.submission ? moment(r.submission).format("YYYY-MM-DD") : "N/A"}</td>

//               {/* Dates */}
//               <td className='border px-3 py-1'>{r.requested_delivery ? moment(r.requested_delivery).format("YYYY-MM-DD") : "N/A"}</td>
//               <td className='border px-3 py-1'>{r.service_handover ? moment(r.service_handover).format("YYYY-MM-DD") : "N/A"}</td>

//               {/* Additional Fields */}
//               <td className='border px-3 py-1'>{r.vlan || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.modify_status || "No Modification"}</td>
//               <td className='border px-3 py-1 capitalize'>{r.status || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.remarks || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.posted_by || "N/A"}</td>
//               <td className='border px-3 py-1'>{r.created_at ? moment(r.created_at).format("YYYY-MM-DD HH:mm") : "N/A"}</td>
//               <td className='border px-3 py-1'>{r.updated_at ? moment(r.updated_at).format("YYYY-MM-DD HH:mm") : "N/A"}</td>

//               {/* Action */}
//               <td className='border px-3 py-1'>
//                 <button
//                   className='text-gray-600 hover:text-gray-800'
//                   onClick={() => onEdit(r)}>
//                   <PencilIcon className='h-5 w-5' />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default WorkOrderTable;



import moment from "moment";
import { PencilIcon } from "@heroicons/react/24/outline";

const WorkOrderTable = ({ records, onEdit, ratesData = [] }) => {
  // Function to calculate unit rate and total cost using actual rates data
  const calculateRates = (record) => {
    const requestCapacity = parseFloat(record.request_capacity) || 0;
    
    // If unit_rate is already available in the record, use it
    if (record.unit_rate) {
      const unitRate = parseFloat(record.unit_rate);
      const totalCost = requestCapacity * unitRate;
      return {
        unitRate: unitRate.toFixed(2),
        totalCost: totalCost.toFixed(2),
        rateId: record.rate_id || "N/A"
      };
    }

    // Calculate based on rates data if available
    if (ratesData.length > 0 && record.nttn_id && requestCapacity > 0) {
      const nttnRates = ratesData.filter(rate => rate.nttn_id === record.nttn_id);
      
      // Find matching rate based on bandwidth range
      const matchingRate = nttnRates.find(rate => {
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
          rateId: matchingRate.id
        };
      }
    }

    // Fallback calculation
    return {
      unitRate: "0.00",
      totalCost: "0.00",
      rateId: "N/A"
    };
  };

  if (records?.length === 0) {
    return (
      <div className='text-center text-gray-500 mt-6'>No Record Found.</div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full border border-gray-300 text-sm whitespace-nowrap'>
        <thead className='bg-blue-50'>
          <tr>
            {/* Basic Details */}
            <th className='border px-3 py-2 text-left'>SBU</th>
            <th className='border px-3 py-2 text-left'>Link Type</th>
            <th className='border px-3 py-2 text-left'>Aggregator</th>
            <th className='border px-3 py-2 text-left'>KAM</th>
            <th className='border px-3 py-2 text-left'>NTTN Name</th>
            <th className='border px-3 py-2 text-left'>Client Name</th>

            {/* NTTN Details */}
            <th className='border px-3 py-2 text-left'>NTTN Survey ID</th>
            <th className='border px-3 py-2 text-left'>NTTN LAT</th>
            <th className='border px-3 py-2 text-left'>NTTN Long</th>

            {/* Client Details */}
            <th className='border px-3 py-2 text-left'>Client LAT</th>
            <th className='border px-3 py-2 text-left'>Client Long</th>
            <th className='border px-3 py-2 text-left'>MAC Users</th>

            {/* Work Order Details */}
            <th className='border px-3 py-2 text-left'>NTTN Link ID</th>
            <th className='border px-3 py-2 text-left'>Request Capacity</th>
            <th className='border px-3 py-2 text-left'>Unit Rate</th>
            <th className='border px-3 py-2 text-left'>Total Cost</th>
            <th className='border px-3 py-2 text-left'>Shift Capacity</th>
            <th className='border px-3 py-2 text-left'>Current Capacity</th>
            <th className='border px-3 py-2 text-left'>Rate ID</th>
            <th className='border px-3 py-2 text-left'>Work Order MAC User</th>
            <th className='border px-3 py-2 text-left'>Submission</th>

            {/* Dates */}
            <th className='border px-3 py-2 text-left'>Requested Delivery</th>
            <th className='border px-3 py-2 text-left'>Service Handover</th>

            {/* Additional Fields */}
            <th className='border px-3 py-2 text-left'>VLAN</th>
            <th className='border px-3 py-2 text-left'>Modify Status</th>
            <th className='border px-3 py-2 text-left'>Status</th>
            <th className='border px-3 py-2 text-left'>Remarks</th>
            <th className='border px-3 py-2 text-left'>Posted By</th>
            <th className='border px-3 py-2 text-left'>Created At</th>
            <th className='border px-3 py-2 text-left'>Updated At</th>
            <th className='border px-3 py-2 text-left'>Action</th>
          </tr>
        </thead>
        <tbody>
          {records?.map((r, i) => {
            const rates = calculateRates(r);
            
            return (
              <tr key={i} className='hover:bg-gray-50'>
                {/* Basic Details */}
                <td className='border px-3 py-1'>{r.sbu_name || "N/A"}</td>
                <td className='border px-3 py-1'>{r.type_name || "N/A"}</td>
                <td className='border px-3 py-1'>{r.aggregator_name || "N/A"}</td>
                <td className='border px-3 py-1'>{r.kam_name || "N/A"}</td>
                <td className='border px-3 py-1'>{r.nttn_name || "N/A"}</td>
                <td className='border px-3 py-1'>{r.client_name || "N/A"}</td>

                {/* NTTN Details */}
                <td className='border px-3 py-1'>{r.nttn_survey_id || "N/A"}</td>
                <td className='border px-3 py-1'>{r.nttn_lat || "N/A"}</td>
                <td className='border px-3 py-1'>{r.nttn_long || "N/A"}</td>

                {/* Client Details */}
                <td className='border px-3 py-1'>{r.client_lat || "N/A"}</td>
                <td className='border px-3 py-1'>{r.client_long || "N/A"}</td>
                <td className='border px-3 py-1'>{r.mac_user || "N/A"}</td>

                {/* Work Order Details */}
                <td className='border px-3 py-1'>{r.nttn_work_order_id || "N/A"}</td>
                <td className='border px-3 py-1'>{r.request_capacity || "0"} Mbps</td>
                <td className='border px-3 py-1 font-medium text-green-600'>${rates.unitRate}</td>
                <td className='border px-3 py-1 font-bold text-blue-600'>${rates.totalCost}</td>
                <td className='border px-3 py-1'>{r.shift_capacity === "1" ? "Yes" : "No"}</td>
                <td className='border px-3 py-1'>{r.current_capacity || "N/A"}</td>
                <td className='border px-3 py-1'>{rates.rateId}</td>
                <td className='border px-3 py-1'>{r.work_order_mac_user || "N/A"}</td>
                <td className='border px-3 py-1'>{r.submission ? moment(r.submission).format("YYYY-MM-DD") : "N/A"}</td>

                {/* Dates */}
                <td className='border px-3 py-1'>{r.requested_delivery ? moment(r.requested_delivery).format("YYYY-MM-DD") : "N/A"}</td>
                <td className='border px-3 py-1'>{r.service_handover ? moment(r.service_handover).format("YYYY-MM-DD") : "N/A"}</td>

                {/* Additional Fields */}
                <td className='border px-3 py-1'>{r.vlan || "N/A"}</td>
                <td className='border px-3 py-1'>{r.modify_status || "No Modification"}</td>
                <td className='border px-3 py-1 capitalize'>{r.status || "N/A"}</td>
                <td className='border px-3 py-1'>{r.remarks || "N/A"}</td>
                <td className='border px-3 py-1'>{r.posted_by || "N/A"}</td>
                <td className='border px-3 py-1'>{r.created_at ? moment(r.created_at).format("YYYY-MM-DD HH:mm") : "N/A"}</td>
                <td className='border px-3 py-1'>{r.updated_at ? moment(r.updated_at).format("YYYY-MM-DD HH:mm") : "N/A"}</td>

                {/* Action */}
                <td className='border px-3 py-1'>
                  <button
                    className='text-gray-600 hover:text-gray-800'
                    onClick={() => onEdit(r)}>
                    <PencilIcon className='h-5 w-5' />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkOrderTable;