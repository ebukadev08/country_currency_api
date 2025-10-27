import express from "express";
import dotenv from "dotenv";
import countryRoutes from "./routes/countryRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/", countryRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
