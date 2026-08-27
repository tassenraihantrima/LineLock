# LineLock

LineLock is a modern full-stack implementation of the classic **Dots and Boxes** strategy game. The project focuses on building a real-time multiplayer experience while following modern software engineering practices.

Players take turns drawing lines between adjacent dots. When a player completes the fourth side of a box, they claim that box and immediately earn another turn. Once every possible box has been claimed, the player with the highest score wins.

---

## Project Status

🚧 **Currently in active development**

**Phase 14 — Authentication & Database is complete.**

The project currently includes:

- A React and TypeScript frontend
- An Express and TypeScript backend
- Client-side routing using React Router
- Complete configurable local gameplay
- Typed Socket.IO client-server communication
- Online room creation and joining
- Unique six-character room codes
- Two-player online lobby synchronization
- Server-created online game state
- Server-generated edges and boxes
- Server-side move validation
- Server-controlled player turns
- Server-controlled edge ownership
- Server-side completed-box detection
- Server-controlled score updates
- Online extra-turn support
- Double-box completion support
- Real-time board synchronization
- Online winner and tie detection
- Host-controlled online match startup
- Online match restart support
- Rejection of invalid and out-of-turn moves
- Responsive and accessible online gameplay interfaces
- Temporary online disconnection recovery
- Private recovery-token player identity
- Thirty-second reconnection grace period
- Preserved room membership during temporary disconnects
- Preserved authoritative game state during temporary disconnects
- Automatic room recovery after Socket.IO reconnection
- Preserved player positions after reconnection
- Reconnection-aware lobby status
- Paused online gameplay while a player reconnects
- Automatic room cleanup after reconnection timeout
- PostgreSQL-backed persistent player accounts
- Prisma ORM database integration
- User registration and login
- Secure bcrypt password hashing
- JWT-based authentication
- HTTP-only authentication cookies
- Persistent authenticated sessions
- Authentication-aware React state
- Protected account and online multiplayer routes
- Authenticated Socket.IO connections
- Server-controlled multiplayer account identity
- Automatic use of account usernames in online rooms
- Prevention of one account occupying both room positions
- Account-bound room reconnection and recovery
- Secure logout with Socket.IO and recovery-state cleanup

Phase 15 will add player statistics, deployment, final documentation, and project polish.

---

## Features

### Gameplay

- Local two-player mode
- Real-time online multiplayer
- Multiple board sizes
- Automatic box detection
- Extra turns after completing a box
- Live score tracking
- Winner detection
- Game restart

### Online Multiplayer

- Private game rooms
- Six-character room codes
- Authenticated player identities
- Server-authoritative game state
- Server-side move validation
- Real-time board synchronization
- Temporary disconnection recovery
- Account-bound player recovery
- Reconnection grace period
- Automatic room cleanup

### Authentication

- Persistent player accounts
- User registration
- User login and logout
- PostgreSQL account storage
- bcrypt password hashing
- JWT authentication
- HTTP-only authentication cookies
- Persistent browser sessions
- Protected routes
- Authenticated Socket.IO connections

### Planned Features

- Match history
- Player statistics
- Leaderboards
- Rankings
- Production deployment
- Achievement system
- Spectator mode
- Sound effects
- Additional animations and interface polish

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- bcrypt
- JSON Web Tokens
- Cookie-based authentication

### Database

- PostgreSQL
- Prisma ORM
- Neon PostgreSQL

### Planned Deployment

- Vercel
- Render

---

## Project Structure

```text
linelock/
├── client/
│   └── src/
│       ├── auth/
│       ├── components/
│       ├── game/
│       ├── pages/
│       └── socket/
├── server/
│   ├── prisma/
│   └── src/
│       ├── auth/
│       ├── generated/
│       └── lib/
├── CODING_JOURNAL.md
├── package.json
├── README.md
└── LICENSE
```

### Directory Overview

| Directory | Purpose |
|---|---|
| `client/` | React frontend application |
| `client/src/auth/` | Frontend authentication state and API communication |
| `client/src/game/` | Shared client game models and rules |
| `client/src/pages/` | Application pages and routes |
| `client/src/socket/` | Typed Socket.IO client |
| `server/` | Express and Socket.IO backend |
| `server/prisma/` | Prisma database schema and migrations |
| `server/src/auth/` | Authentication and authorization logic |
| `server/src/lib/` | Shared backend utilities |
| `CODING_JOURNAL.md` | Development log documenting each phase |
| `README.md` | Project documentation |

---

## Local Development

### Requirements

- Node.js
- npm
- PostgreSQL database

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

Configure the required server environment variables in:

```text
server/.env
```

The backend requires a PostgreSQL database connection and authentication secret.

Apply the Prisma migrations:

```bash
cd server
npx prisma migrate deploy
cd ..
```

Run the project:

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## Authentication Architecture

LineLock uses persistent authenticated accounts for online multiplayer.

Passwords are hashed with bcrypt before being stored in PostgreSQL. After successful registration or login, the server creates a signed authentication token and stores it in an HTTP-only cookie.

The React application restores the authenticated session when the application loads.

Socket.IO also validates the authentication cookie during its connection handshake. This allows the server to associate each multiplayer connection with a persistent database user rather than trusting a player identity supplied by the browser.

Room recovery additionally verifies that the authenticated account owns the disconnected player position before restoring it.

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
- ✅ Phase 9 – Application Routing
- ✅ Phase 10 – Socket.IO Integration
- ✅ Phase 11 – Online Rooms
- ✅ Phase 12 – Server-Controlled Game State
- ✅ Phase 13 – Reconnection Handling
- ✅ Phase 14 – Authentication & Database
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