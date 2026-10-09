/* VERAFIL — product catalogue + vector product art (no external images needed) */
window.VF = window.VF || {};

VF.categories = [
  { id: "lighting", name: "Lighting", blurb: "Glow, softly" },
  { id: "furniture", name: "Furniture", blurb: "Built to be lived in" },
  { id: "textiles", name: "Rugs & Textiles", blurb: "Underfoot, wrapped" },
  { id: "wall", name: "Wall & Art", blurb: "Quiet statements" },
  { id: "accents", name: "Accents", blurb: "The small things" }
];

/* swatches: [name, hex] — first is default */
VF.products = [
  { id: "arco-floor-lamp", name: "Arco Floor Lamp", cat: "lighting", price: 125, material: "Marble & Stainless Steel",
    art: "arco", bg: "#E9DFD0", tag: "Bestseller", rating: 4.8, reviews: 126,
    desc: "A sweeping arc of brushed steel anchored by a solid marble base. It throws warm light over a sofa or dining table without a ceiling fixture.",
    swatches: [["Brushed Steel", "#B9B4AC"], ["Antique Brass", "#B88A44"], ["Matte Black", "#2B2420"]],
    specs: ["Height 190 cm, reach 160 cm", "Carrara marble base, 14 kg", "E27 socket, bulb not included", "Inline dimmer switch"] },
  { id: "reclaimed-wood-stool", name: "Reclaimed Wood Stool", cat: "furniture", price: 75, material: "Marble & Stained Oak",
    art: "stool", bg: "#D9C3A5", tag: "New", rating: 4.7, reviews: 58,
    desc: "Hand-turned from reclaimed oak beams, each stool carries its own grain and history. Use it as a perch, a side table or a plant stand.",
    swatches: [["Natural Oak", "#A9733F"], ["Smoked Oak", "#4E3422"], ["Honey", "#C98F4A"]],
    specs: ["Height 46 cm, seat 32 cm", "Reclaimed oak, oil finish", "Supports up to 120 kg", "Felt-capped feet"] },
  { id: "eco-candle-holder", name: "Eco Candle Holder", cat: "accents", price: 15, material: "Recycled Stainless Steel",
    art: "candle", bg: "#E8E2DA", tag: "", rating: 4.6, reviews: 214,
    desc: "A tiny sculpture for your table. Two cupped arms cradle a taper or tealight, cast from 100% recycled stainless steel.",
    swatches: [["Copper", "#B4642F"], ["Steel", "#B7B3AE"], ["Gold", "#C79B3B"]],
    specs: ["Height 18 cm", "Fits standard taper & tealight", "100% recycled steel", "Wipe clean"] },
  { id: "organic-cotton-rug", name: "Organic Cotton Rug", cat: "textiles", price: 40, material: "Wool & Cashmere Blend",
    art: "rug", bg: "#DCCBB3", tag: "", rating: 4.9, reviews: 342,
    desc: "Hand-knotted fringe, a soft hand and a dusty earth tone that works with every floor. Rolled, boxed and delivered to your door.",
    swatches: [["Sand", "#D8C3A0"], ["Rust", "#A9522A"], ["Cocoa", "#6B4430"]],
    specs: ["120 x 180 cm", "Organic cotton & wool blend", "Hand-knotted fringe", "Non-slip backing included"] },
  { id: "recycled-paper-print", name: "Recycled Paper Print", cat: "wall", price: 86, material: "Sustainable Board",
    art: "print", bg: "#E4DACB", tag: "Limited", rating: 4.5, reviews: 41,
    desc: "A limited-run botanical-abstract print on 100% recycled cotton rag paper, signed and numbered. Frame sold separately.",
    swatches: [["Teal", "#2E5560"], ["Ochre", "#C48A2C"], ["Clay", "#A9522A"]],
    specs: ["50 x 70 cm", "Edition of 150", "Archival pigment inks", "Ships flat in a tube"] },
  { id: "eames-lounge-chair", name: "Eames Lounge Chair", cat: "furniture", price: 245, material: "Leather & Walnut",
    art: "chair", bg: "#D7C7B6", tag: "Bestseller", rating: 4.9, reviews: 89,
    desc: "Full-grain leather over a moulded walnut shell. Deep, low and endlessly comfortable — the chair you will fight over.",
    swatches: [["Tan Leather", "#B35A25"], ["Espresso", "#3A2417"], ["Cream", "#D9CBB4"]],
    specs: ["W 84 x D 80 x H 78 cm", "Full-grain aniline leather", "Solid walnut frame", "10-year frame warranty"] },
  { id: "ice-stone-glass", name: "Ice Stone Glass Lamp", cat: "lighting", price: 98, material: "Opalescent Glass & Walnut",
    art: "icelamp", bg: "#B7BCC4", tag: "New", rating: 4.8, reviews: 33,
    desc: "Delicate string lights with opalescent bulbs, set inside a faceted stone-glass shade on a turned walnut base.",
    swatches: [["Amber", "#E7B35C"], ["Smoke", "#9C9890"], ["Clear", "#E7ECEE"]],
    specs: ["Height 32 cm", "Hand-blown glass shade", "Walnut base, oil finish", "Warm 2200K bulb included"] },
  { id: "arch-wall-mirror", name: "Arch Wall Sticker", cat: "wall", price: 32, material: "Matte Vinyl",
    art: "arch", bg: "#EADFD1", tag: "", rating: 4.4, reviews: 77,
    desc: "A simple, stylish way to add depth and elegance to your walls. Peel, stick and reposition — leaves no residue.",
    swatches: [["Blush", "#D9A58F"], ["Sage", "#9DAA8A"], ["Terracotta", "#BC5B33"]],
    specs: ["60 x 90 cm", "Removable matte vinyl", "Fits painted & tiled walls", "Set of 3 shapes"] },
  { id: "stoneware-vase", name: "Stoneware Vase", cat: "accents", price: 54, material: "Glazed Stoneware",
    art: "vase", bg: "#E5D5C0", tag: "", rating: 4.7, reviews: 102,
    desc: "Thrown by hand and glazed in a reactive ochre that pools differently on every piece. Waterproof inside.",
    swatches: [["Ochre", "#C48A3C"], ["Bone", "#E6DCCB"], ["Umber", "#5C3A26"]],
    specs: ["Height 28 cm", "Hand-thrown stoneware", "Waterproof glaze", "Dishwasher safe"] },
  { id: "linen-cushion", name: "Linen Cushion", cat: "textiles", price: 28, material: "Stonewashed Linen",
    art: "cushion", bg: "#DDCDB8", tag: "", rating: 4.6, reviews: 164,
    desc: "Stonewashed European linen with a relaxed, lived-in hand. Hidden zip, feather insert included.",
    swatches: [["Rust", "#B15628"], ["Oat", "#D9CDB7"], ["Olive", "#7D7A4A"]],
    specs: ["50 x 50 cm", "100% European linen", "Feather & down insert", "Machine washable cover"] },
  { id: "walnut-side-table", name: "Walnut Side Table", cat: "furniture", price: 160, material: "Solid Walnut",
    art: "table", bg: "#D8CAB8", tag: "", rating: 4.8, reviews: 47,
    desc: "A round, quietly confident side table with tapered legs and a wide top big enough for a lamp, a book and a cup.",
    swatches: [["Walnut", "#5A3A26"], ["Oak", "#B58550"], ["Ash", "#CDB89A"]],
    specs: ["Ø 48 x H 52 cm", "Solid walnut, oil finish", "Tool-free assembly", "Felt-capped feet"] },
  { id: "brass-pendant", name: "Brass Dome Pendant", cat: "lighting", price: 112, material: "Spun Brass",
    art: "pendant", bg: "#E1D3C0", tag: "New", rating: 4.7, reviews: 29,
    desc: "A spun brass dome that casts a pool of warm light over a table or kitchen island. Develops a patina with age.",
    swatches: [["Brass", "#C0924A"], ["Copper", "#B0603A"], ["Black", "#2B2420"]],
    specs: ["Ø 35 cm, drop adjustable", "Spun brass shade", "E27 socket, 2 m cable", "Ceiling rose included"] }
];

