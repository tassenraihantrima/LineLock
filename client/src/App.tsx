import {
  Route,
  Routes,
} from "react-router";

import RequireAuth from "./auth/RequireAuth";
import AppLayout from "./components/AppLayout";

import AccountPage from "./pages/AccountPage.tsx";
import HomePage from "./pages/HomePage";
import LocalGamePage from "./pages/LocalGamePage";
import LoginPage from "./pages/LoginPage.tsx";
import NotFoundPage from "./pages/NotFoundPage";
import OnlineGamePage from "./pages/OnlineGamePage";
import RegisterPage from "./pages/RegisterPage.tsx";

function App() {
  return (
    <Routes>
      {/* The shared layout remains visible across every main page. */}
      <Route element={<AppLayout />}>
        {/* The index route renders at the root URL. */}
        <Route
          index
          element={<HomePage />}
        />

        {/* Local gameplay remains available without an account. */}
        <Route
          path="local"
          element={<LocalGamePage />}
        />

        {/* Online multiplayer requires an authenticated account. */}
        <Route
          path="online"
          element={
            <RequireAuth>
              <OnlineGamePage />
            </RequireAuth>
          }
        />

        {/* Allow new players to create a persistent account. */}
        <Route
          path="register"
          element={<RegisterPage />}
        />

        {/* Allow existing players to sign in. */}
        <Route
          path="login"
          element={<LoginPage />}
        />

        {/* The account page displays profile information and statistics. */}
        <Route
          path="account"
          element={<AccountPage />}
        />

        {/* Any unrecognized URL displays the not-found page. */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;