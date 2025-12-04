import { useState, useCallback } from 'react';

/**
 * useFlows - Custom hook for managing flow automation state
 *
 * Handles:
 * - Flow library (available automation flows)
 * - Flow bindings (which flows are attached to which targets)
 * - Flow mode (visual binding mode on/off)
 * - Selected flow target (for attaching/detaching flows)
 *
 * Based on the original App.js flow management logic.
 */
export function useFlows(initialFlowLibrary = []) {
  // Flow library: array of available flow definitions
  const [flowLibrary, setFlowLibrary] = useState(initialFlowLibrary);

  // Flow bindings: maps target keys to attached flows
  // Example: { "task:T-101": [{ id: "binding-1", flowId: "flow-1", eventType: "task.dropped" }] }
  const [flowBindings, setFlowBindings] = useState({});

  // Flow mode: whether the UI is in "flow binding mode"
  const [flowMode, setFlowMode] = useState(false);

  // Selected flow target: current element user wants to bind flows to
  // Example: { key: "task:T-101", label: "Task T-101", type: "task" }
  const [selectedFlowTarget, setSelectedFlowTarget] = useState(null);

  /**
   * Generate a target key for a task
   */
  const flowTargetKeyForTask = useCallback((taskId) => {
    return `task:${taskId}`;
  }, []);

  /**
   * Get all flow bindings for a specific target
   */
  const getFlowBindingsForTarget = useCallback((targetKey) => {
    return flowBindings[targetKey] || [];
  }, [flowBindings]);

  /**
   * Save or update a flow in the library
   */
  const saveFlow = useCallback((flowDef) => {
    setFlowLibrary((prev) => {
      const existingIndex = prev.findIndex((f) => f.id === flowDef.id);

      if (existingIndex !== -1) {
        // Update existing flow
        const updated = [...prev];
        updated[existingIndex] = flowDef;
        return updated;
      } else {
        // Add new flow
        return [...prev, flowDef];
      }
    });
  }, []);

  /**
   * Toggle flow mode on/off
   */
  const toggleFlowMode = useCallback(() => {
    setFlowMode((prev) => {
      const next = !prev;
      // Clear selected target when exiting flow mode
      if (!next) {
        setSelectedFlowTarget(null);
      }
      return next;
    });
  }, []);

  /**
   * Handle clicking a flow target in the UI
   */
  const handleFlowTargetClick = useCallback((target) => {
    // target: { key, label, type }
    if (!target || !target.key) return;
    setSelectedFlowTarget(target);
  }, []);

  /**
   * Attach a flow to the currently selected target
   */
  const attachFlow = useCallback((flowId, eventType = 'task.dropped') => {
    if (!selectedFlowTarget || !selectedFlowTarget.key) return;

    const targetKey = selectedFlowTarget.key;

    setFlowBindings((prev) => {
      const next = { ...prev };
      const arr = next[targetKey] ? [...next[targetKey]] : [];

      // Add new binding
      arr.push({
        id: `binding-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        flowId,
        eventType
      });

      next[targetKey] = arr;
      return next;
    });
  }, [selectedFlowTarget]);

  /**
   * Detach a flow binding from the currently selected target
   */
  const detachFlow = useCallback((bindingId) => {
    if (!selectedFlowTarget || !selectedFlowTarget.key) return;

    const targetKey = selectedFlowTarget.key;

    setFlowBindings((prev) => {
      const next = { ...prev };
      const arr = next[targetKey] ? [...next[targetKey]] : [];

      // Remove binding
      const filtered = arr.filter((b) => b.id !== bindingId);

      if (filtered.length === 0) {
        // Remove target key if no bindings left
        delete next[targetKey];
      } else {
        next[targetKey] = filtered;
      }

      return next;
    });
  }, [selectedFlowTarget]);

  /**
   * Fire flows for a specific event
   * This should trigger execution of all matching flows
   *
   * @param {string} eventType - Type of event (e.g., "task.dropped")
   * @param {object} payload - Event payload data
   * @param {function} executionCallback - Optional callback to execute flows
   */
  const fireFlowsForEvent = useCallback((eventType, payload = {}, executionCallback) => {
    if (!eventType) return;

    const safePayload = { ...payload, eventType };

    // Determine target key from payload
    const targetKey =
      safePayload.targetKey ||
      (safePayload.taskId ? flowTargetKeyForTask(safePayload.taskId) : null);

    if (!targetKey) return;

    const bindings = getFlowBindingsForTarget(targetKey);
    if (!bindings || bindings.length === 0) return;

    // Execute each matching flow
    bindings.forEach((binding) => {
      // Filter by event type if specified in binding
      if (binding.eventType && binding.eventType !== eventType) return;

      const flowId = binding.flowId;
      const flow = flowLibrary.find((f) => f.id === flowId);

      if (!flow) {
        console.warn('[Flow] Flow not found:', flowId);
        return;
      }

      // Execute flow via callback if provided
      if (typeof executionCallback === 'function') {
        executionCallback(flow, safePayload);
      } else {
        console.log('[Flow] Would execute:', flow.name, 'for event:', eventType);
      }
    });
  }, [flowLibrary, flowTargetKeyForTask, getFlowBindingsForTarget]);

  return {
    // State
    flowLibrary,
    flowBindings,
    flowMode,
    selectedFlowTarget,

    // Actions
    saveFlow,
    toggleFlowMode,
    handleFlowTargetClick,
    attachFlow,
    detachFlow,
    fireFlowsForEvent,
    flowTargetKeyForTask,
    getFlowBindingsForTarget
  };
}
