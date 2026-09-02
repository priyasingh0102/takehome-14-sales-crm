import { useEffect, useState } from "react";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/dashboard",
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
    return <p>{error}</p>;
  }

  if (!dashboard) {
    return <p>Loading dashboard...</p>;
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

  return (
    <div>
      <h1>Dashboard</h1>

      <h2>Summary</h2>

      <p>Open Deals: {dashboard.openDeals}</p>

      <p>Weighted Pipeline: {dashboard.weightedPipeline}</p>

      <p>Won This Month: {dashboard.wonThisMonth}</p>

      <p>Lost This Month: {dashboard.lostThisMonth}</p>

      <h2>Open Deals by Stage</h2>

      {openDealsByStage.length === 0 ? (
        <p>No open deals by stage.</p>
      ) : (
        openDealsByStage.map((item) => (
          <p key={item.stage}>
            {item.stage}: {item.count}
          </p>
        ))
      )}

      <h2>Open Deals by Owner</h2>

      {openDealsByOwner.length === 0 ? (
        <p>No open deals by owner.</p>
      ) : (
        openDealsByOwner.map((item) => (
          <p key={item.ownerId}>
            {item.ownerName}: {item.count}
          </p>
        ))
      )}

      <h2>Won Per Week — Last 8 Weeks</h2>

      {wonPerWeek.length === 0 ? (
        <p>No won deals in the last 8 weeks.</p>
      ) : (
        wonPerWeek.map((item) => (
          <p key={item.weekStart}>
            {new Date(item.weekStart).toLocaleDateString()} -{" "}
            {new Date(item.weekEnd).toLocaleDateString()}:{" "}
            {item.count}
          </p>
        ))
      )}
    </div>
  );
}

export default Dashboard;