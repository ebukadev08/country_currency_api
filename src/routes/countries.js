import express from "express";
import pool from "../db.js";
import { refreshCountries } from "../services/countryService.js";
import fs from "fs";
import path from "path";
import { generateSummaryImage } from "../services/imageService.js";

const router = express.Router();

router.post("/refresh", async (req, res) => {
  try {
    const result = await refreshCountries();
    await generateSummaryImage();
    res.json(result);
  } catch (error) {
    res.status(503).json({ error: "External data source unavailable" });
  }
});

router.get("/", async (req, res) => {
  const { region, currency, sort } = req.query;
  let sql = "SELECT * FROM countries WHERE 1=1";
  const params = [];

  if (region) {
    sql += " AND region = ?";
    params.push(region);
  }
  if (currency) {
    sql += " AND currency_code = ?";
    params.push(currency);
  }
  if (sort === "gdp_desc") {
    sql += " ORDER BY estimated_gdp DESC";
  }

  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

router.get("/:name", async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM countries WHERE LOWER(name)=LOWER(?)", [req.params.name]);
  if (rows.length === 0) return res.status(404).json({ error: "Country not found" });
  res.json(rows[0]);
});

router.delete("/:name", async (req, res) => {
  const [rows] = await pool.execute("DELETE FROM countries WHERE LOWER(name)=LOWER(?)", [req.params.name]);
  if (rows.affectedRows === 0) return res.status(404).json({ error: "Country not found" });
  res.json({ message: "Country deleted successfully" });
});

router.get("/image", async (req, res) => {
  const imagePath = path.join("cache", "summary.png");
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Summary image not found" });
  }
  res.sendFile(path.resolve(imagePath));
});

export default router;
