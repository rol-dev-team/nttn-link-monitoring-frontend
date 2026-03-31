import api from './api';
import axiosInstance from './partner-link/apiConfig';
export const createClient = async (payload) => {
  try {
    const response = await axiosInstance.post('/clients/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchClients = async () => {
  try {
    const response = await axiosInstance.get('/clients/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchClient = async (id) => {
  try {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// categoryService.js  (or just drop it in the same file)
export const fetchCategoriesBySBU = async (sbuId) => {
  try {
    const { data } = await axiosInstance.get(`/categories/by-sbu/${sbuId}/`);
    return data; // ← array of categories
  } catch (e) {
    throw e;
  }
};

// NTTN wise Client fetching service
export const fetchClientsByNttn = async (nttnId) => {
  try {
    const response = await axiosInstance.get(`/clients/by-nttn/${nttnId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateClient = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/clients/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/clients/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBUListCategoryWise = async (id) => {
  try {
    const response = await axiosInstance.get(`/categories/sbu/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchDistrictDivisionWise = async (id) => {
  try {
    const response = await axiosInstance.get(`/divisions/districts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchThanaDistrictWise = async (id) => {
  try {
    const response = await axiosInstance.get(`/districts/thanas/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchClientsCategoryWise = async (id) => {
  try {
    const response = await axiosInstance.get(`/clients/by-category/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAllSBUs = async () => {
  try {
    const response = await axiosInstance.get('/sbus-name/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ NEW: Fetch clients filtered by SBU
export const fetchClientsBySbu = async (sbuId) => {
  try {
    const response = await axiosInstance.get(`/clients/by-sbu/${sbuId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};