import axiosInstance from './partner-link/apiConfig';

export const createCategory = async (payload) => {
  try {
    const response = await axiosInstance.post('/category/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get('/category/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategory = async (id) => {
  try {
    const response = await axiosInstance.get(`/category/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/category/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/category/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
