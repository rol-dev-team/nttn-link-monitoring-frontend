import api from "./api";
export const createKam = async (payload) => {
  try {
    const response = await api.post("/master/kams/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchKams = async () => {
  try {
    const response = await api.get("/master/kams/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchKam = async (id) => {
  try {
    const response = await api.get(`/master/kams/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateKam = async (id, data) => {
  try {
    const response = await api.put(`/master/kams/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteKam = async (id) => {
  try {
    const response = await api.delete(`/master/kams/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
