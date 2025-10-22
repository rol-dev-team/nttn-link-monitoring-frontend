import api from "./api";

export const createNTTN = async (payload) => {
  try {
    const response = await api.post("/nttns/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchNTTNs = async () => {
  try {
    const response = await api.get("/nttns/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchNTTN = async (id) => {
  try {
    const response = await api.get(`/nttns/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNTTN = async (id, data) => {
  try {
    const response = await api.put(`/nttns/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNTTN = async (id) => {
  try {
    const response = await api.delete(`/nttns/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
