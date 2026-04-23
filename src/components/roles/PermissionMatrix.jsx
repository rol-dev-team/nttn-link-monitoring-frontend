// // src/components/roles/PermissionMatrix.jsx
// import React, { useMemo, useState } from 'react';
// import { HelpCircle, ChevronDown, ChevronUp, Eye, Edit3, Trash2, Lock } from 'lucide-react';
// import { groupPermissions, ACTION_NAME_MAP } from '../../utils';

// // Maps action types to a consistent icon for quick visual scanning
// const ACTION_ICON_MAP = {
//   // Read
//   'index': Eye,
//   'show': Eye,
//   'filter': Eye,
//   // Write/Action
//   'store': Edit3,
//   'update': Edit3,
//   'generate': Edit3,
//   'logout': Edit3,
//   'sync-permissions': Edit3,
//   'update-roles': Edit3,
//   // Danger
//   'destroy': Trash2,
// };

// const PermissionCheckbox = ({ perm, isChecked, togglePermission, friendlyName, action, isDanger }) => {
//   const Icon = ACTION_ICON_MAP[action] || Lock;
//   const tooltipContent = `${perm.name}`;

//   return (
//     // CLEANER DESIGN: Removed background/border on default state. Hover is lighter.
//     <label
//       className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-150
//         ${isChecked
//           ? 'bg-blue-100 hover:bg-blue-200 border border-blue-400' // Added light blue background when checked
//           : 'hover:bg-gray-100' // Simple hover effect
//         }
//       `}
//     >
//       <input
//         type="checkbox"
//         className={`checkbox checkbox-sm mr-3 ${isDanger ? 'checkbox-error' : 'checkbox-primary'}`}
//         checked={isChecked}
//         onChange={(e) => togglePermission(perm, e.target.checked)}
//       />

//       <div className="flex items-center">
//         <Icon className={`w-4 h-4 mr-2 ${isDanger ? 'text-red-500' : 'text-primary'}`} />
//         <span
//           className={`text-sm font-medium truncate ${isDanger ? 'text-red-700' : 'text-gray-800'}`}
//           title={tooltipContent}
//         >
//           {friendlyName}
//         </span>
//       </div>
//     </label>
//   );
// };

// function PermissionMatrix({ allPermissions, values, setFieldValue }) {
//   const groupedPermissions = useMemo(() => groupPermissions(allPermissions), [allPermissions]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [openGroupKeys, setOpenGroupKeys] = useState(new Set());

//   const isPermissionChecked = (permission) => values.permissions.some(p => p.id === permission.id);
//   const togglePermission = (permission, isChecked) => {
//     setFieldValue("permissions",
//       isChecked
//         ? [...values.permissions, permission]
//         : values.permissions.filter(p => p.id !== permission.id)
//     );
//   };

//   const toggleGroup = (groupStructure, isChecked) => {
//     let newPermissions = [...values.permissions];
//     const groupPerms = groupStructure.permissions.map(s => s.perm);

//     if (isChecked) {
//       groupPerms.forEach(p => {
//         if (!isPermissionChecked(p)) newPermissions.push(p);
//       });
//     } else {
//       const groupIds = groupPerms.map(p => p.id);
//       newPermissions = newPermissions.filter(p => !groupIds.includes(p.id));
//     }
//     setFieldValue("permissions", newPermissions);
//   };

//   const allPermissionsCount = allPermissions.length;
//   const selectedCount = values.permissions.length;
//   const isAllSelected = allPermissionsCount === selectedCount;
//   const isIndeterminate = selectedCount > 0 && !isAllSelected;

//   const toggleAll = (e) => setFieldValue("permissions", e.target.checked ? allPermissions : []);

//   const toggleAccordion = (key) => {
//     const newKeys = new Set(openGroupKeys);
//     newKeys.has(key) ? newKeys.delete(key) : newKeys.add(key);
//     setOpenGroupKeys(newKeys);
//   };

//   const filteredGroups = useMemo(() => {
//     if (!searchTerm) return groupedPermissions;
//     const lowerSearch = searchTerm.toLowerCase();

//     // Auto-open groups when searching
//     setOpenGroupKeys(new Set(groupedPermissions.map(g => g.group.key)));

