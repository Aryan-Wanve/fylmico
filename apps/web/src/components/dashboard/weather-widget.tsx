"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun
} from "lucide-react";

const CACHE_KEY = "fylmico.weather";
const CACHE_TTL_MS = 30 * 60 * 1000;

type WeatherData = {
  tempC: number;
  code: number;
  place: string;
};

// WMO weather codes (open-meteo's `current.weather_code`) - a fixed, fully
// enumerable set, mapped directly (not via a conditional factory function)
// so the icon is a stable reference rather than one created during render.
const WEATHER_ICONS: Record<number, typeof Sun> = {
  0: Sun,
  1: Sun,
  2: Cloud,
  3: Cloud,
  45: CloudFog,
  48: CloudFog,
  51: CloudRain,
  53: CloudRain,
  55: CloudRain,
  56: CloudRain,
  57: CloudRain,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  66: CloudRain,
  67: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: CloudSnow,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning
};

async function fetchWeather(): Promise<WeatherData | null> {
  const cached = window.sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached) as WeatherData & { fetchedAt: number };
    if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
      return parsed;
    }
  }

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { timeout: 8000 }
    );
  });

  if (!position) {
    return null;
  }

  const { latitude, longitude } = position.coords;

  const [weatherRes, placeRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    ),
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
    )
  ]);

  if (!weatherRes.ok) {
    return null;
  }

  const weatherJson = await weatherRes.json();
  const placeJson = placeRes.ok ? await placeRes.json() : null;
  const place = placeJson
    ? [placeJson.city, placeJson.principalSubdivisionCode?.split("-")[1]]
        .filter(Boolean)
        .join(", ")
    : "";

  const data: WeatherData = {
    tempC: Math.round(weatherJson.current.temperature_2m),
    code: weatherJson.current.weather_code,
    place
  };

  window.sessionStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ ...data, fetchedAt: Date.now() })
  );

  return data;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchWeather()
      .then((data) => {
        if (!cancelled && data) {
          setWeather(data);
        }
      })
      .catch(() => {
        // Hidden silently on any failure/permission denial.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!weather) {
    return null;
  }

  const Icon = WEATHER_ICONS[weather.code] ?? Cloud;

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#4b5268] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9]">
      <Icon className="h-4 w-4 text-[#667085] dark:text-[#878ca0]" />
      {weather.tempC}°C
      {weather.place ? (
        <span className="text-xs text-[#667085] dark:text-[#878ca0]">
          {weather.place}
        </span>
      ) : null}
    </div>
  );
}
