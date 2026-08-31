import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import dealAlertRoutes from "./routes/dealAlertRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/deal-alerts", dealAlertRoutes);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Sales CRM API is running",
  });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});