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

---

## Phase 4 — Clickable Edges

### Goal

Connect every visual board edge to the TypeScript game state and allow players to claim available edges.

### Work Completed

- Converted static horizontal edges into interactive buttons.
- Converted static vertical edges into interactive buttons.
- Connected each button to its corresponding edge model ID.
- Added an edge-click callback to the `GameBoard` component.
- Added React state to the main application.
- Added a pure helper for claiming an available edge.
- Reused the existing move-validation rules.
- Prevented edges from being claimed more than once.
- Increased the move count after each valid edge claim.
- Added hover feedback for available edges.
- Added visible keyboard-focus feedback.
- Added blue styling for Player 1 claims.
- Added pink styling for future Player 2 claims.
- Added accessible pressed and disabled states.
- Added a live claimed-edge counter.

### State Update Strategy

The current game state is stored using React's `useState` hook.

When an edge is clicked:

1. The visual component sends the edge ID to the application.
2. The application creates a move containing the edge ID and current player.
3. The existing validation rules check the move.
4. A new edge array is created.
5. The selected edge receives the current player's number.
6. The move count increases.
7. React renders the updated game board.

The original state is not mutated directly.

### Phase Limitation

All valid moves currently belong to Player 1.

Player switching was intentionally excluded because it belongs to Phase 5 of the fixed development roadmap.

### Technologies Practiced

- React state
- Callback props
- Interactive buttons
- Immutable state updates
- TypeScript event data
- Existing-rule reuse
- Conditional CSS classes
- Disabled button states
- Keyboard accessibility
- ARIA pressed states

### Testing Completed

- Confirmed every horizontal edge can be clicked.
- Confirmed every vertical edge can be clicked.
- Confirmed claimed edges turn blue.
- Confirmed claimed edges cannot be selected again.
- Confirmed unavailable edges are disabled.
- Confirmed the move count increases after valid moves.
- Confirmed hovering highlights available edges.
- Confirmed keyboard focus is visible.
- Confirmed Player 2 styling is reserved for Phase 5.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 5 will alternate the current player after each valid move and display claimed edges using the appropriate player color.

---

## Phase 5 — Player Turns

### Goal

Introduce local two-player turn management so that control alternates after every valid edge claim.

### Work Completed

- Updated the edge-claiming rule to switch players after a valid move.
- Preserved each edge's player ownership.
- Displayed Player 1 claims using blue styling.
- Displayed Player 2 claims using pink styling.
- Added conditional active-player styling to both player cards.
- Updated the current-player card after every valid move.
- Matched the current-player card styling to the active player's color.
- Added an ARIA live region for turn announcements.
- Ensured invalid and duplicate moves do not switch players.
- Preserved immutable game-state updates.
- Kept score values unchanged because box detection is not implemented yet.

### Turn-Management Process

When a player selects an available edge:

1. The board sends the selected edge ID to the application.
2. The application creates a move using the current player number.
3. The game rules validate the move.
4. The selected edge is assigned to the current player.
5. The move count increases.
6. The current player changes from Player 1 to Player 2 or from Player 2 to Player 1.
7. React renders the new edge color and active-player information.

Invalid moves return the existing state and do not change the current player.

### Player Ownership

Each claimed edge stores the number of the player who selected it.

- Player 1 edges use the blue visual theme.
- Player 2 edges use the pink visual theme.

Because ownership is stored in the game state rather than only in the interface, edge colors remain consistent after later state updates.

### Immutable State Updates

The game logic creates a new edge array and returns a new game-state object after each valid move.

The previous state is not modified directly. This allows React to reliably detect the update and render the correct board and current-player information.

### Accessibility

The current-player card uses an ARIA live region so assistive technology can announce turn changes.

Claimed edges remain disabled, preventing the same edge from being selected more than once.

### Phase Limitation

Phase 5 switches players after every valid move.

The traditional Dots and Boxes extra-turn rule is not active yet. Beginning in Phase 6, a player who completes a box will keep the turn instead of passing it to the other player.

### Technologies Practiced

- React state
- TypeScript union-style player values
- Conditional class names
- Immutable state updates
- Turn-management logic
- Player-owned game data
- Dynamic interface rendering
- CSS transitions
- ARIA live regions
- Move validation

### Testing Completed

- Confirmed Player 1 claims blue edges.
- Confirmed Player 2 claims pink edges.
- Confirmed turns alternate after valid moves.
- Confirmed the current-player name updates.
- Confirmed active-player card styling switches.
- Confirmed the center turn card changes color.
- Confirmed claimed edges retain their original owners.
- Confirmed duplicate moves do not switch the turn.
- Confirmed duplicate moves do not increase the move count.
- Confirmed scores remain zero before box detection.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 6 will detect completed boxes, assign ownership, update player scores, and allow a player to keep the turn after completing a box.

