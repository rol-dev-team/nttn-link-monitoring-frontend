import React, { useEffect, useState } from "react";          // add useEffect & useState
import { useFormik, FormikProvider } from "formik";
import { ArrowLeft } from "lucide-react";

import Button from "../ui/Button";                            // import button
import InputField from "../fields/InputField";
import SelectField from "../fields/SelectField";      // import selector
import { CategorySchema } from "../../validations/categoryValidation";
import { fetchSBUs } from "../../services/sbu";              // SBU endpoint

const CategoryForm = ({ initialValues, isEditMode, onSubmit, onCancel, showToast }) => {
    /* ---------- local state ---------- */
    const [sbuOptions, setSbuOptions] = useState([]);       // dropdown options

    /* ---------- bootstrap SBUs ---------- */
    useEffect(() => {
        fetchSBUs()
            .then((res) =>
                setSbuOptions(res.map((s) => ({ value: s.id, label: s.sbu_name })))
            )
            .catch((e) =>
                showToast?.(e?.message || "Could not load SBUs", "error")
            );
    }, [showToast]);

    /* ---------- formik ---------- */
    const formik = useFormik({
        initialValues: {
            sbu_id: "",          // SBU foreign-key
            cat_name: "",        // category name
            ...initialValues,
        },
        validationSchema: CategorySchema,
        enableReinitialize: true,
        onSubmit,
    });

    return (
        <FormikProvider value={formik}>
            <form
                onSubmit={formik.handleSubmit}
                className="p-8 bg-gray-100 min-h-screen space-y-6"
            >
                {/* header – unchanged */}
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
                            {isEditMode ? "Edit Category" : "Add Category"}
                        </h1>
                        <p className="text-gray-500">
                            Fill in the details to {isEditMode ? "update" : "add a new"} client category.
                        </p>
                    </div>
                </div>

                {/* Form fields – SBU first, then category name */}
                <fieldset className="col-span-full border-t border-gray-300 pt-6 mt-6">
                    <legend className="px-2 text-xl font-semibold text-gray-900">Category Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                        {/* SBU selector */}
                        <SelectField
                            name="sbu_id"
                            label="SBU *"
                            options={sbuOptions}
                            onChange={(v) => formik.setFieldValue("sbu_id", v)}
                            searchable
                        />
                        {/* Category name */}
                        <InputField
                            name="cat_name"
                            label="Category Name *"
                            placeholder="Enter category name"
                        />
                    </div>
                </fieldset>

                {/* Actions – unchanged */}
                <div className="flex w-full justify-end mt-8 space-x-3">
                    <Button intent="cancel" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" intent="submit">
                        Save
                    </Button>
                </div>
            </form>
        </FormikProvider>
    );
};

export default CategoryForm;