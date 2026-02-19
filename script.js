// Dashboard Script

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    loadDashboardData();
});

function initClock() {
    const clockElement = document.getElementById('clock');

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        clockElement.textContent = timeString;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

function loadDashboardData() {
    // Simulate fetching data for each tile
    loadWorkout();
    loadCalendar();
    loadChores();
    loadEquipment();
    loadWeather();
    loadOctopi();
}

// 1. Workout
// 1. Workout
// 1. Workout & Status
async function loadWorkout() {
    const container = document.getElementById('workout-content');

    const API_URL = window.CONFIG?.STRAVA_API_URL || 'http://localhost:5001';
    const USER_ID = window.CONFIG?.STRAVA_USER_ID;

    if (!USER_ID) {
        updateTile(container, `<p>User ID not configured.</p>`);
        return;
    }

    try {
        // Parallel data fetching
        const [recommendResponse, statusResponse] = await Promise.all([
            fetch(`${API_URL}/recommend/${USER_ID}`),
            fetch(`${API_URL}/status/${USER_ID}`)
        ]);

        if (!recommendResponse.ok || !statusResponse.ok) throw new Error('API Sync Failed');

        const recommendData = await recommendResponse.json();
        const statusData = await statusResponse.json();

        // Destructure Data
        const workout = recommendData.workout;
        const category = recommendData.recommended_category || 'General';

        // Status Metrics
        const ctl = statusData.fitness_ctl || 0;
        const atl = statusData.fatigue_atl || 0;
        const tsb = statusData.form_tsb || 0;

        // Dynamic Colors based on TSB state
        let statusColor = 'var(--neon-cyan)';
        if (tsb > 5) statusColor = 'var(--neon-green)'; // Fresh
        else if (tsb < -20) statusColor = 'var(--neon-red)'; // Overreaching
        else if (tsb < -10) statusColor = 'var(--neon-orange)'; // Productive
        else statusColor = 'var(--neon-magenta)'; // Maintenance/Optimal

        // Helper for metric bars
        const createBar = (label, value, max, color, min = 0) => {
            let percentage = ((value - min) / (max - min)) * 100;
            percentage = Math.max(0, Math.min(percentage, 100)); // Clamp 0-100

            return `
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;">
                    <span style="opacity: 0.8;">${label}</span>
                    <span style="font-weight: bold; color: ${color};">${value}</span>
                </div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px;">
                    <div style="width: ${percentage}%; background: ${color}; height: 100%; border-radius: 3px; box-shadow: 0 0 5px ${color}; transition: width 0.5s ease-out;"></div>
                </div>
            </div>
            `;
        };

        const html = `
            <!-- Top Section: Workout Recommendation -->
            <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="font-size: 1.1rem; font-weight: bold; color: ${statusColor}; text-transform: uppercase;">
                        ${category} Focus
                    </div>
                    
                    <!-- AI Tooltip Trigger -->
                    ${statusData.ai_insight ? `
                        <div class="ai-insight-container">
                            <div class="ai-icon-trigger">?</div>
                            <div class="ai-popup">
                                <div class="ai-reasoning-title">
                                    <span>AI Coach Insight</span>
                                </div>
                                ${statusData.ai_insight}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div style="font-size: 1.2rem; margin-bottom: 5px; color: var(--text-color);">
                    ${workout.name}
                </div>
            </div>

            <!-- Bottom Section: Key Metrics -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <!-- Left: Bars (Scale 0 - 160) -->
                <div>
                   ${createBar('Fitness (CTL)', ctl, 160, 'var(--neon-cyan)', 0)}
                   ${createBar('Fatigue (ATL)', atl, 160, 'var(--neon-magenta)', 0)}
                </div>
                
                <!-- Right: Big TSB Number -->
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid ${statusColor};">
                    <div style="font-size: 0.8rem; opacity: 0.7; text-transform: uppercase;">Form (TSB)</div>
                    <div style="font-size: 2.2rem; font-weight: bold; color: ${statusColor}; text-shadow: 0 0 10px ${statusColor};">
                        ${tsb > 0 ? '+' : ''}${tsb}
                    </div>
                </div>
            </div>
        `;
        updateTile(container, html);

    } catch (error) {
        console.error("Error fetching workout/status:", error);
        container.innerHTML = `
            <div style="color: var(--neon-red);">
                <div>Sync Error</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">Check API at ${API_URL}/status/${USER_ID}</div>
            </div>`;
    }
}

// 2. Calendar
function loadCalendar() {
    const container = document.getElementById('calendar-content');
    // Dummy Data
    const events = [
        { title: "Team Sync", time: "10:00 AM" },
        { title: "Lunch with Sarah", time: "12:30 PM" },
        { title: "Project Review", time: "03:00 PM" },
        { title: "Gym", time: "06:00 PM" }
    ];

    let html = '<ul>';
    events.forEach(event => {
        html += `
            <li>
                <span>${event.title}</span>
                <span style="color: var(--neon-magenta);">${event.time}</span>
            </li>
        `;
    });
    html += '</ul>';
    updateTile(container, html);
}

// 3. Chores
async function loadChores() {
    const container = document.getElementById('chores-content');
    const API_URL = window.CONFIG?.CHORE_CHART_URL || 'http://localhost:5000';

    try {
        const response = await fetch(`${API_URL}/api/chores`);
        if (!response.ok) throw new Error('Chores API Failed');
        const chores = await response.json();

        // Sort: High points first? Or just take top few
        const displayChores = chores.slice(0, 5);

        let html = '<ul>';
        if (displayChores.length === 0) {
            html += '<li class="dim" style="justify-content:center;">No active chores</li>';
        } else {
            displayChores.forEach(chore => {
                // Determine color based on points
                let pointColor = 'var(--text-dim)';
                if (chore.points >= 50) pointColor = 'var(--neon-yellow)';
                if (chore.points >= 100) pointColor = 'var(--neon-orange)';

                html += `
                    <li>
                        <div style="display:flex; flex-direction:column;">
                            <span>${chore.title}</span>
                            <span style="font-size:0.8rem; color:var(--text-dim);">${chore.description || ''}</span>
                        </div>
                        <span style="border: 1px solid ${pointColor}; color: ${pointColor}; padding: 2px 8px; border-radius: 4px; font-weight:bold; min-width: 40px; text-align:center;">
                            ${chore.points}
                        </span>
                    </li>
                `;
            });
        }
        html += '</ul>';
        updateTile(container, html);
    } catch (error) {
        console.error("Error fetching chores:", error);
        container.innerHTML = `
            <div style="color: var(--neon-red); text-align: center;">
                <div>Sync Error</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">Check API at ${API_URL}</div>
            </div>`;
    }
}

// 4. Equipment Manager
function loadEquipment() {
    const container = document.getElementById('equipment-content');
    // Dummy Data
    const tasks = [
        { item: "HVAC Filter", status: "Overdue", due: "-2 days" },
        { item: "Water Filter", status: "Due Soon", due: "3 days" },
        { item: "Smoke Alarm", status: "OK", due: "25 days" }
    ];

    let html = '<ul>';
    tasks.forEach(task => {
        let color = 'white';
        if (task.status === 'Overdue') color = 'var(--neon-red)';
        else if (task.status === 'Due Soon') color = 'var(--neon-yellow)';
        else color = 'var(--neon-green)';

        html += `
            <li>
                <span>${task.item}</span>
                <span style="color: ${color}; text-align: right;">
                    <div>${task.status}</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">Due: ${task.due}</div>
                </span>
            </li>
        `;
    });
    html += '</ul>';
    updateTile(container, html);
}

// 5. Weather
// 5. Weather
// 5. Weather
function loadWeather() {
    const container = document.getElementById('weather-content');

    // Default Location: New York City (Fallback)
    const defaultLat = 40.7128;
    const defaultLong = -74.0060;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherData(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Geolocation access denied or error. Using default location.", error);
                fetchWeatherData(defaultLat, defaultLong);
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser. Using default location.");
        fetchWeatherData(defaultLat, defaultLong);
    }

    async function fetchWeatherData(lat, long) {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Weather API failed');
            const data = await response.json();

            const current = data.current;
            const daily = data.daily;

            // Map WMO Weather Code to Description
            const weatherCode = current.weather_code;
            const condition = getWeatherDescription(weatherCode);

            const weather = {
                temp: Math.round(current.temperature_2m),
                condition: condition,
                high: Math.round(daily.temperature_2m_max[0]),
                low: Math.round(daily.temperature_2m_min[0]),
                humidity: current.relative_humidity_2m
            };

            const html = `
                <div style="text-align: center;">
                    <div style="font-size: 4rem; font-weight: 700; color: var(--text-color); text-shadow: 0 0 10px var(--neon-cyan);">${weather.temp}°</div>
                    <div style="font-size: 1.5rem; color: var(--neon-cyan); margin-bottom: 20px;">${weather.condition}</div>
                    <div style="display: flex; justify-content: space-between; padding: 0 10%; color: var(--text-dim);">
                        <span>H: ${weather.high}°</span>
                        <span>L: ${weather.low}°</span>
                        <span>Hum: ${weather.humidity}%</span>
                    </div>
                    <div style="font-size: 0.8rem; margin-top: 10px; opacity: 0.5;">
                        Lat: ${lat.toFixed(2)}, Long: ${long.toFixed(2)}
                    </div>
                </div>
            `;
            updateTile(container, html);

        } catch (error) {
            console.error("Error fetching weather:", error);
            container.innerHTML = `<p style="color: var(--neon-red); text-align: center;">Weather Data Unavailable</p>`;
        }
    }
}

// Helper: Map WMO codes to text
function getWeatherDescription(code) {
    // WMO Weather interpretation codes (WW)
    // https://open-meteo.com/en/docs
    const codes = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        56: "Light Freezing Drizzle",
        57: "Dense Freezing Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        66: "Light Freezing Rain",
        67: "Heavy Freezing Rain",
        71: "Slight Snow Fall",
        73: "Moderate Snow Fall",
        75: "Heavy Snow Fall",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm + Hail",
        99: "Heavy Hail Thunderstorm"
    };
    return codes[code] || "Unknown";
}

// 6. Octopi Status
function loadOctopi() {
    const container = document.getElementById('octopi-content');
    // Dummy Data
    const status = {
        state: "Printing", // Operational, Printing, Offline
        file: "iron_man_mask.gcode",
        progress: 68,
        timeLeft: "45m"
    };

    let statusColor = "var(--neon-green)";
    if (status.state === "Printing") statusColor = "var(--neon-orange)";
    if (status.state === "Offline") statusColor = "var(--neon-red)";

    // Use .progress-text class for query update
    const html = `
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div class="status-indicator" style="background-color: ${statusColor}; box-shadow: 0 0 8px ${statusColor}; animation: pulse 1.5s infinite;"></div>
            <span style="font-size: 1.2rem; font-weight: bold;">${status.state}</span>
        </div>
        <div style="margin-bottom: 5px;">${status.file}</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${status.progress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.9rem; color: var(--text-dim);">
            <span class="progress-text">${status.progress}%</span>
            <span>${status.timeLeft} left</span>
        </div>
    `;
    updateTile(container, html);

    // Simulate live progress
    if (status.state === 'Printing') {
        setTimeout(() => updateProgress(container, status.progress), 1000);
    }
}

// Helper to simulate live updates
function updateProgress(container, currentProgress) {
    const bar = container.querySelector('.progress-fill');
    const text = container.querySelector('.progress-text');

    if (bar && text) {
        let newProgress = currentProgress + 1;
        if (newProgress > 100) newProgress = 0; // Loop for demo

        bar.style.width = newProgress + '%';
        text.textContent = newProgress + '%';

        // Recursive animation
        setTimeout(() => updateProgress(container, newProgress), 1000);
    }
}

function updateTile(element, html) {
    // Simple fade in effect
    element.style.opacity = 0;
    element.innerHTML = html;
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s';
        element.style.opacity = 1;
    }, 100);
}
