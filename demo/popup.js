// Popup brain: state ↔ DOM, adaptive color, Up Next, lyrics, Playlists (Pro),
// search, keyboard shortcuts, toasts, popout.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const body = document.body;
const $title = $('.title');
const $artist = $('.artist');
const $titleWrap = $('.title-wrap');
const $artistBtn = $('#artist-btn');
const $art = $('.art');
const $artWrap = $('.art-wrap');
const $miniArt = $('.mini-art-img');
const $miniTitle = $('.mini-title');
const $miniArtist = $('.mini-artist');
const $timePos = $('.time-pos');
const $timeDur = $('.time-dur');
const $fill = $('.scrubber-fill');
const $thumb = $('.scrubber-thumb');
const $scrubber = $('.scrubber');
const $scrubberTrack = $('.scrubber-track');
const $shuffleBtn = $('.btn-shuffle');
const $likeBtn = $('.btn-like');
const $repeatBtn = $('.btn-repeat');
const $volSlider = $('#vol-slider');
const $volBtn = $('#vol-btn');
const $popoutBtn = $('#popout-btn');
const $panelBody = $('.panel-body');
const $scrollThumb = $('.scroll-thumb');
const $queueView = $('.queue-view');
const $lyricsView = $('.lyrics-view');
const $lyricsLines = $('.lyrics-lines');
const $lyricsSource = $('.lyrics-source');
const $playlistsView = $('.playlists-view');
const $searchView = $('.search-view');
const $tabs = $$('.tab');
const $emptyMsg = $('#empty-msg');
const $emptyHint = $('#empty-hint');
const $retryYtmBtn = $('#retry-ytm');
const $reloadYtmBtn = $('#reload-ytm');
const $openYtmBtn = $('#open-ytm');
const $notice = $('#notice');
const $noticeTitle = $('.notice-title');
const $noticeBody = $('.notice-body');
const $noticeAction = $('#notice-action');
const $toast = $('#toast');

const isFloating = new URLSearchParams(location.search).get('floating') === '1';
// Key names as the keyboard prints them: ⌘ ⇧ on a Mac, Ctrl+ Shift+ elsewhere.
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const MOD = isMac ? '⌘' : 'Ctrl+';
const SHIFT = isMac ? '⇧' : 'Shift+';
const isChromiumShell = /\b(?:Chrome|Chromium|Edg|OPR)\//.test(navigator.userAgent);
if (isChromiumShell) {
  document.documentElement.classList.add('chromium-shell');
  body.classList.add('chromium-shell');
}
if (isFloating) {
  document.documentElement.classList.add('floating');
  body.classList.add('floating');
}

let current = null;
let isDragging = false;
let pendingSeek = null;
let isDraggingVol = false;
let lastArtUrl = '';
let lastTrackKey = '';
let currentLyrics = []; // [{time, text}]
let lyricsLineNodes = []; // matching DOM nodes
let activeLyricIdx = -1;
let playlistsLoaded = false;
let playlistsLoading = false;
let playlistsLastLoadedAt = 0;
let playlistItems = [];
let proStatus = null; // { pro, reason, checkoutUrl, keyRevoked } from background
let activeTab = 'queue';
let reconnectTimer = null;
let reconnectAttempt = 0;
let commandFailed = false;
let reloadingUntil = 0;
let likeHint = null; // { liked, until }: the like we just sent, until the page agrees

const ICON_PATHS = {
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  moon: 'M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5 6.5 6.5 0 0 0 20.5 13.5z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  recent: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  fill: 'M5 15h2V8.41L18.59 20 20 18.59 8.41 7H15V5H5z',
  playNext: 'M4 3.5v7l5.5-3.5zM11 6h9v2h-9zM4 12h16v2H4zM4 17h16v2H4z',
  addQueue: 'M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z',
  shuffle: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
  mix: 'M7.76 16.24C6.67 15.16 6 13.66 6 12s.67-3.16 1.76-4.24l1.42 1.42C8.45 9.9 8 10.9 8 12c0 1.1.45 2.1 1.17 2.83l-1.41 1.41zm8.48 0C17.33 15.16 18 13.66 18 12s-.67-3.16-1.76-4.24l-1.42 1.42C15.55 9.9 16 10.9 16 12c0 1.1-.45 2.1-1.17 2.83l1.41 1.41zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 2c0 2.21-.9 4.21-2.35 5.65l1.42 1.42C20.88 17.26 22 14.76 22 12s-1.12-5.26-2.93-7.07l-1.42 1.42A7.94 7.94 0 0 1 20 12zM6.35 6.35L4.93 4.93C3.12 6.74 2 9.24 2 12s1.12 5.26 2.93 7.07l1.42-1.42C4.9 16.21 4 14.21 4 12s.9-4.21 2.35-5.65z',
  play: 'M8 5v14l11-7z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
};

function icon(name, cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON_PATHS[name]}"/></svg>`;
}

// =========================================================================
// Formatting + state machine
// =========================================================================
function fmt(s) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
function escapeAttr(s) { return escapeHTML(s); }

function setRootState(name) {
  body.classList.remove('state-loading', 'state-empty', 'state-paused', 'state-playing');
  body.classList.add(`state-${name}`);
}

function isPlayerShown() {
  return body.classList.contains('state-playing') || body.classList.contains('state-paused');
}

// `reload`: a YouTube Music tab exists but isn't answering, so offer to
// reload it instead of opening another one.
function emptyCopy(reason, isFinal = false) {
  if (!isFinal && (reason === 'checking-ytm-tabs' || reason === 'connecting-ytm-tab')) {
    return {
      msg: 'Connecting to YouTube Music...',
      hint: 'If it stays here, reload the YouTube Music tab once or allow Pink Player on music.youtube.com.',
      reload: reason === 'connecting-ytm-tab',
    };
  }
  if (reason === 'ytm-tab-not-ready') {
    return {
      msg: 'YouTube Music needs a refresh.',
      hint: 'Reload the YouTube Music tab once to reconnect.',
      reload: true,
    };
  }
  if (reason === 'no-ytm-tab') {
    return {
      msg: 'YouTube Music isn’t open',
      hint: 'Open it in any tab and Pink Player connects on its own. Search and your queue come back with it.',
      reload: false,
    };
  }
  return {
    msg: 'YouTube Music is not connected.',
    hint: 'If it is already open, reload that tab or allow Pink Player on music.youtube.com.',
    reload: reason === 'connecting-ytm-tab',
  };
}

function showEmpty(reason = 'no-ytm-tab', opts = {}) {
  const copy = emptyCopy(reason, !!opts.final);
  $emptyMsg.textContent = copy.msg;
  $emptyHint.textContent = copy.hint;
  $reloadYtmBtn.hidden = !copy.reload;
  $openYtmBtn.hidden = !!copy.reload;
  closeOverlays();
  setRootState('empty');
}

