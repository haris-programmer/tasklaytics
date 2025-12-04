import React, { createContext, useContext, useState, useEffect } from 'react';

// Role-based permissions system (unchanged from original)
const ROLE_PERMISSIONS = {
  viewer: ['view'],
  commenter: ['view', 'comments.add'],
  contributor: ['view', 'comments.add', 'tasks.write'],
  project_lead: ['view', 'comments.add', 'tasks.write', 'history.commit'],
  workspace_owner: [
    'view',
    'comments.add',
    'tasks.write',
    'history.commit',
    'ai.configure',
    'workspace.configure'
  ],
  org_admin: [
    'view',
    'comments.add',
    'tasks.write',
    'history.commit',
    'ai.configure',
    'workspace.configure',
    'roles.manage'
  ]
};

/**
 * Check if a role has a specific permission
 */
export function roleHas(role, perm) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['viewer'];
  return perms.includes(perm);
}

// Default configuration - simplified to dark/light theme only
const defaultConfig = {
  user: {
    name: 'Jane Doe',
    initials: 'JD',
    role: 'workspace_owner'
  },
  appearance: {
    theme: 'dark', // 'dark' or 'light' only
    density: 'comfortable'
  },
  ai: {
    mode: 'assist_and_apply', // 'assist_only' | 'assist_and_apply'
    canChangeTasks: true,
    canChangeWorkspace: true,
    canCommit: false,
    voiceEnabled: true
  }
};

// Create context
const ConfigContext = createContext({
  config: defaultConfig,
  setConfig: () => {},
  toggleTheme: () => {},
  hasPermission: () => false
});

/**
 * ConfigProvider - Manages application configuration with localStorage persistence
 */
export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('tasklytics-modern-config-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultConfig, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load config from localStorage:', e);
    }
    return defaultConfig;
  });

  // Persist to localStorage and update document theme
  useEffect(() => {
    try {
      localStorage.setItem('tasklytics-modern-config-v1', JSON.stringify(config));

      // Apply theme to document root
      const theme = config.appearance?.theme || defaultConfig.appearance.theme;
      if (theme === 'dark' || theme === 'light') {
        document.documentElement.setAttribute('data-theme', theme);
      } else {
        // Fallback to dark if invalid theme
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      console.error('Failed to save config to localStorage:', e);
    }
  }, [config]);

  /**
   * Toggle between dark and light themes
   */
  const toggleTheme = () => {
    setConfig((prev) => {
      const currentTheme = prev.appearance?.theme || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          theme: newTheme
        }
      };
    });
  };

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (perm) => {
    const role = config.user?.role || 'viewer';
    return roleHas(role, perm);
  };

  const value = {
    config,
    setConfig,
    toggleTheme,
    hasPermission
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Custom hook to use config context
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Export role permissions for use in other components
export { ROLE_PERMISSIONS };
