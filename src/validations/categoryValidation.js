import * as Yup from "yup";

export const CategorySchema = Yup.object().shape({
    cat_name: Yup.string()
        .trim()
        .required("Client name is required")
        .max(255, "Too long"),
    sbu_id: Yup.string()
        .trim()
        .required("SBU is required")
        .max(100, "Too long"),
});