import axiosInstance from "../services/partner-link/apiConfig";

// Create new survey
export const createBwRates = async (payload) => {
  try {
    const response = await axiosInstance.post("/bw-rates/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSBwRates = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/bw-rates", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
