const board = document.getElementById("board");
const boardCard = document.querySelector(".board-card");
const statusEl = document.getElementById("status");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");
const roundTagEl = document.getElementById("roundTag");
const opponentLabelEl = document.getElementById("opponentLabel");
const legendOpponentEl = document.getElementById("legendOpponent");
const modeLabelEl = document.getElementById("modeLabel");

const roundOverlay = document.getElementById("roundOverlay");
const roundMessageEl = document.getElementById("roundMessage");
const roundResultEl = document.getElementById("roundResult");
const nextRoundBtn = document.getElementById("nextRound");
const pauseAutoBtn = document.getElementById("pauseAuto");

const restartRoundBtn = document.getElementById("restartRound");
const resetMatchBtn = document.getElementById("resetMatch");
const endMatchBtn = document.getElementById("endMatch");

const cpuDifficulty = document.getElementById("cpuDifficulty");
const musicToggle = document.getElementById("musicToggle");
const sfxToggle = document.getElementById("sfxToggle");

const startScreen = document.getElementById("startScreen");
const summaryScreen = document.getElementById("summaryScreen");
const summaryRoundsEl = document.getElementById("summaryRounds");
const summaryXEl = document.getElementById("summaryX");
const summaryOEl = document.getElementById("summaryO");
const summaryDrawsEl = document.getElementById("summaryDraws");
const summaryOpponentLabelEl = document.getElementById("summaryOpponentLabel");
const summaryTitleEl = document.getElementById("summaryTitle");
const historyListEl = document.getElementById("historyList");
const playAgainBtn = document.getElementById("playAgain");
const newMatchBtn = document.getElementById("newMatch");

const cells = Array.from(document.querySelectorAll(".cell"));

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const labels = {
  X: "Aladdin",
  O: "Genie",
};

const state = {
  matchActive: false,
  roundActive: false,
  currentPlayer: "X",
  boardState: Array(9).fill(""),
  scores: { X: 0, O: 0, draw: 0 },
  round: 1,
  history: [],
  mode: "cpu",
  difficulty: "smart",
  computerThinking: false,
  autoAdvanceTimer: null,
  autoAdvancePaused: false,
};

const audioState = {
  ctx: null,
  unlocked: false,
  musicOn: false,
  sfxOn: true,
  musicGain: null,
  musicOscillators: [],
  musicTimer: null,
};

function opponentName() {
  return state.mode === "cpu" ? "Genie" : "Player 2";
}

function updateStatus(message) {
  statusEl.textContent = message;
}

function updateScoreUI() {
  scoreXEl.textContent = state.scores.X;
  scoreOEl.textContent = state.scores.O;
  scoreDrawEl.textContent = state.scores.draw;
  roundTagEl.textContent = `Round ${state.round}`;
}

function updateLabels() {
  const opponent = opponentName();
  opponentLabelEl.textContent = opponent;
  legendOpponentEl.textContent = opponent;
  summaryOpponentLabelEl.textContent = `${opponent} (O)`;
  modeLabelEl.textContent = state.mode === "cpu" ? "Mode: Vs Genie (CPU)" : "Mode: 2 Players";
  labels.O = opponent;
}

function renderSymbol(player) {
  const symbolClass = player === "X" ? "symbol-x" : "symbol-o";
  return `<span class="symbol ${symbolClass}" aria-hidden="true"></span><span class="sr-only">${player}</span>`;
}

function checkWinner() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      state.boardState[a] &&
      state.boardState[a] === state.boardState[b] &&
      state.boardState[a] === state.boardState[c]
    ) {
      return combo;
    }
  }
  return null;
}

function clearBoard() {
  state.boardState = Array(9).fill("");
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("taken", "x", "o", "winner", "placed");
    cell.setAttribute("aria-label", `Cell ${Number(cell.dataset.index) + 1}`);
  });
}

function lockBoard(lock) {
  board.classList.toggle("locked", lock);
}

