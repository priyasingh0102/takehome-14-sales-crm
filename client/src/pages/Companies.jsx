import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import LanguageIcon from "@mui/icons-material/Language";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const fetchCompanies = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/companies?search=${encodeURIComponent(
          search
        )}&archived=${showArchived}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch companies");
        return;
      }

      setCompanies(data.companies || []);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, showArchived]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/companies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            industry,
            website,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create company");
        return;
      }

      setMessage("Company created successfully");

      setName("");
      setIndustry("");
      setWebsite("");

      setCompanies((prev) => [data.company, ...prev]);
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const handleEdit = async (company) => {
    const newName = prompt(
      "Enter new company name:",
      company.name
    );

    if (!newName) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/companies/${company._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update company");
        return;
      }

      setCompanies((prev) =>
        prev.map((item) =>
          item._id === company._id ? data.company : item
        )
      );

      setMessage("Company updated successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const handleArchive = async (company) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/companies/${company._id}/archive`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to archive company");
        return;
      }

      setCompanies((prev) =>
        prev.filter((item) => item._id !== company._id)
      );

      setMessage("Company archived successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  const handleRestore = async (company) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/companies/${company._id}/restore`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to restore company");
        return;
      }

      setCompanies((prev) =>
        prev.filter((item) => item._id !== company._id)
      );

      setMessage("Company restored successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

   return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Companies
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage your customers and company accounts
          </Typography>
        </Box>
      </Box>

      {/* Search + Toggle */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant={!showArchived ? "contained" : "outlined"}
            onClick={() => setShowArchived(false)}
          >
            Active Companies
          </Button>

          <Button
            variant={showArchived ? "contained" : "outlined"}
            onClick={() => setShowArchived(true)}
          >
            Archived Companies
          </Button>
        </Box>
      </Paper>

      {/* Messages */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {/* Create Company */}
      {!showArchived && (
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
            <AddBusinessIcon />
            <Typography variant="h6" fontWeight="bold">
              Create Company
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleCreateCompany}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Industry"
                  value={industry}
                  onChange={(e) =>
                    setIndustry(e.target.value)
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Website"
                  value={website}
                  onChange={(e) =>
                    setWebsite(e.target.value)
                  }
                  placeholder="https://example.com"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddBusinessIcon />}
                >
                  Create Company
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Company List */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {showArchived
            ? "Archived Companies"
            : "Active Companies"}
        </Typography>
      </Box>

      {companies.length === 0 ? (
        <Paper
          elevation={1}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            {showArchived
              ? "No archived companies found."
              : "No companies found."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={company._id}
            >
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      {company.name}
                    </Typography>

                    <Chip
                      label={
                        showArchived ? "Archived" : "Active"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Industry:</strong>{" "}
                    {company.industry}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <LanguageIcon
                      fontSize="small"
                      color="action"
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {company.website || "No website"}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {!showArchived ? (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(company)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<ArchiveIcon />}
                        onClick={() =>
                          handleArchive(company)
                        }
                      >
                        Archive
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<RestoreIcon />}
                      onClick={() => handleRestore(company)}
                    >
                      Restore
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Companies;