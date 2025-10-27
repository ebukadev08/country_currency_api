import nodeHtmlToImage from "node-html-to-image";
import fs from "fs";

export async function generateSummaryImage(countries, lastRefreshedAt) {
  const total = countries.length;
  const top5 = [...countries]
    .filter(c => c.estimated_gdp)
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);

  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #222, #333);
          color: #fff;
          padding: 40px;
        }
        h1 {
          text-align: center;
          color: #00ffcc;
        }
        .info {
          margin-bottom: 30px;
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #555;
        }
        th {
          color: #00ffcc;
        }
      </style>
    </head>
    <body>
      <h1>🌍 Country Summary</h1>
      <div class="info">
        <p><b>Total Countries:</b> ${total}</p>
        <p><b>Last Refreshed:</b> ${lastRefreshedAt}</p>
      </div>
      <h2>Top 5 Countries by Estimated GDP</h2>
      <table>
        <tr>
          <th>Rank</th>
          <th>Country</th>
          <th>Estimated GDP</th>
        </tr>
        ${top5
          .map(
            (c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${c.name}</td>
              <td>${c.estimated_gdp?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}</td>
            </tr>`
          )
          .join("")}
      </table>
    </body>
  </html>`;

  fs.mkdirSync("cache", { recursive: true });

  await nodeHtmlToImage({
    output: "./cache/summary.png",
    html,
    quality: 100,
  });
}
