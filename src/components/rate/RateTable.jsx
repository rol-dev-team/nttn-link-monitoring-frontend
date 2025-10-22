import { PencilIcon } from "@heroicons/react/24/outline";
import moment from "moment";

const RateTable = ({ records, search, onEdit }) => {
  const filtered = records.filter((r) =>
    r.id.toString().includes(search.toLowerCase()) ||
    r.nttn_id.toString().includes(search.toLowerCase()) ||
    r.bw_id.toString().includes(search.toLowerCase()) ||
    r.rate.toString().includes(search.toLowerCase())
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
            <th className='border px-3 py-2 text-left'>Rate ID</th>
            <th className='border px-3 py-2 text-left'>NTN Name</th>
            <th className='border px-3 py-2 text-left'>BW ID</th>
            <th className='border px-3 py-2 text-left'>Rate</th>
            <th className='border px-3 py-2 text-left'>Effective From</th>
            <th className='border px-3 py-2 text-left'>Effective To</th>
            <th className='border px-3 py-2 text-left'>Continue</th>
            <th className='border px-3 py-2 text-left'>Status</th>
            <th className='border px-3 py-2 text-left'>Created At</th>
            <th className='border px-3 py-2 text-left'>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.rate_id} className='hover:bg-gray-50'>
              <td className='border px-3 py-1'>{item.id}</td>
              <td className='border px-3 py-1'>{item.nttn_name}</td>
              <td className='border px-3 py-1'>{item.bw_id}</td>
              <td className='border px-3 py-1'>{item.rate}</td>
              <td className='border px-3 py-1'>
                {moment(item.effective_from).format("LLL")}
              </td>
              <td className='border px-3 py-1'>
                {item.effective_to ? moment(item.effective_to).format("LLL") : 'N/A'}
              </td>
              <td className='border px-3 py-1'>
                {item.continue ? 'Yes' : 'No'}
              </td>
              <td className='border px-3 py-1'>
                {item.status === 1 ? 'Active' : 'Inactive'}
              </td>
              <td className='border px-3 py-1'>
                {moment(item.created_at).format("LLL")}
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

export default RateTable;