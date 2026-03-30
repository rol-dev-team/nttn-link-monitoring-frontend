


import React, { useEffect, useState, useRef } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

import { fetchNTTNs } from '../../services/nttn';
import { fetchCategories } from '../../services/category';
import { fetchClientsCategoryWise } from '../../services/client';
import { fetchWorkOrders } from '../../services/workOrder';
import { fetchBandwidthRangesByID } from '../../services/bandwidthRanges';

import {
  getRateBetweenBandwidthRange,
  getWorkOrderCategoryAndClientWise,
  createCapacityShifting,
} from '../../services/capacityShiftingApi';
import { getRatesBetweenShiftingBandwidth, getRatesByNttn } from '../../services/bwRateApi';
import { fetchLinkTypes } from '../../services/linkType';
import DatePickerField from '../fields/DatePickerField';
import { fetchReasons } from '../../services/reason';
import { set } from 'date-fns';

const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- empty shape ---------- */
const emptyValues = {
  nttn_provider: '',
  link_type: '',
  client_category: '',
  client: '',
  nttn_link_id: '',
  capacity: '',
  capacity_cost: '',
  shifting_bw: '',
  after_shifting_capacity: '',
  shifting_capacity: '',
  shifting_client_category: '',
  shifting_client: '',
  shifting_unit_cost: '',
  total_shifting_cost: '',
  shifting_unit_price_dropdown: '',
  submission_date: '',
  reason_id: '',
  remarks: '',
  target_request_capacity: '', // NEW: Store target work order request_capacity
  target_total_bw: '', // NEW: Store combined BW for rate calculation
};

