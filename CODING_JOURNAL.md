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

---

## Phase 3 — Static Game Board

### Goal

Use the TypeScript game models created in Phase 2 to render the first complete visual representation of a LineLock board.

### Work Completed

- Created a reusable `GameBoard` React component.
- Passed the complete game state into the board using typed props.
- Converted the game model into a visual CSS Grid.
- Rendered 25 board dots.
- Rendered 20 horizontal edge positions.
- Rendered 20 vertical edge positions.
- Rendered 16 empty box positions.
- Connected visual edges to their model IDs using data attributes.
- Connected visual boxes to their model IDs using data attributes.
- Added player score cards.
- Added current-turn information.
- Added a LineLock header and development-phase badge.
- Added responsive styles for desktop, tablet, and mobile screens.
- Added accessibility labels for dots, edges, boxes, and the complete board.

### Board Rendering Strategy

A five-by-five dot board contains more than just 25 visual positions. The interface must also reserve positions for edges and boxes.

The visual board therefore uses a nine-by-nine CSS Grid:

- Even row and even column: dot
- Even row and odd column: horizontal edge
- Odd row and even column: vertical edge
- Odd row and odd column: box

This arrangement allows the visual board to match the TypeScript models without storing layout information inside the user-interface component.

### Model Integration

The component searches the existing game state for each edge and box using its row, column, and orientation.

The visual elements store model IDs in data attributes:

- `data-edge-id`
- `data-box-id`

These IDs will allow Phase 4 to connect user clicks to the correct edge in the game state.

### Technologies Practiced

- React component props
- TypeScript prop types
- CSS Grid
- Conditional rendering
- Array generation
- Model-to-interface mapping
- Data attributes
- Responsive CSS
- Accessible ARIA labels

### Testing Completed

- Confirmed a five-by-five board displays 25 dots.
- Confirmed 20 horizontal edge positions appear.
- Confirmed 20 vertical edge positions appear.
- Confirmed 16 box positions are reserved.
- Confirmed both player cards appear.
- Confirmed Player 1 is shown as the current player.
- Confirmed the layout works on desktop and smaller screens.
- Confirmed the edge lines are not clickable.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 4 will make every horizontal and vertical edge clickable and visually mark claimed edges.