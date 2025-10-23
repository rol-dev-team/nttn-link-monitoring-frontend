import axiosInstance from "./apiConfig";

export const createPartnerinfo = async (payload) => {
    try {
        const response = await axiosInstance.post("/partner-infos", payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerinfos = async () => {
    try {
        const response = await axiosInstance.get("/partner-infos");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerinfo = async (id) => {
    try {
        const response = await axiosInstance.get(`/partner-infos/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePartnerinfo = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/partner-infos/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePartnerinfo = async (id) => {
    try {
        const response = await axiosInstance.delete(`/partner-infos/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
