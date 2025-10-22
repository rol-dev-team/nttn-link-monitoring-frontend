import * as Yup from "yup";

export const SbuSchema = Yup.object().shape({
  sbu_name: Yup.string().required("SBU is required"),
});
