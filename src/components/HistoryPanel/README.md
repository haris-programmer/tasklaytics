# HistoryPanel Component

A modern React component with 3D neumorphic styling that displays a slide-out history timeline panel from the right side of the screen.

## Features

- **Slide-out Animation**: Smooth slide-in from the right with backdrop overlay
- **Timeline Navigation**: Visual timeline with entries showing all history snapshots
- **Current Position Indicator**: Animated glow indicator showing current position
- **Commit Baseline Marker**: Special styling for committed baseline entries
- **Jump to Point**: Click any accessible history point to jump to it
- **Undo/Redo Controls**: Quick navigation buttons in the header
- **3D Neumorphic Design**: Premium KanBan3D styling with shadows and hover effects
- **Accessibility**: Full keyboard navigation and ARIA labels
- **Responsive**: Adapts to different screen sizes

## Usage

```jsx
import HistoryPanel from './components/HistoryPanel';

function App() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, label: 'Initial State', timestamp: '10:00 AM' },
    { id: 2, label: 'Added task', timestamp: '10:15 AM' },
    { id: 3, label: 'Updated status', timestamp: '10:30 AM' }
  ]);
  const [currentIndex, setCurrentIndex] = useState(2);
  const [commitIndex, setCommitIndex] = useState(1);

  const handleJump = (index) => {
    setCurrentIndex(index);
    // Apply the snapshot at this index
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <>
      <button onClick={() => setIsHistoryOpen(true)}>
        Open History
      </button>

      <HistoryPanel
        history={history}
        currentIndex={currentIndex}
        commitIndex={commitIndex}
        onJump={handleJump}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClose={() => setIsHistoryOpen(false)}
        isOpen={isHistoryOpen}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `history` | `Array` | `[]` | Array of snapshot objects with `{ id, label, timestamp }` |
| `currentIndex` | `number` | `0` | Current position in history (0-based) |
| `commitIndex` | `number` | `0` | Index of the last committed baseline |
| `onJump` | `Function` | - | Callback when user jumps to a history point `(index) => void` |
| `onClose` | `Function` | - | Callback to close the panel `() => void` |
| `onUndo` | `Function` | - | Optional callback for undo action `() => void` |
| `onRedo` | `Function` | - | Optional callback for redo action `() => void` |
| `isOpen` | `boolean` | `false` | Whether the panel is open |

## History Object Structure

Each history item should have:

```typescript
{
  id: number | string,      // Unique identifier
  label: string,            // Display name (e.g., "Added task")
  timestamp?: string        // Optional timestamp (e.g., "10:00 AM")
}
```

## Styling

The component uses CSS variables from the design system:

- `--bg-card`, `--bg-elevated` - Background colors
- `--text-primary`, `--text-secondary`, `--text-tertiary` - Text colors
- `--border-subtle`, `--border-color` - Border colors
- `--color-primary`, `--color-success` - Semantic colors
- `--neu-raised`, `--neu-pressed`, `--neu-inset` - Neumorphic shadows
- `--space-*` - Spacing scale
- `--radius-*` - Border radius scale
- `--transition-*` - Animation timing

## Keyboard Navigation

- **Tab/Shift+Tab**: Navigate between clickable items
- **Enter/Space**: Jump to the focused history point
- **Escape**: Close the panel (can be implemented in parent)

## Accessibility

- ARIA labels for screen readers
- Focus indicators for keyboard navigation
- Disabled state for inaccessible history points
- Reduced motion support

## Visual States

1. **Normal Entry**: Default neumorphic raised style
2. **Current Position**: Blue glow with pulsing indicator
3. **Committed Baseline**: Green tint with special badge
4. **Disabled**: Entries before commit baseline are dimmed
5. **Hover**: Elevated shadow with subtle transform
6. **Active/Pressed**: Inset shadow effect

## Responsive Behavior

- **Desktop**: Fixed 380px width panel
- **Tablet (≤768px)**: Max 380px width with backdrop
- **Mobile (≤480px)**: Full width panel with adjusted padding

## Animation Details

- Panel slides in from right over 300ms
- Backdrop fades in over 300ms
- Current indicator has infinite pulse animation
- Hover effects use 200ms transitions
- Respects `prefers-reduced-motion` setting

## Migration from Vanilla JS

This component replaces the vanilla JS `HistoryPanel.js` with:

1. Modern React functional component with hooks
2. Enhanced 3D neumorphic styling matching KanBan3D design
3. Slide-out panel behavior with backdrop
4. Improved accessibility and keyboard navigation
5. Animated current position indicator
6. Better visual hierarchy and spacing
7. Responsive design for all screen sizes

## Dependencies

- React 16.8+ (for hooks)
- CSS Variables (design system)

No external dependencies required.
