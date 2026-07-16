import { Routes, Route } from "react-router-dom";

import Auth from "./components/Auth/Auth";
import Dashboard from "./pages/Dashboard";
import Vault from "./pages/Vault";
import Generator from "./pages/Generator";
import SecureNotes from "./pages/SecureNotes";
import Activity from "./pages/Activity";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vault"
        element={
          <ProtectedRoute>
            <Vault />
          </ProtectedRoute>
        }
      />

      <Route
        path="/secure-notes"
        element={
          <ProtectedRoute>
            <SecureNotes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/generator"
        element={
          <ProtectedRoute>
            <Generator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <Activity />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default App;