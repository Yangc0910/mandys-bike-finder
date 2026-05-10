from __future__ import annotations

import base64
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def send_email(
    *,
    sender: str,
    recipient: str,
    subject: str,
    plain_text: str,
    html: str,
) -> str:
    service = _gmail_service()
    message = MIMEMultipart("alternative")
    message["To"] = recipient
    message["From"] = sender
    message["Subject"] = subject
    message.attach(MIMEText(plain_text, "plain", "utf-8"))
    message.attach(MIMEText(html, "html", "utf-8"))

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    sent = service.users().messages().send(userId="me", body={"raw": raw}).execute()
    return str(sent["id"])


def _gmail_service():
    creds = _load_credentials()
    return build("gmail", "v1", credentials=creds)


def _load_credentials() -> Credentials:
    client_secret_file = Path(os.environ.get("GMAIL_CLIENT_SECRET_FILE", "credentials/client_secret.json"))
    token_file = Path(os.environ.get("GMAIL_TOKEN_FILE", "credentials/gmail_token.json"))
    token_file.parent.mkdir(parents=True, exist_ok=True)

    creds = None
    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not client_secret_file.exists():
            raise FileNotFoundError(
                f"Gmail OAuth client secret not found: {client_secret_file}. "
                "Set GMAIL_CLIENT_SECRET_FILE in .env."
            )
        flow = InstalledAppFlow.from_client_secrets_file(str(client_secret_file), SCOPES)
        creds = flow.run_local_server(port=0)

    token_file.write_text(creds.to_json(), encoding="utf-8")
    return creds
