const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 900;

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
const enemyPositions = [];
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
    gameGrid.forEach(cell => {
        cell.draw();
    })
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
        enemies.forEach(enemy => {
            if (enemy && projectiles[i] && collision(enemy, projectiles[i])) {
                enemy.health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        })
        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

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
        enemies.forEach(enemy => {
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
        })
    }
}
// enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = './images/enemy1.png';
enemyTypes.push(enemy1);

class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width - 200;
        this.y = verticalPosition;
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
            const findThisIndex = enemyPositions.indexOf(enemies[i].y)
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1)
            i--;
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 8) * cellSize + cellGap;
        //ensure that the enemies don't appear on top of each other
        if (enemies.filter(enemy => enemy.y !== verticalPosition)) {
            enemies.push(new Enemy(verticalPosition));
            enemyPositions.push(verticalPosition);
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
    projectiles.forEach(p => {
        if (collision(p, wall)) {
            wall.health -= p.power;
            score += p.power;
        }
    })
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
        ctx.fillStyle = 'blue';
        ctx.font = '30px DotGothic16';
        ctx.fillText('Not enough resources', 130, 300)
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

function collision(first, second) {
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y
            ) 
    ) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})