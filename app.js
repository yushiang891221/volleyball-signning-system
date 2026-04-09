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
  matchHistory: [],
  currentAIndex: null,
  currentBIndex: null,
  nextChallengerIndex: 0,
  currentMatchRecorded: false
};

const WIN_SCORE = 25;
const MIN_LEAD = 2;
const STORAGE_KEY = "volleyball-registration";
const RESET_REGISTRATION_PASSWORD = "1234";
const VENUE_CORNER_A = { lat: 24.180408, lng: 120.649766 };
const VENUE_CORNER_B = { lat: 24.180168, lng: 120.650120 };

const scoreAEl = document.getElementById("score-a");
const scoreBEl = document.getElementById("score-b");
const statusEl = document.getElementById("status");
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
const resetBtn = document.getElementById("reset");
const gameSectionEl = document.getElementById("game-section");
const statusSectionEl = document.getElementById("status-section");
const actionSectionEl = document.getElementById("action-section");
const registerTeamBtn = document.getElementById("register-team");
const resetRegistrationBtn = document.getElementById("reset-registration");
const checkLocationBtn = document.getElementById("check-location");
const registrationMessageEl = document.getElementById("registration-message");
const locationMessageEl = document.getElementById("location-message");
const teamNameInputEl = document.getElementById("team-name");
const teamInputContainerEl = document.getElementById("team-inputs");
const registeredTeamsEl = document.getElementById("registered-teams");
const matchHistoryEl = document.getElementById("match-history");
const registrationPageEl = document.getElementById("registration-page");
const scorePageEl = document.getElementById("score-page");
const scorePageMessageEl = document.getElementById("score-page-message");
const goRegistrationBtn = document.getElementById("go-registration");
const goScoreBtn = document.getElementById("go-score");
let currentPage = "registration";
let isInVenue = false;

