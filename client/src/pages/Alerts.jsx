import { useEffect, useState } from "react";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/deal-alerts",
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
        `http://localhost:5000/api/deal-alerts/${alertId}/dismiss`,
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

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Alerts</h1>

      {alerts.length === 0 ? (
        <p>No active alerts.</p>
      ) : (
        alerts.map((alert) => (
          <div key={alert._id}>
            <h3>{alert.deal?.title}</h3>

            <p>
              Expected Close Date:{" "}
              {alert.deal?.expectedCloseDate
                ? new Date(
                    alert.deal.expectedCloseDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>

            <p>Stage: {alert.deal?.stage}</p>

            <button
              type="button"
              onClick={() => handleDismiss(alert._id)}
            >
              Dismiss
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Alerts;