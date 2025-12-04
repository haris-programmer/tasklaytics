/**
 * Permission constants and role-based access control
 */

export const PERMISSIONS = {
  // Workspace permissions
  VIEW_WORKSPACE: 'view_workspace',
  EDIT_WORKSPACE: 'edit_workspace',
  DELETE_WORKSPACE: 'delete_workspace',
  MANAGE_MEMBERS: 'manage_members',

  // Task permissions
  VIEW_TASKS: 'view_tasks',
  CREATE_TASKS: 'create_tasks',
  EDIT_TASKS: 'edit_tasks',
  DELETE_TASKS: 'delete_tasks',
  MOVE_TASKS: 'move_tasks',
  ASSIGN_TASKS: 'assign_tasks',

  // Comment permissions
  VIEW_COMMENTS: 'view_comments',
  ADD_COMMENTS: 'add_comments',
  EDIT_OWN_COMMENTS: 'edit_own_comments',
  DELETE_OWN_COMMENTS: 'delete_own_comments',
  DELETE_ANY_COMMENTS: 'delete_any_comments',

  // Document permissions
  VIEW_DOCS: 'view_docs',
  CREATE_DOCS: 'create_docs',
  EDIT_DOCS: 'edit_docs',
  DELETE_DOCS: 'delete_docs',

  // File permissions
  VIEW_FILES: 'view_files',
  UPLOAD_FILES: 'upload_files',
  DELETE_FILES: 'delete_files',

  // AI permissions
  USE_AI: 'use_ai',
  AI_CREATE_TASKS: 'ai_create_tasks',
  AI_MODIFY_WORKSPACE: 'ai_modify_workspace',

  // History permissions
  VIEW_HISTORY: 'view_history',
  UNDO_CHANGES: 'undo_changes',
  COMMIT_CHANGES: 'commit_changes',

  // Flow permissions
  VIEW_FLOWS: 'view_flows',
  CREATE_FLOWS: 'create_flows',
  EDIT_FLOWS: 'edit_flows',
  DELETE_FLOWS: 'delete_flows',
  ATTACH_FLOWS: 'attach_flows',

  // Admin permissions
  ADMIN_SETTINGS: 'admin_settings',
  BILLING: 'billing'
};

/**
 * Role definitions with their permissions
 */
const ROLE_PERMISSIONS = {
  viewer: [
    PERMISSIONS.VIEW_WORKSPACE,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.VIEW_DOCS,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.VIEW_FLOWS
  ],

  commenter: [
    PERMISSIONS.VIEW_WORKSPACE,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.ADD_COMMENTS,
    PERMISSIONS.EDIT_OWN_COMMENTS,
    PERMISSIONS.DELETE_OWN_COMMENTS,
    PERMISSIONS.VIEW_DOCS,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.VIEW_FLOWS
  ],

  contributor: [
    PERMISSIONS.VIEW_WORKSPACE,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.CREATE_TASKS,
    PERMISSIONS.EDIT_TASKS,
    PERMISSIONS.MOVE_TASKS,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.ADD_COMMENTS,
    PERMISSIONS.EDIT_OWN_COMMENTS,
    PERMISSIONS.DELETE_OWN_COMMENTS,
    PERMISSIONS.VIEW_DOCS,
    PERMISSIONS.EDIT_DOCS,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.USE_AI,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.UNDO_CHANGES,
    PERMISSIONS.VIEW_FLOWS
  ],

  project_lead: [
    PERMISSIONS.VIEW_WORKSPACE,
    PERMISSIONS.EDIT_WORKSPACE,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.CREATE_TASKS,
    PERMISSIONS.EDIT_TASKS,
    PERMISSIONS.DELETE_TASKS,
    PERMISSIONS.MOVE_TASKS,
    PERMISSIONS.ASSIGN_TASKS,
    PERMISSIONS.VIEW_COMMENTS,
    PERMISSIONS.ADD_COMMENTS,
    PERMISSIONS.EDIT_OWN_COMMENTS,
    PERMISSIONS.DELETE_OWN_COMMENTS,
    PERMISSIONS.DELETE_ANY_COMMENTS,
    PERMISSIONS.VIEW_DOCS,
    PERMISSIONS.CREATE_DOCS,
    PERMISSIONS.EDIT_DOCS,
    PERMISSIONS.DELETE_DOCS,
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.DELETE_FILES,
    PERMISSIONS.USE_AI,
    PERMISSIONS.AI_CREATE_TASKS,
    PERMISSIONS.VIEW_HISTORY,
    PERMISSIONS.UNDO_CHANGES,
    PERMISSIONS.COMMIT_CHANGES,
    PERMISSIONS.VIEW_FLOWS,
    PERMISSIONS.CREATE_FLOWS,
    PERMISSIONS.EDIT_FLOWS,
    PERMISSIONS.ATTACH_FLOWS
  ],

  workspace_owner: [
    // All permissions except org-level
    ...Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.BILLING)
  ],

  org_admin: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function roleHas(role, permission) {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Available roles in order of increasing permissions
 */
export const ROLES = [
  'viewer',
  'commenter',
  'contributor',
  'project_lead',
  'workspace_owner',
  'org_admin'
];

export default {
  PERMISSIONS,
  ROLES,
  roleHas,
  getPermissionsForRole
};
