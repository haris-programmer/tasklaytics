/**
 * Initial data for the Tasklytics workspace
 */

export const INITIAL_FLOW_LIBRARY = [
  {
    id: 'flow-notify-ops-on-task-drop',
    name: 'Notify ops when task moves',
    description: 'Sends a CAF event when a task is dropped into a new column in the Board.',
    defaultTrigger: 'task.dropped',
    enabled: true,
    sendToBackend: true,
    trigger: { type: 'task.dropped' },
    conditions: [],
    actions: [
      {
        type: 'show_notification',
        config: {
          title: 'Task Moved',
          message: 'Task {{taskId}} moved to {{toStatus}}'
        }
      },
      {
        type: 'log_message',
        config: {
          message: 'Task movement logged',
          level: 'info'
        }
      }
    ]
  },
  {
    id: 'flow-checklist-on-task-start',
    name: 'Open checklist when work starts',
    description: 'Shows notification when a task enters In Progress.',
    defaultTrigger: 'task.dropped',
    enabled: true,
    sendToBackend: true,
    trigger: { type: 'task.dropped' },
    conditions: [
      { field: 'toStatus', operator: 'equals', value: 'In Progress' }
    ],
    actions: [
      {
        type: 'show_notification',
        config: {
          title: 'Task Started',
          message: 'Task {{taskId}} is now in progress!'
        }
      }
    ]
  },
  {
    id: 'flow-metrics-on-commit',
    name: 'Emit metrics on commit',
    description: 'Emits a CAF event whenever the user commits the local history.',
    defaultTrigger: 'workspace.committed',
    enabled: true,
    sendToBackend: true,
    trigger: { type: 'workspace.committed' },
    conditions: [],
    actions: [
      {
        type: 'log_message',
        config: {
          message: 'Workspace committed at {{timestamp}}',
          level: 'info'
        }
      }
    ]
  },
  {
    id: 'flow-task-completed',
    name: 'Task completion handler',
    description: 'Triggers when a task is moved to Done status.',
    defaultTrigger: 'task.dropped',
    enabled: true,
    sendToBackend: true,
    trigger: { type: 'task.dropped' },
    conditions: [
      { field: 'toStatus', operator: 'equals', value: 'Done' }
    ],
    actions: [
      {
        type: 'show_notification',
        config: {
          title: 'Task Completed!',
          message: 'Great job! Task {{taskId}} is complete.'
        }
      }
    ]
  }
];

export function pointsForDifficulty(diff) {
  switch (diff) {
    case 'XS': return 1;
    case 'S': return 2;
    case 'M': return 5;
    case 'L': return 8;
    case 'XL': return 13;
    default: return 3;
  }
}

export function inferDifficultyFromText(line) {
  const len = (line || '').length;
  if (len < 40) return 'S';
  if (len < 120) return 'M';
  return 'L';
}

