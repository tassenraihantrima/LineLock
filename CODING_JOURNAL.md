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

---

## Phase 11 — Online Rooms

### Goal

Use the existing Socket.IO connection to create and join two-player online rooms with real-time lobby membership.

### Work Completed

- Added typed room-creation events.
- Added typed room-joining events.
- Added typed room-leaving events.
- Added acknowledgement responses for room actions.
- Generated unique six-character room codes.
- Added an in-memory server room store.
- Limited rooms to two connected players.
- Assigned Player 1 and Player 2 positions.
- Added waiting and ready lobby states.
- Broadcast room updates to all room members.
- Added player-name cleanup and length limits.
- Added room-code normalization.
- Added invalid-room validation.
- Added full-room validation.
- Added manual room leaving.
- Removed disconnected sockets from rooms.
- Deleted rooms after the final player left.
- Added room count information to the health route.
- Added create-room and join-room interfaces.
- Added room-code copying.
- Added real-time player lobby rows.
- Highlighted the current browser's player position.
- Preserved the existing connection and latency interface.

### Server Room Storage

Rooms are stored in an in-memory `Map`.

Each room contains:

- A six-character room code
- Up to two player records
- Each player's socket ID
- Each player's display name
- Each player's assigned position

The room map exists only while the server process is running.

Restarting the server clears all rooms. Database persistence is outside the scope of this phase.

### Room Creation

When a player creates a room:

1. Their name is cleaned and limited to twenty characters.
2. A unique room code is generated.
3. A new room record is stored.
4. The socket joins the Socket.IO room.
5. The socket becomes Player 1.
6. The server returns the room through an acknowledgement.
7. The server broadcasts the room state.

### Room Joining

When a player submits a room code:

1. The room code is trimmed and converted to uppercase.
2. The server verifies that the room exists.
3. The server verifies that the room has an open position.
4. The socket joins the Socket.IO room.
5. The new member becomes Player 2.
6. The room changes from waiting to ready.
7. Both browsers receive the updated room.

### Typed Acknowledgements

Create, join, and leave events include callback responses.

A successful response contains the room state.

A failed response contains a readable validation message.

This lets the requesting browser display errors without creating separate global error events.

### Membership Updates

The server broadcasts `room:updated` whenever:

- A room is created
- A second player joins
- A player leaves
- A player disconnects

Every connected member therefore receives the same lobby state.

### Disconnection Cleanup

When a socket disconnects:

- It is removed from the server room record.
- Remaining players receive an updated lobby.
- The remaining player becomes Player 1.
- Empty rooms are removed from memory.

Full reconnection recovery is intentionally reserved for Phase 13.

### Room Security and Validation

Phase 11 includes basic validation:

- Room codes are normalized.
- Unknown rooms are rejected.
- Full rooms reject additional players.
- Names are trimmed.
- Empty names use a default.
- Names are limited to twenty characters.

Authentication and permanent player identity will be introduced later.

### Accessibility

The room interface includes:

- Explicit player-name and room-code labels
- Keyboard-accessible room controls
- Live room-status messages
- Text-based waiting and ready states
- Visible focus styling
- Disabled action states
- Player-position labels

### Technologies Practiced

- Socket.IO rooms
- Typed event acknowledgements
- In-memory server state
- Real-time lobby synchronization
- Server-side validation
- Room-code generation
- Socket membership
- Disconnect cleanup
- Controlled React forms
- Browser clipboard access
- Responsive lobby design

### Testing Completed

