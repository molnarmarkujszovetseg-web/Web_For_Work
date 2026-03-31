// --- 1. FIREBASE BEÁLLÍTÁSOK ÉS CSATLAKOZÁS ---
const firebaseConfig = {
    apiKey: "AIzaSyCpWQT5k6-GZsVddgXcnpyqa94OQ7HIr90",
    authDomain: "webforwork.firebaseapp.com",
    projectId: "webforwork",
    storageBucket: "webforwork.firebasestorage.app",
    messagingSenderId: "351047964125",
    appId: "1:351047964125:web:49bf7a0f5de4c89afb1234",
    measurementId: "G-L7ZRCY5RJF"
};

// Inicializáljuk a rendszert
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 2. ADATOK BETÖLTÉSE ÉLŐBEN A FELHŐBŐL ---
let mockData = []; // Mostantól üresen indul, a Google tölti fel!

// Az onSnapshot folyamatosan figyeli az adatbázist. Ha te vagy a főnököd megnyitja, azonnal frissül!
db.collection("munkak").onSnapshot((querySnapshot) => {
    mockData = []; // Kiürítjük a régi listát
    querySnapshot.forEach((doc) => {
        let adat = doc.data();
        adat.id = doc.id; // A Firebase ad neki egy egyedi azonosítót
        mockData.push(adat);
    });
    renderData(); // Újrarajzoljuk a naptárat a friss adatokkal!
});

const daysOfWeek = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

// --- 3. SEGÉDFUNKCIÓK (Idő számolás) ---
function calculateDuration(start, end) {
    let [startH, startM] = start.split(':').map(Number);
    let [endH, endM] = end.split(':').map(Number);
    if (endH < startH) endH += 24;
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    let hours = Math.floor(diffMins / 60);
    let mins = diffMins % 60;
    if (mins === 0) return `${hours} óra`;
    if (hours === 0) return `${mins} perc`;
    return `${hours} óra ${mins} perc`;
}

function timeToPixels(timeStr) {
    let [hh, mm] = timeStr.split(':').map(Number);
    if (hh < 5 || (hh === 5 && mm < 30)) hh += 24;
    return (hh - 5) * 60 + (mm - 30); 
}

function toggleEditor() {
    const role = document.getElementById("roleSelect").value;
    document.getElementById("editorSection").style.display = role === "edit" ? "block" : "none";
    renderData();
}

function handleCategoryChange() {
    const category = document.getElementById("editCategory").value;
    const titleInput = document.getElementById("editTitle");
    if (category === "alvas") {
        titleInput.value = "Alvás"; 
        titleInput.disabled = true; 
    } else {
        if (titleInput.value === "Alvás") titleInput.value = ""; 
        titleInput.disabled = false; 
    }
}

// --- 4. ADATBÁZIS MŰVELETEK (HOZZÁADÁS ÉS TÖRLÉS) ---

// Új bejegyzés küldése a Google szerverére
function addEvent(event) {
    event.preventDefault();
    const day = document.getElementById("editDay").value;
    const start = document.getElementById("editStart").value;
    const end = document.getElementById("editEnd").value;
    const category = document.getElementById("editCategory").value;
    const title = document.getElementById("editTitle").value;

    // db.collection.add -> ez menti el a felhőbe!
    db.collection("munkak").add({
        day: day,
        start: start,
        end: end,
        category: category,
        title: title
    }).then(() => {
        // Ha sikeres a mentés, kiürítjük az űrlapot
        document.getElementById("addEventForm").reset();
        handleCategoryChange(); 
    }).catch((error) => {
        alert("Hiba történt a mentéskor: " + error);
    });
}

// Törlés modal logikája
let eventIdToDelete = null;

function deleteEvent(id) {
    eventIdToDelete = id;
    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
    eventIdToDelete = null;
    document.getElementById("deleteModal").style.display = "none";
}

// Törlés a Google szerveréről
function confirmDelete() {
    if (eventIdToDelete !== null) {
        db.collection("munkak").doc(eventIdToDelete).delete().then(() => {
            closeDeleteModal();
        }).catch((error) => {
            alert("Hiba történt a törléskor: " + error);
        });
    }
}

