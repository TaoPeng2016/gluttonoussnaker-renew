# Gluttonous Snaker Renew

A browser Snake game with no build step or external dependencies.

## Play

Open `snake.html` in your browser. Click the play button, then use the arrow keys to turn. Each apple adds one point and one segment. Hitting a wall or your body ends the game. Click the play button again to restart.

## Check the game logic

With Node.js installed, run:

```sh
node --check index.js
node tests/game.test.cjs
```

The regression suite covers all four walls, input after game over, rapid turns, reverse turns, eating and growth, moving into a vacated tail, self collision, food placement, winning a full board, and restarting without duplicate timers. It uses a minimal DOM stub; browser layout is not covered.

## Repairs

- Movement, eating, and collision checks now run in a single tick.
- Wall bounds use the board dimensions and exclude cells outside the board.
- One turn is accepted per tick and reverse turns are rejected.
- Food only spawns in distinct, unoccupied cells; a full board ends with a win.
- Game over stops movement and offers restart; keyboard listeners are installed once.
- Score starts at zero and resets on restart.
- Fixed the score label, gave the play button an accessible name, and replaced the missing background image with a solid background.