- Confirmed a player can create a room.
- Confirmed every new room receives a code.
- Confirmed the creator becomes Player 1.
- Confirmed a second browser can join.
- Confirmed the joining browser becomes Player 2.
- Confirmed both browsers receive matching room state.
- Confirmed the room changes from waiting to ready.
- Confirmed invalid room codes are rejected.
- Confirmed a third player cannot join a full room.
- Confirmed Player 2 can leave manually.
- Confirmed the remaining browser returns to waiting.
- Confirmed closing a player tab updates the room.
- Confirmed empty rooms are deleted.
- Confirmed the health route reports active rooms.
- Confirmed existing ping and latency testing still works.
- Confirmed local gameplay still works.
- Confirmed client linting succeeds.
- Confirmed the client production build succeeds.
- Confirmed server TypeScript checking succeeds.

### Next Phase

Phase 12 will create the online game state on the server, validate online moves, synchronize the board between both players, and prevent clients from controlling authoritative gameplay data.

---

## Phase 12 — Server-Controlled Game State

### Goal

Move authoritative online gameplay from individual browsers to the Socket.IO server and synchronize every valid change between both connected players.

### Work Completed

- Added a server-controlled online game-state model.
- Added server-side board generation.
- Added server-side player creation.
- Added a host-controlled online match start event.
- Added typed online move events.
- Added server-side turn validation.
- Added server-side edge validation.
- Added server-side duplicate-move prevention.
- Added server-side completed-box detection.
- Added server-controlled score updates.
- Added server-controlled extra turns.
- Added double-box completion support.
- Added server-side game-completion detection.
- Broadcast authoritative game updates to both room members.
- Reused the existing game-board component for online play.
- Disabled online board interaction when it is not the current browser's turn.
- Added online winner and tie presentation.
- Added host-controlled online rematches.
- Cleared interrupted games when a room member disconnected.
- Preserved all Phase 11 lobby and connection features.

### Authoritative Server State

The online game state now exists inside the server's room record.

The server stores:

- Board size
- Both players
- Player scores
- Every horizontal edge
- Every vertical edge
- Every box
- Current player
- Move count

Browsers receive copies of this state but do not modify it directly.

### Online Match Startup

After two players enter a room:

1. The room becomes ready.
2. Player 1 receives the start control.
3. Player 1 sends a game-start event.
4. The server creates a fresh five-by-five game.
5. The server broadcasts the game to both browsers.
6. Player 1 receives the first turn.

Player 2 cannot start the game.

### Online Move Process

When a browser selects an edge:

1. The browser sends only the edge ID.
2. The server identifies the socket's room.
3. The server identifies the socket's player number.
4. The server verifies that a game exists.
5. The server verifies that the game is not complete.
6. The server verifies that it is that player's turn.
7. The server verifies that the edge exists.
8. The server verifies that the edge is unclaimed.
9. The server applies the move.
10. The server detects newly completed boxes.
11. The server updates scores and the current player.
12. The server broadcasts the new game state.

The requesting browser never decides whether its own move is valid.

### Server-Side Box Detection

Each box is checked against four server-owned edges:

- Top horizontal edge
- Bottom horizontal edge
- Left vertical edge
- Right vertical edge

Only previously unclaimed boxes can be newly awarded.

A single edge can complete one or two boxes.

### Online Turn Management

A normal move passes control to the other player.

Completing at least one box keeps control with the moving player.

Both browsers receive the same current-player value from the server.

### Client Interaction Control

The client compares:

- Its socket-assigned player number
- The server-controlled current player
- The game-completion state

The board is interactive only when all three conditions allow a move.

Server validation remains active even if client-side controls are bypassed.

### Online Completion

The match ends when every server-owned edge has been claimed.

The client then displays:

- Both final scores
- The winner or tie
- All completed boxes
- A completed room status

Player 1 can request a new match while keeping the room and both connected players.

### Interrupted Matches

When either player leaves or disconnects during an active game:

- The server removes that room member.
- The game state is cleared.
- The room returns to waiting.
- The remaining member becomes Player 1.

Preserving an interrupted match is reserved for Phase 13.

### Technologies Practiced

- Authoritative multiplayer architecture
- Server-side game state
- Typed multiplayer events
- Server-side validation
- Real-time state broadcasting
- Room-scoped game updates
- Shared UI components
- Client interaction gating
- Online turn synchronization
- Defensive multiplayer programming

