'use strict';

function SnakeInit() {
    this.dom = {
        btn: document.getElementsByClassName('startGame')[0],
        main: document.getElementsByClassName('gameAera')[0],
        actScore: document.getElementsByClassName('actScore')[0]
    };
    this.cellSize = 40;
    this.timer1 = null;
    this.running = false;
    this.score = 0;
    this.segments = [];
    this.apples = [];
    this.currentDiret = 'right';
    this.nextDirection = 'right';
    this.dom.actScore.textContent = '0';
    this.dom.btn.addEventListener('click', this.init.bind(this));
    this.bindKeyEvent();
}

SnakeInit.prototype.bindKeyEvent = function () {
    var self = this;
    var directions = {ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'};
    var opposite = {up: 'down', down: 'up', left: 'right', right: 'left'};
    document.addEventListener('keydown', function (event) {
        var direction = directions[event.key];
        if (!direction || !self.running) return;
        event.preventDefault();
        // Accept one turn per tick, so two quick keys cannot reverse the snake.
        if (self.nextDirection !== self.currentDiret || direction === opposite[self.currentDiret]) return;
        self.nextDirection = direction;
    });
};

SnakeInit.prototype.init = function () {
    clearInterval(this.timer1);
    this.columns = Math.floor(this.dom.main.clientWidth / this.cellSize);
    this.rows = Math.floor(this.dom.main.clientHeight / this.cellSize);
    this.score = 0;
    this.currentDiret = this.nextDirection = 'right';
    var x = Math.min(this.columns - 1, Math.max(3, Math.floor(this.columns / 3)));
    var y = Math.floor(this.rows / 2);
    this.segments = [];
    for (var i = 0; i < 4; i++) this.segments.push({x: x - i, y: y});
    this.apples = [];
    this.running = true;
    this.dom.btn.style.display = 'none';
    this.generate(Math.floor(Math.random() * 2) + 1);
    this.render();
    this.timer1 = setInterval(this.tick.bind(this), 600);
};

SnakeInit.prototype.tick = function () {
    if (!this.running) return;
    var offsets = {right: {x: 1, y: 0}, left: {x: -1, y: 0}, up: {x: 0, y: -1}, down: {x: 0, y: 1}};
    this.currentDiret = this.nextDirection;
    var offset = offsets[this.currentDiret];
    var head = {x: this.segments[0].x + offset.x, y: this.segments[0].y + offset.y};
    var appleIndex = this.apples.findIndex(function (apple) { return apple.x === head.x && apple.y === head.y; });
    // The tail vacates its cell unless food is eaten on this tick.
    var occupied = appleIndex < 0 ? this.segments.slice(0, -1) : this.segments;
    if (head.x < 0 || head.x >= this.columns || head.y < 0 || head.y >= this.rows ||
        occupied.some(function (part) { return part.x === head.x && part.y === head.y; })) {
        this.endGame(false);
        return;
    }
    this.segments.unshift(head);
    if (appleIndex >= 0) {
        this.apples.splice(appleIndex, 1);
        this.score++;
        this.generate(1);
    } else {
        this.segments.pop();
    }
    this.render();
    if (this.segments.length === this.columns * this.rows) this.endGame(true);
};

SnakeInit.prototype.generate = function (count) {
    var free = [];
    for (var y = 0; y < this.rows; y++) {
        for (var x = 0; x < this.columns; x++) {
            var occupied = this.segments.concat(this.apples).some(function (part) { return part.x === x && part.y === y; });
            if (!occupied) free.push({x: x, y: y});
        }
    }
    for (var i = 0; i < count && free.length && this.apples.length < 2; i++) {
        var index = Math.floor(Math.random() * free.length);
        this.apples.push(free.splice(index, 1)[0]);
    }
};

SnakeInit.prototype.render = function () {
    this.dom.main.querySelectorAll('#snakeBlock, .apple').forEach(function (element) { element.remove(); });
    var block = document.createElement('div');
    block.id = 'snakeBlock';
    var rotations = {right: 0, down: 90, left: 180, up: -90};
    var self = this;
    this.segments.forEach(function (part, index) {
        var element = document.createElement('div');
        if (index === 0) {
            element.id = 'snakeHead';
            element.style.transform = 'rotateZ(' + rotations[self.currentDiret] + 'deg)';
        } else element.className = 'snakeBody';
        element.style.left = part.x * self.cellSize + 'px';
        element.style.top = part.y * self.cellSize + 'px';
        block.appendChild(element);
    });
    this.dom.main.appendChild(block);
    this.apples.forEach(function (part) {
        var element = document.createElement('div');
        element.className = 'apple';
        element.style.left = part.x * self.cellSize + 'px';
        element.style.top = part.y * self.cellSize + 'px';
        self.dom.main.appendChild(element);
    });
    this.dom.actScore.textContent = String(this.score);
};

SnakeInit.prototype.endGame = function (won) {
    this.running = false;
    clearInterval(this.timer1);
    this.timer1 = null;
    this.dom.btn.style.display = '';
    alert((won ? 'You won!' : 'Game Over!') + ' Your Score Is: ' + this.score);
};

var snake = new SnakeInit();
