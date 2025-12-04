# Usage Examples for ConfigContext and Custom Hooks

## ConfigContext

### Setup (in main.jsx or App.jsx)

```jsx
import { ConfigProvider } from './contexts/ConfigContext';

function App() {
  return (
    <ConfigProvider>
      <YourAppComponents />
    </ConfigProvider>
  );
}
```

### Using the Config Context

```jsx
import { useConfig } from './contexts/ConfigContext';

function MyComponent() {
  const { config, setConfig, toggleTheme, hasPermission } = useConfig();

  // Access current theme
  const currentTheme = config.appearance.theme; // 'dark' or 'light'

  // Toggle theme
  const handleToggle = () => {
    toggleTheme();
  };

  // Check permissions
  const canEditTasks = hasPermission('tasks.write');
  const canCommit = hasPermission('history.commit');

  // Update config
  const updateUserName = (name) => {
    setConfig((prev) => ({
      ...prev,
      user: { ...prev.user, name }
    }));
  };

  return (
    <div>
      <button onClick={handleToggle}>
        Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
      </button>
      {canEditTasks && <button>Edit Tasks</button>}
    </div>
  );
}
```

### Updating User Role

```jsx
import { useConfig } from './contexts/ConfigContext';

function RoleSelector() {
  const { config, setConfig } = useConfig();

  const changeRole = (newRole) => {
    setConfig((prev) => ({
      ...prev,
      user: { ...prev.user, role: newRole }
    }));
  };

  return (
    <select value={config.user.role} onChange={(e) => changeRole(e.target.value)}>
      <option value="viewer">Viewer</option>
      <option value="commenter">Commenter</option>
      <option value="contributor">Contributor</option>
      <option value="project_lead">Project Lead</option>
      <option value="workspace_owner">Workspace Owner</option>
      <option value="org_admin">Org Admin</option>
    </select>
  );
}
```

## useHistory Hook

### Basic Setup

```jsx
import { useHistory } from './hooks/useHistory';

function MyApp() {
  // Initial snapshot with your data structure
  const initialSnapshot = {
    id: 0,
    label: 'Initial state',
    timestamp: new Date().toLocaleTimeString(),
    tasks: [],
    workspace: { name: 'My Workspace' }
  };

  const {
    currentSnapshot,
    uncommittedSteps,
    canUndo,
    canRedo,
    applyChange,
    undo,
    redo,
    commit,
    jump
  } = useHistory(initialSnapshot);

  return (
    <div>
      <p>Uncommitted changes: {uncommittedSteps}</p>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <button onClick={commit}>Commit Changes</button>
    </div>
  );
}
```

### Applying Changes

```jsx
function TaskManager() {
  const { currentSnapshot, applyChange } = useHistory(initialSnapshot);

  const createTask = (taskData) => {
    applyChange('Created new task', (snapshot) => {
      // Mutate the snapshot clone
      snapshot.tasks.push({
        id: `T-${Date.now()}`,
        ...taskData
      });
    });
  };

  const moveTask = (taskId, newStatus) => {
    applyChange(`Moved task ${taskId} to ${newStatus}`, (snapshot) => {
      const task = snapshot.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
      }
    });
  };

  return (
    <div>
      <button onClick={() => createTask({ title: 'New Task', status: 'Backlog' })}>
        Add Task
      </button>
    </div>
  );
}
```

### Jumping to History Points

```jsx
function HistoryViewer() {
  const { history, currentIndex, jump } = useHistory(initialSnapshot);

  return (
    <div>
      <h3>History</h3>
      {history.map((snapshot, index) => (
        <div key={snapshot.id}>
          <button
            onClick={() => jump(index)}
            disabled={index === currentIndex}
          >
            {snapshot.label} - {snapshot.timestamp}
            {snapshot.committed && ' (committed)'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## useFlows Hook

### Basic Setup

```jsx
import { useFlows } from './hooks/useFlows';