### Testing Completed

- Confirmed Player 1 can start a ready room.
- Confirmed Player 2 cannot start the room.
- Confirmed both browsers receive the same initial board.
- Confirmed Player 1 receives the first turn.
- Confirmed valid moves appear in both browsers.
- Confirmed ownership colors match in both browsers.
- Confirmed out-of-turn moves are rejected.
- Confirmed duplicate moves are rejected.
- Confirmed box ownership synchronizes.
- Confirmed scores synchronize.
- Confirmed extra turns synchronize.
- Confirmed double-box moves award two points.
- Confirmed game completion appears in both browsers.
- Confirmed winner and tie results match.
- Confirmed online rematches reset both browsers.
- Confirmed player disconnection clears the interrupted game.
- Confirmed local gameplay still works.
- Confirmed client linting succeeds.
- Confirmed the client production build succeeds.
- Confirmed server TypeScript checking succeeds.

### Next Phase

Phase 13 will preserve room membership and authoritative game state during temporary disconnects, allow players to rejoin using recovery tokens, and apply reconnection grace periods.

---

## Phase 13 — Reconnection Handling

### Goal

Preserve online room membership and authoritative game state during temporary Socket.IO disconnections and allow players to recover their existing multiplayer position without restarting the match.

### Work Completed

- Added private recovery tokens for online players.
- Generated cryptographically random recovery credentials on the server.
- Separated public room-player information from private server recovery data.
- Added connected and disconnected player states.
- Added a thirty-second reconnection grace period.
- Preserved room membership during temporary disconnections.
- Preserved authoritative game state during the grace period.
- Preserved player scores, claimed edges, completed boxes, move count, and current turn.
- Added a typed room-recovery Socket.IO event.
- Added server-side recovery-token validation.
- Replaced expired Socket.IO IDs with newly connected socket IDs.
- Preserved Player 1 and Player 2 positions after reconnection.
- Cancelled pending disconnect timers after successful recovery.
- Stored recovery credentials in browser session storage.
- Automatically attempted room recovery after Socket.IO reconnection.
- Paused online gameplay while either player was disconnected.
- Prevented new games from starting while a room member was disconnected.
- Added reconnection-aware lobby status.
- Disabled board interaction while waiting for another player to recover.
- Removed expired disconnected players after the grace period.
- Cleared interrupted games only after recovery opportunities expired.
- Preserved immediate room cleanup for intentional Leave Room actions.

### Recovery Identity

Socket.IO socket IDs are temporary and may change whenever a browser reconnects.

Phase 13 therefore separates connection identity from player recovery identity.

Each internal room player stores:

- Current Socket.IO socket ID
- Player name
- Player number
- Connection status
- Private recovery token
- Optional disconnect timer

Recovery tokens are never included in public room broadcasts.

The requesting browser receives only its own token through the acknowledgement returned when creating, joining, or recovering a room.

### Temporary Disconnection Process

When a connected room member disconnects:

1. The player remains inside the server room record.
2. The player is marked disconnected.
3. The authoritative game state remains unchanged.
4. A thirty-second grace-period timer begins.
5. The remaining player receives an updated room state.
6. Online moves are paused while the player is absent.

The game is therefore not immediately cancelled when a network interruption occurs.

### Room Recovery Process

When Socket.IO reconnects:

1. The browser receives a new socket ID.
2. The browser reads its room code and recovery token from session storage.
3. The browser sends a room-recovery request.
4. The server validates the room and private recovery token.
5. The pending disconnect timer is cancelled.
6. The player's old socket ID is replaced with the new socket ID.
7. The player is marked connected.
8. The new socket rejoins the Socket.IO room.
9. The original player number is preserved.
10. The existing authoritative game state is returned.
11. Both room members receive synchronized room and game updates.

