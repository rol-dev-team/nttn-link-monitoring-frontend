import axiosInstance from './partner-link/apiConfig';
export const createReason = async (payload) => {
  try {
    const response = await axiosInstance.post('/reason/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchReasons = async () => {
  try {
    const response = await axiosInstance.get('/reason/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchReason = async (id) => {
  try {
    const response = await axiosInstance.get(`/reason/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateReason = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/reason/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteReason = async (id) => {
  try {
    const response = await axiosInstance.delete(`/reason/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
