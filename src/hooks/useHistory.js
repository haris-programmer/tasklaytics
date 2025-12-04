import { useState, useCallback } from 'react';

/**
 * useHistory - Custom hook for managing undo/redo history
 *
 * Tracks snapshots of state with commit points for saving/sharing.
 * Supports: undo, redo, commit, jump to specific history index.
 *
 * Based on the original App.js history management logic.
 */
export function useHistory(initialSnapshot) {
  // History array contains all snapshots
  const [history, setHistory] = useState(() => [initialSnapshot]);

  // Current position in history
  const [currentIndex, setCurrentIndex] = useState(0);

  // Last committed position (saved/shared baseline)
  const [commitIndex, setCommitIndex] = useState(0);

  // Derived state
  const currentSnapshot = history[currentIndex];
  const uncommittedSteps = currentIndex - commitIndex;
  const canUndo = currentIndex > commitIndex;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Apply a change to the current snapshot
   * Creates a new snapshot with the mutated state
   *
   * @param {string} label - Description of the change
   * @param {function} mutator - Function that mutates the snapshot clone
   */
  const applyChange = useCallback((label, mutator) => {
    const base = currentSnapshot;

    // Deep clone the current snapshot
    const clone = JSON.parse(JSON.stringify(base));

    // Apply mutations
    if (typeof mutator === 'function') {
      mutator(clone);
    }

    // Update metadata
    const stepId = history.length;
    clone.id = stepId;
    clone.label = label;
    clone.timestamp = new Date().toLocaleTimeString();

    // Trim any forward history and append new snapshot
    setHistory((prev) => {
      const trimmed = prev.slice(0, currentIndex + 1);
      return [...trimmed, clone];
    });

    // Move to the new snapshot
    setCurrentIndex((prev) => prev + 1);
  }, [currentSnapshot, currentIndex, history.length]);

  /**
   * Undo - Move back one step in history (if possible)
   */
  const undo = useCallback(() => {
    if (!canUndo) return;
    setCurrentIndex((prev) => prev - 1);
  }, [canUndo]);

  /**
   * Redo - Move forward one step in history (if possible)
   */
  const redo = useCallback(() => {
    if (!canRedo) return;
    setCurrentIndex((prev) => prev + 1);
  }, [canRedo]);

  /**
   * Commit - Mark current position as saved/shared baseline
   * Updates the snapshot to indicate it has been committed
   */
  const commit = useCallback(() => {
    setHistory((prev) => {
      const list = [...prev];
      const snap = list[currentIndex];
      if (!snap) return prev;

      // Mark as committed
      const updated = {
        ...snap,
        committed: true,
        label: `${snap.label || 'Snapshot'} (committed)`
      };

      list[currentIndex] = updated;
      return list;
    });

    setCommitIndex(currentIndex);
  }, [currentIndex]);

  /**
   * Jump - Navigate to a specific history index
   * Only allows jumping forward from commit point (no jumping back past commits)
   *
   * @param {number} index - Target history index
   */
  const jump = useCallback((index) => {
    if (index < commitIndex || index < 0 || index >= history.length) {
      return;
    }
    setCurrentIndex(index);
  }, [commitIndex, history.length]);

  return {
    // State
    history,
    currentIndex,
    commitIndex,
    currentSnapshot,
    uncommittedSteps,
    canUndo,
    canRedo,

    // Actions
    applyChange,
    undo,
    redo,
    commit,
    jump
  };
}
