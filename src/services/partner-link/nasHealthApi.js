import axiosInstance from "./apiConfig";


export const getResourceMonitoring = async (data) => {
    try {
        const response = await axiosInstance.post("/nas-health/resource-monitoring", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};


