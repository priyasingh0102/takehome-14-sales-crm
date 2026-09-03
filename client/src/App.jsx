import { useState } from "react";
import {
  BrowserRouter, Routes, Route, Navigate, Link,
} from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box, Divider, Button,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import HandshakeIcon from "@mui/icons-material/Handshake";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

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
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar>
            <Typography variant="h6" fontWeight="bold">
              Sales CRM
            </Typography>
          </Toolbar>

          <Divider />

          <List>
            <ListItemButton component={Link} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>

              <ListItemText primary="Dashboard" />
            </ListItemButton>

            <ListItemButton component={Link} to="/companies">
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>

              <ListItemText primary="Companies" />
            </ListItemButton>

            <ListItemButton component={Link} to="/deals">
              <ListItemIcon>
                <HandshakeIcon />
              </ListItemIcon>

              <ListItemText primary="Deals" />
            </ListItemButton>

            <ListItemButton component={Link} to="/alerts">
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>

              <ListItemText primary="Alerts" />
            </ListItemButton>
          </List>

          <Box
            sx={{
              marginTop: "auto",
              p: 2,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          marginLeft: user ? "240px" : 0,
          minHeight: "100vh",
          backgroundColor: "#f5f6fa",
          padding: 3,
        }}
      >

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
      </Box>
    </BrowserRouter>
  );
}

export default App;