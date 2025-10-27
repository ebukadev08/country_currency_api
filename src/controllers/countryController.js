import { db } from "../db.js";
import fs from "fs";
import { fetchCountriesAndRates } from "../utils/fetchData.js";
import { generateSummaryImage } from "../utils/generateImage.js";

export const refreshCountries = async (req, res) => {
  try {
    const { countries, rates } = await fetchCountriesAndRates();
    const now = new Date();

    for (const c of countries) {
      const name = c.name;
      const population = c.population || 0;
      const currency = c.currencies?.[0]?.code || null;
      const exchangeRate = currency && rates[currency] ? rates[currency] : null;
      const randomFactor = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
      const estimated_gdp = exchangeRate
        ? (population * randomFactor) / exchangeRate
        : 0;

      await db.query(
        `INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         capital=VALUES(capital), region=VALUES(region), population=VALUES(population),
         currency_code=VALUES(currency_code), exchange_rate=VALUES(exchange_rate),
         estimated_gdp=VALUES(estimated_gdp), flag_url=VALUES(flag_url),
         last_refreshed_at=VALUES(last_refreshed_at)`,
        [name, c.capital, c.region, population, currency, exchangeRate, estimated_gdp, c.flag, now]
      );
    }

    await db.query("DELETE FROM meta");
    await db.query("INSERT INTO meta (last_refreshed_at) VALUES (?)", [now]);

    const [rows] = await db.query("SELECT * FROM countries");
    await generateSummaryImage(rows, now.toISOString());

    res.json({ message: "Countries refreshed successfully", last_refreshed_at: now });
  } catch (err) {
    res.status(503).json({ error: "External data source unavailable" });
  }
};

export const getCountries = async (req, res) => {
  let query = "SELECT * FROM countries WHERE 1=1";
  const params = [];

  if (req.query.region) {
    query += " AND region = ?";
    params.push(req.query.region);
  }
  if (req.query.currency) {
    query += " AND currency_code = ?";
    params.push(req.query.currency);
  }
  if (req.query.sort === "gdp_desc") {
    query += " ORDER BY estimated_gdp DESC";
  }

  const [rows] = await db.query(query, params);
  res.json(rows);
};

export const getCountry = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM countries WHERE LOWER(name)=LOWER(?)", [req.params.name]);
  if (!rows.length) return res.status(404).json({ error: "Country not found" });
  res.json(rows[0]);
};

export const deleteCountry = async (req, res) => {
  const [result] = await db.query("DELETE FROM countries WHERE LOWER(name)=LOWER(?)", [req.params.name]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "Country not found" });
  res.json({ message: "Country deleted" });
};

export const getStatus = async (req, res) => {
  const [[count]] = await db.query("SELECT COUNT(*) AS total FROM countries");
  const [[meta]] = await db.query("SELECT * FROM meta LIMIT 1");
  res.json({
    total_countries: count.total,
    last_refreshed_at: meta?.last_refreshed_at || null,
  });
};

export const getSummaryImage = async (req, res) => {
  if (fs.existsSync("cache/summary.png")) {
    res.sendFile(process.cwd() + "/cache/summary.png");
  } else {
    res.status(404).json({ error: "Summary image not found" });
  }
};