// --- 5. NAPTÁR KIRAJZOLÁSA ---
function renderData() {
    const role = document.getElementById("roleSelect").value;
    const view = document.getElementById("viewSelect").value;
    const filter = document.getElementById("filterSelect").value;
    
    const calendarEl = document.getElementById("calendarView");
    const emailEl = document.getElementById("emailView");

    calendarEl.innerHTML = "";
    emailEl.innerHTML = "<h3>Heti riport</h3>";

    if (view === "calendar") {
        calendarEl.style.display = "grid";
        emailEl.style.display = "none";
        
        let sidebar = document.createElement("div");
        sidebar.className = "time-sidebar";
        
        let t = document.createElement("div");
        t.className = "time-label";
        t.style.top = "0px";
        t.innerText = "5:30";
        sidebar.appendChild(t);

        for (let i = 6; i < 6 + 24; i++) {
            let hour = i % 24;
            let topPos = (i - 5) * 60 - 30; 
            if (topPos > 0 && topPos < 1440) {
                let label = document.createElement("div");
                label.className = "time-label";
                label.style.top = topPos + "px";
                label.innerText = hour + ":00";
                sidebar.appendChild(label);
            }
        }
        
        let endT = document.createElement("div");
        endT.className = "time-label";
        endT.style.top = "1440px";
        endT.innerText = "5:30";
        sidebar.appendChild(endT);
        
        calendarEl.appendChild(sidebar);

        const dayContainers = {};
        daysOfWeek.forEach(day => {
            let col = document.createElement("div");
            col.className = "day-column";
            
            let header = document.createElement("div");
            header.className = "day-header";
            header.innerText = day;
            col.appendChild(header);

            let content = document.createElement("div");
            content.className = "day-content";
            dayContainers[day] = content; 
            col.appendChild(content);

            calendarEl.appendChild(col);
        });

        mockData.forEach(event => {
            if (filter === "munka" && event.category !== "munka") return;
            if (filter === "szolgalat" && event.category !== "szolgalat") return;
            if (filter === "munka_szolgalat" && event.category !== "munka" && event.category !== "szolgalat") return;

            let topPx = timeToPixels(event.start);
            let endPx = timeToPixels(event.end);
            if (endPx <= topPx) endPx += 1440; 
            
            let heightPx = endPx - topPx;
            let duration = calculateDuration(event.start, event.end);

            let card = document.createElement("div");
            card.className = `event-card cat-${event.category}`;
            
            let cardHTML = `<strong>${event.start}-${event.end}</strong> (${duration})<br>${event.title}`;
            if (role === "edit") {
                cardHTML += `<span class="delete-btn" onclick="deleteEvent('${event.id}')" title="Törlés">×</span>`;
            }
            
            card.innerHTML = cardHTML;
            card.style.top = topPx + "px";
            card.style.height = heightPx + "px";
            
            dayContainers[event.day].appendChild(card);
        });

    } else {
        calendarEl.style.display = "none";
        emailEl.style.display = "block";
        
        mockData.forEach(event => {
            if (filter === "munka" && event.category !== "munka") return;
            if (filter === "szolgalat" && event.category !== "szolgalat") return;
            if (filter === "munka_szolgalat" && event.category !== "munka" && event.category !== "szolgalat") return;

            let duration = calculateDuration(event.start, event.end);
            let displayText = `${event.start}-${event.end} (${duration}) ${event.title}`;

            let listItem = document.createElement("div");
            listItem.className = "email-item";
            
            let itemText = `${event.day}: ${displayText} [Kategória: ${event.category}]`;
            if (role === "edit") {
                listItem.innerHTML = `<span>${itemText}</span> <span onclick="deleteEvent('${event.id}')" style="color: #ff4d4d; cursor: pointer; margin-left: 10px; font-weight: bold; font-size: 0.9em;">[Törlés]</span>`;
            } else {
                listItem.innerText = itemText;
            }
            
            emailEl.appendChild(listItem);
        });
    }
}

// Betöltés
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role'); 
    if (role) {
        document.getElementById("roleSelect").value = role;
    }
    toggleEditor(); 
};