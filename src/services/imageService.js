import nodeHtmlToImage from "node-html-to-image";
import pool from "../db.js";
import fs from "fs";

export async function generateSummaryImage() {
  const [rows] = await pool.execute("SELECT * FROM countries ORDER BY estimated_gdp DESC LIMIT 5");
  const [countRows] = await pool.execute("SELECT COUNT(*) as total FROM countries");
  const totalCountries = countRows[0].total;
  const lastRefreshed = new Date().toISOString();

  const html = `
    <html>
      <body style="font-family: Arial; background: #fff; padding: 20px;">
        <h2>Total Countries: ${totalCountries}</h2>
        <p>Last Refresh: ${lastRefreshed}</p>
        <h3>Top 5 by GDP:</h3>
        <ul>
          ${rows.map((c, i) => `<li>${i + 1}. ${c.name} - ${c.estimated_gdp.toFixed(2)}</li>`).join("")}
        </ul>
      </body>
    </html>
  `;

  if (!fs.existsSync("cache")) fs.mkdirSync("cache");

  await nodeHtmlToImage({
  output: "./cache/summary.png",
  html: "<h1>Hello</h1>",
  puppeteerArgs: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
}
