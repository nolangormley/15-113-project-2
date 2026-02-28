"use client";

function getHost() {
    if (typeof window !== "undefined") {
        return window.location.hostname;
    }
    return "localhost";
}

export const CONFIG = {
    get STRAVA_API_URL() { return process.env.NEXT_PUBLIC_STRAVA_API_URL || `http://${getHost()}:8000`; },
    get STRAVA_USER_ID() { return process.env.NEXT_PUBLIC_STRAVA_USER_ID || "175196118"; },
    get CHORE_CHART_URL() { return process.env.NEXT_PUBLIC_CHORE_CHART_URL || `http://${getHost()}:5000`; },
    get CALENDAR_API_URL() { return process.env.NEXT_PUBLIC_CALENDAR_API_URL || `http://${getHost()}:5005`; },
    get OCTOPI_URL() { return process.env.NEXT_PUBLIC_OCTOPI_URL || "http://octopi.local"; },
    get OCTOPI_API_KEY() { return process.env.NEXT_PUBLIC_OCTOPI_API_KEY || "replace_with_your_api_key"; },
};
