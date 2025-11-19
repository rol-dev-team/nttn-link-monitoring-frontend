export const ACTION_NAME_MAP = {
  // CRUD Actions
  index: 'View List',
  show: 'View Details',
  store: 'Create New',
  update: 'Edit/Update',
  destroy: 'Delete',

  // Special/Custom Actions
  logout: 'Logout Access',
  'sync-permissions': 'Synchronize',
  'update-roles': 'Change Page Roles',
  filter: 'Filter Records',
  generate: 'Generate Report', // Placeholder
};

/**
 * Defines the default logical grouping and display order for permissions.
 * The key must match the resource name extracted from the API (e.g., 'users' from 'users.index').
 */
export const PERMISSION_GROUPS = [
  { key: 'auth', name: 'Authentication', description: 'Basic application access and logout.' },
  {
    key: 'users',
    name: 'User Management',
    description: 'Control creation, deletion, and management of user accounts.',
  },
  {
    key: 'roles',
    name: 'Role Management',
    description: 'Control creation, deletion, and assignment of roles.',
  },
  {
    key: 'permissions',
    name: 'Permission Admin',
    description: 'Manage the core permissions available in the system.',
  },
  {
    key: 'products',
    name: 'Product Management',
    description: 'Manage the catalog of products/services.',
  },
  { key: 'pages', name: 'Content Pages', description: 'Manage static and dynamic content pages.' },
  { key: 'vendors', name: 'Vendor Management', description: 'Manage external vendor information.' },
  { key: 'routers', name: 'Network Routers', description: 'Manage network router configurations.' },
  {
    key: 'router_bw_statistics',
    name: 'BW Statistics',
    description: 'View and manage router bandwidth data.',
  },
  {
    key: 'router_bw_statistics_logs',
    name: 'BW Statistic Logs',
    description: 'View historical router bandwidth logs.',
  },
  // NOTE: Permissions not listed here will be added to an "Other" group automatically.
];

/**
 * Takes the raw flat list of permissions and groups them by feature resource.
 * It also splits the name into the resource key and the action/level.
 * * @param {Array<{name: string, id: number, ...}>} allPermissions - The full list from the API.
 * @returns {Array<{group: Object, permissions: Array<{perm: Object, resource: string, action: string}>}>} - Grouped structure.
 */
export function groupPermissions(allPermissions) {
  const grouped = {};
  const allResourceKeys = new Set();

  // 1. Group the permissions by their full resource key (everything before the last dot)
  allPermissions.forEach((permission) => {
    const parts = permission.name.split('.');

    // The action is the last part
    const action = parts[parts.length - 1];

    // The resource key is everything else
    const resourceKey = parts.slice(0, -1).join('.');

    if (resourceKey) {
      allResourceKeys.add(resourceKey);
      grouped[resourceKey] = grouped[resourceKey] || [];
      grouped[resourceKey].push({
        perm: permission,
        resource: resourceKey,
        action: action,
      });
    }
  });

  // 2. Determine the final groups structure, prioritizing the manual list
  const finalGroups = PERMISSION_GROUPS.slice();

  // Add any resource keys that exist in the data but not in the manual list to the end (e.g., "Other")
  allResourceKeys.forEach((key) => {
    if (!finalGroups.some((g) => g.key === key)) {
      finalGroups.push({
        key,
        name: key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        description: `Permissions for the '${key}' module.`,
      });
    }
  });

  // 3. Map the groups to the final structured array
  return (
    finalGroups
      .map((group) => {
        // Sort permissions in each group to show CRUD actions first in a predictable order
        const sortedPermissions = (grouped[group.key] || []).sort((a, b) => {
          const order = [
            'index',
            'show',
            'filter',
            'store',
            'update',
            'sync-permissions',
            'update-roles',
            'destroy',
          ];
          // Use -1 for not found items to push them to the end
          const indexA = order.indexOf(a.action);
          const indexB = order.indexOf(b.action);
          return (indexA === -1 ? 100 : indexA) - (indexB === -1 ? 100 : indexB);
        });

        return {
          group,
          permissions: sortedPermissions,
        };
      })
      // Only return groups that actually contain permissions
      .filter((group) => group.permissions.length > 0)
  );
}
