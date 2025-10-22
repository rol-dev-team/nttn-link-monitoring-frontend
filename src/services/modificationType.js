import api from "./api";

export const createModificationType = async (payload) => {
  try {
    const response = await api.post("/modification-types/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchModificationTypes = async () => {
  try {
    const response = await api.get("/modification-types/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchModificationType = async (id) => {
  try {
    const response = await api.get(`/modification-types/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateModificationType = async (id, data) => {
  try {
    const response = await api.put(`/modification-types/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteModificationType = async (id) => {
  try {
    const response = await api.delete(`/modification-types/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};