// Experience Exchange — travelling.js

let currentStep = 0;
let journeyTime = 0;
let budget = 5;
let circumstance = null;
let routeChoice = "";
let exploredCircumstances = [];

const directJourneyTime = 22;
const appointmentDeadline = 9 * 60 + 30;
const departureTime = 8 * 60 + 30;

const circumstances = [
    {
        id: "accessibility",
        name: "An accessibility barrier",
        description: "Parts of your route may not be physically accessible to you."
    },
    {
        id: "information",
        name: "An information barrier",
        description: "Important information about your route isn't always easy to find or understand."
    },
    {
        id: "budget",
        name: "A limited budget",
        description: "You need to complete your journey while keeping costs as low as possible."
    }
];

// ------------------------------
// TIME AND DISPLAY HELPERS
// ------------------------------

function varyTime(minutes) {
    if (minutes <= 0) return minutes;
    return Math.max(0, minutes + Math.floor(Math.random() * 5) - 2);
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getPanel() {
    return document.getElementById("journey-panel-content");
}

function updateStatus() {
    const directTime = currentStep >= 3 ? directJourneyTime : 0;
    const totalMinutes = departureTime + directTime + journeyTime;

    const timeDisplay = document.getElementById("time-display");
    const budgetDisplay = document.getElementById("budget-display");

    if (timeDisplay) {
        timeDisplay.textContent = formatTime(totalMinutes);
    }

    if (budgetDisplay) {
        budgetDisplay.textContent = `€${budget.toFixed(2)}`;
    }
}

function updateProgress() {
    const counter = document.getElementById("stage-counter");
    const fill = document.getElementById("progress-fill");

    if (counter) {
        counter.textContent = `${Math.min(currentStep, 7)} / 7`;
    }

    if (fill) {
        const percentage = Math.max(
            0,
            Math.min(100, ((currentStep - 1) / 6) * 100)
        );

        fill.style.width = `${percentage}%`;
    }
}

// ------------------------------
// SAVED CIRCUMSTANCES
// ------------------------------

function loadExploredCircumstances() {
    try {
        const saved = localStorage.getItem("experienceExchangeExplored");
        exploredCircumstances = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(exploredCircumstances)) {
            exploredCircumstances = [];
        }
    } catch (error) {
        exploredCircumstances = [];
    }
}

function saveExploredCircumstance() {
    if (!circumstance) return;

    if (!exploredCircumstances.includes(circumstance.id)) {
        exploredCircumstances.push(circumstance.id);
    }

    try {
        localStorage.setItem(
            "experienceExchangeExplored",
            JSON.stringify(exploredCircumstances)
        );
    } catch (error) {
        console.warn("Could not save explored circumstances.", error);
    }
}

// ------------------------------
// START AND CIRCUMSTANCE SELECTION
// ------------------------------

function startJourney() {
    currentStep = 0;
    journeyTime = 0;
    budget = 5;
    circumstance = null;
    routeChoice = "";

    updateStatus();
    updateProgress();

    const panel = getPanel();
    if (!panel) {
        console.error("Missing element: #journey-panel-content");
        return;
    }

    panel.innerHTML = `
        <p class="eyebrow">YOUR JOURNEY — BEFORE YOU BEGIN</p>
        <h2>One destination. Different circumstances.</h2>

        <p>
            You need to reach your destination. Your journey starts at 08:30.
            You have €5 available, or €2 in the limited-budget scenario.
        </p>

        <p>
            Your decisions may affect how much time and money you have left.
        </p>

        <h3>Choose a circumstance to explore.</h3>

        <button class="choice-button"
                onclick="selectCircumstance('accessibility')">
            <strong>An accessibility barrier</strong>
            <span>Parts of your route may not be accessible.</span>
        </button>

        <button class="choice-button"
                onclick="selectCircumstance('information')">
            <strong>An information barrier</strong>
            <span>Some route information is unclear or difficult to find.</span>
        </button>

        <button class="choice-button"
                onclick="selectCircumstance('budget')">
            <strong>A limited budget</strong>
            <span>You need to keep your travel costs low.</span>
        </button>

        <button class="choice-button"
                onclick="selectRandomCircumstance()">
            <strong>Surprise me</strong>
            <span>Explore a circumstance you haven't tried yet.</span>
        </button>
    `;
}

function selectCircumstance(id) {
    const selected = circumstances.find(item => item.id === id);

    if (!selected) {
        console.error("Unknown circumstance:", id);
        return;
    }

    circumstance = selected;
    showCircumstance();
}

function selectRandomCircumstance() {
    loadExploredCircumstances();

    const unexplored = circumstances.filter(
        item => !exploredCircumstances.includes(item.id)
    );

    const pool = unexplored.length > 0 ? unexplored : circumstances;

    circumstance = pool[Math.floor(Math.random() * pool.length)];

    showCircumstance();
}

function showCircumstance() {
    if (!circumstance) return;

    currentStep = 2;
    journeyTime = 0;
    budget = circumstance.id === "budget" ? 2 : 5;
    routeChoice = "";

    updateStatus();
    updateProgress();

    const panel = getPanel();
    if (!panel) return;

    panel.innerHTML = `
        <p class="eyebrow">02 — YOUR CIRCUMSTANCE</p>
        <h2>${circumstance.name}</h2>
        <p>${circumstance.description}</p>

        <p>
            This scenario focuses on one possible barrier. It cannot represent
            everyone's experiences, but it can help you consider how
            circumstances affect everyday choices.
        </p>

        <button class="choice-button" onclick="makeChoice(0, 0)">
            <strong>Continue your journey</strong>
            <span>See how your circumstances affect your options.</span>
        </button>

        <button class="choice-button" onclick="startJourney()">
            <strong>Choose a different circumstance</strong>
            <span>Return to the selection screen.</span>
        </button>
    `;
}

// ------------------------------
// POLICE ENCOUNTER
// ------------------------------

function checkPoliceEncounter() {
    if (budget >= 0) return false;
    if (Math.random() >= 0.15) return false;

    showPoliceCaught();
    return true;
}

function showPoliceCaught() {
    saveExploredCircumstance();

    currentStep = 7;

    updateStatus();
    updateProgress();

    const panel = getPanel();
    if (!panel) return;

    panel.innerHTML = `
        <p class="eyebrow">07 — AN UNEXPECTED ENDING</p>
        <h2>You've been stopped.</h2>

        <p>
            Your balance dropped below €0, and you were caught travelling
            without enough money for the fare. This outcome is random:
            there was a 15% chance after a choice made while your balance
            was negative.
        </p>

        <div class="result-message">
            <h2>Same destination. Different journey.</h2>

            <p>
                A limited budget can affect more than the route you choose.
                It can add uncertainty and consequences to an already
                difficult journey.
            </p>

            <p class="exploration-count">
                ${exploredCircumstances.length} / ${circumstances.length}
                circumstances explored
            </p>
        </div>

        <button class
