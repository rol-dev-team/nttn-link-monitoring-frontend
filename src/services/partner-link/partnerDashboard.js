import axiosInstance from "./apiConfig";



export const fetchPartnerAggreatorSummary = async () => {
    try {
        const response = await axiosInstance.get("/aggreator-summary");
        return response.data;
    } catch (error) {
        throw error;
    }
};




export const fetchPartnerPartnerCountSummary = async () => {
    try {
        const response = await axiosInstance.get("/partner-summary");
        return response.data;
    } catch (error) {
        throw error;
    }
};




export const fetchPartnerUtilizationLast7Days = async () => {
    try {
        const response = await axiosInstance.get("/nas-utilization/last-7-days");
        return response.data;
    } catch (error) {
        throw error;
    }
};