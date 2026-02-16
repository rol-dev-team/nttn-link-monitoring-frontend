import React, { useEffect } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../fields/InputField';
import * as Yup from 'yup';

const DEFAULT_VALUES = { landmark_name: '' };

const AggLandmarkValidation = Yup.object().shape({
  landmark_name: Yup.string().required('Landmark name is required'),
});

const AggLandmarkForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const formik = useFormik({
    initialValues: { ...DEFAULT_VALUES, ...initialValues },
    validationSchema: AggLandmarkValidation,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        await onSubmit(values, helpers);
      } catch (e) {
        console.error('AggLandmarkForm onSubmit error:', e);
        showToast?.(e?.message || 'Save failed', 'error');
      }
    },
  });

  useEffect(() => {
    window._aggLandmarkFormik = formik;
  }, [formik]);

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
        <div className="flex items-center space-x-3 mb-6 md:mb-8">
          <Button
            variant="icon"
            type="button"
            onClick={onCancel}
            title="Go Back"
            className="p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit Agg Landmark' : 'Add Agg Landmark'}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? 'update' : 'add a new'} landmark.
            </p>
          </div>
        </div>

        <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
          <legend className="px-2 text-xl font-semibold text-gray-900">Landmark Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
            <InputField
              name="landmark_name"
              label="Landmark Name"
              placeholder="Enter landmark name"
              required
            />
          </div>
        </fieldset>

        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            intent="submit"
            loading={formik.isSubmitting}
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {isEditMode ? 'Update Landmark' : 'Create Landmark'}
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default AggLandmarkForm;
