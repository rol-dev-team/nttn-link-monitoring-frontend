import axiosInstance from "./apiConfig";

export const createRadiusServer = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/radius-server-ips",
            payload
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchRadiusServers = async () => {
    try {
        const response = await axiosInstance.get("/radius-server-ips");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchRadiusServer = async (id) => {
    try {
        const response = await axiosInstance.get(`/radius-server-ips/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateRadiusServer = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            `/radius-server-ips/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRadiusServer = async (id) => {
    try {
        const response = await axiosInstance.delete(`/radius-server-ips/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
