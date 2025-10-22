import api from "./api";
export const createSBU = async (payload) => {
  try {
    const response = await api.post("/sbus/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBUs = async () => {
  try {
    const response = await api.get("/sbus/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBU = async (id) => {
  try {
    const response = await api.get(`/sbus/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSBU = async (id, data) => {
  try {
    const response = await api.put(`/sbus/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSBU = async (id) => {
  try {
    const response = await api.delete(`/sbus/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
