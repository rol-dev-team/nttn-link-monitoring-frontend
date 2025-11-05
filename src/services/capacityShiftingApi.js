import axiosInstance from "./partner-link/apiConfig";


export const createCapacityShifting = async (payload) => {
  try {
    const response = await axiosInstance.post("/capacity-shifting/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchCapacityShifting = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/capacity-shiftings", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWorkOrderCategoryAndClientWise = async (payload) => {
  try {
    const response = await axiosInstance.post("/work-orders/filter/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRateBetweenBandwidthRange = async (payload) => {
  try {
    const response = await axiosInstance.post("/rates/get-rate/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};


