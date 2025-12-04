import './CalendarView.css';

/**
 * CalendarView Component
 *
 * Month grid calendar with:
 * - Month grid calendar
 * - Event display
 * - Date navigation
 * - Sprint date range display
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 */
export function CalendarView({ snapshot = {} }) {
  // Extract data from snapshot
  const sprint = snapshot.sprint || null;
  const schedule = snapshot.schedule || { calendar: { month: '', events: [] } };
  const calendarConfig = schedule.calendar || { month: '', events: [] };

  // Group events by date
  const eventsByDate = (() => {
    const map = {};
    (calendarConfig.events || []).forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  })();

  // Calendar label
  const calendarLabel = (() => {
    const conf = calendarConfig;
    if (!conf.month) return 'Calendar';
    const parts = conf.month.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!y || !m) return 'Calendar';
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  })();

  // Generate calendar weeks
  const calendarWeeks = (() => {
    const conf = calendarConfig;
    if (!conf.month) return [];
    const parts = conf.month.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!y || !m) return [];
    const first = new Date(y, m - 1, 1);
    const dayOfWeek = first.getDay();
    const offset = (dayOfWeek + 6) % 7;
    const start = new Date(first.getTime());
    start.setDate(start.getDate() - offset);

    const weeks = [];
    const cur = new Date(start.getTime());
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = cur.toISOString().slice(0, 10);
        week.push({
          key,
          date: cur.getDate(),
          inMonth: cur.getMonth() === first.getMonth(),
          events: eventsByDate[key] || []
        });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  })();

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-view">
      <div className="calendar">
        <div className="calendar-header">
          <div className="calendar-header__title">{calendarLabel}</div>
          {sprint && (
            <div className="calendar-header__subtitle">
              Sprint window: {sprint.startDate} → {sprint.endDate}
            </div>
          )}
        </div>
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {dayNames.map((name) => (
              <div key={name} className="calendar-weekday">
                {name}
              </div>
            ))}
          </div>
          {calendarWeeks.map((week, weekIdx) => (
            <div key={weekIdx} className="calendar-week">
              {week.map((day) => (
                <div
                  key={day.key}
                  className={`calendar-day ${
                    day.inMonth
                      ? 'calendar-day--in-month'
                      : 'calendar-day--other-month'
                  }`}
                >
                  <div className="calendar-day__date">{day.date}</div>
                  <div className="calendar-day__events">
                    {day.events.map((ev) => (
                      <div key={ev.id} className="calendar-pill">
                        {ev.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
