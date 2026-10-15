/* =========================================================================
   Pink Player — interactive popup demo for the website and store shots.

   Mount it anywhere with:
     <div data-pp-player data-track="afterglow" data-tab="queue"
          data-theme="light" data-shadow="deep" data-live></div>

   data-track   afterglow | lanterns | tide | static | kingdom | seoul | glasshouse | lemon
   data-tab     queue | lyrics | playlists
   data-theme   dark (default) | light
   data-shadow  none | soft (default) | deep
   data-live    present = the song plays (progress and lyrics move)

   Optional starting state (used by the store shots):
   data-position="38"  data-shuffle  data-repeat="all|one"  data-sleep

   Everything here is made up: tracks, covers, lyrics and playlists.
   ========================================================================= */
(function () {
  'use strict';

  var TRACKS = {
    afterglow: {
      title: 'Afterglow', artist: 'Lumen Drive', byline: 'Lumen Drive • Night Shift • 2025', dur: 208,
      accent: '#ff5fa8', ink: '#c42a74', soft: 'rgba(255, 95, 168, 0.16)',
      cover: 'radial-gradient(circle at 66% 36%, #ffe3f1 0 11%, #ff5fa8 11.5% 21%, rgba(255, 95, 168, 0) 21.5%), repeating-linear-gradient(180deg, rgba(255, 255, 255, 0) 0 6px, rgba(255, 255, 255, 0.09) 6px 7px), linear-gradient(165deg, #6a35e0 0%, #2c1278 55%, #12063a 100%)',
      lyrics: ['We left the windows open', 'So the city could sing along', 'Every streetlight humming', 'A song we almost know', 'Hold the chorus for a minute', 'Then let it fade out slow', 'Stay inside the afterglow', 'Where the neon hours go', 'If the night is running over', 'Let it run a little more', 'Stay inside the afterglow', 'Stay a little more'],
    },
    lanterns: {
      title: 'Paper Lanterns', artist: 'Mira Sol', byline: 'Mira Sol • Sunday Tangerine • 2024', dur: 194,
      accent: '#ff8a3d', ink: '#b5520f', soft: 'rgba(255, 138, 61, 0.16)',
      cover: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0 66%, #5c1a0b 66% 100%), radial-gradient(circle at 50% 66%, #fff1d6 0 22%, rgba(255, 241, 214, 0) 22.5%), linear-gradient(180deg, #ffb057 0%, #f2602e 66%)',
      lyrics: ['Paper lanterns on the water', 'Carry every word we kept', 'Sunday morning, slow and golden', 'Folding up the things we said', 'Light them one by one', 'Watch them drifting home', 'Paper lanterns on the water', 'Lighting up the way we go', 'Every wish a little brighter', 'Than the last one we let go'],
    },
    tide: {
      title: 'Low Tide', artist: 'Pale Harbor', byline: 'Pale Harbor • Blue Hours • 2023', dur: 236,
      accent: '#47b8ff', ink: '#1c6fae', soft: 'rgba(71, 184, 255, 0.16)',
      cover: 'radial-gradient(130% 100% at 50% 115%, rgba(3, 16, 38, 0) 0 40%, rgba(3, 16, 38, 0.55) 100%), repeating-radial-gradient(circle at 50% 118%, #9fe6ff 0 5%, #3b9be0 5% 10%, #165796 10% 15%)',
      lyrics: ['Counting waves until the morning', 'Salt still drying on your sleeve', 'Low tide, we can walk forever', 'Out to where the lighthouse sleeps', 'Leave your shoes beside the jetty', 'Leave the questions on the sand', 'Low tide, we can walk forever', 'Hold the ocean in your hand'],
    },
    static: {
      title: 'Pink Static', artist: 'Juno Park', byline: 'Juno Park • Radio Days • 2025', dur: 182,
      accent: '#ff4d96', ink: '#c8246a', soft: 'rgba(255, 77, 150, 0.16)',
      cover: 'radial-gradient(circle at 32% 34%, rgba(255, 255, 255, 0) 0 16%, #ffffff 16.5% 19.5%, rgba(255, 255, 255, 0) 20%), repeating-linear-gradient(135deg, #ff4d96 0 7px, #e23a82 7px 14px)',
      lyrics: ['Radio between the stations', 'Pink static in my head', 'Every song I ever loved', 'Playing back the things you said', 'Turn it up, I can’t hear you', 'Turn it up, I’m almost there', 'Pink static on the stereo', 'Pink static everywhere'],
    },
    kingdom: {
      title: 'Small Kingdoms', artist: 'Okra Club', byline: 'Okra Club • Greenhouse • 2022', dur: 221,
      accent: '#8fd16a', ink: '#3f7f22', soft: 'rgba(143, 209, 106, 0.16)',
      cover: 'radial-gradient(circle at 30% 72%, #d8efb0 0 19%, rgba(216, 239, 176, 0) 19.5%), radial-gradient(circle at 64% 40%, #86b86b 0 25%, rgba(134, 184, 107, 0) 25.5%), linear-gradient(160deg, #346b40 0%, #142a1d 100%)',
      lyrics: [],
    },
    seoul: {
      title: 'Seoul, 3 AM', artist: 'Hanbit', byline: 'Hanbit • City Lights • 2024', dur: 199,
      accent: '#ff5a5a', ink: '#c22f2f', soft: 'rgba(255, 90, 90, 0.16)',
      cover: 'radial-gradient(circle at 70% 32%, #ff4b4b 0 15%, rgba(255, 75, 75, 0) 15.5%), radial-gradient(circle, rgba(255, 255, 255, 0.5) 0 1px, rgba(255, 255, 255, 0) 1.5px) 0 0 / 5px 5px, linear-gradient(160deg, #34343d 0%, #101013 100%)',
      lyrics: [],
    },
    glasshouse: {
      title: 'Glasshouse', artist: 'Mono Bloom', byline: 'Mono Bloom • Prism • 2023', dur: 247,
      accent: '#3fd9c6', ink: '#0d776d', soft: 'rgba(63, 217, 198, 0.16)',
      cover: 'radial-gradient(circle at 36% 40%, rgba(255, 255, 255, 0.5) 0 22%, rgba(255, 255, 255, 0) 22.5%), radial-gradient(circle at 62% 62%, rgba(140, 255, 225, 0.55) 0 27%, rgba(140, 255, 225, 0) 27.5%), linear-gradient(150deg, #12a198 0%, #0a4752 100%)',
      lyrics: [],
    },
    lemon: {
      title: 'Lemon Light', artist: 'Kiko Fern', byline: 'Kiko Fern • Citrus • 2025', dur: 176,
      accent: '#ffc21a', ink: '#8a6400', soft: 'rgba(255, 194, 26, 0.16)',
      cover: 'radial-gradient(circle at 50% 100%, #fffbe8 0 30%, #ffe680 30.5% 36%, rgba(255, 230, 128, 0) 36.5%), linear-gradient(180deg, #ffd43b 0%, #ffad0a 100%)',
      lyrics: [],
    },
  };

  var ORDER = ['afterglow', 'kingdom', 'seoul', 'static', 'glasshouse', 'lemon', 'lanterns', 'tide'];

  var PLAYLISTS = [
    { title: 'Liked Music', sub: 'Auto playlist', liked: true, tracks: ['static', 'afterglow', 'lemon', 'tide'] },
    { title: 'Late-night coding', sub: 'Playlist • 64 songs', tracks: ['seoul', 'afterglow', 'glasshouse', 'tide'] },
    { title: 'Sunday reset', sub: 'Playlist • 27 songs', tracks: ['lanterns', 'lemon', 'kingdom', 'static'] },
    { title: 'Lo-fi for focus', sub: 'Playlist • 112 songs', tracks: ['kingdom', 'glasshouse', 'seoul', 'afterglow'] },
    { title: 'Morning commute', sub: 'Playlist • 41 songs', tracks: ['tide', 'lemon', 'lanterns', 'afterglow'] },
    { title: 'Run club 160', sub: 'Playlist • 35 songs', tracks: ['lemon', 'static', 'seoul', 'lanterns'] },
  ];

  // Lyric line i starts at LYRIC_START + i * LYRIC_STEP seconds.
  var LYRIC_START = 6;
  var LYRIC_STEP = 8;
  var START_POS = 38;

  // Icon paths copied from web-extension/popup.html.
  var ICON = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18l8.5-6L6 6zM16 6h2v12h-2z"/></svg>',
    play: '<svg class="pp-ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg class="pp-ico-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
    heartOutline: '<svg class="pp-ico-outline" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>',
    heartFilled: '<svg class="pp-ico-filled" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
    volUp: '<svg class="pp-ico-up" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05a4.5 4.5 0 0 0 2.5-4.02zM14 3.23v2.06A8 8 0 0 1 19 12a8 8 0 0 1-5 7.42v2.1A10 10 0 0 0 22 12 10 10 0 0 0 14 3.23z"/></svg>',
    volMid: '<svg class="pp-ico-mid" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05a4.5 4.5 0 0 0 2.5-4.02z"/></svg>',
    volMute: '<svg class="pp-ico-mute" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.63 3.63a1 1 0 0 0 0 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.49.37-1.02.69-1.61.92v2.06a8.96 8.96 0 0 0 3.06-1.51l1.95 1.95a1 1 0 0 0 1.41-1.41L5.05 3.63a1 1 0 0 0-1.42 0zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.96 8.96 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM12 4L9.91 6.09 12 8.18V4zm4.5 8A4.5 4.5 0 0 0 14 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5 6.5 6.5 0 0 0 20.5 13.5z"/></svg>',
    popout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  };

  var TABS = [
    { id: 'queue', label: 'Up Next' },
    { id: 'lyrics', label: 'Lyrics' },
    { id: 'playlists', label: 'Playlists' },
  ];

  var count = 0;

  function fmt(seconds) {
    var s = Math.max(0, Math.floor(seconds));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function Player(host) {
    var d = host.dataset;
    this.host = host;
    this.id = 'pp' + (++count);
    this.theme = d.theme === 'light' ? 'light' : 'dark';
    this.initial = TRACKS[d.track] ? d.track : 'afterglow';
    var startPos = Number(d.position);
    this.s = {
      cur: this.initial,
      tab: TABS.some(function (t) { return t.id === d.tab; }) ? d.tab : 'queue',
      pos: Number.isFinite(startPos) && d.position !== '' ? startPos : START_POS,
      playing: true,
      liked: true,
      shuffle: 'shuffle' in d,
      repeat: d.repeat === 'all' || d.repeat === 'one' ? d.repeat : 'off',
      vol: 72,
      muted: false,
      sleep: 'sleep' in d,
      queue: null,
      list: -1,
    };
    this.build(d.shadow);
    this.update();
    if ('live' in d) this.play();
  }

  Player.prototype.track = function () {
    return TRACKS[this.s.cur];
  };

  Player.prototype.queueKeys = function () {
    if (this.s.queue) return this.s.queue;
    var first = this.initial;
    return [first].concat(ORDER.filter(function (k) { return k !== first; })).slice(0, 6);
  };

  Player.prototype.build = function (shadow) {
    var id = this.id;
    var root = document.createElement('div');
    root.className = 'pp';
    root.dataset.theme = this.theme;
    root.dataset.shadow = shadow === 'none' || shadow === 'deep' ? shadow : 'soft';
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'Pink Player demo');
    root.innerHTML =
      '<div class="pp-ambient" aria-hidden="true"></div>' +
      '<div class="pp-tint" aria-hidden="true"></div>' +
      '<div class="pp-main">' +
        '<div class="pp-head">' +
          '<button type="button" class="pp-art" aria-label="Open YouTube Music tab"></button>' +
          '<div class="pp-meta"><div class="pp-title"></div><div class="pp-artist"></div></div>' +
        '</div>' +
        '<div class="pp-scrub">' +
          '<div class="pp-scrub-track">' +
            '<div class="pp-rail"></div><div class="pp-fill"></div><div class="pp-thumb"></div>' +
            '<input class="pp-range pp-seek" type="range" min="0" step="1" aria-label="Seek">' +
          '</div>' +
          '<div class="pp-times"><span class="pp-pos">0:00</span><span class="pp-dur">0:00</span></div>' +
        '</div>' +
        '<div class="pp-controls">' +
          '<button type="button" class="pp-btn-icon" data-act="prev" aria-label="Previous">' + ICON.prev + '</button>' +
          '<button type="button" class="pp-btn-play" data-act="play" aria-label="Pause">' + ICON.play + ICON.pause + '</button>' +
          '<button type="button" class="pp-btn-icon" data-act="next" aria-label="Next">' + ICON.next + '</button>' +
        '</div>' +
        '<div class="pp-secondary">' +
          '<button type="button" class="pp-mini pp-shuffle" data-act="shuffle" aria-label="Shuffle">' + ICON.shuffle + '<span class="pp-dot"></span></button>' +
          '<button type="button" class="pp-mini pp-like" data-act="like" aria-label="Like">' + ICON.heartOutline + ICON.heartFilled + '</button>' +
          '<button type="button" class="pp-mini pp-repeat" data-act="repeat" aria-label="Repeat">' + ICON.repeat + '<span class="pp-dot"></span><span class="pp-one" aria-hidden="true">1</span></button>' +
          '<div class="pp-vol">' +
            '<button type="button" class="pp-mini pp-vol-btn" data-act="mute" aria-label="Mute / unmute">' + ICON.volUp + ICON.volMid + ICON.volMute + '</button>' +
            '<div class="pp-vol-track">' +
              '<div class="pp-vol-rail"></div><div class="pp-vol-fill"></div><div class="pp-vol-thumb"></div>' +
              '<input class="pp-range pp-volume" type="range" min="0" max="100" step="1" aria-label="Volume">' +
            '</div>' +
          '</div>' +
          '<button type="button" class="pp-mini pp-sleep" data-act="sleep" aria-label="Sleep timer">' + ICON.moon + '<span class="pp-sleep-badge" aria-hidden="true">30m</span></button>' +
          '<button type="button" class="pp-mini" data-act="popout" aria-label="Pop out player">' + ICON.popout + '</button>' +
        '</div>' +
        '<div class="pp-panel">' +
          '<div class="pp-tabs" role="tablist" aria-label="Player views">' +
            TABS.map(function (t) {
              return '<button type="button" role="tab" class="pp-tab" id="' + id + '-tab-' + t.id + '" data-act="tab" data-tab="' + t.id + '" aria-controls="' + id + '-view">' + t.label + '</button>';
            }).join('') +
          '</div>' +
          '<div class="pp-view" id="' + id + '-view" role="tabpanel"></div>' +
        '</div>' +
      '</div>';

    this.host.appendChild(root);
    this.root = root;

    var q = function (sel) { return root.querySelector(sel); };
    this.el = {
      title: q('.pp-title'),
      artist: q('.pp-artist'),
      seek: q('.pp-seek'),
      pos: q('.pp-pos'),
      dur: q('.pp-dur'),
      play: q('.pp-btn-play'),
      shuffle: q('.pp-shuffle'),
      like: q('.pp-like'),
      repeat: q('.pp-repeat'),
      volBtn: q('.pp-vol-btn'),
      volume: q('.pp-volume'),
      sleep: q('.pp-sleep'),
      tablist: q('.pp-tabs'),
      tabs: Array.prototype.slice.call(root.querySelectorAll('.pp-tab')),
      view: q('.pp-view'),
    };

    var self = this;
    root.addEventListener('click', function (e) { self.onClick(e); });
    this.el.seek.addEventListener('input', function (e) {
      self.s.pos = Number(e.target.value) || 0;
      self.updateTime();
      self.updateLyrics();
    });
    this.el.volume.addEventListener('input', function (e) {
      self.s.vol = Number(e.target.value) || 0;
      self.s.muted = false;
      self.updateVolume();
    });
    this.el.tablist.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var i = TABS.findIndex(function (t) { return t.id === self.s.tab; });
      var j = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
      self.s.tab = TABS[j].id;
      self.update();
      self.el.tabs[j].focus();
    });
  };

  Player.prototype.onClick = function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || !this.root.contains(btn)) return;
    var s = this.s;
    switch (btn.dataset.act) {
      case 'play': s.playing = !s.playing; break;
      case 'prev':
        if (s.pos > 3) s.pos = 0;
        else this.step(-1);
        break;
      case 'next': this.step(1); break;
      case 'shuffle': s.shuffle = !s.shuffle; break;
      case 'like': s.liked = !s.liked; break;
      case 'repeat': s.repeat = { off: 'all', all: 'one', one: 'off' }[s.repeat]; break;
      case 'mute': s.muted = !s.muted; break;
      case 'sleep': s.sleep = !s.sleep; break;
      case 'tab': s.tab = btn.dataset.tab; break;
      case 'queue': this.jump(btn.dataset.key); break;
      case 'line': s.pos = LYRIC_START + Number(btn.dataset.i) * LYRIC_STEP; break;
      case 'list': this.startList(Number(btn.dataset.i)); break;
      default: return;
    }
    this.update();
  };

  Player.prototype.jump = function (key) {
    if (!TRACKS[key]) return;
    this.s.cur = key;
    this.s.pos = 0;
    this.s.playing = true;
  };

  Player.prototype.step = function (dir) {
    var keys = this.queueKeys();
    var i = keys.indexOf(this.s.cur);
    var n = keys.length;
    this.jump(keys[i < 0 ? 0 : (i + dir + n) % n]);
  };

  Player.prototype.startList = function (i) {
    var p = PLAYLISTS[i];
    if (!p) return;
    this.s.list = i;
    this.s.queue = p.tracks.concat(ORDER.filter(function (k) { return p.tracks.indexOf(k) < 0; })).slice(0, 6);
    this.s.tab = 'queue';
    this.jump(p.tracks[0]);
  };

  Player.prototype.update = function () {
    var t = this.track();
    var s = this.s;
    var root = this.root;
    root.style.setProperty('--cover', t.cover);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-soft', t.soft);
    root.style.setProperty('--accent-text', this.theme === 'light' ? t.ink : t.accent);
    root.dataset.playing = String(s.playing);

    this.el.title.textContent = t.title;
    this.el.artist.textContent = t.byline;
    this.el.play.setAttribute('aria-label', s.playing ? 'Pause' : 'Play');
    this.toggle(this.el.shuffle, s.shuffle);
    this.toggle(this.el.like, s.liked);
    this.toggle(this.el.repeat, s.repeat !== 'off');
    this.el.repeat.classList.toggle('is-one', s.repeat === 'one');
    this.toggle(this.el.sleep, s.sleep);

    this.el.tabs.forEach(function (b) {
      var on = b.dataset.tab === s.tab;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    this.el.view.setAttribute('aria-labelledby', this.id + '-tab-' + s.tab);

    this.updateTime();
    this.updateVolume();

    var key = [s.tab, s.cur, s.list, (s.queue || []).join()].join('|');
    if (key !== this.viewKey) {
      this.viewKey = key;
      this.renderView();
    }
    this.updateLyrics();
  };

  Player.prototype.toggle = function (btn, on) {
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  };

  Player.prototype.updateTime = function () {
    var t = this.track();
    var pos = Math.min(t.dur, Math.max(0, this.s.pos));
    this.root.style.setProperty('--pct', ((pos / t.dur) * 100).toFixed(2) + '%');
    this.el.seek.max = String(t.dur);
    this.el.seek.value = String(pos);
    this.el.seek.setAttribute('aria-valuetext', fmt(pos) + ' of ' + fmt(t.dur));
    this.el.pos.textContent = fmt(pos);
    this.el.dur.textContent = fmt(t.dur);
  };

  Player.prototype.updateVolume = function () {
    var v = this.s.muted ? 0 : this.s.vol;
    this.root.style.setProperty('--vol', v + '%');
    this.el.volume.value = String(v);
    this.el.volBtn.dataset.level = v === 0 ? 'mute' : v < 50 ? 'mid' : 'up';
  };

  Player.prototype.renderView = function () {
    var s = this.s;
    var t = this.track();
    var html;

    if (s.tab === 'lyrics') {
      html = t.lyrics.length
        ? '<div class="pp-lyrics"><div class="pp-lyrics-lines">' +
          t.lyrics.map(function (line, i) {
            return '<button type="button" class="pp-line" data-act="line" data-i="' + i + '">' + esc(line) + '</button>';
          }).join('') +
          '</div></div>'
        : '<div class="pp-empty">No lyrics found</div>';
    } else if (s.tab === 'playlists') {
      html = '<div class="pp-list">' + PLAYLISTS.map(function (p, i) {
        var art = p.liked
          ? '<span class="pp-row-art pp-liked" aria-hidden="true">' + ICON.heart + '</span>'
          : '<span class="pp-row-art pp-mosaic" aria-hidden="true">' + p.tracks.map(function (k) {
              return '<span style="background: ' + TRACKS[k].cover + '"></span>';
            }).join('') + '</span>';
        var on = s.list === i;
        return '<button type="button" class="pp-row' + (on ? ' is-current' : '') + '" data-act="list" data-i="' + i + '"' + (on ? ' aria-current="true"' : '') + '>' +
          art +
          '<span class="pp-row-meta"><span class="pp-row-title">' + esc(p.title) + '</span><span class="pp-row-sub">' + esc(p.sub) + '</span></span>' +
          '</button>';
      }).join('') + '</div>';
    } else {
      html = '<div class="pp-list">' + this.queueKeys().map(function (k) {
        var q = TRACKS[k];
        var on = k === s.cur;
        return '<button type="button" class="pp-row' + (on ? ' is-current' : '') + '" data-act="queue" data-key="' + k + '"' + (on ? ' aria-current="true"' : '') + '>' +
          '<span class="pp-row-art" aria-hidden="true" style="background: ' + q.cover + '"></span>' +
          '<span class="pp-row-meta"><span class="pp-row-title">' + esc(q.title) + '</span><span class="pp-row-sub">' + esc(q.artist) + '</span></span>' +
          '</button>';
      }).join('') + '</div>';
    }

    this.el.view.innerHTML = html;
    this.lines = Array.prototype.slice.call(this.el.view.querySelectorAll('.pp-line'));
    this.linesWrap = this.el.view.querySelector('.pp-lyrics-lines');
  };

  // Highlight the line for the current position and keep it centered.
  Player.prototype.updateLyrics = function () {
    if (this.s.tab !== 'lyrics' || !this.lines || !this.lines.length) return;
    var pos = this.s.pos;
    var active = -1;
    this.lines.forEach(function (_, i) {
      if (LYRIC_START + i * LYRIC_STEP <= pos) active = i;
    });
    this.lines.forEach(function (el, i) { el.classList.toggle('is-active', i === active); });
    var focus = this.lines[Math.max(0, active)];
    var shift = this.el.view.clientHeight / 2 - (focus.offsetTop + focus.offsetHeight / 2);
    this.linesWrap.style.setProperty('--shift', Math.round(shift) + 'px');
  };

  // Advance one second at a time while on screen and playing.
  Player.prototype.play = function () {
    var self = this;
    this.onScreen = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.onScreen = entries[0].isIntersecting;
      }).observe(this.root);
    }
    setInterval(function () {
      if (!self.onScreen || document.hidden || !self.s.playing) return;
      self.s.pos += 1;
      if (self.s.pos >= self.track().dur) {
        if (self.s.repeat === 'one') self.s.pos = 0;
        else self.step(1);
        self.update();
        return;
      }
      self.updateTime();
      self.updateLyrics();
    }, 1000);
  };

  function mountAll() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-pp-player]'), function (host) {
      if (!host.firstElementChild) new Player(host);
    });
  }

  window.PinkPlayerDemo = { mountAll: mountAll };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
