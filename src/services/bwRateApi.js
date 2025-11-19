import axiosInstance from '../services/partner-link/apiConfig';

// Create new survey
export const createBwRates = async (payload) => {
  try {
    const response = await axiosInstance.post('/bw-rates/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBwRates = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/bw-rates', {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBwRates = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/bw-rates/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBwRates = async (id) => {
  try {
    const response = await axiosInstance.delete(`/bw-rates/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getRatesByNttn = async (nttnId) => {
  try {
    const response = await axiosInstance.get(`/capacity-shifting/rates/nttn/${nttnId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
