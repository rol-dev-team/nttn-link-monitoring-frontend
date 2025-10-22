import api from "./api";

//Division APIs
export const createDivision = async (payload) => {
  try {
    const response = await api.post("/divisions/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDivisions = async () => {
  try {
    const response = await api.get("/divisions/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDivision = async (id) => {
  try {
    const response = await api.get(`/divisions/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDivision = async (id, data) => {
  try {
    const response = await api.put(`/divisions/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDivision = async (id) => {
  try {
    const response = await api.delete(`/divisions/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//District APIs

export const createDistrict = async (payload) => {
  try {
    const response = await api.post("/districts/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDistricts = async () => {
  try {
    const response = await api.get("/districts/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDistrict = async (id) => {
  try {
    const response = await api.get(`/districts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDistrict = async (id, data) => {
  try {
    const response = await api.put(`/districts/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDistrict = async (id) => {
  try {
    const response = await api.delete(`/districts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//Thana APIs
export const createThana = async (payload) => {
  try {
    const response = await api.post("/thanas/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchThanas = async () => {
  try {
    const response = await api.get("/thanas/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchThana = async (id) => {
  try {
    const response = await api.get(`/thanas/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateThana = async (id, data) => {
  try {
    const response = await api.put(`/thanas/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteThana = async (id) => {
  try {
    const response = await api.delete(`/thanas/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
