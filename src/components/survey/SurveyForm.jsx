import React, { useState, useEffect } from "react";
import { useFormik, FormikProvider } from "formik";
import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import {
  ArrowLeft,
  MapPin,
  Building,
  Pin,
  Globe,
  CircleCheck,
  Calendar,
} from "lucide-react";
import { fetchSBUs } from "../../services/sbu";
import { fetchLinkTypes } from "../../services/linkType";
import { fetchAggregators } from "../../services/aggregator";
import { fetchKams } from "../../services/kam";
import { fetchNTTNs } from "../../services/nttn";
import { fetchCategories } from "../../services/category";
import { fetchClientsCategoryWise } from "../../services/client";
import { surveySchema } from "../../validations/surveyValidation";
import DatePickerField from "./../fields/DatePickerField";

const FormSection = ({ title, children }) => (
  <fieldset className='col-span-full border-t border-gray-300 pt-6 mt-6'>
    <legend className='px-2 text-xl font-semibold text-gray-900'>
      {title}
    </legend>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4'>
      {children}
    </div>
  </fieldset>
);

const defaultFormValues = {
  type_id: 1,
  sbu_id: null,
  link_type_id: null,
  aggregator_id: null,
  kam_id: null,
  nttn_id: null,
  nttn_survey_id: "",
  nttn_lat: "",
  nttn_long: "",
  cat_id: null,
  client_id: null,
  client_lat: null,
  client_long: null,
  mac_user: "",
  status: "active",
  submission: "",
  division: "",
  district: "",
  thana: "",
  address: "",
};

