import { useState, useEffect, useRef } from 'react';
import './MainCanvas.css';

/**
 * MainCanvas Component - Modern React with Neumorphic Styling
 *
 * The main content area that displays different views of the workspace.
 * Features:
 * - Multiple view modes (Dashboard, Board, List, Timeline, Calendar, Docs, Files)
 * - Drag-and-drop for tasks in Board view
 * - Interactive timeline with drag handles
 * - Resizable split panels for Docs and Files
 * - Markdown rendering with Mermaid diagram support
 * - Neumorphic inset panel styling
 *
 * @param {Object} props - Component props
 * @param {Object} props.snapshot - Current workspace snapshot
 * @param {number} props.uncommitted - Count of uncommitted changes
 * @param {boolean} props.flowMode - Whether flow binding mode is active
 * @param {Object} props.flowBindings - Map of flow target bindings
 * @param {Function} props.onFlowTargetClick - Handler for flow target clicks
 * @param {Function} props.onFlowEvent - Handler for flow events
 * @param {Function} props.onMoveTask - Handler for task status changes
 * @param {Function} props.onUpdateBrief - Handler for project brief updates
 * @param {Function} props.onGenerateFromBrief - Handler to generate tasks from brief
 * @param {Function} props.onRefineFromDelta - Handler to refine backlog from new points
 * @param {Function} props.onUpdateTimeline - Handler for timeline item updates
 * @param {Function} props.onCreateDoc - Handler to create new document
 * @param {Function} props.onUploadDoc - Handler to upload document
 * @param {Function} props.onCreateFile - Handler to create new file
 */
