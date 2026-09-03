import { useEffect, useState } from "react";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);

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
          `http://localhost:5000/api/deals?search=${encodeURIComponent(
            search
          )}&stage=${stage}&page=${page}`,
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
        setSelectedDeals([]);
      } catch (error) {
        setError("Unable to connect to server");
      }
    };

    fetchDeals();
  }, [search, stage, page]);

  // Reset page when search or stage filter changes
  useEffect(() => {
    setPage(1);
  }, [search, stage]);

  // Create Deal
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/deals", {
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
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create deal");
        return;
      }

      setDeals((prev) => [data.deal, ...prev]);

      setTitle("");
      setCompany("");
      setValue("");
      setExpectedCloseDate("");
      setDealStage("New");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Edit Deal
  const handleEdit = async (deal) => {
    const newTitle = prompt("Enter new deal title:", deal.title);

    if (!newTitle || newTitle === deal.title) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/deals/${deal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: newTitle,
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
        `http://localhost:5000/api/deals/${dealId}`,
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

    const currentDeal = deals.find((deal) => deal._id === dealId);

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
        `http://localhost:5000/api/deals/${dealId}/stage`,
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
        `http://localhost:5000/api/deals/${dealId}/collaborators`,
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
        `http://localhost:5000/api/deals/${dealId}/collaborators`,
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
        .map((user) => `${user.name} (${user.email})`)
        .join("\n");

      alert(names || "No collaborators found");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // Remove Collaborator
  const handleRemoveCollaborator = async (dealId) => {
    const userId = prompt("Enter collaborator User ID to remove:");

    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/deals/${dealId}/collaborators/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to remove collaborator");
        return;
      }

      alert("Collaborator removed successfully");
    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  // View History
  const handleViewHistory = async (dealId) => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/deals/${dealId}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch deal history");
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
        "http://localhost:5000/api/deals/export/csv",
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
        `http://localhost:5000/api/deals/${dealId}/reopen`,
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
    const currentDealIds = deals.map((deal) => deal._id);

    const allSelected =
      currentDealIds.length > 0 &&
      currentDealIds.every((id) =>
        selectedDeals.includes(id)
      );

    if (allSelected) {
      setSelectedDeals((prev) =>
        prev.filter((id) => !currentDealIds.includes(id))
      );
    } else {
      setSelectedDeals((prev) => [
        ...new Set([...prev, ...currentDealIds]),
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
        "http://localhost:5000/api/deals/bulk/reassign",
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
        setError(data.message || "Bulk reassignment failed");
        return;
      }

      const resultsText = (data.results || [])
        .map(
          (result) =>
            `${result.dealId}: ${
              result.success ? "Success" : "Rejected"
            } - ${result.message}`
        )
        .join("\n");

      alert(
        `Bulk reassignment completed.\n\n${resultsText}`
      );

      setSelectedDeals([]);

      const refreshResponse = await fetch(
        `http://localhost:5000/api/deals?search=${encodeURIComponent(
          search
        )}&stage=${stage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        setDeals(refreshData.deals || []);
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
      "http://localhost:5000/api/deals/bulk/advance",
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
      setError(data.message || "Bulk advancement failed");
      return;
    }

    const resultsText = (data.results || [])
      .map(
        (result) =>
          `${result.dealId}: ${
            result.success ? "Success" : "Rejected"
          } - ${result.message}`
      )
      .join("\n");

    alert(
      `Bulk advancement completed.\n\n${resultsText}`
    );

    setSelectedDeals([]);

    const refreshResponse = await fetch(
      `http://localhost:5000/api/deals?search=${encodeURIComponent(
        search
      )}&stage=${stage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const refreshData = await refreshResponse.json();

    if (refreshResponse.ok) {
      setDeals(refreshData.deals || []);
    }
  } catch (error) {
    setError("Unable to connect to server");
  }
};


  if (error) {
    return <p>{error}</p>;
  }

  const allCurrentDealsSelected =
    deals.length > 0 &&
    deals.every((deal) =>
      selectedDeals.includes(deal._id)
    );

  return (
    <div>
      <h1>Deals</h1>

      <button type="button" onClick={handleExportCsv}>
        Export Open Deals CSV
      </button>

      {user?.role === "sales_manager" && (
        <div>
          <button
            type="button"
            onClick={handleBulkReassign}
            disabled={selectedDeals.length === 0}
          >
            Bulk Reassign
          </button>
          <button
            type="button"
            onClick={handleBulkAdvance}
            disabled={selectedDeals.length === 0}
          >
  Bulk Advance
</button>

          <span>
            {" "}
            {selectedDeals.length} deal(s) selected
          </span>
        </div>
      )}

      <h2>Create Deal</h2>

      <form onSubmit={handleCreateDeal}>
        <input
          type="text"
          placeholder="Deal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Company ID"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Deal value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />

        <input
          type="date"
          value={expectedCloseDate}
          onChange={(e) =>
            setExpectedCloseDate(e.target.value)
          }
          required
        />

        <select
          value={dealStage}
          onChange={(e) => setDealStage(e.target.value)}
        >
          <option value="New">New</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
        </select>

        <button type="submit">Create Deal</button>
      </form>

      <input
        type="text"
        placeholder="Search deals..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
      >
        <option value="">All Stages</option>
        <option value="New">New</option>
        <option value="Qualified">Qualified</option>
        <option value="Proposal">Proposal</option>
        <option value="Negotiation">Negotiation</option>
        <option value="Won">Won</option>
        <option value="Lost">Lost</option>
      </select>

      {deals.length > 0 && (
        <div>
          <label>
            <input
              type="checkbox"
              checked={allCurrentDealsSelected}
              onChange={handleSelectAll}
            />
            Select All
          </label>
        </div>
      )}

      {deals.length === 0 ? (
        <p>No deals found.</p>
      ) : (
        deals.map((deal) => (
          <div key={deal._id}>
            <input
              type="checkbox"
              checked={selectedDeals.includes(deal._id)}
              onChange={() =>
                handleSelectDeal(deal._id)
              }
            />

            <h3>{deal.title}</h3>

            <p>Company: {deal.company?.name}</p>

            <p>
              Owner:{" "}
              {deal.owner?.name ||
                deal.owner?.email ||
                "Unknown"}
            </p>

            <p>
              Value:{" "}
              {deal.value?.$numberDecimal || deal.value}
            </p>

            <button
              type="button"
              onClick={() => handleEdit(deal)}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(deal._id)}
            >
              Delete
            </button>

            {user?.role === "sales_manager" &&
              (deal.stage === "Won" ||
                deal.stage === "Lost") && (
                <button
                  type="button"
                  onClick={() =>
                    handleReopenDeal(deal._id)
                  }
                >
                  Reopen Deal
                </button>
              )}

            <select
              value={deal.stage}
              onChange={(e) =>
                handleStageChange(
                  deal._id,
                  e.target.value
                )
              }
            >
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <p>
              Expected Close Date:{" "}
              {new Date(
                deal.expectedCloseDate
              ).toLocaleDateString()}
            </p>

            <h4>Collaborators</h4>

            <button
              type="button"
              onClick={() =>
                handleAddCollaborator(deal._id)
              }
            >
              Add Collaborator
            </button>

            <button
              type="button"
              onClick={() =>
                handleViewCollaborators(deal._id)
              }
            >
              View Collaborators
            </button>

            <button
              type="button"
              onClick={() =>
                handleRemoveCollaborator(deal._id)
              }
            >
              Remove Collaborator
            </button>

            <h4>History</h4>

            <button
              type="button"
              onClick={() =>
                handleViewHistory(deal._id)
              }
            >
              View History
            </button>
          </div>
        ))
      )}

      <div>
        <button
          type="button"
          onClick={() =>
            setPage((prev) => Math.max(prev - 1, 1))
          }
          disabled={page === 1}
        >
          Previous
        </button>

        <span> Page {page} </span>

        <button
          type="button"
          onClick={() =>
            setPage((prev) => prev + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Deals;