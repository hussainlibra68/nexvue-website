/* ==========================================================================
   NexVue sales bill / invoice (staff dashboard only — never on the website)
   - "Bill" button on every order in the order history, and a "Create Bill"
     button under a newly created order.
   - The bill carries every customer-facing order detail (distributor, customer,
     order code, date, status, prescription card, lens / index / coating /
     frame, order details, specifications). Internal notes are left out.
   - Prices are typed in the bill editor (items, qty, rate, previous balance,
     delivery charges, discount) and saved privately with /api/manage
     (type "bill", admin key required), so the bill re-opens with them.
   - Output: A4 PDF download or print. Footer: both customer support numbers
     and www.nexvuelenses.uk.
   ========================================================================== */
(function () {
  'use strict';

  var LOGO_URL = 'https://cdn.jsdelivr.net/gh/hussainlibra68/nexvue-website@fc258ba1a11a5b004ab967328a35155a737cdc0f/assets/sticker/nexvue-wordmark-white.png';
  var SUPPORT = [
    { label: 'Pakistan', num: '+92 313 4706005' },
    { label: 'United Kingdom', num: '+44 7460 024087' }
  ];
  var SITE = 'www.nexvuelenses.uk';
  var DEFAULT_NOTE = 'Please do not pay our salesman without the ORIGINAL BILL. Please check all items on delivery; the company will not be responsible for any supplies afterwards.';
  var PAGE_W = 794, PAGE_H = 1123;   // A4 at 96 dpi

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function val(v) { return String(v == null ? '' : v).trim(); }
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return isFinite(n) ? n : 0; }
  function money(n) {
    var neg = n < 0; n = Math.abs(Math.round(n * 100) / 100);
    var s = n.toFixed(n % 1 ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + s;
  }
  function adminKey() { try { return sessionStorage.getItem('nexvue_admin_key') || ''; } catch (e) { return ''; } }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function niceDate(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(val(d));
    return m ? m[3] + '-' + MONTHS[+m[2] - 1] + '-' + m[1] : val(d);
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* ---------- defaults from the order ---------- */
  function eyeHas(e) { return !!(e && ['sph', 'cyl', 'axis', 'add', 'pd', 'height', 'dia'].some(function (k) { return val(e[k]); })); }

  function defaultBill(order) {
    var rx = order.prescription || {};
    var eyes = (eyeHas(rx.r) ? 1 : 0) + (eyeHas(rx.l) ? 1 : 0);
    var lens = ['NexVue', val(rx.lensType), val(rx.index)].filter(Boolean).join(' ');
    var desc = lens !== 'NexVue' ? lens + ' Lens' : (val(order.orderDetails).split('\n')[0] || 'NexVue Ophthalmic Lens');
    if (val(rx.coating)) desc += ' — Coating: ' + val(rx.coating);
    return {
      billNo: String(order.code || '').replace(/^NXV-/, 'NV-'),
      billDate: today(),
      currency: 'PKR',
      items: [{ desc: desc, qty: eyes || 1, rate: '' }],
      prevBalance: '', delivery: '', discount: '',
      note: DEFAULT_NOTE
    };
  }

  /* ---------- server (private, admin key) ---------- */
  var baseFetch = window.fetch.bind(window);
  function api(body) {
    return baseFetch('/api/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey() },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || j.error) throw new Error(j.error || 'Request failed (' + r.status + ').');
        return j;
      });
    });
  }
  function loadSaved(code) { return api({ type: 'bill', action: 'get', id: code }).then(function (j) { return j.item || null; }).catch(function () { return null; }); }
  function saveBill(code, bill) { return api({ type: 'bill', action: 'save', id: code, item: bill }); }

  /* ---------- totals ---------- */
  function totals(b) {
    var sub = 0;
    b.items.forEach(function (it) { sub += num(it.qty) * num(it.rate); });
    var prev = num(b.prevBalance), del = num(b.delivery), disc = num(b.discount);
    return { sub: sub, prev: prev, del: del, disc: disc, total: sub + prev + del - disc };
  }

  /* ---------- bill markup (A4) ---------- */
  function billHtml(order, b) {
    var rx = order.prescription || {};
    var cur = b.currency || 'PKR';
    var t = totals(b);
    var showRx = eyeHas(rx.r) || eyeHas(rx.l);
    var cols = [['sph', 'SPH'], ['cyl', 'CYL'], ['axis', 'AXIS'], ['add', 'ADD'], ['pd', 'PD'], ['height', 'HEIGHT'], ['dia', 'DIA']]
      .filter(function (c) { return val(rx.r && rx.r[c[0]]) || val(rx.l && rx.l[c[0]]); });

    var h = '<div class="nb-page">';
    // header band
    h += '<div class="nb-band"><div class="nb-brand"><img class="nb-logo" src="' + LOGO_URL + '" crossorigin="anonymous" alt="NexVue">' +
      '<div class="nb-tag">Premium High Quality UK Made Ophthalmic Lenses</div></div>' +
      '<div class="nb-title"><div class="nb-title-main">SALES INVOICE</div><div class="nb-title-no">Bill # ' + esc(b.billNo) + '</div></div></div>';

    // parties + meta
    h += '<div class="nb-meta"><div class="nb-to"><div class="nb-k">Bill To</div>' +
      '<div class="nb-to-name">' + esc(order.distributor || '—') + '</div>' +
      (val(order.customerName) ? '<div class="nb-to-sub">Customer / Patient: <strong>' + esc(order.customerName) + '</strong></div>' : '') +
      '</div><table class="nb-facts">' +
      '<tr><th>Bill Date</th><td>' + esc(niceDate(b.billDate)) + '</td></tr>' +
      '<tr><th>Order #</th><td>' + esc(order.code) + '</td></tr>' +
      '<tr><th>Order Date</th><td>' + esc(niceDate(order.orderDate)) + (val(order.orderTime) ? ' · ' + esc(order.orderTime) : '') + '</td></tr>' +
      '<tr><th>Status</th><td>' + esc(order.status || '—') + '</td></tr>' +
      '</table></div>';

    // prescription card
    if (showRx || val(rx.lensType) || val(rx.index) || val(rx.coating) || val(rx.frame)) {
      h += '<div class="nb-sec"><div class="nb-sec-h">Prescription &amp; Lens</div>';
      if (showRx && cols.length) {
        h += '<table class="nb-rx"><thead><tr><th>Eye</th>' + cols.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>';
        [['r', 'R'], ['l', 'L']].forEach(function (e) {
          if (!eyeHas(rx[e[0]])) return;
          h += '<tr><td class="nb-eye"><svg width="22" height="22" viewBox="0 0 22 22" aria-label="' + e[1] + '"><circle cx="11" cy="11" r="11" fill="#0a1a3d"/><text x="11" y="15.2" text-anchor="middle" fill="#fff" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="11.5">' + e[1] + '</text></svg></td>' + cols.map(function (c) { return '<td>' + esc(val(rx[e[0]][c[0]]) || '—') + '</td>'; }).join('') + '</tr>';
        });
        h += '</tbody></table>';
      }
      var lensBits = [['Lens Type', rx.lensType], ['Index', rx.index], ['Coating', rx.coating], ['Frame', rx.frame]].filter(function (x) { return val(x[1]); });
      if (lensBits.length) {
        h += '<div class="nb-lens">' + lensBits.map(function (x) { return '<div><span>' + x[0] + '</span><strong>' + esc(x[1]) + '</strong></div>'; }).join('') + '</div>';
      }
      h += '</div>';
    }

    // order details
    if (val(order.orderDetails) || val(order.specifications)) {
      h += '<div class="nb-sec nb-details">';
      if (val(order.orderDetails)) h += '<div><div class="nb-k">Order Details</div><p>' + esc(order.orderDetails).replace(/\n/g, '<br>') + '</p></div>';
      if (val(order.specifications)) h += '<div><div class="nb-k">Specifications</div><p>' + esc(order.specifications).replace(/\n/g, '<br>') + '</p></div>';
      h += '</div>';
    }

    // items
    h += '<table class="nb-items"><thead><tr><th class="nb-c">S#</th><th>Description</th><th class="nb-c">Qty</th><th class="nb-r">Rate (' + esc(cur) + ')</th><th class="nb-r">Amount (' + esc(cur) + ')</th></tr></thead><tbody>';
    b.items.forEach(function (it, i) {
      var amt = num(it.qty) * num(it.rate);
      h += '<tr><td class="nb-c">' + (i + 1) + '</td><td>' + esc(it.desc) + '</td><td class="nb-c">' + esc(val(it.qty) || '—') +
        '</td><td class="nb-r">' + (val(it.rate) ? money(num(it.rate)) : '—') + '</td><td class="nb-r">' + (val(it.rate) ? money(amt) : '—') + '</td></tr>';
    });
    h += '</tbody></table>';

    // totals
    h += '<div class="nb-sum"><table>';
    h += '<tr><th>Subtotal</th><td>' + money(t.sub) + '</td></tr>';
    if (t.prev) h += '<tr><th>Previous Balance</th><td>' + money(t.prev) + '</td></tr>';
    if (t.del) h += '<tr><th>Delivery Charges</th><td>' + money(t.del) + '</td></tr>';
    if (t.disc) h += '<tr><th>Discount</th><td>− ' + money(t.disc) + '</td></tr>';
    h += '<tr class="nb-total"><th>Total</th><td>' + esc(cur) + ' ' + money(t.total) + ' /=</td></tr>';
    h += '</table></div>';

    if (val(b.note)) h += '<p class="nb-note"><strong>Note:</strong> ' + esc(b.note) + '</p>';

    // footer
    h += '<div class="nb-foot"><div class="nb-thanks">Thank you for choosing NexVue</div>' +
      '<div class="nb-support"><span class="nb-k">Customer Support</span>' +
      SUPPORT.map(function (s) { return '<span class="nb-num"><em>' + s.label + '</em> ' + s.num + '</span>'; }).join('') + '</div>' +
      '<div class="nb-site">' + SITE + '</div></div>';

    h += '</div>';
    return h;
  }

  var BILL_CSS =
    '.nb-page{box-sizing:border-box;width:' + PAGE_W + 'px;min-height:' + PAGE_H + 'px;background:#fff;color:#14213d;font-family:Inter,Arial,sans-serif;font-size:12.5px;line-height:1.45;padding:0 0 132px;position:relative}' +
    '.nb-page *{box-sizing:border-box}' +
    '.nb-band{background:#0a1a3d;color:#fff;padding:26px 40px 22px;display:flex;justify-content:space-between;align-items:center;gap:20px;border-bottom:4px solid #1a6fd1}' +
    '.nb-logo{display:block;height:40px;width:auto}' +
    '.nb-tag{margin-top:8px;font-size:10.5px;letter-spacing:.06em;color:#9fd0ff}' +
    '.nb-title{text-align:right}.nb-title-main{font-family:Poppins,Arial,sans-serif;font-weight:700;font-size:22px;letter-spacing:.12em}' +
    '.nb-title-no{margin-top:4px;font-size:12.5px;color:#cfe3ff;font-weight:600}' +
    '.nb-meta{display:flex;justify-content:space-between;gap:24px;padding:24px 40px 6px}' +
    '.nb-k{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#5b6472;margin-bottom:4px}' +
    '.nb-to-name{font-family:Poppins,Arial,sans-serif;font-weight:600;font-size:17px;color:#0a1a3d}' +
    '.nb-to-sub{margin-top:4px;color:#3b4555}' +
    '.nb-facts{border-collapse:collapse;min-width:250px}.nb-facts th{text-align:left;font-weight:500;color:#5b6472;padding:3px 14px 3px 0;white-space:nowrap}' +
    '.nb-facts td{text-align:right;font-weight:600;color:#0a1a3d;padding:3px 0;white-space:nowrap}' +
    '.nb-sec{margin:16px 40px 0;border:1px solid #d5dbe4;border-radius:8px;padding:12px 14px}' +
    '.nb-sec-h{font-family:Poppins,Arial,sans-serif;font-weight:600;font-size:12.5px;color:#0a1a3d;margin-bottom:8px}' +
    '.nb-rx{width:100%;border-collapse:collapse;text-align:center}.nb-rx th{font-size:10px;letter-spacing:.08em;color:#5b6472;font-weight:600;padding:4px;border-bottom:1px solid #d5dbe4}' +
    '.nb-rx td{padding:6px 4px;font-weight:600;font-size:13.5px;color:#0a1a3d;border-bottom:1px solid #eef1f5}.nb-rx tr:last-child td{border-bottom:0}' +
    '.nb-eye svg{display:inline-block;vertical-align:middle}.nb-eye span{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;line-height:1;border-radius:50%;background:#0a1a3d;color:#fff;font-family:Poppins,Arial,sans-serif;font-size:11.5px}' +
    '.nb-lens{display:flex;flex-wrap:wrap;gap:6px 26px;margin-top:10px;padding-top:9px;border-top:1px dashed #d5dbe4}' +
    '.nb-lens span{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#5b6472}.nb-lens strong{color:#1a6fd1;font-weight:600}' +
    '.nb-details{display:flex;gap:28px}.nb-details>div{flex:1}.nb-details p{margin:0;color:#14213d}' +
    '.nb-items{width:calc(100% - 80px);margin:18px 40px 0;border-collapse:collapse}' +
    '.nb-items th{background:#0a1a3d;color:#fff;font-weight:600;font-size:11px;letter-spacing:.04em;padding:9px 10px;text-align:left}' +
    '.nb-items td{padding:10px;border-bottom:1px solid #d5dbe4;vertical-align:top}.nb-items tbody tr:nth-child(even) td{background:#f6f8fb}' +
    '.nb-c{text-align:center!important;width:52px}.nb-r{text-align:right!important;width:120px;white-space:nowrap}' +
    '.nb-sum{display:flex;justify-content:flex-end;margin:12px 40px 0}.nb-sum table{border-collapse:collapse;min-width:290px}' +
    '.nb-sum th{text-align:left;font-weight:500;color:#3b4555;padding:5px 12px 5px 0}.nb-sum td{text-align:right;font-weight:600;padding:5px 0;white-space:nowrap}' +
    '.nb-sum .nb-total th,.nb-sum .nb-total td{border-top:2px solid #0a1a3d;padding-top:9px;font-family:Poppins,Arial,sans-serif;font-size:16px;font-weight:700;color:#0a1a3d}' +
    '.nb-note{margin:22px 40px 0;font-size:10.5px;color:#5b6472}' +
    '.nb-foot{position:absolute;left:0;right:0;bottom:0;background:#0a1a3d;color:#fff;padding:16px 40px 18px;text-align:center;border-top:4px solid #1a6fd1}' +
    '.nb-thanks{font-family:Poppins,Arial,sans-serif;font-weight:600;font-size:13px}' +
    '.nb-support{margin-top:6px;display:flex;justify-content:center;flex-wrap:wrap;gap:4px 22px;align-items:baseline}' +
    '.nb-support .nb-k{color:#9fd0ff;margin:0}.nb-num{font-weight:600;font-size:13px}.nb-num em{font-style:normal;color:#9fd0ff;font-weight:500;font-size:11px;margin-right:3px}' +
    '.nb-site{margin-top:6px;font-weight:700;letter-spacing:.06em;color:#9fd0ff;font-size:13px}';

  function ensureCss() {
    if ($('nb-css')) return;
    var st = document.createElement('style');
    st.id = 'nb-css';
    st.textContent = BILL_CSS +
      '.nb-dialog{max-width:1120px!important}.nb-wrap{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:20px;align-items:start}' +
      '@media (max-width:860px){.nb-wrap{grid-template-columns:1fr}}' +
      '.nb-ed label{display:block;font-size:.78rem;font-weight:600;color:#3b4555;margin:10px 0 4px}' +
      '.nb-ed input,.nb-ed select,.nb-ed textarea{width:100%;padding:7px 9px;border:1px solid #d5dbe4;border-radius:7px;font:inherit;font-size:.88rem;box-sizing:border-box}' +
      '.nb-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nb-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:end}' +
      '.nb-it{border:1px solid #e2e8f0;border-radius:9px;padding:8px;margin-top:8px;background:#fafbfd}' +
      '.nb-it textarea{resize:vertical;min-height:38px}.nb-it-row{display:grid;grid-template-columns:70px 1fr auto;gap:6px;margin-top:6px;align-items:center}' +
      '.nb-it-lbl{display:grid;grid-template-columns:70px 1fr;gap:6px;margin-top:6px;font-size:.72rem;font-weight:600;color:#5b6472}.nb-it-lbl+.nb-it-row{margin-top:2px}' +
      '.nb-it-x{border:0;background:#fde8e8;color:#b42318;border-radius:6px;padding:6px 9px;cursor:pointer;font-weight:600}' +
      '.nb-add{margin-top:8px}.nb-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}' +
      '.nb-prev{background:#e9edf3;border-radius:10px;padding:12px;overflow:hidden}.nb-prev-in{transform-origin:0 0;box-shadow:0 10px 30px rgba(10,26,61,.18)}';
    document.head.appendChild(st);
  }

  /* ---------- PDF + print ---------- */
  function loadScript(src, check) {
    if (check()) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var sc = document.createElement('script');
      sc.src = src;
      sc.onload = function () { check() ? resolve() : reject(new Error('Library failed to load.')); };
      sc.onerror = function () { reject(new Error('Could not load the PDF library. Check the internet connection.')); };
      document.head.appendChild(sc);
    });
  }
  function libs() {
    return Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function () { return !!(window.jspdf && window.jspdf.jsPDF); }),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', function () { return !!window.html2canvas; })
    ]);
  }

  function renderOffscreen(html) {
    var host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:' + PAGE_W + 'px;background:#fff;z-index:-1';
    host.innerHTML = html;
    document.body.appendChild(host);
    var imgs = Array.prototype.slice.call(host.querySelectorAll('img'));
    return Promise.all(imgs.map(function (im) {
      return im.complete ? null : new Promise(function (r) { im.onload = im.onerror = r; });
    })).then(function () { return document.fonts && document.fonts.ready; }).then(function () { return host; });
  }

  function downloadPdf(order, b) {
    return libs().then(function () { return renderOffscreen(billHtml(order, b)); }).then(function (host) {
      var page = host.firstChild;
      return window.html2canvas(page, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false })
        .then(function (cv) {
          host.remove();
          var JsPDF = window.jspdf.jsPDF;
          var hmm = 210 * cv.height / cv.width;            // keep proportions; A4 = 297 mm
          var pdf = new JsPDF({ unit: 'mm', format: [210, Math.max(297, hmm)], orientation: 'portrait', compress: true });
          pdf.addImage(cv.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, hmm, undefined, 'FAST');
          pdf.setProperties({ title: 'NexVue Bill ' + b.billNo, author: 'NexVue Lenses' });
          pdf.save('NexVue-Bill-' + (b.billNo || order.code) + '.pdf');
        }, function (e) { host.remove(); throw e; });
    });
  }

  function printBill(order, b) {
    var w = window.open('', '_blank');
    if (!w) { window.alert('Please allow pop-ups for this site to print the bill.'); return; }
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>NexVue Bill ' + esc(b.billNo) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">' +
      '<style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      BILL_CSS + '.nb-page{width:210mm;min-height:297mm;margin:0 auto}</style></head><body>' + billHtml(order, b) +
      '<script>window.onload=function(){(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print()},300)})}<\/script></body></html>');
    w.document.close();
  }

  /* ---------- editor dialog ---------- */
  function close() {
    var m = $('nb-modal');
    if (m) m.remove();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', fitPreview);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  function fitPreview() {
    var box = document.querySelector('#nb-modal .nb-prev');
    var inner = box && box.querySelector('.nb-prev-in');
    if (!inner) return;
    var s = Math.min(1, (box.clientWidth - 24) / PAGE_W);
    inner.style.transform = 'scale(' + s + ')';
    box.style.height = (inner.firstChild.offsetHeight * s + 24) + 'px';
  }

  function openBill(order) {
    ensureCss();
    close();
    var ov = document.createElement('div');
    ov.className = 'stk-modal';
    ov.id = 'nb-modal';
    ov.innerHTML = '<div class="stk-dialog nb-dialog" role="dialog" aria-modal="true" aria-label="Bill for ' + esc(order.code) + '">' +
      '<button type="button" class="stk-close" aria-label="Close">&times;</button>' +
      '<h3>Bill · ' + esc(order.code) + '</h3><p class="stk-sub">Staff only — not shown on the website. ' + esc([order.distributor, order.customerName].filter(Boolean).join(' · ')) + '</p>' +
      '<p class="status-line nb-loading">Loading saved bill…</p></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.stk-close').addEventListener('click', close);
    document.body.appendChild(ov);
    document.addEventListener('keydown', onKey);

    loadSaved(order.code).then(function (saved) {
      var b = defaultBill(order);
      if (saved) Object.keys(b).forEach(function (k) { if (saved[k] != null) b[k] = saved[k]; });
      if (!Array.isArray(b.items) || !b.items.length) b.items = defaultBill(order).items;
      var dlg = ov.querySelector('.nb-dialog');
      if (!dlg) return;
      dlg.querySelector('.nb-loading').remove();
      buildEditor(dlg, order, b, !!saved);
    });
  }

  function buildEditor(dlg, order, b, wasSaved) {
    var wrap = document.createElement('div');
    wrap.className = 'nb-wrap';
    wrap.innerHTML =
      '<div class="nb-ed">' +
      '<div class="nb-row2"><div><label>Bill #</label><input data-k="billNo" maxlength="40"></div><div><label>Bill Date</label><input type="date" data-k="billDate"></div></div>' +
      '<label>Currency</label><select data-k="currency"><option value="PKR">PKR (Rs)</option><option value="GBP">GBP (£)</option><option value="USD">USD ($)</option></select>' +
      '<label>Items</label><div class="nb-items-ed"></div>' +
      '<button type="button" class="btn outline small-btn nb-add">+ Add item</button>' +
      '<div class="nb-row3"><div><label>Previous Balance</label><input data-k="prevBalance" inputmode="decimal"></div>' +
      '<div><label>Delivery Charges</label><input data-k="delivery" inputmode="decimal"></div>' +
      '<div><label>Discount</label><input data-k="discount" inputmode="decimal"></div></div>' +
      '<label>Note on bill</label><textarea data-k="note" rows="3" maxlength="400"></textarea>' +
      '<div class="nb-actions"><button type="button" class="btn small-btn nb-pdf">Download PDF</button>' +
      '<button type="button" class="btn outline small-btn nb-print">Print</button>' +
      '<button type="button" class="btn outline small-btn nb-save">Save</button></div>' +
      '<p class="status-line nb-msg">' + (wasSaved ? 'Saved bill loaded.' : 'Enter the rates, then Save / Download.') + '</p>' +
      '</div><div class="nb-prev"><div class="nb-prev-in"></div></div>';
    dlg.appendChild(wrap);

    var msg = wrap.querySelector('.nb-msg');
    var prevIn = wrap.querySelector('.nb-prev-in');
    var itemsBox = wrap.querySelector('.nb-items-ed');

    Array.prototype.forEach.call(wrap.querySelectorAll('[data-k]'), function (el) {
      el.value = b[el.getAttribute('data-k')] == null ? '' : b[el.getAttribute('data-k')];
      el.addEventListener('input', function () { b[el.getAttribute('data-k')] = el.value; refresh(); });
    });

    function drawItems() {
      itemsBox.innerHTML = '';
      b.items.forEach(function (it, i) {
        var d = document.createElement('div');
        d.className = 'nb-it';
        d.innerHTML = '<textarea rows="2" placeholder="Description" maxlength="300"></textarea>' +
          '<div class="nb-it-lbl"><span>Qty</span><span>Rate</span></div><div class="nb-it-row"><input placeholder="Qty" aria-label="Quantity" inputmode="decimal"><input placeholder="Rate" aria-label="Rate" inputmode="decimal">' +
          '<button type="button" class="nb-it-x" title="Remove item"' + (b.items.length < 2 ? ' disabled' : '') + '>&times;</button></div>';
        var f = d.querySelectorAll('textarea,input');
        f[0].value = it.desc || ''; f[1].value = it.qty == null ? '' : it.qty; f[2].value = it.rate == null ? '' : it.rate;
        f[0].addEventListener('input', function () { it.desc = f[0].value; refresh(); });
        f[1].addEventListener('input', function () { it.qty = f[1].value; refresh(); });
        f[2].addEventListener('input', function () { it.rate = f[2].value; refresh(); });
        d.querySelector('.nb-it-x').addEventListener('click', function () { b.items.splice(i, 1); drawItems(); refresh(); });
        itemsBox.appendChild(d);
      });
    }
    wrap.querySelector('.nb-add').addEventListener('click', function () {
      b.items.push({ desc: '', qty: 1, rate: '' }); drawItems(); refresh();
      var last = itemsBox.querySelector('.nb-it:last-child textarea'); if (last) last.focus();
    });

    var t = null;
    function refresh() {
      clearTimeout(t);
      t = setTimeout(function () { prevIn.innerHTML = billHtml(order, b); fitPreview(); var im = prevIn.querySelector('img'); if (im) im.onload = fitPreview; }, 60);
    }

    function doSave(quiet) {
      if (!quiet) msg.textContent = 'Saving…';
      return saveBill(order.code, b).then(function () { msg.textContent = 'Bill saved.'; })
        .catch(function (e) { msg.textContent = 'Not saved: ' + e.message; });
    }
    wrap.querySelector('.nb-save').addEventListener('click', function () { doSave(false); });
    wrap.querySelector('.nb-pdf').addEventListener('click', function () {
      var btn = this; btn.disabled = true; msg.textContent = 'Preparing PDF…';
      doSave(true).then(function () { return downloadPdf(order, b); })
        .then(function () { msg.textContent = 'PDF downloaded and bill saved.'; })
        .catch(function (e) { msg.textContent = e.message; })
        .then(function () { btn.disabled = false; });
    });
    wrap.querySelector('.nb-print').addEventListener('click', function () { doSave(true); printBill(order, b); });

    drawItems();
    prevIn.innerHTML = billHtml(order, b);
    window.addEventListener('resize', fitPreview);
    setTimeout(fitPreview, 0);
    var im = prevIn.querySelector('img'); if (im) im.onload = fitPreview;
  }

  /* ---------- entry points ---------- */
  function openForCode(code, btn) {
    btn.disabled = true;
    baseFetch('/api/update-order?code=' + encodeURIComponent(code), { headers: { 'x-admin-key': adminKey() } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.order) throw new Error((d && d.error) || 'Could not load this order.');
        openBill(d.order);
      })
      .catch(function (e) { window.alert(e.message); })
      .then(function () { btn.disabled = false; });
  }

  function addRowButtons() {
    var body = $('orders-table-body');
    if (!body) return;
    Array.prototype.forEach.call(body.querySelectorAll('.row-actions'), function (ra) {
      if (ra.querySelector('.bill-row-btn')) return;
      var edit = ra.querySelector('.edit-row-btn');
      if (!edit) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn outline small-btn bill-row-btn';
      b.textContent = 'Bill';
      b.setAttribute('data-code', edit.getAttribute('data-code'));
      b.addEventListener('click', function () { openForCode(b.getAttribute('data-code'), b); });
      var after = ra.querySelector('.sticker-row-btn') || edit;
      after.insertAdjacentElement('afterend', b);
    });
  }

  // After a new order is created, offer the bill straight away
  function showCreateButton(order) {
    var sticker = $('order-sticker');
    var host = $('order-bill');
    if (!host) {
      host = document.createElement('div');
      host.id = 'order-bill';
      host.style.marginTop = '14px';
      if (sticker) sticker.insertAdjacentElement('afterend', host);
      else { var f = $('order-form'); if (!f) return; f.insertAdjacentElement('afterend', host); }
    }
    host.innerHTML = '<button type="button" class="btn">Create Bill for ' + esc(order.code) + '</button>';
    host.firstChild.addEventListener('click', function () { openBill(order); });
  }

  var prevFetch = window.fetch;
  window.fetch = function (url, opts) {
    var u = typeof url === 'string' ? url : (url && url.url) || '';
    var p = prevFetch.apply(window, arguments);
    if (/\/api\/create-order(\?|$)/.test(u) && opts && String(opts.method || '').toUpperCase() === 'POST') {
      p.then(function (r) { return r.clone().json(); })
        .then(function (d) { if (d && d.order) showCreateButton(d.order); })
        .catch(function () {});
    }
    return p;
  };

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var body = $('orders-table-body');
    if (body && window.MutationObserver) new MutationObserver(function () { setTimeout(addRowButtons, 0); }).observe(body, { childList: true });
    addRowButtons();
    var form = $('order-form');
    if (form) form.addEventListener('submit', function () { var h = $('order-bill'); if (h) h.innerHTML = ''; }, true);
  });

  window.NexVueBill = { open: openBill, html: billHtml };
})();
