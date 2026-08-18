import os
import tkinter as tk
from tkinter import messagebox
import smtplib
from email.message import EmailMessage

# ---------------- GMAIL SETTINGS ----------------
SENDER_EMAIL = "rajnees.choudhari@gmail.com"
APP_PASSWORD = "babhiblmcaepweeo"
# ------------------------------------------------

# Fixed Resume Path (Always finds resume.pdf next to app.py)
resume_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resume.pdf")


# Send Mail Function
def send_email():

    # Comma separated emails
    emails_text = email_entry.get("1.0", tk.END).strip()

    if not emails_text:
        messagebox.showerror("Error", "Please enter HR emails")
        return

    # Convert into list
    receivers = [email.strip() for email in emails_text.split(",") if email.strip()]

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

            # Attach Resume
            with open(resume_path, "rb") as f:
                msg.add_attachment(
                    f.read(),
                    maintype="application",
                    subtype="pdf",
                    filename="Rajneesh_Choudhary_Resume.pdf"
                )

            # Send Mail
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(SENDER_EMAIL, APP_PASSWORD)
                smtp.send_message(msg)

            success_count += 1

        messagebox.showinfo(
            "Success",
            f"Successfully sent {success_count} emails."
        )

    except Exception as e:
        messagebox.showerror("Error", str(e))


# ---------------- GUI ----------------

root = tk.Tk()

root.title("Mailer - Resume Sender")
root.geometry("600x350")
root.resizable(False, False)

# Heading
heading = tk.Label(
    root,
    text="Bulk Resume Mail Sender",
    font=("Arial", 18, "bold")
)
heading.pack(pady=15)

# Instruction
instruction = tk.Label(
    root,
    text="Enter comma separated HR emails:",
    font=("Arial", 11)
)
instruction.pack()

# Email Entry Box
email_entry = tk.Text(
    root,
    width=65,
    height=8,
    font=("Arial", 10)
)
email_entry.pack(pady=10)

# Send Button
send_btn = tk.Button(
    root,
    text="Send Emails",
    bg="green",
    fg="white",
    width=20,
    height=2,
    font=("Arial", 11, "bold"),
    command=send_email
)

send_btn.pack(pady=20)

# Run App
root.mainloop()