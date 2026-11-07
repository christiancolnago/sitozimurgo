/* Scene a scorrimento di Zimurgo. Vanilla JS, nessuna dipendenza.
   Imposta --p (0→1) su ogni [data-scene] in base allo scroll e accende i passi (spine, ripiani, righe, parole). */
(function () {
  "use strict";

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  // Frigoriferi: disegnati qui per tenere l'HTML leggero (decorativi)
  var fr = document.getElementById("fridges");
  if (fr) {
    var colors = ["#e8a93a", "#45a74f", "#841b30", "#ece8d8", "#c9751c", "#8fc46f"];
    var out = '<rect x="20" y="16" width="280" height="388" rx="16" fill="#12261d" stroke="#ece8d8" stroke-width="3"/>' +
              '<rect x="340" y="16" width="280" height="388" rx="16" fill="#12261d" stroke="#ece8d8" stroke-width="3"/>';
    for (var r = 0; r < 4; r++) {
      var base = 96 + r * 88, g = '<g class="row" data-r="' + r + '">';
      [0, 1].forEach(function (f) {
        var x0 = 40 + f * 320;
        g += '<rect x="' + (x0 - 6) + '" y="' + (base + 2) + '" width="252" height="4" rx="2" fill="#3a5a4a"/>';
        for (var i = 0; i < 7; i++) {
          var c = colors[(i + r * 2 + f * 3) % colors.length], x = x0 + i * 36;
          if ((i + r + f) % 3 === 0) {
            g += '<rect x="' + (x + 8) + '" y="' + (base - 66) + '" width="12" height="20" rx="4" fill="' + c + '"/>' +
                 '<rect x="' + (x + 3) + '" y="' + (base - 48) + '" width="22" height="48" rx="6" fill="' + c + '"/>';
          } else {
            g += '<rect x="' + (x + 3) + '" y="' + (base - 44) + '" width="22" height="44" rx="5" fill="' + c + '"/>' +
                 '<rect x="' + (x + 3) + '" y="' + (base - 36) + '" width="22" height="6" fill="#0f1f18" opacity=".35"/>';
          }
        }
      });
      out += g + "</g>";
    }
    fr.innerHTML = out;
  }

  // Bottiglieria: tre scaffali (vino; whisky e rum; grappe, liquori e amari), disegnati qui
  var cel = document.getElementById("cellar");
  if (cel) {
    var o = '<rect x="6" y="6" width="628" height="318" rx="14" fill="#1a1109" stroke="#ece8d8" stroke-opacity=".5" stroke-width="3"/>';
    var wineC = ["#841b30", "#2f5d3a", "#b8365f", "#5a2233", "#c9a14a", "#3c6b4a"];
    var spC = ["#c9751c", "#8a4a14", "#3b2212", "#e0b060", "#a85a18", "#5a3418"];
    var liqC = ["#e8a93a", "#45a74f", "#d9506b", "#2a1a14", "#8fc46f", "#c9751c", "#841b30"];
    var rows3 = [];
    var g0 = '<g class="row">', i, x;
    for (i = 0; i < 11; i++) {
      x = 24 + i * 54;
      g0 += '<rect x="' + (x + 9) + '" y="18" width="8" height="30" rx="2" fill="' + wineC[i % 6] + '"/>' +
            '<rect x="' + x + '" y="44" width="26" height="62" rx="6" fill="' + wineC[i % 6] + '"/>' +
            '<rect x="' + (x + 3) + '" y="68" width="20" height="22" rx="2" fill="#ece8d8" opacity=".75"/>';
    }
    g0 += '<rect x="14" y="108" width="612" height="5" rx="2" fill="#4a3320"/></g>';
    var g1 = '<g class="row">';
    for (i = 0; i < 9; i++) {
      x = 26 + i * 66;
      g1 += '<rect x="' + (x + 11) + '" y="124" width="14" height="14" fill="#ece8d8" opacity=".85"/>' +
            '<rect x="' + x + '" y="136" width="36" height="66" rx="7" fill="' + spC[i % 6] + '"/>' +
            '<rect x="' + (x + 4) + '" y="156" width="28" height="24" rx="2" fill="#ece8d8" opacity=".8"/>';
    }
    g1 += '<rect x="14" y="204" width="612" height="5" rx="2" fill="#4a3320"/></g>';
    var g2 = '<g class="row">';
    for (i = 0; i < 5; i++) {
      x = 26 + i * 44;
      g2 += '<rect x="' + (x + 8) + '" y="224" width="7" height="22" rx="2" fill="#c9a14a"/>' +
            '<rect x="' + x + '" y="244" width="22" height="58" rx="5" fill="#cfe3dc" opacity=".85"/>';
    }
    for (i = 0; i < 7; i++) {
      x = 262 + i * 52;
      g2 += '<rect x="' + (x + 11) + '" y="244" width="14" height="14" fill="#ece8d8" opacity=".85"/>' +
            '<rect x="' + x + '" y="256" width="36" height="46" rx="14" fill="' + liqC[i % 7] + '"/>';
    }
    g2 += '<rect x="14" y="304" width="612" height="5" rx="2" fill="#4a3320"/></g>';
    cel.innerHTML = o + g0 + g1 + g2;
  }

  // Testo che si accende parola per parola
  var wordEls = document.querySelector("[data-words]");
  var words = [];
  if (wordEls) {
    var txt = wordEls.textContent.replace(/\s+/g, " ").trim().split(" ");
    wordEls.textContent = "";
    txt.forEach(function (t, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = t;
      wordEls.appendChild(s);
      if (i < txt.length - 1) wordEls.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }

  // Senza animazioni, o con un riquadro alto come tutta la pagina (anteprime che non hanno una vera altezza di schermo):
  // sezioni normali, tutto visibile
  if (reduce || window.innerHeight > 2200) return;

  document.documentElement.classList.add("fx");

  var scenes = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));
  var taps = Array.prototype.slice.call(document.querySelectorAll(".tapsvg .tap"));
  var rows = Array.prototype.slice.call(document.querySelectorAll(".fridges .row"));
  var clines = Array.prototype.slice.call(document.querySelectorAll(".cellar-lines li"));
  var crows = Array.prototype.slice.call(document.querySelectorAll(".cellar .row"));
  var wlines = Array.prototype.slice.call(document.querySelectorAll(".wine-lines li"));
  var stepOut = document.querySelector("[data-step-out]");
  var STYLES = ["Chiara", "Torbida", "Ambrata", "Rossa", "Scura", "Acida"];
  var ticking = false;

  // Scena 1: il bicchiere è già al suo posto; scorrendo si riempie e poi si zooma sul logo.
  // Muovono solo due elementi leggeri (il bicchiere e il logo), niente dissolvenze su livelli grandi.
  var hero = document.querySelector('[data-scene="hero"]');
  var hStage = hero && hero.querySelector(".stage");
  var hGlass = hero && hero.querySelector(".glass");
  var hFill = hGlass && hGlass.querySelector(".fill");
  var hLiq = hGlass ? hGlass.querySelectorAll(".liq") : [], hLogo = hGlass && hGlass.querySelector(".lgo");
  var G = null;
  // Logo decodificato in anticipo
  try { var pre = new Image(); pre.src = "logo-verde.png"; if (pre.decode) pre.decode().catch(function () {}); } catch (e) {}
  // Altezza dello schermo "stabile": su telefono la barra del browser che si nasconde cambia window.innerHeight
  // mentre si scorre; usiamo l'altezza del riquadro (100svh), che non cambia.
  var SH = window.innerHeight;
  function layoutHero() {
    if (!hero) return;
    var vw = hStage.clientWidth, vh = hStage.clientHeight, ih = vh || window.innerHeight;
    SH = ih;
    var hd = document.querySelector(".site-head"), hh = hd ? hd.offsetHeight : 0;
    var vv = Math.min(vh, ih - hh);                       // altezza visibile sotto l'intestazione
    var W = Math.max(120, Math.min(340, vw * 0.6, 0.42 * vv));
    var H = 1.5 * W;
    var top = (ih + hh) / 2 - H / 2;                      // bicchiere centrato nello spazio visibile
    var Sz = (0.86 * Math.min(vw, vh)) / (0.36 * W);      // zoom finale: il logo riempie lo schermo
    // Il bicchiere è disegnato al doppio della dimensione e rimpicciolito: resta nitido durante lo zoom
    // senza creare immagini enormi (memoria e fluidità sui telefoni vecchi).
    var K = Math.max(1, Math.min(Sz, 2, 520 / W));
    var Wb = W * K, Hb = 1.5 * Wb, ys0 = top + 0.62 * H;
    hGlass.style.width = Wb + "px";
    hGlass.style.left = ((vw - Wb) / 2) + "px";
    hGlass.style.top = (ys0 - 0.62 * Hb) + "px";
    // Tempi dello scorrimento, in pixel: riempimento, breve pausa, zoom, coda in cui il logo si dissolve
    var F = 0.8 * ih, P = 0.12 * ih, Z = 0.95 * ih;
    var span = Math.round(F + P + 1.3 * Z);
    hero.style.setProperty("--h", (ih + span) + "px");
    G = { F: F, P: P, Z: Z, span: span, vh: vh, K: K, ys: ys0, S: Sz };
    last.fill = last.tf = last.lg = last.lq = null;
  }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeO(t) { return 1 - Math.pow(1 - t, 3); }
  var last = { fill: null, tf: null, lg: null, lq: null };
  function heroFrame(p) {
    if (!G) return;
    var sc = p * G.span;
    // 1) il bicchiere si riempie (la birra sale e fa la schiuma)
    var f = easeO(clamp(sc / G.F));
    var fill = ((1 - f) * 272).toFixed(1);
    if (fill !== last.fill) { last.fill = fill; hFill.style.transform = "translateY(" + fill + "px)"; }
    // 2) pausa, 3) zoom nel logo
    var u = (sc - G.F - G.P) / G.Z;
    var e = easeIO(clamp(u));
    var tf = "translate3d(0," + ((G.vh / 2 - G.ys) * e).toFixed(1) + "px,0) scale(" + (Math.pow(G.S, e) / G.K).toFixed(5) + ")";
    if (tf !== last.tf) { last.tf = tf; hGlass.style.transform = tf; }
    // finito lo zoom la birra sparisce e resta il logo, che si dissolve sullo sfondo del sito
    var lq = u > 1 ? "0" : "1";
    if (lq !== last.lq) { last.lq = lq; for (var i = 0; i < hLiq.length; i++) hLiq[i].style.opacity = lq; }
    var lg = Math.min(clamp((f - 0.45) / 0.3), 1 - clamp((u - 1.09) / 0.14)).toFixed(3);
    if (hLogo && lg !== last.lg) { last.lg = lg; hLogo.style.opacity = lg; }
  }

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  function update() {
    ticking = false;
    var vh = SH || window.innerHeight;
    // prima si legge la geometria di tutte le scene, poi si scrive: niente ricalcoli forzati a ogni passo
    var info = [];
    scenes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      var span = r.height - vh;
      info.push([s, span > 0 ? clamp(-r.top / span) : 0]);
    });
    afterHero();
    info.forEach(function (x) {
      var s = x[0], p = x[1];
      s.style.setProperty("--p", p.toFixed(4));
      var kind = s.getAttribute("data-scene");

      if (kind === "hero") {
        heroFrame(p);
      } else if (kind === "taps") {
        var q = clamp(p * 1.08) * taps.length;
        var i = Math.min(taps.length - 1, Math.floor(q));
        taps.forEach(function (t, k) {
          var f = clamp(q - k);
          t.style.setProperty("--f", f.toFixed(3));
          t.classList.toggle("on", k === i && f < 1);
          t.classList.toggle("seen", k < i || f >= 1);
        });
        if (stepOut) stepOut.textContent = p < 0.01 ? "Sei vie, sei stili" : STYLES[i];
      } else if (kind === "fridges") {
        var n = Math.min(rows.length, Math.floor(p * 1.25 * rows.length) + 1);
        rows.forEach(function (row, k) { row.classList.toggle("on", k < n); });
      } else if (kind === "wine") {
        var m = Math.floor(p * 1.3 * wlines.length) + (p > 0.08 ? 1 : 0);
        wlines.forEach(function (l, k) { l.classList.toggle("on", k < m); });
      } else if (kind === "cellar") {
        var cn = Math.min(3, Math.floor(clamp(p * 1.4) * 3) + 1);
        crows.forEach(function (r, k) { r.classList.toggle("on", k < cn); });
        clines.forEach(function (l, k) { l.classList.toggle("on", k < cn); });
      } else if (kind === "words") {
        var lit = Math.floor(clamp(p * 1.3) * words.length);
        words.forEach(function (w, k) { w.classList.toggle("on", k < lit); });
      }
    });
  }

  var passed = null;
  function afterHero() {
    if (!hero) return;
    var now = hero.getBoundingClientRect().bottom < SH * 1.05;
    if (now !== passed) { passed = now; document.documentElement.classList.toggle("past-hero", now); }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  var lastW = window.innerWidth, lastH = window.innerHeight, touch = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  window.addEventListener("resize", function () {
    var w = window.innerWidth, h = window.innerHeight;
    // su telefono la barra del browser che si nasconde cambia solo l'altezza di poco: si ignora (niente salti mentre si scorre)
    if (touch && w === lastW && Math.abs(h - lastH) < 0.25 * lastH) { onScroll(); return; }
    lastW = w; lastH = h;
    layoutHero(); onScroll();
  });
  layoutHero();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutHero(); update(); });
  update();

  // Arrivo con #ancora (da un'altra pagina o da un link diretto): le scene cambiano l'altezza della pagina
  // dopo il caricamento, quindi si torna sull'ancora quando il layout è stabile.
  function goHash() {
    if (!location.hash || location.hash.length < 2) return;
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    var r = target.getBoundingClientRect();
    var y = r.top + window.pageYOffset;
    y += target.classList.contains("scene") ? Math.max(0, (r.height - window.innerHeight) * 0.14) : -64;
    window.scrollTo(0, Math.max(0, y));
  }
  if (location.hash) {
    setTimeout(goHash, 60);
    window.addEventListener("load", function () { setTimeout(goHash, 60); });
  }
})();
