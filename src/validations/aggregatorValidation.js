// src/validations/aggregatorValidation.js
// import * as Yup from "yup";

// export const AggregatorSchema = Yup.object().shape({
//   aggregator_name: Yup.string().required("Aggregator is required"),
//   address: Yup.string().required("Address is required"),
// });

// src/validations/aggregatorValidation.js
import * as Yup from "yup";

export const AggregatorSchema = Yup.object().shape({
  aggregator_name: Yup.string()
    .trim()
    .required("Aggregator Name is required")
    .max(255, "Aggregator Name cannot exceed 255 characters"),

  address: Yup.string()
    .trim()
    .required("Address is required")
    .max(500, "Address cannot exceed 500 characters"),

  sbu_id: Yup.number()
    .typeError("SBU selection is required")
    .required("SBU is required"),

  aggr_landmark_id: Yup.number()
    .typeError("Landmark selection is required")
    .required("Landmark is required"),

  nttn_id: Yup.number()
    .typeError("NTTN selection is required")
    .required("NTTN is required"),

  link_type_id: Yup.number()
    .typeError("Link Type selection is required")
    .required("Link Type is required"),

  agg_link_id: Yup.string()
    .trim()
    .required("Agg Link ID is required")
    .max(100, "Agg Link ID cannot exceed 100 characters"),

  physical_capacity: Yup.number()
    .typeError("Physical Capacity must be a number")
    .required("Physical Capacity is required")
    .positive("Physical Capacity must be greater than zero"),

  port_sfp_details: Yup.string()
  .trim()
  .max(500, "Port/SFP details cannot exceed 500 characters")
  .required("Port/SFP Details is required"),

  remarks: Yup.string()
    .trim()
    .max(1000, "Remarks cannot exceed 1000 characters")
    .required("Remarks is required"),

});

