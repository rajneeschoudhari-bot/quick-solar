import os
import io
import socket
import ssl
import smtplib
import base64
import requests
from email.message import EmailMessage
from flask import Flask, render_template, request, jsonify

# Helper functions to get clean config settings
def get_sender_email():
    return os.environ.get("SENDER_EMAIL", "rajnees.choudhari@gmail.com").strip()

def get_app_password():
    return os.environ.get("APP_PASSWORD", "babhiblmcaepweeo").strip().replace(" ", "")

def get_panel_password():
    return os.environ.get("PANEL_PASSWORD", "solar27").strip()

def get_brevo_api_key():
    return app_state.get("brevo_api_key", "").strip() or os.environ.get("BREVO_API_KEY", "").strip()

# Default High-Impact Email Subject & Body
DEFAULT_SUBJECT = "Application for Solar / O&M Engineer Role - Rajneesh Choudhary"

DEFAULT_BODY = """Dear Hiring Team,

I am an Electrical & Electronics Engineer (GATE Qualified) with hands-on experience in Solar PV Operations & Maintenance (O&M) and site management.

Key highlights of my experience:
• Managing O&M across 15 solar power plants (200–500 kW)
• Expertise in Preventive & Corrective Maintenance (PM/CM), plant generation optimization, and ERT testing
• Skilled in solar inverter troubleshooting, string testing, and fault rectification
• Strong operational background managing 40+ site manpower and daily reporting (DPR)

I am looking for suitable opportunities in your organization where I can contribute effectively to plant efficiency and operations.

Please find my resume attached for your review. I look forward to hearing from you.

Best regards,
Rajneesh Choudhary
+91 6261612684
rajnees.choudhari@gmail.com
"""

# App Global State (modifiable from Control Panel)
app_state = {
    "resume_url": os.environ.get(
        "RESUME_URL", 
        "https://drive.google.com/file/d/1Uqpnxcekhy1pSZgCfC2uPEftnyQzm2Lr/view?usp=sharing"
    ).strip(),
    "subject": DEFAULT_SUBJECT,
    "body": DEFAULT_BODY,
    "brevo_api_key": os.environ.get("BREVO_API_KEY", "").strip()
}

# Local fallback resume path
LOCAL_RESUME_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resume.pdf")

app = Flask(__name__)


def get_drive_direct_link(share_link):
    """Convert Google Drive share link to direct download link."""
    share_link = share_link.strip()
    if "drive.google.com" in share_link:
        if "/file/d/" in share_link:
            file_id = share_link.split("/file/d/")[1].split("/")[0]
        elif "id=" in share_link:
            file_id = share_link.split("id=")[1].split("&")[0]
        else:
            return share_link
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return share_link


def download_resume():
    """Download resume from Google Drive. Falls back to local file."""
    if app_state["resume_url"]:
        try:
            direct_link = get_drive_direct_link(app_state["resume_url"])
            response = requests.get(direct_link, timeout=15)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Google Drive download error: {e}")

    # Fallback: local resume.pdf
    if os.path.exists(LOCAL_RESUME_PATH):
        try:
            with open(LOCAL_RESUME_PATH, "rb") as f:
                return f.read()
        except Exception as e:
            print(f"Local file read error: {e}")

    return None


def send_via_brevo_api(api_key, sender_email, receivers, subject, body, resume_data):
    """Send emails via Brevo HTTPS REST API (Port 443 - Never blocked on Render)."""
    resume_b64 = base64.b64encode(resume_data).decode("utf-8")
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    success_count = 0
    for receiver in receivers:
        payload = {
            "sender": {
                "name": "Rajneesh Choudhary",
                "email": sender_email
            },
            "to": [{"email": receiver}],
            "subject": subject,
            "textContent": body,
            "attachment": [
                {
                    "name": "Rajneesh_Choudhary_Resume.pdf",
                    "content": resume_b64
                }
            ]
        }
        res = requests.post("https://api.brevo.com/v3/smtp/email", headers=headers, json=payload, timeout=20)
        if res.status_code in [200, 201, 202]:
            success_count += 1
        else:
            try:
                err_data = res.json()
                msg = err_data.get("message", res.text)
            except Exception:
                msg = res.text
            raise Exception(f"Brevo API: {msg}")
            
    return success_count


