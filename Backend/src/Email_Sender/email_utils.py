import smtplib
import sys

from email.message import EmailMessage
from .email_config import EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS


def send_email(to_email: str, subject: str, body: str) -> str:
    print("📨 send_email() called", flush=True)




    msg = EmailMessage()
    msg["From"] = EMAIL_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        # ✅ Connect and send in one clean flow
        print("Connecting...", flush=True)

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            print(f"EMAIL_HOST from config: {EMAIL_HOST}", flush=True)
            print("Connected!", flush=True)
            server.set_debuglevel(1)
            server.ehlo()
            print("Calling starttls()", flush=True)
            server.starttls()

            print("Calling login()", flush=True)
            server.login(EMAIL_USER, EMAIL_PASS)

            print("Sending message...", flush=True)
            server.send_message(msg)

        return "Email sent successfully."
    except Exception as e:
        print(f"❌ Exception occurred: {e}", flush=True)
        return f"Failed to send email: {str(e)}"
