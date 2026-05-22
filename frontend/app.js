const state = {
  scoreA: 0,
  scoreB: 0,
  serving: null,
  finished: false,
  teamAName: "隊伍 A",
  teamBName: "隊伍 B",
  teamAPlayers: [],
  teamBPlayers: [],
  registeredTeams: [],
  registrationHistory: [],
  matchHistory: [],
  currentAIndex: null,
  currentBIndex: null,
  scorerIndex: null,
  scorerTeamId: null,
  locationCheckEnabled: true,
  streakTwoModeEnabled: false,
  streakTeamId: null,
  streakCount: 0,
  currentMatchRecorded: false,
  quickStartMode: false
};

const WIN_SCORE = 25;
const MIN_LEAD = 2;
const STORAGE_KEY = "volleyball-registration";
const FAVORITE_TEAMS_KEY = "volleyball-favorite-teams";
const DEFAULT_VENUE_ID = "fengchia_1";
const DEVICE_TEAM_MAP_KEY = "volleyball-device-team-map";
const DEVICE_UUID_KEY = "volleyball-device-uuid";
const DAILY_RESET_CHECK_KEY = "volleyball-last-daily-reset-check";
const SYSTEM_SETTINGS_KEY = "volleyball-system-settings";
const MSG_BOARD_KEY = "volleyball-messages";
const MSG_NAME_KEY = "volleyball-msg-name";
const APP_VERSION = "1.7.8";

const CHANGELOG = [
  {
    version: "v1.7.8",
    date: "2026-05",
    title: "主頁簡化，球場選擇移至選單",
    items: [
      "主頁僅保留標題與時間，球場選擇從主頁移除",
      "從選單「選球場」開啟球場選擇，原「換球場」更名",
      "「← 回主頁」返回空白主頁，不重置球場選擇狀態"
    ]
  },
  {
    version: "v1.7.7",
    date: "2026-05",
    title: "公告改為彈出視窗",
    items: [
      "公告欄從主頁移除，改由選單「📢 公告」按鈕開啟 modal",
      "點擊背景或 ✕ 可關閉公告"
    ]
  },
  {
    version: "v1.7.6",
    date: "2026-05",
    title: "頁面層次優化",
    items: [
      "新增各功能頁面「← 回主頁」按鈕，可直接返回球場選擇頁",
      "主頁專屬公告欄與球場選擇，其他頁面不再重複顯示"
    ]
  },
  {
    version: "v1.7.5",
    date: "2026-05",
    title: "計分頁面橫屏優化",
    items: [
      "計分卡垂直置中，分數數字顯示在螢幕正中央",
      "橫屏模式選單按鈕移至畫面垂直中心",
      "新增 --score-landscape-h CSS 變數可自由調整計分板高度",
      "皮卡丘 2P 模式偵測修正：關閉得分視窗時不誤計選單操作"
    ]
  },
  {
    version: "v1.7.4",
    date: "2026-05",
    title: "推播通知細化",
    items: [
      "連二下模式觸發時，通知上場兩隊「輪到你們上場了！！！」",
      "連二下模式通知隊列第三隊「下一場就是你算分了喔！只能再休息一下！」",
      "PLAY2 通知訊息更新為「下一場就是你算分了喔！只能再休息一下！」"
    ]
  },
  {
    version: "v1.7.3",
    date: "2026-05",
    title: "推播通知精準化",
    items: [
      "推播通知改為只通知該隊報名裝置，不再全場廣播",
      "報名隊伍時自動綁定推播訂閱到該隊名",
      "PLAY1 通知只送至記分隊報名手機",
      "PLAY2 通知只送至準計分隊報名手機"
    ]
  },
  {
    version: "v1.7.2",
    date: "2026-05",
    title: "推播通知",
    items: [
      "PLAY2 上場時推播通知「準備來算分了喔！」",
      "PLAY1（記分隊）更換時推播通知「快來算分！下場就是你了喔」",
      "選擇球場後自動請求通知授權"
    ]
  },
  {
    version: "v1.7.1",
    date: "2025-05",
    title: "遊戲與導覽細節修正",
    items: [
      "排球遊戲桌機鍵盤改控制左側玩家，計分規則與手機一致",
      "排球遊戲新增靜音按鈕",
      "選單期間鎖定下鍵，防止進入雙人模式",
      "留言板不需選擇球場即可進入"
    ]
  },
  {
    version: "v1.7",
    date: "2025-05",
    title: "安全強化 & 體驗修正",
    items: [
      "前後端分離：管理員密碼移至後端，防止 F12 洩漏",
      "修正橫向計分頁面在手機無法固定的問題",
      "修正重開 App 仍可繞過定位檢查的問題",
      "修正有時隊伍列表未載入的問題（3 秒補救讀取）",
      "皮卡丘遊戲計分修正，桌機操作更直覺",
      "未選擇球場時報名 / 計分 / 管理選項全部灰化攔截",
      "更新頁面改用版本號比對，正確偵測新版本"
    ]
  },
  {
    version: "v1.6",
    date: "2025-05",
    title: "留言板 & 系統強化",
    items: [
      "新增留言板功能（Firebase 即時同步）",
      "系統管理新增 Firebase 作業統計表",
      "新增更新版本頁面（目前版本）",
      "Service Worker 網路優先策略，解決快取更新問題",
      "遊戲難易度跨裝置同步",
      "新裝置定位檢查預設啟用",
      "密碼改為後端儲存（SHA-256 雜湊）"
    ]
  },
  {
    version: "v1.5",
    date: "2025-04",
    title: "野場管理員 & 排行榜",
    items: [
      "野場管理員(NPC) 功能",
      "皮卡丘打排球線上遊戲",
      "遊戲排行榜（Firebase 同步）",
      "快速開局功能",
      "常用隊伍儲存"
    ]
  },
  {
    version: "v1.0",
    date: "2025-03",
    title: "初始版本",
    items: [
      "球場報名系統",
      "計分板功能",
      "定位檢查（逢甲大學球場）",
      "Firebase 即時同步"
    ]
  }
];
const VENUES = {
  fengchia_1: {
    name: "場地一",
    parentName: "逢甲大學球場",
    type: "box",
    cornerA: { lat: 24.180507, lng: 120.649742 },
    cornerB: { lat: 24.180058, lng: 120.650191 }
  },
  fengchia_2: {
    name: "場地二",
    parentName: "逢甲大學球場",
    type: "box",
    cornerA: { lat: 24.180507, lng: 120.649742 },
    cornerB: { lat: 24.180058, lng: 120.650191 }
  },
  home: {
    name: "測試用球場",
    parentName: null,
    type: "circle",
    center: { lat: 24.743353, lng: 121.088657 },
    radiusM: 80,
    noLocationCheck: true
  }
};

const scoreAEl = document.getElementById("score-a");
const scoreBEl = document.getElementById("score-b");
const statusEl = document.getElementById("status");
const scorerStatusEl = document.getElementById("scorer-status");
const currentTimeEl = document.getElementById("current-time");
const teamACardEl = document.getElementById("team-a-card");
const teamBCardEl = document.getElementById("team-b-card");
const teamATitleEl = document.getElementById("team-a-title");
const teamBTitleEl = document.getElementById("team-b-title");
const teamAPlayersEl = document.getElementById("team-a-players");
const teamBPlayersEl = document.getElementById("team-b-players");

const aPlusBtn = document.getElementById("a-plus");
const aMinusBtn = document.getElementById("a-minus");
const bPlusBtn = document.getElementById("b-plus");
const bMinusBtn = document.getElementById("b-minus");
const gameSectionEl = document.getElementById("game-section");
const statusSectionEl = document.getElementById("status-section");
const registerTeamBtn = document.getElementById("register-team");
const cancelMyRegistrationBtn = document.getElementById("cancel-my-registration");
const resetRegistrationBtn = document.getElementById("reset-registration");
const resetMatchHistoryBtn = document.getElementById("reset-match-history");
const registrationMessageEl = document.getElementById("registration-message");
const locationMessageEl = document.getElementById("location-message");
const streakModeStatusEl = document.getElementById("streak-mode-status");
const systemAdminPageEl = document.getElementById("system-admin-page");
const sysAdminLoginSectionEl = document.getElementById("sys-admin-login-section");
const sysAdminControlsSectionEl = document.getElementById("sys-admin-controls-section");
const sysAdminPasswordInputEl = document.getElementById("sys-admin-password");
const sysAdminUnlockBtn = document.getElementById("sys-admin-unlock");
const sysAdminAuthMessageEl = document.getElementById("sys-admin-auth-message");
const sysLocationCheckStatusEl = document.getElementById("sys-location-check-status");
const sysToggleLocationCheckBtn = document.getElementById("sys-toggle-location-check");
const sysClearLeaderboardBtn = document.getElementById("sys-clear-leaderboard");
const venueSelectEl = document.getElementById("venue-select");
const teamNameInputEl = document.getElementById("team-name");
const teamInputContainerEl = document.getElementById("team-inputs");
const registeredTeamsEl = document.getElementById("registered-teams");
const registrationHistoryEl = document.getElementById("registration-history");
const matchHistoryEl = document.getElementById("match-history");
const registrationPageEl = document.getElementById("registration-page");
const scorePageEl = document.getElementById("score-page");
const adminPageEl = document.getElementById("admin-page");
const scorePageMessageEl = document.getElementById("score-page-message");
const venuePageEl = document.getElementById("venue-page");
const venueBadgeNameEl = document.getElementById("venue-badge-name");
const goRegistrationBtn = document.getElementById("go-registration");
const goMatchBtn = document.getElementById("go-match");
const goScoreBtn = document.getElementById("go-score");
const goAdminBtn = document.getElementById("go-admin");
const adminLoginSectionEl = document.getElementById("admin-login-section");
const adminControlsSectionEl = document.getElementById("admin-controls-section");
const adminVenueInfoEl = document.getElementById("admin-venue-info");
const matchPageEl = document.getElementById("match-page");
const messageBoardPageEl = document.getElementById("message-board-page");
const msgNameInputEl = document.getElementById("msg-name-input");
const msgContentInputEl = document.getElementById("msg-content-input");
const msgSubmitBtn = document.getElementById("msg-submit-btn");
const msgSubmitMessageEl = document.getElementById("msg-submit-message");
const msgCardsContainerEl = document.getElementById("msg-cards-container");
const msgEmptyHintEl = document.getElementById("msg-empty-hint");
const sysClearMessagesBtn = document.getElementById("sys-clear-messages");
const updatePageEl = document.getElementById("update-page");
const sysControlsMessageEl = document.getElementById("sys-controls-message");
const adminPasswordInputEl = document.getElementById("admin-password");
const adminUnlockBtn = document.getElementById("admin-unlock");
const adminAuthMessageEl = document.getElementById("admin-auth-message");
const toggleStreakModeBtn = document.getElementById("toggle-streak-mode");
const favoriteSelectEl = document.getElementById("favorite-select");
const applyFavoriteBtnEl = document.getElementById("apply-favorite-btn");
const saveFavoriteBtnEl = document.getElementById("save-favorite-btn");
const deleteFavoriteBtnEl = document.getElementById("delete-favorite-btn");
let currentPage = "registration";
let isInVenue = false;
let systemAdminUnlocked = false;
let vapidPublicKey = null;
let fengchiaAccessible = null;
let venueSelected = false;
let selectedVenueId = DEFAULT_VENUE_ID;
let allVenueStates = {};
let firebaseReady = false;
let unsubscribeVenueState = null;
let unsubscribeVenueMatches = null;
let isDailyResetRunning = false;
let unsubscribeMessages = null;
let unsubscribeGlobalStats = null;
let globalStatsData = null;
let allMessages = [];
let adminUnlocked = false;
let hasHydratedVenueState = false;
let deviceTeamMap = {};
try {
  const rawTeamMap = localStorage.getItem(DEVICE_TEAM_MAP_KEY);
  deviceTeamMap = rawTeamMap ? JSON.parse(rawTeamMap) : {};
} catch (_e) {
  deviceTeamMap = {};
}
let deviceTeamId = typeof deviceTeamMap[selectedVenueId] === "string" ? deviceTeamMap[selectedVenueId] : "";
const deviceUuid = getOrCreateDeviceUuid();

