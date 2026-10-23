/* =========================================================================
   Pink Player demo: the real popup (popup.html, popup.js and popup.css,
   copied unchanged from the extension) running on made-up data. This file
   stands in for chrome.* and for the YouTube Music tab: playback, Up Next,
   lyrics, playlists, search and queue edits.

   demo/popup.html?track=afterglow&theme=light

   Everything here is made up: songs, artists, covers, lyrics, playlists and
   search results.
   ========================================================================= */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var THEME = params.get('theme') === 'dark' ? 'dark' : 'light';

  // The popup follows the system theme; the demo sticks to one.
  Array.prototype.forEach.call(document.styleSheets, function (sheet) {
    var rules;
    try { rules = sheet.cssRules; } catch (e) { return; }
    Array.prototype.forEach.call(rules, function (rule) {
      if (rule.media && /prefers-color-scheme:\s*light/.test(rule.media.mediaText)) {
        rule.media.mediaText = THEME === 'light' ? 'all' : 'not all';
      }
    });
  });

  // The popup grabs keyboard focus when it opens. In a page, that would pull
  // focus (and Space, arrows) away from the page, so it waits until the
  // visitor clicks or tabs into the demo.
  var engaged = false;
  var realFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function () {
    if (engaged) return realFocus.apply(this, arguments);
  };
  window.focus = function () {};
  document.addEventListener('pointerdown', function () { engaged = true; }, true);
  document.addEventListener('keydown', function () { engaged = true; }, true);

  // ---- catalog ------------------------------------------------------------
  function cover(id) { return 'covers/' + id + '.webp'; }

  var TRACKS = {
    afterglow: { title: 'Afterglow', artist: 'Lumen Drive', album: 'Night Shift', year: 2025, dur: 208, art: 'afterglow',
      lyrics: ['We left the windows open', 'So the city could sing along', 'Every streetlight humming', 'A song we almost know', 'Hold the chorus for a minute', 'Then let it fade out slow', 'Stay inside the afterglow', 'Where the neon hours go', 'If the night is running over', 'Let it run a little more', 'Stay inside the afterglow', 'Stay a little more'] },
    lanterns: { title: 'Paper Lanterns', artist: 'Mira Sol', album: 'Sunday Tangerine', year: 2024, dur: 194, art: 'lanterns',
      lyrics: ['Paper lanterns on the water', 'Carry every word we kept', 'Sunday morning, slow and golden', 'Folding up the things we said', 'Light them one by one', 'Watch them drifting home', 'Paper lanterns on the water', 'Lighting up the way we go', 'Every wish a little brighter', 'Than the last one we let go'] },
    tide: { title: 'Low Tide', artist: 'Pale Harbor', album: 'Blue Hours', year: 2023, dur: 236, art: 'tide',
      lyrics: ['Counting waves until the morning', 'Salt still drying on your sleeve', 'Low tide, we can walk forever', 'Out to where the lighthouse sleeps', 'Leave your shoes beside the jetty', 'Leave the questions on the sand', 'Low tide, we can walk forever', 'Hold the ocean in your hand'] },
    static: { title: 'Pink Static', artist: 'Juno Park', album: 'Radio Days', year: 2025, dur: 182, art: 'static',
      lyrics: ['Radio between the stations', 'Pink static in my head', 'Every song I ever loved', 'Playing back the things you said', 'Turn it up, I can’t hear you', 'Turn it up, I’m almost there', 'Pink static on the stereo', 'Pink static everywhere'] },
    kingdom: { title: 'Small Kingdoms', artist: 'Okra Club', album: 'Greenhouse', year: 2022, dur: 221, art: 'kingdom' },
    seoul: { title: 'Seoul, 3 AM', artist: 'Hanbit', album: 'City Lights', year: 2024, dur: 199, art: 'seoul' },
    glasshouse: { title: 'Glasshouse', artist: 'Mono Bloom', album: 'Prism', year: 2023, dur: 247, art: 'glasshouse' },
    lemon: { title: 'Lemon Light', artist: 'Kiko Fern', album: 'Citrus', year: 2025, dur: 176, art: 'lemon' },
    // More made-up songs, so search has something to find
    regents: { title: 'Regent’s Park', artist: 'Lumen Drive', album: 'Night Shift', year: 2025, dur: 178, art: 'afterglow' },
    regentsAcoustic: { title: 'Regent’s Park (Acoustic)', artist: 'Mira Sol', album: 'Sunday Tangerine', year: 2024, dur: 192, art: 'lanterns' },
    morningPark: { title: 'Morning in Regent’s Park', artist: 'Pale Harbor', album: 'Blue Hours', year: 2023, dur: 245, art: 'tide' },
    sixPm: { title: 'Regent’s Park, 6 PM', artist: 'Okra Club', album: 'Greenhouse', year: 2022, dur: 221, art: 'kingdom' },
    parkLights: { title: 'Park Lights', artist: 'Hanbit', album: 'City Lights', year: 2024, dur: 199, art: 'seoul' },
    nightVersion: { title: 'Regent’s Park (Night Version)', artist: 'Juno Park', album: 'Radio Days', year: 2025, dur: 167, art: 'static' },
    walkPark: { title: 'Walk Through the Park', artist: 'Mono Bloom', album: 'Prism', year: 2023, dur: 273, art: 'glasshouse' },
    neonRain: { title: 'Neon Rain', artist: 'Lumen Drive', album: 'Night Shift', year: 2025, dur: 201, art: 'afterglow' },
    orangeHour: { title: 'Orange Hour', artist: 'Mira Sol', album: 'Sunday Tangerine', year: 2024, dur: 187, art: 'lanterns' },
    lighthouse: { title: 'Lighthouse', artist: 'Pale Harbor', album: 'Blue Hours', year: 2023, dur: 229, art: 'tide' },
    midnightRadio: { title: 'Midnight Radio', artist: 'Juno Park', album: 'Radio Days', year: 2025, dur: 195, art: 'static' },
    fern: { title: 'Fern & Stone', artist: 'Okra Club', album: 'Greenhouse', year: 2022, dur: 214, art: 'kingdom' },
    hangang: { title: 'Han River Lights', artist: 'Hanbit', album: 'City Lights', year: 2024, dur: 206, art: 'seoul' },
    prism: { title: 'Prism', artist: 'Mono Bloom', album: 'Prism', year: 2023, dur: 238, art: 'glasshouse' },
    zest: { title: 'Zest', artist: 'Kiko Fern', album: 'Citrus', year: 2025, dur: 162, art: 'lemon' },
  };
  Object.keys(TRACKS).forEach(function (id) {
    var t = TRACKS[id];
    t.id = id;
    t.byline = t.artist + ' • ' + t.album + ' • ' + t.year;
  });

  var ARTISTS = {};
  Object.keys(TRACKS).forEach(function (id) {
    var t = TRACKS[id];
    (ARTISTS[t.artist] = ARTISTS[t.artist] || { name: t.artist, art: t.art, tracks: [] }).tracks.push(id);
  });
  var ALBUMS = {};
  Object.keys(TRACKS).forEach(function (id) {
    var t = TRACKS[id];
    (ALBUMS[t.album] = ALBUMS[t.album] || { title: t.album, artist: t.artist, year: t.year, art: t.art, tracks: [] }).tracks.push(id);
  });

  var LIKED = ['static', 'afterglow', 'lemon', 'tide', 'kingdom', 'seoul', 'glasshouse', 'lanterns'];
  var PLAYLISTS = [
    { id: 'liked', title: 'Liked Music', sub: 'Auto playlist', art: 'pl0', tracks: LIKED },
    { id: 'late', title: 'Late-night coding', sub: 'Playlist • 64 songs', art: 'pl1', tracks: ['seoul', 'afterglow', 'glasshouse', 'tide', 'neonRain', 'midnightRadio', 'prism'] },
    { id: 'sunday', title: 'Sunday reset', sub: 'Playlist • 27 songs', art: 'pl2', tracks: ['lanterns', 'lemon', 'kingdom', 'static', 'orangeHour', 'fern', 'zest'] },
    { id: 'lofi', title: 'Lo-fi for focus', sub: 'Playlist • 112 songs', art: 'pl3', tracks: ['kingdom', 'glasshouse', 'seoul', 'afterglow', 'fern', 'prism', 'hangang'] },
    { id: 'commute', title: 'Morning commute', sub: 'Playlist • 41 songs', art: 'pl4', tracks: ['tide', 'lemon', 'lanterns', 'afterglow', 'lighthouse', 'zest', 'parkLights'] },
    { id: 'run', title: 'Run club 160', sub: 'Playlist • 35 songs', art: 'pl5', tracks: ['lemon', 'static', 'seoul', 'lanterns', 'zest', 'neonRain', 'hangang'] },
  ];

  // ---- the "YouTube Music tab" ---------------------------------------------
  var uidSeq = 0;
  function item(id) { return { uid: ++uidSeq, id: id }; }

  var start = TRACKS[params.get('track')] ? params.get('track') : 'afterglow';
  var S = {
    queue: (LIKED.indexOf(start) >= 0 ? LIKED : [start].concat(LIKED)).map(item),
    current: 0,
    from: 'Liked Music',
    playing: params.get('paused') === null,
    position: Number(params.get('position')) || 38,
    volume: 0.72,
    muted: false,
    liked: { static: true, afterglow: true, lemon: true, tide: true, kingdom: true, seoul: true, glasshouse: true, lanterns: true },
    shuffle: false,
    repeat: 'off',
    sleep: null,
  };
  S.current = Math.max(0, S.queue.findIndex(function (q) { return q.id === start; }));

  var listeners = [];
  function emit(msg) {
    listeners.forEach(function (fn) {
      try { fn(msg); } catch (e) { /* popup handles its own errors */ }
    });
  }
  function track() { return TRACKS[S.queue[S.current].id]; }

  function row(q, index, extra) {
    var t = TRACKS[q.id];
    var r = {
      title: t.title, artist: t.artist, artUrl: cover(t.art), videoId: q.id, index: index,
      isPlayed: false, isCurrent: false, durationSeconds: t.dur,
    };
    for (var k in extra) r[k] = extra[k];
    return r;
  }

  function snapshot() {
    var t = track();
    var rows = [];
    for (var i = Math.max(0, S.current - 2); i < S.current; i++) rows.push(row(S.queue[i], i, { isPlayed: true }));
    rows.push(row(S.queue[S.current], S.current, { isCurrent: true }));
    for (var j = S.current + 1; j < S.queue.length && j <= S.current + 20; j++) rows.push(row(S.queue[j], j));
    return {
      hasPlayer: true,
      isPlaying: S.playing,
      position: S.position,
      duration: t.dur,
      volume: S.muted ? 0 : S.volume,
      isMuted: S.muted,
      title: t.title,
      artist: t.byline,
      artistName: t.artist,
      artUrl: cover(t.art),
      isLiked: !!S.liked[t.id],
      isShuffled: S.shuffle,
      repeatMode: S.repeat,
      playbackBlocked: false,
      queue: rows,
      queueFrom: S.from,
    };
  }
  function push() { emit({ type: 'stateUpdate', state: snapshot() }); }

  function goTo(index) {
    S.current = Math.max(0, Math.min(S.queue.length - 1, index));
    S.position = 0;
    S.playing = true;
  }
  function ended() {
    if (S.sleep && S.sleep.mode === 'track') {
      S.playing = false;
      S.sleep = null;
      emit({ type: 'sleepUpdate', sleep: null });
      return;
    }
    if (S.repeat === 'one') { S.position = 0; return; }
    if (S.current < S.queue.length - 1) goTo(S.current + 1);
    else if (S.repeat === 'all') goTo(0);
    else { S.playing = false; S.position = track().dur; }
  }

  setInterval(function () {
    if (S.sleep && S.sleep.mode === 'minutes' && Date.now() >= S.sleep.firesAt) {
      S.playing = false;
      S.sleep = null;
      emit({ type: 'sleepUpdate', sleep: null });
      push();
    }
    if (!S.playing) return;
    S.position += 1;
    if (S.position >= track().dur) ended();
    push();
  }, 1000);

  // Start a new queue the way YouTube Music does: the song, then a mix.
  function startQueue(ids, from, index) {
    S.queue = ids.map(item);
    S.from = from;
    S.shuffle = false;
    goTo(index || 0);
  }
  function mixFor(id) {
    var t = TRACKS[id];
    var others = Object.keys(TRACKS).filter(function (k) { return k !== id; });
    others.sort(function (a, b) {
      var sa = (TRACKS[a].artist === t.artist ? 0 : 1) + (TRACKS[a].album === t.album ? 0 : 1);
      var sb = (TRACKS[b].artist === t.artist ? 0 : 1) + (TRACKS[b].album === t.album ? 0 : 1);
      return sa - sb;
    });
    return [id].concat(others.slice(0, 14));
  }
  function shuffled(ids) {
    var a = ids.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }

  function command(name, payload) {
    payload = payload || {};
    switch (name) {
      case 'play': S.playing = true; if (S.position >= track().dur) S.position = 0; break;
      case 'pause': S.playing = false; break;
      case 'next':
        if (S.current < S.queue.length - 1) goTo(S.current + 1);
        else if (S.repeat === 'all') goTo(0);
        break;
      case 'previous':
        if (S.position > 5 || S.current === 0) S.position = 0;
        else goTo(S.current - 1);
        break;
      case 'seek': S.position = Math.max(0, Math.min(track().dur - 1, Number(payload.position) || 0)); break;
      case 'setVolume': S.volume = Math.max(0, Math.min(1, Number(payload.volume))); S.muted = false; break;
      case 'toggleMute': S.muted = !S.muted; break;
      case 'toggleLike': S.liked[track().id] = !S.liked[track().id]; break;
      case 'toggleShuffle':
        S.shuffle = !S.shuffle;
        if (S.shuffle) {
          var rest = S.queue.slice(S.current + 1);
          S.queue = S.queue.slice(0, S.current + 1).concat(shuffled(rest));
        }
        break;
      case 'toggleRepeat': S.repeat = { off: 'all', all: 'one', one: 'off' }[S.repeat]; break;
      case 'playQueueItem': {
        var at = Number(payload.index);
        if (!(at >= 0 && S.queue[at] && S.queue[at].id === payload.videoId)) {
          at = S.queue.findIndex(function (q) { return q.id === payload.videoId; });
        }
        if (at >= 0) goTo(at);
        break;
      }
      default: break;
    }
    setTimeout(push, 60);
    return { ok: true };
  }

  // ---- search ---------------------------------------------------------------
  function norm(s) { return String(s || '').toLowerCase().replace(/[’']/g, '\'').trim(); }
  function fmt(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  var PLAYS = ['14M plays', '3.2M plays', '980K plays', '410K plays', '2.7M plays', '86K plays'];

  function songItem(id, inFilter, n) {
    var t = TRACKS[id];
    return {
      key: 'v:' + id,
      kind: 'song',
      title: t.title,
      subtitle: inFilter ? t.artist + ' • ' + t.album + ' • ' + fmt(t.dur) : 'Song • ' + t.artist + ' • ' + PLAYS[(n || 0) % PLAYS.length],
      thumb: cover(t.art),
      explicit: false,
      play: { watchEndpoint: { videoId: id } },
      next: { queueAddEndpoint: { queueTarget: { videoId: id }, queueInsertPosition: 'INSERT_AFTER_CURRENT_VIDEO' } },
      end: { queueAddEndpoint: { queueTarget: { videoId: id }, queueInsertPosition: 'INSERT_AT_END' } },
      mix: null,
    };
  }
  function artistItem(a) {
    return {
      key: 'b:artist-' + a.name,
      kind: 'artist',
      title: a.name,
      subtitle: 'Artist • ' + (a.tracks.length * 137) + 'K monthly audience',
      thumb: cover(a.art),
      explicit: false,
      play: { watchPlaylistEndpoint: { playlistId: 'RDAO-' + a.name } },
      next: null,
      end: null,
      mix: { watchPlaylistEndpoint: { playlistId: 'RDEM-' + a.name } },
    };
  }
  function albumItem(al) {
    return {
      key: 'b:album-' + al.title,
      kind: 'album',
      title: al.title,
      subtitle: 'Album • ' + al.artist + ' • ' + al.year,
      thumb: cover(al.art),
      explicit: false,
      play: { watchPlaylistEndpoint: { playlistId: 'OLAK-' + al.title } },
      next: { queueAddEndpoint: { queueTarget: { playlistId: 'OLAK-' + al.title }, queueInsertPosition: 'INSERT_AFTER_CURRENT_VIDEO' } },
      end: { queueAddEndpoint: { queueTarget: { playlistId: 'OLAK-' + al.title }, queueInsertPosition: 'INSERT_AT_END' } },
      mix: null,
    };
  }
  function playlistItem(pl) {
    return {
      key: 'b:pl-' + pl.id,
      kind: 'playlist',
      title: pl.title,
      subtitle: 'Playlist • Pink Player • ' + pl.tracks.length + ' songs',
      thumb: cover(pl.art),
      explicit: false,
      play: { watchPlaylistEndpoint: { playlistId: 'PL-' + pl.id } },
      next: { queueAddEndpoint: { queueTarget: { playlistId: 'PL-' + pl.id }, queueInsertPosition: 'INSERT_AFTER_CURRENT_VIDEO' } },
      end: { queueAddEndpoint: { queueTarget: { playlistId: 'PL-' + pl.id }, queueInsertPosition: 'INSERT_AT_END' } },
      mix: null,
    };
  }

  function score(text, q) {
    var t = norm(text);
    if (!q) return 0;
    if (t === q) return 3;
    if (t.indexOf(q) === 0) return 2;
    if (t.indexOf(q) >= 0) return 1;
    var words = q.split(/\s+/);
    return words.every(function (w) { return t.indexOf(w) >= 0; }) ? 0.5 : 0;
  }
  function songsFor(q) {
    var ids = Object.keys(TRACKS);
    var hits = ids
      .map(function (id) {
        var t = TRACKS[id];
        return { id: id, s: Math.max(score(t.title, q) * 2, score(t.artist, q), score(t.album, q) * 0.8) };
      })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (x) { return x.id; });
    // Like YouTube Music, keep going with looser matches.
    return hits.concat(ids.filter(function (id) { return hits.indexOf(id) < 0; })).slice(0, 20);
  }

  var CHIPS = [
    { label: 'Songs', params: 'songs' },
    { label: 'Albums', params: 'albums' },
    { label: 'Artists', params: 'artists' },
    { label: 'Community playlists', params: 'playlists' },
  ];

  function search(query, params) {
    var q = norm(query);
    var songs = songsFor(q);
    var artists = Object.keys(ARTISTS).map(function (k) { return ARTISTS[k]; })
      .filter(function (a) { return score(a.name, q) > 0; });
    var albums = Object.keys(ALBUMS).map(function (k) { return ALBUMS[k]; })
      .filter(function (al) { return score(al.title, q) > 0 || score(al.artist, q) > 0; });
    var lists = PLAYLISTS.filter(function (pl) { return pl.id !== 'liked' && pl.tracks.some(function (id) { return songs.slice(0, 4).indexOf(id) >= 0; }); });
    if (params === 'songs') return { items: songs.map(function (id) { return songItem(id, true); }) };
    if (params === 'albums') return { items: (albums.length ? albums : Object.keys(ALBUMS).map(function (k) { return ALBUMS[k]; })).map(albumItem) };
    if (params === 'artists') return { items: (artists.length ? artists : Object.keys(ARTISTS).map(function (k) { return ARTISTS[k]; })).map(artistItem) };
    if (params === 'playlists') return { items: (lists.length ? lists : PLAYLISTS.slice(1)).map(playlistItem) };
    var top = artists.length && score(artists[0].name, q) >= 2 ? artistItem(artists[0]) : songItem(songs[0], false, 0);
    var items = [];
    songs.slice(top.kind === 'song' ? 1 : 0, 7).forEach(function (id, n) { items.push(songItem(id, false, n + 1)); });
    if (artists[0] && top.kind !== 'artist') items.splice(2, 0, artistItem(artists[0]));
    albums.slice(0, 2).forEach(function (al) { items.push(albumItem(al)); });
    lists.slice(0, 2).forEach(function (pl) { items.push(playlistItem(pl)); });
    songs.slice(7, 12).forEach(function (id, n) { items.push(songItem(id, false, n + 3)); });
    return { top: top, items: items, chips: CHIPS };
  }

  function suggest(input) {
    var q = norm(input);
    if (!q) return { queries: [], items: [] };
    var seen = {};
    var queries = [];
    function add(text) {
      var t = norm(text);
      if (seen[t] || t.indexOf(q) < 0 || queries.length >= 3) return;
      seen[t] = true;
      var i = t.indexOf(q);
      var runs = [];
      if (i > 0) runs.push({ text: t.slice(0, i), bold: false });
      runs.push({ text: t.slice(i, i + q.length), bold: true });
      if (i + q.length < t.length) runs.push({ text: t.slice(i + q.length), bold: false });
      queries.push({ query: t, runs: runs });
    }
    Object.keys(TRACKS).forEach(function (id) { add(TRACKS[id].title); });
    Object.keys(ARTISTS).forEach(function (name) { add(name); });
    Object.keys(TRACKS).forEach(function (id) { add(TRACKS[id].title + ' ' + TRACKS[id].artist); });
    if (!queries.length) queries.push({ query: q, runs: [{ text: q, bold: true }] });
    var songs = songsFor(q).filter(function (id) {
      var t = TRACKS[id];
      return score(t.title, q) > 0 || score(t.artist, q) > 0;
    });
    var items = songs.slice(0, 3).map(function (id, n) { return songItem(id, false, n); });
    return { queries: queries, items: items };
  }

  function idsForTarget(target) {
    if (target.videoId) return TRACKS[target.videoId] ? [target.videoId] : [];
    var id = String(target.playlistId || '');
    if (id.indexOf('OLAK-') === 0) return (ALBUMS[id.slice(5)] || { tracks: [] }).tracks.slice();
    if (id.indexOf('PL-') === 0) {
      var pl = PLAYLISTS.filter(function (p) { return p.id === id.slice(3); })[0];
      return pl ? pl.tracks.slice() : [];
    }
    return [];
  }

  function searchAction(payload) {
    var ep = payload.endpoint || {};
    if (payload.action === 'play') {
      if (ep.watchEndpoint && TRACKS[ep.watchEndpoint.videoId]) {
        var id = ep.watchEndpoint.videoId;
        startQueue(mixFor(id), TRACKS[id].title + ' Mix');
      } else if (ep.watchPlaylistEndpoint) {
        var pid = String(ep.watchPlaylistEndpoint.playlistId || '');
        if (pid.indexOf('RDAO-') === 0) startQueue(shuffled(ARTISTS[pid.slice(5)].tracks), pid.slice(5));
        else if (pid.indexOf('RDEM-') === 0) startQueue(mixFor(ARTISTS[pid.slice(5)].tracks[0]), pid.slice(5) + ' Mix');
        else if (pid.indexOf('OLAK-') === 0) startQueue(ALBUMS[pid.slice(5)].tracks.slice(), pid.slice(5));
        else if (pid.indexOf('PL-') === 0) {
          var pl = PLAYLISTS.filter(function (p) { return p.id === pid.slice(3); })[0];
          if (!pl) return { status: 'error', reason: 'not-found' };
          var shuffle = ep.watchPlaylistEndpoint.params === 'shuffle';
          startQueue(shuffle ? shuffled(pl.tracks) : pl.tracks.slice(), pl.title);
        } else return { status: 'error', reason: 'not-found' };
      } else return { status: 'error', reason: 'bad-endpoint' };
      setTimeout(push, 120);
      return { status: 'ok' };
    }
    if (payload.action === 'queue' && ep.queueAddEndpoint) {
      var add = ep.queueAddEndpoint;
      var ids = idsForTarget(add.queueTarget || {});
      if (!ids.length) return { status: 'error', reason: 'empty' };
      var at = add.queueInsertPosition === 'INSERT_AFTER_CURRENT_VIDEO' ? S.current + 1 : S.queue.length;
      Array.prototype.splice.apply(S.queue, [at, 0].concat(ids.map(item)));
      setTimeout(push, 120);
      return { status: 'ok' };
    }
    return { status: 'error', reason: 'unknown-action' };
  }

  var removed = {};
  var removedSeq = 0;
  function queueRemove(payload) {
    var at = Number(payload.index);
    if (!(at >= 0 && S.queue[at] && S.queue[at].id === payload.videoId)) {
      at = S.queue.findIndex(function (q, i) { return i !== S.current && q.id === payload.videoId; });
    }
    if (at < 0) return { status: 'error', reason: 'not-found' };
    if (at === S.current) return { status: 'error', reason: 'current' };
    var token = 'rm-' + (++removedSeq);
    removed[token] = { q: S.queue[at], index: at };
    S.queue.splice(at, 1);
    if (at < S.current) S.current -= 1;
    setTimeout(push, 60);
    return { status: 'ok', token: token };
  }
  function queueUndoRemove(payload) {
    var saved = removed[payload.token];
    if (!saved) return { status: 'error', reason: 'expired' };
    delete removed[payload.token];
    var at = Math.min(saved.index, S.queue.length);
    S.queue.splice(at, 0, item(saved.q.id));
    if (at <= S.current) S.current += 1;
    setTimeout(push, 60);
    return { status: 'ok' };
  }

  function pageRequest(kind, payload) {
    payload = payload || {};
    switch (kind) {
      case 'searchSuggest': {
        var sg = suggest(payload.input);
        return { status: 'ok', queries: sg.queries, items: sg.items };
      }
      case 'search': {
        var r = search(payload.query, payload.params);
        return { status: 'ok', signedIn: false, top: r.top || null, items: r.items, chips: r.chips || [], continuation: null };
      }
      case 'searchMore': return { status: 'ok', items: [], continuation: null };
      case 'searchAction': return searchAction(payload);
      case 'queueRemove': return queueRemove(payload);
      case 'queueUndoRemove': return queueUndoRemove(payload);
      default: return { status: 'error', reason: 'unknown-request' };
    }
  }

  function lrc(t) {
    if (!t.lyrics) return null;
    var step = Math.max(6, Math.floor((t.dur - 20) / t.lyrics.length));
    return t.lyrics.map(function (line, i) {
      var s = 8 + i * step;
      return '[' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') + '.00] ' + line;
    }).join('\n');
  }

  // ---- chrome.* ---------------------------------------------------------------
  function later(value, ms) {
    return new Promise(function (resolve) { setTimeout(function () { resolve(value); }, ms || 0); });
  }

  function handle(msg) {
    switch (msg && msg.type) {
      case 'getState': return later({ state: snapshot() }, 30);
      case 'command': return later(command(msg.command, msg.payload), 20);
      case 'proStatus': return later({ pro: true, reason: 'demo' }, 20);
      case 'sleepGet': return later({ sleep: S.sleep }, 20);
      case 'sleepSet':
        S.sleep = msg.mode === 'track'
          ? { active: true, mode: 'track' }
          : { active: true, mode: 'minutes', totalMinutes: msg.minutes, firesAt: Date.now() + msg.minutes * 60000 };
        setTimeout(function () { emit({ type: 'sleepUpdate', sleep: S.sleep }); }, 20);
        return later({ sleep: S.sleep }, 20);
      case 'sleepCancel':
        S.sleep = null;
        setTimeout(function () { emit({ type: 'sleepUpdate', sleep: null }); }, 20);
        return later({ ok: true }, 20);
      case 'fetchLyrics': {
        var q = msg.query || {};
        var t = Object.keys(TRACKS).map(function (k) { return TRACKS[k]; })
          .filter(function (x) { return x.title === q.title; })[0];
        var text = t && lrc(t);
        return later(text ? { syncedLyrics: text } : { error: 'not-found' }, 180);
      }
      case 'getUserPlaylists':
        return later({
          status: 'ok',
          playlists: PLAYLISTS.map(function (pl) {
            return {
              title: pl.title,
              subtitle: pl.sub,
              thumbnail: cover(pl.art),
              playEndpoint: { watchPlaylistEndpoint: { playlistId: 'PL-' + pl.id } },
              shuffleEndpoint: { watchPlaylistEndpoint: { playlistId: 'PL-' + pl.id, params: 'shuffle' } },
              nextEndpoint: { queueAddEndpoint: { queueTarget: { playlistId: 'PL-' + pl.id }, queueInsertPosition: 'INSERT_AFTER_CURRENT_VIDEO' } },
            };
          }),
        }, 350);
      case 'playUserPlaylist':
        searchAction({ action: 'play', endpoint: msg.payload && msg.payload.playEndpoint });
        return later({ ok: true }, 20);
      case 'pageRequest': {
        var kind = msg.kind;
        var wait = kind === 'search' ? 420 : kind === 'searchSuggest' ? 140 : 160;
        return later(pageRequest(kind, msg.payload), wait);
      }
      default:
        // Pop-out, the art button and the like have no YouTube Music tab
        // to go to here.
        return later({ ok: true }, 20);
    }
  }

  var store = {};
  window.chrome = {
    runtime: {
      sendMessage: function (msg) { return handle(msg); },
      onMessage: { addListener: function (fn) { listeners.push(fn); } },
    },
    storage: {
      local: {
        get: function (key) {
          var out = {};
          if (typeof key === 'string') out[key] = store[key];
          return Promise.resolve(out);
        },
        set: function (obj) {
          for (var k in obj) store[k] = obj[k];
          return Promise.resolve();
        },
      },
    },
    tabs: {
      create: function (opts) {
        if (opts && opts.url) window.open(opts.url, '_blank', 'noopener');
        return Promise.resolve({});
      },
    },
  };
})();
