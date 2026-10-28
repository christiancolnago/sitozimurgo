/* Zimurgo — script minimo, nessun tracker, nessuna libreria */
(function () {
  "use strict";

  // Ogni pagina si apre dall'inizio quando arrivi da un'altra pagina del sito (anche dentro anteprime incorporate)
  try {
    var navEntry = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var navType = navEntry && navEntry.type;
    if (!location.hash && navType !== "back_forward" && navType !== "reload") {
      window.scrollTo(0, 0);
      if (window.self !== window.top && document.body && document.body.scrollIntoView) {
        document.body.scrollIntoView({ block: "start" });
      }
    }
  } catch (e0) {}

  // Prima di aprire un'altra pagina del sito: porta in cima la vista (serve dentro anteprime incorporate, che tengono lo scorrimento esterno)
  try { if ("scrollRestoration" in history) history.scrollRestoration = "auto"; } catch (e2) {}
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.target === "_top") return;
    var h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || /^(tel:|mailto:|https?:)/.test(h) || h.indexOf("#") > -1) return;
    window.scrollTo(0, 0);
    if (window.self !== window.top && document.documentElement.scrollIntoView) document.documentElement.scrollIntoView({ block: "start" });
  }, true);

  // Prima di aprire un'altra pagina del sito: porta in cima la vista (serve dentro anteprime incorporate, che tengono lo scorrimento esterno)
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.target === "_top") return;
    var h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || /^(tel:|mailto:|https?:)/.test(h) || h.indexOf("#") > -1) return;
    window.scrollTo(0, 0);
    if (window.self !== window.top && document.documentElement.scrollIntoView) document.documentElement.scrollIntoView({ block: "start" });
  }, true);

  // Anno nel footer
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mappa Google caricata solo su richiesta (nessun cookie di terzi prima del click)
  var btn = document.getElementById("load-map");
  var box = document.getElementById("mapbox");
  if (btn && box) {
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = box.getAttribute("data-src");
      f.title = "Mappa: Zimurgo Beer & Wine, Via Varesina 22, Jerago con Orago";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.allowFullscreen = true;
      box.textContent = "";
      box.appendChild(f);
    });
  }

  // Lavagna online: legge taps.json (se contiene voci) e la mostra in home e nel menù.
  // Per aggiornare la lista basta modificare taps.json, vedi GUIDA-SITO.md.
  function render(el, title, items, kind) {
    if (!el || !items || !items.length) return;
    var h = document.createElement("h4");
    h.textContent = title;
    var ul = document.createElement("ul");
    items.forEach(function (it) {
      var li = document.createElement("li");
      var main = document.createElement("strong");
      main.textContent = it.name || "";
      li.appendChild(main);
      var bits = [];
      if (kind === "beer") {
        if (it.brewery) bits.push(it.brewery);
        if (it.style) bits.push(it.style);
        if (it.abv) bits.push(it.abv);
      } else {
        if (it.producer) bits.push(it.producer);
        if (it.area) bits.push(it.area);
        if (it.type) bits.push(it.type);
      }
      if (it.price) bits.push(it.price);
      if (bits.length) {
        var s = document.createElement("small");
        s.textContent = " · " + bits.join(" · ");
        li.appendChild(s);
      }
      ul.appendChild(li);
    });
    el.textContent = "";
    el.appendChild(h);
    el.appendChild(ul);
    el.hidden = false;
  }

  if ("fetch" in window) {
    fetch("taps.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        var stamp = d.aggiornato ? " (aggiornato il " + d.aggiornato + ")" : "";
        document.querySelectorAll("#lavagna-birre").forEach(function (el) {
          render(el, "Alla spina adesso" + stamp, d.birre, "beer");
        });
        document.querySelectorAll("#lavagna-vini").forEach(function (el) {
          render(el, "Vini al calice adesso" + stamp, d.vini, "wine");
        });
      })
      .catch(function () { /* nessuna lavagna online: nessun problema */ });
  }

  // Orari: la tabella #orari è l'unica fonte. Da lì si ricava "Aperto ora / Chiuso ora" (ora italiana) e il giorno evidenziato.
  (function () {
    var list = document.getElementById("orari");
    if (!list) return;
    var WEEK = 7 * 1440;
    var DAYNAMES = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
    var intervals = [];
    Array.prototype.forEach.call(list.querySelectorAll("li[data-day]"), function (li) {
      var d = parseInt(li.getAttribute("data-day"), 10);
      var slots = li.getAttribute("data-slots");
      if (!slots) return;
      slots.split(",").forEach(function (sl) {
        var p = sl.split("-");
        var a = p[0].split(":"), b = p[1].split(":");
        var s = d * 1440 + (+a[0]) * 60 + (+a[1]);
        var e = d * 1440 + (+b[0]) * 60 + (+b[1]);
        if (e <= s) e += 1440; // chiude dopo mezzanotte
        intervals.push({ s: s, e: e });
      });
    });
    function romeNow() {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (x) { o[x.type] = x.value; });
      var idx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
      return { day: idx, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    }
    function hhmm(m) {
      m = ((m % 1440) + 1440) % 1440;
      if (m === 0) return "mezzanotte";
      var h = Math.floor(m / 60), mm = m % 60;
      return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
    }
    function status() {
      var n = romeNow(), now = n.day * 1440 + n.min, i, it;
      for (i = 0; i < intervals.length; i++) {
        it = intervals[i];
        if ((now >= it.s && now < it.e) || (now + WEEK >= it.s && now + WEEK < it.e)) {
          var end = it.e % 1440;
          return { open: true, text: "Aperto ora" + (end === 0 ? " fino a mezzanotte" : " fino alle " + hhmm(end)) };
        }
      }
      var best = null;
      intervals.forEach(function (x) {
        [x.s, x.s + WEEK].forEach(function (s) { if (s > now && (best === null || s < best)) best = s; });
      });
      if (best === null) return { open: false, text: "Chiuso ora" };
      var dayDiff = Math.floor(best / 1440) - n.day;
      var when = dayDiff === 0 ? "oggi" : dayDiff === 1 ? "domani" : DAYNAMES[Math.floor(best / 1440) % 7];
      return { open: false, text: "Chiuso ora · riapre " + when + " alle " + hhmm(best % 1440) };
    }
    function paint() {
      var st = status(), n = romeNow();
      ["open-now", "open-now-hero"].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = st.text;
        el.setAttribute("data-open", st.open ? "1" : "0");
        el.hidden = false;
      });
      Array.prototype.forEach.call(list.querySelectorAll("li[data-day]"), function (li) {
        li.classList.toggle("today", parseInt(li.getAttribute("data-day"), 10) === n.day);
      });
    }
    paint();
    setInterval(paint, 60000);
  })();

  // Foto del locale: la sezione compare solo se locale.jpg esiste davvero (niente spazio vuoto, niente salti di pagina)
  var fotoSez = document.getElementById("foto-sezione");
  if (fotoSez) {
    var fotoImg = fotoSez.querySelector("img");
    var probe = new Image();
    probe.onload = function () { fotoImg.src = fotoImg.getAttribute("data-src"); fotoSez.hidden = false; };
    probe.src = fotoImg.getAttribute("data-src");
  }

  // Link interni (#sezione) e logo: scorrimento affidabile anche nei riquadri incorporati
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("a[href]") : null;
    if (!t) return;
    var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var behavior = reduceMotion ? "auto" : "smooth";
    var href = t.getAttribute("href");
    // logo su una pagina che è già la home: torna in cima
    if ((href === "./" || href === "/") && /\/(index\.html)?$/.test(location.pathname)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: behavior });
      if (window.self !== window.top && document.body.scrollIntoView) document.body.scrollIntoView({ block: "start", behavior: behavior });
      return;
    }
    if (href.charAt(0) !== "#" || href.length < 2) return;
    var el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    if (document.documentElement.classList.contains("fx")) {
      var r = el.getBoundingClientRect();
      var top = r.top + window.pageYOffset;
      top += el.classList.contains("scene") ? Math.max(0, (r.height - window.innerHeight) * 0.14) : -64;
      window.scrollTo({ top: Math.max(0, top), behavior: behavior });
    } else {
      el.scrollIntoView({ behavior: behavior, block: "start" });
    }
  });

  // Recensioni Google: si leggono da recensioni.json. La sezione compare solo se ci sono recensioni vere.
  (function () {
    var sec = document.getElementById("recensioni");
    if (!sec || !("fetch" in window)) return;
    fetch("recensioni.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.recensioni || !d.recensioni.length) return;
        var list = document.getElementById("reviews-list");
        d.recensioni.forEach(function (it) {
          if (!it.testo) return;
          var n = Math.max(1, Math.min(5, parseInt(it.stelle, 10) || 5));
          var li = document.createElement("li");
          li.className = "review";
          var st = document.createElement("p");
          st.className = "stars";
          st.setAttribute("role", "img");
          st.setAttribute("aria-label", n + " stelle su 5");
          st.textContent = "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
          var q = document.createElement("blockquote");
          q.textContent = it.testo;
          var who = document.createElement("p");
          who.className = "who";
          who.textContent = [it.autore, it.data].filter(Boolean).join(" · ") + (it.autore || it.data ? " · " : "") + "Recensione su Google";
          li.appendChild(st); li.appendChild(q); li.appendChild(who);
          list.appendChild(li);
        });
        if (!list.children.length) return;
        var sum = document.getElementById("reviews-summary");
        if (d.valutazione) {
          sum.textContent = "★ " + d.valutazione + " su 5" + (d.numero ? " · " + d.numero + " recensioni su Google" : " su Google");
        } else { sum.hidden = true; }
        if (d.link) { var w = document.getElementById("reviews-write"); w.href = d.link; w.hidden = false; }
        sec.hidden = false;
      })
      .catch(function () { /* nessuna recensione: la sezione resta nascosta */ });
  })();

  // Novità ed eventi: si leggono da eventi.json. La sezione compare solo se c'è almeno un evento non passato.
  (function () {
    var sec = document.getElementById("eventi");
    if (!sec || !("fetch" in window)) return;
    fetch("eventi.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.eventi || !d.eventi.length) return;
        var oggi = new Date(); oggi.setHours(0, 0, 0, 0);
        var mesi = ["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
        var list = document.getElementById("events-list");
        d.eventi.filter(function (e) { return e && e.titolo; }).map(function (e) {
          function pd(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
          var ds = [], sep = "·";
          if (Array.isArray(e.date)) { ds = e.date.map(pd).filter(Boolean); }
          else {
            var a0 = pd(e.data), f0 = pd(e.fine);
            if (a0) ds = [a0];
            if (a0 && f0 && f0 > a0) { ds = [a0, f0]; sep = "–"; }
          }
          ds.sort(function (x, y) { return x - y; });
          e._ds = ds; e._sep = sep;
          e._d = ds.length ? ds[0] : null;
          e._last = ds.length ? ds[ds.length - 1] : null;
          return e;
        }).filter(function (e) { return !e._d || e._last >= oggi; })
          .sort(function (a, b) { return (a._d ? a._d.getTime() : 9e15) - (b._d ? b._d.getTime() : 9e15); })
          .slice(0, 6).forEach(function (e) {
            var li = document.createElement("li");
            if (e._d) {
              var dt = document.createElement("div"); dt.className = "ev-date";
              var num = e._ds.map(function (x) { return x.getDate(); }).join(e._sep);
              var nb = document.createElement("b"); nb.textContent = num;
              nb.style.fontSize = num.length <= 2 ? "1.9rem" : num.length <= 5 ? "1.5rem" : num.length <= 8 ? "1.2rem" : "1rem";
              dt.appendChild(nb);
              var mm = [];
              e._ds.forEach(function (x) { var n = mesi[x.getMonth()]; if (mm.indexOf(n) < 0) mm.push(n); });
              var sm = document.createElement("small"); sm.textContent = mm.join("–");
              dt.appendChild(sm); li.appendChild(dt);
            } else { li.style.gridTemplateColumns = "1fr"; }
            var box = document.createElement("div");
            var t = document.createElement("strong"); t.textContent = e.titolo; box.appendChild(t);
            var det = Array.isArray(e.dettaglio) ? e.dettaglio.join("\n") : e.dettaglio;
            if (det) { var x = document.createElement("span"); x.className = "ev-d"; x.textContent = det; box.appendChild(x); }
            if (e.link && /^https:\/\//i.test(e.link)) {
              var a = document.createElement("a"); a.className = "ev-link"; a.href = e.link; a.target = "_blank"; a.rel = "noopener";
              a.textContent = e.linkTesto || (/instagram\.com/i.test(e.link) ? "Vedi su Instagram" : /facebook\.com|fb\.me/i.test(e.link) ? "Vedi su Facebook" : "Maggiori info");
              box.appendChild(a);
            }
            li.appendChild(box); list.appendChild(li);
          });
        if (list.children.length) sec.hidden = false;
      })
      .catch(function () { /* nessun evento: la sezione resta nascosta */ });
  })();

  // Carosello foto: scorrimento con il dito, miniature sotto, frecce su computer.
  (function () {
    var box = document.querySelector("[data-carousel]");
    if (!box) return;
    var track = box.querySelector(".car-track"), slides = track.children, thumbs = box.querySelector(".car-thumbs");
    var prev = box.querySelector(".car-prev"), next = box.querySelector(".car-next");
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var btns = [], cur = 0;
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? "auto" : "smooth" });
    }
    Array.prototype.forEach.call(slides, function (f, i) {
      var src = f.querySelector("img");
      var b = document.createElement("button"); b.type = "button"; b.className = "car-thumb";
      b.setAttribute("aria-label", "Foto " + (i + 1) + " di " + slides.length);
      var im = document.createElement("img"); im.src = src.getAttribute("src"); im.alt = ""; im.width = 84; im.height = 84; im.loading = "lazy";
      b.appendChild(im); b.addEventListener("click", function () { go(i); });
      thumbs.appendChild(b); btns.push(b);
    });
    function update() {
      var w = track.clientWidth || 1;
      var i = Math.round(track.scrollLeft / w);
      i = Math.max(0, Math.min(slides.length - 1, i));
      if (i !== cur || !btns[i].hasAttribute("aria-current")) {
        cur = i;
        btns.forEach(function (b, k) { if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
        var t = btns[i];
        thumbs.scrollTo({ left: t.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
      }
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    }
    var tick = false;
    track.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; update(); }); } }, { passive: true });
    window.addEventListener("resize", function () { track.scrollLeft = cur * track.clientWidth; });
    if (prev) { prev.hidden = false; prev.addEventListener("click", function () { go(cur - 1); }); }
    if (next) { next.hidden = false; next.addEventListener("click", function () { go(cur + 1); }); }
    update();
  })();

  // Statistiche senza cookie (GoatCounter). Si attivano scrivendo il codice del conto qui sotto, es. "zimurgo".
  (function () {
    var CODICE = "";
    if (!CODICE) return;
    var sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://gc.zgo.at/count.js";
    sc.setAttribute("data-goatcounter", "https://" + CODICE + ".goatcounter.com/count");
    document.head.appendChild(sc);
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest("a[href]");
      if (!a || !window.goatcounter || !window.goatcounter.count) return;
      var h = a.getAttribute("href") || "", nome = "";
      if (h.indexOf("tel:") === 0) nome = "tocco-chiama";
      else if (h.indexOf("wa.me") > -1) nome = "tocco-whatsapp";
      else if (h.indexOf("google.com/maps") > -1) nome = "tocco-indicazioni";
      else if (h.indexOf("menu.html") > -1) nome = "tocco-menu";
      if (nome) window.goatcounter.count({ path: nome, title: nome, event: true });
    });
  })();
})();