function createEmptyVenueState() {
  return {
    scoreA: 0,
    scoreB: 0,
    serving: null,
    finished: false,
    teamAName: "隊伍 A",
    teamBName: "隊伍 B",
    teamAPlayers: [],
    teamBPlayers: [],
    registeredTeams: [],
    registrationHistory: [],
    matchHistory: [],
    currentAIndex: null,
    currentBIndex: null,
    scorerIndex: null,
    scorerTeamId: null,
    streakTwoModeEnabled: false,
    streakTeamId: null,
    streakCount: 0,
    currentMatchRecorded: false,
    quickStartMode: false
  };
}

function generateTeamId() {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${selectedVenueId}_${Date.now()}_${randomPart}`;
}

function createDeviceUuid() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `legacy-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateDeviceUuid() {
  const existing = localStorage.getItem(DEVICE_UUID_KEY);
  if (existing) {
    return existing;
  }
  const created = createDeviceUuid();
  localStorage.setItem(DEVICE_UUID_KEY, created);
  return created;
}

function toSafeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "")
    .slice(0, 24);
}

function normalizeRegisteredTeams(teams) {
  const input = Array.isArray(teams) ? teams : [];
  let changed = false;
  const normalized = input.map((team, index) => {
    const name = team && team.name ? team.name : `隊伍${index + 1}`;
    const players = Array.isArray(team && team.players) ? team.players : [];
    let teamId = team && typeof team.teamId === "string" ? team.teamId : "";
    if (!teamId) {
      const key = toSafeKey(name);
      // Stable fallback for legacy data without teamId.
      teamId = `legacy_${selectedVenueId}_${index}_${key || "team"}`;
      changed = true;
    }
    const ownerDeviceId = team && typeof team.ownerDeviceId === "string" ? team.ownerDeviceId : "";
    return {
      teamId,
      ownerDeviceId,
      name,
      players
    };
  });

  return { normalized, changed };
}

function getTeamNameById(teamId) {
  const team = state.registeredTeams.find((item) => item.teamId === teamId);
  return team ? team.name : "未指定";
}

function persistDeviceTeamMap() {
  localStorage.setItem(DEVICE_TEAM_MAP_KEY, JSON.stringify(deviceTeamMap));
}

function loadDeviceTeamForVenue() {
  deviceTeamId = typeof deviceTeamMap[selectedVenueId] === "string" ? deviceTeamMap[selectedVenueId] : "";
}

function tryRecoverDeviceTeamByUuid() {
  if (deviceTeamId) {
    return;
  }
  const mine = state.registeredTeams.find((team) => team.ownerDeviceId === deviceUuid);
  if (!mine) {
    return;
  }
  deviceTeamId = mine.teamId;
  deviceTeamMap[selectedVenueId] = mine.teamId;
  persistDeviceTeamMap();
  syncUserTeamClaim();
}

function bindDeviceTeamIfNeeded(teamId) {
  if (!deviceTeamId) {
    deviceTeamId = teamId;
    deviceTeamMap[selectedVenueId] = teamId;
    persistDeviceTeamMap();
    syncUserTeamClaim();
  }
}

function syncUserTeamClaim() {
  if (!hasFirebase() || !firebaseReady) {
    return;
  }
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    return;
  }
  window.FirebaseDB.setUserTeamId(currentUser.uid, deviceTeamId || null).catch((error) => {
    console.error("setUserTeamId failed:", error);
  });
}

function syncStateFromActiveVenue() {
  const activeState = allVenueStates[selectedVenueId] || createEmptyVenueState();
  allVenueStates[selectedVenueId] = activeState;
  Object.assign(state, activeState);
}

function syncActiveVenueFromState() {
  allVenueStates[selectedVenueId] = {
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    serving: state.serving,
    finished: state.finished,
    teamAName: state.teamAName,
    teamBName: state.teamBName,
    teamAPlayers: [...state.teamAPlayers],
    teamBPlayers: [...state.teamBPlayers],
    registeredTeams: state.registeredTeams.map((team) => ({
      teamId: team.teamId,
      ownerDeviceId: team.ownerDeviceId || "",
      name: team.name,
      players: [...team.players]
    })),
    registrationHistory: [...state.registrationHistory],
    matchHistory: state.matchHistory.map((match) => ({ ...match })),
    currentAIndex: state.currentAIndex,
    currentBIndex: state.currentBIndex,
    scorerIndex: state.scorerIndex,
    scorerTeamId: state.scorerTeamId,
    streakTwoModeEnabled: state.streakTwoModeEnabled,
    streakTeamId: state.streakTeamId,
    streakCount: state.streakCount,
    currentMatchRecorded: state.currentMatchRecorded
  };
}

function isInsideVenueBox(lat, lng, cornerA, cornerB) {
  const minLat = Math.min(cornerA.lat, cornerB.lat);
  const maxLat = Math.max(cornerA.lat, cornerB.lat);
  const minLng = Math.min(cornerA.lng, cornerB.lng);
  const maxLng = Math.max(cornerA.lng, cornerB.lng);
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceMeters(aLat, aLng, bLat, bLng) {
  const earthRadius = 6371000;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function isInsideSelectedVenue(lat, lng) {
  const venue = VENUES[selectedVenueId];
  if (!venue) {
    return false;
  }

  if (venue.type === "box") {
    return isInsideVenueBox(lat, lng, venue.cornerA, venue.cornerB);
  }

  if (venue.type === "circle") {
    const distance = distanceMeters(lat, lng, venue.center.lat, venue.center.lng);
    return distance <= venue.radiusM;
  }

  return false;
}

async function callAdminAPI(endpoint, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "操作失敗");
  return data;
}

function getSysAdminToken() { return sessionStorage.getItem("vb_sys_token"); }
function getAdminToken() { return sessionStorage.getItem("vb_admin_token"); }

async function callAdminAction(action, extra = {}) {
  const token = getSysAdminToken() || getAdminToken();
  return callAdminAPI("/api/admin-action", { action, venueId: selectedVenueId, ...extra }, token);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function subscribeToPush(venueId, teamName) {
  if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const subscription = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    await fetch("/api/save-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription, venueId, teamName })
    });
  } catch (_) {}
}

async function sendPlayNotification(venueId, teamName, title, body) {
  try {
    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId, teamName, title, body })
    });
  } catch (_) {}
}

function loadSystemSettings() {
  try { return JSON.parse(localStorage.getItem(SYSTEM_SETTINGS_KEY) || "{}"); } catch (_e) { return {}; }
}
function saveSystemSettings(s) {
  localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(s));
}
function isLocationCheckEnabled() {
  return state.locationCheckEnabled !== false;
}
function updateSysLocationCheckStatus() {
  if (sysLocationCheckStatusEl) {
    sysLocationCheckStatusEl.textContent = isLocationCheckEnabled() ? "定位檢查：已啟用" : "定位檢查：已停用";
  }
}

function updateDifficultyStatus() {
  const current = loadSystemSettings().gameDifficulty || "medium";
  const statusEl = document.getElementById("sys-difficulty-status");
  const labels = { slow: "簡單", medium: "中等", fast: "困難" };
  if (statusEl) statusEl.textContent = `目前難易度：${labels[current] || "中等"}`;
  ["slow", "medium", "fast"].forEach(d => {
    const btn = document.getElementById(`sys-difficulty-${d}`);
    if (btn) btn.classList.toggle("active", d === current);
  });
}

function setGameDifficulty(difficulty) {
  if (!systemAdminUnlocked) return;
  const labels = { slow: "簡單", medium: "中等", fast: "困難" };
  if (!window.confirm(`確定要將遊戲難易度設為「${labels[difficulty]}」嗎？`)) return;
  const current = loadSystemSettings();
  saveSystemSettings({ ...current, gameDifficulty: difficulty });
  localStorage.setItem("pv-offline-speed", difficulty);
  updateDifficultyStatus();
  if (sysControlsMessageEl) sysControlsMessageEl.textContent = `遊戲難易度已設為「${labels[difficulty]}」（同步中…）。`;
  callAdminAction("setConfig", { config: { gameDifficulty: difficulty } })
    .then(() => {
      if (sysControlsMessageEl) sysControlsMessageEl.textContent = `遊戲難易度已設為「${labels[difficulty]}」（已同步至雲端）。`;
    })
    .catch((e) => {
      if (sysControlsMessageEl) sysControlsMessageEl.textContent = `遊戲難易度已設為「${labels[difficulty]}」（雲端同步失敗：${e.message}）。`;
    });
}

function renderFbStatsTable() {
  const wrap = document.getElementById("fb-stats-table-wrap");
  if (!wrap) return;
  const noteEl = wrap.previousElementSibling;
  let rows;
  if (globalStatsData && globalStatsData.length > 0) {
    if (noteEl) noteEl.textContent = "全平台累計（即時）";
    rows = globalStatsData.map((r, i) => ({
      label: r.date, reads: r.reads || 0, writes: r.writes || 0, deletes: r.deletes || 0, today: i === 0
    }));
  } else {
    if (noteEl) noteEl.textContent = "本裝置累計（估算）";
    const s = window.FirebaseStats ? window.FirebaseStats.load() : {};
    rows = [{ label: "今天", reads: s.reads || 0, writes: s.writes || 0, deletes: s.deletes || 0, today: true }];
    if (Array.isArray(s.history)) {
      for (const h of s.history) {
        rows.push({ label: h.date || "—", reads: h.reads || 0, writes: h.writes || 0, deletes: h.deletes || 0, today: false });
      }
    }
  }
  const totR = rows.reduce((a, r) => a + r.reads, 0);
  const totW = rows.reduce((a, r) => a + r.writes, 0);
  const totD = rows.reduce((a, r) => a + r.deletes, 0);
  const tbody = rows.map((r) => {
    const tot = r.reads + r.writes + r.deletes;
    return `<tr class="${r.today ? "fb-row-today" : ""}"><td>${r.label}</td><td>${r.reads}</td><td>${r.writes}</td><td>${r.deletes}</td><td>${tot}</td></tr>`;
  }).join("");
  wrap.innerHTML = `<table class="fb-stats-table">
    <thead><tr><th>日期</th><th>讀取</th><th>寫入</th><th>刪除</th><th>合計</th></tr></thead>
    <tbody>${tbody}</tbody>
    <tfoot><tr><td>加總</td><td>${totR}</td><td>${totW}</td><td>${totD}</td><td>${totR + totW + totD}</td></tr></tfoot>
  </table>`;
}

function applyVenueGate() {
  registerTeamBtn.disabled = isLocationCheckEnabled() && !isInVenue;
}

function updateStreakModeStatus() {
  streakModeStatusEl.textContent = state.streakTwoModeEnabled
    ? "比賽模式：連二下（開啟）"
    : "比賽模式：一般輪轉（關閉）";
  updateAdminVenueInfo();
}

