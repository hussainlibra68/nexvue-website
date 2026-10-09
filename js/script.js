// Mobile nav toggle + dropdown handling
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 720) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // Banner carousel — auto-advances every 3 seconds, with prev/next + dots
  document.querySelectorAll('.carousel').forEach(function (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var slides = carousel.querySelectorAll('.carousel-slide');
    var dots = carousel.querySelectorAll('.carousel-dots button');
    var total = slides.length;
    var index = 0;
    var timer;

    function go(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, di) { d.classList.toggle('active', di === index); });
    }

    function start() {
      timer = setInterval(function () { go(index + 1); }, 3000);
    }
    function stop() { clearInterval(timer); }

    var prev = carousel.querySelector('.carousel-arrow.prev');
    var next = carousel.querySelector('.carousel-arrow.next');
    if (prev) prev.addEventListener('click', function () { go(index - 1); stop(); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); stop(); start(); });
    dots.forEach(function (d, di) {
      d.addEventListener('click', function () { go(di); stop(); start(); });
    });

    if (total > 1) start();
  });

  // Contact form — opens the visitor's email app with the message pre-filled.
  // Set your real address here once; no backend required for this to work.
  var CONTACT_EMAIL = "nexvuelenses@gmail.com";
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var message = document.getElementById('message').value.trim();
      var subject = encodeURIComponent('Website enquiry from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    });
  }

  // Track Product form — no order backend yet, so this shows a helpful
  // message instead of a real lookup. Wire it to your order system later.
  var trackForm = document.getElementById('track-form');
  if (trackForm) {
    trackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = document.getElementById('track-id').value.trim();
      var result = document.getElementById('track-result');
      result.textContent = 'Thanks — we\'ve noted order "' + id + '". Live tracking needs to be connected to your order system; for now our team will confirm status by email or phone.';
    });
  }

  // Language switcher — cosmetic selector for now. Switching updates the
  // shown flag/label; it does not translate page content yet. Wire this to
  // real per-language content when that's ready.
  var langSwitcher = document.querySelector('.lang-switcher');
  if (langSwitcher) {
    var langToggle = langSwitcher.querySelector('.lang-toggle');
    var langMenu = langSwitcher.querySelector('.lang-menu');
    var langFlag = langSwitcher.querySelector('.lang-flag');
    var langLabel = langSwitcher.querySelector('.lang-label');

    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      langMenu.classList.toggle('open');
    });
    langSwitcher.querySelectorAll('.lang-menu a').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        langFlag.innerHTML = item.querySelector('svg').outerHTML;
        langLabel.textContent = item.getAttribute('data-label');
        langMenu.classList.remove('open');
      });
    });
    document.addEventListener('click', function () {
      langMenu.classList.remove('open');
    });
  }
});

