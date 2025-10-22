import { PencilIcon } from "@heroicons/react/24/outline";
import moment from "moment";

const BwRangeTable = ({ records, search, onEdit }) => {
  const filtered = records.filter((r) =>
    r.id.toString().includes(search.toLowerCase()) ||
    r.nttn_name.toLowerCase().includes(search.toLowerCase()) ||
    r.price.toString().includes(search.toLowerCase())
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
            <th className='border px-3 py-2 text-left'>BW ID</th>
            <th className='border px-3 py-2 text-left'>NTTN Name</th>
            <th className='border px-3 py-2 text-left'>Range From</th>
            <th className='border px-3 py-2 text-left'>Range To</th>
            <th className='border px-3 py-2 text-left'>Price</th>
            <th className='border px-3 py-2 text-left'>Created At</th>
            <th className='border px-3 py-2 text-left'>Updated At</th>
            <th className='border px-3 py-2 text-left'>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} className='hover:bg-gray-50'>
              <td className='border px-3 py-1'>{item.id}</td>
              <td className='border px-3 py-1'>{item.nttn_name}</td>
              <td className='border px-3 py-1'>{item.range_from}</td>
              <td className='border px-3 py-1'>{item.range_to}</td>
              <td className='border px-3 py-1'>{item.price}</td>
              <td className='border px-3 py-1'>
                {moment(item.created_at).format("LLL")}
              </td>
              <td className='border px-3 py-1'>
                {moment(item.updated_at).format("LLL")}
              </td>
              <td className='border px-3 py-1'>
                <button
                  onClick={() => onEdit(item)}
                  className='text-gray-600 hover:text-gray-800'
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

export default BwRangeTable;
