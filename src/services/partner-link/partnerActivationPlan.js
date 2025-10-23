import axiosInstance from "./apiConfig";

export const createPartnerActivation = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/partner-activation-plans",
            payload
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerActivations = async () => {
    try {
        const response = await axiosInstance.get("/partner-activation-plans");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerActivation = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/partner-activation-plans/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePartnerActivation = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            `/partner-activation-plans/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePartnerActivation = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/partner-activation-plans/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
