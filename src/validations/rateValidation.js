import * as Yup from 'yup';

export const rateValidation = Yup.object().shape({
  //   rate_id: Yup.number()
  //     .required('Rate ID is required')
  //     .positive('Rate ID must be positive')
  //     .integer('Rate ID must be an integer'),

  nttn_id: Yup.number()
    .required('NTN ID is required')
    .positive('NTN ID must be positive')
    .integer('NTN ID must be an integer'),

  bw_id: Yup.number()
    .required('BW ID is required')
    .positive('BW ID must be positive')
    .integer('BW ID must be an integer'),

  rate: Yup.number()
    .required('Rate is required')
    .positive('Rate must be positive'),

  // effective_from: Yup.date()
  //   .nullable()
  //   .typeError('Please enter a valid date')
  //   .required('Effective From date is required'),

  // effective_to: Yup.date()
  //   .nullable()
  //   .typeError('Please enter a valid date')
  //   .when('effective_from', (effective_from, schema) => {
  //     if (effective_from) {
  //       return schema.min(effective_from, 'Effective To must be after Effective From');
  //     }
  //     return schema;
  //   }),

  continue: Yup.boolean(),

  status: Yup.number()
    .oneOf([0, 1], "Status must be either 0 (Inactive) or 1 (Active)")
    .required('Status is required')
});