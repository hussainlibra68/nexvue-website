/* VERAFIL storefront — shared layout, cart, wishlist, search, page logic */
(function () {
  "use strict";
  var P = VF.products;
  var FREE_SHIP = 150, SHIP = 9;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); };

  /* safe storage */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var cart = store.get("vf_cart", []);
  var wish = store.get("vf_wish", []);
  var promo = store.get("vf_promo", "");
  function save() { store.set("vf_cart", cart); store.set("vf_wish", wish); store.set("vf_promo", promo); }

  /* ---------- icons ---------- */
  var I = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.1-8 11-8 11z"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"/></svg>',
    ret: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/></svg>'
  };

  /* ---------- layout ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  function nav(href, label, cur) { return '<li><a href="' + href + '"' + (cur ? ' aria-current="page"' : "") + ">" + label + "</a></li>"; }
  function mountLayout() {
    var cur = function (n) { return path === n || (n === "shop.html" && path === "product.html"); };
    var hdr = '<div class="announce">Free delivery over <b>$' + FREE_SHIP + '</b> · 30-day returns · Use code <b>VERAFIL10</b> for 10% off</div>' +
      '<header class="site-header"><div class="wrap nav-row">' +
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">' + I.menu + "</button>" +
      '<a class="logo" href="index.html" aria-label="VERAFIL home"><img src="assets/logo-dark.png" alt="VERAFIL" width="164" height="20"></a>' +
      '<nav class="main-nav" id="mainNav" aria-label="Main"><button class="icon-btn nav-close" id="navClose" aria-label="Close menu">' + I.close + "</button><ul>" +
      nav("index.html", "Home", cur("index.html")) + nav("shop.html", "Shop", cur("shop.html")) +
      nav("shop.html?cat=lighting", "Lighting") + nav("shop.html?cat=furniture", "Furniture") +
      nav("about.html", "Our Story", cur("about.html")) + nav("contact.html", "Contact", cur("contact.html")) +
      '</ul><div class="nav-foot">Free delivery over $' + FREE_SHIP + " · hello@verafil.com</div></nav>" +
      '<div class="nav-actions"><button class="icon-btn" id="searchBtn" aria-label="Search">' + I.search + "</button>" +
      '<button class="icon-btn" id="wishBtn" aria-label="Wishlist">' + I.heart + '<span class="badge" id="wishCount">0</span></button>' +
      '<button class="icon-btn" id="cartBtn" aria-label="Open cart">' + I.bag + '<span class="badge" id="cartCount">0</span></button></div>' +
      "</div></header>";
    var ftr = '<footer class="site-footer"><div class="wrap"><div class="foot-grid"><div>' +
      '<img src="assets/logo-white.png" alt="VERAFIL" width="180" height="22"><p>Considered home décor in warm, honest materials. Designed to be lived with.</p></div>' +
      '<div><h5>Shop</h5><ul><li><a href="shop.html">All products</a></li><li><a href="shop.html?cat=lighting">Lighting</a></li><li><a href="shop.html?cat=furniture">Furniture</a></li><li><a href="shop.html?cat=textiles">Rugs &amp; Textiles</a></li></ul></div>' +
      '<div><h5>Help</h5><ul><li><a href="contact.html">Contact us</a></li><li><a href="contact.html#faq">Delivery &amp; returns</a></li><li><a href="contact.html#faq">Care guide</a></li></ul></div>' +
      '<div><h5>Company</h5><ul><li><a href="about.html">Our story</a></li><li><a href="about.html#materials">Materials</a></li><li><a href="contact.html">Trade enquiries</a></li></ul></div>' +
      '</div><div class="foot-bottom"><span>© ' + new Date().getFullYear() + " VERAFIL. All rights reserved.</span><span>Secure checkout · Free returns within 30 days</span></div></div></footer>";
    var ui = '<div class="scrim" id="scrim"></div>' +
      '<aside class="drawer" id="drawer" aria-label="Shopping cart" aria-hidden="true"><div class="drawer-head"><h2>Your cart</h2><button class="icon-btn" id="drawerClose" aria-label="Close cart">' + I.close + "</button></div>" +
      '<div class="ship-bar" id="shipBar"></div><div class="drawer-body" id="drawerBody"></div><div class="drawer-foot" id="drawerFoot"></div></aside>' +
      '<div class="search" id="search" aria-hidden="true" role="dialog" aria-label="Search"><div class="search-in"><div class="search-top"><input id="searchInput" type="search" placeholder="Search lamps, rugs, chairs…" autocomplete="off" aria-label="Search products"><button class="icon-btn" id="searchClose" aria-label="Close search">' + I.close + '</button></div><div class="search-res" id="searchRes"></div></div></div>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>';
    document.body.insertAdjacentHTML("afterbegin", hdr);
    document.body.insertAdjacentHTML("beforeend", ftr + ui);
  }

  /* ---------- toast ---------- */
  var tT;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(tT); tT = setTimeout(function () { t.classList.remove("on"); }, 2400); }

  /* ---------- cart ---------- */
  function lineKey(l) { return l.id + "|" + l.color; }
  function addToCart(id, color, qty) {
    var p = VF.byId(id); if (!p) return;
    color = color || p.swatches[0][0]; qty = qty || 1;
    var ex = cart.filter(function (l) { return lineKey(l) === id + "|" + color; })[0];
    if (ex) ex.qty = Math.min(20, ex.qty + qty); else cart.push({ id: id, color: color, qty: qty });
    save(); renderCart(); openDrawer();
  }
  function setQty(key, q) {
    cart = cart.map(function (l) { if (lineKey(l) === key) l.qty = q; return l; }).filter(function (l) { return l.qty > 0; });
    save(); renderCart(); if (VF.onCart) VF.onCart();
  }
  function colorHex(p, name) { var s = p.swatches.filter(function (x) { return x[0] === name; })[0]; return s ? s[1] : p.swatches[0][1]; }
  function totals() {
    var sub = cart.reduce(function (a, l) { var p = VF.byId(l.id); return a + (p ? p.price * l.qty : 0); }, 0);
    var disc = promo === "VERAFIL10" ? sub * 0.1 : 0;
    var after = sub - disc;
    var ship = !cart.length ? 0 : (after >= FREE_SHIP ? 0 : SHIP);
    return { sub: sub, disc: disc, ship: ship, total: after + ship, after: after, count: cart.reduce(function (a, l) { return a + l.qty; }, 0) };
  }
  function lineHTML(l, mini) {
    var p = VF.byId(l.id); if (!p) return "";
    var k = lineKey(l);
    return '<div class="line' + (mini ? " mini" : "") + '"><a class="thumb" href="product.html?id=' + p.id + '">' + VF.art(p, colorHex(p, l.color)) + "</a><div><h4>" + p.name + "</h4><small>" + l.color + (mini ? " · Qty " + l.qty : "") + "</small>" +
      (mini ? "" : '<div class="qty"><button aria-label="Decrease quantity" data-q="' + k + '" data-d="-1">−</button><output>' + l.qty + '</output><button aria-label="Increase quantity" data-q="' + k + '" data-d="1">+</button></div>') +
      '</div><div style="display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end"><span class="lp">' + money(p.price * l.qty) + "</span>" +
      (mini ? "" : '<button class="rm" data-rm="' + k + '">Remove</button>') + "</div></div>";
  }
  function renderCart() {
    var t = totals();
    var cc = $("#cartCount"); cc.textContent = t.count; cc.classList.toggle("on", t.count > 0);
    var wc = $("#wishCount"); wc.textContent = wish.length; wc.classList.toggle("on", wish.length > 0);
    var left = Math.max(0, FREE_SHIP - t.after);
    $("#shipBar").innerHTML = left > 0 ? "Add <b>" + money(left) + '</b> more for free delivery<div class="track"><i style="width:' + Math.min(100, t.after / FREE_SHIP * 100) + '%"></i></div>' : '🎉 You\'ve unlocked <b>free delivery</b><div class="track"><i style="width:100%"></i></div>';
    $("#drawerBody").innerHTML = cart.length ? cart.map(function (l) { return lineHTML(l); }).join("") : '<div class="drawer-empty"><p class="serif">Your cart is empty</p><p>Find something warm for your home.</p><a class="btn btn-primary" href="shop.html">Start shopping</a></div>';
    $("#drawerFoot").style.display = cart.length ? "" : "none";
    $("#drawerFoot").innerHTML = '<div class="sub"><span>Subtotal</span><span>' + money(t.sub) + "</span></div><small>" + (t.disc ? "Code VERAFIL10 applied at checkout. " : "") + 'Shipping &amp; discounts calculated at checkout.</small><a class="btn btn-rust btn-block arrow" href="checkout.html">Checkout&nbsp;</a>';
  }
  var lastFocus;
  function openDrawer() { lastFocus = document.activeElement; $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on"); document.body.style.overflow = "hidden"; $("#drawerClose").focus(); }
  function closeAll() {
    ["#drawer", "#search"].forEach(function (s) { $(s).classList.remove("on"); $(s).setAttribute("aria-hidden", "true"); });
    $("#scrim").classList.remove("on"); document.body.style.overflow = "";
    $("#mainNav").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    var i = wish.indexOf(id); if (i > -1) { wish.splice(i, 1); toast("Removed from wishlist"); } else { wish.push(id); toast("Saved to wishlist"); }
    save(); renderCart();
    $$('.wish[data-wish="' + id + '"]').forEach(function (b) { b.setAttribute("aria-pressed", wish.indexOf(id) > -1); });
  }

  /* ---------- product card ---------- */
  function card(p, i) {
    var dots = p.swatches.map(function (s) { return '<i style="background:' + s[1] + '" title="' + s[0] + '"></i>'; }).join("");
    return '<article class="card" style="animation-delay:' + Math.min(i || 0, 12) * 45 + 'ms">' +
      '<div class="media"><a href="product.html?id=' + p.id + '" aria-label="' + p.name + '">' + VF.art(p) + "</a>" + (p.tag ? '<span class="tag">' + p.tag + "</span>" : "") +
      '<button class="wish" data-wish="' + p.id + '" aria-pressed="' + (wish.indexOf(p.id) > -1) + '" aria-label="Save ' + p.name + ' to wishlist">' + I.heart + "</button>" +
      '<button class="quick" data-add="' + p.id + '">Quick add — ' + money(p.price) + "</button></div>" +
      '<div class="meta"><h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3><span class="price">' + money(p.price) + '</span><span class="mat">' + p.material + '</span><span class="dots">' + dots + "</span></div></article>";
  }
  function fillGrid(el, list) { el.innerHTML = list.length ? list.map(card).join("") : '<div class="empty"><p class="serif" style="font-size:1.6rem;color:var(--ink)">Nothing found</p><p>Try another category or search term.</p></div>'; }

  /* ---------- search ---------- */
  function runSearch(q) {
    q = q.trim().toLowerCase();
    var res = !q ? P.slice(0, 5) : P.filter(function (p) { return (p.name + " " + p.cat + " " + p.material + " " + p.desc).toLowerCase().indexOf(q) > -1; });
    $("#searchRes").innerHTML = res.length ? res.map(function (p) { return '<a class="sr-item" href="product.html?id=' + p.id + '"><span class="thumb">' + VF.art(p) + "</span><span><b>" + p.name + "</b><small>" + p.material + "</small></span><b>" + money(p.price) + "</b></a>"; }).join("") : '<p style="color:var(--ink-soft);padding:20px 8px">No results for “' + q.replace(/</g, "&lt;") + "”.</p>";
  }

  /* ---------- global events ---------- */
  function bind() {
    $("#cartBtn").onclick = openDrawer;
    $("#drawerClose").onclick = closeAll;
    $("#scrim").onclick = closeAll;
    $("#menuBtn").onclick = function () { $("#mainNav").classList.add("open"); this.setAttribute("aria-expanded", "true"); };
    $("#navClose").onclick = closeAll;
    $("#wishBtn").onclick = function () { location.href = "shop.html?wish=1"; };
    $("#searchBtn").onclick = function () { lastFocus = this; $("#search").classList.add("on"); $("#search").setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; runSearch(""); setTimeout(function () { $("#searchInput").focus(); }, 300); };
    $("#searchClose").onclick = closeAll;
    $("#searchInput").oninput = function () { runSearch(this.value); };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-add],[data-wish],[data-q],[data-rm]"); if (!t) return;
      if (t.dataset.add) { e.preventDefault(); addToCart(t.dataset.add); }
      else if (t.dataset.wish) { e.preventDefault(); toggleWish(t.dataset.wish); if (VF.onWish) VF.onWish(); }
      else if (t.dataset.q) { var l = cart.filter(function (x) { return lineKey(x) === t.dataset.q; })[0]; if (l) setQty(t.dataset.q, l.qty + (+t.dataset.d)); }
      else if (t.dataset.rm) setQty(t.dataset.rm, 0);
    });
    $$("#mainNav a").forEach(function (a) { a.addEventListener("click", closeAll); });
  }

  /* ---------- pages ---------- */
  var pages = {
    home: function () {
      fillGrid($("#homeGrid"), P.filter(function (p) { return p.cat === "lighting" || p.cat === "furniture" || p.cat === "textiles"; }).slice(0, 8));
      var chips = $$("#homeChips .chip");
      chips.forEach(function (c) {
        c.onclick = function () {
          chips.forEach(function (x) { x.classList.remove("on"); }); c.classList.add("on");
          var cat = c.dataset.cat;
          fillGrid($("#homeGrid"), (cat === "all" ? P : P.filter(function (p) { return p.cat === cat; })).slice(0, 8));
        };
      });
      $("#heroArt").innerHTML = VF.art(VF.byId("eames-lounge-chair"));
      $("#heroThumb").innerHTML = VF.art(VF.byId("arco-floor-lamp"));
      $$(".cat .bgart").forEach(function (el) { el.innerHTML = VF.art(VF.byId(el.dataset.p)); });
      $("#splitArt").innerHTML = VF.art(VF.byId("ice-stone-glass"));
      $("#newsForm").onsubmit = function (e) { e.preventDefault(); $("#newsOk").textContent = "Thank you — welcome to the VERAFIL list. Check your inbox for 10% off."; this.reset(); };
    },
    shop: function () {
      var q = new URLSearchParams(location.search);
      var state = { cat: q.get("cat") || "all", sort: "featured", wish: q.get("wish") === "1", term: (q.get("q") || "").toLowerCase() };
      var chipsEl = $("#shopChips");
      chipsEl.innerHTML = '<button class="chip" data-cat="all">All</button>' + VF.categories.map(function (c) { return '<button class="chip" data-cat="' + c.id + '">' + c.name + "</button>"; }).join("");
      function render() {
        $$(".chip", chipsEl).forEach(function (c) { c.classList.toggle("on", !state.wish && c.dataset.cat === state.cat); });
        var list = P.filter(function (p) { return state.wish ? wish.indexOf(p.id) > -1 : (state.cat === "all" || p.cat === state.cat); });
        if (state.term) list = list.filter(function (p) { return (p.name + p.material + p.cat).toLowerCase().indexOf(state.term) > -1; });
        var s = state.sort;
        list = list.slice().sort(function (a, b) { return s === "low" ? a.price - b.price : s === "high" ? b.price - a.price : s === "rating" ? b.rating - a.rating : 0; });
        var cat = VF.categories.filter(function (c) { return c.id === state.cat; })[0];
        $("#shopTitle").textContent = state.wish ? "Your wishlist" : cat ? cat.name : "All products";
        $("#shopCount").textContent = list.length + (list.length === 1 ? " product" : " products");
        fillGrid($("#shopGrid"), list);
        if (state.wish && !list.length) $("#shopGrid").innerHTML = '<div class="empty"><p class="serif" style="font-size:1.6rem;color:var(--ink)">No saved items yet</p><p>Tap the heart on any product to save it here.</p></div>';
      }
      chipsEl.onclick = function (e) { var b = e.target.closest(".chip"); if (!b) return; state.cat = b.dataset.cat; state.wish = false; history.replaceState(null, "", state.cat === "all" ? "shop.html" : "shop.html?cat=" + state.cat); render(); };
      $("#sort").onchange = function () { state.sort = this.value; render(); };
      VF.onWish = function () { if (state.wish) render(); };
      render();
    },
    product: function () {
      var id = new URLSearchParams(location.search).get("id");
      var p = VF.byId(id);
      if (!p) { $("#pdpRoot").innerHTML = '<div class="empty"><p class="serif" style="font-size:1.8rem;color:var(--ink)">Product not found</p><a class="btn btn-primary" href="shop.html">Back to shop</a></div>'; return; }
      document.title = p.name + " — VERAFIL";
      var cat = VF.categories.filter(function (c) { return c.id === p.cat; })[0];
      var sel = p.swatches[0], qty = 1, view = 0;
      var views = [{ z: 1, o: "50% 50%" }, { z: 1.8, o: "35% 35%" }, { z: 2.2, o: "65% 75%" }, { z: 1.4, o: "50% 100%" }];
      var stars = "★★★★★".slice(0, Math.round(p.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(p.rating));
      $("#pdpRoot").innerHTML = '<div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html?cat=' + p.cat + '">' + cat.name + "</a> / " + p.name + "</div>" +
        '<div class="pdp"><div class="gallery"><div class="thumbs" id="thumbs"></div><div class="main-img" id="mainImg" style="overflow:hidden"></div></div>' +
        '<div class="pdp-info"><span class="eyebrow" style="color:var(--rust)">' + cat.name + "</span><h1>" + p.name + '</h1><div class="price-lg">' + money(p.price) + '</div><div class="rate"><span class="stars">' + stars + "</span>" + p.rating + " · " + p.reviews + " reviews</div>" +
        "<p>" + p.desc + '</p><div class="opt-label">Colour <span id="swName">' + sel[0] + '</span></div><div class="swatches" role="radiogroup" aria-label="Colour" id="sws"></div>' +
        '<div class="buy-row"><div class="qty"><button aria-label="Decrease" id="qm">−</button><output id="qv">1</output><button aria-label="Increase" id="qp">+</button></div><button class="btn btn-rust arrow" id="addBtn">Add to cart&nbsp;</button></div>' +
        '<button class="btn btn-ghost btn-block" data-wish="' + p.id + '" aria-pressed="' + (wish.indexOf(p.id) > -1) + '" id="wishLg">♡ Save to wishlist</button>' +
        '<div class="perks"><div>' + I.truck + "Free delivery over $" + FREE_SHIP + " · ships in 2–4 days</div><div>" + I.ret + "30-day free returns</div><div>" + I.leaf + "Responsibly sourced " + p.material.toLowerCase() + "</div></div>" +
        '<details open><summary>Details &amp; specifications</summary><ul>' + p.specs.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul></details>" +
        "<details><summary>Delivery &amp; returns</summary><p>Standard delivery is $" + SHIP + " (free over $" + FREE_SHIP + "), arriving in 2–4 working days. Not in love? Return within 30 days for a full refund.</p></details>" +
        "<details><summary>Care</summary><p>Wipe with a soft, dry cloth. Keep out of prolonged direct sunlight. Natural materials vary slightly piece to piece — that is part of their charm.</p></details></div></div>" +
        '<section class="section" style="padding-top:20px"><div class="section-head"><h2>You may also like</h2><a class="link-u" href="shop.html">View all</a></div><div class="grid" id="related"></div></section>' +
        '<div class="sticky-buy" id="sticky"><b>' + money(p.price) + '</b><button class="btn btn-rust" id="addBtn2">Add to cart</button></div>';
      function paint() {
        var v = views[view], svg = VF.art(p, sel[1]);
        $("#mainImg").innerHTML = '<div style="width:100%;height:100%;transform:scale(' + v.z + ');transform-origin:' + v.o + ';transition:transform .5s">' + svg + "</div>";
        $("#thumbs").innerHTML = views.map(function (x, i) { return '<button class="' + (i === view ? "on" : "") + '" data-v="' + i + '" aria-label="View ' + (i + 1) + '"><div style="width:100%;height:100%;transform:scale(' + x.z + ");transform-origin:" + x.o + '">' + svg + "</div></button>"; }).join("");
        $("#sws").innerHTML = p.swatches.map(function (s) { return '<button class="sw" role="radio" aria-checked="' + (s[0] === sel[0]) + '" data-sw="' + s[0] + '" style="background:' + s[1] + '" aria-label="' + s[0] + '"></button>'; }).join("");
        $("#swName").textContent = sel[0];
      }
      paint();
      $("#pdpRoot").addEventListener("click", function (e) {
        var sw = e.target.closest("[data-sw]"), th = e.target.closest("[data-v]");
        if (sw) { sel = p.swatches.filter(function (s) { return s[0] === sw.dataset.sw; })[0]; paint(); }
        if (th) { view = +th.dataset.v; paint(); }
      });
      $("#qm").onclick = function () { qty = Math.max(1, qty - 1); $("#qv").textContent = qty; };
      $("#qp").onclick = function () { qty = Math.min(20, qty + 1); $("#qv").textContent = qty; };
      $("#addBtn").onclick = $("#addBtn2").onclick = function () { addToCart(p.id, sel[0], qty); };
      fillGrid($("#related"), P.filter(function (x) { return x.id !== p.id && x.cat === p.cat; }).concat(P.filter(function (x) { return x.id !== p.id && x.cat !== p.cat; })).slice(0, 4));
      var io = new IntersectionObserver(function (en) { $("#sticky").classList.toggle("on", !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { threshold: 0 });
      io.observe($("#addBtn"));
    },
    checkout: function () {
      var root = $("#coRoot");
      function summary() {
        var t = totals();
        return '<div class="summary"><h2>Order summary</h2>' + cart.map(function (l) { return lineHTML(l, true); }).join("") +
          '<div class="promo"><input id="promoIn" placeholder="Discount code" aria-label="Discount code" value="' + promo + '"><button type="button" class="btn btn-ghost" id="promoBtn">Apply</button></div>' +
          '<div class="sum-row"><span>Subtotal</span><span>' + money(t.sub) + "</span></div>" +
          (t.disc ? '<div class="sum-row"><span>Discount (VERAFIL10)</span><span>−' + money(t.disc) + "</span></div>" : "") +
          '<div class="sum-row"><span>Shipping</span><span>' + (t.ship ? money(t.ship) : "Free") + '</span></div><div class="sum-row total"><span>Total</span><span>' + money(t.total) + "</span></div></div>";
      }
      function render() {
        if (!cart.length) { root.innerHTML = '<div class="empty" style="padding:90px 0"><p class="serif" style="font-size:2rem;color:var(--ink)">Your cart is empty</p><p>Add a few things you love, then come back to check out.</p><a class="btn btn-primary" href="shop.html">Continue shopping</a></div>'; return; }
        var scroll = window.scrollY;
        root.innerHTML = '<form class="co" id="coForm" novalidate><div>' +
          '<fieldset><legend>Contact</legend><div class="fgrid"><div class="field full"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email"></div></div></fieldset>' +
          '<fieldset><legend>Delivery</legend><div class="fgrid"><div class="field"><label for="fn">First name</label><input id="fn" required autocomplete="given-name"></div><div class="field"><label for="ln">Last name</label><input id="ln" required autocomplete="family-name"></div>' +
          '<div class="field full"><label for="ad">Address</label><input id="ad" required autocomplete="street-address"></div><div class="field"><label for="ct">City</label><input id="ct" required autocomplete="address-level2"></div><div class="field"><label for="zp">Postcode</label><input id="zp" required autocomplete="postal-code"></div>' +
          '<div class="field full"><label for="cy">Country</label><select id="cy" autocomplete="country-name"><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>United Arab Emirates</option><option>Pakistan</option></select></div></div></fieldset>' +
          '<fieldset><legend>Payment</legend><label class="radio"><input type="radio" name="pay" value="card" checked><span>Credit / debit card</span><span>💳</span></label>' +
          '<div class="fgrid" id="cardF" style="margin-bottom:10px"><div class="field full"><label for="cn">Card number</label><input id="cn" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="19" required></div><div class="field"><label for="ce">Expiry</label><input id="ce" placeholder="MM / YY" autocomplete="cc-exp" maxlength="7" required></div><div class="field"><label for="cv">CVC</label><input id="cv" inputmode="numeric" autocomplete="cc-csc" maxlength="4" required></div></div>' +
          '<label class="radio"><input type="radio" name="pay" value="cod"><span>Cash on delivery</span><span>💵</span></label>' +
          '<p style="font-size:.82rem;color:var(--ink-soft);margin-top:10px">Demo store — no payment is processed and no card data leaves your browser.</p></fieldset>' +
          '<button class="btn btn-rust btn-block" type="submit" style="padding:1.15em">Place order · ' + money(totals().total) + "</button></div>" + summary() + "</form>";
        window.scrollTo(0, scroll);
        $("#promoBtn").onclick = function () {
          var v = $("#promoIn").value.trim().toUpperCase();
          if (v === "VERAFIL10") { promo = v; save(); toast("10% discount applied"); } else if (!v) { promo = ""; save(); } else toast("Code not recognised");
          render();
        };
        $$("input[name=pay]").forEach(function (r) { r.onchange = function () { var card = r.value === "card" && r.checked; $("#cardF").style.display = card ? "" : "none"; $$("#cardF input").forEach(function (i) { i.required = card; }); }; });
        $("#cn").oninput = function () { this.value = this.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); };
        $("#ce").oninput = function () { var d = this.value.replace(/\D/g, "").slice(0, 4); this.value = d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d; };
        $("#coForm").onsubmit = function (e) {
          e.preventDefault();
          var bad = $$("#coForm input[required]").filter(function (i) { return i.offsetParent && !i.checkValidity(); })[0];
          if (bad) { bad.focus(); toast("Please complete: " + bad.previousElementSibling.textContent); return; }
          var no = "VF-" + Math.random().toString(36).slice(2, 8).toUpperCase(), t = totals(), em = $("#em").value;
          cart = []; promo = ""; save(); renderCart();
          root.innerHTML = '<div class="done"><div class="check">✓</div><h1>Thank you for your order</h1><p style="color:var(--ink-soft)">Order <b>' + no + "</b> is confirmed — a receipt for " + money(t.total) + " is on its way to " + em.replace(/</g, "&lt;") + '.</p><a class="btn btn-primary" href="shop.html">Keep shopping</a></div>';
          window.scrollTo(0, 0);
        };
      }
      VF.onCart = render; render();
    },
    contact: function () {
      $("#contactForm").onsubmit = function (e) { e.preventDefault(); $("#contactOk").textContent = "Thanks — we'll reply within one working day."; this.reset(); };
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    mountLayout(); bind(); renderCart();
    var pg = document.body.dataset.page; if (pages[pg]) pages[pg]();
  });
  VF.addToCart = addToCart;
})();
