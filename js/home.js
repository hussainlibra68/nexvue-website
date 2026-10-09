// Scroll-driven effects for the modern homepage sections
(function () {
  var meet = document.getElementById('hm-meet');
  var float = document.getElementById('hm-float');
  if (!meet) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tiles = [].slice.call(document.querySelectorAll('.hm-tile'));
  var art = document.querySelector('.hm-lens-art');
  var giant = document.querySelector('.hm-giant');
  var sticky = document.querySelector('.hm-meet-sticky');
  var ticking = false;

  function update() {
    ticking = false;
    if (reduce) return;
    var vh = window.innerHeight;
    var r = meet.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
    art.style.setProperty('--s', (1 + p * 0.55).toFixed(3));
    art.style.setProperty('--r', (p * 22).toFixed(2) + 'deg');
    giant.style.setProperty('--ts', (1 + p * 0.12).toFixed(3));
    sticky.style.setProperty('--so', Math.max(0, 1 - p * 2.2).toFixed(3));
    if (window.innerWidth > 820 && float) {
      var fr = float.getBoundingClientRect();
      var c = fr.top + fr.height / 2 - vh / 2;
      tiles.forEach(function (t) {
        var sp = parseFloat(t.dataset.speed), rot = parseFloat(t.dataset.rot);
        t.style.setProperty('--y', (-c * sp).toFixed(1) + 'px');
        t.style.setProperty('--rot', (rot + c * 0.004).toFixed(2) + 'deg');
      });
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  update();

  // Reveal + count-up
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      var n = e.target.querySelector('[data-count]');
      if (n) {
        var end = +n.dataset.count, t0 = null;
        (function step(t) {
          t0 = t0 || t;
          var k = Math.min(1, (t - t0) / 1200);
          n.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      }
      io.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
})();
