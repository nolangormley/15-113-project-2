// Configuration
// Using window.location.hostname allows the dashboard to connect to the 
// APIs on the same machine when accessed from another device (like a Raspberry Pi).
const HOST = window.location.hostname;

window.CONFIG = {
    STRAVA_API_URL: `http://${HOST}:8000`, // Update to 5001 if using docker-compose exposed port
    STRAVA_USER_ID: "175196118",
    CHORE_CHART_URL: `http://${HOST}:5000`,
    CALENDAR_API_URL: `http://${HOST}:5005`,
    OCTOPI_URL: "http://octopi.local",
    OCTOPI_API_KEY: "replace_with_your_api_key" // Update this!
};
