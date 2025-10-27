import axiosInstance from "./apiConfig";

const DASHBOARD_BASE_PATH = "/dashboard";

export const getDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get(`${DASHBOARD_BASE_PATH}/summary`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardDetails = async (type, page = 1) => {
  try {
    const response = await axiosInstance.get(`${DASHBOARD_BASE_PATH}/details`, {
      params: {
        type: type,
        page: page,
        per_page: 10,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPartnerInfos = async () => {
  try {
    const response = await axiosInstance.get(
      `${DASHBOARD_BASE_PATH}/partner-infos`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAggregators = async () => {
  try {
    const response = await axiosInstance.get(
      `${DASHBOARD_BASE_PATH}/aggregators`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMaxUtilizationAlert = async () => {
  try {
    const response = await axiosInstance.get(
      `${DASHBOARD_BASE_PATH}/max-utilization-alert`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMinUtilizationAlert = async () => {
  try {
    const response = await axiosInstance.get(
      `${DASHBOARD_BASE_PATH}/min-utilization-alert`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getICMPAlert = async () => {
  try {
    const response = await axiosInstance.get(
      `${DASHBOARD_BASE_PATH}/icmp-alert`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMinMaxUtilizationLastSevenDays = async () => {
  try {
    const response = await axiosInstance.get(
      `${DASHBOARD_BASE_PATH}/utilization/min-max/last-seven-days`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
