// Tiny LRC parser + active-line lookup. Used by popup.js.

self.YTMC_LYRICS = {
  parseLRC(text) {
    if (!text || typeof text !== 'string') return [];
    const lines = [];
    for (const raw of text.split(/\r?\n/)) {
      // [mm:ss] text  or  [mm:ss.xx] text  (multiple timestamps possible per line)
      const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
      if (!stamps.length) continue;
      const text = raw.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, '').trim();
      if (!text) continue;
      for (const s of stamps) {
        const min = +s[1], sec = +s[2];
        lines.push({ time: min * 60 + sec, text });
      }
    }
    lines.sort((a, b) => a.time - b.time);
    return lines;
  },

  findActiveIndex(lines, position) {
    // Binary search: latest line with time <= position.
    let lo = 0, hi = lines.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lines[mid].time <= position) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  },
};