// Reloading the tab re-attaches content.js when it stopped answering (after an
// extension update, or Safari unloading the tab), which is what users would
// otherwise do by hand.
function reloadYtmTab() {
  stopReconnect();
  commandFailed = false;
  reloadingUntil = Date.now() + 15000;
  setRootState('loading');
  chrome.runtime.sendMessage({ type: 'reloadYtm' })
    .then((resp) => {
      if (resp?.state?.hasPlayer) {
        render(resp.state);
      } else if (resp?.reason === 'no-ytm-tab') {
        reloadingUntil = 0;
        showEmpty('no-ytm-tab', { final: true });
      }
    })
    .catch(() => {});
  setTimeout(() => {
    if (!body.classList.contains('state-loading')) return;
    reloadingUntil = 0;
    showEmpty('ytm-tab-not-ready', { final: true });
  }, 15500);
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function stopReconnect() {
  clearReconnectTimer();
  reconnectAttempt = 0;
}

// Background replies can hang when the YouTube Music tab is busy or gone;
// the popup never waits longer than this.
function withTimeout(promise, ms, fallback) {
  let timer = null;
  return Promise.race([
    promise,
    new Promise((resolve) => { timer = setTimeout(() => resolve(fallback), ms); }),
  ]).finally(() => clearTimeout(timer));
}

// Search and queue edits, answered by the YouTube Music tab.
function pageRequest(kind, payload, timeoutMs = 12000) {
  return withTimeout(
    chrome.runtime.sendMessage({ type: 'pageRequest', kind, payload }),
    timeoutMs,
    { status: 'error', reason: 'timeout' },
  )
    .then((resp) => resp || { status: 'error', reason: 'no-response' })
    .catch(() => ({ status: 'error', reason: 'no-response' }));
}

// =========================================================================
// Adaptive color extraction (dominant, saturated color from album art)
// =========================================================================
function extractColor(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const SIZE = 28;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      let data;
      try {
        data = ctx.getImageData(0, 0, SIZE, SIZE).data;
      } catch {
        return resolve(null);
      }
      let r = 0, g = 0, b = 0, totalWeight = 0;
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2];
        const max = Math.max(pr, pg, pb);
        const min = Math.min(pr, pg, pb);
        if (max < 24 || min > 232) continue; // skip near-black / near-white
        const sat = (max - min) / Math.max(max, 1);
        const weight = Math.pow(sat, 1.4) + 0.06;
        r += pr * weight;
        g += pg * weight;
        b += pb * weight;
        totalWeight += weight;
      }
      if (totalWeight === 0) return resolve(null);
      let avgR = r / totalWeight;
      let avgG = g / totalWeight;
      let avgB = b / totalWeight;
      // Boost saturation
      const avg = (avgR + avgG + avgB) / 3;
      const boost = 1.25;
      avgR = Math.max(0, Math.min(255, avg + (avgR - avg) * boost));
      avgG = Math.max(0, Math.min(255, avg + (avgG - avg) * boost));
      avgB = Math.max(0, Math.min(255, avg + (avgB - avg) * boost));
      // Brighten dim accents so they show on dark glass
      const luma = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
      if (luma < 80) {
        const k = 80 / Math.max(luma, 1);
        avgR = Math.min(255, avgR * k);
        avgG = Math.min(255, avgG * k);
        avgB = Math.min(255, avgB * k);
      }
      resolve({ r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function applyColor(c) {
  const root = document.documentElement;
  if (!c) {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-soft');
    root.style.removeProperty('--accent-strong');
    return;
  }
  const { r, g, b } = c;
  root.style.setProperty('--accent', `rgb(${r}, ${g}, ${b})`);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.16)`);
  root.style.setProperty('--accent-strong', `rgba(${r}, ${g}, ${b}, 0.95)`);
}

// =========================================================================
// Toast: one at a time, bottom center. Undo when the action can be undone.
// =========================================================================
let toastTimer = null;
let toastUndo = null;

function toast({ icon: kind = 'check', label, title = '', undo = null, ms = 2200 }) {
  clearTimeout(toastTimer);
  const glyph = kind === 'heart' ? icon('heart', 'is-heart')
    : kind === 'moon' ? icon('moon', 'is-moon')
      : icon('check');
  $toast.innerHTML = `${glyph}<span class="toast-label">${escapeHTML(label)}</span>` +
    `<span class="toast-title">${escapeHTML(title)}</span>` +
    (undo ? '<button class="toast-undo" type="button">Undo</button>' : '');
  toastUndo = undo;
  $toast.hidden = false;
  // Restart the entrance animation for back-to-back toasts.
  $toast.style.animation = 'none';
  void $toast.offsetWidth;
  $toast.style.animation = '';
  $toast.dataset.ms = String(ms);
  toastTimer = setTimeout(hideToast, ms);
}

function hideToast() {
  clearTimeout(toastTimer);
  $toast.hidden = true;
  toastUndo = null;
}

$toast.addEventListener('click', (e) => {
  if (!e.target.closest('.toast-undo')) return;
  const undo = toastUndo;
  hideToast();
  undo?.();
});
// Hovering keeps it up, so the Undo button doesn't vanish under the cursor.
$toast.addEventListener('mouseenter', () => clearTimeout(toastTimer));
$toast.addEventListener('mouseleave', () => {
  if (!$toast.hidden) toastTimer = setTimeout(hideToast, 1500);
});

// =========================================================================
// Render: title, artist, art, scrubber, like, volume, queue, lyrics
// =========================================================================
function bylineArtist(byline) {
  return String(byline || '').split(' • ')[0].trim();
}

// Fallback when the byline has no artist link: "IU & Oh Hyuk" → "IU",
// "아이유(IU)" → "아이유".
function artistQuery(name) {
  return String(name || '').split(/,|&/)[0].replace(/\s*\([^)]*\)\s*/g, ' ').trim();
}

function currentVideoId() {
  return (current?.queue || []).find((row) => row.isCurrent)?.videoId || null;
}

function render(state) {
  if (!state || !state.hasPlayer) {
    // Right after a reload the page has no player yet; wait for it.
    if (Date.now() < reloadingUntil) return;
    showEmpty('ytm-tab-not-ready');
    return;
  }
  reloadingUntil = 0;
  stopReconnect();
  setRootState(state.isPlaying ? 'playing' : 'paused');

  const title = state.title || 'Unknown track';
  if (title !== $title.textContent) {
    $title.textContent = title;
    $title.title = state.title || '';
    $miniTitle.textContent = title;
    updateMarquee($titleWrap, $title);
  }
  if ((state.artist || '') !== $artist.textContent) {
    $artist.textContent = state.artist || '';
    $miniArtist.textContent = state.artist || '';
  }
  // The artist the player bar links to; split the byline only without one.
  const query = (state.artistName || '').trim() || artistQuery(bylineArtist(state.artist));
  if (query !== ($artistBtn.dataset.query || '')) {
    $artistBtn.disabled = !query;
    $artistBtn.dataset.query = query;
    $artistBtn.title = query ? `Search “${query}”` : '';
    $artistBtn.setAttribute('aria-label', query ? `Search “${query}”` : (state.artist || ''));
  }

  // Art + adaptive color (only re-do when URL actually changes)
  if (state.artUrl && state.artUrl !== lastArtUrl) {
    lastArtUrl = state.artUrl;
    $art.src = state.artUrl;
    $miniArt.src = state.artUrl;
    $artWrap.classList.add('has-art');
    body.classList.add('has-art');
    document.documentElement.style.setProperty('--art-url', `url("${state.artUrl}")`);
    extractColor(state.artUrl).then(applyColor);
  } else if (!state.artUrl && lastArtUrl) {
    lastArtUrl = '';
    $artWrap.classList.remove('has-art');
    body.classList.remove('has-art');
    applyColor(null);
  }

  if (!isDragging) {
    const pct = state.duration > 0
      ? Math.max(0, Math.min(100, (state.position / state.duration) * 100))
      : 0;
    $fill.style.width = `${pct}%`;
    $thumb.style.left = `${pct}%`;
    $timePos.textContent = fmt(state.position);
    $timeDur.textContent = fmt(state.duration);
    $scrubber.setAttribute('aria-valuemax', String(Math.round(state.duration || 0)));
    $scrubber.setAttribute('aria-valuenow', String(Math.round(state.position || 0)));
    $scrubber.setAttribute('aria-valuetext', `${fmt(state.position)} of ${fmt(state.duration)}`);
  }

  if (likeHint && (Date.now() > likeHint.until || !!state.isLiked === likeHint.liked)) likeHint = null;
  applyLikeUI(likeHint ? likeHint.liked : !!state.isLiked);
  applyShuffleUI(!!state.isShuffled);
  applyRepeatUI(state.repeatMode || 'off');

  // Volume
  const vol = typeof state.volume === 'number' ? state.volume : 1;
  if (!isDraggingVol && Math.abs(Number($volSlider.value) - vol) > 0.005) {
    $volSlider.value = String(vol);
  }
  setVolumeIconState(isDraggingVol ? Number($volSlider.value) : vol, state.isMuted);

  current = state;

  // Queue
  renderQueue(state.queue || [], state.queueFrom || '');
  if (search.open) markNowPlayingRows();

  // Lyrics: refetch on track change
  const trackKey = `${state.artist}|${state.title}|${Math.round(state.duration || 0)}`;
  if (trackKey !== lastTrackKey) {
    lastTrackKey = trackKey;
    fetchAndRenderLyrics(state);
  } else {
    syncLyricsToPosition(state.position);
  }

  renderNotice();
}

// =========================================================================
// Notice: explain why a command didn't take effect
// =========================================================================
const NOTICES = {
  blocked: isChromiumShell
    ? {
      title: 'Browser blocked playback',
      body: 'Press play once in the YouTube Music tab to allow audio.',
      action: 'Open YouTube Music',
    }
    : {
      title: 'Safari blocked playback',
      body: 'Press play once in the YouTube Music tab, or allow Auto-Play for music.youtube.com in Safari Settings → Websites.',
      action: 'Open YouTube Music',
    },
  unreachable: {
    title: 'Couldn’t reach YouTube Music',
    body: 'Reload the YouTube Music tab once to reconnect.',
    action: 'Reload tab',
  },
};

function renderNotice() {
  const kind = commandFailed ? 'unreachable' : (current?.playbackBlocked ? 'blocked' : null);
  const wasHidden = $notice.hidden;
  $notice.hidden = !kind;
  if (kind) {
    const notice = NOTICES[kind];
    $notice.dataset.kind = kind;
    $noticeTitle.textContent = notice.title;
    $noticeBody.textContent = notice.body;
    $noticeAction.textContent = notice.action;
  }
  if (wasHidden !== $notice.hidden) requestAnimationFrame(() => updateScrollUI());
}

$noticeAction.addEventListener('click', () => {
  if ($notice.dataset.kind === 'unreachable') {
    reloadYtmTab();
    return;
  }
  chrome.runtime.sendMessage({ type: 'focusYtm' }).catch(() => {});
  if (!isFloating) window.close();
});

// Marquee: only animate when text actually overflows.
function updateMarquee(wrap, inner) {
  wrap.classList.remove('is-marquee');
  wrap.style.removeProperty('--mq-w');
  requestAnimationFrame(() => {
    const overflow = inner.scrollWidth - wrap.clientWidth;
    if (overflow > 6) {
      wrap.style.setProperty('--mq-w', `${wrap.clientWidth}px`);
      wrap.classList.add('is-marquee');
    }
  });
}

function setVolumeIconState(vol, isMuted) {
  body.classList.remove('vol-up', 'vol-mid', 'vol-mute');
  if (isMuted || vol <= 0.001) body.classList.add('vol-mute');
  else if (vol < 0.55) body.classList.add('vol-mid');
  else body.classList.add('vol-up');
  const shown = isMuted ? 0 : vol;
  $volSlider.style.setProperty('--vol-pct', `${Math.round(Math.max(0, Math.min(1, shown)) * 100)}%`);
}

function applyLikeUI(isLiked) {
  $likeBtn.classList.toggle('is-active', isLiked);
  $likeBtn.setAttribute('aria-pressed', String(isLiked));
}

function applyShuffleUI(isShuffled) {
  $shuffleBtn.classList.toggle('is-active', isShuffled);
  $shuffleBtn.setAttribute('aria-pressed', String(isShuffled));
  $shuffleBtn.setAttribute('aria-label', isShuffled ? 'Shuffle on' : 'Shuffle off');
}

function applyRepeatUI(mode) {
  const repeatMode = mode === 'one' || mode === 'all' ? mode : 'off';
  const isActive = repeatMode !== 'off';
  $repeatBtn.dataset.repeatMode = repeatMode;
  $repeatBtn.classList.toggle('is-active', isActive);
  $repeatBtn.classList.toggle('is-repeat-one', repeatMode === 'one');
  $repeatBtn.setAttribute('aria-pressed', String(isActive));
  $repeatBtn.setAttribute(
    'aria-label',
    repeatMode === 'one' ? 'Repeat this song' : (repeatMode === 'all' ? 'Repeat all' : 'Repeat off'),
  );
}

function nextRepeatMode(mode) {
  if (mode === 'off') return 'all';
  if (mode === 'all') return 'one';
  return 'off';
}

// =========================================================================
// Rows: one component for Up Next, search and playlists
// =========================================================================
function artHTML(url, { round = false, eq = false } = {}) {
  const img = url ? `<img src="${escapeAttr(url)}" alt="" loading="lazy">` : '';
  const bars = eq ? '<span class="row-eq" aria-hidden="true"><span></span><span></span><span></span></span>' : '';
  return `<span class="row-art${round ? ' is-round' : ''}">${img}${bars}</span>`;
}

function textHTML(title, sub, explicit = false) {
  const badge = explicit ? '<span class="badge-e" title="Explicit">E</span>' : '';
  return `<span class="row-text"><span class="row-title">${escapeHTML(title)}</span>` +
    `<span class="row-sub">${badge}<span>${escapeHTML(sub)}</span></span></span>`;
}

function actHTML(act, label, iconName, title = label, small = false) {
  return `<button class="row-act${small ? ' is-small' : ''}" type="button" data-act="${act}" ` +
    `aria-label="${escapeAttr(label)}" title="${escapeAttr(title)}">${icon(iconName)}</button>`;
}

function checkHTML() {
  return `<span class="row-check" role="img" aria-label="Added">${icon('check')}</span>`;
}

function msgHTML({ title, body: text = '', withIcon = false, action = null, compact = false }) {
  return `<div class="list-msg${compact ? ' is-compact' : ''}">` +
    (withIcon ? `<span class="msg-icon">${icon('search')}</span>` : '') +
    `<span class="msg-title">${escapeHTML(title)}</span>` +
    (text ? `<span class="msg-body">${escapeHTML(text)}</span>` : '') +
    (action ? `<button class="btn-secondary" type="button" data-act="${action.act}">${escapeHTML(action.label)}</button>` : '') +
    '</div>';
}

// =========================================================================
// Up Next: "Playing from", the last songs played (dimmed), now, what's next
// =========================================================================
let lastQueueSerialized = '';

function renderQueue(items, from) {
  const ser = JSON.stringify([items, from]);
  if (ser === lastQueueSerialized) return; // skip unchanged renders (prevents flicker + click breakage)
  lastQueueSerialized = ser;

  if (!items.length) {
    $queueView.innerHTML = msgHTML({
      title: 'Nothing queued',
      body: 'Search for something to play, or pick one of your playlists.',
      compact: true,
    });
    updateScrollUI();
    return;
  }
  const head = from
    ? `<div class="queue-from"><span>Playing from</span><b>${escapeHTML(from)}</b></div>`
    : '';
  const rows = items.map((it, idx) => {
    const dataIdx = typeof it.index === 'number' ? it.index : idx;
    const canRemove = !it.isCurrent && !!it.videoId;
    const meta = Number.isFinite(it.durationSeconds) && it.durationSeconds > 0 ? fmt(it.durationSeconds) : '';
    const cls = ['row', it.isCurrent && 'is-now', it.isPlayed && 'is-played', canRemove && 'can-remove']
      .filter(Boolean).join(' ');
    const label = it.isCurrent ? 'Play / Pause' : `Play ${it.title || 'this song'}`;
    return `
      <div class="${cls}" data-index="${dataIdx}" data-videoid="${escapeAttr(it.videoId || '')}">
        <button class="row-main" type="button" data-act="play" aria-label="${escapeAttr(label)}">
          ${artHTML(it.artUrl, { eq: !!it.isCurrent })}
          ${textHTML(it.title || 'Unknown', it.artist || '')}
        </button>
        ${meta ? `<span class="row-meta">${meta}</span>` : ''}
        ${canRemove ? actHTML('remove', 'Remove from queue', 'close', 'Remove from queue', true) : ''}
      </div>`;
  }).join('');
  $queueView.innerHTML = head + rows;
  updateScrollUI();
}

async function removeQueueRow(row) {
  if (row.classList.contains('is-removing')) return;
  const index = Number(row.dataset.index);
  const videoId = row.dataset.videoid || '';
  const title = row.querySelector('.row-title')?.textContent || '';
  if (!videoId) return;
  row.classList.add('is-removing');
  const resp = await pageRequest('queueRemove', { index, videoId });
  if (resp.status !== 'ok') {
    row.classList.remove('is-removing');
    lastQueueSerialized = '';
    toast({ label: 'Couldn’t remove that song', title });
    return;
  }
  refreshStateSoon();
  toast({
    label: 'Removed from queue',
    title,
    ms: 3600,
    undo: async () => {
      const undone = await pageRequest('queueUndoRemove', { token: resp.token });
      if (undone.status !== 'ok') toast({ label: 'Couldn’t put it back', title });
      else refreshStateSoon();
    },
  });
}

$queueView.addEventListener('click', (e) => {
  const row = e.target.closest('.row');
  if (!row) return;
  if (e.target.closest('[data-act="remove"]')) {
    removeQueueRow(row);
    return;
  }
  if (!e.target.closest('[data-act="play"]')) return;
  if (row.classList.contains('is-now')) {
    runCommand('playPause');
    return;
  }
  const idx = Number(row.dataset.index);
  send('playQueueItem', {
    index: Number.isFinite(idx) ? idx : undefined,
    videoId: row.dataset.videoid || null,
  });
});

// =========================================================================
// Playlists (Pro)
// =========================================================================
function renderPlaylistsLoading() {
  $playlistsView.innerHTML = msgHTML({ title: 'Loading playlists…', compact: true });
}

async function loadPlaylists({ force = false } = {}) {
  if (playlistsLoading) return;
  playlistsLoading = true;
  if (!playlistsLoaded) renderPlaylistsLoading();
  try {
    const resp = await withTimeout(
      chrome.runtime.sendMessage({ type: 'getUserPlaylists', force }),
      20000,
      { status: 'error', reason: 'timeout' },
    );
    playlistsLoaded = true;
    playlistsLastLoadedAt = Date.now();
    renderPlaylists(resp || { status: 'error' });
  } catch (e) {
    console.warn('[YTMC popup] getUserPlaylists failed', e);
    renderPlaylists({ status: 'error' });
  } finally {
    playlistsLoading = false;
  }
}

function maybeRefreshPlaylists() {
  if (!playlistsLoaded) {
    loadPlaylists();
    return;
  }
  if (Date.now() - playlistsLastLoadedAt > 60000) {
    loadPlaylists({ force: true });
  }
}

function renderPlaylists(resp) {
  const status = resp?.status || 'error';
  if (status === 'ok') {
    playlistItems = Array.isArray(resp.playlists) ? resp.playlists : [];
    $playlistsView.innerHTML = playlistItems.map((pl, i) => `
      <div class="row" data-pl="${i}">
        <button class="row-main" type="button" data-act="play" aria-label="${escapeAttr(`Play ${pl.title || 'playlist'}`)}">
          ${artHTML(pl.thumbnail)}
          ${textHTML(pl.title || 'Untitled', pl.subtitle || '')}
        </button>
        ${pl.shuffleEndpoint ? actHTML('shuffle', 'Shuffle', 'shuffle') : ''}
        ${pl.nextEndpoint ? actHTML('next', 'Play next', 'playNext') : ''}
        ${checkHTML()}
      </div>`).join('');
    updateScrollUI();
    return;
  }
  playlistItems = [];
  let msg = 'Couldn’t load playlists.';
  let label = 'Retry';
  if (status === 'empty') { msg = 'No playlists found.'; label = 'Refresh'; }
  if (status === 'signed-out') { msg = 'Sign in to YouTube Music to see your playlists.'; label = 'Retry'; }
  $playlistsView.innerHTML = msgHTML({ title: msg, action: { act: 'refresh', label }, compact: true });
  updateScrollUI();
}

// =========================================================================
// Pro: the Playlists tab is locked for people who installed 0.3.0+ and
// haven't bought a key. background.js decides (legacy users, Safari, keys).
// =========================================================================
async function refreshProStatus() {
  try {
    proStatus = await withTimeout(chrome.runtime.sendMessage({ type: 'proStatus' }), 8000, null);
  } catch {
    proStatus = null;
  }
  // If the background can't answer, don't lock anyone out.
  if (!proStatus || typeof proStatus.pro !== 'boolean') proStatus = { pro: true };
  $tabs.find((t) => t.dataset.tab === 'playlists')?.classList.toggle('is-locked', !proStatus.pro);
  return proStatus;
}

async function showPlaylistsTab() {
  if (!proStatus) await refreshProStatus();
  if (proStatus.pro) {
    maybeRefreshPlaylists();
  } else {
    renderProLock();
  }
}

const PRO_HINT = 'Paste the key from your receipt email or the checkout page.';
const PRO_REVOKED = 'Your license key is no longer valid (refunded or disabled).';
const PRO_ERRORS = {
  empty: 'Paste your license key first.',
  invalid: 'That key didn’t work. Check it and try again.',
  network: 'Couldn’t reach the license server. Try again in a moment.',
};

function renderProLock({ showKey = false, key = '', error = '', checking = false } = {}) {
  const head = `
    <span class="pro-badge">${icon('lock')}<span>PRO</span></span>
    <p class="pro-title">Your playlists, one click away</p>`;
  if (!showKey) {
    $playlistsView.innerHTML = `
      <div class="pro-lock">
        ${head}
        <p class="pro-text">Browse and play your saved YouTube Music playlists right from the toolbar.</p>
        <div class="pro-actions">
          <button class="btn-primary" data-action="pro-buy" type="button">Unlock for $2.99</button>
          <button class="btn-secondary" data-action="pro-show-key" type="button">I have a key</button>
        </div>
        <p class="pro-fine"><b>One-time payment.</b> No subscription, nothing to renew. Everything else in Pink Player stays free.</p>
        ${proStatus?.keyRevoked ? `<p class="pro-hint is-error">${escapeHTML(PRO_REVOKED)}</p>` : ''}
      </div>`;
    updateScrollUI();
    return;
  }
  const hint = checking ? 'Checking your key…' : (error || (proStatus?.keyRevoked ? PRO_REVOKED : PRO_HINT));
  $playlistsView.innerHTML = `
    <div class="pro-lock">
      ${head}
      <form class="pro-key${error ? ' is-error' : ''}">
        <input class="pro-key-input" type="text" value="${escapeAttr(key)}" placeholder="Paste your license key" aria-label="License key" autocomplete="off" spellcheck="false">
        <button class="btn-primary" type="submit"${checking ? ' disabled' : ''}>${checking ? 'Checking…' : 'Activate'}</button>
      </form>
      <p class="pro-hint${error ? ' is-error' : ''}" role="status">${escapeHTML(hint)}</p>
      <button class="text-link" data-action="pro-buy" type="button">No key yet? Unlock for $2.99, one time</button>
    </div>`;
  updateScrollUI();
}

$playlistsView.addEventListener('submit', async (e) => {
  const form = e.target.closest('.pro-key');
  if (!form) return;
  e.preventDefault();
  const key = form.querySelector('.pro-key-input').value;
  renderProLock({ showKey: true, key, checking: true });
  let resp = null;
  try {
    resp = await withTimeout(chrome.runtime.sendMessage({ type: 'proActivate', key }), 15000, null);
  } catch {}
  if (resp?.ok) {
    await refreshProStatus();
    playlistsLoaded = false;
    showPlaylistsTab();
    toast({ label: 'Pro unlocked — thank you!', ms: 2600 });
    return;
  }
  renderProLock({ showKey: true, key, error: PRO_ERRORS[resp?.error] || PRO_ERRORS.network });
  $playlistsView.querySelector('.pro-key-input')?.focus();
});

$playlistsView.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !e.target.closest('.pro-key-input')) return;
  e.preventDefault();
  e.stopPropagation();
  renderProLock();
});

$playlistsView.addEventListener('click', async (e) => {
  if (e.target.closest('[data-action="pro-buy"]')) {
    chrome.tabs.create({ url: proStatus?.checkoutUrl }).catch(() => {});
    return;
  }
  if (e.target.closest('[data-action="pro-show-key"]')) {
    renderProLock({ showKey: true });
    $playlistsView.querySelector('.pro-key-input')?.focus();
    return;
  }
  if (e.target.closest('[data-act="refresh"]')) {
    loadPlaylists({ force: true });
    return;
  }
  const row = e.target.closest('.row[data-pl]');
  const pl = row ? playlistItems[Number(row.dataset.pl)] : null;
  if (!pl) return;
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'shuffle' && pl.shuffleEndpoint) {
    const resp = await pageRequest('searchAction', { action: 'play', endpoint: pl.shuffleEndpoint });
    if (resp.status === 'ok') {
      refreshStateSoon();
      toast({ label: 'Shuffling', title: pl.title || '', ms: 1800 });
    } else toast({ label: 'Couldn’t play that', title: pl.title || '' });
    return;
  }
  if (act === 'next' && pl.nextEndpoint) {
    flashChecked(row);
    const resp = await pageRequest('searchAction', { action: 'queue', endpoint: pl.nextEndpoint });
    if (resp.status === 'ok') {
      refreshStateSoon();
      toast({ label: resp.started ? 'Playing' : 'Playing next', title: pl.title || '', ms: 2400 });
    } else {
      row.classList.remove('is-checked');
      toast({ label: 'Couldn’t add that', title: pl.title || '' });
    }
    return;
  }
  if (act !== 'play' || !pl.playEndpoint) return;
  chrome.runtime.sendMessage({ type: 'playUserPlaylist', payload: { playEndpoint: pl.playEndpoint } }).catch(() => {});
  refreshStateSoon();
});

// The ✓ after a queue action, for a moment.
function flashChecked(row) {
  keepFocusInRow(row);
  row.classList.add('is-checked');
  setTimeout(() => row.classList.remove('is-checked'), 1600);
}

// The ✓ hides a row's buttons. If keyboard focus was on one of them, move it
// to the row itself instead of losing it to <body>.
function keepFocusInRow(row) {
  const focused = document.activeElement;
  if (row && focused?.matches('.row-act') && row.contains(focused)) {
    row.querySelector('.row-main')?.focus({ preventScroll: true });
  }
}

// =========================================================================
// Lyrics
// =========================================================================
async function fetchAndRenderLyrics(state) {
  $lyricsView.classList.remove('no-lyrics');
  $lyricsSource.hidden = true;
  $lyricsLines.innerHTML = '<div class="l-line">Loading lyrics…</div>';
  currentLyrics = [];
  lyricsLineNodes = [];
  activeLyricIdx = -1;

  if (!state.title || !state.artist) {
    $lyricsView.classList.add('no-lyrics');
    return;
  }
  try {
    const resp = await chrome.runtime.sendMessage({
      type: 'fetchLyrics',
      query: { title: state.title, artist: state.artist, duration: state.duration },
    });
    if (!resp || resp.error || (!resp.syncedLyrics && !resp.plainLyrics)) {
      $lyricsView.classList.add('no-lyrics');
      return;
    }
    if (resp.syncedLyrics) {
      currentLyrics = self.YTMC_LYRICS.parseLRC(resp.syncedLyrics);
    }
    if (!currentLyrics.length && resp.plainLyrics) {
      // Render plain lyrics as untimed lines (no auto-scroll).
      $lyricsLines.innerHTML = resp.plainLyrics
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `<div class="l-line">${escapeHTML(l)}</div>`)
        .join('');
      return;
    }
    if (!currentLyrics.length) {
      $lyricsView.classList.add('no-lyrics');
      return;
    }
    $lyricsLines.innerHTML = currentLyrics
      .map((line, i) => `<div class="l-line" data-i="${i}">${escapeHTML(line.text)}</div>`)
      .join('');
    $lyricsSource.hidden = false;
    lyricsLineNodes = $$('.l-line', $lyricsLines);
    syncLyricsToPosition(state.position);
  } catch (e) {
    $lyricsView.classList.add('no-lyrics');
  }
}

function centerLyricLine(node, behavior) {
  const target = node.offsetTop - $lyricsView.clientHeight / 2 + node.clientHeight / 2;
  $lyricsView.scrollTo({ top: target, behavior });
}

function syncLyricsToPosition(pos) {
  if (!currentLyrics.length) return;
  const idx = self.YTMC_LYRICS.findActiveIndex(currentLyrics, pos);
  if (idx === activeLyricIdx) return;
  if (activeLyricIdx >= 0 && lyricsLineNodes[activeLyricIdx]) {
    lyricsLineNodes[activeLyricIdx].classList.remove('is-active');
    lyricsLineNodes[activeLyricIdx].classList.add('is-past');
  }
  activeLyricIdx = idx;
  if (idx >= 0 && lyricsLineNodes[idx]) {
    const node = lyricsLineNodes[idx];
    node.classList.add('is-active');
    node.classList.remove('is-past');
    // Keep active line centered if Lyrics tab is showing
    if (activeTab === 'lyrics' && !search.open) centerLyricLine(node, 'smooth');
  }
}

// Tap a lyric line to seek there.
$lyricsLines.addEventListener('click', (e) => {
  const line = e.target.closest('.l-line');
  if (!line) return;
  const i = Number(line.dataset.i);
  if (!Number.isFinite(i) || !currentLyrics[i]) return;
  send('seek', { position: currentLyrics[i].time });
  // Optimistic UI — snap the active line immediately so the click feels
  // instant. Audio catches up once YT's player finishes seeking.
  syncLyricsToPosition(currentLyrics[i].time);
});

// =========================================================================
// Tabs + which list is showing
// =========================================================================
function showView(name) {
  $$('.tab-view').forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));
  requestAnimationFrame(() => updateScrollUI());
}

function switchTab(which) {
  if (!['queue', 'lyrics', 'playlists'].includes(which)) return;
  activeTab = which;
  $tabs.forEach((t) => {
    const on = t.dataset.tab === which;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
  });
  if (search.open) return;
  showView(which);
  if (which === 'lyrics' && activeLyricIdx >= 0 && lyricsLineNodes[activeLyricIdx]) {
    // Re-center after the view becomes visible.
    requestAnimationFrame(() => centerLyricLine(lyricsLineNodes[activeLyricIdx], 'instant'));
  }
  if (which === 'playlists') showPlaylistsTab();
}

$tabs.forEach((t) => {
  t.addEventListener('click', () => {
    if (t.dataset.tab !== activeTab) switchTab(t.dataset.tab);
  });
});

// =========================================================================
// Scrolling: no native scrollbar. The edge with more content fades, and a
// 3px thumb shows while scrolling (faintly while hovering the list).
// =========================================================================
let scrollIdleTimer = null;
let scrollRaf = null;

function activeList() {
  return $('.tab-view.is-active');
}

function updateScrollUI(el = activeList()) {
  if (!el) return;
  const isLyrics = el === $lyricsView;
  const h = el.scrollHeight;
  const ch = el.clientHeight;
  const top = el.scrollTop;
  const overflow = h > ch + 2;
  el.classList.toggle('fade-top', !isLyrics && overflow && top > 2);
  el.classList.toggle('fade-bottom', !isLyrics && overflow && top + ch < h - 2);
  if (isLyrics || !overflow) {
    $scrollThumb.style.height = '0px';
    return;
  }
  const thumbH = Math.max(24, Math.round((ch * ch) / h));
  const thumbTop = Math.round(6 + (top / (h - ch)) * (ch - 12 - thumbH));
  $scrollThumb.style.height = `${thumbH}px`;
  $scrollThumb.style.top = `${thumbTop}px`;
}

// `scroll` doesn't bubble; listen in the capture phase for every list.
$panelBody.addEventListener('scroll', (e) => {
  const el = e.target;
  if (!el.classList?.contains('tab-view') || !el.classList.contains('is-active')) return;
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    updateScrollUI(el);
    $scrollThumb.classList.add('is-scrolling');
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => $scrollThumb.classList.remove('is-scrolling'), 900);
    if (el === $searchView) maybeLoadMore();
  });
}, true);
$panelBody.addEventListener('mouseenter', () => $scrollThumb.classList.add('is-hover'));
$panelBody.addEventListener('mouseleave', () => $scrollThumb.classList.remove('is-hover'));
window.addEventListener('resize', () => updateScrollUI());

// =========================================================================
// Commands
// =========================================================================
function send(command, payload) {
  return chrome.runtime.sendMessage({ type: 'command', command, payload })
    .then((resp) => {
      commandFailed = resp?.ok === false;
      renderNotice();
      return resp;
    })
    .catch(() => {});
}

// Clicks and keys run the same commands; keys also say what happened, since
// the control may not be in view.
function runCommand(cmd, { fromKey = false } = {}) {
  if (!current) return;
  switch (cmd) {
    case 'playPause':
      send(current.isPlaying ? 'pause' : 'play');
      break;
    case 'previous':
    case 'next':
      send(cmd);
      break;
    case 'toggleLike': {
      const liked = !$likeBtn.classList.contains('is-active');
      likeHint = { liked, until: Date.now() + 2500 };
      applyLikeUI(liked);
      send('toggleLike');
      toast({
        icon: liked ? 'heart' : 'check',
        label: liked ? 'Added to Liked songs' : 'Removed from Liked songs',
        title: current.title || '',
      });
      break;
    }
    case 'toggleShuffle': {
      const on = !$shuffleBtn.classList.contains('is-active');
      applyShuffleUI(on);
      send('toggleShuffle');
      toast({ label: on ? 'Shuffle on' : 'Shuffle off', ms: 1400 });
      break;
    }
    case 'toggleRepeat': {
      const mode = nextRepeatMode($repeatBtn.dataset.repeatMode || 'off');
      applyRepeatUI(mode);
      send('toggleRepeat');
      toast({
        label: mode === 'all' ? 'Repeat all' : mode === 'one' ? 'Repeat this song' : 'Repeat off',
        ms: 1400,
      });
      break;
    }
    case 'toggleMute': {
      const willMute = !(current.isMuted || (current.volume ?? 1) <= 0.001);
      send('toggleMute');
      if (fromKey) toast({ label: willMute ? 'Muted' : 'Sound on', ms: 1200 });
      break;
    }
    default:
      send(cmd);
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cmd]');
  if (!btn) return;
  e.preventDefault();
  runCommand(btn.dataset.cmd);
});

$openYtmBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://music.youtube.com/' })
    .catch(() => chrome.runtime.sendMessage({ type: 'openYtm' }))
    .catch(() => {});
});

$retryYtmBtn.addEventListener('click', () => reconnectNow());
$reloadYtmBtn.addEventListener('click', reloadYtmTab);

function reconnectNow() {
  stopReconnect();
  setRootState('loading');
  chrome.runtime.sendMessage({ type: 'reconnectYtm' })
    .then((resp) => {
      if (resp?.state) render(resp.state);
      else {
        showEmpty(resp?.reason || 'ytm-tab-not-ready', { final: true });
        scheduleReconnectPoll(resp?.reason);
      }
    })
    .catch(() => {
      showEmpty('ytm-tab-not-ready', { final: true });
      scheduleReconnectPoll('ytm-tab-not-ready');
    });
}

$popoutBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'openFloating' }).catch(() => {});
  window.close();
});
if (isFloating) $popoutBtn.style.display = 'none';

// Click the art to focus the YT Music tab.
$('#art-btn').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.sendMessage({ type: 'focusYtm' }).catch(() => {});
  if (!isFloating) window.close();
});

// The artist under the title searches for them.
$artistBtn.addEventListener('click', () => {
  const query = $artistBtn.dataset.query;
  if (query) openSearch(query);
});

// =========================================================================
// Scrubber
// =========================================================================
function pctFromEvent(e) {
  const rect = $scrubberTrack.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  return Math.max(0, Math.min(1, x / rect.width));
}

function previewSeek(pct) {
  if (!current?.duration) return;
  const pos = pct * current.duration;
  $fill.style.width = `${pct * 100}%`;
  $thumb.style.left = `${pct * 100}%`;
  $timePos.textContent = fmt(pos);
  pendingSeek = pos;
}

$scrubberTrack.addEventListener('mousedown', (e) => {
  if (!current?.hasPlayer || !current.duration) return;
  e.preventDefault();
  isDragging = true;
  $scrubber.classList.add('dragging');
  previewSeek(pctFromEvent(e));
});
window.addEventListener('mousemove', (e) => {
  if (isDragging) previewSeek(pctFromEvent(e));
});
window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  $scrubber.classList.remove('dragging');
  if (pendingSeek != null) {
    send('seek', { position: pendingSeek });
    pendingSeek = null;
  }
});

function seekBy(delta) {
  if (!current?.duration) return;
  const position = Math.max(0, Math.min(current.duration - 1, (current.position || 0) + delta));
  previewSeek(position / current.duration);
  pendingSeek = null;
  send('seek', { position });
}

// =========================================================================
// Volume
// =========================================================================
$volSlider.addEventListener('input', () => {
  isDraggingVol = true;
  const v = Number($volSlider.value);
  setVolumeIconState(v, false);
  send('setVolume', { volume: v });
});
$volSlider.addEventListener('change', () => {
  // Release lock shortly after.
  setTimeout(() => { isDraggingVol = false; }, 300);
});

$volBtn.addEventListener('click', () => runCommand('toggleMute'));

function nudgeVolume(delta) {
  const base = current?.isMuted ? 0 : Number($volSlider.value);
  const v = Math.round(Math.max(0, Math.min(1, base + delta)) * 100) / 100;
  $volSlider.value = String(v);
  setVolumeIconState(v, false);
  isDraggingVol = true;
  clearTimeout(nudgeVolume.timer);
  nudgeVolume.timer = setTimeout(() => { isDraggingVol = false; }, 600);
  send('setVolume', { volume: v });
  toast({ label: `Volume ${Math.round(v * 100)}%`, ms: 1200 });
}

// =========================================================================
// Sleep timer
// =========================================================================
const $sleep = $('.sleep');
const $sleepBtn = $('#sleep-btn');
const $sleepMenu = $('#sleep-menu');
const $sleepLabel = $('#sleep-label');
let sleepCountdownTimer = null;
let sleepState = null;

// The menu is position:fixed (the transport folds and would clip it), so
// place it under the button.
function placeSleepMenu() {
  const r = $sleepBtn.getBoundingClientRect();
  $sleepMenu.style.top = `${Math.round(r.bottom + 6)}px`;
  $sleepMenu.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right - 8))}px`;
}

function setSleepMenuOpen(open) {
  if (open) placeSleepMenu();
  $sleep.classList.toggle('is-open', open);
  $sleepBtn.setAttribute('aria-expanded', String(open));
  if (open) {
    const checked = $sleepMenu.querySelector('[aria-checked="true"]') || $sleepMenu.querySelector('.sleep-item');
    checked?.focus({ preventScroll: true });
  }
}

$sleepBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  setSleepMenuOpen(!$sleep.classList.contains('is-open'));
});

