# Country & Currency API

A Node.js + Express REST API that provides real-time country data, exchange rates, and GDP estimates.

---

## Live Demo
Hosted on **Railway**

https://countrycurrencyapi-production-dcf3.up.railway.app


---

## Features
- Fetch & cache country data (`/countries/refresh`)
- Filter and sort countries
- Calculate GDP based on population and exchange rates
- Delete or fetch a single country
- Generate a summary image with top 5 GDPs
- View system status

---

## Tech Stack
- **Node.js + Express**
- **MySQL (Railway)**
- **Axios** (for API requests)
- **Jimp** (for image generation)
- **dotenv, cors**

---


## Environment Variables (`.env`)
MYSQLHOST=your-mysql-host
MYSQLPORT=3306
MYSQLUSER=your-username
MYSQLPASSWORD=your-password
MYSQLDATABASE=railway
PORT=3000

## API Routes

| Method | Route | Description |
|--------|--------|-------------|
| `POST` | `/countries/refresh` | Fetches and stores latest country & exchange data |
| `GET` | `/countries` | Lists all countries |
| `GET` | `/countries?region=Asia` | Filter by region |
| `GET` | `/countries?currency=EUR` | Filter by currency |
| `GET` | `/countries?sort=gdp_desc` | Sort by GDP (desc) |
| `GET` | `/countries/:name` | Get a single country |
| `DELETE` | `/countries/:name` | Delete a country |
| `GET` | `/countries/image` | Returns generated summary PNG |
| `GET` | `/status` | Shows total countries + last refresh time |

---

## Install & Run Locally

```bash
git clone https://github.com/yourusername/countrycurrencyapi.git
cd countrycurrencyapi
npm install
npm run dev