function renderChangelog() {
  const versionBadge = document.getElementById("update-current-version");
  if (versionBadge) versionBadge.textContent = "v" + APP_VERSION;
  const container = document.getElementById("update-changelog");
  if (!container || container.children.length > 0) return;
  container.innerHTML = CHANGELOG.map((entry, i) => `
    <div class="changelog-entry${i === 0 ? " changelog-entry-latest" : ""}">
      <div class="changelog-header">
        <span class="changelog-version">${entry.version}</span>
        <span class="changelog-date">${entry.date}</span>
        <span class="changelog-title">${entry.title}</span>
      </div>
      <ul class="changelog-list">
        ${entry.items.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </div>`).join("");
}

async function runUpdate() {
  const startBtn = document.getElementById("update-start-btn");
  const progressWrap = document.getElementById("update-progress-wrap");
  const progressBar = document.getElementById("update-progress-bar");
  const progressText = document.getElementById("update-progress-text");
  const progressPct = document.getElementById("update-progress-pct");
  const messageEl = document.getElementById("update-message");

  startBtn.disabled = true;
  progressWrap.classList.remove("hidden");
  messageEl.textContent = "";

  function advance(pct, text) {
    return new Promise(resolve => setTimeout(() => {
      progressBar.style.width = pct + "%";
      progressText.textContent = text;
      progressPct.textContent = pct + "%";
      resolve();
    }, 400));
  }

  await advance(20, "正在連線伺服器…");
  await advance(50, "正在比對版本…");

  let serverVersion = null;
  try {
    const res = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
    const data = await res.json();
    serverVersion = data.version;
  } catch (_) {}

  await advance(70, "正在檢查更新…");

  // Force SW to update too
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
    if (reg) await reg.update().catch(() => {});
  }

  const hasUpdate = serverVersion && serverVersion !== APP_VERSION;

  if (!hasUpdate) {
    await advance(100, "已是最新版本！");
    messageEl.textContent = "✅ 目前已是最新版本 v" + APP_VERSION + "，無需重新載入。";
    startBtn.disabled = false;
    return;
  }

  await advance(90, "發現新版本 v" + serverVersion + "，正在下載…");
  await advance(100, "更新完成！");
  messageEl.textContent = "正在重新載入…";
  setTimeout(() => window.location.reload(true), 700);
}

function ensureDeviceTeamStillExists() {
  if (hasFirebase() && firebaseReady && !hasHydratedVenueState) {
    return;
  }
  if (!deviceTeamId) {
    tryRecoverDeviceTeamByUuid();
    return;
  }
  const ownedTeam = state.registeredTeams.find((team) => team.teamId === deviceTeamId);
  const exists = Boolean(ownedTeam);
  if (ownedTeam && !ownedTeam.ownerDeviceId) {
    ownedTeam.ownerDeviceId = deviceUuid;
    saveRegistrationState();
  }
  if (!exists) {
    deviceTeamId = "";
    delete deviceTeamMap[selectedVenueId];
    persistDeviceTeamMap();
    syncUserTeamClaim();
    tryRecoverDeviceTeamByUuid();
  }
}

function canDeviceScore() {
  if (state.quickStartMode) return true;
  return Boolean(deviceTeamId && state.scorerTeamId && deviceTeamId === state.scorerTeamId);
}

function assignScorerIfMissing() {
  if (state.scorerTeamId) {
    return;
  }
  for (let index = 0; index < state.registeredTeams.length; index += 1) {
    if (index !== state.currentAIndex && index !== state.currentBIndex) {
      state.scorerIndex = index;
      state.scorerTeamId = state.registeredTeams[index].teamId;
      return;
    }
  }
  state.scorerIndex = null;
  state.scorerTeamId = null;
}

function refreshScoringPermissionView() {
  const canScore = canDeviceScore() && !state.finished;
  aPlusBtn.disabled = !canScore;
  bPlusBtn.disabled = !canScore;
  aMinusBtn.disabled = !canScore;
  bMinusBtn.disabled = !canScore;
}

function checkLocationForRegistration() {
  if (!isLocationCheckEnabled() || VENUES[selectedVenueId]?.noLocationCheck) {
    isInVenue = true;
    if (locationMessageEl) locationMessageEl.textContent = "";
    applyVenueGate();
    return;
  }

  if (!navigator.geolocation) {
    isInVenue = false;
    locationMessageEl.textContent = "此裝置不支援定位，無法報名。";
    applyVenueGate();
    return;
  }

  locationMessageEl.textContent = "";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      isInVenue = isInsideSelectedVenue(latitude, longitude);
      locationMessageEl.textContent = isInVenue ? "✓ 符合報隊資格" : "✗ 不符合報隊資格（不在球場範圍內）";
      locationMessageEl.classList.toggle("location-fail", !isInVenue);
      applyVenueGate();
    },
    () => {
      isInVenue = false;
      locationMessageEl.textContent = "無法取得位置資訊，請確認定位授權。";
      applyVenueGate();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
  );
}

function updateScorePageMessage() {
  const venue = VENUES[selectedVenueId];
  const mode = state.streakTwoModeEnabled ? "連二下" : "一般";
  const teamCount = state.registeredTeams.length;
  if (state.registeredTeams.length < 2) {
    scorePageMessageEl.textContent =
      `目前球場：${venue.name}｜模式：${mode}\n報名隊伍：${teamCount}\n請先完成兩隊報名。`;
    return;
  }
  scorePageMessageEl.textContent =
    `目前球場：${venue.name}｜模式：${mode}\n對戰：${state.teamAName} vs ${state.teamBName}\n報名隊伍：${teamCount}`;
}

function updateDrawerVenueGate() {
  const regLi = document.getElementById("nav-li-registration");
  const matchLi = document.getElementById("nav-li-match");
  const scoreLi = document.getElementById("nav-li-score");
  const adminLi = document.getElementById("nav-li-admin");
  if (regLi) regLi.classList.toggle("nav-item-disabled", !venueSelected);
  if (matchLi) matchLi.classList.toggle("nav-item-disabled", !venueSelected);
  if (scoreLi) scoreLi.classList.toggle("nav-item-disabled", !venueSelected);
  if (adminLi) adminLi.classList.toggle("nav-item-disabled", !venueSelected);
}

function updateAdminVenueInfo() {
  if (!adminVenueInfoEl) return;
  if (!venueSelected) {
    adminVenueInfoEl.textContent = "尚未選擇球場";
    return;
  }
  const venue = VENUES[selectedVenueId];
  const fullName = venue?.parentName ? `${venue.parentName} ${venue.name}` : (venue?.name || selectedVenueId);
  const mode = state.streakTwoModeEnabled ? "連二下" : "一般";
  adminVenueInfoEl.textContent = `目前球場：${fullName}｜模式：${mode}`;
}

const MSG_CARD_ACCENTS = [
  { bg: "linear-gradient(135deg,rgba(155,127,212,0.15) 0%,rgba(240,235,255,0.9) 100%)", border: "rgba(155,127,212,0.35)", nameColor: "#4A2D8C" },
  { bg: "linear-gradient(135deg,rgba(62,207,196,0.15) 0%,rgba(226,250,248,0.9) 100%)", border: "rgba(62,207,196,0.35)", nameColor: "#0D7A73" },
  { bg: "linear-gradient(135deg,rgba(245,200,66,0.18) 0%,rgba(255,252,210,0.9) 100%)", border: "rgba(200,160,40,0.4)", nameColor: "#7A6000" },
  { bg: "linear-gradient(135deg,rgba(230,100,150,0.12) 0%,rgba(255,235,245,0.9) 100%)", border: "rgba(200,80,130,0.3)", nameColor: "#8C1A4A" },
  { bg: "linear-gradient(135deg,rgba(100,160,230,0.12) 0%,rgba(235,245,255,0.9) 100%)", border: "rgba(80,130,200,0.3)", nameColor: "#1A5080" },
];

function formatMsgTime(ts) {
  if (!ts) return "";
  const date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return date.toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function renderMessageCards() {
  if (!msgCardsContainerEl) return;
  msgCardsContainerEl.innerHTML = "";
  if (allMessages.length === 0) {
    if (msgEmptyHintEl) msgEmptyHintEl.classList.remove("hidden");
    return;
  }
  if (msgEmptyHintEl) msgEmptyHintEl.classList.add("hidden");
  allMessages.forEach((msg, i) => {
    const accent = MSG_CARD_ACCENTS[i % MSG_CARD_ACCENTS.length];
    const card = document.createElement("div");
    card.className = "msg-card";
    card.style.background = accent.bg;
    card.style.borderColor = accent.border;

    const header = document.createElement("div");
    header.className = "msg-card-header";

    const nameEl = document.createElement("span");
    nameEl.className = "msg-card-name";
    nameEl.style.color = accent.nameColor;
    nameEl.textContent = msg.name || "匿名";

    const timeEl = document.createElement("span");
    timeEl.className = "msg-card-time";
    timeEl.textContent = formatMsgTime(msg.postedAt);

    header.appendChild(nameEl);
    header.appendChild(timeEl);

    const contentEl = document.createElement("div");
    contentEl.className = "msg-card-content";
    contentEl.textContent = msg.content || "";

    card.appendChild(header);
    card.appendChild(contentEl);
    msgCardsContainerEl.appendChild(card);
  });
}

function loadLocalMessages() {
  try {
    const raw = localStorage.getItem(MSG_BOARD_KEY);
    allMessages = raw ? JSON.parse(raw) : [];
  } catch (_e) {
    allMessages = [];
  }
}

function saveLocalMessages() {
  localStorage.setItem(MSG_BOARD_KEY, JSON.stringify(allMessages));
}

async function submitMessage() {
  const name = (msgNameInputEl ? msgNameInputEl.value : "").trim();
  const content = (msgContentInputEl ? msgContentInputEl.value : "").trim();
  if (!name) {
    if (msgSubmitMessageEl) msgSubmitMessageEl.textContent = "請輸入你的名字。";
    return;
  }
  if (!content) {
    if (msgSubmitMessageEl) msgSubmitMessageEl.textContent = "請輸入留言內容。";
    return;
  }
  localStorage.setItem(MSG_NAME_KEY, name);
  const msg = { name, content };
  if (hasFirebase() && firebaseReady) {
    try {
      await ensureFirebaseAuth();
      await window.FirebaseDB.addMessage(msg);
      if (msgContentInputEl) msgContentInputEl.value = "";
      if (msgSubmitMessageEl) {
        msgSubmitMessageEl.textContent = "留言成功！";
        setTimeout(() => { if (msgSubmitMessageEl) msgSubmitMessageEl.textContent = ""; }, 3000);
      }
    } catch (error) {
      console.error("addMessage failed:", error);
      if (msgSubmitMessageEl) msgSubmitMessageEl.textContent = "留言失敗，請稍後再試。";
    }
  } else {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      content,
      postedAt: new Date().toISOString()
    };
    allMessages.unshift(newMsg);
    if (allMessages.length > 100) allMessages = allMessages.slice(0, 100);
    saveLocalMessages();
    if (msgContentInputEl) msgContentInputEl.value = "";
    if (msgSubmitMessageEl) {
      msgSubmitMessageEl.textContent = "留言成功！";
      setTimeout(() => { if (msgSubmitMessageEl) msgSubmitMessageEl.textContent = ""; }, 3000);
    }
    renderMessageCards();
  }
}

async function clearMessageBoard() {
  if (!systemAdminUnlocked) return;
  if (!window.confirm("確定要清除所有留言嗎？")) return;
  try {
    await callAdminAction("clearMessages");
    if (sysControlsMessageEl) sysControlsMessageEl.textContent = "留言板已清除。";
    allMessages = [];
    renderMessageCards();
  } catch (error) {
    if (sysControlsMessageEl) sysControlsMessageEl.textContent = `清除留言板失敗：${error.message}`;
  }
}

