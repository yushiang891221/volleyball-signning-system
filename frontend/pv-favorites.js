// 私人球館「我的最愛」共用邏輯
// 儲存於 localStorage，上限 5 個
(function (global) {
  const KEY = "pv-favorites";
  const MAX = 5;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(x => x && x.name && x.url) : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    } catch (e) {
      console.warn("Failed to write favorites", e);
    }
  }

  function isFav(url) {
    return read().some(x => x.url === url);
  }

  function add(name, url) {
    const list = read();
    if (list.some(x => x.url === url)) return { ok: true, list };
    if (list.length >= MAX) return { ok: false, reason: "full", list };
    list.push({ name, url });
    write(list);
    return { ok: true, list };
  }

  function remove(url) {
    const list = read().filter(x => x.url !== url);
    write(list);
    return list;
  }

  function toggle(name, url) {
    return isFav(url) ? { ok: true, list: remove(url), removed: true } : add(name, url);
  }

  global.PvFavorites = { MAX, read, write, isFav, add, remove, toggle };
})(window);
