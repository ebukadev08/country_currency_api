import express from "express";
import dotenv from "dotenv";
import countryRoutes from "./routes/countryRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/", countryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
