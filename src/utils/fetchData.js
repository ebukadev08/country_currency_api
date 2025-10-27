import axios from "axios";

export async function fetchCountriesAndRates() {
  const countriesUrl = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
  const ratesUrl = "https://open.er-api.com/v6/latest/USD";

  try {
    const [countriesRes, ratesRes] = await Promise.all([
      axios.get(countriesUrl),
      axios.get(ratesUrl),
    ]);

    return { countries: countriesRes.data, rates: ratesRes.data.rates };
  } catch (err) {
    throw new Error("External data source unavailable");
  }
}