document.addEventListener('click', (e) => {
  if (!$sleep.contains(e.target)) setSleepMenuOpen(false);
});

$sleepMenu.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const items = $$('.sleep-item', $sleepMenu).filter((b) => b.offsetParent !== null);
  const at = items.indexOf(document.activeElement);
  const next = e.key === 'ArrowDown' ? (at + 1) % items.length : (at <= 0 ? items.length - 1 : at - 1);
  items[next]?.focus();
});

$sleepMenu.addEventListener('click', async (e) => {
  const btn = e.target.closest('.sleep-item');
  if (!btn) return;
  const v = btn.dataset.sleep;
  setSleepMenuOpen(false);
  $sleepBtn.focus({ preventScroll: true });
  if (v === 'cancel') {
    await chrome.runtime.sendMessage({ type: 'sleepCancel' }).catch(() => {});
    toast({ icon: 'moon', label: 'Sleep timer off' });
  } else if (v === 'track') {
    await chrome.runtime.sendMessage({ type: 'sleepSet', mode: 'track' }).catch(() => {});
    toast({ icon: 'moon', label: 'Pauses after this song' });
  } else {
    const minutes = Number(v);
    if (Number.isFinite(minutes)) {
      await chrome.runtime.sendMessage({ type: 'sleepSet', mode: 'minutes', minutes }).catch(() => {});
      toast({ icon: 'moon', label: `Pauses in ${minutes === 60 ? '1 hour' : `${minutes} min`}` });
    }
  }
  refreshSleepUI();
});

