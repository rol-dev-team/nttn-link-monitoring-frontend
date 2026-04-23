import axiosInstance from './apiConfig';

export const getAlertLogs = async (data) => {
  try {
    const response = await axiosInstance.post('/get-alert-logs', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
