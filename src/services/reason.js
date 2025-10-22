import api from "./api";
export const createReason = async (payload) => {
  try {
    const response = await api.post("/master/reasons/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchReasons = async () => {
  try {
    const response = await api.get("/master/reasons/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchReason = async (id) => {
  try {
    const response = await api.get(`/master/reasons/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateReason = async (id, data) => {
  try {
    const response = await api.put(`/master/reasons/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteReason = async (id) => {
  try {
    const response = await api.delete(`/master/reasons/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