const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const [nttnProviders, setNttnProviders] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [linkTypeOptions, setLinkTypeOptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [shiftingClients, setShiftingClients] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [bandwidthRanges, setBandwidthRanges] = useState([]);
  const [nttnLinkIds, setNttnLinkIds] = useState([]);
  const [shiftingClientLinkIds, setShiftingClientLinkIds] = useState([]);
  const [workOrderDetailsData, setWorkOrderDetailsData] = useState([]);
  const [shiftingWorkOrderDetailsData, setShiftingWorkOrderDetailsData] = useState([]);
  const [shiftingSourceRates, setShiftingSourceRates] = useState(0);
  const [showShiftingDropdown, setShowShiftingDropdown] = useState(false);
  const [nttnRatesOptions, setNttnRatesOptions] = useState([]);
  const [shiftingNttnUnitPrice, setShiftingNttnUnitPrice] = useState(0);
  const [printLinkTypeName, setPrintLinkTypeName] = useState('');
  const [reasonsOptions, setReasonsOptions] = useState([]);
  const [shiftingBandwidthRateRanges, setShiftingBandwidthRateRanges] = useState([]);

  // Add these states for rate_type handling
  const [currentRateType, setCurrentRateType] = useState(null);
  const [shiftingRateData, setShiftingRateData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastEdited = useRef(null);

  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: shiftCapacitySchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSave(values, resetForm);
    },
  });

  useEffect(() => {
    const boot = async () => {
      try {
        const [nttn, cats, linkTypesRes, reasonsRes] = await Promise.all([
          fetchNTTNs(),
          fetchCategories(),
          fetchLinkTypes(),
          fetchReasons(),
        ]);
        setNttnProviders(nttn.data);
        setClientCategories(cats.data);
        setLinkTypeOptions(linkTypesRes.data);
        setReasonsOptions(reasonsRes.data);
      } catch (e) {
        showToast?.(e.message || 'Failed to load form data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  useEffect(() => {
    if (!formik.values.nttn_provider || !formik.values.link_type) return;
    getRatesByNttn({
      nttn_id: parseInt(formik.values.nttn_provider),
      link_type_id: parseInt(formik.values.link_type),
    })
      .then((res) => {
        setNttnRatesOptions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [formik.values.nttn_provider, formik.values.link_type]);

  // Update: Fetch rates for shifting bandwidth with rate_type handling
  useEffect(() => {
    // Skip if user manually selected a rate from dropdown
    if (formik.values.shifting_unit_price_dropdown) {
      console.log('⏸️ Skipping auto-rate fetch - rate already selected from dropdown');
      return;
    }

    if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw)
      return;

    getRatesBetweenShiftingBandwidth({
      nttn_id: parseInt(formik.values.nttn_provider),
      link_type_id: parseInt(formik.values.link_type),
      bandwidth: parseFloat(formik.values.shifting_bw),
    })
      .then((res) => {
        console.log('📊 Direct Rate Fetch Response:', res?.data);

        formik.setFieldValue('shifting_unit_cost', '');
        setShiftingBandwidthRateRanges(res?.data);

        if (res?.data) {
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;

          console.log('📌 Rate Type:', rateTypeValue);
          setCurrentRateType(rateTypeValue);
          setShiftingRateData(res?.data);

          const unitRate = parseFloat(res?.data?.rate) || 0;
          formik.setFieldValue('shifting_unit_cost', unitRate);

          // Auto-calculate shifting_capacity based on rate_type
          if (rateTypeValue === 1) {
            // rate_type 1: Shifting Amount = Unit Rate
            formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
            console.log('📌 Rate Type 1: Auto-filled Shifting Amount = Unit Rate =', unitRate);
          } else if (rateTypeValue === 2) {
            // rate_type 2: Shifting Amount = BW * Rate
            const bw = parseFloat(formik.values.shifting_bw);
            const shiftingAmount = bw * unitRate;
            formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2));
            console.log('📌 Rate Type 2: Auto-filled Shifting Amount = BW × Unit Rate =', shiftingAmount);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setCurrentRateType(null);
        setShiftingRateData(null);
      });
  }, [formik.values.shifting_bw, formik.values.nttn_provider, formik.values.link_type, formik.values.shifting_unit_price_dropdown]);

  useEffect(() => {
    if (!formik.values.client_category) {
      setClients([]);
      formik.setFieldValue('client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.client_category)
      .then((res) => {
        setClients(res.data);
      })
      .catch(() => setClients([]));
  }, [formik.values.client_category]);

  useEffect(() => {
    if (!formik.values.shifting_client_category) {
      setShiftingClients([]);
      formik.setFieldValue('shifting_client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.shifting_client_category)
      .then((res) => {
        setShiftingClients(res.data);
      })
      .catch(() => setShiftingClients([]));
  }, [formik.values.shifting_client_category]);

  useEffect(() => {
    const { client, client_category } = formik.values;
    if (!client || !client_category) return;

    setNttnLinkIds([]);
    setWorkOrderDetailsData([]);
    formik.setFieldValue('nttn_link_id', '');

    const fetchData = async () => {
      try {
        const { data } = await getWorkOrderCategoryAndClientWise({
          cat_id: client_category,
          client_id: client,
        });
        setNttnLinkIds(data);
        setWorkOrderDetailsData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };

    fetchData();
  }, [formik.values.client, formik.values.client_category]);

  useEffect(() => {
    if (!formik.values.nttn_link_id) return;

    const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
    const totalCapasityCost = filtered?.rate * filtered?.request_capacity;
    if (filtered) {
      setShiftingSourceRates(filtered?.rate);
      setPrintLinkTypeName(filtered?.type_name);
      formik.setFieldValue('capacity', filtered?.request_capacity);
      formik.setFieldValue('capacity_cost', parseFloat(totalCapasityCost).toFixed(2) || 0);
    }
  }, [formik.values.nttn_link_id, workOrderDetailsData]);

  // get work order shifting category and client wise (Target)
  useEffect(() => {
    const { shifting_client, shifting_client_category } = formik.values;
    if (!shifting_client || !shifting_client_category) return;

    // Resetting fields before fetching
    setShiftingClientLinkIds([]);
    setShiftingWorkOrderDetailsData([]);
    formik.setFieldValue('shifting_link_id', '');

    const fetchShiftingData = async () => {
      try {
        const { data } = await getWorkOrderCategoryAndClientWise({
          cat_id: shifting_client_category,
          client_id: shifting_client,
        });
        setShiftingClientLinkIds(data);
        setShiftingWorkOrderDetailsData(data);
      } catch (error) {
        console.error('API call failed:', error);
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
      formik.setFieldValue('shifting_unit_cost', filtered?.rate || 0);
      // Store the target work order's request_capacity
      formik.setFieldValue('target_request_capacity', filtered?.request_capacity || 0);
      console.log('📊 Shifting Link Selected - request_capacity:', filtered?.request_capacity);
    }
  }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

  // Calculate target_total_bw whenever shifting_bw or target_request_capacity changes
  useEffect(() => {
    const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
    const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;

    if (targetRequestCapacity > 0 && shiftingBW > 0) {
      const totalBW = targetRequestCapacity + shiftingBW;
      formik.setFieldValue('target_total_bw', totalBW);
      console.log('📊 Target Total BW (request_capacity + shifting_bw):', totalBW);
    } else {
      formik.setFieldValue('target_total_bw', '');
    }
  }, [formik.values.shifting_bw, formik.values.target_request_capacity]);

  // NEW: When shifting_bw changes, calculate total BW and fetch rate
  // NEW: When shifting_bw changes, calculate total BW and fetch rate
useEffect(() => {
  const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;
  
  // IMPORTANT: Don't fetch if user is using the dropdown for manual rate selection
  if (showShiftingDropdown || formik.values.shifting_unit_price_dropdown) {
    console.log('⏸️ Skipping API call - dropdown is active or rate already selected');
    return;
  }
  
  // Get the request_capacity from the selected shifting work order
  const filtered = shiftingWorkOrderDetailsData?.find(
    (item) => item.id === formik.values.shifting_link_id
  );
  const shiftingRequestCapacity = filtered ? parseInt(filtered.request_capacity) || 0 : 0;

  console.log('📊 Shifting BW:', shiftingBW, 'Shifting Request Capacity:', shiftingRequestCapacity);

  // If no shifting link selected or no shifting BW, don't calculate
  if (!formik.values.shifting_link_id || shiftingBW <= 0) {
    console.log('❌ Missing shifting link or shifting BW');
    return;
  }

  // Calculate total bandwidth = request_capacity + shifting_bw
  const totalBW = shiftingRequestCapacity + shiftingBW;
  console.log('📈 Total BW (request_capacity + shifting_bw):', totalBW);

  // Fetch rate for this total BW
  const fetchRateForTotalBW = async () => {
    if (!formik.values.nttn_provider || !formik.values.link_type) {
      console.log('❌ Missing NTTN provider or link type');
      return;
    }

    try {
      console.log('🔡 Fetching rate for total BW:', totalBW);
      
      const res = await getRatesBetweenShiftingBandwidth({
        nttn_id: parseInt(formik.values.nttn_provider),
        link_type_id: parseInt(formik.values.link_type),
        bandwidth: totalBW,
      });

      if (res?.data && res.data.rate) {
        const unitRate = parseFloat(res.data.rate);
        const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

        console.log('💰 Unit Rate for total BW found:', unitRate, 'Rate Type:', rateTypeValue);
        
        // Update shifting_unit_cost with the new rate
        formik.setFieldValue('shifting_unit_cost', unitRate.toFixed(2));

        // Calculate shifting_capacity based on rate_type
        if (rateTypeValue === 1) {
          // rate_type 1: Shifting Amount = Unit Rate (fixed rate)
          formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
          console.log('📌 Rate Type 1: Shifting Amount = Unit Rate =', unitRate);
        } else {
          // rate_type 2: Shifting Amount = Shifting BW * Unit Rate
          const shiftingAmount = shiftingBW * unitRate;
          formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2));
          console.log('📌 Rate Type 2: Shifting Amount = Shifting BW (' + shiftingBW + ') × Unit Rate (' + unitRate + ') =', shiftingAmount);
        }
      } else {
        console.log('❌ No rate data in response for total BW');
      }
    } catch (error) {
      console.error('❌ Error fetching rate for total BW:', error);
    }
  };

  fetchRateForTotalBW();

}, [
  formik.values.shifting_bw,
  formik.values.shifting_link_id,
  formik.values.nttn_provider,
  formik.values.link_type,
  shiftingWorkOrderDetailsData,
  showShiftingDropdown,
  formik.values.shifting_unit_price_dropdown, // Add this dependency
]);

  /* ------------------------------------------- */
  /* ---------- Two-Way Calculation Logic ---------- */
  /* ------------------------------------------- */

  // Calculation 1: Calculate Shifting Amount from Shifting BW based on rate_type
useEffect(() => {
  const { shifting_bw, shifting_unit_price_dropdown } = formik.values;

  // Exit if 'capacity' was edited last, or if required values are missing
  if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) {
    return;
  }

  formik.setFieldValue('shifting_capacity', '', false);

  // Find the selected rate
  const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
  const unitRate = parseFloat(selectedRateOption?.rate) || 0;
  const bw = parseFloat(shifting_bw);

  if (unitRate <= 0 || bw <= 0) {
    formik.setFieldValue('shifting_capacity', '', false);
    return;
  }

  // Check if this rate has rate_type info
  const rateTypeForDropdown = selectedRateOption?.rate_type
    ? parseInt(selectedRateOption.rate_type, 10)
    : 2; // Default to 2 if not available

  console.log('📌 Rate Type from dropdown:', rateTypeForDropdown);

  let shiftingAmount;

  if (rateTypeForDropdown === 1) {
    // rate_type 1: Shifting Amount = Unit Rate (no multiplication)
    shiftingAmount = unitRate;
    console.log('📌 Rate Type 1: Shifting Amount = Unit Rate =', unitRate);
  } else {
    // rate_type 2: Shifting Amount = BW * Rate
    shiftingAmount = bw * unitRate;
    console.log('📌 Rate Type 2: Shifting Amount = BW × Unit Rate =', shiftingAmount);
  }

  // Update the Shifting Amount/Capacity field
  formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
  
  // Reset lastEdited so future changes can trigger calculations again
  lastEdited.current = null;
}, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

  // Calculation 2: Calculate Shifting BW from Shifting Amount based on rate_type
  useEffect(() => {
    const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;

    // Exit if 'bw' was edited last, or if required values are missing
    if (
      lastEdited.current === 'bw' ||
      !shifting_unit_price_dropdown ||
      !shifting_capacity ||
      parseFloat(shifting_capacity) <= 0
    ) {
      return;
    }

    formik.setFieldValue('shifting_bw', '', false);

    // Find the selected rate
    const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);

    const unitRate = parseFloat(selectedRateOption?.rate);
    const shiftingCost = parseFloat(shifting_capacity);

    if (!unitRate || unitRate <= 0) {
      console.error('Selected Unit Rate is invalid or zero.');
      formik.setFieldValue('shifting_bw', '', false);
      return;
    }

    // Check rate_type for reverse calculation
    const rateTypeForDropdown = selectedRateOption?.rate_type
      ? parseInt(selectedRateOption.rate_type, 10)
      : 2; // Default to 2 if not available

    let calculatedBW;

    if (rateTypeForDropdown === 1) {
      // rate_type 1: BW cannot be calculated from Amount, clear it
      console.log('📌 Rate Type 1: BW not applicable for fixed rate');
      formik.setFieldValue('shifting_bw', '', false);
      return;
    } else {
      // rate_type 2: BW = Cost / Rate
      calculatedBW = shiftingCost / unitRate;
      const finalBW = Math.floor(calculatedBW);
      console.log('📌 Rate Type 2: Shifting BW = Shifting Amount (' + shiftingCost + ') ÷ Rate (' + unitRate + ') =', finalBW);
      
      // Set lastEdited.current = 'capacity' BEFORE setting shifting_bw
      // This prevents Calculation 1 from running and overwriting shifting_capacity
      lastEdited.current = 'capacity';
      
      formik.setFieldValue('shifting_bw', finalBW, false);
    }
  }, [
    formik.values.shifting_capacity,
    formik.values.shifting_unit_price_dropdown,
    nttnRatesOptions,
  ]);

  // Helper function to find rate for a specific bandwidth range
  const findRateForBandwidth = (bandwidth, ratesArray = nttnRatesOptions) => {
    if (!bandwidth || !Array.isArray(ratesArray) || ratesArray.length === 0) {
      return null;
    }

    try {
      console.log(`🎯 Finding rate for bandwidth: ${bandwidth} from ${ratesArray.length} available rates`);

      const matchingRate = ratesArray.find((rate) => {
        const rangeFrom = parseFloat(rate.bw_range_from);
        const rangeTo = parseFloat(rate.bw_range_to);
        return bandwidth >= rangeFrom && bandwidth <= rangeTo;
      });

      if (matchingRate) {
        console.log('💰 Rate found for bandwidth:', bandwidth, 'Rate:', matchingRate.rate, 'Range:', matchingRate.bw_range_from, '-', matchingRate.bw_range_to);
        return {
          rate: parseFloat(matchingRate.rate),
          rateId: matchingRate.id,
          rangeFrom: matchingRate.bw_range_from,
          rangeTo: matchingRate.bw_range_to,
        };
      } else {
        console.log('❌ No rate found for bandwidth:', bandwidth);
        return null;
      }
    } catch (error) {
      console.error('❌ Error finding rate for bandwidth:', error);
      return null;
    }
  };

  // Calculate After Shifting Capacity and Total Shifting Cost
  useEffect(() => {
    const capacity = parseInt(formik.values.capacity) || 0;
    const shiftingBW = parseInt(formik.values.shifting_bw) || 0;

    // 1. Calculate After Shifting Capacity
    const afterShiftingCapacity = capacity - shiftingBW;
    console.log('📊 Capacity:', capacity, 'Shifting BW:', shiftingBW, 'After Shifting Capacity:', afterShiftingCapacity);

    // Always update after_shifting_capacity first
    formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity, false);

    // 2. Fetch rate for after-shifting capacity using API
    const fetchAfterShiftingRate = async () => {
      if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !formik.values.link_type) {
        console.log('❌ Missing required values for rate fetch');
        formik.setFieldValue('total_shifting_cost', '0.00', false);
        return;
      }

      try {
        console.log('🔡 Fetching rate for after-shifting capacity:', afterShiftingCapacity);
        
        const res = await getRatesBetweenShiftingBandwidth({
          nttn_id: parseInt(formik.values.nttn_provider),
          link_type_id: parseInt(formik.values.link_type),
          bandwidth: afterShiftingCapacity,
        });

        if (res?.data && res.data.rate) {
          const afterShiftingUnitRate = parseFloat(res.data.rate);
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

          console.log('💰 After Shifting Rate found:', afterShiftingUnitRate, 'Rate Type:', rateTypeValue);

          let totalShiftingCost;

          if (rateTypeValue === 1) {
            // rate_type 1: Total Cost = Unit Rate (fixed rate)
            totalShiftingCost = afterShiftingUnitRate;
            console.log('📌 Rate Type 1: Total Shifting Cost = Unit Rate =', totalShiftingCost);
          } else {
            // rate_type 2: Total Cost = After Shifting Capacity * Unit Rate
            totalShiftingCost = afterShiftingCapacity * afterShiftingUnitRate;
            console.log('📌 Rate Type 2: Total Shifting Cost = After Shifting Capacity (' + afterShiftingCapacity + ') × Unit Rate (' + afterShiftingUnitRate + ') =', totalShiftingCost);
          }

          formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
        } else {
          console.log('❌ No rate data in response');
          formik.setFieldValue('total_shifting_cost', '0.00', false);
        }
      } catch (error) {
        console.error('❌ Error fetching after-shifting rate:', error);
        formik.setFieldValue('total_shifting_cost', '0.00', false);
      }
    };

    // Call the API
    fetchAfterShiftingRate();

  }, [
    formik.values.capacity,
    formik.values.shifting_bw,
    formik.values.nttn_provider,
    formik.values.link_type,
  ]);

  /* ---------- submit ---------- */
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
      // NOTE: Remove the 'shifting_unit_price_dropdown' and helper fields before sending to API
      const { shifting_unit_price_dropdown, target_request_capacity, ...payload } = values;

      console.log('📤 Payload to Backend:', {
        ...payload,
        shifting_bw: parseFloat(payload.shifting_bw) || 0,
        target_total_bw: parseFloat(payload.target_total_bw) || 0,
        link_type: parseInt(payload.link_type) || null,
      });

      const res = await createCapacityShifting(payload);
      showToast?.(res.message, 'success');

      resetForm();
      onCancel(); // close form
    } catch (e) {
      showToast?.(e.message || 'Save failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('shiftingBandwidthRateRanges', shiftingBandwidthRateRanges);

  /* ---------- render ---------- */
  if (isLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading form data...</span>
      </div>
    );
  }

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
        {/* header */}
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
              {isEditMode ? 'Edit Capacity Shift' : 'Add Capacity Shift'}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? 'update' : 'add a new'} capacity-shift record.
            </p>
          </div>
        </div>

        {/* Shifting Source */}
        <FormSection title="Shifting Source">
          <SelectField
            name="nttn_provider"
            placeholder="NTTN Name*"
            options={nttnProviders.map((p) => ({
              value: p.id,
              label: p.nttn_name,
            }))}
            onChange={(v) => formik.setFieldValue('nttn_provider', v)}
            searchable
          />

          <SelectField
            name="client_category"
            placeholder="Client Category *"
            options={clientCategories.map((c) => ({
              value: c.id,
              label: c.cat_name,
            }))}
            onChange={(v) => {
              formik.setFieldValue('client_category', v);
              formik.setFieldValue('client', '');
            }}
            searchable
            disabled={!formik.values.nttn_provider}
          />
          <SelectField
            name="client"
            placeholder="Client Name *"
            options={clients.map((c) => ({
              value: c.id,
              label: c.client_name,
            }))}
            onChange={(v) => formik.setFieldValue('client', v)}
            searchable
            disabled={!formik.values.client_category}
          />
          <SelectField
            name="nttn_link_id"
            placeholder="Work Order Link ID*"
            options={nttnLinkIds.map((nttn) => ({
              value: nttn.id,
              label: nttn.nttn_work_order_id,
            }))}
            onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
            searchable
            disabled={!formik.values.client}
          />
        </FormSection>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 ">
          <div className="grid grid-cols-1 sm:grid-cols-6 justify-items-center items-center gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Link Type:</strong>{' '}
                {(printLinkTypeName && printLinkTypeName) || 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity:</strong>{' '}
                {formik.values.capacity || 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Unit Price:</strong>{' '}
                {(shiftingSourceRates && shiftingSourceRates) || '0.00'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity Cost:</strong>{' '}
                {formik.values.capacity_cost || '0.00'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shifting Cost:</strong>{' '}
                {formik.values.total_shifting_cost || 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shifting Capacity:</strong>{' '}
                {formik.values.after_shifting_capacity || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Shifting Target */}
        <FormSection title="Shifting Target">
          {/* ----- 3-in-a-row : Shifting Client Category / Name / Link ID ----- */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <SelectField
              name="link_type"
              placeholder="Link Type*"
              options={linkTypeOptions.map((p) => ({
                value: p.id,
                label: p.type_name,
              }))}
              onChange={(v) => formik.setFieldValue('link_type', v)}
              searchable
            />
            <SelectField
              name="shifting_client_category"
              placeholder="Shifting Client Category *"
              options={clientCategories.map((c) => ({
                value: c.id,
                label: c.cat_name,
              }))}
              onChange={(v) => {
                formik.setFieldValue('shifting_client_category', v);
                formik.setFieldValue('shifting_client', '');
              }}
              searchable
            />
            <SelectField
              name="shifting_client"
              placeholder="Shifting Client Name *"
              options={shiftingClients.map((c) => ({
                value: c.id,
                label: c.client_name,
              }))}
              onChange={(v) => formik.setFieldValue('shifting_client', v)}
              searchable
              disabled={!formik.values.shifting_client_category}
            />
            <SelectField
              name="shifting_link_id"
              placeholder="Shifting Work Order Link ID"
              options={shiftingClientLinkIds.map((nttn) => ({
                value: nttn.id,
                label: nttn.nttn_work_order_id,
              }))}
              onChange={(v) => formik.setFieldValue('shifting_link_id', v)}
              searchable
              isClearable
            />
          </div>

          {/* ----- 4-in-a-row : Shifting BW / Amount / Unit Cost / Total ----- */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <InputField
              name="shifting_bw"
              label="Shifting BW *"
              type="number"
              step="1"
              onChange={(e) => {
                formik.handleChange(e);
                lastEdited.current = 'bw';
              }}
            />
            <InputField
              name="shifting_capacity"
              label={currentRateType === 1 ? 'Shifting Amount (Fixed Rate) *' : 'Shifting Amount *'}
              type="number"
              step="0.01"
              onChange={(e) => {
                formik.handleChange(e);
                lastEdited.current = 'capacity';

                // Only show/hide dropdown when user manually types, not when value is auto-calculated
                if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
                  setShowShiftingDropdown(true);
                } else if (e.target.value.trim() === '') {
                  setShowShiftingDropdown(false);
                  formik.setFieldValue('shifting_unit_price_dropdown', '');
                }
              }}
              help={currentRateType === 1 ? 'Fixed Rate - equals Unit Cost' : 'Auto-calculated (BW × Unit Rate)'}
              disabled={currentRateType === 1}
            />
            {showShiftingDropdown && (
              <SelectField
                name="shifting_unit_price_dropdown"
                placeholder="Select Unit Price"
                options={nttnRatesOptions.map((r) => ({
                  label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
                  value: r.id,
                }))}
                onChange={(selectedRateId) => {
                  formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
                  
                  // Find and set the unit cost immediately
                  const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
                  if (selectedRate) {
                    formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
                    console.log('💰 Selected Rate:', selectedRate.rate, 'for range:', selectedRate.bw_range_from, '-', selectedRate.bw_range_to);
                  }

                  lastEdited.current = 'capacity';
                }}
                searchable
              />
            )}
            {!showShiftingDropdown && (
              <InputField
                name="shifting_unit_cost"
                label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
                type="number"
                step="0.01"
                disabled
              />
            )}

            <InputField
              name="total_shifting_cost"
              label="Total Shifting Cost"
              type="number"
              step="0.01"
              className="hidden"
              disabled
            />
            <InputField
              name="target_total_bw"
              label="After-Shifting Capacity"
              type="number"
              step="0.01"
              disabled
            />
          </div>

          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <SelectField
              name="reason_id"
              placeholder="Shift Reason"
              options={reasonsOptions.map((nttn) => ({
                value: nttn.id,
                label: nttn.reason,
              }))}
              onChange={(v) => formik.setFieldValue('reason_id', v)}
              searchable
              isClearable
            />
            <InputField name="remarks" label="Remarks" type="text" />
            <DatePickerField
              name="submission_date"
              placeholder="Submission Date"
              field={{ name: 'submission_date', value: formik.values.submission_date }}
              form={formik}
            />
          </div>
        </FormSection>

        {/* Actions */}
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
  );
};

export default ShiftCapacityForm;