export function createInitialSnapshot() {
  const now = () => new Date().toLocaleTimeString();

  const sprint = {
    name: 'Sprint 3 – Navigation',
    goal: 'Ship context toolbar, AI bar & professional themes',
    startDate: '2025-03-03',
    endDate: '2025-03-21'
  };

  const projectBriefText =
    'Website revamp for the core workspace experience.\n\n' +
    '- Replace legacy navigation with a context-aware left toolbar.\n' +
    '- Introduce a universal AI bar for text + voice commands.\n' +
    '- Ensure the dashboard gives an at-a-glance summary for leadership.\n' +
    '- Support both Kanban and Scrum workflows in a single workspace.';

  return {
    id: 0,
    label: 'Initial workspace state',
    timestamp: now(),
    workspace: {
      id: 'w-1',
      name: 'Website Revamp – Core',
      methodology: 'Scrum'
    },
    view: 'Dashboard',
    sprint,
    projectBrief: projectBriefText,
    briefLocked: false,
    briefGeneratedTasksCount: 0,
    tasks: [
      {
        id: 'T-101',
        title: 'Wireframe workspace dashboard',
        status: 'Backlog',
        assignee: 'Alex',
        points: 5,
        type: 'Story',
        tags: ['UX'],
        difficulty: 'M',
        blocked: false
      },
      {
        id: 'T-102',
        title: 'Implement left context toolbar',
        status: 'In Progress',
        assignee: 'Jamie',
        points: 3,
        type: 'Story',
        tags: ['UI'],
        difficulty: 'M',
        blocked: false
      },
      {
        id: 'T-103',
        title: 'Hook universal AI bar to backend',
        status: 'Ready',
        assignee: 'Sam',
        points: 8,
        type: 'Spike',
        tags: ['AI'],
        difficulty: 'L',
        blocked: false
      },
      {
        id: 'T-104',
        title: 'Add undo, history & commits',
        status: 'In Progress',
        assignee: 'Taylor',
        points: 5,
        type: 'Story',
        tags: ['History'],
        difficulty: 'L',
        blocked: false
      },
      {
        id: 'T-105',
        title: 'Design professional color schemes',
        status: 'Review',
        assignee: 'Alex',
        points: 3,
        type: 'Chore',
        tags: ['Visual'],
        difficulty: 'S',
        blocked: false
      },
      {
        id: 'T-106',
        title: 'Implement drag & drop between columns',
        status: 'Review',
        assignee: 'Jamie',
        points: 5,
        type: 'Story',
        tags: ['Interaction'],
        difficulty: 'M',
        blocked: false
      },
      {
        id: 'T-107',
        title: 'Commit model: share workspace state',
        status: 'Done',
        assignee: 'Jamie',
        points: 3,
        type: 'Story',
        tags: ['Model'],
        difficulty: 'S',
        blocked: false
      }
    ],
    wipLimits: {
      Backlog: 99,
      Ready: 7,
      'In Progress': 4,
      Review: 3,
      Done: 99
    },
    schedule: {
      timeline: [
        { id: 'TL-1', taskId: 'T-101', label: 'Wireframes', startOffset: 0, duration: 3 },
        { id: 'TL-2', taskId: 'T-102', label: 'Context toolbar', startOffset: 1, duration: 5 },
        { id: 'TL-3', taskId: 'T-103', label: 'AI bar integration', startOffset: 3, duration: 4 },
        { id: 'TL-4', taskId: 'T-104', label: 'History model', startOffset: 4, duration: 6 },
        { id: 'TL-5', taskId: 'T-107', label: 'Shareable baseline', startOffset: 6, duration: 3 }
      ],
      calendar: {
        month: '2025-03',
        events: [
          { id: 'EV-1', date: '2025-03-04', label: 'Daily stand-up' },
          { id: 'EV-2', date: '2025-03-08', label: 'Design review' },
          { id: 'EV-3', date: '2025-03-15', label: 'Sprint review' },
          { id: 'EV-4', date: '2025-03-18', label: 'Sprint retrospective' },
          { id: 'EV-5', date: '2025-03-20', label: 'Planning: Sprint 4' }
        ]
      }
    },
    docs: [
      {
        id: 'DOC-PRD',
        title: 'Product Requirements – Core navigation',
        owner: 'Alex',
        updated: '2025-02-28',
        summary: `## Overview

High-level goals, constraints, and success metrics for the website revamp.

### Goals

- **Improve user experience** with intuitive navigation
- **Increase engagement** by reducing friction
- **Support mobile-first** design approach

### Key Metrics

1. Time to complete key tasks
2. User satisfaction score
3. Mobile conversion rate

### Technical Constraints

- Must support modern browsers (Chrome, Firefox, Safari, Edge)
- Load time under 2 seconds
- Accessibility compliance (WCAG 2.1 AA)

### Timeline

Sprint window: **2025-03-01 → 2025-03-14**

> Note: This is a living document that will be updated as requirements evolve.`
      },
      {
        id: 'DOC-NAV',
        title: 'Navigation Design Spec',
        owner: 'Jamie',
        updated: '2025-03-01',
        summary: `## Navigation Architecture

Information architecture, navigation patterns, and open questions for the new workspace switcher.

### Primary Navigation

- Dashboard
- Board (Kanban)
- List view
- Timeline (Gantt)
- Calendar
- Docs
- Files

### Workspace Switcher

The workspace switcher should:

1. Show recent workspaces
2. Allow search/filter
3. Support keyboard shortcuts (\`Cmd+K\`)

### Navigation Flow

\`\`\`mermaid
graph TD
    A[App Start] --> B{User Logged In?}
    B -->|Yes| C[Dashboard]
    B -->|No| D[Login Screen]
    D --> C
    C --> E[View Selector]
    E --> F[Board View]
    E --> G[List View]
    E --> H[Timeline View]
    E --> I[Docs View]
    F --> J[Task Actions]
    G --> J
    H --> K[Schedule Actions]
    I --> L[Document Actions]
\`\`\`

### Implementation Notes

\`\`\`javascript
// Example navigation structure
const navigation = {
  primary: ['Dashboard', 'Board', 'List'],
  secondary: ['Timeline', 'Calendar', 'Docs', 'Files']
};
\`\`\`

### Open Questions

- How do we handle deep linking?
- Should we support custom views?
- What's the fallback for unsupported features?`
      },
      {
        id: 'DOC-AI',
        title: 'AI Interaction Guidelines',
        owner: 'Sam',
        updated: '2025-03-02',
        summary: `## AI Assistant Guidelines

Principles and examples for how the AI assistant should respond, escalate, and ask for clarification.

### Core Principles

**Be Clear**: Use simple, direct language
**Be Helpful**: Anticipate user needs
**Be Safe**: Never make destructive changes without confirmation

### Response Types

| Type | When to Use | Example |
|------|-------------|---------|
| Direct | Simple queries | "Here are your 5 active tasks" |
| Clarifying | Ambiguous input | "Did you mean the Board or List view?" |
| Escalation | Complex requests | "This requires admin permissions" |

### Voice Input

Users can enable voice input in settings. The AI should:

- Recognize natural language commands
- Handle background noise gracefully
- Provide visual feedback during processing

### Code Examples

When showing code, use proper syntax highlighting:

\`\`\`python
def process_task(task_id):
    """Process a task and update its status."""
    task = get_task(task_id)
    task.status = 'In Progress'
    return task.save()
\`\`\`

---

*Last updated: March 2, 2025*`
      }
    ],
    files: [
      {
        id: 'FILE-1',
        name: 'navigation-wireframes.pdf',
        type: 'PDF',
        size: '2.1 MB',
        owner: 'Alex',
        updated: '2025-03-01'
      },
      {
        id: 'FILE-2',
        name: 'workspace-copy-v3.docx',
        type: 'DOCX',
        size: '340 KB',
        owner: 'Taylor',
        updated: '2025-03-03'
      },
      {
        id: 'FILE-3',
        name: 'retro-template.xlsx',
        type: 'XLSX',
        size: '120 KB',
        owner: 'Sam',
        updated: '2025-02-27'
      }
    ]
  };
}

export default {
  INITIAL_FLOW_LIBRARY,
  createInitialSnapshot,
  pointsForDifficulty,
  inferDifficultyFromText
};
