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
  currentMatchRecorded: false
};

const WIN_SCORE = 25;
const MIN_LEAD = 2;
const STORAGE_KEY = "volleyball-registration";
const ADMIN_PAGE_PASSWORD = "1234";
const DEFAULT_VENUE_ID = "fengchia";
const DEVICE_TEAM_MAP_KEY = "volleyball-device-team-map";
const DAILY_RESET_CHECK_KEY = "volleyball-last-daily-reset-check";
const VENUES = {
  fengchia: {
    name: "逢甲大學球場",
    type: "box",
    cornerA: { lat: 24.180507, lng: 120.649742 },
    cornerB: { lat: 24.180058, lng: 120.650191 }
  },
  home: {
    name: "測試用球場",
    type: "circle",
    center: { lat: 24.743353, lng: 121.088657 },
    radiusM: 80
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
const checkLocationBtn = document.getElementById("check-location");
const toggleLocationCheckBtn = document.getElementById("toggle-location-check");
const registrationMessageEl = document.getElementById("registration-message");
const locationMessageEl = document.getElementById("location-message");
const locationCheckStatusEl = document.getElementById("location-check-status");
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
const goRegistrationBtn = document.getElementById("go-registration");
const goScoreBtn = document.getElementById("go-score");
const goAdminBtn = document.getElementById("go-admin");
const adminLoginSectionEl = document.getElementById("admin-login-section");
const adminControlsSectionEl = document.getElementById("admin-controls-section");
const adminPasswordInputEl = document.getElementById("admin-password");
const adminUnlockBtn = document.getElementById("admin-unlock");
const adminAuthMessageEl = document.getElementById("admin-auth-message");
let currentPage = "registration";
let isInVenue = false;
let selectedVenueId = DEFAULT_VENUE_ID;
let allVenueStates = {};
let firebaseReady = false;
let unsubscribeVenueState = null;
let unsubscribeVenueMatches = null;
let isDailyResetRunning = false;
let adminUnlocked = false;
let deviceTeamMap = {};
try {
  const rawTeamMap = localStorage.getItem(DEVICE_TEAM_MAP_KEY);
  deviceTeamMap = rawTeamMap ? JSON.parse(rawTeamMap) : {};
} catch (_e) {
  deviceTeamMap = {};
}
let deviceTeamId = typeof deviceTeamMap[selectedVenueId] === "string" ? deviceTeamMap[selectedVenueId] : "";

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
    locationCheckEnabled: true,
    currentMatchRecorded: false
  };
}

