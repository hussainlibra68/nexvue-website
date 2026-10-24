/* ==========================================================================
   NexVue RX page — interactions
   - scroll reveals, hero lens parallax
   - progressive-lens anatomy (scroll sequence + zone buttons)
   - product ecosystem filter
   - 7-step RX configurator → enquiry sent through the site's real channels
     (WhatsApp Pakistan / WhatsApp UK / email), the same channels used on the
     Contact page. Nothing is stored on a server and no price is shown.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('rx-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var CONTACT = {
    email: 'info@nexvuelenses.uk',
    waPK: { num: '923134706005', label: 'WhatsApp · Pakistan support (+92 313 4706005)' },
    waUK: { num: '447460024087', label: 'WhatsApp · UK support (+44 7460 024087)' }
  };

  /* ------------------------------------------------------------ reveals */
  function onView(els, cb, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { cb(el, true); }); return null; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { cb(en.target, en.isIntersecting, en); });
    }, opts || { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
    return io;
  }
  var revealIO = onView($$('.rx-rv, .rx-tl'), function (el, inView) {
    if (inView) { el.classList.add('in'); if (revealIO) revealIO.unobserve(el); }
  });

  /* ------------------------------------------------------------ hero lens */
  (function () {
    var stage = $('.rx-stage');
    var lens = $('.rx-lens3d');
    if (!stage || !lens || reduce) return;
    var raf = 0, tx = -8, ty = 4;
    function apply() { raf = 0; lens.style.setProperty('--ry', tx.toFixed(2) + 'deg'); lens.style.setProperty('--rx', ty.toFixed(2) + 'deg'); }
    var hero = $('.rx-hero');
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      tx = -8 + px * 18; ty = 4 - py * 12;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener('pointerleave', function () { tx = -8; ty = 4; if (!raf) raf = requestAnimationFrame(apply); });
    // subtle scroll parallax
    window.addEventListener('scroll', function () {
      var y = Math.min(window.scrollY, 700);
      stage.style.transform = 'translateY(' + (y * 0.08).toFixed(1) + 'px)';
    }, { passive: true });
  })();

  /* ------------------------------------------------------------ anatomy */
  (function () {
    var svg = $('#rx-anat-svg');
    if (!svg) return;
    var order = ['distance', 'intermediate', 'near', 'corridor', 'periphery'];
    function show(upto) {
      order.forEach(function (k, i) {
        var on = i <= upto;
        $$('[data-z="' + k + '"]', svg).forEach(function (el) { el.classList.toggle('on', on); });
      });
    }
    var steps = $$('.rx-step');
    var active = -1;
    function setActive(i) {
      if (i === active) return;
      active = i;
      steps.forEach(function (s, j) { s.classList.toggle('active', j === i); });
      show(Math.max(i, 0));
    }
    if (reduce || !('IntersectionObserver' in window)) { show(order.length - 1); steps.forEach(function (s) { s.classList.add('active'); }); }
    else {
      show(0); setActive(0);
      onView(steps, function (el, inView) {
        if (inView) setActive(steps.indexOf(el));
      }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    }
    // zone buttons
    var btns = $$('.rx-zbtn');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var z = b.getAttribute('data-zone');
        var was = b.getAttribute('aria-pressed') === 'true';
        btns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        $$('.hl', svg).forEach(function (el) { el.classList.remove('hl'); });
        if (was) { svg.classList.remove('focus'); return; }
        b.setAttribute('aria-pressed', 'true');
        show(order.length - 1);
        svg.classList.add('focus');
        $$('[data-z="' + z + '"]', svg).forEach(function (el) { el.classList.add('hl'); });
        var live = $('#rx-zone-live');
        if (live) live.textContent = b.getAttribute('data-desc') || '';
      });
    });
  })();

  /* ------------------------------------------------------------ products */
  var PRODUCTS = window.NEXVUE_RX_PRODUCTS || [];
  (function () {
    var chips = $$('.rx-chip');
    var cards = $$('.rx-prod');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var g = c.getAttribute('data-g');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        cards.forEach(function (card) {
          card.hidden = !(g === 'all' || card.getAttribute('data-g') === g);
        });
      });
    });
  })();

  /* ------------------------------------------------------------ configurator */
  var CATS = {
    sv: { name: 'Single Vision', zones: 'sv' },
    prog: { name: 'Progressive', zones: 'prog', confirm: true },
    bif: { name: 'Bifocal', zones: 'bif', confirm: true },
    office: { name: 'Occupational / Office', zones: 'office', confirm: true },
    other: { name: 'Other / not sure yet', zones: 'sv', confirm: true }
  };
  var USES = {
    everyday: 'Everyday vision', reading: 'Reading & close work', computer: 'Computer & office use',
    driving: 'Driving', outdoor: 'Outdoor use', active: 'Sport & active / children', other: 'Other requirements'
  };
  var INDEX = {
    '1.50': 'Standard 1.50', '1.56': 'Mid index 1.56', '1.60': 'Mid-high index 1.60',
    '1.67': 'High index 1.67 aspheric', '1.74': 'High index 1.74 aspheric',
    pc: 'Polycarbonate (impact resistant)', advise: 'Not sure — please advise'
  };
  var COATS = {
    ar: 'Anti-reflective (HMC)', greenar: 'Green anti-reflective', uv: 'UV protection',
    blue: 'Blue-light filtering', photo: 'Photochromic (light-adaptive)', drive: 'Drive / anti-glare',
    tint: 'Sun tint'
  };
  var TINTS = ['Grey', 'Brown', 'Green', 'Blue', 'Silver'];
  var STEP_NAMES = ['Lens type', 'Intended use', 'Material & index', 'Coatings', 'Prescription', 'Review', 'Enquiry'];

  var S = {
    step: 0, cat: '', uses: [], useOther: '', index: '', coats: ['uv'], tint: '', product: '',
    rxMode: '', rx: { r: {}, l: {} }, frame: '', frameNotes: '',
    name: '', business: '', role: '', email: '', phone: '', country: '', message: '', channel: '', consent: false
  };
  var maxStep = 0;

  var cfg = $('#rx-cfg-main');
  var sum = $('#rx-sum');
  if (!cfg) return;

  function needsAdd() { return S.cat === 'prog' || S.cat === 'bif' || S.cat === 'office'; }
  function needsHeight() { return S.cat === 'prog' || S.cat === 'bif'; }
  function has(c) { return S.coats.indexOf(c) !== -1; }

  // coating compatibility: returns a reason string when a coating can't be added now
  function coatBlock(c) {
    if (c === 'tint' && has('photo')) return 'A sun tint and a photochromic treatment are alternatives — choose one.';
    if (c === 'photo' && has('tint')) return 'A photochromic treatment and a sun tint are alternatives — choose one.';
    if (c === 'greenar' && has('ar')) return 'Green AR is itself an anti-reflective finish — choose one AR finish.';
    if (c === 'ar' && has('greenar')) return 'Green AR is itself an anti-reflective finish — choose one AR finish.';
    return '';
  }

  function flags() {
    var f = [];
    if (CATS[S.cat] && CATS[S.cat].confirm) {
      f.push(S.cat === 'office'
        ? 'Occupational / office RX design availability is confirmed by NexVue with your quote (Work View HD is the office & digital lens in the 2026 stock range).'
        : 'Design names, corridor and fitting requirements for ' + CATS[S.cat].name.toLowerCase() + ' lenses are confirmed by NexVue with your quote.');
    }
    if ((S.index === '1.67' || S.index === '1.74') && (has('photo') || has('blue') || has('drive') || has('tint') || has('greenar'))) {
      f.push('The 2026 catalogue lists 1.67 / 1.74 aspheric lenses with UV protection — availability of the other selected treatments on this index needs confirming.');
    }
    if (S.index === 'pc' && needsAdd()) f.push('Polycarbonate availability in this RX design needs confirming.');
    if (has('drive') && has('tint')) f.push('Drive lenses combined with a sun tint need confirming for night use.');
    if (S.index && S.index !== 'advise' && S.cat !== 'sv') f.push('Index availability varies by design and power range and is confirmed with your quote.');
    return f;
  }

  function bestMatch() {
    if (!PRODUCTS.length) return null;
    var want = S.coats.filter(function (c) { return c !== 'uv'; });
    var best = null, bestScore = -1;
    PRODUCTS.forEach(function (p) {
      if (S.index && S.index !== 'advise') {
        if (S.index === 'pc') { if (p.f.indexOf('impact') === -1) return; }
        else if (p.idx.indexOf(S.index) === -1) return;
      }
      var score = 0;
      want.forEach(function (c) {
        // AR is a general finish on most lenses, so it only nudges the match
        if (c === 'ar') { if (p.f.indexOf('ar') !== -1) score += 1; return; }
        if (p.f.indexOf(c) !== -1) score += 3; else score -= 2;
      });
      p.f.forEach(function (c) { if (c !== 'uv' && c !== 'ar' && c !== 'impact' && want.indexOf(c) === -1) score -= 1; });
      if (S.uses.indexOf('computer') !== -1 && p.id === 'workview') score += 1;
      if (S.uses.indexOf('driving') !== -1 && p.f.indexOf('drive') !== -1) score += 1;
      if (S.uses.indexOf('active') !== -1 && p.f.indexOf('impact') !== -1) score += 1;
      if (S.index === '1.67' && p.id === 'hi167') score += 4;
      if (S.index === '1.74' && p.id === 'hi174') score += 4;
      if (p.jr && S.uses.indexOf('active') === -1) score -= 1;
      if (score > bestScore) { bestScore = score; best = p; }
    });
    return bestScore >= 0 ? best : null;
  }

  /* ---- rendering helpers */
  function opt(type, name, value, title, desc, checked, extra) {
    extra = extra || {};
    var id = 'rxo-' + name + '-' + value;
    return '<div class="rx-opt"><input type="' + type + '" id="' + id + '" name="' + name + '" value="' + esc(value) + '"' +
      (checked ? ' checked' : '') + (extra.disabled ? ' disabled aria-describedby="' + id + '-why"' : '') + '>' +
      '<label for="' + id + '"><strong>' + title + '</strong>' + (desc ? '<span>' + desc + '</span>' : '') +
      (extra.tag ? '<em class="rx-tag' + (extra.warn ? ' warn' : '') + '">' + extra.tag + '</em>' : '') +
      (extra.disabled ? '<span id="' + id + '-why" class="rx-why">' + esc(extra.disabled) + '</span>' : '') +
      '</label></div>';
  }

  function panel(step) {
    var h = '';
    if (step === 0) {
      h += '<h3>Which lens design are you enquiring about?</h3><p class="hint">Choose the RX lens category. You can change it at any time.</p>';
      h += '<fieldset class="rx-opts"><legend>Lens category</legend>' +
        opt('radio', 'cat', 'sv', 'Single Vision', 'One principal prescription power for a chosen viewing distance.', S.cat === 'sv') +
        opt('radio', 'cat', 'prog', 'Progressive', 'Distance, intermediate and near zones in one lens, with no visible segment line.', S.cat === 'prog', { tag: 'Design details on quote' }) +
        opt('radio', 'cat', 'bif', 'Bifocal', 'Distinct distance and near zones, usually separated by a visible segment.', S.cat === 'bif', { tag: 'Design details on quote' }) +
        opt('radio', 'cat', 'office', 'Occupational / Office', 'Focused on intermediate and near working distances.', S.cat === 'office', { tag: 'Availability to confirm', warn: true }) +
        opt('radio', 'cat', 'other', 'Other / not sure yet', 'Describe the requirement and NexVue will advise.', S.cat === 'other') +
        '</fieldset>';
    }
    if (step === 1) {
      h += '<h3>What will the lenses mainly be used for?</h3><p class="hint">Select all that apply. These are preferences to guide the enquiry — not a medical recommendation.</p>';
      h += '<fieldset class="rx-opts"><legend>Intended use</legend>' + Object.keys(USES).map(function (k) {
        return opt('checkbox', 'use', k, USES[k], '', S.uses.indexOf(k) !== -1);
      }).join('') + '</fieldset>';
      h += '<div class="rx-field" id="rx-use-other-wrap"' + (S.uses.indexOf('other') === -1 ? ' hidden' : '') + '><label for="rx-use-other">Describe the other requirement</label>' +
        '<input id="rx-use-other" maxlength="160" value="' + esc(S.useOther) + '" placeholder="e.g. long-distance driving, studio work"></div>';
    }
    if (step === 2) {
      var conf = S.cat && S.cat !== 'sv';
      h += '<h3>Lens material and refractive index</h3><p class="hint">Indices listed in the NexVue 2026 range. A higher index can make a lens thinner and lighter for the same power, but the final thickness also depends on the prescription, the lens design, the frame size and shape, and how the lens is centred and edged.</p>';
      h += '<fieldset class="rx-opts"><legend>Index</legend>' +
        opt('radio', 'idx', '1.50', '1.50 Standard', 'Often suited to lower powers.', S.index === '1.50', conf ? { tag: 'To confirm for this design' } : null) +
        opt('radio', 'idx', '1.56', '1.56 Mid index', 'Thinner than 1.50 for the same power.', S.index === '1.56', conf ? { tag: 'To confirm for this design' } : null) +
        opt('radio', 'idx', '1.60', '1.60 Mid-high index', 'A further step thinner and lighter.', S.index === '1.60', conf ? { tag: 'To confirm for this design' } : null) +
        opt('radio', 'idx', '1.67', '1.67 High index aspheric', 'Listed for higher prescriptions in the 2026 range.', S.index === '1.67', conf ? { tag: 'To confirm for this design' } : null) +
        opt('radio', 'idx', '1.74', '1.74 High index aspheric', 'The thinnest index in the 2026 range, for the highest powers.', S.index === '1.74', conf ? { tag: 'To confirm for this design' } : null) +
        opt('radio', 'idx', 'pc', 'Polycarbonate', 'Impact-resistant material (Impact Guard, X Shield, OptiGuard Junior in the stock range).', S.index === 'pc', { tag: 'Availability to confirm', warn: true }) +
        opt('radio', 'idx', 'advise', 'Not sure — please advise', 'NexVue can suggest an index once the prescription is known.', S.index === 'advise') +
        '</fieldset>';
      h += '<p class="rx-info">Availability varies by product and power range. Not every index is offered in every RX design — NexVue confirms the options with your quote.</p>';
    }
    if (step === 3) {
      h += '<h3>Coatings and treatments</h3><p class="hint">Choose the treatments you would like to discuss. Options that cannot be combined are disabled with a reason.</p>';
      h += '<fieldset class="rx-opts"><legend>Coatings</legend>' + Object.keys(COATS).map(function (k) {
        var desc = {
          ar: 'Hard multi-coat that reduces reflections and is easier to clean.',
          greenar: 'Premium green multi-coat AR, as on Vision HD Green AR.',
          uv: 'UV protection is listed on every lens in the 2026 range.',
          blue: 'Filters part of the blue light from screens, as on Vision HD.',
          photo: 'Clear indoors and darkens outdoors, as on Photo Vision HD.',
          drive: 'Reduces glare from headlights, as on the DualVue Drive series.',
          tint: 'Sun tint colours as listed for SunBuddy Jr.'
        }[k];
        var block = has(k) ? '' : coatBlock(k);
        return opt('checkbox', 'coat', k, COATS[k], desc, has(k), block ? { disabled: block } : null);
      }).join('') + '</fieldset>';
      h += '<div class="rx-field" id="rx-tint-wrap"' + (has('tint') ? '' : ' hidden') + '><label for="rx-tint">Tint colour <small>(optional)</small></label><select id="rx-tint"><option value="">No preference</option>' +
        TINTS.map(function (t) { return '<option' + (S.tint === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></div>';
      if (S.product) h += '<p class="rx-info">Reference lens from the catalogue: <strong>' + esc(productName(S.product)) + '</strong>. <button type="button" class="rx-link" data-act="clear-product">Remove</button></p>';
    }
    if (step === 4) {
      h += '<h3>Prescription and fitting details</h3><p class="hint">Optional. Share what you have — every measurement is not required to enquire. NexVue does not diagnose, check or recommend a prescription.</p>';
      h += '<fieldset class="rx-opts"><legend>Prescription details</legend>' +
        opt('radio', 'rxmode', 'have', 'I have the details now', 'Enter the values below.', S.rxMode === 'have') +
        opt('radio', 'rxmode', 'later', 'I will send them later', 'NexVue will ask for them when quoting.', S.rxMode === 'later') +
        opt('radio', 'rxmode', 'none', 'Not available yet', 'Enquire about the lens options first.', S.rxMode === 'none') + '</fieldset>';
      h += '<div id="rx-rx-wrap"' + (S.rxMode === 'have' ? '' : ' hidden') + '>' + rxTable() +
        '<div class="rx-grid2"><div class="rx-field"><label for="rx-frame">Frame type <small>(optional)</small></label><select id="rx-frame">' +
        ['', 'Full rim', 'Semi-rimless', 'Rimless', 'Sports / wrap', 'Not sure'].map(function (f) { return '<option value="' + f + '"' + (S.frame === f ? ' selected' : '') + '>' + (f || 'Select…') + '</option>'; }).join('') +
        '</select></div><div class="rx-field"><label for="rx-fnotes">Frame or fitting notes <small>(optional)</small></label><input id="rx-fnotes" maxlength="240" value="' + esc(S.frameNotes) + '" placeholder="e.g. frame size 52□18, uncut"></div></div>' +
        (needsHeight() ? '<p class="rx-info">Progressive and bifocal fitting measurements should be taken and confirmed by the dispensing optical professional. Design-specific requirements, such as a minimum fitting height, are confirmed by NexVue for the chosen design.</p>' : '') +
        '</div>';
      h += '<p class="rx-note" style="margin-top:16px"><strong>Privacy:</strong> please do not include the wearer\'s name or other personal health information. Prescription values are only placed into the enquiry message you send — this page does not store them.</p>';
    }
    if (step === 5) {
      h += '<h3>Review your configuration</h3><p class="hint">Check the details. Use Edit to change any step — your other selections are kept.</p>';
      h += '<dl class="rx-review">' + reviewRows().map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd><button type="button" class="rx-link" data-goto="' + r[2] + '" aria-label="Edit ' + esc(r[0]) + '">Edit</button></div>';
      }).join('') + '</dl>';
      var fl = flags();
      if (fl.length) h += '<div class="rx-info warn"><strong>To be confirmed by NexVue:</strong><ul style="margin:6px 0 0;padding-left:18px">' + fl.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      h += '<p class="rx-info">This is a product-discovery and enquiry tool. It does not give a price or an instant quotation.</p>';
    }
    if (step === 6) {
      h += '<h3>Request an RX quote</h3><p class="hint">Your configuration is added to the message automatically. Choose how you would like to send it.</p>';
      h += '<div class="rx-grid2">' +
        field('rx-name', 'Your name *', 'text', S.name, 'autocomplete="name" maxlength="80" required') +
        field('rx-business', 'Practice / business <small>(optional)</small>', 'text', S.business, 'autocomplete="organization" maxlength="100"') +
        '<div class="rx-field"><label for="rx-role">I am *</label><select id="rx-role" required>' +
        ['', 'An optical practice', 'A distributor', 'A lab / workshop', 'A wearer', 'Other'].map(function (r) { return '<option value="' + r + '"' + (S.role === r ? ' selected' : '') + '>' + (r || 'Select…') + '</option>'; }).join('') + '</select></div>' +
        '<div class="rx-field"><label for="rx-country">Country *</label><select id="rx-country" required>' +
        ['', 'Pakistan', 'United Kingdom', 'Other'].map(function (r) { return '<option value="' + r + '"' + (S.country === r ? ' selected' : '') + '>' + (r || 'Select…') + '</option>'; }).join('') + '</select></div>' +
        field('rx-email', 'Email <small>(email or phone required)</small>', 'email', S.email, 'autocomplete="email" maxlength="120"') +
        field('rx-phone', 'Phone / WhatsApp <small>(email or phone required)</small>', 'tel', S.phone, 'autocomplete="tel" maxlength="30"') +
        '</div>' +
        '<div class="rx-field"><label for="rx-msg">Anything else? <small>(optional)</small></label><textarea id="rx-msg" maxlength="600">' + esc(S.message) + '</textarea></div>';
      h += '<fieldset class="rx-opts" style="margin-top:18px"><legend>Send via</legend>' +
        opt('radio', 'channel', 'waPK', 'WhatsApp — Pakistan', '+92 313 4706005', S.channel === 'waPK') +
        opt('radio', 'channel', 'waUK', 'WhatsApp — UK', '+44 7460 024087', S.channel === 'waUK') +
        opt('radio', 'channel', 'email', 'Email', CONTACT.email, S.channel === 'email') + '</fieldset>';
      h += '<label class="rx-check"><input type="checkbox" id="rx-consent"' + (S.consent ? ' checked' : '') + '> <span>I understand that the details above are sent to NexVue to answer this enquiry, and that I should not include the wearer\'s name or other personal health information.</span></label>';
    }
    return h;
  }

  function field(id, label, type, val, attrs) {
    return '<div class="rx-field"><label for="' + id + '">' + label + '</label><input type="' + type + '" id="' + id + '" value="' + esc(val) + '" ' + (attrs || '') + '></div>';
  }

  function rxCols() {
    var c = [['sph', 'SPH'], ['cyl', 'CYL'], ['axis', 'Axis']];
    if (needsAdd()) c.push(['add', 'Add']);
    c.push(['pd', 'Mono PD']);
    if (needsHeight()) c.push(['height', 'Fitting height']);
    return c;
  }
  function rxTable() {
    var cols = rxCols();
    var ph = { sph: '−2.25', cyl: '−0.75', axis: '90', add: '+2.00', pd: '31.5', height: '18' };
    return '<div class="rx-table-wrap"><table class="rx-table"><caption class="rx-note" style="caption-side:bottom;padding:10px;text-align:left">SPH, CYL and Add in dioptres (0.25 steps). Axis 0–180°. Monocular PD and fitting height in mm.</caption><thead><tr><th scope="col">Eye</th>' +
      cols.map(function (c) { return '<th scope="col">' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      [['r', 'R'], ['l', 'L']].map(function (e) {
        return '<tr><th scope="row">' + e[1] + '</th>' + cols.map(function (c) {
          return '<td><input inputmode="decimal" data-eye="' + e[0] + '" data-k="' + c[0] + '" aria-label="' + (e[0] === 'r' ? 'Right' : 'Left') + ' ' + c[1] + '" value="' + esc(S.rx[e[0]][c[0]] || '') + '" placeholder="' + ph[c[0]] + '" maxlength="7"></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function productName(id) { var p = PRODUCTS.filter(function (x) { return x.id === id; })[0]; return p ? p.name : id; }
  function idxLabel() { return S.index ? INDEX[S.index] : ''; }
  function coatList() { return S.coats.map(function (c) { return COATS[c] + (c === 'tint' && S.tint ? ' (' + S.tint + ')' : ''); }); }
  function useList() { return S.uses.map(function (u) { return u === 'other' && S.useOther ? 'Other: ' + S.useOther : USES[u]; }); }
  function rxLines() {
    if (S.rxMode !== 'have') return [];
    var cols = rxCols();
    var out = [];
    ['r', 'l'].forEach(function (e) {
      var parts = cols.filter(function (c) { return String(S.rx[e][c[0]] || '').trim(); }).map(function (c) { return c[1] + ' ' + S.rx[e][c[0]]; });
      if (parts.length) out.push((e === 'r' ? 'R: ' : 'L: ') + parts.join(', '));
    });
    return out;
  }
  function reviewRows() {
    var rx = S.rxMode === 'have' ? (rxLines().join('<br>') || 'No values entered') : S.rxMode === 'later' ? 'Will be sent later' : S.rxMode === 'none' ? 'Not available yet' : '—';
    var fr = [S.frame, S.frameNotes].filter(Boolean).join(' · ');
    return [
      ['Lens type', S.cat ? esc(CATS[S.cat].name) : '—', 0],
      ['Intended use', S.uses.length ? esc(useList().join(', ')) : '—', 1],
      ['Material / index', S.index ? esc(idxLabel()) : '—', 2],
      ['Coatings', S.coats.length ? esc(coatList().join(', ')) : 'None selected', 3],
      ['Reference lens', S.product ? esc(productName(S.product)) : '—', 3],
      ['Prescription', S.rxMode === 'have' ? rx.split('<br>').map(esc).join('<br>') : esc(rx), 4],
      ['Frame / fitting notes', fr ? esc(fr) : '—', 4]
    ];
  }

  /* ---- validation */
  function num(v) { v = String(v || '').trim().replace(/^\+/, '').replace(/−/g, '-'); return v === '' ? null : (/^-?\d{1,2}(\.\d{1,2})?$/.test(v) ? parseFloat(v) : NaN); }
  function quarter(n) { return Math.abs(Math.round(n * 4) - n * 4) < 1e-6; }
  function validate(step) {
    var err = '';
    $$('[aria-invalid]', cfg).forEach(function (el) { el.removeAttribute('aria-invalid'); });
    function bad(el, msg) { if (el) el.setAttribute('aria-invalid', 'true'); if (!err) { err = msg; if (el && el.focus) el.focus(); } }
    if (step === 0 && !S.cat) err = 'Please choose a lens category to continue.';
    if (step === 1) {
      if (!S.uses.length) err = 'Please choose at least one intended use.';
      else if (S.uses.indexOf('other') !== -1 && !S.useOther.trim()) bad($('#rx-use-other'), 'Please describe the other requirement.');
    }
    if (step === 2 && !S.index) err = 'Please choose an index or "Not sure — please advise".';
    if (step === 4) {
      if (!S.rxMode) err = 'Please tell us whether prescription details are available.';
      else if (S.rxMode === 'have') {
        var any = false;
        ['r', 'l'].forEach(function (e) {
          rxCols().forEach(function (c) {
            var el = $('input[data-eye="' + e + '"][data-k="' + c[0] + '"]', cfg);
            var raw = S.rx[e][c[0]];
            if (raw == null || String(raw).trim() === '') return;
            any = true;
            var n = num(raw);
            var eye = e === 'r' ? 'Right' : 'Left';
            if (isNaN(n)) return bad(el, eye + ' ' + c[1] + ': please enter a number, e.g. ' + (c[0] === 'axis' ? '90' : '-1.25') + '.');
            if (c[0] === 'sph' && (n < -30 || n > 30 || !quarter(n))) bad(el, eye + ' SPH should be between −30.00 and +30.00 in 0.25 steps.');
            if (c[0] === 'cyl' && (n < -12 || n > 12 || !quarter(n))) bad(el, eye + ' CYL should be between −12.00 and +12.00 in 0.25 steps.');
            if (c[0] === 'axis' && (n < 0 || n > 180 || n % 1)) bad(el, eye + ' Axis should be a whole number from 0 to 180.');
            if (c[0] === 'add' && (n < 0.5 || n > 4 || !quarter(n))) bad(el, eye + ' Add should be between +0.50 and +4.00 in 0.25 steps.');
            if (c[0] === 'pd' && (n < 20 || n > 45)) bad(el, eye + ' monocular PD is usually between 20 and 45 mm — please check.');
            if (c[0] === 'height' && (n < 8 || n > 45)) bad(el, eye + ' fitting height should be between 8 and 45 mm — please check.');
          });
          var cyl = num(S.rx[e].cyl), ax = String(S.rx[e].axis || '').trim();
          if (cyl && !isNaN(cyl) && cyl !== 0 && !ax) bad($('input[data-eye="' + e + '"][data-k="axis"]', cfg), (e === 'r' ? 'Right' : 'Left') + ' eye: an axis is needed when CYL is entered.');
        });
        if (!any && !err) err = 'Enter at least one value, or choose "I will send them later".';
      }
    }
    if (step === 6) {
      if (!S.name.trim()) bad($('#rx-name'), 'Please enter your name.');
      if (!S.role) bad($('#rx-role'), 'Please tell us who you are.');
      if (!S.country) bad($('#rx-country'), 'Please choose your country.');
      var em = S.email.trim(), ph = S.phone.trim();
      if (!em && !ph) bad($('#rx-email'), 'Please give an email address or a phone number so NexVue can reply.');
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) bad($('#rx-email'), 'Please check the email address.');
      if (ph && !/^\+?[\d\s()-]{7,20}$/.test(ph)) bad($('#rx-phone'), 'Please check the phone number (digits, spaces and + only).');
      if (!S.channel) err = err || 'Please choose WhatsApp or email to send the enquiry.';
      if (!S.consent) bad($('#rx-consent'), 'Please confirm the privacy note to send the enquiry.');
    }
    var box = $('#rx-err');
    box.textContent = err;
    return !err;
  }

  /* ---- message */
  function message() {
    var L = [];
    L.push('NexVue RX enquiry — via nexvuelenses.uk/rx.html');
    L.push('');
    L.push('Lens type: ' + (S.cat ? CATS[S.cat].name : '-'));
    L.push('Intended use: ' + (useList().join(', ') || '-'));
    L.push('Material / index: ' + (idxLabel() || '-'));
    L.push('Coatings: ' + (coatList().join(', ') || 'None selected'));
    if (S.product) L.push('Reference lens: ' + productName(S.product));
    L.push('Prescription: ' + (S.rxMode === 'have' ? '' : S.rxMode === 'later' ? 'will be sent later' : 'not available yet'));
    rxLines().forEach(function (x) { L.push('  ' + x); });
    if (S.frame || S.frameNotes) L.push('Frame / fitting: ' + [S.frame, S.frameNotes].filter(Boolean).join(' · '));
    var fl = flags();
    if (fl.length) { L.push(''); L.push('To confirm:'); fl.forEach(function (x) { L.push('- ' + x); }); }
    L.push('');
    L.push('From: ' + S.name + (S.business ? ' — ' + S.business : ''));
    L.push('Role: ' + S.role + ' · Country: ' + S.country);
    if (S.email) L.push('Email: ' + S.email);
    if (S.phone) L.push('Phone: ' + S.phone);
    if (S.message.trim()) { L.push(''); L.push(S.message.trim()); }
    return L.join('\n');
  }
  function sendUrl() {
    var m = message();
    if (S.channel === 'email') {
      return 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('RX enquiry — ' + (S.cat ? CATS[S.cat].name : 'RX lens') + ' — ' + S.name) + '&body=' + encodeURIComponent(m);
    }
    var wa = S.channel === 'waUK' ? CONTACT.waUK.num : CONTACT.waPK.num;
    return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(m);
  }

  /* ---- summary + preview */
  var FIG_IDS = ['sv', 'prog', 'bif', 'office'];
  function renderSummary() {
    if (!sum) return;
    var z = S.cat ? CATS[S.cat].zones : 'sv';
    FIG_IDS.forEach(function (k) { $$('[data-fig="' + k + '"]', sum).forEach(function (el) { el.style.opacity = k === z ? '1' : '0'; }); });
    var tint = $('#rx-sum-tint', sum);
    if (tint) {
      var col = has('tint') ? ({ Grey: '#5d6570', Brown: '#7a5a3c', Green: '#4d6b52', Blue: '#3c5f8f', Silver: '#9aa5b1' }[S.tint] || '#6b6f76') : has('photo') ? '#6b7280' : null;
      tint.setAttribute('fill', col || '#ffffff');
      tint.style.opacity = col ? (has('photo') ? '.32' : '.45') : '0';
    }
    var glint = $('#rx-sum-ar', sum);
    if (glint) { glint.style.opacity = has('greenar') ? '.9' : has('ar') ? '.55' : '0'; glint.setAttribute('stroke', has('greenar') ? '#34c38f' : '#7c6cf2'); }
    var bl = $('#rx-sum-blue', sum);
    if (bl) bl.style.opacity = has('blue') ? '.35' : '0';
    function row(k, v) { var dd = $('[data-s="' + k + '"]', sum); if (!dd) return; dd.textContent = v || 'Not selected'; dd.classList.toggle('empty', !v); }
    row('cat', S.cat ? CATS[S.cat].name : '');
    row('use', useList().join(', '));
    row('idx', idxLabel());
    row('coat', coatList().join(', '));
    row('rx', S.rxMode === 'have' ? (rxLines().length ? 'Entered (' + rxLines().length + ' eye' + (rxLines().length > 1 ? 's' : '') + ')' : 'To enter') : S.rxMode === 'later' ? 'Send later' : S.rxMode === 'none' ? 'Not yet' : '');
    var m = bestMatch();
    var mt = $('#rx-sum-match', sum);
    if (mt) {
      var ref = S.product ? productName(S.product) : (m && S.coats.length && S.index ? m.name : '');
      mt.innerHTML = ref ? (S.product ? 'Reference lens: ' : 'Closest technology in the 2026 stock range, for reference: ') + '<strong>' + esc(ref) + '</strong>' : 'Make your selections to see the closest technology in the NexVue range.';
    }
    var fl = $('#rx-sum-flags', sum);
    if (fl) fl.innerHTML = flags().map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  }

  function renderProgress() {
    var n = STEP_NAMES.length;
    $('#rx-prog-fill').style.width = ((S.step) / (n - 1) * 100) + '%';
    $$('#rx-prog-steps li').forEach(function (li, i) {
      var b = $('button', li);
      li.className = i === S.step ? 'cur' : i < S.step || i <= maxStep ? 'done' : '';
      b.disabled = i > maxStep;
      if (i === S.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('#rx-prog-label').textContent = 'Step ' + (S.step + 1) + ' of ' + n + ': ' + STEP_NAMES[S.step];
  }

  var dir = 1;
  function render(focus) {
    var body = $('#rx-cfg-body');
    body.innerHTML = '<div class="rx-panel' + (dir < 0 ? ' back' : '') + '">' + panel(S.step) + '</div>';
    $('#rx-err').textContent = '';
    $('#rx-back').hidden = S.step === 0;
    var next = $('#rx-next');
    next.innerHTML = S.step === 6 ? 'Request an RX Quote <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
      : S.step === 5 ? 'Continue to enquiry <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
      : 'Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    next.disabled = false;
    renderProgress();
    renderSummary();
    if (focus) { var h = $('h3', body); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  function go(step) {
    dir = step >= S.step ? 1 : -1;
    S.step = step;
    if (step > maxStep) maxStep = step;
    render(true);
    var top = $('#configurator').getBoundingClientRect().top + window.scrollY - 80;
    if (cfg.getBoundingClientRect().top < 60) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---- events (delegated) */
  cfg.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'cat') { S.cat = t.value; }
    else if (t.name === 'use') {
      if (t.checked) S.uses.push(t.value); else S.uses = S.uses.filter(function (u) { return u !== t.value; });
      var w = $('#rx-use-other-wrap'); if (w) w.hidden = S.uses.indexOf('other') === -1;
    }
    else if (t.name === 'idx') { S.index = t.value; }
    else if (t.name === 'coat') {
      if (t.checked) S.coats.push(t.value); else S.coats = S.coats.filter(function (c) { return c !== t.value; });
      if (!has('tint')) S.tint = '';
      var keep = document.activeElement && document.activeElement.id;
      var body = $('#rx-cfg-body .rx-panel');
      body.innerHTML = panel(3);
      if (keep && $('#' + keep)) $('#' + keep).focus();
    }
    else if (t.id === 'rx-tint') { S.tint = t.value; }
    else if (t.name === 'rxmode') { S.rxMode = t.value; var rw = $('#rx-rx-wrap'); if (rw) rw.hidden = S.rxMode !== 'have'; }
    else if (t.id === 'rx-frame') { S.frame = t.value; }
    else if (t.id === 'rx-role') { S.role = t.value; }
    else if (t.id === 'rx-country') { S.country = t.value; }
    else if (t.name === 'channel') { S.channel = t.value; }
    else if (t.id === 'rx-consent') { S.consent = t.checked; }
    renderSummary();
  });
  cfg.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.eye) { S.rx[t.dataset.eye][t.dataset.k] = t.value; }
    var map = { 'rx-use-other': 'useOther', 'rx-fnotes': 'frameNotes', 'rx-name': 'name', 'rx-business': 'business', 'rx-email': 'email', 'rx-phone': 'phone', 'rx-msg': 'message' };
    if (map[t.id]) S[map[t.id]] = t.value;
    if (t.getAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
    renderSummary();
  });
  cfg.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (g) { go(+g.getAttribute('data-goto')); return; }
    if (e.target.closest('[data-act="clear-product"]')) { S.product = ''; $('#rx-cfg-body .rx-panel').innerHTML = panel(3); renderSummary(); }
  });
  $('#rx-back').addEventListener('click', function () { if (S.step > 0) go(S.step - 1); });
  $('#rx-next').addEventListener('click', function () {
    if (!validate(S.step)) return;
    if (S.step < 6) { go(S.step + 1); return; }
    submit();
  });
  $$('#rx-prog-steps button').forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (i > maxStep || i === S.step) return;
      if (i > S.step && !validate(S.step)) return;
      go(i);
    });
  });

  function submit() {
    var url = sendUrl();
    var next = $('#rx-next');
    next.disabled = true;
    next.innerHTML = '<span class="rx-spin" aria-hidden="true"></span> Opening ' + (S.channel === 'email' ? 'your email app' : 'WhatsApp') + '…';
    var opened = true;
    if (S.channel === 'email') { window.location.href = url; }
    else {
      // no 'noopener' feature string: with it window.open always returns null and a blocked pop-up can't be detected
      var w = window.open(url, '_blank');
      opened = !!w;
      if (w) { try { w.opener = null; } catch (err) { /* ignore */ } }
    }
    setTimeout(function () { success(url, opened); }, 700);
  }

  function success(url, opened) {
    var chan = S.channel === 'email' ? 'email' : 'WhatsApp';
    $('#rx-cfg-body').innerHTML = '<div class="rx-panel rx-success" role="status">' +
      '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#eaf3fd"/><path d="M20 33l8 8 16-17" fill="none" stroke="#1a6fd1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h3 tabindex="-1">Your enquiry is ready in ' + chan + '</h3>' +
      '<p>' + (opened ? (S.channel === 'email' ? 'Your email app should now show the enquiry addressed to ' + CONTACT.email + '.' : 'WhatsApp should have opened in a new tab with the enquiry filled in.') : 'Your browser blocked the new window.') +
      ' <strong>NexVue receives it once you press Send there.</strong></p>' +
      '<div class="rx-send" style="justify-content:center"><a class="rx-btn primary" href="' + esc(url) + '"' + (S.channel === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"') + '>Open ' + chan + ' again</a>' +
      '<button type="button" class="rx-btn ghost" id="rx-copy">Copy enquiry text</button></div>' +
      '<p class="rx-note" id="rx-copy-msg" aria-live="polite" style="margin-top:12px"></p>' +
      '<p style="margin-top:18px"><button type="button" class="rx-link" id="rx-restart">Start a new configuration</button></p></div>';
    $('#rx-nav').hidden = true;
    $('#rx-prog-fill').style.width = '100%';
    $('#rx-cfg-body h3').focus();
    $('#rx-copy').addEventListener('click', function () {
      var txt = message();
      var done = function () { $('#rx-copy-msg').textContent = 'Copied. Paste it into WhatsApp or an email to ' + CONTACT.email + '.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); });
      else { fallbackCopy(txt); done(); }
    });
    $('#rx-restart').addEventListener('click', function () {
      S.step = 0; maxStep = 0; S.cat = ''; S.uses = []; S.useOther = ''; S.index = ''; S.coats = ['uv']; S.tint = ''; S.product = '';
      S.rxMode = ''; S.rx = { r: {}, l: {} }; S.frame = ''; S.frameNotes = ''; S.message = ''; S.channel = ''; S.consent = false;
      $('#rx-nav').hidden = false; render(true);
    });
  }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }

  /* ---- entry points from elsewhere on the page */
  function startWith(o) {
    if (o.cat) S.cat = o.cat;
    if (o.product) {
      var p = PRODUCTS.filter(function (x) { return x.id === o.product; })[0];
      if (p) {
        S.product = p.id;
        S.coats = ['uv'];
        p.f.forEach(function (c) { if (COATS[c] && !has(c) && !coatBlock(c)) S.coats.push(c); });
        if (p.idx.length === 1) S.index = p.idx[0];
        if (p.f.indexOf('impact') !== -1) S.index = 'pc';
        if (!S.cat) S.cat = 'sv';
        if (p.use && S.uses.indexOf(p.use) === -1) S.uses.push(p.use);
      }
    }
    var target = 0;
    if (S.cat) target = 1;
    if (S.cat && S.uses.length) target = 2;
    if (target > maxStep) maxStep = target;
    S.step = target;
    dir = 1;
    render(false);
    var sec = $('#configurator');
    window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 70, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () { var h = $('#rx-cfg-body h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }, reduce ? 0 : 600);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cfg]');
    if (!a) return;
    e.preventDefault();
    var v = a.getAttribute('data-cfg');
    startWith(v.indexOf('p:') === 0 ? { product: v.slice(2) } : v ? { cat: v } : {});
  });

  render(false);

  /* ------------------------------------------------------------ dashboard RX products */
  (function () {
    var host = $('#rx-products'), sec = $('#rx-dyn');
    if (!host || !sec || !window.MutationObserver) return;
    new MutationObserver(function () { sec.hidden = !host.children.length; }).observe(host, { childList: true });
  })();
})();
