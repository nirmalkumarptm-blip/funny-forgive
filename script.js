/* =====================================================================
   Priya × Nirmal — Oru Chinna Sorry ❤️
   Vanilla JavaScript. Backend / API / internet venaam.
   ===================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rand = (a, b) => Math.random() * (b - a) + a;
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const TAU = Math.PI * 2;
  const norm = (x) => ((x % TAU) + TAU) % TAU;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ------------------------------------------------------------------
     Game list + progress (localStorage-la save aagum; illaina memory-la)
  ------------------------------------------------------------------ */
  const GAMES = [
    { id: 1, icon: '🌡️', title: 'Kovam Meter Challenge', desc: 'Un kovam evlo-nu meter-la kaattu' },
    { id: 2, icon: '🏃', title: 'Nirmal-a Catch Pannu', desc: 'Odura Nirmal-a 5 dhadava pidi' },
    { id: 3, icon: '🔐', title: 'Love Lock — Secret Code', desc: 'Secret code guess pannu' },
    { id: 4, icon: '🚦', title: 'Red Flag-aa? Green Flag-aa?', desc: 'Relationship quiz, no blame' },
    { id: 5, icon: '🎟️', title: 'Scratch & Reveal', desc: '6 surprise cards open pannu' },
    { id: 6, icon: '🥊', title: 'Priya vs Nirmal — Love Battle', desc: 'Funny + sincere quiz battle' },
    { id: 7, icon: '🎡', title: 'Spin the Love Wheel', desc: 'Wheel-a spin panni reward win pannu' },
    { id: 8, icon: '🔎', title: 'Find My Hidden Love', desc: '5 olinja hearts-a kandupidi' },
    { id: 9, icon: '🃏', title: 'Memory Match Challenge', desc: 'Pair pair-a match pannu' },
    { id: 10, icon: '🧸', title: 'Win a Hug — Claw Machine', desc: 'Grand finale! Jackpot-a pidi' }
  ];
  const TOTAL = GAMES.length;
  const STORE_KEY = 'priya-nirmal-sorry-progress-v1';

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL) : [];
    } catch (err) {
      return [];
    }
  }
  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(completed)));
    } catch (err) {
      /* storage block aanaalum game continue aagum */
    }
  }
  const completed = new Set(loadProgress());

  /* ------------------------------------------------------------------
     Toast + Confetti + Background particles
  ------------------------------------------------------------------ */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  const confettiLayer = $('#confetti');
  const CONFETTI_ICONS = ['💖', '💗', '💕', '✨', '🌸', '💜', '❤️', '🌷'];
  function burst(count = 34) {
    const n = reduceMotion ? Math.min(count, 10) : count;
    for (let i = 0; i < n; i++) {
      if (confettiLayer.childElementCount > 160) break;
      const s = document.createElement('span');
      s.className = 'confetti-piece';
      s.textContent = pick(CONFETTI_ICONS);
      s.style.left = rand(2, 98) + '%';
      s.style.fontSize = rand(16, 34) + 'px';
      s.style.setProperty('--dx', rand(-90, 90) + 'px');
      s.style.setProperty('--rot', rand(-360, 360) + 'deg');
      s.style.animationDuration = rand(2, 3.6) + 's';
      s.style.animationDelay = rand(0, 0.5) + 's';
      s.addEventListener('animationend', () => s.remove());
      confettiLayer.appendChild(s);
    }
  }

  (function buildBackground() {
    const stars = $('#stars');
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('span');
      s.style.left = rand(0, 100) + '%';
      s.style.top = rand(0, 100) + '%';
      const size = rand(1.5, 3.2);
      s.style.width = s.style.height = size + 'px';
      s.style.animationDelay = rand(0, 5) + 's';
      s.style.animationDuration = rand(2.5, 6) + 's';
      stars.appendChild(s);
    }
    const hearts = $('#hearts');
    const icons = ['💗', '💖', '💕', '🤍', '💜'];
    for (let i = 0; i < 15; i++) {
      const h = document.createElement('span');
      h.textContent = pick(icons);
      h.style.left = rand(0, 96) + '%';
      h.style.fontSize = rand(14, 34) + 'px';
      h.style.setProperty('--sway', rand(-40, 40) + 'px');
      h.style.animationDuration = rand(11, 22) + 's';
      h.style.animationDelay = -rand(0, 20) + 's';
      hearts.appendChild(h);
    }
  })();

  /* ------------------------------------------------------------------
     Splash intro
  ------------------------------------------------------------------ */
  (function splash() {
    const el = $('#splash');
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      el.classList.add('hide');
      document.body.classList.remove('intro');
      setTimeout(() => el.remove(), 800);
    }
    el.addEventListener('click', close);
    document.addEventListener('keydown', close, { once: true });
    setTimeout(close, reduceMotion ? 300 : 2600);
  })();

  /* ------------------------------------------------------------------
     Music — romantic-music.mp3 irundha adhai play pannum,
     illaina Web Audio-la generate aana soft melody
  ------------------------------------------------------------------ */
  const music = (() => {
    const audio = new Audio('mysong.mp3');
    audio.loop = true;
    audio.volume = 0.8;
    audio.preload = 'none';

    let fileBroken = false;
    let token = 0;
    let ctx = null;
    let chain = [];
    let timer = null;
    let nextBar = 0;
    let barIndex = 0;
    const oscillators = new Set();

    const BAR = 3.2;
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
    // C  G  Am  Em  F  C  F  G
    const CHORDS = [
      [48, 52, 55], [43, 47, 50], [45, 48, 52], [40, 43, 47],
      [41, 45, 48], [48, 52, 55], [41, 45, 48], [43, 47, 50]
    ];
    const MELODY = [[76, 79], [74, 71], [72, 76], [71, 67], [69, 72], [76, 74], [72, 69], [71, 74]];

    function prepareContext() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }

    function tone(freq, start, dur, type, peak, attack) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(peak, start + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g);
      g.connect(chain[0]);
      osc.start(start);
      osc.stop(start + dur + 0.05);
      oscillators.add(osc);
      osc.onended = () => oscillators.delete(osc);
    }

    function playBar(t, index) {
      const i = index % CHORDS.length;
      const chord = CHORDS[i];
      chord.forEach((m) => tone(mtof(m), t, BAR + 0.5, 'triangle', 0.09, 0.5));
      const root = chord[0] + 12;
      const arp = [root, chord[1] + 12, chord[2] + 12, root + 12, chord[2] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12];
      arp.forEach((m, k) => tone(mtof(m), t + k * (BAR / 8), 0.7, 'sine', 0.07, 0.02));
      MELODY[i].forEach((m, k) => tone(mtof(m), t + k * (BAR / 2), 1.5, 'sine', 0.09, 0.06));
    }

    function scheduleAhead() {
      if (!ctx || !chain.length) return;
      while (nextBar < ctx.currentTime + 4) {
        playBar(nextBar, barIndex);
        nextBar += BAR;
        barIndex += 1;
      }
    }

    function startSynth() {
      if (!prepareContext()) return false;
      stopSynth();
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.36;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      const wet = ctx.createGain();
      wet.gain.value = 0.28;
      master.connect(lp);
      lp.connect(ctx.destination);
      lp.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(ctx.destination);
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5);
      chain = [master, lp, delay, fb, wet];
      barIndex = 0;
      nextBar = ctx.currentTime + 0.1;
      scheduleAhead();
      timer = setInterval(scheduleAhead, 800);
      return true;
    }

    function stopSynth() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (ctx && chain.length) {
        const oldChain = chain;
        const oldOsc = Array.from(oscillators);
        chain = [];
        oscillators.clear();
        try {
          oldChain[0].gain.cancelScheduledValues(ctx.currentTime);
          oldChain[0].gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
        } catch (err) { /* ignore */ }
        setTimeout(() => {
          oldOsc.forEach((o) => { try { o.stop(); } catch (err) { /* ignore */ } });
          oldChain.forEach((n) => { try { n.disconnect(); } catch (err) { /* ignore */ } });
        }, 400);
      }
    }

    async function start() {
      const my = ++token;
      const ctxOk = prepareContext(); // click gesture-kulla create pannanum
      if (!fileBroken) {
        try {
          await audio.play();
          if (my !== token) {
            audio.pause();
            return false;
          }
          return true;
        } catch (err) {
          if (my !== token) return false;
          if (err && err.name === 'NotAllowedError') return false;
          fileBroken = true;
        }
      }
      if (my !== token) return false;
      if (!ctxOk) return false;
      return startSynth();
    }

    function stop() {
      token += 1;
      audio.pause();
      stopSynth();
    }

    return { start, stop };
  })();

  (function setupMusicButton() {
    const btn = $('#musicBtn');
    let on = false;
    function paint() {
      btn.textContent = on ? '♫ Music: On' : '♫ Music: Off';
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('is-on', on);
    }
    btn.addEventListener('click', async () => {
      if (on) {
        on = false;
        music.stop();
        paint();
        return;
      }
      on = true;
      paint();
      const ok = await music.start();
      if (!ok && on) {
        on = false;
        paint();
        toast('Indha browser-la music start aagala. Thirumba try pannu, please.');
      }
    });
    paint();
  })();

  /* ------------------------------------------------------------------
     Navigation (hash routing — Android back button-um work aagum)
  ------------------------------------------------------------------ */
  const gameControllers = {};
  let activeGame = null;
  let navBusy = false;

  function updateProgressUI() {
    const done = completed.size;
    const pct = Math.round((done / TOTAL) * 100);
    $('#progressText').textContent = `${done}/${TOTAL} games mudichachu`;
    $('#progressPct').textContent = pct + '%';
    $('#progressFill').style.width = pct + '%';
    const bar = $('#progressBar');
    bar.setAttribute('aria-valuenow', String(done));
    bar.setAttribute('aria-valuetext', `${done} / ${TOTAL} games mudinjadhu`);

    const tile = $('#letterTile');
    const unlocked = done === TOTAL;
    tile.disabled = !unlocked;
    tile.setAttribute('aria-disabled', String(!unlocked));
    tile.classList.toggle('is-open', unlocked);
    tile.dataset.go = unlocked ? 'letter' : '';
    $('.letter-ico', tile).textContent = unlocked ? '💌' : '🔒';
    $('#letterTileDesc').textContent = unlocked
      ? 'Unlock aayiduchu! Thotta padikka tap pannu.'
      : `Innum ${TOTAL - done} game${TOTAL - done === 1 ? '' : 's'} mudikkanum.`;
    updateNavLabels();
  }

  function renderDashboard() {
    const grid = $('#gameGrid');
    grid.textContent = '';
    GAMES.forEach((g) => {
      const done = completed.has(g.id);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'game-tile' + (done ? ' is-done' : '');
      b.dataset.go = 'game-' + g.id;
      b.setAttribute('aria-label', `Game ${g.id}: ${g.title}. ${done ? 'Mudinjidhu' : 'Innum aadala'}`);
      b.innerHTML =
        `<span class="tile-num" aria-hidden="true">${done ? '✔' : g.id}</span>` +
        `<span class="tile-body"><span class="tile-title">${g.title} <span aria-hidden="true">${g.icon}</span></span>` +
        `<span class="tile-desc">${g.desc}</span></span>` +
        `<span class="tile-status" aria-hidden="true">${done ? 'Mudinjidhu' : 'Aadu ▶'}</span>`;
      grid.appendChild(b);
    });
    updateProgressUI();
  }

  function nextTarget(id) {
    if (completed.size === TOTAL) return id < TOTAL ? 'game-' + (id + 1) : 'letter';
    if (id < TOTAL) return 'game-' + (id + 1);
    const candidate = GAMES.find((g) => g.id !== id && !completed.has(g.id));
    return candidate ? 'game-' + candidate.id : 'games';
  }
  function nextLabel(id) {
    if (id < TOTAL) return `Adutha game (${id + 1}) ▶`;
    return completed.size === TOTAL ? '💌 Letter padikka' : 'Baaki games ▶';
  }
  function updateNavLabels() {
    $$('.game-view').forEach((sec) => {
      const id = Number(sec.dataset.game);
      const btn = $('[data-nav="next"]', sec);
      if (btn) btn.textContent = nextLabel(id);
    });
  }

  function showView(name) {
    $$('.view').forEach((v) => {
      v.hidden = v.dataset.view !== name;
      v.classList.remove('leaving');
    });
    const view = $(`.view[data-view="${name}"]`);
    const heading = $('[tabindex="-1"]', view);
    window.scrollTo(0, 0);
    if (heading) heading.focus({ preventScroll: true });
  }

  function route() {
    const raw = (location.hash || '#home').slice(1);
    let name = 'home';
    if (raw === 'games' || raw === 'letter' || raw === 'home') {
      name = raw;
    } else {
      const m = /^game-(\d+)$/.exec(raw);
      if (m && Number(m[1]) >= 1 && Number(m[1]) <= TOTAL) name = raw;
    }
    if (name === 'letter' && completed.size < TOTAL) {
      toast(`Letter unlock aaga innum ${TOTAL - completed.size} game mudikkanum, Priya 💌`);
      history.replaceState(null, '', '#games');
      name = 'games';
    }

    if (activeGame !== null) {
      gameControllers[activeGame].stop();
      activeGame = null;
    }

    showView(name);

    if (name === 'games') renderDashboard();
    if (name.startsWith('game-')) {
      const id = Number(name.slice(5));
      activeGame = id;
      resetChrome(id);
      gameControllers[id].reset();
    }
    if (name === 'letter') enterLetter();
  }

  function navigate(target) {
    if (navBusy) return;
    const hash = '#' + target;
    if (location.hash === hash || (!location.hash && target === 'home')) {
      route();
      return;
    }
    const current = $('.view:not([hidden])');
    if (!current || reduceMotion) {
      location.hash = target;
      return;
    }
    navBusy = true;
    current.classList.add('leaving');
    setTimeout(() => {
      navBusy = false;
      location.hash = target;
    }, 340);
  }

  window.addEventListener('hashchange', route);

  document.addEventListener('click', (e) => {
    const goEl = e.target.closest('[data-go]');
    if (goEl && !goEl.disabled && goEl.dataset.go) {
      navigate(goEl.dataset.go);
      return;
    }
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      const sec = navEl.closest('[data-game]');
      const id = Number(sec.dataset.game);
      switch (navEl.dataset.nav) {
        case 'games': navigate('games'); break;
        case 'home': navigate('home'); break;
        case 'replay': replay(id); break;
        case 'next': navigate(nextTarget(id)); break;
        default: break;
      }
    }
  });

  /* Game chrome: success banner + navigation buttons (ellaa games-kum common) */
  function injectChrome() {
    $$('.game-view').forEach((sec) => {
      const banner = document.createElement('div');
      banner.className = 'success glass';
      banner.hidden = true;
      banner.setAttribute('role', 'status');
      banner.innerHTML =
        '<div class="success-emoji" aria-hidden="true">🎉</div>' +
        '<p class="success-title"></p><p class="success-count"></p>' +
        '<button type="button" class="btn btn-primary letter-cta" data-go="letter" hidden>💌 Letter padikka</button>';
      const nav = document.createElement('nav');
      nav.className = 'game-nav';
      nav.setAttribute('aria-label', 'Game navigation');
      nav.innerHTML =
        '<button type="button" class="btn btn-ghost" data-nav="games">◀ Games list</button>' +
        '<button type="button" class="btn btn-ghost" data-nav="replay">🔁 Replay</button>' +
        '<button type="button" class="btn btn-ghost" data-nav="home">🏠 Home</button>' +
        '<button type="button" class="btn btn-primary" data-nav="next"></button>';
      sec.appendChild(banner);
      sec.appendChild(nav);
    });
    updateNavLabels();
  }

  function resetChrome(id) {
    const sec = $('#game-' + id);
    $('.success', sec).hidden = true;
  }

  function completeGame(id) {
    const first = !completed.has(id);
    completed.add(id);
    saveProgress();
    updateProgressUI();
    const sec = $('#game-' + id);
    const banner = $('.success', sec);
    $('.success-title', banner).textContent = first
      ? `Game ${id} mudichachu! 🎉`
      : `Game ${id} thirumba mudichachu! 💖`;
    const all = completed.size === TOTAL;
    $('.success-count', banner).textContent = all
      ? `${TOTAL}/${TOTAL} games mudichachu! Nirmal-oda letter unlock aayiduchu 💌`
      : `${completed.size}/${TOTAL} games mudichachu`;
    $('.letter-cta', banner).hidden = !all;
    banner.hidden = false;
    banner.classList.remove('pop');
    void banner.offsetWidth;
    banner.classList.add('pop');
    burst(all ? 70 : 38);
    if (all && first) toast('10/10! Letter unlock aayiduchu 💌');
    setTimeout(() => banner.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }), 250);
  }

  function replay(id) {
    resetChrome(id);
    gameControllers[id].stop();
    gameControllers[id].reset();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* Reset progress (2-step confirm — popup venaam) */
  (function setupReset() {
    const btn = $('#resetBtn');
    let armed = false;
    let t = null;
    btn.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        btn.textContent = 'Sure-ah? Thirumba tap pannu';
        t = setTimeout(() => { armed = false; btn.textContent = '↺ Progress reset pannu'; }, 3500);
        return;
      }
      clearTimeout(t);
      armed = false;
      btn.textContent = '↺ Progress reset pannu';
      resetAllProgress();
      toast('Progress reset aayiduchu. Fresh-ah aarambikkalaam! 💗');
    });
  })();

  function resetAllProgress() {
    completed.clear();
    saveProgress();
    renderDashboard();
  }

  /* ------------------------------------------------------------------
     GAME 1 — Kovam Meter
  ------------------------------------------------------------------ */
  gameControllers[1] = (() => {
    const sec = $('#game-1');
    const slider = $('#g1-slider');
    const valueEl = $('#g1-value');
    const emoji = $('#g1-emoji');
    const arc = $('#g1-arc');
    const needle = $('#g1-needle');
    const out = $('#g1-out');
    const msg = $('#g1-msg');
    const ARC_LEN = Math.PI * 80;
    arc.style.strokeDasharray = String(ARC_LEN);

    const STOPS = [[0, [214, 165, 255]], [50, [255, 111, 174]], [100, [255, 45, 79]]];
    function colorFor(v) {
      for (let i = 0; i < STOPS.length - 1; i++) {
        const [a, ca] = STOPS[i];
        const [b, cb] = STOPS[i + 1];
        if (v <= b) {
          const t = (v - a) / (b - a);
          const c = ca.map((x, k) => Math.round(x + (cb[k] - x) * t));
          return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        }
      }
      return 'rgb(255, 45, 79)';
    }
    function emojiFor(v) {
      if (v <= 10) return '😊';
      if (v <= 25) return '🙂';
      if (v <= 45) return '😐';
      if (v <= 60) return '😠';
      if (v <= 80) return '😡';
      return '🤬';
    }
    function messageFor(v) {
      if (v <= 25) return 'Awww, kovam koranjiducha? Nirmal-ku konjam nimmadhi!';
      if (v <= 60) return 'Warning! Nirmal-oda sorry department ready aagudhu!';
      return 'AYYO! Nirmal emergency sorry mode-ku poittaan! 🚨';
    }
    function render() {
      const v = Number(slider.value);
      valueEl.textContent = String(v);
      emoji.textContent = emojiFor(v);
      emoji.classList.toggle('shake', v > 60);
      arc.style.strokeDashoffset = String(ARC_LEN * (1 - v / 100));
      arc.style.stroke = colorFor(v);
      needle.setAttribute('transform', `rotate(${-90 + v * 1.8} 100 100)`);
      slider.style.setProperty('--v', v);
      slider.setAttribute('aria-valuetext', `${v} percent kovam`);
    }
    slider.addEventListener('input', () => {
      render();
      out.hidden = true;
    });
    $('#g1-result').addEventListener('click', () => {
      const v = Number(slider.value);
      msg.textContent = messageFor(v);
      out.hidden = false;
      completeGame(1);
    });
    return {
      reset() { slider.value = '50'; out.hidden = true; render(); },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 2 — Nirmal-a Catch Pannu
  ------------------------------------------------------------------ */
  gameControllers[2] = (() => {
    const GOAL = 5;
    const arena = $('#g2-arena');
    const btn = $('#g2-btn');
    const countEl = $('#g2-count');
    const heartsEl = $('#g2-hearts');
    const bubble = $('#g2-bubble');
    const out = $('#g2-out');
    const DODGE_LINES = [
      'Nirmal: “Haha, miss aayiduchu!” 😝',
      'Nirmal: “Kitta vandhutta… aana escape!” 🏃‍♂️💨',
      'Nirmal: “Slow, Priya! Slow!” 😜',
      'Nirmal: “Yaaru pidikka poraa? Naan fast!” 😎'
    ];
    let caught = 0;
    let dodgesLeft = 0;
    let lastDodge = 0;
    let done = false;

    function say(text) { bubble.textContent = text; }
    function paint() {
      countEl.textContent = String(caught);
      heartsEl.textContent = '❤️'.repeat(caught) + '🤍'.repeat(GOAL - caught);
    }
    function place() {
      const aw = arena.clientWidth;
      const ah = arena.clientHeight;
      const bw = btn.offsetWidth;
      const bh = btn.offsetHeight;
      const maxX = Math.max(0, aw - bw);
      const maxY = Math.max(0, ah - bh);
      const cx = btn.offsetLeft;
      const cy = btn.offsetTop;
      let x = 0;
      let y = 0;
      for (let i = 0; i < 14; i++) {
        x = rand(0, maxX);
        y = rand(0, maxY);
        if (Math.hypot(x - cx, y - cy) > Math.min(110, maxX / 2)) break;
      }
      btn.style.left = Math.round(x) + 'px';
      btn.style.top = Math.round(y) + 'px';
    }
    function clamp() {
      const maxX = Math.max(0, arena.clientWidth - btn.offsetWidth);
      const maxY = Math.max(0, arena.clientHeight - btn.offsetHeight);
      btn.style.left = Math.min(maxX, Math.max(0, btn.offsetLeft)) + 'px';
      btn.style.top = Math.min(maxY, Math.max(0, btn.offsetTop)) + 'px';
    }
    function popAnim() {
      btn.classList.remove('pop');
      void btn.offsetWidth;
      btn.classList.add('pop');
    }
    function dodge() {
      if (done) return;
      dodgesLeft = Math.max(0, dodgesLeft - 1);
      lastDodge = performance.now();
      place();
      popAnim();
      say(dodgesLeft === 0 ? 'Nirmal: “Hhh… tired aayitten! Ippo pidichuko 😮‍💨”' : pick(DODGE_LINES));
    }
    function catchIt() {
      caught += 1;
      paint();
      burst(8);
      if (caught >= GOAL) {
        done = true;
        btn.disabled = true;
        btn.textContent = '🎉 Pidichiten!';
        arena.classList.add('won');
        say('Nirmal: “Okay okay… surrender! 🙌”');
        out.hidden = false;
        completeGame(2);
        return;
      }
      dodgesLeft = randInt(2, 3);
      say(`Pidichuttaa! ${GOAL - caught} innum baaki 😂 — Nirmal thirumba odraan!`);
      place();
      popAnim();
    }

    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && dodgesLeft > 0 && !done) dodge();
    });
    btn.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && dodgesLeft > 0 && !done) {
        e.preventDefault();
        dodge();
      }
    });
    btn.addEventListener('click', () => {
      if (done) return;
      if (performance.now() - lastDodge < 450) return;
      if (dodgesLeft > 0) { dodge(); return; }
      catchIt();
    });
    window.addEventListener('resize', () => { if (activeGame === 2) clamp(); });

    return {
      reset() {
        caught = 0;
        done = false;
        dodgesLeft = randInt(2, 3);
        lastDodge = 0;
        btn.disabled = false;
        btn.textContent = '🏃‍♂️ Nirmal, inga vaa!';
        arena.classList.remove('won');
        out.hidden = true;
        say('Nirmal: “Ennaala pidikka mudiyaadhu, Priya!”');
        paint();
        btn.style.left = Math.max(0, (arena.clientWidth - btn.offsetWidth) / 2) + 'px';
        btn.style.top = Math.max(0, (arena.clientHeight - btn.offsetHeight) / 2) + 'px';
      },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 3 — Love Lock
  ------------------------------------------------------------------ */
  gameControllers[3] = (() => {
    const CODE = '143';
    const sec = $('#game-3');
    const digits = $$('.code-digit', sec);
    const lock = $('#g3-lock');
    const hint = $('#g3-hint');
    const secret = $('#g3-secret');
    const row = $('.code-row', sec);
    const btn = $('#g3-btn');
    const HINTS = [
      'Aiyo, thappu code! Nirmal-ku kooda idhu theriyaadhu 😂 Thirumba try pannu!',
      'Hint 1: Idhu phone number illa, chellam. Romantic 3 digit number dhaan! 💕',
      'Hint 2: “I love you”-nu 3 words. Adhula ovvoru word-lum ethana letters irukku? 🤔',
      'Hint 3: “I” = 1 letter, “love” = 4 letters, “you” = 3 letters… ippo puriyudhaa? 😉',
      'Last hint: 1 – 4 – 3. Idhukku mela hint kudutha Nirmal-ku kai valikkum 😭'
    ];
    let attempts = 0;
    let unlocked = false;

    function fillFrom(text, start) {
      const clean = text.replace(/\D/g, '');
      for (let k = 0; k < clean.length && start + k < digits.length; k++) digits[start + k].value = clean[k];
      const next = Math.min(digits.length - 1, start + clean.length);
      digits[next].focus();
    }
    function shake() {
      row.classList.remove('shake-x');
      void row.offsetWidth;
      row.classList.add('shake-x');
    }
    function tryUnlock() {
      if (unlocked) return;
      const code = digits.map((d) => d.value).join('');
      if (!/^\d{3}$/.test(code)) {
        hint.textContent = 'Moonu digit-um podu, chellam 😅 (numbers mattum)';
        shake();
        const empty = digits.find((d) => !d.value);
        (empty || digits[0]).focus();
        return;
      }
      if (code === CODE) {
        unlocked = true;
        digits.forEach((d) => { d.readOnly = true; });
        btn.disabled = true;
        lock.classList.add('open');
        hint.textContent = 'Click! Lock thirandhuduchu! 🔓💖';
        secret.hidden = false;
        completeGame(3);
        return;
      }
      attempts += 1;
      hint.textContent = HINTS[Math.min(attempts - 1, HINTS.length - 1)];
      shake();
      digits.forEach((d) => { d.value = ''; });
      digits[0].focus();
    }

    digits.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        const v = inp.value.replace(/\D/g, '');
        if (inp.value.length > 1 && v.length > 1) { inp.value = ''; fillFrom(v, i); return; }
        inp.value = v.slice(-1);
        if (inp.value && i < digits.length - 1) digits[i + 1].focus();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
          digits[i - 1].value = '';
          digits[i - 1].focus();
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && i > 0) {
          digits[i - 1].focus();
        } else if (e.key === 'ArrowRight' && i < digits.length - 1) {
          digits[i + 1].focus();
        } else if (e.key === 'Enter') {
          tryUnlock();
        }
      });
      inp.addEventListener('focus', () => inp.select());
      inp.addEventListener('paste', (e) => {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (text) { e.preventDefault(); fillFrom(text, i); }
      });
    });
    btn.addEventListener('click', tryUnlock);

    return {
      reset() {
        attempts = 0;
        unlocked = false;
        digits.forEach((d) => { d.value = ''; d.readOnly = false; });
        btn.disabled = false;
        lock.classList.remove('open');
        secret.hidden = true;
        hint.textContent = '';
      },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 4 — Red Flag / Green Flag
  ------------------------------------------------------------------ */
  gameControllers[4] = (() => {
    const QUESTIONS = [
      {
        q: 'Partner-oda feelings-ai ketu purinjukka try panradhu?',
        answer: 'green',
        good: 'Sariyaana pick! 💚 Green Flag. Kettu purinjukka try panradhu dhaan relationship-oda base.',
        bad: 'Hmm, idhu actually Green Flag 💚. Partner feelings-ai ketu purinjukka try panradhu respect-oda adaiyaalam.'
      },
      {
        q: 'Thappu pannina ego vidaama sincere-ah sorry solradhu?',
        answer: 'green',
        good: 'Super! 💚 Green Flag. Ego-vai vittu accountability edukkaradhu romba mature-aana vishayam.',
        bad: 'Idhu Green Flag 💚. Thappa accept panni sincere-ah sorry solradhu, adhuvum ego illama — healthy habit.'
      },
      {
        q: 'Kovathula irundhaalum, partner enna feel panraanga-nu ketkaama irukkuradhu?',
        answer: 'red',
        good: 'Correct! 🚩 Red Flag. Kovam irundhaalum, partner feelings-ai kekkaama irundha distance dhaan perusa aagum.',
        bad: 'Idhu actually Red Flag 🚩. Kovam varum, adhu human dhaan — aana partner feelings-ai kekkaama irundha problem perusa aagum.'
      },
      {
        q: 'Misunderstanding vandha open-ah pesi solve panradhu?',
        answer: 'green',
        good: 'Perfect! 💚 Green Flag. Open-ah pesinaa dhaan misunderstanding clear aagum.',
        bad: 'Idhu Green Flag 💚. Open-ah, calm-ah pesi solve panradhu dhaan best way.'
      },
      {
        q: 'Thappu pannitu “nee dhaan over-ah react panra”-nu blame-a maathi pesradhu?',
        answer: 'red',
        good: 'Sariyaa sonna! 🚩 Red Flag. Accountability edukkaama blame maathina, trust kammi aagum.',
        bad: 'Idhu Red Flag 🚩. Blame maathaama, “en thappu”-nu accept panradhu dhaan nalladhu.'
      }
    ];
    const sec = $('#game-4');
    const stepEl = $('#g4-step');
    const scoreEl = $('#g4-score');
    const barEl = $('#g4-bar');
    const qEl = $('#g4-q');
    const fb = $('#g4-fb');
    const next = $('#g4-next');
    const out = $('#g4-out');
    const final = $('#g4-final');
    const buttons = $$('.flag-btn', sec);
    let idx = 0;
    let score = 0;
    let answered = false;

    function show() {
      const q = QUESTIONS[idx];
      answered = false;
      stepEl.textContent = `Kelvi ${idx + 1}/${QUESTIONS.length}`;
      scoreEl.textContent = `Score: ${score}`;
      barEl.style.width = (idx / QUESTIONS.length) * 100 + '%';
      qEl.textContent = q.q;
      fb.textContent = '';
      fb.className = 'feedback';
      next.hidden = true;
      buttons.forEach((b) => {
        b.disabled = false;
        b.classList.remove('is-picked', 'is-correct', 'is-wrong');
      });
    }
    function answer(choice) {
      if (answered) return;
      answered = true;
      const q = QUESTIONS[idx];
      const right = choice === q.answer;
      if (right) score += 1;
      scoreEl.textContent = `Score: ${score}`;
      buttons.forEach((b) => {
        b.disabled = true;
        if (b.dataset.flag === choice) b.classList.add('is-picked', right ? 'is-correct' : 'is-wrong');
        if (b.dataset.flag === q.answer) b.classList.add('is-answer');
      });
      fb.textContent = right ? q.good : q.bad;
      fb.className = 'feedback ' + (right ? 'good' : 'soft');
      barEl.style.width = ((idx + 1) / QUESTIONS.length) * 100 + '%';
      next.textContent = idx === QUESTIONS.length - 1 ? 'Result paaru 💖' : 'Adutha kelvi ▶';
      next.hidden = false;
      if (right) burst(6);
    }
    function finish() {
      next.hidden = true;
      $('.flag-row', sec).hidden = true;
      qEl.textContent = '';
      fb.textContent = '';
      final.textContent = `Un score: ${score}/${QUESTIONS.length} 🎯`;
      out.hidden = false;
      completeGame(4);
    }
    buttons.forEach((b) => b.addEventListener('click', () => answer(b.dataset.flag)));
    next.addEventListener('click', () => {
      if (idx < QUESTIONS.length - 1) { idx += 1; show(); } else { finish(); }
    });

    return {
      reset() {
        idx = 0;
        score = 0;
        out.hidden = true;
        $('.flag-row', sec).hidden = false;
        show();
      },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 5 — Scratch & Reveal
  ------------------------------------------------------------------ */
  gameControllers[5] = (() => {
    const MESSAGES = [
      'Un smile enakku romba special.',
      'Un feelings enakku mukkiyam.',
      'Unna purinjukka naan innum nalla try panren.',
      'Unna hurt pannadhukku sorry.',
      'Un pecha nalla ketka kathukkuren.',
      'Unakku oru warm virtual hug! 🧸'
    ];
    const grid = $('#g5-grid');
    const countEl = $('#g5-count');
    const out = $('#g5-out');
    let revealed = 0;

    function build() {
      grid.textContent = '';
      MESSAGES.forEach((text, i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'scratch-card c' + (i % 6);
        card.setAttribute('aria-label', `Surprise card ${i + 1}. Reveal panna tap pannu.`);
        card.innerHTML =
          `<span class="scratch-msg">${text}</span>` +
          `<span class="scratch-foil" aria-hidden="true"><span class="foil-num">${i + 1}</span><span class="foil-tag">Tap pannu ✨</span></span>`;
        card.addEventListener('click', () => reveal(card, text));
        grid.appendChild(card);
      });
    }
    function reveal(card, text) {
      if (card.classList.contains('revealed')) return;
      card.classList.add('revealed');
      card.setAttribute('aria-label', `Revealed: ${text}`);
      card.setAttribute('aria-pressed', 'true');
      revealed += 1;
      countEl.textContent = String(revealed);
      burst(5);
      if (revealed === MESSAGES.length) {
        out.hidden = false;
        completeGame(5);
      }
    }
    return {
      reset() {
        revealed = 0;
        countEl.textContent = '0';
        out.hidden = true;
        build();
      },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 6 — Love Battle
  ------------------------------------------------------------------ */
  gameControllers[6] = (() => {
    const ROUNDS = [
      {
        q: 'Nirmal thappu pannina enna pannanum?',
        options: [
          ['Ego vechitu “naan sari”-nu vaadhaadanum', false],
          ['Thappa accept panni, sorry solli, maaradhukku try panranum', true],
          ['Phone-a switch off pannitu thoongidanum', false],
          ['Memes anuppi topic-a divert pannanum', false]
        ],
        good: 'Correct! Accept pannitu maaradhu dhaan real sorry. 💪',
        bad: 'Hehe, illa! Thappa accept panni, maaradhukku try panradhu dhaan sariyaana vazhi.'
      },
      {
        q: 'Misunderstanding vandha best solution enna?',
        options: [
          ['Open-ah, calm-ah pesi solve panradhu', true],
          ['Rendu perum 3 naal silent mode', false],
          ['Status-la indirect-ah thittanum', false],
          ['Friends kitta mattum pulambanum', false]
        ],
        good: 'Super! Pesinaa dhaan puriyum. 🗣️',
        bad: 'Illa illa! Silence / indirect-ah pesradhu problem-a perusaakkum. Open-ah pesradhu dhaan best.'
      },
      {
        q: 'Nirmal-oda special mission enna?',
        options: [
          ['Biryani full-ah saapdradhu 🍗', false],
          ['World-a save panradhu 🦸', false],
          ['Priya-va purinjukka try panni, nalla ketkaradhu', true],
          ['Priya-ku theriyaama phone games aaduradhu 🎮', false]
        ],
        good: 'Yes! Indha mission dhaan Nirmal-ku top priority. 🎯',
        bad: 'Haha, nalla try! Aana Nirmal-oda real mission: Priya-va purinjukka try panradhu.'
      },
      {
        q: 'Love-la mukkiyamana combo edhu?',
        options: [
          ['Biryani + Netflix + thookkam', false],
          ['Trust + Respect + Communication', true],
          ['Gift + Gift + Gift', false],
          ['Kovam + Silence + Ignore', false]
        ],
        good: 'Perfect combo! 💞 Trust + Respect + Communication.',
        bad: 'Biryani combo nalladhu dhaan 😂 aana love-ku Trust + Respect + Communication dhaan mukkiyam.'
      },
      {
        q: 'Sorry sonna mattum podhuma, illa actions-um venuma?',
        options: [
          ['Sorry mattum podhum, magic-ah ellaam sari aagum', false],
          ['Gift vaangi kudutha podhum', false],
          ['Priya udane forgive pannanum, adhu dhaan rule', false],
          ['Sorry + actions rendum venum', true]
        ],
        good: 'Correct! Words-oda actions-um serndha dhaan sorry-ku artham. ✅',
        bad: 'Illa! Sorry-oda, actions-la maarradhu kaattanum. Priya forgive pannanum-nu force pannavum koodaadhu.'
      },
      {
        q: 'Priya-ku time venumna Nirmal enna pannanum?',
        options: [
          ['Space kudukkanum, pressure pannaama kaathirukkanum', true],
          ['Every 5 minutes “kovam poiducha?”-nu kekkanum', false],
          ['Door munnaadi dharna pannanum', false],
          ['“Ippove forgive pannu”-nu solla-num', false]
        ],
        good: 'Exactly! Time kudukkaradhu respect-oda oru part. 🤍',
        bad: 'Aiyo, illa! Pressure panna koodaadhu. Space kudutthu, patience-oda kaathirukkanum.'
      }
    ];
    const stepEl = $('#g6-step');
    const scoreEl = $('#g6-score');
    const barEl = $('#g6-bar');
    const qEl = $('#g6-q');
    const optsEl = $('#g6-options');
    const fb = $('#g6-fb');
    const next = $('#g6-next');
    const out = $('#g6-out');
    const titleOut = $('#g6-title-out');
    const finalOut = $('#g6-final');
    let idx = 0;
    let score = 0;
    let answered = false;

    function show() {
      const r = ROUNDS[idx];
      answered = false;
      stepEl.textContent = `Round ${idx + 1}/${ROUNDS.length}`;
      scoreEl.textContent = `Priya: ${score} pts`;
      barEl.style.width = (idx / ROUNDS.length) * 100 + '%';
      qEl.textContent = r.q;
      fb.textContent = '';
      fb.className = 'feedback';
      next.hidden = true;
      optsEl.textContent = '';
      shuffle(r.options).forEach(([text, ok]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'option';
        b.dataset.correct = ok ? '1' : '0';
        b.textContent = text;
        b.addEventListener('click', () => choose(b, ok));
        optsEl.appendChild(b);
      });
    }
    function choose(btn, ok) {
      if (answered) return;
      answered = true;
      const r = ROUNDS[idx];
      if (ok) score += 1;
      scoreEl.textContent = `Priya: ${score} pts`;
      $$('.option', optsEl).forEach((b) => {
        b.disabled = true;
        if (b.dataset.correct === '1') b.classList.add('is-correct');
      });
      btn.classList.add(ok ? 'is-picked-good' : 'is-picked-bad');
      fb.textContent = ok ? r.good : r.bad;
      fb.className = 'feedback ' + (ok ? 'good' : 'soft');
      barEl.style.width = ((idx + 1) / ROUNDS.length) * 100 + '%';
      next.textContent = idx === ROUNDS.length - 1 ? 'Final result paaru 🏁' : 'Adutha round ▶';
      next.hidden = false;
      if (ok) burst(6);
    }
    function finish() {
      next.hidden = true;
      optsEl.textContent = '';
      qEl.textContent = '';
      fb.textContent = '';
      const total = ROUNDS.length;
      let title;
      let text;
      if (score >= total - 1) {
        title = `👑 Love Guru Priya — ${score}/${total}`;
        text = 'Love Battle winner Priya dhaan! Nirmal konjam training edukka vendiyirukku! 😂';
      } else if (score >= 3) {
        title = `💪 Love Pro — ${score}/${total}`;
        text = 'Nalla score, Priya! Nirmal-ku innum konjam homework irukku — avan seriously padikkiraan. 😄';
      } else {
        title = `🌱 Love Learner — ${score}/${total}`;
        text = 'Paravaa illa, Priya! Idhula winner yaarum illa — namma rendu perum kathukkittu irukkom. 🤍';
      }
      titleOut.textContent = title;
      finalOut.textContent = text;
      out.hidden = false;
      completeGame(6);
    }
    next.addEventListener('click', () => {
      if (idx < ROUNDS.length - 1) { idx += 1; show(); } else { finish(); }
    });

    return {
      reset() {
        idx = 0;
        score = 0;
        out.hidden = true;
        show();
      },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 7 — Spin the Love Wheel
  ------------------------------------------------------------------ */
  gameControllers[7] = (() => {
    const SEGMENTS = [
      {
        label: 'Compliment', icon: '💖', color: '#ff6fae', title: 'Cute compliment',
        msgs: [
          'Un smile-a paartha udane en day bright aagidum, Priya. ✨',
          'Nee pesumbodhu un kangal-la irukkura care enakku romba pidikkum. 💖',
          'Un sirippu dhaan en favourite background music. 🎶'
        ]
      },
      {
        label: 'Confession', icon: '🤭', color: '#b44bff', title: 'Funny Nirmal confession',
        msgs: [
          'Secret confession: Naan kovama irundha scene potten… aana un feelings-ai appove purinjukkanum-nu ippo puriyudhu. 🥹',
          'Confession: Indha website-ku munnaadi 3 dhadava “sorry” message draft pannitu, delete pannittu thirumba ezhudhinen. 😅',
          'Confession: “Calm-ah pesanum”-nu practice panren… ippodhaikku mirror kitta dhaan. 😂'
        ]
      },
      {
        label: 'Promise', icon: '🤞', color: '#ff3e8a', title: 'Sweet promise',
        msgs: [
          'Promise: Kovam vandhaalum, munnaadi un feelings-ai kekkuren, apparam dhaan pesuven. 🤞',
          'Promise: Un pecha naduvula interrupt pannaama nalla ketkuren. 💞',
          'Promise: Sorry sollradhoda niruthama, actions-layum maarradhu kaattuven.'
        ]
      },
      {
        label: 'Hug', icon: '🤗', color: '#d6a5ff', title: 'Virtual hug',
        msgs: [
          'Oru warm virtual hug! 🧸 Un pace-la, un time-la — pressure illa.',
          'Soft-ah oru hug anuppuren… nee comfortable-ah irukkumbodhu mattum edutthuko. 🫂'
        ]
      },
      {
        label: 'Surprise', icon: '🌹', color: '#ff8fb8', title: 'Romantic surprise',
        msgs: [
          'Surprise: Nee ready-nu sollumbodhu, un favourite place-la oru chinna coffee date plan panren. ☕',
          'Surprise: Indha website-oda ovvoru game-um unakkaaga dhaan design pannen, Priya. 🌹',
          'Surprise: Oru day nee sollra restaurant-ku Nirmal treat. Menu un choice! 🍽️'
        ]
      },
      {
        label: 'Sorry', icon: '🥺', color: '#9b6bff', title: 'Sincere apology',
        msgs: [
          'Manasaara sorry, Priya. Un feelings-ai naan sariyaa purinjukkala. Adhai nalla maathikka try panren. 🥺',
          'Sorry, Priya. Nee sorry sonna bodhum naan kovam kaattunen. Adhu en thappu.'
        ]
      },
      {
        label: 'Challenge', icon: '🎯', color: '#ffb36b', title: 'Cute challenge',
        msgs: [
          'Challenge: Un favourite song-a oru line hum pannu. Nirmal-ku kekkala-na kooda feel pannuvaan! 🎶',
          'Challenge: Nirmal-ku oru cute nickname sollu — avan adhukku worth-ah irukka try pannuvaan. 😂',
          'Challenge: Innaiku un mood-ku oru emoji anuppu. Nirmal “en”-nu kekkaama purinjukka try pannuvaan. 🫶'
        ]
      }
    ];
    const N = SEGMENTS.length;
    const SEG = TAU / N;
    const canvas = $('#g7-canvas');
    const btn = $('#g7-btn');
    const out = $('#g7-out');
    const titleOut = $('#g7-title-out');
    const msgOut = $('#g7-msg');
    const countEl = $('#g7-count');
    let rot = 0;
    let spinning = false;
    let raf = 0;
    let spins = 0;

    function draw() {
      const c = canvas.getContext('2d');
      const size = canvas.width;
      const cx = size / 2;
      const r = size / 2 - 14;
      c.clearRect(0, 0, size, size);
      for (let i = 0; i < N; i++) {
        const a0 = i * SEG - Math.PI / 2; // segment 0 pointer-oda right-la irundhu aarambikkum
        c.beginPath();
        c.moveTo(cx, cx);
        c.arc(cx, cx, r, a0, a0 + SEG);
        c.closePath();
        c.fillStyle = SEGMENTS[i].color;
        c.fill();
        c.lineWidth = 4;
        c.strokeStyle = 'rgba(255, 240, 247, 0.9)';
        c.stroke();

        c.save();
        c.translate(cx, cx);
        c.rotate(a0 + SEG / 2);
        c.textAlign = 'right';
        c.textBaseline = 'middle';
        c.fillStyle = '#fff';
        c.shadowColor = 'rgba(16, 8, 23, 0.55)';
        c.shadowBlur = 6;
        c.font = '700 30px Quicksand, system-ui, sans-serif';
        c.fillText(SEGMENTS[i].label, r - 74, 0);
        c.font = '38px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        c.fillText(SEGMENTS[i].icon, r - 22, 2);
        c.restore();
      }
      c.beginPath();
      c.arc(cx, cx, r, 0, TAU);
      c.lineWidth = 12;
      c.strokeStyle = '#ffd58b';
      c.stroke();
    }
    function paintRot() { canvas.style.transform = `rotate(${rot}rad)`; }
    function indexAtPointer(angle) {
      const i = Math.floor(norm(-angle) / SEG);
      return Math.min(N - 1, Math.max(0, i));
    }
    function finish() {
      spinning = false;
      rot = norm(rot);
      paintRot();
      const seg = SEGMENTS[indexAtPointer(rot)];
      titleOut.textContent = `${seg.icon} ${seg.title}`;
      msgOut.textContent = pick(seg.msgs);
      out.hidden = false;
      out.classList.remove('pop');
      void out.offsetWidth;
      out.classList.add('pop');
      btn.disabled = false;
      btn.textContent = 'Innum oru dhadava spin pannalaam!';
      spins += 1;
      countEl.textContent = `Spins: ${spins} — evlo venumnaalum thirumba spin pannalaam 💫`;
      burst(18);
      completeGame(7);
    }
    function spin() {
      if (spinning) return;
      spinning = true;
      btn.disabled = true;
      out.hidden = true;
      const target = randInt(0, N - 1);
      const offset = rand(0.18, 0.82);
      const start = rot;
      const delta = norm(-(target + offset) * SEG - start);
      const total = delta + TAU * randInt(5, 7);
      const dur = reduceMotion ? 700 : 5200;
      const t0 = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        rot = start + total * eased;
        paintRot();
        if (t < 1) raf = requestAnimationFrame(frame);
        else finish();
      }
      raf = requestAnimationFrame(frame);
    }
    btn.addEventListener('click', spin);

    draw();
    return {
      reset() {
        cancelAnimationFrame(raf);
        spinning = false;
        spins = 0;
        rot = 0;
        paintRot();
        btn.disabled = false;
        btn.textContent = 'Spin pannalaam!';
        out.hidden = true;
        countEl.textContent = '';
      },
      stop() {
        cancelAnimationFrame(raf);
        spinning = false;
      }
    };
  })();

  /* ------------------------------------------------------------------
     GAME 8 — Find My Hidden Love
  ------------------------------------------------------------------ */
  gameControllers[8] = (() => {
    const COLS = 5;
    const ROWS = 4;
    const CELLS = COLS * ROWS;
    const HEARTS = 5;
    const DECOR = ['🌹', '🌸', '🌙', '⭐', '🎀', '🍫', '🧸', '🎈', '🌷', '🦋', '🎁', '🍰', '☁️', '🕯️', '🎵', '🌺', '🍀', '🍓', '🧁', '💎'];
    const HEART_NAMES = ['Un smile.', 'Un care.', 'Un honesty.', 'Un feelings.', 'Un trust.'];
    const MISS_LINES = [
      'Idhula heart illa… 🌫️',
      'Hmm, inga illa! Vera edam try pannu 👀',
      'Almost! …aana illa 😅',
      'Heart romba smart-ah olinjirukku! 🙈',
      'Ayyo, adhu verum decoration dhaan 🙃'
    ];
    const grid = $('#g8-grid');
    const countEl = $('#g8-count');
    const fb = $('#g8-fb');
    const foundList = $('#g8-found');
    const out = $('#g8-out');
    let hearts = new Set();
    let state = [];
    let found = 0;
    let misses = 0;

    function build() {
      grid.textContent = '';
      foundList.textContent = '';
      hearts = new Set(shuffle(Array.from({ length: CELLS }, (_, i) => i)).slice(0, HEARTS));
      state = new Array(CELLS).fill('hidden');
      const icons = shuffle(DECOR);
      for (let i = 0; i < CELLS; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hunt-item';
        b.dataset.i = String(i);
        b.textContent = icons[i % icons.length];
        b.setAttribute('aria-label', `Object ${i + 1}. Heart irukkaa-nu paaru.`);
        b.addEventListener('click', () => tap(i, b));
        grid.appendChild(b);
      }
    }
    function clueText() {
      const remaining = Array.from(hearts).filter((i) => state[i] === 'hidden');
      if (!remaining.length) return '';
      const target = pick(remaining);
      const r = Math.floor(target / COLS) + 1;
      const c = (target % COLS) + 1;
      return Math.random() < 0.5
        ? `Clue: Mela irundhu ${r}-aavadhu row-la oru heart olinjirukku 👀`
        : `Clue: Left-la irundhu ${c}-aavadhu column-la oru heart olinjirukku 👀`;
    }
    function tap(i, el) {
      if (state[i] !== 'hidden' || found >= HEARTS) return;
      if (hearts.has(i)) {
        state[i] = 'found';
        el.textContent = '❤️';
        el.classList.add('is-heart');
        el.disabled = true;
        el.setAttribute('aria-label', `Heart kidaichuduchu: ${HEART_NAMES[found]}`);
        const name = HEART_NAMES[found];
        found += 1;
        countEl.textContent = `Hearts kandupidichadhu: ${found}/${HEARTS}`;
        const li = document.createElement('li');
        li.textContent = `❤️ ${name}`;
        foundList.appendChild(li);
        fb.textContent = `Kandupidichuttaa! 💖 ${name}`;
        fb.className = 'feedback good';
        burst(8);
        if (found === HEARTS) {
          out.hidden = false;
          completeGame(8);
        }
      } else {
        state[i] = 'missed';
        el.classList.add('is-missed');
        el.disabled = true;
        misses += 1;
        fb.className = 'feedback soft';
        fb.textContent = misses % 3 === 0 ? clueText() : pick(MISS_LINES);
      }
    }
    return {
      reset() {
        found = 0;
        misses = 0;
        countEl.textContent = `Hearts kandupidichadhu: 0/${HEARTS}`;
        fb.textContent = 'Edhavadhu oru object-a tap pannu 👆';
        fb.className = 'feedback';
        out.hidden = true;
        build();
      },
      stop() {}
    };
  })();

  /* ------------------------------------------------------------------
     GAME 9 — Memory Match
  ------------------------------------------------------------------ */
  gameControllers[9] = (() => {
    const SYMBOLS = [['❤️', 'Heart'], ['🌹', 'Rose'], ['🧸', 'Teddy bear'], ['💌', 'Love letter']];
    const grid = $('#g9-grid');
    const pairsEl = $('#g9-pairs');
    const movesEl = $('#g9-moves');
    const timeEl = $('#g9-time');
    const fb = $('#g9-fb');
    const out = $('#g9-out');
    const final = $('#g9-final');
    let open = [];
    let busy = false;
    let matched = 0;
    let moves = 0;
    let startAt = 0;
    let ticker = null;
    let flipTimer = null;

    function fmt(ms) {
      const s = Math.floor(ms / 1000);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    function startTimer() {
      if (startAt) return;
      startAt = Date.now();
      ticker = setInterval(() => { timeEl.textContent = fmt(Date.now() - startAt); }, 250);
    }
    function stopTimer() {
      clearInterval(ticker);
      ticker = null;
    }
    function build() {
      grid.textContent = '';
      const deck = shuffle([...SYMBOLS, ...SYMBOLS]);
      deck.forEach(([sym, name], i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mem-card';
        card.dataset.sym = sym;
        card.setAttribute('aria-label', `Card ${i + 1}, moodi irukku`);
        card.innerHTML =
          '<span class="mem-inner"><span class="mem-face mem-front" aria-hidden="true">💗</span>' +
          `<span class="mem-face mem-back" aria-hidden="true">${sym}</span></span>`;
        card.addEventListener('click', () => flip(card, name));
        grid.appendChild(card);
      });
    }
    function flip(card, name) {
      if (busy) return;
      if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
      if (open.length >= 2) return;
      startTimer();
      card.classList.add('flipped');
      card.setAttribute('aria-label', `${name}, open aayiduchu`);
      open.push({ card, name });
      if (open.length < 2) return;
      moves += 1;
      movesEl.textContent = String(moves);
      const [a, b] = open;
      if (a.card.dataset.sym === b.card.dataset.sym) {
        [a, b].forEach((o) => {
          o.card.classList.add('matched');
          o.card.disabled = true;
          o.card.setAttribute('aria-label', `${o.name}, match aayiduchu`);
        });
        open = [];
        matched += 1;
        pairsEl.textContent = String(matched);
        fb.textContent = `Match! ${a.name} pair kidaichuduchu 💞`;
        fb.className = 'feedback good';
        burst(8);
        if (matched === SYMBOLS.length) {
          stopTimer();
          timeEl.textContent = fmt(Date.now() - startAt);
          final.textContent = `Ellaa pairs-um match aayiduchu! ${moves} moves, ${timeEl.textContent} time 🎉`;
          out.hidden = false;
          completeGame(9);
        }
      } else {
        busy = true;
        fb.textContent = 'Match aagala… konjam gnabagam vechuko 🤔';
        fb.className = 'feedback soft';
        flipTimer = setTimeout(() => {
          [a, b].forEach((o, k) => {
            o.card.classList.remove('flipped');
            o.card.setAttribute('aria-label', `Card, moodi irukku`);
            void k;
          });
          open = [];
          busy = false;
        }, 900);
      }
    }
    return {
      reset() {
        clearTimeout(flipTimer);
        stopTimer();
        open = [];
        busy = false;
        matched = 0;
        moves = 0;
        startAt = 0;
        pairsEl.textContent = '0';
        movesEl.textContent = '0';
        timeEl.textContent = '0:00';
        fb.textContent = 'Edhavadhu oru card-a flip pannu 👆';
        fb.className = 'feedback';
        out.hidden = true;
        build();
      },
      stop() {
        clearTimeout(flipTimer);
        stopTimer();
        busy = false;
      }
    };
  })();

  /* ------------------------------------------------------------------
     GAME 10 — Claw Machine
  ------------------------------------------------------------------ */
  gameControllers[10] = (() => {
    const SLOTS = 6;
    const REGULAR = [
      ['🧸', 'Teddy bear'], ['🌹', 'Rose'], ['💖', 'Sparkle heart'],
      ['🍫', 'Chocolate'], ['🎀', 'Ribbon'], ['🎁', 'Gift box'], ['🌷', 'Tulip']
    ];
    const prizesEl = $('#g10-prizes');
    const claw = $('#g10-claw');
    const held = $('#g10-held');
    const left = $('#g10-left');
    const right = $('#g10-right');
    const go = $('#g10-go');
    const fb = $('#g10-fb');
    const tray = $('#g10-tray');
    const out = $('#g10-out');
    const letterBtn = $('#g10-letter-btn');
    const note = $('#g10-letter-note');
    let slots = [];
    let prizeEls = [];
    let pos = 0;
    let busy = false;
    let won = false;
    let run = 0;
    let collected = [];

    function setBusy(v) {
      busy = v;
      left.disabled = v || won;
      right.disabled = v || won;
      go.disabled = v || won;
    }
    function movePaint() {
      claw.style.left = ((pos + 0.5) / SLOTS) * 100 + '%';
    }
    function build() {
      prizesEl.textContent = '';
      const jackpot = randInt(0, SLOTS - 1);
      const pool = shuffle(REGULAR);
      slots = [];
      prizeEls = [];
      for (let i = 0; i < SLOTS; i++) {
        const item = i === jackpot
          ? { emoji: '🎁', name: 'Special jackpot gift', jackpot: true }
          : { emoji: pool[i % pool.length][0], name: pool[i % pool.length][1], jackpot: false };
        slots.push(item);
        const el = document.createElement('div');
        el.className = 'prize' + (item.jackpot ? ' jackpot' : '');
        el.style.left = ((i + 0.5) / SLOTS) * 100 + '%';
        el.textContent = item.jackpot ? '🎁' : item.emoji;
        if (item.jackpot) {
          const star = document.createElement('span');
          star.className = 'prize-star';
          star.textContent = '✨';
          el.appendChild(star);
        }
        prizesEl.appendChild(el);
        prizeEls.push(el);
      }
    }
    function updateTray() {
      tray.textContent = collected.length ? collected.join(' ') : 'innum onnum illa';
    }
    function renderJackpotNote() {
      const remaining = TOTAL - completed.size;
      if (remaining <= 0) {
        note.textContent = 'Ellaa 10 games-um mudinjaachu. Letter ippo unlock!';
        letterBtn.hidden = false;
      } else {
        note.textContent = `Letter-a thirakka innum ${remaining} game${remaining === 1 ? '' : 's'} mudikkanum. Games list-ku poi, baaki games-um aadu!`;
        letterBtn.hidden = true;
      }
    }
    function moveBy(d) {
      if (busy || won) return;
      const np = Math.min(SLOTS - 1, Math.max(0, pos + d));
      if (np === pos) {
        fb.textContent = d < 0 ? 'Idhu dhaan left edge, Priya 😄' : 'Idhu dhaan right edge, Priya 😄';
        return;
      }
      pos = np;
      movePaint();
      const s = slots[pos];
      fb.textContent = s ? `Claw ippo ${s.jackpot ? 'special gift' : s.name} mela irukku.` : 'Claw ippo khaali edathula irukku.';
    }
    async function grab() {
      if (busy || won) return;
      const my = ++run;
      setBusy(true);
      const idx = pos;
      const item = slots[idx];
      fb.textContent = 'Claw keezha pogudhu…';
      claw.classList.remove('closed');
      claw.classList.add('open', 'down');
      await sleep(950);
      if (my !== run) return;
      claw.classList.remove('open');
      claw.classList.add('closed');
      await sleep(450);
      if (my !== run) return;
      if (item) {
        prizeEls[idx].classList.add('picked');
        held.textContent = item.emoji;
        held.classList.add('show');
      }
      claw.classList.remove('down');
      await sleep(950);
      if (my !== run) return;
      held.classList.remove('show');
      claw.classList.remove('closed');
      if (item) {
        slots[idx] = null;
        collected.push(item.emoji);
        updateTray();
        if (item.jackpot) {
          won = true;
          fb.textContent = 'JACKPOT! Special prize pidichuttaa! 🎉💌';
          out.hidden = false;
          renderJackpotNote();
          setBusy(false);
          completeGame(10);
          return;
        }
        fb.textContent = `Prize kidaichuduchu: ${item.emoji} ${item.name}! Ippo jackpot gift-a thedu ✨`;
        burst(10);
      } else {
        fb.textContent = 'Khaali! Andha edathula prize illa. Vera edam try pannu 😅';
      }
      setBusy(false);
    }
    left.addEventListener('click', () => moveBy(-1));
    right.addEventListener('click', () => moveBy(1));
    go.addEventListener('click', grab);
    document.addEventListener('keydown', (e) => {
      if (activeGame !== 10) return;
      if (e.key === 'ArrowLeft') { moveBy(-1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { moveBy(1); e.preventDefault(); }
    });

    return {
      reset() {
        run += 1;
        won = false;
        collected = [];
        pos = 0;
        claw.classList.remove('open', 'closed', 'down');
        held.classList.remove('show');
        out.hidden = true;
        build();
        movePaint();
        updateTray();
        setBusy(false);
        fb.textContent = 'Claw prize mela nikkudhaa-nu paathuttu “Catch prize!” nokku.';
      },
      stop() {
        run += 1;
        busy = false;
      }
    };
  })();

  /* ------------------------------------------------------------------
     FINAL LETTER
  ------------------------------------------------------------------ */
  const HUG_MSGS = [
    'Virtual hug anuppiten, Priya 🤗 Nee comfortable-ah irukkumbodhu mattum edutthuko.',
    'Soft-ah oru hug 🧸 Pressure illa, hurry illa — un pace dhaan mukkiyam.',
    'Warm hug, delivered 💞 Pesanum-nu thonumbodhu Nirmal ketka ready-ah irukkaan.'
  ];
  let hugCount = 0;
  function enterLetter() {
    $('#hugPanel').hidden = true;
    hugCount = 0;
    burst(60);
  }
  $('#hugBtn').addEventListener('click', () => {
    const panel = $('#hugPanel');
    $('#hugMsg').textContent = HUG_MSGS[hugCount % HUG_MSGS.length];
    $('#hugEmoji').textContent = ['🤗', '🧸', '🫂'][hugCount % 3];
    hugCount += 1;
    panel.hidden = false;
    panel.classList.remove('pop');
    void panel.offsetWidth;
    panel.classList.add('pop');
    burst(30);
  });
  $('#replayAllBtn').addEventListener('click', () => {
    resetAllProgress();
    toast('Ellaa games-um reset aayiduchu. Thirumba aadalaam! 🎮');
    navigate('games');
  });

  /* ------------------------------------------------------------------
     Start
  ------------------------------------------------------------------ */
  injectChrome();
  updateProgressUI();
  route();
})();