async function refreshSleepUI() {
  const resp = await chrome.runtime.sendMessage({ type: 'sleepGet' }).catch(() => null);
  applySleepUI(resp?.sleep);
}

function applySleepUI(sleep) {
  if (sleepCountdownTimer) { clearInterval(sleepCountdownTimer); sleepCountdownTimer = null; }
  sleepState = sleep && sleep.active ? sleep : null;
  $sleepMenu.classList.toggle('has-timer', !!sleepState);
  $$('.sleep-item[data-sleep]', $sleepMenu).forEach((b) => {
    if (!b.hasAttribute('aria-checked')) return;
    const on = !!sleepState && (
      (sleepState.mode === 'track' && b.dataset.sleep === 'track') ||
      (sleepState.mode === 'minutes' && Number(b.dataset.sleep) === sleepState.totalMinutes)
    );
    b.setAttribute('aria-checked', String(on));
  });
  if (!sleepState) {
    $sleepBtn.classList.remove('is-active');
    $sleepLabel.textContent = '';
    $sleepBtn.setAttribute('aria-label', 'Sleep timer');
    return;
  }
  $sleepBtn.classList.add('is-active');
  if (sleepState.mode === 'track') {
    $sleepLabel.textContent = 'Song';
    $sleepBtn.setAttribute('aria-label', 'Sleep timer: after this song');
    return;
  }
  const tick = () => {
    const msLeft = Math.max(0, sleepState.firesAt - Date.now());
    const minsLeft = Math.ceil(msLeft / 60000);
    $sleepLabel.textContent = `${minsLeft}m`;
    $sleepBtn.setAttribute('aria-label', `Sleep timer: ${minsLeft} minutes left`);
    if (msLeft <= 0 && sleepCountdownTimer) {
      clearInterval(sleepCountdownTimer);
      sleepCountdownTimer = null;
    }
  };
  tick();
  sleepCountdownTimer = setInterval(tick, 15000);
}

