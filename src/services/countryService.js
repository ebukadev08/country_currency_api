import axios from "axios";
import pool from "../db.js";

export async function refreshCountries() {
  try {
    const [countryRes, rateRes] = await Promise.all([
      axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"),
      axios.get("https://open.er-api.com/v6/latest/USD")
    ]);

    const countries = countryRes.data;
    const exchangeRates = rateRes.data.rates;
    const lastRefreshed = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const c of countries) {
      const name = c.name;
      const capital = c.capital || null;
      const region = c.region || null;
      const population = c.population || 0;
      const flag_url = c.flag || null;

      const currency = Array.isArray(c.currencies) && c.currencies.length > 0 ? c.currencies[0].code : null;
      const exchange_rate = currency && exchangeRates[currency] ? exchangeRates[currency] : null;
      const randomMultiplier = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
      const estimated_gdp = exchange_rate ? (population * randomMultiplier) / exchange_rate : 0;

      await pool.execute(`
        INSERT INTO countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          capital=VALUES(capital),
          region=VALUES(region),
          population=VALUES(population),
          currency_code=VALUES(currency_code),
          exchange_rate=VALUES(exchange_rate),
          estimated_gdp=VALUES(estimated_gdp),
          flag_url=VALUES(flag_url),
          last_refreshed_at=VALUES(last_refreshed_at)
      `, [name, capital, region, population, currency, exchange_rate, estimated_gdp, flag_url, lastRefreshed]);
    }

    return { message: "Countries refreshed successfully", last_refreshed_at: lastRefreshed };

  } catch (err) {
    console.error(err);
    throw new Error("External data source unavailable");
  }
}
