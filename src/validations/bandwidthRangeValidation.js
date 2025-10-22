import * as Yup from 'yup';

export const bandwidthRangeValidation = Yup.object().shape({
  nttn_id: Yup.number()
    .required('NTTN is required')
    .positive('NTTN ID must be positive'),

  range_from: Yup.number()
    .required('Range From date is required'),

  range_to: Yup.number()
    .required('Range required')
    .when('range_from', (range_from, schema) => {
      if (range_from) {
        return schema.min(range_from, 'Range To must be after Range From');
      }
      return schema;
    }),

  // price: Yup.number()
  //   .required('Price is required')
  //   .positive('Price must be positive')
});