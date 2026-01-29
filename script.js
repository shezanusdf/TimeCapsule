// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJ3rNfW1NgcHhGoSyhbduNKkSxFzZdWrc",
  authDomain: "futureme-9c4c4.firebaseapp.com",
  projectId: "futureme-9c4c4",
  storageBucket: "futureme-9c4c4.firebasestorage.app",
  messagingSenderId: "300004949198",
  appId: "1:300004949198:web:75908e6819d07c8e6c249f",
  measurementId: "G-TDLE7PGLMH"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements - Using IDs for more reliable selection
const letterContent = document.getElementById('letter');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const dateInput = document.getElementById('date-input');
const scheduleButton = document.getElementById('schedule-button');
const minimizeBtn = document.querySelector('.win-btn.minimize');
const maximizeBtn = document.querySelector('.win-btn.maximize');
const closeBtn = document.querySelector('.win-btn.close');
const letterWindow = document.getElementById('letter-window');
const windowBody = document.getElementById('window-body');

// Local Storage Keys
const STORAGE_KEYS = {
    letter: 'timeCapsule_letter',
    name: 'timeCapsule_name',
    email: 'timeCapsule_email',
    date: 'timeCapsule_date'
};

// Load saved data from localStorage
function loadSavedData() {
    const savedLetter = localStorage.getItem(STORAGE_KEYS.letter);
    const savedName = localStorage.getItem(STORAGE_KEYS.name);
    const savedEmail = localStorage.getItem(STORAGE_KEYS.email);
    const savedDate = localStorage.getItem(STORAGE_KEYS.date);

    if (savedLetter) letterContent.textContent = savedLetter;
    if (savedName) nameInput.value = savedName;
    if (savedEmail) emailInput.value = savedEmail;
    if (savedDate) dateInput.value = savedDate;
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.letter, letterContent.textContent);
    localStorage.setItem(STORAGE_KEYS.name, nameInput.value);
    localStorage.setItem(STORAGE_KEYS.email, emailInput.value);
    localStorage.setItem(STORAGE_KEYS.date, dateInput.value);
}

// Clear localStorage
function clearLocalStorage() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// Auto-save on input
letterContent.addEventListener('input', saveToLocalStorage);
nameInput.addEventListener('input', saveToLocalStorage);
emailInput.addEventListener('input', saveToLocalStorage);
dateInput.addEventListener('input', saveToLocalStorage);

// Validate date format (DD-MM-YYYY)
function isValidDate(dateString) {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Check if date is valid
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Check if date is in the future (up to 5 years)
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
    
    if (inputDate <= today) {
        alert('Date must be in the future!');
        return false;
    }
    
    if (inputDate > fiveYearsFromNow) {
        alert('Date cannot be more than 5 years in the future!');
        return false;
    }
    
    return true;
}

// Validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Show success message
function showSuccessMessage(sendDate) {
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    
    const successBox = document.createElement('div');
    successBox.style.cssText = `
        background: #f0f0f0;
        border: 2px solid #888;
        box-shadow: 5px 5px 0 #555;
        padding: 30px 40px;
        text-align: center;
        font-family: 'Courier New', monospace;
        max-width: 400px;
    `;
    
    successBox.innerHTML = `
        <div style="background: #000080; color: white; padding: 10px; margin: -30px -40px 20px -40px; font-weight: bold;">
            ✓ Success!
        </div>
        <div style="font-size: 1.1rem; margin-bottom: 20px; line-height: 1.6;">
            Your letter has been scheduled!<br><br>
            <strong>Send Date:</strong> ${sendDate}<br><br>
            You'll receive your email on this date 🎉
        </div>
        <button id="close-success" style="
            background: #c0c0c0;
            border: 2px solid #fff;
            border-bottom-color: #808080;
            border-right-color: #808080;
            padding: 8px 20px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            box-shadow: inset -1px -1px 0 #fff, inset 1px 1px 0 #808080;
        ">OK</button>
    `;
    
    overlay.appendChild(successBox);
    document.body.appendChild(overlay);
    
    // Close on button click or overlay click
    document.getElementById('close-success').addEventListener('click', () => {
        overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// Schedule email
async function scheduleEmail() {
    console.log('🚀 Schedule button clicked!');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const sendDate = dateInput.value.trim();
    const letter = letterContent.textContent.trim();
    
    console.log('📝 Form data:', { name, email, sendDate, letterLength: letter.length });
    
    // Validation
    if (!name) {
        alert('Please enter your name');
        nameInput.focus();
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        emailInput.focus();
        return;
    }
    
    if (!sendDate || !isValidDate(sendDate)) {
        alert('Please enter a valid date in DD-MM-YYYY format');
        dateInput.focus();
        return;
    }
    
    if (!letter || letter === 'Dear Me,' || letter.length < 10) {
        alert('Please write your letter (at least a few words!)');
        letterContent.focus();
        return;
    }
    
    // Disable button to prevent double submission
    scheduleButton.disabled = true;
    scheduleButton.textContent = 'Scheduling...';
    scheduleButton.style.cursor = 'wait';
    
    try {
        console.log('💾 Saving to Firestore...');
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'scheduled_emails'), {
            name: name,
            email: email,
            send_date: sendDate,
            letter: letter,
            created_at: new Date(),
            sent: false
        });
        
        console.log('✅ Document written with ID:', docRef.id);
        
        // Show success message
        showSuccessMessage(sendDate);
        
        // Clear the form and localStorage
        setTimeout(() => {
            letterContent.textContent = 'Dear Me,';
            nameInput.value = '';
            emailInput.value = '';
            dateInput.value = '';
            clearLocalStorage();
            console.log('🧹 Form cleared');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error scheduling email:', error);
        alert(`Error: ${error.message}\n\nPlease check:\n1. Firebase config is correct\n2. You're online\n3. Firestore rules allow writes`);
    } finally {
        scheduleButton.disabled = false;
        scheduleButton.textContent = 'Send Email';
        scheduleButton.style.cursor = 'pointer';
    }
}

// Window controls
let isMaximized = false;

// Maximize - expands the window
maximizeBtn.addEventListener('click', () => {
    if (!isMaximized) {
        letterWindow.classList.add('maxed');
        isMaximized = true;
        maximizeBtn.textContent = '□'; // Already shows this, but ensure it
    }
});

// Minimize - only works when maximized, restores to original size
minimizeBtn.addEventListener('click', () => {
    if (isMaximized) {
        letterWindow.classList.remove('maxed');
        isMaximized = false;
    }
    // If not maximized, do nothing
});

// Close - clears all content but keeps window open
closeBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear everything? This cannot be undone.')) {
        letterContent.textContent = 'Dear Me,';
        nameInput.value = '';
        emailInput.value = '';
        dateInput.value = '';
        clearLocalStorage();
        console.log('🗑️ All content cleared');
    }
});

// Schedule button
scheduleButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Button click event fired');
    scheduleEmail();
});

// Load saved data on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Page loaded, initializing...');
    loadSavedData();
    console.log('✅ Saved data loaded');
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

console.log('✅ Script.js loaded successfully');