//     return groupedPermissions
//       .map(group => {
//         const filteredPermissions = group.permissions.filter(item =>
//           item.resource.toLowerCase().includes(lowerSearch) ||
//           item.action.toLowerCase().includes(lowerSearch) ||
//           (ACTION_NAME_MAP[item.action] || '').toLowerCase().includes(lowerSearch)
//         );
//         if (group.group.name.toLowerCase().includes(lowerSearch) || filteredPermissions.length > 0) {
//           return { ...group, permissions: filteredPermissions };
//         }
//         return null;
//       })
//       .filter(Boolean);
//   }, [groupedPermissions, searchTerm]);

//   const renderSection = (title, data, IconComponent, isDanger = false) => (
//     <div className={`p-4 ${data.length === 0 ? 'hidden' : 'block'}`}>
//       <h4 className={`font-bold text-sm mb-3 flex items-center ${isDanger ? 'text-red-600' : 'text-gray-700'}`}>
//         <span className="mr-2"><IconComponent className="w-4 h-4"/></span>{title}
//       </h4>
//       <div className="grid grid-cols-1 gap-2">
//         {data.map(item => (
//           <PermissionCheckbox
//             key={item.perm.id}
//             perm={item.perm}
//             isChecked={isPermissionChecked(item.perm)}
//             togglePermission={togglePermission}
//             friendlyName={ACTION_NAME_MAP[item.action] || item.action}
//             action={item.action}
//             isDanger={isDanger}
//           />
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-4">

//       {/* Search and Global Toggle Header (Stays sticky within the card) */}
//       <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 sticky top-16 z-10">
//         <input
//           type="text"
//           placeholder="Filter permissions (e.g., users, delete)..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="input input-sm input-bordered w-full max-w-sm bg-white"
//         />

//         <label className="flex items-center space-x-2 cursor-pointer">
//           <input
//             type="checkbox"
//             className="checkbox checkbox-primary checkbox-sm"
//             checked={isAllSelected}
//             ref={input => {
//               if (input) input.indeterminate = isIndeterminate;
//             }}
//             onChange={toggleAll}
//           />
//           <span className="font-semibold text-sm">
//             Select All ({selectedCount} / {allPermissionsCount})
//           </span>
//         </label>
//       </div>

//       {/* Accordion/Collapsible Groups */}
//       <div className="border rounded-lg divide-y bg-white">
//         {filteredGroups.length === 0 ? (
//           <div className="p-6 text-center text-gray-500">
//             No modules or permissions found matching **"{searchTerm}"**.
//           </div>
//         ) : (
//           filteredGroups.map(({ group, permissions }) => {
//             const groupSelectedCount = permissions.filter(item => isPermissionChecked(item.perm)).length;
//             const isGroupAllSelected = groupSelectedCount === permissions.length;
//             const isGroupIndeterminate = groupSelectedCount > 0 && !isGroupAllSelected;
//             // Force open if searching
//             const isOpen = openGroupKeys.has(group.key) || searchTerm;

//             const readPerms = permissions.filter(p => p.action === 'index' || p.action === 'show' || p.action === 'filter');
//             const destroyPerms = permissions.filter(p => p.action === 'destroy');
//             const actionPerms = permissions.filter(p => !readPerms.includes(p) && !destroyPerms.includes(p));

//             // Re-combine all permissions for the inner grid to use all columns
//             const allGroupPerms = [...readPerms, ...actionPerms, ...destroyPerms];

//             return (
//               <div key={group.key}>
//                 {/* Group Header */}
//                 <div
//                   className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition duration-150"
//                   onClick={() => toggleAccordion(group.key)}
//                 >
//                   <div className="flex flex-col">
//                     <span className="text-base font-semibold text-gray-800">{group.name}</span>
//                     <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
//                       {group.description}
//                       <span className="tooltip tooltip-right" data-tip={group.description}>
//                         <HelpCircle className="w-3 h-3 text-gray-400 ml-1" />
//                       </span>
//                     </span>
//                   </div>

