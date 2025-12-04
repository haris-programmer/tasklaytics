/**
 * FlowEditor.jsx
 *
 * Modern React Flow-based visual flow editor
 * Features:
 * - ReactFlow for node-based workflow editing
 * - Custom nodes: Trigger, Condition, Action
 * - Visual connection system
 * - Flow validation and persistence
 * - Neumorphic styling
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import './FlowEditor.css';

// Custom Node Components
const TriggerNode = ({ data }) => {
  return (
    <div className="flow-node flow-node--trigger">
      <div className="flow-node__header">
        <span className="flow-node__icon">🎯</span>
        <span className="flow-node__title">Trigger</span>
      </div>
      <div className="flow-node__body">
        <strong>{data.eventType || 'Event'}</strong>
        {data.description && (
          <div className="flow-node__desc">{data.description}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="trigger-out"
        className="flow-node__handle flow-node__handle--source"
      />
    </div>
  );
};

const ConditionNode = ({ data }) => {
  return (
    <div className="flow-node flow-node--condition">
      <Handle
        type="target"
        position={Position.Left}
        id="condition-in"
        className="flow-node__handle flow-node__handle--target"
      />
      <div className="flow-node__header">
        <span className="flow-node__icon">🔀</span>
        <span className="flow-node__title">Condition</span>
      </div>
      <div className="flow-node__body">
        <div>
          <strong>{data.field}</strong> {data.operator}{' '}
          <strong>{data.value}</strong>
        </div>
        {data.description && (
          <div className="flow-node__desc">{data.description}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="condition-out"
        className="flow-node__handle flow-node__handle--source"
      />
    </div>
  );
};

const ActionNode = ({ data }) => {
  return (
    <div className="flow-node flow-node--action">
      <Handle
        type="target"
        position={Position.Left}
        id="action-in"
        className="flow-node__handle flow-node__handle--target"
      />
      <div className="flow-node__header">
        <span className="flow-node__icon">⚡</span>
        <span className="flow-node__title">Action</span>
      </div>
      <div className="flow-node__body">
        <strong>{data.actionType || 'Action'}</strong>
        {data.description && (
          <div className="flow-node__desc">{data.description}</div>
        )}
      </div>
    </div>
  );
};

// Node Properties Panel Components
const TriggerProperties = ({ data, onChange }) => {
  return (
    <div className="flow-props">
      <div className="flow-props__field">
        <label>Event Type</label>
        <select
          value={data.eventType || ''}
          onChange={(e) => onChange({ eventType: e.target.value })}
        >
          <option value="task.dropped">Task Dropped</option>
          <option value="task.dragstart">Task Drag Start</option>
          <option value="task.created">Task Created</option>
          <option value="task.updated">Task Updated</option>
          <option value="task.status_changed">Task Status Changed</option>
          <option value="button.clicked">Button Clicked</option>
          <option value="field.updated">Field Updated</option>
          <option value="workspace.committed">Workspace Committed</option>
        </select>
      </div>
      <div className="flow-props__field">
        <label>Description</label>
        <input
          type="text"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe when this triggers"
        />
      </div>
    </div>
  );
};

const ConditionProperties = ({ data, onChange }) => {
  return (
    <div className="flow-props">
      <div className="flow-props__field">
        <label>Field</label>
        <input
          type="text"
          value={data.field || ''}
          onChange={(e) => onChange({ field: e.target.value })}
          placeholder="e.g., status, toStatus"
        />
      </div>
      <div className="flow-props__field">
        <label>Operator</label>
        <select
          value={data.operator || 'equals'}
          onChange={(e) => onChange({ operator: e.target.value })}
        >
          <option value="equals">Equals</option>
          <option value="not_equals">Not Equals</option>
          <option value="contains">Contains</option>
          <option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
          <option value="exists">Exists</option>
          <option value="not_exists">Not Exists</option>
        </select>
      </div>
      <div className="flow-props__field">
        <label>Value</label>
        <input
          type="text"
          value={data.value || ''}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Expected value"
        />
      </div>
      <div className="flow-props__field">
        <label>Description</label>
        <input
          type="text"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe this condition"
        />
      </div>
    </div>
  );
};

const ActionProperties = ({ data, onChange }) => {
  const actionType = data.actionType || 'show_notification';

  const handleConfigChange = (key, value) => {
    const newConfig = { ...(data.config || {}), [key]: value };
    onChange({ config: newConfig });
  };

  return (
    <div className="flow-props">
      <div className="flow-props__field">
        <label>Action Type</label>
        <select
          value={actionType}
          onChange={(e) => onChange({ actionType: e.target.value, config: {} })}
        >
          <option value="show_notification">Show Notification</option>
          <option value="run_command">Run Command</option>
          <option value="update_field">Update Field</option>
          <option value="log_message">Log Message</option>
        </select>
      </div>

      {actionType === 'show_notification' && (
        <>
          <div className="flow-props__field">
            <label>Title</label>
            <input
              type="text"
              value={data.config?.title || ''}
              onChange={(e) => handleConfigChange('title', e.target.value)}
              placeholder="Notification title"
            />
          </div>
          <div className="flow-props__field">
            <label>Message</label>
            <textarea
              value={data.config?.message || ''}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              placeholder="Use {{variable}} for dynamic values"
            />
          </div>
        </>
      )}

      {actionType === 'run_command' && (
        <>
          <div className="flow-props__field">
            <label>Command Type</label>
            <input
              type="text"
              value={data.config?.commandType || ''}
              onChange={(e) => handleConfigChange('commandType', e.target.value)}
              placeholder="e.g., CreateTask"
            />
          </div>
          <div className="flow-props__field">
            <label>Parameters (JSON)</label>
            <textarea
              value={data.config?.params ? JSON.stringify(data.config.params, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  handleConfigChange('params', params);
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"key": "value"}'
            />
          </div>
        </>
      )}

      {actionType === 'update_field' && (
        <>
          <div className="flow-props__field">
            <label>Target Type</label>
            <select
              value={data.config?.targetType || 'task'}
              onChange={(e) => handleConfigChange('targetType', e.target.value)}
            >
              <option value="task">Task</option>
              <option value="workspace">Workspace</option>
            </select>
          </div>
          <div className="flow-props__field">
            <label>Target ID</label>
            <input
              type="text"
              value={data.config?.targetId || ''}
              onChange={(e) => handleConfigChange('targetId', e.target.value)}
              placeholder="e.g., {{taskId}}"
            />
          </div>
          <div className="flow-props__field">
            <label>Field</label>
            <input
              type="text"
              value={data.config?.field || ''}
              onChange={(e) => handleConfigChange('field', e.target.value)}
              placeholder="e.g., status, assignee"
            />
          </div>
          <div className="flow-props__field">
            <label>Value</label>
            <input
              type="text"
              value={data.config?.value || ''}
              onChange={(e) => handleConfigChange('value', e.target.value)}
              placeholder="New value"
            />
          </div>
        </>
      )}

      {actionType === 'log_message' && (
        <>
          <div className="flow-props__field">
            <label>Message</label>
            <textarea
              value={data.config?.message || ''}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              placeholder="Log message"
            />
          </div>
          <div className="flow-props__field">
            <label>Level</label>
            <select
              value={data.config?.level || 'info'}
              onChange={(e) => handleConfigChange('level', e.target.value)}
            >
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </>
      )}

      <div className="flow-props__field">
        <label>Description</label>
        <input
          type="text"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe this action"
        />
      </div>
    </div>
  );
};

const NodePropertiesPanel = ({ node, onChange }) => {
  if (!node) return null;

  switch (node.type) {
    case 'trigger':
      return <TriggerProperties data={node.data} onChange={onChange} />;
    case 'condition':
      return <ConditionProperties data={node.data} onChange={onChange} />;
    case 'action':
      return <ActionProperties data={node.data} onChange={onChange} />;
    default:
      return <div>Unknown node type</div>;
  }
};

// Main FlowEditor Component
const FlowEditor = ({ flow = null, onSave = () => {}, onCancel = () => {} }) => {
  // Node types definition
  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      condition: ConditionNode,
      action: ActionNode
    }),
    []
  );

  // Initialize flow data
  const initialNodes = useMemo(() => {
    if (flow?.nodes) {
      return flow.nodes;
    }
    // Default: Start with a trigger node
    return [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Trigger',
          eventType: 'task.dropped',
          description: 'When a task is dropped'
        }
      }
    ];
  }, [flow]);

  const initialEdges = useMemo(() => {
    return flow?.edges || [];
  }, [flow]);

  // State management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowName, setFlowName] = useState(flow?.name || '');
  const [flowDescription, setFlowDescription] = useState(flow?.description || '');

  // Update flow metadata when flow prop changes
  useEffect(() => {
    if (flow) {
      setFlowName(flow.name || '');
      setFlowDescription(flow.description || '');
    }
  }, [flow]);

  // Handle edge connections
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Handle adding new nodes
  const handleAddNode = (nodeType) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: {
        x: Math.random() * 300 + 200,
        y: Math.random() * 300 + 200
      },
      data: getDefaultNodeData(nodeType)
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Get default data for node types
  const getDefaultNodeData = (nodeType) => {
    switch (nodeType) {
      case 'trigger':
        return {
          label: 'Trigger',
          eventType: 'task.dropped',
          description: 'Event trigger'
        };
      case 'condition':
        return {
          label: 'Condition',
          field: 'status',
          operator: 'equals',
          value: 'Done',
          description: 'Check condition'
        };
      case 'action':
        return {
          label: 'Action',
          actionType: 'show_notification',
          config: { message: 'Action executed' },
          description: 'Perform action'
        };
      default:
        return { label: 'Node', description: '' };
    }
  };

  // Handle node data changes
  const handleNodeDataChange = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, ...newData }
      });
    }
  };

  // Handle save
  const handleSave = () => {
    const flowDefinition = {
      id: flow?.id || `flow-${Date.now()}`,
      name: flowName || 'Untitled Flow',
      description: flowDescription || '',
      nodes,
      edges,
      enabled: true,
      sendToBackend: true,
      // Convert nodes to legacy format for execution
      trigger: extractTrigger(nodes),
      conditions: extractConditions(nodes, edges),
      actions: extractActions(nodes, edges)
    };

    onSave(flowDefinition);
  };

  // Extract trigger information
  const extractTrigger = (nodes) => {
    const triggerNode = nodes.find((n) => n.type === 'trigger');
    if (triggerNode) {
      return {
        type: triggerNode.data.eventType,
        conditions: []
      };
    }
    return { type: 'manual', conditions: [] };
  };

  // Extract conditions
  const extractConditions = (nodes, edges) => {
    const conditionNodes = nodes.filter((n) => n.type === 'condition');
    return conditionNodes.map((node) => ({
      field: node.data.field,
      operator: node.data.operator,
      value: node.data.value
    }));
  };

  // Extract actions
  const extractActions = (nodes, edges) => {
    const actionNodes = nodes.filter((n) => n.type === 'action');
    // Sort by position (top to bottom)
    actionNodes.sort((a, b) => a.position.y - b.position.y);

    return actionNodes.map((node) => ({
      type: node.data.actionType,
      config: node.data.config
    }));
  };

  // Handle delete node
  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  };

  return (
    <div className="flow-editor-overlay">
      <div className="flow-editor">
        {/* Header */}
        <div className="flow-editor__header">
          <div className="flow-editor__header-left">
            <h3 className="flow-editor__title">Flow Editor</h3>
            <input
              type="text"
              className="flow-editor__name-input"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Flow name"
            />
          </div>
          <div className="flow-editor__header-right">
            <button
              type="button"
              className="flow-editor__btn flow-editor__btn--primary"
              onClick={handleSave}
            >
              Save Flow
            </button>
            <button
              type="button"
              className="flow-editor__btn flow-editor__btn--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flow-editor__toolbar">
          <div className="flow-editor__toolbar-label">Add Node:</div>
          <button
            type="button"
            className="flow-editor__toolbar-btn"
            onClick={() => handleAddNode('trigger')}
          >
            + Trigger
          </button>
          <button
            type="button"
            className="flow-editor__toolbar-btn"
            onClick={() => handleAddNode('condition')}
          >
            + Condition
          </button>
          <button
            type="button"
            className="flow-editor__toolbar-btn"
            onClick={() => handleAddNode('action')}
          >
            + Action
          </button>
          {selectedNode && (
            <button
              type="button"
              className="flow-editor__toolbar-btn flow-editor__toolbar-btn--danger"
              onClick={handleDeleteNode}
            >
              Delete Node
            </button>
          )}
        </div>

        {/* Canvas and Properties */}
        <div className="flow-editor__main">
          <div className="flow-editor__canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>

          {selectedNode && (
            <div className="flow-editor__properties">
              <div className="flow-editor__properties-header">
                <strong>Node Properties</strong>
                <button
                  type="button"
                  className="flow-editor__properties-close"
                  onClick={() => setSelectedNode(null)}
                  aria-label="Close properties panel"
                >
                  ✕
                </button>
              </div>
              <NodePropertiesPanel
                node={selectedNode}
                onChange={(newData) =>
                  handleNodeDataChange(selectedNode.id, newData)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowEditor;
