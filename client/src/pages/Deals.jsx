import API_URL from "../api";
import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, TextField, Button, Grid, Card, CardContent, CardActions, Chip, Alert,MenuItem, FormControl, InputLabel, Select, Checkbox, FormControlLabel, Divider, InputAdornment, Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HistoryIcon from "@mui/icons-material/History";
import RestoreIcon from "@mui/icons-material/Restore";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [companies, setCompanies] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [selectedDeals, setSelectedDeals] = useState([]);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [dealStage, setDealStage] = useState("New");

  // Fetch deals
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/deals?search=${encodeURIComponent(
            search
          )}&stage=${stage}&company=${companyFilter}&owner=${ownerFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=6`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch deals");
          return;
        }

        setDeals(data.deals || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setSelectedDeals([]);

      } catch (error) {
        setError("Unable to connect to server");
      }
    };

    fetchDeals();
  }, [search, stage, page, companyFilter, ownerFilter, sortBy, sortOrder]);

  // Fetch companies and sales reps for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [companiesResponse, usersResponse] = await Promise.all([
          fetch(`${API_URL}/api/companies`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const companiesData = await companiesResponse.json();
        const usersData = await usersResponse.json();

        if (companiesResponse.ok) {
          setCompanies(companiesData.companies || []);
        }

        if (usersResponse.ok) {
          setSalesReps(
            (usersData.users || []).filter(
              (user) => user.role === "sales_rep"
            )
          );
        }
      } catch (error) {
        console.error("Failed to load filter data");
      }
    };

    fetchFilterData();
  }, []);

  // Reset page when search or stage filter changes
  useEffect(() => {
    setPage(1);
  }, [search, stage, companyFilter, ownerFilter, sortBy, sortOrder]);

  // Create Deal
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/deals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title,
            company,
            value,
            expectedCloseDate,
            stage: dealStage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create deal");
        return;
      }

      setTitle("");
      setCompany("");
      setValue("");
      setExpectedCloseDate("");
      setDealStage("New");

      setPage(1);

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Edit Deal
  const handleEdit = async (deal) => {
    const newTitle = prompt(
      "Enter new deal title:",
      deal.title
    );

    if (!newTitle) {
      return;
    }

    const newValue = prompt(
      "Enter new deal value:",
      deal.value?.$numberDecimal || deal.value || ""
    );

    if (!newValue) {
      return;
    }

    const newDate = prompt(
      "Enter expected close date (YYYY-MM-DD):",
      deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    if (!newDate) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/${deal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: newTitle,
            value: newValue,
            expectedCloseDate: newDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update deal");
        return;
      }

      setDeals((prev) =>
        prev.map((item) =>
          item._id === deal._id ? data.deal : item
        )
      );
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Delete Deal
  const handleDelete = async (dealId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/deals/${dealId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete deal");
        return;
      }

      setDeals((prev) =>
        prev.filter((deal) => deal._id !== dealId)
      );

      setSelectedDeals((prev) =>
        prev.filter((id) => id !== dealId)
      );
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Change Deal Stage
  const handleStageChange = async (dealId, newStage) => {
    const stages = [
      "New",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ];

    const currentDeal = deals.find(
      (deal) => deal._id === dealId
    );

    let reason = "";

    if (
      currentDeal &&
      stages.indexOf(newStage) < stages.indexOf(currentDeal.stage)
    ) {
      reason = prompt(
        "Enter reason for moving the deal backward:"
      );

      if (!reason) {
        return;
      }
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/stage`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            stage: newStage,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update stage");
        return;
      }

      setDeals((prev) =>
        prev.map((deal) =>
          deal._id === dealId ? data.deal : deal
        )
      );
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Add Collaborator
  const handleAddCollaborator = async (dealId) => {
    const userId = prompt("Enter collaborator User ID:");

    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/collaborators`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add collaborator");
        return;
      }

      alert("Collaborator added successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // View Collaborators
  const handleViewCollaborators = async (dealId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/collaborators`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch collaborators");
        return;
      }

      const names = data.collaborators
        .map(
          (user) => `${user.name} (${user.email})`
        )
        .join("\n");

      alert(names || "No collaborators found");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Remove Collaborator
  const handleRemoveCollaborator = async (dealId) => {
    const userId = prompt(
      "Enter collaborator User ID to remove:"
    );

    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/collaborators/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to remove collaborator"
        );
        return;
      }

      alert("Collaborator removed successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Add Deal Note
  const handleAddNote = async (dealId) => {
    const note = prompt("Enter a note for this deal:");

    if (!note) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add note");
        return;
      }

      alert("Note added successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // View History
  const handleViewHistory = async (dealId) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch deal history"
        );
        return;
      }

      const history = data.history || [];

      if (history.length === 0) {
        alert("No history found for this deal");
        return;
      }

      const historyText = history
        .map((item) => {
          const type = item.type || "History";
          const oldStage = item.oldStage || "-";
          const newStage = item.newStage || "-";
          const reason = item.reason || "-";

          const performedBy =
            item.performedBy?.name ||
            item.performedBy?.email ||
            "Unknown user";

          return `${type}
Old Stage: ${oldStage}
New Stage: ${newStage}
Reason: ${reason}
Performed By: ${performedBy}`;
        })
        .join("\n\n--------------------\n\n");

      alert(historyText);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/deals/export/csv`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to export CSV");
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "open-deals.csv";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Reassign Deal Owner
  const handleReassignDeal = async (dealId) => {
    const newOwnerId = prompt(
      "Enter the User ID of the new deal owner:"
    );

    if (!newOwnerId) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/reassign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            newOwnerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reassign deal");
        return;
      }

      setDeals((prev) =>
        prev.map((deal) =>
          deal._id === dealId ? data.deal : deal
        )
      );
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Reopen Deal
  const handleReopenDeal = async (dealId) => {
    const newStage = prompt(
      "Enter stage to reopen the deal to:\nNew, Qualified, Proposal, Negotiation"
    );

    if (!newStage) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/${dealId}/reopen`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            stage: newStage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reopen deal");
        return;
      }

      setDeals((prev) =>
        prev.map((deal) =>
          deal._id === dealId ? data.deal : deal
        )
      );
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Select / Unselect Deal
  const handleSelectDeal = (dealId) => {
    setSelectedDeals((prev) => {
      if (prev.includes(dealId)) {
        return prev.filter((id) => id !== dealId);
      }

      return [...prev, dealId];
    });
  };

  // Select / Unselect All Deals on Current Page
  const handleSelectAll = () => {
    const currentDealIds = deals.map(
      (deal) => deal._id
    );

    const allSelected =
      currentDealIds.length > 0 &&
      currentDealIds.every((id) =>
        selectedDeals.includes(id)
      );

    if (allSelected) {
      setSelectedDeals((prev) =>
        prev.filter(
          (id) => !currentDealIds.includes(id)
        )
      );
    } else {
      setSelectedDeals((prev) => [
        ...new Set([
          ...prev,
          ...currentDealIds,
        ]),
      ]);
    }
  };

  // Bulk Reassign Deals
  const handleBulkReassign = async () => {
    if (selectedDeals.length === 0) {
      alert("Please select at least one deal");
      return;
    }

    const newOwnerId = prompt(
      "Enter the User ID of the new deal owner:"
    );

    if (!newOwnerId) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/bulk/reassign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            dealIds: selectedDeals,
            newOwnerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Bulk reassignment failed"
        );
        return;
      }

      const resultsText = (data.results || [])
        .map(
          (result) =>
            `${result.dealId}: ${
              result.success
                ? "Success"
                : "Rejected"
            } - ${result.message}`
        )
        .join("\n");

      alert(
        `Bulk reassignment completed.\n\n${resultsText}`
      );

      setSelectedDeals([]);

      const refreshResponse = await fetch(
        `${API_URL}/api/deals?search=${encodeURIComponent(
          search
        )}&stage=${stage}&company=${companyFilter}&owner=${ownerFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const refreshData =
        await refreshResponse.json();

      if (refreshResponse.ok) {
        setDeals(refreshData.deals || []);
        setTotal(refreshData.pagination?.total || 0);
        setTotalPages(refreshData.pagination?.totalPages || 1);
      }
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Bulk Advance Deals
  const handleBulkAdvance = async () => {
    if (selectedDeals.length === 0) {
      alert("Please select at least one deal");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/deals/bulk/advance`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            dealIds: selectedDeals,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Bulk advancement failed"
        );
        return;
      }

      const resultsText = (data.results || [])
        .map(
          (result) =>
            `${result.dealId}: ${
              result.success
                ? "Success"
                : "Rejected"
            } - ${result.message}`
        )
        .join("\n");

      alert(
        `Bulk advancement completed.\n\n${resultsText}`
      );

      setSelectedDeals([]);

      const refreshResponse = await fetch(
        `${API_URL}/api/deals?search=${encodeURIComponent(
          search
        )}&stage=${stage}&company=${companyFilter}&owner=${ownerFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const refreshData =
        await refreshResponse.json();

      if (refreshResponse.ok) {
        setDeals(refreshData.deals || []);
        setTotal(refreshData.pagination?.total || 0);
        setTotalPages(refreshData.pagination?.totalPages || 1);
      }
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const allCurrentDealsSelected =
    deals.length > 0 &&
    deals.every((deal) =>
      selectedDeals.includes(deal._id)
    );

  const getStageColor = (dealStage) => {
    switch (dealStage) {
      case "Qualified":
        return "info";
      case "Proposal":
        return "warning";
      case "Negotiation":
        return "secondary";
      case "Won":
        return "success";
      case "Lost":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Deals
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage your sales pipeline and deals
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCsv}
        >
          Export Open Deals CSV
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Manager Bulk Actions */}
      {user?.role === "sales_manager" && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography
              fontWeight="bold"
              sx={{ mr: 1 }}
            >
              Bulk Actions
            </Typography>

            <Button
              variant="outlined"
              startIcon={<SwapHorizIcon />}
              onClick={handleBulkReassign}
              disabled={selectedDeals.length === 0}
            >
              Bulk Reassign
            </Button>

            <Button
              variant="contained"
              startIcon={<ArrowForwardIcon />}
              onClick={handleBulkAdvance}
              disabled={selectedDeals.length === 0}
            >
              Bulk Advance
            </Button>

            <Chip
              label={`${selectedDeals.length} selected`}
              size="small"
            />
          </Stack>
        </Paper>
      )}

      {/* Create Deal */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <AddIcon />
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Create Deal
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleCreateDeal}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Deal Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Company</InputLabel>

                <Select
                  value={company}
                  label="Company"
                  onChange={(e) => setCompany(e.target.value)}
                  required
                >
                  <MenuItem value="">
                    Select Company
                  </MenuItem>

                  {companies.map((companyItem) => (
                    <MenuItem
                      key={companyItem._id}
                      value={companyItem._id}
                    >
                      {companyItem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Deal Value"
                type="number"
                value={value}
                onChange={(e) =>
                  setValue(e.target.value)
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      $
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Expected Close Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.8 }}
              >
                Expected Close Date
              </Typography>

              <TextField
                fullWidth
                type="date"
                value={expectedCloseDate}
                onChange={(e) =>
                  setExpectedCloseDate(
                    e.target.value
                  )
                }
                required
              />
            </Grid>

            {/* Stage */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>
                  Stage
                </InputLabel>

                <Select
                  value={dealStage}
                  label="Stage"
                  onChange={(e) =>
                    setDealStage(e.target.value)
                  }
                >
                  <MenuItem value="New">
                    New
                  </MenuItem>

                  <MenuItem value="Qualified">
                    Qualified
                  </MenuItem>

                  <MenuItem value="Proposal">
                    Proposal
                  </MenuItem>

                  <MenuItem value="Negotiation">
                    Negotiation
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Create Deal
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Search and Filters */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search deals..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>
                Filter by Stage
              </InputLabel>

              <Select
                value={stage}
                label="Filter by Stage"
                onChange={(e) =>
                  setStage(e.target.value)
                }
              >
                <MenuItem value="">
                  All Stages
                </MenuItem>

                <MenuItem value="New">
                  New
                </MenuItem>

                <MenuItem value="Qualified">
                  Qualified
                </MenuItem>

                <MenuItem value="Proposal">
                  Proposal
                </MenuItem>

                <MenuItem value="Negotiation">
                  Negotiation
                </MenuItem>

                <MenuItem value="Won">
                  Won
                </MenuItem>

                <MenuItem value="Lost">
                  Lost
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Company</InputLabel>

              <Select
                value={companyFilter}
                label="Filter by Company"
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <MenuItem value="">All Companies</MenuItem>

                {companies.map((companyItem) => (
                  <MenuItem
                    key={companyItem._id}
                    value={companyItem._id}
                  >
                    {companyItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Owner</InputLabel>

              <Select
                value={ownerFilter}
                label="Filter by Owner"
                onChange={(e) => setOwnerFilter(e.target.value)}
              >
                <MenuItem value="">All Owners</MenuItem>

                {salesReps.map((rep) => (
                  <MenuItem key={rep._id} value={rep._id}>
                    {rep.name || rep.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>

              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="">Newest</MenuItem>
                <MenuItem value="value">Deal Value</MenuItem>
                <MenuItem value="expectedCloseDate">
                  Expected Close Date
                </MenuItem>
                <MenuItem value="updatedAt">Last Updated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>

              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Select All */}
      {deals.length > 0 && (
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1,
            mb: 2,
            borderRadius: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={allCurrentDealsSelected}
                onChange={handleSelectAll}
              />
            }
            label="Select All Deals on Current Page"
          />
        </Paper>
      )}

      {/* Deal List */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center",}}>
        <Typography
          variant="h6"
          fontWeight="bold"
        >
          Deal List
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {total} total deals
        </Typography>
      </Box>

      {deals.length === 0 ? (
        <Paper
          elevation={1}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            No deals found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {deals.map((deal) => (
            <Grid
              size={{ xs: 12, md: 6 }}
              key={deal._id}
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
                      alignItems: "flex-start",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={selectedDeals.includes(
                          deal._id
                        )}
                        onChange={() =>
                          handleSelectDeal(
                            deal._id
                          )
                        }
                      />

                      <Typography
                        variant="h6"
                        fontWeight="bold"
                      >
                        {deal.title}
                      </Typography>
                    </Box>

                    <Chip
                      label={deal.stage}
                      color={getStageColor(
                        deal.stage
                      )}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.2}>
                    <Typography variant="body2">
                      <strong>Company:</strong>{" "}
                      {deal.company?.name ||
                        "Unauthorized"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Owner:</strong>{" "}
                      {deal.owner?.name ||
                        deal.owner?.email ||
                        "Unknown"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Value:</strong>{" "}
                      $
                      {deal.value?.$numberDecimal ||
                        deal.value ||
                        "0"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Expected Close:</strong>{" "}
                      {deal.expectedCloseDate
                        ? new Date(
                            deal.expectedCloseDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Stack>

                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ mt: 3 }}
                    disabled={deal.stage === "Won" || deal.stage === "Lost"}
                  >
                    <InputLabel>
                      Deal Stage
                    </InputLabel>

                    <Select
                      value={deal.stage}
                      label="Deal Stage"
                      onChange={(e) =>
                        handleStageChange(
                          deal._id,
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="New">
                        New
                      </MenuItem>

                      <MenuItem value="Qualified">
                        Qualified
                      </MenuItem>

                      <MenuItem value="Proposal">
                        Proposal
                      </MenuItem>

                      <MenuItem value="Negotiation">
                        Negotiation
                      </MenuItem>

                      <MenuItem value="Won">
                        Won
                      </MenuItem>

                      <MenuItem value="Lost">
                        Lost
                      </MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>

                <CardActions
                  sx={{
                    p: 2,
                    pt: 0,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() =>
                      handleEdit(deal)
                    }
                  >
                    Edit
                  </Button>

                  {user?.role === "sales_manager" && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SwapHorizIcon />}
                      onClick={() => handleReassignDeal(deal._id)}
                    >
                      Reassign Owner
                    </Button>
                  )}

                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() =>
                      handleDelete(deal._id)
                    }
                  >
                    Delete
                  </Button>

                  {user?.role ===
                    "sales_manager" &&
                    (deal.stage === "Won" ||
                      deal.stage === "Lost") && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          <RestoreIcon />
                        }
                        onClick={() =>
                          handleReopenDeal(
                            deal._id
                          )
                        }
                      >
                        Reopen
                      </Button>
                    )}

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <GroupAddIcon />
                    }
                    onClick={() =>
                      handleAddCollaborator(
                        deal._id
                      )
                    }
                  >
                    Add
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      handleViewCollaborators(
                        deal._id
                      )
                    }
                  >
                    View Team
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      handleRemoveCollaborator(
                        deal._id
                      )
                    }
                  >
                    Remove
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <HistoryIcon />
                    }
                    onClick={() =>
                      handleViewHistory(
                        deal._id
                      )
                    }
                  >
                    History
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      handleAddNote(deal._id)
                    }
                  >
                    Add Note
                  </Button>


                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Paper
          elevation={1}
          sx={{
            mt: 4,
            p: 2,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                setPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              disabled={page === 1}
            >
              Previous
            </Button>

            <Typography fontWeight="500">
              Page {page} of {totalPages}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Showing {deals.length} of {total} deals
            </Typography>

            <Button
              variant="outlined"
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default Deals;