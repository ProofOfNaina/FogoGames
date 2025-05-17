 const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score');
  const gameOverOverlay = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  const startOverlay = document.getElementById('startOverlay');

  const WIDTH = 500, HEIGHT = 540;
  const GRID_SIZE = 4;
  const TILE_SIZE = 110;
  const MARGIN = 12;

  const ROLE_MAP = {
    2: "Verified", 4: "Fire Starter", 8: "Smoke", 16: "Spark",
    32: "Ember", 64: "Chef", 128: "fOG", 256: "Gigablaze"
  };

  const COLOR_MAP = {
    0: '#cdc1b4', 2: '#90ee90', 4: '#ff8800', 8: '#d965ff',
    16: '#c80000', 32: '#964b00', 64: '#a020f0',
    128: '#00ffff', 256: '#ffff00'
  };

  let grid = [];
  let score = 0;
  let gameOver = false;

  function initializeGrid() {
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    score = 0;
    gameOver = false;
    spawnTile();
    spawnTile();
    drawGrid();
  }

  function spawnTile() {
    let empty = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length === 0) return;
    let [i, j] = empty[Math.floor(Math.random() * empty.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
  }

  function drawGrid() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const yOffset = 30; // Adjusted for better vertical positioning

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const value = grid[i][j];
        ctx.fillStyle = COLOR_MAP[value] || '#3c3a32';
        ctx.fillRect(
          j * (TILE_SIZE + MARGIN) + MARGIN,
          i * (TILE_SIZE + MARGIN) + yOffset + MARGIN,
          TILE_SIZE,
          TILE_SIZE
        );

        if (value !== 0) {
          ctx.fillStyle = '#000';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            ROLE_MAP[value] || value,
            j * (TILE_SIZE + MARGIN) + MARGIN + TILE_SIZE / 2,
            i * (TILE_SIZE + MARGIN) + yOffset + MARGIN + TILE_SIZE / 2
          );
        }
      }
    }

    scoreDisplay.innerText = `Score: ${score}`;
  }

  function compress(row) {
    return [...row.filter(v => v !== 0), ...Array(GRID_SIZE - row.filter(v => v !== 0).length).fill(0)];
  }

  function merge(row) {
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        row[i + 1] = 0;
      }
    }
    return row;
  }

  function moveLeft() {
    let changed = false;
    for (let i = 0; i < GRID_SIZE; i++) {
      const original = [...grid[i]];
      let newRow = compress(grid[i]);
      newRow = compress(merge(newRow));
      grid[i] = newRow;
      if (grid[i].toString() !== original.toString()) changed = true;
    }
    return changed;
  }

  function moveRight() {
    reverse();
    const changed = moveLeft();
    reverse();
    return changed;
  }

  function moveUp() {
    transpose();
    const changed = moveLeft();
    transpose();
    return changed;
  }

  function moveDown() {
    transpose();
    const changed = moveRight();
    transpose();
    return changed;
  }

  function reverse() {
    for (let i = 0; i < GRID_SIZE; i++) grid[i].reverse();
  }

  function transpose() {
    grid = grid[0].map((_, i) => grid.map(row => row[i]));
  }

  function checkGameOver() {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0 ||
            (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) ||
            (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j])) {
          return false;
        }
      }
    }
    return true;
  }

  function handleKey(e) {
    if (gameOver) return;
    let moved = false;
    switch (e.key) {
      case 'ArrowLeft': moved = moveLeft(); break;
      case 'ArrowRight': moved = moveRight(); break;
      case 'ArrowUp': moved = moveUp(); break;
      case 'ArrowDown': moved = moveDown(); break;
    }
    if (moved) {
      spawnTile();
      drawGrid();
      if (checkGameOver()) {
        gameOver = true;
        finalScore.innerText = `Final Score: ${score}`;
        gameOverOverlay.style.display = 'block';
      }
    }
  }

  function restartGame() {
    gameOverOverlay.style.display = 'none';
    initializeGrid();
  }

  document.addEventListener('keydown', (e) => {
    if (startOverlay.style.display !== 'none') {
      startOverlay.style.display = 'none';
      initializeGrid();
    } else {
      handleKey(e);
    }
  });