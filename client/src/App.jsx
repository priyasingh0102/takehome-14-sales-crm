import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Deals from "./pages/Deals";
import Alerts from "./pages/Alerts";

import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { loggedIn: true } : null;
  });

  const handleLogin = (data) => {
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user && (
        <nav>
          <Link to="/dashboard">Dashboard</Link>{" "}
          <Link to="/companies">Companies</Link>{" "}
          <Link to="/deals">Deals</Link>{" "}
          <Link to="/alerts">Alerts</Link>{" "}
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      )}

      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? <Dashboard /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/companies"
          element={
            user ? <Companies /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/deals"
          element={
            user ? <Deals /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/alerts"
          element={
            user ? <Alerts /> : <Navigate to="/login" />
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={user ? "/dashboard" : "/login"} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;