function generateTeamId() {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${selectedVenueId}_${Date.now()}_${randomPart}`;
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
      name: team.name,
      players: [...team.players]
    })),
    registrationHistory: [...state.registrationHistory],
    matchHistory: state.matchHistory.map((match) => ({ ...match })),
    currentAIndex: state.currentAIndex,
    currentBIndex: state.currentBIndex,
    scorerIndex: state.scorerIndex,
    scorerTeamId: state.scorerTeamId,
    locationCheckEnabled: state.locationCheckEnabled,
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

function applyVenueGate() {
  const passLocationGate = !state.locationCheckEnabled || isInVenue;
  registerTeamBtn.disabled = !passLocationGate;
}

function updateLocationCheckStatus() {
  locationCheckStatusEl.textContent = state.locationCheckEnabled
    ? "定位檢查：已啟用"
    : "定位檢查：已停用";
}

function ensureDeviceTeamStillExists() {
  if (!deviceTeamId) {
    return;
  }
  const exists = state.registeredTeams.some((team) => team.teamId === deviceTeamId);
  if (!exists) {
    deviceTeamId = "";
    delete deviceTeamMap[selectedVenueId];
    persistDeviceTeamMap();
    syncUserTeamClaim();
  }
}

function canDeviceScore() {
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
  if (!state.locationCheckEnabled) {
    isInVenue = true;
    locationMessageEl.textContent = "定位檢查已停用，可直接報名。";
    applyVenueGate();
    return;
  }

  if (!navigator.geolocation) {
    isInVenue = false;
    locationMessageEl.textContent = "此裝置不支援定位，無法報名。";
    applyVenueGate();
    return;
  }

  locationMessageEl.textContent = "定位檢查中...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const venue = VENUES[selectedVenueId];
      isInVenue = isInsideSelectedVenue(latitude, longitude);
      locationMessageEl.textContent = isInVenue
        ? `定位成功：位於「${venue.name}」範圍內，可報名。`
        : `定位成功：目前不在「${venue.name}」範圍內，無法報名。`;
      applyVenueGate();
    },
    () => {
      isInVenue = false;
      locationMessageEl.textContent = "定位失敗或未授權，無法報名。";
      applyVenueGate();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
  );
}

function updateScorePageMessage() {
  const venue = VENUES[selectedVenueId];
  if (state.registeredTeams.length < 2) {
    scorePageMessageEl.textContent = `目前球場：${venue.name}，請先完成兩隊報名。`;
    return;
  }
  scorePageMessageEl.textContent = `目前球場：${venue.name}｜對戰：${state.teamAName} vs ${state.teamBName}`;
}

function showPage(page) {
  const isRegistration = page === "registration";
  const isScore = page === "score";
  const isAdmin = page === "admin";
  currentPage = page;
  registrationPageEl.classList.toggle("hidden", !isRegistration);
  scorePageEl.classList.toggle("hidden", !isScore);
  adminPageEl.classList.toggle("hidden", !isAdmin);
  goRegistrationBtn.classList.toggle("active", isRegistration);
  goScoreBtn.classList.toggle("active", isScore);
  goAdminBtn.classList.toggle("active", isAdmin);
  updateScorePageMessage();
}

function renderAdminModeView() {
  adminLoginSectionEl.classList.toggle("hidden", adminUnlocked);
  adminControlsSectionEl.classList.toggle("hidden", !adminUnlocked);
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
    locationCheckEnabled: state.locationCheckEnabled,
    currentMatchRecorded: state.currentMatchRecorded
  };
}

function applyVenueStatePayload(payload) {
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
  state.registeredTeams = Array.isArray(payload.registeredTeams) ? payload.registeredTeams : [];
  state.registeredTeams = state.registeredTeams.map((team) => ({
    teamId: team.teamId || generateTeamId(),
    name: team.name,
    players: Array.isArray(team.players) ? team.players : []
  }));
  state.registrationHistory = Array.isArray(payload.registrationHistory) ? payload.registrationHistory : [];
  state.currentAIndex = Number.isInteger(payload.currentAIndex) ? payload.currentAIndex : null;
  state.currentBIndex = Number.isInteger(payload.currentBIndex) ? payload.currentBIndex : null;
  state.scorerIndex = Number.isInteger(payload.scorerIndex) ? payload.scorerIndex : null;
  state.scorerTeamId = typeof payload.scorerTeamId === "string" ? payload.scorerTeamId : null;
  state.locationCheckEnabled =
    typeof payload.locationCheckEnabled === "boolean" ? payload.locationCheckEnabled : true;
  state.currentMatchRecorded = Boolean(payload.currentMatchRecorded);

  renderPlayerList(teamAPlayersEl, state.teamAPlayers);
  renderPlayerList(teamBPlayersEl, state.teamBPlayers);
  if (state.registeredTeams.length >= 2) {
    gameSectionEl.classList.remove("hidden");
    statusSectionEl.classList.remove("hidden");
  }
  renderRegisteredTeams();
  renderRegistrationHistory();
  ensureDeviceTeamStillExists();
  updateLocationCheckStatus();
  refreshView();
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

function saveRegistrationState() {
  if (hasFirebase() && firebaseReady) {
    window.FirebaseDB.saveVenueState(selectedVenueId, getStatePayloadForStorage()).catch((error) => {
      console.error("saveVenueState failed:", error);
    });
    return;
  }

  syncActiveVenueFromState();
  const payload = {
    date: getTodayKey(),
    selectedVenueId,
    venueStates: allVenueStates
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function saveRegistrationStateStrict() {
  if (hasFirebase() && firebaseReady) {
    await window.FirebaseDB.saveVenueState(selectedVenueId, getStatePayloadForStorage());
    return;
  }
  syncActiveVenueFromState();
  const payload = {
    date: getTodayKey(),
    selectedVenueId,
    venueStates: allVenueStates
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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
        const preservedLocationCheck =
          current && typeof current.locationCheckEnabled === "boolean"
            ? current.locationCheckEnabled
            : true;
        await window.FirebaseDB.saveVenueState(venueId, {
          ...createEmptyVenueState(),
          locationCheckEnabled: preservedLocationCheck,
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
        const preservedLocationCheck =
          previous && typeof previous.locationCheckEnabled === "boolean"
            ? previous.locationCheckEnabled
            : true;
        allVenueStates[venueId] = {
          ...createEmptyVenueState(),
          locationCheckEnabled: preservedLocationCheck,
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
  if (hasFirebase()) {
    return;
  }

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
      registrationMessageEl.textContent = "新的一天已開始，已自動清空昨日報名資料。";
      renderRegisteredTeams();
      renderMatchHistory();
      return;
    }

    allVenueStates = data.venueStates && typeof data.venueStates === "object" ? data.venueStates : {};
    selectedVenueId = typeof data.selectedVenueId === "string" && VENUES[data.selectedVenueId]
      ? data.selectedVenueId
      : DEFAULT_VENUE_ID;
    syncStateFromActiveVenue();
    renderRegisteredTeams();
    renderMatchHistory();
    if (state.registeredTeams.length === 1) {
      registrationMessageEl.textContent = "已載入今天報名資料，請報名第二隊。";
    } else if (state.registeredTeams.length >= 2) {
      registrationMessageEl.textContent = "已載入今天報名資料。";
      startMatchWithQueue();
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
    const item = document.createElement("li");
    item.textContent = `${team.name}（${team.players.join("、")}）`;
    const isPlaying = index === state.currentAIndex || index === state.currentBIndex;
    const isScorer = state.scorerTeamId && team.teamId === state.scorerTeamId;
    item.classList.toggle("active-match-team", isPlaying);
    item.classList.toggle("scorer-team", Boolean(isScorer));
    registeredTeamsEl.appendChild(item);
  }
}

function renderRegistrationHistory() {
  registrationHistoryEl.innerHTML = "";
  for (const name of state.registrationHistory) {
    const item = document.createElement("li");
    item.textContent = name;
    registrationHistoryEl.appendChild(item);
  }
}

function renderMatchHistory() {
  matchHistoryEl.innerHTML = "";
  for (let index = 0; index < state.matchHistory.length; index += 1) {
    const match = state.matchHistory[index];
    const item = document.createElement("li");
    item.textContent = `第 ${index + 1} 場：${match.teamA} ${match.scoreA} : ${match.scoreB} ${match.teamB}（勝：${match.winner}）`;
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
  const preservedLocationCheck = state.locationCheckEnabled;
  Object.assign(state, createEmptyVenueState());
  state.locationCheckEnabled = preservedLocationCheck;

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
  const confirmed = window.confirm(`確定要重置「${venueName}」的報名隊伍嗎？`);
  if (!confirmed) {
    return;
  }

  try {
    await clearAllRegistrationData();
    registrationMessageEl.textContent = `已完成「${venueName}」報名重置，請重新報名。`;
  } catch (error) {
    console.error("reset registration failed:", error);
    registrationMessageEl.textContent = `重置「${venueName}」報名失敗，請確認 Firebase 權限。`;
  }
}

async function toggleLocationCheckWithPassword() {
  if (!adminUnlocked) {
    adminAuthMessageEl.textContent = "請先進入管理員模式。";
    return;
  }

  const venueName = VENUES[selectedVenueId].name;
  const targetState = state.locationCheckEnabled ? "停用" : "啟用";
  const confirmed = window.confirm(`確定要在「${venueName}」${targetState}定位檢查嗎？`);
  if (!confirmed) {
    return;
  }

  state.locationCheckEnabled = !state.locationCheckEnabled;
  isInVenue = !state.locationCheckEnabled ? true : false;
  updateLocationCheckStatus();
  applyVenueGate();
  try {
    await saveRegistrationStateStrict();
  } catch (error) {
    console.error("toggle location check failed:", error);
    state.locationCheckEnabled = !state.locationCheckEnabled;
    isInVenue = !state.locationCheckEnabled ? true : false;
    updateLocationCheckStatus();
    applyVenueGate();
    registrationMessageEl.textContent = `切換「${venueName}」定位檢查失敗，請確認 Firebase 權限。`;
    return;
  }
  if (state.locationCheckEnabled) {
    checkLocationForRegistration();
    registrationMessageEl.textContent = "已啟用定位檢查。";
  } else {
    locationMessageEl.textContent = "定位檢查已停用，可直接報名。";
    registrationMessageEl.textContent = "已停用定位檢查。";
  }
}

async function resetMatchHistory() {
  if (!adminUnlocked) {
    adminAuthMessageEl.textContent = "請先進入管理員模式。";
    return;
  }

  const venueName = VENUES[selectedVenueId].name;
  const confirmed = window.confirm(`確定要清空「${venueName}」的比賽結果紀錄嗎？`);
  if (!confirmed) {
    return;
  }

  if (hasFirebase() && firebaseReady) {
    try {
      await window.FirebaseDB.clearMatches(selectedVenueId);
    } catch (error) {
      console.error("clearMatches failed:", error);
      registrationMessageEl.textContent = `清空「${venueName}」比賽結果失敗，請確認 Firebase 權限。`;
      return;
    }
  } else {
    state.matchHistory = [];
    renderMatchHistory();
  }

  registrationMessageEl.textContent = `已清空「${venueName}」比賽結果紀錄。`;
}

function unlockAdminPage() {
  const password = adminPasswordInputEl.value;
  if (password !== ADMIN_PAGE_PASSWORD) {
    adminAuthMessageEl.textContent = "密碼錯誤。";
    return;
  }
  adminUnlocked = true;
  adminPasswordInputEl.value = "";
  adminAuthMessageEl.textContent = "已進入管理員模式。";
  renderAdminModeView();
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

  const nextScorerIndex = challengerIndex + 1;
  state.scorerIndex = nextScorerIndex < state.registeredTeams.length ? nextScorerIndex : null;
  state.scorerTeamId = state.scorerIndex === null ? null : state.registeredTeams[state.scorerIndex].teamId;
  ensureDeviceTeamStillExists();
  registrationMessageEl.textContent = `${state.registeredTeams[winnerIndex].name} 留場，下一場開始。`;
  const started = setTeamsByIndex(winnerIndex, challengerIndex);
  if (started) {
    saveRegistrationState();
  }
  return started;
}

function registerTeam() {
  if (state.locationCheckEnabled && !isInVenue) {
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
    name: teamName,
    players: teamPlayers
  };
  state.registeredTeams.push(newTeam);
  state.registrationHistory.push(newTeam.name);
  bindDeviceTeamIfNeeded(newTeam.teamId);
  assignScorerIfMissing();

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

  registrationMessageEl.textContent = `已加入第 ${state.registeredTeams.length} 隊。`;
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
checkLocationBtn.addEventListener("click", checkLocationForRegistration);
toggleLocationCheckBtn.addEventListener("click", toggleLocationCheckWithPassword);
adminUnlockBtn.addEventListener("click", unlockAdminPage);
venueSelectEl.addEventListener("change", () => {
  if (hasFirebase() && firebaseReady) {
    selectedVenueId = venueSelectEl.value;
    loadDeviceTeamForVenue();
    syncUserTeamClaim();
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
  checkLocationForRegistration();
});
goRegistrationBtn.addEventListener("click", () => showPage("registration"));
goScoreBtn.addEventListener("click", () => showPage("score"));
goAdminBtn.addEventListener("click", () => showPage("admin"));

updateCurrentTime();
setInterval(updateCurrentTime, 1000);
loadRegistrationState();
renderRegisteredTeams();
renderRegistrationHistory();
renderMatchHistory();
ensureDeviceTeamStillExists();
updateLocationCheckStatus();
refreshView();
showPage("registration");
renderAdminModeView();
venueSelectEl.value = selectedVenueId;
applyVenueGate();
checkLocationForRegistration();

window.FirebaseAppReady
  .then(() => {
    firebaseReady = true;
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      window.FirebaseDB.ensureUserProfile(currentUser.uid).catch((error) => {
        console.error("ensureUserProfile failed:", error);
      });
    }
    syncUserTeamClaim();
    subscribeFirebaseVenue(selectedVenueId);
    runDailyAutoResetIfNeeded();
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
