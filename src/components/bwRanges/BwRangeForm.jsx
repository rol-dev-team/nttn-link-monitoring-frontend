// src/components/bwRanges/BwRangeForm.jsx
import React, { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft } from "lucide-react";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { bandwidthRangeValidation } from "../../validations/bandwidthRangeValidation";
import { fetchNTTNs } from "../../services/nttn";

/* ---------- section wrapper (identical to other forms) ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

const BwRangeForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const [nttns, setNttns] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- bootstrap ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const data = await fetchNTTNs();
        setNttns(data);
      } catch (e) {
        showToast?.(e.message || "Failed to load NTTNs", "error");
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- formik ---------- */
  const formik = useFormik({
    initialValues: {
      nttn_id: initialValues.nttn_id || "",
      range_from: initialValues.range_from || "",
      range_to: initialValues.range_to || "",
      price: initialValues.price || "",
    },
    validationSchema: bandwidthRangeValidation,
    enableReinitialize: true,
    onSubmit,
  });

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading form data...</span>
      </div>
    );
  }

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
              {isEditMode ? "Edit Bandwidth Range" : "Add Bandwidth Range"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? "update" : "add a new"} bandwidth-range record.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <FormSection title="Bandwidth Range Information">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6">
            <SelectField
              name="nttn_id"
              label="NTTN *"
              options={nttns.map((n) => ({ value: n.id, label: n.nttn_name }))}
              onChange={(v) => formik.setFieldValue("nttn_id", v)}
              searchable
            />
            <InputField
              name="range_from"
              label="Range From (Mbps) *"
              placeholder="e.g. 10"
            />
            <InputField
              name="range_to"
              label="Range To (Mbps) *"
              placeholder="e.g. 100"
            />
            {/* <InputField
              name="price"
              label="Price (Tk) *"
              type="number"
              step="0.01"
              placeholder="Enter price"
            /> */}
          </div>
        </FormSection>

        {/* Actions – identical bar */}
        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" intent="submit" loading={formik.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </FormikProvider >
  );
};

export default BwRangeForm;