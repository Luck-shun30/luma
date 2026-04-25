"use client";

import { useEffect, useState } from "react";

import { formatTemperature } from "@/lib/utils";

type TemperatureState =
  | { status: "loading" }
  | { status: "ready"; temperatureC: number }
  | { status: "unavailable" };

export function CurrentTemperature() {
  const [temperature, setTemperature] = useState<TemperatureState>({
    status: "loading",
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`,
          );

          if (!response.ok) {
            setTemperature({ status: "unavailable" });
            return;
          }

          const payload = (await response.json()) as {
            current?: {
              temperature_2m?: number;
            };
          };
          const currentTemp = payload.current?.temperature_2m;

          setTemperature(
            typeof currentTemp === "number"
              ? { status: "ready", temperatureC: currentTemp }
              : { status: "unavailable" },
          );
        } catch {
          setTemperature({ status: "unavailable" });
        }
      },
      () => {
        setTemperature({ status: "unavailable" });
      },
      {
        maximumAge: 15 * 60 * 1000,
        timeout: 8000,
      },
    );
  }, []);

  if (temperature.status === "ready") {
    return (
      <p className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
        {formatTemperature(temperature.temperatureC)}
      </p>
    );
  }

  return (
    <p className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
      --
    </p>
  );
}
