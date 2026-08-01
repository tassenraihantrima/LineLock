import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import LocalGamePage from "./pages/LocalGamePage";
import NotFoundPage from "./pages/NotFoundPage";
import OnlineGamePage from "./pages/OnlineGamePage";

function App() {
  return (
    <Routes>
      {/* The shared layout remains visible across every main page. */}
      <Route element={<AppLayout />}>
        {/* The index route renders at the root URL. */}
        <Route index element={<HomePage />} />

        {/* The complete local game now has its own URL. */}
        <Route
          path="local"
          element={<LocalGamePage />}
        />

        {/* Online multiplayer receives a dedicated future route. */}
        <Route
          path="online"
          element={<OnlineGamePage />}
        />

        {/* Any unrecognized URL displays the not-found page. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;