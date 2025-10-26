## Country Currency API

A Node.js + Express + MySQL REST API that fetches and stores global country data — including population, capital, region, currency, exchange rate, GDP, and flag — from an external data source.
It also generates summary reports and caches information for efficient access.

 ## Features

Fetches real-time country data from external APIs

Stores data in MySQL for quick retrieval

Supports caching to reduce redundant external API calls

Generates country summary images using Puppeteer

Automatically refreshes database entries

Built with Express, Axios, MySQL2, and dotenv

 ## Tech Stack
Database:	MySQL
Environment:	dotenv
HTTP Requests:	Axios
Image Generation:	node-html-to-image (Puppeteer)

 ## Installation
Clone the Repository
git clone https://github.com/ebukadev08/CountryCurrencyAPI.git
cd CountryCurrencyAPI

 ## Install Dependencies
npm install

 ## Create a .env File

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=country_api

## MySQL Setup

Run this SQL in your MySQL Workbench or VS Code MySQL extension:

CREATE DATABASE country_api;

USE country_api;

CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate FLOAT,
  estimated_gdp DOUBLE,
  flag_url VARCHAR(255),
  last_refreshed_at DATETIME
);

 ## How It Works

The API fetches country and currency data from an external source.

Data is inserted into your MySQL database.

The /api/countries route returns the full country list.

The /api/countries/summary route generates a summary image (top GDP countries, etc.) using Puppeteer.

## Running the App
npm run dev

## Production Mode
npm start


The server will start on
http://localhost:3000

## API Endpoints
GET	/api/countries	Fetch all countries from database
GET	/api/countries/:name	Get a single country by name
GET	/api/countries/summary	Generate and return a summary image
POST	/api/refresh	Refresh data from external API
## Example Response
[
  {
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1530.45,
    "estimated_gdp": 432000000000,
    "flag_url": "https://flagcdn.com/w320/ng.png"
  }
]