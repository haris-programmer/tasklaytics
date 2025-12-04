import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './TopBar.css';

/**
 * TopBar Component - Modern React with Neumorphic Styling
 *
 * A comprehensive header component featuring:
 * - Breadcrumb navigation with gradient text
 * - View switcher with pill-style buttons in inset container
 * - Methodology and status badges with glow effects
 * - Avatar with premium shadow
 * - Integrated theme toggle
 * - Notification indicator
 *
 * @param {Object} props - Component props
 * @param {Object} props.workspace - Workspace object { name, methodology }
 * @param {string} props.currentView - Currently active view
 * @param {Function} props.onViewChange - Callback when view changes
 * @param {number} props.uncommitted - Count of uncommitted changes
 * @param {Object} props.user - User object { initials, name }
 * @param {Function} props.onOpenSettings - Callback to open settings
 * @param {Function} props.onNotifications - Callback to open notifications
 * @param {boolean} props.hasNotifications - Whether there are unread notifications
 */
export function TopBar({
  workspace = {},
  currentView = 'Dashboard',
  onViewChange,
  uncommitted = 0,
  user = {},
  onOpenSettings,
  onNotifications,
  hasNotifications = false
}) {
  // Default values
  const workspaceName = workspace.name || 'Untitled workspace';
  const methodology = workspace.methodology || 'Scrum';
  const initials = user.initials || user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD';

  // Available view options
  const viewOptions = [
    'Dashboard',
    'Board',
    'List',
    'Timeline',
    'Calendar',
    'Docs',
    'Files'
  ];

  const handleViewClick = (view) => {
    if (onViewChange && view !== currentView) {
      onViewChange(view);
    }
  };

  return (
    <header className="topbar">
      {/* Left Section - Breadcrumbs and Badges */}
      <div className="topbar__left">
        <div className="topbar__breadcrumbs">
          <div className="breadcrumbs">
            <span className="breadcrumbs__item">Workspace</span>
            <span className="breadcrumbs__separator">›</span>
            <span className="breadcrumbs__item breadcrumbs__item--active">
              {workspaceName}
            </span>
          </div>
        </div>

        <div className="topbar__meta">
          <span className="badge badge--methodology">
            <span className="badge__glow"></span>
            {methodology}
          </span>

          {uncommitted > 0 && (
            <span className="badge badge--pending">
              <span className="badge__glow"></span>
              <span className="badge__count">{uncommitted}</span>
              <span className="badge__label">uncommitted</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Section - View Switcher and Controls */}
      <div className="topbar__right">
        {/* View Switcher Pills */}
        <div className="topbar__view-switcher">
          <div className="view-switcher">
            {viewOptions.map((view) => (
              <button
                key={view}
                className={`view-pill ${view === currentView ? 'view-pill--active' : ''}`}
                onClick={() => handleViewClick(view)}
                aria-pressed={view === currentView}
                aria-label={`Switch to ${view} view`}
              >
                <span className="view-pill__text">{view}</span>
                {view === currentView && (
                  <span className="view-pill__glow"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="topbar__control">
          <ThemeToggle />
        </div>

        {/* Notifications Button */}
        <button
          className="topbar__control topbar__notifications"
          onClick={onNotifications}
          title="Notifications"
          aria-label="Open notifications"
        >
          <svg
            className="topbar__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {hasNotifications && (
            <span className="topbar__notification-dot"></span>
          )}
        </button>

        {/* User Avatar */}
        <button
          className="topbar__avatar"
          onClick={onOpenSettings}
          title={`${user.name || 'User'} - Open settings`}
          aria-label="Open user settings"
        >
          <div className="avatar">
            <span className="avatar__initials">{initials}</span>
            <div className="avatar__glow"></div>
          </div>
        </button>
      </div>
    </header>
  );
}
