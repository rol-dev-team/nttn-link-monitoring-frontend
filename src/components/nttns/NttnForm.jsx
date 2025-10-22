import { useFormik, FormikProvider } from "formik";
import { ArrowLeft } from "lucide-react";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import { NTTNSchema } from "../../validations/nttnValidation";

const NttnForm = ({ initialValues, isEditMode, onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues,
    validationSchema: NTTNSchema,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-3 mb-6">
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit NTTN" : "Add NTTN"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? "update" : "add a new"} NTTN record.
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="nttn_name"
            label="NTTN Name *"
            value={formik.values.nttn_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nttn_name && formik.errors.nttn_name}
          />

          <InputField
            name="address"
            label="Address"
            type="textarea"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && formik.errors.address}
            rows={4}
          />
        </div>

        {/* Action buttons */}
        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button intent="submit" type="submit" disabled={!formik.isValid}>
            Save
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default NttnForm;
