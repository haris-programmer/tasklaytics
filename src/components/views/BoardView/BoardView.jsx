import { useState } from 'react';
import './BoardView.css';

/**
 * BoardView Component
 *
 * Kanban board with drag-and-drop functionality:
 * - Kanban columns (Backlog, Ready, In Progress, Review, Done)
 * - Drag-and-drop task cards
 * - WIP limit warnings
 * - Flow mode indicators
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 * @param {boolean} props.flowMode - Whether flow binding mode is active
 * @param {Object} props.flowBindings - Map of flow target bindings
 * @param {Function} props.onMoveTask - Handler for task status changes
 * @param {Function} props.onFlowTargetClick - Handler for flow target clicks
 * @param {Function} props.onFlowEvent - Handler for flow events
 */
export function BoardView({
  snapshot = {},
  flowMode = false,
  flowBindings = {},
  onMoveTask,
  onFlowTargetClick,
  onFlowEvent
}) {
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dropTargetStatus, setDropTargetStatus] = useState(null);

  // Extract data from snapshot
  const tasks = snapshot.tasks || [];
  const wipLimits = snapshot.wipLimits || {};

  // Board columns configuration
  const statuses = ['Backlog', 'Ready', 'In Progress', 'Review', 'Done'];
  const boardColumns = statuses.map((status) => ({
    key: status,
    label: status,
    tasks: tasks.filter((t) => t.status === status)
  }));

  // WIP limit helper
  const getWipLimit = (status) => {
    if (Object.prototype.hasOwnProperty.call(wipLimits, status)) {
      return wipLimits[status];
    }
    return null;
  };

  const isWipLimitExceeded = (status) => {
    const limit = getWipLimit(status);
    if (limit == null) return false;
    const count = tasks.filter((t) => t.status === status).length;
    return count > limit;
  };

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggingTaskId(task.id);
    if (flowMode && onFlowEvent) {
      onFlowEvent('task.dragstart', {
        taskId: task.id,
        status: task.status,
        targetKey: `task:${task.id}`
      });
    }
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDropTargetStatus(null);
  };

  const handleDragOver = (status, event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (!draggingTaskId) return;
    setDropTargetStatus(status);
  };

  const handleDrop = (status, event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (!draggingTaskId) return;
    if (onMoveTask) {
      onMoveTask({ taskId: draggingTaskId, toStatus: status });
    }
    if (onFlowEvent) {
      onFlowEvent('task.dropped', {
        taskId: draggingTaskId,
        toStatus: status,
        targetKey: `task:${draggingTaskId}`
      });
    }
    setDraggingTaskId(null);
    setDropTargetStatus(null);
  };

  const handleTaskClick = (task) => {
    if (flowMode && onFlowTargetClick) {
      onFlowTargetClick({
        key: `task:${task.id}`,
        label: `${task.id} · ${task.title}`,
        type: 'task'
      });
    }
  };

  return (
    <div className="board-view">
      {boardColumns.map((col) => {
        const limit = getWipLimit(col.key);
        const isLimitExceeded = isWipLimitExceeded(col.key);
        const isDropTarget = dropTargetStatus === col.key;

        return (
          <div
            key={col.key}
            className={`board-column ${isDropTarget ? 'board-column--drop-target' : ''} ${
              isLimitExceeded ? 'board-column--wip-exceeded' : ''
            }`}
            onDragOver={(e) => handleDragOver(col.key, e)}
            onDrop={(e) => handleDrop(col.key, e)}
          >
            <div className="board-column__header">
              <div className="board-column__title">{col.label}</div>
              <div className="board-column__meta">
                {limit != null && (
                  <span className={`wip-indicator ${isLimitExceeded ? 'wip-indicator--exceeded' : ''}`}>
                    WIP {col.tasks.length}/{limit}
                  </span>
                )}
                <span className="task-count">{col.tasks.length}</span>
              </div>
            </div>
            <div className="board-column__body">
              {col.tasks.map((task) => {
                const hasFlow = flowBindings[`task:${task.id}`];
                return (
                  <div
                    key={task.id}
                    className={`task-card ${task.blocked ? 'task-card--blocked ' : ''}${
                      flowMode
                        ? hasFlow
                          ? 'task-card--has-flow'
                          : 'task-card--flow-mode'
                        : ''
                    }`}
                    draggable={!flowMode}
                    onClick={() => handleTaskClick(task)}
                    onDragStart={() => {
                      if (!flowMode) {
                        handleDragStart(task);
                      }
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="task-card__id">{task.id}</div>
                    <div className="task-card__title">{task.title}</div>
                    <div className="task-card__meta">
                      <span className="chip">Pts {task.points}</span>
                      <span className="chip">Diff {task.difficulty || 'M'}</span>
                      <span className="chip">{task.type}</span>
                      {task.tags &&
                        task.tags.map((tag) => (
                          <span key={tag} className="chip">
                            {tag}
                          </span>
                        ))}
                      {task.blocked && (
                        <span className="chip chip--blocked">
                          Blocked
                        </span>
                      )}
                    </div>
                    <div className="task-card__footer">
                      <span className="task-card__assignee">{task.assignee}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
