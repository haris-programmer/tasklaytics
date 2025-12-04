import { TopBar } from './TopBar';

/**
 * Example usage of the TopBar component
 *
 * This file demonstrates how to integrate the TopBar
 * into your application with proper state management
 */

function TopBarExample() {
  const [currentView, setCurrentView] = React.useState('Dashboard');

  // Example workspace data
  const workspace = {
    name: 'Product Development Q4',
    methodology: 'Scrum'
  };

  // Example user data
  const user = {
    name: 'Jane Doe',
    initials: 'JD'
  };

  // Handler functions
  const handleViewChange = (newView) => {
    console.log('Switching to view:', newView);
    setCurrentView(newView);
    // Add your navigation logic here
  };

  const handleOpenSettings = () => {
    console.log('Opening settings...');
    // Add your settings modal logic here
  };

  const handleNotifications = () => {
    console.log('Opening notifications...');
    // Add your notifications panel logic here
  };

  return (
    <TopBar
      workspace={workspace}
      currentView={currentView}
      onViewChange={handleViewChange}
      uncommitted={3}
      user={user}
      onOpenSettings={handleOpenSettings}
      onNotifications={handleNotifications}
      hasNotifications={true}
    />
  );
}

export default TopBarExample;
