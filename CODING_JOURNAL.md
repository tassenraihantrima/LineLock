# LineLock Coding Journal

This journal records the development process, technologies, challenges, and lessons learned while building LineLock.

---

## Phase 1 — Project Foundation

### What I did

- Created and cloned the public LineLock GitHub repository.
- Created a React and TypeScript frontend using Vite.
- Created a Node.js and TypeScript backend.
- Installed Express for backend routes and API handling.
- Installed Socket.IO to prepare for future real-time multiplayer communication.
- Installed CORS so the frontend and backend can communicate while running on different local ports.
- Installed dotenv to support private environment variables later.
- Configured TypeScript compilation for the backend.
- Added a backend health-check route.
- Added a basic Socket.IO connection listener.
- Added a simple LineLock landing page.
- Created root npm scripts that run the frontend and backend together.
- Added a project-wide `.gitignore`.
- Replaced the starter README with project-specific documentation.

### Technologies used

- React
- TypeScript
- Vite
- Node.js
- Express
- Socket.IO
- CORS
- dotenv
- tsx
- concurrently
- Git
- GitHub

### What I learned

- A full-stack application can keep its frontend and backend in separate folders inside one repository.
- Each part of the application can have its own `package.json`.
- The root `package.json` can coordinate commands across the entire project.
- Express handles regular HTTP routes and API requests.
- Socket.IO uses the HTTP server to support real-time communication.
- CORS permissions are required when the frontend and backend run on different ports.
- TypeScript configuration controls how backend source files are compiled.
- Development dependencies are tools required for building and running the project locally, while production dependencies are used by the application itself.
- A health-check endpoint provides a simple way to verify that the backend is available.

### Problems or challenges

- The project contains three `package.json` files, so it was important to understand the purpose of each one.
- The frontend and backend use different local ports.
- The backend required an HTTP server wrapper because Socket.IO will eventually share the same server as Express.
- Configuration files needed to be placed in the correct folders.

### How I verified the phase

- Ran the React frontend at `http://localhost:5173`.
- Ran the backend at `http://localhost:3001`.
- Opened the backend root route and received a successful JSON response.
- Opened `/api/health` and received an `"ok"` status.
- Ran both applications together using the root `npm run dev` command.
- Confirmed that the frontend landing page rendered successfully.

---

## Phase 2 — Game Models & Rules

### Goal

Create the TypeScript data structures and rule helpers that will support all future LineLock gameplay.

### Work Completed

- Created a dedicated `game` folder for game logic.
- Defined TypeScript models for players, edges, boxes, moves, and complete game state.
- Defined horizontal and vertical edge orientations.
- Created predictable IDs for edges and boxes.
- Created a helper that generates all board edges.
- Created a helper that generates every box and links it to its four surrounding edges.
- Created a helper that initializes two local players.
- Created a helper that returns a fresh game state.
- Added validation for board sizes smaller than two dots per side.
- Added move-validation rules.
- Added helpers for checking edge availability.
- Added helpers for finding boxes connected to an edge.
- Added helpers for detecting completed boxes.
- Added helpers for switching players.
- Added helpers for detecting game completion and determining the winner.
- Added a temporary Phase 2 summary screen to confirm the generated values.

### Game Model Decisions

Each edge has:

- A unique ID
- An orientation
- A row
- A column
- An optional player owner

Each box stores the IDs of its four surrounding edges. This will allow later phases to detect a completed box without depending on the visual layout.

The complete game state stores:

- Board size
- Both players
- Current player
- Every edge
- Every box
- Game status
- Winner
- Move count

### Board Mathematics

For a 5 × 5 dot board:

- Horizontal edges: 5 × 4 = 20
- Vertical edges: 4 × 5 = 20
- Total edges: 40
- Boxes: 4 × 4 = 16

### Technologies Practiced

- TypeScript union types
- TypeScript tuple types
- Type-only imports
- Pure helper functions
- Array generation
- Data modeling
- Input validation
- Separation of game logic from user-interface code

### Testing Completed

- Confirmed a 5 × 5 board generates 40 edges.
- Confirmed a 5 × 5 board generates 16 boxes.
- Confirmed two players are initialized with scores of zero.
- Confirmed Player 1 begins the game.
- Confirmed all edges and boxes begin unclaimed.
- Confirmed invalid board sizes throw an error.
- Confirmed the client and server run together.
- Confirmed the production build succeeds.
- Confirmed client linting succeeds.

