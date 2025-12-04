import { useState, useCallback, useMemo } from 'react';
import { useConfig } from './contexts/ConfigContext';
import { useHistory } from './hooks/useHistory';
import { useFlows } from './hooks/useFlows';
import { createInitialSnapshot, INITIAL_FLOW_LIBRARY, pointsForDifficulty, inferDifficultyFromText } from './data/initialData';
import { executeFlow } from './flows/FlowEngine';
import { PERMISSIONS, roleHas } from './utils/permissions';

// Layout Components
import { LeftToolbar } from './components/LeftToolbar';
import { TopBar } from './components/TopBar';
import { AiBar } from './components/AiBar';
import { HistoryPanel } from './components/HistoryPanel';
import { FlowPanel } from './components/FlowPanel';
import { FlowEditor } from './components/FlowEditor';

// View Components
import {
  DashboardView,
  BoardView,
  ListView,
  TimelineView,
  CalendarView,
  DocsView,
  FilesView
} from './components/views';

import './App.css';

function App() {
  const { config, toggleTheme, hasPermission } = useConfig();
  const role = config?.user?.role || 'workspace_owner';

  // History management
  const {
    history,
    currentIndex,
    commitIndex,
    currentSnapshot,
    uncommittedSteps,
    canUndo,
    canRedo,
    applyChange,
    undo,
    redo,
    commit,
    jump
  } = useHistory(createInitialSnapshot());

  // Flow management
  const {
    flowLibrary,
    flowBindings,
    flowMode,
    selectedFlowTarget,
    saveFlow,
    toggleFlowMode,
    handleFlowTargetClick: onFlowTargetClick,
    attachFlow,
    detachFlow,
    fireFlowsForEvent,
    flowTargetKeyForTask,
    getFlowBindingsForTarget
  } = useFlows(INITIAL_FLOW_LIBRARY);

  // UI State
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showFlowPanel, setShowFlowPanel] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hi, I'm the workspace AI. Update the project brief, ask me to generate tasks, or send a command like: create task: Add dark mode; difficulty=L"
    }
  ]);
  const [aiIsListening, setAiIsListening] = useState(false);

  // Current view from snapshot
  const currentView = currentSnapshot?.view || 'Dashboard';

  // Add AI message helper
  const addAiMessage = useCallback((role, text) => {
    setAiMessages(prev => [...prev, { id: Date.now(), role, text }]);
  }, []);

  // Command handler
  const runCommand = useCallback((cmd) => {
    if (!cmd || !cmd.type) return;

    switch (cmd.type) {
      case 'SetView':
        applyChange(`Switch to ${cmd.view}`, snap => {
          snap.view = cmd.view;
        });
        break;

      case 'CreateTask': {
        const taskId = 'T-' + (100 + (currentSnapshot?.tasks?.length || 0) + 1);
        const newTask = {
          id: taskId,
          title: cmd.title || 'New Task',
          status: cmd.status || 'Backlog',
          assignee: cmd.assignee || 'Unassigned',
          points: cmd.points || pointsForDifficulty(cmd.difficulty || 'M'),
          type: cmd.type || 'Story',
          tags: cmd.tags || [],
          difficulty: cmd.difficulty || 'M',
          blocked: false
        };
        applyChange(`Create task: ${newTask.title}`, snap => {
          snap.tasks = [...(snap.tasks || []), newTask];
        });
        addAiMessage('assistant', `Created task ${taskId}: ${newTask.title}`);
        break;
      }

      case 'MoveTask': {
        applyChange(`Move ${cmd.taskId} to ${cmd.toStatus}`, snap => {
          const task = snap.tasks?.find(t => t.id === cmd.taskId);
          if (task) {
            task.status = cmd.toStatus;
          }
        });
        // Fire flow event
        fireFlowsForEvent('task.dropped', {
          eventType: 'task.dropped',
          taskId: cmd.taskId,
          fromStatus: cmd.fromStatus,
          toStatus: cmd.toStatus,
          timestamp: new Date().toISOString()
        }, {
          runCommand,
          currentSnapshot,
          addAiSystemMessage: (msg) => addAiMessage('system', msg)
        });
        break;
      }

      case 'UpdateTaskField': {
        applyChange(`Update ${cmd.taskId} ${cmd.field}`, snap => {
          const task = snap.tasks?.find(t => t.id === cmd.taskId);
          if (task) {
            task[cmd.field] = cmd.value;
          }
        });
        break;
      }

      case 'UpdateBrief':
        applyChange('Update project brief', snap => {
          snap.projectBrief = cmd.text;
        });
        break;

      case 'LockBrief':
        applyChange('Lock project brief', snap => {
          snap.briefLocked = true;
        });
        break;

      case 'UnlockBrief':
        applyChange('Unlock project brief', snap => {
          snap.briefLocked = false;
        });
        break;

      case 'GenerateTasksFromBrief': {
        const brief = currentSnapshot?.projectBrief || '';
        const lines = brief.split('\n').filter(l => l.trim().startsWith('-'));
        const newTasks = lines.map((line, i) => {
          const title = line.replace(/^-\s*/, '').trim();
          const diff = inferDifficultyFromText(title);
          return {
            id: 'T-' + (200 + i),
            title,
            status: 'Backlog',
            assignee: 'Unassigned',
            points: pointsForDifficulty(diff),
            type: 'Story',
            tags: ['Generated'],
            difficulty: diff,
            blocked: false
          };
        });
        if (newTasks.length > 0) {
          applyChange(`Generate ${newTasks.length} tasks from brief`, snap => {
            snap.tasks = [...(snap.tasks || []), ...newTasks];
            snap.briefGeneratedTasksCount = (snap.briefGeneratedTasksCount || 0) + newTasks.length;
          });
          addAiMessage('assistant', `Generated ${newTasks.length} tasks from the project brief.`);
        } else {
          addAiMessage('assistant', 'No bullet points found in brief. Add lines starting with "-" to generate tasks.');
        }
        break;
      }

      case 'UpdateTimeline':
        applyChange('Update timeline item', snap => {
          const item = snap.schedule?.timeline?.find(t => t.id === cmd.itemId);
          if (item) {
            if (cmd.startOffset !== undefined) item.startOffset = cmd.startOffset;
            if (cmd.duration !== undefined) item.duration = cmd.duration;
          }
        });
        break;

      case 'CreateDoc':
        applyChange('Create document', snap => {
          const newDoc = {
            id: 'DOC-' + Date.now(),
            title: cmd.title || 'New Document',
            owner: config?.user?.name || 'Unknown',
            updated: new Date().toISOString().split('T')[0],
            summary: cmd.content || '# New Document\n\nStart writing here...'
          };
          snap.docs = [...(snap.docs || []), newDoc];
        });
        break;

      case 'Commit':
        commit();
        addAiMessage('system', 'Changes committed successfully.');
        fireFlowsForEvent('workspace.committed', {
          eventType: 'workspace.committed',
          timestamp: new Date().toISOString()
        }, {
          runCommand,
          currentSnapshot,
          addAiSystemMessage: (msg) => addAiMessage('system', msg)
        });
        break;

      default:
        console.warn('Unknown command type:', cmd.type);
    }
  }, [applyChange, currentSnapshot, addAiMessage, commit, fireFlowsForEvent, config]);

  // AI message handler
  const handleAiSend = useCallback((text) => {
    addAiMessage('user', text);

    // Simple command parsing
    const lower = text.toLowerCase();

    if (lower.startsWith('create task:')) {
      const rest = text.slice(12).trim();
      const parts = rest.split(';');
      const title = parts[0].trim();
      const props = {};
      parts.slice(1).forEach(p => {
        const [key, val] = p.split('=').map(s => s.trim());
        if (key && val) props[key] = val;
      });
      runCommand({ type: 'CreateTask', title, ...props });
    } else if (lower.includes('generate tasks')) {
      runCommand({ type: 'GenerateTasksFromBrief' });
    } else if (lower.includes('switch to') || lower.includes('go to')) {
      const views = ['dashboard', 'board', 'list', 'timeline', 'calendar', 'docs', 'files'];
      const found = views.find(v => lower.includes(v));
      if (found) {
        const view = found.charAt(0).toUpperCase() + found.slice(1);
        runCommand({ type: 'SetView', view });
        addAiMessage('assistant', `Switched to ${view} view.`);
      }
    } else if (lower.includes('commit')) {
      runCommand({ type: 'Commit' });
    } else if (lower.includes('undo')) {
      undo();
      addAiMessage('assistant', 'Undone last change.');
    } else if (lower.includes('redo')) {
      redo();
      addAiMessage('assistant', 'Redone change.');
    } else {
      addAiMessage('assistant', `I understood: "${text}". Try commands like "create task: Fix bug; difficulty=S" or "switch to Board".`);
    }
  }, [addAiMessage, runCommand, undo, redo]);

  // View change handler
  const handleViewChange = useCallback((view) => {
    runCommand({ type: 'SetView', view });
  }, [runCommand]);

  // Task move handler
  const handleMoveTask = useCallback((taskId, fromStatus, toStatus) => {
    runCommand({ type: 'MoveTask', taskId, fromStatus, toStatus });
  }, [runCommand]);

  // Flow target click handler
  const handleFlowTargetClick = useCallback((target) => {
    if (flowMode) {
      onFlowTargetClick(target);
      setShowFlowPanel(true);
    }
  }, [flowMode, onFlowTargetClick]);

  // Render current view
  const renderView = () => {
    const viewProps = {
      snapshot: currentSnapshot,
      onCommand: runCommand,
      flowMode,
      flowBindings,
      onFlowTargetClick: handleFlowTargetClick
    };

    switch (currentView) {
      case 'Dashboard':
        return <DashboardView {...viewProps} />;
      case 'Board':
        return (
          <BoardView
            {...viewProps}
            onMoveTask={handleMoveTask}
          />
        );
      case 'List':
        return <ListView {...viewProps} />;
      case 'Timeline':
        return <TimelineView {...viewProps} />;
      case 'Calendar':
        return <CalendarView {...viewProps} />;
      case 'Docs':
        return <DocsView {...viewProps} />;
      case 'Files':
        return <FilesView {...viewProps} />;
      default:
        return <DashboardView {...viewProps} />;
    }
  };

  return (
    <div className="app" data-flow-mode={flowMode}>
      {/* Left Toolbar */}
      <LeftToolbar
        workspace={currentSnapshot?.workspace}
        uncommittedSteps={uncommittedSteps}
        canUndo={canUndo}
        canRedo={canRedo}
        onRunCommand={runCommand}
        onUndo={undo}
        onRedo={redo}
        onCommit={() => runCommand({ type: 'Commit' })}
        onOpenHistory={() => setShowHistoryPanel(true)}
        onToggleFlowMode={toggleFlowMode}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Bar */}
        <TopBar
          currentView={currentView}
          onViewChange={handleViewChange}
          workspace={currentSnapshot?.workspace}
          user={config?.user}
          uncommittedSteps={uncommittedSteps}
          flowMode={flowMode}
          onToggleFlowMode={toggleFlowMode}
          onOpenFlowPanel={() => setShowFlowPanel(true)}
        />

        {/* Main Canvas / View */}
        <main className="app-canvas">
          {renderView()}
        </main>

        {/* AI Bar */}
        <AiBar
          messages={aiMessages}
          onSendMessage={handleAiSend}
          isListening={aiIsListening}
          onToggleVoice={() => setAiIsListening(!aiIsListening)}
          voiceEnabled={config?.ai?.voiceEnabled}
        />
      </div>

      {/* History Panel */}
      {showHistoryPanel && (
        <HistoryPanel
          history={history}
          currentIndex={currentIndex}
          commitIndex={commitIndex}
          onJump={jump}
          onClose={() => setShowHistoryPanel(false)}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      )}

      {/* Flow Panel */}
      {showFlowPanel && (
        <FlowPanel
          flowMode={flowMode}
          selectedTarget={selectedFlowTarget}
          flowBindings={flowBindings}
          flowLibrary={flowLibrary}
          onAttachFlow={attachFlow}
          onDetachFlow={detachFlow}
          onClose={() => setShowFlowPanel(false)}
          onCreateFlow={() => setEditingFlow({ id: null, name: '', actions: [] })}
          onEditFlow={(flow) => setEditingFlow(flow)}
        />
      )}

      {/* Flow Editor Modal */}
      {editingFlow && (
        <FlowEditor
          flow={editingFlow}
          onSave={(flow) => {
            saveFlow(flow);
            setEditingFlow(null);
          }}
          onCancel={() => setEditingFlow(null)}
        />
      )}
    </div>
  );
}

export default App;
