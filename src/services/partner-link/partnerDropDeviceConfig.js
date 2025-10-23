import axiosInstance from "./apiConfig";

export const createPartnerDropDeviceConfig = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/partner-drop-device-configs",
            payload
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerDropDeviceConfigs = async () => {
    try {
        const response = await axiosInstance.get(
            "/partner-drop-device-configs"
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerDropDeviceConfig = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/partner-drop-device-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePartnerDropDeviceConfig = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            `/partner-drop-device-configs/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePartnerDropDeviceConfig = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/partner-drop-device-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
