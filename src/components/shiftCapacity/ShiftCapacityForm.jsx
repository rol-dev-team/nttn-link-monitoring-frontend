
import React, { useEffect, useState, useRef, use } from "react";
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";
import { shiftCapacitySchema } from "../../validations/shiftCapacityValidation";

import { fetchNTTNs } from "../../services/nttn";
import { fetchCategories } from "../../services/category";
import { fetchClientsCategoryWise } from "../../services/client";
import { fetchWorkOrders } from "../../services/workOrder";
import { fetchBandwidthRangesByID } from "../../services/bandwidthRanges";

import { getRateBetweenBandwidthRange, getWorkOrderCategoryAndClientWise,createCapacityShifting } from "../../services/capacityShiftingApi";

/* ---------- section wrapper (identical to SurveyForm / BWModificationForm) ---------- */

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

/* ---------- empty shape ---------- */
const emptyValues = {
  nttn_provider: "",
  client_category: "",
  client: "",
  nttn_link_id: "",
  capacity: "",
  capacity_cost: "",
  shifting_bw: "",
  after_shifting_capacity: "",
  shifting_capacity: "",
  shifting_client_category: "",
  shifting_client: "",
  shifting_unit_cost: "",
  total_shifting_cost: "",
};

const ShiftCapacityForm = ({
  initialValues,
  isEditMode,
  onSubmit,
  onCancel,
  showToast,
}) => {
  const [nttnProviders, setNttnProviders] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [shiftingClients, setShiftingClients] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [bandwidthRanges, setBandwidthRanges] = useState([]);
  const [nttnLinkIds, setNttnLinkIds] = useState([]);
  const [shiftingClientLinkIds, setShiftingClientLinkIds] = useState([]);
  const [workOrderDetailsData, setWorkOrderDetailsData] = useState([]);
  const [shiftingWorkOrderDetailsData, setShiftingWorkOrderDetailsData] = useState([]);


  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastEdited = useRef(null); 

  /* ---------- formik ---------- */
  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: shiftCapacitySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSave(values, resetForm);
    },
  });

  /* ---------- bootstrap data ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const [nttn, cats, wos] = await Promise.all([
          fetchNTTNs(),
          fetchCategories(),
          fetchWorkOrders(),

        ]);
        setNttnProviders(nttn.data);
        setClientCategories(cats.data);
      
        setWorkOrders(Array.isArray(wos) ? wos : wos?.data || []);
      } catch (e) {
        showToast?.(e.message || "Failed to load form data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- cascading selects ---------- */
  useEffect(() => {
    if (!formik.values.nttn_provider) return;
    fetchBandwidthRangesByID(parseInt(formik.values.nttn_provider))
      .then(setBandwidthRanges)
      .catch(() => setBandwidthRanges([]));
  }, [formik.values.nttn_provider]);

  useEffect(() => {
    if (!formik.values.client_category) {
      setClients([]);
      formik.setFieldValue("client", "");
      return;
    }
    fetchClientsCategoryWise(formik.values.client_category)
      .then((res) => {setClients(res.data)})
      .catch(() => setClients([]));
  }, [formik.values.client_category]);

  useEffect(() => {
    if (!formik.values.shifting_client_category) {
      setShiftingClients([]);
      formik.setFieldValue("shifting_client", "");
      return;
    }
    fetchClientsCategoryWise(formik.values.shifting_client_category)
      .then((res) => {setShiftingClients(res.data)})
      .catch(() => setShiftingClients([]));
  }, [formik.values.shifting_client_category]);



  // get work order category and client wise

useEffect(() => {
  const { client, client_category } = formik.values;
  if (!client || !client_category) return;
    if (!client || !client_category) {
    setNttnLinkIds([]);
    setWorkOrderDetailsData([]);
    formik.setFieldValue("nttn_link_id", ""); 
    return;
  }

  setNttnLinkIds([]);
  setWorkOrderDetailsData([]);
  formik.setFieldValue("nttn_link_id", ""); 

  const fetchData = async () => {
    try {
      const { data } = await getWorkOrderCategoryAndClientWise({
        cat_id: client_category, 
        client_id: client          
      });
      setNttnLinkIds(data);
      setWorkOrderDetailsData(data);
    } catch (error) {
      console.error(" API call failed:", error);
    }
  };

  fetchData();
}, [formik.values.client, formik.values.client_category]);


