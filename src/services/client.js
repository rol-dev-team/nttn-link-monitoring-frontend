import api from "./api";
export const createClient = async (payload) => {
  try {
    const response = await api.post("/clients/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchClients = async () => {
  try {
    const response = await api.get("/clients/");
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
    const { data } = await api.get(`/categories/by-sbu/${sbuId}/`);
    return data;          // ← array of categories
  } catch (e) {
    throw e;
  }
};
export const updateClient = async (id, data) => {
  try {
    const response = await api.put(`/clients/${id}/`, data);
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
    const response = await api.get(`/categories/sbu/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchDistrictDivisionWise = async (id) => {
  try {
    const response = await api.get(`/divisions/districts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchThanaDistrictWise = async (id) => {
  try {
    const response = await api.get(`/districts/thanas/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchClientsCategoryWise = async (id) => {
  try {
    const response = await api.get(`/clients/by-category/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
