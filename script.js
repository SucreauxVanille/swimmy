const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 基準サイズ（相対化用）
const baseWidth = 800;
const baseHeight = 600;

// キャンバスサイズを画面いっぱいに設定し、スケールを計算
let scale = 1;
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  scale = Math.min(canvas.width / baseWidth, canvas.height / baseHeight);
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
    this.x += this.dx * scale;
    this.y += this.dy * scale;

    this.x = Math.max(0, Math.min(canvas.width - this.width * scale, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height * scale, this.y));
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width * scale, this.height * scale);
  }

  get rect() {
    return { x: this.x, y: this.y, width: this.width * scale, height: this.height * scale };
  }
}

// 赤い魚クラス（スポーン用）
class RedFish {
  constructor(img) {
    this.img = img;
    this.width = 72;
    this.height = 36;
    this.x = canvas.width + 20;
    this.y = Math.random() * (canvas.height - this.height * scale);
    this.baseSpeed = 2 + Math.random() * 1.5;
  }

  update() {
    this.x -= this.baseSpeed * scale;
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width * scale, this.height * scale);
  }

  get rect() {
    return { x: this.x, y: this.y, width: this.width * scale, height: this.height * scale };
  }
}

// プレイヤー初期化
const player = new Player(playerImg);
const redFishes = [];
const followers = []; // スネーク型の仲間リスト
const maxFollowers = 30; // 最大追従数

// 赤い魚スポーン
let spawnTimer = 0;
const spawnInterval = 80;

function spawnRedFish() {
  redFishes.push(new RedFish(redImg));
}

// 追従仲間を追加
function addFollower() {
  if (followers.length >= maxFollowers) return;
  const last = followers.length ? followers[followers.length - 1] : player;
  followers.push({ x: last.x, y: last.y, width: 72, height: 36 });
}

// 当たり判定（長方形）
function checkCollision(a, b) {
  const ra = a.rect;
  const rb = b.rect;
  return ra.x < rb.x + rb.width &&
         ra.x + ra.width > rb.x &&
         ra.y < rb.y + rb.height &&
         ra.y + ra.height > rb.y;
}

// キーボード操作
const keys = {};
window.addEventListener("keydown", e => { keys[e.key] = true; });
window.addEventListener("keyup", e => { keys[e.key] = false; });

// タッチ操作（スマホ）
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const touch = e.touches[0];
  player.x = touch.clientX - (player.width * scale) / 2;
  player.y = touch.clientY - (player.height * scale) / 2;
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

    if (fish.x < -fish.width * scale) {
      redFishes.splice(i, 1);
      continue;
    }

    if (checkCollision(player, fish)) {
      redFishes.splice(i, 1);
      score++;
      scoreEl.textContent = `Score: ${score}`;
      addFollower(); // 追従仲間を追加
    }
  }

// スネーク型追従描画
for (let i = 0; i < followers.length; i++) {
  const target = i === 0 ? player : followers[i - 1];
  const follower = followers[i];

  // 線形補間で追従
  follower.x += (target.x - follower.x) * 0.2;
  follower.y += (target.y - follower.y) * 0.2;

  // 左右反転で描画
  ctx.save();
  ctx.translate(follower.x + follower.width * scale, follower.y);
  ctx.scale(-1, 1);
  ctx.drawImage(redImg, 0, 0, follower.width * scale, follower.height * scale);
  ctx.restore();
}

// プレイヤーを最後に描画
player.draw();


  // 赤い魚スポーン
  spawnTimer++;
  if (spawnTimer > spawnInterval) {
    spawnRedFish();
    spawnTimer = 0;
  }
}

// 画像ロード後に開始
playerImg.onload = () => {
  redImg.onload = () => {
    loop();
  };
};
