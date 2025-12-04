// import * as Yup from "yup";

// export const workOrderValidationSchema = [
//   // Step 1: Basic Info & NTTN Details
//   Yup.object({
//     sbu: Yup.string().required("Required"),
//     aggregator: Yup.string().required("Required"),
//     linkType: Yup.string().required("Required"),
//     linkId: Yup.string().required("Required"),
//     nttnName: Yup.string().required("Required"),
//     nttnProviderId: Yup.string().required("Required"),
//     nttnLat: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     nttnLong: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//   }),

//   // Step 2: Client Details
//   Yup.object({
//     clientCategory: Yup.string().required("Required"),
//     clientName: Yup.string().required("Required"),
//     division: Yup.string().required("Required"),
//     district: Yup.string().required("Required"),
//     thana: Yup.string().required("Required"),
//     kam: Yup.string().required("Required"),
//     clientLat: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     clientLong: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     address: Yup.string().required("Required"),
//     macUser: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//   }),

//   // Step 3: Capacity Details & Delivery Timeline
//   Yup.object({
//     unitRate: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     requestCapacity: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     totalCost: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     shiftCapacity: Yup.boolean(),
//     clientCategory3: Yup.string().required("Required"),
//     correspondingClient: Yup.string().required("Required"),
//     currentCapacity: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     shiftingCapacity: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     netCapacity: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     currentPrice: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     shiftingPrice: Yup.number()
//       .typeError("Must be a number")
//       .required("Required"),
//     vlan: Yup.string().required("Required"),
//     remarks: Yup.string(),
//     submissionDate: Yup.date().required("Required"),
//     serviceHandoverDate: Yup.date().required("Required"),
//     requestedDeliveryDate: Yup.date().required("Required"),
//   }),
// ];



import * as Yup from "yup";

export const workOrderValidationSchema = Yup.object({
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
  submission: Yup.string().required("Submission Date is required"),
});