import axiosInstance from "./apiConfig";


export const fetchCategoryWiseClientPartner = async () => {
    try {
        const response = await axiosInstance.get("/clients/by-category");
        return response.data;
    } catch (error) {
        throw error;
    }
};




export const fetchWorkOrderDetailsForPartner = async (workOrderId) => {
  try {
    // URL updated to match the new Laravel route
    const response = await axiosInstance.get("/work-orders-details/partner", {
      params: { work_order_id: workOrderId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching work order details:", error);
    throw error;
  }
};