from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os
import datetime
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import urllib3

urllib3.disable_warnings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
# Google requires exact 'localhost' for Web Application redirect URIs if not using HTTPS with a real TLD.
OAUTH_REDIRECT_URI = "http://localhost:5005/auth/callback" 
CREDENTIALS_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "/app/credentials/client_secret.json")
CREDENTIALS_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "/app/credentials/client_secret.json")
TOKEN_DIR = "/app/credentials/tokens"

os.makedirs(TOKEN_DIR, exist_ok=True)

@app.get("/api/schedule/auth-url")
def get_auth_url(request: Request):
    if not os.path.exists(CREDENTIALS_FILE):
        raise HTTPException(status_code=500, detail="client_secret.json not found on backend. Add it to /calendar_api/credentials/")
        
    flow = Flow.from_client_secrets_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
        redirect_uri=OAUTH_REDIRECT_URI
    )
    # prompt='consent' forces the consent screen every time, useful if credentials revoked
    auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')
    return {"url": auth_url}

@app.get("/auth/callback")
def auth_callback(request: Request, code: str):
    flow = Flow.from_client_secrets_file(
        CREDENTIALS_FILE,
        scopes=SCOPES,
        redirect_uri=OAUTH_REDIRECT_URI
    )
    flow.fetch_token(code=code)
    creds = flow.credentials
    
    # Save token for 'default' user for now, or use a session
    with open(os.path.join(TOKEN_DIR, "default_token.json"), "w") as token_file:
        token_file.write(creds.to_json())
        
    dashboard_url = f"http://localhost/"
    return RedirectResponse(url=dashboard_url) # Redirect back to Dashboard root

@app.get("/api/schedule")
def get_schedule():
    token_path = os.path.join(TOKEN_DIR, "default_token.json")
    if not os.path.exists(token_path):
        return {"events": [], "message": "NOT_AUTHENTICATED"}
        
    creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    
    service = build('calendar', 'v3', credentials=creds)
    
    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
    end_of_day = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + 'Z'
    
    events_result = service.events().list(calendarId='primary', timeMin=now,
                                          timeMax=end_of_day,
                                          singleEvents=True,
                                          orderBy='startTime').execute()
    events = events_result.get('items', [])
    
    all_events = []
    
    for e in events:
        start = e['start'].get('dateTime', e['start'].get('date'))
        is_all_day = 'date' in e['start']
        
        time_str = "All Day"
        if not is_all_day:
            dt = datetime.datetime.fromisoformat(start)
            time_str = dt.strftime("%I:%M %p").lstrip("0")
            
        all_events.append({
            "title": e.get('summary', 'Busy'),
            "time": time_str,
            "all_day": is_all_day,
            "raw_start": start,
            "color": "var(--neon-magenta)"
        })
        
    return {"events": all_events}
