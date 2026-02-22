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
    const windUnit = (req.body.windUnit ?? "kmh").toString().trim().toLowerCase();

    const includePrecip = Boolean(req.body.includePrecip);
    const includeWind = Boolean(req.body.includeWind);

    const daysRaw = Number(req.body.days ?? 3);
    const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(7, daysRaw)) : 3;

    if (!city) return res.status(400).json({ error: "city is required" });

    const geoResp = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name: city, count: 1, language: "en", format: "json" }
    });

    const first = geoResp.data?.results?.[0];
    if (!first) return res.status(404).json({ error: "city not found" });

    const latitude = first.latitude;
    const longitude = first.longitude;

    const temperature_unit = units === "f" ? "fahrenheit" : "celsius";
    const wind_speed_unit = windUnit === "mph" ? "mph" : "kmh";

    const dailyFields = ["temperature_2m_max", "temperature_2m_min"];
    if (includePrecip) dailyFields.push("precipitation_sum");
    if (includeWind) dailyFields.push("wind_speed_10m_max");

    const forecastResp = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        daily: dailyFields.join(","),
        temperature_unit,
        wind_speed_unit,
        timezone: "auto",
        forecast_days: days
      }
    });

    const d = forecastResp.data?.daily ?? {};
    const n = (d.time ?? []).length;

    res.json({
      location: {
        name: first.name,
        country: first.country,
        latitude,
        longitude
      },
      timezone: {
        name: forecastResp.data.timezone,
        offset: forecastResp.data.utc_offset_seconds
      },
      units: {
        temperature: units === "f" ? "F" : "C",
        wind: wind_speed_unit
      },
      includePrecip,
      includeWind,
      daily: {
        time: d.time ?? [],
        tmax: d.temperature_2m_max ?? [],
        tmin: d.temperature_2m_min ?? [],
        precip: d.precipitation_sum ?? Array(n).fill(""),
        windMax: d.wind_speed_10m_max ?? Array(n).fill("")
      }
    });
  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/app`);
});