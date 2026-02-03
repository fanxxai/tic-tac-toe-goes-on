const board = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const modeToggle = document.getElementById("mode");
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

let currentPlayer = "X";
let gameActive = true;
let boardState = Array(9).fill("");
let versusComputer = false;
let computerThinking = false;

const labels = {
  X: "Aladdin",
  O: "Genie",
};

function updateStatus(message) {
  statusEl.textContent = message;
}

function renderSymbol(player) {
  const symbolClass = player === "X" ? "symbol-x" : "symbol-o";
  return `<span class="symbol ${symbolClass}" aria-hidden="true"></span><span class="sr-only">${player}</span>`;
}

function checkWinner() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      return combo;
    }
  }
  return null;
}

function placeMove(index) {
  const cell = cells[index];
  boardState[index] = currentPlayer;
  cell.innerHTML = renderSymbol(currentPlayer);
  cell.classList.add("taken", currentPlayer.toLowerCase());
  cell.setAttribute("aria-label", `Cell ${index + 1} ${currentPlayer}`);

  const winningCombo = checkWinner();
  if (winningCombo) {
    gameActive = false;
    winningCombo.forEach((winIndex) => {
      cells[winIndex].classList.add("winner");
    });
    updateStatus(`${labels[currentPlayer]} wins the round!`);
    return true;
  }

  if (boardState.every(Boolean)) {
    gameActive = false;
    updateStatus("Draw! The magic balances out.");
    return true;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`${labels[currentPlayer]}'s turn`);
  return false;
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || boardState[index] || computerThinking) {
    return;
  }

  const roundEnded = placeMove(index);
  if (!roundEnded && versusComputer && currentPlayer === "O") {
    triggerComputerMove();
  }
}

function getAvailableMoves() {
  return boardState
    .map((value, index) => (value ? null : index))
    .filter((value) => value !== null);
}

function findWinningMove(player) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    const line = [boardState[a], boardState[b], boardState[c]];
    if (line.filter((value) => value === player).length === 2 && line.includes("")) {
      return combo[line.indexOf("")];
    }
  }
  return null;
}

function chooseComputerMove() {
  const winMove = findWinningMove("O");
  if (winMove !== null) return winMove;

  const blockMove = findWinningMove("X");
  if (blockMove !== null) return blockMove;

  if (!boardState[4]) return 4;

  const corners = [0, 2, 6, 8].filter((idx) => !boardState[idx]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  const open = getAvailableMoves();
  return open[Math.floor(Math.random() * open.length)];
}

function triggerComputerMove() {
  computerThinking = true;
  board.classList.add("locked");
  updateStatus("Genie is choosing a move...");

  window.setTimeout(() => {
    if (!gameActive) return;
    const move = chooseComputerMove();
    const roundEnded = placeMove(move);
    computerThinking = false;
    board.classList.remove("locked");

    if (!roundEnded && gameActive && versusComputer) {
      updateStatus(`${labels[currentPlayer]}'s turn`);
    }
  }, 450);
}

function resetGame() {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  computerThinking = false;
  board.classList.remove("locked");

  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("taken", "x", "o", "winner");
    cell.setAttribute("aria-label", `Cell ${Number(cell.dataset.index) + 1}`);
  });

  updateStatus("Player X begins");
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);
modeToggle.addEventListener("change", (event) => {
  versusComputer = event.target.checked;
  resetGame();
});

updateStatus("Player X begins");
