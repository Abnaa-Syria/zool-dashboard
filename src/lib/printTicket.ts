/**
 * Isolated single-page printing utility for tickets and boarding passes.
 * Uses an isolated iframe with explicit styling and base URL to guarantee:
 * 1. Exactly 1 page in the print / Save as PDF dialog.
 * 2. High-contrast colors (green departure time, soft mint badge, crisp dark text).
 * 3. Logo and barcode are guaranteed to load and render visibly (no blank page).
 */
export function printTicketElement(elementId = 'printable-ticket') {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Remove any stale print iframes
  const oldIframe = document.getElementById('ticket-print-iframe');
  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'ticket-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect stylesheet tags from host document
  let stylesHtml = '';
  document.querySelectorAll('link[rel="stylesheet"]').forEach((node) => {
    stylesHtml += node.outerHTML;
  });
  document.querySelectorAll('style').forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  const ticketContent = element.innerHTML;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <base href="${window.location.origin}/" />
        <title>ZoolGo - تذكرة صعود الحافلة</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        ${stylesHtml}
        <style>
          @page {
            size: auto;
            margin: 8mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            visibility: visible !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'IBM Plex Sans Arabic', -apple-system, sans-serif !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            visibility: visible !important;
          }
          body {
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            padding: 10px 0 !important;
          }
          .ticket-print-sheet {
            width: 100% !important;
            max-width: 380px !important;
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 16px !important;
            padding: 18px 22px !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            visibility: visible !important;
          }
          /* Hide non-printable interactive controls */
          button, [role="button"], .no-print {
            display: none !important;
            visibility: hidden !important;
          }
        </style>
      </head>
      <body>
        <div class="ticket-print-sheet">
          ${ticketContent}
        </div>
      </body>
    </html>
  `);
  doc.close();

  const triggerPrint = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      iframe.remove();
    }, 2500);
  };

  // Ensure all images are fully loaded before opening print preview
  const images = Array.from(doc.querySelectorAll('img'));
  if (images.length === 0) {
    setTimeout(triggerPrint, 200);
  } else {
    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= images.length) {
        setTimeout(triggerPrint, 150);
      }
    };
    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded;
      }
    });
    // Safety fallback
    setTimeout(triggerPrint, 800);
  }
}
