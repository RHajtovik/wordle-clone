# Wordle Clone
A modern Wordle-style game built for the GoLinks 2025 Internship Challenge  
Created by **Ryan Hajtovik**

## Live Demo
Play it here: [https://play-wordle.rakun.company](https://play-wordle.rakun.company)

---

## Dual Server Architecture
This project uses a **dual-server architecture**, separating concerns for scalability and maintainability:

- **Frontend**:  
  - Deployed via [AWS Amplify](https://play-wordle.rakun.company)  
  - Built with React (Vite)  
  - Responsive and mobile-friendly UI  
  - Uses a virtual keyboard for touch support  
- **Backend**:  
  - Hosted on [Render](https://wordle-api.rakun.company)  
  - Built with Express.js  
  - Handles session-based game logic, word validation, and result tracking  
  - Supports cross-origin cookie sessions with full Safari compatibility

---

## Features

- **Fully responsive UI** — works on desktop and mobile devices
- **Cross-browser compatibility** — tested on Chrome and Safari (including iOS)
- **Session-based gameplay** — stateful tracking using secure, cross-domain cookies
- **Flipping tile animations** — reveals correct/incorrect guesses just like real Wordle
- **Win & loss screen support** — includes confetti on win and a game-over screen on loss
- **Backend word validation** — all guesses checked server-side (not hardcoded on frontend)
- **Debounced input** — prevents accidental double submissions (keyboard + button)
- **Cloud deployed** — separate domains with working CORS and cookie/session config

---