No new game state is created during recovery.

### Preserved Match State

A successful recovery preserves:

- Board size
- Player names
- Player numbers
- Player scores
- Claimed edges
- Edge ownership
- Completed boxes
- Box ownership
- Move count
- Current player
- Match-completion state

This allows an interrupted match to continue from the exact server-authoritative state that existed before the disconnection.

### Grace-Period Expiration

If a disconnected player does not recover before the grace period expires:

- The disconnected player is permanently removed.
- An empty room is deleted.
- An interrupted match is cleared when another player remains.
- The remaining member becomes Player 1.
- The lobby returns to a waiting state.

Intentional room leaving does not use the grace period and continues to remove the player immediately.

### Client Recovery Storage

Recovery credentials are stored using browser session storage.

Session-scoped storage allows a page refresh or temporary Socket.IO interruption to preserve recovery information without making the recovery identity part of the public room state.

The credentials are removed when the player intentionally leaves the room or when recovery can no longer succeed.

### Multiplayer Safety

Phase 13 maintains server authority during disconnections.

The server rejects game moves whenever both room players are not actively connected.

The client also disables board interaction during the same period.

This prevents either player from gaining an advantage while their opponent is temporarily disconnected.

### Technologies Practiced

- Socket.IO reconnection handling
- Persistent session identity
- Cryptographically random recovery tokens
- Node.js timers
- Browser session storage
- Server-side credential validation
- Connection lifecycle management
- Authoritative state preservation
- Defensive multiplayer programming
- Real-time room recovery
- Typed Socket.IO recovery events

### Testing Completed

- Confirmed a disconnected player remains in the room during the grace period.
- Confirmed the authoritative board remains unchanged during temporary disconnection.
- Confirmed scores remain unchanged during temporary disconnection.
- Confirmed completed boxes remain unchanged.
- Confirmed claimed edges remain unchanged.
- Confirmed the current turn remains unchanged.
- Confirmed online moves are blocked while a player is disconnected.
- Confirmed the lobby displays a reconnecting player state.
- Confirmed refreshing Player 1 creates a new socket ID while preserving Player 1 identity.
- Confirmed refreshing Player 2 creates a new socket ID while preserving Player 2 identity.
- Confirmed recovery restores the active room.
- Confirmed recovery restores an active game.
- Confirmed successful recovery cancels the disconnect timer.
- Confirmed recovered games do not expire after the original timer deadline.
- Confirmed invalid recovery credentials are rejected.
- Confirmed disconnected player positions cannot be taken by a third player.
- Confirmed a player who exceeds the grace period is permanently removed.
- Confirmed empty rooms are deleted after timeout.
- Confirmed intentional Leave Room actions still remove players immediately.
- Confirmed local gameplay remains unaffected.
- Confirmed client linting succeeds.
- Confirmed the client production build succeeds.
- Confirmed server TypeScript checking succeeds.

### Next Phase

Phase 14 will introduce user authentication and persistent database storage so player identity, accounts, and multiplayer information can survive beyond individual server sessions.

---

## Phase 14 — Authentication & Database

### Goal

Add persistent user accounts to LineLock, store account data in PostgreSQL, authenticate HTTP and Socket.IO communication, and connect online multiplayer identities to authenticated users instead of browser-supplied player names.

### Work Completed

