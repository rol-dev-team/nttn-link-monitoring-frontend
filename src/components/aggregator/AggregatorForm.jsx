// // src/components/aggregator/AggregatorForm.jsx
import React, { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft } from "lucide-react";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { AggregatorSchema } from "../../validations/aggregatorValidation";

// Dropdown API
import { fetchSBUs } from "../../services/sbu";
import { fetchAggLandmarks } from "../../services/aggLandmark";
import { fetchNTTNs } from "../../services/nttn";
import { fetchLinkTypes } from "../../services/linkType";

const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">
      {title}
    </legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
      {children}
    </div>
  </fieldset>
);

const AggregatorForm = ({
  initialValues,
  isEditMode,
  onSubmit,
  onCancel,
  showToast,
}) => {
  const [sbuOptions, setSbuOptions] = useState([]);
  const [landmarkOptions, setLandmarkOptions] = useState([]);
  const [nttnOptions, setNttnOptions] = useState([]);
  const [linkTypeOptions, setLinkTypeOptions] = useState([]);

  /* ---------------- FETCH DROPDOWNS ---------------- */
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sbuRes, landmarkRes, nttnRes, linkTypeRes] =
          await Promise.all([
            fetchSBUs(),
            fetchAggLandmarks(),
            fetchNTTNs(),
            fetchLinkTypes(),
          ]);

        /* ✅ Standard API pattern: response.data.data */

        const sbuArray = sbuRes?.data || [];
        console.log('sbuArray: ', sbuArray);
        const landmarkArray = landmarkRes?.data || [];
        console.log('landmarkArray: ', landmarkArray);
        const nttnArray = nttnRes?.data || [];
        console.log('nttnArray: ', nttnArray);
        const linkTypeArray = linkTypeRes?.data || [];
        console.log('linkTypeArray: ', linkTypeArray);

        setSbuOptions(
          sbuArray.map((s) => ({
            value: s.id,
            label: s.sbu_name,
          }))
        );

        setLandmarkOptions(
          landmarkArray.map((l) => ({
            value: l.id,
            label: l.landmark_name,
          }))
        );

        setNttnOptions(
          nttnArray.map((n) => ({
            value: n.id,
            label: n.nttn_name,
          }))
        );

        setLinkTypeOptions(
          linkTypeArray.map((lt) => ({
            value: lt.id,
            label: lt.type_name,
          }))
        );
      } catch (error) {
        console.error("Dropdown fetch failed:", error);
        showToast?.("Failed to load dropdowns", "error");
      }
    };

    fetchOptions();
  }, [showToast]);

  /* ---------------- FORMIK ---------------- */

  const formik = useFormik({
    initialValues: {
      aggregator_name: initialValues?.aggregator_name || "",
      address: initialValues?.address || "",
      sbu_id: initialValues?.sbu_id || "",
      aggr_landmark_id: initialValues?.aggr_landmark_id || "",
      nttn_id: initialValues?.nttn_id || "",
      link_type_id: initialValues?.link_type_id || "",
      agg_link_id: initialValues?.agg_link_id || "",
      physical_capacity: initialValues?.physical_capacity || "",
      port_sfp_details: initialValues?.port_sfp_details || "",
      remarks: initialValues?.remarks || "",
    },
    validationSchema: AggregatorSchema,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <FormikProvider value={formik}>
      <form
        className="p-8 bg-gray-100 min-h-screen space-y-6"
        onSubmit={formik.handleSubmit}
      >
        {/* ---------------- HEADER ---------------- */}
        <div className="flex items-center space-x-3 mb-6 md:mb-8">
          <Button variant="icon" type="button" onClick={onCancel}>
            <ArrowLeft size={24} />
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Aggregator" : "Add Aggregator"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to{" "}
              {isEditMode ? "update" : "add a new"} aggregator record.
            </p>
          </div>
        </div>

        {/* ---------------- FORM SECTION ---------------- */}
        <FormSection title="Aggregator Information">

          {/* TEXT FIELDS */}
          <InputField
            name="aggregator_name"
            label="Aggregator Name *"
            placeholder="Enter aggregator name"
          />

          <InputField
            name="address"
            label="Address *"
            placeholder="Enter address"
            type="textarea"
            rows={3}
          />

          {/* DROPDOWNS */}
          <SelectField
            name="sbu_id"
            label="SBU *"
            // placeholder="Select SBU"
            options={sbuOptions}
            searchable
            floating
          />

          <SelectField
            name="aggr_landmark_id"
            label="Landmark *"
            // placeholder="Select Landmark"
            options={landmarkOptions}
            searchable
            floating
          />

          <SelectField
            name="nttn_id"
            label="NTTN *"
            // placeholder="Select NTTN"
            options={nttnOptions}
            searchable
            floating
          />

          <SelectField
            name="link_type_id"
            label="Link Type *"
            // placeholder="Select Link Type"
            options={linkTypeOptions}
            searchable
            floating
          />

          {/* OTHER FIELDS */}
          <InputField
            name="agg_link_id"
            label="Agg Link ID *"
            placeholder="Enter aggregator link ID"
          />

          <InputField
            name="physical_capacity"
            label="Physical Capacity (Gbps) *"
            placeholder="Enter capacity"
            type="number"
            step="0.01"
          />

          <InputField
            name="port_sfp_details"
            label="Port/SFP Details"
            placeholder="Enter port/SFP details"
          />

          <InputField
            name="remarks"
            label="Remarks"
            placeholder="Enter remarks"
            type="textarea"
            rows={5}
            style={{ minHeight: '120px', height: 'auto' }} // Adjust px as needed
          />
        </FormSection>

        {/* ---------------- ACTION BUTTONS ---------------- */}
        <div className="flex w-full justify-end mt-8 space-x-3">
          <Button intent="cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>

          <Button type="submit" intent="submit">
            {isEditMode ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default AggregatorForm;

