import * as Yup from "yup";

export const surveySchema = Yup.object({
  sbu_id: Yup.string().required("Please select an SBU"),
  link_type_id: Yup.string().required("Please select a Link Type"),
  aggregator_id: Yup.string().required("Please select an Aggregator"),
  kam_id: Yup.string().required("Please select a KAM"),
  nttn_id: Yup.string().required("Please select an NTTN Name"),
  nttn_survey_id: Yup.string().required("Please provide Provider ID"),
  // nttn_lat: Yup.string().required("NTTN latitude is required"),
  // nttn_long: Yup.string().required("NTTN longitude is required"),

  cat_id: Yup.string().required("Please select a Client Category"),
  client_id: Yup.string().required("Please select a Client Name"),
  // client_lat: Yup.string().required("Client latitude is required"),
  // client_long: Yup.string().required("Client longitude is required"),
  // mac_user: Yup.string().required("MAC User count is required"),
  submition: Yup.string().required("Submission Date is required"),
});
