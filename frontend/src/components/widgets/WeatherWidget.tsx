"use client";

import React, { useState, useEffect } from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";
import { CloudRain } from "lucide-react";

function getWeatherDescription(code: number) {
    const codes: Record<number, string> = {
        0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing Rime Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
        55: "Dense Drizzle", 56: "Light Freezing Drizzle", 57: "Dense Freezing Drizzle",
        61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain", 66: "Light Freezing Rain",
        67: "Heavy Freezing Rain", 71: "Slight Snow Fall", 73: "Moderate Snow Fall",
        75: "Heavy Snow Fall", 77: "Snow Grains", 80: "Slight Rain Showers",
        81: "Moderate Rain Showers", 82: "Violent Rain Showers", 85: "Slight Snow Showers",
        86: "Heavy Snow Showers", 95: "Thunderstorm", 96: "Thunderstorm + Hail",
        99: "Heavy Hail Thunderstorm"
    };
    return codes[code] || "Unknown";
}

export function WeatherWidget({ config, isEditing }: WidgetProps) {
    const [weather, setWeather] = useState<any>(null);
    const [coords, setCoords] = useState<{ lat: number, long: number }>({ lat: 40.7128, long: -74.0060 });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude }),
                (err) => console.warn("Geolocation access denied or error. Using default location.", err)
            );
        }
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.long}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error("Weather API failed");
                const data = await res.json();
                const current = data.current;
                const daily = data.daily;
                setWeather({
                    temp: Math.round(current.temperature_2m),
                    condition: getWeatherDescription(current.weather_code),
                    high: Math.round(daily.temperature_2m_max[0]),
                    low: Math.round(daily.temperature_2m_min[0]),
                    humidity: current.relative_humidity_2m
                });
            } catch (e) {
                console.error("Error fetching weather:", e);
            }
        };
        fetchWeather();
    }, [coords]);

    if (!weather) {
        return (
            <div className="flex flex-col h-full relative group">
                <h2 className="flex items-center gap-2 text-neon-cyan font-display text-[1.05rem] border-b border-neon-cyan/30 pb-2 mb-3 uppercase tracking-wider">
                    <CloudRain size={18} /> Weather
                </h2>
                <div className="h-full flex items-center justify-center text-neon-cyan animate-pulse">Loading Weather Data...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative group">
            <h2 className="flex items-center gap-2 text-neon-cyan font-display text-[1.05rem] border-b border-neon-cyan/30 pb-2 mb-3 uppercase tracking-wider">
                <CloudRain size={18} /> Weather
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center pb-4 relative z-10 w-full overflow-hidden">
                <div className="text-[4rem] font-bold text-text-color drop-shadow-[0_0_10px_var(--neon-cyan)] leading-none">{weather.temp}°</div>
                <div className="text-[1.5rem] text-neon-cyan mb-4 text-center mt-1">{weather.condition}</div>
                <div className="flex justify-between w-full max-w-[90%] text-text-dim px-4 py-2 bg-black/20 rounded-lg border border-white/5 shadow-inner">
                    <span>H: {weather.high}°</span>
                    <span>L: {weather.low}°</span>
                    <span>Hum: {weather.humidity}%</span>
                </div>
                <div className="absolute bottom-0 text-[0.7rem] opacity-0 group-hover:opacity-40 transition-opacity">
                    Lat: {coords.lat.toFixed(2)}, Long: {coords.long.toFixed(2)}
                </div>
            </div>
        </div>
    );
}

registerWidget({
    type: "weather-local",
    name: "Local Weather",
    description: "Tracks incoming weather, temperature, and humidity based on browser Geolocation API.",
    defaultWidth: 1,
    defaultHeight: 1,
    component: WeatherWidget,
});
