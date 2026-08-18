import os
import smtplib
import requests
from email.message import EmailMessage
from flask import Flask, render_template, request, jsonify

# ---------------- SETTINGS ----------------
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "rajnees.choudhari@gmail.com")
APP_PASSWORD = os.environ.get("APP_PASSWORD", "dvbkeywhbeduoxjb")
PANEL_PASSWORD = os.environ.get("PANEL_PASSWORD", "quicksolar2026")
# ------------------------------------------

# Google Drive Resume Link
# Website se bhi update kar sakte ho, ya Render pe RESUME_URL env variable set karo.
app_state = {
    "resume_url": os.environ.get("RESUME_URL", "")
}

# Local fallback resume path
LOCAL_RESUME_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resume.pdf")

app = Flask(__name__)


def get_drive_direct_link(share_link):
    """Convert Google Drive share link to direct download link."""
    # Extract file ID from various Google Drive URL formats
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
            print(f"Google Drive download failed: {e}, trying local file...")

    # Fallback: local resume.pdf
    if os.path.exists(LOCAL_RESUME_PATH):
        with open(LOCAL_RESUME_PATH, "rb") as f:
            return f.read()

    return None


# Home Page
@app.route("/")
def home():
    has_resume = bool(app_state["resume_url"]) or os.path.exists(LOCAL_RESUME_PATH)
    resume_source = "Google Drive" if app_state["resume_url"] else "Local File"
    return render_template("index.html", has_resume=has_resume, resume_source=resume_source)


# Get current resume link
@app.route("/get-link")
def get_link():
    return jsonify({
        "resume_url": app_state["resume_url"],
        "source": "Google Drive" if app_state["resume_url"] else "Local File"
    })


# Update resume link from UI
@app.route("/update-link", methods=["POST"])
def update_link():
    data = request.get_json()
    new_url = data.get("resume_url", "").strip()

    if not new_url:
        return jsonify({"success": False, "message": "Please enter a Google Drive link!"})

    if "drive.google.com" not in new_url:
        return jsonify({"success": False, "message": "Yeh Google Drive link nahi hai! Please valid Drive link daalo."})

    app_state["resume_url"] = new_url
    return jsonify({"success": True, "message": "Resume link updated successfully! ✅"})


# Verify panel access password
@app.route("/verify-access", methods=["POST"])
def verify_access():
    data = request.get_json()
    password = data.get("password", "")
    if password == PANEL_PASSWORD:
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid password"})


# Send Email API
@app.route("/send", methods=["POST"])
def send_email():
    data = request.get_json()
    emails_text = data.get("emails", "").strip()

    if not emails_text:
        return jsonify({"success": False, "message": "Please enter HR emails"})

    # Convert into list
    receivers = [email.strip() for email in emails_text.split(",") if email.strip()]

    if not receivers:
        return jsonify({"success": False, "message": "No valid emails found"})

    # Download resume first
    resume_data = download_resume()
    if not resume_data:
        return jsonify({"success": False, "message": "Resume not found! Please set RESUME_URL or place resume.pdf in app folder."})

    success_count = 0

    try:
        for receiver in receivers:

            # Email setup
            msg = EmailMessage()

            msg["Subject"] = "Application for Job Opportunities"

            msg["From"] = SENDER_EMAIL
            msg["To"] = receiver

            # Email Body
            body = f"""
Dear Hiring Team,

I am Rajneesh Choudhary. I have completed my B.Tech in Electrical & Electronics Engineering from RGPV Bhopal and M.Tech in Digital Communication from Ujjain Engineering College, Ujjain.

I have experience in team handling, coordination, and reporting, along with knowledge of solar PV systems and electrical fundamentals. I am looking for suitable opportunities in your organization.

Please find my resume attached for your consideration.

Best regards,
Rajneesh Choudhary
+91 6261612684
rajnees.choudhari@gmail.com
"""

            msg.set_content(body)

            # Attach Resume (from Google Drive or local)
            msg.add_attachment(
                resume_data,
                maintype="application",
                subtype="pdf",
                filename="Rajneesh_Choudhary_Resume.pdf"
            )

            # Send Mail
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(SENDER_EMAIL, APP_PASSWORD)
                smtp.send_message(msg)

            success_count += 1

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