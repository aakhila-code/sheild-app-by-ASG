import { db } from "./firebase-config.js";
import { collection, addDoc } from 
"https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
// ===============================
// GLOBAL VARIABLES
// ===============================
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let locationInterval;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let pinAttempts = 0;
const correctPin = "1234"; // Change PIN here
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  document.getElementById(pageId).classList.add('active');
}
// ===============================
// SCREEN NAVIGATION
// ===============================
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(screenId).classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

    if (screenId !== "pin-screen" && screenId !== "fake-call-screen") {
        const activeBtn = document.querySelector(`[data-screen="${screenId.replace("-screen", "")}"]`);
        if (activeBtn) activeBtn.classList.add("active");
    }
}

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        showScreen(btn.dataset.screen + "-screen");
    });
});



// ===============================
// PIN LOGIC
// ===============================
document.getElementById("pin-submit").addEventListener("click", () => {
    const pin = document.getElementById("pin-input").value;

    if (pin === correctPin) {
        showScreen("home-screen");
    } else {
        pinAttempts++;
        document.getElementById("pin-error").textContent = "Wrong PIN";

        if (pinAttempts >= 3) {
            triggerSilentSOS();
        }
    }
});



// ===============================
// SOS FUNCTION
// ===============================
document.getElementById("sos-button").addEventListener("click", triggerSOS);

function triggerSOS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const loc = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };

            sendLocationToContacts(loc);
            saveToHistory(loc);
            startLocationTracking();
            startAudioRecording();
        });
    }

    alert("SOS Triggered!");
}

function triggerSilentSOS() {
    triggerSOS();
}



// ===============================
// SEND LOCATION (SIMULATED)
// ===============================
function sendLocationToContacts(loc) {
    contacts.forEach(contact => {
        console.log(`Sending alert to ${contact.name}: Location ${loc.lat}, ${loc.lng}`);
    });
}



// ===============================
// LIVE LOCATION TRACKING
// ===============================
function startLocationTracking() {
    locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            console.log("Live location:", {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
        });
    }, 5000);
}



// ===============================
// AUDIO RECORDING
// ===============================
function startAudioRecording() {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                localStorage.setItem("emergencyAudio", URL.createObjectURL(audioBlob));
            };

            mediaRecorder.start();
            isRecording = true;
        });
    }
}



// ===============================
// FAKE CALL
// ===============================
document.getElementById("fake-call-trigger").addEventListener("dblclick", () => {
    showScreen("fake-call-screen");

    const audio = new Audio("assets/audio/ringtone.mp3");
    audio.play();

    triggerSilentSOS();
});

document.getElementById("accept-call").addEventListener("click", () => {
    const audio = new Audio("assets/audio/police_message.mp3");
    audio.play();

    setTimeout(() => showScreen("home-screen"), 5000);
});

document.getElementById("decline-call").addEventListener("click", () => {
    showScreen("home-screen");
});



// ===============================
// SHAKE DETECTION
// ===============================
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", e => {
        if (Math.abs(e.beta) > 30 || Math.abs(e.gamma) > 30) {
            triggerSOS();
        }
    });
}



// ===============================
// CONTACTS MANAGEMENT
// ===============================
function renderContacts() {
    const list = document.getElementById("contacts-list");
    list.innerHTML = "";

    contacts.forEach((c, i) => {
        const li = document.createElement("li");
        li.textContent = `${c.name}: ${c.phone}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteContact(i));

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

document.getElementById("add-contact").addEventListener("click", () => {
    document.getElementById("add-contact-modal").classList.remove("hidden");
});

document.getElementById("save-contact").addEventListener("click", () => {
    const name = document.getElementById("contact-name").value;
    const phone = document.getElementById("contact-phone").value;

    if (contacts.length < 5 && name && phone) {
        contacts.push({ name, phone });
        localStorage.setItem("contacts", JSON.stringify(contacts));
        renderContacts();
    }

    document.getElementById("add-contact-modal").classList.add("hidden");
});

function deleteContact(index) {
    contacts.splice(index, 1);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    renderContacts();
}



// ===============================
// HISTORY MANAGEMENT
// ===============================
function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    history.forEach(h => {
        const li = document.createElement("li");
        li.textContent = `${h.date}: ${h.location.lat}, ${h.location.lng}`;
        list.appendChild(li);
    });
}

function saveToHistory(loc) {
    const entry = {
        date: new Date().toLocaleString(),
        location: loc
    };

    history.push(entry);
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
}



// ===============================
// INITIALIZE
// ===============================
renderContacts();
renderHistory();
showScreen("pin-screen");