const SurveyForm = ({
  initialValues,
  isEditMode,
  onSubmit,
  onCancel,
  showToast,
}) => {
  const [sbuOptions, setSbuOptions] = useState([]);
  const [linkTypeOptions, setLinkTypeOptions] = useState([]);
  const [aggregatorOptions, setAggregatorOptions] = useState([]);
  const [kamOptions, setKamOptions] = useState([]);
  const [nttnOptions, setNttnOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { ...defaultFormValues, ...initialValues },
    validationSchema: surveySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await onSubmit(values, { resetForm });
      } catch (error) {
        showToast(error?.response?.data?.message || "Save failed!", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Load static data on component mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [sbuRes, linkTypeRes, aggregatorRes, kamRes, nttnRes, catRes] =
          await Promise.all([
            fetchSBUs(),
            fetchLinkTypes(),
            fetchAggregators(),
            fetchKams(),
            fetchNTTNs(),
            fetchCategories(),
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
        setCategoryOptions(
          catRes.map((item) => ({ value: item.id, label: item.cat_name }))
        );
      } catch (err) {
        showToast(
          err?.response?.data?.message ||
            "Failed to load static data for survey form!",
          "error"
        );
      }
    };
    loadStaticData();
  }, [showToast]);

  // Fetch client options when category changes
  useEffect(() => {
    const fetchClients = async () => {
      const categoryId = formik.values.cat_id;
      if (!categoryId) {
        setClientOptions([]);
        return;
      }
      try {
        const clientsRes = await fetchClientsCategoryWise(categoryId);
        setClientOptions(
          clientsRes.map((item) => ({
            value: item.id,
            label: item.client_name,
            division: item.division_name,
            district: item.district_name,
            thana: item.thana_name,
            address: item.address,
            client_lat: item.client_lat,
            client_long: item.client_long,
          }))
        );
      } catch (err) {
        showToast(
          err?.response?.data?.message ||
            "Failed to load clients for the selected category!",
          "error"
        );
        setClientOptions([]);
      }
    };
    fetchClients();
  }, [formik.values.cat_id, showToast]);

  // **NEW FIX:** Handle client-related fields from user interaction ONLY
  const handleClientChange = (selectedValue) => {
    formik.setFieldValue("client_id", selectedValue);
    const selectedClient = clientOptions.find(
      (client) => client.value === selectedValue
    );
    if (selectedClient) {
      formik.setFieldValue("division", selectedClient.division || "");
      formik.setFieldValue("district", selectedClient.district || "");
      formik.setFieldValue("thana", selectedClient.thana || "");
      formik.setFieldValue("address", selectedClient.address || "");
      formik.setFieldValue("client_lat", selectedClient.client_lat || "");
      formik.setFieldValue("client_long", selectedClient.client_long || "");
    }
  };

  const handleCategoryChange = (selectedValue) => {
    formik.setFieldValue("cat_id", selectedValue);
    formik.setFieldValue("client_id", null);
    formik.setFieldValue("division", "");
    formik.setFieldValue("district", "");
    formik.setFieldValue("thana", "");
    formik.setFieldValue("address", "");
    formik.setFieldValue("client_lat", "");
    formik.setFieldValue("client_long", "");
  };

  console.log(formik.values);

  return (
    <div className='p-4'>
      <div className='flex items-center space-x-2 mb-4 md:mb-8'>
        <Button
          variant='icon'
          type='button'
          onClick={onCancel}
          title='Go Back'
          className='p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110'>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {isEditMode ? "Edit Survey" : "Add Survey"}
          </h1>
          <p className='text-gray-500'>
            Fill in the details to {isEditMode ? "update" : "add a new"} survey
            record.
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form className='space-y-6' onSubmit={formik.handleSubmit}>
          <FormSection title='Basic Info'>
            <SelectField
              name='sbu_id'
              placeholder='SBU'
              options={sbuOptions}
              onChange={(val) => formik.setFieldValue("sbu_id", val)}
              searchable
            />
            <SelectField
              name='link_type_id'
              placeholder='Link Type'
              options={linkTypeOptions}
              onChange={(val) => formik.setFieldValue("link_type_id", val)}
              searchable
            />
            <SelectField
              name='aggregator_id'
              placeholder='Aggregator'
              options={aggregatorOptions}
              onChange={(val) => formik.setFieldValue("aggregator_id", val)}
              searchable
            />
            <SelectField
              name='kam_id'
              placeholder='KAM'
              options={kamOptions}
              onChange={(val) => formik.setFieldValue("kam_id", val)}
              searchable
            />
          </FormSection>

          <FormSection title='Client Details'>
            <SelectField
              name='cat_id'
              placeholder='Category'
              options={categoryOptions}
              onChange={(val) => handleCategoryChange(val)}
              searchable
            />
            <SelectField
              name='client_id'
              placeholder='Client Name'
              options={clientOptions}
              onChange={(val) => handleClientChange(val)}
              searchable
              isDisabled={!formik.values.cat_id}
            />
            <InputField name='client_lat' label='Client Latitude' type='text' />
            <InputField
              name='client_long'
              label='Client Longitude'
              type='text'
            />
            <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 col-span-full'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-4 text-sm'>
                <h3 className='flex items-center text-sm font-semibold text-gray-700'>
                  <MapPin size={16} className='mr-2 text-gray-500' />
                  Client Location Information
                </h3>
                <div className='flex items-center space-x-2'>
                  <Globe size={16} className='text-blue-500' />
                  <p>
                    <strong className='text-gray-800'>Division:</strong>{" "}
                    {formik.values.division || "N/A"}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Building size={16} className='text-green-500' />
                  <p>
                    <strong className='text-gray-800'>District:</strong>{" "}
                    {formik.values.district || "N/A"}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Pin size={16} className='text-red-500' />
                  <p>
                    <strong className='text-gray-800'>Thana:</strong>{" "}
                    {formik.values.thana || "N/A"}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Building size={16} className='text-purple-500' />
                  <p className='truncate'>
                    <strong className='text-gray-800'>Address:</strong>{" "}
                    {formik.values.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title='NTTN Details'>
            <SelectField
              name='nttn_id'
              placeholder='NTTN Name'
              options={nttnOptions}
              onChange={(val) => formik.setFieldValue("nttn_id", val)}
              searchable
            />
            <InputField
              name='nttn_survey_id'
              label='NTTN Provider ID'
              type='text'
            />
            <InputField name='nttn_lat' label='NTTN Latitude' type='text' />
            <InputField name='nttn_long' label='NTTN Longitude' type='text' />
          </FormSection>

          <fieldset className='col-span-full border-t border-gray-300 pt-6 mt-6'>
            <legend className='px-2 text-xl font-semibold text-gray-900'>
              Additional Details
            </legend>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pt-4'>
              <InputField name='mac_user' label='MAC Users' type='text' />
              <SelectField
                name='status'
                placeholder='Status'
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                onChange={(val) => formik.setFieldValue("status", val)}
              />

              <DatePickerField
                name='submission'
                placeholder='Submission Date'
                field={{ name: "submission", value: formik.values.submission }}
                form={formik}
              />
            </div>
          </fieldset>

          <div className='flex w-full justify-end mt-8 space-x-3'>
            <Button intent='cancel' type='button' onClick={onCancel}>
              Cancel
            </Button>
            <Button
              intent='submit'
              type='submit'
              loading={isSubmitting}
              loadingText='Saving...'
              disabled={isSubmitting || !formik.isValid}>
              Save
            </Button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default SurveyForm;
