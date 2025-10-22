
import React, { useState, useEffect } from "react";
import { useFormik, FormikProvider } from "formik";
import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import DateField from "../fields/DateField";
import {
  ArrowLeft,
  MapPin,
  Building,
  Pin,
  Globe,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { fetchSBUs } from "../../services/sbu";
import { fetchLinkTypes } from "../../services/linkType";
import { fetchAggregators } from "../../services/aggregator";
import { fetchKams } from "../../services/kam";
import { fetchNTTNs } from "../../services/nttn";
import { fetchSurveysByClient } from "../../services/survey";
import {
  fetchClientsCategoryWise,
  fetchCategoriesBySBU,
} from "../../services/client";
import { surveySchema } from "../../validations/surveyValidation";
import { showToast } from "../constants/message";
import { fetchRatesByID } from "../../services/rate";
import { fetchBandwidthRangesByID } from "../../services/bandwidthRanges";
import { format, isValid, parseISO } from "date-fns";

const FormSection = ({ title, icon: Icon, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900 flex items-center">
      {Icon && <Icon size={24} className="mr-2 text-gray-500" />}
      {title}
    </legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
      {children}
    </div>
  </fieldset>
);

const WorkOrderForm = ({ initialValues, isEditMode, onSubmit, onCancel }) => {
  const [sbuOptions, setSbuOptions] = useState([]);
  const [linkTypeOptions, setLinkTypeOptions] = useState([]);
  const [aggregatorOptions, setAggregatorOptions] = useState([]);
  const [kamOptions, setKamOptions] = useState([]);
  const [nttnOptions, setNttnOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [surveyOptions, setSurveyOptions] = useState([]);
  const [bandwidthRanges, setBandwidthRanges] = useState([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [surveyLocked, setSurveyLocked] = useState({});

  const defaultFormValues = {
    type_id: 2,
    survey_id: null,
    sbu_id: null,
    link_type_id: null,
    nttn_link_id: "",
    aggregator_id: null,
    kam_id: null,
    nttn_id: null,
    nttn_survey_id: "",
    nttn_lat: "",
    nttn_long: "",
    cat_id: null,
    client_id: null,
    client_lat: "",
    client_long: "",
    mac_user: "",
    submition: "",
    division: "",
    district: "",
    thana: "",
    address: "",
    request_capacity: "",
    total_cost_of_request_capacity: "",
    shift_capacity: false,
    shifting_capacity: "",
    shifting_capacity_price: "",
    net_capacity: "",
    unit_rate: "",
    vlan: "",
    remarks: "",
    status: "Active",
    requested_delivery: "",
    service_handover: "",
  };

  const formik = useFormik({
    initialValues: { ...defaultFormValues, ...initialValues },
    validationSchema: surveySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      console.log('🚀 FORM SUBMIT STARTED', values);
      setIsSubmitting(true);
      try {
        const payload = { ...values };

        const numericFields = [
          "request_capacity",
          "unit_rate",
          "total_cost_of_request_capacity",
          "shifting_capacity",
          "shifting_capacity_price",
          "net_capacity",
          "mac_user",
          "vlan",
          "sbu_id",
          "link_type_id",
          "aggregator_id",
          "kam_id",
          "nttn_id",
          "cat_id",
          "client_id",
          "nttn_lat",
          "nttn_long",
          "client_lat",
          "client_long",
          "survey_id",
        ];

        numericFields.forEach((field) => {
          if (payload[field] === "") {
            payload[field] = null;
          }
        });

        const dateFields = [
          "submition",
          "requested_delivery",
          "service_handover",
        ];
        dateFields.forEach((field) => {
          if (payload[field]) {
            try {
              const dateObj =
                typeof payload[field] === "string"
                  ? parseISO(payload[field])
                  : payload[field];
              if (isValid(dateObj)) {
                payload[field] = format(dateObj, "yyyy-MM-dd");
              } else {
                payload[field] = null;
              }
            } catch (e) {
              console.error(`Error formatting date field ${field}:`, e);
              payload[field] = null;
            }
          } else {
            payload[field] = null;
          }
        });
        const statusValue = payload.status;          // read first
        delete payload.status;
        payload.survey_status = payload.status;
        payload.workorder_status = payload.status;
        // delete payload.status;

        await onSubmit(payload, { resetForm });
      } catch (error) {
        console.error('💥 FORM SUBMIT FAILED', error);
        showToast.error(error?.response?.data?.message || "Save failed!");
      } finally {
        setIsSubmitting(false);
      }
    },
  });


  // Step 1: Load all static data on component mount (runs once)
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [sbuRes, linkTypeRes, aggregatorRes, kamRes, nttnRes] =
          await Promise.all([
            fetchSBUs(),
            fetchLinkTypes(),
            fetchAggregators(),
            fetchKams(),
            fetchNTTNs(),
          ]);

        setSbuOptions(
          sbuRes.map((item) => ({ value: item.id, label: item.sbu_name }))
        );
        setLinkTypeOptions(
          linkTypeRes.map((item) => ({ value: item.id, label: item.type_name }))
        );
        setAggregatorOptions(
          aggregatorRes.map((item) => ({
            value: item.id,
            label: item.aggregator_name,
          }))
        );
        setKamOptions(
          kamRes.map((item) => ({ value: item.id, label: item.kam_name }))
        );
        setNttnOptions(
          nttnRes.map((item) => ({ value: item.id, label: item.nttn_name }))
        );
        setIsFormLoaded(true);
      } catch (err) {
        showToast.error(
          err?.response?.data?.message ||
          "Failed to load static data for survey form!"
        );
      }
    };
    loadStaticData();
  }, []);

  // Step 2: Unified Initialization for Edit Mode (runs once after static data is loaded)
  useEffect(() => {
    const initializeEditMode = async () => {
      if (!isEditMode || !isFormLoaded || !initialValues.sbu_id) {
        return;
      }

      try {
        // Step A: Load categories for the initial SBU
        const categoriesRes = await fetchCategoriesBySBU(initialValues.sbu_id);
        const mappedCategories = categoriesRes.map((item) => ({
          value: item.id,
          label: item.cat_name,
        }));
        setCategoryOptions(mappedCategories);

        // Step B: Use category name to find and set the category ID
        const category = mappedCategories.find(
          (cat) => cat.label === initialValues.client_category
        );
        if (category) {
          formik.setFieldValue("cat_id", category.value);

          // Step C: Load clients based on the found category ID
          const clientsRes = await fetchClientsCategoryWise(category.value);
          const mappedClients = clientsRes.map((c) => ({
            value: c.id,
            label: c.client_name,
            division: c.division_name || "N/A",
            district: c.district_name || "N/A",
            thana: c.thana_name || "N/A",
            address: c.address || "",
            client_lat: c.client_lat || "",
            client_long: c.client_long || "",
          }));
          setClientOptions(mappedClients);

          // Step D: Find the client and populate location fields
          const client = mappedClients.find(
            (c) => c.value === initialValues.client_id
          );
          if (client) {
            ["division", "district", "thana", "address", "client_lat", "client_long"].forEach((f) =>
              formik.setFieldValue(f, client[f] || "")
            );
          }

          // Step E: Load surveys for the client
          const surveysRes = await fetchSurveysByClient(initialValues.client_id);
          const mappedSurveys = surveysRes.map((s) => ({
            value: s.id,
            label: s.nttn_survey_id,
            _raw: s,
          }));
          setSurveyOptions(mappedSurveys);

          // Step F: Find the survey and populate fields from it
          const survey = mappedSurveys.find((s) => s.value === initialValues.survey_id)?._raw;
          if (survey) {
            const fields = ["link_type_id", "nttn_link_id", "client_lat", "client_long", "aggregator_id", "kam_id"];
            const lockedFields = {};
            fields.forEach((f) => {
              if (survey[f] !== null && survey[f] !== undefined && survey[f] !== '') {
                formik.setFieldValue(f, survey[f]);
                lockedFields[f] = true;
              }
            });
            setSurveyLocked(lockedFields);
          }
        }

        // ⚡️ NEW: Trigger rate calculation after all other data is loaded
        if (initialValues.nttn_id && initialValues.request_capacity) {
          setIsLoadingRates(true);
          try {
            const requestCapacity = parseInt(initialValues.request_capacity);
            const ranges = await fetchBandwidthRangesByID(initialValues.nttn_id);

            const matchingRange = ranges.find((range) => {
              const rangeFrom = parseInt(range.range_from);
              const rangeTo = parseInt(range.range_to);
              return requestCapacity >= rangeFrom && requestCapacity <= rangeTo;
            });

            if (matchingRange) {
              const rates = await fetchRatesByID(initialValues.nttn_id, matchingRange.id);
              const activeRate = rates.find(
                (rate) =>
                  rate.continue_field &&
                  rate.status === 1 &&
                  new Date(rate.effective_from) <= new Date() &&
                  new Date(rate.effective_to) >= new Date()
              );

              if (activeRate) {
                formik.setFieldValue("unit_rate", activeRate.rate);
              } else {
                formik.setFieldValue("unit_rate", initialValues.unit_rate);
              }
            } else {
              formik.setFieldValue("unit_rate", initialValues.unit_rate);
            }
          } catch (err) {
            console.error("Error fetching rates on initial load:", err);
            showToast.error("Failed to load rate for the existing entry.");
          } finally {
            setIsLoadingRates(false);
          }
        }

      } catch (e) {
        showToast.error("Failed to initialize form data for editing.");
        console.error("Initialization error:", e);
      }
    };
    initializeEditMode();
  }, [isEditMode, initialValues, isFormLoaded]);

  // Step 3: Handle cascading changes based on user interaction directly in the handler
  const handleSelectChange = async (fieldName, selectedValue) => {
    formik.setFieldValue(fieldName, selectedValue);
    formik.setFieldTouched(fieldName, true);

    if (fieldName === "sbu_id") {
      formik.setFieldValue("cat_id", null);
      formik.setFieldValue("client_id", null);
      setCategoryOptions([]);
      setClientOptions([]);
      setSurveyOptions([]);
      if (selectedValue) {
        try {
          const categoriesRes = await fetchCategoriesBySBU(selectedValue);
          setCategoryOptions(
            categoriesRes.map((item) => ({ value: item.id, label: item.cat_name }))
          );
        } catch (err) {
          showToast.error("Failed to load categories for the selected SBU!");
        }
      }
    } else if (fieldName === "cat_id") {
      formik.setFieldValue("client_id", null);
      setClientOptions([]);
      setSurveyOptions([]);
      if (selectedValue) {
        try {
          const clientsRes = await fetchClientsCategoryWise(selectedValue);
          const mapped = clientsRes.map((c) => ({
            value: c.id,
            label: c.client_name,
            division: c.division_name || "N/A",
            district: c.district_name || "N/A",
            thana: c.thana_name || "N/A",
            address: c.address || "",
            client_lat: c.client_lat || "",
            client_long: c.client_long || "",
          }));
          setClientOptions(mapped);
        } catch (err) {
          showToast.error("Failed to load clients for the selected category!");
        }
      }
    } else if (fieldName === "client_id") {
      formik.setFieldValue("division", "");
      formik.setFieldValue("district", "");
      formik.setFieldValue("thana", "");
      formik.setFieldValue("address", "");
      formik.setFieldValue("client_lat", "");
      formik.setFieldValue("client_long", "");
      formik.setFieldValue("survey_id", null);
      setSurveyOptions([]);

      const client = clientOptions.find((c) => c.value === selectedValue);
      if (client) {
        formik.setFieldValue("division", client.division);
        formik.setFieldValue("district", client.district);
        formik.setFieldValue("thana", client.thana);
        formik.setFieldValue("address", client.address);
        formik.setFieldValue("client_lat", client.client_lat);
        formik.setFieldValue("client_long", client.client_long);

        try {
          const surveysRes = await fetchSurveysByClient(selectedValue);
          setSurveyOptions(
            surveysRes.map((s) => ({
              value: s.id,
              label: s.nttn_survey_id,
              _raw: s,
            }))
          );
        } catch (e) {
          showToast.error("Could not load surveys for selected client");
        }
      }
    } else if (fieldName === "survey_id") {
      const survey = surveyOptions.find(
        (o) => o.value === selectedValue
      )?._raw;
      const fields = [
        "link_type_id",
        "nttn_link_id",
        "client_lat",
        "client_long",
        "aggregator_id",
        "kam_id",
      ];
      const lockedFields = {};
      if (survey) {
        fields.forEach((f) => {
          if (survey[f] !== null && survey[f] !== undefined && survey[f] !== '') {
            formik.setFieldValue(f, survey[f]);
            lockedFields[f] = true;
          }
        });
      } else {
        fields.forEach((f) => {
          formik.setFieldValue(f, defaultFormValues[f]);
        });
      }
      setSurveyLocked(lockedFields);
    }
  };

  // Remaining useEffects for rates which are not part of the main cascade
  useEffect(() => {
    const fetchRangesForNttn = async () => {
      if (formik.values.nttn_id) {
        try {
          const ranges = await fetchBandwidthRangesByID(formik.values.nttn_id);
          setBandwidthRanges(ranges);
        } catch (err) {
          showToast.error("Failed to load bandwidth ranges for selected NTTN");
          setBandwidthRanges([]);
        }
      } else {
        setBandwidthRanges([]);
      }
    };
    fetchRangesForNttn();
  }, [formik.values.nttn_id]);

  useEffect(() => {
    const fetchAndSetUnitRate = async () => {
      if (formik.values.nttn_id && formik.values.request_capacity && bandwidthRanges.length > 0) {
        setIsLoadingRates(true);
        try {
          const requestCapacity = parseInt(formik.values.request_capacity);
          const matchingRange = bandwidthRanges.find((range) => {
            const rangeFrom = parseInt(range.range_from);
            const rangeTo = parseInt(range.range_to);
            return requestCapacity >= rangeFrom && requestCapacity <= rangeTo;
          });

          if (matchingRange) {
            const rates = await fetchRatesByID(
              formik.values.nttn_id,
              matchingRange.id
            );
            const activeRate = rates.find(
              (rate) =>
                rate.continue_field &&
                rate.status === 1 &&
                new Date(rate.effective_from) <= new Date() &&
                new Date(rate.effective_to) >= new Date()
            );

            if (activeRate) {
              formik.setFieldValue("unit_rate", activeRate.rate);
            } else {
              formik.setFieldValue("unit_rate", "");
            }
          } else {
            formik.setFieldValue("unit_rate", "");
          }
        } catch (err) {
          console.error("Error fetching rates:", err);
          showToast.error("Failed to load rate for selected capacity");
        } finally {
          setIsLoadingRates(false);
        }
      } else {
        if (formik.values.unit_rate) {
          formik.setFieldValue("unit_rate", "");
        }
      }
    };
    fetchAndSetUnitRate();
  }, [formik.values.nttn_id, formik.values.request_capacity, bandwidthRanges]);

  useEffect(() => {
    if (formik.values.request_capacity && formik.values.unit_rate) {
      const requestCapacity = parseFloat(formik.values.request_capacity);
      const unitRate = parseFloat(formik.values.unit_rate);
      const totalCost = requestCapacity * unitRate;
      formik.setFieldValue(
        "total_cost_of_request_capacity",
        totalCost.toFixed(2)
      );
    } else if (!formik.values.request_capacity || !formik.values.unit_rate) {
      formik.setFieldValue("total_cost_of_request_capacity", "");
    }
  }, [formik.values.request_capacity, formik.values.unit_rate]);

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4 md:mb-8">
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
            {isEditMode ? "Edit Work Order" : "Add Work Order"}
          </h1>
          <p className="text-gray-500">
            Fill in the details to {isEditMode ? "update" : "add a new"} work
            order record.
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <FormSection title="Client Details">
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                name="sbu_id"
                label="SBU"
                options={sbuOptions}
                onChange={(val) => handleSelectChange("sbu_id", val)}
                searchable
              />
              <SelectField
                name="cat_id"
                label="Category"
                options={categoryOptions}
                onChange={(val) => handleSelectChange("cat_id", val)}
                searchable
                isDisabled={!formik.values.sbu_id}
              />
              <SelectField
                name="client_id"
                label="Client Name"
                options={clientOptions}
                onChange={(val) => handleSelectChange("client_id", val)}
                searchable
                isDisabled={!formik.values.cat_id}
              />
            </div>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                name="survey_id"
                label="Select Survey"
                options={surveyOptions}
                onChange={(val) => handleSelectChange("survey_id", val)}
                searchable
                isDisabled={!formik.values.client_id}
              />
              <SelectField
                name="link_type_id"
                label="Link Type"
                options={linkTypeOptions}
                onChange={(val) => handleSelectChange("link_type_id", val)}
                disabled={surveyLocked.link_type_id}
                searchable
              />
              <InputField
                name="nttn_link_id"
                label="Link / SCR"
                type="text"
                disabled={surveyLocked.nttn_link_id}
              />
            </div>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6">
              <InputField
                name="client_lat"
                label="Client Latitude"
                type="text"
                disabled={surveyLocked.client_lat}
              />
              <InputField
                name="client_long"
                label="Client Longitude"
                type="text"
                disabled={surveyLocked.client_long}
              />
              <SelectField
                name="aggregator_id"
                label="Aggregator"
                options={aggregatorOptions}
                onChange={(val) => handleSelectChange("aggregator_id", val)}
                searchable
                disabled={surveyLocked.aggregator_id}
              />
              <SelectField
                name="kam_id"
                label="KAM"
                options={kamOptions}
                onChange={(val) => handleSelectChange("kam_id", val)}
                searchable
                disabled={surveyLocked.kam_id}
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 col-span-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-4 text-sm">
                <h3 className="flex items-center text-sm font-semibold text-gray-700">
                  <MapPin size={16} className="mr-2 text-gray-500" />
                  Client Location Information
                </h3>
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-blue-500" />
                  <p>
                    <strong className="text-gray-800">Division:</strong>{" "}
                    {formik.values.division || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Building size={16} className="text-green-500" />
                  <p>
                    <strong className="text-gray-800">District:</strong>{" "}
                    {formik.values.district || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Pin size={16} className="text-red-500" />
                  <p>
                    <strong className="text-gray-800">Thana:</strong>{" "}
                    {formik.values.thana || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Building size={16} className="text-purple-500" />
                  <p className="truncate">
                    <strong className="text-gray-800">Address:</strong>{" "}
                    {formik.values.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="NTTN Details">
            <SelectField
              name="nttn_id"
              label="NTTN Name"
              options={nttnOptions}
              onChange={(val) => handleSelectChange("nttn_id", val)}
              searchable
            />
            <InputField
              name="nttn_survey_id"
              label="NTTN Provider ID"
              type="text"
            />
            <InputField
              name="nttn_lat"
              label="NTTN Latitude"
              type="text"
            />
            <InputField
              name="nttn_long"
              label="NTTN Longitude"
              type="text"
            />
          </FormSection>

          <FormSection title="Capacity and Cost">
            <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                name="request_capacity"
                type="number"
                label="Requested Capacity (Mbps)"
              />
              <InputField
                name="unit_rate"
                type="number"
                step="0.01"
                label="Unit Rate"
                disabled={isLoadingRates}
                help={isLoadingRates ? "Loading rate..." : null}
              />
              <InputField
                name="total_cost_of_request_capacity"
                type="number"
                label="Total Cost of Requested Capacity"
                readOnly
              />
            </div>
          </FormSection>

          <FormSection title="Additional Details">
            <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6">
              <InputField name="mac_user" label="MAC Users" type="text" />
              <DateField
                name="submition"
                placeholder="Submission Date"
                value={formik.values.submition}
                onChange={(val) => formik.setFieldValue("submition", val)}
                range={false}
              />
              <DateField
                name="requested_delivery"
                placeholder="Requested Delivery Date"
                value={formik.values.requested_delivery}
                onChange={(val) => formik.setFieldValue("requested_delivery", val)}
                range={false}
              />
              <DateField
                name="service_handover"
                placeholder="Service Handover Date"
                value={formik.values.service_handover}
                onChange={(val) => formik.setFieldValue("service_handover", val)}
                range={false}
              />
            </div>
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <InputField
                name="remarks"
                label="Remarks"
                type="textarea"
                className="md:col-span-1"
              />
              <SelectField
                name="status"
                label="Status"
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
                onChange={(val) => handleSelectChange("status", val)}
                className="md:col-span-1"
              />
            </div>
          </FormSection>
          <div className="flex w-full justify-end mt-8 space-x-3">
            <Button intent="cancel" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              intent="submit"
              type="submit"
              loading={isSubmitting}
              loadingText="Saving..."
              disabled={isSubmitting || !formik.isValid}
            >
              Save
            </Button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default WorkOrderForm;