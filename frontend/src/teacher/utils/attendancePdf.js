import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Download attendance sheet as PDF.
 * @param {{ date: string, courseLabel?: string, teacherName?: string, rows: Array<{ rollNo?: string, name: string, course?: string, status: string }>, summary: { present: number, absent: number, total: number } }} opts
 */
export function downloadAttendancePdf({
  date,
  courseLabel = 'All assigned courses',
  teacherName = '',
  rows = [],
  summary = { present: 0, absent: 0, total: 0 },
}) {
  const doc = new jsPDF();
  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('IIT — Student Attendance Sheet', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${formattedDate}`, 14, 28);
  if (teacherName) doc.text(`Teacher: ${teacherName}`, 14, 34);
  doc.text(`Course: ${courseLabel}`, 14, 40);
  doc.text(
    `Present: ${summary.present}   |   Absent: ${summary.absent}   |   Total: ${summary.total}`,
    14,
    46
  );

  autoTable(doc, {
    startY: 54,
    head: [['Roll No', 'Student Name', 'Course', 'Status']],
    body: rows.map((r) => [
      r.rollNo || '—',
      r.name || '—',
      r.course || '—',
      r.status === 'present' ? 'Present' : 'Absent',
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      3: {
        cellWidth: 28,
        fontStyle: 'bold',
      },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 3) {
        const status = String(data.cell.raw).toLowerCase();
        if (status === 'present') {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (status === 'absent') {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  const safeDate = (date || 'sheet').replace(/\//g, '-');
  doc.save(`attendance-${safeDate}.pdf`);
}