function startRound() {
  state.roundActive = true;
  state.currentPlayer = "X";
  state.computerThinking = false;
  boardCard.classList.remove("cpu-thinking");
  clearBoard();
  lockBoard(false);
  hideRoundOverlay();
  updateStatus(`${labels.X} begins`);
  updateScoreUI();
}

function celebrateBoard() {
  boardCard.classList.remove("celebrate");
  void boardCard.offsetWidth;
  boardCard.classList.add("celebrate");
}

function showRoundOverlay(title, message) {
  roundResultEl.textContent = title;
  roundMessageEl.textContent = message;
  roundOverlay.classList.add("show");
  roundOverlay.setAttribute("aria-hidden", "false");
}

function hideRoundOverlay() {
  roundOverlay.classList.remove("show");
  roundOverlay.setAttribute("aria-hidden", "true");
}

function scheduleAutoAdvance() {
  clearTimeout(state.autoAdvanceTimer);
  state.autoAdvancePaused = false;
  pauseAutoBtn.textContent = "Pause Auto";
  state.autoAdvanceTimer = window.setTimeout(() => {
    if (!state.autoAdvancePaused && state.matchActive) {
      nextRound();
    }
  }, 1500);
}

function stopAutoAdvance() {
  clearTimeout(state.autoAdvanceTimer);
  state.autoAdvanceTimer = null;
}

function recordHistory(result) {
  state.history.push({ round: state.round, result });
}

function endRound(result, winningCombo) {
  state.roundActive = false;
  lockBoard(true);
  stopAutoAdvance();

  if (winningCombo) {
    winningCombo.forEach((index) => cells[index].classList.add("winner"));
  }

  if (result === "draw") {
    state.scores.draw += 1;
    recordHistory("Draw");
    updateStatus("Draw! The magic balances out.");
    showRoundOverlay("Draw", "The magic balances out.");
    playSfx("draw");
  } else {
    state.scores[result] += 1;
    recordHistory(result);
    updateStatus(`${labels[result]} wins the round!`);
    showRoundOverlay("Victory", `${labels[result]} takes the round!`);
    playSfx("win");
  }

  celebrateBoard();
  updateScoreUI();
  scheduleAutoAdvance();
}

function placeMove(index) {
  const cell = cells[index];
  state.boardState[index] = state.currentPlayer;
  cell.innerHTML = renderSymbol(state.currentPlayer);
  cell.classList.add("taken", state.currentPlayer.toLowerCase(), "placed");
  cell.setAttribute("aria-label", `Cell ${index + 1} ${state.currentPlayer}`);
  window.setTimeout(() => cell.classList.remove("placed"), 350);
  playSfx("move");

  const winningCombo = checkWinner();
  if (winningCombo) {
    endRound(state.currentPlayer, winningCombo);
    return true;
  }

  if (state.boardState.every(Boolean)) {
    endRound("draw", null);
    return true;
  }

  state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
  updateStatus(`${labels[state.currentPlayer]}'s turn`);
  return false;
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!state.matchActive || !state.roundActive || state.boardState[index] || state.computerThinking) {
    return;
  }

  const roundEnded = placeMove(index);
  if (!roundEnded && state.mode === "cpu" && state.currentPlayer === "O") {
    triggerComputerMove();
  }
}

function getAvailableMoves() {
  return state.boardState
    .map((value, index) => (value ? null : index))
    .filter((value) => value !== null);
}

function findWinningMove(player) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    const line = [state.boardState[a], state.boardState[b], state.boardState[c]];
    if (line.filter((value) => value === player).length === 2 && line.includes("")) {
      return combo[line.indexOf("")];
    }
  }
  return null;
}

