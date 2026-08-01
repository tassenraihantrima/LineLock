# LineLock

LineLock is a modern full-stack implementation of the classic **Dots and Boxes** strategy game. The project focuses on building a real-time multiplayer experience while following modern software engineering practices.

Players take turns drawing lines between adjacent dots. When a player completes the fourth side of a box, they claim that box and immediately earn another turn. Once every possible box has been claimed, the player with the highest score wins.

---

## Project Status

🚧 **Currently in active development**

Phase 8 is complete.

The project currently includes:

- A React and TypeScript frontend
- An Express and TypeScript backend
- Socket.IO configuration for future multiplayer support
- Type-safe player, edge, box, move, and game-state models
- Configurable local player names
- Multiple local board sizes
- Dynamic board-generation utilities
- Interactive horizontal and vertical edges
- Immutable game-state updates
- Duplicate-move prevention
- Alternating player turns
- Player-specific edge and box ownership
- Completed-box detection
- Live score updates
- Double-box completion support
- Extra turns after completing a box
- Full-game completion detection
- Winner and tie calculation
- Final-result presentation
- Local match restart controls
- A reusable pre-game setup experience
- Live gameplay feedback
- Responsive match controls
- Accessible forms, controls, board elements, and result announcements
- Responsive desktop and mobile layouts

Application routing and separate local and online game pages will be implemented in Phase 9.

---

## Planned Features

### Gameplay

- Local two-player mode
- Real-time online multiplayer
- Multiple board sizes
- Automatic box detection
- Extra turns after completing a box
- Live score tracking
- Winner detection
- Game restart

### Online Features

- Private game rooms
- Room codes
- Server-side move validation
- Player reconnection
- Match history
- Leaderboards
- Player statistics
- Rankings

### Future Improvements

- User authentication
- Achievement system
- Spectator mode
- Sound effects
- Animations
- Responsive mobile interface

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- Socket.IO
- TypeScript

### Planned Infrastructure

- PostgreSQL
- Prisma ORM
- Authentication
- Vercel
- Render

---

## Project Structure

```text
linelock/
├── client/
│   └── src/
├── server/
│   └── src/
├── CODING_JOURNAL.md
├── package.json
├── README.md
└── LICENSE
```

### Directory Overview

| Directory | Purpose |
|-----------|---------|
| `client/` | React frontend application |
| `server/` | Express backend and Socket.IO server |
| `CODING_JOURNAL.md` | Development log documenting each phase |
| `package.json` | Root project scripts |
| `README.md` | Project documentation |

---

## Local Development

### Requirements

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/tassenraihantrima/LineLock.git
cd LineLock
```

Install dependencies:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Run the project:

```bash
npm run dev
```

This starts:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## Development Roadmap

- ✅ Phase 1 – Project Foundation
- ✅ Phase 2 – Game Models & Rules
- ✅ Phase 3 – Static Game Board
- ✅ Phase 4 – Clickable Edges
- ✅ Phase 5 – Player Turns
- ✅ Phase 6 – Box Detection
- ✅ Phase 7 – Game Completion
- ✅ Phase 8 – Local Game Polish
- ⬜ Phase 9 – Application Routing
- ⬜ Phase 10 – Socket.IO Integration
- ⬜ Phase 11 – Online Rooms
- ⬜ Phase 12 – Server-Controlled Game State
- ⬜ Phase 13 – Reconnection Handling
- ⬜ Phase 14 – Authentication & Database
- ⬜ Phase 15 – Statistics, Deployment & Documentation

---

## Development Journal

The development process for every phase is documented in **CODING_JOURNAL.md**, including:

- Features completed
- Technologies used
- Concepts learned
- Challenges encountered
- Testing performed
- Next development goals

---

## License

This project is licensed under the MIT License.