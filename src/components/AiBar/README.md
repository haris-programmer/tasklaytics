# AiBar Component

A modern React component for an AI assistant interface with glassmorphism and neumorphic styling.

## Features

- **Glassmorphism Design**: Floating bottom bar with backdrop blur and gradient effects
- **Neumorphic Styling**: 3D shadow effects following the KanBan3D design system
- **Message History**: Displays the last 3 messages with role-based styling
- **Auto-resizing Input**: Textarea grows with content (max 120px height)
- **Voice Input**: Hold-to-speak microphone button with pulse animation
- **Smooth Animations**: Message slide-in, pulse effects, and hover states
- **Responsive**: Mobile-friendly with adaptive layouts
- **Accessibility**: ARIA labels, keyboard shortcuts, and reduced-motion support

## Usage

```jsx
import AiBar from './components/AiBar';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'user', text: 'Hello!' },
    { id: 2, role: 'assistant', text: 'Hi! How can I help?' }
  ]);
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      role: 'user',
      text: text
    };
    setMessages([...messages, newMessage]);
  };

  const handleToggleVoice = (isActive) => {
    setIsListening(isActive);
    // Implement voice recognition logic here
  };

  return (
    <AiBar
      messages={messages}
      onSendMessage={handleSendMessage}
      isListening={isListening}
      onToggleVoice={handleToggleVoice}
      voiceEnabled={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | Array | `[]` | Array of message objects with `{ id, role, text }` |
| `onSendMessage` | Function | - | Callback when user sends a message |
| `isListening` | Boolean | `false` | Voice listening state |
| `onToggleVoice` | Function | - | Callback for voice toggle (receives boolean) |
| `voiceEnabled` | Boolean | `true` | Whether to show voice input button |

## Message Object Structure

```javascript
{
  id: string | number,    // Unique identifier
  role: 'user' | 'assistant' | 'system',  // Message role
  text: string            // Message content
}
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in textarea

## Design System

The component uses CSS variables from the design system:

- Spacing: `--space-*` (xs, sm, md, lg, xl)
- Colors: `--color-primary`, `--text-primary`, etc.
- Shadows: `--neu-raised`, `--neu-inset`, `--neu-pressed`
- Transitions: `--transition-fast`, `--transition-base`

## Styling

The component includes:
- Message bubbles with role-specific colors (user: blue, assistant: purple, system: orange)
- Neumorphic input field with inset shadow
- Glassmorphic container with backdrop blur
- Pulsing microphone animation when listening
- Glowing send button with hover effects

## Responsive Breakpoints

- **Desktop**: Full features (> 968px)
- **Tablet**: Reduced padding and button sizes (640px - 968px)
- **Mobile**: Full-width, simplified layout (< 640px)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support with `-webkit-` prefixes
- Mobile browsers: Touch events supported

## Migration Notes

This component replaces the vanilla JS `AiBar.js` with:
- Modern React hooks (useState, useRef, useEffect)
- Improved accessibility
- Enhanced styling with glassmorphism
- Better animation performance
- Auto-scrolling message history
- Auto-resizing textarea
