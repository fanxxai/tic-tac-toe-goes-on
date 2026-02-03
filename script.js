const board = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
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

const labels = {
  X: "Aladdin",
  O: "Genie",
};

function updateStatus(message) {
  statusEl.textContent = message;
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

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || boardState[index]) {
    return;
  }

  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("taken", currentPlayer.toLowerCase());

  const winningCombo = checkWinner();
  if (winningCombo) {
    gameActive = false;
    winningCombo.forEach((winIndex) => {
      cells[winIndex].classList.add("winner");
    });
    updateStatus(`${labels[currentPlayer]} wins the round!`);
    return;
  }

  if (boardState.every(Boolean)) {
    gameActive = false;
    updateStatus("Draw! The magic balances out.");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`${labels[currentPlayer]}'s turn`);
}

function resetGame() {
  boardState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "x", "o", "winner");
  });

  updateStatus("Player X begins");
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);

updateStatus("Player X begins");
