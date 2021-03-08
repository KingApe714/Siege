const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 800;

// global variables
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
let hue = 0;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

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
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
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
        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) 
            {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }
        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

const defender1 = new Image();
defender1.src = './images/wizard1.png';
class Defender {
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
        this.defenderType = defenders[0];
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 34;
        this.spriteHeight = 34;
        this.minFrame = 0;
        this.maxFrame = 1;
    }
    draw(){
        ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
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

function handleDefenders(){
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                defenders[i].movement = 0;
                defenders[i].health -= 0.2;
            } else {
                defenders[i].movement = defenders[i].speed;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

// Floating Messages
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.03) this.opacity -= 0.03
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px DotGothic16';
        ctx.fillText(this.value, this.x, this.y)
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
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
            floatingMessages.push(new floatingMessage('+' + gainedResources, enemies[i].x, enemies[i].y, 30, 'gold'))
            floatingMessages.push(new floatingMessage('+' + gainedResources, 770, 530, 30, 'gold'))
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y)
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1)
            i--;
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
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
    for (let i = 0; i < projectiles.length; i++) {
        if (collision(projectiles[i], wall)){
            wall.health -= projectiles[i].power;
            console.log(wall.health)
        }
    }
}
// utilities
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '30px DotGothic16';
    ctx.fillText('Score: ' + score, canvas.width - 250, canvas.height - 65);
    ctx.fillText('Resources: ' + numberOfResources, canvas.width - 250, canvas.height - 25);
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
    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY))
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new floatingMessage('need more resources', mouse.x, mouse.y, 20, 'blue'))
    }
})

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'gray';
    ctx.fillRect(0,canvas.height-cellSize,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleProjectiles();
    handleEnemies();
    handleWall();
    handleGameStatus();
    handleFloatingMessages();
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