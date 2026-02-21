const path = require("path");
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(express.json());

const appDir = path.join(__dirname, "public", "app");
app.use("/app", express.static(appDir));

app.get("/app", (req, res) => {
  res.sendFile(path.join(appDir, "index.html"));
});

app.post("/api/weather", async (req, res) => {
  try {
    const city = (req.body.city ?? "").toString().trim();
    const units = (req.body.units ?? "c").toString().trim().toLowerCase();
    const daysRaw = Number(req.body.days ?? 3);

    const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(7, daysRaw)) : 3;

    if (!city) return res.status(400).json({ error: "city is required" });

    const geo = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name: city, count: 1, language: "en", format: "json" }
    });

    const first = geo.data?.results?.[0];
    if (!first) return res.status(404).json({ error: "city not found" });

    const latitude = first.latitude;
    const longitude = first.longitude;

    const tempUnit = units === "f" ? "fahrenheit" : "celsius";

    const forecast = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
        temperature_unit: tempUnit,
        timezone: "auto",
        forecast_days: days
      }
    });

    const d = forecast.data?.daily;

  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/app`);
});