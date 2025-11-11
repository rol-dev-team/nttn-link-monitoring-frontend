import api from "./api";
import axiosInstance from "./partner-link/apiConfig";
// export const createWorkOrder = async (payload) => {
//   try {
//     const response = await api.post("/work-orders/", payload);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const fetchWorkOrders = async (filters = {}) => {
  try {
    const params = { ...filters };

    for (const key in filters) {
      const value = filters[key];

      if (Array.isArray(value) && value.length === 2) {
        delete params[key];

        params[`${key}_start`] = value[0];
        params[`${key}_end`] = value[1];
      }
    }

    const response = await api.get("/work-orders/", {
      params: params,
    });
    const headerValue = response.headers["x-total-count"];

    const totalCount = parseInt(headerValue, 10) || 0;
    return {
      data: response.data,
      totalCount: totalCount,
    };
  } catch (error) {
    throw error;
  }
};
export const createWorkOrder = async (payload) => {
  try {
    const response = await api.post("/combined-submission/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const fetchWorkOrders = async () => {
//   try {
//     const response = await api.get("/work-orders/");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const fetchWorkOrder = async (id) => {
  try {
    const response = await api.get(`/work-orders/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWorkOrder = async (id, data) => {
  try {
    const response = await api.put(`/work-orders/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteWorkOrder = async (id) => {
  try {
    const response = await api.delete(`/work-orders/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};




export const createWorkOrderLaravel = async (payload) => {
  try {
    const response = await axiosInstance.post("/work-orders/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const fetchWorkOrdersLaravel = async (filters = {}) => {
  try {
    const params = { ...filters };

    for (const key in filters) {
      const value = filters[key];

      if (Array.isArray(value) && value.length === 2) {
        delete params[key];

        params[`${key}_start`] = value[0];
        params[`${key}_end`] = value[1];
      }
    }
    const response = await axiosInstance.get("/work-orders/", {
      params: params,
    });

    const headerValue = response.headers["x-total-count"];
    const totalCount = parseInt(headerValue, 10) || 0;
    return {
      data: response.data,
      totalCount: totalCount,
    };
  } catch (error) {
    throw error;
  }
};



export const updateWorkOrderLaravel = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/work-orders/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// export const fetchWorkOrderLaravel = async (id) => {
//   try {
//     const response = await axiosInstance.get(`/work-orders/${id}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


// export const fetchWorkOrder = async (id) => {
//   try {
//     const response = await api.get(`/work-orders/${id}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


export const fetchWorkOrderLaravel = async (id) => {
  try {
    console.log(`📡 Fetching work order with ID: ${id}`);
    const response = await axiosInstance.get(`/work-orders/${id}/`);
    console.log('✅ Work order API response:', response.data);
    
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching work order:', error);
    throw error;
  }
};


// services/workOrder.js



export const fetchWorkOrderBeModification = async (id = null, clientId = null) => {
  try {
    let url = '/work-orders';
    
    if (id) {
      // Fetch single work order by ID
      console.log(`📡 Fetching work order with ID: ${id}`);
      url += `/${id}`;
    } else if (clientId) {
      // Fetch work orders by client ID - NEW ENDPOINT
      console.log(`📡 Fetching work orders for client ID: ${clientId}`);
      url += `/client/${clientId}`;
    } else {
      // Fetch all work orders
      console.log('📡 Fetching all work orders');
    }
    
    const response = await axiosInstance.get(url);
    console.log('✅ Work order API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching work orders:', error);
    throw error;
  }
};

