# Aladdin Tic-Tac-Toe

A jewel-box Tic-Tac-Toe experience set under Agrabah skies. Crafted with a storybook UI, dynamic match flow, and tiny audio cues, this is a modern single‑page game that feels equal parts playful and polished.

## Highlights
- Cinematic start screen and match summary flow
- CPU opponent with `Easy` and `Smart` difficulty
- Auto-advancing rounds with pause control
- Live score tracking + round history
- Subtle SFX + optional ambient music (Web Audio API)
- Accessible semantic buttons and ARIA labels

## Play
1. Open `index.html` in any modern browser.
2. Choose a mode: `Vs Genie (CPU)` or `2 Players`.
3. First to align three symbols wins the round.

## Controls
- `Restart Round` resets the current round
- `Reset Match` clears scores and history
- `End Match` opens the match summary
- `Next Round` advances immediately when a round ends
- `Pause Auto` stops auto-advance between rounds
- `CPU Difficulty` sets the opponent strength
- `Music` / `SFX` toggles audio

## Tech
- HTML + CSS + vanilla JS
- Web Audio API for procedural music and SFX
- Zero build step, zero dependencies

## Project Structure
- `index.html` — layout and UI structure
- `style.css` — visuals, animation, and theme
- `script.js` — game logic, audio, and state

## Design Notes
The interface blends ornamental typography with a high-contrast game surface to keep play clear and fast. Animations emphasize momentum (wins, CPU turns, overlays) without slowing the game loop.

## License
MIT
