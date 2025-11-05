import { PencilIcon } from "@heroicons/react/24/outline";
import moment from "moment";

const BWModificationTable = ({ records, search, onEdit }) => {
  // Ensure records is always an array
  const safeRecords = Array.isArray(records) ? records : [];

  const filtered = safeRecords.filter((r) =>
    (r.nttn_link_id && r.nttn_link_id.toLowerCase().includes(search.toLowerCase())) ||
    (r.modification_type && r.modification_type.toLowerCase().includes(search.toLowerCase())) ||
    (r.client && r.client.client_name && r.client.client_name.toLowerCase().includes(search.toLowerCase())) ||
    (r.workorder && r.workorder.id && r.workorder.id.toString().includes(search.toLowerCase()))
  );

  if (filtered.length === 0) {
    return (
      <div className='text-center text-gray-500 mt-6'>
        {safeRecords.length === 0 ? "No records available." : "No records found."}
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full border border-gray-300 text-sm'>
        <thead className='bg-blue-50'>
          <tr>
            <th className='border px-3 py-2 text-left'>NTTN Provider</th>
            <th className='border px-3 py-2 text-left'>Modification Type</th>
            <th className='border px-3 py-2 text-left'>Client Category</th>
            <th className='border px-3 py-2 text-left'>Client</th>
            <th className='border px-3 py-2 text-left'>NTTN Link ID</th>
            <th className='border px-3 py-2 text-left'>Current Capacity</th>
            <th className='border px-3 py-2 text-left'>Current Cost</th>
            <th className='border px-3 py-2 text-left'>New BW</th>
            <th className='border px-3 py-2 text-left'>Work Order BW</th>
            <th className='border px-3 py-2 text-left'>New Amount</th>
            <th className='border px-3 py-2 text-left'>Unit Cost</th>
            <th className='border px-3 py-2 text-left'>Work Order</th>
            <th className='border px-3 py-2 text-left'>Created</th>
            <th className='border px-3 py-2 text-left'>Updated</th>
            <th className='border px-3 py-2 text-left'>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} className='hover:bg-gray-50'>
              {/* <td className='border px-3 py-1'>{item.nttn_provider?.nttn_provider || "-"}</td> */}
              <td className='border px-3 py-1'>{item.nttn_provider || "-"}</td>
              <td className="border px-3 py-1">
  {item.client_category_details?.cat_name ?? "-"}
</td>
              <td className="border px-3 py-1">
  {item.client_details?.client_name ?? "-"}
</td>
              <td className='border px-3 py-1'>{item.client || "-"}</td>
              <td className='border px-3 py-1'>{item.nttn_link_id || "-"}</td>
              <td className='border px-3 py-1'>{item.capacity || "-"}</td>
              <td className='border px-3 py-1'>{item.capacity_cost || "-"}</td>
              <td className='border px-3 py-1'>{item.shifting_bw || "-"}</td>
              <td className="border px-3 py-1">
  {item.workorder_details?.request_capacity ?? "-"}
</td>
              <td className='border px-3 py-1'>{item.shifting_capacity || "-"}</td>
              <td className='border px-3 py-1'>{item.shifting_unit_cost || "-"}</td>
              <td className='border px-3 py-1'>{item.workorder || "-"}</td>
              <td className='border px-3 py-1'>
                {item.created_at ? moment(item.created_at).format("LLL") : "-"}
              </td>
              <td className='border px-3 py-1'>
                {item.updated_at ? moment(item.updated_at).format("LLL") : "-"}
              </td>
              <td className='border px-3 py-1'>
                <button
                  onClick={() => onEdit(item)}
                  className='text-gray-600 hover:text-gray-800'>
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

export default BWModificationTable;