/* =========================================
   History Panel Component
   Slide-out panel with timeline navigation
   3D Neumorphic Styling
   ========================================= */

import React from 'react';
import './HistoryPanel.css';

/**
 * HistoryPanel - A slide-out panel from the right side displaying history timeline
 *
 * @param {Object} props
 * @param {Array} props.history - Array of snapshot objects with { id, label, timestamp }
 * @param {number} props.currentIndex - Current position in history
 * @param {number} props.commitIndex - Index of the last committed baseline
 * @param {Function} props.onJump - Callback when user jumps to a history point (index)
 * @param {Function} props.onClose - Callback to close the panel
 * @param {Function} props.onUndo - Optional callback for undo action
 * @param {Function} props.onRedo - Optional callback for redo action
 * @param {boolean} props.isOpen - Whether the panel is open
 */
export default function HistoryPanel({
  history = [],
  currentIndex = 0,
  commitIndex = 0,
  onJump,
  onClose,
  onUndo,
  onRedo,
  isOpen = false
}) {
  const stepsSinceCommit = currentIndex - commitIndex;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const isCurrent = (idx) => idx === currentIndex;
  const isCommitted = (idx) => idx === commitIndex;
  const canJumpTo = (idx) => idx >= 0 && idx <= commitIndex;

  const handleJump = (idx) => {
    if (canJumpTo(idx) && onJump) {
      onJump(idx);
    }
  };

  const handleUndo = () => {
    if (canUndo && onUndo) {
      onUndo();
    }
  };

  const handleRedo = () => {
    if (canRedo && onRedo) {
      onRedo();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="history-panel__backdrop" onClick={handleClose} />}

      {/* Panel */}
      <aside className={`history-panel ${isOpen ? 'history-panel--open' : ''}`}>
        {/* Header */}
        <div className="history-panel__header">
          <div className="history-panel__header-content">
            <div className="history-panel__title-section">
              <h2 className="history-panel__title">History</h2>
              <div className="history-panel__meta">
                {history.length} {history.length === 1 ? 'snapshot' : 'snapshots'} ·{' '}
                {stepsSinceCommit === 0
                  ? 'all committed'
                  : `${stepsSinceCommit} since commit`}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="history-panel__controls">
              <button
                className="history-nav-button"
                disabled={!canUndo}
                onClick={handleUndo}
                title="Undo (◀)"
                aria-label="Undo"
              >
                ◀
              </button>
              <button
                className="history-nav-button"
                disabled={!canRedo}
                onClick={handleRedo}
                title="Redo (▶)"
                aria-label="Redo"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            className="history-panel__close"
            onClick={handleClose}
            aria-label="Close history panel"
          >
            ✕
          </button>
        </div>

        {/* Timeline List */}
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-list__empty">
              <p>No history yet</p>
              <span>Make some changes to see your history timeline</span>
            </div>
          ) : (
            history.map((snap, idx) => {
              const itemClasses = [
                'history-item',
                isCurrent(idx) && 'history-item--current',
                isCommitted(idx) && 'history-item--committed',
                canJumpTo(idx) ? 'history-item--clickable' : 'history-item--disabled'
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={snap.id != null ? snap.id : idx}
                  className={itemClasses}
                  onClick={() => handleJump(idx)}
                  role="button"
                  tabIndex={canJumpTo(idx) ? 0 : -1}
                  aria-label={`Jump to ${snap.label || 'Snapshot'} at index ${idx}`}
                  onKeyPress={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && canJumpTo(idx)) {
                      handleJump(idx);
                    }
                  }}
                >
                  {/* Current Position Indicator */}
                  {isCurrent(idx) && (
                    <div className="history-item__indicator" aria-hidden="true">
                      <div className="history-item__indicator-pulse" />
                    </div>
                  )}

                  {/* Timeline Dot */}
                  <div className="history-item__dot" aria-hidden="true">
                    {isCommitted(idx) && <div className="history-item__dot-inner" />}
                  </div>

                  {/* Content */}
                  <div className="history-item__main">
                    <div className="history-item__header">
                      <div className="history-item__label">
                        #{idx} · {snap.label || 'Snapshot'}
                      </div>
                      {snap.timestamp && (
                        <div className="history-item__timestamp">
                          {snap.timestamp}
                        </div>
                      )}
                    </div>

                    {/* Commit Badge */}
                    {isCommitted(idx) && (
                      <div className="history-item__badge">
                        <span className="history-item__badge-icon">✓</span>
                        Committed Baseline
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
