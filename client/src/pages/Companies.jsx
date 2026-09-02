import { useEffect, useState } from "react";

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
    <div>
      <h1>Companies</h1>

      <input
        type="text"
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        type="button"
        onClick={() => setShowArchived(false)}
      >
        Active Companies
      </button>

      <button
        type="button"
        onClick={() => setShowArchived(true)}
      >
        Archived Companies
      </button>

      {!showArchived && (
        <form onSubmit={handleCreateCompany}>
          <h2>Create Company</h2>

          <input
            type="text"
            placeholder="Company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <button type="submit">
            Create Company
          </button>
        </form>
      )}

      {message && <p>{message}</p>}

      {companies.length === 0 ? (
        <p>
          {showArchived
            ? "No archived companies found."
            : "No companies found."}
        </p>
      ) : (
        companies.map((company) => (
          <div key={company._id}>
            <h3>{company.name}</h3>

            <p>Industry: {company.industry}</p>

            <p>
              Website: {company.website || "N/A"}
            </p>

            {!showArchived ? (
              <>
                <button
                  type="button"
                  onClick={() => handleEdit(company)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleArchive(company)}
                >
                  Archive
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleRestore(company)}
              >
                Restore
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Companies;