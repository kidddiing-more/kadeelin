/* 小動畫與滑鼠特效：像素開場、深色區塊像素轉場、螢光筆掃過、果凍光球、滑鼠像素拖尾 */
(function () {
  if (window.__kdMotion) return;
  window.__kdMotion = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var GREENS = ['#C6FF00', '#B4F000', '#9BE000', '#7ED321', '#5BC236'];
  var introUntil = 0;
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  var css = [
    '.kd-intro{position:fixed;inset:0;z-index:9999;background:#fff;display:flex;align-items:center;justify-content:center;transition:opacity .45s ease .15s;cursor:pointer;}',
    '.kd-intro.out{opacity:0;pointer-events:none;}',
    '.kd-intro i{position:absolute;left:50%;top:50%;display:block;border:1px solid rgba(10,10,10,.08);transition:transform .7s cubic-bezier(.2,.8,.2,1),opacity .5s ease;}',
    '.kd-intro b{position:relative;font-family:Archivo,sans-serif;font-weight:900;font-size:clamp(28px,6vw,48px);letter-spacing:-.02em;color:#0a0a0a;opacity:0;transition:opacity .3s ease;}',
    '.kd-intro.word b{opacity:1;}',
    '.kd-wipe{position:absolute;left:0;right:0;top:0;z-index:5;pointer-events:none;display:grid;}',
    '.kd-wipe i{display:block;background:#C6FF00;transition:transform .45s cubic-bezier(.6,0,.3,1);transform-origin:center;}',
    '.kd-wipe.go i{transform:scale(0);}',
    '.kd-blob{position:absolute;z-index:0;flex:none;width:150px;height:150px;right:calc(50% + 118px);top:150px;pointer-events:none;will-change:transform;}',
    '.kd-blob::before{content:"";position:absolute;inset:-14px;background:rgba(200,200,194,.35);border-radius:inherit;animation:kdMorph 9s ease-in-out infinite reverse;border-radius:44% 56% 52% 48%/50% 44% 56% 50%;}',
    '.kd-blob::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 34% 30%,#F2FFB8 0,#C6FF00 26%,#5BD000 70%,#2FA800 100%);animation:kdMorph 7s ease-in-out infinite;border-radius:56% 44% 48% 52%/46% 58% 42% 54%;box-shadow:inset -14px -18px 40px rgba(0,80,0,.25);}',
    '.kd-plane{position:absolute;left:0;right:0;top:0;z-index:1;max-width:960px;margin:0 auto;padding:0 20px;box-sizing:border-box;pointer-events:none;}',
    '#top{padding-bottom:75px!important;}',
    '.kd-plane svg{display:block;width:58%;max-width:560px;height:auto;overflow:visible;}',
    '@media (max-width:860px){#top{padding-bottom:calc((100vw - 40px) * .27 + 5px)!important;}.kd-plane svg{width:100%;max-width:none;}}',
    '.badge-scene.kd-col{flex-direction:column;align-items:center;}',
    '.kd-face{position:absolute;inset:0;width:100%;height:100%;z-index:1;overflow:visible;}',
    '.kd-ghost .kd-face{opacity:0;}',
    '.kd-face .kd-eyes{transform-box:fill-box;transform-origin:center;animation:kdBlink 4.5s infinite;}',
    '.kd-face .kd-play{transform-box:fill-box;transform-origin:center;animation:kdWiggle 2.4s ease-in-out infinite;}',
    '@keyframes kdBlink{0%,92%,100%{transform:scaleY(1);}95%{transform:scaleY(.1);}}',
    '@keyframes kdWiggle{0%,100%{transform:rotate(-6deg);}50%{transform:rotate(8deg) scale(1.06);}}',
    '.kd-blob.kd-ghost::before,.kd-blob.kd-ghost::after{opacity:0;}',
    '.kd-ball{position:fixed;left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;z-index:40;pointer-events:none;will-change:transform;}',
    '.kd-ball::before,.kd-ball::after{content:"";position:absolute;border-radius:inherit;pointer-events:none;}',
    '.kd-ball{transition:opacity .25s;}','.kd-ball.kd-shy{opacity:.35;}',
    '.kd-ball::before{inset:-14px;background:rgba(200,200,194,.35);animation:kdMorph 9s ease-in-out infinite reverse;border-radius:44% 56% 52% 48%/50% 44% 56% 50%;}',
    '.kd-ball::after{inset:0;background:radial-gradient(circle at 34% 30%,#F2FFB8 0,#C6FF00 26%,#5BD000 70%,#2FA800 100%);animation:kdMorph 7s ease-in-out infinite;border-radius:56% 44% 48% 52%/46% 58% 42% 54%;box-shadow:inset -14px -18px 40px rgba(0,80,0,.25);}','@media (max-width:899px){.kd-blob{position:relative;right:auto;top:auto;margin-top:44px;}}','@media (max-width:640px){.kd-blob{width:120px;height:120px;margin-top:40px;}}',
    '@keyframes kdMorph{0%,100%{border-radius:56% 44% 48% 52%/46% 58% 42% 54%;transform:rotate(0) scale(1);}33%{border-radius:40% 60% 62% 38%/55% 40% 60% 45%;transform:rotate(25deg) scale(1.04);}66%{border-radius:62% 38% 40% 60%/38% 62% 46% 54%;transform:rotate(-18deg) scale(.97);}}',
    '.kd-hl{background-size:0% 100% !important;background-repeat:no-repeat !important;transition:background-size .9s cubic-bezier(.6,0,.2,1);}',
    '.kd-hl.on{background-size:100% 100% !important;}',
    '.kd-cursor{position:fixed;left:0;top:0;z-index:9998;width:26px;height:26px;margin:-13px 0 0 -13px;pointer-events:none;opacity:0;transition:opacity .3s,width .25s,height .25s,margin .25s;}',
    '.kd-cursor::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 35% 30%,#F2FFB8 0,#C6FF00 40%,#5BD000 100%);border:1.5px solid #0a0a0a;animation:kdMorph 3s ease-in-out infinite;border-radius:50%;}',
    '.kd-cursor.on{opacity:.9;}',
    '.kd-cursor.big{width:58px;height:58px;margin:-29px 0 0 -29px;opacity:.55;}',
    '.kd-px{position:fixed;left:0;top:0;z-index:9997;pointer-events:none;border:1px solid rgba(10,10,10,.15);will-change:transform,opacity;}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 1. 像素開場（每次造訪只播一次） ---------- */
  function intro() {
    var seen = false;
    try { seen = sessionStorage.getItem('kdIntro') === '1'; sessionStorage.setItem('kdIntro', '1'); } catch (e) {}
    if (seen || reduce) return;
    introUntil = Date.now() + 1500;
    var box = document.createElement('div');
    box.className = 'kd-intro';
    box.setAttribute('aria-hidden', 'true');
    var R = Math.min(innerWidth, innerHeight) * 0.24;
    var sq = [];
    for (var k = 0; k < 90; k++) {
      var i = document.createElement('i');
      var s = 8 + Math.random() * 12;
      var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * R;
      i.style.width = i.style.height = s + 'px';
      i.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
      i.style.background = pick(GREENS);
      i.style.transform = 'translate(' + (Math.cos(a) * r * 2.6) + 'px,' + (Math.sin(a) * r * 2.6) + 'px) scale(0)';
      i.dataset.x = Math.cos(a) * r; i.dataset.y = Math.sin(a) * r; i.dataset.a = a;
      box.appendChild(i); sq.push(i);
    }
    var word = document.createElement('b');
    word.textContent = 'Kadee Lin';
    box.appendChild(word);
    document.body.appendChild(box);
    var done = false;
    function finish() {
      if (done) return; done = true;
      sq.forEach(function (i) {
        var a = +i.dataset.a, d = R * 4 + Math.random() * R * 2;
        i.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(.4)';
        i.style.opacity = '0';
      });
      box.classList.add('out');
      setTimeout(function () { box.remove(); }, 1000);
    }
    box.addEventListener('click', finish);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sq.forEach(function (i, n) {
          i.style.transitionDelay = (n % 30) * 8 + 'ms';
          i.style.transform = 'translate(' + i.dataset.x + 'px,' + i.dataset.y + 'px) scale(1)';
        });
      });
    });
    setTimeout(function () {
      sq.forEach(function (i) { i.style.transitionDelay = '0ms'; i.style.opacity = '.18'; });
      box.classList.add('word');
    }, 750);
    setTimeout(finish, 1500);
  }

  /* ---------- 2. 深色區塊進場：螢光綠像素格一格格消失 ---------- */
  var wipeIO = null;
  function wipes() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var secs = [].slice.call(document.querySelectorAll('section, footer')).filter(function (el) {
      return !el.dataset.kdWipe && el.offsetParent !== null && getComputedStyle(el).backgroundColor === 'rgb(10, 10, 10)';
    });
    var io = wipeIO = wipeIO || new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var w = e.target.querySelector(':scope > .kd-wipe');
        if (!w) return;
        requestAnimationFrame(function () { w.classList.add('go'); });
        setTimeout(function () { w.remove(); }, 2200);
      });
    }, { rootMargin: '0px 0px -25% 0px', threshold: 0 });
    secs.forEach(function (sec) {
      sec.dataset.kdWipe = '1';
      // 已經在畫面上方（重新整理時停在中間）就不蓋
      if (sec.getBoundingClientRect().top < innerHeight * 0.85) return;
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      var W = sec.clientWidth, H = Math.min(sec.clientHeight, innerHeight);
      var cols = W < 640 ? 6 : 12;
      var size = W / cols;
      var rows = Math.max(1, Math.ceil(H / size));
      var w = document.createElement('div');
      w.className = 'kd-wipe';
      w.setAttribute('aria-hidden', 'true');
      w.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
      w.style.gridAutoRows = size + 'px';
      w.style.height = H + 'px';
      w.style.overflow = 'hidden';
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var i = document.createElement('i');
        i.style.transitionDelay = Math.round((r * 0.9 + c) * 45 + Math.random() * 120) + 'ms';
        w.appendChild(i);
      }
      sec.insertBefore(w, sec.firstChild);
      io.observe(sec);
    });
  }

  /* ---------- 3. 螢光筆效果：重點字的綠底從左掃到右 ---------- */
  var hlIO = null;
  function highlights() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = hlIO = hlIO || new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        setTimeout(function () { e.target.classList.add('on'); }, Math.max(250, introUntil - Date.now() + 200));
      });
    }, { threshold: 0.4 });
    (function scan() {
      var els = [].slice.call(document.querySelectorAll('[style*="gradient"], .case-result mark'));
      els.forEach(function (el) {
        if (el.classList.contains('kd-hl')) return;
        var s = el.getAttribute('style') || '';
        if (el.tagName !== 'MARK' && !/linear-gradient\(\s*transparent[^;]*(#C6FF00|rgb\(198, 255, 0\))/i.test(s)) return;
        if (el.tagName !== 'MARK' && el.offsetWidth > 700) return;
        el.classList.add('kd-hl');
        io.observe(el);
      });
    })();
  }


  /* 手繪感笑臉 + 播放鍵 */
  var faceN = 0;
  function face(el) {
    var id = 'kdRough' + (++faceN);
    el.insertAdjacentHTML('beforeend',
      '<svg class="kd-face" viewBox="0 0 150 150" aria-hidden="true"><defs><filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></defs>' +
      '<g filter="url(#' + id + ')" fill="none" stroke="#0a0a0a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
      '<g class="kd-eyes"><path d="M56,58 C57,63 57,68 56,73"/><path d="M90,57 C91,62 91,67 89,72"/></g>' +
      '<path d="M46,86 C55,104 86,110 102,84"/><path d="M42,83 L49,88" stroke-width="3"/><path d="M104,79 L100,88" stroke-width="3"/>' +
      '<g class="kd-play"><path d="M120,98 C134,97 143,109 142,122 C141,135 130,144 117,143 C104,142 96,132 97,119 C98,107 107,99 123,100" fill="#fff" stroke-width="3.5"/>' +
      '<path d="M112,109 C118,112 125,116 131,121 C125,125 118,129 113,132 C112,124 112,116 112,109 Z" fill="#0a0a0a" stroke-width="2.5"/></g>' +
      '</g></svg>');
  }

  /* ---------- 4. 首頁果凍光球（跟著滑鼠微微移動） ---------- */
  var blob = null;
  function heroBlob() {
    var scene = document.querySelector('.badge-scene');
    if (!scene || scene.querySelector('.kd-blob')) return;
    blob = document.createElement('div');
    blob.className = 'kd-blob';
    face(blob);
    scene.classList.add('kd-col');
    scene.appendChild(blob);
    if (ball) blob.classList.add('kd-ghost');
  }

  /* ---------- 4b. 光球捲動時離開首頁，飛到右側跟著一起跑 ---------- */
  var ball = null, px = 0, py = 0, mouseX = null, mouseY = 0;
  document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
  document.addEventListener('mouseleave', function () { mouseX = null; });
  function followBall() {
    if (reduce || ball) return;
    ball = document.createElement('div');
    ball.className = 'kd-ball';
    face(ball);
    document.body.appendChild(ball);
    if (blob) blob.classList.add('kd-ghost');
    var x = null, y = 0, s = 1, vx = 0, vy = 0, vs = 0, lastY = scrollY, vel = 0;
    function tick() {
      if (!blob || !blob.isConnected) heroBlob(); // 名牌區被重畫時把光球位置補回來
      var r = blob && blob.isConnected ? blob.getBoundingClientRect() : null;
      var docked = r && r.width && r.bottom > 70 && r.top < innerHeight;
      var tx, ty, ts, k = 0.09, d = 0.72;
      var dy = scrollY - lastY; lastY = scrollY;
      vel += (dy - vel) * 0.2;
      if (docked) {
        tx = r.left + r.width / 2 + px; ty = r.top + r.height / 2 + py; ts = r.width / 150;
        if (Math.abs(x - tx) + Math.abs(y - ty) < 40) { k = 0.35; d = 0.5; }
      } else {
        var small = innerWidth < 640;
        ts = small ? 0.36 : 0.5;
        tx = innerWidth - (small ? 34 : 70) + px * 0.4;
        ty = innerHeight * 0.58 + py * 0.4 - Math.max(-90, Math.min(90, vel * 4));
        // 滑鼠靠近時往上或往下閃開，不擋住右側的按鈕
        if (mouseX !== null && Math.abs(mouseX - tx) < 120 && Math.abs(mouseY - ty) < 140) {
          ty = mouseY < ty ? mouseY + 150 : mouseY - 150;
          if (ty > innerHeight - 50) ty = mouseY - 150;
          if (ty < 110) ty = mouseY + 150;
        }
      }
      var near = !docked && mouseX !== null && Math.hypot(mouseX - x, mouseY - y) < 90;
      ball.classList.toggle('kd-shy', near);
      if (x === null) { x = tx; y = ty; s = ts; }
      vx = (vx + (tx - x) * k) * d; vy = (vy + (ty - y) * k) * d; vs = (vs + (ts - s) * 0.08) * 0.75;
      x += vx; y += vy; s += vs;
      var sq = Math.max(-0.18, Math.min(0.18, (Math.abs(vy) - Math.abs(vx)) / 160));
      ball.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s * (1 - sq) + ',' + s * (1 + sq) + ')';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  /* ---------- 7. 紙飛機拉著虛線飛過（首頁與「關於我」之間） ---------- */
  var planeIO = null;
  function paperPlane() {
    var hero = document.getElementById('top');
    if (!hero) return;
    var old = document.querySelector('.kd-plane');
    if (old) { old._kdHero = hero; old._kdPos(); return; }
    var NS = 'http://www.w3.org/2000/svg';
    var box = document.createElement('div');
    box.className = 'kd-plane';
    box.setAttribute('aria-hidden', 'true');
    var D = 'M8,128 C90,132 150,60 230,70 C310,80 300,140 250,128 C200,116 240,40 340,36 C420,33 470,70 552,22';
    box.innerHTML =
      '<svg viewBox="0 0 560 150"><defs><mask id="kdPlaneMask" maskUnits="userSpaceOnUse">' +
      '<path class="kd-pm" d="' + D + '" fill="none" stroke="#fff" stroke-width="8"/></mask></defs>' +
      '<path d="' + D + '" fill="none" stroke="#0a0a0a" stroke-width="2" stroke-dasharray="7 7" stroke-linecap="round" mask="url(#kdPlaneMask)"/>' +
      '<g class="kd-pg"><path d="M0,0 L-30,-12 L-22,0 L-30,12 Z" fill="#fff" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M0,0 L-22,0" stroke="#0a0a0a" stroke-width="1.5"/><path d="M-22,0 L-27,6" stroke="#0a0a0a" stroke-width="1.5"/></g></svg>';
    // 放在 React 畫面樹之外（插進去會讓頁面上的展開按鈕失效），再對齊到首頁底部
    document.body.appendChild(box);
    box._kdHero = hero;
    box._kdPos = function () {
      var h = box._kdHero.getBoundingClientRect();
      box.style.top = (h.bottom + scrollY - box.offsetHeight) + 'px';
    };
    box._kdPos();
    addEventListener('resize', box._kdPos);
    addEventListener('load', box._kdPos);
    if ('ResizeObserver' in window) new ResizeObserver(box._kdPos).observe(document.body);
    var mp = box.querySelector('.kd-pm'), g = box.querySelector('.kd-pg');
    var L = mp.getTotalLength();
    mp.style.strokeDasharray = L;
    function place(k) {
      var l = L * k, p = mp.getPointAtLength(l), q = mp.getPointAtLength(Math.min(L, l + 1)), r = mp.getPointAtLength(Math.max(0, l - 1));
      var ang = Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI;
      g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') rotate(' + ang + ')');
      mp.style.strokeDashoffset = L * (1 - k);
      g.style.opacity = k > 0.01 ? 1 : 0;
    }
    if (reduce || !('IntersectionObserver' in window)) { place(1); return; }
    place(0);
    function fly() {
      var t0 = performance.now(), dur = 2600;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur);
        place(k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    planeIO = planeIO || new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { planeIO.unobserve(e.target); setTimeout(e.target._kdFly, Math.max(200, introUntil - Date.now() + 200)); } });
    }, { threshold: 0.6 });
    box._kdFly = fly;
    planeIO.observe(box);
  }

  /* ---------- 5. 滑鼠：果凍游標 + 像素拖尾；手機：點擊噴出像素 ---------- */
  var live = 0;
  function pixel(x, y, burst) {
    if (live > 60) return;
    live++;
    var p = document.createElement('i');
    var s = burst ? 6 + Math.random() * 9 : 5 + Math.random() * 8;
    p.className = 'kd-px';
    p.style.width = p.style.height = s + 'px';
    p.style.background = pick(GREENS);
    document.body.appendChild(p);
    var a = Math.random() * Math.PI * 2;
    var d = burst ? 30 + Math.random() * 60 : 8 + Math.random() * 22;
    var dx = Math.cos(a) * d, dy = Math.sin(a) * d + (burst ? 0 : 18);
    var t0 = performance.now(), dur = burst ? 650 : 750;
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      p.style.transform = 'translate(' + (x - s / 2 + dx * e) + 'px,' + (y - s / 2 + dy * e) + 'px) rotate(' + (e * 90) + 'deg) scale(' + (1 - k * .6) + ')';
      p.style.opacity = String(1 - k);
      if (k < 1) requestAnimationFrame(step); else { p.remove(); live--; }
    })(t0);
  }

  function pointer() {
    if (reduce) return;
    if (!finePointer) {
      document.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        for (var n = 0; n < 10; n++) pixel(e.clientX, e.clientY, true);
      }, { passive: true });
      return;
    }
    var cur = document.createElement('div');
    cur.className = 'kd-cursor';
    cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    var mx = -100, my = -100, cx = -100, cy = -100, lx = null, ly = null, moving = false;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cur.classList.add('on');
      if (lx === null) { lx = mx; ly = my; cx = mx; cy = my; }
      var dist = Math.hypot(mx - lx, my - ly);
      if (dist > 26) { pixel(mx, my, false); lx = mx; ly = my; }
      var t = e.target.closest && e.target.closest('a, button, [role="button"], .case-card');
      cur.classList.toggle('big', !!t);
      if (!moving) { moving = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    document.addEventListener('mousedown', function (e) { for (var n = 0; n < 8; n++) pixel(e.clientX, e.clientY, true); });
    function loop() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (blob) {
        var bx = (mx / innerWidth - 0.5) * 36, by = (my / innerHeight - 0.5) * 36;
        if (ball) { px = bx; py = by; } else blob.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
      }
      if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) requestAnimationFrame(loop); else moving = false;
    }
  }

  // 網站內容由 DC 元件動態畫出來（會整塊替換 DOM），所以每次內容變動後都重新補上效果
  var fadeIO = null;
  function fades() {
    if (reduce || !('IntersectionObserver' in window)) return;
    fadeIO = fadeIO || new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        fadeIO.unobserve(e.target);
        e.target.classList.add('visible');
      });
    }, { threshold: 0.08 });
    [].forEach.call(document.querySelectorAll('header[data-screen-label], section[data-screen-label]'), function (el) {
      if (el.dataset.kdFade) return;
      el.dataset.kdFade = '1';
      if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
      el.classList.add('fade-up');
      fadeIO.observe(el);
    });
  }

  function ensure() {
    fades();
    heroBlob();
    followBall();
    paperPlane();
    wipes();
    highlights();
  }
  function start() {
    intro();
    pointer();
    ensure();
    var timer = null;
    var mine = function (n) { return n.nodeType === 1 && /(^|\s)kd-/.test(n.className || ''); };
    new MutationObserver(function (list) {
      var other = list.some(function (m) {
        var tg = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (tg && tg.closest && tg.closest('.kd-blob, .kd-wipe, .kd-plane')) return false;
        return [].some.call(m.addedNodes, function (n) { return !mine(n); }) ||
               [].some.call(m.removedNodes, function (n) { return !mine(n); });
      });
      if (!other) return;
      clearTimeout(timer);
      timer = setTimeout(ensure, 150);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
