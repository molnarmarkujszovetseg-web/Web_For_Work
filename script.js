// "Adatbázis" - most már "let", hogy módosíthassuk (törölhessünk belőle), és kaptak egyedi "id"-t
let mockData = [
    { id: 1, day: "Hétfő", start: "08:00", end: "16:00", category: "munka", title: "Kódolás" },
    { id: 2, day: "Hétfő", start: "16:30", end: "18:00", category: "egyeni", title: "Edzés" },
    { id: 3, day: "Hétfő", start: "22:00", end: "06:00", category: "alvas", title: "Alvás" },
    { id: 4, day: "Kedd", start: "12:05", end: "13:05", category: "szolgalat", title: "Szállítás boltba" },
    { id: 5, day: "Kedd", start: "14:00", end: "18:00", category: "munka", title: "Projekt megbeszélés" }
];

const daysOfWeek = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

// Időtartam kiszámítása
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

// Időpont átalakítása pixellé
function timeToPixels(timeStr) {
    let [hh, mm] = timeStr.split(':').map(Number);
    
    if (hh < 5 || (hh === 5 && mm < 30)) {
        hh += 24;
    }
    
    let totalMinutes = (hh - 5) * 60 + (mm - 30);
    return totalMinutes; 
}

// Jogosultság (Főnök / Szerkesztő) váltása
function toggleEditor() {
    const role = document.getElementById("roleSelect").value;
    document.getElementById("editorSection").style.display = role === "edit" ? "block" : "none";
    // Újrarendereljük a naptárat, hogy az X gombok megjelenjenek vagy eltűnjenek a szerepkörtől függően
    renderData();
}

// Kategória figyelése (Alvás automatizálás)
function handleCategoryChange() {
    const category = document.getElementById("editCategory").value;
    const titleInput = document.getElementById("editTitle");
    
    if (category === "alvas") {
        titleInput.value = "Alvás"; 
        titleInput.disabled = true; 
    } else {
        if (titleInput.value === "Alvás") {
            titleInput.value = ""; 
        }
        titleInput.disabled = false; 
    }
}

// --- ESEMÉNY TÖRLÉSE (MODAL LOGIKA) ---
let eventIdToDelete = null; // Ide mentjük el átmenetileg, hogy melyik kártyára kattintottál

function deleteEvent(id) {
    eventIdToDelete = id; // Megjegyezzük az ID-t
    document.getElementById("deleteModal").style.display = "flex"; // Megjelenítjük a szép ablakot
}

function closeDeleteModal() {
    eventIdToDelete = null; // Elfelejtjük az ID-t
    document.getElementById("deleteModal").style.display = "none"; // Eltüntetjük az ablakot
}

function confirmDelete() {
    if (eventIdToDelete !== null) {
        // Ténylegesen töröljük az adatot
        mockData = mockData.filter(event => event.id !== eventIdToDelete);
        renderData(); // Frissítjük a naptárat
        closeDeleteModal(); // Bezárjuk az ablakot
    }
}

// Új bejegyzés hozzáadása
function addEvent(event) {
    event.preventDefault();

    const day = document.getElementById("editDay").value;
    const start = document.getElementById("editStart").value;
    const end = document.getElementById("editEnd").value;
    const category = document.getElementById("editCategory").value;
    const title = document.getElementById("editTitle").value;

    const newEntry = {
        id: Date.now(), // Egyedi azonosítót generálunk a jelenlegi időbélyeg alapján
        day: day,
        start: start,
        end: end,
        category: category,
        title: title
    };

    mockData.push(newEntry);

    document.getElementById("addEventForm").reset();
    handleCategoryChange(); 
    renderData();
}

// Adatok renderelése
function renderData() {
    const role = document.getElementById("roleSelect").value; // Megnézzük, hogy szerkesztő-e
    const view = document.getElementById("viewSelect").value;
    const filter = document.getElementById("filterSelect").value;
    
    const calendarEl = document.getElementById("calendarView");
    const emailEl = document.getElementById("emailView");

    calendarEl.innerHTML = "";
    emailEl.innerHTML = "<h3>Heti riport</h3>";

    if (view === "calendar") {
        calendarEl.style.display = "grid";
        emailEl.style.display = "none";
        
        // 1. IDŐVONAL
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

        // 2. NAPOK
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

        // 3. ESEMÉNYEK
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
            
            // Ha Szerkesztő módban vagyunk, hozzáadjuk az X gombot!
            if (role === "edit") {
                cardHTML += `<span class="delete-btn" onclick="deleteEvent(${event.id})" title="Törlés">×</span>`;
            }
            
            card.innerHTML = cardHTML;
            card.style.top = topPx + "px";
            card.style.height = heightPx + "px";
            
            dayContainers[event.day].appendChild(card);
        });

    } else {
        // EMAIL NÉZET
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
            
            // Ha Szerkesztő módban vagyunk, az Email nézetbe is teszünk egy piros [Törlés] gombot
            if (role === "edit") {
                listItem.innerHTML = `<span>${itemText}</span> <span onclick="deleteEvent(${event.id})" style="color: #ff4d4d; cursor: pointer; margin-left: 10px; font-weight: bold; font-size: 0.9em;">[Törlés]</span>`;
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
    toggleEditor(); // A toggleEditor már magában hívja a renderData()-t
};