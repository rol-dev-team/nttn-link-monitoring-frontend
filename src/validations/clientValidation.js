// src/validations/clientValidation.js
import * as Yup from "yup";

export const clientValidation = Yup.object().shape({
    client_name: Yup.string()
        .trim()
        .required("Client name is required")
        .max(255, "Too long"),

    sbu_id: Yup.string()
        .nullable()
        .required("SBU is required")
        .max(100, "Too long"),

    // add the rest so the whole form is valid
    cat_id: Yup.string().nullable().required("Category is required"),
    division_id: Yup.string().nullable().required("Division is required"),
    district_id: Yup.string().nullable().required("District is required"),
    thana_id: Yup.string().nullable().required("Thana is required"),
    address: Yup.string().nullable(),
});