// src/components/client/ClientForm.jsx  (drop-in replacement)
import React, { useEffect, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import { ArrowLeft } from 'lucide-react';

import Button from '../ui/Button';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import { clientValidation } from '../../validations/clientValidation';

import { fetchDivisions, fetchDistricts, fetchThanas } from '../../services/utils';
import { fetchCategories } from '../../services/category';
import {
    fetchDistrictDivisionWise,
    fetchSBUListCategoryWise,
    fetchThanaDistrictWise,
} from '../../services/client';

/* ---------- section wrapper ---------- */
const FormSection = ({ title, children }) => (
    <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
        <legend className="px-2 text-xl font-semibold text-gray-900">{title}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">{children}</div>
    </fieldset>
);

/* ---------- default empty shape ---------- */
const DEFAULT_VALUES = {
    client_name: '',
    cat_id: '',
    sbu_id: '',
    division_id: '',
    district_id: '',
    thana_id: '',
    address: '',
};

/* ---------- robust normalize & sanitize ---------- */
const normalizeList = (res, idKey = 'id', labelKey = 'name') => {
    let arr = [];
    if (!res) arr = [];
    else if (Array.isArray(res)) arr = res;
    else if (res.results && Array.isArray(res.results)) arr = res.results;
    else if (res.data && Array.isArray(res.data)) arr = res.data;
    else if (typeof res === 'object') {
        const vals = Object.values(res).filter((v) => Array.isArray(v));
        if (vals.length) arr = vals[0];
        else arr = Object.values(res).filter((v) => typeof v === 'object');
    }

    const seen = new Set();
    return arr.reduce((out, o, i) => {
        const rawObj = typeof o === 'object' && o !== null ? o : { label: String(o), value: o };
        let candidate =
            rawObj[idKey] ?? rawObj.id ?? rawObj.code ?? rawObj.value ?? rawObj.label ?? rawObj.name ?? null;
        if (candidate === '' || candidate === null || candidate === undefined) {
            candidate = `tmp-${idKey}-${i}`;
        }
        const valueKey = String(candidate);
        if (seen.has(valueKey)) return out;
        seen.add(valueKey);
        const label =
            rawObj[labelKey] ?? rawObj.name ?? rawObj.label ?? (rawObj.value !== undefined ? String(rawObj.value) : `Option ${i}`);
        out.push({ ...rawObj, id: rawObj.id ?? valueKey, value: candidate, label: String(label) });
        return out;
    }, []);
};

const ClientForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
    /* -------------------- local state -------------------- */
    const [categories, setCategories] = useState([]);
    const [sbuOpts, setSbuOpts] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [thanas, setThanas] = useState([]);

    const [loadingCat, setLoadingCat] = useState(false);
    const [loadingSbu, setLoadingSbu] = useState(false);
    const [loadingDis, setLoadingDis] = useState(false);
    const [loadingTha, setLoadingTha] = useState(false);
    const [loadingMasters, setLoadingMasters] = useState(false);

    /* -------------------- formik -------------------- */
    const formik = useFormik({
        initialValues: { ...DEFAULT_VALUES, ...initialValues },
        validationSchema: clientValidation,
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            console.log('[TELEMETRY] onSubmit fired with:', values);
            try {
                await onSubmit(values, helpers);
                console.log('[TELEMETRY] user onSubmit resolved');
            } catch (e) {
                console.error('[TELEMETRY] user onSubmit threw:', e);
            }
        },
    });

    /* -------------------- telemetry -------------------- */
    useEffect(() => { window._formik = formik; }, [formik]);
    useEffect(() => {
        console.log('[TELEMETRY] errors:', formik.errors, 'isValid:', formik.isValid, 'touched:', formik.touched);
    }, [formik.errors, formik.isValid, formik.touched]);
    useEffect(() => {
        const handler = (e) => {
            if (e.target?.matches('form')) {
                console.log('[TELEMETRY] native submit event intercepted; defaultPrevented?', e.defaultPrevented);
            }
        };
        document.addEventListener('submit', handler, true);
        return () => document.removeEventListener('submit', handler, true);
    }, []);

    /* -------------------- side effects -------------------- */
    useEffect(() => {
        let active = true;
        const loadMasters = async () => {
            setLoadingMasters(true); setLoadingCat(true);
            try {
                const [catsRes, divsRes, distsRes, thasRes] = await Promise.all([
                    fetchCategories(), fetchDivisions(), fetchDistricts(), fetchThanas(),
                ]);
                if (!active) return;
                setCategories(normalizeList(catsRes, 'id', 'cat_name'));
                setDivisions(normalizeList(divsRes, 'id', 'division_name'));
                setDistricts(normalizeList(distsRes, 'id', 'district_name'));
                setThanas(normalizeList(thasRes, 'id', 'thana_name'));
            } catch (e) {
                console.error('loadMasters error:', e);
                showToast?.error?.(e?.response?.data?.message || 'Failed to load master data');
            } finally { if (active) { setLoadingMasters(false); setLoadingCat(false); } }
        };
        loadMasters();
        return () => { active = false; };
    }, [showToast]);

    useEffect(() => {
        let active = true;
        if (!formik.values.cat_id) { setSbuOpts([]); formik.setFieldValue('sbu_id', '', false); return; }
        setLoadingSbu(true);
        fetchSBUListCategoryWise(formik.values.cat_id)
            .then((r) => { if (active) setSbuOpts(normalizeList(r, 'id', 'sbu_name')); })
            .catch((e) => {
                console.error('fetchSBUListCategoryWise error:', e);
                showToast.error(e?.response?.data?.message || 'Could not load SBUs');
                if (active) setSbuOpts([]);
            })
            .finally(() => { if (active) setLoadingSbu(false); });
        return () => { active = false; };
    }, [formik.values.cat_id, showToast]);

    useEffect(() => {
        let active = true;
        if (!formik.values.division_id) { setDistricts([]); formik.setFieldValue('district_id', '', false); return; }
        setLoadingDis(true);
        fetchDistrictDivisionWise(formik.values.division_id)
            .then((r) => { if (active) setDistricts(normalizeList(r, 'id', 'district_name')); })
            .catch((e) => {
                console.error('fetchDistrictDivisionWise error:', e);
                showToast.error(e?.response?.data?.message || 'Could not load districts');
                if (active) setDistricts([]);
            })
            .finally(() => { if (active) setLoadingDis(false); });
        return () => { active = false; };
    }, [formik.values.division_id, showToast]);

    useEffect(() => {
        let active = true;
        if (!formik.values.district_id) { setThanas([]); formik.setFieldValue('thana_id', '', false); return; }
        setLoadingTha(true);
        fetchThanaDistrictWise(formik.values.district_id)
            .then((r) => { if (active) setThanas(normalizeList(r, 'id', 'thana_name')); })
            .catch((e) => {
                console.error('fetchThanaDistrictWise error:', e);
                showToast.error(e?.response?.data?.message || 'Could not load thanas');
                if (active) setThanas([]);
            })
            .finally(() => { if (active) setLoadingTha(false); });
        return () => { active = false; };
    }, [formik.values.district_id, showToast]);

    /* -------------------- render -------------------- */
    return (
        <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="p-8 bg-gray-100 min-h-screen space-y-6">
                <div className="flex items-center space-x-3 mb-6 md:mb-8">
                    <Button variant="icon" type="button" onClick={onCancel} title="Go Back" className="p-1 text-gray-600 hover:text-gray-900 transition-transform hover:scale-110">
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Client' : 'Add Client'}</h1>
                        <p className="text-gray-500">Fill in the details to {isEditMode ? 'update' : 'add a new'} client record.</p>
                    </div>
                </div>

                <FormSection title="Client Information">
                    <InputField name="client_name" label="Client Name *" placeholder="Enter client name" />
                    <SelectField name="cat_id" label="Category *" options={categories} valueKey="id" labelKey="cat_name" disabled={loadingCat || loadingMasters} required />
                    <SelectField name="sbu_id" label="SBU *" options={sbuOpts} valueKey="id" labelKey="sbu_name" disabled={loadingSbu || !formik.values.cat_id} required />
                    <SelectField name="division_id" label="Division *" options={divisions} valueKey="id" labelKey="division_name" disabled={loadingMasters} required />
                    <SelectField name="district_id" label="District *" options={districts} valueKey="id" labelKey="district_name" disabled={loadingDis || !formik.values.division_id} required />
                    <SelectField name="thana_id" label="Thana *" options={thanas} valueKey="id" labelKey="thana_name" disabled={loadingTha || !formik.values.district_id} required />
                    <div className="md:col-span-2">
                        <InputField name="address" label="Address" as="textarea" rows={3} />
                    </div>
                </FormSection>

                <div className="flex w-full justify-end mt-8 space-x-3">
                    <Button intent="cancel" type="button" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" intent="submit" loading={formik.isSubmitting}>Save</Button>
                </div>
            </form>
        </FormikProvider>
    );
};

export default ClientForm;