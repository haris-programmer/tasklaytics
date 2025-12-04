# Flow Components Migration

## Overview

Successfully migrated FlowPanel and FlowEditor components from vanilla JavaScript to modern React with neumorphic styling.

## Components Created

### 1. FlowPanel Component

**Location:** `tasklytics-modern/src/components/FlowPanel/`

**Files:**
- `FlowPanel.jsx` - Main React component
- `FlowPanel.css` - Neumorphic styling
- `index.js` - Module export

**Features:**
- Tabbed interface (Bindings, Library, History)
- Flow library display with metadata
- Selected target/element display
- Attach/detach flow functionality
- Enable/disable toggles for flows
- Execution history viewer
- Neumorphic card-based design
- Responsive layout
- Accessibility features (ARIA labels, focus states)

**Props:**
```jsx
{
  flowMode: boolean,              // Whether flow mode is active
  selectedTarget: object,         // Currently selected element {key, label}
  flowBindings: object,           // Bindings by target key
  flowLibrary: array,             // Available flow definitions
  onAttachFlow: function,         // Callback (flowId, eventType)
  onDetachFlow: function,         // Callback (bindingId)
  onClose: function,              // Close panel callback
  onCreateFlow: function,         // Create new flow callback
  onEditFlow: function,           // Edit flow callback (flow)
  executionHistory: array         // Flow execution history
}
```

**Usage Example:**
```jsx
import FlowPanel from './components/FlowPanel';

<FlowPanel
  flowMode={true}
  selectedTarget={{ key: 'task-123', label: 'Design Task' }}
  flowBindings={flowBindings}
  flowLibrary={flowLibrary}
  onAttachFlow={(flowId, eventType) => handleAttach(flowId, eventType)}
  onDetachFlow={(bindingId) => handleDetach(bindingId)}
  onClose={() => setFlowMode(false)}
  onCreateFlow={() => setEditingFlow({})}
  onEditFlow={(flow) => setEditingFlow(flow)}
  executionHistory={execHistory}
/>
```

### 2. FlowEditor Component

**Location:** `tasklytics-modern/src/components/FlowEditor/`

**Files:**
- `FlowEditor.jsx` - ReactFlow-based editor component
- `FlowEditor.css` - Neumorphic flow editor styling
- `index.js` - Module export

**Features:**
- ReactFlow integration for visual flow building
- Custom node types:
  - **Trigger Node** - Event triggers (green theme)
  - **Condition Node** - Logic conditions (blue theme)
  - **Action Node** - Actions to perform (purple theme)
- Visual connection system with handles
- Node properties panel (context-sensitive)
- Flow metadata editing (name, description)
- Node toolbar for adding/deleting nodes
- ReactFlow controls (zoom, pan, minimap)
- Flow validation and conversion to legacy format
- Full-screen overlay modal
- Neumorphic styling throughout
- Responsive design

**Props:**
```jsx
{
  flow: object,                   // Flow definition to edit
  onSave: function,               // Save callback (flowDefinition)
  onCancel: function              // Cancel callback
}
```

**Flow Object Structure:**
```javascript
{
  id: string,
  name: string,
  description: string,
  nodes: [                        // ReactFlow nodes
    {
      id: string,
      type: 'trigger' | 'condition' | 'action',
      position: { x: number, y: number },
      data: {
        // Type-specific data
      }
    }
  ],
  edges: [                        // ReactFlow edges
    {
      id: string,
      source: string,
      target: string
    }
  ],
  enabled: boolean,
  trigger: object,                // Legacy format
  conditions: array,              // Legacy format
  actions: array                  // Legacy format
}
```

**Usage Example:**
```jsx
import FlowEditor from './components/FlowEditor';

<FlowEditor
  flow={currentFlow}
  onSave={(flowDef) => {
    saveFlow(flowDef);
    closeEditor();
  }}
  onCancel={() => closeEditor()}
/>
```

**Node Types:**

1. **Trigger Node**
   - Properties: eventType, description
   - Events: task.dropped, task.created, task.updated, etc.
   - Visual: Green accent with target icon

2. **Condition Node**
   - Properties: field, operator, value, description
   - Operators: equals, not_equals, contains, greater_than, less_than, exists, not_exists
   - Visual: Blue accent with branch icon

3. **Action Node**
   - Properties: actionType, config, description
   - Types:
     - show_notification (title, message)
     - run_command (commandType, params)
     - update_field (targetType, targetId, field, value)
     - log_message (message, level)
   - Visual: Purple accent with lightning icon

## Styling Approach

### Neumorphic Design System

Both components follow the established neumorphic design pattern:

**Key Features:**
- Soft shadows with inset/outset effects
- Gradient backgrounds (145deg)
- Smooth transitions and hover states
- 3D-like appearance
- Glow effects for primary actions
- Consistent spacing using CSS variables

