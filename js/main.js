import { CELL_VALUE, GAME_STATUS, TURN } from './constants.js';
import {
  getCellElementAtIdx,
  getCellElementList,
  getCellListElement,
  getCurrentTurnElement,
  getGameStatusElement,
  getReplayButtonElement,
} from './selectors.js';

import { checkGameStatus } from './utils.js';

console.log(checkGameStatus(['X', 'O', 'O', '', 'X', '', '', 'O', 'X']));

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let isGameEnded = false;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill('');

function toggleTurn() {
  //toggle turn
  currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;

  //update turn on DOM element
  updateCurrentTurn();
}

function updateGameStatus(newGameStatus) {
  gameStatus = newGameStatus;

  const gameStatusEl = getGameStatusElement();
  if (gameStatusEl) {
    gameStatusEl.textContent = newGameStatus;
  }
}

function showReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) {
    replayButton.classList.add('show');
  }
}

function hideReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) {
    replayButton.classList.remove('show');
  }
}

function highlightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error('Invalid win Positions');
  }

  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);
    if (cell) {
      cell.classList.add('win');
    }
  }
}

function handleCellClick(cell, index) {
  const isClicked = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING;
  if (isClicked || isEndGame) return;

  //set selected cell
  cell.classList.add(currentTurn);

  //update cellValues
  cellValues[index] = currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  //toggle turn
  toggleTurn();

  //check game status
  const game = checkGameStatus(cellValues);

  switch (game.status) {
    case GAME_STATUS.ENDED: {
      updateGameStatus(game.status);
      showReplayButton();
      break;
    }

    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN: {
      updateGameStatus(game.status);
      showReplayButton();
      highlightWinCells(game.winPositions);
      break;
    }

    default:
  }
}

function updateCurrentTurn(reset = false) {
  const currentTurnEl = getCurrentTurnElement();

  if (currentTurnEl) {
    currentTurnEl.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnEl.classList.add(reset || currentTurn);
  }
}

function resetGame() {
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => '');

  const cellElementList = getCellElementList();
  for (const cellElement of cellElementList) {
    cellElement.className = '';
  }
  updateGameStatus(GAME_STATUS.PLAYING);
  updateCurrentTurn(TURN.CROSS);

  hideReplayButton();
  highlightWinCells([]);
}

function initReplayButton() {
  const replayButton = getReplayButtonElement();

  if (replayButton) {
    replayButton.addEventListener('click', resetGame);
  }
}

function initCellElementList() {
  const cellElementList = getCellElementList();
  const cellListElement = getCellListElement();

  cellElementList.forEach((cell, index) => {
    cell.dataset.idx = index;
  });

  cellListElement.addEventListener('click', (event) => {
    const currentEl = event.target;

    if (!currentEl) return;

    if (event.target.tagName !== 'LI') return;

    const index = Number.parseInt(event.target.dataset.idx);

    handleCellClick(currentEl, index);
  });
}
/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */

(() => {
  //bind click event for all li elements
  //bind click event for replay button
  initCellElementList();

  initReplayButton();
})();