export function MainCanvas({
  snapshot = {},
  uncommitted = 0,
  flowMode = false,
  flowBindings = {},
  onFlowTargetClick = () => {},
  onFlowEvent = () => {},
  onMoveTask,
  onUpdateBrief,
  onGenerateFromBrief,
  onRefineFromDelta,
  onUpdateTimeline,
  onCreateDoc,
  onUploadDoc,
  onCreateFile
}) {
  // State management
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dropTargetStatus, setDropTargetStatus] = useState(null);
  const [timelineDrag, setTimelineDrag] = useState({
    active: false,
    itemId: null,
    type: null,
    startX: 0,
    dayPx: 1,
    originalStart: 0,
    originalDuration: 1,
    previewStart: 0,
    previewDuration: 1
  });
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [briefDraft, setBriefDraft] = useState(snapshot.projectBrief || '');
  const [pointsDraft, setPointsDraft] = useState('');
  const [docsSplitWidth, setDocsSplitWidth] = useState(260);
  const [filesSplitWidth, setFilesSplitWidth] = useState(260);
  const [splitDrag, setSplitDrag] = useState({
    active: false,
    target: null,
    startX: 0,
    startWidth: 260
  });

  const docsContentRef = useRef(null);

  // Update brief draft when snapshot changes
  useEffect(() => {
    setBriefDraft(snapshot.projectBrief || '');
  }, [snapshot.id, snapshot.projectBrief]);

  // Render Mermaid diagrams in docs
  useEffect(() => {
    if (!docsContentRef.current) return;
    if (typeof window.mermaid === 'undefined') return;

    setTimeout(() => {
      const mermaidBlocks = docsContentRef.current.querySelectorAll('pre code.language-mermaid');
      if (mermaidBlocks.length === 0) return;

      mermaidBlocks.forEach((block) => {
        const code = block.textContent;
        const container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = code;

        const pre = block.parentElement;
        if (pre && pre.tagName === 'PRE') {
          pre.parentElement.replaceChild(container, pre);
        }
      });

      try {
        const elements = docsContentRef.current.querySelectorAll('.mermaid');
        if (elements.length > 0) {
          window.mermaid.run({ nodes: elements });
        }
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }, 100);
  }, [selectedDocId, snapshot.docs]);

  // Extract data from snapshot
  const view = snapshot.view || 'Dashboard';
  const tasks = snapshot.tasks || [];
  const sprint = snapshot.sprint || null;
  const schedule = snapshot.schedule || { timeline: [], calendar: { month: '', events: [] } };
  const docs = snapshot.docs || [];
  const files = snapshot.files || [];

  // Board columns configuration
  const statuses = ['Backlog', 'Ready', 'In Progress', 'Review', 'Done'];
  const boardColumns = statuses.map((status) => ({
    key: status,
    label: status,
    tasks: tasks.filter((t) => t.status === status)
  }));

  // Statistics
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const inProgressCount = inProgressTasks.length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});
  tasks.forEach((t) => {
    if (statusCounts.hasOwnProperty(t.status)) {
      statusCounts[t.status] += 1;
    }
  });

  const totalTasks = tasks.length;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0);
  const donePoints = tasks
    .filter((t) => t.status === 'Done')
    .reduce((sum, t) => sum + (t.points || 0), 0);
  const completionPercent = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Date utilities
  const parseDateYMD = (ymd) => {
    if (!ymd || typeof ymd !== 'string') return new Date();
    const parts = ymd.split('-');
    const y = parseInt(parts[0], 10) || 2025;
    const m = parseInt(parts[1], 10) || 1;
    const d = parseInt(parts[2], 10) || 1;
    return new Date(y, m - 1, d);
  };

  const addDays = (base, days) => {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + days);
    return d;
  };

  // Timeline data processing
  const timelineBaseDate = sprint && sprint.startDate ? parseDateYMD(sprint.startDate) : new Date();
  const timelineRawItems = schedule.timeline || [];

  const timelineTotalDays = (() => {
    let maxEnd = 0;
    timelineRawItems.forEach((it) => {
      const start = Number(it.startOffset) || 0;
      const dur = Math.max(Number(it.duration) || 1, 1);
      const end = start + dur;
      if (end > maxEnd) maxEnd = end;
    });
    return maxEnd || 1;
  })();

  const timelineHeaderDays = (() => {
    const days = [];
    const total = timelineTotalDays;
    for (let i = 0; i < total; i++) {
      const date = addDays(timelineBaseDate, i);
      days.push({ index: i, label: date.getDate() });
    }
    return days;
  })();

  const taskTitleById = (id) => {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) return tasks[i].title;
    }
    return '';
  };

  const timelineItems = timelineRawItems.map((it) => {
    const start = Number(it.startOffset) || 0;
    const dur = Math.max(Number(it.duration) || 1, 1);
    const startDate = addDays(timelineBaseDate, start);
    const endDate = addDays(timelineBaseDate, start + dur - 1);
    const label = it.label || taskTitleById(it.taskId) || it.taskId;
    const dateLabel = `${startDate.getDate()}–${endDate.getDate()}`;
    return {
      id: it.id,
      taskId: it.taskId,
      label,
      dateLabel,
      startOffset: start,
      duration: dur
    };
  });

  const timelineLabel = (() => {
    const total = timelineTotalDays;
    const start = timelineBaseDate;
    const end = addDays(timelineBaseDate, total - 1);
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  })();

  // Calendar data processing
  const calendarConfig = schedule.calendar || { month: '', events: [] };
  const eventsByDate = (() => {
    const map = {};
    (calendarConfig.events || []).forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  })();

  const calendarLabel = (() => {
    const conf = calendarConfig;
    if (!conf.month) return 'Calendar';
    const parts = conf.month.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!y || !m) return 'Calendar';
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  })();

  const calendarWeeks = (() => {
    const conf = calendarConfig;
    if (!conf.month) return [];
    const parts = conf.month.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!y || !m) return [];
    const first = new Date(y, m - 1, 1);
    const dayOfWeek = first.getDay();
    const offset = (dayOfWeek + 6) % 7;
    const start = new Date(first.getTime());
    start.setDate(start.getDate() - offset);

    const weeks = [];
    const cur = new Date(start.getTime());
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = cur.toISOString().slice(0, 10);
        week.push({
          key,
          date: cur.getDate(),
          inMonth: cur.getMonth() === first.getMonth(),
          events: eventsByDate[key] || []
        });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  })();

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Document and file selection
  const selectedDoc = docs.length === 0
    ? null
    : docs.find((d) => d.id === selectedDocId) || docs[0];

  const selectedFile = files.length === 0
    ? null
    : files.find((f) => f.id === selectedFileId) || files[0];

  const upcomingEventsForDashboard = (calendarConfig.events || []).slice(0, 3);

  // WIP limit helper
  const wipLimit = (status) => {
    const limits = snapshot.wipLimits || {};
    if (Object.prototype.hasOwnProperty.call(limits, status)) {
      return limits[status];
    }
    return null;
  };

  // Drag and drop handlers for Board view
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

  // Document and file selection
  const selectDoc = (id) => {
    setSelectedDocId(id);
  };

  const selectFile = (id) => {
    setSelectedFileId(id);
  };

  // Timeline drag handlers
  const startTimelineDrag = (event, item, type) => {
    if (event && event.preventDefault) event.preventDefault();
    const track = event.currentTarget.closest('.timeline-row-track');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const dayPx = rect.width / (timelineTotalDays || 1);
    setTimelineDrag({
      active: true,
      itemId: item.id,
      type,
      startX: event.clientX,
      dayPx,
      originalStart: item.startOffset,
      originalDuration: item.duration,
      previewStart: item.startOffset,
      previewDuration: item.duration
    });
  };

  const onTimelineMouseMove = (event) => {
    if (!timelineDrag.active) return;
    const drag = timelineDrag;
    const deltaPx = event.clientX - drag.startX;
    const deltaDays = Math.round(deltaPx / (drag.dayPx || 1));
    if (!deltaDays) return;

    let start = drag.originalStart;
    let dur = drag.originalDuration;
    const total = timelineTotalDays || 1;

    if (drag.type === 'move') {
      start = drag.originalStart + deltaDays;
    } else if (drag.type === 'start') {
      start = drag.originalStart + deltaDays;
      dur = drag.originalDuration - deltaDays;
    } else if (drag.type === 'end') {
      dur = drag.originalDuration + deltaDays;
    }

    if (dur < 1) dur = 1;
    if (start < 0) start = 0;
    if (start + dur > total) {
      const overflow = start + dur - total;
      if (drag.type === 'move') {
        start -= overflow;
      } else {
        dur -= overflow;
        if (dur < 1) dur = 1;
      }
    }

    setTimelineDrag((prev) => ({
      ...prev,
      previewStart: start,
      previewDuration: dur
    }));
  };

  const endTimelineDrag = () => {
    if (!timelineDrag.active) return;
    const drag = timelineDrag;
    setTimelineDrag((prev) => ({ ...prev, active: false }));
    if (
      drag.previewStart !== drag.originalStart ||
      drag.previewDuration !== drag.originalDuration
    ) {
      if (onUpdateTimeline) {
        onUpdateTimeline({
          itemId: drag.itemId,
          startOffset: drag.previewStart,
          duration: drag.previewDuration
        });
      }
    }
  };

  const barStyle = (item) => {
    const total = timelineTotalDays || 1;
    let start = item.startOffset;
    let dur = item.duration;
    if (timelineDrag.active && timelineDrag.itemId === item.id) {
      start = timelineDrag.previewStart;
      dur = timelineDrag.previewDuration;
    }
    const leftPct = (start / total) * 100;
    const widthPct = Math.max((dur / total) * 100, (1 / total) * 100 * 0.8);
    return {
      left: `${leftPct}%`,
      width: `${widthPct}%`
    };
  };

  // Brief and refinement handlers
  const handleRefineFromDeltaClick = () => {
    if (!pointsDraft.trim()) return;
    if (onRefineFromDelta) onRefineFromDelta(pointsDraft);
    setPointsDraft('');
  };

  // Split panel drag handlers
  const startSplitDrag = (target, event) => {
    event.preventDefault();
    const startWidth = target === 'docs' ? docsSplitWidth : filesSplitWidth;
    setSplitDrag({
      active: true,
      target,
      startX: event.clientX,
      startWidth
    });
  };

  const handleSplitMouseMove = (target, event) => {
    if (!splitDrag.active || splitDrag.target !== target) return;
    const delta = event.clientX - splitDrag.startX;
    let next = splitDrag.startWidth + delta;
    if (next < 180) next = 180;
    if (next > 480) next = 480;
    if (target === 'docs') setDocsSplitWidth(next);
    if (target === 'files') setFilesSplitWidth(next);
  };

  const endSplitDrag = () => {
    if (!splitDrag.active) return;
    setSplitDrag((prev) => ({ ...prev, active: false }));
  };

  return (
    <section className="canvas">
      <header className="canvas-header">
        <div className="canvas-header__titles">
          <div className="canvas-title">
            {snapshot.workspace && snapshot.workspace.name
              ? snapshot.workspace.name
              : 'Workspace'}
          </div>
          <div className="canvas-subtitle">
            Universal canvas driven by context toolbar and AI. Use the view pills
            above to switch between Dashboard, Board, Timeline, Calendar, Docs,
            and Files.
          </div>
        </div>
        <div className="canvas-header__meta">
          {sprint && (
            <div className="sprint-meta">
              <div>
                <div className="sprint-meta__label">SPRINT</div>
                <div className="sprint-meta__value">{sprint.name}</div>
              </div>
              <div>
                <div className="sprint-meta__label">GOAL</div>
                <div className="sprint-meta__value">{sprint.goal}</div>
              </div>
              <div>
                <div className="sprint-meta__label">WINDOW</div>
                <div className="sprint-meta__value">
                  {sprint.startDate} → {sprint.endDate}
                </div>
              </div>
            </div>
          )}
          <div className="canvas-header__stats">
            <div className="stat-card">
              <div className="stat-card__label">In progress</div>
              <div className="stat-card__value">{inProgressCount}</div>
              <div className="stat-card__hint">Cards actively being worked on</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Done in board</div>
              <div className="stat-card__value">{doneCount}</div>
              <div className="stat-card__hint">Completed in this workspace</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Local history</div>
              <div className="stat-card__value">{uncommitted}</div>
              <div className="stat-card__hint">Steps since last commit</div>
            </div>
          </div>
        </div>
      </header>

      <div className="canvas-body">
        {view === 'Dashboard' && (
          <div className="dashboard">
            <div className="dashboard-card dashboard-card--brief">
              <div className="brief-title">Project brief</div>
              <div className="brief-subtitle">
                This description seeds the AI when generating and refining tasks.
              </div>
              {!snapshot.briefLocked ? (
                <>
                  <textarea
                    className="brief-textarea"
                    value={briefDraft}
                    onChange={(e) => setBriefDraft(e.target.value)}
                    onBlur={() => {
                      if (onUpdateBrief && briefDraft !== (snapshot.projectBrief || '')) {
                        onUpdateBrief(briefDraft);
                      }
                    }}
                    placeholder="Describe the project goals, scope, constraints, stakeholders, and key milestones..."
                  />
                  <div className="brief-footer">
                    <div className="brief-actions">
                      <button
                        className="docs-detail-button"
                        type="button"
                        onClick={() => {
                          if (onUpdateBrief) onUpdateBrief(briefDraft);
                        }}
                      >
                        Save brief
                      </button>
                      <button
                        className="docs-detail-button"
                        type="button"
                        disabled={!briefDraft.trim()}
                        onClick={() => {
                          if (onGenerateFromBrief) onGenerateFromBrief(briefDraft);
                        }}
                      >
                        Generate tasks from brief
                      </button>
                    </div>
                    <div className="brief-secondary-text">
                      You can edit this brief until tasks are generated.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="brief-readonly-body">
                    {snapshot.projectBrief || 'No brief provided yet.'}
                  </div>
                  <div className="brief-footer">
                    <div className="brief-secondary-text">
                      Baseline locked. Generated {snapshot.briefGeneratedTasksCount || 0} task(s) from this
                      brief so far.
                    </div>
                  </div>
                  <div className="dashboard-newpoints">
                    <div className="brief-subtitle">
                      New points for the AI to refine the backlog
                    </div>
                    <textarea
                      className="newpoints-textarea"
                      value={pointsDraft}
                      onChange={(e) => setPointsDraft(e.target.value)}
                      placeholder="Add bullet points or notes…\nThe AI will add / adjust tasks when you apply changes."
                    />
                    <div className="brief-footer">
                      <button
                        className="docs-detail-button"
                        type="button"
                        disabled={!pointsDraft.trim()}
                        onClick={handleRefineFromDeltaClick}
                      >
                        Update backlog from new points
                      </button>
                      <div className="brief-secondary-text">
                        This creates new history steps so you can undo if needed.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="dashboard-row dashboard-row--summary">
              <div className="stat-card">
                <div className="stat-card__label">Total tasks</div>
                <div className="stat-card__value">{totalTasks}</div>
                <div className="stat-card__hint">Across all board columns</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Story points complete</div>
                <div className="stat-card__value">
                  {donePoints} / {totalPoints} pts
                </div>
                <div className="dashboard-bar">
                  <div
                    className="dashboard-bar__fill"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <div className="stat-card__hint">
                  {completionPercent}% of points in Done
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Local changes</div>
                <div className="stat-card__value">{uncommitted}</div>
                <div className="stat-card__hint">Steps since last commit</div>
              </div>
            </div>

            <div className="dashboard-row">
              <div className="dashboard-card">
                <div className="dashboard-card__title">Status breakdown</div>
                {statuses.map((status) => (
                  <div key={status} className="dashboard-card__metric-row">
                    <span>{status}</span>
                    <span>{statusCounts[status]}</span>
                  </div>
                ))}
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card__title">In progress</div>
                <ul className="dashboard-list">
                  {inProgressTasks.map((task) => (
                    <li key={task.id} className="dashboard-list__item">
                      <span className="dashboard-list__item-label">
                        {task.title}
                      </span>
                      <span className="dashboard-list__badge">
                        {task.points} pts · {task.difficulty || 'M'}
                      </span>
                    </li>
                  ))}
                  {inProgressTasks.length === 0 && (
                    <li className="dashboard-list__item">
                      <span className="dashboard-list__item-label">
                        Nothing in progress.
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card__title">Upcoming ceremonies</div>
                <ul className="dashboard-list">
                  {upcomingEventsForDashboard.map((ev) => (
                    <li key={ev.id} className="dashboard-list__item">
                      <span className="dashboard-list__item-label">
                        {ev.label}
                      </span>
                      <span className="dashboard-list__badge">
                        {ev.date}
                      </span>
                    </li>
                  ))}
                  {upcomingEventsForDashboard.length === 0 && (
                    <li className="dashboard-list__item">
                      <span className="dashboard-list__item-label">
                        No scheduled events.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {view === 'Board' && (
          <div className="canvas-board">
            {boardColumns.map((col) => (
              <div
                key={col.key}
                className={`board-column ${
                  dropTargetStatus === col.key ? 'board-column--drop-target' : ''
                }`}
                onDragOver={(e) => handleDragOver(col.key, e)}
                onDrop={(e) => handleDrop(col.key, e)}
              >
                <div className="board-column__header">
                  <div className="board-column__title">{col.label}</div>
                  <div className="board-column__meta">
                    {wipLimit(col.key) != null && (
                      <span>
                        WIP {col.tasks.length}/{wipLimit(col.key)}
                      </span>
                    )}
                    <span>{col.tasks.length}</span>
                  </div>
                </div>
                <div className="board-column__body">
                  {col.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-card ${task.blocked ? 'task-card--blocked ' : ''}${
                        flowMode
                          ? flowBindings[`task:${task.id}`]
                            ? 'task-card--has-flow'
                            : 'task-card--flow-mode'
                          : ''
                      }`}
                      draggable={!flowMode}
                      onClick={() => {
                        if (flowMode) {
                          onFlowTargetClick({
                            key: `task:${task.id}`,
                            label: `${task.id} · ${task.title}`,
                            type: 'task'
                          });
                        }
                      }}
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
                          <span
                            className="chip"
                            style={{
                              borderColor: '#f97373',
                              color: '#b91c1c'
                            }}
                          >
                            Blocked
                          </span>
                        )}
                      </div>
                      <div className="task-card__footer">
                        <span className="task-card__assignee">{task.assignee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'List' && (
          <div className="canvas-list">
            <table className="task-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Difficulty</th>
                  <th>Points</th>
                  <th>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.difficulty || '-'}</td>
                    <td>{task.points}</td>
                    <td>{task.assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'Timeline' && (
          <>
            {timelineItems.length > 0 ? (
              <div className="timeline">
                <div className="timeline-header">
                  <div>Timeline (Gantt)</div>
                  <div>{timelineLabel}</div>
                </div>
                <div
                  className="timeline-grid"
                  onMouseMove={onTimelineMouseMove}
                  onMouseUp={endTimelineDrag}
                  onMouseLeave={endTimelineDrag}
                >
                  <div className="timeline-days">
                    {timelineHeaderDays.map((day) => (
                      <div key={day.index} className="timeline-day">
                        {day.label}
                      </div>
                    ))}
                  </div>
                  {timelineItems.map((item) => {
                    const barClass = `timeline-row-bar${
                      timelineDrag.active && timelineDrag.itemId === item.id
                        ? ' timeline-row-bar--dragging'
                        : ''
                    }`;
                    return (
                      <div key={item.id} className="timeline-row">
                        <div className="timeline-row-label">
                          <div>{item.label}</div>
                          <div className="timeline-row-sub">{item.dateLabel}</div>
                        </div>
                        <div className="timeline-row-track">
                          <div
                            className={barClass}
                            style={barStyle(item)}
                            onMouseDown={(e) => startTimelineDrag(e, item, 'move')}
                          >
                            <div
                              className="timeline-row-handle"
                              onMouseDown={(e) => startTimelineDrag(e, item, 'start')}
                            />
                            <div
                              className="timeline-row-handle"
                              onMouseDown={(e) => startTimelineDrag(e, item, 'end')}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="canvas-placeholder">
                No timeline data configured in this demo snapshot.
              </div>
            )}
          </>
        )}

        {view === 'Calendar' && (
          <div className="calendar">
            <div className="calendar-header">
              <div>{calendarLabel}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                Sprint window: {sprint && sprint.startDate} → {sprint && sprint.endDate}
              </div>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {dayNames.map((name) => (
                  <div key={name}>{name}</div>
                ))}
              </div>
              {calendarWeeks.map((week) => (
                <div key={week[0].key} className="calendar-week">
                  {week.map((day) => (
                    <div
                      key={day.key}
                      className={`calendar-day ${
                        day.inMonth
                          ? 'calendar-day--in-month'
                          : 'calendar-day--other-month'
                      }`}
                    >
                      <div className="calendar-day__date">{day.date}</div>
                      <div>
                        {day.events.map((ev) => (
                          <div key={ev.id} className="calendar-pill">
                            {ev.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'Docs' && (
          <>
            {docs.length > 0 ? (
              <div
                className="docs-layout"
                onMouseMove={(e) => handleSplitMouseMove('docs', e)}
                onMouseUp={endSplitDrag}
                onMouseLeave={endSplitDrag}
              >
                <div className="docs-list" style={{ width: docsSplitWidth }}>
                  {docs.map((doc) => {
                    const active = selectedDoc && selectedDoc.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`docs-list-item ${
                          active ? 'docs-list-item--active' : ''
                        }`}
                        onClick={() => selectDoc(doc.id)}
                      >
                        <div className="docs-list-item-title">{doc.title}</div>
                        <div className="docs-list-item-meta">
                          {doc.owner} · updated {doc.updated}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className={`splitter-vertical ${
                    splitDrag.active && splitDrag.target === 'docs'
                      ? 'splitter-vertical--active'
                      : ''
                  }`}
                  onMouseDown={(e) => startSplitDrag('docs', e)}
                />
                {selectedDoc ? (
                  <div className="docs-detail">
                    <div className="docs-detail-header">
                      <div>
                        <div className="docs-detail-title">{selectedDoc.title}</div>
                        <div className="docs-detail-meta">
                          Owner: {selectedDoc.owner} · Last updated {selectedDoc.updated}
                        </div>
                      </div>
                      <div className="docs-detail-actions">
                        <label
                          className="docs-detail-button"
                          style={{ cursor: 'pointer', margin: 0 }}
                        >
                          Upload .md file
                          <input
                            type="file"
                            accept=".md,.markdown"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;

                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const content = event.target.result;
                                const fileName = file.name.replace(/\.(md|markdown)$/i, '');
                                const today = new Date().toISOString().slice(0, 10);

                                if (onUploadDoc) {
                                  onUploadDoc({
                                    title: fileName,
                                    content,
                                    date: today
                                  });
                                }
                              };
                              reader.readAsText(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <button
                          className="docs-detail-button"
                          type="button"
                          onClick={() => {
                            if (onCreateDoc) onCreateDoc();
                          }}
                        >
                          New doc (demo)
                        </button>
                      </div>
                    </div>
                    <div
                      ref={docsContentRef}
                      className="docs-detail-body markdown-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof window.marked !== 'undefined' && selectedDoc.summary
                            ? window.marked.parse(selectedDoc.summary)
                            : selectedDoc.summary
                      }}
                    />
                  </div>
                ) : (
                  <div className="canvas-placeholder">No document selected.</div>
                )}
              </div>
            ) : (
              <div className="canvas-placeholder">
                No docs configured in this demo snapshot.
              </div>
            )}
          </>
        )}

        {view === 'Files' && (
          <>
            {files.length > 0 ? (
              <div
                className="files-layout"
                onMouseMove={(e) => handleSplitMouseMove('files', e)}
                onMouseUp={endSplitDrag}
                onMouseLeave={endSplitDrag}
              >
                <div className="files-list" style={{ width: filesSplitWidth }}>
                  <table className="files-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Owner</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => {
                        const active = selectedFile && selectedFile.id === file.id;
                        return (
                          <tr
                            key={file.id}
                            className={active ? 'files-row--active' : ''}
                            onClick={() => selectFile(file.id)}
                          >
                            <td>{file.name}</td>
                            <td>{file.type}</td>
                            <td>{file.size}</td>
                            <td>{file.owner}</td>
                            <td>{file.updated}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div
                  className={`splitter-vertical ${
                    splitDrag.active && splitDrag.target === 'files'
                      ? 'splitter-vertical--active'
                      : ''
                  }`}
                  onMouseDown={(e) => startSplitDrag('files', e)}
                />
                {selectedFile ? (
                  <div className="files-detail">
                    <div className="files-detail-header">
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {selectedFile.type} · {selectedFile.size} · {selectedFile.owner}
                        </div>
                      </div>
                      <div className="files-detail-actions">
                        <button
                          className="files-detail-button"
                          type="button"
                          disabled
                        >
                          Open (demo)
                        </button>
                        <button
                          className="files-detail-button"
                          type="button"
                          onClick={() => {
                            if (onCreateFile) onCreateFile();
                          }}
                        >
                          Upload (demo)
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '6px'
                      }}
                    >
                      In a real build this panel would show a preview or metadata for the
                      selected file.
                    </div>
                  </div>
                ) : (
                  <div className="canvas-placeholder">No file selected.</div>
                )}
              </div>
            ) : (
              <div className="canvas-placeholder">
                No files configured in this demo snapshot.
              </div>
            )}
          </>
        )}

        {view !== 'Dashboard' &&
          view !== 'Board' &&
          view !== 'List' &&
          view !== 'Timeline' &&
          view !== 'Calendar' &&
          view !== 'Docs' &&
          view !== 'Files' && (
            <div className="canvas-placeholder">
              The <strong>{view}</strong> view is a visual placeholder in this demo.
            </div>
          )}
      </div>
    </section>
  );
}
