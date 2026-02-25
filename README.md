# Life Metrics Dashboard

A Cyberpunk-themed personal dashboard designed for iPad (landscape mode).

## Features
- **Visuals**: Neon colors, dark mode, glassmorphism, responsive grid layout.
- **Tiles**:
    - Workout Status
    - Calendar Events
    - Chore Assignments
    - Equipment Maintenance
    - Weather
    - 3D Printer (Octopi) Status

## How to Use
1. Ensure Docker and Docker Compose are installed.
2. Clone this repository.
3. Start the services with: `docker compose up -d --build`
4. Access the dashboard at `http://localhost/` (or your machine's local IP address from your Raspberry Pi's browser).

## Customization
- **Styles**: Edit `style.css` to change colors or layout.
- **Data**: Edit `script.js` to replace dummy data with real API calls.
- **Config**: Edit `config.js` to change API IPs and endpoints.
- **Manifest**: Update `manifest.json` for app icons and metadata.

## Setting up Google Calendar Sync
To use the Google Calendar feature, you need to create a `client_secret.json` from the Google Cloud Console.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. In the search bar, look for "Google Calendar API" and click **Enable**.
4. Go to **APIs & Services** > **OAuth consent screen**.
    * Choose **External** (or Internal if you have a Google Workspace).
    * Fill out the required app details (name, support email).
    * Under "Test users", be sure to **add your personal Google Account email** so you can successfully log in.
5. Go to **APIs & Services** > **Credentials**.
    * Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
    * For Application type, choose **Web application**.
    * Under **Authorized redirect URIs**, add the exact URI where your backend auth will run, using port 5005. For example: `http://localhost:5005/auth/callback` (or if accessing from a Raspberry Pi using your host machine's IP, e.g., `http://192.168.1.150:5005/auth/callback`).
    * Click **Create**.
6. A modal will pop up with your Client ID and Secret. Click the **Download JSON** button.
7. Rename the downloaded file to exactly `client_secret.json`.
8. Move the `client_secret.json` file into the `calendar_api/credentials/` directory of this project.

Once that file is in place, clicking "Link Google Account" on the dashboard will seamlessly authorize and sync your calendar.
