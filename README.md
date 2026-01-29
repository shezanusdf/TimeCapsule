<img width="1552" height="647" alt="image" src="https://github.com/user-attachments/assets/78cdf5fb-4e3a-49df-8efe-6043c9ee5b31" />

##  Features

-  **Schedule up to 5 years** - Set any future date for delivery
-  **localStorage** - Never lose what you've written
-  **Automated delivery** - GitHub Actions sends emails daily
-  **Fully responsive** - Beautiful on desktop, tablet, and mobile


### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Firestore](https://img.shields.io/badge/Firestore-FF6F00?style=for-the-badge&logo=firebase&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)

##  How It Works

```
User writes letter
       ↓
Saved to Firestore
       ↓
GitHub Actions runs daily (9 AM UTC)
       ↓
Python script checks for scheduled emails
       ↓
Sends via Gmail SMTP
       ↓
Marks as sent in database
```


##  Installation & Setup

### Prerequisites
- Firebase account
- Gmail account with App Password enabled
- GitHub account

### 1. Clone the Repository

```bash
git clone https://github.com/shezanusdf/FutureMe.git
cd FutureMe
```

### 2. Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable Firestore Database (production mode)
3. Get your web config:
   - Project Settings → Your apps → Web
   - Copy the `firebaseConfig` object
4. Generate service account key:
   - Project Settings → Service Accounts → Generate new private key
   - Save the JSON file

### 3. Configure Frontend

Edit `script.js` and replace the Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 4. Gmail Setup

1. Enable 2-Factor Authentication on your Gmail
2. Generate an App Password:
   - Google Account → Security → App Passwords
   - Create password named "TimeCapsule Email Sender"
   - Save the 16-character password

### 5. GitHub Secrets

Add these secrets in your repo (Settings → Secrets and variables → Actions):

| Secret Name | Value |
|------------|-------|
| `FIREBASE_CREDENTIALS` | Entire contents of Firebase service account JSON |
| `SENDER_EMAIL` | Your Gmail address |
| `SENDER_PASSWORD` | Gmail App Password (not your regular password) |

### 6. Firestore Security Rules

In Firebase Console, add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scheduled_emails/{document} {
      // Allow anyone to create documents
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'send_date', 'letter', 'created_at', 'sent'])
                    && request.resource.data.sent == false;
      
      // Prevent reads, updates, and deletes from frontend
      allow read, update, delete: if false;
    }
  }
}
```

### 7. Deploy

**GitHub Pages:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
# Enable GitHub Pages in repo Settings → Pages
```

**Or use Netlify/Vercel:**
- Connect your GitHub repo
- Deploy with default settings

##  Project Structure

```
TimeCapsule/
├── index.html              # Main HTML file
├── style.css               # Responsive CSS with rem units
├── script.js               # Frontend logic with Firebase
├── send_emails.py          # Python email automation script
├── requirements.txt        # Python dependencies
├── .gitignore             # Git ignore rules
├── firestore.rules        # Firestore security rules
├── README.md              # This file
└── .github/
    └── workflows/
        └── send_emails.yml # GitHub Actions workflow
```



##  To-Do

- [ ] Add email preview before sending
- [ ] Support for multiple recipients
- [ ] FAQ Page
- [ ] Confirmation email when scheduled
- [ ] Rate limiting and captcha to prevent spam

##  Acknowledgments

- Inspired by [emailyourfutureself.com](https://www.emailyourfutureself.com/)
- UI inspired by classic Windows 95 aesthetic
- Built with love for people who want to reflect on their journey


**⭐ Star this repo if you found it helpful!**

Made with <3 and Coffee.


