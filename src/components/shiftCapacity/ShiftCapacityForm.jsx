


import React, { useEffect, useState, useRef } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import { shiftCapacitySchema } from '../../validations/shiftCapacityValidation';

import { fetchNTTNs } from '../../services/nttn';
import { fetchSBUs } from '../../services/sbu';
import { fetchCategoriesBySBU } from '../../services/client';
import { fetchCategories } from '../../services/category';
import { fetchClientsCategoryWise, fetchClientsByNttn } from '../../services/client';
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

const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

const emptyValues = {
  sbu: '',
  nttn_provider: '',
  link_type: '',
  client_category: '',
  client: '',
  nttn_link_id: '',
  capacity: '',
  capacity_cost: '',
  upper_shifting_bw: '',
  shifting_amount_display: '',
  shifting_bw: '',
  shifting_capacity: '',
  after_shifting_capacity: '',
  shifting_client_category: '',
  shifting_client: '',
  shifting_unit_cost: '',
  total_shifting_cost: '',
  shifting_unit_price_dropdown: '',
  submission_date: '',
  reason_id: '',
  remarks: '',
  target_request_capacity: '',
  target_total_bw: '',
};

const ShiftCapacityForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
  const [nttnProviders, setNttnProviders] = useState([]);
  const [sbus, setSbus] = useState([]);
  const [isLoadingSbus, setIsLoadingSbus] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
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
  const [afterShiftingUnitRate, setAfterShiftingUnitRate] = useState(0);
  const [sourceLinkTypeId, setSourceLinkTypeId] = useState(null);
  const [currentRateType, setCurrentRateType] = useState(null);
  const [shiftingRateData, setShiftingRateData] = useState(null);
  const [shiftingWorkOrderRate, setShiftingWorkOrderRate] = useState(0);
  const [shiftingWorkOrderRequestCapacity, setShiftingWorkOrderRequestCapacity] = useState(0);
  const [adjustedAmount, setAdjustedAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastEdited = useRef(null);

  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: shiftCapacitySchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSave(values, resetForm);
    },
  });

  // ✅ FIX: Debug validation errors
  useEffect(() => {
    if (Object.keys(formik.errors).length > 0) {
      console.log('🔴 Validation Errors:', formik.errors);
      console.log('🔴 Touched Fields:', formik.touched);
    }
  }, [formik.errors, formik.touched]);

  /* ---------- Boot: load static data ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const [nttn, cats, linkTypesRes, reasonsRes, sbusRes] = await Promise.all([
          fetchNTTNs(),
          fetchCategories(),
          fetchLinkTypes(),
          fetchReasons(),
          fetchSBUs(),
        ]);
        setNttnProviders(nttn.data);
        setClientCategories(cats.data);
        setLinkTypeOptions(linkTypesRes.data);
        setReasonsOptions(reasonsRes.data);
        const sbusData = sbusRes?.data || sbusRes || [];
        setSbus(sbusData.map((s) => ({ value: s.id, label: s.name || s.sbu_name })));
      } catch (e) {
        showToast?.(e.message || 'Failed to load form data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, [showToast]);

  /* ---------- SBU → categories ---------- */
  useEffect(() => {
    if (!formik.values.sbu) {
      setFilteredCategories([]);
      setClients([]);
      formik.setFieldValue('client_category', '');
      formik.setFieldValue('client', '');
      return;
    }
    setIsLoadingCategories(true);
    fetchCategoriesBySBU(formik.values.sbu)
      .then((res) => setFilteredCategories(res?.data || res || []))
      .catch(() => setFilteredCategories([]))
      .finally(() => setIsLoadingCategories(false));
  }, [formik.values.sbu]);

  /* ---------- NTTN + LinkType → NTTN rate options ---------- */
  useEffect(() => {
    if (!formik.values.nttn_provider || !formik.values.link_type) return;
    getRatesByNttn({
      nttn_id: parseInt(formik.values.nttn_provider),
      link_type_id: parseInt(formik.values.link_type),
    })
      .then((res) => setNttnRatesOptions(res.data))
      .catch((err) => console.log(err));
  }, [formik.values.nttn_provider, formik.values.link_type]);

  /* ---------- shifting_bw auto-rate ---------- */
  useEffect(() => {
    if (formik.values.shifting_unit_price_dropdown) return;
    if (formik.values.shifting_link_id) return;

    if (!formik.values.nttn_provider || !formik.values.link_type || !formik.values.shifting_bw) return;

    getRatesBetweenShiftingBandwidth({
      nttn_id: parseInt(formik.values.nttn_provider),
      link_type_id: parseInt(formik.values.link_type),
      bandwidth: parseFloat(formik.values.shifting_bw),
    })
      .then((res) => {
        formik.setFieldValue('shifting_unit_cost', '');
        setShiftingBandwidthRateRanges(res?.data);
        if (res?.data) {
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : null;
          setCurrentRateType(rateTypeValue);
          setShiftingRateData(res?.data);
          const unitRate = parseFloat(res?.data?.rate) || 0;
          formik.setFieldValue('shifting_unit_cost', unitRate);

          if (rateTypeValue === 1) {
            formik.setFieldValue('shifting_capacity', unitRate.toFixed(2));
          } else if (rateTypeValue === 2) {
            const bw = parseFloat(formik.values.shifting_bw);
            formik.setFieldValue('shifting_capacity', (bw * unitRate).toFixed(2));
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setCurrentRateType(null);
        setShiftingRateData(null);
      });
  }, [
    formik.values.shifting_bw,
    formik.values.nttn_provider,
    formik.values.link_type,
    formik.values.shifting_unit_price_dropdown,
    formik.values.shifting_link_id,
  ]);

  /* ---------- Source: clients ---------- */
  useEffect(() => {
    if (!formik.values.client_category || !formik.values.nttn_provider) {
      setClients([]);
      formik.setFieldValue('client', '');
      return;
    }
    Promise.all([
      fetchClientsCategoryWise(formik.values.client_category),
      fetchClientsByNttn(formik.values.nttn_provider),
    ])
      .then(([catRes, nttnRes]) => {
        const catClients = Array.isArray(catRes) ? catRes : catRes?.data || [];
        const nttnClients = Array.isArray(nttnRes) ? nttnRes : nttnRes?.data || [];
        const nttnClientIds = new Set(nttnClients.map((c) => c.id));
        const filtered = catClients.filter((c) => nttnClientIds.has(c.id));
        setClients(filtered.length > 0 ? filtered : catClients);
      })
      .catch(() => setClients([]));
  }, [formik.values.client_category, formik.values.nttn_provider]);

  /* ---------- Shifting Target: clients ---------- */
  useEffect(() => {
    if (!formik.values.shifting_client_category) {
      setShiftingClients([]);
      formik.setFieldValue('shifting_client', '');
      return;
    }
    fetchClientsCategoryWise(formik.values.shifting_client_category)
      .then((res) => setShiftingClients(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setShiftingClients([]));
  }, [formik.values.shifting_client_category]);

  /* ---------- Source: work orders by client + category ---------- */
  useEffect(() => {
    const { client, client_category } = formik.values;
    if (!client || !client_category) return;

    setNttnLinkIds([]);
    setWorkOrderDetailsData([]);
    formik.setFieldValue('nttn_link_id', '');

    const fetchData = async () => {
      try {
        const { data } = await getWorkOrderCategoryAndClientWise({ cat_id: client_category, client_id: client });
        setNttnLinkIds(data);
        setWorkOrderDetailsData(data);
      } catch (error) {
        console.error('API call failed:', error);
      }
    };
    fetchData();
  }, [formik.values.client, formik.values.client_category]);

  /* ---------- Source: nttn_link_id selected ---------- */
  useEffect(() => {
    if (!formik.values.nttn_link_id) return;
    const filtered = workOrderDetailsData?.find((item) => item.id === formik.values.nttn_link_id);
    if (filtered) {
      const totalCapacityCost = filtered.rate * filtered.request_capacity;
      setShiftingSourceRates(filtered.rate);
      setPrintLinkTypeName(filtered.type_name);
      setSourceLinkTypeId(filtered.link_type_id || filtered.link_type || null);
      console.log('📌 Source link_type_id stored:', filtered.link_type_id || filtered.link_type);
      formik.setFieldValue('capacity', filtered.request_capacity);
      formik.setFieldValue('capacity_cost', parseFloat(totalCapacityCost).toFixed(2) || 0);
    }
  }, [formik.values.nttn_link_id, workOrderDetailsData]);

  /* ---------- Shifting work orders fetch ---------- */
  useEffect(() => {
    const { shifting_client, shifting_client_category, link_type, nttn_provider } = formik.values;
    if (!shifting_client || !shifting_client_category) return;

    setShiftingClientLinkIds([]);
    setShiftingWorkOrderDetailsData([]);
    formik.setFieldValue('shifting_link_id', '');
    setShiftingWorkOrderRate(0);
    setShiftingWorkOrderRequestCapacity(0);

    const fetchShiftingData = async () => {
      try {
        const payload = {
          cat_id: shifting_client_category,
          client_id: shifting_client,
        };
        if (link_type) payload.link_type_id = parseInt(link_type);
        if (nttn_provider) payload.nttn_id = parseInt(nttn_provider);

        const { data } = await getWorkOrderCategoryAndClientWise(payload);
        setShiftingClientLinkIds(data);
        setShiftingWorkOrderDetailsData(data);
        console.log('📋 Shifting work orders fetched:', data);
      } catch (error) {
        console.error('Shifting work orders fetch failed:', error);
      }
    };
    fetchShiftingData();
  }, [
    formik.values.shifting_client,
    formik.values.shifting_client_category,
    formik.values.link_type,
    formik.values.nttn_provider,
  ]);

  /* ---------- When Shifting Work Order selected ---------- */
  useEffect(() => {
    if (!formik.values.shifting_link_id) return;

    const filtered = shiftingWorkOrderDetailsData?.find(
      (item) => item.id === formik.values.shifting_link_id
    );
    if (!filtered) return;

    const woRequestCapacity = parseFloat(filtered.request_capacity) || 0;
    const woRate = parseFloat(filtered.rate) || 0;

    setShiftingWorkOrderRate(woRate);
    setShiftingWorkOrderRequestCapacity(woRequestCapacity);

    formik.setFieldValue('target_request_capacity', woRequestCapacity);
    console.log('📊 Shifting Work Order selected — request_capacity:', woRequestCapacity, '| rate:', woRate);

    const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
    const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;

    formik.setFieldValue('shifting_unit_cost', woRate.toFixed(2));
    console.log('💰 Shifting Unit Cost (from work order rate):', woRate);

    if (lockedShiftingAmount > 0) {
      formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
      console.log('📌 shifting_capacity locked to shifting_amount_display:', lockedShiftingAmount);

      if (woRate > 0) {
        const derivedBW = lockedShiftingAmount / woRate;
        formik.setFieldValue('shifting_bw', Math.floor(derivedBW));
        console.log('📌 shifting_bw = shifting_amount_display / wo_rate:', Math.floor(derivedBW));
      } else {
        formik.setFieldValue('shifting_bw', upperBW);
      }
    } else if (upperBW > 0 && woRate > 0) {
      const derivedAmount = upperBW * woRate;
      formik.setFieldValue('shifting_capacity', derivedAmount.toFixed(2));
      formik.setFieldValue('shifting_bw', upperBW);
    }
  }, [formik.values.shifting_link_id, shiftingWorkOrderDetailsData]);

  /* ---------- upper_shifting_bw → shifting_amount_display ---------- */
  useEffect(() => {
    const upperBW = parseFloat(formik.values.upper_shifting_bw) || 0;
    const upperUnitPrice = parseFloat(shiftingSourceRates) || 0;

    if (upperBW > 0 && upperUnitPrice > 0) {
      const shiftingAmount = upperBW * upperUnitPrice;
      formik.setFieldValue('shifting_amount_display', shiftingAmount.toFixed(2));
    } else {
      formik.setFieldValue('shifting_amount_display', '');
    }
  }, [formik.values.upper_shifting_bw, shiftingSourceRates]);

  /* ---------- shifting_amount_display → shifting_capacity & shifting_bw ---------- */
  useEffect(() => {
    if (!formik.values.shifting_link_id) return;
    const lockedShiftingAmount = parseFloat(formik.values.shifting_amount_display) || 0;
    const woRate = shiftingWorkOrderRate;

    if (lockedShiftingAmount > 0) {
      formik.setFieldValue('shifting_capacity', lockedShiftingAmount.toFixed(2));
      if (woRate > 0) {
        formik.setFieldValue('shifting_bw', Math.floor(lockedShiftingAmount / woRate));
      }
    }
  }, [formik.values.shifting_amount_display, formik.values.shifting_link_id, shiftingWorkOrderRate]);

  /* ---------- target_total_bw calculation ---------- */
  useEffect(() => {
    const targetRequestCapacity = parseFloat(formik.values.target_request_capacity) || 0;
    const shiftingBW = parseFloat(formik.values.shifting_bw) || 0;
    const adj = parseFloat(adjustedAmount);
    const rate = parseFloat(shiftingWorkOrderRate) || 0;

    if (!isNaN(adj) && adjustedAmount !== '' && rate > 0 && shiftingWorkOrderRate) {
      const adj_shifting_bw = Math.ceil(shiftingBW + adj / rate);
      const newTargetTotalBW = targetRequestCapacity + adj_shifting_bw;
      formik.setFieldValue('target_total_bw', newTargetTotalBW);
    } else if (targetRequestCapacity > 0 && shiftingBW > 0) {
      formik.setFieldValue('target_total_bw', targetRequestCapacity + shiftingBW);
    } else {
      formik.setFieldValue('target_total_bw', '');
    }
  }, [formik.values.shifting_bw, formik.values.target_request_capacity, adjustedAmount, shiftingWorkOrderRate]);

  /* ---------- Manual dropdown two-way calc: BW → Amount ---------- */
  useEffect(() => {
    const { shifting_bw, shifting_unit_price_dropdown } = formik.values;
    if (lastEdited.current === 'capacity' || !shifting_bw || !shifting_unit_price_dropdown) return;

    formik.setFieldValue('shifting_capacity', '', false);
    const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
    const unitRate = parseFloat(selectedRateOption?.rate) || 0;
    const bw = parseFloat(shifting_bw);
    if (unitRate <= 0 || bw <= 0) { formik.setFieldValue('shifting_capacity', '', false); return; }

    const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
    const shiftingAmount = rateTypeForDropdown === 1 ? unitRate : bw * unitRate;
    formik.setFieldValue('shifting_capacity', shiftingAmount.toFixed(2), false);
    lastEdited.current = null;
  }, [formik.values.shifting_bw, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

  /* ---------- Manual dropdown two-way calc: Amount → BW ---------- */
  useEffect(() => {
    const { shifting_unit_price_dropdown, shifting_capacity } = formik.values;
    if (
      lastEdited.current === 'bw' ||
      !shifting_unit_price_dropdown ||
      !shifting_capacity ||
      parseFloat(shifting_capacity) <= 0
    ) return;

    formik.setFieldValue('shifting_bw', '', false);
    const selectedRateOption = nttnRatesOptions.find((item) => item.id === shifting_unit_price_dropdown);
    const unitRate = parseFloat(selectedRateOption?.rate);
    const shiftingCost = parseFloat(shifting_capacity);
    if (!unitRate || unitRate <= 0) { formik.setFieldValue('shifting_bw', '', false); return; }

    const rateTypeForDropdown = selectedRateOption?.rate_type ? parseInt(selectedRateOption.rate_type, 10) : 2;
    if (rateTypeForDropdown === 1) { formik.setFieldValue('shifting_bw', '', false); return; }

    const calculatedBW = shiftingCost / unitRate;
    lastEdited.current = 'capacity';
    formik.setFieldValue('shifting_bw', Math.floor(calculatedBW), false);
  }, [formik.values.shifting_capacity, formik.values.shifting_unit_price_dropdown, nttnRatesOptions]);

  /* ---------- After Shifting Capacity + After Shifting Unit Rate + Total Shifting Cost ---------- */
  useEffect(() => {
    const capacity = parseInt(formik.values.capacity) || 0;
    const upperBW = parseInt(formik.values.upper_shifting_bw) || 0;
    const afterShiftingCapacity = capacity - upperBW;

    formik.setFieldValue('after_shifting_capacity', afterShiftingCapacity > 0 ? afterShiftingCapacity : 0, false);

    const fetchAfterShiftingRate = async () => {
      const linkTypeToUse = sourceLinkTypeId || parseInt(formik.values.link_type) || null;
      if (afterShiftingCapacity <= 0 || !formik.values.nttn_provider || !linkTypeToUse) {
        formik.setFieldValue('total_shifting_cost', '0.00', false);
        setAfterShiftingUnitRate(0);
        return;
      }
      try {
        console.log('🔍 After Shifting Rate fetch — bandwidth:', afterShiftingCapacity, '| link_type_id:', linkTypeToUse);
        const res = await getRatesBetweenShiftingBandwidth({
          nttn_id: parseInt(formik.values.nttn_provider),
          link_type_id: linkTypeToUse,
          bandwidth: afterShiftingCapacity,
        });

        if (res?.data && res.data.rate) {
          const fetchedUnitRate = parseFloat(res.data.rate);
          const rateTypeValue = res.data.rate_type ? parseInt(res.data.rate_type, 10) : 2;

          setAfterShiftingUnitRate(fetchedUnitRate);

          const totalShiftingCost =
            rateTypeValue === 1 ? fetchedUnitRate : afterShiftingCapacity * fetchedUnitRate;
          formik.setFieldValue('total_shifting_cost', totalShiftingCost.toFixed(2), false);
        } else {
          formik.setFieldValue('total_shifting_cost', '0.00', false);
          setAfterShiftingUnitRate(0);
        }
      } catch (error) {
        formik.setFieldValue('total_shifting_cost', '0.00', false);
        setAfterShiftingUnitRate(0);
      }
    };

    fetchAfterShiftingRate();
  }, [
    formik.values.capacity,
    formik.values.upper_shifting_bw,
    formik.values.nttn_provider,
    sourceLinkTypeId,
    formik.values.link_type,
  ]);

  // ✅ FIX: Proper payload construction and submission
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
      // Remove UI-only fields
      const {
        shifting_unit_price_dropdown,
        target_request_capacity,
        upper_shifting_bw,
        shifting_amount_display,
        ...basePayload
      } = values;

      // ✅ Ensure proper data types and include all calculated fields
      const submitPayload = {
        sbu: basePayload.sbu ? parseInt(basePayload.sbu) : null,
        nttn_provider: basePayload.nttn_provider ? parseInt(basePayload.nttn_provider) : null,
        link_type: basePayload.link_type ? parseInt(basePayload.link_type) : null,
        client: basePayload.client ? parseInt(basePayload.client) : null,
        client_category: basePayload.client_category ? parseInt(basePayload.client_category) : null,
        nttn_link_id: basePayload.nttn_link_id ? parseInt(basePayload.nttn_link_id) : null,
        capacity: parseFloat(basePayload.capacity) || 0,
        capacity_cost: parseFloat(basePayload.capacity_cost) || 0,
        shifting_bw: parseFloat(basePayload.shifting_bw) || 0,
        shifting_capacity: parseFloat(basePayload.shifting_capacity) || 0,
        after_shifting_capacity: parseFloat(basePayload.after_shifting_capacity) || 0,
        shifting_unit_cost: parseFloat(basePayload.shifting_unit_cost) || 0,
        total_shifting_cost: parseFloat(basePayload.total_shifting_cost) || 0,
        shifting_client_category: basePayload.shifting_client_category ? parseInt(basePayload.shifting_client_category) : null,
        shifting_client: basePayload.shifting_client ? parseInt(basePayload.shifting_client) : null,
        shifting_link_id: basePayload.shifting_link_id ? parseInt(basePayload.shifting_link_id) : null,
        target_total_bw: parseFloat(basePayload.target_total_bw) || 0,
        submission_date: basePayload.submission_date || null,
        reason_id: basePayload.reason_id ? parseInt(basePayload.reason_id) : null,
        remarks: basePayload.remarks || '',
      };

      console.log('📤 Payload to Backend:', submitPayload);

      const res = await createCapacityShifting(submitPayload);
      showToast?.(res.message || 'Saved successfully', 'success');
      resetForm();
      onCancel();
    } catch (e) {
      console.error('❌ Save failed:', e);
      showToast?.(e.message || 'Save failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Render ---------- */
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
        {/* Header */}
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
            placeholder="NTTN Name *"
            options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
            onChange={(v) => formik.setFieldValue('nttn_provider', v)}
            error={formik.touched.nttn_provider && formik.errors.nttn_provider}
            searchable
          />

          <SelectField
            className="col-span-1 md:col-span-2"
            name="sbu"
            placeholder={`SBU * ${isLoadingSbus ? '(Loading...)' : ''}`}
            options={sbus}
            onChange={(v) => {
              formik.setFieldValue('sbu', v);
              formik.setFieldValue('client_category', '');
              formik.setFieldValue('client', '');
            }}
            error={formik.touched.sbu && formik.errors.sbu}
            searchable
            disabled={isLoadingSbus}
          />

          <SelectField
            name="client_category"
            placeholder={`Client Category * ${isLoadingCategories ? '(Loading...)' : ''}`}
            options={filteredCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
            onChange={(v) => {
              formik.setFieldValue('client_category', v);
              formik.setFieldValue('client', '');
            }}
            error={formik.touched.client_category && formik.errors.client_category}
            searchable
            disabled={!formik.values.sbu || isLoadingCategories}
          />
          <SelectField
            className="col-span-1 md:col-span-2"
            name="client"
            placeholder="Client Name *"
            options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
            onChange={(v) => formik.setFieldValue('client', v)}
            error={formik.touched.client && formik.errors.client}
            searchable
            disabled={!formik.values.client_category}
          />
          <SelectField
            className="col-span-1 md:col-span-2"
            name="nttn_link_id"
            placeholder="Work Order Link ID *"
            options={nttnLinkIds.map((nttn) => ({ value: nttn.id, label: nttn.nttn_work_order_id }))}
            onChange={(v) => formik.setFieldValue('nttn_link_id', v)}
            error={formik.touched.nttn_link_id && formik.errors.nttn_link_id}
            searchable
            disabled={!formik.values.client}
          />
        </FormSection>

        {/* ── Shifting BW input + Shifting Amount display ── */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Shifting BW (MB)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter BW to shift"
              value={formik.values.upper_shifting_bw}
              onChange={(e) => {
                const val = e.target.value;
                formik.setFieldValue('upper_shifting_bw', val);
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Shifting Amount (BW × Unit Rate)
            </label>
            <input
              type="text"
              readOnly
              className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
              placeholder="Auto-calculated"
              value={formik.values.shifting_amount_display || ''}
            />
            {formik.values.upper_shifting_bw && shiftingSourceRates ? (
              <p className="text-xs text-gray-400 mt-0.5">
                {formik.values.upper_shifting_bw} &times; {shiftingSourceRates} (Unit Price) ={' '}
                {formik.values.shifting_amount_display}
              </p>
            ) : formik.values.upper_shifting_bw && !shiftingSourceRates ? (
              <p className="text-xs text-orange-400 mt-0.5">Select a Work Order Link ID first to get Unit Price</p>
            ) : null}
          </div>

          <div />
          <div />
        </div>

        {/* ── Info Panel ── */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 justify-items-center items-start gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Capacity Cost:</strong>{' '}
                {formik.values.capacity_cost || '0.00'}
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
                {shiftingSourceRates || '0.00'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">Link Type:</strong>{' '}
                {printLinkTypeName || 'N/A'}
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

            <div className="flex items-center space-x-2">
              <p>
                <strong className="text-gray-800">After Shifting Unit Rate:</strong>{' '}
                {afterShiftingUnitRate ? afterShiftingUnitRate.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Shifting Target */}
        <FormSection title="Shifting Target">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <SelectField
              name="link_type"
              placeholder="Link Type *"
              options={linkTypeOptions.map((p) => ({ value: p.id, label: p.type_name }))}
              onChange={(v) => {
                formik.setFieldValue('link_type', v);
                formik.setFieldValue('shifting_link_id', '');
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                setShiftingClientLinkIds([]);
                setShiftingWorkOrderDetailsData([]);
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
              }}
              error={formik.touched.link_type && formik.errors.link_type}
              searchable
            />

            <SelectField
              name="shifting_client_category"
              placeholder="Shifting Client Category *"
              options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
              onChange={(v) => {
                formik.setFieldValue('shifting_client_category', v);
                formik.setFieldValue('shifting_client', '');
                formik.setFieldValue('shifting_link_id', '');
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
              }}
              error={formik.touched.shifting_client_category && formik.errors.shifting_client_category}
              searchable
            />

            <SelectField
              name="shifting_client"
              placeholder="Shifting Client Name *"
              options={shiftingClients.map((c) => ({ value: c.id, label: c.client_name }))}
              onChange={(v) => {
                formik.setFieldValue('shifting_client', v);
                formik.setFieldValue('shifting_link_id', '');
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
              }}
              error={formik.touched.shifting_client && formik.errors.shifting_client}
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
              onChange={(v) => {
                formik.setFieldValue('shifting_unit_cost', '');
                formik.setFieldValue('shifting_capacity', '');
                formik.setFieldValue('shifting_bw', '');
                formik.setFieldValue('shifting_unit_price_dropdown', '');
                setShiftingWorkOrderRate(0);
                setShiftingWorkOrderRequestCapacity(0);
                setShowShiftingDropdown(false);
                formik.setFieldValue('shifting_link_id', v);
              }}
              searchable
              isClearable
              disabled={!formik.values.shifting_client}
            />
          </div>

          {/* Row 2: Before/After Shifting fields */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-7 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Before Shifting Capacity
              </label>
              <input
                type="number"
                readOnly
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-filled on Work Order select"
                value={shiftingWorkOrderRequestCapacity || ''}
              />
              <p className="text-xs text-gray-400 mt-0.5">Work order's request_capacity</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Before Shifting Amount
              </label>
              <input
                type="number"
                readOnly
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={
                  shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate
                    ? (shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)
                    : ''
                }
              />
              {shiftingWorkOrderRequestCapacity && shiftingWorkOrderRate ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {shiftingWorkOrderRequestCapacity} &times; {shiftingWorkOrderRate} ={' '}
                  {(shiftingWorkOrderRequestCapacity * shiftingWorkOrderRate).toFixed(2)}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">request_capacity × rate</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Shifting BW *
              </label>
              <input
                type="number"
                readOnly
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-filled"
                value={(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    return Math.ceil(shiftBW + adj / rate);
                  }
                  return shiftBW ? Math.ceil(shiftBW) : '';
                })()}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                {(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    return `${shiftBW} + (${adj} ÷ ${rate}) = ${Math.ceil(shiftBW + adj / rate)}`;
                  }
                  return 'Auto-filled: Shifting Amount ÷ Unit Rate';
                })()}
              </p>
            </div>

            <InputField
              name="shifting_capacity"
              label={`Shifting Amount (BW × ${shiftingWorkOrderRate ? shiftingWorkOrderRate : 'Unit Rate'})`}
              type="number"
              step="0.01"
              disabled={!!formik.values.upper_shifting_bw}
              error={formik.touched.shifting_capacity && formik.errors.shifting_capacity}
              onChange={(e) => {
                if (formik.values.upper_shifting_bw) return;
                formik.handleChange(e);
                lastEdited.current = 'capacity';
                if (e.target.value.trim() !== '' && formik.values.nttn_provider && !showShiftingDropdown) {
                  setShowShiftingDropdown(true);
                } else if (e.target.value.trim() === '') {
                  setShowShiftingDropdown(false);
                  formik.setFieldValue('shifting_unit_price_dropdown', '');
                  formik.setFieldValue('shifting_unit_cost', '');
                }
              }}
              help={
                formik.values.upper_shifting_bw
                  ? `Locked — mirrors Shifting Amount (Unit Rate: ${shiftingWorkOrderRate || 'from work order'})`
                  : 'Enter amount manually, then select unit rate from dropdown'
              }
            />

            {showShiftingDropdown ? (
              <SelectField
                name="shifting_unit_price_dropdown"
                placeholder="Select Unit Price"
                options={nttnRatesOptions.map((r) => ({
                  label: `Price: ${r.rate} || Range: ${r.bw_range_from}-${r.bw_range_to}`,
                  value: r.id,
                }))}
                onChange={(selectedRateId) => {
                  formik.setFieldValue('shifting_unit_price_dropdown', selectedRateId);
                  const selectedRate = nttnRatesOptions.find((r) => r.id === selectedRateId);
                  if (selectedRate) {
                    formik.setFieldValue('shifting_unit_cost', parseFloat(selectedRate.rate).toFixed(2));
                  }
                  lastEdited.current = 'capacity';
                }}
                searchable
              />
            ) : (
              <InputField
                name="shifting_unit_cost"
                label={`Unit Cost ${isLoadingRates ? '(Loading...)' : ''}`}
                type="number"
                step="0.01"
                disabled
                error={formik.touched.shifting_unit_cost && formik.errors.shifting_unit_cost}
                help="Auto-filled from Work Order rate"
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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                After-Shifting Capacity
              </label>
              <input
                type="number"
                readOnly
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    const adjShiftingBW = Math.ceil(shiftBW + adj / rate);
                    return capacity + adjShiftingBW;
                  }
                  return formik.values.target_total_bw || '';
                })()}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                {(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    const adjShiftingBW = Math.ceil(shiftBW + adj / rate);
                    return `${capacity} + ${adjShiftingBW} = ${capacity + adjShiftingBW}`;
                  }
                  return 'Before Shifting Capacity + Shifting BW';
                })()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                After Shifting Amount
              </label>
              <input
                type="number"
                readOnly
                className="w-full border border-gray-200 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated"
                value={(() => {
                  const rate = parseFloat(shiftingWorkOrderRate) || 0;
                  const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                  const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                  const adj = parseFloat(adjustedAmount);
                  if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                    const rawAfter = rate * (capacity + shiftBW);
                    return (rawAfter + adj).toFixed(2);
                  }
                  return shiftingWorkOrderRate && formik.values.target_total_bw
                    ? (shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)
                    : '';
                })()}
              />
              {(() => {
                const rate = parseFloat(shiftingWorkOrderRate) || 0;
                const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                const adj = parseFloat(adjustedAmount);
                if (!isNaN(adj) && adjustedAmount !== '' && rate > 0) {
                  const rawAfter = rate * (capacity + shiftBW);
                  return (
                    <p className="text-xs text-blue-500 mt-0.5">
                      {rawAfter.toFixed(2)} + {adj} = {(rawAfter + adj).toFixed(2)}
                    </p>
                  );
                }
                return shiftingWorkOrderRate && formik.values.target_total_bw ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {shiftingWorkOrderRate} &times; {formik.values.target_total_bw} ={' '}
                    {(shiftingWorkOrderRate * parseFloat(formik.values.target_total_bw)).toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">rate × After Shifting Capacity</p>
                );
              })()}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Adjusted Amount <span className="text-gray-400 font-normal">(manual)</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 8 or -8"
                value={adjustedAmount}
                onChange={(e) => setAdjustedAmount(e.target.value)}
              />
              {adjustedAmount !== '' && shiftingWorkOrderRate && formik.values.target_total_bw ? (() => {
                const rate = parseFloat(shiftingWorkOrderRate) || 0;
                const capacity = parseFloat(formik.values.target_request_capacity) || 0;
                const shiftBW = parseFloat(formik.values.shifting_bw) || 0;
                const rawAfter = rate * (capacity + shiftBW);
                const adj = parseFloat(adjustedAmount) || 0;
                const adjAfter = rawAfter + adj;
                return (
                  <p className="text-xs text-blue-500 mt-0.5">
                    {rawAfter.toFixed(2)} + ({adjustedAmount}) = {adjAfter.toFixed(2)}
                  </p>
                );
              })() : (
                <p className="text-xs text-gray-400 mt-0.5">Enter +/- to adjust After Shifting Amount</p>
              )}
            </div>
          </div>

          {/* Row 3: Reason / Date / Remarks */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <SelectField
              name="reason_id"
              placeholder="Shift Reason"
              options={reasonsOptions.map((nttn) => ({ value: nttn.id, label: nttn.reason }))}
              onChange={(v) => formik.setFieldValue('reason_id', v)}
              error={formik.touched.reason_id && formik.errors.reason_id}
              searchable
              isClearable
            />

            <DatePickerField
              name="submission_date"
              placeholder="Submission Date"
              field={{ name: 'submission_date', value: formik.values.submission_date }}
              form={formik}
            />

            <InputField 
              name="remarks" 
              label="Remarks" 
              type="text"
              error={formik.touched.remarks && formik.errors.remarks}
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
            title={!formik.isValid ? `Form has ${Object.keys(formik.errors).length} error(s)` : 'Click to save'}
          >
            Save
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default ShiftCapacityForm;