function updateFengchiaCard() {
  const card = document.getElementById("select-fengchia");
  const status = document.getElementById("fengchia-card-status");
  if (!card || !status) return;
  if (!isLocationCheckEnabled()) {
    card.classList.remove("venue-card--disabled");
    status.textContent = "";
    return;
  }
  if (fengchiaAccessible === null) {
    card.classList.remove("venue-card--disabled");
    status.textContent = "🔍 定位中...";
  } else if (fengchiaAccessible === true) {
    card.classList.remove("venue-card--disabled");
    status.textContent = "";
  } else {
    card.classList.add("venue-card--disabled");
    status.textContent = "📍 不在球場範圍內";
  }
}

function checkFengchiaAccessible() {
  if (!isLocationCheckEnabled()) {
    fengchiaAccessible = true;
    updateFengchiaCard();
    return;
  }
  fengchiaAccessible = null;
  updateFengchiaCard();
  const fengchiaVenue = VENUES["fengchia_1"];
  if (!fengchiaVenue || fengchiaVenue.noLocationCheck) {
    fengchiaAccessible = true;
    updateFengchiaCard();
    return;
  }
  if (!navigator.geolocation) {
    fengchiaAccessible = false;
    updateFengchiaCard();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fengchiaAccessible = isInsideVenueBox(latitude, longitude, fengchiaVenue.cornerA, fengchiaVenue.cornerB);
      updateFengchiaCard();
    },
    () => { fengchiaAccessible = false; updateFengchiaCard(); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

function showMainPage() {
  venuePageEl.classList.add("hidden");
  registrationPageEl.classList.add("hidden");
  matchPageEl.classList.add("hidden");
  scorePageEl.classList.add("hidden");
  adminPageEl.classList.add("hidden");
  systemAdminPageEl.classList.add("hidden");
  messageBoardPageEl.classList.add("hidden");
  updatePageEl.classList.add("hidden");
  closeDrawer();
  updateDrawerVenueGate();
}

function showVenuePage() {
  venueSelected = false;
  venuePageEl.classList.remove("hidden");
  document.getElementById("venue-top-select").classList.remove("hidden");
  document.getElementById("court-select").classList.add("hidden");
  registrationPageEl.classList.add("hidden");
  scorePageEl.classList.add("hidden");
  adminPageEl.classList.add("hidden");
  systemAdminPageEl.classList.add("hidden");
  closeDrawer();
  updateDrawerVenueGate();
  checkFengchiaAccessible();
}

function selectVenue(venueId) {
  adminUnlocked = false;
  venueSelected = true;
  venueSelectEl.value = venueId;
  venueSelectEl.dispatchEvent(new Event("change"));
  const venue = VENUES[venueId];
  const labelEl = document.getElementById("venue-badge-label");
  if (venue?.parentName) {
    labelEl.textContent = venue.parentName;
    venueBadgeNameEl.textContent = venue.name;
  } else {
    labelEl.textContent = "目前球場";
    venueBadgeNameEl.textContent = venue?.name || venueId;
  }
  venuePageEl.classList.add("hidden");
  updateDrawerVenueGate();
  showPage("registration");
  renderAdminModeView();
}

function showPage(page) {
  if (!venueSelected && page !== "update" && page !== "system-admin" && page !== "message-board") {
    showVenuePage();
    return;
  }
  const isRegistration = page === "registration";
  const isMatch = page === "match";
  const isScore = page === "score";
  const isAdmin = page === "admin";
  const isSystemAdmin = page === "system-admin";
  const isMessageBoard = page === "message-board";
  const isUpdate = page === "update";
  currentPage = page;
  window.scrollTo(0, 0);
  venuePageEl.classList.add("hidden");
  registrationPageEl.classList.toggle("hidden", !isRegistration);
  matchPageEl.classList.toggle("hidden", !isMatch);
  scorePageEl.classList.toggle("hidden", !isScore);
  adminPageEl.classList.toggle("hidden", !isAdmin);
  systemAdminPageEl.classList.toggle("hidden", !isSystemAdmin);
  messageBoardPageEl.classList.toggle("hidden", !isMessageBoard);
  updatePageEl.classList.toggle("hidden", !isUpdate);
  if (isUpdate) { renderChangelog(); }
  goRegistrationBtn.classList.toggle("active", isRegistration);
  goMatchBtn.classList.toggle("active", isMatch);
  goScoreBtn.classList.toggle("active", isScore);
  goAdminBtn.classList.toggle("active", isAdmin);
  const goSystemAdminBtnEl = document.getElementById("go-system-admin");
  if (goSystemAdminBtnEl) goSystemAdminBtnEl.classList.toggle("active", isSystemAdmin);
  const goMsgBoardBtnEl = document.getElementById("go-message-board");
  if (goMsgBoardBtnEl) goMsgBoardBtnEl.classList.toggle("active", isMessageBoard);
  updateScorePageMessage();
  if (isAdmin) updateAdminVenueInfo();
  if (isSystemAdmin && systemAdminUnlocked) {
    if (hasFirebase() && firebaseReady && !unsubscribeGlobalStats) {
      unsubscribeGlobalStats = window.FirebaseDB.subscribeGlobalStats(
        (data) => { globalStatsData = data; if (currentPage === "system-admin" && systemAdminUnlocked) renderFbStatsTable(); },
        (err) => console.error("[stats]", err)
      );
    }
    renderFbStatsTable();
    updateDifficultyStatus();
  }
  if (!isSystemAdmin && unsubscribeGlobalStats) {
    unsubscribeGlobalStats();
    unsubscribeGlobalStats = null;
    globalStatsData = null;
  }
  if (isMessageBoard) {
    if (hasFirebase() && firebaseReady) {
      if (!unsubscribeMessages) {
        unsubscribeMessages = window.FirebaseDB.subscribeMessages(
          (msgs) => { allMessages = msgs; if (currentPage === "message-board") renderMessageCards(); },
          (error) => console.error("Messages subscribe error:", error)
        );
      }
    } else {
      loadLocalMessages();
    }
    renderMessageCards();
    const savedName = localStorage.getItem(MSG_NAME_KEY);
    if (savedName && msgNameInputEl && !msgNameInputEl.value) msgNameInputEl.value = savedName;
  } else if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  document.body.classList.toggle("score-page-active", isScore);
  document.documentElement.classList.toggle("score-page-active", isScore);

  if (screen.orientation && screen.orientation.lock) {
    if (isScore) {
      screen.orientation.lock("landscape").catch(() => {});
    } else {
      screen.orientation.unlock();
    }
  }
}

function renderAdminModeView() {
  adminLoginSectionEl.classList.toggle("hidden", adminUnlocked);
  adminControlsSectionEl.classList.toggle("hidden", !adminUnlocked);
  if (adminUnlocked) renderAdminTeamList();
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateCurrentTime() {
  const now = new Date();
  currentTimeEl.textContent = `現在時間：${now.toLocaleString("zh-TW", { hour12: false })}`;
}

function hasFirebase() {
  return Boolean(window.FirebaseDB && window.FirebaseAppReady);
}

function getStatePayloadForStorage() {
  return {
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    serving: state.serving,
    finished: state.finished,
    teamAName: state.teamAName,
    teamBName: state.teamBName,
    teamAPlayers: state.teamAPlayers,
    teamBPlayers: state.teamBPlayers,
    registeredTeams: state.registeredTeams,
    registrationHistory: state.registrationHistory,
    currentAIndex: state.currentAIndex,
    currentBIndex: state.currentBIndex,
    scorerIndex: state.scorerIndex,
    scorerTeamId: state.scorerTeamId,
    streakTeamId: state.streakTeamId,
    streakCount: state.streakCount,
    currentMatchRecorded: state.currentMatchRecorded,
    quickStartMode: state.quickStartMode
  };
}

function applyVenueStatePayload(payload) {
  hasHydratedVenueState = true;
  if (!payload) {
    Object.assign(state, createEmptyVenueState());
    renderPlayerList(teamAPlayersEl, []);
    renderPlayerList(teamBPlayersEl, []);
    gameSectionEl.classList.add("hidden");
    statusSectionEl.classList.add("hidden");
    refreshView();
    return;
  }

  state.scoreA = payload.scoreA ?? 0;
  state.scoreB = payload.scoreB ?? 0;
  state.serving = payload.serving ?? null;
  state.finished = Boolean(payload.finished);
  state.teamAName = payload.teamAName ?? "隊伍 A";
  state.teamBName = payload.teamBName ?? "隊伍 B";
  state.teamAPlayers = Array.isArray(payload.teamAPlayers) ? payload.teamAPlayers : [];
  state.teamBPlayers = Array.isArray(payload.teamBPlayers) ? payload.teamBPlayers : [];
  const normalizedTeamsResult = normalizeRegisteredTeams(payload.registeredTeams);
  state.registeredTeams = normalizedTeamsResult.normalized;
  state.registrationHistory = Array.isArray(payload.registrationHistory) ? payload.registrationHistory : [];
  state.currentAIndex = Number.isInteger(payload.currentAIndex) ? payload.currentAIndex : null;
  state.currentBIndex = Number.isInteger(payload.currentBIndex) ? payload.currentBIndex : null;
  state.scorerIndex = Number.isInteger(payload.scorerIndex) ? payload.scorerIndex : null;
  state.scorerTeamId = typeof payload.scorerTeamId === "string" ? payload.scorerTeamId : null;
  state.streakTwoModeEnabled =
    typeof payload.streakTwoModeEnabled === "boolean" ? payload.streakTwoModeEnabled : false;
  state.streakTeamId = typeof payload.streakTeamId === "string" ? payload.streakTeamId : null;
  state.streakCount = Number.isInteger(payload.streakCount) ? payload.streakCount : 0;
  state.currentMatchRecorded = Boolean(payload.currentMatchRecorded);
  state.quickStartMode = Boolean(payload.quickStartMode);

  renderPlayerList(teamAPlayersEl, state.teamAPlayers);
  renderPlayerList(teamBPlayersEl, state.teamBPlayers);
  if (state.registeredTeams.length >= 2) {
    gameSectionEl.classList.remove("hidden");
    statusSectionEl.classList.remove("hidden");
  }
  renderRegisteredTeams();
  renderRegistrationHistory();
  renderAdminTeamList();
  ensureDeviceTeamStillExists();
  updateStreakModeStatus();
  refreshView();

  if (normalizedTeamsResult.changed) {
    saveRegistrationState();
  }
}

function subscribeFirebaseVenue(venueId) {
  if (!hasFirebase() || !firebaseReady) {
    return;
  }
  if (unsubscribeVenueState) unsubscribeVenueState();
  if (unsubscribeVenueMatches) unsubscribeVenueMatches();

  const venue = VENUES[venueId];
  window.FirebaseDB.ensureVenueBaseDoc(venueId, venue.name, venue.type).catch(console.error);

  unsubscribeVenueState = window.FirebaseDB.subscribeVenueState(
    venueId,
    (data) => {
      applyVenueStatePayload(data);
    },
    (error) => console.error("Venue state subscribe error:", error)
  );

  unsubscribeVenueMatches = window.FirebaseDB.subscribeVenueMatches(
    venueId,
    (matches) => {
      state.matchHistory = matches.map((m) => ({
        teamA: m.teamA,
        teamB: m.teamB,
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        winner: m.winner
      }));
      renderMatchHistory();
    },
    (error) => console.error("Venue matches subscribe error:", error)
  );
}

function persistToLocalStorage() {
  syncActiveVenueFromState();
  const payload = {
    date: getTodayKey(),
    selectedVenueId,
    venueStates: allVenueStates
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function saveRegistrationState() {
  persistToLocalStorage();
  if (hasFirebase() && firebaseReady) {
    window.FirebaseDB.saveVenueState(selectedVenueId, getStatePayloadForStorage()).catch((error) => {
      console.error("saveVenueState failed:", error);
    });
  }
}

async function ensureFirebaseAuth() {
  if (!hasFirebase() || !firebaseReady) return;
  if (!firebase.auth().currentUser) {
    console.log("[auth] signing in anonymously...");
    await firebase.auth().signInAnonymously();
    console.log("[auth] signed in:", firebase.auth().currentUser?.uid);
  }
}

async function saveRegistrationStateStrict() {
  persistToLocalStorage();
  if (hasFirebase() && firebaseReady) {
    const payload = getStatePayloadForStorage();
    await ensureFirebaseAuth();
    await window.FirebaseDB.saveVenueState(selectedVenueId, payload);
  }
}

async function saveAdminSettingsStrict(settings) {
  persistToLocalStorage();
  if (hasFirebase() && firebaseReady) {
    await ensureFirebaseAuth();
    await window.FirebaseDB.saveVenueState(selectedVenueId, settings);
  }
}

async function runDailyAutoResetIfNeeded() {
  if (isDailyResetRunning) {
    return;
  }
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  // Only allow auto reset around midnight to avoid daytime unexpected reset.
  if (!(hour === 0 && minute < 5)) {
    return;
  }
  const today = getTodayKey();
  const lastChecked = localStorage.getItem(DAILY_RESET_CHECK_KEY);
  if (lastChecked === today) {
    return;
  }

  isDailyResetRunning = true;
  try {
    if (hasFirebase() && firebaseReady) {
      for (const venueId of Object.keys(VENUES)) {
        const current = await window.FirebaseDB.getVenueState(venueId);
        if (current && current.autoResetDate === today) {
          continue;
        }
        const preservedStreakMode =
          current && typeof current.streakTwoModeEnabled === "boolean"
            ? current.streakTwoModeEnabled
            : false;
        await window.FirebaseDB.saveVenueState(venueId, {
          ...createEmptyVenueState(),
          streakTwoModeEnabled: preservedStreakMode,
          autoResetDate: today
        });
        await window.FirebaseDB.clearMatches(venueId);
        delete deviceTeamMap[venueId];
      }
      persistDeviceTeamMap();
      loadDeviceTeamForVenue();
      syncUserTeamClaim();
      registrationMessageEl.textContent = "已完成今日自動重置（報名與比賽結果）。";
    } else {
      const previousVenueStates = allVenueStates;
      allVenueStates = {};
      for (const venueId of Object.keys(VENUES)) {
        const previous = previousVenueStates[venueId];
        const preservedStreakMode =
          previous && typeof previous.streakTwoModeEnabled === "boolean"
            ? previous.streakTwoModeEnabled
            : false;
        allVenueStates[venueId] = {
          ...createEmptyVenueState(),
          streakTwoModeEnabled: preservedStreakMode,
          autoResetDate: today
        };
        delete deviceTeamMap[venueId];
      }
      persistDeviceTeamMap();
      loadDeviceTeamForVenue();
      syncStateFromActiveVenue();
      saveRegistrationState();
      renderRegisteredTeams();
      renderMatchHistory();
      refreshView();
      registrationMessageEl.textContent = "已完成今日自動重置（報名與比賽結果）。";
    }
    localStorage.setItem(DAILY_RESET_CHECK_KEY, today);
  } catch (error) {
    console.error("Daily auto reset failed:", error);
  } finally {
    isDailyResetRunning = false;
  }
}

function loadRegistrationState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) {
      localStorage.removeItem(STORAGE_KEY);
      allVenueStates = {};
      Object.assign(state, createEmptyVenueState());
      if (!hasFirebase()) {
        registrationMessageEl.textContent = "新的一天已開始，已自動清空昨日報名資料。";
        renderRegisteredTeams();
        renderMatchHistory();
      }
      return;
    }

    allVenueStates = data.venueStates && typeof data.venueStates === "object" ? data.venueStates : {};
    selectedVenueId = typeof data.selectedVenueId === "string" && VENUES[data.selectedVenueId]
      ? data.selectedVenueId
      : DEFAULT_VENUE_ID;
    syncStateFromActiveVenue();
    renderRegisteredTeams();
    renderMatchHistory();
    if (!hasFirebase()) {
      if (state.registeredTeams.length === 1) {
        registrationMessageEl.textContent = "已載入今天報名資料，請報名第二隊。";
      } else if (state.registeredTeams.length >= 2) {
        registrationMessageEl.textContent = "已載入今天報名資料。";
        startMatchWithQueue();
      }
    }
  } catch (_error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function isWinner(scoreSelf, scoreOther) {
  return scoreSelf >= WIN_SCORE && scoreSelf - scoreOther >= MIN_LEAD;
}

function isDeuce(scoreA, scoreB) {
  return scoreA >= WIN_SCORE - 1 && scoreB >= WIN_SCORE - 1 && Math.abs(scoreA - scoreB) < MIN_LEAD;
}

function refreshView() {
  teamATitleEl.textContent = state.teamAName;
  teamBTitleEl.textContent = state.teamBName;

  scoreAEl.textContent = String(state.scoreA);
  scoreBEl.textContent = String(state.scoreB);

  teamACardEl.classList.toggle("serving", state.serving === "A");
  teamBCardEl.classList.toggle("serving", state.serving === "B");

  if (isWinner(state.scoreA, state.scoreB)) {
    state.finished = true;
    statusEl.textContent = `${state.teamAName} 勝利！`;
    statusEl.classList.add("win");
  } else if (isWinner(state.scoreB, state.scoreA)) {
    state.finished = true;
    statusEl.textContent = `${state.teamBName} 勝利！`;
    statusEl.classList.add("win");
  } else {
    state.finished = false;
    if (isDeuce(state.scoreA, state.scoreB)) {
      statusEl.textContent = "Deuce（丟士）- 需領先 2 分";
    } else {
      statusEl.textContent = "比賽進行中";
    }
    statusEl.classList.remove("win");
  }

  if (state.scorerTeamId) {
    const scorerName = getTeamNameById(state.scorerTeamId);
    if (!deviceTeamId) {
      scorerStatusEl.textContent = `本裝置尚未綁定隊伍；本場記分隊：${scorerName}`;
    } else {
      const myTeamName = getTeamNameById(deviceTeamId);
      scorerStatusEl.textContent = canDeviceScore()
        ? `本場記分隊：${scorerName}（本裝置：${myTeamName}，有記分權）`
        : `本場記分隊：${scorerName}（本裝置：${myTeamName}，無記分權）`;
    }
  } else {
    scorerStatusEl.textContent = "本場無下一隊可記分，請等待下一隊報名。";
  }
  refreshScoringPermissionView();
  updateScorePageMessage();
}

function renderPlayerList(listEl, players) {
  listEl.innerHTML = "";
  for (const player of players) {
    const item = document.createElement("li");
    item.textContent = player;
    listEl.appendChild(item);
  }
}

function collectPlayers(containerEl) {
  const inputs = containerEl.querySelectorAll("input");
  const players = [];

  for (const input of inputs) {
    const name = input.value.trim();
    if (!name) {
      return null;
    }
    players.push(name);
  }

  return players;
}

function renderRegisteredTeams() {
  registeredTeamsEl.innerHTML = "";
  for (let index = 0; index < state.registeredTeams.length; index += 1) {
    const team = state.registeredTeams[index];
    const isPlaying = index === state.currentAIndex || index === state.currentBIndex;
    const isScorer = state.scorerTeamId && team.teamId === state.scorerTeamId;

    const item = document.createElement("li");
    item.className = "team-queue-item";
    if (isPlaying) item.classList.add("tq-is-playing");

    let badges = "";
    if (isPlaying) badges += `<span class="tq-badge tq-playing">🏐 比賽中</span>`;
    if (isScorer)  badges += `<span class="tq-badge tq-scoring">📊 記分中</span>`;
    if (!isPlaying && !isScorer) badges = `<span class="tq-badge tq-waiting">⏳ 等待中</span>`;

    const players = team.players.length > 0 ? team.players.join("、") : "（無球員資料）";
    item.innerHTML = `
      <div class="tq-header">
        <span class="tq-name">${team.name}</span>
        <div class="tq-badges">${badges}</div>
      </div>
      <div class="tq-players">${players}</div>`;
    registeredTeamsEl.appendChild(item);
  }

  const quickStartBtn = document.getElementById("quick-start");
  if (quickStartBtn) {
    quickStartBtn.classList.toggle("hidden", state.registeredTeams.length > 0);
  }
}

function renderRegistrationHistory() {
  registrationHistoryEl.innerHTML = "";
  const losers = new Set();
  for (const match of state.matchHistory) {
    if (match.teamA !== match.winner) losers.add(match.teamA);
    if (match.teamB !== match.winner) losers.add(match.teamB);
  }
  for (const name of state.registrationHistory) {
    const item = document.createElement("li");
    item.textContent = name;
    if (losers.has(name)) item.classList.add("history-loser");
    registrationHistoryEl.appendChild(item);
  }
}

function renderMatchHistory() {
  matchHistoryEl.innerHTML = "";
  for (let index = 0; index < state.matchHistory.length; index += 1) {
    const match = state.matchHistory[index];
    const aWon = match.winner === match.teamA;
    const bWon = match.winner === match.teamB;
    const item = document.createElement("li");
    item.className = "match-item";
    item.innerHTML = `
      <span class="match-num">第 ${index + 1} 場</span>
      <div class="match-row">
        <span class="match-team ${aWon ? "match-winner" : "match-loser"}">${aWon ? "🏆 " : ""}${match.teamA}</span>
        <span class="match-score">${match.scoreA} : ${match.scoreB}</span>
        <span class="match-team ${bWon ? "match-winner" : "match-loser"}">${bWon ? "🏆 " : ""}${match.teamB}</span>
      </div>`;
    matchHistoryEl.appendChild(item);
  }
}

function clearRegistrationForm() {
  teamNameInputEl.value = "";
  const inputs = teamInputContainerEl.querySelectorAll("input");
  for (const input of inputs) {
    input.value = "";
  }
}

async function clearAllRegistrationData() {
  const preservedStreakMode = state.streakTwoModeEnabled;
  Object.assign(state, createEmptyVenueState());
  state.streakTwoModeEnabled = preservedStreakMode;

  renderPlayerList(teamAPlayersEl, []);
  renderPlayerList(teamBPlayersEl, []);
  renderRegisteredTeams();
  renderRegistrationHistory();
  renderMatchHistory();
  clearRegistrationForm();

  gameSectionEl.classList.add("hidden");
  statusSectionEl.classList.add("hidden");

  await saveRegistrationStateStrict();
  delete deviceTeamMap[selectedVenueId];
  persistDeviceTeamMap();
  loadDeviceTeamForVenue();
  syncUserTeamClaim();
  refreshView();
}

function cancelMyRegistration() {
  if (!deviceTeamId) {
    registrationMessageEl.textContent = "本裝置尚未綁定報名隊伍，無法取消。";
    return;
  }

  const cancelIndex = state.registeredTeams.findIndex((team) => team.teamId === deviceTeamId);
  if (cancelIndex === -1) {
    registrationMessageEl.textContent = "目前球場找不到你的報名資料。";
    return;
  }

  if (cancelIndex === state.currentAIndex || cancelIndex === state.currentBIndex) {
    registrationMessageEl.textContent = "比賽中的隊伍不可取消報名。";
    return;
  }

  const cancelledTeam = state.registeredTeams[cancelIndex];
  const confirmed = window.confirm(`確定要取消「${cancelledTeam.name}」的報名嗎？`);
  if (!confirmed) {
    return;
  }
  state.registeredTeams.splice(cancelIndex, 1);

  if (Number.isInteger(state.currentAIndex) && state.currentAIndex > cancelIndex) {
    state.currentAIndex -= 1;
  }
  if (Number.isInteger(state.currentBIndex) && state.currentBIndex > cancelIndex) {
    state.currentBIndex -= 1;
  }

  if (Number.isInteger(state.scorerIndex)) {
    if (state.scorerIndex > cancelIndex) {
      state.scorerIndex -= 1;
    } else if (state.scorerIndex === cancelIndex) {
      state.scorerIndex = cancelIndex < state.registeredTeams.length ? cancelIndex : null;
    }
  }
  state.scorerTeamId =
    Number.isInteger(state.scorerIndex) && state.registeredTeams[state.scorerIndex]
      ? state.registeredTeams[state.scorerIndex].teamId
      : null;

  delete deviceTeamMap[selectedVenueId];
  persistDeviceTeamMap();
  loadDeviceTeamForVenue();
  syncUserTeamClaim();

  if (state.registeredTeams.length < 2) {
    gameSectionEl.classList.add("hidden");
    statusSectionEl.classList.add("hidden");
    state.currentAIndex = null;
    state.currentBIndex = null;
    state.scorerIndex = null;
    state.scorerTeamId = null;
    state.scoreA = 0;
    state.scoreB = 0;
    state.serving = null;
    state.finished = false;
  }

  renderRegisteredTeams();
  ensureDeviceTeamStillExists();
  refreshView();
  saveRegistrationState();
  registrationMessageEl.textContent = `已取消 ${cancelledTeam.name} 的報名。`;
}

async function resetRegistrationWithPassword() {
  if (!adminUnlocked) {
    adminAuthMessageEl.textContent = "請先進入管理員模式。";
    return;
  }
  const venueName = VENUES[selectedVenueId].name;
  if (!window.confirm(`確定要重置「${venueName}」的報名隊伍嗎？`)) return;
  try {
    await callAdminAction("resetRegistration");
    clearAllRegistrationData();
    registrationMessageEl.textContent = `已完成「${venueName}」報名重置，請重新報名。`;
  } catch (error) {
    registrationMessageEl.textContent = `重置失敗：${error.message}`;
  }
}

async function unlockSystemAdmin() {
  const pwd = sysAdminPasswordInputEl.value.trim();
  sysAdminAuthMessageEl.textContent = "驗證中...";
  try {
    const data = await callAdminAPI("/api/unlock-system-admin", { password: pwd });
    sessionStorage.setItem("vb_sys_token", data.token);
    systemAdminUnlocked = true;
    sysAdminLoginSectionEl.classList.add("hidden");
    sysAdminControlsSectionEl.classList.remove("hidden");
    sysAdminPasswordInputEl.value = "";
    if (data.gameDifficulty) {
      const s = loadSystemSettings();
      saveSystemSettings({ ...s, gameDifficulty: data.gameDifficulty });
      localStorage.setItem("pv-offline-speed", data.gameDifficulty);
    }
    if (data.locationCheckEnabled !== undefined) {
      state.locationCheckEnabled = data.locationCheckEnabled;
    }
    updateSysLocationCheckStatus();
    updateDifficultyStatus();
    renderFbStatsTable();
    if (hasFirebase() && firebaseReady && !unsubscribeGlobalStats) {
      unsubscribeGlobalStats = window.FirebaseDB.subscribeGlobalStats(
        (d) => { globalStatsData = d; if (currentPage === "system-admin" && systemAdminUnlocked) renderFbStatsTable(); },
        () => {}
      );
    }
  } catch (e) {
    sysAdminAuthMessageEl.textContent = e.message === "密碼錯誤" ? "密碼錯誤。" : `連線錯誤：${e.message}`;
  }
}

function toggleSystemLocationCheck() {
  if (!systemAdminUnlocked) return;
  const newValue = !state.locationCheckEnabled;
  const label = newValue ? "啟用" : "停用";
  if (!window.confirm(`確定要${label}定位檢查嗎？`)) return;
  state.locationCheckEnabled = newValue;
  updateSysLocationCheckStatus();
  isInVenue = !newValue;
  applyVenueGate();
  if (newValue) checkLocationForRegistration();
  checkFengchiaAccessible();
  callAdminAction("setConfig", { config: { locationCheckEnabled: newValue } })
    .catch((e) => console.error("[locationCheck] sync failed:", e));
}

async function toggleStreakMode() {
  if (!adminUnlocked) {
    adminAuthMessageEl.textContent = "請先進入管理員模式。";
    return;
  }
  const venueName = VENUES[selectedVenueId].name;
  const target = state.streakTwoModeEnabled ? "關閉連二下模式" : "開啟連二下模式";
  const confirmed = window.confirm(`確定要在「${venueName}」${target}嗎？`);
  if (!confirmed) {
    return;
  }

  const originalStreakMode = state.streakTwoModeEnabled;
  const newStreakMode = !originalStreakMode;
  state.streakTwoModeEnabled = newStreakMode;
  state.streakTeamId = null;
  state.streakCount = 0;
  updateStreakModeStatus();
  try {
    await saveAdminSettingsStrict({ streakTwoModeEnabled: newStreakMode, streakTeamId: null, streakCount: 0 });
    streakModeStatusEl.textContent = newStreakMode ? "連二下模式：已啟用" : "連二下模式：已停用";
  } catch (error) {
    console.error("toggle streak mode failed:", error);
    state.streakTwoModeEnabled = originalStreakMode;
    updateStreakModeStatus();
    const errCode = error && error.code ? ` [${error.code}]` : "";
    streakModeStatusEl.textContent = `切換失敗${errCode}，請確認 Firebase 設定。`;
  }
}


function quickStart() {
  if (state.registeredTeams.length > 0) {
    registrationMessageEl.textContent = "已有隊伍報名，無法使用快速開局。";
    return;
  }
  if (!window.confirm("加入「A 隊」和「B 隊」為虛擬隊伍，再報名你的隊伍取得計分權？")) return;

  const teamA = { teamId: generateTeamId(), ownerDeviceId: "", name: "A 隊", players: [] };
  const teamB = { teamId: generateTeamId(), ownerDeviceId: "", name: "B 隊", players: [] };
  state.registeredTeams.push(teamA, teamB);
  startMatchWithQueue();

  renderRegisteredTeams();
  renderAdminTeamList();
  gameSectionEl.classList.remove("hidden");
  statusSectionEl.classList.remove("hidden");
  refreshView();
  saveRegistrationState();
  registrationMessageEl.textContent = "已加入 A 隊、B 隊，請填寫隊名後報名取得計分權。";
}

function renderAdminTeamList() {
  const listEl = document.getElementById("admin-team-list");
  if (!listEl) return;
  listEl.innerHTML = "";
  if (state.registeredTeams.length === 0) {
    const empty = document.createElement("li");
    empty.className = "admin-team-empty";
    empty.textContent = "目前沒有報名隊伍";
    listEl.appendChild(empty);
    return;
  }
  for (let i = 0; i < state.registeredTeams.length; i += 1) {
    const team = state.registeredTeams[i];
    const isPlaying = i === state.currentAIndex || i === state.currentBIndex;
    const li = document.createElement("li");
    li.className = "admin-team-item";
    const info = document.createElement("span");
    info.textContent = `${team.name}${isPlaying ? "　（比賽中）" : ""}`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "刪除";
    delBtn.className = "danger-btn admin-team-del-btn";
    delBtn.addEventListener("click", () => adminForceDeleteTeam(i));
    li.appendChild(info);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  }
}

function adminForceDeleteTeam(teamIndex) {
  if (!adminUnlocked) return;
  const team = state.registeredTeams[teamIndex];
  if (!team) return;

  const isPlayingA = teamIndex === state.currentAIndex;
  const isPlayingB = teamIndex === state.currentBIndex;
  const isPlaying = isPlayingA || isPlayingB;

  const confirmMsg = isPlaying
    ? `確定要強制刪除「${team.name}」的報名嗎？\n（該隊正在比賽中，將由算分隊伍補位；若無算分隊伍，比賽將暫停等待報名）`
    : `確定要強制刪除「${team.name}」的報名嗎？`;
  if (!window.confirm(confirmMsg)) return;

  let resultMsg = "";

  if (isPlaying) {
    const scorerIdxBeforeSplice = state.scorerIndex;

    state.registeredTeams.splice(teamIndex, 1);

    // adjust all indices down past the removed position
    function adj(idx) {
      if (!Number.isInteger(idx)) return idx;
      if (idx === teamIndex) return null;
      return idx > teamIndex ? idx - 1 : idx;
    }

    const adjA = isPlayingA ? null : adj(state.currentAIndex);
    const adjB = isPlayingB ? null : adj(state.currentBIndex);
    const adjScorer = adj(scorerIdxBeforeSplice);

    if (Number.isInteger(adjScorer) && state.registeredTeams[adjScorer]) {
      // scorer fills in for the deleted playing team
      state.currentAIndex = isPlayingA ? adjScorer : adjA;
      state.currentBIndex = isPlayingB ? adjScorer : adjB;
      state.scorerIndex = null;
      state.scorerTeamId = null;
      assignScorerIfMissing();

      const newA = state.registeredTeams[state.currentAIndex];
      const newB = state.registeredTeams[state.currentBIndex];
      state.teamAName = newA.name;
      state.teamBName = newB.name;
      state.teamAPlayers = [...newA.players];
      state.teamBPlayers = [...newB.players];
      state.scoreA = 0;
      state.scoreB = 0;
      state.serving = "B";
      state.finished = false;
      state.currentMatchRecorded = false;
      renderPlayerList(teamAPlayersEl, state.teamAPlayers);
      renderPlayerList(teamBPlayersEl, state.teamBPlayers);
      gameSectionEl.classList.remove("hidden");
      statusSectionEl.classList.remove("hidden");
      resultMsg = `已刪除「${team.name}」（比賽中），由算分隊補位，比賽重置。`;
    } else {
      // no scorer to fill in — pause until a new team registers
      state.currentAIndex = null;
      state.currentBIndex = null;
      state.scorerIndex = null;
      state.scorerTeamId = null;
      state.scoreA = 0;
      state.scoreB = 0;
      state.serving = null;
      state.finished = false;
      gameSectionEl.classList.add("hidden");
      statusSectionEl.classList.add("hidden");
      resultMsg = `已刪除「${team.name}」（比賽中），無後續隊伍，等待新隊伍報名後繼續。`;
    }
  } else {
    state.registeredTeams.splice(teamIndex, 1);

    if (Number.isInteger(state.currentAIndex) && state.currentAIndex > teamIndex) state.currentAIndex -= 1;
    if (Number.isInteger(state.currentBIndex) && state.currentBIndex > teamIndex) state.currentBIndex -= 1;
    if (Number.isInteger(state.scorerIndex)) {
      if (state.scorerIndex > teamIndex) {
        state.scorerIndex -= 1;
      } else if (state.scorerIndex === teamIndex) {
        state.scorerIndex = teamIndex < state.registeredTeams.length ? teamIndex : null;
      }
    }
    state.scorerTeamId =
      Number.isInteger(state.scorerIndex) && state.registeredTeams[state.scorerIndex]
        ? state.registeredTeams[state.scorerIndex].teamId
        : null;

    if (state.registeredTeams.length < 2) {
      gameSectionEl.classList.add("hidden");
      statusSectionEl.classList.add("hidden");
      state.currentAIndex = null;
      state.currentBIndex = null;
      state.scorerIndex = null;
      state.scorerTeamId = null;
      state.scoreA = 0;
      state.scoreB = 0;
      state.serving = null;
      state.finished = false;
    }
    resultMsg = `已強制刪除「${team.name}」的報名。`;
  }

  renderRegisteredTeams();
  renderAdminTeamList();
  ensureDeviceTeamStillExists();
  refreshView();
  saveRegistrationState();
  registrationMessageEl.textContent = resultMsg;
}

async function resetMatchHistory() {
  if (!adminUnlocked) {
    adminAuthMessageEl.textContent = "請先進入管理員模式。";
    return;
  }
  const venueName = VENUES[selectedVenueId].name;
  if (!window.confirm(`確定要清空「${venueName}」的比賽結果紀錄嗎？`)) return;
  try {
    await callAdminAction("resetMatchHistory");
    state.matchHistory = [];
    renderMatchHistory();
    registrationMessageEl.textContent = `已清空「${venueName}」比賽結果紀錄。`;
  } catch (error) {
    registrationMessageEl.textContent = `清空失敗：${error.message}`;
  }
}

async function unlockAdminPage() {
  const password = adminPasswordInputEl.value;
  adminAuthMessageEl.textContent = "驗證中...";
  try {
    const data = await callAdminAPI("/api/unlock-admin", { venueId: selectedVenueId, password });
    sessionStorage.setItem("vb_admin_token", data.token);
    adminUnlocked = true;
    adminPasswordInputEl.value = "";
    adminAuthMessageEl.textContent = "已進入管理員模式。";
    renderAdminModeView();
    renderAdminTeamList();
  } catch (e) {
    adminAuthMessageEl.textContent = e.message === "密碼錯誤" ? "密碼錯誤。" : `連線錯誤：${e.message}`;
  }
}

function setTeamsByIndex(teamAIndex, teamBIndex) {
  const teamA = state.registeredTeams[teamAIndex];
  const teamB = state.registeredTeams[teamBIndex];

  if (!teamA || !teamB) {
    return false;
  }

  state.teamAName = teamA.name;
  state.teamBName = teamB.name;
  state.teamAPlayers = teamA.players;
  state.teamBPlayers = teamB.players;
  state.currentAIndex = teamAIndex;
  state.currentBIndex = teamBIndex;
  state.scoreA = 0;
  state.scoreB = 0;
  // New challenger is displayed on team B side, so B serves first.
  state.serving = "B";
  state.finished = false;
  state.currentMatchRecorded = false;

  renderPlayerList(teamAPlayersEl, state.teamAPlayers);
  renderPlayerList(teamBPlayersEl, state.teamBPlayers);
  renderRegisteredTeams();

  gameSectionEl.classList.remove("hidden");
  statusSectionEl.classList.remove("hidden");

  refreshView();
  return true;
}

function startMatchWithQueue() {
  if (state.registeredTeams.length < 2) {
    return;
  }

  if (
    Number.isInteger(state.currentAIndex) &&
    Number.isInteger(state.currentBIndex) &&
    state.registeredTeams[state.currentAIndex] &&
    state.registeredTeams[state.currentBIndex]
  ) {
    setTeamsByIndex(state.currentAIndex, state.currentBIndex);
    return;
  }

  state.streakTeamId = null;
  state.streakCount = 0;
  state.scorerIndex = state.registeredTeams.length >= 3 ? 2 : null;
  state.scorerTeamId = state.scorerIndex === null ? null : state.registeredTeams[state.scorerIndex].teamId;
  setTeamsByIndex(0, 1);
}

function advanceToNextMatch() {
  if (!state.finished) {
    return false;
  }

  if (!Number.isInteger(state.scorerIndex) || state.scorerIndex >= state.registeredTeams.length) {
    registrationMessageEl.textContent = "目前沒有下一隊可上場，請先繼續報名。";
    return false;
  }

  const winnerIndexRaw = state.scoreA > state.scoreB ? state.currentAIndex : state.currentBIndex;
  const loserIndexRaw = state.scoreA > state.scoreB ? state.currentBIndex : state.currentAIndex;
  let challengerIndex = state.scorerIndex;

  // Loser leaves queue; challenger enters next match.
  state.registeredTeams.splice(loserIndexRaw, 1);

  let winnerIndex = winnerIndexRaw;
  if (loserIndexRaw < winnerIndexRaw) {
    winnerIndex -= 1;
  }
  if (loserIndexRaw < challengerIndex) {
    challengerIndex -= 1;
  }

  const winnerTeamId = state.registeredTeams[winnerIndex].teamId;
  if (state.streakTeamId === winnerTeamId) {
    state.streakCount += 1;
  } else {
    state.streakTeamId = winnerTeamId;
    state.streakCount = 1;
  }

  if (state.streakTwoModeEnabled && state.streakCount >= 2) {
    state.scorerIndex = winnerIndex;
    state.scorerTeamId = winnerTeamId;

    const playIndices = [];
    for (let i = 0; i < state.registeredTeams.length; i += 1) {
      if (i !== state.scorerIndex) {
        playIndices.push(i);
      }
    }

    if (playIndices.length >= 2) {
      const started = setTeamsByIndex(playIndices[0], playIndices[1]);
      state.streakTeamId = null;
      state.streakCount = 0;
      registrationMessageEl.textContent = `${state.registeredTeams[state.scorerIndex].name} 連贏兩場，下場改為記分隊。`;
      if (started) {
        saveRegistrationState();
        const upA = state.registeredTeams[playIndices[0]]?.name;
        const upB = state.registeredTeams[playIndices[1]]?.name;
        const nextWait = playIndices[2] !== undefined ? state.registeredTeams[playIndices[2]]?.name : null;
        if (upA) sendPlayNotification(selectedVenueId, upA, "輪到你們上場了！！！", `${upA} 快來上場！`);
        if (upB) sendPlayNotification(selectedVenueId, upB, "輪到你們上場了！！！", `${upB} 快來上場！`);
        if (nextWait) sendPlayNotification(selectedVenueId, nextWait, "目前是PLAY2了！", `${nextWait} 下一場就是你算分了喔！只能再休息一下！`);
      }
      return started;
    }
  }

  const nextScorerIndex = challengerIndex + 1;
  state.scorerIndex = nextScorerIndex < state.registeredTeams.length ? nextScorerIndex : null;
  state.scorerTeamId = state.scorerIndex === null ? null : state.registeredTeams[state.scorerIndex].teamId;
  ensureDeviceTeamStillExists();
  registrationMessageEl.textContent = `${state.registeredTeams[winnerIndex].name} 留場，下一場開始。`;
  const started = setTeamsByIndex(winnerIndex, challengerIndex);
  if (started) {
    saveRegistrationState();
    const play1Name = state.scorerIndex !== null ? state.registeredTeams[state.scorerIndex]?.name : null;
    const play2Name = state.scorerIndex !== null ? state.registeredTeams[state.scorerIndex + 1]?.name : null;
    if (play1Name) sendPlayNotification(selectedVenueId, play1Name, "目前是PLAY1了！", `${play1Name} 快來算分！下場就是你了喔`);
    if (play2Name) sendPlayNotification(selectedVenueId, play2Name, "目前是PLAY2了！", `${play2Name} 下一場就是你算分了喔！只能再休息一下！`);
  }
  return started;
}

function loadFavoriteTeams() {
  try {
    const raw = localStorage.getItem(FAVORITE_TEAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

function persistFavoriteTeams(favorites) {
  localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(favorites));
}

function renderFavoriteSelect() {
  const favorites = loadFavoriteTeams();
  const selected = favoriteSelectEl.value;
  favoriteSelectEl.innerHTML = '<option value="">── 選擇常用隊伍 ──</option>';
  for (const fav of favorites) {
    const opt = document.createElement("option");
    opt.value = fav.id;
    opt.textContent = `${fav.name}（${fav.players.join("、")}）`;
    favoriteSelectEl.appendChild(opt);
  }
  if (selected && favoriteSelectEl.querySelector(`option[value="${selected}"]`)) {
    favoriteSelectEl.value = selected;
  }
}

function applyFavoriteTeam() {
  const id = favoriteSelectEl.value;
  if (!id) {
    registrationMessageEl.textContent = "請先選擇一支常用隊伍。";
    return;
  }
  const fav = loadFavoriteTeams().find((f) => f.id === id);
  if (!fav) return;
  teamNameInputEl.value = fav.name;
  const inputs = teamInputContainerEl.querySelectorAll("input");
  for (let i = 0; i < inputs.length; i += 1) {
    inputs[i].value = fav.players[i] || "";
  }
  registrationMessageEl.textContent = `已套用常用隊伍「${fav.name}」，確認後點報名。`;
}

function saveAsFavoriteTeam() {
  const teamName = teamNameInputEl.value.trim();
  const players = collectPlayers(teamInputContainerEl);
  if (!teamName) {
    registrationMessageEl.textContent = "請先填寫隊名再儲存。";
    return;
  }
  if (!players) {
    registrationMessageEl.textContent = "請完整填寫 6 位球員姓名再儲存。";
    return;
  }
  const favorites = loadFavoriteTeams();
  const existing = favorites.find((f) => f.name === teamName);
  if (existing) {
    existing.players = players;
    persistFavoriteTeams(favorites);
    renderFavoriteSelect();
    registrationMessageEl.textContent = `已更新常用隊伍「${teamName}」的名單。`;
    return;
  }
  const id = `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  favorites.push({ id, name: teamName, players });
  persistFavoriteTeams(favorites);
  renderFavoriteSelect();
  registrationMessageEl.textContent = `已儲存「${teamName}」為常用隊伍。`;
}

function deleteFavoriteTeam() {
  const id = favoriteSelectEl.value;
  if (!id) {
    registrationMessageEl.textContent = "請先選擇要刪除的常用隊伍。";
    return;
  }
  const favorites = loadFavoriteTeams();
  const fav = favorites.find((f) => f.id === id);
  if (!fav) return;
  if (!window.confirm(`確定要刪除常用隊伍「${fav.name}」嗎？`)) return;
  persistFavoriteTeams(favorites.filter((f) => f.id !== id));
  renderFavoriteSelect();
  registrationMessageEl.textContent = `已刪除常用隊伍「${fav.name}」。`;
}

function registerTeam() {
  if (isLocationCheckEnabled() && !isInVenue) {
    const venue = VENUES[selectedVenueId];
    registrationMessageEl.textContent = `需在「${venue.name}」範圍內才能報名。`;
    return;
  }


  if (deviceTeamId) {
    const exists = state.registeredTeams.some((team) => team.teamId === deviceTeamId);
    if (exists) {
      registrationMessageEl.textContent = "本裝置已綁定一支隊伍，請先取消我的報名後再報名新隊伍。";
      return;
    }
  }

  const teamName = teamNameInputEl.value.trim();
  const teamPlayers = collectPlayers(teamInputContainerEl);

  if (!teamName) {
    registrationMessageEl.textContent = "請輸入隊名。";
    return;
  }

  if (!teamPlayers) {
    registrationMessageEl.textContent = "請完整填寫 6 位球員姓名。";
    return;
  }

  const newTeam = {
    teamId: generateTeamId(),
    ownerDeviceId: deviceUuid,
    name: teamName,
    players: teamPlayers
  };
  state.registeredTeams.push(newTeam);
  state.registrationHistory.push(newTeam.name);
  bindDeviceTeamIfNeeded(newTeam.teamId);
  assignScorerIfMissing();
  subscribeToPush(selectedVenueId, newTeam.name);

  renderRegisteredTeams();
  renderRegistrationHistory();
  ensureDeviceTeamStillExists();
  clearRegistrationForm();

  if (state.registeredTeams.length === 1) {
    registrationMessageEl.textContent = "第一隊報名完成，請報名第二隊。";
    saveRegistrationState();
    return;
  }

  if (state.registeredTeams.length === 2) {
    registrationMessageEl.textContent = "兩隊報名完成，已依順序開始比賽。";
    state.currentAIndex = null;
    state.currentBIndex = null;
    state.scorerIndex = null;
    state.scorerTeamId = null;
    startMatchWithQueue();
    saveRegistrationState();
    showPage("score");
    return;
  }

  if (state.registeredTeams.length === 3 && state.scorerTeamId === null) {
    state.scorerIndex = 2;
    state.scorerTeamId = state.registeredTeams[2].teamId;
    registrationMessageEl.textContent = "第 3 隊已加入，已取得本場記分權。";
    refreshView();
    saveRegistrationState();
    return;
  }

  const justGotScorer = state.scorerTeamId && state.scorerTeamId === deviceTeamId;
  registrationMessageEl.textContent = justGotScorer
    ? `已加入第 ${state.registeredTeams.length} 隊，已取得本場計分權。`
    : `已加入第 ${state.registeredTeams.length} 隊。`;
  saveRegistrationState();
}

function recordFinishedMatchIfNeeded() {
  if (!state.finished || state.currentMatchRecorded) {
    return;
  }

  const winner = state.scoreA > state.scoreB ? state.teamAName : state.teamBName;
  const match = {
    teamA: state.teamAName,
    teamB: state.teamBName,
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    winner
  };

  if (hasFirebase() && firebaseReady) {
    window.FirebaseDB.addMatch(selectedVenueId, match).catch((error) => {
      console.error("addMatch failed:", error);
    });
  } else {
    state.matchHistory.push(match);
  }
  state.currentMatchRecorded = true;
  renderMatchHistory();
  saveRegistrationState();
}

function addPoint(team) {
  if (state.finished || !canDeviceScore()) {
    return;
  }

  if (team === "A") {
    state.scoreA += 1;
  } else {
    state.scoreB += 1;
  }
  state.serving = team;
  refreshView();
  saveRegistrationState();

  if (state.finished) {
    recordFinishedMatchIfNeeded();
    if (advanceToNextMatch()) {
      return;
    }
    registrationMessageEl.textContent = "本場已結束，請等待下一隊報名後自動開啟下一場。";
  }
}

function removePoint(team) {
  if (!canDeviceScore()) {
    return;
  }
  if (team === "A") {
    state.scoreA = Math.max(0, state.scoreA - 1);
  } else {
    state.scoreB = Math.max(0, state.scoreB - 1);
  }
  refreshView();
  saveRegistrationState();
}

aPlusBtn.addEventListener("click", () => addPoint("A"));
aMinusBtn.addEventListener("click", () => removePoint("A"));
bPlusBtn.addEventListener("click", () => addPoint("B"));
bMinusBtn.addEventListener("click", () => removePoint("B"));
registerTeamBtn.addEventListener("click", registerTeam);
cancelMyRegistrationBtn.addEventListener("click", cancelMyRegistration);
resetRegistrationBtn.addEventListener("click", resetRegistrationWithPassword);
resetMatchHistoryBtn.addEventListener("click", resetMatchHistory);
toggleStreakModeBtn.addEventListener("click", toggleStreakMode);
adminUnlockBtn.addEventListener("click", unlockAdminPage);
document.getElementById("quick-start").addEventListener("click", quickStart);
applyFavoriteBtnEl.addEventListener("click", applyFavoriteTeam);
saveFavoriteBtnEl.addEventListener("click", saveAsFavoriteTeam);
deleteFavoriteBtnEl.addEventListener("click", deleteFavoriteTeam);
venueSelectEl.addEventListener("change", () => {
  if (hasFirebase() && firebaseReady) {
    selectedVenueId = venueSelectEl.value;
    loadDeviceTeamForVenue();
    syncUserTeamClaim();
    hasHydratedVenueState = false;
    // Avoid cross-venue stale state before snapshot returns.
    Object.assign(state, createEmptyVenueState());
    renderPlayerList(teamAPlayersEl, []);
    renderPlayerList(teamBPlayersEl, []);
    renderRegisteredTeams();
    renderMatchHistory();
    gameSectionEl.classList.add("hidden");
    statusSectionEl.classList.add("hidden");
    refreshView();
    subscribeFirebaseVenue(selectedVenueId);
  } else {
  syncActiveVenueFromState();
  selectedVenueId = venueSelectEl.value;
  loadDeviceTeamForVenue();
  syncUserTeamClaim();
  syncStateFromActiveVenue();
  renderRegisteredTeams();
  renderMatchHistory();
  if (state.registeredTeams.length >= 2) {
    startMatchWithQueue();
  } else {
    renderPlayerList(teamAPlayersEl, []);
    renderPlayerList(teamBPlayersEl, []);
    gameSectionEl.classList.add("hidden");
    statusSectionEl.classList.add("hidden");
    refreshView();
  }
  saveRegistrationState();
  }
  isInVenue = false;
  applyVenueGate();
  if (isLocationCheckEnabled()) checkLocationForRegistration();
});
goRegistrationBtn.addEventListener("click", () => showPage("registration"));
goMatchBtn.addEventListener("click", () => { showPage("match"); closeDrawer(); });
goScoreBtn.addEventListener("click", () => showPage("score"));
goAdminBtn.addEventListener("click", () => showPage("admin"));
document.getElementById("go-system-admin").addEventListener("click", () => { showPage("system-admin"); closeDrawer(); });
sysAdminUnlockBtn.addEventListener("click", unlockSystemAdmin);
sysToggleLocationCheckBtn.addEventListener("click", toggleSystemLocationCheck);
sysClearLeaderboardBtn.addEventListener("click", async () => {
  if (!systemAdminUnlocked) return;
  if (!window.confirm("確定要清除所有排行榜紀錄嗎？")) return;
  localStorage.removeItem("pikachu-leaderboard");
  try {
    await callAdminAction("clearLeaderboard");
    if (sysControlsMessageEl) sysControlsMessageEl.textContent = "排行榜已清除。";
  } catch (e) {
    if (sysControlsMessageEl) sysControlsMessageEl.textContent = `清除失敗：${e.message}`;
  }
});
if (sysClearMessagesBtn) sysClearMessagesBtn.addEventListener("click", clearMessageBoard);
["slow", "medium", "fast"].forEach(d => {
  const btn = document.getElementById(`sys-difficulty-${d}`);
  if (btn) btn.addEventListener("click", () => setGameDifficulty(d));
});
document.getElementById("sys-admin-back-btn").addEventListener("click", () => {
  if (!venueSelected) showVenuePage(); else showPage("registration");
});
const announcementModal = document.getElementById("announcement-modal");
document.getElementById("go-announcement").addEventListener("click", () => { announcementModal.classList.remove("hidden"); closeDrawer(); });
document.getElementById("announcement-close").addEventListener("click", () => announcementModal.classList.add("hidden"));
announcementModal.addEventListener("click", e => { if (e.target === announcementModal) announcementModal.classList.add("hidden"); });
document.getElementById("go-message-board").addEventListener("click", () => { showPage("message-board"); closeDrawer(); });
document.getElementById("msg-board-back-btn").addEventListener("click", () => {
  if (!venueSelected) showVenuePage(); else showPage("registration");
});
document.getElementById("update-back-btn").addEventListener("click", () => {
  if (!venueSelected) showVenuePage(); else showPage("registration");
});
document.getElementById("update-start-btn").addEventListener("click", runUpdate);
if (msgSubmitBtn) msgSubmitBtn.addEventListener("click", submitMessage);
document.getElementById("select-fengchia").addEventListener("click", () => {
  if (isLocationCheckEnabled() && !fengchiaAccessible) return;
  document.getElementById("venue-top-select").classList.add("hidden");
  document.getElementById("court-select").classList.remove("hidden");
});
document.getElementById("back-to-venues").addEventListener("click", () => {
  document.getElementById("court-select").classList.add("hidden");
  document.getElementById("venue-top-select").classList.remove("hidden");
});
document.getElementById("select-fengchia-1").addEventListener("click", () => selectVenue("fengchia_1"));
document.getElementById("select-fengchia-2").addEventListener("click", () => selectVenue("fengchia_2"));
document.getElementById("select-home").addEventListener("click", () => selectVenue("home"));
document.getElementById("change-venue-btn").addEventListener("click", () => showVenuePage());
document.getElementById("force-update-btn").addEventListener("click", () => { showPage("update"); closeDrawer(); });

// Side drawer
const navToggle = document.getElementById("nav-toggle");
const navOverlay = document.getElementById("nav-overlay");
const sideDrawer = document.getElementById("side-drawer");
const navClose = document.getElementById("nav-close");
function openDrawer() {
  sideDrawer.classList.add("open");
  navOverlay.classList.add("open");
}
function closeDrawer() {
  sideDrawer.classList.remove("open");
  navOverlay.classList.remove("open");
}
navToggle.addEventListener("click", openDrawer);
navClose.addEventListener("click", closeDrawer);
navOverlay.addEventListener("click", closeDrawer);
[goRegistrationBtn, goScoreBtn, goAdminBtn].forEach(btn => btn.addEventListener("click", closeDrawer));

updateCurrentTime();
setInterval(updateCurrentTime, 1000);
renderFavoriteSelect();
loadRegistrationState();
renderRegisteredTeams();
renderRegistrationHistory();
renderMatchHistory();
ensureDeviceTeamStillExists();
updateStreakModeStatus();
refreshView();
showVenuePage();
updateDrawerVenueGate();
renderAdminModeView();
venueSelectEl.value = selectedVenueId;
applyVenueGate();

window.FirebaseAppReady
  .then(async () => {
    firebaseReady = true;
    hasHydratedVenueState = false;
    await ensureFirebaseAuth();
    fetch("/api/public-config").then(r => r.json()).then(cfg => {
      if (cfg.gameDifficulty) {
        const s = loadSystemSettings();
        saveSystemSettings({ ...s, gameDifficulty: cfg.gameDifficulty });
        localStorage.setItem("pv-offline-speed", cfg.gameDifficulty);
      }
      if (cfg.locationCheckEnabled !== undefined) {
        state.locationCheckEnabled = cfg.locationCheckEnabled;
        checkFengchiaAccessible();
      }
      if (cfg.vapidPublicKey) {
        vapidPublicKey = cfg.vapidPublicKey;
      }
    }).catch(() => {});
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      window.FirebaseDB.ensureUserProfile(currentUser.uid).catch((error) => {
        console.error("ensureUserProfile failed:", error);
      });
    }
    syncUserTeamClaim();
    subscribeFirebaseVenue(selectedVenueId);
    runDailyAutoResetIfNeeded();
    setTimeout(async () => {
      if (!hasHydratedVenueState) {
        try {
          const data = await window.FirebaseDB.getVenueState(selectedVenueId);
          if (!hasHydratedVenueState) applyVenueStatePayload(data);
        } catch (_) {}
      }
    }, 3000);
  })
  .catch((error) => {
    console.error("Firebase init error:", error);
  });

setInterval(() => {
  if (currentPage !== "registration") {
    return;
  }
  if (!hasFirebase() || !firebaseReady) {
    renderRegisteredTeams();
    renderRegistrationHistory();
    renderMatchHistory();
  }
  checkLocationForRegistration();
  runDailyAutoResetIfNeeded();
}, 1 * 60 * 1000);
