import moment from "moment";
import { PencilIcon } from "@heroicons/react/24/outline";

const WorkOrderTable = ({ records, onEdit }) => {
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
          {/* Survey Fields */}
          <th className='border px-3 py-2 text-left'>Type</th>
          <th className='border px-3 py-2 text-left'>SBU</th>
          <th className='border px-3 py-2 text-left'>Link Type</th>
          <th className='border px-3 py-2 text-left'>Aggregator</th>
          <th className='border px-3 py-2 text-left'>KAM</th>
          <th className='border px-3 py-2 text-left'>NTTN Name</th>
          <th className='border px-3 py-2 text-left'>NTTN Survey ID</th>
          <th className='border px-3 py-2 text-left'>NTTN LAT</th>
          <th className='border px-3 py-2 text-left'>NTTN Long</th>

          {/* Client Fields */}
          <th className='border px-3 py-2 text-left'>Client Name</th>
          <th className='border px-3 py-2 text-left'>Client Category</th>
          <th className='border px-3 py-2 text-left'>Division</th>
          <th className='border px-3 py-2 text-left'>District</th>
          <th className='border px-3 py-2 text-left'>Thana</th>
          <th className='border px-3 py-2 text-left'>Client Code</th>
          <th className='border px-3 py-2 text-left'>Client LAT</th>
          <th className='border px-3 py-2 text-left'>Client Long</th>
          <th className='border px-3 py-2 text-left'>Address</th>
          <th className='border px-3 py-2 text-left'>MAC Users</th>
          <th className='border px-3 py-2 text-left'>Submission Date</th>

          {/* WorkOrder Fields */}
          <th className='border px-3 py-2 text-left'>NTTN Link ID</th>
          <th className='border px-3 py-2 text-left'>Request Capacity</th>
          <th className='border px-3 py-2 text-left'>Total Cost</th>
          {/* <th className='border px-3 py-2 text-left'>Shift Capacity</th>
          <th className='border px-3 py-2 text-left'>Net Capacity</th>
          <th className='border px-3 py-2 text-left'>Net Capacity Price</th> */}
          <th className='border px-3 py-2 text-left'>Unit Rate</th>
          {/* <th className='border px-3 py-2 text-left'>VLAN</th> */}
          <th className='border px-3 py-2 text-left'>Remarks</th>
          <th className='border px-3 py-2 text-left'>Requested Delivery</th>
          <th className='border px-3 py-2 text-left'>Service Handover</th>
          <th className='border px-3 py-2 text-left'>Status</th>
          <th className='border px-3 py-2 text-left'>Action</th>
        </tr>
      </thead>
      <tbody>
        {records?.map((r, i) => (
          <tr key={i} className='hover:bg-gray-50'>
            {/* Survey Data */}
            <td className='border px-3 py-1'>{r.survey_data?.type_name || r.type_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.sbu_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.link_type_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.aggregator_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.kam_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.nttn_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.nttn_survey_id || r.nttn_survey_id}</td>
            <td className='border px-3 py-1'>{r.survey_data?.nttn_lat}</td>
            <td className='border px-3 py-1'>{r.survey_data?.nttn_long}</td>

            {/* Client Data */}
            <td className='border px-3 py-1'>{r.survey_data?.client_name}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_category}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_division}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_district}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_thana}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_code}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_lat}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_long}</td>
            <td className='border px-3 py-1'>{r.survey_data?.client_address}</td>
            <td className='border px-3 py-1'>{r.survey_data?.mac_user}</td>
            <td className='border px-3 py-1'>
              {moment(r.survey_data?.submition).format("llll")}
            </td>

            {/* WorkOrder Data */}
            <td className='border px-3 py-1'>{r.nttn_link_id}</td>
            <td className='border px-3 py-1'>{r.request_capacity}</td>
            <td className='border px-3 py-1'>{r.total_cost_of_request_capacity}</td>
            {/* <td className='border px-3 py-1'>{r.shift_capacity ? 'Yes' : 'No'}</td>
            <td className='border px-3 py-1'>{r.net_capacity}</td>
            <td className='border px-3 py-1'>{r.net_capacity_price}</td> */}
            <td className='border px-3 py-1'>{r.unit_rate}</td>
            {/* <td className='border px-3 py-1'>{r.vlan}</td> */}
            <td className='border px-3 py-1'>{r.remarks}</td>
            <td className='border px-3 py-1'>
              {moment(r.requested_delivery).format("llll")}
            </td>
            <td className='border px-3 py-1'>
              {moment(r.service_handover).format("llll")}
            </td>
            <td className='border px-3 py-1'>{r.status}</td>
            <td className='border px-3 py-1'>
              <button
                className='text-gray-600 hover:text-gray-800'
                onClick={() => onEdit(r)}>
                <PencilIcon className='h-5 w-5' />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

export default WorkOrderTable;
