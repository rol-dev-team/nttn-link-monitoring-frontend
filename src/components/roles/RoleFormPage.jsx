// src/components/roles/RoleFormPage.jsx

import PermissionMatrix from './PermissionMatrix';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, User, Lock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import Button from '../../components/ui/Button';

const RoleSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Role name is too short!').required('Role name is required'),
  permissions: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required(),
      id: Yup.number().required(),
      guard_name: Yup.string(),
    })
  ),
});

function RoleFormPage({ onClose, role, permissions, addToast }) {
  const isEditing = !!role;
  const api = useApi();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const permissionNames = values.permissions.map((p) => p.name);
      const payload = { ...values, permissions: permissionNames };

      return isEditing ? api.updateRole(role.id, payload) : api.createRole(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
      const message = isEditing ? 'Role updated successfully.' : 'Role created successfully.';
      addToast(message, 'success');
    },
    onError: (error) => {
      console.error('Failed to save role:', error);
      addToast(`Failed to save role: ${error.message}`, 'error');
    },
  });

  const initialValues = {
    name: isEditing ? role.name : '',
    permissions: isEditing && role.permissions ? role.permissions : [],
  };

  return (
    <div className="p-0 h-full w-full bg-gray-50 mt-10">
      {/* HEADER SECTION: Full-Width Sticky Action Bar */}
      <div className="w-full bg-gray-50 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              leftIcon={ArrowLeft}
              onClick={onClose}
              className="text-gray-600 hover:bg-gray-100"
            >
              Back to Roles
            </Button>
            <h1 className="text-2xl font-semibold text-gray-800">
              {isEditing ? `Edit Role: ${role.name}` : 'Create New Role'}
            </h1>
          </div>

          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              intent="save"
              loading={saveMutation.isPending}
              loadingText="Saving..."
              form="role-form"
            >
              Save Role
            </Button>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={RoleSchema}
        onSubmit={(values) => saveMutation.mutate(values)}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form
            id="role-form"
            className="max-w-screen-2xl mx-auto px-8 py-12 grid grid-cols-1 gap-8"
          >
            {/* COLUMN 1: Role Details (20%) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className="text-lg font-bold flex items-center mb-4 text-primary">
                  <User className="w-5 h-5 mr-2" /> Role Details
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Define the descriptive name for this set of users.
                </p>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium">
                      Role Name <span className="text-red-500">*</span>
                    </span>
                  </div>
                  <Field
                    name="name"
                    type="text"
                    placeholder="e.g., Editor, Finance Manager"
                    className="input input-bordered w-full"
                  />
                  {errors.name && touched.name && (
                    <div className="label text-error text-sm mt-1">{errors.name}</div>
                  )}
                </label>
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm">
                <p className="font-semibold text-yellow-800">Don't forget to save!</p>
                <p className="text-sm text-yellow-700">
                  Changes to permissions are not applied until you click "Save Role" at the top.
                </p>
              </div>
            </div>

            {/* COLUMN 2: Permissions Matrix (80%) */}
            <div className="lg:col-span-4">
              <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 h-full">
                <h2 className="text-lg font-bold flex items-center mb-4 text-primary">
                  <Lock className="w-5 h-5 mr-2" /> Module Permissions
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Select the specific actions this role is authorized to perform across each
                  application module. Use the accordion to expand groups and the filter to find
                  permissions quickly.
                </p>

                <PermissionMatrix
                  allPermissions={permissions}
                  values={values}
                  setFieldValue={setFieldValue}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default RoleFormPage;
