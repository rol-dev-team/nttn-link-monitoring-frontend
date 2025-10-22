// src/components/link-type/LinkTypeForm.jsx
import React from "react";
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft } from "lucide-react";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import { LinkTypeSchema } from "../../validations/linkTypeValidation";

/* ---------- section wrapper (identical to other forms) ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

const LinkTypeForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const formik = useFormik({
    initialValues,
    validationSchema: LinkTypeSchema,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-gray-100 min-h-screen space-y-6"
      >
        {/* header – identical to other forms */}
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Link Type" : "Add Link Type"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? "update" : "add a new"} link-type record.
            </p>
          </div>
        </div>

        {/* Single section – same grid */}
        <FormSection title="Link Type Information">
          <InputField
            name="type_name"
            label="Link Type Name *"
            placeholder="Enter link-type name"
          />
        </FormSection>

        {/* Actions – identical bar */}
        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" intent="submit">
            Save
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default LinkTypeForm;