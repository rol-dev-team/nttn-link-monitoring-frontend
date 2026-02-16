import axiosInstance from './partner-link/apiConfig';

/* ---------- Create a new Agg Landmark ---------- */
export const createAggLandmark = async (payload) => {
  try {
    const response = await axiosInstance.post('/aggregation-landmarks', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ---------- Fetch all Agg Landmarks ---------- */
export const fetchAggLandmarks = async (id) => {
  try {
    const response = await axiosInstance.get('/aggregation-landmarks');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ---------- Fetch a single Agg Landmark by ID ---------- */
export const fetchAggLandmark = async (id) => {
  try {
    const response = await axiosInstance.get(`/aggregation-landmarks/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ---------- Update Agg Landmark ---------- */
export const updateAggLandmark = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/aggregation-landmarks/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ---------- Delete Agg Landmark ---------- */
export const deleteAggLandmark = async (id) => {
  try {
    const response = await axiosInstance.delete(`/aggregation-landmarks/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
