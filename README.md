# Country Currency & Exchange API

A RESTful API that fetches country data and exchange rates, stores them in MySQL, and provides CRUD operations with GDP estimates.  
Built with **Node.js (Express)**, **MySQL2**, **Axios**, and **Jimp**.

## Features

- Fetches all countries and their currencies from [RESTCountries API](https://restcountries.com/)
- Fetches exchange rates from [Open Exchange API](https://open.er-api.com/)
- Calculates `estimated_gdp = population × random(1000–2000) ÷ exchange_rate`
- Stores countries in MySQL database
- Supports filters, sorting, and caching
- Generates a summary image of top 5 GDP countries
- Full JSON-based error handling

## API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| **POST** | `/countries/refresh` | Fetches countries & exchange rates, updates DB, generates summary image |
| **GET** | `/countries` | Get all countries (supports filters & sorting) |
| **GET** | `/countries/:name` | Get details for one country |
| **DELETE** | `/countries/:name` | Delete a country by name |
| **GET** | `/status` | Show total countries and last refresh timestamp |
| **GET** | `/countries/image` | Serve summary image (top 5 GDP countries) |

## Query Parameters

| Param | Example | Description |
|--------|----------|-------------|
| `region` | `/countries?region=Africa` | Filter by region |
| `currency` | `/countries?currency=USD` | Filter by currency code |
| `sort` | `/countries?sort=gdp_desc` | Sort by GDP descending |

---

## Setup Instructions

### 1 Clone Repo

git clone https://github.com/YOUR_USERNAME/country-currency-api.git
cd country-currency-api
2. Install Dependencies
npm install
3. Create .env File
Add your database credentials:

PORT=5000

DB_HOST=maglev.proxy.rlwy.net
DB_PORT=19182
DB_USER=root
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=railway
💡 If deploying on Railway, replace maglev.proxy.rlwy.net with mysql.railway.internal.

4. Create Database Tables
Run this SQL in your MySQL console:

sql
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  capital VARCHAR(255),
  region VARCHAR(255),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DOUBLE,
  estimated_gdp DOUBLE,
  flag_url TEXT,
  last_refreshed_at DATETIME
);

CREATE TABLE meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  last_refreshed_at DATETIME
);
5. Start Server
npm run dev
Server runs at http://localhost:5000

## Testing All Endpoints
1. Refresh countries
POST /countries/refresh
Response:

json
{
  "message": "Countries refreshed successfully",
  "last_refreshed_at": "2025-10-27T..."
}
2. Get all countries
GET /countries
Optional filters:

GET /countries?region=Africa
GET /countries?currency=USD
GET /countries?sort=gdp_desc
 3. Get one country
GET /countries/Nigeria
Response:

json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-27T..."
}
4. Delete a country
DELETE /countries/Nigeria
Response:

json
{ "message": "Country deleted" }
5. Check API status

GET /status
Response:

{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-27T..."
}
6. Get summary image

GET /countries/image
If image exists → returns .png
If not →

json
{ "error": "Summary image not found" }
## Dependencies
npm install express axios mysql2 dotenv jimp nodemon