function chooseComputerMove() {
  if (state.difficulty === "easy") {
    const open = getAvailableMoves();
    return open[Math.floor(Math.random() * open.length)];
  }

  const winMove = findWinningMove("O");
  if (winMove !== null) return winMove;

  const blockMove = findWinningMove("X");
  if (blockMove !== null) return blockMove;

  if (!state.boardState[4]) return 4;

  const corners = [0, 2, 6, 8].filter((idx) => !state.boardState[idx]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  const open = getAvailableMoves();
  return open[Math.floor(Math.random() * open.length)];
}

function triggerComputerMove() {
  state.computerThinking = true;
  lockBoard(true);
  boardCard.classList.add("cpu-thinking");
  updateStatus(`${labels.O} is thinking...`);

  window.setTimeout(() => {
    if (!state.roundActive || state.currentPlayer !== "O") {
      state.computerThinking = false;
      boardCard.classList.remove("cpu-thinking");
      lockBoard(!state.roundActive);
      return;
    }

    const move = chooseComputerMove();
    const roundEnded = placeMove(move);
    state.computerThinking = false;
    boardCard.classList.remove("cpu-thinking");

    if (roundEnded) {
      lockBoard(true);
      return;
    }

    lockBoard(false);
    if (state.mode === "cpu") {
      updateStatus(`${labels[state.currentPlayer]}'s turn`);
    }
  }, 600);
}

function nextRound() {
  if (!state.matchActive) return;
  stopAutoAdvance();
  state.round += 1;
  startRound();
}

function restartRound() {
  if (!state.matchActive) return;
  stopAutoAdvance();
  startRound();
}

function resetMatch() {
  if (!state.matchActive) return;
  stopAutoAdvance();
  state.scores = { X: 0, O: 0, draw: 0 };
  state.history = [];
  state.round = 1;
  startRound();
}

function showSummary() {
  state.matchActive = false;
  state.roundActive = false;
  state.computerThinking = false;
  stopAutoAdvance();
  lockBoard(true);
  hideRoundOverlay();
  boardCard.classList.remove("cpu-thinking");
  startScreen.hidden = true;

  summaryRoundsEl.textContent = state.history.length;
  summaryXEl.textContent = state.scores.X;
  summaryOEl.textContent = state.scores.O;
  summaryDrawsEl.textContent = state.scores.draw;
  summaryTitleEl.textContent = state.mode === "cpu" ? "Match Summary - Vs Genie" : "Match Summary - 2 Players";

  historyListEl.innerHTML = "";
  if (state.history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No rounds played yet.";
    historyListEl.appendChild(emptyItem);
  } else {
    state.history.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = `R${entry.round}: ${entry.result}`;
      historyListEl.appendChild(item);
    });
  }

  summaryScreen.hidden = false;
}

function hideSummary() {
  summaryScreen.hidden = true;
}

function startMatch(mode) {
  stopAutoAdvance();
  state.mode = mode;
  state.matchActive = true;
  state.scores = { X: 0, O: 0, draw: 0 };
  state.history = [];
  state.round = 1;
  state.difficulty = cpuDifficulty.value;
  updateLabels();
  cpuDifficulty.disabled = state.mode !== "cpu";
  startScreen.classList.remove("show");
  startScreen.hidden = true;
  hideSummary();
  startRound();
}

function toggleAutoAdvance() {
  if (state.autoAdvancePaused) {
    state.autoAdvancePaused = false;
    pauseAutoBtn.textContent = "Pause Auto";
    scheduleAutoAdvance();
  } else {
    state.autoAdvancePaused = true;
    pauseAutoBtn.textContent = "Auto Paused";
    stopAutoAdvance();
  }
}

function unlockAudio() {
  if (audioState.unlocked) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioState.ctx = new AudioContext();
  audioState.unlocked = true;
}