- Added PostgreSQL as LineLock's persistent database.
- Created a hosted PostgreSQL database using Neon.
- Added Prisma ORM to the backend.
- Configured Prisma to connect to PostgreSQL through environment variables.
- Created the initial Prisma `User` model.
- Added persistent user IDs, unique emails, unique usernames, password hashes, and account timestamps.
- Created and applied the initial user migration.
- Generated the Prisma client for backend database access.
- Added a reusable Prisma database client.
- Added bcrypt password hashing.
- Added JSON Web Token authentication.
- Added HTTP-only authentication cookies.
- Added account registration.
- Added account login.
- Added authenticated current-user lookup.
- Added logout and authentication-cookie clearing.
- Added middleware for protecting authenticated Express requests.
- Added persistent authentication state to the React application.
- Added a frontend authentication API layer.
- Added `AuthProvider` and a reusable `useAuth` hook.
- Added Login, Register, and Account pages.
- Added protected routing for authenticated online multiplayer.
- Added authentication-aware navigation.
- Added authenticated Socket.IO middleware.
- Configured Socket.IO to include authentication cookies during its handshake.
- Added authenticated database user information to private Socket.IO state.
- Connected room players to persistent database user IDs.
- Prevented the same authenticated account from occupying both room positions.
- Changed room creation to use the authenticated username automatically.
- Changed room joining to use the authenticated username automatically.
- Removed the manual player-name field from online multiplayer.
- Restricted room recovery to the authenticated account that originally owned the player position.
- Preserved Phase 13 recovery tokens as an additional private recovery credential.
- Kept database user IDs, authentication tokens, recovery tokens, and password hashes out of public room data.
- Standardized development URLs so HTTP authentication and Socket.IO share the same localhost cookie context.
- Added PostgreSQL and Prisma to the displayed application technology stack.
- Added logout cleanup for Socket.IO connections and saved recovery credentials.

### Authentication Flow

Registration now follows this process:

1. The browser sends an email, username, and password to the Express server.
2. The server validates the submitted values.
3. Prisma checks PostgreSQL for duplicate emails and usernames.
4. bcrypt hashes the password before storage.
5. Prisma creates the persistent user record.
6. The server creates a signed authentication token.
7. The token is stored in an HTTP-only cookie.
8. The browser receives only safe public user information.

Login follows a similar process:

1. The browser sends the email and password.
2. Prisma loads the matching user.
3. bcrypt compares the submitted password with the stored password hash.
4. A valid login receives a new authentication cookie.
5. React stores the authenticated public user information.

Plaintext passwords are never stored in PostgreSQL.

### Authenticated Socket.IO

Online multiplayer now requires a valid LineLock account.

When Socket.IO connects:

1. The browser includes the authentication cookie in the handshake.
2. The server reads the authentication cookie.
3. The JWT is verified.
4. The database user is confirmed through Prisma.
5. The user's database ID and username are attached privately to the socket.
6. Only authenticated connections are accepted.

Unauthenticated Socket.IO connections are rejected before multiplayer events can be used.

### Authenticated Room Identity

Earlier online phases allowed the browser to submit a temporary player name.

Phase 14 replaces that trust model with persistent account identity.

When a player creates or joins a room, the server uses the authenticated account username automatically.

The browser no longer controls the multiplayer identity.

The server privately associates each room player with:

- Database user ID
- Current Socket.IO ID
- Player number
- Recovery token
- Connection state

The public room object exposes only the information needed by the client interface.

### Authentication and Reconnection

Phase 13 recovery behavior remains intact, but room recovery now also verifies persistent account ownership.

A disconnected player can recover their position only when:

- The recovery token is valid.
- The authenticated database account matches the account that originally owned the player position.

This prevents another authenticated account from using someone else's recovery token to take over their multiplayer slot.

The existing thirty-second recovery grace period continues to preserve:

- Room membership
- Player position
- Scores
- Claimed edges
- Completed boxes
- Move count
- Current turn
- Active game state

### Development Origin Fix

During authentication integration, the frontend used `localhost` while the Socket.IO client initially connected through `127.0.0.1`.

Because browser authentication cookies follow site and cookie rules, HTTP authentication could succeed while the Socket.IO handshake failed to receive the same cookie.

The browser-facing development URLs were standardized to:

- Frontend: `http://localhost:5173`
- Backend client URL: `http://localhost:3001`

This allowed HTTP authentication and Socket.IO authentication to share the same cookie context.

