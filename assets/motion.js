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
    '.kd-blob{position:absolute;z-index:0;width:300px;height:300px;left:50%;top:150px;margin:-150px 0 0 -150px;pointer-events:none;will-change:transform;}',
    '.kd-blob::before{content:"";position:absolute;inset:-22px;background:rgba(200,200,194,.35);border-radius:inherit;animation:kdMorph 9s ease-in-out infinite reverse;border-radius:44% 56% 52% 48%/50% 44% 56% 50%;}',
    '.kd-blob::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 34% 30%,#F2FFB8 0,#C6FF00 26%,#5BD000 70%,#2FA800 100%);animation:kdMorph 7s ease-in-out infinite;border-radius:56% 44% 48% 52%/46% 58% 42% 54%;box-shadow:inset -14px -18px 40px rgba(0,80,0,.25);}',
    '.kd-player{position:relative;z-index:4;width:250px;margin-top:22px;background:#fff;border:2px solid #0a0a0a;border-radius:16px;box-shadow:4px 4px 0 #0a0a0a;padding:12px 14px 12px 12px;display:flex;gap:12px;align-items:center;font-family:Archivo,"Noto Sans TC",sans-serif;color:#0a0a0a;}',
    '.kd-vinyl{flex:none;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle,#C6FF00 0 17%,#0a0a0a 18% 21%,transparent 22%),repeating-radial-gradient(circle,#0a0a0a 0 2px,#262624 2px 3px);box-shadow:0 0 0 2px #0a0a0a;position:relative;animation:kdSpin 3.2s linear infinite;animation-play-state:paused;}',
    '.kd-vinyl::before{content:"";position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#0a0a0a;}',
    '.kd-vinyl::after{content:"";position:absolute;inset:6px;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,.22),transparent 45%);}',
    '.kd-player.playing .kd-vinyl{animation-play-state:running;}',
    '@keyframes kdSpin{to{transform:rotate(360deg);}}',
    '.kd-pl-main{flex:1;min-width:0;}',
    '.kd-pl-t{font-size:13px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.kd-pl-a{font-size:9px;font-weight:700;letter-spacing:.12em;color:#5a5a52;margin-top:1px;}',
    '.kd-pl-bar{height:4px;background:#e4e4de;border-radius:2px;margin:8px 0 3px;overflow:hidden;}',
    '.kd-pl-bar b{display:block;height:100%;width:0;background:#0a0a0a;border-right:3px solid #C6FF00;}',
    '.kd-pl-time{display:flex;justify-content:space-between;font-size:8px;font-weight:700;color:#5a5a52;letter-spacing:.05em;}',
    '.kd-pl-ctl{display:flex;align-items:center;gap:8px;margin-top:6px;}',
    '.kd-pl-ctl button{border:2px solid #0a0a0a;background:#fff;border-radius:50%;width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s,box-shadow .12s;}',
    '.kd-pl-ctl button svg{width:12px;height:12px;display:block;}',
    '.kd-pl-ctl .kd-pp{width:34px;height:34px;background:#C6FF00;box-shadow:2px 2px 0 #0a0a0a;}',
    '.kd-pl-ctl button:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 #0a0a0a;}',
    '.kd-pl-ctl button:focus-visible{outline:2px solid #0a0a0a;outline-offset:2px;}',
    '.kd-pl-go{margin-left:auto;font-size:10px;font-weight:700;color:#0a0a0a;text-decoration:none;border-bottom:2px solid #C6FF00;white-space:nowrap;}',
    '.badge-scene.kd-has-player{flex-direction:column;align-items:center;}',
    '@media (max-width:640px){.kd-blob{width:230px;height:230px;margin:-115px 0 0 -115px;top:125px;}}',
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

  /* ---------- 4. 首頁果凍光球（跟著滑鼠微微移動） ---------- */
  var blob = null;
  function heroBlob() {
    var scene = document.querySelector('.badge-scene');
    if (!scene || scene.querySelector('.kd-blob')) return;
    blob = document.createElement('div');
    blob.className = 'kd-blob';
    scene.insertBefore(blob, scene.firstChild);
  }

  /* ---------- 6. 名牌下方的迷你播放器：轉動黑膠、進度條、上一首／下一首 ---------- */
  var TRACKS = [
    { t: 'Music Marketing', d: 214 },
    { t: 'Campaign Strategy', d: 187 },
    { t: 'Social Content Strategy', d: 236 },
    { t: 'Music Live and Alive', d: 199 }
  ];
  var pl = { i: 0, el: 0, playing: !reduce, timer: null };
  var ICON = {
    prev: '<svg viewBox="0 0 24 24"><path d="M6 4h3v16H6zM21 4v16L10 12z" fill="#0a0a0a"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M15 4h3v16h-3zM3 4v16l11-8z" fill="#0a0a0a"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M6 3.5v17L20 12z" fill="#0a0a0a"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M5 4h5v16H5zM14 4h5v16h-5z" fill="#0a0a0a"/></svg>'
  };
  function fmt(n) { n = Math.floor(n); return Math.floor(n / 60) + ':' + ('0' + n % 60).slice(-2); }
  function miniPlayer() {
    var scene = document.querySelector('.badge-scene');
    if (!scene || scene.querySelector('.kd-player')) return;
    scene.classList.add('kd-has-player');
    var box = document.createElement('div');
    box.className = 'kd-player';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', '迷你播放器');
    box.innerHTML =
      '<div class="kd-vinyl" aria-hidden="true"></div>' +
      '<div class="kd-pl-main">' +
        '<div class="kd-pl-t" aria-live="polite"></div>' +
        '<div class="kd-pl-a">KADEE LIN</div>' +
        '<div class="kd-pl-bar" aria-hidden="true"><b></b></div>' +
        '<div class="kd-pl-time" aria-hidden="true"><span class="kd-pl-now">0:00</span><span class="kd-pl-dur"></span></div>' +
        '<div class="kd-pl-ctl">' +
          '<button type="button" class="kd-prev" aria-label="上一首">' + ICON.prev + '</button>' +
          '<button type="button" class="kd-pp"></button>' +
          '<button type="button" class="kd-next" aria-label="下一首">' + ICON.next + '</button>' +
          '<a class="kd-pl-go" href="#playlist">聽歌單 ↓</a>' +
        '</div>' +
      '</div>';
    scene.appendChild(box);
    var $ = function (c) { return box.querySelector(c); };
    function render() {
      var tr = TRACKS[pl.i];
      $('.kd-pl-t').textContent = tr.t;
      $('.kd-pl-dur').textContent = fmt(tr.d);
      $('.kd-pl-now').textContent = fmt(pl.el);
      $('.kd-pl-bar b').style.width = (pl.el / tr.d * 100) + '%';
      box.classList.toggle('playing', pl.playing);
      $('.kd-pp').innerHTML = pl.playing ? ICON.pause : ICON.play;
      $('.kd-pp').setAttribute('aria-label', pl.playing ? '暫停' : '播放');
    }
    function go(step) { pl.i = (pl.i + step + TRACKS.length) % TRACKS.length; pl.el = 0; render(); }
    $('.kd-prev').addEventListener('click', function () { go(-1); });
    $('.kd-next').addEventListener('click', function () { go(1); });
    $('.kd-pp').addEventListener('click', function () { pl.playing = !pl.playing; render(); });
    clearInterval(pl.timer);
    pl.timer = setInterval(function () {
      if (!pl.playing || !box.isConnected) return;
      pl.el += 1;
      if (pl.el >= TRACKS[pl.i].d) go(1); else render();
    }, 1000);
    render();
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
        blob.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
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
    miniPlayer();
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
        if (tg && tg.closest && tg.closest('.kd-player, .kd-blob, .kd-wipe')) return false;
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
