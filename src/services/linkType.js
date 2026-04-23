import axiosInstance from './partner-link/apiConfig';
export const createLinkType = async (payload) => {
  try {
    const response = await axiosInstance.post('/link-type/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLinkTypes = async () => {
  try {
    const response = await axiosInstance.get('/link-type/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLinkType = async (id) => {
  try {
    const response = await axiosInstance.get(`/link-type/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLinkType = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/link-type/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLinkType = async (id) => {
  try {
    const response = await axiosInstance.delete(`/link-type/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