//                   <div className="flex items-center space-x-4">
//                     <span className="text-sm font-medium text-gray-600">
//                       {groupSelectedCount} / {permissions.length} selected
//                     </span>
//                     <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer" onClick={(e) => e.stopPropagation()}>
//                       <input
//                         type="checkbox"
//                         className="checkbox checkbox-sm checkbox-primary"
//                         checked={isGroupAllSelected}
//                         ref={input => {
//                           if (input) input.indeterminate = isGroupIndeterminate;
//                         }}
//                         onChange={(e) => toggleGroup({ group, permissions }, e.target.checked)}
//                       />
//                     </label>
//                     {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
//                   </div>
//                 </div>

//                 {/* Permission List (The Body) - Use a uniform grid for all permission types */}
//                 {isOpen && (
//                   // CHANGE: Use grid-cols-4/5 on large screens to fill the width
//                   <div className="p-4 bg-gray-50 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
//                     {allGroupPerms.map(item => (
//                        <PermissionCheckbox
//                           key={item.perm.id}
//                           perm={item.perm}
//                           isChecked={isPermissionChecked(item.perm)}
//                           togglePermission={togglePermission}
//                           friendlyName={ACTION_NAME_MAP[item.action] || item.action}
//                           action={item.action}
//                           isDanger={item.action === 'destroy'} // Apply danger styling explicitly for destroy actions
//                         />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

// export default PermissionMatrix;
// src/components/roles/PermissionMatrix.jsx
import React, { useMemo, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Eye, Edit3, Trash2, Lock } from 'lucide-react';
import { groupPermissions, ACTION_NAME_MAP } from '../../utils/permission';

const ACTION_ICON_MAP = {
  // Read
  index: Eye,
  show: Eye,
  filter: Eye,
  // Write/Action
  store: Edit3,
  update: Edit3,
  generate: Edit3,
  logout: Edit3,
  'sync-permissions': Edit3,
  'update-roles': Edit3,
  // Danger
  destroy: Trash2,
};