function isInsideVenueBox(lat, lng) {
  const minLat = Math.min(VENUE_CORNER_A.lat, VENUE_CORNER_B.lat);
  const maxLat = Math.max(VENUE_CORNER_A.lat, VENUE_CORNER_B.lat);
  const minLng = Math.min(VENUE_CORNER_A.lng, VENUE_CORNER_B.lng);
  const maxLng = Math.max(VENUE_CORNER_A.lng, VENUE_CORNER_B.lng);
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function applyVenueGate() {
  registerTeamBtn.disabled = !isInVenue;
}

function checkLocationForRegistration() {
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
      isInVenue = isInsideVenueBox(latitude, longitude);
      locationMessageEl.textContent = isInVenue
        ? "定位成功：位於球場範圍內，可報名。"
        : "定位成功：目前不在球場對角範圍內，無法報名。";
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
  if (state.registeredTeams.length < 2) {
    scorePageMessageEl.textContent = "請先到報名頁面完成兩隊報名。";
    return;
  }
  scorePageMessageEl.textContent = `目前對戰：${state.teamAName} vs ${state.teamBName}`;
}

function showPage(page) {
  const isRegistration = page === "registration";
  currentPage = page;
  registrationPageEl.classList.toggle("hidden", !isRegistration);
  scorePageEl.classList.toggle("hidden", isRegistration);
  goRegistrationBtn.classList.toggle("active", isRegistration);
  goScoreBtn.classList.toggle("active", !isRegistration);
  updateScorePageMessage();
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

function saveRegistrationState() {
  const payload = {
    date: getTodayKey(),
    registeredTeams: state.registeredTeams,
    matchHistory: state.matchHistory,
    currentAIndex: state.currentAIndex,
    currentBIndex: state.currentBIndex,
    nextChallengerIndex: state.nextChallengerIndex
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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
      state.registeredTeams = [];
      state.matchHistory = [];
      registrationMessageEl.textContent = "新的一天已開始，已自動清空昨日報名資料。";
      renderRegisteredTeams();
      renderMatchHistory();
      return;
    }

    if (Array.isArray(data.registeredTeams)) {
      state.registeredTeams = data.registeredTeams;
      state.matchHistory = Array.isArray(data.matchHistory) ? data.matchHistory : [];
      state.currentAIndex = Number.isInteger(data.currentAIndex) ? data.currentAIndex : null;
      state.currentBIndex = Number.isInteger(data.currentBIndex) ? data.currentBIndex : null;
      state.nextChallengerIndex = Number.isInteger(data.nextChallengerIndex) ? data.nextChallengerIndex : 0;
      renderRegisteredTeams();
      renderMatchHistory();
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
    item.classList.toggle("active-match-team", isPlaying);
    registeredTeamsEl.appendChild(item);
  }
}

function renderMatchHistory() {
  matchHistoryEl.innerHTML = "";
  for (const match of state.matchHistory) {
    const item = document.createElement("li");
    item.textContent = `${match.teamA} ${match.scoreA} : ${match.scoreB} ${match.teamB}（勝：${match.winner}）`;
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

function clearAllRegistrationData() {
  state.registeredTeams = [];
  state.matchHistory = [];
  state.currentAIndex = null;
  state.currentBIndex = null;
  state.nextChallengerIndex = 0;
  state.currentMatchRecorded = false;
  state.teamAName = "隊伍 A";
  state.teamBName = "隊伍 B";
  state.teamAPlayers = [];
  state.teamBPlayers = [];
  state.scoreA = 0;
  state.scoreB = 0;
  state.serving = null;
  state.finished = false;

  renderPlayerList(teamAPlayersEl, []);
  renderPlayerList(teamBPlayersEl, []);
  renderRegisteredTeams();
  renderMatchHistory();
  clearRegistrationForm();

  gameSectionEl.classList.add("hidden");
  statusSectionEl.classList.add("hidden");
  actionSectionEl.classList.add("hidden");

  localStorage.removeItem(STORAGE_KEY);
  refreshView();
}

function resetRegistrationWithPassword() {
  const password = window.prompt("請輸入重置密碼：");
  if (password === null) {
    return;
  }

  if (password !== RESET_REGISTRATION_PASSWORD) {
    registrationMessageEl.textContent = "密碼錯誤，無法重置報名隊伍。";
    return;
  }

  clearAllRegistrationData();
  registrationMessageEl.textContent = "已完成重置，請重新報名。";
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
  actionSectionEl.classList.remove("hidden");

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

  state.nextChallengerIndex = 2;
  setTeamsByIndex(0, 1);
}

function advanceToNextMatch() {
  if (!state.finished) {
    return false;
  }

  if (state.nextChallengerIndex >= state.registeredTeams.length) {
    registrationMessageEl.textContent = "目前沒有下一隊，請先繼續報名。";
    return false;
  }

  const winnerIndex = state.scoreA > state.scoreB ? state.currentAIndex : state.currentBIndex;
  const challengerIndex = state.nextChallengerIndex;
  state.nextChallengerIndex += 1;
  registrationMessageEl.textContent = `${state.registeredTeams[winnerIndex].name} 留場，下一場開始。`;
  const started = setTeamsByIndex(winnerIndex, challengerIndex);
  if (started) {
    saveRegistrationState();
  }
  return started;
}

function registerTeam() {
  if (!isInVenue) {
    registrationMessageEl.textContent = "需在指定球場範圍內才能報名。";
    return;
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

  state.registeredTeams.push({
    name: teamName,
    players: teamPlayers
  });

  renderRegisteredTeams();
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
    startMatchWithQueue();
    saveRegistrationState();
    showPage("score");
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
  state.matchHistory.push({
    teamA: state.teamAName,
    teamB: state.teamBName,
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    winner
  });
  state.currentMatchRecorded = true;
  renderMatchHistory();
  saveRegistrationState();
}

function addPoint(team) {
  if (state.finished) {
    return;
  }

  if (team === "A") {
    state.scoreA += 1;
  } else {
    state.scoreB += 1;
  }
  state.serving = team;
  refreshView();
}

function removePoint(team) {
  if (team === "A") {
    state.scoreA = Math.max(0, state.scoreA - 1);
  } else {
    state.scoreB = Math.max(0, state.scoreB - 1);
  }
  refreshView();
}

function resetMatch() {
  recordFinishedMatchIfNeeded();

  if (advanceToNextMatch()) {
    return;
  }

  state.scoreA = 0;
  state.scoreB = 0;
  state.serving = null;
  state.finished = false;
  saveRegistrationState();
  refreshView();
}

aPlusBtn.addEventListener("click", () => addPoint("A"));
aMinusBtn.addEventListener("click", () => removePoint("A"));
bPlusBtn.addEventListener("click", () => addPoint("B"));
bMinusBtn.addEventListener("click", () => removePoint("B"));
resetBtn.addEventListener("click", resetMatch);
registerTeamBtn.addEventListener("click", registerTeam);
resetRegistrationBtn.addEventListener("click", resetRegistrationWithPassword);
checkLocationBtn.addEventListener("click", checkLocationForRegistration);
goRegistrationBtn.addEventListener("click", () => showPage("registration"));
goScoreBtn.addEventListener("click", () => showPage("score"));

updateCurrentTime();
setInterval(updateCurrentTime, 1000);
loadRegistrationState();
renderRegisteredTeams();
renderMatchHistory();
refreshView();
showPage("registration");
applyVenueGate();
checkLocationForRegistration();
setInterval(() => {
  if (currentPage !== "registration") {
    return;
  }
  renderRegisteredTeams();
  renderMatchHistory();
  checkLocationForRegistration();
}, 1 * 60 * 1000);
