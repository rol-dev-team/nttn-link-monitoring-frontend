import api from "./api";
export const createAggregator = async (payload) => {
  try {
    const response = await api.post("/master/aggregators/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAggregators = async () => {
  try {
    const response = await api.get("/master/aggregators/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAggregator = async (id) => {
  try {
    const response = await api.get(`/master/aggregators/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAggregator = async (id, data) => {
  try {
    const response = await api.put(`/master/aggregators/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAggregator = async (id) => {
  try {
    const response = await api.delete(`/master/aggregators/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