---

## Phase 6 — Box Detection

### Goal

Detect completed boxes, assign ownership, update player scores, and implement the traditional extra-turn rule.

### Work Completed

- Added coordinate-based box-completion detection.
- Located the four surrounding edges of every box.
- Checked unclaimed boxes after every valid edge move.
- Assigned newly completed boxes to the player who closed them.
- Increased the player's score for every newly completed box.
- Prevented previously completed boxes from being scored again.
- Supported completing two adjacent boxes with one shared edge.
- Allowed players to keep their turn after completing a box.
- Continued passing the turn when no box was completed.
- Added player-specific completed-box colors.
- Added the owner's initial inside every completed box.
- Added accessible descriptions for claimed and unclaimed boxes.
- Preserved immutable edge, box, player, and game-state updates.

### Box-Detection Process

After a valid edge is selected:

1. The selected edge is assigned to the current player.
2. A new edge array is created.
3. Every unclaimed box is checked using the updated edges.
4. The top, bottom, left, and right edge of each box are located.
5. A box is complete when all four surrounding edges are claimed.
6. Every newly completed box is assigned to the current player.
7. The player's score increases by the number of completed boxes.
8. The player keeps the turn after completing at least one box.
9. The turn switches when no boxes are completed.

### Coordinate Relationships

Each box stores a row and column position.

Its four surrounding edges are located using these coordinates:

- Top edge: horizontal edge at the same row and column
- Bottom edge: horizontal edge one row below
- Left edge: vertical edge at the same row and column
- Right edge: vertical edge one column to the right

This approach avoids storing repeated edge objects inside each box.

### Multiple-Box Completion

One edge may be shared by two neighboring boxes.

After every valid move, all unclaimed boxes are checked. This allows a single edge to complete two boxes simultaneously.

When that happens:

- Both boxes are assigned to the current player.
- The player's score increases by two.
- The move count increases by one.
- The player keeps the turn.

### Extra-Turn Rule

The next player is determined using the number of boxes completed by the move.

- Zero completed boxes: control passes to the other player.
- One completed box: the current player keeps the turn.
- Two completed boxes: the current player earns two points and keeps the turn.

### Immutable State Updates

Phase 6 creates new arrays for:

- Edges
- Boxes
- Players

It then returns a new game-state object containing those arrays.

The existing game state is never modified directly.

### User Interface

Completed boxes now display:

- A blue background when owned by Player 1
- A pink background when owned by Player 2
- The first letter of the owner's name
- An accessible label containing the owner's complete name

Player scores update automatically because the interface reads directly from the game state.

### Technologies Practiced

- Coordinate-based game logic
- TypeScript helper functions
- Array filtering and mapping
- Immutable nested-state updates
- Score calculation
- Conditional turn management
- Multiple-result move handling
- Conditional React rendering
- CSS animations
- Accessible game interfaces

### Testing Completed

- Confirmed incomplete boxes remain unclaimed.
- Confirmed a box is detected after its fourth edge is claimed.
- Confirmed the box belongs to the player who claims the fourth edge.
- Confirmed the correct player's score increases.
- Confirmed previously completed boxes are not scored twice.
- Confirmed the player keeps the turn after completing a box.
- Confirmed the turn switches when no box is completed.
- Confirmed one edge can complete two neighboring boxes.
- Confirmed a double-box move awards two points.
- Confirmed a double-box move increases the move count only once.
- Confirmed box colors match their owners.
- Confirmed player initials appear inside completed boxes.
- Confirmed edge ownership remains unchanged.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 7 will detect when every edge has been claimed, determine the winner or tie, prevent additional moves, display the final result, and add a local-game restart control.

---

## Phase 7 — Game Completion

### Goal

Detect the end of a local match, calculate the final result, prevent additional moves, and allow players to restart the game.

### Work Completed

- Added a reusable game-completion helper.
- Detected completion when every board edge has been claimed.
- Prevented move validation after game completion.
- Compared both player scores to determine the winner.
- Added support for tied final scores.
- Added a final-result panel.
- Displayed both player names and final scores.
- Replaced the current-player display with a completed-game status.
- Removed active-player highlighting after the match ends.
- Disabled board interactions after game completion.
- Added a Play Again button.
- Reset edges, boxes, scores, move count, and active player.
- Added accessible final-result announcements.
- Preserved all Phase 6 scoring and extra-turn behavior.

