import API_URL from "../api";
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert as MuiAlert,
  Divider,
} from "@mui/material";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DismissIcon from "@mui/icons-material/CheckCircle";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deal-alerts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch alerts");
        return;
      }

      setAlerts(data.alerts || []);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDismiss = async (alertId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/deal-alerts/${alertId}/dismiss`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to dismiss alert");
        return;
      }

      setAlerts((prev) =>
        prev.filter((alert) => alert._id !== alertId)
      );
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Alerts
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Stay updated on deals that need your attention
        </Typography>
      </Box>

      {/* Error */}
      {error && (
        <MuiAlert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </MuiAlert>
      )}

      {/* Alerts */}
      {alerts.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <NotificationsActiveIcon
            sx={{ fontSize: 50, mb: 2 }}
          />

          <Typography variant="h6" fontWeight="bold">
            No active alerts
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            You don't have any deal alerts right now.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {alerts.map((alert) => (
            <Paper
              key={alert._id}
              elevation={2}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 3,
                borderLeft: "5px solid",
                borderColor: "warning.main",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <NotificationsActiveIcon color="warning" />

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      {alert.deal?.title}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.7,
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" />

                      <Typography variant="body2">
                        <strong>Expected Close:</strong>{" "}
                        {alert.deal?.expectedCloseDate
                          ? new Date(
                              alert.deal.expectedCloseDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </Box>

                    <Chip
                      label={
                        alert.deal?.stage || "Unknown"
                      }
                      size="small"
                    />
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<DismissIcon />}
                  onClick={() =>
                    handleDismiss(alert._id)
                  }
                >
                  Dismiss
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Alerts;