function playTone({ frequency, duration = 0.12, volume = 0.12, type = "sine" }) {
  if (!audioState.sfxOn) return;
  unlockAudio();
  if (!audioState.ctx) return;
  const ctx = audioState.ctx;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

function playSfx(type) {
  if (!audioState.sfxOn) return;
  if (type === "move") {
    playTone({ frequency: 520, duration: 0.08, volume: 0.12, type: "triangle" });
  }
  if (type === "click") {
    playTone({ frequency: 680, duration: 0.05, volume: 0.08, type: "sine" });
  }
  if (type === "win") {
    playTone({ frequency: 620, duration: 0.12, volume: 0.12, type: "triangle" });
    window.setTimeout(() => playTone({ frequency: 780, duration: 0.12, volume: 0.12 }), 120);
    window.setTimeout(() => playTone({ frequency: 940, duration: 0.12, volume: 0.12 }), 240);
  }
  if (type === "draw") {
    playTone({ frequency: 260, duration: 0.25, volume: 0.1, type: "sine" });
  }
}

function startMusic() {
  if (!audioState.musicOn) return;
  unlockAudio();
  if (!audioState.ctx || audioState.musicTimer) return;

  const ctx = audioState.ctx;
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  gain.connect(ctx.destination);
  audioState.musicGain = gain;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  osc1.type = "sine";
  osc2.type = "triangle";
  osc3.type = "sine";
  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(gain);
  osc1.start();
  osc2.start();
  osc3.start();
  audioState.musicOscillators = [osc1, osc2, osc3];

  const progression = [
    [220, 277, 330],
    [196, 247, 294],
    [174, 220, 262],
    [196, 247, 294],
  ];
  let step = 0;
  const setChord = () => {
    const chord = progression[step];
    osc1.frequency.setTargetAtTime(chord[0], ctx.currentTime, 0.2);
    osc2.frequency.setTargetAtTime(chord[1], ctx.currentTime, 0.2);
    osc3.frequency.setTargetAtTime(chord[2], ctx.currentTime, 0.2);
    step = (step + 1) % progression.length;
  };
  setChord();
  audioState.musicTimer = window.setInterval(setChord, 2000);
}

function stopMusic() {
  if (!audioState.musicTimer) return;
  window.clearInterval(audioState.musicTimer);
  audioState.musicTimer = null;
  audioState.musicOscillators.forEach((osc) => osc.stop());
  audioState.musicOscillators = [];
  if (audioState.musicGain) {
    audioState.musicGain.disconnect();
    audioState.musicGain = null;
  }
}

function handleStartScreenClick(event) {
  const button = event.target.closest("button[data-mode]");
  if (!button) return;
  playSfx("click");
  startMatch(button.dataset.mode === "cpu" ? "cpu" : "pvp");
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
restartRoundBtn.addEventListener("click", () => {
  playSfx("click");
  restartRound();
});
resetMatchBtn.addEventListener("click", () => {
  playSfx("click");
  resetMatch();
});
endMatchBtn.addEventListener("click", () => {
  playSfx("click");
  showSummary();
});
nextRoundBtn.addEventListener("click", () => {
  playSfx("click");
  nextRound();
});
pauseAutoBtn.addEventListener("click", () => {
  playSfx("click");
  toggleAutoAdvance();
});
playAgainBtn.addEventListener("click", () => {
  playSfx("click");
  hideSummary();
  startMatch(state.mode);
});
newMatchBtn.addEventListener("click", () => {
  playSfx("click");
  hideSummary();
  startScreen.hidden = false;
  updateStatus("Choose a match to begin.");
});
startScreen.addEventListener("click", handleStartScreenClick);

cpuDifficulty.addEventListener("change", (event) => {
  state.difficulty = event.target.value;
  playSfx("click");
});

musicToggle.addEventListener("change", (event) => {
  audioState.musicOn = event.target.checked;
  if (audioState.musicOn) {
    startMusic();
  } else {
    stopMusic();
  }
  playSfx("click");
});

sfxToggle.addEventListener("change", (event) => {
  audioState.sfxOn = event.target.checked;
  playSfx("click");
});

document.body.addEventListener("pointerdown", () => {
  unlockAudio();
  if (audioState.musicOn) {
    startMusic();
  }
}, { once: true });

updateLabels();
updateScoreUI();
updateStatus("Choose a match to begin.");
startScreen.hidden = false;
summaryScreen.hidden = true;
