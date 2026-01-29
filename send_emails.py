import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import json

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    # Get credentials from environment variable
    cred_json = os.environ.get('FIREBASE_CREDENTIALS')
    if not cred_json:
        raise ValueError("FIREBASE_CREDENTIALS environment variable not set")
    
    cred_dict = json.loads(cred_json)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    return firestore.client()

def send_email(to_email, name, letter_content, send_date):
    """Send email using Gmail SMTP"""
    sender_email = os.environ.get('SENDER_EMAIL')
    sender_password = os.environ.get('SENDER_PASSWORD')
    
    if not sender_email or not sender_password:
        raise ValueError("Email credentials not set in environment variables")
    
    # Create message
    message = MIMEMultipart("alternative")
    message["Subject"] = f"A letter from your past self - {send_date}"
    message["From"] = f"Time Capsule <{sender_email}>"
    message["To"] = to_email
    
    # Create HTML email body
    html = f"""
    <html>
      <body style="font-family: 'Courier New', monospace; background-color: #f0f0f0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border: 2px solid #888; box-shadow: 5px 5px 0 #555;">
          <div style="background: #000080; color: white; padding: 10px; font-weight: bold;">
            Time Capsule - Letter from {send_date}
          </div>
          <div style="padding: 20px; white-space: pre-wrap; line-height: 1.6;">
{letter_content}
          </div>
          <div style="padding: 20px; background: #f0f0f0; border-top: 2px solid #888; font-size: 0.9em; color: #666;">
            This letter was scheduled on {send_date} and delivered today.
          </div>
        </div>
      </body>
    </html>
    """
    
    part = MIMEText(html, "html")
    message.attach(part)
    
    # Send email
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False

def check_and_send_emails():
    """Check Firestore for emails to send today"""
    db = initialize_firebase()
    today = datetime.now().strftime("%d-%m-%Y")
    
    print(f"Checking for emails to send on {today}")
    
    # Query for emails scheduled for today that haven't been sent
    emails_ref = db.collection('scheduled_emails')
    query = emails_ref.where('send_date', '==', today).where('sent', '==', False)
    
    docs = query.stream()
    emails_sent = 0
    
    for doc in docs:
        data = doc.to_dict()
        email = data.get('email')
        name = data.get('name')
        letter = data.get('letter')
        send_date = data.get('send_date')
        
        print(f"Processing email for {name} ({email})")
        
        # Send the email
        if send_email(email, name, letter, send_date):
            # Mark as sent in Firestore
            doc.reference.update({'sent': True, 'sent_at': datetime.now()})
            emails_sent += 1
        else:
            print(f"Failed to send email to {email}, will retry tomorrow")
    
    print(f"Total emails sent: {emails_sent}")
    return emails_sent

if __name__ == "__main__":
    try:
        count = check_and_send_emails()
        print(f"Job completed successfully. Sent {count} emails.")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise
