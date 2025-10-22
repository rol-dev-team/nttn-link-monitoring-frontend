import api from "./api";

export const createCategory = async (payload) => {
  try {
    const response = await api.post("/categories/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategory = async (id) => {
  try {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await api.put(`/categories/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