// =========================================================================
// Search: YouTube Music's own search, run in its tab. Suggestions while
// typing; the full search on Enter. Nothing is preselected, so Enter never
// starts playback by accident. Playing leaves search; queueing doesn't.
// =========================================================================
const SUGGEST_DEBOUNCE_MS = 150;
const SUGGEST_QUERIES = 3;
const SUGGEST_ITEMS = 5;
const RECENT_KEY = 'ytmc.recentSearches';
const RECENT_MAX = 5;
// Signed-in search's second tab ("Library"). The live response carries it;
// this is what it has been, for a search started before any response.
const LIBRARY_PARAMS_FALLBACK = 'agIYBA%3D%3D';

const $searchInput = $('#search-input');
const $searchClear = $('#search-clear');
const $chipsRow = $('#chips-row');
const $searchProgress = $('#search-progress');
const $hintBar = $('#hint-bar');

const search = {
  open: false,
  query: '',
  phase: 'idle', // idle | suggest | skeleton | results | message
  sugg: null, // { queries, items }
  res: null, // { query, chip, scope, top, items, continuation }
  chips: [], // the "All" response's filters for res.query
  chip: null, // { label, params } or null for All
  scope: 'music', // 'music' | 'library'
  libraryParams: null,
  signedIn: false,
  busy: false,
  chipSkel: false,
  loadingMore: false,
  msg: null,
  seq: 0,
  selKey: null,
  kbd: false,
  composing: false,
  recent: [],
  checked: new Set(),
  rows: [], // what's on screen, for keys and clicks
};
let suggestTimer = null;

