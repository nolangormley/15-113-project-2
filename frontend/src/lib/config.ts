"use client";

function getHost() {
    if (typeof window !== "undefined") {
        return window.location.hostname;
    }
    return "localhost";
}

export const CONFIG = {
    get STRAVA_API_URL() { return `http://${getHost()}:8000`; },
    STRAVA_USER_ID: "175196118",
    get CHORE_CHART_URL() { return `http://${getHost()}:5000`; },
    get CALENDAR_API_URL() { return `http://${getHost()}:5005`; },
    OCTOPI_URL: "http://octopi.local",
    OCTOPI_API_KEY: "replace_with_your_api_key",
};
