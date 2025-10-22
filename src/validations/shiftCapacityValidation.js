import * as Yup from 'yup';

export const shiftCapacitySchema = Yup.object().shape({
  nttn_provider: Yup.number()
    .required('NTTN Provider is required')
    .positive('NTTN Provider must be selected'),

  client_category: Yup.number()
    .required('Client Category is required')
    .positive('Client Category must be selected'),

  client: Yup.number()
    .required('Client is required')
    .positive('Client must be selected'),

  shifting_client_category: Yup.number()
    .required('Shifting Client Category is required')
    .positive('Shifting Client Category must be selected'),

  shifting_client: Yup.number()
    .required('Shifting Client is required')
    .positive('Shifting Client must be selected'),

  nttn_link_id: Yup.string()
    .required('NTTN Link ID is required'),

  capacity: Yup.number()
    .required('Capacity is required')
    .min(0, 'Capacity cannot be negative'),

  capacity_cost: Yup.number()
    .min(0, 'Capacity cost cannot be negative'),

  shifting_bw: Yup.number()
    .required('Shifting BW is required')
    .positive('Shifting BW must be positive')
    .test(
      'is-less-than-capacity',
      'Shifting BW cannot be greater than Capacity',
      function (value) {
        const { capacity } = this.parent;
        return value <= capacity;
      }
    ),

  after_shifting_capacity: Yup.number()
    .min(0, 'After shifting capacity cannot be negative'),

  shifting_capacity: Yup.number()
    .min(0, 'Shifting capacity cannot be negative'),

  shifting_unit_cost: Yup.number()
    .min(0, 'Shifting unit cost cannot be negative'),

  total_shifting_cost: Yup.number()
    .required('Total shifting cost is required')
    .min(0, 'Total shifting cost cannot be negative'),

  workorder_id: Yup.number()
    .required('WorkOrder ID is required')
    .positive('WorkOrder ID must be positive'),

  vlan: Yup.string()
    .nullable()
    .max(100, 'VLAN must be less than 100 characters'),
});