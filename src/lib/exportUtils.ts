/**
 * Export utilities for admin - Excel and formatted documents
 */

import { Enquiry } from '../types/enquiry';
import { Feedback } from '../types/feedback';

// ========== EXCEL EXPORT ==========
export function exportEnquiriesToExcel(enquiries: Enquiry[]): void {
  // Create CSV content (Excel can open CSV)
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Occasion Type', 'Event Date', 'Location', 'Budget Range', 'Message', 'Status', 'Admin Reply', 'Admin Reply Date', 'Created At'];
  const rows = enquiries.map(enq => [
    enq.id,
    enq.name,
    enq.email,
    enq.phone,
    enq.occasionType,
    enq.eventDate,
    enq.location,
    enq.budgetRange || '',
    (enq.message || '').replace(/,/g, ';'), // Replace commas in message
    enq.status,
    (enq.adminReply || '').replace(/,/g, ';'),
    enq.adminReplyDate || '',
    enq.createdAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Enquiries_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportFeedbacksToExcel(feedbacks: Feedback[]): void {
  const headers = ['ID', 'Name', 'Rating', 'Service Type', 'Message', 'Admin Reply', 'Admin Reply Date', 'Created At'];
  const rows = feedbacks.map(fb => [
    fb.id,
    fb.name,
    fb.rating.toString(),
    fb.serviceType || '',
    (fb.message || '').replace(/,/g, ';'),
    (fb.adminReply || '').replace(/,/g, ';'),
    fb.adminReplyDate || '',
    fb.createdAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Feedbacks_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRettingsToExcel(rettings: any[]): void {
  if (rettings.length === 0) {
    alert('No rettings data to export');
    return;
  }

  // Get all unique keys from rettings
  const allKeys = new Set<string>();
  rettings.forEach(ret => {
    Object.keys(ret).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const rows = rettings.map(ret => 
    headers.map(header => {
      const value = ret[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
      return String(value).replace(/,/g, ';');
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rettings_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllToExcel(enquiries: Enquiry[], feedbacks: Feedback[], rettings: any[]): void {
  // Create a comprehensive Excel file with multiple sheets (using CSV format)
  const data = {
    Enquiries: enquiries,
    Feedbacks: feedbacks,
    Rettings: rettings,
  };

  // Export as JSON for now (can be enhanced with proper Excel library)
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `All_Data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Also export individual CSV files
  setTimeout(() => exportEnquiriesToExcel(enquiries), 100);
  setTimeout(() => exportFeedbacksToExcel(feedbacks), 200);
  if (rettings.length > 0) {
    setTimeout(() => exportRettingsToExcel(rettings), 300);
  }
}

// ========== FORMATTED DOCUMENT EXPORT ==========
export function exportEnquiriesToDocument(enquiries: Enquiry[]): void {
  let content = 'ENQUIRIES REPORT\n';
  content += '='.repeat(50) + '\n\n';
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Enquiries: ${enquiries.length}\n\n`;
  content += '='.repeat(50) + '\n\n';

  enquiries.forEach((enq, index) => {
    content += `ENQUIRY #${index + 1}\n`;
    content += '-'.repeat(50) + '\n';
    content += `ID: ${enq.id}\n`;
    content += `Name: ${enq.name}\n`;
    content += `Email: ${enq.email}\n`;
    content += `Phone: ${enq.phone}\n`;
    content += `Occasion Type: ${enq.occasionType}\n`;
    content += `Event Date: ${new Date(enq.eventDate).toLocaleDateString()}\n`;
    content += `Location: ${enq.location}\n`;
    content += `Budget Range: ${enq.budgetRange || 'Not specified'}\n`;
    content += `Status: ${enq.status}\n`;
    if (enq.message) {
      content += `Message: ${enq.message}\n`;
    }
    if (enq.adminReply) {
      content += `Admin Reply: ${enq.adminReply}\n`;
      content += `Reply Date: ${enq.adminReplyDate ? new Date(enq.adminReplyDate).toLocaleString() : ''}\n`;
    }
    content += `Created At: ${new Date(enq.createdAt).toLocaleString()}\n`;
    content += '\n' + '='.repeat(50) + '\n\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Enquiries_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportFeedbacksToDocument(feedbacks: Feedback[]): void {
  let content = 'FEEDBACKS REPORT\n';
  content += '='.repeat(50) + '\n\n';
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Feedbacks: ${feedbacks.length}\n`;
  
  if (feedbacks.length > 0) {
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    content += `Average Rating: ${avgRating.toFixed(1)} ⭐\n`;
  }
  
  content += '\n' + '='.repeat(50) + '\n\n';

  feedbacks.forEach((fb, index) => {
    content += `FEEDBACK #${index + 1}\n`;
    content += '-'.repeat(50) + '\n';
    content += `ID: ${fb.id}\n`;
    content += `Name: ${fb.name}\n`;
    content += `Rating: ${'⭐'.repeat(fb.rating)} (${fb.rating}/5)\n`;
    content += `Service Type: ${fb.serviceType || 'N/A'}\n`;
    if (fb.message) {
      content += `Message: ${fb.message}\n`;
    }
    if (fb.adminReply) {
      content += `Admin Reply: ${fb.adminReply}\n`;
      content += `Reply Date: ${fb.adminReplyDate ? new Date(fb.adminReplyDate).toLocaleString() : ''}\n`;
    }
    content += `Created At: ${new Date(fb.createdAt).toLocaleString()}\n`;
    content += '\n' + '='.repeat(50) + '\n\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Feedbacks_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRettingsToDocument(rettings: any[]): void {
  let content = 'RETTINGS REPORT\n';
  content += '='.repeat(50) + '\n\n';
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Rettings: ${rettings.length}\n\n`;
  content += '='.repeat(50) + '\n\n';

  rettings.forEach((ret, index) => {
    content += `RETTING #${index + 1}\n`;
    content += '-'.repeat(50) + '\n';
    Object.keys(ret).forEach(key => {
      const value = ret[key];
      if (value !== null && value !== undefined) {
        content += `${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n`;
      }
    });
    content += '\n' + '='.repeat(50) + '\n\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rettings_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllToDocument(enquiries: Enquiry[], feedbacks: Feedback[], rettings: any[]): void {
  let content = 'COMPLETE DATA REPORT\n';
  content += '='.repeat(60) + '\n\n';
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  content += `Total Enquiries: ${enquiries.length}\n`;
  content += `Total Feedbacks: ${feedbacks.length}\n`;
  content += `Total Rettings: ${rettings.length}\n\n`;
  content += '='.repeat(60) + '\n\n';

  // Enquiries Section
  content += '\n\n' + 'ENQUIRIES'.padStart(30, '=').padEnd(60, '=') + '\n\n';
  enquiries.forEach((enq, index) => {
    content += `ENQUIRY #${index + 1}\n`;
    content += '-'.repeat(60) + '\n';
    content += `ID: ${enq.id}\n`;
    content += `Name: ${enq.name}\n`;
    content += `Email: ${enq.email}\n`;
    content += `Phone: ${enq.phone}\n`;
    content += `Occasion: ${enq.occasionType}\n`;
    content += `Event Date: ${new Date(enq.eventDate).toLocaleDateString()}\n`;
    content += `Location: ${enq.location}\n`;
    content += `Budget: ${enq.budgetRange || 'Not specified'}\n`;
    content += `Status: ${enq.status}\n`;
    if (enq.message) content += `Message: ${enq.message}\n`;
    if (enq.adminReply) {
      content += `Admin Reply: ${enq.adminReply}\n`;
      content += `Reply Date: ${enq.adminReplyDate ? new Date(enq.adminReplyDate).toLocaleString() : ''}\n`;
    }
    content += `Created: ${new Date(enq.createdAt).toLocaleString()}\n\n`;
  });

  // Feedbacks Section
  content += '\n\n' + 'FEEDBACKS'.padStart(30, '=').padEnd(60, '=') + '\n\n';
  feedbacks.forEach((fb, index) => {
    content += `FEEDBACK #${index + 1}\n`;
    content += '-'.repeat(60) + '\n';
    content += `ID: ${fb.id}\n`;
    content += `Name: ${fb.name}\n`;
    content += `Rating: ${'⭐'.repeat(fb.rating)} (${fb.rating}/5)\n`;
    content += `Service: ${fb.serviceType || 'N/A'}\n`;
    if (fb.message) content += `Message: ${fb.message}\n`;
    if (fb.adminReply) {
      content += `Admin Reply: ${fb.adminReply}\n`;
      content += `Reply Date: ${fb.adminReplyDate ? new Date(fb.adminReplyDate).toLocaleString() : ''}\n`;
    }
    content += `Created: ${new Date(fb.createdAt).toLocaleString()}\n\n`;
  });

  // Rettings Section
  if (rettings.length > 0) {
    content += '\n\n' + 'RETTINGS'.padStart(30, '=').padEnd(60, '=') + '\n\n';
    rettings.forEach((ret, index) => {
      content += `RETTING #${index + 1}\n`;
      content += '-'.repeat(60) + '\n';
      Object.keys(ret).forEach(key => {
        const value = ret[key];
        if (value !== null && value !== undefined) {
          content += `${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n`;
        }
      });
      content += '\n';
    });
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Complete_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