### Completion Detection

The game is complete when the move count is equal to the total number of edges.

For the current five-by-five dot board:

- Horizontal edges: 20
- Vertical edges: 20
- Total edges: 40

The match therefore ends immediately after the fortieth valid edge claim.

### Winner Calculation

The final result is calculated by comparing both player scores.

- Player 1 has the higher score: Player 1 wins.
- Player 2 has the higher score: Player 2 wins.
- Both scores are equal: the match ends in a tie.

Because the board contains sixteen boxes, both final scores should always add up to sixteen.

### Move Prevention

The move validator checks whether the match is already complete before processing an edge.

After completion:

- Edge-click handlers no longer submit moves.
- Edge buttons are disabled.
- Validation rejects any attempted move.
- Scores and ownership remain unchanged.

This provides protection in both the user interface and game-rule layer.

### Restart Process

Selecting Play Again creates a completely new initial game state.

The restart resets:

- All edge ownership
- All box ownership
- Both player scores
- The move count
- The current player
- The final-result panel

The original player names and board size are preserved.

### Accessibility

The final result uses an assertive ARIA live region so assistive technology can announce the winner or tie immediately.

The restart button includes visible keyboard-focus styling.

Completed board edges and boxes retain their accessible ownership descriptions.

### Technologies Practiced

- Derived React state
- Winner calculation
- Tie handling
- Game lifecycle management
- Defensive rule validation
- Conditional rendering
- Complete state resets
- Accessible status announcements
- Button interaction states
- Responsive result presentation

### Testing Completed

- Confirmed the game remains active before all edges are claimed.
- Confirmed the fortieth edge completes the match.
- Confirmed all sixteen boxes receive owners.
- Confirmed final scores add up to sixteen.
- Confirmed the higher-scoring player is announced as the winner.
- Confirmed equal scores produce a tie result.
- Confirmed the turn card changes to a completed-game status.
- Confirmed neither player remains highlighted after completion.
- Confirmed board interactions stop after completion.
- Confirmed Play Again resets every edge.
- Confirmed Play Again resets every box.
- Confirmed Play Again resets both scores.
- Confirmed Play Again resets the move count.
- Confirmed Player 1 starts the new game.
- Confirmed the result panel disappears after restarting.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 8 will polish the complete local-game experience with player setup, improved controls, gameplay feedback, and final responsive refinements.

---

## Phase 8 — Local Game Polish

### Goal

Turn the completed local-game mechanics into a polished and configurable experience before introducing application routing.

### Work Completed

- Added a dedicated local-game setup component.
- Added customizable Player 1 and Player 2 names.
- Added selectable board sizes from three-by-three to seven-by-seven dots.
- Added dynamic dot, edge, and box summaries.
- Created games using the submitted local settings.
- Preserved selected settings when restarting a match.
- Added a control for returning to the setup screen.
- Added a control for restarting the active match.
- Added live gameplay feedback after every valid move.
- Added feedback for normal turns, completed boxes, double-box moves, and game completion.
- Added readable defaults for empty player names.
- Preserved all existing scoring, ownership, extra-turn, completion, winner, tie, and restart rules.
- Added responsive setup and match-control layouts.
- Added accessible form labels, live feedback, and keyboard-focus states.

### Local Match Setup

The setup form collects:

- Player 1 name
- Player 2 name
- Board size

The selected values are stored separately from the active game state.

Submitting the form creates a new game state using those settings and displays the game interface.

### Configurable Board Sizes

The existing board-generation logic supports multiple square board sizes.

Phase 8 exposes the following options:

- Three-by-three dots
- Four-by-four dots
- Five-by-five dots
- Six-by-six dots
- Seven-by-seven dots

For a board containing `N` dots per side:

- Total dots: `N × N`
- Total edges: `2 × N × (N - 1)`
- Total boxes: `(N - 1) × (N - 1)`

### Gameplay Feedback

After every valid move, the application compares the previous and updated game states.

The feedback message identifies:

- The player who claimed the edge
- The next active player
- The number of boxes completed
- Whether the same player keeps the turn
- Whether the complete game result is ready

This feedback is derived from score differences rather than duplicating the box-detection logic in the interface.

### Restart and Setup Controls

Restart Match:

- Preserves both player names
- Preserves the selected board size
- Resets edges
- Resets boxes
- Resets scores
- Resets the move count
- Returns control to Player 1

Change Setup:

- Hides the current game
- Returns to the local setup form
- Preserves the previous form selections
- Allows a different match configuration to begin

### Input Handling

