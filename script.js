class GameObject {
  #position = [];

  constructor() {
    this.#position = this.setRandomPosition();
  }

  position() {
    return [...this.#position];
  }
  getX() {
    return this.#position[0];
  }
  getY() {
    return this.#position[1];
  }
  setRandomPosition() {
    const x = Math.floor(Math.random() * 30) + 1;
    const y = Math.floor(Math.random() * 30) + 1;
    this.#position = [x, y];
    return [x, y];
  }
  setPosition(x, y) {
    this.#position = [x, y];
  }
}
class Food extends GameObject {
  constructor() {
    super();
  }
}
class Snake extends GameObject {
  #velocity = [0, 0];
  #body = [];

  constructor() {
    super();
    this.#body.push(this.position());
  }
  setVelocity(key) {
    if (key.key === "ArrowLeft" && this.#velocity[1] != 1)
      this.#velocity = [0, -1];
    if (key.key === "ArrowRight" && this.#velocity[1] != -1)
      this.#velocity = [0, 1];
    if (key.key === "ArrowUp" && this.#velocity[0] != 1)
      this.#velocity = [-1, 0];
    if (key.key === "ArrowDown" && this.#velocity[0] != -1)
      this.#velocity = [1, 0];
  }
  setInitialVelocity([vx, vy]) {
    this.#velocity = [vx, vy];
  }
  grow(coordinate) {
    this.#body.push(coordinate);
  }
  getBody() {
    return this.#body;
  }
  getX() {
    return this.#body[0][0];
  }
  getY() {
    return this.#body[0][1];
  }
  updatePosition() {
    const [x, y] = this.#body[0];
    const [vx, vy] = this.#velocity;
    for (let i = this.#body.length - 1; i > 0; i--) {
      this.#body[i] = this.#body[i - 1];
    }
    this.#body[0] = [x + vx, y + vy];
  }
}
let gameOver = false;
const playBoard = document.querySelector(".play-board");
const scoreEl = document.querySelector(".score");
const highScoreEl = document.querySelector(".high-score");

let moveLocked = false;
let food = new Food();
let snake = new Snake();
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;
const startBtn = document.getElementById("start-btn");
let intervalID = null;

renderScoreImages(score, scoreEl, "y");
renderScoreImages(highScore, highScoreEl);

function handleGameOver() {
  clearInterval(intervalID);
  alert("Game Over");
  location.reload();
}

function startGame() {
  intervalID = setInterval(() => {
    initGame();
  }, 125);
}

function getInitialVelocity() {
  const [x, y] = snake.getBody()[0];
  const centerX = 15;
  const centerY = 15;
  const dx = centerX - x;
  const dy = centerY - y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return [dx > 0 ? 1 : -1, 0];
  } else {
    return [0, dy > 0 ? 1 : -1];
  }
}

function renderScoreImages(scoreValue, targetElement, variant = "") {
  const scoreStr = scoreValue.toString().padStart(2, "0");
  targetElement.innerHTML = "";

  for (let digit of scoreStr) {
    const img = document.createElement("img");
    img.src = `assets/${digit}${variant}.png`;
    img.alt = digit;
    img.height = 30;
    targetElement.appendChild(img);
  }
}
const initGame = () => {
  if (gameOver) return;

  moveLocked = false;
  let htmlMarkup = `<div class="food" style="grid-area: ${food.getX()} / ${food.getY()}"></div>`;
  if (snake.getX() === food.getX() && snake.getY() === food.getY()) {
    snake.grow([food.getX(), food.getY()]);
    do {
      food.setRandomPosition();
    } while (
      snake
        .getBody()
        .some(
          (segment) => segment[0] === food.getX() && segment[1] === food.getY()
        )
    );
    score++;
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    renderScoreImages(score, scoreEl, "y");
    renderScoreImages(highScore, highScoreEl);
  }
  snake.updatePosition();

  if (
    snake.getX() <= 0 ||
    snake.getX() > 60 ||
    snake.getY() <= 0 ||
    snake.getY() > 60
  ) {
    gameOver = true;
    handleGameOver();
    return;
  }
  for (let i = 0; i < snake.getBody().length; i++) {
    htmlMarkup += `<div class="snake body" style="grid-area: ${
      snake.getBody()[i][0]
    } / ${snake.getBody()[i][1]}"></div>`;
    if (
      i !== 0 &&
      snake.getBody()[0][1] === snake.getBody()[i][1] &&
      snake.getBody()[0][0] === snake.getBody()[i][0]
    ) {
      gameOver = true;
      handleGameOver();
      return;
    }
  }
  playBoard.innerHTML = htmlMarkup;
};
// const intervalID = setInterval(() => {
//   initGame();
// }, 125);

document.addEventListener("keydown", (e) => {
  if (!intervalID && (e.code === "Space" || e.code === "Enter")) {
    // Start the game if it's not running
    startBtn.style.display = "none"; // hide button
    moveLocked = false;
    const [vx, vy] = getInitialVelocity();
    snake.setInitialVelocity([vx, vy]);
    startGame();
  }

  if (moveLocked) return; // already moving
  snake.setVelocity(e);
  moveLocked = true;
});
