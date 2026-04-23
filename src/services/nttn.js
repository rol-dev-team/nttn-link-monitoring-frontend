import axiosInstance from './partner-link/apiConfig';

export const createNTTN = async (payload) => {
  try {
    const response = await axiosInstance.post('/nttn/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchNTTNs = async () => {
  try {
    const response = await axiosInstance.get('/nttn/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchNTTN = async (id) => {
  try {
    const response = await axiosInstance.get(`/nttn/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNTTN = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/nttn/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNTTN = async (id) => {
  try {
    const response = await axiosInstance.delete(`/nttn/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
