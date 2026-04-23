// src/components/roles/PermissionManager.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { groupPermissions, ACTION_NAME_MAP } from '../../utils';
import Button from '../ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';

// Helper component for the permission checkbox/label
const PermissionCheckbox = React.memo(({ perm, isChecked, togglePermission, friendlyName }) => (
    <label 
        key={perm.id} 
        className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-150"
        style={{
            backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.1)' : 'white',
            borderColor: isChecked ? 'rgba(59, 130, 246, 0.4)' : '#e5e7eb'
        }}
    >
        <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm mr-3"
            checked={isChecked}
            onChange={(e) => togglePermission(perm, e.target.checked)}
        />
        {/* Tooltip for the technical permission name */}
        <span className="text-sm font-medium truncate" title={perm.name}>{friendlyName}</span>
    </label>
));

function PermissionManager({ allPermissions, role, onBack, addToast }) {
  const queryClient = useQueryClient();
  const api = useApi();
  
  // Use Formik to manage the local state of selected permissions before saving
  const initialPermissions = role.permissions ? role.permissions : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [openGroupKeys, setOpenGroupKeys] = useState(() => new Set(groupPermissions(allPermissions).map(g => g.group.key))); // Open all by default

  const groupedPermissions = useMemo(() => groupPermissions(allPermissions), [allPermissions]);
  
  // Mutation for syncing permissions
  const syncPermissionsMutation = useMutation({
    mutationFn: (values) => {
        const permissionNames = values.permissions.map(p => p.name);
        // Assuming the API has a dedicated endpoint for syncing role permissions
        return api.syncRolePermissions(role.id, { permissions: permissionNames });
    },
    onSuccess: () => {
        // Invalidate both the roles query (to get updated role permissions) and potentially the current role's data
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['roles', role.id] });
        addToast(`Permissions for role '${role.name}' updated successfully.`, "success");
    },
    onError: (error) => {
        console.error("Failed to sync role permissions:", error);
        addToast(`Failed to save permissions: ${error.message}`, "error");
    },
  });

  const getFriendlyName = (action) => ACTION_NAME_MAP[action] || action.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
            <Button variant="ghost" leftIcon={ArrowLeft} onClick={onBack}>
                Back to Roles List
            </Button>
            <h1 className="text-3xl font-bold">Manage Permissions for: <span className="text-primary">{role.name}</span></h1>
        </div>
      </div>

      <Formik
        initialValues={{ permissions: initialPermissions }}
        onSubmit={(values) => syncPermissionsMutation.mutate(values)}
      >
        {({ values, setFieldValue }) => {
          
          // Utility to check if a permission object is currently in the Formik state array
          const isPermissionChecked = (permission) => {
            return values.permissions.some(p => p.id === permission.id);
          };
          
          // Toggles a single permission in the Formik state
          const togglePermission = (permission, isChecked) => {
            if (isChecked) {
              setFieldValue("permissions", [...values.permissions, permission]);
            } else {
              setFieldValue("permissions", values.permissions.filter(p => p.id !== permission.id));
            }
          };

          // Toggles ALL permissions within a feature group
          const toggleGroup = (groupStructure, isChecked) => {
            let newPermissions = [...values.permissions];
            const groupPerms = groupStructure.permissions.map(s => s.perm);

            if (isChecked) {
              groupPerms.forEach(p => {
                if (!isPermissionChecked(p)) {
                  newPermissions.push(p);
                }
              });
            } else {
              const groupIds = groupPerms.map(p => p.id);
              newPermissions = newPermissions.filter(p => !groupIds.includes(p.id));
            }
            setFieldValue("permissions", newPermissions);
          };
          
          // Global Toggle Logic
          const allPermissionsCount = allPermissions.length;
          const selectedCount = values.permissions.length;
          const isAllSelected = allPermissionsCount === selectedCount;
          const isIndeterminate = selectedCount > 0 && !isAllSelected;

          const toggleAll = (e) => {
            // Get the full list of permissions objects to sync.
            const allPermsObjects = groupedPermissions.flatMap(g => g.permissions.map(p => p.perm));
            setFieldValue("permissions", e.target.checked ? allPermsObjects : []);
          }
          
          // Filter permissions based on search term
          const filteredGroups = useMemo(() => {
            if (!searchTerm) return groupedPermissions;
            
            const lowerSearch = searchTerm.toLowerCase();
            
            return groupedPermissions
              .map(group => {
                const filteredPermissions = group.permissions.filter(item => 
                  item.resource.toLowerCase().includes(lowerSearch) ||
                  item.action.toLowerCase().includes(lowerSearch) ||
                  getFriendlyName(item.action).toLowerCase().includes(lowerSearch)
                );
                
                if (group.group.name.toLowerCase().includes(lowerSearch) || filteredPermissions.length > 0) {
                  return { ...group, permissions: filteredPermissions };
                }
                return null;
              })
              .filter(Boolean);
          }, [groupedPermissions, searchTerm]);

          // Handle Accordion toggling
          const toggleAccordion = (key) => {
            const newKeys = new Set(openGroupKeys);
            if (newKeys.has(key)) {
              newKeys.delete(key);
            } else {
              newKeys.add(key);
            }
            setOpenGroupKeys(newKeys);
          };

          return (
            <Form className="space-y-6">
                
              {/* Search and Global Toggle Header - Sticky for better UX */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-4 border rounded-lg bg-white shadow-md">
                <input
                  type="text"
                  placeholder="Filter permissions by name or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleAll}
                  />
                  <span className="font-semibold text-base">
                    Grant All ({selectedCount} / {allPermissionsCount})
                  </span>
                </label>
              </div>

              {/* Accordion Groups */}
              <div className="border rounded-lg divide-y">
                {filteredGroups.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No permissions found matching "{searchTerm}".
                  </div>
                )}
                
                {filteredGroups.map(({ group, permissions }) => {
                  const groupSelectedCount = permissions.filter(item => isPermissionChecked(item.perm)).length;
                  const isGroupAllSelected = groupSelectedCount === permissions.length;
                  const isGroupIndeterminate = groupSelectedCount > 0 && !isGroupAllSelected;
                  const isOpen = openGroupKeys.has(group.key) || searchTerm;

                  const readPerms = permissions.filter(p => ['index', 'show', 'filter'].includes(p.action));
                  const writePerms = permissions.filter(p => ['store', 'update', 'sync-permissions', 'update-roles', 'generate'].includes(p.action));
                  const deletePerms = permissions.filter(p => p.action === 'destroy');
                  
                  return (
                    <div key={group.key} className="bg-white">
                      {/* Group Header */}
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition duration-150"
                        onClick={() => toggleAccordion(group.key)}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-base-content">{group.name}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                             ({groupSelectedCount} / {permissions.length} actions)
                            <span className="tooltip tooltip-right" data-tip={group.description}>
                              <HelpCircle className="w-4 h-4 text-gray-400" />
                            </span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Select All Checkbox for Group */}
                          <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary"
                              checked={isGroupAllSelected}
                              ref={input => { if (input) input.indeterminate = isGroupIndeterminate; }}
                              onChange={(e) => toggleGroup({ group, permissions }, e.target.checked)}
                            />
                            <span>Select All</span>
                          </label>
                          
                          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </div>

                      {/* Permission List (The Body) - Grid layout for decongestion */}
                      {isOpen && (
                        <div className="p-6 bg-gray-50 flex space-x-6">
                            
                            {/* 1. Viewing Section (Low Risk) */}
                            <div className="flex-1 min-w-0 space-y-3">
                                <h4 className="font-semibold text-sm text-gray-700">Viewing & Filtering Access</h4>
                                <div className="space-y-2">
                                    {readPerms.map(item => (
                                        <PermissionCheckbox
                                            key={item.perm.id}
                                            perm={item.perm}
                                            isChecked={isPermissionChecked(item.perm)}
                                            togglePermission={togglePermission}
                                            friendlyName={getFriendlyName(item.action)}
                                        />
                                    ))}
                                    {readPerms.length === 0 && <p className="text-xs text-gray-400">No viewing permissions defined.</p>}
                                </div>
                            </div>
                            
                            {/* 2. Modification Section (Medium Risk) */}
                            <div className="flex-1 min-w-0 space-y-3 border-x px-6">
                                <h4 className="font-semibold text-sm text-gray-700">Creation & Modification Actions</h4>
                                <div className="space-y-2">
                                    {writePerms.map(item => (
                                        <PermissionCheckbox
                                            key={item.perm.id}
                                            perm={item.perm}
                                            isChecked={isPermissionChecked(item.perm)}
                                            togglePermission={togglePermission}
                                            friendlyName={getFriendlyName(item.action)}
                                        />
                                    ))}
                                    {writePerms.length === 0 && <p className="text-xs text-gray-400">No modification permissions defined.</p>}
                                </div>
                            </div>

                            {/* 3. Deletion Section (High Risk) */}
                            <div className="w-1/5 min-w-[150px] space-y-3 pl-6">
                                <h4 className="font-semibold text-sm text-red-600">High Risk: Deletion</h4>
                                <div className="space-y-2">
                                    {deletePerms.map(item => (
                                        <PermissionCheckbox
                                            key={item.perm.id}
                                            perm={item.perm}
                                            isChecked={isPermissionChecked(item.perm)}
                                            togglePermission={togglePermission}
                                            friendlyName={getFriendlyName(item.action)}
                                        />
                                    ))}
                                    {deletePerms.length === 0 && <p className="text-xs text-gray-400">No deletion permissions defined.</p>}
                                </div>
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end pt-4 border-t sticky bottom-0 bg-white">
                <Button
                  type="submit"
                  intent="primary"
                  loading={syncPermissionsMutation.isPending}
                  loadingText="Saving Permissions..."
                >
                  Save Permissions
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default PermissionManager;