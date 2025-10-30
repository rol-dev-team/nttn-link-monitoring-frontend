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
import DatePickerField from './../fields/DatePickerField';


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
  const [loading, setLoading] = useState(false);

  /* ---------- formik ---------- */

  const formik = useFormik({
    initialValues: {
      // id: isEditMode ? initialValues.id : "",
      nttn_id: initialValues.nttn_id || "",
      bw_range_from: initialValues.bw_range_from || initialValues.bw_range_from || "",
      bw_range_to: initialValues.bw_range_to || initialValues.bw_range_to || "",
      rate: initialValues.rate || "",
      start_date: initialValues.start_date || "",
      end_date: initialValues.end_date || "",
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
        // if (isEditMode && formik.values.nttn_id) {
        //   const bwData = await fetchBandwidthRangesByNttnID(formik.values.nttn_id);
        //   setBws(bwData);
        // }
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
            placeholder="NTTN Name *"
            options={nttns.map((n) => ({ value: n.id, label: n.nttn_name }))}
            onChange={(v) => {
              console.log("🔥 onChange fired with", v);   
              handleNttnChange(v);
            }}
            searchable
          />
          <InputField
            name="bw_range_from"
            label="BW Range From *"
            type="number"
            step="0.01"
            placeholder="BW Range From"
          />
          <InputField
            name="bw_range_to"
            label="BW Range To *"
            type="number"
            step="0.01"
            placeholder="BW Range To"
          />
          <InputField
            name="rate"
            label="Rate (Tk/Mbps) *"
            type="number"
            step="0.01"
            placeholder="Enter rate"
          />
        </FormSection>

          <DatePickerField
                name='start_date'
                placeholder='Start Date'
                field={{ name: "start_date", value: formik.values.start_date }}
                form={formik}
              />
          <DatePickerField
                name='end_date'
                placeholder='End Date'
                field={{ name: "end_date", value: formik.values.end_date }}
                form={formik}
              />


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