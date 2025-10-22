import React, { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import * as Yup from "yup";

import Button from "../ui/Button";
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";

import { BWModificationSchema } from "../../validations/bwModificationValidation";

import { fetchNTTNs } from "../../services/nttn";
import { fetchCategories } from "../../services/category";
import { fetchClientsCategoryWise } from "../../services/client";
import { fetchWorkOrders } from "../../services/workOrder";
import { fetchBandwidthRangesByID } from "../../services/bandwidthRanges";
import { fetchRatesByID } from "../../services/rate";
import { fetchModificationTypes } from "../../services/modificationType";
import { createBWModification, updateBWModification } from "../../services/bwModification";
import { updateWorkOrder } from "../../services/workOrder";

/* ---------- section wrapper (same as SurveyForm) ---------- */
const FormSection = ({ title, children }) => (
  <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
    <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
  </fieldset>
);

/* ---------- empty initial shape ---------- */
const emptyValues = {
  id: "",
  nttn_provider: null,
  modification_type: "",
  client_category: null,
  client: null,
  nttn_link_id: "",
  capacity: "",
  capacity_cost: "",
  shifting_bw: "",
  shifting_capacity: "",
  shifting_unit_cost: "",
  workorder_id: "",
};

const BWModificationForm = ({
  initialValues,
  isEditMode,
  onSubmit,
  onCancel,
  showToast,
}) => {
  const navigate = useNavigate();
  const [nttnProviders, setNttnProviders] = useState([]);
  const [modificationTypes, setModificationTypes] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [bandwidthRanges, setBandwidthRanges] = useState([]);
  const [nttnLinkIds, setNttnLinkIds] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedField, setLockedField] = useState(null);

  /* ---------- formik ---------- */
  const formik = useFormik({
    initialValues: { ...emptyValues, ...initialValues },
    validationSchema: BWModificationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSave(values, resetForm);
    },
  });

  /* ---------- data bootstrap ---------- */
  useEffect(() => {
    const boot = async () => {
      try {
        const [nttn, cats, wos, types] = await Promise.all([
          fetchNTTNs(),
          fetchCategories(),
          fetchWorkOrders(),
          fetchModificationTypes(),
        ]);
        setNttnProviders(nttn);
        setClientCategories(cats);
        setWorkOrders(wos);
        setModificationTypes(types);
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
      .then(setClients)
      .catch(() => setClients([]));
  }, [formik.values.client_category]);

  useEffect(() => {
    const client = formik.values.client;
    const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

    console.log("client:", client, "work-order list:", list);

    if (!client || !list.length) {
      setNttnLinkIds([]);
      return;
    }

    const clientId = Number(client);
    const clientWOs = list.filter(
      (wo) => Number(wo.survey_data?.client_id) === clientId
    );
    const links = [...new Set(clientWOs.map((wo) => wo.nttn_link_id))];

    console.log("matching WOs:", clientWOs, "link IDs:", links);
    setNttnLinkIds(links);
  }, [formik.values.client, workOrders]);

  /* ---------- auto-release lock when field is cleared ---------- */
  useEffect(() => {
    if (lockedField === "bw" && !formik.values.shifting_bw) setLockedField(null);
  }, [formik.values.shifting_bw, lockedField]);

  useEffect(() => {
    if (lockedField === "amount" && !formik.values.shifting_capacity) setLockedField(null);
  }, [formik.values.shifting_capacity, lockedField]);

  /* ---------- auto-fill current capacity & cost when link chosen ---------- */
  useEffect(() => {
    const linkId = formik.values.nttn_link_id;
    const list = Array.isArray(workOrders) ? workOrders : workOrders?.data || [];

    if (!linkId || !list.length) {
      formik.setFieldValue("capacity", "");
      formik.setFieldValue("capacity_cost", "");
      formik.setFieldValue("workorder_id", "");
      return;
    }

    const wo = list.find((w) => w.nttn_link_id === linkId);
    if (wo) {
      formik.setFieldValue("capacity", wo.request_capacity ?? 0);
      formik.setFieldValue("capacity_cost", wo.total_cost_of_request_capacity ?? 0);
      formik.setFieldValue("workorder_id", wo.id);
    } else {
      formik.setFieldValue("capacity", "");
      formik.setFieldValue("capacity_cost", "");
      formik.setFieldValue("workorder_id", "");
    }
  }, [formik.values.nttn_link_id, workOrders]);

  // ✅ FIX: Auto-lock a field in edit mode if it has initial data
  useEffect(() => {
    if (isEditMode && !lockedField) {
      if (formik.values.shifting_bw) {
        setLockedField("bw");
      } else if (formik.values.shifting_capacity) {
        setLockedField("amount");
      }
    }
  }, [isEditMode, formik.values.shifting_bw, formik.values.shifting_capacity, lockedField]);

  /* ---------- unit-rate & amount lock logic ---------- */
  const unitRateFromCurrent = () => {
    const cap = parseFloat(formik.values.capacity);
    const cost = parseFloat(formik.values.capacity_cost);
    if (!isFinite(cap) || !isFinite(cost) || cap <= 0 || cost <= 0) return 0;
    return cost / cap;
  };

  useEffect(() => {
    if (lockedField === "amount") return;
    const bw = parseFloat(formik.values.shifting_bw);
    if (!formik.values.nttn_provider || !bw || !bandwidthRanges.length) {
      formik.setFieldValue("shifting_unit_cost", "");
      return;
    }
    setIsLoadingRates(true);
    (async () => {
      try {
        const range = bandwidthRanges.find(
          (r) => bw >= parseFloat(r.range_from) && bw <= parseFloat(r.range_to)
        );
        if (!range) return;
        const rates = await fetchRatesByID(parseInt(formik.values.nttn_provider), range.id);
        const active = rates.find(
          (rt) =>
            rt.continue_field &&
            rt.status === 1 &&
            new Date(rt.effective_from) <= new Date() &&
            new Date(rt.effective_to) >= new Date()
        );
        formik.setFieldValue("shifting_unit_cost", active ? parseFloat(active.rate) : "");
      } catch {
        formik.setFieldValue("shifting_unit_cost", "");
      } finally {
        setIsLoadingRates(false);
      }
    })();
  }, [formik.values.nttn_provider, formik.values.shifting_bw, bandwidthRanges, lockedField]);

  useEffect(() => {
    if (lockedField === "amount") return;
    const bw = parseFloat(formik.values.shifting_bw);
    const rate = parseFloat(formik.values.shifting_unit_cost);
    if (isFinite(bw) && isFinite(rate) && bw > 0 && rate > 0) {
      formik.setFieldValue("shifting_capacity", (bw * rate).toFixed(2));
    } else if (lockedField !== "amount") {
      formik.setFieldValue("shifting_capacity", "");
    }
  }, [formik.values.shifting_bw, formik.values.shifting_unit_cost, lockedField]);

  useEffect(() => {
    if (lockedField !== "amount") return;
    const amount = parseFloat(formik.values.shifting_capacity);
    const rate = unitRateFromCurrent();
    if (isFinite(amount) && amount > 0 && isFinite(rate) && rate > 0) {
      formik.setFieldValue("shifting_bw", (amount / rate).toFixed(2));
      formik.setFieldValue("shifting_unit_cost", rate.toFixed(2));
    } else {
      formik.setFieldValue("shifting_bw", "");
      formik.setFieldValue("shifting_unit_cost", rate > 0 ? rate.toFixed(2) : "");
    }
  }, [formik.values.shifting_capacity, formik.values.capacity, formik.values.capacity_cost, lockedField]);

  /* ---------- submit ---------- */
  const handleSave = async (values, resetForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        workorder: values.workorder_id,
        nttn_provider: values.nttn_provider,
        modification_type: values.modification_type,
        client_category: values.client_category,
        client: values.client,
        nttn_link_id: values.nttn_link_id,
        capacity: parseFloat(values.capacity) || 0,
        capacity_cost: parseFloat(values.capacity_cost) || 0,
        shifting_bw: parseFloat(values.shifting_bw) || 0,
        shifting_capacity: parseFloat(values.shifting_capacity) || 0,
        shifting_unit_cost: parseFloat(values.shifting_unit_cost) || 0,
      };

      let res;
      if (isEditMode) {
        res = await updateBWModification(values.id, payload);
        showToast?.("BW Modification updated!", "success");
      } else {
        res = await createBWModification(payload);
        showToast?.("BW Modification created!", "success");
      }

      /* update linked work-order with new BW / cost */
      if (values.workorder_id) {
        try {
          const wo = workOrders.find((w) => w.id === parseInt(values.workorder_id));
          if (wo) {
            const newBW = parseFloat(values.shifting_bw) || 0;
            const newUnit = parseFloat(values.shifting_unit_cost) || unitRateFromCurrent();
            await updateWorkOrder(wo.id, {
              ...wo,
              request_capacity: newBW,
              unit_rate: newUnit,
              total_cost_of_request_capacity: (newBW * newUnit).toFixed(2),
            });
          }
        } catch (e) {
          console.error("Work-order update failed:", e);
        }
      }

      resetForm();
      onCancel(); // close form
    } catch (e) {
      showToast?.(e.message || "Save failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <form
        onSubmit={formik.handleSubmit}
        className="p-8 bg-gray-100 min-h-screen space-y-6"
      >
        {/* header – identical to SurveyForm */}
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
              {isEditMode ? "Edit Capacity Shift" : "BW Modification"}
            </h1>
            <p className="text-gray-500">
              Fill in the details to {isEditMode ? "update" : "add a new"} bandwidth modification record.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <FormSection title="Basic Info">
          <SelectField
            name="modification_type"
            label="Modification Type *"
            options={modificationTypes.map((t) => ({
              value: t.modification_type,
              label: t.modification_type,
            }))}
            onChange={(v) => formik.setFieldValue("modification_type", v)}
            searchable
          />
          <SelectField
            name="nttn_provider"
            label="NTTN Provider *"
            options={nttnProviders.map((p) => ({ value: p.id, label: p.nttn_name }))}
            onChange={(v) => formik.setFieldValue("nttn_provider", v)}
            searchable
          />
          <SelectField
            name="client_category"
            label="Client Category *"
            options={clientCategories.map((c) => ({ value: c.id, label: c.cat_name }))}
            onChange={(v) => {
              formik.setFieldValue("client_category", v);
              formik.setFieldValue("client", "");
            }}
            searchable
            disabled={!formik.values.nttn_provider}
          />
          <SelectField
            name="client"
            label="Client Name *"
            options={clients.map((c) => ({ value: c.id, label: c.client_name }))}
            onChange={(v) => formik.setFieldValue("client", v)}
            searchable
            disabled={!formik.values.client_category}
          />
        </FormSection>

        {/* Current Details */}
        <FormSection title="Current Details">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField
              name="nttn_link_id"
              label="NTTN Link ID *"
              options={nttnLinkIds.map((id) => ({ value: id, label: id }))}
              onChange={(v) => formik.setFieldValue("nttn_link_id", v)}
              searchable
              disabled={!formik.values.client}
            />
            <InputField
              name="capacity"
              label="Current Capacity"
              type="number"
              step="0.01"
              disabled
            />
            <InputField
              name="capacity_cost"
              label="Current Capacity Cost"
              type="number"
              step="0.01"
              disabled
            />
          </div>
        </FormSection>

        {/* New Values */}
        <FormSection title="New Values">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              name="shifting_bw"
              label="New BW *"
              type="number"
              step="0.01"
              disabled={lockedField === "amount"}
              onBlur={() => lockedField !== "amount" && setLockedField("bw")}
            />
            <InputField
              name="shifting_capacity"
              label="New Total Amount *"
              type="number"
              step="0.01"
              disabled={lockedField === "bw"}
              onBlur={() => lockedField !== "bw" && setLockedField("amount")}
            />
            <InputField
              name="shifting_unit_cost"
              label={`Unit Cost ${isLoadingRates ? "(Loading...)" : ""}`}
              type="number"
              step="0.01"
              disabled
            />
          </div>
        </FormSection>

        {/* Actions – same bar as SurveyForm */}
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

export default BWModificationForm;