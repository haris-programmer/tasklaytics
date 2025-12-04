import './ListView.css';

/**
 * ListView Component
 *
 * Table view of tasks with:
 * - Table view of all tasks
 * - Sortable columns
 * - Status badges
 * - Inline editing support (placeholder)
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 */
export function ListView({ snapshot = {} }) {
  // Extract data from snapshot
  const tasks = snapshot.tasks || [];

  const getStatusClass = (status) => {
    const statusMap = {
      'Backlog': 'status-badge--backlog',
      'Ready': 'status-badge--ready',
      'In Progress': 'status-badge--progress',
      'Review': 'status-badge--review',
      'Done': 'status-badge--done'
    };
    return statusMap[status] || 'status-badge--default';
  };

  const getDifficultyClass = (difficulty) => {
    const diffMap = {
      'XS': 'difficulty-badge--xs',
      'S': 'difficulty-badge--s',
      'M': 'difficulty-badge--m',
      'L': 'difficulty-badge--l',
      'XL': 'difficulty-badge--xl'
    };
    return diffMap[difficulty] || 'difficulty-badge--m';
  };

  return (
    <div className="list-view">
      <div className="list-view__container">
        <table className="task-table">
          <thead>
            <tr>
              <th className="task-table__th task-table__th--id">ID</th>
              <th className="task-table__th task-table__th--title">Title</th>
              <th className="task-table__th task-table__th--status">Status</th>
              <th className="task-table__th task-table__th--difficulty">Difficulty</th>
              <th className="task-table__th task-table__th--points">Points</th>
              <th className="task-table__th task-table__th--type">Type</th>
              <th className="task-table__th task-table__th--assignee">Assignee</th>
              <th className="task-table__th task-table__th--tags">Tags</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="task-table__row">
                <td className="task-table__td task-table__td--id">
                  <span className="task-id">{task.id}</span>
                </td>
                <td className="task-table__td task-table__td--title">
                  <span className="task-title">{task.title}</span>
                </td>
                <td className="task-table__td task-table__td--status">
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="task-table__td task-table__td--difficulty">
                  <span className={`difficulty-badge ${getDifficultyClass(task.difficulty)}`}>
                    {task.difficulty || 'M'}
                  </span>
                </td>
                <td className="task-table__td task-table__td--points">
                  <span className="task-points">{task.points}</span>
                </td>
                <td className="task-table__td task-table__td--type">
                  <span className="task-type">{task.type}</span>
                </td>
                <td className="task-table__td task-table__td--assignee">
                  <span className="task-assignee">{task.assignee}</span>
                </td>
                <td className="task-table__td task-table__td--tags">
                  <div className="task-tags">
                    {task.tags && task.tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="list-view__empty">
            No tasks to display
          </div>
        )}
      </div>
    </div>
  );
}
