const cells = document.querySelectorAll('.cell');
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
const difficultySelect = document.getElementById('difficulty');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;
let difficulty = 'medium';

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    board[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
};

const handleResultValidation = () => {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        messageElement.innerHTML = currentPlayer === 'X' ? 'Player X wins!' : 'Player O wins!';
        isGameActive = false;
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        messageElement.innerHTML = 'Game ended in a draw!';
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (currentPlayer === 'O') {
        aiMove();
    }
};

const aiMove = () => {
    switch (difficulty) {
        case 'very_easy':
            randomMove();
            break;
        case 'easy':
            heuristicMove();
            break;
        case 'medium':
            depthLimitedMinimax(1);
            break;
        case 'hard':
            depthLimitedMinimax(3);
            break;
        case 'impossible':
            depthLimitedMinimax(Infinity);
            break;
    }
    handleResultValidation();
};

const randomMove = () => {
    let availableCells = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableCells.push(i);
        }
    }
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const move = availableCells[randomIndex];
    handleCellPlayed(cells[move], move);
};

const heuristicMove = () => {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === 'O' && board[b] === 'O' && board[c] === '') {
            handleCellPlayed(cells[c], c);
            return;
        }
        if (board[a] === 'O' && board[b] === '' && board[c] === 'O') {
            handleCellPlayed(cells[b], b);
            return;
        }
        if (board[a] === '' && board[b] === 'O' && board[c] === 'O') {
            handleCellPlayed(cells[a], a);
            return;
        }
    }
    randomMove();
};

const depthLimitedMinimax = (limit) => {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false, limit);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    handleCellPlayed(cells[move], move);
};

const minimax = (board, depth, isMaximizing, limit) => {
    let scores = {
        'X': -1,
        'O': 1,
        'tie': 0
    };
    let result = checkWinner();
    if (result !== null) {
        return scores[result];
    }

    if (depth >= limit) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false, limit);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true, limit);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

const checkWinner = () => {
    let winner = null;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            winner = board[a];
        }
    }

    if (winner === null && !board.includes('')) {
        return 'tie';
    } else {
        return winner;
    }
};

const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !isGameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
};

const handleRestartGame = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    messageElement.innerHTML = '';
    cells.forEach(cell => cell.innerHTML = '');
};

const handleDifficultyChange = () => {
    difficulty = difficultySelect.value;
};

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', handleRestartGame);
difficultySelect.addEventListener('change', handleDifficultyChange);