useEffect(() => {
  if (!formik.values.nttn_link_id) return;

  const filtered = workOrderDetailsData?.find(
    (item) => item.id === formik.values.nttn_link_id
  );
  const totalCapasityCost = filtered?.rate * filtered?.request_capacity;

  if (filtered) {
    formik.setFieldValue("capacity", filtered?.request_capacity);
    formik.setFieldValue("capacity_cost", parseFloat(totalCapasityCost).toFixed(2) || 0 );
  }
}, [formik.values.nttn_link_id, workOrderDetailsData]);


  // get work order shifting category and client wise

useEffect(() => {
  const { shifting_client, shifting_client_category } = formik.values;
  if (!shifting_client || !shifting_client_category) return;
    if (!shifting_client || !shifting_client_category) {
    setShiftingClientLinkIds([]);
    setShiftingWorkOrderDetailsData([]);
     formik.setFieldValue("shifting_link_id", ""); 
    return;
  }

   setShiftingClientLinkIds([]);
   setShiftingWorkOrderDetailsData([]);
   formik.setFieldValue("shifting_link_id", ""); 

  const fetchShiftingData = async () => {
    try {
      const { data } = await getWorkOrderCategoryAndClientWise({
        cat_id: shifting_client_category, 
        client_id: shifting_client          
      });
      setShiftingClientLinkIds(data);
      setShiftingWorkOrderDetailsData(data);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  fetchShiftingData();
}, [formik.values.shifting_client, formik.values.shifting_client_category]);

useEffect(() => {
  if (!formik.values.shifting_link_id) return;

  const filtered = shiftingWorkOrderDetailsData?.find(
    (item) => item.id === formik.values.shifting_link_id
  );


  if (filtered) {
    formik.setFieldValue("shifting_unit_cost", filtered?.rate || 0);
  }
}, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);


//fetch bandwidth rates and calculate unit cost and shifting amount

useEffect(() => {
  const { shifting_bw } = formik.values;
  if (!shifting_bw) {
    formik.setFieldValue("shifting_unit_cost", "");
    formik.setFieldValue("shifting_capacity", "");
    return;
  }

  const fetchRate = async () => {
    try {
      const { data } = await getRateBetweenBandwidthRange({ bandwidth: shifting_bw });
      const unitCost = parseFloat(data?.rate) || 0;
      const shiftingAmount = unitCost * parseInt(shifting_bw);

      formik.setFieldValue("shifting_unit_cost", unitCost.toFixed(2));
      formik.setFieldValue("shifting_capacity", shiftingAmount.toFixed(2));

    } catch (error) {
      console.error("API call failed:", error);
      formik.setFieldValue("shifting_unit_cost", "");
      formik.setFieldValue("shifting_capacity", "");
    } 
  };

  fetchRate();
}, [formik.values.shifting_bw]);



  useEffect(() => {
  const capacity = parseInt(formik.values.capacity) || 0;
  const shifting = parseInt(formik.values.shifting_bw) || 0;
  const unitCost = parseFloat(formik.values.shifting_unit_cost) || 0;

  const afterShifting = capacity - shifting;
  const totalShifting = afterShifting * unitCost;

  formik.setFieldValue("after_shifting_capacity", afterShifting, false);
  formik.setFieldValue("total_shifting_cost", totalShifting.toFixed(2), false);
}, [formik.values.capacity, formik.values.shifting_bw, formik.values.shifting_unit_cost]);

  /* ---------- submit ---------- */
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
        const res = await createCapacityShifting(values);
        showToast?.(res.message, "success");

      resetForm();
      onCancel(); // close form
    } catch (e) {
      showToast?.(e.message || "Save failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("Formik Values:", formik.values);
    console.log("Formik Values:", formik.errors);
  /* ---------- render ---------- */
  if (isLoading) {
    return (
      <div className='p-8 bg-gray-100 min-h-screen flex items-center justify-center'>
        <span className='text-gray-500'>Loading form data...</span>
      </div>
    );
  }

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={formik.handleSubmit}
        className='p-8 bg-gray-100 min-h-screen space-y-6'>
        {/* header – identical to SurveyForm / BWModificationForm */}
        <div className='flex items-center space-x-3 mb-6 md:mb-8'>
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
              {isEditMode ? "Edit Capacity Shift" : "Add Capacity Shift"}
            </h1>
            <p className='text-gray-500'>
              Fill in the details to {isEditMode ? "update" : "add a new"}{" "}
              capacity-shift record.
            </p>
          </div>
        </div>

        {/* Shifting Source */}
        <FormSection title='Shifting Source'>
          <SelectField
            name='nttn_provider'
            placeholder='NTTN Name*'
            options={nttnProviders.map((p) => ({
              value: p.id,
              label: p.nttn_name,
            }))}
            onChange={(v) => formik.setFieldValue("nttn_provider", v)}
            searchable
          />
          <SelectField
            name='client_category'
            placeholder='Client Category *'
            options={clientCategories.map((c) => ({
              value: c.id,
              label: c.cat_name,
            }))}
            onChange={(v) => {
              formik.setFieldValue("client_category", v);
              formik.setFieldValue("client", "");
            }}
            searchable
            disabled={!formik.values.nttn_provider}
          />
          <SelectField
            name='client'
            placeholder='Client Name *'
            options={clients.map((c) => ({
              value: c.id,
              label: c.client_name,
            }))}
            onChange={(v) => formik.setFieldValue("client", v)}
            searchable
            disabled={!formik.values.client_category}
          />
          <SelectField
            name='nttn_link_id'
            placeholder='Work Order Link ID*'
            options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_id }))}
            onChange={(v) => formik.setFieldValue("nttn_link_id", v)}
            searchable
            disabled={!formik.values.client}
          />
        </FormSection>
        <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 '>
          <div className='grid grid-cols-1 sm:grid-cols-2 justify-items-center items-center gap-4 text-sm'>
            <div className='flex items-center space-x-2'>
              <p>
                <strong className='text-gray-800'>Capacity:</strong>{" "}
                {formik.values.capacity || "N/A"}
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <p>
                <strong className='text-gray-800'>Capacity Cost:</strong>{" "}
                {formik.values.capacity_cost || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/* Current Details - Now a styled div */}

        {/* Shifting Target */}
        <FormSection title='Shifting Target'>
          {/* ----- 3-in-a-row : Shifting Client Category / Name / Link ID ----- */}
          <div className='col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
            <SelectField
              name='shifting_client_category'
              placeholder='Shifting Client Category *'
              options={clientCategories.map((c) => ({
                value: c.id,
                label: c.cat_name,
              }))}
              onChange={(v) => {
                formik.setFieldValue("shifting_client_category", v);
                formik.setFieldValue("shifting_client", "");
              }}
              searchable
            />
            <SelectField
              name='shifting_client'
              placeholder='Shifting Client Name *'
              options={shiftingClients.map((c) => ({
                value: c.id,
                label: c.client_name,
              }))}
              onChange={(v) => formik.setFieldValue("shifting_client", v)}
              searchable
              disabled={!formik.values.shifting_client_category}
            />
            <SelectField
              name='shifting_link_id'
              placeholder='Shifting Work Order Link ID'
              options={shiftingClientLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_id }))}
              onChange={(v) => formik.setFieldValue("shifting_link_id", v)}
              searchable
              isClearable
            />
          </div>

          {/* ----- 4-in-a-row : Shifting BW / Amount / Unit Cost / Total ----- */}
          <div className='col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4'>
            <InputField
              name='shifting_bw'
              label='Shifting BW *'
              type='number'
              step='0.01'
              // disabled={lastEdited.current === "amount"}
               onChange={formik.handleChange}
            />
            <InputField
              name='shifting_capacity'
              label='Shifting Amount *'
              type='number'
              step='0.01'
              disabled={!formik.values.shifting_bw}
              onChange={formik.handleChange}
            />
            <InputField
              name='shifting_unit_cost'
              label={`Unit Cost ${isLoadingRates ? "(Loading...)" : ""}`}
              type='number'
              step='0.01'
              disabled
            />
            <InputField
              name='total_shifting_cost'
              label='Total Shifting Cost'
              type='number'
              step='0.01'
              disabled
            />
          </div>

          <InputField
            name='after_shifting_capacity'
            label='After-Shifting Capacity'
            type='number'
            step='0.01'
            disabled
          />
        </FormSection>

        {/* New Values */}
        {/* <FormSection title="New Values">
        </FormSection> */}

        {/* Actions – identical bar */}
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
  );
};

export default ShiftCapacityForm;
