/**
 * FlowEngine.js
 * Modern ES6 Flow execution engine for Tasklytics automation system.
 */

let flowExecutionHistory = [];

/**
 * Get value from nested object path
 */
function getValueFromPath(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Interpolate variables in strings
 * Supports {{variable.path}} syntax
 */
function interpolateVariables(str, eventPayload, context) {
  if (typeof str !== 'string') return str;

  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getValueFromPath(eventPayload, path) ||
                  getValueFromPath(context.currentSnapshot, path);
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Evaluate flow conditions
 */
function evaluateConditions(conditions, eventPayload, context) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const { field, operator, value: expectedValue } = condition;
    const actualValue = getValueFromPath(eventPayload, field) ||
                       getValueFromPath(context.currentSnapshot, field);

    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'contains':
        return String(actualValue).includes(expectedValue);
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue);
      case 'less_than':
        return Number(actualValue) < Number(expectedValue);
      case 'exists':
        return actualValue !== undefined && actualValue !== null;
      case 'not_exists':
        return actualValue === undefined || actualValue === null;
      default:
        return false;
    }
  });
}

/**
 * Action: Show notification
 */
function showNotification(config, eventPayload, context) {
  const message = interpolateVariables(config.message, eventPayload, context);
  const title = config.title
    ? interpolateVariables(config.title, eventPayload, context)
    : 'Flow Notification';

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body: message });
  } else {
    console.log('[Flow Notification]', title, '-', message);
  }

  if (context.addAiSystemMessage) {
    context.addAiSystemMessage('🔔 ' + message);
  }

  return { success: true, message };
}

/**
 * Action: Run command
 */
function runCommand(config, eventPayload, context) {
  if (!context.runCommand) {
    return { success: false, reason: 'No runCommand function available' };
  }

  const { commandType, params = {} } = config;

  const interpolatedParams = {};
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      interpolatedParams[key] = interpolateVariables(params[key], eventPayload, context);
    }
  }

  const command = { type: commandType, ...interpolatedParams };
  context.runCommand(command);

  return { success: true, command };
}

/**
 * Action: Update field
 */
function updateField(config, eventPayload, context) {
  const { targetType, field } = config;
  const targetId = interpolateVariables(config.targetId, eventPayload, context);
  const value = interpolateVariables(config.value, eventPayload, context);

  if (targetType === 'task' && context.runCommand) {
    context.runCommand({
      type: 'UpdateTaskField',
      taskId: targetId,
      field,
      value
    });
    return { success: true, updated: { targetId, field, value } };
  }

  return { success: false, reason: 'Unsupported target type: ' + targetType };
}

/**
 * Action: Log message
 */
function logMessage(config, eventPayload, context) {
  const message = interpolateVariables(config.message, eventPayload, context);
  const level = config.level || 'info';

  if (console && console[level]) {
    console[level]('[Flow]', message);
  }

  return { success: true, message, level };
}

/**
 * Execute a single action
 */
function executeAction(action, eventPayload, context) {
  const { type, config = {} } = action;

  switch (type) {
    case 'show_notification':
      return showNotification(config, eventPayload, context);
    case 'run_command':
      return runCommand(config, eventPayload, context);
    case 'update_field':
      return updateField(config, eventPayload, context);
    case 'log_message':
      return logMessage(config, eventPayload, context);
    default:
      console.warn('[FlowEngine] Unknown action type:', type);
      return { success: false, reason: 'Unknown action type: ' + type };
  }
}

/**
 * Send flow event to backend
 */
function sendToBackend(flow, eventPayload, executionLog) {
  const message = {
    flowId: flow.id,
    flowName: flow.name,
    eventType: eventPayload.eventType,
    targetKey: eventPayload.targetKey,
    payload: eventPayload,
    executionId: executionLog.id,
    timestamp: new Date().toISOString()
  };

  try {
    if (typeof window !== 'undefined' &&
        window.TasklyticsFlowClient &&
        typeof window.TasklyticsFlowClient.send === 'function') {
      window.TasklyticsFlowClient.send(message);
    } else {
      console.log('[Flow event to backend]', message);
    }
  } catch (e) {
    console.error('[FlowEngine] Backend send error:', e);
  }
}

/**
 * Execute a flow definition
 */
export function executeFlow(flow, eventPayload, context) {
  if (!flow || !flow.enabled) {
    return { success: false, reason: 'Flow disabled or not found' };
  }

  const executionId = 'exec-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  const startTime = Date.now();
  const executionLog = {
    id: executionId,
    flowId: flow.id,
    flowName: flow.name,
    eventType: eventPayload.eventType,
    startTime: new Date().toISOString(),
    status: 'running',
    actionsPerformed: [],
    errors: []
  };

  try {
    // Check conditions
    if (flow.conditions && flow.conditions.length > 0) {
      const conditionsMet = evaluateConditions(flow.conditions, eventPayload, context);
      if (!conditionsMet) {
        executionLog.status = 'skipped';
        executionLog.reason = 'Conditions not met';
        flowExecutionHistory.unshift(executionLog);
        return { success: false, reason: 'Conditions not met', executionId };
      }
    }

    // Execute actions sequentially
    if (flow.actions && flow.actions.length > 0) {
      flow.actions.forEach((action, index) => {
        try {
          const result = executeAction(action, eventPayload, context);
          executionLog.actionsPerformed.push({ index, type: action.type, result });
        } catch (actionError) {
          executionLog.errors.push({
            actionIndex: index,
            error: actionError.message || String(actionError)
          });
        }
      });
    }

    // Send to backend if configured
    if (flow.sendToBackend !== false) {
      sendToBackend(flow, eventPayload, executionLog);
    }

    executionLog.status = executionLog.errors.length > 0 ? 'completed_with_errors' : 'completed';
    executionLog.duration = Date.now() - startTime;
  } catch (error) {
    executionLog.status = 'failed';
    executionLog.errors.push({ error: error.message || String(error) });
  }

  // Keep last 100 executions
  flowExecutionHistory.unshift(executionLog);
  if (flowExecutionHistory.length > 100) {
    flowExecutionHistory = flowExecutionHistory.slice(0, 100);
  }

  return {
    success: executionLog.status === 'completed',
    executionId,
    actionsPerformed: executionLog.actionsPerformed.length,
    errors: executionLog.errors
  };
}

/**
 * Get flow execution history
 */
export function getExecutionHistory(limit = 50) {
  return flowExecutionHistory.slice(0, limit);
}

/**
 * Clear execution history
 */
export function clearExecutionHistory() {
  flowExecutionHistory = [];
}

export default {
  executeFlow,
  getExecutionHistory,
  clearExecutionHistory
};
