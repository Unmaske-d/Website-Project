let currentStep = 0;
let journeyTime = 0;
let budget = 5;
let circumstance = "";
let routeChoice = "";
let exploredCircumstances = [];

const directJourneyTime = 22;
const appointmentDeadline = 9 * 60 + 30; // 09:30

const circumstances = [
    {
        id: "accessibility",
        name: "An accessibility barrier",
        description:
            "Parts of your route may not be physically accessible to you."
    },
    {
        id: "information",
        name: "An information barrier",
        description:
            "Important information about your route isn't always easy to find or understand."
    },
    {
        id: "budget",
        name: "A limited budget",
        description:
            "You need to complete your journey while keeping costs as low as possible."
    }
];

// ==============================
// POLICE ENCOUNTER
// ==============================

function checkPoliceEncounter() {
    // Only check for an encounter if the budget is negative.
    if (budget >= 0) return false;

    // 15% chance of getting caught on each choice.
    if (Math.random() >= 0.15) return false;

    showPoliceCaught();
    return true;
}

function showPoliceCaught() {
    currentStep = 7;

    updateStatus();
    updateProgress();

    const panel = document.getElementById("journey-panel-content");
    if (!panel) return;

    panel.innerHTML = `
        <p class="eyebrow">07 — JOURNEY INTERRUPTED</p>

        <h2>Well, this is awkward.</h2>

        <p>
            The police have stopped your journey.
            Apparently, a negative budget isn't a valid
            travel pass.
        </p>

        <div class="result-message">
            <h2>Fare evasion detected.</h2>

            <p>
                You were caught travelling while in debt.
                Your journey ends here.
            </p>

            <p>Final budget: €${budget.toFixed(2)}</p>
        </div>

        <div style="margin-top: 35px;">
            <button class="choice-button" onclick="startJourney()">
                <strong>Try another journey</strong>
                <span>
                    Perhaps make slightly better financial decisions.
                </span>
            </button>
        </div>
    `;
}

// ==============================
// TIME VARIATION
// ==============================

function varyTime(minutes) {
    if (minutes <= 0) return minutes;

    // Random variation between -2 and +2 minutes.
    const variation = Math.floor(Math.random() * 5) - 2;

    return Math.max(0, minutes + variation);
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );
}

// ==============================
// RANDOM CIRCUMSTANCE SELECTION
// ==============================

function chooseCircumstance() {
    const saved = localStorage.getItem("experienceExchangeExplored");

    if (saved) {
        try {
            exploredCircumstances = JSON.parse(saved);
            if (!Array.isArray(exploredCircumstances)) {
                exploredCircumstances = [];
            }
        } catch (error) {
            exploredCircumstances = [];
        }
    } else {
        exploredCircumstances = [];
    }

    // Find circumstances the user has not explored yet.
    const unexplored = circumstances.filter(
        item => !exploredCircumstances.includes(item.id)
    );

    if (unexplored.length > 0) {
        const index = Math.floor(Math.random() * unexplored.length);
        circumstance = unexplored[index];
    } else {
        // If all circumstances have been explored, choose randomly again.
        const index = Math.floor(Math.random() * circumstances.length);
        circumstance = circumstances[index];
    }
}

// ==============================
// START
// ==============================

function startJourney() {
    const panel = document.getElementById("journey-panel-content");
    if (!panel) return;

    panel.innerHTML = `
        <p class="eyebrow">YOUR JOURNEY — BEFORE YOU BEGIN</p>

        <h2>One destination. Different circumstances.</h2>

        <p>
            You need to reach your destination. Your journey starts
            at 08:30, and you have €5 available.
        </p>

        <p>
            Along the way, you'll make decisions about your route.
            Some may cost time or money; others may involve uncertainty
            or finding an alternative.
        </p>

        <h3>Choose the circumstance you want to explore.</h3>

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
            <span>Let the site choose a circumstance for you.</span>
        </button>
    `;
}

function selectCircumstance(id) {
    circumstance = circumstances.find(item => item.id === id);

    if (!circumstance) return;

    showCircumstance();
}

function selectRandomCircumstance() {
    chooseCircumstance();
    showCircumstance();
}

function showCircumstance() {
    // Reset the journey for a fresh attempt.
    currentStep = 2;
    journeyTime = 0;
    budget = circumstance.id === "budget" ? 2 : 5;
    routeChoice = "";

    updateStatus();
    updateProgress();

    const panel = document.getElementById("journey-panel-content");
    if (!panel) return;

    panel.innerHTML = `
        <p class="eyebrow">02 — YOUR CIRCUMSTANCE</p>

        <h2>${circumstance.name}</h2>

        <p>${circumstance.description}</p>

        <p>
            This scenario focuses on one possible barrier.
            It cannot represent everyone's experiences, but it can
            help you consider how circumstances affect everyday choices.
        </p>

        <button class="choice-button" onclick="makeChoice(0, 0)">
            <strong>Continue your journey</strong>
            <span>See how your circumstances affect your options.</span>
        </button>

        <button class="choice-button" onclick="startJourney()">
            <strong>Choose a different circumstance</strong>
            <span>You can change your choice at any time before beginning.</span>
        </button>
    `;
}

// ==============================
// JOURNEY CHOICES
// ==============================

function makeChoice(timeAdded, moneyChange = 0) {
    journeyTime += varyTime(timeAdded);
    budget += moneyChange;

    updateStatus();

    // Stop here if the random police encounter occurs.
    if (checkPoliceEncounter()) return;

    currentStep++;

    updateProgress();
    showNextStage();
}

// ==============================
// UPDATE STATUS
// ==============================

function updateStatus() {
    const startMinutes = 8 * 60 + 30;
    const directTime = currentStep >= 3 ? directJourneyTime : 0;

    const totalMinutes = startMinutes + directTime + journeyTime;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const formattedTime =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0");

    const timeDisplay = document.getElementById("time-display");
    const budgetDisplay = document.getElementById("budget-display");

    if (timeDisplay) timeDisplay.textContent = formattedTime;
    if (budgetDisplay) budgetDisplay.textContent = "€" + budget.toFixed(2);
}

// ==============================
// SHOW NEXT STAGE
// ==============================

function showNextStage() {
    const panel = document.getElementById("journey-panel-content");
    if (!panel || !circumstance) return;

    // ==============================
    // STAGE 3 — PLAN
    // ==============================

    if (currentStep === 3) {
        if (circumstance.id === "budget") {
            panel.innerHTML = `
                <p class="eyebrow">03 — YOUR PLAN</p>
