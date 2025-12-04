/**
 * FlowPanel.jsx
 *
 * Modern React component for managing automation flows
 * Features:
 * - Flow library display with enable/disable toggles
 * - Selected target display
 * - Attach/detach flow functionality
 * - Tabbed interface for bindings and library
 * - Neumorphic styling
 */

import React, { useState } from 'react';
import './FlowPanel.css';

const FlowPanel = ({
  flowMode = false,
  selectedTarget = null,
  flowBindings = {},
  flowLibrary = [],
  onAttachFlow = () => {},
  onDetachFlow = () => {},
  onClose = () => {},
  onCreateFlow = () => {},
  onEditFlow = () => {},
  executionHistory = []
}) => {
  const [activeTab, setActiveTab] = useState('bindings');

  // Extract target information
  const targetKey = selectedTarget?.key;
  const targetLabel = selectedTarget?.label || 'No element selected';
  const bindings = targetKey ? (flowBindings[targetKey] || []) : [];

  // Handle flow attachment
  const handleAttachClick = (flowId, eventType) => {
    if (targetKey) {
      onAttachFlow(flowId, eventType);
    }
  };

  // Render individual binding
  const renderBinding = (binding) => {
    const flow = flowLibrary.find(f => f.id === binding.flowId);

    return (
      <div key={binding.id} className="flow-binding-row">
        <div className="flow-binding-row__main">
          <div className="flow-binding-row__name">
            {flow?.name || binding.flowId}
          </div>
          <div className="flow-binding-row__meta">
            Trigger: {binding.eventType || 'manual'}
          </div>
        </div>
        <button
          type="button"
          className="flow-binding-row__remove"
          onClick={() => onDetachFlow(binding.id)}
          aria-label="Remove binding"
        >
          ✕
        </button>
      </div>
    );
  };

  // Render execution history
  const renderExecutionHistory = () => {
    if (!executionHistory || executionHistory.length === 0) {
      return (
        <div className="flow-panel__hint">
          No flow executions yet.
        </div>
      );
    }

    return (
      <div className="flow-execution-history">
        {executionHistory.slice(0, 10).map(exec => {
          const statusClass = `flow-exec-status--${exec.status}`;

          return (
            <div key={exec.id} className="flow-exec-item">
              <div className="flow-exec-item__header">
                <strong>{exec.flowName}</strong>
                <span className={`flow-exec-status ${statusClass}`}>
                  {exec.status}
                </span>
              </div>
              <div className="flow-exec-item__meta">
                {exec.eventType} • {exec.startTime}
              </div>
              {exec.actionsPerformed?.length > 0 && (
                <div className="flow-exec-item__actions">
                  {exec.actionsPerformed.length} actions performed
                </div>
              )}
              {exec.errors?.length > 0 && (
                <div className="flow-exec-item__errors">
                  {exec.errors.length} errors
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="flow-panel">
      {/* Header */}
      <div className="flow-panel__header">
        <div className="flow-panel__title">Flows</div>
        <button
          type="button"
          className="flow-panel__close"
          onClick={onClose}
          aria-label="Close flow panel"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flow-panel__tabs">
        <button
          type="button"
          className={`flow-panel__tab ${activeTab === 'bindings' ? 'flow-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('bindings')}
        >
          Bindings
        </button>
        <button
          type="button"
          className={`flow-panel__tab ${activeTab === 'library' ? 'flow-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          Library
        </button>
        <button
          type="button"
          className={`flow-panel__tab ${activeTab === 'history' ? 'flow-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Bindings Tab Content */}
      {activeTab === 'bindings' && (
        <div className="flow-panel__content">
          <div className="flow-panel__section">
            <div className="flow-panel__label">Selected Element</div>
            <div className="flow-panel__target">
              {targetLabel}
              {targetKey && (
                <span className="flow-panel__target-key">({targetKey})</span>
              )}
            </div>
            {!targetKey && (
              <div className="flow-panel__hint">
                Flow mode is active. Click a task, timeline bar, or other
                element in the canvas to attach a flow.
              </div>
            )}
          </div>

          <div className="flow-panel__section">
            <div className="flow-panel__label">Attached Flows</div>
            {bindings.length === 0 && (
              <div className="flow-panel__hint">
                No flows attached yet. Use the library tab to add one.
              </div>
            )}
            {bindings.length > 0 && (
              <div className="flow-panel__bindings">
                {bindings.map(renderBinding)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Library Tab Content */}
      {activeTab === 'library' && (
        <div className="flow-panel__content">
          <div className="flow-panel__section">
            <button
              type="button"
              className="flow-panel__create-btn"
              onClick={onCreateFlow}
            >
              + Create New Flow
            </button>
          </div>

          <div className="flow-panel__section">
            <div className="flow-panel__label">Available Flows</div>
            {flowLibrary.length === 0 && (
              <div className="flow-panel__hint">
                No flows available. Create your first flow to get started.
              </div>
            )}
            <div className="flow-panel__catalog">
              {flowLibrary.map(flow => (
                <div key={flow.id} className="flow-panel__catalog-item-row">
                  <div
                    className={`flow-panel__catalog-item ${targetKey ? 'flow-panel__catalog-item--clickable' : ''}`}
                    onClick={() => {
                      if (targetKey) {
                        handleAttachClick(flow.id, flow.defaultTrigger);
                      }
                    }}
                    role={targetKey ? 'button' : 'presentation'}
                    tabIndex={targetKey ? 0 : -1}
                  >
                    <div className="flow-panel__catalog-name">
                      {flow.name}
                    </div>
                    <div className="flow-panel__catalog-desc">
                      {flow.description}
                    </div>
                    {flow.enabled !== undefined && (
                      <div className="flow-panel__catalog-status">
                        <span className={`flow-status-badge flow-status-badge--${flow.enabled ? 'enabled' : 'disabled'}`}>
                          {flow.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="flow-panel__edit-btn"
                    onClick={() => onEditFlow(flow)}
                    title="Edit flow"
                    aria-label={`Edit ${flow.name}`}
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="flow-panel__content">
          <div className="flow-panel__section">
            <div className="flow-panel__label">Execution History</div>
            {renderExecutionHistory()}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FlowPanel;
