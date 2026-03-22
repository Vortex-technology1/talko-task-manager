(function () {
  'use strict';

  // ─── PDF generation for Invoice using jsPDF ───────────────────────────────
  // Falls back to print window if jsPDF unavailable

  function esc(s) { return String(s || ''); }
  function fmt(n) { return Number(n || 0).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  async function loadJsPDF() {
    if (window.jspdf || window.jsPDF) return true;
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  window._salesGeneratePDF = async function (order) {
    const company = window.currentCompanyData || {};
    const loaded = await loadJsPDF();

    if (!loaded) {
      // Fallback to print window (already in 104-sales.js)
      if (typeof window._salesPrintInvoice === 'function') {
        window._salesPrintInvoice(order.id || order);
      }
      return;
    }

    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 20;

    // ── Colors ──
    const purple = [99, 102, 241];
    const gray = [107, 114, 128];
    const lightGray = [243, 244, 246];
    const darkText = [17, 24, 39];

    // ── Header bar ──
    doc.setFillColor(...purple);
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TALKO', margin, 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(esc(company.name || company.companyName || ''), pageW - margin, 8, { align: 'right' });

    y = 24;

    // ── Document title ──
    doc.setTextColor(...darkText);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('РАХУНОК', margin, y);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(`№ ${esc(order.number)}`, margin, y + 7);
    doc.text(`від ${esc(order.date || '')}`, margin, y + 13);

    // Status badge
    const statusColors = {
      draft: [156, 163, 175], sent: [59, 130, 246], paid: [16, 185, 129],
      partial: [245, 158, 11], cancelled: [239, 68, 68],
    };
    const sc = statusColors[order.status] || gray;
    const statusLabels = { draft: 'Чернетка', sent: 'Відправлено', paid: 'Оплачено', partial: 'Частково', cancelled: 'Скасовано' };
    doc.setFillColor(...sc);
    doc.roundedRect(pageW - margin - 35, y - 4, 35, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(statusLabels[order.status] || order.status, pageW - margin - 17.5, y + 2.5, { align: 'center' });

    y += 22;

    // ── From / To ──
    doc.setFillColor(...lightGray);
    doc.rect(margin, y, contentW / 2 - 4, 28, 'F');
    doc.rect(margin + contentW / 2 + 4, y, contentW / 2 - 4, 28, 'F');

    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ВІД КОГО', margin + 4, y + 5);
    doc.text('КОМУ', margin + contentW / 2 + 8, y + 5);

    doc.setTextColor(...darkText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(esc(company.name || company.companyName || '—'), margin + 4, y + 11);
    doc.text(esc(order.clientName || '—'), margin + contentW / 2 + 8, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    if (company.phone) doc.text(esc(company.phone), margin + 4, y + 17);
    if (company.address) doc.text(esc(company.address).substring(0, 35), margin + 4, y + 22);
    if (order.clientPhone) doc.text(esc(order.clientPhone), margin + contentW / 2 + 8, y + 17);
    if (order.dueDate) doc.text(`Оплата до: ${esc(order.dueDate)}`, margin + contentW / 2 + 8, y + 22);

    y += 36;

    // ── Items table ──
    const items = order.items || [];
    const colWidths = [contentW - 70, 12, 22, 14, 22]; // name, qty, price, disc, total
    const colX = [margin];
    colWidths.slice(0, -1).forEach((w, i) => colX.push(colX[i] + w));

    // Table header
    doc.setFillColor(...purple);
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const headers = ['Назва', 'Кіл.', 'Ціна', 'Зн.%', 'Сума'];
    const aligns = ['left', 'center', 'right', 'center', 'right'];
    headers.forEach((h, i) => {
      const x = i === 0 ? colX[i] + 2 : colX[i] + colWidths[i] - 2;
      doc.text(h, x, y + 5.5, { align: aligns[i] });
    });
    y += 8;

    // Table rows
    items.forEach((item, idx) => {
      const rowBg = idx % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
      doc.setFillColor(...rowBg);
      doc.rect(margin, y, contentW, 7, 'F');

      doc.setTextColor(...darkText);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(esc(item.name).substring(0, 45), colX[0] + 2, y + 5);
      doc.text(`${item.qty} ${item.unit || ''}`, colX[1] + colWidths[1] / 2, y + 5, { align: 'center' });
      doc.text(fmt(item.price), colX[2] + colWidths[2] - 2, y + 5, { align: 'right' });
      doc.text(`${item.discount || 0}%`, colX[3] + colWidths[3] / 2, y + 5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(item.total), colX[4] + colWidths[4] - 2, y + 5, { align: 'right' });
      y += 7;
    });

    // Table border bottom
    doc.setDrawColor(...lightGray);
    doc.line(margin, y, margin + contentW, y);
    y += 5;

    // ── Totals ──
    const totalsX = margin + contentW - 60;
    if (order.discountTotal > 0) {
      doc.setTextColor(...gray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Знижка:', totalsX, y);
      doc.text(`−${fmt(order.discountTotal)} ₴`, margin + contentW - 2, y, { align: 'right' });
      y += 7;
    }

    // Total box
    doc.setFillColor(...purple);
    doc.roundedRect(totalsX - 5, y - 3, contentW - (totalsX - margin) + 5, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('До сплати:', totalsX, y + 5.5);
    doc.text(`${fmt(order.total)} ₴`, margin + contentW - 2, y + 5.5, { align: 'right' });
    y += 20;

    // ── Payment method ──
    const pmLabels = { cash: '💵 Готівка', terminal: '💳 Термінал', transfer: '📱 Переказ', mixed: '🔀 Змішана' };
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Спосіб оплати: ${pmLabels[order.paymentMethod] || order.paymentMethod || '—'}`, margin, y);
    y += 8;

    // ── Bank details ──
    if (company.iban || company.bankDetails) {
      doc.setFillColor(...lightGray);
      doc.rect(margin, y, contentW, 14, 'F');
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('РЕКВІЗИТИ ДЛЯ ОПЛАТИ', margin + 4, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.text(esc(company.iban || company.bankDetails || '').substring(0, 80), margin + 4, y + 10);
      y += 18;
    }

    // ── Notes ──
    if (order.notes) {
      doc.setTextColor(...gray);
      doc.setFontSize(8);
      doc.text(`Примітка: ${esc(order.notes)}`, margin, y);
      y += 8;
    }

    // ── Footer ──
    doc.setFillColor(...lightGray);
    doc.rect(0, 285, pageW, 12, 'F');
    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.text('Сформовано в TALKO Business Platform', margin, 292);
    doc.text(`Сторінка 1`, pageW - margin, 292, { align: 'right' });

    // Save
    const filename = `${order.number || 'invoice'}.pdf`;
    doc.save(filename);
    if (typeof showToast === 'function') showToast(`PDF збережено: ${filename}`, 'success');
  };

})();