function sameQuery(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

async function loadRecentSearches() {
  try {
    const stored = await chrome.storage.local.get(RECENT_KEY);
    const list = stored?.[RECENT_KEY];
    search.recent = Array.isArray(list) ? list.filter((q) => typeof q === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    search.recent = [];
  }
}

function saveRecentSearches() {
  chrome.storage.local.set({ [RECENT_KEY]: search.recent }).catch(() => {});
}

function addRecentSearch(query) {
  const q = String(query || '').trim();
  if (!q) return;
  search.recent = [q, ...search.recent.filter((x) => !sameQuery(x, q))].slice(0, RECENT_MAX);
  saveRecentSearches();
}

function openSearch(query) {
  if (!isPlayerShown()) return;
  closeOverlays();
  hideToast();
  search.open = true;
  body.classList.add('is-search');
  showView('search');
  const q = search.query.trim();
  const res = search.res;
  // A search left before its answer came (placeholders, or a filter or scope
  // that never applied) runs again; otherwise come back to where it was.
  const unfinished = !!q && (search.phase === 'skeleton' || (!!res && sameQuery(res.query, q) &&
    ((res.chip?.params || null) !== (search.chip?.params || null) || res.scope !== search.scope)));
  if (query) {
    $searchInput.value = query;
    search.query = query;
    runSearch(query);
  } else if (unfinished) {
    runSearch(q, { chip: search.chip, scope: search.scope, addRecent: false });
  } else if (!q) {
    search.phase = 'idle';
    renderSearch();
  } else if (res && sameQuery(res.query, q) && (search.phase === 'results' || search.phase === 'message')) {
    renderSearch();
  } else if (search.sugg?.input === search.query) {
    search.phase = 'suggest';
    renderSearch();
  } else {
    // Suggestions for this text were never fetched; ask now.
    search.phase = 'idle';
    renderSearch();
    typed(search.query);
  }
  updateClearButton();
  requestAnimationFrame(() => {
    $searchInput.focus({ preventScroll: true });
    const end = $searchInput.value.length;
    $searchInput.setSelectionRange(end, end);
  });
}

function exitSearch() {
  if (!search.open) return;
  search.open = false;
  search.seq++; // drop anything still in flight
  clearTimeout(suggestTimer);
  search.busy = false;
  search.chipSkel = false;
  search.loadingMore = false;
  search.selKey = null;
  search.kbd = false;
  body.classList.remove('is-search');
  $searchInput.blur();
  renderSearchChrome();
  showView(activeTab);
  if (activeTab === 'lyrics' && activeLyricIdx >= 0 && lyricsLineNodes[activeLyricIdx]) {
    requestAnimationFrame(() => centerLyricLine(lyricsLineNodes[activeLyricIdx], 'instant'));
  }
}

function updateClearButton() {
  $searchClear.hidden = !$searchInput.value;
}

function clearQuery() {
  search.seq++;
  clearTimeout(suggestTimer);
  $searchInput.value = '';
  search.query = '';
  search.phase = 'idle';
  search.sugg = null;
  search.busy = false;
  search.chipSkel = false;
  search.selKey = null;
  search.kbd = false;
  updateClearButton();
  renderSearch();
  $searchInput.focus({ preventScroll: true });
}

function typed(value) {
  search.query = value;
  search.selKey = null;
  search.kbd = false;
  updateClearButton();
  clearTimeout(suggestTimer);
  // Typing drops a search or page that's still loading; its placeholders go too.
  search.busy = false;
  search.chipSkel = false;
  search.loadingMore = false;
  if (!value.trim()) {
    search.seq++;
    search.sugg = null;
    search.phase = 'idle';
    renderSearch();
    return;
  }
  const mine = ++search.seq;
  if (search.phase === 'skeleton') {
    search.phase = search.sugg ? 'suggest' : 'idle';
    renderSearch();
  } else {
    renderSearchChrome();
  }
  suggestTimer = setTimeout(async () => {
    const resp = await pageRequest('searchSuggest', { input: value }, 8000);
    if (mine !== search.seq) return;
    if (resp.status === 'ok') {
      search.sugg = {
        input: value,
        queries: (resp.queries || []).slice(0, SUGGEST_QUERIES),
        items: (resp.items || []).slice(0, SUGGEST_ITEMS),
      };
      search.phase = search.sugg.queries.length || search.sugg.items.length ? 'suggest' : 'idle';
    } else if (!search.sugg || search.phase === 'results') {
      // Keep what's on screen; Enter still searches.
      if (search.phase !== 'results') search.phase = 'idle';
    }
    renderSearch();
  }, SUGGEST_DEBOUNCE_MS);
}

function errorMessage(reason, scope) {
  if (reason === 'no-ytm-tab') {
    return { title: 'YouTube Music isn’t open', body: 'Open it in any tab, then search again.', action: { act: 'retry', label: 'Try again' } };
  }
  if (reason === 'timeout') {
    return { title: 'YouTube Music didn’t answer', body: 'Check that its tab is still open, then try again.', action: { act: 'retry', label: 'Try again' } };
  }
  if (reason === 'signed-out' && scope === 'library') {
    return { title: 'Sign in to search your library', body: 'Sign in to YouTube Music in its tab, then try again.', action: { act: 'retry', label: 'Try again' } };
  }
  return { title: 'Search didn’t work', body: 'Try again in a moment.', action: { act: 'retry', label: 'Try again' } };
}

function emptyResultsMessage(query, scope, chip) {
  if (scope === 'library') {
    return { title: `Nothing in your library for “${query}”`, body: 'Switch to YT Music to search everything.', withIcon: true };
  }
  if (chip) {
    return { title: `No results for “${query}”`, body: `Nothing under “${chip.label}”. Try another filter, or All.`, withIcon: true };
  }
  return { title: `No results for “${query}”`, body: 'Check the spelling, or try fewer words.', withIcon: true };
}

async function runSearch(rawQuery, { chip = null, scope = search.scope, addRecent = true } = {}) {
  const query = String(rawQuery || '').trim();
  if (!query) return;
  clearTimeout(suggestTimer);
  const mine = ++search.seq;
  if ($searchInput.value.trim() !== query) $searchInput.value = query;
  updateClearButton();
  // Switching a filter keeps the old list on screen, dimmed, until the new
  // one arrives; a new search shows placeholders.
  const keep = !!search.res && sameQuery(search.res.query, query) &&
    (search.phase === 'results' || search.phase === 'message');
  search.query = query;
  search.chip = chip;
  search.scope = scope;
  search.busy = true;
  search.chipSkel = !keep;
  search.phase = keep ? search.phase : 'skeleton';
  search.selKey = null;
  search.kbd = false;
  search.loadingMore = false;
  search.msg = null;
  if (!keep) search.chips = [];
  renderSearch();

  let params = null;
  if (scope === 'library') params = search.libraryParams || LIBRARY_PARAMS_FALLBACK;
  else if (chip) params = chip.params;
  const resp = await pageRequest('search', { query, params });
  if (mine !== search.seq) return;

  search.busy = false;
  search.chipSkel = false;
  if (resp.status !== 'ok') {
    search.res = { query, chip, scope, top: null, items: [], continuation: null };
    search.phase = 'message';
    search.msg = errorMessage(resp.reason, scope);
    renderSearch();
    return;
  }
  // Only searches that went through become recents.
  if (addRecent) addRecentSearch(query);
  if (resp.libraryParams) search.libraryParams = resp.libraryParams;
  search.signedIn = !!resp.signedIn;
  if (!search.signedIn && scope === 'library') search.scope = 'music';
  if (scope === 'music' && !chip) search.chips = resp.chips || [];
  search.res = {
    query,
    chip,
    scope,
    top: scope === 'music' && !chip ? resp.top || null : null,
    items: resp.items || [],
    continuation: resp.continuation || null,
  };
  if (!search.res.top && !search.res.items.length) {
    search.phase = 'message';
    search.msg = emptyResultsMessage(query, scope, chip);
  } else {
    search.phase = 'results';
  }
  renderSearch();
  $searchView.scrollTop = 0;
  updateScrollUI($searchView);
}

function maybeLoadMore() {
  const el = $searchView;
  if (el.scrollTop + el.clientHeight < el.scrollHeight - 120) return;
  loadMore();
}

async function loadMore() {
  const res = search.res;
  if (!search.open || search.phase !== 'results' || search.busy || search.loadingMore || !res?.continuation) return;
  const mine = search.seq;
  search.loadingMore = true;
  renderSearch();
  const resp = await pageRequest('searchMore', { continuation: res.continuation });
  if (mine !== search.seq || search.res !== res) return;
  search.loadingMore = false;
  if (resp.status === 'ok') {
    const seen = new Set(res.items.map((item) => item.key));
    for (const item of resp.items || []) {
      if (seen.has(item.key)) continue;
      seen.add(item.key);
      res.items.push(item);
    }
    res.continuation = resp.continuation || null;
  } else {
    res.continuation = null;
  }
  renderSearch();
}

// ---- rendering -------------------------------------------------------------
function buildSearchRows() {
  const rows = [];
  if (search.phase === 'idle') {
    if (search.recent.length) {
      rows.push({ type: 'head-recent', key: 'h:recent' });
      for (const q of search.recent) rows.push({ type: 'recent', key: `r:${q}`, q });
    } else {
      rows.push({
        type: 'msg',
        key: 'm:idle',
        msg: {
          title: 'Search YouTube Music',
          body: 'Songs, albums, artists and playlists. Play them without leaving this tab.',
          withIcon: true,
        },
      });
    }
  } else if (search.phase === 'suggest' && search.sugg) {
    for (const s of search.sugg.queries) rows.push({ type: 'text', key: `t:${s.query}`, q: s.query, runs: s.runs });
    if (search.sugg.queries.length && search.sugg.items.length) rows.push({ type: 'divider', key: 'd:1' });
    for (const item of search.sugg.items) rows.push({ type: 'media', key: `s:${item.key}`, item });
  } else if (search.phase === 'results' && search.res) {
    if (search.res.top) rows.push({ type: 'top', key: `top:${search.res.top.key}`, item: search.res.top });
    for (const item of search.res.items) rows.push({ type: 'media', key: `m:${item.key}`, item });
    if (search.loadingMore) rows.push({ type: 'skel', key: 'k:m1' }, { type: 'skel', key: 'k:m2' });
  } else if (search.phase === 'skeleton') {
    for (let i = 0; i < 7; i++) rows.push({ type: 'skel', key: `k:${i}` });
  } else if (search.phase === 'message' && search.msg) {
    rows.push({ type: 'msg', key: 'm:msg', msg: search.msg });
  }
  return rows;
}

const SKEL_WIDTHS = [['62%', '38%'], ['48%', '30%'], ['70%', '44%'], ['55%', '34%'], ['66%', '40%'], ['44%', '28%'], ['58%', '36%']];

function runsHTML(runs, fallback) {
  if (!Array.isArray(runs) || !runs.length) return escapeHTML(fallback);
  return runs.map((run) => (run.bold ? `<b>${escapeHTML(run.text)}</b>` : escapeHTML(run.text))).join('');
}

function itemActionsHTML(item) {
  if (item.kind === 'artist') {
    return actHTML('shuffle', 'Shuffle', 'shuffle', 'Shuffle  ↵') +
      (item.mix ? actHTML('mix', 'Start mix', 'mix', `Start mix  ${MOD}↵`) : '');
  }
  return (item.next ? actHTML('next', 'Play next', 'playNext', `Play next  ${SHIFT}↵`) : '') +
    (item.end ? actHTML('end', 'Add to queue', 'addQueue', `Add to queue  ${MOD}↵`) : '');
}

function searchRowHTML(row, index) {
  const key = escapeAttr(row.key);
  switch (row.type) {
    case 'head-recent':
      return '<div class="list-head"><span>Recent searches</span>' +
        '<button class="list-link" type="button" data-act="clear-recent">Clear</button></div>';
    case 'recent':
      return `<div class="row" data-key="${key}">
        <button class="row-main is-text" type="button" data-act="main">${icon('recent')}<span class="row-q">${escapeHTML(row.q)}</span></button>
        ${actHTML('remove', `Remove “${row.q}”`, 'close', 'Remove', true)}
      </div>`;
    case 'text':
      return `<div class="row" data-key="${key}">
        <button class="row-main is-text" type="button" data-act="main">${icon('search')}<span class="row-q">${runsHTML(row.runs, row.q)}</span></button>
        ${actHTML('fill', `Edit “${row.q}”`, 'fill', 'Edit this search', true)}
      </div>`;
    case 'divider':
      return '<div class="list-divider" aria-hidden="true"></div>';
    case 'top': {
      const item = row.item;
      const isArtist = item.kind === 'artist';
      const label = `${isArtist ? 'Shuffle' : 'Play'} ${item.title}`;
      return `<div class="top" data-key="${key}">
        <button class="row-main" type="button" data-act="main" aria-label="${escapeAttr(label)}">
          ${artHTML(item.thumb, { round: isArtist })}
          <span class="row-text">
            <span class="top-label">TOP RESULT</span>
            <span class="row-title">${escapeHTML(item.title)}</span>
            <span class="row-sub">${item.explicit ? '<span class="badge-e" title="Explicit">E</span>' : ''}<span>${escapeHTML(item.subtitle || '')}</span></span>
          </span>
        </button>
        <button class="top-big" type="button" data-act="main" aria-label="${escapeAttr(label)}" title="${escapeAttr(label)}">${icon(isArtist ? 'shuffle' : 'play')}</button>
      </div>`;
    }
    case 'media': {
      const item = row.item;
      const isArtist = item.kind === 'artist';
      const label = `${isArtist ? 'Shuffle' : 'Play'} ${item.title}`;
      const checked = search.checked.has(item.key);
      return `<div class="row${checked ? ' is-checked' : ''}" data-key="${key}">
        <button class="row-main" type="button" data-act="main" aria-label="${escapeAttr(label)}">
          ${artHTML(item.thumb, { round: isArtist })}
          ${textHTML(item.title, item.subtitle || '', item.explicit)}
        </button>
        ${itemActionsHTML(item)}
        ${checkHTML()}
      </div>`;
    }
    case 'skel': {
      const [w1, w2] = SKEL_WIDTHS[index % SKEL_WIDTHS.length];
      return `<div class="skel" aria-hidden="true"><span class="skel-art"></span>` +
        `<span class="skel-lines"><span style="width:${w1}"></span><span style="width:${w2}"></span></span></div>`;
    }
    case 'msg':
      return msgHTML(row.msg);
    default:
      return '';
  }
}

function renderSearchChrome() {
  // Filters show with results (or while the first ones load).
  const res = search.res;
  const showChips = search.open && (search.chipSkel ||
    (!!res && sameQuery(res.query, search.query) && (search.phase === 'results' || search.phase === 'message')));
  $chipsRow.hidden = !showChips;
  if (showChips) {
    const parts = [];
    if (search.signedIn) {
      parts.push('<div class="scope" role="group" aria-label="Search in">' +
        ['music', 'library'].map((scope) => `<button class="scope-btn" type="button" data-scope="${scope}" aria-pressed="${search.scope === scope}">${scope === 'music' ? 'YT Music' : 'Library'}</button>`).join('') +
        '</div>');
    }
    const chips = search.scope === 'music' ? search.chips : [];
    if (search.signedIn && (chips.length || search.chipSkel)) parts.push('<span class="chips-divider" aria-hidden="true"></span>');
    if (search.scope === 'music') {
      if (search.chip) {
        parts.push(`<button class="chip-clear" type="button" data-chip-clear aria-label="Clear filter">${icon('close')}</button>`);
      }
      chips.forEach((chip, i) => {
        const on = !!search.chip && search.chip.params === chip.params;
        parts.push(`<button class="chip" type="button" data-chip="${i}" aria-pressed="${on}">${escapeHTML(chip.label)}</button>`);
      });
      if (search.chipSkel && !chips.length) {
        for (const w of [44, 38, 52, 40]) parts.push(`<span class="chip-skel" style="width:${w}px" aria-hidden="true"></span>`);
      }
    }
    const html = parts.join('');
    if ($chipsRow.innerHTML !== html) {
      $chipsRow.innerHTML = html;
      revealPressedChip();
    }
  }

  const busyResults = search.open && search.busy && search.phase !== 'skeleton';
  $searchProgress.hidden = !busyResults;
  $searchView.classList.toggle('is-busy', busyResults);
  renderHintBar();
}

// The chosen filter stays in view in the scrolling row of filters.
function revealPressedChip() {
  const chip = $chipsRow.querySelector('.chip[aria-pressed="true"]');
  if (!chip) return;
  const left = chip.offsetLeft - 8;
  const right = chip.offsetLeft + chip.offsetWidth + 8;
  if (left < $chipsRow.scrollLeft) $chipsRow.scrollLeft = left;
  else if (right > $chipsRow.scrollLeft + $chipsRow.clientWidth) $chipsRow.scrollLeft = right - $chipsRow.clientWidth;
}

function renderSearch() {
  if (!search.open) {
    renderSearchChrome();
    return;
  }
  search.rows = buildSearchRows();
  $searchView.innerHTML = search.rows.map(searchRowHTML).join('');
  markNowPlayingRows();
  applySelection(false);
  renderSearchChrome();
  updateScrollUI($searchView);
}

// The song that's playing is marked in results too.
function markNowPlayingRows() {
  const vid = currentVideoId();
  for (const el of $$('[data-key]', $searchView)) {
    const row = search.rows.find((r) => r.key === el.dataset.key);
    const isNow = !!vid && !!row?.item && row.item.key === `v:${vid}`;
    if (el.classList.contains('is-now') === isNow) continue;
    el.classList.toggle('is-now', isNow);
    const art = el.querySelector('.row-art');
    if (!art) continue;
    art.querySelector('.row-eq')?.remove();
    if (isNow) art.insertAdjacentHTML('beforeend', '<span class="row-eq" aria-hidden="true"><span></span><span></span><span></span></span>');
  }
}

// ---- keyboard selection ------------------------------------------------------
const NAV_TYPES = new Set(['recent', 'text', 'top', 'media']);

function navRows() {
  return search.rows.filter((row) => NAV_TYPES.has(row.type));
}

function selectedRow() {
  return search.kbd ? navRows().find((row) => row.key === search.selKey) || null : null;
}

function applySelection(scroll = true) {
  for (const el of $$('[data-key]', $searchView)) {
    const on = search.kbd && el.dataset.key === search.selKey;
    el.classList.toggle('is-selected', on);
    if (on && scroll) el.scrollIntoView({ block: 'nearest' });
  }
  renderHintBar();
}

function hintItems(row) {
  if (!row) return [];
  if (row.type === 'text' || row.type === 'recent') return [['↵', 'Search'], ['esc', 'Close']];
  if (row.item?.kind === 'artist') {
    return [['↵', 'Shuffle'], ...(row.item.mix ? [[`${MOD}↵`, 'Start mix']] : []), ['esc', 'Close']];
  }
  return [
    ['↵', 'Play'],
    ...(row.item?.next ? [[`${SHIFT}↵`, 'Play next']] : []),
    ...(row.item?.end ? [[`${MOD}↵`, 'Add to queue']] : []),
    ['esc', 'Close'],
  ];
}

function renderHintBar() {
  const items = search.open ? hintItems(selectedRow()) : [];
  $hintBar.hidden = !items.length;
  body.classList.toggle('has-hint', items.length > 0);
  const html = items.map(([k, l]) => `<span><b>${escapeHTML(k)}</b> ${escapeHTML(l)}</span>`).join('');
  if ($hintBar.innerHTML !== html) $hintBar.innerHTML = html;
}

function moveSelection(dir) {
  const rows = navRows();
  if (!rows.length) return;
  let i = rows.findIndex((row) => row.key === search.selKey);
  if (!search.kbd) i = -1;
  i = dir > 0 ? (i + 1) % rows.length : (i <= 0 ? rows.length - 1 : i - 1);
  search.selKey = rows[i].key;
  search.kbd = true;
  applySelection(true);
}

// ---- actions -----------------------------------------------------------------
async function searchPlay(endpoint, label, title) {
  const resp = await pageRequest('searchAction', { action: 'play', endpoint });
  if (resp.status !== 'ok') {
    toast({ label: 'Couldn’t play that', title });
    return;
  }
  refreshStateSoon();
  exitSearch();
  switchTab('queue');
  toast({ label, title, ms: 1800 });
}

async function searchQueue(item, endpoint, where) {
  search.checked.add(item.key);
  const el = $$('[data-key]', $searchView).find((node) => search.rows.find((r) => r.key === node.dataset.key)?.item?.key === item.key);
  keepFocusInRow(el);
  el?.classList.add('is-checked');
  const resp = await pageRequest('searchAction', { action: 'queue', endpoint });
  setTimeout(() => {
    search.checked.delete(item.key);
    for (const node of $$('.is-checked', $searchView)) {
      const row = search.rows.find((r) => r.key === node.dataset.key);
      if (row?.item?.key === item.key) node.classList.remove('is-checked');
    }
  }, 1600);
  if (resp.status !== 'ok') {
    search.checked.delete(item.key);
    el?.classList.remove('is-checked');
    toast({ label: 'Couldn’t add that', title: item.title });
    return;
  }
  refreshStateSoon();
  if (resp.started) {
    toast({ label: 'Playing', title: item.title, ms: 1800 });
    return;
  }
  toast({ label: where === 'next' ? 'Playing next' : 'Added to end of queue', title: item.title, ms: 2400 });
}

// how: main | next | queue (⌘↵) | shuffle | mix | end
function actOnRow(row, how = 'main') {
  if (!row) return;
  if (row.type === 'text' || row.type === 'recent') {
    runSearch(row.q);
    return;
  }
  const item = row.item;
  if (!item) return;
  if (item.kind === 'artist') {
    if ((how === 'mix' || how === 'queue') && item.mix) searchPlay(item.mix, 'Starting mix', item.title);
    else searchPlay(item.play, 'Shuffling', item.title);
    return;
  }
  if (how === 'next' && item.next) {
    searchQueue(item, item.next, 'next');
    return;
  }
  if ((how === 'end' || how === 'queue') && item.end) {
    searchQueue(item, item.end, 'end');
    return;
  }
  if (how === 'next' || how === 'end' || how === 'queue') return;
  searchPlay(item.play, 'Playing', item.title);
}

// Safari doesn't focus a clicked button, so focus stays on <body>, and the
// type-to-search fallback below would move it mid-keystroke, which turns a
// Korean IME's first jamo into a Latin letter. After a click in search, put
// focus back in the field. A keyboard press (detail 0) keeps its focus.
function refocusSearchAfterClick(e) {
  if (search.open && e.detail > 0) $searchInput.focus({ preventScroll: true });
}

$searchView.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  refocusSearchAfterClick(e);
  const act = btn.dataset.act;
  if (act === 'clear-recent') {
    search.recent = [];
    saveRecentSearches();
    renderSearch();
    $searchInput.focus({ preventScroll: true });
    return;
  }
  if (act === 'retry') {
    runSearch(search.query, { chip: search.chip, scope: search.scope, addRecent: false });
    return;
  }
  const el = btn.closest('[data-key]');
  const row = el ? search.rows.find((r) => r.key === el.dataset.key) : null;
  if (!row) return;
  if (act === 'remove' && row.type === 'recent') {
    search.recent = search.recent.filter((q) => q !== row.q);
    saveRecentSearches();
    renderSearch();
    $searchInput.focus({ preventScroll: true });
    return;
  }
  if (act === 'fill') {
    $searchInput.value = row.q;
    typed(row.q);
    $searchInput.focus({ preventScroll: true });
    return;
  }
  actOnRow(row, act);
});

