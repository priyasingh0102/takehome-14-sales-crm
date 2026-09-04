import API_URL from "../api";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Divider,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CancelIcon from "@mui/icons-material/Cancel";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const response = await fetch(
          `${API_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch dashboard");
          return;
        }

        setDashboard(data);
      } catch (error) {
        setError("Unable to connect to server");
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const openDealsByStage = Object.entries(
    dashboard.openDealsByStage || {}
  ).map(([stage, count]) => ({
    stage,
    count,
  }));

  const openDealsByOwner = Array.isArray(
    dashboard.openDealsByOwner
  )
    ? dashboard.openDealsByOwner
    : [];

  const wonPerWeek = Array.isArray(dashboard.wonPerWeek)
    ? dashboard.wonPerWeek
    : [];

  const summaryCards = [
    {
      title: "Open Deals",
      value: dashboard.openDeals,
      icon: <BusinessCenterIcon fontSize="large" />,
    },
    {
      title: "Weighted Pipeline",
      value: `$${Number(
        dashboard.weightedPipeline || 0
      ).toLocaleString()}`,
      icon: <TrendingUpIcon fontSize="large" />,
    },
    {
      title: "Won This Month",
      value: dashboard.wonThisMonth,
      icon: <EmojiEventsIcon fontSize="large" />,
    },
    {
      title: "Lost This Month",
      value: dashboard.lostThisMonth,
      icon: <CancelIcon fontSize="large" />,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Overview of your sales pipeline and performance
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        {summaryCards.map((card) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            key={card.title}
          >
            <Card
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {card.title}
                  </Typography>

                  {card.icon}
                </Box>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stage and Owner */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        {/* Open Deals by Stage */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              minHeight: 300,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Open Deals by Stage
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {openDealsByStage.length === 0 ? (
              <Typography color="text.secondary">
                No open deals by stage.
              </Typography>
            ) : (
              openDealsByStage.map((item) => (
                <Box
                  key={item.stage}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                  }}
                >
                  <Typography>
                    {item.stage}
                  </Typography>

                  <Chip
                    label={item.count}
                    size="small"
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Open Deals by Owner */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              minHeight: 300,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Open Deals by Owner
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {openDealsByOwner.length === 0 ? (
              <Typography color="text.secondary">
                No open deals by owner.
              </Typography>
            ) : (
              openDealsByOwner.map((item) => (
                <Box
                  key={item.ownerId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                  }}
                >
                  <Box>
                    <Typography fontWeight="500">
                      {item.ownerName}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {item.ownerEmail}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${item.count} deal${
                      item.count !== 1 ? "s" : ""
                    }`}
                    size="small"
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Won Deals - Last 8 Weeks */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Won Deals — Last 8 Weeks
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {wonPerWeek.length === 0 ? (
              <Typography color="text.secondary">
                No won deals in the last 8 weeks.
              </Typography>
            ) : (
              <Box>
                {wonPerWeek.map((item) => (
                  <Box
                    key={item.weekStart}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1.5,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Typography>
                      {new Date(
                        item.weekStart
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        item.weekEnd
                      ).toLocaleDateString()}
                    </Typography>

                    <Chip
                      label={`${item.count} won`}
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;