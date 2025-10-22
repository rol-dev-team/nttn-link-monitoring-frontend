import api from "./api";

export const createLinkType = async (payload) => {
  try {
    const response = await api.post("/master/link-types/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLinkTypes = async () => {
  try {
    const response = await api.get("/master/link-types/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLinkType = async (id) => {
  try {
    const response = await api.get(`/master/link-types/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLinkType = async (id, data) => {
  try {
    const response = await api.put(`/master/link-types/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLinkType = async (id) => {
  try {
    const response = await api.delete(`/master/link-types/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
