import * as Yup from "yup";

export const reasonSchema = Yup.object().shape({
  reason: Yup.string().required("Reason is required"),
});
