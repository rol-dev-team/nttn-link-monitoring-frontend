import axiosInstance from "./apiConfig";

export const createTechnicalKam = async (payload) => {
    try {
        const response = await axiosInstance.post("/technical-kams", payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchTechnicalKams = async () => {
    try {
        const response = await axiosInstance.get("/technical-kams");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchTechnicalKam = async (id) => {
    try {
        const response = await axiosInstance.get(`/technical-kams/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTechnicalKam = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/technical-kams/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTechnicalKam = async (id) => {
    try {
        const response = await axiosInstance.delete(`/technical-kams/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
