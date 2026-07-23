import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getStatusColor(status) {
  const colors = {
    'Paid': [34, 197, 94],
    'Pending Verification': [245, 158, 11],
    'Unpaid': [239, 68, 68],
    'Rejected': [107, 114, 128]
  };
  return colors[status] || [55, 65, 81];
}

/**
 * Download modern and professional fee challan PDF.
 */
export function downloadFeeChallanPdf(challan, student = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const studentName = student.name || challan.studentName || 'Student';
  const course = student.course || challan.course || '—';
  const rollNo = student.rollNo || '—';
  const bank = challan.bankDetails || {};

  // ===== PROFESSIONAL HEADER =====
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('IIT', 20, 15);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(200, 210, 220);
  doc.text('Institute of Information Technology', 20, 22);

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('FEE CHALLAN', pageWidth - 50, 15);

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(challan.challanNo, pageWidth - 50, 22);

  // ===== CHALLAN INFO SECTION =====
  let y = 42;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Challan Details', 14, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const leftX = 14;
  const rightX = pageWidth / 2 + 2;
  let leftY = y;
  let rightY = y;

  // Left column info
  doc.text('Student Name:', leftX, leftY);
  doc.setFont('Helvetica', 'bold');
  doc.text(studentName, leftX + 40, leftY);
  doc.setFont('Helvetica', 'normal');
  leftY += 6;

  doc.text('Roll No:', leftX, leftY);
  doc.setFont('Helvetica', 'bold');
  doc.text(rollNo, leftX + 40, leftY);
  doc.setFont('Helvetica', 'normal');
  leftY += 6;

  doc.text('Course:', leftX, leftY);
  doc.setFont('Helvetica', 'bold');
  doc.text(course, leftX + 40, leftY);
  doc.setFont('Helvetica', 'normal');
  leftY += 6;

  doc.text('Semester:', leftX, leftY);
  doc.setFont('Helvetica', 'bold');
  doc.text(challan.semester || '—', leftX + 40, leftY);
  doc.setFont('Helvetica', 'normal');

  // Right column info
  doc.text('Fee Type:', rightX, rightY);
  doc.setFont('Helvetica', 'bold');
  doc.text(challan.feeType || '—', rightX + 40, rightY);
  doc.setFont('Helvetica', 'normal');
  rightY += 6;

  doc.text('Due Date:', rightX, rightY);
  doc.setFont('Helvetica', 'bold');
  const dueDate = formatDate(challan.dueDate);
  doc.text(dueDate, rightX + 40, rightY);
  doc.setFont('Helvetica', 'normal');
  rightY += 6;

  const statusColor = getStatusColor(challan.status);
  doc.text('Status:', rightX, rightY);
  doc.setTextColor(...statusColor);
  doc.setFont('Helvetica', 'bold');
  doc.text(challan.status, rightX + 40, rightY);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  y = Math.max(leftY, rightY) + 8;

  // Divider line
  doc.setDrawColor(229, 231, 235);
  doc.line(14, y, pageWidth - 14, y);

  // ===== FEE DETAILS TABLE =====
  y += 6;

  const fineAmount = challan.isOverdue ? (challan.fineAmount || 0) : 0;
  const totalPayable = challan.totalPayable ?? (challan.amount ?? 0);

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount (Rs.)']],
    body: [
      ['Base Fee', `Rs. ${challan.amount ?? 0}/-`],
      ['Late Fine (if overdue)', `Rs. ${fineAmount}/-`],
      ['', ''],
      ['Total Payable', `Rs. ${totalPayable}/-`]
    ],
    columnStyles: {
      0: { cellWidth: 100, halign: 'left' },
      1: { cellWidth: 50, halign: 'right' }
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    rowStyles: (index) => {
      if (index === 3) {
        return {
          fillColor: [243, 244, 246],
          fontStyle: 'bold',
          fontSize: 10
        };
      }
      if (index === 2) {
        return { minCellHeight: 2 };
      }
      return index % 2 === 0 ? { fillColor: [255, 255, 255] } : { fillColor: [249, 250, 251] };
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // ===== BANK DETAILS SECTION =====
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Instructions', 14, y);

  // Bank details box
  y += 5;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(14, y, pageWidth - 28, 32);

  y += 4;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Bank Details:', 18, y);

  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const bankX = 18;
  const bankLabelWidth = 35;

  doc.text('Bank Name:', bankX, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(bank.bankName || '—', bankX + bankLabelWidth, y);
  y += 5;

  doc.setFont('Helvetica', 'normal');
  doc.text('Account Title:', bankX, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(bank.accountTitle || '—', bankX + bankLabelWidth, y);
  y += 5;

  doc.setFont('Helvetica', 'normal');
  doc.text('Account Number:', bankX, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(bank.accountNumber || '—', bankX + bankLabelWidth, y);

  if (bank.iban) {
    y += 5;
    doc.setFont('Helvetica', 'normal');
    doc.text('IBAN:', bankX, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(bank.iban, bankX + bankLabelWidth, y);
  }

  y += 12;

  // ===== QR/BARCODE SECTION =====
  const qrX = 14;
  const qrSize = 35;

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.rect(qrX, y, qrSize, qrSize);

  doc.setFontSize(7);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('QR CODE', qrX + 2, y + 8);
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(challan.challanNo, qrX + 2, y + 32);

  // Payment instructions (next to QR)
  const instructX = qrX + qrSize + 8;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Steps to Complete Payment:', instructX, y + 2);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const instructions = [
    '1. Go to your bank branch or online banking',
    '2. Use the bank details above to transfer',
    '3. Keep transaction receipt/screenshot',
    '4. Upload proof in Student Portal',
    '5. Wait for admin verification'
  ];

  let instructY = y + 8;
  instructions.forEach((instr) => {
    doc.text(instr, instructX, instructY, { maxWidth: pageWidth - instructX - 14 });
    instructY += 4;
  });

  // ===== FOOTER SECTION =====
  const footerY = pageHeight - 15;

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);

  doc.setFontSize(7);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(107, 114, 128);

  const footerText = '© 2024 Institute of Information Technology. This is an official fee challan. For support, contact the admin or visit the student portal.';
  doc.text(footerText, pageWidth / 2, footerY + 2, {
    align: 'center',
    maxWidth: pageWidth - 28
  });

  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${today}`, 14, footerY + 8);

  doc.save(`challan-${challan.challanNo}.pdf`);
}

export const API_BASE = 'http://localhost:5000';

export function proofImageUrl(path) {
  if (!path) return null;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}
