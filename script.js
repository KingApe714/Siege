var modalBtn = document.querySelector('.modal-button');
var modalBg = document.querySelector('.modal-bg');

modalBtn.addEventListener('click', function() {
    modalBg.classList.add('bg-active');
})

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 700;

// global variables
const cellSize = 100;
const cellGap = 3;
const winningScore = 50;
let numResources = 300;
let enemiesInterval = 400;
let frame = 0;
let gameOver = false;
let score = 0;
let hue = 0;

const gameGrid = [];
const attackers = [];
const enemies = [];
const enemyCoordinates = [];
const projectiles = [];

//mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1
}
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
})
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
})

// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        ctx.strokeStyle = 'black'
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}
function createGrid(){
    for (let y = 0; y < canvas.height - cellSize; y += cellSize) {
        for (let x = 0; x < canvas.width; x +=  cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (cell of gameGrid) {
        cell.draw();
    }
    // gameGrid.forEach(cell => {
    //     cell.draw();
    // })
}

// projectiles
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();
        for (enemy of enemies) {
            if (enemy && projectiles[i] && collision(enemy, projectiles[i])) {
                enemy.health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }
        // enemies.forEach(enemy => {
        // })
        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

//attackers
const attacker1 = new Image();
attacker1.src = './images/wizard1.png';
class Attacker {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.attackerType = attackers[0];
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 34;
        this.spriteHeight = 34;
        this.minFrame = 0;
        this.maxFrame = 1;
    }
    draw(){
        ctx.drawImage(attacker1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
        ctx.fillStyle = 'gold';
        ctx.font = '20px DotGothic16';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30)
    }
    update(){
        if (this.x < canvas.width - (cellSize * 2)) {
            this.x += this.movement
        }
        if (frame % 10 === 0) {
            if (this.frameX < this.maxFrame) {
                this.frameX++
            } else {
                this.frameX = this.minFrame
            }
        }
        this.timer++;
        if (this.timer % 100 === 0) {
            projectiles.push(new Projectile(this.x + 70, this.y + 50))
        }
    }
}

function handleAttackers(){
    for (let i = 0; i < attackers.length; i++) {
        attackers[i].draw();
        attackers[i].update();
        for (enemy of enemies) {
            if (attackers[i] && collision(attackers[i], enemy)) {
                attackers[i].movement = 0;
                attackers[i].health -= 0.2;
            } else {
                attackers[i].movement = attackers[i].speed;
            }
            if (attackers[i] && attackers[i].health <= 0) {
                attackers.splice(i, 1);
                i--;
            }
        }
        // enemies.forEach(enemy => {
        // })
    }
}
// enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = './images/enemy1.png';
enemyTypes.push(enemy1);

class Enemy {
    constructor(yCoordinate) {
        this.x = canvas.width - 200;
        this.y = yCoordinate;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[0];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 1;
        this.spriteWidth = 34;
        this.spriteHeight = 34;
    }
    update(){
        if (frame % 10 === 0) {
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = this.minFrame;
            }
        }
    }
    draw(){
        ctx.drawImage(this.enemyType, this.frameX*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
        ctx.fillStyle = 'black';
        ctx.font = '30px DotGothic16';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}

function handleEnemies(){
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = Math.floor(enemies[i].maxHealth/3);
            numResources += gainedResources;
            score += gainedResources;
            const idx = enemyCoordinates.indexOf(enemies[i].y)
            enemyCoordinates.splice(idx, 1);
            enemies.splice(i, 1)
            i--;
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore) {
        let yCoordinate = Math.floor(Math.random() * ((canvas.height / 100) - 1)) * cellSize + cellGap;
        //ensure that the enemies don't appear on top of each other
        if (enemies.filter(enemy => enemy.y !== yCoordinate)) {
            enemies.push(new Enemy(yCoordinate));
            enemyCoordinates.push(yCoordinate);
        }
        if (enemiesInterval > 120) enemiesInterval -= 50;
    }
}

const castleWall = new Image();
castleWall.src = "./images/enemy_wall1.png";
class EnemyWall {
    constructor() {
        this.x = canvas.width - cellSize;
        this.y = 0;
        this.width = cellSize;
        this.height = canvas.height - cellSize;
        this.health = 500;
        this.maxHealth = this.health;
        this.wallWidth = 152;
        this.wallHeight = 912;
    }
    draw(){
        ctx.drawImage(castleWall, 0, 0, this.wallWidth, this.wallHeight, canvas.width - 100, 0, cellSize, canvas.height - cellSize)
        ctx.fillStyle = 'black';
        ctx.font = '25px DotGothic16';
        ctx.fillText('Wall:', canvas.width - 80, canvas.height - cellSize - 100);
        ctx.fillText(this.health, canvas.width - 80, canvas.height - cellSize - 50)
    }
}

let wall = new EnemyWall();
function handleWall() {
    wall.draw();
    for (p of projectiles) {
        if (collision(p, wall)) {
            wall.health -= p.power;
            score += p.power;
        }
    }
    // projectiles.forEach(p => {
    // })
}
// utilities
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '30px DotGothic16';
    ctx.fillText('Score: ' + score, canvas.width - 250, canvas.height - 65);
    ctx.fillText('Resources: ' + numResources, canvas.width - 250, canvas.height - 25);
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '90px DotGothic16';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (wall.health <= 0) {
        gameOver = true;
        ctx.fillStyle = 'black';
        ctx.font = '60px DotGothic16';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px DotGothic16'
        ctx.fillText('You win with ' + score + ' points!', 134, 340)
    }
}

canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY > canvas.height - cellSize) return;
    for (let i = 0; i < attackers.length; i++) {
        if (attackers[i].x === gridPositionX && attackers[i].y === gridPositionY) return;
    }
    let attackerCost = 100;
    if (numResources >= attackerCost) {
        attackers.push(new Attacker(gridPositionX, gridPositionY))
        numResources -= attackerCost;
    } else {
        //need to render a message to user letting them know they need more resources
    }
})

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'gray';
    ctx.fillRect(0,canvas.height-cellSize,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleAttackers();
    handleProjectiles();
    handleEnemies();
    handleWall();
    handleGameStatus();
    frame++;
    hue += 3;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(obj1, obj2) {
    if (!(obj1.x > obj2.x + obj2.width || obj1.x + obj1.width < obj2.x ||
        obj1.y > obj2.y + obj2.height || obj1.y + obj1.height < obj2.y)) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})