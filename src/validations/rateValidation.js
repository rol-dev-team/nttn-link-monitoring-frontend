import * as Yup from 'yup';

export const rateValidation = Yup.object().shape({
  nttn_id: Yup.number()
    .typeError('NTTN ID must be a number')
    .required('NTTN ID is required')
    .integer('NTTN ID must be an integer')
    .positive('NTTN ID must be positive'),

  bw_range_from: Yup.number()
    .typeError('Bandwidth From must be a number')
    .required('Bandwidth From is required')
    .integer('Bandwidth From must be an integer')
    .positive('Bandwidth From must be positive'),

  bw_range_to: Yup.number()
    .typeError('Bandwidth To must be a number')
    .required('Bandwidth To is required')
    .integer('Bandwidth To must be an integer')
    .positive('Bandwidth To must be positive')
    .moreThan(Yup.ref('bw_range_from'), 'Bandwidth To must be greater than Bandwidth From'),

  rate: Yup.number()
    .typeError('Rate must be a number')
    .required('Rate is required')
    .positive('Rate must be positive'),

  start_date: Yup.date()
    .typeError('Start Date must be a valid date')
    .required('Start Date is required'),

  end_date: Yup.date()
    .nullable()
    .typeError('End Date must be a valid date')
    .min(Yup.ref('start_date'), 'End Date cannot be before Start Date'),
});
