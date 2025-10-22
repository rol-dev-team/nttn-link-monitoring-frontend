import * as Yup from "yup";

export const KamSchema = Yup.object().shape({
  kam_name: Yup.string().required("Kam is required"),
});
