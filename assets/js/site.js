/* Albatross — site behaviour. No dependencies. */
(function () {
  "use strict";

  // Where form submissions are delivered (FormSubmit.co, free, no account).
  // The first submission sends a one-time activation email to this address.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/mo@albatross-cap.com";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  // Intro overlay: shown once per browser session (class set inline in <head>).
  if (root.classList.contains("js-intro")) {
    setTimeout(function () {
      root.classList.remove("js-intro");
    }, 2800);
  }

  // Footer year.
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // Mobile menu.
  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) menuBtn.click();
    });
  }

  // Hero word rotator.
  var words = document.querySelectorAll(".rotator .word");
  if (words.length > 1 && !reduceMotion) {
    var current = 0;
    setInterval(function () {
      var prev = words[current];
      current = (current + 1) % words.length;
      var next = words[current];
      prev.classList.remove("is-active");
      prev.classList.add("is-leaving");
      next.classList.remove("is-leaving");
      next.classList.add("is-active");
      setTimeout(function () { prev.classList.remove("is-leaving"); }, 600);
    }, 1700);
  }

  // Hero video: tilted back at the top of the page, flattens as you scroll (matches the original).
  var tilt = document.querySelector("[data-tilt]");
  if (tilt && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var deg = Math.max(0, 4.02 - window.scrollY * 0.00917);
      tilt.style.setProperty("--tilt", deg.toFixed(3) + "deg");
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // Fade-up on scroll, and number count-up.
  var countUp = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    if (reduceMotion || !target) { el.textContent = pre + target + suf; return; }
    var start = null, dur = 700;
    var step = function (t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = pre + "0" + suf;
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-counters")) {
          el.querySelectorAll("[data-count]").forEach(countUp);
        } else {
          el.classList.add("is-in");
        }
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    document.querySelectorAll(".reveal, [data-counters]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Testimonials: cross-fade between quotes.
  document.querySelectorAll("[data-rotate]").forEach(function (box) {
    var items = box.querySelectorAll(".quote");
    if (items.length < 2 || reduceMotion) return;
    var i = 0, every = parseInt(box.getAttribute("data-rotate"), 10) || 9500;
    items.forEach(function (q, k) { q.setAttribute("aria-hidden", String(k !== 0)); });
    setInterval(function () {
      items[i].classList.remove("is-active");
      items[i].setAttribute("aria-hidden", "true");
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
      items[i].setAttribute("aria-hidden", "false");
    }, every);
  });

  // Accordion.
  document.querySelectorAll(".acc-head").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc-item");
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // Forms (contact + newsletter) -> email via FormSubmit.
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  document.querySelectorAll(".js-form").forEach(function (form) {
    var note = form.parentElement.querySelector(".form-note") || form.querySelector(".form-note");
    var say = function (msg, kind) {
      if (!note) return;
      note.textContent = msg;
      note.className = "form-note" + (kind ? " " + kind : "");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      if (data._honey) return;
      if (!emailOk(data.email || "")) { say("Please enter a valid email address.", "err"); return; }
      if (form.dataset.kind === "contact" && (!data.name || !data.message)) { say("Please fill in your name and message.", "err"); return; }
      var isNews = form.dataset.kind === "newsletter";
      data._subject = isNews ? "Newsletter sign-up: albatross-cap.com" : "New message from albatross-cap.com";
      data._template = "table";
      data._captcha = "false";
      if (!isNews) data._replyto = data.email;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      say("Sending…");
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) !== "false") {
            form.reset();
            say(isNews ? "Thanks, you're on the list." : "Thank you. Your message has been sent and we'll be in touch soon.", "ok");
          } else {
            throw new Error(res.j && res.j.message || "send failed");
          }
        })
        .catch(function () { say("Sorry, something went wrong. Please try again in a moment.", "err"); })
        .then(function () { btn.disabled = false; });
    });
  });
})();
