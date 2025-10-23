import axiosInstance from "./apiConfig";

export const createIcmpAleartConfig = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/icmp-alert-configs",
            payload
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchIcmpAleartConfigs = async () => {
    try {
        const response = await axiosInstance.get("/icmp-alert-configs");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchIcmpAleartConfig = async (id) => {
    try {
        const response = await axiosInstance.get(`/icmp-alert-configs/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateIcmpAleartConfig = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            `/icmp-alert-configs/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteIcmpAleartConfig = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/icmp-alert-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