$chipsRow.addEventListener('click', (e) => {
  if (e.target.closest('button')) refocusSearchAfterClick(e);
  const scopeBtn = e.target.closest('[data-scope]');
  if (scopeBtn) {
    const scope = scopeBtn.dataset.scope;
    if (scope === search.scope) return;
    if (search.res?.query) runSearch(search.res.query, { scope, addRecent: false });
    else { search.scope = scope; renderSearchChrome(); }
    return;
  }
  if (e.target.closest('[data-chip-clear]')) {
    if (search.res?.query) runSearch(search.res.query, { chip: null, addRecent: false });
    return;
  }
  const chipBtn = e.target.closest('[data-chip]');
  if (!chipBtn || !search.res?.query) return;
  const chip = search.chips[Number(chipBtn.dataset.chip)];
  if (!chip) return;
  const same = search.chip?.params === chip.params;
  runSearch(search.res.query, { chip: same ? null : chip, addRecent: false });
});

// The chip row hides its scrollbar, so let a mouse wheel scroll it sideways.
// Trackpads already scroll it with a horizontal swipe.
$chipsRow.addEventListener('wheel', (e) => {
  if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  if ($chipsRow.scrollWidth <= $chipsRow.clientWidth) return;
  e.preventDefault();
  $chipsRow.scrollLeft += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
}, { passive: false });

