// src/components/rate/RateForm.jsx
import React, { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft } from "lucide-react";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField"; // reusable select
import DateField from "../fields/DateField";
import { rateValidation } from "../../validations/rateValidation";
import { fetchNTTNs } from "../../services/nttn";
import { fetchBandwidthRangesByNttnID } from "../../services/bandwidthRanges";


/* ---------- section wrapper (identical to other forms) ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

const RateForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const [nttns, setNttns] = useState([]);
  const [bws, setBws] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- formik ---------- */
  const formik = useFormik({
    initialValues: {
      id: isEditMode ? initialValues.id : "",
      nttn_id: initialValues.nttn_id || "",
      bw_id: initialValues.bw_id || initialValues.bw || "",
      rate: initialValues.rate || "",
      effective_from: initialValues.effective_from || "",
      effective_to: initialValues.effective_to || "",
      continue: initialValues.continue || false,
      status: initialValues.status || 1,
    },
    validationSchema: rateValidation,
    enableReinitialize: true,
    onSubmit,
  });

  /* ---------- bootstrap nttn + cascading bw ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const nttnData = await fetchNTTNs();
        setNttns(nttnData);

        // if editing, load bw for pre-selected nttn
        if (isEditMode && formik.values.nttn_id) {
          const bwData = await fetchBandwidthRangesByNttnID(formik.values.nttn_id);
          setBws(bwData);
        }
      } catch (e) {
        showToast?.(e.message || "Failed to load form data", "error");
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [isEditMode, formik.values.nttn_id, showToast]);

  const handleNttnChange = async (v) => {
    formik.setFieldValue("nttn_id", v);
    formik.setFieldValue("bw_id", ""); // reset
    if (!v) return setBws([]);
    try {
      const bwData = await fetchBandwidthRangesByNttnID(v);
      setBws(bwData);
    } catch {
      setBws([]);
    }
  };

  /* ---------- render ---------- */
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
              {isEditMode ? "Edit Rate" : "Add Rate"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? "update" : "add a new"} rate record.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <FormSection title="Basic Info">
          {isEditMode && (
            <InputField
              name="id"
              label="Rate ID"
              type="number"
              disabled
            />
          )}
          <SelectField
            name="nttn_id"
            placeholder="NTTN *"
            options={nttns.map((n) => ({ value: n.id, label: n.nttn_name }))}
            onChange={(v) => {
              console.log("🔥 onChange fired with", v);   // ← log here
              handleNttnChange(v);
            }}
            searchable
          />
          <SelectField
            name="bw_id"
            placeholder="Bandwidth Range *"
            options={bws.map((b) => ({ value: b.id, label: `${b.range_from}-${b.range_to} Mbps` }))}
            onChange={(v) => formik.setFieldValue("bw_id", v)}
            searchable
            disabled={!formik.values.nttn_id}
          />
          <InputField
            name="rate"
            label="Rate (Tk/Mbps) *"
            type="number"
            step="0.01"
            placeholder="Enter rate"
          />
        </FormSection>

        {/* Date & Status */}
        <FormSection title="Validity & Status">
          <DateField
            name="effective_from"
            label="Effective From"
            placeholder="test"
            value={formik.values.effective_from}
            onChange={(v) => formik.setFieldValue("effective_from", v)}
            range={false}
          />
          <DateField
            name="effective_to"
            label="Effective To"
            value={formik.values.effective_to}
            onChange={(v) => formik.setFieldValue("effective_to", v)}
            range={false}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="continue"
              checked={formik.values.continue}
              onChange={formik.handleChange}
              className="checkbox checkbox-sm"
            />
            <label className="text-sm font-medium text-gray-700">Continue</label>
          </div>
          <SelectField
            name="status"
            placeholder="Status"
            options={[
              { value: 1, label: "Active" },
              { value: 0, label: "Inactive" },
            ]}
            onChange={(v) => formik.setFieldValue("status", v)}
          />
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
    </FormikProvider>
  );
};

export default RateForm;