VF.byId = function (id) { return VF.products.find(function (p) { return p.id === id; }); };

/* ---------- vector product art ---------- */
(function () {
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) * amt : v * amt)))); }
    return "#" + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  VF.shade = shade;

  var floorY = 400;
  var uid = 0;
  function stage(bg, inner) {
    var k = ++uid;
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">' +
      '<defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + shade(bg, -0.1) + '"/><stop offset="1" stop-color="' + shade(bg, -0.22) + '"/></linearGradient>' +
      '<linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="400" height="500" fill="' + bg + '"/>' +
      '<rect y="' + floorY + '" width="400" height="100" fill="url(#fl)"/>' +
      '<path d="M250 0h90L150 500H60z" fill="url(#sun)" opacity=".55"/>' +
      inner + '</svg>').replace(/id="fl"/g, 'id="fl' + k + '"').replace(/id="sun"/g, 'id="sun' + k + '"').replace(/url\(#fl\)/g, 'url(#fl' + k + ')').replace(/url\(#sun\)/g, 'url(#sun' + k + ')');
  }
  function shadow(cx, w) { return '<ellipse cx="' + cx + '" cy="' + (floorY + 6) + '" rx="' + w + '" ry="' + (w / 7) + '" fill="#2a1a10" opacity=".22"/>'; }

  var A = {
    arco: function (c, bg) {
      return shadow(130, 70) +
        '<rect x="80" y="372" width="100" height="30" rx="4" fill="#EDE8E0"/><rect x="80" y="372" width="100" height="8" fill="#fff" opacity=".5"/>' +
        '<path d="M130 372 C128 120 150 70 250 80" fill="none" stroke="' + c + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M232 84 q38 -10 62 26 l-70 4z" fill="' + shade(c, -0.15) + '"/>' +
        '<ellipse cx="262" cy="116" rx="28" ry="6" fill="#FFE7A8" opacity=".9"/>' +
        '<path d="M232 120 L120 400 L360 400z" fill="#FFE6A0" opacity=".13"/>';
    },
    stool: function (c) {
      return shadow(200, 95) +
        '<path d="M130 215 L108 396" stroke="' + shade(c, -0.25) + '" stroke-width="16" stroke-linecap="round"/>' +
        '<path d="M270 215 L292 396" stroke="' + shade(c, -0.25) + '" stroke-width="16" stroke-linecap="round"/>' +
        '<path d="M200 215 L200 398" stroke="' + shade(c, -0.1) + '" stroke-width="16" stroke-linecap="round"/>' +
        '<path d="M124 300 H276" stroke="' + shade(c, -0.3) + '" stroke-width="9"/>' +
        '<ellipse cx="200" cy="205" rx="112" ry="24" fill="' + shade(c, -0.3) + '"/>' +
        '<ellipse cx="200" cy="195" rx="112" ry="24" fill="' + c + '"/>' +
        '<ellipse cx="200" cy="195" rx="86" ry="16" fill="none" stroke="' + shade(c, -0.25) + '" stroke-width="2" opacity=".6"/>' +
        '<ellipse cx="200" cy="195" rx="52" ry="9" fill="none" stroke="' + shade(c, -0.25) + '" stroke-width="2" opacity=".6"/>';
    },
    candle: function (c) {
      return shadow(200, 70) +
        '<ellipse cx="200" cy="392" rx="60" ry="8" fill="' + shade(c, -0.3) + '"/><path d="M148 392 Q200 372 252 392z" fill="' + c + '"/>' +
        '<path d="M200 384 V210" stroke="' + c + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M200 280 C130 270 120 200 140 180" fill="none" stroke="' + c + '" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M200 250 C270 240 282 170 262 150" fill="none" stroke="' + c + '" stroke-width="8" stroke-linecap="round"/>' +
        '<ellipse cx="140" cy="176" rx="22" ry="8" fill="' + shade(c, -0.25) + '"/><ellipse cx="262" cy="146" rx="22" ry="8" fill="' + shade(c, -0.25) + '"/>' +
        '<rect x="136" y="128" width="9" height="46" fill="#F3EBDD"/><rect x="258" y="98" width="9" height="46" fill="#F3EBDD"/>' +
        '<path d="M140 118 q-8 -16 0 -30 q8 14 0 30z M262 88 q-8 -16 0 -30 q8 14 0 30z" fill="#FFB347"/>';
    },
    rug: function (c) {
      var s = '<path d="M60 300 L340 300 L392 440 L8 440z" fill="' + c + '"/>';
      s += '<path d="M60 300 L340 300 L392 440 L8 440z" fill="url(#sun)" opacity=".4"/>';
      s += '<path d="M92 322 L308 322 L346 420 L54 420z" fill="none" stroke="' + shade(c, -0.3) + '" stroke-width="3" opacity=".6"/>';
      s += '<path d="M120 345 L280 345 L305 400 L95 400z" fill="' + shade(c, -0.18) + '" opacity=".55"/>';
      s += '<path d="M200 352 l30 24 l-30 24 l-30 -24z" fill="' + shade(c, 0.35) + '" opacity=".85"/>';
      for (var i = 0; i < 26; i++) {
        var x = 8 + i * (384 / 25);
        s += '<line x1="' + x + '" y1="440" x2="' + (x + (x - 200) * 0.04) + '" y2="466" stroke="' + shade(c, 0.35) + '" stroke-width="3" stroke-linecap="round"/>';
      }
      s += '<ellipse cx="200" cy="280" rx="150" ry="10" fill="#2a1a10" opacity=".08"/>';
      return s;
    },
    print: function (c, bg) {
      return '<rect x="92" y="62" width="216" height="300" fill="#2a1a10" opacity=".12" transform="translate(8 10)"/>' +
        '<rect x="92" y="62" width="216" height="300" fill="#F8F3EA" stroke="' + shade(bg, -0.35) + '" stroke-width="3"/>' +
        '<rect x="116" y="86" width="168" height="252" fill="' + shade(c, -0.1) + '"/>' +
        '<circle cx="200" cy="190" r="56" fill="' + shade(c, 0.45) + '" opacity=".9"/>' +
        '<path d="M116 338 L116 270 Q160 230 200 270 T284 250 V338z" fill="' + shade(c, -0.4) + '"/>' +
        '<path d="M150 338 q10 -60 40 -70 M230 338 q-6 -50 30 -72" stroke="' + shade(c, 0.5) + '" stroke-width="3" fill="none"/>' +
        '<circle cx="168" cy="132" r="5" fill="' + shade(c, 0.6) + '"/><circle cx="246" cy="118" r="3" fill="' + shade(c, 0.6) + '"/>' +
        '<rect x="150" y="374" width="100" height="5" fill="#2a1a10" opacity=".35"/>' + shadow(200, 110).replace(/opacity=".22"/, 'opacity=".1"');
    },
    chair: function (c) {
      var d = shade(c, -0.3);
      return shadow(200, 130) +
        '<path d="M110 396 L130 330 M290 396 L270 330" stroke="#2a1a10" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M70 190 Q60 120 130 96 Q200 80 270 96 Q340 120 330 190 L316 300 L84 300z" fill="' + d + '"/>' +
        '<path d="M92 200 Q90 130 140 112 Q200 100 260 112 Q310 130 308 200 L296 270 L104 270z" fill="' + c + '"/>' +
        '<path d="M130 120 Q200 100 270 120" fill="none" stroke="' + shade(c, 0.3) + '" stroke-width="5" opacity=".6" stroke-linecap="round"/>' +
        '<path d="M64 270 Q40 300 64 330 L336 330 Q360 300 336 270 Q320 252 300 262 L100 262 Q80 252 64 270z" fill="' + shade(c, -0.12) + '"/>' +
        '<rect x="80" y="318" width="240" height="22" rx="10" fill="#4a2f1c"/>' +
        '<path d="M66 285 Q56 190 100 150" fill="none" stroke="#4a2f1c" stroke-width="14" stroke-linecap="round"/>' +
        '<path d="M334 285 Q344 190 300 150" fill="none" stroke="#4a2f1c" stroke-width="14" stroke-linecap="round"/>';
    },
    icelamp: function (c, bg) {
      return shadow(200, 90) +
        '<rect x="130" y="342" width="140" height="56" rx="14" fill="#5A3A26"/><rect x="130" y="342" width="140" height="14" rx="7" fill="#7A5236"/>' +
        '<rect x="188" y="320" width="24" height="26" fill="#3b2517"/>' +
        '<path d="M130 300 L150 190 L200 150 L252 184 L272 300 L236 330 L170 326z" fill="' + shade(c, 0.1) + '" opacity=".95"/>' +
        '<path d="M150 190 L200 150 L200 260z M200 150 L252 184 L200 260z M150 190 L200 260 L130 300z M252 184 L272 300 L200 260z M200 260 L170 326 L130 300z M200 260 L272 300 L236 330z" fill="#fff" opacity=".12" stroke="#fff" stroke-opacity=".5"/>' +
        '<circle cx="200" cy="248" r="34" fill="#FFF3C8"/><circle cx="200" cy="248" r="60" fill="#FFE29A" opacity=".35"/>' +
        '<circle cx="200" cy="248" r="100" fill="#FFE29A" opacity=".12"/>';
    },
    arch: function (c, bg) {
      return '<path d="M110 400 V210 a90 90 0 0 1 180 0 V400z" fill="' + c + '"/>' +
        '<path d="M130 400 V215 a70 70 0 0 1 140 0 V400z" fill="' + shade(c, 0.28) + '"/>' +
        '<path d="M150 400 V220 a50 50 0 0 1 100 0 V400z" fill="' + shade(c, -0.12) + '"/>' +
        '<rect x="210" y="300" width="70" height="100" fill="#8A5A34"/><rect x="210" y="300" width="70" height="8" fill="#A8734A"/>' +
        '<circle cx="260" cy="190" r="26" fill="' + shade(c, 0.5) + '" opacity=".8"/>' +
        '<path d="M120 400 q-20 -50 8 -86 q-4 50 20 86z M150 400 q16 -36 -2 -70 q22 28 14 70z" fill="#5E6E48"/>' +
        '<ellipse cx="200" cy="404" rx="110" ry="9" fill="#2a1a10" opacity=".15"/>';
    },
    vase: function (c) {
      return shadow(200, 80) +
        '<path d="M170 140 Q176 120 172 100 H228 Q224 120 230 140 C300 180 320 330 270 392 H130 C80 330 100 180 170 140z" fill="' + c + '"/>' +
        '<path d="M150 190 C120 260 130 340 160 392 H130 C80 330 100 180 170 140z" fill="#fff" opacity=".18"/>' +
        '<path d="M232 150 C290 200 296 330 262 392 H270 C320 330 300 180 230 140z" fill="#000" opacity=".15"/>' +
        '<path d="M110 300 Q200 320 290 296 V310 Q200 336 108 316z" fill="' + shade(c, -0.35) + '" opacity=".55"/>' +
        '<ellipse cx="200" cy="100" rx="28" ry="6" fill="' + shade(c, -0.35) + '"/>' +
        '<path d="M200 98 Q196 40 160 24 M204 98 Q214 36 252 28 M200 98 Q210 60 190 18" stroke="#6C5B33" stroke-width="3" fill="none"/>' +
        '<circle cx="160" cy="24" r="7" fill="#C48A3C"/><circle cx="252" cy="28" r="6" fill="#B4642F"/><circle cx="190" cy="18" r="5" fill="#D9B46A"/>';
    },
    cushion: function (c) {
      return shadow(200, 130) +
        '<path d="M80 200 Q200 170 320 200 Q336 300 320 380 Q200 400 80 380 Q64 300 80 200z" fill="' + c + '"/>' +
        '<path d="M80 200 Q200 170 320 200 Q336 300 320 380 Q200 400 80 380 Q64 300 80 200z" fill="url(#sun)" opacity=".5"/>' +
        '<path d="M110 230 Q200 214 290 230 M104 290 Q200 276 296 290 M110 340 Q200 328 290 342" stroke="' + shade(c, -0.25) + '" stroke-width="2" fill="none" opacity=".5"/>' +
        '<path d="M80 200 Q130 280 80 380 M320 200 Q270 280 320 380" stroke="' + shade(c, -0.3) + '" stroke-width="3" fill="none" opacity=".45"/>';
    },
    table: function (c) {
      var d = shade(c, -0.3);
      return shadow(200, 110) +
        '<path d="M130 232 L108 398 M270 232 L292 398 M200 240 V402" stroke="' + d + '" stroke-width="13" stroke-linecap="round"/>' +
        '<ellipse cx="200" cy="228" rx="130" ry="28" fill="' + d + '"/><ellipse cx="200" cy="216" rx="130" ry="28" fill="' + c + '"/>' +
        '<ellipse cx="200" cy="216" rx="100" ry="19" fill="none" stroke="' + d + '" stroke-width="2" opacity=".5"/>' +
        '<rect x="170" y="176" width="44" height="40" rx="4" fill="#E9DFD0"/><rect x="176" y="176" width="32" height="6" fill="#B35A25"/>' +
        '<circle cx="262" cy="196" r="14" fill="#F4EFE6"/><path d="M276 194 q10 0 10 8" stroke="#F4EFE6" stroke-width="3" fill="none"/>';
    },
    pendant: function (c) {
      return '<line x1="200" y1="0" x2="200" y2="150" stroke="#2a1a10" stroke-width="3"/>' +
        '<rect x="188" y="146" width="24" height="22" fill="#2a1a10"/>' +
        '<path d="M92 290 Q94 190 200 168 Q306 190 308 290z" fill="' + c + '"/>' +
        '<path d="M92 290 Q94 190 150 176 Q112 220 120 290z" fill="#fff" opacity=".28"/>' +
        '<ellipse cx="200" cy="290" rx="108" ry="14" fill="' + shade(c, -0.35) + '"/>' +
        '<ellipse cx="200" cy="292" rx="94" ry="9" fill="#FFE9B0"/>' +
        '<path d="M110 300 L40 450 H360 L290 300z" fill="#FFE29A" opacity=".16"/>';
    }
  };

  VF.art = function (p, colorHex) {
    var c = colorHex || p.swatches[0][1];
    return stage(p.bg, A[p.art](c, p.bg));
  };
})();