$searchInput.addEventListener('input', () => typed($searchInput.value));
$searchInput.addEventListener('compositionstart', () => { search.composing = true; });
$searchInput.addEventListener('compositionend', () => { search.composing = false; });
$searchInput.addEventListener('keydown', (e) => {
  // Enter that finishes a Korean (or any IME) syllable isn't a search.
  if (e.isComposing || e.keyCode === 229 || search.composing) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    moveSelection(e.key === 'ArrowDown' ? 1 : -1);
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    const row = selectedRow();
    if (row) actOnRow(row, e.shiftKey ? 'next' : (e.metaKey || e.ctrlKey) ? 'queue' : 'main');
    else runSearch($searchInput.value);
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    if ($searchInput.value) clearQuery();
    else exitSearch();
  }
});

$searchClear.addEventListener('click', clearQuery);
$('#search-cancel').addEventListener('click', exitSearch);
$('#search-open').addEventListener('click', () => openSearch());
$('#mini-back').addEventListener('click', exitSearch);

// =========================================================================
// Keyboard shortcuts sheet
// =========================================================================
const SHORTCUTS = [
  [['Space'], 'Play / Pause'],
  [['←', '→'], 'Previous / Next'],
  [[`${SHIFT}←`, `${SHIFT}→`], 'Back / Forward 10 s'],
  [['↑', '↓'], 'Volume'],
  [['L'], 'Like'],
  [['S'], 'Shuffle'],
  [['R'], 'Repeat'],
  [['M'], 'Mute'],
  [['/'], 'Search'],
  [['1', '2', '3'], 'Up Next · Lyrics · Playlists'],
  [['?'], 'This list'],
];
const $sheet = $('#sheet');
const $sheetBackdrop = $('#sheet-backdrop');
$('#sheet-rows').innerHTML = SHORTCUTS.map(([keys, label]) =>
  `<div class="sheet-row"><span>${escapeHTML(label)}</span><span class="sheet-keys">` +
  keys.map((k) => `<span class="kbd">${escapeHTML(k)}</span>`).join('') + '</span></div>').join('');

function setSheetOpen(open) {
  $sheet.hidden = !open;
  $sheetBackdrop.hidden = !open;
  if (open) {
    setSleepMenuOpen(false);
    $('#sheet-close').focus({ preventScroll: true });
  }
}

function closeOverlays() {
  setSheetOpen(false);
  setSleepMenuOpen(false);
}

$('#shortcuts-btn').addEventListener('click', () => setSheetOpen($sheet.hidden));
$('#sheet-close').addEventListener('click', () => setSheetOpen(false));
$sheetBackdrop.addEventListener('click', () => setSheetOpen(false));

// =========================================================================
// Popup-wide keys. Typing in the search or license field never reaches here.
// =========================================================================
function isTextField(el) {
  return el?.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search');
}

document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return;
  const target = e.target;
  if (isTextField(target)) return;
  const k = e.key;

  if (k === 'Escape') {
    if (!$sheet.hidden || $sleep.classList.contains('is-open')) {
      e.preventDefault();
      const fromMenu = $sleep.classList.contains('is-open');
      closeOverlays();
      if (fromMenu) $sleepBtn.focus({ preventScroll: true });
    } else if (search.open) {
      e.preventDefault();
      exitSearch();
    }
    return;
  }
  if (!isPlayerShown()) return;
  if (k === '/' || ((e.metaKey || e.ctrlKey) && (k === 'k' || k === 'K'))) {
    e.preventDefault();
    if (search.open) $searchInput.focus({ preventScroll: true });
    else openSearch();
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (k === '?') {
    e.preventDefault();
    setSheetOpen($sheet.hidden);
    return;
  }
  if (!$sheet.hidden) return;

  if (search.open) {
    // Results stay keyboard-driven after a click moved focus off the field.
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      moveSelection(k === 'ArrowDown' ? 1 : -1);
      $searchInput.focus({ preventScroll: true });
    } else if (k.length === 1 && k !== ' ') {
      $searchInput.focus({ preventScroll: true });
    }
    return;
  }

  // The open sleep menu keeps its keys (arrows, Space, Enter).
  if ($sleep.classList.contains('is-open')) return;
  const onButton = target?.tagName === 'BUTTON';
  const onSlider = target === $volSlider;
  const onScrubber = target === $scrubber;
  // A focused button keeps Space for itself only when it was reached by keyboard.
  if (k === ' ' && onButton && target.matches(':focus-visible')) return;
  if ((k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') && onSlider) return;

  const lower = k.length === 1 ? k.toLowerCase() : k;
  const actions = {
    ' ': () => runCommand('playPause', { fromKey: true }),
    ArrowLeft: () => (e.shiftKey || onScrubber ? seekBy(e.shiftKey ? -10 : -5) : runCommand('previous', { fromKey: true })),
    ArrowRight: () => (e.shiftKey || onScrubber ? seekBy(e.shiftKey ? 10 : 5) : runCommand('next', { fromKey: true })),
    ArrowUp: () => nudgeVolume(0.05),
    ArrowDown: () => nudgeVolume(-0.05),
    l: () => runCommand('toggleLike', { fromKey: true }),
    s: () => runCommand('toggleShuffle', { fromKey: true }),
    r: () => runCommand('toggleRepeat', { fromKey: true }),
    m: () => runCommand('toggleMute', { fromKey: true }),
    1: () => switchTab('queue'),
    2: () => switchTab('lyrics'),
    3: () => switchTab('playlists'),
  };
  const run = actions[lower];
  if (!run) return;
  e.preventDefault();
  run();
});

// Safari can open the popover without moving keyboard focus into it, so the
// keys above would go to the page underneath until the popup is clicked.
// Focus the body (tabindex="-1", so it leaves Space to the handler above).
// Once the popover is key, WebKit moves focus on to the first control (the
// album art) as if Tab had been pressed: that shows the art's focus overlay
// and lets Space click it. Until the user clicks or tabs, bring focus back.
let userMovedFocus = false;
document.addEventListener('pointerdown', () => { userMovedFocus = true; }, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Tab') userMovedFocus = true; }, true);

function takeKeyboardFocus() {
  const active = document.activeElement;
  if (active && active !== body && (userMovedFocus || isTextField(active))) return;
  window.focus();
  body.focus({ preventScroll: true });
}
takeKeyboardFocus();
window.addEventListener('pageshow', takeKeyboardFocus);
window.addEventListener('focus', takeKeyboardFocus);
// Safari may keep the popover's page and show it again, so treat each showing
// as a fresh open.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) userMovedFocus = false;
  else takeKeyboardFocus();
});

// =========================================================================
// State subscriptions
// =========================================================================
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'stateUpdate') {
    // A pushed state means a content script is answering again.
    if (msg.state) {
      commandFailed = false;
      render(msg.state);
    } else {
      showEmpty('no-ytm-tab', { final: true });
    }
  }
  if (msg?.type === 'sleepUpdate') applySleepUI(msg.sleep);
});

// The YT Music tab pushes state on its own timers, and Safari can stall those
// while the tab is hidden and silent. After an action that changes the song
// or the queue, have the background read the tab again from here: once the
// change has had time to land, and once the tab's 4-second blocked-playback
// check is due. Fresh state comes back as a stateUpdate; the cached reply to
// getState is ignored.
function refreshStateSoon() {
  for (const ms of [1000, 4200]) {
    setTimeout(() => chrome.runtime.sendMessage({ type: 'getState' }).catch(() => {}), ms);
  }
}

async function requestStateOnce(opts = {}) {
  try {
    const resp = await chrome.runtime.sendMessage({ type: 'getState' });
    if (resp?.state) {
      render(resp.state);
      return true;
    }
    showEmpty(resp?.reason || 'checking-ytm-tabs', { final: !!opts.final });
    return false;
  } catch {
    showEmpty('ytm-tab-not-ready', { final: !!opts.final });
    return false;
  }
}

function scheduleReconnectPoll(lastReason = 'checking-ytm-tabs') {
  if (current) return;
  clearReconnectTimer();
  const delays = [350, 650, 1000, 1500, 2200, 3200];
  if (reconnectAttempt >= delays.length) {
    showEmpty(lastReason, { final: true });
    return;
  }
  const delay = delays[reconnectAttempt++];
  reconnectTimer = setTimeout(async () => {
    const ok = await requestStateOnce({
      final: reconnectAttempt >= delays.length,
    });
    if (!ok) scheduleReconnectPoll(lastReason);
  }, delay);
}

(async () => {
  setRootState('loading');
  const emptyFallback = setTimeout(() => {
    if (!current) showEmpty('checking-ytm-tabs');
  }, 500);
  loadRecentSearches();
  const ok = await requestStateOnce();
  clearTimeout(emptyFallback);
  if (!ok) scheduleReconnectPoll('checking-ytm-tabs');
  refreshSleepUI();
  refreshProStatus();
})();

// Floating mode: poll for state updates more frequently since we may live longer
// (popup version goes away on click-out; floating window persists)
if (isFloating) {
  setInterval(() => {
    chrome.runtime.sendMessage({ type: 'getState' }).then((r) => {
      if (r?.state) render(r.state);
    }).catch(() => {});
  }, 1000);
}
