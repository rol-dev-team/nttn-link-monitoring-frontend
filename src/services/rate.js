import api from "./api";

// Convert date to YYYY-MM-DD format or null
const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extract just the YYYY-MM-DD part
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Transform payload keys to match backend expectations
const transformPayload = (payload) => ({
  ...payload,
  nttn: payload.nttn_id,  // Map nttn_id to nttn
  bw: payload.bw_id,      // Map bw_id to bw
  effective_from: formatDateForAPI(payload.effective_from),
  effective_to: formatDateForAPI(payload.effective_to),
  // Remove the original _id fields
  nttn_id: undefined,
  bw_id: undefined
});

// Transform response keys to match frontend expectations
const transformResponse = (response) => ({
  ...response,
  nttn_id: response.nttn,  // Map nttn back to nttn_id
  bw_id: response.bw,      // Map bw back to bw_id
  effective_from: response.effective_from ? new Date(response.effective_from) : null,
  effective_to: response.effective_to ? new Date(response.effective_to) : null
});

export const createRate = async (payload) => {
  try {
    const transformedPayload = transformPayload(payload);
    const response = await api.post("/rates/", transformedPayload);
    return transformResponse(response.data);
  } catch (error) {
    console.error('Create rate error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create rate');
  }
};

export const fetchRates = async () => {
  try {
    const response = await api.get("/rates/");
    return response.data.map(transformResponse);
  } catch (error) {
    console.error('Fetch rates error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch rates');
  }
};

export const fetchRate = async (id) => {
  try {
    const response = await api.get(`/rates/${id}/`);
    return transformResponse(response.data);
  } catch (error) {
    console.error(`Fetch rate ${id} error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch rate ${id}`);
  }
};

export const updateRate = async (id, data) => {
  try {
    const transformedPayload = transformPayload(data);
    const response = await api.put(`/rates/${id}/`, transformedPayload);
    return transformResponse(response.data);
  } catch (error) {
    console.error(`Update rate ${id} error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to update rate ${id}`);
  }
};

export const deleteRate = async (id) => {
  try {
    const response = await api.delete(`/rates/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Delete rate ${id} error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to delete rate ${id}`);
  }
};

// export const fetchRatesByID = async (nttnId, bwId) => {
//   try {
//     const response = await api.get(`/rates/?nttn_id=${nttnId}&bw_id=${bwId}`);
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to fetch rates');
//   }
// };


export const fetchRatesByID = async (nttnId, bwId) => {
  try {
    const response = await api.get(`/rates/`);
    // Filter by nttn_id and bw_id on the client side
    const allRates = response.data;
    return allRates.filter(rate =>
      rate.nttn === nttnId && rate.bw === bwId
    );
  } catch (error) {
    throw new Error('Failed to fetch rates');
  }
};


export default {
  createRate,
  fetchRates,
  fetchRate,
  updateRate,
  deleteRate
};