Player names are trimmed before a match begins.

Empty or whitespace-only names use these defaults:

- Player 1
- Player 2

Each name is limited to twenty characters to preserve the player-card layout.

### Accessibility

Phase 8 adds:

- Explicit labels for every setup control
- Keyboard-accessible form fields and buttons
- Visible focus states
- A polite live region for gameplay feedback
- Existing assertive final-result announcements
- Existing accessible board and ownership labels

### Technologies Practiced

- Controlled React forms
- Typed component callbacks
- Shared TypeScript settings
- Conditional application views
- Dynamic game initialization
- Derived gameplay feedback
- Reusable local-game settings
- Responsive form design
- Input cleanup and defaults
- Accessible status communication

### Testing Completed

- Confirmed custom player names appear throughout the game.
- Confirmed empty names use readable defaults.
- Confirmed three-by-three boards generate four boxes.
- Confirmed four-by-four boards generate nine boxes.
- Confirmed five-by-five boards generate sixteen boxes.
- Confirmed six-by-six boards generate twenty-five boxes.
- Confirmed seven-by-seven boards generate thirty-six boxes.
- Confirmed each board generates the correct number of edges.
- Confirmed scoring and extra turns work on each board size.
- Confirmed normal-move feedback identifies the next player.
- Confirmed box-completion feedback identifies retained control.
- Confirmed double-box feedback reports two boxes.
- Confirmed Restart Match preserves settings and clears the game.
- Confirmed Change Setup returns to the form.
- Confirmed the final result still detects winners and ties.
- Confirmed responsive layouts work on desktop and mobile.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 9 will introduce application routing and separate the landing, local-game, and future online-game experiences into dedicated routes.

---

## Phase 9 — Application Routing

### Goal

Separate the landing page, local game, future online game, and not-found experience into dedicated browser routes.

### Work Completed

- Installed React Router in the client application.
- Wrapped the React application with `BrowserRouter`.
- Created a shared application layout.
- Added shared header navigation and footer content.
- Added active navigation-link styling.
- Created a dedicated landing page.
- Moved the complete local-game experience into its own page.
- Created a placeholder page for future online multiplayer.
- Added a custom not-found route.
- Added links between major application pages.
- Preserved all Phase 8 local-game behavior.
- Added responsive navigation and route-specific layouts.
- Added keyboard-focus styles for route links.
- Added direct URL support during local Vite development.

### Route Structure

The application now includes:

- `/` — Landing page
- `/local` — Configurable local game
- `/online` — Future online multiplayer
- `*` — Not-found page

The shared layout contains the brand, navigation, development-phase badge, and footer.

Matched route pages render inside the layout outlet.

### Shared Layout

The layout avoids duplicating common interface elements across pages.

It provides:

- LineLock brand navigation
- Home link
- Local Game link
- Online link
- Active-page styling
- Shared footer

Only the page content changes when navigation occurs.

### Local Game Refactor

The local-game state and handlers were moved from `App.tsx` into `LocalGamePage.tsx`.

This keeps routing concerns separate from gameplay concerns.

The local route preserves:

- Setup configuration
- Player names
- Board sizes
- Edge claims
- Turn management
- Box detection
- Scores
- Extra turns
- Winner and tie results
- Restart controls
- Gameplay feedback

### Online Route

The online page currently acts as a planned-feature placeholder.

It identifies the next multiplayer milestones:

- Socket.IO Integration
- Online Rooms
- Server-Controlled Game State

No online gameplay was implemented because that work begins in Phase 10.

### Navigation Behavior

Internal route links use React Router navigation.

The browser URL updates while the React application remains active.

Back and forward browser navigation continue to work because the router is synchronized with browser history.

### Not-Found Handling

Any path that does not match a known route renders the custom not-found page.

The page provides links back to:

- The landing page
- The local game

### Accessibility

Phase 9 adds:

- A labeled primary navigation region
- Current-page navigation semantics
- Visible keyboard-focus styles
- Descriptive route links
- Clear not-found recovery controls
- Existing accessible local-game behavior

### Technologies Practiced

- React Router
- Browser-based routing
- Nested routes
- Shared layouts
- Route outlets
- Active navigation links
- Page-level component separation
- Browser history navigation
- Custom not-found routes
- Responsive navigation design

### Testing Completed

