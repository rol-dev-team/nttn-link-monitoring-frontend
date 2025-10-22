import api from "./api";


// bandwidthRanges API
export const createBandwidthRange = async (payload) => {
  try {
    const response = await api.post("/bandwidth-ranges/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBandwidthRanges = async () => {
  try {
    const response = await api.get("/bandwidth-ranges/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBandwidthRange = async (id) => {
  try {
    const response = await api.get(`/bandwidth-ranges/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBandwidthRange = async (id, data) => {
  try {
    const response = await api.put(`/bandwidth-ranges/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBandwidthRange = async (id) => {
  try {
    const response = await api.delete(`/bandwidth-ranges/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// export const fetchBandwidthRangesByID = async (nttnId) => {
//   const response = await api.get(`/bandwidth-ranges/?nttn_id=${nttnId}`);
//   return response.data;
// };


export const fetchBandwidthRangesByID = async (nttnId) => {
  try {
    const response = await api.get(`/bandwidth-ranges/`);
    // Filter by nttn_id on the client side since your endpoint doesn't support query params
    const allRanges = response.data;
    return allRanges.filter(range => range.nttn_id === nttnId);
  } catch (error) {
    throw new Error('Failed to fetch bandwidth ranges');
  }
};



export const fetchBandwidthRangesByNttnID = async (nttnId) => {
  try {
    const response = await api.get(`/bandwidth-ranges/?nttn_id=${nttnId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch bandwidth ranges');
  }
};
