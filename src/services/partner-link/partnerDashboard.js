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




export const fetchPartnerDownloadUtilizationAlert = async () => {
    try {
        const response = await axiosInstance.get("/max-download-utilization-alert");
        return response.data;
    } catch (error) {
        throw error;
    }
};





export const fetchPartnerUploadUtilizationAlert = async () => {
    try {
        const response = await axiosInstance.get("/max-upload-utilization-alert");
        return response.data;
    } catch (error) {
        throw error;
    }
};




export const fetchPartnerMinDownloadUtilizationAlert = async () => {
    try {
        const response = await axiosInstance.get("/min-download-utilization-alert");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ✅ Upload (Min)
export const fetchPartnerMinUploadUtilizationAlert = async () => {
    try {
        const response = await axiosInstance.get("/min-upload-utilization-alert");
        return response.data;
    } catch (error) {
        throw error;
    }
};