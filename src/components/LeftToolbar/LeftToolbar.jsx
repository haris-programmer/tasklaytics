import { useMemo } from 'react';
import { Button } from '../Button/Button';
import './LeftToolbar.css';

export function LeftToolbar({
  workspace = {},
  uncommittedSteps = 0,
  canUndo = false,
  canRedo = false,
  canCommit = true,
  scheme = 'sand',
  onRunCommand,
  onUndo,
  onRedo,
  onCommit,
  onOpenHistory,
  onCycleScheme,
  style
}) {
  const methodologyName = workspace.methodology || 'Scrum';

  // Build context commands based on methodology
  const contextCommands = useMemo(() => {
    const commands = [
      {
        id: 'create-task',
        label: 'Create task',
        hint: 'Add a card into this view'
      }
    ];

    if (methodologyName === 'Scrum') {
      commands.push({
        id: 'start-sprint',
        label: 'Sprint planning',
        hint: 'Adjust current sprint goal'
      });
    } else if (methodologyName === 'Kanban') {
      commands.push({
        id: 'tune-wip',
        label: 'Tune WIP limits',
        hint: 'Adjust per-column limits (mock)'
      });
    }

    commands.push({
      id: 'flows-mode',
      label: 'Flows',
      hint: 'Attach automations to tasks and events'
    });

    commands.push({
      id: 'convert-to-kanban',
      label: 'Switch to Kanban',
      hint: 'Demo methodology switch'
    });

    return commands;
  }, [methodologyName]);

  // Get scheme label for display
  const getSchemeLabel = () => {
    switch (scheme) {
      case 'graphite':
        return 'Graphite desk';
      case 'sand':
        return 'Sandstone';
      case 'navy':
        return 'Navy boardroom';
      case 'forest':
        return 'Forest office';
      case 'rail':
        return 'Rail cockpit';
      default:
        return 'Slate night';
    }
  };

  return (
    <aside className="left-toolbar" style={style}>
      {/* Logo Section */}
      <div className="left-toolbar__section left-toolbar__section--logo">
        <div className="app-logo">
          <div className="app-logo__icon">T5</div>
          <div className="app-logo__glow" />
          <div className="app-logo__glow-inner" />
        </div>
        <div className="app-logo-text">
          <div className="app-logo-title">Tasklytics</div>
          <div className="app-logo-sub">AI workspace</div>
        </div>
      </div>

      {/* Context Commands Section */}
      <div className="left-toolbar__section">
        <div className="left-toolbar__label">Context commands</div>
        <ul className="toolbar-command-list">
          {contextCommands.map((cmd) => (
            <li
              key={cmd.id}
              className="toolbar-command"
              onClick={() => onRunCommand?.(cmd.id)}
            >
              <div className="toolbar-command__title">{cmd.label}</div>
              <div className="toolbar-command__hint">{cmd.hint}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Section - Metadata & Actions */}
      <div className="left-toolbar__section left-toolbar__section--bottom">
        {/* Methodology Badge */}
        <div className="toolbar-meta-row">
          <span className="toolbar-meta-label">Methodology</span>
          <span className="methodology-badge">{methodologyName}</span>
        </div>

        {/* Local Changes Counter */}
        <div className="toolbar-meta-row">
          <span className="toolbar-meta-label">Local changes</span>
          <span
            className={`toolbar-meta-value ${
              uncommittedSteps === 0
                ? 'toolbar-meta-value--ok'
                : 'toolbar-meta-value--pending'
            }`}
          >
            {uncommittedSteps === 0 ? 'None' : uncommittedSteps}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="left-toolbar__actions">
          <Button
            className="toolbar-button"
            disabled={!canUndo}
            onClick={onUndo}
          >
            Undo
          </Button>
          <Button
            className="toolbar-button"
            disabled={!canRedo}
            onClick={onRedo}
          >
            Redo
          </Button>
          <Button
            className="toolbar-button"
            onClick={onOpenHistory}
          >
            History
          </Button>
          <Button
            variant="primary"
            className="toolbar-button toolbar-button--commit"
            disabled={!canCommit || uncommittedSteps === 0}
            onClick={onCommit}
          >
            Commit
          </Button>
          <Button
            className="toolbar-button toolbar-button--ghost toolbar-button--full"
            onClick={onCycleScheme}
          >
            Style: {getSchemeLabel()}
          </Button>
        </div>
      </div>
    </aside>
  );
}