**CSS Variables Used:**
- `--bg-card`, `--bg-elevated`, `--bg-input` - Background layers
- `--text-primary`, `--text-secondary`, `--text-tertiary` - Text hierarchy
- `--color-primary`, `--color-success`, `--color-danger` - Semantic colors
- `--border-color`, `--border-subtle` - Border treatments
- `--neu-raised-sm`, `--neu-raised`, `--neu-raised-lg` - Raised shadows
- `--neu-inset-sm`, `--neu-inset` - Inset shadows
- `--neu-pressed` - Pressed/active state
- `--space-xs` through `--space-3xl` - Spacing scale
- `--radius-sm` through `--radius-xl` - Border radius
- `--transition-fast`, `--transition-base`, `--transition-slow` - Timing

**Hover States:**
- Elevated shadow effects
- Subtle upward translation (-1px to -2px)
- Color transitions

**Active States:**
- Pressed/inset shadow
- Return to baseline position
- Inverted gradients

**Focus States:**
- 2px primary color outline
- 2px outline offset
- Accessibility compliant

## Dependencies

### Required Packages

For FlowEditor to work, you need to install ReactFlow:

```bash
npm install reactflow
# or
yarn add reactflow
```

The FlowPanel component has no additional dependencies beyond React.

## Migration Notes

### Changes from Vanilla JS

1. **React Hooks**: Converted `React.useState` to modern hooks
2. **Modern Syntax**: Arrow functions, destructuring, template literals
3. **PropTypes**: Replaced with prop destructuring with defaults
4. **Event Handlers**: Simplified to arrow functions
5. **Conditional Rendering**: Using modern JSX patterns
6. **Styling**: Separated CSS files with neumorphic design
7. **Accessibility**: Added ARIA labels and focus management

### Maintained Functionality

- All original features preserved
- Compatible with existing flow definition format
- Legacy format conversion for backward compatibility
- Same event system and callbacks

### Enhanced Features

- Better TypeScript compatibility (can add .d.ts files)
- Improved accessibility
- Modern styling with neumorphic effects
- Responsive design
- Better performance with React optimizations
- Cleaner separation of concerns

## Integration Guide

### Step 1: Import Components

```jsx
import FlowPanel from './components/FlowPanel';
import FlowEditor from './components/FlowEditor';
```

### Step 2: State Management

```jsx
const [flowMode, setFlowMode] = useState(false);
const [editingFlow, setEditingFlow] = useState(null);
const [selectedTarget, setSelectedTarget] = useState(null);
const [flowBindings, setFlowBindings] = useState({});
const [flowLibrary, setFlowLibrary] = useState([]);
```

### Step 3: Implement Callbacks

```jsx
const handleAttachFlow = (flowId, eventType) => {
  // Attach flow to selected target
};

const handleDetachFlow = (bindingId) => {
  // Remove flow binding
};

const handleSaveFlow = (flowDef) => {
  // Save flow to library
  setFlowLibrary([...flowLibrary, flowDef]);
  setEditingFlow(null);
};
```

### Step 4: Render Components

```jsx
{flowMode && !editingFlow && (
  <FlowPanel
    flowMode={flowMode}
    selectedTarget={selectedTarget}
    flowBindings={flowBindings}
    flowLibrary={flowLibrary}
    onAttachFlow={handleAttachFlow}
    onDetachFlow={handleDetachFlow}
    onClose={() => setFlowMode(false)}
    onCreateFlow={() => setEditingFlow({})}
    onEditFlow={setEditingFlow}
    executionHistory={[]}
  />
)}

{editingFlow && (
  <FlowEditor
    flow={editingFlow}
    onSave={handleSaveFlow}
    onCancel={() => setEditingFlow(null)}
  />
)}
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Performance Considerations

- ReactFlow optimized for large flows (100+ nodes)
- Virtualized rendering in FlowPanel lists
- Memoized node types in FlowEditor
- Optimized re-renders with useCallback
- CSS transitions hardware-accelerated

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states clearly visible
- Screen reader compatible
- Reduced motion media query support

## Future Enhancements

Potential improvements:
- Add flow templates
- Implement flow versioning
- Add flow testing/debugging tools
- Export/import flows as JSON
- Flow execution visualization
- Multi-select for bulk operations
- Undo/redo functionality
- Flow search and filtering
- Dark/light theme toggle integration

## Testing

Recommended test coverage:
- Unit tests for node property components
- Integration tests for flow save/load
- E2E tests for flow creation workflow
- Accessibility tests with axe-core
- Visual regression tests for neumorphic styles

## Troubleshooting

### ReactFlow not rendering
- Ensure `reactflow` package is installed
- Check CSS import: `import 'reactflow/dist/style.css'`
- Verify container has explicit height

### Styling issues
- Check CSS variable definitions in theme
- Verify all neumorphic variables are set
- Check for CSS specificity conflicts

### Flow not saving
- Verify onSave callback is provided
- Check flow definition structure
- Validate node/edge data integrity

## License

Part of the Tasklytics React Rail Flows application.

## Contact

For questions or issues with these components, refer to the main project documentation.
