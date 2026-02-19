Original prompt: add a bit more spice to the app
use the image generation to add nice background as per the theme of the app
basic tic-tac-toe is predictable
search online for ideas to creatively change 1 or 2 parts of the game tactics to make it unpredictable take it to next level hard (not too much)

- Initialized web-game iteration log.
- Planned scope: add one themed generated background image + two light tactical twists.

- Generated themed background image: output/imagegen/agrabah-bg.png via imagegen CLI (gpt-image-1.5).
- Added tactical twist #1 (Sands Shift): each player can maintain max 3 marks; oldest mark auto-removes on a new placement.
- Added tactical twist #2 (Djinn Blessing): one random blessed tile grants an immediate extra turn when claimed.
- Added turn-cap draw fallback at 18 turns for Sands Shift rounds.
- Playwright client run completed; screenshots in output/web-game/shot-*.png.
- Additional scripted validation (PvP): blessed tile grants extra turn; X and O both capped at 3 marks after extended moves.
- TODO: optionally add a small in-UI tooltip/icon legend for the blessed tile symbol.
