import * as Yup from 'yup';

export const BWModificationSchema = Yup.object().shape({
  nttn_provider: Yup.number()
    .required('NTTN Provider is required')
    .positive('Must be a positive number')
    .integer('Must be an integer'),
  modification_type: Yup.string()
    .required('Modification type is required'),
  // client_category: Yup.number()
  //   .required('Client Category is required')
  //   .positive('Must be a positive number')
  //   .integer('Must be an integer'),
  // client: Yup.number()
  //   .required('Client is required')
  //   .positive('Must be a positive number')
  //   .integer('Must be an integer'),
  // nttn_link_id: Yup.string()
  //   .required('NTTN Link ID is required'),
  // capacity: Yup.number()
  //   .required('Current Capacity is required')
  //   .positive('Must be a positive number'),
  // capacity_cost: Yup.number()
  //   .required('Current Capacity Cost is required')
  //   .positive('Must be a positive number'),
  // shifting_bw: Yup.number()
  //   .required('New BW is required')
  //   .positive('Must be a positive number'),
  // shifting_capacity: Yup.number()
  //   .required('Shifting Amount is required')
  //   .positive('Must be a positive number'),
  // shifting_unit_cost: Yup.number()
  //   .required('Unit Cost is required')
  //   .positive('Must be a positive number'),
  // workorder: Yup.number()
  //   .required('Work Order is required')
  //   .positive('Must be a positive number')
  //   .integer('Must be an integer'),
});