import { useState } from 'react';
import './TimelineView.css';

/**
 * TimelineView Component
 *
 * Gantt chart style timeline with:
 * - Gantt chart style timeline
 * - Draggable task bars
 * - Sprint date range
 * - Interactive resize handles
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 * @param {Function} props.onUpdateTimeline - Handler for timeline item updates
 */
export function TimelineView({ snapshot = {}, onUpdateTimeline }) {
  const [timelineDrag, setTimelineDrag] = useState({
    active: false,
    itemId: null,
    type: null,
    startX: 0,
    dayPx: 1,
    originalStart: 0,
    originalDuration: 1,
    previewStart: 0,
    previewDuration: 1
  });

  // Extract data from snapshot
  const sprint = snapshot.sprint || null;
  const schedule = snapshot.schedule || { timeline: [] };
  const tasks = snapshot.tasks || [];

  // Date utilities
  const parseDateYMD = (ymd) => {
    if (!ymd || typeof ymd !== 'string') return new Date();
    const parts = ymd.split('-');
    const y = parseInt(parts[0], 10) || 2025;
    const m = parseInt(parts[1], 10) || 1;
    const d = parseInt(parts[2], 10) || 1;
    return new Date(y, m - 1, d);
  };

  const addDays = (base, days) => {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + days);
    return d;
  };

  // Timeline data processing
  const timelineBaseDate = sprint && sprint.startDate ? parseDateYMD(sprint.startDate) : new Date();
  const timelineRawItems = schedule.timeline || [];

  const timelineTotalDays = (() => {
    let maxEnd = 0;
    timelineRawItems.forEach((it) => {
      const start = Number(it.startOffset) || 0;
      const dur = Math.max(Number(it.duration) || 1, 1);
      const end = start + dur;
      if (end > maxEnd) maxEnd = end;
    });
    return maxEnd || 1;
  })();

  const timelineHeaderDays = (() => {
    const days = [];
    const total = timelineTotalDays;
    for (let i = 0; i < total; i++) {
      const date = addDays(timelineBaseDate, i);
      days.push({ index: i, label: date.getDate() });
    }
    return days;
  })();

  const taskTitleById = (id) => {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) return tasks[i].title;
    }
    return '';
  };

  const timelineItems = timelineRawItems.map((it) => {
    const start = Number(it.startOffset) || 0;
    const dur = Math.max(Number(it.duration) || 1, 1);
    const startDate = addDays(timelineBaseDate, start);
    const endDate = addDays(timelineBaseDate, start + dur - 1);
    const label = it.label || taskTitleById(it.taskId) || it.taskId;
    const dateLabel = `${startDate.getDate()}–${endDate.getDate()}`;
    return {
      id: it.id,
      taskId: it.taskId,
      label,
      dateLabel,
      startOffset: start,
      duration: dur
    };
  });

  const timelineLabel = (() => {
    const total = timelineTotalDays;
    const start = timelineBaseDate;
    const end = addDays(timelineBaseDate, total - 1);
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  })();

  // Timeline drag handlers
  const startTimelineDrag = (event, item, type) => {
    if (event && event.preventDefault) event.preventDefault();
    const track = event.currentTarget.closest('.timeline-row-track');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const dayPx = rect.width / (timelineTotalDays || 1);
    setTimelineDrag({
      active: true,
      itemId: item.id,
      type,
      startX: event.clientX,
      dayPx,
      originalStart: item.startOffset,
      originalDuration: item.duration,
      previewStart: item.startOffset,
      previewDuration: item.duration
    });
  };

  const onTimelineMouseMove = (event) => {
    if (!timelineDrag.active) return;
    const drag = timelineDrag;
    const deltaPx = event.clientX - drag.startX;
    const deltaDays = Math.round(deltaPx / (drag.dayPx || 1));
    if (!deltaDays) return;

    let start = drag.originalStart;
    let dur = drag.originalDuration;
    const total = timelineTotalDays || 1;

    if (drag.type === 'move') {
      start = drag.originalStart + deltaDays;
    } else if (drag.type === 'start') {
      start = drag.originalStart + deltaDays;
      dur = drag.originalDuration - deltaDays;
    } else if (drag.type === 'end') {
      dur = drag.originalDuration + deltaDays;
    }

    if (dur < 1) dur = 1;
    if (start < 0) start = 0;
    if (start + dur > total) {
      const overflow = start + dur - total;
      if (drag.type === 'move') {
        start -= overflow;
      } else {
        dur -= overflow;
        if (dur < 1) dur = 1;
      }
    }

    setTimelineDrag((prev) => ({
      ...prev,
      previewStart: start,
      previewDuration: dur
    }));
  };

  const endTimelineDrag = () => {
    if (!timelineDrag.active) return;
    const drag = timelineDrag;
    setTimelineDrag((prev) => ({ ...prev, active: false }));
    if (
      drag.previewStart !== drag.originalStart ||
      drag.previewDuration !== drag.originalDuration
    ) {
      if (onUpdateTimeline) {
        onUpdateTimeline({
          itemId: drag.itemId,
          startOffset: drag.previewStart,
          duration: drag.previewDuration
        });
      }
    }
  };

  const barStyle = (item) => {
    const total = timelineTotalDays || 1;
    let start = item.startOffset;
    let dur = item.duration;
    if (timelineDrag.active && timelineDrag.itemId === item.id) {
      start = timelineDrag.previewStart;
      dur = timelineDrag.previewDuration;
    }
    const leftPct = (start / total) * 100;
    const widthPct = Math.max((dur / total) * 100, (1 / total) * 100 * 0.8);
    return {
      left: `${leftPct}%`,
      width: `${widthPct}%`
    };
  };

  if (timelineItems.length === 0) {
    return (
      <div className="timeline-view">
        <div className="timeline-empty">
          No timeline data configured in this demo snapshot.
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      <div className="timeline">
        <div className="timeline-header">
          <div className="timeline-header__title">Timeline (Gantt)</div>
          <div className="timeline-header__subtitle">{timelineLabel}</div>
        </div>
        <div
          className="timeline-grid"
          onMouseMove={onTimelineMouseMove}
          onMouseUp={endTimelineDrag}
          onMouseLeave={endTimelineDrag}
        >
          <div className="timeline-days">
            {timelineHeaderDays.map((day) => (
              <div key={day.index} className="timeline-day">
                {day.label}
              </div>
            ))}
          </div>
          {timelineItems.map((item) => {
            const barClass = `timeline-row-bar${
              timelineDrag.active && timelineDrag.itemId === item.id
                ? ' timeline-row-bar--dragging'
                : ''
            }`;
            return (
              <div key={item.id} className="timeline-row">
                <div className="timeline-row-label">
                  <div className="timeline-row-title">{item.label}</div>
                  <div className="timeline-row-sub">{item.dateLabel}</div>
                </div>
                <div className="timeline-row-track">
                  <div
                    className={barClass}
                    style={barStyle(item)}
                    onMouseDown={(e) => startTimelineDrag(e, item, 'move')}
                  >
                    <div
                      className="timeline-row-handle timeline-row-handle--start"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startTimelineDrag(e, item, 'start');
                      }}
                    />
                    <div
                      className="timeline-row-handle timeline-row-handle--end"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startTimelineDrag(e, item, 'end');
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