function FlowManager() {
  const INITIAL_FLOW_LIBRARY = [
    {
      id: 'flow-1',
      name: 'Task Move Notification',
      description: 'Notify when task moves',
      trigger: { type: 'task.dropped' },
      actions: [
        {
          type: 'show_notification',
          config: { title: 'Task Moved' }
        }
      ]
    }
  ];

  const {
    flowLibrary,
    flowBindings,
    flowMode,
    selectedFlowTarget,
    saveFlow,
    toggleFlowMode,
    handleFlowTargetClick,
    attachFlow,
    detachFlow,
    fireFlowsForEvent
  } = useFlows(INITIAL_FLOW_LIBRARY);

  return (
    <div>
      <button onClick={toggleFlowMode}>
        {flowMode ? 'Exit Flow Mode' : 'Enter Flow Mode'}
      </button>
    </div>
  );
}
```

### Attaching Flows to Targets

```jsx
function TaskCard({ task }) {
  const {
    flowMode,
    handleFlowTargetClick,
    attachFlow,
    getFlowBindingsForTarget,
    flowTargetKeyForTask
  } = useFlows();

  const handleClick = () => {
    if (flowMode) {
      handleFlowTargetClick({
        key: flowTargetKeyForTask(task.id),
        label: `Task ${task.id}`,
        type: 'task'
      });
    }
  };

  const bindings = getFlowBindingsForTarget(flowTargetKeyForTask(task.id));

  return (
    <div
      onClick={handleClick}
      className={flowMode ? 'flow-mode-active' : ''}
    >
      <h3>{task.title}</h3>
      {bindings.length > 0 && (
        <span>{bindings.length} flow(s) attached</span>
      )}
    </div>
  );
}
```

### Firing Flow Events

```jsx
function BoardColumn({ status }) {
  const { fireFlowsForEvent } = useFlows();

  const handleTaskDrop = (taskId) => {
    // Fire flow event when task is dropped
    fireFlowsForEvent(
      'task.dropped',
      {
        taskId,
        toStatus: status,
        targetKey: `task:${taskId}`
      },
      (flow, payload) => {
        // Custom execution callback
        console.log('Executing flow:', flow.name);
        console.log('With payload:', payload);

        // Execute flow actions here
        flow.actions.forEach((action) => {
          if (action.type === 'show_notification') {
            alert(action.config.title);
          }
        });
      }
    );
  };

  return (
    <div onDrop={(e) => handleTaskDrop(e.dataTransfer.getData('taskId'))}>
      {/* Column content */}
    </div>
  );
}
```

### Managing Flow Library

```jsx
function FlowEditor() {
  const { flowLibrary, saveFlow } = useFlows();

  const createNewFlow = () => {
    const newFlow = {
      id: `flow-${Date.now()}`,
      name: 'New Flow',
      description: 'Description here',
      trigger: { type: 'task.dropped' },
      actions: []
    };

    saveFlow(newFlow);
  };

  return (
    <div>
      <button onClick={createNewFlow}>Create New Flow</button>
      <ul>
        {flowLibrary.map((flow) => (
          <li key={flow.id}>{flow.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Combined Usage Example

```jsx
import { ConfigProvider } from './contexts/ConfigContext';
import { useHistory } from './hooks/useHistory';
import { useFlows } from './hooks/useFlows';

function App() {
  return (
    <ConfigProvider>
      <MainApp />
    </ConfigProvider>
  );
}

function MainApp() {
  const { hasPermission } = useConfig();
  const history = useHistory(createInitialSnapshot());
  const flows = useFlows(INITIAL_FLOW_LIBRARY);

  const canEditTasks = hasPermission('tasks.write');

  const handleMoveTask = (taskId, newStatus) => {
    if (!canEditTasks) {
      alert('You do not have permission to edit tasks');
      return;
    }

    // Apply change to history
    history.applyChange(`Moved ${taskId} to ${newStatus}`, (snapshot) => {
      const task = snapshot.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
      }
    });

    // Fire flow event
    flows.fireFlowsForEvent('task.dropped', {
      taskId,
      toStatus: newStatus
    });
  };

  return (
    <div>
      {/* Your app components */}
    </div>
  );
}
```

## Key Differences from Original

### ConfigContext Changes:
- **Simplified theme system**: Only `dark` and `light` (removed 10 color schemes)
- **data-theme attribute**: Applied to `documentElement` instead of `data-scheme`
- **Modern React**: Uses functional components and hooks throughout
- **Better TypeScript support**: Structured for easy type additions

### useHistory Changes:
- **Custom hook**: Extracted from App.js into reusable hook
- **Cleaner API**: Returns object with clearly named properties and methods
- **useCallback optimization**: Memoized functions for better performance

### useFlows Changes:
- **Custom hook**: Extracted flow management into reusable hook
- **Modular design**: Separated concerns for easier testing
- **Execution callback**: Fire flows with custom execution logic
- **Better organization**: All flow-related state in one place
