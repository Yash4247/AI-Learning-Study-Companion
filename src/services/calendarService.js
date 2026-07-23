// Calendar Export Service (Google Calendar, Outlook, .ics Download)

export const calendarService = {
  // Generate a Google Calendar event creation URL
  getGoogleCalendarUrl({ title, description, startDate, durationMins = 90 }) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime() + durationMins * 60000);

    const formatGCalDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const details = encodeURIComponent(description || 'Study Session created via Apex Learn AI');
    const summary = encodeURIComponent(`📚 Study: ${title}`);
    const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${summary}&dates=${dates}&details=${details}`;
  },

  // Generate an Outlook Web Calendar event creation URL
  getOutlookCalendarUrl({ title, description, startDate, durationMins = 90 }) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime() + durationMins * 60000);

    const subject = encodeURIComponent(`📚 Study: ${title}`);
    const body = encodeURIComponent(description || 'Study Session created via Apex Learn AI');
    const startIso = encodeURIComponent(start.toISOString());
    const endIso = encodeURIComponent(end.toISOString());

    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&body=${body}&startdt=${startIso}&enddt=${endIso}`;
  },

  // Download an .ics iCalendar file for a single task or full schedule
  downloadIcsFile(schedule = [], roadmapTitle = 'Apex Learn Study Schedule') {
    if (!schedule || schedule.length === 0) return;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Apex Learn AI//Study Companion//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${roadmapTitle}`
    ].join('\r\n') + '\r\n';

    const now = new Date();

    schedule.forEach((task, idx) => {
      const taskDate = new Date(now);
      taskDate.setDate(taskDate.getDate() + (task.dayNumber ? task.dayNumber - 1 : idx));
      taskDate.setHours(17, 0, 0, 0); // Default 5 PM start

      const endDate = new Date(taskDate.getTime() + (task.durationMins || 90) * 60000);

      const formatIcsDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const subtopicsList = (task.subtopics || []).map(st => typeof st === 'string' ? st : st.title).join('\\n- ');

      const description = `Priority: ${task.priority || 'Medium'}\\nResource: ${task.resource || 'Official Guide'}\\n\\nSub-topics:\\n- ${subtopicsList}`;

      icsContent += [
        'BEGIN:VEVENT',
        `UID:apex-learn-${task.id || idx}-${Date.now()}@apexlearn.ai`,
        `DTSTAMP:${formatIcsDate(now)}`,
        `DTSTART:${formatIcsDate(taskDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        `SUMMARY:📚 ${task.title.replace(/\[.*?\]/g, '').trim()}`,
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${roadmapTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
