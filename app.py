import os
import socket
import smtplib
import requests
from email.message import EmailMessage
from flask import Flask, render_template, request, jsonify

# ---------------- FORCE IPv4 (Fixes Render [Errno 101] Network is unreachable) ----------------
orig_getaddrinfo = socket.getaddrinfo

def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

socket.getaddrinfo = getaddrinfo_ipv4
# -----------------------------------------------------------------------------------------------

# Helper functions to get clean config settings
def get_sender_email():
    return os.environ.get("SENDER_EMAIL", "rajnees.choudhari@gmail.com").strip()

def get_app_password():
    return os.environ.get("APP_PASSWORD", "babhiblmcaepweeo").strip().replace(" ", "")

def get_panel_password():
    return os.environ.get("PANEL_PASSWORD", "solar27").strip()

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

# Google Drive Resume Link
app_state = {
    "resume_url": os.environ.get(
        "RESUME_URL", 
        "https://drive.google.com/file/d/1Uqpnxcekhy1pSZgCfC2uPEftnyQzm2Lr/view?usp=sharing"
    ).strip(),
    "subject": DEFAULT_SUBJECT,
    "body": DEFAULT_BODY
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
        "body": app_state.get("body", DEFAULT_BODY)
    })


# Update resume link and template from UI
@app.route("/update-link", methods=["POST"])
def update_link():
    data = request.get_json(silent=True) or {}
    new_url = data.get("resume_url", "").strip()
    new_subject = data.get("subject", "").strip()
    new_body = data.get("body", "").strip()

    if new_url:
        if "drive.google.com" not in new_url:
            return jsonify({"success": False, "message": "Yeh Google Drive link nahi hai! Please valid Drive link daalo."})
        app_state["resume_url"] = new_url

    if new_subject:
        app_state["subject"] = new_subject
    if new_body:
        app_state["body"] = new_body

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

    # Convert into list
    receivers = [email.strip() for email in emails_text.split(",") if email.strip()]

    if not receivers:
        return jsonify({"success": False, "message": "No valid emails found"})

    # Download resume first
    resume_data = download_resume()
    if not resume_data:
        return jsonify({"success": False, "message": "Resume not found! Please check RESUME_URL or place resume.pdf in app folder."})

    sender = get_sender_email()
    password = get_app_password()
    success_count = 0

    try:
        # Connect to SMTP (tries Port 587 with STARTTLS, then Port 465 with SSL)
        smtp_connected = False
        smtp_server = None

        # Attempt 1: Port 587 (Standard for Cloud Hosts)
        try:
            smtp_server = smtplib.SMTP("smtp.gmail.com", 587, timeout=20)
            smtp_server.ehlo()
            smtp_server.starttls()
            smtp_server.ehlo()
            smtp_server.login(sender, password)
            smtp_connected = True
        except Exception as e587:
            print(f"Port 587 failed: {e587}, trying port 465...")

        # Attempt 2: Port 465 (SSL)
        if not smtp_connected:
            smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20)
            smtp_server.login(sender, password)
            smtp_connected = True

        # Send all emails through open connection
        for receiver in receivers:
            msg = EmailMessage()
            msg["Subject"] = custom_subject
            msg["From"] = sender
            msg["To"] = receiver
            msg.set_content(custom_body)

            # Attach Resume
            msg.add_attachment(
                resume_data,
                maintype="application",
                subtype="pdf",
                filename="Rajneesh_Choudhary_Resume.pdf"
            )

            smtp_server.send_message(msg)
            success_count += 1

        try:
            smtp_server.quit()
        except Exception:
            pass

        return jsonify({
            "success": True,
            "message": f"Successfully sent {success_count} email(s)!"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error after sending {success_count} email(s): {str(e)}"
        })


# Run App
if __name__ == "__main__":
    app.run(debug=True)