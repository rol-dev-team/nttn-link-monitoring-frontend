import axiosInstance from "./apiConfig";

export const createCapacityAleart = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/capacity-alert-configs",
            payload
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchCapacityAlearts = async () => {
    try {
        const response = await axiosInstance.get("/capacity-alert-configs");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchCapacityAleart = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/capacity-alert-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateCapacityAleart = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            `/capacity-alert-configs/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteCapacityAleart = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/capacity-alert-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
