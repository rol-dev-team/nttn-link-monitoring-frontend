import * as Yup from "yup";

export const LinkTypeSchema = Yup.object().shape({
  type_name: Yup.string().required("Link type is required"),
});