const PermissionCheckbox = ({
  perm,
  isChecked,
  togglePermission,
  friendlyName,
  action,
  isDanger,
}) => {
  const Icon = ACTION_ICON_MAP[action] || Lock;
  const tooltipContent = `${perm.name}`;

  return (
    <label
      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-150 
        ${isChecked ? 'bg-blue-100 hover:bg-blue-200 border border-blue-400' : 'hover:bg-gray-100'}
      `}
    >
      <input
        type="checkbox"
        className={`checkbox checkbox-sm mr-3 ${isDanger ? 'checkbox-error' : 'checkbox-primary'}`}
        checked={isChecked}
        onChange={(e) => togglePermission(perm, e.target.checked)}
      />

      <div className="flex items-center">
        <Icon className={`w-4 h-4 mr-2 ${isDanger ? 'text-red-500' : 'text-primary'}`} />
        <span
          className={`text-sm font-medium truncate ${isDanger ? 'text-red-700' : 'text-gray-800'}`}
          title={tooltipContent}
        >
          {friendlyName}
        </span>
      </div>
    </label>
  );
};

function PermissionMatrix({ allPermissions, values, setFieldValue }) {
  const groupedPermissions = useMemo(() => groupPermissions(allPermissions), [allPermissions]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroupKeys, setOpenGroupKeys] = useState(new Set());

  const isPermissionChecked = (permission) =>
    values.permissions.some((p) => p.id === permission.id);
  const togglePermission = (permission, isChecked) => {
    setFieldValue(
      'permissions',
      isChecked
        ? [...values.permissions, permission]
        : values.permissions.filter((p) => p.id !== permission.id)
    );
  };

  const toggleGroup = (groupStructure, isChecked) => {
    let newPermissions = [...values.permissions];
    const groupPerms = groupStructure.permissions.map((s) => s.perm);

    if (isChecked) {
      groupPerms.forEach((p) => {
        if (!isPermissionChecked(p)) newPermissions.push(p);
      });
    } else {
      const groupIds = groupPerms.map((p) => p.id);
      newPermissions = newPermissions.filter((p) => !groupIds.includes(p.id));
    }
    setFieldValue('permissions', newPermissions);
  };

  const allPermissionsCount = allPermissions.length;
  const selectedCount = values.permissions.length;
  const isAllSelected = allPermissionsCount === selectedCount;
  const isIndeterminate = selectedCount > 0 && !isAllSelected;

  const toggleAll = (e) => setFieldValue('permissions', e.target.checked ? allPermissions : []);

  const toggleAccordion = (key) => {
    const newKeys = new Set(openGroupKeys);
    newKeys.has(key) ? newKeys.delete(key) : newKeys.add(key);
    setOpenGroupKeys(newKeys);
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm) {
      // If search is cleared, don't change the open keys
      return groupedPermissions;
    }

    const lowerSearch = searchTerm.toLowerCase();

    // Auto-open groups when searching
    setOpenGroupKeys(new Set(groupedPermissions.map((g) => g.group.key)));

    return groupedPermissions
      .map((group) => {
        const filteredPermissions = group.permissions.filter(
          (item) =>
            item.resource.toLowerCase().includes(lowerSearch) ||
            item.action.toLowerCase().includes(lowerSearch) ||
            (ACTION_NAME_MAP[item.action] || '').toLowerCase().includes(lowerSearch)
        );
        if (
          group.group.name.toLowerCase().includes(lowerSearch) ||
          filteredPermissions.length > 0
        ) {
          return { ...group, permissions: filteredPermissions };
        }
        return null;
      })
      .filter(Boolean);
  }, [groupedPermissions, searchTerm]);

  const renderSection = (title, data, IconComponent, isDanger = false) => (
    <div className={`p-4 ${data.length === 0 ? 'hidden' : 'block'}`}>
      <h4
        className={`font-bold text-sm mb-3 flex items-center ${
          isDanger ? 'text-red-600' : 'text-gray-700'
        }`}
      >
        <span className="mr-2">
          <IconComponent className="w-4 h-4" />
        </span>
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {data.map((item) => (
          <PermissionCheckbox
            key={item.perm.id}
            perm={item.perm}
            isChecked={isPermissionChecked(item.perm)}
            togglePermission={togglePermission}
            friendlyName={ACTION_NAME_MAP[item.action] || item.action}
            action={item.action}
            isDanger={isDanger}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Global Toggle Header (Stays sticky within the card) */}
      <div className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 sticky top-16 z-10">
        <input
          type="text"
          placeholder="Filter permissions (e.g., users, delete)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-sm input-bordered w-full max-w-sm bg-white"
        />

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={toggleAll}
          />
          <span className="font-semibold text-sm">
            Select All ({selectedCount} / {allPermissionsCount})
          </span>
        </label>
      </div>

      {/* Accordion/Collapsible Groups */}
      <div className="border rounded-lg divide-y bg-white">
        {filteredGroups.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No modules or permissions found matching **"{searchTerm}"**.
          </div>
        ) : (
          filteredGroups.map(({ group, permissions }) => {
            const groupSelectedCount = permissions.filter((item) =>
              isPermissionChecked(item.perm)
            ).length;
            const isGroupAllSelected = groupSelectedCount === permissions.length;
            const isGroupIndeterminate = groupSelectedCount > 0 && !isGroupAllSelected;

            // Force open if searching
            const isOpen = openGroupKeys.has(group.key) || searchTerm;

            // Re-combine all permissions for the inner grid to use all columns
            const allGroupPerms = permissions;

            return (
              <div key={group.key}>
                {/* Group Header */}
                <div
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition duration-150"
                  onClick={() => toggleAccordion(group.key)}
                >
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-gray-800">{group.name}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      {group.description}
                      <span className="tooltip tooltip-right" data-tip={group.description}>
                        <HelpCircle className="w-3 h-3 text-gray-400 ml-1" />
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600">
                      {groupSelectedCount} / {permissions.length} selected
                    </span>
                    <label
                      className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={isGroupAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isGroupIndeterminate;
                        }}
                        onChange={(e) => toggleGroup({ group, permissions }, e.target.checked)}
                      />
                    </label>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Permission List (The Body) - Uniform Grid to fill available space */}
                {isOpen && (
                  <div className="p-4 bg-gray-50 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {allGroupPerms.map((item) => (
                      <PermissionCheckbox
                        key={item.perm.id}
                        perm={item.perm}
                        isChecked={isPermissionChecked(item.perm)}
                        togglePermission={togglePermission}
                        friendlyName={ACTION_NAME_MAP[item.action] || item.action}
                        action={item.action}
                        isDanger={item.action === 'destroy'}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PermissionMatrix;
