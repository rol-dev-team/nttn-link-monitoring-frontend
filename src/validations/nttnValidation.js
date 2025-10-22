import * as Yup from "yup";

export const NTTNSchema = Yup.object().shape({
  nttn_name: Yup.string().required("NTTN is required"),
  address: Yup.string().required("Address is required"),
});