### Security Decisions

- Passwords are hashed with bcrypt before storage.
- Plaintext passwords are never stored.
- Authentication tokens are stored in HTTP-only cookies.
- Authentication cookies are not exposed through React state.
- Database user IDs remain private on the server.
- Recovery tokens remain private.
- Socket.IO connections require authentication.
- Room recovery requires both recovery credentials and account ownership.
- One authenticated account cannot occupy both positions in the same room.
- Test authentication cookie files are excluded from Git.
- `.env` files remain excluded from version control.

### Files Added or Updated

Backend authentication and database work was added primarily in:

- `server/prisma/schema.prisma`
- `server/src/auth/auth.ts`
- `server/src/auth/authMiddleware.ts`
- `server/src/auth/authTypes.ts`
- `server/src/lib/prisma.ts`
- `server/src/index.ts`
- `server/prisma.config.ts`

Frontend authentication work was added primarily in:

- `client/src/auth/authApi.ts`
- `client/src/auth/AuthContext.tsx`
- `client/src/auth/RequireAuth.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/RegisterPage.tsx`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/OnlineGamePage.tsx`
- `client/src/socket/socket.ts`
- `client/src/main.tsx`
- `client/src/App.tsx`
- `client/src/components/AppLayout.tsx`

### Testing Completed

- Confirmed PostgreSQL connectivity.
- Confirmed the Prisma user migration applies successfully.
- Confirmed user accounts persist in PostgreSQL.
- Confirmed passwords are stored as bcrypt hashes.
- Confirmed registration creates a persistent user.
- Confirmed login validates the original plaintext password against the stored hash.
- Confirmed `/api/auth/me` returns the authenticated user when the cookie is present.
- Confirmed unauthenticated `/api/auth/me` requests are rejected.
- Confirmed logout clears authentication.
- Confirmed the React account page restores authenticated sessions.
- Confirmed navigation changes correctly between signed-out and signed-in states.
- Confirmed `/online` requires authentication.
- Confirmed unauthenticated Socket.IO connections are rejected.
- Confirmed authenticated Socket.IO connections succeed.
- Confirmed authenticated Socket.IO connections receive a valid socket ID.
- Confirmed online room creation uses the authenticated account username.
- Confirmed online room joining uses the authenticated account username.
- Confirmed manual player-name entry is no longer required.
- Confirmed one authenticated account cannot occupy both room positions.
- Confirmed Player 1 can start an authenticated online match.
- Confirmed online moves remain synchronized between both browsers.
- Confirmed server-side move validation remains active.
- Confirmed box ownership and scores remain synchronized.
- Confirmed extra turns remain synchronized.
- Confirmed game completion and winner results remain synchronized.
- Confirmed temporary disconnections preserve the active room and game state.
- Confirmed authenticated reconnection restores the correct player position.
- Confirmed room recovery requires both the recovery token and matching authenticated account ownership in the server authorization logic.
- Confirmed local gameplay remains unaffected.
- Confirmed the client production build succeeds.
- Confirmed the server TypeScript build succeeds.
- Confirmed the full root production build succeeds.

### Technologies Practiced

- PostgreSQL
- Prisma ORM
- Database migrations
- Persistent user models
- Password hashing
- JWT authentication
- HTTP-only cookies
- Express authentication middleware
- React authentication state
- Protected routes
- Authenticated Socket.IO
- Persistent multiplayer identity
- Authorization checks
- Account-bound reconnection
- Full-stack authentication architecture

### Phase 14 Result

LineLock now has persistent authenticated user accounts backed by PostgreSQL.

Online multiplayer no longer relies on browser-supplied player identities. Socket.IO connections are authenticated, room membership is tied to database users, and reconnection recovery verifies both temporary recovery credentials and persistent account ownership.

Phase 14 is complete.

### Next Phase

Phase 15 will add persistent player statistics, deployment, final documentation, and production polish.




