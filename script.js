const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// キャンバスサイズを画面サイズに合わせる
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// 画像ロード
const playerImg = new Image();
playerImg.src = "swimmy.gif";

const redImg = new Image();
redImg.src = "red.gif";

// スコア
let score = 0;
const scoreEl = document.getElementById("score");

// プレイヤークラス
class Player {
  constructor(img) {
    this.img = img;
    this.width = 72;
    this.height = 36;
    this.x = canvas.width / 4;
    this.y = canvas.height / 2;
    this.speed = 5;
    this.dx = 0;
    this.dy = 0;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    // 画面端制限
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

// 赤い魚クラス
class RedFish {
  constructor(img) {
    this.img = img;
    this.width = 72;
    this.height = 36;
    this.x = canvas.width + 20;
    this.y = Math.random() * (canvas.height - this.height);
    this.speed = 2 + Math.random() * 1.5; // 2〜3.5px/frame
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

// プレイヤー初期化
const player = new Player(playerImg);
const redFishes = [];

// 赤い魚スポーン
let spawnTimer = 0;
const spawnInterval = 80; // 80フレームごと

function spawnRedFish() {
  redFishes.push(new RedFish(redImg));
}

// 当たり判定（長方形）
function checkCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// キーボード操作
const keys = {};
window.addEventListener("keydown", e => { keys[e.key] = true; });
window.addEventListener("keyup", e => { keys[e.key] = false; });

// タッチ操作（スマホ）
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const touch = e.touches[0];
  player.x = touch.clientX - player.width / 2;
  player.y = touch.clientY - player.height / 2;
});

// 描画ループ
function loop() {
  requestAnimationFrame(loop);

  // 背景
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // プレイヤー移動
  player.dx = 0;
  player.dy = 0;
  if (keys["ArrowLeft"]) player.dx = -player.speed;
  if (keys["ArrowRight"]) player.dx = player.speed;
  if (keys["ArrowUp"]) player.dy = -player.speed;
  if (keys["ArrowDown"]) player.dy = player.speed;
  player.update();
  player.draw();

  // 赤い魚更新
  for (let i = redFishes.length - 1; i >= 0; i--) {
    const fish = redFishes[i];
    fish.update();
    fish.draw();

    // 画面外削除
    if (fish.x < -fish.width) {
      redFishes.splice(i, 1);
      continue;
    }

    // 当たり判定
    if (checkCollision(player, fish)) {
      redFishes.splice(i, 1);
      score++;
      scoreEl.textContent = `Score: ${score}`;
    }
  }

  // 赤い魚スポーン
  spawnTimer++;
  if (spawnTimer > spawnInterval) {
    spawnRedFish();
    spawnTimer = 0;
  }
}

// 画像読み込み後にゲーム開始
playerImg.onload = () => {
  redImg.onload = () => {
    loop();
  };
};
