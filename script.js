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

// DOM Elements
const letterContent = document.getElementById('letter');
const nameInput = document.querySelector('input[type="text"]');
const emailInput = document.querySelector('input[type="email"]');
const dateInput = document.querySelectorAll('input[type="text"]')[1];
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

// Schedule email
async function scheduleEmail() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const sendDate = dateInput.value.trim();
    const letter = letterContent.textContent.trim();
    
    // Validation
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (!sendDate || !isValidDate(sendDate)) {
        alert('Please enter a valid date in DD-MM-YYYY format');
        return;
    }
    
    if (!letter || letter === 'Dear Me,') {
        alert('Please write your letter');
        return;
    }
    
    // Disable button to prevent double submission
    scheduleButton.disabled = true;
    scheduleButton.textContent = 'Scheduling...';
    
    try {
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'scheduled_emails'), {
            name: name,
            email: email,
            send_date: sendDate,
            letter: letter,
            created_at: new Date(),
            sent: false
        });
        
        console.log('Document written with ID: ', docRef.id);
        
        // Success message
        alert(`Success! Your letter will be sent on ${sendDate} 🎉`);
        
        // Clear the form and localStorage
        letterContent.textContent = 'Dear Me,';
        nameInput.value = '';
        emailInput.value = '';
        dateInput.value = '';
        clearLocalStorage();
        
    } catch (error) {
        console.error('Error scheduling email: ', error);
        alert('There was an error scheduling your email. Please try again.');
    } finally {
        scheduleButton.disabled = false;
        scheduleButton.textContent = 'Send Email';
    }
}

// Window controls

let isMaximized = false;

/* MAXIMIZE */
document.querySelector(".maximize").onclick = () => {
    // Only allow maximize once
    if (isMaximized) return;

    letterWindow.classList.add("maxed");
    letterWindow.classList.remove("minimized");

    isMaximized = true;
};

/* MINIMIZE (restore to original size) */
document.querySelector(".minimize").onclick = () => {
    // Only works if currently maximized
    if (!isMaximized) return;

    letterWindow.classList.remove("maxed");
    letterWindow.classList.remove("minimized");

    isMaximized = false;
};

/* CLOSE */
document.querySelector(".close").onclick = () => {
    if (confirm("Close window? Unsaved text will be lost.")) {
        letter.innerText = "";
    }
};


// Schedule button
scheduleButton.addEventListener('click', scheduleEmail);

// Load saved data on page load
window.addEventListener('DOMContentLoaded', loadSavedData);