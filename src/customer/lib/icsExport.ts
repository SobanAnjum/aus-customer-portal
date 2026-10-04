import { Appointment } from '../../types.ts';

export function downloadAppointmentIcs(appointment: Appointment): void {
  const sanitize = (str: string) => (str || '').replace(/[\n\r]+/g, ' ').replace(/,/g, '\\,').replace(/;/g, '\\;');

  // Format date and times: YYYY-MM-DD and HH:MM
  const dateClean = appointment.date.replace(/-/g, '');
  const startClean = (appointment.startTime || '09:00').replace(/:/g, '').padEnd(4, '0') + '00';
  const endClean = (appointment.endTime || '10:00').replace(/:/g, '').padEnd(4, '0') + '00';

  const dtStart = `${dateClean}T${startClean}`;
  const dtEnd = `${dateClean}T${endClean}`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const title = sanitize(`A u.S Beratung: ${appointment.title}`);
  const description = sanitize(
    `Beratungstermin mit Inhaber Dr. Abdul Sattar\nBuchungs-Referenz: ${
      appointment.bookingRef || `AuS-${appointment.id}`
    }\nGrund / Anliegen: ${appointment.taskReason || appointment.notes || 'Beratungsgespräch'}`
  );
  const location = sanitize('A u. S Wirtschaftsberatung e.K., Lagerhofstraße 2, 04103 Leipzig / MS Teams');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A u. S Wirtschaftsberatung e.K.//Mandantenportal//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:aus-apt-${appointment.id}-${dateClean}@aus-beratung.de`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `A-u-S-Termin-${appointment.date}-${appointment.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
