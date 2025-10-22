import * as Yup from "yup";

export const AggregatorSchema = Yup.object().shape({
  aggregator_name: Yup.string().required("Aggregator is required"),
  address: Yup.string().required("Address is required"),
});
