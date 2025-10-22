import { PencilIcon } from "@heroicons/react/24/outline";
import moment from "moment";

const ShiftCapacityTable = ({ records, search, onEdit }) => {
  const filtered = records.filter((r) =>
    r.nttn_link_id?.toString().includes(search.toLowerCase()) ||
    r.client?.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.shifting_client?.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className='text-center text-gray-500 mt-6'>No records found.</div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full border border-gray-300 text-sm'>
        <thead className='bg-blue-50'>
          <tr>
            <th className='border px-3 py-2 text-left'>From Client</th>

            <th className='border px-3 py-2 text-left'>Link ID</th>
            <th className='border px-3 py-2 text-left'>Last Capacity</th>

            <th className='border px-3 py-2 text-left'>After Shift Capacity</th>
            <th className='border px-3 py-2 text-left'>To Client</th>
            <th className='border px-3 py-2 text-left'>Shifting BW</th>
            <th className='border px-3 py-2 text-left'>Total Cost</th>
            <th className='border px-3 py-2 text-left'>VLAN</th>
            <th className='border px-3 py-2 text-left'>Date</th>
            <th className='border px-3 py-2 text-left'>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} className='hover:bg-gray-50'>
              {/* From Client */}
              <td className='border px-3 py-1'>{item.client_name || 'N/A'}</td>



              {/* Link ID */}
              <td className='border px-3 py-1'>{item.nttn_link_id || 'N/A'}</td>

              {/* Capacity */}
              <td className='border px-3 py-1' title={`Cost: ${item.capacity_cost || 0}`}>
                {item.capacity || '0'}
              </td>



              {/* After Shifting Capacity */}
              <td className='border px-3 py-1'>{item.after_shifting_capacity || '0'}</td>

              {/* To Client */}

              <td className='border px-3 py-1'>{item.shifting_client_name || 'N/A'}</td>
              {/* Shifting BW */}
              <td className='border px-3 py-1'>{item.shifting_bw || '0'}</td>

              {/* Total Shifting Cost */}
              <td className='border px-3 py-1'>{item.total_shifting_cost || '0'}</td>

              {/* VLAN */}
              <td className='border px-3 py-1'>{item.vlan || 'N/A'}</td>

              {/* Created At */}
              <td className='border px-3 py-1'>
                {item.created_at ? moment(item.created_at).format('MMM DD') : 'N/A'}
              </td>

              {/* Action */}
              <td className='border px-3 py-1'>
                <button
                  onClick={() => onEdit(item)}
                  className='text-gray-600 hover:text-gray-800'
                  title="Edit"
                >
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

export default ShiftCapacityTable;