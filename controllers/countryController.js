import { db } from "../db.js";
import axios from "axios";
import fs from "fs";
import Jimp from "jimp";

const COUNTRIES_API =
  "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const RATES_API = "https://open.er-api.com/v6/latest/USD";

export const refreshCountries = async (req, res) => {
  try {
    console.log("🔄 Refreshing countries and exchange rates...");

    const [countriesRes, ratesRes] = await Promise.allSettled([
      axios.get(COUNTRIES_API, { timeout: 15000 }),
      axios.get(RATES_API, { timeout: 15000 }),
    ]);

    if (countriesRes.status !== "fulfilled" || countriesRes.value.status !== 200) {
      console.error("RestCountries API failed:", countriesRes.reason?.message);
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from RestCountries API",
      });
    }

    if (ratesRes.status !== "fulfilled" || ratesRes.value.status !== 200) {
      console.error("ExchangeRate API failed:", ratesRes.reason?.message);
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from Exchange Rate API",
      });
    }

    const countries = countriesRes.value.data;
    const rates = ratesRes.value.data?.rates || {};
    const now = new Date();

    for (const c of countries) {
      const name = c.name;
      const population = c.population || 0;
      const capital = c.capital || null;
      const region = c.region || null;
      const flag = c.flag || null;

      const currency = c.currencies?.[0]?.code || null;
      const exchange_rate = currency && rates[currency] ? rates[currency] : null;
      const randomFactor = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
      const estimated_gdp = exchange_rate
        ? (population * randomFactor) / exchange_rate
        : 0;

      await db.query(
        `INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           capital=VALUES(capital),
           region=VALUES(region),
           population=VALUES(population),
           currency_code=VALUES(currency_code),
           exchange_rate=VALUES(exchange_rate),
           estimated_gdp=VALUES(estimated_gdp),
           flag_url=VALUES(flag_url),
           last_refreshed_at=VALUES(last_refreshed_at)`,
        [
          name,
          capital,
          region,
          population,
          currency,
          exchange_rate,
          estimated_gdp,
          flag,
          now,
        ]
      );
    }

    await db.query("DELETE FROM meta");
    await db.query("INSERT INTO meta (last_refreshed_at) VALUES (?)", [now]);

    const [rows] = await db.query("SELECT * FROM countries");
    await generateSummaryImage(rows, now);

    console.log("Refresh successful at", now.toISOString());
    res.json({
      message: "Countries refreshed successfully",
      last_refreshed_at: now,
    });
  } catch (error) {
    console.error("Refresh failed:", error.message);
    res.status(503).json({
      error: "External data source unavailable",
      details: error.message || "Could not fetch data from external APIs",
    });
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
  const [rows] = await db.query(
    "SELECT * FROM countries WHERE LOWER(name)=LOWER(?)",
    [req.params.name]
  );
  if (!rows.length) return res.status(404).json({ error: "Country not found" });
  res.json(rows[0]);
};

export const deleteCountry = async (req, res) => {
  const [result] = await db.query(
    "DELETE FROM countries WHERE LOWER(name)=LOWER(?)",
    [req.params.name]
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ error: "Country not found" });
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
  const imagePath = process.cwd() + "/cache/summary.png";

  if (fs.existsSync(imagePath)) {
    return res.sendFile(imagePath);
  }
  const [countries] = await db.query("SELECT * FROM countries");
  if (countries.length > 0) {
    const [[meta]] = await db.query("SELECT * FROM meta LIMIT 1");
    await generateSummaryImage(countries, meta?.last_refreshed_at || new Date());
    return res.sendFile(imagePath);
  }

  res.status(404).json({ error: "Summary image not found" });
};


export async function generateSummaryImage(countries, timestamp) {
  const uniqueCountries = Array.from(
    new Map(countries.map(c => [c.name, c])).values()
  );

  const total = uniqueCountries.length;
  const top5 = uniqueCountries
    .filter((c) => c.estimated_gdp)
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);

  const image = await Jimp.create(800, 600, 0x000000ff);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

  await image.print(font, 20, 30, `Total Countries: ${total}`);
  await image.print(font, 20, 60, `Last Refresh: ${timestamp.toISOString()}`);
  await image.print(font, 20, 100, "Top 5 GDP Countries:");

  let y = 130;
  for (let i = 0; i < top5.length; i++) {
    const text = `${i + 1}. ${top5[i].name} - ${top5[i].estimated_gdp.toFixed(2)}`;
    await image.print(font, 20, y, text);
    y += 30;
  }

  fs.mkdirSync("cache", { recursive: true });
  await image.writeAsync("cache/summary.png");

  console.log("Summary image generated successfully: cache/summary.png");
}
