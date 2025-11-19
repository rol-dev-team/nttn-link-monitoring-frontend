import axiosInstance from './partner-link/apiConfig';
export const createSBU = async (payload) => {
  try {
    const response = await axiosInstance.post('/sbu/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBUs = async () => {
  try {
    const response = await axiosInstance.get('/sbu/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBU = async (id) => {
  try {
    const response = await axiosInstance.get(`/sbu/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSBU = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/sbu/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSBU = async (id) => {
  try {
    const response = await axiosInstance.delete(`/sbu/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