- Confirmed the landing page renders at `/`.
- Confirmed the local game renders at `/local`.
- Confirmed the online placeholder renders at `/online`.
- Confirmed unknown URLs display the not-found page.
- Confirmed active navigation styling follows the current route.
- Confirmed browser back navigation works.
- Confirmed browser forward navigation works.
- Confirmed route links do not trigger full page reloads.
- Confirmed direct local-route loading works during development.
- Confirmed the complete local setup flow still works.
- Confirmed all local board sizes still render.
- Confirmed turns, scoring, extra turns, and completion still work.
- Confirmed restart and setup controls still work.
- Confirmed responsive navigation works.
- Confirmed frontend linting succeeds.
- Confirmed the frontend production build succeeds.

### Next Phase

Phase 10 will connect the React client to the Socket.IO server and establish the first real-time client-server communication.

---

## Phase 10 — Socket.IO Integration

### Goal

Connect the React client to the LineLock Socket.IO server and verify typed, bidirectional real-time communication.

### Work Completed

- Installed the Socket.IO client package.
- Created a reusable typed socket instance.
- Disabled automatic connection until the online page is opened.
- Added typed client-to-server events.
- Added typed server-to-client events.
- Connected the online route to the backend server.
- Added server connection confirmation.
- Displayed the Socket.IO connection status.
- Displayed the connected socket ID.
- Displayed the server connection time.
- Added client-to-server ping events.
- Added server-to-client pong events.
- Calculated browser-to-server round-trip latency.
- Added connection-error feedback.
- Added manual reconnection controls.
- Disconnected the socket when leaving the online route.
- Preserved all local-game functionality.
- Added responsive and accessible connection-status components.

### Connection Lifecycle

The Socket.IO client is created with automatic connection disabled.

The online page controls the lifecycle:

1. Register Socket.IO event listeners.
2. Open the connection when the route mounts.
3. Receive a server confirmation event.
4. Display the connection state and socket ID.
5. Remove listeners when the route unmounts.
6. Disconnect when the user leaves the online page.

This prevents the application from keeping an unnecessary multiplayer connection open while the user is playing locally.

### Typed Events

The integration defines separate event interfaces for each direction.

Client-to-server:

- `client:ping`

Server-to-client:

- `server:connection-ready`
- `server:pong`

The Socket.IO generic types connect event names to their expected payloads.

TypeScript can therefore detect:

- Incorrect event names
- Missing payload properties
- Incorrect payload value types
- Incorrect listener parameter types

### Connection Confirmation

When a browser connects, the server emits a connection-ready event containing:

- The assigned socket ID
- A confirmation message
- The connection timestamp

The online page stores and displays this information.

### Ping and Pong Test

The browser emits a ping containing its current timestamp.

The server returns:

- The original browser timestamp
- The time the server received the event

The client subtracts the original timestamp from its current time to estimate the complete round-trip latency.

This confirms communication in both directions before multiplayer room logic is introduced.

### Connection Cleanup

When the online route is left:

- Event listeners are removed.
- The socket disconnects.
- The server receives a disconnect event.
- The local route continues without an unnecessary network connection.

Returning to the online route creates a new connection and socket ID.

### Error Handling

Connection errors are displayed inside the online interface instead of crashing the application.

The user can manually retry a failed or closed connection.

The server also logs Engine.IO connection errors for backend debugging.

### CORS

The server accepts the two common Vite development origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Both Express and Socket.IO use the same allowed-origin list.

### Accessibility

Phase 10 adds:

- Polite live connection-status announcements
- Readable connection-error messages
- Keyboard-accessible ping and reconnect controls
- Visible focus states
- Text labels in addition to colored status indicators
- Disabled states while actions are unavailable

### Technologies Practiced

- Socket.IO
- WebSocket-style event communication
- Typed real-time events
- React effect cleanup
- Connection lifecycle management
- Client-server event contracts
- CORS configuration
- Latency measurement
- Error and reconnection handling
- Accessible real-time status interfaces

### Testing Completed

- Confirmed the Express health route responds.
- Confirmed the React client connects to Socket.IO.
- Confirmed the server logs the connected socket ID.
- Confirmed the browser displays the same socket ID.
- Confirmed the server sends connection confirmation.
- Confirmed the client sends a ping event.
- Confirmed the server returns a pong event.
- Confirmed round-trip latency is displayed.
- Confirmed leaving the online route disconnects the socket.
- Confirmed returning creates a new connection.
- Confirmed server shutdown produces a disconnected or error state.
- Confirmed reconnection works after restarting the server.
- Confirmed local-game routes continue working.
- Confirmed client linting succeeds.
- Confirmed the client production build succeeds.
- Confirmed server TypeScript checking succeeds.

### Next Phase

Phase 11 will use the established Socket.IO connection to create multiplayer rooms, generate room codes, join existing rooms, and manage room membership.