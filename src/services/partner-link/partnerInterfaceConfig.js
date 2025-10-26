import axiosInstance from "./apiConfig";

// export const createPartnerInterfaceConfig = async (payload) => {
//     try {
//         const response = await axiosInstance.post(
//             "/partner-interface-configs",
//             payload
//         );
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

export const fetchPartnerInterfaceConfigs = async () => {
    try {
        const response = await axiosInstance.get("/partner-interface-configs");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchPartnerInterfaceConfig = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/partner-interface-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePartnerInterfaceConfig = async (id, data) => {
    try {
        const response = await axiosInstance.put(
            `/partner-interface-configs/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePartnerInterfaceConfig = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/partner-interface-configs/${id}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// export const fetchNasIps = async () => {
//     try {
//         const response = await axiosInstance.get("/nas-ips");
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

export const fetchNasIps = async () => {
    try {
        const response = await axiosInstance.get("/nas-ips");
        return response.data;
    } catch (error) {
        console.error("Error fetching NAS IPs:", error);
        throw new Error(
            error.response?.data?.message ||
                "Failed to fetch NAS IPs. Please try again."
        );
    }
};

export const createPartnerInterfaceConfig = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/partner-interface-configs",
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating partner interface config:", error);
        throw new Error(
            error.response?.data?.message ||
                "Failed to create partner interface config. Please try again."
        );
    }
};
