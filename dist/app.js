/* Wohnen + Design — Interaktion: Burger-Menü, Live-Öffnungsstatus. */
(function () {
  "use strict";

  /* Öffnungszeiten (Quelle: wd-amann-kaltenecker-direkt.de/Impressum, 17.07.2026).
     Montag: nur nach Vereinbarung -> kein festes Fenster. */
  var HOURS = {
    1: null,                                  // Montag: Termin nach Vereinbarung
    2: [[9 * 60 + 30, 13 * 60], [14 * 60, 17 * 60]],
    3: [[9 * 60 + 30, 13 * 60], [14 * 60, 17 * 60]],
    4: [[9 * 60 + 30, 13 * 60], [14 * 60, 17 * 60]],
    5: [[9 * 60 + 30, 13 * 60], [14 * 60, 17 * 60]],
    6: [[9 * 60 + 30, 13 * 60]],
    0: null                                   // Sonntag: geschlossen
  };

  function berlinNow() {
    var f = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    });
    var parts = {};
    f.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var hour = parseInt(parts.hour, 10);
    if (hour === 24) hour = 0;
    return { day: map[parts.weekday], minutes: hour * 60 + parseInt(parts.minute, 10) };
  }

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }

  function updateStatus() {
    var el = document.getElementById("status");
    var txt = document.getElementById("status-txt");
    if (!el || !txt) return;
    var now = berlinNow();
    var today = HOURS[now.day];
    el.classList.remove("is-closed");

    if (today) {
      for (var i = 0; i < today.length; i++) {
        if (now.minutes >= today[i][0] && now.minutes < today[i][1]) {
          txt.textContent = "Heute geöffnet — bis " + fmt(today[i][1]) + " Uhr";
          return;
        }
      }
      for (var j = 0; j < today.length; j++) {
        if (now.minutes < today[j][0]) {
          el.classList.add("is-closed");
          txt.textContent = "Heute geöffnet ab " + fmt(today[j][0]) + " Uhr";
          return;
        }
      }
    }
    el.classList.add("is-closed");
    if (now.day === 1) {
      txt.textContent = "Montag: Termin nach Vereinbarung";
    } else {
      txt.textContent = "Beratung auch nach Vereinbarung";
    }
  }

  function init() {
    updateStatus();
    setInterval(updateStatus, 60000);

    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    var hdr = document.getElementById("hdr");
    var onScroll = function () { hdr.classList.toggle("is-stuck", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var burger = document.getElementById("burger");
    var navEl = document.getElementById("nav");
    if (burger && navEl) {
      var setMenu = function (open) {
        navEl.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
      };
      burger.addEventListener("click", function () { setMenu(!navEl.classList.contains("is-open")); });
      navEl.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
      document.addEventListener("click", function (e) {
        if (navEl.classList.contains("is-open") && !navEl.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
          setMenu(false);
        }
      });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
      document.querySelectorAll(".rise").forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll(".rise").forEach(function (el) { el.classList.add("in"); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
