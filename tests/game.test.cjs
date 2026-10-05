const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const listeners = {};
let alerts = 0;
let timers = new Set();
let nextTimer = 0;
function element() {
    return {style: {}, children: [], textContent: '', clientWidth: 1200, clientHeight: 600,
        addEventListener(name, handler) { listeners[name] = handler; },
        appendChild(child) { this.children.push(child); },
        querySelectorAll() { return []; }};
}
const elements = {startGame: element(), gameAera: element(), actScore: element()};
const context = vm.createContext({document: {
    getElementsByClassName(name) { return [elements[name]]; },
    createElement: element,
    addEventListener(name, handler) { listeners[name] = handler; }
}, setInterval() { const id = ++nextTimer; timers.add(id); return id; },
clearInterval(id) { timers.delete(id); }, alert() { alerts++; }});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '..', 'index.js'), 'utf8'), context);
const game = context.snake;
// Rendering is covered separately in the browser; these checks isolate game rules.
game.render = function () { this.dom.actScore.textContent = String(this.score); };
function setup(parts, apples = [], direction = 'right') {
    game.init();
    game.segments = parts;
    game.apples = apples;
    game.currentDiret = game.nextDirection = direction;
}
function key(value) { listeners.keydown({key: value, preventDefault() {}}); }
setup([{x: 29, y: 5}, {x: 28, y: 5}]);
game.tick(); assert.equal(game.running, false); assert.equal(timers.size, 0);
const stopped = JSON.stringify(game.segments);
key('ArrowDown'); game.tick(); assert.equal(JSON.stringify(game.segments), stopped);
for (const [head, direction] of [[{x:0,y:5},'left'], [{x:5,y:0},'up'], [{x:5,y:14},'down']]) {
    setup([head], [], direction); game.tick(); assert.equal(game.running, false);
}
setup([{x: 5, y: 5}, {x: 4, y: 5}, {x: 3, y: 5}]);
key('ArrowUp'); key('ArrowLeft'); game.tick();
assert.equal(game.currentDiret, 'up'); assert.equal(game.segments[0].x, 5); assert.equal(game.segments[0].y, 4);
setup([{x: 5, y: 5}, {x: 4, y: 5}]); key('ArrowLeft'); assert.equal(game.nextDirection, 'right');
setup([{x: 5, y: 5}, {x: 4, y: 5}], [{x: 6, y: 5}, {x: 6, y: 8}]);
game.tick(); assert.equal(game.score, 1); assert.equal(game.segments.length, 3);
assert.ok(game.apples.some(a => a.x === 6 && a.y === 8));
setup([{x: 2, y: 2}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 3, y: 2}]);
game.tick(); assert.equal(game.running, true); // Moving into the vacated tail is legal.
setup([{x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 1}, {x: 2, y: 1}]);
game.tick(); assert.equal(game.running, false);
setup([{x: 5, y: 5}, {x: 4, y: 5}]);
game.generate(100); assert.equal(game.apples.length, 2);
assert.equal(new Set(game.apples.map(a => `${a.x},${a.y}`)).size, 2);
assert.ok(game.apples.every(a => !game.segments.some(s => s.x === a.x && s.y === a.y)));
game.columns = 2; game.rows = 1; game.segments = [{x:0,y:0}]; game.apples = [{x:1,y:0}];
game.tick(); assert.equal(game.running, false); assert.equal(game.score, 1);
game.init(); game.init(); assert.equal(timers.size, 1); assert.equal(game.score, 0); assert.equal(game.segments.length, 4);
assert.ok(alerts >= 6);
console.log('Passed: boundaries, stopped input, rapid turns, reverse input, eating, tail movement, self collision, food placement, full board, restart.');
