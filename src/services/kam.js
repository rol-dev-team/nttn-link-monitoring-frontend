import axiosInstance from './partner-link/apiConfig';
export const createKam = async (payload) => {
  try {
    const response = await axiosInstance.post('/kam', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchKams = async () => {
  try {
    const response = await axiosInstance.get('/kam');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchKam = async (id) => {
  try {
    const response = await axiosInstance.get(`/kam/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateKam = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/kam/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteKam = async (id) => {
  try {
    const response = await axiosInstance.delete(`/kam/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
