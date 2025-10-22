import * as Yup from "yup";

export const bwModifyValidationSchema = [
  // Step 1: Basic Info & NTTN Details
  Yup.object({
    modificationType: Yup.string().required("Required"),
    modificationDate: Yup.date().required("Required"),
    sbu: Yup.string().required("Required"),
    aggregator: Yup.string().required("Required"),
    linkType: Yup.string().required("Required"),
    linkId: Yup.string().required("Required"),
    nttnName: Yup.string().required("Required"),
    nttnProviderId: Yup.string().required("Required"),
  }),

  // Step 2: (placeholder – add your fields & rules here)
  Yup.object({}),

  // Step 3: (placeholder – add your fields & rules here)
  Yup.object({}),
];
