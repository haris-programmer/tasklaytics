import { useState, useEffect } from 'react';
import './DashboardView.css';

/**
 * DashboardView Component
 *
 * Displays project overview with:
 * - Project brief editor (textarea with lock toggle)
 * - Generate tasks button
 * - Sprint info display
 * - Task statistics (counts by status)
 * - Progress bars
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 * @param {number} props.uncommitted - Count of uncommitted changes
 * @param {Function} props.onUpdateBrief - Handler for project brief updates
 * @param {Function} props.onGenerateFromBrief - Handler to generate tasks from brief
 * @param {Function} props.onRefineFromDelta - Handler to refine backlog from new points
 */
export function DashboardView({
  snapshot = {},
  uncommitted = 0,
  onUpdateBrief,
  onGenerateFromBrief,
  onRefineFromDelta
}) {
  const [briefDraft, setBriefDraft] = useState(snapshot.projectBrief || '');
  const [pointsDraft, setPointsDraft] = useState('');

  // Update brief draft when snapshot changes
  useEffect(() => {
    setBriefDraft(snapshot.projectBrief || '');
  }, [snapshot.id, snapshot.projectBrief]);

  // Extract data from snapshot
  const tasks = snapshot.tasks || [];
  const sprint = snapshot.sprint || null;
  const schedule = snapshot.schedule || { calendar: { events: [] } };

  // Calculate statistics
  const statuses = ['Backlog', 'Ready', 'In Progress', 'Review', 'Done'];
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

  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const upcomingEvents = (schedule.calendar.events || []).slice(0, 3);

  const handleRefineFromDeltaClick = () => {
    if (!pointsDraft.trim()) return;
    if (onRefineFromDelta) onRefineFromDelta(pointsDraft);
    setPointsDraft('');
  };

  return (
    <div className="dashboard-view">
      {/* Project Brief Section */}
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
                  className="brief-button"
                  type="button"
                  onClick={() => {
                    if (onUpdateBrief) onUpdateBrief(briefDraft);
                  }}
                >
                  Save brief
                </button>
                <button
                  className="brief-button brief-button--primary"
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
                placeholder="Add bullet points or notes…&#10;The AI will add / adjust tasks when you apply changes."
              />
              <div className="brief-footer">
                <button
                  className="brief-button brief-button--primary"
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

      {/* Summary Statistics Row */}
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

      {/* Details Row */}
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
            {upcomingEvents.map((ev) => (
              <li key={ev.id} className="dashboard-list__item">
                <span className="dashboard-list__item-label">
                  {ev.label}
                </span>
                <span className="dashboard-list__badge">
                  {ev.date}
                </span>
              </li>
            ))}
            {upcomingEvents.length === 0 && (
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
  );
}
