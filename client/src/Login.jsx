import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store JWT
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Send user information to App
      onLogin(data);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f6fa",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Sales CRM
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Sign in to manage your sales pipeline
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
        >
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;