def send_via_smtp_fallback(sender, password, receivers, subject, body, resume_data):
    """Send emails via Gmail SMTP (for local development or supported clouds)."""
    server = None
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15)
        server.login(sender, password)
    except Exception:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(sender, password)

    success_count = 0
    for receiver in receivers:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = receiver
        msg.set_content(body)

        msg.add_attachment(
            resume_data,
            maintype="application",
            subtype="pdf",
            filename="Rajneesh_Choudhary_Resume.pdf"
        )
        server.send_message(msg)
        success_count += 1

    try:
        server.quit()
    except Exception:
        pass

    return success_count


# Home Page
@app.route("/")
def home():
    has_resume = bool(app_state["resume_url"]) or os.path.exists(LOCAL_RESUME_PATH)
    resume_source = "Google Drive" if app_state["resume_url"] else "Local File"
    return render_template("index.html", has_resume=has_resume, resume_source=resume_source)


# Get current settings
@app.route("/get-link")
def get_link():
    return jsonify({
        "resume_url": app_state["resume_url"],
        "source": "Google Drive" if app_state["resume_url"] else "Local File",
        "subject": app_state.get("subject", DEFAULT_SUBJECT),
        "body": app_state.get("body", DEFAULT_BODY),
        "brevo_api_key": app_state.get("brevo_api_key", "")
    })


# Update settings from UI
@app.route("/update-link", methods=["POST"])
def update_link():
    data = request.get_json(silent=True) or {}
    new_url = data.get("resume_url", "").strip()
    new_subject = data.get("subject", "").strip()
    new_body = data.get("body", "").strip()
    new_brevo_key = data.get("brevo_api_key", "").strip()

    if new_url:
        if "drive.google.com" not in new_url:
            return jsonify({"success": False, "message": "Yeh Google Drive link nahi hai! Please valid Drive link daalo."})
        app_state["resume_url"] = new_url

    if new_subject:
        app_state["subject"] = new_subject
    if new_body:
        app_state["body"] = new_body
    if "brevo_api_key" in data:
        app_state["brevo_api_key"] = new_brevo_key

    return jsonify({"success": True, "message": "Settings updated successfully! ✅"})


# Verify panel access password
@app.route("/verify-access", methods=["POST"])
def verify_access():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "").strip()
    if password == get_panel_password():
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid password"})


# Send Email API
@app.route("/send", methods=["POST"])
def send_email():
    data = request.get_json(silent=True) or {}
    emails_text = data.get("emails", "").strip()
    custom_subject = data.get("subject", "").strip() or app_state.get("subject", DEFAULT_SUBJECT)
    custom_body = data.get("body", "").strip() or app_state.get("body", DEFAULT_BODY)

    if not emails_text:
        return jsonify({"success": False, "message": "Please enter HR emails"})

    receivers = [email.strip() for email in emails_text.split(",") if email.strip()]
    if not receivers:
        return jsonify({"success": False, "message": "No valid emails found"})

    # Download resume
    resume_data = download_resume()
    if not resume_data:
        return jsonify({"success": False, "message": "Resume not found! Please check RESUME_URL or place resume.pdf in app folder."})

    sender = get_sender_email()
    brevo_key = get_brevo_api_key()

    # Method 1: If Brevo API Key is present, use HTTP REST API (Best for Render Free Tier)
    if brevo_key:
        try:
            count = send_via_brevo_api(brevo_key, sender, receivers, custom_subject, custom_body, resume_data)
            return jsonify({
                "success": True,
                "message": f"Successfully sent {count} email(s) via HTTPS API! 🚀"
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "message": str(e)
            })

    # Method 2: Fallback to Direct Gmail SMTP
    try:
        password = get_app_password()
        count = send_via_smtp_fallback(sender, password, receivers, custom_subject, custom_body, resume_data)
        return jsonify({
            "success": True,
            "message": f"Successfully sent {count} email(s) via SMTP!"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"SMTP Error: {str(e)}. (Tip: Set Brevo API Key in panel for 100% reliable cloud delivery)"
        })


# Run App
if __name__ == "__main__":
    app.run(debug=True)